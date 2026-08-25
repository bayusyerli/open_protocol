# Chilli Leaf Disease Image Dataset for Classification and Early Diagnosis in Agriculture

- **dataset_id**: CAB-03-chilli-6-kelas-bangladesh
- **Tanaman**: Cabai (*Capsicum annuum*)
- **Penyakit/kelas tercakup** (6 kelas, nama apa adanya dari sumber):
  `Bacterial_Spot` (bercak bakteri) · `Cercospora_Leaf_Spot` (bercak daun *Cercospora*) ·
  `Curl_Virus` (virus keriting daun) · `Healthy_Leaf` (sehat) ·
  `Nutrition Deficiency` (kekurangan hara — abiotik) · `Powdery Mildew` (embun tepung)
- **Jenis data**: gambar
- **Format**: JPG/PNG — 4 kelas dikemas dalam ZIP, 2 kelas sebagai berkas lepas
- **Jumlah**: diklaim **8.814**, terhitung **8.817** gambar (selisih +3), **7.936 di antaranya
  unik** (881 salinan byte-identik, 10,0%).
  Per kelas (berkas → unik): Cercospora_Leaf_Spot 1.898 → 1.683 · Healthy_Leaf 1.647 → 1.481 ·
  Bacterial_Spot 1.629 → 1.280 · Curl_Virus 1.590 → 1.582 · Nutrition Deficiency 1.207 → 1.067 ·
  Powdery Mildew 846 → 843.
  Total berkas yang diunduh: 2.057 (4 ZIP + 2.053 gambar lepas).
- **Sumber**: Mendeley Data
- **URL sumber**: https://data.mendeley.com/datasets/tm3v4zmh7c/1
- **DOI**: 10.17632/tm3v4zmh7c.1
- **Pembuat**: Radoanul Arifen; S.M. Meriyan Islam (Daffodil International University, Bangladesh)
- **Tahun terbit / pembaruan**: 2025-11-24 (versi 1)
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: sebut kedua pencipta dan DOI 10.17632/tm3v4zmh7c.1, tandai bila diubah.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 3.042.058.153 byte (2.901,13 MiB) untuk 2.057 berkas
- **SHA-256**: lihat SHA256SUMS.txt (2.057 baris)
- **Status unduh**: diunduh (lengkap, seluruh berkas di DOI)
- **Status verifikasi**: sebagian — arsip utuh dan **seluruh** checksum cocok, tetapi cacah
  gambar dan terutama **klaim resolusi** tidak sesuai deskripsi sumber
- **Cara verifikasi**:
  - Manifes + checksum diambil dari `https://data.mendeley.com/public-api/datasets/tm3v4zmh7c`.
  - **Seluruh 2.057 berkas** dihitung SHA-256-nya (`python3` + `hashlib`) dan dicocokkan satu
    per satu dengan `content_details.sha256_hash` → **0 ketidakcocokan, 0 berkas hilang**.
  - `unzip -tqq raw/*.zip` → keempat ZIP lolos tanpa galat.
  - Cacah per kelas dengan `python3` + `zipfile` + `os.listdir`.
  - **Sensus dimensi**: lebar×tinggi dibaca dari header PNG (IHDR) dan JPEG (penanda SOF)
    untuk **seluruh 8.817 gambar**, bukan sampel. Hasil lengkap di `struktur.txt`.
  - Catatan proses: butuh tiga ronde unduh ulang karena Mendeley membalas galat JSON saat
    pembatasan laju (751 → 365 → 66 berkas) sampai semua checksum bersih.
- **Keterbatasan / masalah kualitas**:
  1. **Klaim "8.814 gambar resolusi tinggi (1000×1000)" tidak benar.** Sensus penuh:
     - hanya **23,0%** (2.028) yang benar-benar 1000×1000;
     - **40,6%** (3.577) berukuran **256×256** — resolusi rendah, ciri gambar hasil unduhan web;
     - **41,4%** punya sisi < 512 px;
     - hanya 40,7% yang ≥1000×1000 di kedua sisi;
     - ada **1.968 ukuran berbeda** di seluruh dataset.
     Kelas paling parah: `Powdery Mildew` 92% berukuran 256×256, `Curl_Virus` 76%,
     `Nutrition Deficiency` 72%.
  2. **`Cercospora_Leaf_Spot` hampir pasti hasil pengumpulan campuran**: 1.898 gambar dengan
     **1.525 ukuran berbeda** (hampir setiap gambar beda ukuran) — pola khas hasil scraping,
     bukan satu sesi pemotretan lapangan.
  3. **Campuran PNG dan JPG dalam satu kelas** (mis. Bacterial_Spot 1.354 PNG + 275 JPG)
     menguatkan dugaan gabungan beberapa sumber dengan pipeline berbeda.
  4. **Tidak ada anotasi, metadata per gambar, atau pembagian latih/uji.** Tidak ada informasi
     tanggal, lokasi presisi, perangkat, atau siapa yang memvalidasi label.
  5. `Nutrition Deficiency` bukan penyakit menular — mencampurnya sebagai kelas "penyakit"
     membuat keluaran model tidak langsung bisa dipetakan ke tindakan pengendalian.
  6. **Tidak ada kelas antraknosa**, padahal itu penyakit cabai terpenting di Indonesia.
     Untuk itu pakai `CAB-04-chili-4-kelas-dhaka` (347 gambar antraknosa).
  7. Bukan data Indonesia: Ashulia, Narsingdi, Cumilla, Feni, Noakhali, dan Laksham (Bangladesh).
  8. **10,0% duplikat byte-identik** (881 dari 8.817 berkas). Terparah `Bacterial_Spot` 21%
     dan `Cercospora_Leaf_Spot` 11%. Angka efektifnya **7.936**, bukan 8.814.
  9. **Kelas `Cercospora_Leaf_Spot` 90,5% menyalin CAB-08.** Dari 1.683 citra uniknya,
     **1.523 byte-identik** dengan `CAB-08-cercospora-sergipe-zenodo` — dataset Brasil
     (Universidade Federal de Sergipe) yang terbit di Zenodo 2024-08-08, **15 bulan sebelum**
     dataset ini. Nama berkasnya diganti (`NNNN__roi_backremoved.jpg` →
     `Cercospora Leaf Spot_NNN.jpg`) sehingga jejak asalnya hilang, dan keduanya sama-sama
     membawa 215 salinan internal berlebih. **Akibatnya**: keterangan lokasi Bangladesh tidak
     berlaku untuk kelas Cercospora, dan CAB-03 **tidak boleh digabung dengan CAB-08** dalam
     satu himpunan latih.

## Nilai lebih

Ini dataset cabai dengan **cakupan kelas terluas** yang berhasil diunduh (6 kelas), dan
satu-satunya bersama CAB-11 yang memuat **embun tepung** (*Leveillula taurica*). Kelas
`Bacterial_Spot`-nya juga jauh lebih besar (1.629) daripada sumber lain mana pun.
Namun karena masalah resolusi di atas, kelas `Powdery Mildew`, `Curl_Virus`, dan
`Nutrition Deficiency` sebaiknya **disaring dulu berdasarkan ukuran** sebelum dipakai melatih
model — gambar 256×256 tidak cukup untuk mengenali gejala halus embun tepung.
