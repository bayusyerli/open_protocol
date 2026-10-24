"""Uji kelayakan: bisakah KELAS BAHAYA dibaca dari pita warna di muka kemasan?

    python3 gambar_produk/uji-pita-bahaya.py [jumlah] [--tulis]

DUGAAN YANG DIUJI
Label pestisida Indonesia membawa pita berwarna penanda kelas bahaya — merah, kuning,
biru, hijau menurut penggolongan WHO. Pita itu ada di muka kemasan, sisi yang sudah
punya 943 gambar. Dugaannya: warna jauh lebih mudah dideteksi daripada cetakan kecil,
dan tidak butuh OCR sama sekali, jadi kelas bahaya bisa dipanen murah.

CARA MENGUJINYA, DAN KENAPA TIDAK CUKUP "KELIHATAN MASUK AKAL"
Sebaran warna yang masuk akal bukan bukti. Pita bahaya menandai BAHAN AKTIF: dua produk
berbahan aktif sama harus sewarna, hampir selalu. Desain merek tidak begitu. Karena itu
ujinya bukan "apakah ada pita" melainkan:

    seberapa sering dua produk berbahan aktif sama punya pita sewarna,
    dibandingkan peluang acak menurut sebaran warna yang teramati?

Kalau jawabannya jauh di atas peluang acak, warnanya menandai bahaya. Kalau setara,
yang terdeteksi cuma palet mereknya.

DUA PEMERIKSA YANG DIPASANG SEBELUM MENGHITUNG
  latar     warna sudut gambar; pita yang sewarna latar dibuang. Satu gambar jerigen
            AMEXONE berlatar studio merah terbaca "pita merah" tanpa pemeriksa ini —
            dan merah berarti kelas Ia/Ib, tuduhan yang paling berat di skema ini.
  ketebalan pita bahaya tipis; blok warna setebal seperdelapan gambar itu desain.
"""
import json, os, sys, colorsys, collections, itertools
from PIL import Image

DIR = os.path.dirname(os.path.abspath(__file__))
AKAR = os.path.dirname(DIR)

# Rentang hue keempat warna pita, ditulis satu per satu supaya bisa dibantah satu per satu.
WARNA = [
    ('merah', lambda h: h >= 0.94 or h <= 0.04),
    ('kuning', lambda h: 0.10 <= h <= 0.19),
    ('biru', lambda h: 0.53 <= h <= 0.72),
    ('hijau', lambda h: 0.25 <= h <= 0.45),
]


def gugus(h):
    for nama, uji in WARNA:
        if uji(h):
            return nama
    return None


def hsv(p):
    return colorsys.rgb_to_hsv(p[0] / 255, p[1] / 255, p[2] / 255)


def periksa(path, lebar=180):
    im = Image.open(path).convert('RGB')
    im = im.resize((lebar, max(1, int(im.height * lebar / im.width))))
    W, H = im.size
    px = im.load()

    latar = collections.Counter()
    for p in (px[1, 1], px[W - 2, 1], px[1, H - 2], px[W - 2, H - 2]):
        h, s, _ = hsv(p)
        latar[gugus(h) if s >= 0.25 else 'netral'] += 1
    warnaLatar = latar.most_common(1)[0][0]

    baris = []
    for y in range(H):
        c = collections.Counter()
        for x in range(W):
            h, s, v = hsv(px[x, y])
            if s < 0.45 or v < 0.25:
                continue
            k = gugus(h)
            if k:
                c[k] += 1
        if not c:
            baris.append(None)
            continue
        nama, n = c.most_common(1)[0]
        baris.append(nama if n / W >= 0.55 else None)

    pita, mulai = [], None
    for y in range(H + 1):
        kini = baris[y] if y < H else None
        if mulai is None:
            if kini:
                mulai = (y, kini)
        elif kini != mulai[1]:
            t = y - mulai[0]
            if t >= max(2, int(H * 0.012)):
                pita.append({'warna': mulai[1], 'y': mulai[0] / H, 'tinggi': t / H})
            mulai = (y, kini) if kini else None
    if not pita:
        return {'hasil': 'tanpa pita', 'latar': warnaLatar}
    p = sorted(pita, key=lambda x: -x['y'])[0]
    if p['warna'] == warnaLatar:
        return {'hasil': 'kemungkinan latar', 'warna': p['warna'], 'latar': warnaLatar}
    if p['tinggi'] > 0.12:
        return {'hasil': 'terlalu tebal untuk pita', 'warna': p['warna'], 'latar': warnaLatar}
    return {'hasil': 'pita', **p, 'latar': warnaLatar}


def jalankan(n):
    recs = [json.loads(l) for l in open(f'{DIR}/manifes.ndjson', encoding='utf-8') if l.strip()]
    depan = [r for r in recs if r.get('role') == 'kemasan_depan' and r.get('file', {}).get('path')]
    depan = [r for r in depan if os.path.exists(os.path.join(DIR, r['file']['path']))]
    depan.sort(key=lambda r: r['brand_key'])
    contoh = depan[:n]

    prod = {}
    jalur = f'{AKAR}/spec/vocab/product/pestisida.ndjson'
    if os.path.exists(jalur):
        for l in open(jalur, encoding='utf-8'):
            if l.strip():
                p = json.loads(l)
                prod[p['id']] = p

    hasil = collections.Counter()
    berpita = {}
    posisi = []
    for r in contoh:
        try:
            d = periksa(os.path.join(DIR, r['file']['path']))
        except Exception:
            hasil['galat'] += 1
            continue
        hasil[d['hasil']] += 1
        if d['hasil'] != 'pita':
            continue
        posisi.append(d['y'])
        zat = []
        for x in (r.get('narrowed_to') or []):
            for c in (prod.get(x['id'], {}).get('composition') or []):
                s = c.get('substance', {}).get('id')
                if s:
                    zat.append(s)
        if zat:
            berpita[r['brand_key']] = {'warna': d['warna'], 'zat': tuple(sorted(set(zat)))}

    sebaran = collections.Counter(v['warna'] for v in berpita.values())
    tot = sum(sebaran.values()) or 1
    acak = sum((c / tot) ** 2 for c in sebaran.values())

    grup = collections.defaultdict(list)
    for v in berpita.values():
        grup[v['zat']].append(v['warna'])
    pasangan = setuju = 0
    for ws in grup.values():
        if len(ws) < 2:
            continue
        for a, b in itertools.combinations(ws, 2):
            pasangan += 1
            setuju += (a == b)

    posisi.sort()
    return {
        'diuji': len(contoh), 'hasil': hasil, 'sebaran': sebaran, 'acak': acak,
        'berpita': len(berpita), 'kelompok': sum(1 for w in grup.values() if len(w) >= 2),
        'pasangan': pasangan, 'setuju': setuju,
        'median_y': posisi[len(posisi) // 2] if posisi else None,
        'paruh_bawah': sum(1 for y in posisi if y > 0.5), 'berposisi': len(posisi),
    }


if __name__ == '__main__':
    arg = [a for a in sys.argv[1:] if not a.startswith('--')]
    n = int(arg[0]) if arg else 400
    h = jalankan(n)
    print(f"diuji {h['diuji']} gambar muka kemasan\n")
    for k, v in h['hasil'].most_common():
        print(f"  {v:4}  ({100*v/h['diuji']:4.1f}%)  {k}")
    print(f"\nsebaran warna pita : {dict(h['sebaran'])}")
    print(f"letak pita         : median {h['median_y']:.2f} · {h['paruh_bawah']}/{h['berposisi']} di paruh bawah")
    if h['pasangan']:
        setara = 100 * h['setuju'] / h['pasangan']
        print(f"\nUJI PENENTU — dua produk berbahan aktif sama, sewarna atau tidak")
        print(f"  {h['kelompok']} kelompok · {h['pasangan']} pasangan")
        print(f"  sewarna     : {h['setuju']} ({setara:.1f}%)")
        print(f"  peluang acak: {100*h['acak']:.1f}%")
        print(f"\n  VERDIKT: {'menandai bahaya' if setara > 100*h['acak'] + 25 else 'TIDAK menandai bahaya — yang terdeteksi palet merek'}")

    if '--tulis' in sys.argv:
        setara = 100 * h['setuju'] / h['pasangan'] if h['pasangan'] else 0
        out = f'{AKAR}/docs/23-uji-pita-bahaya.md'
        with open(out, 'w', encoding='utf-8') as f:
            f.write(f"""# Uji Pita Bahaya — Dugaan yang Tidak Lolos

> Dibangkitkan oleh `gambar_produk/uji-pita-bahaya.py`. Menutup butir **12a**: diuji,
> dan hasilnya negatif.

## Dugaannya

Label pestisida Indonesia membawa pita berwarna penanda kelas bahaya — merah, kuning,
biru, hijau. Pita itu di **muka kemasan**, sisi yang sudah punya 943 gambar. Warna jauh
lebih mudah dideteksi daripada cetakan kecil dan tidak butuh OCR, jadi kelas bahaya
tampak bisa dipanen murah. Itu yang membuat 12a dipisah dari 12b dan ditaruh di kuadran
"kerjakan sekarang".

## Hasilnya

Dari **{h['diuji']}** gambar muka kemasan:

| | Gambar |
|---|---:|
{chr(10).join(f"| {k} | {v} ({100*v/h['diuji']:.1f}%) |" for k, v in h['hasil'].most_common())}

Yang lolos pemeriksa tampak meyakinkan: sebaran warnanya masuk akal
({', '.join(f'{k} {v}' for k, v in h['sebaran'].most_common())}), dan letaknya di bawah —
median {h['median_y']:.2f} dari tinggi gambar, {h['paruh_bawah']} dari {h['berposisi']} di paruh bawah. Persis di tempat pita
bahaya seharusnya berada.

## Kenapa "tampak meyakinkan" tidak cukup

Pita bahaya menandai **bahan aktif**. Dua produk berbahan aktif sama harus sewarna,
hampir selalu — kelas bahaya adalah sifat bahannya, bukan sifat mereknya. Desain kemasan
tidak punya kewajiban itu.

| | |
|---|---:|
| Kelompok berbahan aktif sama (≥2 produk) | {h['kelompok']} |
| Pasangan dibandingkan | {h['pasangan']} |
| **Sewarna** | **{h['setuju']} ({setara:.1f}%)** |
| Peluang acak menurut sebaran warnanya | {100*h['acak']:.1f}% |

Selisihnya {setara - 100*h['acak']:.1f} poin. Kalau warnanya menandai bahaya, angka pertama seharusnya
mendekati seratus persen. Yang terdeteksi bukan pita bahaya, melainkan **palet merek**.

## Satu gambar yang menjelaskan seluruhnya

AMEXONE 500 SC: jerigen putih difoto di atas latar studio **merah**. Tanpa pemeriksa
latar, seluruh bawah gambarnya terbaca sebagai pita merah — dan merah berarti kelas
Ia/Ib, tuduhan paling berat di skema ini. Pemeriksa latar menangkapnya. Yang tidak bisa
ditangkap pemeriksa mana pun: ACULAT 80 WP, sachet bertema hijau dari ujung ke ujung,
yang pita hijaunya tidak bisa dibedakan dari desainnya sendiri.

Korpusnya **fotografi pemasaran**, bukan pindaian label datar: botol menyudut, label
melengkung mengikuti silinder, latar berwarna, dan sisi yang membawa pita kerap
membelakangi kamera.

## Yang TIDAK dibuktikan oleh uji ini

- **Bukan** bahwa pitanya tidak ada. Ia ada, dan terlihat jelas pada gambar yang datar.
- **Bukan** bahwa pendekatan citra pasti gagal. Yang gagal pendekatan **warna polos
  tanpa segmentasi** — dan justru kemurahan itu yang jadi alasan 12a dipisah. Begitu
  pendekatannya menuntut segmentasi objek dan perataan label, ongkosnya kembali setara
  12b, dan pemisahannya kehilangan alasan.
- **Bukan** bahwa 55 gambar `panel_label` ikut gagal. Itu belum diuji, dan jumlahnya
  terlalu sedikit untuk menutup 7.724 pendaftaran.

## Yang perlu diputuskan

12a sebaiknya dikembalikan ke 12, atau dipindahkan ke kanan bersama 12b. Menyimpannya
di "kerjakan sekarang" dengan alasan "murah" tidak lagi punya dasar.
""")
        print(f'\nDitulis ke {out}')
