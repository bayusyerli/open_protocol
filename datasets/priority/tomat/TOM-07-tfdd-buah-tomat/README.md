# TFDD: A High-Quality Image Dataset for Accurate Tomato Fruit Disease Detection and Classification

- **dataset_id**: TOM-07-tfdd-buah-tomat
- **Tanaman**: Tomat (*Solanum lycopersicum*) — **buah**, bukan daun
- **Penyakit/kelas tercakup**: **8 kelas** apa adanya dari `data.yaml` — `Anthracnose` (antraknosa buah), `Blossom_end_rot` (**busuk ujung buah**), `Cracking` (retak buah), `Early_Blight`, `Fruitworm` (ulat buah), `Healthy`, `Late_Blight`, `Mold`
- **Jenis data**: gambar + anotasi kotak pembatas
- **Format**: dua arsip — `Raw Data.zip` (JPG asli, satu folder per kelas, **tanpa augmentasi dan tanpa anotasi**) dan `TFDD.zip` (JPG + label YOLO `.txt`, `data.yaml`, `README.md`, `summary.csv`; split `train`/`valid`/`test`) — plus `TFDD_MetaData.csv` di tingkat rekaman
- **Jumlah**:
  - `Raw Data.zip`: diklaim **288 gambar asli**, terhitung **288** — **cocok**. Per kelas: Fruitworm 61, Mold 49, Late Blight 38, Cracking 35, `Blossom end root` 31, Healthy 27, Anthracnose 27, Early Blight 20.
  - `TFDD.zip`: **682 gambar** + 682 berkas label (train 595, valid 58, test 29), **825 kotak** — hasil augmentasi dari 288 gambar asli tersebut. `summary.csv` memuat 682 baris.
  | kelas | gambar | kotak |
  |---|---|---|
  | Fruitworm | 145 | 152 |
  | Mold | 117 | 117 |
  | Late_Blight | 92 | 101 |
  | Cracking | 85 | 85 |
  | Blossom_end_rot | 75 | 126 |
  | Healthy | 61 | 134 |
  | Anthracnose | 61 | 61 |
  | Early_Blight | 49 | 49 |
- **Sumber**: Mendeley Data
- **URL sumber**: https://data.mendeley.com/datasets/ktfnhjspjn/3
- **DOI**: 10.17632/ktfnhjspjn.3
- **Pembuat**: Shraboni Biswas Naboni, Waliul Hasnat Wasif, Sadik Saleh, Md. Sabbir Hossain, Abdur Rahman, Kamruddin Nur, Tanzeem Rahat, Shahnaj Parvin
- **Tahun terbit / pembaruan**: 2025-06-16 (versi 3)
- **Lisensi**: CC BY 4.0 (rekaman Mendeley; blok `roboflow:` di `data.yaml` juga menyatakan `license: CC BY 4.0`)
- **Ketentuan atribusi**: Atribusi ke pembuat + tautan lisensi + penandaan perubahan.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: `Raw Data.zip` 376.974.404 byte + `TFDD.zip` 44.112.682 byte + `TFDD_MetaData.csv` 2.981 byte = 421.090.067 byte (402 MiB)
- **SHA-256**: lihat `SHA256SUMS.txt`
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**:
  - `file raw/*` → dua `Zip archive data, at least v2.0 to extract` + satu `CSV text` — semuanya cocok dengan namanya
  - `unzip -t raw/'Raw Data.zip'` dan `unzip -t raw/TFDD.zip` → keduanya `No errors detected in compressed data`
  - `unzip -Z1 raw/'Raw Data.zip'` → 297 entri, **288 `.jpg`** di 8 folder kelas; cacah per kelas dijumlahkan = 288 = **angka yang diklaim sumber**
  - `unzip -Z1 raw/TFDD.zip` → 1.377 entri: 682 `jpg`, 682 `txt`, 1 `yaml`, 1 `md`, 1 `csv`
  - `data.yaml` dibaca dengan `unzip -p` → `nc: 8` dengan daftar nama kelas lengkap (jadi **pemetaan id→nama TERSEDIA**, tidak seperti TOM-04 dan TOM-11)
  - `summary.csv` diurai dengan modul `csv` → 682 baris, split {train 595, valid 58, test 29}, cacah gambar dan kotak per kelas seperti tabel di atas
  - **Ketiga SHA-256 cocok persis dengan `sha256_hash` yang dipublikasikan API Mendeley** (`36b360ed3b9acfda…`, `310578dbe9de8ede…`, `90fc1680de7c2988…`)
- **Keterbatasan / masalah kualitas**:
  - **Sangat kecil**: hanya **288 gambar asli** untuk 8 kelas. Kelas terkecil `Early_Blight` cuma **20 gambar asli** (49 setelah augmentasi). Cukup untuk purwarupa, tidak cukup untuk model produksi.
  - **Augmentasi sudah tercampur ke dalam split yang ditetapkan pembuat** di `TFDD.zip`. 682 gambar berasal dari 288 asli, dan nama berkas ter-hash Roboflow (`1065_jpg.rf.7cd4a852….jpg`) menyembunyikan induknya — tetapi awalan numerik sebelum `_jpg.rf.` **masih menyimpan id gambar asli** (tiga baris `1065_jpg.rf.*` di `summary.csv` jelas turunan gambar `1065`). Pada contoh yang diperiksa semuanya kebetulan berada di split `train`, tetapi **kebocoran train↔test tidak terjamin tidak ada** — kelompokkan berdasarkan awalan numerik itu sebelum membuat split sendiri. **Atau lebih baik lagi: pakai `Raw Data.zip` yang 288 gambar asli dan buat split sendiri**, karena arsip itu bebas augmentasi sepenuhnya.
  - **`Raw Data.zip` tidak punya anotasi.** Hanya folder per kelas, tanpa kotak pembatas. Jadi pilihannya: 288 gambar bersih tanpa kotak, atau 682 gambar beraugmentasi dengan kotak. Tidak ada versi "288 gambar asli + kotaknya".
  - **Ejaan kelas berbeda antar arsip**: folder di `Raw Data.zip` bernama **`Blossom end root`** (salah ketik untuk *rot*) sedangkan `data.yaml` di `TFDD.zip` memakai `Blossom_end_rot`. Penggabungan otomatis kedua arsip akan gagal kalau dicocokkan berdasarkan nama kelas.
  - `Cracking` (retak buah) dan `Fruitworm` (ulat buah) **bukan penyakit**: yang pertama gangguan fisiologis/pecah karena air, yang kedua hama. Tercampur di daftar kelas yang sama.
  - Split sangat timpang: 595 latih vs 29 uji. Uji 29 gambar untuk 8 kelas berarti beberapa kelas hanya diwakili 1–3 gambar di test — angka akurasi test-nya nyaris tanpa makna statistik.
  - `TFDD_MetaData.csv` di tingkat rekaman (bukan yang di dalam arsip) berformat tabel berjudul dengan banyak baris kosong, bukan tabel data yang rapi.
  - Tidak ada metadata lokasi, tanggal, kultivar, atau alat; kemungkinan Bangladesh (afiliasi penulis) tetapi tidak dinyatakan.
  - **Nilai plusnya, dan ini besar**: ini **satu-satunya dataset di seluruh panen tomat yang mencakup antraknosa buah DAN busuk ujung buah (blossom end rot)** — dua hal yang ada di daftar cakupan tetapi tidak ada di PlantVillage, Tomato-Village, dataset Pakistan, maupun Taiwan. Anotasinya kotak pembatas, dan `data.yaml`-nya lengkap sehingga langsung bisa dipakai.
