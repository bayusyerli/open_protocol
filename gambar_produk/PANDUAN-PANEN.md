# Panduan panen gambar kemasan

Hasil pemetaan 60 principal pada 20 Agustus 2026. Ditulis supaya gelombang berikutnya
tidak membayar ulang pelajaran yang sudah dibayar — beberapa di antaranya nyaris
membuat situs yang sehat dicoret sebagai mati.

Yang mengikat tetap [`spec/schema/product-image.schema.json`](../spec/schema/product-image.schema.json);
dokumen ini soal cara kerja, bukan soal bentuk data.

---

## 0. Kalibrasi titik pandangmu sebelum menilai apa pun

**Baca ini lebih dulu.** Ia membatalkan lebih banyak kesimpulan daripada seluruh pasal
lain digabung.

Lingkungan panen ini tidak bisa menjangkau blok-blok IP tertentu — **blok /24 utuh, bukan
alamat per alamat** — dan blok yang tersaring berubah dari waktu ke waktu. Diuji 22
Agustus 2026 terhadap situs yang **sudah kita panen sendiri**:

| Situs | Merek terpanen | Terjangkau? |
|---|---:|---|
| `petrosida-gresik.com` | 47 | **gagal** |
| `katalogcba.com` | 31 | **gagal** |
| `asterindo.co.id` | 12 | **gagal** |
| `saprotan-utama.com` · `pt-sgi.com` · `kenso.co.id` · `santani.id` | 95 | 200 |

Sembilan puluh merek datang dari tiga situs yang hari ini tampak mati. Tanpa kalibrasi
itu, ketiganya akan tercatat `mati` dan 90 merek akan ditulis sebagai tak berkemungkinan.

Aturannya:

1. **Jalankan `cek-jangkauan.py --kendali-saja` sebelum menilai satu pun situs.** Ia
   menguji tujuh situs yang terbukti pernah memberi kita gambar dan menyebut blok /24 mana
   yang sedang buta.
2. **Hasil negatif pada blok yang buta tidak sah.** Jangan tulis `mati`, jangan tulis
   `rusak`; tulis apa adanya di `catatan` bahwa blok itu tak terjangkau saat diperiksa.
3. **`WebFetch` bukan pendapat kedua yang bebas** — ia mengembalikan `ECONNREFUSED` untuk
   `asterindo.co.id`, situs yang terbukti bekerja. Bukti kedua yang sah: whois PANDI/ICANN,
   resolver publik (8.8.8.8 dan 1.1.1.1), dan Wayback CDX
   (`cdx/search/cdx?...&limit=-N`) yang memberi tanggal tangkapan terakhir yang berhasil.
4. **`/dev/tcp` tidak berguna di sini** — ia melaporkan tersaring untuk host yang curl buka
   dengan mulus. Hanya bukti curl yang dihitung.
5. **Beberapa situs gagal serentak di satu blok** adalah tanda blok tersaring, bukan
   kebetulan banyak situs kecil mati bersamaan.

Satu-satunya tanda `mati` yang bertahan di semua titik pandang: **tidak ada A record sama
sekali.** Selebihnya menunggu pemeriksaan ulang dari jaringan lain.

---

## 1. Urutan menemukan situs

Urutkan begini, bukan sebaliknya:

1. **Domain email di direktori asosiasi — lewat API-nya, BUKAN HTML-nya.**

   ```
   cropcare.or.id/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,title,content
   alishter.or.id/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,title,content
   ```

   Jalur ini nyaris dinyatakan mati secara keliru. Dua agen memeriksa
   `/daftar-anggota/` dan melaporkan kolom emailnya hilang — dan HTML-nya memang begitu:
   Elementor image-box, hampir nol teks perusahaan, **4 alamat surat**. Tombol "Kunjungi
   Website"-nya pun `href="#"`, hiasan yang tidak pernah jadi tautan.

   Agen ketiga mencoba API-nya. Hasilnya **74 halaman, 65 alamat surat, 46 domain
   perusahaan** — 24 di antaranya belum ada di antrean sama sekali. Jalurnya tidak
   tertutup; ia cuma tidak ada di HTML.

   Ini pengulangan pelajaran yang sudah ada di memori proyek: registri PUKPES pun
   halamannya minta login sementara endpoint JSON-nya terbuka. **Sebelum menyatakan
   sebuah sumber kehilangan datanya, periksa API di belakangnya.**

   `direktori.py` menariknya dan menandai domain mana yang belum ada di antrean.
2. **Direktori Alishter.** 27 anggota, sebagian tidak tumpang tindih dengan CropCare —
   satu-satunya yang mencantumkan Agro Bumi Timur.

**Segmen pupuk: dua direktori pengganti, dan keduanya buntu — sudah ditelusuri sampai
habis, jangan bayar ulang.**

CropCare dan Alishter badan **pestisida**. Pemetaan gelombang 4 agen 3 mengukurnya: **nol
dari 40 principal pupuk** jadi anggota keduanya. Dua badan pupuk diusulkan sebagai
pengganti; keduanya ditelusuri lewat API dan arsip pada 22 Agustus 2026, dan hasilnya
**nol domain baru**. Sebabnya berbeda sama sekali, dan sebab itulah yang perlu diingat,
bukan angkanya.

| Badan | Hasil |
|---|---|
| **APPI** — Asosiasi Produsen Pupuk Indonesia | Anggotanya cuma **6, seluruhnya BUMN**: `pusri.co.id`, `petrokimia-gresik.com`, `pupuk-kujang.co.id`, `pupukkaltim.com`, `pim.co.id`, plus holding `pupuk-indonesia.com`. Semuanya sudah di antrean sejak gelombang 1. APPI himpunan raksasa negara — **kebalikan** dari ekor tempat principal pupuk kita berada |
| **AP2KMI** — Asosiasi Produsen Pupuk Kecil Menengah Indonesia | **AP2KMI dan APPKMI badan yang SAMA**, dua ejaan akronim untuk satu nama. Situsnya `asosiasiprodusenpupuk.org`; lewat API-nya: **2 halaman** (satu berjudul "Under Costruction"), **0 pos**, 1 pengguna admin, media seluruhnya foto stok Unsplash, **nol alamat surat**. Brosur satu halaman, bukan direktori |

Buktinya dua arah, dan itu yang menutup dugaan "AP2KMI belum pernah dicoba": CV. Dewi Sri
Rama menyebut dirinya anggota "Asosiasi Produsen Pupuk Kecil Menengah Indonesia
**(AP2KMI)**", sementara `asosiasiprodusenpupuk.org` menyebut dirinya "Asosiasi Produsen
Pupuk Kecil Menengah Indonesia **(APPKMI)**" — kalimat yang sama persis, akronim berbeda.
Badannya memang menaungi produsen kecil-menengah, persis ekor yang kita cari; **situsnya
yang tidak pernah memuat daftar anggota.** Dugaan itu masuk akal dan tetap salah, tetapi
salahnya bukan "badannya tidak ada" — melainkan badannya ada di bawah nama lain yang
sudah diperiksa.

**Domain APPI sendiri sudah lepas, dan itu mengubah cara memeriksanya.** `appi.or.id` nol
A record pada 8.8.8.8 maupun 1.1.1.1, berstatus `serverHold` di PANDI, dan tangkapan
Wayback November 2024 atas `www.appi.or.id` adalah **situs judi slot** — domainnya lepas
lalu diduduki pihak lain. Daftar anggota di atas datang dari arsip 26 Februari 2021, bukan
dari situs hidup. Pelajaran §0 berlaku terbalik di sini: yang dicegah bukan `mati` palsu
melainkan **hidup palsu** — domain yang masih menjawab 200 tetapi sudah bukan milik badan
yang kau cari. Periksa siapa pemiliknya sekarang, bukan cuma apakah ia menjawab.

`direktori-pupuk.py` menariknya dan menandai domain mana yang belum ada di antrean, sama
seperti `direktori.py` di sisi pestisida. Jalankan ia lebih dulu sebelum menduga ada
direktori pupuk yang terlewat — jawabannya sudah dikodekan di sana, berikut cara
mengambilnya (arsip untuk APPI, proksi untuk AP2KMI).

**Dan API tidak selalu membalik hasilnya.** Di CropCare, API memberi 46 domain yang tak ada
di HTML; di AP2KMI, API **membenarkan** HTML yang kosong. Yang membuat kedua pemeriksaan
sah adalah pemeriksaannya dilakukan, bukan hasilnya berbalik. Jangan pakai kisah CropCare
sebagai janji bahwa setiap HTML kosong menyembunyikan API yang penuh.

**Dan urutan itu punya batas segmen.** Pada satu potongan berisi 15 principal, **tidak
satu pun anggota CropCare maupun Alishter**, dan CropLife Indonesia tidak menerbitkan
direktori anggota sama sekali. Potongan itu berisi principal rumah tangga, biosida
industri, dan importir kecil — di luar pertanian arus utama. Jalur berhasil tertinggi di
atas menjadi jalan buntu di situ. Periksa keanggotaan direktori lebih dulu sebelum
menghabiskan pengambilan.

3. **Tebakan dari nama MEREK, bukan nama PT.** Merek Aster* → `asterindo.co.id`; merek
   AMA* → `pt-ama.co.id`. Tebakan dari nama perusahaan hampir selalu gagal.
4. **Nama induk global.** Sebagian principal berdagang dengan nama lain sama sekali:
   PT. Bina Guna Kimia = FMC Indonesia · PT. Royal Agro Indonesia = ADAMA Indonesia ·
   PT. Catur Agrodaya Mandiri = UPL · PT. Da Ming Indonesia = Asiana Chemical ·
   PT. Discovery Environmental Science = Envu, yang tak terlihat dari nama PT dan hanya
   terbaca dari daftar mereknya (K-OTHRINE, PREMISE, MAXFORCE).

   **Aturan ini menuntut satu pemeriksaan lanjutan, sebab ia bisa menyesatkan.**
   `arystalifescience.com` hidup dan ber-MX, tetapi ia aset warisan UPL, **bukan domain
   PT. Arysta LifeScience Tirta**. Diuji langsung: API produk `id.uplcorp.com`
   mengembalikan 129 nama dan **nol** dari 14 merek Arysta. Mencatat domain itu akan
   mengkredit principal ini dengan domain yang bukan miliknya.

   **Pastikan induknya benar-benar membawa merek principal itu sebelum domainnya
   dikreditkan.**

---

## 2. Jebakan nama — semuanya membalas HTTP 200 dengan isi meyakinkan

| Domain | Sebenarnya milik |
|---|---|
| `indosino.co.id` | PT. Indo Sino Oil & Gas — perusahaan lain sama sekali |
| `indagro.com` | Indagro SA Jenewa, pedagang pupuk |
| `foragro.com` | perusahaan non-Indonesia |
| `hit.co.id` | PT. Haga Indonesia Teknologi, sistem keamanan (Godrej ada di `hitantinyamuk.id`) |
| `rolimex.com` | dijual di HugeDomains |
| `indoin.com` · `globalagrotech.com` · `vapeindonesia.com` · `agrorisen.com` · `supergib.com` · `sarikimia.com` | halaman parkir / penadah domain |
| `exindo.com` | PT Exindo Information Technology |
| `tunasharapan.com` | halaman jual HugeDomains — yang benar **`tunasharapan-murni.com`** dengan tanda hubung, dan bentuk tanpa hubung itulah yang lebih dulu ditebak orang |
| `east-chem.com` | EASTCHEM di Lomé, Togo — punya server surat sendiri, judulnya cocok persis |
| `agrochemica.com` | EW Nutrition |
| `appi.id` | **Asosiasi Perusahaan Pembiayaan Indonesia** — multifinance, bukan pupuk. Akronimnya sama persis dengan Asosiasi Produsen Pupuk **Indonesia**, situsnya hidup dan rapi (44 KB), dan ia punya halaman "Daftar Anggota" sungguhan — yang isinya perusahaan berizin OJK. Ketahuan dari `Application_For_Membership_Multifinance.pdf` dan tautan `lapssjk.id` |
| `*.indonetwork.co.id` | **subdomain wildcard**: `appkmi.indonetwork.co.id` dan subdomain karangan `zzz-tidak-ada-sama-sekali-9f3k` sama-sama membalas **200 dengan 865.514 bita yang sama** — beranda marketplace, bukan profil badan. Setiap nama asosiasi tampak "punya halaman" di sana. Ukur panjang badannya, seperti pada "Just a moment..." di §0 |
| **`agrofarm.co.id`** | **yang paling berbahaya**: hidup, 644 KB, nama perusahaan cocok persis pada TLD yang benar, isinya pertanian sungguhan, punya MX sendiri — tetapi ia **portal berita agribisnis**, bukan PT Agrofarm Nusa Raya. Lolos setiap heuristik kecuali dibaca |

**Saudara yang menjebak ada di dalam registri sendiri**, bukan cuma di domain:
`CV. UNI AGRO CHEMICA` ≠ `CV. AGRO CHEMICA`, dan `PT SARI KRESNA KIMIA` ≠ `PT SARI KIMIA
UNGGUL` — yang pertama justru situs tersusupi di §8. Nama principal yang mirip bukan
petunjuk bahwa mereka berkerabat.

Memeriksa kode HTTP saja akan meloloskan semuanya.

---

## 3. Empat cara situs sehat salah dinilai mati

| Gejala | Kenyataan | Penawarnya |
|---|---|---|
| `403` lalu timeout | butuh User-Agent peramban (`globalagrotech.id`) | kirim UA peramban sebagai bawaan |
| Gambar `403`, halaman `200` | **bukan hotlink — gerbangnya User-Agent.** Diuji silang pada `adilmakmurfajar.com`: UA peramban tanpa `Referer` → 200; UA peramban dengan `Referer` asing → 200; **UA curl bawaan dengan `Referer` benar → 403** | kirim UA peramban; `Referer` tidak berpengaruh |
| Semua `/id/` `403`, gambar lolos | **Koreksi: `cdn.nufarm.com` BUKAN host terbuka terpisah** — ia origin Cloudflare yang sama dengan aturan WAF yang sama; `cdn.nufarm.com/id/product/*` juga 403. Hanya jalur `/wp-content/uploads/` yang lolos, tanpa daftar direktori | **Perambannya bisa dihindari:** `/id/feed/?paged=1..11` seluruhnya 200 (halaman 12 → 404). Sebelas halaman umpan plus beranda memberi 366 URL gambar CDN unik yang menutup 21 dari 88 merek. Umpan ARTIKEL yang membawa packshot-nya |
| Tampilan kecil, berkas besar | `style` inline memaksa 175 px padahal sumbernya 2122×1564 (Petrosida) | jangan simpulkan resolusi dari HTML — baca header berkasnya |

**Cara kelima, dan ia salah menilai ke DUA arah sekaligus:** `hanearl.com` membalas
**200 pada porta 80 tetapi timeout pada 443**. Yang hanya memeriksa HTTPS mencatatnya
mati; yang hanya memeriksa kode status mencatatnya hidup. Dua-duanya keliru — ia halaman
parkir hosting.kr. Periksa kedua skema, dan baca isinya.

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
- **Hiasan buatan mesin, bukan packshot.** Agromanna memasang berkas bernama
  `Firefly_Gemini-Flash*` dan `Gemini_Generated_Image_*` sampai **2816×1536** — akan
  memuncaki urutan resolusi mana pun. Berbeda dari render kemasan: ini gambar hiasan yang
  tidak menggambarkan produk sama sekali.
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

## 4b. Katalog yang seluruhnya dibangkitkan mesin

Kelas terburuk yang ditemukan, sebab ia lolos setiap penyaring otomatis. Keempat packshot
Panen Raya yang diperiksa dibangkitkan mesin, dan gejalanya seragam:

- **Nomor pendaftaran tergarbling** — `0101012822TA3Z`, `31028128227329`,
  `BLA10401232227868`
- **Teks badan jadi tiruan bahasa Indonesia** yang sekilas terbaca wajar
- **Nama badan hukum rusak** — `CV SARANEA PANEN RAYA`, padahal SARAREA
- **Label sisi botol tercetak terbalik cermin**
- **Aksara asing nyasar** — Penthium 105 EC (Kristalindo) memuat huruf Kirilik **Б** di
  tengah teks Indonesia, plus "Insehiteida" dan "Mat Beosito 400 m!"

Yang membuatnya berbahaya: **komposisinya justru benar.** Teks besar selamat, deret angka
panjang yang diacak. Jadi pemanen yang mencocokkan lewat komposisi akan yakin ia menemukan
produk yang tepat, lalu membawa serta nomor pendaftaran karangan.

MANTRA paling licin: mencetak `31028128227329` sedangkan yang asli `01020120227329` — ia
**meniru bentuknya lalu mengacak digitnya**, sehingga lolos pemeriksaan panjang dan pola.
Penyaring resolusi juga lolos: keempatnya 1080×1080 rapi.

**Yang menangkapnya:** `in_registry: false` pada nomor yang bentuknya benar tetapi tidak
ada di registri. Jangan tergoda menganggapnya salah baca lalu menggantinya dengan nomor
registri — itu justru menanam karangan sebagai fakta. Catat apa adanya dan tandai
`tampak_sintetis`.

Aturan **`G12`** menegakkannya: nomor **berbentuk sah** yang tidak ada di registri, pada
gambar sintetis, **wajib dijelaskan di `notes`**. Sebab ada dua penjelasan yang sangat
berbeda dan pemeriksa tidak bisa memilih — pendaftaran sungguhan yang dicabut (kasus
PHONSKA, kemasan resmi tertinggal di belakang registri) atau nomor karangan yang meniru
bentuk aslinya (kasus MANTRA). Yang bisa ditegakkan mesin hanyalah memaksa penjelasannya
ditulis; manusia yang memutuskan.

Perhatikan mana yang berbahaya: nomor yang bentuknya **rusak** (`0101012822TA3Z`) jelas
salah dan tidak menipu siapa pun, jadi G12 sengaja tidak berbunyi untuknya. Yang
berbentuk **sah** justru yang perlu dijaga — sebab kalau ia sempat masuk lapisan rujukan,
jalur 2 akan menyatakan sebuah produk terdaftar padahal tidak.

Memindai aksara non-Latin di teks yang seharusnya Indonesia itu murah dan tajam.

## 4c. Baris `ditolak` AMAN ditulis — ia tidak memblokir panen berikutnya

Satu pemanen menahan lima merek yang sebenarnya layak panen karena mengira baris `ditolak`
akan memblokir peran yang sama di putaran berikutnya lewat `G6`. **Itu tidak terjadi.**

`gabung.py` memperlakukan panen berhasil sebagai **pengganti** tolakan lama, dan
melaporkannya sebagai `DIGANTIKAN`. `G6` di `periksa.mjs` berjalan di atas manifes yang
sudah digabung, tempat hanya satu baris yang bertahan. Diuji langsung: satu pecahan berisi
`ditolak`, pecahan lain berisi `mentah` untuk merek+peran yang sama → manifes akhir satu
baris berstatus `mentah`.

**Jadi selalu tulis baris tolakannya.** Alasan yang menyebut angka dan URL adalah yang
memungkinkan pemulihan — sembilan prospek pagu 5 MB dipanen ulang persis dari catatannya
sendiri, nol pemetaan ulang. Menahannya justru membuang informasi.

## 4d. Uji piksel-identik lebih tajam daripada IoU siluet

Keduanya menjawab pertanyaan berbeda, dan yang satu bisa lolos sementara yang lain
menangkap:

- **IoU siluet** mengukur **bentuk**. Bagus untuk mockup 3D yang memakai model wadah yang
  sama: SGI 0,998, UPL 1,000.
- **Piksel-identik** mengukur **pemakaian ulang berkas sungguhan**. Pada 30 packshot Centa
  Brasindo, IoU tertinggi hanya **0,953** — di bawah ambang 0,92? tidak, di atasnya, tapi
  jauh dari pola mockup — sehingga penilaian berbasis IoU saja akan menyimpulkan "tidak ada
  yang dipakai ulang". Padahal TOPTENAN 200/130 SC, BENAPIR 300 EC, dan FENA 200 EC
  **berbagi satu foto botol dasar**: 51–53% piksel non-putihnya identik bita demi bita, dan
  pita tutupnya nol selisih.

Pakai keduanya. Dan ingat syarat §4: IoU siluet hanya sah bila latarnya benar-benar
transparan.

## 5. Yang tidak akan pernah punya foto kemasan

Saring di depan, jangan diburu:

- **Bahan teknis** berakhiran `TC`/`TK` berkadar ~95%: `GLYPHOSATE 95 TC`,
  `2,4-D 98 TC`, `METHOMYL 97 TC`. **622 merek sisa**, dijual per drum ke sesama industri.

  **Porsi TC sebagai peramal: dua potongan diuji, hasilnya berlawanan.** Ini dicatat apa
  adanya karena keduanya benar untuk potongannya masing-masing.

  *Terbukti* pada potongan pertanian arus utama: kedua principal `tidak-ada` justru yang
  ber-TC tertinggi (68% dan 25%), sedangkan seluruh dua belas principal ber-TC nol punya
  situs dan sepuluh di antaranya `ada`/`tipis`.

  *Tidak terbukti* pada potongan rumah tangga dan importir kecil: Sumans Mandiri Sejahtera
  punya katalog terbaik kedua dengan TC hanya 14%, sedangkan 8 dari 12 principal ber-TC
  **nol** justru `tidak-ada`.

  Yang menjelaskan keduanya adalah **segmen pasar**, bukan TC. Penjual bahan aktif curah
  dan biosida industri memasarkan diri ke sesama industri dan tidak berkatalog eceran; TC
  hanya salah satu gejala segmen itu, bukan sebabnya.

  **Dan TC buta pada satu segmen seluruhnya.** Tritunggal Arthamakmur ber-TC 0% dan tetap
  tanpa galeri: ke-30 mereknya ACTICIDE, MICROCARE, INNOMAN — pengawet industri untuk
  kosmetik, farmasi, dan pakan. Rumah biosida menamai mereknya seperti merek kimia, bukan
  berakhiran `TC`, jadi saringan TC melewatkannya. Segmen itu butuh penandanya sendiri.
- **Biosida industri.** Ke-62 merek Blue Cube (BIOBAN, KATHON, ROCIMA, PREVENTOL)
  adalah biosida cat, kayu, dan tekstil, kini milik DuPont dan LANXESS.
- **Principal yang memasarkan diri ke industri, bukan ke petani.** Inti Everspring
  (137 merek) hanya menayangkan sembilan bahan aktif teknis di situsnya yang sehat dan
  terurus. Itu keputusan editorial, bukan katalog yang belum jadi.

---

## 6. Situs ≠ merek principal itu

Dua koreksi yang membuat taksiran cakupan berhenti terlalu optimis:

- **Dua katalog grup menaungi principal yang dipetakan di gelombang berbeda**, dan
  memanennya dua kali adalah pemborosan: `santani.id` juga menaungi 19 dari 24 merek
  PT. SANTANI SEJAHTERA di samping PT. SANTANI AGRO PERKASA yang sudah dipanen; dan
  `nufarm.com/id/` juga menaungi PT. CROP CARE INDONESIA, pendaftar kedua Nufarm di
  Indonesia (NUFOSAT, KUPROXAT, RHODIAMINE, VONDOZEB). Sapuan umpan Nufarm
  `/id/feed/?paged=2..11` memberi 1.187 URL gambar unik, 42 di antaranya bernama merek
  Crop Care — **jangan dijalankan dua kali.** `paged=1` adalah 301, `paged=12` adalah 404.
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
| `katalogcba.com` | `wp-json/wp/v2/posts?per_page=100` (4 panggilan → 314 pos; produknya `post` biasa, bukan CPT). `sitemap_index.xml` **404** — yang benar `wp-sitemap.xml` | Tiap halaman memuat packshot + Brosur JPEG + Brosur PDF sekaligus, ada di **101 dari 101** halaman merek terdaftar. Brosur 1600×2271. Nol pembatasan laju sepanjang ~200 permintaan. **Jalan pintas diuji ulang 22 Agustus 2026: masih sahih**, 100 pos per panggilan, pos terbaru `2026-08-18` — tetapi situsnya tak terjangkau dari titik pandang kami, lihat §8b |
| `exindorp.com` | **katalog ada di dalam bundel JS.** SPA Vite/React yang setiap jalurnya 404 kecuali `/` — tanpa sitemap, robots, wp-json, maupun API. Ambil `/`, baca `<script type="module" src="/assets/index-{hash}.js">`, ambil bundel 494 KB itu, lalu grep `"/assets/{merek}-{hash}.png"` | 30 URL aset, 23 packshot, nama berkas = nama merek. Resolusi terbaik di potongannya: **2268×4032**, foto ponsel mentah. **Pemanen yang menilai dari sitemap atau HTML akan mencatat situs ini mati** |
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
| `CONTESS 80EC` | `CONTESS 30/50 EC` (30 + 50) |
| `Wilbo Plus 585 EC` | `WILBO PLUS 530/55 EC` (530 + 55) |
| `AVIATE 75 WG` | `AVIATE 70/5 WG` (70 + 5) |
| `CHLORMITE 505 EC PLUS` | `CHLORMITE PLUS 459/46 EC` (459 + 45,9) |
| `SERENDY 28 WP` | `SERENDY 18/10 WP` (18 + 10) |
| `CORONA PRIMA 325 SC` | `CORONA PRIMA 200/125 SC` |
| `GANDEWA 550 SC` | `GANDEWA 500/50 SC` |

Ini **aturan, bukan keingintahuan.** Tiga kemasan membuktikannya sendiri dengan mencetak
kedua sisinya serentak pada satu muka: CONTESS (`80EC` + `30 g/l + 50 g/l`), CHLORMITE
(`505 EC PLUS` + `459 + 45,9`), dan SERENDY (`28 WP` + `18% + 10%`).

**Ketaksesuaian nama jauh lebih luas dari sekadar penjumlahan.** Satu situs saja
(katalogcba.com) memberi delapan kejadian dalam empat rupa:

| Rupa | Contoh |
|---|---|
| Kadar dijumlahkan | `PURDAN PLUS 6 GR` = `PURDAN PLUS 3/3 GR` |
| Kadar berbeda untuk pendaftaran yang sama | `GERXONE 288` = `276` · `CENTATOP 288` = `276` |
| Ejaan | `RONDAPGOLD` = `RONDA GOLD` |
| **Nama sama sekali berbeda** | `STALLONE 481 SL` = `NEW LALANG UP 481 SL` · `AGROTHANE 80 WP` = `PRIMATHANE 80 WP` · `SANDY 325/100 SL` = `JOS GANDOS 325/100 SL` |

Delapan dari sepuluh terpecahkan lewat **nomor tercetak**. Nama tidak pernah jadi kunci;
nomor yang jadi kunci. Dan slug pun bukan identitas: `LAMBADA 18 EC` berslug
`hipomec-63-wp`, `EMACEN 30 EC` berslug `emacen-plus-55-ec`.

**Saudara kembarnya: nama dagang MEMBALIK nisbahnya.** Kemasan `ACERO 40/4WP` vs registri
`ACERO 4/40 WP`; `XENON 60/20 WG` vs `XENON 20/60 WG`. Nomor pendaftarannya **cocok
persis** pada keduanya — jadi ini bukan produk berbeda, dan menegaskan koreksi di §7:
kadar terbalik adalah alasan memeriksa nomornya, bukan menolak. Nomor yang memutuskan apa
yang dibalik namanya.

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

**Dan kaitannya lebih longgar lagi dari itu: halaman produk bisa memasang packshot
produk LAIN.** Di Danken, `RI.-01030120186024-3.png` pada halaman DKBenta Plus ternyata
**DK IURON 80 WP**, dan `RI.-01030120186024-2.png` pada halaman DKMektin ternyata
**DK AUREVA 35 WP** — tiga produk berbeda tersangkut pada satu nomor berkas. Berkas
`DK-{Merek}.png` dari pustaka media benar; yang berawalan `RI.` tidak bisa dipercaya dari
arah mana pun, baik namanya maupun halaman yang memuatnya.

**Aturannya: `printed_registration` diisi dari yang TERCETAK DI KEMASAN, dibaca dari
gambarnya** — dan mereknya ditentukan dari yang tercetak di kemasan itu juga, bukan dari
halaman tempat ia dipasang. Nama berkas, slug URL, dan metadata CMS bukan sumber yang sah — ketiganya
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

Dan sekali, ketaksesuaiannya **sistematis, bukan sesekali**: seluruh 30 kemasan Centa
Brasindo mencetak "PT. CBA CHEMICAL INDUSTRY" sedangkan registri mencatat "PT. CENTA
BRASINDO ABADI CHEMICAL INDUSTRY". Itu konvensi merek dagang principal, bukan kekeliruan.

Pelajarannya: **`brand_key` yang menentukan principal, bukan halaman situs dan bukan
tulisan di kemasan.**

## 7g. Katalog tidak menunjuk berkas terbaik di embernya sendiri

Ember Strapi DGW menyimpan awalan ukuran (`xsmall/` … `xlarge/`) yang merekam **kelas
ukuran unggahan aslinya**, bukan ukuran berkasnya sekarang — dan beberapa produk diunggah
dua kali dengan besar-kecil huruf berbeda. `xsmall/BATARA.jpg` 355×356, sedangkan
`large/BATARA.jpg` **1310×3008**: produk yang sama, dua-duanya ada di ember, dan
katalognya menunjuk yang kecil.

Menyapu ember **menurut nama dasar** alih-alih memercayai `/katalog-produk` menaikkan
cacah gambar ≥800 px dari **3 dari 50** jadi **31 dari 58**.

Dua jebakan lanjutan di dalamnya:

- **`large/large_X.png` lebih besar dalam BYTE tetapi lebih kecil dalam PIKSEL** daripada
  `large/X.png`. Urutkan menurut piksel, bukan ukuran berkas.
- **Saring `*LOGO*` sebelum mengurutkan menurut piksel.** `xlarge/ERASOR LOGO.png`
  berukuran 20263×8489 dan akan memuncaki urutan resolusi mana pun. Batas nisbah sisi 3,0
  plus saringan nama berkas membersihkannya.

Dan poster promo yang sudah dicatat di §4 ternyata **bisa dipulihkan**: tujuh produk Delta
yang gambar katalognya memang poster Instagram `beli 1 gratis 1` (seluruhnya 1080×1080,
jadi penyaring resolusi memilihnya lebih dulu) punya packshot sungguhan **di ember yang
sama** — IMPRESSIVE 50 WP dan DECAFEN 250 EC dipulihkan begitu, pada 1540×3000 dan
1066×2432.

## 7h. Packshot di dalam dokumen orang lain

Umpan artikel Nufarm menerbitkan ulang gambar bernomor dari pindaian terbitan penyuluhan:
empat berkas membawa keterangan yang terbakar ke gambarnya, seperti *"Gambar 4. Fungisida
Sumilex 50 WP"*. Bendanya nyata dan fotonya asli — yang bermasalah rantai penerbitannya.

Tandai `quality.gambar_dari_dokumen`, dan `source.rights` wajib `pihak_ketiga`. Aturan
`G13` menegakkan keduanya dan menutup jalan ke `terverifikasi`: yang menerbitkannya bukan
pemegang pendaftaran, jadi tidak ada yang bisa dimintai izin, dan keterangan gambarnya
bisa saja keliru menamai produknya.

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
- **Satya Agro Indonesia** — terburuk: **5.076 pos spam kasino**, dan 282 dari 315 objek
  medianya spam. Peta situs `page` masih bersih, jadi dinilai `tipis` mengikuti preseden
  Dalzon — tetapi pemanen **hanya** boleh menyentuh `/wp-sitemap-posts-page-1.xml`, tidak
  pernah peta pos maupun `wp/v2/posts`.

Tiga dari sekitar 150 situs yang diperiksa. Sudah cukup sering untuk memperlakukan peta
pos sebagai tidak tepercaya secara bawaan, bukan sebagai pengecualian.

Pemanen hanya boleh menyentuh URL dari peta situs produk, **tidak pernah** mengikuti
tautan dari `post-sitemap`. Sejauh ini spamnya berupa halaman promosi biasa, bukan teks
yang mencoba memerintah agen — tetapi isi halaman tetap data, bukan perintah.

---

## 8b. Titik pandang jaringan bisa memalsukan `rusak` dan `mati`

Temuan yang membatalkan sebagian data, dan yang paling penting di seluruh panduan ini.

`katalogcba.com` **berhasil dipanen 31 merek** pada 20 Agustus 2026. Beberapa jam
kemudian ia berhenti menjawab dari lingkungan yang sama — bukan galat HTTP, melainkan
kegagalan sambungan (`000` pada porta 80 maupun 443), sementara situs kendali menjawab
`200` pada detik yang sama.

Bersamanya, dua agen menemukan hal serupa secara terpisah: lima principal di IP Hostinger
gagal serentak, dan tiga domain yang berbagi satu IP (`45.143.81.204`) juga gagal
bersama-sama. **Satu host tersaring menjatuhkan banyak situs sekaligus** — itu yang
membuatnya berbahaya, sebab polanya terlihat seperti "banyak situs kecil memang mati".

Aturannya:

- **Jangan pernah menaikkan baris ke `mati` atas dasar satu titik pandang jaringan.**
- Kalau beberapa situs **berbagi IP** dan gagal serentak sementara kendali lolos, itu
  tanda host tersaring, bukan situs mati. Tulis begitu di `catatan`.
- `/dev/tcp` **tidak berguna** di lingkungan ini — ia melaporkan tersaring untuk host yang
  curl buka dengan mulus. Hanya bukti curl yang dihitung.
- `ns1.dns-parking.com` adalah nameserver **bawaan Hostinger**, bukan tanda parkir. Yang
  benar-benar menandakan kedaluwarsa adalah `ns1/ns2.dns-expired.com`.

**Tanda `mati` yang sungguhan adalah tidak ada DNS sama sekali.** Diuji ulang atas delapan
baris `rusak`/`mati` lama: enam menjawab, dan dua yang gagal (`tmmgroup.id`,
`excel-megindo.co.id`) sama-sama tanpa A record. Menjawab bukan berarti sehat — Solo Logo
tetap membalas 200 dengan badan "website has been stopped" — tetapi **tidak menjawab juga
bukan berarti mati.**

`cek-jangkauan.py` menguji ulang seluruh baris `rusak`/`mati`, menjalankan kendali lebih
dulu, dan **membuang seluruh hasilnya bila kendali gagal** — sebab yang sedang diukur
kalau begitu adalah jaringan kita, bukan situs mereka.

### Proksi memutuskan apa yang probe lokal tidak bisa — diuji 22 Agustus 2026

Aturan di atas berhenti pada "jangan simpulkan mati". Ini melangkah satu langkah lagi:
**ada cara memastikan, dan murah.** Ambil situs yang sama lewat proksi pengambil pihak
ketiga. Kalau proksi menjawab, situsnya hidup dan yang padam adalah jalur kita.

`katalogcba.com` diuji ulang 22 Agustus 2026 sesudah dicatat padam sehari sebelumnya:

| Jalur | Hasil |
|---|---|
| Langsung, tiga percobaan berjarak | `000` habis waktu, tiga-tiganya |
| Seluruh A record (kolam berputar), porta 80 dan 443 | habis waktu |
| AAAA (IPv6) | habis waktu |
| Tepi CDN Hostinger lewat `--resolve` | habis waktu |
| Peramban dalam aplikasi | gagal, sedangkan `example.com` mulus |
| `r.jina.ai` (proksi teks) | **200, isi lengkap** |
| `images.weserv.nl` (proksi gambar) | **200, JPEG 287x300 sungguhan** |

Situsnya **hidup dan terawat**: pos terbaru `2026-08-18`, unggahan di `2026/08`, dan
`wp-json/wp/v2/posts?per_page=100` masih mengembalikan 100 pos JSON sahih sekali panggil.
Yang padam sepanjang ini hanyalah jalur kita menuju ke sana.

Maka tambahkan pada aturan sebelumnya:

- **Sebelum menulis `padam` sekalipun, coba satu proksi.** Satu panggilan `r.jina.ai`
  membalikkan kesimpulan yang sudah terlanjur masuk ke berkas temuan.
- **DNS berputar bukan tanda kerusakan.** A record katalogcba.com berganti tiap kueri
  (`88.223.91.39`, lalu `185.124.137.89`, lalu `91.108.119.209`) sebab `www` ber-CNAME ke
  `cdn.hstgr.net`. Mencatat "A record 88.223.91.60" sebagai fakta tetap keliru sejak awal
  itu satu tarikan dari kolam, bukan alamat situs.
- **`nc -z` sama tak berdayanya dengan `/dev/tcp`.** Ia melaporkan tertutup untuk host
  yang proksi buka dengan mulus. Hanya bukti curl **atau proksi** yang dihitung.
- Panen lewat proksi **mungkin, tetapi tidak utuh**: `images.weserv.nl` meneruskan gambar
  saja, sedangkan aset paling berharga di situs ini brosur PDF butuh jalur lain. Lewat
  proksi didapat packshot dan brosur JPEG, bukan PDF.

## 9. Membedakan empat bentuk kegagalan

Menyatukannya jadi "tidak ketemu" membuang informasi yang mahal didapat, sebab
tindakan lanjutannya berlawanan:

| Status | Artinya | Tindakan |
|---|---|---|
| `kosong` | katalog sehat, gambarnya belum diunggah | **periksa ulang berkala** — Rolimex templatnya belum tersambung tetapi slugnya sudah benar; Albaugh dan KingAgroot memakai berkas `placeholder`/`img-unpublished` |
| `rusak` | situs ada tapi tak berfungsi | tergantung sebab — Royal Agro kehilangan direktori unggahan saat pindah host dan layak dicoba lagi; Jirona DNS aktif dan berkasnya diubah Feb 2026 |
| `mati` | domain sudah bukan milik principal | jangan pernah dicoba lagi |
| `tidak-ada` | tidak pernah punya situs | cari lewat direktori asosiasi, bukan tebakan domain |

| `surat-saja` | domain hidup tetapi hanya melayani surat | jangan cari situs lagi; **domainnya justru penemuan** — ia membuktikan principal ini nyata dan bisa dihubungi |

Status kelima itu ditambahkan setelah dua kejadian: `behnmeyer.co.id` resolve tetapi hanya
server Zimbra (401 di `/traveler`), dan `andhini.com` milik Agro Bumi Timur adalah Google
Workspace dengan web root 404. Terlihat hidup di DNS, tidak pernah punya situs.

Ia dipisahkan dari `tidak-ada` sebab artinya berlawanan: `tidak-ada` berarti jejaknya nol,
sedangkan `surat-saja` berarti **domainnya sudah ketemu** — dan domain email adalah jalur
penemuan dengan hasil tertinggi di §1. Menemukannya sudah setengah pekerjaan, bukan
kegagalan.


---

## 10. Catatan kerja agen

**Scratchpad dipakai bersama, bukan per sesi.** Dua kali agen paralel saling menimpa
berkas bantu di direktori scratchpad. Beri awalan sendiri pada tiap berkas kerja
(`u4-kandidat.json`, bukan `kandidat.json`).

**Teks katalog bisa keliru sedangkan kemasannya benar.** Halaman FORSIL menyebut Zn 0,25%
dan Mo 0,001%; kemasannya mencetak Zn 0,3% dan Mo 0,12% — dan **kemasanlah yang cocok
persis** dengan hasil analisa uji registri. Baca gambarnya, jangan teks halamannya.

**Ember GCS Petrokimia Gresik bisa didaftar publik, dan itu membatalkan penilaian `tipis`
di gelombang pertama.** `storage.googleapis.com/storage/v1/b/pkg-portal-bucket/o?prefix=images/product/`
mengembalikan 768 objek. Katalognya menautkan `_productThumb/` pada 300×380 — angka yang
membuatnya dinilai tipis — padahal **membuang segmen itu memberi 1134×1436**. Pola yang
persis sama dengan ember DGW di §7g.

**Tetapi `_productThumb/` di ember itu ada DUA, dan hanya satu yang punya master.** Turunan
di bawah `images/product/_productThumb/` memang tinggal dibuang segmennya. Yang di **akar
ember** — `_productThumb/pg_petro-ningrat.png` dan lima saudaranya — tidak punya berkas
sepadan di mana pun; 300×380 itu satu-satunya yang ada. Ember hanya memuat 12 objek di
prefix akar itu, jadi memeriksanya murah. Jangan mengarang aturan tunggal dari satu contoh
yang berhasil.

**Berkas besar dengan nama yang mirip belum tentu versi besar; bisa jadi desain karung
LAMA.** Untuk PHONSKA PLUS, ember menyimpan `phonska-plus-zn-sulfur-transparant.png`
800×1014 — hampir tiga kali lipat turunan 300×380 yang ditautkan katalog, dan menggoda
diambil sebagai master. Ia karung generasi sebelumnya: mencetak `01.01.2014.234` dan
`MASA EDAR DESEMBER 2019`, sedangkan yang ditayangkan katalog hari ini karya seni yang
berbeda sama sekali. Hal yang sama pada PETRO NITRAT (`nitrat1-transparant.png`, 800×1081).
Menukarnya demi piksel berarti menerbitkan kemasan yang sudah tidak beredar — kerugian yang
lebih besar daripada resolusi yang didapat. **Bandingkan gambarnya, jangan namanya.**

**Sufiks `-WxH` bisa jadi bagian dari nama unggahan, dan bisa BOHONG.**
`AVIANI-1080x1080-2.png` sebenarnya 800×800, dan membuang sufiksnya justru 404. Jadi
aturan "buang `-WxH` untuk dapat master" gagal ke dua arah di situs ini: sufiksnya bukan
turunan, dan angkanya bukan ukurannya. Ukur berkasnya, jangan percaya namanya.

**Turunan bisa lebih kecil DARI master, dan URL yang ditawarkan situs bukan yang terbaik.**
`featuredImage` Elementor di katalogcba.com menyajikan turunan `-1024x1024` untuk 22 dari 30
packshot, sedangkan masternya sampai 1600×1600. Penawarnya sama dengan Prima Agro: buang
sufiks `-WxH`, minta berkas polosnya. Perhatikan arahnya berlawanan dengan catatan MKD di
bawah — di sana pengubah ukuran tidak memperbesar, di sini URL bawaan justru mengecilkan.

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

**`petrokimia-gresik.com`** — seluruh kategori pupuk ada di `/product-category/pupuk`,
29 halaman, **tanpa penomoran halaman**: satu tarikan memberi semuanya. Halaman produknya
memakai **dua template**, dan pemanen yang hanya mengenal satu akan kehilangan sepertiga
katalog tanpa galat apa pun — tujuh belas halaman menaruh packshot di
`img.lazyload.slide-thumbnail[data-src]`, dua belas sisanya di dalam carousel
`#thumbnail-sliders`. Arah kerugiannya berlawanan pula: yang carousel justru menautkan
berkas master langsung, yang hero menautkan turunan `_productThumb/`.

Brosur PDF-nya tersedia di hampir tiap halaman dan **tidak memuat satu pun nomor
pendaftaran** — berbeda dari karya seni label UPL di §11. Ia tetap berguna untuk komposisi
(dan sekali memperlihatkan selisih: brosur PHONSKA ALAM menyebut N 5% yang tidak tercetak di
karung dan tidak ada di hasil analisa uji mana pun), tetapi nomornya harus dicari di
karungnya, bukan di brosurnya.

Tiga halaman di kategori ini bukan pupuk: PETRO BIOFEED, PETRO CHICK, dan PETROFISH adalah
probiotik ternak dan perikanan, tidak ada di registri PUKPES, jadi tidak bisa punya baris
manifes sama sekali — `G2` menuntut `brand_key` yang benar-benar ada. Dua lagi bukan
packshot: `/product/bahan-kimia` memasang foto gelas laboratorium dan `/product/jasa` foto
pabrik.

**`pt-sgi.com`** — `zat_aktif` dari API kotor: beberapa nilai berspasi di depan, satu
bertab (`Flurokspir meptil 520\tg/l`), satu bersatuan salah (`Imidacloprid 25 EC`). Cukup
untuk membuktikan kecocokan, tidak cukup untuk dijadikan kunci.


## 13. Prospek yang sudah dipetakan, tinggal dipanen

Tercatat di sini alih-alih hilang di laporan agen. Semuanya sudah diverifikasi lewat nomor
tercetak; yang menghalangi hanya pagu 30 merek per agen.

**katalogcba.com** — lima merek yang pencocokan nama akan menolak, tetapi nomornya
memutuskan:

| `brand_key` | nomor tercetak | halaman situs |
|---|---|---|
| `gerxone-276-sl` | `RI. 01030120113990` | `/gerxone-288-sl/` |
| `primaxone-plus-276-sl` | `01030120113991` | `/primaxone-plus-280-sl/` |
| `ronda-gold-525-sl` | `01030120124437` | `/rondap-gold-525-sl/` |
| `purdan-plus-3-3-gr` | `01010120093242` | `/purdan-plus/` |
| `new-lalang-up-481-sl` | `01030120237912` | `/stallone-481-sl/` |

**Lainnya:** ~42 merek Delta Giri Wacana punya objek di ember GCS · ~9 merek Nufarm punya
gambar di umpan artikel · Prima Karya 44 merek cocok beresolusi 1080×1080 · SGI 58 merek ·
Saprotan 18 merek tak-ambigu · MKD 13 · Prima Agro 15 · brosur label PT-AMA dan Kristalindo
(`brocure/BROSUR-*.jpg.webp`, `brosur_*.jpg`) belum tersentuh sama sekali.


## 14. Merek payung: ketika kolom merek registri lebih kasar daripada rak toko

Panen katalog pupuk Petrokimia Gresik (23 Agustus 2026, 29 halaman) menabrak batas yang
belum pernah muncul pada principal pestisida mana pun, dan sebabnya struktural — bukan
kelalaian pemanen.

Registri mendaftarkan formulasi di bawah **nama merek**. Untuk lini komoditas Petrokimia,
nama itu bukan nama produk melainkan nama perusahaannya sendiri:

| Merek registri | Pendaftaran | Isi sebenarnya |
|---|---:|---|
| `KEBOMAS` | 29 | NPK aneka grade, plus dua Kaptan |
| `PETROKIMIA GRESIK` | 11 | Urea, SP-36, SP-26, ZA, ZK, DAP, fosfat alam, organik ×2, hayati ×2 |
| `PETRO` | 9 | ZA, superfosfat tunggal 26%, tujuh baris legacy an-organik tanpa komposisi |

Rak toko memisahkan semuanya. Karung `PUPUK SP-36` bersubsidi berlogo PUPUK INDONESIA dan
karung `PUPUK SP-36 PETRO` nonsubsidi adalah dua kemasan dengan karya seni berlainan — dan
**keduanya menunjuk pendaftaran yang sama**, `01.01.2024.203`. Pembelahan lininya bahkan
tidak konsisten di registri: karung nonsubsidi mencetak wordmark `PETRO`, tetapi ZK dan
SP-36-nya terdaftar di bawah merek `PETROKIMIA GRESIK` sedangkan ZA-nya di bawah `PETRO`.

`G6` memberi satu `kemasan_depan` per merek. Sebelas packshot sah karena itu berebut tiga
slot, dan delapan yang kalah tidak bisa ditulis sebagai baris `ditolak` pun — §4c berlaku
untuk tolakan yang **menggantikan**, sedangkan di sini baris tolakan akan menabrak `G6`
yang sama.
Satu-satunya tempat yang tersisa untuk mencatatnya adalah dokumen ini.

Yang menang slotnya, dan alasannya:

| Merek | Yang diambil | Kenapa ia yang dipilih |
|---|---|---|
| `petrokimia-gresik-pt-petrokimia-gresik` | SP-36 bersubsidi | satu-satunya packshot di seluruh katalog ini yang nomor tercetaknya ADA di registri **dan** milik mereknya sendiri: `01.01.2024.203` |
| `petro-pt-petrokimia-gresik` | ZA PETRO | N 21% + S 24% cocok persis ke `01.08.2022.988`, satu-satunya pendaftaran `PETRO` yang menyimpan komposisi sama sekali |
| `kebomas-pt-petrokimia-gresik` | Kapur Pertanian | 1134×1436, dan jenis terdaftarnya memisahkan 2 Kaptan dari 27 NPK |

**Yang terparkir.** Semuanya packshot bersih di ember principal sendiri, semuanya sudah
dicocokkan ke pendaftarannya. Yang menghalangi hanya slot, bukan bukti:

| Halaman | Karung | Pendaftaran yang dirujuk |
|---|---|---|
| `/product/pupuk-sp-36-2` | PUPUK SP-36 PETRO, 36/5 | `01.01.2024.203` |
| `/product/pupuk-urea-subsidi` | UREA bersubsidi, N 46% | `01.05.2024.200` |
| `/product/pupuk-urea-non-subsidi` | PUPUK UREA PETRO, N 46% | `01.05.2024.200` |
| `/product/za-subsidi` | PUPUK ZA bersubsidi | `01.08.2023.2311` |
| `/product/pupuk-zk` | PUPUK ZK PETRO, K₂O 50% S 17% | `01.03.2024.580` |
| `/product/sp-26` | PUPUK SP-26 PETRO, 26/5 | `01.01.2025.774` |
| `/product/petroganik-2` | PUPUK ORGANIK PETROGANIK bersubsidi | `02.01.2023.924` atau `02.08.2023.926` — komposisi tercetak tidak memisahkan |
| `/product/pupuk-spesifikasi-komoditi` | PUPUK NPK KEBOMAS 15-15-15 | **tidak ada yang cocok** |
| *(tanpa halaman)* `kantong-DAP-PETRO-transparant.png` | PUPUK DAP PETRO, N 18% P₂O₅ 46% | `01.01.2024.579` |
| *(tanpa halaman)* `021118_Rock-phosphate-PETRO_2018_3D-transparant.png` | PUPUK ROCK PHOSPHATE PETRO, P₂O₅ 28% | `01.03.2024.258` |

Dua baris terakhir datang dari sapuan ember di pasal 16, bukan dari katalog: DAP dan Rock
Phosphate tidak punya halaman produk sama sekali, tetapi packshot dan pendaftarannya
dua-duanya ada — yang hilang cuma slot. Karung `PUPUK KCL PETRO` juga ada di ember dan
tidak masuk tabel ini, sebab K₂O 60% yang tercetak tidak cocok ke satu pun pendaftaran
Petrokimia; ia bukan terparkir melainkan tak berpendaftaran.

Baris NPK KEBOMAS itu temuan tersendiri: **tidak satu pun dari 29 pendaftaran KEBOMAS
berkomposisi 15-15-15.** Yang terdekat 15-15-18 (`01.01.2023.727`) dan 15-15-6
(`01.01.2023.1448`). Karung itu memang halaman "Pupuk Spesifikasi Komoditi" — lini racikan
pesanan — jadi kemungkinan besar ia karung contoh, bukan SKU terdaftar. Dicatat apa adanya;
jangan dipaksakan cocok ke pendaftaran terdekat.

**Satu lagi tertahan bukan oleh slot melainkan oleh namanya.** `/product/pupuk-za-plus`
menayangkan karung `PETRO ZA PLUS` 50 kg — N 21%, S 24%, Zn 1.000 ppm — dan satu-satunya
pendaftaran Petrokimia yang berkomposisi N 21% + S 24% berbentuk butiran adalah
`01.01.2025.490`, yang di registri bernama **PETROKIMIA GRESIK ZA MAX**. MAX bukan varian
ejaan PLUS; ia kata lain. Zn yang tercetak pun tidak tercatat di hasil analisa uji
pendaftaran itu. Merek `…-za-max-…` masih kosong dan slotnya tersedia, jadi yang menahan di
sini murni ketiadaan bukti bahwa keduanya barang yang sama — kalau kelak ada yang bisa
memastikan, satu baris tinggal ditulis.

**Kalau kelak batas ini mau dibuka,** yang perlu diputuskan bukan `G6` melainkan kunci
gambarnya: `brand_key` + `narrowed_to` sudah unik pada seluruh sebelas packshot ini, sebab
tiap karung menunjuk pendaftaran yang berbeda kecuali pasangan SP-36 dan pasangan Urea. Itu
keputusan pemilik skema, bukan keputusan pemanen — dan sampai diputuskan, tabel di atas yang
menahan informasinya.

## 15. Seluruh katalog satu principal bisa memakai satu model karung

Diukur pada 14 packshot Petrokimia Gresik yang berlatar benar-benar transparan (§4d
mensyaratkan itu): **IoU siluet 0,995–1,000 pada setiap pasangan**, jauh di atas ambang
0,92. Satu model karung 3D dipakai ulang untuk seluruh lini — yang berganti hanya warna dan
tulisannya.

Artinya `bentuk_kemasan_generik` di sini bukan dugaan melainkan angka, dan konsekuensinya
tegas: gambar-gambar ini **tidak bisa** dipakai menyuruh petani mencari "karung berbentuk
seperti ini". Yang membedakan PETRO NIPHOS dari PETRO NITRAT di toko adalah warna biru yang
berbeda dan angka 20-20-13 lawan 16-16-16, bukan bentuk karungnya.

Ini juga alasan seluruh 13 baris panen ini ditandai `tampak_sintetis`: keduanya render
mockup resmi, bukan foto. `G11` karena itu menahan dua belas di antaranya dari
`terverifikasi`; yang berhak naik hanya SP-36, sebab nomor tercetaknya terkoroborasi
registri. Mekanismenya bekerja persis seperti yang dirancang di §4.


## 16. Sapuan seluruh situs setelah katalognya habis

Panen pasal 14 hanya menyentuh `/product-category/pupuk`. Sapuan lanjutan 23 Agustus 2026
menyisir sisanya, dan hasilnya layak dicatat justru karena sebagian besarnya **temuan
negatif** — daftar yang tidak perlu disapu lagi.

**Situsnya sudah habis.** `sitemap-product-1.xml` memuat tepat 29 URL, sama persis dengan
yang ditautkan halaman kategori. Tidak ada kategori produk kedua. Bagian sitemap lain —
`page` (30 halaman korporat), `news`, `microsite`, `map` — tidak memuat satu pun halaman
produk. `robots.txt` hanya menutup `/cpresources/`, `/vendor/`, `/.env`, dan `/cache/`.

**Yang tersisa hidup di embernya, bukan di situsnya.** 94 objek gambar di akar
`images/product/`; dua belas kini jadi baris manifes. Delapan puluh dua sisanya disortir
dengan melihat semuanya sekaligus dalam satu lembar kontak:

| Golongan | Jumlah | Contoh |
|---|---:|---|
| Ikon daftar di bawah 320 px | 14 | `Urea.jpg` 74×98, `ZK.jpg` 75×97, `Phonska.jpg` 124×169 |
| Benih — di luar registri PUKPES | 7 | Petro Hi-Corn, Petro Hibrida HIPA-11 & 18, Petroseed, Fitrice, Petro Chili |
| Probiotik ternak & perikanan — di luar registri | 3 | Petro Biofeed, PetroFish, Petro Chick |
| Bukan kemasan | 3 | foto drone `DJI_0490.JPG`, cap ISO 27001, foto gelas laboratorium |
| Packshot pupuk: karya seni versi lama, atau slot mereknya sudah terpakai | 55 | `SP36-PETRO-2018`, `PETROGANIK-UPDATE-2017`, `kantong-DAP-PETRO` |

**Satu yang dipanen: `ponska-ocha.png`.** PHONSKA OCA — dua botol 1 liter pupuk organik
cair — ada di ember tetapi **tidak di halaman mana pun dan tidak di sitemap**. Kelas yang
sama dengan BOOSBLOOM di pasal 10, dan satu-satunya di seluruh sapuan ini. Mereknya
menaungi tepat satu pendaftaran, jadi tidak ada tabrakan `G6`; `source.page_url`
dikosongkan karena memang tidak ada halamannya. Perlu diperhatikan pendaftarannya sudah
kedaluwarsa sejak 25 Desember 2025 dan penerusnya, PHONSKA OCA PLUS, merek yang berbeda.

**Tiga produk beredar yang packshot-nya ada tetapi tidak bisa dipasang.** Karung `PUPUK KCL
PETRO` mencetak K₂O 60%; tidak satu pun pendaftaran Petrokimia berkadar itu — yang terdekat
PETRO K PLUS 59%, dan itu ber-B 0,5%. Dugaan yang paling masuk akal: KCl yang
diperdagangkan, bukan diformulasi, sehingga tidak perlu didaftarkan. DAP (N 18%, P₂O₅ 46%)
dan Rock Phosphate (P₂O₅ 28%) sebaliknya PUNYA pendaftaran — `01.01.2024.579` dan
`01.03.2024.258` — tetapi keduanya bernaung di merek payung `PETROKIMIA GRESIK` yang
slotnya sudah dipakai SP-36. Ketiganya masuk daftar terparkir pasal 14.

**Berkas terbesar di ember bukan yang terbaik, dan di sini dua kali.** `Phonska-Plus.jpg`
2347×3216 dan `Petro_Ningrat-2019.png` **3543×4491** — keduanya jauh melampaui packshot
yang dipakai katalog, dan keduanya **desain kemasan generasi lalu**. Phonska Plus 2019
mencetak `01.01.2014.234`; Petro Ningrat 2019 memakai tata letak cokelat berfoto sayuran
yang sama sekali berbeda dari karung emas berombak yang ditayangkan hari ini. Penyaring
resolusi murni akan memilih keduanya lebih dulu, dan keduanya salah.

**Sepuluh merek Petrokimia tetap tanpa gambar, dan situs ini tidak akan menolongnya.**
Dicari di seluruh **33.941 objek** ember, bukan hanya di `images/product/`:

| Merek | Objek di ember |
|---|---|
| PETRO BIOPALM · PETRO KALIMAS · PETRO KALSIPALM · PETROGANIK REMAX · PETROKIMIA GRESIK ZA MAX · PETRONANO | nol |
| PETRO K PLUS · PHONSKA CAIR | hanya foto berita, bukan packshot |
| PETRO BIO | hanya ikon daftar 74×102 px |
| PHONSKA OCA PLUS | belum pernah difoto — yang ada botol PHONSKA OCA, merek lain |

Seratus delapan puluh tiga PNG di luar `images/product/` berukuran di atas 80 KB diperiksa
juga: seluruhnya foto korporat, foto berita, potret direksi, atau sampul laporan tahunan.
**Packshot Petrokimia semuanya hidup di satu direktori** — itu temuan yang menghemat
sapuan berikutnya.


## 17. Brosur PDF sebagai satu-satunya jalan: petrokayaku.com

Situs dengan **cakupan merek sempurna dan resolusi yang tidak terpakai**. Sembilan puluh
satu halaman produk untuk tepat 91 merek terdaftar — tidak ada principal lain sedekat ini —
tetapi setiap packshot yang ditayangkannya **dibatasi 150 px lebar**. Diukur pada 90 dari 91
berkas: lebar selalu 150, tinggi 110–384. Rendition `kecil` saja 320 px sisi terpanjang, jadi
sapuan gelombang 2 menilainya `tipis` dan benar.

Yang membalikkannya bukan varian URL. `data_big/`, awalan `big_`, dan pengubah ukuran
semuanya 404 — sudah diuji dan tetap buntu. **Yang membalikkannya brosur PDF-nya.**

Tiga puluh tiga dari 91 halaman menautkan `data/{stempel}.pdf`, dan di dalamnya packshot
yang sama hidup sebagai **objek gambar tertanam** pada ukuran aslinya. Diekstrak dengan
`pypdf` — bukan dirasterkan, sebab pasal 11 sudah membuktikan rasterisasi 72 dpi justru
menurunkan ketajaman. Hasilnya 226 objek ≥200 px, dan di antaranya 19 packshot berdiri
sendiri:

| | |
|---|---:|
| Terbesar (KAMIKAZE 371 EC) | 847×1273 |
| Cukup untuk rendition `sedang` 800 px | 12 |
| Cukup untuk `kecil` saja | 7 |
| Naik dari 150 px yang ditawarkan halamannya | **semuanya** |

`source.url` pada baris-baris ini menunjuk **PDF-nya**, sebab itu alamat sesungguhnya —
gambarnya tidak pernah punya URL sendiri. Itu bukan kasus `gambar_dari_dokumen`: brosurnya
terbitan principal sendiri, bukan dokumen pihak lain, dan tidak ada keterangan gambar yang
terbakar ke berkasnya.

**Tiga belas brosur lain hanya memuat halaman A4 utuh sebagai satu raster** — sampai
2480×3508, yaitu A4 pada 300 dpi. Packshot-nya ada di dalamnya dan tinggal dipotong; belum
dikerjakan, dan tercatat di sini supaya tidak perlu dipetakan ulang: Applaud 10 WP · Better
10 PA · Biorganik · Curxanil 8/64 WP · Gobest 250 SC · Kayabio Plus · Petroban 200 EC ·
Petrofast · Petrokum 0,005 BB · Primafos 400 SL · Probiss · Seldene 250 EC · Sultricob 93 WP.
Lima puluh delapan halaman sisanya tidak punya brosur sama sekali dan tidak punya jalan lain.

### Situs principal bisa menjual merek yang terdaftar atas nama orang lain

Perluasan pasal 6, dan di sini terbukti tiga kali dalam satu situs. Nomor yang tercetak di
botolnya, bukan teks halamannya, yang membongkarnya — halaman produk petrokayaku.com tidak
menyebut pemegang pendaftaran sama sekali:

| Yang ditayangkan petrokayaku.com | Nomor tercetak | Pemegang pendaftaran sebenarnya |
|---|---|---|
| BIGSON 207 SL | `01030120124425` | **PT. RAGAM MANDIRI** |
| RAZIO 400 SC | `01020120237803` | **PT. KIMIKA USAHA PRIMA** |
| PRESULOR 20/280 OD | `01030120238047` | **PT. RAINBOW AGROSCIENCES** |

Ketiganya dipanen di bawah `brand_key` **pemegang pendaftarannya**, dengan
`source.rights: pihak_ketiga` dan `source.publisher: PT Petrokimia Kayaku`. Menuliskan
`pemegang_pendaftaran` akan mengkredit Kayaku dengan pendaftaran yang bukan miliknya —
kekeliruan yang persis sama bentuknya dengan mengkreditkan `arystalifescience.com` ke
PT. Arysta LifeScience Tirta di pasal 1.

Label RAZIO bahkan memasang logo PETROKIMIA KAYAKU di panel depannya. **Logo di kemasan
bukan bukti kepemilikan pendaftaran.**

### Satu nomor, dua baris registri

Botol KAMIKAZE mencetak `RI. 01020120165622`. Nomor itu menunjuk **dua** baris sekaligus:
`op:prd:00002917` bernama "KAMIKAZE 371 EC" dan `op:prd:00004514` bernama
"KAMIKAZE 318/53 EC" — dua-duanya PT. PETROKIMIA KAYAKU, dua-duanya aktif. Satu pendaftaran
tercatat dua kali dengan dua cara menulis nama, dan aritmetikanya yang membuktikan: 318 + 53
= 371. Baris gambar dikunci ke ejaan yang tercetak di botol.

Kaidah penjumlahan pasal 7 muncul dua kali lagi di situs yang sama, dan tanpa nomor tercetak
kedua-duanya akan ditolak pencocokan nama:

| Di kemasan | Di registri | Aritmetikanya |
|---|---|---|
| LEPTOKIL **140** SE | LEPTOKIL 100/40 SE | natrium bispiribak 40 + metamifop 100 |
| FENITE **150** OD | FENITE 150 OD | lufenuron 75 + emamektin benzoat 75 |

Dan sekali nama yang dipendekkan: botol bertulis "TOPSIN 500 SC", registri "TOPSIN-M 500 SC".
Yang mengikat nomornya (`0102011988857`), bukan ejaannya.

### Nomor berformat lama tidak bisa dicocokkan, dan tidak boleh dipaksakan

GEMPUR 480 SL mencetak `RI.1971/12-2008/T` dan SATURN-D mencetak `RI 160/7-2006/T` — format
sebelum penomoran 14 digit. Registri tidak menyimpan bentuk itu, jadi keduanya **tidak**
ditulis sebagai `printed_registration`; GEMPUR dikunci lewat `merek_tunggal`. Menambal nomor
lama dengan nomor baru yang "kelihatan cocok" berarti menanam tebakan sebagai fakta.

### Judul halaman bisa menyebut produk yang berbeda dari packshot-nya

Halaman `/content/produk/insektisida/…/Saturn-D-600-EC` menayangkan sachet yang mencetak
tiobenkarb 4% + 2,4-D IBE 2% — komposisi SATURN-D **6 GR**, bukan 600 EC. Karena itu
Saturn-D sengaja TIDAK ikut panen ini. Baca komposisi di kemasannya, jangan judul halamannya
— pengulangan pelajaran FORSIL di pasal 10, kali ini pada nama produk, bukan pada angkanya.

### Memotong packshot dari halaman brosur yang utuh

Tiga belas brosur Kayaku menanam halamannya sebagai **satu raster A4** alih-alih memisahkan
packshot jadi objek sendiri. Sembilan berhasil dipotong, dan potongannya justru termasuk
yang terbesar dari seluruh panen ini — GOBEST 250 SC keluar **1290×1403** dari halaman
2480×3508, sebab A4 pada 300 dpi menyisakan banyak piksel bahkan setelah dipotong.

Yang perlu diterima sejak awal: **latarnya tidak akan pernah putih.** Potongan membawa serta
rancangan halamannya — foto tanaman, blok warna, sisa teks di tepi. Kemasannya utuh, tetapi
gambarnya bukan packshot berlatar bersih, dan itu ditulis apa adanya di `notes` tiap baris.
Pada BETTER 10 PA bahkan tidak ada batas bersih yang bisa dipotong sama sekali: brosurnya
menempelkan blok penjelasan langsung ke sisi botolnya.

**Empat sisanya tidak bisa, dan sebabnya dua macam:**

| | |
|---|---|
| Biorganik · Kayabio Plus | brosurnya tidak menayangkan kemasan sama sekali — hanya foto lapangan, tabel dosis, dan karya seni label yang dicetak datar |
| CURXANIL 8/64 WP · PROBISS | packshot-nya jelas dan besar, tetapi **tidak ada di registri** sehingga tidak punya `brand_key`; `G2` menolak baris tanpa merek yang benar-benar tercatat |

CURXANIL layak diperiksa ulang pada tarikan registri berikutnya — fungisida mankozeb 64% +
simoksanil 8% yang dijual terbuka semestinya terdaftar, dan ketiadaannya lebih mirip lubang
tarikan daripada produk tak berizin. PROBISS probiotik ternak, sekelas Petro Chick dan
Petrofish di sisi Gresik: memang bukan urusan registri PUKPES.

**Dan kasus penerbit-bukan-pemegang-pendaftaran bertambah satu lagi jadi empat.** PRIMAFOS
400 SL terdaftar atas nama **PT. KIMIKA USAHA PRIMA**, sama seperti RAZIO. Yang ini ketahuan
dari registri, bukan dari nomor tercetak — nomornya tidak terbaca pada potongan. Artinya
pemeriksaan nama ke registri tetap perlu dijalankan bahkan ketika nomor tercetak tidak ada:
kedua jalur menangkap kelas kekeliruan yang sama dari arah berlawanan.

### Memanen yang 150 px: tercatat, tetapi tidak terbit

Lima puluh delapan halaman Kayaku tidak punya brosur sama sekali. Dipanen juga, dan
hasilnya perlu dibaca apa adanya: **53 baris masuk, dan tidak satu pun terbit.**

Sebabnya aritmetika normalisasi, bukan keputusan. `rendition_terpakai` menolak rendition
yang tidak benar-benar memperkecil, jadi sumber 150×225 hanya menghasilkan **satu** berkas
`besar` seukuran aslinya; `kecil` 320 px tidak pernah terbentuk karena 320 > 225.
`terbitkan.mjs` memakai `kecil` + `sedang`, sehingga kelima puluh lima baris itu jatuh ke
hitungan "tanpa ukuran terpakai" dan tidak pernah sampai ke `app/gambar/`.

Cakupan merek Kayaku karena itu naik ke **70 dari 91** di manifes sementara "produk
bergambar" di app tidak bergerak sama sekali dari 464. Kedua angka itu benar, dan bedanya
justru yang perlu dilihat: koleksi tahu merek-merek ini punya kemasan seperti apa; layar
belum bisa menunjukkannya.

**Kalau kelak ingin ditayangkan juga,** yang perlu diputuskan bukan panennya melainkan
kebijakan terbit: menormalkan ulang dengan urutan `kecil,sedang,besar` akan menamai berkas
dasarnya `kecil` pada ukuran aslinya — sah menurut definisi (rendition itu pagu, bukan
sasaran) dan cukup untuk lolos `terbitkan.mjs`. Yang didapat kartu 150 px yang buram; yang
hilang, kalimat placeholder yang hari ini berbunyi "belum dipanen dari situs principal" —
kalimat yang untuk 70 merek ini sudah tidak benar. Itu pilihan pemilik repositori, bukan
pilihan pemanen.

**Dua penambal tertangkap, dan yang menangkapnya bukan mata.** `periksa.mjs` melaporkan dua
merek berbagi satu phash; berkasnya ternyata `data/no_photo.jpg`, penambal 150×50 px
bertuliskan "NO PHOTO". Keduanya ditulis `ditolak` beralasan, bukan didiamkan — pasal 4c.

**Tetapi phash yang sama juga memberi lapor palsu pada resolusi ini.** Pasangan kedua yang
dilaporkan — TERMIBAN 405 EC dan INSTOP 311 EC — dua produk yang benar-benar berbeda dengan
label berbeda, hanya berbagi cetakan botol yang sama. Pada 150 px, dhash lebih banyak
melihat siluet botol daripada labelnya. **Di bawah ~300 px, lapor phash lintas merek wajib
dilihat, jangan langsung dipercaya.**

Dan bentuk kemasannya memang terbukti dipakai ulang: dari 53 baris, **45 terukur IoU siluet
≥ 0,92** terhadap merek lain di katalog yang sama — beberapa persis 1,000. Latar packshot
situs ini benar-benar transparan, jadi uji pasal 4d sah dipakai di sini, tidak seperti pada
karung Petrokimia Gresik yang berlatar putih pejal.
