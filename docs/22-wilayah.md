# Kosakata wilayah

`op:rgn` — 7.768 wilayah administratif Indonesia sampai tingkat kecamatan, dan satu
keputusan yang menentukan seluruh bentuknya: **nomor wilayah bukan kode wilayah.**

Kosakatanya di [`spec/vocab/region/`](../spec/vocab/region/), penyusunnya
[`spec/tools/bangun-wilayah.mjs`](../spec/tools/bangun-wilayah.mjs), lapis mentahnya
[`wilayah_data/`](../wilayah_data/LAPIS.md), penegaknya aturan `L44`.

---

## 1. Yang ada di dalamnya

| Tingkat | Jumlah | Kode |
|---|---:|---|
| Negara | 1 | ISO 3166-1 (`ID`) |
| Provinsi | 34 | BPS + Kemendagri |
| Kabupaten | 416 | BPS + Kemendagri |
| Kota | 98 | BPS + Kemendagri |
| Kecamatan | 7.219 | BPS + Kemendagri |
| **Total** | **7.768** | |

Kabupaten dan kota **dibedakan**, meskipun tingkatnya sama. Enum `level` diberi nilai
`city` di samping `regency` karena menyebut Kota Medan sebuah *regency* adalah kekeliruan
jenis, bukan penyederhanaan — dan itu menyangkut 98 wilayah. Jenisnya dibaca dari awalan
nama Kemendagri (`KAB.` atau `KOTA`), bukan ditebak: BPS membuang awalannya, sehingga dari
sisi BPS saja Kota Medan dan Kabupaten Medan tidak bisa dibedakan.

## 2. Kenapa nomornya bukan kode BPS

Godaannya besar: kode BPS hierarkis, unik, dan enak dibaca. `op:rgn:00003317` untuk
Rembang akan terbaca sendiri tanpa perlu dicari.

**Repositori ini sudah pernah melakukannya tanpa sengaja, dan hasilnya persis yang
ditakutkan.** Tiga berkas contoh menunjuk `op:rgn:00003318` berlabel *"Kabupaten
Rembang"* — nomor yang disusun agar menyerupai kode BPS. Kode BPS Rembang **3317**; 3318
adalah **Pati**. Ketika kosakata ini akhirnya dibangun, nomor itu ternyata menunjuk
**Babat Toman, sebuah kecamatan di Musi Banyuasin, Sumatera Selatan** — 700 km dari petak
yang dimaksud. `L10` meloloskannya tanpa suara, karena tujuannya memang ada.

Tetapi alasan yang sebenarnya lebih dalam daripada satu salah ketik.

**Kode wilayah bukan identitas, karena artinya bergantung siapa yang menomori.**

| Kode | Menurut BPS | Menurut Kemendagri |
|---|---|---|
| `91` | Papua Barat | **Papua** |
| `1401` | Kuantan Singingi | **Kabupaten Kampar** |
| `1403` | Indragiri Hilir | **Kabupaten Bengkalis** |

Bukan dua atau tiga: **167 kode sah di kedua sistem sekaligus sambil menunjuk wilayah yang
berlainan.** Angka yang tidak menyebut skemanya di situ bukan kabur — ia bisa salah, dan
salahnya tidak bisa dilihat pembacanya.

Nomor yang janjinya *tidak pernah didaur ulang* tidak boleh diturunkan dari angka yang
artinya bergantung skema. Jadi:

- **`id`** — nomor internal, diberikan sekali, tidak pernah berpindah wilayah.
- **`code` + `code_scheme`** — kode BPS beserta namanya, selalu berpasangan.
- **`mappings`** — kode BPS *dan* kode Kemendagri, dua-duanya, sebagai crosswalk.

## 3. Nomor yang sudah diberikan tidak pernah bergeser

Penyusunnya **membaca keluarannya sendiri lebih dulu**, mempertahankan tiap pasangan
kode→nomor yang sudah ada, dan hanya menomori wilayah yang belum punya — di ekor blok
tingkatnya.

Tanpa itu, satu kabupaten pemekaran akan menggeser nomor seluruh wilayah sesudahnya, dan
tiap rujukan lama akan menunjuk tempat yang salah **tanpa satu galat pun menyala** — sebab
nomor barunya tetap sah, tetap ada, dan tetap sebuah wilayah. Ini bahaya yang sama dengan
kasus Babat Toman, hanya datang dari arah lain.

Blok per tingkat, supaya provinsi baru tidak perlu mengantre di belakang 7.000 kecamatan:

```
1–9        negara
10–99      provinsi
100–1999   kabupaten & kota
2000–19999 kecamatan
20000+     BELUM DIALOKASIKAN — zona agroekologi ambil dari sini,
           bukan dari sisa blok wilayah administratif
```

## 4. `L44` — tiga hal yang dijaga

| Ditolak | Kenapa |
|---|---|
| `code` tanpa `code_scheme` | 167 kode sah di dua sistem sambil menunjuk wilayah berlainan |
| Jenjang yang melompat atau putus | kecamatan berinduk langsung ke provinsi membuat penjumlahan ke atas menghitung wilayah yang sama dua kali |
| Rujukan wilayah yang labelnya tidak sepakat dengan tujuannya | inilah yang akan menangkap kasus Babat Toman pada detik pertama |

Yang ketiga **sengaja hanya berlaku untuk wilayah**, dan itu diputuskan setelah diuji ke
seluruh korpus: **2.166 dari 47.627 rujukan berlabel punya label yang berbeda dari
entitasnya, dan hampir seluruhnya benar.** Registri produk menuliskan nama bahan
sebagaimana tercetak di kemasan — *Mancozeb*, *Propiconazole* — sementara entitasnya
memakai ejaan Indonesia yang dibakukan — *Mankozeb*, *Propikonazol* — dan justru ejaan
kemasan itu yang perlu dipertahankan, karena itulah yang dibaca petani di toko.

Nama wilayah tidak punya varian semacam itu. Tidak ada "ejaan kemasan" untuk Kabupaten
Rembang. Aturan yang benar di satu jenis entitas dan salah di jenis lain **harus disempitkan
ke jenis itu**, bukan dilonggarkan jadi peringatan sampai tidak ada yang membacanya.

## 5. Ejaan sumbernya, dan apa yang dilakukan terhadapnya

BPS menulis seluruh nama dengan huruf kapital, dan sepuluh di antaranya janggal:

- **Empat dieja huruf demi huruf** — `S I A K`, `D U M A I`, `B A T A M`, `B U L O`.
- **Enam berspasi ganda** — `TEWEH  BARU`, `ANGKOLA  BARAT`, dan seterusnya.

Kesepuluhnya dirapikan, dan kesepuluhnya **menyimpan ejaan aslinya di `synonyms`** —
konvensi repositori ini berbunyi *nama asli tidak pernah ditimpa*, dan itu berlaku untuk
nama wilayah sama seperti untuk nama principal.

Lima puluh nama lain memuat **angka Romawi yang benar-benar bagian dari namanya** —
`Rokan IV Koto`, `Bathin VIII`, `X Koto`. Daftar angka Romawinya ditulis **eksplisit,
bukan sebagai pola**, karena `IDI` (Aceh Timur), `LILI`, dan `DI` semuanya cocok dengan
pola angka Romawi tanpa satu pun di antaranya angka.

## 6. Sambungan pertama yang ditagih

`harga.schema.json` sudah menuliskan janjinya sendiri jauh sebelum kosakata ini ada:

> *"Begitu kosakata wilayah benar-benar dibangun, medan `id` bisa ditambahkan di
> sampingnya tanpa membatalkan yang ini."*

Ditagih apa adanya. Delapan seri harga TBS kelapa sawit kini membawa `region.id` di
samping `region.code`, dan **tidak satu pun yang lama dibatalkan**: `code` tetap kode ISO
3166-2:ID yang dipakai sumber harganya, `label` tetap *"Kepulauan Bangka Belitung"*
sebagaimana tercetak di sana meskipun BPS menyingkatnya *"Kep. Bangka Belitung"*.

Pencocokannya dilakukan **menurut nama, bukan dari tabel kode yang ditulis tangan**.
Tabel tulis tangan adalah tempat kekeliruan diam bersembunyi — dan kasus Babat Toman
persis itu. Pencocokan nama gagal berisik; tabel tulis tangan gagal diam-diam.

## 6b. Sambungan kedua: 5.844 balai penyuluhan

`bpp.schema.json` menuliskan janji yang sama: *"kosakata `region` belum terisi. Begitu
kosakata wilayah berdiri, medan-medan ini yang jadi jalannya."* Ditagih juga.

Sambungannya **dua, dengan mutu yang berbeda — dan bedanya harus terlihat.**

### Kabupaten/kota — lewat kode, keras

SIMLUHTAN memakai kode **BPS**, dan itu dipastikan dengan menghitungnya, bukan menduganya:
**5.842 dari 5.844 rekaman cocok sebagai kode BPS, hanya 5.649 sebagai kode Kemendagri.**
Selisih itu yang memutuskan, dan tanpa mengukurnya `regency_code_scheme` hanya akan jadi
tebakan yang tampak resmi.

Dua rekaman tersisa membawa kode `9191` untuk Manokwari Selatan — **bukan kode BPS mana
pun**; yang benar 9111. Kode aslinya **tidak dibetulkan** (itulah yang benar-benar dikirim
sumbernya), dan `id`-nya dicocokkan lewat nama sebagai cadangan. Cadangan itu dibatasi
kabupaten/kota **di provinsi yang sama**, dan batas tingkat itu bukan kehati-hatian
berlebihan: ada juga **kecamatan** bernama "Manokwari Selatan", di dalam Kabupaten
Manokwari. Pencocokan nama tanpa batas tingkat akan menyambungkan balai ke kecamatan
alih-alih ke kabupatennya — dan hasilnya tidak akan tampak keliru dari namanya sendiri.

**5.844 dari 5.844 balai tertaut.**

### Kecamatan — lewat nama, lunak, dan kelunakannya dicatat

SIMLUHTAN tidak memberi kode kecamatan, hanya nama. Dari **6.824 sebutan**:

| `match` | Jumlah | Artinya |
|---|---:|---|
| `exact` | 6.704 | nama sama persis sesudah dinormalkan |
| `approx` | 33 | jarak sunting di dalam ambang, dan tepat satu calon memenuhinya |
| `none` | 87 | tidak tertaut — **barisnya tetap ada dengan namanya** |

Yang tak tertaut **tidak dijatuhkan**. Daftar binaan yang kehilangan barisnya terbaca
sebagai kecamatan yang tidak dibina, dan itu kekeliruan yang tidak bisa dilihat
pembacanya.

### Ambang yang sebanding panjang nama — dipelajari dari kekeliruan

Ambang tetap ≤ 2 sunting dicoba lebih dulu. Hasilnya **36 pasangan, dan ketiga puluh enam
diperiksa satu per satu.** Tiga puluh tiga benar-benar varian ejaan — Minangkabau menulis
*Sintuak* untuk *Sintuk*, Aceh menulis *Seunuddon* untuk *Seunudon*, Bogor menulis
*Klapanunggal* untuk *Kelapa Nunggal*.

**Tiga salah, dan ketiganya salah dengan cara yang sama:**

| SIMLUHTAN | Dicocokkan ke | Kenyataannya |
|---|---|---|
| `NAMBO` | Kambu | **dua kecamatan berbeda** di Kota Kendari |
| `YARO` | Yaur | **dua kecamatan berbeda** di Nabire |
| `BARUMUN BARU` | Barumun Barat | **dua kecamatan berbeda** di Padang Lawas |

Pada nama pendek, dua sunting bukan salah ketik melainkan **tempat lain**. Ambangnya
karena itu dibuat sebanding panjang — `min(2, max(1, ⌊panjang × 0,18⌋))` — dengan gerbang
panjang minimum enam aksara. Ketiganya tertolak; ongkosnya satu pasangan benar yang ikut
tertolak (*Lubuk Alung* → *Lubuak Aluang*).

**Ongkos itu dibayar dengan sadar.** Tautan yang hilang terlihat di cacahan `none`; tautan
yang salah tidak terlihat siapa pun.

### Yang 87 itu sebagian besar bukan kegagalan pencocokan

Dibaca satu per satu, mayoritasnya kecamatan yang **memang belum ada di potret wilayah
BPS**: *Danau Kerinci Barat*, *Kota Komba Utara*, *Lamba Leda Utara*, *Umbu Ratu Nggay
Tengah*, *Mandiangin Timur*, *Kusan Tengah*, *Rote Barat Laut*. **SIMLUHTAN lebih baru
daripada layanan bridging BPS.** Sisanya varian ejaan yang jaraknya melewati ambang —
*Pantai Ceuremen* vs *Pante Ceureumen* (3 sunting), *Kota Kendal* vs *Kendal* (4).

*Rote Barat Laut* layak disebut tersendiri: ia berjarak 3 dari *Rote Barat Daya* dan 4
dari *Rote Barat*, dan ketiganya kecamatan yang benar-benar berbeda. Ambang yang lebih
longgar akan menelannya — dan itu argumen paling kuat untuk tidak melonggarkannya.

### Apa yang menjaganya

`L44` diperluas: tiap kecamatan binaan yang punya `id` harus **benar-benar berada di dalam
kabupaten balainya**, dan harus bertingkat `district`. Itu satu-satunya pemeriksaan mesin
atas sambungan yang dibuat pencocokan nama — dan ia menjaga persis kekeliruan yang tidak
akan tampak dari namanya sendiri.

## 7. Yang tidak ada, dan kenapa

**Desa dan kelurahan.** Sumbernya menyediakannya. ~83.000 desa akan melipatgandakan
berkasnya sepuluh kali untuk tingkat yang belum dipakai satu pun rekaman di repositori ini,
sementara kecamatan sudah dipakai: balai penyuluhan dibina per kecamatan, dan Katam
berskala kecamatan.

**Empat provinsi Papua hasil pemekaran 2022** — Papua Selatan, Papua Tengah, Papua
Pegunungan, Papua Barat Daya. Layanan bridging BPS memuat **34 provinsi**, bukan 38, dan
yang tidak diberikan sumbernya tidak dikarang di sini. Kekosongan itu **konsisten dengan
seluruh data lain di repositori ini** — SIMLUHTAN juga 34 provinsi dan 514 kabupaten/kota,
begitu pula sisi toko dan penyuluh — sehingga menambahkan empat provinsi dari ingatan
justru menghasilkan wilayah yang tidak bisa dijoin dengan satu berkas pun. Ini kekosongan
yang disebut, bukan yang disembunyikan.

**Geometri.** Tidak ada batas, tidak ada koordinat, tidak ada luas. Sebuah wilayah di sini
adalah nama, kode, dan induknya — bukan bentuk di peta.

**Zona agroekologi.** `level` sudah memuat nilainya dan `Region.agroclimate` sudah ada
bentuknya sejak [21-agroklimat.md](21-agroklimat.md), tetapi **belum ada satu pun yang
diisi**: batas zona agroekologi tidak mengikuti batas administratif, dan menetapkannya
menuntut poligon yang tidak dipegang repositori ini. Bloknya sudah disisihkan — `rgn`
20000 ke atas.

## 8. Yang tersambung, dan yang belum

| Sisi | Keadaan |
|---|---|
| **Harga** — 8 seri TBS | **tersambung** — `region.id` di samping `region.code` |
| **Petak** — `Plot.region` | **tersambung** — contoh Rembang kini menunjuk wilayah yang benar |
| **Wilayah → agroklimat** | bentuknya ada, **isinya nol** — menuntut deret iklim per wilayah |
| **BPP** — 5.844 balai | **tersambung** — 5.844/5.844 ke kabupaten/kota, 6.737/6.824 sebutan kecamatan; `regency_code` kini bernama skemanya |
| **Toko** — 2.248 rekaman berwilayah | **belum** — masih teks |
| **Indeks & permukaan app** | **belum** — `toko-wilayah.json` dan `bpp-wilayah.json` masih disusun dari nama, bukan dari `op:rgn` |

Yang tersisa toko dan permukaan app. Toko lebih sulit daripada BPP dan bukan karena
kodenya: **ia tidak punya kode sama sekali**, hanya nama kabupaten — sehingga seluruh
sambungannya akan bertumpu pada pencocokan nama, tanpa kode yang mengunci kabupatennya
lebih dulu. Pelajaran dari 87 kecamatan tak tertaut berlaku langsung di sana, dan begitu
juga pelajaran dari *Nambo* → *Kambu*.

---

## Bacaan lain

- [`wilayah_data/LAPIS.md`](../wilayah_data/LAPIS.md) — lapis mentah & cara menarik ulang
- [`spec/00-konvensi-kerja-paralel.md`](../spec/00-konvensi-kerja-paralel.md) — bagian 4b
- [21-agroklimat.md](21-agroklimat.md) — lubang yang ditutup kosakata ini
