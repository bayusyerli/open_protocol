"""Sensus ketersediaan tautan deskripsi PROSEED — db-vardaf + db-varsan.

Menjawab satu pertanyaan: dari 5.095 baris yang tabelnya masih hidup, berapa
dokumen deskripsinya yang masih bisa diambil? Hasilnya menentukan apakah no. 14
punya jalan murah sama sekali.
"""
import json, subprocess, collections
from concurrent.futures import ThreadPoolExecutor

TARGET = []
for berkas, medan, asal in [('varietas_data/vardaf-indeks.json', 'sk_pdf', 'db-vardaf'),
                            ('varietas_data/varsan-indeks.json', 'deskripsi', 'db-varsan')]:
    for o in json.load(open(berkas, encoding='utf-8')):
        if o.get(medan):
            TARGET.append({'asal': asal, 'komoditas': o['komoditas'],
                           'varietas': o['varietas'], 'url': o[medan]})

def cek(o):
    r = subprocess.run(['curl', '-sS', '-I', '-L', '--max-time', '25', '-o', '/dev/null',
                        '-w', '%{http_code} %{size_download} %{content_type}', o['url']],
                       capture_output=True, text=True)
    bagian = r.stdout.strip().split()
    return {**o, 'kode': bagian[0] if bagian else 'gagal',
            'tipe': bagian[2] if len(bagian) > 2 else ''}

hasil = []
with ThreadPoolExecutor(max_workers=6) as ex:
    for i, h in enumerate(ex.map(cek, TARGET)):
        hasil.append(h)
        if i % 500 == 0:
            print(f'  {i}/{len(TARGET)}', flush=True)

json.dump(hasil, open('varietas_data/raw/sensus-tautan.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
agg = collections.defaultdict(collections.Counter)
for h in hasil:
    agg[h['asal']][h['kode']] += 1
for k, v in agg.items():
    print(f'{k}: {dict(v)}')
hidup = [h for h in hasil if h['kode'] == '200']
print(f'HIDUP TOTAL: {len(hidup)} dari {len(hasil)}')
print('komoditas hidup:', collections.Counter(h['komoditas'] for h in hidup).most_common(15))
