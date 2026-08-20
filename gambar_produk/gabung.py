#!/usr/bin/env python3
"""Menggabung pecahan manifes tiap agen jadi satu manifes.ndjson.

Agen pemanen menulis ke berkasnya sendiri — manifes-agen-1.ndjson dan seterusnya —
supaya lima penulis bersamaan tidak saling menimpa satu berkas. Pelajaran yang sama
dengan yang tercatat di spec/00-konvensi-kerja-paralel.md, hanya bedanya di sini
pemisahannya per berkas, bukan per blok nomor.

    python3 gabung.py

Tabrakan sku_key+role antar-agen dilaporkan, tidak didiamkan: dua agen yang mengaku
punya "kemasan_depan" untuk SKU yang sama berarti salah satunya keliru sasaran.
"""

import json
import sys
from pathlib import Path

akar = Path(__file__).parent
pecahan = sorted(akar.glob("manifes-agen-*.ndjson"))
if not pecahan:
    print("Tidak ada pecahan manifes-agen-*.ndjson.", file=sys.stderr)
    sys.exit(1)

baris, asal, tabrakan, rusak = [], {}, [], []
for p in pecahan:
    n = 0
    for no, l in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
        if not l.strip():
            continue
        try:
            rec = json.loads(l)
        except json.JSONDecodeError as e:
            rusak.append(f"{p.name}:{no} {e}")
            continue
        k = (rec.get("sku_key"), rec.get("role"))
        if k in asal:
            tabrakan.append(f"{k[0]} | {k[1]} — {p.name} vs {asal[k]}")
            continue
        asal[k] = p.name
        baris.append(rec)
        n += 1
    print(f"  {p.name:26} {n:3} baris")

status = {}
for r in baris:
    s = r.get("review", {}).get("status", "?")
    status[s] = status.get(s, 0) + 1

(akar / "manifes.ndjson").write_text(
    "".join(json.dumps(r, ensure_ascii=False) + "\n" for r in baris), encoding="utf-8")

sku = {r.get("sku_key") for r in baris}
dapat = {r.get("sku_key") for r in baris if r.get("review", {}).get("status") != "ditolak"}
print(f"\nmanifes.ndjson: {len(baris)} baris dari {len(pecahan)} pecahan")
print(f"status        : " + " · ".join(f"{k} {v}" for k, v in sorted(status.items())))
print(f"cakupan       : {len(dapat)}/{len(sku)} SKU dapat gambar")
for t in tabrakan:
    print(f"TABRAKAN  {t}")
for r in rusak:
    print(f"RUSAK     {r}")
sys.exit(1 if (tabrakan or rusak) else 0)
