#!/usr/bin/env python3
"""Menguji ulang jangkauan situs yang tercatat rusak atau mati.

    python3 cek-jangkauan.py                 # uji semua baris rusak/mati
    python3 cek-jangkauan.py --semua         # uji setiap baris bersitus
    python3 cek-jangkauan.py --kendali-saja  # cuma buktikan jaringannya sendiri sehat

Ada karena satu penemuan yang membatalkan sebagian data: `katalogcba.com` berhasil
dipanen 31 merek pada 20 Agustus 2026, lalu beberapa jam kemudian berhenti menjawab dari
lingkungan yang sama — bukan galat HTTP, melainkan kegagalan sambungan. Bersamanya, lima
principal di IP Hostinger dan tiga domain yang berbagi satu IP (45.143.81.204) juga
gagal serentak, sementara situs kendali menjawab 200 pada detik yang sama.

Satu host tersaring menjatuhkan banyak situs sekaligus. Karena itu status `rusak` dan
`mati` yang dicatat dari satu titik pandang jaringan TIDAK BOLEH dipercaya sebagai sifat
situsnya. Alat ini memisahkan "tidak bisa dijangkau dari sini" dari "memang mati".

Kendali dijalankan lebih dulu. Kalau kendali pun gagal, seluruh hasilnya dibuang — sebab
yang sedang diukur adalah jaringan kita, bukan situs mereka.
"""

import argparse
import csv
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

AKAR = Path(__file__).resolve().parent
# Kendali diambil dari situs yang SUDAH kita panen sendiri. Itu satu-satunya kendali yang
# sah: kalau situs yang terbukti pernah memberi kita gambar kini tak terjangkau, yang
# berubah pasti titik pandang kita, bukan situsnya.
#
# Diuji 22 Agustus 2026 dan hasilnya menghentikan banyak kesimpulan: petrosida-gresik.com
# (47 merek dipanen), asterindo.co.id (12), dan katalogcba.com (31) seluruhnya gagal
# tersambung, sementara enam situs panen lain menjawab 200 pada detik yang sama. Blok /24
# utuh yang jatuh, bukan situs per situs.
KENDALI = ["saprotan-utama.com", "pt-sgi.com", "kenso.co.id", "santani.id",
           "petrosida-gresik.com", "asterindo.co.id", "katalogcba.com"]


def probe(host: str, detik: int = 12) -> tuple[str, str]:
    """Mengembalikan (kode, ip). Kode '000' berarti sambungan gagal, bukan galat HTTP."""
    host = host.strip().replace("https://", "").replace("http://", "").split("/")[0]
    if not host:
        return "—", ""
    ip = subprocess.run(["dig", "+short", host], capture_output=True, text=True).stdout
    ip = next((l for l in ip.splitlines() if l and l[0].isdigit()), "")
    kode = subprocess.run(
        ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", str(detik),
         f"https://{host}"], capture_output=True, text=True).stdout.strip()
    if kode == "000":
        kode = subprocess.run(
            ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", str(detik),
             f"http://{host}"], capture_output=True, text=True).stdout.strip()
    return kode or "000", ip


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--semua", action="store_true")
    ap.add_argument("--kendali-saja", action="store_true")
    a = ap.parse_args()

    print("Kendali — seluruhnya situs yang sudah kita panen sendiri:")
    sehat = 0
    blok_buta = set()
    for h in KENDALI:
        k, ip = probe(h)
        ok = k.startswith(("2", "3"))
        sehat += ok
        if not ok and ip:
            blok_buta.add(".".join(ip.split(".")[:3]))
        print(f"  {'HIDUP ' if ok else 'GAGAL '} {k:4} {h:26} {ip}")
    if blok_buta:
        print(f"\n  {len(blok_buta)} blok /24 tak terjangkau meski situsnya terbukti "
              f"pernah memberi kita gambar:")
        for b in sorted(blok_buta):
            print(f"    {b}.0/24")
        print("  Hasil negatif pada blok itu TIDAK SAH. Uji ulang dari jaringan lain.")
    if sehat < 3:
        print("\nKendali gagal — yang sedang diukur jaringan kita, bukan situs mereka.",
              file=sys.stderr)
        print("Hasil apa pun di bawah ini tidak sah. Ulangi dari jaringan lain.", file=sys.stderr)
        return 1
    if a.kendali_saja:
        return 0

    with (AKAR / "principal-antrean.csv").open(encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    sasaran = [r for r in rows if r["situs"] and (a.semua or r["status_situs"] in ("rusak", "mati"))]
    print(f"\nMenguji {len(sasaran)} baris:\n")

    per_ip = defaultdict(list)
    hidup = mati = 0
    for r in sasaran:
        k, ip = probe(r["situs"])
        per_ip[ip].append((r["principal_kanonik"], k))
        tanda = "HIDUP " if k.startswith(("2", "3")) else "gagal "
        hidup += k.startswith(("2", "3"))
        mati += not k.startswith(("2", "3"))
        print(f"  {tanda} {k:4} {r['situs'][:34]:34} {ip:16} {r['principal_kanonik'][:34]}")

    print(f"\n{hidup} menjawab · {mati} tidak")
    per24 = defaultdict(list)
    for ip, v in per_ip.items():
        if ip:
            per24[".".join(ip.split(".")[:3])].extend(v)
    berbagi = {b: v for b, v in per24.items()
               if len(v) > 1 and all(not k.startswith(("2", "3")) for _, k in v)}
    if berbagi:
        print("\nBlok /24 yang SELURUH situsnya gagal serentak — blok tersaring, bukan situs mati:")
        for b, v in berbagi.items():
            print(f"  {b + '.0/24':20} {len(v)} situs: " + ", ".join(n[:24] for n, _ in v))
        print("\n  Jangan naikkan baris ini ke 'mati'. Uji ulang dari jaringan lain.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
