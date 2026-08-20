# Jalur Produk

> Rancangan · permukaan baca-saja · jalur 2 · masuk dari kemasan
> Sudah memegang botol, karung, atau sachet. Pertanyaannya bukan "apa masalah saya" melainkan **"sebenarnya ini apa, dan apa lagi yang isinya sama."**
> Angka **dari registri pascapenggabungan ejaan zat** (`1a0f077`, `04b91c6`)
> **dan penyatuan komoditas serumpun serta OPT kembar** — 488 komoditas jadi 274,
> 1.370 OPT jadi 778
>
> Diekstrak dari dokumen konsep HTML, 20 Agustus 2026. Isi, angka, dan tabelnya
> utuh; simulasi yang bisa diklik tidak ikut — alurnya ditulis ulang sebagai teks.
>
> Jalur 2 dari [03-enam-pintu.md](03-enam-pintu.md). Jalur 1 ada di
> [04-jalur-insiden.md](04-jalur-insiden.md).

---

## 1. Kenapa jalur ini yang dirilis lebih dulu

Setelah kedua jalur dibangun, urutannya jadi jelas — dan bukan urutan yang diduga
semula.

- **Tidak butuh kurasi sama sekali.** Jalur gejala menunggu lima kalimat ditulis dan
  hanya melayani cabai. Jalur produk bekerja hari ini di seluruh **7.724 pestisida**,
  **7.196 pupuk**, dan **11.227 varietas**, karena komposisi terisi 96,4% pada
  pestisida dan 71,3% pada pupuk.
- **Momennya lebih sering dan lebih menentukan.** Gejala muncul beberapa kali semusim;
  transaksi di kios terjadi setiap kali beli. Dan di situlah uang berpindah.
- **Ia yang membuat temuan kesetaraan bisa dipakai.** "4.905 produk identik dengan
  produk lain" adalah abstraksi sampai seseorang bisa melihat *merek mana* yang
  identik dengan yang di tangannya.
- **Dua arah sekaligus.** Dari kemasan ke isi, dan dari isi kembali ke semua kemasan
  lain yang sama. Jalur gejala hanya satu arah.

Ia juga satu-satunya jalur yang berlaku untuk **ketiga kategori** — pestisida, pupuk,
dan benih atau bibit — dengan bentuk pertanyaan yang persis sama.

---

## 2. Temuan yang menopang seluruh jalur ini

**63,5% pestisida terdaftar identik secara kimia dengan produk lain.** Bukan mirip —
identik: bahan aktif sama, kadar sama, satuan sama. 4.905 dari 7.724 produk berada
dalam 890 kelompok setara.

```
126 merek  =  Isopropil Amina Glifosat 480 g/L
121 merek  =  Parakuat diklorida 276 g/L
113 merek  =  Mankozeb 80%
```

Pada pupuk polanya bahkan lebih pekat. Dikelompokkan menurut komposisi *dan* bentuk
fisiknya: **386 kelompok, 1.904 produk** dari 5.130 yang berkomposisi — dengan **184
merek** untuk NPK 15-15-15 butiran yang sama, **144 merek** untuk NPK 16-16-16, dan
**42 merek** untuk KCl 60.

Petani yang berdiri di kios melihat 184 karung berbeda dengan 184 harga berbeda, dan
tidak punya cara tahu isinya sama.

> **Angka itu naik karena kerja pembersihan, bukan karena data berubah**
>
> Kesetaraan pestisida tercatat 62,8% sebelum `1a0f077`. Penggabungan 106 id zat yang
> cuma beda kapitalisasi, spasi, atau tanda baca membuat **56 produk yang dulu tak
> terdeteksi kembar kini terlihat**. Pembersihan kosakata terbayar langsung di angka
> yang disajikan ke pengguna.

---

## 3. Kasus LARBAN: dua fakta yang bertabrakan

LARBAN 500/50 EC memegang pendaftaran Kementan `01010120124476` yang **aktif sampai
26 April 2028**, terdaftar untuk trips dan kutu daun pada cabai dengan dosis 1,5 ml/l.
Isinya Klorpirifos 500 g/L + Sipermetrin 50 g/L — dan **klorpirifos tercantum di
daftar bahan yang dilarang**, untuk *rumah tangga* dan *tanaman padi* (Permentan
43/2019 Lampiran I.A no. 71 dan no. 88).

Kedua fakta itu sama-sama ada di data, dan tegangannya nyata sekalipun tidak
bertabrakan: pendaftarannya untuk cabai, sedangkan larangannya untuk padi dan rumah
tangga. Justru karena itu layar tidak boleh memilih salah satunya diam-diam. Yang
benar adalah menampilkan keduanya **beserta lingkupnya**, lalu berhenti — mengatakan
produknya ilegal adalah kesimpulan hukum yang bukan wewenang platform, menyembunyikan
larangannya jelas lebih buruk, dan menuliskan "dilarang" tanpa menyebut untuk apa
adalah pernyataan hukum yang keliru.

> **Keputusan kebijakan yang menunggu**
>
> Ada **14 produk** seperti ini yang terdaftar untuk trips di cabai, dan **34 produk**
> memuat bahan yang namanya tercantum di Lampiran I.A. Perlu diputuskan: ditolak
> tampil, ditampilkan dengan peringatan, atau bergantung pada status pendaftarannya.
> Kecondongan dokumen ini: **ditampilkan dengan peringatan berlingkup** —
> menyembunyikannya berarti petani tetap membelinya, hanya tanpa tahu; sedangkan
> peringatan tanpa lingkup menyatakan hukum yang tidak benar. Rinciannya di
> [04-jalur-insiden.md](04-jalur-insiden.md) bagian 5.

---

## 4. Kesetaraan punya cakupan, dan cakupannya harus disebut

Dua angka yang mudah tertukar, dan keduanya benar untuk pertanyaan yang berbeda:

| Pertanyaan | Contoh | Angka |
|---|---|---|
| Berapa yang terdaftar untuk **masalah ini**? | Abamektin 18 g/L untuk trips di cabai | 26 produk |
| Berapa yang isinya **sama persis**, di mana pun? | Abamektin 18 g/L di seluruh registri | 58 produk |

Jalur gejala memakai angka bercakupan masalah; jalur produk memakai angka menyeluruh.
Menyatukan keduanya keliru, jadi layar menyebut cakupannya terang-terangan: *"di
seluruh registri, bukan cuma yang terdaftar untuk cabai."*

Dan satu peringatan yang menyertai tiap daftar setara: **isi sama bukan berarti dosis
sama, dan bukan berarti terdaftar untuk tanaman yang sama.** Dosis milik pendaftaran
tiap produk — lihat kekeliruan ketiga di [04-jalur-insiden.md](04-jalur-insiden.md).

---

## 5. Penggabungan id zat yang menopangnya

Kesetaraan hanya bisa dihitung dari `id`, tidak pernah dari label. Salinan label pada
`composition[].substance.label` adalah snapshot sesaat yang sengaja tidak pernah
ditulis ulang, karena pada 17 entri ia satu-satunya tempat angka kesetaraan registri
masih terbaca.

Dua putaran penggabungan menopang jalur ini:

- **`1a0f077`** — 106 id yang cuma beda kapitalisasi, spasi, atau tanda baca disatukan
  jadi 75 kanonik. Nol kelompok yang kedua id-nya pernah muncul pada satu pendaftaran,
  jadi tidak ada kadar terjumlah dua kali — dan karena itu pula tidak ada peringatan
  yang bisa menemukannya.
- **`04b91c6`** — dua belahan berbeda huruf yang diputuskan satu per satu:
  `"CHLORPYRIFOS"` ke `"Klorpirifos"`, dan `"Diafenthiuron"` ke `"Diafentiuron"`.
  Yang pertama menutup lubang keselamatan, bukan sekadar merapikan.

**Yang sengaja tidak digabung:** `"Chlorpyrifos methyl"`. Namanya mirip, tetapi
klorpirifos metil bahan aktif yang berbeda dan larangannya dikutip terpisah di
Lampiran I.A no. 93. Kemiripan nama bukan bukti.

---

## 6. Prasyarat rilis

- **Tetapkan aturan urutan merek dan umumkan di layar.** Rancangan ini memakai nomor
  pendaftaran menaik. Apa pun pilihannya, ia harus tertulis dan tidak boleh bisa
  dibeli. Tanpa peringkat, tanpa bintang, tanpa slot berbayar — secara struktural,
  bukan secara kebijakan.
- **Putuskan perlakuan bahan dilarang** yang masih memegang pendaftaran aktif.
- **Nama dagang belum terpetakan.** Registri menyimpan nama produk terdaftar; kemasan
  sering memakai nama jualan yang berbeda. Ini lubang terbesar jalur ini dan tidak
  bisa ditutup dari data yang ada.
- **Satu pendaftaran bisa punya beberapa baris registri.** 175 nomor pestisida dipakai
  359 baris, karena portal hanya memuat izin yang masih berlaku dan perpanjangan
  menambah baris alih-alih mengganti yang lama. 158 di antaranya satu pendaftaran yang
  muncul dua kali — perpanjangan, ganti nama dagang, atau pemegang berpindah. Layar
  rincian menggabungkannya jadi satu pendaftaran berriwayat: **nama dagang lama tetap
  bisa dicari**, supaya kemasan lama yang masih di gudang tetap ketemu. Hanya 17 nomor
  yang benar-benar menaungi produk tak berhubungan, 10 di antaranya izin ekspor yang
  tidak beredar eceran. Rinciannya di [D38](../spec/03-keputusan-desain.md).
- **1.236 baris tidak akan pernah punya foto kemasan.** Izin bahan teknis dan izin
  ekspor memakai skema penomoran sendiri dan produknya tidak beredar eceran. Ditandai
  `registration.number_scheme = "bahan-teknis"`; jalur ini mengecualikannya menurut
  kelas, bukan menurut tebakan, supaya kemiskinan gambar tidak terbaca sebagai
  kegagalan panen.
- **Kemasan bisa lebih benar daripada registri.** PAENAMAXI WP mencetak
  `RI. 01020120227340` sedangkan baris registrinya `01.01.01.2022.177`. Tiga bukti bebas
  menunjuk barisnyalah yang rusak — lihat [D37](../spec/03-keputusan-desain.md). Layar
  yang menyatakan "nomor di kemasan tidak terdaftar" karena itu harus berhati-hati:
  yang benar adalah menyebut ketidakcocokannya, bukan menyimpulkan kemasannya palsu.

---

## Alur layar

1. **Cari produk.** Kotak pencarian dan daftar produk nyata dengan produsennya.
2. **Rincian.** Nomor pendaftaran dan masa berlakunya untuk dicocokkan ke kemasan,
   bentuk formulasinya, lalu isinya. Bahan yang masuk daftar larangan ditandai di
   baris komposisinya.
3. **Tabrakan fakta.** Untuk LARBAN 500/50 EC, kartu khusus menyatakan kedua fakta apa
   adanya — pendaftarannya aktif sampai 2028, dan isinya memuat bahan dilarang — lalu
   berhenti, tanpa menyimpulkan legal atau ilegal.
4. **Terdaftar untuk.** Daftar komoditas, OPT, dan dosisnya; ditutup keterangan bahwa
   di luar daftar itu produknya tidak terdaftar untuk dipakai.
5. **Daftar setara.** Produk lain dengan komposisi identik di seluruh registri — bukan
   hanya yang terdaftar untuk komoditas yang sedang dilihat, dan perbedaan cakupan itu
   disebutkan.

---

## Cara jalur ini meluas ke pupuk dan benih

Bentuk pertanyaannya tidak berubah, hanya isinya:

- **Pupuk** — isi jadi kadar hara terhadap 17 hara, dan daftar setara jadi merek lain
  dengan komposisi serta bentuk fisik yang sama. Dari sini pengguna bisa menyeberang ke
  [06-jalur-hitungan-hara.md](06-jalur-hitungan-hara.md).
- **Benih dan bibit** — isi jadi surat yang dipegang varietasnya, dan tidak ada
  "setara" sama sekali, karena dua varietas berbeda tidak pernah identik. Rinciannya di
  [07-jalur-keabsahan-benih-bibit.md](07-jalur-keabsahan-benih-bibit.md).
