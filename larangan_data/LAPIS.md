# Status larangan per pendaftaran pestisida

Disusun ulang oleh `susun-status.mjs` dari `spec/vocab/substance-pestisida.json`
(blok `hazard`), `spec/vocab/product/pestisida.ndjson`, dan `padanan-bahan-aktif.json`.
Seluruh dasarnya sudah ada di repositori; berkas ini tidak menambah satu pun sumber baru.

## Putusan atas 7.724 pendaftaran

| Putusan | Pendaftaran |
|---|---|
| Dilarang menyeluruh | **0** |
| Dilarang pada lingkup tertentu | **563** |
| Terbatas | **405** |
| Tidak ada larangan tercatat | 6.643 |
| **Tidak bisa diperiksa** | **113** |

Yang terakhir bukan sisa yang belum sempat dikerjakan. Pendaftaran yang bahan aktifnya
tidak terpetakan ke entitas zat mana pun **tidak boleh** jatuh ke keranjang "tidak ada
larangan" — itu lampu hijau palsu, dan ia yang paling merugikan di antara semua
kekeliruan yang mungkin di berkas ini.

## Temuan: 15 pendaftaran yang hari ini tidak menunjukkan peringatan apa pun

15 pendaftaran membawa bahan berstatus dilarang atau terbatas, tetapi tidak punya
blok `composition` sehingga pemeriksaan yang berjalan lewat komposisi melewatinya
seluruhnya. Ia hanya kelihatan setelah tabel padanan bahan aktif berdiri — dan itulah
alasan pekerjaan ini menunggu no. 5.

- `01030120103863` **NOXONE 276 SL** — PARAKUAT DIKLORIDA
- `01030120165575` **PENTAMAX 276 SL*** — PARAKUAT DIKLORIDA
- `01030120165576` **PENTATOP 276 SL*** — PARAKUAT DIKLORIDA
- `01030120206598` **BADRA 276 SL*** — PARAKUAT DIKLORIDA
- `01030120206654` **PENTAPLUS 276 SL*** — PARAKUAT DIKLORIDA
- `01030120206656` **PENTASMART 276 SL*** — PARAKUAT DIKLORIDA
- `01030120206657` **PENTAXONE 276 SL*** — PARAKUAT DIKLORIDA
- `01030120206725` **DIVAXONE 138 SL** — PARAKUAT DIKLORIDA
- `01030120206761` **SERVOXON 140 SL** — PARAKUAT DIKLORIDA
- `01030120206936` **SUQET 276 SL*** — PARAKUAT DIKLORIDA
- `01030120217073` **PAKARMAS 138 SL** — PARAKUAT DIKLORIDA
- `01030120217225` **UPPERQUAT 276 SL*** — PARAKUAT DIKLORIDA
- `01030120248234` **ATURO 276 SL** — PARAKUAT DIKLORIDA
- `01030120248244` **CLEANOUT 373 SL** — Dikuat dibromida
- `01030120248415` **PASUT 276 SL** — PARAKUAT DIKLORIDA

## Tanda registri bukan status produk

Registri menandai **166** pendaftaran dengan kata "Kimia Terbatas", tetapi tandanya ada
di medan `perihal` yang berbunyi *"Permohonan Izin Tetap Baru Kimia Terbatas"* — itu
menerangkan **peristiwa pendaftarannya**, bukan keadaan produknya sekarang.

- 10 bertanda, tetapi bahan aktifnya tidak berstatus apa pun di Permentan 43/2019
- **812 tidak bertanda, padahal bahan aktifnya berstatus** dilarang atau terbatas

Selisih itu bukan kesalahan registri. Tanda itu memang tidak dimaksudkan sebagai status
produk, dan membacanya begitu yang keliru. Kolom `tanda_registri` tetap disimpan apa
adanya supaya bisa dibandingkan, dan tidak pernah dipakai sebagai putusan.

## Larangan berlingkup, bukan larangan menyeluruh

Permentan 43/2019 melarang sebagian bahan hanya pada lingkup tertentu. Meratakannya jadi
"dilarang" menyesatkan ke arah yang berlawanan, dan sama tidak jujurnya dengan lampu
hijau palsu.

- tanaman padi: 563 pendaftaran
- pengelolaan tanaman: 367 pendaftaran
- rumah tangga: 174 pendaftaran
- karantina: 38 pendaftaran
- penyimpanan hasil pertanian: 35 pendaftaran
- prapengapalan: 35 pendaftaran

## Yang tidak dijawab berkas ini

- **Hanya paruh hukum Indonesia.** Sumbernya satu: Permentan No. 43 Tahun 2019. Bahan
  yang dilarang di pasar tujuan tetapi sah di sini — dan sebaliknya — tidak ada di sini
  sama sekali, dan mencampurnya ke kolom yang sama akan menyatukan dua kewenangan yang
  berbeda. Itu paruh pasar, dan ia menunggu keputusan sumbernya sendiri.
- **Bukan nasihat hukum, dan bukan izin.** Yang tercatat status bahan aktifnya menurut
  satu peraturan, beserta kutipan pasalnya. Apakah sebuah penggunaan sah menuntut
  pembacaan izin edarnya sendiri.
- **Kelas bahaya WHO tidak ikut.** Baru satu entitas zat yang punya `who_class`, dan
  satu dari 1.706 bukan cakupan.
- **Belum tersambung** ke permukaan aplikasi: ini berkas turunan, dan yang membacanya
  belum ada.
