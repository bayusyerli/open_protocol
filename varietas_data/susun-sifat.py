"""Tarik empat medan sifat agronomi dari dokumen deskripsi yang MASIH bisa dibaca,
lalu tautkan ke op:vty dan — kalau ketahanannya menyebut nama ilmiah — ke op:pst.

Yang disimpan potongan VERBATIM, bukan tafsirannya. "Umur panen genjah" tetap
ditulis "genjah"; menerjemahkannya jadi angka berarti mengarang ketelitian yang
tidak ada di dokumennya.

Penautan varietas memakai DUA kunci — nama DAN komoditas. Nama saja pernah
menjodohkan Anggrek "Sexy Pink" dengan sebuah Aglaonema.
"""
import json, re, unicodedata
from pypdf import PdfReader

def normal(s):
    s = unicodedata.normalize('NFKD', (s or '').lower()).strip()
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()

vty = [json.loads(l) for l in open('spec/vocab/variety/varietas.ndjson', encoding='utf-8')]
pst = json.load(open('spec/vocab/pest.json', encoding='utf-8'))['items']
ilmiah = {}
for p in pst:
    for n in filter(None, [p.get('scientific_name'), p.get('accepted_scientific_name')]):
        ilmiah[normal(n)] = p

def cari_varietas(nama, komoditas):
    n, k = normal(nama), normal(komoditas)
    cal = [d for d in vty if normal(d['label']['id']) == n]
    if not cal:
        return None, 'nama tidak ada di op:vty'
    tepat = [d for d in cal if normal(d['commodity']['label']) == k]
    if tepat:
        return tepat[0], 'nama+komoditas'
    dekat = [d for d in cal if normal(d['commodity']['label']) in k or k in normal(d['commodity']['label'])]
    if dekat:
        return dekat[0], 'nama+komoditas sebagian'
    return None, f"nama cocok tapi komoditas tidak ({[d['commodity']['label'] for d in cal]})"

POLA = {
    'umur_panen':    r'(?i)umur\s+(?:mulai\s+)?panen\s*:?\s*([^\n]{2,90})',
    'potensi_hasil': r'(?i)potensi\s+hasil\s*:?\s*([^\n]{2,120})',
    # \b pada "tahan" mencegah "keTAHANan kesegaran kuntum" ikut tertangkap
    'ketahanan':     r'(?i)(?:ketahanan\s+terhadap|\btahan\s+terhadap|\btahan)\s*:?\s*([^\n]{3,160})',
    'ketinggian':    r'(?i)(?:ketinggian|dataran|beradaptasi)[^\n]{0,20}?:?\s*([^\n]{3,140})',
}

# Potongan yang lolos regex tapi tidak menyatakan apa-apa. Dibuang dengan
# syarat isi, bukan dengan daftar hitam: ketinggian wajib menyebut angka atau
# kelas dataran, dan potongan apa pun yang mulai di tengah kata dibuang.
KELAS_DATARAN = ('rendah', 'medium', 'menengah', 'tinggi')
def layak(medan, v):
    if re.match(r'^[a-z]{1,3}\s', v) and not v[0].isupper():
        if not re.match(r'^(di|ke|m|cm|g|kg|ton|hst|hss|hari)\b', v, re.I):
            return False
    if medan == 'ketinggian':
        return bool(re.search(r'\d', v)) or any(k in v.lower() for k in KELAS_DATARAN)
    if medan == 'umur_panen':
        return bool(re.search(r'\d', v)) or 'genjah' in v.lower() or 'dalam' in v.lower()
    return len(v) >= 4

uji = json.load(open('varietas_data/raw/uji-ekstraksi.json', encoding='utf-8'))
keluar, lewat = [], []
for x in uji:
    if x.get('panjang_teks', 0) <= 200:
        continue
    teks = '\n'.join((p.extract_text() or '') for p in PdfReader(x['berkas']).pages)
    medan = {}
    for k, pola in POLA.items():
        m = [re.sub(r'\s+', ' ', g).strip(' .;:') for g in re.findall(pola, teks)]
        vals, lihat = [], set()
        for g in m:
            if g.lower() not in lihat:
                lihat.add(g.lower()); vals.append(g)
        vals = [v for v in vals if layak(k, v)]
        if vals:
            medan[k + '_text'] = vals[:3]
    if not medan:
        lewat.append({**{k: x[k] for k in ('komoditas', 'varietas')}, 'alasan': 'tak satu pun medan terbaca'})
        continue
    d, cara = cari_varietas(x['varietas'], x['komoditas'])
    # tautkan OPT lewat nama ilmiah yang muncul di potongan ketahanan
    opt = []
    for frasa in medan.get('ketahanan_text', []):
        for nm, p in ilmiah.items():
            if nm and nm in normal(frasa) and p['id'] not in {o['id'] for o in opt}:
                opt.append({'id': p['id'], 'label': p['label']['id'], 'dari': frasa})
    keluar.append({
        'varietas_text': x['varietas'], 'komoditas_text': x['komoditas'],
        'variety': {'id': d['id'], 'label': d['label']['id'],
                    'commodity': d['commodity']['label']} if d else None,
        'penautan': cara, **medan,
        'ketahanan_opt': opt,
        'sumber': {'url': x['url'], 'sha256': x['sha256'], 'halaman': x['halaman']},
    })

json.dump(keluar, open('varietas_data/sifat-agronomi-benih.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print(f'rekaman bersifat: {len(keluar)} | dilewati: {len(lewat)}')
print(f'  tertaut op:vty : {sum(1 for k in keluar if k["variety"])}')
for k in ('umur_panen', 'potensi_hasil', 'ketahanan', 'ketinggian'):
    print(f'  {k:14}: {sum(1 for x in keluar if x.get(k + "_text"))}')
print(f'  ketahanan tertaut op:pst: {sum(1 for k in keluar if k["ketahanan_opt"])}')
for k in keluar:
    if k['ketahanan_opt']:
        print(f"    {k['varietas_text']} → " + ', '.join(f"{o['label']} ({o['id']})" for o in k['ketahanan_opt']))
for k in keluar:
    if not k['variety']:
        print(f"  TIDAK TERTAUT: {k['varietas_text']} / {k['komoditas_text']} — {k['penautan']}")
