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

Kosakata sudah terisi: 63 fase BBCH Solanaceae, 67 jenis tindakan, 57 variabel, 23 cara
aplikasi, 10 OPT cabai, dan 11 alasan simpangan. Di atasnya, seluruh registri resmi Kementan
sudah masuk: **1.593 bahan aktif** dan **14.920 produk terdaftar** — 7.724 pestisida dengan
23.058 penggunaan berlabel, dan 7.196 pupuk. Totalnya 16.677 entitas, 99% terkait ke
KEMENTAN, AgrO, ICASA, EPPO, atau BBCH.

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
