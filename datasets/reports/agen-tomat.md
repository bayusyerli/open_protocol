# Laporan agen tomat (prefiks `TOM`)

Tanggal panen: **2026-08-25**. Direktori kerja: `/Users/syera/open_protocol`.
Berkas klaim: `datasets/metadata/klaim/tomat.tsv` (15 klaim — satu per dataset yang benar-benar diunduh).
Baris katalog: `datasets/metadata/rows/tomat.csv` (**40 baris**, termasuk yang ditolak, yang gagal, dan yang tidak bisa diunduh).

## Ringkasan cacah

| status unduh | jumlah |
|---|---|
| `diunduh` | 15 |
| `ditemukan` | 14 |
| `terlalu-besar` | 5 |
| `terhalang-akun` | 3 |
| `ditolak` | 2 |
| `gagal` | 1 |
| **total kandidat tercatat** | **40** |

| status verifikasi | jumlah |
|---|---|
| `terverifikasi` | 13 |
| `sebagian` | 2 |
| `belum` | 23 |
| `tidak-berlaku` | 2 |

Total terpakai: **± 10,4 GB** dari jatah 12 GB. Tidak ada satu dataset pun yang melebihi batas 3 GB — yang terbesar, `TOM-16`, tepat 2.989.253.828 byte (2,99 GB).

---

## 1. Berhasil diunduh

Semua arsip di bawah ini **sudah dibuka dan dicacah**; tidak ada yang berstatus `terverifikasi` tanpa arsipnya pernah dibuka.

### Di `datasets/priority/tomat/`

| id | judul singkat | gambar/record | kelas | lisensi | verifikasi |
|---|---|---|---|---|---|
| `TOM-02` | **Tomato-Village** (lapangan, Rajasthan India) | Variant-a 4.526 + Variant-b 5.656 | 8 (termasuk 3 defisiensi hara) | tidak dinyatakan | terverifikasi |
| `TOM-03` | Dataset of Tomato Leaves (Taiwan) | 622 asli + 4.976 augmentasi | 6 | CC BY 4.0 | terverifikasi |
| `TOM-04` | A dataset for tomato disease detection (Zenodo) | 2.212 gambar + 2.212 label YOLO | 9 (hanya id 0–8, tanpa nama) | CC BY 4.0 | terverifikasi |
| `TOM-05` | Tomato Leaf Disease Dataset in **Pakistan** (lapangan) | 830 asli + 7.200 augmentasi | 6 | CC BY 4.0 | **sebagian** |
| `TOM-06` | Tomato **Leaf and Fruit** Disease (Bangladesh) | 3.500 (7×500) | 7, dua di antaranya buah | CC BY 4.0 | terverifikasi |
| `TOM-07` | **TFDD** — penyakit **BUAH** tomat | 288 asli → 682 setelah augmentasi, 825 kotak | **8** termasuk antraknosa & busuk ujung buah | CC BY 4.0 | terverifikasi |
| `TOM-08` | Basis pengetahuan penyakit tomat (tabular) | 54 record (46 berisi) | 9 penyakit × 5–6 aspek | CC BY 4.0 | terverifikasi |
| `TOM-09` | Pota-Toma-To / AgroGuard (tomat + kentang) | 435 unik | 4 | CC BY 4.0 (**provenans bermasalah**) | terverifikasi |
| `TOM-11` | Tomato Leaf Dataset (kebun Bangladesh, lapangan) | 1.420 gambar + 689 label | 7 (hanya id 0–6) | CC BY 4.0 | **sebagian** |
| `TOM-13` | Tomato Disease Dataset (Appe) | 2.388 gambar **tanpa label** | 0 | CC BY 4.0 | terverifikasi |
| `TOM-14` | Sumber daya genetik tomat Spanyol (tabular) | 122 baris, 29 sifat | 13 nilai gejala + 3 skala ketahanan | **CC BY-NC-SA 4.0** | terverifikasi |
| `TOM-16` | **Tomato Disease Dataset (Sichuan)** — **layu bakteri** | 1.026 gambar + 1.026 XML, **3.167 kotak** | 3 penyakit / 10 kelas penyakit×bagian tanaman | CC BY 4.0 | terverifikasi |

### Di `datasets/additional/` (≥3 tanaman)

| id | judul singkat | isi | lisensi | verifikasi |
|---|---|---|---|---|
| `TOM-01` | **PlantVillage** | 54.303 gambar × 3 varian, 38 kelas, 14 tanaman | **CC BY-SA 3.0** | terverifikasi |
| `TOM-10` | Soil-Weather Multivariate Crop Disease | 250.000 baris tabular, 6 tanaman | CC BY 4.0 | terverifikasi |
| `TOM-12` | **PhytoScope** (lapangan, kotak pembatas) | 20.723 gambar, 105 kelas, 25 tanaman | CC BY 4.0 | terverifikasi |

### Catatan khusus PlantVillage (tugas khusus agen ini)

Ukuran diperiksa **sebelum** mengunduh. API GitHub melaporkan repo 2.100.984 KB (± 2,0 GiB); arsip `master.zip` yang benar-benar terunduh **2.504.302.720 byte (2,33 GiB)** — **muat di batas 3 GB**, sehingga tidak perlu memilih satu varian dan ketiganya ikut terbawa.

Varian **`color` adalah yang kanonik dan yang harus dipakai**: 54.303 gambar RGB asli, 38 kelas, tanpa augmentasi. `grayscale` (54.303) dan `segmented` (54.306) adalah **turunan dari gambar yang sama** — menggabungkannya melipatgandakan tiap daun tiga kali.

Varian **"augmented" 87.000 gambar di Mendeley Data sengaja tidak diambil**: jauh lebih besar dan augmentasinya tercampur dengan aslinya sehingga merusak evaluasi yang jujur.

Hitungan yang diverifikasi langsung dari daftar isi arsip:
- **Tomat: 10 kelas, 18.159 gambar** — Bacterial spot 2.127, Early blight 1.000, Late blight 1.908, Leaf Mold 952, Septoria leaf spot 1.771, Spider mites 1.676, Target Spot 1.404, Yellow Leaf Curl Virus 5.357, Mosaic virus 373, healthy 1.591.
- **Kentang: 3 kelas, 2.152 gambar** — Early blight 1.000, Late blight 1.000, healthy 152.
- Paprika/cabai besar: 2 kelas, 2.474 gambar. **Tidak ada bawang merah.**

**Sifat gambarnya, dan mengapa itu penting**: setiap gambar adalah **satu helai daun tunggal yang dipetik, di atas latar seragam, dengan pencahayaan studio**. Tidak ada tanah, kanopi, daun bertumpuk, atau bayangan matahari. Akibatnya **model yang dilatih di atas PlantVillage jatuh pada foto lapangan** — akurasi ~99% pada uji internal PlantVillage anjlok drastis begitu diuji pada foto yang diambil petani di kebun. Angka akurasi PlantVillage **tidak boleh** dikutip sebagai perkiraan kinerja lapangan. Selain itu satu helai daun difoto beberapa kali, sehingga split acak per-gambar membocorkan daun yang sama ke train dan test; repo menyediakan `leaf_grouping/` dan `leaf-map.json` yang **wajib** dipakai untuk membuat split yang benar.

Rujukan silang dari `datasets/priority/tomat/`: lihat `RUJUKAN-PLANTVILLAGE.md` di direktori itu.

---

## 2. Ditemukan tapi belum bisa diunduh

### Terhalang aturan ukuran / jatah (semuanya sah dan legal, tinggal diunduh)

| id | dataset | ukuran | alasan |
|---|---|---|---|
| `TOM-17` | **OLID I** subset tomat (Bangladesh) | 2,89 GB (2 berkas resmi terpisah) | Muat di batas 3 GB per dataset; sisa jatah setelah `TOM-16` tidak cukup |
| `TOM-23` | Tomato Leaf Disease PlantCity 2025 (11 kelas) | 1,99 GB | Muat; jatah habis dan cakupan Pakistan sudah diwakili `TOM-05` |
| `TOM-37` | TCP (Tomato-Chilli-Papaya) Fruit & Leaf Disease | 2,02 GB | Muat; **relevan lintas agen** (tomat + cabai + buah) |
| `TOM-33`, `TOM-34`, `TOM-35`, `TOM-36`, `TOM-38`, `TOM-32`, `TOM-26`, `TOM-39`, `TOM-40` | dataset lebih kecil | 0,03–668 MB | Jatah habis dan/atau redundan; alasan per baris ada di `rows/tomat.csv` |

### Terlalu besar (>3 GB, tanpa subset resmi yang muat)

`TOM-18` Agri-Foundation-145k (10,41 GB) · `TOM-19` Multiclass Image Dataset of Tomato Pathologies (4,42 GB) · `TOM-20` rekaman kembar Tomato Leaf and Fruit (9,90 GB) · `TOM-21` Agri-Vision4 (7,46 GB) · `TOM-22` PlantCity multi-tanaman (7,26 GB).

### Gagal — jalur resmi pun menolak

| id | dataset | yang dicoba |
|---|---|---|
| `TOM-15` | **Dryad**: insidensi layu bakteri (*Ralstonia pseudosolanacearum*) di 4 lahan tomat, **CC0 1.0**, 4,7 MB | Dicoba **dua endpoint API resmi Dryad** yang terdokumentasi: `/api/v2/datasets/doi%3A10.5061%2Fdryad.3j9kd520g/download` dan `/api/v2/files/4736943/download`. **Keduanya HTTP 401** dengan badan `{"error":"Unauthorized, must have current bearer token"}`, baik dengan maupun tanpa override User-Agent. Jalur `/downloads/file_stream` juga 403 dan memang dilarang `robots.txt`. **Tidak dicari jalan lain.** Yang menghalangi hanya mekanisme unduhnya, bukan lisensinya — datanya CC0. API **metadata** Dryad tidak butuh token, jadi isinya terkonfirmasi: `README.md` 4.855 byte + `Source_data-0410.xlsx` 4.740.661 byte. Bisa diambil manusia lewat peramban dengan akun Dryad. |

### Terhalang akun / pembatasan akses — tidak ditembus

| id | dataset | penghalang |
|---|---|---|
| `TOM-27` | Laser speckle deteksi dini hawar (720 rekaman, 105 fitur, 6 jam pasca inokulasi) | API Zenodo melaporkan `access: restricted`; butuh permintaan akses ke pemilik rekaman |
| `TOM-30` | IEEE DataPort "Real Field Crop Image Dataset" | Butuh akun/langganan IEEE |
| `TOM-31` | Kaggle "Tomato leaf disease Dataset" | Butuh akun + token API Kaggle |

---

## 3. Dataset tambahan (`datasets/additional/`)

Tiga dataset multi-tanaman diunduh di sini karena cakupannya ≥3 tanaman:

1. **`TOM-01` PlantVillage** — 14 tanaman, 38 kelas. Tulang punggung sisi *studio*.
2. **`TOM-12` PhytoScope** — 25 tanaman, 105 kelas, 20.723 gambar **lapangan** dengan kotak pembatas YOLO. Sisi *lapangan* untuk banyak tanaman sekaligus.
3. **`TOM-10` Soil-Weather Multivariate Crop Disease** — 250.000 baris tabular untuk 6 tanaman. Satu-satunya calon bahan epidemiologi yang berhasil dibuka — dan hasil pemeriksaannya negatif (lihat bagian 7d).

---

## 4. Ditolak beserta alasan

| id | apa yang tampak | kenyataannya |
|---|---|---|
| `TOM-28` | Rekaman Zenodo berjudul "Taiwan Tomato Leaves Dataset", lisensi CC BY 4.0, mengklaim 622 gambar 6 kategori | **Satu-satunya berkasnya adalah PDF pemasaran vendor** (`gts_ai_dataset_download_taiwan_tomato_leaves_dataset.pdf`, 0,72 MB) yang mengarahkan ke gts.ai. Bukan dataset. Data aslinya adalah `TOM-03` di Mendeley yang sudah diunduh dan terhitung tepat 622 gambar. |
| `TOM-29` | "Field evaluation of tomato varieties for resistance to early and late blight, Baitadi, Nepal" di figshare, CC BY 4.0 | Hanya lampiran artikel: **1 berkas JPG + 1 dokumen Word**. Tidak ada tabel data ketahanan yang bisa dipakai kembali. |

Selain itu, seluruh rekaman Zenodo bertipe `publication` yang muncul di hasil pencarian (puluhan makalah berjudul "Tomato Leaf Disease Detection Using CNN" dan sejenisnya) **tidak dimasukkan ke katalog sama sekali** — artikel jurnal bukan dataset, dan tidak ada tautan ke berkas data di dalamnya.

Dua rekaman lolos ke katalog dengan status `diunduh`/`ditemukan` tapi layak diperlakukan sebagai peringatan:
- **`TOM-13`** — judul "Tomato Disease Dataset" di Zenodo, lisensi CC BY 4.0, **tetapi rekamannya tanpa deskripsi apa pun dan arsipnya berisi 2.388 gambar dalam satu folder datar tanpa satu pun berkas label**. Judul + repositori bereputasi + lisensi terbuka bukan jaminan ada label. Arsipnya wajib dibuka dulu.
- **`TOM-25`** — unggah ulang dataset Kaggle ke Zenodo; deskripsinya sendiri berbunyi "All copyright goes to this kaggel website link" sambil menyetempel CC BY 4.0 atas karya orang lain.

---

## 5. Duplikasi yang dicegah

- **PlantDoc** (`10.5281/`-less, GitHub `pratikkayal/PlantDoc-Dataset`) tidak disentuh — sudah diklaim agen kentang sebagai `KEN-04-plantdoc-lapangan` dan `KEN-05-plantdoc-deteksi-objek` di `datasets/additional/`. PlantDoc memuat 737 gambar tomat lapangan di 8 kelas; **rujuk ke `datasets/additional/KEN-04-plantdoc-lapangan/`**, jangan diunduh ulang.
- **PotatoCare** (`10.17632/7vm7xskfg4`), **Potato Viral Disease** (`10.17632/rgfhzd5mzw`), dan **Potato Leaf Disease Dataset** (`10.17632/d5b3fzpw3g`) muncul di hasil pencarian saya tetapi sudah diklaim agen kentang (`KEN-01`, `KEN-02`, `KEN-03`). Tidak diunduh.
- **Statistik serangan OPT Indonesia** tidak disentuh — milik agen bawang merah.
- **`TOM-20`** (`10.17632/swtt5wy2pr.1`) **tidak diunduh karena kemungkinan kembaran internal**: judulnya persis sama dengan `TOM-06` (`10.17632/9jxvtgh325.1`) dan kelompok penulisnya bertumpang tindih. Subset `Resize Dataset.zip` (840 MB) hampir pasti sama isinya dengan `Original Dataset.zip` yang sudah saya unduh — **bandingkan SHA-256 dulu** sebelum menambahkannya.
- **`TOM-32`** (Processed Tomato Leaf Disease) dan **`TOM-25`** (unggah ulang Kaggle) tidak diunduh karena keduanya turunan PlantVillage yang sudah dipanen utuh di `TOM-01`.
- **`TOM-26`** (Synthetic Co-Infection) tidak diunduh karena gambar dasarnya diambil dari PlantVillage.
- **`TOM-18`** Agri-Foundation-145k sebagian besar isinya PlantVillage + PlantDoc yang sudah ada di repo ini.

---

## 6. Kekurangan data & rekomendasi lanjutan

### Layu bakteri: **tertutup**. Layu fusarium: **masih nol**.

Ini dua penyakit tomat paling merugikan di dataran rendah tropis, termasuk Indonesia, dan keduanya semula hilang dari seluruh koleksi. Alasannya struktural, bukan kebetulan: keduanya **penyakit pembuluh** yang gejala utamanya layu seluruh tanaman dan pencoklatan berkas pembuluh batang — bukan bercak daun. Seluruh tradisi dataset penyakit tomat dibangun di atas **foto daun**, sehingga penyakit pembuluh tidak pernah bisa masuk.

**`TOM-16` (Sichuan) menutup separuhnya.** Yang membuatnya berhasil bukan sekadar keberadaan kelas "bacterial wilt", melainkan **cara anotasinya**: kelasnya menggabungkan penyakit dengan **bagian tanaman** — `Wilt_Base` 173 kotak, `Wilt_Stem` 135, `Wilt_Middle` 345, `Wilt_Top` 298, `Wilt_Leaf` 405, total **1.356 kotak layu bakteri** pada 527 gambar. Satu foto tanaman utuh memuat beberapa kotak yang memetakan bagaimana layu menaik dari pangkal ke pucuk. Itu geometri yang **mustahil** direkam dataset daun-petik, dan itulah sebabnya menambahkan "satu kelas lagi" ke dataset bergaya PlantVillage tidak akan pernah menutup celah ini.

**Yang masih terbuka setelah `TOM-16` masuk:**

1. **Layu fusarium tetap nol** di seluruh 15 dataset yang diunduh. Ini sekarang menjadi **lubang gejala tunggal terbesar**, dan lebih berbahaya daripada sebelumnya: layu fusarium dan layu bakteri menghasilkan gejala layu yang **mirip di lapangan** dan pembedanya adalah uji potong batang (pancaran lendir bakteri) atau pencoklatan pembuluh, bukan tampilan luar. Model yang dilatih di atas `TOM-16` akan **melabeli tanaman layu fusarium sebagai layu bakteri dengan percaya diri**. Menambahkan satu penyakit pembuluh tanpa pasangannya menciptakan risiko salah diagnosis yang tidak ada sebelumnya.
2. **`TOM-16` tidak punya kelas sehat.** Ia hanya bisa membedakan di antara tiga penyakit yang sudah diketahui ada, tidak bisa memutuskan "sakit atau tidak".
3. **Data insidensi layu bakteri berbasis lahan masih kosong.** `TOM-15` (Dryad, CC0, 4 lahan tomat) **gagal** — dua endpoint API resmi Dryad pun membalas HTTP 401 tanpa bearer token. Jadi yang ada sekarang adalah *citra* layu bakteri, bukan *sebaran* layu bakteri.
4. `TOM-16` diambil di **rumah kaca** taman pertanian modern Sichuan, bukan lahan petani terbuka, dan kultivarnya tidak disebutkan.

### Lubang lain

1. **Tidak ada data Indonesia sama sekali.** Pencarian dengan kata kunci Indonesia ("dataset penyakit tomat", "citra daun tomat", "busuk daun tomat") hanya menemukan **artikel jurnal Indonesia yang memakai dataset Kaggle/PlantVillage**, bukan dataset primer Indonesia yang diterbitkan. Tidak ada rekaman Mendeley/Zenodo/figshare berafiliasi IPB/UGM/UB/Undip untuk tomat.
2. **Gejala buah terwakili, gejala akar masih nol.** Buah: `TOM-06` (2 kelas) dan `TOM-07` (8 kelas, termasuk antraknosa dan busuk ujung buah). Batang: kini ada lewat `TOM-16` (`Wilt_Stem` 135 kotak, `Wilt_Base` 173 kotak). **Akar tetap tidak terwakili sama sekali** — padahal itu tempat infeksi *Ralstonia* dan *Fusarium* bermula.
3. **Tidak ada data deret waktu / epidemiologi yang sungguhan.** Lihat bagian 7d.
4. **Nama kelas hilang di tiga dataset deteksi objek** (`TOM-04`, `TOM-11` — hanya id angka tanpa `data.yaml`). `TOM-07` dan `TOM-12` menyertakannya; ini pembeda kualitas yang nyata.
5. **Augmentasi tercampur hampir di mana-mana** (`TOM-03`, `TOM-05`, `TOM-06`, `TOM-07`, `TOM-12`, `TOM-02` Variant-b) dan biasanya **setelah** split ditetapkan pembuat, tanpa penanda yang memungkinkan penelusuran ke gambar induk.

### Rekomendasi lanjutan, berurutan

1. **Cari atau bangun data layu fusarium.** Ini sekarang prioritas nomor satu, menggantikan layu bakteri yang sudah tertutup `TOM-16`. Selama layu fusarium nol sementara layu bakteri punya 527 gambar, modul identifikasi apa pun akan bias menjawab "layu bakteri" untuk setiap tanaman layu. Kalau tidak ditemukan dataset publiknya, **jangan tampilkan jawaban layu bakteri tanpa peringatan eksplisit bahwa layu fusarium tidak bisa dibedakan dari foto** — dan arahkan ke uji potong batang.
2. **Ambil `TOM-15` dari Dryad secara manual lewat peramban** dengan akun Dryad (CC0, 4,7 MB). Jalur otomatis sudah dicoba dan ditolak; ini satu-satunya data *sebaran* layu bakteri berbasis lahan.
3. **Unduh `Variant-c` Tomato-Village** (2.596 MB, 14.368 gambar + label PASCAL VOC & YOLO). Anotasi kotak pembatas lapangan untuk tomat sangat langka dan varian ini adalah subset resmi yang muat sendirian di batas 3 GB.
4. **Unduh subset tomat OLID I (`TOM-17`)** — Bangladesh tropis lembap, iklim terdekat ke Indonesia di antara seluruh kandidat gambar, dan sumbernya menyediakan subset per-tanaman resmi.
5. **Bangun dataset primer Indonesia.** Tidak ada jalan pintas: lubang ini tidak bisa ditambal dari repositori mana pun. Prioritas pemotretan, dengan urutan yang sudah diperbarui: **layu fusarium** (batang dibelah berdampingan dengan layu bakteri, plus tanaman utuh layu), gejala **akar**, busuk buah antraknosa, dan TYLCV di kultivar lokal. Contoh skema anotasi yang layak ditiru sudah ada di `TOM-16`: kelas = penyakit × bagian tanaman, satu foto tanaman utuh dengan beberapa kotak.
6. **Verifikasi ulang label `TOM-04` dan `TOM-11` secara visual** untuk memastikan pemetaan id→nama kelas, lalu simpan `classes.txt` hasil verifikasi **di samping** `raw/`, bukan di dalamnya. Untuk `TOM-16`, satukan `Virus_Middle` dengan awalan `Viral_` saat pemuatan — juga di luar `raw/`.
7. Koordinasikan **`TOM-37` (TCP: tomat + cabai + pepaya, 2,02 GB)** dengan agen cabai supaya tidak diunduh dua kali.

---

## 7. Penilaian kelayakan

### (a) Identifikasi penyakit (untuk petani, lewat foto)

**Cukup untuk purwarupa, belum cukup untuk dipakai petani Indonesia.**

Yang tersedia sudah menutup **bercak dan gejala daun** dengan baik: early blight, late blight, Septoria, leaf mold, bercak bakteri, target spot, TYLCV, ToMV, tungau, pengorok daun — semuanya punya ratusan sampai ribuan gambar di beberapa dataset independen sekaligus. `TOM-07` menambahkan sisi **buah** (antraknosa, busuk ujung buah, retak, ulat buah, kapang) yang selama ini kosong. `TOM-02` menambahkan **defisiensi hara** (Mg, N, K), yang penting karena di lapangan justru sering tertukar dengan penyakit.

`TOM-16` menambahkan sesuatu yang sebelumnya mustahil: **gejala tingkat tanaman utuh**. Dengan 527 gambar layu bakteri beranotasi per bagian tanaman (pangkal, batang, tengah, pucuk, daun), sistem bisa menjawab pertanyaan "tanaman saya layu" — bukan cuma "daun saya berbercak".

Yang menghalangi pemakaian nyata:
- **Layu fusarium masih nol, dan sekarang itu justru lebih berbahaya.** Sebelumnya sistem tidak mengenal penyakit layu sama sekali, jadi kegagalannya kentara. Sekarang ia mengenal **satu** dari dua penyakit layu yang gejalanya mirip, sehingga akan menjawab "layu bakteri" dengan yakin untuk tanaman yang sebenarnya kena layu fusarium. Pembedanya di lapangan adalah uji potong batang, bukan foto.
- **`TOM-16` tidak punya kelas sehat**, jadi tidak bisa dipakai sendirian untuk memutuskan sakit atau tidak — harus dipasangkan dengan kelas sehat dari dataset lain, dan itu berarti mencampur domain (rumah kaca Sichuan vs studio/lapangan lain).
- **Tidak ada satu pun gambar dari Indonesia.** Kultivar, intensitas cahaya, dan tampakan gejala berbeda.
- Semua dataset ini mengasumsikan **satu masalah per gambar**, kecuali `TOM-02` Variant-b (1.128 gambar bergejala majemuk) dan `TOM-16` (rata-rata 3,1 kotak per gambar). Di lapangan, ko-infeksi adalah norma.

**Rekomendasi**: kalau modul identifikasi dirilis, ia **wajib** punya jawaban "tidak yakin / bukan salah satu dari ini", dan untuk setiap jawaban **layu bakteri** wajib menambahkan peringatan bahwa **layu fusarium tidak bisa dibedakan dari foto** serta mengarahkan ke uji potong batang. Mendiamkan hal ini lebih buruk daripada tidak menjawab.

### (b) Pelatihan computer vision

**Bahan latihnya memadai; bahan evaluasi yang jujur justru langka.**

- **Massa data cukup**: PlantVillage sendiri memberi 18.159 gambar tomat berlabel di 10 kelas. Ditambah `TOM-04` (2.212), `TOM-05` (830 asli), `TOM-06` (3.500), `TOM-11` (1.420), `TOM-02` (4.526), `TOM-16` (1.026), `TOM-12` (801) — cukup untuk melatih model apa pun.
- **Ragam format lengkap**: klasifikasi multikelas (`TOM-01`, `TOM-03`, `TOM-05`, `TOM-06`), multilabel (`TOM-02` Variant-b), deteksi objek YOLO (`TOM-04`, `TOM-07`, `TOM-11`, `TOM-12`), deteksi objek PASCAL VOC (`TOM-16`).
- **Masalah utamanya kebocoran dan augmentasi.** Enam dari dua belas dataset gambar sudah memuat augmentasi yang tercampur ke dalam split yang ditetapkan pembuat, tanpa cara menelusuri gambar ke induknya. Melaporkan akurasi apa adanya dari split bawaan **hampir pasti melebih-lebihkan**.
- **`TOM-16` adalah satu-satunya himpunan evaluasi yang benar-benar bersih di koleksi ini**: nol augmentasi, cakupan anotasi 100%, resolusi penuh 12 MP, dan **tanggal sesi tersandi di nama berkas** (5 tanggal pada 2024) sehingga split bebas kebocoran berbasis sesi bisa dibuat sendiri. Tidak ada dataset lain di sini yang memungkinkan itu — sisanya bernama-hash Roboflow.
- **Jembatan studio→lapangan tersedia dan harus dipakai.** Kombinasi yang benar: latih di PlantVillage (studio, besar) → **uji di dataset lapangan yang belum pernah dilihat** (`TOM-02`, `TOM-05`, `TOM-11`, `TOM-16`, `TOM-12`, plus PlantDoc milik agen kentang). Selisih dua angka itulah ukuran kesiapan sesungguhnya; angka PlantVillage sendirian tidak berarti apa-apa.
- Untuk PlantVillage, `leaf_grouping/` **wajib** dipakai membuat split; kalau tidak, foto daun yang sama muncul di train dan test.
- **Tugas deteksi berubah sifat dengan masuknya `TOM-16`.** Dataset lain memotong satu daun sebagai satu objek; `TOM-16` memberi 1–10 kotak per foto tanaman utuh pada bagian tanaman yang berbeda. Menggabungkan keduanya ke satu ruang kelas tanpa memisahkan sumbu "penyakit" dari sumbu "bagian tanaman" akan menghasilkan skema yang tidak konsisten.

### (c) Basis pengetahuan

**Satu sumber bagus, tapi terlalu tipis untuk berdiri sendiri, dan berisiko kalau dipakai mentah.**

`TOM-08` adalah satu-satunya sumber pengetahuan berstruktur yang ditemukan: **9 penyakit × 5–6 aspek** (`symptoms`, `favourable_condition`, `pesticides`, `physical_biological`, `preventive_measures`), CC BY 4.0, mudah diurai. Kolom `favourable_condition` bahkan memuat ambang suhu dan kelembapan yang bisa dipakai untuk aturan peringatan sederhana.

Peringatan yang harus dipatuhi:
- **8 dari 54 record kosong**, nama medannya tidak konsisten, dan tidak ada kolom patogen (nama ilmiah), inang, atau referensi.
- **Kolom `pesticides` berbasis pendaftaran India.** Menampilkannya apa adanya ke pengguna Indonesia berarti menganjurkan bahan yang mungkin **tidak terdaftar untuk tomat di Indonesia**. Wajib dipetakan ulang ke registri pestisida Indonesia sebelum ditampilkan — kalau pemetaan itu belum ada, kolom ini **jangan ditampilkan sama sekali**.
- `Spider Mites` dan `Leaf Miner` adalah hama, bukan penyakit; skema apa pun yang dibangun di atasnya harus memisahkan keduanya.

`TOM-14` menyumbang hal berbeda dan berharga: **skema pengamatan lapangan yang rapi** (29 sifat dengan kode, metode, dan satuan/skala, termasuk `27_BER_SL` ketahanan busuk ujung buah dan `29_FDR_SL` ketahanan penyakit daun). Sebagai *contoh bentuk*, bukan sebagai isi — datanya hanya 122 baris dan berlisensi **CC BY-NC-SA 4.0** (non-komersial, berbagi-serupa), jadi harus disimpan terpisah dari koleksi CC BY.

**Lubang pengetahuan yang tersisa setelah `TOM-16` masuk**: `TOM-08` mencakup 9 penyakit, semuanya penyakit **daun**. Ia **tidak memuat entri untuk layu bakteri maupun layu fusarium** — jadi meskipun sekarang ada 527 gambar layu bakteri untuk dikenali, **tidak ada satu baris pun teks yang menjelaskan gejalanya, kondisi pemicunya, atau cara pengendaliannya**. Modul identifikasi bisa menjawab "layu bakteri" tetapi tidak bisa menjelaskan apa artinya atau apa yang harus dilakukan petani. Entri pengetahuan untuk kedua penyakit pembuluh ini harus ditulis sendiri, bersumber dari BSIP/Balitsa, bukan dari `TOM-08`.

### (d) Analisis epidemiologi

**Praktis nihil. Ini kesimpulan yang paling tegas dari seluruh panen ini.**

Satu-satunya kandidat berskala besar, `TOM-10` (250.000 baris, 6 tanaman, tomat 20.720 baris termasuk 802 baris layu bakteri), **gagal pemeriksaan begitu dibuka**:

- Setiap kolom numerik berhenti tepat di batas bulat buatan — `Nitrogen` 5,006–149,999; `Phosphorus` 5,000–89,999; `pH_Value` 4,500–8,500; `Rainfall` 20,019–399,975. Pola penarikan acak seragam, bukan pengukuran lapangan.
- Hampir setiap nilai unik (`Rainfall`: 249.353 nilai berbeda dari 250.000 baris) — mustahil untuk alat ukur nyata.
- `High_Temp_Warning` bernilai `1` untuk **seluruh 250.000 baris** (konstan, tanpa informasi).
- `High_Wind_Warning` **rusak**: bendera yang seharusnya 0/1 berisi 66.572 nilai pecahan.
- Satuan tercampur: `Soil_Temperature` Celsius, `Weather_Temp_F` Fahrenheit.
- **Tidak ada kolom waktu maupun lokasi.** Tanpa itu, tidak ada kurva epidemi, tidak ada penyebaran spasial, tidak ada peringatan dini.

Jadi klaim "250.000 real observations" tidak didukung datanya sendiri. Dataset ini **layak sebagai contoh skema** (kolom apa yang perlu dikumpulkan untuk sistem peringatan dini tanah+cuaca) dan sebagai data mainan untuk uji pipeline — **tidak layak** untuk melatih apa pun yang akan dipakai petani.

Sisa bahan epidemiologi yang nyata sangat sedikit dan semuanya di luar jangkauan atau di luar Indonesia:
- `TOM-15` (Dryad, CC0) — insidensi layu bakteri di 4 lahan tomat; **gagal**: dua endpoint API resmi Dryad pun membalas HTTP 401 tanpa bearer token. Bisa diambil manusia lewat peramban dengan akun.
- `TOM-16` (Sichuan) menyandi **tanggal sesi** di nama berkas (05-09, 06-17, 09-19, 10-21, 11-12 tahun 2024) dengan sebaran yang berubah antar sesi — gray mold hanya muncul di dua sesi awal (Mei, Juni) sementara layu bakteri memuncak di sesi akhir (Oktober, November, 478 dari 527 gambar). Itu **jejak musiman yang nyata**, tetapi hanya 5 titik waktu di satu rumah kaca: cukup untuk mengilustrasikan pola, jauh dari cukup untuk memodelkan epidemi.
- `TOM-14` (Spanyol) dan `TOM-39` (Yunani) — 122 dan ~40 baris pengamatan lapangan; terlalu kecil, iklim Mediterania.
- `TOM-27` (laser speckle, deteksi pra-gejala 6 jam pasca inokulasi) — terhalang akun, dan lingkupnya percobaan terkendali, bukan epidemi lapangan.

**Kesimpulan**: sumber epidemiologi tomat yang bisa dipakai untuk Indonesia harus dicari di jalur yang sama sekali lain — statistik luas serangan OPT Ditjen Hortikultura/Kementan (sedang ditangani agen bawang merah), bukan di repositori dataset akademik.

---

## 8. Temuan untuk tanaman lain

Dicatat, **tidak diunduh** kecuali datasetnya juga memuat tomat.

### Cabai (*Capsicum*)

| dataset | URL | lisensi | ukuran | catatan |
|---|---|---|---|---|
| **PhytoScope — bagian `Chilli Disease`** | https://zenodo.org/records/21383493 | CC BY 4.0 | 1,07 GB (seluruh arsip) | **Sudah ada di repo ini**: `datasets/additional/TOM-12-phytoscope-lapangan`. 1.012 gambar lapangan, 5 kelas: `Chilli cercospora`, `Chilli healthy`, `Chilli mites_and_trips`, `Chilli nutritional`, `Chilli powdery mildew`, dengan kotak pembatas YOLO. **Tidak perlu diunduh ulang.** |
| PlantVillage — `Pepper,_bell___*` | https://github.com/spMohanty/PlantVillage-Dataset | CC BY-SA 3.0 | 2,33 GB (seluruh arsip) | **Sudah ada**: `datasets/additional/TOM-01-plantvillage`. 2 kelas paprika (Bacterial spot 997, healthy 1.477). Bukan cabai lokal. |
| TCP (Tomato-Chilli-Papaya) Fruit & Leaf Disease | https://data.mendeley.com/datasets/m4m6j2tjfj/4 | CC BY 4.0 | 2,02 GB | Memuat tomat **dan** cabai, termasuk penyakit buah. Muat di batas 3 GB. Koordinasikan siapa yang mengambilnya. |

### Kentang (*Solanum tuberosum*)

| dataset | URL | lisensi | ukuran | catatan |
|---|---|---|---|---|
| **PlantVillage — 3 kelas kentang** | https://github.com/spMohanty/PlantVillage-Dataset | CC BY-SA 3.0 | 2,33 GB (seluruh arsip) | **Sudah ada**: `datasets/additional/TOM-01-plantvillage`. Early blight 1.000, Late blight 1.000, healthy 152. Kelas `healthy` sangat kecil. |
| **PhytoScope — bagian `Potato Disease`** | https://zenodo.org/records/21383493 | CC BY 4.0 | 1,07 GB (seluruh arsip) | **Sudah ada**: `datasets/additional/TOM-12-phytoscope-lapangan`. 610 gambar lapangan, 3 kelas, kotak pembatas. |
| **Soil-Weather — bagian kentang** | https://zenodo.org/records/19885786 | CC BY 4.0 | 67 MB | **Sudah ada**: `datasets/additional/TOM-10-cuaca-tanah-tabular`. 20.696 baris, 6 kelas termasuk **Bacterial Wilt 2.227**. Perhatikan: datanya kemungkinan besar sintetis (lihat 7d). |
| `TOM-09` AgroGuard — `Potato_Late_Blight` | https://data.mendeley.com/datasets/354fsxwccb/1 | CC BY 4.0 | 65 MB | **Sudah ada**: `datasets/priority/tomat/TOM-09-agroguard-kentang-tomat`. Hanya 124 gambar, satu kelas, **provenans hasil scraping Google Images** — jangan dipakai untuk klaim apa pun. |
| SFLDD (Solanaceae) — 6 kelas kentang | https://data.mendeley.com/datasets/sd5m3mgvvx/1 | CC BY 4.0 | data di Google Drive | Termasuk `Bacterial Soft Rot`, `Potato Leaf Roll Virus`, `PVX`, `PVY` — kelas virus yang langka. Datanya tidak ada di repositori (hanya tautan Google Drive). |

### Terung (*Solanum melongena*)

- **PhytoScope — `Eggplant Disease`**: 600 gambar, 3 kelas (`Cercospora Leaf Spot`, `Eggplant Healthy`, `Eggplant Insect Pest`). **Sudah ada** di `datasets/additional/TOM-12-phytoscope-lapangan`.
- SFLDD: 4 kelas terung (`Downy Mildew`, `Septoria Leaf Spot`, `Eggplant Mosaic Virus`, `Healthy`) — data di Google Drive.

### Bawang merah

**Nihil.** Tidak ada satu pun dataset yang saya temukan memuat bawang merah (*Allium cepa* var. *aggregatum*): PlantVillage tidak punya, PhytoScope (25 tanaman) tidak punya, OLID I (9 tanaman) tidak punya, Agri-Vision4 tidak punya. Kelangkaan ini konsisten dengan seluruh literatur dataset penyakit tanaman.

### Tanaman lain yang tersedia gratis lewat dataset yang sudah diunduh

`datasets/additional/TOM-12-phytoscope-lapangan` juga memuat, dengan kotak pembatas lapangan: **padi** (801 gambar, 5 kelas termasuk `Rice Blast` dan `Rice Tungro`), **jagung** (829, 4 kelas), **mangga** (1.206, 6 kelas), **leci** (1.409, 7 kelas), **teh** (1.001, 5 kelas), **kapas** (1.094, 6 kelas), **pepaya** (503, 5 kelas), **semangka** (809, 4 kelas), **jeruk**, **anggur**, **apel**, **stroberi**, **timun**, **kembang kol**, **jahe**, **buah naga**, **nangka**, **rami/jute**, **pare**, **labu botol**, **kacang**. `datasets/additional/TOM-01-plantvillage` menambah **kedelai**, **bluberi**, **ceri**, **persik**, **frambos**, **labu**.

---

## 9. Catatan cara kerja yang mungkin berguna untuk sesi berikutnya

1. **Zenodo menolak `-A 'Mozilla/5.0'`.** `curl` ke `zenodo.org/api/...` dengan user-agent Mozilla membalas **HTTP 403**; tanpa override user-agent, berhasil. Kebalikan dari Mendeley, yang justru butuh user-agent.
2. **Zenodo membatasi `size` maksimal 25** per permintaan API tanpa autentikasi.
3. **Mendeley tidak selalu menyediakan arsip.** Sebagian rekaman (`TOM-11`, `TOM-16`, `TOM-33`, `TOM-34`) memaparkan ribuan berkas lepas. `https://data.mendeley.com/public-api/datasets/<id>` mengembalikan seluruh daftar berkas **beserta `sha256_hash` per berkas**, sehingga integritas tiap berkas bisa diverifikasi satu per satu — dipakai untuk `TOM-11` (2.109/2.109 cocok).
4. **`public-api/datasets/<id>/files?folder_id=root` tidak memaparkan nama folder**, hanya `folder_id`. Struktur direktori asli bisa hilang saat diunduh; simpan `folder_id` per berkas ke manifes terpisah (lihat `TOM-11/manifes-folder.csv`).
5. **GitHub tidak bisa memberi arsip per-subfolder.** Untuk mengambil sebagian repo besar (`TOM-02`): `git clone --filter=blob:none --no-checkout --depth 1` lalu `git sparse-checkout set '<folder>'` lalu `git checkout`. Ukuran per folder bisa dihitung dulu lewat `api.github.com/repos/<o>/<r>/git/trees/<sha>?recursive=1`.
6. **`find … | xargs shasum` pecah pada nama berisi spasi/kurung.** Wajib `find … -print0 | sort -z | xargs -0 shasum -a 256`.
7. **`bsdtar` (bawaan macOS di `/usr/bin/bsdtar`) bisa membaca `.7z`** — tidak perlu memasang p7zip.
8. **Dalam zsh, jangan memakai variabel bernama `path`** dalam `while read`: `path` terikat ke `PATH` dan seluruh perintah jadi tidak ditemukan.
9. **Direktori scratchpad dipakai bersama antar agen paralel.** Berkas sementara bernama umum (`md_<id>.json`) bisa bertabrakan; pakai subdirektori bernama tanaman.
