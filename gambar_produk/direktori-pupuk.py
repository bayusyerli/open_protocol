#!/usr/bin/env python3
"""Direktori asosiasi untuk segmen PUPUK — pasangan `direktori.py` yang melayani pestisida.

    python3 direktori-pupuk.py            # tulis potongan/domain-direktori-pupuk.csv
    python3 direktori-pupuk.py --cetak

Ditulis 22 Agustus 2026 setelah pemetaan gelombang 4 agen 3 mengukur nol dari 40 principal
pupuk sebagai anggota CropCare maupun Alishter. Dua badan diusulkan sebagai pengganti:
APPI dan AP2KMI. Keduanya ditelusuri sampai habis di sini, lewat API dan arsip, bukan HTML.

Hasilnya nol domain baru — dan justru itu yang layak dikodekan, supaya gelombang berikutnya
tidak membayar ulang penelusuran yang sama. Dua sebab yang berbeda:

APPI (Asosiasi Produsen Pupuk Indonesia)
    Domainnya HILANG, bukan sekadar mati: `appi.or.id` nol A record pada 8.8.8.8 dan
    1.1.1.1, berstatus `serverHold` di PANDI, dan tangkapan Wayback 2024 atas
    `www.appi.or.id` adalah situs judi slot — domainnya lepas lalu didudukI pihak lain.
    Daftar anggotanya diambil dari arsip. Isinya 6 domain: kelima BUMN pupuk plus
    holding-nya. Semuanya SUDAH ada di antrean sejak gelombang 1.

    Jadi APPI bukan jalur ekor. Ia himpunan raksasa negara — persis kebalikan dari tempat
    principal pupuk kita berada.

AP2KMI (Asosiasi Produsen Pupuk Kecil Menengah Indonesia)
    AP2KMI dan APPKMI adalah BADAN YANG SAMA, dua ejaan akronim untuk nama yang sama.
    Dibuktikan dua arah: CV. Dewi Sri Rama menyebut dirinya anggota "Asosiasi Produsen
    Pupuk Kecil Menengah Indonesia (AP2KMI)", dan `asosiasiprodusenpupuk.org` menyebut
    dirinya "Asosiasi Produsen Pupuk Kecil Menengah Indonesia (APPKMI)" — kalimat yang
    sama persis, akronim berbeda.

    Maka "AP2KMI belum pernah dicoba" keliru: situsnya sudah diperiksa, di bawah nama lain.
    Kali ini diperiksa lewat API-nya, bukan HTML-nya — dan API membenarkan HTML:
    2 halaman (satu di antaranya "Under Costruction"), 0 pos, 1 pengguna admin, dan media
    yang seluruhnya foto stok Unsplash. Tidak ada tipe pos anggota di indeks rutenya.
    Nol alamat surat. Situsnya brosur satu halaman, bukan direktori.

Pelajaran yang berbeda dari pelajaran cropcare, dan perlu dicatat justru karena berbeda:
memeriksa API tidak selalu membalik hasilnya. Di cropcare API memberi 46 domain yang tak
ada di HTML; di sini API membenarkan HTML. Yang membuat keduanya sah adalah pemeriksaannya
dilakukan, bukan hasilnya.

PERINGATAN soal kolom `sudah_di_antrean`
    Ia dihitung ulang tiap jalan terhadap `principal-antrean.csv` **di worktree tempat
    skrip ini berjalan**, dan repo ini punya beberapa worktree yang antreannya BERBEDA
    isinya. Jadi kolom itu menjawab "sudah ada di antrean CABANG INI?", bukan "sudah
    pernah dipanen?".

    Terukur 22 Agustus 2026, keduanya sah dan ter-commit, bercabang di 71e2c42:

        beranda-pencarian (3d3f3c4)  372 situs terisi, 761 catatan   (sapuan gelombang 4)
        main (8ff64b4)               155 situs terisi, 201 catatan

    Tiga domain BUMN di bawah ini absen dari antrean `main` tetapi ADA di
    `beranda-pencarian` — `pusri.co.id` (status `ada`, temuan ember GCS), `pim.co.id`
    (`tipis`) dan `pupuk-indonesia.com` (`tipis`). Mereka ditandai
    `ya-di-cabang-lain`, bukan `tidak`, supaya tidak pernah terbaca sebagai temuan baru.

    Kesimpulan APPI tetap **nol domain baru dari 6** di kedua cabang.
"""

import argparse
import csv
import json
import re
import subprocess
import sys
from pathlib import Path

AKAR = Path(__file__).resolve().parent
PROKSI = "https://r.jina.ai/"

# APPI: situsnya lepas ke pendudukan judi slot; daftar anggota diambil dari arsip terakhir
# yang masih menampilkan asosiasinya (26 Februari 2021).
APPI_ARSIP = "http://web.archive.org/web/20210226122339id_/http://appi.or.id/appi-members"

# AP2KMI == APPKMI. Jalur langsung ke situsnya buta dari sini — 000 baik pada curl polos
# maupun `curl -k`, jadi bukan soal sertifikat (46.202.138.131, blok teralokasi Ukrtelecom).
# Proksi menjawab penuh, jadi yang padam titik pandang kami, bukan situsnya. Lihat §0.
AP2KMI_API = ("https://asosiasiprodusenpupuk.org/wp-json/wp/v2/"
              "pages?per_page=100&_fields=id,slug,title,content")

SURAT = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
BUKAN = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg")
UMUM = {"gmail.com", "yahoo.com", "yahoo.co.id", "hotmail.com", "outlook.com", "ymail.com"}
DIRI = {"appi.or.id", "asosiasiprodusenpupuk.org", "web.archive.org"}


def ambil(url: str, lewat_proksi: bool = False) -> str:
    """curl mentah. Proksi dipakai hanya kalau jalur langsung buta bagi kita."""
    penuh = (PROKSI + url) if lewat_proksi else url
    r = subprocess.run(["curl", "-s", "--compressed", "--max-time", "90", "-L", penuh],
                       capture_output=True, text=True)
    return r.stdout


def json_dari_proksi(teks: str):
    """r.jina.ai membungkus JSON dalam preambul markdown. Kupas, lalu parse."""
    i = teks.find("Markdown Content:")
    isi = teks[i + len("Markdown Content:"):].strip() if i >= 0 else teks
    j = isi.find("[")
    if j < 0:
        return []
    try:
        d = json.loads(isi[j:])
        return d if isinstance(d, list) else []
    except Exception:                                             # noqa: BLE001
        return []


def domain_bersih(d: str) -> str:
    return d.lower().removeprefix("www.").split("/")[0]


def dari_appi() -> list:
    html = ambil(APPI_ARSIP)
    baris = []
    for m in re.findall(r'href="(https?://[^"]+)"', html):
        dom = domain_bersih(m.replace("https://", "").replace("http://", ""))
        if not dom or dom in DIRI:
            continue
        if re.search(r"archive\.org|instagram|linkedin|twitter|facebook|youtube|"
                     r"bootstrapcdn|ionicframework|jquery|fonts\.|google", dom):
            continue
        baris.append({"direktori": "appi", "halaman": "APPI Members (arsip 2021-02-26)",
                      "surat": "", "domain": dom, "domain_perusahaan": "ya"})
    # Dedup sambil mempertahankan urutan.
    lihat, unik = set(), []
    for b in baris:
        if b["domain"] not in lihat:
            lihat.add(b["domain"])
            unik.append(b)
    return unik


def dari_ap2kmi() -> list:
    hal = json_dari_proksi(ambil(AP2KMI_API, lewat_proksi=True))
    print(f"{'ap2kmi':10} {len(hal):3} halaman "
          f"({', '.join(p.get('slug', '?') for p in hal) or 'nol'})", file=sys.stderr)
    baris = []
    for p in hal:
        isi = (p.get("content", {}) or {}).get("rendered", "")
        judul = re.sub("<[^>]*>", "", (p.get("title", {}) or {}).get("rendered", "")).strip()
        for s in SURAT.findall(isi):
            if s.lower().endswith(BUKAN):
                continue
            dom = domain_bersih(s.split("@")[1])
            if dom in DIRI:
                continue
            baris.append({"direktori": "ap2kmi", "halaman": judul[:70], "surat": s.lower(),
                          "domain": dom,
                          "domain_perusahaan": "tidak" if dom in UMUM else "ya"})
    return baris


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--cetak", action="store_true")
    a = ap.parse_args()

    baris = dari_appi() + dari_ap2kmi()
    print(f"{'appi':10} {sum(1 for b in baris if b['direktori'] == 'appi'):3} domain anggota",
          file=sys.stderr)

    ada = set()
    p = AKAR / "principal-antrean.csv"
    if p.exists():
        with p.open(encoding="utf-8") as f:
            for r in csv.DictReader(f):
                if r["situs"]:
                    ada.add(domain_bersih(r["situs"].replace("https://", "")
                                          .replace("http://", "")))
    # Ada di antrean cabang `beranda-pencarian` (3d3f3c4) tetapi tidak di `main`.
    # Bukan domain baru — cuma cabang ini yang belum memuat sapuan gelombang 4.
    DI_CABANG_LAIN = {
        "pusri.co.id": "PT PUPUK SRIWIDJAJA PALEMBANG, status `ada`",
        "pim.co.id": "PT Pupuk Iskandar Muda, status `tipis`",
        "pupuk-indonesia.com": "PT Pupuk Indonesia (Persero), status `tipis`",
    }
    for b in baris:
        b["sudah_di_antrean"] = "ya" if b["domain"] in ada else "tidak"
        b["catatan"] = ""
        if b["sudah_di_antrean"] == "tidak" and b["domain"] in DI_CABANG_LAIN:
            b["sudah_di_antrean"] = "ya-di-cabang-lain"
            b["catatan"] = ("ADA di antrean cabang beranda-pencarian (3d3f3c4): "
                            + DI_CABANG_LAIN[b["domain"]]
                            + ". Cabang ini belum memuat sapuan gelombang 4. "
                              "Bukan domain baru.")

    if not baris:
        print("Nol hasil dari KEDUA direktori — lihat docstring: ini hasil yang diharapkan, "
              "bukan kegagalan alat.", file=sys.stderr)
        return 0

    dom = {b["domain"] for b in baris if b["domain_perusahaan"] == "ya"}
    baru = {b["domain"] for b in baris
            if b["domain_perusahaan"] == "ya" and b["sudah_di_antrean"] == "tidak"}
    pulih = {b["domain"] for b in baris if b["sudah_di_antrean"] == "ya-di-cabang-lain"}
    print(f"\n{len(baris)} baris · {len(dom)} domain perusahaan · "
          f"**{len(baru)} belum ada di antrean**")
    if pulih:
        print(f"  ({len(pulih)} lagi ada di antrean cabang beranda-pencarian, bukan di "
              f"cabang ini: {', '.join(sorted(pulih))})")
    if a.cetak:
        for b in sorted(baris, key=lambda x: (x["direktori"], x["domain"])):
            print(f"  {b['direktori']:8} {b['domain']:28} "
                  f"antrean={b['sudah_di_antrean']}")
    else:
        keluar = AKAR / "potongan" / "domain-direktori-pupuk.csv"
        keluar.parent.mkdir(exist_ok=True)
        with keluar.open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(baris[0]))
            w.writeheader()
            w.writerows(baris)
        print(f"{keluar.relative_to(AKAR)} ditulis")
    return 0


if __name__ == "__main__":
    sys.exit(main())
