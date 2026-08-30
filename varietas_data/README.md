# Sifat Agronomi Varietas — panen benih, dan sensus sumber yang ternyata mati

Papan prioritas data no. **14**. Pertanyaan yang ditutupnya: *"varietas mana yang
tahan penyakit yang sedang mewabah di sini?"*

`spec/vocab/variety/varietas.ndjson` memuat **11.227 varietas** dan seluruhnya hanya
membawa surat — `permits`, `maintainer`, `origin`, `release`. Nol potensi hasil, nol
umur panen, nol ketahanan OPT, nol anjuran ketinggian. Direktori ini mengejar keempat
medan itu.

- **Tanggal kerja:** 2026-08-30
- **Sifat data:** publik, tanpa login, tanpa bypass apa pun
- **Hasil singkat:** premisnya terbukti, sumbernya tidak ada

## 1. Yang dikerjakan

| Berkas | Isi | Baris |
|---|---|---:|
| `vardaf-indeks.json` | tabel `db-vardaf` PROSEED — varietas hortikultura terdaftar | 3.503 |
| `varsan-indeks.json` | tabel `db-varsan` PROSEED — varietas tersandingkan | 1.592 |
| `raw/sensus-tautan.json` | kode HTTP tiap tautan dokumen deskripsi | 5.095 |
| `raw/uji-ekstraksi.json` | hasil unduh + uji lapisan teks tiap dokumen hidup | 77 |
| `sifat-agronomi-benih.json` | medan sifat yang benar-benar terbaca, tertaut `op:vty` | 21 |
| `raw/db-vardaf.html` | halaman sumber apa adanya (2,9 MB) — **tidak naik ke repo** | — |
| `raw/sk/` | 77 dokumen unduhan (53 MB) — **tidak naik ke repo** | 77 |

Skrip: `sensus-tautan.py`, `panen-sk.py`, `susun-sifat.py`. Ketiganya bisa dijalankan
ulang; yang pertama menembak 5.095 permintaan HEAD, jadi jangan dijalankan tanpa alasan.

Berkas mentahnya dipagari `.gitignore` — dokumennya milik orang lain dan situsnya tidak
menyatakan lisensi. SHA-256 tiap unduhan tersimpan di `raw/uji-ekstraksi.json`, jadi
`panen-sk.py` bisa mengambilnya lagi dan hasilnya bisa dibuktikan sama.

## 2. Temuan utama — dokumennya sudah tidak ada

PROSEED (`perbenihanhorti.id/proseed`, Direktorat Perbenihan Hortikultura) menerbitkan
dua tabel yang **masih hidup dan lengkap**: 3.503 + 1.592 baris, masing-masing dengan
nomor SK, tahun, pemohon, dan tautan ke dokumen deskripsinya.

Tautan dokumennya yang mati. Sensus penuh atas kelima ribu tautan itu:

| Modul | Tautan | Hidup (200) | Mati (404) |
|---|---:|---:|---:|
| `db-vardaf` | 3.503 | **56** | 3.447 |
| `db-varsan` | 1.592 | **21** | 1.571 |
| **Total** | **5.095** | **77** | 5.018 |

**1,5% yang tersisa.** Polanya rapi: 3.067 tautan bernama angka (`4118.pdf`) dan 121
bernama hash — **nol** dari keduanya hidup, diperiksa lewat HEAD *dan* GET. Yang hidup
seluruhnya bernama deskriptif di folder bertanggal 2022-09 sampai 2023-07.

Fotonya ikut hilang: dari 40 baris yang disampel, 37 foto produk dan 38 foto penciri
membalas 404. Yang lenyap seluruh pohon `uploads/`, bukan satu direktori.

**Arsip web tidak menolong.** CDX Wayback untuk `perbenihanhorti.id/proseed/uploads*`
mengembalikan **satu** berkas berstatus 200 — sebuah jpeg. Nol PDF.

Sumber resmi lain yang dicoba dan hasilnya: `pvtpp.setjen.pertanian.go.id` **NXDOMAIN**;
`hortikultura.pertanian.go.id` hidup tapi situs berita WordPress, bukan basis varietas;
`repository.pertanian.go.id` dan `tanamanpangan.pertanian.go.id` hidup dan **belum
ditelusuri** — itu langkah berikutnya, bukan jalan buntu.

## 3. Temuan kedua — premisnya benar, dan itu yang penting

Dari 77 dokumen hidup, 75 benar-benar PDF, dan hanya **21 punya lapisan teks**; 54
sisanya pindaian. Tetapi 21 itu cukup untuk menguji hal yang sebenarnya dipertaruhkan:
**apakah dokumennya, kalau ada, bisa menjawab pertanyaan no. 14?**

Bisa. Dan ketahanannya menyebut nama ilmiah, jadi ia menyambung langsung ke 208 pintu
OPT jalur 1 tanpa penerjemahan:

> Tomat **TO 3923** — "Tahan layu bakteri (*Ralstonia solanacearum*)"
> → `op:pst:00000009` **Layu bakteri**, *Ralstonia solanacearum* — cocok persis.

> Cabai Besar **Biocalya** dan **Biocavita Agrihorti** — "Tahan terhadap antraknos"
> → antraknosa, tapi tanpa nama ilmiah, jadi sengaja **tidak** ditautkan otomatis.

Umur panennya pun terbaca sebagai angka: `85.44 - 88.39 hst`, `68 – 72 HST`,
`52-53 hari setelah tanam`.

## 4. Temuan ketiga — jenis dokumennya menentukan

Bukan semua SK memuat sifat agronomi, dan pembedanya bukan mutu melainkan **jenis
keputusannya**:

- **Tanda Daftar Varietas Hortikultura** — deskripsi DUS: bentuk tajuk, warna daun
  dengan kode RHS, lingkar batang. Morfologi, bukan kinerja. Alpukat *Rifai* memuat 40-an
  medan rupa dan **nol** medan hasil.
- **Deskripsi varietas sayuran semusim** — di sinilah potensi hasil, umur panen, dan
  ketahanan muncul. Seluruh tiga rekaman berketahanan berasal dari sini (tomat, dua cabai).

Sebaran medan pada 21 dokumen terbaca: ketinggian 21, umur panen 13, ketahanan 3,
potensi hasil 2. Tanaman tahunan dan hias hampir tidak pernah menyumbang.

## 5. Penautan ke `op:vty` — dan satu jebakan

**4.884 dari 5.095** nama varietas PROSEED cocok persis dengan `label` di
`spec/vocab/variety/`. Jadi kalau dokumennya suatu hari didapat, sisi penautannya
sudah beres.

Tapi nama saja tidak cukup. Anggrek hutan *"Sexy Pink"* cocok namanya dengan sebuah
**Aglaonema**. Karena itu `susun-sifat.py` menuntut **nama DAN komoditas**, dan baris
yang komoditasnya tidak cocok dibiarkan tidak tertaut beserta alasannya, bukan
dipaksakan.

## 6. Mutu yang harus ikut terbaca

`sifat-agronomi-benih.json` **bukan lapis terbitan** dan sengaja tidak masuk
`spec/vocab/`. Isinya potongan **verbatim** hasil regex atas teks PDF, dan sebagian
memang pecah di tengah kalimat — `"menengah di"`, `"(*80% Batang"`. Yang disimpan
petikan aslinya, bukan tafsirannya: `"Umur panen genjah"` tetap `"genjah"`, karena
mengubahnya jadi angka berarti mengarang ketelitian yang tidak ada di dokumennya.

21 rekaman dari 11.227 varietas adalah **0,19% cakupan**. Itu benih untuk menguji
bentuk datanya, bukan lapis yang bisa menjawab pertanyaan siapa pun.

## 7. Langkah berikutnya, menurut urutan ongkosnya

1. **Minta dokumennya langsung** ke Direktorat Perbenihan Hortikultura. Tabelnya masih
   mereka terbitkan, jadi arsipnya kemungkinan besar masih ada di sisi mereka — yang
   putus tautan publiknya. Ini jalur termurah dan belum dicoba.
2. **Telusuri `repository.pertanian.go.id`** untuk himpunan "Deskripsi Varietas" —
   buku kompilasi yang satu berkasnya memuat ratusan varietas sekaligus.
3. **Kejar SK pelepasan tanaman pangan**, bukan pendaftaran hortikultura. Registri
   SIPERINTIS mencatat 5.801 baris "Pelepasan Varietas Tanaman"; jenis dokumen itulah
   yang memuat potensi hasil dan ketahanan sebagai medan wajib.
4. **OCR 54 pindaian** hanya kalau ketiga jalur di atas gagal. Ongkos per dokumen
   tertinggi, dan hasilnya tetap cuma 54 varietas.

## Sumber

| | |
|---|---|
| **Penerbit** | Direktorat Perbenihan Hortikultura, Kementerian Pertanian RI |
| **URL** | `https://perbenihanhorti.id/proseed/db-vardaf`, `.../db-varsan` |
| **Tanggal akses** | 2026-08-30 |
| **robots.txt** | tidak ada (404) — tidak ada larangan perayapan yang dinyatakan |
| **Lisensi** | **tidak dinyatakan** di situsnya. Isinya Keputusan Menteri Pertanian — dokumen resmi negara — tetapi ketiadaan pernyataan lisensi bukan izin. Dipakai sebagai rujukan dengan atribusi; **jangan** terbitkan ulang PDF-nya. |
| **Integritas** | SHA-256 tiap berkas unduhan tercatat di `raw/uji-ekstraksi.json` |
