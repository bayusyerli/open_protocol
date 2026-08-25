# Cercospora Leaf Spot in Chili Pepper Leaves Image Dataset

- **dataset_id**: CAB-08-cercospora-sergipe-zenodo
- **Tanaman**: Cabai (*Capsicum* sp.)
- **Penyakit/kelas tercakup**: satu kelas tunggal — bercak daun *Cercospora* pada daun cabai.
  Tidak ada folder kelas, tidak ada kelas pembanding sehat.
- **Jenis data**: gambar
- **Format**: JPG dalam satu ZIP
- **Jumlah**: diklaim **1.738**, terhitung **1.738** berkas JPG — **tetapi hanya 1.523 di
  antaranya unik** (215 salinan berlebih, 12%).
- **Sumber**: Zenodo (Universidade Federal de Sergipe, Brasil)
- **URL sumber**: https://zenodo.org/records/13272039
- **DOI**: 10.5281/zenodo.13272039
- **Pembuat**: Leite (Universidade Federal de Sergipe)
- **Tahun terbit / pembaruan**: 2024-08-08
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: sebut pencipta dan DOI 10.5281/zenodo.13272039, tandai bila diubah.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 281.604.523 byte (268,56 MiB)
- **SHA-256**: `18d10dec8559a3b4b37656d502055ba6c340c7d4f2987ec41edb9abe1362c8cc`
- **Status unduh**: diunduh
- **Status verifikasi**: sebagian (arsip utuh dan cacah cocok, tetapi 12% isinya duplikat
  internal dan sumber tidak mengumumkan checksum untuk dicocokkan)
- **Cara verifikasi**:
  - `file raw/"FINAL DATASET.zip"` → `Zip archive data, at least v1.0 to extract`.
  - `unzip -tqq raw/"FINAL DATASET.zip"` → tanpa galat.
  - Ukuran unduhan 281.604.523 byte **cocok persis** dengan ukuran yang diumumkan Zenodo API.
    Zenodo tidak mengumumkan SHA-256 di respons API-nya, jadi pencocokan checksum lintas
    penerbit tidak mungkin — karena itu statusnya `sebagian`, bukan `terverifikasi`.
  - Cacah isi, sensus dimensi (header JPEG), dan uji duplikat SHA-256 per gambar dengan
    `python3` + `zipfile` + `hashlib`. Rincian lengkap di `struktur.txt`.
- **Keterbatasan / masalah kualitas**:
  1. **12% duplikat internal**: 1.738 berkas, hanya 1.523 SHA-256 unik.
  2. **Bukan citra lapangan utuh.** Seluruh 1.738 berkas bernama `<angka>__roi_backremoved.jpg`
     — sudah dipotong ke ROI daun dan **latarnya dihapus**. Bagus untuk riset segmentasi lesi,
     buruk sebagai contoh nyata foto ponsel petani (yang selalu berlatar tanah, mulsa,
     tangan, daun lain).
  3. **Tidak ada mask, anotasi, atau label** — padahal deskripsi menyebut dataset disiapkan
     "untuk deteksi dan segmentasi lesi". Tanpa mask, kegunaan segmentasinya nihil.
  4. **Kelas tunggal tanpa pembanding sehat**, jadi tidak bisa dipakai sendirian untuk melatih
     pengklasifikasi.
  5. 1.523 ukuran berbeda untuk 1.738 gambar — praktis setiap gambar beda dimensi.
  6. Bukan data Indonesia (Brasil, Universidade Federal de Sergipe).
  7. Selama sekitar 40 menit zenodo.org membalas HTTP 403 "unusual traffic from your network"
     (pembatasan laju tingkat jaringan, karena empat agen memanennya bersamaan). Bukan dinding
     login. Unduhan berhasil setelah memakai User-Agent `curl` apa adanya, dan setelah
     `robots.txt` diperiksa: `/api` memang `Disallow`, tetapi ada baris eksplisit
     `Allow: /api/records/*/files` — jalur yang dipakai unduhan ini.

## TEMUAN PENTING: dataset ini termuat utuh di dalam CAB-03

Seluruh **1.523 citra unik** CAB-08 muncul **byte-identik** di dalam
`CAB-03-chilli-6-kelas-bangladesh/raw/Cercospora_Leaf_Spot.zip`.

| | CAB-08 (ini) | CAB-03 kelas Cercospora |
|---|---|---|
| Penerbit | Universidade Federal de Sergipe, **Brasil** | Daffodil International University, **Bangladesh** |
| Terbit | 2024-08-08 | 2025-11-24 (15 bulan kemudian) |
| Berkas | 1.738 (1.523 unik) | 1.898 (1.683 unik) |
| Nama berkas | `NNNN__roi_backremoved.jpg` | `Cercospora Leaf Spot_NNN.jpg` |
| Salinan internal berlebih | 215 | 215 |
| **Irisan byte-identik** | **1.523 (100% isi unik CAB-08)** | **1.523 dari 1.683 unik (90,5%)** |

CAB-03 menyatakan citranya dikumpulkan dari lahan di Ashulia, Narsingdi, Cumilla, Feni,
Noakhali, dan Laksham (Bangladesh). Untuk kelas Cercospora, pernyataan itu **tidak sesuai
bukti**: 90,5% citra uniknya adalah data Brasil yang terbit lebih dulu, dengan nama berkas
diganti sehingga jejak `__roi_backremoved` hilang. Kedua dataset bahkan membawa jumlah salinan
internal berlebih yang sama persis (215), konsisten dengan penyalinan utuh berikut duplikatnya.

**Akibat praktis**: jangan menggabung CAB-03 dan CAB-08 dalam satu himpunan latih — 1.523
gambar akan terhitung dua kali. Dan jangan memakai keterangan lokasi kelas Cercospora CAB-03
sebagai fakta geografis.
