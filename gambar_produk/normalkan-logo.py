#!/usr/bin/env python3
"""Menormalkan logo BADAN — bukan gambar produk, dan karena itu bukan normalkan.py.

    python3 normalkan-logo.py --mentah <folder> --pilihan <pilihan.json>

KENAPA ALAT SENDIRI, DAN BUKAN SATU MEDAN TAMBAHAN DI normalkan.py
`product-image.schema.json` mewajibkan `brand_key` dan `brand.name` — nama dagang persis
seperti tertulis di registri. Logo badan tidak punya itu: PT Petrokimia Gresik adalah
PEMEGANG pendaftaran, dan merek-mereknya PHONSKA, PETROGANIK, dan seterusnya. Memaksa logo
badan masuk ke sana berarti menuliskan nama perusahaan di medan yang skemanya sendiri
sebut nama dagang, dan sesudah itu tidak ada cara membedakan keduanya lagi.

DUA HAL YANG BERBEDA DARI GAMBAR KEMASAN
  1. Alfa dipertahankan. Logo dipasang di atas kartu yang warnanya ikut tema; meratakannya
     ke putih membuat kotak putih menempel di tema gelap.
  2. Tidak ada rendition `besar`. Logo dipakai paling besar setinggi 40 px pada kartu
     profil; 1600 px hanya menambah bita yang tidak pernah tergambar.
"""
import argparse, hashlib, io, json, re, subprocess, sys
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image

AKAR = Path(__file__).resolve().parent
SISI = {"sedang": 400, "kecil": 160}
MAKS = {"sedang": 60_000, "kecil": 16_000}

def jenis(b: bytes) -> str:
    if b[:8] == b"\x89PNG\r\n\x1a\n": return "png"
    if b[:3] == b"\xff\xd8\xff": return "jpeg"
    if b[:4] == b"RIFF" and b[8:12] == b"WEBP": return "webp"
    if b[:6] in (b"GIF87a", b"GIF89a"): return "gif"
    if b"<svg" in b[:600].lower(): return "svg"
    return "?"

def rasterkan_svg(src: Path, kerja: Path) -> Path:
    """qlmanage satu-satunya perender SVG yang ada di lingkungan ini."""
    kerja.mkdir(parents=True, exist_ok=True)
    subprocess.run(["qlmanage", "-t", "-s", "800", "-o", str(kerja), str(src)],
                   capture_output=True, timeout=120)
    keluar = kerja / (src.name + ".png")
    if not keluar.exists(): raise ValueError("SVG gagal dirasterkan qlmanage")
    return keluar

def muat(img: Image.Image, anggaran: int) -> bytes:
    for mutu in (90, 82, 74, 66, 58):
        buf = io.BytesIO()
        img.save(buf, "WEBP", quality=mutu, method=6)
        if buf.tell() <= anggaran: return buf.getvalue()
    return buf.getvalue()

def potong_alfa(img: Image.Image) -> Image.Image:
    """Banyak logo diterbitkan dengan bantalan transparan lebar; ia mengecilkan tandanya
    di kotak berukuran tetap. Yang dipotong hanya yang benar-benar transparan penuh."""
    if img.mode != "RGBA": return img
    kotak = img.split()[3].getbbox()
    return img.crop(kotak) if kotak else img

def normalkan(asal: Path, keluar: Path, key: str, rend: str, kerja: Path) -> dict:
    b = asal.read_bytes()
    if jenis(b) == "svg":
        asal = rasterkan_svg(asal, kerja)
    img = Image.open(asal)
    img = img.convert("RGBA")
    img = potong_alfa(img)
    sisi = SISI[rend]
    if max(img.size) > sisi:
        img.thumbnail((sisi, sisi), Image.Resampling.LANCZOS)
    bita = muat(img, MAKS[rend])
    keluar.mkdir(parents=True, exist_ok=True)
    nama = f"{key}__logo__{rend}.webp"
    (keluar / nama).write_bytes(bita)
    alfa = img.getchannel("A")
    return {"path": f"ternormalkan/{nama}", "rendition": rend, "format": "webp",
            "width_px": img.width, "height_px": img.height, "bytes": len(bita),
            "sha256": "sha256:" + hashlib.sha256(bita).hexdigest(),
            "has_alpha": alfa.getextrema()[0] < 255, "exif_stripped": True}

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--mentah", type=Path, required=True)
    ap.add_argument("--pilihan", type=Path, required=True)
    ap.add_argument("--keluar", type=Path, default=AKAR / "ternormalkan")
    ap.add_argument("--manifes", type=Path, default=AKAR / "logo-principal.ndjson")
    a = ap.parse_args()
    pilihan = json.loads(a.pilihan.read_text())
    kerja = AKAR / "mentah" / "_svg"
    sekarang = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    baris, gagal = [], []
    for p in pilihan["pilih"]:
        asal = a.mentah / p["berkas"]
        try:
            hasil = [normalkan(asal, a.keluar, p["key"], r, kerja) for r in ("sedang", "kecil")]
        except Exception as e:                                    # noqa: BLE001
            gagal.append((p["key"], str(e)[:80])); continue
        baris.append({
            "principal_key": p["key"],
            "principal": {"name": p["nama"], "website": p["web"]},
            "role": "logo",
            "source": {"url": p["url"], "page_url": p["halaman"],
                       "publisher": p["nama"], "retrieved_at": sekarang,
                       "rights": "pemegang_merek", "permission": "belum_diminta",
                       "redistributable": False},
            "attribution": {
                "basis": "situs-resmi-menurut-profile.website",
                "evidence_tier": "D",
                "tier_reason": ("Sambungan badan->situs datang dari profile.website, laporan "
                                "agen riset web yang belum diverifikasi ke sumber aslinya. Yang "
                                "diperiksa di sini hanya bahwa halaman itu menyebut nama "
                                "registrinya sendiri."),
                "nama_registri_cocok": f"{p['cocokNama']}/{p['dariKata']} kata pembeda",
                "ronde_pilih": p["ronde"]},
            "review": {"status": "ternormalisasi", "by": "normalkan-logo.py", "at": sekarang},
            "notes": {"id": p["catatan"] or (
                "Logo badan sebagaimana dipasang di kepala situsnya sendiri. Dipilih dari calon "
                "yang diperingkat, lalu DILIHAT satu per satu — peringkat otomatis memilih ikon "
                "antarmuka, logo induk, dan foto rombongan pada belasan situs.")},
            "file": hasil[0], "variants": hasil[1:]})
    a.manifes.write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in baris),
                         encoding="utf-8")
    print(f"ternormalkan {len(baris)} · gagal {len(gagal)}")
    for k, e in gagal: print(f"  GAGAL {k}: {e}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
