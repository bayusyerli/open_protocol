# Image Dataset of Red and White Onion Bulbs and Leaves

- **dataset_id**: BWM-02-onion-bulb-leaf-mendeley
- **Tanaman**: Bawang (*Allium cepa* L.) — **bawang merah-kulit (red onion) dan bawang putih-kulit (white onion) jenis bombay**, bukan *A. cepa* var. *aggregatum* (shallot) Indonesia. Lihat Keterbatasan.
- **Penyakit/kelas tercakup**: **tidak ada nama penyakit sama sekali.** Hierarki folder apa adanya (12 kelas terdalam):
  ```
  New Onion - Copy/
  ├── 1. Leaves/                          4.040 gambar
  │   ├── 1. Healthy/   {1. Single 1010, 2. Multiple 1010}     = 2.020
  │   └── 2. Unhealthy/ {1. Single 1010, 2. Multiple 1010}     = 2.020
  └── 2. Bulb/                           12.260 gambar
      ├── 1. Healthy/   1. Red Onion   {Single 3000, Multiple 1110} = 4.110
      │                 2. White Onion {Single 3000, Multiple 1110} = 4.110
      └── 2. Unhealthy/ 1. Red Onion   {Single 1010, Multiple 1010} = 2.020
                        2. White Onion {Single 1010, Multiple 1010} = 2.020
  ```
  Label tertinggi yang tersedia hanyalah biner **Healthy / Unhealthy**.
- **Jenis data**: gambar
- **Format**: JPG dalam satu ZIP (metode `store`/`deflate` campuran, tanpa password)
- **Jumlah**: **diklaim 16.300, terhitung 16.300 — cocok persis.** (16.323 entri arsip = 16.300 berkas + 23 direktori)
- **Sumber**: Mendeley Data (Elsevier)
- **URL sumber**: https://data.mendeley.com/datasets/42bcyncfhy/2
- **DOI**: 10.17632/42bcyncfhy (versi terunduh: **v2**)
- **Pembuat**: Vinaya Kulkarni; Sanjesh Pawale; Yogesh Suryawanshi
- **Tahun terbit / pembaruan**: v1 2025; **v2 dipublikasikan 2026-02-09**
- **Lisensi**: **CC BY 4.0** (metadata Mendeley: `data_licence.short_name = "CC BY 4.0"`, http://creativecommons.org/licenses/by/4.0)
- **Ketentuan atribusi**: sebut pembuat + DOI 10.17632/42bcyncfhy. Pemakaian komersial diizinkan selama atribusi diberikan.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 1.608.618.402 byte (1,61 GB) — di bawah batas 3 GB per dataset
- **SHA-256**: `e09611742de689e0a95ca07be2d2ee25bba446f268a2d185d2c5baa45bdc76b3` (lihat `SHA256SUMS.txt`)
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**: keluaran lengkap di `struktur.txt`. Perintah persis:
  - `file raw/*.zip` → `Zip archive data, at least v2.0 to extract` (tipe cocok dengan nama, bukan HTML tersamar)
  - `python3` `zipfile.ZipFile.namelist()` → **16.323 entri**, 16.300 berkas, 23 direktori; ekstensi `{'jpg': 16300}` — **hanya JPG, tidak ada berkas asing**
  - `python3` `zipfile.ZipFile.testzip()` → **`None`** = seluruh CRC cocok, tidak ada berkas rusak
  - `any(i.flag_bits & 0x1 for i in z.infolist())` → **`False`** = tidak ada entri terenkripsi/berpassword
  - Cacah per kelas dengan `collections.Counter` atas komponen path — hasil di `struktur.txt`
  - Ukuran gambar: total tak-terkompresi 1.635.717.054 byte; min 18.515, maks 403.060, rata-rata 100.350 byte
  - `shasum -a 256 raw/*` → `SHA256SUMS.txt`
  - **Arsip tidak diekstrak** ke `datasets/` — seluruh pemeriksaan dilakukan atas daftar isi arsip.
  - Catatan proses: unduhan pertama putus di ~933 MB karena batas waktu `curl`; dilanjutkan dengan `curl -C -` sampai utuh, lalu diverifikasi ulang dari nol dengan `testzip()`.
- **Keterbatasan / masalah kualitas**:
  1. **TIDAK ADA LABEL PENYAKIT — ini batas pemakaian yang paling menentukan.** Seluruh 16.300 gambar hanya berlabel **Healthy / Unhealthy**. Tidak ada *Alternaria porri*, tidak ada moler, tidak ada embun bulu, tidak ada apa pun. Dataset ini **tidak bisa dipakai untuk identifikasi penyakit**; paling jauh untuk penapisan biner "sehat / tidak sehat". Untuk kebutuhan Pranatani yang harus menyebut nama penyakit dan tindakan, label ini terlalu tumpul.
  2. **Mayoritas isinya umbi, bukan daun.** 12.260 dari 16.300 gambar (75%) adalah **umbi** — objek pascapanen/sortasi, bukan gejala di pertanaman. Gambar daun yang relevan untuk diagnosis lapangan hanya **4.040**, dan yang bergejala hanya **2.020**.
  3. **"Red onion" bukan bawang merah Indonesia.** Istilah *red onion* di sini merujuk bawang bombay berkulit merah (umbi tunggal besar), bukan *Allium cepa* var. *aggregatum* yang berumbi majemuk dan ditanam di Brebes/Nganjuk. Perbedaannya nyata pada bentuk umbi, ukuran, dan struktur rumpun. **Jangan disamakan.**
  4. **Asal geografis tidak dinyatakan.** Metadata Mendeley tidak menyebut lokasi pengambilan. Nama pembuat (Kulkarni, Pawale, Suryawanshi) mengarah ke India, tetapi ini **dugaan, bukan fakta terdokumentasi**. Tanpa lokasi, kesesuaiannya dengan kondisi Indonesia tidak bisa dinilai.
  5. **Cacah yang terlalu rapi menandakan pengambilan sampel terkendali, bukan lapangan.** Angka 1010 berulang di **delapan** kelas berbeda, dan 3000 di dua kelas. Keseragaman seperti ini praktis mustahil pada koleksi lapangan alami — kuat dugaan sesi foto studio/terjadwal, kemungkinan dengan augmentasi atau pengambilan berulang atas objek yang sama. Sumber tidak menjelaskan apakah ada augmentasi.
  6. **Risiko kebocoran data antar-split.** Kalau beberapa gambar berasal dari umbi/daun **fisik yang sama** dari sudut berbeda (sangat mungkin, mengingat pembagian "Single" vs "Multiple"), split acak akan menempatkan objek yang sama di train dan test. Tidak ada pengenal objek untuk mencegahnya. **Split harus per-objek, dan datanya tidak menyediakan informasi itu.**
  7. **Ketimpangan kelas pada umbi.** Umbi sehat 8.220 lawan umbi tidak sehat 4.040 (2:1). Daun seimbang sempurna 2.020:2.020 — lagi-lagi terlalu rapi.
  8. **Arsip besar dan sebagian besar `store` (tidak dimampatkan)** — 1,61 GB untuk 16.300 JPG, rata-rata 100 KB/gambar. Unduhan lambat dan rawan putus (terbukti: percobaan pertama gagal pada 900 detik).
  9. **Nama folder akar `New Onion - Copy`** menyiratkan salinan direktori kerja penulis, bukan penamaan yang disengaja. Spasi dan titik dalam nama folder (`1. Leaves`) menyulitkan sebagian pipeline.
  10. **Tidak ada data pribadi** yang terdeteksi.

## Penilaian ringkas

Berguna sebagai **sumber gambar bawang tambahan bervolume besar dengan lisensi bersih (CC BY 4.0)** — misalnya
untuk pra-pelatihan, augmentasi latar, atau penapisan biner sehat/sakit. **Tidak berguna** untuk membedakan
trotol dari moler dari embun bulu, yang justru pertanyaan sesungguhnya bagi petani bawang merah Indonesia.
Untuk itu `BWM-01` (4 kelas berpenyakit) jauh lebih relevan meski jauh lebih kecil.
