# Lima alternatif UX beranda Pranatani

> Prototipe tinjauan rancangan · 27 Agustus 2026 · status **usulan**
>
> Galeri & pembanding: [`index.html`](index.html) ·
> [Konsep 01](01-kanvas-keputusan.html) · [Konsep 02](02-atlas-pengetahuan.html) ·
> [Konsep 03](03-meja-banding.html) · [Konsep 04](04-satu-pintu-dua-kata-kerja.html) ·
> [Konsep 05](05-golongan-bukan-merek.html)
>
> Lima berkas HTML mandiri. Tanpa kerangka kerja, tanpa langkah bangun, tanpa
> permintaan ke internet, tanpa dependency baru, dan tanpa satu pun tulisan ke
> penyimpanan peramban.
>
> **Konsep 04 ditambahkan 28 Agustus 2026** sebagai *usulan tandingan* — ia menolak
> premis yang dipegang ketiganya, bukan bersaing di dalamnya. Asal-usulnya di bagian 11.
>
> **Konsep 05 ditambahkan 28 Agustus 2026** — berfokus OPT, dan satu-satunya yang unit
> navigasinya bukan merek maupun rekaman melainkan *golongan cara kerja*. Bagian 12.
>
> Foldernya ikut berganti nama, `ux-3-alternatif` → `ux-alternatif`: angka di nama folder
> berhenti benar begitu isinya bertambah, dan akan salah lagi pada konsep berikutnya.
> **Pesan komit pertama (`be260bf`) masih menyebut jalur yang lama** — itu memang begitu
> apa adanya, karena pesan komit tidak ditulis ulang.

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
| **04 · Satu Pintu, Dua Kata Kerja** | Pintu depan **tidak diganti sama sekali**; kedua kapabilitas datang ke tempat pertanyaannya sudah muncul — *bandingkan* tumbuh dari daftar hasil, *hubungan* tumbuh dari satu rekaman — dan **tidak ada layar yang menanyakan siapa penggunanya**. |
| **05 · Golongan, Bukan Merek** | Masuk dari **hama**, bukan dari produk: registri disusun menurut **golongan cara kerja**, sehingga 661 merek gulma sawit runtuh jadi 10 golongan — lalu layarnya **berhenti tepat sebelum menganjurkan rotasi**, karena aturannya memang belum diambil siapa pun. |

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

### Konsep 04 · Satu Pintu, Dua Kata Kerja

- **Pengguna** — tidak dipilih lebih dulu, dan itu justru tesisnya. Tidak ada layar yang
  meminta siapa pun mengaku sebagai petani, penyuluh, atau kios.
- **Keputusan yang didahulukan** — bukan *"pintu depannya harus apa"*, melainkan
  *"bagaimana membeli bukti untuk menjawabnya?"*
- **Skenario interaktif utama** — ketik `phonska` → **17 kartu datar yang persis sama
  dengan yang keluar hari ini** → kotak pilih di kiri tiap baris → pilih 2–4 →
  **panel banding tumbuh di tempat**, tanpa berpindah halaman. Lalu ketuk nama rekaman
  mana pun → **panel hubungan tumbuh**, dengan jari-jari buntu digambar apa adanya.
- **Interaksi tanda tangan** — tombol **"Tunjukkan yang berubah"**: menyorot persis tiga
  perubahan terhadap aplikasi yang berjalan. Tidak ada konsep lain yang bisa melakukan
  ini, karena ketiganya mengganti pintu depan sehingga deltanya adalah seluruh layar.
- **Temuan yang hanya muncul saat disandingkan** — **PHONSKAMAX 15 15 15** dan
  **PHONSKAVIT 15 15 15** bernama "15 15 15", tetapi komposisi terdaftarnya **tidak
  memuat nitrogen, fosfor, maupun kalium sama sekali** — yang tercatat kalsium,
  magnesium, dan silikat, dan nomornya berawalan `04.01`, bukan `01.01`. Dari daftar 17
  kartu, perbedaan itu tidak kelihatan. Layar tetap **tidak menyimpulkan** bahwa
  produknya menyesatkan; ia cuma menyatakan bahwa nama dan komposisi terdaftar tidak
  berbunyi sama.

### Konsep 05 · Golongan, Bukan Merek

- **Pengguna** — penyuluh (P2, P3), agronom &amp; QC eksportir (P7), petugas lapang
  offtaker (P1). Bukan P4/P5: konsep ini menuntut pengguna sudah tahu apa itu golongan
  cara kerja.
- **Keputusan yang didahulukan** — *berapa banyak pilihan yang tampak berbeda ternyata
  bekerja dengan cara yang sama?*
- **Skenario interaktif utama** — pilih pasangan hama–tanaman → grafik batang berperingkat
  menurut cacah merek, satu batang per **golongan utama** → buka satu golongan untuk melihat
  bahan aktifnya → centang yang sudah dipakai musim ini → layar menjumlahkannya menurut
  golongan **dan menolak memperingatkan**.
- **Empat kasus nyata, tiga skema** — Wereng Coklat pada Padi (IRAC, 454 produk → 17
  golongan), Penyakit Hawar Daun pada Kentang (FRAC, 376 → 23), Gulma Berdaun Lebar pada
  kelapa sawit (HRAC, 661 → **10**), dan Trips pada Cabai (IRAC, 246 → 22).
- **Temuan yang jadi alasan konsep ini ada:**
  - **41% pilihan merek untuk wereng coklat ada di satu golongan.** IRAC 4 memuat 186 dari
    454 merek, tersebar di 11 bahan aktif yang namanya berbeda-beda.
  - **Perangkap sub-golongan.** IRAC 1 memuat `1A` **dan** `1B` — dua kelas kimia berbeda
    dengan **tempat kerja yang sama**. Berpindah dari karbofuran (1A) ke klorpirifos (1B)
    **bukan rotasi**. UI naif yang membandingkan kode lengkap akan menyimpulkan sebaliknya.
  - **Ejaan registri sendiri tidak seragam** — “Abamektin”/“ABAMECTIN”,
    “Buprofezin”/“Buprofenzin”, “Metalaksil”/“Metalksil”, tiga ejaan parakuat. Yang
    menyatukannya justru pemetaan golongan, dan pemetaan itu sendiri **dicocokkan lewat
    ejaan**.
  - **Bahan bergolongan ganda** — mankozeb FRAC `M 03` sekaligus IRAC `UN`; kartap
    hidroklorida IRAC `14` sekaligus FRAC `U 19`. Muncul di dua batang, dan itu memang
    keadaannya.

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
  sendiri sudah bisa disebut: 67 KB / 54 KB / 49 KB / 45 KB sebelum gzip, satu berkas per
  prototipe, tanpa permintaan lanjutan — di bawah anggaran satu penelusuran penuh
  aplikasi yang berjalan sekarang (30–135 KB dalam 2–5 berkas), tetapi itu **perbandingan
  ukuran, bukan pengukuran waktu muat**.
- **Belum ada pengujian ke pengguna sama sekali.** Seluruh bagian 6 masih terbuka.

---

## 9. Rekomendasi arah eksperimen berikutnya

**Kerjakan Konsep 04 lebih dulu — bukan karena ia terbaik, melainkan karena ia yang
membeli buktinya.**

Rekomendasi sebelumnya adalah Konsep 03, dan **alasannya masih berlaku utuh**: dari
ketiganya, hanya ia yang bisa dibangun penuh dengan data yang sudah ada. Yang berubah
bukan penilaian atas ketiganya, melainkan munculnya pilihan yang jauh lebih murah untuk
*mendahuluinya*. Papan skor: **24 / 25 / 31 / 35 / 24** dari 40.

### Yang memutuskan

- **04 satu-satunya yang bisa mengukur dirinya sendiri.** Ini keunggulan struktural,
  bukan gaya. `catatBuka()` hari ini dipanggil tepat enam kali, seluruhnya dari halaman
  jalur; beranda tidak menghitung apa pun yang dibuka, dan `docs/11` batas ke-2 melarang
  `fetch` maupun `sendBeacon`. Karena kedua kata kerja 04 hidup di halaman yang **sudah**
  terinstrumentasi, pemakaiannya terhitung tanpa mengubah satu pun batas itu.
- **04 menjawab pertanyaan terbuka yang menghalangi ketiganya.** Pertanyaan nomor 4 di
  `docs/17` bagian 10 — *apakah orang yang membaca kandungan benar-benar
  membandingkannya dengan sesuatu* — adalah taruhan utama Konsep 03, dan dokumen itu
  sendiri menyatakan ia **tidak bisa dijawab lewat wawancara**. Kata kerja "bandingkan"
  menjawabnya dengan pemakaian nyata, seharga satu komponen alih-alih satu permukaan.
- **04 tidak menutup satu pun pintu.** Kalau orang membandingkan → Konsep 03 layak jadi
  permukaan penuh. Kalau orang menelusuri hubungan → Konsep 02 layak. Kalau tidak
  keduanya, yang hilang cuma dua tombol.
- **Ongkos baliknya paling kecil.** Membatalkannya berarti mencopot dua komponen, bukan
  mengembalikan sebuah beranda.

### Yang harus dikatakan terus terang tentang Konsep 04

**Ia yang paling tidak ambisius dari keempatnya, dan itu bukan kebetulan.** Ia menutup
dua keputusan sempit dan **tidak memiliki satu pun perjalanan utuh** — sumbu "kejelasan
keputusan" adalah satu-satunya tempat ia kalah dari Konsep 01. Ia juga mewarisi seluruh
persoalan beranda yang berjalan: 25 pintu setara, dan penomoran 01–06 yang sejak commit
`4f7d9ca` tidak lagi menunjuk nama berkas apa pun. **Kalau masalah sebenarnya memang
pintu depan, 04 menundanya — bukan menjawabnya.**

Jumlah tertinggi di papan skor karena itu harus dibaca sebagai *"paling layak dikerjakan
lebih dulu"*, bukan *"paling benar"*. Ia unggul pada sumbu yang mengukur seberapa murah
dan cepat sesuatu bisa diuji.

### Di mana Konsep 05 duduk

**24 dari 40 — angka yang sama dengan Konsep 01, dan bukan kebetulan.** Keduanya konsep
dengan nilai agronomis paling tinggi dan ongkos tafsir paling mahal, dan keduanya
**terhalang oleh keputusan yang belum diambil siapa pun** — bukan oleh rancangan.

Konsep 01 menunggu kurasi gejala punya peninjau bernama. Konsep 05 menunggu hal sejenis:
kosakatanya sendiri menyatakan bahwa *“aturan rotasinya sendiri belum ada. Berkas ini
menyediakan bahannya; aturan ‘berapa musim berturut-turut sebelum diperingatkan’ adalah
keputusan agronomis yang belum diambil, dan tempatnya bukan di sini.”* Sampai keputusan
itu diambil, yang bisa dibangun cuma separuhnya — dan prototipenya memang berhenti tepat
di situ, dengan sengaja.

**Satu hal yang membuatnya berharga sekarang juga: ia menangkap kesalahan yang akan
dibuat UI mana pun yang menyentuh resistensi.** Membandingkan kode lengkap (`4A` lawan
`4C`, `1A` lawan `1B`) dan menyimpulkan “berbeda, aman” adalah **keliru** — IRAC
menghitung nomor golongan utama, dan `1A`/`1B` punya tempat kerja yang sama. Kekeliruan
itu murah dihindari kalau diketahui sekarang, dan mahal kalau ditemukan sesudah ada yang
memakainya di lahan.

### Urutan yang diusulkan

1. **Kerjakan Konsep 04, lalu sebarkan lewat kanal yang memang ada.** Tiga perubahan
   kecil. Lalu ukur dua hal yang selama ini tidak terukur: berapa sering "bandingkan"
   dipakai, dan berapa sering "hubungan" dibuka. Jangan mengujinya lewat lalu lintas
   beranda — `app/teruskan.js` menunjukkan jalur masuk yang sebenarnya adalah kartu yang
   diteruskan di grup WhatsApp.
2. **Baca hasilnya sebagai pemilih di antara 02 dan 03.** "Bandingkan" ramai → bangun
   Konsep 03. "Hubungan" ramai → bangun Konsep 02. Keduanya sepi → pertanyaannya bukan
   permukaan mana, melainkan apakah lapisan baca-saja ini dipakai untuk apa pun selain
   satu pemeriksaan tunggal.
3. **Tahan Konsep 01 sampai kurasi gejala punya peninjau bernama.** Tidak berubah. Yang
   menghalanginya bukan rancangan, melainkan nol dari 4.256 rekaman kurasi yang punya
   peninjau bernama — dan bentuk tanya-jawabnya adalah bentuk diagnosis, yang tidak bisa
   dilawan rancangan.
4. **Tahan Konsep 05 sampai aturan rotasinya diputuskan — tetapi simpan temuannya
   sekarang.** Pengelompokan harus memakai **nomor golongan utama**, bukan kode lengkap.
   Itu berlaku bahkan kalau konsep ini tidak pernah dibangun, dan ia lebih murah dicatat
   hari ini daripada ditemukan sesudah dipakai.
5. **Jangan gabungkan kelimanya jadi satu beranda.** Beranda yang mendahulukan lima hal
   sekaligus tidak mendahulukan apa pun. Konsep 04 justru bekerja karena ia menolak
   menjadi salah satu pilihan di antara yang lain.

### Satu perbaikan yang layak diambil terlepas dari konsep mana yang menang

Beranda yang berjalan sekarang (`app/index.html`) menaruh blok batas jawaban **di dalam
`<dialog>`** — satu-satunya permukaan yang masih begitu, sesudah commit `4f7d9ca`
memindahkannya ke pucuk `<main>` di empat belas halaman lain. Menyelesaikan pengecualian
itu adalah perubahan kecil yang tidak menuntut konsep baru, tidak menuntut data baru, dan
bisa dikerjakan hari ini — dan ia satu-satunya hal yang **keempat** konsep sepakati tanpa
kecuali. Di Konsep 04 ia dihitung sebagai perubahan pertama dari tiga.

---

## 10. Berkas yang dibuat

Seluruhnya baru, seluruhnya di dalam folder ini. **Tidak ada berkas existing yang
disunting.**

| Berkas | Isi | Ukuran |
|---|---|---|
| [`index.html`](index.html) | Galeri & alat pembanding: pratinjau, tesis, pengguna, keputusan, model navigasi, kekuatan, risiko, asumsi, bedanya dari UI aktif, tabel banding sepuluh dimensi, papan skor delapan sumbu × empat konsep, dan rekomendasi | 64 KB |
| [`01-kanvas-keputusan.html`](01-kanvas-keputusan.html) | Konsep 01 · Kanvas Lapangan | 67 KB |
| [`02-atlas-pengetahuan.html`](02-atlas-pengetahuan.html) | Konsep 02 · Atlas Tani | 54 KB |
| [`03-meja-banding.html`](03-meja-banding.html) | Konsep 03 · Meja Banding | 49 KB |
| [`04-satu-pintu-dua-kata-kerja.html`](04-satu-pintu-dua-kata-kerja.html) | Konsep 04 · usulan tandingan | 45 KB |
| [`05-golongan-bukan-merek.html`](05-golongan-bukan-merek.html) | Konsep 05 · berfokus OPT | 45 KB |
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

Lalu buka `http://localhost:8742/prototypes/ux-alternatif/`.

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

---

## 11. Asal-usul Konsep 04 — ide yang diuji-tekan lalu tidak lolos

Konsep 04 tidak dirancang bersama ketiganya. Ia lahir dari **menekan sebuah usulan yang
lain** sampai patah, lalu menyelamatkan bagian yang bertahan.

### Usulan yang diuji

> *"Bagaimana kalau ada tiga pintu yang mengakomodasi tiga persona, tiga misi? Di
> homepage ada pilihan pintu mana yang mau dipilih oleh user."*

Menarik, dan menunjuk masalah yang nyata: sayang membuang dua dari tiga konsep. Tetapi
sebagai **pintu-pemilih di beranda**, ia patah di lima titik.

### Lima titik tekan

1. **Ia melawan prinsip pendiri lapisan ini.** `docs/03-enam-pintu.md` bagian 1
   menyatakan pembalikan yang jadi dasar seluruh permukaan baca-saja: *"Ia melayani
   perilaku reaktif alih-alih melawannya — orang datang saat butuh, bukan saat
   dijadwalkan."* Pintu-pemilih menuntut tindakan **proaktif** — mengklasifikasi diri —
   sebelum satu pun nilai diberikan.

2. **Identitas bukan tugas, dan salah-rutenya percaya diri.** Ketiga konsep berbeda pada
   *bentuk pekerjaan*, bukan pada *siapa penggunanya*. Satu penyuluh menjalankan ketiga
   pekerjaan itu dalam satu minggu. Dan `app/index.html` sendiri sudah menyatakan
   sikapnya saat menolak pengenal foto: *"tebakan di pintu masuk mengirim orang ke layar
   yang salah tanpa ia tahu kenapa."* Pintu-pemilih tidak menghapus tebakan itu — ia
   **memindahkannya ke pengguna**, yang tahu lebih sedikit tentang isi ketiga pintu
   daripada mesin.

3. **Pilihannya tidak bisa diukur.** `catatBuka()` dipanggil tepat enam kali di
   `app/*.js`, seluruhnya dari halaman jalur. `beranda.js` mengimpor `ukur.js` **hanya
   untuk `catatLubang`** — ia mencatat lubang data yang ditabrak, bukan apa yang dibuka.
   Dan `docs/11` batas ke-2 mengunci pintunya: *"Pencatatnya tidak pernah `fetch`, tidak
   pernah `sendBeacon`"*, dengan akibat yang dinyatakan sendiri: **"tidak cocok untuk
   mengukur lalu lintas anonim luas."** Memasang percabangan di titik paling menentukan
   lalu tidak bisa tahu cabang mana yang diambil siapa adalah sifat terburuk yang bisa
   dimiliki keputusan perutean.

4. **Beranda memang bukan pintu utamanya.** `app/teruskan.js` (kapabilitas A2) dipanggil
   12 modul, dan tesisnya eksplisit: yang beredar adalah kartu di grup WhatsApp, dan
   *"yang membuka tautannya orang pertama; yang kesepuluh cuma membaca teksnya."* Q1
   lapangan menguatkan: *"Umumnya rekomendasi dari peers."* Jalur masuk dominan
   **menurut rancangan** adalah tautan-dalam ke satu rekaman, yang melewati beranda.

5. **Tiga pintu setara mengklaim tiga khalayak setara; datanya bilang 400 : 1.** P5
   petani gurem **17,2 juta** rumah tangga; P2 penyuluh **39.809** orang; P6 kios
   **±27.000**; P1 — beachhead-nya sendiri — **belum diukur, tugas Fase 1**.

   Ditambah satu ongkos tersembunyi: tiga permukaan berarti **tiga salinan blok batas
   jawaban, layar kosong, dan layar penolakan** yang harus tetap jujur bersamaan. Repo
   sudah pernah kena persis ini — `cangkang.js` mencatat 12 tautan di enam tempat, 7 di
   toko, 6 di usaha, 4 di tiga halaman, 2 di kas, dan `kas.html` yang tidak ditaut dari
   mana pun.

### Apa yang harus benar supaya usulan itu menang

Bisa dibantah, dan inilah syaratnya — ketiganya belum terpenuhi:

1. Pengguna datang membawa **identitas yang stabil**, bukan perkara yang berganti-ganti.
   *(Belum diuji, dan Q1 menunjuk sebaliknya.)*
2. Beranda benar-benar **jalur masuk mayoritas**. *(Bertentangan dengan A2 dan Q1.)*
3. Pilihan pintunya **bisa diukur**. *(Tidak bisa, tanpa mengubah batas ke-2 `docs/11` —
   dan itu keputusan tersendiri yang mengubah sifat produknya.)*

### Bagian yang bertahan, dan jadi Konsep 04

Insting di balik usulan itu benar: **ketiga konsep memang tiga pekerjaan berbeda, dan
membuang dua berarti membuang kapabilitas.** Yang salah cuma titik penggabungannya.

Jadi ketiganya digabung bukan sebagai tiga pintu, melainkan sebagai **satu permukaan dan
dua kata kerja** — nol klasifikasi diri, dan ketiganya langsung terukur karena hidup di
halaman yang sudah memanggil `catatBuka()`:

- **Meja Banding jadi kata kerja atas daftar.** Rumahnya sudah ada: ketik `phonska` hari
  ini mengeluarkan 17 kartu datar dan menyerahkan pemilahannya ke mata pengguna.
- **Atlas jadi panel atas rekaman.** Ongkos satu komponen, tanpa merombak beranda.
- **Kanvas tetap permukaan**, tapi ditahan sampai kurasi gejala punya peninjau bernama.

Kalau tetap diinginkan sebuah pemilih, yang bertahan dari tekanan adalah **pemilih tugas
*sesudah* hasil, bukan pemilih persona *sebelum* apa pun**: *"Ada 17 yang cocok"* →
*bandingkan · telusuri hubungannya · mulai dari gejala*. Reaktif, kontekstual, terukur.

### Cara termurah menyelesaikan perdebatannya

Jangan uji lewat beranda — ia tidak bisa dibaca. Uji lewat kanal yang benar-benar ada:
**sebarkan keempat konsep sebagai tautan-dalam ke grup WhatsApp yang sama**, lalu ukur
mana yang **diteruskan**, bukan mana yang diklik dari pemilih. Itu memakai mekanisme
distribusi yang memang sudah dirancang, dan sekaligus menjawab pertanyaan terbuka nomor 5
di `docs/17`: apakah kartu yang diteruskan bertahan utuh.

---

## 12. Konsep 05 — kenapa golongan, dan kenapa ia berhenti

### Kenapa unitnya golongan, bukan merek atau hama

Keempat konsep sebelumnya bernavigasi lewat benda yang punya nama di kemasan: produk,
bahan aktif, rekaman, hama. Konsep 05 memakai unit yang **tidak tercetak di mana pun**
— golongan cara kerja — dan justru itu nilainya: golongan adalah satu-satunya sumbu di
mana pertanyaan resistensi bisa ditanyakan sama sekali.

Akibatnya bisa dihitung, dan mengejutkan:

| Kasus | Skema | Merek | Bahan aktif | **Golongan utama** |
|---|---|---|---|---|
| Gulma Berdaun Lebar · kelapa sawit | HRAC | 661 | 74 | **10** |
| Wereng Coklat · padi | IRAC | 454 | 47 | **17** |
| Penyakit Hawar Daun · kentang | FRAC | 376 | 53 | **23** |
| Trips · cabai | IRAC | 246 | 60 | **22** |

Dan sebarannya timpang. Untuk wereng coklat, **IRAC 4 sendirian memuat 186 dari 454
merek — 41%** — tersebar di sebelas bahan aktif yang namanya berbeda-beda di rak kios.

> **Angka kentang sempat 18, dan itu keliru.** Versi pertama prototipe meruntuhkan
> FRAC `M 01`…`M 13` jadi satu golongan “M”, seolah hurufnya induk sub-golongan. Bukan:
> pada FRAC, huruf awalan menandai **kategori** dan angka di belakangnya golongan
> tersendiri — mankozeb (`M 03`) dan klorotalonil (`M 05`) bukan satu golongan.
> Diperbaiki, dan besarannya dicatat di
> [`docs/19`](../../docs/19-golongan-resistensi.md) §5.

### Kesalahan yang akan dibuat UI resistensi mana pun

Ini temuan yang paling layak diselamatkan dari prototipe ini, terlepas dari apakah
konsepnya dibangun.

**Sub-golongan IRAC bukan pasangan rotasi.** `1A` dan `1B` adalah dua kelas kimia berbeda
dengan **tempat kerja yang sama** — penghambat asetilkolinesterase. Berpindah dari
karbofuran (1A) ke klorpirifos (1B) **bukan rotasi**. Hal yang sama berlaku pada
`3A`/`3B`, `4A`–`4F`, `20A`–`20D`, `21A`/`21B`, `22A`/`22B`, `24A`/`24B`, `25A`/`25B` —
**kecuali `8A`–`8F`**, yang justru dikecualikan IRAC.

**Tetapi penggabungannya harus sempit.** Diukur pada registri ini: dari 676 kode, **166
berbentuk `<angka><huruf>` dan seluruhnya IRAC**; tujuh di antaranya golongan `8` yang
dikecualikan, jadi 159 yang kena aturan. Tersisa **100 golongan utama**, dan **hanya
sembilan** yang benar-benar terpecah — IRAC `1`, `2`, `3`, `4`, `7`, `9`, `10`, `12`, `22`.
Dua bentuk yang *mirip* sub-golongan tetapi bukan: huruf awalan FRAC (`M`, `P`, `BM`) yang
menandai kategori, dan kode HRAC bergaris miring (`4/29`, `6/24`) yang menandai keanggotaan
ganda. Rinciannya kini tercatat di [`docs/19`](../../docs/19-golongan-resistensi.md) §5.

Sebuah antarmuka yang membandingkan kode lengkap dan menyimpulkan “berbeda, aman” akan
**salah**, dengan akibat yang nyata di lahan. Prototipe ini karena itu menjumlahkan
sub-golongan jadi satu batang dan mengatakan alasannya di tempat.

### Kenapa ia berhenti, dan kenapa itu bukan kekurangan

Layar ini menghitung golongan yang ditandai lalu **menolak mengatakan apakah pengulangan
itu masalah**. Alasannya bukan kehati-hatian umum, melainkan kutipan langsung dari
kosakatanya sendiri:

> *“Aturan rotasinya sendiri belum ada. Berkas ini menyediakan bahannya; aturan ‘berapa
> musim berturut-turut sebelum diperingatkan’ adalah keputusan agronomis yang belum
> diambil, dan tempatnya bukan di sini.”*

Menambahkan ambang di prototipe berarti mengarang keputusan agronomis dan menyematkannya
di UI — persis jenis kesalahan yang paling sulit dicabut kemudian.

### Yang paling rapuh di konsep ini

**Seluruh permukaannya bertumpu pada pemetaan bertingkat D** — terendah yang dipakai
proyek ini. Nama bahan dicocokkan ke kode golongan **lewat ejaan**, berstatus draft,
tinjauan jatuh tempo 23 Februari 2027.

Dan ada ironi yang layak dinyatakan: registri sendiri tidak seragam ejaannya —
“Abamektin”/“ABAMECTIN”, “Buprofezin”/“Buprofenzin” (yang kedua salah ketik),
“Metalaksil”/“Metalksil”, tiga ejaan parakuat. **Yang menyatukan ejaan-ejaan itu justru
pemetaan golongan — dan pemetaan itu sendiri dicocokkan lewat ejaan.** Kalau satu ejaan
luput, bahannya jatuh ke keranjang “tanpa kode” tanpa suara.

Yang memang tidak punya skema sama sekali juga dinyatakan di layar: rodentisida (RRAC
belum ditarik), moluskisida (tidak ada komite), zat pengatur tumbuh, atraktan, dan
penolak. Skema nematisida IRAC terpisah dan **belum ditarik** — sembilan bahan bertanda
nematisida membawa kode insektisida atau fungisidanya, tetapi belum diperiksa terhadap
skema itu.

### Catatan tentang grafiknya

Bentuknya batang mendatar berperingkat, bukan pai maupun donat: pekerjaannya
**magnitudo + identitas**, dan pai gagal pada keduanya di atas lima irisan. Satu seri,
jadi **tanpa legenda** — tiap batang berlabel langsung.

Warnanya dipilih menurut pekerjaannya, dan divalidasi alih-alih dikira-kira:

- **Isian batang satu rona** (`#2a78d6` terang / `#3987e5` gelap) — warna *mark*, digate
  pada ≥3:1 terhadap permukaan grafiknya sendiri.
- **Teks tidak pernah memakai warna itu.** Warna seri divalidasi sebagai mark, sedangkan
  teks menuntut ≥4,5:1 — jadi ada `--seri-teks` tersendiri (`#1f66c2` / `#4d95ea`).
  Kekeliruan ini sempat terjadi dan tertangkap saat pemeriksaan kontras.
- **Kuning status hanya tepi + ikon + label**, tidak pernah isian: pada permukaan terang
  ia 1,79:1, dan kelegaannya adalah label terlihat + tampilan tabel — keduanya ada.
- **Batang “tanpa kode” memakai tekstur**, bukan rona baru — supaya keadaan itu terbaca
  tanpa mengandalkan warna.
