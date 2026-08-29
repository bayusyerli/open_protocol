# Tomato Leaf and Fruit Disease Image Dataset

- **dataset_id**: TOM-06-daun-buah-lapangan-bd
- **Tanaman**: Tomat (*Solanum lycopersicum*)
- **Penyakit/kelas tercakup**: 7 kelas apa adanya dari nama folder — `Healthy Leaf`, `Healthy Fruits`, `Early Blight Leaf`, `Late Blight Leaf`, `Leaf Curl Leaf`, `Bushy Stunt Leaf` (Tomato bushy stunt virus), `Target Spot Fruits`. **Dua kelas di antaranya adalah BUAH**, bukan daun — cakupan yang tidak dimiliki hampir semua dataset tomat lain.
- **Jenis data**: gambar
- **Format**: PNG 512×512 RGB dalam ZIP; disertai README PDF dan satu CSV daftar medan manifes
- **Jumlah**: diklaim 3.500 gambar; terhitung **3.500 gambar** (7 kelas × tepat 500) — **cocok**
- **Sumber**: Mendeley Data
- **URL sumber**: https://data.mendeley.com/datasets/9jxvtgh325/1
- **DOI**: 10.17632/9jxvtgh325.1
- **Pembuat**: Foysal Sheikh, Md Abdul Bakii, Nishat Sultana Raki, Mosa. Nadia Sultana Pria, Shahnaj Parvin, Mafiul Hasan Matin
- **Tahun terbit / pembaruan**: 2026-02-23 (versi 1)
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: Atribusi ke pembuat + tautan lisensi + penandaan perubahan.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: `Original Dataset.zip` 840.169.622 byte (801 MiB) + `README.pdf` 2.105.476 byte + `CSV Manifest Fields Summary Table.csv` 571 byte
- **SHA-256**: lihat `SHA256SUMS.txt`
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**:
  - `file raw/*` → `Zip archive data`, `PDF document, version 1.4`, `CSV text` — semuanya cocok dengan namanya
  - `unzip -t "raw/Original Dataset.zip"` → `No errors detected in compressed data`
  - **Ketiga SHA-256 cocok persis dengan `sha256_hash` yang dipublikasikan API Mendeley** (`098a3ceaa776d853…`, `0b891a7cc4cf7869…`, `2fc5f6b2ada39efa…`)
  - `unzip -Z1 | wc -l` → 3.508 entri (8 direktori + 3.500 `.png`)
  - Cacah per kelas: `grep -viE '/$' | awk -F/ '{$NF="";print}' OFS=/ | sort | uniq -c` → 7 × 500
  - Tiga berkas sampel dari tiga kelas berbeda diekstrak ke direktori scratchpad lalu `file` → semuanya `PNG image data, 512 x 512, 8-bit/color RGB`
- **Bagian yang TIDAK diambil**: `Augmented Dataset.zip` (7.261 MB) — melampaui batas 3 GB per dataset dan isinya turunan dari 3.500 gambar yang sama. Diabaikan dengan sengaja.

## Keterbatasan / masalah kualitas

- **Nama berkas menyesatkan**: arsipnya bernama `Original Dataset.zip` tetapi folder di dalamnya bernama `Resize Dataset`, dan seluruh gambar sudah **diseragamkan ke 512×512**. Jadi ini bukan foto mentah kamera. Foto asli beresolusi penuh tidak tersedia di mana pun dalam rekaman ini.
- **Nama berkas asli dan EXIF sudah hilang.** Semua gambar dinamai ulang `image_0001.png` … `image_0500.png` dan penomorannya **direset di tiap kelas**. Akibatnya: tanggal, perangkat, dan lokasi pengambilan tidak bisa ditelusuri, dan tidak ada cara mengetahui apakah dua gambar berasal dari tanaman yang sama.
- **Seimbang sempurna 500 per kelas — dan itu justru mencurigakan.** Deskripsi sumber menyebut 3.500 gambar "all captured in actual fields", tapi kesamaan persis di tujuh kelas berbeda hampir mustahil terjadi pada pengumpulan lapangan apa adanya. Kemungkinan besar sudah ada pemangkasan/penambahan (over/under-sampling) sebelum dipublikasikan. Kelas mana yang aslinya lebih sedikit tidak bisa diketahui.
- **Manifes yang dijanjikan tidak ada.** `CSV Manifest Fields Summary Table.csv` hanya mendaftar *nama medan* manifes (`image_id`, `label`, `split`, `augmented`, `file_path`, `width`, `height`, `channels`, `format`, `color_profile`). Berkas manifes yang berisi datanya sendiri **tidak disertakan**. Akibatnya kolom `split` dan — yang lebih penting — kolom **`augmented`** tidak bisa dipakai: **tidak ada cara memisahkan gambar asli dari gambar teraugmentasi di dalam "Original Dataset" ini**.
- **Tidak ada pembagian train/val/test** di arsip ini. Harus dibuat sendiri, dan karena identitas tanaman tidak diketahui, split bebas-kebocoran tidak bisa dijamin.
- Penamaan kelas tidak konsisten dalam bentuk tunggal/jamak: `Healthy Fruits`/`Target Spot Fruits` (jamak) vs `Healthy Leaf`/`Late Blight Leaf` (tunggal).
- **Nilai plusnya**: satu-satunya dataset dalam koleksi tomat ini yang mencakup **penyakit pada BUAH** (`Target Spot Fruits`) dan **Tomato bushy stunt virus** — dua hal yang tidak ada di PlantVillage, Tomato-Village, maupun dataset Pakistan. Dikumpulkan di Bangladesh (tropis lembap), lebih dekat ke kondisi Indonesia daripada dataset Taiwan/Spanyol.
- **Masih tidak ada layu bakteri (*Ralstonia*) maupun layu fusarium.** Busuk ujung buah (blossom end rot) dan antraknosa buah juga tidak ada meski dua kelas buah tersedia.
- Ada rekaman Mendeley lain berjudul persis sama (**10.17632/swtt5wy2pr.1**, 9,9 GB) dari kelompok yang bertumpang tindih; kemungkinan terbitan kembar. Belum dipastikan apakah gambarnya beririsan — periksa checksum sebelum menggabungkan keduanya.
