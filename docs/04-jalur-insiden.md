# Jalur Insiden

> Rancangan · permukaan reaktif · jalur 1 · masuk dari gejala
> Untuk orang yang baru melihat masalah di depan mata. Tanpa akun, tanpa petak terdaftar, tanpa rencana — tiga ketukan sampai jawaban.
> Angka **dari registri pascapenggabungan ejaan zat** (`1a0f077`, `04b91c6`)
> **dan penyatuan komoditas serumpun serta OPT kembar** — 488 komoditas jadi 274,
> 1.370 OPT jadi 778
> **Dimutakhirkan lagi sesudah penyatuan keluarga ejaan zat** (23 Agustus 2026):
> 477 entitas bahan aktif yang sebenarnya 184 bahan jadi 184, sehingga bahan aktif
> hidup turun 1.399 → 1.106
>
> Diekstrak dari dokumen konsep HTML, 20 Agustus 2026. Isi, angka, dan tabelnya
> utuh; simulasi yang bisa diklik tidak ikut — alurnya ditulis ulang sebagai teks.
>
> Jalur 1 dari [03-enam-pintu.md](03-enam-pintu.md). Jalur 2 ada di
> [05-jalur-produk.md](05-jalur-produk.md).

---

## 1. Kenapa bentuknya reaktif

Keputusan pestisida memang reaktif: masalah muncul, dan orang butuh jawaban
sekarang. Momen itu bukan masalah yang harus diatasi — ia titik masuk terbaik yang
akan pernah dimiliki platform ini, karena urgensi menciptakan kesediaan terlibat
yang tidak bisa dibuat-buat oleh fitur perencanaan mana pun, dan karena ia tidak
menuntut persiapan apa pun.

Momen panik punya empat pertanyaan berurutan. Registri menjawab tiga, dan gagal
total di satu — sayangnya yang pertama.

| Pertanyaan | Jawaban data |
|---|---|
| **Ini apa?** | **Nyaris nol.** Dari 654 OPT registri tidak satu pun punya deskripsi gejala; yang ada hanya OPT terkurasi, seluruhnya bertekst — daftarnya per komoditas di [14-tinjauan-gejala.md](14-tinjauan-gejala.md) |
| **Boleh pakai apa?** | Kuat — 23.058 penggunaan berlabel, 96,1% tertaut OPT |
| **Dosisnya berapa?** | Kuat — 80% membawa dosis |
| **Gimana caranya?** | Sebagian — 23 cara aplikasi, tanpa panduan teknik |

Bahkan `synonyms` pada OPT registri, yang semula diduga memuat nama lokal, ternyata
berisi salah ketik registri — "Gulma Bedaun Lebar", "Guma Berdaun Lebar". Jalur
masuk lewat kosakata petani sendiri juga belum ada.

---

## 2. Empat keputusan rancangan

- **Masuk lewat apa yang terlihat, bukan nama hama.** Petani yang panik tidak tahu
  kata "trips". Ia tahu daunnya mengeriting ke atas. Komoditas yang sudah dikurasi punya
  pintunya, seluruhnya bertekst; yang belum tidak punya pintu sama sekali.
- **Mesin tidak menebak, orang yang memilih.** Tidak ada pengenal foto. Diagnosis
  salah yang percaya diri menghasilkan semprotan salah — uang hilang, tanaman tetap
  mati, kepercayaan habis di kejadian pertama. Ini juga bagian sistem yang paling
  dekat ke tanggung jawab hukum.
- **Runtuhkan merek jadi bahan aktif dan kadarnya.** 246 produk terdaftar untuk
  trips di cabai, tetapi isinya hanya 60 bahan aktif — yang, karena satu bahan
  dipakai pada banyak kadar, jatuh jadi 159 kartu bahan+kadar. Menampilkan 246 nama
  dagang adalah menyalin kebingungan kios ke dalam layar.
- **Informasi negatif didahulukan.** Apa yang dilarang, dan apa yang tidak akan
  menolong. Ini yang paling bernilai bagi petani, dan justru paling kecil risiko
  hukumnya.

---

## 3. Tiga kekeliruan pada kartu bahan

Rancangan pertama menyembunyikan nama merek dan mengelompokkan hanya menurut bahan
aktif. Data membuktikan keduanya salah — dan yang ketiga menyangkut keselamatan.

**1 · Merek disembunyikan**

Petani membeli merek, bukan bahan aktif. Menyebut "abamektin" di kios akan dijawab
"yang mana? ada 65". Menyembunyikan merek menyerahkan langkah terakhir ke pihak yang
hidup dari margin penjualan — jadi justru **kurang** netral, bukan lebih. `L3` tidak
melarang ini: aturan itu mengikat langkah protokol, bukan tampilan registri.

**2 · Dikelompokkan per bahan saja**

Satu entitas `op:sub:00000007` "Abamektin" ternyata dipakai pada **33 kadar
berbeda** — 24 di antaranya dalam g/L, sisanya dalam persen. Kesetaraan hanya
benar pada pasangan **bahan + kadar**, bukan pada nama bahannya.

**3 · Dosis ditempel ke bahan**

Kekeliruan paling berbahaya. Dari 26 produk berisi Abamektin 18 g/L yang terdaftar
untuk trips di cabai, dosis terdaftarnya berbeda-beda: 0,375 · 0,5 · 0,75 · 1 · 1,5 ·
1–2 · 2 ml/l — dan satu produk memakai satuan yang sama sekali lain, `1 l/ha`. **Dosis milik pendaftaran tiap produk, bukan
milik bahannya.** Kartu lama menampilkan satu rentang tanpa kadar; itu bisa melukai
orang.

Bentuk yang benar: kelompok adalah **bahan aktif + kadar**, daftar merek bersarang di
bawahnya, urutan diumumkan di layar, dan tiap merek membawa nomor pendaftaran, masa
berlaku, serta dosisnya sendiri.

---

## 4. Kasus nol produk: layar terpenting di jalur ini

Virus kuning keriting punya gejala yang jelas dan **nol produk terdaftar**. Itu bukan
lubang data — itu kebenaran agronomi: tidak ada pestisida yang menyembuhkan virus.

Petani datang ke kios dengan daun menguning. **Kios akan menjual sesuatu** — hampir
pasti insektisida. Uang keluar, tanaman tetap mati. Di sinilah platform punya nilai
yang tidak bisa ditandingi siapa pun yang hidup dari margin penjualan: kemampuan
berkata *"jangan beli apa-apa untuk ini"*, lalu menunjuk satu tindakan yang memang
berguna — mengendalikan kutu kebul sebagai vektornya, yang punya 32 produk terdaftar.

Isi layarnya: pernyataan bahwa tak satu pun pestisida terdaftar menyembuhkannya, tiga
tindakan yang berpengaruh (cabut tanaman terinfeksi, kendalikan vektornya, pilih
varietas tahan musim depan), lalu satu jalan keluar konkret ke vektor.

**Bandingkan dengan cabang serupa di jalur 4.** Nol produk untuk virus adalah
kebenaran agronomi. Nama varietas yang tidak ditemukan di registri benih **bukan
bukti apa-apa** — dan karena itu layarnya berhenti pada fakta, bukan pada kesimpulan.

---

## 5. Peringatan bahan dilarang — dan lingkupnya

Dari 246 produk terdaftar untuk trips di cabai, **14 mengandung klorpirifos** dan
**39 memuat bahan yang namanya tercantum di Lampiran I.A Permentan 43/2019**.
Peringatan itu bisa diberikan hari ini tanpa data tambahan — asalkan lingkupnya ikut
disebut.

**Larangannya berlingkup, dan lingkupnya menentukan.** Klorpirifos dilarang untuk
**rumah tangga** dan untuk **tanaman padi**; tidak satu pun catatan larangannya
mengenai cabai. Menandai kartunya "dilarang" di layar cabai sama kelirunya dengan
menyembunyikannya di layar padi. Yang benar: sebutkan bahwa zatnya dilarang, sebutkan
untuk apa, lalu berhenti — bentuk yang sama dengan kartu LARBAN di
[05-jalur-produk.md](05-jalur-produk.md).

Penelusuran seluruh registri menunjukkan ini bukan kekhususan cabai:

| Pemeriksaan | Hasil |
|---|---|
| Zat dilarang **menyeluruh** — lingkup "semua bidang penggunaan pestisida" | 91 |
| Di antaranya yang masih muncul pada produk terdaftar | **0** |
| Zat dilarang **khusus komoditas** — seluruhnya tanaman padi | 30 |
| Produk yang justru terdaftar untuk komoditas yang melarang isinya | **0** |

Kedua angka zat dihitung atas **entitas yang hidup saja**. Penyatuan ejaan menyalin blok
`hazard` ke entitas yang menang supaya larangannya tetap terjangkau, sedangkan yang kalah
tetap memegangnya agar rekamannya setia pada registri; menghitung keduanya berarti
menghitung satu bahan dua kali.

Artinya seluruh bahan dilarang yang masih beredar dilarang untuk padi atau rumah
tangga, bukan untuk komoditas tempat ia terdaftar. Registrinya konsisten; yang keliru
adalah peringatan yang tidak menyebut lingkup.

**Penggabungan ejaan tetap menutup lubang keselamatan.** Entitas `"Klorpirifos"`
memegang blok `hazard` lengkap, sementara `"CHLORPYRIFOS"` dan `"Klorpirifos
(chlorpyrifos)"` tidak memegang satu pun. Selama ketiganya terbelah, **20 produk**
yang registrinya menuliskan ejaan Inggris tak terlihat oleh pemeriksaan larangan mana
pun — termasuk pemeriksaan padi, yang justru tempat larangan itu berlaku.

**Penyatuan keluarga ejaan menutupnya lagi, dan angkanya bergerak.** Sapuan pertama
bekerja per pasang tulisan; keluarga yang pecah jadi tiga atau empat ejaan lolos darinya.
Sesudah 477 entitas menyusut jadi 184, angka di atas naik dari **34 ke 39 produk** —
lima pendaftaran untuk trips di cabai yang selama ini menuliskan `"Dimethoate"` (2),
`"Dimetoat (Dimethoate)"` (1), `"Profenofos (Profenofos)"` (1), dan `"Kartap hidroklorida
(Cartap hydrochloride)"` (1) baru sekarang terlihat oleh pemeriksaan larangan. Kenaikan itu
bukan data yang berubah, melainkan lubang yang tertutup.

---

## 6. Rekaman sebagai efek samping

Tidak ada yang diminta mencatat. Orang bertanya karena butuh. Tetapi setiap
pertanyaan adalah peristiwa bertanggal, berlokasi, dan ber-OPT — tanpa nama, tanpa
nomor telepon, tanpa geometri petak, sehingga tidak ada beban PDP yang perlu dipikul.

Seribu pertanyaan menghasilkan peta sebaran mingguan per kecamatan: *"trips sedang
menyebar di sini minggu ini"* — lapisan antisipatif yang tidak seorang pun perlu
merencanakannya, diproduksi dari perilaku reaktif orang lain.

Arsitekturnya berbalik. Bukan lagi rencana → realisasi → simpangan, melainkan
**insiden → jawaban → rekaman sampingan → peringatan wilayah**.

---

## 7. Prasyarat rilis

- ~~**Lima kalimat gejala.**~~ **Sudah dikerjakan.** Kesepuluh OPT cabai kini punya
  medan `symptoms` sendiri beserta dua ciri pembanding — `definition` dibiarkan sebagai
  catatan epidemiologi, bukan sebagai gejala.
- ~~**Sepuluh OPT itu tidak terbatas pada cabai.**~~ **Terbukti, dan dipakai.** Registri
  menautkannya jauh lebih luas — trips ke 15 komoditas, ulat grayak ke 13. Komoditas
  berikutnya menyusul sejak 28 Agustus 2026 lewat `spec/tools/kurasi-opt.mjs`: entri
  dinaikkan dari registri, dan entri lama yang melayani lebih dari satu tanaman teks
  gejalanya dibuka berklausa per tanaman. Daftar mutakhirnya dibangkitkan ke
  [14-tinjauan-gejala.md](14-tinjauan-gejala.md), jadi angka tidak ditulis di sini. Kakao,
  kopi, dan sawit tanaman TAHUNAN, dan skala fase yang belum ada ternyata tidak
  menghalangi jalur 1 sama sekali — ia prasyarat Lapis 2, bukan prasyarat pintu gejala.
- **Tetapkan aturan urutan merek dan umumkan di layar.** Rancangan ini memakai nomor
  pendaftaran menaik. Apa pun pilihannya, ia harus tertulis dan tidak boleh bisa
  dibeli.
- **Putuskan perlakuan bahan dilarang** yang masih memegang pendaftaran aktif —
  lihat [05-jalur-produk.md](05-jalur-produk.md) bagian kasus LARBAN.
- ~~**Pembersihan label komoditas.**~~ **Sudah dikerjakan.** Cabai terpecah jadi 15
  entitas, bawang merah 17, karet 13 — sebagian besar karena dosis bocor ke dalam
  nama sasaran: "Cabai (1,5 ml/l)", "Cabai (700 ml/ha )". **214 entitas disatukan**,
  488 komoditas registri jadi 274, dan trips di cabai naik dari 234 ke 238 produk.
  **Sumbu OPT menyusul dalam dua putaran**: 456 entitas disatukan lewat verifikasi
  GBIF, lalu 131 lagi yang salah ketiknya begitu parah sampai GBIF tak mengenalinya
  (`Trips parvispinus`, `Echinochloa cruss-gali`, `Selenopsis germinata`) lewat tabel
  putusan tangan. **1.370 OPT jadi 778**, dan cabai turun dari 97 jadi 74 OPT — bukan
  karena data hilang, melainkan karena ejaan yang terbelah kembali jadi satu. Trips
  naik dari 234 ke 246 produk.

  Yang dalam kurung tidak semuanya derau, dan di situlah kehati-hatiannya. Yang
  dilepas: dosis, dan **penciri fase TBM/TM**. Yang ditahan: **TOT**, **pra tumbuh**
  lawan **purna tumbuh**, **Tapin** lawan **Tabela**, dan dua spesies akasia. Tujuh
  keluarga tetap terpisah dan kini disajikan sebagai varian satu tanaman, bukan
  sebagai komoditas asing satu sama lain.

  **Kenapa TBM/TM dilepas padahal perbedaannya nyata.** Penyemprotan di sawit muda
  memang tidak sebanding dengan sawit yang sedang dipanen — tetapi itu sifat
  *penggunaan*, bukan identitas tanamannya. TBM/TM adalah **fase pertumbuhan**, dan
  spesifikasi ini sudah punya `Stage` beserta lima belas skala fase untuk
  menyatakannya; memodelkannya sebagai komoditas yang berbeda adalah kesalahan
  kategori. `collection.scope` pada `commodity-registri.json` sebenarnya sudah
  menolaknya sejak awal — *"keduanya sifat siklus, bukan komoditas yang berbeda"* —
  hanya saja diterapkan setengah jalan: delapan entitas sudah membawa "(TM)" di
  synonyms-nya sementara "Karet TM" tetap berdiri sendiri. Bunyi aslinya tidak
  hilang: ia tetap terbaca pada entitas yang digantikan, pada `mappings` KEMENTAN,
  pada `commodity_label` rekaman produk, dan kini juga pada synonyms pemenang.

---

## Alur layar

1. **Pilih gejala.** Daftar pendek gejala yang terlihat, bukan nama hama: *daun
   keriting ke atas*, *daun menguning dan keriting*, *serangga putih beterbangan*. Di
   bawahnya tertulis bahwa gejala dikurasi tangan dan mesin tidak menebak dari foto.
2. **Hasil.** Dugaan OPT dengan nama ilmiahnya, lalu blok **"pastikan dulu"** berisi
   dua ciri pembanding yang bisa diperiksa sendiri. Menyusul angka besar — *246 produk
   terdaftar untuk ini di cabai, tetapi isinya hanya 60 bahan aktif berbeda* — lalu
   kartu peringatan bahan dilarang **beserta lingkup larangannya**.
3. **Kartu bahan + kadar.** Lima kelompok, diurutkan menurut jumlah produk. Tiap kartu
   bisa dibuka jadi daftar merek dengan nomor pendaftaran, masa berlaku, dan **dosis
   terdaftar milik tiap produk** — yang berbeda-beda walau isinya sama. Aturan
   urutannya diumumkan di dalam daftar itu sendiri.
4. **Cabang nol produk.** Untuk virus kuning keriting, tidak ada kartu bahan sama
   sekali. Yang tampil: pernyataan bahwa tak satu pun pestisida terdaftar
   menyembuhkannya, tiga tindakan yang memang berpengaruh, lalu satu jalan keluar
   konkret — mengendalikan kutu kebul sebagai vektornya.
5. **Kaki tiap hasil.** Satu baris yang menyatakan pertanyaan itu tercatat sebagai satu
   kejadian di kecamatan, tanpa nama dan tanpa nomor telepon.

---

## Yang sengaja tidak dijanjikan

Layar ini **tidak menampilkan tanggal aman panen**, padahal tenggang panen adalah
angka yang paling melukai kalau salah. Alasannya: **registri tidak memuatnya sama
sekali** — nol dari 23.058 penggunaan berlabel. Yang tertulis sebagai gantinya adalah bahwa tenggang panen tidak
tercatat di registri, dan pertanyaannya dibawa ke penyuluh.

Lebih baik mengaku tidak tahu daripada mengarang angka yang menyangkut keselamatan.
