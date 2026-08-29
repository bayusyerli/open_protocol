#!/usr/bin/env python3
"""Kosakata terkendali untuk kolom yang ditulis bebas oleh empat agen paralel.

Tiap agen menulis `crop`, `data_type`, dan `license` dengan kalimatnya sendiri, jadi
katalog gabungan sempat punya 40 varian `crop` — tidak bisa disaring. Modul ini
memetakan teks bebas itu ke kosakata tetap TANPA membuang aslinya: teks asal pindah
ke kolom `*_detail`, kolom kanonik dipakai untuk menyaring dan menghitung.

Sinyal utama untuk `crop` adalah `local_path`, bukan teks — folder tempat agen
menaruh dataset adalah keputusan yang sudah dibuat sadar. Teks hanya jadi cadangan
untuk baris yang tidak pernah menyentuh disk.
"""
import re

PRIORITAS = ("cabai", "tomat", "kentang", "bawang-merah")

# Bawang merah (Allium cepa var. aggregatum) bukan bawang bombay (A. cepa) dan bukan
# bawang putih (A. sativum). Hanya penanda shallot yang boleh memberi tag prioritas;
# "onion" polos jatuh ke `lainnya` supaya cakupan bawang merah tidak dilebih-lebihkan.
PETA = {
    "cabai":        r"\bcabai|\bcabe\b|chill?i|capsicum",
    "tomat":        r"tomat|tomato|lycopersic",
    "kentang":      r"\bkentang|potato|tuberosum",
    "bawang-merah": r"bawang\s*merah|shallot|ascalonic|aggregatum",
}
LAIN = r"paprika|bell\s*pepper|\bonion\b|allium\s+cepa|bawang\s*putih|garlic|sativum|" \
       r"padi|rice|jagung|maize|apel|apple|anggur|grape|terung|eggplant|kubis|" \
       r"perkebunan|kopi|kelapa|cengkeh|karet|multi-tanaman|lintas|pepaya|labu|timun"


def crop(detail, local_path=""):
    """→ (kanonik pipa-terpisah, sudah-difilekan-di-mana). Path menang atas teks."""
    d = (detail or "").lower()
    if "tidak berlaku" in d:
        return "tidak-berlaku"
    # PlantVillage menamai kelasnya `Pepper__bell___*` = paprika, bukan cabai keriting/rawit.
    # Buang sebutan paprika sebelum menguji "cabai" supaya cakupan cabai tidak dilebihkan.
    d_cabai = re.sub(r"cabai\s*besar\s*\(paprika\)|paprika|bell\s*pepper", " ", d)
    tag = []
    m = re.search(r"datasets/priority/([a-z-]+)/", local_path or "")
    utama = m.group(1) if m and m.group(1) in PRIORITAS else None
    if utama:
        tag.append(utama)
    for nama, pola in PETA.items():
        teks = d_cabai if nama == "cabai" else d
        if nama not in tag and re.search(pola, teks):
            tag.append(nama)
    if not tag or re.search(LAIN, d):
        if not tag or len(tag) >= 3 or re.search(LAIN, d):
            tag.append("lainnya")
    # urutkan menurut urutan prioritas pengguna, `lainnya` selalu terakhir
    urut = {n: i for i, n in enumerate(PRIORITAS)}
    tag = sorted(set(tag), key=lambda t: urut.get(t, 9))
    return "|".join(tag) or "tidak-berlaku"


def data_type(detail):
    d = (detail or "").lower()
    if "bukan data" in d or "perangkat lunak" in d or "bukan dataset" in d:
        return "bukan-dataset"
    if "campuran" in d or ("gambar" in d and ("anotasi" in d or "kotak" in d or "label" in d)):
        return "campuran"
    if "gambar" in d or "citra" in d:
        return "gambar"
    if "tabular" in d or "csv" in d:
        return "tabular"
    if "teks" in d:
        return "teks"
    return "lainnya"


def license_family(detail):
    d = (detail or "").lower()
    if "berbayar" in d or "hak cipta penuh" in d or "langganan" in d:
        return "tertutup"
    if "cc0" in d and "cc by" not in d:
        return "CC0"
    if "nc" in d and "cc by" in d:
        return "CC BY-NC(-SA)"
    if "sa" in d and "cc by" in d and "nc" not in d:
        return "CC BY-SA"
    if "cc by" in d or "cc-by" in d:
        return "CC BY"
    if "tidak dinyatakan" in d or "tidak diketahui" in d or "belum" in d:
        return "tidak dinyatakan"
    return "lainnya"


_SATUAN = {"b": 1, "byte": 1, "bytes": 1, "kb": 10**3, "kib": 2**10, "mb": 10**6,
           "mib": 2**20, "gb": 10**9, "gib": 2**30, "tb": 10**12}


def ukuran(teks):
    """Teks ukuran bebas → (byte:int|None, tampilan:str).

    Agen menulis ukuran dengan enam gaya berbeda — byte telanjang, `111.1 MB`,
    `1.3 GiB`, `2.99 GB`. Katalog perlu satu angka yang bisa dijumlahkan.
    """
    t = (teks or "").strip()
    if not t:
        return None, ""
    m = re.match(r"^\s*([\d.,]+)\s*([A-Za-z]*)\s*$", t)
    if not m:
        return None, t
    angka = m.group(1).replace(",", "")
    try:
        n = float(angka)
    except ValueError:
        return None, t
    sat = m.group(2).lower()
    if not sat:
        b = int(n)                      # byte telanjang
    elif sat in _SATUAN:
        b = int(n * _SATUAN[sat])
    else:
        return None, t
    for batas, nama, bagi in ((10**9, "GB", 10**9), (10**6, "MB", 10**6),
                              (10**3, "KB", 10**3)):
        if b >= batas:
            return b, f"{b / bagi:.2f} {nama}"
    return b, f"{b} B"
