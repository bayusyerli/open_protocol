# PLDD-UP: Potato Leaf Disease Dataset from Uttar Pradesh, India — subset `LB.zip` saja

- **dataset_id**: KEN-16-pldd-up-lb-mendeley
- **Tanaman**: Kentang (*Solanum tuberosum*) — daun
- **Penyakit/kelas tercakup**: **satu kelas** — `LB` = late blight / hawar daun
  (*Phytophthora infestans*). Kelas `EB` (early blight) dan `Healthy` **tidak diunduh**.
- **Jenis data**: gambar
- **Format**: JPG/JPEG dalam ZIP, semuanya datar di dalam satu folder `LB/`
- **Jumlah**: **6.116 gambar — sama persis dengan klaim penerbit untuk kelas LB**;
  **6.069 di antaranya unik** (47 berkas identik bita per bita)
- **Sumber**: Mendeley Data
- **URL sumber**: https://data.mendeley.com/datasets/3j4nfkvp2n/1
- **DOI**: 10.17632/3j4nfkvp2n.1
- **Pembuat**: Prakash Kumar Singh; Arun Yadav; Divakar Yadav; Sarthak Tiwari; Aseem Chandel
- **Tahun terbit / pembaruan**: 2026-04-20 (versi 1)
- **Lisensi**: **CC BY 4.0** — diperiksa langsung pada rekaman Mendeley dataset ini
  (`data_licence.full_name` = *Creative Commons Attribution 4.0 International*,
  `url` = `http://creativecommons.org/licenses/by/4.0`), bukan diwarisi dari rekaman lain.
- **Ketentuan atribusi**: sebut kelima pembuat, DOI, sumber, dan lisensi; nyatakan bila ada
  perubahan. Wajib disebut pula bahwa yang dipakai adalah **subset LB saja**, bukan dataset penuh.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 2.323.338.293 byte (2,16 GiB / 2,32 GB)
- **SHA-256**: `f4d31182b5d2f147c256e1c73838eac9b17592b89ed2b1ae394f58863e74a447`
- **Status unduh**: diunduh
- **Status verifikasi**: **terverifikasi**
- **Cara verifikasi**:
  - `file -b raw/LB.zip` → `Zip archive data, at least v2.0 to extract, compression method=store`
  - `unzip -tqq raw/LB.zip` → lolos tanpa CRC error
  - `stat -f%z` → 2.323.338.293 byte, sama persis dengan yang dinyatakan Mendeley
  - **`shasum -a 256` → `f4d31182…e74a447`, COCOK dengan hash yang diterbitkan Mendeley**
  - `unzip -l | grep -icE '\.(jpg|jpeg|png)$'` → **6.116**, sama persis dengan klaim
  - diekstrak ke direktori scratchpad (bukan ke `datasets/`), lalu tiap gambar di-SHA-256 dan
    dimensinya dibaca dari penanda SOF header JPEG → lihat `struktur.txt`
- **Keterbatasan / masalah kualitas**:
  - **Klaim "original resolutions" tidak sepenuhnya benar.** Penerbit menyatakan
    *"all images have been preserved in their original resolutions"*. Pengukuran seluruh
    6.116 berkas menemukan **975 gambar (15,9%) berukuran tepat 224x224** — ukuran masukan
    CNN baku yang **mustahil** menjadi keluaran asli kamera. Hanya **25,9%** (1.585 berkas)
    yang benar-benar berdimensi kamera resolusi penuh (3468x4624, 8160x3672, 4624x3468,
    4496x3000). Sisanya 719x1600 / 1600x719 (57,7%), yang juga bukan dimensi kamera lazim.
  - Blok 224x224 itu menempati **indeks bersambung 13..1029** — pola khas kumpulan yang
    **digabungkan dari sumber lain yang sudah dipraproses**, bukan hasil pemotretan sendiri.
    Provenans bagian ini karena itu diragukan meski dataset induknya mengklaim satu kampanye
    pengambilan lapangan.
  - **47 berkas duplikat identik bita** (40 hash muncul lebih dari sekali). Citra unik
    sebenarnya **6.069**, bukan 6.116.
  - **92 indeks berkas punya sekaligus versi 224x224 dan versi berdimensi lain**
    (mis. `.jpg` 224x224 berdampingan dengan `.jpeg` beresolusi lebih besar). Pasangan seperti
    ini bisa jadi **foto yang sama pada dua ukuran**, dan **perbandingan hash tidak akan
    mendeteksinya** karena bitanya berbeda. Cacah asli paling konservatif: **5.977**.
  - **Hanya satu kelas.** Tanpa `EB` dan `Healthy`, subset ini **tidak dapat dipakai sendirian**
    untuk melatih pengklasifikasi — tidak ada kelas pembanding. Harus dipasangkan dengan kelas
    sehat/penyakit lain dari dataset lain, dan itu memasukkan pergeseran domain.
  - **Tidak ada anotasi kotak-batas** dan tidak ada label tingkat keparahan; hanya label kelas
    implisit lewat nama folder.
  - Asal Uttar Pradesh, India (Mainpuri, Etawah, Jaswantnagar), musim Rabi Okt 2025–Mar 2026,
    kamera digital dan ponsel di bawah cahaya alami. Bukan Indonesia, tetapi kondisi
    pengambilannya lapangan nyata.

## Uji tumpang tindih — bersih

| dibandingkan dengan | metode | hasil |
|---|---|---|
| **KEN-15** (1.561 citra lapangan India) | irisan SHA-256 per gambar | **0 hash bersama** |
| **PlantVillage kentang** (2.152 gambar, dibaca dari arsip agen tomat `TOM-01`) | irisan SHA-256 per gambar | **0 hash bersama** |

Tumpang tindih sudah muncul dua kali dalam panen ini (PlantVillage di dalam KEN-11; dugaan
gabungan sumber di KEN-10), jadi pemeriksaan ini dilakukan sebelum menghitung KEN-16 sebagai
tambahan bersih. **Batas uji**: hash hanya menangkap duplikat identik bita — gambar yang sama
tetapi sudah diubah ukuran atau kontrasnya tidak akan terdeteksi.

## Mengapa subset ini diambil

Kelemahan terbesar koleksi kentang ini **bukan cakupan penyakit** melainkan **rasio citra asli
terhadap citra sintetis**. Sebelum KEN-16 masuk, hanya 8.816 dari 191.664 gambar (4,6%) yang
merupakan citra asli terverifikasi, sementara 146.831 di antaranya augmentasi tanpa induk.

KEN-16 menambah **6.069 citra lapangan asli berlabel** dalam satu unduhan — kenaikan **69%**
pada basis citra asli, dan menjadikannya **penyumbang citra asli terbesar kedua** setelah
KEN-01. Berbeda dari KEN-15 yang citranya asli tetapi **tanpa label**, KEN-16 datang dengan
label kelas yang jelas dan siap dipakai.
