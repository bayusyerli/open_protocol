#!/usr/bin/env python3
"""Melipat temuan pemetaan situs ke principal-antrean.csv.

    python3 lipat-temuan.py

Agen pemetaan menulis ke potongan/temuan-situs-N.csv masing-masing — satu berkas per
agen, sebab lima penulis pada satu berkas akan saling memotong tulisan. Alat ini
menyatukannya ke antrean, yang merupakan satu-satunya sumber kebenaran soal principal
mana yang sudah diperiksa.

Nama principal dicocokkan persis. Yang tidak cocok dilaporkan, tidak didiamkan: nama
yang meleset berarti temuan mahal itu jatuh ke lantai tanpa suara.
"""

import csv
import glob
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

AKAR = Path(__file__).resolve().parent
ANTREAN = AKAR / "principal-antrean.csv"
KOLOM = ["principal_kanonik", "merek", "merek_belum_dipanen", "merek_teknis",
         "situs", "status_situs", "jumlah_produk", "resolusi_terbesar",
         "jalan_pintas", "catatan"]

# Bahan teknis: kadar tinggi berakhiran TC/TK. Tidak pernah berkemasan eceran, jadi
# tidak akan pernah punya foto kemasan di situs mana pun. Porsinya juga menandai
# principal yang memasarkan diri ke sesama industri — dan mereka cenderung tak bersitus.
TEKNIS = re.compile(r"\b(\d{2,3}(\.\d+)?\s*%?\s*)?(TC|TK)\b\s*$", re.I)


def hitung_teknis() -> dict:
    p = AKAR / "indeks-merek.json"
    if not p.exists():
        return {}
    ix = json.loads(p.read_text(encoding="utf-8"))["merek"]
    per = defaultdict(int)
    for v in ix.values():
        if TEKNIS.search(v["name"].strip()):
            per[v["manufacturer_canonical"]] += 1
    return per


def main() -> int:
    if not ANTREAN.exists():
        print(f"{ANTREAN.name} tidak ada.", file=sys.stderr)
        return 1
    with ANTREAN.open(encoding="utf-8") as f:
        antrean = {r["principal_kanonik"]: r for r in csv.DictReader(f)}

    teknis = hitung_teknis()
    for p, r in antrean.items():
        r["merek_teknis"] = str(teknis.get(p, 0))
        for k in KOLOM:
            r.setdefault(k, "")

    pecahan = sorted(glob.glob(str(AKAR / "potongan" / "temuan-situs-*.csv")))
    if not pecahan:
        print("Tidak ada potongan/temuan-situs-*.csv.", file=sys.stderr)
        return 1

    dilipat, asing, ditimpa = 0, [], []
    for p in pecahan:
        with open(p, encoding="utf-8") as f:
            baris = list(csv.DictReader(f))
        for b in baris:
            nama = (b.get("principal_kanonik") or "").strip()
            if nama not in antrean:
                asing.append(f"{Path(p).name}: {nama}")
                continue
            lama = antrean[nama]
            # Hanya berbunyi bila nilainya BERUBAH. Melipat ulang temuan yang sama
            # adalah hal biasa — alat ini idempoten — dan memperingatkannya tiap kali
            # akan melatih pembacanya mengabaikan peringatan yang sungguhan.
            if (lama["status_situs"] not in ("", "belum-diperiksa")
                    and b.get("status_situs") and b["status_situs"] != lama["status_situs"]):
                ditimpa.append(f"{nama}: {lama['status_situs']} -> {b['status_situs']}")
            for k in ("situs", "status_situs", "jumlah_produk", "resolusi_terbesar",
                      "jalan_pintas", "catatan"):
                if b.get(k):
                    lama[k] = b[k]
            dilipat += 1
        print(f"  {Path(p).name:26} {len(baris):3} baris")

    with ANTREAN.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=KOLOM, extrasaction="ignore")
        w.writeheader()
        w.writerows(antrean.values())

    st = Counter(r["status_situs"] for r in antrean.values())
    layak = {"ada", "tipis"}
    merek_layak = sum(int(r["merek_belum_dipanen"]) for r in antrean.values()
                      if r["status_situs"] in layak)
    merek_periksa = sum(int(r["merek_belum_dipanen"]) for r in antrean.values()
                        if r["status_situs"] not in ("", "belum-diperiksa"))
    sisa = sum(int(r["merek_belum_dipanen"]) for r in antrean.values())

    print(f"\n{dilipat} temuan dilipat ke {ANTREAN.name}")
    print("status  : " + " · ".join(f"{k} {v}" for k, v in st.most_common()))
    print(f"merek   : {sisa} belum dipanen")
    print(f"          {merek_periksa} sudah diperiksa situsnya "
          f"({merek_periksa / sisa * 100:.1f}%)")
    print(f"          {merek_layak} bernaung di principal bersitus layak "
          f"({merek_layak / merek_periksa * 100:.1f}% dari yang diperiksa)")
    print(f"teknis  : {sum(int(r['merek_teknis']) for r in antrean.values())} merek TC/TK "
          f"— tak pernah berkemasan eceran, bisa dicoret di depan")
    for a in asing:
        print(f"ASING     {a}  (nama tidak ada di antrean; temuannya TIDAK terlipat)")
    for d in ditimpa:
        print(f"DITIMPA   {d}")
    return 1 if asing else 0


if __name__ == "__main__":
    sys.exit(main())
