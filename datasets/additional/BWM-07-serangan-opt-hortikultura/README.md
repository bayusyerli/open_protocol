# Luas serangan OPT hortikultura — statistik sektoral daerah (Sumut, Kota Batu, Kotabaru, Kab. Malang)

- **dataset_id**: BWM-07-serangan-opt-hortikultura
- **Tanaman**: "Hortikultura" sebagai **satu kategori gabungan** — tidak ada rincian per komoditas. Tidak satu berkas pun menyebut bawang merah, cabai, tomat, atau kentang secara terpisah. Lihat Keterbatasan butir 1; ini temuan utamanya.
- **Penyakit/kelas tercakup**: tidak ada rincian OPT. Yang diukur adalah **luas area terserang (Ha)** atau **rasio penanganan (%)** untuk seluruh OPT hortikultura sekaligus.
- **Jenis data**: tabular
- **Format**: 3 × XLSX (Excel 2007+) + 2 × CSV
- **Jumlah**: **41 baris data** seluruhnya, dalam 5 berkas:
  | Berkas | Wilayah | Baris data | Isi | Tahun |
  |---|---|---|---|---|
  | `batukota-luas-serangan-opt-hortikultura.xlsx` | Kota Batu | 5 | luas serangan (Ha) total kota | 2020–2024 |
  | `kotabaru-luas-serangan-opt-2025.xlsx` | Kab. Kotabaru | 1 | luas serangan dikendalikan (Ha) | 2021–2025 |
  | `malangkab-luas-serangan-opt-hortikultura.xlsx` | Kab. Malang | 1 | 518,52 Ha (semusim 196,89 / tahunan 321,63) | 2024 |
  | `sumut-836-rasio-opt-horti-kabkota-2024.csv` | Sumatera Utara | 33 | **rasio** penanganan (%) per kab/kota | 2024 |
  | `sumut-835-rasio-opt-horti-provinsi-2024.csv` | Sumatera Utara | 1 | rasio provinsi = 100 | 2024 |
- **Sumber**: portal statistik sektoral / Satu Data daerah
  - Dinas Ketahanan Pangan, Tanaman Pangan & Hortikultura Prov. Sumatera Utara
  - Dinas Pertanian & Ketahanan Pangan Kota Batu
  - Pemkab Kotabaru (Satu Data)
  - Dinas Tanaman Pangan, Hortikultura & Perkebunan Kab. Malang
- **URL sumber**:
  - `https://backend-sdi.sumutprov.go.id/api/tabel-sektoral-builders/csv/836` (dan `/csv/835`)
  - `https://portaldata.batukota.go.id/dataset/25d3a03d-6f6c-4af8-8249-6cb121300f5d/resource/8afcd847-a1cd-4c1b-b335-dbdc726e5f3a/download/jumlah-luas-serangan-opt-hortikultura.xlsx`
  - `https://satudata.kotabarukab.go.id/statistik_sektoral/download/2004`
  - `https://kamasuta.malangkab.go.id/data-cetak-excel?id=10428`
  - Katalog induk: https://data.go.id/dataset?q=serangan+OPT
- **DOI**: tidak ada
- **Pembuat**: dinas terkait di tiap daerah (lihat Sumber)
- **Tahun terbit / pembaruan**: 2024–2026; cakupan data 2020–2025
- **Lisensi**: **tidak dinyatakan** untuk keempat sumber. Portal Kota Batu secara eksplisit mengembalikan `license_title: None`. Label "Terbuka" pada `data.go.id` adalah **penanda tingkat akses SDI, bukan lisensi**. Penerbitan ulang berisiko; pakai sebagai rujukan dengan atribusi.
- **Ketentuan atribusi**: sebut nama dinas + tahun + URL sumber.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 36 KB total (5.258 + 10.732 + 6.331 + 1.288 + 89 byte)
- **SHA-256**: lihat `SHA256SUMS.txt`
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**: keluaran lengkap di `struktur.txt`. Perintah persis:
  - `curl -sL --fail --max-time 180 -A 'Mozilla/5.0' -o <nama> <url>` — 5 respons `200`; satu berkas Kota Batu kedua ("yang ditangani") **gagal `404`** karena UUID resource-nya tidak tertebak dan tidak disimpan
  - `file raw/*` → `Microsoft Excel 2007+` untuk 3 berkas, `CSV text` / `ASCII text` untuk 2 berkas — **cocok dengan nama**, bukan HTML tersamar
  - `python3` + `openpyxl` (XLSX) dan modul `csv` (CSV): baca seluruh sheet, cetak header + semua baris, cacah kolom & baris, kumpulkan tahun yang muncul
  - Pemindai data pribadi dengan regex NIP (`\d{8}\s?\d{6}\s?\d\s?\d{3}`), nomor HP, email, dan gelar — hasilnya di bawah
  - `shasum -a 256 raw/*` → `SHA256SUMS.txt`
- **Keterbatasan / masalah kualitas**:
  1. **Tidak ada rincian per komoditas — ini cacat yang mematikan kegunaannya.** Seluruh berkas melaporkan "Hortikultura" sebagai satu angka. Kab. Malang paling ekstrem: **seluruh kabupaten diwakili satu angka, 518,52 Ha**, dipecah hanya menjadi "semusim" dan "tahunan". Angka semacam ini **tidak bisa menjawab apa pun tentang bawang merah, cabai, tomat, atau kentang**, dan tidak bisa dipakai untuk analisis epidemiologi per penyakit.
  2. **Tidak ada rincian jenis OPT.** Tidak ada nama hama/patogen sama sekali — tidak ada *Alternaria*, *Fusarium*, *Spodoptera*, apa pun. Definisi operasional Kota Batu bahkan menggabungkan "hama, penyakit, dan gulma" jadi satu.
  3. **Berkas Sumut bukan luas, melainkan rasio.** Kolomnya `Rasio_2024`, isinya persentase serangan yang "dapat ditangani". Nilainya nyaris biner — **0 atau 100** untuk hampir semua dari 33 kab/kota. Tidak ada luas dalam hektar, jadi tidak ada besaran yang bisa dianalisis. Provinsi tercatat 100.
  4. **Cakupan wilayah tidak menyentuh sentra bawang merah.** Tidak ada Brebes, Nganjuk, Bima, Solok, atau Probolinggo. Kota Batu dan Kab. Malang adalah sentra apel/sayuran dataran tinggi; Kotabaru di Kalimantan Selatan; Sumut hanya rasio. **Sentra produksi bawang merah nasional tidak terwakili sama sekali.**
  5. **Deret waktu sangat pendek.** Paling panjang 5 titik tahunan (Kota Batu 2020–2024, Kotabaru 2021–2025). Tidak ada data bulanan, tidak ada musim. Epidemiologi penyakit tanaman butuh resolusi bulanan atau mingguan; ini tidak mendekati.
  6. **DATA PRIBADI ADA di `malangkab-luas-serangan-opt-hortikultura.xlsx`.** Berkas itu memuat **blok tanda tangan pejabat**: nama lengkap bergelar, **NIP**, dan alamat surel dinas — terdeteksi 1 NIP, 1 email, 2 pola gelar. **NIP Indonesia memuat tanggal lahir pada 8 digit pertamanya**, jadi ini data pribadi yang mengandung tanggal lahir, bukan sekadar nama jabatan.
     **Aturan pakai: JANGAN menyalurkan baris blok tanda tangan ke antarmuka atau terbitan apa pun.** Yang boleh dipakai hanya baris tabel angka (baris `No / Jumlah Luas Serangan OPT Hortikultura / Jumlah (Ha) / Keterangan`). Berkas mentah disimpan apa adanya sesuai ketentuan. **Koreksi 2026-08-25 (koordinator):** `struktur.txt` SEMULA mencetak nama pejabat dan NIP verbatim di cuplikan barisnya — pemindai menandainya, tetapi cuplikan baris sudah tercetak lebih dulu. Keduanya kini **diredaksi** di `struktur.txt`; nilai aslinya hanya ada di `raw/`, yang dipagari `.gitignore` dan tidak naik ke repo. Ingest apa pun wajib membuang blok tanda tangan lebih dulu.
  7. **Berkas Malang menyertakan tanggal cetak dinamis** ("Malang, Selasa 25 Agustus 2026") — berkas dihasilkan saat diminta, jadi **SHA-256-nya tidak stabil**: mengunduh ulang besok menghasilkan checksum berbeda walau datanya sama.
  8. **Metadata kegiatan statistik kosong** di berkas Malang — seluruh medan ("Nama Kegiatan Statistik", "Tujuan Pelaksanaan", "Cakupan Wilayah", dst.) berisi `-`. Metodologi tidak terdokumentasi, jadi angkanya tidak bisa diaudit.
  9. **Lisensi tidak dinyatakan** di keempat sumber (lihat di atas).

## Mengapa hanya ini yang ada — hasil penelusuran negatif

Penelusuran menyeluruh atas portal data pemerintah pada 2026-08-25 menunjukkan **tidak ada satu pun sumber pemerintah Indonesia yang menerbitkan luas serangan OPT per komoditas hortikultura secara terbuka dan tabular.** Yang diperiksa dan hasilnya:

| Sumber | Status | Catatan |
|---|---|---|
| `ditlin.hortikultura.pertanian.go.id` (Dit. Perlindungan Hortikultura) | **MATI — NXDOMAIN** | Otoritas nasional yang seharusnya memegang data ini. Tidak resolve di 8.8.8.8 maupun 1.1.1.1. Masih dirujuk mesin pencari dan halaman Kementan. |
| `satudata.pertanian.go.id` | hidup, **0 dataset OPT** | Katalog 277 dataset ter-inline sebagai `var metaDatasets` di `/datasets`. Isinya produksi & luas panen, bukan serangan OPT. |
| `bbopt.tanamanpangan.pertanian.go.id` | **NXDOMAIN** | Host yang hidup adalah `bbpopt` (pakai P), dan lingkupnya tanaman pangan. |
| `katalog.data.go.id` (CKAN lama) | **NXDOMAIN** | Sudah pensiun; masih dirujuk mesin pencari. |
| `data.go.id` | hidup | **Bukan CKAN** (Next.js); `/api/3/action/*` → 404. Berperan sebagai pemanen federasi; berkasnya tetap di portal daerah. |
| `opendata.jabarprov.go.id`, `data.jabarprov.go.id` | **403 Cloudflare** (`cf-mitigated: challenge`) | `robots.txt` sendiri 404. Perlu jalur peramban untuk memeriksanya. |
| `bps.go.id`, `jateng.bps.go.id` | **403 Cloudflare** | — |
| `webapi.bps.go.id` | **terhalang-akun** | Perlu kunci gratis. Tabel OPT yang terlihat pun padi/kedelai. |
| `data.jatengprov.go.id` (CKAN, memfederasi kabupaten Jateng) | hidup, **nihil untuk hortikultura** | `package_search?q=serangan+OPT` hanya mengembalikan padi + perkebunan. |
| Kab. Cilacap — `data-serangan-...-2018-2021.xlsx` (760 KB, bulanan × kecamatan × jenis OPT) | **DITOLAK** | **Bentuknya persis yang kita butuhkan, tapi sektornya salah**: isinya perkebunan (kelapa, cengkeh, kopi, karet, lada, kakao, pala) dan rekap bulanan 2026-nya padi. **Juga memuat data pribadi petugas POPT (nama + NIP)** — sengaja tidak diunduh. |
| Kab. Musi Banyuasin, Kab. Gresik, Sumut 2022 | metadata saja | Terdaftar di `data.go.id` tanpa berkas, atau tautannya 404. |

**Kesimpulan**: keberadaan berkas Cilacap membuktikan format bulanan × kecamatan × jenis OPT **memang dihasilkan** oleh BPTPH/LPHP provinsi — hanya saja versi hortikulturanya tidak diterbitkan sebagai data terbuka. Jalur realistis untuk mendapatkannya bukan scraping, melainkan **permintaan data resmi lewat PPID** ke Direktorat Perlindungan Hortikultura atau BPTPH provinsi sentra (Jawa Tengah untuk Brebes, Jawa Timur untuk Nganjuk/Probolinggo, NTB untuk Bima).
