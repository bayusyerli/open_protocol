#!/usr/bin/env python3
"""Membangun indeks merek dari registri produk.

    python3 merek.py            # tulis indeks-merek.json
    python3 merek.py --ringkas  # cetak ringkasannya saja

Merek = nama dagang + produsen KANONIK. Dua-duanya perlu:

- Nama dagang saja tidak cukup. 581 nama dipakai lebih dari satu produsen; 22 produsen
  berbeda sama-sama mendaftarkan "GLYPHOSATE 95 TC", yang memang nama bahan, bukan merek.
- Produsen harus kanonik menurut pukpes_data/principal_alias.csv. Tanpa itu LAO YING
  pecah jadi dua merek palsu: 80 pendaftaran di bawah "MEST INDONESIY" dan 34 di bawah
  "PT. MEST INDONESIY" — perusahaan yang sama, ditulis dua cara.

Pembentukan slug juga menyatukan ejaan nama dagang yang berbeda-beda. Penyatuan itu
benar, tetapi dicatat sebagai name_variants supaya terlihat — konvensi kerja paralel
pasal 4: nama asli tidak pernah ditimpa.
"""

import argparse
import csv
import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

AKAR = Path(__file__).resolve().parent.parent
NDJSON = [AKAR / "spec/vocab/product/pestisida.ndjson", AKAR / "spec/vocab/product/pupuk.ndjson"]
ALIAS = AKAR / "pukpes_data/principal_alias.csv"


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")


def muat_alias() -> dict:
    if not ALIAS.exists():
        return {}
    with ALIAS.open(encoding="utf-8-sig") as f:
        return {r["nama_asli"].strip().upper(): r["nama_kanonik"].strip()
                for r in csv.DictReader(f) if r.get("nama_asli")}


def bangun() -> dict:
    alias = muat_alias()
    per = defaultdict(lambda: {"names": defaultdict(int), "manufacturers": defaultdict(int),
                               "manufacturer_canonical": "", "registrations": []})
    total = 0
    for p in NDJSON:
        if not p.exists():
            continue
        for l in p.read_text(encoding="utf-8").splitlines():
            if not l.strip():
                continue
            r = json.loads(l)
            total += 1
            nama = (r["label"]["id"] or "").strip()
            prod = (r.get("manufacturer") or "").strip()
            kanon = alias.get(prod.upper(), prod)
            if not nama or not kanon:
                continue
            k = f"{slug(nama)}-{slug(kanon)}"[:120].strip("-")
            e = per[k]
            e["names"][nama] += 1
            e["manufacturers"][prod] += 1
            e["manufacturer_canonical"] = kanon
            e["registrations"].append({"id": r["id"], "label": nama,
                                       "number": r["registration"]["number"]})
    keluar = {}
    for k, e in per.items():
        utama = max(e["names"].items(), key=lambda x: (x[1], -len(x[0])))[0]
        keluar[k] = {
            "name": utama,
            "name_variants": sorted(n for n in e["names"] if n != utama),
            "manufacturer": max(e["manufacturers"].items(), key=lambda x: x[1])[0],
            "manufacturer_canonical": e["manufacturer_canonical"],
            "registrations": sorted(e["registrations"], key=lambda x: x["id"]),
        }
    return {"_total_pendaftaran": total, "merek": keluar}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--ringkas", action="store_true")
    ap.add_argument("--cari", metavar="op:prd:XXXXXXXX",
                    help="cetak blok brand/span siap tempel untuk satu pendaftaran")
    ap.add_argument("--principal", metavar="NAMA KANONIK",
                    help="daftar seluruh merek di bawah satu principal, untuk dicocokkan "
                         "ke produk yang tayang di situsnya")
    args = ap.parse_args()

    ix = bangun()

    if args.principal:
        target = args.principal.strip().upper()
        hit = {k: v for k, v in ix["merek"].items()
               if v["manufacturer_canonical"].upper() == target}
        if not hit:
            dekat = sorted({v["manufacturer_canonical"] for v in ix["merek"].values()
                            if target.split()[-1] in v["manufacturer_canonical"].upper()})
            print(f"Tidak ada principal bernama persis {args.principal!r}.", file=sys.stderr)
            if dekat:
                print("Mungkin maksudmu: " + " | ".join(dekat[:5]), file=sys.stderr)
            return 1
        print(f"# {len(hit)} merek di bawah {args.principal}", file=sys.stderr)
        print("# brand_key<TAB>nama dagang<TAB>span<TAB>nomor pendaftaran", file=sys.stderr)
        for k, v in sorted(hit.items(), key=lambda x: -len(x[1]["registrations"])):
            n = len(v["registrations"])
            nomor = ",".join(r["number"] for r in v["registrations"][:3])
            if n > 3:
                nomor += ",..."
            print(f"{k}\t{v['name']}\t{n}\t{nomor}")
        return 0

    if args.cari:
        for k, v in ix["merek"].items():
            hit = [r for r in v["registrations"] if r["id"] == args.cari]
            if not hit:
                continue
            blok = {
                "brand_key": k,
                "brand": {"name": v["name"], "manufacturer": v["manufacturer"],
                          "manufacturer_canonical": v["manufacturer_canonical"]},
                "span": {"registrations": len(v["registrations"]), "counted_at": "2026-08-20"},
            }
            if v["name_variants"]:
                blok["brand"]["name_variants"] = v["name_variants"]
            print(json.dumps(blok, ensure_ascii=False))
            print(f"# {len(v['registrations'])} pendaftaran di bawah merek ini; "
                  f"{args.cari} = {hit[0]['number']}", file=sys.stderr)
            if len(v["registrations"]) > 1:
                print("# span > 1: gambar hanya boleh dipersempit lewat bukti yang terbaca "
                      "di gambarnya (narrowed_to + narrowing).", file=sys.stderr)
            return 0
        print(f"{args.cari} tidak ada di registri.", file=sys.stderr)
        return 1
    m = ix["merek"]
    if not m:
        print("Registri produk tidak ditemukan.", file=sys.stderr)
        return 1

    uk = sorted((len(v["registrations"]) for v in m.values()), reverse=True)
    n1 = sum(1 for x in uk if x == 1)
    dlm1 = sum(x for x in uk if x == 1)
    print(f"Pendaftaran   : {ix['_total_pendaftaran']}")
    print(f"Merek         : {len(m)}")
    print(f"  span 1      : {n1} ({n1 / len(m) * 100:.1f}% merek, {dlm1} pendaftaran)")
    print(f"  span >1     : {len(m) - n1} ({ix['_total_pendaftaran'] - dlm1} pendaftaran "
          f"= {(ix['_total_pendaftaran'] - dlm1) / ix['_total_pendaftaran'] * 100:.1f}% ambigu)")
    print(f"  terbesar    : {uk[:6]}")
    gab = sum(1 for v in m.values() if v["name_variants"])
    print(f"  ejaan nama disatukan slug: {gab} merek")

    if not args.ringkas:
        p = Path(__file__).parent / "indeks-merek.json"
        p.write_text(json.dumps(ix, ensure_ascii=False), encoding="utf-8")
        print(f"\n{p.name} ditulis ({p.stat().st_size / 1024 / 1024:.1f} MB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
