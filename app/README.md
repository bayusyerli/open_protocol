# app — permukaan baca-saja

Dua jalur, berkas statis, tanpa kerangka kerja, tanpa langkah bangun, tanpa server
aplikasi. Seluruh jawaban datang dari `spec/indeks/`.

| Halaman | Jalur | Rancangan |
|---|---|---|
| `jalur-1.html` | 1 — masuk dari gejala: dugaan penyebab, dua cara memastikan, bahan aktif yang terdaftar | [`docs/04-jalur-insiden.md`](../docs/04-jalur-insiden.md) |
| `index.html` | 2 — masuk dari kemasan: isi produk dan merek lain yang isinya sama | [`docs/05-jalur-produk.md`](../docs/05-jalur-produk.md) |
| `jalur-3.html` | 3 — kalkulator: rupiah per kilogram hara, bukan per karung | [`docs/06-jalur-hitungan-hara.md`](../docs/06-jalur-hitungan-hara.md) |
| `jalur-4.html` | 4 — benih & bibit: surat apa yang dipegang varietasnya | [`docs/07-jalur-keabsahan-benih-bibit.md`](../docs/07-jalur-keabsahan-benih-bibit.md) |
| `jalur-5.html` | 5 — meramu pupuk sendiri: resep terbuka beserta kedudukan hukumnya | [`docs/08-jalur-sediaan-pupuk.md`](../docs/08-jalur-sediaan-pupuk.md) |
| `jalur-6.html` | 6 — sediaan pengendali sendiri: **status hukum, bukan anjuran** | [`docs/09-jalur-sediaan-pengendali.md`](../docs/09-jalur-sediaan-pengendali.md) |
| `ukur.html` | — instrumentasi: apa yang tercatat di peranti ini, dan apa yang tidak | [`docs/11-instrumentasi.md`](../docs/11-instrumentasi.md) |

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

Buka `http://localhost:8742/app/`. Konfigurasi `open-protocols` di
`.claude/launch.json` sudah melakukan persis itu, dengan `autoPort` supaya tidak
bertabrakan dengan sesi lain yang memakai repositori sama.

## Yang menentukan bentuknya

Syarat lapangan: HP entry-level, sinyal buruk. Satu penelusuran utuh, terukur di
peramban:

| Jalur | Berkas | Sebelum gzip | Berkas terbesar |
|---|---|---|---|
| 1 · gejala → bahan | 4 | 108 KB | 38,8 KB |
| 2 · produk berlarangan | 4 | 151 KB | 47,4 KB |
| 2 · produk biasa | 3 | 108 KB | 47,8 KB |
| 3 · pupuk | 3 | 67 KB | 48,0 KB |
| 4 · varietas | 2 | 63 KB | 47,7 KB |
| 5 · resep | 2 | 11 KB | 7,9 KB |
| 6 · resep | 2 | 12 KB | 7,9 KB |

Tidak satu pun berkas melewati 48 KB. Itu bukan kebetulan: anggaran itu ditegakkan
`spec/tools/bangun-indeks.mjs` saat memecah indeksnya.

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

### Khusus jalur 1

- **Masuk lewat apa yang terlihat**, bukan nama hama. Yang panik tahu daunnya
  mengeriting ke atas; ia tidak tahu kata “trips”.
- **Mesin tidak menebak.** Tidak ada pengenal foto. Setiap dugaan dibuka dengan blok
  “pastikan dulu” berisi **dua ciri yang bisa diperiksa sendiri tanpa alat**, dan tiap
  ciri menyebut OPT mana yang terbantah kalau hasilnya begitu. Dua di antaranya uji
  yang benar-benar memutuskan — uji gelas untuk membedakan layu bakteri dari fusarium,
  dan kertas putih untuk membedakan trips dari virus kuning.
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
