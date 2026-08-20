# `gambar_produk/` — panen gambar kemasan per SKU

Folder kerja. Bukan bagian spesifikasi yang terbit; yang mengikat ada di
[`spec/schema/product-image.schema.json`](../spec/schema/product-image.schema.json).

## Kenapa standarnya ditetapkan lebih dulu

Gambar yang dipanen tanpa standar tidak bisa diperbaiki belakangan. Tiga hal hilang
permanen begitu berkasnya tersimpan mentah:

- **Asal-usul.** Satu-satunya saat URL sumber, penayang, dan waktu ambil masih diketahui
  pasti adalah saat pengambilan. Sesudahnya folder itu hanya kumpulan JPEG tanpa cerita.
- **Hak.** Foto kemasan adalah karya berhak cipta pemegang pendaftaran atau lokapasar.
  Repositori ini berlisensi CC-BY-SA-4.0. Menyalin berkasnya ke sini tidak mengubah haknya
  — dan tanpa catatan hak per berkas, seluruh koleksi jadi tidak bisa diterbitkan sama
  sekali, sebab tidak ada cara memisahkan yang boleh dari yang tidak.
- **Data pribadi.** EXIF foto lapangan membawa titik GPS pemotretnya. UU 27/2022 menuntut
  dasar pemrosesan yang tercatat; yang tidak pernah masuk tidak perlu dihapus nanti.

## Apa itu "SKU" di sini

Registri Kementan mendaftarkan **formulasi**, bukan kemasan. Tidak ada kolom ukuran
kemasan di seluruh 14.920 baris — lubang yang sudah dinyatakan sendiri di
[`docs/05-jalur-produk.md`](../docs/05-jalur-produk.md): *"Registri menyimpan nama produk
terdaftar; kemasan sering memakai nama jualan yang berbeda."*

Karena itu `sku_key` dibuat merosot dengan rapi:

| Yang diketahui | `sku_key` |
|---|---|
| Hanya produk terdaftar | `northam-480-sc-01030120269427` |
| Produk + ukuran kemasan | `northam-480-sc-01030120269427-250ml` |

Panen hari ini di tingkat produk tetap sah. Ketika ukuran kemasan menyusul, baris lama
tidak perlu dikunci ulang — hanya bertambah saudara yang lebih spesifik.

## Profil normalisasi

Satu profil, tidak ada varian per sumber.

| Sifat | Nilai | Alasan |
|---|---|---|
| Warna | sRGB | Profil ICC tertanam dipakai untuk konversi, lalu dibuang |
| Sisi terpanjang | 1600 · 800 · 320 px | `besar` · `sedang` · `kecil` |
| `kartu` | 800×800, dipadatkan | Satu-satunya rendition yang boleh jadi 1:1 |
| Nisbah sisi | dipertahankan | Tidak pernah ditarik; kemasan yang ditarik jadi bohong |
| Perbesaran | tidak pernah | Memperbesar berarti mengarang piksel |
| Rendition yang tidak muat | dilewati | Sumber 300 px yang diminta `besar` dan `sedang` menghasilkan dua berkas byte-identik; dua salinan sama persis dengan dua nama berbeda adalah kebohongan kecil tentang isi koleksi |
| Format | WebP, atau PNG bila beralfa | |
| Anggaran byte | 400 KB · 150 KB · 40 KB | Mutu turun bertahap 82→55, berhenti di situ |
| Orientasi | EXIF dipanggang, lalu dibuang | |
| Metadata | EXIF/GPS/IPTC dibuang | UU 27/2022 |
| Latar | **ditandai, tidak dipaksakan** | Memutihkan latar berarti menyunting bukti |
| Nama berkas | `{sku_key}__{peran}__{rendition}.{ext}` | |
| Sidik | `sha256` berkas + `dhash64` perseptual | |

`dhash64` bukan untuk deduplikasi berkas — `sha256` sudah menangani itu. Ia mencari
**satu foto yang sama dipakai ulang lintas pendaftaran**. Pada registri yang 63,5%
pestisidanya identik secara komposisi, pemakaian ulang foto adalah temuan yang ingin
dilihat, bukan galat yang perlu dibersihkan. `periksa.mjs` melaporkannya terpisah dari
daftar galat.

## Alur

```bash
# 1. Tiap agen pemanen menulis ke pecahannya sendiri — manifes-agen-N.ndjson —
#    plus berkasnya ke mentah/. Lima penulis, lima berkas, nol tabrakan.
#    Setiap baris menyebut _berkas_mentah, dan source.* wajib sudah terisi.

# 2. Gabung pecahan jadi satu manifes
python3 gabung.py

# 3. Normalkan
python3 normalkan.py mentah/

# 4. Periksa
node periksa.mjs
```

Pemecahan per agen di langkah 1 bukan kerapian, melainkan syarat. Lima proses yang
menambah baris ke satu ndjson yang sama akan saling memotong tulisan. `gabung.py`
melaporkan bila dua agen mengaku punya peran yang sama untuk SKU yang sama — berarti
salah satunya keliru sasaran, dan itu harus terlihat, bukan hilang.

`normalkan.py` hanya menyentuh baris berstatus `mentah`; menjalankannya dua kali aman.
Baris yang berkasnya rusak atau hilang jadi `ditolak` beserta alasannya, supaya putaran
berikutnya tidak memanennya ulang.

## Yang ditegakkan `periksa.mjs`

| Aturan | Isi |
|---|---|
| `G1` | Bentuk sesuai `product-image.schema.json` |
| `G2` | `product.id` benar-benar ada di registri produk |
| `G3` | Watermark dan overlay promosi tidak boleh naik ke `terverifikasi` — turunan `L3` |
| `G4` | `redistributable=true` menuntut izin tertulis, foto sendiri, atau lisensi |
| `G5` | Berkas yang disebut manifes ada, `sha256` dan `bytes`-nya cocok |
| `G6` | Satu peran satu gambar per SKU |

Keenamnya punya baris pembukti di [`fixtures-invalid/manifes-buruk.ndjson`](fixtures-invalid/manifes-buruk.ndjson):

```bash
node periksa.mjs fixtures-invalid/manifes-buruk.ndjson   # harus keluar 7 galat
```

Nomornya sengaja `G`, bukan `L`. Aturan `L` milik `spec/check.mjs` dan blok `L30`+ belum
diklaim siapa pun; folder kerja tidak berhak mengambilnya. Bila manifes ini kelak naik ke
`spec/vocab/`, `G1`–`G6` dipindahkan jadi `L`-bernomor lewat konvensi di
[`spec/00-konvensi-kerja-paralel.md`](../spec/00-konvensi-kerja-paralel.md).

## Yang tidak masuk git

`mentah/` dan `ternormalkan/` diabaikan git. Yang di-commit hanya manifes, alat, dan
fixture — catatan tentang gambar, bukan gambarnya. Berkas biner baru boleh dipertimbangkan
masuk setelah `source.redistributable` benar untuk baris yang bersangkutan, dan itu
keputusan tersendiri, bukan akibat sampingan dari memanen.
