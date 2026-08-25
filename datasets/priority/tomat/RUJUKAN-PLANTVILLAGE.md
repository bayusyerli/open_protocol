# Rujukan silang: dataset tomat yang tinggal di luar direktori ini

Beberapa dataset yang memuat tomat berada di `datasets/additional/` karena cakupannya
tiga tanaman atau lebih. **Jangan diunduh ulang** — rujuk ke jalur di bawah ini.

## `TOM-01` PlantVillage → `datasets/additional/TOM-01-plantvillage/`

Sumber gambar penyakit tomat terbesar dalam repo ini.

- **10 kelas tomat, 18.159 gambar** (varian `color`):
  Bacterial spot 2.127 · Early blight 1.000 · Late blight 1.908 · Leaf Mold 952 ·
  Septoria leaf spot 1.771 · Spider mites 1.676 · Target Spot 1.404 ·
  Yellow Leaf Curl Virus 5.357 · Mosaic virus 373 · healthy 1.591
- **3 kelas kentang, 2.152 gambar**: Early blight 1.000 · Late blight 1.000 · healthy 152
- Lisensi **CC BY-SA 3.0** (berbagi-serupa — menular ke turunan)
- **Pakai varian `raw/color`.** `grayscale` dan `segmented` adalah turunan dari gambar yang sama.
- **Peringatan besar**: daun tunggal dipetik, latar seragam, studio. Model yang dilatih di sini
  jatuh pada foto lapangan. Wajib pakai `leaf_grouping/` untuk membuat split bebas kebocoran.
- Rincian lengkap: `datasets/additional/TOM-01-plantvillage/README.md`

## `TOM-12` PhytoScope → `datasets/additional/TOM-12-phytoscope-lapangan/`

- **4 kelas tomat, 801 gambar lapangan dengan kotak pembatas YOLO**:
  Tomato Bacterial spot · Tomato Fresh leaf · Tomato leaf curl virus · **Tomato spotted wilt**
- `Tomato spotted wilt` nyaris tidak ada di dataset tomat lain mana pun.
- Lisensi CC BY 4.0. Saring berkas berawalan `aug` sebelum evaluasi.

## `TOM-10` Soil-Weather → `datasets/additional/TOM-10-cuaca-tanah-tabular/`

- **20.720 baris tomat** dengan 6 kelas, termasuk **Bacterial Wilt 802 baris** —
  satu-satunya penyebutan layu bakteri di seluruh data tabular yang berhasil diunduh.
- **Tetapi**: datanya kemungkinan besar sintetis. Baca bagian keterbatasan di README-nya
  sebelum memakainya untuk apa pun.

## PlantDoc → `datasets/additional/KEN-04-plantdoc-lapangan/` (milik agen kentang)

- Dataset lapangan (bukan studio) dengan **737 gambar tomat di 8 kelas**.
- Diklaim dan diunduh oleh agen kentang. Rujuk ke direktori itu, jangan diunduh ulang.
