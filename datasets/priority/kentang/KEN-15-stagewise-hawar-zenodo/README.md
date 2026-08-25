# Supporting data for: Stage-wise detection of late blight in field-grown potato

- **dataset_id**: KEN-15-stagewise-hawar-zenodo
- **Tanaman**: Kentang (*Solanum tuberosum*) — daun, di pertanaman lapangan
- **Penyakit/kelas tercakup**: hawar daun (*Phytophthora infestans*) **bertahap** —
  naskahnya memakai `Healthy`, `ILB` (Initial Late Blight), `ALB` (Advanced Late Blight).
  **PERINGATAN: ketiga label ini TIDAK disertakan dalam deposit** (lihat keterbatasan).
- **Jenis data**: campuran — gambar (tanpa label) + tabular hasil evaluasi model
- **Format**: JPEG 640x640 + 16 CSV + dokumentasi (MD/CFF/TXT), dalam ZIP
- **Jumlah**: **1.561 gambar — sama persis dengan klaim penerbit**, tetapi hanya
  **1.544 di antaranya unik** (17 duplikat identik bita, lihat keterbatasan); 16 berkas CSV
- **Sumber**: Zenodo
- **URL sumber**: https://zenodo.org/records/22059910
- **DOI**: 10.5281/zenodo.22059910
- **Pembuat**: Sunny Kumar Sharma; Hifjur Raheman
- **Tahun terbit / pembaruan**: 2026-08-22
- **Lisensi**: CC BY 4.0 (dinyatakan di metadata Zenodo dan `LICENSE.txt` di dalam arsip)
- **Ketentuan atribusi**: sitasi naskah Sharma & Raheman (2026), *Cogent Food & Agriculture*;
  berkas `CITATION.cff` disertakan di dalam arsip.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 146.597.826 byte (139,8 MB)
- **SHA-256**: `59e902c87dddf41d1f8dd4ffbfed296d5ab970fac82cdfaffe1e4edfca498554`
- **Status unduh**: diunduh
- **Status verifikasi**: **terverifikasi**
- **Cara verifikasi**:
  - `file -b raw/*.zip` → `Zip archive data, at least v2.0 to extract, compression method=deflate`
  - `unzip -tqq raw/*.zip` → lolos tanpa CRC error
  - `unzip -l | grep -icE '\.jpg$'` → **1.561**, sama persis dengan klaim
  - cacah ekstensi lain → 16 `.csv`, 2 `.md`, 1 `.txt`, 1 `.cff`
  - `unzip -p '*/DATA_PROVENANCE.md'` dibaca seluruhnya untuk memastikan cakupan deposit
- **Keterbatasan / masalah kualitas**:
  - **Citranya ASLI LAPANGAN tetapi TIDAK BERLABEL.** Ini keterbatasan utama.
    `DATA_PROVENANCE.md` di dalam arsip menyatakan secara eksplisit bahwa yang **tidak**
    disertakan adalah: label kelas per gambar (Healthy/ILB/ALB), berkas anotasi kotak-batas,
    manifes pemisahan train/valid/test, berkas prediksi mentah, serta log dan checkpoint latih.
    Alasannya dinyatakan terus terang: berkas-berkas itu tidak tersimpan di arsip proyek saat
    deposit disusun, dan penulis **memilih tidak merekonstruksi atau menaksirnya**.
  - **16 CSV itu bukan label gambar.** Semuanya keluaran evaluasi model (kurva loss, mAP per
    epoch, kurva presisi-recall, matriks kekeliruan, metrik per kelas, sebaran confidence dan
    IoU, tolok ukur kecepatan, studi ablasi) plus angka yang disalin dari tabel naskah.
    Tidak satu pun memetakan `image_N.jpg` ke sebuah kelas.
  - Akibatnya dataset ini **tidak bisa langsung dipakai melatih atau menguji** pengklasifikasi
    maupun detektor. Untuk memakainya, 1.561 citra itu **harus dianotasi ulang dari nol**.
  - Tidak ada EXIF, jadi tanggal, lokasi, dan perangkat pengambilan tidak dapat dipulihkan.
  - Sudah diseragamkan ke 640x640 — bukan resolusi asli kamera.
  - **17 duplikat internal.** Pemeriksaan SHA-256 per berkas atas seluruh 1.561 gambar
    menghasilkan hanya **1.544 hash unik**: 17 pasang berkas identik bita per bita.
    Jadi citra unik sebenarnya **1.544**, dan cacah 1.561 kelebihan 17 bila dipakai
    sebagai jumlah citra asli. Karena label tidak ada, duplikat ini tidak dapat ditelusuri
    ke kelas mana pun.
  - **Tidak tumpang tindih dengan PlantVillage**: 2.152 gambar kentang PlantVillage
    (dari arsip agen tomat, dibaca saja) diiriskan berdasarkan SHA-256 → **0 hash bersama**.
    Catatan: uji hash hanya menangkap duplikat identik bita; gambar yang sama tetapi sudah
    diubah ukuran atau kontrasnya tidak akan terdeteksi.
  - Asal India (afiliasi penulis IIT Kharagpur); bukan Indonesia.

## Nilai yang tetap tinggi meski tanpa label

Dua hal membuat deposit ini tetap berharga:

1. **1.544 citra daun kentang lapangan unik yang benar-benar asli** (dari 1.561 berkas). Dalam panen ini, citra asli
   sangat langka — mayoritas dataset kentang yang beredar adalah turunan augmentasi. Sebagai
   korpus mentah untuk dianotasi sendiri, ini sumbangan terbesar kedua setelah KEN-01.
2. **Gagasan hawar bertahap (ILB vs ALB).** Membedakan hawar **tahap awal** dari **tahap lanjut**
   adalah pembedaan yang paling berguna secara praktis — pada tahap awal penyemprotan masih
   ada gunanya. Tidak ada dataset lain dalam panen ini yang membedakan tahapan.
   Meski labelnya tidak ada, kerangka kelasnya bisa dipakai saat menganotasi ulang.

**Kejujuran deposit ini patut dicatat**: penulisnya menuliskan secara rinci apa yang hilang
alih-alih menyamarkannya. Bandingkan dengan KEN-20 yang deskripsinya menjanjikan anotasi
padahal nol berkas anotasi, atau KEN-03 yang tidak menyebutkan bahwa seluruh isinya augmentasi.
