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
├── 00-konvensi-kerja-paralel.md  blok ID, rentang nomor aturan, aturan main
├── 01-identitas-dan-versi.md     aturan ID stabil, versi, dan status
├── 02-crosswalk.md               pemetaan ke AGROVOC, AgrO, ICASA, ADAPT, dll.
├── 03-keputusan-desain.md        keputusan yang diambil dan alasannya
├── schema/                       19 berkas JSON Schema (draft 2020-12)
├── vocab/                        kosakata terkurasi — 4.228 entitas + 67 fase
│   ├── product/                  registri produk — 14.920 entitas (NDJSON)
│   └── variety/                  registri varietas — 11.227 entitas (NDJSON)
├── examples/                     10 contoh nyata: cabai, kopi, udang vaname
├── fixtures-invalid/             contoh yang HARUS ditolak — bukti aturannya bekerja
├── tools/                        penarik registri Kementan & pengisi komposisi pupuk, bisa diulang
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
| `Variety` | `op:vty` | Varietas, kultivar, klon, galur. Menyimpan seluruh perizinan — pelepasan, pendaftaran, perlindungan — karena akibat hukum ketiganya berbeda |
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
| `L23` | Entitas harus berada di dalam blok nomor yang diklaim berkasnya |
| `L24` | Berkas yang berbagi jenis entitas wajib menyatakan `id_blocks` |
| `L25` | Blok nomor tidak boleh bertindih antar-berkas |
| `L26` | Tautan OPT harus cocok dengan nama ilmiah di label; sasaran tidak boleh komoditas sekaligus tempat |
| `L27` | Komposisi produk yang melampaui 1.000 g per kg/L diperingatkan — mustahil secara fisik, artinya sumbernya keliru |
| `L28` | Komoditas hanya boleh memakai skala fase yang memang mencakupnya — tautannya wajib sepakat dua arah |
| `L29` | Rujukan tidak boleh menunjuk entitas berstatus `superseded` — entitas kembar dipertahankan agar ejaan aslinya bisa ditelusuri, bukan agar dipakai lagi |

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
| `stage-scale-bbch-solanaceae.json` | **63 fase BBCH** untuk cabai, tomat, terung — ditautkan ke 22 komoditas | BBCH |
| `stage-scale-bbch-padi.json` | **59 fase BBCH padi** — sepuluh fase utama, benih kering sampai hasil panen | BBCH |
| `stage-scale-bbch-jagung.json` | **46 fase BBCH jagung** — tanpa fase utama 2 dan 4, yang memang tidak dipakai | BBCH |
| `stage-scale-bbch-cucurbit.json` | **63 fase BBCH cucurbit** — semangka, melon, mentimun, labu | BBCH |
| `stage-scale-bbch-kedelai.json` | **66 fase BBCH kedelai** | BBCH |
| `stage-scale-bbch-kentang.json` | **77 fase BBCH kentang** — dua jalur, dari umbi dan dari biji | BBCH |
| `stage-scale-bbch-kopi.json` | **63 fase BBCH kopi** — benih, setek, dan stum sekaligus | BBCH |
| `stage-scale-bbch-bawang.json` | **51 fase BBCH sayuran umbi lapis** — bawang merah, putih, daun | BBCH |
| `stage-scale-bbch-kubis.json` | **60 fase BBCH sayuran daun berkrop** — kubis, petsai | BBCH |
| `stage-scale-bbch-daun-tak-berkrop.json` | **63 fase BBCH sayuran daun tidak berkrop** — sawi, caisim, pak choi, selada daun | BBCH |
| `stage-scale-bbch-brassica-lain.json` | **74 fase BBCH brassica lain** — kembang kol, brokoli | BBCH |
| `stage-scale-bbch-umbi-batang.json` | **54 fase BBCH sayuran umbi & batang** — wortel, lobak | BBCH |
| `stage-scale-bbch-buncis.json` | **56 fase BBCH buncis** — Phaseolus, bukan Vigna | BBCH |
| `stage-scale-bbch-kacang-tanah.json` | **69 fase BBCH kacang tanah** — termasuk perjalanan ginofor | BBCH |
| `stage-scale-bbch-bit.json` | **50 fase BBCH bit** — berbunga baru pada tahun kedua | BBCH |
| `stage-scale-bbch-kacang-polong.json` | **57 fase BBCH kacang polong** — kapri dan ercis | BBCH |
| `stage-scale-bbch-tembakau.json` | **156 fase tembakau** (CORESTA) — sampai pengeringan daun pascapanen | CORESTA |
| `stage-scale-bbch-alpukat.json` | **95 fase alpukat** — BBCH diperluas, dua trubus per tahun | BBCH |
| `stage-scale-durian.json` | **14 fase durian** — susunan sendiri, bukan BBCH; sampai pemeraman | — (beralasan) |
| `stage-scale-doc-udang.json` | 4 fase berbasis umur budidaya udang — ditautkan ke 1 komoditas | — (beralasan) |
| `operation-type.json` | **61 jenis tindakan**, hierarkis, dari olah tanah sampai pengangkutan | 28 ke AgrO / ICASA |
| `variable.json` | **46 variabel** — pertumbuhan, OPT, tanah, air, cuaca, hasil | 15 ke ICASA / AgrO |
| `method.json` | 19 cara aplikasi dan pengamatan, dengan `compatible_bases` | 9 ke AgrO / ICASA |
| `substance.json` | 17 bahan non-pestisida — hara makro & mikro, pembenah, pakan | ICASA |
| `substance-pestisida.json` | **1.593 bahan aktif** — seluruh yang tercantum di registri | 1.593 ke KEMENTAN, 58 punya kode IRAC/FRAC/HRAC |
| `product/pestisida.ndjson` | **7.724 produk pestisida** terdaftar, dengan 23.058 penggunaan berlabel | KEMENTAN |
| `product/pupuk.ndjson` | **7.196 produk pupuk** terdaftar (SIMPEL + SIMPUK 2020) | KEMENTAN |
| `variety/varietas.ndjson` | **11.227 varietas terdaftar** — pelepasan, pendaftaran, dan perlindungan varietas | KEMENTAN |
| `pest.json` | 10 OPT utama cabai | 10 ke EPPO, semua perlu verifikasi |
| `pest-registri.json` | **1.360 organisme sasaran** dari label produk | KEMENTAN + GBIF |
| `commodity-registri.json` | **482 komoditas sasaran** dari label produk | KEMENTAN |
| `commodity-varietas.json` | **418 jenis tanaman** dari registri varietas yang belum ada di kosakata | KEMENTAN |
| `target-site.json` | 35 tempat aplikasi — bukan komoditas | KEMENTAN |
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
| Bahan **tambahan** dilarang (Lampiran I.B) | **23** |
| Bahan **tambahan** dibatasi (Lampiran III.B) | **7**, dengan batas pemaparan |

**Silang-cek terhadap registri menghasilkan nol pelanggaran.** Tidak ada satu pun bahan
yang dilarang untuk semua bidang yang masih terdaftar; tidak ada produk berlabel padi yang
mengandung bahan terlarang untuk padi; tidak ada produk rumah tangga mengandung klorpirifos.
Kedua data saling menguatkan, jadi `L22` berfungsi sebagai penjaga, bukan pembersih.

85 bahan yang dilarang tetapi tidak ada di registri tetap dimuat ke kosakata — justru supaya
sistem punya sesuatu untuk ditolak kalau nama itu muncul di protokol atau catatan lapangan.

Bahan tambahan yang dibatasi membawa **batas pemaparan per cakupan**, karena satu bahan bisa
punya dua batas berbeda: N-metil pirolidon maksimum 25 ppm untuk pestisida rumah tangga
tetapi 600 ppm untuk pengelolaan tanaman. Etilen oksida dan etilen dibromida muncul di dua
lampiran sekaligus — sebagai bahan aktif dan sebagai bahan tambahan — jadi entitasnya satu
dengan dua entri status, dibedakan lewat `applies_to`.

Dua catatan verifikasi yang belum tuntas: pada lapisan teks PDF, Lampiran I.B melompati
nomor **18 dan 21**, dan Lampiran III.B menuliskan CAS asam sulfat sebagai `7669-93-9`
padahal nomor bakunya `7664-93-9`. Keduanya ditandai di data, bukan diam-diam ditambal.

### Rekonsiliasi sasaran pada label

23.058 baris penggunaan berlabel memakai teks bebas untuk menyebut sasarannya. Sekarang
sudah ditautkan ke kosakata:

| | |
|---|---:|
| Tertaut ke komoditas | 91,7% |
| Tertaut ke tempat aplikasi | 6,7% |
| **Sasaran tertaut** | **98,5%** |
| **OPT tertaut** | **96,1%** |

Tiga keputusan yang membentuk hasilnya.

**Tempat aplikasi dipisahkan dari komoditas.** "Di dalam ruangan", "Gudang", "Kayu
gergajian" bukan organisme yang dibudidayakan. Memaksanya jadi `Commodity` akan mengarang
ontologi, jadi ada entitas tersendiri `TargetSite` — 35 entri, 6,7% pemakaian.

**Identitas OPT diambil dari nama ilmiah, bukan nama Indonesia.** Satu nama seperti "gulma
berdaun lebar" — 7.512 pemakaian — menaungi puluhan spesies. Nama Indonesia jadi `synonyms`.

**Penciri fase dan sistem dilebur ke nama kanonik.** "Kelapa sawit (TBM)", "(TM)", dan
"Kelapa sawit" adalah satu komoditas; TBM/TM adalah fase, dan "sawah"/"gogo" adalah sistem
budidaya. Bentuk aslinya tetap tersimpan sebagai `synonyms` dan di `commodity_label`.

### Verifikasi taksonomi ke GBIF

`pest_kind` semula disimpulkan dari nama Indonesia yang menyertai — "penyakit busuk daun"
ditebak jamur, "ulat grayak" ditebak serangga. Seluruh 1.370 nama ilmiah kini diperiksa ke
[GBIF Backbone Taxonomy](https://api.gbif.org/v1/species/match), dan `pest_kind` diturunkan
dari kingdom serta kelasnya.

| | |
|---|---:|
| Tercocok di GBIF | 1.168 (85%) |
| — persis | 451 |
| — fuzzy (koreksi salah ketik registri) | 500 |
| — sampai tingkat genus | 217 |
| Klasifikasi terkonfirmasi | 1.081 |
| **Klasifikasi terkoreksi** | **81** |
| Tidak tercocok, tetap simpulan | 202 |

**Koreksi terpenting: 42 organisme berpindah dari jamur ke oomycete** — Phytophthora,
Pythium, Peronospora, Plasmopara. Ini bukan soal kerapian taksonomi: metalaksil dan
dimetomorf bekerja pada oomycete dan tidak pada jamur sejati, sehingga salah golong berarti
salah pilih bahan aktif. `pest_kind` mendapat nilai baru `disease_oomycete` untuk ini.

Koreksi lain: 13 dari serangga ke gulma, 6 dari jamur ke bakteri, 4 ke tungau, 4 ke
vertebrata. Semuanya kekeliruan yang tidak mungkin ketahuan dari nama Indonesianya saja.

**Yang tidak dipaksakan.** Fuzzy tingkat genus sempat dicoba untuk 202 yang tak tercocok, lalu
dibatalkan: `Altemaria` dicocokkan GBIF ke `Algemaria`, bukan `Alternaria`. Satu kasus serupa
lolos lebih awal — `Pysalis angulate` dicocokkan ke ngengat `Pyralis` padahal hampir pasti
gulma *Physalis*. Karena `pest_kind` menentukan pilihan pengendalian, ketidakpastian yang
dinyatakan lebih aman daripada taksonomi yang salah tapi terlihat rapi. 209 entitas membawa
`taxon_verification.needs_review` beserta alasannya.

### Registri varietas — tulang punggung sisi benih

Registri PUKPES tidak memuat benih sama sekali. Yang memberi "nomor pendaftaran" untuk
lapis benih adalah [registri perizinan varietas
Kementan](https://perizinan.pertanian.go.id/) (SIPERINTIS), ditarik 19 Agustus 2026:
**11.235 catatan, 11.617 perizinan**, tahun 1945–2026.

**Satu entitas untuk satu catatan registri, bukan untuk satu nama.** 9.706 nama untuk
11.235 catatan: 1.350 nama dipakai lebih dari sekali — PERTIWI, MADU, dan MUTIARA masing-masing
menempel pada beberapa komoditas — dan 772 kelompok nama+jenis berulang dengan pemohon atau
tahun berbeda. Tidak satu pun kelompok itu isinya identik persis, jadi menggabungkannya berarti
menebak bahwa dua catatan menyebut varietas yang sama. FEIRA IPB muncul tiga kali pada cabai
rawit: 2021, 2023, dan 2025, dengan dua fakultas IPB berbeda sebagai pemohon.

**Tiga jenis perizinan, tiga akibat hukum.** Pelepasan (5.826) mengizinkan peredaran,
pendaftaran (5.181) mencatat keberadaan, perlindungan (580) memberi hak kekayaan intelektual.
Meringkusnya jadi satu field `release` akan menyamakan tiga hal yang tidak sama, jadi
`Variety` menyimpan seluruhnya di `permits` dan mengisi `release` hanya bila memang ada
pelepasan.

**Tipe varietas hampir seluruhnya tidak diketahui.** Hanya 1.173 dari 11.227 varietas
menyebutkan sendiri tipenya — 570 hibrida, 427 inbrida, 154 varietas lokal, 22 klon. Sisanya
dikosongkan. Hibrida atau bukan menentukan boleh-tidaknya petani menyimpan benih sendiri
untuk musim berikutnya; menebaknya untuk 10.054 varietas akan mengarang jawaban atas
pertanyaan yang justru paling penting.

**418 jenis tanaman baru masuk kosakata komoditas.** 71% baris varietas tertaut ke komoditas
yang sudah ada dari label pestisida; sisanya menyebut tanaman yang belum pernah muncul di
registri pestisida — sagu, uwi, talas, salak, dan hampir seluruh tanaman hias. Kualifikasi
jenis benih pada nama sumber dilepas lebih dulu, sehingga "Aglaonema Hibrida" tidak jadi
komoditas terpisah dari Aglaonema.

**Delapan catatan tidak diterbitkan** karena jenis tanamannya kosong sehingga tidak bisa
ditautkan ke komoditas mana pun. Satu di antaranya, `kelapa ok` dari pemohon `tes ujicoba`,
adalah data uji coba yang tertinggal di registri resmi.

### Skala fase: yang tertaut, dan yang belum

Varietas tidak menyimpan skala fasenya sendiri — ia mewarisi lewat komoditas. Fenologi
adalah sifat tanamannya, bukan sifat varietasnya, dan `Cycle.stage_scale` tetap tersedia
untuk siklus yang perlu menyimpang.

**6.791 dari 11.227 varietas (60.5%) mewarisi skala fase**, lewat dua puluh skala dan 83
komoditas:

| Skala | Fase | Komoditas | Varietas |
|---|---:|---:|---:|
| BBCH — Padi (Oryza sativa) | 59 | 5 | 1.445 |
| BBCH — Solanaceae (cabai, tomat, terung) | 63 | 22 | 1.218 |
| BBCH — Jagung (Zea mays) | 46 | 5 | 990 |
| BBCH — Cucurbit (semangka, melon, mentimun, labu) | 63 | 9 | 959 |
| Fase budidaya durian (Durio zibethinus) | 14 | 2 | 496 |
| CORESTA — Tembakau (Nicotiana tabacum) | 156 | 1 | 267 |
| BBCH — Kedelai (Glycine max) | 66 | 4 | 228 |
| BBCH — Sayuran daun tidak berkrop (sawi, caisim, pak choi, selada daun) | 63 | 11 | 169 |
| BBCH — Sayuran daun berkrop (kubis, sawi putih, selada) | 60 | 3 | 161 |
| BBCH — Kopi (Coffea sp.) | 63 | 3 | 159 |
| BBCH — Alpukat (Persea americana) | 95 | 1 | 145 |
| BBCH — Sayuran umbi lapis (bawang merah, bawang putih, bawang daun) | 51 | 4 | 122 |
| BBCH — Buncis (Phaseolus vulgaris) | 56 | 3 | 113 |
| BBCH — Kentang (Solanum tuberosum) | 77 | 1 | 110 |
| BBCH — Kacang tanah (Arachis hypogaea) | 69 | 1 | 89 |
| BBCH — Brassica lain (kembang kol, brokoli, kubis brussel) | 74 | 2 | 77 |
| BBCH — Sayuran umbi & batang (wortel, lobak, kohlrabi) | 54 | 2 | 38 |
| BBCH — Bit (Beta vulgaris) | 50 | 1 | 3 |
| BBCH — Kacang polong (Pisum sativum) | 57 | 2 | 2 |
| Umur budidaya udang vaname (DOC) | 4 | 1 | — |

Kunci padi dan jagung disalin dari **BBCH Monograph edisi ke-2 (2001)**, bukan dari
ingatan: teks Inggrisnya ikut disimpan di `label.en` apa adanya supaya terjemahan
Indonesianya bisa diperiksa terhadap sumbernya. Termasuk salah ketiknya — monograf menulis
"Coleptile" pada fase 07 jagung, dan itu direkam apa adanya dengan penanda.

Dua temuan struktural dari kuncinya sendiri: **jagung tidak punya fase utama 2 dan 4**
sama sekali — tidak ada pembentukan anakan, tidak ada bunting — sehingga deretnya melompat
dari 19 ke 30 dan dari 39 ke 51. Dan **fase utama 6 jagung memuat dua deskripsi sekaligus**,
bunga jantan pada malai dan bunga betina pada tongkol, karena keduanya berlangsung terpisah
pada tanaman yang sama.

**Kentang dan tembakau sengaja tidak ditautkan** walau sama-sama Solanaceae: keduanya punya
kunci BBCH sendiri, dan kunci sayuran buah tidak mengenal pembentukan umbi maupun pemangkasan
pucuk. Tiga puluh komoditas dikecualikan dengan alasan tertulis di
`tools/tautkan-skala-fase.mjs` — Cabe Jawa ternyata *Piper retrofractum*, famili Piperaceae;
tiga nama "terong" merujuk *Solanum betaceum* yang berupa pohon; "Rumput Padi-Padian" adalah
kelompok gulma Poaceae, bukan padi; dan pada kelompok cucurbit, paria (*Momordica*), oyong
(*Luffa*), labu air (*Lagenaria*), serta labu siam (*Sechium*) memang tidak disebut kuncinya.

**Durian tidak punya kunci BBCH, dan itu bukan kelalaian pencarian.** Monograf memuat 28
kunci tanaman plus satu kunci gulma: serealia, padi, jagung, bunga matahari, kanola, bit,
kentang, kapas, kacang tanah, kedelai, kacang buncis, kacang faba, kacang polong, cucurbit,
sayuran buah Solanaceae, brassica, sayuran daun (berkrop dan tidak berkrop), sayuran umbi
dan batang, sayuran umbi lapis, pome, stone fruit, stroberi, currant, anggur, hop, zaitun,
kopi. Durian bukan salah satunya, dan penelusuran pustaka tidak menemukan kunci BBCH durian
yang pernah diterbitkan siapa pun. Yang ada: penelitian fenologi dengan kosakata sendiri —
fase kuncup "mata ketam", antesis, lalu umur buah dalam hari setelah antesis. Menyusun skala
durian berarti membuat skala baru seperti skala DOC udang, bukan menyalin yang sudah ada.

**Monograf sudah habis dipakai.** Ketujuh belas skala di atas menghabiskan seluruh kunci
BBCH Monograph yang punya padanan komoditas di registri Indonesia. Yang tersisa di dalamnya
hanya kunci buah iklim sedang — pome, stone fruit, stroberi, currant, anggur, hop — yang tidak
punya varietas terdaftar di sini.

Tiga sudah masuk. **Tembakau**, dari CORESTA Guide N° 7 — bukan kunci BBCH Monograph, melainkan
skala turunan yang menyatakan dirinya berbasis BBCH diperluas. Berkasnya gratis tetapi situsnya
memakai pemeriksaan bot, jadi PDF-nya diunduh manusia lalu disalin dari salinan lokal.

Dan **alpukat**, dari Alcaraz, Thorp & Hormaza (2013) di Scientia Horticulturae — BBCH
diperluas 3 digit, tersedia terbuka di arsip pustaka alpukat.

Dan **durian** — yang kuncinya memang tidak pernah ada, sehingga skalanya disusun sendiri
seperti skala DOC udang: 14 fase, bertanda `no_mapping_reason`, dengan urutan fase memakai
kosakata praktisi dan jangkar hari hanya di tempat yang ada rujukannya.

Sisa terbesar masih butuh sumber di luar monograf, dan keadaannya berbeda-beda:

| Komoditas | Varietas | Kunci BBCH-nya | Kenapa belum masuk |
|---|---:|---|---|
| Krisan | 247 | belum ditemukan | Penelusuran belum menemukan kunci BBCH krisan yang diterbitkan |
| Kacang panjang | 224 | **tidak ada** | Pustaka memakai kode kunci buncis apa adanya untuk *Vigna*, tetapi itu pemakaian informal, bukan kunci terbitan |
| Pisang | 185 | **usulan, belum terbit** | Gonzales dkk., "Proposal for codification of the phenological cycle of edible Musaceae" — berstatus *in preparation*, dan kodenya 4 digit, beda bentuk dari seluruh skala di sini |
| Tebu | 168 | ada, berbayar | BBCH diadaptasi untuk tebu di buku Wiley; teksnya di balik akses berbayar |

Aturan `L28` menjaga tautannya tetap sepakat dua arah: komoditas tidak boleh mengaku memakai
skala yang tidak mencantumkannya.

### Tiga temuan tentang registrinya sendiri

**Kandungan hara pupuk ada di registri, tetapi hampir luput.** Penarikan pertama
mengekstrak registri ke CSV tanpa membawa kolom `hasilAnalisaUji`, dan ketiadaannya
sempat dicatat sebagai temuan tentang sumbernya. Kolom itu nyatanya terisi di seluruh
5.875 baris basis SIMPEL. Setelah diisi ulang, **5.130 produk pupuk punya `composition`**
dan 29.622 parameter tersimpan apa adanya di `analysis`. Sisanya tetap tanpa kadar hara —
745 baris yang analisanya hanya cacah mikroba atau sifat fisik, dan seluruh 1.321 baris
basis lama SIMPUK-2020 yang sumbernya memang tidak punya kolom itu. Untuk baris-baris itu
aturan `L14` masih berlaku: produk boleh ada, tapi angkanya tidak boleh dikarang.

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
