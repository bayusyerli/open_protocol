"""Unduh 77 dokumen deskripsi PROSEED yang masih hidup, lalu uji apakah keempat
medan sifat agronomi benar-benar bisa dibaca dari dalamnya.

Ini uji premis, bukan panen skala penuh: kalau medannya tidak terbaca di 77
dokumen yang tersedia, tidak ada gunanya mengejar sisanya lewat jalur mana pun.
"""
import json, os, re, subprocess, hashlib
from concurrent.futures import ThreadPoolExecutor

SENSUS = 'varietas_data/raw/sensus-tautan.json'
KELUAR = 'varietas_data/raw/sk'
os.makedirs(KELUAR, exist_ok=True)

hidup = [h for h in json.load(open(SENSUS, encoding='utf-8')) if h['kode'] == '200']
print(f'dokumen hidup: {len(hidup)}', flush=True)

def unduh(o):
    nama = re.sub(r'[^a-z0-9]+', '-', f"{o['asal']}-{o['komoditas']}-{o['varietas']}".lower()).strip('-')[:80]
    ext = o['url'].rsplit('.', 1)[-1].lower()
    if ext not in ('pdf', 'doc', 'docx', 'jpg', 'png'):
        ext = 'bin'
    jalur = f'{KELUAR}/{nama}.{ext}'
    r = subprocess.run(['curl', '-sS', '-L', '--max-time', '120', '-o', jalur,
                        '-w', '%{http_code}'], capture_output=True, text=True) if False else \
        subprocess.run(['curl', '-sS', '-L', '--max-time', '120', '-o', jalur, '-w', '%{http_code}', o['url']],
                       capture_output=True, text=True)
    if not os.path.exists(jalur):
        return {**o, 'berkas': None}
    b = open(jalur, 'rb').read()
    return {**o, 'berkas': jalur, 'bytes': len(b), 'kode_unduh': r.stdout.strip(),
            'sha256': hashlib.sha256(b).hexdigest(), 'magic': b[:5].decode('latin-1')}

with ThreadPoolExecutor(max_workers=4) as ex:
    berkas = list(ex.map(unduh, hidup))

pdf = [b for b in berkas if b.get('magic', '').startswith('%PDF')]
print(f'benar-benar PDF: {len(pdf)} dari {len(berkas)}', flush=True)

# --- uji ekstraksi medan ---
from pypdf import PdfReader
MEDAN = {
    'potensi_hasil': r'potensi\s+(hasil|produksi)',
    'umur_panen':    r'umur\s+(panen|mulai\s+panen|tanaman|berbunga)',
    'ketahanan':     r'(ketahanan|tahan\s+terhadap|toleran)',
    'ketinggian':    r'(ketinggian|dpl|dataran\s+(rendah|tinggi|medium))',
    'anjuran':       r'(daerah\s+adaptasi|beradaptasi|anjuran)',
}
hasil = []
for b in pdf:
    try:
        r = PdfReader(b['berkas'])
        teks = '\n'.join((h.extract_text() or '') for h in r.pages)
    except Exception as e:
        hasil.append({**b, 'galat': str(e)[:120]}); continue
    rendah = teks.lower()
    hasil.append({**b, 'halaman': len(r.pages), 'panjang_teks': len(teks),
                  **{k: bool(re.search(v, rendah)) for k, v in MEDAN.items()}})

json.dump(hasil, open('varietas_data/raw/uji-ekstraksi.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)

berteks = [h for h in hasil if h.get('panjang_teks', 0) > 200]
print(f'PDF berlapis teks (>200 aksara): {len(berteks)} dari {len(pdf)}')
for k in MEDAN:
    print(f'  {k:16} terbaca di {sum(1 for h in berteks if h.get(k))} dari {len(berteks)}')
kosong = [h for h in hasil if h.get('panjang_teks', 0) <= 200 and 'galat' not in h]
print(f'PDF tanpa lapisan teks (kemungkinan pindaian): {len(kosong)}')
