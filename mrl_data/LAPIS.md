# MRL Codex, dan sambungannya ke registri Indonesia

Disusun ulang oleh `susun.mjs` dari panen `tarik-codex.mjs`.

> **Ini Codex, bukan hukum Indonesia.** Batas resmi Indonesia ada di SNI 7313 dan teksnya
> berbayar; belum ada di repositori ini. Angka di bawah acuan internasional yang
> diselaraskan banyak pasar tujuan — berguna memperkirakan apakah panen akan ditolak
> **pembeli**, bukan untuk menyatakan apa yang sah di sini.

## Isi

| | |
|---|---:|
| Bahan aktif di basis data Codex | 240 |
| Baris MRL (bahan × komoditas) | **6.490** |
| Sudah diadopsi (`CXL`) | 6.490 — seluruhnya |
| Komoditas berbeda | 470 |

## Sambungan ke registri Indonesia

Lewat tabel padanan bahan aktif — nama kanonik maupun induk garamnya. Tanpa no. 5,
penyilangan ini cuma bisa mencocokkan yang ejaannya kebetulan sama.

| | |
|---|---:|
| Bahan Codex yang juga terdaftar di Indonesia | **140** dari 240 |
| Nama ISO berbeda di registri Indonesia | 416 |
| Di antaranya punya MRL Codex | 157 |
| Baris MRL yang menyentuh bahan terdaftar | **4.575** |
| Bahan bersambung yang punya baris MRL | 140 |

## Temuan: 259 bahan terdaftar tanpa satu pun MRL Codex

Bahan yang beredar di sini tetapi tidak punya angka acuan internasional sama sekali.
Menyemprotkannya bukan pelanggaran — tetapi tidak ada angka yang bisa dipakai
memperkirakan apakah panennya akan ditolak pembeli, dan tidak ada yang bisa diukur
laboratorium terhadap apa pun.

- **mancozeb** — 323 formulasi terdaftar
- **chlorpyrifos** — 296 formulasi terdaftar
- **glufosinate-ammonium** — 268 formulasi terdaftar
- **dimefluthrin** — 254 formulasi terdaftar
- **atrazine** — 189 formulasi terdaftar
- **metsulfuron-methyl** — 188 formulasi terdaftar
- **dimehypo** — 172 formulasi terdaftar
- **cymoxanil** — 145 formulasi terdaftar
- **pymetrozine** — 124 formulasi terdaftar
- **nitenpyram** — 121 formulasi terdaftar
- **prallethrin** — 115 formulasi terdaftar
- **gibberellic acid** — 108 formulasi terdaftar
- **diuron** — 106 formulasi terdaftar
- **transfluthrin** — 106 formulasi terdaftar
- **fentin acetate** — 100 formulasi terdaftar

Nama Codex yang berbentuk kelompok — `Cypermethrins (including alpha- and zeta-
cypermethrin)` — diterima sebagai nama tunggalnya **hanya bila tunggalnya benar-benar
tertulis di dalam kurungnya**. Yang menyatakan kesetaraan itu Codex sendiri, bukan
penebakan bentuk jamak. Tanpa aturan itu, sipermetrin dan parakuat terbaca seolah tidak
punya MRL sama sekali — dan keduanya punya.

## Yang tidak dijawab tabel ini

- **Batas Indonesia sendiri.** SNI 7313 berbayar. Sampai ia masuk, tabel ini menjawab
  pertanyaan pasar, bukan pertanyaan hukum.
- **Apakah angkanya bisa dibandingkan langsung dengan label.** Tidak selalu: label
  menuliskan kadar **garam**, MRL dinyatakan dalam bentuk ion atau asam. Kolom
  `definisi_residu` membawa rumusannya per bahan, dan faktor kesetaraan garam→induk ada
  di tabel padanan — keduanya harus dibaca sebelum satu angka dibandingkan dengan angka
  lain.
- **Apakah ada yang bisa mengukurnya.** Hanya **17 laboratorium** di seluruh Indonesia
  yang ruang lingkupnya menyebut residu pestisida, dan pada lingkup terurai per parameter
  hanya 2. Batas tanpa alat ukur adalah aturan yang tidak bisa diperiksa siapa pun —
  lihat `docs/22-apa-yang-membuat-panen-ditolak.md`.
- **Belum tersambung** ke `spec/vocab/`: masih berkas data, belum entitas.
