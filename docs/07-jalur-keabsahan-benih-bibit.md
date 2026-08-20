# Keabsahan Benih & Bibit

> Rancangan · jalur keempat · benih & bibit  
> Datanya tidak bisa menjawab *varietas mana yang lebih baik* — dan berpura-pura bisa berarti mengarang. Yang bisa dijawabnya justru masalah yang lebih sering melukai: **apakah varietas yang di tangan ini benar-benar ada, dan surat apa yang dipegangnya.**  
> Data **11.227 varietas** — **24,3% berbibit** · Empat status hukum **yang mudah tertukar**  
>
> Diekstrak dari dokumen konsep HTML dengan judul sama, 20 Agustus 2026.
> Isi, angka, dan tabelnya utuh; simulasi yang bisa diklik tidak ikut —
> alurnya ditulis ulang sebagai teks.
>
> Jalur 4 dari [03-enam-pintu.md](03-enam-pintu.md).

---

## 1. Kenapa bukan “varietas mana yang sebaiknya ditanam”

Dari seluruh 11.227 varietas, **tidak satu pun menyebut sifat agronomi apa pun** — ketahanan, umur panen, potensi hasil. Tiga puluh rekaman memang memuat kata seperti “tahan”, tetapi seluruhnya di dalam *nama pemelihara*, bukan sebagai sifat varietasnya. `variety_type` baru terisi di 1.173 rekaman.

Yang ada di registri justru berkas perizinan. Artinya ini **daftar keabsahan, bukan katalog agronomi.** Membangun rekomendasi varietas di atasnya berarti mengarang sifat yang tidak pernah ada datanya — dan taruhan benih adalah taruhan seluruh musim.

---

## 2. Benih dan bibit bukan hal yang sama

**Benih** adalah bahan perbanyakan berbentuk biji. **Bibit** adalah tanaman muda siap tanam — semaian, setek, sambungan, okulasi, atau umbi. Untuk banyak komoditas, yang beredar di pasar justru bibit, dan benih tidak pernah ada di tangan petani sama sekali.

Registri ini mendaftarkan **varietas**, bukan bahan perbanyakannya. Satu varietas tetap varietas yang sama entah diterima sebagai biji, setek, atau umbi — jadi jalur ini sudah menjangkau keduanya. Yang keliru hanyalah namanya, dan itu sudah diperbaiki.

| Komoditas | Varietas | Bentuk bibitnya |
|---|---|---|
| Durian | 495 | sambungan atau okulasi |
| Krisan | 247 | setek pucuk |
| Pisang | 185 | anakan atau kultur jaringan |
| Tebu | 168 | setek batang |
| Alpukat | 145 | sambungan |
| Kopi | 125 | semaian atau setek |
| Kentang | 110 | umbi bibit |
| Kakao | 90 | sambungan atau somatik |
| Bawang merah | 90 | umbi bibit |

*Sembilan terbesar dari **80 komoditas** yang perbanyakannya vegetatif — seluruhnya **2.725 varietas**, 24,3% dari registri.*

**Kesalahannya baru ketahuan bertahun-tahun kemudian.** Benih cabai yang salah merugikan satu musim. Bibit durian sambungan yang salah baru terbukti saat berbuah — empat sampai tujuh tahun setelah uangnya keluar, tanahnya terpakai, dan pemeliharaannya dibayar. Tidak ada yang bisa memeriksanya dengan melihat.

**Justru di situ surat pelepasannya paling jarang.** Pada komoditas berbibit, hanya **40,6%** varietas memegang surat pelepasan (1.094 dari 2.693). Pada komoditas berbenih, **55,4%**. Sebagian besar durian yang terdaftar masuk lewat *Pendaftaran Varietas Lokal* oleh pemerintah daerah — sah sebagai catatan, tetapi bukan surat pelepasan.

> **Batas yang paling penting di seluruh jalur ini**
>
> **Pelepasan varietas bukan sertifikasi lot.** Registri menjawab “apakah varietas ini dilepas”, dan berhenti di situ. Ia tidak bisa menjawab apakah *bungkus benih* atau *bibit di polybag* yang ada di tanganmu benar-benar berasal dari varietas itu — dokumen untuk itu adalah label dan sertifikat lot dari BPSB, dan registri ini **tidak memuatnya sama sekali** — 44 rekaman memang menyebut BPSB, tetapi seluruhnya sebagai *nama pemelihara*, bukan sebagai sertifikat lot.
>
> Untuk bibit tanaman tahunan, lubang itu paling lebar: tidak ada cara memverifikasi sambungan durian selain memercayai penangkarnya. Yang bisa diberikan layar ini adalah lapisan pertama — bahwa nama varietasnya nyata, siapa pemeliharanya, dan surat apa yang ada di baliknya.

---

## 3. Empat surat yang bunyinya mirip

Ini inti persoalannya. Keempat status di bawah sama-sama terdengar seperti “resmi”, tetapi instrumennya berbeda — dan registri membedakannya dengan tepat.

| Surat | Varietas | Ragam sebutan resminya |
|---|---|---|
| **Pelepasan** — Pelepasan Varietas Tanaman | 5.822 | 4 sebutan — termasuk Tanaman Pangan dan PRG |
| **Pendaftaran** — Pendaftaran Varietas Tanaman | 5.138 | 4 sebutan — Tanaman, Hasil Pemuliaan, Lokal, Hortikultura |
| **Perlindungan** — PVT — hak atas varietasnya | 580 | 1 sebutan |
| **Penamaan** — untuk varietas introduksi | 22 | 1 sebutan |

*Jumlah **varietas** yang memegang tiap jenis surat — bukan jumlah entri surat, karena satu varietas bisa memegang dua sekaligus. 329 varietas memegang lebih dari satu jenis, jadi kolomnya tidak dijumlahkan.*

> **Kenapa sebutan resminya ditampilkan apa adanya**
>
> “Pendaftaran” saja mencakup empat instrumen berbeda: **Pendaftaran Varietas Tanaman** (4.919), **Hasil Pemuliaan** (127), **Lokal** (90), dan **Hortikultura** (45). Meratakannya jadi satu kata “terdaftar” akan membuang persis informasi yang membedakan. Layar menampilkan `kind_label` sebagaimana registri menuliskannya, beserta nomor SK-nya.

---

## 4. Simulasi

Coba **Brahma F1** lalu **Brahmana F1** — pemelihara sama, nama beda satu suku kata, komoditas berbeda, dan surat yang dipegangnya berbeda. Lalu coba **Bramaha F1**, nama yang tidak ada di registri.

Semuanya dari registri

Nama varietas, komoditas, pemelihara, jenis surat, dan nomor SK diambil apa adanya dari `spec/vocab/variety/varietas.ndjson`.

Kalender fase datang dari tautan komoditas → skala BBCH: **52,4% varietas** kini mewarisi satu.

Yang layar ini tidak lakukan

Ia **tidak menyatakan sebuah benih ilegal.** Nama dagang di kemasan bisa berbeda dari nama varietas terdaftar, jadi “tidak ditemukan” bukan tuduhan.

Yang diberikan: apa yang ada di registri, dan pertanyaan yang pantas diajukan ke penjual.

---

## 5. Layar “tidak ditemukan”, sekali lagi yang terpenting

Sama seperti layar nol produk pada pestisida, jawaban paling bernilai di sini adalah yang tidak menawarkan apa-apa.

Tapi bedanya penting: nol produk untuk virus adalah **kebenaran agronomi** — memang tidak ada yang bisa disemprot. Nama varietas yang tidak ditemukan **bukan bukti apa-apa**: bisa salah eja, bisa nama dagang yang berbeda dari nama terdaftarnya, bisa juga benih yang memang tidak terdaftar.

Karena itu layarnya berhenti pada fakta dan mengubahnya jadi pertanyaan yang bisa dibawa ke penjual: *“nomor SK pelepasannya berapa?”* Penjual benih sah akan bisa menjawab; yang tidak bisa menjawab sudah memberi informasi yang cukup.

---

## 6. Yang belum ada di data

- **Sifat agronomi.** Nol dari 11.227. Tanpa ini tidak ada rekomendasi varietas yang jujur — dan menambahkannya berarti kerja kurasi besar, bukan tarikan registri.
- **Masa berlaku surat.** seluruh 580 surat `protection` tidak membawa tanggal sama sekali, dan 5.801 dari 5.826 surat pelepasan hanya membawa nomor SK tanpa tanggal. Jadi layar tidak bisa menyatakan sebuah surat masih berlaku — hanya bahwa ia ada.
- **Nama dagang.** Registri menyimpan nama varietas, bukan nama di kemasan. Pemetaan nama dagang → varietas adalah lubang terbesar untuk jalur ini, dan tidak bisa ditutup dari data yang ada.
- **Produsen benih.** Yang tercatat `maintainer` — pemelihara varietasnya, belum tentu yang mengemas benih di tanganmu.

---

## Alur layar

1. **Cari varietas.** Kotak pencarian dan lima varietas nyata; keterangannya
   menyebut komoditas, bentuk bahan perbanyakannya bila bibit, dan pemeliharanya.
2. **Hasil.** Kartu nama varietas, lalu satu kartu untuk tiap surat yang
   dipegangnya — memuat **sebutan resmi apa adanya**, nomor SK, dan tanggalnya
   bila ada. Kartu pelepasan berwarna berbeda dari kartu pendaftaran dan PVT.
3. **Yang tidak ada.** Bila tidak ada surat pelepasan, satu blok menyatakannya
   sebagai fakta tentang isi registri, diikuti kalimat yang menegaskan itu bukan
   kesimpulan hukum, dan satu pertanyaan yang bisa dibawa ke penjual.
4. **Fakta pendukung.** Pemelihara, asal, komoditas, dan bentuk peredarannya.
5. **Taruhan tanaman tahunan.** Untuk bibit tahunan, kartu tersendiri
   menerangkan bahwa kesalahan baru ketahuan empat sampai tujuh tahun kemudian,
   dan bahwa yang berlaku untuk memverifikasi polybag adalah label serta
   sertifikat lot dari BPSB — bukan registri ini.
6. **Nama yang mudah tertukar.** Bila ada varietas lain dengan nama nyaris sama,
   kartu peringatan menampilkannya beserta komoditas dan suratnya yang berbeda.
7. **Cabang tidak ditemukan.** Tiga kemungkinan yang sama masuk akalnya — salah
   eja, nama dagang, atau memang tidak terdaftar — lalu satu pertanyaan untuk
   penjual dan satu tautan ke ejaan terdekat yang ada di registri.
