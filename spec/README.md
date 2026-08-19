# Open Protocols — Spesifikasi Lapis 1 (Ontologi) v0.1

Primitif yang dipakai bersama oleh **protokol** (Lapis 2) dan **eksekusi di lapangan**
(Lapis 3). Kalau lapis ini benar, komoditas kedua dan ketiga bisa masuk tanpa
membongkar ulang; kalau salah, semuanya harus ditulis ulang.

> **Status:** draf kerja. Base URI `https://spec.openprotocols.id/v0.1/` masih
> sementara — akan diganti setelah keputusan nama di Fase 0 selesai. Ganti dengan
> satu operasi cari-ganti pada `$id` dan `$ref`.

---

## Isi

```
spec/
├── README.md                     dokumen ini
├── 01-identitas-dan-versi.md     aturan ID stabil, versi, dan status
├── 02-crosswalk.md               pemetaan ke AGROVOC, AgrO, ICASA, ADAPT, dll.
├── 03-keputusan-desain.md        keputusan yang diambil dan alasannya
├── schema/                       19 berkas JSON Schema (draft 2020-12)
├── vocab/                        kosakata terkurasi — 1.754 entitas + 67 fase
│   └── product/                  registri produk — 14.920 entitas (NDJSON)
├── examples/                     10 contoh nyata: cabai, kopi, udang vaname
├── fixtures-invalid/             contoh yang HARUS ditolak — bukti aturannya bekerja
├── tools/                        penarik registri Kementan, bisa diulang
├── check.mjs                     logika pemeriksa
├── validate.mjs                  CLI pemeriksa
└── test-rules.mjs                uji negatif
```

## Menjalankan pemeriksaan

```bash
cd spec && npm install && npm run all
```

`npm run check` memvalidasi seluruh contoh terhadap skema lalu menjalankan aturan
kebijakan. `npm test` membuktikan setiap aturan benar-benar menolak data yang salah —
pemeriksa yang tidak pernah gagal tidak membuktikan apa pun.

---

## Bentuk model

Tiga kelompok entitas. Yang membuat semuanya menyatu adalah **`Step`**.

### Kosakata terkurasi — dikelola dewan redaksi, ID 8 digit

| Entitas | Prefiks | Isi |
|---|---|---|
| `Commodity` | `op:cmd` | Komoditas yang dibudidayakan. `kind` mencakup crop, livestock, aquaculture, fungi, insect |
| `Variety` | `op:vty` | Varietas, kultivar, klon, galur. Menyimpan SK pelepasan |
| `StageScale` / `Stage` | `op:sca` / `op:stg` | Skala fase. BBCH untuk tanaman; skala berbasis umur untuk non-tanaman |
| `Substance` | `op:sub` | Bahan generik: hara, bahan aktif, agens hayati, pembenah, pakan. **Lapis netral-vendor** |
| `Preparation` | `op:sed` | **Sediaan buatan sendiri** — resep terbuka kompos, MOL, ekstrak nabati. Boleh masuk protokol; produk tidak |
| `Product` | `op:prd` | Produk komersial. Wajib punya izin edar yang bisa diverifikasi |
| `OperationType` | `op:opt` | Jenis tindakan, hierarkis |
| `Variable` | `op:var` | Apa pun yang bisa diamati atau diukur |
| `Method` | `op:met` | Cara aplikasi atau cara pengamatan |
| `Pest` | `op:pst` | OPT: hama, penyakit, gulma, nematoda |
| `Region` | `op:rgn` | Wilayah administratif dan zona agroekologi |
| `DeviationReason` | `op:dev` | Alasan realisasi menyimpang dari rencana |

### Data usaha tani — milik petani, ID UUIDv7

| Entitas | Prefiks | Isi |
|---|---|---|
| `Actor` | `op:act` | Orang atau organisasi, beserta jejak persetujuan (UU 27/2022) |
| `Plot` | `op:plt` | Unit produksi terkecil. `kind` mencakup sawah, rumah kaca, kebun, **tambak**, kandang |
| `Cycle` | `op:cyc` | Satu siklus budidaya pada satu Plot |
| `Step` | `op:stp` | **Satu langkah — direncanakan atau dikerjakan** |
| `PreparationBatch` | `op:bat` | Satu kali pembuatan sediaan, beserta catatan suhu dan hasil ujinya |

### Tipe bersama — `schema/common.schema.json`

`Ref`, `LangText`, `Quantity`, `Rate`, `Timing`, `Condition`, `Geometry`,
`ExternalMapping`, `Provenance`, `EvidenceTier`, `Lifecycle`, `DataClassification`,
`CuratedEntity`.

---

## Tiga hal yang membuat model ini agnostik

Bukan karena entitasnya dibuat kabur, tapi karena tiga titik variasi ini dibuat eksplisit.

**1. `Step.mode` — rencana dan realisasi berbentuk sama.**
Satu entitas, dua mode. `planned` wajib punya `timing`; `executed` wajib punya
`occurred_at`. Karena bentuknya identik, kepatuhan protokol bisa dihitung langsung
tanpa penerjemahan antar-model. Ini nilai utama seluruh platform, dan ia lahir dari
satu keputusan skema.

**2. `Rate.basis` — dosis tidak selalu per hektar.**
`per_area`, `per_plant`, `per_animal`, `per_row_length`, `per_volume_water`,
`per_mass_biomass`, `per_volume_pond`, `per_mass_seed`, `absolute`.
Pemupukan cabai memakai `per_area`; pakan udang memakai `per_mass_biomass` — entitas
yang sama, tanpa cabang kode per komoditas.

**3. `Timing` — lima bentuk waktu.**
`absolute` (tanggal pasti) · `relative` (30 HST) · `stage` (BBCH 51) ·
`condition` (bila trips ≥ 5 per daun) · `recurrence` (tiap hari, DOC 16–45).
Penjadwalan berbasis fase dan berbasis ambang inilah yang membedakan protokol dari
jadwal kalender yang kaku.

Bukti ketiganya bekerja ada di `examples/` — cabai lahan terbuka, kopi untuk EUDR,
dan udang vaname intensif memakai entitas yang persis sama.

**Titik variasi keempat, ditambahkan v0.1:** `Preparation` — masukan yang dibuat
sendiri di kebun. Sebagian besar petani tidak memakai karung bermerek; mereka
memformulasi sendiri. Karena resepnya terbuka dan bukan milik siapa pun, resep boleh
disebut langsung di langkah rencana milik protokol — dan netralitas vendor justru
membuat isi protokol lebih konkret, bukan lebih kabur. Riset dan standarnya ada di
[`docs/01-sediaan-buatan-sendiri.md`](../docs/01-sediaan-buatan-sendiri.md).

---

## Aturan yang ditegakkan mesin

Skema menegakkan bentuk. Kebijakan tidak bisa dinyatakan skema, jadi ditegakkan
linter — dan diuji di `fixtures-invalid/`.

| Aturan | Isi |
|---|---|
| `L1` | ID dan `key` tidak boleh kembar |
| `L2` | Apa pun berstatus `published` wajib punya `content_hash` |
| `L3` | **Netralitas vendor** — langkah rencana milik protokol tidak boleh menyebut produk komersial |
| `L4` | Dosis konsentrasi wajib disertai volume pembawa |
| `L5` | **Keselamatan** — aplikasi yang menyasar OPT wajib menyatakan `phi_days` |
| `L6` | **PDP** — menyimpan kontak wajib disertai dasar pemrosesan |
| `L7` | Plot bergeometri tidak boleh diklasifikasikan `public` |
| `L8` | Realisasi yang berbeda dari rencana wajib menyebut alasannya |
| `L9` | Entitas terkurasi wajib punya pemetaan luar atau alasan tertulis mengapa tidak ada |
| `L10` | Rujukan harus menunjuk entitas yang benar-benar ada di kosakata |
| `L11` | Variabel bertipe quantity wajib punya satuan; bertipe category wajib punya daftar kategori |
| `L12` | Cara aplikasi harus cocok dengan dasar dosisnya — penyemprotan tidak bisa berbasis per_animal |
| `L13` | Bentuk langkah harus sesuai `expects` jenis tindakannya — pengamatan tidak boleh membawa aplikasi input |
| `L14` | Produk tanpa komposisi tidak boleh dipakai menghitung hara yang diberikan |
| `L15` | Jumlah entitas pada berkas NDJSON harus cocok dengan yang dinyatakan metanya |
| `L16` | **Sediaan pengendali OPT** wajib menyatakan rezim pestisida, `own_use_only`, dan tenggang panen |
| `L17` | **Sanitasi** — bahan mentah pembawa patogen wajib melewati proses termofilik atau diberi tenggang panen ≥ 90 hari |
| `L18` | Hara yang diberikan hanya boleh dihitung dari batch sediaan yang benar-benar diuji |
| `L19` | Bahan berstatus `prohibited` — tembakau, akar tuba — ditolak di resep mana pun |
| `L20` | Sediaan mikroba wajib punya kriteria pelepasan bertipe cemaran |
| `L21` | Batch yang gagal uji pelepasan tidak boleh dipakai di lahan |
| `L22` | **Bahan aktif yang dilarang** menurut Permentan 43/2019 ditolak; yang berstatus terbatas diperingatkan |

Aturan-aturan ini bukan hiasan. Saat 382 bahan aktif dimasukkan, `L1` langsung menangkap
tabrakan `key` pada **belerang** — yang ternyata terdaftar sebagai hara sekaligus fungisida.
Yang salah bukan datanya, melainkan model yang memaksa satu bahan hanya punya satu peran;
`substance_class` diubah jadi `substance_classes` yang jamak.

Aturan `L3` adalah janji netralitas vendor yang berubah jadi kode. Bukan lagi
kalimat di kebijakan yang bisa dilanggar diam-diam.

---

## Kosakata inti (`vocab/`)

Isi awal, cukup untuk menyusun protokol referensi hortikultura pertama.

| Berkas | Isi | Pemetaan luar |
|---|---|---|
| `stage-scale-bbch-solanaceae.json` | **63 fase BBCH** untuk cabai, tomat, terung | BBCH |
| `stage-scale-doc-udang.json` | 4 fase berbasis umur budidaya udang | — (beralasan) |
| `operation-type.json` | **61 jenis tindakan**, hierarkis, dari olah tanah sampai pengangkutan | 28 ke AgrO / ICASA |
| `variable.json` | **46 variabel** — pertumbuhan, OPT, tanah, air, cuaca, hasil | 15 ke ICASA / AgrO |
| `method.json` | 19 cara aplikasi dan pengamatan, dengan `compatible_bases` | 9 ke AgrO / ICASA |
| `substance.json` | 7 bahan non-pestisida — hara utama, pembenah, pakan | ICASA |
| `substance-pestisida.json` | **1.593 bahan aktif** — seluruh yang tercantum di registri | 1.593 ke KEMENTAN, 58 punya kode IRAC/FRAC/HRAC |
| `product/pestisida.ndjson` | **7.724 produk pestisida** terdaftar, dengan 23.058 penggunaan berlabel | KEMENTAN |
| `product/pupuk.ndjson` | **7.196 produk pupuk** terdaftar (SIMPEL + SIMPUK 2020) | KEMENTAN |
| `pest.json` | 10 OPT utama cabai | 10 ke EPPO, semua perlu verifikasi |
| `commodity.json` | 5 komoditas — 4 hortikultura, 1 perikanan budidaya | NCBITaxon, AGROVOC |
| `deviation-reason.json` | 11 alasan simpangan, dengan sinyal tindak lanjutnya | — (beralasan) |
| `product.json` | 3 **contoh** produk, semua `unverified` — bukan registry | — (beralasan) |
| `substance-organik.json` | **21 bahan baku sediaan** — kotoran ternak, sisa tanaman, bahan nabati. 2 dilarang, 5 dibatasi | — (beralasan) |
| `preparation.json` | **12 resep sediaan buatan sendiri** — kompos, bokashi, kascing, MOL, POC, biakan hayati, ekstrak nabati, Biosaka | — (beralasan) |

**Cakupan pemetaan: 16.586 dari 16.677 entitas (99%) punya kaitan ke standar luar.** Sisanya
membawa `no_mapping_reason` tertulis. Yang belum terpetakan terpusat di `operation-type`
dan `variable`: banyak tindakan hortikultura tropis — pengajiran, perempelan, pembumbunan,
kocor, tugal — memang tidak punya padanan di kosakata yang dibangun untuk pertanian
beriklim sedang. Itu temuan yang layak dilaporkan, bukan disamarkan.

**16 pemetaan masih bertanda `PERLU VERIFIKASI`** — seluruh kode EPPO dan nomor konsep
AGROVOC/NCBITaxon. Pemeriksa akan terus memperingatkan sampai dicek satu per satu ke
sumbernya. Tidak boleh naik ke status `published` sebelum itu.

### Registri Kementan sebagai sumber

Bahan aktif dan produk diturunkan langsung dari [database pupuk & pestisida terdaftar
Kementan](https://ap-simpel.pertanian.go.id/), ditarik 19 Agustus 2026: **7.724 formulasi
pestisida** (termasuk rumah tangga, pengendalian vektor, pengawet kayu, peternakan) dan
**7.196 produk pupuk** dari dua basis data. Tanpa ambang — seluruhnya masuk, supaya setiap
rujukan komposisi sampai ke entitas yang ada.

Registri resminya sendiri tidak punya nama kanonik: bahan yang sama muncul dalam beberapa
ejaan — `Sipermetrin`, `sipermetrin`, `SIPERMETRIN`, dan `Cypermethrin` semuanya hidup
berdampingan. Dari 1.527 nama yang tersisa setelah normalisasi ringan, **389 punya lebih
dari satu ejaan**. Setiap entitas di sini memilih satu nama kanonik dan menyimpan seluruh
ejaan lain sebagai `synonyms`, sehingga baris registri mana pun bisa dipetakan balik.
Inilah alasan konkret lapis generik ini ada.

Derivasinya bisa diulang siapa saja:

```bash
node tools/tarik-registri-pestisida.mjs
```

Empat permintaan ke endpoint resmi, lalu menurunkan daftar bahan aktif kanonik dan daftar
principal. Berkas mentahnya sengaja tidak disimpan di repositori — skrip yang bisa diulang
lebih berguna daripada berkas besar yang basi.

**Nomor CAS sengaja dikosongkan.** Pengayaan itu pekerjaan terpisah terhadap registri
kimia; menebaknya lebih berbahaya daripada mengosongkannya. Kode IRAC, FRAC, dan HRAC yang
ada diambil dari daftar resmi masing-masing komite, bukan dari ingatan — 58 bahan aktif
sudah terisi, cukup untuk mulai menyusun aturan rotasi anti-resistensi.

### Status hukum bahan aktif

Setiap bahan aktif membawa `hazard.regulatory_status` yang menyebut instrumen hukumnya,
letak persisnya di dalam peraturan, dan tanggal verifikasi — sehingga bisa ditelusuri dan
diperbarui saat regulasinya berubah.

Sumbernya **Permentan No. 43 Tahun 2019 tentang Pendaftaran Pestisida**, yang berstatus
berlaku dan **mencabut Permentan 39/2015 beserta perubahannya**. Ini penting: banyak
rujukan daring masih memakai daftar 2015 yang sudah tidak berlaku.

| | |
|---|---:|
| Bahan aktif dilarang (Lampiran I.A) | **102** |
| — untuk semua bidang penggunaan | 69 |
| — khusus tanaman padi | 31 |
| — khusus rumah tangga / perikanan | 2 |
| Bahan aktif terbatas (Lampiran III.A) | **9** |
| Bahan tambahan dilarang / dibatasi | 23 / 7 |

**Silang-cek terhadap registri menghasilkan nol pelanggaran.** Tidak ada satu pun bahan
yang dilarang untuk semua bidang yang masih terdaftar; tidak ada produk berlabel padi yang
mengandung bahan terlarang untuk padi; tidak ada produk rumah tangga mengandung klorpirifos.
Kedua data saling menguatkan, jadi `L22` berfungsi sebagai penjaga, bukan pembersih.

85 bahan yang dilarang tetapi tidak ada di registri tetap dimuat ke kosakata — justru supaya
sistem punya sesuatu untuk ditolak kalau nama itu muncul di protokol atau catatan lapangan.

### Tiga temuan tentang registrinya sendiri

**Registri pupuk tidak memuat kandungan hara sama sekali.** Tidak satu pun dari 7.196
produk pupuk punya komposisi — kolomnya memang tidak ada di sumber. Artinya neraca hara
tidak bisa dihitung dari registri resmi. Aturan `L14` menolak pemakaiannya untuk menghitung
hara yang diberikan; produk boleh ada, tapi angkanya tidak boleh dikarang.

**Registri hanya memuat izin yang masih berlaku.** Kedaluwarsa terawal 12 Oktober 2026, dan
tidak ada satu pun yang sudah lewat. Produk yang izinnya habis hilang begitu saja dari
portal — jadi catatan musim lalu bisa menunjuk produk yang tidak ada lagi di sumber. Itulah
alasan snapshot ini disimpan di repositori, bukan ditarik saat dibutuhkan.

**Sasaran pada label adalah teks bebas.** 23.058 baris penggunaan berlabel memakai 890 nama
komoditas dan 1.531 nama OPT yang belum dibakukan, dan 23% tidak mencantumkan dosis.
Registri juga tidak memuat tenggang waktu sebelum panen sama sekali. Teks aslinya disimpan
apa adanya di `commodity_label`, `pest_label`, dan `rate_text`; merekonsiliasinya ke
kosakata adalah pekerjaan kurasi tersendiri, dan mengarangnya sekarang akan membuat
ontologi palsu.

### Yang perlu dibaca sebelum memakai `product.json`

Berkas itu **bukan registry produk**. Tiga entri di dalamnya berstatus registrasi
`unverified` dengan nomor izin edar sengaja dikosongkan, dan angka pada `label_uses`
adalah contoh struktur, bukan salinan label produk mana pun. Registry sungguhan diisi
pada Fase 3 dari daftar resmi Kementan.

---

## Yang sengaja BELUM ada di v0.1

Supaya cakupannya jujur:

- **`Protocol` (Lapis 2)** — menunggu wawancara Fase 1 selesai. Menyusun bentuk
  protokol sebelum tahu siapa pengambil keputusan sebenarnya adalah menebak.
- **Cuaca, hasil uji tanah lengkap, dan model tanaman** — dirujuk lewat `Variable`,
  belum dimodelkan sendiri.
- **Ketertelusuran rantai pasok (GS1 EPCIS)** — `Plot.geoids` sudah menyiapkan
  kaitannya; sisanya menunggu jalur pendapatan EUDR di Fase 6.
- **Alsintan, stok gudang, dan keuangan usaha tani** — `Step.cost` sengaja
  dibuat tipis; model biaya penuh belum dibutuhkan sebelum ada data pilot.
- **Kesetaraan dosis sediaan dengan pupuk pabrik** — berapa ton kompos setara berapa
  kilogram urea. Butuh data lapangan Fase 4; mengarangnya sekarang akan membuat
  neraca hara terlihat pasti padahal tidak.
- **Tumpangsari dalam satu petak** — untuk sementara dimodelkan sebagai dua `Cycle`
  pada `Plot` yang sama. Perlu diuji ke lapangan sebelum dikunci.
