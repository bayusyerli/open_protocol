# Open Protocols

Platform penyusun protokol budidaya bagi petani Indonesia — agnostik komoditas,
netral terhadap vendor, dari perencanaan sampai pascapanen.

> Nama masih sementara. Uji merek adalah salah satu keluaran Fase 0.

## Isi repositori

| Jalur | Isi |
|---|---|
| [`docs/00-fondasi-dan-tahapan.md`](docs/00-fondasi-dan-tahapan.md) | Dokumen fondasi: diagnosis, arsitektur tiga lapis, delapan fase beserta gate-nya, konteks regulasi Indonesia, metrik, dan risiko |
| [`spec/`](spec/) | Spesifikasi Lapis 1 (ontologi) v0.1 — skema, kosakata, contoh, pemeriksa, dan uji negatif |
| [`docs/principal-terdaftar.md`](docs/principal-terdaftar.md) | 2.305 principal pemegang pendaftaran pupuk & pestisida, beserta keputusan cakupannya |
| [`docs/01-sediaan-buatan-sendiri.md`](docs/01-sediaan-buatan-sendiri.md) | Riset & standar praktik meramu sendiri — kompos, MOL, bioaktivator, pestisida nabati — beserta tujuh syarat sebuah praktik boleh dianjurkan mesin |
| [`docs/02-tiga-pasar.md`](docs/02-tiga-pasar.md) | Segmentasi, target, dan posisi — kenapa pengguna, pembayar, dan kontributor harus disegmentasi terpisah |
| [`docs/03-enam-pintu.md`](docs/03-enam-pintu.md) | Konsep permukaan baca-saja: enam jalur masuk ke satu registri, aturan lintas jalur, dan lubang datanya |
| [`docs/04-jalur-insiden.md`](docs/04-jalur-insiden.md) | Jalur 1 — masuk dari gejala; kartu bahan+kadar, dan layar nol produk |
| [`docs/05-jalur-produk.md`](docs/05-jalur-produk.md) | Jalur 2 — masuk dari kemasan; 63,5% pestisida identik, dan kasus LARBAN |
| [`docs/06-jalur-hitungan-hara.md`](docs/06-jalur-hitungan-hara.md) | Jalur 3 — rupiah per kilogram hara, dan tiga hal yang tidak boleh dibandingkan |
| [`docs/07-jalur-keabsahan-benih-bibit.md`](docs/07-jalur-keabsahan-benih-bibit.md) | Jalur 4 — empat surat yang bunyinya mirip, dan kenapa sisi bibit lebih berbahaya |
| [`docs/08-jalur-sediaan-pupuk.md`](docs/08-jalur-sediaan-pupuk.md) | Jalur 5 — sisi yang lapang: di luar rezim pendaftaran lewat Pasal 72, tidak menunggu apa pun |
| [`docs/09-jalur-sediaan-pengendali.md`](docs/09-jalur-sediaan-pengendali.md) | Jalur 6 — sisi yang terikat: Pasal 77 melarang mengedarkan dan menggunakan, menunggu pendapat hukum |

Kosakata sudah terisi: **15 skala fase dengan 868 fase** — empat belas kunci BBCH dari
monografnya (Solanaceae, padi, jagung, kedelai, kentang, kopi, cucurbit, brassica, buncis,
kacang tanah, dan lainnya) plus satu skala umur budidaya udang — ditambah 67 jenis tindakan,
57 variabel, 23 cara aplikasi, 10 OPT cabai terkurasi, dan 11 alasan simpangan.

Di atasnya, seluruh registri resmi Kementan sudah masuk: **14.920 produk terdaftar** —
7.724 pestisida dengan 23.058 penggunaan berlabel, dan 7.196 pupuk — beserta **1.399
substansi pestisida** (1.706 termasuk yang sudah digantikan penggabungan), 1.360 OPT, dan
906 komoditas. Registri varietas menyusul dengan **11.227 varietas**, 52,4% di antaranya
mewarisi skala fase lewat komoditasnya.

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
enam jalur masuk ke registri yang sudah dipegang, seluruhnya bisa dibangun dari data hari ini.
Rancangannya di [`docs/03-enam-pintu.md`](docs/03-enam-pintu.md) beserta enam dokumen jalurnya.
