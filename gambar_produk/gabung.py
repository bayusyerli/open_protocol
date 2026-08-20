#!/usr/bin/env python3
"""Menggabung pecahan manifes tiap agen jadi satu manifes.ndjson.

Agen pemanen menulis ke berkasnya sendiri — manifes-agen-1.ndjson dan seterusnya —
supaya lima penulis bersamaan tidak saling menimpa satu berkas. Pelajaran yang sama
dengan yang tercatat di spec/00-konvensi-kerja-paralel.md, hanya bedanya di sini
pemisahannya per berkas, bukan per blok nomor.

    python3 gabung.py

Tabrakan brand_key+role antar-agen dilaporkan, tidak didiamkan: dua agen yang mengaku
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

baris, asal, tabrakan, digantikan, rusak = [], {}, [], [], []
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
        k = (rec.get("brand_key"), rec.get("role"))
        st = rec.get("review", {}).get("status")
        if k in asal:
            lama_i = asal[k][1]
            st_lama = baris[lama_i].get("review", {}).get("status")
            # Panen yang berhasil menggantikan tolakan lama. Itu bukan tabrakan melainkan
            # kemajuan: prospek yang dulu tertolak pagu unduh, lalu dipanen ulang dengan
            # pagu baru, harus menang atas baris tolakannya sendiri.
            if st_lama == "ditolak" and st != "ditolak":
                digantikan.append(f"{k[0]} | {k[1]} — {p.name} menggantikan tolakan di {asal[k][0]}")
                baris[lama_i] = rec
                asal[k] = (p.name, lama_i)
                n += 1
                continue
            if st == "ditolak" and st_lama != "ditolak":
                continue  # tolakan lama kalah dari panen yang sudah ada; diam saja
            tabrakan.append(f"{k[0]} | {k[1]} — {p.name} vs {asal[k][0]}")
            continue
        asal[k] = (p.name, len(baris))
        baris.append(rec)
        n += 1
    print(f"  {p.name:26} {n:3} baris")

status = {}
for r in baris:
    s = r.get("review", {}).get("status", "?")
    status[s] = status.get(s, 0) + 1

(akar / "manifes.ndjson").write_text(
    "".join(json.dumps(r, ensure_ascii=False) + "\n" for r in baris), encoding="utf-8")

merek = {r.get("brand_key") for r in baris}
dapat = {r.get("brand_key") for r in baris if r.get("review", {}).get("status") != "ditolak"}
print(f"\nmanifes.ndjson: {len(baris)} baris dari {len(pecahan)} pecahan")
print(f"status        : " + " · ".join(f"{k} {v}" for k, v in sorted(status.items())))
print(f"cakupan       : {len(dapat)}/{len(merek)} merek dapat gambar")
for d in digantikan:
    print(f"DIGANTIKAN {d}")
for t in tabrakan:
    print(f"TABRAKAN  {t}")
for r in rusak:
    print(f"RUSAK     {r}")
sys.exit(1 if (tabrakan or rusak) else 0)
