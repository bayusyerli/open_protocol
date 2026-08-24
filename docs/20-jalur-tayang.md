# Jalur tayang — dari kosakata ke satu direktori yang bisa diunggah

> Ditulis 24 Agustus 2026, saat audit kesiapan menemukan bahwa situs ini tidak punya satu
> pun langkah yang menyatukan bagian-bagiannya. Tiga bagian masing-masing sudah benar
> sendiri-sendiri; yang tidak ada adalah yang menjadikannya satu situs.

## Kenapa perakitan itu langkah tersendiri

Halaman entitas di `terbit/` menaut `/gaya.css`, `/produk.html`, dan `/manifest.webmanifest`
— artinya ia mengasumsikan permukaan `app/` disajikan **di akar**. Sampai 24 Agustus 2026
tidak ada langkah yang melakukan itu, dan akibatnya `test -f terbit/principal.html` gagal
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

## Dua gerbang yang menghentikan deploy yang bolong

**Domain.** `bangun-halaman.mjs` menolak `--asal` yang bukan http/https, tidak bisa diurai,
atau nama hostnya tidak bertitik — termasuk `domain-anda` dan `localhost`. Build sebelum 24
Agustus 2026 pernah dijalankan dengan placeholder harfiah, dan hasilnya 30 ribu halaman
dengan canonical yang menunjuk domain yang tidak pernah ada. Menolak di awal lebih murah
daripada menulis 30 ribu berkas yang harus dibuang.

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

## Host — belum diputuskan, dan sebagian pilihan sudah tercoret

Rakitannya **42.085 berkas, ±480 MB**. Angka pertama yang menentukan, bukan yang kedua:

| Host | Muat? | Alasan |
|---|---|---|
| Cloudflare Pages | **tidak** | batas 20.000 berkas per deploy — terlewati dua kali lipat |
| GitHub Pages | ya, dengan catatan | batas situs ±1 GB; bandwidth lunak 100 GB/bulan |
| Netlify | ya | tiap publish mengunggah ratusan MB |
| Object storage + CDN (R2/S3) | ya | sync inkremental; paling cocok untuk `terbit/` yang tumbuh tiap musim |

Begitu host diputuskan, langkah unggah menggantikan langkah artefak di workflow; empat
langkah di atasnya tidak berubah sama sekali.

## Header yang harus dipasang host

Dua hal tidak bisa dikirim lewat `<meta>` dan karena itu tidak ada di halaman — keduanya
menunggu host dipilih:

| Header | Nilai | Kenapa |
|---|---|---|
| `Content-Security-Policy` | `frame-ancestors 'none'` | Diabaikan bila lewat `<meta>`; peramban mencetak peringatan lalu melewatinya. Sisa kebijakannya sudah terpasang di halaman dan dijaga `spec/tools/cek-csp.mjs`. |
| `X-Content-Type-Options` | `nosniff` | Menahan peramban menebak tipe berkas dari isinya — relevan karena situs ini menyajikan 9.301 berkas JSON di samping HTML-nya. |

Satu lagi yang layak dipasang begitu URL bercap dipakai: `Cache-Control: immutable` untuk
`/spec/indeks/*.json?v=…`. Pecahan indeks sudah bercap hash, jadi isinya berubah berarti
URL-nya berubah — salinan lama tidak akan pernah terpakai lagi, dan peramban boleh berhenti
bertanya sama sekali. `meta.json` sendiri **tidak** boleh ikut: ia yang menyebutkan capnya.

## Yang masih terbuka

- **Halaman hub per klaster belum ada.** Tidak ada `/produk/`, `/bahan/`, `/tanaman/`, atau
  `/badan/` sebagai halaman induk, sehingga satu-satunya jalan masuk perayap ke 27.623 URL
  entitas adalah sitemap. Halaman sitemap-only diindeks lebih lambat dan menerima nol
  ekuitas tautan dari beranda.
- **`/toko/` masih yatim** — tiga halaman tanpa tautan masuk. `/badan/` dan `/harga/` sudah
  dirajut: 3.135 halaman badan kini dirujuk 17.048 berkas, naik dari nol.
- **`/spec/indeks/` tidak di-Disallow di robots.txt**, sehingga perayap boleh menghabiskan
  anggaran rayapnya pada 9.301 berkas JSON yang bukan halaman.
- **410 untuk entitas yang hilang tiap musim** belum ada; ia butuh konfigurasi host.
