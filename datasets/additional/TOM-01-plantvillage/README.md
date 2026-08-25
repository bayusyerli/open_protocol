# PlantVillage Dataset

- **dataset_id**: TOM-01-plantvillage
- **Tanaman**: **14 spesies** — Apple, Blueberry, Cherry, Corn (maize), Grape, Orange, Peach, Pepper bell, **Potato**, Raspberry, Soybean, Squash, Strawberry, **Tomato**. Karena mencakup ≥3 tanaman, dataset ini ditaruh di `datasets/additional/` walau prefiksnya milik agen tomat.
- **Penyakit/kelas tercakup**: **38 kelas** (nama apa adanya, format `Tanaman___Penyakit`). Rincian penuh + cacah gambar ada di `struktur.txt`.

  **10 kelas tomat** (18.159 gambar, varian `color`):
  | kelas | gambar |
  |---|---|
  | `Tomato___Bacterial_spot` (*Xanthomonas*) | 2.127 |
  | `Tomato___Early_blight` (*Alternaria solani*) | 1.000 |
  | `Tomato___Late_blight` (*Phytophthora infestans*) | 1.908 |
  | `Tomato___Leaf_Mold` (*Passalora fulva*) | 952 |
  | `Tomato___Septoria_leaf_spot` | 1.771 |
  | `Tomato___Spider_mites Two-spotted_spider_mite` | 1.676 |
  | `Tomato___Target_Spot` | 1.404 |
  | `Tomato___Tomato_Yellow_Leaf_Curl_Virus` (TYLCV) | 5.357 |
  | `Tomato___Tomato_mosaic_virus` (ToMV) | 373 |
  | `Tomato___healthy` | 1.591 |

  **3 kelas kentang** (2.152 gambar): `Potato___Early_blight` 1.000, `Potato___Late_blight` 1.000, `Potato___healthy` 152.

  Sebagai rujukan silang: **2 kelas paprika/cabai besar** `Pepper,_bell___Bacterial_spot` 997 dan `Pepper,_bell___healthy` 1.477. **Tidak ada kelas cabai rawit/keriting (*Capsicum annuum* lokal) dan tidak ada bawang merah sama sekali.**
- **Jenis data**: gambar
- **Format**: JPG dalam ZIP arsip repositori GitHub. Tiga varian di `raw/`: `color` (RGB asli), `grayscale`, `segmented` (latar dibuang).
- **Jumlah**: diklaim 54.303–54.306; terhitung **color 54.303**, **grayscale 54.303**, **segmented 54.306** — masing-masing 38 kelas. Selisih 3 gambar pada `segmented` adalah kuirk yang memang ada di sumber. Total berkas gambar di seluruh arsip 182.211 (termasuk 19.298 gambar turunan di luar `raw/`).
- **Sumber**: GitHub — `spMohanty/PlantVillage-Dataset` (Digital Epidemiology Lab, EPFL + Penn State)
- **URL sumber**: https://github.com/spMohanty/PlantVillage-Dataset (cermin resmi: https://huggingface.co/datasets/mohanty/PlantVillage)
- **DOI**: dataset tidak punya DOI sendiri. DOI makalahnya: **10.3389/fpls.2016.01419**
- **Pembuat**: Sharada P. Mohanty, David P. Hughes, Marcel Salathé
- **Tahun terbit / pembaruan**: 2016 (rilis awal); arsip diunduh dari cabang `master`, komit terkini
- **Lisensi**: **CC BY-SA 3.0** — dinyatakan pada cermin resmi Hugging Face milik pembuat yang sama (`license: cc-by-sa-3.0`). **Repo GitHub sendiri tidak memuat berkas LICENSE** dan API GitHub melaporkan `license: null`. Perlakukan sebagai CC BY-SA 3.0 dan catat ketidakcocokan ini.
- **Ketentuan atribusi**: Atribusi + **berbagi-serupa** (ShareAlike). Turunan wajib dilisensikan CC BY-SA juga. Sitasi: Mohanty, S.P., Hughes, D.P., Salathé, M. (2016). *Using deep learning for image-based plant disease detection.* Frontiers in Plant Science 7:1419. doi:10.3389/fpls.2016.01419
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 2.504.302.720 byte (2,33 GiB) — di bawah batas keras 3 GB
- **SHA-256**: `858df90a05ab147fa2b0a32c47053128c4ca772326c43e962856e69290012374`
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**:
  - Ukuran diperiksa **sebelum** unduh: `curl -sIL https://codeload.github.com/spMohanty/PlantVillage-Dataset/zip/refs/heads/master` → `content-type: application/zip` (codeload tidak mengirim `content-length` karena arsipnya di-stream), lalu `https://api.github.com/repos/spMohanty/PlantVillage-Dataset` → `size: 2.100.984 KB` ≈ 2,0 GiB. Hasil unduhan 2,33 GiB, tetap di bawah 3 GB.
  - `file raw/PlantVillage-Dataset-master.zip` → `Zip archive data, at least v1.0 to extract, compression method=store`
  - `unzip -t raw/PlantVillage-Dataset-master.zip` → `No errors detected in compressed data`
  - `unzip -Z1 | wc -l` → 182.609 entri
  - Cacah per varian: `grep -E "^…/raw/<varian>/.+\.(jpg|JPG)$" | wc -l` → 54.303 / 54.303 / 54.306
  - Cacah kelas: `awk -F/ 'NF>4{print $4}' | sort -u | wc -l` → **38** pada ketiga varian
  - Cacah per kelas: `awk -F/ '{print $4}' | sort | uniq -c` → tabel lengkap di `struktur.txt`
  - `CITATION.cff` dan `README.md` di dalam arsip dibaca dengan `unzip -p` untuk memastikan pembuat dan sitasi
- **Pemilihan varian**: seluruh repo (ketiga varian) muat dalam batas 3 GB, jadi tidak perlu memilih salah satu. **Varian kanonik untuk dipakai adalah `raw/color`** — RGB asli, tanpa augmentasi. `grayscale` dan `segmented` adalah **turunan** dari gambar yang sama; menggabungkannya dengan `color` akan melipatgandakan setiap daun tiga kali dan membocorkan train ke test.
- **Varian "augmented" 87.000 gambar di Mendeley Data sengaja TIDAK diambil.** Varian itu jauh lebih besar dan isinya gambar hasil augmentasi yang dicampur dengan aslinya, sehingga tidak layak untuk evaluasi yang jujur. Varian `color` yang tidak diaugmentasi di repo GitHub inilah yang kanonik.

## Keterbatasan / masalah kualitas

- **Ini citra studio, bukan foto lapangan — dan itulah cacat utamanya.** Setiap gambar adalah **satu helai daun tunggal yang dipetik**, diletakkan di atas **latar seragam** (kertas/kain polos), difoto dengan pencahayaan terkendali. Tidak ada tanah, tidak ada kanopi, tidak ada daun bertumpuk, tidak ada bayangan matahari, tidak ada tangan petani di dalam bingkai.
- **Akibatnya: model yang dilatih di atas PlantVillage jatuh pada foto lapangan.** Akurasi ~99% yang dilaporkan pada uji internal PlantVillage anjlok drastis (kerap ke kisaran 10–40%) begitu diuji pada foto yang diambil petani langsung di kebun — inilah alasan dataset lapangan seperti Tomato-Village (TOM-02), Pakistan (TOM-05), dan PlantDoc dibuat. **Jangan pernah melaporkan angka akurasi PlantVillage sebagai perkiraan kinerja di lapangan.**
- **Kebocoran identitas daun.** Satu helai daun yang sama difoto beberapa kali dari sudut berbeda. Kalau split train/test dibuat acak per-gambar, foto daun yang sama muncul di kedua sisi dan akurasinya menggelembung. Repo menyediakan `leaf_grouping/` dan `leaf-map.json` yang memetakan gambar ke identitas daunnya — **wajib dipakai** untuk membuat split yang benar. Cermin Hugging Face menyediakan split 80/20 yang sudah menghormati pengelompokan ini.
- **19.298 gambar turunan di luar `raw/`** ada di `data_distribution_for_SVM/` (dan 1 di `generated_for_paper/`). Ini subset yang sudah dipilih ulang untuk eksperimen SVM di makalah; jangan dicampur ke hitungan dataset.
- **Kelas sangat tidak seimbang**: `Orange___Haunglongbing` 5.507 dan `Tomato___Tomato_Yellow_Leaf_Curl_Virus` 5.357 vs `Potato___healthy` hanya 152 — selisih 36×. Pada tomat sendiri, TYLCV (5.357) 14× lebih banyak daripada ToMV (373).
- **Satu penyakit per gambar.** Tidak ada kasus ko-infeksi, padahal di lapangan daun kerap kena lebih dari satu masalah sekaligus.
- **Tidak ada gejala batang, akar, atau buah** — hanya daun. Karena itu **layu bakteri (*Ralstonia solanacearum*) dan layu fusarium tidak ada dan memang tidak bisa ada**: keduanya penyakit pembuluh yang gejala utamanya layu seluruh tanaman, bukan bercak daun. Ini lubang terbesar untuk konteks Indonesia. Busuk ujung buah (blossom end rot) dan antraknosa buah juga tidak ada.
- **Bukan tanaman Indonesia**: dikumpulkan terutama di Amerika Serikat (Penn State). Kultivar, tekanan penyakit, dan tampakan gejala di dataran tinggi/rendah tropis bisa berbeda.
- **Umur data**: dirilis 2016. Tidak ada penyakit yang muncul belakangan, mis. Tomato brown rugose fruit virus (ToBRFV).
- **Lisensi ShareAlike menular.** Kalau gambar PlantVillage dicampur ke dalam himpunan data gabungan, seluruh himpunan turunannya bisa terikat CC BY-SA 3.0. Simpan terpisah dari koleksi CC BY / CC0.
- **Berisi kode Python 2.7** (`plant_village.py`, `scripts/*.py`, `utils/*.pyc`). Kode ini **tidak dijalankan** dan tidak boleh dijalankan; hadir hanya karena arsipnya arsip repo utuh.
