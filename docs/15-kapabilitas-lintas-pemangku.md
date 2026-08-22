# Kapabilitas Lintas Pemangku Kepentingan — riset, benchmarking, dan rekomendasi

> Riset · versi **0.1** · 22 Agustus 2026 · status **usulan**
> Menjawab satu pertanyaan: **kapabilitas apa yang membuat platform ini bermakna bagi
> seluruh pelaku pertanian — terutama di hulu, termasuk petani** — dan mana yang tidak.
>
> Masukan untuk pemetaan modul; **bukan** pengganti [10-peta-modul.md](10-peta-modul.md),
> yang mengatur urutan bangun. Dokumen ini mengatur **daftar** yang diurutkan di sana.
>
> Turunan dari [00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md),
> [02-tiga-pasar.md](02-tiga-pasar.md), [03-enam-pintu.md](03-enam-pintu.md),
> ditambah benchmarking 21 sistem — 9 luar negeri, 12 Indonesia.

---

## 0. Ringkasan

Enam temuan yang mengubah bentuk daftar kapabilitas, diurutkan menurut seberapa besar
ia mengubah keputusan bangun:

1. **Hampir seluruh sistem yang ada adalah penganjur; nyaris tak ada yang pemeriksa.**
   Katam, Cyber Extension, PHSL, Plantix, Farmer.Chat, RiceAdvice — semuanya menjawab
   *apa yang sebaiknya dilakukan*. Yang kosong adalah lapisan sebelumnya: *apa yang
   sebenarnya saya pegang*. Enam jalur di [`app/`](../app/) sudah berdiri persis di
   lapisan itu. Itu bukan kekurangan yang harus ditutup dengan meniru penganjur.
2. **Anggaran nyeri terbesar yang tidak dipegang siapa pun adalah keaslian input.**
   Kementan menaksir kerugian petani akibat pupuk palsu Rp3,2 triliun (2025), berkembang
   jadi Rp3,3 triliun (2026). Tidak ada satu pun platform di daftar benchmark yang
   menjadikannya kapabilitas utama.
3. **Yang membedakan bukan jawabannya, melainkan batas jawabannya.** Asisten berbasis
   model bahasa selalu menjawab. Registri yang sanggup berkata *"tidak tahu, dan ini
   sebabnya"* adalah kelangkaan — dan kolom "yang tidak sanggup" di
   [03-enam-pintu.md](03-enam-pintu.md) sudah menjadikannya kebiasaan.
4. **Harga adalah lubang terbesar bagi petani yang bisa ditutup tanpa jadi pedagang.**
   NTP subsektor hortikultura naik 7,08% pada Mei 2026 lalu turun 8,49% pada Juli 2026 —
   kenaikan tertinggi dan penurunan terdalam dalam satu triwulan. Bapanas sudah memantau
   harga di tingkat produsen. Menyambungkannya ke kalkulator biaya mengubah keputusan
   panen dan jual, tanpa menyentuh kepemilikan barang.
5. **"Bermakna bagi semua pemangku kepentingan" tidak dicapai dengan satu modul per
   pihak.** Dicapai dengan **satu rekaman, banyak bacaan**: catatan musim yang sama
   dibaca petani sebagai jadwal, penyuluh sebagai laporan, offtaker sebagai bukti, bank
   sebagai berkas risiko, pemerintah sebagai statistik. Menambah modul per pihak adalah
   cara termahal dan tercepat kehilangan fokus.
6. **Rata-rata umur petani 52–55 tahun dan petani muda tinggal ±11%.** Protokol berversi
   yang menyebut alasan dan tingkat buktinya bukan cuma anjuran — ia kurikulum. Ini satu-
   satunya kapabilitas yang bermakna bagi pihak yang belum jadi petani.

**Rekomendasi inti:** 39 kapabilitas dalam 7 kelompok (bagian 5), dengan putusan
per kapabilitas — **bangun, pinjam, sambung, tunda, jangan**. Empat sudah selesai. Yang
layak dibangun **sekarang, tanpa satu pun keputusan terbuka dan tanpa sumber data baru**,
hanya sepuluh. Enam kapabilitas dijawab dengan **pinjam atau sambung** — sudah ada yang
mengerjakannya lebih baik, dan membangunnya ulang adalah cara paling mahal terlihat sibuk.

---

## 1. Misi yang diperluas, dan satu pemisahan yang menyelamatkannya

Misi yang diberikan berbunyi: *membantu siapa pun yang membutuhkan informasi apa pun
untuk mengetahui dan memutuskan tentang apa pun terkait pertanian.*

Itu bertabrakan langsung dengan [02-tiga-pasar.md](02-tiga-pasar.md) bagian 7, yang
justru menolak segmen dan menolak fitur. Tabrakan itu nyata, dan meratakannya dengan
kompromi akan merusak keduanya. Yang menyelesaikannya satu pemisahan:

> **Cakupan pertanyaan boleh tak terbatas. Cakupan janji tidak pernah boleh.**

Artinya: **tidak ada pertanyaan yang ditolak masuk.** Siapa pun boleh bertanya apa pun.
Tetapi jawabannya wajib jatuh ke salah satu dari empat bentuk, dan **hanya bentuk pertama
yang berupa anjuran**:

| Bentuk jawaban | Kapan dipakai | Contoh yang sudah berjalan |
|---|---|---|
| **Anjuran** | Data sanggup, tingkat bukti disebut, batas label dihormati | Bahan aktif + kadar untuk OPT yang terkurasi (jalur 1) |
| **Fakta terdaftar** | Registri sanggup, tapi bukan anjuran | "Produk ini terdaftar, isinya X, setara dengan 43 produk lain" (jalur 2) |
| **Hitungan** | Aritmetika atas angka yang dimasukkan sendiri | Rp per kg hara (jalur 3) |
| **Status & batas** | Data tidak sanggup, atau hukum melarang menganjurkan | Jalur 6 — status hukum sediaan, bukan anjuran |

Bentuk keempat inilah yang membuat misi seluas itu tidak berbahaya. **Menolak menjawab
adalah jawaban**, dan ia harus dirancang sebagus tiga lainnya — bukan disajikan sebagai
kegagalan pencarian.

### Uji "bermakna" — empat syarat

Kapabilitas dianggap bermakna kalau keempatnya terpenuhi. Yang gagal di syarat mana pun
masuk daftar tunggu, bukan daftar bangun.

1. **Ada keputusannya.** Satu keputusan nyata berubah — bukan "pengetahuan bertambah".
   *Pengetahuan bertambah* adalah hasil antara yang bisa diukur tanpa ada yang berubah,
   dan itu persis metrik palsu yang dilarang [00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md) bagian 5.
2. **Ada pemiliknya.** Satu orang tertentu memegang keputusan itu — bukan "petani" sebagai
   kategori. Kalau yang memegang ternyata kios atau bandar, kapabilitasnya dirancang
   untuk kios atau bandar, bukan dipaksakan ke petani.
3. **Ada saatnya.** Ada momen dalam musim ia dibutuhkan. Kapabilitas tanpa momen akan
   dibuka sekali lalu ditinggalkan, dan repeat use adalah gate fase kedua.
4. **Ada cara salahnya ketahuan.** Pengguna atau platform bisa tahu jawabannya keliru.
   Syarat keempat ini yang paling sering dilanggar dan paling menentukan kepercayaan —
   dan ia langsung menjelaskan kenapa PHI yang nol dari 23.058 penggunaan berlabel
   memblokir fitur tanggal panen aman, bukan sekadar memperlambatnya.

---

## 2. Inventaris keputusan hulu — 16 keputusan, dan siapa yang benar-benar memegangnya

Daftar kapabilitas apa pun yang tidak dimulai dari daftar keputusan akan berakhir sebagai
daftar fitur. Kolom **pemegang de facto** sengaja dibedakan dari "petani" — dan
[02-tiga-pasar.md](02-tiga-pasar.md) bagian 8 pertanyaan ke-2 menyatakan kolom ini
**belum diverifikasi lapangan**. Isian di bawah adalah hipotesis dari data sekunder.

| # | Keputusan | Pemegang de facto (hipotesis) | Kapan | Yang dipakai sekarang | Biaya kalau salah |
|---|---|---|---|---|---|
| 1 | Tanam apa | Petani + bandar/offtaker | pra-musim | harga musim lalu, kebiasaan | satu musim |
| 2 | Kapan tanam | Petani + air + kelompok | pra-musim | Katam, prakiraan BMKG, kesepakatan poktan | satu musim |
| 3 | Varietas apa | Kios, penangkar | pra-musim | anjuran kios, merek yang tersedia | satu musim |
| 4 | Benih dari mana | Kios, penangkar, sesama petani | pra-musim | kepercayaan personal | satu musim, tak terlihat sampai berbuah |
| 5 | Olah lahan & amelioran | Petani | pra-tanam | kebiasaan | sedang |
| 6 | Pupuk apa & berapa | **Kios** (kredit saprodi) + kuota e-RDKK | 2–4× per musim | anjuran kios, jatah subsidi | **terbesar dalam rupiah** |
| 7 | Air / irigasi | P3A, jadwal gilir | mingguan | kesepakatan kelompok | tinggi saat kemarau |
| 8 | OPT — ada apa ini | Petani, penyuluh, POPT | mingguan | mata, tetangga, kios | tinggi |
| 9 | OPT — pakai apa | **Kios** | insidental | stok kios, promosi | tinggi + keselamatan |
| 10 | Tenaga kerja & alsintan | Petani, Brigade Pangan, penyedia jasa | per tahap | jaringan lokal | sedang |
| 11 | Modal | Kios (kredit saprodi), KUR, bandar | pra-musim | apa yang bisa diakses | **struktural** |
| 12 | Risiko / asuransi | Petani via poktan | pra-musim | AUTP lewat SIAP — administrasinya berat untuk <0,3 ha | katastrofik saat gagal |
| 13 | Kapan panen | Petani + bandar | sekali | umur, harga, ajakan bandar | tinggi |
| 14 | Pascapanen & susut | Petani, bandar | pasca-panen | kebiasaan | 15–25% lazim; sebagian komoditas jauh lebih tinggi |
| 15 | Jual ke siapa & berapa | **Bandar** | sekali | harga yang ditawarkan hari itu | tinggi |
| 16 | Bukti & kepatuhan | Offtaker, sertifikator | per kontrak | catatan tangan, tidak ada | menentukan akses pasar |

**Tiga pembacaan yang mengubah daftar kapabilitas:**

- **Empat dari lima keputusan termahal dipegang orang selain petani** (6, 9, 11, 15).
  Kapabilitas yang hanya berbicara ke petani akan menyentuh keputusan yang bukan miliknya.
  Ini menegaskan pilihan beachhead di [02-tiga-pasar.md](02-tiga-pasar.md), sekaligus
  memberi alasan kenapa kios — meski ditunda karena netralitas — tidak boleh dianggap
  bukan pengguna.
- **Keputusan 8 dan 13 adalah satu-satunya yang mingguan atau berulang.** Kapabilitas yang
  menempel di sana punya peluang repeat use; sisanya sekali per musim, dan aplikasi yang
  dibuka sekali per musim tidak akan diingat.
- **Keputusan 4 dan 6 punya ciri yang sama dan langka: salahnya baru ketahuan berbulan
  kemudian.** Benih palsu baru terlihat saat tanaman tidak berbuah; pupuk berkadar hara
  di bawah 1% baru terlihat saat hasil anjlok. Justru di sinilah pemeriksaan di muka
  bernilai paling besar — dan justru ini yang sudah dipegang jalur 2 dan jalur 4.

---

## 3. Benchmarking

### 3.1 Sembilan sistem luar negeri — enam arketipe

| Sistem | Arketipe | Yang dilakukan | Yang dipinjam | Yang dihindari |
|---|---|---|---|---|
| **Plantix** (PEAT) | Diagnosis dari foto | ±400 penyakit; klaim pengenalan 80–90%; antarmuka Inggris dengan terjemahan ke 20 bahasa; forum pakar sebagai cadangan | **Forum sebagai cadangan saat mesin gagal** — pengakuan batas yang dijadikan fitur | Diagnosis yang langsung berakhir di merek produk |
| **PlantVillage Nuru** (Penn State) | Diagnosis luring | Model deteksi objek berjalan **di dalam HP**, tanpa sinyal; akurasi CMD setara peneliti, ±1,5× petugas penyuluh, ±2× petani | **Luring benar-benar luring**, dan **pembanding akurasinya manusia**, bukan angka mutlak | Cakupan sempit disajikan seolah umum |
| **Digital Green Farmer.Chat** | Asisten percakapan | 15.000+ pengguna, 300.000+ kueri setahun; merangkai layanan pihak lain (diagnosis dari Plantix) | **Merangkai, bukan membangun ulang** | Asisten yang selalu punya jawaban |
| **Precision Development (PxD)** | Advisori suara + RCT | RCT padi Odisha, 13.675 petani: pengetahuan & adopsi naik nyata, hasil naik moderat, **peluang gagal panen turun besar** | **Klaim yang dijual adalah penurunan risiko**, bukan kenaikan hasil | Janji "hasil naik X%" |
| **RiceAdvice / Nutrient Expert / AgWise** (CGIAR EiA) | Anjuran hara spesifik lokasi | Rekomendasi pupuk & tanam per lokasi, dari model agronomi | **Anjuran berhenti di tingkat hara** — persis batas netralitas vendor `L3` | Ketergantungan pada masukan data yang petani tak punya |
| **AgriStack** (India) | Infrastruktur publik digital | 103,1 juta Farmer ID (3 Agu 2026); Digital Crop Survey Rabi 2025-26 di 648 kabupaten, 313 juta petak; **registri federatif — data milik negara bagian** | **Federatif**: identitas dan petak dimiliki pihak yang berwenang, bukan platform | Registri terpusat yang jadi syarat mengakses hak |
| **UKI / UPONA** (Beckn) | Jaringan terbuka | Bukan aplikasi — gerbang agar petani mengakses banyak penyedia tanpa berpindah aplikasi; masuk lewat suara, banyak bahasa | **Protokol, bukan aplikasi** — sesuai nama proyek ini | Jaringan tanpa lapis mutu: siapa saja boleh menawarkan apa saja |
| **farmOS · LiteFarm · OpenTEAM · AgStack** | Sumber terbuka & interop | Pencatatan usaha tani sumber terbuka; AgStack menyediakan identitas petak (GeoID) sebagai barang publik | **GeoID sebagai identitas petak** — cara punya ID petak stabil tanpa memiliki geometrinya | Antarmuka yang mengasumsikan petani berlahan luas |
| **Farmforce · Koltiva** | Ketertelusuran first-mile | Koltiva: 10.800+ agribisnis, 58 komoditas; perangkat kepatuhan EUDR untuk 19.000+ usaha hulu-hilir | **Pemetaan petak + uji tuntas sebagai produk yang dibeli hilir** | Petani jadi objek pendataan, bukan pemilik datanya |

> **Yang tidak dilakukan satu pun dari sembilan:** memeriksa **keaslian** input sebelum
> dipakai. Semuanya mengandaikan karung di gudang berisi apa yang tertulis di karung.

### 3.2 Dua belas sistem Indonesia — dan mana yang tidak boleh dibangun ulang

**Milik negara — sudah ada, sebagian besar wajib disambung, bukan disaingi.**

| Sistem | Isi | Putusan |
|---|---|---|
| **Katam Terpadu** (BSIP) | Awal tanam, pola & rotasi, varietas, pemupukan berimbang, ancaman OPT, alsintan — **skala kecamatan**; data BMKG, LAPAN, BPS, BIG | **PINJAM.** Membangun ulang kalender tanam adalah pemborosan terbesar yang mungkin |
| **PHSL / Nutrient Manager, PUPS, Sipapudi** | Anjuran hara spesifik lokasi | **PINJAM** logikanya; hindari kalkulator hara tandingan |
| **PUTS / PUTK / PUTR / PUHT** | Uji tanah cepat di lapangan, semi kuantitatif | **SAMBUNG** — terima hasilnya sebagai `Observation` |
| **Cyber Extension** (cybext.id) | Repositori materi penyuluhan | **PINJAM** sebagai korpus Fase 1; **bukan** pesaing — bentuknya artikel, bukan protokol berversi |
| **Panel Harga Pangan** (Bapanas) | Harga **tingkat produsen** — GKP di petani, cabai merah keriting, cabai rawit merah, bawang merah di petani | **PINJAM.** Ini menutup lubang harga tanpa jadi pedagang |
| **BMKG** — SLI, prakiraan musim, radar sampai desa | Prakiraan harian sampai musiman, indeks kekeringan, ENSO/IOD | **PINJAM** |
| **SIMLUHTAN · e-RDKK · iPubers · Kartu Tani** | Kepesertaan penyuluhan, usulan & penebusan pupuk subsidi; ±27.000 kios | **SAMBUNG.** Rencana musim harus bisa dicetak dalam bentuk yang cocok alur RDKK |
| **SIAP** (asuransi) | Pendaftaran AUTP: premi petani Rp36.000/ha/musim, subsidi Rp144.000, ganti rugi s.d. ±Rp6 juta/ha | **SAMBUNG** kelak. Kendalanya administrasi, bukan tarif — dan itu bisa dibantu |
| **POPT → LPHP → BPTPH** + SILAP OPT | Rantai pengamatan & peringatan dini OPT berjenjang | **SAMBUNG.** Peringatan dini negara sudah ada; yang kurang adalah lengan warganya |
| **Satu Data Pertanian / BDSP** | Statistik & publikasi | **PINJAM** |

**Milik swasta — pesaing sebagian, pembanding seluruhnya.**

| Pemain | Model | Pelajaran |
|---|---|---|
| **Koltiva** | Ketertelusuran & kepatuhan; menjual ke hilir | Membuktikan pembayarnya ada, dan **bukan petani** |
| **Semaai** | Digitalisasi kios & toko tani | Mengakui kios sebagai simpul nyata — yang [02-tiga-pasar.md](02-tiga-pasar.md) tunda karena netralitas |
| **Eratani** | Pembiayaan + input + serapan, padi | Memegang barang dan pembiayaan; persis yang dilarang keputusan ke-1 dokumen fondasi |
| **Elevarm** | Kemitraan hortikultura — petani menjual **seluruh** hasil ke Elevarm | Menutup pilihan pasar petani. Ini yang membedakan mitra dari infrastruktur |
| **TaniOS · AgriAgent "Kang Tani"** | Asisten AI berbasis WhatsApp, klaim bahasa daerah + harga + cuaca | **Pesaing terdekat pada pintu masuk.** Yang tidak mereka punya: registri resmi di belakang jawaban, dan batas yang dinyatakan |
| **eFishery · TaniHub/TaniFund** | Unicorn akuakultur; agritech + e-grocery, izin TaniFund dicabut OJK | Sudah jadi tulang punggung diagnosis di dokumen fondasi bagian 1 |

### 3.3 Empat pola kegagalan yang berulang di 21 sistem

1. **Anjuran tanpa ketersediaan.** Menganjurkan bahan aktif yang tidak ada di kios
   terdekat. Jalur 1 sudah menemui bentuknya sendiri: 246 produk yang tak satu pun
   terbeli.
2. **Diagnosis tanpa cakupan yang jujur.** Model dilatih untuk segelintir komoditas lalu
   dipasarkan seolah umum. Angka kita telanjang: **0 dari 768 OPT registri punya deskripsi
   gejala**; yang terkurasi baru 10, dan semuanya cabai.
3. **Pencatatan sebagai kerja tak dibayar.** Ditanggung penyuluh atau petani tanpa imbalan,
   lalu berhenti di musim kedua. Penyuluh 39.809 orang terhadap kebutuhan 83.000 — tidak
   ada kapasitas menganggur untuk diminta.
4. **Digital divide diperlakukan sebagai masalah pengguna.** 46,84% petani memakai
   teknologi digital, dan **80,24% dari pengguna itu berumur di atas 39 tahun**; literasi
   digital desa dilaporkan jauh di bawah kota. Antarmuka yang menuntut ketikan panjang
   dan sinyal stabil menyaring penggunanya sendiri.

### 3.4 Papan skor — apa yang sudah tertutup, apa yang menganga

| Kebutuhan hulu | Sudah ditutup siapa | Mutu | Sisa lubang |
|---|---|---|---|
| Kapan tanam | Katam, BMKG | baik, skala kecamatan | turun ke petak; sambung ke rencana |
| Hara & dosis | PHSL, Nutrient Expert, PUTS | baik | **kuota & harga subsidi** — 0 dari 7.196 pupuk |
| Diagnosis OPT | Plantix, Nuru, POPT | sedang | gejala terkurasi berbahasa lokal; **0 dari 768** |
| Harga | Panel Harga Bapanas | baik di komoditas strategis | sambungan ke biaya petak sendiri |
| Cuaca | BMKG | baik | dibaca sebagai tindakan, bukan angka |
| Keaslian input | **tidak ada** | — | **menganga — Rp3,3 T** |
| Keabsahan benih/varietas | PVTPP, BPSB (terpisah-pisah) | sedang | satu pintu; **sifat agronomi 0 dari 11.227** |
| Pencatatan & bukti | Koltiva, Farmforce | baik, berbayar hilir | milik petani, bisa diekspor |
| Analisis usaha tani | tersebar di lembar Excel | buruk | **menganga** |
| Keselamatan aplikasi (APD, PHI, kalibrasi) | label produk | buruk di lapangan | **menganga — PHI 0 dari 23.058** |
| Pembiayaan & asuransi | KUR, AUTP/SIAP | ada, administrasi berat | berkas siap-ajukan |
| Belajar & regenerasi | Cyber Extension, polbangtan | artikel, bukan protokol | **menganga** |

---

## 4. Tujuh ruang kosong yang cocok dengan posisi proyek ini

Bukan setiap lubang layak diisi kita. Tujuh ini lolos empat syarat bagian 1 **dan**
berada di dalam aturan netralitas serta larangan memegang barang.

1. **Keaslian input** — memeriksa yang di tangan sebelum dipakai. Datanya sudah ada
   (14.920 produk terdaftar); yang kurang cuma pintunya dan jalur laporannya.
2. **Batas yang dinyatakan** — jawaban yang menyebut apa yang tidak diketahuinya.
   Sudah jadi budaya repo; belum jadi komponen yang bisa dipakai ulang.
3. **Nama lokal** — jembatan antara apa yang petani sebut dan apa yang registri catat.
   Termurah dari tujuh, dan ia menentukan apakah pintu masuk bisa dipakai sama sekali.
4. **Ongkos sebenarnya per petak** — Rp/kg hara sudah ada; yang belum, biaya musim utuh
   dan titik impas terhadap harga yang berlaku.
5. **Keselamatan aplikasi** — kalibrasi semprot, takaran, APD. Murah, mendesak, dan
   tak satu pun benchmark memegangnya sebagai kapabilitas utama.
6. **Satu rekaman, banyak bacaan** — catatan musim yang sama menghasilkan jadwal, laporan,
   bukti, berkas kredit, dan statistik. Ini yang membuat "semua pemangku kepentingan"
   mungkin tanpa membangun modul per pihak.
7. **Protokol sebagai kurikulum** — versi, penulis, alasan, dan tingkat bukti membuat
   sebuah protokol bisa dipelajari, bukan cuma dituruti. Satu-satunya jawaban untuk
   pihak yang belum jadi petani.

---

## 5. Rekomendasi kapabilitas — 30 kapabilitas, 7 kelompok

Kolom **putusan** memakai lima kata, dan artinya mengikat:

- **BANGUN** — dikerjakan di sini; tidak ada yang mengerjakannya cukup baik
- **PINJAM** — datanya diambil dari sumber yang ada; jangan bikin tandingan
- **SAMBUNG** — jembatan ke sistem negara; jangan gantikan
- **TUNDA** — perlu, tapi terhalang lubang data atau pendapat hukum — **bukan terhalang kode**
- **JANGAN** — di luar cakupan secara permanen

### A · MASUK — bagaimana orang bertanya

| # | Kapabilitas | Untuk siapa | Keputusan yang diubah | Keadaan data | Putusan |
|---|---|---|---|---|---|
| A1 | Satu kotak tanya multimoda — teks bebas, gejala, nama di kemasan, foto — yang **merutekan** ke jalur, bukan menjawab sendiri | semua | menentukan pintu | beranda satu kotak sudah ada; belum semua jalur tersambung | **BANGUN** |
| A2 | Kanal WhatsApp untuk tanya-jawab yang sama | petani, penyuluh, kios | keterjangkauan | belum ada | **BANGUN** (gel. 1) |
| A3 | **Kamus nama lokal** — sinonim daerah untuk OPT, komoditas, gejala, dan nama dagang | semua | apakah pintunya bisa dipakai sama sekali | belum ada; termurah dari seluruh daftar | **BANGUN** (gel. 0) |
| A4 | Masuk lewat suara & gambar untuk literasi rendah | petani | keterjangkauan | belum ada | **TUNDA** |
| A5 | Mode luring penuh (PWA yang menyimpan indeks) | petani, petugas lapang | dipakai di lahan atau tidak | indeks sudah ≤48 KB per berkas — separuh jalan | **BANGUN** (gel. 0) |

> **A3 lebih penting daripada tampaknya.** Petani tidak menyebut *Thrips parvispinus*; ia
> menyebut nama lokalnya. Tanpa kamus itu, jalur 1 hanya bisa dipakai orang yang sudah
> tahu jawabannya. Ini juga satu-satunya kapabilitas yang menjadi lebih baik justru karena
> sumbangan pengguna — dan karena itu pintu masuk termurah ke kontribusi.

### B · JAWAB — mutu dan batas jawaban

| # | Kapabilitas | Untuk siapa | Keputusan yang diubah | Keadaan data | Putusan |
|---|---|---|---|---|---|
| B1 | **Komponen "batas jawaban"** — tiap layar menyebut tingkat bukti, tanggal, sumber, dan apa yang tidak diketahuinya | semua | apakah jawabannya dipercaya | budaya sudah ada, komponen belum | **BANGUN** |
| B2 | Kartu keselamatan aplikasi — APD, cara aman, gejala keracunan, kontak darurat | petani, buruh tani | keselamatan jiwa | sebagian ada; **PHI 0 dari 23.058** | **BANGUN** bagian non-PHI; PHI **TUNDA** |
| B3 | **Sanggahan terbuka** — siapa pun boleh menantang satu fakta; jejaknya publik dan bernama | agronom, penyuluh, principal | mutu korpus | belum ada | **BANGUN** |
| B4 | **Antrean pertanyaan tak terjawab** — yang tidak bisa dijawab dicatat sebagai kebutuhan data | tim, kontributor | prioritas data berikutnya | belum ada; nyaris gratis | **BANGUN** |
| B5 | Ringkasan berbasis model bahasa di atas registri | semua | kecepatan paham | terlalu dini — melanggar syarat ke-4 | **TUNDA** |

> **B4 mengubah biaya riset menjadi keluaran produk.** Setiap "tidak sanggup" yang
> ditampilkan enam jalur hari ini menghilang begitu layar ditutup. Dicatat, ia menjadi
> peta permintaan data yang tidak bisa dibeli dari mana pun — dan itulah yang menentukan
> registri mana yang layak ditarik berikutnya.
>
> **B5 ditunda karena syarat ke-4, bukan karena teknologi.** Asisten yang selalu menjawab
> tidak punya cara salahnya ketahuan. Pesaing terdekat di pintu masuk justru berbentuk itu
> — dan tepat di situ pembedanya.

### C · RUJUKAN — registri

| # | Kapabilitas | Untuk siapa | Keputusan yang diubah | Keadaan data | Putusan |
|---|---|---|---|---|---|
| C1 | Registri input terdaftar — pupuk, pestisida, benih | semua | #3, #4, #6, #9 | **selesai** — 14.920 produk, 11.227 varietas | **selesai** |
| C2 | **Keaslian & anti-palsu** — periksa nomor, ciri kemasan yang bisa dicek sendiri, jalur lapor kecurigaan | petani, kios, penyuluh, principal, penegak | #4, #6 — sebelum uang keluar | registri sudah ada; aturan `G12` sudah menolak nomor karangan di jalur gambar | **BANGUN** |
| C3 | Kamus OPT bergejala penuh | petani, penyuluh, POPT | #8 | **10 dari 778**; 0 dari 768 di registri | **BANGUN bertahap** |
| C4 | Harga — acuan produsen + setoran petani | petani, poktan, offtaker | #1, #13, #15 | 0 di registri; Bapanas punya sisi acuan | **PINJAM + BANGUN** |
| C5 | Cuaca & iklim per lokasi | petani, penyuluh | #2, #7, #13 | 0 | **PINJAM** (BMKG) |
| C6 | Lahan & tanah — status hara, jenis tanah, ketinggian | petani, penyuluh | #5, #6 | 0; peta status hara & PUTS ada di luar | **PINJAM + SAMBUNG** |
| C7 | **Direktori layanan** — kios resmi, penyuluh, POPT, lab, penangkar, jasa alsintan | semua | #4, #9, #10 | fondasi ada: 234 toko terbit (OSM), 2.181 benih TTI beralamat | **BANGUN** |
| C8 | Sifat agronomi varietas | petani, penyuluh, penangkar | #3 | **0 dari 11.227** | **TUNDA** |
| C9 | Status & kuota pupuk bersubsidi | petani, kios, penyuluh | #6 — keputusan termahal | **0 dari 7.196** | **TUNDA + SAMBUNG** (e-RDKK) |

> **C2 adalah kapabilitas dengan rasio nilai-terhadap-biaya tertinggi di seluruh dokumen.**
> Datanya sudah dipegang, taksiran kerugiannya Rp3,3 triliun, tak ada pesaing yang
> memegangnya, dan ia langsung memenuhi keempat syarat: keputusannya jelas (jadi beli
> atau tidak), pemiliknya jelas (yang memegang karung), saatnya jelas (di kios, sebelum
> bayar), dan salahnya ketahuan (nomor cocok atau tidak).
>
> **Batasnya harus dinyatakan sejak layar pertama:** nomor yang cocok membuktikan
> **nomornya terdaftar**, bukan **isi karungnya benar**. Menyamakan keduanya akan membuat
> platform ini menjamin sesuatu yang tidak bisa dijaminnya — dan pemalsu yang menyalin
> nomor sah akan lolos justru dengan bantuan kita.

### D · HITUNG — kalkulator yang tidak menganjurkan

| # | Kapabilitas | Untuk siapa | Keputusan yang diubah | Keadaan data | Putusan |
|---|---|---|---|---|---|
| D1 | Rp per kg hara | petani, kios, poktan | #6 | **selesai** — jalur 3 | **selesai** |
| D2 | Kebutuhan input per luas | petani, petugas lapang | #6 | **selesai** — `susun-rencana.mjs` | **selesai** |
| D3 | **Analisis usaha tani** — RAB, titik impas terhadap harga, arus kas musim | petani, poktan, koperasi, bank | #1, #11, #13, #15 | harga dari pengguna, seperti jalur 3 | **BANGUN** |
| D4 | **Kalibrasi semprot** — volume, kecepatan jalan, nozel, jumlah tangki | petani, buruh semprot | #9 + keselamatan | tidak butuh data baru | **BANGUN** |
| D5 | Takaran alat rumah tangga — tutup botol, gelas, sendok | petani | #6, #9 | tidak butuh data baru | **BANGUN** |
| D6 | Kalkulator susut & kelas mutu pascapanen | petani, bandar, offtaker | #14 | belum ada | **TUNDA** |

> **D4 dan D5 adalah dua kapabilitas termurah yang paling langsung menyentuh keselamatan.**
> Anjuran "2 ml per liter" tidak berguna bagi orang yang menakar dengan tutup botol, dan
> dosis label yang benar menjadi salah begitu kalibrasi tangki keliru. Keduanya tidak
> menuntut satu baris data baru — hanya aritmetika dan bentuk layar yang benar.

### E · RENCANA & CATAT — eksekusi

| # | Kapabilitas | Untuk siapa | Keputusan yang diubah | Keadaan data | Putusan |
|---|---|---|---|---|---|
| E1 | Rencana musim dari protokol | petugas lapang, penyuluh, petani | #1–#7 | penyusun **selesai**; permukaan belum | **BANGUN** (fase 3) |
| E2 | Pencatatan realisasi | petugas lapang, petani | seluruhnya | skema **selesai**; permukaan belum | **BANGUN** (fase 3) |
| E3 | Simpangan rencana–realisasi | petugas lapang, offtaker | mutu data | pemeriksa **selesai** | **BANGUN** (fase 3) |
| E4 | Pengingat berbasis **fase**, bukan tanggal | petani, petugas lapang | ketepatan waktu tindakan | `Stage` sengaja **tanpa medan hari** — hanya 2 dari 4 langkah cabai bertanggal | **BANGUN** (fase 3) dengan batasnya dinyatakan |
| E5 | **Buku kas & tenaga kerja per petak** | petani, poktan | #10, #11, #15 | belum ada | **BANGUN** (fase 3) |

> **E5 adalah satu-satunya kapabilitas dalam kelompok ini yang petani mau isi untuk
> dirinya sendiri.** E1–E3 dibayar oleh pembeli hilir, dan itu sah — tapi ia menempatkan
> pencatatan sebagai kerja untuk orang lain, yang persis pola kegagalan ke-3 di bagian 3.3.
> Buku kas membalik arahnya: petani mencatat karena ia sendiri ingin tahu untungnya berapa,
> dan catatan itu **kebetulan** memenuhi sebagian besar kebutuhan bukti. Ini penerapan
> paling langsung dari "satu rekaman, banyak bacaan".

### F · BUKTI & AKSES — hilir yang menarik hulu

| # | Kapabilitas | Untuk siapa | Keputusan yang diubah | Keadaan data | Putusan |
|---|---|---|---|---|---|
| F1 | Berkas bukti bertulang SNI 8969 | offtaker, sertifikator | #16 | penyusun **selesai** | **BANGUN** permukaannya (fase 3) |
| F2 | Ekspor data petani yang bisa dibaca tanpa platform ini | petani, koperasi | kepemilikan data | **selesai** — `ekspor-petani.mjs` | **selesai** |
| F3 | Ketertelusuran petak → lot | eksportir, offtaker | akses pasar | butuh geometri + persetujuan | **TUNDA** (T2) |
| F4 | Berkas siap-ajukan kredit & asuransi | petani, poktan, bank, asuransi | #11, #12 | butuh E5 dulu | **BANGUN belakangan + SAMBUNG** (SIAP) |

> **F4 menjawab kendala yang disebut sendiri oleh pelaksana AUTP:** hambatannya
> administrasi, bukan tarif — premi petani Rp36.000/ha/musim sudah sangat rendah, tapi
> berat diurus untuk lahan 0,2–0,3 ha. Berkas yang terisi sendiri dari catatan musim
> memindahkan beban itu dari petani ke mesin. **Syaratnya E5 lebih dulu** — tanpa catatan,
> tidak ada yang bisa diisikan.

### G · JEJARING — yang tidak bisa dilakukan sendirian

| # | Kapabilitas | Untuk siapa | Keputusan yang diubah | Keadaan data | Putusan |
|---|---|---|---|---|---|
| G1 | Alur kontribusi & tinjauan protokol dengan reviewer **bernama** | agronom, dosen, BSIP, penyuluh | mutu & legitimasi korpus | `Contributor` + `conflict_of_interest` **ada di skema** | **BANGUN** |
| G2 | Umpan balik lapangan menaikkan tingkat bukti D→A | semua | apakah korpus hidup | `DeviationReason.signals` **ada** | **BANGUN** (fase 3) |
| G3 | Pelaporan gejala oleh warga → peta gejala wilayah | petani, POPT, pemda | #8, peringatan dini | belum ada; rantai POPT sudah ada | **BANGUN hati-hati + SAMBUNG** |
| G4 | API publik | integrator, pemerintah, peneliti | interoperabilitas | terhalang **3 keputusan**, bukan kode | **TUNDA** |
| G5 | Identitas petak stabil tanpa memiliki geometrinya | semua | dasar semua rekaman | `L7` sudah menolak geometri publik; AgStack GeoID sebagai preseden | **BANGUN** |

> **G3 punya satu bahaya yang harus dirancang lebih dulu, bukan ditambal.** Laporan gejala
> dari warga adalah data mentah; **menyebutnya wabah adalah kesimpulan.** Peta yang
> menampilkan titik-titik laporan tanpa verifikasi bisa memicu penyemprotan massal yang
> tidak perlu — dan kerugiannya ditanggung petani, sementara yang untung penjual pestisida.
> Karena itu perannya **memberi lengan pada rantai POPT yang sudah ada**, bukan
> menggantikannya: laporan warga masuk sebagai pengamatan, verifikasi tetap milik POPT.

### Rekapitulasi putusan — 39 kapabilitas

| Putusan | Jumlah | Nomor |
|---|---:|---|
| **selesai** | 4 | C1, D1, D2, F2 |
| **BANGUN** — gelombang 0–1 | 16 | A1, A2, A3, A5, B1, B2⁽ᵖ⁾, B3, B4, C2, C3⁽ᵇ⁾, C7, D3, D4, D5, G1, G5 |
| **BANGUN** — gelombang 2 · fase 3 | 7 | E1, E2, E3, E4, E5, F1, G2 |
| **BANGUN hati-hati** | 1 | G3 — juga **SAMBUNG** ke rantai POPT |
| **PINJAM / SAMBUNG** | 4 | C4⁽ᵖ⁾, C5, C6, C9⁽ᵗ⁾ |
| **TUNDA** | 7 | A4, B5, C8, D6, F3, F4⁽ᵈ⁾, G4 |

⁽ᵖ⁾ sebagian — B2 tanpa PHI; C4 sisi acuan dipinjam, sisi setoran petani dibangun.
⁽ᵇ⁾ bertahap — 10 dari 778 OPT hari ini.
⁽ᵗ⁾ tertunda sampai status subsidi punya jalur data; sambungannya ke e-RDKK bisa lebih dulu.
⁽ᵈ⁾ dibangun belakangan, setelah E5 berjalan.

> **Angka yang paling menentukan bukan 16, melainkan 6.** Enam kapabilitas — C4, C5, C6,
> C9, dan sisi sambungan G3 serta F4 — dijawab dengan meminjam atau menyambung, bukan
> membangun. Semuanya menyangkut kebutuhan yang paling sering diminta pertama kali: cuaca,
> kalender tanam, harga, status tanah, kuota subsidi. Godaan membangun ulang salah satunya
> akan datang, dan setiap kali ia datang jawabannya sudah tertulis di sini.

---

## 6. Urutan — ditempelkan ke tiga fase yang sudah ada

Urutan di [10-peta-modul.md](10-peta-modul.md) tidak diubah. Yang dilakukan bagian ini
**menempelkan 30 kapabilitas ke tiga fase itu**, dan menambahkan satu gelombang nol yang
seluruhnya berada di dalam lapisan gratis.

### Gelombang 0 — memperdalam yang gratis (fase 1–2, sekarang)

Semuanya berjalan sebagai berkas statis. Tidak satu pun menuntut akun, server aplikasi,
atau sumber data baru. **Ini gelombang yang paling murah dan paling langsung menjawab
"bermakna bagi petani".**

| Urut | Kapabilitas | Alasan urutannya |
|---|---|---|
| 1 | **B1** komponen batas jawaban | Prasyarat semua layar berikutnya; tanpa ini tiap layar baru menambah utang kepercayaan |
| 2 | **A3** kamus nama lokal | Menentukan apakah jalur 1 bisa dipakai orang yang belum tahu jawabannya |
| 3 | **C2** keaslian & anti-palsu | Nilai tertinggi per biaya di seluruh dokumen |
| 4 | **D4 + D5** kalibrasi & takaran | Termurah; menyentuh keselamatan; tidak butuh data baru |
| 5 | **B4** antrean pertanyaan tak terjawab | Mengubah biaya riset jadi keluaran; mengarahkan gelombang berikutnya |
| 6 | **A1** kotak tanya multimoda | Setelah jalur-jalurnya layak dituju |
| 7 | **A5** luring penuh | Indeks sudah ≤48 KB — separuh jalan |
| 8 | **C7** direktori layanan | Fondasi toko tani sudah ada |
| 9 | **D3** analisis usaha tani | Pintu masuk ke E5 di gelombang berikutnya |

> Butir 1–5 semuanya bisa selesai tanpa satu pun keputusan yang masih terbuka di
> [10-peta-modul.md](10-peta-modul.md) bagian 7. Itu yang membuat gelombang ini bisa
> dimulai hari ini.

### Gelombang 1 — jangkauan & kontribusi (fase 2)

**A2** WhatsApp · **B3** sanggahan terbuka · **G1** alur kontribusi bernama ·
**G5** identitas petak · **C3** OPT bergejala bertahap · **C4/C5/C6** pinjam-sambung.

> **G1 tidak boleh menunggu fase 3.** Pertanyaan ke-5 di [02-tiga-pasar.md](02-tiga-pasar.md)
> bagian 8 — apa yang membuat agronom mau menempelkan namanya — tidak akan terjawab lewat
> wawancara. Ia terjawab dengan menyediakan alurnya, lalu melihat siapa yang datang.

### Gelombang 2 — eksekusi berbayar (fase 3)

**E1–E4** rencana, realisasi, simpangan, pengingat · **E5** buku kas ·
**F1** berkas bukti · **G2** umpan balik menaikkan tingkat bukti.

> **E5 didahulukan dari E1 di dalam gelombang ini**, meski nomornya belakangan. E1–E3
> dibayar hilir; E5 diisi karena petani ingin tahu untungnya sendiri. Yang kedua adalah
> alasan orang kembali di musim kedua.

### Gelombang 3 — menunggu pintu terbuka

**C8, C9, D6, F3, F4, G4, B5, A4.** Tak satu pun terhalang kode. Yang membukanya:
sumber data baru (C8, C9, D6), pembayar yang benar-benar ada (F3, G4), catatan yang
sudah jalan (F4), dan syarat ke-4 yang belum bisa dipenuhi (B5, A4).

---

## 7. Anti-kapabilitas — yang tidak dibangun, dan alasannya

Sama mengikatnya dengan daftar bangun. Enam pertama sudah ada di
[02-tiga-pasar.md](02-tiga-pasar.md) bagian 7; tiga terakhir tambahan dari riset ini.

| Tidak dibangun | Sebab |
|---|---|
| Lapak jual-beli input atau hasil panen | Larangan memegang barang, keputusan ke-1 dokumen fondasi |
| Pembiayaan di neraca sendiri | Pola kegagalan eFishery/TaniHub |
| Kemitraan yang menuntut seluruh hasil dijual ke satu pihak | Menutup pilihan pasar petani; itu mitra, bukan infrastruktur |
| Peringkat atau ulasan produk komersial | Ditolak `L3`; dan peringkat adalah penempatan berbayar yang menyamar |
| Kalender tanam sendiri | Katam sudah ada dan lebih baik; membangun ulang adalah pemborosan terbesar yang mungkin |
| Kalkulator hara tandingan | PHSL/Nutrient Expert sudah ada; yang kurang adalah sambungannya ke kuota subsidi |
| **Peta wabah OPT tanpa verifikasi** | Laporan warga adalah pengamatan; menyebutnya wabah memicu penyemprotan massal yang merugikan petani dan menguntungkan penjual |
| **Skor kredit petani** | Menyediakan **bahan** penilaian sah; **memberi skor** menjadikan platform ini penjaga gerbang atas akses modal — peran yang membatalkan netralitasnya |
| **Asisten yang selalu menjawab** | Melanggar syarat ke-4. Ini justru bentuk pesaing terdekat di pintu masuk |

---

## 8. Ukuran per kelompok kapabilitas

Aturan [00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md) bagian 5 berlaku penuh:
tiap angka punya definisi tertulis dan bisa ditelusuri ke catatan mentah. Semua ukuran
di bawah **naik ke metrik utara**, bukan menjadi tandingannya.

| Kelompok | Ukuran | Sinyal gagal |
|---|---|---|
| **A · Masuk** | % penelusuran yang berakhir di layar jawaban, bukan di layar nol | naik terus tanpa jawaban berubah = pintunya salah |
| **B · Jawab** | % layar jawaban yang menampilkan batasnya; jumlah sanggahan masuk & terselesaikan | nol sanggahan = tidak ada yang membaca serius |
| **C · Rujukan** | jumlah pemeriksaan keaslian; % yang berakhir "tidak ditemukan" | lonjakan "tidak ditemukan" = registri basi **atau** pemalsuan naik — keduanya harus diperiksa |
| **D · Hitung** | penggunaan berulang per pengguna anonim per musim | dipakai sekali lalu ditinggal = bukan momennya |
| **E · Rencana** | % tugas terjadwal tercatat; % simpangan beralasan **substantif** | <70% tercatat = produknya salah; <30% substantif = datanya tidak jujur |
| **F · Bukti** | waktu audit yang dihemat; berkas diterima tanpa perbaikan | ditolak auditor = tulangnya salah |
| **G · Jejaring** | kontributor bernama aktif; tingkat bukti rata-rata korpus | tingkat bukti tidak naik semusim = korpus mati |

Dua ambang pembatalan di [02-tiga-pasar.md](02-tiga-pasar.md) bagian 7 tetap berlaku
apa adanya, dan sudah tercermin di baris **E**.

---

## 9. Yang harus diuji Fase 1 — tujuh pertanyaan dari dokumen ini

Ditambahkan ke lima pertanyaan di [02-tiga-pasar.md](02-tiga-pasar.md) bagian 8, diurutkan
menurut kerusakan kalau jawabannya berbeda dari dugaan.

1. **Apakah petani atau kios benar-benar memeriksa nomor pendaftaran sebelum membeli —
   atau keputusan itu sudah selesai sebelum karung dilihat?** Kalau yang kedua, C2 harus
   dirancang untuk kios dan penyuluh, bukan petani, dan seluruh urutan gelombang 0 berubah.
2. **Nama lokal apa yang sebenarnya dipakai** untuk sepuluh OPT cabai yang sudah terkurasi,
   di dua sampai tiga sentra? Ini masukan langsung A3, dan bisa dikumpulkan di wawancara
   yang sama tanpa tambahan biaya.
3. **Berapa kali dalam semusim seorang petani menghitung ongkos?** Menentukan apakah D3
   punya momen, atau cuma terasa berguna saat ditanyakan.
4. **Siapa yang menakar dosis di lahan** — petani sendiri atau buruh semprot? Menentukan
   siapa pengguna D4/D5, dan bahasanya.
5. **Apakah buku kas per petak sudah ada dalam bentuk apa pun?** Kalau ya, E5 adalah
   pemindahan bentuk — jauh lebih mudah diterima daripada kebiasaan baru.
6. **Apa yang terjadi hari ini ketika seseorang mencurigai pupuk palsu?** Ada jalur
   laporannya atau tidak, dan siapa yang menanganinya. Menentukan apakah C2 berhenti di
   pemeriksaan atau berlanjut ke pelaporan.
7. **Berapa besar sebenarnya jarak antara harga acuan Bapanas dan harga yang diterima
   petani** di sentra beachhead? Kalau jaraknya kecil, C4 cukup dipinjam. Kalau besar,
   setoran petani menjadi wajib — dan itu kapabilitas yang jauh lebih berat.

> **Cara memakai dokumen ini** — sama seperti [02-tiga-pasar.md](02-tiga-pasar.md): ini
> usulan, bukan keputusan terkunci. Kolom **pemegang de facto** di bagian 2 adalah
> hipotesis dari data sekunder, dan seluruh urutan gelombang 0 bergantung padanya. Bawa
> tujuh pertanyaan di atas ke wawancara Fase 1, lalu kembali dan ubah bagian 2 dan 6.

---

## 10. Sumber

**Benchmarking luar negeri**

- Digital Green — [Farmer.Chat: Scaling AI-Powered Agricultural Services for Smallholder Farmers](https://arxiv.org/html/2409.08916v1); [Impact](https://digitalgreen.org/global-impact/)
- Precision Development — [RCT layanan advisori digital, padi Odisha](https://precisiondev.org/wp-content/uploads/2025/02/Odisha_RCT_02052025.pdf)
- IFPRI — [Beyond the model: evaluating AI agricultural advisory systems](https://www.ifpri.org/blog/beyond-the-model-evaluating-ai-agricultural-advisory-systems-so-they-work-in-the-field/)
- PlantVillage Nuru — [akurasi pada penyakit virus singkong (Frontiers in Plant Science)](https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2020.590889/full); [CGIAR Big Data Platform](https://bigdata.cgiar.org/digital-intervention/plantvillage-nuru-pest-and-disease-monitoring-using-ai/)
- Plantix — [Aplikasi Plantix sebagai alternatif pendeteksi OPT (Cyber Extension Kementan)](http://cybex.pertanian.go.id/artikel/80573/aplikasi-plantix-sebagai-alternatif-pendeteksi-opt/); [CropLife Indonesia](https://croplifeindonesia.or.id/identifikasi-penyakit-tanaman-berbasis-digital/)
- CGIAR — [Excellence in Agronomy](https://eia.cgiar.org/); [AgWise dan penutupan senjang hasil](https://www.cgiar.org/news-events/news/raising-productivity-and-profits-how-agwise-is-closing-yield-gaps-through-ai/); [adopsi RiceAdvice di Nigeria](https://www.tandfonline.com/doi/full/10.1080/1389224X.2023.2222109)
- AgriStack India — [ISSCA/ICRISAT](https://issca.icrisat.org/scalable-solutions/digital-public-infrastructure-for-agriculture-agristack); [implementasi & Digital Agriculture Mission](https://www.global-agriculture.com/india-region/implementation-of-agristack-and-digital-agriculture-mission/)
- Beckn — [Unified Krishi Interface](https://uki.becknprotocol.io/); [UP Open Network for Agriculture](https://www.indianweb2.com/2025/01/up-govt-launches-ondc-like-open-network.html)
- Sumber terbuka — [OpenTEAM](https://openteam.community/), [farmOS (FAO)](https://www.fao.org/family-farming/detail/en/c/1633160/), [AgStack (Linux Foundation)](https://agstack.org/news/the-linux-foundation-launches-agstack-an-open-source-digital-infrastructure-project-for-agriculture-to-enable-a-global-collaboration-of-industry-government-and-academia/)
- Ketertelusuran — [Koltiva](https://www.koltiva.com/), [perangkat kepatuhan EUDR Koltiva](https://www.koltiva.com/global-eudr-compliance-tools-for-upstream-and-downstream-businesses), [Farmforce](https://farmforce.com/)
- FAO — [Digital Agriculture and AI Innovation](https://www.fao.org/innovation/digital-agriculture-and-ai-innovation/en); [kebijakan registri petani digital](https://www.rfilc.org/wp-content/uploads/2026/01/Policy-Brief-Transforming-Agriculture-Through-Digital-Farmer-Registries.pdf)
- J-PAL — [meningkatkan layanan informasi & penyuluhan pertanian](https://www.povertyactionlab.org/policy-insight/improving-agricultural-information-and-extension-services-increase-small-scale)

**Sistem Indonesia**

- Katam Terpadu — [BSIP Jawa Tengah](https://jateng.bsip.pertanian.go.id/layanan/layanan-lainnya/katam-terpadu-sc); [Cyber Extension](http://cybex.pertanian.go.id/artikel/89739/kalender-tanam-terpadu-katam-terpadu/)
- Uji tanah & hara spesifik lokasi — [BBPadi, pemupukan berimbang spesifik lokasi](https://bbpadi.litbang.pertanian.go.id/index.php/info-berita/info-teknologi/penerapan-pemupukan-berimbang-spesifik-lokasi); [PUTS (Cyber Extension)](https://cybext.id/detail/materi/instrumen-menentukan-status-hara-tanah-sawah-melalui-penggunaan-perangkat-uji-tanah-sawah-(puts)-)
- Harga — [Panel Harga Pangan Bapanas, harga produsen](https://panelharga.badanpangan.go.id/harga-produsen); [PIHPS Bank Indonesia](https://www.bi.go.id/hargapangan)
- Iklim — [Sekolah Lapang Iklim BMKG](https://iklim.bmkg.go.id/SLI/main/); [sinergi BMKG–Kementan untuk ketahanan pangan](https://www.bmkg.go.id/berita/utama/bmkg-dan-kementerian-pertanian-perkuat-sinergi-data-iklim-dan-teknologi-cuaca-untuk-ketahanan-pangan-nasional)
- OPT — [peran POPT dalam pengamatan & peringatan dini](https://distankan.bulelengkab.go.id/informasi/detail/artikel/56_peran-popt-dalam-mengawal-produksi-pertanian-dari-ancaman-hama-penyakit-banjir-dan-kekeringan); [SILAP OPT (BBPPTP Medan)](https://silapopt.com/)
- Asuransi — [AUTP: premi, ganti rugi, dan kendala administrasi (Koran Jakarta)](https://koran-jakarta.com/2026-01-30/pengamat-asuransi-usaha-tani-padi-jadi-tameng-petani-hadapi-risiko-gagal-panen); [tantangan implementasi (Eratani)](https://eratani.co.id/blog/article/read/Asuransi-Usaha-Tani-Padi-Manfaat-dan-Tantangan-dalam-Implementasinya)
- Data — [Portal Satu Data Pertanian](https://satudata.pertanian.go.id/); [Basis Data Statistik Pertanian](https://bdsp2.pertanian.go.id/bdsp/)
- Penyuluhan — [Cyber Extension](https://cybext.id/)
- Mekanisasi — [Brigade Pangan & alsintan (Pusat Pustaka BPPSDMP)](https://pustaka.bppsdmp.pertanian.go.id/index-berita/perkuat-kinerja-brigade-pangan-alat-mesin-pertanian-jadi-andalan)

**Angka konteks**

- Pupuk palsu — [Kementan: potensi kerugian petani Rp3,2 triliun (ANTARA, 2025)](https://www.antaranews.com/berita/4961457/mentan-temukan-pupuk-palsu-potensi-rugikan-petani-rp32-triliun); [berkembang jadi Rp3,3 triliun, hulu ke hilir (Pasardana, April 2026)](https://pasardana.id/news/2026/4/24/negara-rugi-rp33-triliun-mentan-sebut-kasus-pupuk-palsu-berkembang-dari-hulu-ke-hilir)
- Benih palsu — [penindakan Karantina Lampung, Feb–Apr 2026](https://lampung.tribunnews.com/lampung/1215006/bibit-sawit-palsu-ancam-gagalkan-panen-petani-berpotensi-rugi-rp42-miliar)
- NTP — [Juli 2026 di 127,84; hortikultura turun 8,49%](https://ekonomi.bisnis.com/read/20260803/12/1993127/nilai-tukar-petani-juli-2026-naik-jadi-12784-harga-ternak-dan-hortikultura-masih-tertekan); [Mei 2026 di 127,73; hortikultura naik 7,08%](https://ekonomi.bisnis.com/read/20260602/99/1977759/bps-nilai-tukar-petani-naik-jadi-12773-mei-2026-ditopang-hortikultura)
- Susut pascapanen — [Ditjen Hortikultura Kementan](https://hortikultura.pertanian.go.id/seberapa-pentingkah-kerugian-akibat-penyakit-pasca-panen-pada-komoditas-hortikultura/); [kajian FAO–Kementan di Banyuwangi, Brebes, Cianjur](https://greennetwork.id/gna-knowledge-hub/fao-dan-kementan-kaji-penyebab-kehilangan-pangan-hortikultura/)
- Regenerasi petani — [krisis regenerasi (MAP UGM)](https://map.ugm.ac.id/wp-content/uploads/sites/290/2025/12/Nurani_Krisis-Regenerasi-Petani-1.pdf); [ANTARA](https://www.antaranews.com/berita/4431445/regenerasi-petani-untuk-pertanian-berkelanjutan)
- Adopsi digital petani — [BPS via ANTARA: 46,84% petani, 80,24% pengguna di atas 39 tahun](https://www.antaranews.com/berita/3854265/bps-4684-persen-petani-pakai-alsintan-modern-dan-teknologi-digital)
- Agritech Indonesia — [pelajaran dari kegagalan startup agrikultur](https://www.kompasiana.com/yayan81561/6832f64e34777c048e714222/starup-agrikultur-gagal-panen-pelajaran-bagi-masa-depan-pangan-indonesia); [Semaai](https://semaai.id/), [Eratani](https://eratani.co.id/en), [Elevarm (e27)](https://e27.co/elevarm-agritech-20250603/)
- Asisten berbasis WhatsApp — [AgriAgent "Kang Tani"](https://blog.agriagent.co.id/cara-pakai-fitur-tanya-kang-tani-agriagent-untuk-pemula/)

**Internal**

[00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md) · [02-tiga-pasar.md](02-tiga-pasar.md) ·
[03-enam-pintu.md](03-enam-pintu.md) · [10-peta-modul.md](10-peta-modul.md) ·
[11-instrumentasi.md](11-instrumentasi.md) · [toko_data/LAPIS.md](../toko_data/LAPIS.md)

---

## 11. Catatan tentang keterbatasan riset ini

Empat hal yang harus diketahui pembaca sebelum memakai dokumen ini sebagai dasar
keputusan bangun:

1. **Seluruhnya data sekunder.** Tidak ada satu pun wawancara lapangan. Kolom "pemegang
   de facto" di bagian 2 adalah hipotesis — dan bagian 9 menyebutkan persis apa yang
   membatalkannya.
2. **Benchmarking dilakukan dari dokumentasi publik**, bukan dari memakai sistemnya.
   Klaim akurasi Plantix (80–90%) dan sejenisnya adalah klaim penerbitnya, bukan hasil
   pengujian sendiri.
3. **Taksiran Rp3,2–3,3 triliun adalah taksiran kementerian**, bukan hasil studi
   independen dengan metodologi terbuka. Angkanya dipakai sebagai penanda skala, bukan
   sebagai dasar perhitungan pasar.
4. **Sebagian angka konteks dikutip lewat pemberitaan**, bukan dari terbitan aslinya —
   khususnya NTP dan adopsi digital. Sebelum masuk bahan penjualan atau proposal, tarik
   dari sumber BPS langsung.
