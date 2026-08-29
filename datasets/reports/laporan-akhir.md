# Laporan akhir — panen dataset penyakit tanaman hortikultura

Tanggal panen: **25 Agustus 2026**. Empat agen berjalan paralel di bawah satu kontrak
bersama ([KETENTUAN.md](../metadata/KETENTUAN.md)): satu agen per tanaman prioritas,
dengan agen bawang merah merangkap lapis epidemiologi dan basis pengetahuan.

Inventaris lengkap tiap dataset ada di [dataset-inventory.md](dataset-inventory.md);
katalog mesinnya di [`../metadata/dataset-catalog.csv`](../metadata/dataset-catalog.csv).
Berkas ini memuat penilaian dan kesimpulan — hal-hal yang tidak bisa diturunkan otomatis
dari katalog.

---

## Ringkasan

**120 kandidat ditelusuri tuntas. 47 diunduh. 27,19 GB. 26.762 checksum diuji ulang
oleh koordinator, nol tidak cocok.**

| status unduh | | status verifikasi | |
|---|---:|---|---:|
| `diunduh` | **47** | `terverifikasi` | 32 |
| `ditemukan` | 21 | `sebagian` | 15 |
| `ditolak` | 18 | `belum` | 33 |
| `terhalang-akun` | 16 | `tidak-berlaku` | 40 |
| `terlalu-besar` | 12 | | |
| `gagal` | 6 | | |

Ketiga kata itu tidak dipertukarkan di mana pun dalam koleksi ini. `ditemukan` berarti
sumbernya tertelusur dan disknya kosong. `diunduh` berarti berkasnya ada dan checksumnya
terhitung. `terverifikasi` berarti arsipnya dibuka, isinya dicacah, dan cacahnya cocok
dengan yang diklaim penerbitnya. Yang cacahnya meleset turun ke `sebagian` — **15 dataset
masuk golongan itu, dan selisihnya ditulis satu per satu**, bukan dibulatkan.

### Cakupan per tanaman prioritas

| tanaman | kandidat | diunduh | dataset **citra** | terverifikasi |
|---|---:|---:|---:|---:|
| Cabai | 35 | 15 | 10 | 7 |
| Tomat | 50 | 21 | 15 | 17 |
| Kentang | 36 | 22 | 13 | 17 |
| Bawang merah | 13 | 6 | **2** | 4 |

Dataset multi-tanaman terhitung di setiap tanaman yang dicakupnya, jadi kolom-kolom ini
tidak boleh dijumlahkan.

---

## Tiga hal yang paling penting dari panen ini

### 1. Ada dataset yang mengaku sebagai data lapangan, padahal salinan dataset lain

Diuji byte demi byte, bukan disimpulkan dari kemiripan:

- **CAB-08 (Brasil, 2024) seluruhnya ada di dalam CAB-03 (klaim Bangladesh, 2025).**
  1.523 isi unik, **100% berkas CAB-08 ditemukan di CAB-03**, menyusun **91,6%** kelas
  `Cercospora_Leaf_Spot` di sana. Nama berkasnya ditulis ulang:
  `DATASET_FINAL_FOLHAS/1208__roi_backremoved.jpg` → `Cercospora Leaf Spot_1047.jpg`.
  Nama aslinya bahkan menyebut langkah pengolahannya sendiri (`roi_backremoved`).
- **86% isi CAB-05 adalah PlantVillage.** 856 dari 992 berkas uniknya identik dengan
  TOM-01. Agen cabai sebelumnya menemukan folder `Leaf_Curl`-nya berisi gambar
  *bacterial spot* — jadi labelnya pun salah, bukan cuma asal-usulnya.
- **257 berkas PlantDoc ada di dalam TOM-05**, dataset yang terbit sebagai foto lapangan
  Pakistan.
- **KEN-16 menyatakan *"all images have been preserved in their original resolutions"* —
  dan itu tidak benar.** Pengukuran seluruh 6.116 berkas lewat penanda SOF header JPEG:
  **975 gambar (15,9%) berukuran tepat 224×224**, ukuran masukan CNN baku yang mustahil
  keluar dari kamera, dan blok itu menempati indeks bersambung 13..1029 — pola khas
  kumpulan gabungan dari sumber lain yang sudah dipraproses. Hanya 25,9% yang benar-benar
  berdimensi kamera resolusi penuh.
- Agen cabai juga menemukan sepasang dataset Mendeley terbitan Oktober 2025 (klaim
  Karnataka) dan Februari 2025 (klaim Jamalpur, Bangladesh) yang **berbagi berkas
  byte-identik menurut umuman checksum kedua penerbitnya sendiri** — lengkap dengan
  bagian "Steps to Reproduce" yang merinci lahan India.

Artinya: **provenans yang tertulis di rekaman repositori tidak bisa dipercaya begitu
saja.** Untuk kebutuhan pelatihan model, ini bukan soal etika saja — dua dataset yang
"berbeda" dipakai sebagai latih dan uji akan memberi akurasi palsu yang tinggi.

### 2. Yang hilang bukan gambar, melainkan penyakit yang tak bisa difoto

Empat penyakit paling mematikan di lapangan Indonesia **nol dataset citra** di seluruh
panen: **layu fusarium** (cabai, bawang merah, tomat), **layu bakteri *Ralstonia*** pada
cabai, ***Phytophthora capsici***, dan **CMV**. Pencarian DataCite khusus untuk keempatnya
mengembalikan nol — datanya memang belum ada, bukan luput dicari.

Ini bukan kebetulan. Layu adalah penyakit **pembuluh**: gejalanya di dalam batang dan akar,
sementara seluruh tradisi dataset penyakit tanaman dibangun di atas foto daun. TOM-16
(Sichuan) membuktikan celah itu bisa ditutup — ia memberi label per **bagian tanaman**
(`Wilt_Base` 173 · `Wilt_Stem` 135 · `Wilt_Middle` 345 · `Wilt_Top` 298 · `Wilt_Leaf` 405),
memetakan layu yang menaik dari pangkal ke pucuk pada foto tanaman utuh. Geometri seperti
itu mustahil direkam dataset daun-petik.

**Dan penutupan sebagian justru menambah bahaya.** Sekarang koleksi ini mengenali layu
bakteri tomat tapi tetap buta pada layu fusarium — dua penyakit yang gejala luarnya nyaris
sama dan hanya bisa dibedakan lewat uji potong batang, bukan foto. Sistem yang dilatih dari
sini akan menjawab "layu bakteri" dengan yakin untuk tanaman yang kena fusarium.
**Syarat rilis: setiap jawaban layu bakteri wajib disertai peringatan bahwa fusarium tidak
terbedakan dari foto.**

### 3. Angka besar didominasi augmentasi, bukan pengamatan

Untuk kentang, dari ~198 ribu gambar yang terunduh hanya **14.885 yang bisa dipastikan
citra asli — 7,5%**; satu dataset augmentasi sendirian menyumbang 138.000 tanpa satu pun
induk yang disertakan. Angka asli itu naik 3,5× lipat selama panen ini (4.212 → 8.816 →
14.885) lewat dua putaran susulan, dan turun lagi jadi **12.641** bila duplikasi
PlantVillage di KEN-11 dan pasangan beda-ukuran di KEN-16 ikut dipotong. Pola yang sama muncul di tomat (TOM-05: "7.200" sebenarnya 830 asli) dan
bawang merah (BWM-01: 4.502 teraugmentasi dari 816 mentah).

Kolom `record_count` di katalog karena itu **selalu menuliskan keduanya** bila diketahui —
misalnya `830 asli + 7200 augmentasi`, bukan `8030`. Jangan pernah menjumlahkan kolom itu
untuk mengklaim ukuran korpus.

---

## 1. Dataset prioritas yang berhasil diunduh

Rinciannya di [bagian 1 inventaris](dataset-inventory.md#1-dataset-prioritas-yang-berhasil-diunduh).
Ringkasan cakupan penyakit:

**Cabai (10 dataset citra).** Virus kuning keriting daun (begomovirus) tertutup paling
tebal — tiga dataset, termasuk **CAB-01 dari Bogor dan Cianjur dengan label divalidasi
PCR**, satu-satunya sumber berdata Indonesia di seluruh panen. Cercospora, bacterial spot,
powdery mildew (*Leveillula taurica*), dan *murda complex* (tungau *Polyphagotarsonemus
latus* + trips *Scirtothrips dorsalis*) juga ada. **Antraknosa/patek pada buah — penyakit
cabai nomor satu di Indonesia — hanya diwakili 174 citra**, dan itu pun tanpa nama
penyakit; semua dataset lain memotret daun.

**Tomat (15 dataset citra).** Cakupan terlengkap: daun (10 kelas PlantVillage), **buah**
(TOM-07 delapan kelas, termasuk antraknosa dan busuk ujung buah), dan **batang** lewat
TOM-16. Hawar dini dan hawar daun berlapis-lapis banyaknya. Akar tetap nol, padahal di
situlah infeksi layu bermula.

**Kentang (13 dataset citra).** Satu-satunya tanaman dengan sisi **umbi** tertutup serius:
black scurf, blackleg, brown rot, common scab, dry rot, pink rot, soft rot, gangren, busuk
akar ungu, PSTVd, dan retak PVY. Tapi dua kelas yang paling menentukan mutu justru paling
tipis — **common scab 60 citra asli, black scurf 49**. Masih nol: silver scurf, powdery
scab, nematoda sista (*Globodera*), dan *Verticillium*.

**Bawang merah (2 dataset citra).** Trotol (*Alternaria porri*), IYSV, dan *Stemphylium*
ada — tapi keduanya dari **bawang bombay India**, bukan *A. cepa* var. *aggregatum*. Satu
di antaranya bahkan tanpa nama penyakit sama sekali, hanya biner sehat/sakit, dan 75%
isinya umbi. **Moler (*Fusarium* f.sp. *cepae*) dan embun bulu (*Peronospora destructor*)
nol** — dan keduanya juga nol rekaman Indonesia di GBIF, 404 di EPPO, nol di Wikidata.

## 2. Dataset prioritas yang ditemukan tetapi belum dapat diunduh

**47 baris**, terbagi empat sebab. Daftar lengkapnya di
[bagian 2 inventaris](dataset-inventory.md#2-dataset-prioritas-yang-ditemukan-tetapi-belum-dapat-diunduh).

- **`ditemukan` (19)** — tertelusur dan sah, tapi tidak diunduh: jatah agen habis, atau
  sudah diambil agen lain dengan id berbeda, atau rekamannya ternyata kosong.
- **`terlalu-besar` (10)** — melampaui pagu 3 GB per dataset. Yang paling disayangkan:
  *Diamant* (8,94 GB, segmentasi cacat permukaan umbi), CAB-13 ChiLCV (16,9 GB), dan
  KEN-18 mikroskopi umbi (37,5 GB). Semuanya berlisensi terbuka dan tinggal diunduh kalau
  pagunya dinaikkan — **ini kendala anggaran, bukan kendala akses.**
- **`terhalang-akun` (13)** — Kaggle, Roboflow, IEEE DataPort, Springer, ScabyNet
  (permintaan ke pemulia), dan CABI (berbayar). Tidak ada yang ditembus. Dua di antaranya
  bernilai tinggi dan hanya butuh satu akun gratis: Roboflow
  `rizoma/anthracnose-klasifikasi-chili` (ruang kerja berbahasa Indonesia × antraknosa) dan
  Kaggle `dhenyd/chili-plant-disease` (kelasnya persis kosakata masalah cabai Indonesia).
- **`gagal` (5)** — TOM-15 (Dryad, CC0) menolak di **kedua** endpoint API resminya dengan
  401 `must have current bearer token`; tidak dicari jalan lain. BWM-B16
  (`ditlin.hortikultura.pertanian.go.id`) **NXDOMAIN** — lihat bagian 6.

## 3. Dataset tambahan di luar empat tanaman prioritas

17 baris — dataset yang tidak menyentuh satu pun tanaman prioritas. Ada di
[bagian 3 inventaris](dataset-inventory.md#3-dataset-tambahan-di-luar-empat-tanaman-prioritas).
Yang berdiri sendiri sebagai nilai jangka panjang:

- **PlantVillage** (54.303 gambar, 14 tanaman) dan **PlantDoc** (2 varian, dengan anotasi
  PASCAL VOC) — rujukan wajib, keduanya di `additional/` karena cakupannya belasan tanaman.
- **PhytoScope** — 20.723 gambar lapangan, 105 kelas, 25 tanaman, berkotak-batas.
- **Lapis basis pengetahuan**: EPPO (1.803 baris distribusi), GloBI (14.532 baris interaksi
  patogen–inang), Wikidata (291 baris, **CC0**), dan buku OPT Ditjen Hortikultura
  (133 halaman, Balitsa & BPTP Jambi). GloBI menambal keempat patogen *Allium* yang tidak
  dipunyai EPPO, dengan *Allium ascalonicum* disebut eksplisit 19 kali.

## 4. Dataset yang ditolak beserta alasannya

18 baris di [bagian 4 inventaris](dataset-inventory.md#4-dataset-yang-ditolak-beserta-alasannya).
Empat pola penolakan:

1. **Halaman ringkasan, bukan dataset** — artikel jurnal dan halaman landing tanpa berkas.
2. **Rekaman penunjuk kosong** — mis. DOI `10.17632/sd5m3mgvvx.1`, yang isinya hanya
   `image.png` dan `SFLD_Dataset.txt` 133 byte. **Dua agen menemukannya terpisah dan
   sama-sama menolaknya** — konvergensi dua pencarian independen.
3. **Duplikasi yang dicegah di muka** — lihat bagian 5.
4. **Data pribadi** — berkas OPT Cilacap sengaja tidak diunduh. Koordinator memeriksanya
   ulang: benar memuat NIP (45 kemunculan) dan nama pejabat, **dan sektornya salah** —
   isinya perkebunan (kelapa, cengkeh, kopi, karet) dan padi, nol hortikultura.

Satu penolakan yang layak disorot: **USDA Fungus–Host Distributions** (421 ribu asosiasi
jamur–inang) punya kunci API yang tertanam di bundel JavaScript publiknya. Agen menolak
memakainya karena operator jelas memasang gerbang. Dicatat `terhalang-akun`; jalur yang
benar adalah menyurati ARS.

## 5. Duplikasi yang ditemukan

Diperiksa tiga lapis, karena dua lapis pertama buta pada kasus yang paling penting.

| lapis | cara | temuan |
|---|---|---|
| 1. antar-baris katalog | `sha256` dan `source_url` yang sama | 3 URL diklaim dua agen |
| 2. antar-berkas terdaftar | seluruh `SHA256SUMS.txt` disilangkan | 0 |
| 3. **isi di dalam arsip** | sidik (CRC32, ukuran) tiap berkas di dalam ZIP + tiap berkas lepas | **6 pasangan** |

Lapis 1 dan 2 melaporkan nol duplikasi isi. Yang membongkarnya lapis 3
([`periksa-tumpang-tindih.py`](../metadata/periksa-tumpang-tindih.py), 532.378 berkas
tersidik dari 46 dataset) — karena checksum katalog hanya menyidik **arsip luar**, jadi
dataset yang mengemas ulang dataset lain dengan nama berkas diganti lolos tanpa suara.

Tiga URL yang diklaim dua agen semuanya **terselesaikan tanpa unduhan ganda**: berkas klaim
bersama bekerja. Dataset COLD terbit sebagai dua DOI — agen bawang merah menandai separuh
cabainya `ditolak` dengan catatan "DUPLIKASI DICEGAH" dan menyerahkannya ke agen cabai.

### 5.3 Duplikat di dalam satu dataset

Lapis ketiga juga menghitung duplikat internal, yang tidak terlihat kalau hanya
membandingkan antar dataset. Ini menggerus cacah yang diiklankan penerbit:

| dataset | diklaim/terhitung | unik | duplikat internal |
|---|---:|---:|---:|
| KEN-16 (hawar daun) | 6.116 | **6.069** | 47 |
| KEN-15 (hawar bertahap) | 1.561 | **1.544** | 17 |
| CAB-02 (ChiLCV) | 22.829 | **12.223** | 10.606 |
| CAB-03 (6 kelas) | 8.817 | **7.936** | 881 |
| CAB-01 (begomovirus Jabar) | 5.095 | **1.959** | 3.136 |

CAB-01 kasus terburuk: penerbitnya menyatakan citra diperbanyak dengan *cropping*, tapi
SHA-256 membuktikan 3.136 berkasnya **salinan bit-demi-bit**, bukan potongan berbeda.

**Batas metode ini harus dinyatakan**: uji CRC hanya menangkap salinan **bit-demi-bit**.
Salinan yang diperkecil atau dikode ulang lolos — terbukti pada KEN-11, yang arsipnya
bernama `..._1024px_yolov8.zip` dan menurut agen kentang memuat 2.152 gambar PlantVillage,
tapi tidak muncul sama sekali di lapis 3 karena gambarnya sudah diubah ukuran.
**Enam pasangan itu batas bawah, bukan hitungan akhir.**

## 6. Kekurangan data dan rekomendasi pencarian lanjutan

### Yang tidak bisa ditambal dengan mencari lebih keras

**Tidak ada satu pun deret waktu serangan penyakit hortikultura Indonesia sebagai data
terbuka.** Ini diperiksa dua kali secara independen:

- Agen: `ditlin.hortikultura.pertanian.go.id` **NXDOMAIN** — lembaga yang memegang data
  luas serangan OPT hortikultura tidak lagi punya alamat. `satudata.pertanian.go.id` hidup
  dengan 277 dataset, **nol tentang OPT**. `bsip` dan `balitsa` juga NXDOMAIN, dikonfirmasi
  lewat proksi, bukan hanya probe lokal.
- Koordinator: sapuan portal CKAN provinsi — `data.jatimprov.go.id` 404, `data.go.id` 404,
  `opendata.jabarprov.go.id` 403, hanya Jateng hidup. Satu-satunya dataset serangan OPT di
  sana (Cilacap, CC-BY, deret 2018–2021 + bulanan 2026) dibuka isinya: **perkebunan dan
  padi, nol hortikultura**.

Konsekuensinya tegas: **analisis epidemiologi untuk keempat tanaman prioritas tidak dapat
dilakukan dari data terbuka yang ada.** Jalan yang tersisa adalah permintaan resmi ke
Kementan/BBPOPT, bukan pencarian lanjutan.

### Yang bisa ditambal, diurut menurut ongkos

1. **Naikkan pagu ukuran.** 10 dataset prioritas berstatus `terlalu-besar` berlisensi terbuka dan tinggal
   diunduh. Termasuk *Diamant* (segmentasi cacat umbi) dan CAB-13 (16,9 GB ChiLCV).
   Ongkosnya murni disk.
2. **Buat satu akun Kaggle dan satu akun Roboflow.** Membuka 13 dataset prioritas
   berstatus `terhalang-akun`,
   dua di antaranya berbahasa Indonesia dan tentang antraknosa cabai — celah nomor satu
   cabai. Ini keputusan pengguna, bukan sesuatu yang boleh ditembus agen.
3. **Ambil `EB.zip` dari PLDD-UP (2,77 GB, CC BY 4.0).** KEN-16 masuk sebagai penyumbang
   citra asli berlabel terbesar kedua (6.069), **tapi hanya satu kelas** — hawar daun —
   sehingga belum bisa melatih pengklasifikasi sendirian. `EB.zip` dari kampanye
   pengambilan yang sama memberi kelas pembanding tanpa pergeseran domain, yang tidak bisa
   diberikan dataset lain mana pun. Muat di bawah pagu 3 GB bila diambil sendiri.
4. **Anotasi 1.561 citra KEN-15.** Deposit-nya menyatakan terus terang bahwa label kelas,
   anotasi kotak, dan manifes split tidak disertakan. Citranya asli dan lapangan;
   yang kurang cuma pekerjaan pelabelan.
5. **Pilah CAB-01 secara manual.** Satu-satunya dataset Indonesia, label ber-PCR — tapi
   mencampur cabai dengan terung dan kacang panjang **tanpa penanda tanaman sama sekali**.
6. **Tulis entri basis pengetahuan untuk layu bakteri dan layu fusarium.** TOM-08 memuat
   9 penyakit daun dan **tidak punya entri untuk keduanya** — jadi sistem kini bisa
   *mengenali* layu bakteri tapi tidak bisa *menjelaskannya*. Sumbernya BSIP/Balitsa.
7. **Surati USDA ARS** untuk Fungus–Host, dan **Kementan/BBPOPT** untuk statistik OPT.

### Celah yang harus diisi dengan pengumpulan data sendiri

Tidak ada sumbernya di mana pun di dunia, menurut penelusuran ini: **moler bawang merah**,
**embun bulu bawang merah**, **layu fusarium cabai dan tomat**, ***Phytophthora capsici***,
dan **antraknosa buah cabai** dalam jumlah yang layak. Untuk bawang merah, akar masalahnya
bukan ketiadaan riset melainkan **data yang tidak pernah dideposit** — sebuah dataset JOSH
berisi 1.188 gambar dengan lima kelas yang persis dibutuhkan, termasuk moler dan trotol,
tapi halamannya menyatakan unduhannya belum tersedia.

---

## 7. Penilaian kelayakan per tanaman

Skala: **kuat** (siap pakai) · **cukup** (bisa dipakai dengan syarat) · **lemah**
(hanya purwarupa) · **tidak memadai**.

### Cabai

| kegunaan | nilai | alasan |
|---|---|---|
| Identifikasi penyakit | **cukup** | Kuat untuk virus keriting daun dan Cercospora; buta pada layu fusarium, layu bakteri, *P. capsici*, CMV. Antraknosa buah hampir tak terwakili. |
| Pelatihan computer vision | **cukup** | ~50 ribu gambar, tapi CAB-05 86% PlantVillage dan CAB-03 91,6% kelas Cercospora-nya salinan CAB-08 — **wajib didedup sebelum split**, kalau tidak akurasinya palsu. |
| Basis pengetahuan | **lemah** | Nama kelas saja; deskripsi gejala dan patogen harus dari buku Ditjen Hortikultura, bukan dari dataset. |
| Analisis epidemiologi | **tidak memadai** | Nol deret waktu. CAB-01 punya lokasi (Bogor, Cianjur) tapi satu titik waktu. |

### Tomat

| kegunaan | nilai | alasan |
|---|---|---|
| Identifikasi penyakit | **kuat** | Daun, buah, dan batang terwakili. **Dengan satu syarat rilis**: jawaban layu bakteri wajib memuat peringatan fusarium. |
| Pelatihan computer vision | **kuat** | Terbanyak dan paling beragam; PlantVillage (studio) berpasangan dengan PhytoScope, Tomato-Village, dan TOM-16 (lapangan). TOM-16 satu-satunya yang memungkinkan split bebas kebocoran berbasis sesi karena nama berkasnya menyandi tanggal. |
| Basis pengetahuan | **lemah** | TOM-08 hanya 9 penyakit daun, tanpa entri layu bakteri maupun fusarium. |
| Analisis epidemiologi | **lemah** | TOM-16 menyumbang jejak musiman nyata (gray mold hanya Mei–Juni; layu bakteri 478 dari 527 di Okt–Nov), tapi hanya 5 titik waktu di satu rumah kaca. |

### Kentang

| kegunaan | nilai | alasan |
|---|---|---|
| Identifikasi penyakit | **cukup** | Daun kuat, umbi tertutup untuk 11 kondisi — tapi common scab 60 dan black scurf 49 citra asli terlalu tipis untuk diandalkan. Nol: silver scurf, powdery scab, nematoda sista, *Verticillium*. |
| Pelatihan computer vision | **cukup** | Volume besar menyesatkan: ~8.800 asli dari ~154 ribu. **Penapisan/grading umbi kuat** (36.000 citra, split bawaan bersih); **diagnosis bernama patogen masih lemah** — dua hal yang tidak boleh tertukar. |
| Basis pengetahuan | **cukup** | Kelas umbi bernama patogen lengkap dengan nama ilmiahnya. |
| Analisis epidemiologi | **cukup** | Satu-satunya tanaman yang punya bahan nyata: 7.634 baris pengamatan lapangan CIP berlisensi terbuka dengan AUDPC. Tapi **nol data cuaca**, jadi model peringatan (Smith Period, NegFry, BLITECAST) tidak bisa dijalankan, dan nol data Indonesia. |

### Bawang merah

| kegunaan | nilai | alasan |
|---|---|---|
| Identifikasi penyakit | **tidak memadai** | Dua penyakit terpenting — moler dan embun bulu — nol. Yang ada dari bawang bombay India. |
| Pelatihan computer vision | **lemah** | Cukup untuk purwarupa saja: risiko kebocoran augmentasi, purple blotch hanya 18 gambar asli, dan jurang domain India→Indonesia belum teruji. |
| Basis pengetahuan | **kuat** | Bagian terbaiknya. GloBI menambal keempat patogen *Allium* yang EPPO tak punya; buku Ditjen Hortikultura memberi gejala, ambang kendali, dan bahan aktif dalam bahasa Indonesia. Bisa dipakai sekarang. |
| Analisis epidemiologi | **tidak memadai** | Sama seperti tiga tanaman lain: tidak ada deret waktu Indonesia. |

---

## 8. Lisensi

| keluarga | jumlah baris |
|---|---:|
| CC BY | 75 |
| tidak dinyatakan | 28 |
| CC0 | 6 |
| CC BY-NC / CC BY-NC-SA | 5 |
| CC BY-SA | 2 |
| tertutup / berbayar | 2 |

Yang perlu diperhatikan sebelum memakai:

- **CC BY-SA 3.0 pada PlantVillage** menular: karya turunan wajib berbagi-serupa.
- **CC BY-NC memblokir pemakaian komersial** — KEN-11 dan TOM-14. KEN-11 malah punya
  **percanggahan lisensi**: `data.yaml` bawaannya menulis `license: Private` sementara
  Zenodo menyatakan CC BY-NC 4.0. Yang mengikat pernyataan Zenodo, tapi NC tetap berlaku.
- **28 baris "tidak dinyatakan"** — berkasnya terbuka publik, tapi menerbitkan ulang
  berisiko. Termasuk Tomato-Village dan buku Ditjen Hortikultura.
- **CAB-11 membawa pernyataan lisensi yang bertentangan** antara metadata dan isi arsip.
- **TOM-09 hampir pasti hasil scraping** — folder-nya harfiah bernama `- Google Search`.
  Klaim CC BY penyetornya tidak menutupi hak cipta pemilik gambar aslinya.

## 9. Reproduksi

```bash
python3 datasets/metadata/rakit-katalog.py            # rakit katalog + periksa duplikat lapis 1-2
python3 datasets/metadata/periksa-koleksi.py --penuh  # verifikasi ulang SELURUH checksum
python3 datasets/metadata/periksa-tumpang-tindih.py   # duplikasi isi di dalam arsip (lapis 3)
python3 datasets/metadata/bangun-inventaris.py        # bangun ulang dataset-inventory.md
```

`datasets/**/raw/` dipagari di `.gitignore`: muatannya bisa ditarik ulang dari `source_url`
dan checksumnya tersimpan, jadi yang naik ke repo hanya metadata, README, katalog, dan
laporan — mengikuti pola `toko_data/raw/` dan `harga_data/mentah/` yang sudah ada di repo
ini.
