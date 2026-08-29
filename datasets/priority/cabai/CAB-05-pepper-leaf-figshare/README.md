# Pepper Leaf DataSet

- **dataset_id**: CAB-05-pepper-leaf-figshare
- **Tanaman**: Paprika / cabai besar manis (*Capsicum annuum* var. *grossum*) — **bukan** cabai
  rawit/keriting Indonesia. Lihat bagian Keterbatasan.
- **Penyakit/kelas tercakup** (nama folder apa adanya): `Pepper__bell___healthy`, `Leaf_Curl`,
  `Pepper__bell___Bacterial_spot_Leaf_Curl_Cercospora`, `Cerespora` (ejaan asli, seharusnya
  *Cercospora*)
- **Jenis data**: gambar
- **Format**: JPG/PNG/WEBP dalam ZIP
- **Jumlah**: diklaim "423 gambar resolusi tinggi" pada deskripsi, terhitung **1.308** berkas gambar
  (1.293 .jpg, 7 .png, 6 .webp, 2 .jpeg), **hanya 992 di antaranya unik** (316 salinan
  byte-identik, 24,2%). Per folder: healthy 446 · Leaf_Curl 335 ·
  Bacterial_spot_Leaf_Curl_Cercospora 301 · Cerespora 226.
- **Sumber**: figshare
- **URL sumber**: https://figshare.com/articles/dataset/Pepper_Leaf_DataSet/29298239
- **DOI**: 10.6084/m9.figshare.29298239.v1
- **Pembuat**: Salma Asiya Begum Shaik
- **Tahun terbit / pembaruan**: 2025-06-11
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: sebut pencipta dan DOI, tandai bila diubah.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 28.235.125 byte (26,93 MiB)
- **SHA-256**: `1bdcc96f3978c80bbbc679d25fa24771ca2a67536e274c74a5e4f259617fc3a5`
- **Status unduh**: diunduh
- **Status verifikasi**: sebagian (arsip utuh, tetapi label kelasnya terbukti tidak sahih)
- **Cara verifikasi**:
  - `unzip -tqq raw/Pepper_Dataset.zip` → tanpa galat.
  - `md5 -q raw/Pepper_Dataset.zip` → `622df1a94116c165832ae09f38412937`, **cocok** dengan
    `computed_md5` Figshare API.
  - Cacah per folder + analisis pola nama berkas dengan `python3` + `zipfile`; hasil di `struktur.txt`.
- **Keterbatasan / masalah kualitas**: **berat — jangan dipakai untuk melatih model tanpa
  pelabelan ulang.**
  1. **Turunan PlantVillage yang salah label.** Pola nama berkas
     (`<uuid>___JR_B.Spot NNNN.JPG`, `<uuid>___JR_HL NNNN.JPG`, `NREC_B.Spot`) adalah konvensi
     penamaan PlantVillage untuk paprika. Cacah pola per folder:
     - `Cerespora` (226 berkas): 108 di antaranya berkas **B.Spot** PlantVillage (bercak bakteri),
       dilabeli Cercospora.
     - `Leaf_Curl` (335 berkas): **315** di antaranya berkas **B.Spot** PlantVillage, 2 berkas
       **HL** (daun sehat) — hanya 18 berkas yang bukan keduanya. Praktis tidak ada daun keriting
       sungguhan di folder ini.
     - `Pepper__bell___Bacterial_spot_Leaf_Curl_Cercospora` (301 berkas): 301/301 berkas B.Spot;
       nama kelasnya sendiri gabungan tiga penyakit sekaligus, tidak bermakna sebagai label.
     - `Pepper__bell___healthy` (446 berkas): 446/446 berkas HL PlantVillage — satu-satunya folder
       yang labelnya konsisten.
  2. **24,2% duplikat byte-identik**: SHA-256 seluruh 1.308 gambar menghasilkan hanya **992**
     nilai unik (316 salinan berlebih), sebagian besar dari pasangan `... - Copy.jpg` di folder
     `Leaf_Curl`. Angka efektifnya 992, bukan 1.308.
  3. Latar studio/seragam (ciri khas PlantVillage): daun tunggal dipetik di atas latar polos,
     tidak mewakili kondisi lapangan.
  4. Paprika ≠ cabai Indonesia (lihat bawah).
  5. Deskripsi Figshare berisi potongan nomor baris naskah ("423", "424", "425"…) yang ikut
     tersalin — tanda metadata disiapkan seadanya.

## Paprika (bell pepper) vs cabai Indonesia

`Pepper__bell___Bacterial_spot` dan `Pepper__bell___healthy` adalah dua kelas PlantVillage
(dimiliki **agen tomat**, lihat `datasets/additional/TOM-01-plantvillage`) dan PlantDoc (dimiliki
**agen kentang**, `datasets/additional/KEN-04-plantdoc-lapangan`). Keduanya **tidak diunduh ulang**
oleh agen cabai.

Bedanya penting untuk Pranatani:

| | Paprika / bell pepper | Cabai Indonesia (rawit, keriting, merah besar) |
|---|---|---|
| Takson | *Capsicum annuum* var. *grossum* | *C. annuum* (keriting, merah besar), *C. frutescens* (rawit) |
| Bentuk daun | lebar, tebal, hijau gelap, tepi rata | lebih kecil, lebih tipis, lebih lancip |
| Penanaman | umumnya greenhouse dataran tinggi | lahan terbuka, dataran rendah–menengah |
| Penyakit dominan di label | *Xanthomonas* bacterial spot | antraknosa/patek (*Colletotrichum* spp.), virus kuning keriting (Begomovirus), layu fusarium, layu bakteri *Ralstonia* |

Konsekuensinya: kelas `Pepper__bell___Bacterial_spot` **tidak** boleh dipakai sebagai proksi untuk
penyakit cabai Indonesia. Bercak bakteri bukan penyakit utama cabai di Indonesia, morfologi daunnya
berbeda, dan latar studio PlantVillage tidak cocok dengan foto ponsel petani di lapangan.
