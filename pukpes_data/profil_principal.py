import json, csv, re, sys, collections
from datetime import date

QUERY = " ".join(sys.argv[1:]) or "SAPROTAN"
TODAY = date(2026,8,19)
toks = QUERY.upper().split()

s=json.load(open("raw/pupuk_terdaftar.json"))
l=json.load(open("raw/pupuk_terdaftar_legacy.json"))
p=json.load(open("raw/pestisida_terdaftar.json"))
norm=lambda v: re.sub(r'\s+',' ',(v or '')).strip().upper()
match=lambda nm: all(t in norm(nm) for t in toks)

def parse(d):
    if not d: return None
    d=str(d).strip()
    m=re.match(r'^(\d{4})-(\d{2})-(\d{2})', d)
    if m: return date(int(m[1]),int(m[2]),int(m[3]))
    if re.match(r'^\d{4}$', d): return date(int(d),12,31)
    return None
def status(bd):
    if bd is None: return "?"
    if bd < TODAY: return "Kedaluwarsa"
    if bd <= date(2027,8,19): return "≤12 bln"
    if bd <= date(2028,8,19): return "≤24 bln"
    return "Aktif"
def ba(js):
    try: return ", ".join(f"{x['namaBahan'].strip()} {x.get('kadarBahan','')}{x.get('satuanBahan','')}".strip() for x in js)
    except: return ""

rows=[]  # sektor, entitas, merk, jenis, detail, no_daftar, terbit, berakhir, status
ent=collections.Counter()
for r in s:
    if match(r.get("perusahaanName")):
        e=norm(r.get("perusahaanName")); ent[("Pupuk-SIMPEL",e)]+=1
        bd=parse(r.get("tgl_berakhir"))
        rows.append(["Pupuk-SIMPEL",r.get("perusahaanName",""),r.get("merkDagang",""),
            re.sub(r'\s+',' ',(r.get("jenisName") or "")).strip() or "(tdk tercantum)",
            r.get("bentuk_formula",""),r.get("noPendaftaran",""),
            r.get("tgl_terbit",""),r.get("tgl_berakhir",""),status(bd)])
for r in l:
    if match(r.get("pemegang_nomor_pendaftaran")):
        e=norm(r.get("pemegang_nomor_pendaftaran")); ent[("Pupuk-Legacy",e)]+=1
        bd=parse(r.get("tanggal_berakhir"))
        rows.append(["Pupuk-Legacy",r.get("pemegang_nomor_pendaftaran",""),r.get("merk_dagang",""),
            r.get("jenis_formula","") or "(kosong)", r.get("bentuk_formula",""),
            r.get("nomor_pendaftaran",""),str(r.get("tanggal_terbit","")),str(r.get("tanggal_berakhir","")),status(bd)])
for r in p:
    if match(r.get("perusahaanName")):
        full=f'{r.get("jenisPerseroan","")} {r.get("perusahaanName","")}'.strip()
        e=norm(r.get("perusahaanName")); ent[("Pestisida",norm(full))]+=1
        bd=parse(r.get("TanggalBerakhir"))
        rows.append(["Pestisida",full,r.get("namaProduk",""),r.get("JenisPestisidaNama",""),
            ba(r.get("bahanAktif",[])),r.get("nomorPendaftaran",""),
            r.get("TanggalTerbit",""),r.get("TanggalBerakhir",""),status(bd)])

print(f"### Varian entitas untuk '{QUERY}' (per sumber):")
for (sek,e),c in sorted(ent.items(), key=lambda x:-x[1]):
    print(f"  {c:>4}  [{sek:<12}] {e}")

# ringkasan
print(f"\nTotal produk cocok: {len(rows)}")
bysek=collections.Counter(r[0] for r in rows)
byjen=collections.Counter(r[3] for r in rows)
byst =collections.Counter(r[8] for r in rows)
print("Per sektor:", dict(bysek))
print("Status kedaluwarsa:", dict(byst))
print("Jenis teratas:", byjen.most_common(8))
bd=[parse(r[7]) for r in rows if parse(r[7])]
if bd: print(f"Rentang berakhir: {min(bd)}  →  {max(bd)}")

# simpan CSV (urut tgl berakhir)
def keyd(r):
    d=parse(r[7]); return d.toordinal() if d else 0
rows.sort(key=keyd)
slug=re.sub(r'[^a-z0-9]+','_',QUERY.lower()).strip('_')
out=f"profil_{slug}.csv"
with open(out,"w",newline="",encoding="utf-8-sig") as f:
    w=csv.writer(f); w.writerow(["sektor","entitas","merk_dagang","jenis","detail_bentuk_atau_bahan_aktif","no_pendaftaran","tgl_terbit","tgl_berakhir","status"])
    w.writerows(rows)
print("Saved:", out)
