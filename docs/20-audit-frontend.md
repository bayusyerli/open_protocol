# Audit Permukaan `app/` — sembilan temuan, dan apa yang ternyata bersih

> Audit · 23 Agustus 2026 · status **selesai; kesembilan temuan sudah diperbaiki**
> Cakupan: kedelapan halaman di [`app/`](../app/) — beranda, jalur 1–6, dan `peranti.html`.
> Metode: sapuan statis atas seluruh berkas, lalu **pemeriksaan berjalan di peramban**
> pada tiap halaman — bukan pembacaan kode saja.
>
> Tidak satu pun temuan di bawah disimpulkan dari membaca kode belaka; masing-masing
> disertai cara memeriksanya ulang.

---

## 0. Ringkasan

| # | Temuan | Berat | Letak |
|---|---|---|---|
| 1 | ~~Pilihan tema tidak ikut keluar dari beranda~~ — **diperbaiki** | **besar** | `tema.js` baru, `gaya.css`, kedelapan HTML |
| 2 | ~~Klaim *"nomor pendaftaran menaik"* tidak sepenuhnya benar~~ — **diperbaiki** | sedang | `bangun-indeks.mjs`, `tanaman.js`, `bahan.js` |
| 3 | ~~Satu tautan tanpa gaya — 1,72:1 di tema gelap~~ — **diperbaiki** | sedang | `gaya.css` |
| 4 | ~~`tombolKembali()` mati, dan enam salinan penangannya hidup~~ — **diperbaiki** | sedang | `pustaka.js`, enam jalur |
| 5 | ~~Setiap muat halaman membayar satu perjalanan pulang-pergi per berkas~~ — **diperbaiki** | sedang | `bangun-indeks.mjs`, `pustaka.js` |
| 6 | ~~`batas.js` merender tingkat bukti yang sudah dinyatakannya cacat~~ — **diperbaiki** | kecil | `batas.js` |
| 7 | ~~Jalur 2 melompat `h1 → h3`~~ — **diperbaiki** | kecil | enam HTML, `gaya.css` |
| 8 | ~~Dua halaman menaut ke dirinya sendiri~~ — **diperbaiki** | kecil | `index.html`, `varietas.html` |
| 9 | ~~Teks 12,5 px dan sasaran sentuh 17 px~~ — **diperbaiki** | kecil | `batas.css`, `gaya.css`, `beranda.css` |

Bagian 2 mencatat apa yang **diperiksa dan ternyata bersih** — sama pentingnya, karena
tanpa itu daftar di atas terbaca seolah seluruh permukaan bermasalah.

---

## 1. Temuan

### 1 · Pilihan tema tidak ikut keluar dari beranda — **besar**

Tombol tema menulis `data-tema` (bahasa Indonesia) ke `<html>` dan menyimpannya di
`localStorage['op:tema']`. Tiga hal yang membuat pilihan itu berhenti di beranda:

- **Hanya `beranda.html`** yang memuat skrip pembaca `localStorage` di `<head>`. Tujuh
  halaman lain tidak pernah membacanya.
- **Hanya `beranda.html`** yang punya tombolnya. Di jalur 1–6 tidak ada jalan mengubah tema.
- **`gaya.css` mendengarkan atribut yang berbeda** — `data-theme="dark"`/`"light"`
  (bahasa Inggris), sementara yang ditulis `data-tema="gelap"`/`"terang"`. Jadi memasang
  skrip pembacanya saja di jalur 1–6 **tetap tidak akan berpengaruh**; kedua belahan tidak
  bisa bertemu tanpa penyeragaman nama.

`<meta name="theme-color">` pun hanya ada di beranda, sehingga bilah peramban ikut
berganti warna saat berpindah halaman.

**Cara memeriksanya ulang.** Setel peranti ke tema **terang**, buka beranda, ketuk tombol
tema sampai **gelap**, lalu buka `varietas.html`. Beranda gelap, jalur 4 terang — satu
ketukan, dua tampilan. Terbalik juga berlaku.

> Ini bukan cacat kecil yang kebetulan lolos. Commit terakhir berjudul *"Tema satu ikon
> berputar, tiga keadaan tetap terjangkau"*, dan `app/README.md` menjelaskan ketiga
> keadaannya beserta alasan pilihannya dipasang sebelum lembar gaya *"supaya layar gelap
> tidak berkedip putih dulu"*. Kalimat itu benar pada **satu dari delapan** halaman.
> Fiturnya mendarat separuh, dan yang separuh lagi tidak meninggalkan galat apa pun —
> persis bentuk kegagalan yang paling lama tidak ketahuan.

**Yang membukanya:** seragamkan satu nama atribut, lalu pindahkan skrip pembaca dan
tombolnya ke berkas bersama yang disisipkan kedelapan halaman. Selama dua nama itu masih
berbeda, tidak ada perbaikan sebagian yang bisa benar.

> **Diperbaiki 23 Agustus 2026.** Putaran, ikon, dan labelnya pindah ke `app/tema.js`;
> `gaya.css` diseragamkan ke `data-tema="terang"|"gelap"`; skrip pembaca simpanan dan
> tombolnya dipasang di kedelapan halaman. Diuji dua arah dengan peranti dilawan: pilih
> **gelap** saat peranti terang → kedelapan halaman gelap; pilih **terang** saat peranti
> gelap → kedelapan halaman terang. Rinciannya di
> [`app/README.md`](../app/README.md) bagian *Tema*.
>
> **Yang tidak ikut diperbaiki:** `<meta name="theme-color">` tetap hanya di beranda.
> Nilai statis tidak bisa mengikuti pilihan yang menimpa tema peranti, dan memasang
> nilai yang hanya benar separuh waktu lebih buruk daripada tidak memasangnya. Kalau
> mau benar, ia harus diperbarui `tema.js` bersama atributnya — itu pekerjaan sendiri.

### 2 · Klaim urutan merek tidak sepenuhnya benar — sedang

Dua tabel merek mencetak kalimat yang sama:

> Diurutkan menurut **nomor pendaftaran menaik** — tanpa peringkat, tanpa slot berbayar.

Pengurutannya `String(a.daftar).localeCompare(b.daftar)` — perbandingan **teks**, di
`spec/tools/bangun-indeks.mjs:599` dan sekali lagi di `app/tanaman.js:231`. Nomor
pendaftarannya tidak seragam:

| Panjang nomor | Jumlah (dari 4.000 sampel pestisida) |
|---|---:|
| 14 digit | 3.254 |
| 9 digit | 394 |
| 10 digit | 255 |
| 13 digit | 61 |
| lain-lain (7–20) | 36 |

Sepuluh di antaranya bukan digit murni — `01.01.01.2021.7272`, `.01030120083156`,
`01010120165526.`. Pada nomor yang panjangnya berbeda, urutan teks **bukan** urutan
menaik; yang berawalan titik bahkan mendahului seluruhnya.

Ada lapis kedua. Tabel di `bahan.js` mencetak klaim itu tetapi **tidak menampilkan kolom
nomor pendaftaran sama sekali** — kolomnya Merek, Pemegang pendaftaran, Bahan lain.
Pembaca diminta mempercayai urutan yang tidak bisa dilihatnya.

> Maksud klaimnya tetap terpenuhi: urutannya deterministik dan tidak bisa dibeli. Yang
> meleset kata **"menaik"**, dan pada permukaan yang menulis *"Pembagiannya ditulis
> terbuka supaya bisa dibantah siapa pun yang tidak percaya"* di jalur 3, klaim yang
> tidak bisa diperiksa pembaca adalah jenis kesalahan yang paling mahal.

**Yang membukanya:** normalkan sebelum membandingkan (buang non-digit, bandingkan sebagai
angka), **atau** ubah kalimatnya jadi *"urutan tetap, tidak bisa dibeli"* dan berhenti di
situ. Kalau kolom nomornya tidak ditampilkan, jangan menyebut nomor sebagai kunci urutan.

> **Diperbaiki 23 Agustus 2026.** Satu pembanding `urutDaftar` di `bangun-indeks.mjs`,
> dipakai jalur bahan aktif **dan** jalur OPT: non-digit dibuang lalu dibandingkan
> sebagai `BigInt`. Membuang non-digit sekaligus memulihkan kesepuluh nomor cacat ke
> bentuk 14 digit yang sama seperti sisanya; `BigInt` dipakai karena 20 digit melewati
> batas bilangan bulat aman JavaScript. Yang tidak bernomor jatuh ke belakang, bukan ke
> depan — menaruhnya di puncak persis terbaca sebagai slot teratas — dan nama jadi
> pemutus supaya keluarannya tetap deterministik.
>
> Pengurutan ulang di `tanaman.js` **dibuang**: ia memakai pembanding lama dan akan
> membatalkan perbaikan ini tepat di layar yang menampilkan nomornya. Sekarang satu
> otoritas urutan, di pembangun indeks.
>
> Sisi kedua temuan ini — klaim yang kuncinya tidak bisa dilihat pembaca — dijawab di
> layar, bukan dengan menghapus klaimnya: tabel jalur 1 menyebut bahwa nomornya ada di
> kolom sebelah, dan tabel `bahan.js` menyebut bahwa nomornya ada di layar tiap merek,
> satu ketukan dari sana. Menambah kolom nomor ke tabel `bahan.js` ditolak: medannya
> harus ikut diterbitkan ke indeks dan menambah ratusan KB untuk kolom yang bukan
> jawaban layar itu.

### 3 · Satu tautan tanpa gaya, gagal kontras di tema gelap — sedang

`gaya.css` hanya mewarnai `.lain a`. Satu tautan berada di luar pembungkus itu:

```
pengendali-sendiri.html:64   <p><a href="pupuk-sendiri.html">Meramu pupuk sendiri — jalur 5 →</a></p>
```

Ia mewarisi biru bawaan peramban `#0000EE`. Di tema gelap (`--latar: #16181a`) rasionya
**1,72:1** — jauh di bawah ambang 4,5:1, dan satu-satunya kegagalan kontras di seluruh
permukaan. Disapu ke kedelapan halaman: hanya tautan ini.

> Letaknya menambah bobotnya. Jalur 6 satu-satunya jalur yang dibangun untuk **tidak**
> menganjurkan, dan README-nya menyatakan tautan keluarnya *"diberi label status, bukan
> ajakan"*. Satu-satunya tautan yang tampil dengan biru bawaan peramban justru yang itu.

**Yang membukanya:** beri `a` warna token di `gaya.css`, bukan hanya `.lain a`.

> **Diperbaiki 23 Agustus 2026.** `gaya.css` kini mewarnai `a`, bukan hanya `.lain a`.
> Tautan itu sekarang 5,92:1 di tema terang dan 8,39:1 di tema gelap. Sapuan kontras ulang
> atas kedelapan halaman di **kedua** tema: nol kegagalan.

### 4 · `tombolKembali()` mati, dan enam salinan penangannya hidup — sedang

`pustaka.js` mengekspor `tombolKembali(el, wadah, fokus)` — pemasang penangan tombol
"kembali ke hasil pencarian". **Tidak ada satu pun berkas yang memanggilnya.** Sementara
itu keenam jalur memasang penangannya sendiri-sendiri:

`tanaman.js:287` · `produk.js:162` · `harga-pupuk.js:301` · `cek-varietas.js:38` ·
`pupuk-sendiri.js:291` · `pengendali-sendiri.js:297`

Konstanta `HTML_KEMBALI` di berkas yang sama **dipakai** tiga tempat, jadi yang terpecah
bukan tombolnya melainkan perilakunya. Dua ekspor lain juga tidak terpakai di luar
`pustaka.js`: `BASIS` dan `rapikan`.

> Ini persis kekhawatiran yang ditulis README sendiri — *"dua perender agar tidak
> menyimpang diam-diam"* — dan ia sudah terjadi di dalam berkas yang dibuat untuk
> mencegahnya. Fungsinya ada, tidak dipakai, dan penyimpangannya berjalan terus.

Tidak ada gejala di layar: keenam salinan berperilaku sama **hari ini**.

> **Diperbaiki 23 Agustus 2026.** `tombolKembali()` diganti `pasangKembali(wadah, {…})`
> dan dipakai ketujuh tempat. Menyejajarkan ketujuh salinan menunjukkan kenapa yang lama
> tidak pernah dipakai: ia hanya melayani satu dari **dua** rupa yang benar-benar ada —
> `fokus` untuk layar yang dibuka dari kotak cari, `gulirKe` untuk layar yang dibuka dari
> daftar di halaman yang sama — sehingga empat jalur memang tidak bisa memakainya.
> Parameter pertamanya bahkan tidak terpakai di dalam badannya. Jalur 3 menambah
> `sesudah` untuk mereset pilihan produknya.
>
> `BASIS` dan `rapikan` tidak lagi diekspor; keduanya hanya dipakai di dalam `pustaka.js`.
>
> Diuji berjalan di keenam jalur: rincian benar-benar dikosongkan, fokus kembali ke kotak
> cari pada jalur 2–4, dan daftar tergulir kembali pada jalur 1, 5, 6.

### 5 · Satu perjalanan pulang-pergi per berkas, tiap muat halaman — sedang

`ambil()` di `pustaka.js:24` memakai `cache: 'no-cache'` — peramban selalu bertanya ke
server, bahkan untuk berkas yang tidak berubah.

Terukur pada muatan kedua `varietas.html`:

| | |
|---|---|
| `meta.json` dikirim | **300 byte** (304, tanpa isi) |
| `meta.json` dipakai | 13.515 byte (dari cache) |

Jadi **bytenya memang hemat** — revalidasinya bekerja seperti dimaksud. Yang tetap dibayar
**latensinya**: satu pulang-pergi per berkas per muat halaman. Satu penelusuran memakai
3–5 berkas indeks; pada sinyal buruk dengan RTT 300–600 ms itu 1–3 detik sebelum apa pun
tergambar, dan diulang tiap pindah halaman.

Ini **keputusan sadar**, bukan kelalaian — komentarnya menjelaskan alasannya: tanpa
revalidasi, yang membangun ulang indeks akan melihat data lama tanpa satu pun tanda.
Alasan itu benar. Yang layak ditimbang ulang harganya, karena syarat lapangan nomor satu
proyek ini justru *"HP entry-level, sinyal buruk"*.

**Yang membukanya:** nama berkas bercap-isi. Keluaran `bangun-indeks.mjs` sudah
**deterministik** — dinyatakan di komentar kepalanya — jadi cap isinya stabil dan hanya
berubah kalau isinya berubah. Dengan itu berkasnya bisa disajikan `immutable`: nol
revalidasi, dan tetap mustahil melihat data lama.

> **Diperbaiki 23 Agustus 2026.** Yang dicabut sebabnya, bukan gejalanya.
> `bangun-indeks.mjs` menerbitkan `meta.cap` — hash atas seluruh pecahan — dan `ambil()`
> menempelkannya ke tiap URL sebagai `?v=`. Isi berubah → cap berubah → URL berubah →
> salinan lama tidak akan pernah terpakai lagi. Karena basi jadi **mustahil**, `no-cache`
> boleh dicabut dari pecahan; yang tersisa satu permintaan bersyarat per muat halaman
> untuk `meta.json`, satu-satunya berkas yang namanya tidak boleh ikut berubah karena
> dialah yang menyebutkan capnya.
>
> Terukur pada muatan kedua jalur 4: `meta.json` 300 B (bersyarat), `varietas/000` dan
> `cari/el` **0 B, tanpa jaringan**. Tiga perjalanan pulang-pergi jadi satu.
>
> Sifat pengamannya diuji terpisah, karena itu yang paling menentukan: URL bercap sama
> dijawab dari cache tanpa jaringan (0 B); URL bercap berbeda menembus cache dan mengunduh
> penuh (49 KB). Capnya deterministik — membangun ulang sumber yang sama menghasilkan cap
> yang sama, jadi pembangunan ulang yang tidak mengubah apa pun tidak membuang cache
> pembaca sama sekali.
>
> **Setengah lagi bukan milik kode ini, dan sengaja tidak dipalsukan.** Berapa lama
> salinan bercap disimpan urusan yang menyajikan, dan repositori ini belum punya host:
> `python3 -m http.server` tidak mengirim `Cache-Control` sama sekali, jadi angka 0 B di
> atas bersandar pada perkiraan peramban, bukan pada instruksi. Begitu hostnya dipilih,
> pecahan bercap disajikan `Cache-Control: public, max-age=31536000, immutable` dan
> `meta.json` dengan `no-cache` — itu mengubah "biasanya tidak bertanya" jadi "tidak
> pernah bertanya". Yang dikerjakan di sini membuat keduanya **aman dipasang**; sebelum
> ada cap, tidak satu pun aman.

### 6 · `batas.js` merender tingkat bukti yang sudah dinyatakannya cacat — kecil

`periksa()` menolak tingkat di luar A–D dan mencatatnya ke daftar `salah`; tetapi
`gambarSumber()` tetap menggambar nilainya:

```
batas.js:52   class="bj-tingkat bj-tingkat-${s.tingkat.toLowerCase()}"
```

Nilainya masuk atribut `class` **tanpa dilolos** `teks()`, dan blok merah yang muncul di
atasnya tidak menghentikan penggambarannya. Sumbernya penulis layar, bukan pembaca, jadi
ini bukan jalur serangan hari ini — tetapi komponen yang seluruh tugasnya menolak
menyatakan yang tidak bisa ditanggungnya sebaiknya tidak menyatakannya juga.

**Yang membukanya:** lewati sumber yang cacat, atau lolos nilainya dan gambar sebagai
lencana kosong.

> **Diperbaiki 23 Agustus 2026.** Tingkat di luar A–D tidak lagi digambar: lencananya
> jatuh ke bentuk kosong bergaris putus dan teksnya berbunyi *"tingkat bukti tidak sah —
> tidak ditampilkan"*, dibedakan dari *"belum ditetapkan"* karena yang pertama kekeliruan
> dan yang kedua keputusan. Nilainya juga dilolos sebelum masuk atribut `class`. Diuji
> dengan muatan suntikan sungguhan: tidak ada elemen yang tergambar, blok merahnya tetap
> muncul.

### 7 · Jalur 2 melompat `h1 → h3` — kecil

`index.html` memuat `<h2>Pencarian butuh JavaScript</h2>` di dalam `#tanpaJs`, yang
**dihapus JavaScript saat muat**. Sesudahnya judul pertama setelah `h1` adalah `h3` di
dalam `<details class="batas">`. Urutan terukurnya `1,3,3,3,3,2,3`.

Ketujuh halaman lain lolos karena masing-masing punya `h2` lain yang bertahan. Hanya
jalur 2 yang tidak.

> **Diperbaiki 23 Agustus 2026.** Label `<details class="batas">` jadi judul sungguhan —
> `<summary><h2>…</h2></summary>` — di keenam halaman yang punya blok itu, bukan hanya di
> jalur 2. Menaikkan `h3` jadi `h2` pada jalur 2 saja hanya memindahkan salahnya: pada
> **semua** halaman `h3` di dalam blok itu menggantung tanpa induk tingkat dua, dan enam
> di antaranya kebetulan lolos karena ada kartu ber-`h2` mendahuluinya. Jalur 2 tidak
> punya kartu itu begitu `#tanpaJs` dihapus JavaScript — jadi yang tampak sebagai cacat
> satu halaman sebenarnya cacat struktur yang enam halaman sembunyikan.
>
> Rupanya sengaja tidak berubah: `.batas summary h2 { display: inline; font: inherit; }`.
> Nol lompatan judul di kedelapan halaman.

### 8 · Dua halaman menaut ke dirinya sendiri — kecil

`index.html` dan `varietas.html` memuat tautan ke dirinya sendiri di daftar `.lain`.
Daftar itu ditulis tangan delapan kali; dua di antaranya sudah menyimpang.

> **Diperbaiki 23 Agustus 2026.** Kedua tautan ke halaman sendiri dibuang; enam halaman
> lain memang sudah menghilangkan dirinya dari daftar.
>
> **Daftarnya tetap ditulis tangan delapan kali, dan itu keputusan.** Membangkitkannya
> dari JavaScript akan mematikan navigasi antarjalur pada halaman tanpa JavaScript —
> satu-satunya bagian yang masih bekerja penuh di sana. Risiko menyimpangnya diterima;
> gantinya, sapuan pemeriksa sekarang memuat uji tautan-ke-diri-sendiri.

### 9 · Teks 12,5 px dan sasaran sentuh 17 px — kecil

Diukur pada lebar 375 px:

- Teks di bawah 13 px: `.bj-arti` 12,8 · `.bj-keping` 12,5 · `.bj-alasan` 12,6 ·
  `.bj-cakupan` 12,6 · `.jalur` 12,5. **Sebagian besarnya blok batas jawaban** yang baru
  ditambahkan hari ini.
- Tautan di `.lain` setinggi **17 px** — jauh di bawah 44 px, dan itu navigasi antarjalur
  yang dipakai di kebun, kerap dengan tangan basah.

Bukan pelanggaran WCAG (tidak ada ambang ukuran huruf di sana), tetapi bergesekan langsung
dengan syarat lapangan yang dinyatakan proyek ini sendiri.

---

> **Diperbaiki 23 Agustus 2026.** Ambang 13 px dan 44 px di bawah ini **pilihan proyek
> ini, bukan ambang WCAG** — WCAG tidak mengatur ukuran huruf sama sekali, dan sasaran
> sentuh minimumnya 24 px (AA). Yang dipakai di sini syarat lapangannya sendiri: HP
> entry-level, di kebun, kerap dengan tangan basah.
>
> **Ukuran teks** — seluruh medan `bj-*` naik ke 13,4–14,4 px, dan `.jalur` ke 13,4 px.
>
> **Sasaran sentuh** — navigasi `.lain` 17 → **53 px**; nama sumber di blok batas
> 17 → **44 px**; di beranda "Tentang data" 17 → 44, tombol tema 34 → 44 (40×44 di layar
> sempit), tautan kaki dan blok merek → 44.
>
> **Yang ikut ketahuan saat memverifikasi, dan ikut diperbaiki:** `peranti.html` punya dua
> tombol dan **tidak ada satu pun aturan gaya untuknya** — keduanya bawaan peramban,
> setinggi 22 px. Salah satunya menghapus seluruh catatan dan tidak bisa dibatalkan.
> Keduanya kini 44 px, dan yang menghapus diberi rupa berbeda: dua tombol berdampingan
> yang tampak sama membuat yang merusak sama mudahnya diketuk dengan yang tidak.
>
> **Yang sengaja dibiarkan**, dan alasannya:
> - Tautan `pengendali-sendiri.html:64` setinggi 19 px — ia **di dalam kalimat**, dan WCAG 2.5.8
>   memang mengecualikan tautan sebaris di dalam kalimat. Membesarkannya merusak
>   paragrafnya.
> - Lencana `.lencana` 11,2 px, serta `dt` dan `.sumber` di `peranti.html` 12,8 px —
>   di bawah ambang pilihan sendiri, tetapi menaikkannya mengubah irama daftar hasil,
>   dan tidak satu pun disebut temuan ini.
> - Skala kecil milik `beranda.css` (9–12 px pada label mata, `small`, dan cip jaringan)
>   — itu sistem rupa tersendiri milik pintu depan. Mengubahnya perancangan ulang, bukan
>   perbaikan, dan tidak diukur oleh temuan ini.

## 2. Yang diperiksa dan ternyata bersih

Daftar ini bagian dari hasil, bukan basa-basi: tanpa itu bagian 1 terbaca seolah seluruh
permukaan rapuh.

- **Pelolosan HTML — bersih.** Seluruh `${…}` di dalam templat HTML disapu dan diperiksa
  satu per satu. Setiap nilai dari pengguna atau dari data melewati `teks()`. Gema kueri
  pencarian dilolos di keempat layar bercari; URL dibangun `URLSearchParams`;
  `tautanMasuk()` memvalidasi `id`, `pecahan`, dan `opt` terhadap pola sebelum
  memakainya menyusun jalur berkas. Satu-satunya kekecualian temuan 6, dan sumbernya
  penulis layar.
- **Kontras — bersih kecuali satu.** Dihitung ulang dengan pengurai warna yang menangani
  `color(srgb … / α)` dan menyusun lapis latar bertransparansi. Beranda dan jalur 4:
  **nol** kegagalan. Sapuan kedelapan halaman menemukan satu-satunya kegagalan pada
  temuan 3. *(Pengukuran pertama sempat melaporkan enam kegagalan di beranda; itu galat
  alat — pengurainya membaca `color(srgb 1 0.996 0.973)` sebagai nilai 0–255. Diperbaiki,
  lalu diukur ulang.)*
- **Hitungan jalur 3 — tepat.** Diuji berjalan dengan PHONSKA NPK 15-8-10, Rp 180.000
  untuk 50 kg. Layar: `Rp 180.000 ÷ 50 = Rp 3.600` · `330 g/kg ÷ 1.000 = 0,33` ·
  `Rp 3.600 ÷ 0,33 = Rp 10.909`. Hitungan tangan 10.909,09. Perbandingan HET juga cocok:
  3.600 ÷ 2.300 = 1,565 → tampil **1,57×**. Ketiga pembaginya tampil di layar seperti
  yang dijanjikan README.
- **Galat konsol — nol** pada kedelapan halaman, termasuk sesudah membuka rincian,
  kartu bahan, dan resep.
- **`id` ganda — nol**, termasuk setelah interaksi. Dua `#kembali` di `harga-pupuk.js` dan
  `pengendali-sendiri.js` berada di cabang render yang saling meniadakan.
- **Nama kontrol — lengkap.** Tidak ada tombol tanpa nama, input tanpa label, atau
  tautan tanpa teks di kedelapan halaman.
- **Urutan judul — bersih** di tujuh halaman; kekecualiannya temuan 7.
- **Cadangan tanpa JavaScript — ada di kedelapan halaman.** Kartu `#tanpaJs` tampil lebih
  dulu lalu dihapus skrip, jadi kegagalan memuat modul meninggalkan peringatannya utuh —
  arah yang benar. Beranda memakai `<noscript>`; dua mekanisme untuk satu maksud, tetapi
  keduanya bekerja.
- **Judul halaman unik dan deskriptif** di kedelapan halaman.
- **Anggaran 48 KB — utuh.** 0 dari 4.026 berkas indeks melewatinya.

---

## 3. Batas audit ini

1. **Satu peramban, satu peranti.** Seluruh pengukuran di mesin pengembang dengan
   peramban berbasis Chromium pada 375×812. Tidak ada Safari iOS, tidak ada Android
   sungguhan, tidak ada pembaca layar sungguhan — struktur ARIA diperiksa dari pohonnya,
   **bukan** dengan mendengarkannya.
2. **Latensi tidak diuji, dihitung.** Angka 1–3 detik di temuan 5 hasil perkalian jumlah
   berkas dengan RTT wajar, bukan pengukuran di jaringan lambat sungguhan.
3. **Sampel nomor pendaftaran 4.000 dari 7.724** pestisida; sebaran panjangnya bisa
   sedikit berbeda pada keseluruhan, tetapi keberadaan nomor tak seragam sudah cukup
   membuktikan temuan 2.
4. **Kesembilan temuan sudah diperbaiki**, ditandai di tempatnya masing-masing. Satu
   di antaranya — temuan 5 — hanya tuntas separuh di dalam repositori: sisi hostnya
   menunggu host, dan itu dinyatakan di tempatnya alih-alih dihitung sebagai selesai
   penuh.
5. **Temuan 6 dan sebagian temuan 9 berasal dari kode yang ditulis hari ini juga**, dalam
   sesi yang sama dengan audit ini. Audit atas pekerjaan sendiri lebih lemah daripada
   audit orang lain, dan keduanya sengaja tidak diturunkan bobotnya karena itu.
