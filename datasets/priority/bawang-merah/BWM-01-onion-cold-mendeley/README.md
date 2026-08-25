# Onion dataset (bagian bawang dari COLD — Chilli and Onion Leaf Dataset)

- **dataset_id**: BWM-01-onion-cold-mendeley
- **Tanaman**: Bawang (*Allium cepa* L., bawang bombay/onion India — **bukan** bawang merah/shallot Indonesia; lihat Keterbatasan)
- **Penyakit/kelas tercakup**: (nama kelas apa adanya dari struktur folder arsip)
  - `healthy` / `healthy_augment` — sehat
  - `purple blotch` / `purple blotch_augment` — bercak ungu (*Alternaria porri*); di Indonesia disebut **trotol**
  - `Iris yellow virus` / `Iris yellow virus_augment` — Iris Yellow Spot Virus (IYSV), ditularkan trips
  - `Stemphylium leaf blight and collectrichum leaf blight` — gabungan hawar daun *Stemphylium vesicarium* **dan** *Colletotrichum* (di Indonesia: antraknosa/"otomatis"). Ejaan asli "collectrichum" salah ketik dari sumbernya, dipertahankan apa adanya.
  - Arsip ketiga (`resized_onion_raw`) **tidak berlabel penyakit**: strukturnya `sample 1..7 / day N` — deret waktu umbi, bukan kelas penyakit.
- **Jenis data**: gambar
- **Format**: JPG dalam 3 arsip RAR (satu RAR v5, dua RAR v4)
- **Jumlah**:
  - `augment.rar` — **4.502 JPG** (set teraugmentasi berlabel). Diklaim 4.502 di artikel Data in Brief, **terhitung 4.502 — cocok persis**.
    - healthy 1.278 · Iris yellow virus 1.272 · Stemphylium+Colletotrichum leaf blight 1.217 · purple blotch 735
  - `onion dataset resized.rar` — **816 JPG** berlabel (mentah, sudah di-resize). Artikel mengklaim **864** gambar mentah → **diklaim 864, terhitung 816** (selisih 48).
    - healthy 426 · Iris yellow virus 282 · Stemphylium+Colletotrichum 90 · purple blotch 18
  - `resized_onion_raw.rar` — **1.686 JPG** tanpa label penyakit (sample 1–7 × day N)
  - **Total 7.004 JPG**
- **Sumber**: Mendeley Data (Elsevier). Dataset pendamping artikel *Data in Brief* 54:110524 (2024), "Dataset of chilli and onion plant leaf images for classification and detection".
- **URL sumber**: https://data.mendeley.com/datasets/7nxxn4gj5s/2
- **DOI**: 10.17632/7nxxn4gj5s (versi terakhir yang benar-benar ada di repositori: **v2**)
- **Pembuat**: Aishwarya M. P.; Padmanabha Reddy (India)
- **Tahun terbit / pembaruan**: terbit 2024-04-16; v2 adalah versi terakhir
- **Lisensi**: **CC BY 4.0** (dinyatakan di metadata Mendeley: `data_licence.short_name = "CC BY 4.0"`, http://creativecommons.org/licenses/by/4.0)
- **Ketentuan atribusi**: wajib mencantumkan pembuat + DOI 10.17632/7nxxn4gj5s. Artikel pendampingnya di *Data in Brief* memakai pernyataan **CC BY-NC** — **ada ketidakcocokan lisensi antara artikel dan dataset**. Yang mengikat data adalah lisensi di repositori (CC BY 4.0), tetapi pemakaian komersial sebaiknya dikonfirmasi dulu ke pembuat.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 111,1 MB total (augment.rar 35,9 MB · onion dataset resized.rar 16,3 MB · resized_onion_raw.rar 62,6 MB)
- **SHA-256**: lihat `SHA256SUMS.txt`
- **Status unduh**: diunduh
- **Status verifikasi**: sebagian
- **Cara verifikasi**: `bsdtar` (libarchive) membaca RAR v4 dan v5 tanpa ekstraksi. Perintah persis dan keluarannya tersimpan penuh di `struktur.txt`:
  - `file raw/*.rar` → `RAR archive data, v5` dan `RAR archive data, v4, os: Win32` (tipe cocok dengan nama)
  - `bsdtar -tf raw/augment.rar | grep -ci '\.jpg$'` → `4502`
  - `bsdtar -tf raw/augment.rar | grep -i '\.jpg$' | awk -F/ '{print $1"/"$2}' | sort | uniq -c | sort -rn` → cacah per kelas di atas
  - `bsdtar -tf raw/<arsip> >/dev/null` untuk ketiga arsip → exit 0 (tidak ada arsip rusak, tidak ada password)
  - `shasum -a 256 raw/*` → `SHA256SUMS.txt`
  - Tidak ada kode dari repositori yang dijalankan; arsip hanya didaftar isinya, tidak diekstrak ke `datasets/`.
- **Keterbatasan / masalah kualitas**:
  1. **Bukan bawang merah Indonesia.** Ini *Allium cepa* dari desa Chilwadigi, Kabupaten Koppal, Karnataka, **India** — bawang bombay/onion, bukan *A. cepa* var. *aggregatum* (shallot). Morfologi daun mirip dan patogennya sebagian besar sama (Alternaria porri, Stemphylium, Colletotrichum), tapi kultivar, iklim, praktik budidaya, dan latar tanah berbeda dari Brebes/Nganjuk. Model yang dilatih di sini **perlu diuji ulang** pada citra bawang merah Indonesia sebelum dipercaya.
  2. **Augmentasi tercampur dan mendominasi.** `augment.rar` (4.502) adalah hasil augmentasi dari `onion dataset resized.rar` (816) — rasio ±5,5×. Jangan digabung mentah-mentah: kalau augmentasi dan aslinya masuk ke split train/test yang berbeda akan terjadi **kebocoran data** dan akurasi akan tampak jauh lebih tinggi dari kenyataan. Split harus dilakukan di tingkat gambar asli.
  3. **Kelas sangat tidak seimbang di data asli.** purple blotch hanya **18** gambar asli lawan healthy **426** (rasio 1:24). Augmentasi menutupi ketimpangan ini secara kosmetik (735 vs 1.278) tetapi tidak menambah keragaman nyata — kelas trotol/bercak ungu, justru yang paling penting untuk Indonesia, adalah yang paling miskin.
  4. **Dua patogen digabung dalam satu kelas.** `Stemphylium leaf blight and collectrichum leaf blight` mencampur *Stemphylium vesicarium* dengan *Colletotrichum*. Untuk kebutuhan Pranatani keduanya menuntut rekomendasi berbeda (antraknosa/"otomatis" di Indonesia ditangani lain dari hawar Stemphylium), jadi kelas ini **tidak bisa dipakai langsung** untuk rekomendasi tindakan.
  5. **Selisih cacah mentah**: artikel menyebut 864 gambar mentah, arsip berisi 816. Sumber tidak menjelaskan selisihnya.
  6. **Versi tidak sinkron.** Artikel *Data in Brief* merujuk DOI versi `.3`; repositori Mendeley hanya punya v1 dan v2 (dicek lewat API untuk v1–v4; v3 dan v4 mengembalikan `{"error": 404}`). Yang diunduh di sini adalah v2, versi terakhir yang benar-benar tersedia.
  7. **Arsip ketiga tidak berguna untuk klasifikasi penyakit.** `resized_onion_raw.rar` (1.686 JPG, 62,6 MB — lebih dari separuh ukuran unduhan) berstruktur `sample/day` tanpa label penyakit sama sekali. Sumber tidak mendokumentasikan artinya; dugaan paling masuk akal adalah pemantauan umbi harian. Jangan diperlakukan sebagai data berlabel.
  8. **Format RAR**, bukan ZIP — perlu libarchive/unrar. Tidak ada masalah untuk `bsdtar`, tapi menyulitkan pipeline yang hanya menangani ZIP.
  9. **Tidak ada data pribadi** yang terdeteksi (tidak ada nama/kontak petugas dalam struktur berkas).

## Catatan lintas-agen

Dataset ini adalah **separuh "onion"** dari COLD (Chilli and Onion Leaf Dataset). Separuh **cabai**-nya
terbit terpisah dan **bukan milik agen bawang merah**:

- **Chilli**: DOI **10.17632/tf9dtfz9m6** — https://data.mendeley.com/datasets/tf9dtfz9m6/2 —
  10.987 gambar teraugmentasi (2.064 mentah) dalam 5 kelas: Healthy 2.198, Cercospora 2.219,
  Mites and thrips 2.507, Nutritional Deficiency 2.032, Powdery Mildew 4.502.
  Lokasi & lisensi sama dengan dataset ini. **Diserahkan ke agen cabai** — tidak diunduh di sini.
