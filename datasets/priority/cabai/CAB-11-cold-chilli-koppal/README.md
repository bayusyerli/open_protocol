# chilli dataset (bagian cabai dari COLD — Chilli and Onion Leaf Dataset)

- **dataset_id**: CAB-11-cold-chilli-koppal
- **Tanaman**: Cabai (*Capsicum annuum*)
- **Penyakit/kelas tercakup** (nama folder apa adanya, ejaan asli dipertahankan):
  `cercospora` / `cerocospora` (bercak daun *Cercospora capsici*),
  `healthy`,
  `murda complex(mites,trips)` / `murda complex` (kompleks murda — kerusakan gabungan
  **tungau *Polyphagotarsonemus latus*** dan **trips *Scirtothrips dorsalis***),
  `nutritional` / `nutritional deficiency` (kekurangan hara — gangguan abiotik, bukan patogen),
  `powdery mildew` (embun tepung, *Leveillula taurica*).
- **Jenis data**: gambar
- **Format**: JPG di dalam 3 arsip RAR (2 RAR5, 1 RAR4)
- **Jumlah**: makalah pendamping (Data in Brief) menyebut **10.987** citra cabai
  (2.928 mentah + augmentasi). Terhitung dari header arsip: **13.983** berkas JPG total —
  `resized_raw images.rar` 1.932 · `cropped.rar` 532 · `cropped_resized.rar` 11.519
  (544 hasil crop+resize + 10.999 augmentasi). Selisihnya besar; lihat Keterbatasan.
  Per kelas (arsip mentah `resized_raw images.rar`): cerocospora 899 · healthy 329 ·
  murda complex 275 · nutritional deficiency 267 · powdery mildew 162.
- **Sumber**: Mendeley Data
- **URL sumber**: https://data.mendeley.com/datasets/tf9dtfz9m6/2
- **DOI**: 10.17632/tf9dtfz9m6.2
- **Pembuat**: Aishwarya M P; Padmanabha Reddy
- **Tahun terbit / pembaruan**: 2024-04-16 (versi 2; versi 1 terbit 2024-02-05)
- **Lisensi**: **CC BY 4.0** menurut metadata Mendeley (`data_licence.short_name`).
  **Perhatian**: makalah Data in Brief pendampingnya menyebut lisensi **CC BY-NC 4.0**
  (non-komersial). Dua pernyataan ini bertentangan — perlakukan sebagai **CC BY-NC 4.0**
  (yang lebih membatasi) sampai penerbitnya mengklarifikasi, terutama bila hendak dipakai
  untuk produk komersial.
- **Ketentuan atribusi**: sebut pencipta dan DOI 10.17632/tf9dtfz9m6, serta makalah
  Data in Brief "Dataset of chilli and onion plant leaf images for classification and detection".
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 544.025.111 byte (518,82 MiB) untuk 3 berkas
- **SHA-256**: lihat SHA256SUMS.txt
- **Status unduh**: diunduh
- **Status verifikasi**: sebagian (checksum & daftar isi terbukti; piksel belum didekompresi)
- **Cara verifikasi**:
  - `shasum -a 256 raw/*` → ketiga nilai **cocok persis** dengan `content_details.sha256_hash`
    yang diumumkan Mendeley `public-api` (`ec311a5b…`, `4a1b23b4…`, `d3219be0…`).
  - `file raw/*` → `RAR archive data, v5` (×2) dan `RAR archive data, v4, os: Win32`;
    tipe cocok dengan ekstensi.
  - Lingkungan kerja **tidak punya** `unrar`/`unar`/`7z`. Daftar isi dibaca dengan mengurai
    **header** RAR4/RAR5 langsung dari byte memakai skrip `python3` sendiri (hanya membaca
    nama + ukuran asli; tidak mendekompresi, tidak menjalankan apa pun). Hasil cacah per kelas
    ada di `struktur.txt`.
  - Karena piksel tiap gambar belum pernah didekompresi, status ditulis `sebagian`, bukan
    `terverifikasi`.
- **Keterbatasan / masalah kualitas**:
  1. **Kebocoran latih/uji parah.** Di `cropped_resized.rar/augment/`, nama berkas berpola
     `<kelas>_<indeks_sumber>_<indeks_augmentasi>.jpg`. Dari 227 indeks sumber di `test`,
     **179 (78,9%) juga muncul di `train`**. Varian augmentasi dari foto yang sama ada di
     kedua sisi, sehingga akurasi pada pembagian bawaan ini **tidak sahih**. Tambahan:
     6 nama berkas identik muncul di `resized_cropped_chilly/train` dan `/test`.
     **Rekomendasi**: buang folder `augment/`, pakai `resized_raw images.rar` saja, lalu bagi
     sendiri berdasarkan indeks sumber.
  2. **Cacah tidak cocok dengan klaim makalah** (10.987 vs 13.983 terhitung). Kemungkinan
     makalah menghitung versi 3 (yang dirujuk sebagai `tf9dtfz9m6.3`) padahal API hanya
     mengekspos versi 1 dan 2 — jadi nomor versi yang disitasi makalah pun tidak ada.
  3. **Ejaan kelas tidak konsisten** antar arsip: `cercospora` vs `cerocospora`,
     `murda complex(mites,trips)` vs `murda complex`, `nutritional` vs `nutritional deficiency`.
     Penggabungan otomatis berdasarkan nama folder akan memecah kelas yang sama jadi dua.
  4. **Bukan data Indonesia**: desa Chilwadigi, distrik Koppal, Karnataka, India.
  5. Kelas `nutritional deficiency` bukan penyakit menular — mencampurnya dalam satu model
     "penyakit" membuat keluaran model tidak bisa dipetakan ke tindakan pengendalian.
  6. Format RAR menyulitkan pemakaian: kebanyakan alat pipeline data (dan lingkungan ini
     sendiri) tidak bisa membukanya tanpa memasang perkakas tambahan.
  7. Kelas sangat tidak seimbang pada arsip mentah: cerocospora 899 vs powdery mildew 162.

## Catatan pembagian antar agen

Dataset COLD terbit sebagai **dua DOI terpisah**:

- bagian **bawang** — `10.17632/7nxxn4gj5s` — sudah diklaim **agen bawang merah**
  (`datasets/priority/bawang-merah/BWM-01-onion-cold-mendeley`). **Tidak diunduh ulang** di sini.
- bagian **cabai** — `10.17632/tf9dtfz9m6` — inilah yang diambil agen cabai (berkas ini).

Keduanya berbagi satu makalah Data in Brief, lokasi pengumpulan, dan tim penulis, tetapi
berkasnya terpisah, jadi tidak ada unduhan ganda.

## Nilai khusus

Ini **satu-satunya** dataset dalam panen cabai yang memuat kelas **hama** (`murda complex` —
tungau + trips) dan salah satu dari dua yang memuat **embun tepung**. Untuk Pranatani, kelas
murda penting karena gejala keriting akibat tungau/trips sering **tertukar dengan virus kuning
keriting daun** di lapangan, padahal tindakan pengendaliannya berbeda sama sekali (akarisida/
insektisida vs pengendalian vektor kutu kebul + sanitasi).
