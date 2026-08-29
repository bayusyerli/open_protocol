# Nitrogen availability shapes anthracnose severity and defense-related responses in chili pepper (Capsicum annuum)

- **dataset_id**: CAB-06-antraknosa-nitrogen-tabular
- **Tanaman**: Cabai (*Capsicum annuum*)
- **Penyakit/kelas tercakup**: antraknosa oleh *Colletotrichum fructicola* (satu patogen, tanpa
  kelas citra). Perlakuannya taraf nitrogen 0,3 / 3 / 30 mM.
- **Jenis data**: tabular (+ teks pendukung)
- **Format**: XLSX (9 lembar), PDF, DOCX
- **Jumlah**: 3 berkas; XLSX berisi 9 tabel dengan total ±3.700 baris data
  (Table 1: 21 · Table 2: 21 · Table 3: 1.923 · Table 4: 765 · Table 5: 389 · Table 6: 281 ·
  Table 7: 52 · Table 8: 231 · Table 9: 17)
- **Sumber**: figshare (Taylor & Francis), suplemen *Journal of Plant Interactions*
- **URL sumber**: https://tandf.figshare.com/articles/dataset/Nitrogen_availability_shapes_anthracnose_severity_and_defense-related_responses_in_chili_pepper_i_Capsicum_annuum_i_/31037350
- **DOI**: 10.6084/m9.figshare.31037350.v1
- **Pembuat**: Kulaporn Boonyaves; Julaluck Sanghirun; Prapaipit Suwitchayanon; Kanyaratt Supaibulwatana
- **Tahun terbit / pembaruan**: 2026-01-09
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: sebut para pencipta, DOI 10.6084/m9.figshare.31037350, dan artikel
  induknya (*tjpi_a_2611503*).
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 1.595.375 byte total (1,52 MiB) — xlsx 226.703 · pdf 1.355.746 · docx 12.926
- **SHA-256**: lihat SHA256SUMS.txt
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**:
  - `md5 -q` untuk ketiga berkas → ketiganya **cocok persis** dengan `computed_md5` yang
    diumumkan Figshare API (`d363319e…`, `7f3cc06f…`, `f5cc31b4…`).
  - `file raw/*` → `Microsoft Word 2007+`, `PDF document, version 1.4`, `Microsoft Excel 2007+`
    — tipe cocok dengan ekstensinya, tidak ada berkas mencurigakan.
  - Isi XLSX dibaca dengan `python3` + `zipfile` + `ElementTree` (membaca XML mentah, tidak
    membuka aplikasi dan tidak menjalankan makro). Nama sembilan lembar dan kepala kolom
    tiap lembar tercatat di `struktur.txt`.
- **Keterbatasan / masalah kualitas**:
  - **Isinya molekuler, bukan epidemiologi lapangan.** Meski judulnya menyebut "anthracnose
    severity", tabel yang diterbitkan adalah: resep media hara (Table 1), primer qRT-PCR
    (Table 2), daftar gen terekspresi berbeda / DEG dengan ID Arabidopsis (Table 3), pengayaan
    GO (Table 4–8), dan padanan gen cabai `LOC#` → ortolog Arabidopsis (Table 9).
    **Tidak ada** tabel skor keparahan penyakit, ukuran lesi, insidensi, data cuaca, atau citra.
    Angka keparahan yang dibahas naskah tinggal di gambar artikel, bukan di suplemen ini.
  - Percobaan rumah kaca/in-vitro dengan inokulasi terkendali, bukan pengamatan lapangan.
  - Patogennya *C. fructicola*; antraknosa cabai di Indonesia lebih sering dikaitkan dengan
    *C. capsici*/*C. truncatum* dan *C. acutatum*, sehingga hasilnya tidak otomatis berlaku.
  - Bukan data Indonesia (kelompok riset Thailand, Mahidol University).
  - Nilai praktis untuk Pranatani rendah: bisa jadi rujukan bahwa **pemupukan N berlebih
    menaikkan keparahan antraknosa** (klaim naskah), yang relevan sebagai butir basis
    pengetahuan agronomi, tetapi tidak menyediakan angka yang bisa dihitung ulang.
