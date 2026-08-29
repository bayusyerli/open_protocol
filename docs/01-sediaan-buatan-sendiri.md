# Sediaan Buatan Sendiri — Riset & Standar

> Dokumen kerja. Versi 0.1 — 19 Agustus 2026.
> Keluarannya sudah masuk spesifikasi: entitas `Preparation` dan `PreparationBatch`,
> 21 bahan baku, 12 resep, dan enam aturan pemeriksa baru (`L16`–`L21`).

---

## 0. Ringkasan

Sebagian besar petani tidak menjalankan protokol yang isinya karung bermerek. Mereka
memformulasi sendiri: pupuk kandang, kompos, bokashi, MOL, pupuk organik cair,
perbanyakan mikroba, dan pestisida nabati. Praktik ini nyata, murah, dan sepenuhnya
tidak terlihat oleh sistem pencatatan pertanian mana pun — termasuk oleh Lapis 1
Pranatani sebelum dokumen ini.

Penyebabnya bukan kelalaian, melainkan bentuk modelnya. Lapis 1 hanya punya dua
tempat untuk masukan:

- `Substance` — bahan generik. Menjawab **bahan apa**.
- `Product` — produk komersial, wajib punya izin edar. Menjawab **barang siapa**.

Kompos tidak muat di keduanya. Ia bukan bahan tunggal, dan ia tidak punya nomor
pendaftaran karena memang tidak diperjualbelikan. Akibatnya, seorang petani yang
memberi 10 ton kompos per hektar akan tercatat sebagai petani yang tidak memupuk.

Yang ditambahkan: **lapis ketiga yang menjawab *dibuat bagaimana*.**

| Entitas | ID | Sifat | Boleh masuk protokol? |
|---|---|---|---|
| `Substance` | `op:sub:########` | Bahan generik | Ya |
| **`Preparation`** | **`op:sed:########`** | **Resep terbuka, CC-BY-SA** | **Ya** |
| `Product` | `op:prd:########` | Produk komersial berizin | Tidak |
| **`PreparationBatch`** | **`op:bat:<uuidv7>`** | **Data satu kebun** | Tidak |

Temuan yang paling menyenangkan dari perancangan ini: **resep terbuka adalah
satu-satunya formulasi konkret yang boleh dianjurkan protokol netral-vendor.**
Aturan `L3` melarang langkah rencana menyebut produk komersial, sehingga sebuah
protokol hanya bisa berkata "45 kg N per hektar" dan berhenti di situ. Sebuah
`Preparation` bukan produk siapa pun — ia resep berlisensi terbuka — jadi protokol
boleh berkata "kompos kotoran sapi, resep termofilik, 10 t/ha" secara utuh, lengkap
dengan cara membuat dan cara memeriksanya. Netralitas vendor bukan lagi sekadar
pembatas; ia justru mendorong isi protokol jadi lebih konkret, bukan lebih kabur.

---

## 1. Temuan hukum: pupuk dan pestisida diperlakukan sangat berbeda

Ini temuan terpenting dokumen ini, dan yang paling mudah salah kalau ditebak.
Seluruhnya diambil langsung dari naskah asli
[UU 22/2019 tentang Sistem Budi Daya Pertanian Berkelanjutan](https://peraturan.bpk.go.id/Details/123688/uu-no-22-tahun-2019),
bukan dari ringkasan pihak ketiga.

### Pupuk buatan sendiri: ada tempatnya dalam undang-undang

| Pasal | Bunyi ringkasnya |
|---|---|
| **71 ayat (2)** | Pupuk yang **diedarkan** wajib terdaftar |
| **72 ayat (1)** | **Pupuk yang diproduksi oleh Petani kecil dikecualikan dari pendaftaran** |
| **72 ayat (2)** | Pupuk itu hanya dapat diedarkan terbatas **dalam satu kabupaten/kota** |
| **73** | Setiap Orang dilarang **mengedarkan** pupuk yang tidak terdaftar/tidak berlabel |
| **122** | Sanksi: penjara maks. 6 tahun, denda maks. Rp3 miliar — dikaitkan ke **peredaran** |

Kewajibannya melekat pada **peredaran**, bukan pada pembuatan atau pemakaian. Petani
yang membuat kompos untuk lahannya sendiri berada di luar rezim pendaftaran, dan
kalaupun ia membaginya ke tetangga sekabupaten, Pasal 72 menyediakan jalannya.

### Pestisida buatan sendiri: tidak ada pasal yang sepadan

| Pasal | Bunyi ringkasnya |
|---|---|
| **75** | Definisi pestisida mencakup "semua zat kimia dan bahan lain serta **jasad renik dan virus**" untuk memberantas OPT — dan pada huruf d, bahan yang **mengatur atau merangsang pertumbuhan tanaman yang tidak termasuk pupuk** |
| **76 ayat (2)** | Pestisida yang **diedarkan** wajib terdaftar |
| **77 ayat (1)** | Setiap Orang dilarang **mengedarkan dan/atau MENGGUNAKAN** pestisida yang tidak terdaftar, membahayakan kesehatan masyarakat dan kelestarian lingkungan, dan/atau tidak berlabel |
| **123** | Sanksi: penjara maks. **7 tahun**, denda maks. **Rp5 miliar** |

Tiga akibat yang langsung mengubah desain mesin:

1. **Kata "menggunakan" muncul di sisi pestisida dan tidak muncul di sisi pupuk.**
   Larangannya tidak berhenti di peredaran.
2. **Tidak ada Pasal 72 untuk pestisida.** Kelonggaran petani kecil hanya ada untuk
   pupuk. Yang ada hanyalah Pasal 66 ayat (4), yang mengecualikan sarana produksi
   lokal atau petani kecil yang diedarkan terbatas dalam satu kabupaten/kota dari
   kewajiban **sertifikasi mutu** — bukan dari kewajiban **pendaftaran**.
3. **Definisinya ditentukan kegunaan, bukan asal bahan.** Ekstrak daun mimba untuk
   hama adalah pestisida. Biakan *Trichoderma* untuk penyakit layu adalah pestisida —
   Pasal 75 menyebut jasad renik secara eksplisit. Bahkan sediaan yang menyebut
   dirinya "elisitor" dan menolak disebut pupuk justru jatuh tepat ke rumusan
   Pasal 75 huruf d.

> **Batas kejujuran.** Rangkaian kata pada Pasal 77 ayat (1) — "tidak terdaftar,
> membahayakan …, dan/atau tidak berlabel" — bisa dibaca kumulatif maupun
> alternatif, dan bacaan itu menentukan apakah pemakaian pestisida nabati untuk
> keperluan sendiri benar-benar terlarang. Ini pertanyaan hukum, bukan pertanyaan
> agronomi, dan harus dijawab penasihat hukum sebelum Fase 4. Sikap yang diambil
> spesifikasi: **nyatakan status hukumnya apa adanya dan tandai `own_use_only`,
> jangan menyimpulkan aman.**

### Pembanding: Brasil sudah menyelesaikan pertanyaan ini

Undang-undang bioinput Brasil (Lei 15.070/2024) mengizinkan produksi hayati di
kebun **khusus untuk dipakai sendiri**, melarang memperdagangkannya, mewajibkan
cara produksi yang baik, dan — bagian yang paling tajam — **hanya mengizinkan galur
yang berasal dari bank plasma nutfah terakreditasi**, serta melarang memperbanyak
produk komersial siap pakai sebagai sumber inokulum. Itu bentuk yang matang: bukan
melarang, bukan membiarkan, melainkan memberi syarat yang bisa diperiksa. Kalau
Indonesia kelak mengatur hal yang sama, kerangka inilah yang paling mungkin ditiru,
dan `Preparation` sudah menyediakan tempat untuk seluruh syaratnya.

### Konsekuensi untuk mesin penyusun protokol

| Jenis sediaan | Boleh dianjurkan mesin? | Yang wajib ikut ditampilkan |
|---|---|---|
| Kompos, bokashi, kascing, POC, MOL | Ya | Tingkat bukti, kriteria pelepasan, tenggang panen bila berbahan kotoran mentah |
| Ekstrak nabati, biakan agens hayati | Ya, dengan peringatan | Status hukum, `own_use_only`, tenggang panen, APD |
| Sediaan berbahan tembakau atau akar tuba | **Tidak pernah** | — |
| Sediaan tanpa kriteria pelepasan | Boleh dicatat, **tidak boleh dianjurkan** | Alasan mengapa tidak bisa dibakukan |

---

## 2. Temuan teknis: apa yang sebenarnya menentukan mutu

Riset ini mencari satu hal: **titik kendali mana yang benar-benar memisahkan sediaan
yang baik dari yang berbahaya.** Jawabannya ternyata sedikit, dan semuanya bisa
diperiksa tanpa laboratorium.

### a. Suhu tumpukan, bukan lama menumpuk

Ambang yang dipakai lintas negara — dan yang jadi acuan di sini — berasal dari
[7 CFR 205.203](https://www.ecfr.gov/current/title-7/subtitle-B/chapter-I/subchapter-M/part-205/subpart-C/section-205.203):
rasio C/N bahan awal 25:1 sampai 40:1, suhu 55–70 °C **ditahan 3 hari** pada sistem
tertutup, atau **15 hari dengan minimal 5 kali pembalikan** pada tumpukan terbuka.

Yang penting bukan angkanya, melainkan konsekuensinya: **"sudah didiamkan tiga
bulan" bukan bukti apa pun.** Tumpukan yang tidak pernah panas tidak menyanitasi
apa-apa. Untuk kotoran mentah yang tidak melewati fase panas, pengaman yang tersisa
tinggal jarak waktu ke panen — **120 hari bila bagian yang dimakan bersentuhan
dengan tanah, 90 hari bila tidak.**

Aturan `L17` menegakkan tepat ini: bahan bertanda `sanitation_required` wajib
disertai proses termofilik **atau** tenggang panen ≥ 90 hari. Salah satu, tidak boleh
kosong keduanya.

### b. Kematangan bisa diuji petani sendiri

Indeks perkecambahan adalah uji hayati yang murah dan sudah mapan: benih
dikecambahkan pada rendaman sediaan, hasilnya dibandingkan air biasa. **Di atas 80%
berarti racun tumbuh sudah habis**; di bawah itu sediaan masih meracuni tanaman.
Kompos mentah tidak sekadar kurang bermanfaat — ia menahan pertumbuhan dan merebut
nitrogen dari tanaman.

Uji ini masuk sebagai `field_proxy` pada hampir semua kriteria pelepasan: 20 benih
kangkung pada rendaman 1:5, 20 benih pada air biasa, bandingkan. Tidak butuh alat.

### c. Gula memperbanyak yang salah

Temuan yang paling mengubah anjuran praktis. Percobaan pada seduhan kompos
menunjukkan penambahan molase 1% membuat *Salmonella* melonjak dari 1 menjadi lebih
dari 350.000 cfu/mL dalam 72 jam pada seduhan berbahan kotoran ayam, sementara
**pada kadar 0,2% lonjakan itu tidak terjadi**.

Padahal menambah molase adalah anjuran paling umum di hampir semua panduan MOL dan
POC di Indonesia. Batas 0,2% karena itu ditulis langsung ke entitas molase sebagai
`on_farm.status: restricted` beserta alasannya — supaya batasnya ikut terbawa ke
mana pun bahan itu dipakai, bukan tersimpan di catatan kaki.

### d. Perbanyakan mikroba di kebun bisa memperbanyak apa saja

Perbanyakan mandiri agens hayati sudah lazim — di Brasil bahkan sudah jadi praktik
skala luas untuk jagung, kapas, dan kedelai. Kritik terhadapnya konsisten: **tanpa
kendali mutu yang ketat, sediaan buatan sendiri bisa tercemar mikroba lain, termasuk
patogen manusia, atau nyaris tidak mengandung bahan aktifnya sama sekali.** Kajian
mutu formulasi *Beauveria* di Kolombia menemukan kendali mutunya tidak konsisten.

Bahayanya berlipat pada media serealia: media beras atau jagung lembap yang dipakai
memperbanyak *Trichoderma* adalah juga media terbaik bagi *Aspergillus* penghasil
aflatoksin. Karena itu media serealia masuk sebagai bahan `restricted`, dan `L20`
menolak sediaan mikroba yang tidak punya kriteria pelepasan bertipe `contamination`.

Ambang yang dipakai diambil dari persyaratan teknis minimal pupuk hayati Kementan:
**≥ 10⁷ cfu/g**, cemaran *E. coli* dan *Salmonella* **< 10³ MPN/g**, dan **uji
patogenitas pada tanaman uji wajib negatif**. Yang terakhir itu paling berguna,
karena versi kebunnya sederhana: coba dulu pada sepuluh bibit di persemaian sendiri.

### e. Angka mutu resmi yang dipakai sebagai acuan

Dari Lampiran I Permentan 70/Permentan/SR.140/10/2011 (ditarik langsung dari
naskahnya):

| Parameter | Pupuk organik padat | Pupuk cair organik |
|---|---|---|
| C-organik | min 15% | min 6% |
| C/N | 15–25 | — |
| Kadar air | 15–25% | — |
| pH | 4–9 | 4–9 |
| Hara makro | N+P₂O₅+K₂O min 4% | N, P₂O₅, K₂O masing-masing 3–6% |
| *E. coli* | maks 10² MPN/g | maks 10² MPN/mL |
| *Salmonella* sp. | maks 10² MPN/g | maks 10² MPN/mL |

> **Peringatan verifikasi.** Angka-angka ini dari edisi 2011. Penggantinya —
> Permentan 1/2019 dan
> [Kepmentan 261/KPTS/SR.310/M/4/2019](https://psp.pertanian.go.id/layanan-publik/keputusan-menteri-pertanian-nomor-261-kpts-sr-310-m-4-2019-tentang-persyaratan-teknis-minimal-pupuk-organik-pupuk-hayati-dan-pembenah-tanah)
> — berkas resminya berupa pindaian tanpa lapisan teks, sehingga angkanya belum
> berhasil ditarik dalam sesi ini. Sumber sekunder menyebut C-organik minimal 15%,
> C/N di bawah 25, dan kadar air 4–15% untuk granul serta 15–25% untuk curah, tetapi
> itu belum diperiksa ke naskah aslinya. Setiap rujukan angka ini di dalam
> `vocab/preparation.json` membawa penanda **PERLU VERIFIKASI**, dan tidak boleh naik
> ke status `published` sebelum dicek.

Perbandingan yang menjelaskan banyak hal: pupuk organik cair buatan sendiri dari
limbah sayur tidak akan pernah mendekati **3–6% N**. Sediaan itu pantas disebut
penambah bahan organik dan mikroba, bukan pupuk. Menyetarakannya dengan pupuk akan
membuat rencana pemupukan kekurangan hara tanpa ada yang menyadarinya.

---

## 3. Bukti: apa yang benar-benar diketahui

Sikap yang diambil di seluruh dokumen ini: **naikkan bukti hanya sejauh datanya, dan
katakan sisanya apa adanya.** Tingkat bukti A–D sudah didefinisikan di
[`spec/01-identitas-dan-versi.md`](../spec/01-identitas-dan-versi.md).

| Praktik | Tingkat | Apa yang berbukti, apa yang tidak |
|---|---|---|
| Pengomposan termofilik | **B** | Sanitasinya berbukti kuat dan dipakai lintas negara. Tanggapan hasil panennya beragam dan biasanya baru terasa pada musim kedua |
| Vermikompos | **B** | Perbaikan sifat fisik tanah dan hara mikro cukup mapan. Klaim penekanan penyakit tidak |
| Pupuk kandang matang | **C** | Manfaat bahan organiknya jelas; keamanannya bergantung sepenuhnya pada tenggang panen |
| Ekstrak nabati | **C** | Telaah 12 bahan nabati pada kondisi lapangan nyata: semuanya punya sebagian daya kerja, tetapi efikasinya bervariasi dan umumnya **lebih rendah** daripada pembanding sintetis |
| Perbanyakan *Trichoderma* | **C** | Organismenya bertingkat A; **batch buatan kebun tidak mewarisi bukti itu** — tanpa uji pelepasan, turun ke D |
| MOL / bioaktivator | **D** | Studi memakai bahan, takaran, dan lama fermentasi berbeda-beda sehingga hasilnya tidak bisa dijumlahkan. Yang masuk akal secara mekanisme: starter pengomposan, bukan sumber hara |
| PGPR dari inokulum liar | **D** | Meta-analisis global: kenaikan hasil di iklim tropis rata-rata **+14,9%**, sebaran lebar, hasil di pot jauh lebih baik daripada di lapangan. Bahkan galur yang sifat pemacu tumbuhnya terbukti di laboratorium justru berkaitan dengan hasil lapangan **lebih rendah** |
| Elisitor tak berstandar | **D** | Lihat bagian berikut |

### Kasus uji: Biosaka

Biosaka dibuat dari lima jenis atau lebih daun rumput sehat yang diremas tangan
dalam air, tanpa bahan tambahan, dan sudah dipraktikkan di puluhan provinsi. Peneliti
BRIN mempersoalkan hal yang tepat: **bahan bakunya beragam dan tidak dibakukan,
sehingga kandungan bahan aktifnya berbeda-beda dan hubungan sebab-akibatnya belum
dijelaskan.** Kajian BSIP yang dirujuk pendukungnya pun dinilai masih prematur, dan
klaim bahwa sediaan ini bisa menggantikan sampai 90% pemupukan tidak terbukti — pada
percobaan pembanding, pemberian tanpa pupuk justru memberi **hasil terendah**.

Biosaka tetap dimasukkan ke kosakata, dengan tingkat bukti D, `regime` bertanda
`unclear`, dan **kriteria pelepasan sengaja dikosongkan** — karena tidak ada satu pun
yang bisa ditulis dengan jujur. Itulah kegunaannya di sini: bahan uji apakah kerangka
ini sanggup menampung praktik yang sedang ramai **tanpa ikut mengiklankannya**.
Menghapusnya dari kosakata tidak akan menghapusnya dari lapangan; yang hilang justru
kemampuan mencatat apa yang terjadi ketika petani memakainya.

### Kasus uji: petunjuk teknis resmi pun belum tentu lengkap

Petunjuk Teknis Pembuatan Pestisida Nabati terbitan Balai Penelitian Lingkungan
Pertanian (2019) memuat formula dengan perbandingan yang jelas — ekstrak mimba 1,
mahoni 1, kunyit 0,2, urine sapi 1, asap cair 0,1, air 1. Sumbernya lembaga
penelitian pemerintah, jadi tingkat buktinya **B**.

Tetapi B bukan berarti lengkap. Petunjuk itu **tidak memuat dosis per satuan luas,
tidak memuat OPT sasaran, tidak memuat tenggang waktu sebelum panen, dan tidak
memuat kadar bahan aktif.** Ia juga menyatakan bahwa "pemakaian dengan dosis tinggi
sekalipun masih relatif aman" — pernyataan yang tidak didukung data dan tidak
diikuti di sini.

Lalu terjadi hal yang menarik. Ketika formula itu dimasukkan ke kosakata, **aturan
`L17` langsung menyala**: formula ini mengandung urine sapi mentah, prosesnya hanya
pencampuran, dan tidak ada tenggang panen yang dinyatakan. Jawabannya bukan
melemahkan aturan, melainkan menuliskan akibatnya: tenggang 90 hari berlaku, yang
berarti pada cabai — dipanen berkali-kali mulai sekitar 75 HST — **formula ini
praktis hanya bisa dipakai pada paruh pertama musim.** Kesimpulan itu mengikuti
bahannya, dan tidak pernah muncul di sumber aslinya.

Ini contoh paling konkret tentang apa gunanya menjadikan praktik sebagai standar:
bukan menyalin resep dengan tampilan lebih rapi, melainkan memaksa yang tidak
tertulis jadi terlihat.

---

## 4. Standar: tujuh syarat sebuah praktik jadi sediaan yang bisa dianjurkan

Ini inti dokumen. Sebuah praktik DIY baru boleh masuk protokol yang direkomendasikan
mesin bila ketujuhnya terpenuhi.

**1. Kedudukan hukumnya dinyatakan, bukan disimpulkan.**
Rezim (`fertilizer_like` / `pesticide_like` / `unclear`), boleh diedarkan atau tidak,
dan pasal yang jadi dasarnya. `unclear` adalah jawaban yang sah; menebak "aman"
tidak.

**2. Bahannya menunjuk entitas, bukan teks bebas.**
Setiap bahan menunjuk `Substance`, sehingga larangan bahan, syarat sanitasi, dan
tabel komposisi rujukan hidup di satu tempat dan tidak bisa terlewat.

**3. Proporsinya dinyatakan sebagai bagian, bukan sebagai ukuran ember.**
`parts_by_mass` atau `parts_by_volume` supaya resep bisa diperbesar-perkecil tanpa
ditulis ulang — dan supaya dua resep bisa dibandingkan.

**4. Titik kendalinya punya cara periksa dan cara gagal.**
Setiap titik kendali wajib menyebut cara memeriksanya **di kebun tanpa laboratorium**
dan apa yang harus dilakukan bila meleset. Titik kendali tanpa tindakan kegagalan
hanyalah harapan.

**5. Ada kriteria pelepasan.**
Inilah yang memisahkan resep dari SOP. Resep memberi tahu cara membuat; SOP memberi
tahu **cara mengetahui hasilnya layak pakai**. Setiap kriteria membawa `field_proxy`,
karena kriteria yang hanya bisa diuji di laboratorium akan dilewati petani, dan
kriteria yang dilewati sama saja dengan tidak ada.

**6. Keselamatannya lengkap, termasuk saat datanya tidak ada.**
Tenggang panen, tenggang masuk kembali, bahaya, dan APD. Untuk sediaan buatan
sendiri hampir tidak pernah ada uji residu — karena itu `phi_basis` menyediakan nilai
`precautionary_default` dan `not_established`. **Mengosongkan tenggang panen membuat
mesin memperlakukan sediaan itu seolah tanpa risiko, dan itu jauh lebih berbahaya
daripada angka pencegahan yang jujur diberi label.**

**7. Tingkat buktinya melekat dan ditampilkan.**
Beserta catatan yang menyebut apa yang diketahui dan apa yang belum. Tingkat bukti
disimpan diam-diam sebagai metadata sama saja dengan tidak ada.

---

## 5. Bahan yang tidak boleh dianjurkan

Dua bahan masuk daftar terlarang, keduanya justru karena lazim dipakai:

**Daun tembakau dan puntung rokok.** Bahan aktifnya nikotin — neurotoksin yang
terserap lewat kulit, dengan dosis mematikan pada anak serendah sekitar 1 mg per kg
bobot badan. Nikotin sudah tidak disetujui sebagai bahan aktif pestisida di Uni
Eropa, dilarang dalam standar pertanian organik, dan tidak pernah terdaftar di
Indonesia. Pada rendaman buatan sendiri kadarnya tidak diketahui, sehingga yang
paling terpapar justru pembuatnya, bukan hamanya.

**Akar tuba.** Bahan aktifnya rotenon — sangat beracun bagi ikan dan organisme
perairan, dan penelitian sejak 1990-an mengaitkan paparannya dengan penyakit
Parkinson. Izin rotenon di Uni Eropa dicabut penuh pada 31 Oktober 2011. Pemakaian
di sawah beririgasi memindahkan racunnya langsung ke perairan umum.

Empat bahan lain berstatus `restricted` dengan syarat tertulis: urine ternak (wajib
difermentasi tertutup ≥ 7 hari), molase (maks 0,2% pada seduhan berbahan kotoran),
media serealia (wajib disterilkan penuh; media berjamur dibakar, bukan dipakai), dan
inokulum dari alam bebas (identitasnya tidak bisa dipastikan tanpa laboratorium).

Aturan `L19` menolak resep apa pun yang memakai bahan berstatus `prohibited`.
Daftarnya disimpan **bersama bahannya**, bukan di dokumen kebijakan terpisah — supaya
tidak ada jalan memakainya tanpa melewati larangannya.

---

## 6. Bagaimana ini masuk ke spesifikasi

### Entitas baru

**`Preparation`** (`spec/schema/preparation.schema.json`) — resep terkurasi. Memuat
`preparation_class`, `intended_functions`, `regulatory`, `feedstocks`, `process`
beserta `sanitation` dan `critical_control_points`, `release_criteria`,
`composition_basis`, `application`, `safety`, dan `evidence_tier`.

**`PreparationBatch`** (`spec/schema/preparation-batch.schema.json`) — data usaha
tani, ber-UUIDv7, milik petani. Memuat bahan yang **benar-benar** dipakai,
`process_log` (terutama catatan suhu tumpukan), hasil `qc`, `qc_verdict`, dan
`measured_composition`.

`Step.applications[]` kini menerima `preparation` dan `preparation_batch`, sehingga
rantai telusurnya utuh:

```
Plot → Cycle → Step → PreparationBatch → Preparation → Substance
```

Selisih antara `feedstocks` pada resep dan `feedstock_actuals` pada batch adalah data
paling berguna untuk memperbaiki resep — bentuk yang sama persis dengan selisih
rencana-realisasi pada `Step`.

### Enam aturan baru

| Aturan | Isi | Berasal dari temuan |
|---|---|---|
| `L16` | Sediaan pengendali OPT wajib menyatakan rezim pestisida, `own_use_only`, dan tenggang panen | Bagian 1 — Pasal 75 & 77 |
| `L17` | Bahan mentah pembawa patogen wajib disanitasi termofilik **atau** diberi tenggang panen ≥ 90 hari | Bagian 2a |
| `L18` | Hara yang diberikan hanya boleh dihitung dari batch yang **benar-benar diuji** | Bagian 2e — cermin `L14` |
| `L19` | Bahan berstatus `prohibited` ditolak di resep mana pun | Bagian 5 |
| `L20` | Sediaan mikroba wajib punya kriteria pelepasan bertipe cemaran | Bagian 2d |
| `L21` | Batch bervonis `fail` tidak boleh dipakai di lahan; `not_tested` menyalakan peringatan | Bagian 4, syarat 5 |

`L3` juga diperluas: batch tertentu ditolak di langkah rencana milik protokol, sama
seperti produk komersial. Resepnya boleh, batch-nya tidak — batch adalah data satu
kebun.

Semuanya diuji di `fixtures-invalid/`. Perluasan ini juga membongkar satu **cacat
lama pada pemeriksa**: `collectRefs` menganggap setiap objek `{ id: "..." }` sebagai
rujukan, padahal `LangText` berbentuk persis sama, sehingga catatan yang kebetulan
memuat tanda titik dua salah dibaca sebagai rujukan menggantung. Sudah diperbaiki
dengan mencocokkan pola ID, bukan hanya bentuk objeknya.

### Isi kosakata

| Berkas | Isi |
|---|---|
| `vocab/substance-organik.json` | **21 bahan baku** — kotoran ternak, sisa tanaman, bahan nabati, bahan tambahan. 2 dilarang, 5 dibatasi, sebagian membawa komposisi rujukan sebagai **rentang** |
| `vocab/preparation.json` | **12 resep** — kompos termofilik, pupuk kandang matang, bokashi, kascing, MOL, POC, biakan *Trichoderma*, PGPR, ekstrak mimba, formula Balingtan, arang sekam, Biosaka |
| `vocab/variable.json` | **+11 variabel** — suhu tumpukan, C/N, indeks perkecambahan, kerapatan mikroba, cemaran, kemurnian, patogenitas |
| `vocab/operation-type.json` | **+6 jenis tindakan** — produksi sediaan, pengomposan, fermentasi cair, perbanyakan agens hayati, ekstraksi nabati, pengujian sediaan |
| `vocab/method.json` | **+4 cara** — pencelupan akar, uji perkecambahan, hitungan cawan, uji kepal |

Komposisi rujukan bahan sengaja **selalu berbentuk rentang**, tidak pernah angka
tunggal: kotoran sapi dari dua kandang berbeda bisa berbeda dua kali lipat, dan angka
tunggal akan menjanjikan ketelitian yang tidak ada. Rentang yang dipakai sekarang
berasal dari pustaka penyuluhan dan **belum ditelusuri ke sumber primer** — ditandai
demikian di berkasnya, dan ini bagian paling lemah dari seluruh tambahan ini.

---

## 7. Bagaimana mesin memakainya untuk menyusun SOP

Enam hal yang bisa dilakukan mesin setelah tambahan ini, yang sebelumnya mustahil:

**1. Menjadwalkan pembuatan, bukan hanya pemakaian.**
Kompos butuh 45 hari. Kalau ia dipakai pada H-14 sebelum tanam, pembuatannya harus
mulai H-60. Sediaan buatan sendiri **mengubah kalender musim**, bukan sekadar
mengganti isi karung — dan itulah yang membuat protokol DIY berbeda secara struktural
dari protokol bermasukan pabrik. Contohnya ada di
[`examples/step-cabai-planned-produksi-kompos.json`](../spec/examples/step-cabai-planned-produksi-kompos.json).

**2. Menyusun neraca hara yang jujur.**
Bila batch diuji, hara yang diberikan dihitung dari hasil ujinya. Bila tidak, `L18`
menolak angkanya, dan mesin harus menyajikannya sebagai perkiraan berentang. Petani
yang memberi 10 t/ha kompos tidak lagi tercatat sebagai petani yang tidak memupuk.

**3. Menghitung biaya yang sebenarnya.**
Biaya sediaan buatan sendiri didominasi tenaga kerja. Contoh batch pada spesifikasi
mencatat 28 jam kerja keluarga untuk 1.150 kg kompos. Kalau jam itu dicatat nol,
kompos akan tampak gratis dan perbandingannya dengan pupuk pabrik jadi menyesatkan —
persis kesalahan yang paling sering dibuat penganjur pertanian organik.

**4. Menyaring anjuran berdasarkan hukum dan keselamatan.**
Sediaan berezim pestisida selalu tampil dengan status hukum dan tenggang panennya.
Bahan terlarang tidak pernah muncul.

**5. Menaikkan tingkat bukti dari lapangan.**
Inilah gunanya `PreparationBatch`. Ribuan batch dengan catatan suhu, hasil uji, dan
hasil panen yang tertaut adalah satu-satunya jalan jujur menaikkan MOL dari D ke C —
tanpa perlu punya kebun percobaan sendiri.

**6. Menyandingkan dua jalur pada satu protokol.**
Karena rekomendasi tetap disusun di tingkat hara (`Substance`), satu langkah
pemupukan bisa dipenuhi lewat pupuk bersubsidi **atau** lewat kompos buatan sendiri,
dan keduanya dibandingkan dengan neraca yang sama. Ini yang membuat protokol tidak
memaksa petani memilih mazhab.

---

## 8. Yang sengaja belum diselesaikan

- **Angka Kepmentan 261/2019 belum terverifikasi.** Berkasnya pindaian tanpa lapisan
  teks. Sampai terverifikasi, acuan yang dipakai adalah edisi 2011 dan seluruhnya
  ditandai.
- **Komposisi rujukan bahan belum ditelusuri ke sumber primer.** Bagian paling lemah.
  Idealnya diganti data uji laboratorium daerah, bukan pustaka penyuluhan.
- **Bacaan Pasal 77 ayat (1) belum dipastikan penasihat hukum.** Menentukan seberapa
  tegas peringatan pada sediaan pengendali OPT.
- **Kesetaraan dosis belum dimodelkan.** Berapa ton kompos setara berapa kilogram
  urea, dengan memperhitungkan laju mineralisasi yang berbeda-beda menurut suhu dan
  jenis tanah. Ini butuh data lapangan Fase 4, dan mengarangnya sekarang akan
  membuat neraca hara terlihat pasti padahal tidak.
- **Resep di luar hortikultura belum ada.** Dua belas resep ini bertumpu pada
  hortikultura dataran rendah. Sisi perikanan budidaya — probiotik tambak buatan
  sendiri — memakai entitas yang sama tetapi belum diisi.
- **Silang-periksa dengan SNI 6729:2016 belum lengkap.** Standar itu sudah memuat
  daftar bahan penyubur yang diperbolehkan, dibatasi, dan dilarang untuk sistem
  organik; memetakannya ke `on_farm.status` akan membuat protokol organik bisa
  disusun langsung dari kosakata ini.

---

## 9. Sumber

**Hukum dan standar**
- [UU No. 22 Tahun 2019 tentang Sistem Budi Daya Pertanian Berkelanjutan](https://peraturan.bpk.go.id/Details/123688/uu-no-22-tahun-2019) — Pasal 66, 71–77, 79, 122–123
- [Permentan 70/Permentan/SR.140/10/2011 tentang Pupuk Organik, Pupuk Hayati dan Pembenah Tanah](https://psp.pertanian.go.id/storage/545/Permentan-No.-70-Th.-2011-ttg-Pupuk-Organik-Pupuk-Hayati-dan-Pembenah-Tanah.pdf) — Lampiran I, Pasal 43–45
- [Permentan No. 1 Tahun 2019 tentang Pendaftaran Pupuk Organik, Pupuk Hayati, dan Pembenah Tanah](https://peraturan.bpk.go.id/Home/Details/161054/permentan-no-01-tahun-2019)
- [Kepmentan 261/KPTS/SR.310/M/4/2019 tentang Persyaratan Teknis Minimal](https://psp.pertanian.go.id/layanan-publik/keputusan-menteri-pertanian-nomor-261-kpts-sr-310-m-4-2019-tentang-persyaratan-teknis-minimal-pupuk-organik-pupuk-hayati-dan-pembenah-tanah) — belum terverifikasi
- [Permentan No. 43 Tahun 2019 tentang Pendaftaran Pestisida](https://peraturan.bpk.go.id/Details/201255/permentan-no-43-tahun-2019)
- [SNI 6729:2016 Sistem pertanian organik](https://repository.pertanian.go.id/handle/123456789/22948) — daftar bahan penyubur yang diperbolehkan, dibatasi, dan dilarang
- [7 CFR 205.203 — Soil fertility and crop nutrient management practice standard](https://www.ecfr.gov/current/title-7/subtitle-B/chapter-I/subchapter-M/part-205/subpart-C/section-205.203) — ambang termofilik dan tenggang 90/120 hari
- [NOP 5021 — Compost and Vermicompost in Organic Crop Production](https://www.ams.usda.gov/rules-regulations/organic/handbook/5021)
- [Bioinputs Law Brasil (Lei 15.070/2024) — produksi hayati di kebun untuk keperluan sendiri](https://www.kasznarleonardos.com/en/bioinputs-law-a-new-regulatory-framework-for-sustainable-agriculture-in-brazil/)

**Teknis dan bukti**
- Dougoud, Toepfer, Bateman & Jenner — [Efficacy of homemade botanical insecticides based on traditional knowledge. A review](https://link.springer.com/article/10.1007/s13593-019-0583-1), *Agronomy for Sustainable Development* (2019); ringkasan terbuka di [PlantwisePlus Blog](https://blog.plantwise.org/2019/08/14/homemade-botanical-remedies-can-they-really-work-for-pest-control/)
- [Improving Crop Yield and Nutrient Use Efficiency via Biofertilization — A Global Meta-analysis](https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2017.02204/full), *Frontiers in Plant Science* (2018)
- [Effect of Molasses on Regrowth of E. coli O157:H7 and Salmonella in Compost Teas](https://www.tandfonline.com/doi/abs/10.1080/1065657X.2004.10702163), *Compost Science & Utilization* 12(1) (2004)
- [Determining the extraction conditions and phytotoxicity threshold for compost maturity evaluation using the seed germination index method](https://www.sciencedirect.com/science/article/abs/pii/S0956053X23006049), *Waste Management* (2023)
- [On-farm Production of Microbial Entomopathogens for use in Agriculture: Brazil as a Case Study](https://link.springer.com/article/10.1007/s13744-023-01033-5), *Neotropical Entomology* (2023)
- [Production of Beauveria bassiana Fungal Spores on Rice to Control the Coffee Berry Borer in Colombia](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3127422/)
- Balai Penelitian Lingkungan Pertanian — [Petunjuk Teknis Pembuatan Pestisida Nabati](https://repository.pertanian.go.id/bitstreams/150ebd42-dc24-40f2-802b-81e8ac95d079/download) (2019)
- [Info Teknologi: Mikroorganisme Lokal (MOL)](https://pustaka.bppsdmp.pertanian.go.id/info-literasi/info-teknologi-mikroorganisme-lokal-mol-solusi-cerdas-ramah-lingkungan-untuk-pertanian-berkelanjutan), Pustaka BPPSDMP Kementan

**Bahan terlarang**
- [Nicotine from tobacco — a "natural" pesticide?](https://www.cvuas.de/pesticides/beitrag_en.asp?subid=1&Thema_ID=5&ID=2963&lang=EN), CVUA Stuttgart
- [Rotenone — a review of its toxicity and use for fisheries management](https://www.doc.govt.nz/documents/science-and-technical/sfc211.pdf), Department of Conservation, Selandia Baru
- [Potential of tuba plant root (Derris elliptica) as a vegetable pesticide ingredient: A review](https://iopscience.iop.org/article/10.1088/1755-1315/1253/1/012122)

**Biosaka**
- [Kepopuleran Biosaka Dikritisi Peneliti BRIN](https://www.swadayaonline.com/artikel/13151/Kepopuleran-Biosaka-Dikritisi-Peneliti-BRIN/)
- [Hasil Penelitian BSIP Soal Biosaka Sangat Prematur](https://www.swadayaonline.com/artikel/13090/Hasil-Penelitian-BSIP-Soal-Biosaka-Sangat-Prematur/)
- [Beragam Tanpa Standar, Biosaka Tidak Dapat Distandarisasi secara Ilmiah](https://kepopedia.co.id/artikel/wacana/77489/Beragam-Tanpa-Standar-Biosaka-Tidak-Dapat-Distandarisasi-secara-Ilmiah/)
- [Biosaka: Elisitor Alami dari Indonesia](https://digitani.ipb.ac.id/biosaka-elisitor-alami/), IPB Digitani
