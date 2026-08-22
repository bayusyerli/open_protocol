# Data Varietas Terdaftar — Registri Perizinan Varietas (Kementerian Pertanian RI)

Padanan sisi benih dari `pukpes_data/`. Registri PUKPES tidak memuat benih sama
sekali; registri inilah yang memberi "nomor pendaftaran" untuk lapis benih,
sehingga aturan netralitas vendor (produk hanya menempel lewat nomor resmi)
tetap terpenuhi.

- **Tanggal ambil:** 2026-08-19
- **Sifat data:** publik, tanpa login, tanpa bypass apa pun
- **Total record:** 11.235 varietas → 11.617 baris perizinan

## Sumber & endpoint

| File | Endpoint | Record |
|------|----------|-------:|
| `raw/nama-varietas.json` | `GET https://perizinan.pertanian.go.id/permohonan/v1/informasi/nama-varietas` | 11.235 |
| `varietas_terdaftar.csv` | turunan — satu baris per (varietas × jenis perizinan) | 11.617 |
| `pemohon_varietas.csv` | turunan — agregasi per pemohon | 1.258 |

Endpoint mengabaikan parameter paginasi dan mengembalikan seluruh isi registri
dalam satu panggilan. Portal yang memakainya: SIPERINTIS
(`perizinan.pertanian.go.id/app/informasi/nama-varietas`).

## Cakupan

13 kelompok komoditas (Tanaman Pangan, Sayuran, Buah, Perkebunan, Flori,
Biofarmaka, Obat, Kehutanan, Pakan Ternak, Hortikultura, Sumber Daya Genetik),
tahun 1945–2026. Jenis perizinan terbanyak: Pelepasan Varietas Tanaman (5.801),
Pendaftaran Varietas Tanaman (4.919), Perlindungan Varietas Tanaman (580).

Nomor SK terisi pada 11.504 dari 11.617 baris.

## Sebaran pemohon

| Jenis badan | Jumlah |
|---|---:|
| Pemerintah (balai, dinas, pemda) | 683 |
| Perorangan / lainnya | 326 |
| PT | 238 |
| CV | 64 |
| Perguruan tinggi | 29 |
| Lembaga riset | 20 |
| UD | 9 |
| Koperasi | 1 |

**Yang berbadan usaha — 312 baris, sekitar 268 entitas setelah normalisasi ejaan
— itulah principal benih sebenarnya.** Sisanya lembaga publik dan pemulia
perorangan, yang penting untuk asal-usul varietas tapi bukan principal.

## Penyeragaman nama pemohon

Ejaan pemohon di registri tidak konsisten. Sudah diseragamkan pada 19 Agustus
2026: **1.370 → 1.259 pemohon** (111 varian ejaan digabung), 277 di antaranya
berbadan usaha. Pada 20 Agustus 2026 satu singkatan ikut digabung setelah
identitasnya terbukti, jadi **1.258**.

Kolom `pemohon` di `varietas_terdaftar.csv` tetap berisi **ejaan asli apa adanya
dari registri**; hasil penyeragaman ada di kolom `pemohon_kanonik`. Seluruh
pemetaannya tercatat di `pemohon_alias.csv` — 205 baris, dengan kolom `dasar`
yang menyebut alasan tiap penggabungan dan kolom `bukti` untuk penggabungan yang
menuntutnya:

| Dasar | Baris | Contoh |
|---|---:|---|
| `kanonik` | 93 | bentuk yang dipilih jadi acuan |
| `ejaan/kapitalisasi/spasi` | 94 | `EAST WEST SEED INDONESIA` → `PT East West Seed Indonesia` |
| `tanda-baca` | 12 | `PT BISI International Tbk.` → `PT BISI International, Tbk` |
| `beda-bentuk-badan` | 5 | `CV Aditya Sentana Agro` ↔ `PT Aditya Sentana Agro` |
| `singkatan` | 1 | `PT BCA` → `PT Benih Citra Asia` — wajib berbukti, lihat di bawah |

**Lima baris bertanda `perlu_tinjau=ya`** berbeda bentuk badan hukumnya (CV vs PT
vs UD) dengan nama yang sama. Digabung karena hampir pasti kesalahan entri, tapi
ditandai supaya bisa dipisah lagi kalau ternyata dua badan hukum berbeda.

### Singkatan

Singkatan tidak digabung atas dasar dugaan. Ia hanya digabung kalau identitasnya
bisa **dibuktikan**, dan buktinya ditulis di kolom `bukti` berkas alias.

| Singkatan | Varietas | Status |
|---|---:|---|
| `PT BCA` | 78 | **digabung** ke `PT Benih Citra Asia`, 20 Agustus 2026 — buktinya di bawah |
| `PT BISI` | 45 | tetap terpisah — PT BISI International **atau** PT Benih Inti Subur Intani, dua kandidat sama-sama masuk akal |
| `PT SHS` | 4 | tetap terpisah — dugaan PT Sang Hyang Seri, komoditas cocok, tetapi belum ada bukti |

**Bukti untuk `PT BCA`.** Nama varietasnya memakai kode dua huruf, dan **12 dari 13
kode itu menunjuk tanaman yang sama** dengan yang dipakai `PT Benih Citra Asia` —
termasuk kode yang ganjil dan tidak akan cocok karena kebetulan: `SL` untuk tomat,
`MC` dan `PA` sama-sama untuk paria, `VA` untuk kacang panjang. Hanya `BA` (bayam,
satu varietas) yang tidak muncul di sisi satunya. Portofolio komoditasnya juga sama
— 16 jenis beririsan, sembilan sisanya cuma beda ejaan (`Cabe Keriting` lawan
`Cabai Keriting`, `Selada` lawan `Slada`). Tahunnya 2010–2012 dan tidak beririsan
dengan baris `PT Benih Citra Asia` yang lain. Terakhir, mentimun bernama `Semi` di
baris `PT BCA` cocok dengan **Semi F1**, produk yang sampai hari ini dijual PT Benih
Citra Asia — diperiksa ke registri Direktorat Perbenihan Hortikultura pada 20
Agustus 2026. Rinciannya di `spec/03-keputusan-desain.md` D40.

Membalik penggabungan cukup dengan menghapus barisnya di `pemohon_alias.csv` lalu
menjalankan `python3 proseed_data/terapkan_alias.py --tulis`.

## Membangkitkan ulang kolom turunan

`terapkan_alias.py` menerapkan `pemohon_alias.csv` ke `pemohon_kanonik` di
`varietas_terdaftar.csv` dan ke baris yang terkena di `pemohon_varietas.csv`. Kolom
`pemohon` tidak pernah disentuh. Dijalankan tanpa perubahan alias, ia menghasilkan
berkas yang sama persis — itu yang membuatnya bisa dipercaya.

Ia sengaja **tidak** membangun ulang seluruh `pemohon_varietas.csv`, karena itu akan
ikut mengubah 1.006 baris akibat tiga kebiasaan pembuat aslinya yang maksudnya tidak
bisa dipastikan: `tahun_pertama` mengabaikan tahun bernilai `-`; BRIN digolongkan
`perorangan/lainnya`, bukan `Lembaga riset`; dan kolom `varietas` di berkas alias
tidak selalu sama dengan cacah baris `pemohon` yang sepadan. Ketiganya dicatat di
sini, tidak diperbaiki diam-diam.

## Peringatan lain yang harus dipegang
- **`kode` kosong di seluruh 11.235 record**; `pemohon` kosong pada 1.042 record
  (sebagian besar era pelepasan lama yang pengusulnya tidak tercatat).
- Registri ini mencatat **perizinan varietas**, bukan produk yang beredar. Satu
  varietas terdaftar tidak berarti benihnya masih dijual hari ini.

## Sumber sekunder yang tidak dipakai sebagai tulang punggung

`perbenihanhorti.id/proseed/db-vardaf` (PROSEED, Direktorat Perbenihan
Hortikultura) memuat 3.503 varietas hortikultura beserta deskripsi dan foto
penciri. Cakupannya lebih sempit dari endpoint di atas tetapi deskripsinya lebih
kaya — berguna nanti untuk lapis konten, bukan untuk daftar principal.
