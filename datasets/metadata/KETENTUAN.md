# Ketentuan panen dataset penyakit tanaman hortikultura

Berkas ini kontrak bersama untuk semua agen. Baca sampai habis sebelum mengunduh apa pun.
Tanggal panen: 2026-08-25. Direktori kerja: `/Users/syera/open_protocol`.

## 1. Tiga status yang tidak boleh dicampur

| status | arti |
|---|---|
| `ditemukan` | sumbernya ada dan tertelusur, berkasnya **belum** ada di disk |
| `diunduh` | berkasnya ada di disk, checksum sudah dihitung |
| `terverifikasi` | sudah dibuka/diurai, isinya cocok dengan deskripsi sumbernya |

Jangan pernah menulis `diunduh` untuk sesuatu yang hanya ditemukan. Jangan pernah menulis
`terverifikasi` untuk arsip yang belum pernah dibuka. Kalau jumlah gambar/record berbeda dari
yang diklaim sumbernya, statusnya `sebagian` dan selisihnya ditulis di kolom `notes`.

## 2. Batasan keras

1. **Jangan menembus login, paywall, CAPTCHA, atau pembatasan akses.** Kalau unduhan meminta
   akun (Kaggle tanpa token, formulir permintaan, SSO), catat metadatanya lalu beri status
   `terhalang-akun`. Jangan mencari jalan memutar.
2. **Jangan menjalankan kode apa pun dari repositori yang ditemukan.** Boleh membaca kode,
   tidak boleh `python train.py`, `npm install`, `make`, atau skrip unduhan pihak ketiga.
3. **Jangan mengubah data mentah.** Berkas asli masuk `raw/` apa adanya, nama asli
   dipertahankan. Tidak ada pembersihan, penggantian nama massal, atau konversi format.
4. **Batas ukuran**: satu dataset maksimal 3 GB; total per agen maksimal 8 GB. Yang lebih besar
   dicatat metadatanya dengan status `terlalu-besar` — kecuali sumbernya sendiri menyediakan
   subset resmi yang bisa diunduh terpisah.
5. **Halaman ringkasan bukan dataset.** Artikel jurnal, posting blog, "daftar 20 dataset
   terbaik", atau halaman landing tanpa berkas yang bisa diunduh → status `ditolak`, alasannya
   ditulis. Tautan ke dataset di dalam artikel tetap ditelusuri sampai ke berkasnya.
6. **Periksa lisensi sebelum mengunduh.** Catat lisensi persisnya (CC BY 4.0, CC0, CC BY-NC 4.0,
   MIT, "tidak dinyatakan", dst.). Kalau tidak ada pernyataan lisensi sama sekali, tetap boleh
   diunduh bila berkasnya terbuka publik, tapi tulis `tidak dinyatakan` dan tandai di `notes`
   bahwa penerbitan ulang berisiko.
7. **Jangan mengunduh berkas mencurigakan**: executable (.exe/.dmg/.pkg/.sh yang dijanjikan
   sebagai "dataset"), arsip berpassword, atau apa pun yang tipenya tidak cocok dengan namanya.
   Periksa dengan `file` setelah unduh.

## 3. Struktur penyimpanan

```
datasets/priority/<cabai|tomat|kentang|bawang-merah>/<dataset_id>/
├── README.md          # wajib, bahasa Indonesia, format di bagian 5
├── raw/               # berkas asli apa adanya
├── SHA256SUMS.txt     # keluaran `shasum -a 256 raw/*`
└── struktur.txt       # cuplikan isi arsip + cacah per kelas (bukti verifikasi)
datasets/additional/<dataset_id>/     # tanaman di luar 4 prioritas, atau ≥3 tanaman sekaligus
```

`dataset_id` = `<PREFIKS-AGEN>-NN-slug-pendek`, misal `CAB-01-cabai-daun-mendeley`.
Prefiks agen: cabai `CAB`, tomat `TOM`, kentang `KEN`, bawang merah `BWM`.
Dataset multi-tanaman yang kamu unduh tetap memakai prefiksmu, tapi tinggal di `additional/`.

## 4. Anti-duplikasi (agen berjalan paralel!)

Sebelum mengunduh apa pun:

1. Baca **semua** berkas di `datasets/metadata/klaim/*.tsv`.
2. Kalau DOI/URL/judulnya sudah diklaim agen lain, **jangan unduh ulang**. Catat di laporanmu
   sebagai duplikasi yang dicegah, dan rujuk `local_path` milik agen itu.
3. Kalau belum ada, tambahkan barismu dulu, baru unduh:

```bash
printf '%s\t%s\t%s\t%s\n' "<dataset_id>" "<doi-atau-url-kanonik>" "<judul>" "<local_path>" \
  >> datasets/metadata/klaim/<crop>.tsv
```

Pembagian dataset multi-tanaman yang sudah pasti bertabrakan (jangan diambil agen lain):
- **PlantVillage** (54.303 gambar, 14 tanaman termasuk tomat & kentang) → milik **agen tomat**.
- **PlantDoc** (2.598 gambar lapangan, 13 tanaman) → milik **agen kentang**.
Agen lain cukup merujuknya dari README masing-masing tanaman.

Duplikat juga dicek dengan checksum: kalau SHA-256 sebuah berkas sama persis dengan berkas
yang sudah ada di katalog, itu duplikat walau URL-nya berbeda.

## 5. README.md per dataset (wajib, semua medan diisi)

```markdown
# <Judul dataset>

- **dataset_id**: 
- **Tanaman**: 
- **Penyakit/kelas tercakup**: (daftar nama kelas apa adanya dari dataset)
- **Jenis data**: gambar | tabular | teks | campuran
- **Format**: JPG/PNG dalam ZIP | CSV | JSON | XLSX | ...
- **Jumlah**: (gambar/record; tulis "diklaim N, terhitung M" bila berbeda)
- **Sumber**: (penerbit/repositori)
- **URL sumber**: 
- **DOI**: 
- **Pembuat**: 
- **Tahun terbit / pembaruan**: 
- **Lisensi**: 
- **Ketentuan atribusi**: 
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 
- **SHA-256**: (lihat SHA256SUMS.txt bila banyak berkas)
- **Status unduh**: 
- **Status verifikasi**: 
- **Cara verifikasi**: (perintah persis yang dipakai + hasilnya)
- **Keterbatasan / masalah kualitas**: (jujur: latar seragam? daun tunggal di studio?
  kelas tidak seimbang? label meragukan? augmentasi ikut tercampur? bukan tanaman Indonesia?)
```

## 6. Baris katalog

Tulis satu baris CSV per dataset (termasuk yang gagal/ditolak) ke
`datasets/metadata/rows/<crop>.csv` — **tanpa header**, kutip medan yang memuat koma:

```
dataset_id,title,crop,diseases,data_type,format,record_count,source,source_url,license,publication_year,access_date,local_path,file_size,sha256,download_status,verification_status,notes
```

- `download_status` ∈ `diunduh` | `ditemukan` | `terhalang-akun` | `terlalu-besar` | `gagal` | `ditolak`
- `verification_status` ∈ `terverifikasi` | `sebagian` | `belum` | `tidak-berlaku`
- `sha256` untuk multi-berkas: tulis `lihat-SHA256SUMS` (dan pastikan berkasnya ada).
- Pakai `python3 -c` dengan modul `csv` untuk menulis baris agar kutipnya benar.

## 7. Petunjuk teknis yang menghemat waktu

- **DataCite** mengindeks Zenodo, Figshare, Mendeley Data, dan Dryad sekaligus:
  `https://api.datacite.org/dois?query=<kata-kunci>&page[size]=50`
- **Zenodo**: `https://zenodo.org/api/records?q=<q>&size=25` → `files[].links.self`
- **Figshare**: `https://api.figshare.com/v2/articles/<id>/files`
- **Mendeley Data**: `https://data.mendeley.com/public-api/datasets/<id>/files?folder_id=root&version=<v>`
  (berkasnya di `content_details.download_url`; halaman webnya JS, API-nya JSON)
- **GitHub**: `https://codeload.github.com/<owner>/<repo>/zip/refs/heads/<branch>`
- Selalu `curl -L --fail --max-time 600 -A 'Mozilla/5.0'`, dan periksa `Content-Type` dulu
  dengan `curl -sIL` supaya tidak menyimpan halaman HTML sebagai `.zip`.
- Verifikasi arsip tanpa mengekstrak: `unzip -l`, `unzip -t`, `tar -tzf`.
  Kalau perlu ekstrak untuk memeriksa, ekstrak ke direktori scratchpad, **bukan** ke `datasets/`.
- Cacah per kelas dari daftar isi zip:
  `unzip -l x.zip | awk '{print $4}' | grep -o '^[^/]*/[^/]*/' | sort | uniq -c | sort -rn`

## 8. Sumber Indonesia yang sering terlewat

- **Statistik serangan OPT** (luas serangan per komoditas/provinsi/tahun) dari Ditjen
  Hortikultura / Kementan / data.go.id / BPS — ini bahan **epidemiologi**, bukan gambar.
- **BSIP / Balitsa** (Balai Penelitian Tanaman Sayuran, Lembang) untuk deskripsi penyakit.
- Repositori universitas (IPB, UGM, UB, Undip) sering menaruh dataset skripsi/tesis di
  Mendeley Data dengan afiliasi Indonesia — cari kata kunci lokal: "cabai", "bawang merah",
  "kentang", "tomat", "penyakit", "hama", "daun", "citra".

## 9. Keluaran wajib per agen

1. Direktori dataset lengkap dengan README, `raw/`, `SHA256SUMS.txt`, `struktur.txt`.
2. `datasets/metadata/rows/<crop>.csv` — semua baris, termasuk yang ditolak.
3. `datasets/metadata/klaim/<crop>.tsv` — klaim yang kamu ambil.
4. `datasets/reports/agen-<crop>.md` — laporanmu, dengan bagian:
   berhasil diunduh · ditemukan tapi belum bisa diunduh · dataset tambahan ·
   ditolak beserta alasan · duplikasi yang dicegah · kekurangan data & rekomendasi lanjutan ·
   penilaian kelayakan untuk (a) identifikasi penyakit, (b) pelatihan computer vision,
   (c) basis pengetahuan, (d) analisis epidemiologi.
5. Jawaban akhir ke pemanggil: ringkasan padat berisi cacah per status dan temuan penting.
