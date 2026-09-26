# Apa yang Membuat Panen Ditolak — dan Apakah Bisa Diukur di Sini

> Dibangkitkan dari ruang lingkup akreditasi laboratorium oleh
> `lpk_data/susun-penolakan.mjs`. Menjawab **separuh** dari no. 7: alasan penolakannya,
> dan apakah alasan itu bisa diukur di Indonesia, oleh siapa, untuk komoditas apa.
>
> **Batasnya tidak ada di sini.** Angka batas milik no. 17; yang disebut di bawah cuma
> nama peraturan yang mengaturnya, tanpa satu pun angkanya disalin.

---

## Kenapa setiap angka di halaman ini adalah lantai

Lingkup terurai per parameter hanya ada untuk **174 dari 1.671** laboratorium penguji
berakreditasi aktif — yang sudah pindah ke aplikasi direktori KAN. Sisanya hanya punya
ringkasan satu paragraf di papan resmi, dan ringkasan itu tidak menyebut parameter.

Artinya: parameter yang di sini tercatat "3 laboratorium" bisa saja punya tiga puluh.
Yang **tidak** bisa terjadi sebaliknya — tidak ada angka di bawah yang kebesaran.

**Residu pestisida memperlihatkannya paling terang.** Tabel di bawah mencatat
2 laboratorium, sementara `lpk_data/lab-uji-tani.csv` — yang dibangun dari ringkasan
lingkup di papan resmi KAN, mencakup seluruh 1.671 — mencatat **17**. Keduanya benar pada
sumbernya masing-masing, dan yang 17 itu yang lebih dekat ke kenyataan. Angka di halaman
ini dipakai untuk melihat **apa yang diuji pada komoditas apa**, bukan untuk menghitung
berapa banyak laboratorium yang ada.

## Tujuh alasan, dan keterukurannya

| Alasan | Lab | Baris lingkup | Yang mengaturnya |
|---|---:|---:|---|
| **Residu pestisida** | 2 | 4 | Batas maksimum residu — no. 17, belum berdiri. Acuannya SNI 7313 dan Codex MRL. |
| **Aflatoksin** | 3 | 31 | Perka BPOM tentang batas maksimum cemaran mikotoksin dalam pangan olahan. |
| **Mikotoksin lain** | 3 | 14 | Perka BPOM yang sama; okratoksin A punya batasnya sendiri untuk kopi. |
| **Logam berat** | 58 | 965 | Perka BPOM tentang batas maksimum cemaran logam berat dalam pangan olahan. |
| **Cemaran mikroba** | 54 | 824 | Perka BPOM tentang batas maksimum cemaran mikroba dalam pangan olahan. |
| **Kadar air** | 65 | 398 | SNI mutu per komoditas; juga syarat kontrak pembelian. |
| **Benda asing & kotoran** | 11 | 49 | SNI mutu per komoditas; potongan harga, kadang penolakan. |

---

## Residu pestisida

*Penolakan paling mahal, karena baru ketahuan setelah panen sampai di pembeli.*

**2 laboratorium**, 4 baris ruang lingkup. Yang mengaturnya: Batas maksimum residu — no. 17, belum berdiri. Acuannya SNI 7313 dan Codex MRL.

Komoditas dan bahan yang lingkupnya menyebut parameter ini:

- Biji kakao *(1 baris)*
- Air Sungai *(1 baris)*
- Air untuk keperluan higiene sanitasi *(1 baris)*
- Air Laut *(1 baris)*

| Laboratorium | Provinsi | Baris |
|---|---|---:|
| PT BMT Asia Indonesia `LP-853-IDN` | Jawa Barat | 3 |
| Balai Pengujian Mutu Barang `LP-025-IDN` | DKI Jakarta | 1 |

## Aflatoksin

*Alasan penolakan ekspor lada, kakao, jagung, dan kacang tanah yang paling sering.*

**3 laboratorium**, 31 baris ruang lingkup. Yang mengaturnya: Perka BPOM tentang batas maksimum cemaran mikotoksin dalam pangan olahan.

Komoditas dan bahan yang lingkupnya menyebut parameter ini:

- Hasil Pertanian dan Perkebunan Biji-bijian *(5 baris)*
- Produk Roti (Bakery Products) *(5 baris)*
- Pala dan Fuli *(4 baris)*
- Perisa, Bumbu, Rempah-rempah, Bumbu Pelengkap (Flavour, Seasoning, Spices, Condiment ) *(2 baris)*
- Lada Hitam, Lada Putih *(1 baris)*
- Bungkil kelapa - bahan pakan ternak *(1 baris)*
- Susu dan Produk Analognya *(1 baris)*
- a. BIji-bijian Utuh b. Tepung dan Pati c. Sereal Olahan *(1 baris)*
- Herba dan Rempah *(1 baris)*
- a. Bumbu dan Kondimen b. Cuka Makan c. Sup dan Kaldu (lanjutan) *(1 baris)*
- Makanan Ringan Olahan Kacang *(1 baris)*
- Susu dan Produk Analognya (Milk and its Analogue Products) Lanjutan (Continue ) *(1 baris)*

| Laboratorium | Provinsi | Baris |
|---|---|---:|
| PT SGS Indonesia `LP-432-IDN` | DKI Jakarta | 15 |
| Balai Pengujian Mutu Barang `LP-025-IDN` | DKI Jakarta | 11 |
| PT Biochem Technology `LP-286-IDN` | Jawa Timur | 5 |

## Mikotoksin lain

*Okratoksin A pada kopi diperiksa pembeli Eropa meski tidak diwajibkan di sini.*

**3 laboratorium**, 14 baris ruang lingkup. Yang mengaturnya: Perka BPOM yang sama; okratoksin A punya batasnya sendiri untuk kopi.

Komoditas dan bahan yang lingkupnya menyebut parameter ini:

- Biji kopi, roasted coffee *(1 baris)*
- Tepung terigu *(1 baris)*
- Rempah-rempah (Pala, Lada) *(1 baris)*
- Kopi Instan *(1 baris)*
- Produk Kakao dan Cokelat Termasuk Cokelat Analog dan Pengganti Cokelat *(1 baris)*
- a. BIji-bijian Utuh b. Tepung dan Pati c. Sereal Olahan *(1 baris)*
- Herba dan Rempah *(1 baris)*
- a. Bumbu dan Kondimen b. Cuka Makan c. Sup dan Kaldu (lanjutan) *(1 baris)*
- Kopi bubuk *(1 baris)*
- Biji Kopi, Kopi Instan, Kopi Campur, Minuman Kopi Dalam Kemasan, Kopi Cair Konsentrat, Premiks Kopi, Kapucino *(1 baris)*
- Kopi Instant (Instant Coffee ) Lanjutan (Continue ) *(1 baris)*
- Biji Kopi, Kopi Bubuk, Kopi Campur, Minuman Kopi Dalam Kemasan, Kopi Cair Konsentrat, Premiks Kopi, Kapucino (Coffee Beans, Ground Coffee, Mixed Coffee, Packaged Coffee Drinks, Concentrated Liquid Coffee, Coffee Premix, Cappuccino) *(1 baris)*

| Laboratorium | Provinsi | Baris |
|---|---|---:|
| PT Biochem Technology `LP-286-IDN` | Jawa Timur | 6 |
| Balai Pengujian Mutu Barang `LP-025-IDN` | DKI Jakarta | 4 |
| PT SGS Indonesia `LP-432-IDN` | DKI Jakarta | 4 |

## Logam berat

*Terbawa dari tanah dan air irigasi, bukan dari perlakuan — tidak bisa dicuci hilang.*

**58 laboratorium**, 965 baris ruang lingkup. Yang mengaturnya: Perka BPOM tentang batas maksimum cemaran logam berat dalam pangan olahan.

Komoditas dan bahan yang lingkupnya menyebut parameter ini:

- Air Limbah *(55 baris)*
- Air Minum *(25 baris)*
- Air Laut *(21 baris)*
- Air limbah *(18 baris)*
- Air limbah (lanjutan) *(17 baris)*
- Udara Emisi Sumber Tidak Bergerak *(15 baris)*
- Pupuk NPK *(14 baris)*
- Air Sungai *(14 baris)*
- Pupuk Tripel Super Fosfat *(12 baris)*
- Tanah *(12 baris)*
- Udara Ambien *(10 baris)*
- Mainan anak *(10 baris)*

| Laboratorium | Provinsi | Baris |
|---|---|---:|
| PT SGS Indonesia `LP-432-IDN` | DKI Jakarta | 124 |
| Balai Pengujian Mutu Barang `LP-025-IDN` | DKI Jakarta | 99 |
| PT Biochem Technology `LP-286-IDN` | Jawa Timur | 70 |
| Pusat Standardisasi Instrumentasi Kualitas Lingkungan Hidup `LP-082-IDN` | Banten | 61 |
| PT Anugrah Analisis Sempurna `LP-565-IDN` | Jawa Barat | 57 |
| PT Syslab `LP-516-IDN` | Jawa Barat | 55 |
| PT Sucofindo Cabang Semarang `LP-043-IDN` | Jawa Tengah | 50 |
| PT Global Quality Analytical `LP-756-IDN` | Jawa Barat | 40 |

## Cemaran mikroba

*Menentukan lolos-tidaknya pangan segar asal tumbuhan di pasar modern.*

**54 laboratorium**, 824 baris ruang lingkup. Yang mengaturnya: Perka BPOM tentang batas maksimum cemaran mikroba dalam pangan olahan.

Komoditas dan bahan yang lingkupnya menyebut parameter ini:

- Air Limbah *(15 baris)*
- Serealia dan Produk Serealia *(15 baris)*
- Garam dan Pengganti Garam *(15 baris)*
- Pangan Campuran: Makanan Siap Saji Berbasis Nasi, Makanan Siap Saji Berbasis Mi/Bihun, Makanan Siap Saji Berbasis Kentang, Makanan Siap Saji Berbasis Pasta, Makanan Siap Saji Berbasis Umbi, Makanan Siap Saji Berbasis Roti, Makanan Siap Saji Berbasis Kuah, Makanan Siap Saji Berbasis Sayuran *(15 baris)*
- a. Lemak dan Minyak (edible) yang Tidak Mengandung Air b. Emulsi Lemak Terutama Tipe Emulsi Air Dalam Minyak *(14 baris)*
- Minuman Beralkohol *(14 baris)*
- Herba dan Rempah *(13 baris)*
- Telur dan Produk-Produk Telur *(13 baris)*
- Saus Kedelai (lanjutan) *(13 baris)*
- Air Laut *(12 baris)*
- Air minum *(12 baris)*
- a. Ikan dan Produk Perikanan Lainnya Termasuk Moluska, Krustase dan Ekinodermata yang Telah Mengalami Pengolahan b. Ikan dan Produk Perikanan Awet *(12 baris)*

| Laboratorium | Provinsi | Baris |
|---|---|---:|
| PT Biochem Technology `LP-286-IDN` | Jawa Timur | 338 |
| Balai Pengujian Mutu Barang `LP-025-IDN` | DKI Jakarta | 97 |
| PT SGS Indonesia `LP-432-IDN` | DKI Jakarta | 59 |
| PT Anugrah Analisis Sempurna `LP-565-IDN` | Jawa Barat | 23 |
| PT Syslab `LP-516-IDN` | Jawa Barat | 18 |
| LP-1664-IDN `LP-1664-IDN` | — | 16 |
| PT Global Quality Analytical `LP-756-IDN` | Jawa Barat | 15 |
| Balai Standardisasi dan Pelayanan Jasa Industri Samarinda `LP-060-IDN` | Kalimantan Timur | 14 |

## Kadar air

*Menentukan harga sekaligus memicu tumbuhnya jamur penghasil aflatoksin.*

**65 laboratorium**, 398 baris ruang lingkup. Yang mengaturnya: SNI mutu per komoditas; juga syarat kontrak pembelian.

Komoditas dan bahan yang lingkupnya menyebut parameter ini:

- Batubara *(33 baris)*
- Dry and Sugared Low Moisture (aw < 0,65) Item: Biscuits *(10 baris)*
- Coal *(8 baris)*
- Pupuk Urea *(7 baris)*
- Tanah *(6 baris)*
- Nickel Ore *(6 baris)*
- Produk pertanian kadar asam tinggi dan kadar air tinggi : lemon, jeruk, strawberi, blueberi, anggur, kismis *(6 baris)*
- A. Lemak dan Minyak Nabati : 1. Minyak Kelapa Sawit Mentah (CPO), Minyak Inti Kelapa Sawit Mentah (CPKO), Minyak Inti Kelapa Sawit (RBDPKO), Minyak Kelapa Sawit (RBDPO), Minyak Stearin Kelapa Sawit, Minyak Stearin Kelapa Sawit Mentah. 2. Minyak Goreng, Minyak Sayur, Minyak Salad, Minyak Samin, Lemak Reroti, Pengganti Minyak Mentega. 3. Serbuk Minyak, Serbuk Minyak Kelapa Sawit, Serbuk Minyak Kelapa Virgin, Serbuk Minyak Kelapa. 4. Virgin Oil (Minyak Klentik, Minyak Tanak, atau Minyak Kampung), Cold Pressed Oils, Minyak Kelapa Mentah, Minyak Kelapa. 5. Minyak Zaitun, Minyak Safflower, Minyak Kacang Tanah, Minyak Jagung, Minyak Kemiri, Minyak Kedelai, Minyak Wijen, Minyak Olein Kelapa Sawit, Minyak Olein Kelapa Sawit Mentah, Minyak Biji Bunga Matahari, Minyak Dedak atau Minyak Bekatul, Minyak Biji Kapas, Minyak Kanola, Mustardseed Oil. B. Produk Emulsi Lemak yang Kadar Lemaknya Tidak Kurang dari 80% - Campuran Margarin dan Mentega, Mentega Rekombinasi, Mentega, Margarin C. Produk Emulsi yang Mengandung Lemak Kurang Dari 80% - Minarin (Minarine), Margarin Krim, Margarin Oles (Fat Spread) A. Fats and Vegetable Oils: 1. Crude Palm Oil (CPO), Crude Palm Kernel Oil (CPKO), Palm Kernel Oil (RBDPKO), Palm Oil (RBDPO), Palm Stearin Oil, Crude Palm Stearin Oil. 2. Cooking Oil, Vegetable Oil, Salad Oil, Ghee, Bread Fat, Butter Substitute. 3. Oil Powder, Palm Oil Powder, Virgin Coconut Oil Powder, Coconut Oil Powder. 4. Virgin Oil (Klentik Oil, Tanak Oil, or Village Oil), Cold Pressed Oils, Crude Coconut Oil, Coconut Oil. 5. Olive Oil, Safflower Oil, Peanut Oil, Corn Oil, Candlenut Oil, Soybean Oil, Sesame Oil, Palm Olein Oil, Crude Palm Olein Oil, Sunflower Seed Oil, Bran Oil or Rice Bran Oil, Cottonseed Oil, Canola Oil, Mustardseed Oil. B. Fat Emulsion Products with Fat Content Not Less Than 80% - Margarine and Butter Blend, Recombinant Butter, Butter, Margarine C. Emulsion Products Containing Fat Less Than 80% *(6 baris)*
- Kayu lapis dan kayu lapis penggunaan umum *(5 baris)*
- Sayur dan Buah (kelompok Produk pertanian kadar air tinggi : apel, pear, aprikot, cherry, pisang, nanas, bawang, tomat, paprika, timun, melon, kol, kubis, brokoli, selada, bayam, seledri, asparagus, kacang polong, kacang panjang, wortel) *(5 baris)*
- Produk pertanian kadar air tinggi : apel, pear, aprikot, cherry, persik, pisang, bawang, daun bawang, tomat, paprika, timun, melon, kol, kubis, brokoli, selada, bayam, kemangi, seledri, asparagus, kacang polong, kacang panjang, jamur, sugar beet, wortel, kentang, ubi. *(5 baris)*
- Pupuk NPK *(5 baris)*

| Laboratorium | Provinsi | Baris |
|---|---|---:|
| Balai Pengujian Mutu Barang `LP-025-IDN` | DKI Jakarta | 66 |
| PT SGS Indonesia `LP-432-IDN` | DKI Jakarta | 53 |
| Balai Perakitan dan Pengujian Tanah dan Pupuk `LP-846-IDN` | Jawa Barat | 18 |
| PT Biochem Technology `LP-286-IDN` | Jawa Timur | 18 |
| PT Global Inspeksi Sistem (Multilokasi) `LP-1784-IDN` | DKI Jakarta | 16 |
| Departemen Ilmu dan Teknologi Pangan, Fakultas Teknologi Pertanian, Institut Pertanian Bogor `LP-312-IDN` | Jawa Barat | 14 |
| PT Binasawit Makmur, Sampoerna Agro `LP-1455-IDN` | Sumatera Selatan | 13 |
| LP-1230-IDN `LP-1230-IDN` | — | 12 |

## Benda asing & kotoran

*Paling mudah diperbaiki petani sendiri, dan paling sering diabaikan.*

**11 laboratorium**, 49 baris ruang lingkup. Yang mengaturnya: SNI mutu per komoditas; potongan harga, kadang penolakan.

Komoditas dan bahan yang lingkupnya menyebut parameter ini:

- Cassia Indonesia *(4 baris)*
- Biji Kopi *(3 baris)*
- Panili *(2 baris)*
- Minyak kelapa mentah *(2 baris)*
- Jagung *(2 baris)*
- Biji kopi *(2 baris)*
- Biji kakao *(2 baris)*
- Pala dan Fuli *(2 baris)*
- Tepung Terigu (Flour) Lanjutan (Continue) *(2 baris)*
- Mainan Anak (Toys) Lanjutan (Continue ) *(2 baris)*
- Biji Kakao *(1 baris)*
- Standar Indonesia Rubber (SIR) Karet alam *(1 baris)*

| Laboratorium | Provinsi | Baris |
|---|---|---:|
| Balai Pengujian Mutu Barang `LP-025-IDN` | DKI Jakarta | 22 |
| PT SGS Indonesia `LP-432-IDN` | DKI Jakarta | 5 |
| UPTD Balai Pengawasan dan Sertifikasi Mutu Barang Provinsi Lampung `LP-458-IDN` | Lampung | 5 |
| PT Global Inspeksi Sistem (Multilokasi) `LP-1784-IDN` | DKI Jakarta | 4 |
| UPTD Balai Pengujian dan Sertifikasi Mutu Barang Provinsi Sumatera Barat `LP-012-IDN` | Sumatera Barat | 4 |
| UPTD Balai Pengujian dan Sertifikasi Mutu Barang Dinas Perdagangan dan Perindustrian Provinsi Bali `LP-553-IDN` | Bali | 3 |
| PT Biochem Technology `LP-286-IDN` | Jawa Timur | 2 |
| Balai Standardisasi dan Pelayanan Jasa Industri Samarinda `LP-060-IDN` | Kalimantan Timur | 1 |

---

## Yang belum dijawab, dan siapa yang menjawabnya

- **Berapa batasnya.** Tidak ada satu angka batas pun di halaman ini. Itu no. 17, dan
  memasukkannya ke sini akan membuat tabel yang terlihat pasti padahal pasalnya tidak
  ikut. Halaman ini menyiapkan alamatnya: ke laboratorium mana sampel dikirim.
- **Apakah pembeli benar-benar menolak.** Yang tercatat kemampuan mengukur, bukan
  praktik penolakan. Sebuah parameter bisa terukur rapi dan tidak pernah dipakai menolak;
  sebaliknya, pembeli bisa menolak atas alasan yang tidak ada di daftar mana pun.
- **Tarif dan waktu tunggu pengujian.** Tidak terbit di mana pun; harus ditanyakan
  langsung ke laboratoriumnya.
