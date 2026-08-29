# Inventaris dataset penyakit tanaman hortikultura

> Dibangun ulang dengan `python3 datasets/metadata/bangun-inventaris.py`. Jangan disunting tangan — isinya cerminan `datasets/metadata/dataset-catalog.csv`. Analisis dan penilaian ada di [laporan-akhir.md](laporan-akhir.md).

Tanggal akses seluruh panen: **2026-08-25**. Total kandidat tercatat: **120**.

## Ringkasan angka

| status unduh | jml | | status verifikasi | jml |
|---|---:|---|---|---:|
| `diunduh` | 47 | | `terverifikasi` | 32 |
| `ditemukan` | 21 | | `sebagian` | 15 |
| `terhalang-akun` | 16 | | `belum` | 33 |
| `terlalu-besar` | 12 | | `tidak-berlaku` | 40 |
| `gagal` | 6 | |  |  |
| `ditolak` | 18 | |  |  |

### Cakupan per tanaman prioritas

| tanaman | tercatat | diunduh | terverifikasi | sebagian |
|---|---:|---:|---:|---:|
| Cabai | 35 | 15 | 7 | 8 |
| Tomat | 50 | 21 | 17 | 4 |
| Kentang | 36 | 22 | 17 | 5 |
| Bawang merah | 13 | 6 | 4 | 2 |

## 1. Dataset prioritas yang berhasil diunduh

### Cabai — 15 dataset

| dataset_id | jenis | judul | penyakit/kelas | jumlah | lisensi | ukuran | verifikasi |
|---|---|---|---|---|---|---|---|
| `BWM-04-ditjenhorti-opt-pestisida` | teks | Buku Direktorat Perlindungan Hortikultura… | Spodoptera exigua; Liriomyza; Alternaria porri (trotol); … | 3 dokumen, 133 halaman (26+58+4… | tidak dinyatakan | 9.10 MB | terverifikasi |
| `BWM-05-eppo-distribusi-inang` | tabular | EPPO Global Database: tabel distribusi ge… | PLEOAL Stemphylium vesicarium; PHYTIN Phytophthora infest… | 1803 baris data | tidak dinyatakan | 392.00 KB | terverifikasi |
| `BWM-08-globi-interaksi-inang` | tabular | GloBI: interaksi patogen/hama - tanaman i… | 14 organisme x 3 jenis interaksi (pathogenOf, hasHost, in… | 14532 baris data | tidak dinyatakan (a… | 6.30 MB | sebagian |
| `BWM-09-wikidata-patogen-inang` | tabular | Wikidata: relasi patogen/hama - inang (P2… | 271 organisme unik termasuk Alternaria solani; Fusarium o… | 291 baris, 271 patogen unik | CC0 1.0 | 203.00 KB | terverifikasi |
| `CAB-01-penyakit-kuning-begomovirus-jabar` | gambar | A dataset of Yellow Disease in Horticultu… | Begomovirus positive; Begomovirus negative (penyakit kuni… | 5095 citra + 5095 anotasi = 101… | CC BY 4.0 | 223.64 MB | terverifikasi |
| `CAB-02-chilcv-coimbatore-figshare` | campuran | Chilli Leaf Curl Virus Dataset Final Ver | Healthy control; Initial Symptoms of ChiLCV; Severe Sympt… | diklaim 22069, terhitung 22829 … | CC BY 4.0 | 1.03 GB | sebagian |
| `CAB-03-chilli-6-kelas-bangladesh` | gambar | Chilli Leaf Disease Image Dataset for Cla… | Bacterial_Spot; Cercospora_Leaf_Spot; Curl_Virus; Healthy… | diklaim 8814, terhitung 8817 (C… | CC BY 4.0 | 3.04 GB | sebagian |
| `CAB-04-chili-4-kelas-dhaka` | campuran | Chili Leaf Disease Dataset: Annotated Sma… | Anthracnose; Cercospora Leaf Spot; Leaf Curl Disease; Fre… | dataset penuh 1515 citra (Fresh… | CC BY 4.0 | 2.20 GB | sebagian |
| `CAB-05-pepper-leaf-figshare` | gambar | Pepper Leaf DataSet | Pepper__bell___healthy; Leaf_Curl; Pepper__bell___Bacteri… | diklaim 423, terhitung 1308 ber… | CC BY 4.0 | 28.24 MB | sebagian |
| `CAB-06-antraknosa-nitrogen-tabular` | tabular | Nitrogen availability shapes anthracnose … | antraknosa (Colletotrichum fructicola) | 3 berkas; 9 tabel, total sekita… | CC BY 4.0 | 1.60 MB | terverifikasi |
| `CAB-08-cercospora-sergipe-zenodo` | gambar | Cercospora Leaf Spot in Chili Pepper Leav… | Cercospora leaf spot (bercak daun Cercospora) | diklaim 1738, terhitung 1738 be… | CC BY 4.0 | 281.60 MB | sebagian |
| `CAB-09-pepper-penyakit-hama-mendeley` | gambar | Pepper Diseases and Pests Detection | TIDAK ADA LABEL di dalam arsip | 100 berkas JPG (image_1..image_… | CC BY 4.0 | 220.73 MB | sebagian |
| `CAB-11-cold-chilli-koppal` | gambar | chilli dataset (bagian cabai dari COLD - … | cercospora/cerocospora; healthy; murda complex (tungau Po… | makalah mengklaim 10987, terhit… | CC BY 4.0 (metadata… | 544.03 MB | sebagian |
| `CAB-12-tcp-tomat-cabai-pepaya` | gambar | TCP (Tomato-Chilli-Papaya Fruit & Leaf) D… | cabai: Chili Bacterial Spot; Chili Healthy Leaf; Chilli C… | 9541 gambar total (cabai 2818; … | CC BY 4.0 | 199.40 MB | terverifikasi |
| `TOM-12-phytoscope-lapangan` | gambar | PhytoScope: A Public Benchmark Dataset fo… | Tomat 4 kelas: Tomato Bacterial spot, Tomato Fresh leaf, … | 20723 gambar, 20773 berkas labe… | CC BY 4.0 | 1.15 GB | terverifikasi |

### Tomat — 21 dataset

| dataset_id | jenis | judul | penyakit/kelas | jumlah | lisensi | ukuran | verifikasi |
|---|---|---|---|---|---|---|---|
| `BWM-05-eppo-distribusi-inang` | tabular | EPPO Global Database: tabel distribusi ge… | PLEOAL Stemphylium vesicarium; PHYTIN Phytophthora infest… | 1803 baris data | tidak dinyatakan | 392.00 KB | terverifikasi |
| `BWM-08-globi-interaksi-inang` | tabular | GloBI: interaksi patogen/hama - tanaman i… | 14 organisme x 3 jenis interaksi (pathogenOf, hasHost, in… | 14532 baris data | tidak dinyatakan (a… | 6.30 MB | sebagian |
| `BWM-09-wikidata-patogen-inang` | tabular | Wikidata: relasi patogen/hama - inang (P2… | 271 organisme unik termasuk Alternaria solani; Fusarium o… | 291 baris, 271 patogen unik | CC0 1.0 | 203.00 KB | terverifikasi |
| `CAB-12-tcp-tomat-cabai-pepaya` | gambar | TCP (Tomato-Chilli-Papaya Fruit & Leaf) D… | cabai: Chili Bacterial Spot; Chili Healthy Leaf; Chilli C… | 9541 gambar total (cabai 2818; … | CC BY 4.0 | 199.40 MB | terverifikasi |
| `KEN-04-plantdoc-lapangan` | gambar | PlantDoc: A Dataset for Visual Plant Dise… | 28 kelas; kentang: Potato leaf early blight (117), Potato… | 2579 | CC BY 4.0 | 984.41 MB | sebagian |
| `KEN-05-plantdoc-deteksi-objek` | campuran | PlantDoc Object Detection Dataset (varian… | 29 kelas train / 27 test; kentang: Potato leaf (sehat, 11… | 2594 | CC BY 4.0 | 994.77 MB | terverifikasi |
| `TOM-01-plantvillage` | gambar | PlantVillage Dataset | Tomat 10 kelas: Bacterial spot, Early blight, Late blight… | 54303 gambar per varian (color … | CC BY-SA 3.0 | 2.50 GB | terverifikasi |
| `TOM-02-tomato-village-lapangan` | gambar | Tomato-Village: a dataset for end-to-end … | Early_blight, Late_blight, Leaf Miner, Spotted Wilt Virus… | Variant-a 4526 gambar; Variant-… | tidak dinyatakan | 1.40 GB | terverifikasi |
| `TOM-03-taiwan-daun-tomat` | gambar | Dataset of Tomato Leaves (Taiwan Tomato L… | Bacterial spot, Black mold, Gray spot, Late blight, powde… | diklaim 622 asli, terhitung 622… | CC BY 4.0 | 48.01 MB | terverifikasi |
| `TOM-04-tomat-9-kelas-zenodo` | gambar | A dataset for tomato disease detection | 9 kelas menurut deskripsi sumber: Early Blight, Healthy, … | 2212 gambar + 2212 berkas label… | CC BY 4.0 | 544.52 MB | terverifikasi |
| `TOM-05-pakistan-lapangan` | gambar | Tomato Leaf Disease Classification Datase… | Early blight, Late blight, Septoria leaf spot, Leaf mold,… | diklaim 7200, terhitung 8030 = … | CC BY 4.0 | 726.46 MB | sebagian |
| `TOM-06-daun-buah-lapangan-bd` | gambar | Tomato Leaf and Fruit Disease Image Datas… | Healthy Leaf, Healthy Fruits, Early Blight Leaf, Late Bli… | diklaim 3500, terhitung 3500 (7… | CC BY 4.0 | 842.28 MB | terverifikasi |
| `TOM-07-tfdd-buah-tomat` | gambar | TFDD: A High-Quality Image Dataset for Ac… | Anthracnose (antraknosa buah), Blossom_end_rot (busuk uju… | diklaim 288 gambar asli, terhit… | CC BY 4.0 | 421.09 MB | terverifikasi |
| `TOM-08-tabular-penyakit-tomat` | tabular | A Comprehensive Dataset of Tomato Plant D… | Early Blight, Late Blight, Leaf Miner, leaf mold, Mosaic … | 54 record (46 berisi + 8 kosong) | CC BY 4.0 | 27.98 KB | terverifikasi |
| `TOM-09-agroguard-kentang-tomat` | gambar | Pota-Toma-To leaf disease images dataset … | Tomato_Early_Blight, Tomato_Healthy, Tomato_Late_Blight, … | diklaim 435, terhitung 435 unik… | CC BY 4.0 | 68.32 MB | terverifikasi |
| `TOM-10-cuaca-tanah-tabular` | tabular | Soil-Weather Multivariate Crop Disease Da… | Tomat 6: Bacterial Wilt 802, Early Blight 1857, Fruit Bor… | 250000 baris data (0 duplikat),… | CC BY 4.0 | 70.51 MB | terverifikasi |
| `TOM-11-kebun-bangladesh` | gambar | Tomato Leaf Dataset: A dataset for multic… | 7 kelas menurut makalah: Early Blight, Black Spot, Late B… | diklaim 1621 (makalah), terhitu… | CC BY 4.0 | 48.54 MB | sebagian |
| `TOM-12-phytoscope-lapangan` | gambar | PhytoScope: A Public Benchmark Dataset fo… | Tomat 4 kelas: Tomato Bacterial spot, Tomato Fresh leaf, … | 20723 gambar, 20773 berkas labe… | CC BY 4.0 | 1.15 GB | terverifikasi |
| `TOM-13-zenodo-tomat-7z` | gambar | Tomato Disease Dataset (Appe) | TIDAK ADA - arsip tanpa label, tanpa subdirektori kelas, … | 2388 berkas gambar tanpa label | CC BY 4.0 | 29.39 MB | terverifikasi |
| `TOM-14-tomat-spanyol-tabular` | tabular | Evaluation of tomato (Solanum lycopersicu… | Kolom 06_PHD (teks bebas): Red spider mite (1-4), Tuta ab… | 122 baris data (32+42+32+16), 1… | CC BY-NC-SA 4.0 | 262.36 KB | terverifikasi |
| `TOM-16-sichuan-layu-bakteri` | gambar | Tomato Disease Dataset (Yongbo Liu) - rum… | Tingkat berkas: layu bakteri (Ralstonia solanacearum) 527… | diklaim 1026 gambar, terhitung … | CC BY 4.0 | 2.99 GB | terverifikasi |

### Kentang — 22 dataset

| dataset_id | jenis | judul | penyakit/kelas | jumlah | lisensi | ukuran | verifikasi |
|---|---|---|---|---|---|---|---|
| `BWM-04-ditjenhorti-opt-pestisida` | teks | Buku Direktorat Perlindungan Hortikultura… | Spodoptera exigua; Liriomyza; Alternaria porri (trotol); … | 3 dokumen, 133 halaman (26+58+4… | tidak dinyatakan | 9.10 MB | terverifikasi |
| `BWM-05-eppo-distribusi-inang` | tabular | EPPO Global Database: tabel distribusi ge… | PLEOAL Stemphylium vesicarium; PHYTIN Phytophthora infest… | 1803 baris data | tidak dinyatakan | 392.00 KB | terverifikasi |
| `BWM-08-globi-interaksi-inang` | tabular | GloBI: interaksi patogen/hama - tanaman i… | 14 organisme x 3 jenis interaksi (pathogenOf, hasHost, in… | 14532 baris data | tidak dinyatakan (a… | 6.30 MB | sebagian |
| `BWM-09-wikidata-patogen-inang` | tabular | Wikidata: relasi patogen/hama - inang (P2… | 271 organisme unik termasuk Alternaria solani; Fusarium o… | 291 baris, 271 patogen unik | CC0 1.0 | 203.00 KB | terverifikasi |
| `KEN-01-potatocare-umbi-mendeley` | gambar | PotatoCare: Deep learning based potato di… | Black Scurf (Rhizoctonia solani); Blackleg; Blackspot Bru… | 3905 | CC BY 4.0 | 94.62 MB | sebagian |
| `KEN-02-virus-daun-umbi-mendeley` | gambar | Potato Viral Disease Dataset on both Foli… | Mosaic virus (daun); PLRV/Potato Leaf Roll Virus (daun); … | 6565 | CC BY 4.0 | 617.00 MB | sebagian |
| `KEN-03-daun-kentang-mendeley` | gambar | Potato Leaf Disease Dataset (BARI Chattog… | Bacterial Soft Rot; Fungal Late Blight (Phytophthora infe… | 2351 | CC BY 4.0 | 38.39 MB | sebagian |
| `KEN-04-plantdoc-lapangan` | gambar | PlantDoc: A Dataset for Visual Plant Dise… | 28 kelas; kentang: Potato leaf early blight (117), Potato… | 2579 | CC BY 4.0 | 984.41 MB | sebagian |
| `KEN-05-plantdoc-deteksi-objek` | campuran | PlantDoc Object Detection Dataset (varian… | 29 kelas train / 27 test; kentang: Potato leaf (sehat, 11… | 2594 | CC BY 4.0 | 994.77 MB | terverifikasi |
| `KEN-06-cip-hawar-genebank` | tabular | Replication Data for: Late blight severit… | Late blight (Phytophthora infestans) - skor keparahan lb1… | 1517 | CC BY 4.0 | 165.38 KB | terverifikasi |
| `KEN-07-cip-hawar-lbhtc2` | tabular | Replication Data for: Late blight severit… | Late blight (Phytophthora infestans) - skor keparahan LB1… | 5808 | CC BY 4.0 | 538.15 KB | terverifikasi |
| `KEN-08-umbi-augmentasi-mendeley` | gambar | Potato Crop Disease Augmentation Dataset | common_scab (Streptomyces scabies); dry_rot (Fusarium); g… | 138000 | CC BY 4.0 | 742.83 MB | terverifikasi |
| `KEN-09-cip-pengelolaan-terpadu` | tabular | Dataset for: Integrated management of lat… | Late blight (Phytophthora infestans) - AUDPC, rAUDPC, tek… | 309 | tidak dinyatakan | 82.27 KB | terverifikasi |
| `KEN-10-hybrid-tuber-zenodo` | gambar | Hybrid Potato Tuber Dataset (Solanum tube… | Buen estado / kondisi baik (18.000); Defectuoso / cacat (… | 36000 | CC BY 4.0 | 191.75 MB | terverifikasi |
| `KEN-11-foliar-yolov8-zenodo` | campuran | Annotated Dataset for Potato Foliar Disea… | Alternaria / early blight (1.057 kotak); Lancha / late bl… | 3060 | CC BY-NC 4.0 | 678.79 MB | terverifikasi |
| `KEN-14-fenotip-multitahun-zenodo` | tabular | Multi-year phenotypic dataset of potato g… | skor infeksi lapangan: Late blight (Phytophthora infestan… | 426 | CC BY 4.0 | 81.92 KB | terverifikasi |
| `KEN-15-stagewise-hawar-zenodo` | campuran | Supporting data for: Stage-wise detection… | hawar daun bertahap: Healthy / ILB (Initial Late Blight) … | 1561 | CC BY 4.0 | 146.60 MB | terverifikasi |
| `KEN-16-pldd-up-lb-mendeley` | gambar | PLDD-UP: Potato Leaf Disease Dataset from… | LB / late blight - hawar daun (Phytophthora infestans). K… | 6116 | CC BY 4.0 | 2.32 GB | terverifikasi |
| `TOM-01-plantvillage` | gambar | PlantVillage Dataset | Tomat 10 kelas: Bacterial spot, Early blight, Late blight… | 54303 gambar per varian (color … | CC BY-SA 3.0 | 2.50 GB | terverifikasi |
| `TOM-09-agroguard-kentang-tomat` | gambar | Pota-Toma-To leaf disease images dataset … | Tomato_Early_Blight, Tomato_Healthy, Tomato_Late_Blight, … | diklaim 435, terhitung 435 unik… | CC BY 4.0 | 68.32 MB | terverifikasi |
| `TOM-10-cuaca-tanah-tabular` | tabular | Soil-Weather Multivariate Crop Disease Da… | Tomat 6: Bacterial Wilt 802, Early Blight 1857, Fruit Bor… | 250000 baris data (0 duplikat),… | CC BY 4.0 | 70.51 MB | terverifikasi |
| `TOM-12-phytoscope-lapangan` | gambar | PhytoScope: A Public Benchmark Dataset fo… | Tomat 4 kelas: Tomato Bacterial spot, Tomato Fresh leaf, … | 20723 gambar, 20773 berkas labe… | CC BY 4.0 | 1.15 GB | terverifikasi |

### Bawang merah — 6 dataset

| dataset_id | jenis | judul | penyakit/kelas | jumlah | lisensi | ukuran | verifikasi |
|---|---|---|---|---|---|---|---|
| `BWM-01-onion-cold-mendeley` | gambar | Onion dataset (bagian onion dari COLD - C… | purple blotch (Alternaria porri/trotol); Iris yellow viru… | 7004 gambar (4502 teraugmentasi… | CC BY 4.0 | 111.10 MB | sebagian |
| `BWM-02-onion-bulb-leaf-mendeley` | gambar | Image Dataset of Red and White Onion Bulb… | TIDAK ADA nama penyakit - hanya biner Healthy/Unhealthy | diklaim 16300, terhitung 16300 … | CC BY 4.0 | 1.61 GB | terverifikasi |
| `BWM-04-ditjenhorti-opt-pestisida` | teks | Buku Direktorat Perlindungan Hortikultura… | Spodoptera exigua; Liriomyza; Alternaria porri (trotol); … | 3 dokumen, 133 halaman (26+58+4… | tidak dinyatakan | 9.10 MB | terverifikasi |
| `BWM-05-eppo-distribusi-inang` | tabular | EPPO Global Database: tabel distribusi ge… | PLEOAL Stemphylium vesicarium; PHYTIN Phytophthora infest… | 1803 baris data | tidak dinyatakan | 392.00 KB | terverifikasi |
| `BWM-08-globi-interaksi-inang` | tabular | GloBI: interaksi patogen/hama - tanaman i… | 14 organisme x 3 jenis interaksi (pathogenOf, hasHost, in… | 14532 baris data | tidak dinyatakan (a… | 6.30 MB | sebagian |
| `BWM-09-wikidata-patogen-inang` | tabular | Wikidata: relasi patogen/hama - inang (P2… | 271 organisme unik termasuk Alternaria solani; Fusarium o… | 291 baris, 271 patogen unik | CC0 1.0 | 203.00 KB | terverifikasi |

## 2. Dataset prioritas yang ditemukan tetapi belum dapat diunduh

| dataset_id | judul | tanaman | kendala | ukuran | sumber | URL |
|---|---|---|---|---|---|---|
| `BWM-B19-atap-hortikultura` | Buku Angka Tetap Hortikultura 2021/2022/2… | cabai|tomat|kentang|bawang-merah | `ditemukan` | 9.6 MB (ATAP … | Direktorat Jenderal H… | [tautan](https://hortikultura.pertanian.go.id/publikasi/) |
| `CAB-14-arten-multicrop-mendeley` | ARTEN-Enhanced Multi-Crop Disease Dataset | cabai | `ditemukan` | 1.84 GB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/s2sxywhtx5/1) |
| `CAB-15-multicrop-vit-mendeley` | Multi-Crop Disease Dataset | cabai | `ditemukan` | tidak diketah… | Mendeley Data | [tautan](https://data.mendeley.com/datasets/6243z8r6t6/1) |
| `KEN-19-sfld-solanaceae-mendeley` | Solanaceae Family Leaf Disease Image Data… | tomat|kentang|lainnya | `ditemukan` |  | Mendeley Data | [tautan](https://data.mendeley.com/datasets/sd5m3mgvvx/1) |
| `KEN-20-sampel-hawar-lapangan-mendeley` | Sample dataset - Enhanced Field-Based Det… | kentang | `ditemukan` | 1.01 GB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/pbnw43s6kt/1) |
| `TOM-17-olid-bangladesh` | OLID I: An Open Leaf Image Dataset of Ban… | tomat|lainnya | `ditemukan` | 2.89 GB | Zenodo | [tautan](https://zenodo.org/records/8105154) |
| `TOM-23-plantcity-tomat-figshare` | Tomato Leaf Disease PlantCity 2025 (11 cl… | tomat | `ditemukan` | 1.99 GB | figshare | [tautan](https://figshare.com/articles/dataset/_b_Tomato_Leaf_Disease_PlantCity_2025_11_classes_b_/33190479) |
| `TOM-24-sfldd-solanaceae` | Solanaceae Family Leaf Disease Image Data… | tomat|kentang|lainnya | `ditemukan` | 938.92 KB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/sd5m3mgvvx/1) |
| `TOM-25-kaggle-tomatoleaf-zenodo` | tomato-leaf-diseases-detection (unggah ul… | tomat | `ditemukan` | 192.14 MB | Zenodo | [tautan](https://zenodo.org/records/8311631) |
| `TOM-26-koinfeksi-sintetis` | Synthetic Co-Infection Plant Leaf Dataset… | tomat|kentang|lainnya | `ditemukan` | 550.70 MB | Zenodo | [tautan](https://zenodo.org/records/18097801) |
| `TOM-32-plantvillage-diproses` | Processed Tomato Leaf Disease Image Datas… | tomat | `ditemukan` | 109.39 MB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/3zwdw6y4pn/1) |
| `TOM-33-daffodil-bangladesh` | Tomato leaf diseases (Khagan/Charabag, Ba… | tomat | `ditemukan` | 450.75 MB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/93h9p62kg4/1) |
| `TOM-34-bangladesh-7-kategori` | Tomato Leaf Disease Classification Datase… | tomat | `ditemukan` | 286.19 MB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/jttrv2w27r/2) |
| `TOM-35-solapure-cc-by-sa` | Tomato Leaf Disease Dataset (SmartAgroTec… | tomat | `ditemukan` | 668.09 MB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/zfv4jj7855/1) |
| `TOM-36-multi-crop-xai` | Multi-Crop Leaf Disease Dataset for Deep … | tomat | `ditemukan` | 523.29 MB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/3xd9n7jpc8/1) |
| `TOM-37-tcp-tomat-cabai-pepaya` | TCP (Tomato-Chilli-Papaya Fruit & Leaf) D… | cabai|tomat|lainnya | `ditemukan` | 2.02 GB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/m4m6j2tjfj/4) |
| `TOM-38-ithaya-rani-figshare` | Tomato leaf diseases (Ithaya Rani) | tomat | `ditemukan` | 382.88 MB | figshare | [tautan](https://doi.org/10.6084/m9.figshare.33197457) |
| `TOM-39-tomat-yunani-tabular` | Characterisation of tomato (Solanum lycop… | tomat | `ditemukan` | 179.00 KB | Zenodo (Horizon Europ… | [tautan](https://zenodo.org/records/21825728) |
| `TOM-40-metabolomik-ralstonia` | Comparative metabolomic profiling of resi… | tomat | `ditemukan` | 30.00 KB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/y2wcnrf745/1) |
| `BWM-03-tom2024-multicrop` | TOM2024: citra hama & penyakit tomat, baw… | tomat|lainnya | `gagal` | tidak diketah… | Mendeley Data (Elsevi… | [tautan](https://data.mendeley.com/datasets/3d4yg89rtr) |
| `BWM-B16-ditlin-hortikultura` | Direktorat Perlindungan Hortikultura (dit… | cabai|tomat|kentang|bawang-merah | `gagal` | tidak berlaku | Direktorat Jenderal H… | [tautan](https://ditlin.hortikultura.pertanian.go.id/) |
| `CAB-24-chili-pests-diseases-figshare` | Chili Pests and Diseases Dataset | cabai | `gagal` | tidak diketah… | figshare | [tautan](https://figshare.com/articles/Chili_Pests_and_Diseases_Dataset/12434066) |
| `CAB-25-rin-brin-keragaman-cabai` | Keragaman Genetik Cabai (Repositori Ilmia… | cabai | `gagal` | tidak diketah… | RIN - Repositori Ilmi… | [tautan](https://hdl.handle.net/20.500.12690/RIN/APO6JG) |
| `TOM-15-layu-bakteri-dryad` | Data from: Bacteria-phage coevolution dri… | tomat | `gagal` | 4.75 MB | Dryad | [tautan](https://datadryad.org/dataset/doi:10.5061/dryad.3j9kd520g) |
| `BWM-A05-ieee-shallot-dataset` | Shallot Dataset (data sensor IoT budidaya… | bawang-merah | `terhalang-akun` | tidak diketah… | IEEE DataPort | [tautan](https://ieee-dataport.org/documents/shallot-dataset) |
| `CAB-17-pepper-yangzhou-onrequest` | Pepper leaf disease dataset (Xijiang Agro… | cabai|lainnya | `terhalang-akun` | tidak diketah… | Frontiers in Plant Sc… | [tautan](https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2023.1230886/full) |
| `CAB-18-benin-chili-springer` | Chili pepper disease dataset from Benin (… | cabai | `terhalang-akun` | tidak diketah… | Springer Nature (Disc… | [tautan](https://link.springer.com/article/10.1007/s44163-025-00583-4) |
| `CAB-19-kaggle-dhenyd-chili` | Chili Plant Disease (Kaggle, dhenyd) | cabai | `terhalang-akun` | tidak diketah… | Kaggle | [tautan](https://www.kaggle.com/datasets/dhenyd/chili-plant-disease) |
| `CAB-20-kaggle-shuvo-chili` | Chili Plant Disease Detection (Kaggle, sh… | cabai | `terhalang-akun` | tidak diketah… | Kaggle | [tautan](https://www.kaggle.com/datasets/shuvokumarbasak4004/chili-plant-disease-detection) |
| `CAB-21-kaggle-ravindu-chilli` | Chilli Plant Diseases Dataset (Kaggle, ra… | cabai | `terhalang-akun` | tidak diketah… | Kaggle | [tautan](https://www.kaggle.com/datasets/ravindubandara3002/chilli-plant-diseases-dataset) |
| `CAB-22-roboflow-ptata-antraknosa` | Chili Anthracnose Disease (Roboflow Unive… | cabai | `terhalang-akun` | tidak diketah… | Roboflow Universe | [tautan](https://universe.roboflow.com/ptata/chili-anthracnose-disease-prvwz) |
| `CAB-23-roboflow-rizoma-antraknosa` | Anthracnose Klasifikasi Chili (Roboflow U… | cabai | `terhalang-akun` | tidak diketah… | Roboflow Universe | [tautan](https://universe.roboflow.com/traker-rempah-rempah-bumbu-dapur-rizoma/anthracnose-klasifikasi-chili) |
| `KEN-21-scabynet` | ScabyNet: common scab detection in potato… | kentang | `terhalang-akun` |  | Swedish University of… | [tautan](https://pmc.ncbi.nlm.nih.gov/articles/PMC10787732/) |
| `KEN-22-roboflow-potato-classification` | potato classification (Roboflow Universe,… | kentang | `terhalang-akun` |  | Roboflow Universe | [tautan](https://universe.roboflow.com/potato-defect-detection/potato-classification-s4djh) |
| `TOM-27-laser-speckle-hawar` | Derived data and reproducibility package … | tomat | `terhalang-akun` |  | Zenodo | [tautan](https://zenodo.org/records/19857899) |
| `TOM-30-ieee-real-field` | Real Field Crop Image Dataset | tomat | `terhalang-akun` |  | IEEE DataPort | [tautan](https://ieee-dataport.org/documents/real-field-crop-image-dataset) |
| `TOM-31-kaggle-dsv` | Tomato leaf disease Dataset (Kaggle) | tomat | `terhalang-akun` |  | Kaggle | [tautan](https://www.kaggle.com/dsv/16210872) |
| `CAB-07-chili-krishna-basin-india` | Image Dataset on Chili Leaf Diseases in t… | cabai | `terlalu-besar` | 5.30 GB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/ymt8k9bjkn/3) |
| `CAB-10-chili-daun-fase-bangladesh` | Chili Plant Leaf Disease and Growth Stage… | cabai | `terlalu-besar` | 9.19 GB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/w9mr3vf56s/1) |
| `CAB-13-chilcv-16gb-figshare` | Chilli leaf curl virus dataset | cabai | `terlalu-besar` | 16.90 GB | figshare | [tautan](https://figshare.com/articles/dataset/Chilli_leaf_curl_virus_dataset/31035043) |
| `KEN-17-diamant-tuber-mendeley` | Diamant Potato Dataset for ROI and Surfac… | kentang | `terlalu-besar` | 8.94 GB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/4vty9rz7zw/1) |
| `KEN-18-mikroskopi-umbi-figshare` | A large-scale optical microscopy image da… | kentang | `terlalu-besar` | 37.50 GB | figshare | [tautan](https://figshare.com/articles/dataset/12206270) |
| `TOM-18-agri-foundation-145k` | Agri-Foundation-145k: A Unified Large-Sca… | tomat|kentang | `terlalu-besar` | 10.41 GB | Zenodo | [tautan](https://zenodo.org/records/18214758) |
| `TOM-19-multiclass-patologi-tomat` | Multiclass Image Dataset of Tomato Pathol… | tomat | `terlalu-besar` | 4.42 GB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/xc94xbg239/1) |
| `TOM-20-daun-buah-kembar` | Tomato Leaf and Fruit Disease Image Datas… | tomat | `terlalu-besar` | 9.90 GB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/swtt5wy2pr/1) |
| `TOM-21-agri-vision4` | Agri-Vision4: A Comprehensive Multi-Crop … | tomat|lainnya | `terlalu-besar` | 7.46 GB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/8t6k37ztxc/1) |
| `TOM-22-plantcity-pakistan` | PlantCity: A Comprehensive Image Based on… | tomat|kentang | `terlalu-besar` | 7.26 GB | Mendeley Data | [tautan](https://data.mendeley.com/datasets/w8kh2xkspx/4) |

## 3. Dataset tambahan di luar empat tanaman prioritas

Dataset yang **tidak** menyentuh satu pun tanaman prioritas. Dataset multi-tanaman yang memuat tanaman prioritas sudah tercantum di bagian 1.

| dataset_id | judul | cakupan | jenis | status | lisensi |
|---|---|---|---|---|---|
| `BWM-06-gbif-okurensi-patogen` | GBIF: okurensi & faset negara/tahun untuk 1… | lintas komoditas (organisme pengganggu) | tabular | `diunduh` | CC BY 4.0 (584 rekama… |
| `BWM-07-serangan-opt-hortikultura` | Luas serangan OPT hortikultura - statistik … | 'Hortikultura' sebagai satu kategori ga… | tabular | `diunduh` | tidak dinyatakan |
| `BWM-A04-garlic-tipburn-bangladesh` | A comprehensive dataset of garlic leaf imag… | bawang putih (Allium sativum) | gambar | `terlalu-besar` | CC BY 4.0 |
| `BWM-A06-roboflow-onion-leaf-disease` | Onion Leaf Disease Object Detection Dataset… | bawang (onion) | gambar | `terhalang-akun` | tidak dinyatakan |
| `BWM-A07-yolo-odd-icar-dogr` | Dataset penyakit foliar bawang (YOLO-ODD, I… | bawang (onion) | gambar | `ditemukan` | tidak dinyatakan |
| `BWM-A12-mendeley-onion-processed` | onion processed data | bawang (onion) | gambar | `ditolak` | CC BY 4.0 |
| `BWM-B10-usda-fungus-host` | USDA Fungus-Host Distributions Database | lintas komoditas | tabular | `terhalang-akun` | tidak dinyatakan (dat… |
| `BWM-B11-cabi-compendium-plantwise` | CABI Compendium / PlantwisePlus Knowledge B… | lintas komoditas | teks | `ditolak` | berbayar / tidak bole… |
| `BWM-B12-ppdb-herts` | PPDB - Pesticide Properties DataBase | tidak berlaku (kimia pestisida) | teks | `ditolak` | hak cipta penuh - sal… |
| `BWM-B13-bps-webapi` | BPS Web API (Badan Pusat Statistik) | lintas komoditas | tabular | `terhalang-akun` | tidak dinyatakan |
| `BWM-B14-jabar-opendata` | Open Data Jawa Barat (opendata.jabarprov.go… | lintas komoditas | tabular | `gagal` | tidak diketahui |
| `BWM-B15-satudata-pertanian` | Portal Satu Data Pertanian (satudata.pertan… | lintas komoditas | tabular | `ditolak` | tidak dinyatakan |
| `BWM-B17-cilacap-serangan-opt` | Data Serangan OPT di Kabupaten Cilacap 2018… | kelapa; cengkeh; kopi; karet; lada; kak… | tabular | `ditolak` | tidak dinyatakan |
| `BWM-B18-globi-bulk-zenodo` | GloBI bulk interaction archive (interaction… | lintas komoditas | tabular | `terlalu-besar` | CC-BY-4.0 / CC0 (mirr… |
| `CAB-16-pepper-bell-mendeley` | Pepper Bell Leaf Disease | paprika (bell pepper) | gambar | `ditemukan` | CC BY 4.0 |
| `KEN-12-phytoscope-zenodo` | PhytoScope: A Public Benchmark Dataset for … | multi-tanaman | campuran | `ditolak` | CC BY 4.0 |
| `KEN-13-soil-weather-zenodo` | Soil-Weather Multivariate Crop Disease Data… | multi-tanaman | tabular | `ditolak` | CC BY 4.0 |

## 4. Dataset yang ditolak beserta alasannya

| dataset_id | judul | alasan penolakan |
|---|---|---|
| `BWM-A08-josh-mobilenetv2-shallot` | Klasifikasi Penyakit Daun Bawang Merah … | ARTIKEL JURNAL, bukan dataset - halaman menyatakan 'Download data is not yet available'. Tidak ada URL repositori, tidak ada DOI dataset, wilayah pengambilan tidak disebut. INI PALING MENYAKITKAN: satu-satunya… |
| `BWM-A09-cold-chilli-koppal` | chilli dataset (bagian cabai dari COLD) | DUPLIKASI DICEGAH: separuh cabai dari COLD, pasangan BWM-01. Diserahkan ke agen cabai dan sudah diklaim sebagai CAB-11-cold-chilli-koppal. Tidak diunduh ulang di sini. |
| `BWM-A10-ipb-fusarium-multispektral` | Sistem Deteksi Penyakit Layu Fusarium p… | REPOSITORI TUGAS AKHIR, bukan dataset yang bisa diunduh - yang tersedia dokumen tesis, bukan citra. Sangat relevan secara isi: akuisisi di Desa Wanasari, Kecamatan Wanasari, Kabupaten Brebes, Jawa Tengah (sent… |
| `BWM-A11-figshare-pcr-purple-blotch` | Identification of purple blotch pathoge… | SUPLEMEN ARTIKEL, bukan dataset. Satu-satunya hasil pencarian DataCite untuk 'purple blotch Alternaria' bertipe dataset - menunjukkan betapa kosongnya ruang ini. Isinya hasil PCR identifikasi patogen, tanpa ci… |
| `BWM-A12-mendeley-onion-processed` | onion processed data | Isinya tangkapan layar uji akar unit & kointegrasi harga bawang pasar India (Azadpur, Lasalgaon, Vashi, dst.) - ekonomi pertanian, bukan penyakit. Muncul di pencarian 'onion' karena kata kunci, bukan relevansi. |
| `BWM-B11-cabi-compendium-plantwise` | CABI Compendium / PlantwisePlus Knowled… | BERBAYAR + terhalang bot. Seluruh URL CABI -> HTTP 403 Cloudflare, termasuk yang diizinkan robots.txt mereka sendiri dan bahkan sitemap-index. Tidak ada upaya menembus. Model akses: factsheet PlantwisePlus gra… |
| `BWM-B12-ppdb-herts` | PPDB - Pesticide Properties DataBase | Terbaca tanpa login (HTTP 200, HTML statis mudah diurai) TAPI 'Copyright University of Hertfordshire, 2006-2026. All Rights Reserved'; salinan luring/massal hanya lewat lisensi berbayar. Selain itu ISINYA KIMI… |
| `BWM-B15-satudata-pertanian` | Portal Satu Data Pertanian (satudata.pe… | Portal HIDUP dan katalog lengkapnya terbaca (277 dataset ter-inline sebagai var metaDatasets di /datasets, dengan tautan XLS/XLSX langsung), TETAPI TIDAK SATU PUN tentang serangan OPT - seluruhnya produksi & l… |
| `BWM-B17-cilacap-serangan-opt` | Data Serangan OPT di Kabupaten Cilacap … | DITOLAK karena dua alasan. (1) SEKTOR SALAH: bentuknya PERSIS yang dibutuhkan - bulanan x kecamatan x jenis OPT - tapi isinya perkebunan dan padi, bukan hortikultura, dan tidak menyentuh 4 komoditas prioritas.… |
| `CAB-26-zenodo-varietas-filipina` | Philippine Chili Pepper Image Dataset f… | Ditolak dua kali. Pertama: bukan dataset penyakit - isinya membedakan VARIETAS (Siling Labuyo vs Taiwan F1). Kedua: bahkan sebagai dataset citra pun tidak memenuhi syarat - dari 22 berkas, 13 di antaranya adal… |
| `CAB-27-github-smartable-antraknosa` | smart-able/Anthracnose - Diagnosis Anth… | Repositori KODE, bukan dataset. Isi tingkat atas hanya tiga berkas: Anthracnose_code.ipynb (420 KB), LICENSE, README.md - tidak ada direktori data, tidak ada citra. Sesuai KETENTUAN bagian 2.5 statusnya ditola… |
| `CAB-28-cold-onion-duplikat` | Onion dataset (COLD - Chilli and Onion … | DUPLIKASI DICEGAH. DOI 10.17632/7nxxn4gj5s sudah diklaim agen bawang merah sebagai BWM-01, jadi tidak diunduh ulang sesuai KETENTUAN bagian 4. Penting untuk dicatat: COLD terbit sebagai DUA DOI terpisah yang b… |
| `KEN-12-phytoscope-zenodo` | PhytoScope: A Public Benchmark Dataset … | DOI 10.5281/zenodo.21383492. DUPLIKASI DICEGAH: sudah diklaim agen tomat sebagai TOM-12-phytoscope-lapangan (benchmark deteksi & lokalisasi penyakit multi-tanaman, 25 tanaman, format YOLO, citra lapangan) di d… |
| `KEN-13-soil-weather-zenodo` | Soil-Weather Multivariate Crop Disease … | DOI 10.5281/zenodo.19885785. DUPLIKASI DICEGAH: sudah diklaim agen tomat sebagai TOM-10-cuaca-tanah-tabular (250.000 observasi tanah+cuaca+penyakit) di datasets/additional/TOM-10-cuaca-tanah-tabular. Tidak diu… |
| `KEN-23-cip-lateblight-advisor` | Lateblight Advisor: A Weather-Driven De… | DOI 10.21223/P3/PIH5W1. DITOLAK: rekaman Dataverse ini mendeskripsikan dashboard Python Shiny, dan panggilan API menunjukkan NOL berkas terlampir - tidak ada yang bisa diunduh. Sesuai KETENTUAN bagian 5, halam… |
| `KEN-24-cip-digital-dss` | Digital Decision Support Tool for Late … | DOI 10.21223/EVRRAX. DITOLAK dengan alasan sama seperti KEN-23: panggilan API Dataverse menunjukkan NOL berkas terlampir meski lisensinya CC BY 4.0. Rekaman perangkat lunak/alat, bukan dataset. |
| `TOM-28-gts-taiwan-pdf` | Taiwan Tomato Leaves Dataset (halaman G… | DOI 10.5281/zenodo.15095408. DITOLAK: rekaman ini BUKAN dataset. Satu-satunya berkasnya adalah gts_ai_dataset_download_taiwan_tomato_leaves_dataset.pdf, yaitu halaman pemasaran vendor yang mengarahkan ke gts.a… |
| `TOM-29-nepal-hawar-lampiran` | Field evaluation of tomato (Solanum lyc… | DOI 10.6084/m9.figshare.32909461. DITOLAK: hanya berkas pendukung artikel jurnal - satu gambar JPG dan satu dokumen Word. Tidak ada tabel data ketahanan varietas yang bisa dipakai kembali. Topiknya relevan (uj… |

## 5. Duplikasi yang ditemukan

### 5.1 Sumber sama diklaim dua agen

| sumber | baris | penyelesaian |
|---|---|---|
| https://data.mendeley.com/datasets/m4m6j2tjfj/4 | `CAB-12-tcp-tomat-cabai-pepaya`, `TOM-37-tcp-tomat-cabai-pepaya` | diunduh sekali sebagai `CAB-12-tcp-tomat-cabai-pepaya`; sisanya menunjuk ke sana |
| https://data.mendeley.com/datasets/sd5m3mgvvx/1 | `KEN-19-sfld-solanaceae-mendeley`, `TOM-24-sfldd-solanaceae` | tidak ada yang diunduh |
| https://data.mendeley.com/datasets/tf9dtfz9m6/2 | `BWM-A09-cold-chilli-koppal`, `CAB-11-cold-chilli-koppal` | diunduh sekali sebagai `CAB-11-cold-chilli-koppal`; sisanya menunjuk ke sana |

### 5.2 Isi identik di dalam arsip berbeda

Diuji dengan `datasets/metadata/periksa-tumpang-tindih.py`: sidik (CRC32, ukuran) setiap berkas di dalam ZIP dan setiap berkas lepas, dibandingkan antar dataset. **Ini batas bawah** — salinan yang diperkecil atau dikode ulang punya CRC berbeda dan tidak tertangkap di sini.

| berkas identik | dataset A | % isi A | dataset B | % isi B |
|---:|---|---:|---|---:|
| 1523 | `CAB-03-chilli-6-kelas-bangladesh` | 19.2% | `CAB-08-cercospora-sergipe-zenodo` | 99.9% |
| 2567 | `KEN-04-plantdoc-lapangan` | 99.8% | `KEN-05-plantdoc-deteksi-objek` | 49.5% |
| 856 | `CAB-05-pepper-leaf-figshare` | 86.1% | `TOM-01-plantvillage` | 0.5% |
| 257 | `KEN-04-plantdoc-lapangan` | 10.0% | `TOM-05-pakistan-lapangan` | 3.2% |
| 257 | `KEN-05-plantdoc-deteksi-objek` | 5.0% | `TOM-05-pakistan-lapangan` | 3.2% |
| 29 | `TOM-01-plantvillage` | 0.0% | `TOM-04-tomat-9-kelas-zenodo` | 0.7% |

## 6. Lampiran — rincian tiap dataset yang ada di disk

### `BWM-01-onion-cold-mendeley` — Onion dataset (bagian onion dari COLD - Chilli and Onion Leaf Dataset)

- **Tanaman**: bawang-merah|lainnya — bawang merah (Allium cepa, India)
- **Penyakit/kelas**: purple blotch (Alternaria porri/trotol); Iris yellow virus (IYSV); Stemphylium leaf blight + Colletotrichum leaf blight (gabungan); healthy
- **Jenis / format**: gambar (gambar) · JPG dalam 3 arsip RAR
- **Jumlah**: 7004 gambar (4502 teraugmentasi berlabel + 816 mentah berlabel + 1686 tanpa label) · **Ukuran**: 111.10 MB
- **Sumber**: Mendeley Data (Elsevier) (2024) — <https://data.mendeley.com/datasets/7nxxn4gj5s/2>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/bawang-merah/BWM-01-onion-cold-mendeley` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `sebagian`
- **Catatan**: Set teraugmentasi cocok PERSIS dengan artikel Data in Brief (4502: healthy 1278, IYSV 1272, leaf blight 1217, purple blotch 735). Set mentah: diklaim 864, terhitung 816 (selisih 48) -> karena itu 'sebagian'. Bawang bombay India (Koppal, Karnataka), BUKAN shallot Indonesia. Augmentasi 5,5x tercampur - risiko kebocoran data bila split acak. purple blotch hanya 18 gambar asli. Stemphylium+Colletotrichum digabung jadi satu kelas. Artikel merujuk v3 tapi repositori hanya punya v1-v2 (v3/v4 -> error 404). Lisensi dataset CC BY 4.0 vs artikel CC BY-NC - tidak cocok.

### `BWM-02-onion-bulb-leaf-mendeley` — Image Dataset of Red and White Onion Bulbs and Leaves

- **Tanaman**: bawang-merah|lainnya — bawang merah (Allium cepa, red/white onion)
- **Penyakit/kelas**: TIDAK ADA nama penyakit - hanya biner Healthy/Unhealthy
- **Jenis / format**: gambar (gambar) · JPG dalam ZIP
- **Jumlah**: diklaim 16300, terhitung 16300 (cocok persis) · **Ukuran**: 1.61 GB
- **Sumber**: Mendeley Data (Elsevier) (2026) — <https://data.mendeley.com/datasets/42bcyncfhy/2>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/bawang-merah/BWM-02-onion-bulb-leaf-mendeley` · **SHA-256**: `e09611742de689e0a95ca07be2d2ee25bba446f268a2d185d2c5baa45bdc76b3`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: testzip() -> None (CRC bersih), tanpa password, 16323 entri = 16300 JPG + 23 direktori. TIDAK ADA LABEL PENYAKIT - batas pemakaian utama. 75% isinya umbi (12260) bukan daun (4040); daun bergejala hanya 2020. 'Red onion' = bawang bombay kulit merah, BUKAN A. cepa var. aggregatum Indonesia. Cacah terlalu rapi (1010 berulang di 8 kelas) -> dugaan studio/augmentasi. Asal geografis tidak dinyatakan. Unduhan putus di 933 MB, dilanjut dengan curl -C -.

### `BWM-04-ditjenhorti-opt-pestisida` — Buku Direktorat Perlindungan Hortikultura: hama-penyakit cabai & daftar pestisida terdaftar

- **Tanaman**: cabai|kentang|bawang-merah|lainnya — bawang merah; cabai; kentang; kubis
- **Penyakit/kelas**: Spodoptera exigua; Liriomyza; Alternaria porri (trotol); Peronospora destructor; Colletotrichum gloeosporioides; Fusarium (moler); antraknosa cabai; Phytophthora
- **Jenis / format**: teks (teks) · PDF (3 berkas, PDF 1.5)
- **Jumlah**: 3 dokumen, 133 halaman (26+58+49) · **Ukuran**: 9.10 MB
- **Sumber**: Direktorat Jenderal Hortikultura, Kementerian Pertanian RI (penyusun: Balitsa Lembang & BPTP Jambi) (2024 (isi 2012 & 2014)) — <https://hortikultura.pertanian.go.id/buku-direktorat-perlindungan/>
- **Lisensi**: tidak dinyatakan (`tidak dinyatakan`)
- **Lokal**: `datasets/additional/BWM-04-ditjenhorti-opt-pestisida` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: pypdf: 26/58/49 halaman, is_encrypted=False. Ekstraksi teks penuh mengonfirmasi isi (M-61 memuat 'bawang merah' 6x, 'trotol' 2x, 'bercak ungu' 2x, spodoptera 4x, colletotrichum 4x, peronospora 2x). MASALAH: isi kadaluwarsa 12-14 tahun - daftar pestisida 2012 tidak boleh dipakai sebagai rujukan izin edar yang berlaku (pakai PUKPES). Tabel utama kemungkinan besar GAMBAR (rasio ekstraksi hanya 540-905 char/halaman; asal PowerPoint '/Title=Slide 1') sehingga butuh OCR. Semua salinan berwatermark; versi bersih 14bookcabe.pdf -> 404. TOMAT tidak punya buku sendiri. Cek data pribadi: 0 nomor HP; hanya 2 email institusi BPTP Jambi.

### `BWM-05-eppo-distribusi-inang` — EPPO Global Database: tabel distribusi geografis & daftar tanaman inang

- **Tanaman**: cabai|tomat|kentang|bawang-merah|lainnya — lintas komoditas (inang mencakup Allium ascalonicum, Allium cepa, Capsicum annuum, Solanum lycopersicum, Solanum tuberosum)
- **Penyakit/kelas**: PLEOAL Stemphylium vesicarium; PHYTIN Phytophthora infestans; LIRIHU/LIRISA/LIRITR Liriomyza; OYDV00 Onion yellow dwarf virus; BEMITA Bemisia tabaci; RALSSL Ralstonia solanacearum
- **Jenis / format**: tabular (tabular) · CSV (14 berkas, UTF-8 BOM)
- **Jumlah**: 1803 baris data · **Ukuran**: 392.00 KB
- **Sumber**: EPPO (European and Mediterranean Plant Protection Organization) (2026 (basis data hidup)) — <https://gd.eppo.int/taxon/>
- **Lisensi**: tidak dinyatakan (`tidak dinyatakan`)
- **Lokal**: `datasets/additional/BWM-05-eppo-distribusi-inang` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: Rute CSV gd.eppo.int TERBUKA tanpa akun (API REST data.eppo.int butuh token -> 403, tidak dipakai). LUBANG BESAR: 6 OPT terpenting bawang merah semuanya 404 (ALTEPO Alternaria porri, PERODE Peronospora destructor, FUSACE Fusarium f.sp. cepae, BOTRAL Botrytis allii, LAPHEG Spodoptera exigua, COLLGL Colletotrichum) - lubang CAKUPAN, bukan pembatasan akses; EPPO hanya menyimpan tabel untuk OPT karantina. Jebakan kode: LAPHEX = S. exempta bukan exigua; Stemphylium ada di bawah teleomorf PLEOAL (STEMVE 404). Granularitas Indonesia hanya tingkat pulau (Java/Sumatra/Sulawesi/Nusa Tenggara/Irian Jaya) - tidak ada provinsi. TANPA dimensi waktu. RALSSL di Indonesia tercatat 'Absent, unreliable record' - jangan dibaca sebagai bukti ketiadaan. Content-Type salah label (mengaku xlsx, isinya CSV). hosts_LIRIHU.csv memuat ALLAS Allium ascalonicum eksplisit; hosts_OYDV00.csv 17/17 barisnya Allium.

### `BWM-06-gbif-okurensi-patogen` — GBIF: okurensi & faset negara/tahun untuk 15 patogen & hama komoditas prioritas

- **Tanaman**: lainnya — lintas komoditas (organisme pengganggu)
- **Penyakit/kelas**: Alternaria porri; Fusarium oxysporum f.sp. cepae; Peronospora destructor; Stemphylium vesicarium; Colletotrichum gloeosporioides; Botrytis allii; Spodoptera exigua; Liriomyza huidobrensis/sativae/trifolii; OYDV; Bemisia tabaci; Ralstonia solanacearum; Phytophthora infestans; Alternaria solani
- **Jenis / format**: tabular (tabular) · JSON (45 respons API)
- **Jumlah**: 125952 okurensi global tercakup; 610 rekaman Indonesia tersimpan penuh (73 medan/rekaman) · **Ukuran**: 3.20 MB
- **Sumber**: GBIF (Global Biodiversity Information Facility) (2026 (basis data hidup)) — <https://api.gbif.org/v1/occurrence/search>
- **Lisensi**: CC BY 4.0 (584 rekaman) & CC0 1.0 (26 rekaman) (`CC BY`)
- **Lokal**: `datasets/additional/BWM-06-gbif-okurensi-patogen` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: Terbuka penuh TANPA kunci API. 15/15 matchType=EXACT; seluruh kueri country=ID endOfRecords=true (tidak terpotong). TEMUAN UTAMA: 4 organisme NOL rekaman Indonesia - Fusarium f.sp. cepae (moler), Peronospora destructor (embun bulu), Botrytis allii (busuk umbi), Phytophthora infestans (busuk daun kentang). Ketiadaan = tidak ada penyetoran data dari Indonesia, BUKAN ketiadaan patogen. Hanya 30 dari 610 rekaman Indonesia punya stateProvince, 5 nilai berbeda ('Jawa','Sumatera' bukan provinsi; 'Irian Jaya' usang). basisOfRecord mayoritas MATERIAL_SAMPLE (406) = isolat lab dari penyetoran sekuens, OBSERVATION hanya 1. Koordinat sering kosong. Fusarium f.sp. cepae cocok sebagai SYNONYM rank FORM. Bias kuat ke negara kaya-data (S. exigua: GB 11081 vs ID 50). Tanpa DOI -> tidak reproducible persis. PERINGATAN PII: medan recordedBy/identifiedBy bisa memuat nama kolektor - jangan disebarkan ke antarmuka publik.

### `BWM-07-serangan-opt-hortikultura` — Luas serangan OPT hortikultura - statistik sektoral daerah (Sumut, Kota Batu, Kotabaru, Kab. Malang)

- **Tanaman**: lainnya — 'Hortikultura' sebagai satu kategori gabungan - TIDAK ada rincian per komoditas
- **Penyakit/kelas**: tidak ada rincian jenis OPT - hanya luas area terserang (Ha) atau rasio penanganan (%)
- **Jenis / format**: tabular (tabular) · 3 XLSX + 2 CSV
- **Jumlah**: 41 baris data seluruhnya · **Ukuran**: 36.00 KB
- **Sumber**: portal statistik sektoral/Satu Data daerah (Dinas KPTPH Sumut; Dinas Pertanian Kota Batu; Pemkab Kotabaru; Dinas TPHP Kab. Malang) (2024-2026 (cakupan data 2020-2025)) — <https://data.go.id/dataset?q=serangan+OPT>
- **Lisensi**: tidak dinyatakan (`tidak dinyatakan`)
- **Lokal**: `datasets/additional/BWM-07-serangan-opt-hortikultura` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: openpyxl + modul csv, seluruh sheet dibaca. CACAT MEMATIKAN: tidak ada rincian per komoditas - Kab. Malang seluruh kabupaten diwakili SATU angka 518,52 Ha. Berkas Sumut bukan luas melainkan RASIO (%) yang nyaris biner 0/100. Tidak menyentuh SATU PUN sentra bawang merah (tidak ada Brebes, Nganjuk, Bima, Solok, Probolinggo). Deret waktu maksimal 5 titik tahunan, tidak ada bulanan. DATA PRIBADI ADA di malangkab-*.xlsx: blok tanda tangan pejabat berisi nama bergelar + NIP + email dinas (terdeteksi 1 NIP, 1 email, 2 pola gelar). NIP memuat tanggal lahir pada 8 digit pertama. Nilai persis SENGAJA TIDAK dicetak di README/struktur; ingest wajib membuang blok tanda tangan. Berkas Malang dibuat saat diminta (memuat tanggal cetak dinamis) sehingga SHA-256-nya TIDAK STABIL. Satu berkas Kota Batu kedua gagal 404.

### `BWM-08-globi-interaksi-inang` — GloBI: interaksi patogen/hama - tanaman inang untuk OPT komoditas prioritas

- **Tanaman**: cabai|tomat|kentang|bawang-merah|lainnya — keempat komoditas prioritas muncul sebagai inang (Allium ascalonicum, Allium cepa, Capsicum annuum, Solanum lycopersicum, Solanum tuberosum)
- **Penyakit/kelas**: 14 organisme x 3 jenis interaksi (pathogenOf, hasHost, interactsWith): Alternaria porri; Alternaria solani; Botrytis allii; Bemisia tabaci; Colletotrichum gloeosporioides; Fusarium oxysporum; 3 Liriomyza; Peronospora destructor; Phytophthora infestans; Ralstonia solanacearum; Spodoptera exigua; Stemphylium vesicarium
- **Jenis / format**: tabular (tabular) · CSV (39 berkas)
- **Jumlah**: 14532 baris data · **Ukuran**: 6.30 MB
- **Sumber**: GloBI (Global Biotic Interactions) (2026 (basis data hidup)) — <https://api.globalbioticinteractions.org/interaction>
- **Lisensi**: tidak dinyatakan (arsip Zenodo GloBI: CC-BY-4.0 & CC0) (`CC0`)
- **Lokal**: `datasets/additional/BWM-08-globi-interaksi-inang` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `sebagian`
- **Catatan**: Terbuka tanpa kunci API. NILAI UTAMA: menambal lubang EPPO - 4 patogen endemik bawang merah yang 404 di EPPO justru ADA di sini, dan Allium ascalonicum muncul eksplisit 19 kali (Alternaria porri 4, Peronospora destructor 4, Botrytis allii 4, Spodoptera exigua 6, Stemphylium vesicarium 1). Ke-14 organisme punya kecocokan komoditas prioritas. SEBAGIAN karena 9 berkas TERPOTONG tepat di 1024 baris (batas halaman API tidak dilewati). MASALAH TERBESAR: kolom provenans SELURUHNYA KOSONG - study_citation 0/14532, study_source_citation 0/14532, latitude 0/14532; parameter fields= menerima nama kolom tapi mengembalikan nilai kosong -> tidak ada baris yang bisa ditelusuri ke publikasi asalnya. Duplikasi berat (124 baris untuk 48 target unik). Serangga mengembalikan 0 di pathogenOf - harus dikueri lewat hasHost/interactsWith. Fusarium dikueri di tingkat spesies, BUKAN f.sp. cepae -> jangan dibaca sebagai daftar inang moler.

### `BWM-09-wikidata-patogen-inang` — Wikidata: relasi patogen/hama - inang (P2975) untuk 4 komoditas prioritas

- **Tanaman**: cabai|tomat|kentang|bawang-merah|lainnya — Allium cepa; Allium ascalonicum; Capsicum annuum; Capsicum frutescens; Solanum lycopersicum; Solanum tuberosum
- **Penyakit/kelas**: 271 organisme unik termasuk Alternaria solani; Fusarium oxysporum (+f.sp. lycopersici); Stemphylium lycopersici/solani; Colletotrichum gloeosporioides/coccodes; Ralstonia solanacearum; Phytophthora capsici/cryptogea; 7 Spodoptera; 4 Liriomyza
- **Jenis / format**: tabular (tabular) · CSV + JSON (respons SPARQL asli)
- **Jumlah**: 291 baris, 271 patogen unik · **Ukuran**: 203.00 KB
- **Sumber**: Wikidata Query Service (2026 (basis data hidup)) — <https://query.wikidata.org/sparql>
- **Lisensi**: CC0 1.0 (`CC0`)
- **Lokal**: `datasets/additional/BWM-09-wikidata-patogen-inang` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: Terbuka tanpa akun. Cek silang: JSON 291 binding = CSV 291 baris. LISENSI PALING BERSIH di seluruh koleksi (CC0, bebas terbit ulang). TAPI CAKUPAN BAWANG MERAH NYARIS NIHIL: hanya 8 baris untuk Allium ascalonicum dan 1 untuk Allium cepa; Allium cepa var. aggregatum -> 0. Kedelapan-delapannya SERANGGA Lepidoptera - TIDAK ADA satu pun jamur/bakteri/virus. Dicek per genus: Peronospora 0, Botrytis 0, Bemisia 0; Alternaria hanya solani & tomato (porri TIDAK ADA); Stemphylium hanya lycopersici & solani (vesicarium TIDAK ADA); Fusarium hanya f.sp. lycopersici (bukan cepae). Bias 92% ke tomat+kentang (269/291). Jebakan: format=csv tidak dihormati bila header Accept menyebut lain -> permintaan pertama mengembalikan XML bernama .csv; ditangkap oleh 'file' lalu diambil ulang.

### `CAB-01-penyakit-kuning-begomovirus-jabar` — A dataset of Yellow Disease in Horticultural Plant

- **Tanaman**: cabai|lainnya — cabai; terung; kacang panjang
- **Penyakit/kelas**: Begomovirus positive; Begomovirus negative (penyakit kuning/virus kuning keriting daun), label divalidasi PCR
- **Jenis / format**: gambar (gambar) · JPG 640x640 + TXT anotasi YOLO (berkas lepas)
- **Jumlah**: 5095 citra + 5095 anotasi = 10190 berkas, TAPI hanya 1959 citra unik (3136 salinan byte-identik, 61,6%); 5861 kotak (kelas 0: 3169, kelas 1: 2692) · **Ukuran**: 223.64 MB
- **Sumber**: Mendeley Data (2024) — <https://data.mendeley.com/datasets/9x9kf9vwph/1>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/additional/CAB-01-penyakit-kuning-begomovirus-jabar` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: SATU-SATUNYA dataset cabai berdata Indonesia (Bogor, Kota Bogor, Cianjur - Jawa Barat). Seluruh 10190 SHA-256 dicocokkan dengan nilai umuman Mendeley: 0 selisih. MASALAH: identitas tanaman hilang - tidak ada penanda apa pun yang memisahkan cabai dari terung/kacang panjang. Arah label 0/1 tidak dinyatakan. 97% nama berkas berpola Screenshot-2023-10-xx, tidak cocok dengan klaim foto kamera ponsel 13 MP; tanggal pada nama (Okt 2023, Jan/Agu/Sep 2023) tidak ada yang jatuh di jendela pengumpulan yang diklaim (22 Jul-9 Agu 2023). DUPLIKASI 61,6%: SHA-256 seluruh 5095 citra hanya menghasilkan 1959 nilai unik - angka yang sama persis dengan jumlah nama dasar unik, sehingga ketiga varian tiap nama dasar adalah SALINAN BIT-DEMI-BIT. Ini membantah metode yang ditulis sumber (citra diperbanyak dengan teknik cropping): tidak ada pemotongan yang terjadi. Angka efektifnya 1959 citra berbeda, bukan 5095; pembagian acak akan menaruh salinan identik di kedua sisi. 4785 dari 5095 anotasi hanya 1 kotak yang menutupi hampir seluruh bingkai. Ditaruh di additional/ karena 3 tanaman.

### `CAB-02-chilcv-coimbatore-figshare` — Chilli Leaf Curl Virus Dataset Final Ver

- **Tanaman**: cabai — cabai
- **Penyakit/kelas**: Healthy control; Initial Symptoms of ChiLCV; Severe Symptoms of ChiLCV (Begomovirus keriting daun, bertingkat keparahan)
- **Jenis / format**: campuran (campuran) · JPG dalam ZIP + metadata CSV/XLSX/TXT
- **Jumlah**: diklaim 22069, terhitung 22829 berkas TAPI hanya 12223 unik (10606 salinan byte-identik, 46,5%); split berkas Train 17655/Val 2207/Test 2207/OOD 760, hash unik 7304/2157/2172/592 · **Ukuran**: 1.03 GB
- **Sumber**: figshare (2026) — <https://figshare.com/articles/dataset/Chilli_ChiLCV_Final_Ver_Dataset/32820110>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/cabai/CAB-02-chilcv-coimbatore-figshare` · **SHA-256**: `e9273c218e2669e5f7ae61f8faf8689cf4a8d18049d1fb26c2c97bab9664af0d`
- **Status**: unduh `diunduh` · verifikasi `sebagian`
- **Catatan**: MD5 lokal cocok dengan computed_md5 Figshare. Dataset cabai terbaik dalam panen ini: metadata lapangan per gambar (image_name, class, plant_id, village, acquisition_date, session_id) untuk 880 tanaman ber-ID yang difoto berulang lintas 10 sesi - bisa dipakai untuk kurva perkembangan penyakit, bukan cuma klasifikasi. Ada OOD_Set terpisah dengan 3 model ponsel. Split dipisah per desa (bukan acak). SELISIH: cacah 22829 vs klaim 22069; README internal menyebut OOD 750 vs deskripsi 760 vs isi 760, dan Training 880 tanaman vs 364 di berkas deskripsi; Field-Validation Dataset 500 sampel yang disebut README TIDAK ADA di arsip. DUPLIKASI 46,5%: dari 4927 kelompok duplikat, 4925 tetap di dalam satu split DAN satu kelas, hanya 2 yang menyeberang Train-Test dan 0 yang menyeberang kelas - jadi pembagian latih/uji praktis tetap sahih, yang harus dikoreksi adalah angkanya (12223, bukan 22069). Dua pasangan yang menyeberang itu byte-identik tetapi mengklaim DESA dan TANGGAL berbeda, jadi metadata lapangannya tidak 100% bisa dipercaya. Hanya satu penyakit. India (Coimbatore), bukan Indonesia. Flutter Source Code.zip (489,64 MiB) sengaja tidak diunduh: kode, bukan data.

### `CAB-03-chilli-6-kelas-bangladesh` — Chilli Leaf Disease Image Dataset for Classification and Early Diagnosis in Agriculture

- **Tanaman**: cabai — cabai
- **Penyakit/kelas**: Bacterial_Spot; Cercospora_Leaf_Spot; Curl_Virus; Healthy_Leaf; Nutrition Deficiency; Powdery Mildew
- **Jenis / format**: gambar (gambar) · JPG/PNG - 4 kelas dalam ZIP, 2 kelas berkas lepas
- **Jumlah**: diklaim 8814, terhitung 8817 (Cercospora 1898; Healthy 1647; Bacterial 1629; Curl 1590; Nutrition 1207; Powdery 846) · **Ukuran**: 3.04 GB
- **Sumber**: Mendeley Data (2025) — <https://data.mendeley.com/datasets/tm3v4zmh7c/1>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/cabai/CAB-03-chilli-6-kelas-bangladesh` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `sebagian`
- **Catatan**: Seluruh 2057 berkas SHA-256 cocok dengan umuman Mendeley (0 selisih); keempat ZIP lolos unzip -t. TEMUAN UTAMA: klaim "8814 gambar resolusi tinggi (1000x1000)" TIDAK BENAR - sensus dimensi seluruh 8817 gambar menunjukkan hanya 23,0% yang 1000x1000, sedangkan 40,6% berukuran 256x256 dan 41,4% bersisi <512 px; ada 1968 ukuran berbeda. Powdery Mildew 92% berukuran 256x256, Curl_Virus 76%, Nutrition Deficiency 72%. Cercospora punya 1525 ukuran berbeda untuk 1898 gambar (pola scraping). Campuran PNG+JPG dalam satu kelas. TEMUAN KEDUA: kelas Cercospora_Leaf_Spot terbukti 90,5% menyalin CAB-08 - 1523 dari 1683 citra uniknya BYTE-IDENTIK dengan Cercospora Leaf Spot in Chili Pepper Leaves Image Dataset (Universidade Federal de Sergipe, Brasil, terbit 2024-08-08, 15 bulan lebih dulu), dengan nama berkas diganti sehingga jejak __roi_backremoved hilang; kedua dataset bahkan sama-sama membawa 215 salinan internal berlebih. Jadi keterangan lokasi Bangladesh untuk kelas Cercospora tidak sesuai bukti, dan CAB-03 tidak boleh digabung dengan CAB-08 dalam satu himpunan latih. Tanpa anotasi/metadata/split. Tidak ada kelas antraknosa. Bangladesh, bukan Indonesia.

### `CAB-04-chili-4-kelas-dhaka` — Chili Leaf Disease Dataset: Annotated Smartphone Images of Anthracnose, Cercospora Leaf Spot, Leaf Curl Disease, and Healthy Leaves in Bangladesh

- **Tanaman**: cabai — cabai
- **Penyakit/kelas**: Anthracnose; Cercospora Leaf Spot; Leaf Curl Disease; Fresh Leaf (sehat)
- **Jenis / format**: campuran (campuran) · JPG dalam ZIP per kelas + 2 CSV metadata per gambar
- **Jumlah**: dataset penuh 1515 citra (Fresh Leaf 432; Leaf Curl 369; Cercospora 367; Anthracnose 347); yang ada di disk 1146 citra dari 3 kelas, semuanya unik · **Ukuran**: 2.20 GB
- **Sumber**: Mendeley Data (2026) — <https://data.mendeley.com/datasets/wzc6r6w5w5/3>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/cabai/CAB-04-chili-4-kelas-dhaka` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `sebagian`
- **Catatan**: DATASET CABAI PALING BERSIH dalam panen ini. CSV metadata memuat image_hash perseptual: 0 duplikat, dan 0 hash yang muncul di lebih dari satu kelas. Kelas seimbang (347-432). Resolusi tinggi sungguhan (4080x3072 dan 4000x3000 mendominasi). Satu-satunya sumber ANTRAKNOSA daun (347 citra) - penyakit cabai terpenting di Indonesia. SEBAGIAN: total DOI 3099 MiB melebihi batas 3 GB/dataset, jadi hanya Anthracnose.zip + Cercospora Leaf Spot.zip + Fresh Leaf.zip + 2 CSV yang diunduh; "Leaf Curl Disease.zip" (1002 MiB, 369 citra) sengaja dilewati karena keriting daun sudah tercakup berlimpah di CAB-02 (22829 citra) dan CAB-03. Uji duplikat SHA-256 sendiri atas ketiga ZIP: 347/347, 367/367, 432/432 unik - 0% duplikat, satu-satunya dataset citra cabai dalam panen ini yang sebersih itu, dan tidak ada satu gambar pun yang beririsan dengan CAB-01, CAB-05, CAB-09, atau CAB-12. Anthracnose.zip memuat 347 gambar asli + 347 stub __MACOSX, sehingga unzip -l tanpa penyaringan akan melaporkan cacah dua kali lipat. Bangladesh, bukan Indonesia.

### `CAB-05-pepper-leaf-figshare` — Pepper Leaf DataSet

- **Tanaman**: cabai|lainnya — paprika (bell pepper)
- **Penyakit/kelas**: Pepper__bell___healthy; Leaf_Curl; Pepper__bell___Bacterial_spot_Leaf_Curl_Cercospora; Cerespora (ejaan asli)
- **Jenis / format**: gambar (gambar) · JPG/PNG/WEBP dalam ZIP
- **Jumlah**: diklaim 423, terhitung 1308 berkas gambar TAPI hanya 992 unik (316 salinan byte-identik, 24,2%) · **Ukuran**: 28.24 MB
- **Sumber**: figshare (2025) — <https://figshare.com/articles/dataset/Pepper_Leaf_DataSet/29298239>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/cabai/CAB-05-pepper-leaf-figshare` · **SHA-256**: `1bdcc96f3978c80bbbc679d25fa24771ca2a67536e274c74a5e4f259617fc3a5`
- **Status**: unduh `diunduh` · verifikasi `sebagian`
- **Catatan**: MD5 cocok dengan Figshare, TAPI LABELNYA TIDAK SAHIH. Pola nama berkas (___JR_B.Spot, ___JR_HL, NREC_B.Spot) membuktikan turunan PlantVillage paprika. Folder Leaf_Curl: 315 dari 335 berkas justru gambar B.Spot PlantVillage dan 2 gambar daun sehat - praktis tidak ada daun keriting. Folder Cerespora: 108 dari 226 juga berkas B.Spot. Kelas Pepper__bell___Bacterial_spot_Leaf_Curl_Cercospora menggabung tiga penyakit dalam satu nama (301/301 B.Spot). Hanya folder healthy (446/446) yang konsisten. DUPLIKASI 24,2%: 1308 berkas hanya 992 SHA-256 unik, sebagian besar dari pasangan " - Copy.jpg" di folder Leaf_Curl. Latar studio PlantVillage. Paprika, bukan cabai Indonesia. JANGAN dipakai melatih model tanpa pelabelan ulang.

### `CAB-06-antraknosa-nitrogen-tabular` — Nitrogen availability shapes anthracnose severity and defense-related responses in chili pepper (Capsicum annuum)

- **Tanaman**: cabai — cabai
- **Penyakit/kelas**: antraknosa (Colletotrichum fructicola)
- **Jenis / format**: tabular (tabular) · XLSX (9 lembar) + PDF + DOCX
- **Jumlah**: 3 berkas; 9 tabel, total sekitar 3700 baris · **Ukuran**: 1.60 MB
- **Sumber**: figshare (Taylor & Francis) (2026) — <https://tandf.figshare.com/articles/dataset/Nitrogen_availability_shapes_anthracnose_severity_and_defense-related_responses_in_chili_pepper_i_Capsicum_annuum_i_/31037350>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/cabai/CAB-06-antraknosa-nitrogen-tabular` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: Ketiga MD5 cocok dengan computed_md5 Figshare; file(1) mengonfirmasi tipe berkas. XLSX dibaca lewat python3 zipfile+ElementTree (XML mentah, tanpa membuka aplikasi/makro). ISI TERNYATA MOLEKULER, bukan epidemiologi: Table 1 resep media hara, Table 2 primer qRT-PCR, Table 3 daftar gen DEG, Table 4-8 pengayaan GO, Table 9 padanan gen cabai ke ortolog Arabidopsis. TIDAK ADA tabel keparahan penyakit, ukuran lesi, insidensi, cuaca, atau citra meski judulnya menyebut "anthracnose severity". Percobaan terkendali di Thailand; patogennya C. fructicola, bukan C. capsici/C. truncatum yang dominan di Indonesia.

### `CAB-08-cercospora-sergipe-zenodo` — Cercospora Leaf Spot in Chili Pepper Leaves Image Dataset

- **Tanaman**: cabai — cabai
- **Penyakit/kelas**: Cercospora leaf spot (bercak daun Cercospora)
- **Jenis / format**: gambar (gambar) · JPG dalam ZIP
- **Jumlah**: diklaim 1738, terhitung 1738 berkas JPG TAPI hanya 1523 unik (215 salinan berlebih, 12,4%) · **Ukuran**: 281.60 MB
- **Sumber**: Zenodo (Universidade Federal de Sergipe) (2024) — <https://zenodo.org/records/13272039>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/cabai/CAB-08-cercospora-sergipe-zenodo` · **SHA-256**: `18d10dec8559a3b4b37656d502055ba6c340c7d4f2987ec41edb9abe1362c8cc`
- **Status**: unduh `diunduh` · verifikasi `sebagian`
- **Catatan**: TEMUAN SILANG TERPENTING: seluruh 1523 citra unik dataset ini muncul BYTE-IDENTIK di dalam CAB-03-chilli-6-kelas-bangladesh/raw/Cercospora_Leaf_Spot.zip - yaitu 100% isi unik CAB-08 ada di CAB-03, dan 90,5% citra unik Cercospora CAB-03 (1523 dari 1683) sesungguhnya berasal dari sini. CAB-03 mengganti nama berkasnya (NNNN__roi_backremoved.jpg menjadi Cercospora Leaf Spot_NNN.jpg) sehingga jejak asalnya hilang, dan menyatakan citranya dikumpulkan di Bangladesh padahal ini data Brasil yang terbit 15 bulan lebih dulu. Kedua dataset bahkan sama-sama membawa 215 salinan internal berlebih. JANGAN gabungkan CAB-03 dan CAB-08 dalam satu himpunan latih. Keterbatasan lain: 12,4% duplikat internal; seluruh berkas sudah dipotong ROI dan latarnya dihapus (bukan foto lapangan utuh); TIDAK ADA mask/anotasi meski deskripsi menyebut untuk deteksi dan segmentasi lesi; kelas tunggal tanpa pembanding sehat; 1523 ukuran berbeda untuk 1738 gambar. Zenodo membalas HTTP 403 pembatasan laju tingkat jaringan selama sekitar 40 menit; berhasil setelah memakai User-Agent curl apa adanya, dan robots.txt diperiksa lebih dulu (ada baris eksplisit Allow: /api/records/*/files). Tidak ada login/paywall yang ditembus. Zenodo tidak mengumumkan sha256 di API sehingga pencocokan lintas penerbit tidak mungkin - hanya ukuran byte yang cocok.

### `CAB-09-pepper-penyakit-hama-mendeley` — Pepper Diseases and Pests Detection

- **Tanaman**: cabai|lainnya — cabai/paprika (tidak dinyatakan)
- **Penyakit/kelas**: TIDAK ADA LABEL di dalam arsip
- **Jenis / format**: gambar (gambar) · JPG dalam ZIP
- **Jumlah**: 100 berkas JPG (image_1..image_100), satu folder datar · **Ukuran**: 220.73 MB
- **Sumber**: Mendeley Data (2024) — <https://data.mendeley.com/datasets/8mvpntr47w/1>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/cabai/CAB-09-pepper-penyakit-hama-mendeley` · **SHA-256**: `58c7928899a7de3fce6ab2274e0e8a694978fcb8b2512a70ad920b17bd3aaafe`
- **Status**: unduh `diunduh` · verifikasi `sebagian`
- **Catatan**: SHA-256 cocok persis dengan umuman Mendeley - integritas unduhan pasti. TAPI isinya jauh lebih miskin dari deskripsi: sumber menjanjikan "gambar dan metadata beranotasi", yang tersedia hanya 100 JPG tanpa subfolder kelas, tanpa berkas anotasi, tanpa metadata. Nama arsipnya "PepperDiseaseTest" - kemungkinan hanya split uji dari koleksi lebih besar yang tidak diterbitkan. Tidak ada modalitas kedua meski naskah induknya berjudul multi-modal. Ukuran gambar 56 KB-10,9 MB (koleksi campuran). Asal geografis tidak dinyatakan. Tidak bisa dipakai melatih/menguji tanpa pelabelan ulang manual.

### `CAB-11-cold-chilli-koppal` — chilli dataset (bagian cabai dari COLD - Chilli and Onion Leaf Dataset)

- **Tanaman**: cabai — cabai
- **Penyakit/kelas**: cercospora/cerocospora; healthy; murda complex (tungau Polyphagotarsonemus latus + trips Scirtothrips dorsalis); nutritional deficiency; powdery mildew (Leveillula taurica)
- **Jenis / format**: gambar (gambar) · JPG dalam 3 arsip RAR (2 RAR5 + 1 RAR4)
- **Jumlah**: makalah mengklaim 10987, terhitung 13983 berkas JPG (resized_raw 1932; cropped 532; cropped_resized 11519). Arsip mentah per kelas: cerocospora 899; healthy 329; murda 275; nutritional 267; powdery mildew 162 · **Ukuran**: 544.03 MB
- **Sumber**: Mendeley Data (2024) — <https://data.mendeley.com/datasets/tf9dtfz9m6/2>
- **Lisensi**: CC BY 4.0 (metadata Mendeley) vs CC BY-NC 4.0 (makalah Data in Brief) - BERTENTANGAN (`CC BY-NC(-SA)`)
- **Lokal**: `datasets/priority/cabai/CAB-11-cold-chilli-koppal` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `sebagian`
- **Catatan**: Ketiga SHA-256 cocok dengan umuman Mendeley. Lingkungan tidak punya unrar/unar/7z, jadi daftar isi dibaca dengan mengurai HEADER RAR4/RAR5 langsung dari byte lewat skrip python3 sendiri (tanpa dekompresi, tanpa menjalankan apa pun) - karena piksel belum didekompresi, status sebagian. SATU-SATUNYA dataset dalam panen ini yang punya kelas HAMA (murda complex = tungau+trips) dan salah satu dari dua yang punya embun tepung. KEBOCORAN LATIH/UJI PARAH: 179 dari 227 indeks sumber di augment/test juga ada di augment/train (78,9%); plus 6 nama berkas identik di raw train dan test. Ejaan kelas tidak konsisten antar arsip (cercospora vs cerocospora dll). LISENSI BERTENTANGAN antara Mendeley (CC BY) dan makalah (CC BY-NC) - perlakukan sebagai NC. Makalah menyitasi versi .3 yang tidak ada di API (hanya v1 dan v2). India (Koppal, Karnataka).

### `CAB-12-tcp-tomat-cabai-pepaya` — TCP (Tomato-Chilli-Papaya Fruit & Leaf) Disease Dataset

- **Tanaman**: cabai|tomat|lainnya — cabai; tomat; pepaya
- **Penyakit/kelas**: cabai: Chili Bacterial Spot; Chili Healthy Leaf; Chilli Cercospora Leaf Spot; Chilli Curl Virus; Chilli Nutrition Deficiency; Chilli White spot; Disease Chilli (buah); Health chilli (buah). Plus 5 kelas tomat dan 7 kelas pepaya
- **Jenis / format**: gambar (gambar) · JPG/JPEG/PNG dalam ZIP
- **Jumlah**: 9541 gambar total (cabai 2818; tomat 4202; pepaya 2521); 9364 unik (177 salinan berlebih, 1,9%) · **Ukuran**: 199.40 MB
- **Sumber**: Mendeley Data (2026) — <https://data.mendeley.com/datasets/m4m6j2tjfj/4>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/additional/CAB-12-tcp-tomat-cabai-pepaya` · **SHA-256**: `07135e5acd1948b5c8c0d80401eb7fe4a13ef3e12717ca6ea16cc758bcc5fe49`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: SHA-256 dan ukuran byte cocok persis dengan umuman Mendeley; unzip -t lolos. Diambil agen cabai karena SATU-SATUNYA sumber CITRA BUAH CABAI dalam seluruh panen (Disease Chilli 174 + Health chilli 218) - semua dataset cabai lain hanya memotret daun, padahal antraknosa/patek menyerang buah. Juga satu-satunya yang punya kelas Chilli White spot. HANYA 1 DARI 2 BERKAS DI DOI yang diunduh: "Three Fruit and leaf crops disease dataset.zip" (1732 MiB) dilewati demi anggaran 8 GB/agen. Resolusi rendah (16-60 KB per gambar). Penamaan tidak konsisten (Chili vs Chilli). Kelas buah cuma Disease/Health tanpa nama penyakit. Tidak ada kelas antraknosa daun. Rajasthan, India. Ditaruh di additional/ karena 3 tanaman.

### `KEN-01-potatocare-umbi-mendeley` — PotatoCare: Deep learning based potato disease dataset

- **Tanaman**: kentang — kentang
- **Penyakit/kelas**: Black Scurf (Rhizoctonia solani); Blackleg; Blackspot Bruising; Brown Rot (Ralstonia solanacearum); Common Scab (Streptomyces scabies); Dry Rot (Fusarium); Pink Rot; Soft Rot (Pectobacterium); Healthy; Miscellaneous
- **Jenis / format**: gambar (gambar) · JPG/PNG dalam ZIP
- **Jumlah**: 3905 · **Ukuran**: 94.62 MB
- **Sumber**: Mendeley Data (2025) — <https://data.mendeley.com/datasets/7vm7xskfg4/2>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/kentang/KEN-01-potatocare-umbi-mendeley` · **SHA-256**: `51efd54088740b2215ce5afacbc3ca4c403b38083d353fcf409a40384a6049cc`
- **Status**: unduh `diunduh` · verifikasi `sebagian`
- **Catatan**: DOI 10.17632/7vm7xskfg4.2. Diklaim 10.117 gambar, terhitung 3.905; rincian per kelas penerbit (jumlah 3.891) cocok dengan isi arsip, jadi angka 10.117 kemungkinan pascaaugmentasi. SATU-SATUNYA dataset umbi berspektrum luas dalam panen ini. Ketimpangan kelas 28:1 (Dry Rot 1.355 vs Black Scurf 49). Asal gambar campuran tanpa provenans per berkas - risiko hak cipta bila diterbitkan ulang per gambar.

### `KEN-02-virus-daun-umbi-mendeley` — Potato Viral Disease Dataset on both Foliar and Tuber

- **Tanaman**: kentang — kentang
- **Penyakit/kelas**: Mosaic virus (daun); PLRV/Potato Leaf Roll Virus (daun); PSTVd/Potato Spindle Tuber Viroid (umbi); PVY tuber cracking (umbi); Crackingtype (umbi); Healthy leaf
- **Jenis / format**: gambar (gambar) · JPG dalam ZIP
- **Jumlah**: 6565 · **Ukuran**: 617.00 MB
- **Sumber**: Mendeley Data (2022) — <https://data.mendeley.com/datasets/rgfhzd5mzw/1>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/kentang/KEN-02-virus-daun-umbi-mendeley` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `sebagian`
- **Catatan**: DOI 10.17632/rgfhzd5mzw.1. Diunduh 3 dari 7 berkas (dataset penuh ~8,9 GB > batas 3 GB); sumber menyediakan berkas terpisah per kelas. Potato Leaf.zip + Potato Tuber.zip = 6.480 citra TURUNAN (tepat 1.080/kelas, rerata 4-5 KB, pola nama ImageDataGenerator). PSTVD.zip = 85 citra UMBI ASLI resolusi penuh Nikon D90 (rerata 6,6 MB), cocok persis dengan klaim penerbit. Asli seluruh dataset 1.972 citra. Dilewati: Crackingtype 3.399 MB, Mosaic_leaf 2.552 MB, PLRV_leaf 2.024 MB, Healthy leaf 284 MB. Latar hitam seragam. SATU-SATUNYA yang memasangkan gejala daun dan umbi untuk patogen sama.

### `KEN-03-daun-kentang-mendeley` — Potato Leaf Disease Dataset (BARI Chattogram, Bangladesh)

- **Tanaman**: kentang — kentang
- **Penyakit/kelas**: Bacterial Soft Rot; Fungal Late Blight (Phytophthora infestans); Viral Leaf Roll; Viral PVX; Viral PVY; Healthy
- **Jenis / format**: gambar (gambar) · JPG dalam ZIP
- **Jumlah**: 2351 · **Ukuran**: 38.39 MB
- **Sumber**: Mendeley Data (2026) — <https://data.mendeley.com/datasets/d5b3fzpw3g/1>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/kentang/KEN-03-daun-kentang-mendeley` · **SHA-256**: `549c7f3343422fa2b77b6fb2c5009a52215aa00626b2646435ba19f4826f8192`
- **Status**: unduh `diunduh` · verifikasi `sebagian`
- **Catatan**: DOI 10.17632/d5b3fzpw3g.1. Diklaim 2.400 (400/kelas), terhitung 2.351 (387-397/kelas). SELURUH berkas berawalan 'aug_' - 804 citra asli TIDAK diterbitkan, hanya turunan augmentasi. Split acak per berkas akan bocor lintas latih/uji. Diambil di lapangan nyata dengan iPhone 15, cahaya alami. Label virus tanpa konfirmasi ELISA/RT-PCR yang dinyatakan.

### `KEN-04-plantdoc-lapangan` — PlantDoc: A Dataset for Visual Plant Disease Detection (varian klasifikasi / Cropped-PlantDoc)

- **Tanaman**: tomat|kentang|lainnya — multi-tanaman (13 spesies, termasuk kentang & tomat)
- **Penyakit/kelas**: 28 kelas; kentang: Potato leaf early blight (117), Potato leaf late blight (105); tomat: 9 kelas (746 gambar); juga apel, paprika, blueberry, ceri, jagung, anggur, persik, raspberry, kedelai, labu, stroberi
- **Jenis / format**: gambar (gambar) · JPG/PNG dalam ZIP (train/ + test/)
- **Jumlah**: 2579 · **Ukuran**: 984.41 MB
- **Sumber**: GitHub - pratikkayal/PlantDoc-Dataset (2019) — <https://github.com/pratikkayal/PlantDoc-Dataset>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/additional/KEN-04-plantdoc-lapangan` · **SHA-256**: `345548bb3659519f425608b428d8a2ca338032b7b02c3cb3c3bb2954fc8986d9`
- **Status**: unduh `diunduh` · verifikasi `sebagian`
- **Catatan**: Tanpa DOI; makalah arXiv 1911.10317 / ACM 10.1145/3371158.3371196. Diklaim 2.598, terhitung 2.579 (selisih 19). Kentang hanya 222 gambar (8,6%) dalam 2 kelas dan TIDAK ADA kelas kentang sehat. Kelas 'Tomato two spotted spider mites leaf' hanya 2 gambar. Gambar hasil scraping internet - hak cipta per gambar tidak seragam meski repo CC BY 4.0. Nilai utamanya: citra LAPANGAN berlatar ramai, pelengkap PlantVillage yang berlatar studio. Ditugaskan ke agen kentang lewat KETENTUAN.md bagian 4.

### `KEN-05-plantdoc-deteksi-objek` — PlantDoc Object Detection Dataset (varian kotak-batas)

- **Tanaman**: tomat|kentang|lainnya — multi-tanaman (13 spesies, termasuk kentang & tomat)
- **Penyakit/kelas**: 29 kelas train / 27 test; kentang: Potato leaf (sehat, 11 kotak), Potato leaf early blight (333), Potato leaf late blight (250) = 594 kotak-batas; tomat: 2.932 kotak dalam 9 kelas
- **Jenis / format**: campuran (campuran (gambar + anotasi kotak-batas)) · JPG + PASCAL VOC XML + CSV, dalam ZIP
- **Jumlah**: 2594 · **Ukuran**: 994.77 MB
- **Sumber**: GitHub - pratikkayal/PlantDoc-Object-Detection-Dataset (2019) — <https://github.com/pratikkayal/PlantDoc-Object-Detection-Dataset>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/additional/KEN-05-plantdoc-deteksi-objek` · **SHA-256**: `5a1c4e745967c7cc13b4b38c407e933c5137074932339c00e0d4fc17506c68ac`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: ANOTASI IKUT, dua format: (a) PASCAL VOC XML satu berkas per gambar (bndbox xmin/ymin/xmax/ymax, banyak object per berkas), (b) train_labels.csv & test_labels.csv kolom filename,width,height,class,xmin,ymin,xmax,ymax. Total 8.921 kotak (8.469 train / 452 test) - ketimpangan train:test 19:1. 2.594 jpg vs 2.593 xml (satu gambar tanpa anotasi). Varian ini PUNYA kelas kentang sehat (11 kotak, hanya train) yang tidak ada di KEN-04. Nama berkas kotor bersisa query URL ('jpg?w=500&h=889'). Medan <path> di XML masih jalur mesin penulis. Gambar tumpang tindih dengan KEN-04 - jangan dicampur dalam satu split.

### `KEN-06-cip-hawar-genebank` — Replication Data for: Late blight severity in potato accessions from the CIP genebank core collection

- **Tanaman**: kentang — kentang
- **Penyakit/kelas**: Late blight (Phytophthora infestans) - skor keparahan lb1-lb5 dan indeks AUDPC
- **Jenis / format**: tabular (tabular) · TSV (.tab)
- **Jumlah**: 1517 · **Ukuran**: 165.38 KB
- **Sumber**: International Potato Center (CIP) Dataverse (2026) — <https://data.cipotato.org/dataset.xhtml?persistentId=doi:10.21223/P3/HJLUJZ>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/kentang/KEN-06-cip-hawar-genebank` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.21223/P3/HJLUJZ. 1.517 baris petak, 482 material, 14 kolom; 1.428 baris punya AUDPC. PENTING: endpoint API '?format=original' mengembalikan XLSX meski nama berkas .tab - berkas di raw/ diambil TANPA parameter itu sehingga benar-benar TSV. Nilai hilang ditulis string 'na'. Tidak ada koordinat, tanggal pengamatan, atau cuaca. Materialnya aksesi Andes (andigena, phureja, stenotomum), bukan varietas Indonesia.

### `KEN-07-cip-hawar-lbhtc2` — Replication Data for: Late blight severity in breeding clones from CIP's LBHTC2 breeding population

- **Tanaman**: kentang — kentang
- **Penyakit/kelas**: Late blight (Phytophthora infestans) - skor keparahan LB1-LB7 (persen luas terserang) dan indeks AUDPC
- **Jenis / format**: tabular (tabular) · TSV (.tab)
- **Jumlah**: 5808 · **Ukuran**: 538.15 KB
- **Sumber**: International Potato Center (CIP) Dataverse (2026) — <https://data.cipotato.org/dataset.xhtml?persistentId=doi:10.21223/P3/PN2RGR>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/kentang/KEN-07-cip-hawar-lbhtc2` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.21223/P3/PN2RGR. 5.808 baris petak, 2.755 genotipe unik, 7 titik waktu pengamatan; 5.484 baris punya AUDPC (rentang 70,0-2.677,5, rerata 775,0). Sama seperti KEN-06: jangan pakai '?format=original'. 218 baris tipe kosong dan petak bertanda 'empty' harus disaring. Tanggal tiap pengamatan tidak ada sehingga AUDPC tak bisa dihitung ulang. Populasi terseleksi tahan - sebaran bias ke arah tahan.

### `KEN-08-umbi-augmentasi-mendeley` — Potato Crop Disease Augmentation Dataset

- **Tanaman**: kentang — kentang
- **Penyakit/kelas**: common_scab (Streptomyces scabies); dry_rot (Fusarium); gangrene (Boeremia foveata); violet_root_rot (Helicobasidium purpureum); cut (luka mekanis); healthy
- **Jenis / format**: gambar (gambar) · JPG dalam ZIP
- **Jumlah**: 138000 · **Ukuran**: 742.83 MB
- **Sumber**: Mendeley Data (2025) — <https://data.mendeley.com/datasets/2rsrxwck2r/1>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/kentang/KEN-08-umbi-augmentasi-mendeley` · **SHA-256**: `1f135d7c1774950389bc71eaf93a944b33ee4e79cff0c8abfe511d57f602515e`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.17632/2rsrxwck2r.1. 138.000 gambar = 23.000 x 6 kelas seimbang sempurna, 10 jenis augmentasi. NOL CITRA ASLI: uji awk -F/ 'NF==3' memberi 0 berkas pada kedalaman induk; tidak ada pemetaan turunan-induk. Tidak bisa dipakai untuk evaluasi jujur. Augmentasi warna (42.000 gambar) merusak ciri pembeda utama antar busuk. SATU-SATUNYA sumber untuk gangren dan busuk akar ungu dalam panen ini - pakai sebagai rujukan visual basis pengetahuan, bukan data latih/uji.

### `KEN-09-cip-pengelolaan-terpadu` — Dataset for: Integrated management of late blight on potato

- **Tanaman**: kentang — kentang
- **Penyakit/kelas**: Late blight (Phytophthora infestans) - AUDPC, rAUDPC, tekanan penyakit, kelas ketahanan RLB, dan kehilangan/kenaikan hasil per perlakuan fungisida
- **Jenis / format**: tabular (tabular) · TSV (.tab) + XLSX kamus data
- **Jumlah**: 309 · **Ukuran**: 82.27 KB
- **Sumber**: International Potato Center (CIP) Dataverse (2020) — <https://data.cipotato.org/dataset.xhtml?persistentId=doi:10.21223/6RV436>
- **Lisensi**: tidak dinyatakan (`tidak dinyatakan`)
- **Lokal**: `datasets/priority/kentang/KEN-09-cip-pengelolaan-terpadu` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.21223/6RV436. LISENSI TIDAK DINYATAKAN (medan license bernilai null; Dataverse menampilkan teks baku 'made available without information on how it can be used') - PENERBITAN ULANG BERISIKO. 309 baris; perlakuan seimbang sempurna 103 Phosphonate / 103 Metalaxyl+Mancozeb / 103 Control; tahun 2010-2014; tekanan 195 High / 114 Low; 10 kultivar Afrika Timur; 4 lokasi Kenya bertaut GeoNames. Localities.tab punya 306 baris tapi hanya 4 terisi. Kolom YEAR bercampur '2011','2011a','2011b'.

### `KEN-10-hybrid-tuber-zenodo` — Hybrid Potato Tuber Dataset (Solanum tuberosum, Solanum phureja)

- **Tanaman**: kentang — kentang
- **Penyakit/kelas**: Buen estado / kondisi baik (18.000); Defectuoso / cacat (18.000) - penerbit menyebut subkategori luka permukaan, umbi bertunas, umbi busuk, tetapi subkategori itu TIDAK terwujud sebagai label
- **Jenis / format**: gambar (gambar) · JPG 224x224 dalam ZIP, sudah terbagi train/val/test
- **Jumlah**: 36000 · **Ukuran**: 191.75 MB
- **Sumber**: Zenodo (2026) — <https://zenodo.org/records/20616990>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/kentang/KEN-10-hybrid-tuber-zenodo` · **SHA-256**: `25db7ce6a0db2ec433e732c7d712eaf262c48f69946dcfdc423bbb646bb7691d`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.5281/zenodo.20616990 (versi 20616991). Pembuat: Armijos-Sarango, Cristian (Universidad Nacional de Loja, Ekuador). BERHASIL DIUNDUH pada percobaan kedua: 403 sebelumnya ternyata pembatasan laju sesaat Zenodo, bukan penyaringan permanen - berhasil dengan User-Agent penuh 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', satu permintaan pada satu waktu, dan --retry 4 --retry-delay 15. MD5 terhitung 468ed3a9e2e9e1c509cd38e0f42282a9 COCOK dengan checksum terbitan Zenodo. Terhitung 36.000 gambar, SAMA PERSIS dengan klaim (train 23.040 / test 7.200 / val 5.760; Buen estado 18.000 / Defectuoso 18.000). Uji kebocoran: 0 nama berkas muncul di >1 split, indeks 1..18000 per kelas tanpa lubang. KETERBATASAN: hanya biner - subkategori cacat tidak dilabeli, sehingga busuk tidak terpisah dari umbi bertunas; tidak dapat dipetakan ke nama patogen. Provenans per gambar terhapus oleh penomoran ulang dan dataset ini 'incorporating multiple public potato datasets', jadi tumpang tindih dengan KEN-01/KEN-08 tak dapat dikesampingkan dan tidak dapat dipastikan apakah augmentasi diterapkan sebelum split. Sudah diperkecil ke 224x224 (rerata 5,2 KB) sehingga tekstur halus hilang. PERAN: penapisan biner mutu umbi (grading), BUKAN diagnosis penyakit - KEN-01 tetap sumber utama diagnosis.

### `KEN-11-foliar-yolov8-zenodo` — Annotated Dataset for Potato Foliar Disease and Healthy Leaf Detection (Septoria, Early Blight, Late Blight, Healthy)

- **Tanaman**: kentang — kentang
- **Penyakit/kelas**: Alternaria / early blight (1.057 kotak); Lancha / late blight Phytophthora infestans (1.072); Septoria (548); Sana / sehat (383)
- **Jenis / format**: campuran (campuran (gambar + kotak-batas YOLOv8)) · JPEG 1024x1024 + label YOLOv8 .txt + data.yaml, dalam ZIP
- **Jumlah**: 3060 · **Ukuran**: 678.79 MB
- **Sumber**: Zenodo (2026) — <https://zenodo.org/records/20247345>
- **Lisensi**: CC BY-NC 4.0 (`CC BY-NC(-SA)`)
- **Lokal**: `datasets/priority/kentang/KEN-11-foliar-yolov8-zenodo` · **SHA-256**: `a3ad0a198f6df2c92ffc08f22baab623989f3d01a8e7e878528889d6be3446ab`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.5281/zenodo.20247345 (versi 20247346). Pembuat: Cuaycal Tirira, Diego Ernesto (Universidad Tecnica del Norte, Ekuador). BERHASIL DIUNDUH pada percobaan kedua setelah pembatasan laju Zenodo reda; unduhan diselesaikan dengan curl -C - (resume) karena melewati batas waktu harness. Ukuran 678.792.664 byte sama persis dengan yang dinyatakan Zenodo. Terhitung 3.060 gambar + 3.060 kotak (0 label kosong), SAMA PERSIS dengan klaim; split train 2.448 / valid 306 / test 306 dengan proporsi kelas terstratifikasi. LISENSI NON-KOMERSIAL - satu-satunya NC dalam panen kentang; tidak boleh dipakai bila produk turunannya komersial. PERCANGGAHAN: data.yaml bawaan menulis 'license: Private' (proyek Roboflow agronorteai/deteccion-de-enfermedades-en-hoj-s1dkz v7) sedangkan Zenodo menyatakan CC BY-NC 4.0; yang mengikat adalah Zenodo. DUPLIKASI SEBAGIAN: 2.152 dari 3.060 citra berasal dari PlantVillage (klaim agen tomat TOM-01), jadi tambahan bersihnya hanya ~908 citra lapangan Ekuador - jangan dijumlahkan begitu saja. Tepat satu kotak per gambar, jadi ini klasifikasi berbungkus format deteksi, bukan deteksi banyak objek. Diproses berat: padding putih ke 1024x1024 + CLAHE. Satu-satunya sumber kelas Septoria pada kentang, dan satu-satunya daun kentang berlabel YOLO siap latih.

### `KEN-14-fenotip-multitahun-zenodo` — Multi-year phenotypic dataset of potato genotypes evaluated for agronomic, biotic stress, and tuber traits

- **Tanaman**: kentang — kentang
- **Penyakit/kelas**: skor infeksi lapangan: Late blight (Phytophthora infestans); Virus; Rhizoctonia solani (patogen black scurf); plus hama Aphid (vektor virus) dan Mite
- **Jenis / format**: tabular (tabular) · XLSX 4 lembar (2022, 2023, 2024, Traits)
- **Jumlah**: 426 · **Ukuran**: 81.92 KB
- **Sumber**: Zenodo (2026) — <https://zenodo.org/records/21774103>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/kentang/KEN-14-fenotip-multitahun-zenodo` · **SHA-256**: `4553d835d9f1ea650656b7bec2d77523682b48c608afa581d0b193f2e3e15965`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.5281/zenodo.21774103 (versi 21774104). Pembuat: Quang Le Hoa; Ngoc Nguyen Tuan; Thi Nguyen Son; Thi Nguyen Thuy. BERHASIL DIUNDUH pada percobaan kedua. Diurai dengan zipfile+ElementTree langsung atas XML di dalam XLSX (tanpa menjalankan makro). 3 lembar tahun masing-masing 142 baris data x 29 kolom, 47 genotipe unik yang sama lintas tahun sehingga dapat dipasangkan; lembar Traits memuat kamus 26 sifat. NILAI KHAS 1: satu-satunya berkas tabular dalam panen ini yang mengukur Rhizoctonia solani di lapangan - menutup dari sisi tabular celah black scurf yang hanya punya 49 gambar di KEN-01. NILAI KHAS 2: asal Vietnam utara, dataran tinggi tropis Asia Tenggara - ANALOG AGROKLIMAT TERDEKAT dengan Dieng/Pangalengan/Modoinding di antara seluruh sumber tabular (bandingkan CIP di Peru dan KEN-09 di Kenya). KETERBATASAN: skala skor infeksi tidak dijelaskan sehingga hanya dapat ditafsir relatif; tidak ada AUDPC dan tidak ada pengamatan berulang dalam satu musim, jadi tidak bisa memodelkan kurva perkembangan penyakit; tidak ada cuaca/koordinat. Nama kolom memuat baris-baru di dalam sel ('Virus\nInfection ') dan spasi di ujung - perlu dinormalkan.

### `KEN-15-stagewise-hawar-zenodo` — Supporting data for: Stage-wise detection of late blight in field-grown potato

- **Tanaman**: kentang — kentang
- **Penyakit/kelas**: hawar daun bertahap: Healthy / ILB (Initial Late Blight) / ALB (Advanced Late Blight) - PERINGATAN: ketiga label ini TIDAK disertakan dalam deposit
- **Jenis / format**: campuran (campuran) · JPEG 640x640 + 16 CSV evaluasi model + dokumentasi, dalam ZIP
- **Jumlah**: 1561 · **Ukuran**: 146.60 MB
- **Sumber**: Zenodo (2026) — <https://zenodo.org/records/22059910>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/kentang/KEN-15-stagewise-hawar-zenodo` · **SHA-256**: `59e902c87dddf41d1f8dd4ffbfed296d5ab970fac82cdfaffe1e4edfca498554`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.5281/zenodo.22059910. Pembuat: Sunny Kumar Sharma; Hifjur Raheman (naskah Cogent Food & Agriculture 2026). BERHASIL DIUNDUH pada percobaan kedua. Terhitung 1.561 gambar, SAMA PERSIS dengan klaim, TETAPI hanya 1.544 unik: pemeriksaan SHA-256 per berkas menemukan 17 pasang identik bita per bita, jadi cacah citra asli yang sah adalah 1.544. Uji irisan hash terhadap 2.152 gambar kentang PlantVillage (dibaca dari arsip agen tomat) memberi 0 hash bersama - tidak ada tumpang tindih bita; plus 16 CSV, 2 MD, 1 TXT, 1 CFF. CITRA ASLI LAPANGAN TAPI TANPA LABEL: berkas DATA_PROVENANCE.md di dalam arsip menyatakan secara eksplisit bahwa label kelas per gambar, anotasi kotak-batas, manifes split train/valid/test, prediksi mentah, dan log/checkpoint TIDAK disertakan karena tidak tersimpan di arsip proyek, dan penulis memilih tidak merekonstruksinya. Ke-16 CSV adalah keluaran evaluasi model (kurva loss, mAP, presisi-recall, matriks kekeliruan, metrik per kelas, sebaran confidence/IoU, ablasi) plus angka transkripsi dari naskah - tidak satu pun memetakan image_N.jpg ke sebuah kelas. Untuk dipakai, 1.561 citra harus dianotasi ulang dari nol. NILAI: sumbangan citra daun kentang ASLI terbesar kedua dalam panen ini setelah KEN-01, dan satu-satunya yang membawa gagasan hawar BERTAHAP (awal vs lanjut) - pembedaan paling berguna secara praktis karena pada tahap awal penyemprotan masih ada gunanya. Tanpa EXIF sehingga tanggal/lokasi/perangkat tak dapat dipulihkan; sudah diseragamkan ke 640x640. Asal India. Kejujuran deposit ini patut dicatat: penulis merinci apa yang hilang alih-alih menyamarkannya.

### `KEN-16-pldd-up-lb-mendeley` — PLDD-UP: Potato Leaf Disease Dataset from Uttar Pradesh, India (subset LB.zip saja)

- **Tanaman**: kentang — kentang
- **Penyakit/kelas**: LB / late blight - hawar daun (Phytophthora infestans). Kelas EB (early blight) dan Healthy TIDAK diunduh.
- **Jenis / format**: gambar (gambar) · JPG/JPEG dalam ZIP, datar dalam satu folder LB/
- **Jumlah**: 6116 · **Ukuran**: 2.32 GB
- **Sumber**: Mendeley Data (2026) — <https://data.mendeley.com/datasets/3j4nfkvp2n/1>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/kentang/KEN-16-pldd-up-lb-mendeley` · **SHA-256**: `f4d31182b5d2f147c256e1c73838eac9b17592b89ed2b1ae394f58863e74a447`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.17632/3j4nfkvp2n.1. HANYA LB.zip yang diunduh (2,32 GB, muat di bawah batas 3 GB); EB.zip 2.766 MB dan Healthy.zip 3.683 MB TIDAK diambil - dataset penuh 8,77 GB. SHA-256 terhitung COCOK dengan hash terbitan Mendeley (f4d31182...e74a447) dan ukuran byte sama persis. Terhitung 6.116 gambar, SAMA PERSIS dengan klaim penerbit untuk kelas LB. ASLI, BUKAN AUGMENTASI: tidak ada awalan aug_ atau direktori jenis augmentasi; nama bergaya kamera berurut 'late-blight (N).jpg'; rerata 0,39 MB/berkas (bandingkan 4-5 KB thumbnail augmentasi di KEN-02/KEN-08); 32 dimensi BERBEDA (augmentasi berkelompok menyeragamkan ukuran); cacah tidak bulat. TAPI KLAIM 'ORIGINAL RESOLUTIONS' PENERBIT TIDAK SEPENUHNYA BENAR: pengukuran header JPEG seluruh 6.116 berkas menemukan 975 gambar (15,9%) berukuran TEPAT 224x224 - ukuran masukan CNN baku yang mustahil jadi keluaran kamera - dan blok itu menempati indeks bersambung 13..1029, pola khas kumpulan gabungan dari sumber lain yang sudah dipraproses. Hanya 25,9% (1.585 berkas) berdimensi kamera resolusi penuh. DUPLIKAT: 6.116 berkas -> 6.069 hash unik (40 hash muncul >1x, 47 berkas berlebih). Selain itu 92 indeks punya sekaligus versi 224x224 dan versi berdimensi lain, yang bisa jadi foto SAMA pada dua ukuran dan TIDAK terdeteksi hash; cacah asli paling konservatif 5.977. TUMPANG TINDIH: 0 hash bersama dengan KEN-15, dan 0 hash bersama dengan 2.152 gambar kentang PlantVillage (dibaca dari arsip agen tomat TOM-01). Uji tabrakan nama case-insensitive: 6.116 nama unik, 0 tabrakan, 6.116 berkas terekstrak - tidak ada yang tertimpa. KETERBATASAN: hanya SATU kelas, jadi tidak bisa dipakai sendirian melatih pengklasifikasi - perlu kelas pembanding dari dataset lain. Tidak ada anotasi kotak-batas. Asal Uttar Pradesh India, musim Rabi Okt 2025-Mar 2026, lapangan nyata.

### `TOM-01-plantvillage` — PlantVillage Dataset

- **Tanaman**: tomat|kentang|lainnya — tomat; kentang; cabai besar (paprika); + 11 tanaman lain (14 total)
- **Penyakit/kelas**: Tomat 10 kelas: Bacterial spot, Early blight, Late blight, Leaf Mold, Septoria leaf spot, Spider mites, Target Spot, Yellow Leaf Curl Virus, Mosaic virus, healthy. Kentang 3 kelas: Early blight, Late blight, healthy. Paprika 2 kelas. Total 38 kelas
- **Jenis / format**: gambar (gambar) · JPG dalam ZIP (arsip repo GitHub); varian color/grayscale/segmented
- **Jumlah**: 54303 gambar per varian (color & grayscale), 54306 segmented; 38 kelas; tomat 18159, kentang 2152 · **Ukuran**: 2.50 GB
- **Sumber**: GitHub - spMohanty/PlantVillage-Dataset (EPFL/Penn State) (2016) — <https://github.com/spMohanty/PlantVillage-Dataset>
- **Lisensi**: CC BY-SA 3.0 (`CC BY-SA`)
- **Lokal**: `datasets/additional/TOM-01-plantvillage` · **SHA-256**: `858df90a05ab147fa2b0a32c47053128c4ca772326c43e962856e69290012374`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: Daun tunggal dipetik, latar seragam, studio - model yang dilatih di sini jatuh pada foto lapangan. Lisensi CC BY-SA 3.0 hanya dinyatakan di cermin Hugging Face resmi; repo GitHub tanpa LICENSE. Kebocoran identitas daun: pakai leaf_grouping/. 19298 gambar turunan di data_distribution_for_SVM harus dikecualikan. Tidak ada layu bakteri/fusarium (penyakit pembuluh, tak terlihat di daun petik). Varian augmented 87.000 gambar di Mendeley sengaja tidak diambil.

### `TOM-02-tomato-village-lapangan` — Tomato-Village: a dataset for end-to-end tomato disease detection in a real-world environment

- **Tanaman**: tomat — tomat
- **Penyakit/kelas**: Early_blight, Late_blight, Leaf Miner, Spotted Wilt Virus, Magnesium Deficiency, Nitrogen Deficiency, Pottassium Deficiency, Healthy (8 kelas)
- **Jenis / format**: gambar (gambar) · JPG dalam folder train/val/test + CSV multilabel
- **Jumlah**: Variant-a 4526 gambar; Variant-b 5656 gambar + 5653 baris CSV; total 10184 berkas · **Ukuran**: 1.40 GB
- **Sumber**: GitHub - mamta-joshi-gehlot/Tomato-Village (2023) — <https://github.com/mamta-joshi-gehlot/Tomato-Village>
- **Lisensi**: tidak dinyatakan (`tidak dinyatakan`)
- **Lokal**: `datasets/priority/tomat/TOM-02-tomato-village-lapangan` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: FOTO LAPANGAN (Jodhpur & Jaipur, Rajasthan, India, Maret 2022). Variant-b punya 1128 gambar bergejala majemuk (2-3 label sekaligus) - langka. Variant-c (deteksi objek, 14368 gambar, 2596 MB) TIDAK diambil karena a+b+c ~3,9 GB melampaui batas 3 GB; ini rekomendasi unduhan lanjutan nomor satu. Lisensi tidak dinyatakan -> penerbitan ulang berisiko. Variant-b sudah bercampur augmentasi tanpa penanda.

### `TOM-03-taiwan-daun-tomat` — Dataset of Tomato Leaves (Taiwan Tomato Leaves Dataset)

- **Tanaman**: tomat — tomat
- **Penyakit/kelas**: Bacterial spot, Black mold, Gray spot, Late blight, powdery mildew, health (6 kelas)
- **Jenis / format**: gambar (gambar) · JPG dalam arsip 7-Zip
- **Jumlah**: diklaim 622 asli, terhitung 622 asli + 4976 augmentasi = 5598 berkas gambar · **Ukuran**: 48.01 MB
- **Sumber**: Mendeley Data (2020) — <https://data.mendeley.com/datasets/ngdgg79rzb/1>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/tomat/TOM-03-taiwan-daun-tomat` · **SHA-256**: `f623d13a7f0388dada08ca5b5f22716557defce3832f50ff6af7153e0eab676d`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.17632/ngdgg79rzb.1. SHA-256 cocok dengan hash yang dipublikasikan Mendeley. Augmentasi tercampur dalam arsip yang sama - pakai hanya folder "Preprocessed data" untuk evaluasi. Taiwan subtropis, bukan Indonesia. Sangat kecil (kelas terkecil 14 gambar test).

### `TOM-04-tomat-9-kelas-zenodo` — A dataset for tomato disease detection

- **Tanaman**: tomat — tomat
- **Penyakit/kelas**: 9 kelas menurut deskripsi sumber: Early Blight, Healthy, Late Blight, Leaf Miner, Leaf Mold, Mosaic Virus, Septoria, Spider Mites, Yellow Leaf Curl Virus (di berkas hanya id 0-8)
- **Jenis / format**: gambar (gambar) · JPG + label YOLO (.txt) dalam ZIP, split train/valid/test
- **Jumlah**: 2212 gambar + 2212 berkas label; 6581 baris anotasi · **Ukuran**: 544.52 MB
- **Sumber**: Zenodo (2025) — <https://zenodo.org/records/15868289>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/tomat/TOM-04-tomat-9-kelas-zenodo` · **SHA-256**: `c99e2ee29f5663e5325ebad4698cdefc19fc01b0879a52e3688fba3723585ba9`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.5281/zenodo.15868288. Jumlah 2212 cocok dengan klaim sumber. TIDAK ADA data.yaml/classes.txt -> pemetaan id kelas 0-8 ke nama hanya dugaan dari urutan alfabetis di deskripsi Zenodo. Ekspor Roboflow, provenans gambar per-berkas tidak jelas. Sangat timpang (id 8 = 1213 anotasi vs id 2 = 473).

### `TOM-05-pakistan-lapangan` — Tomato Leaf Disease Classification Dataset in Pakistan

- **Tanaman**: tomat — tomat
- **Penyakit/kelas**: Early blight, Late blight, Septoria leaf spot, Leaf mold, Yellow leaf curl virus, Healthy (6 kelas)
- **Jenis / format**: gambar (gambar) · JPG dalam ZIP; subset "Dataset (raw)" + "Augmented Dataset" (train/val/test)
- **Jumlah**: diklaim 7200, terhitung 8030 = 830 asli + 7200 augmentasi · **Ukuran**: 726.46 MB
- **Sumber**: Mendeley Data (2026) — <https://data.mendeley.com/datasets/3mbnb82mxd/2>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/tomat/TOM-05-pakistan-lapangan` · **SHA-256**: `2a2b36a8f972337f6d0e95e436835e55ffee5291fa07277157b40f0441f42f50`
- **Status**: unduh `diunduh` · verifikasi `sebagian`
- **Catatan**: DOI 10.17632/3mbnb82mxd.2. SHA-256 cocok dengan hash Mendeley. SEBAGIAN karena angka 7200 di deskripsi sumber adalah set AUGMENTASI; foto asli hanya 830. FOTO LAPANGAN kamera ponsel cahaya alami tanpa latar terkontrol. Augmentasi sudah dipisah train/val/test oleh pembuat dan tidak bisa ditelusuri ke foto induk -> risiko kebocoran; pakai "Dataset (raw)" dan buat split sendiri.

### `TOM-06-daun-buah-lapangan-bd` — Tomato Leaf and Fruit Disease Image Dataset

- **Tanaman**: tomat — tomat
- **Penyakit/kelas**: Healthy Leaf, Healthy Fruits, Early Blight Leaf, Late Blight Leaf, Leaf Curl Leaf, Bushy Stunt Leaf, Target Spot Fruits (7 kelas, 2 di antaranya BUAH)
- **Jenis / format**: gambar (gambar) · PNG 512x512 dalam ZIP + README PDF + CSV daftar medan
- **Jumlah**: diklaim 3500, terhitung 3500 (7 kelas x 500) · **Ukuran**: 842.28 MB
- **Sumber**: Mendeley Data (2026) — <https://data.mendeley.com/datasets/9jxvtgh325/1>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/tomat/TOM-06-daun-buah-lapangan-bd` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.17632/9jxvtgh325.1. Ketiga SHA-256 cocok dengan hash Mendeley. Satu-satunya dataset tomat di koleksi ini yang punya kelas PENYAKIT BUAH + Tomato bushy stunt virus. Berkas bernama "Original Dataset.zip" tapi isinya folder "Resize Dataset" 512x512; EXIF & nama asli hilang. Manifes yang menandai gambar augmentasi TIDAK disertakan. Seimbang persis 500/kelas -> hampir pasti sudah di-resample. Augmented Dataset.zip 7261 MB tidak diambil.

### `TOM-07-tfdd-buah-tomat` — TFDD: A High-Quality Image Dataset for Accurate Tomato Fruit Disease Detection and Classification

- **Tanaman**: tomat — tomat
- **Penyakit/kelas**: Anthracnose (antraknosa buah), Blossom_end_rot (busuk ujung buah), Cracking, Early_Blight, Fruitworm, Healthy, Late_Blight, Mold (8 kelas, semuanya pada BUAH)
- **Jenis / format**: gambar (gambar) · Raw Data.zip (JPG asli per folder kelas) + TFDD.zip (JPG + label YOLO + data.yaml + summary.csv, split train/valid/test) + CSV metadata
- **Jumlah**: diklaim 288 gambar asli, terhitung 288 di Raw Data.zip; TFDD.zip 682 gambar beraugmentasi + 682 label + 825 kotak · **Ukuran**: 421.09 MB
- **Sumber**: Mendeley Data (2025) — <https://data.mendeley.com/datasets/ktfnhjspjn/3>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/tomat/TOM-07-tfdd-buah-tomat` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.17632/ktfnhjspjn.3. Ketiga SHA-256 cocok dengan hash yang dipublikasikan Mendeley. SATU-SATUNYA dataset di panen tomat ini yang memuat ANTRAKNOSA BUAH dan BUSUK UJUNG BUAH (blossom end rot) - keduanya ada di daftar cakupan tapi tidak ada di PlantVillage, Tomato-Village, Pakistan, maupun Taiwan. data.yaml lengkap sehingga pemetaan id kelas 0-7 ke nama TERSEDIA (beda dari TOM-04 dan TOM-11). Sangat kecil: kelas terkecil Early_Blight hanya 20 gambar asli. Split test cuma 29 gambar untuk 8 kelas -> angka akurasi test nyaris tanpa makna. TFDD.zip sudah bercampur augmentasi dalam split bawaan; pakai Raw Data.zip (288 asli, tanpa anotasi) dan buat split sendiri. Ejaan kelas beda antar arsip: folder "Blossom end root" vs data.yaml "Blossom_end_rot". Cracking (gangguan fisiologis) dan Fruitworm (hama) bukan penyakit.

### `TOM-08-tabular-penyakit-tomat` — A Comprehensive Dataset of Tomato Plant Diseases for National Predictive Analytics and Crop Health Management

- **Tanaman**: tomat — tomat
- **Penyakit/kelas**: Early Blight, Late Blight, Leaf Miner, leaf mold, Mosaic Virus, Septoria, Spider Mites, Target Spot, Yellow Leaf Curl Virus (9)
- **Jenis / format**: tabular (teks (tabular)) · CSV 3 kolom: Disease, Features, Description
- **Jumlah**: 54 record (46 berisi + 8 kosong) · **Ukuran**: 27.98 KB
- **Sumber**: Mendeley Data (2025) — <https://data.mendeley.com/datasets/ztncd79yhk/1>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/tomat/TOM-08-tabular-penyakit-tomat` · **SHA-256**: `b0e61d805c56ef9c00b4739820137f6c696b38442eda247fce9be9fe4af0d181`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.17632/ztncd79yhk.1 (cermin IEEE DataPort 10.21227/7p2x-sy36). SHA-256 cocok dengan hash Mendeley. BASIS PENGETAHUAN terbaik dari seluruh panen tomat: tiap penyakit punya symptoms, favourable_condition, pesticides, physical_biological, preventive_measures. 8 baris kosong harus dibuang. Nama medan tidak konsisten. Kolom pesticides berbasis India - WAJIB diperiksa ulang terhadap registri pestisida Indonesia. Spider Mites & Leaf Miner adalah hama, bukan penyakit.

### `TOM-09-agroguard-kentang-tomat` — Pota-Toma-To leaf disease images dataset (AgroGuard 2.0)

- **Tanaman**: tomat|kentang — tomat; kentang
- **Penyakit/kelas**: Tomato_Early_Blight, Tomato_Healthy, Tomato_Late_Blight, Potato_Late_Blight (4 kelas)
- **Jenis / format**: gambar (gambar) · JPEG dalam ZIP; Raw_Dataset + Advanced_Processed_Dataset
- **Jumlah**: diklaim 435, terhitung 435 unik x 2 salinan = 870 berkas · **Ukuran**: 68.32 MB
- **Sumber**: Mendeley Data (2026) — <https://data.mendeley.com/datasets/354fsxwccb/1>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/tomat/TOM-09-agroguard-kentang-tomat` · **SHA-256**: `b029b6e8e9ffc1c31125401ddb0ae90afba1feb402f0e687466ef709e0b56090`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.17632/354fsxwccb.1. SHA-256 cocok dengan hash Mendeley. PROVENANS BERMASALAH: nama folder memuat harfiah "- Google Search" dan berkasnya berpola "imgi_{number} (N).jpeg" -> hasil scraping Google Images. Klaim CC BY 4.0 penyetor tidak menutupi hak cipta pemilik asli - JANGAN diterbitkan ulang. Label = kata kunci pencarian, tidak diverifikasi ahli. Advanced_Processed adalah turunan Raw (DWT/HSV/resize 224) - pakai salah satu saja.

### `TOM-10-cuaca-tanah-tabular` — Soil-Weather Multivariate Crop Disease Dataset

- **Tanaman**: tomat|kentang|lainnya — tomat; kentang; padi; jagung; tebu; gandum (6 tanaman)
- **Penyakit/kelas**: Tomat 6: Bacterial Wilt 802, Early Blight 1857, Fruit Borer Infestation 13279, Healthy 1648, Late Blight 1359, Leaf Curl Virus 1775. Kentang 6 termasuk Bacterial Wilt 2227. Total 40 pasangan tanaman x penyakit + Disease_Severity 1-3
- **Jenis / format**: tabular (tabular) · CSV 23 kolom
- **Jumlah**: 250000 baris data (0 duplikat), tomat 20720 baris · **Ukuran**: 70.51 MB
- **Sumber**: Zenodo (2026) — <https://zenodo.org/records/19885786>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/additional/TOM-10-cuaca-tanah-tabular` · **SHA-256**: `8efdfba2b62a53ca0d63d48ace59fe06cc1d15f7e801f51cc6aad6ef90c7eeb1`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.5281/zenodo.19885785. Klaim "250.000 real observations" TIDAK didukung datanya: setiap kolom numerik berhenti di batas bulat buatan (N 5,006-149,999; pH 4,5-8,5; Rainfall 20,019-399,975) - ciri penarikan acak seragam. High_Temp_Warning konstan 1 untuk 250.000 baris. High_Wind_Warning rusak: 66572 nilai pecahan, bukan bendera 0/1. Satuan campur (Celsius vs Fahrenheit). TIDAK ADA kolom waktu/lokasi -> tidak bisa dipakai untuk epidemiologi sungguhan. Layak sebagai contoh skema saja.

### `TOM-11-kebun-bangladesh` — Tomato Leaf Dataset: A dataset for multiclass disease detection and classification

- **Tanaman**: tomat — tomat
- **Penyakit/kelas**: 7 kelas menurut makalah: Early Blight, Black Spot, Late Blight, Leaf Mold, Bacterial Spot, Target Spot, Healthy (di berkas hanya id 0-6)
- **Jenis / format**: gambar (gambar) · JPG + label YOLO (.txt), berkas lepas (bukan arsip)
- **Jumlah**: diklaim 1621 (makalah), terhitung 1420 gambar + 689 label = 2109 berkas · **Ukuran**: 48.54 MB
- **Sumber**: Mendeley Data (2025) — <https://data.mendeley.com/datasets/bpfd9cns5g/2>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/tomat/TOM-11-kebun-bangladesh` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `sebagian`
- **Catatan**: DOI 10.17632/bpfd9cns5g.2, makalah doi 10.1016/j.dib.2025.111520. SEBAGIAN: 1420 gambar vs 1621 yang dirinci makalah (selisih 201). SHA-256 SETIAP berkas (2109/2109) cocok dengan hash Mendeley. FOTO LAPANGAN Dinajpur/Thakurgaon/Kushtia Bangladesh, kamera Canon EOS M50. 731 dari 1420 gambar (51%) TANPA label. Tidak ada data.yaml. Struktur 7 folder asli tidak diekspos public API - diselamatkan di manifes-folder.csv.

### `TOM-12-phytoscope-lapangan` — PhytoScope: A Public Benchmark Dataset for Multi-Crop Disease Detection and Localization

- **Tanaman**: cabai|tomat|kentang|lainnya — tomat; cabai; kentang; terung; + 21 tanaman lain (25 total)
- **Penyakit/kelas**: Tomat 4 kelas: Tomato Bacterial spot, Tomato Fresh leaf, Tomato leaf curl virus, Tomato spotted wilt. Cabai 5 kelas, kentang 3 kelas, terung 3 kelas. Total 105 kelas
- **Jenis / format**: gambar (gambar) · JPG + label YOLO + 25 data.yaml dalam ZIP, split train/valid/test
- **Jumlah**: 20723 gambar, 20773 berkas label, 105 kelas, 25 tanaman; bagian tomat 801 gambar · **Ukuran**: 1.15 GB
- **Sumber**: Zenodo (2026) — <https://zenodo.org/records/21383493>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/additional/TOM-12-phytoscope-lapangan` · **SHA-256**: `bd76757640538b0d889bcbb8ee5834e0d8e0082e47372438d15ae4178c308d3c`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.5281/zenodo.21383492. Klaim >20.000 gambar / 25 tanaman / 105 kelas COCOK. Agregasi proyek Roboflow Universe (25 blok roboflow: semuanya menyatakan CC BY 4.0), bukan koleksi primer -> konsistensi label antar tanaman tidak dijamin. Berkas berawalan "aug" menunjukkan augmentasi sudah tercampur ke dalam split -> saring dulu sebelum evaluasi. Bagian tomat kecil (801 gambar, 4 kelas) tapi memuat Tomato spotted wilt yang langka + kotak pembatas lapangan.

### `TOM-13-zenodo-tomat-7z` — Tomato Disease Dataset (Appe)

- **Tanaman**: tomat — tomat (diasumsikan dari judul)
- **Penyakit/kelas**: TIDAK ADA - arsip tanpa label, tanpa subdirektori kelas, tanpa berkas anotasi
- **Jenis / format**: gambar (gambar) · JPG/PNG dalam arsip 7-Zip, satu folder datar
- **Jumlah**: 2388 berkas gambar tanpa label · **Ukuran**: 29.39 MB
- **Sumber**: Zenodo (2024) — <https://zenodo.org/records/11102494>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/tomat/TOM-13-zenodo-tomat-7z` · **SHA-256**: `1d535e4602e61f21cb38dc13c69dc1bf37755b61a90fce56c540bba8c7a24a11`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.5281/zenodo.11102494. TEMUAN NEGATIF: judul dan lisensi terbuka di repositori bereputasi tidak menjamin ada label. Rekaman Zenodo tanpa deskripsi sama sekali. Struktur datar train/ tanpa subfolder kelas, 0 berkas .txt/.csv/.json/.yaml. Ada 2 berkas *_thumb.png. Hanya berguna sebagai citra tak berlabel.

### `TOM-14-tomat-spanyol-tabular` — Evaluation of tomato (Solanum lycopersicum) genetic resources in Spain (2023-2024)

- **Tanaman**: tomat — tomat
- **Penyakit/kelas**: Kolom 06_PHD (teks bebas): Red spider mite (1-4), Tuta absoluta, Mosaic symptoms in flower bud, Leaf curling, Blossom-related symptoms, Wilted, fungus, None detected. Plus skala 1-5: 24_DR_SL Disease resistance, 27_BER_SL Blossom end rot resistance, 29_FDR_SL Foliar disease resistance
- **Jenis / format**: tabular (tabular) · 4 berkas XLSX, 4 lembar masing-masing (metadata, traits, raw Data, SeedLinked)
- **Jumlah**: 122 baris data (32+42+32+16), 18 kolom sifat + 11 sifat SeedLinked · **Ukuran**: 262.36 KB
- **Sumber**: Zenodo (Horizon Europe LiveSeeding, UPV) (2026) — <https://zenodo.org/records/22024765>
- **Lisensi**: CC BY-NC-SA 4.0 (`CC BY-NC(-SA)`)
- **Lokal**: `datasets/priority/tomat/TOM-14-tomat-spanyol-tabular` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.5281/zenodo.22024764. LISENSI PALING KETAT di koleksi ini: non-komersial + berbagi-serupa; jangan dicampur ke basis data CC BY tanpa dipisahkan. Sangat kecil (122 baris). Kolom penyakit teks bebas tanpa kode terkendali. Dua uji lapang 2024 nyaris tanpa catatan penyakit. Valencia/Mediterania, bukan Indonesia. Lembar metadata memuat nama & kontak orang (data pribadi). Nilainya sebagai CONTOH SKEMA pengamatan lapangan yang rapi, termasuk sifat ketahanan busuk ujung buah.

### `TOM-16-sichuan-layu-bakteri` — Tomato Disease Dataset (Yongbo Liu) - rumah kaca Sichuan

- **Tanaman**: tomat — tomat
- **Penyakit/kelas**: Tingkat berkas: layu bakteri (Ralstonia solanacearum) 527 gambar, penyakit virus 417, busuk kelabu/gray mold 82. Tingkat anotasi 10 kelas penyakit x bagian tanaman: Viral_Leaf 1522, Wilt_Leaf 405, Wilt_Middle 345, Wilt_Top 298, Wilt_Base 173, Viral_Top 139, Wilt_Stem 135, GrayMold_Leaf 76, GrayMold_Fruit 52, Virus_Middle 22
- **Jenis / format**: gambar (gambar) · JPG resolusi penuh 4032x3024 + anotasi PASCAL VOC (XML), satu XML per gambar, berkas lepas (sumber tanpa arsip)
- **Jumlah**: diklaim 1026 gambar, terhitung 1026 gambar + 1026 XML = 2052 berkas; 3167 kotak pembatas · **Ukuran**: 2.99 GB
- **Sumber**: Mendeley Data (2025) — <https://data.mendeley.com/datasets/c2x8rynybg/1>
- **Lisensi**: CC BY 4.0 (`CC BY`)
- **Lokal**: `datasets/priority/tomat/TOM-16-sichuan-layu-bakteri` · **SHA-256**: `lihat-SHA256SUMS`
- **Status**: unduh `diunduh` · verifikasi `terverifikasi`
- **Catatan**: DOI 10.17632/c2x8rynybg.1, makalah Data in Brief doi 10.1016/j.dib.2025.112032. Ukuran 2.989.253.828 byte -> MUAT di batas 3 GB (diperiksa sebelum unduh lewat content_details.size dan curl -sIL). 2.052/2.052 berkas SHA-256-nya cocok dengan hash yang dipublikasikan Mendeley. 0 dari 1.026 XML gagal diurai. MENUTUP CELAH TERBESAR: satu-satunya dataset di panen ini yang memuat LAYU BAKTERI (Ralstonia). Anotasinya memakai BAGIAN TANAMAN sebagai kelas (Wilt_Base/Stem/Middle/Top/Leaf, 1356 kotak) sehingga memetakan gejala layu dari pangkal ke pucuk - geometri yang mustahil direkam dataset daun-petik. Cakupan anotasi 100% (0 gambar telantar), resolusi penuh 12 MP tidak diperkecil, nama berkas menyandi tanggal sesi (0509/0617/0919/1021/1112 tahun 2024) sehingga split bebas kebocoran berbasis sesi mungkin dilakukan. CACAT: Virus_Middle memakai awalan Virus_ sementara Viral_Leaf/Viral_Top memakai Viral_ (salah ketik satu batch). Sangat timpang (Viral_Leaf 1522 vs Virus_Middle 22, selisih 69x). Skema kelas tidak ortogonal: tidak ada Wilt_Fruit maupun GrayMold_Stem. TIDAK ADA KELAS SEHAT sehingga tidak bisa memutuskan "sakit atau tidak" sendirian. TIDAK ADA layu fusarium. Rumah kaca taman pertanian modern Sichuan, bukan lahan petani; kultivar tidak disebutkan; label virus tidak menyebut virus apa. Tanpa split train/valid/test. Struktur 6 folder asli tidak diekspos public API - diselamatkan di manifes-folder.csv dan di medan <folder> tiap XML.

