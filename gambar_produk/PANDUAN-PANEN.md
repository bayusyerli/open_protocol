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
| Gambar `403`, halaman `200` | **bukan hotlink — gerbangnya User-Agent.** Diuji silang pada `adilmakmurfajar.com`: UA peramban tanpa `Referer` → 200; UA peramban dengan `Referer` asing → 200; **UA curl bawaan dengan `Referer` benar → 403** | kirim UA peramban; `Referer` tidak berpengaruh |
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
  `plenno-ai.jpg`, 1254×1254). Sebagian lain memakai **mockup 3D untuk seluruh
  katalognya** — SGI begitu, dan bentuknya terbukti dipakai ulang: siluet alfa botol
  GRASSBUSTER dan ONE-UP berimpit pada **IoU 0,998**.

  Render tidak bisa menjawab "seperti apa rupa kemasannya", tetapi tetap bisa menjawab
  "nomor pendaftaran apa yang dibawa label merek ini" — isi labelnya karya seni resmi
  principal, dan justru **lebih terbaca daripada foto**: tanpa silau, tanpa lengkungan,
  tanpa perspektif. Pada SGI, 24 dari 25 nomor terbaca dan **seluruh 24 terverifikasi
  ke registri**.

  Karena itu `G11` menahan render dari `terverifikasi` **kecuali** nomornya sudah
  terkoroborasi (`printed_registration.in_registry` dan `matches_brand` keduanya benar).
  Tandai juga `bentuk_kemasan_generik` supaya permukaan baca-saja tahu kapan tidak boleh
  berkata "carilah yang seperti ini".
- **Logo, bukan kemasan.** Syngenta menayangkan logo merek 400×135 di sebagian besar
  halaman produknya.
- **Poster promosi.** Sepuluh objek di ember DGW adalah poster Instagram. Ember itu
  juga memuat materi "beli 1 gratis 1".

**Penambal bisa menjebak dari dua arah yang berlawanan.** Pada m2u ia berkas
**terbesar** di situs (1024×1024, dipakai sepuluh produk), jadi penyaring resolusi
memilihnya lebih dulu. Pada Asiana kebalikannya: kartu "COMING SOON" ASIATHANE 80 WP
adalah berkas **terkecil** dari 51 (70 KB vs ~600 KB) tetapi ukurannya **tepat 900×900
sama seperti seluruh packshot sah** — penyaring ukuran berkas membuangnya, penyaring
resolusi menyimpannya. Tidak ada ambang tunggal yang menangkap keduanya; yang menangkap
adalah melihat gambarnya.

**Tiga sebab berbeda di balik `nomor_pendaftaran_terbaca: false`,** dan ketiganya layak
dibedakan di `notes` sebab tindak lanjutnya berbeda:

1. **Kolomnya ada tapi kosong.** noAphidss WP mencetak "No. Pendaftaran:" tanpa isi;
   MagK32 begitu juga; KS PAK TANI mengosongkan NETTO. Tidak akan pernah terbaca.
2. **Kolomnya tidak ada sama sekali.** Panel depan Prima Karya hanya memuat nama dagang,
   grup klasifikasi, bahan aktif, dan isi bersih — nomor pendaftaran memang tidak dicetak
   di sisi itu. Kemasan belakang mungkin punya.
3. **Tercetak tapi tidak terbaca.** Melengkung di sisi botol, kabur, atau terlalu kecil.
   Ini satu-satunya yang bisa dipulihkan oleh gambar beresolusi lebih tinggi.

Tandai dengan `quality.penambal`, `quality.tampak_sintetis`, `quality.logo_bukan_kemasan`.
`G11` menahan penambal dan logo tanpa syarat; render hanya lolos bila
`printed_registration`-nya terkoroborasi registri.

**`bentuk_kemasan_generik` bisa diukur, bukan ditebak.** IoU siluet alfa terhadap seluruh
packshot satu principal memberi angka yang memisahkan bersih pada ambang **~0,92**.
Terukur pada 33 packshot SGI: BRANTACOL↔MERKURY 0,983 · HYDROCIDE↔TRESICUR 0,975 (kantong
rodentisida umpan dipakai ulang untuk fungisida 1 kg) · KONTAXONE↔E-GOLD 0,953 ·
WEEDGONE↔E-GOLD 0,929 · CER-ONE↔ORYSTAR 0,925, sedangkan sisanya di bawah 0,86. Simpan
angkanya di `notes`.

**Tetapi teknik itu gagal SENYAP pada latar yang tidak transparan.** Berkas Prima Karya
RGBA berlatar abu-abu muda, bukan alfa; ambang non-putih menangkap hampir seluruh kanvas
dan melaporkan botol 400 ml berimpit dengan jerigen 5 L pada IoU 0,999. Angka itu palsu.
**Periksa `alpha.getextrema()` lebih dulu — kalau latarnya tidak transparan, jangan pakai
IoU siluet sama sekali.**

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

- **Katalog grup, bukan katalog principal — sudah tujuh kali.** dharmagunawibawa · pt-sgi · santani · foragro · adilmakmurfajar · saprotan-utama · petrosida. Pada pt-sgi tujuh produk terdaftar atas principal lain sudah bernama: FORMAT 360/120 SL, NUCLEAR 240 SL, REAKTIF 490 SL (PT. Spektra Global Intiagro) · GRIND UP 240 SL, MANDOXONE 276 SL* (PT. Spektrum Geo Inagro) · HORNET 150 EC (CV. Cinde Laras) · PROGRESSIVE 50 SC (CV. Agro Jaya Indonesia). Pada petrosida: NAGA 500 EC terdaftar atas PT. Yasida Makmur Abadi. Dari 76 produk di `dharmagunawibawa.co.id`
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
| `pt-sgi.com` | `/api/product-filter`, satu GET tanpa auth | **106** produk lengkap dengan `zat_aktif` beserta kadarnya. Lihat catatan di bawah: ini pembukti kecocokan, **bukan** penyempit |
| `kenso.co.id` | **Store API** `/wp-json/wc/store/v1/products?per_page=100` | ~~`product-sitemap.xml`~~ **rusak**: 110 dari 112 `<image:loc>` menunjuk berkas tidak ada — peta menulis nama huruf kecil, server peka besar-kecil (`kentindox-website.jpg` 404, `KENTINDOX-WEBSITE.jpg` 200). Store API juga satu-satunya cara memasangkan halaman dwibahasa |
| `asterindo.co.id` | `/wp-json/wc/store/v1/products?per_page=100` | 35 produk + `images.src`; nama berkas memuat merek |
| `santani.id` | `sitemap.xml` — tapi `APP_URL` bocor sebagai `http://127.0.0.1:8000` | tukar prefiksnya, 93 URL produk langsung sahih |
| `foragro` | `/produk?page=1..6` | `<img>` di halaman daftar sudah menunjuk berkas master; enam GET, nol halaman detail |
| Danken | `/wp-json/wp/v2/media` | ~~pindaian label `RI.-{nomor}.png`~~ — **klaim ini salah, lihat §7d** |

**Karya seni label lebih berharga daripada foto kemasan.** Ia memuat nomor pendaftaran
dan komposisi dalam bentuk yang terbaca mesin maupun mata, dan itulah yang dibutuhkan
`narrowing` untuk merek berisi banyak pendaftaran.

### `zat_aktif` menyempitkan lebih jarang daripada dugaan

Diuji langsung pada 19 merek SGI ber-`span` lebih dari satu: hanya **satu** yang kadarnya
benar-benar memisahkan. Delapan belas sisanya adalah **baris kembar di registri** — nomor
pendaftaran sama persis, kadar sama persis, beda hanya bahasa nama bahan
(`Chlorothalonil` vs `Klorotalonil`, `Triclopyr` vs `Triklopir`) atau `valid_until`.

Jadi komposisi dari API berguna sebagai **pembukti bahwa produk situs ini memang baris
registri itu**, bukan sebagai pemisah antar-pendaftaran. Yang benar-benar menyempitkan
tetap nomor pendaftaran tercetak.

### Nama dagang di kemasan menjumlahkan kadar bahan aktifnya

Sudah dua kali, dan polanya konsisten:

| Tercetak di kemasan | Tertulis di registri |
|---|---|
| `LARBAN 550 EC` | `LARBAN 500/50 EC` (500 + 50) |
| `Chloromycin 740 EC` | `CHLOROMYCIN 440/300 EC` (440 + 300) |

Nama tidak mengikat apa pun; nomor pendaftaran yang mengikat. Pencarian berbasis nama
akan melewatkan keduanya.

### Varian ejaan yang mengubah arti — periksa, jangan langsung tolak

Beda spasi atau tanda hubung aman disatukan. Beda **formulasi** tidak: `Hexacar 50/50 SC`
vs `HEXACAR 50/50 EC` adalah dua sediaan berbeda, dan itu alasan sah menolak.

**Kadar terbalik BUKAN alasan menolak.** Koreksi atas panduan versi sebelumnya, yang
mencantumkan `Timber 15/50 WP` vs `TIMBER 50/15 WP` sebagai penolakan benar. Kemasan
WEEDGONE mencetak `WEEDGONE 200/276 SL*` sedangkan registri menulis
`WEEDGONE 276/200 SL*` — dan nomornya `01030120155197` **cocok persis**. Urutan di
kemasan hanya mengikuti urutan bahan aktif yang dicetaknya sendiri.

Yang memutuskan tetap nomor pendaftaran, bukan nama. Kadar terbalik adalah alasan untuk
**memeriksa nomornya**, bukan untuk menolak. Yang benar-benar tanpa padanan tetap ditolak:
`Extra One 600/80 SC` vs `EXTRA-ONE 680 SC`, `Metachlor 650 EC` vs `METACHLOR 550/100 EC`.

### Tanda bintang pada nama registri = pestisida terbatas pakai

`KONTAXONE 310 SL*` dan `WEEDGONE 276/200 SL*` sama-sama mencetak "PESTISIDA TERBATAS
PAKAI — Hanya digunakan oleh Pengguna yang bersertifikat" di kemasannya. WEEDGONE bahkan
mencetak bintangnya di nama dagang. Berguna sebagai pembukti kecocokan tambahan.

---

## 7b. Bentuk berkas yang tak terduga

- **CMYK.** Sembilan berkas Foragro adalah JPEG **CMYK berprofil ICC** — berkas prapers
  cetak, bukan gambar web. `normalkan.py` menanganinya lewat `profileToProfile`; diuji,
  latar putih tetap murni. Tetapi peramban tidak menampilkan CMYK dengan benar, jadi
  jangan menilai warnanya dari pratinjau.
- **Satu foto, dua merek.** `foramezon-336-sc` dan `foranico-180-30-sc` **identik sha256**
  meski nama berkasnya di situs berbeda — itu bidikan kelompok yang memuat kedua produk.
  Nomor yang tercetak besar di sana milik salah satunya saja. `dhash64` menangkapnya
  sebagai TEMUAN lintas merek, tetapi keputusan peran dan `printed_registration`-nya
  tetap harus diambil manusia.
- **Batas 5 MB memotong yang terbaik, dan sudah dua kali.** Sepuluh berkas Foragro
  (5,0–6,7 MB) dan delapan merek Petrosida yang gambarnya ADA (SMACK DOWN 14,1 MB,
  PERCIS 13,8, BUPROSIDA 13,6, SIDABAS 10,0, …) terlewat karena batas unduh. Delapan
  belas berkas, dan justru yang paling terbaca nomornya.

  Batas itu ada untuk membatasi transfer, bukan mutu — `normalkan.py` memperkecilnya ke
  1600 px / 400 KB apa pun ukuran sumbernya.

  **Pagu baku sekarang `--max-filesize 20000000`.** Kesembilan prospek yang tertolak
  pagu lama sudah dipanen ulang dari URL yang tercatat di baris tolakannya — nol
  pemetaan ulang, nol kegagalan, termasuk SMACK DOWN 13,4 MB. Itu pembenaran praktis
  kenapa alasan tolakan harus spesifik: alasan yang menyebut angka dan URL bisa
  dipulihkan, alasan yang berbunyi "tidak ketemu" tidak.

## 7d. Nama berkas yang tampak terstruktur belum tentu data

Pemetaan pertama melaporkan bahwa Danken menayangkan "pindaian label bernama
`RI.-{nomor pendaftaran}.png` — pencocokan langsung ke registri". Itu masuk panduan ini
sebagai temuan terbaik gelombangnya. **Pemanen memeriksanya dan klaim itu runtuh:**

1. Berkasnya bukan pindaian label, melainkan packshot biasa.
2. **Ke-18 berkas memakai satu nomor yang sama** — `01030120186024` — dibedakan hanya oleh
   akhiran `-1`…`-18` yang **ditambahkan WordPress sendiri** saat berkas bernama sama
   diunggah berulang. Ke-18-nya menempel pada 18 produk berbeda.
3. Nomor itu memang ada di registri, tepat sekali, sebagai `op:prd:00002148`
   **DKBENTA PLUS 432 SL** — dan halaman DKBenta Plus justru tidak memakai berkas
   berawalan `RI.` sama sekali.
4. Resolusinya 350×350, bukan 1313×1313. Yang 1313 adalah lima templat
   `Copy-of-shopee-product-1313-x-1313-px*.jpg` yang tidak menempel pada produk mana pun.

Mengisi `printed_registration` dari nama berkas itu akan menanam tujuh klaim palsu yang
seluruhnya lolos `G9`, sebab nomornya memang terdaftar — hanya bukan milik produk yang
dipasangi. Pemanennya mengosongkannya, dan itu keputusan yang benar.

**Aturannya: `printed_registration` diisi dari yang TERCETAK DI KEMASAN, dibaca dari
gambarnya.** Nama berkas, slug URL, dan metadata CMS bukan sumber yang sah — ketiganya
bisa berupa artefak unggahan. Satu pengecualian di Danken lolos justru karena dibaca dari
gambarnya: DKMESONIN 500/50 SC mencetak `RI. 01030120144979` yang terbaca pada
pembesaran 8×.

## 7e. Komposisi tercetak pun bisa menyesatkan

`komposisi_tercetak` dasar penyempitan terkuat, tetapi bukan tanpa cacat. Di Petrosida,
**SIDASTAR (480 SL) dan OBIN (310/115 SL) sama-sama mencetak "IPA Glifosat 490 g/l"**,
sedangkan SIDAFOS 480 SL mencetak "166 g/l". Menyempitkan lewat komposisi di situ
menghasilkan jawaban salah.

Dan resolusi rendah membuat pembacaan sendiri tidak dapat dipercaya: pada 350 px bahan
aktif DKAUREVA terbaca "Imidakloprid 5%", padahal registri mencatat **Nitenpiram** 5%.
Pemanennya menurunkan `komposisi_terbaca` ke `false` dan mencatat kekeliruannya — itu
perilaku yang benar, dan alasan kenapa `komposisi_terbaca` harus jujur.

**Pemicunya ternyata bentuk kemasan, bukan resolusi.** Pada master 650×650 yang sama:
**kantong** memberi tinggi huruf ~6–9 px dan terbaca bersih pada 10×; **botol** hanya
~4–5 px, dan gagalnya **senyap** — ia tidak kabur, melainkan mengganti nama bahan dengan
yang masuk akal. Terbukti dua kali di Rainbow: UNIZOLE terbaca "Tebukonazol 50 g/l"
padahal registri **Heksakonazol**; POPZOLE terbaca "Protiokonazol 125 / Tebukonazol 400"
padahal **Propikonazol 125 / Trisiklazol 400**.

Kegagalan senyap lebih berbahaya daripada kegagalan kabur, sebab hasilnya terlihat sah.
Kalau kemasannya botol dan hurufnya di bawah ~6 px, turunkan `komposisi_terbaca` ke
`false` alih-alih memercayai bacaan sendiri.

## 7c. Nama badan hukum di kemasan juga bisa salah

Bukan hanya nomornya. Kemasan BASTEN 45 WP mencetak "Pemegang Pendaftaran: PT. SANTANI
SEJAHTERA" sedangkan registri mencatat PT. SANTANI AGRO PERKASA — nomornya sendiri cocok.
Kemasan PUMA 160 SL mencetak "PT. WIHADIL" di katalog Adil Makmur. Sebaliknya, kemasan
CN-G mencetak "Distributor : CV. SAPROTAN UTAMA" padahal registrannya PT — kemasan
menyebut peran distributor, bukan registran.

Pelajarannya: **`brand_key` yang menentukan principal, bukan halaman situs dan bukan
tulisan di kemasan.**

## 7f. Watermark bisa tinggal sesobek dan hanya tampak setelah peregangan

PRIMA-CRON 500 EC dan PRIMA-FAW 50 EC membawa sisa watermark vektor berakhiran ® di tepi
kiri bawah, terpotong bingkai, **tak terlihat sebelum rentang luminans 215–255
direntangkan** (minimum 219–220 di antara latar 255).

Keduanya bernama `whatsapp-image-*` — tetapi berkas lain bernama pola sama dengan tanggal
berbeda (`whatsapp-image-2025-01-15`) justru bersih. **Jangan simpulkan dari nama berkas;
ukur kolom tepinya.**

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


---

## 10. Catatan kerja agen

**Scratchpad dipakai bersama, bukan per sesi.** Dua kali agen paralel saling menimpa
berkas bantu di direktori scratchpad. Beri awalan sendiri pada tiap berkas kerja
(`u4-kandidat.json`, bukan `kandidat.json`).

**Teks katalog bisa keliru sedangkan kemasannya benar.** Halaman FORSIL menyebut Zn 0,25%
dan Mo 0,001%; kemasannya mencetak Zn 0,3% dan Mo 0,12% — dan **kemasanlah yang cocok
persis** dengan hasil analisa uji registri. Baca gambarnya, jangan teks halamannya.

**Pengubah ukuran tidak selalu memperbesar.** Pada MKD, `?w=1920`, `?w=2500`, dan
`?w=4000` mengembalikan berkas byte-identik — 1920 lebar master sungguhan. Minta besar,
lalu percayai apa yang datang.

**Berkas media tanpa halaman produk.** BOOSBLOOM punya berkas 2362×1969 di
`wp-json/wp/v2/media` tetapi tidak muncul di sitemap mana pun. Pemanen yang hanya membaca
sitemap akan melewatkannya.


## 11. Karya seni label PDF

Sumber bukti terbaik yang ada — nomor pendaftaran dan komposisi tercetak tajam — tetapi
jangan dirasterkan lalu dibaca.

`sips` merasterkan PDF pada **72 dpi** dan tidak bisa disuruh merender ulang lebih besar;
`--resampleHeightWidthMax` hanya memperbesar raster itu, dan ketajaman per piksel justru
turun (diuji: 1010 → 339). Halaman A4 keluar 595×842, di bawah target `besar`.

**Baca lapisan teks PDF-nya.** Ia memberi nomor dan komposisi persis, bukan hasil menebak
piksel. `normalkan.py` tetap bisa merasterkan PDF supaya ada berkas gambarnya, tetapi
angkanya harus datang dari teks, bukan dari raster.

Contoh nilainya: packshot NUTREO tidak mencetak angka hara sama sekali, sedangkan sayap
labelnya mencetak `KANDUNGAN HARA N : 5% P2O5 : 12%` — cocok persis dengan `analysis`
`op:prd:00014071`. Tanpa label itu, merek tersebut tidak bisa dipersempit sama sekali.

Pagu 5 MB memotong 7 dari 10 PDF label UPL (6,2–41,7 MB). Pagu baku kini 20 MB, jadi tiga di antaranya masuk; empat sisanya (di atas 20 MB) masih perlu keputusan tersendiri.


## 12. Jalur navigasi yang mahal ditemukan

**`petrosida-gresik.com`** — kategori di `/id/content/pestisida-kimia/{fungisida,herbisida,
insektisida,moluskisida,rodentisida}`, tetapi **akarisida sendirian di
`/id/content/pertisida-kimia/akarisida`** (salah ketik `pertisida-` di situsnya sendiri).
Cabang non-pestisida terpisah: `/id/content/{pupuk,benih,produk-kimia,peternakan-perikanan}`.
Total 68 halaman produk. **Sudah habis dipanen** — setiap halaman yang cocok ke registri
sudah masuk; 47 merek registri sisanya tidak punya halaman sama sekali.

**`pt-sgi.com`** — `zat_aktif` dari API kotor: beberapa nilai berspasi di depan, satu
bertab (`Flurokspir meptil 520\tg/l`), satu bersatuan salah (`Imidacloprid 25 EC`). Cukup
untuk membuktikan kecocokan, tidak cukup untuk dijadikan kunci.
