#!/usr/bin/env python3
"""Menyaring ekor antrean tanpa agen, memakai dua tanda yang murah.

    python3 saring-ekor.py            # tulis potongan/ekor-tersaring.csv
    python3 saring-ekor.py --cetak

Ada karena gelombang 3 membuktikan sapuan agen selebar 30 principal sudah tidak sepadan
di ekor ini. Angkanya dari dua potongan yang sepakat:

                        gelombang 1-2      gelombang 3
    ada                       21%                 3%
    tidak-ada                 33%                67%
    produk tertayang     14,4/principal     1,2/principal

Sekitar 60 operasi jaringan per merek yang berhasil dilayani. Satu agen mengusulkan
penggantinya, dan inilah alat itu: dua tanda yang bisa dijalankan atas SELURUH sisa
antrean secara lokal, lalu hanya yang lolos diberi agen.

Tanda 1 — ADA A RECORD pada domain tebakan dari nama PT.
    LEMAH SEBAGAI GERBANG, dan angkanya sudah diukur bersih. Satu agen diberi 40 baris
    `cari-nama` — yang menurut tanda ini "tidak punya domain" — dan menemukan **13 di
    antaranya punya situs: 32,5% salah-negatif.**

    Sebabnya seragam dan tidak bisa diperbaiki dengan tebakan yang lebih pintar: sembilan
    dari tiga belas domain itu **tidak bisa dicapai dari nama PT lewat transformasi apa
    pun**.

        petrokayaku.com     katalog grup, perusahaan yang sama sekali lain
        zamasta.co.id       akronim ZA-MA-STA
        nutrisoil.co.id     dinamai menurut MEREKNYA
        iopri.co.id         nama unit riset
        dewagro.id          kontraksi
        sea6energy.com      "Six" jadi "6"
        agrosida.co.id      dipotong
        ostindo.co.id       kata terakhir saja
        toyotatsusho.co.id  "Indonesia" dibuang

    Pencarian web menemukan ketiga belasnya; sapuan DNS nama-PT-penuh tidak akan menemukan
    satu pun.

    DAN DIUJI DUA ARAH, ALAT INI GAGAL SEBAGAI PEMBEDA DI EKOR. Satu agen mengukur
    keduanya pada potongan yang sama:

        beri-agen  : 5 dari 18 keliru (28%) — domainnya milik orang lain
        cari-nama  : 6 dari 22 ternyata punya situs (27%)

    Salah 28% di satu sisi dan 27% di sisi lain berarti ia nyaris tidak membawa informasi.
    Sebabnya sudah jelas dari daftar di atas: di ekor, domain principal hampir tidak pernah
    diturunkan dari nama PT-nya.

    Yang tersisa dari alat ini hanya satu kegunaan jujur: ia MURAH, jadi ia boleh dipakai
    mengurutkan giliran — bukan memutuskan siapa yang dilewati. Pencarian web tetap
    pekerjaan yang sebenarnya, dan tidak ada tanda murah yang menggantikannya.

    TETAPI agen lain mengukur hal berbeda pada potongan yang seluruhnya `beri-agen`, dan
    hasilnya membantah sebagian: `ada` 22,5% di sana berbanding **13,3%** rata-rata
    gelombang 1-3 (n=660), dan `tidak-ada` 35% berbanding 52,7%. Itu **daya angkat 1,7x**.

    Jadi keduanya benar, dan bentuk yang jujur begini: alat ini punya DAYA ANGKAT nyata
    tetapi KETEPATAN buruk. Ia layak dipakai mengurutkan giliran, tidak layak dipakai
    memutuskan siapa dilewati — sebab 35% yang tetap terbuang itu sepertiganya kelas
    berbahaya yang TERLIHAT seperti keberhasilan: domain hidup milik perusahaan lain.

    Dicatat apa adanya alih-alih dihapus, sebab hasil negatif yang terukur lebih berguna
    daripada alat yang diam-diam disingkirkan.

    Karena itu yang nol A record TIDAK ditulis `tidak-ada`, melainkan `cari-nama`:
    ia masih layak satu operasi, yaitu pencarian web atas nama perusahaannya. Itu satu-
    satunya langkah yang menurut agen tetap berbayar di ekor ini.

Tanda 2 — BUKAN DIPARKIR.
    Sepasang IP penadah membatalkan sepuluh kandidat sekaligus pada satu potongan.
    Tandanya berlapis: IP penadah yang sudah dikenal, badan 114 bita berisi
    `window.location.href="/lander"`, dan MX null (`0 .`).

Yang lolos kedua tanda diberi agen; sisanya ditulis `tidak-ada` beserta alasannya, dan
alasan itu spesifik supaya bisa dibantah nanti — bukan "tidak ketemu".
"""

import argparse
import collections
import csv
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

AKAR = Path(__file__).resolve().parent
PENADAH_IP = {"13.248.169.48", "76.223.54.146", "45.83.42.1", "91.195.240.19"}
PENADAH_NS = ("dns-expired.com", "mysrsx.com", "afternic.com", "hugedomains.com",
              "sedoparking.com", "bodis.com")
# Kata Inggris umum yang hampir pasti sudah dipegang penadah domain. Merek yang seluruhnya
# tersusun dari kata-kata ini tidak layak ditebak domainnya.
UMUM = {"grow", "focus", "action", "soil", "green", "power", "max", "plus", "gold", "super",
        "top", "best", "prime", "star", "king", "smart", "pro", "aqua", "bio", "eco"}


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")


def inti_nama(p: str) -> str:
    """Nama PT tanpa awalan badan hukum, jadi bahan tebakan domain."""
    s = re.sub(r"^(PT\.?|CV\.?|UD\.?|PD\.?)\s*", "", p.strip(), flags=re.I)
    return slug(s).replace("-", "")


def dns(host: str) -> tuple[str, str]:
    """A lebih dulu; NS hanya kalau A ada. Menghemat separuh panggilan pada ekor, tempat
    sebagian besar kandidat memang tidak beralamat sama sekali."""
    a = subprocess.run(["dig", "+short", "+time=2", "+tries=1", "A", host],
                       capture_output=True, text=True).stdout
    ip = next((l for l in a.splitlines() if l and l[0].isdigit()), "")
    if not ip:
        return "", ""
    ns = subprocess.run(["dig", "+short", "+time=2", "+tries=1", "NS", host],
                        capture_output=True, text=True).stdout.lower()
    return ip, ns


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--cetak", action="store_true")
    ap.add_argument("--batas", type=int, default=0, help="hanya N principal pertama (untuk uji)")
    a = ap.parse_args()

    ix = json.loads((AKAR / "indeks-merek.json").read_text(encoding="utf-8"))["merek"]
    merek_per = collections.defaultdict(list)
    for v in ix.values():
        merek_per[v["manufacturer_canonical"]].append(v["name"])
    with (AKAR / "principal-antrean.csv").open(encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    belum = [r for r in rows if r["status_situs"] == "belum-diperiksa"]
    belum.sort(key=lambda r: -len(merek_per[r["principal_kanonik"]]))
    if a.batas:
        belum = belum[:a.batas]

    keluar, lolos, cari = [], 0, 0
    for r in belum:
        p = r["principal_kanonik"]
        inti = inti_nama(p)
        mk = merek_per[p]
        # Apex saja BERBOHONG. wilmar-international.com tidak punya A record di apex
        # sementara www.-nya resolve lewat Incapsula; sapuan yang hanya memeriksa apex
        # mencatatnya mati. Periksa keduanya.
        kandidat = ([f"{inti}.co.id", f"www.{inti}.co.id",
                     f"{inti}.com", f"www.{inti}.com"] if len(inti) >= 5 else [])
        ip = ns = ""
        hidup = ""
        for h in kandidat:
            ip, ns = dns(h)
            if ip:
                hidup = h
                break
        # Merek yang seluruhnya kata Inggris umum: tebakan berbasis merek tidak sepadan.
        umum = all(all(w.lower() in UMUM or w.isdigit() for w in re.findall(r"[A-Za-z]+", m))
                   for m in mk[:5]) if mk else False
        diparkir = ip in PENADAH_IP or any(x in ns for x in PENADAH_NS)
        if not ip:
            putusan, sebab = "cari-nama", (
                f"nol A record pada {', '.join(kandidat) or 'tebakan nama PT'} — "
                f"masih layak SATU pencarian web atas nama perusahaan; domain bernama grup "
                f"tidak terbaca dari nama PT (tiga terlewat begitu pada satu potongan)")
        elif diparkir:
            putusan, sebab = "lewati", f"{hidup} diparkir (ip={ip}, ns menandai penadah)"
        elif umum:
            putusan, sebab = "lewati", "merek seluruhnya kata Inggris umum; tebakan domain tak sepadan"
        else:
            putusan, sebab = "beri-agen", f"{hidup} punya A record {ip}, bukan penadah"
            lolos += 1
        cari += putusan == "cari-nama"
        keluar.append({"principal_kanonik": p, "merek": len(mk),
                       "domain_hidup": hidup, "ip": ip,
                       "putusan": putusan, "sebab": sebab})

    n = len(keluar)
    mk_lolos = sum(x["merek"] for x in keluar if x["putusan"] == "beri-agen")
    mk_semua = sum(x["merek"] for x in keluar)
    print(f"{n} principal disaring · {lolos} beri-agen ({lolos/n*100:.0f}%) · "
          f"{cari} cari-nama ({cari/n*100:.0f}%) · {n-lolos-cari} lewati (diparkir/merek umum)")
    print(f"merek: {mk_lolos} di bawah yang lolos, dari {mk_semua} "
          f"({mk_lolos/mk_semua*100:.0f}%)")
    if a.cetak:
        for x in keluar:
            if x["putusan"] == "beri-agen":
                print(f"  {x['merek']:3} {x['principal_kanonik'][:44]:44} {x['domain_hidup']}")
    else:
        p = AKAR / "potongan" / "ekor-tersaring.csv"
        p.parent.mkdir(exist_ok=True)
        with p.open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(keluar[0]))
            w.writeheader()
            w.writerows(keluar)
        print(f"{p.relative_to(AKAR)} ditulis")
    return 0


if __name__ == "__main__":
    sys.exit(main())
