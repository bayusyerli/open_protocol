# Tomato Disease Dataset (rumah kaca Sichuan) — layu bakteri, penyakit virus, busuk kelabu

- **dataset_id**: TOM-16-sichuan-layu-bakteri
- **Tanaman**: Tomat (*Solanum lycopersicum*)
- **Penyakit/kelas tercakup**: 3 penyakit di tingkat berkas — **layu bakteri** (*Ralstonia solanacearum*) 527 gambar, **penyakit virus** 417 gambar, **busuk kelabu / gray mold** (*Botrytis cinerea*) 82 gambar. Di dalam anotasi, kelasnya lebih halus: **10 nama `<object><name>`** yang menggabungkan penyakit dengan **bagian tanaman**:

  | nama kelas (apa adanya) | kotak | gambar |
  |---|---|---|
  | `Viral_Leaf` | 1.522 | 325 |
  | `Wilt_Leaf` | 405 | 147 |
  | `Wilt_Middle` | 345 | 303 |
  | `Wilt_Top` | 298 | 267 |
  | `Wilt_Base` | 173 | 141 |
  | `Viral_Top` | 139 | 128 |
  | `Wilt_Stem` | 135 | 106 |
  | `GrayMold_Leaf` | 76 | 43 |
  | `GrayMold_Fruit` | 52 | 46 |
  | `Virus_Middle` | 22 | 20 |
  | **total** | **3.167** | |

  Lima kelas layu (`Wilt_Base`, `Wilt_Stem`, `Wilt_Middle`, `Wilt_Top`, `Wilt_Leaf`) berjumlah **1.356 kotak** dan bersama-sama memetakan gejala layu dari pangkal ke pucuk.
- **Jenis data**: gambar + anotasi kotak pembatas
- **Format**: JPG resolusi penuh + anotasi **PASCAL VOC (XML)**, satu XML per gambar, berkas lepas (sumber tidak menyediakan arsip)
- **Jumlah**: diklaim 1.026 gambar (527 + 417 + 82); terhitung **1.026 gambar + 1.026 XML = 2.052 berkas** — **cocok**. Anotasi: **3.167 kotak pembatas**, 1–10 kotak per gambar.
- **Sumber**: Mendeley Data
- **URL sumber**: https://data.mendeley.com/datasets/c2x8rynybg/1
- **DOI**: 10.17632/c2x8rynybg.1 (makalah pendamping: *Data in Brief*, doi 10.1016/j.dib.2025.112032)
- **Pembuat**: Yongbo Liu
- **Tahun terbit / pembaruan**: 2025-07-22 (versi 1); data dikumpulkan 2024
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: Atribusi ke Yongbo Liu + tautan lisensi + penandaan perubahan. Sitasi makalah: "A labeled image dataset of common tomato diseases for classification and object detection", *Data in Brief* (2025), doi 10.1016/j.dib.2025.112032.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: **2.989.253.828 byte (2,78 GiB / 2,99 GB)** — di bawah batas keras 3 GB
- **SHA-256**: lihat `SHA256SUMS.txt` (2.052 baris, satu per berkas)
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**:
  - Ukuran diperiksa **sebelum** unduh: total `content_details.size` dari public API Mendeley = **2.989.253.828 byte < 3.000.000.000** → muat. Dicek juga dengan `curl -sIL` pada satu berkas nyata → `HTTP/2 302` lalu `HTTP/1.1 200 OK`, `Content-Type: image/jpeg`, `Content-Length: 6460350`.
  - Diunduh berkas per berkas (repositori tidak menyediakan arsip tunggal), dengan percobaan ulang berjenjang. **2.052 dari 2.052 berkas terunduh utuh.**
  - **SHA-256 setiap berkas dibandingkan dengan `sha256_hash` yang dipublikasikan API Mendeley → 0 berkas tidak cocok.** Ukuran akhir di disk 2.989.253.828 byte, sama persis dengan yang dilaporkan API.
  - `ls raw | sed 's/.*\.//' | sort | uniq -c` → 1.026 `jpg`, 1.026 `xml`
  - Cacah per kelas dari awalan nama berkas → Wilt 527, Viral 417, Gray 82 = **1.026**, sama dengan angka yang diklaim sumber
  - Pasangan gambar↔anotasi dicek dengan operasi himpunan pada nama dasar → **0 gambar tanpa anotasi, 0 anotasi yatim, cakupan 100%**
  - Seluruh 1.026 XML diurai dengan `xml.etree.ElementTree` → **0 gagal urai**; `<object><name>` dicacah → 10 nama kelas, 3.167 kotak; distribusi kotak per gambar {1:241, 2:303, 3:137, 4:123, 5:71, 6:63, 7:42, 8:27, 9:16, 10:3}
  - `<size>` dibaca dari XML → resolusi 3024×4032 (739 gambar) dan 4032×3024 (287 gambar), yaitu **12 MP penuh**
  - `<folder>` dibaca dari XML → `Wilt` 527, `Viral` 417, `GrayMold` 82, konsisten dengan awalan nama berkas

## Mengapa dataset ini penting

**Ini satu-satunya dataset dalam seluruh panen tomat yang memuat layu bakteri (*Ralstonia solanacearum*)** — penyakit tomat paling merugikan di dataran rendah tropis, termasuk Indonesia.

Alasan kekosongan itu struktural: layu bakteri adalah **penyakit pembuluh**. Gejala utamanya layu seluruh tanaman dan pencoklatan berkas pembuluh batang, bukan bercak daun. Seluruh tradisi dataset penyakit tomat — PlantVillage, Tomato-Village, dataset Pakistan, Taiwan, Bangladesh — dibangun di atas **foto daun**, sehingga penyakit pembuluh tidak pernah bisa masuk.

Dataset ini menembus batasan itu dengan cara yang tepat: **anotasinya memakai bagian tanaman sebagai kelas** (`Wilt_Base`, `Wilt_Stem`, `Wilt_Middle`, `Wilt_Top`, `Wilt_Leaf`). Jadi satu foto tanaman utuh bisa memuat beberapa kotak yang memetakan bagaimana layu menaik dari pangkal ke pucuk — geometri yang mustahil direkam dataset daun-petik. Rata-rata 3,1 kotak per gambar, dengan 303 gambar memuat 2 kotak dan 3 gambar memuat 10 kotak.

Nilai tambah lain:
- **Resolusi penuh 12 MP (4032×3024)**, tidak diperkecil. Bandingkan dengan TOM-11 (~23 KB/berkas) atau TOM-06 (512×512).
- **Cakupan anotasi 100%** — tidak ada gambar telantar. Bandingkan TOM-11 yang 51% gambarnya tanpa label.
- **Nama berkas menyandi tanggal sesi** (`Wilt_1112_001.jpg` → 12 November): lima sesi pada 05-09, 06-17, 09-19, 10-21, 11-12 tahun 2024. Ini memungkinkan **split bebas kebocoran berbasis sesi** — hal yang tidak bisa dilakukan di hampir semua dataset lain di koleksi ini karena nama berkasnya ter-hash Roboflow.
- Menurut makalah pendamping, anotasi dikerjakan **di bawah bimbingan ahli patologi tumbuhan**.

## Keterbatasan / masalah kualitas

- **Nama kelas tidak konsisten**: `Virus_Middle` (22 kotak, 20 gambar) memakai awalan `Virus_` sedangkan `Viral_Leaf` dan `Viral_Top` memakai `Viral_`. Hampir pasti salah ketik pada satu batch anotasi. Harus disatukan saat pemuatan, tetapi **jangan diubah di `raw/`**.
- **Sangat timpang**: `Viral_Leaf` 1.522 kotak melawan `Virus_Middle` 22 kotak — selisih 69×. Di tingkat penyakit, gray mold hanya 82 gambar (8% dataset) melawan layu bakteri 527 (51%).
- **Skema kelasnya campur aduk dua sumbu.** `Wilt_*` dipecah menjadi lima bagian tanaman, tetapi `GrayMold_*` hanya dua (`Leaf`, `Fruit`) dan `Viral_*` hanya tiga (`Leaf`, `Top`, `Middle`). Tidak ada `Wilt_Fruit` maupun `GrayMold_Stem`. Jadi skemanya tidak ortogonal: sebagian kombinasi penyakit×bagian tidak pernah dianotasi, dan ketiadaannya **bukan** berarti gejalanya tidak ada.
- **Tidak ada kelas sehat.** Tidak ada satu pun gambar atau kotak tanaman sehat, sehingga dataset ini tidak bisa dipakai sendirian untuk memutuskan "sakit atau tidak" — hanya untuk membedakan di antara tiga penyakit yang sudah diketahui ada.
- **Tidak ada layu fusarium.** Layu bakteri tertutup, layu fusarium **masih nol** di seluruh koleksi. Keduanya menghasilkan gejala layu yang mirip di lapangan dan justru **paling sulit dibedakan tanpa uji potong batang / uji pancaran bakteri**. Model yang dilatih di sini akan melabeli tanaman layu fusarium sebagai layu bakteri.
- **Rumah kaca, bukan lahan terbuka.** Diambil di taman pertanian modern Provinsi Sichuan, Tiongkok. Kondisinya lebih terkendali daripada lahan petani: jarak tanam teratur, media dan irigasi terkelola. Iklim Sichuan subtropis lembap — lebih dekat ke Indonesia daripada Taiwan atau Spanyol, tetapi tetap bukan tanaman Indonesia, dan kultivarnya tidak disebutkan.
- **Tidak ada pembagian train/valid/test.** Harus dibuat sendiri; pakai sandi tanggal di nama berkas agar bebas kebocoran, jangan acak per-gambar (satu tanaman difoto dari beberapa sudut dalam sesi yang sama).
- **Struktur folder asli hilang saat diunduh.** Sumber memakai 6 folder (3 kelas × gambar/anotasi), tetapi public API Mendeley hanya mengekspos daftar datar tanpa nama folder. Pengelompokan aslinya diselamatkan lewat `folder_id` di `manifes-folder.csv`. Isi `<folder>` di dalam tiap XML (`Wilt`/`Viral`/`GrayMold`) juga memulihkan informasi yang sama.
- Medan `<path>` di dalam XML memuat jalur mesin pembuat (`E:\Dataset\images\GrayMold\...`) — abaikan saat pemuatan.
- Label penyakit virus tidak menyebut virus apa (TYLCV? ToMV? TSWV?), hanya "Viral". Untuk basis pengetahuan, ini terlalu kasar.
