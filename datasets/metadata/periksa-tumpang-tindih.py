#!/usr/bin/env python3
"""Lapis ketiga anti-duplikasi: isi DI DALAM arsip, bukan arsipnya.

Dua lapis sebelumnya buta pada kasus terpenting. Checksum kolom katalog hanya
menyidik arsip luar; SHA256SUMS hanya menyidik berkas yang didaftar agen. Kalau
sebuah dataset mengemas ulang dataset lain ke dalam ZIP-nya dengan nama berkas
diganti, kedua lapis itu melaporkan "tidak ada duplikat".

Sidik jari di sini (CRC32, ukuran) dibaca dari direktori pusat ZIP — tanpa
dekompresi, tanpa menulis ke disk. Cocoknya CRC32 sekaligus ukuran byte untuk
ribuan berkas praktis mustahil terjadi secara kebetulan.

    python3 datasets/metadata/periksa-tumpang-tindih.py [ambang_persen]
"""
import os, sys, zipfile, zlib
from collections import defaultdict

# Berkas lepas ikut disidik dengan CRC32 supaya sebanding dengan isi ZIP. Hanya
# berkas media/data; arsip lain (RAR, 7z, tar) dilewati karena membandingkan
# arsipnya secara utuh sudah ditangani lapis checksum pertama dan kedua.
EKSTENSI = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".bmp", ".webp", ".gif",
            ".csv", ".xlsx", ".xls", ".json", ".txt", ".xml", ".tsv"}

AKAR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AMBANG = float(sys.argv[1]) if len(sys.argv) > 1 else 5.0

arsip, lepas = [], []
for pangkal in ("datasets/priority", "datasets/additional"):
    for akar, _, berkas in os.walk(os.path.join(AKAR, pangkal)):
        for n in berkas:
            j = os.path.join(akar, n)
            if n.lower().endswith(".zip"):
                arsip.append(j)
            elif os.path.splitext(n)[1].lower() in EKSTENSI:
                lepas.append(j)

def dataset_dari(jalur):
    rel = os.path.relpath(jalur, AKAR).split(os.sep)
    return rel[2] if rel[1] == "additional" else rel[3]

sidik = defaultdict(set)      # dataset -> {(crc, ukuran)}
cacah = defaultdict(int)
rusak = []
for a in arsip:
    d = dataset_dari(a)
    try:
        with zipfile.ZipFile(a) as f:
            for i in f.infolist():
                if i.is_dir() or i.file_size == 0:
                    continue
                sidik[d].add((i.CRC, i.file_size))
                cacah[d] += 1
    except Exception as e:
        rusak.append(f"{os.path.relpath(a, AKAR)}: {type(e).__name__}")

for j in lepas:
    d = dataset_dari(j)
    try:
        uk = os.path.getsize(j)
        if uk == 0:
            continue
        c = 0
        with open(j, "rb") as f:
            for blok in iter(lambda: f.read(1 << 20), b""):
                c = zlib.crc32(blok, c)
        sidik[d].add((c, uk))
        cacah[d] += 1
    except OSError as e:
        rusak.append(f"{os.path.relpath(j, AKAR)}: {type(e).__name__}")

print(f"{len(arsip)} arsip ZIP + {len(lepas)} berkas lepas dari {len(sidik)} dataset, "
      f"{sum(cacah.values())} berkas tersidik")
if rusak:
    print(f"tidak terbaca: {len(rusak)}")
    for r in rusak:
        print("   " + r)

nama = sorted(sidik)
temuan = []
for i, a in enumerate(nama):
    for b in nama[i + 1:]:
        irisan = sidik[a] & sidik[b]
        if not irisan:
            continue
        pa = 100 * len(irisan) / len(sidik[a])
        pb = 100 * len(irisan) / len(sidik[b])
        if max(pa, pb) >= AMBANG:
            temuan.append((max(pa, pb), len(irisan), a, pa, b, pb))

print(f"\npasangan bertumpang tindih ≥{AMBANG:g}% : {len(temuan)}")
TSV = os.path.join(AKAR, "datasets/metadata/tumpang-tindih.tsv")
with open(TSV, "w", encoding="utf-8") as f:
    f.write("berkas_identik\tdataset_a\tpersen_a\tdataset_b\tpersen_b\n")
    for _, n, a, pa, b, pb in sorted(temuan, reverse=True):
        print(f"  {n:6} isi identik — {a} ({pa:.1f}% isinya) == {b} ({pb:.1f}% isinya)")
        f.write(f"{n}\t{a}\t{pa:.1f}\t{b}\t{pb:.1f}\n")
print(f"ditulis ke {os.path.relpath(TSV, AKAR)}")

# Byte-identity adalah BATAS BAWAH. Salinan yang diperkecil atau dikode ulang
# (mis. arsip bernama `*_1024px_*`) punya CRC berbeda dan tidak akan pernah muncul
# di sini walau isinya gambar yang sama. Jangan baca 0 temuan sebagai 0 duplikasi.
print("\ncatatan: uji ini hanya menangkap salinan bit-demi-bit; salinan yang"
      " diperkecil/dikode ulang lolos dan harus dicek dari nama berkas atau dokumentasi.")
