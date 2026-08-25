# TOM2024 — citra hama & penyakit tomat, bawang, dan jagung (TIDAK BERHASIL DIUNDUH)

> **Tidak ada `raw/`, `SHA256SUMS.txt`, atau `struktur.txt` di direktori ini** karena tidak satu berkas pun
> berhasil diambil. Direktori ini sengaja dipertahankan agar agen lain tidak mengulang usaha yang sama.

- **dataset_id**: BWM-03-tom2024-multicrop
- **Tanaman**: tomat, bawang (onion), jagung — 3 tanaman, karena itu dialokasikan ke `additional/`
- **Penyakit/kelas tercakup**: **30 kelas** hama & penyakit (rincian kelas tidak terbaca karena berkas tidak bisa diambil)
- **Jenis data**: gambar
- **Format**: tidak diketahui — daftar berkas kosong
- **Jumlah**: diklaim **25.844 gambar mentah + 12.227 gambar berlabel**; **terhitung 0** (tidak ada berkas yang bisa diambil)
- **Sumber**: Mendeley Data
- **URL sumber**: https://data.mendeley.com/datasets/3d4yg89rtr
- **DOI**: 10.17632/3d4yg89rtr
- **Pembuat**: Obed Appiah; Kwame Oppong Hackman; Belko Abdoul Aziz Diallo; Kehinde O. Ogunjobi; Valentin Ouedraogo; Momo Bebe (jaringan WASCAL, Afrika Barat)
- **Tahun terbit / pembaruan**: 2024 (v1, `publish_date` 2024-09-05 — satu-satunya versi)
- **Lisensi**: **CC BY 4.0** (dari metadata DataCite, `rightsIdentifier = cc-by-4.0`)
- **Ketentuan atribusi**: pembuat + DOI
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: tidak diketahui; `sizes` kosong di DataCite dan daftar berkas API kosong
- **SHA-256**: tidak berlaku
- **Status unduh**: **gagal**
- **Status verifikasi**: belum
- **Cara verifikasi**: seluruh percobaan dicatat di sini —
  - `GET https://api.datacite.org/dois/10.17632%2F3d4yg89rtr` → **200**, metadata lengkap ada (judul, pembuat, abstrak, lisensi cc-by-4.0). Jadi dataset ini **nyata dan tertelusur**, bukan halaman hantu.
  - `GET https://data.mendeley.com/public-api/datasets/3d4yg89rtr/versions` → **200** `[{"version":1,"publish_date":"2024-09-05","available":true}]`
  - `GET https://data.mendeley.com/public-api/datasets/3d4yg89rtr/files?folder_id=root&version=1` → **200** dengan **array kosong** — tidak ada berkas terdaftar di akar
  - `GET .../files?version=1` (tanpa `folder_id`) → `{"error":400}`
  - `GET .../datasets/3d4yg89rtr` (metadata) → `{"error":{"message":"error - dataset not found","status":404}}` — **bertentangan** dengan `/versions` yang menyatakan v1 tersedia
  - `GET .../folders?version=1` → **404**, endpoint tidak ada
  - `WebFetch https://data.mendeley.com/datasets/3d4yg89rtr/1` → halaman dirender JavaScript; hanya footer yang terbaca, isi tidak bisa diperiksa
  - Dicoba berulang selama ±25 menit; sempat pula mengembalikan `502` dan `Internal Server Error`.
- **Keterbatasan / masalah kualitas**: tidak bisa dinilai — isinya belum pernah dilihat. **Tidak ada klaim verifikasi apa pun yang boleh dibuat atas dataset ini.**

## Diagnosis

Rekaman terdaftar (DOI aktif, metadata DataCite lengkap, versi dinyatakan `available`) tetapi **berkasnya tidak
terjangkau lewat API publik**. Kemungkinan penyebab: berkas tersimpan di dalam subfolder yang tidak terekspos
lewat `folder_id=root`, deposit yang tidak selesai, atau berkas ditarik setelah DOI terbit. **Bukan** masalah
login — tidak ada permintaan akun di titik mana pun, sehingga statusnya `gagal`, bukan `terhalang-akun`.

## Catatan lintas-agen

TOM2024 memuat **tomat** dan karena itu menarik untuk **agen tomat**. Jangan diasumsikan bisa diunduh:
seluruh rute API di atas sudah dicoba dari sesi ini pada 2026-08-25 dan semuanya buntu. Kalau tetap ingin
dikejar, jalur yang tersisa adalah membuka halaman Mendeley lewat peramban sungguhan (halamannya ber-JS)
atau menghubungi pembuatnya.
