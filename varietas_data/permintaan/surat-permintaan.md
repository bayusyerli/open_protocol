# Permintaan salinan dokumen deskripsi varietas hortikultura

> **Draf siap kirim.** Blok pengirim di bawah masih berupa isian — nama, lembaga, dan
> alamat surel balasan sengaja tidak diisi karena surat ini akan berdiri atas nama Anda,
> bukan atas nama siapa pun yang menyusunnya.
>
> Dua kanal, pilih salah satu — isinya sama:
> - **Tidak resmi, paling cepat:** surel ke `ditjenhorti@pertanian.go.id`, subjek dan
>   badan surat di bawah. Lampirkan kedua CSV.
> - **Resmi, punya tenggat mengikat:** PPID Kementerian Pertanian,
>   <https://ppid.pertanian.go.id/> — permohonan informasi publik menurut UU 14/2008.
>   Badan penerima wajib menjawab dalam **10 hari kerja**, dapat diperpanjang 7 hari.
>   Pakai jalur ini kalau jalur surel tidak dijawab dalam dua pekan.
>
> Alamat surat: Direktorat Jenderal Hortikultura, Jl. AUP No. 3, RT 9/RW 10,
> Pasar Minggu, Jakarta Selatan, DKI Jakarta 12520 · Telp (021) 7806881.

---

**Perihal:** Permohonan salinan dokumen deskripsi varietas yang tautannya tidak lagi
dapat diakses pada basis data PROSEED

**Kepada Yth.**
Direktur Perbenihan Hortikultura
Direktorat Jenderal Hortikultura, Kementerian Pertanian RI
Jl. AUP No. 3, Pasar Minggu, Jakarta Selatan 12520

Dengan hormat,

**1. Maksud surat ini**

Kami sedang menyusun basis data pertanian terbuka yang bersifat netral terhadap merek,
dan salah satu lapisnya adalah daftar varietas terdaftar beserta sifat agronominya.
Daftar varietasnya sendiri sudah kami peroleh dari registri perizinan Kementerian
Pertanian. Yang belum kami peroleh adalah **deskripsi varietasnya**, yang pada basis
data PROSEED disediakan sebagai lampiran Keputusan Menteri Pertanian.

**2. Keadaan yang kami temukan**

Pada 30 Agustus 2026 kami memeriksa seluruh tautan dokumen deskripsi pada dua modul
PROSEED (`perbenihanhorti.id/proseed`). Tabelnya utuh dan masih dapat diakses; yang
tidak dapat diakses berkas lampirannya.

| Modul | Baris pada tabel | Dokumen dapat diakses | Tidak dapat diakses |
|---|---:|---:|---:|
| `db-vardaf` | 3.503 | 56 | 3.447 |
| `db-varsan` | 1.592 | 21 | 1.571 |
| **Jumlah** | **5.095** | **77** | **5.018** |

Pemeriksaan dilakukan dua kali dengan metode berbeda (permintaan HEAD dan GET) dan
memberi hasil yang sama; seluruh 5.018 tautan membalas kode 404. Berkas foto pada tabel
yang sama juga sebagian besar tidak dapat diakses. Kami menduga ini kehilangan berkas
pada penyimpanan atau perpindahan alamat, **bukan penutupan informasi**, karena
tabelnya sendiri masih Bapak/Ibu terbitkan lengkap dengan nomor SK-nya.

**3. Yang kami mohonkan**

Kami mohon salah satu dari tiga bentuk berikut, **berurutan menurut yang paling ringan
bagi Direktorat**:

1. **Pemulihan berkas pada alamat semula.** Ini yang paling kami harapkan, karena
   manfaatnya tidak berhenti pada kami — seluruh pengguna PROSEED memperolehnya
   kembali, dan Direktorat tidak perlu melayani permintaan serupa di kemudian hari.
2. **Salinan seluruh arsip** dalam bentuk apa pun yang mudah bagi Direktorat: satu
   berkas terkompresi, tautan penyimpanan awan, atau media fisik yang kami ambil
   sendiri ke kantor.
3. **Salinan sebagian**, bila keseluruhan tidak memungkinkan. Kami lampirkan daftar
   prioritasnya: **3.814 dokumen** pada **65 komoditas sayuran dan pangan semusim**.
   Golongan ini kami dahulukan karena deskripsinyalah yang memuat umur panen, potensi
   hasil, dan ketahanan terhadap OPT; pada varietas tanaman tahunan dan tanaman hias,
   deskripsinya berisi ciri morfologi yang tidak memuat ketiga hal itu.

**4. Satu hal lagi yang kami mohonkan, dan nilainya setara**

Situs PROSEED tidak menyatakan ketentuan penggunaan kembali atas isinya. Kami mohon
**penegasan tertulis mengenai syarat penggunaan kembali** data tabel PROSEED beserta
dokumen deskripsinya — apakah boleh disalurkan ulang, dengan atribusi seperti apa, dan
apakah ada bagian yang tidak boleh diterbitkan ulang. Tanpa penegasan itu kami memilih
sikap paling berhati-hati: kami tidak menerbitkan ulang berkasnya sama sekali.

**5. Yang akan kami lakukan dengan dokumennya**

- Kami mengambil **empat medan** dari tiap deskripsi: potensi hasil, umur panen,
  ketahanan terhadap OPT, dan anjuran ketinggian tempat.
- Keempatnya kami terbitkan sebagai data terbuka, **dengan atribusi kepada Direktorat
  Perbenihan Hortikultura dan menyebut nomor SK-nya**, serta menautkan balik ke PROSEED.
- **Berkas PDF-nya tidak kami terbitkan ulang** selama ketentuannya belum ditegaskan.
- Penggunaannya non-komersial, dan hasilnya dapat diakses siapa pun tanpa akun maupun
  pembayaran.

**6. Yang kami sertakan, dan boleh Direktorat pakai bebas**

Sebagai lampiran kami sertakan hasil pemeriksaan tautan selengkapnya. Daftar ini kami
susun untuk keperluan kami sendiri, tetapi kiranya berguna pula bagi Direktorat sebagai
bahan penelusuran berkas yang hilang — **3.447 baris memuat nomor SK-nya**, sehingga
dapat langsung dicocokkan dengan arsip Direktorat. Kolom nomor SK sengaja dikosongkan
pada 1.571 baris `db-varsan`: tabel modul itu memang tidak menerbitkan nomor SK, dan
meminjamnya dari `db-vardaf` atas dasar kesamaan nama akan menyodorkan nomor tebakan
kepada penelusuran yang justru bergantung pada ketepatannya.

| Lampiran | Isi |
|---|---|
| `tautan-putus-seluruhnya.csv` | 5.018 baris — modul, komoditas, varietas, nomor SK (terisi pada 3.447 baris `db-vardaf`), tahun, golongan, dan alamat yang tidak dapat diakses |
| `tautan-putus-prioritas.csv` | 3.814 baris — bagian sayuran dan pangan semusim pada butir 3.3 |

**7. Bila permohonan ini perlu jalur resmi**

Kami menyadari permohonan informasi publik memiliki jalurnya sendiri. Bila Bapak/Ibu
memandang surat ini perlu diajukan melalui PPID Kementerian Pertanian sesuai
Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik, mohon kiranya
kami diberi tahu, dan kami akan segera mengajukannya melalui kanal tersebut. Kami
mengajukan lewat surat lebih dahulu karena yang kami minta bukan informasi baru,
melainkan berkas yang sudah Bapak/Ibu terbitkan sendiri dan kebetulan tidak lagi
terjangkau.

Atas perhatian dan bantuan Bapak/Ibu, kami mengucapkan terima kasih.

Hormat kami,

<!-- ISI SENDIRI -->
Nama       : ______________________
Lembaga    : ______________________
Alamat     : ______________________
Surel      : ______________________
Telepon    : ______________________
Tanggal    : ______________________

---

## Versi ringkas untuk badan surel

> **Subjek:** Permohonan salinan dokumen deskripsi varietas — 5.018 tautan PROSEED tidak dapat diakses

Yth. Direktorat Perbenihan Hortikultura,

Pada 30 Agustus 2026 kami memeriksa seluruh 5.095 tautan dokumen deskripsi varietas pada
basis data PROSEED (`db-vardaf` dan `db-varsan`). Tabelnya utuh, tetapi **5.018 dari
5.095 berkas lampirannya membalas 404** — diperiksa dua kali dengan metode berbeda.
Berkas fotonya sebagian besar juga tidak dapat diakses.

Kami sedang menyusun basis data pertanian terbuka yang netral terhadap merek, dan
memerlukan empat medan dari deskripsi tersebut: potensi hasil, umur panen, ketahanan
terhadap OPT, dan anjuran ketinggian tempat.

Mohon kiranya salah satu dari berikut, menurut yang paling ringan bagi Bapak/Ibu:
1. berkasnya dipulihkan pada alamat semula — ini yang paling bermanfaat, karena seluruh
   pengguna PROSEED ikut memperolehnya kembali;
2. salinan arsipnya dikirimkan dalam bentuk apa pun yang mudah; atau
3. salinan 3.814 dokumen pada 65 komoditas sayuran dan pangan semusim (daftar terlampir).

Kami juga mohon penegasan syarat penggunaan kembali data PROSEED, karena situsnya belum
menyatakannya. Sampai ada penegasan, kami tidak menerbitkan ulang berkasnya; yang kami
terbitkan hanya keempat medan di atas, dengan atribusi dan nomor SK.

Terlampir hasil pemeriksaan tautan selengkapnya — 5.018 baris, **3.447 di antaranya
memuat nomor SK** dan dapat langsung dicocokkan dengan arsip Direktorat. Silakan dipakai
bebas.

Hormat kami,
[nama · lembaga · kontak]
