# Potato Viral Disease Dataset on both Foliar and Tuber

- **dataset_id**: KEN-02-virus-daun-umbi-mendeley
- **Tanaman**: Kentang (*Solanum tuberosum*) — **daun dan umbi**
- **Penyakit/kelas tercakup**:
  - daun (`Potato Leaf.zip`): `Mosaic_leaf` (virus mosaik), `PLRV_leaf` (Potato Leaf Roll Virus),
    `Healthy Leaf Images`
  - umbi (`Potato Tuber.zip`): `PSTVD` (Potato Spindle Tuber Viroid), `PVY tuber cracking`
    (retak umbi akibat PVY), `Crackingtype`
  - umbi asli (`PSTVD.zip`): 85 citra PSTVd resolusi penuh
- **Jenis data**: gambar
- **Format**: JPG dalam ZIP (tiga arsip terpisah)
- **Jumlah**: **6.565 gambar terunduh** — 3.240 daun + 3.240 umbi (keduanya turunan augmentasi)
  + 85 umbi asli. Penerbit menyatakan **1.972 citra asli** untuk keseluruhan dataset:
  Mosaic 666, PLRV 527, Healthy leaf 135, PSTVD 85, PVY cracking 559.
- **Sumber**: Mendeley Data
- **URL sumber**: https://data.mendeley.com/datasets/rgfhzd5mzw/1
- **DOI**: 10.17632/rgfhzd5mzw.1
- **Pembuat**: Megha Rani Raigonda; Sujata P Terdal; Rajkumar Bainoor
- **Tahun terbit / pembaruan**: 2022-11-21 (versi 1)
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: sebut pembuat, DOI, sumber, dan lisensi; nyatakan bila ada perubahan.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 617.004.491 byte (588,4 MB) untuk 3 berkas dari 7 berkas yang tersedia
- **SHA-256**: lihat `SHA256SUMS.txt`
- **Status unduh**: diunduh
- **Status verifikasi**: sebagian
- **Cara verifikasi**:
  - `file -b raw/*.zip` → ketiganya `Zip archive data ... compression method=store`
  - `unzip -tqq` → ketiganya lolos tanpa CRC error
  - cacah: `Potato Leaf.zip` 3.240 (1.080 x 3 kelas), `Potato Tuber.zip` 3.240 (1.080 x 3 kelas),
    `PSTVD.zip` 85
  - rerata ukuran berkas: 3,9 KB / 5,0 KB / **6.768 KB** — lihat `struktur.txt` untuk
    penalaran lengkap mengapa dua yang pertama pasti turunan
- **Keterbatasan / masalah kualitas**:
  - **`Potato Leaf.zip` dan `Potato Tuber.zip` bukan citra asli.** Keduanya berisi tepat
    1.080 gambar per kelas — angka yang mustahil bagi cacah asli (85 sampai 666 per kelas) —
    dengan rerata 4–5 KB per berkas dan pola nama khas `ImageDataGenerator`
    (`Crackingtype_0_578104.jpg`). Ini hasil augmentasi + pengecilan yang sudah diseimbangkan.
  - Akibatnya **split acak per berkas akan bocor**: banyak turunan berasal dari satu induk,
    dan pemetaan induk→turunan tidak disertakan.
  - `PSTVD.zip` sebaliknya **asli**: nama berkas `DSC_0140.JPG` (Nikon D90), rerata 6,61 MB,
    dan cacahnya 85 persis sama dengan klaim penerbit. Ini satu-satunya bagian dataset ini
    yang layak dipakai untuk mengukur kinerja sebenarnya pada citra umbi.
  - **4 dari 7 berkas tidak diunduh** karena batas ukuran (dataset penuh ~8,9 GB > batas 3 GB).
    Yang dilewati: `Crackingtype.zip` (3.399 MB), `Mosaic_leaf.zip` (2.552 MB),
    `PLRV_leaf.zip` (2.024 MB), `Healthy leaf images.zip` (284 MB). Semuanya citra asli
    resolusi penuh dan dapat diunduh terpisah bila batas dinaikkan.
  - **Latar hitam seragam**: penerbit menyatakan daun/umbi diletakkan di atas latar hitam
    saat pemotretan. Jadi dataset ini **bukan** citra lapangan apa adanya — kelemahannya
    sama dengan PlantVillage, meski objeknya diambil dari pertanaman nyata.
  - Ambiguitas kelas: `Crackingtype` dan `PVY tuber cracking` sama-sama "retak umbi";
    penerbit menyebut retak PVY bersifat **non-infeksius**. Batas antara keduanya tidak
    dijelaskan dan berpotensi tumpang tindih.
  - Label virus ditegakkan dari gejala visual; penerbit menyebut ELISA/RT-PCR sebagai
    pembanding yang ingin digantikan, bukan sebagai konfirmasi tiap citra.
  - Asal: pertanaman University of Agricultural Sciences, Dharwad (India), sebagian benih
    bersertifikat dari Modipuram, sebagian tidak; sebagian citra dari ICAR-CPRI Shimla.
    Bukan Indonesia.

## Nilai khas

Ini **satu-satunya dataset dalam panen ini yang memasangkan gejala daun dan gejala umbi
untuk patogen yang sama**, dan satu dari hanya dua yang memuat citra umbi sama sekali
(bersama KEN-01 dan KEN-08). PSTVd dan retak umbi PVY tidak ada di dataset kentang mana pun
yang lain yang ditemukan.
