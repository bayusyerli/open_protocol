# Hitungan Hara

> Rancangan · jalur ketiga · pupuk  
> Petani membandingkan **per karung**. Yang menentukan **per kilogram hara**. Selisih di antara keduanya adalah markup yang tidak terlihat siapa pun.  
> Bentuk **kalkulator, bukan layar insiden** · Data **5.130 pupuk berkomposisi**  
>
> Diekstrak dari dokumen konsep HTML dengan judul sama, 20 Agustus 2026.
> Isi, angka, dan tabelnya utuh; simulasi yang bisa diklik tidak ikut —
> alurnya ditulis ulang sebagai teks.
>
> Jalur 3 dari [03-enam-pintu.md](03-enam-pintu.md).

---

## 1. Kenapa bukan layar insiden

Layar insiden dibangun untuk pestisida karena keputusan pestisida memang reaktif: masalah muncul, dan orang butuh jawaban sekarang. Keputusan pupuk bentuknya lain — berkala, terikat anggaran, dan diambil sebelum ada gejala apa pun.

Menempelkan gejala pada pupuk juga berbahaya. Gejala kekurangan hara ambigu, muncul terlambat, dan mudah tertukar dengan penyakit, kekeringan, atau masalah pH. Diagnosis hara berbasis gejala akan salah dengan percaya diri — alasan yang sama kenapa saya menolak pengenal foto untuk OPT.

Yang benar-benar ditanyakan orang di depan kios: **“yang mana yang lebih murah untuk hara yang saya butuhkan?”** Itu pertanyaan aritmetika, dan aritmetikanya sudah lengkap di data.

---

## 2. Simulasi

Pilih pupuk, masukkan harga yang kamu bayar, dan lihat rupiah per kilogram hara. Coba **PUSRI** (urea, hara tunggal) dan **FERTA** (NPK majemuk) — keduanya diperlakukan berbeda, dan alasannya dijelaskan di layar.

Yang nyata dari registri

Nama merek, produsen, nomor pendaftaran, dan kadar hara diambil dari `spec/vocab/product/pupuk.ndjson` — 7.196 pupuk terdaftar, 5.130 di antaranya membawa komposisi berangka terhadap 17 hara.

Yang bukan dari registri

**Harga.** Registri tidak memuat harga sama sekali. Angka harga di layar ini adalah masukan pengguna, dan tandanya tetap terlihat.

**HET bersubsidi** diambil dari Perpres 6/2025 dan Permentan 15/2025: Urea Rp 2.250/kg, NPK Rp 2.300/kg, organik Rp 800/kg — bukan dari registri produk.

---

## 3. Tiga hal yang tidak boleh dibandingkan

Kalkulator hara mudah dibuat dan mudah menyesatkan. Tiga batas ini harus tertanam, bukan ditulis di catatan kaki.

1 · Tunggal lawan majemuk

Urea memberi nitrogen saja; NPK memberi tiga hara sekaligus. Membandingkan “rupiah per kg N” di antara keduanya menyesatkan kecuali kamu memang hanya butuh N. Untuk pupuk majemuk, layar ini memakai **rupiah per kg hara total**, dan menyebutkan nisbahnya.

2 · Padat lawan cair

Registri menuliskan kadar padat dalam `g/kg` dan cair dalam `g/L` — 10.822 entri lawan 2.282. Tanpa berat jenis, keduanya tidak sebanding, dan berat jenis tidak ada di registri. Layar ini menolak membandingkannya, bukan menebak konversinya.

3 · Bersubsidi lawan tidak

HET bersubsidi bukan harga yang tersedia untuk semua orang: maksimal 2 hektare, wajib terdaftar SIMLUHTAN dan masuk e-RDKK. Menampilkannya sebagai patokan tanpa menyebut syaratnya akan membuat perbandingannya terasa seperti tuduhan.

---

## 4. 184 merek, satu barang

Pola yang sama seperti di pestisida, dan pada pupuk bahkan lebih pekat. Dikelompokkan menurut komposisi *dan* bentuk fisiknya:

386 kelompok · 1.904 produk

Dari 5.130 pupuk berkomposisi, **1.904 identik dengan produk lain** — kadar hara sama persis, bentuk sama.

Yang terbesar

**184 merek** adalah NPK 15-15-15 butiran yang sama. **144 merek** adalah NPK 16-16-16. **42 merek** adalah KCl 60. Petani melihat 184 karung berbeda dengan 184 harga berbeda, dan tidak punya cara tahu isinya sama.

> **Garis fakta versus saran, sama seperti sebelumnya**
>
> “Produk ini Rp 22.222 per kg hara, yang itu Rp 14.800” adalah **aritmetika atas komposisi terbitan** — fakta. “Pakai NPK 16-16-16” adalah **saran agronomi**, dan itu memindahkan platform ke ranah tanggung jawab hukum. Layar ini berhenti di angka.

---

## 5. Kalau angkanya di luar jangkauan

Kalkulator ini bisa berakhir dengan satu angka yang jawabannya “tidak sanggup”. Itu keadaan nyata, bukan kasus tepi — dan hari ini tidak ada layanan mana pun yang melayaninya.

Cabangnya **jalur 5, sediaan pupuk sendiri**: tujuh resep terbuka yang berada di luar rezim pendaftaran lewat Pasal 72, kriteria pelepasannya lengkap, dan tidak menunggu apa pun untuk dirilis. Ia satu-satunya jawaban di seluruh platform yang tidak menjual apa pun.

> **Tetapi cabangnya masuk tanpa angka**
>
> Aturan `L18` menolak menghitung hara dari batch yang belum diuji, dan kadar kompos berbeda tiap tumpukan. Jadi sediaan sendiri **tidak bisa muncul di kalkulator ini dengan rupiah per kg hara** — memberinya angka rujukan akan membuat seluruh perbandingan bohong.
>
> Yang diusulkan: **tetap ditampilkan, tanpa angka.** Menyembunyikannya berarti petani yang tidak sanggup membeli tidak melihat pilihan apa pun — dan itu justru keadaan yang paling butuh dilayani. Yang bisa ditampilkan biaya bahan dan tenaganya, bukan harga per kg haranya.

Perhatikan arahnya: cabang ini **terbuka sekarang**. Bandingkan dengan cabang serupa di jalur insiden, yang bermuara ke jalur 6 dan masih tertutup sampai bacaan Pasal 77 ayat (1) dijawab.

---

## 6. Yang belum ada di data

- **Harga.** Nol. Harus dimasukkan pengguna sekali di kios, atau dikumpulkan bersama — dan yang kedua itu produk lain dengan masalah moderasinya sendiri.
- **Penanda subsidi.** Saya periksa seluruh 7.196 pupuk: **tidak satu pun** menyebutkan status subsidi. Padahal dokumen fondasi menyatakan mesin protokol harus sadar-subsidi. Kesadaran itu harus datang dari sumber lain — daftar produk bersubsidi Kementan, bukan registri pendaftaran.
- **Berat jenis pupuk cair.** Tanpa itu, 1.721 pupuk cair tidak bisa dibandingkan dengan yang padat sama sekali.
- **Ukuran kemasan.** Tidak tercatat, jadi pengguna harus memilihnya. Preset 50 / 25 / 5 kg menutup sebagian besar kasus.

---

## Alur layar

1. **Pilih pupuk.** Empat pupuk nyata dengan produsen, jenis, dan bentuknya.
2. **Kadar dan harga.** Kadar hara menurut pendaftaran ditampilkan lebih dulu,
   lengkap dengan hara totalnya dalam g/kg dan persen. Di bawahnya dua baris
   masukan: harga per karung dan isi karung. Keterangan tetap terlihat bahwa
   harga bukan dari registri.
3. **Hasil.** Angka besar rupiah per kg hara, disusul **pembagiannya ditulis
   terbuka** — harga per kg pupuk dibagi fraksi haranya — supaya bisa dibantah
   siapa pun yang tidak percaya.
4. **Nisbah, hanya untuk pupuk majemuk.** Persentase tiap hara terhadap hara
   totalnya, dengan keterangan bahwa membaginya per hara sendiri-sendiri
   menyesatkan karena nitrogennya tidak bisa dibeli terpisah.
5. **Banding subsidi.** Berapa kali lipat terhadap HET bersubsidi, dengan bilah
   dan — selalu — syarat yang menyertainya: maksimal 2 hektare, wajib SIMLUHTAN
   dan e-RDKK. Pupuk di luar skema subsidi tidak menampilkan blok ini sama sekali.
6. **Setara.** Jumlah merek lain berisi kadar hara yang sama persis.
