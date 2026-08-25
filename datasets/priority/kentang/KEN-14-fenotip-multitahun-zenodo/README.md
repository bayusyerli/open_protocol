# Multi-year phenotypic dataset of potato genotypes evaluated for agronomic, biotic stress, and tuber quality traits

- **dataset_id**: KEN-14-fenotip-multitahun-zenodo
- **Tanaman**: Kentang (*Solanum tuberosum*) — 47 genotipe
- **Penyakit/kelas tercakup**: skor infeksi lapangan untuk
  **Late blight** (*Phytophthora infestans*), **Virus**, **Rhizoctonia** (*R. solani*,
  patogen black scurf), serta hama **Aphid** (kutu daun, vektor virus) dan **Mite** (tungau)
- **Jenis data**: tabular
- **Format**: XLSX satu berkas, 4 lembar (`2022`, `2023`, `2024`, `Traits`)
- **Jumlah**: **426 baris pengamatan** (142 per tahun x 3 tahun), 29 kolom, 47 genotipe unik;
  lembar `Traits` memuat kamus 26 sifat
- **Sumber**: Zenodo
- **URL sumber**: https://zenodo.org/records/21774103
- **DOI**: 10.5281/zenodo.21774103 (versi ini: 10.5281/zenodo.21774104)
- **Pembuat**: Quang Le Hoa; Ngoc Nguyen Tuan; Thi Nguyen Son; Thi Nguyen Thuy
- **Tahun terbit / pembaruan**: 2026-08-03
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: sebut pembuat, DOI, dan lisensi CC BY 4.0.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 81.922 byte (0,1 MB)
- **SHA-256**: `4553d835d9f1ea650656b7bec2d77523682b48c608afa581d0b193f2e3e15965`
- **Status unduh**: diunduh
- **Status verifikasi**: **terverifikasi**
- **Cara verifikasi**:
  - `file -b raw/*.xlsx` → `Microsoft Excel 2007+`
  - diurai dengan `zipfile` + `xml.etree.ElementTree` langsung atas XML di dalam XLSX
    (tanpa menjalankan makro atau kode apa pun dari berkas)
  - lembar: `2022` / `2023` / `2024` masing-masing 143 baris (142 baris data) x 29 kolom,
    47 genotipe unik; `Traits` 27 baris
  - nama kolom dibaca dari `sharedStrings.xml` → lihat `struktur.txt`
- **Keterbatasan / masalah kualitas**:
  - **Skor infeksi tanpa skala yang dijelaskan.** Lembar `Traits` memberi singkatan tiap sifat
    tetapi tidak menyatakan satuan atau rentang skor untuk kolom infeksi. Tanpa merujuk
    naskah *Data in Brief* terkait, angka `Late blight Infection` tidak dapat ditafsirkan
    secara mutlak — hanya relatif antar genotipe.
  - **Tidak ada AUDPC** dan tidak ada pengamatan berulang dalam satu musim; hanya satu angka
    infeksi per genotipe per tahun. Jadi **tidak bisa dipakai memodelkan kurva perkembangan
    penyakit** seperti KEN-06/KEN-07.
  - **Tidak ada data cuaca, koordinat, atau ketinggian.**
  - Nama kolom memuat karakter baris-baru di dalam sel (`'Virus\nInfection '`) dan spasi di
    ujung — perlu dinormalkan sebelum dipakai sebagai nama medan.
  - Ukuran kecil: 426 baris. Cukup untuk perbandingan genotipe, tidak cukup untuk pemodelan.
  - Genotipe berupa kode pemuliaan, tidak seluruhnya varietas komersial bernama.

## Nilai khas — relevansi agroklimat terdekat dengan Indonesia

Dua hal membuat berkas kecil ini penting melebihi ukurannya:

1. **Rhizoctonia ada sebagai kolom skor tersendiri.** Ini satu-satunya berkas tabular dalam
   panen ini yang mengukur *R. solani* (patogen black scurf) di lapangan. Di sisi citra,
   black scurf adalah kelas paling tipis (49 gambar di KEN-01), jadi sisi tabularnya membantu
   menutup celah itu dari arah lain.
2. **Asalnya Vietnam utara** — dataran tinggi tropis Asia Tenggara. Ini **analog agroklimat
   terdekat dengan sentra kentang Indonesia** (Dieng, Pangalengan, Modoinding) di antara
   seluruh sumber tabular yang berhasil dipanen; bandingkan CIP (Peru, Andes) dan KEN-09
   (Kenya, Afrika Timur). Musim tanam, tekanan penyakit, dan spektrum patogennya jauh lebih
   sebanding.

Ditambah lagi, berkas ini memasangkan **cekaman biotik ↔ sifat mutu umbi** (kandungan padatan,
gula pereduksi, bentuk dan warna umbi, mata dalam) dalam satu tabel — bahan yang berguna untuk
menjelaskan mengapa ketahanan penyakit saja tidak cukup dalam memilih varietas.
