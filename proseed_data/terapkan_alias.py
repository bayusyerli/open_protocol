#!/usr/bin/env python3
"""Menerapkan pemohon_alias.csv ke kolom turunannya.

    python3 proseed_data/terapkan_alias.py            # periksa saja, laporkan bedanya
    python3 proseed_data/terapkan_alias.py --tulis    # tulis perubahannya

Konvensi pasal 4 di spec/00-konvensi-kerja-paralel.md menjanjikan bahwa membalik sebuah
penggabungan cukup dengan menyunting berkas alias lalu membangkitkan ulang kolom kanoniknya.
Sampai berkas ini ada, janji itu tidak punya pelaksana.

Kolom `pemohon` di varietas_terdaftar.csv tidak pernah disentuh; yang ditulis ulang hanya
`pemohon_kanonik`. Pada pemohon_varietas.csv hanya baris yang benar-benar terkena yang diubah —
membangun ulang seluruh berkas akan ikut mengubah 1.006 baris karena tiga kebiasaan pembuat
aslinya yang tidak bisa dipastikan maksudnya, dan itu pekerjaan lain:

  1. `tahun_pertama` mengabaikan tahun bernilai "-" (mis. Balitkabi 1918, bukan "-");
  2. BRIN digolongkan "perorangan/lainnya", bukan "Lembaga riset";
  3. kolom `varietas` di berkas alias tidak sama dengan cacah baris `pemohon` yang sepadan
     (mis. Pemerintah Kabupaten Banyuwangi tertulis 37, sedangkan barisnya 40).

Ketiganya dicatat, tidak diperbaiki diam-diam.
"""

import csv
import sys
from collections import Counter
from pathlib import Path

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
        th = sorted(r["tahun"].strip() for r in rs if r["tahun"].strip().isdigit())
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
