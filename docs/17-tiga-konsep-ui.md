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
> [`konsep-ui/konsep-2-cek-kandungan.html`](konsep-ui/konsep-2-cek-kandungan.html) ·
> [`konsep-ui/konsep-3-musim.html`](konsep-ui/konsep-3-musim.html)
>
> **Versi 0.2 — dirombak setelah jawaban lapangan masuk.** Lima dari tujuh pertanyaan
> Fase 1 sudah dijawab pemilik repo, dan jawaban pertama **membatalkan premis Konsep 2**.
> Rekamannya di bagian 5; rombakannya di bagian 2 dan 6.

---

## 0. Ringkasan

Tiga konsep ini **bukan tiga usulan yang setara**. Satu di antaranya melanjutkan apa yang
sudah ada, satu mengambil posisi yang belum dipegang siapa pun, dan satu menggambar lapis
yang baru dibangun dua gelombang lagi tetapi sudah mengikat skema hari ini.

Rekomendasinya ada di bagian 6, dan berbunyi: **bangun Konsep 2 sebagai produknya, dan
Konsep 1 sebagai distribusinya.** Konsep 3 dirancang sekarang justru karena ia dibangun
belakangan.

**Apa yang berubah di versi 0.2.** Jawaban lapangan membatalkan premis Konsep 2 — orang
tidak memeriksa nomor pendaftaran, melainkan **membaca kandungan** — jadi konsep itu
dirombak dari *cek nomor* jadi *cek kandungan*, dan berpindah berkas. Jawaban yang sama
melahirkan **lapis peer**, yang dibangun terbelah: menyebar di lapisan gratis, mengumpulkan
hanya di lapis eksekusi. Dan satu penilaian saya di versi 0.1 terbukti keliru — Konsep 1
bukan sekadar kolom masukan; ia lapis distribusinya, dan bagian 6 menyebut kenapa.

Dua hal berlaku di ketiganya, dan itu syarat kelulusan yang tidak bisa ditawar: **tiap layar
jawaban menyebut batasnya sendiri**, dan **layar yang menolak menjawab dirancang sebagus
layar yang menjawab.** Konsep 2 kini punya **tiga** layar penolakan, karena mode gagalnya
memang tiga.

---

## 1. Tesis, satu kalimat

| Konsep | Tesis |
|---|---|
| **1 · Kotak Tanya** | Kotak tanya adalah seluruh produknya: semua hal adalah pertanyaan → jawaban, kromnya minimal, dan tiap jawaban wajib menyebut apa yang tidak diketahuinya. |
| **2 · Cek Kandungan** | Layar pertama membaca **apa yang tercetak di kemasan** — angka hara, bahan aktif + kadar, atau nama dagang — lalu menjawab pertanyaan yang benar-benar dipegang orang di depan rak: *isi yang sama ini dijual dengan berapa merek lain, dan apakah yang tercetak itu memang yang terdaftar.* |
| **3 · Petak dan Musim** | Layar pertama adalah petak dan garis waktu musim; pertanyaan menempel pada momen dalam musim, dan **satu rekaman yang sama dibaca lima pihak dengan lima cara**. |

---

## 2. Banding

| | **1 · Kotak Tanya** | **2 · Cek Kandungan** | **3 · Petak dan Musim** |
|---|---|---|---|
| **Layar pertama** | Satu kotak kosong | Satu medan: angka hara, bahan aktif + kadar, atau nama | Daftar petak + rel musim |
| **Pengguna sasaran** | Siapa pun, tanpa akun | Petani & kios di depan rak (P4, P6) | Petugas lapang offtaker (P1) dan penyuluh (P2) |
| **Pembayar** | Tidak ada | Tidak ada | B2 — offtaker & ritel modern |
| **Kapabilitas yang didahulukan** | A1, A3, B1, B4 + **lapis peer (sebar)** | **C2** (dibaca ulang sebagai kandungan), C1, B1, B2, D4, D5 | E1–E5, D3, F1, G5 + **lapis peer (kumpul)** |
| **Gelombang** | 0 — butir 6 dan 7 | 0 — butir 1, 3, 4 | 2 · fase 3 |
| **Akun** | Tidak pernah | Tidak pernah | Ya — ia lapis eksekusi |
| **Bentuk jawaban yang dipakai** | Keempatnya | Fakta terdaftar · Hitungan · **Status & batas** | Hitungan · Status & batas |
| **Sengaja ditinggalkan** | Pemeriksaan kandungan; lapis eksekusi; harga | Diagnosis gejala; rekomendasi apa pun; **jalur lapor** (Q6: memang belum ada yang menerima); **lapis peer** — lihat bagian 7 | Lapisan gratis tanpa akun; pintu masuk reaktif; siapa pun yang tidak punya petak |
| **Layar penolakan yang digarap** | Virus kuning keriting — *"jangan beli apa pun untuk ini"* + antrean pertanyaan tak terjawab | **Tiga**: nama cocok tetapi kadar berbeda · komposisi tidak terdaftar sama sekali · nama dagang bukan nama terdaftar | *"Kirimi saya pengingat tanggalnya"* — dua dari empat langkah memang tidak punya tanggal |

---

## 3. Identitas rupa — dan alasannya

Ketiganya memakai token warna tiga keadaan (`:root` polos, `prefers-color-scheme`, dan
`[data-theme]`), ukuran sentuh minimal 44–56 px, dan teks besar berkontras tinggi. Yang
membedakan bukan itu.

| Konsep | Palet | Huruf | Tata letak |
|---|---|---|---|
| **1 · Kotak** | Hijau rumah — `#00442f` (yang sudah jadi `theme-color` repo), limau `#4c8a05`, kertas `#fcfcf7` | **Archivo** (judul & kendali) + **Atkinson Hyperlegible** (seluruh bacaan) | Satu kolom 35 rem. **Kotaknya tidak pernah berpindah** — di layar mana pun ia di posisi yang sama; yang berubah hanya apa yang tumbuh di bawahnya. |
| **2 · Cek Kandungan** | Sengaja **bukan** hijau rumah: tinta stempel `#16324f`, kertas dokumen `#ffffff`, kanvas dingin `#eceee9` | **Barlow Condensed** (kata putusan & label borang) + **IBM Plex Sans** (teks) + **IBM Plex Mono** (deret komposisi) | Loket: slab masukan di atas, lalu **pita putusan** yang *bentuknya* berbeda per keadaan — padat, bergaris miring, berbingkai tebal. |
| **3 · Musim** | Kertas *greenbar* — kertas cetak komputer berselang hijau pucat `#e6efe1`, pena teal `#0f5257` | **Chivo** (permukaan kerja) + **Newsreader** (hanya untuk bacaan bukti & laporan) | Rel musim yang menggulir mendatar di wadahnya sendiri, lalu satu petak terbuka jadi pasangan rencana–realisasi. |

Tiga keputusan rupa yang menanggung arti, bukan hiasan:

- **Atkinson Hyperlegible di Konsep 1** dipilih karena 80,24% pengguna digital di sektor
  ini berumur di atas 39 tahun. Ia huruf keterbacaan rendah-penglihatan, bukan selera.
- **Konsep 2 menolak memakai hijau rumah.** Kalau aksennya juga hijau, putusan
  "TERDAFTAR" kehilangan bunyinya. Hijau, amber, dan merah di konsep ini **hanya** dipakai
  sebagai putusan. Dan putusannya dibedakan **bentuk**, bukan cuma warna — layar yang cuma
  berbeda warna gagal dibaca di bawah matahari dan gagal total bagi yang buta warna.
  Rupanya dipertahankan utuh saat konsep ini dirombak, karena dunianya tidak berubah:
  tetap loket pemeriksaan dokumen. Yang berpindah cuma isi kolom mono — dari nomor
  pendaftaran ke deret komposisi, karena itulah yang kini dibandingkan angka demi angka.
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

### 4.2 Konsep 2 · Cek Kandungan

> **Taruhan lamanya sudah kalah.** Versi pertama bertaruh bahwa orang memeriksa **nomor
> pendaftaran** sebelum membayar. Q1 menjawab tidak. Yang di bawah ini taruhan baru,
> setelah premisnya diganti.

**Taruhannya:** yang dibaca orang di kemasan adalah **isinya**, dan mengetahui *isi yang
sama dijual dengan banyak nama* cukup untuk mengubah keputusan beli.

**Tanda ia salah:**

- Orang membaca kandungan tetapi **tidak membandingkannya dengan apa pun** — cukup melihat
  bahwa angkanya ada, lalu selesai. Kalau begitu, layar ini menambah langkah tanpa menambah
  keputusan.
- **Angka "205 merek lain" dibaca sebagai anjuran memilih yang termurah.** Itu kesimpulan
  yang sah ditarik pengguna, tetapi kalau layar terbaca *menganjurkannya*, netralitasnya
  jebol dari sisi yang berlawanan.
- Orang membaca "TERDAFTAR" sebagai jaminan isi karung. Kalau pita batas tidak terbaca,
  platform ini memberi rasa aman palsu pada karung yang berbohong tentang dirinya sendiri —
  yaitu bentuk pemalsuan yang justru paling merugikan. Kegagalan ini lebih buruk daripada
  tidak membangunnya sama sekali.
- Keputusan ternyata sudah selesai **sebelum orang sampai ke rak**, lewat rekomendasi peers.
  Q1 menyebut keduanya terjadi, jadi ini bukan salah-benar melainkan soal bobot — dan
  bobotnya menentukan apakah lapis peer atau lapis periksa yang lebih dulu diperdalam.

### 4.3 Konsep 3 · Petak dan Musim

**Taruhannya:** pencatatan dilakukan karena **pencatatnya sendiri ingin tahu** — buku kas
E5 — bukan karena pembeli hilir menuntutnya.

> **Q5 menaikkan taruhan ini, bukan menurunkannya.** Jawabannya: buku kas per petak
> *"kalaupun ada dalam bentuk buku kertas. Umumnya petani kecil mengandalkan ingatan saja."*
> Artinya E5 **kebiasaan baru**, bukan pemindahan bentuk — dan kebiasaan baru jauh lebih
> mahal diterima. Dugaan optimistis di versi pertama dokumen ini gugur di sini.

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

## 5. Jawaban lapangan — lima dari tujuh

Pemilik repo menjawab lima dari tujuh pertanyaan Fase 1. Ini **bukan** wawancara berskala:
satu narasumber, dan jawabannya menggambarkan kebiasaan umum yang ia amati. Bobotnya
sebagai pembatal jauh lebih kuat daripada sebagai pembenar — sebuah premis yang dibantah
satu orang yang tahu lapangan sudah cukup untuk dibongkar, sementara sebuah premis yang
dibenarkan satu orang belum cukup untuk dikunci.

| # | Pertanyaan | Jawaban | Dampak |
|---|---|---|---|
| **Q1** | Apakah petani atau kios memeriksa nomor pendaftaran sebelum membeli? | *"Tidak. Biasanya langsung lihat kemasan, cek kandungan. Umumnya rekomendasi dari peers. Khususnya petani. Kalau kios, tergantung dari insentif dari principal dan potensi demand."* | **Membatalkan premis Konsep 2** dan sekaligus cadangannya. Melahirkan lapis peer. |
| **Q2** | Nama lokal apa yang dipakai untuk OPT cabai? | *bule · patek · lodoh · layu · bercak daun · keriting daun* — berbeda tiap daerah | Enam benih pertama untuk **A3**. Masuk ke antrean Konsep 1, **tanpa pemetaan**. |
| **Q4** | Siapa yang menakar dosis di lahan? | *"keduanya"* — petani dan buruh semprot | Bahasa **D4/D5** harus jalan untuk keduanya sekaligus. |
| **Q5** | Apakah buku kas per petak sudah ada? | *"kalaupun ada dalam bentuk buku kertas. Umumnya petani kecil mengandalkan ingatan saja"* | **E5 kebiasaan baru**, bukan pemindahan bentuk. Menaikkan taruhan Konsep 3. |
| **Q6** | Apa yang terjadi saat mencurigai pupuk palsu? | *"berhenti di pemeriksaan"* | Konsep 2 **tidak** menumbuhkan alur lapor. Tidak ada tombol yang tidak menuju ke mana-mana. |

Q3 (berapa kali menghitung ongkos semusim) dan Q7 (jarak harga acuan ke harga petani)
belum dijawab.

> **Jawaban Q1 membatalkan dua hal sekaligus, dan yang kedua lebih penting.** Yang pertama
> jelas: nomor pendaftaran tidak diperiksa. Yang kedua lebih dalam — versi 0.1 dokumen ini
> sudah menyiapkan cadangan berbunyi *"kalau bukan petani, rancang untuk kios dan
> penyuluh"*. Cadangan itu ikut gugur, karena kalimat yang sama menyebut kios bergerak
> menurut **insentif principal**. Memindahkan pemeriksaan ke pihak yang dibayar untuk
> mendorong penjualan bukan penyelamatan; itu pembatalan yang lebih halus.
>
> Registri membenarkannya dari sisi yang sama sekali lain, dan ini yang paling meyakinkan:
> **667 dari 7.196 pupuk terdaftar tidak punya nomor pendaftaran sama sekali di registri.**
> Sembilan persen. Nomor bukan cuma tidak dibaca orang — untuk pupuk ia sering memang tidak
> ada. Dua bukti yang tidak saling bergantung menunjuk ke arah yang sama.

---

## 6. Rekomendasi

**Tetap Konsep 2 — tetapi pusat gravitasinya berpindah, dan satu penilaian saya di versi
0.1 terbukti keliru.**

Urutannya sekarang: **bangun Konsep 2 sebagai produknya, dan Konsep 1 sebagai
distribusinya.** Rancang Konsep 3 sekarang, bangun nanti.

**Pertama — saya keliru menyebut Konsep 1 "bukan sebenarnya sebuah konsep".** Versi 0.1
dokumen ini menurunkannya jadi kolom masukan. Q1 membantah itu: keputusan di lapangan
*"umumnya rekomendasi dari peers"*. Kalau mekanisme keputusannya penularan antarorang, maka
permukaan yang paling menentukan bukan yang paling pintar menjawab, melainkan yang
jawabannya **paling layak diteruskan**. Kartu teruskan di Konsep 1 adalah lapis distribusi
itu, dan tanpanya Konsep 2 tidak pernah sampai ke momen yang dirancanginya. Konsep 1 naik
dari pelengkap jadi prasyarat.

**Kedua — premis Konsep 2 gugur, tetapi penggantinya lebih kuat, bukan sekadar selamat.**
Yang lama bertaruh pada perilaku yang ternyata tidak terjadi (memeriksa nomor). Yang baru
menempel pada perilaku yang **dinyatakan sendiri terjadi**: *"langsung lihat kemasan, cek
kandungan."* Rancangan yang mengikuti kebiasaan yang sudah ada selalu lebih murah daripada
rancangan yang menuntut kebiasaan baru. Datanya juga memihak: **96,4%** pestisida dan
**71,3%** pupuk punya komposisi, dan **5.130** pupuk punya komposisi berangka. Sebaliknya
nomor pendaftaran ternyata primitif yang rapuh untuk pupuk — **667 dari 7.196 pupuk
terdaftar (9,3%) tidak mencantumkan nomornya sama sekali.** Registri sendiri, tanpa
wawancara mana pun, sudah menunjukkan bahwa nomor adalah kunci yang salah.

**Ketiga — keempat syarat "bermakna" tetap lolos, dan itu yang menahan rekomendasinya.**
Keputusannya jelas (jadi beli atau tidak), pemiliknya jelas (yang memegang karung), saatnya
jelas (di depan rak, sebelum bayar), dan salahnya ketahuan (kandungan cocok atau tidak).
Ditambah satu yang tidak dimiliki versi lama: ia menjawab pertanyaan yang **memang sedang
ditanyakan orang** — apakah saya membayar premi merek untuk isi yang sama — dan itu
menyambung langsung ke jalur 3.

**Keempat — Konsep 3 tidak berubah posisinya, tetapi taruhannya naik.** Q5 menyebut buku kas
per petak nyaris tidak ada dan petani kecil mengandalkan ingatan. E5 jadi kebiasaan baru,
bukan pemindahan bentuk. Itu tidak membatalkan Konsep 3 — ia tetap satu-satunya yang
menyentuh pembayar — tetapi menaikkan ongkos adopsinya, dan memperkuat alasan
**merancangnya sekarang, membangunnya nanti**.

> **Apa yang akan membatalkan rekomendasi ini sekarang.** Bukan lagi Q1 — itu sudah
> terjawab. Yang tersisa: kalau ternyata orang membaca kandungan tanpa membandingkannya
> dengan apa pun, Konsep 2 menambah langkah tanpa menambah keputusan, dan bobotnya harus
> pindah ke lapis peer di Konsep 1. Q3 dan Q7 masih kosong dan tidak menyentuh titik ini;
> yang menyentuhnya adalah pengamatan langsung di kios, bukan wawancara.

**Yang tidak direkomendasikan:** merilis ketiganya sebagai tiga permukaan terpisah. Tiga
pintu depan untuk satu registri adalah tiga tempat yang akan menyimpang diam-diam begitu
salah satunya diperbaiki — persis alasan `beranda.html` sengaja tidak punya perender
rincian sama sekali.

---

## 7. Lapis peer — dan bagaimana ia berdiri di sisi yang benar

Q1 menyebut keputusan datang dari **rekomendasi peers**. Itu lapis yang tak satu pun dari
tiga konsep punya. Membangunnya lalai berarti membangun sistem ulasan produk dengan nama
lain — dan itu anti-kapabilitas yang sudah ditolak: *peringkat adalah penempatan berbayar
yang menyamar*. Motifnya bukan hipotetis; kalimat Q1 yang sama menyebut kios bergerak
menurut **insentif principal**, jadi pihak beranggaran yang berkepentingan memengaruhi
rekomendasi **sudah ada di pasar ini**.

### 7.1 Keputusan: dua bacaan, dan keduanya dipakai — di tempat berbeda

Ada dua cara membaca "rekomendasi dari peers", dan keduanya benar sebagian:

**(b) Membuat jawaban platform layak diteruskan.** Percakapan peer sudah terjadi setiap
hari di grup WhatsApp. Yang kurang bukan tempatnya, melainkan **mutu bahan yang beredar di
sana**. → Dibangun di **Konsep 1**, sebagai *kartu yang bisa diteruskan*.

**(a) Kanal peer di dalam produk.** Orang menyumbang dan membaca pengalaman. →
Dibangun di **Konsep 3**, dan **hanya** di sana.

**Konsep 2 tidak mendapat lapis peer sama sekali, dan itu keputusan sadar.** Layar yang
seluruh tugasnya memeriksa label tidak boleh menampilkan "apa yang dipakai orang lain" di
sebelahnya. Begitu keduanya berdampingan, pemeriksa berubah jadi penganjur di layar yang
sama — dan itu persis kegagalan yang membuat 21 sistem pembanding tidak bisa memeriksa apa
pun. Meja periksa harus tetap sepi.

### 7.2 Ketegangan "tanpa akun" — diselesaikan dengan memisahkan, bukan berkompromi

Lapisan gratis menjanjikan tanpa akun dan tanpa data pribadi. Kontribusi tanpa identitas
adalah undangan terbuka untuk astroturf. Keduanya tidak bisa berdiri di satu layar.

**Putusannya: lapisan gratis hanya MENYEBAR, tidak pernah MENGUMPULKAN.**

| Lapis | Membaca | Menyumbang |
|---|---|---|
| Konsep 1 & 2 — gratis, tanpa akun | Ya | **Tidak ada permukaannya sama sekali** |
| Konsep 3 — lapis eksekusi, berakun | Ya | Ya, tetapi **hanya sebagai efek samping catatan musim** |

Ketegangannya tidak pernah perlu diselesaikan, karena kedua fungsinya tidak pernah bertemu
di satu tempat. Di lapisan gratis **tidak ada borang** "tulis pengalamanmu" — jadi tidak ada
sasaran astroturf di tempat yang paling murah untuk dibajak. Di lapis eksekusi, penyumbang
sudah punya petak, siklus, dan rekam jejak semusim; sumbangannya bukan pendapat yang
diketik, melainkan `Observation` yang memang sudah dicatat. Ini opsi **termahal** dari tiga
yang diusulkan, dan dipilih justru karena itu: yang mahal dibuat mahal pula dipalsukan.

Simpul alaminya **P3 — penyuluh swadaya dan ketua poktan**, bukan petani anonim. Itu
sejalan dengan [02-tiga-pasar.md](02-tiga-pasar.md), yang menempatkan mereka sebagai pemuka
pendapat lokal.

### 7.3 Empat syarat, dan di mana masing-masing ditegakkan

| Syarat | Ditegakkan bagaimana |
|---|---|
| **Pengalaman adalah pengamatan, bukan anjuran** | Sumbangan hanya lewat `Observation` dan `DeviationReason.signals` yang sudah ada di skema. Tidak ada medan bebas "saran". |
| **Agregasi berhenti di bahan aktif atau hara** | Panel Konsep 3 menampilkan *Abamektin*, *Spinetoram* — tidak pernah satu merek pun. `L3` apa adanya. **Ini sifat yang paling menentukan:** ia membuat lapis peer tidak bernilai bagi siapa pun yang ingin membeli penyebutan. |
| **Selalu bawa penyebutnya** | "4 dari 11 petak", tidak pernah "36%". Dan di bawah ambang minimum panelnya **menolak menampilkan angka sama sekali** — hari ini penyebutnya 1, jadi yang tampil penolakannya. |
| **Tidak pernah diurutkan menurut popularitas** | Urutan **abjad**. Begitu ada urutan, ada juara; juara bisa dibeli. |

Satu sifat tambahan yang tidak diminta tetapi menutup lubang nyata: **"tanpa aplikasi —
ambang belum terlampaui" ikut jadi baris.** Tanpa itu, panel terbaca seolah semua orang
menyemprot, dan yang memilih tidak menyemprot menghilang dari catatan bersama.

Kartu teruskan Konsep 1 lolos keempatnya dengan cara yang lebih sederhana: **tidak ada yang
bisa divoting di dalamnya.** Tidak ada bintang, suka, atau urutan populer — jadi tidak ada
papan skor yang bisa dibeli. Kartunya menyebut "72 bahan aktif" dan nol merek, batasnya
melekat di badan teks sehingga ikut terbaca di tangan kesepuluh, dan menyalinnya tidak
mengirim apa pun ke mana pun.

### 7.4 Risiko sisa yang tidak terselesaikan

Menyatakannya lebih berguna daripada mengklaim tuntas.

- **Agregat tingkat bahan aktif tetap menggerakkan permintaan.** Principal yang produknya
  pengusung dominan sebuah bahan aktif tetap diuntungkan, tanpa pernah disebut namanya.
  Penyebut dan larangan mengurutkan memperlambatnya, tidak menghapusnya.
- **Kartu yang sudah diteruskan tidak bisa ditarik.** Kalau teks gejala direvisi, kartu lama
  tetap beredar. Karena itu tanggal dan status draft dicetak di badan kartu.
- **Tidak ada yang mencegah orang mengetik ulang kartu palsu** yang menyebut merek. Yang
  bisa dilakukan cuma membuat kartu asli punya bentuk khas dan selalu menyebut batasnya.
- **Penyumbang di Konsep 3 tetap bisa berbohong** tentang petaknya sendiri. Yang menahannya
  bukan verifikasi, melainkan ongkos: berbohong menuntut memelihara catatan musim palsu
  sepanjang musim.

### 7.5 Usulan penajaman untuk dokumen 15 bagian 7

Baris anti-kapabilitas yang sekarang berbunyi *"Peringkat atau ulasan produk komersial —
Ditolak `L3`; dan peringkat adalah penempatan berbayar yang menyamar"* masih bisa dibaca
sempit, seolah hanya melarang bintang dan ulasan. Usulan penggantinya:

> | **Peringkat, ulasan, atau sinyal popularitas atas produk komersial** | Ditolak `L3`; dan peringkat adalah penempatan berbayar yang menyamar. Berlaku sama pada bentuk yang tidak menyebut dirinya peringkat: urutan menurut seberapa sering sesuatu dipakai, label "paling banyak dipilih", jumlah bintang, dan **agregasi pengalaman pengguna pada tingkat produk**. Pengalaman pengguna hanya boleh masuk sebagai `Observation`, diagregasi **paling rinci pada tingkat bahan aktif atau hara**, **selalu dengan penyebutnya**, **tidak pernah diurutkan menurut frekuensi**, dan **ditahan sama sekali di bawah penyebut minimum** — sebab penyebut kecil adalah tempat termurah untuk dibajak. |

Dokumen 15 ada di cabang lain, jadi kalimat ini **usulan**, bukan perubahan yang sudah
diterapkan.

---

## 8. Yang berbeda dari usulan awal, dan alasannya

Tiga tesis dipertahankan apa adanya; keduanya sudah memisahkan konsep pada sumbu yang
benar. Yang berubah bentuk pelaksanaannya:

| Yang diubah | Alasannya |
|---|---|
| Konsep 3 mendapat **lima** bacaan, bukan sekadar pandangan lapis eksekusi | "Satu rekaman, banyak bacaan" tidak terbukti oleh layar yang cuma menampilkan rencana dan realisasi. Ia terbukti kalau pembacanya bisa diganti di depan mata — dan tiap bacaan menyatakan apa yang **ditahan** darinya. |
| Konsep 2 **dirombak seluruhnya** dari "cek nomor" jadi "cek kandungan", dan berganti berkas jadi `konsep-2-cek-kandungan.html` | Q1 membatalkan premisnya. Rinciannya di bagian 5 dan 6. Berkasnya diganti nama karena tesisnya yang berganti, bukan kulitnya. |
| Batas jujur Konsep 2 **berpindah, tidak dihapus** | Yang lama: *nomor cocok* ⇒ nomornya terdaftar. Yang baru: *kandungan cocok* ⇒ **yang tercetak sesuai yang terdaftar** — tetap tidak membuktikan isi karung. Dan justru di sini bahayanya paling tajam, sebab kasus Rp3,3 triliun berbentuk karung yang berbohong pada labelnya sendiri. Karena itu batas ini tampil sebagai **pita di badan layar**, bukan catatan kaki. |
| Konsep 2 mendapat **tiga** layar penolakan | Mode gagalnya memang tiga, dan ketiganya berbeda tindakannya: kadar tidak cocok · komposisi tidak terdaftar · nama dagang bukan nama terdaftar. Yang pertama digarap paling penuh — ia tanda tangan kasus pupuk palsu. |
| Konsep 2 **tidak menumbuhkan alur lapor** | Q6: yang terjadi hari ini *"berhenti di pemeriksaan"*. Tombol lapor yang tidak menuju ke mana-mana lebih buruk daripada tidak ada tombol, dan layarnya mengatakan itu. |
| **Lapis peer dibangun**, terbelah dua | Q1 menyebut keputusan datang dari rekomendasi peers. Dibangun sebagai *sebar* di Konsep 1 dan *kumpul* di Konsep 3 — dan **sengaja tidak ada di Konsep 2**. Seluruh alasannya di bagian 7. |
| Bahasa D4/D5 diubah agar berlaku untuk **dua** pembaca | Q4: yang menakar *"keduanya"* — petani dan buruh semprot. Kalimatnya kini menyebut "siapa pun yang memegang tangki", dan menyarankan menuliskan hasil ukuran di botolnya supaya yang menakar besok bukan menebak. |
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

## 9. Isi yang dipakai — semuanya nyata

Tidak ada satu pun nomor pendaftaran, nama merek, nama OPT, atau angka cacah yang dikarang.
Seluruhnya disalin dari `spec/vocab/`, `spec/examples/`, dan angka yang sudah diterbitkan di
`docs/`.

| Dipakai di | Isi nyata |
|---|---|
| Konsep 1 | 5 dari 10 OPT cabai terkurasi beserta `symptoms` dan `distinguishing`-nya · 8 merek Abamektin 18 g/L untuk trips di cabai, berikut nomor pendaftaran dan dosis terdaftarnya yang berbeda-beda · LARBAN 500/50 EC (`01010120124476`) sebagai kasus klorpirifos berlingkup · Bioni 63 Ciherang Agritan · **enam nama lokal dari wawancara** (bule, patek, lodoh, layu, bercak daun, keriting daun), ditampilkan **tanpa pemetaan** |
| Konsep 2 | **205** pupuk bergrade 15-15-15 beserta sepuluh nama dan nomornya · **22** produk Deltametrin 25 g/L · empat grade yang benar-benar terdaftar dengan nama persis "PHONSKA" (15-8-10, 15-15-10, 15-10-15, 10-10-10) dan PHONSKA PLUS (`01.01.2021.538`) yang 15-15-15 · **667 dari 7.196** pupuk tanpa nomor pendaftaran |
| Konsep 3 | Petak "Tegal lor" 0,28 ha di Kabupaten Rembang · siklus cabai merah besar, varietas lokal "Lado F1" · empat langkah rencana beserta ketiga bentuk `timing`-nya · pengamatan trips 7 terhadap ambang 5 · simpangan pemupukan 45 kg N direncanakan, 29,9 kg N terealisasi, K₂O nol |

> **Sikap `G12` ikut pindah bersama premisnya.** Versi lama Konsep 2 memakai nomor karangan
> `31028128227329` — yang meniru bentuk `01020120227329` dan hanya berbeda tiga digit —
> untuk menunjukkan bahwa mesin tidak boleh menebak koreksi. Setelah dirombak, contohnya
> berubah tetapi sikapnya tidak: layar "kadar berbeda" menampilkan empat grade PHONSKA yang
> benar-benar terdaftar dan **menolak menyimpulkan** bahwa yang dipegang pengguna pasti
> PHONSKA PLUS, dan layar "tidak ada yang cocok" **menolak menawarkan angka registri
> terdekat**. Mengganti yang tidak cocok dengan yang terdekat justru menanam karangan
> sebagai fakta — persis yang ditolak `G12`.

---

## 10. Yang masih tidak bisa dijawab konsep mana pun

Tidak satu pun dari ketiga prototipe ini menghasilkan bukti tentang hal-hal berikut. Yang
mereka lakukan cuma membuat pertanyaannya bisa ditanyakan sambil menunjuk layar.

Lima pertanyaan sudah terjawab di bagian 5. Yang tersisa:

1. **Berapa kali dalam semusim seseorang menghitung ongkos** (Q3). Menentukan apakah D3
   punya momen, atau cuma terasa berguna saat ditanyakan.
2. **Berapa jarak sebenarnya antara harga acuan dan harga yang diterima petani** (Q7).
   [16-sumber-harga-komoditas.md](16-sumber-harga-komoditas.md) sudah menjawab sebagiannya
   dari sisi data — jaraknya terpasang di dalam definisi — tetapi besarannya di sentra
   beachhead belum terukur.
3. **Apakah petugas lapang offtaker ada dalam jumlah berarti di sentra cabai.** Seluruh
   Konsep 3 — dan seluruh T0 — berdiri di atas segmen yang ukurannya masih kosong.
4. **Apakah orang yang membaca kandungan benar-benar membandingkannya dengan sesuatu.**
   Pertanyaan baru yang lahir dari rombakan Konsep 2, dan ia **tidak bisa dijawab lewat
   wawancara** — hanya lewat pengamatan langsung di kios.
5. **Apakah kartu yang diteruskan bertahan utuh**, atau dipotong sampai tinggal
   kesimpulannya. Seluruh lapis peer Konsep 1 bertumpu pada ini, dan ia hanya bisa diukur
   dengan melihat apa yang benar-benar beredar di grup.
6. **Nama lokal mana yang menunjuk OPT mana** (lanjutan Q2). Enam nama sudah terkumpul,
   tetapi artinya berbeda tiap daerah — dan memetakannya salah lebih berbahaya daripada
   tidak memetakannya sama sekali.

Dan satu hal yang lebih mendasar: **tidak satu pun konsep bisa menunjukkan bahwa jawabannya
mengubah keputusan.** Metrik utara menuntut baseline, dan baseline hanya datang dari
lapangan. Layar yang bagus dan layar yang berguna dibedakan oleh data yang belum ada.

---

## 11. Catatan tentang keterbatasan

Delapan hal yang harus diketahui peninjau sebelum memakai dokumen ini sebagai dasar
keputusan.

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
4. **Panel lapis peer di Konsep 3 tidak punya data, dan mengatakannya sendiri.** Rancangan
   pertama panel itu memuat agregat "4 dari 11 petak" — angka yang **dikarang**, karena repo
   cuma punya satu petak contoh. Itu dibetulkan: panelnya kini menampilkan **penolakan**
   sebagai keadaan sebenarnya (penyebutnya 1), dan tabelnya tampil kosong dengan tanda "n
   petak" semata-mata sebagai rupa kolom. Ambang penyebut minimum yang lahir dari koreksi ini
   ternyata juga pertahanan anti-astroturf terbaik di seluruh lapis peer.
5. **Subtotal surat varietas bergantung cara pengelompokan.** Total 11.609 surat cocok
   persis dengan data, tetapi "5.822 pelepasan / 5.138 pendaftaran" di
   [03-enam-pintu.md](03-enam-pintu.md) mengelompokkan varian sebutan secara berbeda dari
   penghitungan mentah (5.801 "Pelepasan Varietas Tanaman" ditambah tiga varian pelepasan
   lain; empat varian "Pendaftaran"). Bukan salah, tetapi jangan dipakai sebagai dua angka
   yang berdiri sendiri.
6. **Tidak ada gambar produk yang disematkan, dan itu disengaja.** Seluruh 580 rekaman
   gambar di `gambar_produk/` bertanda `redistributable: false`. Prototipe yang
   menyematkannya akan melanggar hak pemegang pendaftaran.
7. **Dokumen 15 dan 16 belum ada di cabang ini.**
   [15-kapabilitas-lintas-pemangku.md](15-kapabilitas-lintas-pemangku.md) hidup di cabang
   `riset-kapabilitas`; [16-sumber-harga-komoditas.md](16-sumber-harga-komoditas.md) hidup di
   cabang `tema-satu-ikon`. Seluruh tautan ke keduanya baru bisa dibuka setelah cabangnya
   bertemu di `main`. Isi keduanya sudah dibaca dan dipakai — dokumen 15 sebagai sumber utama,
   dokumen 16 sebagai pembatal satu asumsi harga di bagian 6.
8. **Baris README ditaruh di ekor tabel, bukan setelah baris dokumen 16.** Baris
   `docs/16-sumber-harga-komoditas.md` belum ada di README cabang ini — ia ikut commit di
   cabang lain. Barisnya ditambahkan di ujung tabel supaya tidak menyentuh baris mana pun
   yang sudah ada; penggabungan cabang nanti mungkin perlu mengurutkannya ulang.

> **Cara memakai dokumen ini** — sama seperti dua dokumen yang mendahuluinya: ini usulan,
> bukan keputusan terkunci. Buka ketiga prototipenya, klik layar penolakannya lebih dulu —
> bukan layar jawabannya — lalu tanyakan apakah penolakan itu terasa seperti jasa atau
> seperti kegagalan. Jawaban atas pertanyaan itu yang paling menentukan apakah posisi
> *pemeriksa, bukan penganjur* bisa dipertahankan sama sekali.
