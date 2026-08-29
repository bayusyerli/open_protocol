# Chili Leaf Disease Dataset: Annotated Smartphone Images of Anthracnose, Cercospora Leaf Spot, Leaf Curl Disease, and Healthy Leaves in Bangladesh

- **dataset_id**: CAB-04-chili-4-kelas-dhaka
- **Tanaman**: Cabai (*Capsicum annuum*)
- **Penyakit/kelas tercakup**: `Anthracnose` (antraknosa, *Colletotrichum* spp.) ·
  `Cercospora Leaf Spot` (bercak daun *Cercospora*) · `Leaf Curl Disease` (keriting daun, ChiVMV/ToLCV)
  · `Fresh Leaf` (sehat)
- **Jenis data**: campuran (gambar + tabular metadata per gambar)
- **Format**: JPG dalam ZIP terpisah per kelas + 2 berkas CSV metadata
- **Jumlah**: dataset penuh **1.515** citra (dikonfirmasi oleh 1.515 baris data di
  `dataset_image_metadata_full.csv`, cocok dengan klaim sumber). Per kelas:
  Fresh Leaf 432 · Leaf Curl Disease 369 · Cercospora Leaf Spot 367 · Anthracnose 347.
  **Yang ada di disk: 1.146 citra** (3 dari 4 kelas) — `Leaf Curl Disease` tidak diunduh.
- **Sumber**: Mendeley Data
- **URL sumber**: https://data.mendeley.com/datasets/wzc6r6w5w5/3
- **DOI**: 10.17632/wzc6r6w5w5.3
- **Pembuat**: Jahanur Biswas; Md. Shakib Hossain; Md Mahamudul Hasan
  (Dhaka International University, Bangladesh)
- **Tahun terbit / pembaruan**: 2026-06-26 (versi 3)
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: sebut ketiga pencipta dan DOI 10.17632/wzc6r6w5w5, tandai bila diubah.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 2.199.178.038 byte (2.097,30 MiB) untuk 5 berkas yang diunduh
  (dari total 3.099,44 MiB di DOI)
- **SHA-256**: lihat SHA256SUMS.txt
- **Status unduh**: diunduh (5 dari 6 berkas di DOI)
- **Status verifikasi**: sebagian (semua yang diunduh terverifikasi; satu kelas sengaja dilewati)
- **Cara verifikasi**:
  - `shasum -a 256 raw/*` → **5 dari 5** berkas cocok persis dengan
    `content_details.sha256_hash` yang diumumkan Mendeley `public-api`.
  - `unzip -tqq raw/*.zip` → ketiga ZIP lolos tanpa galat.
  - Cacah isi arsip dengan `python3` + `zipfile`; CSV diurai dengan modul `csv`.
  - **Uji duplikat** memakai kolom `image_hash` bawaan sumber: 0 hash berulang, dan 0 hash yang
    muncul di lebih dari satu kelas.
  - Rincian lengkap di `struktur.txt`.
- **Keterbatasan / masalah kualitas**:
  1. **Satu kelas sengaja tidak diunduh.** Total DOI 3.099,44 MiB, melewati batas 3 GB per
     dataset di KETENTUAN bagian 2.4. Karena sumber menyediakan ZIP terpisah per kelas
     (subset resmi), yang diambil adalah Anthracnose + Cercospora Leaf Spot + Fresh Leaf +
     kedua CSV. **`Leaf Curl Disease.zip` (1.050.819.268 byte, 369 citra) dilewati** karena
     keriting daun sudah tercakup sangat berlimpah di CAB-02 (22.829 citra ChiLCV bermetadata)
     dan CAB-03 (`Curl_Virus` 1.590 citra). Metadata 369 citra itu tetap lengkap di CSV yang
     sudah diunduh, dan berkasnya bisa diambil kapan saja dari DOI yang sama.
  2. **`__MACOSX` menggandakan cacah entri.** Tiap ZIP berisi satu stub AppleDouble per gambar,
     jadi `unzip -l` menampilkan 695/735/865 entri padahal gambar aslinya 347/367/432.
     Siapa pun yang mencacah dengan `unzip -l` tanpa menyaring akan melaporkan dua kali lipat.
  3. `image_hash` di CSV adalah hash **perseptual**, bukan kriptografis. "0 duplikat" berarti
     tidak ada gambar yang mirip secara perseptual menurut metode sumber — cukup kuat, tapi
     bukan jaminan mutlak.
  4. Kolom `filepath` di CSV membocorkan jalur Google Drive penulis
     (`/content/drive/MyDrive/Chili Leaf Project/...`). Bukan data pribadi, tapi menandakan
     metadata dibuat di Colab tanpa pembersihan.
  5. Deskripsi versi 3 menyebut 1.515 citra sedangkan versi 2 menyebut 1.544 — sumber mengubah
     cacahnya antar versi tanpa catatan perubahan.
  6. Bukan data Indonesia (Bangladesh). Foto diambil Juni 2025 dengan Redmi 12 (50 MP),
     Redmi 13, dan ponsel lain.
  7. Tanpa anotasi kotak/segmentasi dan tanpa pembagian latih/uji bawaan.
  8. Ukuran kelas kecil (347–432 per kelas) untuk melatih model dari nol; cocoknya untuk
     *transfer learning* atau digabung dengan dataset lain.

## Kenapa ini dataset cabai paling bersih dalam panen

Dibandingkan sembilan dataset cabai lain yang diunduh, hanya CAB-04 yang lulus semua
pemeriksaan kualitas sekaligus:

| Pemeriksaan | CAB-04 | dataset lain |
|---|---|---|
| Cacah cocok dengan klaim | ya (1.515 = 1.515) | CAB-02 +760, CAB-03 +3, CAB-05 +885, CAB-11 +2.996 |
| Duplikat internal | **0** | CAB-08 215 salinan, CAB-05 banyak " - Copy" |
| Tumpang tindih antar kelas | **0** | CAB-05 label kacau total |
| Resolusi seragam & tinggi | **100% ≥1728 px** | CAB-03 hanya 23% yang 1000×1000 |
| Metadata per gambar | ya (10 kolom) | hanya CAB-02 |
| Kebocoran latih/uji | tidak ada split, jadi tidak ada | CAB-11 78,9% bocor |

Nilai terpentingnya untuk Indonesia: ini **satu-satunya sumber citra daun antraknosa** (347)
dalam seluruh panen. Antraknosa/patek adalah penyakit cabai nomor satu di Indonesia, dan tidak
satu pun dataset lain yang berhasil diunduh punya kelas antraknosa pada daun.
Perlu dicatat, antraknosa di lapangan Indonesia paling merusak pada **buah**, bukan daun —
untuk itu lihat `datasets/additional/CAB-12-tcp-tomat-cabai-pepaya`.
