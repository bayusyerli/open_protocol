# Lapis kelembagaan & ketenagaan penyuluhan

Disusun ulang oleh `susun.mjs` dari `tarik-simluhtan.mjs` + `tarik-ketenagaan.mjs`.
Sumbernya laporan tamu SIMLUHTAN — halaman `/guestreport` yang tidak meminta login,
sementara aplikasi utamanya menutup semuanya di balik kata sandi. Karya pemerintah,
sinkronisasi harian dari basis data SIMLUHTAN.

## 1. `bpp-kecamatan.ndjson` / `.csv` — satu baris per kecamatan
**7.276** kecamatan di 34 provinsi dan 514 kabupaten/kota,
6.883 di antaranya menyebut **nama BPP** yang membinanya — 5.655 nama BPP
berbeda setelah penyeragaman ejaan; 393 kecamatan punya catatan penyuluh tetapi belum
punya BPP terdaftar.

- Poktan terbina: **752.676**
- Cacahan penyuluh terisi pada 7.217 dari 7.276 kecamatan
- Penyuluh PNS 21.791 · P3K 13.935 · THL 9.697 · swadaya 30.515 · swasta 118
- **590 kecamatan punya BPP tetapi nol penyuluh** — ada gedungnya, tidak ada orangnya

Nama asli BPP tidak pernah ditimpa; `bpp_kanonik` adalah kolom terpisah yang membuang
awalan "BPP"/"BP3K" dan merapikan kapitalisasi.

## 2. `dinas-wilayah.ndjson` / `.csv` — dinas yang menaungi
548 baris: 34 dinas provinsi dan 514 dinas kabupaten/kota.
Tiap baris membawa cacahan BPP dan penyuluh di wilayahnya — inilah alamat yang dituju
ketika pertanyaannya tidak lagi bisa dijawab berkas.

## Yang tidak ada di dalamnya, dan tidak dicari

- **Tidak ada nama, NIP, atau nomor telepon penyuluh.** Laporan tamu hanya memberi
  cacahan, dan memang hanya itu yang diambil: halaman bernama tentang orang adalah
  pemrosesan data pribadi yang tidak punya dasar di sini.
- **Tidak ada alamat atau koordinat BPP.** Yang ada hanya namanya dan kecamatan yang
  dibinanya. Menggeokode massal akan bertabrakan dengan rancangan "klaim" yang sama
  seperti pada toko tani.
- **34 provinsi, bukan 38.** Pemekaran Papua belum masuk ke basis data sumbernya.
- **Update SIMLUHTAN sedang ditutup** untuk pemeliharaan sistem sampai 30 Agustus 2026
  menurut pengumuman di halaman depannya; angka di sini adalah potret sebelum itu.
- **Belum tersambung** ke `spec/vocab/`: masih berkas data, belum entitas.
