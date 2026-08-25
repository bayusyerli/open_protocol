# A dataset of Yellow Disease in Horticultural Plant

- **dataset_id**: CAB-01-penyakit-kuning-begomovirus-jabar
- **Tanaman**: **tiga tanaman** — cabai merah (*Capsicum annuum*), terung (*Solanum melongena*),
  kacang panjang (*Vigna unguiculata* ssp. *sesquipedalis*). Karena ≥3 tanaman, dataset ini
  ditaruh di `datasets/additional/` sesuai KETENTUAN bagian 3, meski cabai termasuk tanaman
  prioritas.
- **Penyakit/kelas tercakup**: 2 kelas — **Begomovirus positive** dan **Begomovirus negative**
  (penyakit kuning / virus kuning keriting daun). Label divalidasi dengan **uji PCR**, bukan
  penilaian visual semata. Di berkas anotasi kelas ditulis sebagai `0` dan `1`; sumber **tidak
  menyatakan** mana yang positif dan mana yang negatif.
- **Jenis data**: gambar + anotasi kotak pembatas (YOLO)
- **Format**: 5.095 JPG (640×640) + 5.095 TXT anotasi YOLO, berkas lepas (bukan arsip)
- **Jumlah**: diklaim 5.095 citra, **terhitung 5.095** citra + 5.095 berkas anotasi = 10.190 berkas.
  **Namun hanya 1.959 citra yang benar-benar berbeda** — 3.136 berkas (61,6%) adalah salinan
  bit-demi-bit. Lihat Keterbatasan butir 5.
  Total 5.861 kotak pembatas (kelas 0: 3.169 · kelas 1: 2.692).
- **Sumber**: Mendeley Data
- **URL sumber**: https://data.mendeley.com/datasets/9x9kf9vwph/1
- **DOI**: 10.17632/9x9kf9vwph.1
- **Pembuat**: Gefi Zulmiati Lannur
- **Tahun terbit / pembaruan**: 2024-10-30 (versi 1, satu-satunya versi)
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: sebut pencipta (Gefi Zulmiati Lannur), cantumkan DOI
  10.17632/9x9kf9vwph.1 dan tautan lisensi CC BY, serta tandai bila ada perubahan. Catatan
  lisensi Mendeley: izin tambahan mungkin diperlukan untuk konten di dalam dataset.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 223.636.867 byte (213,28 MiB) untuk 10.190 berkas
- **SHA-256**: lihat `SHA256SUMS.txt` (10.190 baris)
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**:
  - Manifes berkas + checksum diambil dari `https://data.mendeley.com/public-api/datasets/9x9kf9vwph`
    (medan `files[].content_details.sha256_hash` dan `size`).
  - **Seluruh 10.190 berkas** dihitung SHA-256-nya dengan `python3` + `hashlib` dan dicocokkan
    satu per satu dengan nilai yang diumumkan Mendeley → **0 ketidakcocokan, 0 berkas hilang**.
  - Dimensi citra diperiksa dengan membaca penanda SOF JPEG langsung dari byte (sampel acak 300):
    300/300 berukuran 640×640, sesuai klaim sumber.
  - Isi anotasi diurai dengan `python3` (cacah kotak, kelas, sebaran) — hasil di `struktur.txt`.
  - Catatan proses: ronde unduh pertama menghasilkan 1.780 berkas rusak karena Mendeley membalas
    galat JSON saat pembatasan laju; berkas tersebut diunduh ulang dua ronde hingga semua cocok.
- **Keterbatasan / masalah kualitas**:
  1. **Identitas tanaman hilang.** Deskripsi menyebut cabai merah, terung, dan kacang panjang,
     tetapi struktur berkas hanya punya dua folder (citra & anotasi) dan dua kelas
     (Begomovirus ±). **Tidak ada penanda apa pun** — folder, nama berkas, atau kolom metadata —
     yang membedakan cabai dari terung atau kacang panjang. Untuk pemakaian khusus cabai,
     bagian cabainya harus dipilah manual dengan melihat gambar.
  2. **Arah label tidak dinyatakan.** Kelas `0` dan `1` tidak dipetakan ke "positif"/"negatif"
     di dokumentasi mana pun. Harus dipastikan sendiri sebelum dipakai.
  3. **97% berkas bernama `Screenshot-YYYY-MM-DD-HHMMSS`** (4.961 dari 5.095), hanya 134 yang
     berpola stempel kamera. Metode yang ditulis sumber menyebut foto diambil dengan kamera
     ponsel 13 MP — nama tangkapan layar tidak konsisten dengan itu.
  4. **Tanggal tidak konsisten dengan klaim.** Deskripsi menyebut pengumpulan 22 Juli – 9 Agustus
     2023. Tanggal pada nama berkas justru: screenshot 12/20/23/24/25 Oktober 2023; berpola
     kamera 15 Jan, 21/27/30 Agu, 17/19 Sep, 10 Okt 2023. **Tidak satu pun** jatuh di dalam
     jendela yang diklaim.
  5. **61,6% berkasnya salinan bit-demi-bit, bukan varian.** SHA-256 seluruh 5.095 citra
     menghasilkan hanya **1.959 nilai unik** — angka yang sama persis dengan jumlah nama dasar
     unik. Jadi ketiga "varian" tiap nama dasar (1.568 nama dasar punya tepat 3 berkas) adalah
     **berkas yang sama persis**, cuma diberi sufiks Roboflow `.rf.<hash>` berbeda. Ini
     **membantah metode yang ditulis sumber** ("citra asli diperbanyak dengan teknik cropping"):
     tidak ada pemotongan yang terjadi. **Koreksi angka: dataset ini efektif berisi 1.959 citra
     berbeda, bukan 5.095.** Pembagian latih/uji secara acak akan menaruh salinan identik di
     kedua sisi dan melambungkan akurasi — pisahkan berdasarkan nama dasar (atau SHA-256),
     bukan per berkas.
  6. Anotasi sangat dangkal: 4.785 dari 5.095 berkas hanya berisi **satu** kotak yang praktis
     menutupi seluruh bingkai (mis. `0 0.508 0.502 0.925 0.941`) — lebih mirip label klasifikasi
     yang dibungkus format deteksi daripada anotasi lesi sungguhan.
  7. Nama folder asli tidak dapat diambil: `public-api` Mendeley tidak mengekspos nama folder,
     dan endpoint arsip massal (`/api/datasets/.../files/archive`) mengalihkan ke OAuth. Nama
     direktori di `raw/` karena itu memakai `folder_id` apa adanya, bukan nama karangan.

## Mengapa dataset ini tetap yang paling penting untuk Indonesia

Dari seluruh panen cabai, **hanya dataset ini yang datanya berasal dari lahan petani Indonesia**:
Kabupaten Bogor, Kota Bogor, dan Kabupaten Cianjur, Jawa Barat. Semua dataset cabai lain yang
ditemukan berasal dari Bangladesh, India, Brasil, atau Thailand.

Nilai lebihnya: labelnya **dikonfirmasi PCR**, bukan tebakan visual. Virus kuning keriting daun
(Begomovirus, ditularkan kutu kebul *Bemisia tabaci*) adalah salah satu ancaman terbesar cabai di
Jawa Barat, dan gejalanya mudah tertukar dengan kekurangan hara atau keracunan pestisida — jadi
label ber-PCR itu langka dan berharga.

Kekurangan terbesarnya justru bukan kualitas gambar, melainkan **hilangnya identitas tanaman**:
tanpa memilah ulang, model yang dilatih di sini belajar "daun kuning keriting" secara umum pada
tiga tanaman, bukan khusus cabai.
