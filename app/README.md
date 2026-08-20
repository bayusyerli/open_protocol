# app — permukaan baca-saja

Dua jalur, berkas statis, tanpa kerangka kerja, tanpa langkah bangun, tanpa server
aplikasi. Seluruh jawaban datang dari `spec/indeks/`.

| Halaman | Jalur | Rancangan |
|---|---|---|
| `index.html` | 2 — masuk dari kemasan: isi produk dan merek lain yang isinya sama | [`docs/05-jalur-produk.md`](../docs/05-jalur-produk.md) |
| `jalur-3.html` | 3 — kalkulator: rupiah per kilogram hara, bukan per karung | [`docs/06-jalur-hitungan-hara.md`](../docs/06-jalur-hitungan-hara.md) |
| `jalur-4.html` | 4 — benih & bibit: surat apa yang dipegang varietasnya | [`docs/07-jalur-keabsahan-benih-bibit.md`](../docs/07-jalur-keabsahan-benih-bibit.md) |
| `jalur-5.html` | 5 — meramu pupuk sendiri: resep terbuka beserta kedudukan hukumnya | [`docs/08-jalur-sediaan-pupuk.md`](../docs/08-jalur-sediaan-pupuk.md) |

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
| 2 · produk berlarangan | 4 | 151 KB | 47,4 KB |
| 2 · produk biasa | 3 | 108 KB | 47,8 KB |
| 3 · pupuk | 3 | 67 KB | 48,0 KB |
| 4 · varietas | 2 | 63 KB | 47,7 KB |
| 5 · resep | 2 | 11 KB | 7,9 KB |

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

### Khusus jalur 4

- **Bukan katalog agronomi.** Hanya 35 dari 11.227 varietas menyebut sifat agronomi
  apa pun, jadi halaman menolak menjawab "varietas mana yang sebaiknya ditanam" dan
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
