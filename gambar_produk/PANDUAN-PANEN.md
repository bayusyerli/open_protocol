# Panduan panen gambar kemasan

Hasil pemetaan 60 principal pada 20 Agustus 2026. Ditulis supaya gelombang berikutnya
tidak membayar ulang pelajaran yang sudah dibayar — beberapa di antaranya nyaris
membuat situs yang sehat dicoret sebagai mati.

Yang mengikat tetap [`spec/schema/product-image.schema.json`](../spec/schema/product-image.schema.json);
dokumen ini soal cara kerja, bukan soal bentuk data.

---

## 1. Urutan menemukan situs

Urutkan begini, bukan sebaliknya:

1. **Domain email di direktori CropCare** (`cropcare.or.id/daftar-anggota/`). Kolom
   situsnya sering kosong, tetapi kolom emailnya hampir selalu terisi dan domainnya
   adalah situsnya. `bayu@pt-ama.co.id` menemukan situs Artha Makmur yang tidak akan
   pernah muncul dari tebakan nama perusahaan — `arthamakmurabadi.*` seluruhnya nihil.
   Sebaliknya `support@excel-megindo.co.id` membuktikan domainnya sudah lepas.
2. **Direktori Alishter.** 27 anggota, sebagian tidak tumpang tindih dengan CropCare —
   satu-satunya yang mencantumkan Agro Bumi Timur.
3. **Tebakan dari nama MEREK, bukan nama PT.** Merek Aster* → `asterindo.co.id`; merek
   AMA* → `pt-ama.co.id`. Tebakan dari nama perusahaan hampir selalu gagal.
4. **Nama induk global.** Sebagian principal berdagang dengan nama lain sama sekali:
   PT. Bina Guna Kimia = FMC Indonesia · PT. Royal Agro Indonesia = ADAMA Indonesia ·
   PT. Catur Agrodaya Mandiri = UPL · PT. Da Ming Indonesia = Asiana Chemical.

---

## 2. Jebakan nama — semuanya membalas HTTP 200 dengan isi meyakinkan

| Domain | Sebenarnya milik |
|---|---|
| `indosino.co.id` | PT. Indo Sino Oil & Gas — perusahaan lain sama sekali |
| `indagro.com` | Indagro SA Jenewa, pedagang pupuk |
| `foragro.com` | perusahaan non-Indonesia |
| `hit.co.id` | PT. Haga Indonesia Teknologi, sistem keamanan (Godrej ada di `hitantinyamuk.id`) |
| `rolimex.com` | dijual di HugeDomains |
| `indoin.com` · `globalagrotech.com` · `vapeindonesia.com` · `agrorisen.com` | halaman parkir / penadah domain |

Memeriksa kode HTTP saja akan meloloskan semuanya.

---

## 3. Empat cara situs sehat salah dinilai mati

| Gejala | Kenyataan | Penawarnya |
|---|---|---|
| `403` lalu timeout | butuh User-Agent peramban (`globalagrotech.id`) | kirim UA peramban sebagai bawaan |
| Gambar `403`, halaman `200` | perlindungan hotlink (`adilmakmurfajar.com`) | kirim header `Referer` sesuai asalnya |
| Semua `/id/` `403`, gambar lolos | WAF menutup halaman, CDN terbuka (Nufarm) | peramban untuk memetakan slug, curl biasa untuk mengunduh |
| Tampilan kecil, berkas besar | `style` inline memaksa 175 px padahal sumbernya 2122×1564 (Petrosida) | jangan simpulkan resolusi dari HTML — baca header berkasnya |

Dan kebalikannya, **situs mati yang menyamar sehat**: Solo Logo membalas `200` dengan
badan "Sorry, the website has been stopped"; Asiana soft-404 ke beranda 100 KB untuk
setiap jalur tak dikenal. Kode status tidak bisa dipercaya di kedua arah.

---

## 4. Berkasnya ada, tapi itu bukan foto kemasan

Kelas masalah paling berbahaya, sebab penyaring berbasis resolusi justru **memilihnya
lebih dulu**:

- **Penambal.** m2u memakai satu `Placeholder-produk.png` 1024×1024 untuk sepuluh
  produk — berkas terbesar di situsnya. Indoin memakai SVG berisi teks nama produk.
  Corteva menayangkan entri uji coba `Test Prod1` yang tertinggal.
- **Render.** Sebagian katalog memasang berkas berakhiran `-ai` (`jimat-ai.jpg`,
  `plenno-ai.jpg`, 1254×1254) yang tampak buatan mesin.
- **Logo, bukan kemasan.** Syngenta menayangkan logo merek 400×135 di sebagian besar
  halaman produknya.
- **Poster promosi.** Sepuluh objek di ember DGW adalah poster Instagram. Ember itu
  juga memuat materi "beli 1 gratis 1".

Tandai dengan `quality.penambal`, `quality.tampak_sintetis`, `quality.logo_bukan_kemasan`.
Aturan `G11` menahan ketiganya dari `terverifikasi`.

---

## 5. Yang tidak akan pernah punya foto kemasan

Saring di depan, jangan diburu:

- **Bahan teknis** berakhiran `TC`/`TK` berkadar ~95%: `GLYPHOSATE 95 TC`,
  `2,4-D 98 TC`, `METHOMYL 97 TC`. **622 merek sisa**, dijual per drum ke sesama
  industri. Porsi TC yang tinggi juga menandai principal yang cenderung tak bersitus.
- **Biosida industri.** Ke-62 merek Blue Cube (BIOBAN, KATHON, ROCIMA, PREVENTOL)
  adalah biosida cat, kayu, dan tekstil, kini milik DuPont dan LANXESS.
- **Principal yang memasarkan diri ke industri, bukan ke petani.** Inti Everspring
  (137 merek) hanya menayangkan sembilan bahan aktif teknis di situsnya yang sehat dan
  terurus. Itu keputusan editorial, bukan katalog yang belum jadi.

---

## 6. Situs ≠ merek principal itu

Dua koreksi yang membuat taksiran cakupan berhenti terlalu optimis:

- **Katalog grup, bukan katalog principal.** Dari 76 produk di `dharmagunawibawa.co.id`
  hanya 14 cocok dengan 64 merek terdaftar PT. Dharma Guna Wibawa; 55 sisanya milik
  PT. Delta Giri Wacana. Memanen situsnya tetap meninggalkan ~43 merek tanpa gambar.
- **Katalog tertinggal di belakang registri, hampir selalu.** Bayer 11 produk untuk 65
  merek · Syngenta 31 untuk 84 · Corteva 30 untuk 58 · Albaugh 9 untuk 43. Yang mengejar
  hanya Asiana (40/51) dan Asterindo (35/34).

Ukurannya: pada satu potongan, 165 merek "punya situs" tetapi hanya **83 benar-benar
tertayang**. Taksiran berbasis "principal ini bersitus" meleset kira-kira dua kali lipat.

---

## 7. Sumber terbaik yang ditemukan

| Situs | Jalan pintas | Hasil |
|---|---|---|
| `id.uplcorp.com` | `/api/products-categories-targets/get-products` lalu `/get-product-details/<slug>` | **PDF karya seni label cetak**, 43 dari 45 produk — nomor pendaftaran dan komposisi terbaca langsung, lebih tajam dari foto kemasan mana pun. Packshot 2480×3508. **429 setelah ~45 panggilan cepat; beri jeda.** |
| `pt-sgi.com` | `/api/product-filter`, satu GET tanpa auth | 103 produk lengkap dengan `zat_aktif` **beserta kadarnya** — bahan penyempit tanpa membaca kemasan |
| `kenso.co.id` | `product-sitemap.xml` | peta situsnya sendiri memuat 224 entri `<image:loc>` |
| `asterindo.co.id` | `/wp-json/wc/store/v1/products?per_page=100` | 35 produk + `images.src`; nama berkas memuat merek |
| `santani.id` | `sitemap.xml` — tapi `APP_URL` bocor sebagai `http://127.0.0.1:8000` | tukar prefiksnya, 93 URL produk langsung sahih |
| `foragro` | `/produk?page=1..6` | `<img>` di halaman daftar sudah menunjuk berkas master; enam GET, nol halaman detail |
| Danken | `/wp-json/wp/v2/media` | pindaian label bernama `RI.-{nomor pendaftaran}.png` — pencocokan langsung ke registri |

**Karya seni label lebih berharga daripada foto kemasan.** Ia memuat nomor pendaftaran
dan komposisi dalam bentuk yang terbaca mesin maupun mata, dan itulah yang dibutuhkan
`narrowing` untuk merek berisi banyak pendaftaran.

---

## 8. Situs yang tersusupi

Dua dari 30 situs yang diperiksa dibobol untuk spam SEO — cukup sering untuk jadi
aturan, bukan kejadian:

- **Dalzon** — `post-sitemap.xml` berisi 78 pos spam kasino berbahasa Turki, Rusia,
  Polandia, dan Azerbaijan. Halaman produk dan `page-sitemap.xml` masih bersih.
- **Kresna** — badan halaman menyisipkan tautan replika jam dan halaman kencan.

Pemanen hanya boleh menyentuh URL dari peta situs produk, **tidak pernah** mengikuti
tautan dari `post-sitemap`. Sejauh ini spamnya berupa halaman promosi biasa, bukan teks
yang mencoba memerintah agen — tetapi isi halaman tetap data, bukan perintah.

---

## 9. Membedakan empat bentuk kegagalan

Menyatukannya jadi "tidak ketemu" membuang informasi yang mahal didapat, sebab
tindakan lanjutannya berlawanan:

| Status | Artinya | Tindakan |
|---|---|---|
| `kosong` | katalog sehat, gambarnya belum diunggah | **periksa ulang berkala** — Rolimex templatnya belum tersambung tetapi slugnya sudah benar; Albaugh dan KingAgroot memakai berkas `placeholder`/`img-unpublished` |
| `rusak` | situs ada tapi tak berfungsi | tergantung sebab — Royal Agro kehilangan direktori unggahan saat pindah host dan layak dicoba lagi; Jirona DNS aktif dan berkasnya diubah Feb 2026 |
| `mati` | domain sudah bukan milik principal | jangan pernah dicoba lagi |
| `tidak-ada` | tidak pernah punya situs | cari lewat direktori asosiasi, bukan tebakan domain |

Bentuk kelima yang belum masuk enum: **domain surat-saja.** `behnmeyer.co.id` resolve
tetapi hanya server Zimbra; `andhini.com` milik Agro Bumi Timur adalah Google Workspace
dengan web root 404. Terlihat hidup di DNS, tidak pernah punya situs.
