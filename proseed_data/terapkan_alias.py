#!/usr/bin/env python3
"""Menerapkan pemohon_alias.csv ke kolom turunannya.

    python3 proseed_data/terapkan_alias.py            # periksa saja, laporkan bedanya
    python3 proseed_data/terapkan_alias.py --tulis    # tulis perubahannya

Konvensi pasal 4 di spec/00-konvensi-kerja-paralel.md menjanjikan bahwa membalik sebuah
penggabungan cukup dengan menyunting berkas alias lalu membangkitkan ulang kolom kanoniknya.
Sampai berkas ini ada, janji itu tidak punya pelaksana.

Kolom `pemohon` di varietas_terdaftar.csv tidak pernah disentuh; yang ditulis ulang hanya
`pemohon_kanonik`. Di pemohon_varietas.csv, kolom agregat hanya dihitung ulang untuk baris yang
benar-benar terkena perubahan alias — kecuali dua kolom yang diperbaiki menyeluruh:

  `jenis_badan`   — hanya untuk MENAIKKAN baris yang tergolong "perorangan/lainnya" padahal
                    namanya jelas lembaga: BRIN, LIPI, BATAN, BB Padi, IPB, dan seterusnya.
                    Golongan yang sudah terisi tidak pernah diubah.
  `tahun_pertama` — "< 1945" kini dihitung sebagai lebih awal dari angka mana pun, bukan
                    dibuang. Satu pemohon terkena.

Yang TIDAK diperbaiki, dan sebabnya: `jumlah_varietas` sebenarnya mencacah BARIS, bukan varietas
unik — satu varietas yang memegang pelepasan sekaligus pendaftaran terhitung dua kali. PT East
West Seed Indonesia tertulis 428, varietas uniknya 292. Mengubahnya berarti mengubah arti angka
yang sudah terbit, jadi ia dicatat di README dan menunggu keputusan.
"""

import csv
import re
import sys
from collections import Counter
from pathlib import Path

# --- penggolongan badan pemohon -------------------------------------------------------------
# Hanya dipakai untuk MENAIKKAN baris yang tergolong "perorangan/lainnya" padahal namanya jelas
# lembaga. Golongan yang sudah terisi tidak pernah diubah — beberapa di antaranya pilihan sadar
# pembuat aslinya (Balai Penelitian ... digolongkan Pemerintah, bukan Lembaga riset).
#
# Akronim dicocokkan sebagai kata utuh. Tanpa itu "phiLIPIn" terbaca LIPI dan perusahaan Filipina
# ikut jadi lembaga riset.
AKRONIM = {
    "Lembaga riset": ["BRIN", "LIPI", "BATAN", "PATIR", "PAIR", "P3GI", "IOPRI", "PRTAIR"],
    "Perguruan tinggi": ["IPB", "UGM", "UNPAD", "UNSOED", "UNS", "UNDANA", "LPPM", "DRPMI",
                         "PKBT", "PPSHB"],
    "Pemerintah": ["BPTP", "BPSB", "BPSBTPH", "BRMP", "BB", "UPTD"],
}
FRASA = {
    "Perguruan tinggi": ["universitas", "institut pertanian", "fakultas", "faperta", "politeknik",
                         "sekolah tinggi", "sekolah vokasi"],
    "Lembaga riset": ["pusat penelitian", "puslit", "pusat riset", "badan penelitian",
                      "organisasi riset", "forestry institute", "pusat aplikasi isotop",
                      "pusat alikasi isotop", "pusat inovasi lipi", "badan riset dan inovasi"],
    "Pemerintah": ["pemerintah", "pemeritah", "dinas", "diperta", "direktorat", "kementerian",
                   "balai", "balit", "loka penelitian", "perhutani", "instansi pemerintah",
                   "provinsi", "kabupaten", "kota "],
}


def golongkan(nama: str):
    """Golongan menurut pihak yang disebut PERTAMA. Nama beranggota banyak — konsorsium,
    kerja sama balai dengan perusahaan — dinilai dari pemohon utamanya, dan aturan itu
    disebutkan supaya hasilnya bisa diperiksa, bukan ditebak ulang tiap kali."""
    s = nama.strip()
    # Posisi kemunculan paling awal dari tiap petunjuk; yang paling depan menang.
    calon = []
    for golongan, akronims in AKRONIM.items():
        for a in akronims:
            m = re.search(rf"\b{re.escape(a)}\b", s, re.IGNORECASE)
            if m:
                calon.append((m.start(), golongan))
    for golongan, frasas in FRASA.items():
        for f in frasas:
            i = s.lower().find(f)
            if i >= 0:
                calon.append((i, golongan))
    if not calon:
        return None
    return min(calon)[1]


def tahun_dipakai(t: str) -> bool:
    t = t.strip()
    return bool(re.match(r"^<?\s*\d{4}$", t))


def tahun_kunci(t: str):
    """Untuk mengurutkan tahun. "< 1945" lebih awal dari angka mana pun; nilai bukan tahun
    seperti "-" dan string kosong dibuang oleh pemanggilnya."""
    t = t.strip()
    if t.startswith("<"):
        angka = re.search(r"\d{4}", t)
        return (int(angka.group()) - 1, 0) if angka else (0, 0)
    return (int(t), 1)

AKAR = Path(__file__).resolve().parent
ALIAS = AKAR / "pemohon_alias.csv"
VARIETAS = AKAR / "varietas_terdaftar.csv"
PEMOHON = AKAR / "pemohon_varietas.csv"


def baca(p):
    with p.open(encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def tulis(p, baris):
    # Akhir baris CRLF, mengikuti berkas yang sudah ada (bawaan modul csv).
    with p.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(baris[0].keys()))
        w.writeheader()
        w.writerows(baris)


def main() -> int:
    menulis = "--tulis" in sys.argv

    alias = baca(ALIAS)
    peta = {a["pemohon_asli"]: a["nama_kanonik"] for a in alias}
    peta_rapi = {a["pemohon_asli"].strip(): a["nama_kanonik"] for a in alias}

    varietas = baca(VARIETAS)
    berubah = []
    for r in varietas:
        asli = r["pemohon"]
        baru = peta.get(asli) or peta_rapi.get(asli.strip()) or asli
        if r["pemohon_kanonik"] != baru:
            berubah.append((asli, r["pemohon_kanonik"], baru))
        r["pemohon_kanonik"] = baru

    print(f"varietas_terdaftar.csv : {len(varietas)} baris, pemohon_kanonik berubah pada {len(berubah)}")
    for asli, lama, baru in Counter(berubah).keys():
        n = sum(1 for x in berubah if x == (asli, lama, baru))
        print(f"   {n:5d}x  {asli!r}: {lama!r} -> {baru!r}")

    # --- pemohon_varietas.csv: hanya baris yang terkena ---
    pemohon = baca(PEMOHON)
    per_kanonik = {}
    for r in varietas:
        per_kanonik.setdefault(r["pemohon_kanonik"], []).append(r)

    kena = {baru for _, _, baru in berubah} | {lama for _, lama, _ in berubah}
    hapus, sunting = [], []
    for row in list(pemohon):
        nama = row["pemohon"]
        if nama not in kena:
            continue
        rs = per_kanonik.get(nama)
        if not rs:
            hapus.append(row)
            pemohon.remove(row)
            continue
        kom = Counter(r["komoditas"].strip() for r in rs if r["komoditas"].strip())
        izin = Counter(r["jenis_perizinan"].strip() for r in rs if r["jenis_perizinan"].strip())
        th = sorted((r["tahun"].strip() for r in rs if tahun_dipakai(r["tahun"])), key=tahun_kunci)
        baru = {
            "jumlah_varietas": str(len(rs)),
            "jumlah_ejaan_digabung": str(sum(1 for v in peta.values() if v == nama)),
            "komoditas_utama": kom.most_common(1)[0][0] if kom else "",
            "komoditas_semua": ";".join(k for k, _ in kom.most_common()),
            "tahun_pertama": th[0] if th else "",
            "tahun_terakhir": th[-1] if th else "",
            "jenis_perizinan_terbanyak": izin.most_common(1)[0][0] if izin else "",
        }
        beda = {k: (row[k], v) for k, v in baru.items() if row[k] != v}
        if beda:
            sunting.append((nama, beda))
            row.update(baru)

    # --- perbaikan kolom turunan yang berlaku untuk seluruh baris ---
    naik, tahun_baik = [], []
    for row in pemohon:
        nama = row["pemohon"]
        rs = per_kanonik.get(nama, [])
        if row["jenis_badan"] == "perorangan/lainnya":
            g = golongkan(nama)
            if g:
                naik.append((nama, row["jenis_badan"], g, row["jumlah_varietas"]))
                row["jenis_badan"] = g
        th = sorted((r["tahun"].strip() for r in rs if tahun_dipakai(r["tahun"])), key=tahun_kunci)
        if th and row["tahun_pertama"] != th[0]:
            tahun_baik.append((nama, row["tahun_pertama"], th[0]))
            row["tahun_pertama"] = th[0]

    print(f"\njenis_badan dinaikkan dari perorangan/lainnya : {len(naik)} baris")
    for nama, l, b, j in sorted(naik, key=lambda t: -int(t[3]))[:12]:
        print(f"   {b:17s} {j:>4s}  {nama[:56]}")
    if len(naik) > 12:
        print(f"   ... dan {len(naik) - 12} lagi")
    print(f"tahun_pertama diperbaiki : {len(tahun_baik)} baris")
    for nama, l, b in tahun_baik:
        print(f"   {nama[:52]:54s} {l!r} -> {b!r}")

    pemohon.sort(key=lambda x: -int(x["jumlah_varietas"]))
    print(f"\npemohon_varietas.csv   : {len(pemohon)} baris")
    for row in hapus:
        print(f"   dihapus  {row['pemohon']!r} ({row['jumlah_varietas']} varietas) — sudah bergabung")
    for nama, beda in sunting:
        print(f"   disunting {nama!r}")
        for k, (l, b) in beda.items():
            print(f"      {k}: {l!r} -> {b!r}")

    if menulis:
        tulis(VARIETAS, varietas)
        tulis(PEMOHON, pemohon)
        print("\nDitulis: varietas_terdaftar.csv, pemohon_varietas.csv")
    else:
        print("\nPeriksa saja. Tambahkan --tulis untuk menyimpan.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
