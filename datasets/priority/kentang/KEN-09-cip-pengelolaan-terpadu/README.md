# Dataset for: Integrated management of late blight on potato

- **dataset_id**: KEN-09-cip-pengelolaan-terpadu
- **Tanaman**: Kentang (*Solanum tuberosum*) — varietas Afrika Timur
- **Penyakit/kelas tercakup**: hawar daun / **late blight** (*Phytophthora infestans*) —
  data uji lapangan perlakuan fungisida, dengan `AUDPC`, `rAUDPC`, `DiseasePressure`,
  `Pressure` (High/Low), `RLB` (kelas ketahanan, mis. *Highly Susceptible*),
  `Diseasereduction`, dan hasil panen (`MTYA`, `Yieldincreaserelativetocontrol`)
- **Jenis data**: tabular
- **Format**: TSV (`.tab`) untuk data; XLSX untuk dua kamus data
- **Jumlah**: 309 baris data uji; 4 lokasi terisi pada tabel lokalitas
- **Sumber**: International Potato Center (CIP) Dataverse — `data.cipotato.org`
- **URL sumber**: https://data.cipotato.org/dataset.xhtml?persistentId=doi:10.21223/6RV436
- **DOI**: 10.21223/6RV436
- **Pembuat**: International Potato Center (CIP)
- **Tahun terbit / pembaruan**: 2020-07-17
- **Lisensi**: **tidak dinyatakan** — Dataverse menampilkan teks baku *"This dataset is made
  available without information on how it can be used"*, dan medan `license` bernilai `null`.
- **Ketentuan atribusi**: tidak ada ketentuan resmi. **Penerbitan ulang berisiko**: tanpa
  pernyataan lisensi, hak menyalin/menyebarkan tidak diberikan secara eksplisit. Aman untuk
  analisis internal; untuk publikasi ulang perlu izin tertulis dari CIP.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 82.270 byte (0,1 MB) untuk 4 berkas
- **SHA-256**: lihat `SHA256SUMS.txt`
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**:
  - `file -b raw/*.tab` → `ASCII text`; `file -b raw/*.xlsx` → `Microsoft Excel 2007+`
  - `wc -l raw/4296_Data.tab` → 310 baris (309 data + header), 16 kolom
  - perlakuan: **103 `Phosphonate`, 103 `Metalaxyl + Mancozeb`, 103 `Control`** (seimbang sempurna)
  - tahun: 2010 (108), 2011 (63), 2011a (18), 2011b (72), 2012 (24), 2014 (24)
  - tekanan penyakit: 195 `High`, 114 `Low`
  - kultivar: Asante (69), Tigoni (57), Kenya Mpya (36), Nyayo (27), Mavuno (27),
    Dutch Robyjn (27), Shangi (21), Kenya Karibu (18), Desiree (18), Arka (9)
  - lokasi: University of Nairobi, Koibatek, Njabini (Nyandarua), Limuru (Kiambu) — Kenya,
    masing-masing bertaut GeoNames
  - rincian di `struktur.txt`
- **Keterbatasan / masalah kualitas**:
  - **Lisensi tidak dinyatakan** — batasan paling serius pada dataset ini (lihat di atas).
  - `4296_Localities.tab` punya 306 baris tetapi **hanya 4 yang terisi**; sisanya baris kosong
    bawaan berkas. Parser naif akan menghasilkan 302 lokasi hantu.
  - Kolom `YEAR` tidak konsisten: bercampur `2011`, `2011a`, `2011b` — musim dalam satu tahun
    ditulis sebagai varian string, bukan kolom musim terpisah (padahal ada kolom `SEASON`).
    Pengurutan atau pengelompokan numerik atas `YEAR` akan gagal.
  - Ada dua kolom yang tampak berulang: `DiseasePressure` dan `Pressure` — keduanya berisi
    High/Low. Bedanya tidak dijelaskan di kamus data.
  - `ACCENUMB` (nomor aksesi) kosong di seluruh baris.
  - Ukuran kecil: 309 baris, 4 lokasi, 10 kultivar. Cukup untuk ilustrasi, tidak cukup untuk
    memodelkan epidemi.
  - **Konteks Kenya, bukan Indonesia.** Namun ini satu-satunya berkas dalam panen ini yang
    memasangkan perlakuan fungisida ↔ AUDPC ↔ kehilangan hasil pada varietas bernama, dan
    dataran tinggi tropis Kenya (Nyandarua, Kiambu) secara agroklimat cukup sebanding dengan
    sentra kentang dataran tinggi Indonesia (Dieng, Pangalengan).

## Kegunaan

Bahan **epidemiologi terapan**: menunjukkan hubungan kuantitatif antara pilihan perlakuan
(kontrol vs fosfonat vs metalaksil+mankozeb), tekanan penyakit, ketahanan varietas, dan
kenaikan hasil. Ini jenis data yang dibutuhkan untuk menjawab "apa untungnya menyemprot"
— bukan sekadar "penyakit apa ini".
