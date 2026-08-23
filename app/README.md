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

`tema.js` dipakai kedelapan halaman juga — putaran tema, ikon, dan labelnya.

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
  sepuluh OPT terkurasi; itu kekosongan cakupan, bukan pemetaan yang belum selesai.
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
  [`docs/17-audit-frontend.md`](../docs/17-audit-frontend.md).
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

- **Satu kotak, tiga macam jawaban.** Nama terdaftar, bahan aktif, dan gejala datang
  dalam tiga kelompok terpisah dengan judulnya masing-masing — bukan satu daftar datar.
  Ketiganya menjawab pertanyaan yang berbeda, dan mencampurnya dalam satu urutan
  memaksa pembaca menebak kenapa sebuah baris ada di situ. Urutannya gejala, bahan,
  lalu nama: kalau kueri memang cocok dengan apa yang terlihat di kebun, itu hampir
  pasti yang dimaksud — dan itu pula cabang bertaruhan paling tinggi.
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
- **Pintu depan tidak punya perender.** Tidak satu pun dari ketiga kelompok hasilnya
  dibuka di sini: produk dan bahan aktif diserahkan ke jalur 2 — pertanyaannya
  sama-sama "sebenarnya ini apa" — varietas ke jalur 4, dan gejala ke jalur 1, karena
  di sanalah blok "pastikan dulu" berada. Satu layar rincian, satu tempat — kalau
  disalin ke sini, keduanya akan menyimpang begitu salah satunya diperbaiki.
- **Yang bisa dicari disebut sebelum ada yang diketik.** Kotak kosong tidak mengatakan
  apa yang diterimanya, jadi layar menyebutnya lebih dulu: empat contoh yang tinggal
  disentuh — nama pupuk, bahan aktif, gejala di kebun, nama varietas — dan satu kalimat
  di bawah kotak yang menyebut ketiga macamnya sekaligus. Menunggu sampai hasilnya nol
  membuat orang menyimpulkan barangnya tidak terdaftar, padahal yang meleset cuma
  dugaannya tentang apa yang boleh diketik.
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

### Khusus jalur 1

- **Masuk lewat apa yang terlihat**, bukan nama hama. Yang panik tahu daunnya
  mengeriting ke atas; ia tidak tahu kata “trips”.
- **Mesin tidak menebak.** Tidak ada pengenal foto. Setiap dugaan dibuka dengan blok
  “pastikan dulu” berisi **dua ciri yang bisa diperiksa sendiri tanpa alat**. Empat belas
  dari dua puluh ciri menyebut OPT mana yang **terbantah** kalau hasilnya begitu; enam
  sisanya hanya menguatkan, dan layar tidak mengarang pembantahan untuk mereka. Dua ciri
  di antaranya uji yang benar-benar memutuskan — uji gelas untuk membedakan layu bakteri
  dari fusarium, dan kertas putih untuk membedakan trips dari virus kuning.
- **Merek diruntuhkan jadi bahan aktif + kadar.** Kesetaraan hanya benar pada pasangan
  itu: satu entitas “Abamektin” dipakai pada 33 kadar berbeda, 24 di antaranya g/L.
- **Dosis tidak pernah ditempel ke bahan.** Ia muncul per merek, karena dosis milik
  pendaftaran tiap produk — 26 merek Abamektin 18 g/L membawa 11 dosis yang berbeda.
- **Cabang nol produk adalah layar terpentingnya.** Untuk virus kuning keriting layar
  berkata *“jangan beli apa pun untuk ini”*, menyebut tiga tindakan yang memang
  berpengaruh, lalu menawarkan satu jalan keluar konkret ke vektornya.
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
