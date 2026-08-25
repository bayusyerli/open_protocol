# Laporan Agen Kentang (prefiks `KEN`)

Tanggal panen: **2026-08-25** · Direktori kerja: `/Users/syera/open_protocol`
Kontrak: `datasets/metadata/KETENTUAN.md`
Katalog: `datasets/metadata/rows/kentang.csv` (24 baris) · Klaim: `datasets/metadata/klaim/kentang.tsv` (14 baris)

## Ringkasan cacah

| status | jumlah | keterangan |
|---|---:|---|
| `diunduh` | **14** | 12 di `priority/kentang/`, 2 di `additional/` |
| `ditolak` | 4 | 2 rekaman perangkat lunak tanpa berkas, 2 duplikasi agen tomat |
| `terlalu-besar` | 2 | 8,94 GB / 37,5 GB |
| `ditemukan` | 2 | berkas ada tapi tidak praktis/tidak berlabel |
| `terhalang-akun` | 2 | ScabyNet (permintaan ke penulis), Roboflow (akun) |
| `gagal` | **0** | — |
| **total kandidat** | **24** | |

Verifikasi: **10 `terverifikasi`**, 4 `sebagian`, 4 `belum`, 6 `tidak-berlaku`.
Total terunduh: **6,35 GB** dari anggaran 8 GB. Tidak ada satu dataset pun melewati batas 3 GB.
Seluruh 14 arsip **sudah dibuka dan diuji** (`unzip -tqq` lolos tanpa CRC error) dan
**seluruh SHA256SUMS.txt lolos `shasum -c`** tanpa satu pun kegagalan.

> ### Koreksi penting: Zenodo tidak memblokir jaringan ini
>
> Putaran pertama panen ini menyimpulkan `zenodo.org` memblokir jaringan secara permanen
> setelah HTTP 403 berulang, dan menjatuhkan 4 dataset ke status `gagal`. **Kesimpulan itu
> salah.** Penyebab sebenarnya adalah **pembatasan laju** yang saya picu sendiri dengan
> menembakkan enam permintaan API Zenodo secara paralel dalam satu panggilan.
>
> Diulang dengan disiplin laju — User-Agent penuh
> `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)`, **satu permintaan pada satu waktu**,
> `--retry 4 --retry-delay 15 --retry-all-errors` — **keempatnya berhasil diunduh**.
> Termasuk **Hybrid Potato Tuber (36.000 citra umbi)** yang sebelumnya disebut sebagai
> kehilangan terbesar panen.
>
> Pelajaran: 403 dari repositori data publik **jangan dibaca sebagai penyaringan permanen**
> sebelum dicoba ulang dengan laju yang direm. Uji negatif yang saya lakukan waktu itu
> (`/api`, `/records`, jalur berkas, IPv4 paksa) semuanya dijalankan dalam jendela
> pembatasan yang sama, sehingga semuanya gagal karena satu sebab yang sama — dan tampak
> seperti bukti kuat padahal bukan.

---

## 1. Berhasil diunduh

### Sisi umbi — inti permintaan pengguna

**KEN-01 · PotatoCare** — `datasets/priority/kentang/KEN-01-potatocare-umbi-mendeley`
3.905 gambar umbi, 10 kelas, CC BY 4.0, DOI `10.17632/7vm7xskfg4.2`, 90,2 MB.
Kelas: Dry Rot 1.355 · Healthy 815 · Blackspot Bruising 770 · Soft Rot 560 · Brown Rot 105 ·
Miscellaneous 74 · Common Scab 60 · Blackleg 60 · Pink Rot 57 · Black Scurf 49.
**Tetap tulang punggung diagnosis umbi** karena satu-satunya dengan 10 kelas bernama patogen.
Diklaim 10.117, terhitung 3.905 → `sebagian`.

**KEN-10 · Hybrid Potato Tuber Dataset** — `.../KEN-10-hybrid-tuber-zenodo` **(baru)**
**36.000 gambar umbi**, CC BY 4.0, DOI `10.5281/zenodo.20616990`, 182,9 MB. `terverifikasi`.
Cacah **sama persis dengan klaim**; **MD5 cocok dengan checksum terbitan Zenodo**
(`468ed3a9e2e9e1c509cd38e0f42282a9`). Split bawaan train 23.040 / test 7.200 / val 5.760;
`Buen estado` 18.000 vs `Defectuoso` 18.000. Uji kebocoran: **0 nama berkas muncul di lebih
dari satu split**, indeks 1..18.000 per kelas tanpa lubang.
**Tetapi hanya biner** — subkategori cacat (luka / bertunas / busuk) tidak dilabeli, jadi
**tidak dapat dipetakan ke nama patogen**. Perannya **penapisan mutu umbi (grading)**,
bukan diagnosis.

**KEN-02 · Potato Viral Disease (daun + umbi)** — `.../KEN-02-virus-daun-umbi-mendeley`
6.565 gambar, CC BY 4.0, DOI `10.17632/rgfhzd5mzw.1`, 588,4 MB (3 dari 7 berkas).
**Satu-satunya yang memasangkan gejala daun dan umbi untuk patogen yang sama.**
`PSTVD.zip` berisi **85 citra asli resolusi penuh** (Nikon D90); dua zip lain turunan augmentasi.

**KEN-08 · Potato Crop Disease Augmentation** — `.../KEN-08-umbi-augmentasi-mendeley`
138.000 gambar (23.000 × 6 kelas), CC BY 4.0, DOI `10.17632/2rsrxwck2r.1`, 708,4 MB.
Menutup **gangren** dan **busuk akar ungu** yang tidak ada di mana pun lagi, tetapi
**nol citra asli** — rujukan visual saja, bukan data latih/uji.

### Sisi daun

**KEN-11 · Annotated Potato Foliar Disease (YOLOv8)** — `.../KEN-11-foliar-yolov8-zenodo` **(baru)**
3.060 gambar + **3.060 kotak-batas**, **CC BY-NC 4.0**, DOI `10.5281/zenodo.20247345`, 647,4 MB.
`terverifikasi` — ukuran byte dan cacah sama persis dengan klaim; 0 berkas label kosong.
Kelas: `Alternaria` 1.057 · `Lancha` (late blight) 1.072 · `Septoria` 548 · `Sana` 383.
Split terstratifikasi 2.448/306/306. **Satu-satunya daun kentang berlabel YOLO siap latih**
dan **satu-satunya sumber kelas Septoria** pada kentang.

**KEN-15 · Stage-wise late blight (supporting data)** — `.../KEN-15-stagewise-hawar-zenodo` **(baru)**
**1.561 citra daun kentang ASLI LAPANGAN** 640×640, CC BY 4.0, DOI `10.5281/zenodo.22059910`,
139,8 MB. `terverifikasi` — cacah sama persis dengan klaim.
**Tetapi tanpa label**: `DATA_PROVENANCE.md` di dalam arsip menyatakan terus terang bahwa
label kelas (Healthy/ILB/ALB), anotasi kotak-batas, dan manifes split **tidak disertakan**
karena tidak tersimpan di arsip proyek — dan penulis **memilih tidak merekonstruksinya**.
Ke-16 CSV-nya adalah keluaran evaluasi model, bukan label gambar.

**KEN-16 · PLDD-UP subset `LB.zip`** — `.../KEN-16-pldd-up-lb-mendeley` **(baru)**
**6.116 citra hawar daun lapangan asli** (6.069 unik), CC BY 4.0, DOI `10.17632/3j4nfkvp2n.1`,
2,32 GB. `terverifikasi` — **SHA-256 cocok dengan hash terbitan Mendeley**, cacah sama persis
dengan klaim. **Hanya `LB.zip` yang diambil**; `EB.zip` (2.766 MB) dan `Healthy.zip` (3.683 MB)
tidak diunduh karena dataset penuhnya 8,77 GB.
**Asli, bukan augmentasi** — tidak ada penanda `aug_`, nama bergaya kamera berurut,
rerata 0,39 MB/berkas, dan **32 dimensi berbeda**.
**Tumpang tindih: 0 hash bersama dengan KEN-15 maupun PlantVillage.**
Tetapi klaim penerbit *"original resolutions"* **tidak sepenuhnya benar**: 975 gambar (15,9%)
berukuran tepat **224×224** — ukuran masukan CNN — dalam blok indeks bersambung 13..1029.
**Hanya satu kelas**, jadi tidak bisa melatih pengklasifikasi sendirian.

**KEN-03 · Potato Leaf Disease Dataset (BARI, Bangladesh)** — `.../KEN-03-daun-kentang-mendeley`
2.351 gambar, 6 kelas, CC BY 4.0, 36,6 MB. **Seluruh berkas berawalan `aug_`**.

### Epidemiologi (tabular)

**KEN-06 · CIP genebank core collection** — 1.517 baris petak, `lb1`–`lb5` + AUDPC, CC BY 4.0.
**KEN-07 · CIP LBHTC2** — 5.808 baris petak, 2.755 genotipe, `LB1`–`LB7` + AUDPC, CC BY 4.0.
**KEN-09 · CIP integrated management** — 309 baris uji fungisida berimbang (103/103/103),
2010–2014, 4 lokasi Kenya ber-GeoNames. **Lisensi tidak dinyatakan.**

**KEN-14 · Multi-year phenotypic dataset (Vietnam utara)** — `.../KEN-14-fenotip-multitahun-zenodo` **(baru)**
426 baris (142 × 3 tahun), 47 genotipe, 29 kolom, CC BY 4.0, DOI `10.5281/zenodo.21774103`,
0,1 MB. `terverifikasi`. Diurai langsung dari XML di dalam XLSX dengan `zipfile` +
`ElementTree`, **tanpa menjalankan makro apa pun**.
Kolom penyakit: **Late blight**, **Virus**, **Rhizoctonia**, plus hama Aphid dan Mite.
Dua nilai khas: (1) **satu-satunya berkas tabular yang mengukur *Rhizoctonia solani***
— patogen black scurf, kelas citra paling tipis; (2) **asal Vietnam utara, analog agroklimat
terdekat dengan Dieng/Pangalengan/Modoinding** di antara seluruh sumber tabular.

### Dataset tambahan (multi-tanaman → `additional/`)

**KEN-04 · PlantDoc klasifikasi (Cropped-PlantDoc)** — 2.579 gambar (klaim 2.598), 28 kelas,
13 spesies, CC BY 4.0, 938,8 MB.
**Kentang: 222 gambar / 2 kelas** — **tidak ada kelas sehat**. **Tomat: 746 gambar / 9 kelas.**

**KEN-05 · PlantDoc Object Detection** — 2.594 gambar, **8.921 kotak-batas**, CC BY 4.0,
948,7 MB. `terverifikasi`. **Anotasi ikut, dua format:**
- **PASCAL VOC XML** per gambar (2.593 berkas), `<object><name>…<bndbox>`;
- **CSV rata** `train_labels.csv`/`test_labels.csv`,
  kolom `filename,width,height,class,xmin,ymin,xmax,ymax`.

Kentang: **594 kotak / 3 kelas** — di sini **ada** `Potato leaf` sehat (11 kotak, hanya `train`),
yang tidak ada di varian klasifikasi. Tomat: 2.932 kotak / 9 kelas.

> Gambar KEN-04 dan KEN-05 **bertumpang tindih** — jangan dicampur dalam satu split.

> **Jebakan teknis Dataverse.** `?format=original` pada
> `data.cipotato.org/api/access/datafile/<id>` mengembalikan **XLSX** meski nama berkasnya
> `.tab`. Ketiga dataset CIP diunduh **tanpa** parameter itu. Ketahuan lewat `file`
> sesuai KETENTUAN bagian 2.7, lalu diunduh ulang.

---

## 2. Ditemukan tapi belum bisa diunduh

### Terlalu besar (2 dataset)

| id | dataset | ukuran | catatan |
|---|---|---:|---|
| KEN-17 | **Diamant Potato** ROI + surface defect (`10.17632/4vty9rz7zw.1`) | 8,94 GB | `roi_dataset.zip` 5.024 MB + `defect_dataset.zip` 3.918 MB — **keduanya sendiri sudah >3 GB**. Kandidat **terbaik** untuk grading umbi bersegmentasi instance. CC BY 4.0. |
| KEN-18 | Mikroskopi optik umbi (`10.6084/m9.figshare.12206270`) | 37,5 GB | 15.938 citra mikroskopi. **Bukan penyakit** — penilaian sel/jaringan. CC0. Relevansi rendah. |

> **Catatan**: `KEN-16` (PLDD-UP) sebelumnya ada di tabel ini. Rekomendasi putaran lalu —
> ambil `LB.zip` saja karena 2,32 GB muat di bawah batas 3 GB — **sudah dijalankan**, dan
> subsetnya kini berstatus `diunduh` (lihat bagian 1). `EB.zip` dan `Healthy.zip` tetap
> di luar jangkauan batas ukuran.

### Ada tapi tidak praktis (2 dataset)

- **KEN-19 · SFLD Solanaceae** (`10.17632/sd5m3mgvvx.1`, CC BY 4.0) — **rekaman penunjuk**:
  hanya `image.png` + `SFLD_Dataset.txt` (133 byte) berisi tautan folder Google Drive.
  Memuat **terung, kentang, tomat** (2.593 asli + 17.000 augmentasi).
- **KEN-20 · Sample dataset field blight** (`10.17632/pbnw43s6kt.1`, CC BY 4.0) — 1,015 GB
  dalam **305 berkas JPG lepas**. Deskripsinya menjanjikan anotasi manual, tetapi daftar
  berkas menunjukkan **nol berkas non-gambar** — tidak ada anotasi sama sekali.

### Terhalang akun (2 dataset)

- **KEN-21 · ScabyNet** — data *"not publicly available due to being obtained from a commercial
  breeding program"*, hanya atas permintaan ke penulis. Tidak ditembus (KETENTUAN 2.1).
- **KEN-22 · Roboflow `potato-classification-s4djh`** — 1.494 gambar cacat umbi; butuh
  akun/kunci API. Tidak ditembus.

---

## 3. Ditolak beserta alasan

| id | dataset | alasan |
|---|---|---|
| KEN-23 | CIP **Lateblight Advisor** (`10.21223/P3/PIH5W1`) | Dashboard Python Shiny; API menunjukkan **nol berkas terlampir**. KETENTUAN bagian 5. |
| KEN-24 | CIP **Digital Decision Support Tool** (`10.21223/EVRRAX`) | **Nol berkas terlampir** meski CC BY 4.0. Rekaman alat, bukan dataset. |
| KEN-12 | PhytoScope (`10.5281/zenodo.21383492`) | **Duplikasi** — diklaim agen tomat. |
| KEN-13 | Soil-Weather Multivariate (`10.5281/zenodo.19885785`) | **Duplikasi** — diklaim agen tomat. |

Tidak dimasukkan ke katalog sama sekali karena jelas bukan dataset: artikel ResearchGate/jurnal
tentang CNN penyakit kentang, halaman AHDB "Potato Disease Identification", halaman preprint.
Tautan di dalam artikel tetap ditelusuri sampai ke berkasnya — begitulah KEN-21 dan KEN-18 ditemukan.

## 4. Duplikasi yang dicegah

Diperiksa terhadap **seluruh** `datasets/metadata/klaim/*.tsv`.

| dataset | diklaim oleh | `local_path` milik agen itu |
|---|---|---|
| **PlantVillage** | agen tomat, `TOM-01-plantvillage` | `datasets/additional/TOM-01-plantvillage` |
| **PhytoScope** (`zenodo.21383492`) | agen tomat, `TOM-12-phytoscope-lapangan` | `datasets/additional/TOM-12-phytoscope-lapangan` |
| **Soil-Weather Multivariate** (`zenodo.19885785`) | agen tomat, `TOM-10-cuaca-tanah-tabular` | `datasets/additional/TOM-10-cuaca-tanah-tabular` |
| **Pota-Toma-To / AgroGuard** (`10.17632/354fsxwccb.1`) | agen tomat, `TOM-09-agroguard-kentang-tomat` | `datasets/priority/tomat/TOM-09-agroguard-kentang-tomat` |

1. **PlantVillage memuat kelas kentang** (early blight, late blight, **healthy**). Tidak diunduh
   ulang. Ini **satu-satunya sumber kelas kentang sehat berjumlah memadai** dalam panen bersama.
2. **`TOM-09-agroguard` adalah dataset kentang+tomat** — ditemukan lewat berkas klaim.
3. **KEN-11 yang kini berhasil diunduh mengandung PlantVillage di dalamnya**: 2.152 dari 3.060
   citranya (70%) berasal dari sana. Jadi **tambahan bersih KEN-11 hanya ~908 citra lapangan
   Ekuador** — jangan menjumlahkan 3.060 dengan cacah PlantVillage milik agen tomat.

Statistik serangan OPT Indonesia **tidak disentuh** (milik agen bawang merah: `BWM-04`, `BWM-07`).

## 5. Kekurangan data & rekomendasi lanjutan

### Apakah sisi umbi tertutup? **Ya — dan sekarang jauh lebih kuat.**

| penyakit | patogen | sumber | citra asli |
|---|---|---|---:|
| Busuk kering | *Fusarium* spp. | KEN-01 + KEN-08 | 1.355 |
| Busuk lunak/basah | *Pectobacterium* | KEN-01 | 560 |
| Busuk coklat | *Ralstonia solanacearum* | KEN-01 | 105 |
| Kudis (common scab) | *Streptomyces scabies* | KEN-01 + KEN-08 | **60** |
| Blackleg | *Pectobacterium/Dickeya* | KEN-01 | 60 |
| Busuk merah muda | *Phytophthora erythroseptica* | KEN-01 | 57 |
| Black scurf | *Rhizoctonia solani* | KEN-01 (+ skor lapangan KEN-14) | **49** |
| PSTVd | viroid | KEN-02 | 85 |
| Retak umbi PVY | *Potato virus Y* | KEN-02 | 0 (hanya augmentasi) |
| Gangren | *Boeremia foveata* | KEN-08 saja | **0** |
| Busuk akar ungu | *Helicobasidium purpureum* | KEN-08 saja | **0** |
| *cacat umum (biner)* | — | **KEN-10** | **36.000** |

**Yang berubah dengan masuknya KEN-10**: sisi umbi kini punya **36.000 citra** untuk tugas
**penapisan biner** (baik vs cacat) — cukup besar untuk melatih penyaring mutu yang serius.

**Yang TIDAK berubah**: KEN-10 **tidak menambah satu pun citra berlabel patogen**, karena
kelasnya hanya `Buen estado`/`Defectuoso`. Jadi **kelemahan diagnosis tetap persis seperti
sebelumnya**: common scab 60 dan black scurf 49 citra asli. Untuk **membedakan** kudis dari
black scurf — pembedaan yang penting karena penanganannya berbeda — jumlah itu masih di bawah
ambang praktis. Naiknya angka total dari 4.212 ke 8.833 **tidak menyentuh celah ini sama sekali**.

**Masih kosong sama sekali**: **silver scurf** (*Helminthosporium solani*), **powdery scab**
(*Spongospora subterranea*), **nematoda sista** (*Globodera*). Nol citra, nol data.
Di sisi daun, **Verticillium wilt** juga nol.

### Hitung ulang: citra asli lawan augmentasi

| golongan | jumlah | dataset |
|---|---:|---|
| **asli terverifikasi** | **14.885** | **KEN-16 6.069** · KEN-01 3.905 · KEN-11 3.060 · KEN-15 1.544 · KEN-04 (porsi kentang) 222 · KEN-02 PSTVd 85 |
| augmentasi murni | 146.831 | KEN-08 138.000 · KEN-02 zip kecil 6.480 · KEN-03 2.351 |
| provenans tak terverifikasi | 36.000 | KEN-10 |
| **total** | **197.716** | |

**Perkembangan lintas tiga putaran:**

| putaran | asli terverifikasi | porsi terhadap total |
|---|---:|---:|
| awal (sebelum Zenodo dipulihkan) | 4.212 | 2,8% |
| setelah 4 dataset Zenodo masuk | 8.816 | 4,6% |
| **setelah KEN-16 masuk** | **14.885** | **7,5%** |

Basis citra asli kini **3,5 kali lipat** angka awal. KEN-16 sendirian menyumbang **6.069**
— kenaikan **69%** dalam satu unduhan, dan menjadikannya **penyumbang citra asli terbesar
kedua** setelah KEN-01.

**Angka yang lebih konservatif**, karena tumpang tindih sudah terbukti muncul berulang:

- potong 2.152 duplikasi PlantVillage di dalam KEN-11 → **12.733** asli unik lintas dataset;
- potong juga 92 pasangan KEN-16 yang punya versi 224×224 dan versi berdimensi lain
  (kemungkinan foto sama pada dua ukuran, tak terdeteksi hash) → **12.641**.

**Dua koreksi terhadap angka putaran sebelumnya**, hasil pemeriksaan hash per gambar:

1. **KEN-15 turun dari 1.561 menjadi 1.544.** Pemeriksaan SHA-256 atas seluruh berkasnya
   menemukan hanya 1.544 hash unik — **17 pasang berkas identik bita per bita**. Karena
   label pun tidak ada, duplikat itu tak dapat ditelusuri ke kelas mana pun.
2. **KEN-16 dihitung 6.069, bukan 6.116** — 47 berkas duplikat identik bita disingkirkan.

**KEN-10 tetap tidak dihitung sebagai asli.** Penomoran ulang 1..18.000 menghapus provenans,
dan penerbit menyatakan dataset itu menggabungkan beberapa sumber publik — sehingga tidak
dapat dipastikan apakah augmentasi diterapkan sebelum pemisahan split.

**Yang berubah secara praktis**: sebelum KEN-16, basis citra asli **berlabel** yang bisa
langsung dilatih hanya KEN-01 (3.905, umbi) dan KEN-11 (3.060, daun). KEN-15 asli tetapi
tanpa label. Kini ada **6.069 citra hawar daun lapangan berlabel** tambahan — cukup untuk
melatih detektor hawar daun yang serius, asalkan kelas pembandingnya diambil dari dataset lain.

**Yang tidak berubah**: porsi asli terhadap total tetap kecil (7,5%) karena KEN-08 sendirian
menyumbang 138.000 citra sintetis. **Angka "jumlah gambar" panen ini tetap menyesatkan bila
dibaca mentah.**

### Catatan: klaim penerbit KEN-16 tidak lolos pemeriksaan

Penerbit PLDD-UP menyatakan *"all images have been preserved in their original resolutions"*.
Pengukuran dimensi seluruh 6.116 berkas (membaca penanda SOF pada header JPEG) menunjukkan:

| dimensi | jumlah | porsi | tafsir |
|---|---:|---:|---|
| 719×1600 | 2.528 | 41,3% | bukan dimensi kamera lazim |
| 1600×719 | 1.001 | 16,4% | idem, orientasi mendatar |
| **224×224** | **975** | **15,9%** | **ukuran masukan CNN baku — mustahil keluaran kamera** |
| 3468×4624 | 696 | 11,4% | foto ponsel resolusi penuh |
| 8160×3672 | 625 | 10,2% | panorama resolusi penuh |
| 4624×3468 | 235 | 3,8% | resolusi penuh |
| 4496×3000 | 29 | 0,5% | resolusi penuh |
| 25 dimensi lain | 27 | 0,4% | — |

Hanya **25,9%** yang benar-benar berdimensi kamera resolusi penuh. Blok 224×224 menempati
**indeks bersambung 13..1029** — pola khas kumpulan yang **digabungkan dari sumber lain yang
sudah dipraproses**, bukan hasil satu kampanye pemotretan sendiri seperti yang dinyatakan.

Ini **tidak** membatalkan status "asli": citranya tetap foto nyata dengan korespondensi satu
lawan satu terhadap pengambilan sungguhan, bukan turunan sintetis yang menggandakan satu induk.
Tetapi klaim resolusinya perlu dicatat sebagai **tidak akurat**, dan provenans blok 224×224
sebaiknya dianggap tidak diketahui.

### Celah di sisi daun

- **Kelas kentang sehat tetap lemah**: KEN-04 nol, KEN-05 hanya 11 kotak. KEN-11 menambah
  `Sana` 383 — membantu, tetapi 306 di antaranya kemungkinan besar berasal dari PlantVillage
  (studio), jadi bukan citra sehat lapangan.
- **Verticillium wilt**: nol dataset citra.
- **Blackleg pada batang** dan **layu bakteri pada tanaman utuh**: tidak terwakili; hanya ada
  versi umbinya.
- **Septoria** kini tertutup lewat KEN-11 (548 kotak) — sebelumnya nol.
- **Hawar daun kini berlimpah citra asli**: KEN-16 menambah 6.069 citra lapangan berlabel,
  di atas 1.072 kotak `Lancha` di KEN-11. Ini penyakit daun kentang yang paling tertutup.
  **Tetapi KEN-16 hanya satu kelas** — tanpa `EB` dan `Healthy` yang tidak diunduh, ia perlu
  dipasangkan dengan kelas pembanding dari dataset lain, dan itu memasukkan pergeseran domain.
- **Hawar bertahap (awal vs lanjut)** kini punya korpus citranya lewat KEN-15, **tetapi
  labelnya harus dibuat sendiri**.

### Nol dataset asal Indonesia — tidak berubah

Pencarian berbahasa Indonesia hanya menghasilkan artikel jurnal, dan artikel-artikel itu
sendiri menyatakan memakai PlantVillage/Kaggle. Satu makalah menyebut data lapangan
Ijen Bondowoso (1.132 citra daun + 816 citra batang) yang **tidak diterbitkan**.
Sentra kentang Indonesia (Dieng, Pangalengan, Modoinding) dengan varietas Granola/Atlantik/
Median tetap **tidak terwakili sama sekali**.

Yang **berubah sedikit** adalah kedekatan agroklimat: **KEN-14 dari Vietnam utara** kini
menjadi analog tabular terdekat yang tersedia — dataran tinggi tropis Asia Tenggara,
jauh lebih sebanding daripada Peru (CIP) atau Kenya (KEN-09).

### Rekomendasi lanjutan, berurut prioritas

1. **Anotasi 1.561 citra KEN-15** menurut skema Healthy/ILB/ALB. Ini pekerjaan anotasi, bukan
   pencarian — dan hasilnya korpus hawar bertahap berbasis citra lapangan asli yang tidak ada
   duanya di panen ini.
2. ~~**Ambil `LB.zip` saja dari KEN-16 (PLDD-UP)**~~ — **SUDAH DIJALANKAN.** 6.069 citra asli
   berlabel masuk; basis citra asli naik 69%. Lihat bagian 1 dan hitung ulang di atas.
3. **Ambil `EB.zip` (2,77 GB) dari PLDD-UP** — juga muat di bawah batas 3 GB bila diambil
   sendiri, dan **menyelesaikan masalah "hanya satu kelas" pada KEN-16** dengan memberi kelas
   early blight dari kampanye pengambilan yang sama (tanpa pergeseran domain). `Healthy.zip`
   (3,68 GB) tetap di luar batas. **Ini kini rekomendasi unduhan dengan hasil tertinggi.**
4. **Naikkan batas ke ~5 GB lalu ambil `defect_dataset.zip` KEN-17 (Diamant, 3,9 GB)** —
   satu-satunya segmentasi instance cacat permukaan umbi.
5. **Kejar khusus kudis dan black scurf beresolusi penuh.** Ini celah diagnosis yang paling
   menggigit dan **tidak** terselesaikan oleh KEN-10. Kemungkinan jalur: kontak penulis
   ScabyNet (KEN-21), atau program sertifikasi benih.
6. **Kejar silver scurf, powdery scab, nematoda sista** — ketiganya masih nol.
7. **Bangun data lapangan Indonesia sendiri.** Tetap satu-satunya jalan menutup celah
   varietas dan agroklimat lokal.
8. Periksa `TOM-10-cuaca-tanah-tabular` milik agen tomat untuk memastikan apakah kentang
   termasuk — itu kandidat data cuaca terkuat yang teridentifikasi.

---

## 6. Penilaian kelayakan

### (a) Identifikasi penyakit — **umbi kuat untuk penapisan, masih lemah untuk diagnosis halus**

**Layak** untuk dua tugas yang berbeda, dan pembedaan ini penting:

- **Penapisan mutu umbi (baik vs cacat)** — sekarang **kuat**. KEN-10 memberi 36.000 citra
  berimbang dengan split bawaan yang bersih dan checksum penerbit yang cocok.
- **Diagnosis penyakit umbi bernama patogen** — **masih terbatas**. Hanya KEN-01 yang
  menyediakannya (10 kelas), dan kelas paling menentukan paling tipis: common scab 60,
  black scurf 49. KEN-10 **tidak membantu di sini** karena tidak berlabel patogen.

Untuk daun, cakupannya membaik nyata: KEN-11 menambahkan **Septoria** (sebelumnya nol) dan
memberi label kotak-batas siap pakai untuk early blight, late blight, dan sehat; **KEN-16
menambah 6.069 citra hawar daun lapangan asli**, menjadikan hawar daun satu-satunya penyakit
kentang dalam panen ini yang punya citra asli berlabel dalam jumlah memadai.
Virus (PVY/PVX/PLRV) tetap hanya tersedia sebagai citra augmentasi atau berlatar hitam, dan
label virus tanpa konfirmasi ELISA/RT-PCR tetap harus diperlakukan sebagai dugaan.

### (b) Pelatihan computer vision — **kini ada jalur yang benar-benar bersih**

**Perubahan terpenting dari putaran kedua**: sebelumnya hampir semua dataset besar cacat oleh
augmentasi tanpa induk. Sekarang ada **dua dataset yang bisa dilatih dan dievaluasi secara
jujur tanpa pekerjaan tambahan**:

- **KEN-11** — 3.060 citra + 3.060 kotak, format YOLOv8 lengkap dengan `data.yaml` dan split
  terstratifikasi 80/10/10. Siap latih.
- **KEN-10** — 36.000 citra dengan split bawaan dan **0 nama berkas bertumpang tindih antar
  split** (diuji langsung).
- **KEN-16** — 6.069 citra hawar daun lapangan asli berlabel, **0 tumpang tindih hash dengan
  KEN-15 maupun PlantVillage**. Perlu kelas pembanding dari luar karena hanya satu kelas.

Jebakan yang **tetap berlaku**:

1. **Kebocoran augmentasi** di KEN-03 (100% `aug_`), KEN-08 (100% augmentasi, nol induk),
   dan dua zip kecil KEN-02 — tidak ada pemetaan turunan→induk, jadi split acak per berkas
   akan bocor. **KEN-08 tidak punya citra asli untuk diuji sama sekali.**
2. **Tumpang tindih KEN-04 ↔ KEN-05** — jangan digabung dalam satu split.
3. **KEN-10 punya risiko kebocoran yang tidak dapat dikesampingkan**: uji nama berkas bersih,
   tetapi kalau augmentasi diterapkan **sebelum** split oleh penyusun aslinya, turunan satu
   umbi bisa jatuh di train dan test dan uji nama **tidak akan mendeteksinya**.
4. **KEN-11 diproses berat** (padding putih 1024×1024 + CLAHE) dan 70% isinya PlantVillage
   studio — model yang dilatih di sini belum tentu memindah ke foto ponsel apa adanya.
5. **Lisensi NC pada KEN-11** memblokir pemakaian komersial.

**Nilai khas PlantDoc tetap sama**: KEN-04/KEN-05 adalah **tolok ukur** untuk mengukur
keruntuhan model saat pindah dari studio ke kebun, bukan sumber data latih utama.

### (c) Basis pengetahuan — **kuat, dan tetap pemakaian paling aman**

Rujukan visual untuk **11 kondisi umbi** dan sekitar 9 kondisi daun (Septoria kini termasuk),
dengan nama kelas yang dapat dipetakan ke nama patogen. Ditambah kamus data CIP
(KEN-06/KEN-07) yang menjelaskan AUDPC dan skala keparahan hawar, KEN-09 untuk hubungan
perlakuan ↔ penyakit ↔ hasil, dan **KEN-14** yang menambahkan kaitan **cekaman biotik ↔ mutu
umbi** (padatan, gula pereduksi, bentuk, warna) — berguna untuk menjelaskan mengapa ketahanan
penyakit saja tidak cukup dalam memilih varietas.

Yang perlu dijaga:
- **Beberapa kelas bukan penyakit patogenik**: `Blackspot Bruising` (KEN-01), `cut` (KEN-08),
  dan **seluruh kelas `Defectuoso` KEN-10** (mencampur luka mekanis, masalah penyimpanan,
  dan pembusukan). `Miscellaneous` (KEN-01) tidak terdefinisi.
- **Peringatan lisensi**: KEN-09 **tidak menyatakan lisensi**; **KEN-11 CC BY-NC 4.0**
  (non-komersial); KEN-04/KEN-05 berisi gambar scraping internet dengan hak cipta per gambar
  yang tidak seragam — aman untuk melatih, berisiko untuk menayangkan gambarnya satu per satu.

### (d) Analisis epidemiologi — **fondasi menguat, cuaca tetap hilang**

**Yang berhasil didapat**: empat dataset tabular dengan **8.060 baris pengamatan lapangan**
(1.517 + 5.808 + 309 + 426), memuat AUDPC, keparahan bertahap lima sampai tujuh titik waktu,
kelas ketahanan, tekanan penyakit, perlakuan fungisida, kehilangan hasil, dan — lewat KEN-14 —
skor infeksi **Rhizoctonia**, **virus**, dan **vektor kutu daun**.

**Tambahan KEN-14 memperbaiki dua hal**:
- **Cakupan patogen melebar** dari hawar-saja menjadi hawar + virus + Rhizoctonia + vektor.
- **Kedekatan agroklimat**: Vietnam utara adalah analog terdekat dengan sentra kentang
  Indonesia di antara seluruh sumber tabular.

**Batas yang tetap serius:**

- **Masih nol data cuaca di seluruh berkas yang diunduh.** Hawar daun adalah penyakit yang
  paling ditentukan cuaca. Model peringatan (Smith Period, NegFry, BLITECAST) **tidak ada
  sebagai data terbuka**; yang terdekat KEN-23 (CIP Lateblight Advisor, menghitung *Blight
  Units* dari WeatherAPI) **nol berkas** — hanya konsepnya yang dapat dirujuk.
- **Kandidat cuaca terkuat ada di wilayah agen tomat** (`TOM-10-cuaca-tanah-tabular`).
- **KEN-14 tidak punya AUDPC** dan hanya satu angka infeksi per genotipe per tahun, sehingga
  tidak bisa memodelkan kurva perkembangan penyakit. Skala skornya juga tidak dijelaskan.
- **KEN-06/KEN-07 tidak mencantumkan tanggal pengamatan** → AUDPC tidak dapat dihitung ulang.
- **Koordinat hampir tidak ada**: hanya KEN-09 (4 lokasi Kenya).
- **Semuanya luar Indonesia.** **Statistik luas serangan OPT Indonesia** — bahan epidemiologi
  lokal yang sesungguhnya — ada di wilayah agen bawang merah (`BWM-04`, `BWM-07`) dan
  sengaja tidak disentuh. Untuk analisis epidemiologi kentang Indonesia, berkas itulah yang
  harus dipasangkan dengan data CIP dan KEN-14 di sini.

**Kesimpulan dimensi ini**: cukup untuk mengajarkan dan mendemonstrasikan epidemiologi
secara kuantitatif lintas beberapa patogen dan tiga benua; **belum cukup** untuk membangun
sistem peringatan dini berbasis cuaca untuk Indonesia.
