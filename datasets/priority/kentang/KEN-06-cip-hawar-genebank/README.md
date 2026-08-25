# Replication Data for: Late blight severity in potato accessions from the CIP genebank core collection

- **dataset_id**: KEN-06-cip-hawar-genebank
- **Tanaman**: Kentang (*Solanum tuberosum* dan kerabat liar/budidaya Andes)
- **Penyakit/kelas tercakup**: hawar daun / **late blight** (*Phytophthora infestans*) — bukan kelas
  gambar, melainkan **skor keparahan** `lb1`–`lb5` (lima kali pengamatan) dan indeks `audpc`
  (Area Under the Disease Progress Curve)
- **Jenis data**: tabular
- **Format**: TSV (`.tab`, tab-separated, hasil ingest Dataverse)
- **Jumlah**: 1.517 baris data percobaan (petak), 482 baris daftar material, 12 baris kamus data
- **Sumber**: International Potato Center (CIP) Dataverse — `data.cipotato.org`
- **URL sumber**: https://data.cipotato.org/dataset.xhtml?persistentId=doi:10.21223/P3/HJLUJZ
- **DOI**: 10.21223/P3/HJLUJZ
- **Pembuat**: International Potato Center (CIP)
- **Tahun terbit / pembaruan**: 2026
- **Lisensi**: CC BY 4.0 (dinyatakan di medan *Terms of Use* Dataverse)
- **Ketentuan atribusi**: sebut CIP sebagai pembuat, sertakan DOI dan lisensi CC BY 4.0.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 165.381 byte (0,2 MB) untuk 3 berkas
- **SHA-256**: lihat `SHA256SUMS.txt`
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**:
  - `file -b raw/*.tab` → `ASCII text` untuk ketiganya
  - `wc -l` → 1.518 / 483 / 13 baris (termasuk header)
  - `head -1 | awk -F'\t' '{print NF}'` → 14 / 5 / 2 kolom
  - kolom `01_data`: `plot rep row col genotype specie group type lb1 lb2 lb3 lb4 lb5 audpc`
  - `awk` atas kolom `audpc` → **1.428 dari 1.517** baris punya nilai AUDPC (89 baris `na`)
  - cacah spesies & group → lihat `struktur.txt`
- **Keterbatasan / masalah kualitas**:
  - **PENTING — jangan pakai `?format=original` pada API Dataverse.** Endpoint itu
    mengembalikan **XLSX** meski nama berkasnya `.tab`. Berkas di `raw/` ini sengaja diambil
    tanpa parameter tersebut sehingga isinya benar-benar TSV sesuai ekstensinya.
    (`file` pada versi `format=original` melaporkan `Microsoft Excel 2007+`.)
  - Nilai hilang ditandai string `"na"`, bukan sel kosong — parser naif akan membacanya
    sebagai teks dan mengubah seluruh kolom `lb1`–`audpc` menjadi bertipe string.
  - 41 baris punya `specie`/`group` kosong (tertulis `empty`).
  - Semua nilai numerik dibungkus gaya Dataverse (`1.0` untuk bilangan bulat) dan medan teks
    dikutip ganda dengan **spasi di ujung** (`"andigena "`, `"native "`) — perlu `trim`.
  - **Tidak ada koordinat, tanggal pengamatan, atau data cuaca.** Selang waktu antara `lb1`
    dan `lb5` tidak tercatat di berkas data, sehingga AUDPC tidak dapat dihitung ulang atau
    dinormalkan terhadap waktu tanpa merujuk makalah aslinya.
  - Lokasi percobaan tidak dinyatakan di dalam berkas (uji CIP umumnya di Peru — Oxapampa/
    Huancayo). Untuk pemakaian di Indonesia, tekanan penyakit dan ras *P. infestans* berbeda.
  - Materialnya koleksi inti genebank (banyak aksesi Andes: `andigena`, `phureja`,
    `stenotomum`, `goniocalyx`, `ajanhuiri`, `juzepczukii`, `curtilobum`, `chaucha`) —
    **bukan** varietas yang ditanam petani Indonesia (Granola, Atlantik, Median).

## Kegunaan

Ini bahan **epidemiologi dan ketahanan varietas**, bukan bahan penglihatan komputer.
Berguna untuk: (a) menjelaskan konsep AUDPC dan kurva perkembangan penyakit di basis
pengetahuan, (b) contoh nyata rentang ketahanan antar-spesies kentang, (c) rujukan skala
penilaian keparahan hawar 1–5 yang lazim dipakai lapangan.
