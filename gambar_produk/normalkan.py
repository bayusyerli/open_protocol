#!/usr/bin/env python3
"""Menormalkan gambar mentah jadi bentuk yang dinyatakan spec/schema/product-image.schema.json.

Satu-satunya jalan masuk ke folder ini. Agen pemanen menulis ke mentah/ dan menyebut
sumbernya; berkas apa pun yang belum lewat sini tidak boleh punya baris manifes berstatus
di atas "mentah".

    python3 normalkan.py mentah/ --manifes manifes.ndjson

Kenapa Pillow dan bukan alat Node seperti sisa spec/: repositori ini tidak memasang sharp,
dan Pillow sudah ada. Sisi data kerja (pukpes_data/) memang sudah memakai Python.
"""

import argparse
import hashlib
import io
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageCms, ImageFilter, ImageOps, ImageStat

# --- Profil normalisasi. Ini "image props" yang diseragamkan. ---------------------
SISI_TERPANJANG = {"besar": 1600, "sedang": 800, "kecil": 320, "kartu": 800}
MAKS_BYTES = {"besar": 400_000, "sedang": 150_000, "kecil": 40_000, "kartu": 150_000}
MUTU_AWAL = 82
MUTU_MINIMUM = 55
AMBANG_PUTIH = 244          # kanal minimum supaya piring tepi dihitung putih
AMBANG_RAGAM_LATAR = 120    # ragam piring tepi di bawah ini = latar rata


def dhash(img: Image.Image) -> str:
    """Cap perseptual 64 bit. Beda gradien mendatar antar piring bersebelahan."""
    kecil = img.convert("L").resize((9, 8), Image.Resampling.LANCZOS)
    p = list(kecil.getdata())
    bit = 0
    for baris in range(8):
        for kolom in range(8):
            kiri = p[baris * 9 + kolom]
            kanan = p[baris * 9 + kolom + 1]
            bit = (bit << 1) | (1 if kiri > kanan else 0)
    return f"dhash64:{bit:016x}"


def ke_srgb(img: Image.Image) -> Image.Image:
    """Memaksa sRGB. Profil ICC tertanam dipakai untuk konversi, lalu dibuang."""
    icc = img.info.get("icc_profile")
    if icc:
        try:
            asal = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            img = ImageCms.profileToProfile(
                img, asal, ImageCms.createProfile("sRGB"),
                outputMode="RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB",
            )
        except Exception:
            pass  # profil rusak: perlakukan isinya sebagai sRGB apa adanya
    if img.mode == "P":
        img = img.convert("RGBA" if "transparency" in img.info else "RGB")
    elif img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if "A" in img.mode else "RGB")
    return img


def piring_tepi(img: Image.Image):
    rgb = img.convert("RGB")
    l, t = rgb.size[0] - 1, rgb.size[1] - 1
    titik = []
    for i in range(0, l + 1, max(1, l // 16)):
        titik += [rgb.getpixel((i, 0)), rgb.getpixel((i, t))]
    for j in range(0, t + 1, max(1, t // 16)):
        titik += [rgb.getpixel((0, j)), rgb.getpixel((l, j))]
    return titik


def kelas_latar(img: Image.Image) -> str:
    if img.mode == "RGBA" and img.getchannel("A").getextrema()[0] < 250:
        return "transparan"
    titik = piring_tepi(img)
    if all(min(p) >= AMBANG_PUTIH for p in titik):
        return "putih"
    rerata = [sum(p[k] for p in titik) / len(titik) for k in range(3)]
    ragam = sum((p[k] - rerata[k]) ** 2 for p in titik for k in range(3)) / (len(titik) * 3)
    return "berlatar" if ragam < AMBANG_RAGAM_LATAR else "tidak_seragam"


def skor_blur(img: Image.Image) -> float:
    """Ragam tapis tepi. Makin kecil makin kabur. Bukan angka mutlak — pembanding."""
    return round(ImageStat.Stat(img.convert("L").filter(ImageFilter.FIND_EDGES)).var[0], 2)


def muat_ke_anggaran(img: Image.Image, anggaran: int) -> tuple[bytes, str]:
    """Menyandi ulang sampai muat anggaran byte. Mengembalikan (bita, format).

    WebP dipakai untuk SEMUANYA, termasuk yang beralfa — ia mendukung transparansi, dan
    itu membuat cabang PNG yang dulu ada di sini tidak perlu. Cabang itu punya cacat yang
    baru terlihat pada data sungguhan: PNG tidak punya tombol mutu, jadi anggarannya tidak
    pernah ditegakkan. Terukur pada 657 berkas — 452 PNG memakan 190,7 MB dengan 391 di
    antaranya melampaui anggaran, sementara 205 WebP memakan 8,3 MB dengan nol pelanggaran.
    Rata-rata PNG 432 KB berbanding WebP 41 KB.

    PNG hanya jadi cadangan bila WebP benar-benar gagal menyandi.
    """
    for mutu in range(MUTU_AWAL, MUTU_MINIMUM - 1, -6):
        buf = io.BytesIO()
        try:
            img.save(buf, "WEBP", quality=mutu, method=6)
        except Exception:                                         # noqa: BLE001
            buf = io.BytesIO()
            img.save(buf, "PNG", optimize=True)
            return buf.getvalue(), "png"
        if buf.tell() <= anggaran:
            return buf.getvalue(), "webp"
    return buf.getvalue(), "webp"  # sudah di mutu minimum; ukuran kalah dari keterbacaan


def rasterkan_pdf(src: Path, kerja: Path) -> Path:
    """Merasterkan halaman pertama PDF jadi PNG lewat sips.

    Karya seni label cetak sering diterbitkan sebagai PDF, dan itu bukti terbaik yang ada:
    nomor pendaftaran dan komposisi tercetak tajam, tanpa silau maupun lengkungan. Pillow
    tidak bisa membukanya, jadi lapisan tipis ini yang menjembatani.

    Bergantung `sips`, yang hanya ada di macOS. Di tempat lain berkas PDF akan ditolak
    dengan alasan yang jelas ketimbang gagal diam-diam.

    BATASNYA NYATA: sips merasterkan pada 72 dpi dan tidak bisa disuruh merender ulang
    lebih besar. `--resampleHeightWidthMax 2400` hanya MEMPERBESAR raster 72 dpi itu —
    diuji, dan ketajaman per piksel justru turun dari 1010 ke 339. Karena itu bendera itu
    sengaja tidak dipakai: memperbesar melanggar aturan yang sama dengan yang berlaku
    untuk gambar biasa.

    Akibatnya halaman A4 keluar 595x842, di bawah target rendition `besar`. Untuk membaca
    nomor pendaftaran dari karya seni label, **lapisan teks PDF-nya** jauh lebih tepat
    daripada raster ini — ia memberi angkanya persis, bukan hasil menebak piksel.
    """
    import shutil
    import subprocess

    if not shutil.which("sips"):
        raise RuntimeError("berkas PDF butuh sips untuk dirasterkan; sips tidak ada di sistem ini")
    kerja.mkdir(parents=True, exist_ok=True)
    keluar = kerja / (src.stem + ".png")
    r = subprocess.run(["sips", "-s", "format", "png", str(src), "--out", str(keluar)],
                       capture_output=True, text=True)
    if r.returncode != 0 or not keluar.exists():
        raise RuntimeError(f"sips gagal merasterkan {src.name}: {r.stderr.strip()[:120]}")
    return keluar

def rendition_terpakai(asal: Path, diminta: list[str]) -> list[str]:
    """Membuang rendition yang tidak bisa diisi sumbernya.

    Sumber 300x380 yang diminta besar/sedang/kecil menghasilkan dua berkas byte-identik:
    1600 dan 800 sama-sama lebih besar dari 380, dan aturan "tidak pernah diperbesar"
    membuat keduanya berhenti di 380. Dua salinan sama persis dengan dua nama berbeda
    adalah kebohongan kecil tentang apa yang dimiliki koleksi ini.

    Yang pertama selalu dibuat — itu berkas dasarnya. Sisanya hanya bila benar-benar
    memperkecil. 'kartu' selalu dibuat karena ia memadatkan ke 1:1, bukan memperkecil.
    """
    if asal.suffix.lower() == ".pdf":
        return diminta[:1] + [r for r in diminta[1:] if r == "kartu"]
    with Image.open(asal) as im:
        sisi_asal = max(ImageOps.exif_transpose(im).size)
    pakai = []
    for i, r in enumerate(diminta):
        if i == 0 or r == "kartu" or SISI_TERPANJANG[r] < sisi_asal:
            pakai.append(r)
    return pakai

def normalkan(asal: Path, keluar: Path, brand_key: str, peran: str, rendition: str) -> dict:
    if asal.suffix.lower() == ".pdf":
        asal = rasterkan_pdf(asal, keluar / "_raster")
    img = Image.open(asal)
    img = ImageOps.exif_transpose(img)   # orientasi dipanggang, lalu EXIF-nya hilang
    img = ke_srgb(img)

    latar = kelas_latar(img)
    kabur = skor_blur(img)

    sisi = SISI_TERPANJANG[rendition]
    if max(img.size) > sisi:             # tidak pernah diperbesar: memperbesar itu mengarang piksel
        img.thumbnail((sisi, sisi), Image.Resampling.LANCZOS)

    if rendition == "kartu":
        isi = (255, 255, 255, 0) if latar == "transparan" else (255, 255, 255, 255)
        kanvas = Image.new("RGBA", (sisi, sisi), isi)
        kanvas.paste(img, ((sisi - img.width) // 2, (sisi - img.height) // 2),
                     img if img.mode == "RGBA" else None)
        img = kanvas if latar == "transparan" else kanvas.convert("RGB")

    beralfa = img.mode == "RGBA"
    data, fmt = muat_ke_anggaran(img, MAKS_BYTES[rendition])

    nama = f"{brand_key}__{peran}__{rendition}.{fmt}"
    tujuan = keluar / nama
    tujuan.parent.mkdir(parents=True, exist_ok=True)
    tujuan.write_bytes(data)

    return {
        "path": str(tujuan.relative_to(Path(__file__).parent)),
        "rendition": rendition,
        "format": fmt,
        "width_px": img.width,
        "height_px": img.height,
        "bytes": len(data),
        "sha256": "sha256:" + hashlib.sha256(data).hexdigest(),
        "phash": dhash(img),
        "color_space": "sRGB",
        "has_alpha": beralfa,
        "background": latar,
        "exif_stripped": True,
        "_skor_blur": kabur,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("mentah", type=Path, help="folder berisi berkas mentah")
    ap.add_argument("--manifes", type=Path, default=Path("manifes.ndjson"))
    ap.add_argument("--keluar", type=Path, default=Path("ternormalkan"))
    ap.add_argument("--rendition", default="besar,sedang,kecil", help="dipisah koma")
    args = ap.parse_args()

    akar = Path(__file__).parent
    manifes = akar / args.manifes if not args.manifes.is_absolute() else args.manifes
    keluar = akar / args.keluar if not args.keluar.is_absolute() else args.keluar
    mentah = akar / args.mentah if not args.mentah.is_absolute() else args.mentah

    if not manifes.exists():
        print(f"Manifes {manifes} tidak ada. Agen pemanen menulisnya lebih dulu.", file=sys.stderr)
        return 1

    baris = [json.loads(l) for l in manifes.read_text(encoding="utf-8").splitlines() if l.strip()]
    rends = args.rendition.split(",")
    sekarang = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")

    jadi = gagal = lewat = 0
    for rec in baris:
        # _berkas_mentah adalah bidang serah-terima antara pemanen dan alat ini; skema
        # menolaknya. Dibuang dari SETIAP baris, bukan hanya yang diproses — baris yang
        # sudah ditolak pemanennya pun bisa membawanya, sebab berkasnya telanjur diunduh
        # sebelum gambarnya dilihat dan dinilai tidak layak.
        nama_mentah = rec.pop("_berkas_mentah", "")
        if rec.get("review", {}).get("status") != "mentah":
            lewat += 1
            continue
        asal = mentah / nama_mentah
        if not asal.exists():
            rec.setdefault("review", {}).update(
                {"status": "ditolak", "reason": f"berkas mentah hilang: {asal.name}", "at": sekarang})
            gagal += 1
            continue
        try:
            hasil = [normalkan(asal, keluar, rec["brand_key"], rec["role"], r)
                     for r in rendition_terpakai(asal, rends)]
        except Exception as e:                                    # noqa: BLE001
            rec.setdefault("review", {}).update(
                {"status": "ditolak", "reason": f"gagal dinormalkan: {e}", "at": sekarang})
            gagal += 1
            continue

        kabur = hasil[0].pop("_skor_blur")
        for h in hasil[1:]:
            h.pop("_skor_blur", None)
        rec["file"] = hasil[0]
        if len(hasil) > 1:
            rec["variants"] = hasil[1:]
        rec.setdefault("quality", {})["skor_blur"] = kabur
        rec["review"] = {"status": "ternormalisasi", "by": "normalkan.py", "at": sekarang}
        jadi += 1

    manifes.write_text(
        "".join(json.dumps(r, ensure_ascii=False) + "\n" for r in baris), encoding="utf-8")
    print(f"ternormalkan {jadi} · ditolak {gagal} · dilewati {lewat} · total {len(baris)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
