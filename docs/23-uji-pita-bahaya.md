# Uji Pita Bahaya — Dugaan yang Tidak Lolos

> Dibangkitkan oleh `gambar_produk/uji-pita-bahaya.py`. Menutup butir **12a**: diuji,
> dan hasilnya negatif.

## Dugaannya

Label pestisida Indonesia membawa pita berwarna penanda kelas bahaya — merah, kuning,
biru, hijau. Pita itu di **muka kemasan**, sisi yang sudah punya 943 gambar. Warna jauh
lebih mudah dideteksi daripada cetakan kecil dan tidak butuh OCR, jadi kelas bahaya
tampak bisa dipanen murah. Itu yang membuat 12a dipisah dari 12b dan ditaruh di kuadran
"kerjakan sekarang".

## Hasilnya

Dari **400** gambar muka kemasan:

| | Gambar |
|---|---:|
| tanpa pita | 241 (60.2%) |
| pita | 127 (31.8%) |
| kemungkinan latar | 19 (4.8%) |
| terlalu tebal untuk pita | 13 (3.2%) |

Yang lolos pemeriksa tampak meyakinkan: sebaran warnanya masuk akal
(kuning 42, biru 36, hijau 21, merah 18), dan letaknya di bawah —
median 0.86 dari tinggi gambar, 108 dari 127 di paruh bawah. Persis di tempat pita
bahaya seharusnya berada.

## Kenapa "tampak meyakinkan" tidak cukup

Pita bahaya menandai **bahan aktif**. Dua produk berbahan aktif sama harus sewarna,
hampir selalu — kelas bahaya adalah sifat bahannya, bukan sifat mereknya. Desain kemasan
tidak punya kewajiban itu.

| | |
|---|---:|
| Kelompok berbahan aktif sama (≥2 produk) | 18 |
| Pasangan dibandingkan | 114 |
| **Sewarna** | **36 (31.6%)** |
| Peluang acak menurut sebaran warnanya | 27.9% |

Selisihnya 3.6 poin. Kalau warnanya menandai bahaya, angka pertama seharusnya
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
