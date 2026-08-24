# Data Pupuk & Pestisida Terdaftar — DB PUKPES (Kementerian Pertanian RI)

Hasil pengambilan data publik dari **DATABASE PUPUK PESTISIDA** Kementan
(portal: `https://ap-simpel.pertanian.go.id`), Pusat Perlindungan Varietas
Tanaman dan Perizinan Pertanian (PVTPP).

- **Tanggal ambil:** 2026-08-19
- **Sifat data:** publik (disediakan portal untuk informasi umum; tanpa login)
- **Total record:** 14.920

## Sumber & endpoint
| File | Sumber di portal | Endpoint | Record |
|------|------------------|----------|-------:|
| `pupuk_terdaftar.csv` | Pupuk Terdaftar (integrasi SIMPEL, terkini) | `POST /pupuk/json_pupuk_publik_simpel` | 5.875 |
| `pupuk_terdaftar_legacy.csv` | Pupuk Terdaftar (basis lama SIMPUK 2020) | `POST /pupuk/json_pupuk_publik_new` | 1.321 |
| `pestisida_terdaftar.csv` | Pestisida Terdaftar | `POST /Datatables_filtering/pestisida_terdaftar` | 7.724 |
| `produsen_pupuk.csv` | turunan (agregasi pemegang pendaftaran pupuk, 2 sumber) | — | 1.832 |
| `produsen_pestisida.csv` | turunan (agregasi pemegang pendaftaran pestisida) | — | 496 |

Respons JSON mentah disimpan apa adanya di `raw/`.

> **`raw/*.json` jangan pernah ditulisi.** Berkas itu potret 19 Agustus 2026, dan registri
> pestisida membuang rekaman yang kedaluwarsa — 584 produk di dalamnya berakhir dalam dua
> belas bulan ke depan dan akan lenyap dari sumbernya. Menimpanya dengan hasil pengambilan
> baru menghancurkan satu-satunya bukti bahwa mereka pernah terdaftar. Potret berkala punya
> tempatnya sendiri di **[`potret/`](potret/README.md)**, dan potret 19 Agustus sudah
> diserap ke sana sebagai potret pertama.

## Metode akses
Endpoint data bersifat publik namun butuh cookie sesi (`ci_session`) yang
terbentuk saat mengunjungi portal; halaman HTML `/pupuk` & `/pestisida`
sendiri mengalihkan ke login (itu hanya shell UI, bukan data). Pengambilan
dilakukan dengan membangun sesi guest lalu memanggil endpoint JSON — tanpa
kredensial, tanpa mem-bypass apa pun.

## Kamus kolom (ringkas)
**pupuk_terdaftar.csv** — merk_dagang, nomor_pendaftaran, pemegang_pendaftaran,
jenis_pupuk (Organik/An-organik/Hayati/dll), bentuk_formula, tipe_permohonan,
tgl_terbit, tgl_berakhir, jumlah_perubahan, product_id, perusahaan_id.

**pupuk_terdaftar_legacy.csv** — merk_dagang, nomor_pendaftaran,
pemegang_pendaftaran, jenis_formula, bentuk_formula, warna_pupuk,
jenis_permohonan, tanggal_terbit, tanggal_berakhir, id_perusahaan.

**pestisida_terdaftar.csv** — nama_produk, nomor_pendaftaran, jenis_pestisida
(Insektisida/Herbisida/Fungisida/dll), bentuk_formulasi, **bahan_aktif**
(ringkas: "Nama kadar satuan"), pemegang_pendaftaran, jenis_perseroan, perihal,
bidang_penggunaan, **komoditas_sasaran** (daftar komoditas unik),
tanggal_terbit, tanggal_berakhir, jml_perubahan_nama, jml_perubahan_pemegang,
jml_perluasan, id, serta `bahan_aktif_json` & `komoditas_json` (data mentah
lengkap termasuk hama sasaran & dosis).

## Catatan
- Data untuk informasi umum; untuk keputusan resmi verifikasi ke PVTPP
  (WA Center 0811-1010-0750 / Loket Padu Satu, Kementan Ragunan).
- CSV berencoding UTF-8 (BOM) agar rapi dibuka di Excel.

## Tambahan (olahan lanjutan)
- `produsen_master.csv` — **1.948 principal unik** hasil dedup lintas pupuk+pestisida
  (normalisasi nama badan usaha PT/CV/UD dll). Kolom: principal, sektor
  (Pupuk / Pestisida / Pupuk+Pestisida), jml_produk_pupuk, jml_produk_pestisida,
  jml_produk_total, rincian_jenis_pestisida, nama_varian_lain.
  **163 principal aktif di kedua sektor** (pupuk & pestisida).
- `pukpes_database.xlsx` — workbook 5 sheet (Ringkasan, Produsen Master,
  Pupuk Terdaftar, Pupuk Legacy, Pestisida Terdaftar); header berwarna, auto-filter,
  freeze pane. Kolom JSON mentah pestisida tidak disertakan di Excel (tetap ada di CSV & raw/).

## Penyeragaman nama principal (19 Agustus 2026)

| Berkas | Isi |
|---|---|
| `principal_kanonik.csv` | 2.304 nama sebagaimana tertulis di registri + kolom `nama_kanonik` |
| `principal_alias.csv` | 683 baris pemetaan beserta alasannya (`dasar`, `perlu_tinjau`) |

2.304 nama mentah menjadi 1.948 principal; 356 varian digabung, 9 ditandai perlu ditinjau.
Konvensinya sama dengan sisi benih di `proseed_data/pemohon_alias.csv` dan dijelaskan di
`spec/00-konvensi-kerja-paralel.md`.

Tujuh dari sembilan tanda itu berarti bentuk badan hukumnya berbeda (`CV` lawan `PT`).
Dua sisanya — kedua ejaan **PT Pupuk Indonesia**, digabung 24 Agustus 2026 — berarti sesuatu
yang lain: bentuk kanoniknya **ditetapkan pemilik repositori** dan tidak pernah ditulis begitu
di registri, sehingga aturan pemilihan bentuk kanonik tidak bisa menghasilkannya sendiri.
Kelompok itu satu-satunya yang tidak punya baris ber-`dasar` `kanonik`. Alasan lengkapnya di
[`docs/principal-terdaftar.md`](../docs/principal-terdaftar.md).

`produsen_master.csv` dibuat lebih dulu dengan cara lain — nama asli tidak disimpan dan
alasan penggabungan tidak dicatat. Dibiarkan sebagai jejak; yang mengikat `principal_alias.csv`.

## Dua medan berisi JSON yang dibongkar (23 Agustus 2026)

Tiga kolom registri menyimpan JSON di dalam string, dan isinya karena itu tidak pernah
muncul di CSV mana pun: `bahanAktif` dan `Komoditas` pada pestisida, `hasilAnalisaUji`
pada pupuk. Tujuh berkas di bawah membongkarnya. Semuanya **dibangkitkan**, bukan
diketik: jalankan ulang skripnya, hasilnya identik byte per byte.

```bash
node spec/tools/bangun-sasaran-dosis.mjs    --tulis   # 4 berkas pertama
node spec/tools/bangun-komposisi-pupuk.mjs  --tulis   # 3 berkas terakhir
```

Tanpa `--tulis` keduanya hanya menghitung dan melaporkan — termasuk seluruh angka di
bawah, supaya tak ada temuan yang dipaku ke dalam prosa.

| Berkas | Isi |
|---|---|
| `sasaran_dosis.csv` | 23.180 baris produk x komoditas x OPT beserta dosisnya |
| `bahan_aktif_produk.csv` | 14.269 baris produk x bahan aktif, **apa adanya** dari registri |
| `sasaran_ketersediaan.json` | indeks 346 komoditas x 1.156 OPT = 3.236 pasangan terisi |
| `sasaran_dosis_anomali.csv` | 1.566 baris yang tidak bisa diurai, bersengketa, atau kembar |
| `komposisi_pupuk.csv` | 29.614 baris produk x parameter uji, nilai sudah jadi angka |
| `komposisi_pupuk_parameter.csv` | inventaris 639 parameter beserta varian ejaannya |
| `komposisi_pupuk_anomali.csv` | 85 baris bermasalah beserta alasannya |

### Sembilan baris kembar dari endpoint

Tarikan pestisida memuat **7.724 rekaman untuk 7.715 produk**: delapan `id` muncul lebih
dari sekali — satu tiga kali, tujuh dua kali — dan tiap salinan identik byte per byte
dengan aslinya. Ini penggandaan baris oleh endpoint, bukan tabrakan identitas, dan
perilakunya menetap: delapan `id` yang sama muncul di potret 19 maupun 23 Agustus.
Salinannya dibuang di titik masuk, sebelum pemekaran apa pun, karena kalau tidak,
delapan produk itu terhitung berganda pada pertanyaan sesederhana "berapa produk
mengandung bahan X" — **42 entri bahan aktif dan 17 entri komoditas** ikut berganda.

Pembuangannya tidak senyap: sembilan barisnya ada di `sasaran_dosis_anomali.csv` dengan
jenis `rekaman-kembar-dibuang`, lengkap dengan `op:prd` mana yang dipertahankan dan mana
yang dibuang, dan cacahnya ada di `meta.jumlah.rekaman_kembar_dibuang` pada indeks.
Perlu dicatat: `op:prd` salinan yang dibuang **tetap ada** di
`spec/vocab/product/pestisida.ndjson`, sebab NDJSON itu dibangun dari tarikan yang belum
didedup — sembilan `op:prd` di sana tidak akan punya baris di tabel ini.

Kalau suatu saat dua rekaman ber-`id` sama ternyata **tidak** identik, skrip berhenti
dengan galat dan tidak memilih salah satu: itu tabrakan identitas, dan memilih pemenang
bukan urusan alat pembersih.

### Dosis yang tidak ada di kolom dosis

Registri menaruh dosis di `kadarPestisida` — tetapi pada ribuan entri kolom itu kosong
sementara angkanya tertulis di dalam kurung pada `latinHamaKomoditas`, kadang pada
`namaKomoditas`. Menguraikannya menaikkan cakupan dosis numerik **dari 17.913 (77,57%)
jadi 21.360 (92,49%) entri sasaran** — 3.447 dosis yang tadinya tak terlihat. Pada
tingkat produk kenaikannya nyaris nihil (5.927 → 5.931), sebab kurung itu hampir selalu
ada pada produk yang entri pertamanya sudah berdosis: yang selama ini hilang bukan
produknya, melainkan **sasaran mana yang memakai dosis berapa**.

Kolom `dosis_asal` menyebut asal tiap angka: `kolom` (17.953), `kurung-latin` (3.474),
`kurung-komoditas` (8), `kolom-teks` (308, pernyataan seperti "siap pakai" yang memang
bukan angka), `tidak-ada` (1.437).

### Ketiadaan sebagai jawaban

`sasaran_ketersediaan.json` sengaja memuat semesta komoditas dan semesta OPT, bukan
hanya pasangan yang terisi. Dengan begitu tiga jawaban bisa dibedakan: komoditasnya tak
dikenal registri, OPT-nya tak dikenal registri, atau — keduanya dikenal tetapi
pasangannya kosong — **tidak ada pestisida terdaftar untuk OPT itu pada komoditas itu**.
Yang terakhir adalah jawaban, bukan data yang belum lengkap.

### Komposisi pupuk

`hasilAnalisaUji` terisi pada seluruh 5.875 baris SIMPEL, dan 5.866 (99,85%) menghasilkan
sedikitnya satu parameter yang terurai; 99,76% nilainya jadi angka. Empat jebakan
ditangani dan tercatat di kepala skripnya: `<sup>` yang tidak boleh diperlakukan seperti
`<sub>` (pangkat CFU pindah ke kolom `pengali`), satu sel yang memuat beberapa parameter
(+316 hara yang tadinya tertelan, termasuk tujuh dari delapan hara PHONSKA PLUS), titik
dua sisa tata letak di depan nilai, dan angka bergaya Indonesia — `11.221,34 ppm` adalah
11.221,34, bukan 11,221.

Nama parameter **tidak** diseragamkan lebih jauh dari huruf besar-kecil dan spasi: 780
nama mentah menjadi 639 `parameter_kunci`. Membuang spasi dan tanda hubung akan
menyusutkannya lagi jadi 559 — 80 pasang nama yang menunggu putusan agronomi, bukan
putusan pembersihan teks, dan karena itu dibiarkan terpisah. Sebarannya ada di
`komposisi_pupuk_parameter.csv`.

`pupuk_terdaftar_legacy.json` (1.321 baris, basis SIMPUK 2020) tidak ikut: bentuknya
berbeda dan memang tidak memuat hasil analisa.
