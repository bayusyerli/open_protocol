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

## 2. Empat hal yang TIDAK kami lisensikan

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

### Direktori toko dari OpenStreetMap

234 titik toko tani di `toko_data/toko-tani-jawa.ndjson` — dan halaman `/toko/`
yang diturunkan darinya — berasal dari **OpenStreetMap** dan tunduk pada
**ODbL 1.0**, bukan CC BY-SA.

Keduanya sama-sama berbagi-serupa, dan justru itu yang membuatnya mudah salah:
**ODbL menular ke basis datanya**, sedangkan CC BY-SA menular ke karyanya.
Turunan basis data OSM tidak bisa direlisensikan CC BY-SA oleh kami, dan siapa
pun yang mengambil lapis toko dari sini terikat ODbL — termasuk kewajiban
menyebut **© Kontributor OpenStreetMap** dan membuka basis data turunannya.

Atribusinya sudah terpasang di permukaan dan di metadata sumber. Yang tidak boleh
disimpulkan: bahwa lisensi repositori ini menggantikannya.

Dua lapis toko lainnya berdiri sendiri dan dijelaskan di
[`toko_data/LAPIS.md`](toko_data/LAPIS.md): 2.181 alamat dari arsip TTI Kementan
(karya pemerintah), 67 dari Batang (CC-BY), dan lapis principal yang **tidak
terbit sama sekali** karena lisensinya tidak mengizinkannya.

### Dokumen pihak ketiga

**CORESTA Guide N° 7** adalah terbitan CORESTA, bukan tulisan kami; ia dipakai
sebagai sumber skala fase tembakau. Lisensinya milik penerbitnya, dan tidak
berubah karena ia pernah ada di repositori ini.

> **Status per 24 Agustus 2026:** berkas PDF-nya sudah dikeluarkan dari pohon
> kerja, karena hak sebar ulangnya tidak pernah diperiksa dan repositori ini
> sudah publik sejak 23 Agustus. Yang dipakai sekarang rujukannya, bukan
> salinannya.
>
> Menghapusnya dari pohon kerja **tidak** mengeluarkannya dari riwayat git: ia
> masih bisa diambil dari commit lama. Membersihkan riwayat menulis ulang seluruh
> SHA dan menuntut koordinasi dengan tiap klon dan cabang, jadi ia keputusan
> pemilik repositori — bukan sesuatu yang boleh dijalankan diam-diam.

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

> Pranatani (2026). Kosakata dan protokol budidaya. CC BY-SA 4.0.

Untuk entitas tertentu, sebutkan pengenalnya — misalnya `op:proto:00000001`
beserta versinya — karena entitas di sini berversi dan bisa direvisi.
