# Keputusan desain

Catatan singkat setiap keputusan yang mengikat, beserta alasan dan hal yang
dikorbankan. Ditulis sekarang supaya enam bulan lagi tidak ada yang bertanya
"kenapa dulu begini" dan menjawabnya dengan tebakan.

---

### D1 — Rencana dan realisasi memakai satu entitas, dibedakan `mode`

Alternatifnya: dua entitas terpisah (`PlannedTask` dan `WorkRecord`, seperti ADAPT).

Dipilih satu entitas karena nilai utama platform adalah **selisih antara rencana
dan realita**. Dua entitas terpisah berarti setiap perhitungan kepatuhan harus
menerjemahkan dua bentuk yang berbeda, dan penerjemahan itu akan pelan-pelan
berbeda antar-bagian sistem.

Harganya: satu `if/then` di skema untuk memastikan `planned` punya `timing` dan
`executed` punya `occurred_at`. Harga yang murah.

---

### D2 — UUIDv7 untuk data lapangan, nomor 8 digit untuk kosakata

Sinyal di lahan tidak bisa diandalkan, jadi ID harus bisa dibuat offline. UUIDv7
memberi itu sekaligus keterurutan waktu. Kosakata terkurasi tidak punya masalah
offline dan justru butuh nomor pendek yang mudah dirujuk manusia.

Harganya: butuh satu pustaka kecil untuk membuat UUIDv7 di setiap bahasa. Sepadan
dibanding kehilangan keterurutan selamanya.

---

### D3 — Satuan memakai UCUM, tanpa registry satuan sendiri

Membuat daftar satuan sendiri selalu berakhir dengan `kg/ha` dan `kg/Ha` hidup
berdampingan. UCUM sudah menyelesaikan ini dan punya pustaka konversi di mana-mana.

Harganya: `har` untuk hektar terasa asing bagi orang yang terbiasa menulis `ha`.
Lapisan tampilan yang menerjemahkan, bukan lapisan data.

---

### D4 — `Rate.basis` sebagai field wajib

Ini keputusan yang membuat model benar-benar agnostik. Tanpa `basis`, angka dosis
harus ditafsirkan dari konteks komoditas — dan setiap komoditas baru menambah
cabang kode.

Dengan `basis`, pemupukan cabai (`per_area`) dan pakan udang (`per_mass_biomass`)
melewati jalur kode yang sama. `Cycle.population` menyediakan faktor konversi
antar-basis.

---

### D5 — `Timing` punya lima bentuk, bukan satu tanggal

Protokol nyata tidak berbunyi "aplikasikan pada 15 Juli". Bunyinya "saat kuncup
bunga pertama tampak", atau "bila populasi trips mencapai 5 per daun muda", atau
"setiap hari selama DOC 16–45".

Memaksa semua itu jadi tanggal berarti membuang justru bagian yang bernilai
secara agronomis. Penjadwalan berbasis ambang (`condition`) adalah yang membedakan
protokol dari jadwal semprot rutin — dan itu yang menurunkan biaya petani.

---

### D6 — Netralitas vendor ditegakkan pemeriksa, bukan hanya kebijakan

`InputApplication.substance` selalu wajib; `product` selalu opsional. Aturan `L3`
menolak langkah rencana milik protokol yang menyebut produk komersial.

Karena project ini bersinggungan dengan latar belakang produk input tertentu,
janji netralitas yang hanya tertulis di kebijakan tidak akan dipercaya — dan
memang sepatutnya tidak. Janji yang dijalankan mesin dan diuji di
`fixtures-invalid/L3-produk-di-protokol.json` bisa diperiksa siapa saja.

---

### D7 — Pemetaan luar wajib, atau alasan tertulis wajib

Aturan `L9`. Tanpa ini, membuat istilah sendiri selalu lebih cepat daripada mencari
padanan yang sudah ada, dan dalam enam bulan kosakata Open Protocols akan jadi pulau
terpencil yang tidak bisa ditukar dengan siapa pun.

`no_mapping_reason` sengaja diberi panjang minimum supaya tidak bisa diisi "-".

---

### D8 — Kepatuhan PDP masuk ke skema, bukan ditempel belakangan

`data_classification` wajib pada setiap entitas data usaha tani.
`Actor.consent` merekam dasar pemrosesan, cakupan, dan waktu pencabutan.

NIK dan nomor identitas lain **sengaja tidak ada** di lapis ini. Kalau suatu saat
dibutuhkan untuk e-RDKK, simpan di sistem terpisah dengan dasar pemrosesan sendiri.
Data yang tidak disimpan tidak bisa bocor.

Aturan `L7` menolak plot bergeometri yang diklasifikasikan `public`. Batas lahan
bernilai komersial dan bisa dipakai mengidentifikasi orang.

---

### D9 — Mutu geometri dinyatakan, bukan diasumsikan

`geometry_quality` memaksa perbedaan antara poligon hasil survei dan titik tunggal
tetap terlihat. Sistem yang menyamarkan titik tunggal jadi poligon perkiraan akan
menghasilkan klaim EUDR yang tidak bisa dipertahankan saat diaudit.

---

### D10 — `deviation` adalah warga kelas satu

Kebanyakan sistem pencatatan usaha tani memperlakukan penyimpangan dari rencana
sebagai data kotor. Di sini justru sebaliknya: `DeviationReason` adalah entitas
terkurasi dengan field `signals` yang menyatakan **apa yang harus ditindaklanjuti
tim** ketika alasan itu sering muncul —
`protocol_problem`, `access_problem`, `external_shock`, atau `recording_problem`.

Kalau "input tidak tersedia" muncul di 40% petani, itu bukan masalah protokol —
itu masalah rantai pasok, dan datanya baru berguna kalau bisa dibedakan.

Aturan `L8` menolak realisasi yang berbeda dari rencana tanpa alasan.

---

### D11 — Tidak ada field "kelompok komoditas"

Pengelompokan diambil dari konsep `broader` AGROVOC lewat `mappings`. Taksonomi
buatan sendiri akan langsung bertengkar dengan pengelompokan Kementan, BPS, dan
mitra ekspor — masing-masing punya versinya sendiri dan semuanya sah di
konteksnya.

---

### D12 — Produk wajib punya izin edar yang bisa diverifikasi

`Product.registration` wajib. Tanpa nomor pendaftaran, produk tidak boleh masuk
registry. Ini sekaligus batas hukum (pestisida wajib terdaftar) dan penyaring
kualitas yang tidak bisa dinegosiasikan lewat hubungan baik.

---

### D13 — `substance_classes` jamak, bukan tunggal

Awalnya satu bahan hanya boleh punya satu peran. Saat 382 bahan aktif dari registri
Kementan dimasukkan, pemeriksa menangkap tabrakan pada **belerang**: ia terdaftar sebagai
hara sekaligus fungisida, dan keduanya benar.

Memaksa memilih salah satu akan memalsukan yang lain. Field diubah jadi array. Ini contoh
bagus bahwa aturan pemeriksa bekerja bukan hanya menangkap salah ketik — ia menangkap
model yang keliru.

---

### D14 — nama kanonik plus seluruh ejaan registri sebagai `synonyms`

Registri resmi tidak punya nama kanonik. `Sipermetrin`, `sipermetrin`, `SIPERMETRIN`, dan
`Cypermethrin` semuanya hidup berdampingan; 389 dari 1.527 nama punya lebih dari satu
ejaan. Setiap entitas memilih satu nama kanonik dan menyimpan sisanya di `synonyms`.

Konsekuensinya nyata: tanpa lapis ini, "berapa formulasi mengandung sipermetrin" adalah
pertanyaan yang tidak bisa dijawab dari registri resmi tanpa membereskan ejaannya lebih
dulu. Itulah kerja yang dilakukan lapis generik ini, dan alasannya bukan kerapian
melainkan agar angka-angkanya benar.

---

### D15 — nomor CAS dikosongkan, bukan ditebak

382 bahan aktif masuk tanpa satu pun nomor CAS baru. Pengayaan itu pekerjaan terpisah
terhadap registri kimia. Nomor CAS yang salah akan menyatu ke sistem lain lewat
`mappings` dan sangat sulit dicabut kembali; kolom kosong yang jujur jauh lebih murah
daripada kolom terisi yang keliru.

Prinsip yang sama berlaku pada kode cara kerja: 55 kode IRAC, FRAC, dan HRAC yang ada
diambil dari daftar resmi masing-masing komite dalam sesi ini, bukan dari ingatan. Yang
tidak sempat diambil dibiarkan kosong.

---

### D16 — registri produk disimpan sebagai snapshot, bukan ditarik saat dibutuhkan

Portal Kementan hanya memuat izin yang masih berlaku: kedaluwarsa terawal 12 Oktober 2026,
tidak ada satu pun yang sudah lewat. Produk yang izinnya habis **hilang dari sumber**.

Catatan usaha tani musim lalu bisa menunjuk produk yang sudah tidak ada lagi di portal.
Kalau registri hanya ditarik saat dibutuhkan, rujukan itu akan menggantung dan riwayat
menjadi tidak terbaca. Karena itu 14.920 produk disimpan di repositori sebagai snapshot
bertanggal, dan penarik ulangnya disediakan supaya perbedaannya bisa dilihat kapan saja.

---

### D17 — sasaran label disimpan sebagai teks asli, bukan dipaksa jadi entitas

23.058 baris penggunaan berlabel memakai 890 nama komoditas dan 1.531 nama OPT dalam teks
bebas — termasuk hal yang bukan komoditas sama sekali, seperti "Di dalam ruangan" untuk
pestisida rumah tangga.

Membuat 890 entitas `Commodity` dari daftar itu akan menghasilkan ontologi palsu: separuhnya
bukan komoditas, dan `kind` mana pun yang dipilih akan salah. Teks aslinya disimpan di
`commodity_label`, `pest_label`, dan `rate_text`; `commodity` tetap boleh diisi kalau sudah
direkonsiliasi. Tidak ada data yang hilang, dan tidak ada yang dikarang.

---

### D18 — komposisi jadi opsional, tetapi pemakaiannya dibatasi

Tidak semua produk terdaftar punya kandungan hara yang bisa diketahui. Memaksa `composition`
tetap wajib berarti ribuan pupuk terdaftar tidak bisa masuk sama sekali — kehilangan yang
jauh lebih besar daripada manfaatnya.

Jalan tengahnya bukan melonggarkan begitu saja: `composition` jadi opsional, tetapi aturan
`L14` menolak produk tanpa komposisi dipakai menghitung `nutrients_delivered`. Produk boleh
ada di registri, tetapi tidak boleh jadi dasar angka yang tidak bisa diturunkan dari mana pun.

**Koreksi 19 Agustus 2026.** Keputusan ini semula ditulis di atas pernyataan bahwa registri
pupuk Kementan tidak memuat kandungan hara sama sekali. Pernyataan itu keliru. Registri
SIMPEL punya kolom `hasilAnalisaUji` yang terisi di seluruh 5.875 barisnya; yang membuatnya
seolah tidak ada adalah penarikan pertama yang mengekstrak registri ke CSV tanpa membawa
kolom itu — lalu ketiadaannya terlanjur dicatat sebagai temuan tentang sumbernya.
`spec/tools/isi-komposisi-pupuk.mjs` mengisinya belakangan: 5.130 baris kini punya
`composition`, 29.622 parameter tersimpan mentah di `analysis`. Keputusan D18 sendiri tetap
berlaku — 745 baris SIMPEL dan seluruh 1.321 baris basis lama SIMPUK memang tidak punya
kadar hara, dan `L14` masih menjaganya.

Pelajarannya bukan soal satu kolom yang luput, melainkan soal urutan: temuan tentang sumber
data seharusnya diverifikasi ke sumbernya, bukan ke hasil ekstraksi kita sendiri. Ekstraksi
yang lossy akan terbaca persis seperti sumber yang miskin.

---

### D19 — sediaan buatan sendiri jadi lapis ketiga, bukan ditempelkan ke `Product`

Kompos, MOL, dan ekstrak nabati tidak muat di dua lapis yang ada. Bukan `Substance`,
karena ia campuran hasil proses, bukan bahan tunggal. Bukan `Product`, karena aturan
`D12` menuntut izin edar yang bisa diverifikasi — dan sediaan buatan sendiri memang
tidak punya, karena memang tidak diperjualbelikan.

Pilihan yang diambil: entitas `Preparation` (`op:sed`) untuk **resepnya**, dan
`PreparationBatch` (`op:bat`) untuk **adonan yang benar-benar dibuat**. Pemisahannya
mengikuti pola yang sudah ada: resep adalah kosakata terkurasi, batch adalah data
usaha tani milik petani.

Akibat yang tidak diduga tetapi menyenangkan: karena resep terbuka bukan produk
siapa pun, ia **boleh** disebut langsung di langkah rencana milik protokol tanpa
melanggar `D6`. Netralitas vendor selama ini memaksa protokol berhenti di tingkat
hara; dengan lapis ini, protokol netral-vendor justru bisa memuat formulasi utuh —
lengkap dengan cara membuat dan cara memeriksanya. Yang tetap dilarang adalah
menyebut **batch** tertentu, karena batch adalah data satu kebun.

Alasan lengkapnya ada di [`docs/01-sediaan-buatan-sendiri.md`](../docs/01-sediaan-buatan-sendiri.md).

### D20 — status hukum ditanam di entitasnya, bukan disimpan sebagai daftar terpisah

Daftar bahan terlarang bisa saja disimpan sebagai berkas tersendiri lalu dicocokkan saat
diperlukan. Yang dipilih sebaliknya: `hazard.regulatory_status` menempel pada bahan
aktifnya, lengkap dengan instrumen hukum, letak persis di dalam peraturan, dan tanggal
verifikasi.

Alasannya, larangan di Indonesia sebagian besar **bersyarat cakupan**: klorpirifos boleh
untuk banyak komoditas tetapi dilarang untuk padi dan untuk rumah tangga; parakuat boleh
tetapi terbatas dan menuntut sertifikat. Daftar datar tidak bisa menyatakan itu — yang
dibutuhkan adalah cakupan per entri, dan cakupan itu hanya bermakna kalau menempel pada
bahannya.

Konsekuensinya `L22` bisa memutuskan dengan tepat: menolak bila cakupannya kena, dan diam
bila tidak. Tanpa itu, aturannya hanya punya dua pilihan sama-sama salah — menolak semua
atau melewatkan semua.

---

### D21 — peraturan yang dirujuk harus dipastikan masih berlaku

Pencarian daring untuk "bahan aktif pestisida dilarang" hampir selalu mengarah ke Permentan
39/2015 atau bahkan Permentan 01/2007. Keduanya **sudah dicabut** oleh Permentan 43/2019,
dan isinya berbeda: daftar 2019 memuat 102 bahan aktif dengan kolom bidang penggunaan yang
tidak ada di versi 2015.

Memakai daftar yang sudah dicabut untuk data keselamatan adalah kesalahan yang tidak
terlihat sampai ada yang dirugikan. Karena itu setiap entri `regulatory_status` wajib
menyebut `instrument` dan `citation`, dan status keberlakuannya dicek ke JDIH sebelum
dipakai — bukan disimpulkan dari peringkat hasil pencarian.

---

### D22 — nomor ID dialokasikan per blok, bukan dari satu antrean

Awalnya nomor terkurasi diberikan berurutan dari `maksimum global + 1`. Itu bekerja sempurna
selama hanya ada satu penulis, dan patah pada hari pertama ada dua: dua sesi menghitung
maksimum dari keadaan yang sama-sama sudah usang, lalu memberikan nomor identik ke entitas
berbeda.

Sekarang setiap berkas menyatakan `id_blocks` dan mengambil nomor dari bloknya sendiri.
Penambahan paralel jadi aman tanpa koordinasi apa pun — tidak ada penulis yang perlu tahu
apa yang sedang dikerjakan penulis lain.

Yang dikorbankan: nomor jadi tidak rapat, dan ada tabel blok yang harus dirawat
(`00-konvensi-kerja-paralel.md`). Murah dibanding penomoran ulang massal.

Aturan `L23`, `L24`, dan `L25` menegakkannya. Tanpa itu ini hanya kesepakatan lisan, dan
kesepakatan lisan tidak bertahan melewati sesi berikutnya.

---

### D23 — kolom nama ilmiah pada registri diperlakukan sebagai teks bebas, bukan data

Kolom nama ilmiah di registri pestisida terlihat seperti data terstruktur. Ternyata bukan:
isinya kerap menempelkan dosis (`Thrips sp. (2 g/10 l`, tanda kurungnya bahkan tidak
tertutup), kalimat peringatan (`Ludwigia octovalvisKalimat peringatan: Sisa gulma...`), dan
beberapa spesies berturut-turut tanpa pemisah (`Ageratum conyzoidesAlternanthera
piloxeroidesAlternanthera sesilis...`).

Percobaan pertama memakai isi kolom itu apa adanya sebagai identitas, dan menghasilkan 1.806
"spesies" yang sebagian nyata-nyata sampah. Aturan `L26` yang baru dibuat langsung menolak
237 tautan — di pekerjaan sendiri, sebelum sempat tersimpan.

Pendekatan yang dipakai sekarang: ambil **binomial di awal string** dan buang sisanya. Hasilnya
1.360 organisme dari 96,1% baris. Sisa 3,9% dibiarkan tidak tertaut, bukan ditebak.

Pelajarannya bukan soal parsing. Aturan pemeriksa ternyata paling berguna justru saat
menangkap kesalahan penulisnya sendiri — dan itu hanya bisa terjadi kalau aturannya ditulis
sebelum datanya dianggap selesai.

---

### D24 — klasifikasi hayati diambil dari sumber taksonomi, bukan dari nama Indonesia

`pest_kind` awalnya disimpulkan dengan mencocokkan kata pada nama Indonesia. Cara itu 79%
benar — cukup baik untuk terlihat berhasil, dan cukup buruk untuk menyesatkan.

Pemeriksaan ke GBIF mengoreksi 81 klasifikasi, 42 di antaranya jamur yang sebenarnya
oomycete. Bedanya menentukan bahan aktif: metalaksil bekerja pada oomycete, tidak pada jamur
sejati. Kekeliruan itu mustahil terlihat dari nama Indonesia, karena keduanya sama-sama
disebut "penyakit busuk daun".

Batas yang ditarik: pencocokan fuzzy diterima untuk memperbaiki salah ketik, tetapi ditolak
ketika kemiripannya rendah DAN hasilnya berbeda kingdom dari simpulan semula. Percobaan
fuzzy tingkat genus dibatalkan sepenuhnya setelah `Altemaria` dicocokkan ke `Algemaria`
alih-alih `Alternaria`. Untuk field yang menentukan pilihan pengendalian, 202 entitas dengan
ketidakpastian yang dinyatakan lebih berguna daripada 202 entitas yang rapi tetapi salah.

Ejaan asli registri tetap disimpan di `scientific_name`; nama yang diterima GBIF masuk
`accepted_scientific_name`. Menimpanya akan memutus jejak ke sumber, dan registri itu memang
penuh salah ketik — lima ejaan berbeda untuk *Phytophthora* saja.

---

### D25 — satu entitas varietas untuk satu catatan registri, bukan untuk satu nama

Registri perizinan varietas memuat 11.235 catatan dengan hanya 9.706 nama berbeda. PERTIWI,
MADU, dan MUTIARA masing-masing menempel pada beberapa komoditas; 772 kelompok bahkan sama
nama sekaligus sama jenis tanamannya, dan berbeda hanya pada pemohon atau tahun.

Menggabungkan catatan yang sama nama berarti menyatakan bahwa keduanya varietas yang sama.
Registri tidak menyediakan dasar untuk pernyataan itu — tidak ada satu pun kelompok yang
isinya identik persis, dan FEIRA IPB pada cabai rawit muncul tiga kali (2021, 2023, 2025)
dengan dua fakultas IPB berbeda sebagai pemohon. Bisa jadi itu satu varietas yang mengurus
izin berulang, bisa jadi dua galur berbeda dengan nama sama.

Yang diambil: satu catatan satu entitas, `key` dibedakan dengan akhiran urut bila
bertabrakan. Penggabungan menyusul sebagai kurasi terpisah, dengan bukti, bukan sebagai
efek samping impor.

---

### D26 — `variety_type` jadi opsional

Bidang ini semula wajib. Registri tidak menyatakannya, dan hanya 1.173 dari 11.227 varietas
menyebutkannya secara tidak langsung: jenis tanaman bertuliskan Hibrida (570) atau Inbrida
(427), jenis perizinan Pendaftaran Varietas Lokal (154), atau nama memuat klon (22).

Mengisi 10.054 sisanya dengan `cultivar` akan terlihat rapi dan menyesatkan. Hibrida atau
bukan menentukan apakah petani boleh menyimpan benih sendiri untuk musim berikutnya — justru
pertanyaan yang paling sering ditanyakan, dan yang paling mahal kalau dijawab salah. Kosong
berarti tidak diketahui.

---

### D27 — `permits` di samping `release`, karena tiga izin berbeda akibat hukumnya

Registri mencatat tiga keluarga perizinan: pelepasan (5.826) yang mengizinkan peredaran,
pendaftaran (5.181) yang sekadar mencatat keberadaan varietas, dan perlindungan (580) yang
memberi hak kekayaan intelektual. Satu varietas bisa punya lebih dari satu — 375 varietas
punya dua atau tiga.

`release` sendirian tidak cukup: memasukkan pendaftaran ke dalamnya akan menyatakan bahwa
varietas itu boleh diedarkan, padahal pendaftaran tidak memberi hak itu. Jadi seluruh
perizinan disimpan di `permits` beserta nama jenisnya apa adanya, dan `release` hanya diisi
bila memang ada pelepasan.

---

### D28 — skala fase menempel di komoditas, bukan di varietas

Permintaannya "tautkan varietas ke skala fase BBCH", tetapi tautannya tidak diletakkan di
`Variety`. Fenologi adalah sifat tanamannya: seluruh cabai melewati deret fase yang sama,
dan yang membedakan antar-varietas adalah panjang tiap fase, bukan ada-tidaknya fase itu.
Menyalin rujukan skala ke 11.227 varietas berarti menyimpan fakta yang sama 11.227 kali,
lalu menanggung risiko 11.227 tempat yang bisa menyimpang.

Yang dipakai: `Commodity.default_stage_scale` dan `StageScale.applies_to.commodities` —
keduanya sudah ada di skema sejak awal — dan varietas mewarisi lewat komoditasnya. Siklus
yang benar-benar perlu skala lain tetap bisa menimpanya lewat `Cycle.stage_scale`.

Cakupannya dikurasi tangan, tidak dipetakan otomatis dari nama. Kunci BBCH sayuran buah
Solanaceae (Feller dkk. 1995) mencakup cabai, tomat, dan terung — bukan seluruh Solanaceae.
Kentang dan tembakau punya kunci sendiri dan sengaja dibiarkan tanpa skala sampai kuncinya
masuk. Pencocokan berdasar nama akan menarik keduanya masuk, dan juga menarik Cabe Jawa yang
ternyata *Piper retrofractum* — famili Piperaceae, sama sekali bukan Solanaceae.

Aturan `L28` menegakkan kesepakatan dua arahnya, karena tautan dua arah yang hanya dijaga
kedisiplinan akan menyimpang cepat atau lambat.

---

## Pertanyaan yang masih terbuka

Perlu keputusan sebelum v0.2 — sebagian butuh data lapangan Fase 1 lebih dulu.

| # | Pertanyaan | Posisi sementara |
|---|---|---|
| 1 | **Tumpangsari** dalam satu petak | Dua `Cycle` pada `Plot` yang sama. Perlu diuji ke petani sayuran yang biasa tumpangsari |
| 2 | `Variety` terkurasi atau data petani? | Terkurasi, dengan `Cycle.variety_local_name` sebagai jalan keluar untuk varietas lokal |
| 3 | Seberapa dalam **model biaya**? | `Step.cost` masih satu angka. Tunggu data pilot sebelum diperdalam |
| 4 | Perlukah entitas **Alsintan** | Belum. Masuk kalau mitra offtaker menuntut bukti mekanisasi |
| 5 | `Plot` bisa berubah bentuk antar-musim | `geoids` sudah menampung riwayat, tetapi versi geometri belum dimodelkan |
| 6 | **Bahasa** — wajib `id`, `en` dianjurkan | Cukup untuk sekarang. Bahasa daerah menunggu bukti kebutuhan dari Fase 1 |
| 7 | Basis URI dan awalan `op:` | Menunggu keputusan nama di Fase 0 |
| 8 | 3,9% baris OPT dan 1,5% sasaran masih tak tertaut | Nama sumbernya terpotong atau bukan nama sasaran; ditinggalkan apa adanya |
| 13 | 202 OPT tidak tercocok di GBIF | Nama sumbernya salah ketik terlalu jauh; klasifikasinya masih simpulan dan ditandai `needs_review` |
| 14 | Kelompok fungsional seperti "gulma berdaun lebar" belum jadi entitas | Sekarang hanya tersimpan sebagai synonyms pada spesies anggotanya |
| 9 | Lampiran I.B melompati nomor 18 dan 21 pada lapisan teks PDF | Perlu pemeriksaan visual dokumen asli — entah sumbernya memang melompat, entah ekstraksinya kehilangan dua baris |
| 12 | CAS asam sulfat ditulis `7669-93-9` di Permentan 43/2019 | Nomor bakunya `7664-93-9`, dan itu yang dipakai Permentan 39/2015. Direkam apa adanya plus penanda |
| 10 | 745 baris SIMPEL dan 1.321 baris basis lama tetap tanpa kadar hara | Perlu sumber lain — label kemasan, atau data dari principal langsung. Sisa registri sudah terisi dari `hasilAnalisaUji` |
| 15 | Persen pada registri pupuk tidak menyatakan basisnya | Dibaca b/b (g/kg) untuk bentuk padat dan b/v (g/L) untuk cair. Untuk cair ini asumsi, bukan keterangan sumber; angka aslinya tetap di `analysis` sehingga bisa dihitung ulang bila ternyata b/b |
| 16 | Cacah mikroba pupuk hayati belum jadi `composition` | 2.563 nilai CFU tersimpan di `analysis`; butuh entitas `Substance` per organisme dan aturan yang memisahkannya dari hara |
| 17 | Bentuk oksida & unsur yang belum dimodelkan | `B2O3`, `Na2O`, `CuO`, `ZnO`, `SO4`, serta `K`/`P`/`Mg` sebagai unsur ditinggal mentah — mengonversinya ke bentuk yang sudah ada akan mengarang angka yang tidak ditulis sumbernya |
| 11 | 275 pestisida tanpa komposisi | Kadar bahan aktifnya bukan angka di sumber (mis. agens hayati berbasis populasi) |
| 18 | 8 catatan varietas tanpa jenis tanaman tidak diterbitkan | Tidak bisa ditautkan ke komoditas mana pun. Salah satunya `kelapa ok` dari pemohon `tes ujicoba` — data uji coba yang tertinggal di registri resmi |
| 19 | Cabai Keriting dan Cabai Besar jadi komoditas terpisah dari Cabai | Kegranularan registri dipertahankan, tetapi `Commodity` belum punya hubungan hierarkis internal — pengelompokan seharusnya lewat konsep broader AGROVOC yang belum dipetakan |
| 20 | 772 kelompok varietas sama nama & sama jenis | Sengaja tidak digabung (D25). Perlu kurasi berbukti untuk memutuskan mana yang benar-benar satu varietas |
| 21 | 1.042 catatan varietas tanpa pemohon | Sebagian besar era pelepasan lama yang pengusulnya tidak tercatat; `maintainer` dikosongkan, bukan ditebak |
| 22 | 89% varietas belum punya skala fase | Bukan tautannya yang kurang, tetapi kuncinya yang belum ada. Prioritas: padi (1.434 varietas) dan jagung (739), keduanya punya kunci BBCH resmi yang perlu disusun dari sumbernya |
