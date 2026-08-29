# Chilli Leaf Curl Virus Dataset Final Ver

- **dataset_id**: CAB-02-chilcv-coimbatore-figshare
- **Tanaman**: Cabai (*Capsicum annuum*)
- **Penyakit/kelas tercakup**: `Healthy control`, `Initial Symptoms of ChiLCV`, `Severe Symptoms of ChiLCV`
  (ChiLCV = Chilli Leaf Curl Virus, Begomovirus — padanan "virus kuning keriting daun" di Indonesia).
  Kelasnya bertingkat keparahan, bukan multi-penyakit.
- **Jenis data**: campuran (gambar + tabular metadata per gambar)
- **Format**: JPG dalam satu ZIP; metadata CSV, XLSX, dan TXT di dalam ZIP yang sama
- **Jumlah**: gambar — diklaim 22.069, terhitung **22.829** JPG, **tetapi hanya 12.223 di
  antaranya unik** (10.606 salinan byte-identik, 46,46%). Lihat Keterbatasan butir 2.
  Total entri berkas 22.842 (22.829 JPG + 5 TXT + 4 CSV + 4 XLSX).
  Per kelas (semua split, berkas): Healthy control 10.260 · Initial Symptoms 8.789 ·
  Severe Symptoms 3.780.
  Split bawaan (berkas → hash unik): Train 17.655 → 7.304 · Validation 2.207 → 2.157 ·
  Test 2.207 → 2.172 · OOD_Set 760 → 592.
- **Sumber**: figshare
- **URL sumber**: https://figshare.com/articles/dataset/Chilli_ChiLCV_Final_Ver_Dataset/32820110
- **DOI**: 10.6084/m9.figshare.32820110.v3
- **Pembuat**: Kannan M; Parthasarathy Seethapathy
- **Tahun terbit / pembaruan**: 2026-07-27 (versi 3)
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: wajib menyebut pencipta (Kannan M; Parthasarathy Seethapathy), mencantumkan
  DOI 10.6084/m9.figshare.32820110, dan menandai bila ada perubahan.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 1.032.690.090 byte (984,85 MiB) untuk `Chilli_Final_Ver_Dataset.zip`
- **SHA-256**: `e9273c218e2669e5f7ae61f8faf8689cf4a8d18049d1fb26c2c97bab9664af0d` (lihat SHA256SUMS.txt)
- **Status unduh**: diunduh
- **Status verifikasi**: sebagian (arsip utuh & terbuka, tetapi cacah gambar ≠ klaim sumber)
- **Cara verifikasi**:
  - `unzip -tqq raw/Chilli_Final_Ver_Dataset.zip` → selesai tanpa galat.
  - `md5 -q raw/Chilli_Final_Ver_Dataset.zip` → `7958773e2345e35f88788e6ea50eb7bc`, **cocok** dengan
    `computed_md5` yang diumumkan Figshare API untuk berkas 66059936.
  - `file raw/...zip` → `Zip archive data, at least v2.0 to extract, compression method=store`.
  - Cacah per kelas dengan `python3` + modul `zipfile` (hasil lengkap di `struktur.txt`).
  - **Uji duplikat**: SHA-256 dihitung untuk **seluruh 22.829 JPG** lalu dikelompokkan, dan
    tiap kelompok duplikat diperiksa apakah menyeberang split atau kelas.
- **Keterbatasan / masalah kualitas**:
  1. **Bukan data Indonesia.** Semua gambar dari Coimbatore, Tamil Nadu, India (desa Arasampalayam,
     Vadasithur, Myleripalayam, Kuladupalayam, Andipalayam), Juni–November 2024.
  2. **46,46% berkasnya duplikat byte-identik.** 22.829 berkas hanya berisi **12.223 gambar
     berbeda**. Kabar baiknya: dari 4.927 kelompok duplikat, **4.925 tetap di dalam satu split
     dan satu kelas**; hanya **2** yang menyeberang antara Train dan Test, dan **0** yang
     menyeberang kelas. Jadi pembagian latih/uji praktis tetap sahih — yang harus dikoreksi
     adalah **angkanya**: laporkan 12.223, bukan 22.069/22.829, dan jangan menimbang bobot kelas
     dari cacah berkas.
  3. **Dua pasang berkas byte-identik mengklaim desa dan tanggal berbeda**
     (`SC_P010_S1_Myleripalayam_20241105_IMG00196.jpg` = `SC_P057_S9_Arasampalayam_20241118_IMG01239.jpg`,
     dan satu pasangan serupa). Karena gambarnya identik bit demi bit, salah satu keterangan
     desa/tanggal itu pasti keliru — metadata lapangannya tidak 100% bisa dipercaya.
  4. **Cacah tidak konsisten dengan klaim.** Deskripsi Figshare menyebut 22.069 gambar; isi arsip
     22.829. README internal menyebut OOD 750 gambar, `dataset_description_ood.txt` menyebut 760,
     isi folder 760. README internal juga menyebut Training "Total Plants: 880" sedangkan
     `dataset_description_train.txt` menyebut 364 untuk data latih yang sama.
  5. **"Field-Validation Dataset" (500 sampel) yang disebut README internal tidak ada di arsip.**
  6. Kelas tidak seimbang: Severe Symptoms hanya ~17% dari total.
  7. Hanya satu penyakit (ChiLCV). Tidak memuat antraknosa, layu fusarium, layu bakteri,
     Cercospora, Phytophthora, maupun embun tepung.
  8. Split train/val/test dipisah **per desa**, bukan acak — bagus untuk uji generalisasi lokasi,
     tetapi angka akurasi tidak sebanding dengan dataset yang di-split acak.
  9. Berkas `Flutter Source Code.zip` (489,64 MiB) di DOI yang sama **tidak diunduh**: itu kode
     aplikasi, bukan data, dan ketentuan panen melarang menjalankan kode dari repositori temuan.

## Catatan nilai tambah

Ini satu-satunya dataset cabai dalam panen ini yang membawa **metadata LAPANGAN per gambar**:
`image_name, class, plant_id, village, acquisition_date, session_id, subset` (plus `device` pada
OOD). (CAB-04 juga punya CSV metadata, tetapi isinya teknis — dimensi, ketajaman, hash — bukan
identitas tanaman dan lokasi.)

Konsekuensinya: tanaman ber-ID difoto **berulang lintas sesi** (S1–S10, Nov 2024), sehingga
dataset ini bisa dipakai untuk menyusun **kurva perkembangan penyakit per tanaman** — satu-satunya
bahan epidemiologi cabai dalam seluruh panen ini. Ada pula `OOD_Set` terpisah dengan tiga model
ponsel berbeda untuk uji ketahanan domain.

Dua peringatan sebelum memakainya untuk epidemiologi: (a) hampir separuh berkas adalah duplikat,
jadi "banyak foto pada sesi X" tidak berarti banyak pengamatan; (b) ditemukan pasangan berkas
byte-identik yang mengklaim desa dan tanggal berbeda, jadi rantai waktu per tanaman harus
diperiksa dulu terhadap duplikat sebelum dipercaya.
