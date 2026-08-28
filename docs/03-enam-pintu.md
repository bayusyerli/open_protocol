# Enam pintu ke satu registri

> Dokumen konsep · permukaan baca-saja · 20 Agustus 2026  
> Semuanya baca-saja, tanpa akun, tanpa petak terdaftar, tanpa rencana. Semuanya bisa dibangun dari data yang **sudah ada hari ini** — dan tidak satu pun menuntut siapa pun mengubah kebiasaannya lebih dulu.  
> Enam jalur, **satu indeks** · Nol masukan pengguna, **kecuali harga** · Turunan dari **docs/00-fondasi** & **docs/01-sediaan**  
>
> Diekstrak dari dokumen konsep HTML dengan judul sama, 20 Agustus 2026.
> Isi, angka, dan tabelnya utuh; simulasi yang bisa diklik tidak ikut —
> alurnya ditulis ulang sebagai teks.
>
> Dokumen payung untuk 04–09: keenam jalur, aturan lintas jalur, dan lubang datanya.
>
> **Keenamnya sudah berjalan** sebagai berkas statis di [`app/`](../app/), membaca
> indeks turunan di `spec/indeks/`. Bagian 7 mencatat urutan yang benar-benar
> ditempuh, bukan lagi rencana.

---

## 1. Pembalikannya

Seluruh rancangan sebelumnya menjawab pertanyaan “bagaimana mengumpulkan data”. Lapisan ini membalik: **apa yang bisa diberikan hari ini dari data yang sudah dipegang**, sebelum siapa pun mencatat apa pun.

Pembalikan itu menyelesaikan dua masalah sekaligus. Ia melayani perilaku reaktif alih-alih melawannya — orang datang saat butuh, bukan saat dijadwalkan. Dan ia tidak membawa satu pun risiko yang membuat segmen petani ditunda di dokumen STP: tidak ada atribusi yang diperdebatkan, tidak ada klaim mutu data yang harus dipertahankan, tidak ada data pribadi yang dikumpulkan.

> Yang paling menyenangkan dari keenam jalur ini: **tidak satu pun meminta pengguna mempercayai kami.** Semuanya menyajikan isi registri resmi, dan menunjuk sumbernya.

---

## 2. Peta

**Registri Kementan + kosakata terkurasi**

**7.724** pestisida · **7.196** pupuk · **11.227** varietas · **1.106** bahan aktif · **23.058** penggunaan berlabel · **7+5** sediaan sendiri

Jalur 1 · insiden · **Masuk dari gejala**

*“Daun cabai saya keriting ke atas — ini apa?”*

Untuk pestisida. Reaktif, mendesak, tiga ketukan.

Jalur 2 · produk · **Masuk dari kemasan**

*“Kios menawarkan ini — sebenarnya isinya apa?”*

Berlaku untuk ketiga kategori. Tidak butuh kurasi apa pun.

Jalur 3 · hitungan · **Masuk dari harga**

*“Berapa rupiah per kilogram hara?”*

Untuk pupuk. Aritmetika, bukan diagnosis.

Jalur 4 · keabsahan · **Masuk dari nama varietas**

*“Varietas ini benar-benar ada dan dilepas?”*

Untuk benih *dan bibit*. Verifikasi, bukan rekomendasi.

Jalur 5 · sediaan pupuk · **Masuk dari niat menyuburkan**

*“Boleh tidak saya bikin pupuk sendiri?”*

Di luar rezim pendaftaran lewat Pasal 72. Tidak menunggu apa pun.

Jalur 6 · sediaan pengendali · **Masuk dari niat mengendalikan**

*“Boleh tidak saya bikin pestisida sendiri?”*

Pasal 77 melarang mengedarkan *dan menggunakan*. Menunggu pendapat hukum.

---

## 3. Enam jalur, dan batas masing-masing

| Jalur | Kategori | Ditopang data | Yang tidak sanggup |
|---|---|---|---|
| **1 · Insiden** — gejala → OPT → bahan | Pestisida | 23.058 penggunaan berlabel, 96,1% tertaut OPT, 80% berdosis; 97 OPT terkurasi bergejala di 18 komoditas, masing-masing dua ciri pembanding; rincian per komoditas di [14-tinjauan-gejala.md](14-tinjauan-gejala.md) | ✕ Diagnosis. Nol dari 685 OPT **registri** punya deskripsi gejala, jadi pintunya sebanyak yang terkurasi saja |
| **2 · Produk** — kemasan → isi → setara | Ketiganya | 96,4% pestisida & 71,3% pupuk punya komposisi; 63,5% pestisida identik dengan produk lain | ◐ Nama dagang di kemasan bisa berbeda dari nama terdaftar |
| **3 · Hitungan** — pupuk + harga → Rp/kg hara | Pupuk | 5.130 pupuk berkomposisi angka terhadap 17 hara | ✕ Harga (nol di registri) dan status subsidi (nol dari 7.196) |
| **4 · Keabsahan** — varietas → surat | Benih & bibit | 5.822 surat pelepasan, 5.138 pendaftaran, 580 PVT | ✕ Rekomendasi varietas. **Nol** dari 11.227 menyebut sifat agronomi |
| **5 · Sediaan pupuk** — niat menyuburkan → syarat | Pupuk sendiri | 7 resep, kriteria pelepasan lengkap, di luar rezim pendaftaran (Pasal 72) | ◐ Kadar hara tidak diketahui sampai satu batch diuji — `L18` |
| **6 · Sediaan pengendali** — niat mengendalikan → status hukum | Pestisida sendiri | 5 resep, kedudukan hukum per pasal, 6 aturan pemeriksa `L16`–`L21` | ✕ Tidak boleh disajikan sebagai anjuran sampai bacaan Pasal 77 ayat (1) dijawab |

*Kolom terakhir yang paling menentukan: apa yang datanya tidak sanggup, dan karena itu tidak boleh dijanjikan.*

---

## 4. Jalur kelima dan keenam: sediaan buatan sendiri

Empat jalur pertama semuanya mengandaikan **produk terdaftar**. Sediaan buatan sendiri secara definisi tidak punya nomor pendaftaran — bukan karena lalai, melainkan karena memang tidak diperjualbelikan. Tanpa kedua jalur ini, petani yang memberi 10 ton kompos per hektar tercatat sebagai petani yang tidak memupuk.

> **Temuan hukum yang membentuk seluruh tampilannya**
>
> UU 22/2019 memperlakukan pupuk dan pestisida buatan sendiri **sangat berbeda**, dan itu tidak boleh diratakan di layar.
>
> **Pupuk:** kewajiban melekat pada *peredaran*. Pasal 72 ayat (1) mengecualikan pupuk yang diproduksi petani kecil dari pendaftaran, dan ayat (2) memberi jalan mengedarkannya terbatas dalam satu kabupaten/kota. Petani yang mengomposkan untuk lahannya sendiri berada di luar rezim pendaftaran.
>
> **Pestisida:** Pasal 77 ayat (1) melarang mengedarkan *dan/atau **menggunakan*** pestisida yang tidak terdaftar. Kata “menggunakan” tidak muncul di sisi pupuk. Tidak ada Pasal 72 yang sepadan, dan ancamannya 7 tahun serta Rp5 miliar. Pasal 75 pun menentukan pestisida dari *kegunaannya*, bukan asal bahannya — sehingga rendaman mimba, biakan *Trichoderma*, bahkan sediaan yang menyebut dirinya elisitor jatuh ke dalamnya.

**Karena itu keduanya dipisah jadi dua jalur, bukan satu jalur dengan cabang.** Alasannya bukan kerapian: sisi pupuk bisa dirilis sekarang sementara sisi pengendali menunggu pendapat hukum — digabung, tidak ada yang bisa dirilis. Dan satu klaim pengendalian sudah cukup memindahkan sebuah sediaan dari sisi satu ke sisi lain: MOL bonggol pisang dan biakan PGPR sama-sama mengklaim merangsang pertumbuhan, tetapi PGPR juga mengklaim menekan penyakit, dan itu yang memindahkannya.

Sikap yang sudah diambil spesifikasi, dan yang layar harus ikuti: **nyatakan status hukumnya apa adanya, tandai `own_use_only`, jangan menyimpulkan aman.** Bacaan Pasal 77 ayat (1) — kumulatif atau alternatif — adalah pertanyaan hukum yang menunggu penasihat hukum sebelum Fase 4, bukan pertanyaan yang boleh dijawab perancang layar.

| Jalur | Rezim | Sediaan | Peredaran | Yang wajib ikut tampil |
|---|---|---|---|---|
| **5 · pupuk** — tanpa prasyarat | `fertilizer_like` — kompos, pupuk kandang, bokashi, kascing, MOL, POC | 6 | `limited_kabupaten_kota` | Tingkat bukti, kriteria pelepasan, tenggang panen bila berbahan kotoran mentah |
| **5 · pupuk** — tanpa prasyarat | `soil_amendment_like` — arang sekam | 1 | `limited_kabupaten_kota` | Sama seperti di atas |
| **6 · pengendali** — menunggu pendapat hukum | `pesticide_like` — Trichoderma, PGPR, mimba, formula Balingtan | 4 | `own_use_only` | Status hukum · PHI beserta dasarnya · APD |
| **6 · pengendali** — menunggu pendapat hukum | `unclear` + `pesticide_like` — Biosaka — tanpa kriteria pelepasan | 1 | `own_use_only` | Boleh dicatat, tidak boleh dianjurkan — tanpa dosis dan cara |

*Kedua belas sediaan, ditata menurut jalur yang menampungnya. Tingkat bukti B/C/D mengikuti tangga bukti yang sama dengan protokol.*

Kenapa keduanya juga jadi tujuan · **Jawaban untuk “tidak ada uangnya”**

Dua jalur bisa berakhir buntu karena harga, dan masing-masing bermuara ke sisi yang berbeda — bukan ke satu “lapis sediaan” yang sama.

**Jalur 3 → jalur 5.** Rupiah per kg hara di luar jangkauan; cabangnya kompos atau kascing. Jalur ini **terbuka sekarang**.

**Jalur 1 → jalur 6.** 246 produk yang tak satu pun terbeli; cabangnya ekstrak nabati atau agens hayati. Jalur ini **masih tertutup** sampai bacaan Pasal 77 ayat (1) dijawab — sampai itu ia boleh ditampilkan, tetapi tidak boleh muncul sebagai “yang bisa kamu pakai”.

Aturan yang menentukan sebuah resep masuk jalur mana · **Satu klaim pengendalian sudah cukup**

Pasal 75 menentukan pestisida dari kegunaan yang *diklaim*, jadi satu fungsi yang menyentuh pengendalian OPT menarik seluruh sediaan ke jalur 6 — walau fungsi lainnya murni menyuburkan. MOL bonggol pisang dan biakan PGPR sama-sama mengklaim merangsang pertumbuhan; yang memindahkan PGPR hanyalah klaim tambahan bahwa ia menekan penyakit.

Temuan yang jarang disadari · **Satu-satunya formulasi konkret yang boleh dianjurkan**

Aturan `L3` melarang langkah protokol menyebut produk komersial, sehingga protokol netral-vendor hanya bisa berkata “45 kg N per hektar” lalu berhenti. Sebuah `Preparation` bukan milik siapa pun — ia resep berlisensi terbuka. **Maka resep terbuka adalah satu-satunya formulasi konkret yang boleh disebut utuh oleh protokol netral.**

Yang tidak pernah boleh muncul · jalur 6 · **Dua bahan pada daftar larangan**

Daun tembakau dan akar tuba ada di antara 21 bahan baku, dan keduanya bertanda **tidak pernah boleh dianjurkan**. Keduanya lazim dipakai di lapangan, jadi menampilkannya sebagai “resep populer” akan aktif membahayakan — aturan `L19` menolaknya di tingkat data, dan layar harus menolaknya di tingkat tampilan.

---

## 5. Empat aturan yang berlaku di keenam jalur

Aturan 1 · **Fakta, bukan saran**

“126 produk mengandung bahan aktif yang sama” adalah fakta. “Beli yang termurah” adalah saran, dan saran memindahkan platform ke ranah tanggung jawab hukum. Untungnya faktanya sendiri sudah tajam: begitu orang tahu barangnya sama, kesimpulannya dia yang tarik.

Aturan 2 · **Beda status hukum harus jadi beda visual**

Pestisida terdaftar, pupuk, sediaan sendiri fertilizer-like, dan sediaan sendiri pesticide-like adalah empat kedudukan hukum yang berbeda. Menampilkannya dalam kartu yang identik bukan penyederhanaan — itu menyesatkan, dan pada sisi pestisida bisa membawa orang ke ancaman pidana.

Aturan 3 · **Informasi negatif didahulukan**

Bahan yang dilarang, produk yang tidak akan menolong, varietas yang tidak punya surat pelepasan, sediaan yang tidak boleh dianjurkan. Ini yang paling bernilai bagi petani dan justru paling kecil risiko hukumnya — dan tak satu pun bisa didapat dari penjual yang hidup dari margin.

Aturan 4 · **Rekaman sebagai efek samping, bukan syarat**

Tidak ada yang diminta mencatat. Tapi tiap pertanyaan adalah peristiwa bertanggal, berlokasi, dan berobjek. Seribu pertanyaan menghasilkan peta sebaran mingguan — **lapisan antisipatif yang tidak seorang pun perlu merencanakannya**, diproduksi dari perilaku reaktif orang lain.

---

## 6. Lubang data yang menentukan

Diurutkan menurut seberapa besar ia membatasi, bukan seberapa sulit ditutup.

| Yang hilang | Akibatnya | Jalan keluar |
|---|---|---|
| **Deskripsi gejala OPT** — 0 dari 685 OPT registri; seluruh yang terkurasi sudah ditulis | Jalur 1 hanya berpintu untuk komoditas yang sudah dikurasi; daftarnya di [14-tinjauan-gejala.md](14-tinjauan-gejala.md) | Kurasi · komoditas berikutnya, dan peninjauan penyuluh atas yang sudah ditulis |
| **PHI** — **nol** dari 23.058 penggunaan | Tanggal aman panen tidak bisa dijanjikan di jalur mana pun | Sumber lain · foto label atau terbitan BSIP |
| **Harga** — nol | Jalur 3 butuh satu masukan pengguna | Sumber lain · diketik sekali di kios |
| **Penanda subsidi** — 0 dari 7.196 pupuk | Perbandingan harga tidak sadar-subsidi, padahal dokumen fondasi mensyaratkannya | Sumber lain · daftar produk bersubsidi Kementan |
| **Golongan IRAC/FRAC** — 58 dari 1.106 bahan aktif | Nasihat rotasi hanya bisa setingkat bahan aktif, belum setingkat golongan | Kurasi · 200 bahan teratas |
| **Sifat agronomi varietas** — **nol** dari 11.227 | Rekomendasi varietas mustahil dan tidak boleh dijanjikan | Besar · kurasi berskala, bukan tarikan registri |
| **Sertifikasi lot benih & bibit** — **nol**; 44 penyebutan BPSB seluruhnya nama pemelihara | Jalur 4 hanya bisa memastikan varietasnya, bukan bungkus atau polybag yang di tangan | Sumber lain · label & sertifikat BPSB |
| **Kadar hara sediaan sendiri** — tidak ada sampai satu batch diuji | Jalur 5 tidak bisa masuk kalkulator jalur 3 dengan angka — `L18` menolaknya | Sumber lain · uji batch, atau tampilkan tanpa angka |
| **Berat jenis pupuk cair** — nol | 1.721 pupuk cair tidak sebanding dengan yang padat | Sumber lain |

*“Kurasi” berarti pekerjaan tangan yang terbatas dan bisa dijadwalkan. “Sumber lain” berarti data itu tidak akan pernah datang dari registri pendaftaran.*

---

## 7. Urutan yang ditempuh

Keenamnya sudah dibangun, dalam urutan ini — dan urutannya memang mengikuti seberapa
sedikit tiap jalur menunggu, bukan seberapa menarik.

1. **Jalur 2 — produk.** Tidak butuh kurasi sama sekali, bekerja di 7.724 pestisida,
   7.196 pupuk, dan 11.227 varietas sekaligus. Ia juga yang membuat temuan 63,5% bisa
   dipakai orang — angka itu naik dari 62,8% setelah 108 id zat yang terbelah ejaan
   disatukan, jadi 56 produk yang dulu tak terdeteksi kembar kini terlihat.
1. **Jalur 4 — keabsahan benih & bibit.** Datanya siap penuh, dan taruhannya paling
   tinggi per keputusan — terutama pada 2.725 varietas berbibit, yang kesalahannya baru
   ketahuan empat sampai tujuh tahun kemudian.
1. **Jalur 3 — hitungan hara.** Aritmetikanya lengkap; hanya perlu satu masukan harga.
   Menyentuh pos biaya terbesar petani.
1. **Jalur 5 — sediaan pupuk sendiri.** Tidak menunggu apa pun: tujuh resep di luar
   rezim pendaftaran lewat Pasal 72, dan sudah jadi cabang “tidak ada uangnya” pada
   kalkulator jalur 3.
1. **Jalur 1 — insiden.** Menunggu teks gejala, dan teksnya ditulis lebih dulu. Yang
   semula dikira “lima kalimat lagi” ternyata sepuluh entri: medan `definition` yang
   terisi memuat catatan epidemiologi, bukan gejala. Tiap entri kini membawa gejala
   beserta **dua ciri pembanding** yang bisa diperiksa sendiri — dan itu yang menahan
   jalur ini dari menebak.
1. **Jalur 6 — sediaan pengendali sendiri.** Terakhir, dan bukan karena datanya kurang.
   Ia dibangun sebagai **catatan status hukum, bukan anjuran**: pintunya membuka dengan
   Pasal 75, 76 ayat (2), 77 ayat (1), dan 123; ia tidak pernah jadi cabang “yang bisa
   kamu pakai” dari jalur 1; dan bacaan Pasal 77 ayat (1) tetap dinyatakan belum
   terjawab.

> **Yang masih menunggu, dan sifatnya bukan kode**
>
> **Pendapat hukum atas Pasal 77 ayat (1)** — rangkaian katanya bisa dibaca kumulatif
> maupun alternatif, dan bacaan itu menentukan apakah jalur 6 boleh naik dari catatan
> jadi anjuran. **Peninjauan penyuluh atau BPTP** atas sepuluh teks gejala, yang
> berstatus draft dan mengatakannya sendiri di layar. Sisanya lubang data yang sudah
> tercatat di `meta.tidakAda` pada indeks, sehingga penyaji tidak bisa menjanjikannya
> tanpa sadar.

> **Konsekuensi untuk dokumen STP**
>
> Lapisan ini sebagian membatalkan penalaran STP: petani gurem diberi skor 5 dari 19 karena mereka tidak mencatat. **Layanan baca-saja tidak menuntut pencatatan sama sekali** — jadi tidak ada masalah atribusi, tidak ada klaim mutu data, tidak ada data pribadi. Artinya lapisan rujukan bisa menjangkau petani *lebih dulu*, bukan di T1 atau T2, dan membangun kepercayaan sebelum meminta apa pun.

---
