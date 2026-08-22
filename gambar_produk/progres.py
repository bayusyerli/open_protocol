#!/usr/bin/env python3
"""Membangkitkan tabel kemajuan panen gambar kemasan.

    python3 progres.py            # tulis PROGRES.md
    python3 progres.py --cetak    # cetak ke layar saja

Dibangkitkan, bukan ditulis tangan. Angka yang disalin tangan basi pada gelombang
berikutnya dan tidak ada yang menyadarinya; angka yang dibangkitkan basi hanya sampai
perintah ini dijalankan lagi.

Sumbernya tiga: manifes.ndjson (apa yang dipanen), principal-antrean.csv (situs mana
yang sudah diperiksa), dan indeks-merek.json (denominatornya).
"""

import argparse
import collections
import csv
import json
import re
import sys
from pathlib import Path

AKAR = Path(__file__).resolve().parent
TEKNIS = re.compile(r"\b(\d{2,3}(\.\d+)?\s*%?\s*)?(TC|TK)\b\s*$", re.I)
LAYAK = {"ada", "tipis"}


def muat():
    ix = json.loads((AKAR / "indeks-merek.json").read_text(encoding="utf-8"))["merek"]
    man = [json.loads(l) for l in (AKAR / "manifes.ndjson").read_text(encoding="utf-8").splitlines() if l.strip()]
    with (AKAR / "principal-antrean.csv").open(encoding="utf-8") as f:
        antrean = list(csv.DictReader(f))
    return ix, man, antrean


def n(x) -> str:
    """Pemisah ribuan gaya Indonesia: titik, bukan koma."""
    return format(x, ",").replace(",", ".")


def bar(bagian: int, dari: int, lebar: int = 24) -> str:
    if not dari:
        return " " * lebar
    isi = round(bagian / dari * lebar)
    return "█" * isi + "·" * (lebar - isi)


def bangun() -> str:
    ix, man, antrean = muat()
    O = []
    w = O.append

    dicoba = {r["brand_key"] for r in man}
    dapat = {r["brand_key"] for r in man if r["review"]["status"] != "ditolak"}
    tolak = {r["brand_key"] for r in man} - dapat
    teknis = {k for k, v in ix.items() if TEKNIS.search(v["name"].strip())}
    per_principal = collections.Counter(v["manufacturer_canonical"] for v in ix.values())
    diperiksa = {r["principal_kanonik"] for r in antrean if r["status_situs"] != "belum-diperiksa"}
    layak = {r["principal_kanonik"] for r in antrean if r["status_situs"] in LAYAK}
    merek_diperiksa = sum(per_principal[p] for p in diperiksa)
    merek_layak = sum(per_principal[p] for p in layak)

    w("# Kemajuan panen gambar kemasan\n")
    w("Dibangkitkan `progres.py`. Jangan disunting tangan — jalankan ulang.\n")

    # --- corong utama ---
    jml = len(ix)
    w("## Corong\n")
    w("| Tahap | Merek | Dari | |")
    w("|---|---:|---:|---|")
    baris = [
        ("Terdaftar di registri", jml, jml),
        ("Bisa berkemasan eceran", jml - len(teknis), jml),
        ("Situs principal sudah diperiksa", merek_diperiksa, jml),
        ("Principal-nya bersitus layak", merek_layak, jml),
        ("Sudah dicoba dipanen", len(dicoba), jml),
        ("**Bergambar**", len(dapat), jml),
    ]
    for nama, x, dari in baris:
        w(f"| {nama} | {n(x)} | {n(dari)} | `{bar(x, dari)}` {x/dari*100:.1f}% |")
    w("")
    w(f"Yang dicoret di depan: **{n(len(teknis))} merek bahan teknis** berakhiran `TC`/`TK` — "
      f"dijual per drum, tidak pernah berkemasan eceran.\n")

    # --- hasil panen ---
    berkas = [f for r in man for f in [r.get("file")] + r.get("variants", []) if f]
    peran = collections.Counter(r["role"] for r in man if r["review"]["status"] != "ditolak")
    w("## Yang terkumpul\n")
    w("| | |")
    w("|---|---:|")
    w(f"| Baris manifes | {n(len(man))} |")
    w(f"| Merek bergambar | {n(len(dapat))} |")
    w(f"| Merek ditolak beralasan | {n(len(tolak))} |")
    w(f"| Berkas ternormalkan | {n(len(berkas))} |")
    w(f"| Ukuran total | {sum(f['bytes'] for f in berkas)/1024/1024:.1f} MB |")
    w(f"| Dipersempit ke satu pendaftaran | {n(sum(1 for r in man if r.get('narrowed_to')))} baris |")
    w("")
    w("Peran gambar: " + " · ".join(f"**{v}** {k}" for k, v in peran.most_common()) + "\n")

    # --- bukti ---
    pr = [r["printed_registration"] for r in man if r.get("printed_registration")]
    ada_reg = sum(1 for x in pr if x["in_registry"])
    milik = sum(1 for x in pr if x.get("matches_brand"))
    w("## Kekuatan bukti\n")
    w("| Ukuran | Jumlah | Catatan |")
    w("|---|---:|---|")
    w(f"| Nomor pendaftaran terbaca dari gambar | {n(len(pr))} | |")
    w(f"| …ada di registri | {n(ada_reg)} | selisih {len(pr)-ada_reg} tidak ada |")
    w(f"| …**dan** milik mereknya sendiri | {n(milik)} | selisih {ada_reg-milik} milik merek lain |")
    q = collections.Counter()
    for r in man:
        for k, v in (r.get("quality") or {}).items():
            if v is True:
                q[k] += 1
    for k in ("komposisi_terbaca", "tampak_sintetis", "bentuk_kemasan_generik",
              "watermark", "overlay_promosi", "penambal", "gambar_dari_dokumen"):
        if q.get(k):
            w(f"| `{k}` | {n(q[k])} | |")
    w("")

    # --- per principal yang sudah disentuh ---
    per_dapat = collections.Counter(ix[k]["manufacturer_canonical"] for k in dapat if k in ix)
    situs = {r["principal_kanonik"]: r for r in antrean}
    w("## Principal yang sudah dipanen\n")
    w("| Principal | Bergambar | Merek | | Situs |")
    w("|---|---:|---:|---|---|")
    for p, got in sorted(per_dapat.items(), key=lambda x: -x[1]):
        tot = per_principal[p]
        s = (situs.get(p, {}).get("situs") or "—")[:34]
        w(f"| {p[:40]} | {got} | {tot} | `{bar(got, tot, 14)}` | {s} |")
    w("")

    # --- status situs ---
    st = collections.Counter(r["status_situs"] for r in antrean)
    arti = {"ada": "galeri layak panen", "tipis": "galeri kecil atau resolusi rendah",
            "kosong": "situs sehat, gambar belum diunggah — **periksa ulang berkala**",
            "rusak": "situs ada tapi tak berfungsi", "mati": "domain bukan milik principal lagi",
            "tidak-ada": "tidak pernah punya situs",
            "belum-diperiksa": "belum disentuh sapuan"}
    w("## Status situs principal\n")
    w("| Status | Principal | Merek | Artinya |")
    w("|---|---:|---:|---|")
    for s, c in st.most_common():
        mk = sum(per_principal[r["principal_kanonik"]] for r in antrean if r["status_situs"] == s)
        w(f"| `{s}` | {n(c)} | {n(mk)} | {arti.get(s,'')} |")
    w("")
    sisa = sum(int(r["merek_belum_dipanen"]) for r in antrean)
    w(f"**Sisa: {n(sisa)} merek.** Prospek yang sudah dipetakan dan tinggal dipanen ada di "
      f"[`PANDUAN-PANEN.md`](PANDUAN-PANEN.md) pasal 13.\n")
    return "\n".join(O)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--cetak", action="store_true", help="cetak ke layar, jangan tulis berkas")
    a = ap.parse_args()
    isi = bangun()
    if a.cetak:
        print(isi)
    else:
        (AKAR / "PROGRES.md").write_text(isi + "\n", encoding="utf-8")
        print(f"PROGRES.md ditulis ({len(isi.splitlines())} baris)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
