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
>
> **Jawaban lapangan pertama masuk 22 Agustus 2026** — lima dari tujuh pertanyaan
> Fase 1 dijawab pemilik repo. Satu di antaranya mengganti premis **C2**, satu membalik
> dugaan tentang **E5**, satu mengisi **A3**, dan satu memunculkan lapis yang daftar ini
> belum punya sama sekali: **G6**. Jawabannya tercantum di bagian 9.
>
> **Dikoreksi 22 Agustus 2026.** Kapabilitas **C4** semula berbunyi *"PINJAM + BANGUN"*
> dengan Panel Harga Bapanas sebagai calon pinjaman.
> [16-sumber-harga-komoditas.md](16-sumber-harga-komoditas.md) membatalkannya, dan
> ikut menjawab pertanyaan terbuka nomor 7. Tiga belas tempat diperbaiki; jejaknya
> ditinggalkan, bukan dihapus.

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
4. **Harga adalah lubang terbesar bagi petani, dan tak ada yang bisa dipinjam untuk
   menutupnya.** NTP subsektor hortikultura naik 7,08% pada Mei 2026 lalu turun 8,49% pada
   Juli 2026 — kenaikan tertinggi dan penurunan terdalam dalam satu triwulan. Versi pertama
   dokumen ini mengusulkan meminjam Panel Harga Bapanas;
   [16-sumber-harga-komoditas.md](16-sumber-harga-komoditas.md) **membatalkannya pada dua
   titik.** Panel itu mati sejak Oktober 2025 — API 401, Wayback 502, bukan gangguan sesaat.
   Dan yang dicatat negara sebagai "harga produsen" ternyata **harga beli pengumpul**:
   endpoint `GetRefMarket` PIHPS memperlihatkan Kab. Karawang — salah satu lumbung padi
   terbesar Indonesia — bersandar pada **satu responden**, dan dia pengumpul. Jarak antara
   harga acuan dan harga petani karena itu **terpasang di dalam definisinya**, bukan celah
   cakupan yang bisa dirapatkan dengan menambah sampel. Harga yang benar-benar diterima
   petani tidak punya sumber sama sekali.
5. **"Bermakna bagi semua pemangku kepentingan" tidak dicapai dengan satu modul per
   pihak.** Dicapai dengan **satu rekaman, banyak bacaan**: catatan musim yang sama
   dibaca petani sebagai jadwal, penyuluh sebagai laporan, offtaker sebagai bukti, bank
   sebagai berkas risiko, pemerintah sebagai statistik. Menambah modul per pihak adalah
   cara termahal dan tercepat kehilangan fokus.
6. **Rata-rata umur petani 52–55 tahun dan petani muda tinggal ±11%.** Protokol berversi
   yang menyebut alasan dan tingkat buktinya bukan cuma anjuran — ia kurikulum. Ini satu-
   satunya kapabilitas yang bermakna bagi pihak yang belum jadi petani.

**Rekomendasi inti:** 40 kapabilitas dalam 7 kelompok (bagian 5), dengan putusan
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
| ~~**Panel Harga Pangan** (Bapanas)~~ | **Mati sejak Oktober 2025** — halaman pemeliharaan, seluruh endpoint API 401, Wayback 502 | **BATAL.** Penggantinya di [16](16-sumber-harga-komoditas.md) |
| **SP2KP Kemendag** | Eceran harian, 1.229 pasar, Jan 2024→; **satu-satunya harga harian pemerintah berlisensi terbuka** | **PINJAM.** Atribusi wajib; endpoint utamanya membocorkan PII pencacah — pakai yang bersih |
| **PIHPS** Bank Indonesia | Eceran, grosir, dan "produsen" — yang terakhir sebenarnya harga pengumpul | **PINJAM terbatas, berlabel jujur.** Benih privat, bukan lapis terbit |
| **Survei Harga Produsen Gabah** BPS | **Satu-satunya sumber resmi yang benar-benar bertanya kepada petani** — hanya gabah, hanya bulanan, di balik kunci API | **SAMBUNG** setelah kunci WebAPI didaftarkan |
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
   dipasarkan seolah umum. Angka kita telanjang: **0 dari 676 OPT registri punya deskripsi
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
| Diagnosis OPT | Plantix, Nuru, POPT | sedang | gejala terkurasi berbahasa lokal; **0 dari 676** |
| Harga eceran | SP2KP Kemendag | baik, lisensi terbuka | sambungan ke biaya petak sendiri |
| **Harga yang diterima petani** | **tidak ada** | — | **menganga — dan bukan celah cakupan, melainkan definisi** |
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

1. **Keaslian input** — memeriksa **kandungan yang tercetak** pada yang di tangan, sebelum
   dipakai. Datanya sudah ada (14.920 produk terdaftar, 96,4% pestisida berkomposisi); yang
   kurang cuma pintunya.
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

## 5. Rekomendasi kapabilitas — 40 kapabilitas, 7 kelompok

Kolom **putusan** memakai lima kata, dan artinya mengikat:

- **BANGUN** — dikerjakan di sini; tidak ada yang mengerjakannya cukup baik
- **PINJAM** — datanya diambil dari sumber yang ada; jangan bikin tandingan
- **SAMBUNG** — jembatan ke sistem negara; jangan gantikan
- **TUNDA** — perlu, tapi terhalang lubang data atau pendapat hukum — **bukan terhalang kode**
- **JANGAN** — di luar cakupan secara permanen

### A · MASUK — bagaimana orang bertanya

| # | Kapabilitas | Untuk siapa | Keputusan yang diubah | Keadaan data | Putusan |
|---|---|---|---|---|---|
| A1 | Satu kotak tanya multimoda — teks bebas, gejala, nama di kemasan, foto — yang **merutekan** ke jalur, bukan menjawab sendiri | semua | menentukan pintu | **sebagian** 23 Agustus 2026 — sediaan masuk pencarian (jalur 5 & 6 kini terjangkau), perutean niat ke empat alat; **foto tidak dibangun**. **Papan pencarian disamakan dengan kotaknya** 24 Agustus 2026: kesebelas macam masukan yang benar-benar dijawab kini punya kepingnya di beranda (semula empat), dan ketujuh alat punya kartunya (semula dua, dan keduanya salah dinomori sebagai jalur 07–08) | **sebagian** |
| A2 | Kanal WhatsApp untuk tanya-jawab yang sama | petani, penyuluh, kios | keterjangkauan | **sebagian** 23 Agustus 2026 — `app/teruskan.js`, kartu teruskan di jalur 2, 5, dan 6. Sisi **menyebarkan** dibangun; sisi **kotak masuk** tetap tidak, dan itu putusan | **sebagian** |
| A3 | **Kamus nama lokal** — sinonim daerah untuk OPT, komoditas, gejala, dan nama dagang | semua | apakah pintunya bisa dipakai sama sekali | **sisi OPT selesai** 23 Agustus 2026 — 6 nama di `spec/vocab/nama-lokal.json`, tercari dari beranda dan tampil di jalur 1; komoditas & nama dagang belum | **sebagian** |
| A4 | Masuk lewat suara & gambar untuk literasi rendah | petani | keterjangkauan | belum ada | **TUNDA** |
| A5 | Mode luring penuh (PWA yang menyimpan indeks) | petani, petugas lapang | dipakai di lahan atau tidak | **sebagian** 23 Agustus 2026 — `sw.js` tiga tingkat: cangkang & kosakata kecil otomatis, kepala pencarian atas permintaan, rincian menyusul saat dibuka | **sebagian** |

> **Papan pencarian tertinggal dari kotaknya, dan jaraknya melebar diam-diam
> — diperbaiki 24 Agustus 2026.** Kapabilitas A1 diukur dari apa yang dijawab kotaknya;
> yang tidak ikut diukur adalah apa yang **diakui** permukaannya. Keduanya berpisah tanpa
> satu pun galat:
>
> 1. **Kotak menjawab sebelas macam masukan; papan menyebut empat.** Nama pestisida, nama
>    lokal hama, nama OPT registri, resep sediaan, perusahaan, harga komoditas, dan
>    pertanyaan tentang alatnya sudah tercari — dan tidak satu pun disebut sebelum ada yang
>    diketik. Yang mengetik nama pestisidanya lalu dijawab kosong menyimpulkan barangnya
>    tidak terdaftar; yang meleset sebenarnya dugaannya tentang apa yang boleh diketik.
> 2. **Lima alat yang sudah selesai hanya hidup sebagai tautan kaki.** D3, D4/D5, C7, E1,
>    dan E5 sudah jadi tujuan perutean niat — kotaknya tahu jalan ke sana — tetapi papannya
>    tidak menampilkan satu pun. Kapabilitas yang dibangun dan tidak diakui permukaannya
>    terhitung setengah dibangun.
> 3. **Dua layar yang bukan jalur diberi nomor jalur.** Papan menomori harga `07` dan
>    profil perusahaan `08`, padahal keduanya tidak memanggil `catatBuka()` dan karena itu
>    tidak ada di tabel [11-instrumentasi.md](11-instrumentasi.md). Ini persis yang
>    dihindari saat `takaran.html` diputuskan **bukan** "jalur ketujuh" — aturannya benar,
>    penerapannya yang bocor satu papan kemudian.
>
> Yang membuat ketiganya bisa melebar diam-diam: tidak ada satu pun tempat yang memaksa
> kotak dan papan disebut bersama. Dua aturan yang dipasang sekarang bisa diperiksa, bukan
> diingat:
>
> - **Satu keping per kelompok hasil.** Keping tanpa kelompok menjanjikan yang tidak ada;
>   kelompok tanpa keping menyembunyikan yang ada.
> - **Tiap kartu di papan bisa dicapai dari kotak** — lewat namanya kalau layarnya punya
>   entitas (keenam jalur, profil perusahaan), lewat `NIAT` kalau tidak (kalibrasi,
>   direktori, titik impas, rencana musim, buku kas).
>
> Kesebelas keping diuji balik terhadap indeks saat dipasang: tidak satu pun berakhir nol.

> **A3 lebih penting daripada tampaknya.** Petani tidak menyebut *Thrips parvispinus*; ia
> menyebut nama lokalnya. Tanpa kamus itu, jalur 1 hanya bisa dipakai orang yang sudah
> tahu jawabannya. Ini juga satu-satunya kapabilitas yang menjadi lebih baik justru karena
> sumbangan pengguna — dan karena itu pintu masuk termurah ke kontribusi.
>
> **Enam nama pertama sudah ada:** *bule, patek, lodoh, layu, bercak daun, keriting daun.*
> Peringatan yang datang bersamanya sama pentingnya dengan namanya: **setiap daerah
> berbeda.** Jadi kamusnya tidak boleh berbentuk satu daftar nasional — ia perlu tahu
> nama itu dipakai di mana, dan berani mengatakan tidak tahu di luar wilayah itu.

> **Sisi OPT dibangun 23 Agustus 2026** — `spec/schema/nama-lokal.schema.json` dan
> `spec/vocab/nama-lokal.json`, tercari dari beranda dan tampil di blok "pastikan dulu"
> jalur 1. Tiga hal yang baru ketahuan saat membangunnya:
>
> 1. **Empat dari enam nama tidak menunjuk satu OPT.** "Layu" tidak membedakan fusarium
>    dari bakteri; "bule" dan "keriting daun" tidak membedakan virus kuning dari trips.
>    Skemanya karena itu mewajibkan `ambiguous_note` begitu rujukannya lebih dari satu —
>    ketaksaan jadi isi jawaban, bukan cacat yang ditutup dengan memilih salah satu.
> 2. **Dua dari enam tidak bisa dipetakan sama sekali**, dan salah satunya mengungkap
>    kekosongan cakupan: "bercak daun" kemungkinan besar serkospora, yang bukan salah satu
>    dari OPT terkurasi. Keduanya tetap tercatat dan tetap tampil, karena hasil nol
>    terbaca sebagai "tidak ada penyakitnya".
> 3. **Peringatan wilayah bisa ditegakkan skema, bukan cuma diingat.** `regions` kosong
>    wajib disertai `region_unknown_reason`. Keenam nama memakainya, karena "umumnya"
>    bukan nama tempat.
>
> Pertanyaan terbuka **seberapa jauh nama lokal berbeda antarsentra** tidak ikut terjawab,
> dan sekarang justru lebih tajam: kamusnya siap menampung wilayah, tetapi belum ada satu
> pun wilayah untuk ditampung.

### B · JAWAB — mutu dan batas jawaban

| # | Kapabilitas | Untuk siapa | Keputusan yang diubah | Keadaan data | Putusan |
|---|---|---|---|---|---|
| B1 | **Komponen "batas jawaban"** — tiap layar menyebut tingkat bukti, tanggal, sumber, dan apa yang tidak diketahuinya | semua | apakah jawabannya dipercaya | **selesai** 23 Agustus 2026 — `app/batas.js`, dipakai ketujuh layar | **selesai** |
| B2 | Kartu keselamatan aplikasi — APD, cara aman, gejala keracunan, kontak darurat | petani, buruh tani | keselamatan jiwa | sebagian ada; **PHI 0 dari 23.058** | **BANGUN** bagian non-PHI; PHI **TUNDA** |
| B3 | **Sanggahan terbuka** — siapa pun boleh menantang satu fakta; jejaknya publik dan bernama | agronom, penyuluh, principal | mutu korpus | belum ada | **BANGUN** |
| B4 | **Antrean pertanyaan tak terjawab** — yang tidak bisa dijawab dicatat sebagai kebutuhan data | tim, kontributor | prioritas data berikutnya | **selesai** 23 Agustus 2026 — enam lubang tercacah di `app/ukur.js`, terbaca di `ukur.html` | **selesai** |
| B5 | Ringkasan berbasis model bahasa di atas registri | semua | kecepatan paham | **sebagian 23 Agustus 2026** — komentar per seri harga, ditulis saat build ke `spec/vocab/harga/komentar.json` beserta angka yang dipakai menulisnya | **TUNDA** untuk registri; **BANGUN** untuk harga, dengan bentuk yang menjawab keberatannya |

> **B4 mengubah biaya riset menjadi keluaran produk.** Setiap "tidak sanggup" yang
> ditampilkan enam jalur hari ini menghilang begitu layar ditutup. Dicatat, ia menjadi
> peta permintaan data yang tidak bisa dibeli dari mana pun — dan itulah yang menentukan
> registri mana yang layak ditarik berikutnya.

> **Dibangun 23 Agustus 2026**, dan bentuknya ditentukan satu tabrakan antar-dokumen.
> [11-instrumentasi.md](11-instrumentasi.md) bagian 3 sudah menyatakan **isi pencarian
> sengaja tidak diukur** — jejak minat bisa mengenali orang di desa kecil. B4 versi kaya,
> yang mencatat kuerinya sendiri, akan mencabut baris itu.
>
> Tabrakannya ternyata semu: yang diminta dokumen ini *"registri **mana** yang layak
> ditarik berikutnya"*, dan itu pertanyaan **kategori**. Jadi B4 dibangun sebagai
> **pencacah lubang yang sudah dinyatakan** — enam kunci yang sama dengan `meta.tidakAda`,
> yang sudah tercetak di tiap layar lewat blok batas jawaban **B1**. B1 menyatakan
> lubangnya; B4 menghitung berapa kali ia benar-benar ditabrak, lalu mengurutkannya
> menurut frekuensi alih-alih menurut tebakan tim.
>
> Versi yang mencatat kueri **tidak** dibangun, dan tanda tangan `catatLubang(sumber,
> kunci)` sengaja tidak menyediakan tempat untuknya. Mencabut baris di dokumen 11 adalah
> keputusan pemilik repositori, bukan akibat sampingan dari membangun sebuah fitur.
>
> Satu lubang sengaja masuk daftar walau bukan permintaan data: `takaranRumahTangga`.
> Registri tidak akan pernah memuat ukuran tutup botol siapa pun — kalau ia sering
> tertabrak, yang perlu ditulis **panduan**, dan mengetahui itu sama berharganya.
>
> **B5 ditunda karena syarat ke-4, bukan karena teknologi.** Asisten yang selalu menjawab
> tidak punya cara salahnya ketahuan. Pesaing terdekat di pintu masuk justru berbentuk itu
> — dan tepat di situ pembedanya.
>
> **Diperbarui 23 Agustus 2026 — keberatannya tidak dicabut, ia dipenuhi.** Komentar per seri
> harga sekarang ada, dan bentuknya seluruhnya diturunkan dari kalimat di atas. Kalau
> masalahnya "tidak punya cara salahnya ketahuan", maka yang harus dibangun adalah cara
> salahnya ketahuan:
>
> 1. **Ditulis sekali saat build, bukan saat halaman dibuka.** Kalimat yang lahir dan mati di
>    dalam satu sesi tidak bisa ditinjau siapa pun. Yang tertulis ke berkas bisa: ia
>    bertanggal, masuk riwayat git, dan selisih antar-bangunan bisa dibaca.
> 2. **Angka yang diberikan ke penulisnya ikut disimpan** di medan `fakta` pada rekaman yang
>    sama. Peninjau tidak perlu memercayai kalimatnya — ia bisa memeriksanya.
> 3. **Tingkatnya D, bukan B.** Angkanya bertingkat B; kalimatnya tafsir atas angka, dan
>    tafsir tidak mewarisi tingkat sumbernya. Layar menyebutkannya di kepala kartu.
> 4. **`ditinjau` masih null pada keempat puluh tiga rekaman**, dan layar mengatakannya.
>    Tingkatnya naik saat seorang manusia membacanya, bukan saat modelnya diganti.
> 5. **Tiap komentar wajib menyebut satu hal yang angkanya tidak katakan.** Layar yang hanya
>    menyatakan temuan terbaca lebih yakin daripada datanya.
>
> Sisi registri **tetap ditunda**. Yang membedakan keduanya bukan teknologinya melainkan
> ukurannya: 43 seri harga bisa ditinjau seorang manusia dalam satu sore, 14.920 produk tidak.

### C · RUJUKAN — registri

| # | Kapabilitas | Untuk siapa | Keputusan yang diubah | Keadaan data | Putusan |
|---|---|---|---|---|---|
| C1 | Registri input terdaftar — pupuk, pestisida, benih | semua | #3, #4, #6, #9 | **selesai** — 14.920 produk, 11.227 varietas, dan sejak 23 Agustus 2026 **3.136 badan pemegang** beserta halaman profilnya | **selesai** |
| C2 | **Keaslian & anti-palsu** — periksa **kandungan yang tercetak di kemasan**, bukan nomor pendaftaran | petani, kios, penyuluh, principal | #4, #6 — sebelum uang keluar | **sisi pupuk selesai** 23 Agustus 2026 — indeks `kandungan/` memuat 12.564 produk, formulir di jalur 2; sisi pestisida terindeks tetapi belum berpermukaan | **sebagian** |
| C3 | Kamus OPT bergejala penuh | petani, penyuluh, POPT | #8 | **106 dari 782**; 0 dari 676 di registri. **Sisi pintu selesai** 23 Agustus 2026 — 646 OPT registri berproduk kini terjangkau dari kotak menurut nama, dengan pernyataan bahwa gejalanya tidak ada. Kurasi komoditas demi komoditas berjalan sejak 28 Agustus 2026 lewat `spec/tools/kurasi-opt.mjs`; daftar mutakhirnya di docs/14 | teks gejala **BANGUN bertahap**; pintunya **selesai** |
| C4 | Harga — eceran dipinjam, **harga petani dibangun** | petani, poktan, offtaker | #1, #13, #15 | **sisi eceran selesai 23 Agustus 2026** — 43 seri harian nasional, 635 tanggal, satu permintaan ke SP2KP. **Sisi harga petani tidak lagi nol** (dikoreksi 23 Agustus 2026): 8 seri tingkat pekebun dari **6 provinsi sawit**, dua di antaranya harga pekebun **swadaya**. Tetapi ia hanya SAWIT, dan pangan pokok tetap nol | sisi eceran **selesai**; sisi petani **sebagian** — sawit ada, pangan belum; **pembanding di perangkat selesai** 23 Agustus 2026, **setoran tidak dibangun** dan itu putusan |
| C5 | Cuaca & iklim per lokasi | petani, penyuluh | #2, #7, #13 | 0 | **PINJAM** (BMKG) |
| C6 | Lahan & tanah — status hara, jenis tanah, ketinggian | petani, penyuluh | #5, #6 | 0; peta status hara & PUTS ada di luar | **PINJAM + SAMBUNG** |
| C7 | **Direktori layanan** — kios resmi, penyuluh, POPT, lab, penangkar, jasa alsintan | semua | #4, #9, #10 | **empat dari enam** 23 Agustus 2026 — toko tani & penjual benih tampil; **5.844 balai penyuluhan** dan **889 laboratorium** (17 beresidu) **kini tampil** — balai ditelusuri menurut kecamatan, laboratorium disaring menurut kemampuan; penangkar & alsintan nol. Semula: **sebagian** 23 Agustus 2026 — `app/toko.html`: 234 berkoordinat (OSM) + 2.248 berwilayah. Penyuluh, POPT, lab, alsintan **nol** | **sebagian** |
| C8 | Sifat agronomi varietas | petani, penyuluh, penangkar | #3 | **0 dari 11.227** | **TUNDA** |
| C9 | Status & kuota pupuk bersubsidi | petani, kios, penyuluh | #6 — keputusan termahal | status & kuota **0 dari 7.196**; sisi **HET** bebas hak cipta, tetapi **harga pupuk eceran di SP2KP ternyata kosong** — Urea, NPK, SP-36, dan ZA terdaftar tanpa satu pun angka terisi | **TUNDA + SAMBUNG** (e-RDKK); sisi HET **BANGUN** dari teks peraturan, bukan dari SP2KP |

> **C7 dibangun 23 Agustus 2026, dan satu angka di tabel ini terkoreksi karenanya.**
> Baris C7 semula berbunyi *"2.181 benih TTI beralamat"*. Terhitung dari berkasnya, hanya
> **92 dari 2.248 — 4,1%** — menyebut sesuatu yang lebih rinci daripada kabupaten atau
> kota; nol dari 2.181 rekaman TTI memuat alamat jalan. **Nama tanpa alamat tidak bisa
> dituju**: ia bukti bahwa penjual benih ada di sana, bukan petunjuk ke mana pergi.
>
> Akibatnya layarnya dua pintu, bukan satu daftar: 234 titik OSM dicari menurut **jarak
> dari posisi pembaca** (dihitung di peranti; posisi tidak pernah dikirim ke mana pun),
> dan 2.248 rekaman berwilayah ditelusuri menurut **wilayah**, dengan tiap baris menyebut
> apakah ia punya alamat atau hanya nama kabupaten. Menggabungkan keduanya akan membuat
> yang tidak bisa dituju tampak setara dengan yang bisa.
>
> Empat dari enam layanan yang dijanjikan baris ini masih **nol rekaman** — penyuluh,
> POPT, laboratorium, jasa alsintan — dan layar mengatakannya.

> **C2 tetap kapabilitas dengan rasio nilai-terhadap-biaya tertinggi — tetapi masukannya
> diganti.** Versi pertama dokumen ini memakai **nomor pendaftaran** sebagai pintu.
> Jawaban lapangan membatalkannya: *"Tidak. Biasanya langsung lihat kemasan, cek
> kandungan."* Dan cadangan yang sudah disiapkan — pindah ke kios — ikut gugur, karena
> kios bergerak menurut **insentif principal**, motif yang berlawanan dengan pemeriksaan.
>
> **Registri membenarkannya dari sisi yang sama sekali lain.** 667 dari 7.196 pupuk —
> **9,3%** — tidak punya nomor pendaftaran sama sekali, sementara 71,3% punya komposisi.
> Dua garis bukti yang tidak berhubungan menunjuk arah yang sama, jadi keputusannya tidak
> bergantung pada satu wawancara.
>
> **Premis penggantinya lebih kuat, bukan sekadar berbeda:** ia melacak perilaku yang
> **sudah terjadi**, bukan perilaku yang diharapkan terjadi. Keempat syarat tetap
> terpenuhi, dan syarat keempat justru menajam — kadar yang mustahil bisa ditangkap mesin.
>
> **Batasnya berpindah, dan ia tidak hilang.** Kandungan yang cocok membuktikan **label
> sesuai dengan yang terdaftar**; ia tetap **tidak** membuktikan isi karung. Justru di
> situ bahayanya paling tajam: kasus pupuk palsu Rp3,3 triliun **persis berupa karung yang
> berbeda dari labelnya sendiri** — NPK di bawah 1% padahal minimum 15%. Pemeriksaan
> kandungan lebih kuat daripada pemeriksaan nomor, dan tetap buta terhadap isi yang
> berbohong pada labelnya sendiri. Nyatakan itu di layar, bukan di catatan kaki.
>
> **Berhenti di pemeriksaan.** Ditanya apa yang terjadi hari ini saat seseorang mencurigai
> pupuk palsu, jawabannya *"berhenti di pemeriksaan"* — tidak ada jalur lapor yang
> menampung. Jalur lapor karena itu dicabut dari cakupan C2; membangun kotak masuk yang
> tak seorang pun di ujungnya lebih buruk daripada tidak membangunnya.

> **Sisi pupuk dibangun 23 Agustus 2026** — indeks `kandungan/` (256 ember hash, 6.897
> sidik, 12.564 produk) dan formulir kandungan di jalur 2. Pelaporan **tidak** dibangun,
> sesuai putusan di atas. Tiga hal yang baru ketahuan saat membangunnya:
>
> 1. **`setara/` tidak bisa dipakai ulang walau tampak persis untuk ini.** Ia hanya
>    menyimpan kelompok berisi ≥2 anggota — padahal C2 justru paling perlu menjawab
>    produk tunggal — dan mengunci pupuk pada `formulation`, string registri yang tidak
>    tercetak di karung dan tidak diketahui pembeli. Yang dipakai di indeks baru **basis**
>    (per kilogram / per liter), karena itu yang bisa dibaca siapa pun dari kemasannya.
> 2. **Nol dari 5.130 pupuk berkomposisi memakai persen**, padahal persen justru yang
>    tercetak di karung. Kalau "%" diterima apa adanya, bentuk yang paling sering dibaca
>    orang tidak akan pernah cocok. Formulirnya karena itu menuntut kemasannya disebut —
>    kilogram atau liter — dan mengonversi 1% jadi 10 g per satuan itu.
> 3. **3.028 pestisida memakai persen sebagai satuan registri**, dan itu tidak bisa
>    dikonversi ke g/kg maupun g/L tanpa berat jenis. Persen jadi **basis ketiga** di
>    indeks: menyimpan keduanya tanpa pernah mencocokkan silang. Membuangnya berarti 40,6%
>    pestisida berkomposisi tidak bisa diperiksa sama sekali; mengonversinya berarti
>    menebak.
>
> Sisi pestisida sudah terindeks tetapi belum berpermukaan: bahan aktifnya 1.706 dan
> menuntut pencarian sendiri, bukan daftar pilihan seperti 17 hara. Itu pekerjaan UI, dan
> tidak menuntut indeks dibangun ulang.

### D · HITUNG — kalkulator yang tidak menganjurkan

| # | Kapabilitas | Untuk siapa | Keputusan yang diubah | Keadaan data | Putusan |
|---|---|---|---|---|---|
| D1 | Rp per kg hara | petani, kios, poktan | #6 | **selesai** — jalur 3 | **selesai** |
| D2 | Kebutuhan input per luas | petani, petugas lapang | #6 | **selesai** — `susun-rencana.mjs` | **selesai** |
| D3 | **Analisis usaha tani** — RAB, titik impas terhadap harga, arus kas musim | petani, poktan, koperasi, bank | #1, #11, #13, #15 | **sebagian** 23 Agustus 2026 — `app/usaha.html`: RAB dan titik impas selesai; arus kas **ditahan**, fase tak bermedan hari **Disambungkan ke rekaman musim bersama** 24 Agustus 2026: luas datang dari musim (hektare, diminta m², konversinya tercetak), RAB tersimpan per musim, dan rencana berdiri di sebelah realisasinya per kategori dari buku kas. Titik impas sengaja TIDAK dihitung ulang dari biaya yang sudah keluar. **Penanda panen menutup lubangnya** 24 Agustus 2026: hasil sebenarnya berdiri di sebelah perkiraannya, dan **harga yang benar-benar diterima** dihitung dari uang masuk ÷ kilogram dipanen — keduanya catatan pemakainya sendiri, tanpa satu pun sumber luar. | **sebagian** |
| D4 | **Kalibrasi semprot** — volume, kecepatan jalan, nozel, jumlah tangki | petani, buruh semprot | #9 + keselamatan | **selesai** 23 Agustus 2026 — `app/takaran.html` bagian 1–2 | **selesai** |
| D5 | Takaran alat rumah tangga — tutup botol, gelas, sendok | petani | #6, #9 | **selesai** 23 Agustus 2026 — `app/takaran.html` bagian 3 | **selesai** |
| D6 | Kalkulator susut & kelas mutu pascapanen | petani, bandar, offtaker | #14 | belum ada | **TUNDA** |

> **D3 dibangun 23 Agustus 2026 — sisi RAB dan titik impas.** Yang paling menentukan
> bukan aritmetikanya melainkan cara membandingkannya. Titik impas di sebelah harga eceran
> terbaca seolah selisihnya keuntungan; yang ditayangkan karena itu **rasio**, mengikuti
> aturan tayang ke-5 di [16-sumber-harga-komoditas.md](16-sumber-harga-komoditas.md).
> Layar juga menyebutkan temuan yang mengunci dokumen itu: bahkan "harga produsen" resmi
> bukan harga petani — respondennya pengumpul dan penggilingan, dan di Karawang satu orang.
>
> **Arus kas semusim ditahan.** Ia menuntut kalender bertanggal, dan kosakata fase sengaja
> tidak punya medan hari — sama seperti alasan E4 dibangun "dengan batasnya dinyatakan".
> Membangunnya sekarang berarti mengarang tanggal.

> **D4 dan D5 adalah dua kapabilitas termurah yang paling langsung menyentuh keselamatan.**
> Anjuran "2 ml per liter" tidak berguna bagi orang yang menakar dengan tutup botol, dan
> dosis label yang benar menjadi salah begitu kalibrasi tangki keliru. Keduanya tidak
> menuntut satu baris data baru — hanya aritmetika dan bentuk layar yang benar.

> **Dibangun 23 Agustus 2026** sebagai `app/takaran.html` — layar utilitas, bukan jalur
> ketujuh: `ukur.js` menghitung per jalur menurut tabel di
> [11-instrumentasi.md](11-instrumentasi.md), dan menomorinya akan mengubah tabel itu.
> Tiga hal yang baru ketahuan saat membangunnya:
>
> 1. **Dosis label ada dua keluarga yang aritmetikanya tidak berhubungan**, dan mengetahui
>    yang mana yang dipegang menentukan apakah kalibrasi perlu sama sekali. Terhitung dari
>    registri: **47,2%** per hektare, **27,3%** per liter air. Yang per liter sudah
>    menyebut kepekatannya; yang per hektare tidak bisa dihitung sebelum luas jangkauan
>    satu tangki diketahui.
> 2. **22,8% penggunaan berlabel tidak memuat dosis sama sekali** — 5.268 dari 23.058,
>    medannya kosong di registri. Untuk penggunaan itu tidak ada angka yang bisa
>    diambilkan, dan layar mengatakannya alih-alih menampilkan nol.
> 3. **Tiap pembagian harus bisa dihitung ulang pembaca, bukan sekadar ditampilkan.**
>    Versi pertama menulis `45 × 6,7 = 300 ml` — dan 45 × 6,7 sebenarnya 301,5, karena
>    jumlah tangkinya sudah dibulatkan saat ditampilkan. Pada permukaan yang menjanjikan
>    hitungannya bisa dibantah, baris yang tidak bisa direproduksi membatalkan janjinya.
>
> **Keselamatan sengaja tidak disentuh:** APD, cara mencampur, gejala keracunan, dan nomor
> darurat itu **B2**, dan menyisipkan sebagiannya di sini akan membuat layar terbaca seolah
> sudah lengkap.

### E · RENCANA & CATAT — eksekusi

| # | Kapabilitas | Untuk siapa | Keputusan yang diubah | Keadaan data | Putusan |
|---|---|---|---|---|---|
| E1 | Rencana musim dari protokol | petugas lapang, penyuluh, petani | #1–#7 | **selesai** 23 Agustus 2026 — protokol terbit ke indeks, `app/rencana.html` merendernya; keluarannya **identik** dengan `susun-rencana.mjs` untuk masukan yang sama. Protokol: **1**, draft, tingkat D | **selesai** |
| E2 | Pencatatan realisasi | petugas lapang, petani | seluruhnya | **selesai** 24 Agustus 2026 — di layar rencana yang sama; 11 alasan simpangan terbit ke indeks, jeda pencatatan dihitung sendiri, tindakan di luar rencana punya pintunya sendiri **Disambungkan ke buku kas dan ke petak** 24 Agustus 2026: satu rekaman musim+petak dipakai bersama (`app/musim.js`), biaya satu langkah masuk ke buku kas musim itu dengan kategori yang diusulkan dari kunci jenis operasinya. **Penanda panen** 24 Agustus 2026: panen dicatat bertahap (daftar, bukan tanggal), musim bisa ditutup dengan status `Cycle.status` dan tanggal wajib, dan `L38` menegakkannya di sisi pemeriksa. **Kosakata sebab kegagalan siklus** 24 Agustus 2026: 15 sebab di `op:cfr:`, tiga di antaranya berpadanan tepat dengan risiko yang dijamin polis AUTP (sumber primer: Pedum AUTP TA 2022) — sisanya tidak dijamin siapa pun, dan di sanalah modal habis, giliran air tidak datang, dan harga jatuh di bawah ongkos panen. `L38` diperketat jadi kegagalan. | **selesai** |
| E3 | Simpangan rencana–realisasi | petugas lapang, offtaker | mutu data | pemeriksa **selesai**; **sisi pencatatannya ikut selesai** 24 Agustus 2026 bersama E2 — `L8` diterjemahkan ke layar, alasan diminta hanya saat memang ada simpangan | **sebagian** — tercatat; agregasinya di `sinyal.mjs` (G2) |
| E4 | Pengingat berbasis **fase**, bukan tanggal | petani, petugas lapang | ketepatan waktu tindakan | `Stage` sengaja **tanpa medan hari** — hanya 2 dari 4 langkah cabai bertanggal | **BANGUN** (fase 3) dengan batasnya dinyatakan |
| E5 | **Buku kas & tenaga kerja per petak** | petani, poktan | #10, #11, #15 | **inti selesai** 23 Agustus 2026 — `app/kas.html`, seluruhnya di perangkat, tanpa akun. Petani kecil memang mengandalkan ingatan, jadi jaraknya yang dirancang: jawaban di atas, tiga medan, satu yang wajib **Musimnya jadi milik bersama** 24 Agustus 2026 — pindah ke `app/musim.js`, dan catatannya ke `app/buku.js` supaya layar rencana bisa menulis ke buku yang sama. | inti **selesai**; sinkron & banyak petak **fase 3** |

> **E5 adalah satu-satunya kapabilitas dalam kelompok ini yang petani mau isi untuk
> dirinya sendiri.** E1–E3 dibayar oleh pembeli hilir, dan itu sah — tapi ia menempatkan
> pencatatan sebagai kerja untuk orang lain, yang persis pola kegagalan ke-3 di bagian 3.3.
> Buku kas membalik arahnya: petani mencatat karena ia sendiri ingin tahu untungnya berapa,
> dan catatan itu **kebetulan** memenuhi sebagian besar kebutuhan bukti. Ini penerapan
> paling langsung dari "satu rekaman, banyak bacaan".
>
> **Satu dugaan di sini terbukti meleset, dan ke arah yang lebih sulit.** Bagian 9
> menduga buku kas sudah ada dalam bentuk apa pun, sehingga E5 tinggal memindahkan bentuk.
> Jawaban lapangannya: *"kalaupun ada dalam bentuk buku kertas. Umumnya petani kecil
> mengandalkan ingatan saja."* Jadi E5 **kebiasaan baru**, bukan pemindahan bentuk — dan
> kebiasaan baru jauh lebih mahal diterima. *Ingin tahu untungnya berapa* tidak sama
> dengan *mau mencatat*, dan jarak antara keduanya yang harus dirancang, bukan diasumsikan
> hilang.

> **Inti E5 dibangun 23 Agustus 2026, dan satu pengukuran yang menentukan bentuknya bukan
> tentang petani melainkan tentang peramban.** Kuota penyimpanan 4.180 MB sementara satu
> musim penuh cuma **14,5 KB** — ruang tidak pernah jadi soal. Yang jadi soal
> `navigator.storage.persist()` menjawab **false** pada kunjungan biasa: peramban **menolak
> menjanjikan catatan itu tidak dihapusnya**. Petani yang mencatat semusim lalu
> kehilangannya lebih buruk keadaannya daripada yang memakai kertas, dan halaman yang tidak
> mengatakannya sedang menjual janji yang bukan miliknya untuk dijanjikan. Karena itu
> "bawa keluar" bukan pelengkap di sana, dan pengingatnya muncul sendiri tiap sepuluh
> catatan — selagi mengetik ulang masih murah.
>
> **Yang tetap fase 3:** sinkron, banyak petak, dan berbagi dengan kelompok tani. Ketiganya
> menuntut tempat menyimpan yang bukan peramban, dan itu tepatnya yang dibayar lapisan
> berbayar. Pencatatannya sendiri tidak menuntutnya — jadi ia tidak ditahan menunggu.

> **E1 selesai 23 Agustus 2026, dan urutannya sama seperti G3: indeks dulu, baru layar.**
> Penyusunnya sudah ada sejak lama, tetapi permukaan tidak bisa dibangun di atas berkas yang
> tidak pernah terbit — protokolnya karena itu diterbitkan ke indeks lebih dulu, pola yang
> sama persis seperti BPP dan lab sebelum C7.
>
> **Yang paling menentukan bentuknya satu kalimat yang sudah ditulis penyusunnya:** rencana
> ini BUKAN kalender penuh, dan tidak boleh disajikan sebagai kalender penuh. Dari empat
> langkah, **dua** bisa ditanggalkan; satu menunggu fase dan satu dipicu ambang. Angka itu
> jadi **judul kartunya**, dan "menunggu fase" berdiri di kolom tanggal alih-alih di catatan
> kaki — daftar yang menyembunyikan ketiadaan tanggal di bawah tetap terbaca sebagai
> kalender.
>
> **Risiko yang dinyatakan: ini salinan kedua aritmetika yang sama.** Penyusun berjalan di
> Node atas `spec/vocab/`, permukaan di peramban atas `spec/indeks/`, jadi pemisahannya tidak
> terhindarkan — dan dua salinan menyimpang begitu salah satunya diperbaiki, persis alasan
> `serah.js` dan `batas.css` masing-masing tinggal di satu tempat. Yang menahannya di sini
> uji: keluaran keduanya dibandingkan untuk masukan yang sama dan **identik** sampai ke
> tanggal, cacah langkah, dan ketiga angka kebutuhan input.
>
> **Dan cacah protokolnya — satu — ikut disebut di layar.** Daftar pilihan berisi satu tanpa
> keterangan terbaca sebagai "yang lain menyusul"; yang perlu dibaca justru bahwa menaruh
> harapan pada jalur ini berarti menaruhnya pada satu protokol draft bertingkat bukti D.
> Menyusun protokol berikutnya pekerjaan agronomi bernama, dan alurnya sudah dibuka G1.

### F · BUKTI & AKSES — hilir yang menarik hulu

| # | Kapabilitas | Untuk siapa | Keputusan yang diubah | Keadaan data | Putusan |
|---|---|---|---|---|---|
| F1 | Berkas bukti bertulang SNI 8969 | offtaker, sertifikator | #16 | penyusun **selesai** | **BANGUN** permukaannya (fase 3) |
| F2 | Ekspor data petani yang bisa dibaca tanpa platform ini | petani, koperasi | kepemilikan data | **selesai** — `ekspor-petani.mjs` | **selesai** |
| F3 | Ketertelusuran petak → lot | eksportir, offtaker | akses pasar | butuh geometri + persetujuan | **TUNDA** (T2) |
| F4 | Berkas siap-ajukan kredit & asuransi | petani, poktan, bank, asuransi | #11, #12 | **prasyaratnya selesai** 23 Agustus 2026 — buku kas kini berskala musim & luas, jadi **biaya per hektare** ada. Berkasnya sendiri **tidak dibangun**: repositori ini tidak tahu apa yang diminta formulir SIAP | prasyarat **selesai**; berkasnya **TUNDA** menunggu riset formulir |

> **F4 menjawab kendala yang disebut sendiri oleh pelaksana AUTP:** hambatannya
> administrasi, bukan tarif — premi petani Rp36.000/ha/musim sudah sangat rendah, tapi
> berat diurus untuk lahan 0,2–0,3 ha. Berkas yang terisi sendiri dari catatan musim
> memindahkan beban itu dari petani ke mesin. **Syaratnya E5 lebih dulu** — tanpa catatan,
> tidak ada yang bisa diisikan.

> **F4 diperiksa 23 Agustus 2026, dan yang menghalanginya bukan E5 melainkan riset.**
> Baris ini semula berbunyi "butuh E5 dulu"; E5 kini ada. Tetapi memeriksa apa yang
> sebenarnya dibutuhkan menemukan penghalang yang lebih mendasar: **repositori ini tidak
> tahu apa yang diminta formulir SIAP.** Dua sumber yang dikutip dokumen ini artikel
> tentang premi dan kendala administrasi — bukan daftar medan, bukan syarat kepesertaan,
> bukan alur pengajuannya. Menyusun "berkas siap-ajukan" tanpa itu berarti mengarang format
> yang tidak diterima penanggung mana pun, dan bank yang bertindak atas dokumen berformat
> karangan mengambil keputusan pembiayaan di atasnya. Itu kelas kekeliruan yang berbeda
> dari cacat antarmuka.
>
> **Yang dikerjakan sebagai gantinya: prasyaratnya, dan ia bisa diukur.** Tiap angka yang
> dipakai AUTP per hektare — premi Rp36.000/ha, subsidi Rp144.000, ganti rugi ±Rp6 juta/ha
> — sementara buku kas versi pertama tidak punya luas sama sekali, jadi ia tidak bisa
> menghasilkan satu pun angka dalam satuan itu. Musim kini punya nama, komoditas, dan luas,
> dan **biaya per hektare** muncul di layar dan di berkas yang dibawa keluar. Petani 0,25 ha
> yang sebelumnya cuma punya angka total sekarang punya angka yang bisa dibandingkan dengan
> apa pun yang diterbitkan.
>
> **Yang membuka F4 karena itu satu hal, dan ia bukan kode:** menemukan dan mencatat apa
> yang benar-benar diminta SIAP dan KUR — daftar medannya, syarat kepesertaannya, dan
> bentuk berkas yang mereka terima.

### G · JEJARING — yang tidak bisa dilakukan sendirian

| # | Kapabilitas | Untuk siapa | Keputusan yang diubah | Keadaan data | Putusan |
|---|---|---|---|---|---|
| G1 | Alur kontribusi & tinjauan protokol dengan reviewer **bernama** | agronom, dosen, BSIP, penyuluh | mutu & legitimasi korpus | **selesai** 23 Agustus 2026 — `CONTRIBUTING.md`, `spec/tools/tinjau.mjs`, aturan L35, dan sematan `reviewed_hash`. Terukur saat dibuka: **0 dari 4.256** rekaman punya peninjau bernama, **0** berstatus published | **selesai** |
| G2 | Umpan balik lapangan menaikkan tingkat bukti **D→C** (dikoreksi dari D→A) | semua | apakah korpus hidup | `DeviationReason.signals` ada dan benar; **`spec/tools/sinyal.mjs`** membacanya sejak 23 Agustus 2026. Simpangan tercatat: **1** | penunjuknya **selesai**; kenaikannya tetap tindakan peninjau bernama (G1) |
| G3 | Pelaporan gejala oleh warga → peta gejala wilayah | petani, POPT, pemda | #8, peringatan dini | **selesai** 23 Agustus 2026 — `observation.schema.json`, aturan `L37`, dan pintu serah-terima di jalur 1 yang menemukan balai penyuluhan menurut kecamatan. Tanpa kotak masuk, tanpa peta, dan tanpa identifikasi | **selesai** 23 Agustus 2026 — entitas, aturan `L37`, dan pintu serah-terima di jalur 1 |
| G4 | API publik | integrator, pemerintah, peneliti | interoperabilitas | terhalang **3 keputusan**, bukan kode | **TUNDA** |
| G5 | Identitas petak stabil tanpa memiliki geometrinya | semua | dasar semua rekaman | **selesai** 23 Agustus 2026 — `tools/sidik-petak.mjs` + aturan `L36`. Yang tetap `id` rekamannya, yang berubah sidiknya; sidik titik tunggal **ditolak** karena 2³⁰ ditebak habis dalam 0,08 detik Sisi permukaannya **sengaja berhenti sebelum sidik** 24 Agustus 2026: musim di app menyebut nama petak, jenis (`Plot.kind`), dan luas, tetapi tanpa `holder` dan tanpa geometri — cukup menyambungkan layar satu sama lain, tidak cukup menyambungkan petani satu sama lain. | **selesai** |
| G6 | **Lapis pengalaman peer** — pengamatan lapangan diagregasi di tingkat bahan aktif, selalu berpenyebut | petani, poktan, penyuluh | #3, #4, #6, #9 — kanal keputusan yang sebenarnya | `Observation` **kini benar-benar ada** (23 Agustus 2026, lewat G3); pengumpulan hanya mungkin di atas E1–E5 | **BANGUN** (fase 3) |

> **G6 lahir dari jawaban yang sama yang membatalkan premis C2.** Kalimat lengkapnya
> berbunyi *"umumnya rekomendasi dari peers"* — artinya kanal keputusan yang sebenarnya
> bukan layar mana pun, melainkan penularan antarpetani. Daftar ini semula tidak punya
> lapis itu sama sekali.
>
> **Dan ia paling mudah dirancang jadi hal yang justru dilarang bagian 7.** Lapis peer
> yang lalai *adalah* sistem ulasan produk. Empat syarat yang membuatnya berdiri di sisi
> yang benar: agregasi berhenti di **tingkat bahan aktif atau hara**, **penyebut selalu
> ikut**, **tidak pernah diurutkan menurut frekuensi**, dan **ditahan sama sekali di bawah
> penyebut minimum** — sebab penyebut kecil tempat termurah untuk dibajak.
>
> **Pengumpulannya sengaja mahal.** Sumbangan hanya boleh datang sebagai efek samping
> catatan musim yang memang sudah dibuat, bukan dari formulir terbuka — karena **mahal
> dibuat berarti mahal dipalsukan.** Itu juga yang menjaga janji "tanpa akun": lapisan
> gratis hanya **menyebarkan**, tidak pernah **mengumpulkan**.
>
> **Risiko sisa yang tidak tertutup:** principal yang produknya mendominasi satu bahan
> aktif tetap diuntungkan tanpa pernah disebut namanya. Penyebut dan larangan mengurutkan
> memperlambat, tidak menghapus.

> **G3 punya satu bahaya yang harus dirancang lebih dulu, bukan ditambal.** Laporan gejala
> dari warga adalah data mentah; **menyebutnya wabah adalah kesimpulan.** Peta yang
> menampilkan titik-titik laporan tanpa verifikasi bisa memicu penyemprotan massal yang
> tidak perlu — dan kerugiannya ditanggung petani, sementara yang untung penjual pestisida.
> Karena itu perannya **memberi lengan pada rantai POPT yang sudah ada**, bukan
> menggantikannya: laporan warga masuk sebagai pengamatan, verifikasi tetap milik POPT.

> **G3 dikerjakan 23 Agustus 2026, dan yang ditemukan bukan penghalang yang diduga.**
> Aturan pengumpulan memang tidak menghalanginya — putusan barisnya sendiri sudah berbunyi
> **SAMBUNG**, dan menyerahkan laporan ke rantai POPT adalah serah-terima, bukan
> pengumpulan. Yang menghalangi dua hal lain, dan keduanya baru terlihat setelah diukur.
>
> **Pertama: `Observation` yang dirujuk empat dokumen ternyata tidak ada sebagai entitas.**
> [00](00-fondasi-dan-tahapan.md) mendaftarkannya, baris G6 di bawah menulis "`Observation`
> ada", dan [17](17-tiga-konsep-ui.md) membangun Konsep 3 di atasnya. Yang benar-benar ada
> sebuah `$defs` **di dalam** `step.schema.json`, dan bentuknya menuntut `variable` +
> `value` — itu **pengukuran**, hanya bisa dibuat orang yang sedang menjalankan protokol.
> Petani yang melihat daun keriting tidak berkata "variable=X, value=5"; ia menyebut apa
> yang dilihatnya. Laporan warga karena itu **tidak punya tempat sama sekali** di kosakata,
> dan `op:obs:` dipesan di pola id tanpa satu skema pun yang bisa memakainya. Entitasnya
> dibangun sekarang, dengan bahayanya dirancang keluar alih-alih ditambal: medannya bernama
> **`suspected`**, bukan `identified`, karena identifikasi adalah kesimpulan; `verification`
> wajib dan `unverified` harus **dinyatakan**, bukan dikosongkan; dan tidak ada medan
> geometri sama sekali, karena batas lahan sudah dijaga L7 di `Plot` dan pintu kedua akan
> melemahkan penjagaan itu.
>
> **Kedua, dan ini yang menahan permukaannya: ujungnya bisa dinamai, belum bisa dituju.**
> Baris C7 mencatat penyuluh, POPT, laboratorium, dan jasa alsintan **nol rekaman di
> indeks**, dan itu masih benar. Tetapi lapis mentahnya bergerak pada hari yang sama:
> `penyuluh_data/` kini memuat **548 dinas** (34 provinsi, 514 kabupaten/kota) dan **7.276
> kecamatan** yang 6.883 di antaranya menyebut nama BPP pembinanya. Itu ujung yang
> sesungguhnya bagi laporan warga — bukan POPT langsung, melainkan BPP tempat penyuluhnya
> berada, yang kemudian meneruskan ke POPT.
>
> **Diperbarui beberapa jam kemudian, dan gambarnya berubah lagi.** Keduanya kini entitas
> kosakata penuh, bukan lapis mentah: `bpp.ndjson` **5.844 balai** dan `lab.ndjson` **889
> laboratorium**. Kendalanya ternyata berbeda untuk masing-masing, dan hanya satu yang
> benar-benar kendala:
>
> | | Bisa dituju | Kendalanya |
> |---|---|---|
> | **Lab** (889) | **ya** — 889 dari 889 punya `address` **dan** `contact` | tidak ada; ia sudah bisa dituju |
> | **BPP** (5.844) | tidak lewat alamat | **sumbernya tidak menerbitkannya.** Laporan tamu SIMLUHTAN hanya memberi nama dan kecamatan binaan. Skemanya karena itu **tidak punya medan kontak sama sekali** — bukan medan kosong |
> | **Dinas** (548) | tidak | sama: nama, wilayah, dan cacahan |
>
> **Dan untuk BPP, "tanpa alamat" bukan berarti tak terjangkau.** 5.829 dari 5.844 menyebut
> **kecamatan binaannya**, dan bagi petani "BPP Babahrot di Kecamatan Babahrot" memang
> alamat — yang tidak tahu letaknya justru mesinnya, bukan orangnya. Menggeokode massal
> untuk menambalnya **ditolak dengan sadar**, karena bertabrakan dengan rancangan "klaim"
> yang sama seperti pada toko tani.
>
> **Kendala terakhir itu ditutup hari yang sama.** Keduanya kini terbit ke indeks:
> `bpp-wilayah.json` beserta 504 pecahan kabupaten, dan `lab-kemampuan.json` beserta 35
> pecahan provinsi — dengan keterangan batas dan tingkat buktinya masing-masing, jadi layar
> mana pun yang membacanya bisa menyebut sumbernya. **G3 karena itu punya dua ujung
> sungguhan sekarang**: laboratorium yang bisa ditelepon, dan balai yang bisa didatangi.
>
> **Dan satu ujung yang tidak dicari ternyata ikut terbawa.** Lima dari 889 laboratorium
> adalah **balai perlindungan tanaman pangan dan hortikultura provinsi** — beralamat,
> bertelepon, dan berakreditasi KAN. Itu **BPTPH**, ujung rantai `POPT → LPHP → BPTPH` yang
> disebut baris pemetaan lanskap di atas. Verifikasi yang dituntut `L37` karena itu bukan
> lagi pihak yang tidak bisa disebutkan namanya.
>
> **Ditutup 23 Agustus 2026, dan urutannya penting.** Layar C7 kini menampilkan keduanya —
> balai ditelusuri menurut kecamatan, laboratorium disaring menurut kemampuan — lalu pintu
> serah-terima G3 dibangun di atasnya, di jalur 1 tempat orang memang sedang melihat
> gejala. Pintunya menyusun laporan berdasar (ciri mana yang sudah dicek, dan **yang belum
> ikut tertulis**), menemukan balai yang membina kecamatannya, lalu menyerahkan keduanya
> kembali. Tanpa kotak masuk, tanpa peta, tanpa identifikasi.
>
> **Satu penjagaan yang mudah terlewat:** pintunya **tidak muncul di jalur `?hama=`**. OPT
> registri tidak punya ciri pembanding sama sekali, jadi laporan dari sana akan berdugaan
> tanpa satu hal pun yang bisa dicek — persis tebakan tanpa dasar yang ditolak seluruh
> rancangan ini.

> **C4 sisi petani dikerjakan 23 Agustus 2026, dan ia terbelah dua — satu separuh
> dibangun, satu separuh ditolak.**
>
> **Yang ditolak: setorannya.** Pertanyaan yang ditulis dokumen ini berbunyi *"maukah ia
> menyetorkannya"*, dan setoran adalah pengumpulan. Alasannya bukan cuma aturan lapisan
> gratis: **harga yang diketik ke formulir terbuka adalah harga yang paling murah
> dipalsukan**, dan harga persis yang paling menguntungkan untuk dipalsukan. Itu penalaran
> yang sama yang membuat G6 menuntut sumbangan datang sebagai efek samping catatan musim.
> Setoran harga karena itu ikut G6 ke atas E1–E5, bukan ke lapisan gratis.
>
> **Yang dibangun: separuh yang tidak menuntut satu byte pun berpindah.** Petani SUDAH
> TAHU harganya sendiri; yang tidak ia punya acuannya. Layar harga kini menerima angka itu
> di perangkat, menghitung jaraknya ke penetapan terakhir, lalu melupakannya — tidak ada
> yang dikirim, dan tidak ada tempat mengirimkannya.
>
> **Hanya pada seri tingkat pekebun, dan itu penjagaan bukan keterbatasan.** Dari 96 seri,
> **8** bertingkat pekebun dan seluruhnya sawit. Membandingkan harga terima petani dengan
> seri **eceran** menghasilkan jurang yang benar angkanya dan salah artinya — ia margin
> pemasaran sepanjang rantai, bukan selisih yang ditanggung satu pembeli. Bentuk kekeliruan
> yang sama sudah diukur [16](16-sumber-harga-komoditas.md) pada sawit: TBS terhadap CPO
> dunia tampak 7,26× padahal 1,52×, *"dan petani akan menyimpulkan dirinya ditipu tujuh kali
> lipat"*. Seri eceran karena itu menampilkan **penolakan beserta sebabnya**, bukan diam.
>
> **Cakupan hukum dicetak bersama hasilnya, bukan sebagai catatan kaki.** Penetapan TBS
> menaungi pekebun mitra dan plasma; pekebun **swadaya berada di luarnya**, dan merekalah
> mayoritas petani sawit Indonesia. Petani swadaya yang membandingkan harganya ke penetapan
> plasma lalu menyimpulkan dirinya dirugikan sedang membandingkan diri ke harga yang secara
> hukum bukan haknya — keterangan yang mengubah kesimpulan, jadi ia tidak boleh dipisahkan
> dari angkanya.
>
> **Yang masih nol: acuan tingkat petani untuk pangan pokok.** Tidak ada satu pun seri
> gabah di indeks, dan HPP Rp6.500/kg (Kepbadan 14/2025) hidup sebagai prosa di
> [16](16-sumber-harga-komoditas.md), bukan sebagai data yang bisa dibandingkan. Selama itu
> begitu, pembanding ini hanya berguna untuk petani sawit.

> **G2 diperiksa 23 Agustus 2026, dan separuh judulnya ternyata tidak bisa dipenuhi
> mekanisme yang disebutnya sendiri.** Tangga tingkat bukti bukan tangga volume melainkan
> tangga **metode**: A uji multi-lokasi, B standar institusi, C **konsensus praktisi &
> penyuluh**, D pengalaman tunggal. Umpan balik lapangan yang menumpuk *adalah* tingkat C
> menurut definisinya — jadi ia memindahkan D ke C dan berhenti di situ. Mencapai B
> menuntut institusi mengadopsinya; mencapai A menuntut uji multi-lokasi. **Seribu petani
> yang melaporkan hal yang sama tetap konsensus praktisi, bukan uji lapangan.** Judul baris
> ini karena itu dikoreksi jadi D→C.
>
> **Yang dibangun bukan penaik melainkan penunjuk.** `sinyal.mjs` mengelompokkan simpangan
> menurut `DeviationReason.signals` — medan yang deskripsinya sendiri berbunyi *"apa yang
> seharusnya ditindaklanjuti tim ketika alasan ini sering muncul"* — lalu menunjuk rekaman
> yang klaim tingkat buktinya sedang tertekan. Yang menaikkannya tetap peninjau bernama
> lewat alur G1, dan itu bukan keterbatasan: **kenaikan tingkat adalah kesimpulan, dan
> kesimpulan tidak boleh jadi efek samping penjumlahan.**
>
> **Satu angka yang selama ini hanya berupa aturan akhirnya ditulis.** [17](17-tiga-konsep-ui.md)
> bagian 7.3 menetapkan bahwa di bawah ambang penyebut minimum panel *"menolak menampilkan
> angka sama sekali"*, tetapi tidak pernah menyebut angkanya — dan aturan tanpa angka tidak
> bisa ditegakkan mesin. Alat ini memakai **5 petak berbeda**, ditulis di satu tempat dan
> ditandai **keputusan yang belum diratifikasi** supaya bisa dibantah di satu tempat. Yang
> dihitung petak berbeda, bukan baris: satu orang yang melapor lima kali dari satu petak
> bukan lima petak.
>
> **Keadaan hari ini: 1 simpangan tercatat, seluruhnya contoh.** Alatnya melaporkannya apa
> adanya dan menolak menarik kesimpulan — sama seperti `tinjau.mjs` melaporkan nol peninjau.
>
> **Cacat kembar dari G1 ikut ditutup.** `preparation.schema.json` mendeskripsikan
> `evidence_note` sebagai wajib dan **tidak menuntutnya** — padahal berkas itulah sumber
> aturan *"tingkat bukti tanpa alasan adalah klaim tanpa dasar"* yang diwarisi `batas.js`
> dan `L31`. Ia satu-satunya dari empat skema bertingkat yang tidak menegakkannya pada
> dirinya sendiri. Sekarang dituntut; keduabelas resep sudah memenuhinya, jadi nol yang
> perlu diperbaiki.

### Rekapitulasi putusan — 40 kapabilitas

| Putusan | Jumlah | Nomor |
|---|---:|---|
| **selesai** | 5 | **B1**, C1, D1, D2, F2 |
| **BANGUN** — gelombang 0–1 | 16 | A1, A2, A3, A5, B2⁽ᵖ⁾, B3, B4, C2, C3⁽ᵇ⁾, **C4**⁽ʰ⁾, C7, D3, D4, D5, G1, G5 |
| **BANGUN** — gelombang 2 · fase 3 | 8 | E1, E2, E3, E4, E5, F1, G2, **G6** |
| **BANGUN hati-hati** | 1 | G3 — juga **SAMBUNG** ke rantai POPT |
| **PINJAM / SAMBUNG** | 3 | C5, C6, C9⁽ᵗ⁾ |
| **TUNDA** | 7 | A4, B5, C8, D6, F3, F4⁽ᵈ⁾, G4 |

- ⁽ᵖ⁾ **sebagian** — B2 tanpa PHI.
- ⁽ʰ⁾ **naik dari pinjam jadi bangun** — sisi eceran tetap dipinjam dari SP2KP; harga petani tidak punya sumber.
- ⁽ᵇ⁾ **bertahap** — 10 dari 778 OPT hari ini.
- ⁽ᵗ⁾ **tertunda** sampai status subsidi punya jalur data; sambungannya ke e-RDKK bisa lebih dulu.
- ⁽ᵈ⁾ **dibangun belakangan**, setelah E5 berjalan.

> **Angka yang paling menentukan bukan 17, melainkan 5.** Lima kapabilitas — C5, C6, C9,
> dan sisi sambungan G3 serta F4 — dijawab dengan meminjam atau menyambung, bukan
> membangun. Semuanya menyangkut kebutuhan yang paling sering diminta pertama kali: cuaca,
> kalender tanam, status tanah, kuota subsidi. Godaan membangun ulang salah satunya akan
> datang, dan setiap kali ia datang jawabannya sudah tertulis di sini.
>
> **Semula enam, dan yang keenam gugur dalam hitungan hari.** C4 dipindahkan ke kolom
> bangun setelah pinjaman yang ditunjuknya ternyata mati sejak Oktober 2025. Pelajarannya
> berlaku untuk lima yang tersisa: **meminjam bukan keputusan sekali jalan.** Sumber pinjaman
> perlu diperiksa hidup-matinya pada kadensi yang sama dengan registri — lihat
> [12-kadensi-registri.md](12-kadensi-registri.md) — dan yang mati harus punya cabang siap
> pakai, bukan ditemukan saat layarnya kosong di depan petani.

---

> **Gelombang 1 diperiksa 23 Agustus 2026, dan lima dari tujuh butirnya terhalang hal
> yang sama — bukan kode.** Empat di antaranya berbentuk **pengumpulan**: A2 kanal
> WhatsApp, sisi setoran petani pada C4, G3 laporan warga, dan G6 lapis peer.
>
> **Satu dari keempatnya keliru dinilai, dan dikoreksi hari yang sama: A2.** Aturannya
> berbunyi "hanya **menyebarkan**, tidak pernah **mengumpulkan**" — dan itu bukan larangan
> atas A2, melainkan penentu bentuknya. Nilai A2 adalah keterjangkauan, dan keterjangkauan
> seluruhnya ada di sisi menyebarkan. Yang benar-benar terhalang cuma satu implementasinya:
> kotak masuk. Kartu teruskan dibangun, kotak masuknya tidak — lihat barisnya di atas. Aturan yang
> ditulis dokumen ini sendiri melarangnya di lapisan gratis — *"lapisan gratis hanya
> menyebarkan, tidak pernah mengumpulkan"* — dan C2 sudah menetapkan preseden bahwa
> *"kotak masuk yang tak seorang pun di ujungnya lebih buruk daripada tidak ada kotak
> masuk"*.
>
> **B3 dan G1 sempat terhalang hal yang lebih sederhana: repositorinya masih privat.**
> Keduanya menuntut jejak yang **publik dan bernama**; menyalurkannya ke repositori
> tertutup menghasilkan jejak yang bernama tetapi tidak publik — persis setengah ukuran
> yang dihindari dokumen ini. **Penghalang itu hilang 23 Agustus 2026: repositorinya
> dibuka** di `github.com/bayusyerli/open_protocol`, Apache-2.0 untuk kode dan
> LICENSE-KONTEN untuk isinya. Keduanya kini bisa dibangun sebagai **serah-terima**, bukan
> pengumpulan: permukaan menyusun sanggahan atau sumbangan yang sudah terisi lalu
> menyerahkannya ke tempat publik itu, tanpa pernah menerima apa pun sendiri.
>
> **B3 dibangun hari yang sama, dan satu ukuran mengubah bentuknya.** Hanya **28 dari
> 31.837** rekaman yang bisa muncul di layar diterbitkan proyek ini sendiri — 0,088%;
> sisanya salinan registri kementerian dan OpenStreetMap. Pintu sanggahan tunggal karena
> itu akan menyiratkan kuasa membetulkan yang tidak dimiliki repositori ini atas 99,9%
> faktanya. Yang ditanya lebih dulu **apa yang salah**, bukan apa yang benar, dan ketiga
> jawabannya pergi ke tempat berbeda: salinan dan penyajian bisa dibetulkan di sini,
> fakta di registri hanya bisa **dicatat**. **G1 menyusul di hari yang sama** — lihat catatannya di bagian G.
>
> **Yang dibuka adalah yang sudah didorong, bukan semua yang ada di cakram.** Panen
> direktori pengecer principal — 1.605 toko berikut nomor telepon — hidup di cabang lokal
> yang tidak pernah didorong, dan `toko_data/LAPIS.md` menggolongkannya **tidak terbit**.
> Membuka repositori tidak menerbitkannya; **mendorong cabang itu akan menerbitkannya.**
>
> **C3 satu-satunya yang tidak terhalang**, dan sisinya yang tidak menuntut agronomi
> dikerjakan lebih dulu — lihat barisnya di atas.
>
> **Yang perlu dikerjakan manusia sebelum gelombang 1 bisa lanjut:** tinggal satu —
> menetapkan siapa yang berada di ujung kanal mana pun sebelum kanalnya dibangun. Keputusan
> membuka repositori sudah diambil.

## 6. Urutan — ditempelkan ke tiga fase yang sudah ada

Urutan di [10-peta-modul.md](10-peta-modul.md) tidak diubah. Yang dilakukan bagian ini
**menempelkan 40 kapabilitas ke tiga fase itu**, dan menambahkan satu gelombang nol yang
seluruhnya berada di dalam lapisan gratis.

### Gelombang 0 — memperdalam yang gratis (fase 1–2, sekarang)

Semuanya berjalan sebagai berkas statis. Tidak satu pun menuntut akun, server aplikasi,
atau sumber data baru. **Ini gelombang yang paling murah dan paling langsung menjawab
"bermakna bagi petani".**

| Urut | Kapabilitas | Alasan urutannya |
|---|---|---|
| 1 | **B1** komponen batas jawaban — **selesai** | Prasyarat semua layar berikutnya; tanpa ini tiap layar baru menambah utang kepercayaan |
| 2 | **A3** kamus nama lokal — **sisi OPT selesai** | Menentukan apakah jalur 1 bisa dipakai orang yang belum tahu jawabannya |
| 3 | **C2** keaslian & anti-palsu — lewat **kandungan**, bukan nomor — **sisi pupuk selesai** | Nilai tertinggi per biaya, dan kini melacak perilaku yang sudah terjadi |
| 4 | **D4 + D5** kalibrasi & takaran — **selesai** | Termurah; menyentuh keselamatan; tidak butuh data baru |
| 5 | **B4** antrean pertanyaan tak terjawab — **selesai** | Mengubah biaya riset jadi keluaran; mengarahkan gelombang berikutnya |
| 6 | **A1** kotak tanya multimoda — **sebagian** | Setelah jalur-jalurnya layak dituju |
| 7 | **A5** luring penuh — **sebagian** | Indeks sudah ≤48 KB — separuh jalan |
| 8 | **C7** direktori layanan — **sebagian** | Fondasi toko tani sudah ada |
| 9 | **D3** analisis usaha tani — **sebagian** | Pintu masuk ke E5 di gelombang berikutnya |

> Butir 1–5 semuanya bisa selesai tanpa satu pun keputusan yang masih terbuka di
> [10-peta-modul.md](10-peta-modul.md) bagian 7. Itu yang membuat gelombang ini bisa
> dimulai hari ini.

> **B1 selesai 23 Agustus 2026.** `app/batas.js` menggambar keempat medannya di ketujuh
> layar data, dan menolak layar yang melewatkan salah satunya dengan blok merah, bukan
> dengan diam. Dua hal ikut ketahuan saat membangunnya, dan keduanya lebih penting
> daripada komponennya sendiri:
>
> 1. **Tanggal tarikan tidak terbaca mesin.** `SourceRef` di `common.schema.json` tidak
>    punya medan untuk itu, sehingga *"ditarik 19 Agustus 2026"* hanya hidup sebagai prosa
>    di dalam `locator`. Layar tidak bisa menyebut tanggal yang tidak bisa dibacanya —
>    jadi yang menghalangi B1 bukan kelalaian penyaji melainkan lubang di skema. Medan
>    `retrieved` kini ada, dan ketiga berkas koleksi mengisinya.
> 2. **Satu sumber ternyata tidak boleh diberi tingkat sama sekali.** Kurasi gejala OPT
>    tampil dengan tingkat **belum ditetapkan**, bukan C: C berarti konsensus praktisi &
>    penyuluh, dan tinjauan itu belum pernah diminta kepada seorang penyuluh pun. Menaruh
>    huruf di sana akan memakai komponen kepercayaan ini untuk melakukan persis kebalikan
>    dari tugasnya. Yang membukanya tinjauan di [14-tinjauan-gejala.md](14-tinjauan-gejala.md),
>    bukan baris kode.

### Gelombang 1 — jangkauan & kontribusi (fase 2)

**A2** WhatsApp · **B3** sanggahan terbuka · **G1** alur kontribusi bernama ·
**G5** identitas petak · **C3** OPT bergejala bertahap · **C5/C6** pinjam-sambung ·
**C4** harga — pinjam sisi eceran dari SP2KP, bangun sisi setoran petani.

> **G1 tidak boleh menunggu fase 3.** Pertanyaan ke-5 di [02-tiga-pasar.md](02-tiga-pasar.md)
> bagian 8 — apa yang membuat agronom mau menempelkan namanya — tidak akan terjawab lewat
> wawancara. Ia terjawab dengan menyediakan alurnya, lalu melihat siapa yang datang.
>
> **Alurnya dibuka 23 Agustus 2026, dan yang membentuknya bukan pertanyaannya melainkan
> keberatan di baliknya:** *"apakah nama saya akan menanggung isi yang tidak pernah saya
> baca?"* Tanpa penjagaan jawabannya ya, dan itu alasan yang cukup untuk menolak. Karena
> itu tinjauan **disematkan pada isi yang dibacanya** (`lifecycle.reviewed_hash`): begitu
> rekaman disunting, pemeriksa menyatakan tinjauannya kedaluwarsa, dan nama peninjaunya
> berhenti berlaku pada perubahan itu — otomatis, tanpa ia perlu mengawasi.
>
> Gerbangnya ternyata sudah terpasang sejak sebelum repositori dibuka dan belum pernah
> menyala: **L31** menahan tingkat D dari `published`, **L33** menuntut protokol terbit
> punya penulis bernama dan tanggal tinjau ulang. Yang hilang cuma pintunya.

> **G5 dibangun 23 Agustus 2026, dan yang menentukan bentuknya satu pengukuran.** Janji
> "identitas tanpa memiliki geometrinya" mudah dipenuhi setengah: hitung sha256 atas
> batasnya, terbitkan sidiknya, selesai. Tetapi sidik hanya merahasiakan kalau yang
> disidik sulit ditebak — dan untuk **titik tunggal** pada presisi 5 desimal di dalam satu
> kabupaten, kandidatnya 2³⁰, habis ditebak satu GPU dalam **0,08 detik**. Menerbitkannya
> sama dengan menerbitkan titiknya, dan repositori ini publik. Gerbangnya karena itu
> bukan "apakah ada geometri" melainkan **mutunya**; poligon berjalan kaki 2²³⁷, aman.
>
> **Dua contoh yang sudah ada ternyata cacat, dan keduanya cacat dengan cara yang tidak
> terlihat.** `rec-plot-kopi-eudr` memuat GeoID bernilai `PENDING-DIHITUNG-DARI-GEOMETRI` —
> string yang menyamar jadi identitas, persis `sha256:0000…` yang ditolak `L34`.
> `rec-plot-tambak` menyatakan `geometry_quality: drawn_polygon` untuk geometri yang tidak
> ada sama sekali. Keduanya lolos skema, keduanya akan mengalir ke berkas bukti EUDR
> tampak seperti data.
>
> **Yang tidak dikerjakan, dan sebabnya dinyatakan:** GeoID AgStack yang sesungguhnya.
> [00](00-fondasi-dan-tahapan.md) menyebutnya preseden identitas lahan, tetapi menghitung
> nilai sendiri lalu melabelinya `AGSTACK` berarti menerbitkan identitas yang tidak cocok
> dengan registri mana pun. Skemanya tetap ada dan nilainya hanya boleh **disalin** dari
> Asset Registry.

> **A2 dibangun 23 Agustus 2026, dan satu pengukuran menentukan bentuknya.** Di layar
> rincian produk jawabannya 884 aksara dan blok batasnya **2.178** — batasnya dua setengah
> kali lebih panjang daripada jawabannya. Jadi "kirim jawaban beserta batasnya" gagal ke
> dua arah sekaligus: mengirim jawabannya saja mencopot batasnya, dan mengirim keduanya
> menghasilkan pesan 3.000 aksara yang tidak dibaca siapa pun. Yang dikirim karena itu
> bukan salinan layar melainkan **kartu yang disusun** — 630 aksara untuk produk, 1.033
> untuk resep pengendali.
>
> **Bentuknya sudah ditetapkan riset UI proyek ini sendiri**, dari arah yang lain:
> [17](17-tiga-konsep-ui.md) bagian 7.1 menyimpulkan percakapan peer sudah terjadi tiap
> hari di grup WhatsApp, jadi *"yang kurang bukan tempatnya, melainkan mutu bahan yang
> beredar di sana"*. Tiga sifat wajibnya datang dari sana: batasnya **melekat di badan
> teks** supaya ikut terbaca di tangan kesepuluh, **tanggal dan status dicetak di kartu**
> karena kartu yang sudah beredar tidak bisa ditarik, dan bentuknya khas karena tidak ada
> yang bisa mencegah orang mengetik ulang kartu palsu.
>
> **Kartu tanpa batas tidak disusun sama sekali.** Layar wajib menyebut `wajib` — kalimat
> yang tidak boleh hilang saat kartunya berpindah tangan. Untuk resep pengendali itu status
> hukum Pasal 77 dan dasar tenggang panennya; untuk produk terdaftar itu "cocokkan nomornya
> dengan kemasan". Dan kartu **tidak pernah dipotong diam-diam**: yang melewati batas
> panjang alamat menolak jalur WhatsApp beserta sebabnya, karena yang terpotong lebih dulu
> justru batasnya — letaknya di ekor.

### Gelombang 2 — eksekusi berbayar (fase 3)

**E1–E4** rencana, realisasi, simpangan, pengingat · **E5** buku kas ·
**F1** berkas bukti · **G2** umpan balik menaikkan tingkat bukti · **G6** lapis peer.

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
| **Peringkat, ulasan, atau sinyal popularitas atas produk komersial** | Ditolak `L3`; dan peringkat adalah penempatan berbayar yang menyamar. Berlaku sama pada bentuk yang tidak menyebut dirinya peringkat: urutan menurut seberapa sering sesuatu dipakai, label "paling banyak dipilih", jumlah bintang, dan **agregasi pengalaman pengguna pada tingkat produk**. Pengalaman pengguna hanya boleh masuk sebagai `Observation`, diagregasi **paling rinci pada tingkat bahan aktif atau hara**, **selalu dengan penyebutnya**, **tidak pernah diurutkan menurut frekuensi**, dan **ditahan sama sekali di bawah penyebut minimum** — sebab penyebut kecil adalah tempat termurah untuk dibajak |
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

## 9. Yang harus diuji Fase 1 — lima terjawab, dua masih terbuka

Ditambahkan ke lima pertanyaan di [02-tiga-pasar.md](02-tiga-pasar.md) bagian 8, diurutkan
menurut kerusakan kalau jawabannya berbeda dari dugaan.

**Lima terjawab pada 22 Agustus 2026** oleh pemilik repo. Ini **satu narasumber, bukan
wawancara Fase 1** — bobotnya diperlakukan sebagaimana mestinya, dan yang paling menentukan
di antaranya kebetulan punya pembenaran kedua dari registri sendiri.

1. ~~Apakah petani atau kios benar-benar memeriksa nomor pendaftaran sebelum membeli?~~
   **Terjawab — dan ia mengganti premis C2.**

   > *"Tidak. Biasanya langsung lihat kemasan, cek kandungan. Umumnya rekomendasi dari
   > peers. Khususnya petani. Kalau kios, tergantung dari insentif dari principal dan
   > potensi demand."*

   Tiga akibat. **Nomor bukan pintu** — C2 pindah ke kandungan. **Cadangannya ikut gugur**:
   pindah ke kios tidak menyelamatkan, karena kios bergerak menurut insentif principal,
   motif yang berlawanan dengan pemeriksaan. Dan **"rekomendasi dari peers" memunculkan
   G6** — lapis yang daftar ini semula tidak punya sama sekali.

   Registri membenarkannya dari sisi lain: **667 dari 7.196 pupuk (9,3%) tak bernomor sama
   sekali**, sementara 71,3% berkomposisi. Dua garis bukti yang tidak berhubungan.
2. ~~Nama lokal apa yang dipakai untuk sepuluh OPT cabai?~~ **Terjawab sebagian.**

   > *"Setiap daerah memiliki bahasa lokal yang berbeda. Tapi umumnya: bule, patek, lodoh,
   > layu, bercak daun, keriting daun."*

   Enam nama pertama untuk A3 — dan peringatannya sama pentingnya: kamusnya harus tahu
   nama itu dipakai **di mana**, bukan satu daftar nasional.
3. **Berapa kali dalam semusim seorang petani menghitung ongkos?** *Masih terbuka.*
   Menentukan apakah D3 punya momen, atau cuma terasa berguna saat ditanyakan.
4. ~~Siapa yang menakar dosis di lahan?~~ **Terjawab: *"keduanya."*** D4/D5 melayani petani
   **dan** buruh semprot, jadi bahasanya harus jalan untuk orang yang tidak memilih dosisnya
   sendiri — bukan hanya untuk yang memutuskan.
5. ~~Apakah buku kas per petak sudah ada dalam bentuk apa pun?~~ **Terjawab, dan dugaannya
   meleset ke arah yang lebih sulit.**

   > *"Biasanya kalaupun ada dalam bentuk buku kertas. Umumnya petani kecil mengandalkan
   > ingatan saja."*

   Dokumen ini menduga E5 tinggal memindahkan bentuk. Ternyata **kebiasaan baru** — jauh
   lebih mahal diterima.
6. ~~Apa yang terjadi ketika seseorang mencurigai pupuk palsu?~~ **Terjawab: *"berhenti di
   pemeriksaan."*** Tidak ada jalur lapor yang menampung, jadi **pelaporan dicabut dari
   cakupan C2.** Kotak masuk yang tak seorang pun di ujungnya lebih buruk daripada tidak
   ada kotak masuk.
7. ~~Berapa jarak antara harga acuan Bapanas dan harga yang diterima petani?~~
   **Terjawab** oleh [16-sumber-harga-komoditas.md](16-sumber-harga-komoditas.md), dan
   jawabannya menutup pertanyaannya sendiri: acuan itu **harga pengumpul**, jadi jaraknya
   bukan besaran yang bisa diukur — ia definisi. Setoran petani wajib.

   **Yang menggantikannya:** *berapa harga yang benar-benar diterima petani di sentra
   beachhead, dan maukah ia menyetorkannya?* Tidak ada satu pun sumber resmi yang
   mengukurnya — bahkan Survei Harga Produsen Gabah BPS hanya menutupi gabah. Kalau petani
   tidak mau menyetor, C4 berhenti di harga eceran, dan seluruh janji "menutup lubang harga"
   gugur bersamanya.

**Dua pertanyaan baru lahir dari jawaban di atas**, dan keduanya menggantikan yang tertutup:

- **Seberapa jauh nama lokal berbeda antarsentra?** Jawaban ke-2 menyebut perbedaannya ada
  tetapi tidak seberapa besar. Kalau bedanya kecil, A3 satu kamus dengan penanda wilayah.
  Kalau besar, A3 harus per wilayah sejak awal — dan biayanya berlipat.
- **Apa yang membuat seorang petani mau menyetorkan pengalamannya?** Seluruh G6 berdiri di
  atasnya, dan jawaban ke-5 memberi pertanda buruk: yang mengandalkan ingatan untuk
  urusannya sendiri belum tentu mau mencatat untuk orang lain.

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
- Harga — seluruhnya dipilah ulang di [16-sumber-harga-komoditas.md](16-sumber-harga-komoditas.md). [Panel Harga Pangan Bapanas](https://panelharga.badanpangan.go.id/harga-produsen) **mati sejak Oktober 2025**; [PIHPS Bank Indonesia](https://www.bi.go.id/hargapangan) hidup tetapi "produsen"-nya harga pengumpul; [SP2KP Kemendag](https://satudata.kemendag.go.id/) satu-satunya yang berlisensi terbuka
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
[11-instrumentasi.md](11-instrumentasi.md) · [12-kadensi-registri.md](12-kadensi-registri.md) ·
[16-sumber-harga-komoditas.md](16-sumber-harga-komoditas.md) · [toko_data/LAPIS.md](../toko_data/LAPIS.md)

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
