# Laporan Agen Bawang Merah (prefiks `BWM`)

Tanggal panen: **2026-08-25** · Direktori kerja: `/Users/syera/open_protocol`
Lingkup: **(A)** dataset penyakit bawang merah · **(B)** lapis epidemiologi & tabular Indonesia untuk keempat komoditas prioritas

## Ringkasan angka

| | Bagian A | Bagian B | Total |
|---|---|---|---|
| Kandidat ditelusuri | 12 | 16 | 28 |
| `diunduh` | 2 | 6 | **8** |
| `ditemukan` | 1 | 1 | 2 |
| `terhalang-akun` | 2 | 2 | 4 |
| `terlalu-besar` | 1 | 1 | 2 |
| `gagal` | 1 | 2 | 3 |
| `ditolak` | 5 | 4 | 9 |
| **Verifikasi** | `terverifikasi` 1 · `sebagian` 1 | `terverifikasi` 5 · `sebagian` 1 | 6 + 2 |

**Total unduhan: 1,63 GB** (batas per agen 8 GB — terpakai 20%).
Tidak ada tabrakan DOI/URL dengan agen cabai, tomat, atau kentang (dicek terhadap keempat `klaim/*.tsv`).

---

# BAGIAN A — dataset penyakit bawang merah

## 1. Berhasil diunduh

### `BWM-01-onion-cold-mendeley` — 111,1 MB — CC BY 4.0 — `sebagian`
Bagian *onion* dari **COLD** (Chilli and Onion Leaf Dataset), pendamping artikel *Data in Brief* 54:110524.
**7.004 JPG** dalam 3 arsip RAR:

| Kelas | Teraugmentasi | Mentah |
|---|---|---|
| healthy | 1.278 | 426 |
| Iris yellow virus (IYSV) | 1.272 | 282 |
| Stemphylium + Colletotrichum leaf blight | 1.217 | 90 |
| purple blotch (*Alternaria porri* / **trotol**) | **735** | **18** |
| **total** | **4.502** | **816** |

Cacah teraugmentasi **cocok persis** dengan angka artikel. Set mentah **diklaim 864, terhitung 816** → status `sebagian`.
Arsip ketiga (1.686 JPG, `sample 1–7 / day N`) **tanpa label penyakit** — 62,6 MB dari 111 MB unduhan yang tidak berguna untuk klasifikasi.
Ini **satu-satunya dataset yang diunduh dengan nama penyakit bawang sungguhan**.

### `BWM-02-onion-bulb-leaf-mendeley` — 1,61 GB — CC BY 4.0 — `terverifikasi`
**16.300 JPG** (diklaim 16.300 — cocok persis), `testzip()` bersih, tanpa password.
**Tidak ada label penyakit sama sekali** — hanya biner *Healthy/Unhealthy*. 75% isinya **umbi** (12.260), daun hanya 4.040 dan yang bergejala 2.020.
Berguna sebagai volume gambar berlisensi bersih; **tidak berguna** untuk menyebut nama penyakit.

## 2. Ditemukan tapi belum bisa diunduh

- **`BWM-A07` YOLO-ODD / ICAR-DOGR Pune** — 1.000 gambar, 5 kelas (*Anthracnose, Healthy, Purple blotch, Stemphylium blight, **Twister disease***). Pernyataan ketersediaan data hanya "available by the authors, without undue reservation" — tanpa repositori, DOI, atau nomor aksesi. Satu-satunya sumber yang memuat kelas *Twister disease*.

## 3. Terhalang akun (tidak ditembus)

- **`BWM-A05` IEEE DataPort "Shallot Dataset"** (DOI 10.21227/aq18-8k05) — "requires an IEEE DataPort Subscription". Ironisnya ini **satu-satunya dataset ber-DOI dari peneliti Indonesia dengan lokasi Brebes** (Freddy Artadima Silaban, ITB) — tetapi isinya sensor IoT kelembapan tanah & pH selama 74 hari, **bukan** citra atau catatan penyakit. Jadi meski terbuka, nilainya untuk kita kecil.
- **`BWM-A06` Roboflow Universe "Onion Leaf Disease"** — halaman 403; API tanpa kunci mengembalikan `{"error":{"message":"This method requires your API key.","type":"OAuthException"}}`. Kelasnya (Healthy, Rust, Botrytis Leaf Blight, **Downy Mildew**, **Purple Blotch**) paling mendekati kebutuhan Indonesia dari semua yang ditemukan — sayang terhalang.

## 4. Terlalu besar

- **`BWM-A04` Garlic Leaf Tipburn (Bangladesh)** — 4,81 GB dalam satu ZIP, melewati batas 3 GB dan tanpa subset resmi. 7.444 gambar (Healthy 3.454 / Affected 3.990), CC BY 4.0. *Allium sativum*, dan Tipburn adalah **gangguan fisiologis**, bukan patogen — relevansi ke bawang merah rendah.

## 5. Gagal

- **`BWM-03` TOM2024** — DOI aktif dan metadata DataCite lengkap (25.844 mentah + 12.227 berlabel, 30 kelas, tomat/bawang/jagung, CC BY 4.0), tetapi **berkasnya tidak terjangkau**: `/versions` menyatakan v1 `available:true`, `/files?folder_id=root&version=1` mengembalikan **array kosong**, endpoint metadata mengembalikan `"error - dataset not found"`, `/folders` 404, halaman web ber-JS tidak terbaca. Dicoba ±25 menit; sempat 502 dan 500. **Bukan** masalah login. Dokumentasi lengkap di `datasets/additional/BWM-03-tom2024-multicrop/README.md`.

## 6. Ditolak beserta alasan

| Kandidat | Alasan |
|---|---|
| **`BWM-A08` JOSH — "Klasifikasi Penyakit Daun Bawang Merah MobileNetV2"** | **Artikel jurnal, bukan dataset.** Halaman menyatakan "Download data is not yet available". |
| `BWM-A10` Repositori IPB — deteksi layu fusarium citra multispektral | Repositori tugas akhir; yang tersedia dokumen tesis, bukan citra. |
| `BWM-A11` Figshare — identifikasi *A. porri* dengan PCR | Suplemen artikel, bukan dataset. |
| `BWM-A12` Mendeley "onion processed data" | Grafik uji akar unit harga bawang pasar India — ekonomi, bukan penyakit. |
| `BWM-A09` COLD bagian cabai | Bukan cacat — dialokasikan ke agen cabai (lihat §7). |

**Yang paling menyakitkan adalah `BWM-A08`.** Kelimanya persis yang dibutuhkan Indonesia — *downy mildew, healthy, leaf blight,* **moler** *(basal rot),* **purple blotch** — 1.188 gambar, dan **tidak dipublikasikan**. Ini pola yang berulang: penelitian bawang merah Indonesia ada dan aktif (UNNES, UNISLA, UB, Untad, IPB, Brebes/Nganjuk), tetapi datanya berhenti di artikel.

## 7. Duplikasi yang dicegah

- **COLD dipecah dengan benar.** `BWM-01` mengambil separuh **onion** (DOI `10.17632/7nxxn4gj5s`); separuh **chilli** (DOI `10.17632/tf9dtfz9m6`, 10.987 gambar, 5 kelas) diserahkan ke agen cabai dan **sudah diklaim** sebagai `CAB-11-cold-chilli-koppal`. Tidak diunduh ulang.
- **PlantVillage** (agen tomat, `TOM-01`) dan **PlantDoc** (agen kentang, `KEN-04`/`KEN-05`) tidak disentuh sesuai KETENTUAN §4.
- Pemeriksaan otomatis atas keempat `klaim/*.tsv`: **tidak ada tabrakan identifier lintas-agen**.

---

# BAGIAN B — lapis epidemiologi & tabular Indonesia

Enam dataset diunduh, semuanya di `datasets/additional/`.

## B1. Statistik serangan OPT — **lapis ini pada dasarnya tidak ada**

### `BWM-07-serangan-opt-hortikultura` — 36 KB — `terverifikasi`
**41 baris data seluruhnya**, dari 4 daerah. Dan tidak satu pun berguna untuk komoditas tertentu:

| Berkas | Wilayah | Baris | Isi |
|---|---|---|---|
| Kota Batu | Kota Batu | 5 | luas (Ha) total kota, 2020–2024 |
| Kotabaru | Kab. Kotabaru | 1 | luas dikendalikan, 2021–2025 |
| **Kab. Malang** | Kab. Malang | **1** | **seluruh kabupaten = 518,52 Ha** |
| Sumut (kab/kota) | Sumatera Utara | 33 | **rasio %**, nyaris biner 0/100 |
| Sumut (provinsi) | Sumatera Utara | 1 | 100 |

Tidak ada rincian per komoditas. Tidak ada nama OPT. Tidak menyentuh **satu pun** sentra bawang merah (tak ada Brebes, Nganjuk, Bima, Solok, Probolinggo). Deret waktu maksimal 5 titik tahunan.

**Penelusuran negatif yang menjelaskan sebabnya:**

| Sumber | Status |
|---|---|
| **`ditlin.hortikultura.pertanian.go.id`** (Dit. Perlindungan Hortikultura) | **NXDOMAIN** — mati di 8.8.8.8 dan 1.1.1.1 |
| `satudata.pertanian.go.id` | hidup, katalog 277 dataset terbaca, **0 tentang OPT** |
| `bbopt.tanamanpangan.pertanian.go.id` | NXDOMAIN |
| `katalog.data.go.id` (CKAN lama) | NXDOMAIN |
| `bsip.pertanian.go.id`, `balitsa.litbang.pertanian.go.id` | **NXDOMAIN**, termasuk lewat proksi |
| `opendata.jabarprov.go.id` / `data.jabarprov.go.id` | 403 Cloudflare (`cf-mitigated: challenge`) |
| `bps.go.id`, `webapi.bps.go.id` | 403 Cloudflare / butuh kunci |
| `data.jatengprov.go.id` (CKAN, memfederasi kabupaten) | hidup, **nihil untuk hortikultura** (hanya padi + perkebunan) |

**Kesimpulan:** matinya domain Direktorat Perlindungan Hortikultura adalah **penyebab tunggal terbesar** kosongnya lapis epidemiologi. Lembaga yang seharusnya memegang data ini tidak lagi punya alamat.

**Bukti bahwa datanya ada tapi tidak diterbitkan:** berkas Kab. Cilacap (`BWM-B17`, 760 KB) berbentuk **bulanan × kecamatan × jenis OPT** — persis format yang dibutuhkan — tetapi sektornya perkebunan dan padi. Formatnya memang dihasilkan BPTPH/LPHP provinsi; versi hortikulturanya saja yang tidak dibuka.

## B2. Basis pengetahuan patogen–inang — **empat sumber, empat lubang berbeda**

### `BWM-05-eppo-distribusi-inang` — 392 KB — 1.803 baris — `terverifikasi`
Rute CSV `gd.eppo.int/taxon/<KODE>/download/{distribution,hosts}_csv` **terbuka tanpa akun** (API REST `data.eppo.int` butuh token → 403, tidak dipakai). 14 berkas untuk 8 OPT.

**Lubangnya justru di patogen terpenting bawang merah** — semuanya HTTP 404, dan ini **lubang cakupan, bukan pembatasan akses** (EPPO hanya menyimpan tabel untuk OPT karantina):
`ALTEPO` *A. porri* · `PERODE` *P. destructor* · `FUSACE` *F. oxysporum* f.sp. *cepae* · `BOTRAL` *B. allii* · `LAPHEG` *S. exigua* · `COLLGL` *C. gloeosporioides*

Dua jebakan kode yang terverifikasi: **`LAPHEX` = *Spodoptera exempta*, bukan *exigua*** (yang benar `LAPHEG`); dan *S. vesicarium* ada di bawah teleomorf **`PLEOAL`** (`STEMVE` → 404).
Granularitas Indonesia hanya tingkat pulau. **Tanpa dimensi waktu.** *R. solanacearum* di Indonesia tercatat `Absent, unreliable record` — jangan dibaca sebagai bukti ketiadaan.

### `BWM-06-gbif-okurensi-patogen` — 3,2 MB — 45 JSON — `terverifikasi`
Terbuka **tanpa kunci API**. 15/15 `matchType=EXACT`; 125.952 okurensi global tercakup; **610 rekaman Indonesia tersimpan penuh** (73 medan), seluruhnya `endOfRecords=true`.

**Empat organisme NOL rekaman Indonesia** — tiga di antaranya penyakit utama bawang merah:
*F. oxysporum* f.sp. *cepae* (**moler**) 0 · *P. destructor* (embun bulu) 0 · *B. allii* (busuk umbi) 0 · *P. infestans* (busuk daun kentang) 0.

Dan yang ada pun tumpul: hanya **30 dari 610** rekaman Indonesia punya `stateProvince`, dengan 5 nilai ("Jawa", "Sumatera" bukan provinsi; "Irian Jaya" usang). `basisOfRecord` mayoritas `MATERIAL_SAMPLE` (406) = isolat lab dari penyetoran sekuens; `OBSERVATION` hanya **1**.
**Peringatan PII:** medan `recordedBy`/`identifiedBy` bisa memuat nama kolektor — jangan disebarkan ke antarmuka publik.

### `BWM-08-globi-interaksi-inang` — 6,3 MB — 14.532 baris — `sebagian`
**Inilah yang menambal lubang EPPO.** Keempat patogen endemik yang 404 di EPPO ada di sini, dan ***Allium ascalonicum* muncul eksplisit 19 kali**:

| Patogen | EPPO | GloBI (baris/target unik) | *A. ascalonicum* |
|---|---|---|---|
| *Alternaria porri* (trotol) | ✗ 404 | 271 / 51 | **4** |
| *Peronospora destructor* | ✗ 404 | 192 / 30 | **4** |
| *Botrytis allii* | ✗ 404 | 76 / 13 | **4** |
| *Spodoptera exigua* | ✗ 404 | 1.390 / 392 | **6** |
| *Stemphylium vesicarium* | dist. saja | 2.078 / 729 | **1** |

`sebagian` karena **9 berkas terpotong tepat di 1.024 baris** (batas halaman API).
**Cacat terbesar:** kolom provenans **seluruhnya kosong** — `study_citation` 0/14.532, `study_source_citation` 0/14.532, `latitude` 0/14.532. Parameter `fields=` menerima nama kolom tetapi mengembalikan nilai kosong, sehingga **tidak ada baris yang bisa ditelusuri ke publikasi asalnya**. Perbaikannya: pakai `type=json.v2` atau arsip massal Zenodo (`BWM-B18`, 2,52 GB).

### `BWM-09-wikidata-patogen-inang` — 203 KB — 291 baris — `terverifikasi` — **CC0**
Lisensi paling bersih di seluruh koleksi. Cek silang JSON 291 binding = CSV 291 baris.
**Tapi cakupan bawang merahnya nyaris nihil:** 8 baris untuk *A. ascalonicum*, 1 untuk *A. cepa*, 0 untuk *A. cepa* var. *aggregatum* — dan **kedelapan-delapannya serangga Lepidoptera**, tanpa satu pun jamur/bakteri/virus.
Dicek per genus: *Peronospora* **0**, *Botrytis* **0**, *Bemisia* **0**; *Alternaria* hanya *solani* & *tomato* (***porri* tidak ada**); *Stemphylium* hanya *lycopersici* & *solani* (***vesicarium* tidak ada**); *Fusarium* hanya f.sp. *lycopersici* (bukan *cepae*).
92% isinya tomat + kentang (269/291).

### `BWM-B10` USDA Fungus–Host — `terhalang-akun` — **keputusan sadar**
Basis data terbesar dan paling relevan yang ditemukan: **421.253 asosiasi jamur–inang unik**, 831.109 rekaman, 219 negara, `dataLastUpdated 2026-08-24`. Host lama `nt.ars-grin.gov` mati; host baru `fungi.ars.usda.gov` adalah SPA Angular yang seluruh datanya lewat `fungi-api.ars.usda.gov`, menolak permintaan telanjang dengan `403 {"error":"Forbidden - Invalid API key"}`.

Kunci itu memang tertanam di bundel JS publik — **tetapi operator jelas memasang gerbang akses, sehingga memakainya berarti melewati pembatasan. Tidak dilakukan.** Endpoint `data-download` juga 404. **Jalur yang benar: menyurati ARS meminta ekspor massal resmi.** Ini sumber paling menjanjikan untuk keempat patogen Allium yang kosong di EPPO, GBIF, dan Wikidata sekaligus.

### `BWM-B11` CABI / PlantwisePlus — `ditolak`
Seluruh URL → **403 Cloudflare**, termasuk yang diizinkan `robots.txt` mereka sendiri dan bahkan sitemap. Tidak ada upaya menembus. Model aksesnya: factsheet Plantwise gratis dibaca tapi **tidak boleh diedarkan ulang**; datasheet Compendium berbayar; data massal dijual. **Bukan lapis data yang layak.**

## B3. Deskripsi penyakit resmi Indonesia

### `BWM-04-ditjenhorti-opt-pestisida` — 9,1 MB — 133 halaman — `terverifikasi`
Tiga PDF dari rak "Buku DITLIN" Ditjen Hortikultura, disusun peneliti **Balitsa Lembang** (Tonny K. Moekasan, Laksminiwati Prabaningrum) dan **BPTP Jambi** (Araz Meilin). Memetakan OPT → golongan cara kerja pestisida untuk **bawang merah, cabai, kentang, kubis**.

Verifikasi teks penuh mengonfirmasi isi: `M-61` memuat "bawang merah" 6×, "trotol" 2×, "bercak ungu" 2×, *spodoptera* 4×, *colletotrichum* 4×, *peronospora* 2×.

Masalahnya nyata: **isi kadaluwarsa 12–14 tahun** (dibuat 2012/2014, diunggah ulang 2024) sehingga **daftar pestisidanya tidak boleh dipakai sebagai rujukan izin edar yang berlaku** — untuk itu PUKPES tetap sumber yang sahih. **Tabel utamanya kemungkinan besar gambar**, bukan teks (rasio ekstraksi hanya 540–905 char/halaman; asal PowerPoint `/Title = "Slide 1"`), jadi butuh OCR. Semuanya berwatermark; versi bersih → 404. **Tomat tidak punya buku sendiri.**

**Balitsa sendiri sudah tidak punya situs** — `balitsa.litbang.pertanian.go.id` dan `bsip.pertanian.go.id` sama-sama NXDOMAIN. Rak Ditjen Hortikultura ini praktis satu-satunya tempat karya Balitsa masih bisa diunduh.

## B4. Data pribadi yang ditemukan — dan apa yang dilakukan

Sesuai instruksi, temuan PII dicatat sebagai masalah kualitas dan **medannya tidak disebarkan**:

1. **`malangkab-luas-serangan-opt-hortikultura.xlsx` (diunduh, `BWM-07`)** — memuat blok tanda tangan pejabat: nama bergelar + **NIP** + email dinas (terdeteksi 1 NIP, 1 email, 2 pola gelar). **NIP Indonesia memuat tanggal lahir pada 8 digit pertamanya.** Berkas mentah disimpan apa adanya sesuai KETENTUAN §2.3, tetapi **nilai persisnya sengaja tidak dicetak** di `struktur.txt` maupun README, dan README mencantumkan aturan pakai eksplisit: hanya baris tabel angka yang boleh diingest.
2. **Berkas OPT Kab. Cilacap (`BWM-B17`) — sengaja TIDAK diunduh.** Memuat nama petugas POPT lengkap dengan NIP dan nama Kepala Bidang, tertanam di badan spreadsheet. Karena sektornya juga salah (perkebunan + padi), tidak ada alasan menyimpan PII yang tidak dibutuhkan. Ini pola yang sama dengan kebocoran PII petugas SP2KP yang sudah tercatat.
3. **GBIF (`BWM-06`)** — medan `recordedBy`/`identifiedBy` ada di skema dan terisi pada sebagian rekaman; ditandai di README agar tidak disalurkan ke antarmuka publik.

---

# Penilaian kelayakan

### (a) Identifikasi penyakit — **buruk untuk bawang merah**
Hanya **`BWM-01`** yang punya nama penyakit, dan hanya 4 kelas, dari **India**. Dua penyakit paling merusak di Indonesia — **moler** (*Fusarium* f.sp. *cepae*) dan **embun bulu** (*P. destructor*) — **tidak ada di dataset gambar mana pun yang berhasil diunduh**. Kelas `Stemphylium + Colletotrichum` digabung, padahal tindakan pengendaliannya berbeda. `BWM-02` hanya biner sehat/sakit. **Tidak cukup untuk menjawab "penyakit apa ini?" pada bawang merah Indonesia.**

### (b) Pelatihan computer vision — **cukup untuk purwarupa, tidak untuk produksi**
Volume total 23.304 gambar berlisensi CC BY 4.0 memadai secara jumlah. Tetapi:
- **Kebocoran data mengintai di dua tempat.** `BWM-01`: augmentasi 5,5× tercampur dengan aslinya — split harus di tingkat gambar asli. `BWM-02`: kemungkinan besar beberapa gambar dari objek fisik yang sama, dan **tidak ada pengenal objek** untuk mencegahnya.
- **Kelas terpenting paling miskin.** *Purple blotch* hanya **18 gambar asli** lawan healthy 426 (1:24). Augmentasi menutupi ketimpangan secara kosmetik tanpa menambah keragaman nyata.
- **Domain gap serius.** Seluruh gambar dari India, latar dan kultivar berbeda, dan sebagian besar (`BWM-02`) berkondisi studio. Model apa pun **wajib diuji ulang** pada citra bawang merah Indonesia sebelum dipercaya.

### (c) Basis pengetahuan — **paling kuat, dan bisa dipakai sekarang**
Ini hasil terbaik dari seluruh panen. Empat sumber saling menambal:
- **GloBI** memberi asosiasi patogen–inang untuk keempat patogen Allium yang EPPO tidak punya, dengan *A. ascalonicum* eksplisit.
- **EPPO** memberi status distribusi resmi + peringkat *Major/Minor host* dengan sitasi, untuk 8 OPT karantina.
- **Wikidata** (CC0) aman diterbitkan ulang, kuat untuk tomat & kentang.
- **`BWM-04`** memberi pemetaan OPT → golongan cara kerja dalam bahasa Indonesia dari Balitsa.

**Cukup untuk membangun tabel rujukan penyakit–inang–gejala** bagi keempat komoditas. Catatan wajib: sitasi GloBI kosong, dan daftar pestisida `BWM-04` kadaluwarsa.

### (d) Analisis epidemiologi — **tidak mungkin dengan data yang ada**
Ini kesimpulan paling tegas dalam laporan ini. Untuk epidemiologi dibutuhkan **luas/keparahan serangan × komoditas × wilayah × waktu**. Yang tersedia:
- **41 baris total** dari 4 daerah, tanpa rincian komoditas, tanpa nama OPT, resolusi tahunan, tanpa satu pun sentra bawang merah.
- EPPO: tanpa dimensi waktu.
- GBIF: 610 rekaman Indonesia, 30 di antaranya punya provinsi, mayoritas isolat lab.
- GloBI & Wikidata: tanpa geografi dan tanpa waktu.

**Tidak ada satu pun deret waktu serangan penyakit untuk komoditas mana pun di Indonesia.** Lapis ini harus dianggap **belum ada**, bukan sekadar tipis.

---

# Kekurangan data & rekomendasi lanjutan

**Seberapa parah celah bawang merah?** Parah, dan berbeda sifat dari celah komoditas lain. Bukan karena penelitiannya tidak ada — penelitian bawang merah Indonesia aktif di Brebes, Nganjuk, dan kampus-kampus — melainkan karena **datanya tidak pernah dideposit**. Setiap dataset Indonesia yang ditemukan berhenti di artikel jurnal atau repositori tesis. Yang bisa diunduh seluruhnya berasal dari India, tentang *Allium cepa* bombay, bukan *A. cepa* var. *aggregatum*.

Berurut menurut nilai per satuan usaha:

1. **Surati ARS untuk ekspor USDA Fungus–Host.** Satu permintaan berpotensi mengisi lubang *A. porri*, *P. destructor*, *F. oxysporum* f.sp. *cepae*, dan *B. allii* sekaligus — keempatnya kosong di EPPO, GBIF, **dan** Wikidata.
2. **Permintaan data lewat PPID untuk luas serangan OPT hortikultura**, ke Ditjen Hortikultura dan BPTPH provinsi sentra (Jawa Tengah → Brebes; Jawa Timur → Nganjuk/Probolinggo; NTB → Bima). Berkas Cilacap membuktikan formatnya ada. Ini **satu-satunya jalur** menuju lapis epidemiologi; scraping sudah terbukti buntu.
3. **Hubungi penulis `BWM-A08` (JOSH) dan tesis IPB (`BWM-A10`).** Keduanya punya persis yang kurang: 5 kelas termasuk **moler** dan **trotol**, dan citra multispektral moler dari **Wanasari, Brebes**. Biaya rendah, imbalan tertinggi untuk celah bawang merah.
4. **Ambil ulang GloBI lewat `type=json.v2`** untuk memulihkan sitasi yang hilang, dan lewati batas 1.024 baris pada 9 berkas.
5. **Periksa portal Jawa Barat lewat peramban** (403 Cloudflare, `robots.txt` sendiri 404) — periksa `robots.txt` di peramban lebih dulu sesuai catatan `panen-lewat-peramban-cloudflare`. Jawa Barat memuat sentra bawang merah Majalengka & Cirebon.
6. **Pertimbangkan pengumpulan citra sendiri** di Brebes/Nganjuk untuk moler dan embun bulu. Setelah seluruh penelusuran ini, kesimpulannya: **untuk dua penyakit itu tidak ada dataset publik mana pun di dunia** — bukan hanya di Indonesia.
7. **`BWM-B19` ATAP Hortikultura** (PDF, terverifikasi 200/9,6 MB, tidak diunduh) layak diambil **sesudah** lapis serangan OPT terisi, sebagai penyebut untuk menormalkan luas serangan terhadap luas tanam.

---

# Temuan untuk tanaman lain

| Temuan | URL | Lisensi | Ukuran | Untuk siapa |
|---|---|---|---|---|
| **COLD bagian cabai** — 10.987 gambar, 5 kelas | https://data.mendeley.com/datasets/tf9dtfz9m6/2 · DOI `10.17632/tf9dtfz9m6` | CC BY 4.0 | ±115 MB | **cabai** — sudah diklaim `CAB-11` |
| **TOM2024** — 25.844+12.227 gambar, 30 kelas, tomat/bawang/jagung | https://data.mendeley.com/datasets/3d4yg89rtr · DOI `10.17632/3d4yg89rtr` | CC BY 4.0 | tak diketahui | **tomat** — ⚠ **berkas tidak terjangkau**, lihat `BWM-03/README.md` sebelum mencoba |
| **`BWM-04`** buku *Hama & Penyakit Cabai* (26 hal.) + *Daftar Pestisida Kubis & Kentang* (49 hal.) | `datasets/additional/BWM-04-ditjenhorti-opt-pestisida/raw/` | tidak dinyatakan | 5,7 MB | **cabai, kentang** — sudah di disk |
| **`BWM-05`** EPPO: `hosts_PHYTIN`, `distribution_RALSSL`+`hosts_RALSSL`, `hosts_BEMITA`, 3× `LIRI*` | `datasets/additional/BWM-05-eppo-distribusi-inang/raw/` | tidak dinyatakan | 392 KB | **kentang, tomat, cabai** — sudah di disk |
| **`BWM-06`** GBIF: *P. infestans*, *A. solani*, *R. solanacearum*, *B. tabaci* | `datasets/additional/BWM-06-gbif-okurensi-patogen/raw/` | CC BY 4.0 / CC0 | 3,2 MB | **kentang, tomat, cabai** — sudah di disk |
| **`BWM-08`** GloBI: 4 organisme Solanaceae | `datasets/additional/BWM-08-globi-interaksi-inang/raw/` | tidak dinyatakan | 6,3 MB | **kentang, tomat, cabai** — sudah di disk |
| **`BWM-09`** Wikidata: 269/291 baris tomat+kentang, 13 cabai | `datasets/additional/BWM-09-wikidata-patogen-inang/raw/` | **CC0** | 203 KB | **tomat, kentang, cabai** — bebas pakai ulang |
| **Garlic Tipburn Bangladesh** — 7.444 gambar Allium | https://data.mendeley.com/datasets/wcgx6bbvw7/1 | CC BY 4.0 | **4,81 GB** | siapa pun dengan anggaran ukuran — melewati batas 3 GB |
| **GloBI bulk** `interactions.tsv.gz` | https://depot.globalbioticinteractions.org/snapshot/target/data/tsv/interactions.tsv.gz | CC-BY-4.0 / CC0 | **2,52 GB** | semua agen — memuat provenans yang hilang di `BWM-08` |

---

## Kepatuhan

- Tidak ada login, paywall, CAPTCHA, atau pembatasan akses yang ditembus. USDA Fungus–Host **sengaja tidak diambil** walau kuncinya terlihat di bundel publik.
- Tidak ada kode dari repositori mana pun yang dijalankan. Seluruh arsip hanya **didaftar isinya** (`bsdtar -tf`, `zipfile.namelist()`, `unzip -l`); tidak ada yang diekstrak ke `datasets/`.
- Data mentah tidak diubah, tidak dibersihkan, dan nama aslinya dipertahankan.
- Tidak ada `git add`, `git commit`, atau `git push`.
- Setiap status `terverifikasi` didukung perintah persis + keluarannya di `struktur.txt` masing-masing. Dua dataset dengan selisih cacah atau pemotongan diturunkan ke `sebagian`; satu yang tidak pernah dibuka ditandai `belum`.
- Total 1,63 GB dari batas 8 GB; dataset terbesar 1,61 GB dari batas 3 GB.
