# Replication Data for: Late blight severity in breeding clones from CIP's LBHTC2 breeding population

- **dataset_id**: KEN-07-cip-hawar-lbhtc2
- **Tanaman**: Kentang (*Solanum tuberosum*) — klon pemuliaan populasi LBHTC2
- **Penyakit/kelas tercakup**: hawar daun / **late blight** (*Phytophthora infestans*) — skor
  keparahan `LB1`–`LB7` (tujuh kali pengamatan, persen luas permukaan petak terserang) dan
  indeks `audpc`
- **Jenis data**: tabular
- **Format**: TSV (`.tab`, hasil ingest Dataverse)
- **Jumlah**: 5.808 baris petak percobaan, 2.754 baris daftar material, 9 baris kamus data
- **Sumber**: International Potato Center (CIP) Dataverse — `data.cipotato.org`
- **URL sumber**: https://data.cipotato.org/dataset.xhtml?persistentId=doi:10.21223/P3/PN2RGR
- **DOI**: 10.21223/P3/PN2RGR
- **Pembuat**: International Potato Center (CIP)
- **Tahun terbit / pembaruan**: 2026 (terbit 2026-08-24, sehari sebelum tanggal panen ini)
- **Lisensi**: CC BY 4.0 (dinyatakan di medan *Terms of Use* Dataverse)
- **Ketentuan atribusi**: sebut CIP, sertakan DOI dan lisensi CC BY 4.0.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 538.148 byte (0,5 MB) untuk 3 berkas
- **SHA-256**: lihat `SHA256SUMS.txt`
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**:
  - `file -b raw/*.tab` → `ASCII text` untuk ketiganya
  - `wc -l` → 5.809 / 2.755 / 10 baris (termasuk header)
  - kolom `01_Data`: `plot rep row col genotype type LB1..LB7 audpc` (14 kolom)
  - `awk` → **5.484 dari 5.808** baris punya nilai `audpc`; rentang **70,0–2.677,5**, rerata 775,0
  - peran genotipe: 5.263 `test`, 279 `check`, 48 `parental`, 218 kosong
  - genotipe unik: **2.755**
  - rincian di `struktur.txt`
- **Keterbatasan / masalah kualitas**:
  - **Sama seperti KEN-06: jangan pakai `?format=original`** — endpoint itu memberi XLSX
    berlabel `.tab`. Berkas di sini diambil tanpa parameter itu (TSV asli).
  - 218 baris bertipe kosong dan 324 baris tanpa `audpc`; sebagian petak bertanda
    `"empty"` pada kolom genotipe (petak kosong dalam rancangan lapangan) — **harus disaring**
    sebelum analisis, kalau tidak akan dihitung sebagai genotipe bernama "empty".
  - Nilai `LB1`–`LB7` adalah persen luas terserang, tetapi **tanggal tiap pengamatan tidak
    dicantumkan**. AUDPC karena itu tidak dapat dihitung ulang dari kolom mentah; nilai
    `audpc` harus diterima apa adanya.
  - Tidak ada koordinat, ketinggian, cuaca, atau musim. Lokasi tidak dinyatakan dalam berkas.
  - Genotipe berupa kode klon CIP (`CIP317029.220`) tanpa nama varietas komersial — tidak
    bisa langsung dipetakan ke varietas yang dikenal petani Indonesia.
  - Populasi pemuliaan terseleksi untuk ketahanan hawar, jadi **sebaran AUDPC bias ke arah
    tahan** dan tidak mewakili populasi varietas di lapangan.

## Kegunaan

Sama seperti KEN-06 — bahan epidemiologi/pemuliaan, bukan penglihatan komputer.
Nilainya di sini adalah ukuran sampel: 5.808 petak dan 2.755 genotipe unik dengan
tujuh titik waktu pengamatan, cukup untuk mendemonstrasikan bentuk kurva perkembangan
hawar dan sebaran ketahanan.
