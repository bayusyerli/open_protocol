# Sumber Harga Komoditas — riset, lapis lisensi, dan putusan pinjam/bangun

> Riset · versi **0.1** · 22 Agustus 2026 · status **usulan**
> Menjawab satu pertanyaan: **dari mana modul harga mengambil angkanya, dan mana yang boleh
> diterbitkan** — beserta satu pertanyaan lama yang ikut terjawab di tengah jalan.
>
> Menutup kapabilitas **C4** pada
> [15-kapabilitas-lintas-pemangku.md](15-kapabilitas-lintas-pemangku.md), yang sebelumnya
> berbunyi *"PINJAM + BANGUN"* dengan Panel Harga Bapanas sebagai calon pinjaman, dan
> menjawab pertanyaan terbuka nomor 7 di dokumen yang sama.
>
> Pembagian lapis mengikuti kaidah [`LISENSI.md`](../LISENSI.md) dan preseden
> [`toko_data/LAPIS.md`](../toko_data/LAPIS.md): **lapis ditentukan lisensi sumber, bukan
> isinya.**

---

## 0. Ringkasan

Lima temuan, diurutkan menurut seberapa besar ia mengubah keputusan bangun:

1. **Pinjaman yang ditunjuk dokumen 15 sudah mati.** Panel Harga Pangan Bapanas menampilkan
   halaman pemeliharaan tanpa perkiraan selesai, dan seluruh endpoint API-nya menjawab 401.
   Wayback menunjukkan 502 sejak Oktober 2025 — ini bukan gangguan sesaat. Rencana C4 tidak
   bisa dijalankan apa adanya.
2. **"Harga produsen" yang dicatat negara sebenarnya harga beli pengumpul.** Ini temuan yang
   mengunci seluruh putusan; rinciannya di bagian 4. Akibatnya jarak antara harga acuan dan
   harga yang diterima petani **terpasang di dalam definisinya**, bukan celah cakupan yang
   bisa dirapatkan dengan menambah sampel.
3. **Ada satu sumber harga harian pemerintah yang berlisensi terbuka** — SP2KP Kemendag,
   tanpa kunci, sampai tingkat pasar, dengan ketentuan yang menyatakan "Data Terbuka" dan
   mengizinkan penggunaan komersial. Ia satu-satunya. Semua sumber harian lain, termasuk
   PIHPS Bank Indonesia, hanya boleh jadi benih privat.
4. **Endpoint utama SP2KP membocorkan data pribadi petugas.** Setiap rekaman membawa NIK,
   NIP, nomor telepon, dan alamat pencacah. Ada dua endpoint pengganti yang bersih; memakai
   yang salah berarti menyimpan PII orang lain di repo kita.
5. **Harga dunia menyesatkan ke dua arah yang berlawanan**, tergantung komoditasnya — semu
   pada sawit dan karet, nyata tapi tersembunyi pada kakao dan kopi. Itu melahirkan satu
   aturan tayang yang sebaiknya mengikat sejak awal (bagian 7).

---

## 1. Lapis TERBIT — lolos penyaring lisensi

Urut menurut kekuatan haknya.

| Sumber | Lisensi | Isi | Catatan |
|---|---|---|---|
| **Angka peraturan** — HPP, HAP, HET beras, HET pupuk | Bebas hak cipta — UU 28/2014 Pasal 42 | Patokan resmi | Fondasi paling kokoh, dan justru yang paling sering salah di lapangan |
| **SP2KP Kemendag** | **"Data Terbuka"** eksplisit; komersial diizinkan | Eceran harian, 1.229 pasar, Jan 2024→ | Atribusi wajib dengan format yang sudah ditentukan; lihat bagian 5 |
| **World Bank Pink Sheet** | CC BY 4.0 | Komoditas dunia bulanan sejak 1960 | Gerbang terbuka ke ICCO, ICO, ISA, dan SGX yang berbayar di sumber aslinya |
| **FAOSTAT Producer Prices** | CC BY 4.0 | **Harga petani Indonesia**, 105 komoditas | Tertinggal ±1 tahun; API resminya 401, pakai unduhan curah |
| **WFP/HDX Food Prices** | CC BY-IGO | Eceran, 223 pasar berkoordinat | Seluruh seri cabainya berhenti Mei 2024 |
| **World Bank RTFP** | CC BY 4.0 | Eceran, segar | 22–40% observasinya imputasi — wajib ditandai |
| **Penetapan TBS** Riau, Kalbar, Kalteng | Karya pemerintah | Harga TBS mingguan | Terbit sebagai PDF pindai, PNG, dan JPEG — perlu OCR |

Atribusi yang harus dipasang bila menayangkan ulang SP2KP:

```
Sumber: Portal Satu Data Kementerian Perdagangan (satudata.kemendag.go.id) – 2026,
diolah kembali oleh Open Protocols.
```

## 2. Lapis BENIH PRIVAT — ditarik, tidak diterbitkan

| Sumber | Sebab |
|---|---|
| **PIHPS Bank Indonesia** | Footer berbunyi "Semua Hak Dilindungi"; tak ada ketentuan penggunaan yang bisa ditemukan |
| Dataset harga Bapanas | `license_id` kosong, `accesslevel: terbatas` — meski CSV-nya terunduh terbuka |
| Enam sistem harga pemda | Tak satu pun berlisensi terbuka |
| BPS WebAPI | Ketentuan penggunaannya di balik login |

Perlu dicatat satu ketegangan pada dataset Bapanas: lamannya menyatakan akses terbatas,
tetapi berkasnya terunduh HTTP 200 tanpa autentikasi apa pun. **Terbuka secara teknis,
tertutup secara deklaratif, tanpa lisensi** — kombinasi terburuk untuk penerbitan ulang.
Bisa diambil, tidak ada dasar hak menyebarkannya.

**Gugur permanen:** Gunungkidul (`cc-nc`, tidak kompatibel dengan CC BY-SA repo ini) · ICCO,
ICO, SGX, ICE · KPBN (langganan Rp19,25 juta/tahun) · seluruh API komoditas komersial, karena
hak tayang dijual terpisah dari hak akses dan mati saat langganan berhenti · IMF PCPS, FRED,
dan Alpha Vantage — ketiganya ternyata **satu sumber dengan tiga pintu**, cocok sampai digit
terakhir, dan semuanya tertutup.

**Batas robot yang dihormati:** TaniKU Kulon Progo (`ai-train=no`) dan ICDX (`robots.txt`
memblokir `anthropic-ai` dan `Claude-Web`). Tidak dipanen.

---

## 3. Yang tidak ada di mana pun

- **Gabah tidak ada di sumber harian mana pun.** PIHPS tidak memuatnya; BPS hanya bulanan dan
  di balik kunci.
- **Jawa Barat dan Banten tanpa jalan pintas.** Jabar provinsi hortikultura terbesar di Jawa,
  dan di belakang portalnya nol portal CKAN kabupaten. Banten tidak punya sistem sama sekali
  sejak PRIANGAN mati.
- **Cabai pada satu-satunya sumber berlisensi bersih** berhenti Mei 2024.
- **Benih dan pupuk non-subsidi di SP2KP adalah arsip mati** — 15 tanggal mingguan pada paruh
  pertama 2024, lalu berhenti. Jangan bangun antarmuka yang menyiratkan umpan berjalan.
- **Nol dari 13 agritech memberi harga petani.** Alasannya struktural, bukan teknis: selisih
  beli-dari-petani dan jual-ke-konsumen persis adalah marjin mereka. Arah pencarian ini
  tertutup permanen dan tidak perlu diulang.

---

## 4. Temuan yang mengunci putusan

Pada PIHPS, endpoint `GetRefMarket` membuka apa yang tidak terlihat di antarmuka: pada
tingkat produsen, "pasar" adalah **nama orang**.

| Kab/kota | Responden produsen |
|---|---|
| **Kab. Karawang** | **1** — H. Mamat |
| **Kab. Subang** | **1** — PG Subang |
| Kab. Garut | 2 |
| Kab. Cirebon | 26 |

Karawang adalah salah satu lumbung padi terbesar Indonesia. Respondennya pengumpul,
penggilingan, dan pedagang — bukan petani. Maka yang dicatat negara sebagai harga produsen
adalah **harga beli pengumpul**: menurut definisinya sudah memuat marjin pengumpul, dan sudah
melewati potongan susut serta kadar air.

Itu mengubah bacaan angka yang terdengar menenangkan. Produsen menerima rata-rata **80,7%**
harga eceran pasar tradisional untuk beras medium selama 92 bulan, membaik ke 84,5% pada Juli
2026. Tetapi itu bukan bagian petani — itu harga beli pengumpul terhadap eceran. Bagian
petani ada di bawahnya, sejauh yang tidak ada yang mengukur.

Diperkuat dari dua sisi lain: FAQ resmi PIHPS **tidak memuat metodologi apa pun** untuk
tingkat produsen — hanya pasar tradisional yang dirinci — dan kerangka 82 kota/kabupatennya
adalah kerangka sampel **IHK inflasi konsumen kota**, bukan sentra produksi. Struktur
samplingnya memang dirancang untuk mengukur harga konsumen; tingkat produsen menumpang di
atas kerangka yang bukan untuknya.

Satu-satunya sumber resmi yang benar-benar bertanya kepada petani adalah **Survei Harga
Produsen Gabah BPS** — hanya gabah, hanya bulanan, di balik kunci API.

> **Ini menjawab pertanyaan terbuka nomor 7 di dokumen 15.** Pertanyaannya: kalau jaraknya
> kecil, C4 cukup dipinjam; kalau besar, setoran petani wajib. Jawabannya bukan besar atau
> kecil — **jaraknya terpasang di dalam definisi**. Menambah sampel tidak merapatkannya,
> karena yang ditanya memang bukan petani. Setoran harga dari petani bukan pelengkap C4;
> ia satu-satunya jalan.

---

## 5. Risiko yang harus ditangani sebelum penyerapan pertama

1. **Data pribadi pada SP2KP.** Endpoint `average-price-public` menyertakan objek `creator`
   berisi `nik`, `nip`, `no_telp`, `alamat`, `email`, `first_name`, `last_name`, dan
   `jabatan` pada **setiap** rekaman — data pribadi menurut UU 27/2022, dan NIP memuat
   tanggal lahir. **Mitigasi:** pakai `average-price-komoditas-public` atau `hnt` — keduanya
   sudah dipastikan tidak membawa `creator` — atau arsip XLSX bulanan.
2. **Jangan panen lewat iterasi harian.** Ketentuan Kemendag melarang "mengunduh data di luar
   yang telah disediakan pada Portal". Pakai arsip `kld/api/list-harga-harian/{yyyy}/{m}`:
   ±32 permintaan untuk seluruh riwayat, bukan ±650.
3. **Satuan.** Pink Sheet mencampur `$/kg` dan `$/mt` dalam satu tabel; IMF mencampur sen per
   pon dengan USD per ton. Salah baca satu kolom menghasilkan galat 1.000×. Normalkan saat
   penyerapan, dan beri label satuan eksplisit sampai ke mata petani.
4. **Koordinat pasar tidak tepercaya.** SP2KP: 566 dari 1.229 berkoordinat, sisanya `0,0`.
   SISP: 4.591 berkoordinat, tetapi lintang dan bujurnya tampak tertukar. Sejalan dengan
   keputusan tidak melakukan geokode massal — validasi per rekaman.
5. **Endpoint sehat bukan berarti data ada.** SiHaTi Jateng menjawab HTTP 200 untuk setiap
   tanggal dengan seluruh nilai 0 sejak April 2025. Ini varian ketiga dari pelajaran situs
   mati versus jalur tersaring: situs hidup, endpoint sehat, isinya kosong. Pemeriksaan
   status saja tidak menangkapnya.

---

## 6. Putusan per lapis

| Lapis | Putusan | Sumber |
|---|---|---|
| Patokan regulasi | **BANGUN** — murah, bebas hak cipta, paling sering salah di lapangan | HPP, HAP, HET beras, HET pupuk |
| Harga eceran harian | **PINJAM** | SP2KP (terbit) + sistem pemda (privat) |
| Harga grosir | **PINJAM terbatas** | PIHPS `price_type_id=3` — privat |
| Harga "produsen" resmi | **PINJAM, dengan label jujur** | PIHPS `=4`, SISKAPERBAPO — tandai sebagai harga pengumpul |
| **Harga petani sebenarnya** | **BANGUN** — tidak ada penggantinya | Setoran petani + kalibrasi selisih |
| Harga dunia | **PINJAM** | Pink Sheet, FAOSTAT — tidak pernah tayang sendirian |

Sisi HET pupuk bersubsidi menyentuh [06-jalur-hitungan-hara.md](06-jalur-hitungan-hara.md)
secara langsung — rupiah per kilogram hara — dan mengisi sebagian **C9**, yang selama ini
nol dari 7.196 pupuk. SISKAPERBAPO melengkapinya dari sisi lain: ia menerbitkan harga pupuk
**non-subsidi** per pasar. Yang satu harga resmi, yang satu harga pasar nyata.

## 7. Aturan tayang yang disarankan mengikat sejak awal

1. **Pisahkan tegas tiga jenis angka:** patokan regulasi, survei pemerintah, dan setoran
   petani. Justru perbedaan ketiganya yang paling berharga bagi petani — mencampurnya
   menghapus informasinya.
2. **Tampilkan jumlah responden sebagai penanda keyakinan.** `GetRefMarket` memberikannya
   gratis. Harga kabupaten yang bersandar pada satu orang tidak boleh tampil setara dengan
   yang bersandar pada 26. Ini penerapan langsung kaidah
   [11-instrumentasi.md](11-instrumentasi.md): nol dan tak-sanggup bukan kegagalan, asal
   dinyatakan.
3. **Harga dunia tidak pernah ditayangkan sendirian** — wajib berpasangan dengan harga lokal,
   faktor konversi yang terbuka dan bisa diubah petani, serta cap waktu per angka.
4. **Bedakan komoditas setara dan tidak setara.** Sawit dan karet **wajib** melewati koreksi
   rendemen (OER sawit ±21%, kadar karet kering bokar ±55%); kakao dan kopi boleh
   dibandingkan langsung. Tanpa koreksi itu, TBS terhadap CPO dunia tampak 7,26× padahal
   sebenarnya 1,52× — dan petani akan menyimpulkan dirinya ditipu tujuh kali lipat.
   Sebaliknya pada kakao dan kopi jurangnya nyata dan tidak terkoreksi: petani menerima 41%
   dan 55%. Di sanalah harga dunia justru satu-satunya alat tawar yang dimilikinya.
5. **Tayangkan rasio, bukan dua angka bersebelahan.** "Harga Anda = 66% setara-CPO dari harga
   dunia" jauh lebih sulit disalahpahami.
6. **Penduga farmgate dinyatakan terbuka sebagai perkiraan**, bukan sebagai harga terukur.

## 8. Yang perlu dikerjakan manusia

- **Daftarkan kunci WebAPI BPS** di `webapi.bps.go.id` — pintu ke gabah tingkat petani, harga
  konsumen pedesaan, dan NTP. Gratis; pendaftaran akun tidak bisa didelegasikan ke mesin.
- **Surat ke Kepala PDSI Kemendag** sebelum penayangan ulang berskala besar. Ketentuannya
  sendiri menyebut itu jalur yang benar, dan biayanya murah.
- **Permohonan lisensi ke SIGAPURA Bali** — kandidat terkuat di antara sistem pemda: JSON
  terbersih, 60 pasar berkoordinat terbitan pemerintah sendiri, dan sudah berada dalam
  kerangka Satu Data.
- **Uji ulang dari jaringan Indonesia:** `gapkindo.org`, `disbun.sumselprov.go.id`, dan portal
  Jawa Barat. Ketiganya gagal karena penyaringan jaringan mesin peneliti, **bukan terbukti
  mati**.
- **Laporkan ke pengelola data.go.id:** kunci API CKAN milik akun pengunggah tersaji di HTML
  publik halaman dataset. Tidak disentuh dan tidak dicantumkan di mana pun.

---

## 9. Batas dokumen ini

1. **Tingkat verifikasinya tidak rata, dan itu disengaja dinyatakan.** Yang dipanggil dan
   dibuktikan sendiri: seluruh endpoint PIHPS termasuk jumlah responden di bagian 4, unduhan
   CSV Bapanas, tabel produsen SISKAPERBAPO, serta SP2KP berikut nama-nama medan `creator`
   dan dua endpoint penggantinya. Selebihnya — angka HET dan HPP, teks lisensi, rincian
   perkebunan, dan seluruh hitungan jurang harga dunia — berasal dari laporan agen riset dan
   **belum diperiksa ulang satu per satu**.
2. **Angka HET pupuk bersubsidi bersumber dari PDF pindaian di situs BRMP Sulteng**, bukan
   salinan yang dihosting Kementan. Sebelum dipakai berhitung di jalur hara, konfirmasikan ke
   salinan resmi.
3. **Hitungan bagian 80,7% dan jurang harga dunia** memakai FAOSTAT 2024 terhadap Pink Sheet
   2024. Keduanya tertinggal, dan rendemen kebun berbeda-beda — angka rasionya penanda
   skala, bukan dasar perhitungan.
4. **Tidak ada satu pun wawancara lapangan.** Kesimpulan bahwa responden "produsen" adalah
   pengumpul ditarik dari nama responden dan ketiadaan metodologi, bukan dari menanyai
   mereka. Kesimpulan itu kuat, tetapi jenis buktinya tetap tidak langsung.
5. **Lisensi yang "tidak ditemukan" bukan berarti "tidak ada".** Untuk Bapanas, BPS, dan
   sistem pemda, ketentuan penggunaannya tidak berhasil dibaca — sebagian karena lamannya
   memberi galat 500. Perlakuan sebagai benih privat adalah sikap hati-hati, bukan temuan.
