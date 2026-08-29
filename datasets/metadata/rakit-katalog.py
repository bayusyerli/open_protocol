#!/usr/bin/env python3
"""Rakit datasets/metadata/rows/*.csv jadi satu katalog + periksa konsistensinya.

Tiap agen menulis barisnya sendiri tanpa header supaya empat proses paralel tidak
saling menimpa satu berkas. Skrip ini menyatukannya, memasang header, mengurutkan,
lalu melaporkan duplikat checksum, duplikat URL/DOI, dan local_path yang bohong.

    python3 datasets/metadata/rakit-katalog.py
"""
import csv, os, sys
from collections import Counter, defaultdict
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import normalkan

AKAR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ROWS = os.path.join(AKAR, "datasets/metadata/rows")
KELUAR = os.path.join(AKAR, "datasets/metadata/dataset-catalog.csv")

KOLOM = ["dataset_id","title","crop","diseases","data_type","format","record_count",
         "source","source_url","license","publication_year","access_date","local_path",
         "file_size","sha256","download_status","verification_status","notes"]

baris, keluhan = [], []

for nama in sorted(os.listdir(ROWS)) if os.path.isdir(ROWS) else []:
    if not nama.endswith(".csv"):
        continue
    jalur = os.path.join(ROWS, nama)
    with open(jalur, newline="", encoding="utf-8") as f:
        for n, r in enumerate(csv.reader(f), 1):
            if not r or not any(s.strip() for s in r):
                continue
            if r[0].strip() == "dataset_id":       # header nyasar dari agen
                continue
            if len(r) != len(KOLOM):
                keluhan.append(f"{nama}:{n} — {len(r)} kolom, seharusnya {len(KOLOM)}"
                               f" (dataset_id={r[0] if r else '?'})")
                r = (r + [""] * len(KOLOM))[:len(KOLOM)]
            baris.append(dict(zip(KOLOM, [s.strip() for s in r])))

baris.sort(key=lambda b: b["dataset_id"])

# --- kosakata terkendali: aslinya dipindah ke *_detail, kanoniknya menggantikan ---
for b in baris:
    b["crop_detail"] = b["crop"]
    b["crop"] = normalkan.crop(b["crop_detail"], b["local_path"])
    b["data_type_detail"] = b["data_type"]
    b["data_type"] = normalkan.data_type(b["data_type_detail"])
    b["license_family"] = normalkan.license_family(b["license"])
    byte, tampil = normalkan.ukuran(b["file_size"])
    b["file_size_bytes"] = str(byte) if byte is not None else ""
    b["file_size"] = tampil or b["file_size"]

KELUAR_KOLOM = ["dataset_id","title","crop","crop_detail","diseases","data_type",
                "data_type_detail","format","record_count","source","source_url","license",
                "license_family","publication_year","access_date","local_path","file_size",
                "file_size_bytes","sha256","download_status","verification_status","notes"]

# --- periksa ---
ids = Counter(b["dataset_id"] for b in baris)
for i, n in ids.items():
    if n > 1:
        keluhan.append(f"dataset_id ganda: {i} muncul {n}×")

per_sha = defaultdict(list)
for b in baris:
    s = b["sha256"].lower()
    if len(s) == 64 and all(c in "0123456789abcdef" for c in s):
        per_sha[s].append(b["dataset_id"])
dup_sha = {s: v for s, v in per_sha.items() if len(v) > 1}

per_url = defaultdict(list)
for b in baris:
    u = b["source_url"].rstrip("/").lower().replace("https://", "").replace("http://", "")
    if u:
        per_url[u].append(b["dataset_id"])
dup_url = {u: v for u, v in per_url.items() if len(v) > 1}

hilang, ada_bytes = [], 0
for b in baris:
    lp = b["local_path"]
    if b["download_status"] != "diunduh":
        continue
    if not lp:
        keluhan.append(f"{b['dataset_id']} — status diunduh tapi local_path kosong")
        continue
    penuh = os.path.join(AKAR, lp)
    if not os.path.exists(penuh):
        hilang.append(f"{b['dataset_id']} — local_path tidak ada di disk: {lp}")
    else:
        if os.path.isdir(penuh):
            for d, _, fs in os.walk(penuh):
                for fn in fs:
                    ada_bytes += os.path.getsize(os.path.join(d, fn))
        else:
            ada_bytes += os.path.getsize(penuh)

with open(KELUAR, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=KELUAR_KOLOM)
    w.writeheader()
    w.writerows(baris)

def cacah(k):
    return ", ".join(f"{v} {n}" for v, n in Counter(b[k] for b in baris).most_common())

print(f"katalog  : {KELUAR} — {len(baris)} baris dari {len(os.listdir(ROWS))} berkas agen")
print(f"crop     : {cacah('crop')}")
per_tanaman = Counter()
for b in baris:
    for t in b["crop"].split("|"):
        per_tanaman[t] += 1
print("  per tag: " + ", ".join(f"{t} {n}" for t, n in per_tanaman.most_common()))
diunduh_per_tanaman = Counter()
for b in baris:
    if b["download_status"] == "diunduh":
        for t in b["crop"].split("|"):
            diunduh_per_tanaman[t] += 1
print("  diunduh: " + ", ".join(f"{t} {n}" for t, n in diunduh_per_tanaman.most_common()))
print(f"unduh    : {cacah('download_status')}")
print(f"verif    : {cacah('verification_status')}")
print(f"data_type: {cacah('data_type')}")
print(f"lisensi  : {cacah('license_family')}")
tercatat = sum(int(b["file_size_bytes"]) for b in baris
               if b["download_status"] == "diunduh" and b["file_size_bytes"])
print(f"di disk  : {ada_bytes/1e9:.2f} GB terukur dari local_path"
      f"  ·  {tercatat/1e9:.2f} GB menurut kolom file_size")
print(f"\nduplikat checksum : {len(dup_sha)}")
for s, v in dup_sha.items():
    print(f"  {s[:16]}… → {', '.join(v)}")
print(f"duplikat source_url: {len(dup_url)}")
for u, v in dup_url.items():
    print(f"  {u[:70]} → {', '.join(v)}")
print(f"\nlocal_path hilang : {len(hilang)}")
for h in hilang:
    print("  " + h)
print(f"keluhan format    : {len(keluhan)}")
for k in keluhan:
    print("  " + k)

# --- lapis kedua: duplikat pada tingkat berkas, dari SHA256SUMS.txt tiap dataset ---
# Kolom sha256 di katalog sering berisi "lihat-SHA256SUMS" untuk dataset banyak berkas,
# jadi duplikat sungguhan hanya kelihatan kalau daftar checksumnya sendiri dibandingkan.
per_berkas = defaultdict(list)
for pangkal in ("datasets/priority", "datasets/additional"):
    for d, _, fs in os.walk(os.path.join(AKAR, pangkal)):
        if "SHA256SUMS.txt" not in fs:
            continue
        rel = os.path.relpath(d, AKAR)
        with open(os.path.join(d, "SHA256SUMS.txt"), encoding="utf-8", errors="replace") as f:
            for garis in f:
                bagian = garis.split()
                if len(bagian) >= 2 and len(bagian[0]) == 64:
                    per_berkas[bagian[0].lower()].append((rel, bagian[-1].lstrip("*")))
dup_berkas = {s: v for s, v in per_berkas.items() if len({d for d, _ in v}) > 1}
print(f"\nduplikat berkas lintas dataset: {len(dup_berkas)}"
      f" (dari {len(per_berkas)} berkas berchecksum)")
pasangan = Counter()
for s, v in dup_berkas.items():
    for i, (d1, _) in enumerate(sorted(set(d for d, _ in v))):
        for d2 in sorted(set(d for d, _ in v))[i + 1:]:
            pasangan[(d1.split("/")[-1], d2.split("/")[-1])] += 1
for (d1, d2), n in pasangan.most_common(20):
    print(f"  {n:6} berkas identik: {d1}  ==  {d2}")
