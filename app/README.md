# app — permukaan baca-saja

Dua jalur, berkas statis, tanpa kerangka kerja, tanpa langkah bangun, tanpa server
aplikasi. Seluruh jawaban datang dari `spec/indeks/`.

| Halaman | Jalur | Rancangan |
|---|---|---|
| `beranda.html` | — pintu depan: satu kotak pencarian, lalu diserahkan ke jalur yang punya perendernya | — |
| `jalur-1.html` | 1 — masuk dari gejala: dugaan penyebab, dua cara memastikan, bahan aktif yang terdaftar | [`docs/04-jalur-insiden.md`](../docs/04-jalur-insiden.md) |
| `index.html` | 2 — masuk dari kemasan: isi produk dan merek lain yang isinya sama | [`docs/05-jalur-produk.md`](../docs/05-jalur-produk.md) |
| `jalur-3.html` | 3 — kalkulator: rupiah per kilogram hara, bukan per karung | [`docs/06-jalur-hitungan-hara.md`](../docs/06-jalur-hitungan-hara.md) |
| `jalur-4.html` | 4 — benih & bibit: surat apa yang dipegang varietasnya | [`docs/07-jalur-keabsahan-benih-bibit.md`](../docs/07-jalur-keabsahan-benih-bibit.md) |
| `jalur-5.html` | 5 — meramu pupuk sendiri: resep terbuka beserta kedudukan hukumnya | [`docs/08-jalur-sediaan-pupuk.md`](../docs/08-jalur-sediaan-pupuk.md) |
| `jalur-6.html` | 6 — sediaan pengendali sendiri: **status hukum, bukan anjuran** | [`docs/09-jalur-sediaan-pengendali.md`](../docs/09-jalur-sediaan-pengendali.md) |
| `takaran.html` | — kalibrasi semprot & takaran alat rumah tangga: aritmetika, bukan anjuran | D4 + D5 pada [`docs/15`](../docs/15-kapabilitas-lintas-pemangku.md) |
| `harga.html` | — harga komoditas: eceran harian nasional, riwayat, pola bulanan, komentar per seri, dan — untuk TBS sawit — tabel harga & rendemen per umur tanaman | C4 pada [`docs/15`](../docs/15-kapabilitas-lintas-pemangku.md) + [`docs/16`](../docs/16-sumber-harga-komoditas.md) |
| `principal.html` | — profil badan pemegang pendaftaran: apa saja yang terdaftar atas namanya | C1 pada [`docs/15`](../docs/15-kapabilitas-lintas-pemangku.md) |
| `toko.html` | — direktori layanan: toko tani berkoordinat, dan penjual benih yang **tidak** bisa dituju | C7 pada [`docs/15`](../docs/15-kapabilitas-lintas-pemangku.md) |
| `usaha.html` | — analisis usaha tani: RAB dan titik impas, dinyatakan sebagai **rasio** terhadap harga eceran | D3 pada [`docs/15`](../docs/15-kapabilitas-lintas-pemangku.md) |
| `ukur.html` | — instrumentasi: apa yang tercatat di peranti ini, dan apa yang tidak | [`docs/11-instrumentasi.md`](../docs/11-instrumentasi.md) |

`beranda.html` tidak punya perender rincian sama sekali. Ia mencari, lalu menautkan
ke jalur yang memang perendernya — produk dan **bahan aktif** ke jalur 2, varietas ke
jalur 4, **gejala** ke jalur 1 — lewat `?id=…&pecahan=…` atau `?opt=…` yang dibaca
`tautanMasuk()` di `pustaka.js`. Menyalin layar rinciannya ke pintu depan berarti dua
layar yang sama akan menyimpang diam-diam begitu salah satunya diperbaiki.

Satu kotak menjawab tiga macam pertanyaan sekaligus, karena yang mengetik "Abamektin"
tidak tahu — dan tidak perlu tahu — bahwa yang diketiknya bahan dan bukan merek.
Bahan aktif ikut ke ember `cari/` yang sama dengan nama, jadi keduanya datang dalam
satu pengambilan; gejala punya kepalanya sendiri (`gejala-cari.json`, 3,1 KB) karena
"daun mengeriting ke atas" bukan awalan sebuah nama dan tidak bisa diember begitu.

`batas.js` juga perender bersama, dan satu-satunya yang dipakai **seluruh** layar:
ia menggambar blok batas jawaban di kaki tiap halaman — tingkat bukti, tanggal, sumber,
dan apa yang tidak diketahui. Aturannya di bawah, pada bagiannya sendiri. Gayanya
tinggal di `batas.css` terpisah karena `gaya.css` dan `beranda.css` memakai nama token
yang berbeda; satu berkas memetakan keduanya, alih-alih dua salinan aturan yang sama.

`tema.js` dipakai seluruh halaman juga — putaran tema, ikon, dan labelnya.

`gambar.js` perender bersama yang ketiga: blok gambar kemasan di layar rincian produk,
beserta formulir usul gambar. Dua keadaan yang keduanya harus berbunyi — 427 dari 14.920
produk punya gambar, jadi yang **lazim** adalah tidak ada, dan slot kosong yang diam
terbaca sebagai "produk ini meragukan". Placeholder-nya karena itu bertulisan, bukan
kotak abu-abu.

`namaPemegang()` di `pustaka.js` menautkan nama badan ke profilnya, dan ia dipakai di
enam tempat: rincian produk, tabel setara, tabel merek per kadar, kartu varietas, kartu
hasil pencarian, dan daftar di halaman profil sendiri. Aturannya satu dan mudah menyimpang
kalau disalin: **namanya selalu tampil, tautannya hanya kalau badan itu ada di kosakata.**
576 varietas dipegang pemulia perorangan dan mereka sengaja tidak punya halaman profil —
halaman bernama tentang orang adalah pemrosesan data pribadi tanpa dasar.

`bahan.js` dan `varietas.js` sama-sama perender bersama, bukan halaman. Kartu
bahan+kadar di jalur 2 memakai kelas dan perilaku buka-tutup yang persis sama dengan
kartu bahan jalur 1: keduanya menyatakan hal yang sama, dan memberinya dua rupa
membuat orang mengira keduanya dua hal yang berbeda.

`varietas.js` dipakai keduanya. Layar varietas muncul di jalur 4 lewat pintunya
sendiri, dan di jalur 2 kalau yang dicari ternyata varietas — satu perender, dua
pintu, supaya keduanya tidak menyimpang diam-diam.

## Menjalankan

Indeksnya turunan dan sengaja tidak disimpan di repositori, jadi bangun dulu:

```bash
node spec/tools/bangun-indeks.mjs --tulis
```

Tiga lapis yang dibaca pembangun indeks datang dari alatnya sendiri, dan **semuanya
opsional** — indeks tetap terbangun tanpa mereka, hanya bagian yang datanya belum ada
yang hilang, dan `meta.json` menyebutkannya. Urutannya:

```bash
node spec/tools/bangun-principal.mjs --tulis        # 3.136 badan pemegang pendaftaran
node harga_data/tarik-sp2kp.mjs                     # satu permintaan ke SP2KP, ±56 MB
node harga_data/tarik-tbs-kalbar.mjs                # penetapan TBS Kalbar — jendela bergulir,
                                                    # jalankan tiap bulan supaya arsipnya menumpuk
node harga_data/tarik-tbs-riau.mjs                  # penetapan TBS Riau — dua seri, termasuk
                                                    # satu-satunya harga pekebun SWADAYA di Indonesia
node harga_data/tarik-tbs-kalteng.mjs               # penetapan TBS Kalteng — arsip terdalam, 2021→
node harga_data/tarik-tbs-aceh.mjs                  # penetapan TBS Aceh — dua kelas pekebun, dua
                                                    # wilayah; arsipnya utuh dalam satu permintaan
swiftc -O harga_data/ocr-vision.swift \
  -o harga_data/bin/ocr-vision                      # OCR Vision.framework — hanya macOS
node harga_data/tarik-tbs-kaltim.mjs                # SK Kaltim lewat OCR — membawa RENDEMEN per umur
node harga_data/tarik-tbs-babel.mjs                 # selebaran Babel lewat OCR — arsip tipis, bergulir
node spec/tools/bangun-harga.mjs --tulis            # 88 varian, 43 di antaranya berangka
node spec/tools/bangun-komentar-harga.mjs --tulis   # komentar per seri; jalan tanpa kredensial
node gambar_produk/terbitkan.mjs --tulis            # salin gambar kemasan ke app/gambar/
```

`bangun-komentar-harga.mjs` memanggil model bahasa bila ada kredensial Anthropic, dan
menyusun narasi dari aturan bila tidak. Keduanya ditandai berbeda di keluarannya
(`sumber: "model"` atau `"terhitung"`) dan tidak pernah tertukar.

Lalu sajikan **dari akar repositori** — halaman ini membaca `../spec/indeks/`, jadi
menyajikan `app/` saja tidak cukup:

```bash
python3 -m http.server 8742
```

Buka `http://localhost:8742/app/beranda.html`. Konfigurasi `open-protocols` di
`.claude/launch.json` sudah melakukan persis itu, dengan `autoPort` supaya tidak
bertabrakan dengan sesi lain yang memakai repositori sama.

## Yang menentukan bentuknya

Syarat lapangan: HP entry-level, sinyal buruk. Satu penelusuran utuh, terukur di
peramban — hanya pengambilan ke `spec/indeks/`, ukuran sebelum gzip.

**Tiap baris menyebut jalan masuknya**, jadi angkanya bisa diulang. Versi tabel
sebelumnya tidak menyebutkannya, dan begitu indeksnya tumbuh tidak ada cara memeriksa
apakah selisihnya datang dari data atau dari kueri yang berbeda. Diukur ulang seluruhnya
23 Agustus 2026.

| Jalur | Jalan masuk | Berkas | Sebelum gzip | Berkas terbesar |
|---|---|---|---|---|
| beranda · muat + satu pencarian | ketik `phonska` | 3 | 30,3 KB | 14,0 KB — `cari/ph.json` |
| 1 · gejala → bahan | `?opt=op:pst:00000001`, buka komoditas lalu kartu bahan | 5 | 128,7 KB | 38,8 KB — `opt/…-merek-00.json` |
| 2 · bahan aktif → satu kartu kadar | ketik `abamektin`, buka kartu kadar | 3 | 45,6 KB | 20,4 KB — `bahan/000.json` |
| 2 · produk biasa | `?id=op:prd:00001001&pecahan=produk/000` | 3 | 106,0 KB | 47,4 KB — `produk/000.json` |
| 2 · produk berlarangan | `?id=op:prd:00001035&pecahan=produk/000` | 4 | 135,3 KB | 47,4 KB — `produk/000.json` |
| 3 · pupuk | ketik `phonska`, buka hasil pertama | 4 | 83,5 KB | 48,0 KB — `produk/123.json` |
| 4 · varietas | `?id=op:vty:00001000&pecahan=varietas/000` | 3 | 64,8 KB | 47,7 KB — `varietas/000.json` |
| 5 · resep | buka fungsi pertama lalu resepnya | 3 | 25,5 KB | 13,2 KB — `meta.json` |
| 6 · resep | buka fungsi pertama lalu resepnya | 3 | 24,6 KB | 13,2 KB — `meta.json` |

Tidak satu pun berkas melewati 48 KB. Itu bukan kebetulan: anggaran itu ditegakkan
`spec/tools/bangun-indeks.mjs` saat memecah indeksnya.

`meta.json` (13,2 KB) kini diambil **setiap** jalur, karena batas jawabannya dibaca dari
sana. Pada jalur 5 dan 6 ia bahkan berkas terbesar di seluruh penelusuran — batasnya
lebih berat daripada resep yang dibatasinya. Itu ditanggung dengan sengaja: kedua jalur
itu justru yang paling tidak boleh tampil tanpa menyebut tingkat buktinya, dan menaruh
batas jawaban di berkas terpisah akan menambah satu perjalanan pulang-pergi pada tujuh
jalur untuk menghemat satu pada tiga.

### Angka di atas muatan pertama; yang kedua hampir gratis

Tabel itu mengukur **muatan dingin**. Sejak 23 Agustus 2026 muatan berikutnya jauh lebih
murah, dan yang membuatnya murah bukan penghematan byte melainkan hilangnya pertanyaan.

`bangun-indeks.mjs` menerbitkan `meta.cap` — hash atas seluruh pecahan — dan `ambil()`
menempelkannya ke tiap URL sebagai `?v=`. Isi berubah, cap berubah, URL berubah, dan
salinan lama tidak akan pernah terpakai lagi. Karena basi jadi mustahil, pecahannya tidak
perlu ditanyakan lagi.

Terukur pada muatan kedua jalur 4:

| Berkas | Dikirim | Dipakai |
|---|---|---|
| `meta.json` | 300 B — satu permintaan bersyarat | 13,5 KB |
| `varietas/000.json?v=…` | **0 B — tanpa jaringan** | 48,8 KB |
| `cari/el.json?v=…` | **0 B — tanpa jaringan** | 4,0 KB |

Sebelumnya ketiganya sama-sama dibayar satu perjalanan pulang-pergi. Sekarang tinggal satu
— untuk `meta.json` sendiri, satu-satunya berkas yang namanya tidak boleh ikut berubah
karena dialah yang menyebutkan capnya.

Sifat pengamannya diuji terpisah, karena itu yang paling menentukan: URL bercap sama
dijawab dari cache tanpa jaringan (0 B), URL bercap berbeda menembus cache dan mengunduh
penuh (49 KB). Membangun ulang sumber yang sama menghasilkan cap yang sama, jadi
pembangunan ulang yang tidak mengubah apa pun tidak membuang cache pembaca sama sekali.

> **Yang masih bisa dikerjakan, dan bukan oleh kode ini.** Berapa lama salinan bercap
> disimpan tetap urusan yang menyajikan. Repositori ini belum punya host — `python3 -m
> http.server` tidak mengirim `Cache-Control` sama sekali, jadi yang bekerja di atas
> perkiraan peramban. Begitu hostnya dipilih, pecahan bercap sebaiknya disajikan
> `Cache-Control: public, max-age=31536000, immutable`, dan `meta.json` dengan
> `no-cache`. Itu mengubah "biasanya tidak bertanya" jadi "tidak pernah bertanya".
> Sebelum ada cap, tidak satu pun dari keduanya aman dipasang.

`larangan.json` (27,6 KB) hanya diambil kalau produk yang dibuka memang memuat bahan
berlarangan — pada sebagian besar produk ia tidak pernah diambil sama sekali.

## Yang dinyatakan di layar, bukan disembunyikan

- **Urutan merek** memakai nomor pendaftaran menaik, dan aturannya tertulis di layar.
  Tanpa peringkat, tanpa slot berbayar — secara struktural, bukan secara kebijakan.
- **Larangan selalu berlingkup.** Layar tidak pernah menulis "dilarang" telanjang; ia
  menyebut untuk apa (rumah tangga, tanaman padi) beserta pasalnya, lalu berhenti —
  menyimpulkan legal atau ilegal bukan wewenang platform ini.
- **Cakupan kesetaraan** disebutkan: seluruh registri, bukan hanya yang terdaftar
  untuk tanaman yang sama.
- **Isi sama bukan berarti dosis sama.** Dosis milik pendaftaran tiap produk.
- **Nama dagang belum terpetakan.** Nama yang tidak ketemu bukan bukti produknya
  tidak terdaftar, dan layar mengatakannya.

### Batas jawaban — komponen, bukan kebiasaan

**B1** pada [`docs/15-kapabilitas-lintas-pemangku.md`](../docs/15-kapabilitas-lintas-pemangku.md):
tiap layar menyebut **tingkat bukti, tanggal, sumber, dan apa yang tidak diketahuinya**.
Budayanya sudah ada sejak layar pertama — tiap halaman menulis batasnya sendiri dalam
prosa — dan justru itu masalahnya. Prosa yang ditulis ulang tiap layar bisa melewatkan
satu medan tanpa ada yang menyadarinya, dan layar kedelapan akan melewatkan medan yang
berbeda dari layar ketiga. Yang dibakukan `batas.js` keempat medannya; prosa
`<details class="batas">` tetap milik tiap layar, karena "apa yang tidak ditampilkan dan
kenapa" memang berbeda di tiap jalur.

- **Tingkat bukti memakai kosakata yang sudah ada.** `EvidenceTier` di
  `spec/schema/common.schema.json` — A uji multi-lokasi, B standar institusi resmi,
  C konsensus praktisi & penyuluh, D pengalaman tunggal belum terverifikasi. Arti tiap
  huruf ikut ke layar: "B" telanjang tidak mengatakan apa pun kepada yang belum pernah
  membaca skemanya, dan justru dia yang paling perlu membacanya.
- **Tingkat bukti tanpa alasan ditolak.** Aturan itu sudah dinyatakan
  `preparation.schema.json` untuk data; `batas.js` memberlakukannya untuk layar. Sumber
  tanpa `alasan` menggambar blok merah, bukan blok kosong.
- **Yang belum ditetapkan wajib mengatakan kenapa.** Kurasi gejala OPT tampil dengan
  lencana bergaris putus dan tingkat **belum ditetapkan** — bukan C. Menandainya C berarti
  mengklaim konsensus penyuluh yang belum pernah diminta kepada seorang penyuluh pun; daftar
  tinjauannya sudah siap di [`docs/14-tinjauan-gejala.md`](../docs/14-tinjauan-gejala.md)
  dan menunggu peninjau. Di jalur 1 lencana itu berdiri tepat di atas lencana **B** milik
  registri pestisida, dan perbedaan keduanya adalah isi terpenting layar itu: meratakan
  keduanya jadi satu "sumber: Kementan" meminjamkan wibawa registri kepada kurasi yang
  belum punya.
- **Tingkat yang berbeda per rekaman tidak diratakan jadi satu.** Resep sediaan membawa
  `evidence_tier` masing-masing, jadi jalur 5 dan 6 menyebut sebarannya — B 3, C 5, D 4 —
  bukan satu huruf untuk seluruh halaman, yang akan menaikkan yang D atau menurunkan yang B.
- **Tanggal tarikan dan tanggal tinjauan dua hal berbeda.** Salinan boleh baru ditarik dan
  tetap sudah lewat jatuh tempo tinjauannya, jadi keduanya tampil berdampingan.
- **Medan `retrieved` harus ditambahkan lebih dulu.** Sebelum B1, tanggal tarikan hanya
  hidup sebagai prosa di dalam `locator` (*"ditarik 19 Agustus 2026"*) dan tidak terbaca
  mesin — itu yang menghalangi layar menyebutkannya, bukan kelalaian penyaji. `SourceRef`
  di `common.schema.json` kini punya medannya, dan ketiga berkas koleksi mengisinya.
- **Angka yang bukan dari indeks tetap dinyatakan sebagai sumber.** HET pupuk bersubsidi
  datang dari Perpres 6/2025 dan Permentan 15/2025, bukan dari registri — yang tidak
  menandai status subsidi pada satu pun dari 7.196 pupuknya. Jalur 3 menyebutnya sebagai
  sumber kedua yang berdiri sendiri; memaksanya masuk indeks berarti berpura-pura registri
  memuatnya.
- **Layar yang melewatkan satu medan gagal terlihat.** Kunci sumber yang tidak ada,
  tingkat di luar A–D, tanggal yang hilang, atau daftar "yang tidak diketahui" yang kosong
  semuanya menggambar blok merah di layar dan menulis ke konsol. Halaman yang tampak beres
  sambil diam-diam menjanjikan lebih dari yang bisa ditanggung datanya adalah persis
  kegagalan yang komponen ini dibangun untuk mencegah.
- **`ukur.html` sengaja tidak ikut.** Ia tidak menjawab dari data mana pun — subjeknya
  hitungan di peranti pembaca sendiri, dan keempat medannya akan kosong artinya. Memberinya
  blok batas berarti mengambil `meta.json` 13,2 KB pada satu-satunya halaman yang seluruh
  isinya adalah "tidak ada yang dikirim ke mana pun".

### Keadaan tinjauan di blok batas — G1

Satu baris, dan hari ini isinya nol: **belum seorang pun menempelkan namanya pada satu
rekaman pun** — 0 dari 4.256 rekaman kosakata kurasi punya peninjau bernama, dan tidak
satu pun berstatus `published`.

- **Nol ditulis sebagai kalimat, bukan sebagai angka di tabel.** "0" terbaca sebagai kolom
  yang belum diisi; yang perlu dibaca pembacanya adalah bahwa belum ada yang memeriksa
  isinya. Begitu angkanya berhenti nol, baris yang sama menyebut siapa.
- **Tidak diberi warna peringatan.** "Belum ditinjau" keterangan jujur tentang umur korpus,
  bukan cacat — keputusan yang sama dengan huruf tingkat bukti di atasnya, yang juga tidak
  diberi merah.
- **Cakupannya dinyatakan, tidak dikarang.** Yang dihitung seluruh kosakata kurasi, bukan
  rekaman yang kebetulan tampil di layar itu; mengukur per layar menuntut memetakan tiap
  pecahan indeks kembali ke rekaman asalnya, dan angka yang dikarang lebih buruk daripada
  angka yang cakupannya disebutkan.
- **Ia ada di blok batas karena memang salah satu batasnya.** Siapa yang sudah memeriksa
  isi ini, dan kalau belum ada — itu bagian dari apa yang tidak diketahui layar.

Sisi repositorinya ada di [CONTRIBUTING.md](../CONTRIBUTING.md): aturan **L35**, sematan
`lifecycle.reviewed_hash`, dan `spec/tools/tinjau.mjs`.

### Rencana musim dari protokol — E1

Baris E1 berbunyi *"penyusun selesai; permukaan belum"*, dan itu tepat: `susun-rencana.mjs`
sudah menyusun rencana sejak lama, tetapi keluarannya hanya bisa dilihat orang yang
menjalankan Node di terminal. Permukaan juga tidak bisa dibangun di atas berkas yang tidak
pernah terbit ke indeks — jadi protokolnya diterbitkan lebih dulu, pola yang sama seperti
BPP dan lab sebelum C7.

**Yang paling mudah dirusak layar: menyebutnya kalender.** Timing punya lima bentuk dan
hanya `relative` yang bisa jadi tanggal. Dari empat langkah protokol yang ada, **dua** bisa
ditanggalkan — dan angka itu jadi **judul kartunya**, bukan catatan kaki:

```
Jadwal — 2 dari 4 langkah bisa ditanggalkan
  3 Juli 2026       Mulai mengomposkan, 60 hari sebelum pindah tanam   (tenggang 7 hari)
  18 Agustus 2026   Pemupukan dasar organik sebelum tanam
  menunggu fase     Pemupukan susulan saat kuncup bunga pertama
  bila ambang       Pengendalian trips setelah ambang terlampaui
```

- **"Menunggu fase" berdiri di kolom tanggal**, bukan di bawahnya. Daftar yang
  menyembunyikan ketiadaan tanggal di catatan kaki tetap terbaca sebagai kalender. Yang
  bertanggal diberi warna aksen dan yang tidak, tidak — bedanya terlihat sebelum dibaca,
  karena itu satu-satunya perbedaan yang menentukan apakah baris itu bisa dimasukkan ke
  kalender orang.
- **Tanggal fase tidak ditebak.** Entitas fase tidak memuat hari, durasi, maupun akumulasi
  suhu; "BBCH 51 kira-kira hari ke-45" adalah fenologi yang dikarang. Justru penjadwalan
  berbasis fase dipilih **karena** hari setelah tanam sering meleset saat musim mundur atau
  varietas lebih genjah — menanggalkannya membatalkan alasan ia dipakai.
- **Langkah berambang boleh tidak pernah berjalan**, dan barisnya mengatakannya: *"itu hasil
  yang benar, bukan kepatuhan yang gagal"*.
- **Yang tidak bisa dijumlahkan disebut beserta sebabnya.** Abamektin berbasis
  `per_volume_water`, dan menjumlahkannya butuh tahu berapa kali disemprot semusim —
  protokol tidak menyebutnya, dan menebaknya berarti mengarang jumlah yang akan dibeli
  orang.
- **Cacah 1 disebut.** Daftar pilihan berisi satu protokol tanpa keterangan terbaca sebagai
  "yang lain menyusul"; yang perlu dibaca justru bahwa memang baru ada satu, berstatus
  draft dan tingkat bukti D.

**Risiko yang dinyatakan, bukan disembunyikan: ini salinan kedua aritmetika yang sama.**
Penyusun berjalan di Node atas `spec/vocab/`, permukaan di peramban atas `spec/indeks/`,
jadi pemisahannya tidak terhindarkan — dan dua salinan akan menyimpang begitu salah satunya
diperbaiki. Yang menahannya uji: keluaran keduanya dibandingkan untuk masukan yang sama
(pindah tanam 2026-09-01, luas 0,28 ha) dan **identik** sampai ke tanggal, cacah, dan
ketiga angka kebutuhan input.

### Kosakata sebab kegagalan siklus — 15 sebab, 3 di antaranya dijamin

`Cycle.failure_reason` ada di skema sejak lama dan menunjuk `Ref` yang **tidak punya
tujuan**: kosakatanya tidak pernah dibuat, sehingga sepuluh musim yang gagal karena
sepuluh sebab berbeda tersimpan sama. `L38` karena itu menyebutnya peringatan, bukan
kegagalan — menuntut rujukan ke sesuatu yang tidak bisa dirujuk siapa pun bukan tuntutan
yang adil.

**Tiga dari lima belas entri berpadanan tepat dengan risiko yang dijamin polis AUTP**, dan
itu diambil dari sumber primernya — Pedoman Bantuan Premi AUTP TA 2022, Ditjen PSP
Kementan. Polis mengenal **tiga** risiko dan hanya tiga: banjir (termasuk rob), kekeringan,
dan serangan OPT; hanya pada padi; hanya bila intensitas kerusakan mencapai **≥75%
dan/atau luas kerusakan ≥75%** pada tiap petak alami. Daftar OPT-nya bahkan tertutup — enam
hama dan tujuh penyakit disebut satu per satu.

**Daftarnya sengaja tidak dibentuk mengikuti daftar risiko penanggung.** Yang paling sering
menghabiskan musim petani kecil justru ada di dua belas sisanya:

| sebab | dijamin AUTP? | sinyalnya |
|---|---|---|
| banjir, kekeringan, serangan OPT | **ya** | guncangan luar / perlindungan tanaman |
| giliran air irigasi tidak datang | tidak | **tata kelola air** |
| modal habis di tengah musim | tidak | akses |
| harga jatuh di bawah ongkos panen | tidak | pasar |
| benih gagal tumbuh | tidak | mutu sarana |
| lahan tidak lagi bisa digarap | tidak | penguasaan lahan |
| angin, kebakaran, abu vulkanik | tidak | guncangan luar |
| wabah penyakit ikan/ternak, mutu air kolam | tidak | perlindungan / tata kelola air |
| tenaga kerja tidak ada | tidak | akses |

- **`giliran-air-tidak-datang` dipisahkan dari `kekeringan`, dan itu keputusan yang paling
  menentukan di seluruh berkas ini.** Kekeringan adalah air yang memang tidak ada; giliran
  yang tidak datang adalah keputusan atau kelalaian yang punya alamatnya. Menggabungkan
  keduanya membuat kegagalan tata kelola air terbaca sebagai cuaca — dan cuaca tidak bisa
  ditagih siapa pun.
- **Medan `autp` ada supaya jaraknya terlihat**, bukan supaya kosakatanya dibentuk
  mengikuti selera risiko penanggung. Layar menyebutnya saat sebabnya dipilih: *"Sebab ini
  tidak dijamin polis Asuransi Usahatani Padi."*
- **Daftar OPT tidak disalin jadi entri terpisah.** Yang dijawab kosakata ini sebab
  berakhirnya siklus, bukan identitas OPT — dan identitas OPT sudah punya kosakatanya
  sendiri.
- **`L38` diperketat** sejak kosakatanya ada: `failed` tanpa `failure_reason` kini
  kegagalan, ditambah dua pemeriksaan — sebab yang menunjuk ke luar ruang `op:cfr:`, dan
  sebab yang menunjuk entri yang tidak ada. Yang dijaga bukan kelengkapan borang: **musim
  yang gagal tanpa sebab tercatat tidak bisa dijumlahkan dengan musim gagal mana pun**, dan
  penjumlahan itulah yang membedakan "petani ini sial" dari "giliran air di daerah ini
  tidak pernah turun".
- **Di layar, sebab hanya diminta saat musimnya memang gagal atau ditinggalkan** — disiplin
  yang sama dengan alasan simpangan. Meminta sebab pada tiap penutupan cuma melatih orang
  memilih pilihan pertama sampai medannya kehilangan arti.

### Penanda panen — dan angka yang tidak diukur sumber terbuka mana pun

Lubang ini disebut namanya di blok batas D3: *"kapan rencana boleh dianggap tertutup"*
tidak punya jawaban, dan karena itu tidak ada layar yang boleh membandingkan hasil dengan
perkiraannya. **Yang menahan ternyata bukan skema.** `Cycle.status` sudah berenum enam
sampai `closed`, `Cycle.actual_end` sudah bertanggal, dan `Step.outputs` sudah membawa
kuantitas beserta kelas mutunya. Ketiganya ada sejak lama dan tidak satu pun pernah sampai
ke permukaan.

- **Panen itu daftar, bukan tanggal.** Kosakata operasi sudah memisahkan `panen` dari
  `panen-bertahap`, dan yang kedua itulah keadaan biasa pada cabai, tomat, dan cabai
  rawit: dipetik berulang selama berminggu-minggu. Satu medan "tanggal panen" akan memaksa
  orang memilih petikan mana yang dianggap panen, dan menjumlahkan sisanya dalam ingatan.
- **Uangnya lewat buku kas, bukan medan kedua.** Kalau panen menyimpan rupiahnya sendiri,
  ia jadi gagasan pemasukan yang kedua — dan dua gagasan pemasukan yang menjumlahkan hal
  yang sama adalah cara termudah membuat total yang tidak pernah cocok.
- **Menutup musim adalah peristiwa, bukan medan yang diisi**, dan letaknya di bawah daftar
  panen — bukan di kartu musim di kepala halaman, yang dibuka orang untuk *mengganti*
  musim, bukan untuk mengakhirinya. Membuka lagi tetap disediakan, dan tanggalnya ikut
  dicabut.

**Angka yang jadi seluruh alasan ini dibangun.** Halaman analisis usaha tani dibangun di
sekitar satu penolakan: harga eceran bukan harga yang diterima petani, dan bahkan "harga
produsen" resmi bukan — respondennya pengumpul dan penggilingan, di Karawang satu orang.
Tetapi **ada satu orang yang memegang angkanya, dan ia yang sedang membuka layar itu**:

> harga yang benar-benar diterima = uang yang benar-benar masuk ÷ kilogram yang
> benar-benar dipanen

Keduanya catatannya sendiri — yang satu di buku kas, yang satu di penanda panen. Tidak ada
sumber terbuka yang perlu diminta dan tidak ada yang dikarang. Dua penahan tetap
dinyatakan di layar: sebelum musim ditutup ia disebut *"sejauh ini"* karena panen yang
belum terjual menariknya ke bawah, dan ia **tidak** ditaruh bersebelahan dengan harga
eceran, karena selisih keduanya bukan kerugian siapa pun.

**Pemeriksa ikut, sebagai `L38`.** Skema memuat seluruh bahannya tetapi tidak mengikat yang
satu ke yang lain: siklus berstatus `closed` tanpa `actual_end` lolos validasi, dan siklus
semacam itu tidak bisa ditaruh di musim mana pun. Arah sebaliknya lebih halus — `actual_end`
terisi sementara status masih `active` terbaca sebagai musim berjalan oleh yang membaca
status dan musim berakhir oleh yang membaca tanggal, **dan yang membaca tanggal biasanya
mesin**. Aturan ketiga menangkap tanggal berakhir yang mendahului tanggal mulai.

Satu hal sengaja dibuat **peringatan, bukan kegagalan**: siklus berstatus `failed` tanpa
`failure_reason`. Alasannya bukan di rekamannya melainkan di kosakatanya — medan itu
menunjuk `Ref`, dan **kosakata alasan kegagalan siklus belum pernah dibuat**, tidak ada
satu pun berkas untuknya. Menuntut rujukan ke sesuatu yang tidak bisa dirujuk siapa pun
bukan tuntutan yang adil, jadi yang dilakukan menyebutkan kekosongannya.

Cacat lama yang ikut terangkat karena muncul untuk ketiga kalinya: keterangan `.sub` di
dalam `dd` tidak pernah punya barisnya sendiri, jadi ia menempel ke angkanya
(*"1.420 kg/hadari 0,25 ha"*). Kedelapan pemakaiannya di seluruh app memaksudkan hal yang
sama, jadi aturannya kini **tanpa skop kartu**.

### D3 ikut ke rekaman musim — dan rencana berdiri di sebelah realisasinya

Layar analisis usaha tani pemakai **ketiga** kata "musim", dan satu-satunya yang belum
ikut. Sampai sekarang ia meminta luas dari nol setiap kali dibuka, dan rencana anggaran
yang disusun di sana lenyap begitu tabnya ditutup.

**Menyimpannya justru yang membuat sambungannya berguna.** Rencana anggaran disusun
*sebelum* menanam; buku kas terisi *selama* musim berjalan. Yang menarik terjadi di antara
keduanya — "sudah keluar berapa dari yang direncanakan, di kategori mana" — dan itu hanya
bisa ditanyakan kalau rencananya masih ada waktu realisasinya mulai masuk. Rencana yang
hilang tiap kali tab ditutup membuat perbandingan itu menuntut mengetik ulang seluruh RAB,
yang berarti ia tidak akan pernah dilakukan.

| | dari mana |
|---|---|
| luas | **rekaman musim**, dan ia yang menang atas salinan lokal — kalau layar lain mengubahnya, yang benar yang di rekaman bersama |
| baris biaya, perkiraan hasil | RAB tersimpan per musim (`op:rab`) |
| komoditas | RAB; kalau kosong, dicocokkan longgar dari nama komoditas di rekaman musim |
| kolom "sudah keluar" | buku kas musim itu, per kategori |

- **Titik impas TIDAK dihitung ulang dari biaya yang sudah keluar**, dan itu penahan yang
  sengaja. Di tengah musim biaya yang sudah keluar selalu lebih kecil daripada rencananya,
  jadi titik impas dari angka itu selalu tampak lebih baik — kabar bagus yang seluruhnya
  berasal dari musim yang belum selesai. Yang ditayangkan selisih per kategori, bukan
  kesimpulan baru.
- **Kategori yang tidak ada di RAB sama sekali diberi tanda tersendiri**, bukan angka nol.
  Itu temuan tentang rencananya — dan halaman ini sudah menyatakan sejak awal bahwa daftar
  yang tidak lengkap menghasilkan titik impas yang terlalu rendah.
- **Melampaui rencana diberi warna awas, bukan merah gagal.** Sebagian besar musim
  melampaui sesuatu, dan yang dilampaui kerap rencananya yang meleset.
- **Luas disimpan hektare, diminta meter persegi, konversinya tercetak.** Rekaman musim
  memakai hektare karena itu satuan tiap program yang meminta angka biaya usaha tani; layar
  ini meminta m² karena itu satuan yang dipakai orang menyebut petaknya sendiri ("dua ribu
  meter"). Yang diseragamkan penyimpanannya, bukan pertanyaannya.
- **Daftar kategorinya berhenti disalin.** Ia memang sudah sama persis dengan buku kas
  sejak awal — disengaja — tetapi dua salinan yang kebetulan sama tidak bertahan sama, dan
  begitu berselisih rencana per kategori tidak bisa lagi disandingkan dengan realisasinya.
- **Tabel perbandingannya melipat jadi blok di bawah 560 px.** Empat lajur rupiah tidak
  muat di 375 px, dan yang jatuh ke luar layar justru "sudah keluar" dan "sisa" — dua lajur
  yang jadi seluruh alasan kartu itu ada. Yang harus ditemukan dengan menggulir ke samping
  sama saja dengan yang tidak ada.

Dua lubang baru disebut di blok batasnya: **kapan rencana boleh dianggap tertutup** (butuh
penanda panen yang belum ada di permukaan mana pun), dan **hasil panen sebenarnya
dibandingkan perkiraannya** — perkiraan di sini kilogram, buku kas mencatat rupiah, dan
menjembatani keduanya dengan harga eceran menghasilkan angka yang tampak tepat dan salah.

### Musim dan petak bersama — E2 disambungkan ke buku kas dan ke petak

Tiga layar memakai kata "musim", dan sebelum ini **tidak satu pun di antaranya bertemu**.
Buku kas menyimpan musim bernama dengan luas di kepalanya, layar rencana memakai kunci
`protokol|tanggal-tanam` yang tidak pernah dilihat siapa pun, dan analisis usaha tani
meminta luas lagi dari nol. Yang paling merugikan bukan pengetikan ulangnya: tanpa
identitas bersama, biaya yang dicatat di buku kas **tidak bisa ditaruh di sebelah langkah
yang menimbulkannya**, dan skema sudah menyatakan itu keliru sejak lama — `Step.cycle`
**wajib**, dan `Cycle.plot` menunjuk petak. Realisasi tanpa siklus bukan Step yang kurang
lengkap; ia bukan Step.

Sekarang satu rekaman, di `musim.js`, dipakai kedua layar: nama musim, **nama petak**,
jenis petak (`Plot.kind`), komoditas, luas, tanggal tanam, protokol. Petak dinamai
terpisah dari musim karena petak hidup lebih lama — petak yang sama ditanami dua kali
setahun, dan yang mau tahu apakah musim ini lebih mahal daripada musim lalu **di petak
yang sama** perlu keduanya bisa dibedakan.

- **Biaya mengalir dari langkah ke buku.** Mencatat "pemupukan susulan sudah dikerjakan"
  bisa sekalian mencatat biayanya, dan catatannya masuk ke buku kas musim itu — bertanda
  *"dari layar rencana"*, supaya tidak terbaca seolah ada yang mengetiknya dua kali.
  Kategorinya **diusulkan** dari kunci jenis operasinya (`pemupukan-dasar` → Pupuk,
  `aplikasi-pestisida` → Pestisida) dan tetap bisa diganti: satu langkah bisa berbiaya
  bahan pada satu petani dan berbiaya upah borongan pada petani lain.
- **Satu langkah, paling banyak satu catatan biaya.** Mencatat ulang mencabut yang lama
  lebih dulu, dan membatalkan langkah mencabut biayanya. Penggandaan senyap di buku kas
  lebih buruk daripada angka yang hilang — ia tidak terlihat sampai totalnya dipakai.
- **Tindakan di luar rencana juga boleh berbiaya**, dengan tautan yang sama.

**Cacat yang ditemukan sendiri saat menguji, dan bentuknya perlu dicatat.** Pemindahan
bentuk simpanan lama semula ditaruh di dua berkas — musim di satu, catatan di lain — dan
itu **menghilangkan data** pada bentuk paling lama. Urutannya yang menentukan: modul
dievaluasi menurut urutan impornya, jadi di satu layar penyimpan catatan jalan lebih dulu,
menulis ulang `op:kas` tanpa medan `musim`, dan penyimpan musim kemudian membaca musim
yang sudah tidak ada di sana. Layar yang satunya kebetulan mengimpor dengan urutan
terbalik dan lolos — **cacat yang tergantung urutan baris impor**. Seluruh pemindahan
sekarang dikerjakan satu berkas, dan yang lain mengimpornya supaya dijamin jalan lebih
dulu. Tiga bentuk lama diterima, termasuk bentuk yatim yang cuma bisa lahir dari cacat itu
sendiri.

**Yang tidak dijanjikan, dan disebut di blok batas kedua layar.** Ini **bukan** entitas
`Plot`. Skema mewajibkan empat hal dan dua di antaranya sengaja tidak diminta: `holder`
menunjuk aktor — artinya menyebut nama orang — dan geometri yang cukup baik untuk
disidik. `sidik-petak.mjs` menolak `single_point` karena titik tunggal presisi lima
desimal di dalam satu kabupaten habis ditebak GPU dalam 0,08 detik, jadi sidiknya bukan
penjagaan melainkan penunjuk lokasi yang bisa dibalik. Yang tersisa cukup untuk
**menyambungkan layar satu sama lain**, dan tidak cukup untuk **menyambungkan petani satu
sama lain**. Bedanya besar. `Step.labor` dan `Step.area_covered` juga belum diminta: satu
angka biaya tidak bisa dipecah jadi upah dan bahan sesudahnya, tetapi tiap medan wajib
tambahan adalah alasan berhenti mencatat.

### Pencatatan realisasi — E2, di layar rencana yang sama

Barisnya berbunyi *"skema selesai; permukaan belum"*, dan yang membentuk permukaannya dua
kalimat yang sudah ada di skema itu sendiri:

- **`plan_ref`** — *"Kosong berarti tindakan di luar rencana — **itu juga temuan yang
  berharga**."* Jadi tindakan di luar rencana punya pintunya sendiri, bukan diperlakukan
  sebagai kesalahan pengisian. Daftarnya berbunyi: *tindakan yang berulang di luar rencana
  adalah sinyal tentang protokolnya, bukan tentang yang mengerjakannya.*
- **`recording_lag_note`** — *"Pencatatan mundur beberapa hari itu wajar di lapangan.
  **Jangan disembunyikan** — mutu data ikut dinilai dari sini."* Jaraknya karena itu
  dihitung sendiri dan dicetak: *"dicatat 34 hari sesudahnya"*.

Dan satu dari pemeriksa: **`L8`** menolak realisasi yang berbeda dari rencana tanpa
alasan — *"simpangan tanpa alasan tidak bisa dipakai memperbaiki protokol"*. Di layar itu
berarti alasan diminta **hanya saat memang ada simpangan**: langkah yang dilewati, dan
langkah yang bergeser di luar tenggangnya. Yang tepat waktu tidak diminta apa pun —
memaksanya di sana cuma melatih orang memilih pilihan pertama sampai medannya kehilangan
arti.

- **Formulir sebaris, bukan `prompt()`.** Versi pertama meminta orang memilih satu dari
  sebelas alasan dengan mengetik nomornya di kotak bawaan peramban. Itu interaksi yang
  gagal di ponsel, dan halaman yang di tempat lain menuntut target sentuh 44 px tidak boleh
  menawarkannya di sini.
- **Sebab kenapa alasan diminta ditulis di sebelah medannya:** *"Bergeser 17 hari lebih
  lambat dari rencana (tenggang 7 hari). Simpangan sebesar ini menuntut alasan."* Yang
  diminta memilih alasan berhak tahu apa yang membuatnya diminta.
- **Yang dilewati tidak diberi warna merah.** Melewati langkah dengan alasan bukan
  kegagalan — sebagian alasan justru menunjukkan protokolnya yang salah, dan mewarnainya
  merah menyalahkan yang mencatat.
- **Sebelas alasan simpangan diterbitkan ke indeks** supaya bisa ditawarkan. Alasan yang
  harus diketik bebas akan jadi sebelas ejaan untuk satu hal, yang menghancurkan justru
  gunanya bagi `sinyal.mjs`.
- **Belum tersambung ke buku kas maupun ke identitas petak**, dan itu disebut di blok batas
  alih-alih dibiarkan tampak sudah tersambung.

### Buku kas per petak — E5

`docs/15` semula menduga buku kas sudah ada dalam bentuk apa pun sehingga E5 tinggal
memindahkan bentuknya. Jawaban lapangan membatalkannya: *"kalaupun ada dalam bentuk buku
kertas. Umumnya petani kecil mengandalkan ingatan saja."* Jadi ini **kebiasaan baru**, dan
dokumen itu menutupnya dengan kalimat yang jadi brief halaman ini:

> *Ingin tahu untungnya berapa* tidak sama dengan *mau mencatat*, dan **jarak antara
> keduanya yang harus dirancang**, bukan diasumsikan hilang.

Tiga hal mempersempit jarak itu, dan ketiganya membatasi apa yang boleh dibangun:

- **Jawabannya di atas, bukan di akhir musim.** Yang membuat orang menulis catatan kedua
  adalah melihat hasil catatan pertama, jadi ringkasan diperbarui tiap penambahan — tidak
  ada tombol "hitung".
- **Satu catatan tiga medan.** Tanggal terisi sendiri hari ini, kategori punya bawaan, dan
  hanya **jumlah** yang wajib. Tiap medan wajib tambahan adalah alasan berhenti.
- **Tanpa akun, tanpa masuk, tanpa kirim.** Pendaftaran di depan catatan pertama membunuh
  kebiasaan sebelum ia lahir.

Kategorinya **sama persis dengan D3**, dan itu disengaja: yang sudah menyusun rencana
anggaran di sana tidak memulai dari buku kosong di sini.

**Musim ada di kepala, bukan di tiap catatan** — dan itu yang menjaga "tiga medan" tetap
utuh sambil menjawab pertanyaan yang tidak bisa dijawab tanpanya. Nama musim, komoditas,
dan **luas** diisi sekali; tiap catatan sesudahnya ikut ke sana gratis. Yang dibuka luas:
**biaya per hektare** — dan itu satuan yang dipakai hampir semua program yang meminta
angka biaya usaha tani, termasuk asuransi usaha tani padi yang premi, subsidi, dan ganti
ruginya seluruhnya per hektare. Petani 0,25 ha yang cuma punya angka total tidak bisa
membandingkan dirinya dengan angka mana pun yang diterbitkan. Luas tetap boleh kosong;
yang hilang satu baris, bukan seluruh halamannya.

**Bentuk simpanan berubah, dan yang sudah mencatat tidak kehilangan apa pun.** Larik datar
versi pertama dibungkus jadi satu musim bernama saat dibaca, lalu dituliskan sekali —
diuji dengan data bentuk lama: tiga catatan utuh, aritmetika benar, dan bentuk tersimpannya
ikut berpindah. Kehilangan catatan karena pembaruan aplikasi persis kegagalan yang paling
merusak kepercayaan pada buku kas.

**Bahayanya bukan ruang melainkan ketahanan, dan itu diukur.** Kuota penyimpanan
**4.180 MB** sementara satu musim penuh (200 catatan) cuma **14,5 KB** — ruang tidak pernah
jadi soal. Yang jadi soal: `navigator.storage.persist()` menjawab **`false`** pada kunjungan
biasa. **Peramban menolak menjanjikan catatan ini tidak dihapusnya.**

Petani yang mencatat semusim lalu kehilangannya lebih buruk keadaannya daripada yang
memakai kertas, jadi tiga hal menyusul dari pengukuran itu: keadaan penyimpanan dinyatakan
apa adanya di layar, izin permanen tetap diminta (peluangnya naik kalau aplikasinya dipasang
lewat A5), dan **"bawa keluar" bukan pelengkap** — pengingatnya muncul sendiri tiap sepuluh
catatan, selagi mengetik ulang masih murah.

- **Gagal menyimpan tidak boleh diam.** Mode privat menolak `localStorage`, dan pemakai yang
  mengira catatannya tersimpan padahal tidak adalah keadaan terburuk yang bisa dihasilkan
  halaman ini — lebih buruk daripada tidak menawarkan penyimpanan sama sekali.
- **"Untung" hanya disebut kalau memang ada uang masuk.** Selisih dari nol pemasukan bukan
  rugi; ia biaya yang belum berhasil, dan musim yang belum panen bukan musim yang rugi.
- **Satu tombol perusak, dan ia satu-satunya yang diberi warna bahaya** — di barisnya
  sendiri, jauh dari tombol bawa keluar, dengan konfirmasi yang menyebut tidak ada cadangan.
- **A1 tidak mengambil "untung" dan "rugi" dari D3.** Yang mengetiknya sebelum tanam
  memaksudkan rencana; yang mengetiknya di tengah musim memaksudkan catatan, dan pintu masuk
  tidak bisa membedakannya. Yang diambil hanya kata yang berarti **mencatat**.

### Pintu serah-terima laporan gejala — G3

`docs/15` menulis bahayanya sebelum ada kode, dan bahaya itu yang merancang pintunya:
*"laporan gejala dari warga adalah data mentah; **menyebutnya wabah adalah kesimpulan**.
Peta yang menampilkan titik-titik laporan tanpa verifikasi bisa memicu penyemprotan massal
yang tidak perlu — dan kerugiannya ditanggung petani, sementara yang untung penjual
pestisida."*

Tiga hal karena itu **tidak** dibangun, dan ketiganya keputusan:

- **Tidak ada kotak masuk.** Permukaan tidak menerima laporan — ia menyusun lalu
  menyerahkannya kembali.
- **Tidak ada peta.** Aturan `L37` sudah menolak laporan belum-terverifikasi berkelas
  publik di lapis data, jadi peta itu tidak bisa tersusun bahkan kalau ada yang mencoba
  membuatnya di lapis penyaji.
- **Tidak ada identifikasi.** Yang keluar "dugaan beserta dasarnya", sama seperti medan
  `suspected` di skema — yang memang tidak punya saudara bernama `identified`.

**Dasarnya datang dari blok "pastikan dulu", dan itu yang membedakannya dari tebakan.**
Tiap OPT terkurasi membawa dua ciri pembanding yang bisa diperiksa sendiri. Pintu ini
menanyakan mana yang sudah dicek, dan **yang belum diperiksa ikut tertulis sebagai kalimat
tersendiri** — justru itu yang paling berguna bagi penyuluh yang datang, karena ia tahu apa
yang harus dilihat lebih dulu. Contoh keluarannya:

```
Ciri yang saya periksa sendiri:
· [ciri pertama] — cocok
· [ciri kedua] — belum diperiksa
(1 dari 2 ciri belum saya periksa.)
```

- **Pintunya tidak muncul di jalur `?hama=`**, dan itu penjagaan bukan kelalaian. OPT
  registri tidak punya ciri pembanding sama sekali; laporan yang dugaannya datang dari
  mengetik nama, tanpa satu ciri pun yang bisa dicek, persis tebakan tanpa dasar yang
  ditolak seluruh rancangan ini.
- **Ujungnya nyata sekarang.** Ketik kabupaten → daftar balai penyuluhan di sana → pilih
  yang membina kecamatanmu, dan namanya masuk ke badan laporan. Yang ditawarkan bukan peta
  melainkan pilihan menurut kecamatan, karena balai memang tidak punya alamat — dan yang
  melapor tahu kecamatannya sendiri.
- **Laporan menyatakan apa yang bukan dirinya.** *"Ini pengamatan, bukan kesimpulan, dan
  bukan permintaan penyemprotan"* dicetak di badan laporan, bukan di layar yang ditinggalkan
  saat pesannya dikirim — karena yang membacanya penyuluh, bukan yang menyusunnya.
- **Dua jalan keluar**, keduanya baru berjalan setelah orangnya menekan: WhatsApp, atau
  salin. Terukur 990 aksara, alamat 1.618 — muat.

### Balai penyuluhan dan laboratorium — C7, dua pintu lagi

Empat dari enam layanan yang dijanjikan C7 kini punya data, dan dua yang baru tidak
memakai pintu yang sama seperti toko — **karena pertanyaannya berbeda**.

**Balai ditelusuri menurut tempat.** Yang bertanya sudah tahu kecamatannya; yang ia
perlukan nama balai yang membinanya. 5.844 balai di 504 kabupaten/kota, diember seperti
toko.

- **"Tanpa alamat" di sini tidak sama artinya dengan pada penjual benih.** Nama penjual
  benih tanpa alamat tidak bisa dituju siapa pun. Nama balai beserta kecamatan binaannya
  bisa dituju oleh orang yang tinggal di kecamatan itu — dan dialah yang mencarinya. Yang
  tidak tahu letaknya mesinnya, bukan orangnya. Kecamatan karena itu jadi penanda utama di
  tabel, bukan catatan kaki.
- **Balai yang kecamatannya kosong disebut apa adanya.** 15 dari 5.844, dan barisnya
  berbunyi *"kosong di sumbernya"* — bukan berarti ia tidak membina satu pun.

**Laboratorium disaring menurut kemampuan lebih dulu, baru tempat.** *"Siapa yang bisa
mengukur residu pestisida"* menyaring 889 jadi **17**, dan daftar provinsi tanpa penyaring
itu cuma memindahkan pekerjaan memilah ke pembacanya. Penyaringnya **radio, bukan kotak
centang**: "tanah DAN residu" menghasilkan irisan yang hampir selalu kosong, dan daftar
kosong yang benar lebih membingungkan daripada satu penyaring yang jelas.

- **Masa akreditasi ditandai, dan itu satu-satunya tempat di seluruh permukaan yang
  memakai warna peringatan untuk keadaan data.** Sebabnya sempit: laboratorium yang
  akreditasinya lewat bukan yang "kurang baik", ia yang hasil ujinya **tidak diakui** — dan
  itu tidak terbaca dari namanya. Terukur: **11 dari 889** sudah lewat, dan **satu di
  antaranya termasuk 17 yang bisa mengukur residu**. Artinya penyaring paling sempit di
  halaman ini mengembalikan satu jawaban yang tidak sah, dan tiap ringkasan karena itu
  menyebut berapa yang lewat.
- **Yang tidak ada dan tidak akan ditambal:** tarif, waktu tunggu, dan apakah lab menerima
  sampel dari luar. Tidak satu pun terbit di papan KAN. Yang dijamin akreditasi bukan
  harganya melainkan bahwa metodenya diperiksa.

Blok batas layar ini kini menyebut **empat** sumber dengan tingkatnya masing-masing — dan
menangkap kelalaian saya sendiri saat dibangun: `bppTanpaAlamat` sempat tampil sebagai slug
mentah karena belum punya judul, persis cacat yang dijaga sejak audit.

### Harga yang benar-benar diterima — C4 sisi petani

C4 berbunyi *"eceran dipinjam, harga petani **dibangun**"*, dan sisi petaninya tertulis
sebagai **setoran**. Ia terbelah dua di sini, dan satu separuhnya ditolak.

**Yang ditolak: setorannya.** Bukan cuma karena lapisan gratis tidak mengumpulkan — harga
yang diketik ke formulir terbuka adalah harga yang **paling murah dipalsukan**, dan harga
persis yang paling menguntungkan untuk dipalsukan. Penalaran yang sama membuat G6 menuntut
sumbangan datang sebagai efek samping catatan musim; setoran harga ikut ke sana, di atas
E1–E5, bukan ke lapisan gratis.

**Yang dibangun: separuh yang tidak menuntut satu byte pun berpindah.** Petani sudah tahu
harganya sendiri; yang tidak ia punya **acuannya**. Layar harga menerima angka itu di
perangkat, menghitung jaraknya ke penetapan terakhir, lalu melupakannya.

- **Hanya pada seri tingkat pekebun — 8 dari 96, seluruhnya sawit.** Membandingkan harga
  terima petani dengan seri eceran menghasilkan jurang yang **benar angkanya dan salah
  artinya**: ia margin pemasaran sepanjang rantai, bukan selisih yang ditanggung satu
  pembeli. Bentuk kekeliruan yang sama sudah diukur `docs/16` pada sawit — TBS terhadap CPO
  dunia tampak 7,26× padahal 1,52×, *"dan petani akan menyimpulkan dirinya ditipu tujuh kali
  lipat"*. Seri eceran karena itu menampilkan **penolakan beserta sebabnya**, bukan diam.
- **Cakupan hukum dicetak bersama hasilnya.** Penetapan TBS menaungi pekebun mitra dan
  plasma; pekebun **swadaya berada di luarnya**, dan merekalah mayoritas petani sawit
  Indonesia. Yang swadaya lalu menyimpulkan dirinya dirugikan sedang membandingkan diri ke
  harga yang secara hukum bukan haknya — keterangan yang mengubah kesimpulan, jadi ia tidak
  dipisahkan dari angkanya.
- **Umur acuan ikut.** Penetapan tidak terbit tiap hari; hasilnya menyebut tanggalnya dan
  berapa hari lalu, alasan yang sama yang membuat kartu angka menuliskan jarak sebenarnya
  alih-alih nama jendelanya.
- **Hasilnya tidak diberi warna hijau atau merah.** "Di bawah penetapan" bukan kabar buruk
  yang butuh warna alarm — cakupan hukumnya bisa saja memang tidak menaungi yang membaca,
  dan mewarnainya merah menyimpulkan sesuatu yang datanya tidak menyimpulkan.
- **Angkanya tidak dikirim ke mana pun**, dan layar mengatakannya di badan kartu.

Untuk pangan pokok pembanding ini belum berguna: tidak ada satu pun seri gabah di indeks,
dan HPP Rp6.500/kg hidup sebagai prosa di `docs/16`, bukan sebagai data yang bisa
dibandingkan.

### Kartu yang bisa diteruskan — A2

A2 tertulis "kanal WhatsApp untuk tanya-jawab yang sama", dan sempat saya tandai terhalang
aturan *"lapisan gratis hanya menyebarkan, tidak pernah mengumpulkan"*. **Itu keliru.**
Aturan itu bukan larangan atas A2, melainkan penentu bentuknya — nilai A2 adalah
keterjangkauan, dan keterjangkauan seluruhnya ada di sisi menyebarkan. Yang benar-benar
terhalang cuma kotak masuknya.

Terukur sebelum mulai, dan ukurannya yang menentukan segalanya: di layar rincian produk
jawabannya **884 aksara** dan blok batasnya **2.178** — batasnya dua setengah kali lebih
panjang daripada jawabannya.

- **"Kirim jawaban beserta batasnya" gagal ke dua arah.** Mengirim jawabannya saja mencopot
  batasnya — persis *"PDF dengan tampilan lebih bagus"* yang ditolak `docs/00`. Mengirim
  keduanya menghasilkan pesan 3.000 aksara yang tidak dibaca siapa pun. Yang dikirim karena
  itu bukan salinan layar melainkan **kartu yang disusun**: 630 aksara untuk produk, 1.033
  untuk resep pengendali.
- **Batasnya melekat di badan teks, bukan cuma di tautan.** Yang membuka tautannya orang
  pertama; yang kesepuluh cuma membaca teksnya. Sifat ini datang dari
  [`docs/17`](../docs/17-tiga-konsep-ui.md) bagian 7.3, bersama dua lainnya: **tanggal dan
  status dicetak di kartu** karena kartu yang sudah beredar tidak bisa ditarik, dan
  **bentuknya khas** karena tidak ada yang bisa mencegah orang mengetik ulang kartu palsu.
- **Kartu tanpa `wajib` tidak disusun sama sekali.** Tiap layar menyebut sendiri kalimat
  yang tidak boleh hilang saat kartunya berpindah tangan — untuk resep pengendali itu
  status hukum Pasal 77 dan dasar tenggang panennya, untuk produk terdaftar itu "cocokkan
  nomornya dengan kemasan". Layar yang lupa mendapat blok galat, bukan kartu yang diam-diam
  lebih pendek; aturan yang sama dengan `batas.js`.
- **Tidak pernah dipotong diam-diam.** Pertanyaan ke-5 `docs/17` justru *"apakah kartu yang
  diteruskan bertahan utuh, atau dipotong"*. Yang melewati batas panjang alamat menolak
  jalur WhatsApp beserta sebabnya — karena yang terpotong lebih dulu justru batasnya,
  letaknya di ekor.
- **Sumbernya yang benar, bukan yang pertama disebut layar.** Versi pertama memakai sumber
  pertama dari daftar layar, dan langsung berbohong: kartu PHONSKA — sebuah pupuk —
  mengatributkannya ke "Registri pestisida terdaftar". Kartu kini menyebut sendiri
  registrinya.
- **Token mesin tidak ikut.** `precautionary_default` dan `gloves, long_sleeves`
  menjelaskan sesuatu kepada pembaca skema, bukan kepada orang yang memegang tangki
  semprot. Peta APD dan pemformat angka yang sudah dipakai layar dipakai ulang di kartu —
  `10.000 kg/ha`, bukan `10000 kg/har`.
- **Tidak ada yang terkirim dari halaman ini.** Dua jalan keluar dan keduanya baru berjalan
  setelah orangnya menekan: `wa.me` di tab baru, atau salin. Tidak ada kotak masuk, dan itu
  putusan — bukan kekurangan yang menunggu diperbaiki.

Terpasang di jalur **2** (produk terdaftar), **5**, dan **6** (sediaan). Jalur 1, 3, dan 4
belum — kartunya menuntut keputusan sendiri tentang apa yang wajib ikut di sana.

### Sanggahan terbuka — B3

Repositori dibuka jadi publik 23 Agustus 2026, dan itu syaratnya: B3 menuntut jejak yang
**publik dan bernama**, sementara isu di repositori tertutup menghasilkan jejak yang
bernama tetapi tidak publik — persis setengah ukuran yang dihindari proyek ini.

Terukur sebelum mulai, dan ukurannya yang menentukan bentuknya: dari **31.837** rekaman
yang bisa muncul di layar, yang diterbitkan proyek ini sendiri ada **28** — 0,088%.
Sisanya salinan: 31.575 dari registri kementerian, 234 dari OpenStreetMap.

- **Tombol tunggal "sanggah fakta ini" akan berbohong pada 99,9% layar.** Ia menyiratkan
  repositori ini bisa membetulkan apa yang ia salin; kebenarannya tinggal di registri
  orang lain, dan isu di sini tidak menyentuhnya. Jadi yang ditanya lebih dulu bukan *apa
  yang benar* melainkan **apa yang salah** — karena jawabannya menentukan ke mana
  perbaikannya pergi. *Salinannya* dan *penyajiannya* bisa dibetulkan di sini;
  *faktanya sendiri* tidak bisa, dan layar mengatakannya **sebelum** tombolnya ditekan,
  bukan sesudah orang menghabiskan waktu menulis.
- **Mencatat bukan membetulkan, dan itu tetap bernilai.** Catatan publik dan bernama
  tentang entri registri yang disanggah praktisi tidak ada di mana pun, dan ia artefak
  tersendiri — bukan hadiah hiburan untuk sanggahan yang gagal.
- **Aturan bukti mengarah balik ke pembaca.** `batas.js` menuntut tiap layar menyebut
  alasan tingkat buktinya, mewarisi `preparation.schema.json`: *"tingkat bukti tanpa
  alasan adalah klaim tanpa dasar"*. Di sini tuntutan yang sama dikenakan kepada yang
  menyanggah — tanpa **dasar**, sanggahannya tidak disusun sama sekali. Layar yang
  menuntut dasar dari dirinya sendiri lalu menerima sanggahan tanpa dasar sedang memakai
  dua timbangan.
- **Muatannya membawa tiga hal yang usul gambar tidak perlu bawa.** Usul *menambah*,
  sanggahan *menantang*, dan yang menantang harus bisa ditunjukkan menantang apa: id
  rekaman, **tautan-dalam yang benar-benar membukanya kembali** (`?opt=`, `?id=&pecahan=`,
  `?resep=`), dan **`meta.cap`** — versi indeks saat itu. Tanpa cap, sanggahan terhadap
  angka yang sejak itu berubah tidak bisa ditafsirkan lagi: pembacanya tidak tahu apakah
  angkanya sudah dibetulkan atau penyanggahnya keliru sejak awal.
- **Satu jalan sengaja tidak dibuat.** 234 titik toko datang dari OpenStreetMap, tempat
  siapa pun boleh menyunting langsung. Koreksi yang ditampung di sini justru jadi salinan
  ketiga yang basi begitu OSM diperbarui — jadi yang ditawarkan tautan ke penyuntingnya.
- **Menempel di blok batas, bukan di tiap layar.** "Satu fakta" baru punya arti setelah
  sumbernya disebut, dan blok batas satu-satunya tempat yang sudah tahu keduanya. Semua
  duabelas layar karena itu mendapat pintunya tanpa perkabelan; layar yang punya rekaman
  tunggal menajamkannya dengan `sanggah: () => terbukaKini`, dibaca **saat diketuk** —
  blok batas digambar sekali saat muat, rekamannya dibuka jauh sesudahnya.
- **Tidak ada yang terkirim dari halaman ini.** Dua jalan keluar, keduanya baru berjalan
  setelah orangnya menekan: salin, atau buka isu yang sudah terisi di tab baru. Alamat
  formulir isu punya batas panjang — yang melewatinya dialihkan ke papan klip beserta
  sebabnya, karena isu yang terbuka dengan isi terpotong separuh lebih buruk daripada
  yang tidak terbuka.
- **Yang datang langsung ke Issues tidak dibiarkan dengan kotak kosong.**
  `.github/ISSUE_TEMPLATE/sanggahan.yml` menuntut medan yang sama, dan menyebutkan angka
  0,088% itu di muka.

### Analisis usaha tani — D3

`usaha.html`. Satu angka yang menentukan sebelum menanam: **rupiah per kilogram** yang
harus diterima supaya biaya semusim tertutup.

- **Seluruh masukannya milik pemakainya**, aturan yang sama seperti jalur 3. Registri
  tidak memuat biaya usaha tani sama sekali, dan tidak memuat potensi hasil satu pun dari
  11.227 varietas — jadi tidak ada angka acuan yang bisa disodorkan, dan menyodorkannya
  berarti mengarang. Sumbernya karena itu **tanpa tingkat bukti**: ia bukan klaim siapa
  pun kecuali yang mengetiknya.
- **Yang ditayangkan rasio, bukan dua angka bersebelahan** — aturan tayang ke-5 di
  [`docs/16`](../docs/16-sumber-harga-komoditas.md). *"Titik impasmu 21% dari harga eceran
  Bawang Merah"* jauh lebih sulit disalahpahami daripada dua angka berdampingan, yang akan
  terbaca seolah selisihnya keuntungan. Ia bukan: harga eceran memuat marjin seluruh
  rantai.
- **Bahkan "harga produsen" resmi bukan harga petani, dan layar mengatakannya.** Pada
  tingkat produsen, responden yang dicatat negara adalah pengumpul, penggilingan, dan
  pedagang; di Kabupaten Karawang tercatat **satu orang**. Jaraknya terpasang di dalam
  *definisinya*, bukan celah cakupan yang bisa dirapatkan dengan menambah sampel.
- **Titik impas di atas harga eceran diberi kartu merah**, dengan kalimatnya sendiri:
  pada harga sebesar itu usaha ini rugi bahkan sebelum rantai mengambil bagiannya.
- **Kategori biaya disediakan, angkanya tidak.** Daftar barisnya menolong orang mengingat
  apa yang belum dihitung; menyediakan angkanya berarti mengarang biaya yang tidak pernah
  diukur siapa pun, dan tiap daerah berbeda.
- **Tenaga kerja sendiri tidak disembunyikan.** Banyak hitungan usaha tani
  menghilangkannya, dan hasilnya usaha yang tampak untung padahal upahnya sendiri yang
  tidak terbayar. Layar tidak memutuskan untuk pemakainya — ia hanya tidak menghapus
  barisnya.
- **Arus kas semusim ditahan, bukan ditampilkan setengah.** Kapan biaya keluar dan kapan
  uang masuk menuntut kalender bertanggal; kosakata fase **sengaja tidak punya medan
  hari**, dan hanya dua dari empat langkah protokol cabai bertanggal.

### Direktori layanan — C7

`toko.html`. **Dua pintu, karena datanya memang dua bentuk** — dan yang paling menentukan
di halaman ini bukan pencariannya melainkan pemisahannya.

| Kumpulan | Punya | Pintunya | Bisa dituju? |
|---|---|---|---|
| 234 · OpenStreetMap (ODbL) | koordinat, tanpa wilayah | jarak dari posisi pembaca | **ya** |
| 2.248 · TTI Kementan + Pemkab Batang | nama + wilayah, tanpa koordinat | telusur menurut wilayah | **hampir tidak** |

- **Satu angka di `docs/15` perlu dikoreksi.** Dokumen itu menyebut *"2.181 benih TTI
  beralamat"*. Terhitung dari berkasnya: hanya **92 dari 2.248 — 4,1%** — menyebut sesuatu
  yang lebih rinci daripada kabupaten atau kota. Sisanya berhenti di nama kabupaten,
  tersebar di 92 wilayah. **Nama tanpa alamat tidak bisa dituju**: ia bukti bahwa penjual
  benih ada di sana, bukan petunjuk ke mana pergi. Layar menyebutnya begitu di tiap baris.
- **Menggabungkan keduanya akan menyamarkan justru itu.** 2.248 rekaman yang tidak bisa
  dituju akan tampak setara dengan 234 yang bisa.
- **Tidak ada geokode, dua arah.** Yang berkoordinat tidak diberi nama wilayah, dan yang
  bernama wilayah tidak diberi koordinat. Keduanya menuntut geokode massal, dan itu sudah
  diputuskan tidak dilakukan — medan kosong menunggu pemilik toko mengklaimnya.
- **Posisi tidak pernah meninggalkan peranti.** Jarak dihitung di sini terhadap daftar
  yang sudah diambil; tidak ada permintaan jaringan saat menghitungnya. Koordinat rumah
  orang jauh lebih menentukan daripada kata yang dicarinya, dan beranda sudah menjanjikan
  yang kedua tidak dikirim ke mana pun.
- **Petanya OpenStreetMap, bukan Google.** Titiknya ODbL dan tautannya balik ke OSM;
  koordinat Google tidak boleh disimpan sama sekali.
- **Dua sumber, dua tingkat bukti, dan itu tampil berdampingan.** OSM tingkat **C** —
  dipetakan sukarelawan yang datang ke tempatnya, bukan lembaga yang mendaftarkannya.
  Penjual benih tingkat **D** — 2.181 di antaranya dari arsip Wayback halaman yang sudah
  tidak ada, **tanpa tanggal pada rekamannya**, jadi toko yang sudah tutup tidak bisa
  dibedakan dari yang masih buka.
- **Ejaan kabupaten diseragamkan saat penyerapan.** TTI menulis `Kab. Batang`, data
  terbuka Batang menulis `Kabupaten Batang` — dan tanpa penyeragaman satu tempat pecah
  jadi dua wilayah, dengan 67 rekaman beralamat lengkap terpisah dari 5 yang tidak. Pola
  yang sama seperti *Minyak Kita* lawan *Minyakita* di `docs/16`. Terhitung: 77 memakai
  `Kab.`, 1 memakai `Kabupaten`, tepat satu tempat bentrok.
- **Empat dari enam layanan yang dijanjikan C7 masih nol.** Penyuluh, POPT, laboratorium,
  dan jasa alsintan tidak punya satu rekaman pun. Layar mengatakannya alih-alih
  menampilkan tab kosong.

### Luring — A5

`sw.js` di **akar repositori**, `app/luring.js`, `app/manifest.webmanifest`, `app/ikon.svg`.

- **Berkas pekerjanya di akar, dan itu dipaksa aturan.** Cakupan service worker ditentukan
  letak berkasnya. Permukaan ada di `/app/` tetapi indeksnya di `/spec/indeks/` — dua
  cabang yang tidak saling membawahi. Dari `/app/sw.js`, seluruh indeks di luar jangkauan
  dan tidak satu pun pecahan bisa disimpan. Header `Service-Worker-Allowed` bisa
  melonggarkannya, tetapi ia header server dan repositori ini belum punya host.
- **Tiga tingkat, dan "penuh" tidak berarti semuanya.** Indeksnya 29 MB pada 4.283 berkas.
  Mengunduh semuanya diam-diam pada sambungan berbayar adalah kekerasan terhadap orang
  yang justru jadi alasan permukaan ini seringan ini.

  | Tingkat | Ukuran | Yang bekerja tanpa sinyal |
  |---|---|---|
  | Otomatis | ±230 KB, 56 berkas | Aplikasi terbuka; jalur 5 dan 6 utuh; daftar gejala jalur 1; pencarian gejala dan nama lokal |
  | Atas permintaan | ±4,6 MB, 1.175 ember | Pencarian nama — produk, pupuk, varietas |
  | Menyusul saat dibuka | — | Rincian yang pernah dibuka bertahan; yang belum pernah dibuka tidak ada |

- **Ukurannya disebut sebelum diketuk, bukan sesudah.** Tombolnya di `ukur.html` — halaman
  yang memang tentang apa yang tersimpan di peranti — bukan di beranda: 4,6 MB adalah
  keputusan yang diambil sadar, bukan disodorkan di jalan orang mencari sesuatu.
- **Aman karena URL-nya bercap.** Cache-first hanya boleh dipasang setelah pecahan diambil
  dengan `?v=<cap>`; isi berubah berarti URL berubah, jadi salinan basi mustahil
  tersajikan. Sebelum cap ada, strategi ini tidak akan aman sama sekali. `meta.json`
  sendiri **tidak** bercap — ia yang menyebutkan capnya — jadi ia satu-satunya yang
  diambil jaringan-dulu.
- **Berkas indeks akar disimpan BESERTA capnya.** Versi pertama menyimpannya telanjang,
  dan akibatnya baru kelihatan saat diuji tanpa jaringan: `ambil()` memintanya sebagai
  `…json?v=<cap>`, jadi salinan telanjang tidak pernah cocok dan jalur 1, 5, 6 kosong.
  Mencocokkannya dengan `ignoreSearch` akan menghidupkan kembali persis risiko basi yang
  dicabut cap, jadi yang benar membaca cap sekali saat pemasangan.
- **Dipasang lewat `tema.js`,** satu-satunya modul yang diimpor kesebelas halaman.
  Menyalin satu baris pendaftaran ke sebelas berkas akan mengulang dua kekeliruan yang
  sudah ditemukan di permukaan ini: tema yang berhenti di beranda, dan enam salinan
  penangan tombol kembali.
- **Satu cabang yang tidak sanggup tidak boleh membungkam yang sanggup.** Uji luring
  menemukan `Promise.all` di beranda yang menangkap galat pada dua cabang tetapi tidak
  pada `cari()` — jadi ember nama yang gagal diambil ikut membunuh hasil gejala dan nama
  lokal yang **sudah ada di peranti**. Ketiganya kini ditangkap sendiri-sendiri, dan
  ketidaksanggupan pencarian nama dinyatakan di bawah hasil yang berhasil.
- **Saat mengembangkan, cangkangnya harus dibuang dulu.** Sesudah A5 hidup, `sw.js`
  menyajikan HTML, CSS, dan modul dari cache — jadi perubahan berkas **tidak terlihat**
  sampai `VERSI` di `sw.js` dinaikkan atau cache dibuang lewat tombol di `ukur.html`. Ini
  bukan cacat; ia justru buktinya bekerja, tetapi ia akan membuang waktu siapa pun yang
  lupa.
- **Dan membuang cangkangnya saja belum cukup.** `python3 -m http.server` tidak mengirim
  `Cache-Control` sama sekali, jadi peramban memakai caching heuristik dan tetap
  menjalankan modul lama walau service worker sudah dicabut dan seluruh `caches` dihapus.
  Gejalanya menyesatkan: berkas di cakram benar, `curl` melayani yang benar, `fetch()`
  dengan query acak melayani yang benar — tetapi halaman menjalankan yang lama. Cara
  tercepat memastikan: **ganti origin**, `127.0.0.1` menggantikan `localhost`, karena
  cache-nya terpisah. Menaikkan `VERSI` saja tidak menyentuh lapis ini.
- **`navigator.onLine` tidak tahu apakah situsnya terjangkau.** Ia melaporkan tautan
  peranti, bukan keterjangkauan — saat server dimatikan dalam pengujian, cip jaringan
  tetap berbunyi "Ada sinyal". Memeriksanya sungguhan menuntut satu permintaan tambahan
  per muat halaman, dan itu biaya yang justru dikeluhkan temuan 5 audit. Batasnya
  dinyatakan, bukan ditutup.

### Antrean pertanyaan tak terjawab — B4

Tiap "tidak sanggup" yang ditampilkan hari ini menghilang begitu layar ditutup. Dicatat,
ia jadi peta permintaan data. Tercacah di `ukur.js`, terbaca di `ukur.html`.

- **B1 menyatakan lubangnya; B4 menghitung berapa kali ia ditabrak.** Keenam kunci sama
  persis dengan `meta.tidakAda`, yang sudah tercetak di tiap layar lewat blok batas
  jawaban. Daftar lubang yang diurutkan menurut kepentingan sudah ada dan urutannya
  tebakan; B4 mengurutkannya menurut **seberapa sering orang benar-benar menabraknya**.
- **Cacahnya saja, tidak pernah kata yang diketik.**
  [`docs/11`](../docs/11-instrumentasi.md) bagian 3 menyatakan isi pencarian sengaja
  tidak diukur — jejak minat bisa mengenali orang di desa kecil — dan B4 tidak
  mengubahnya. Tanda tangan `catatLubang(sumber, kunci)` sengaja tidak menyediakan tempat
  untuk teks, supaya penambahannya tidak bisa terjadi tanpa disadari.
- **Sumbernya nama layar, bukan nomor jalur.** Beranda ikut mencatat tanpa diberi nomor
  karangan, jadi tabel per jalur di `docs/11` tidak berubah — batas yang sama yang
  membuat beranda tidak ikut terinstrumentasi sejak awal.
- **`LUBANG` wajib berisi tepat yang dipanggil layar.** Kunci yang tidak terdaftar
  ditolak diam-diam oleh `catatLubang()`, dan lubang yang gagal dicatat tanpa suara
  adalah kebalikan dari gunanya B4. Kecocokan keduanya diperiksa saat membangun.
- **Satu lubang bukan permintaan data, dan tetap dicatat.** Registri tidak akan pernah
  memuat ukuran tutup botol siapa pun; kalau `takaranRumahTangga` sering tertabrak, yang
  perlu ditulis **panduan**. Mengetahui itu sama berharganya dengan mengetahui registri
  mana yang perlu ditarik.
- **Tidak ada yang diberi tahu.** Antrean tinggal di peranti yang sama, ikut terhapus
  oleh tombol yang sama, dan tidak pernah menyentuh jaringan. Ia berguna kalau dan hanya
  kalau diserahkan atas permintaan.

### Kalibrasi & takaran — D4 dan D5

`takaran.html`. Dua kapabilitas termurah yang paling langsung menyentuh keselamatan, dan
keduanya tidak menuntut satu baris data baru — hanya aritmetika dan bentuk layar yang
benar. Anjuran "2 ml per liter" tidak berguna bagi yang menakar dengan tutup botol, dan
dosis label yang benar jadi salah begitu kalibrasi tangki keliru.

- **Bukan jalur ketujuh, dan itu keputusan.** Enam pintu ditetapkan
  [`docs/03-enam-pintu.md`](../docs/03-enam-pintu.md), dan `ukur.js` menghitung **per
  jalur** menurut tabel di [`docs/11`](../docs/11-instrumentasi.md). Menomorinya jadi
  jalur 7 mengubah tabel itu; ia berdiri sebagai layar utilitas seperti `ukur.html`,
  ditautkan dari kesembilan halaman.
- **Ditulis untuk orang yang tidak memilih dosisnya.** Ditanya siapa yang menakar di
  lahan, jawabannya *"keduanya"* — petani **dan** buruh semprot, dan yang kedua menerima
  dosis, tidak memutuskannya. Jadi layar tidak pernah bertanya "mau pakai berapa"; ia
  bertanya "berapa yang tertulis", lalu menghitung.
- **Dua bentuk dosis, dan bedanya menentukan apakah kalibrasi perlu sama sekali.**
  Terhitung dari registri: **47,2%** penggunaan berlabel memakai per hektare, **27,3%**
  per liter air, dan **22,8% tidak memuat dosis sama sekali**. Yang per liter sudah
  menyebut kepekatannya; yang per hektare tidak bisa dihitung sebelum diketahui berapa
  luas yang dijangkau satu tangki. Angka sebarannya dihitung `bangun-indeks.mjs`, bukan
  diketik di layar, supaya tidak bisa basi.
- **Tidak ada ukuran bawaan untuk tutup botol, sendok, atau gelas.** Tutup yang berbeda
  berselisih dua sampai empat kali lipat; menyebut "satu tutup" sebagai takaran berarti
  mengarang angka yang bisa melipatgandakan dosis — pada layar yang justru dibangun untuk
  keselamatan. Kalau takarannya belum diukur, yang ditampilkan **sebaran akibatnya**
  (5 → 30 ml, berselisih 6 kali lipat) beserta cara mengukurnya sekali seumur alat.
- **Tiap pembagian harus bisa direproduksi pembaca, bukan sekadar ditampilkan.** Versi
  pertama menulis `45 × 6,7 = 300 ml` untuk total petak — dan 45 × 6,7 sebenarnya 301,5,
  karena jumlah tangkinya ditampilkan sudah dibulatkan. Pada layar yang menjanjikan
  pembagiannya bisa dibantah, baris yang tidak bisa dihitung ulang membatalkan janjinya.
  Total petak kini diturunkan langsung dari luas, bukan dari angka yang sudah dibulatkan.
- **ml dan gram tidak pernah disatukan.** Berat jenis tidak ada di registri, jadi hasil
  bersatuan gram tidak diteruskan ke bagian takaran — menakar gram dengan tutup botol
  menuntut konversi yang tidak dimiliki siapa pun di sini.
- **Keselamatan sengaja tidak disentuh.** APD, cara mencampur, gejala keracunan, dan
  nomor darurat itu **B2**, dan belum dibangun. Menyisipkan sebagiannya di sini akan
  membuat halaman ini terbaca seolah sudah lengkap.

### Pemeriksaan keaslian lewat kandungan — C2

Pintu kedua ke jalur 2: masuk dari **angka yang tercetak di karung**, bukan dari nama
atau nomor pendaftaran. Perendernya tetap satu — nama yang cocok dibuka layar rincian
yang sama seperti hasil pencarian nama.

- **Nomor pendaftaran bukan pintu, dan itu jawaban lapangan.** *"Tidak. Biasanya langsung
  lihat kemasan, cek kandungan."* Registri membenarkannya dari sisi yang sama sekali
  lain: **667 dari 7.196 pupuk — 9,3% — tidak punya nomor pendaftaran sama sekali**,
  sementara 71,3% punya komposisi. Dua garis bukti yang tidak berhubungan.
- **Batasnya tercetak di layar, bukan di catatan kaki.** Kandungan yang cocok
  membuktikan **labelnya** sesuai dengan yang terdaftar. Ia **tidak** membuktikan isi
  karungnya — dan justru di situ bahayanya paling tajam: kasus pupuk palsu Rp3,3 triliun
  persis berupa karung yang berbeda dari labelnya sendiri, NPK di bawah 1% padahal
  minimum 15%.
- **Tidak ada jalur lapor, dan itu dicabut, bukan tertunda.** Ditanya apa yang terjadi
  hari ini ketika seseorang mencurigai pupuk palsu, jawabannya *"berhenti di
  pemeriksaan"*. Kotak masuk yang tak seorang pun di ujungnya lebih buruk daripada tidak
  ada kotak masuk.
- **Nol hasil dinyatakan sebagai tiga kemungkinan, bukan satu vonis.** Angkanya salah
  baca, produknya terdaftar dengan kandungan sedikit berbeda, atau memang tidak
  terdaftar. Pencocokannya **persis** — 15% bukan 15,5% — dan layar mengatakannya.
- **Angka mustahil ditangkap tanpa registri sama sekali.** Kadar yang jumlahnya melebihi
  1.000 g/kg tidak bisa benar, dan itu bisa diperiksa mesin dari angka yang diketik
  bahkan kalau registrinya basi. Registri sendiri memuat 27 produk yang melewatinya —
  `L27` di pemeriksa menandainya. Pemeriksaan tetap dijalankan di bawah peringatannya.
- **Persen harus menyebut kemasannya, dan itu bukan kerewelan.** Karung NPK mencetak
  "15-8-10"; registri menyimpan 150 g/kg; dan **nol dari 5.130 pupuk berkomposisi memakai
  persen**. Kalau "%" dibiarkan berdiri sendiri, justru bentuk yang paling sering dibaca
  orang dari karung yang tidak akan pernah cocok. Jadi 1% = 10 g per kilogram atau per
  liter, dan yang memilih kemasannya orang yang memegangnya.
- **Padat, cair, dan persen tidak pernah dicocokkan silang.** Berat jenis tidak ada di
  registri. Baris bersatuan campur ditolak dengan alasannya, bukan dihitung diam-diam.
- **Indeksnya berember hash, bukan berawalan.** Awalan sidik komposisi tidak berarti
  apa-apa bagi yang mengetik dan sebarannya pincang; hash memberi 256 ember yang rata,
  dan penyaji menghitung sendiri embernya tanpa satu pun berkas kepala. Satu pemeriksaan
  mengambil satu ember — 1.451 KB seluruhnya, tetapi ~5,7 KB yang benar-benar diambil.
  FNV-1a dipilih karena harus bisa ditulis persis sama di pembangun dan di peramban.
- **`setara/` tidak bisa dipakai walau tampak mirip.** Ia hanya menyimpan kelompok
  berisi ≥2 anggota, sedangkan C2 justru paling perlu menjawab produk tunggal; dan ia
  mengunci pupuk pada `formulation`, string registri yang tidak tercetak di karung dan
  tidak diketahui pembeli.
- **Sisi pestisida belum berpermukaan, dan itu dinyatakan.** Indeksnya sudah memuatnya —
  12.564 dari 12.579 produk berkomposisi, termasuk 3.028 pestisida bersatuan persen yang
  jadi basis ketiga. Yang belum dibangun formulirnya: bahan aktif pestisida ada 1.706 dan
  menuntut pencarian sendiri, bukan daftar pilihan seperti 17 hara. Sementara itu,
  kadar bahan aktif tunggal tetap terjangkau lewat kartu bahan+kadar di jalur 2.
  Lima belas produk bersatuan ganjil — `mL/L`, `mg/pcs`, `g/m2`, `mg/m2` — tidak ikut
  terindeks sama sekali.

### Masuk lewat nama hama — C3, sisi yang tidak menuntut agronomi

Terukur sebelum mulai: **nol** entri OPT di kepala pencarian. Ratusan OPT registri punya
produk terdaftar dan bahan aktifnya sudah ada di indeks — tetapi yang tahu nama hamanya
dijawab **nol**. Itu bukan kekurangan data; itu pintu yang belum dibuka.

- **Yang dibuka hanya pintunya.** Menulis teks gejala untuk sisa OPT registri adalah pekerjaan
  agronomi, bukan pekerjaan indeks — dan mengarangnya persis yang ditolak jalur 1.
- **Tidak ada blok "pastikan dulu" untuk pintu ini, dan itu bukan kelalaian.** Blok itu
  ada karena yang masuk lewat gejala sedang *menebak*, dan dua ciri yang bisa diperiksa
  sendiri menahan tebakan itu. Untuk OPT registri cirinya memang tidak ada. Yang bisa
  dilakukan layar adalah **mengatakan apa yang tidak bisa dipastikannya** — bukan
  diam-diam melepas penjagaannya. Kartunya berbunyi *"Kamu masuk lewat nama, bukan
  gejala"*, dan menawarkan jalan balik ke pintu gejala.
- **Dua ruang id yang berbeda, dan keduanya dipertahankan.** OPT terkurasi
  (`op:pst:0000000x`, sepuluh, bergejala) dan OPT registri (`op:pst:00001xxx`, 738, tanpa
  gejala) **tidak beririsan sama sekali** — tidak satu pun dari 738 ada di `pest.json`.
  Versi pertama menandai mana yang bergejala dan penandanya selalu `false`; menandainya
  berarti memeriksa kecocokan yang tidak pernah dibuat siapa pun. Pintunya karena itu
  juga berbeda: `?hama=` khusus yang registri, dipakai beranda — yang memang tahu
  jenisnya, karena entri yang dibukanya datang dari kepala pencarian. `?opt=` menerima
  **id apa pun** dan menjatuhkannya sendiri ke ruang yang benar; itu yang dipakai
  pemanggil yang tidak tahu, dan alasannya di bagian berikut.
- **Nama ilmiah ikut sebagai alias.** Yang mengetik `Spodoptera` tidak sedang mengetik
  awalan nama Indonesianya.

### Dua jalur yang saling menutup

Jalur 1 dan jalur 2 menjawab pertanyaan yang berlawanan arah — "apa yang terdaftar untuk
masalah ini" dan "apa isi barang yang saya pegang" — dan sampai sekarang masing-masing
berhenti di tepinya sendiri. Yang membaca tabel *terdaftar untuk* di layar produk tidak
punya jalan ke merek lain untuk OPT yang sama; yang membaca tabel merek di jalur 1 tidak
punya jalan ke isi merek yang baru saja dibacanya. Keduanya sudah memegang kunci yang
dibutuhkan sisi seberang; yang belum ada cuma tautannya.

- **Yang dituju pasangan tanaman + OPT, bukan nama OPT saja.** Satu baris di tabel
  *terdaftar untuk* memang menyebut keduanya, dan yang terdaftar berbeda-beda menurut
  tanamannya: dua baris "Penyakit Hawar Daun" pada satu produk mendarat di dua layar yang
  berlainan, kentang dan tomat. Komoditasnya ikut sebagai `&kom=`.
- **Kunci komoditasnya tidak pernah jadi jalur berkas.** Ia dicocokkan dengan daftar
  komoditas yang memang dibawa rekaman OPT-nya, dan yang dibuka berkas dari daftar itu.
  Kunci yang tidak ada di daftar tidak membuka apa pun, dan layarnya berhenti di daftar
  komoditas — persis seperti masuk tanpa penunjuk.
- **Penjagaan jalur 1 tidak dilompati.** Layar tujuan tetap membuka dengan kartunya —
  *"pastikan dulu"* untuk yang terkurasi, *"kamu masuk lewat nama"* untuk yang registri —
  dan penggulirannya dimatikan justru untuk itu. Menggulir langsung ke daftar bahan
  melewatinya tanpa suara; yang mengetuk dari daftar di halaman yang sama sudah
  membacanya, yang mendarat dari halaman lain belum.
- **Yang tidak bisa dituju tidak bertaut, dan jumlahnya disebut.** 2.438 dari 23.058
  penggunaan berlabel mengosongkan tautan OPT atau komoditasnya di registri — pemakaian
  bukan-tanaman seperti *kayu gergajian* dan *di dalam ruangan*, yang tidak pernah
  menghasilkan layar di jalur 1. Nama yang tertulis tetap ditampilkan apa adanya, dan
  kaki tabelnya menyebut berapa baris yang buntu di produk itu.
- **Ruang id-nya diputuskan jalur 1, bukan jalur 2.** Rekaman penggunaan berlabel cuma
  menyebut `op:pst:...`, dan registri tidak menandai mana yang kebetulan ikut terkurasi.
  Memaksa jalur 2 menebak berarti menyuruhnya mengarang. Daftar terkurasi sudah ada di
  ingatan jalur 1 sejak halaman muat, jadi keputusannya tidak menambah satu perjalanan
  pun — dan yang bukan anggotanya tidak pernah dicari sebagai teks gejala.

Kolom tanaman menuju tempat lain, dan syaratnya juga lain — C8, pintu ketiga jalur 1:

- **Janjinya paling sempit dari ketiga pintu.** Yang masuk lewat gejala sedang menebak dan
  ditahan blok "pastikan dulu"; yang masuk lewat nama hama sudah punya dugaan dan ditahan
  kartu "kamu masuk lewat nama". Yang masuk lewat nama tanaman belum menyebut masalah apa
  pun — ia bertanya apa saja yang terdaftar untuk tanamannya, dan layar menjawab persis itu.
  Kartunya berbunyi *"ini daftar pendaftaran, bukan dugaan"*.
- **Urutannya bukan urutan ancaman, dan itu dinyatakan.** Banyaknya produk terdaftar
  mengukur ramainya pendaftaran, bukan seringnya hama itu datang ke kebun. Daftar terurut
  selalu terbaca sebagai peringkat, jadi kalimat itu ada di kartunya.
- **Nama Indonesia di registri kerap nama KELOMPOK, rekamannya SPESIES.** Jagung punya 146
  sasaran pendaftaran di bawah 29 nama: enam puluh dua di antaranya sama-sama berlabel
  "Gulma Berdaun Lebar", dan yang membedakan keenam puluh duanya nama ilmiahnya —
  *Ageratum conyzoides*, *Borreria alata*, *Cleome rutidosperma*, dan seterusnya. Cabai 74
  di bawah 38 nama. Menyajikannya apa adanya mengulang satu baris 62 kali dan terbaca
  sebagai data rusak; menyatukannya jadi satu baris menyembunyikan bahwa dosis dan mereknya
  memang terdaftar per spesies. Jadi dikelompokkan menurut namanya, dan yang beranggota
  lebih dari satu dibuka untuk melihat spesiesnya — bentuknya sama dengan kartu bahan.
- **Yang besar berbeda menurut letaknya.** Berdiri sendiri, nama Indonesianya yang naik:
  "Ulat Grayak", bukan *Spodoptera frugiperda*, sebab itu yang dikenali pembaca. Di dalam
  kelompok kebalikannya — nama Indonesianya sudah jadi kepala kartu, dan yang membedakan
  anggotanya justru spesiesnya. Sebagian rekaman memakai nama ilmiah sebagai nama
  Indonesianya sekalian (*Locusta migratoria* pada keduanya); keterangannya dihilangkan saat
  itu terjadi.
- **Pengelompokannya menurut ejaan persis, dan halaman tidak menyatukan apa yang registri
  pisahkan.** Dua nama yang nyaris sama tetap jadi dua baris — "Trips" dan "Hama Trips" pada
  cabai. Layar mengatakannya, sebab pembaca yang tidak diberi tahu akan menyimpulkan
  daftarnya keliru. Di dalam satu kelompok hal yang sama terlihat lebih tajam: delapan
  rekaman antraknosa cabai memuat *Colletotrichum capsici* (102 produk) di sebelah
  *Coletrotichum capsici* (1) dan *Colletothricum sp.* (1). Menyatukannya keputusan data,
  bukan keputusan penyaji.
- **`ilmiah` naik ke indeks komoditas, 61 KB.** Ia satu-satunya yang membuat daftarnya
  terbaca; 2.511 dari 2.580 entri punya, dan yang tidak punya tidak diberi medan kosong.
  Berkas terbesar 28,6 -> 33,4 KB, masih di bawah anggaran 48 KB.
- **Syarat tautnya berbeda dari kolom OPT, dan kaki tabel menyebut keduanya.** Kolom OPT
  menuju satu pasangan, jadi ia perlu id OPT *dan* id komoditas. Kolom tanaman menuju
  direktori tanamannya, jadi id komoditas saja cukup — baris yang OPT-nya kosong pun tetap
  bertaut selama tanamannya tercatat.

Arah sebaliknya, dari tabel merek ke rincian produk:

- **Nama merek jadi tautan, dan gambar kemasannya mendahuluinya.** Nomor pendaftaran
  sudah ada di layar; yang kurang cuma alamat rinciannya. Pecahannya dibawa rekaman merek
  itu sendiri (`p`) — dihitung dari peta pecahan, bukan ditebak dari nomor urut, sebab
  pecahan dipotong menurut ukuran dan tidak ada rumus dari id ke nomornya.
- **Petak kemasan berukuran tetap, bergambar maupun belum.** Gambar `kecil` dibatasi
  320 px pada sisi terpanjangnya dan nisbahnya berselisih — 320x320 sampai 320x213 — jadi
  tinggi baris yang mengikuti gambarnya akan bergoyang saat satu per satu mendarat.
  `object-fit: contain` di kotak 40 px menahan seluruh kemasan tetap terlihat;
  memangkasnya jadi persegi memotong justru bagian yang dicocokkan mata.
- **Yang belum bergambar tidak dibiarkan kosong melompong.** Hanya 15% baris merek punya
  gambar, jadi keadaan yang lazim justru yang tanpa — dan sederet sel kosong di antara
  yang bergambar terbaca sebagai *"yang ini yang meragukan"*, padahal artinya cuma situs
  pemegangnya belum dipanen. Petak bergaris putus-putus menempati ruang yang sama, dan
  kaki tabelnya mengatakannya dengan kata-kata.
- **Peringatan gambarnya ikut, dipendekkan.** Layar rincian sudah lama berkata gambar
  kemasan bukan bukti apa pun tentang barang di tangan — desain berubah, dan pemalsu
  menyalin desain. Menaruh gambarnya di tabel tanpa membawa kalimat itu memindahkan
  gambarnya saja dan meninggalkan syaratnya.
- **Dua tabel merek, satu rupa.** Yang di jalur 1 (per OPT + komoditas) dan yang di layar
  bahan aktif jalur 2 (per bahan + kadar) menyatakan hal yang sama; memberinya dua rupa
  membuat orang mengira keduanya dua hal yang berbeda. Keduanya membaca `gambarKecil()`
  yang sama di pembangun indeks, dan memakai kelas yang sama di layar.
- **Ongkosnya 916 KB pada `opt/` dan `bahan/`** — 569 KB untuk 34.293 penunjuk pecahan,
  346 KB untuk 4.790 nama berkas gambar, naik 11,9% pada dua cabang itu dan 2,7% pada
  seluruh indeks. Tidak satu berkas pun melewati anggaran 48 KB sesudahnya; yang gemuk
  dipecah lebih banyak oleh pemecah yang sudah ada.

### Kotak tanya multimoda — A1

Kotaknya sudah ada sejak beranda dibangun; yang belum, semua jalur tersambung ke sana.
Terukur sebelum mulai: kotak itu menjangkau **enam jenis** entri, dan **dua jalur penuh
tidak bisa dicapai darinya sama sekali**.

- **Sediaan masuk kepala pencarian.** Sebelum ini yang mengetik `trichoderma`, `biosaka`,
  atau `kompos` dijawab **nol**, padahal jalur 5 dan 6 memuat keduabelas resepnya. Kini
  tiap resep menautkan langsung ke layarnya — `?resep=…` — dan pintunya berbeda menurut
  rezimnya: sisi pupuk ke jalur 5, sisi pengendali ke jalur 6, karena keduanya memang dua
  janji yang berbeda.
- **Kata di tengah nama difilekan sebagai alias.** Kepala pencarian berember menurut
  **awalan**, dan "Perbanyakan Trichoderma pada media serealia" masuk ember `pe` — jadi
  nama jasad reniknya tidak terjangkau. Tiap kata penting kini difilekan terpisah lewat
  mekanisme `_k` yang sudah dipakai alias principal. Alias yang jatuh di ember yang sama
  dengan nama utuhnya dilewati, kalau tidak "Kompos" muncul dua kali.
- **Entri harus masuk SEBELUM ember didalamkan.** Yang ditambahkan sesudahnya tertinggal
  di ember dangkal sementara penyaji mencarinya di ember dalam — `Biosaka` ada di `bi.json`
  sementara penyaji membuka `bio.json` yang tidak pernah ada, dan hasilnya nol **tanpa satu
  pun galat**. Entri sediaan karena itu diturunkan langsung dari kosakata, bukan dari
  `berkasSediaan` yang baru disusun jauh di bawah.
- **Perutean niat untuk yang bukan entitas.** Tujuh layar tidak akan pernah muncul dari
  pencarian nama — kalkulator hara, kalibrasi semprot, titik impas, rencana musim, buku
  kas, direktori toko, harga eceran. Yang mengetik "berapa tangki" tidak sedang menyebut
  nama; ia menyebut pertanyaannya. Daftar katanya **pendek dan ditulis tangan**:
  pencocokan yang pintar menebak lebih sering, dan tebakan yang lebih sering di pintu
  masuk berarti orang lebih sering mendarat di layar yang salah tanpa tahu kenapa.
- **Pintu ditawarkan di bawah hasil nama, tidak pernah menggantikannya.** Kalau ada hasil
  nama, yang dicari hampir pasti namanya. Kartunya berlabel **Pintu** dan berwarna beda —
  ini merutekan, bukan menjawab. Salah rute berbiaya satu ketukan; salah jawab berbiaya
  semprotan yang keliru.
- **Masuk lewat foto tidak dibangun, dan itu keputusan.** Pengenal foto yang menebak
  persis yang ditolak jalur 1 — *"mesin tidak menebak"*. Masuk lewat gambar dan suara
  adalah kapabilitas tersendiri yang **ditunda**, dan layar mengatakannya di lembar
  "Tentang data" alih-alih membiarkan orang mencari tombol kamera yang tidak ada.

### Kamus nama lokal — A3

Petani tidak menyebut *Thrips parvispinus*; ia menyebut nama lokalnya. Tanpa kamus ini,
jalur 1 hanya bisa dipakai orang yang **sudah tahu jawabannya**. Enam nama pertama masuk
23 Agustus 2026, seluruhnya dari satu jawaban lapangan: *bule, patek, lodoh, layu, bercak
daun, keriting daun.*

- **Bukan entitas, dan karena itu tanpa `op:` id.** "Patek" bukan sesuatu yang ada di
  dunia — ia nama untuk antraknosa. Yang disimpan pemetaan, bukan hal. Blok prefiks ID
  adalah enum tertutup yang dinyatakan mengikat sejak v0.1 di
  [`spec/01-identitas-dan-versi.md`](../spec/01-identitas-dan-versi.md), dan menambahnya
  untuk sesuatu yang bukan entitas menukar kaidah mahal dengan kemudahan murah.
- **Terpisah dari `synonyms`, dan itu bukan kerapian.** Medan `synonyms` pada entitas
  terkurasi berisi **varian ejaan registri** — `Thrips palrvispinus`, `Spedoptera litura`,
  `Penyakut Layu Fusarium` — yaitu salah ketik mesin yang dikumpulkan untuk mencocokkan
  rekaman. Menaruh "bule" di sana membuat nama yang diucapkan manusia tidak bisa dibedakan
  dari salah ketik, dan menghapus dua keterangan yang justru paling menentukan: dipakai
  **di mana**, dan diketahui **dari siapa**.
- **Satu nama boleh menunjuk lebih dari satu OPT, dan itu jawabannya sendiri.** "Layu"
  memang tidak membedakan fusarium dari bakteri; "bule" dan "keriting daun" tidak
  membedakan virus kuning dari trips. Layar menampilkan keduanya berdampingan beserta
  kalimat yang menyebut apa yang tidak dibedakan, lalu menyerahkannya ke uji pembanding
  yang memang sudah ada di jalur 1 — uji gelas dan kertas putih. Memilih satu diam-diam
  berarti mendahului uji yang dibangun untuk memutuskannya.
- **Dua dari enam belum terpetakan, dan tetap ditampilkan.** "Lodoh" punya dua calon yang
  bertabrakan — rebah kecambah milik layu fusarium, atau buah membusuk milik antraknosa.
  "Bercak daun" kemungkinan besar menunjuk serkospora, yang **bukan** salah satu dari
  OPT terkurasi; itu kekosongan cakupan, bukan pemetaan yang belum selesai.
  Keduanya muncul di hasil pencarian sebagai kartu bergaris putus beserta alasannya,
  karena hasil nol terbaca sebagai *"tidak ada penyakitnya"* dan mengirim orang mencari
  di tempat yang tidak menjelaskan apa pun.
- **Tidak satu pun tahu wilayahnya, dan layar mengatakannya.** Sumbernya berbunyi *"setiap
  daerah memiliki bahasa lokal yang berbeda, tapi umumnya…"* — dan "umumnya" bukan nama
  tempat. Medan `regions` kosong pada keenamnya, dengan `region_unknown_reason` wajib
  terisi; skema menolak wilayah kosong yang tidak menyebutkan sebabnya. Kamus nama lokal
  yang diam soal wilayah menyodorkan nama satu daerah kepada seluruh negeri.
- **Tingkat bukti D, dan justru itu yang membuatnya boleh tampil.** Satu penjawab bukan
  konsensus, jadi bukan C. Nama yang salah petakan tertangkap blok "pastikan dulu" di
  jalur 1 — asalkan layar tidak berpura-pura yakin. Di jalur 1 lencana **D** ini berdiri
  bersama **B** milik registri dan lencana *belum ditetapkan* milik kurasi gejala: tiga
  tingkat bukti berbeda pada satu layar, masing-masing dengan alasannya.
- **Nama lokal ditempel di blok "pastikan dulu", bukan di judul layar.** Sebagai judul ia
  terbaca sebagai identifikasi; di dalam blok itu ia satu keterangan lagi yang harus
  dicocokkan pembaca.

### Tema — satu ikon, tiga keadaan, kedelapan halaman

Ketukannya berputar sistem → terang → gelap → sistem, dan ikonnya menyatakan yang sedang
berlaku. Tiga keadaan, bukan dua: "ikut sistem" adalah bawaan dan harus bisa dipilih
kembali — tombol yang cuma berpindah terang/gelap tidak memberi jalan pulang. Labelnya
menyebut keadaan sekarang **dan** tujuan ketukan berikutnya, sebab ikon sendiri tidak bisa
mengatakan keduanya, dan tombol berputar yang tidak menyebut tujuannya memaksa orang
mencobanya untuk tahu.

- **Putarannya tinggal di `tema.js`, dipakai kedelapan halaman.** Semula ia ada di
  `beranda.js`, dan akibatnya pilihannya berhenti di beranda: enam jalur dan halaman ukur
  tidak punya tombolnya, tidak membaca simpanannya, dan `gaya.css` bahkan mendengarkan
  atribut yang berbeda — `data-theme="dark"` sementara tombolnya menulis `data-tema="gelap"`.
  Orang yang memilih gelap lalu mengetuk satu jalur mendapat layar terang, **tanpa satu pun
  galat yang menandainya**. Diperbaiki 23 Agustus 2026; lihat temuan 1 di
  [`docs/20-audit-frontend.md`](../docs/20-audit-frontend.md).
- **Satu nama atribut: `data-tema="terang"|"gelap"`.** Selama dua nama itu masih berbeda,
  tidak ada perbaikan sebagian yang bisa benar — memasang skrip pembacanya saja di jalur
  1–6 tetap tidak akan berpengaruh.
- **Pembaca simpanan pertama sengaja disalin sebaris di tiap `<head>`**, sebelum lembar
  gaya. Ia harus berjalan sebelum cat pertama, dan memuatnya sebagai berkas berarti satu
  perjalanan pulang-pergi lagi sebelum apa pun tergambar — pada permukaan yang syarat
  lapangannya justru sinyal buruk. Salinan itu tidak memuat keputusan apa pun: ia membaca
  satu nilai dan memasang satu atribut. Delapan salinan yang identik dan tanpa cabang lebih
  murah daripada satu berkas yang menahan cat.
- **Tombolnya sebaris dengan label jalur**, bukan di atas judul: urutan bacanya tetap label
  lalu judul, dan tombolnya tidak menyisip di antara keduanya. Ukurannya 44×44 px.

### Khusus beranda

- **Satu kotak, tujuh macam jawaban.** Nama lokal, gejala, bahan aktif, harga
  komoditas, perusahaan, nama cocok, dan pintu ke alat datang dalam kelompok terpisah
  dengan judulnya masing-masing — bukan satu daftar datar. Ketujuhnya menjawab
  pertanyaan yang berbeda, dan mencampurnya dalam satu urutan memaksa pembaca menebak
  kenapa sebuah baris ada di situ. Urutannya dari yang paling spesifik: yang mengetik
  "patek" sudah tahu apa yang dilihatnya dan sedang menyebut namanya; yang mengetik
  sepotong nama merek belum tentu.
- **Judul kelompok berhenti berbunyi "nama terdaftar".** Sejak sediaan dan OPT ikut
  masuk kepala pencarian, kelompok itu memuat dua hal yang tidak terdaftar di mana pun:
  resep sediaan diterbitkan proyek ini sendiri, dan nama OPT adalah sasaran yang disebut
  pendaftaran orang lain. Judulnya kini `N nama cocok` diikuti macam yang benar-benar
  ada di dalamnya, dan lencana tiap baris tetap menyebut jenisnya sendiri. Satu kata
  yang menaikkan sebagian isinya lebih mahal daripada judul yang sedikit lebih panjang.
- **Komposisi ikut ke daftar hasil.** "PHONSKA" milik Petrokimia Gresik ada empat kali
  dengan grade berbeda — 15-8-10, 15-15-10, 15-10-15, 10-10-10 — dan "Pupuk Indonesia
  Holding Company Phonska Plus" delapan kali. Semuanya SKU yang berlainan, bukan rekaman
  ganda. Grade NPK hanya dibentuk kalau N, P2O5, dan K2O ketiganya tercatat **dan**
  ketiganya g/kg; kalau tidak, yang tampil komposisinya apa adanya. Produk yang
  komposisinya memang kosong di registri mengatakannya, bukan menyisakan baris hilang.
- **Bahan aktif tidak pernah diratakan.** Satu entitas "Abamektin" dipakai pada 33 kadar
  berbeda; daftarnya dipecah per kadar, karena kesetaraan hanya benar pada pasangan
  bahan + kadar. Dosis tidak ikut ke layar bahan sama sekali — ia milik pendaftaran tiap
  produk. Di dalam satu kartu kadar, yang ditampilkan justru bahan **lain** di dalamnya:
  sebagian abamektin murni, sebagian campuran, dan itu yang membedakan anggotanya.
- **Unsur hara sengaja tidak bisa dicari sebagai bahan.** Nitrogen sendiri ada di 2.582
  pupuk — hampir seluruh registrinya — dan daftar sepanjang itu tidak menjawab apa pun.
  Pertanyaan haranya dijawab jalur 3, dalam rupiah per kilogram hara. Batas itu tertulis
  di layar, bukan cuma di sini.
- **Gejala menyebut berapa kata yang cocok**, dan ambangnya separuh kata dibulatkan ke
  atas. Tanpa ambang itu satu kata lazim seperti "daun" memanggil kesepuluh gejalanya,
  dan daftar yang selalu penuh sama tidak berartinya dengan daftar yang selalu kosong.
  Statusnya draft disebut di judul kelompoknya, bukan disembunyikan di kaki halaman.
- **Pintu depan tidak punya perender.** Tidak satu pun kelompok hasilnya dibuka di
  sini: produk dan bahan aktif diserahkan ke jalur 2 — pertanyaannya sama-sama
  "sebenarnya ini apa" — varietas ke jalur 4, gejala dan nama lokal ke jalur 1 karena
  di sanalah blok "pastikan dulu" berada, sediaan ke jalur 5 atau 6 menurut rezimnya,
  perusahaan ke `principal.html`, dan komoditas ke `harga.html`. Satu layar rincian,
  satu tempat — kalau disalin ke sini, keduanya akan menyimpang begitu salah satunya
  diperbaiki.
- **Yang bisa dicari disebut sebelum ada yang diketik — kesebelasnya.** Kotak kosong
  tidak mengatakan apa yang diterimanya, jadi layar menyebutnya lebih dulu. Sampai
  24 Agustus 2026 yang disebut cuma **empat dari sebelas**: nama pupuk, bahan aktif,
  gejala, nama varietas. Tujuh yang lain sudah bisa dicari berbulan-bulan — nama
  pestisida, nama lokal hama, nama OPT registri, resep sediaan, perusahaan, harga
  komoditas, dan pertanyaan tentang alatnya — dan tidak satu pun disebut. Aturannya
  sekarang bisa diperiksa, bukan diingat: **satu keping per kelompok hasil.** Keping
  tanpa kelompok menjanjikan yang tidak ada; kelompok tanpa keping menyembunyikan yang
  ada. Kesebelasnya diuji balik terhadap indeks — tidak satu pun berakhir nol.
- **Menunggu sampai hasilnya nol adalah cara termahal memberi tahu.** Yang mengetik
  nama pestisidanya lalu dijawab kosong menyimpulkan barangnya tidak terdaftar; yang
  meleset sebenarnya cuma dugaannya tentang apa yang boleh diketik.
- **Saran ejaan tidak mengganti kueri.** Kalau nol hasil karena satu-dua huruf keliru,
  layar bertanya "apakah maksudnya…" dan kueri aslinya tetap di kotak. Yang dikirim ke
  jalur tujuan adalah nama yang benar, bukan salah ketiknya — mengirim salah ketiknya
  membuat jalur tujuan mencari sesuatu yang memang nol.
- **Nol hasil dibuka dengan alasannya.** Nama di kemasan sering berbeda dari nama
  terdaftarnya, dan pemetaannya belum ada; layar menyebut itu lebih dulu sebelum
  apa pun yang lain.
- **Beranda tidak ikut terinstrumentasi.** `ukur.js` menghitung per jalur, dan pintu
  depan bukan jalur — memberinya nomor karangan akan mengubah tabel yang sudah
  didefinisikan di [`docs/11-instrumentasi.md`](../docs/11-instrumentasi.md).
- **Papan di bawah kotak dipisah dua, dan pemisahnya aturan yang sama.** Yang bernomor
  01–06 adalah keenam jalur, dan hanya keenamnya yang memanggil `catatBuka()`. Ketujuh
  layar sisanya — harga, profil perusahaan, kalibrasi, direktori, titik impas, rencana
  musim, buku kas — sengaja **tidak dinomori**, persis alasan `takaran.html` dulu tidak
  jadi "jalur ketujuh". Papan lama menomori harga `07` dan principal `08` padahal
  keduanya tidak terinstrumentasi sama sekali: nomor yang tidak ada di tabel mana pun.
- **Lima alat yang sudah dibangun cuma hidup di kaki halaman.** Kalibrasi, direktori
  toko, titik impas, rencana musim, dan buku kas sudah jadi tujuan perutean niat di
  `beranda.js` — kotaknya tahu jalan ke sana — tetapi papannya tidak menampilkan satu
  pun. Yang tidak menebak kata kuncinya hanya bisa menemukannya sebagai teks kecil di
  antara tautan kaki. Kelimanya kini punya kartunya sendiri, dan kaki halaman menyusut
  jadi tiga tautan yang memang bukan kapabilitas.
- **Tiap kartu di papan harus bisa dicapai dari kotak, dan itu invarian.** Ada dua cara
  memenuhinya, dan yang mana tergantung apakah layarnya punya nama untuk disebut. Keenam
  jalur dan profil perusahaan dicapai **lewat nama** — produk, varietas, dan badan memang
  entitas. Kalibrasi, direktori, titik impas, rencana musim, dan buku kas tidak punya nama
  untuk disebut, jadi merekalah yang wajib ada di `NIAT`. Kartu yang tidak memenuhi salah
  satu dari keduanya hanya bisa ditemukan yang sudah tahu ia ada — dan itu bukan pintu
  masuk, itu pintu belakang.

### Khusus jalur 1

- **Masuk lewat apa yang terlihat**, bukan nama hama. Yang panik tahu daunnya
  mengeriting ke atas; ia tidak tahu kata “trips”.
- **Mesin tidak menebak.** Tidak ada pengenal foto. Setiap dugaan dibuka dengan blok
  “pastikan dulu” berisi **dua ciri yang bisa diperiksa sendiri tanpa alat**. Sekitar tiga
  perempat ciri menyebut OPT mana yang **terbantah** kalau hasilnya begitu; sisanya hanya
  menguatkan, dan layar tidak mengarang pembantahan untuk mereka — cacah tepatnya
  dibangkitkan ke docs/14-tinjauan-gejala.md.
  Tiga di antaranya uji gelas yang benar-benar memutuskan — layu bakteri lawan fusarium,
  hawar daun bakteri padi lawan bercak jamur — dan satu lagi kertas putih untuk
  membedakan trips dari virus.
- **Saringan tanaman ada, tetapi tidak wajib.** Daftarnya tumbuh tiap kurasi komoditas
  baru, dan penanam padi harus melewati puluhan gejala tanaman lain sebelum sampai ke
  miliknya. Saringannya karena itu ada di atas daftar, dengan **“semua tanaman”
  tetap terpilih saat layar dibuka** — memaksa pilih tanaman lebih dulu akan menukar pintu
  “masuk lewat apa yang terlihat” dengan pintu lain. Disaring menurut tanaman yang
  **teksnya ditulis untuknya**, bukan menurut tempat produknya terdaftar; keduanya
  berbeda, dan hawar daun yang punya tujuh produk di cabai tidak muncul di saringan cabai.
- **Merek diruntuhkan jadi bahan aktif + kadar.** Kesetaraan hanya benar pada pasangan
  itu: satu entitas “Abamektin” dipakai pada 33 kadar berbeda, 24 di antaranya g/L.
- **Dosis tidak pernah ditempel ke bahan.** Ia muncul per merek, karena dosis milik
  pendaftaran tiap produk — 26 merek Abamektin 18 g/L membawa 11 dosis yang berbeda.
- **Cabang nol produk adalah layar terpentingnya.** Empat pintu virus memakainya — virus
  kuning keriting, virus mosaik bawang, virus penggulung daun kentang, dan tungro. Layar
  berkata *“jangan beli apa pun untuk ini”*, menyebut tiga tindakan yang memang
  berpengaruh, lalu menawarkan satu jalan keluar konkret ke penularnya. Penular dibaca
  dari medan `vector` pada entitasnya, bukan ditebak dari nama pada blok pembanding —
  tebakan itu benar tepat satu kali, saat virus yang dikurasi baru satu.
- **Gejalanya berstatus draft** dan layar mengatakannya: disusun dari pengetahuan
  agronomi mapan, bukan dari registri, dan wajib ditinjau penyuluh atau BPTP.

### Khusus jalur 3

- **Harga bukan dari registri.** Registri tidak memuat harga sama sekali; angkanya
  masukan pengguna, dan tandanya tetap terlihat di setiap hasil.
- **Pembagiannya ditulis terbuka.** Harga per kg ÷ fraksi hara = rupiah per kg hara,
  ketiganya tampil, supaya bisa dibantah siapa pun yang tidak percaya.
- **Hara total, bukan per hara.** Nitrogen tidak bisa dibeli terpisah dari yang lain,
  jadi membagi per hara sendiri-sendiri menyesatkan. Nisbahnya ditampilkan terpisah.
- **Padat dan cair tidak dicampur.** Basisnya selalu disebut — per kilogram atau per
  liter — dan kadar keduanya tidak pernah dikonversi, karena berat jenis tidak ada di
  registri. Nol dari 5.130 pupuk berkomposisi mencampur kedua basis, jadi tiap produk
  punya satu basis yang jelas.
- **HET bersubsidi selalu bersyarat.** Maksimal 2 hektare, wajib SIMLUHTAN dan e-RDKK.
  Angkanya dari Perpres 6/2025 dan Permentan 15/2025 — registri tidak menandai status
  subsidi pada satu pun dari 7.196 pupuknya, jadi kecocokan skemanya ditebak dari
  bentuk komposisi dan itu dinyatakan di layar.
- **Cabang "tidak sanggup" tampil tanpa angka.** Tujuh resep jalur 5 ditampilkan tanpa
  rupiah per kg hara: `L18` menolak menghitung hara dari batch yang belum diuji, dan
  kadar kompos berbeda tiap tumpukan. Menyembunyikannya berarti yang tidak sanggup
  membeli tidak melihat pilihan apa pun.

### Khusus jalur 5

- **Pasal 72 tercetak apa adanya**, bukan diringkas jadi “boleh”. Yang membuat sisi
  ini lapang adalah bunyinya sendiri, beserta syarat peredaran terbatas satu
  kabupaten/kota yang menyertainya — dan Pasal 73 yang tetap melarang mengedarkan.
- **Peringatan silang wajib ikut** pada dua fungsi yang merentang kedua sisi —
  memperbaiki tanah dan merangsang pertumbuhan. Satu klaim pengendalian sudah cukup
  memindahkan sediaan ke rezim pestisida; MOL dan PGPR ditampilkan berdampingan
  sebagai contohnya.
- **Padanan lapangan disorot tersendiri.** Uji laboratorium yang jadi dua gelas dan
  seminggu menunggu adalah bagian paling berharga di kosakata ini. Bila kosakata belum
  memuatnya — bokashi dan vermikompos — layar **mengatakannya**, bukan mengarang uji
  kebun yang belum pernah diputuskan siapa pun.
- **Ambang yang sengaja tidak ada tidak dicetak sebagai ambang.** Kemurnian biakan MOL
  memakai `>= 0 %` dengan alasan tertulis “tidak ada dasar mengukurnya di kebun”;
  layar menampilkan namanya saja beserta keterangan bahwa ia penanda kasar.
- **Tiap resep ditutup batas hara.** `L18` menolak menghitung hara dari batch yang
  belum diuji, jadi resep-resep ini tidak pernah muncul di kalkulator jalur 3 dengan
  rupiah per kg hara.
- **Bahan bersyarat membawa syaratnya.** Molase, urine ternak, media serealia, dan
  inokulum alam bebas ditandai beserta alasannya — status tanpa alasan adalah perintah
  tanpa sebab, dan itu yang paling mudah diabaikan.

### Khusus jalur 6

Jalur ini satu-satunya yang **dibangun untuk tidak menganjurkan**. Untuk pestisida,
larangannya tidak berhenti di peredaran: Pasal 77 ayat (1) menyebut “mengedarkan
**dan/atau menggunakan**”, kata yang tidak muncul di sisi pupuk, dan tidak ada pasal
yang sepadan dengan Pasal 72.

- **Pintunya membuka dengan pasalnya**, bukan menutup dengannya. Pasal 75, 76 ayat
  (2), 77 ayat (1), dan 123 tercetak sebelum apa pun yang bisa dibuka.
- **Bacaan Pasal 77 ayat (1) dinyatakan belum terjawab.** Rangkaian katanya bisa
  kumulatif maupun alternatif; itu pertanyaan hukum, bukan agronomi. Layar menyatakan
  status apa adanya, menandai `own_use_only`, dan **tidak menyimpulkan aman**.
- **Tidak pernah jadi cabang “yang bisa kamu pakai” dari jalur 1.** Ia berdiri
  sendiri; tautan di kaki halaman diberi label status, bukan ajakan.
- **Kriteria yang mengaku batasnya ditampilkan apa adanya.** PGPR: *“Tanpa
  laboratorium tidak bisa dipastikan. Larutan keruh saja bukan bukti.”* — kriteria
  pelepasan yang menyatakan dirinya tidak bisa dipenuhi di kebun.
- **PHI selalu menyebut dasarnya.** Keempat angkanya `precautionary_default` — bawaan
  yang sengaja berhati-hati, bukan hasil uji residu. Kartunya berjudul demikian.
- **Biosaka berhenti sebelum dosis.** Kosakata memuat 40 mL/L; layar sengaja tidak
  menampilkannya, karena tanpa kriteria pelepasan sediaan itu tidak bisa dibakukan —
  dan dosis atas sesuatu yang isinya tidak diketahui bukan takaran melainkan tebakan.
  Layar mengatakan penahanan itu disengaja.
- **Dua bahan terlarang ikut ditampilkan**, di bawah pemisah, dengan penolakan `L19`
  lebih dulu — bukan disembunyikan. Yang mencarinya harus sampai ke alasannya; kalau
  hasil pencariannya kosong, ia akan mencari di tempat lain yang tidak menjelaskan
  apa pun. Tidak ada dosis, tidak ada cara pakai, dan satu jalan keluar ke resep yang
  punya kriteria pelepasan.

### Khusus jalur 4

- **Bukan katalog agronomi.** **Nol** dari 11.227 varietas menyebut sifat agronomi
  apa pun — 30 rekaman memuat kata seperti "tahan", tetapi seluruhnya di nama
  pemelihara. Halaman menolak menjawab "varietas mana yang sebaiknya ditanam" dan
  menyatakan alasannya di muka.
- **Sebutan resmi ditampilkan apa adanya.** "Pendaftaran" saja mencakup empat
  instrumen; meratakannya jadi satu kata "terdaftar" membuang persis keterangan yang
  membedakan.
- **Masa berlaku tidak pernah dinyatakan.** 11.320 dari 11.609 surat hanya memuat
  nomor SK tanpa tanggal, jadi layar cuma bisa mengatakan sebuah surat *ada*.
- **Pelepasan bukan sertifikasi lot.** Registri tidak bisa memastikan bungkus benih
  atau bibit di polybag berasal dari varietas itu; yang berlaku untuk itu label dan
  sertifikat lot BPSB.
- **Kartu tahunan hanya muncul bila diputuskan.** `spec/tools/tandai-tahunan.mjs`
  menandai 52 komoditas — 16 tahunan, 36 semusim — mencakup 73,1% varietas. Sisanya
  tanpa penanda, dan layar diam untuknya alih-alih menebak.
