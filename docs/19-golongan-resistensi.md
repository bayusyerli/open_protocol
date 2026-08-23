# Golongan manajemen resistensi: IRAC, FRAC, HRAC

Registri bahan aktif sudah ada sejak 19 Agustus 2026. Yang belum ada adalah dasar untuk
berkata **"tiga musim terakhir memakai golongan yang sama"**. Dokumen ini mencatat dari mana
dasar itu diambil, seberapa jauh ia sampai, dan di mana ia berhenti.

Data lama, kemampuan baru — jadi seluruh nilainya ada pada **ketepatan join-nya**, bukan pada
jumlah barisnya. Satu kode yang salah menghasilkan anjuran rotasi yang keliru tapi terdengar
yakin, dan yang menanggungnya petani yang mengira sudah berotasi. Karena itu aturan yang
dipakai sepanjang pekerjaan ini satu kalimat: **kalau tidak bisa dicocokkan ke entri yang
benar-benar tercantum pada daftar terbitan, biarkan kosong.**

| | |
|---|---|
| Berkas data | [`spec/vocab/golongan-resistensi/golongan-resistensi.meta.json`](../spec/vocab/golongan-resistensi/golongan-resistensi.meta.json) + `.ndjson` |
| Skema | [`spec/schema/golongan-resistensi.schema.json`](../spec/schema/golongan-resistensi.schema.json) |
| Sisi kiri join | `spec/vocab/substance-pestisida.json` — 1.399 bahan aktif hidup (1.706 termasuk yang digantikan penggabungan ejaan) |
| Bentuk rekaman | pemetaan, bukan entitas — tanpa `op:` id, mengikuti kaidah `nama-lokal` |

---

## 1. Sumber dan versinya

Ketiga skema direvisi berkala dan **kode bisa berubah**, jadi versinya ikut dicatat.

| Skema | Cakupan | Terbitan yang dipakai | Ditarik |
|---|---|---|---|
| **IRAC** | insektisida, akarisida, nematisida | *Mode of Action Classification Scheme* **Versi 11.5, Februari 2026** — Appendix 5, daftar bahan aktif menurut abjad, 294 entri | 23 Agustus 2026 |
| **FRAC** | fungisida, bakterisida | *FRAC Code List* **2026**, halaman 4–18. Dokumen menyatakan pembaruan terakhir **Mei 2026**, keputusan pembaruan berikutnya **Maret 2027** | 23 Agustus 2026 |
| **HRAC** | herbisida | *Global Herbicide MoA Classification* **2026**, lewat alat pencarian daringnya, ditarik per golongan | 23 Agustus 2026 |

- IRAC — <https://irac-online.org/documents/moa-classification/>
- FRAC — <https://www.frac.info/media/s1zfrjqa/frac-code-list-2026.pdf>
- HRAC — <https://hracglobal.com/tools/classification-lookup>

Satu sumber keempat dipakai **hanya untuk memastikan identitas zat, bukan untuk kodenya**:
Pesticide Properties DataBase (PPDB), University of Hertfordshire, lema *Thiosultap-disodium*
(CAS 52207-48-4) dan *Thiosultap-monosodium* (CAS 29547-00-0). Ia yang memastikan dimehipo,
bisultap, dan monosultap adalah garam tiosultap; kode 14-nya tetap datang dari IRAC.

### Sistem huruf mana yang direkam, dan buktinya

Kode HRAC dicatat berdampingan dengan **huruf lamanya**, karena label produk di Indonesia masih
banyak mencetak huruf dan pengguna harus bisa mencocokkan yang tertera di kemasan dengan yang
dikatakan aplikasi.

Ini bukan pekerjaan yang boleh dilakukan dari kelaziman, karena **beredar lebih dari satu
sistem huruf herbisida dan keduanya memakai huruf yang sama untuk golongan yang berbeda**:
sistem **HRAC global pra-2020** (A, B, C1, C2, C3, D, E, F1–F4, G, H, I, K1–K3, L, M, N, O, P,
Q, R, S, T, Z) dan sistem **CropLife Australia**. Memakai yang keliru lebih buruk daripada
tidak memasang huruf sama sekali: pengguna akan mencocokkan huruf di kemasannya dengan golongan
yang salah, lalu menerima lampu hijau untuk pengulangan yang seharusnya dilarang.

**Yang direkam: sistem huruf HRAC global pra-2020.** Dasarnya bukan dugaan melainkan bacaan
kemasan yang sudah ada di repositori ini, hasil panen gambar produk (`gambar_produk/manifes.ndjson`):

| Merek | Pemegang | Bahan aktif | Yang tercetak di kemasan |
|---|---|---|---|
| MERAH PUTIH 241 SL | PT. Centa Brasindo Abadi Chemical Industry | isopropil amina glifosat | **"Golongan HRAC G"** |
| KENMETRIN 500 SC | PT. Kenso Indonesia | ametrin | **"Golongan : Triazine, HRAC (C1)"** |
| KEN-MIDA 12/50 EC | PT. Kenso Indonesia | emamektin benzoat + imidakloprid | "Golongan : Avermectin, **IRAC (6)**; Neonicotinoid, **IRAC (4A)**" |
| ASTERPIRAM 120 EC | PT. Agro Sejahtera Indonesia | nitenpiram | "**GRUP 4A** INSEKTISIDA" |

Dua baris pertama yang memutuskan, dan keduanya memutuskan ke arah yang sama:

- **Glifosat = G.** Di HRAC global pra-2020 glifosat memang **G** (Glycines). Di sistem
  CropLife Australia glifosat bergolongan **M**. Labelnya menulis G.
- **Ametrin (triazin) = C1.** Di HRAC global pra-2020 triazin adalah **C1**. Sistem Australia
  memakai **C** telanjang, tanpa angka di belakangnya. Angka "1" itulah yang menutup perkara.

Keduanya juga **menyebut nama "HRAC" secara harfiah di kemasan**, dari dua pemegang
pendaftaran yang berbeda. **Sistem CropLife Australia tidak direkam sama sekali**, karena
tidak ada satu pun bukti label Indonesia memakainya.

Dua baris terakhir menjawab pertanyaan lain yang perlu dijawab sebelum menambah medan: sisi
insektisida sudah memakai **angka** IRAC di kemasan. IRAC dan FRAC memang tidak pernah punya
sistem huruf yang digantikan angka, jadi medan huruf **sengaja tidak dibuat** untuk keduanya —
dan skemanya menolak bila diisi (lihat `fixtures-invalid/schema-huruf-pada-irac.json`).

Huruf yang direkam disalin apa adanya dari kolom *Legacy HRAC code* pada alat pencarian HRAC.
Huruf itu **per bahan, bukan per golongan**: golongan 5 memuat C1 (triazin, urasil) sekaligus
C2 (urea, amida), dan golongan 15 memuat K3, K3.N, dan K3.Z. Sebagian huruf majemuk dan
bertitik — `O.L` untuk kuinklorak, `C3.M` untuk bromoksinil, `Z.K3` untuk napropamid — dan
bentuk itu dipertahankan, karena ia menyatakan penempatan lamanya yang memang lebih dari satu
kelas, persis seperti kode angka gandanya.

### Syarat pakai yang membatasi — perlu diputuskan pemilik repositori

FRAC menyatakan pada dokumennya sendiri bahwa **FRAC Code List adalah milik FRAC dan
dilindungi hak cipta**; boleh dipakai untuk keperluan pendidikan tanpa izin, sedangkan
**pemakaian komersial menuntut izin tertulis lebih dulu**. Repositori ini berlisensi
CC BY-SA 4.0, yang justru mengizinkan pemakaian komersial. Dua hal itu bertabrakan.

Yang ditempuh di sini: **hanya fakta pemetaan nama-ke-kode yang direkam.** Prosa, tata letak
tabel, kolom *comments on resistance*, gambar, dan dokumen utuhnya tidak disalin — yang masuk
repositori hanyalah pasangan "nama bahan → kode golongan" beserta URL dan versi sumbernya
supaya bisa ditelusuri ulang. Perlakuan yang sama diterapkan pada IRAC (dokumennya bertanda
*"IRAC document protected by © Copyright 2026"*) dan HRAC (halamannya bertanda *"©2026 HRAC"*).

**Ini keputusan yang sebaiknya ditinjau ulang oleh pemilik repositori sebelum status naik dari
`draft`**, terutama bila Open Protocols kelak dipakai dalam layanan berbayar.

---

## 2. Cakupan

**1.399 rekaman, satu untuk setiap bahan aktif** — termasuk yang tidak terpetakan, karena
kekosongan yang beralasan bisa dibaca sebagai kekosongan, sedangkan kekosongan yang
dihilangkan tidak bisa dibedakan dari kelalaian.

**930 rekaman membawa kode** (66,5%), **469 kosong dengan alasan** (33,5%). Total 943 kode:
IRAC 337, HRAC 383, FRAC 223 — 13 rekaman punya kode pada dua skema sekaligus.

Angka di atas mencampur seluruh registri, termasuk zat pengatur tumbuh dan rodentisida yang
memang tidak punya skema. Yang lebih berarti adalah cakupan **di dalam ruang lingkup
masing-masing skema**:

| Skema | Bahan terpetakan | Penyebutan pada label produk |
|---|---|---|
| **IRAC** (bahan berlabel insektisida/akarisida) | **265 dari 311 — 85,2%** | 5.499 dari 6.060 — 90,7% |
| **FRAC** (fungisida/bakterisida) | **204 dari 337 — 60,5%** | 2.400 dari 2.923 — 82,1% |
| **HRAC** (herbisida) | **373 dari 392 — 95,2%** | 3.471 dari 3.609 — 96,2% |

Seluruh registri: **11.707 dari 13.416 penyebutan bahan pada label terpetakan (87,3%)**.
Angka penyebutan jauh lebih tinggi daripada angka bahan (66,5%) karena yang tidak terpetakan
cenderung bahan berekor panjang — satu atau dua formulasi masing-masing. Satu formulasi bisa
menyebut lebih dari satu bahan, jadi 13.416 penyebutan tersebar pada 7.724 formulasi.

Kode berbeda yang benar-benar terpakai: IRAC 48, FRAC 43, HRAC 22.

### Kode huruf HRAC

**382 dari 383 kode HRAC membawa huruf lamanya** (3.487 penyebutan pada label), memakai
24 huruf berbeda: A, B, C1, C2, C3, C3.M, D, E, F1, F2, F4, G, H, K1, K2, K3, K3.N, L, M, O,
O.L, Q.Z, Z, Z.K3. Yang terbanyak `4 = O` (108), `2 = B` (57), `9 = G` (42), `10 = H` (35),
`1 = A` (27).

**Satu tanpa huruf**: tetflupirolimet (HRAC 28, 2 penyebutan) — bahan yang masuk daftar setelah
penomoran 2020, jadi tidak pernah punya padanan huruf. Ia membawa `legacy_absent_reason`, bukan
medan yang hilang begitu saja. Skemanya menuntut salah satu dari keduanya selalu ada
(lihat `fixtures-invalid/schema-huruf-hrac-hilang.json`).

### Bagaimana tiap kode sampai ke bahannya

Medan `basis` pada tiap kode menyimpan jawabannya, sehingga siapa pun bisa memeriksa ulang
tanpa mengulang seluruh pekerjaan.

| `basis` | Jumlah | Contoh |
|---|---|---|
| `ejaan` | 624 | sipermetrin → *Cypermethrin*; mankozeb → *mancozeb*; klorpirifos → *Chlorpyrifos* |
| `garam` | 129 | IPA glifosat, kalium glifosat, monoamonium glifosat → *Glyphosate*; parakuat diklorida → *Paraquat* |
| `alias` | 87 | lihat §3 |
| `ester` | 53 | triklopir butoksi etil ester, triklopir butotil → *Triclopyr*; fluroksipir meptil → *Fluroxypyr* |
| `stereo` | 38 | fenoksaprop-P-etil → *Fenoxaprop-ethyl*; lamda sihalotrin → *Cyhalothrin*; L-amonium glufosinat → *Glufosinate-ammonium* |
| `organisme` | 12 | *Bacillus thuringiensis* var. kurstaki, subsp. aizawai, … → *Bacillus thuringiensis* |

Pencocokan ejaan dilakukan dengan melipat perbedaan alih aksara secara ortografis
(`ph`→`f`, `ch`→`k`, `c`+`e/i/y`→`s`, `qu`→`ku`, `x`→`ks`, `y`→`i`, `z`→`s`, huruf kembar
diciutkan, akhiran `-e`/`-a` dilepas), lalu **menuntut kesamaan persis** dengan nama yang
tercantum. Tidak ada pencocokan mirip-miripan, tidak ada jarak edit, tidak ada ambang.
Bentuk garam dan ester dikupas bertingkat, dan tingkat terkecil yang menghasilkan temuan yang
dipakai — sehingga *emamektin benzoat* bertemu entri *Emamectin benzoate* apa adanya, bukan
dikupas dulu jadi *emamectin*.

Kata `asam`/`acid` **sengaja tidak dikupas**. Pada percobaan awal pengupasan itu membuat
"Asam sulfat" bertemu *Sulfur* — asam sulfat bukan belerang. Bentuk asam yang sah (2,4-D Acid,
asam glifosat, asam borat, asam fosfit) ditangani satu per satu lewat tabel alias.

### Pemeriksaan silang yang berdiri sendiri

`spec/vocab/substance-pestisida.json` sudah lebih dulu memuat 58 kode `mode_of_action` yang
diisi tangan pada Agustus 2026, tanpa kaitan dengan pekerjaan ini. Hasil join dibandingkan
dengannya: **55 dari 58 sama persis, 0 bertentangan.** Tiga sisanya hanya beda penulisan —
berkas lama menulis `M3` dan `M5`, sedangkan FRAC Code List 2026 mencetaknya `M 03` dan `M 05`.

Ketiganya **sudah diseragamkan** ke bentuk terbitan: mankozeb dan propineb `M3` → `M 03`,
klorotalonil `M5` → `M 05`. Bentuk terbitan yang dipilih karena bentuk itulah yang tercetak
pada label produk. Konsumennya diperiksa lebih dulu: `mode_of_action` hanya dibaca dua alat
penggabung ejaan (`spec/tools/satukan-aksi-zat-ejaan.mjs` dan `spec/tools/gabung-id-zat-kembar.mjs`),
yang membandingkan pasangan `skema:kode` antar-entitas kembar dan tidak terpengaruh selama
seluruh kemunculannya berubah bersama. Indeks turunan dan permukaan aplikasi belum membaca
medan itu sama sekali. Setelah perubahan, ketiga pemeriksa dijalankan ulang dan tetap hijau.

Sesudahnya kecocokannya menjadi **58 dari 58, tanpa satu pun selisih.**

---

## 3. Tabel alias — 87 kode yang lewat jalur khusus

Pelipatan ejaan tidak cukup untuk semua kasus. Sisanya lewat tabel yang **setiap barisnya
ditinjau tangan dan membawa alasannya sendiri** ke dalam medan `note`. Yang dinyatakan alias
selalu **identitas zat**, tidak pernah kodenya — kodenya tetap datang dari daftar terbitan.

| Dasar | Jumlah | Isi |
|---|---|---|
| `salah-ketik` | 53 | `sipermeterin`→Cypermethrin, `emamektm-benzoat`→Emamectin benzoate, `klorfirifos-metil`→Chlorpyrifos-methyl, `pikosistrobin`→picoxystrobin, `difekonazol`→difenoconazole. Hampir semuanya punya ejaan benar di registri yang sama, pada ratusan formulasi lain |
| `kompleks-tembaga` | 6 | tembaga oksin, tembaga tiodiazol/tiadiazol, tembaga abitat → **M 01**. FRAC menempatkan tembaga pada M 01 dan menyatakan kodenya berlaku juga untuk kompleks tembaga organik |
| `garam` | 6 | dimehipo, dimehypo, bisultap, monosultap → **IRAC 14** lewat *Thiosultap-sodium*; tiosiklam hidrogen oksalat → *Thiocyclam* |
| `singkatan` | 5 | **BPMC**→Fenobucarb, **MIPC**→Isoprocarb. Buktinya ada di registri sendiri, yang di tempat lain menulis "BPMC/Fenobucarb" dan "MIPC/Isoprocarb" |
| `bentuk-asam` | 4 | 2,4-D Acid→2,4-D; asam glifosat→Glyphosate; asam borat→Boric acid; asam fosfit→phosphorous acid |
| `ejaan` | 3 | alih aksara yang menghilangkan `h`: `poksim`→Phoxim, `sipenotrin`→Cyphenothrin, `klorpropam`→Chlorpropham |
| `nama-kimia` | 3 | label yang memakai nama IUPAC untuk 2,4-D dan glifosat |
| `urutan-kata` | 2 | "alumunium fosetil" → *fosetyl-Al* |
| `tingkat-genus` | 2 | *T. koningii*, *T. viride* → **BM 02**, karena FRAC menempatkan kelompok biologi "Trichoderma spp." di situ |
| `sinonim-taksonomi` | 1 | *Trichoderma harzianum* → *T. afroharzianum*, memakai catatan perubahan tata nama yang ditulis FRAC sendiri |
| `label-terpotong` | 1 | "2,4 dimetil amina" — labelnya kehilangan huruf `D` |
| `penamaan-komponen` | 1 | "Abamectin B1" → *Abamectin* |

---

## 4. Yang tidak terpetakan — 469 bahan

| Alasan | Bahan | Penyebutan | Contoh |
|---|---|---|---|
| **Di luar cakupan ketiga skema** | 232 | 791 | etefon, asam giberelat, paklobutrazol (ZPT); brodifakum, bromadiolon, kumatetralil (rodentisida); DEET, ikaridin (penolak); niklosamida, saponin (moluskisida) |
| **Nama kimia, bukan nama umum ISO** | 112 | 188 | seluruh keluarga isotiazolinon (BIT, MIT, CMIT, OIT, DCOIT), bronopol, paraben, glikol — pengawet industri yang masuk registri lewat pintu bakterisida |
| **Tidak ada di daftar terbitan** | 96 | 659 | dimefluthrin, metofluthrin, meperfluthrin, heptafluthrin (piretroid rumah tangga); isoflualanam, flufenoximacil, flusulfinam, sihalodiamide, tiorantraniliprol (bahan baru) |
| **Agens hayati tak tercantum** | 23 | 58 | *Serratia marcescens*, *Verticillium lecanii*, *Metarhizium anisopliae*, *Paenibacillus polymyxa*, "Bacillus sp", "Streptomyces sp." |
| **Label bukan nama bahan** | 6 | 13 | "(setara dengan emamektin)", "0.1", "1 - 2.5", "100.1" — pecahan keterangan kadar yang telanjur jadi entitas |

Celah terbesar menurut jumlah penyebutan: **dimefluthrin (173) + dimeflutrin (81) +
metofluthrin (46) + meperfluthrin (43) + meperflutrin (37) + metoflutrin (36) = 416
penyebutan piretroid rumah tangga tanpa kode.** Semuanya piretroid, dan hampir pasti 3A —
tetapi tidak satu pun tercantum pada IRAC v11.5, yang memang memuat sebagian piretroid saja.
Menuliskan 3A berarti menebak, dan menebak persis yang dilarang di sini.

---

## 5. Kaveat yang diketahui

**Kode yang sama belum tentu berarti cara kerja yang sama — 41 rekaman.** IRAC menyatakannya
sendiri pada bagian 5 klasifikasinya: golongan yang anggotanya **tidak bekerja pada tempat
sasaran yang sama** dikecualikan dari larangan berotasi di dalam golongan, yaitu **Golongan 8**
(penghambat banyak tempat), **Golongan 13** (pengurai gradien proton), dan **seluruh golongan
UN**. HRAC `0` (cara kerja belum diketahui) dan FRAC `NC`/`BM` (biologi dengan banyak cara
kerja) setara. Setiap kode semacam ini membawa `not_a_rotation_group: true`, dan penyaji wajib
membacanya sebelum menyimpulkan "golongannya sama".

Yang kena: mankozeb, belerang, azadiraktin, piridalil, dikofol (IRAC UN); *Beauveria bassiana*
(UNF); klorfenapir (IRAC 13); metil bromida, sulfuril fluorida, boraks & asam borat, dazomet &
natrium metam (IRAC 8A/8C/8D/8F); *Trichoderma*, *Bacillus subtilis*, *B. amyloliquefaciens*,
sinamaldehida (FRAC BM); napropamid dan DSMA (HRAC 0).

**Nomor yang sama bisa berarti hal berbeda antar-skema.** HRAC `13` adalah klomazon
(penghambat DXPS) dan FRAC `13` adalah kuinoksifen — keduanya golongan cara kerja betulan dan
**tidak** ditandai, meskipun IRAC `13` ditandai. Kode tidak pernah boleh dibandingkan tanpa
skemanya.

**Bahan bergolongan ganda — 13 rekaman.** Bukan cacat data, melainkan keadaan sebenarnya:
mankozeb FRAC M 03 sekaligus IRAC UN; belerang FRAC M 02 sekaligus IRAC UN; kartap
hidroklorida IRAC 14 sekaligus FRAC U 19; tolfenpirad, fenpiroksimat, dan fenazakuin IRAC 21A
sekaligus FRAC 39. Satu bahan bisa dipakai untuk dua sasaran, dan tiap komite memberinya kode
sendiri.

**Kode ganda di dalam satu skema.** HRAC sendiri menulis **kuinklorak `4/29`** (peniru auksin
pada berdaun lebar, penghambat sintesis selulosa pada rumput) dan **bromoksinil `6/24`**.
Ditulis apa adanya, tidak dipecah — memilih salah satunya akan memalsukan yang lain.

**Kode yang pernah berubah.** Ini alasan versi sumber wajib dicatat:

| Bahan | Perubahan |
|---|---|
| fosetil-Al & asam fosfit | FRAC **33 → P 07** (2018) |
| metrafenon | FRAC **U 8 → 50** (2018) |
| metasulfokarb | FRAC **U 42 → M 12** (2018) |
| *Bacillus amyloliquefaciens* | FRAC **44 → BM 02** (2020) |
| minyak pohon teh, eugenol/geraniol/timol | FRAC **46 → BM 01** (2021) |
| oksatiapiprolin | FRAC **U 15 → 49** |
| validamisin | FRAC **26 → U 18** |
| ferimzon | FRAC **C5 → U 14** (2012) |
| oksazosulfil | IRAC **UN → 37** (v11.2, Januari 2025) |
| **seluruh skema HRAC** | huruf → angka: 2,4-D dulu **O** kini **4**; glifosat dulu **G** kini **9**; parakuat dulu **D** kini **22**; metsulfuron dulu **B** kini **2** |

Pergantian HRAC yang terakhir itu yang paling menyusahkan di lapangan, dan buktinya ada di
kemasan yang sudah dipanen repositori ini: MERAH PUTIH 241 SL mencetak "Golongan HRAC G" dan
KENMETRIN 500 SC mencetak "HRAC (C1)" — keduanya huruf, bukan angka. **Karena itu huruf lama
direkam berdampingan, bukan menggantikan**, lewat medan `legacy` yang selalu menyebut sistemnya
(lihat §1). Yang tidak boleh dilakukan: memakai huruf tanpa menyebut sistemnya, karena sistem
CropLife Australia memberi huruf berlainan untuk golongan yang sama.

**Sub-golongan IRAC bukan pasangan rotasi.** IRAC menulis bahwa "generasi hama berturut-turut
tidak boleh diperlakukan dengan bahan dari golongan cara kerja yang sama" — dan yang dimaksud
**golongan**, bukan sub-golongan. `1A` dan `1B` dua kelas kimia berbeda dengan **tempat kerja
yang sama** (penghambat asetilkolinesterase); berpindah dari karbofuran (1A) ke klorpirifos
(1B) bukan rotasi. Aturan rotasi yang dibangun di atas berkas ini harus membandingkan **nomor
golongan utamanya**, bukan kode lengkapnya. Berlaku juga untuk `3A`/`3B`, `4A`–`4F`,
`20A`–`20D`, `21A`/`21B`, `22A`/`22B`, `24A`/`24B`, `25A`/`25B` — kecuali `8A`–`8F`, yang justru
dikecualikan IRAC seperti disebut di atas.

Hal serupa berlaku pada FRAC `11` dan `11A`: metiltetraprol satu kelompok cara kerja dengan
QoI lain, tetapi FRAC memisahkannya karena tidak bersilang-resistensi pada mutan G143A.
FRAC juga memakai kode bertitik (`16.1`, `16.2`, `16.3`) dan berspasi (`M 03`, `U 19`,
`P 07`) — ditulis apa adanya, karena bentuk itulah yang tercetak pada label.

**Yang memang tidak punya skema.** Rodentisida punya komitenya sendiri, **RRAC**, yang tidak
dicakup berkas ini. Moluskisida tidak tercakup komite mana pun. Zat pengatur tumbuh, atraktan,
penolak, dan pengawet kayu juga tidak. Nematisida punya skema terpisah, *IRAC Nematicide MoA
Classification* — **belum ditarik**. Sembilan bahan bertanda nematisida di registri (abamektin,
fluopiram, dazomet, etoprofos, fostiazat, natrium metam, fluazaindolizin, dan dua agens hayati)
sudah membawa kode insektisida atau fungisidanya bila ada, tetapi **belum diperiksa terhadap
skema nematisida itu**.

**Agens hayati dicocokkan pada tingkat spesies, bukan galur.** Entri terbitan sering menyebut
galur tertentu (*Metarhizium brunneum* strain F52, *Paecilomyces fumosoroseus* Apopka strain 97),
sedangkan label registri menyebut galur lain atau tidak menyebutnya sama sekali. Yang
dicocokkan hanya bila spesiesnya sama persis; *Metarhizium anisopliae*, *Isaria fumosorosea*,
dan *Cordyceps fumosorosea* karena itu dibiarkan kosong meskipun kerabatnya ada di daftar.
Kodenya pun akan `UNF`, yang bukan golongan cara kerja.

**Satu bahan dengan banyak ejaan tetap banyak rekaman.** Registri memuat `abamektin`,
`abamectin`, `abamectine`, dan `abamectin-b1` sebagai empat entitas berbeda, dan berkas ini
menghormatinya: empat rekaman, empat kali kode **IRAC 6** yang sama. Menggabungkannya adalah
pekerjaan `spec/tools/satukan-aksi-zat-ejaan.mjs`, bukan pekerjaan berkas ini.

**Golongan pemakaian di registri kadang keliru, dan itu tidak menular ke kode.** Registri
menandai entri `CYPERMETHRIN` (87 formulasi) sebagai **herbisida** dan `Metomil`
(159 formulasi) sebagai **fungisida**. Kode diberikan berdasarkan **identitas bahannya**,
bukan berdasarkan label golongan itu — sehingga sipermetrin tetap IRAC 3A dan metomil tetap
IRAC 1A. Yang terpengaruh hanya angka cakupan per skema di §2, yang memakai penandaan registri
untuk menentukan penyebutnya; karena itu 87 formulasi `CYPERMETHRIN` terhitung sebagai
"herbisida tanpa kode HRAC" dan 159 formulasi `Metomil` sebagai "fungisida tanpa kode FRAC",
padahal keduanya berkode IRAC. Cakupan FRAC yang tampak paling rendah (60,5%) sebagian
disebabkan hal ini, dan sebagian lagi oleh pengawet industri yang masuk registri lewat pintu
bakterisida.

---

## 6. Yang belum dikerjakan

- **Nematisida.** *IRAC Nematicide MoA Classification* belum ditarik; skema itu terbit
  terpisah dari klasifikasi insektisida.
- **Bukti label masih tipis — empat kemasan.** Sistem huruf HRAC global dipilih berdasarkan dua
  bacaan kemasan dari dua pemegang pendaftaran (§1). Dua bacaan yang sepakat sudah cukup untuk
  menutup pilihan antara dua sistem, tetapi belum cukup untuk memastikan **tidak ada** produk
  Indonesia yang memakai sistem lain. Panen gambar produk masih berjalan; setiap blok golongan
  baru yang terbaca sebaiknya diperiksa terhadap tabel ini. Kalau kelak ditemukan kemasan yang
  memakai huruf Australia, nilai kedua tinggal ditambahkan ke enum `legacy.system` dan rekaman
  lama tetap terbaca — dan itulah kenapa ia enum bernama, bukan huruf telanjang.
- **Aturan rotasinya sendiri** belum ada. Berkas ini menyediakan bahannya; aturan
  "berapa musim berturut-turut sebelum diperingatkan" adalah keputusan agronomis yang belum
  diambil, dan tempatnya bukan di sini.
- **Penarik ulangnya tidak ikut masuk repositori — dan itu keputusan, bukan kelalaian.**
  Kosakata lain punya `spec/tools/bangun-*.mjs` yang membangunnya kembali. Berkas ini tidak,
  karena alat semacam itu harus menyimpan **salinan utuh** ketiga daftar terbitan sebagai tabel
  rujukan, dan justru itu yang dihindari oleh §1 — terutama untuk FRAC, yang syarat pakainya
  membatasi pemakaian komersial. Yang masuk repositori hanya hasil join-nya, yang cakupannya
  dibentuk registri Indonesia, bukan daftar aslinya. Konsekuensinya: **penyegaran berikutnya
  adalah pekerjaan tangan yang diulang**, dengan panduan §1 sebagai daftar sumbernya. Kalau
  kelak diputuskan alatnya boleh disimpan, tabel rujukannya harus hidup di luar repositori.
- **Peninjauan tingkat bukti.** Seluruh rekaman berstatus `draft`, tinjauan jatuh tempo
  23 Februari 2027 — sengaja dipasang sebelum keputusan pembaruan FRAC pada Maret 2027.
