# Menyumbang ke Open Protocols

Repositori ini dibuka 23 Agustus 2026. Dokumen ini pintunya.

## Keadaan hari ini, dinyatakan lebih dulu

```
Rekaman kosakata      : 4.256
Punya kontributor     : 0
Punya peninjau bernama: 0
Status                : draft 3.143 · superseded 1.113
```

Angka itu keluaran `node spec/tools/tinjau.mjs`, dan tidak dirapikan. **Belum seorang pun
menempelkan namanya pada satu rekaman pun**, tidak ada satu rekaman berstatus `published`,
dan satu-satunya protokol budidaya yang ada — cabai dataran rendah — berhenti di tingkat
bukti D dengan catatan yang menyebut sebabnya:

> Menaikkannya ke C atau B menuntut orang yang mau menempelkan namanya, dan itu pertanyaan
> kelima yang masih terbuka di docs/02 bagian 8.

Jadi bukan datanya yang kurang. Yang kurang orangnya, dan sampai hari ini tidak ada pintu
untuk masuk. Dokumen ini pintu itu.

## Tiga bentuk sumbangan

| Bentuk | Yang Anda kerjakan | Perlu git? |
|---|---|---|
| **Sanggahan** | Menantang satu fakta yang salah | tidak — ada pintunya di tiap layar aplikasi |
| **Tinjauan** | Membaca satu rekaman, lalu menempelkan nama Anda padanya | ya, atau lewat isu |
| **Rekaman baru** | Menyumbang protokol, resep, atau pemetaan yang belum ada | ya |

Sanggahan tidak menuntut nama dan tidak dibahas di sini — pintunya ada di dasar tiap layar
`app/`, di blok "Batas jawaban". Dokumen ini tentang **tinjauan** dan **rekaman baru**,
karena keduanya menuntut nama.

## Kenapa nama, dan apa yang melindunginya

Keberatan yang paling wajar dari siapa pun yang diminta menempelkan namanya bukan soal
waktu. Bunyinya: **"apakah nama saya akan menanggung isi yang tidak pernah saya baca?"**

Tanpa penjagaan, jawabannya ya — rekaman disunting orang lain, nama peninjau tetap di
tempatnya, dan pembaca mengira yang sekarang sudah diperiksa. Tiga hal di repositori ini
membuat jawabannya tidak:

1. **Tinjauan disematkan pada isi yang benar-benar dibaca.** `lifecycle.reviewed_hash`
   menyalin `content_hash` saat tinjauan dicatat. Begitu isinya berubah, hash berubah, dan
   pemeriksa menyatakan tinjauannya **kedaluwarsa** (`L35-tinjauan-tersemat`). Nama Anda
   berhenti berlaku pada perubahan yang tidak Anda baca — otomatis, tanpa Anda perlu
   mengawasi.
2. **Nama dan tanggal wajib bepergian bersama** (`L35-peninjau-bertanggal`). Tidak ada
   tinjauan tanpa peninjau, dan tidak ada peninjau tanpa tanggal.
3. **Riwayatnya publik dan tidak bisa ditulis ulang diam-diam.** Repositori ini publik,
   berlisensi Apache-2.0 untuk kode dan CC-BY-SA-4.0 untuk isi. Sumbangan Anda tidak bisa
   dikurung siapa pun, termasuk oleh pemilik repositori ini.

Yang Anda dapat: atribusi bernama, berafiliasi, ber-ORCID, di korpus terbuka yang bisa
dikutip — dan `spec/tools/ekspor-petani.mjs` yang membuat isinya bisa dibaca tanpa
platform ini sama sekali.

Yang **tidak** Anda dapat, dan sebaiknya dinyatakan sekarang: tidak ada bayaran, tidak ada
janji rekaman Anda akan dipakai orang, dan tidak ada jaminan waktu tanggapan.

## Benturan kepentingan: wajib, satu kata pun cukup

`conflict_of_interest` wajib untuk setiap kontributor — skema menolak yang mengosongkannya.
Tulis `none` bila memang tidak ada. Yang perlu dinyatakan: kepentingan komersial pada
produk, pemegang pendaftaran, atau varietas yang disebut rekaman itu.

Alasannya bukan kecurigaan. Registri ini memuat **3.136 pemegang pendaftaran**, dan
agronom yang bekerja pada salah satunya adalah orang yang paling tahu produknya — justru
orang yang paling ingin kami dengar. Medan ini yang membuat tinjauannya bisa dibaca apa
adanya alih-alih dicurigai belakangan. Medan yang kosong terbaca sebagai "tidak ada
benturan", jadi yang lalai jadi tampak sama dengan yang bersih; itu sebabnya kosong
ditolak.

## Meninjau satu rekaman

```bash
node spec/tools/tinjau.mjs
```

Melaporkan keadaan tinjauan seluruh korpus. Untuk menempelkan nama:

```bash
node spec/tools/tinjau.mjs --tambah spec/vocab/<berkas>.json \
  --nama "Nama Anda" --afiliasi "Institusi" --peran reviewer \
  --benturan "none" --orcid 0000-0000-0000-0000
```

Alat ini menulis kontributor, `lifecycle.reviewed_at`, dan `lifecycle.reviewed_hash`
sekaligus — ketiganya harus konsisten dan menulisnya dengan tangan mudah keliru.

Lalu:

```bash
cd spec && npm run check && npm test
```

**Tinjauan tidak menaikkan tingkat bukti sendiri, dan itu sengaja.** Menempelkan nama
berarti "saya sudah memeriksanya", bukan "buktinya sekarang lebih kuat". Yang menaikkan D
ke C atau B adalah isi tinjauannya, ditimbang orang, lalu ditulis di `evidence_note`
beserta alasannya — bukan efek samping sebuah perintah.

## Menerbitkan: tiga gerbang yang sudah menunggu

Tidak ada rekaman yang berstatus `published` hari ini. Gerbangnya sudah dipasang sejak
sebelum repositori dibuka, dan belum pernah menyala karena belum ada yang mencoba lewat:

- **L31** — tingkat bukti D tidak boleh `published`. Satu pengalaman tunggal bukan anjuran.
- **L31** — tingkat A atau B tanpa `provenance.sources` ditolak.
- **L33** — protokol `published` wajib punya kontributor ber-`role: author` **dan**
  `lifecycle.review_due`. Protokol tanpa penanggung jawab tidak bisa dikoreksi dan tidak
  bisa ditagih siapa pun; protokol tanpa tanggal tinjau ulang akan tetap tayang setelah
  varietas, OPT, dan harga inputnya berubah.

Ketiganya penangkal satu pola kegagalan yang disebut `docs/00-fondasi-dan-tahapan.md`
bagian 1c: *"Package of Practices"* klasik diterbitkan sekali, tanpa penanggung jawab dan
tanpa jadwal tinjau, lalu tidak pernah bisa dikoreksi. Yang membedakan protokol dari PDF
bukan formatnya, melainkan adanya orang yang namanya menempel dan tanggal ia harus dilihat
lagi.

## Menyumbang rekaman baru

1. Baca `spec/README.md` dan skema yang relevan di `spec/schema/`.
2. Klaim rentang nomor lewat `id_blocks` bila jenis entitasnya dipakai lebih dari satu
   berkas — L24 menolak yang tidak, dan L25 menolak rentang yang bertindih. Ini penjagaan
   terhadap kerja paralel, bukan birokrasi.
3. `evidence_tier` **dan** `evidence_note` wajib. Tingkat bukti tanpa alasan adalah klaim
   tanpa dasar; itu aturan tertua di repositori ini dan berlaku untuk semua, termasuk
   pemiliknya.
4. `cd spec && npm run check && npm test` sebelum mengirim.

## Yang tidak diterima

- **Data hasil panen dari direktori berhak cipta.** `toko_data/LAPIS.md` menjelaskan lapis
  mana yang terbit dan mana yang tidak.
- **Data pribadi.** Nomor telepon, alamat, dan surel perorangan tidak masuk. Kekosongan itu
  disengaja dan menunggu mekanisme "klaim toko", bukan penambalan massal.
- **Koreksi titik OpenStreetMap.** 234 titik toko datang dari OSM; perbaikannya milik OSM.
  Yang ditampung di sini jadi salinan ketiga yang basi begitu OSM diperbarui.
- **Rekomendasi merek.** Lihat `docs/15-kapabilitas-lintas-pemangku.md` bagian 7.

## Pertanyaan yang belum terjawab, dan Anda jawabannya

Pertanyaan kelima di `docs/02-tiga-pasar.md` bagian 8 berbunyi: *apa yang membuat agronom
institusi mau menempelkan namanya pada protokol yang bisa direvisi orang lain.*

Dokumen `docs/15` menyatakan pertanyaan itu tidak akan terjawab lewat wawancara — ia
terjawab dengan menyediakan alurnya, lalu melihat siapa yang datang. Alurnya sekarang ada.
Halaman ini akan tahu jawabannya dari siapa yang lewat, bukan dari siapa yang ditanya.
