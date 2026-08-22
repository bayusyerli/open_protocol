#!/usr/bin/env python3
"""Menarik domain principal dari direktori asosiasi lewat API-nya, bukan HTML-nya.

    python3 direktori.py            # tulis potongan/domain-direktori.csv
    python3 direktori.py --cetak

Ada karena satu jalur penemuan nyaris dinyatakan mati secara keliru. Dua agen memeriksa
`cropcare.or.id/daftar-anggota/` dan melaporkan kolom emailnya sudah hilang — HTML halaman
itu memang Elementor image-box dan hampir nol teks perusahaan (4 alamat surat).

Agen ketiga mencoba API-nya: `wp-json/wp/v2/pages` mengembalikan 74 halaman berisi **65
alamat surat di 46 domain**. Jalurnya tidak tertutup, ia cuma tidak ada di HTML.

Pelajarannya lebih luas dari satu direktori: sebelum menyatakan sebuah sumber kehilangan
datanya, periksa API di belakangnya. Sama seperti registri PUKPES yang halamannya minta
login sementara endpoint JSON-nya terbuka.
"""

import argparse
import csv
import json
import re
import subprocess
import sys
from pathlib import Path

AKAR = Path(__file__).resolve().parent
SUMBER = [
    ("cropcare", "https://cropcare.or.id/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,title,content"),
    ("alishter", "https://alishter.or.id/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,title,content"),
]
SURAT = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
BUKAN = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg")
UMUM = {"gmail.com", "yahoo.com", "yahoo.co.id", "hotmail.com", "outlook.com", "ymail.com"}


def tarik(url: str) -> list:
    r = subprocess.run(["curl", "-s", "--max-time", "60", url], capture_output=True, text=True)
    try:
        d = json.loads(r.stdout)
        return d if isinstance(d, list) else []
    except Exception:                                             # noqa: BLE001
        return []


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--cetak", action="store_true")
    a = ap.parse_args()

    baris = []
    for nama, url in SUMBER:
        hal = tarik(url)
        print(f"{nama:10} {len(hal):3} halaman", file=sys.stderr)
        for p in hal:
            isi = (p.get("content", {}) or {}).get("rendered", "")
            judul = (p.get("title", {}) or {}).get("rendered", "").strip()
            for s in SURAT.findall(isi):
                if s.lower().endswith(BUKAN):
                    continue
                dom = s.split("@")[1].lower()
                baris.append({"direktori": nama, "halaman": judul[:70],
                              "surat": s.lower(), "domain": dom,
                              "domain_perusahaan": "tidak" if dom in UMUM else "ya"})
    if not baris:
        print("Nol hasil — API-nya mungkin berubah, atau jaringan ini tidak menjangkaunya.",
              file=sys.stderr)
        return 1

    # Domain mana yang BELUM ada di antrean? Itu yang paling berharga.
    ada = set()
    p = AKAR / "principal-antrean.csv"
    if p.exists():
        with p.open(encoding="utf-8") as f:
            for r in csv.DictReader(f):
                if r["situs"]:
                    ada.add(r["situs"].replace("https://", "").replace("http://", "")
                            .split("/")[0].lower().removeprefix("www."))
    for b in baris:
        b["sudah_di_antrean"] = "ya" if b["domain"] in ada else "tidak"

    dom = {b["domain"] for b in baris if b["domain_perusahaan"] == "ya"}
    baru = {b["domain"] for b in baris if b["domain_perusahaan"] == "ya" and b["sudah_di_antrean"] == "tidak"}
    print(f"\n{len(baris)} alamat surat · {len(dom)} domain perusahaan · "
          f"**{len(baru)} belum ada di antrean**")
    if a.cetak:
        for d in sorted(baru):
            print("  ", d)
    else:
        keluar = AKAR / "potongan" / "domain-direktori.csv"
        keluar.parent.mkdir(exist_ok=True)
        with keluar.open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(baris[0]))
            w.writeheader()
            w.writerows(baris)
        print(f"{keluar.relative_to(AKAR)} ditulis")
    return 0


if __name__ == "__main__":
    sys.exit(main())
