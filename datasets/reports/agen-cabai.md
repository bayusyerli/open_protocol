# Laporan Agen Cabai — panen dataset penyakit tanaman

- **Agen**: Agen 1 dari 4 (cabai — *Capsicum annuum* / *C. frutescens*)
- **Prefiks dataset_id**: `CAB`
- **Tanggal panen**: 2026-08-25
- **Direktori kerja**: `/Users/syera/open_protocol`
- **Berkas klaim**: `datasets/metadata/klaim/cabai.tsv`
- **Baris katalog**: `datasets/metadata/rows/cabai.csv` (28 baris, tanpa header)

---

## 1. Ringkasan cacah per status

Kandidat yang ditelusuri sampai tuntas: **28**.

| `download_status` | jumlah | dataset_id |
|---|---:|---|
| `diunduh` | **10** | CAB-01, CAB-02, CAB-03, CAB-04, CAB-05, CAB-06, CAB-08, CAB-09, CAB-11, CAB-12 |
| `terhalang-akun` | 7 | CAB-17, CAB-18, CAB-19, CAB-20, CAB-21, CAB-22, CAB-23 |
| `terlalu-besar` | 3 | CAB-07, CAB-10, CAB-13 |
| `ditemukan` | 3 | CAB-14, CAB-15, CAB-16 |
| `ditolak` | 3 | CAB-26, CAB-27, CAB-28 |
| `gagal` | 2 | CAB-24, CAB-25 |

| `verification_status` | jumlah |
|---|---:|
| `terverifikasi` | 3 (CAB-01, CAB-06, CAB-12) |
| `sebagian` | 7 (CAB-02, CAB-03, CAB-04, CAB-05, CAB-08, CAB-09, CAB-11) |
| `belum` | 5 |
| `tidak-berlaku` | 13 |

Ukuran total di disk: **7,28 GiB (7,82 GB desimal)** dari pagu 8 GB per agen. Dataset terbesar
CAB-03 (2.916 MiB) dan CAB-04 (2.098 MiB) — keduanya di bawah pagu 3 GB per dataset.

**Setiap arsip yang diunduh sudah benar-benar dibuka**, bukan sekadar diperiksa ukurannya:
ZIP dengan `unzip -t` + `python3 zipfile`, RAR dengan pengurai header RAR4/RAR5 buatan sendiri
(lingkungan tidak punya `unrar`), XLSX dengan `zipfile` + `ElementTree`. Tidak ada satu pun
kode dari repositori temuan yang dijalankan.

---

## 2. Berhasil diunduh

Urut dari yang paling berguna untuk Pranatani.

### CAB-04 — Chili Leaf Disease Dataset (Dhaka International University, Bangladesh)
`datasets/priority/cabai/CAB-04-chili-4-kelas-dhaka` · CC BY 4.0 · 2.097 MiB
Antraknosa 347 · Cercospora 367 · Fresh Leaf 432 (Leaf Curl 369 tidak diunduh, lihat README).
**Dataset cabai paling bersih dalam panen ini**: 0% duplikat (dikonfirmasi dua cara), 0 tumpang
tindih antar kelas, 100% citra ≥1728 px di kedua sisi, cacah persis sama dengan klaim sumber
(1.515), dan ada CSV metadata 10 kolom per gambar. **Satu-satunya sumber citra daun antraknosa**
dalam seluruh panen.

### CAB-02 — Chilli Leaf Curl Virus Dataset Final Ver (Coimbatore, India)
`datasets/priority/cabai/CAB-02-chilcv-coimbatore-figshare` · CC BY 4.0 · 985 MiB
22.829 berkas → **12.223 gambar unik**, 3 kelas bertingkat keparahan (Healthy / Initial / Severe).
Satu-satunya dataset dengan **metadata lapangan per gambar** (plant_id, desa, tanggal, sesi),
sehingga bisa menyusun kurva perkembangan penyakit per tanaman. Ada `OOD_Set` tiga model ponsel.
MD5 cocok dengan Figshare. Catatan penting: 46,46% berkasnya duplikat, tetapi 4.925 dari 4.927
kelompok duplikat tetap di dalam satu split dan satu kelas — pembagian latih/uji praktis sahih,
yang salah cuma angkanya.

### CAB-01 — A dataset of Yellow Disease in Horticultural Plant (Jawa Barat, INDONESIA)
`datasets/additional/CAB-01-penyakit-kuning-begomovirus-jabar` · CC BY 4.0 · 213 MiB
**Satu-satunya dataset berdata Indonesia dalam seluruh panen** (Kabupaten Bogor, Kota Bogor,
Kabupaten Cianjur, Jawa Barat) dan **satu-satunya dengan label yang dikonfirmasi PCR**
(Begomovirus positif/negatif). 5.095 citra + 5.095 anotasi YOLO; **seluruh 10.190 SHA-256 dicek
satu per satu, 0 selisih**. Di `additional/` karena memuat tiga tanaman (cabai merah, terung,
kacang panjang). Kelemahan besarnya: identitas tanaman tidak terekam sama sekali, dan efektifnya
hanya **1.959 citra berbeda** (61,6% salinan bit-demi-bit).

### CAB-03 — Chilli Leaf Disease Image Dataset, 6 kelas (Bangladesh)
`datasets/priority/cabai/CAB-03-chilli-6-kelas-bangladesh` · CC BY 4.0 · 2.916 MiB
8.817 berkas → **7.936 gambar unik**, **cakupan kelas terluas** (Bacterial Spot, Cercospora,
Curl Virus, Healthy, Nutrition Deficiency, Powdery Mildew). Seluruh 2.057 SHA-256 cocok. Dua
masalah besar: klaim "resolusi tinggi 1000×1000" tidak benar (hanya 23% yang benar 1000×1000,
40,6% justru 256×256), dan kelas Cercospora-nya terbukti 90,5% menyalin CAB-08 (lihat bagian 6).

### CAB-11 — chilli dataset / bagian cabai dari COLD (Koppal, Karnataka, India)
`datasets/priority/cabai/CAB-11-cold-chilli-koppal` · lisensi bertentangan (CC BY vs CC BY-NC) · 519 MiB
13.983 berkas JPG dalam 3 arsip RAR, 5 kelas. **Satu-satunya dataset dengan kelas HAMA**
(`murda complex` = tungau *Polyphagotarsonemus latus* + trips *Scirtothrips dorsalis*) dan salah
satu dari dua yang punya embun tepung. Ketiga SHA-256 cocok. Kelemahan: kebocoran latih/uji
78,9% pada folder `augment/`, ejaan kelas tidak konsisten, dan status lisensinya belum pasti.

### CAB-12 — TCP (Tomato-Chilli-Papaya) Disease Dataset (Rajasthan, India)
`datasets/additional/CAB-12-tcp-tomat-cabai-pepaya` · CC BY 4.0 · 190 MiB
9.541 gambar, 20 kelas, 2.818 di antaranya cabai. **Satu-satunya sumber CITRA BUAH CABAI**
(`Disease Chilli` 174 + `Health chilli` 218). SHA-256 dan ukuran cocok persis. Resolusi rendah
(16–60 KB per gambar). Hanya 1 dari 2 berkas di DOI yang diunduh.

### CAB-08 — Cercospora Leaf Spot in Chili Pepper Leaves (Sergipe, Brasil)
`datasets/priority/cabai/CAB-08-cercospora-sergipe-zenodo` · CC BY 4.0 · 269 MiB
1.738 berkas (1.523 unik), satu kelas, sudah dipotong ROI dan dihapus latarnya. Cacah cocok
persis dengan klaim. **Seluruh isinya termuat di dalam CAB-03** — jangan digabung.

### CAB-05 — Pepper Leaf DataSet (paprika)
`datasets/priority/cabai/CAB-05-pepper-leaf-figshare` · CC BY 4.0 · 27 MiB
1.308 berkas (992 unik). MD5 cocok dengan Figshare, **tetapi labelnya terbukti tidak sahih**:
folder `Leaf_Curl` 315 dari 335 berkasnya justru gambar *bacterial spot* PlantVillage. Disimpan
sebagai bahan bukti dan sebagai penjelas beda paprika vs cabai Indonesia, **bukan** untuk dilatih.

### CAB-09 — Pepper Diseases and Pests Detection
`datasets/priority/cabai/CAB-09-pepper-penyakit-hama-mendeley` · CC BY 4.0 · 211 MiB
100 JPG tanpa label apa pun, meski deskripsi menjanjikan "gambar dan metadata beranotasi".
SHA-256 cocok persis. Nilainya hanya sebagai 100 foto cabai resolusi tinggi berlisensi CC BY.

### CAB-06 — Nitrogen availability shapes anthracnose severity (Thailand)
`datasets/priority/cabai/CAB-06-antraknosa-nitrogen-tabular` · CC BY 4.0 · 1,5 MiB
Satu-satunya data **tabular** yang berhasil diunduh. Ketiga MD5 cocok. Isinya ternyata molekuler
(DEG, GO, primer qPCR), **bukan** keparahan penyakit lapangan seperti yang disiratkan judulnya.

---

## 3. Ditemukan tapi belum bisa diunduh

### Terhalang akun (7)
| id | sumber | kenapa penting |
|---|---|---|
| CAB-17 | Frontiers, 5.669 citra, 6 kelas | **Cakupan kelas terbaik dari semua kandidat**: satu-satunya yang punya *pepper blight* (Phytophthora) dan *botrytis* sekaligus antraknosa. Tidak ada repositori — hanya "tersedia atas permintaan penulis". |
| CAB-18 | Springer, 534 citra dari **Benin** | Iklim tropis lembab Benin jauh lebih mirip Indonesia daripada Bangladesh/Deccan, dan kelasnya persis dua penyakit terpenting di Indonesia (antraknosa + TYLCV). Halaman artikel mengalihkan ke SSO. |
| CAB-19 | Kaggle `dhenyd/chili-plant-disease` | Nama pemilik berbau Indonesia; kelasnya (whitefly, yellowish, leaf curl) persis kosakata masalah cabai Indonesia. **Kandidat unduhan pertama** kalau ada token Kaggle. |
| CAB-20, CAB-21 | Kaggle lain | Metadata tidak terbaca (halaman dirender JavaScript). |
| CAB-22 | Roboflow `ptata/chili-anthracnose-disease` | Antraknosa **beranotasi kotak**, bukan sekadar klasifikasi. |
| CAB-23 | Roboflow `traker-rempah-rempah-bumbu-dapur-rizoma/anthracnose-klasifikasi-chili` | **Kandidat Indonesia paling menjanjikan**: nama ruang kerja berbahasa Indonesia, judul memakai "Klasifikasi", dan temanya antraknosa — lubang data terbesar. |

Tidak satu pun dinding akun ini ditembus (KETENTUAN bagian 2.1). Halaman Kaggle dan Roboflow
dirender JavaScript / membalas HTTP 403 untuk pengambil otomatis, sehingga lisensi dan cacah
citranya **tidak bisa diverifikasi** — metadata di katalog untuk baris-baris ini ditandai berasal
dari hasil pencarian, bukan dari halaman sumber.

### Terlalu besar (3)
- **CAB-13** figshare 31035043 — 16,1 GiB dalam satu ZIP, tanpa subset resmi. Penulis dan tema
  sama dengan CAB-02, jadi CAB-02 (985 MiB, sudah berlabel dan bermetadata) menggantikannya.
- **CAB-07** & **CAB-10** — pasangan duplikat, lihat bagian 6.

### Ditemukan tapi sengaja tidak diunduh (3)
- **CAB-14** ARTEN-Enhanced Multi-Crop (1.753 MiB, CC BY 4.0) — seluruh citranya sudah **diolah
  jaringan peningkat citra buatan penulis sendiri**. Untuk basis rujukan, gambar yang dimanipulasi
  model bukan bukti visual yang sah; citra aslinya tidak diterbitkan.
- **CAB-15** Multi-Crop Disease Dataset — API Mendeley membalas HTTP 504 pada empat percobaan
  lintas satu jam, jadi manifes/checksum tidak bisa diambil dan unduhan tidak bisa diverifikasi.
  Sayang, karena beranotasi YOLO dan memuat Anthracnose. **Layak dicoba ulang.**
- **CAB-16** Pepper Bell Leaf Disease (734 MiB) — pemeriksaan nama berkas di manifes menunjukkan
  turunan PlantVillage paprika dengan augmentasi (`_180deg`, `_flipTB`) ikut dihitung sebagai citra.

---

## 4. Dataset tambahan (multi-tanaman, di `datasets/additional/`)

| id | tanaman | kenapa masuk `additional/` |
|---|---|---|
| CAB-01 | cabai merah, terung, kacang panjang | 3 tanaman (KETENTUAN bagian 3) |
| CAB-12 | cabai, tomat, pepaya | 3 tanaman |

Keduanya tetap memakai prefiks `CAB` sesuai ketentuan.

---

## 5. Ditolak beserta alasan

- **CAB-26** Zenodo 19516961 "Philippine Chili Pepper Image Dataset" — ditolak dua kali. Bukan
  dataset penyakit (klasifikasi **varietas** Siling Labuyo vs Taiwan F1), dan dari 22 berkasnya
  13 adalah gambar hasil analisis (confusion matrix, scatter plot, plot SVM/KNN) plus satu XLSX;
  foto cabai sungguhan hanya sekitar tujuh. Ini lampiran gambar makalah yang diberi label dataset.
- **CAB-27** GitHub `smart-able/Anthracnose` — repositori **kode**, bukan dataset. Isi tingkat
  atas hanya `Anthracnose_code.ipynb`, `LICENSE`, `README.md`; tidak ada direktori data.
  Notebook-nya tidak dijalankan (KETENTUAN bagian 2.2).
- **CAB-28** COLD bagian bawang — duplikasi yang dicegah, lihat bagian 6.

### Gagal (2)
- **CAB-24** figshare 12434066 "Chili Pests and Diseases Dataset" — DOI masih terdaftar di
  DataCite dan doi.org masih mengalihkan, **tetapi entitasnya hilang**: API figshare membalas
  `Entity not found: article` untuk artikel maupun versi 1 dan 2. Ditarik atau dijadikan privat
  penerbitnya, bukan terhalang akun. Sayang: ini satu-satunya kandidat selain CAB-11 yang
  judulnya menjanjikan **hama** cabai.
- **CAB-25** RIN BRIN "Keragaman Genetik Cabai" — `data.brin.go.id` menjawab pada percobaan
  pertama (9 hasil untuk kata kunci "cabai") lalu **menolak koneksi pada enam percobaan
  berikutnya** lintas satu jam (`curl http:000`, WebFetch `ECONNREFUSED 103.224.136.3:443`).
  Isinya sendiri kemungkinan tidak relevan (keragaman genetik untuk cabai tahan kekeringan),
  tetapi **portalnya** relevan dan perlu dicoba ulang.

---

## 6. Duplikasi yang dicegah — dan dua temuan provenans

### 6.1 Duplikasi antar agen yang dicegah

**COLD terbit sebagai dua DOI terpisah**, dan itu nyaris menyebabkan unduhan ganda:
- bagian **bawang** `10.17632/7nxxn4gj5s` → sudah diklaim agen bawang merah sebagai **BWM-01**
  (`datasets/priority/bawang-merah/BWM-01-onion-cold-mendeley`). **Tidak diunduh ulang.**
- bagian **cabai** `10.17632/tf9dtfz9m6` → belum diklaim siapa pun, diambil sebagai **CAB-11**.

Keduanya berbagi satu makalah Data in Brief, satu lokasi, dan satu tim penulis, tetapi berkasnya
benar-benar terpisah — jadi tidak ada byte yang terunduh dua kali.

**PlantVillage** (milik agen tomat, TOM-01) dan **PlantDoc** (milik agen kentang, KEN-04/KEN-05)
tidak diunduh. Keduanya memuat kelas `Pepper__bell___Bacterial_spot` dan `Pepper__bell___healthy`
— penjelasan beda paprika vs cabai Indonesia ada di README CAB-05.

### 6.2 Temuan: dua dataset "berbeda" yang byte-identik (CAB-07 vs CAB-10)

Menurut SHA-256 yang **diumumkan sendiri oleh kedua penerbit** lewat Mendeley `public-api`:

| berkas | ukuran | sha256 (awalan) |
|---|---:|---|
| `Chili Leaf Disease Augmented Dataset.zip` | 4.773.222.633 | `2f4992f3ad41f7807305…` |
| `Chili Leaf Disease Original Dataset.zip` | 525.828.851 | `ccb3e216b58d68c4a365…` |

Kedua berkas itu muncul **identik** di dua DOI dengan klaim asal yang bertolak belakang:

| | `10.17632/w9mr3vf56s` (CAB-10) | `10.17632/ymt8k9bjkn` (CAB-07) |
|---|---|---|
| Institusi | Daffodil International University | Manipal Academy of Higher Education |
| Lokasi diklaim | Charpolisha, Jamalpur, **Bangladesh** | Bellary & Raichur (Karnataka), Guntur & Prakasam (Andhra Pradesh), **India** |
| Dibuat | 2025-02-12 | 2025-10-21 (8 bulan kemudian) |
| Terbit | 2025-02-19 | 2025-10-22 |
| Tambahan | — | punya bagian "Steps to Reproduce" yang merinci pemilihan lokasi di Krishna River Basin |

Rekaman India terbit delapan bulan setelah rekaman Bangladesh, dengan berkas yang sama persis
tetapi lokasi pengumpulan yang sama sekali lain — lengkap dengan prosedur reproduksi yang
menggambarkan lahan India. **Keterangan lokasi salah satu rekaman ini pasti tidak benar.**
Catatan kejujuran: bukti ini berupa metadata umuman penerbit, **bukan** byte yang saya unduh dan
verifikasi sendiri (kedua DOI melewati batas 3 GB).

### 6.3 Temuan: CAB-08 termuat utuh di dalam CAB-03 — diverifikasi byte

Ini diverifikasi langsung dengan SHA-256 per gambar dari berkas yang benar-benar ada di disk:

- CAB-08 (UF Sergipe, **Brasil**, terbit 2024-08-08): 1.738 berkas, **1.523 unik**
- CAB-03 kelas `Cercospora_Leaf_Spot` (Daffodil Int'l Univ., **Bangladesh**, terbit 2025-11-24):
  1.898 berkas, **1.683 unik**
- **Irisan byte-identik: 1.523** — yaitu **100% isi unik CAB-08** ada di dalam CAB-03, dan
  **90,5% citra unik Cercospora CAB-03 berasal dari CAB-08**.

Nama berkasnya diganti (`NNNN__roi_backremoved.jpg` → `Cercospora Leaf Spot_NNN.jpg`) sehingga
jejak asalnya hilang. Kedua dataset bahkan membawa jumlah salinan internal berlebih yang sama
persis (215), konsisten dengan penyalinan utuh berikut duplikatnya.

**Akibat praktis**: jangan menggabung CAB-03 dan CAB-08 dalam satu himpunan latih, dan jangan
memakai keterangan lokasi kelas Cercospora CAB-03 sebagai fakta geografis.

### 6.4 Sensus duplikat internal seluruh dataset citra yang diunduh

SHA-256 dihitung untuk setiap gambar, bukan hanya untuk arsipnya.

| dataset | berkas gambar | unik | salinan berlebih |
|---|---:|---:|---:|
| CAB-04 | 1.146 | 1.146 | **0 (0%)** |
| CAB-09 | 100 | 100 | **0 (0%)** |
| CAB-12 | 9.541 | 9.364 | 177 (1,9%) |
| CAB-03 | 8.817 | 7.936 | 881 (10,0%) |
| CAB-08 | 1.738 | 1.523 | 215 (12,4%) |
| CAB-05 | 1.308 | 992 | 316 (24,2%) |
| CAB-02 | 22.829 | 12.223 | 10.606 (46,5%) |
| CAB-01 | 5.095 | 1.959 | 3.136 (61,6%) |

Rincian CAB-03 per kelas: Bacterial_Spot 1.629→1.280 (21% dup) · Cercospora 1.898→1.683 (11%) ·
Healthy_Leaf 1.647→1.481 (10%) · Nutrition Deficiency 1.207→1.067 (11%) · Curl_Virus 1.590→1.582
(0,5%) · Powdery Mildew 846→843 (0,4%).

Irisan antar CAB-01, CAB-04, CAB-05, CAB-09, dan CAB-12: **nol** — tidak ada satu gambar pun
yang sama. Satu-satunya irisan lintas dataset adalah CAB-08 ⊂ CAB-03.

Catatan khusus **CAB-01**: 1.959 SHA-256 unik sama persis dengan jumlah nama dasar uniknya.
Artinya "varian hasil cropping" yang diklaim sumber sesungguhnya **salinan bit-demi-bit**;
tidak ada pemotongan yang terjadi.

Catatan khusus **CAB-02**: dari 4.927 kelompok duplikat, hanya **2** yang menyeberang split dan
**0** yang menyeberang kelas — jadi duplikasinya besar tetapi tidak merusak pembagian latih/uji.
Dua pasangan yang menyeberang itu **byte-identik tetapi mengklaim desa dan tanggal berbeda**,
yang berarti metadata lapangannya tidak 100% bisa dipercaya.

---

## 7. Kekurangan data & rekomendasi lanjutan

### 7.1 Lubang terbesar: **hampir tidak ada data cabai Indonesia**

Dari 10 dataset yang diunduh, **satu** yang datanya dari Indonesia (CAB-01, Jawa Barat), dan
dataset itu pun tidak bisa memisahkan cabai dari terung dan kacang panjang. Sisanya: Bangladesh
(3), India (4), Brasil (1), Thailand (1).

Ini bukan sekadar soal bendera. Konsekuensi teknisnya nyata:
- **Varietas berbeda.** Dataset India/Bangladesh memotret kultivar lokal mereka; cabai rawit
  (*C. frutescens*) dan cabai keriting Indonesia punya morfologi daun yang lain.
- **Latar berbeda.** Foto petani Indonesia berlatar mulsa plastik perak-hitam, guludan, dan
  tumpangsari — hampir tak ada di dataset yang ada.
- **Bobot penyakit berbeda.** Dataset yang ada didominasi keriting daun dan Cercospora;
  di Indonesia yang paling merugikan adalah **antraknosa/patek pada buah**.

### 7.2 Penyakit yang diminta tapi tidak ditemukan datanya sama sekali

| penyakit sasaran | citra ditemukan? |
|---|---|
| Antraknosa/patek (*Colletotrichum* spp.) — **daun** | ya, hanya CAB-04 (347) |
| Antraknosa/patek — **buah** | hampir tidak: hanya `Disease Chilli` 174 di CAB-12, tanpa nama penyakit |
| Virus kuning keriting daun (Begomovirus/ChiLCV) | berlimpah (CAB-01, CAB-02, CAB-03, CAB-11, CAB-12) |
| Bercak daun *Cercospora* | berlimpah (CAB-03, CAB-04, CAB-08, CAB-11, CAB-12) |
| Embun tepung (*Leveillula taurica*) | ya, CAB-03 (846, tapi 92% beresolusi 256×256) dan CAB-11 (162) |
| Gejala hama (trips, tungau) | hanya CAB-11 (`murda complex`, 275 mentah) |
| **Layu fusarium (*Fusarium oxysporum*)** | **TIDAK ADA** |
| **Layu bakteri (*Ralstonia solanacearum*)** | **TIDAK ADA** |
| **Busuk buah *Phytophthora capsici*** | **TIDAK ADA** (hanya di CAB-17 yang terhalang akun) |
| **CMV (Cucumber mosaic virus)** | **TIDAK ADA** |
| **Kutu kebul & lalat buah** | **TIDAK ADA** |

Pencarian khusus untuk layu fusarium, layu bakteri, Phytophthora, dan CMV pada cabai lewat
DataCite mengembalikan **nol** dataset citra; yang muncul hanya data molekuler/genomik dan
rekaman okurensi GBIF. Ini bukan kegagalan pencarian — datanya memang belum ada di repositori
terbuka.

Kenapa ini penting: layu fusarium dan layu bakteri adalah dua penyebab kematian tanaman cabai
tercepat di lapangan Indonesia, dan keduanya **tidak bisa dibedakan dari foto daun saja** —
perlu foto pangkal batang/perakaran dan uji pancaran bakteri. Tidak ada satu pun dataset yang
memotret bagian itu.

### 7.3 Rekomendasi lanjutan, urut prioritas

1. **Kejar CAB-23 (Roboflow, ruang kerja berbahasa Indonesia, antraknosa).** Cukup satu akun
   Roboflow. Ini perpotongan dua lubang terbesar sekaligus: Indonesia × antraknosa.
2. **Kejar CAB-19 (Kaggle `dhenyd/chili-plant-disease`).** Cukup satu token Kaggle. Kelasnya
   persis kosakata masalah cabai Indonesia.
3. **Surati penulis CAB-17 dan CAB-18.** CAB-17 satu-satunya sumber Phytophthora + botrytis;
   CAB-18 dari iklim yang paling mirip Indonesia.
4. **Coba ulang CAB-15** (API Mendeley 504) dan **portal RIN BRIN** (CAB-25) saat jaringannya
   pulih. RIN adalah jalur paling mungkin menemukan data cabai Indonesia yang belum terindeks
   DataCite.
5. **Pemotretan sendiri untuk empat lubang mutlak**: layu fusarium, layu bakteri, Phytophthora
   pada buah, dan antraknosa **pada buah**. Ini tidak bisa diselesaikan dengan memanen
   repositori — datanya belum ada. Yang perlu dipotret: pangkal batang dan penampang batang
   (untuk membedakan layu fusarium dari layu bakteri), dan buah pada beberapa tahap gejala patek.
6. **Sebelum melatih apa pun, deduplikasi berdasarkan SHA-256 dan pisahkan split berdasarkan
   citra asal**, bukan per berkas. Tabel di bagian 6.4 menunjukkan tiga dataset punya duplikasi
   di atas 20%.

---

## 8. Penilaian kelayakan

### (a) Identifikasi penyakit (petani memotret, sistem menjawab) — **cukup untuk 3 penyakit, tidak untuk sisanya**

Bisa dijawab sekarang dengan percaya diri: **virus kuning keriting daun**, **bercak daun
Cercospora**, dan **antraknosa daun** — ketiganya punya ratusan hingga belasan ribu citra.

Tidak bisa dijawab: layu fusarium, layu bakteri, Phytophthora, CMV — nol citra.

Bahaya yang harus ditangani lebih dulu: gejala **keriting** punya tiga penyebab berbeda dengan
tindakan pengendalian yang berbeda total — virus (Begomovirus), tungau/trips (`murda complex`),
dan keracunan/kekurangan hara. Hanya CAB-11 yang punya kelas `murda complex`, dan hanya CAB-01
yang labelnya dipastikan PCR. Tanpa memasukkan kedua sumber itu, model akan menyebut semua daun
keriting sebagai "virus kuning" dan menyarankan pengendalian vektor untuk kasus yang sebenarnya
serangan tungau.

Kelemahan lain: seluruh dataset memotret **daun**. Petani Indonesia paling sering datang membawa
keluhan **buah busuk (patek)**. Hanya 174 citra buah bergejala tersedia, tanpa nama penyakit.

### (b) Pelatihan computer vision — **layak, dengan tiga syarat**

Bahan yang layak dipakai: CAB-04 (paling bersih), CAB-02 (paling besar, split per desa),
CAB-03 (kelas terluas), CAB-11 (satu-satunya kelas hama), CAB-01 (satu-satunya Indonesia).
Total setelah deduplikasi kira-kira **26–28 ribu citra cabai berbeda** — cukup untuk transfer
learning, belum cukup untuk melatih dari nol.

Tiga syarat mutlak:
1. **Deduplikasi SHA-256 dulu.** CAB-01 61,6%, CAB-02 46,5%, CAB-05 24,2% duplikat. Tanpa ini,
   bobot kelas salah dan akurasi menggelembung.
2. **Jangan gabungkan CAB-03 dan CAB-08** — 1.523 gambar akan terhitung dua kali.
3. **Buang split bawaan CAB-11** (`augment/`, bocor 78,9%) dan jangan pakai CAB-05 sama sekali
   untuk pelatihan (labelnya tidak sahih).

Yang belum ada dan menentukan keberhasilan di lapangan: **himpunan uji Indonesia**. Model yang
dilatih di Bangladesh/India harus diuji pada foto lahan Indonesia sebelum dipercaya. Saat ini
kandidat satu-satunya adalah CAB-01, dan itu pun tercampur tiga tanaman.

### (c) Basis pengetahuan (deskripsi penyakit, gejala, patogen, inang) — **belum layak**

Panen ini hampir seluruhnya **citra**. Yang tabular hanya satu (CAB-06), dan isinya ternyata
daftar gen dan pengayaan GO — bukan deskripsi gejala, bukan daftar patogen–inang, bukan ambang
tindakan. Tidak ada satu pun dataset yang berisi teks deskriptif penyakit cabai yang bisa
langsung dipakai sebagai basis pengetahuan.

Metadata kelas yang ada juga tidak seragam: `cercospora` vs `cerocospora`, `Chili` vs `Chilli`,
`nutritional` vs `nutritional deficiency`, dan kelas gabungan tak bermakna seperti
`Pepper__bell___Bacterial_spot_Leaf_Curl_Cercospora`. Menyusun kosakata kanonik penyakit cabai
harus dikerjakan sendiri, tidak bisa disalin dari dataset mana pun di sini.

Untuk lapis ini, jalur EPPO / GBIF / GloBI / Wikidata yang sudah diklaim **agen bawang merah**
(BWM-05, BWM-06, BWM-08, BWM-09) jauh lebih relevan daripada apa pun yang ditemukan agen cabai —
sengaja tidak diduplikasi di sini.

### (d) Analisis epidemiologi — **hampir tidak layak**

Yang dibutuhkan epidemiologi: insidensi/keparahan bertanggal, berlokasi, dan berulang.

Satu-satunya bahan yang mendekati adalah **CAB-02**: 880 tanaman ber-ID difoto berulang lintas
sepuluh sesi (4–19 November 2024) di lima desa Coimbatore, dengan kelas bertingkat keparahan.
Dari situ **bisa** disusun kurva perkembangan penyakit per tanaman. Tiga batasannya berat:
(i) India, bukan Indonesia; (ii) rentangnya hanya dua minggu, terlalu pendek untuk satu musim;
(iii) hampir separuh berkasnya duplikat dan ada pasangan byte-identik yang mengklaim desa dan
tanggal berbeda, jadi rantai waktunya harus dibersihkan dulu.

CAB-06 yang seharusnya memberi angka keparahan ternyata tidak memuatnya.

Statistik serangan OPT Indonesia — bahan epidemiologi yang sesungguhnya — adalah milik **agen
bawang merah** (BWM-04, BWM-07) sesuai pembagian, jadi tidak diambil di sini. Kesimpulan untuk
cabai: **epidemiologi belum bisa dikerjakan dari panen citra**; sumbernya harus datang dari
statistik serangan dan pengamatan lapangan bertanggal, bukan dari repositori dataset gambar.

---

## 9. Temuan untuk tanaman lain

Dicatat, **tidak diunduh** kecuali datasetnya juga memuat cabai.

| dataset | tanaman | URL | lisensi | ukuran |
|---|---|---|---|---|
| **TCP (Tomato-Chilli-Papaya)** — *sudah diunduh agen cabai, silakan dirujuk* | tomat (4.202 citra: `Tomato septoria leaf spot` 1.617, `Tomato healthy leaf` 1.378, `Tomato verticulium wilt` 673, `Healthy Tomato` buah 325, `Disease Tomato` buah 209) · pepaya (2.521 citra: `Papaya RingSpot` 717, `Papaya BacterialSpot` 456, `Papaya Curl` 420, `Papaya Anthracnose` 360, `Papaya Healthy leaf` 298, fruit 270) | https://data.mendeley.com/datasets/m4m6j2tjfj/4 | CC BY 4.0 | 190 MiB diunduh; berkas kedua `Three Fruit and leaf crops disease dataset.zip` **1.732 MiB belum diunduh** |
| ARTEN-Enhanced Multi-Crop Disease Dataset | pisang, kacang tanah, kembang kol, lobak (+ cabai) | https://data.mendeley.com/datasets/s2sxywhtx5/1 | CC BY 4.0 | 1.753 MiB |
| Multi-Crop Disease Dataset (VIT Chennai) | pisang, lobak, kacang tanah, kembang kol (+ cabai); >30 kelas, anotasi YOLO | https://data.mendeley.com/datasets/6243z8r6t6/1 | CC BY 4.0 | tidak diketahui (API 504) |
| Pepper Bell Leaf Disease | paprika, 6 kelas | https://data.mendeley.com/datasets/w9drvtxg9g/1 | CC BY 4.0 | 734 MiB |
| Pepper Leaf DataSet — *sudah diunduh sebagai CAB-05* | paprika | https://figshare.com/articles/dataset/Pepper_Leaf_DataSet/29298239 | CC BY 4.0 | 27 MiB |
| MA-LeafFruitDx | mangrove apple (*Sonneratia*) | https://data.mendeley.com/datasets/jpgggxz6xc/1 | tidak dinyatakan di API | tidak diperiksa |
| VegNet (dua rilis) | aneka sayuran, **mutu** bukan penyakit | https://data.mendeley.com/datasets/6nxnjbn9w6 · https://data.mendeley.com/datasets/73n5hrn8hh | CC BY 4.0 | tidak diperiksa |
| COLD bagian bawang | bawang | https://data.mendeley.com/datasets/7nxxn4gj5s | CC BY (Mendeley) vs CC BY-NC (makalah) | sudah diklaim **BWM-01** |

Catatan untuk **agen tomat**: `Tomato verticulium wilt` (673 citra) di CAB-12 tidak ada di
PlantVillage; berkasnya sudah ada di
`datasets/additional/CAB-12-tcp-tomat-cabai-pepaya/raw/`, tidak perlu diunduh ulang.

Catatan untuk **semua agen**: perhatikan konflik lisensi COLD (Mendeley menulis CC BY 4.0,
makalah Data in Brief menulis CC BY-NC 4.0). Kalau BWM-01 dipakai untuk keperluan komersial,
konflik ini harus diselesaikan dulu.

---

## 10. Catatan teknis yang mungkin berguna untuk agen lain

Tiga hambatan yang memakan waktu paling banyak, beserta cara mengatasinya:

1. **Zenodo membalas HTTP 403 "unusual traffic from your network".** Ini pembatasan laju tingkat
   jaringan karena empat agen memanen bersamaan — **bukan** dinding login. Yang menyembuhkannya:
   pakai **User-Agent `curl` apa adanya**, jangan menyamar sebagai peramban
   (`-H 'User-Agent: curl/8.4.0'` lolos, `-A 'Mozilla/5.0'` ditolak). `robots.txt` Zenodo
   men-`Disallow` `/api` secara umum **tetapi** memuat baris eksplisit
   `Allow: /api/records/*/files`, jadi jalur unduhan berkas memang diizinkan. `Crawl-delay: 10`.

2. **Mendeley membalas galat JSON alih-alih berkas saat dibatasi laju.** Berkasnya tetap ditulis
   ke disk dengan HTTP 200, berukuran ~395–404 byte, berisi
   `{"url":"...","error":"...invalid json response body..."}`. `curl --fail` **tidak**
   menangkap ini. Pada CAB-01, 1.780 dari 10.190 berkas rusak seperti ini di ronde pertama.
   Cara mendeteksi: bandingkan ukuran byte dengan `files[].size` dari `public-api`, atau periksa
   apakah 12 byte pertama berkas adalah `{"url"`. Turunkan paralelisme ke 2–4 dan ulangi sampai
   bersih. Endpoint arsip massal (`/api/datasets/<id>/files/archive`) mengalihkan ke OAuth, jadi
   berkas lepas harus diambil satu per satu.

3. **Membaca isi arsip RAR tanpa `unrar`.** Lingkungan ini tidak punya `unrar`/`unar`/`7z`.
   Nama dan ukuran berkas di dalam RAR4 maupun RAR5 bisa dibaca dengan mengurai **header**
   arsip langsung dari byte memakai `python3` — tanpa mendekompresi dan tanpa menjalankan
   apa pun. Skripnya ada di scratchpad sesi ini (`cabai-agen/rarlist.py`) dan sudah terbukti
   pada ketiga arsip CAB-11. Kalau ada agen lain menemui dataset ber-RAR, ini jalan keluarnya —
   tetapi tandai statusnya `sebagian`, karena piksel gambarnya belum pernah didekompresi.

Selain itu: `data.brin.go.id` (portal RIN BRIN) **sempat** menjawab lalu menolak koneksi
seterusnya. Kalau ada agen yang berhasil menembusnya, itu jalur terbaik untuk data pertanian
Indonesia yang belum terindeks DataCite.
