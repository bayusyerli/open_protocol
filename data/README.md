# `data/` — lapis benih & pengaya principal

Dua berkas ini berasal dari riset web (5 agen + 9 sub-agen, 19 Agustus 2026),
**bukan** dari registri resmi. Keduanya melengkapi `pukpes_data/`, tidak
menggantikannya.

Pembagian perannya sudah diputuskan: **registri DB PUKPES adalah tulang punggung
untuk pupuk, pestisida, dan herbisida.** Berkas di sini hanya mengisi dua celah
yang registri itu tidak punya.

## `principals-benih.csv` — 102 principal benih

**Tulang punggung sisi benih sekarang ada di `proseed_data/`** (registri perizinan
varietas Kementan, 11.235 varietas, 268 pemohon berbadan usaha). Berkas ini jadi
lapis pengaya untuk benih, bukan sumber utama — perannya sama seperti
`pengaya-principal.csv` terhadap `pukpes_data/`.

Kolom `nama_di_registri_varietas` dan `jumlah_varietas_registri` menyambungkannya
ke registri itu. **58 dari 102 punya varietas terdaftar; 44 tidak punya sama
sekali** — dan itu justru temuan yang berguna: mereka pedagang, licensee varietas
publik, importir, atau sudah dorman. Sumber utama: PROSEED / registri varietas Kementan, daftar
anggota Asbenindo dan IPBH, situs perusahaan, dan pers dagang.

⚠️ **Keanggotaan asosiasi bukan bukti perusahaan beroperasi.** Dari ~30 anggota
lapis-ekor Asbenindo yang diperiksa mendalam, hanya sekitar 6 terverifikasi
sebagai principal benih aktif; sisanya perusahaan kehutanan, logistik, pengolah
pangan, dan importir bawang yang terdaftar karena kewajiban tanam RIPH. Pakai
kolom `status_aktivitas`, jangan anggap semua baris aktif.

## `pengaya-principal.csv` — 101 baris

Kolom yang registri tidak simpan: grup induk, negara asal, merek payung, situs
resmi, dan status aktivitas. Digabungkan ke registri lewat kolom
`nama_di_registri`, yang berisi nama pemegang pendaftaran **persis seperti
tertulis di PUKPES**.

Dari 228 principal hasil riset, 101 cocok dengan pemegang pendaftaran di
registri. Sisanya tidak cocok karena memang principal benih, atau tidak punya
entitas Indonesia, atau sudah bubar.

## Batas yang harus dipegang

- `sumber_jenis` di kedua berkas bernilai `laporan-agen-riset` — **bukan sumber
  primer.** Setiap baris yang akan dipublikasikan perlu diverifikasi ulang ke
  sumber aslinya.
- Klaim kepemilikan merek berubah seiring waktu. Registri 2014 mencatat Ally di
  DuPont dan Roundup di Monagro Kimia; hari ini Ally di FMC dan Roundup
  dipasarkan Nufarm. Jangan pakai baris apa pun tanpa memperhatikan tanggal.
- Riset ini pernah menyimpulkan registri pupuk/pestisida terkunci login. **Itu
  keliru** — endpoint JSON DB PUKPES publik. Untuk pupuk dan pestisida, percayai
  `pukpes_data/`, bukan berkas di sini.

## Koreksi entitas yang ditemukan riset ini

| Entitas | Koreksi |
|---|---|
| PT Pertani (Persero) | Bubar tanpa likuidasi, PP 98/2021; melebur ke Sang Hyang Seri |
| PT Tanindo Subur Prima | Dilikuidasi 2022; merek Cap Kapal Terbang kini di BISI |
| PT Advansia Benih Indonesia | Berinduk Malaysia — **bukan** Advanta/UPL India |
| PT Winon International | Ejaan Asbenindo salah; yang benar PT Winon Intercontinental |
| PT Dinasty Inti Agrosamara | Ejaan salah; yang benar PT Dinasty Inti Agrosarana |
| Pop Vriend Seeds | Kini KWS Vegetables sejak 1 Oktober 2024 |
| PT Dalzon Chemicals | Kini PT Fajar Nasional Cipta |
| PT Sumber Agro Semesta | Beralih usaha ke beras organik & ternak; bukan lagi principal benih |
