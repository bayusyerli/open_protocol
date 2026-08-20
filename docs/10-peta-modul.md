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
| **2 · Protokol** | **Kosong** | Tidak ada `protocol.schema.json`, tidak ada contoh, tidak ada permukaan |
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
| **MI · Instrumentasi** | 2 | Ukur repeat use dan waktu ke jawaban pada enam jalur | — |
| **M1 · Protokol** | 3 (prasyarat) | Skema Lapis 2, aturan pemeriksa, satu protokol cabai nyata | M0 selesai untuk jalur 6 |
| **M2 · Rencana musim** | 3 | Protokol + Plot + tanggal → `Cycle` + `Step[] mode=planned` | M1 |
| **M3 · Realisasi & simpangan** | 3 | `Step mode=actual`, alasan simpangan, bukti lapangan | M2 |
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

RAB-nya tidak dibangun dari nol: kalkulator rupiah per kilogram hara **sudah berjalan**
sebagai jalur 3, lihat [06-jalur-hitungan-hara.md](06-jalur-hitungan-hara.md).
Penjadwalannya memakai `anchors` yang sudah ada di `cycle.schema.json`.

### M3 · Realisasi dan simpangan

`Step` sengaja dirancang agar rencana dan realisasi berbentuk **sama**, dibedakan hanya
oleh `mode`. Selisih keduanya asetnya, bukan limbahnya — 11 alasan simpangan sudah
terkurasi, dan `DeviationReason` punya medan `signals`.

> **Sinyal batal yang mengikat modul ini.** Kalau kurang dari 30% simpangan punya alasan
> terisi, datanya tidak jujur dan seluruh klaim ke pembayar kehilangan dasar. Kalau kurang
> dari 70% tugas terjadwal tercatat, yang salah produknya, bukan segmennya.
> Sumber: [02-tiga-pasar.md](02-tiga-pasar.md) bagian 7.

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

## 5. Utang yang harus lunas sebelum fase ketiga

Bukan alasan memulai sekarang, tetapi tidak boleh dilupakan.

`cycle.schema.json` sudah memuat `protocol_ref` dengan `{id, version, content_hash}`, dan
`step.schema.json` sudah memuat `protocol_step_key`. Keduanya menunjuk entitas Protokol
yang belum ada skemanya. Wujud konkretnya ada di `spec/examples/rec-cycle-cabai.json`:

```json
"protocol_ref": {
  "id": "op:proto:00000001",
  "version": "0.1.0",
  "content_hash": "sha256:0000…0000"
}
```

Tiga hal yang sudah ditentukan data itu, dan tidak boleh ditentukan ulang seenaknya:

1. **Prefiksnya `op:proto`,** bukan `op:pro`. Versi 0.1 dokumen ini salah menulisnya.
2. **`proto` belum ada di pola `CuratedId`** pada `common.schema.json`, jadi menambahkannya
   bagian dari M1.
3. **`content_hash`-nya masih nol semua** — placeholder. Belum ada satu entitas pun
   berstatus `published` di repositori, sehingga `L2` belum pernah menyala dan
   kanonikalisasi JSON untuk menghitung hash itu **belum didefinisikan di mana pun**.
   Itu keputusan yang menunggu, bukan detail penulisan.

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
