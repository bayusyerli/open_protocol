# Pepper Diseases and Pests Detection

- **dataset_id**: CAB-09-pepper-penyakit-hama-mendeley
- **Tanaman**: Cabai/paprika (*Capsicum* sp.) — jenis persisnya tidak dinyatakan sumber
- **Penyakit/kelas tercakup**: **tidak ada label sama sekali di dalam arsip.** Deskripsi sumber
  menjanjikan "gejala berbagai penyakit dan serangan hama, dianotasi dengan metadata relevan",
  tetapi berkas yang tersedia publik hanya berisi gambar tanpa kelas, tanpa kotak anotasi, dan
  tanpa berkas metadata.
- **Jenis data**: gambar
- **Format**: JPG dalam ZIP
- **Jumlah**: diklaim "koleksi gambar dan metadata" tanpa angka; terhitung **100** berkas JPG
  (`image_1.jpg` … `image_100.jpg`) dalam satu folder datar `PepperDiseaseTest/`.
- **Sumber**: Mendeley Data
- **URL sumber**: https://data.mendeley.com/datasets/8mvpntr47w/1
- **DOI**: 10.17632/8mvpntr47w.1
- **Pembuat**: Jun Liu
- **Tahun terbit / pembaruan**: 2024-11-08
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: sebut pencipta (Jun Liu) dan DOI 10.17632/8mvpntr47w.1.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 220.732.426 byte (210,51 MiB)
- **SHA-256**: `58c7928899a7de3fce6ab2274e0e8a694978fcb8b2512a70ad920b17bd3aaafe`
- **Status unduh**: diunduh
- **Status verifikasi**: sebagian (arsip utuh dan checksum cocok, tetapi isinya jauh lebih miskin
  dari yang dideskripsikan sumber)
- **Cara verifikasi**:
  - `shasum -a 256 raw/PepperDiseaseTest.zip` →
    `58c7928899a7de3fce6ab2274e0e8a694978fcb8b2512a70ad920b17bd3aaafe`, **cocok persis** dengan
    `sha256_hash` yang diumumkan Mendeley `public-api` untuk berkas ini. Integritas unduhan pasti.
  - `unzip -tqq raw/PepperDiseaseTest.zip` → tanpa galat.
  - `file raw/PepperDiseaseTest.zip` → `Zip archive data, compression method=store`.
  - Cacah isi dengan `python3` + `zipfile` → 100 .jpg, 1 folder, 0 berkas anotasi (`struktur.txt`).
- **Keterbatasan / masalah kualitas**:
  - **Tanpa label.** Nama berkas hanya nomor urut, tidak ada subfolder kelas, tidak ada
    `.txt`/`.xml`/`.json`/`.csv`. Dataset ini **tidak bisa dipakai untuk melatih maupun menguji
    klasifikasi** tanpa pelabelan ulang manual.
  - Nama berkas ZIP-nya `PepperDiseaseTest` — kemungkinan besar hanya *split* uji dari koleksi yang
    lebih besar; bagian latih/validasi beserta anotasinya tidak diterbitkan di DOI ini.
  - Deskripsi menyebut dataset ini menyertai naskah "A Multi-Modal Framework for Pepper Disease and
    Pest Detection", tetapi tidak ada modalitas kedua (teks/sensor) di dalam arsip.
  - Ukuran gambar sangat tidak seragam (56 KB – 10,9 MB), menandakan koleksi campuran dari
    beberapa sumber/perangkat.
  - Asal geografis tidak dinyatakan; tidak ada institusi terdaftar di metadata Mendeley.
  - Karena tanpa label, tidak diketahui apakah memuat antraknosa, virus kuning, layu, atau hama
    apa pun yang relevan untuk Indonesia. Nilainya terbatas pada 100 foto cabai resolusi tinggi
    berlisensi CC BY yang bisa dipakai sebagai bahan uji visual atau bahan anotasi baru.
