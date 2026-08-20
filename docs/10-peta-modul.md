# Peta Modul — dari registri baca-saja ke protokol yang bisa dijalankan

> Rancangan · peta modul & urutan bangun · 20 Agustus 2026 · Versi **0.2** · Status **usulan**  
> Urutannya datang dari **model bisnis**, bukan dari kerapian arsitektur.  
> Tiga fase · **M0** dan instrumentasi lebih dulu · **M1** prasyarat fase ketiga, bukan pembuka
>
> Turunan dari deck *Open Protocols — Platform Business Model* v2 (20 Agustus 2026),
> [00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md), dan
> [02-tiga-pasar.md](02-tiga-pasar.md) bagian 5.
>
> **Perubahan dari versi 0.1:** versi pertama menyusun urutan dari keadaan repositori dan
> menaruh Lapis 2 di urutan pertama karena ada referensi menggantung. Itu keliru. Urutan
> komitmen sudah ditetapkan model bisnis, dan Lapis 2 adalah bahan untuk fase ketiga.
> Dua modul yang hilang di versi 0.1 — trust layer dan instrumentasi — kini masuk, dan
> keduanya mendahului M1. Blok ID juga dikoreksi: `op:proto`, bukan `op:pro`.

---

## 1. Keadaan tiap lapis

| Lapis | Keadaan | Bukti |
|---|---|---|
| **1 · Ontologi** | **Matang** | 21 skema di `spec/schema/`, kosakata terkurasi + registri Kementan, pemeriksa `L1`–`L29` beserta uji negatifnya, 52/52 pemeriksaan angka lolos |
| **2 · Protokol** | **Berskema, satu protokol** | `protocol.schema.json`, aturan `L30`–`L33`, `L3` diperluas ke dokumen protokol, dan satu protokol cabai empat langkah. Belum ada permukaan |
| **3 · Eksekusi** | **Berskema, tanpa permukaan** | `plot`, `cycle`, `step` lengkap; 14 contoh nyata cabai, kopi, dan udang; nol layar untuk membuatnya |

Permukaan yang berjalan seluruhnya milik lapisan rujukan: **enam jalur** baca-saja di
[`app/`](../app/), tanpa akun, sesuai [03-enam-pintu.md](03-enam-pintu.md). Itu tingkat
`Rp0`. Dua tingkat berbayar di atasnya belum punya satu baris pun.

---

## 2. Urutan datang dari model bisnis

Deck v2 menyatakan keputusannya di satu baris, dan baris itu yang mengatur dokumen ini:

> **Keputusan sekarang** — biayai trust layer + pilot cabai; jangan mulai dari dashboard petani.

Tiga fasenya terikat musim tanam, bukan kuartal:

| Fase | Jendela | Isi | Yang diukur |
|---|---|---|---|
| **1** | sebelum tanam · ±30 hari | Trust layer | risiko hukum dan kepercayaan hilang |
| **2** | jendela tanam · ±60 hari | Pilot utilitas publik, empat jalur prioritas | repeat use, waktu ke jawaban |
| **3** | tanam → panen · 90–120 hari | Paid workflow, satu offtaker, 50–150 petani | biaya, kehilangan hasil, kepatuhan, waktu audit |

> **Kenapa penekanan ini perlu ditulis.** Godaan terbesar adalah memulai dari modul yang
> paling terasa seperti produk — penyusun rencana musim — atau dari modul yang paling
> mengganggu secara arsitektur, yaitu Lapis 2. Keduanya milik fase ketiga. Mendahulukannya
> berarti membangun lapisan berbayar sebelum ada bukti bahwa lapisan gratisnya dipakai,
> dan itu pola kegagalan yang sama yang dihindari seluruh dokumen ini.

Deck-nya sendiri hidup di repositori terpisah bersama generator dan render aslinya; isi
keputusannya disalin ke sini supaya dokumen ini berdiri sendiri.

---

## 3. Peta modul menurut fase

| Modul | Fase | Isi | Bergantung pada |
|---|---|---|---|
| **M0 · Trust layer** | 1 | Kadensi penyegaran registri, pendapat hukum, lisensi, review agronom | — |
| **MI · Instrumentasi** | 2 | **Selesai** — lihat [11-instrumentasi.md](11-instrumentasi.md) | — |
| **M1 · Protokol** | 3 (prasyarat) | **Selesai** — skema Lapis 2, `L30`–`L33`, satu protokol cabai empat langkah | M0 selesai untuk jalur 6 |
| **M2 · Rencana musim** | 3 | **Penyusun selesai** — `spec/tools/susun-rencana.mjs`; belum ada permukaan | M1 |
| **M3 · Realisasi & simpangan** | 3 | **Pemeriksa selesai** — `spec/tools/periksa-musim.mjs`; permukaan pencatatan belum ada | M2 |
| **M4 · Berkas bukti** | 3 | `Cycle` + `Step[]` → dokumen siap audit | M3 |
| **M5 · API & ekspor** | Fase 7 | Antarmuka publik, versioning data | M1–M4 |

### M0 · Trust layer — fase pertama

Sebagian besar bukan kode, dan justru itu sebabnya mudah tertunda.

- **Kadensi penyegaran registri.** `spec/tools/tarik-registri.mjs` sudah ada dan bisa
  diulang, tetapi belum ada yang menetapkan seberapa sering ia dijalankan dan siapa yang
  memeriksa hasilnya. Registri yang basi pada lapisan gratis bukan sekadar tidak akurat —
  ia menyatakan produk terdaftar padahal izinnya sudah lewat.
- **Pendapat hukum Pasal 77 ayat (1).** Menentukan apakah jalur 6 boleh naik dari catatan
  status hukum jadi anjuran. Ancamannya 7 tahun dan Rp5 miliar; lihat
  [09-jalur-sediaan-pengendali.md](09-jalur-sediaan-pengendali.md).
- **Lisensi.** Kode Apache-2.0 dan konten CC BY-SA 4.0 baru berstatus rekomendasi di
  [00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md) bagian 0, belum keputusan.
- **Review agronom** atas sepuluh teks gejala jalur 1, yang berstatus draft dan
  mengatakannya sendiri di layar.

> **Cabang yang harus disiapkan.** Kalau pendapat hukumnya memberatkan, jalur 6 tetap ada
> sebagai catatan status hukum tetapi wedge turun jadi lima pintu. Jalur 5 tidak ikut
> terpengaruh — sediaan pupuk berada di luar rezim pendaftaran lewat Pasal 72 — dan itulah
> sebabnya keduanya dipisah jadi dua jalur sejak awal.

### MI · Instrumentasi — fase kedua, dan penghalang yang paling diremehkan

Gate fase kedua berbunyi *ukur repeat use dan waktu ke jawaban*. Hari ini **tidak ada satu
pun yang mengukurnya**: [`app/`](../app/) adalah berkas statis tanpa instrumentasi apa pun.

Akibatnya gate itu tidak bisa dilewati bukan karena hasilnya jelek, melainkan karena tidak
ada angkanya. Ini penghalang yang lebih mendesak daripada referensi menggantung di bagian 5.

Yang perlu diputuskan sebelum ditulis, dan urutannya penting:

1. **Apa yang boleh diukur tanpa mengingkari janji "tanpa akun".** Lapisan gratis menjanjikan
   tanpa akun dan tanpa data pribadi. Instrumentasi yang menuntut identitas membatalkan
   janji itu, dan janji itu bagian dari yang dijual.
2. **Metrik utara sudah ditetapkan** [00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md)
   bagian 5 dan sengaja bukan unduhan atau pengguna terdaftar. Instrumentasi jalur harus
   bisa naik ke sana, bukan jadi metrik tandingan.
3. **Waktu ke jawaban** diukur dari masuk sampai layar jawaban, bukan dari ketukan pertama.

### M1 · Protokol (Lapis 2) — prasyarat fase ketiga

Isinya sudah ditentukan [00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md) bagian 2:
semver beserta changelog, penulis dengan institusi dan tanggal tinjau ulang, **tingkat
bukti A–D**, cakupan berlaku, provenance sumber, dan lisensi. `common.schema.json` sudah
menyediakan `EvidenceTier`, `Provenance`, `Contributor` beserta `conflict_of_interest`,
`Lifecycle` beserta `content_hash`, serta `Timing` dan `Condition` — jadi M1 sebagian besar
menyusun, bukan menemukan.

Aturan pemeriksa baru di blok `L30`+, ditambah satu perluasan:

> **`L3` diperluas, bukan diduplikasi.** Aturan netralitas vendor sudah ada dan sudah
> menolak produk komersial pada `Step` bermode `planned` yang punya `protocol_step_key`.
> Yang belum dijaga adalah dokumen protokolnya sendiri, karena langkahnya bersarang dan
> tidak punya `mode` di tingkat atas. Netralitas vendor satu prinsip, jadi satu nomor
> aturan — memberinya nomor baru akan memboroskan nomor yang langka.

### M2 · Penyusun rencana musim

`spec/tools/susun-rencana.mjs` menerima protokol, petak, dan tanggal acuan, lalu
mengeluarkan `Cycle` beserta `Step` bermode `planned` yang lolos pemeriksa. ID-nya
diturunkan dari masukan, bukan dari jam saat dijalankan, sehingga dua keluaran bisa
dibandingkan.

> **Rencana musim bukan kalender penuh, dan tidak boleh disajikan begitu.** Dari lima
> bentuk `Timing`, hanya `relative` yang bisa jadi tanggal. Entitas `Stage` **tidak
> memuat satu pun medan hari, durasi, atau akumulasi suhu** — hanya kode, label, dan
> urutan. Jadi langkah berbasis fase tidak ditanggalkan, dan tidak ditebak: menebak
> "BBCH 51 kira-kira hari ke-45" berarti mengarang fenologi, dan justru penjadwalan
> berbasis fase dipilih [00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md) **karena**
> hari setelah tanam sering salah. Langkah berambang juga tidak bertanggal, dan boleh
> tidak pernah berjalan sepanjang musim — itu hasil yang benar, bukan kepatuhan yang gagal.
>
> Pada protokol cabai empat langkah: **2 bertanggal, 1 menunggu fase, 1 bersyarat.**
> Alat ini menyebut ketiga jumlah itu supaya yang membaca tahu berapa bagian rencananya
> benar-benar kalender.

Kebutuhan input dihitung hanya untuk dosis berbasis luas. Dosis konsentrasi tidak
dijumlahkan karena butuh tahu berapa kali disemprot semusim, dan protokol tidak
menyebutnya — cabang "tidak sanggup" ditampilkan tanpa angka, aturan yang sama dipakai
kalkulator jalur 3.

RAB belum dihitung: harga tidak ada di registri sama sekali. Yang sudah berjalan adalah
rupiah per kilogram hara di jalur 3, dari harga yang dimasukkan pengguna sendiri — lihat
[06-jalur-hitungan-hara.md](06-jalur-hitungan-hara.md).

### M3 · Realisasi dan simpangan

`Step` sengaja dirancang agar rencana dan realisasi berbentuk **sama**, dibedakan hanya
oleh `mode`. Selisih keduanya asetnya, bukan limbahnya — 11 alasan simpangan sudah
terkurasi, dan `DeviationReason` punya medan `signals`.

`spec/tools/periksa-musim.mjs` memautkan realisasi ke rencananya lewat `plan_ref`, dengan
`protocol_step_key` sebagai cadangan, lalu mengadu hasilnya dengan kedua ambang.

> **Ambang kedua tidak bisa gagal apa adanya, dan itu masalah.** `step.schema.json`
> menetapkan `deviation.reason` sebagai medan **wajib**. Jadi setiap simpangan yang
> tercatat pasti punya alasan, dan "persentase simpangan yang punya alasan" selalu 100%
> menurut bentuknya sendiri. Ambang 30% tidak akan pernah menyala — bukan karena datanya
> jujur, melainkan karena pertanyaannya tidak bisa dijawab tidak.
>
> Risikonya pindah ke alasan tampung-segalanya. Dua dari sebelas alasan bersinyal
> `recording_problem` — **"lain-lain"** dan **"keliru"** — dan keduanya bisa menutup apa
> pun tanpa berbohong. Karena itu yang diukur adalah proporsi simpangan yang alasannya
> **substantif**. Ini pembacaan ulang, bukan pelonggaran: yang dituju
> [02-tiga-pasar.md](02-tiga-pasar.md) bagian 7 adalah kejujuran data, dan pengukuran
> yang tidak bisa gagal tidak mengukur kejujuran apa pun.

Dua hal lain ikut dihitung karena keduanya menentukan mutu data yang dijual:
**tindakan di luar rencana** (`plan_ref` kosong — bukan pelanggaran, melainkan temuan),
dan **jeda pencatatan** dari `occurred_at` ke `recorded_at`. Jeda panjang bukan soal
rapi-tidaknya: ingatan dosis dan waktu memudar.

### M4 · Berkas bukti

Bertulang SNI 8969 (IndoGAP), bukan taksonomi tandingan. Ini yang dibeli offtaker dan
lembaga sertifikasi, dan alasan M1 harus benar lebih dulu: yang diaudit adalah kepatuhan
terhadap protokol berversi, bukan catatan lepas.

### M5 · API dan ekspor

Fase 7 pada [00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md). Interoperabilitas
tanpa Lapis 2 hanya mengekspor catatan tanpa rujukan.

---

## 4. Fitur yang terhalang lubang data, bukan terhalang kode

Tiga fitur terlihat wajar diminta dan **tidak bisa dibangun sekarang**. Sebabnya tercatat
di [03-enam-pintu.md](03-enam-pintu.md) bagian 3, dan angkanya dijaga
`spec/tools/cek-angka-docs.mjs`.

| Fitur | Yang dibutuhkan | Keadaan registri |
|---|---|---|
| Dosis sadar-subsidi | Status subsidi per produk | **nol** dari 7.196 pupuk |
| Tanggal panen aman | PHI per penggunaan berlabel | **nol** dari 23.058 penggunaan |
| Rekomendasi varietas | Sifat agronomi | **nol** dari 11.227 varietas |

Ketiganya butuh sumber data baru, bukan sprint. Menjanjikannya sebelum datanya ada persis
pola kegagalan (c) pada [00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md) bagian 1.

Khusus dosis sadar-subsidi, kebutuhannya disebut eksplisit di dokumen fondasi —
rekomendasi yang mengabaikan kuota dan harga subsidi akan diabaikan petani. Jadi ini bukan
fitur yang dibuang, melainkan fitur yang menunggu jalur datanya.

---

## 5. Utang yang sudah lunas, dan sisanya

`cycle.schema.json` memuat `protocol_ref` dan `step.schema.json` memuat
`protocol_step_key` sejak sebelum Lapis 2 ada. Keduanya kini menunjuk entitas yang
sungguh ada: `op:proto:00000001`, kunci `cabai-dataran-rendah`, empat langkah.
Seluruh `protocol_step_key` di sisi cabai resolve.

Tiga hal yang ditentukan data lama, dan diikuti apa adanya:

1. **Prefiksnya `op:proto`** — sudah dipakai `rec-cycle-cabai.json`, kini terdaftar di
   pola `CuratedId`.
2. **Kunci langkah bernamaruang** `<kunci-protokol>/<kunci-langkah>`, juga sudah
   ditentukan contoh yang ada.
3. **`content_hash` palsu dicopot.** Contoh itu memuat `sha256:0000…0000` — nol semua.
   Ia opsional di skema, dan hash palsu yang terlihat sungguhan lebih buruk daripada
   tidak ada.

Yang **belum** lunas:

- **Kanonikalisasi `content_hash`** masih belum didefinisikan; lihat bagian 7. Protokol
  cabai berstatus `draft`, jadi `L2` belum menagihnya.
- **Satu rujukan masih menggantung:** `step-udang-planned-pakan.json` menyebut protokol
  `vaname-intensif` yang belum ditulis. Di luar cakupan M1, dan menjadi calon aturan
  `L34` — rujukan `protocol_step_key` yang tidak resolve — begitu protokol udangnya ada.
  Aturan itu sengaja belum ditulis: aturan yang menyalak pada data yang memang belum
  lengkap akan dilewati orang, bukan diperbaiki.

---

## 6. Iterasi pertama

Mengikuti fase pertama dan kedua, bukan M1.

1. **Tetapkan kadensi penyegaran registri** dan siapa yang memeriksa hasilnya. Alatnya
   sudah ada; yang belum ada kesepakatannya.
2. **Putuskan apa yang boleh diukur tanpa akun,** lalu tulis instrumentasi enam jalur
   sesuai keputusan itu. Tanpa ini gate fase kedua tidak punya angka.
3. **Ajukan pertanyaan hukum Pasal 77 ayat (1)** ke penasihat hukum, dengan cabang
   kalau jawabannya memberatkan sudah disiapkan lebih dulu.
4. **Kunci keputusan lisensi** kode dan konten.

Butir 2 satu-satunya yang berupa kode. Tiga sisanya keputusan, dan itu memang bentuk fase
pertama — sengaja.

---

## 7. Yang belum diputuskan

1. **Kanonikalisasi `content_hash`.** Lihat bagian 5. Menyentuh `L2`, `protocol_ref`, dan
   setiap entitas yang kelak berstatus `published`.
2. **Apakah protokol boleh mewarisi protokol lain?** Menggoda untuk cabai dataran rendah
   versus dataran tinggi, tetapi pewarisan membuat `content_hash` dan tingkat bukti
   berlapis — dan tingkat bukti tidak boleh diwarisi diam-diam.
3. **Siapa dewan redaksinya, dan apa yang membuat agronom mau menempelkan namanya** pada
   protokol yang bisa direvisi orang lain. Pertanyaan kelima pada
   [02-tiga-pasar.md](02-tiga-pasar.md) bagian 8, masih belum terjawab.
4. **Di mana rencana musim disimpan, dan milik siapa.** `data_classification` sudah ada di
   ketiga skema Lapis 3, kebijakan penyimpanannya belum ditulis.
5. **Bentuk permukaan M3.** Distribusi mengandalkan WhatsApp; pencatatan lewat kanal itu
   punya batasan yang belum diuji.
