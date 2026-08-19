# Jalur Insiden & Jalur Produk

> Rancangan · permukaan reaktif · revisi 4 · seluruh belahan zat tertutup  
> Dua jalur masuk ke registri yang sama. Dari **gejala** ketika masalah sudah terlihat, dan dari **botol** ketika sudah berdiri di depan kios.  
> Tanpa akun · Angka **dari registri pascapenggabungan ejaan** · Dua panel **bisa diklik**  
>
> Diekstrak dari dokumen konsep HTML dengan judul sama, 20 Agustus 2026.
> Isi, angka, dan tabelnya utuh; simulasi yang bisa diklik tidak ikut —
> alurnya ditulis ulang sebagai teks.
>
> Jalur 1 dan 2 dari [03-lima-pintu.md](03-lima-pintu.md).

---

## 1. Tiga kekeliruan yang diperbaiki

Versi sebelumnya menyembunyikan nama merek dan mengelompokkan hanya menurut bahan aktif. Data membuktikan keduanya salah — dan yang ketiga menyangkut keselamatan.

1 · Merek disembunyikan

Petani membeli merek, bukan bahan aktif. Menyebut “abamektin” di kios akan dijawab “yang mana? ada 65”. Menyembunyikan merek menyerahkan langkah terakhir ke pihak yang hidup dari margin penjualan — jadi justru **kurang** netral, bukan lebih. `L3` tidak melarang ini: aturan itu mengikat langkah protokol, bukan tampilan registri.

2 · Dikelompokkan per bahan saja

Satu entitas `op:sub:00000007` “Abamektin” ternyata dipakai pada **15 kadar berbeda**, dari 7 g/L sampai 72 g/L — rentang sepuluh kali lipat. Kesetaraan hanya benar pada pasangan **bahan + kadar**, bukan pada nama bahannya.

3 · Dosis ditempel ke bahan

Kekeliruan paling berbahaya. Dari 25 produk berisi Abamektin 18 g/L, dosis terdaftarnya berbeda-beda: 0,5 · 0,75 · 1 · 1,5 · 1–2 ml/l — dan satu produk memakai satuan yang sama sekali lain, `1 l/ha`. **Dosis milik pendaftaran tiap produk, bukan milik bahannya.** Kartu lama menampilkan satu rentang tanpa kadar; itu bisa melukai orang.

---

## 2. Dua jalur, berdampingan

Panel kiri masuk dari gejala. Panel kanan masuk dari botol — coba **LARBAN 500/50 EC** untuk melihat kasus dua fakta yang bertabrakan, dan **GMAX 18 EC** untuk melihat daftar setara.

---

## 3. Kenapa jalur produk yang dirilis lebih dulu

Setelah keduanya dibangun, urutannya jadi jelas — dan bukan urutan yang diduga semula.

- **Tidak butuh kurasi sama sekali.** Jalur gejala menunggu enam kalimat ditulis dan hanya melayani cabai. Jalur produk bekerja hari ini di seluruh **7.724 produk**, karena komposisi terisi 96,4% dan penggunaan berlabel 23.058 baris.
- **Momennya lebih sering dan lebih menentukan.** Gejala muncul beberapa kali semusim; transaksi di kios terjadi setiap kali beli. Dan di situlah uang berpindah.
- **Ia yang membuat temuan 62,8% bisa dipakai.** “4.849 produk identik dengan produk lain” adalah abstraksi sampai seseorang bisa melihat *merek mana* yang identik dengan yang di tangannya.
- **Dua arah sekaligus.** Dari botol ke isi, dan dari isi kembali ke semua botol lain yang sama. Jalur gejala hanya satu arah.

> **Urutan yang diusulkan**
>
> Rilis pertama **jalur produk** — bisa dikerjakan sekarang, tanpa menunggu kurasi apa pun. Jalur gejala menyusul begitu enam kalimat gejala selesai ditulis, dan ia masuk sebagai pintu kedua ke halaman yang sama.

---

## 4. Kasus LARBAN: dua fakta yang bertabrakan

LARBAN 500/50 EC memegang pendaftaran Kementan `01010120124476` yang **aktif sampai 26 April 2028**, terdaftar untuk trips dan kutu daun pada cabai dengan dosis 1,5 ml/l. Isinya Klorpirifos 500 g/L + Sipermetrin 50 g/L — dan **klorpirifos ada di daftar bahan yang dilarang.**

Kedua fakta itu sama-sama ada di data, dan bertabrakan. Layar tidak boleh memilih salah satunya diam-diam. Yang benar adalah menampilkan keduanya apa adanya, lalu berhenti — mengatakan bahwa produknya ilegal adalah kesimpulan hukum yang bukan wewenang platform, dan menyembunyikan larangannya jelas lebih buruk lagi.

> **Keputusan kebijakan yang menunggu**
>
> Ada **14 produk** seperti ini yang terdaftar untuk trips di cabai, dan **36 produk** memuat bahan dilarang apa pun. Perlu diputuskan: ditolak tampil, ditampilkan dengan peringatan, atau bergantung pada status pendaftarannya. Kecondongan dokumen ini: **ditampilkan dengan peringatan** — menyembunyikannya berarti petani tetap membelinya, hanya tanpa tahu.

---

## 5. Prasyarat rilis

- **Belahan entitas zat sudah tertutup seluruhnya.** 106 id yang cuma beda kapitalisasi, spasi, atau tanda baca (`1a0f077`), lalu dua belahan berbeda-huruf yang diputuskan satu per satu: `"CHLORPYRIFOS"` ke `"Klorpirifos"` dan `"Diafenthiuron"` ke `"Diafentiuron"`. Bahan aktif untuk trips turun 74 → 72; Diafentiuron 500 g/L pada kutu kebul naik 2 → 3 produk.
- **Penggabungan klorpirifos menutup lubang keselamatan, bukan sekadar merapikan.** Entitas `"Klorpirifos"` memegang blok `hazard` lengkap — dilarang untuk rumah tangga dan dilarang pada padi menurut Permentan 43/2019 — sementara `"CHLORPYRIFOS"` tidak memegang satu pun. Selama terbelah, produk yang registrinya menuliskan nama Inggris tidak terlihat oleh pemeriksaan larangan mana pun. Terukur di layar ini: produk trips/cabai yang memuat bahan dilarang naik **33 → 36**.
- **Yang sengaja tidak digabung:** `"Chlorpyrifos methyl"`. Namanya mirip, tetapi klorpirifos metil bahan aktif yang berbeda dan larangannya dikutip terpisah. Kemiripan nama bukan bukti.
- **Tetapkan aturan urutan merek dan umumkan di layar.** Panel ini memakai nomor pendaftaran menaik. Apa pun pilihannya, ia harus tertulis dan tidak boleh bisa dibeli.
- **Putuskan perlakuan bahan dilarang** yang masih memegang pendaftaran aktif.
- **Enam kalimat gejala** — hanya untuk jalur kedua, tidak memblokir rilis pertama.

---

## Alur layar

Simulasi aslinya menampilkan dua bingkai HP berdampingan, masing-masing bisa
diklik sendiri. Berikut alurnya sebagai teks.

### Panel kiri — jalur gejala

1. **Pilih gejala.** Daftar pendek gejala yang terlihat, bukan nama hama:
   *daun keriting ke atas*, *daun menguning dan keriting*, *serangga putih
   beterbangan*. Di bawahnya tertulis bahwa gejala dikurasi tangan dan mesin
   tidak menebak dari foto.
2. **Hasil.** Dugaan OPT dengan nama ilmiahnya, lalu blok **“pastikan dulu”**
   berisi dua ciri pembanding yang bisa diperiksa sendiri. Menyusul angka besar
   — *244 produk terdaftar untuk ini di cabai, tetapi isinya hanya 72 bahan
   aktif berbeda* — lalu kartu peringatan bahan dilarang.
3. **Kartu bahan + kadar.** Lima kelompok, diurutkan menurut jumlah produk.
   Tiap kartu bisa dibuka jadi daftar merek dengan nomor pendaftaran, masa
   berlaku, dan **dosis terdaftar milik tiap produk** — yang berbeda-beda walau
   isinya sama. Aturan urutannya diumumkan di dalam daftar itu sendiri.
4. **Cabang nol produk.** Untuk virus kuning keriting, tidak ada kartu bahan
   sama sekali. Yang tampil: pernyataan bahwa tak satu pun pestisida terdaftar
   menyembuhkannya, tiga tindakan yang memang berpengaruh, lalu satu jalan
   keluar konkret — mengendalikan kutu kebul sebagai vektornya.
5. **Kaki tiap hasil.** Satu baris yang menyatakan pertanyaan itu tercatat
   sebagai satu kejadian di kecamatan, tanpa nama dan tanpa nomor telepon.

### Panel kanan — jalur produk

1. **Cari produk.** Kotak pencarian dan empat produk nyata dengan produsennya.
2. **Rincian.** Nomor pendaftaran dan masa berlakunya untuk dicocokkan ke
   kemasan, bentuk formulasinya, lalu isinya. Bahan yang masuk daftar larangan
   ditandai di baris komposisinya.
3. **Tabrakan fakta.** Untuk LARBAN 500/50 EC, kartu khusus menyatakan kedua
   fakta apa adanya — pendaftarannya aktif sampai 2028, dan isinya memuat bahan
   dilarang — lalu berhenti, tanpa menyimpulkan legal atau ilegal.
4. **Terdaftar untuk.** Daftar komoditas, OPT, dan dosisnya; ditutup keterangan
   bahwa di luar daftar itu produknya tidak terdaftar untuk dipakai.
5. **Daftar setara.** Produk lain dengan komposisi identik di seluruh registri —
   bukan hanya yang terdaftar untuk cabai, dan perbedaan cakupan itu disebutkan.
