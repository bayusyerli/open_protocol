#!/usr/bin/env python3
"""Verifikasi independen atas apa yang benar-benar ada di disk.

Laporan agen adalah klaim; berkas adalah bukti. Skrip ini tidak membaca satu pun
laporan agen — ia berjalan dari direktori dataset ke katalog, lalu balik lagi, dan
melaporkan setiap ketidakcocokan. Dipakai koordinator sebelum menulis laporan akhir.

    python3 datasets/metadata/periksa-koleksi.py [--penuh]

Tanpa --penuh: checksum dicuplik 3 berkas per dataset. Dengan --penuh: semuanya.
"""
import csv, hashlib, os, random, sys

AKAR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PENUH = "--penuh" in sys.argv
random.seed(20260825)

MEDAN_WAJIB = ["dataset_id", "Tanaman", "Lisensi", "Tanggal akses", "Status unduh",
               "Status verifikasi"]

def sha256(jalur):
    h = hashlib.sha256()
    with open(jalur, "rb") as f:
        for blok in iter(lambda: f.read(1 << 20), b""):
            h.update(blok)
    return h.hexdigest()

# --- kumpulkan direktori dataset dari disk ---
di_disk = {}
for pangkal in ("datasets/priority", "datasets/additional"):
    p = os.path.join(AKAR, pangkal)
    if not os.path.isdir(p):
        continue
    for akar, dirs, berkas in os.walk(p):
        if "README.md" in berkas and ("raw" in dirs or "SHA256SUMS.txt" in berkas):
            di_disk[os.path.relpath(akar, AKAR)] = berkas
            dirs[:] = [d for d in dirs if d != "raw"]

katalog = os.path.join(AKAR, "datasets/metadata/dataset-catalog.csv")
baris = list(csv.DictReader(open(katalog, encoding="utf-8"))) if os.path.exists(katalog) else []
path_katalog = {b["local_path"].rstrip("/"): b for b in baris if b["local_path"]}

masalah, diperiksa, tidak_cocok, hilang_berkas = [], 0, [], 0

for rel in sorted(di_disk):
    berkas = di_disk[rel]
    penuh_dir = os.path.join(AKAR, rel)

    if rel not in path_katalog:
        masalah.append(f"[yatim]     {rel} ada di disk tapi tidak punya baris katalog")

    if "SHA256SUMS.txt" not in berkas:
        masalah.append(f"[nochksum]  {rel} tanpa SHA256SUMS.txt")
    if "struktur.txt" not in berkas:
        masalah.append(f"[nostrukt]  {rel} tanpa struktur.txt")

    isi = open(os.path.join(penuh_dir, "README.md"), encoding="utf-8", errors="replace").read()
    kurang = [m for m in MEDAN_WAJIB if m.lower() not in isi.lower()]
    if kurang:
        masalah.append(f"[readme]    {rel} README kurang medan: {', '.join(kurang)}")

    sums = os.path.join(penuh_dir, "SHA256SUMS.txt")
    if os.path.exists(sums):
        entri = []
        for garis in open(sums, encoding="utf-8", errors="replace"):
            bag = garis.split(None, 1)
            if len(bag) == 2 and len(bag[0]) == 64:
                entri.append((bag[0].lower(), bag[1].strip().lstrip("*")))
        contoh = entri if PENUH else random.sample(entri, min(3, len(entri)))
        for diharap, nama in contoh:
            jalur = os.path.join(penuh_dir, nama)
            if not os.path.exists(jalur):
                jalur = os.path.join(penuh_dir, "raw", os.path.basename(nama))
            if not os.path.exists(jalur):
                hilang_berkas += 1
                masalah.append(f"[nofile]    {rel} → {nama} tercatat di SHA256SUMS tapi tidak ada")
                continue
            diperiksa += 1
            if sha256(jalur) != diharap:
                tidak_cocok.append(f"{rel} → {nama}")

for lp, b in sorted(path_katalog.items()):
    if b["download_status"] == "diunduh" and lp not in di_disk:
        masalah.append(f"[hantu]     {b['dataset_id']} berstatus diunduh, local_path {lp}"
                       f" bukan direktori dataset yang sah")

print(f"direktori dataset di disk : {len(di_disk)}")
print(f"baris katalog berstatus diunduh: {sum(1 for b in baris if b['download_status']=='diunduh')}")
print(f"checksum diuji ulang      : {diperiksa} ({'PENUH' if PENUH else 'cuplikan 3/dataset'})")
print(f"checksum TIDAK COCOK      : {len(tidak_cocok)}")
for t in tidak_cocok:
    print("   " + t)
print(f"masalah struktur/metadata : {len(masalah)}")
for m in masalah:
    print("   " + m)
