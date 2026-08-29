# GBIF — okurensi & faset negara/tahun untuk 15 patogen & hama komoditas prioritas

- **dataset_id**: BWM-06-gbif-okurensi-patogen
- **Tanaman**: tidak langsung — ini rekaman **organisme pengganggu**, bukan tanaman. Dipilih untuk OPT bawang merah, cabai, tomat, kentang.
- **Penyakit/kelas tercakup**: 15 takson, nama apa adanya dari GBIF backbone:
  | Organisme | `usageKey` | match | okurensi global | okurensi Indonesia |
  |---|---|---|---|---|
  | *Alternaria porri* — bercak ungu / **trotol** | 2616325 | EXACT | 695 | **14** |
  | *Fusarium oxysporum* f. sp. *cepae* — **moler** | 5252046 | EXACT (SYNONYM, rank FORM) | 72 | **0** |
  | *Peronospora destructor* — embun bulu | 3203841 | EXACT | 849 | **0** |
  | *Stemphylium vesicarium* — hawar daun | 2616067 | EXACT | 7.203 | 2 |
  | *Colletotrichum gloeosporioides* — antraknosa/"otomatis" | 2569005 | EXACT | 19.698 | 112 |
  | *Botrytis allii* — busuk umbi/leher | 2583113 | EXACT | 288 | **0** |
  | *Spodoptera exigua* — ulat bawang | 8352161 | EXACT | 45.492 | 50 |
  | *Liriomyza huidobrensis* | 1553410 | EXACT | 1.677 | 51 |
  | *Liriomyza sativae* | 1553757 | EXACT | 2.458 | 10 |
  | *Liriomyza trifolii* | 1553384 | EXACT | 1.872 | 13 |
  | *Onion yellow dwarf virus* (OYDV) | 9890759 | EXACT | 391 | 56 |
  | *Bemisia tabaci* — kutu kebul | 2012126 | EXACT | 32.520 | 222 |
  | *Ralstonia solanacearum* — layu bakteri | 3219898 | EXACT | 5.655 | 67 |
  | *Phytophthora infestans* — busuk daun kentang/tomat | 3203716 | EXACT | 4.704 | **0** |
  | *Alternaria solani* — bercak kering | 2616205 | EXACT | 2.378 | 13 |
- **Jenis data**: tabular (JSON terstruktur)
- **Format**: JSON — respons API GBIF disimpan apa adanya
- **Jumlah**: **45 berkas JSON**; menutupi **125.952 okurensi global** dan **610 okurensi Indonesia** yang tersimpan penuh sebagai rekaman (bukan hanya cacah). Tiap rekaman punya **73 medan**.
  - 15 × `match_*.json` — hasil pencocokan nama ke GBIF backbone
  - 15 × `occ_facet_*.json` — cacah total + faset `COUNTRY` (hingga 250 negara) + faset `YEAR`
  - 15 × `occ_indonesia_*.json` — rekaman lengkap `country=ID` (semua `endOfRecords=true`, jadi **tidak ada yang terpotong**)
- **Sumber**: GBIF (Global Biodiversity Information Facility), API v1
- **URL sumber**: https://api.gbif.org/v1/occurrence/search · https://api.gbif.org/v1/species/match
- **DOI**: tidak ada. Snapshot lewat API pencarian, **bukan** unduhan GBIF ber-DOI (rute unduhan massal butuh akun; tidak dipakai).
- **Pembuat**: GBIF Secretariat + ratusan lembaga penyumbang data (per rekaman)
- **Tahun terbit / pembaruan**: basis data hidup; snapshot 2026-08-25. Rentang tahun rekaman **1801–2026**.
- **Lisensi**: per rekaman, terbaca dari medan `license`. Untuk 610 rekaman Indonesia: **CC BY 4.0 = 584** dan **CC0 1.0 = 26**. Tidak ada rekaman berlisensi NC di antaranya.
- **Ketentuan atribusi**: GBIF meminta sitasi ke **dataset sumber tiap rekaman** (medan `datasetKey`), bukan hanya ke GBIF. Karena ini snapshot API tanpa DOI, sitasi yang jujur: "GBIF.org (25 Agustus 2026) GBIF Occurrence Search API" + daftar `datasetKey` yang dipakai.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 3,2 MB (3.189.492 byte) dalam 45 berkas
- **SHA-256**: lihat `SHA256SUMS.txt`
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**: keluaran lengkap di `struktur.txt`. Angka di sana **dibaca ulang dari berkas JSON di `raw/`**, bukan dari catatan saat mengunduh. Perintah persis:
  - `curl -s 'https://api.gbif.org/v1/species/match?name=<nama>'` → 15/15 `matchType = EXACT`
  - `curl -s 'https://api.gbif.org/v1/occurrence/search?taxonKey=<key>&limit=0&facet=country&facetLimit=250&facet=year'`
  - `curl -s 'https://api.gbif.org/v1/occurrence/search?taxonKey=<key>&country=ID&limit=300'` → seluruhnya `endOfRecords=true`
  - Pembacaan ulang dengan `python3` modul `json`: cacah `count`, cacah `results`, sebaran `license`, `basisOfRecord`, `stateProvince`
  - `shasum -a 256 raw/*` → `SHA256SUMS.txt` (45 baris)
  - **Tanpa kunci API.** GBIF tidak meminta akun untuk rute ini.
- **Keterbatasan / masalah kualitas**:
  1. **Empat organisme punya NOL rekaman Indonesia** — dan tiga di antaranya justru penyakit utama bawang merah:
     - *Fusarium oxysporum* f.sp. *cepae* (**moler**) — 0
     - *Peronospora destructor* (embun bulu) — 0
     - *Botrytis allii* (busuk umbi/leher) — 0
     - *Phytophthora infestans* (busuk daun kentang) — 0

     Moler adalah penyakit paling merusak pada bawang merah di Brebes dan Nganjuk, dan busuk daun adalah masalah kentang paling besar di Dieng; keduanya nol di GBIF. **Ketiadaan rekaman di sini bukan bukti ketiadaan patogen** — ini cerminan tidak adanya penyetoran data dari Indonesia, bukan keadaan lapangan.
  2. **Nyaris tidak ada resolusi sub-nasional.** Dari 610 rekaman Indonesia, hanya **30 yang punya `stateProvince`**, dengan hanya **5 nilai berbeda**: Sumatera Barat (14), Jawa (9), Irian Jaya (3), Sulawesi Utara (3), Sumatera (1). "Jawa" dan "Sumatera" bukan provinsi, dan "Irian Jaya" sudah usang. **Tidak bisa dipakai untuk peta risiko provinsi/kabupaten.**
  3. **Sebagian besar bukan pengamatan penyakit di lapangan.** `basisOfRecord` untuk rekaman Indonesia: `MATERIAL_SAMPLE` 406, `PRESERVED_SPECIMEN` 97, `LIVING_SPECIMEN` 82, `OCCURRENCE` 24, `OBSERVATION` **1**. Mayoritas `MATERIAL_SAMPLE` berasal dari penyetoran sekuens (GenBank/UNITE), yaitu isolat di laboratorium — **bukan** catatan serangan di pertanaman. Tidak ada informasi keparahan, luas serangan, atau kerugian hasil.
  4. **Koordinat sering kosong.** Rekaman contoh (*Alternaria porri*, key 6189442843, 2023) punya `decimalLatitude = None`, `decimalLongitude = None`, `locality = None`, `stateProvince = None` — yang tersisa hanya "Indonesia" dan tanggal.
  5. **Satu pencocokan nama perlu hati-hati.** *Fusarium oxysporum* f. sp. *cepae* cocok sebagai **`status = SYNONYM`, `rank = FORM`, confidence 93** — bukan spesies yang diterima. Cacah 72 okurensi globalnya karena itu tidak sebanding dengan takson tingkat spesies lain, dan bisa berubah bila backbone GBIF diperbarui.
  6. **Bias geografis kuat ke negara kaya-data.** *Spodoptera exigua*: Britania Raya 11.081 lawan Indonesia 50. *Stemphylium vesicarium*: Britania Raya 1.013, Indonesia 2. Cacah negara mencerminkan **intensitas pengumpulan data**, bukan intensitas serangan. Jangan sekali-kali dibaca sebagai peta risiko.
  7. **Tanpa DOI, tidak bisa direproduksi persis.** Rute unduhan GBIF ber-DOI membutuhkan akun, jadi snapshot ini tidak punya identitas permanen. Hasil yang sama besok bisa berbeda karena basis datanya hidup.
  8. **Batas teknis API** (terukur, bukan dibaca dari dokumentasi): `limit` dipaksa maksimum **300**, dan offset maksimum **100.001**. Seluruh takson di sini jauh di bawah batas itu untuk `country=ID`, sehingga tidak ada yang terpotong.
  9. **Data pribadi**: medan `recordedBy` / `identifiedBy` bisa memuat **nama kolektor perorangan**. Pada rekaman contoh keduanya `None`, tetapi medan itu ada di skema dan terisi pada sebagian rekaman. **Jangan menyebarkan medan `recordedBy`/`identifiedBy` ke antarmuka publik Pranatani**; pakai hanya untuk penelusuran internal.

## Catatan lintas-agen

Lima takson di sini melayani komoditas lain: *Phytophthora infestans* & *Alternaria solani* (**kentang, tomat**), *Ralstonia solanacearum* (**tomat, cabai, kentang**), *Bemisia tabaci* (**cabai, tomat** — vektor virus kuning). Rujuk `datasets/additional/BWM-06-gbif-okurensi-patogen/raw/`, jangan panen ulang.
