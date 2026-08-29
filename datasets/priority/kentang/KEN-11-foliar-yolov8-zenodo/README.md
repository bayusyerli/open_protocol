# Annotated Dataset for Potato Foliar Disease and Healthy Leaf Detection (Septoria, Early Blight, Late Blight, Healthy)

- **dataset_id**: KEN-11-foliar-yolov8-zenodo
- **Tanaman**: Kentang (*Solanum tuberosum*) — daun
- **Penyakit/kelas tercakup**: 4 kelas dari `data.yaml` —
  `Alternaria` (early blight, *Alternaria solani*, 1.057 kotak),
  `Lancha` (late blight, *Phytophthora infestans*, 1.072 kotak — *lancha* istilah Andes),
  `Septoria` (bercak Septoria, 548 kotak),
  `Sana` (sehat, 383 kotak)
- **Jenis data**: campuran — gambar + anotasi kotak-batas
- **Format**: JPEG 1024x1024 + label YOLOv8 (`.txt`) + `data.yaml`, dalam ZIP
- **Jumlah**: **3.060 gambar dan 3.060 kotak-batas — sama persis dengan klaim penerbit**
  (train 2.448 · valid 306 · test 306)
- **Sumber**: Zenodo
- **URL sumber**: https://zenodo.org/records/20247345
- **DOI**: 10.5281/zenodo.20247345 (versi ini: 10.5281/zenodo.20247346)
- **Pembuat**: Cuaycal Tirira, Diego Ernesto (Universidad Técnica del Norte, Ekuador)
- **Tahun terbit / pembaruan**: 2026-05-17
- **Lisensi**: **CC BY-NC 4.0** — **non-komersial**, satu-satunya dataset berlisensi NC
  dalam panen kentang ini
- **Ketentuan atribusi**: sebut pembuat, DOI, dan lisensi; **pemakaian komersial tidak
  diizinkan**; nyatakan bila ada perubahan.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 678.792.664 byte (647,4 MB) — sama persis dengan yang dinyatakan Zenodo
- **SHA-256**: `a3ad0a198f6df2c92ffc08f22baab623989f3d01a8e7e878528889d6be3446ab`
- **Status unduh**: diunduh
- **Status verifikasi**: **terverifikasi**
- **Cara verifikasi**:
  - `file -b raw/*.zip` → `Zip archive data, at least v2.0 to extract, compression method=store`
  - `unzip -tqq raw/*.zip` → lolos tanpa CRC error
  - `stat -f%z` → 678.792.664 byte, cocok dengan ukuran yang dinyatakan Zenodo
  - cacah → 3.060 `.jpg`, 3.061 `.txt`, 3 `.yaml`
  - label diekstrak ke direktori scratchpad (bukan ke `datasets/`) lalu diurai:
    **3.060 kotak, 0 berkas label kosong**, sebaran kelas terstratifikasi lintas split
- **Keterbatasan / masalah kualitas**:
  - **Lisensi NC.** Berbeda dari seluruh dataset lain dalam panen ini yang CC BY 4.0 atau CC0.
    Kalau produk turunannya bersifat komersial, dataset ini **tidak boleh dipakai**.
    Ini pembatas paling praktis di sini.
  - **Percanggahan pernyataan lisensi**: `data.yaml` di dalam arsip memuat `license: Private`
    (setelan proyek Roboflow `agronorteai/deteccion-de-enfermedades-en-hoj-s1dkz` v7),
    sedangkan metadata Zenodo menyatakan CC BY-NC 4.0. Yang mengikat untuk deposit ini adalah
    pernyataan Zenodo, tetapi percanggahan ini dicatat karena bisa menyesatkan.
  - **70% isinya duplikasi PlantVillage.** Penerbit menyatakan dataset ini menggabungkan
    908 citra lapangan Ekuador dengan **2.152 citra laboratorium dari PlantVillage**.
    Karena PlantVillage diklaim agen tomat (`TOM-01-plantvillage`), **KEN-11 adalah tambahan
    bersih hanya sebesar ~908 citra**, bukan 3.060. Jangan menjumlahkan keduanya begitu saja.
  - **Tepat satu kotak per gambar** (3.060 kotak untuk 3.060 gambar). Jadi ini sebenarnya
    tugas **klasifikasi yang dibungkus format deteksi**, bukan deteksi banyak objek dalam satu
    bidang pandang. Untuk deteksi objek sungguhan pada foto kebun, pakai `KEN-05` (PlantDoc).
  - **Sudah diproses berat**: distandarkan ke 1024x1024 dengan *padding* putih dan diberi
    CLAHE (peningkatan kontras adaptif). Latar putih buatan dan kontras yang sudah diubah
    berarti model yang dilatih di sini belum tentu memindah ke foto ponsel apa adanya.
  - Kelas `Sana` (sehat) paling tipis (383), dan `Septoria` (548) juga relatif tipis.
  - Asal Ekuador + PlantVillage (Amerika Serikat); bukan Indonesia.

## Nilai

Satu-satunya dataset daun kentang dalam panen ini yang **berlabel kotak-batas siap pakai
dalam format YOLOv8**, lengkap dengan `data.yaml` dan pembagian train/valid/test terstratifikasi
— bisa langsung dilatih tanpa pekerjaan anotasi.

Ia juga satu-satunya yang memuat kelas **Septoria** pada kentang.

Bandingkan dengan `KEN-15` yang citranya asli lapangan tetapi **tanpa label sama sekali**:
keduanya saling melengkapi — KEN-11 memberi label siap pakai dengan citra yang sudah diproses,
KEN-15 memberi citra lapangan mentah yang perlu dianotasi.
