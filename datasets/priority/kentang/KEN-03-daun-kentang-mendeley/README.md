# Potato Leaf Disease Dataset (BARI Chattogram, Bangladesh)

- **dataset_id**: KEN-03-daun-kentang-mendeley
- **Tanaman**: Kentang (*Solanum tuberosum*) — daun
- **Penyakit/kelas tercakup**: `Bacterial Soft Rot` (397), `Viral Leaf Roll` (394), `Healthy` (392),
  `Fungal Late Blight` (392), `Viral PVY` (389), `Viral PVX` (387)
- **Jenis data**: gambar
- **Format**: JPG dalam satu ZIP
- **Jumlah**: diklaim 2.400 hasil augmentasi dari 804 citra asli; terhitung **2.351**
- **Sumber**: Mendeley Data
- **URL sumber**: https://data.mendeley.com/datasets/d5b3fzpw3g/1
- **DOI**: 10.17632/d5b3fzpw3g.1
- **Pembuat**: Ayesha Banu; Kaushik Deb
- **Tahun terbit / pembaruan**: 2026-05-26 (versi 1)
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: sebut pembuat, DOI, sumber, dan lisensi; nyatakan bila ada perubahan.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 38.393.565 byte (36,6 MB)
- **SHA-256**: `549c7f3343422fa2b77b6fb2c5009a52215aa00626b2646435ba19f4826f8192`
- **Status unduh**: diunduh
- **Status verifikasi**: sebagian
- **Cara verifikasi**:
  - `file -b raw/*.zip` → `Zip archive data, at least v2.0 to extract, compression method=deflate`
  - `unzip -tqq raw/*.zip` → lolos
  - `unzip -l raw/*.zip | grep -icE '\.(jpg|jpeg|png)$'` → **2.351** gambar
  - cacah per kelas → lihat `struktur.txt`
- **Keterbatasan / masalah kualitas**:
  - **Seluruh isi arsip adalah citra augmentasi.** Setiap nama berkas berawalan `aug_`
    (`aug_0_8271.jpg`). **Tidak ada satu pun dari 804 citra asli yang ikut diterbitkan.**
    Ini cacat paling serius pada dataset ini.
  - Akibat langsung: **pemisahan latih/uji acak per berkas akan bocor**, karena beberapa
    turunan augmentasi berasal dari satu citra induk yang sama, dan pemetaan induk→turunan
    tidak disertakan. Angka akurasi yang dilaporkan dengan split acak akan terlalu optimistis.
  - Selisih cacah: diklaim 2.400 (400/kelas), terhitung 2.351 dengan kelas timpang ringan
    (387–397). Kurang 49 berkas tanpa penjelasan → status `sebagian`.
  - Label `Bacterial Soft Rot` pada **daun** perlu dibaca hati-hati: busuk lunak
    (*Pectobacterium*) lazimnya penyakit umbi/batang; gejala daun bersifat sekunder.
  - Label virus (PVY, PVX, Leaf Roll) dari gejala visual saja tanpa konfirmasi ELISA/RT-PCR
    yang dinyatakan. Ketiganya sulit dibedakan secara visual dan mudah tertukar.
  - Kondisi: lapangan asli (BARI, Chattogram, Bangladesh), kamera iPhone 15, cahaya alami —
    ini keunggulannya dibanding dataset berlatar studio.
  - Bukan Indonesia, tetapi iklim tropis dataran rendah Asia Selatan relatif dekat.

## Nilai khas

Ini satu-satunya dataset **daun** dalam panen ini yang memuat kelas virus terpisah
(PVY, PVX, Leaf Roll) sekaligus bakteri dan jamur dalam satu skema label, diambil pada
kondisi lapangan nyata. Bandingkan dengan KEN-02 yang menutup PLRV/mosaik/PSTVd pada
daun **dan** umbi.
