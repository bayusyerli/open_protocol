# Buku Direktorat Perlindungan Hortikultura — OPT & daftar pestisida terdaftar (Kementan)

- **dataset_id**: BWM-04-ditjenhorti-opt-pestisida
- **Tanaman**: bawang merah, cabai merah, kentang, kubis (4 komoditas → disimpan di `additional/`)
- **Penyakit/kelas tercakup**: bukan kelas gambar — ini basis pengetahuan OPT. Yang disebut di dalamnya:
  - **Bawang merah**: ulat bawang *Spodoptera exigua*, *Liriomyza* sp., bercak ungu/**trotol** *Alternaria porri*, *Peronospora destructor* (embun bulu), *Colletotrichum gloeosporioides* (antraknosa), *Fusarium* sp. (moler/layu)
  - **Cabai**: antraknosa *Colletotrichum*, layu *Fusarium*, trips, tungau, lalat buah, virus kuning
  - **Kentang & kubis**: *Alternaria* (bercak kering), *Fusarium*, *Liriomyza*, *Phytophthora*, ulat krop
- **Jenis data**: teks
- **Format**: PDF (3 berkas, PDF 1.5, tidak terenkripsi)
- **Jumlah**: 3 dokumen, **133 halaman total** (26 + 58 + 49)
- **Sumber**: Direktorat Jenderal Hortikultura, Kementerian Pertanian RI — rak "Buku DITLIN" (Direktorat Perlindungan Hortikultura). Dua di antaranya disusun oleh peneliti **Balitsa Lembang** (Tonny K. Moekasan, Laksminiwati Prabaningrum); satu oleh **BPTP Jambi** (Araz Meilin).
- **URL sumber**: https://hortikultura.pertanian.go.id/buku-direktorat-perlindungan/
  - `M-61-…Bawa_watermark.pdf` → https://hortikultura.pertanian.go.id/wp-content/uploads/2024/11/M-61-Daftar-Pestisida-yang-Terdaftar-dan-Diijinkan-pada-Tanaman-Bawa_watermark.pdf
  - `14bookcabe_watermark.pdf` → https://hortikultura.pertanian.go.id/wp-content/uploads/2024/11/14bookcabe_watermark.pdf
  - `M-62-…Kubis-dan-Kenta_watermark.pdf` → https://hortikultura.pertanian.go.id/wp-content/uploads/2024/11/M-62-Daftar-Pestisida-yang-Terdaftar-dan-Diijinkan-pada-Tanaman-Kubis-dan-Kenta_watermark.pdf
- **DOI**: tidak ada
- **Pembuat**:
  - *Daftar Pestisida … Bawang Merah dan Cabai Merah* — Tonny K. Moekasan (Balitsa)
  - *Daftar Pestisida … Kubis dan Kentang* — Tonny K. Moekasan & Laksminiwati Prabaningrum (Balitsa)
  - *Hama dan Penyakit pada Tanaman Cabai serta Pengendaliannya* — Araz Meilin (BPTP Jambi)
- **Tahun terbit / pembaruan**: isi dibuat 2012 (dua buku pestisida, dari metadata `CreationDate` D:2012-11-02) dan 2014 (buku cabai); **diunggah ulang ke situs Ditjen Hortikultura November 2024**
- **Lisensi**: **tidak dinyatakan**. Dokumen resmi pemerintah RI yang diterbitkan terbuka tanpa pernyataan lisensi eksplisit. UU 28/2014 Pasal 42 mengecualikan hasil rapat terbuka & peraturan perundang-undangan dari hak cipta, tetapi **buku petunjuk teknis tidak otomatis termasuk** — jadi penerbitan ulang isi utuhnya berisiko. Pengutipan dengan atribusi aman.
- **Ketentuan atribusi**: sebut penyusun + "Direktorat Jenderal Hortikultura, Kementerian Pertanian RI" + URL.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 9,1 MB total (3.861.559 + 1.939.267 + 3.780.034 byte)
- **SHA-256**: lihat `SHA256SUMS.txt`
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**: keluaran lengkap di `struktur.txt`. Perintah persis:
  - `file raw/*.pdf` → ketiganya `PDF document, version 1.5` (tipe cocok dengan nama, bukan HTML tersamar)
  - `python3` + `pypdf 6.16.1` `PdfReader`: cacah halaman 26 / 58 / 49; `is_encrypted = False` untuk ketiganya (tidak ada arsip berpassword)
  - Ekstraksi teks penuh lalu cacah sebutan komoditas & patogen — mis. `M-61` memuat "bawang merah" 6×, "trotol" 2×, "bercak ungu" 2×, "spodoptera" 4×, "colletotrichum" 4×, "peronospora" 2× → isi cocok dengan judulnya
  - Regex pemindai data pribadi: `(?:\+62|08)\d{8,12}` → **0 nomor HP** di ketiga berkas; email → hanya 2 alamat **institusi** (`bptp-jambi@litbang.deptan.go.id`, `bptp_jambi@yahoo.com`), bukan data pribadi perorangan
  - `shasum -a 256 raw/*` → `SHA256SUMS.txt`
- **Keterbatasan / masalah kualitas**:
  1. **Isi kadaluwarsa 12–14 tahun.** Dua buku daftar pestisida dibuat 2012. Pendaftaran pestisida di Indonesia berubah tiap tahun (Permentan tentang Pestisida Terdaftar terbit berkala) — **daftar bahan aktif dan merek di sini tidak boleh dipakai sebagai rujukan izin edar yang berlaku sekarang**. Untuk Pranatani, sumber izin edar yang sahih tetap registri PUKPES, bukan buku ini. Nilai buku ini ada pada **pemetaan OPT → golongan cara kerja (kode IRAC/FRAC)**, yang jauh lebih stabil.
  2. **Tabel utamanya kemungkinan besar berupa gambar, bukan teks.** Rasio ekstraksi hanya ~540–905 karakter/halaman padahal isinya tabel padat; kedua buku pestisida berasal dari PowerPoint (`/Title = "Slide 1"`). Artinya **tabel pestisida tidak bisa diurai otomatis tanpa OCR**. Yang terekstrak sekarang sebagian besar kata pengantar dan judul.
  3. **Berwatermark.** Nama berkas `_watermark` menandakan Ditjen Hortikultura menempelkan watermark pada salinan publik — versi bersih (`14bookcabe.pdf`) mengembalikan **HTTP 404**. Watermark akan ikut terbawa pada OCR maupun cuplikan gambar.
  4. **Cakupan tanaman tidak lengkap untuk kebutuhan kita.** **Tomat tidak punya buku sendiri** di rak ini; tomat hanya disebut sambil lalu (2–4×). Kubis ikut terbawa walau bukan komoditas prioritas.
  5. **Bukan data tabular.** Ini basis pengetahuan naratif, bukan bahan analisis epidemiologi. Tidak ada angka luas serangan, tidak ada dimensi provinsi/tahun.
  6. **Lisensi tidak dinyatakan** — lihat di atas. Jangan republikasi utuh.
  7. **Tidak ada data pribadi** (0 nomor HP; hanya email institusi). Aman disimpan apa adanya.

## Catatan lintas-agen

- Buku **"Hama dan Penyakit pada Tanaman Cabai serta Pengendaliannya"** (26 hal., BPTP Jambi 2014) relevan langsung untuk **agen cabai**; **"Daftar Pestisida … Kubis dan Kentang"** relevan untuk **agen kentang**. Berkasnya sudah ada di sini — rujuk `datasets/additional/BWM-04-ditjenhorti-opt-pestisida/raw/`, jangan unduh ulang.
- Rak yang sama juga memuat *Petunjuk Teknis Pengendalian OPT Kubis* (2024) dan *Mencegah Ancaman Penyakit Sistemik Jeruk* (2024) — di luar 4 komoditas prioritas, tidak diambil.
