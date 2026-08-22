# Tiga Konsep UI — tesis yang berbeda, bukan kulit yang berbeda

> Rancangan · versi **0.1** · 22 Agustus 2026 · status **usulan**
> Tiga prototipe berfidelitas tinggi yang bisa diklik, masing-masing menjawab satu
> pertanyaan berbeda: **apa layar pertamanya, untuk siapa, dan keputusan mana yang
> didahulukan.**
>
> Turunan dari [15-kapabilitas-lintas-pemangku.md](15-kapabilitas-lintas-pemangku.md)
> bagian 5 dan 6, [03-enam-pintu.md](03-enam-pintu.md), [02-tiga-pasar.md](02-tiga-pasar.md),
> dan [`app/README.md`](../app/README.md). Sisi harga mengikuti
> [16-sumber-harga-komoditas.md](16-sumber-harga-komoditas.md), yang membatalkan satu
> asumsi di prototipe pertama — lihat bagian 6.
>
> Berkasnya: [`konsep-ui/konsep-1-kotak.html`](konsep-ui/konsep-1-kotak.html) ·
> [`konsep-ui/konsep-2-meja-periksa.html`](konsep-ui/konsep-2-meja-periksa.html) ·
> [`konsep-ui/konsep-3-musim.html`](konsep-ui/konsep-3-musim.html)

---

## 0. Ringkasan

Tiga konsep ini **bukan tiga usulan yang setara**. Satu di antaranya melanjutkan apa yang
sudah ada, satu mengambil posisi yang belum dipegang siapa pun, dan satu menggambar lapis
yang baru dibangun dua gelombang lagi tetapi sudah mengikat skema hari ini.

Rekomendasinya ada di bagian 5, dan berbunyi: **bangun Konsep 2, dengan kotak Konsep 1
sebagai cara masuknya — bukan sebagai konsep tandingannya.** Konsep 3 dirancang sekarang
justru karena ia dibangun belakangan.

Satu hal berlaku di ketiganya, dan itu syarat kelulusan yang tidak bisa ditawar: **tiap
layar jawaban menyebut batasnya sendiri**, dan **layar yang menolak menjawab dirancang
sebagus layar yang menjawab.** Ketiga prototipe memuat minimal satu layar penolakan yang
digarap penuh, bukan satu baris "tidak ditemukan".

---

## 1. Tesis, satu kalimat

| Konsep | Tesis |
|---|---|
| **1 · Kotak Tanya** | Kotak tanya adalah seluruh produknya: semua hal adalah pertanyaan → jawaban, kromnya minimal, dan tiap jawaban wajib menyebut apa yang tidak diketahuinya. |
| **2 · Meja Periksa** | Layar pertama bukan pertanyaan melainkan **pemeriksaan** — yang di tanganmu ini terdaftar atau tidak, sebelum uang keluar — karena posisi yang belum dipegang siapa pun adalah *pemeriksa*, bukan *penganjur*. |
| **3 · Petak dan Musim** | Layar pertama adalah petak dan garis waktu musim; pertanyaan menempel pada momen dalam musim, dan **satu rekaman yang sama dibaca lima pihak dengan lima cara**. |

---

## 2. Banding

| | **1 · Kotak Tanya** | **2 · Meja Periksa** | **3 · Petak dan Musim** |
|---|---|---|---|
| **Layar pertama** | Satu kotak kosong | Kolom nomor pendaftaran | Daftar petak + rel musim |
| **Pengguna sasaran** | Siapa pun, tanpa akun | Petani & kios di depan karung (P4, P6) — mungkin juga penyuluh (P2) | Petugas lapang offtaker (P1) dan penyuluh (P2) |
| **Pembayar** | Tidak ada | Tidak ada | B2 — offtaker & ritel modern |
| **Kapabilitas yang didahulukan** | A1, A3, B1, B4 | **C2**, C1, B1, B2, D4, D5 | E1–E5, D3, F1, G5 |
| **Gelombang** | 0 — butir 6 dan 7 | 0 — butir 1, 3, 4 | 2 · fase 3 |
| **Akun** | Tidak pernah | Tidak pernah | Ya — ia lapis eksekusi |
| **Bentuk jawaban yang dipakai** | Keempatnya | Fakta terdaftar · Hitungan · **Status & batas** | Hitungan · Status & batas |
| **Sengaja ditinggalkan** | Pemeriksaan keaslian; seluruh lapis eksekusi; harga | Diagnosis gejala; rekomendasi apa pun; jalur lapor yang benar-benar mengirim | Lapisan gratis tanpa akun; pintu masuk reaktif; siapa pun yang tidak punya petak |
| **Layar penolakan yang digarap** | Virus kuning keriting — *"jangan beli apa pun untuk ini"* + antrean pertanyaan tak terjawab | Nomor berbentuk sah yang tidak ada di registri — **dua penjelasan, dan mesin menolak memilih** | *"Kirimi saya pengingat tanggalnya"* — dua dari empat langkah memang tidak punya tanggal |

---

## 3. Identitas rupa — dan alasannya

Ketiganya memakai token warna tiga keadaan (`:root` polos, `prefers-color-scheme`, dan
`[data-theme]`), ukuran sentuh minimal 44–56 px, dan teks besar berkontras tinggi. Yang
membedakan bukan itu.

| Konsep | Palet | Huruf | Tata letak |
|---|---|---|---|
| **1 · Kotak** | Hijau rumah — `#00442f` (yang sudah jadi `theme-color` repo), limau `#4c8a05`, kertas `#fcfcf7` | **Archivo** (judul & kendali) + **Atkinson Hyperlegible** (seluruh bacaan) | Satu kolom 35 rem. **Kotaknya tidak pernah berpindah** — di layar mana pun ia di posisi yang sama; yang berubah hanya apa yang tumbuh di bawahnya. |
| **2 · Meja Periksa** | Sengaja **bukan** hijau rumah: tinta stempel `#16324f`, kertas dokumen `#ffffff`, kanvas dingin `#eceee9` | **Barlow Condensed** (kata putusan & label borang) + **IBM Plex Sans** (teks) + **IBM Plex Mono** (nomor) | Loket: slab masukan di atas, lalu **pita putusan** yang *bentuknya* berbeda per keadaan — padat, bergaris miring, berbingkai tebal. |
| **3 · Musim** | Kertas *greenbar* — kertas cetak komputer berselang hijau pucat `#e6efe1`, pena teal `#0f5257` | **Chivo** (permukaan kerja) + **Newsreader** (hanya untuk bacaan bukti & laporan) | Rel musim yang menggulir mendatar di wadahnya sendiri, lalu satu petak terbuka jadi pasangan rencana–realisasi. |

Tiga keputusan rupa yang menanggung arti, bukan hiasan:

- **Atkinson Hyperlegible di Konsep 1** dipilih karena 80,24% pengguna digital di sektor
  ini berumur di atas 39 tahun. Ia huruf keterbacaan rendah-penglihatan, bukan selera.
- **Konsep 2 menolak memakai hijau rumah.** Kalau aksennya juga hijau, putusan
  "TERDAFTAR" kehilangan bunyinya. Hijau, amber, dan merah di konsep ini **hanya** dipakai
  sebagai putusan. Dan putusannya dibedakan **bentuk**, bukan cuma warna — layar yang cuma
  berbeda warna gagal dibaca di bawah matahari dan gagal total bagi yang buta warna.
- **Pergantian huruf di Konsep 3 adalah penanda, bukan variasi.** Saat rekaman yang sama
  dibaca sebagai *bukti* atau *laporan*, ia berganti ke serif — menandai bahwa yang sedang
  dibaca adalah dokumen, bukan layar kerja. Rujukan *greenbar* dipilih karena persis itulah
  yang dilakukan konsep ini: satu cetakan, banyak pembaca.

---

## 4. Apa yang tiap konsep taruhkan

Bagian terpenting dokumen ini. Konsep tanpa taruhan yang dinyatakan adalah konsep yang
tidak bisa dibuktikan salah.

### 4.1 Konsep 1 · Kotak Tanya

**Taruhannya:** pertanyaan adalah unit permintaan yang benar, dan satu kotak sanggup
merutekan cukup baik **tanpa kamus nama lokal**.

**Tanda ia salah:**

- Penelusuran naik terus tetapi jawaban tidak berubah — sinyal gagal kelompok A di
  [15-kapabilitas-lintas-pemangku.md](15-kapabilitas-lintas-pemangku.md) bagian 8, dan
  artinya pintunya yang salah.
- Sebagian besar penelusuran berakhir di layar nol. Kalau begitu, **A3 kamus nama lokal
  adalah prasyarat, bukan pelengkap** — dan urutan gelombang 0 harus dibalik.
- Pesaing terdekat di pintu masuk berbentuk persis ini, dan berbasis WhatsApp. Kalau
  perbandingannya dimenangkan kenyamanan, kotak ini kalah di lapangan yang bukan
  miliknya.

### 4.2 Konsep 2 · Meja Periksa

**Taruhannya:** pemeriksaan benar-benar terjadi **sebelum uang keluar**, dan yang memeriksa
adalah orang yang memegang karung.

**Tanda ia salah:**

- Pertanyaan pertama Fase 1 dijawab *"keputusan sudah selesai sebelum karung dilihat"*.
  Kalau begitu, C2 harus dirancang untuk **kios dan penyuluh**, bukan petani — dan seluruh
  urutan gelombang 0 berubah. Ini risiko terbesar dari ketiga konsep.
- Lonjakan hasil "tidak ditemukan" yang ternyata **registri basi**, bukan pemalsuan naik.
  Keduanya menghasilkan angka yang sama, dan angkanya sendiri tidak memutuskan yang mana.
- Orang membaca "TERDAFTAR" sebagai jaminan isi. Kalau pita "Tapi —" tidak terbaca,
  platform ini justru **membantu pemalsu yang menyalin nomor sah**. Itu kegagalan yang
  lebih buruk daripada tidak membangunnya sama sekali.

### 4.3 Konsep 3 · Petak dan Musim

**Taruhannya:** pencatatan dilakukan karena **pencatatnya sendiri ingin tahu** — buku kas
E5 — bukan karena pembeli hilir menuntutnya.

**Tanda ia salah:**

- Kurang dari **70%** tugas terjadwal tercatat → yang salah produknya, bukan segmennya.
- Kurang dari **30%** simpangan punya alasan substantif → datanya tidak jujur, dan seluruh
  klaim ke pembayar kehilangan dasar.
- Keduanya adalah ambang pembatalan yang sudah tertulis di
  [02-tiga-pasar.md](02-tiga-pasar.md) bagian 7, dan berlaku apa adanya di sini.
- Tanda ketiga yang lebih halus: kalau pencatatan hanya jalan selama tim mendampingi, yang
  terbukti bukan produknya melainkan pendampingannya — dan itu pola kegagalan ketiga di
  [15-kapabilitas-lintas-pemangku.md](15-kapabilitas-lintas-pemangku.md) bagian 3.3.

---

## 5. Rekomendasi

**Bangun Konsep 2. Pakai kotak Konsep 1 sebagai cara masuk ke dalamnya, bukan sebagai
konsep tandingannya. Rancang Konsep 3 sekarang, bangun nanti.**

Tiga alasan, diurutkan menurut kekuatannya.

**Pertama — Konsep 1 bukan sebenarnya sebuah konsep, melainkan sebuah kolom masukan.**
Kotaknya sudah ada dan sudah berjalan di [`app/beranda.html`](../app/beranda.html).
Membangunnya "lebih jauh" berarti membangun kotak pencarian yang bersaing dengan asisten
WhatsApp di lapangan yang mereka kuasai — kenyamanan. Nilai kotak itu ada pada
**perutean**, bukan pada penjawaban, dan A1 memang dirumuskan begitu: *merutekan* ke jalur,
bukan menjawab sendiri. Menjadikannya konsep utuh menaikkan taruhannya ke tempat yang salah.

**Kedua — C2 adalah satu-satunya kapabilitas di seluruh daftar yang memberi platform ini
posisi, bukan fitur.** Datanya sudah dipegang, tidak menuntut satu baris data baru, tidak
menuntut akun, dan tidak ada satu pun dari 21 sistem yang dibandingkan memegangnya. Ia
memenuhi keempat syarat "bermakna" sekaligus: keputusannya jelas (jadi beli atau tidak),
pemiliknya jelas (yang memegang karung), saatnya jelas (di kios, sebelum bayar), dan
salahnya ketahuan (nomor cocok atau tidak). Tidak ada kapabilitas lain di dokumen 15 yang
lolos keempatnya sebersih ini.

**Ketiga — Konsep 3 melayani pengguna beachhead yang sebenarnya (P1) dan satu-satunya
pembayar yang sudah dipilih (B2), tetapi ia gelombang 2.** Itu ketegangan yang nyata dan
tidak boleh diratakan: konsep yang paling dekat ke uang adalah konsep yang paling jauh dari
bisa dirilis. Jalan keluarnya bukan mempercepatnya, melainkan **merancangnya sekarang**
supaya keputusan yang mengikat skema — identitas petak tanpa geometri (G5), tiga bentuk
`timing`, `data_classification` per langkah — diambil sebelum ada data yang harus dimigrasi.
Prototipe ketiga ada justru untuk itu.

> **Rekomendasi ini menyandera dirinya sendiri pada satu jawaban.** Kalau wawancara Fase 1
> menjawab bahwa pemeriksaan nomor **tidak** terjadi sebelum pembayaran, Konsep 2 tidak
> gugur — tetapi penggunanya berpindah dari petani ke kios dan penyuluh, bahasanya berubah,
> dan urutan gelombang 0 harus disusun ulang. Yang tidak berubah: ia tetap satu-satunya
> ruang kosong yang tidak ditempati siapa pun.

**Yang tidak direkomendasikan:** merilis ketiganya sebagai tiga permukaan terpisah. Tiga
pintu depan untuk satu registri adalah tiga tempat yang akan menyimpang diam-diam begitu
salah satunya diperbaiki — persis alasan `beranda.html` sengaja tidak punya perender
rincian sama sekali.

---

## 6. Yang berbeda dari usulan awal, dan alasannya

Tiga tesis dipertahankan apa adanya; keduanya sudah memisahkan konsep pada sumbu yang
benar. Yang berubah bentuk pelaksanaannya:

| Yang diubah | Alasannya |
|---|---|
| Konsep 3 mendapat **lima** bacaan, bukan sekadar pandangan lapis eksekusi | "Satu rekaman, banyak bacaan" tidak terbukti oleh layar yang cuma menampilkan rencana dan realisasi. Ia terbukti kalau pembacanya bisa diganti di depan mata — dan tiap bacaan menyatakan apa yang **ditahan** darinya. |
| Konsep 2 mendapat **dua** layar penolakan, bukan satu | Penolakan yang paling penting bukan "tidak ditemukan", melainkan **"TERDAFTAR — tapi itu tidak membuktikan isi karungmu benar"**. Penolakan kedua itu menempel justru pada layar yang berhasil, dan di situlah ia paling mudah diabaikan. |
| Kalkulator D5 di Konsep 2 **menolak menghitung** untuk bahan berbentuk tepung | Menakar gram dengan tutup botol menuntut berat jenis, dan berat jenis tidak ada di registri. Versi pertama prototipe ini membagi gram dengan mililiter — keliru, dan persis jenis kekeliruan yang melukai orang. Sekarang cabang tepung menolak dan menunjuk timbangan. |
| Layar "tidak sanggup" Konsep 1 memuat **antrean pertanyaan tak terjawab** (B4) | B4 nyaris gratis dan mengubah biaya riset jadi keluaran produk. Ia juga yang membuat layar penolakan terasa seperti kontribusi, bukan jalan buntu. |
| Baris harga di antrean Konsep 1 **dibetulkan setelah dokumen 16 terbit** | Versi pertama menulis *"acuan produsen bisa dipinjam dari Panel Harga Bapanas"* — mengikuti C4 di dokumen 15. [16-sumber-harga-komoditas.md](16-sumber-harga-komoditas.md) membatalkan keduanya sekaligus, dan prototipenya mengikuti dokumen 16. Rinciannya di bawah. |

> **Satu asumsi prototipe dibatalkan di tengah jalan, dan layarnya diubah mengikuti temuan.**
> [15-kapabilitas-lintas-pemangku.md](15-kapabilitas-lintas-pemangku.md) menetapkan C4
> **PINJAM + BANGUN** dengan Panel Harga Pangan Bapanas sebagai calon pinjaman, dan Konsep 1
> semula menuliskannya begitu di antrean pertanyaan tak terjawab.
> [16-sumber-harga-komoditas.md](16-sumber-harga-komoditas.md) menemukan dua hal yang
> membatalkannya: **panelnya mati** — halaman pemeliharaan, seluruh endpoint menjawab 401,
> dan Wayback menunjukkan 502 sejak Oktober 2025 — dan, lebih menentukan, **yang dicatat
> negara sebagai "harga produsen" sebenarnya harga beli pengumpul.** Pada tingkat produsen
> PIHPS, "pasar" adalah nama orang: Kabupaten Karawang, salah satu lumbung padi terbesar,
> punya **satu** responden.
>
> Akibatnya untuk rancangan layar: jarak antara harga acuan dan harga yang diterima petani
> **terpasang di dalam definisinya**, bukan celah cakupan yang bisa dirapatkan. Karena itu
> baris harga di Konsep 1 kini berbunyi bahwa harga yang benar-benar diterima petani
> **tidak ada sumbernya**, dan hanya setoran petani yang bisa menutupnya. Ini persis bentuk
> yang seharusnya: pertanyaan yang tidak bisa dijawab dicatat beserta **sebab** ia tidak bisa
> dijawab, bukan beserta janji pinjaman yang ternyata tidak ada.
>
> Konsekuensi lanjutan yang belum digambar di prototipe mana pun: kalau harga suatu saat
> tampil, dokumen 16 bagian 7 sudah menetapkan aturan tayangnya — pisahkan patokan regulasi,
> survei pemerintah, dan setoran petani; tampilkan jumlah responden sebagai penanda
> keyakinan; dan jangan pernah menayangkan harga dunia sendirian.

---

## 7. Isi yang dipakai — semuanya nyata

Tidak ada satu pun nomor pendaftaran, nama merek, nama OPT, atau angka cacah yang dikarang.
Seluruhnya disalin dari `spec/vocab/`, `spec/examples/`, dan angka yang sudah diterbitkan di
`docs/`.

| Dipakai di | Isi nyata |
|---|---|
| Konsep 1 | 5 dari 10 OPT cabai terkurasi beserta `symptoms` dan `distinguishing`-nya · 8 merek Abamektin 18 g/L untuk trips di cabai, berikut nomor pendaftaran dan dosis terdaftarnya yang berbeda-beda · LARBAN 500/50 EC (`01010120124476`) sebagai kasus klorpirifos berlingkup · Bioni 63 Ciherang Agritan |
| Konsep 2 | MANTRA 80 WP (`01020120227329`, Mankozeb 80%, CV. SARAREA PANEN RAYA) · PHONSKA (`01.01.2022.1248`, 15-8-10, Petrokimia Gresik) · nomor karangan `31028128227329` yang memang tertangkap di jalur panen gambar repo ini |
| Konsep 3 | Petak "Tegal lor" 0,28 ha di Kabupaten Rembang · siklus cabai merah besar, varietas lokal "Lado F1" · empat langkah rencana beserta ketiga bentuk `timing`-nya · pengamatan trips 7 terhadap ambang 5 · simpangan pemupukan 45 kg N direncanakan, 29,9 kg N terealisasi, K₂O nol |

> **Satu nomor sengaja dipakai sebagai contoh justru karena ia karangan.**
> `31028128227329` meniru bentuk `01020120227329` dan hanya berbeda tiga digit — panjangnya
> sama, polanya sama, jadi ia lolos pemeriksaan panjang maupun pola. Konsep 2 menampilkan
> keduanya berdampingan karakter demi karakter, lalu **menolak menggantinya untuk pengguna**:
> menganggap nomor yang tidak cocok sebagai salah baca lalu menukarnya dengan nomor registri
> justru menanam karangan sebagai fakta. Itu sikap yang sama dengan aturan `G12`.

---

## 8. Yang tidak bisa dijawab konsep mana pun tanpa wawancara Fase 1

Tidak satu pun dari ketiga prototipe ini menghasilkan bukti tentang hal-hal berikut. Yang
mereka lakukan cuma membuat pertanyaannya bisa ditanyakan sambil menunjuk layar.

1. **Siapa yang benar-benar memegang keputusan pupuk dan pestisida di petak** — petani atau
   kios. Ketiga konsep mengandaikan jawaban yang berbeda, dan hanya satu yang bisa benar.
2. **Apakah pemeriksaan nomor terjadi sebelum uang keluar.** Seluruh Konsep 2 berdiri di
   atas ini.
3. **Nama lokal apa yang sebenarnya dipakai** untuk sepuluh OPT cabai terkurasi. Tanpa ini,
   kotak Konsep 1 hanya bisa dipakai orang yang sudah tahu jawabannya.
4. **Berapa kali dalam semusim seseorang menghitung ongkos**, dan siapa yang menakar dosis
   di lahan — petani sendiri atau buruh semprot. Yang kedua menentukan bahasa D4 dan D5.
5. **Apakah buku kas per petak sudah ada dalam bentuk apa pun.** Kalau ya, E5 adalah
   pemindahan bentuk; kalau tidak, ia kebiasaan baru — dan itu dua produk yang berbeda.
6. **Apa yang terjadi hari ini ketika seseorang mencurigai pupuk palsu.** Menentukan apakah
   Konsep 2 berhenti di pemeriksaan atau berlanjut ke pelaporan. Prototipe ini berhenti, dan
   mengatakannya.
7. **Apakah petugas lapang offtaker ada dalam jumlah berarti di sentra cabai.** Seluruh
   Konsep 3 — dan seluruh T0 — berdiri di atas segmen yang ukurannya masih kosong.

Dan satu hal yang lebih mendasar: **tidak satu pun konsep bisa menunjukkan bahwa jawabannya
mengubah keputusan.** Metrik utara menuntut baseline, dan baseline hanya datang dari
lapangan. Layar yang bagus dan layar yang berguna dibedakan oleh data yang belum ada.

---

## 9. Catatan tentang keterbatasan

Enam hal yang harus diketahui peninjau sebelum memakai dokumen ini sebagai dasar keputusan.

1. **Ini prototipe tinjauan, bukan implementasi.** Perutean pencarian di Konsep 1 berjalan
   di atas segelintir rekaman yang ditanam di dalam berkas, bukan di atas `spec/indeks/`.
   Anggaran nyata repo — 2–4 berkas per penelusuran, tidak satu pun melewati 48 KB —
   **dihormati sebagai batasan rancangan**, tetapi tidak diukur ulang di sini karena
   prototipenya satu berkas mandiri.
2. **`spec/indeks/` tidak dibangun saat prototipe ini disusun.** Seluruh isi ditarik
   langsung dari `spec/vocab/` dan `spec/examples/`. Sebelum jadi implementasi, angkanya
   harus ditarik ulang dari indeks — termasuk `meta.tidakAda`, yang memuat daftar lubang
   datanya sendiri.
3. **Dua petak pada layar pertama Konsep 3 adalah pengisi bentuk.** Hanya "Tegal lor" yang
   punya rekaman lengkap di `spec/examples/`; "Sawah kidul" dan "Tegal wetan" diberi bentuk
   yang sama semata-mata untuk menunjukkan rupa daftar, dan angkanya tidak berasal dari
   mana pun.
4. **Subtotal surat varietas bergantung cara pengelompokan.** Total 11.609 surat cocok
   persis dengan data, tetapi "5.822 pelepasan / 5.138 pendaftaran" di
   [03-enam-pintu.md](03-enam-pintu.md) mengelompokkan varian sebutan secara berbeda dari
   penghitungan mentah (5.801 "Pelepasan Varietas Tanaman" ditambah tiga varian pelepasan
   lain; empat varian "Pendaftaran"). Bukan salah, tetapi jangan dipakai sebagai dua angka
   yang berdiri sendiri.
5. **Tidak ada gambar produk yang disematkan, dan itu disengaja.** Seluruh 580 rekaman
   gambar di `gambar_produk/` bertanda `redistributable: false`. Prototipe yang
   menyematkannya akan melanggar hak pemegang pendaftaran.
6. **Dokumen 15 dan 16 belum ada di cabang ini.**
   [15-kapabilitas-lintas-pemangku.md](15-kapabilitas-lintas-pemangku.md) hidup di cabang
   `riset-kapabilitas`; [16-sumber-harga-komoditas.md](16-sumber-harga-komoditas.md) hidup di
   cabang `tema-satu-ikon`. Seluruh tautan ke keduanya baru bisa dibuka setelah cabangnya
   bertemu di `main`. Isi keduanya sudah dibaca dan dipakai — dokumen 15 sebagai sumber utama,
   dokumen 16 sebagai pembatal satu asumsi harga di bagian 6.
7. **Baris README ditaruh di ekor tabel, bukan setelah baris dokumen 16.** Baris
   `docs/16-sumber-harga-komoditas.md` belum ada di README cabang ini — ia ikut commit di
   cabang lain. Barisnya ditambahkan di ujung tabel supaya tidak menyentuh baris mana pun
   yang sudah ada; penggabungan cabang nanti mungkin perlu mengurutkannya ulang.

> **Cara memakai dokumen ini** — sama seperti dua dokumen yang mendahuluinya: ini usulan,
> bukan keputusan terkunci. Buka ketiga prototipenya, klik layar penolakannya lebih dulu —
> bukan layar jawabannya — lalu tanyakan apakah penolakan itu terasa seperti jasa atau
> seperti kegagalan. Jawaban atas pertanyaan itu yang paling menentukan apakah posisi
> *pemeriksa, bukan penganjur* bisa dipertahankan sama sekali.
