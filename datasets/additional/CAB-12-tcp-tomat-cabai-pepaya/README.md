# TCP (Tomato-Chilli-Papaya Fruit & Leaf) Disease Dataset

- **dataset_id**: CAB-12-tcp-tomat-cabai-pepaya
- **Tanaman**: **tiga tanaman** — cabai (*Capsicum annuum*), tomat (*Solanum lycopersicum*),
  pepaya (*Carica papaya*). Karena ≥3 tanaman, ditaruh di `datasets/additional/` sesuai
  KETENTUAN bagian 3.
- **Penyakit/kelas tercakup** (20 kelas, nama folder apa adanya):
  - **Cabai (2.818 gambar)**: `Chili Bacterial Spot` 256 · `Chili Healthy Leaf` 718 ·
    `Chilli Cercospora Leaf Spot` 180 · `Chilli Curl Virus` 633 · `Chilli Nutrition Deficiency`
    444 · `Chilli White spot` 195 · `Disease Chilli` 174 (**buah**) · `Health chilli` 218 (**buah**)
  - Tomat (4.202): `Tomato septoria leaf spot` · `Tomato verticulium wilt` ·
    `Tomato healthy leaf` · `Disease Tomato` (buah) · `Healthy Tomato` (buah)
  - Pepaya (2.521): `Papaya Anthracnose` · `Papaya BacterialSpot` · `Papaya Curl` ·
    `Papaya RingSpot` · `Papaya Healthy leaf` · `Papaya Fruit Disease` · `Papaya Fruit Healthy`
- **Jenis data**: gambar
- **Format**: JPG/JPEG/PNG dalam ZIP
- **Jumlah**: **9.541** berkas gambar terhitung (8.344 .jpg, 1.189 .jpeg, 8 .png) di berkas
  `TCP (Fruit and Leaf Crops-Disease) Dataset.zip`. Sumber tidak menyebut angka total.
- **Sumber**: Mendeley Data
- **URL sumber**: https://data.mendeley.com/datasets/m4m6j2tjfj/4
- **DOI**: 10.17632/m4m6j2tjfj.4
- **Pembuat**: Anand Kumar Jain; Neeta Nain; Anadi Jain
  (Malaviya National Institute of Technology Jaipur; Government Women Engineering College Ajmer.
  Pakar domain: Kota Agriculture University dan Dinas Pertanian Pemerintah Rajasthan)
- **Tahun terbit / pembaruan**: 2026-08-03 (versi 4)
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: sebut ketiga pencipta dan DOI 10.17632/m4m6j2tjfj.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 199.396.470 byte (190,16 MiB)
- **SHA-256**: `07135e5acd1948b5c8c0d80401eb7fe4a13ef3e12717ca6ea16cc758bcc5fe49`
- **Status unduh**: diunduh (sebagian dari DOI: 1 dari 2 berkas)
- **Status verifikasi**: terverifikasi (untuk berkas yang diunduh)
- **Cara verifikasi**:
  - `shasum -a 256 raw/*` → **cocok persis** dengan `content_details.sha256_hash` Mendeley;
    ukuran byte juga cocok (199.396.470).
  - `file raw/*.zip` → `Zip archive data, at least v2.0 to extract, compression method=store`.
  - `unzip -tqq raw/*.zip` → tanpa galat.
  - Cacah per kelas dengan `python3` + `zipfile`; hasil di `struktur.txt`.
- **Keterbatasan / masalah kualitas**:
  1. **Hanya sebagian DOI yang diunduh.** DOI ini punya dua berkas:
     `TCP (Fruit and Leaf Crops-Disease) Dataset.zip` (190,16 MiB — **diunduh**) dan
     `Three Fruit and leaf crops disease dataset.zip` (1.732,36 MiB — **tidak diunduh**,
     untuk menjaga anggaran 8 GB per agen). Yang kedua kemungkinan besar superset/varian
     beresolusi penuh; hubungan keduanya tidak dijelaskan sumber.
  2. **Resolusi rendah.** Berkas gambar umumnya 16–60 KB. Ini bukan foto lapangan resolusi
     penuh; besar kemungkinan hasil pengecilan atau pengambilan ulang dari web.
  3. **Penamaan tidak konsisten**: `Chili` vs `Chilli` dalam satu dataset; `Health chilli` vs
     `Healthy Tomato`; `BacterialSpot` vs `Bacterial Spot`. Penggabungan otomatis berbasis nama
     folder akan salah.
  4. **Kelas buah tidak spesifik penyakit.** Untuk cabai, buah hanya dibagi `Disease Chilli` vs
     `Health chilli` — tidak dinyatakan penyakit apa. Untuk kebutuhan Indonesia (antraknosa/patek
     pada buah) ini terlalu kasar: tidak bisa membedakan patek dari busuk lain.
  5. **Tidak ada `Chilli Anthracnose` pada daun**, padahal itu penyakit cabai paling penting di
     Indonesia. Kelas `Chilli White spot` tidak lazim dan tidak dijelaskan patogennya.
  6. `Chilli Nutrition Deficiency` adalah gangguan abiotik, bukan penyakit menular.
  7. Bukan data Indonesia (Rajasthan/Kota, India).
  8. Tidak ada berkas metadata, anotasi, atau pembagian latih/uji.

## Mengapa dataset ini diambil agen cabai

Dua alasan:

1. **Citra buah cabai.** Folder `Disease Chilli` (174) dan `Health chilli` (218) adalah
   satu-satunya sumber **citra buah cabai** dalam seluruh panen ini. Semua dataset cabai lain
   yang berhasil diunduh hanya memotret **daun**. Antraknosa/patek — penyakit cabai nomor satu
   di Indonesia — menyerang **buah**, jadi lubang ini nyata.
2. **Kelas `Chilli White spot`** tidak muncul di dataset lain mana pun.

Bagian tomat (4.202 gambar, termasuk *septoria leaf spot* dan *verticillium wilt*) dan pepaya
(2.521 gambar) **ikut terbawa** karena satu arsip; agen tomat dan agen kentang dipersilakan
merujuk berkas ini alih-alih mengunduh ulang. Lihat juga bagian "temuan untuk tanaman lain" di
`datasets/reports/agen-cabai.md`.
