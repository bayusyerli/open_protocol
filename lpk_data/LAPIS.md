# Lapis direktori LPK terakreditasi KAN

Disusun ulang oleh `susun.mjs` dari tiga panen: `tarik-looker.mjs` (daftar resmi
lengkap), `tarik-kan.mjs` dan `tarik-lingkup.mjs` (aplikasi layanan, lingkup terurai).
Satu panen, dua kebutuhan: **no. 8** — ke mana sampel tanah dan uji residu dikirim — dan
**no. 7**, lembaga sertifikasi yang menentukan panen ditolak atau tidak. Pemisahan
cakupannya di sini, bukan di sumbernya.

## 1. `lpk-kan.ndjson` / `.csv` — seluruh LPK di aplikasi layanan
367 lembaga dari 465 baris mentah (98 baris kembar dibuang), 34 skema akreditasi.

- LP Laboratorium Penguji: **174**
- LK Laboratorium Kalibrasi: **57**
- LM Laboratorium Medik: **23**
- LSPr Lembaga Sertifikasi Produk, Proses, Jasa: **23**
- LI Lembaga Inspeksi: **22**
- LSP Lembaga Sertifikasi Person: **11**
- PUP Penyelenggara Uji Profisiensi: **11**
- LSSM_old old_Lembaga Sertifikasi Sistem Manajemen Mutu: **10**
- LVV Lembaga Validasi dan Verifikasi: **6**
- LSBU Lembaga Sertifikasi Badan Usaha (LSBU) Sektor Jasa Konstruksi: **4**
- LSSMAP old_Lembaga Sertifikasi Sistem Manajemen Anti Penyuapan: **4**
- LSSML old_Lembaga Sertifikasi Sistem Manajemen Lingkungan: **4**
- LSUHK Lembaga Sertifikasi Penyelenggara Umrah dan Haji Khusus: **4**
- LSISPO Lembaga Sertifikasi Indonesia Sustainable Palm Oil: **3**
- LSSMKP old_Lembaga Sertifikasi Sistem Manajemen Keamanan Pangan: **3**
- LPVI Lembaga Penilai dan Verifikasi Independen: **2**
- PBA Produsen Bahan Acuan: **2**
- LSSHACCP Lembaga Sertifikasi Sistem Hazard Analysis and Critical Control Point: **1**
- LSSMBL old_Lembaga Sertifikasi Sistem Manajemen Biorisiko Laboratorium: **1**
- LSSMKI old_Lembaga Sertifikasi Sistem Manajemen Keamanan Informasi: **1**
- LSSMOP old_Lembaga Sertifikasi Sistem Manajemen Organisasi Pendidikan: **1**

Provinsi dibaca dari teks alamat — lebih dulu nama provinsinya, lalu nama kabupaten/kota
dari panen SIMLUHTAN di `penyuluh_data/`, karena alamat laboratorium hampir selalu
menyebut kota tetapi jarang menyebut provinsi. 110 catatan tetap kosong, tidak ditebak.

## 2. `lab-uji-tani.ndjson` / `.csv` — laboratorium yang menyentuh usaha tani
**889** dari **1.671** laboratorium penguji berakreditasi aktif di papan resmi KAN.
Sisanya — kelistrikan, bahan bakar, konstruksi, tekstil — tidak menyentuh pertanyaan siapa pun di sini.

| Bisa menguji | Laboratorium |
|---|---|
| Air | 653 |
| Tanah | 242 |
| Produk pangan | 198 |
| Pupuk | 100 |
| Jaringan tanaman / benih | 93 |
| **Residu pestisida** | **17** |

Masa berlaku akreditasi ikut di tiap baris — medan yang tidak ada di aplikasi layanan.
Seluruh baris tanggalnya terbaca.

101 dari 889 laboratorium juga ada di aplikasi layanan, dan hanya untuk
mereka tersedia lingkup terurai per parameter (`kode_k01`, `baris_lingkup`,
`lingkup_per`) di 19.367 baris `raw/lingkup/`.

## Yang belum bisa dijawab berkas ini

- **Dua sumber, dua kelengkapan.** Papan Looker punya semua lembaga tetapi lingkupnya
  hanya satu paragraf ringkasan; aplikasi layanan menguraikan lingkup per parameter
  tetapi baru memuat 367 lembaga dari seluruh skema. Berkas ini memakai papan
  sebagai kerangka dan aplikasi layanan sebagai isian.
- **Endpoint aplikasi layanan memulangkan baris kembar** — satu lembaga bisa muncul
  sampai sebelas kali dengan isi identik. Dedup menurut `id` + skema.
- **Penanda dibaca dari teks, bukan dari kode.** Ringkasan lingkup papan tidak berkode;
  `uji_tanah` dan kawan-kawannya adalah hasil pembacaan kata, dan bisa meleset pada
  lembaga yang menulis ringkasannya dengan cara lain.
- **Nama bahan aktif tidak seragam.** Lingkup laboratorium ditulis dengan nama ISO
  (`glyphosate`, `mancozeb`), registri Kementan dengan nama Indonesia (`glifosat`,
  `mankozeb`). Penyilangan ke kosakata bahan aktif baru akan rapat setelah no. 5 berdiri.
- **Belum tersambung** ke `spec/vocab/`: ini masih berkas data, belum entitas.
