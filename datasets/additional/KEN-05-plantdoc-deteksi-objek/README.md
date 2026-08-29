# PlantDoc Object Detection Dataset (varian kotak-batas)

- **dataset_id**: KEN-05-plantdoc-deteksi-objek
- **Tanaman**: **13 spesies** (multi-tanaman → `additional/`) — sama dengan KEN-04, termasuk
  **kentang** dan **tomat**
- **Penyakit/kelas tercakup**: 29 kelas di `train`, 27 di `test`.
  Kelas **kentang** (3): `Potato leaf` (sehat, 11 kotak), `Potato leaf early blight`
  (316 train + 17 test), `Potato leaf late blight` (240 train + 10 test) — **594 kotak-batas**.
  Kelas **tomat** (9): 2.740 kotak train + 192 test; terbanyak `Tomato leaf yellow virus` (787)
  dan `Tomato Septoria leaf spot` (412).
- **Jenis data**: campuran — gambar + anotasi kotak-batas
- **Format**: JPG + **PASCAL VOC XML** (satu berkas per gambar) + dua CSV rata
  (`train_labels.csv`, `test_labels.csv`), semuanya dalam ZIP dari GitHub `codeload`
- **Jumlah**: 2.594 gambar, 2.593 berkas XML, **8.921 kotak-batas** (8.469 train + 452 test)
- **Sumber**: GitHub — `pratikkayal/PlantDoc-Object-Detection-Dataset`
- **URL sumber**: https://github.com/pratikkayal/PlantDoc-Object-Detection-Dataset
- **DOI**: tidak ada DOI. Makalah: arXiv 1911.10317; ACM 10.1145/3371158.3371196
- **Pembuat**: Davinder Singh; Naman Jain; Pranjali Jain; Pratik Kayal; Sudhakar Kumawat;
  Nipun Batra
- **Tahun terbit / pembaruan**: 2019–2020
- **Lisensi**: CC BY 4.0 (metadata GitHub dan `LICENSE.txt` di dalam arsip)
- **Ketentuan atribusi**: sebut keenam penulis, sitasi makalah CoDS-COMAD 2020, lisensi CC BY 4.0.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 994.774.747 byte (948,7 MB)
- **SHA-256**: `5a1c4e745967c7cc13b4b38c407e933c5137074932339c00e0d4fc17506c68ac`
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**:
  - `file -b raw/*.zip` → `Zip archive data, at least v1.0 to extract, compression method=store`
  - `unzip -tqq raw/*.zip` → lolos tanpa CRC error
  - cacah ekstensi → 2.594 `.jpg`, 2.593 `.xml`, 2 `.csv`
  - `unzip -p` atas `train_labels.csv`/`test_labels.csv` lalu `csv.DictReader` →
    8.469 dan 452 kotak; 2.345 dan 236 gambar unik; 29 dan 27 kelas
  - contoh XML dibuka dan strukturnya dicatat di `struktur.txt`
- **Keterbatasan / masalah kualitas**:
  - **Satu gambar tanpa anotasi**: 2.594 `.jpg` lawan 2.593 `.xml`.
  - **Ketimpangan train/test parah**: 8.469 kotak di train lawan hanya 452 di test (rasio 19:1),
    dan test kehilangan 2 dari 29 kelas. Evaluasi pada test bawaan akan berderau tinggi.
  - Kelas sehat kentang `Potato leaf` hanya **11 kotak** dan **tidak ada di test** — terlalu
    sedikit untuk dipakai sebagai kelas sehat yang sahih, meski keberadaannya membuat varian
    ini lebih lengkap dari KEN-04 yang tidak punya kelas sehat kentang sama sekali.
  - **Nama berkas kotor** akibat scraping internet: ada berkas berakhiran `jpg?w=500&h=889`,
    `jpg?itok=pnsi4nfy`, `jpg?1472881613`. Pipeline yang menyaring berdasarkan ekstensi
    `.jpg` akan **melewatkan** berkas-berkas ini tanpa suara.
  - Medan `<path>` di XML masih memuat jalur mesin penulis aslinya
    (`/home/pranjali/Desktop/sem6/ML_Project/...`) — gunakan `<filename>`, bukan `<path>`.
  - Nama `<folder>` di XML kadang berspasi di ujung (` bell pepper leaf spot `) dan tidak
    selalu identik dengan `<name>` pada objek — pakai `<name>` sebagai label.
  - Hak cipta per gambar tidak seragam (scraping internet), sama seperti KEN-04.
    Aman untuk pelatihan; penerbitan ulang per gambar berisiko.

## Hubungan dengan KEN-04

Keduanya berasal dari makalah dan tim yang sama:

| | KEN-04 (klasifikasi) | KEN-05 (deteksi objek) |
|---|---|---|
| isi | citra **sudah dipotong** per objek | **foto lapangan utuh** + kotak-batas |
| anotasi | hanya nama direktori kelas | VOC XML + CSV, 8.921 kotak |
| kelas kentang | 2 (tanpa sehat) | **3 (dengan sehat, 11 kotak)** |
| gambar | 2.579 | 2.594 |

Untuk melatih **detektor** pada foto kebun apa adanya, pakai KEN-05.
Untuk melatih **pengklasifikasi** daun yang sudah terpotong, pakai KEN-04.
Gambarnya sebagian besar bertumpang tindih — **jangan mencampur keduanya dalam satu
split latih/uji**, karena gambar yang sama akan muncul di kedua sisi.
