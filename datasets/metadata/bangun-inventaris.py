#!/usr/bin/env python3
"""Bangun datasets/reports/dataset-inventory.md dari katalog + hasil sapuan duplikasi.

Inventaris dibuat ulang dari data, bukan ditulis tangan, supaya tidak pernah
melenceng dari isi katalog. Analisis dan penilaian ditulis terpisah di
datasets/reports/laporan-akhir.md — berkas ini murni cerminan katalog.

    python3 datasets/metadata/bangun-inventaris.py
"""
import csv, os
from collections import Counter, defaultdict

AKAR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KAT = os.path.join(AKAR, "datasets/metadata/dataset-catalog.csv")
TT = os.path.join(AKAR, "datasets/metadata/tumpang-tindih.tsv")
KELUAR = os.path.join(AKAR, "datasets/reports/dataset-inventory.md")

PRIORITAS = ["cabai", "tomat", "kentang", "bawang-merah"]
LABEL = {"cabai": "Cabai", "tomat": "Tomat", "kentang": "Kentang",
         "bawang-merah": "Bawang merah"}

baris = list(csv.DictReader(open(KAT, encoding="utf-8")))


def potong(t, n):
    t = (t or "").replace("|", "\\|").replace("\n", " ").strip()
    return t if len(t) <= n else t[: n - 1] + "…"


def tag(b):
    return set(b["crop"].split("|"))


def prioritas(b):
    return bool(tag(b) & set(PRIORITAS))


def tabel(rows, kolom, ambil):
    if not rows:
        return "_Tidak ada._\n"
    out = ["| " + " | ".join(kolom) + " |",
           "|" + "|".join("---" for _ in kolom) + "|"]
    for b in rows:
        out.append("| " + " | ".join(ambil(b)) + " |")
    return "\n".join(out) + "\n"


L = []
W = L.append

W("# Inventaris dataset penyakit tanaman hortikultura\n")
W("> Dibangun ulang dengan `python3 datasets/metadata/bangun-inventaris.py`. "
  "Jangan disunting tangan — isinya cerminan `datasets/metadata/dataset-catalog.csv`. "
  "Analisis dan penilaian ada di [laporan-akhir.md](laporan-akhir.md).\n")
W(f"Tanggal akses seluruh panen: **2026-08-25**. Total kandidat tercatat: **{len(baris)}**.\n")

# --- ringkasan ---
st = Counter(b["download_status"] for b in baris)
vf = Counter(b["verification_status"] for b in baris)
diunduh = [b for b in baris if b["download_status"] == "diunduh"]
W("## Ringkasan angka\n")
W("| status unduh | jml | | status verifikasi | jml |")
W("|---|---:|---|---|---:|")
kunci_st = ["diunduh", "ditemukan", "terhalang-akun", "terlalu-besar", "gagal", "ditolak"]
kunci_vf = ["terverifikasi", "sebagian", "belum", "tidak-berlaku"]
for i in range(max(len(kunci_st), len(kunci_vf))):
    a = f"`{kunci_st[i]}` | {st.get(kunci_st[i], 0)}" if i < len(kunci_st) else " | "
    c = f"`{kunci_vf[i]}` | {vf.get(kunci_vf[i], 0)}" if i < len(kunci_vf) else " | "
    W(f"| {a} | | {c} |")
W("")

W("### Cakupan per tanaman prioritas\n")
W("| tanaman | tercatat | diunduh | terverifikasi | sebagian |")
W("|---|---:|---:|---:|---:|")
for t in PRIORITAS:
    p = [b for b in baris if t in tag(b)]
    d = [b for b in p if b["download_status"] == "diunduh"]
    W(f"| {LABEL[t]} | {len(p)} | {len(d)} | "
      f"{sum(1 for b in d if b['verification_status'] == 'terverifikasi')} | "
      f"{sum(1 for b in d if b['verification_status'] == 'sebagian')} |")
W("")

# --- 1. prioritas diunduh ---
W("## 1. Dataset prioritas yang berhasil diunduh\n")
for t in PRIORITAS:
    rows = sorted([b for b in diunduh if t in tag(b)], key=lambda b: b["dataset_id"])
    W(f"### {LABEL[t]} — {len(rows)} dataset\n")
    W(tabel(rows,
            ["dataset_id", "jenis", "judul", "penyakit/kelas", "jumlah", "lisensi",
             "ukuran", "verifikasi"],
            lambda b: [f"`{b['dataset_id']}`", b["data_type"], potong(b["title"], 42),
                       potong(b["diseases"], 58), potong(b["record_count"], 32),
                       potong(b["license"], 20),
                       potong(b["file_size"], 12), b["verification_status"]]))

# --- 2. prioritas belum bisa diunduh ---
W("## 2. Dataset prioritas yang ditemukan tetapi belum dapat diunduh\n")
belum = sorted([b for b in baris if prioritas(b)
                and b["download_status"] in ("ditemukan", "terhalang-akun",
                                             "terlalu-besar", "gagal")],
               key=lambda b: (b["download_status"], b["dataset_id"]))
W(tabel(belum, ["dataset_id", "judul", "tanaman", "kendala", "ukuran", "sumber", "URL"],
        lambda b: [f"`{b['dataset_id']}`", potong(b["title"], 42), b["crop"],
                   f"`{b['download_status']}`", potong(b["file_size"], 14),
                   potong(b["source"], 22),
                   f"[tautan]({b['source_url']})" if b["source_url"] else "—"]))

# --- 3. tambahan ---
W("## 3. Dataset tambahan di luar empat tanaman prioritas\n")
W("Dataset yang **tidak** menyentuh satu pun tanaman prioritas. Dataset multi-tanaman "
  "yang memuat tanaman prioritas sudah tercantum di bagian 1.\n")
tambahan = sorted([b for b in baris if not prioritas(b)], key=lambda b: b["dataset_id"])
W(tabel(tambahan, ["dataset_id", "judul", "cakupan", "jenis", "status", "lisensi"],
        lambda b: [f"`{b['dataset_id']}`", potong(b["title"], 44),
                   potong(b["crop_detail"], 40), b["data_type"],
                   f"`{b['download_status']}`", potong(b["license"], 22)]))

# --- 4. ditolak ---
W("## 4. Dataset yang ditolak beserta alasannya\n")
ditolak = sorted([b for b in baris if b["download_status"] == "ditolak"],
                 key=lambda b: b["dataset_id"])
W(tabel(ditolak, ["dataset_id", "judul", "alasan penolakan"],
        lambda b: [f"`{b['dataset_id']}`", potong(b["title"], 40), potong(b["notes"], 210)]))

# --- 5. duplikasi ---
W("## 5. Duplikasi yang ditemukan\n")
W("### 5.1 Sumber sama diklaim dua agen\n")
per_url = defaultdict(list)
for b in baris:
    u = b["source_url"].rstrip("/").lower()
    if u:
        per_url[u].append(b)
dupu = {u: v for u, v in per_url.items() if len(v) > 1}
if dupu:
    W("| sumber | baris | penyelesaian |")
    W("|---|---|---|")
    for u, v in sorted(dupu.items()):
        ids = ", ".join(f"`{x['dataset_id']}`" for x in v)
        unduh = [x for x in v if x["download_status"] == "diunduh"]
        pes = (f"diunduh sekali sebagai `{unduh[0]['dataset_id']}`; sisanya menunjuk ke sana"
               if unduh else "tidak ada yang diunduh")
        W(f"| {potong(u, 56)} | {ids} | {pes} |")
    W("")
else:
    W("_Tidak ada._\n")

W("### 5.2 Isi identik di dalam arsip berbeda\n")
W("Diuji dengan `datasets/metadata/periksa-tumpang-tindih.py`: sidik (CRC32, ukuran) "
  "setiap berkas di dalam ZIP dan setiap berkas lepas, dibandingkan antar dataset. "
  "**Ini batas bawah** — salinan yang diperkecil atau dikode ulang punya CRC berbeda "
  "dan tidak tertangkap di sini.\n")
if os.path.exists(TT):
    tt = list(csv.DictReader(open(TT, encoding="utf-8"), delimiter="\t"))
    if tt:
        W("| berkas identik | dataset A | % isi A | dataset B | % isi B |")
        W("|---:|---|---:|---|---:|")
        for r in tt:
            W(f"| {r['berkas_identik']} | `{r['dataset_a']}` | {r['persen_a']}% | "
              f"`{r['dataset_b']}` | {r['persen_b']}% |")
        W("")
    else:
        W("_Tidak ada pasangan di atas ambang._\n")
else:
    W("_Sapuan belum dijalankan._\n")

# --- 6. lampiran ---
W("## 6. Lampiran — rincian tiap dataset yang ada di disk\n")
for b in sorted(diunduh, key=lambda b: b["dataset_id"]):
    W(f"### `{b['dataset_id']}` — {b['title']}\n")
    W(f"- **Tanaman**: {b['crop']} — {b['crop_detail']}")
    W(f"- **Penyakit/kelas**: {b['diseases']}")
    W(f"- **Jenis / format**: {b['data_type']} ({b['data_type_detail']}) · {b['format']}")
    W(f"- **Jumlah**: {b['record_count']} · **Ukuran**: {b['file_size']}")
    W(f"- **Sumber**: {b['source']} ({b['publication_year']}) — <{b['source_url']}>")
    W(f"- **Lisensi**: {b['license']} (`{b['license_family']}`)")
    W(f"- **Lokal**: `{b['local_path']}` · **SHA-256**: `{potong(b['sha256'], 70)}`")
    W(f"- **Status**: unduh `{b['download_status']}` · verifikasi "
      f"`{b['verification_status']}`")
    W(f"- **Catatan**: {b['notes']}\n")

open(KELUAR, "w", encoding="utf-8").write("\n".join(L) + "\n")
print(f"ditulis: {os.path.relpath(KELUAR, AKAR)} — {len(L)} baris, "
      f"{os.path.getsize(KELUAR)/1024:.0f} KB")
print(f"  bagian 1: {len(diunduh)} diunduh · bagian 2: {len(belum)} belum · "
      f"bagian 3: {len(tambahan)} tambahan · bagian 4: {len(ditolak)} ditolak")
