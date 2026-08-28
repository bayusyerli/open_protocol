# Strategi SEO — 20.617 halaman terbit hari ini, 16 menunggu peninjau

> Dokumen kerja · Fase 0 → Fase 1 · Versi **0.8** · 23 Agustus 2026 · Status **usulan**
>
> Peta kueri, arsitektur URL, gerbang mutu, pagar, dan urutan kerja supaya permukaan
> baca-saja `app/` bisa ditemukan orang yang mencarinya — tanpa menukar netralitas,
> batas jawaban, atau batas lapangan yang sudah diputuskan di tempat lain.
>
> **v0.2** — dua belas kueri diperiksa langsung di Google Indonesia (`gl=id&hl=id`,
> keluar akun), bukan lewat alat pencarian berlokal AS. Empat keputusan berubah; §3
> memuat buktinya.
>
> **v0.3** — `spec/tools/bangun-halaman.mjs` dibangun dan dijalankan untuk keempat
> template S1. Empat dari lima angkanya meleset dari taksiran, dan satu temuan mengubah
> bentuk halamannya; §6a memuat hasilnya.
>
> **v0.4** — dua template S2 menyusul: **produk** dan **setara**. Keduanya jatuh persis
> di angka yang diramalkan gerbang §6, dan registri sendiri mengukuhkan temuan SERP §3;
> §6b memuat hasilnya.
>
> **v0.5** — **badan** menutup S2. Tujuh dari dua belas template sudah terbit; yang
> tersisa hanya yang butuh kadensi atau putusan (S3).
>
> **v0.6** — S3 selesai: **harga, toko, sediaan**. Sepuluh template terbit; yang tersisa
> hanya lima belas halaman editorial yang memang harus ditulis tangan. §6c memuat
> hasilnya — termasuk gerbang toko yang memakan 89 dari 92 wilayah.
>
> **v0.7** — **editorial selesai**, dan dengan itu seluruh rencana halaman terbangun:
> 20.633 halaman terindeks dari 23.716 yang terbit. §6d memuat aturan yang membuatnya
> tidak bisa basi diam-diam.
>
> **v0.8** — **gerbang tinjau dipasang untuk editorial**. Prosanya pindah jadi rekaman
> kosakata, tunduk pada L35 dan sematan `reviewed_hash`. Enam belas halaman itu kini
> **tidak diindeks sampai ada peninjau bernama**; angka terindeks turun ke 20.617 dan
> naik lagi begitu tinjauan masuk. §6e memuat mekanismenya.
>
> Belum menutup butir mana pun di [`docs/10-peta-modul.md`](10-peta-modul.md);
> usulan penempatannya di §12.

---

## 0. Sembilan keputusan

**Kanal**

SEO melayani pasar **pengguna** dan **kontributor**, bukan beachhead pembayar. Petugas
lapang offtaker (P1 di [`docs/02-tiga-pasar.md`](02-tiga-pasar.md)) tidak datang dari
mesin pencari — mereka datang dari kontrak. Yang dikerjakan pencarian adalah satu hal
yang [`docs/11-instrumentasi.md`](11-instrumentasi.md) §5 sebut sebagai satu-satunya
jembatan ke metrik utara: **membuktikan lapisan rujukan dipakai berulang**.

**Bentuk**

Halaman **ter-prerender sebagai berkas statis**, dibangun `spec/tools/bangun-halaman.mjs`
mengikuti pola `bangun-indeks.mjs`. Bukan render peramban. Perayap memang menjalankan
JavaScript, tetapi ia tidak pernah menemukan 26 ribu entitas yang tidak ditaut dari mana
pun.

**Cakupan**

27.145 halaman calon dari dua belas template, di luar 11.227 varietas yang dibatalkan.
**20.628 diterbitkan dan diindeks** (ditambah halaman toko yang lolos gerbang, ≤92);
sisanya sengaja `noindex` sampai isinya cukup. **Seluruhnya sudah dibangun**, bukan ditaksir: **20.617 halaman terindeks** hari ini dari
23.716 yang terbit, lihat §6a sampai §6e. Enam belas halaman editorial terbit tetapi
sengaja **belum diindeks** — menunggu peninjau bernama (§6e). Yang tersisa di luar itu
bukan halaman lagi, melainkan domain, host, workflow, dan Search Console.

**Sasaran sebenarnya bukan peringkat, tapi kotak pertanyaan**

Sebelas dari dua belas kueri yang diperiksa menampilkan **"Orang lain juga bertanya"**,
dan hampir seluruh pertanyaannya adalah pertanyaan yang datanya sudah dipegang: *"Berapa
dosis abamektin per tangki 16 liter?"*, *"Obat cabe apa yang mengandung abamektin?"*,
*"Pupuk NPK 16-16-16 yang bagus merk apa?"* Struktur tiap template mengikuti pertanyaan
itu — judul H2 berbentuk pertanyaan, jawaban di paragraf pertama, sumbernya di bawahnya.

**Kanonik**

1.276 klaster setara (pestisida) dan 373 halaman kandungan (pupuk) jadi hub. Halaman
produk tetap kanonik atas dirinya sendiri — nomor pendaftaran, pemegang, dan dosis
berlabelnya berbeda — tetapi penjelasan komposisi ditarik ke hub, bukan disalin 6.809
kali.

**Harga: turun peringkat, ganti sudut**

Kueri `harga cabai merah hari ini` di SERP Indonesia dipegang **kotak berita** yang
diperbarui tiap jam dan **delapan dasbor harga pemda** — Jatim, Sleman, Medan, Jabar,
Denpasar, Jateng, Bengkulu, Bogor. Seri nasional tidak akan mengalahkan itu, dan
penelusuran terkaitnya seluruhnya bergeografi. Sudut yang tersisa justru yang paling
jujur dan tidak dijawab siapa pun: penelusuran terkait memuat **"harga cabai dari petani
hari ini"**, dan tidak satu pun hasil bisa menjawabnya.

**Nama orang bukan halaman**

Konsisten dengan keputusan varietas: 576 varietas atas nama perorangan tidak dibuatkan
halaman profil. Aturan yang sama berlaku ke 2.248 titik toko, yang sebagian besar bernama
orang — dan 2.181 di antaranya tidak punya alamat apa pun di luar nama kabupaten.

**Pengukuran**

Search Console dan log host. **Tidak ada pelacak di halaman** — `grep` atas `app/`
membuktikan sampai hari ini tidak ada satu pun, dan manifest menjanjikan kata yang
dicari tidak dikirim ke mana pun. Tidak ada angka SEO yang boleh naik jadi metrik utara.

**Domain**

Satu origin, disajikan dari **akar**, bukan `/app/`. ccTLD `.id`. `github.io` bukan rumah
permanen: pindah domain setelah 19 ribu URL terindeks membayar ongkos yang tidak perlu.

---

## 1. Apa yang dijual pencarian ke tiga pasar

| Pasar | Yang bisa dilakukan pencarian | Yang tidak |
|---|---|---|
| **Pengguna** (petani, kios, penyuluh) | Menjadi jawaban saat orang mengetik nama di kemasan atau gejala di daun. Ini satu-satunya kanal yang skalanya cocok dengan 14.920 produk | Menghadirkan P1 — petugas lapang dibayar memakai alat yang dipilih atasannya |
| **Pembayar** (offtaker, ritel modern) | Bukti bahwa lapisan rujukannya nyata dan dipakai; halaman yang bisa dibuka saat uji tuntas | Menutup kontrak. Itu penjualan, bukan trafik |
| **Kontributor** (agronom, BPTP, penyuluh) | Halaman yang bisa **dikutip** — dan halaman kekosongan yang menyebut persis apa yang belum diisi. Yang menarik kontributor adalah melihat lubangnya bernama | Menggantikan undangan tertulis untuk tinjauan |

Konsekuensinya: kalau trafik naik tetapi kutipan dan tinjauan tidak, strategi ini gagal
walaupun angkanya bagus.

---

## 2. Enam blokir keadaan sekarang

1. **Jawaban dirender di peramban.** Seluruh isi datang dari `spec/indeks/` lewat
   `fetch`. `app/index.html` bahkan menyatakannya sendiri: *"Pencarian butuh
   JavaScript."*
2. **Tidak ada URL per entitas.** Yang ada parameter: `index.html?id=&pecahan=`,
   `jalur-1.html?opt=`, `harga.html?k=`, `principal.html?key=`. Fondasinya benar —
   tetapi **tidak ada satu pun tautan internal** yang menunjuk ke 26 ribu entitas, jadi
   perayap tidak punya jalan masuk.
3. **Tidak ada `robots.txt`, `sitemap.xml`, `rel=canonical`, `og:`.** Dua belas halaman
   `app/*.html` punya `<title>` dan `<meta name="description">` yang sudah ditulis dengan
   benar; sisanya kosong.
4. **Belum ada host, domain, dan pipeline terbit.** Tidak ada `.github/workflows/`, tidak
   ada `CNAME`.
5. **Indeks turunan tidak ada di repo.** `.gitignore` membuang `spec/indeks/` — 5.142
   berkas, 21 MB. Apa pun yang menerbitkan halaman harus jadi **langkah terbit**, bukan
   komit.
6. **`sw.js` menyajikan HTML cache-first.** Hanya `meta.json` yang jaringan-dulu; sisanya
   `if (tersimpan) return tersimpan`. Ini bukan penghalang perayap — Googlebot tidak
   mendaftarkan service worker — tetapi ia penghalang **kesegaran** bagi orang yang
   kembali ke halaman harga esok harinya.

---

## 3. SERP Indonesia, diperiksa langsung

Dua belas kueri, Google Indonesia (`gl=id&hl=id&pws=0`), 23 Agustus 2026. Bukan alat
pencarian berlokal AS — dan hasilnya berbeda cukup jauh sehingga empat keputusan berubah.

| Kueri | Yang memegang hasil teratas | Yang tidak ada di sana |
|---|---|---|
| ulat grayak cabai obatnya apa | **TikTok** (Petani Cabe Cianjur), Corteva, YouTube, Shopee, jurnal Unmul, Nufarm, Instagram, Lazada | Daftar merek yang **terdaftar** untuk ulat grayak pada cabai |
| dosis gramoxone per tangki | syngenta.co.id, 3 YouTube, **grup Facebook petani**, TikTok, 3 toko daring | Dosis **berlabel**. Empat sumber teratas memberi empat angka berbeda — lihat di bawah |
| abamektin untuk hama apa | Gokomodo, video, gambar, Kumparan, **PPDB Univ. Hertfordshire**, Tokopedia, Shopee | Daftar produk terdaftar Indonesia yang memuatnya |
| merk insektisida bahan aktif abamektin | Gokomodo (daftar **6 produk**), video Tokder, mitalom, Shopee, Lazada, Tokopedia, Blibli | Daftar lengkapnya. Registri punya seluruhnya, beserta kadarnya |
| apa bedanya emamektin dan abamektin | Empat situs pemasok kimia Tiongkok terjemahan mesin, ScienceDirect, video | Perbedaan yang bisa diperiksa: **terdaftar untuk apa**, bukan mana yang lebih kuat |
| cek nomor pendaftaran pestisida | ap-simpel (beranda), simpel1, YouTube PSP Kementan, Facebook PVTPP, Kumparan, TikTok Ditjen PSP | Daftarnya sendiri. Penelusuran terkait menyebut *"Daftar pestisida terdaftar"* |
| cara cek pupuk asli atau palsu | Karusel video panjang: TikTok Ditjen PSP, YouTube penyuluh, Instagram Pupuk Kaltim, Petrokimia, Pupuk Indonesia, SawitPRO | Pemeriksaan dari **angka di karung** terhadap registri |
| pupuk npk 16-16-16 untuk tanaman apa | Video, Gokomodo, jurnal, Meroke, Shopee, npkmutiara.com, Politani Kupang | 156 pupuk terdaftar dengan komposisi itu, urut nomor pendaftaran |
| harga cabai merah hari ini | **Kotak berita** (Suara, Databoks, Bisnis) + 8 dasbor pemda | Harga yang diterima petani — penelusuran terkait memintanya |
| benih padi inpari 32 deskripsi varietas | **DPKP DIY** dengan deskripsi agronomi lengkap, repository Kementan (PDF), Scribd, jurnal | — sudah dijawab lebih baik daripada yang bisa kita terbitkan |
| toko pertanian di kabupaten bandung | tempat.info (*"7 Rekomendasi…"*), Instagram toko, Kumparan, Tokopedia, contact.page | Kelengkapan — tapi mereka punya alamat, kita 2.181 dari 2.248 tidak |
| cara membuat MOL untuk tanaman | Karusel YouTube, Kompas, Distan Bali, repository Kementan, Centra Biotech, mitalom | Titik kendali, kriteria pelepasan, kedudukan hukum |

**Temuan tunggal yang paling menentukan.** Pada `dosis gramoxone per tangki`, empat hasil
teratas memberi dosis yang **saling bertentangan**: 2 tutup botol per 10 liter, 5–10 ml
per 1 liter, ±1 ml per liter, dan 1,5–3 liter per hektare. Tidak satu pun menyebut dosis
berlabelnya. Registri memegang **23.058 penggunaan berlabel**; itulah seluruh isi
argumennya, dan ia lebih tajam daripada apa pun yang bisa ditulis tentang netralitas.

**Empat koreksi terhadap v0.1:**

1. **Video, bukan blog, yang memegang kueri paling berharga.** Enam dari dua belas kueri
   dijawab karusel TikTok/YouTube/Instagram di atas hasil web pertama. Halaman teks
   bersaing di pita yang lebih sempit daripada dugaan awal — dan sebagian permintaan itu
   **tidak bisa direbut** halaman statis. Itu keputusan kanal tersendiri, di luar dokumen
   ini, dan lebih baik disebut daripada dianggap tidak ada.
2. **"Orang lain juga bertanya" muncul di sebelas dari dua belas kueri.** Ia jadi
   penentu struktur halaman, bukan hiasan.
3. **Varietas per varietas dibatalkan, bukan sekadar ditunda.** `dpkp.jogjaprov.go.id`
   sudah menerbitkan deskripsi agronomi utuh — warna kaki, tipe pertumbuhan, lebar daun,
   umur. Kita punya **nol sifat agronomi dari 11.227**. Menerbitkannya berarti menerbitkan
   halaman yang pasti lebih buruk daripada yang sudah ada.
4. **Tidak satu pun kueri menampilkan AI Overview** dalam pemeriksaan ini. Itu bukan
   jaminan — pemeriksaan dilakukan keluar akun dan dari IP luar Indonesia, dan AI Overview
   memang tidak seragam — tetapi ia berarti klik pada kueri fakta ini **belum** dipotong.
   Jendelanya sedang terbuka; itu argumen untuk mulai sekarang, bukan nanti.

**Batas pemeriksaan ini:** IP-nya di luar Indonesia, jadi paket lokal (peta, "di dekat
saya") tidak terwakili dan urutan bisa bergeser beberapa posisi. Yang tidak bergeser:
jenis domain yang mengisi halaman pertama.

---

## 4. Peta kueri → jalur → template

Bentuk jawaban mengikuti [`docs/15-kapabilitas-lintas-pemangku.md`](15-kapabilitas-lintas-pemangku.md):
hanya bentuk pertama yang berupa anjuran.

| Niat | Contoh kueri | Jalur | Template | Pemegang SERP hari ini |
|---|---|---|---|---|
| Hama terlihat, obatnya apa | "ulat grayak cabai obatnya apa" | 1 | `/hama/<komoditas>/<opt>/` | TikTok, blog vendor |
| Ini produk apa, dosisnya berapa | "dosis gramoxone per tangki" | 2 | `/produk/<slug>-<nomor>/` | Situs principal, YouTube, toko daring |
| Bahan aktifnya untuk apa | "abamektin untuk hama apa" | 2 | `/bahan/<slug>/` | Blog vendor, basis data asing |
| Merek apa saja yang memuatnya | "merk insektisida bahan aktif abamektin" | 2 | `/bahan/<slug>/` | Daftar blog berisi 6 produk |
| Merek lain yang isinya sama | "pengganti X yang lebih murah" | 2 | `/setara/<sidik>/` | **Tidak ada** |
| Pupuk dengan kandungan tertentu | "npk 16-16-16 untuk tanaman apa" | 2 | `/kandungan/<n>-<p>-<k>/` | Situs merek, marketplace |
| Pupuk mana lebih murah | "npk 16-16-16 vs 15-15-15" | 3 | kalkulator, bukan halaman entitas | Blog toko |
| Benihnya sah atau tidak | "inpari 32 terdaftar" | 4 | daftar per komoditas saja | Portal pemda — **lebih lengkap dari kita** |
| Siapa produsennya | "pt X produk apa saja" | 2 | `/badan/<key>/` | Situs perusahaan |
| Harga komoditas | "harga cabai dari petani" | — | `/harga/<seri>/` + halaman batas | Berita, dasbor pemda |
| Toko terdekat | "toko pertanian di kabupaten X" | — | `/toko/<wilayah>/` bergerbang | Listicle, Instagram, Maps |
| Meramu sendiri | "cara membuat MOL" | 5, 6 | `/sediaan/<id>/` | YouTube, Kompas, dinas |
| Pupuk palsu | "cara cek pupuk asli" | 2 | pemeriksa kandungan + halaman batas | Video institusi |

Tiga aturan yang menentukan bentuk halaman:

- **Dosis ditayangkan dua satuan.** Registri menyimpan dosis per hektare; yang diketik
  orang **per tangki**. `app/takaran.html` sudah bisa mengonversinya — konversi itu wajib
  ikut di tiap halaman produk, karena di situlah kuerinya.
- **Nama lokal ikut sebagai sinonim di halaman — bukan halaman sendiri.**
  `spec/indeks/nama-lokal.json` menyimpan "sundep", "beluk", "cabe". Ia berbeda dari medan
  `synonyms` registri, yang isinya salah ketik dan **tidak boleh** ditayangkan sebagai
  nama lokal.
- **Tidak pernah ada halaman "produk terbaik".** Itu persis permainan yang dimenangkan
  blog vendor dan karusel video, dan ia bertentangan dengan urutan-menurut-nomor-pendaftaran
  yang sudah dijanjikan di layar.

---

## 5. Dua belas template dan pola URL-nya

| URL | Sumber | Calon | Diindeks | Judul |
|---|---|---|---|---|
| `/` | — | 1 | 1 | Beranda enam jalur |
| `/produk/<slug>-<nomor>/` | `indeks/produk/` | 14.920 | **11.840** | `<NAMA> — isi, dosis berlabel, dan merek lain yang sama` |
| `/setara/<sidik>/` | `indeks/setara/` | 1.276 | 1.276 | `<Bahan> <kadar> — <n> merek terdaftar dengan isi identik` |
| `/kandungan/<n>-<p>-<k>/` | `indeks/kandungan/` | 3.183 | **337** | `Pupuk NPK <n>-<p>-<k> — <n> produk terdaftar dengan kandungan itu` |
| `/bahan/<slug>/` | `indeks/bahan/` | 1.125 | **1.125** | `<Bahan aktif> — <n> produk terdaftar, dan untuk apa saja terdaftarnya` |
| `/hama/<komoditas>/<opt>/` | `indeks/opt/` | 2.580 | 2.580 | `<OPT> pada <komoditas> — bahan aktif dan merek yang terdaftar` |
| `/tanaman/<komoditas>/` | `indeks/opt/` | 692 | **234** | `<Komoditas> — OPT terdaftar, varietas, dan harga` |
| `/badan/<key>/` | `indeks/principal/` | 3.136 | 3.136 | `<Nama badan> — <n> pendaftaran pupuk, pestisida, benih` |
| `/harga/<seri>/` | `indeks/harga/` | 96 | **55** | `Harga <komoditas> — eceran nasional, <tanggal>, dan jaraknya dari harga petani` |
| `/toko/<wilayah>/` | `indeks/toko/` | 92 | **3** | `Toko tani di <wilayah> — <n> titik` |
| `/sediaan/<id>/` | `indeks/sediaan/` | 34 | **31** | `<Resep> — kedudukan hukum, bahan, titik kendali` |
| `/batas/…`, `/sumber/…` | `vocab/editorial.json` | 16 | **0 hari ini** | editorial — bergerbang tinjau (§6e) |

Yang **tidak** dibuat, dan alasannya:

- **Halaman varietas per varietas** (11.227) — dibatalkan, bukan ditunda; lihat §3
  koreksi 3. Yang diterbitkan hanya daftar per komoditas.
- **Kombinasi berfaset** (bahan × komoditas × tahun) — ledakan URL tanpa pertanyaan yang
  benar-benar ditanya orang.
- **Halaman hasil pencarian internal** (`?q=`) — `noindex, follow`, dan `Disallow`.
- **Halaman orang** — pemulia, pemilik toko bernama orang.

---

## 6. Gerbang tipis, dihitung bukan ditaksir

Dijalankan `bangun-halaman.mjs` saat membangun; alasannya dicatat di keluaran supaya
selisihnya bisa dibaca seperti diff indeks.

| Gerbang | Jumlah | Putusan |
|---|---|---|
| Pestisida tanpa penggunaan berlabel | 1.014 | `noindex`, tetap ditaut dari hub bahannya |
| Pupuk tanpa komposisi sama sekali | 2.066 | `noindex` — nama dan nomor saja bukan halaman |
| Kandungan pupuk yang hanya dipakai satu produk | 3.106 | tidak diterbitkan; halamannya akan menduplikasi halaman produknya |
| Substansi yang tidak dipakai produk mana pun | 259 | tidak diterbitkan |
| Komoditas tanpa berkas OPT | 458 | tidak diterbitkan sampai ada isinya |
| Produk dengan izin berakhir | 1.962 | **diterbitkan dan diindeks**, status di judul. Justru di sini kueri "masih boleh dipakai?" hidup — halaman menyebut faktanya, bukan kesimpulan hukumnya |
| Komposisi unik (tanpa klaster setara) | 8.111 | kanonik atas dirinya sendiri, tanpa hub |
| OPT tanpa teks gejala | 685 dari 782 | halaman ada bila punya produk terdaftar, tetapi **tidak menjanjikan pengenalan gejala**; hanya OPT terkurasi yang membawa blok gejala |
| Toko tanpa alamat atau titik | 2.181 dari 2.248 | wilayah baru diterbitkan bila punya **≥5 entri beralamat atau bertitik**. Hari ini yang memenuhi: 234 titik OSM dan 92 entri beralamat, sisanya nama telanjang dari arsip TTI. Halaman berisi 47 nama tanpa alamat kalah dari listicle berisi 7 nama beralamat — dan pantas kalah |

Sisanya: 6.710 pestisida dan 5.130 pupuk lolos → **11.840 halaman produk terindeks**.

---

## 6a. Apa yang berubah setelah alatnya dibangun

`spec/tools/bangun-halaman.mjs` dijalankan atas indeks yang sama. Empat dari lima
angkanya meleset dari taksiran §5, dan satu temuan mengubah bentuk halamannya.

| Template | Taksiran v0.2 | Hasil bangunan | Kenapa berbeda |
|---|---|---|---|
| hama×komoditas | 1.385 | **2.580** | Taksirannya menghitung pasangan menurut **nama**; indeksnya menyimpan menurut **id**. Satu komoditas bisa punya lima OPT bernama sama |
| bahan | 1.140 | **1.125** | Taksirannya menghitung zat di komposisi produk; indeksnya menghitung zat yang punya kartu bahan+kadar. Angka 1.192 pada v0.3 keliru — lihat §6b |
| kandungan | 373 | **337** | Taksirannya mengelompokkan menurut label komposisi; indeksnya mengelompokkan menurut sidik berbasis satuan, dan basis pestisida dilewati — pasangannya di sana `/setara/` |
| komoditas | 234 | **234** | — |

**Temuan yang mengubah bentuk halaman.** Lima OPT bernama *"Gulma Berdaun Lebar"* pada
satu komoditas ternyata **lima spesies yang berbeda** — *Ageratum conyzoides*, *Bidens
pilosa*, *Amaranthus* sp., *Borreria latifolia*, *Galinsoga parviflora*. Menyatukannya
akan menyatukan lima pendaftaran yang memang terpisah; menerbitkannya apa adanya akan
menghasilkan lima halaman berjudul sama persis, dan mesin pencari akan memilih satu lalu
membuang empat. Jalan ketiga yang ditempuh: **dibedakan menurut taksonnya** — judul
membawa nama ilmiah, slug yang bertabrakan memakai kunci kosakata
(`gulma-berdaun-lebar-bidens-pilosa`), dan tiap halaman menyebut siapa saja yang berbagi
labelnya beserta tautannya. Kosakata `spec/vocab/pest-registri.json` yang membuatnya
mungkin, dan tidak ada pesaing yang punya pemetaan label→takson ini.

**Berat halaman ternyata soal kartu, bukan baris.** Satu kartu bahan+kadar membawa judul,
catatan, dan kepala tabelnya sendiri — sekitar 900 byte walau isinya satu baris. "Perusak
Daun" pada kubis punya **141 kartu untuk 216 merek**, dan menabelkan semuanya
menghasilkan satu halaman 176 KB. Yang dianggarkan karena itu kartunya lebih dulu: dua
belas kartu ditabelkan penuh, sisanya jadi daftar ringkas yang tetap menyebut jumlah
mereknya dan tetap menaut ke halaman bahannya. **Yang dipangkas dikatakan di halamannya
sendiri**, dan dihitung di ringkasan bangunan.

**Anggaran 48 KB dinilai atas ukuran ter-gzip.** Itu yang melintas jaringan; ukuran mentah
menentukan lama uraiannya, jadi keduanya dilaporkan. Hasilnya: **p50 3,5 KB, p90 4,3 KB,
maksimum 12,6 KB ter-gzip** — 65 halaman melewati 48 KB mentah, **nol** ter-gzip.

**Dosis per tangki jadi kolom, bukan janji.** 4.024 sel dosis yang satuannya per liter
dikalikan isi tangki 16 L — aritmetika, bukan agronomi. Dosis per hektare **tidak**
dikonversi: menghitungnya menuntut volume semprot, dan volume semprot itu hasil kalibrasi
alat dan cara jalan orangnya sendiri. Halaman menyebutkan itu dan menaut ke
`takaran.html`, alih-alih mengarang angka.

Ringkasan bangunan juga melaporkan yang tidak enak dibaca: 246 halaman daftarnya
dipangkas, 66 slug bahan bertabrakan dan diberi ekor id, dan 2.846 sidik kandungan
dilewati karena hanya dipakai satu produk.

---

## 6b. Dua template S2, dan angka yang mengukuhkan §3

`produk` dan `setara` menyusul di alat yang sama. Keduanya **jatuh persis di angka yang
diramalkan gerbang §6**: 14.920 produk terbit, 3.080 di antaranya `noindex` (1.014
pestisida tanpa penggunaan berlabel + 2.066 pupuk tanpa komposisi), menyisakan **11.840
terindeks**. Setara **1.276**, tanpa satu pun kelompok yang gugur.

**Registri mengukuhkan temuan §3 dari sisi yang lain.** Pada satu kelompok setara —
parakuat diklorida 135 g/L — ada **44 merek terdaftar dengan isi identik dan 29 dosis
terdaftar yang berbeda di antaranya**. §3 menemukan empat sumber di halaman pertama
Google memberi empat dosis yang bertentangan untuk satu produk; di sini registrinya
sendiri menerbitkan 29 dosis untuk satu formulasi. Keduanya fakta yang sama dari dua
arah, dan halaman setara menyebutkannya sebagai jawaban pertanyaan: *"Kalau isinya sama,
apakah dosisnya sama?"* — **Tidak.**

**Gambar kemasan jadi keputusan lisensi, bukan keputusan SEO.** 530 produk punya gambar
kemasan; tiap rekaman mencatat `hak: pemegang_pendaftaran` beserta penerbit dan tautan
halaman asalnya. Gambarnya **ditampilkan** — permukaan `app/` sudah menampilkannya untuk
mengenali produk — tetapi halamannya membawa `noimageindex`, mengikuti pagar §10. Kalau
dasar lisensinya sudah diputuskan, `--gambar-terindeks` mencabutnya.

**Satu cacat ditemukan dan diperbaiki.** Direktori `spec/indeks/bahan/` memuat dua jenis
berkas: indeks zat (`000.json`) dan pecahan luapan merek
(`opsub00000102-merek-00.json`) yang dikunci menurut **kadar**, bukan menurut id zat.
Membacanya sebagai satu jenis menerbitkan **67 halaman bernama `tanpa-nama-480 g/L`** —
dengan spasi dan garis miring di dalam URL-nya. Itu sebabnya angka bahan v0.3 (1.192)
lebih besar dari yang benar (1.125). Pemeriksa jalur aneh sekarang ikut jalan setelah tiap
bangunan.

**Yang dilaporkan alatnya, termasuk yang tidak enak dibaca:** 2.438 baris penggunaan
berlabel tampil **tanpa tautan OPT** karena OPT-nya tidak punya berkas di indeks (barisnya
tetap ditampilkan — menghilangkannya akan membuat daftar penggunaan produk tampak lebih
pendek daripada labelnya), 22 baris penggunaan di luar batas 120 per halaman, dan 247
halaman hama yang daftar kartunya diringkas.

**Badan menutup S2.** 3.136 halaman, tanpa satu pun yang gugur: tiap badan memegang
setidaknya satu pendaftaran, dan tiap kunci lolos pemeriksaan bentuk. Satu rekaman per
**badan**, bukan per registri — 19 badan memegang pendaftaran di kedua sisi, dan
memecahnya akan membelah daftarnya jadi dua halaman yang masing-masing tampak setengah
benar.

**Keputusan yang paling penting di template ini soal apa yang TIDAK ditulis.** 151 badan
membawa pengaya dari riset web — grup induk, negara asal, situs resmi, merek payung —
dan seluruhnya **tingkat D**: laporan agen riset, bukan registri. Di layar ia tampil
lengkap dengan lencana tingkatnya dan alasan kenapa D, persis seperti di
`app/principal.js`, dengan tautan keluar ber-`nofollow`. Di **data terstruktur ia absen
sama sekali**: menuliskan situs hasil riset sebagai `url` atau `sameAs` pada `Organization`
berarti menyatakannya kepada mesin sebagai fakta terverifikasi, sementara halaman yang
sama menyatakan kepada manusia bahwa ia belum diverifikasi. Dua pernyataan yang
bertentangan tentang satu fakta adalah bentuk paling halus dari berbohong, dan pemeriksa
keluaran sekarang menegakkannya: nol dari 400 halaman badan yang diperiksa membocorkan
pengaya ke JSON-LD-nya.

**Ongkosnya:** 23.610 berkas, 216 MB mentah, **8 detik** sekali bangun, deterministik.
Ukuran ter-gzip **p50 3,0 KB · p90 3,5 KB · maksimum 12,5 KB**. Ditambah 903 baris produk
dan varietas yang ditahan di luar batas 150 per tabel, dan disebutkan di halamannya.

---

## 6c. S3, dan gerbang yang memakan 89 dari 92 wilayah

**Indeksnya berubah di tengah pekerjaan.** Sesi lain membangun ulang `spec/indeks/`
(cap `6f32c743b2d2` → `3c17c4de9fca`) dan seri harga bertambah dari 92 jadi 96. Angka di
bawah diukur ulang atas cap yang baru; cacah registri intinya tidak berubah sama sekali —
7.724 pestisida, 7.196 pupuk, 11.227 varietas, 3.136 badan.

| Template | Terbit | Terindeks | Yang menentukan |
|---|---|---|---|
| harga | 55 | **55** | 41 seri di luar misi dibuang — baja ringan, besi beton |
| toko | 3 | **3** | gerbang ≥5 entri beralamat memakan 89 dari 92 wilayah |
| sediaan | 34 | **31** | 12 resep + 21 bahan + 1 induk; 3 bahan terlalu tipis |

**Gerbang toko bekerja persis seperti yang dijanjikan, dan hasilnya sedikit.** Yang lolos
hanya Batang (67 dari 72 entri beralamat), Lebak (14 dari 31), dan Pandeglang (11 dari
57). **2.156 titik tidak punya alamat di luar nama kabupatennya** dan karena itu tidak
ditampilkan sama sekali. Itu bukan kegagalan template; itu pengukuran lubang datanya
dengan angka. Halaman berisi 47 nama telanjang memang pantas kalah dari listicle berisi 7
nama beralamat, dan menerbitkannya hanya akan memindahkan kekalahan itu ke domain sendiri.

**Harga: `lastmod` diambil dari tanggal DATA, bukan tarikan registri.** Seri ini berubah
harian, dan menyamakan keduanya akan membuat 55 halaman berbohong ke arah yang berlawanan
dengan 20 ribu lainnya. Grafiknya dirakit sebagai **SVG sebaris**, dititik-dibulatkan satu
desimal supaya keluarannya tetap deterministik — halaman harga utuh sebelum satu baris
skrip berjalan, sesuatu yang tidak dimiliki satu pun dari delapan dasbor pemda di §3.

**Komentar seri diterbitkan hanya kalau ia dihitung, bukan ditulis model.** 49 seri
membawa komentar, dan seluruhnya `sumber: terhitung` — diturunkan dari angkanya sendiri
dan lolos pemeriksa. Nol ditulis model hari ini, jadi nol yang ditahan; gerbangnya tetap
terpasang untuk saat komentar model masuk. Yang tidak disembunyikan: **nol dari 49 pernah
ditinjau orang**, dan tiap halaman menyebutnya sendiri — kalimat itu dihitung, bukan
ditulis orang, dan belum ditinjau siapa pun.

**Jalur 6 membuka dengan pasalnya, bukan dengan resepnya.** Halaman sediaan pengendali
menempatkan kartu hukum di posisi pertama dengan gaya tabrakan, menandai `own_use_only`
tebal, mengutip Pasal 75 dan Pasal 77 ayat (1) apa adanya, dan menutup dengan kalimat yang
diwarisi dari `app/jalur-6.js`: halaman ini **tidak menyimpulkan bahwa memakainya aman
atau sah**, karena bacaan pasalnya belum dijawab penasihat hukum.

**Ongkos seluruhnya:** 23.713 berkas, 232 MB mentah, deterministik, dengan ter-gzip p50
3,1 KB dan maksimum 12,6 KB. Nol tautan internal putus dari 23.700 halaman.

---

## 6d. Editorial: prosanya ditulis, angkanya dibangkitkan

Lima belas tulisan tidak bisa diturunkan dari indeks, karena isinya **argumen** — dan
argumen memang ditulis. Yang tetap dibangkitkan: **tiap bilangan di dalamnya**. Prosa yang
mengetik angkanya sendiri akan basi diam-diam, dan halaman yang basi diam-diam persis yang
dilawan seluruh dokumen ini. Jadi kalimat seperti *"99 label dipakai lebih dari satu
takson"* membaca `angka.labelTumpuk` yang dihitung ulang tiap bangunan; kalau registrinya
berubah, kalimatnya ikut berubah atau bangunannya yang salah — tidak ada keadaan ketiga.

**Tiap halaman menyebut dasarnya.** Bukan "menurut kami", melainkan `docs/` mana yang
argumennya diturunkan — `docs/16` untuk harga eceran, `docs/13` untuk memo Pasal 77,
`LISENSI.md` untuk cara mengutip. Argumennya bisa ditelusuri ke keputusan yang sudah
tercatat, bukan ke tulisan yang muncul begitu saja di halaman publik.

**Satu kekeliruan tertangkap justru saat menulisnya.** Peta kosakata OPT menggabungkan
registri (1.360) dengan OPT terkurasi yang ditulis sendiri, dan prosa yang membacanya
menulis *"registri pestisida mencatat 1.370 OPT"* — mengklaim sepuluh tulisan sendiri
sebagai catatan kementerian. Petanya dipisah, dan angkanya kembali ke 1.360. Menulis
kalimat memaksa memeriksa asal angkanya dengan cara yang tidak dilakukan tabel.

**`FAQPage` hanya dipasang kalau jawabannya benar-benar dipegang**, `Article` membawa
lisensi CC BY-SA dan `dateModified` dari tarikan sumbernya, dan `llms.txt` ikut terbit —
mesin jawaban dianggap pembaca kelas satu, dengan satu syarat yang memang syarat
lisensinya: atribusi, beserta tanggal tarikan.

---

## 6e. Gerbang tinjau untuk editorial

Halaman registri menyajikan ulang fakta registri. Halaman editorial **berargumen dengan
suara platform**, dan itu naik satu tingkat risikonya. Disiplin yang sudah berlaku di
tempat lain — komentar harga tulisan model tidak diterbitkan sampai ditinjau orang —
sekarang berlaku juga untuknya.

**Prosanya pindah keluar dari alat.** Selama ia tinggal di dalam `bangun-halaman.mjs`, ia
tidak punya rekaman, tidak punya `content_hash`, dan karena itu tidak ada tempat
menempelkan tinjauan. Sekarang ia koleksi kosakata di
[`spec/vocab/editorial.json`](../spec/vocab/editorial.json) dengan skemanya sendiri —
memakai `key` alih-alih `op:` id, mengikuti preseden `nama-lokal`: sebuah tulisan bukan
hal yang ada di dunia, dan menambah blok prefiks ID untuk itu menukar kaidah yang mahal
dengan kemudahan yang murah.

**Tiga keadaan, satu aturan.**

| Keadaan | Kapan | Akibat di halaman |
|---|---|---|
| `belum` | tidak ada kontributor ber-peran `reviewer` | terbit, `noindex,follow`, pita di kepala layar, tidak masuk sitemap |
| `kedaluwarsa` | ada peninjau, tetapi `reviewed_hash` tidak lagi cocok dengan isi sekarang | sama, dengan pita yang menyebut siapa dan kapan tinjauannya, serta bahwa ia menunjuk isi yang lama |
| `ditinjau` | peninjau bernama + `reviewed_at` + `reviewed_hash` cocok | diindeks, masuk sitemap |

Halaman induknya ikut digerbangi: induk yang terindeks sementara seluruh isinya `noindex`
cuma mengirim perayap ke jalan buntu.

**Yang membuat gerbang ini bukan formalitas: angkanya tidak ikut di-hash.** Prosa menyimpan
penanda `{{jalur.medan}}`, dan indeks mengisinya tiap kali halaman dibangun. Akibatnya
persis yang dibutuhkan — harga cabai bergerak **tidak** menggugurkan tinjauan, karena
angkanya bukan bagian dari isi yang dibaca peninjaunya. Yang menggugurkannya perubahan
argumennya sendiri, sampai satu kata: mengganti *"Yang sama"* jadi *"Yang sama persis"*
pada satu tulisan yang sudah ditinjau langsung memindahkannya ke `kedaluwarsa` dan
mencabutnya dari indeks. Diuji, lalu berkasnya dikembalikan.

**Alur tinjaunya satu perintah**, karena yang benar harus juga yang paling mudah:

```bash
node spec/tools/tinjau.mjs --tambah spec/vocab/editorial.json \
  --rekaman batas--isi-yang-sama --nama "..." --peran reviewer --benturan none
```

`tinjau.mjs` sebelumnya menolak koleksi — ia hanya menulis ke dokumen tunggal, supaya
jelas rekaman mana yang ditinjau. Bendera `--rekaman` mempertahankan maksud itu (rekamannya
tetap harus ditunjuk) tanpa memaksa penyuntingan tangan pada bagian yang justru paling
mudah keliru: pasangan L35 dan sematan hash-nya. Perbaikan itu berlaku juga untuk
`nama-lokal` dan koleksi lain.

**Yang tidak dilakukan gerbang ini:** menaikkan tingkat bukti. Menempelkan nama menyatakan
"saya sudah memeriksanya", bukan "buktinya sekarang lebih kuat" — aturan yang sudah
tertulis di kepala `tinjau.mjs` dan tidak diubah di sini.

---

## 7. Teknis, di bawah batas lapangan yang sudah ada

- **`spec/tools/bangun-halaman.mjs`** — deterministik, tanpa stempel waktu, kunci
  terurut, sama seperti `bangun-indeks.mjs`. Keluaran ke `terbit/`, di-`gitignore`.
- **Anggaran 48 KB per berkas tetap berlaku**, sekarang untuk HTML. Halaman produk
  ter-prerender + CSS yang sudah ada + tanpa font luar sudah jauh di bawahnya.
- **Prerender + pengaya, bukan pengganti.** Halaman terbit berisi jawabannya sebagai HTML;
  `jalur-*.js` tetap memuat pencarian di atasnya. Efek sampingnya: peringatan "pencarian
  butuh JavaScript" berhenti jadi hal pertama yang dibaca pendatang dari mesin pencari.
- **`Cache-Control` di host, bukan di service worker,** yang menentukan kesegaran bagi
  perayap: HTML `max-age=0, must-revalidate`; aset ber-cap `immutable`. Untuk halaman
  harga, ubah `sw.js` jadi jaringan-dulu — pola `adalahMeta()` sudah ada tinggal
  diperluas.
- **`lastmod` sitemap diambil dari `tarikan` di `meta.json`**, bukan dari waktu build.
  Kalau tidak, 20.633 URL akan mengaku berubah tiap hari, dan anggaran rayap habis untuk
  klaim yang tidak benar.
- **Sitemap dipecah per template**, ≤50.000 URL per berkas, dengan `sitemap-index.xml`.
- **`robots.txt`**: izinkan semua; `Disallow: /*?q=`; sebut sitemap. **Perayap mesin
  jawaban tidak diblokir** — lihat §8.
- **Terbit lewat GitHub Actions**: harian untuk harga, dan saat `spec/vocab/` berubah
  untuk sisanya. Registri disegarkan per musim menurut
  [`docs/12-kadensi-registri.md`](12-kadensi-registri.md); halaman yang entitasnya hilang
  dijawab **410**, bukan 404 diam-diam.
- **Bahasa** `id` saja. Tanpa `hreflang` sampai ada bahasa kedua.

---

## 8. Data terstruktur dan mesin jawaban

Dipakai:

| Template | JSON-LD |
|---|---|
| Produk, setara, kandungan | `DefinedTerm` + `isPartOf` ke `DefinedTermSet` registri, `ItemList` untuk merek setara |
| Bahan, OPT, komoditas | `DefinedTerm`, `sameAs` ke pemetaan EPPO/GBIF/AgrO yang sudah ada di kosakata |
| Halaman sumber | `Dataset` + `license` + `creator` + `temporalCoverage` |
| Teks kurasi (gejala, komentar harga) | `Article` + `reviewedBy` + `dateModified`, diisi dari medan peninjau dan tanggal tinjau yang sedang ditegakkan `spec/tools/tinjau.mjs` |
| Halaman dengan blok pertanyaan | `FAQPage` — hanya bila pertanyaannya benar-benar ada di halaman, dan diambil dari "Orang lain juga bertanya" yang nyata |
| Semua | `BreadcrumbList` |

Tidak dipakai: `Product` dengan `offers`, `AggregateRating`, `Review`, dan `Person` untuk
pemulia. Bintang dan harga produk akan membatalkan klaim netralitas lebih cepat daripada
uang principal.

**Mesin jawaban dianggap pembaca kelas satu, bukan pencuri.** Isinya CC BY-SA 4.0; yang
diminta atribusi. Sediakan `llms.txt`, halaman "sumber & cara mengutip", dan biarkan
`spec/indeks/*.json` tetap bisa diambil — itu memang tujuannya. Konsekuensinya dicatat
sejak awal: jawaban AI **mengurangi klik dan menaikkan kutipan**, dan yang diukur karena
itu keduanya (§11). Hari ini belum satu pun kueri yang diperiksa menampilkannya (§3).

---

## 9. Yang hanya bisa ditulis di sini — dan sudah ditulis

Lima belas tulisan beserta satu halaman induk, seluruhnya terbit. Tiap halaman membawa
komponen batas jawaban (B1), menyebut dokumen repositori yang jadi dasarnya, dan
**angkanya dihitung ulang tiap kali halaman dibangun** (§6d).

| URL | Isi |
|---|---|
| `/batas/dosis-yang-beredar/` | Empat sumber, empat dosis, satu produk — dan kenapa registri pun tidak seragam |
| `/batas/isi-yang-sama/` | Merek berbeda, isi sama persis; yang tetap berbeda di antaranya |
| `/batas/satu-label-banyak-spesies/` | Satu label registri, ratusan spesies |
| `/batas/dosis-per-tangki/` | Kenapa dosis per hektare tidak diubah jadi per tangki |
| `/batas/izin-berakhir/` | Izin berakhir bukan berarti dilarang — dan tidak disimpulkan mana pun |
| `/batas/gejala-yang-tidak-ada/` | Nol dari 1.360 OPT registri punya deskripsi gejala |
| `/batas/pupuk-palsu/` | Yang bisa dan tidak bisa dibuktikan dari kemasan |
| `/batas/rupiah-per-kg-hara/` | Tiga hal yang tidak boleh dibandingkan |
| `/batas/harga-eceran-bukan-harga-petani/` | "Harga produsen" yang dicatat negara sebenarnya harga pengumpul |
| `/batas/empat-surat-benih/` | Empat surat benih yang bunyinya mirip |
| `/batas/pasal-72-dan-77/` | Kenapa meramu pupuk lapang dan meramu pengendali terikat |
| `/batas/tingkat-bukti/` | Cara membaca tingkat A–D, dan kenapa registri cuma B |
| `/batas/urutan-tidak-bisa-dibeli/` | Kenapa urutannya nomor pendaftaran |
| `/batas/yang-tidak-ada-di-sini/` | Daftar penolakan beserta alasannya satu per satu |
| `/sumber/cara-mengutip/` | Lisensi, sumber, cara mengutip, dan sikap ke perayap mesin jawaban |
| `/batas/` | Induk keempat belasnya |

---

## 10. Tujuh pagar

1. **Urutan tidak bisa dibeli.** Menurut nomor pendaftaran, selamanya. Tidak ada slot,
   tidak ada "disponsori", tidak ada halaman "terbaik".
2. **Tidak ada klaim kemanjuran.** Yang ditayangkan: terdaftar untuk apa, dosis berlabel,
   dan tanggalnya. Ini yang membedakan kita dari seluruh halaman pertama di §3.
3. **Tidak ada kesimpulan hukum.** Larangan dan lingkupnya ditampilkan sebagai dua fakta,
   seperti yang sudah berjalan di jalur 2.
4. **Data pribadi.** Tidak ada halaman orang; nama pemulia tetap di kartu varietas dengan
   `data-nosnippet`, supaya ia tidak diangkat jadi entitas oleh mesin pencari.
5. **Gambar produk.** `gambar_produk/` berasal dari situs principal. Yang diterbitkan
   hanya yang dasar lisensinya jelas; sisanya tidak diindeks dan tidak di-hotlink.
6. **Peta.** Hanya `place_id` yang boleh naik; koordinat Google tidak disimpan dan tidak
   diterbitkan. Titik peta memakai OSM dengan atribusi ODbL.
7. **Tidak ada pelacak.** Termasuk saat trafik mulai menarik untuk dianalisis.

---

## 11. Pengukuran tanpa pelacakan

Sumber: Search Console (verifikasi domain), log host, dan keluaran
`bangun-halaman.mjs` sendiri.

| Angka | Definisi | Kenapa ia, bukan yang lain |
|---|---|---|
| Rasio terindeks | halaman terindeks ÷ halaman terbit, per template | Satu-satunya deteksi dini "halaman kita tipis" |
| Kueri entitas | kueri unik/minggu yang mendarat di halaman entitas, bukan beranda | Membedakan "ditemukan" dari "dicari namanya" |
| Kedalaman | pangsa sesi yang membuka jalur kedua | Bentuk paling awal dari berulang — jembatan ke metrik utara |
| Kutipan mesin jawaban | 20 kueri tetap, diperiksa manusia tiap bulan | Klik akan turun ketika AI Overview sampai ke kueri ini; kutipan yang sebenarnya diperebutkan |
| Antrean pertanyaan tak terjawab | sudah didefinisikan di `docs/11` §4a | Kueri yang mendarat lalu tidak terjawab adalah lubang data, bukan kegagalan SEO |

Yang **tidak** diukur: individu, dan kata yang diketik di kotak pencarian.
Nol tetap bukan kegagalan — konsisten dengan `docs/11` §4.

---

## 12. Urutan kerja

| Fase | Isi | Gate |
|---|---|---|
| **S0 · bisa dirayapi** | Domain, host, sajikan dari akar, `robots.txt`, sitemap 12 halaman, kanonik + `og:` di seluruh `app/*.html`, GSC terpasang | 12 halaman terindeks dalam 14 hari |
| **S1 · halaman jawaban** | 2.580 hama×komoditas + 1.192 bahan + 337 kandungan + 234 komoditas — **4.343 halaman, sudah dibangun**, seluruhnya berstruktur pertanyaan. Nilai per halaman tertinggi, jumlah terkecil, risiko tipis paling rendah | ≥60% terindeks; ≥100 kueri entitas/minggu |
| **S2 · skala penuh** | 11.840 produk + 1.276 setara + 3.136 badan — **seluruhnya sudah dibangun** | Rasio terindeks **tidak turun** di bawah S1. Kalau turun, berhenti menambah — itu tanda tipis |
| **S3 · yang butuh kadensi atau putusan** | 55 seri harga + 3 wilayah toko + 31 sediaan + 16 editorial — **seluruhnya sudah dibangun**; editorial menunggu tinjauan sebelum diindeks | Halaman harga tidak pernah menayangkan tanggal yang lebih tua dari tarikan terakhir |

**PR pertama** — sebagiannya sudah jadi: `spec/tools/bangun-halaman.mjs` menerbitkan
keempat template S1 beserta `robots.txt`, `sitemap-*.xml`, dan `manifest.json`. Yang
belum: domain, host, `.github/workflows/terbit.yml`, dan pemasangan Search Console.

---

## 13. Risiko

1. **Tipis massal.** 20.633 halaman dari data yang sama bisa terbaca sebagai satu templat
   berulang. Gerbang §6 adalah jawabannya, dan gate S2 alat ukurnya.
2. **Sebagian permintaan ada di video, bukan di teks.** Enam dari dua belas kueri dijawab
   karusel video di atas hasil web pertama. Strategi ini tidak bisa merebutnya, dan tidak
   berpura-pura bisa.
3. **Netralitas ditawar.** Begitu halaman produk mendatangkan trafik, principal akan
   menawar penempatan. Jawabannya sudah tertulis di `docs/02`: ditunda sampai dewan
   redaksi bernama dan badan hukum terpisah berdiri.
4. **Registri berubah.** Produk hilang tiap musim. 410, bukan 404 diam-diam.
5. **Penyalin.** CC BY-SA membolehkan menyalin, dan situs salinan bisa mengungguli asli.
   Yang bisa dilakukan: terbit lebih dulu, `lastmod` jujur, atribusi sebagai syarat
   lisensi. Kanonik lintas domain tidak bisa dipaksakan.
6. **Jendela AI Overview.** Belum muncul di dua belas kueri ini. Saat ia muncul, klik pada
   kueri fakta akan terpotong — dan halaman yang sudah dikutip lebih dulu punya posisi
   yang lebih baik daripada yang baru mulai.

**Yang sengaja tidak dilakukan:** tautan berbayar, konten bangkitan mesin untuk ekor
panjang, halaman "terbaik", pelacak, halaman varietas per varietas, dan 41 seri harga di
luar misi.
