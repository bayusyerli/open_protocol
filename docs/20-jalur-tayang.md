# Jalur tayang — dari kosakata ke satu direktori yang bisa diunggah

> Ditulis 24 Agustus 2026, saat audit kesiapan menemukan bahwa situs ini tidak punya satu
> pun langkah yang menyatukan bagian-bagiannya. Tiga bagian masing-masing sudah benar
> sendiri-sendiri; yang tidak ada adalah yang menjadikannya satu situs.

## Kenapa perakitan itu langkah tersendiri

Halaman entitas di `terbit/` menaut `/gaya.css`, `/produk.html`, dan `/manifest.webmanifest`
— artinya ia mengasumsikan permukaan `app/` disajikan **di akar**. Sampai 24 Agustus 2026
tidak ada langkah yang melakukan itu, dan akibatnya `test -f terbit/perusahaan.html` gagal
sementara 14.920 halaman produk menautnya. Diunggah apa adanya, seluruh navigasi, gaya, dan
skrip di 30 ribu halaman akan 404, dan situsnya terindeks sebagai halaman rusak.

Empat sumber, satu akar:

| Sumber | Jadi | Isi |
|---|---|---|
| `app/` | `/` | permukaan — halaman, modul, gaya, 1.986 gambar |
| `spec/indeks/` | `/spec/indeks/` | data yang dibaca permukaan itu |
| `terbit/` | `/` | 30.739 halaman entitas, 12 sitemap, robots.txt, llms.txt |
| `sw.js` | `/sw.js` | service worker |

Ketiga lapis sepakat memakai **jalur mutlak**: `pustaka.js` mengambil dari `/spec/indeks`,
`sw.js` menyaring cakupan dengan `/spec/indeks/`, dan halaman terbitan menaut `/gaya.css`.
Satu-satunya yang tidak bisa disimpulkan sendiri adalah letak berkas permukaan — ia di
`/app/` saat pengembangan dan di akar saat terbit — jadi halaman yang mendaftarkan service
worker menyematkan direktorinya sendiri sebagai query, dan `sw.js` membacanya dari sana.

## Menjalankannya

```
cd spec && npm ci && npm run all                                    # gerbang mutu
node spec/tools/bangun-indeks.mjs --tulis                            # kosakata → indeks
node spec/tools/bangun-halaman.mjs --tulis --asal=https://pranatani.com
node spec/tools/rakit-situs.mjs                                      # rakit + periksa
```

Keluarannya `_situs/` — 42 ribu berkas, ±480 MB, siap diunggah apa adanya. Isinya hardlink
ke tiga direktori di atas, jadi ia tidak memakan ruang dua kali dan tidak pernah jadi sumber
kebenaran. Pakai `--salin` bila tujuannya menyeberangi berkas sistem.

Urutannya tidak bisa ditukar: halaman dibangun dari indeks, dan perakitan menuntut keduanya
sudah ada. Ketiganya menolak berjalan bila prasyaratnya belum ada, dengan menyebut perintah
yang kurang.

## Tiga gerbang yang menghentikan deploy yang bolong

**Domain.** `bangun-halaman.mjs` menolak `--asal` yang bukan http/https, tidak bisa diurai,
atau nama hostnya tidak bertitik — termasuk `domain-anda` dan `localhost`. Build sebelum 24
Agustus 2026 pernah dijalankan dengan placeholder harfiah, dan hasilnya 30 ribu halaman
dengan canonical yang menunjuk domain yang tidak pernah ada. Menolak di awal lebih murah
daripada menulis 30 ribu berkas yang harus dibuang.

**Cap service worker.** `rakit-situs.mjs` menghitung sidik isi seluruh berkas cangkang yang
terangkut, lalu menuliskannya sebagai `VERSI` ke salinan `sw.js` di rakitan — sumbernya
tetap berbunyi `dev`. Cangkang disajikan cache-first, dan yang membebaskannya cuma nama
cache yang berubah; selama nama itu berupa angka yang dinaikkan orang, ia tertinggal. Empat
kali berturut-turut CI menolak push karena isi berubah sementara versinya tidak, tiap kali
berpola sama: versi dinaikkan, `app/` disunting lagi, keduanya ikut satu commit — sekali di
antaranya oleh orang yang memasang pagarnya. Cap yang lahir sesudah penyalinan terakhir
tidak bisa didahului suntingan, jadi kelas kesalahan itu hilang alih-alih dijaga. Merakit
ulang tanpa perubahan menghasilkan cap yang sama, sehingga pengguna tidak mengunduh ulang
700 KB tanpa alasan.

**Tautan.** `rakit-situs.mjs` mencocokkan **tiap** `href` dan `src` mutlak di seluruh HTML ke
berkas yang benar-benar ikut terangkut — 414.350 tautan pada rakitan 24 Agustus 2026 — dan
gagal dengan kode bukan nol bila ada satu saja yang menggantung, sambil menyebut berapa
halaman merujuknya. Gerbang ini langsung membuktikan dirinya: ia menangkap sebuah penggantian
nama yang keliru mengubah nama berkas keluaran, bukan cuma tautannya, pada 27.492 halaman.

Yang diperiksa hanya jalur mutlak. Tautan relatif berpindah bersama berkasnya; jalur mutlak
menyatakan asumsi tentang bentuk situs, dan asumsi itulah yang pernah salah.

## CI

`.github/workflows/situs.yml` menjalankan keempat langkah di atas pada tiap push ke `main`,
tiap pull request, dan atas permintaan (dengan domain yang bisa diganti). Runner mulai dari
klon bersih, jadi **sumber yang lupa di-commit membuat build di sini gagal** — bukan enam
bulan kemudian saat mesinnya diganti. Itu bukan kekhawatiran teoretis: uji pertama dari pohon
bersih menghasilkan tiga halaman lebih sedikit daripada build lokal, dan selisihnya persis
klaster `/toko/`, yang dua berkas sumbernya memang belum pernah di-commit.

Pull request tidak mengunggah artefak: yang perlu diketahui sebuah PR adalah apakah ia
membangun dan tautannya utuh, bukan salinan situsnya.

## Host — dibandingkan dengan harga, 29 Agustus 2026

Rakitannya **41.852 berkas, ±480 MB**. Angka pertama yang menentukan, bukan yang kedua:
setengah gigabyte praktis gratis di mana pun, sedangkan 42 ribu berkas menabrak batas
platform dan mengisi kuota permintaan.

Tiga skenario di bawah memakai 8 halaman per kunjungan × 40 KB dan 5 permintaan HTTP per
tampilan halaman, dengan 95% terlayani dari edge.

| Opsi | 1.000 kunjungan/bln | 50.000 | 500.000 | Catatan |
|---|---|---|---|---|
| **Cloudflare R2 + CDN** | **$0** | **$0** | **$0** | 10 GB simpan gratis, egress gratis tanpa batas, 41.852 tulis/build masuk kuota 1 juta Class A |
| Backblaze B2 + Cloudflare | $0 | $0 | $0 | setara; menuntut merangkai CNAME + Transform Rule agar rutenya benar |
| DigitalOcean Spaces | $5 | $5 | $5 | datar dan bisa diramalkan; 1 TiB transfer termasuk |
| AWS S3 (Jakarta) + CloudFront | $0,06 | $0,10 | $12,46 | CloudFront punya Always Free 1 TB + 10 juta permintaan/bln, permanen |
| Cloudflare Pages (Pro) | $25 | $25 | $25 | **muat** — batas 20.000 berkas hanya paket Free; berbayar 100.000 |
| GCS + Cloud CDN | $18,37 | $21,17 | $46,87 | terbebani $18,25/bln tetap untuk forwarding rule, jalan meski trafik nol |
| Netlify | $0 (Free) | $9 | ~$48 | Free menjeda situs saat 300 kredit habis — risiko padam mendadak |

**Cloudflare punya empat PoP di Indonesia** — Jakarta, Denpasar, Malang, Yogyakarta — dan
itu menjawab langsung syarat lapangan nomor satu permukaan ini. AWS punya delapan di
Jakarta. PoP DigitalOcean daftarnya identik dengan Cloudflare, yang mengisyaratkan ia
ditenagai Cloudflare, tetapi DigitalOcean tidak menyatakannya.

### Dua kekhawatiran yang tidak terbukti

**Cloudflare Pages tidak tercoret.** Batas 20.000 berkas hanya berlaku di paket Free;
dokumentasi 16 Juli 2026 menyatakan paket berbayar memuat hingga 100.000 berkas per situs
dengan `PAGES_WRANGLER_MAJOR_VERSION=4`. Ia muat — hanya sepuluh kali lebih mahal daripada
R2 yang nol.

**Biaya operasi saat sync penuh bukan jebakan.** Mengunggah ulang seluruh 41.852 berkas
berharga $0,19–$0,21 sekali jalan, dan pada kadensi 3×/tahun itu ~$0,05/bulan. Ketakutan
ini tidak boleh mendorong pemilihan platform.

### Yang justru menagih

Permintaan, bukan bandwidth. CloudFront melayani 160 GB gratis tetapi menagih $12 untuk 10
juta permintaan berlebih. Perayapan menambah permintaan, bukan bandwidth: Googlebot yang
menyapu 41.852 URL sebulan sekali menambah 41.852 permintaan dan ~480 MB egress — tak
berarti di R2, tetapi ikut mengisi kuota CloudFront.

**Putusan yang disarankan: Cloudflare R2 + CDN Cloudflare.** Nol rupiah pada ketiga
skenario, PoP terdekat dengan pembaca, satu penyedia saja, dan "egress gratis" adalah janji
produk — bukan janji kemitraan yang bisa berubah sepihak seperti pada jalur B2.

Begitu host diputuskan, langkah unggah menggantikan langkah artefak di workflow; empat
langkah di atasnya tidak berubah sama sekali.

## Menayangkannya — Cloudflare R2, dan lima langkah yang hanya bisa dikerjakan orang

Diputuskan 29 Agustus 2026. CI sudah membawa rakitan sampai ke R2 dan men-deploy
Worker-nya; yang di bawah ini tidak bisa dijalankan runner karena menuntut akun.

**1. Buat bucket, sekali seumur hidup.**

```
npx wrangler r2 bucket create pranatani-situs
```

Sengaja tidak dijalankan CI: pembuatan bucket yang berulang tiap deploy adalah operasi
yang menunggu untuk gagal pada hari seseorang salah ketik namanya.

**2. Setel empat rahasia** di Settings → Secrets and variables → Actions:

| Rahasia | Isinya |
|---|---|
| `CF_ACCOUNT_ID` | id akun Cloudflare |
| `CF_R2_ACCESS_KEY_ID` | token R2, izin Object Read & Write |
| `CF_R2_SECRET_ACCESS_KEY` | pasangannya |
| `CLOUDFLARE_API_TOKEN` | token dengan izin Workers Scripts:Edit |

Tanpa keempatnya, langkah deploy **dilewati** dan build tetap hijau — supaya fork dan
kontributor tidak melihat kegagalan yang bukan urusannya.

**3. Arahkan nameserver `pranatani.com` ke Cloudflare** dari dasbor Rumahweb. Sampai
zonanya aktif, langkah berikutnya akan menolak.

**4. Pasang rute Worker** sesudah zonanya hidup — buka `worker/wrangler.toml`, cabut
komentar pada blok `[[routes]]`. Ia sengaja dikomentari: menaruhnya lebih awal membuat
deploy gagal selama nameserver-nya belum diarahkan.

**5. Serahkan sitemap** ke Google Search Console dan Bing Webmaster Tools:
`https://pranatani.com/sitemap-index.xml`.

### Kenapa Worker, padahal R2 sudah bisa dijadikan publik

**R2 bukan hosting situs statis.** Ia menyajikan objek menurut kunci yang persis:
`GET /produk/larban-500-50-ec/` mencari objek bernama `produk/larban-500-50-ec/` yang tidak
pernah ada — yang ada `.../index.html`. Seluruh 30 ribu halaman entitas berbentuk begitu,
jadi tanpa `worker/situs.js` semuanya 404.

Worker itu juga satu-satunya tempat tiga hal berikut bisa dipasang: pengalihan 301 dari
jalur tanpa garis miring (supaya satu halaman tidak punya dua URL yang sama-sama menjawab
200), header `frame-ancestors` dan `nosniff` yang diabaikan bila lewat `<meta>`, dan
`Cache-Control` menurut jenis isi — pecahan indeks bercap dapat `immutable` setahun,
sedangkan `meta.json` yang menyebutkan cap itu tidak pernah di-cache. Logikanya dikunci
**24 uji** di `spec/tools/uji-worker.mjs`, dengan R2 disulih Map.

### Kenapa bukan Workers Static Assets

Ia menangani pemetaan direktori dan pengalihan secara bawaan, dan permintaannya gratis
tanpa batas — tetapi menuntut Workers Paid begitu berkasnya lewat 20.000, dan situs ini
41.852. Itu $5 per bulan sejak hari pertama. R2 pada trafik awal benar-benar nol, dan
permintaan Worker masih di dalam kuota gratis 100.000 per hari. Pindah ke sana layak
dipertimbangkan ketika permintaan Worker mulai ditagih; struktur berkasnya sama persis,
jadi ongkos pindahnya kecil.

## Header yang harus dipasang host

Dua hal tidak bisa dikirim lewat `<meta>`. **Keduanya kini dipasang `worker/situs.js`**
sejak host diputuskan; tabel ini tinggal sebagai catatan alasannya, bukan pekerjaan yang
menunggu:

| Header | Nilai | Kenapa |
|---|---|---|
| `Content-Security-Policy` | `frame-ancestors 'none'` | Diabaikan bila lewat `<meta>`; peramban mencetak peringatan lalu melewatinya. Sisa kebijakannya sudah terpasang di halaman dan dijaga `spec/tools/cek-csp.mjs`. |
| `X-Content-Type-Options` | `nosniff` | Menahan peramban menebak tipe berkas dari isinya — relevan karena situs ini menyajikan 9.301 berkas JSON di samping HTML-nya. |

Satu lagi yang layak dipasang begitu URL bercap dipakai: `Cache-Control: immutable` untuk
`/spec/indeks/*.json?v=…`. Pecahan indeks sudah bercap hash, jadi isinya berubah berarti
URL-nya berubah — salinan lama tidak akan pernah terpakai lagi, dan peramban boleh berhenti
bertanya sama sekali. `meta.json` sendiri **tidak** boleh ikut: ia yang menyebutkan capnya.

## robots.txt, dan tiga sakelar yang berbunyi sama

Selama beberapa jam pada 30 Agustus 2026 — sejak zona aktif sampai sore hari yang sama —
`https://pranatani.com/robots.txt` mengembalikan 72 baris, dan hanya 11 di antaranya
ditulis proyek ini. Cloudflare menyisipkan blok "Managed content" di atasnya berisi
`Disallow: /` untuk sembilan perayap dan `Content-Signal: search=yes,ai-train=no`,
bertentangan langsung dengan kalimat yang ditulis beberapa baris di bawahnya: "Registri
terbuka." Blok itu disisipkan di tepi jaringan, **sesudah** Worker menjawab; tidak ada
baris di repositori ini yang bisa mencabutnya.

Ia sudah dimatikan. Yang dilayani sekarang persis yang dihasilkan `bangun-halaman.mjs`.

Bagian ini tetap ditulis karena dua hal yang tidak terbaca dari kode mana pun.

**Cloudflare menyalakannya sebagai bawaan zona baru.** Tidak ada yang memilihnya di sini.
Kalau kelak ada zona lain, atau berkas ini tiba-tiba berisi larangan yang tidak ditulis
siapa pun, sebabnya kemungkinan besar ini.

**Tiga kendali berbunyi hampir sama, dan hanya satu yang menulis berkasnya.** Membedakan
ketiganya memakan beberapa putaran, dan dua yang pertama sempat dimatikan tanpa mengubah
`robots.txt` sedikit pun — sepuluh pemeriksaan dalam sepuluh menit, tidak bergerak.

| Kendali | Letak | Yang dilakukannya |
|---|---|---|
| AI Crawl Control → Crawlers | AI Crawl Control | Allow/block per perayap lewat WAF. **Tidak menulis robots.txt.** |
| Block AI bots *(usang 15 Sep 2026)* | Security → Settings | Aturan WAF; **benar-benar menolak lalu lintas**. Tidak menulis robots.txt. |
| "Set your preference to block training in robots.txt" | Security → Settings, saring *Bot traffic* | **Hanya ini** yang menulis teksnya. |

Dua yang terakhir ada di halaman yang sama dan sama-sama menyebut *block training* — di
situlah kekeliruannya bersarang. Yang kedua jauh lebih berat akibatnya: ia memblokir
permintaan, bukan menuliskan permintaan agar tidak dirayapi.

Satu perbedaan yang perlu dipegang: `robots.txt` adalah **permintaan** yang boleh
diabaikan perayap; dua kendali WAF itu **penegakan**. Melihat larangan di `robots.txt`
lalu menyimpulkan lalu lintasnya diblokir — atau sebaliknya — adalah dua kesalahan yang
sama besar.

Mematikan sakelar ketiga mencabut deretan `Disallow` **dan** komentar Content Signals
sekaligus, selama situs punya `robots.txt` sendiri. Situs ini punya, jadi kendali terpisah
"Display Content Signals Policy" di halaman Overview tidak perlu disentuh.

## Yang masih terbuka

- **Halaman hub per klaster belum ada.** Tidak ada `/produk/`, `/bahan/`, `/tanaman/`, atau
  `/badan/` sebagai halaman induk, sehingga satu-satunya jalan masuk perayap ke 27.623 URL
  entitas adalah sitemap. Halaman sitemap-only diindeks lebih lambat dan menerima nol
  ekuitas tautan dari beranda.
- **`/toko/` masih yatim** — tiga halaman tanpa tautan masuk. `/badan/` dan `/harga/` sudah
  dirajut: 3.136 halaman badan kini dirujuk 17.048 berkas, naik dari nol.
- **`/spec/indeks/` tidak di-Disallow di robots.txt**, sehingga perayap boleh menghabiskan
  anggaran rayapnya pada 9.301 berkas JSON yang bukan halaman.
- **410 untuk entitas yang hilang tiap musim** belum ada; ia butuh konfigurasi host.
