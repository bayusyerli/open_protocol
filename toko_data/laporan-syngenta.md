# Laporan panen Syngenta Indonesia

Sumber: `https://www.syngenta.co.id/jsonapi/node/distributor` — Drupal JSON:API, terbuka
untuk dibaca, tanpa autentikasi. Diambil 22 Agustus 2026, 74 halaman, 3653 baris
se-Indonesia.

Pengambilan dijalankan dari sesi peramban (lihat `ambil-syngenta.js`): host-nya berada di
belakang tantangan Cloudflare dan curl polos selalu mendapat HTTP 403 pada semua jalur.

Diambil se-Indonesia lalu disaring ke Jawa di sini, bukan lewat parameter provinsi di API.
Itu yang membuat dua temuan di bawah kelihatan; menyaring di sisi server akan
menyembunyikan keduanya.

## Hasil

| Berkas | Isi | Baris |
|---|---|---|
| `raw/syngenta.ndjson` | Jawa, koordinat lolos uji — dibaca `gabung.mjs` | **1605** |
| `raw/syngenta-tanpa-koordinat.ndjson` | Jawa, koordinat hilang atau diragukan | **217** |
| `raw/syngenta/audit-luar-jawa.ndjson` | di luar Jawa | 1831 |
| `raw/syngenta/distributor-mentah.ndjson` | panen apa adanya | 3653 |

Jawa seluruhnya: **1822** baris.

## Temuan 1 — Banten dan DI Yogyakarta ada, hanya salah arsip

Registri ini tidak punya satu pun baris berprovinsi "Banten" atau "DI Yogyakarta", dan
faset di situsnya pun tidak menawarkan keduanya. Bukan berarti tidak ada pengecer di sana:
barisnya diarsipkan di bawah provinsi tetangga. Banten memisahkan diri dari Jawa Barat
pada 2000 dan label provinsinya tidak pernah ikut diperbarui.

| Provinsi sebenarnya | Tercatat sebagai | Baris | Kabupaten |
|---|---|---|---|
| Banten | Jawa Barat | 60 | Cilegon, Lebak, Pandeglang, Serang, Tangerang |
| DI Yogyakarta | Jawa Tengah | 24 | Bantul, Gunung Kidul, Kulon Progo, Sleman |

Yang memutuskan adalah nama kabupaten, bukan koordinat — nama itu tetap ada pada baris
yang koordinatnya hilang atau semu. Baris yang dipindahkan membawa kolom `dasar_koreksi`
yang menyebutkan alasannya, dan `provinsi_sumber` tetap menyimpan tulisan aslinya.

## Temuan 2 — koordinat isian otomatis

`-7.150975,110.1402594` dipakai oleh **135** baris se-Indonesia yang tersebar di
29 kabupaten dan 3 provinsi. Titik itu bukan alamat, melainkan isian otomatis.
Ia jatuh di dalam kotak Jawa Tengah, jadi tanpa pemeriksaan ini 135 kios Jawa Timur,
Bali, dan Jawa Tengah akan menumpuk di satu titik di Jawa Tengah dan tetap kelihatan sah.

Titik semacam itu dikenali dari datanya sendiri, bukan dari daftar yang ditulis tangan:
sebuah koordinat yang persis sama dan dipakai lintas kabupaten pasti isian otomatis,
sedangkan dua kios yang digeokode ke titik desa yang sama tetap satu kabupaten. Di seluruh
panen ada **20** titik seperti itu, menandai **141**
baris Jawa. Titik berulang yang tetap di dalam satu kabupaten TIDAK ditandai — ada 70 titik
semacam itu di Jawa, dan menandainya akan membuang geokode yang masuk akal.

## Yang ditandai ragu
Koordinat yang bertentangan dengan wilayah yang tertulis tidak dibuang dan tidak dipercaya:
barisnya tetap lengkap dengan nama, alamat, dan telepon di
`raw/syngenta-tanpa-koordinat.ndjson`, dengan kolom `ragu` yang menyebut sebabnya.

| Sebab | Jumlah |
|---|---|
| koordinat-bersama | 141 |
| tanpa-koordinat | 72 |
| provinsi-tak-cocok | 4 |

## Jawa per provinsi
Setelah pemindahan Banten dan DIY di atas.

| Provinsi | Titik dipercaya | Ragu | Jumlah |
|---|---|---|---|
| Banten | 48 | 12 | 60 |
| DKI Jakarta | 4 | 0 | 4 |
| Jawa Barat | 420 | 1 | 421 |
| Jawa Tengah | 499 | 68 | 567 |
| DI Yogyakarta | 16 | 8 | 24 |
| Jawa Timur | 618 | 128 | 746 |
| **Jumlah** | **1605** | **217** | **1822** |

## Ejaan provinsi apa adanya di sumber
Kode dua huruf ternyata ISO 3166-2:ID tanpa awalan `ID-`; `JT` = Jawa Tengah. Semua kode
yang muncul sudah tercakup tabel di `ambil-syngenta.mjs`; tidak ada `BT` (Banten) maupun
`YO` (DI Yogyakarta) sama sekali.

| Nilai administrative_area | Jumlah |
|---|---|
| Jawa Timur | 746 |
| Jawa Tengah | 589 |
| Sumatera Utara | 505 |
| Jawa Barat | 481 |
| LA | 231 |
| Sulawesi Selatan | 206 |
| Sumatera Selatan | 165 |
| Nusa Tenggara Barat | 96 |
| Sumatera Barat | 89 |
| Sulawesi Tengah | 79 |
| AC | 62 |
| Kalimantan Barat | 60 |
| Sulawesi Tenggara | 59 |
| BA | 44 |
| GO | 38 |
| Kalimantan Timur | 37 |
| RI | 28 |
| Kalimantan Selatan | 24 |
| JA | 24 |
| Sulawesi Utara | 22 |
| Kalimantan Tengah | 18 |
| BE | 14 |
| Sulawesi Barat | 12 |
| Nusa Tenggara Timur | 9 |
| Kepulauan Bangka Belitung | 5 |
| DKI Jakarta | 4 |
| JT | 2 |
| PA | 1 |
| SS | 1 |
| SB | 1 |
| SU | 1 |

## Kelengkapan bidang
Dihitung atas 1822 baris Jawa. `field_emails` dan `postal_code` ada di skema
tetapi kosong di SEMUA baris — jangan dihitung sebagai sumber kontak.

| Bidang | Terisi |
|---|---|
| alamat | 1822 |
| telepon | 1822 |
| kabupaten | 1822 |
| koordinat lolos uji | 1605 |
| surel | 0 |
| kode pos | 0 |

## Tingkat pengecer
`field_business` hanya punya dua nilai; artinya tidak dijelaskan di situsnya.

| Tingkat | Jumlah |
|---|---|
| Retailer 2 | 1540 |
| Retailer 1 | 282 |

## Kabupaten teratas di Jawa
| Kabupaten | Jumlah |
|---|---|
| Indramayu | 65 |
| Grobogan | 62 |
| Bojonegoro | 61 |
| Karawang | 57 |
| Banyuwangi | 56 |
| Tuban | 56 |
| Garut | 54 |
| Brebes | 54 |
| Jember | 54 |
| Probolinggo | 49 |
| Ponorogo | 40 |
| Malang | 38 |
| Subang | 36 |
| Kediri | 36 |
| Blora | 33 |
| Pati | 32 |
| Pemalang | 31 |
| Bekasi | 29 |
| Pasuruan | 29 |
| Lamongan | 29 |

## Catatan pemeriksaan yang sengaja TIDAK dipasang
Kotak provinsi saling tumpang tindih dengan pulau seberang: kotak Jawa Timur melewati
Selat Bali sampai ke Jembrana dan Buleleng, kotak Banten melewati Selat Sunda sampai ke
Lampung Selatan. Aturan "tertulis di luar Jawa tapi titiknya di kotak Jawa" karena itu
dicoba lalu dibuang — 13 baris yang ditangkapnya semuanya benar-benar Bali dan Lampung,
tidak satu pun kios Jawa yang salah label. Baris Jawa yang salah label ditemukan lewat
nama kabupaten (Temuan 1), yang tidak punya masalah itu.

## Menunggu diklaim pemiliknya
`field_emails` dan `postal_code` kosong di seluruh registri, dan 217 baris Jawa
belum punya titik yang layak dipercaya. Keduanya tidak bisa ditambal dari sumber lain:
surel dan kode pos hanya pemiliknya yang tahu, dan menebak koordinat dari alamat justru
akan menutupi masalahnya. Keduanya menunggu alur "klaim toko Anda".

Yang paling masuk akal didahulukan adalah 217 baris di
`raw/syngenta-tanpa-koordinat.ndjson`: nama, alamat, dan teleponnya sudah lengkap, jadi
pemiliknya bisa dihubungi lebih dulu dan yang diminta cuma menaruh pin. `gabung.mjs`
mengumpulkannya bersama kios tanpa titik dari sumber lain ke
`toko-tani-jawa-tanpa-titik.ndjson`.

Yang 141 baris bertitik semu perlu diperlakukan berbeda dari
yang 72 baris tanpa koordinat sama sekali: keduanya butuh pin
baru, tapi yang pertama akan tampak sudah punya lokasi kalau kolom `ragu` diabaikan.

## Lisensi
Isi registri ini hak cipta Syngenta dan **tidak** berlisensi terbuka. Dipakai sebagai
rujukan lokasi di dalam aplikasi, bukan untuk diterbitkan ulang sebagai kumpulan data
mandiri. Tiap baris membawa kolom `lisensi` yang menyatakan hal itu, dan kolom itu ikut
sampai ke berkas gabungan. Bandingkan dengan `opendata-*` yang CC-BY dan boleh disebarkan
ulang. Duduk perkaranya ditulis di [`LISENSI.md`](../LISENSI.md), bagian
"Direktori toko dari registri principal".
