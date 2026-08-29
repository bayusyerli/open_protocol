# "Tomato-Village": a dataset for end-to-end tomato disease detection in a real-world environment

- **dataset_id**: TOM-02-tomato-village-lapangan
- **Tanaman**: Tomat (*Solanum lycopersicum*)
- **Penyakit/kelas tercakup**: 8 kelas apa adanya — `Early_blight`, `Late_blight`, `Leaf Miner`, `Spotted Wilt Virus`, `Magnesium Deficiency`, `Nitrogen Deficiency`, `Pottassium Deficiency` (ejaan asli, dua huruf t), `Healthy`. Empat di antaranya **bukan penyakit patogen melainkan defisiensi hara** — pembedaan yang justru paling sering keliru di lapangan.
- **Jenis data**: gambar (dua varian: klasifikasi multikelas dan klasifikasi multilabel + CSV label)
- **Format**: JPG dalam struktur folder `train`/`val`/`test`; Variant-b disertai `Multi-Label dataset - with augmented.csv`
- **Jumlah**:
  - **Variant-a (Multiclass)**: **4.526 gambar** (train 3.162, val 902, test 462) di 8 kelas
  - **Variant-b (MultiLabel)**: **5.656 gambar** (train 3.946, val 1.125, test 585) + CSV berisi 5.653 baris label
  - Total di `raw/`: 10.184 berkas, 1,3 GiB
- **Sumber**: GitHub — `mamta-joshi-gehlot/Tomato-Village`
- **URL sumber**: https://github.com/mamta-joshi-gehlot/Tomato-Village
- **DOI**: dataset tidak punya DOI. DOI makalahnya: **10.1007/s00530-023-01158-y**
- **Pembuat**: Mamta Gehlot, Rakesh Kumar Saxena, Geeta Chhabra Gandhi
- **Tahun terbit / pembaruan**: 2023 (makalah *Multimedia Systems*); komit terakhir repo 2024-05-13 (penambahan label Variant-c)
- **Lisensi**: **tidak dinyatakan**. Repo tidak memuat berkas LICENSE dan API GitHub melaporkan `license: null`. **Penerbitan ulang berisiko** — pemakaian untuk riset dengan sitasi makalah adalah pemakaian yang jelas dimaksudkan pembuat, tetapi tidak ada izin tertulis untuk redistribusi.
- **Ketentuan atribusi**: Sitasi makalah: Gehlot, M., Saxena, R.K. & Gandhi, G.C. "Tomato-Village": a dataset for end-to-end tomato disease detection in a real-world environment. *Multimedia Systems* (2023). doi:10.1007/s00530-023-01158-y
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 1,3 GiB (10.184 berkas)
- **SHA-256**: lihat `SHA256SUMS.txt` (10.184 baris, satu per berkas)
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**:
  - Ukuran diperiksa lebih dulu lewat API GitHub: repo utuh `size: 3.309.465 KB` ≈ **3,2 GiB → melampaui batas 3 GB**. Karena itu ukuran tiap varian dihitung dulu lewat `git/trees/<sha>?recursive=1`: Variant-a 562 MB, Variant-b 852 MB, Variant-c 2.596 MB.
  - Diambil dengan **sparse checkout** supaya hanya dua varian yang diunduh (bukan seluruh repo):
    `git clone --filter=blob:none --no-checkout --depth 1 …` lalu `git sparse-checkout set 'Variant-a(...)' 'Variant-b(...)'` lalu `git checkout`. Direktori hasilnya disalin apa adanya ke `raw/` tanpa `.git`.
  - Cacah gambar per split/kelas: `find raw/'Variant-a…' -type f -iname '*.jpg' | awk -F/ '{print $3"/"$4}' | sort | uniq -c` → 4.526 gambar, cocok dengan hitungan dari pohon git GitHub sebelum unduh
  - CSV multilabel diurai dengan modul `csv` Python → 5.653 baris, 8 kolom label, distribusi `SUM` = {1: 4.525, 2: 1.106, 3: 22}
  - `SHA256SUMS.txt` dibuat dengan `find raw -type f -print0 | sort -z | xargs -0 shasum -a 256` (perlu `-print0`/`-0` karena nama direktorinya mengandung spasi dan kurung)
- **Bagian yang TIDAK diambil**: **Variant-c (Object Detection)** — 14.368 gambar (train 11.493 + val 2.875) dengan anotasi PASCAL VOC dan YOLO, 2.596 MB. Dilewati karena a+b+c = ~3,9 GB melampaui batas 3 GB per dataset sekaligus menghabiskan jatah 8 GB agen. **Ini rekomendasi unduhan nomor satu untuk sesi lanjutan** — anotasi kotak pembatas lapangan untuk tomat sangat langka.

## Keterbatasan / masalah kualitas

- **Nilai utamanya justru pada apa yang tidak dimiliki PlantVillage**: foto diambil langsung di kebun tomat di **distrik Jodhpur dan Jaipur, Rajasthan, India**, dengan kamera ponsel, latar alami, kanopi, tanah, dan pencahayaan matahari. Nama berkas (`IMG20220323100545_1.jpg`) menyimpan **cap waktu pengambilan** — Maret 2022 — sehingga sesi pemotretannya tertelusur.
- **Variant-b memuat gejala majemuk yang nyaris tak ada di dataset lain**: 1.106 gambar berlabel 2 kondisi dan 22 gambar berlabel 3 kondisi sekaligus (mis. `Early blight` + `Leaf Miner` + `Magnesium Deficiency`). Ini mendekati kenyataan lapangan, di mana daun jarang hanya kena satu masalah.
- **Kelas sangat tidak seimbang**: `Pottassium Deficiency` hanya 50 gambar latih (85 gambar di seluruh Variant-b) melawan `Leaf Miner` 716 gambar latih (2.101 di Variant-b) — selisih 14–25×. Kelas kalium praktis tidak bisa dipelajari dari data ini.
- **Nama berkas CSV memuat frasa "with augmented"**, jadi Variant-b **sudah bercampur gambar hasil augmentasi** dan split train/val/test-nya sudah ditetapkan pembuat. Kolom `path` di CSV memakai pemisah Windows (`\test\Early_blight`), dan tidak ada kolom yang menandai mana gambar asli dan mana turunannya. **Risiko kebocoran train↔test tidak bisa dikesampingkan** untuk Variant-b. Variant-a lebih aman untuk evaluasi.
- Ada berkas sisa Windows `desktop.ini` di dalam folder kelas — harus disaring saat pemuatan.
- Ejaan kelas salah di sumber: `Pottassium` (seharusnya *Potassium*). Dipertahankan apa adanya karena aturan melarang penggantian nama pada data mentah.
- **Cakupan penyakit sempit untuk konteks Indonesia**: hanya early blight, late blight, dan spotted wilt virus. **Tidak ada layu bakteri (*Ralstonia solanacearum*), layu fusarium, Septoria, leaf mold, bercak bakteri, maupun penyakit buah.** Rajasthan beriklim semi-kering — tekanan penyakitnya berbeda dari dataran tinggi lembap Indonesia.
- Tidak ada koordinat GPS, kultivar, umur tanaman, atau riwayat perlakuan.
- **Lisensi tidak dinyatakan** — lihat medan lisensi di atas.
