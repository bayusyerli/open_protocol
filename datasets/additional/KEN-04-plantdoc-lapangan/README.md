# PlantDoc: A Dataset for Visual Plant Disease Detection (varian klasifikasi / Cropped-PlantDoc)

- **dataset_id**: KEN-04-plantdoc-lapangan
- **Tanaman**: **13 spesies** (multi-tanaman, karena itu berada di `additional/`) — apel,
  paprika, blueberry, ceri, jagung, anggur, persik, **kentang**, raspberry, kedelai, labu,
  stroberi, **tomat**
- **Penyakit/kelas tercakup**: 28 nama direktori kelas. Kelas **kentang** (2):
  `Potato leaf early blight` (117), `Potato leaf late blight` (105).
  Kelas **tomat** (9): `Tomato Early blight leaf` (88), `Tomato Septoria leaf spot` (151),
  `Tomato leaf` (63), `Tomato leaf bacterial spot` (110), `Tomato leaf late blight` (111),
  `Tomato leaf mosaic virus` (54), `Tomato leaf yellow virus` (76), `Tomato mold leaf` (91),
  `Tomato two spotted spider mites leaf` (2).
  Daftar lengkap 28 kelas ada di `struktur.txt`.
- **Jenis data**: gambar
- **Format**: JPG/PNG dalam ZIP (unduhan `codeload` dari GitHub), terbagi `train/` dan `test/`
- **Jumlah**: diklaim 2.598 (makalah CoDS-COMAD 2020), terhitung **2.579**
- **Sumber**: GitHub — `pratikkayal/PlantDoc-Dataset`
- **URL sumber**: https://github.com/pratikkayal/PlantDoc-Dataset
- **DOI**: tidak ada DOI. Makalah: arXiv 1911.10317; ACM 10.1145/3371158.3371196
- **Pembuat**: Davinder Singh; Naman Jain; Pranjali Jain; Pratik Kayal; Sudhakar Kumawat;
  Nipun Batra
- **Tahun terbit / pembaruan**: 2019 (repo dibuat 2019-09-09; commit terakhir 2021-05-02)
- **Lisensi**: CC BY 4.0 (metadata GitHub **dan** `LICENSE.txt` di dalam arsip)
- **Ketentuan atribusi**: sebut keenam penulis dan sitasi makalah CoDS-COMAD 2020; lisensi CC BY 4.0.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 984.413.268 byte (938,8 MB)
- **SHA-256**: lihat `SHA256SUMS.txt`
- **Status unduh**: diunduh
- **Status verifikasi**: sebagian
- **Cara verifikasi**:
  - `file -b raw/*.zip` → `Zip archive data, at least v1.0 to extract, compression method=store`
  - `unzip -tqq raw/*.zip` → lolos tanpa CRC error
  - `unzip -l raw/*.zip | grep -icE '\.(jpg|jpeg|png)$'` → **2.579** (klaim 2.598, selisih 19)
  - kelas kentang: `... | awk -F/ '{print $3}' | grep -ci '^Potato'` → **222**
  - kelas tomat: idem dengan `^Tomato` → **746**
  - `unzip -p raw/*.zip '*/LICENSE.txt' | head -3` → `Attribution 4.0 International`
- **Keterbatasan / masalah kualitas**:
  - **Selisih cacah 19 gambar** dari klaim makalah → status `sebagian`.
  - **Tidak ada kelas kentang sehat.** Varian klasifikasi ini hanya punya early blight dan
    late blight; tidak ada `Potato leaf` sehat, padahal untuk tomat kelas `Tomato leaf` sehat
    tersedia. Untuk melatih pengklasifikasi kentang 3 kelas, citra sehat harus diambil dari
    dataset lain — dan itu memasukkan pergeseran domain.
  - **Kelas `Tomato two spotted spider mites leaf` hanya berisi 2 gambar**, keduanya di `train`,
    nol di `test`. Praktis tak terpakai. Ini juga yang membuat cacah direktori jadi 28
    sementara makalah menyebut 27 kelas.
  - Kentang hanya **222 dari 2.579** gambar (8,6%) dalam 2 kelas — cakupan kentang di sini
    **dangkal**. Nilainya bukan pada jumlah, melainkan pada jenis citranya.
  - Gambar hasil **scraping internet**, dianotasi manual (~300 jam kerja manusia). Konsekuensinya:
    status hak cipta tiap gambar **tidak seragam** meski repositorinya berlisensi CC BY 4.0.
    Penerbitan ulang gambar per satuan berisiko; pemakaian untuk pelatihan model jauh lebih aman.
  - Ini varian **Cropped-PlantDoc**: objek sudah dipotong mengikuti kotak-batas, jadi bukan
    foto lapangan utuh. Untuk konteks lapangan penuh, pakai varian deteksi objek
    (`KEN-05-plantdoc-deteksi-objek`).
  - Resolusi, sudut, pencahayaan, dan latar sangat bervariasi (itu justru tujuannya).

## Mengapa dataset ini diambil agen kentang

Ditugaskan lewat `KETENTUAN.md` bagian 4 sebagai pembagian anti-duplikasi:
**PlantDoc → agen kentang, PlantVillage → agen tomat.** Nilainya justru pada citra
**lapangan/internet** yang berlatak ramai — pelengkap langsung PlantVillage yang berlatar
studio seragam. Model yang dilatih hanya pada PlantVillage jatuh tajam pada citra lapangan;
PlantDoc adalah tolok ukur untuk mengukur jatuhnya itu.

## Rujukan silang

- Varian deteksi objek berkotak-batas: `datasets/additional/KEN-05-plantdoc-deteksi-objek/`
- Dataset kentang prioritas: `datasets/priority/kentang/`
- PlantVillage (milik agen tomat, memuat kentang juga): lihat `datasets/metadata/klaim/tomat.tsv`
