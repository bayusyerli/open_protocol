#!/usr/bin/env python3
"""Memanen gambar OPT yang sudah lolos dua gerbang, lalu menormalkannya ke app/gambar/opt/.

    python3 gambar_opt/panen.py                 # periksa saja, tidak mengunduh apa pun
    python3 gambar_opt/panen.py --tulis         # unduh, normalkan, tulis balik ke pest.json
    python3 gambar_opt/panen.py --tulis --hanya trips,virus-kuning

SATU-SATUNYA JALAN MASUK BERKAS BINER KE REPOSITORI INI. Yang menentukan apa yang boleh
turun bukan skrip ini melainkan datanya: `source.redistributable` pada spec/vocab/pest.json.
Skrip ini hanya menolak, tidak pernah mengizinkan.

KENAPA ASAL-USULNYA SUDAH TERCATAT SEBELUM UNDUHAN PERTAMA. Satu-satunya saat asal-usul
sebuah gambar masih diketahui pasti adalah saat pengambilannya. Berkas yang sudah turun
lebih dulu lalu dicarikan sumbernya belakangan akan selalu punya celah — dan celah itu
yang berubah jadi pelanggaran hak cipta enam bulan kemudian. Jadi urutannya dibalik:
48 baris di pest.json ditulis lengkap dengan lisensi dan kreditnya, dan skrip ini cuma
menjemput piksel untuk baris yang sudah ada.

EMPAT SARINGAN, DAN SEMUANYA HARUS LOLOS:

    source.redistributable    hak ciptanya mengizinkan
    source.url                ada berkas untuk dijemput
    prep.crop_from kosong     tidak perlu dipotong lebih dulu
    prep.from_pdf kosong      tidak tertanam di dalam PDF

Dua saringan terakhir bukan soal hukum melainkan soal kejujuran mesin. Memotong panel
adalah keputusan mata — panel mana yang dimaksud, dan panel mana yang JUSTRU menyesatkan
kalau ikut terbawa. Ada gambar berpanel di daftar ini yang memuat empat spesies Fusarium
berbeda dan hanya satu yang dimaksud. Skrip yang memotongnya sendiri akan salah tanpa
bersuara, dan gambar OPT yang salah label lebih buruk daripada tidak ada gambar.

EXIF SELALU DIBUANG. Foto OPT sering foto lapangan, dan EXIF foto lapangan membawa titik
GPS pemotretnya — data pribadi menurut UU 27/2022. Pillow tidak membawa EXIF saat menulis
WebP kecuali diminta, dan di sini memang tidak pernah diminta.

Pillow, bukan alat Node, dengan alasan yang sama seperti gambar_produk/normalkan.py:
repositori ini tidak memasang sharp, dan Pillow sudah ada.
"""

import argparse
import hashlib
import io
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageCms

AKAR = Path(__file__).resolve().parent.parent
VOCAB = AKAR / "spec" / "vocab" / "pest.json"
TUJUAN = AKAR / "app" / "gambar" / "opt"

SISI_TERPANJANG = 1200      # cukup untuk dilihat di layar, jauh di bawah cetak
MUTU_AWAL = 82
MUTU_MINIMUM = 58
MAKS_BYTES = 260_000

# Wikimedia menuntut User-Agent yang menyebut siapa peminta dan CARA MENGHUBUNGINYA,
# dan tuntutan itu ditegakkan mesin: UA yang cuma menyebut nama tanpa alamat dijawab
# 429 pada permintaan pertama, sekeras apa pun jedanya. Yang membuka pintu bukan
# menunggu lebih lama melainkan menyebut alamat yang bisa dihubungi.
UA = ("PranataniBot/0.1 (https://github.com/Bayusyerli/open_protocol; "
      "riset agronomi nirlaba) Python-urllib/3")

# Commons diminta lewat Special:FilePath, bukan lewat URL upload.wikimedia.org yang
# tercatat. Jalur `upload.wikimedia.org/.../a/ab/Nama.jpg` memuat dua digit hash MD5 atas
# NAMA BERKASNYA, jadi nama yang meleset satu huruf menghasilkan 404 — dan itu memang
# terjadi pada 12 dari 23 baris yang didata agen, karena namanya terpotong saat pencatatan.
# Special:FilePath menerima nama berkas apa adanya lalu mengalihkan ke berkas yang benar,
# sehingga halaman berkasnya — yang justru diperiksa manusia saat meninjau lisensi —
# menjadi satu-satunya sumber kebenaran, bukan jalur hash yang mudah salah salin.
def alamat_berkas(s: dict) -> str:
    pu = s.get("page_url", "")
    if "commons.wikimedia.org/wiki/File:" in pu:
        return "https://commons.wikimedia.org/wiki/Special:FilePath/" + pu.split("File:", 1)[1]
    return s["url"]


# Jeda minimum antar permintaan KE HOST YANG SAMA. Wikimedia menjawab 429 pada tarikan
# pertama yang tanpa jeda, dan balasannya sendiri yang memberi tahu sebabnya: "please
# contact noc@wikimedia.org to discuss a less disruptive rate". Mereka menyediakan
# gambarnya cuma-cuma; menariknya secepat yang dibolehkan mesin adalah membebani ongkos
# orang lain untuk menghemat detik sendiri. Jeda per host, bukan global, supaya tarikan
# dari host berbeda tidak saling menghukum.
JEDA_HOST = 1.5
_terakhir: dict[str, float] = {}


def _sabar(host: str) -> None:
    lalu = time.monotonic() - _terakhir.get(host, 0.0)
    if lalu < JEDA_HOST:
        time.sleep(JEDA_HOST - lalu)
    _terakhir[host] = time.monotonic()


def ambil(url: str, batas_byte: int = 25_000_000, percobaan: int = 4) -> bytes:
    host = urllib.parse.urlsplit(url).netloc
    permintaan = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "image/*"})
    for ke in range(percobaan):
        _sabar(host)
        try:
            with urllib.request.urlopen(permintaan, timeout=60) as balas:
                isi = balas.read(batas_byte + 1)
                # Alamat SESUDAH pengalihan — itu yang benar-benar menyajikan berkasnya.
                nyata = balas.geturl().split("?")[0]
            break
        except urllib.error.HTTPError as e:
            # 429 dan 5xx layak dicoba lagi; 404 dan 403 tidak akan berubah dengan menunggu.
            if e.code not in (429, 500, 502, 503, 504) or ke == percobaan - 1:
                raise
            # `Retry-After` dituruti kalau ada — server yang menyebut angkanya sendiri
            # tahu lebih baik daripada tebakan kita.
            minta = e.headers.get("Retry-After") if e.headers else None
            tunggu = float(minta) if (minta or "").strip().isdigit() else JEDA_HOST * (3 ** ke)
            time.sleep(min(tunggu, 60.0))
    if len(isi) > batas_byte:
        raise ValueError(f"berkas melebihi {batas_byte // 1_000_000} MB — periksa manual")
    return isi, nyata


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
        img = img.convert("RGB")
    return img


def normalkan(mentah: bytes) -> tuple[bytes, int, int]:
    img = Image.open(io.BytesIO(mentah))
    img.load()
    img = ke_srgb(img)

    # Tidak pernah MEMPERBESAR. Gambar sumber yang lebih kecil daripada batas dibiarkan
    # apa adanya; membesarkannya cuma menambah byte tanpa menambah satu pun keterangan.
    if max(img.size) > SISI_TERPANJANG:
        img.thumbnail((SISI_TERPANJANG, SISI_TERPANJANG), Image.Resampling.LANCZOS)

    mutu = MUTU_AWAL
    while True:
        wadah = io.BytesIO()
        # Tanpa `exif=` dan tanpa `icc_profile=`: keduanya memang tidak ikut ditulis.
        img.save(wadah, format="WEBP", quality=mutu, method=6)
        keluar = wadah.getvalue()
        if len(keluar) <= MAKS_BYTES or mutu <= MUTU_MINIMUM:
            return keluar, img.size[0], img.size[1]
        mutu -= 6


def layak(g: dict) -> tuple[bool, str]:
    s = g.get("source", {})
    # Yang berkasnya sudah ada dilewati, dan itu bukan sekadar penghematan. Tarikan yang
    # kena 429 di tengah jalan harus bisa diulang tanpa menghukum host untuk gambar yang
    # sudah berhasil turun — kalau tidak, percobaan kedua justru lebih berat daripada
    # yang pertama. `--ulangi` menyediakan jalan keluarnya kalau berkasnya perlu diperbarui.
    if g.get("file", {}).get("path") and (AKAR / "app" / g["file"]["path"]).exists():
        return False, "sudah ada"
    if not s.get("redistributable"):
        return False, f"lisensi {s.get('license', '?')} tidak mengizinkan"
    if not s.get("url"):
        return False, "tidak ada URL berkas"
    prep = g.get("prep", {})
    if prep.get("crop_from"):
        return False, f"perlu dipotong lebih dulu ({prep['crop_from']})"
    if prep.get("from_pdf"):
        return False, "tertanam di dalam PDF"
    return True, ""


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--tulis", action="store_true", help="benar-benar mengunduh dan menulis")
    p.add_argument("--hanya", default="", help="batasi ke kunci OPT tertentu, dipisah koma")
    arg = p.parse_args()

    vocab = json.loads(VOCAB.read_text(encoding="utf-8"))
    saring = {k.strip() for k in arg.hanya.split(",") if k.strip()}

    antre, tolak = [], []
    for item in vocab["items"]:
        if saring and item["key"] not in saring:
            continue
        for g in item.get("images", []):
            bisa, sebab = layak(g)
            (antre if bisa else tolak).append((item, g, sebab))

    print(f"Antre  : {len(antre)} gambar siap dijemput")
    print(f"Ditahan: {len(tolak)} gambar")
    if not arg.tulis:
        for _, g, sebab in tolak:
            print(f"  ditahan  {g['key']:<34} {sebab}")
        for item, g, _ in antre:
            print(f"  siap     {g['key']:<34} {g['source']['url'][:78]}")
        print("\nPeriksa saja — jalankan dengan --tulis untuk benar-benar mengunduh.")
        return 0

    TUJUAN.mkdir(parents=True, exist_ok=True)
    berhasil, gagal = 0, []
    for item, g, _ in antre:
        nama = f"{g['key']}.webp"
        try:
            mentah, nyata = ambil(alamat_berkas(g["source"]))
            keluar, lebar, tinggi = normalkan(mentah)
        except (urllib.error.URLError, urllib.error.HTTPError, OSError, ValueError) as e:
            gagal.append((g["key"], str(e)[:90]))
            continue
        (TUJUAN / nama).write_bytes(keluar)
        # Ditulis balik ke pest.json, bukan ke manifes terpisah: rekaman gambarnya sudah
        # ada di sana, dan sifat berkas adalah sifat rekaman yang sama.
        if nyata and nyata != g["source"].get("url"):
            g["source"]["url"] = nyata
        g["file"] = {
            "path": f"gambar/opt/{nama}",
            "width_px": lebar,
            "height_px": tinggi,
            "bytes": len(keluar),
            "sha256": "sha256:" + hashlib.sha256(keluar).hexdigest(),
            "exif_stripped": True,
        }
        berhasil += 1
        print(f"  turun    {g['key']:<34} {lebar}×{tinggi} · {len(keluar) // 1024} KB")

    if berhasil:
        vocab["collection"]["lifecycle"]["updated_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        VOCAB.write_text(json.dumps(vocab, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"\nTurun  : {berhasil} · Gagal: {len(gagal)}")
    for k, e in gagal:
        print(f"  gagal    {k:<34} {e}")
    if berhasil:
        print("\nBangun ulang indeksnya supaya gambarnya sampai ke layar:")
        print("  node spec/tools/bangun-indeks.mjs --tulis")
    return 1 if gagal else 0


if __name__ == "__main__":
    sys.exit(main())
