# Tiga alternatif UX beranda Pranatani

> Prototipe tinjauan rancangan · 27 Agustus 2026 · status **usulan**
>
> Galeri & pembanding: [`index.html`](index.html) ·
> [Konsep 01](01-kanvas-keputusan.html) · [Konsep 02](02-atlas-pengetahuan.html) ·
> [Konsep 03](03-meja-banding.html)
>
> Tiga berkas HTML mandiri. Tanpa kerangka kerja, tanpa langkah bangun, tanpa
> permintaan ke internet, tanpa dependency baru, dan tanpa satu pun tulisan ke
> penyimpanan peramban.

---

## 1. Ringkasan kondisi UX saat ini

Diamati langsung pada **`app/index.html`** yang disajikan dari akar repositori
(`spec/indeks/` dibangun lebih dulu dengan `bangun-indeks.mjs`), pada lebar 360, 375,
dan 1440 px. **Diukur ulang 28 Agustus 2026 terhadap commit `4f7d9ca`** — pengamatan
pertama dilakukan di worktree yang tertinggal 32 komit, dan angkanya sudah bergeser.

> **Berkasnya berganti nama sejak pengamatan pertama, dan itu justru menguatkan satu
> temuan di bawah.** `app/beranda.html` kini `app/index.html`, dan keenam `jalur-N.html`
> sudah bernama sendiri: `tanaman.html`, `produk.html`, `harga-pupuk.html`,
> `varietas.html`, `pupuk-sendiri.html`, `pengendali-sendiri.html` — ditambah
> `principal.html` → `perusahaan.html` dan `ukur.html` → `peranti.html`. Nomornya
> **hilang dari nama berkas tetapi masih tercetak di beranda** sebagai `01`–`06`,
> beserta judul papan kedua yang masih berbunyi *"Bukan jalur, dan tidak dinomori"*.

**Model mental yang dipakai.** *Mesin pencari di atas registri, ditambah direktori
halaman.* Beranda mengandaikan pengguna sudah tahu **jenis benda** yang dicarinya dan
**namanya**. Kalimat bantuan di bawah kotak sendiri mengakui betapa besar andaian itu:
ia menyebut sebelas macam masukan yang sah dalam satu paragraf padat.

**Titik masuk.** Satu kotak pencarian universal + 11 keping contoh + 6 jalur bernomor +
7 alat & direktori = **25 pintu setara di satu layar**, sebelum menghitung tautan kepala
dan kaki. Tidak ada satu pun yang didahulukan atas yang lain.

**Kepadatan informasi.**

| | 375 px | 1440 px |
|---|---|---|
| Tinggi halaman | **3.335 px — 4,1 layar** | 1.864 px |
| Hero | 774 px | **780 px, ditengahkan dalam 1.440** |
| Enam jalur | 1.018 px | 1.120 px — 3 kolom × 367 px |
| Tujuh alat | 947 px | 1.120 px |

Di 1440 px, **yang paling penting justru yang paling sempit.** Kisi kartu memakai
lebarnya (1.120 px, tiga kolom), tetapi hero beserta kotak pencarian — elemen utama
halaman ini — tetap kolom **780 px yang ditengahkan** dalam viewport 1.440 px. Yang
melebar bagian sekunder; yang didahulukan tidak.

> Tinggi halaman turun dari 3.567 px (commit `77774f7`) ke 3.335 px, dan hero dari
> 1.005 px ke 774 px. Beranda memang sedang dipendekkan. Papan jalur (1.018 px) dan
> papan alat (947 px) belum tersentuh, dan berdua mereka **59% dari seluruh halaman**.

**Pola navigasi.** Hub-and-spoke. Beranda → **14 halaman daun** lewat navigasi kaki yang
disuntikkan `cangkang.js` dari satu daftar tunggal (14 tautan, 4 kelompok: *Enam pintu
masuk · Hitungan di lahan · Cari & rujukan · Peranti ini*). Tidak ada tautan silang
antar-daun, tidak ada jejak tugas, dan tidak ada jalan kembali ke perkara yang sedang
dikerjakan.

**Cara batas data ditampilkan.** Komponen `batas.js` sangat baik — tingkat bukti A–D
**beserta alasan kenapa bukan tingkat di atasnya**, tanggal tarikan, lisensi, dan daftar
`meta.tidakAda`. Tetapi di beranda ia hidup **di dalam `<dialog>`** di balik tombol
"Tentang data". Diperiksa langsung pada commit `4f7d9ca`:
`document.querySelector('main .batas-jawaban')` mengembalikan `null`, sementara
`dialog .batas-jawaban` ada. Di pintu depan, kejujuran yang paling mahal disusun berada
satu ketukan di luar layar.

> **Empat belas halaman lain sudah diperbaiki; beranda sengaja dikecualikan.** Commit
> `4f7d9ca` memindahkan ringkasan batas jawaban ke pucuk `<main>` di seluruh halaman
> lain, dengan alasan yang dinyatakannya sendiri: status draft dan lubang data baru
> terlihat sesudah ribuan piksel hasil. Beranda ditinggalkan karena bloknya "memang
> sudah tinggal di dalam lembar Tentang data" — dan itu persis yang membuatnya jadi
> satu-satunya permukaan yang masih menyembunyikannya. Lihat bagian 9.

**Di mana pengguna dipaksa memahami struktur internal produk.**

- Papan pertama bernomor **01–06**, papan kedua berjudul *"Bukan jalur, dan tidak
  dinomori"*. Pembedaan itu nyata dan penting — ia mengikuti tabel instrumentasi di
  `docs/11` — tetapi ia **keputusan internal repositori**, dan ia terbit apa adanya di
  pintu depan.
- *"Empat dari enam direktori layanan"* menuntut pembaca tahu apa keenamnya.
- Judul kartu ("Cek isi produk") dan penomorannya ("02") baru masuk akal bersama-sama
  kalau pembaca sudah tahu peta jalurnya — dan **nomor itu kini tidak menunjuk apa pun
  di luar layar ini**, karena berkasnya sudah bernama `produk.html`.

**Satu pengamatan yang menentukan ketiga konsep di bawah.** Mengetik `phonska`
mengeluarkan **17 kartu datar**. Lima di antaranya bernama persis "PHONSKA" dengan
kandungan yang berbeda-beda, dua di antaranya bertuliskan *"komposisi tidak tercatat di
registri"*. Layar menyerahkan seluruh pemilahan itu ke mata pengguna. Pertanyaan yang
sebenarnya ia bawa — *"yang mana yang ada di karung saya"* — tidak dijawab, dan tidak
dikatakan bahwa ia memang tidak bisa dijawab.

---

## 2. Tesis tiap konsep

| | Tesis satu kalimat |
|---|---|
| **01 · Kanvas Lapangan** | Orang tidak datang untuk menjelajahi registri; mereka datang membawa **satu perkara nyata** yang harus diputuskan sekarang — jadi layar pertama menanyakan keadaannya, bukan kata kuncinya. |
| **02 · Atlas Tani** | Nilai Pranatani ada pada **hubungan antar-benda**, bukan pada daftar halaman fungsi — jadi layar pertama adalah lema, dan tiap lema memperlihatkan seluruh arah keluarnya, **termasuk yang buntu**. |
| **03 · Meja Banding** | Pengguna profesional jarang butuh *satu* rekaman; mereka butuh **meja untuk menyandingkan beberapa** dan memeriksa dasar tiap angkanya — jadi layar pertama adalah baki kosong, dan satu rekaman sendirian **ditolak** ditampilkan. |

---

## 3. Pengguna dan skenario utama

### Konsep 01 · Kanvas Lapangan

- **Pengguna** — petani komersial hortikultura 0,5–2 ha (P4) dan buruh semprot; orang
  yang sedang berdiri di kebun atau di depan rak kios.
- **Keputusan yang didahulukan** — *apa yang harus saya lakukan terhadap keadaan yang ada
  di depan saya sekarang?*
- **Skenario interaktif utama** — "Ada yang tidak beres di tanaman" → Cabai → "Daun muda
  mengeriting" → **uji kertas putih** → tiga muara berbeda:
  - *Ada serangga 1–2 mm bergerak cepat* → **Trips**: 246 produk terdaftar, 60 bahan
    aktif, 159 pasangan bahan+kadar, 39 di antaranya memuat bahan berlarangan lingkup;
    kartu Abamektin 18 g/L terbuka berisi 13 dari 26 merek sungguhan.
  - *Tidak ada yang bergerak, daun menguning terang* → **Virus kuning keriting**:
    **nol produk terdaftar**, dan layar berhenti di situ.
  - *Belum bisa memastikan* → dua kandidat disandingkan, tanpa dipilihkan.
- **Tiga alur lain yang juga berfungsi** — "Sedang memegang produk" (PHONSKA, LARBAN,
  dan keadaan tidak-ketemu), "Akan menyemprot" (kalkulator tangki), "Membandingkan biaya
  pupuk" (rupiah per kg hara).

### Konsep 02 · Atlas Tani

- **Pengguna** — penyuluh ASN & PPPK (P2), penyuluh swadaya & ketua poktan (P3), agronom
  & QC eksportir (P7), peneliti dan dosen (P8).
- **Keputusan yang didahulukan** — *apa yang sebenarnya diketahui tentang hal ini, dan di
  mana pengetahuannya berhenti?*
- **Skenario interaktif utama** — penelusuran lima jenis objek berturut-turut:
  **Tanaman** (Cabai) → **Hama & penyakit** (Trips) → **Bahan aktif** (Abamektin 18 g/L)
  → **Produk** (DIMECTIN 18 EC) → **Perusahaan** (PT Deltagro Mulia Sejati), dengan jejak
  melintang yang bisa diketuk mundur di titik mana pun.
- **Tiga ujung buntu yang digarap** — Virus kuning keriting (0 produk, dan lema itu
  **menolak menawarkan yang terdekat**); Varietas (0 sifat agronomi dari 11.227 — surat
  yang dicatat, bukan tanaman); Perusahaan (0 alamat, 0 riwayat sanksi).

### Konsep 03 · Meja Banding

- **Pengguna** — petugas lapang offtaker & koperasi (P1, *beachhead*, skor 19), kios/KPL
  (P6), agronom QC (P7), peneliti (P8).
- **Keputusan yang didahulukan** — *dari beberapa yang tampak sama, apa persisnya yang
  berbeda — dan seberapa kuat dasar tiap perbedaannya?*
- **Skenario interaktif utama** — dua kumpulan:
  - **Pupuk "PHONSKA"** — delapan rekaman registri, lima bernama persis sama. Tambahkan
    2–4 ke baki; medan yang **berbeda** didahulukan; ketuk nilai mana pun untuk membuka
    berkas buktinya.
  - **Abamektin 18 g/L** — enam merek berlabel Trips pada Cabai. Bahan dan kadar
    identik; **dosis terdaftarnya berselisih tiga kali lipat**, dan satu di antaranya
    memakai satuan yang sama sekali tidak sebanding.

---

## 4. Bagaimana masing-masing berbeda dari UI aktif dan dari konsep lama

### Terhadap `app/index.html` yang berjalan (commit `4f7d9ca`)

| | 01 | 02 | 03 |
|---|---|---|---|
| Kotak pencarian di layar masuk | **dihapus** | diganti rak lapisan + indeks abjad | diganti baki + daftar calon |
| Jumlah pintu di layar pertama | 25 → **4** | 25 → 8 lapisan + 1 lema terbuka | 25 → 1 baki + daftar calon |
| Unit isi | halaman fungsi → **layar keputusan** | halaman fungsi → **lema + jari-jari** | halaman fungsi → **medan pada baris** |
| Batas jawaban | di dalam `<dialog>` → **blok tetap di badan tiap layar hasil** | → **jari-jari putus di peta + blok per lema** | → **per nilai, di panel bukti + pita permanen** |
| Nol / lubang data | daftar hasil kosong → **layar penuh berbingkai ganda** | → **jari-jari putus-putus berkotak** | → **sel ⊘ + kartu "kosong ≠ nol"** |
| Istilah internal ("01–06", "bukan jalur") | tampil di beranda → **tidak dipakai sama sekali** | **tidak dipakai sama sekali** | **tidak dipakai sama sekali** |
| Desktop | hero 780 px ditengahkan dalam 1.440 → rangka instrumen berlebar terbatas | → **3 kolom** 232 / 846 / 320 | → **3 panel** 280 / 828 / 330 |

### Terhadap ketiga konsep lama di `docs/konsep-ui/`

Ketiga konsep lama dipakai **hanya sebagai peta wilayah yang sudah dijelajahi**. Tidak
ada yang didaur ulang:

- **"Kotak Tanya" tidak diulang.** Tidak satu pun dari ketiga konsep baru berpusat pada
  satu kotak pencarian. Konsep 01 tidak punya kotak sama sekali; Konsep 02 mulai dari
  lema dan rak lapisan; Konsep 03 mulai dari baki kosong.
- **"Cek Kandungan" tidak dijadikan tesis.** Pemeriksaan kandungan muncul di Konsep 03,
  tetapi bukan sebagai tesis — di sana ia satu kumpulan di antara dua, dan tesisnya
  *pembandingan beserta buktinya*, bukan *pemeriksaan kandungan*.
- **"Petak dan Musim" tidak dijadikan tesis.** Tidak ada garis waktu musim di ketiganya,
  dan tidak ada yang menuntut akun.
- **Bukan susunan ulang beranda sekarang, bukan dasbor kartu, bukan chatbot, dan tidak
  ada klaim "AI".**

Yang **diwarisi dengan sengaja** hanya dua hal, karena keduanya sikap dan bukan bentuk:
tiap layar menyebut tingkat bukti–tanggal–sumber–apa-yang-tidak-diketahui, dan keadaan
dibedakan lewat **bentuk**, bukan warna saja.

---

## 5. Asumsi produk

Asumsi yang berlaku untuk ketiganya:

1. Permukaan baca-saja tetap **gratis dan tanpa akun**.
2. Seluruh pencarian dan pengolahan tetap berjalan **di peramban**, di atas indeks
   turunan; tidak ada server aplikasi dan tidak ada basis data.
3. Sasarannya tetap **HP entry-level bersinyal buruk**, dan anggaran indeks yang sudah
   berlaku (2–4 berkas per penelusuran, tidak satu pun melewati 48 KB) **dihormati sebagai
   batasan rancangan**.
4. Tidak ada anjuran agronomi, hukum, atau mutu. Larangan ditampilkan beserta lingkup dan
   pasalnya, lalu berhenti.
5. Netralitas ditegakkan mesin: urutan apa pun memakai cacah, abjad, atau nomor
   pendaftaran menaik — tidak pernah peringkat mutu, tidak ada slot berbayar.

Asumsi khas per konsep:

| | Asumsi yang harus benar supaya konsep ini bekerja |
|---|---|
| **01** | Orang mau menjawab 2–3 pertanyaan sebelum melihat apa pun · uji lapangan (kertas putih, uji gelas) benar-benar dilakukan, bukan cuma dibaca · "tidak ada yang bisa ditawarkan" diterima sebagai jawaban, bukan sebagai aplikasi rusak |
| **02** | Ada segmen yang benar-benar *menjelajah*, bukan mencari lalu keluar · pengguna sudah punya kosakata untuk mulai · jari-jari putus terbaca sebagai kejujuran, bukan sebagai produk yang belum jadi |
| **03** | Orang benar-benar **membandingkan**, bukan memeriksa satu barang lalu selesai · "perbedaan didahulukan" terbaca sebagai bantuan, bukan sebagai penyembunyian · berkas bukti per sel benar-benar dibuka |

---

## 6. Risiko dan pertanyaan riset

### Risiko per konsep

**01 · Kanvas Lapangan**

- **Kedalamannya tipis, dan itu risiko terbesarnya.** Pintu gejala hanya terbuka untuk
  cabai — 10 OPT terkurasi dari 1.360 OPT registri. Pengguna komoditas lain menabrak
  dinding di langkah pertama. Layar `tanamanLain` menggarap keadaan itu secara jujur,
  tetapi ia tetap dinding.
- **Bentuk "pertanyaan lalu jawaban" adalah bentuk diagnosis.** Tiap layar
  menyangkalnya, tetapi penyangkalan berupa teks melawan bentuk yang berupa struktur —
  dan struktur biasanya menang. Ini risiko salah tafsir tertinggi dari ketiganya, dan
  **tidak bisa sepenuhnya dilawan dengan rancangan.**
- Salah pilih di langkah 2 memaksa mundur; orang cenderung menyerah alih-alih mundur.

**02 · Atlas Tani**

- **Tidak menutup keputusan apa pun.** Ia membuat orang lebih tahu, bukan lebih selesai
  — dan itu paling sulit dibuktikan berguna lewat metrik.
- Menuntut kosakata di muka. Yang cuma tahu "bule" tidak punya pintu masuk.
- Paling berat isinya per layar; lema panjang dan tabel di jaringan buruk.

**03 · Meja Banding**

- **Perbandingan mudah dibaca sebagai peringkat**, walaupun urutan kolom adalah urutan
  penambahan. Dilawan dengan tiga hal: urutan mengikuti penambahan, pita *"terdaftar ≠
  terjamin"* permanen di kepala, dan tiap sel bisa dibuka sampai sumbernya.
- Menuntut pengguna **sudah punya kandidat**. Tidak berguna bagi yang belum.
- Di ponsel, matriks jadi tumpukan medan yang panjang.

### Pertanyaan riset yang belum terjawab

Tiga di antaranya adalah pertanyaan terbuka yang sudah tercatat di
[`docs/17-tiga-konsep-ui.md`](../../docs/17-tiga-konsep-ui.md) bagian 10, dan prototipe
ini **tidak menjawabnya** — ia hanya membuatnya bisa ditanyakan sambil menunjuk layar.

1. **Apakah orang yang membaca kandungan benar-benar membandingkannya dengan sesuatu?**
   Ini taruhan utama Konsep 03, dan menurut dokumen lama ia **tidak bisa dijawab lewat
   wawancara** — hanya lewat pengamatan langsung di kios.
2. **Apakah "tidak ada yang bisa ditawarkan" diterima sebagai jawaban?** Taruhan utama
   Konsep 01, dan taruhan seluruh sikap proyek ini terhadap lubang data.
3. **Apakah ada segmen yang benar-benar menjelajah?** Taruhan utama Konsep 02.
4. **Berapa kali dalam semusim seseorang menghitung ongkos?** (Q3, belum dijawab) —
   menentukan apakah alur biaya Konsep 01 punya momen.
5. **Apakah petugas lapang offtaker ada dalam jumlah berarti di sentra cabai?** Seluruh
   Konsep 03 berdiri di atas segmen yang ukurannya masih kosong.
6. Dan yang paling mendasar: **tidak satu pun konsep bisa menunjukkan bahwa jawabannya
   mengubah keputusan.** Itu menuntut baseline, dan baseline hanya datang dari lapangan.

---

## 7. Batas antara data nyata dan data demonstrasi

**Tidak ada nomor pendaftaran, nama merek, nama OPT, komposisi, dosis, tanggal, atau
angka cacah yang dikarang.** Seluruhnya disalin dari indeks turunan repositori
(`spec/indeks/`, dibangun 27 Agustus 2026 dari tarikan registri 19–23 Agustus 2026).

### Nyata, disalin apa adanya

| Isi | Asal |
|---|---|
| 10 OPT cabai terkurasi beserta teks gejala dan ciri pembandingnya | `spec/indeks/gejala.json` |
| 246 produk / 60 zat / 159 kartu / 39 berlarangan untuk Trips pada Cabai | `opt/opcmd00001003/oppst00000001.json` |
| 13 merek Abamektin 18 g/L beserta nomor pendaftaran, tanggal berlaku, dan dosis terdaftarnya | `…-merek-00.json` |
| 8 rekaman bernama PHONSKA beserta komposisi, nomor, bentuk, dan tanggal berlakunya | `spec/indeks/produk/` |
| LARBAN 500/50 EC, isinya, kelompok setaranya (30), dan larangan lingkup klorpirifos | `produk/000.json` + `larangan.json` |
| Kode golongan IRAC (6, 4A, 3A, 1B) | `spec/vocab/golongan-resistensi/` — IRAC MoA v11.5, Februari 2026 |
| Harga eceran empat varian cabai per 21 Agustus 2026 | `spec/indeks/harga.json` |
| Seluruh cacah agregat (7.724 · 7.196 · 11.227 · 3.136 · 1.106 · 738 · 234 · 5.844 · 889) | `spec/indeks/meta.json` → `jumlah` |
| Seluruh teks tingkat bukti, alasan, tanggal, dan lisensi | `meta.batas.sumber` |
| Seluruh pernyataan lubang data | `meta.tidakAda` |
| Angka lapangan (667 dari 7.196 pupuk tanpa nomor; 0 dari 23.058 tenggang panen; 0 dari 11.227 sifat agronomi; 1.036 dari 14.920 bergambar; 576 varietas pemulia perorangan; 2.438 penggunaan tanpa pintu OPT) | `meta` + `docs/` |

### Disederhanakan untuk prototipe — dan diberi tanda sendiri di layar

Tiap penyederhanaan membawa label **"contoh prototipe"** di tempatnya:

- **Konsep 01** — hanya kelompok bahan teratas (Abamektin 18 g/L) yang dibuka lengkap;
  enam kelompok lainnya menampilkan cacahnya saja. Daftar mereknya 13 dari 26.
- **Konsep 02** — delapan lema disusun, cukup untuk satu penelusuran utuh lima jenis
  objek. Lapisan lain ada di indeks sungguhan tetapi lemanya belum disusun; layar
  "lapisan ini belum punya lema" mengatakannya. Gambar kemasan **tidak** ditampilkan —
  manifesnya menyatakan `redistributable: false` dengan izin yang belum diminta.
- **Konsep 03** — 8 rekaman pupuk dan 6 rekaman pestisida di daftar calon, bukan seluruh
  registri.

### Angka yang datang dari pengguna, bukan dari data

Kalkulator tangki dan perbandingan rupiah-per-kg-hara di Konsep 01 **seluruhnya
aritmetika di atas masukan pengguna**. Registri tidak memuat harga sama sekali, dan
layarnya mengatakan itu.

### Yang sengaja tidak dilakukan

- Tidak ada testimoni, tidak ada metrik pemakaian, tidak ada kemampuan produk yang
  dibuat-buat.
- Tidak ada foto stok pertanian, tidak ada emoji sebagai sistem ikon, tidak ada
  glassmorphism, tidak ada gradient berlebihan, tidak ada ilustrasi futuristik.
- Tidak ada satu pun layar yang menawarkan "yang terdekat" ketika yang dicari tidak ada.

---

## 8. Hasil QA

Diuji di peramban dalam-aplikasi terhadap berkas yang disajikan
(`python3 -m http.server` dari akar repositori — konfigurasi `open-protocols` yang sudah
ada di `.claude/launch.json`). **Tidak ada dependency yang dipasang.**

### Lebar yang diperiksa

**360 × 800 · 390 × 844 · 768 × 1024 · 1440 × 900** — keempatnya untuk keempat berkas.

### Ringkasan

| Pemeriksaan | Hasil |
|---|---|
| Luber mendatar (`scrollWidth` vs `clientWidth`) | **Lolos** — 360/360, 390/390, 768/768, 1440/1440 di keempat berkas. Elemen lebar (tabel merek, matriks pembanding) menggulir di dalam wadah `overflow-x:auto` sendiri. |
| Sasaran sentuh ≥ 44 × 44 px | **Lolos** untuk seluruh kendali. Pengecualian yang disengaja dan tercatat: tautan lema **di dalam kalimat** pada Konsep 02 (WCAG 2.5.8 mengecualikan sasaran di dalam blok teks; menebalkannya merusak jarak antar-baris paragraf). Tautan lema di dalam **sel tabel** dinaikkan ke 44 px, dan satu-satunya jalan keluar dari layar lapisan kosong dijadikan kendali penuh. |
| Struktur judul | **Lolos** — tepat satu `<h1>` per layar, tanpa lompatan tingkat, di seluruh layar dan seluruh lema yang diuji. |
| Navigasi papan ketik | **Lolos** — Tab menyusuri seluruh kendali; urutan fokus mengikuti urutan baca. |
| Indikator fokus | **Lolos** — `:focus-visible` menghasilkan `3px solid` yang terukur di peramban, diverifikasi lewat penekanan Tab sungguhan (bukan `.focus()` programatik). |
| Laci/panel bisa ditutup | **Lolos** — laci Konsep 02 dan 03 tertutup dengan **Escape** dan mengembalikan `aria-expanded="false"`; Escape di Konsep 03 juga melepaskan sel bukti yang terpilih. |
| Tombol bekerja | **Lolos** — seluruh alur diuji, lihat rincian di bawah. |
| Teks terpotong | **Lolos** — tidak ada elemen dengan `overflow` tersembunyi yang `scrollWidth`-nya melebihi `clientWidth`. |
| Keadaan aktif tanpa mengandalkan warna | **Lolos** — Konsep 01 membedakan keempat keadaan hasil lewat **bentuk bingkai** (padat / bergaris miring / bingkai ganda / tebal) beserta lencana bertulisan; Konsep 02 menggambar jari-jari buntu **putus-putus dan berkotak** dengan lambang ⊘, dan huruf indeks tanpa lema berbingkai **putus-putus**; Konsep 03 menandai baris berbeda dengan **▲ + garis kiri tebal**, baris sama dengan **=**, dan sel kosong dengan **⊘**. |
| Kontras dasar | **Lolos di kedua tema.** Diukur terhadap latar efektif tiap elemen. Terendah setelah perbaikan: 4,9 : 1 (galeri, tema terang) dan 4,5 : 1 (Konsep 03, teks kecil tema terang) terhadap ambang 4,5 : 1 untuk teks biasa dan 3 : 1 untuk teks besar. |
| Galat JavaScript | **Nihil** — `window.onerror` kosong di seluruh berkas dan seluruh alur; konsol tanpa galat. |
| Permintaan jaringan luar | **Nihil.** Diperiksa lewat pemantau jaringan: tiap prototipe hanya memuat dirinya sendiri; galeri memuat dirinya sendiri + `../../app/ikon.svg` + iframe pratinjau. Seluruhnya localhost. Pemeriksaan sumber juga bersih: nol kemunculan `http://`, `https://`, `fetch(`, `XMLHttpRequest`, `WebSocket`, `@import`. |
| Penyimpanan peramban | **Tidak disentuh** — nol kemunculan `localStorage`, `sessionStorage`, `indexedDB`, `document.cookie` sebagai kode di keempat berkas. Tombol tema hanya menulis atribut `data-tema` di memori dan hilang saat halaman dimuat ulang. |
| Tautan relatif & logo | **Lolos** — `../../app/ikon.svg` termuat (200 OK, `naturalWidth > 0`); ketiga tautan "Buka Konsep" benar; ketiga iframe pratinjau memuat prototipe yang sesuai (judul dokumen di dalamnya diverifikasi). |
| `prefers-reduced-motion` | **Ada di keempat berkas.** |
| `prefers-color-scheme` + `[data-tema]` | **Ada di keempat berkas**, ditulis dua kali seperti aturan repo — sekali untuk "ikut sistem", sekali untuk pilihan eksplisit. |

### Alur yang benar-benar dijalankan

**Konsep 01** — sepuluh alur: `trips` · `virus` (nol produk) · `ragu` · `layu → bakteri` ·
`tanamanLain` (penolakan cakupan) · `phonska` · `larban` · `takCocok` · `semprot` ·
`biaya`. Rel langkah, tombol "Kembali satu langkah", dan "Mulai perkara baru" diuji.
Aritmetika diverifikasi: 16 L × 1,5 ml/l = **24 ml** (≈ 2 tutup botol); PHONSKA 15-8-10
seharga Rp 250.000 per karung 50 kg = **Rp 15.152 / kg hara**, 15-15-10 seharga
Rp 265.000 = **Rp 13.250**, 10-10-10 seharga Rp 280.000 = **Rp 18.667**.

**Konsep 02** — penelusuran lima objek Cabai → Trips → Abamektin → DIMECTIN → Deltagro
dengan jejak utuh; ujung buntu `virus` (2 jari-jari nol, keduanya nonaktif),
`varietasCabai`, `cabaiHarga`; alih Peta ↔ Daftar; ganti lapisan lewat rak; layar
"lapisan belum punya lema"; laci + Escape.

**Konsep 03** — tambah sampai baki penuh (4/4, sisanya nonaktif otomatis); keluarkan;
kosongkan; keadaan baki 0 dan 1 rekaman (**menolak menampilkan satu rekaman sendirian**);
ganti kumpulan pupuk ↔ pestisida; ketiga saringan (berbeda / semua / kosong, termasuk
keadaan "tidak ada medan yang cocok"); buka berkas bukti per sel; ketiga keadaan data —
**tersedia** (komposisi + tingkat B), **meragukan** (2 rekaman lewat tanggal berlaku per
27 Agustus 2026; 1 tanpa nomor pendaftaran; 1 bersatuan dosis yang tidak sebanding; kode
IRAC bertingkat D di baris yang kolom lainnya bertingkat B), dan **tidak bisa dijawab**
(⊘ *"kosong berarti registri tidak mencatatnya, bukan bahwa nilainya nol"*).

**Galeri** — alih Sketsa ↔ Pratinjau hidup pada ketiga kartu; papan skor terhitung
(24 / 25 / 31 dari 40); tabel banding; ketiga tautan "Buka Konsep".

### Cacat yang ditemukan dan diperbaiki selama QA

1. **Luber mendatar di Konsep 01** — butir grid berbawaan `min-width:auto` melebarkan
   kolomnya mengikuti tabel merek, sehingga halaman ikut menggulir mendatar walaupun
   tabelnya sudah dibungkus `overflow-x:auto`. Diperbaiki dengan `minmax(0,1fr)` dan
   `min-width:0` pada butir yang bersangkutan.
2. **Struktur judul terbalik di Konsep 02 dan 03** — `<h2>` panel samping mendahului
   `<h1>` isi utama. Diperbaiki dengan memindahkan `<main>` ke depan di DOM dan
   mengembalikan urutan tampilnya lewat `order` / penempatan kolom eksplisit; urutan Tab
   sekarang isi-dulu.
3. **Judul layar hasil Konsep 01 mulai dari `<h3>` tanpa `<h1>`** — merek dijadikan
   `<h1>` cangkang dan kepala pita dijadikan `<h2>`.
4. **Kepala meluber di 360–390 px pada Konsep 02 dan 03** — kepala dibuat boleh
   membungkus.
5. **Sel terpilih tidak terbaca di Konsep 03** — aturan `[data-awas]` menimpa warna teks
   keadaan terpilih, menghasilkan teks karat di atas latar biru pada **1,02 : 1**.
   Diperbaiki dengan menuliskan keadaan terpilih paling akhir dan menyebut kedua keadaan
   lain secara eksplisit.
6. **Kontras di bawah ambang** — huruf indeks tanpa lema (2,53 : 1) dan pemisah jejak
   pada Konsep 02; teks kecil tema terang pada Konsep 03 (4,4 : 1). Ketiganya dinaikkan;
   huruf indeks juga diberi pembeda bentuk (bingkai putus-putus).
7. **Sasaran sentuh 30 × 30 px** pada indeks abjad Konsep 02 dan **37 px** pada sel
   berurutan Konsep 03 — dinaikkan ke 44 px.
8. **Laci menutup sendiri saat `resize`** — bilah alamat ponsel yang muncul-hilang
   memicu `resize` dan menutup laci di tengah pemakaian. Dipindahkan ke pendengar
   `matchMedia('change')`, dan layar lebar dibuat kebal terhadap keadaan JS lewat
   `.rak[hidden] { display:block }` — sebelumnya `hidden` yang tertinggal di layar lebar
   menyembunyikan panel **tanpa jalan mengembalikannya**, karena tombol lacinya tidak ada
   di sana.
9. **Berkas Konsep 03 terbaca sebagai biner** — satu bita NUL masuk ke sebuah penanda
   sentinel di JavaScript, sehingga `file(1)`, `grep`, dan diff memperlakukan berkasnya
   sebagai data. Diganti penanda ASCII yang terbaca; ketiga berkas kini
   `HTML document text, UTF-8`.

### Yang belum bisa diamati, dan alasannya

- **Tangkapan layar QA tidak dihasilkan sebagai berkas.** Peramban dalam-aplikasi
  mengembalikan gambar ke sesi tetapi tidak bisa menulisnya ke disk, dan satu-satunya
  jalan lain adalah memasang Playwright — yang dilarang. Direktori `screenshots/` karena
  itu **tidak dibuat**, alih-alih dibuat kosong dan tampak seperti sudah diisi. Seluruh
  pemeriksaan di atas dilakukan lewat pengukuran DOM dan CSS terhitung, yang lebih tepat
  daripada mata untuk luber, sasaran sentuh, dan kontras — tetapi **tidak menggantikan
  penilaian mata terhadap rupa**.
- **Penangkapan gambar di peramban dalam-aplikasi tidak stabil pada lebar besar**
  (sebagian bingkai kembali kosong atau separuh tercat). Karena itu tata letak desktop
  diverifikasi lewat **pengukuran kotak batas**, bukan lewat gambar: Konsep 02 terukur
  232 / 846 / 320 px dalam wadah 1400 px, Konsep 03 terukur 280 / 828 / 330 px.
- **Hanya satu mesin peramban yang diuji** (peramban dalam-aplikasi berbasis Chromium).
  Belum diuji di Firefox, Safari, atau WebView Android — dan `100dvh`, `:focus-visible`,
  serta `display:grid` dengan `order` adalah tiga tempat yang paling mungkin berbeda.
- **Belum diuji dengan pembaca layar sungguhan** (VoiceOver / TalkBack). Yang diperiksa
  baru strukturnya — tingkat judul, `aria-pressed`, `aria-expanded`, `aria-current`,
  `aria-live`, dan teks khusus pembaca — bukan bagaimana bunyinya.
- **Belum diuji di perangkat sungguhan pada jaringan sungguhan.** Ukuran berkasnya
  sendiri sudah bisa disebut: 68 KB / 55 KB / 49 KB / 53 KB sebelum gzip, satu berkas per
  prototipe, tanpa permintaan lanjutan — di bawah anggaran satu penelusuran penuh
  aplikasi yang berjalan sekarang (30–135 KB dalam 2–5 berkas), tetapi itu **perbandingan
  ukuran, bukan pengukuran waktu muat**.
- **Belum ada pengujian ke pengguna sama sekali.** Seluruh bagian 6 masih terbuka.

---

## 9. Rekomendasi arah eksperimen berikutnya

**Uji Konsep 03 · Meja Banding lebih dahulu.** Alasannya bukan bahwa ia paling menarik,
melainkan bahwa ia satu-satunya yang bisa dibangun penuh dengan data yang **sudah ada
hari ini**, sehingga hasil ujinya akan bersih — sukses atau gagal, sebabnya akan jelas.

Papan skor delapan sumbu di [`index.html`](index.html) memberi **24 / 25 / 31 dari 40**.
Yang memutuskan:

- **Kebutuhan data.** Konsep 01 berdiri di atas 10 OPT cabai terkurasi *berstatus draft
  dengan tingkat bukti belum ditetapkan*. Mengujinya sekarang berarti menguji rancangan
  dan kurasi sekaligus — dan kalau hasilnya buruk, keduanya tidak akan bisa dibedakan.
- **Kedekatan ke segmen beachhead.** P1 (petugas lapang offtaker, skor 19) adalah
  satu-satunya segmen yang pekerjaannya *sudah* berupa pencatatan dan pembandingan.
- **Kejelasan keputusan yang ditutup.** Konsep 03 menghasilkan sesuatu yang bisa dibawa
  keluar layar. Konsep 02 membuat orang lebih tahu tanpa menutup keputusan apa pun.
- **Risiko salah tafsir yang bisa ditanggung.** Risiko Konsep 03 (dibaca sebagai
  peringkat) bisa dilawan rancangan; risiko Konsep 01 (dibaca sebagai diagnosis) tidak.
- **Ongkos bangun.** Konsep 03 tidak menuntut kurasi baru, sumber baru, atau akun.

### Urutan yang diusulkan

1. **Uji Konsep 03 ke 5–8 petugas lapang dan kios.** Pertanyaan tunggalnya: apakah mereka
   benar-benar membandingkan, atau memeriksa satu barang lalu selesai. Ini pertanyaan
   terbuka nomor 4 di `docs/17` bagian 10, dan ia **hanya bisa dijawab lewat pengamatan
   langsung di kios**, bukan lewat wawancara.
2. **Pinjam mekanika Konsep 02 ke dalam layar rincian yang sudah ada.** Panel "hubungan
   dari lema ini" beserta jari-jari buntunya bisa dipasang sebagai satu komponen di layar
   produk dan OPT yang sudah berjalan, tanpa merombak beranda. Ia menguji gagasan paling
   berharga Konsep 02 — *lubang data yang punya bentuk* — dengan ongkos satu komponen.
3. **Tahan Konsep 01 sampai kurasi gejala punya peninjau bernama.** Konsep ini yang paling
   berpotensi mengubah keputusan lapangan, dan justru karena itu paling berbahaya diuji di
   atas data draft. Yang menghalanginya bukan rancangan, melainkan **nol dari 4.256
   rekaman kosakata kurasi yang punya peninjau bernama**.
4. **Jangan gabungkan ketiganya jadi satu beranda.** Ketiganya mendahulukan keputusan yang
   berbeda, dan beranda yang mendahulukan tiga hal sekaligus tidak mendahulukan apa pun.
   Kalau harus berdampingan, biarkan berdampingan sebagai **permukaan yang berbeda**.

### Satu perbaikan yang layak diambil terlepas dari konsep mana yang menang

Beranda yang berjalan sekarang (`app/index.html`) menaruh blok batas jawaban **di dalam
`<dialog>`** — satu-satunya permukaan yang masih begitu, sesudah commit `4f7d9ca`
memindahkannya ke pucuk `<main>` di empat belas halaman lain. Menyelesaikan pengecualian
itu adalah perubahan kecil yang tidak menuntut konsep baru, tidak menuntut data baru, dan
bisa dikerjakan hari ini — dan ia satu-satunya hal yang ketiga konsep di atas sepakati
tanpa kecuali.

---

## 10. Berkas yang dibuat

Seluruhnya baru, seluruhnya di dalam folder ini. **Tidak ada berkas existing yang
disunting.**

| Berkas | Isi | Ukuran |
|---|---|---|
| [`index.html`](index.html) | Galeri & alat pembanding: pratinjau, tesis, pengguna, keputusan, model navigasi, kekuatan, risiko, asumsi, bedanya dari UI aktif, tabel banding sembilan dimensi, papan skor delapan sumbu, dan rekomendasi | 53 KB |
| [`01-kanvas-keputusan.html`](01-kanvas-keputusan.html) | Konsep 01 · Kanvas Lapangan | 68 KB |
| [`02-atlas-pengetahuan.html`](02-atlas-pengetahuan.html) | Konsep 02 · Atlas Tani | 55 KB |
| [`03-meja-banding.html`](03-meja-banding.html) | Konsep 03 · Meja Banding | 49 KB |
| `README.md` | Berkas ini | — |

`screenshots/` **tidak dibuat** — lihat bagian 8, "Yang belum bisa diamati".

### Menjalankannya

Ketiga prototipe berkas mandiri dan bisa dibuka langsung lewat `file://`. Yang menuntut
server hanya dua hal di `index.html`: logo yang dirujuk lewat jalur relatif, dan iframe
"Pratinjau hidup" — sebagian peramban menolak menyematkan berkas lokal, dan galeri
mengatakan itu sendiri kalau terjadi. Sajikan dari akar repositori:

```bash
python3 -m http.server 8742
```

Lalu buka `http://localhost:8742/prototypes/ux-3-alternatif/`.

### Catatan tentang logo

Galeri merujuk `../../app/ikon.svg` lewat jalur relatif — sekaligus menguji bahwa jalur
itu benar. Ketiga prototipe **menyalin markah yang sama sebaris ke dalam berkasnya**,
supaya masing-masing tetap utuh kalau dibuka lewat `file://` atau dipindahkan. Isinya
disalin dari `app/ikon.svg` per 27 Agustus 2026: bujur sangkar `#00442f` bersudut tumpul
dengan monogram **P** `#fffef8`, tiga garis `#54c7a6`, dan satu daun `#79d20a`.

> **Salinan sebaris itu punya ongkosnya sendiri, dan ini tempat mencatatnya.** Markah di
> `app/ikon.svg` berganti pada cabang `tema-satu-ikon` — dari tangkai-dan-daun menjadi
> monogram P — dan ketiga prototipe sempat membawa markah lama sementara galeri sudah
> membawa yang baru. Sudah diselaraskan. Kalau markahnya berganti lagi, **empat tempat**
> harus ikut berubah: `app/ikon.svg` beserta ketiga prototipe ini. Galeri tidak, karena
> ia merujuk, bukan menyalin.
