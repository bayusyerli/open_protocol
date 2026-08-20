# Instrumentasi Enam Jalur

> Rancangan · gate fase kedua · 20 Agustus 2026 · Versi **0.1** · Status **usulan**  
> Gate fase kedua berbunyi *ukur repeat use dan waktu ke jawaban*. Sebelum ini tidak ada
> satu pun yang mengukurnya — jadi gate itu tidak bisa dilewati bukan karena hasilnya
> jelek, melainkan **karena tidak ada angkanya**.  
> Tanpa akun · tanpa jaringan · **hanya di peranti** · bergulir 60 hari
>
> Pencatatnya [`app/ukur.js`](../app/ukur.js), layar bacanya [`app/ukur.html`](../app/ukur.html).
> Modul **MI** pada [10-peta-modul.md](10-peta-modul.md).

[00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md) bagian 5 mewajibkan dokumen ini:
*setiap angka yang dipublikasikan harus punya definisi tertulis dan bisa ditelusuri ke
catatan mentah. Tulis definisi itu sekarang, saat belum ada tekanan.* Belum ada tekanan.

---

## 1. Empat batas yang membentuknya

Keempatnya keputusan, bukan keterbatasan teknis, dan tidak boleh dilanggar diam-diam.

1. **Tanpa akun, tanpa identitas.** Tidak ada pengenal pengunjung, sidik peramban, atau
   IP. Lapisan gratis menjanjikan tanpa akun dan janji itu bagian dari yang dijual —
   instrumentasi yang menuntut identitas membatalkannya. Karena `localStorage` sudah
   per-peranti, menambahkan pengenal tidak menambah apa pun kecuali risiko.
2. **Tanpa jaringan.** Pencatatnya tidak pernah `fetch`, tidak pernah `sendBeacon`.
   Tidak ada server aplikasi di arsitektur ini; menambahkannya diam-diam demi telemetri
   akan mengubah sifat produknya.
3. **Tidak boleh merusak jalurnya.** Seluruh baca-tulis dibungkus penjagaan.
   `localStorage` bisa mati di mode privat, penuh, atau ditolak kebijakan. Kalau
   pengukuran gagal, jalurnya tetap jalan — yang diukur lebih penting daripada
   pengukurannya.
4. **Bergulir dan berbatas.** 60 hari terakhir, 50 contoh waktu per jalur. Peranti di
   lapangan sering dipakai bergantian dan ruangnya sempit.

> **Akibat yang harus diterima, bukan ditambal.** Karena tidak dikirim, angka ini hanya
> bisa dikumpulkan dengan **meminta** — lewat layar baca, atas sepengetahuan yang
> memegang peranti. Itu cocok dengan bentuk pilot fase ketiga (satu offtaker, 50–150
> petani, ada petugas lapang), dan tidak cocok untuk mengukur lalu lintas anonim luas.
> Kalau kelak pengiriman dibutuhkan, itu keputusan tersendiri dengan persetujuan
> tersendiri — bukan penambahan diam-diam pada berkas ini.

---

## 2. Definisi tiap angka

Seluruhnya turunan dari satu kunci `localStorage`: `op.ukur.v1`. Kolom terakhir menyebut
asalnya di catatan mentah, sehingga tiap angka bisa ditelusuri balik.

| Angka | Definisi tepat | Asal |
|---|---|---|
| **Dibuka** | Cacah pemuatan halaman jalur itu. Satu pemuatan = satu. Muat ulang dihitung lagi | `hari[tanggal][jalur].buka` |
| **Jawaban** | Cacah penelusuran yang sampai ke layar jawaban, apa pun jenisnya. Jumlah dari isi + nol + tak sanggup | turunan |
| **Isi** | Jawaban berisi — rincian produk, resep, varietas, atau daftar bahan aktif | `…[jalur].isi` |
| **Nol** | Cabang yang sengaja tidak menawarkan produk, mis. *“jangan beli apa pun untuk ini”* pada virus kuning keriting | `…[jalur].nol` |
| **Tak sanggup** | Datanya tidak sanggup menjawab dan layar mengatakannya — nama belum terpetakan, kadar hara tidak berangka, sediaan tanpa kriteria pelepasan | `…[jalur]["tak-sanggup"]` |
| **Gagal** | Pengambilan berkas gagal. Sambungan putus, bukan keputusan layar | `…[jalur].gagal` |
| **Ditinggal** | Penelusuran yang melewati 2 menit; waktunya dibuang dari p50/p90, cacahnya tidak | `…[jalur].ditinggal` |
| **Waktu p50 / p90** | Median dan persentil ke-90 waktu ke jawaban, dari paling banyak 50 contoh terakhir | `ms[jalur]` |
| **Hari sampai ke jawaban** | Cacah tanggal berbeda dengan sedikitnya satu jawaban | turunan dari kunci `hari` |
| **Berulang** | Benar bila *hari sampai ke jawaban* ≥ 2 | turunan |

### Dua definisi yang paling mudah dipelintir

**Repeat use diukur per hari, bukan per kunjungan.** Membuka lima kali dalam satu sore
adalah **satu** hari. Yang menandakan sebuah jalur berguna adalah kembalinya di hari
lain; menghitung per kunjungan akan membuat satu sesi gelisah terlihat seperti kesetiaan.

**Waktu ke jawaban dihitung sejak halaman dibuka,** memakai `performance.now()` yang
berpatokan pada awal navigasi — bukan sejak ketukan pertama. Yang dirasakan di lapangan
adalah tunggu totalnya, termasuk memuat indeks di sinyal buruk, dan mengukur dari ketukan
akan menyembunyikan persis bagian yang paling lambat.

> **Langit-langit dua menit, dan kenapa ia ada.** `performance.now()` menghitung jam
> dinding, termasuk saat halaman dibiarkan terbuka tanpa disentuh. Dari dalam peramban,
> **menganggur tidak bisa dibedakan dari lambat.** Contoh di atas dua menit karena itu
> tidak dipakai menghitung p50 dan p90 — tetapi cacahnya tetap ditampilkan sebagai
> *ditinggal*, bukan dibuang diam-diam. Kalau kolom itu besar, angka waktunya berdiri di
> atas sedikit contoh dan tidak boleh dipercaya sendirian.
>
> Cacat ini ditemukan dengan menjalankannya, bukan dengan membacanya: contoh pertama yang
> tercatat berbunyi 153 detik, seluruhnya waktu halaman menganggur saat diperiksa.

---

## 3. Yang sengaja tidak diukur

| Tidak diukur | Alasan |
|---|---|
| Isi pencarian, produk yang dibuka | Bukan cacah dan lama; ini jejak minat yang bisa mengenali orang di desa kecil |
| Lokasi, peranti, peramban | Tidak satu pun keputusan produk berubah karenanya, dan semuanya bahan sidik |
| Corong per ketukan | Mengukur bagian mana yang ditinggalkan menuntut penelusuran per sesi; belum ada pertanyaan yang membutuhkannya |
| Jumlah pengunjung | Tidak bisa, dan memang tidak diminta gate-nya. Yang diminta repeat use dan waktu |

---

## 4. Nol dan tak sanggup bukan kegagalan

Ini yang paling mudah salah dibaca oleh siapa pun yang membaca angkanya nanti.

Pada jalur-jalur ini, **“tidak ada yang bisa dibeli” dan “registri tidak memuatnya”
adalah jawaban yang benar** — bahkan yang paling bernilai. Cabang nol produk disebut
[03-enam-pintu.md](03-enam-pintu.md) sebagai layar terpenting jalur 1. Memukul-ratakan
ketiganya jadi “berhasil” akan menyembunyikan sinyal, dan memasukkan *tak sanggup* ke
“gagal” akan membuat lubang data terlihat seperti kerusakan produk.

Justru **tak sanggup adalah pengukur lubang data yang paling langsung.** Tiga lubang di
[10-peta-modul.md](10-peta-modul.md) bagian 4 — subsidi, PHI, sifat agronomi — akan
muncul di kolom itu sebagai angka, bukan sebagai dugaan.

---

## 5. Kaitan ke metrik utara

Metrik utara sudah ditetapkan dan sengaja bukan unduhan atau pengguna terdaftar:
**jumlah plot-musim yang dijalankan dengan protokol dan tercatat sampai panen.**

Tidak satu pun angka di dokumen ini metrik utara, dan tidak boleh dinaikkan jadi
penggantinya. Perannya lebih sempit: **membuktikan lapisan rujukan dipakai berulang
sebelum lapisan berbayar dibangun di atasnya.** Satu-satunya jembatan ke metrik utara
adalah *berulang* — retensi hari-ke-hari adalah bentuk paling awal dari retensi
musim-ke-musim, satu-satunya pendukung yang [00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md)
bagian 5 sebut tidak bisa dipalsukan.

---

## 6. Batas yang diketahui

Ditulis di sini supaya tidak perlu ditemukan ulang saat angkanya dibaca.

1. **Per peranti, bukan per orang.** Satu HP dipakai bergantian akan terbaca satu
   pemakai; satu orang dengan dua HP akan terbaca dua.
2. **Membersihkan data peramban menghapus semuanya.** Tidak ada salinan di tempat lain —
   itu memang rancangannya.
3. **Hanya peranti yang bisa dijangkau yang bisa dikumpulkan.** Angka pilot adalah
   sampel dari yang mau menunjukkan, bukan sensus.
4. **Mode privat tidak mencatat apa pun,** dan itu tidak terlihat sebagai nol — ia
   terlihat sebagai tidak ada.
5. **Belum ada yang menguji ketepatannya di HP entry-level dengan sinyal buruk,** yang
   justru syarat lapangan yang membentuk seluruh permukaan ini.
