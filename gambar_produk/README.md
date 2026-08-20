# `gambar_produk/` — panen gambar kemasan, berkunci merek

Folder kerja. Bukan bagian spesifikasi yang terbit; yang mengikat ada di
[`spec/schema/product-image.schema.json`](../spec/schema/product-image.schema.json).

## Kenapa merek, bukan SKU

Panen pilot memaksa keputusan ini, dan bukan sebaliknya. Situs pemegang pendaftaran
menjual **merek**; registri Kementan mendaftarkan **formulasi**. Keduanya tidak berimpit:

| Merek | Pendaftaran di bawahnya |
|---|---|
| LAO YING · PT. MEST INDONESIY | 114 |
| MENTARI · PT. PERMATA AGRO PERSADA | 78 |
| DAUN SAWIT · PT. MULTI MAS CHEMINDO | 76 |

Tidak satu pun situs principal yang diperiksa mencantumkan nomor pendaftaran di teks
halamannya. Mengunci foto karung DAUN SAWIT ke satu `op:prd` berarti menyatakan
kepastian yang tidak dimiliki sumbernya.

Angkanya sendiri melunakkan kerugiannya: **88,0% merek hanya menaungi satu
pendaftaran**, jadi untuk sebagian besar merek kunci merek dan kunci pendaftaran
berimpit. Yang benar-benar ambigu adalah **35,2% pendaftaran** yang hidup di merek
berisi banyak — dan `span.registrations` menyatakan angka itu di setiap baris, supaya
ketakpastiannya terbaca alih-alih tersembunyi.

## Bentuk `brand_key`

Slug dari **nama dagang + produsen kanonik**: `daun-sawit-pt-multi-mas-chemindo`.

Dua-duanya perlu, dan keduanya karena alasan yang ditemukan di data:

- **Nama dagang saja tidak cukup.** 581 nama dipakai lebih dari satu produsen. 22
  produsen berbeda sama-sama mendaftarkan `GLYPHOSATE 95 TC` — itu nama bahan yang
  masuk kolom merek, bukan merek.
- **Produsennya wajib bentuk kanonik** menurut
  [`pukpes_data/principal_alias.csv`](../pukpes_data/principal_alias.csv). Tanpa itu
  LAO YING pecah jadi dua merek palsu: 80 pendaftaran di bawah `MEST INDONESIY` dan 34
  di bawah `PT. MEST INDONESIY` — perusahaan yang sama, ditulis dua cara.

Pembentukan slug juga menyatukan **163 kelompok** ejaan nama dagang: `PROWL  330  EC`
berspasi ganda dengan `PROWL 330 EC`, `Hogasan 27 AL` dengan `HOGASAN 27 AL`,
`2,4 D 98 TC` dengan `2,4-D 98 TC`. Penyatuannya benar, tetapi konvensi kerja paralel
pasal 4 menuntutnya **terlihat**: ejaan yang kalah disimpan di `brand.name_variants`,
dan nama asli tidak pernah ditimpa.

Batasnya 120 aksara, bukan 80 seperti `$defs/Key`, sebab empat merek sah melampaui 80.

## Menyempitkan ke satu pendaftaran

Kunci merek tidak menutup pintu ke tingkat pendaftaran — ia hanya menolak berpura-pura.
`narrowed_to` menunjuk pendaftaran yang benar-benar dipersempit bukti pada gambarnya,
dan `narrowing.basis` menyatakan bagaimana:

| Dasar | Kekuatan | Contoh dari panen pilot |
|---|---|---|
| `komposisi_tercetak` | terkuat yang terbukti | Karung `FERTILA 0-16-17` bertemu hasil analisa uji P₂O₅ 16% + K₂O 17% **tanpa N** — unik di antara 20 pendaftaran FERTILA |
| `jenis_terdaftar` | lemah | Karung ZA cocok jenis, tetapi situs menayangkan empat varian ZA bermerek sama |
| `pendaftaran_penerus` | lemah | Baris SIMPUK lama tanpa komposisi, dicocokkan lewat penerusnya |
| `merek_tunggal` | kuat | `span.registrations` = 1, tidak ada yang perlu dipersempit |

Mencocokkan angka NPK yang tercetak di karung ke `hasilAnalisaUji` registri adalah cara
yang menyelamatkan empat dari delapan merek pada pilot. Layak jadi prosedur baku.

## Nomor tercetak adalah bukti, bukan kunci

`printed_registration` menyimpan nomor yang tercetak di kemasan apa adanya, terpisah
dari `narrowed_to`. Panen pilot menemukan **dua kemasan di situs resmi yang mencetak
nomor yang bukan miliknya**:

- Packshot PHONSKA Petrokimia Gresik mencetak `01.01.2018.251`, `MASA EDAR JULI 2023` —
  nomor yang sudah tidak ada di registri tarikan 19 Agustus 2026.
- Karung COMPACTION DGW mencetak `01.01.2022.111x`, bukan `01.01.2019.127` milik baris
  yang dipanen. Diperkuat ketidakcocokan warna: halaman menyebut Biru Muda, registri
  legacy mencatat Merah kecoklatan.

Karena itu `quality.nomor_pendaftaran_terbaca` berarti nomornya **terbaca**, bukan
**cocok**. Karya seni kemasan bisa tertinggal di belakang registrinya.

## Profil normalisasi

Satu profil, tidak ada varian per sumber.

| Sifat | Nilai | Alasan |
|---|---|---|
| Warna | sRGB | Profil ICC tertanam dipakai untuk konversi, lalu dibuang |
| Sisi terpanjang | 1600 · 800 · 320 px | `besar` · `sedang` · `kecil` |
| `kartu` | 800×800, dipadatkan | Satu-satunya rendition yang boleh jadi 1:1 |
| Nisbah sisi | dipertahankan | Kemasan yang ditarik jadi bohong |
| Perbesaran | tidak pernah | Memperbesar berarti mengarang piksel |
| Rendition yang tidak muat | dilewati | Sumber 300 px yang diminta `besar` dan `sedang` menghasilkan dua berkas byte-identik; dua salinan sama persis dengan dua nama berbeda adalah kebohongan kecil tentang isi koleksi |
| Format | WebP, atau PNG bila beralfa | |
| Anggaran byte | 400 KB · 150 KB · 40 KB | Mutu turun bertahap 82→55, berhenti di situ |
| Orientasi | EXIF dipanggang, lalu dibuang | |
| Metadata | EXIF/GPS/IPTC dibuang | UU 27/2022 |
| Latar | **ditandai, tidak dipaksakan** | Memutihkan latar berarti menyunting bukti |
| Nama berkas | `{brand_key}__{peran}__{rendition}.{ext}` | |
| Sidik | `sha256` berkas + `dhash64` perseptual | |

`dhash64` bukan untuk deduplikasi berkas — `sha256` sudah menangani itu. Ia mencari
**satu foto dipakai ulang lintas merek**, dan pada kunci tingkat merek itu justru makin
berguna: satu produsen yang memakai satu foto untuk beberapa mereknya sekaligus adalah
hal yang ingin terlihat. `periksa.mjs` melaporkannya di blok TEMUAN, terpisah dari
daftar galat, dan tidak menaikkan kode keluar.

## Alur

```bash
# 0. Bangun indeks merek dari registri (turunan; tidak masuk git)
python3 merek.py

# 1. Tiap agen pemanen menulis ke pecahannya sendiri — manifes-agen-N.ndjson —
#    plus berkasnya ke mentah/. Baris manifes ditulis SEBELUM berkasnya diunduh.

# 2. Gabung pecahan jadi satu manifes
python3 gabung.py

# 3. Normalkan
python3 normalkan.py mentah/

# 4. Periksa
node periksa.mjs
```

Urutan di langkah 1 bukan gaya penulisan. Tiga agen pada panen pilot mati di tengah
jalan setelah mengunduh tetapi sebelum menulis manifesnya, dan meninggalkan berkas
yatim — ada berkasnya, tidak ada asal-usulnya, tidak bisa dipulihkan apa pun. Baris
dulu, berkas kemudian: kematian di tengah lalu meninggalkan baris tanpa berkas, dan itu
`normalkan.py` ubah jadi `ditolak` beserta alasannya.

Pemecahan per agen juga bukan kerapian melainkan syarat. Lima proses yang menambah
baris ke satu ndjson akan saling memotong tulisan. `gabung.py` melaporkan bila dua agen
mengaku punya peran sama untuk merek sama.

## Yang ditegakkan `periksa.mjs`

| Aturan | Isi |
|---|---|
| `G1` | Bentuk sesuai `product-image.schema.json` |
| `G2` | `brand_key` ada di indeks, dan `manufacturer_canonical`-nya cocok |
| `G3` | Watermark dan overlay promosi tidak boleh naik ke `terverifikasi` — turunan `L3` |
| `G4` | `redistributable=true` menuntut izin tertulis, foto sendiri, atau lisensi |
| `G5` | Berkas yang disebut manifes ada, `sha256` dan `bytes`-nya cocok |
| `G6` | Satu peran satu gambar per merek |
| `G7` | `span.registrations` sama dengan hitungan indeks |
| `G8` | `narrowed_to` hanya menunjuk pendaftaran di bawah merek itu; `merek_tunggal` hanya sah bila span = 1 |
| `G9` | Klaim `printed_registration.in_registry` benar terhadap registri |
| `G10` | Merek berisi banyak pendaftaran tanpa `narrowed_to` tidak boleh `terverifikasi` |

Kesepuluhnya punya baris pembukti di
[`fixtures-invalid/manifes-buruk.ndjson`](fixtures-invalid/manifes-buruk.ndjson):

```bash
node periksa.mjs fixtures-invalid/manifes-buruk.ndjson   # harus keluar 12 galat
```

Nomornya sengaja `G`, bukan `L`. Aturan `L` milik `spec/check.mjs` dan blok `L30`+ belum
diklaim siapa pun; folder kerja tidak berhak mengambilnya.

## Hak cipta, dan kenapa biner tidak masuk git

Repositori ini CC-BY-SA-4.0. Foto kemasan adalah karya berhak cipta pemegang
pendaftaran, dan menyalin berkasnya ke sini tidak mengubah haknya. Tanpa catatan hak
per berkas, seluruh koleksi jadi tidak bisa diterbitkan sama sekali — sebab tidak ada
cara memisahkan yang boleh dari yang tidak.

`mentah/`, `ternormalkan/`, dan `indeks-merek.json` karena itu diabaikan git. Yang
di-commit hanya catatan tentang gambar: manifes, alat, dan fixture. Berkas biner baru
bisa dipertimbangkan masuk setelah `source.redistributable` benar untuk baris yang
bersangkutan, dan itu keputusan tersendiri — bukan akibat sampingan dari memanen.
