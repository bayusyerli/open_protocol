# Lisensi

> Keputusan · 20 Agustus 2026 · menutup butir **M0** pada
> [`docs/10-peta-modul.md`](docs/10-peta-modul.md)
>
> Rekomendasi di [`docs/00-fondasi-dan-tahapan.md`](docs/00-fondasi-dan-tahapan.md)
> keputusan ke-5 kini **diambil**, bukan lagi usulan.

| Yang mana | Lisensi | Berkas |
|---|---|---|
| **Kode** | Apache-2.0 | [`LICENSE`](LICENSE) |
| **Konten kurasi** | CC BY-SA 4.0 | [`LICENSE-KONTEN`](LICENSE-KONTEN) |
| **Data usaha tani** | bukan milik kami | lihat bagian 3 |

---

## 1. Batasnya bukan "kode versus dokumen"

Naluri pertama adalah memisahkan menurut jenis berkas — `.mjs` kode, `.md` dan
`.json` konten. Itu keliru di repositori ini, karena sebagian besar `.json`-nya
justru **kurasi**, dan sebagian `.md`-nya justru **dokumentasi kode**.

Yang membedakan bukan formatnya, melainkan **apa yang dilindungi**: sebuah alat
yang menjalankan sesuatu, atau sebuah penilaian yang kami tulis.

**Apache-2.0** — segala yang dijalankan:

- `spec/*.mjs`, `spec/tools/**` — pemeriksa, penarik registri, penyusun rencana,
  pemeriksa musim, penyusun bukti, pengekspor
- `app/**.js`, `app/**.html`, `app/gaya.css` — permukaan enam jalur
- `gambar_produk/**` yang berupa skrip

**CC BY-SA 4.0** — segala yang kami putuskan dan tulis:

- `spec/schema/**` — skema JSON. Ini keputusan pemodelan, bukan program
- `spec/vocab/**` — kosakata terkurasi, protokol, skala fase. Termasuk 47 entitas
  yang sudah menyatakan `"license": "CC-BY-SA-4.0"` di dalam dirinya sendiri
- `docs/**` — seluruh dokumen
- `spec/*.md`, `README.md`, dan berkas ini

Kalau sebuah berkas berdiri di antaranya — misalnya alat yang badannya berisi
penalaran panjang — **yang berlaku adalah CC BY-SA untuk prosanya dan Apache-2.0
untuk kodenya.** Keduanya kompatibel untuk dipakai bersama; yang tidak boleh
adalah mengklaim prosanya sebagai milik sendiri.

---

## 2. Tiga hal yang TIDAK kami lisensikan

Ini bagian yang paling mudah salah, dan akibatnya paling mahal.

### Fakta di registri resmi

Repositori ini mencerminkan registri Kementan: **14.920 produk terdaftar**,
**11.227 varietas**, beserta nomor pendaftaran, tanggal berlaku, dan komposisinya.
Angka-angka itu **fakta dari catatan publik pemerintah.** Kami tidak memilikinya
dan karena itu tidak bisa melisensikannya kepada siapa pun.

Yang kami lisensikan CC BY-SA adalah **kurasi di atasnya** — penyatuan ejaan
kembar, pemetaan ke AGROVOC dan Crop Ontology, penataan jadi entitas berpengenal
stabil, definisi yang kami tulis, dan penilaian tentang apa yang datanya tidak
sanggup. Itu karya; nomor pendaftarannya bukan.

Akibat praktisnya: **kalau kamu hanya membutuhkan faktanya, kamu tidak terikat
BerbagiSerupa.** Tarik sendiri dari sumbernya, atau ambil dari sini — keduanya
sah. Yang terikat adalah kalau kamu memakai susunan dan penilaian kami.

### Dokumen pihak ketiga

`docs/Guide-No07-Growth-Stages_Dec19.pdf` adalah **CORESTA Guide N° 7**, terbitan
CORESTA, bukan tulisan kami. Ia dilacak di sini sebagai sumber skala fase
tembakau. Lisensinya milik penerbitnya, dan tidak berubah karena ia ada di
repositori ini.

> Sebelum repositori ini dipublikasikan, hak sebar ulang berkas itu perlu
> diperiksa lebih dulu. Menautkan sumbernya bisa jadi lebih tepat daripada
> menyertakan berkasnya. Catatan yang sama sudah ada di `git notes` pada
> commit yang melacaknya.

### Direktori toko dari registri principal

`toko_data/raw/syngenta*.ndjson` dan turunannya di `toko_data/toko-tani-jawa*`
mencerminkan **direktori pengecer Syngenta Indonesia**, diambil dari endpoint
JSON:API-nya yang terbuka untuk dibaca tanpa autentikasi.

Perlu dibedakan dari registri pemerintah di atas. Nomor pendaftaran pestisida dan
varietas adalah fakta dari catatan publik yang tidak dimiliki siapa pun. Daftar
siapa yang menjual apa di mana **bukan** catatan pemerintah — ia kompilasi yang
disusun perusahaannya sendiri. Bahwa ia bisa dibaca publik tidak dengan sendirinya
membuatnya bebas disebarkan ulang, dan alasan "fakta bukan milik siapa pun" tidak
berlaku sekuat itu di sini.

Karena itu setiap baris membawa kolom `lisensi` yang menyebut pemiliknya, dan kolom
itu ikut sampai ke berkas gabungan — sumbernya bercampur, dan `opendata-jateng`
yang CC-BY memang bebas disebarkan ulang sementara yang ini tidak.

Yang kami lisensikan CC BY-SA tetap hanya **kurasi di atasnya**: pembakuan ejaan
provinsi ke ISO 3166-2:ID, pemindahan 84 baris Banten dan DI Yogyakarta yang salah
arsip, pengenalan koordinat isian otomatis, dan penilaian tentang titik mana yang
tidak layak dipercaya. Isi direktorinya bukan.

> Sebelum kumpulan ini disebarkan ulang sebagai berkas mandiri — bukan ditampilkan
> sebagai rujukan lokasi di dalam aplikasi — hak sebarnya perlu diperiksa lebih
> dulu, seperti berkas CORESTA di atas. Catatan cara pengambilan dan seluruh
> temuan mutu datanya ada di
> [`toko_data/laporan-syngenta.md`](toko_data/laporan-syngenta.md).

### Data usaha tani

Keputusan ke-5 di [`docs/00`](docs/00-fondasi-dan-tahapan.md) berbunyi **data
usaha tani milik petani, bukan milik platform** — dan itu bukan slogan lisensi,
melainkan pernyataan kepemilikan.

`Plot`, `Cycle`, `Step`, beserta pengamatan, dosis, biaya, dan hasil di dalamnya
**milik pemegang lahan.** Repositori ini tidak melisensikannya, tidak
mengklaimnya, dan tidak berhak menyebarkannya. Contoh di `spec/examples/` adalah
data karangan yang dibuat untuk menguji skema, bukan catatan orang sungguhan.

Mekanisme yang memberi isi pada klaim itu ada di
[`spec/tools/ekspor-petani.mjs`](spec/tools/ekspor-petani.mjs): pemegang lahan
bisa mengeluarkan seluruh catatannya beserta kosakata yang dibutuhkan untuk
membacanya, tanpa meminta izin siapa pun. Kepemilikan yang tidak bisa dijalankan
adalah kepemilikan di atas kertas.

---

## 3. Kenapa dua lisensi, bukan satu

Kombinasi ini bukan selera. Keduanya menjawab risiko yang berbeda:

- **Apache-2.0 pada kode** memberi hibah paten eksplisit. Alat yang menghitung
  dosis dan menegakkan netralitas vendor sebaiknya tidak bisa ditarik kembali
  lewat klaim paten.
- **CC BY-SA pada konten** menjaga korpus protokol tetap terbuka. Tanpa
  BerbagiSerupa, sebuah perusahaan bisa mengambil kosakata dan protokol ini,
  memperbaikinya, lalu menutupnya — dan itu persis membatalkan alasan kontributor
  menyumbang. `L3` menegakkan netralitas vendor pada isinya; BerbagiSerupa
  menegakkannya pada penyebarannya.

Keduanya juga syarat masuk **registry Digital Public Goods**, yang disebut
[`docs/00`](docs/00-fondasi-dan-tahapan.md) Fase 7 sebagai sinyal kredibilitas
dan pintu pendanaan.

---

## 4. Cara mengutip

> Open Protocols (2026). Kosakata dan protokol budidaya. CC BY-SA 4.0.

Untuk entitas tertentu, sebutkan pengenalnya — misalnya `op:proto:00000001`
beserta versinya — karena entitas di sini berversi dan bisa direvisi.
