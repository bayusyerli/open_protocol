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
6. **Konstanta rendemen yang dipakai butir 5 ternyata asumsi, bukan pengukuran** — dikoreksi
   23 Agustus 2026 dari 21% ke **19,7%**, dan itu menggeser angka utama yang dibaca petani
   dari 66% ke 70%. Bagian 7a menerangkannya beserta dua temuan yang mengubah bentuk
   modulnya.

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

- **Gabah tidak ada di sumber harian mana pun** — PIHPS tidak memuatnya. Tetapi **bulanan
  sudah tertutup**: CSV produsen Bapanas memuat `GKP Tk. Petani` untuk 38 provinsi,
  2023–2026, terunduh terbuka tanpa kunci — lihat bagian 3a. Yang benar-benar terkunci
  tinggal frekuensi hariannya.
- **Jawa Barat dan Banten tanpa jalan pintas.** Jabar provinsi hortikultura terbesar di Jawa,
  dan di belakang portalnya nol portal CKAN kabupaten. Banten tidak punya sistem sama sekali
  sejak PRIANGAN mati.
- **Cabai pada satu-satunya sumber berlisensi bersih** berhenti Mei 2024.
- **Benih dan pupuk non-subsidi di SP2KP adalah arsip mati** — 15 tanggal mingguan pada paruh
  pertama 2024, lalu berhenti. Jangan bangun antarmuka yang menyiratkan umpan berjalan.
- **Nol dari 13 agritech memberi harga petani.** Alasannya struktural, bukan teknis: selisih
  beli-dari-petani dan jual-ke-konsumen persis adalah marjin mereka. Arah pencarian ini
  tertutup permanen dan tidak perlu diulang.

### 3a. Gabah tingkat petani: sudah terbuka, bulanan

Diverifikasi 22 Agustus 2026 dengan menarik sendiri berkasnya. CSV harga produsen Bapanas
(`data.badanpangan.go.id`, HTTP 200, tanpa kunci, tanpa autentikasi) memuat 17 komoditas
tingkat produsen — termasuk yang paling dicari:

| Komoditas | Cakupan |
|---|---|
| `GKP Tk. Petani` | 2.256 baris · 38 provinsi · 2023–2026 · **63% sel terisi** |
| `GKP Tk. Penggilingan`, `GKG Tk. Penggilingan` | pasangannya, sehingga selisih petani→penggilingan bisa dihitung langsung |
| `Bawang Merah`, `Cabai Merah Besar`, `Cabai Merah Keriting`, `Cabai Rawit Merah`, `Jagung Pipilan Kering`, `Kedelai Biji Kering` — semuanya **Tingkat Petani** | hortikultura & palawija di tingkat petani |

Dua hitungan yang langsung keluar darinya, dan keduanya adalah kalibrasi yang dibutuhkan
modul harga:

- **Selisih GKP petani → penggilingan: median 5,6%** (n=628 pasangan provinsi-bulan).
- **Terhadap HPP Rp6.500/kg** (Kepbadan 14/2025): pada 2025, **68 dari 235 pengamatan
  provinsi-bulan berada di bawah HPP — 28%**; pada 2026 turun ke 15%. Median 2025
  Rp6.557/kg, 2026 Rp6.696/kg.

> Angka 28% itu berasal dari data pemerintah sendiri. Ia mengukur seberapa sering lantai
> harga tidak tercapai di tingkat petani — persis pertanyaan yang membuat modul harga layak
> dibangun, dan ia bisa dijawab hari ini tanpa menunggu kunci API apa pun.

**Lisensinya tetap kosong**, jadi berkas ini **benih privat**: dipakai untuk menghitung dan
mengkalibrasi, tidak diterbitkan. Untuk kebutuhan kalibrasi selisih pasar→petani, tingkat itu
memang sudah cukup.

**Dua catatan bentuk.** Harga tersimpan sebagai string ber-prefiks (`"Rp5,494"`), bukan
angka. Dan penamaan komoditasnya belum baku: `Beras Medium Tingkat Penggilingan` dan
`Beras Medium Tk. Penggilingan` hadir sebagai dua entri untuk hal yang sama — pola yang sama
seperti `Minyak Kita` versus `Minyakita`. Normalkan saat penyerapan.

**Yang buntu:** dataset BPS di data.go.id — *Rata-rata Harga Gabah Bulanan … di Tingkat
Petani*, pasangan penggilingannya, dan *Kasus Harga Gabah di Bawah HPP* — metadatanya nyata
(15 berkas tahunan, 2008–2022) tetapi **15 dari 16 tautan sumber dayanya menunjuk
`http://10.42.0.15`**, alamat LAN privat yang bocor ke katalog publik. Satu-satunya tautan
publiknya hanyalah beranda `bps.go.id`. Tidak terjangkau, dan bukan karena jaringan lokal.


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
   rendemen (**OER sawit 19,7%** — lihat bagian 7a, angka ini dikoreksi dari 21%; kadar karet
   kering bokar ±55%); kakao dan kopi boleh dibandingkan langsung. Tanpa koreksi itu, TBS
   terhadap CPO dunia tampak **7,26×** padahal sebenarnya **1,43×** — dan petani akan
   menyimpulkan dirinya ditipu tujuh kali lipat. Sebaliknya pada kakao dan kopi jurangnya
   nyata dan tidak terkoreksi: petani menerima 41% dan 55%. Di sanalah harga dunia justru
   satu-satunya alat tawar yang dimilikinya.
5. **Tayangkan rasio, bukan dua angka bersebelahan.** "Harga Anda = **70%** setara-CPO dari
   harga dunia" jauh lebih sulit disalahpahami. **Dan garis penuhnya bukan 100%** — lihat
   bagian 7a.
6. **Penduga farmgate dinyatakan terbuka sebagai perkiraan**, bukan sebagai harga terukur.

## 7a. Rendemen — koreksi 23 Agustus 2026

Butir 4 dan 5 di atas semula memakai **OER 21%**. Angka itu keliru, dan cara kelirunya layak
dicatat karena ia jenis kekeliruan yang paling sulit terlihat: ia bukan salah hitung, ia
**asumsi yang menyamar jadi hasil pengukuran.**

### Bagaimana ketahuannya

Angka 7,26× dan 1,52× dokumen ini berhasil direproduksi persis dari dua sumber berlisensi
terbuka:

- FAOSTAT *Producer Prices*, `Oil palm fruit`, Indonesia, 2024 = **US$132,70/ton** (CC BY 4.0)
- World Bank Pink Sheet, kolom `Palm oil`, rata-rata 12 bulan 2024 = **US$964/ton** (CC BY 4.0)

`964 ÷ 132,70 = 7,26×` ✓. Tetapi **1,52× hanya keluar bila OER = 21%** — dan tidak ada sumber
yang mengukur 21%. Yang benar-benar diukur:

| Sumber | OER | Cakupan | Lisensi |
|---|---:|---|---|
| MPOB, API `/api/oer` | **19,67%** (2024) · 19,74% (2025) | Malaysia, bulanan 2000-01→2026-07 | © MPOB — benih privat |
| FAOSTAT QCL, dihitung sendiri | **19,62–19,73%** (2018–2023) | **Indonesia**, tahunan | CC BY 4.0 |
| Permentan 01/2018 Lampiran II | 21,30–22,34% | provinsi × umur | tanpa hak cipta — **tetapi sudah dicabut** |

Dua metode yang sama sekali independen — pengukuran kilang Malaysia dan rasio produksi
Indonesia — bertemu di **~19,7%**. Angka 21–22% berasal dari **tabel rendemen peraturan**,
yaitu patokan administratif untuk menghitung harga, bukan rendemen yang terjadi di kilang.
Keduanya berselisih ±2 poin, dan 2 poin itu ≈ **12% pada harga TBS**.

**Angka bawaan yang dipakai sejak sekarang: OER 19,7%**, dan ia wajib bisa diubah pengguna.

### Apa yang berubah pada angka yang dibaca petani

| OER | TBS setara-CPO 2024 | Rasio | Yang tampil di layar |
|---|---:|---:|---|
| 21,00% (asumsi lama) | US$631,90 | 1,53× | **66%** |
| **19,70% (dipakai sekarang)** | **US$673,42** | **1,43×** | **70%** |
| 19,67% (MPOB terukur) | US$674,63 | 1,43× | 70% |

Diuji silang lewat rute yang sama sekali lain: acuan TBS pintu-kilang Malaysia 2024
(RM44,98 per 1% OER × 19,67% = RM884,76 ÷ 4,576428 MYR/USD = US$193,33) dibanding harga petani
Indonesia US$132,70 = **68,6%**. Dua jalan berbeda bertemu di ~69–70%.

### Dua temuan yang mengubah bentuk modulnya, bukan cuma angkanya

**Pertama: garis penuhnya bukan 100%, melainkan ~108–110%.** MPOB mengutip harga TBS **per
1% OER**, dan angka itu diturunkan dari **CPO + PK + CPKO** — bukan CPO saja:

> *"MPOB FFB Reference Price at 1% OER is based on the current market price of CPO, PK and
> CPKO according to region, derived from contract registration by licensees to MPOB."*

Sehingga harga TBS pintu-kilang yang sehat duduk di **107,6% (2024)** dan **110,4% (2025)**
dari setara-CPO murni, karena nilai inti sawit ikut di dalamnya. Menampilkan 100% sebagai
garis penuh akan membuat pasar yang berfungsi pun terlihat merugikan petani. Membandingkan
TBS hanya terhadap `CPO × OER` **merendahkan nilainya secara sistematis sekitar 8–10%**.

**Kedua: rendemen adalah properti KILANG, bukan konstanta nasional.** Juni 2026, dari 451
kilang yang dilaporkan MPOB: OER terendah **12,44%**, tertinggi **24,20%** — hampir dua kali
lipat. Sebaran antar-kilang itu lebih besar daripada seluruh selisih yang sedang
diperdebatkan di atas. Ini argumen terkuat agar medan rendemen **bisa diubah petani**, dan
bukan sekadar boleh diubah: petani yang tahu kilang tujuannya punya angka yang lebih benar
daripada rata-rata nasional mana pun.

### Satu-satunya rendemen Indonesia yang bisa diterbitkan — dan ia tayang

Batas paling menyakitkan dari koreksi ini: angka yang paling meyakinkan (MPOB, terukur di 451
kilang) justru yang **tidak boleh diterbitkan ulang**. Yang boleh terbit — FAOSTAT — adalah
rasio produksi tahunan, bukan rendemen terukur.

Kekosongan itu terisi belakangan, dari arah yang tidak diduga. **Kalimantan Timur menerbitkan
tabel rendemennya sendiri di dalam surat keputusan harga TBS**, per pita umur tanaman, dan
surat keputusan adalah dokumen resmi negara: bukan hak cipta, boleh diterbitkan ulang. Tabel
itu kini **tayang di halaman harga TBS Kaltim** (`app/harga.js`, `kartuRendemen`) — lihat
bagian 8b untuk cara menariknya.

| Umur tanaman | Rendemen CPO | Rendemen inti |
| ---: | ---: | ---: |
| 3 tahun | 19,30% | 4,35% |
| 10 tahun ke atas | 21,83% | 5,05% |

**Rentang 19,30–21,83% itu mengapit 19,7%, dan sekaligus menjelaskan asal 21%.** Angka 21%
bukan sekadar "terlalu tinggi" — ia rendemen **kebun tua** yang dipakai untuk semua umur.
Selisih 2,53 poin menurut umur saja, di dalam satu provinsi, sudah lebih besar daripada
seluruh koreksi 21% → 19,7% yang jadi pokok bagian ini. Ia menguatkan kesimpulan di bawah dari
sisi lain: kalau umur tanaman saja menggeser rendemen sebanyak itu, satu konstanta nasional
memang tidak pernah cukup.

Yang tabel ini **bukan**: ia rendemen yang *ditetapkan untuk menghitung harga*, sama jenisnya
dengan tabel peraturan yang bagian ini tolak sebagai "OER resmi". Ia dipakai karena
menerangkan **bentuk** sebarannya — bahwa rendemen bergerak menurut umur, dan ke arah mana —
bukan untuk menggantikan 19,7% sebagai angka bawaan.

### Yang tidak boleh dipakai sebagai OER

**Jangan pakai FAOSTAT SCL** (*Supply Utilization Accounts*). Rasionya keluar **21,294%
persis, identik tiga tahun berturut-turut**, dan sepanjang 2010–2023 hanya melompat diskret
lalu datar. Itu koefisien teknis asumsi FAO yang dimainkan balik, bukan kinerja kilang. Rasio
QCL bervariasi tahun ke tahun sehingga lebih mendekati kenyataan — tetapi ia tetap **rasio
produksi tahunan, bukan OER terukur**; pakai sebagai uji kewajaran, jangan diberi label
"OER resmi". Lompatan 21,71% pada 2019 adalah kejanggalan data, bukan lonjakan rendemen.

### Batas koreksi ini

- Angka MPOB **benih privat** (© MPOB, tanpa lisensi terbuka): boleh dipakai mengkalibrasi
  dan membandingkan, **tidak boleh diterbitkan ulang**. Yang boleh terbit angka FAOSTAT.
- Lisensi CC BY 4.0 Pink Sheet dikutip dari halaman kebijakan umum World Bank; entri
  katalognya sendiri konsisten membalas **HTTP 429** saat diperiksa, dan halaman kebijakan itu
  menyebut pengecualian *"Externally-Sourced Data"*. **Satu langkah verifikasi ini masih
  terbuka sebelum menerbitkan.**
- Kolom `Palm oil` Pink Sheet **bukan satu seri**: ia sambungan lima spesifikasi berbeda
  (Crude DAP sejak Feb 2025; 5% Bulk CIF NW Europe; RBD FOB Malaysia; RBD CIF Rotterdam; dan
  Malaysia 5% cif). Memplot 1960→2026 sebagai satu garis berarti memplot empat produk pada
  tiga dasar penyerahan.
- Tabel rendemen pengganti Permentan 01/2018 **pindah ke Keputusan Dirjen Perkebunan dan
  belum ditemukan.** Permentan 13/2024 Pasal 7(2) hanya memberi faktor koreksi swadaya:
  rendemen tabel CPO tenera terkoreksi 90%, CPO dura 81%, PK tenera dan dura 110%.

---

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

## 8a. Yang berubah setelah penyerapan pertama — 23 Agustus 2026

Dokumen ini ditulis sebelum satu byte pun ditarik. Penyerapan pertamanya sudah dijalankan,
dan tiga hal berubah — dua di antaranya membatalkan rencana yang tertulis di atas.

**Jalur endpoint di bagian 5 butir 2 keliru.** `kld/api/list-harga-harian/{yyyy}/{m}` di
`satudata.kemendag.go.id` menjawab 404 lunak, dan katalog portalnya menolak POST dari luar
peramban lewat WAF. Yang benar ada di host lain: `api-sp2kp.kemendag.go.id`. Tiga endpoint
publiknya, dan hanya satu yang boleh dipakai:

| Endpoint | Putusan |
|---|---|
| `report/api/average-price-public` | **JANGAN.** Kesembilan medan `creator` — nik, nip, no_telp, alamat, email, first_name, last_name, jabatan — **masih ada, diperiksa ulang 23 Agustus 2026**. Peringatan bagian 5 butir 1 terverifikasi, bukan sekadar diwarisi. |
| `report/api/average-price-komoditas-public` | Bersih dari PII, tetapi **5.099.865 baris pada 10 baris per halaman** = 509.987 permintaan. Melanggar ketentuan portalnya sendiri. |
| `report/api/hnt` | **Yang dipakai.** Satu permintaan, 56 MB, seluruh riwayat, bersih dari PII — diperiksa atas seluruh isi, bukan atas cuplikan. |

**Cakupannya jauh lebih sempit daripada yang diperkirakan, dan ini temuan terpenting di
bagian ini.** SP2KP menerbitkan 88 varian dan **mengisi angkanya hanya untuk 43**. Yang 45
lagi kosong pada **keempat** ukuran tertimbang, bukan hanya pada yang dipakai layar, dan
`is_nasional` tidak menjelaskannya — 43 dari 45 justru bertanda nasional.

Ini varian keempat dari pelajaran "situs mati versus jalur tersaring" di bagian 5 butir 5:
situs hidup, endpoint sehat, respons 200, isinya sebagian besar kosong — dan kekosongannya
tidak berkorelasi dengan penanda apa pun yang dibawa rekamannya sendiri.

**Dugaan bagian 3 tentang benih dan pupuk benar, dan cakupannya lebih luas.** Dokumen ini
menyebut "benih dan pupuk non-subsidi di SP2KP adalah arsip mati". Terbukti — dan bukan cuma
arsip mati melainkan **arsip kosong**: Pupuk Urea, NPK 15-15-15, SP-36, ZA, Benih Jagung
Sebar, dan Benih Kedelai punya 13–15 tanggal terdaftar dengan **nol angka terisi**. Hanya
Benih Padi yang membawa angka, itu pun 15 titik.

Akibatnya untuk C9: sisi HET pupuk **tidak bisa diambil dari SP2KP**. Ia harus datang dari
teks peraturannya sendiri, yang bebas hak cipta — jalur yang bagian 6 sudah sebut, dan yang
sekarang jadi satu-satunya.

**Yang berhasil diserap:** 43 seri harian nasional tertimbang, 3 Januari 2024 – 21 Agustus
2026, 635 tanggal, 26.475 titik. Tersambung ke **23 dari 906** komoditas di kosakata sendiri;
57 varian sisanya bukan komoditas tani sama sekali — besi beton, semen, triplek, LPG, paku.
Nol komoditas perkebunan.

**Apa yang layar tampilkan dari 88 itu, dan kenapa bukan seluruhnya.** SP2KP mencampur dua
keranjang dalam satu endpoint, dan penggolongannya sendiri yang memisahkan —
`tipe_komoditas_id` 1 untuk barang kebutuhan pokok, 2 untuk barang penting. Keranjang kedua
memuat baja ringan, besi beton, kayu balok, triplek, paku, semen, dan LPG.

Tetapi garis "tipe 1 saja" keliru ke arah yang paling merugikan: keranjang kedua **juga**
memuat Benih dan Pupuk Non Subsidi, yang justru subjek inti repositori ini. Maka
penggolongannya tiga, bukan dua:

| Golongan | Varian | Berangka | Di layar |
|---|---:|---:|---|
| `pangan` — yang dipanen, diternakkan, atau ditangkap di sini | 40 | 29 | ya |
| `input` — benih dan pupuk | 7 | 1 | ya |
| `luar` — bahan bangunan, LPG, pangan olahan, barang impor | 41 | 13 | tidak |

Pemisah golongan `luar` sempat beralasan "bahan bakunya impor", dan alasan itu keliru: tebu
dan sawit ditanam di Indonesia, tetapi harga gula pasir dan minyak goreng tetap **harga
eceran barang olahan** — yang menghadapinya pembeli di toko, bukan petani tebu maupun petani
sawit. Yang membedakan tingkat olahannya, bukan asal bahan bakunya. Beras tetap masuk meski
digiling: satu langkah dari gabah, dan itu cara harga padi diucapkan di seluruh Indonesia.

Garam menempuh jalan berbeda ke kesimpulan yang sama, dan layak dicatat karena ia bukan
soal "hasil tani atau bukan": petani garam memang memanennya sendiri. Yang SP2KP terbitkan
`Garam Halus` — sudah digiling dan beryodium — sementara **garam krosok yang benar-benar
keluar dari tambak tidak diterbitkan sama sekali.** Jadi angka yang ada bukan angka yang
dihadapi petani garam, dan itu alasan yang sama persis seperti gula terhadap petani tebu.

**Barang impor keluar lewat pertanyaan yang sama.** Tidak ada petani Indonesia yang
menghadapi harga daging sapi impor beku atau kedelai impor. Penyaringnya satu-satunya yang
berupa pola, bukan daftar nama, karena SP2KP menyatakan asal impor di dalam nama variannya
sendiri — sehingga varian impor baru ikut tersaring tanpa ada yang perlu ingat menambahkannya.

> **Batas yang tersisa, dan ia nyata.** Yang tersaring hanya yang MENGAKU impor di namanya.
> `Bawang Putih Honan` dan `Bawang Putih Kating` hampir seluruhnya impor dari Tiongkok —
> Indonesia memenuhi sekitar 5% kebutuhan bawang putihnya sendiri — tetapi namanya tidak
> menyebutkannya, jadi keduanya tetap tampil. Mengeluarkannya menuntut pengetahuan yang
> tidak ada di data ini; menuliskannya sebagai daftar nama berarti mengaku begitu.

Yang `luar` **tetap tercatat di kosakata**, dan jumlahnya disebut di layar beserta daftarnya
di balik satu ketukan. Menyaringnya diam-diam akan membuat cacah di layar tidak pernah cocok
dengan cacah di dokumen ini, dan selisih yang tak terjelaskan itu justru yang membuat orang
berhenti memercayai keduanya.

**Aturan tayang bagian 7 yang sudah ditegakkan di layar:** butir 1 (tiga jenis angka
dipisah — yang ada hanya eceran, dan layar mengatakannya di atas angkanya, bukan di catatan
kaki), butir 6 (tidak ada penduga farmgate sama sekali). Butir 2, 3, 4, dan 5 belum berlaku
karena datanya belum ada: jumlah responden tidak dibawa endpoint `hnt`, dan tidak ada satu
pun harga dunia maupun komoditas perkebunan yang terserap.

---

## 8b. Sisi sawit — harga pertama yang menyentuh pekebun, 23 Agustus 2026

Riset terpisah atas sumber harga kelapa sawit menemukan satu sumber yang layak diserap
segera, dan dua temuan yang mengubah bacaan seluruh sisi ini.

**SIDIKH TBS Kalimantan Barat sudah diserap.** Aplikasi Disbunnak Kalbar menyajikan tabel
HTML ter-render server: satu `GET`, tanpa autentikasi, tanpa AJAX, `robots.txt` berbunyi
`Disallow:` kosong. Diperiksa sendiri 23 Agustus 2026 — **50 periode, nol sel kosong**,
empat periode per bulan, Agustus 2025 II sampai Agustus 2026 III, tanpa satu pun medan orang.
Ini satu-satunya penetapan TBS provinsi yang ditemukan terbit dalam bentuk terbaca mesin;
Riau, Kalteng, Kaltim, dan Babel menerbitkannya sebagai PDF pindai, JPEG desain, atau
tangkapan layar WhatsApp.

**Ini harga pertama di repositori ini yang `price_level`-nya bukan `retail`.** Sampai
sebelumnya seluruh harga eceran, dan skema sengaja tidak pernah memberi nilai lain supaya
layar tidak bisa menayangkan harga eceran seolah harga petani. Penetapan TBS mengubah itu:
ia harga yang WAJIB dibayar pabrik kepada pekebun, ditetapkan rapat provinsi.

**Tetapi batasnya terpasang di dasar hukumnya, dan itu temuan yang paling penting di bagian
ini.** Permentan 01/2018 sudah dicabut oleh **Permentan 13/2024**, yang berjudul *"Pembelian
Tandan Buah Segar Kelapa Sawit Produksi **Pekebun Mitra**"*. Penetapan ini secara hukum
menaungi pekebun plasma dan mitra; **pekebun swadaya berada di luar cakupannya** — dan
merekalah mayoritas petani sawit Indonesia.

> Ini pola yang sama persis dengan temuan bagian 4 untuk beras: yang dicatat negara sebagai
> harga produsen ternyata harga beli pengumpul. Di sawit, yang ditetapkan negara sebagai
> harga pekebun ternyata harga pekebun **mitra**. Dua komoditas, dua rezim, satu bentuk
> kekeliruan — dan keduanya baru terlihat setelah dasar hukumnya dibaca, bukan datanya.

Karena itu skema `harga` menambah medan **`legal_scope`**, wajib bila `basis` bernilai
`penetapan`, dan layar menampilkannya sebagai blok peringatan di atas angkanya — bukan
catatan kaki.

**Riau menyusul, dan ia membawa yang tidak ada di mana pun: harga pekebun SWADAYA.**
Disbun Riau menerbitkan penetapan mingguan untuk DUA kelompok secara terpisah — mitra plasma
dan swadaya — sementara provinsi lain hanya menerbitkan yang pertama. Diserap lewat
**Media Center Riau**, bukan lewat PDF pindai Disbun: hasil rapat yang sama terbit di sana
sebagai prosa HTML berangka, dan arsipnya lebih dalam (Agustus 2023, bukan November 2024).

| Seri | Penetapan terurai | Rentang |
|---|---:|---|
| Riau — pekebun **swadaya** | 71 | 2 Agu 2023 → 13 Mei 2026 |
| Riau — mitra plasma | 16 | 25 Sep 2023 → 29 Apr 2026 |

**Angkanya harga pada umur 9 tahun, bukan rata-rata.** Riau menetapkan untuk rentang umur
3–30 tahun tetapi mengumumkan satu angka, dan sumbernya sendiri menandai baris itu
`(tertinggi)` pada artikel yang memuat tabel penuh. Sembilan tahun adalah puncak kurva hasil
sawit — menayangkannya sebagai "harga TBS Riau" tanpa menyebut umurnya akan menaksir terlalu
tinggi apa yang diterima kebun muda maupun kebun tua. 36 dari 87 penetapan memuat tabel umur
utuh dalam prosanya; sisanya hanya angka umur 9.

**Prosa itu rapuh, jadi tiap angka diambil dua kali.** Satu artikel memuat sedikitnya empat
bilangan berbentuk rupiah — tingkat harga, selisih mingguannya, harga CPO, dan harga kernel.
Pengurai naif akan menerbitkan selisihnya sebagai harga, dan tak seorang pun akan tahu. Karena
itu angkanya diambil dari badan artikel DAN dari judulnya lalu dibandingkan; yang tidak
sepakat ditolak. Penjaga itu benar-benar berbunyi: satu artikel terurai Rp3,21 dari badannya
sementara judulnya menyebut Rp3.351,72, dan ditolak. Untuk judul yang memang tidak berangka,
pembandingnya berpindah ke uji julat terhadap serinya sendiri — yang justru lebih tajam untuk
kekeliruan ini, karena selisih mingguan berukuran puluhan rupiah dan tingkat harga ribuan.

**87 dari 101 artikel terurai (86%); 14 ditolak dan sebabnya dilaporkan tiap kali dijalankan.**

> **Yang belum dipastikan tentang seri swadaya Riau:** apakah ia membawa daya ikat hukum yang
> sama dengan penetapan mitra, atau diterbitkan sebagai keterangan. Yang pasti hanya bahwa ia
> diumumkan rapat penetapan yang sama. Ini perlu dijawab sebelum angkanya dipakai sebagai
> dasar apa pun selain penerangan.

**Kalimantan Tengah menyusul — arsip terdalam dari ketiganya.** `POST /berita` dengan
`cari=Harga TBS` mengembalikan keseluruhan 58 artikel dalam satu respons, tanpa paginasi.
**41 terurai (71%)**, mundur sampai **Januari 2021**. `robots.txt`-nya menjawab 403 sementara
seluruh isinya terlayani 200 — salah konfigurasi Apache, bukan penolakan; RFC 9309 bagian
2.3.1.3 memperlakukan 4xx selain 429 sebagai tanpa pembatasan, dan itu **diperiksa** dengan
memastikan isinya sendiri terlayani.

**Uji bentuk kurva menangkap satu rekaman yang lolos semua pemeriksaan lain sambil rusak.**
Pada satu artikel, umur 3 terurai Rp2.901 — lebih tinggi daripada pita 10–20 — dengan umur 6
dan 8 hilang, akibat pola yang menyeberangi batas kalimat. Uji julat meloloskannya karena
nilainya masuk akal *sebagai harga*. Yang menangkapnya bentuk, bukan besaran: harga TBS naik
menurut umur sampai puncaknya, jadi **pita termuda wajib yang terendah**. Aturan itu sekarang
mengikat, dan ia agronomi — bukan kebetulan penulisan.

Satu pelajaran kecil ikut: artikel sebelum 2024 **mengeja umurnya dengan kata** ("umur tanaman
tiga tahun Rp1.723,70"), yang lebih baru memakai angka, dan keduanya dipakai bergantian di
dalam satu artikel yang sama. Tanpa menanganinya, 33 dari 58 artikel tertolak — seluruhnya
yang lebih tua.

**Pita puncaknya berbeda antar-provinsi, dan itu tidak boleh diratakan.** Riau mengumumkan
umur 9; Kalteng mengumumkan pita 10–20 tahun. Keduanya puncak kurva hasil di daerahnya
masing-masing, tetapi keduanya pita yang berlainan — menyandingkan angkanya tanpa menyebut
pitanya berarti membandingkan dua hal yang berbeda.

### Kaltim dan Babel — lewat OCR, dan Kaltim membawa rendemen yang bagian 7a cari

Keduanya terbit sebagai gambar, jadi keduanya menuntut OCR. Dipakai **Vision.framework bawaan
macOS**, bukan tesseract: yang terakhir tidak terpasang dan memasangnya menambah dependensi
sistem untuk alat yang dijalankan sebulan sekali, sementara Vision sudah ada di setiap macOS
dan pada teks cetak yang bersih lebih akurat tanpa penyetelan. Konsekuensinya alatnya hanya
berjalan di macOS, dan itu dinyatakan alih-alih ditemukan sendiri.

**Kaltim — 83 penetapan, Januari 2021 → April 2025, dan satu kolom yang tidak dimiliki
provinsi mana pun.** Surat keputusannya berkolom Indeks K, harga CPO, **rendemen CPO per pita
umur**, harga inti sawit, rendemen inti, lalu harga TBS. Kolom rendemen itu menjawab langsung
kekosongan yang bagian 7a nyatakan: satu-satunya sumber rendemen terukur yang bisa dikutip
adalah MPOB Malaysia, dan MPOB benih privat. Kaltim menerbitkannya di dalam surat keputusan,
yang menurut UU 28/2014 Pasal 41 huruf b bukan objek hak cipta.

Nilainya **19,30%–21,83% menurut umur tanaman**, median 20,92% dari 82 penetapan. Itu
mengapit angka bawaan 19,7% — dan sekaligus menajamkannya: **satu angka rendemen nasional
memperlakukan seluruh kebun seolah setua satu sama lain**, padahal selisih antar-umur di satu
provinsi saja lebih dari dua poin. Angka 21% yang dikoreksi bagian 7a ternyata bukan sekadar
"terlalu tinggi" — ia rendemen kebun TUA yang dipakai untuk semua umur.

**Babel — 4 penetapan saja, dan PDF-nya justru yang harus diabaikan.** Tiap pengumuman
membawa dua lampiran: berita acara PDF dan selebaran PNG. PDF biasanya pilihan yang benar
karena bisa berlapis teks — dan PDF ini memang berlapis teks. Tetapi lapisan itu hasil OCR
pihak lain yang rusak: `Ju.'n`, `e219`, `'t5.7 t7,3f`, `2'1.23`. Selebaran PNG-nya terbaca
Vision dengan keyakinan 1,00 pada hampir seluruh barisnya. Yang dipakai gambarnya.

> **Lapisan teks tidak otomatis lebih baik daripada OCR ulang.** Alat OCR di repositori ini
> karena itu mengeluarkan medan `asal` — `lapisTeks` atau `ocr` — supaya keputusan mana yang
> dipercaya bisa diambil per berkas, bukan diasumsikan sekali untuk semua.

Arsip Babel **tipis dan bergulir**: hanya empat pengumuman terjangkau, dan yang lama
menghilang. Seperti Kalbar, arsipnya jadi milik kita hanya kalau ditarik rutin.

**Crawl-delay 10 detik** pada host lampiran Babel dihormati apa adanya.

### Aceh — arsip yang bisa dibuktikan lengkap, dan koreksi atas klaim dokumen ini sendiri

Diserap 23 Agustus 2026. **9 penetapan, Juli 2024 → Juli 2026**, dibaca OCR dari selebaran
resmi Distanbun Aceh.

**Arsipnya bisa dienumerasi seluruhnya, dan itu yang pertama.** Halaman `/berita` dirender di
peramban, jadi sekilas ia menuntut penjelajahan. Ia tidak: skrip halamannya sendiri menyusun
`'/json' + pathname + '.json'`, dan endpoint itu mengembalikan **seluruh 1.765 artikel dalam
satu respons** — tanpa paginasi, tanpa kunci. Kelengkapan serinya karena itu bisa
*dibuktikan*, bukan diharapkan. Bandingkan Riau, yang indeksnya sampai kini tidak bisa
dienumerasi, dan Sulbar di bawah, yang gugur justru karena itu.

> Ini pelajaran SP2KP yang berulang untuk ketiga kalinya: halaman yang tampak dirender
> peramban kerap punya endpoint bersih di belakangnya. Yang menemukannya membaca skrip
> halaman, bukan menebak alamat.

**Aceh menerbitkan harga pekebun SWADAYA — dan dokumen ini semula menyatakan hanya Riau yang
melakukannya.** Klaim itu keliru dan sudah dikoreksi di tabel kekosongan di bawah. Tetapi
koreksinya tidak berhenti pada hitungan:

| | Riau | Aceh |
|---|---|---|
| Sumbu harga swadaya | **umur tanaman** | **komposisi bahan tanam** (% tenera : % dura) |
| Jumlah pita | 13 pita umur | 7 komposisi, 100% sampai 40% tenera |
| Sebanding? | — | **tidak** |

**Sumbunya berlainan, jadi angkanya tidak boleh disandingkan.** Dan perbedaan sumbu itu
sendiri menerangkan sesuatu: pekebun plasma kebunnya tercatat, jadi umurnya diketahui dan
dipakai. Pekebun swadaya kebunnya tidak tercatat, jadi yang dipakai bahan tanamnya — dura
menghasilkan minyak jauh lebih sedikit daripada tenera. Sumbu itu mengukur **apa yang bisa
diketahui tentang kebun yang tidak tercatat**, bukan apa yang paling menentukan harganya.

**Satu provinsi, dua harga, dua Indeks K.** Aceh membelah wilayahnya jadi timur dan barat,
masing-masing dengan Indeks K sendiri (89,86% dan 89,15% pada 29 Juli 2026). Yang barat selalu
lebih rendah. Keduanya dibawa utuh; garis grafik memakai timur, dan itu dinyatakan di layar.

**Rendemennya TETAP, dan bentuknya melengkapi Kaltim.** Tigabelas nilainya identik di seluruh
penetapan yang terbaca — ia tabel patokan untuk menghitung harga, jenis yang sama dengan yang
bagian 7a tolak sebagai "OER resmi". Yang membuatnya tetap layak tayang **bentuknya**:

| | Kaltim | Aceh |
|---|---|---|
| Rentang | 19,30%–21,83% | **15,82%–21,83%** |
| Selisih | 2,53 poin | **6,01 poin** |
| Pita tertua | ≥10 tahun | 25 tahun |
| Bentuk | naik sampai ujung tabel | naik sampai 10–20, **lalu turun** |

Kaltim berhenti di "≥10 tahun", jadi tabelnya hanya memperlihatkan kebun muda menghasilkan
lebih sedikit. Aceh meneruskannya sampai 25 tahun dan memperlihatkan sisi yang lain: **hasil
kebun tua menurun juga.** Ia satu-satunya tabel di repositori ini yang mengakui itu — dan
puncaknya, 21,83%, persis sama dengan puncak Kaltim.

**Selebarannya berganti tata letak dua kali, dan itu yang mula-mula mematahkan penarikannya.**
Percobaan pertama mengenali selebaran dari kata kunci ("INFO HARGA", "MITRA PLASMA") dan gagal
pada 38 dari 42 artikel — kata kuncinya ikut berubah ketika tata letaknya berubah. Yang dipakai
sekarang tanda yang tidak berubah: sebuah gambar adalah selebaran harga bila **≥10 barisnya
berjangkar ke tabel rendemen tetap**. Karena rendemennya konstan, ia sekaligus jangkar baris
(kolom umur kerap tak terbaca) dan uji silang.

**Satu bug yang lolos semua uji sampai jangkarnya diperketat.** Pita 22 tahun (20,22%) dan 23
tahun (20,20%) hanya berjarak 0,0002. Toleransi pencocokan 0,0005 — yang tampak ketat —
menyerap keduanya ke pita yang sama, dan **pita 23 hilang dari seluruh rekaman tanpa satu pun
uji berbunyi**. Kecocokannya sekarang persis sampai empat desimal.

**Yang tidak terserap, dan ia justru yang paling berharga.** Dua artikel Januari–Maret 2023
melampirkan pindaian **berita acara**, bukan selebaran: lembar kerja lengkap berkolom R-CPO,
R-IS, harga inti sawit, dan rumusnya. Rendemennya di sana **berbeda-beda per umur dan per
periode** — 14,49% sampai 21,30% pada satu lembar — yaitu rendemen yang benar-benar dihitung,
bukan tabel tetap. Itu persis jenis angka yang bagian 7a cari. Ia tidak terserap karena
barisnya terlalu rapat: Vision menggabungkan tigabelas baris tabel jadi satu, dan susunannya
tidak bisa dipulihkan dari koordinat. Lembar itu juga memuat nama pejabat dan NIP.

**33 dari 42 artikel ditolak, dan 29 di antaranya sifat sumbernya sendiri:**

| Sebab | Jumlah |
|---|---:|
| Artikel melampirkan tangkapan layar Zoom / foto rapat, tanpa selebaran harga | 23 |
| Artikel tanpa lampiran sama sekali | 5 |
| Selebaran ada tetapi hanya sebagian terbaca (pindaian berita acara 2023) | 2 |
| Lampiran hilang dari server (404) | 1 |

Aceh menerbitkan **dua jenis artikel** untuk satu rapat — "Rapat Penetapan…" yang berisi
dokumentasi kegiatan, dan "Penetapan Harga…" yang membawa selebarannya. Hanya yang kedua
memuat angka. Karena penetapan yang sama kadang terbit dua kali, rekaman **dikunci menurut
periode berlaku, bukan menurut slug**; tanpa itu, seri sembilan titik terhitung sebelas.

### Sulawesi Barat — datanya ada, arsipnya tidak, dan harganya tidak diterbitkan

Diperiksa 23 Agustus 2026 dan **tidak bisa dipanen sebagai seri**, karena dua sebab yang
masing-masing sudah cukup:

1. **Arsipnya tidak bisa dienumerasi.** `?page=N` diabaikan — halaman 2 mengembalikan enam
   slug yang sama persis dengan halaman 1. Tidak ada `sitemap.xml`, `wp-json`, maupun `feed`;
   keempatnya 404. Yang terjangkau hanya pos yang kebetulan masih di beranda, dan itu
   berguguran seiring pos baru terbit.
2. **Artikelnya tidak menerbitkan harga TBS-nya.** Yang ada Indeks K (88,24%), harga CPO
   (Rp14.949,77), dan harga inti — lalu kalimatnya berbunyi harga TBS *"selanjutnya
   disesuaikan berdasarkan tahun tanam dan tingkat rendemen masing-masing kelompok umur
   tanaman"*. Angkanya sendiri tidak pernah disebut.

`robots.txt` Sulbar terbuka penuh, jadi ini bukan soal izin. Ia contoh keempat dari pelajaran
"endpoint sehat bukan berarti data ada": situs hidup, halaman terlayani 200, rapat penetapan
benar-benar berlangsung — dan angka yang dicari tidak ada di sana.

### Sebelas provinsi sawit lain — diperiksa 23 Agustus 2026, dan hasilnya sebagian besar mati

Pengintaian atas dinas perkebunan provinsi sawit yang belum diserap. Yang diperiksa hanya tiga
hal: DNS menjawab apa, HTTP menjawab apa, dan `robots.txt` berbunyi apa.

| Provinsi | Host | Hasil |
|---|---|---|
| **Aceh** | `distanbun.acehprov.go.id` | **200, `Allow: /` — diserap**, lihat di atas |
| **Lampung** | `disbun.lampungprov.go.id` | **Menerbitkan penetapannya sebagai PROSA berangka** ("Rp 3.242,42"), tetapi di balik Cloudflare — 403 baik dari mesin lokal maupun lewat proksi. Terjangkau lewat peramban. **Kandidat terkuat berikutnya** |
| **Kalimantan Selatan** | `disbunnak.kalselprov.go.id` | Cloudflare 403; isinya belum diperiksa |
| **Sumatera Selatan** | `disbun.sumselprov.go.id` | DNS menjawab `103.239.165.40`, tetapi **port 80 dan 443 dua-duanya menolak sambungan** — dari mesin lokal maupun lewat proksi. Dua titik pandang sepakat, jadi ini host mati, bukan jalur tersaring |
| **Sulawesi Tengah** | `disbunnak.sultengprov.go.id` | 200, hidup — tetapi berandanya **nol menyebut harga, TBS, maupun sawit** |
| **Sumatera Utara** | `disbun.sumutprov.go.id` | Tanpa A record (diuji ulang, masih mati) |
| **Sumatera Barat** | `perkebunan.sumbarprov.go.id` | Tanpa A record |
| **Bengkulu** | `disbun.bengkuluprov.go.id` | Tanpa A record |
| **Sulawesi Selatan** | `disbun.sulselprov.go.id` | Tanpa A record |
| **Jambi** | `disbun.jambiprov.go.id` | 200, hidup — tetapi situsnya cangkang: satu tautan isi (`/artikel/`), nol menyebut harga |
| **Sulawesi Barat** | `disbun.sulbarprov.go.id` | 200 — gugur karena dua sebab lain, lihat bagian di bawah |

**Pelajaran host mati kembali berlaku, dan kali ini dijalankan.** Percobaan lokal ke Sumsel
gagal dengan `ENETUNREACH`, yang **tidak bisa membedakan host mati dari jalur tersaring**. Satu
panggilan lewat proksi memutuskannya: `ECONNREFUSED` pada port 443 — host terjangkau dan
menolak. Dua titik pandang yang sepakat baru boleh disebut kesimpulan.

**Yang mengagregasi Sumsel justru swasta.** InfoSAWIT, agricom, dan sawitsetara ketiganya
menerbitkan penetapan Sumsel lengkap dengan daftar plasma dan swadaya — persis yang dinasnya
sendiri tidak lagi layani. Ini menguatkan temuan yang sudah ada di tabel kekosongan: agregasi
lintas provinsi di Indonesia dikerjakan swasta, bukan pemerintah.

### Yang masih kosong di sisi sawit

| Kekosongan | Keterangan |
|---|---|
| **Harga pekebun swadaya di luar Riau dan Aceh** | Di luar cakupan Permentan 13/2024. **Dikoreksi 23 Agustus 2026:** dokumen ini semula menyatakan hanya Riau yang menerbitkannya. Aceh juga — dan dengan sumbu yang berbeda. 32 provinsi lain tidak sama sekali |
| **Lampung dan Kalimantan Selatan** | Keduanya di balik Cloudflare; Lampung terbukti menerbitkan harganya sebagai prosa. Menariknya menuntut jalur peramban, bukan `fetch` |
| **Sumatera Utara** | Produsen terbesar. `disbun.sumutprov.go.id` tanpa A record; tangkapan Wayback terakhir 4 Desember 2022. Penetapan mingguannya berjalan tetapi hanya lewat GAPKI Sumut (swasta) |
| **Agregasi lintas provinsi pemerintah** | Tidak ada. Yang mengagregasi 22 provinsi justru swasta, dan tiga dari empat memblokir `ClaudeBot` di `robots.txt` — tidak dipanen |
| **Harga sawit di portal pertanian nasional** | `bdsp2.pertanian.go.id` tidak punya indikator harga sawit di skemanya, hanya luas areal dan produksi |

### Yang perlu dikerjakan manusia

- **Unduh dan baca batang tubuh Permentan 13/2024.** Seluruh bacaan "swadaya di luar
  cakupan" bersandar pada judul dan halaman peraturan, bukan pada pembacaan naskahnya.
- **Surel ke Bappebti** sebelum memakai CSV harga CPO hariannya
  (`POST bappebti.go.id/query_harga`, 182 baris terverifikasi, tanpa PII, 2005→kini). Tidak
  ada pernyataan lisensi apa pun di situsnya, dan tabel harga harian bukan "peraturan"
  sehingga UU 28/2014 Pasal 42 tidak otomatis menaunginya.
- **Riau lewat `mediacenter.riau.go.id`, bukan OCR** — hasil penetapan mingguan terbit
  sebagai teks HTML berangka di sana. Yang belum terpecahkan: indeksnya tidak bisa
  dienumerasi, jadi kelengkapan serinya belum terbukti.

---

### Label jangka perubahan diperbaiki — dan ia keliru di enam dari delapan seri TBS

Ditemukan saat Aceh masuk, tetapi bukan cacat Aceh. Layar menghitung perubahan berjangka
dengan mengambil titik terakhir **pada atau sebelum** n hari lalu. Untuk seri harian itu tepat
n hari. Untuk seri penetapan yang terbit dua pekan sekali — atau, seperti Aceh, beberapa kali
setahun — titik itu bisa jauh lebih tua:

| Seri | Label | Jarak sebenarnya |
|---|---|---:|
| Riau mitra plasma | "7 hari" | **56 hari** |
| Aceh (kedua kelas) | "30 hari" | **112 hari** |
| Kalteng | "7 hari" | 31 hari |
| Kaltim, Babel | "7 hari" | 15 hari |

Angkanya sendiri benar; yang salah **labelnya**. "Turun 2,3% dalam 30 hari" untuk perubahan
yang memakan 112 hari bukan pembulatan — ia pernyataan keliru tentang seberapa cepat harga
bergerak, dan ia melebih-lebihkan gejolak sampai hampir empat kali lipat. Jarak sesungguhnya
sekarang ikut keluar dari pembangun, dan layar menuliskannya alih-alih nama jendelanya.
Nama jendela hanya dipakai bila titik pembandingnya memang sedekat itu (toleransi seperempat
lebar jendela). Jendela yang jatuh ke titik yang sama tidak lagi tampil dua kali.

Satu koreksi kecil ikut: kartu pita umur menutup dirinya dengan kalimat "ia rata-rata seluruh
pita", padahal **tidak satu pun dari delapan seri memakai rata-rata** — semuanya memakai pita
puncak atau pita tertentu, dan tiap keterangannya sudah menyebutkan itu. Layar membantah
keterangannya sendiri di kartu yang sama. Arti garis grafik sekarang ikut data.

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
   skala, bukan dasar perhitungan. Sejak koreksi bagian 7a, hitungan sawitnya memakai OER
   19,7% dan sudah diuji silang lewat acuan TBS Malaysia; sebaran antar-kilang 12,44–24,20%
   tetap jauh lebih besar daripada ketepatan yang bisa dijanjikan angka nasional mana pun.
4. **Tidak ada satu pun wawancara lapangan.** Kesimpulan bahwa responden "produsen" adalah
   pengumpul ditarik dari nama responden dan ketiadaan metodologi, bukan dari menanyai
   mereka. Kesimpulan itu kuat, tetapi jenis buktinya tetap tidak langsung.
5. **Lisensi yang "tidak ditemukan" bukan berarti "tidak ada".** Untuk Bapanas, BPS, dan
   sistem pemda, ketentuan penggunaannya tidak berhasil dibaca — sebagian karena lamannya
   memberi galat 500. Perlakuan sebagai benih privat adalah sikap hati-hati, bukan temuan.
