# Kadensi Penyegaran Registri

> Keputusan · 20 Agustus 2026 · menutup butir **M0** pada
> [10-peta-modul.md](10-peta-modul.md)
>
> **Per musim.** Penyuluh yang menarik, pemilik repositori yang memeriksa.

Registri yang basi pada lapisan gratis bukan sekadar tidak akurat — **ia menyatakan
produk terdaftar padahal izinnya sudah lewat.** Alatnya sudah ada sejak awal; yang belum
ada adalah kesepakatan tentang kapan ia dijalankan dan siapa yang membaca hasilnya.
Dokumen ini menutup keduanya.

---

## 1. Kapan "per musim" itu

Terikat **jendela tanam**, bukan kalender — aturan yang sama dipakai
[02-tiga-pasar.md](02-tiga-pasar.md) untuk seluruh tahapannya.

Tariknya **sebelum jendela tanam dibuka**, bukan sesudah. Alasannya: rencana musim
disusun di awal jendela lewat `spec/tools/susun-rencana.mjs`, dan rencana yang dibangun
di atas registri basi akan membawa produk yang izinnya sudah lewat sepanjang musim.
Menariknya sesudah tanam berarti menemukan kekeliruan setelah ia terlanjur dipakai.

Untuk beachhead cabai yang siklusnya 90–120 hari, itu jatuh sekitar **tiga kali setahun**.

---

## 2. Rantai yang sebenarnya, beserta putusnya

Ini bagian yang paling penting dibaca sebelum menjalankan apa pun.

| Langkah | Alat | Menulis ke | Dibaca oleh |
|---|---|---|---|
| 1 · tarik | `spec/tools/tarik-registri.mjs` | `data-registri/` | **— tidak ada** |
| 2 · **jembatan** | **belum ada** | `pukpes_data/raw/` | langkah 3 |
| 3 · turunkan | `isi-komposisi-pupuk.mjs`, `dedup-komposisi-pestisida.mjs` | `spec/vocab/product/*.ndjson` | pemeriksa |
| 4 · periksa | `npm run all` | — | manusia |

> **Rantainya putus di langkah 2, dan putusnya tidak terlihat.** Penarik menulis
> `data-registri/pestisida.json` dan `data-registri/pupuk.json`. Alat turunannya membaca
> `pukpes_data/raw/pestisida_terdaftar.json` dan `pukpes_data/raw/pupuk_terdaftar.json`.
> **Direktorinya berbeda dan nama berkasnya juga berbeda,** dan tidak ada satu pun alat
> yang menjembatani keduanya.
>
> Akibatnya persis jenis kegagalan yang paling sulit ditangkap: penarik berjalan mulus,
> berkas baru benar-benar muncul, tidak ada galat — dan **kosakata tidak berubah sama
> sekali.** Yang menjalankannya akan yakin registrinya sudah segar.
>
> Sampai jembatannya ditulis, langkah 2 dilakukan tangan dan **wajib diperiksa**:
>
> ```
> data-registri/pestisida.json     ->  pukpes_data/raw/pestisida_terdaftar.json
> data-registri/pupuk.json         ->  pukpes_data/raw/pupuk_terdaftar.json
> data-registri/pupuk-legacy.json  ->  pukpes_data/raw/pupuk_terdaftar_legacy.json
> ```
>
> `data-registri/` ada di `.gitignore`, jadi tarikan mentahnya memang tidak masuk
> repositori — hanya turunannya yang dilacak.

---

## 3. Prosedur

**Penyuluh — menarik.**

```bash
node spec/tools/tarik-registri.mjs
```

Endpoint SIMPEL bersifat publik; skrip hanya melakukan apa yang dilakukan peramban biasa
saat membuka halaman datanya. Tidak ada kredensial, tidak ada yang dilewati. Kalau skrip
berhenti dengan *"Portal tidak memberi cookie sesi"*, struktur situsnya berubah — itu
laporan, bukan kegagalan yang harus diakali.

Lalu salin ketiga berkas menurut tabel di bagian 2, jalankan alat turunannya, dan
`npm run all`. Kirimkan keluaran `npm run all` beserta `git diff --stat` apa adanya.

**Pemilik repositori — memeriksa.** Yang diperiksa bukan "apakah skripnya jalan",
melainkan empat hal di bagian 4. Tidak ada yang di-commit sebelum pemeriksaan itu selesai.

---

## 4. Yang dibaca dalam diff

Urut menurut kerusakan kalau terlewat.

1. **Pendaftaran yang hilang sejak tarikan terakhir.** Inilah alasan seluruh kadensi ini
   ada. Produk yang izinnya kedaluwarsa atau dicabut akan lenyap dari tarikan baru, dan
   lapisan gratis akan berhenti menyatakannya terdaftar. Kalau tidak ada satu pun yang
   hilang pada tarikan lintas musim, itu justru mencurigakan — periksa apakah tarikannya
   benar-benar baru.
2. **Perubahan komposisi pada nomor pendaftaran yang sama.** Kadar berubah tanpa nomor
   berubah berarti jalur 3 menghitung rupiah per kg hara dari angka lama.
3. **Pendaftaran baru.** Paling tidak berbahaya, tetapi menentukan cakupan jalur 1 dan 2.
4. **Perubahan bentuk nomor atau nama pemegang.** Menandakan struktur registrinya
   berubah, dan itu bisa membuat penyatuan ejaan di kosakata meleset diam-diam.

> **Kenapa yang hilang lebih penting daripada yang datang.** Aturan `G12` di
> `gambar_produk/periksa.mjs` menemukan hal yang berlaku juga di sini: **nomor
> pendaftaran yang kedaluwarsa berbentuk sah persis seperti yang masih hidup.** Tidak ada
> yang janggal untuk dilihat, tidak ada yang menyalak, dan satu-satunya cara mengetahuinya
> adalah membandingkan dengan tarikan baru. Itulah pekerjaan pemeriksaan ini.

---

## 5. Kalau tidak dijalankan

Bukan kerusakan yang meledak, melainkan pembusukan yang diam. Setiap musim yang terlewat
menambah selisih antara yang dinyatakan layar dan yang benar di registri, dan selisih itu
**hanya bertambah ke satu arah** — pendaftaran kedaluwarsa jauh lebih sering daripada
terbit ulang.

Liabilitasnya sudah ditulis di [10-peta-modul.md](10-peta-modul.md) bagian M0: layar
menyatakan sebuah produk terdaftar, seseorang membelinya atas dasar itu, lalu
menyemprotkannya.

---

## 6. Dua ketegangan yang diketahui

**Penyuluh tidak dibayar untuk ini.** [02-tiga-pasar.md](02-tiga-pasar.md) menempatkan
penyuluh pada P2 dengan catatan tegas: *"tidak dibayar untuk memakai produk ini. Tiap
kolom yang kita minta adalah kerja tambahan tanpa imbalan."* Menarik registri per musim
adalah kerja tambahan itu. Selama jembatan di bagian 2 masih dilakukan tangan, bebannya
lebih berat lagi — dan **menulis jembatan itu adalah cara paling langsung mengurangi
beban yang tidak dibayar siapa pun.** Prioritaskan itu sebelum meminta musim kedua.

**Pemeriksaan bertumpu pada satu orang.** Pemilik repositori satu-satunya pemeriksa. Itu
sah selama masih satu orang yang memutuskan, tetapi ia titik tunggal — dan yang gagal
bukan kodenya, melainkan perhatiannya. Kalau satu musim terlewat tanpa ada yang sadar,
yang perlu diperbaiki adalah pengingatnya, bukan orangnya.
