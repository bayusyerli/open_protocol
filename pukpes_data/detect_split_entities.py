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
    _,c=split(r.get("perusahaanName"));       c and reg[c].__setitem__("simpel",reg[c]["simpel"]+1)
for r in l:
    t,c=split(r.get("pemegang_nomor_pendaftaran"))
    if c:
        reg[c]["legacy"]+=1
        if t: reg[c]["types"][t]+=1
for r in p:
    tp=split(r.get("jenisPerseroan"))[0]; _,c=split(r.get("perusahaanName"))
    if c:
        reg[c]["pest"]+=1
        if tp: reg[c]["types"][tp]+=1
cores=[c for c in reg if (reg[c]["simpel"]+reg[c]["legacy"]+reg[c]["pest"])>0]
tot=lambda c: reg[c]["simpel"]+reg[c]["legacy"]+reg[c]["pest"]
df=collections.Counter()
for c in cores:
    for tk in set(c.split()): df[tk]+=1

def lev(a,b):
    if abs(len(a)-len(b))>2: return 9
    prev=list(range(len(b)+1))
    for i,ca in enumerate(a,1):
        cur=[i]
        for j,cb in enumerate(b,1):
            cur.append(min(prev[j]+1,cur[-1]+1,prev[j-1]+(ca!=cb)))
        prev=cur
    return prev[-1]
def is_prefix(a,b):
    ta,tb=a.split(),b.split(); return len(ta)<len(tb) and tb[:len(ta)]==ta
GEN={"INDONESIA","NUSANTARA","TBK","PT","PERSERO","GROUP","INTERNASIONAL","INDO",
     "AGRO","AGRI","KIMIA","CHEMICAL","GRESIK","PERKASA"}

# --- pasangan struktural dalam bucket token-depan ---
bucket=collections.defaultdict(list)
for c in cores: bucket[c.split()[0]].append(c)
parent={c:c for c in cores}
def find(x):
    while parent[x]!=x: parent[x]=parent[parent[x]]; x=parent[x]
    return x
def union(a,b): parent[find(a)]=find(b)
edges={}
for tk,mem in bucket.items():
    for i in range(len(mem)):
        for j in range(i+1,len(mem)):
            a,b=mem[i],mem[j]
            rel=None
            if is_prefix(a,b) or is_prefix(b,a):
                base,ext=(a,b) if is_prefix(a,b) else (b,a)
                extra=ext.split()[len(base.split()):]
                rel="identik+suffix" if all(e in GEN for e in extra) else "induk⊂perluasan"
            elif len(a.split())==len(b.split()) and lev(a,b)<=2 and min(len(a),len(b))>=8:
                rel="ejaan-mirip"
            if rel:
                union(a,b); edges[frozenset((a,b))]=rel

# --- identik multi-tipe (CV & PT sekaligus pd nama sama) = grup 1-anggota tapi kuat ---
groups=collections.defaultdict(set)
for c in cores: groups[find(c)].add(c)
groups={k:v for k,v in groups.items() if len(v)>=2}

def conf(members):
    ms=set(members)
    rels={edges[e] for e in edges if len(e&ms)==2}
    types=set(); 
    for m in members: types|=set(reg[m]["types"])
    cvpt=("PT" in types) and (("CV" in types) or ("UD" in types))
    if "ejaan-mirip" in rels or "identik+suffix" in rels: return "TINGGI", rels, cvpt, types
    # induk⊂perluasan: kuat jika token depan langka
    lead_rare = df[list(members)[0].split()[0]]<=12
    return ("SEDANG-TINGGI" if (cvpt and lead_rare) else "SEDANG"), rels, cvpt, types

out=[]
for _,members in groups.items():
    members=sorted(members,key=lambda m:-tot(m))
    cf,rels,cvpt,types=conf(members)
    out.append((cf,members,sum(tot(m) for m in members),rels,cvpt,types))
# tambah D1 identik multi-tipe yg belum tergabung
for c in cores:
    if len(reg[c]["types"])>=2 and find(c)==c and c not in [m for _,ms,*_ in out for m in ms]:
        out.append(("TINGGI",[c],tot(c),{"identik-multitipe"},True,set(reg[c]["types"])))
rank={"TINGGI":0,"SEDANG-TINGGI":1,"SEDANG":2}
out.sort(key=lambda x:(rank[x[0]],-x[2]))

print(f"Core unik: {len(cores)} | grup struktural: {len(out)}")
for cf,members,t,rels,cvpt,types in out:
    tag=("CV↔PT " if cvpt else "")+";".join(sorted(rels))
    print(f"\n[{cf}] total {t}  ({tag})")
    for m in members:
        d=reg[m]; ty="/".join(f"{k}×{v}" for k,v in d["types"].items()) or "—"
        print(f"    [{ty:<9}] {m}  (s{d['simpel']}/l{d['legacy']}/p{d['pest']})")

with open("grup_entitas_terpecah.csv","w",newline="",encoding="utf-8-sig") as f:
    w=csv.writer(f); w.writerow(["confidence","relasi","cv_pt","entitas_core","tipe","simpel","legacy","pest","total_grup"])
    for cf,members,t,rels,cvpt,types in out:
        for m in members:
            d=reg[m]
            w.writerow([cf,";".join(sorted(rels)),"ya" if cvpt else "-",m,
                        "/".join(f"{k}×{v}" for k,v in d["types"].items()),d["simpel"],d["legacy"],d["pest"],t])
print(f"\nSaved grup_entitas_terpecah.csv ({len(out)} grup)")
