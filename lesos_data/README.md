# Registri Klien Organik — LeSOS (Lembaga Sertifikasi Organik Seloliman)

Hasil pengambilan data publik dari **lesosindonesia.com**, situs LeSOS: badan sertifikasi
organik di Dusun Biting, Desa Seloliman, Kecamatan Trawas, Kabupaten Mojokerto, Jawa Timur.

- **Tanggal ambil:** 2026-08-24
- **Sifat data:** publik tanpa login; `robots.txt` mengizinkan seluruh jalan (`Disallow:` kosong)
- **Total operator:** 298 (297 di `/klien`, 1 di `/klien_soi`)
- **Keluaran:** `privat/` — **di-gitignore, tidak diterbitkan ulang** (lihat Lisensi)

## Kenapa registri ini ada di sini

LeSOS bukan produsen. Ia badan sertifikasi, dan tujuh skema sertifikasinya memuat dua yang
menyentuh Pranatani langsung: **skema 4 (Pupuk dan Pestisida Organik)** dan **skema 5 (Benih
Tanaman)**. Artinya registri ini memuat lapis atribut yang tidak ada di PUKPES sama sekali —
apakah klaim organik sebuah produsen input didukung sertifikat terakreditasi, sampai kapan
berlakunya, dan apakah pernah dicabut.

Dari contoh 26 operator pertama, tujuh memegang sertifikat input produksi (pupuk, agensi
hayati, biopestisida, benih). Pencocokan nama ternormalkan ke produsen PUKPES menghasilkan
**54 dari 298** operator — 29 cocokan kuat, 25 lemah karena nama generik seperti "Sumber
Rejeki" dan "Sari Tani" yang wajib diperiksa tangan sebelum dipakai.

## Kredensial penerbitnya

Rantai akreditasinya terbaca langsung di nomor sertifikat, jadi umur tiap rekaman bisa
disimpulkan dari nomornya sendiri:

| Sejak | Register | Muncul di nomor sebagai |
|---|---|---|
| Nov 2007 | OKPO-LS-005 (verifikasi Otoritas Kompeten Pangan Organik) | — |
| 2009 | Akreditasi KAN `LSPO-005-IDN` | `…-LSPO-005-IDN-…` |
| 2016 | Re-akreditasi ke-2 `LSO-005-IDN` | `…-LSO-005-IDN-…` |
| 24 Agu 2022 | Penggabungan skema SNI ISO/IEC 17065:2012 → `LSPr-092-IDN` | `…-LSPr-092-IDN-…`, lalu `…-LeSOS-LSPr-092-IDN-…` |

Angka di depan nomor adalah nomor urut operator dan **tetap** lintas perpanjangan; yang
berubah cuma sufiks registernya. Nomor urut itulah kunci yang stabil, bukan nomor utuhnya.

## Bentuk data

`privat/klien-indeks.json` — satu baris per operator: nama, alamat, id, slug, URL foto.
`privat/klien.json` dan `privat/klien.ndjson` — indeks di atas plus riwayat sertifikat.

Tiap baris sertifikat memuat nomor, ruang lingkup, tanggal terbit/berakhir/pengesahan, dan
dua medan status yang **tidak boleh dipertukarkan**:

- `status_situs` — apa adanya dari situs. Beku pada saat keputusan pengawasan dibuat.
- `berlaku_pada_tarikan` — dihitung ulang dari `berakhir` terhadap tanggal tarikan.

Pembedaan itu bukan kerapian, melainkan syarat kebenaran: **8 dari 25 baris bertulis "Aktif"
di contoh sudah lewat tanggal berakhirnya.** Membaca `status_situs` sebagai keberlakuan hari
ini akan menayangkan sertifikat kedaluwarsa sebagai sah. Enam baris lain berstatus `dicabut`,
dan itu keluaran yang paling berbahaya kalau salah baca.

Satu nomor sertifikat muncul berkali-kali karena tiap keputusan pengawasan tahunan
dicatat sebagai baris sendiri — 103 baris di contoh hanya mewakili 69 nomor unik.
Pengelompokan dilakukan di hilir supaya jejak tiap pengawasan tidak hilang.

## Data pribadi — dibuang sebelum menyentuh disk

Tiap halaman rinci di situs aslinya memuat nama seorang narahubung beserta nomor HP
pribadinya; 25 nomor unik dalam 26 halaman contoh, jadi kira-kira ~290 kalau utuh.

`spec/schema/principal.schema.json` sudah memutuskan perkara ini untuk seluruh proyek:
perorangan tidak masuk, karena halaman profil untuk orang bernama adalah pengumpulan data
pribadi tanpa dasar pemrosesan di sini. Maka `bersihkanPII()` membuang blok itu **sebelum**
HTML disinggahkan, bukan menyaringnya di hilir. Singgahan di `privat/singgahan/` tidak pernah
memuat satu pun nama atau nomor. Skrip melaporkan cacah blok yang dibuang di akhir jalan.

## Dari tarikan ke halaman

```
privat/klien.json  ->  susun-sertifikasi.mjs  ->  spec/vocab/sertifikasi/sertifikasi-organik.ndjson
                                              \->  privat/sertifikasi-calon.ndjson  (antrean tinjauan)
```

`susun-sertifikasi.mjs` menjodohkan operator LeSOS dengan badan di
`spec/vocab/principal/`, lalu memecah hasilnya jadi dua. Yang **kuat** naik ke kosakata dan
dibaca `spec/tools/bangun-halaman.mjs`; yang meragukan ditahan di berkas calon sampai ada
yang memutuskannya.

Gerbang itu bukan kehati-hatian berlebih. `terbit/badan/` memuat `bumi-subur-khatulistiwa`,
`bumi-subur-rizquna`, `bumi-subur-utama`, dan `trans-bumi-subur-sejahtera` — empat badan
berlainan yang namanya beririsan dengan PT. Bumi Subur Sentosa, dan `pt-polowijo-graha-niaga`
berdiri di samping `pt-polowijo-gosari`. Pencocokan nama yang jalan saat build akan, cepat
atau lambat, menempelkan sertifikat organik ke badan yang salah. Itu bukan medan kosong; itu
tuduhan.

Syarat "kuat": nama ternormalkan sama persis dengan salah satu `registry_names`, hanya satu
badan yang cocok, dan namanya bukan sekadar dua kata pasaran. Daftar kata pasaran
**diturunkan dari data** — token yang muncul di lebih dari 1% nama badan di registri — bukan
didaftar tangan, supaya isinya mencerminkan registrinya dan bukan tebakan penulisnya.

Per 25 Agustus 2026: **46 naik** (31 berlaku, 12 kedaluwarsa, 3 dicabut), **28 ditahan** —
25 karena badannya memang tidak ada di registri Kementan, 2 karena namanya dua kata pasaran,
1 karena dua badan berbagi nama yang sama.

## Lisensi

Situsnya tidak menyatakan lisensi apa pun, hanya "© Lembaga Sertifikasi Organik Seloliman".
Nomor sertifikat, tanggal, dan ruang lingkup adalah fakta dan tidak berhak cipta; kompilasi
dan fotonya lain soal. Karena itu keluarannya **benih privat** — dipakai menghitung dan
mencocokkan ke PUKPES, tidak diterbitkan ulang. Pola yang sama dengan `harga_data/privat/`
dan `toko_data/privat/`. URL foto disimpan, berkas fotonya tidak diunduh.

## Menarik ulang

```
node lesos_data/tarik-lesos.mjs [direktori-keluaran]
```

Servernya membatasi diri di sekitar satu permintaan tiap 15–30 detik dan menjawab `429`
kalau dilanggar. Skrip berjalan satu utas dengan jeda menyesuaikan diri, jadi satu tarikan
penuh 298 halaman memakan **~2 jam**. Tidak ada sitemap dan tidak ada endpoint JSON — situsnya
murni render-server PHP, jadi tidak ada jalan pintas borongan. Singgahan membuat tarikan bisa
dilanjutkan kalau putus; hapus `privat/singgahan/` untuk memaksa tarikan segar.

Karena mahalnya penyegaran dan karena sertifikat kedaluwarsa terus-menerus, jangan
memperlakukan keluaran ini sebagai keadaan hari ini. Ia potret bertanggal.
