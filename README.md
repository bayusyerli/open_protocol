# Open Protocols

Platform penyusun protokol budidaya bagi petani Indonesia — agnostik komoditas,
netral terhadap vendor, dari perencanaan sampai pascapanen.

> Nama masih sementara. Uji merek adalah salah satu keluaran Fase 0.

## Isi repositori

| Jalur | Isi |
|---|---|
| [`docs/00-fondasi-dan-tahapan.md`](docs/00-fondasi-dan-tahapan.md) | Dokumen fondasi: diagnosis, arsitektur tiga lapis, delapan fase beserta gate-nya, konteks regulasi Indonesia, metrik, dan risiko |
| [`spec/`](spec/) | Spesifikasi Lapis 1 (ontologi) dan **Lapis 2 (protokol)** v0.1 — skema, kosakata, contoh, pemeriksa, dan uji negatif |
| [`app/`](app/) | **Permukaan baca-saja yang sudah berjalan** — keenam jalur ditambah halaman harga komoditas dan profil perusahaan, sebagai berkas statis, tanpa kerangka kerja dan tanpa server aplikasi |
| [`docs/10-peta-modul.md`](docs/10-peta-modul.md) | Peta modul & urutan bangun menurut tiga fase model bisnis: trust layer dan instrumentasi lebih dulu, Lapis 2 sebagai prasyarat fase ketiga, dan tiga fitur yang terhalang lubang data |
| [`docs/11-instrumentasi.md`](docs/11-instrumentasi.md) | Instrumentasi enam jalur: definisi tiap angka, empat batas rancangannya, dan kenapa nol serta tak-sanggup bukan kegagalan |
| [`docs/12-kadensi-registri.md`](docs/12-kadensi-registri.md) | Kadensi penyegaran registri: per musim, siapa menarik dan siapa memeriksa, apa yang dibaca dalam diff, dan rantai yang masih putus |
| [`docs/13-memo-hukum-pasal-77.md`](docs/13-memo-hukum-pasal-77.md) | Memo pertanyaan untuk penasihat hukum: kumulatif atau alternatif pada Pasal 77 ayat (1), dan apa yang berubah menurut jawabannya |
| [`docs/14-tinjauan-gejala.md`](docs/14-tinjauan-gejala.md) | Daftar tinjauan sepuluh teks gejala OPT untuk agronom atau BPTP; dibangkitkan dari kosakata, dengan entri lemah ditandai sendiri |
| [`docs/15-kapabilitas-lintas-pemangku.md`](docs/15-kapabilitas-lintas-pemangku.md) | Riset & benchmarking 21 sistem (9 luar negeri, 12 Indonesia), inventaris 16 keputusan hulu, dan 39 kapabilitas dengan putusan bangun/pinjam/sambung/tunda/jangan per kapabilitas |
| [`docs/16-sumber-harga-komoditas.md`](docs/16-sumber-harga-komoditas.md) | Sumber harga komoditas dipilah menurut lisensi, putusan pinjam/bangun per lapis, dan kenapa "harga produsen" yang dicatat negara sebenarnya harga pengumpul |
| [`docs/18-tinjauan-komentar-harga.md`](docs/18-tinjauan-komentar-harga.md) | Daftar tinjauan 43 komentar harga untuk dibaca manusia; dibangkitkan dari data, dengan entri yang perlu didahulukan ditandai sendiri |
| [`docs/principal-terdaftar.md`](docs/principal-terdaftar.md) | 2.305 principal pemegang pendaftaran pupuk & pestisida, beserta keputusan cakupannya |
| [`docs/01-sediaan-buatan-sendiri.md`](docs/01-sediaan-buatan-sendiri.md) | Riset & standar praktik meramu sendiri — kompos, MOL, bioaktivator, pestisida nabati — beserta tujuh syarat sebuah praktik boleh dianjurkan mesin |
| [`docs/02-tiga-pasar.md`](docs/02-tiga-pasar.md) | Segmentasi, target, dan posisi — kenapa pengguna, pembayar, dan kontributor harus disegmentasi terpisah |
| [`docs/03-enam-pintu.md`](docs/03-enam-pintu.md) | Dokumen payung permukaan baca-saja: enam jalur masuk ke satu registri, aturan lintas jalur, lubang datanya, dan urutan yang ditempuh |
| [`docs/04-jalur-insiden.md`](docs/04-jalur-insiden.md) | Jalur 1 — masuk dari gejala; kartu bahan+kadar, dan layar nol produk |
| [`docs/05-jalur-produk.md`](docs/05-jalur-produk.md) | Jalur 2 — masuk dari kemasan; 63,5% pestisida identik, dan kasus LARBAN |
| [`docs/06-jalur-hitungan-hara.md`](docs/06-jalur-hitungan-hara.md) | Jalur 3 — rupiah per kilogram hara, dan tiga hal yang tidak boleh dibandingkan |
| [`docs/07-jalur-keabsahan-benih-bibit.md`](docs/07-jalur-keabsahan-benih-bibit.md) | Jalur 4 — empat surat yang bunyinya mirip, dan kenapa sisi bibit lebih berbahaya |
| [`docs/08-jalur-sediaan-pupuk.md`](docs/08-jalur-sediaan-pupuk.md) | Jalur 5 — sisi yang lapang: di luar rezim pendaftaran lewat Pasal 72, tidak menunggu apa pun |
| [`docs/09-jalur-sediaan-pengendali.md`](docs/09-jalur-sediaan-pengendali.md) | Jalur 6 — sisi yang terikat: Pasal 77 melarang mengedarkan dan menggunakan, menunggu pendapat hukum |
| [`docs/17-tiga-konsep-ui.md`](docs/17-tiga-konsep-ui.md) | Tiga konsep UI berbeda tesis beserta prototipe yang bisa diklik di [`docs/konsep-ui/`](docs/konsep-ui/): kotak tanya, meja periksa keaslian, dan petak-musim — apa yang tiap konsep taruhkan, dan mana yang direkomendasikan |
| [`docs/19-golongan-resistensi.md`](docs/19-golongan-resistensi.md) | Pemetaan 1.399 bahan aktif ke kode golongan IRAC, FRAC, dan HRAC — sumber & versi tiap skema, bukti kemasan yang menentukan sistem huruf HRAC mana yang dipakai, cakupan per skema, 469 celah beserta alasannya, dan kaveat rotasinya |

Kosakata sudah terisi: **15 skala fase dengan 868 fase** — empat belas kunci BBCH dari
monografnya (Solanaceae, padi, jagung, kedelai, kentang, kopi, cucurbit, brassica, buncis,
kacang tanah, dan lainnya) plus satu skala umur budidaya udang — ditambah 67 jenis tindakan,
57 variabel, 23 cara aplikasi, 54 OPT terkurasi untuk TUJUH komoditas — 13 pintu untuk
padi, 12 tomat, 12 kentang, 11 cabai, 11 bawang merah, 10 jagung, 8 kubis, dengan 12
entri melayani lebih dari satu komoditas sekaligus — seluruhnya bergejala,
masing-masing dengan dua ciri pembanding yang bisa diperiksa sendiri — dan 11 alasan
simpangan.

Di atasnya, seluruh registri resmi Kementan sudah masuk: **14.920 produk terdaftar** —
7.724 pestisida dengan 23.058 penggunaan berlabel, dan 7.196 pupuk — beserta **1.399
substansi pestisida** (1.706 termasuk yang digantikan penggabungan ejaan), **781 OPT**
(1.414 termasuk yang digantikan penyatuan kembar, salah ketik, dan kenaikan ke kosakata
terkurasi), dan **692
komoditas** (906 termasuk yang digantikan penyatuan serumpun). Registri varietas
menyusul dengan **11.227 varietas**, 52,4% di antaranya mewarisi skala fase lewat
komoditasnya.

Di sisi yang sama, **3.136 badan pemegang pendaftaran** kini punya entitasnya sendiri —
perusahaan, balai penelitian, dinas, perguruan tinggi, dan pemerintah daerah — hasil
penyeragaman nama pemegang di **kedua** registri sekaligus. Satu rekaman per badan, bukan
per registri: 19 di antaranya memegang pendaftaran di kedua sisi, dan memecahnya akan
membelah daftar produknya jadi dua halaman yang masing-masing tampak setengah benar. 14.920
dari 14.920 produk tertaut ke pemegangnya.

Pemulia perorangan **sengaja tidak dijadikan entitas**: 576 varietas terdaftar atas nama
orang, dan halaman profil bernama tentang orang adalah pemrosesan data pribadi yang tidak
punya dasar di sini. Namanya tetap tampil di kartu varietasnya; yang tidak dibuat hanyalah
halaman dan tautannya.

Harga komoditas masuk lewat satu-satunya sumber harian yang berlisensi terbuka: **43 seri
harian nasional dari SP2KP Kemendag**, 3 Januari 2024 – 21 Agustus 2026, 26.475 titik,
ditarik dalam **satu permintaan**. Seluruhnya **harga eceran** — bukan harga yang diterima
petani, dan jaraknya terpasang di dalam definisi sumbernya, bukan celah cakupan. Dari 88
varian yang SP2KP terbitkan, 45 **tidak diisi angkanya sama sekali** — termasuk keempat
harga pupuk; keduanya tetap tampil, karena hasil nol terbaca sebagai "tidak ada harganya di
mana pun" padahal yang benar "sumber ini tidak memuatnya".

Di sampingnya berdiri **8 seri harga tingkat pekebun** dari enam provinsi sawit — Aceh, Riau,
Kalbar, Kalteng, Kaltim, dan Babel — hasil penetapan resmi, bukan survei pasar. Dua di
antaranya harga pekebun **swadaya**, yang berada di luar cakupan Permentan 13/2024 dan karena
itu jarang diterbitkan siapa pun. Tak satu pun dari keenam provinsi menerbitkannya sebagai
data terbaca mesin selain Kalbar: sisanya prosa berita atau gambar, dan tiga di antaranya
dibaca lewat OCR.

`npm run all` memeriksa 30.422 dokumen; 99,5% membawa pemetaan ke KEMENTAN, AgrO, ICASA,
EPPO, GBIF, atau BBCH.

Ditarik ulang kapan saja dengan `node spec/tools/tarik-registri.mjs`.

Di sampingnya ada lapis yang tidak punya nomor pendaftaran sama sekali, karena memang
tidak diperjualbelikan: **12 resep sediaan buatan sendiri** dan **21 bahan bakunya** —
kompos, bokashi, kascing, MOL, pupuk organik cair, perbanyakan agens hayati, dan
pestisida nabati. Setiap resep membawa kedudukan hukum, titik kendali, kriteria
pelepasan, dan tingkat buktinya; dua bahan yang lazim dipakai justru masuk daftar
terlarang. Enam aturan pemeriksa baru (`L16`–`L21`) menegakkannya.

## Memeriksa spesifikasi

```bash
cd spec && npm install && npm run all
```

## Menyumbang

Repositori ini publik sejak 23 Agustus 2026, dan pintunya
[CONTRIBUTING.md](CONTRIBUTING.md). Keadaan yang perlu diketahui sebelum masuk: **belum
seorang pun menempelkan namanya pada satu rekaman pun** — nol dari 4.256 rekaman kosakata
kurasi punya peninjau bernama, dan tidak satu pun berstatus `published`.

```bash
node spec/tools/tinjau.mjs        # keadaan tinjauan seluruh korpus
```

Yang melindungi nama peninjau dijelaskan di sana: tinjauan disematkan pada isi yang
benar-benar dibacanya, jadi begitu rekaman itu disunting orang lain, tinjauannya terbaca
kedaluwarsa alih-alih diam-diam menanggung perubahan yang tidak pernah ia baca.

## Catatan tentang `pukpes_data/`

Direktori itu berisi snapshot mentah registri Kementan — CSV dan JSON apa adanya, beserta
README-nya sendiri. **Bukan dibuat dalam sesi penyusunan spesifikasi ini**; muncul di folder
project pada 19 Agustus 2026 dari pekerjaan lain. Isinya dipakai sebagai sumber untuk sisi
pupuk dan sudah disilang-cek dengan tarikan independen: 7.541 dari 7.542 nomor pendaftaran
pestisida identik.

Turunannya kini hidup di `spec/vocab/`, dan penarik ulangnya ada di `spec/tools/`. Direktori
mentahnya sengaja dibiarkan utuh sebagai bukti asal data.

## Arsitektur

Tiga lapis yang sengaja dipisah:

1. **Ontologi** — primitif agnostik komoditas. Ada di `spec/`.
2. **Protokol** — konten dalam per komoditas, berversi, bertingkat bukti. Kosakata
   penyusunnya sudah siap; bentuk protokolnya menunggu wawancara lapangan Fase 1.
   Netralitas vendor membuat protokol berhenti di tingkat hara — kecuali untuk resep
   terbuka, yang boleh disebut utuh karena bukan milik siapa pun.
3. **Eksekusi** — rencana musim, pencatatan realisasi, dan selisih di antara keduanya.
   Primitifnya sudah ada di Lapis 1 (`Step`); aplikasinya belum dibangun.

Di samping ketiganya ada **permukaan baca-saja** yang tidak menuntut pencatatan sama sekali:
enam jalur masuk ke registri yang sudah dipegang. Rancangannya di
[`docs/03-enam-pintu.md`](docs/03-enam-pintu.md) beserta enam dokumen jalurnya, dan
**keenamnya sudah berjalan** di [`app/`](app/).

## Permukaan baca-saja

Enam halaman statis. Tanpa kerangka kerja, tanpa langkah bangun, tanpa server aplikasi —
seluruh jawaban datang dari indeks turunan di `spec/indeks/`, yang bentuknya memang
disusun mengikuti pertanyaan yang akan diajukan tiap layar.

| Halaman | Jalur | Masuk dari |
|---|---|---|
| `app/jalur-1.html` | 1 · insiden | gejala yang terlihat, bukan nama hama |
| `app/index.html` | 2 · produk | nama di kemasan |
| `app/jalur-3.html` | 3 · hitungan | harga yang dibayar |
| `app/jalur-4.html` | 4 · keabsahan | nama varietas |
| `app/jalur-5.html` | 5 · sediaan pupuk | niat menyuburkan |
| `app/jalur-6.html` | 6 · sediaan pengendali | niat mengendalikan — **status hukum, bukan anjuran** |

Syarat lapangannya HP entry-level bersinyal buruk, dan itu yang menentukan bentuk
indeksnya: satu penelusuran utuh mengambil **2 sampai 4 berkas**, 11–151 KB sebelum
gzip, dan **tidak satu pun berkas melewati 48 KB** — anggaran yang ditegakkan
`spec/tools/bangun-indeks.mjs` saat memecahnya.

```bash
node spec/tools/bangun-indeks.mjs --tulis   # indeks turunan, tidak disimpan di repo
python3 -m http.server 8742                 # sajikan dari akar repositori
```

Rinciannya — termasuk apa yang tiap layar sengaja tolak tampilkan — di
[`app/README.md`](app/README.md).
