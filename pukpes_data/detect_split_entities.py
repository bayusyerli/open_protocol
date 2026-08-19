import json, csv, re, collections

s=json.load(open("raw/pupuk_terdaftar.json"))
l=json.load(open("raw/pupuk_terdaftar_legacy.json"))
p=json.load(open("raw/pestisida_terdaftar.json"))
PFX=re.compile(r'^(PT|CV|UD|PD|PERUM|FIRMA|FA|KOPERASI|KUD|KOP|NV|TB)\b\.?\s*', re.I)
def split(name):
    if not name: return (None,"")
    x=re.sub(r'\s+',' ', name.upper().replace('.',' ').replace(',',' ')).strip()
    t=None
    while True:
        m=PFX.match(x)
        if not m: break
        if t is None: t=m.group(1).upper()
        x=PFX.sub('',x).strip()
    return (t, re.sub(r'\s+',' ',x).strip())

reg=collections.defaultdict(lambda:{"types":collections.Counter(),"simpel":0,"legacy":0,"pest":0})
for r in s:
    _,c=split(r.get("perusahaanName"))
    if c: reg[c]["simpel"]+=1
for r in l:
    t,c=split(r.get("pemegang_nomor_pendaftaran"))
    if c:
        reg[c]["legacy"]+=1
        if t: reg[c]["types"][t]+=1
for r in p:
    tp=split(r.get("jenisPerseroan"))[0]
    _,c=split(r.get("perusahaanName"))
    if c:
        reg[c]["pest"]+=1
        if tp: reg[c]["types"][tp]+=1
tot=lambda c: reg[c]["simpel"]+reg[c]["legacy"]+reg[c]["pest"]

df=collections.Counter()
for c in reg:
    for tk in set(c.split()): df[tk]+=1

def is_prefix(a,b):
    ta,tb=a.split(),b.split()
    return len(ta)<len(tb) and tb[:len(ta)]==ta

# Detektor 1: core identik >=2 tipe
d1=[(c,dict(reg[c]["types"])) for c in reg if len(reg[c]["types"])>=2]
d1.sort(key=lambda x:-tot(x[0]))

# Detektor 2: klaster token-depan langka (df<=10), >=2 core, + sinyal
STOP={"PT","CV","UD"}
lead=collections.defaultdict(set)
for c in reg:
    toks=c.split()
    if toks and df[toks[0]]<=10 and len(toks[0])>=4:
        lead[toks[0]].add(c)

fam=[]
for tok,members in lead.items():
    members=[m for m in members if tot(m)>0]
    if len(members)<2: continue
    types=set(); 
    for m in members: types|=set(reg[m]["types"])
    cv_pt = ("PT" in types) and (("CV" in types) or ("UD" in types))
    prefix_rel = any(is_prefix(a,b) for a in members for b in members if a!=b)
    legacy_only=[m for m in members if reg[m]["legacy"]>0 and reg[m]["simpel"]==0 and reg[m]["pest"]==0]
    fresh     =[m for m in members if reg[m]["simpel"]>0]
    regen = bool(legacy_only) and bool(fresh)
    if not (cv_pt or prefix_rel or regen): continue
    conf = "TINGGI" if cv_pt else ("SEDANG-TINGGI" if (prefix_rel and regen) else "SEDANG")
    sig=[]
    if cv_pt: sig.append("CV↔PT")
    if prefix_rel: sig.append("induk⊂perluasan")
    if regen: sig.append("legacy↔baru")
    fam.append((conf, tok, sorted(members,key=lambda m:-tot(m)), sum(tot(m) for m in members), " + ".join(sig)))
order={"TINGGI":0,"SEDANG-TINGGI":1,"SEDANG":2}
fam.sort(key=lambda x:(order[x[0]], -x[3]))

print(f"=== DETEKTOR 1: nama identik di >=2 bentuk badan usaha ({len(d1)}) ===")
for c,ty in d1:
    print(f"  [{'/'.join(f'{k}×{v}' for k,v in ty.items())}]  {c}  (simpel {reg[c]['simpel']}, legacy {reg[c]['legacy']}, pest {reg[c]['pest']})")

print(f"\n=== DETEKTOR 2: keluarga entitas (klaster merek langka) — {len(fam)} grup ===")
for conf,tok,members,t,sig in fam[:22]:
    print(f"\n  [{conf}] «{tok}»  total {t} produk  — sinyal: {sig}")
    for m in members:
        d=reg[m]; ty="/".join(f"{k}×{v}" for k,v in d["types"].items()) or "—(SIMPEL)"
        print(f"     [{ty:<10}] {m}  (simpel {d['simpel']}, legacy {d['legacy']}, pest {d['pest']})")

with open("grup_entitas_terpecah.csv","w",newline="",encoding="utf-8-sig") as f:
    w=csv.writer(f); w.writerow(["confidence","grup_merek","sinyal","entitas_core","tipe","simpel","legacy","pest","total"])
    for c,ty in d1:
        w.writerow(["TINGGI(identik)",c,"nama identik multi-tipe",c,"/".join(f"{k}×{v}" for k,v in ty.items()),reg[c]["simpel"],reg[c]["legacy"],reg[c]["pest"],tot(c)])
    for conf,tok,members,t,sig in fam:
        for m in members:
            d=reg[m]
            w.writerow([conf,tok,sig,m,"/".join(f"{k}×{v}" for k,v in d["types"].items()),d["simpel"],d["legacy"],d["pest"],tot(m)])
print(f"\nSaved grup_entitas_terpecah.csv  (D1={len(d1)} grup, D2={len(fam)} grup)")
