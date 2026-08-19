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
| `principal_alias.csv` | 681 baris pemetaan beserta alasannya (`dasar`, `perlu_tinjau`) |

2.304 nama mentah menjadi 1.949 principal; 355 varian digabung, 7 ditandai perlu ditinjau
karena bentuk badan hukumnya berbeda. Konvensinya sama dengan sisi benih di
`proseed_data/pemohon_alias.csv` dan dijelaskan di `spec/00-konvensi-kerja-paralel.md`.

`produsen_master.csv` dibuat lebih dulu dengan cara lain — nama asli tidak disimpan dan
alasan penggabungan tidak dicatat. Dibiarkan sebagai jejak; yang mengikat `principal_alias.csv`.
