# Peta Modul — dari registri baca-saja ke protokol yang bisa dijalankan

> Rancangan · peta modul & urutan bangun · 20 Agustus 2026 · Status **usulan**  
> Lapis 1 matang, Lapis 3 berskema tanpa permukaan, dan **Lapis 2 — yang menamai proyek ini — masih kosong.**  
> Batu kunci **M1** · Terhalang lubang data **3 fitur** · Blok yang akan diklaim **`op:pro`** dan **`L30`+**
>
> Turunan dari [00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md) bagian 2 dan 3,
> [02-tiga-pasar.md](02-tiga-pasar.md) bagian 5, dan keadaan repositori pada tanggal di atas.
> Dokumen ini tidak mengusulkan arsitektur baru — ia membaca apa yang sudah ada,
> menemukan referensi yang menggantung, dan menyusun urutan menutupnya.

---

## 1. Keadaan tiap lapis

| Lapis | Keadaan | Bukti |
|---|---|---|
| **1 · Ontologi** | **Matang** | 21 skema di `spec/schema/`, kosakata terkurasi + registri Kementan, pemeriksa `L1`–`L29` beserta uji negatifnya, 52/52 pemeriksaan angka lolos |
| **2 · Protokol** | **Kosong** | Tidak ada `protocol.schema.json`, tidak ada contoh, tidak ada permukaan |
| **3 · Eksekusi** | **Berskema, tanpa permukaan** | `plot`, `cycle`, `step` lengkap; 14 contoh nyata cabai, kopi, dan udang di `spec/examples/`; nol layar untuk membuatnya |

Permukaan yang sudah berjalan seluruhnya milik lapisan rujukan: **enam jalur** baca-saja
di [`app/`](../app/), tanpa akun, sesuai [03-enam-pintu.md](03-enam-pintu.md). Itu tingkat
`Rp0` pada model bisnis. Dua tingkat berbayar di atasnya belum punya satu baris pun.

---

## 2. Referensi yang menggantung

Ini temuan yang menentukan urutan seluruh dokumen ini.

`spec/schema/cycle.schema.json` sudah memuat `protocol_ref`:

```json
{ "id": "…", "version": "…", "content_hash": "sha256:…" }
```

dan `spec/schema/step.schema.json` sudah memuat `protocol_step_key`. Keduanya menunjuk
ke entitas **Protokol yang belum ada skemanya**.

> **Akibatnya bukan kosmetik.** Lapis 1 sudah dinyatakan matang dan dipakai 14 contoh,
> tetapi menyimpan dua referensi ke lapis yang belum dispesifikasikan. Setiap hari M1
> ditunda, jumlah data yang menunjuk ke ketiadaan bertambah — dan `content_hash` yang
> gunanya mengunci perbandingan agar tetap sahih justru belum pernah bisa dihitung.

Perlu dicatat juga bahwa `Cycle` sudah punya `anchors` — kejadian acuan beserta tanggal
aktualnya. Itu mesin penjadwalan relatif yang membuat "30 hari setelah tanam" bisa
diganti fase BBCH. Mesinnya ada; yang belum ada adalah protokol yang menyuruhnya bekerja.

---

## 3. Peta modul

| Modul | Isi | Bergantung pada | Menjual ke |
|---|---|---|---|
| **M1 · Protokol** | Skema Lapis 2, aturan pemeriksa, satu protokol cabai nyata | — | prasyarat semuanya |
| **M2 · Rencana musim** | Protokol + Plot + tanggal → `Cycle` + `Step[] mode=planned` | M1 | petugas lapang |
| **M3 · Realisasi & simpangan** | `Step mode=actual`, alasan simpangan, bukti lapangan | M2 | petugas lapang |
| **M4 · Berkas bukti** | `Cycle` + `Step[]` → dokumen siap audit | M3 | offtaker, sertifikasi |
| **M5 · API & ekspor** | Antarmuka publik, versioning data | M1–M4 | integrator |

### M1 · Protokol (Lapis 2)

Isinya sudah ditentukan [00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md) bagian 2 dan
tidak perlu ditemukan ulang: semver beserta changelog, penulis dengan institusi dan tanggal
tinjau ulang, **tingkat bukti A–D**, cakupan berlaku (komoditas, varietas, zona agroekologi,
sistem budidaya, musim), provenance sumber, dan lisensi. Ditambah `content_hash` yang sudah
dirujuk `Cycle`, serta rangkaian langkah bertemplate yang mengacu `Stage`, bukan hari.

Aturan pemeriksa baru di blok `L30`+. Yang terpenting:

> **Protokol hanya boleh menyebut `Substance` dan `Preparation`, tidak pernah `Product`.**
> Ini `L3` netralitas vendor dinaikkan ke Lapis 2. Tanpa aturan ini, "netralitas ditegakkan
> mesin" pada [02-tiga-pasar.md](02-tiga-pasar.md) bagian 6 hanya berlaku di Lapis 1 —
> dan protokol adalah tempat rekomendasi sesungguhnya hidup.

Cakupan wajib punya alasan tersendiri: protokol tanpa cakupan yang jelas adalah protokol
yang salah di sebagian besar lahan.

### M2 · Penyusun rencana musim

Fitur berbayar pertama. Keluarannya kalender tugas, kebutuhan input, dan RAB. RAB-nya
tidak perlu dibangun dari nol — kalkulator rupiah per kilogram hara **sudah berjalan**
sebagai jalur 3, lihat [06-jalur-hitungan-hara.md](06-jalur-hitungan-hara.md).

### M3 · Realisasi dan simpangan

`Step` sengaja dirancang agar rencana dan realisasi berbentuk **sama**, dibedakan hanya
oleh `mode`. Selisih keduanya adalah asetnya, bukan limbahnya — 11 alasan simpangan sudah
terkurasi, dan `DeviationReason` punya medan `signals` yang mengubah alat kepatuhan jadi
alat intelijen rantai pasok.

> **Sinyal batal yang mengikat modul ini.** Kalau kurang dari 30% simpangan punya alasan
> terisi, datanya tidak jujur dan seluruh klaim ke pembayar kehilangan dasar. Kalau kurang
> dari 70% tugas terjadwal tercatat, yang salah produknya, bukan segmennya.
> Sumber: [02-tiga-pasar.md](02-tiga-pasar.md) bagian 7.

### M4 · Berkas bukti

Bertulang SNI 8969 (IndoGAP), bukan taksonomi tandingan. Ini yang sesungguhnya dibeli
offtaker dan lembaga sertifikasi — dan alasan M1 harus benar lebih dulu, karena yang
diaudit adalah kepatuhan terhadap protokol berversi, bukan catatan lepas.

### M5 · API dan ekspor

Fase 7 pada [00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md). Jangan didahulukan:
interoperabilitas tanpa Lapis 2 hanya mengekspor catatan tanpa rujukan.

---

## 4. Fitur yang terhalang lubang data, bukan terhalang kode

Tiga fitur terlihat wajar diminta dan **tidak bisa dibangun sekarang**. Sebabnya sudah
tercatat di [03-enam-pintu.md](03-enam-pintu.md) bagian 3, dan angkanya dijaga
`spec/tools/cek-angka-docs.mjs`.

| Fitur | Yang dibutuhkan | Keadaan registri |
|---|---|---|
| Dosis sadar-subsidi | Status subsidi per produk | **nol** dari 7.196 pupuk |
| Tanggal panen aman | PHI per penggunaan berlabel | **nol** dari 23.058 penggunaan |
| Rekomendasi varietas | Sifat agronomi | **nol** dari 11.227 varietas |

Ketiganya butuh sumber data baru, bukan sprint. Menjanjikannya sebelum datanya ada persis
pola kegagalan (c) pada [00-fondasi-dan-tahapan.md](00-fondasi-dan-tahapan.md) bagian 1:
konten yang tidak bisa dikoreksi, diterbitkan seolah berlaku.

Khusus dosis sadar-subsidi, kebutuhannya nyata dan disebut eksplisit di dokumen fondasi —
rekomendasi yang mengabaikan kuota dan harga subsidi akan diabaikan petani. Jadi ini
bukan fitur yang dibuang, melainkan fitur yang menunggu jalur datanya.

---

## 5. Urutan, dan kenapa bukan urutan lain

Godaan terbesar adalah memulai dari M2, karena itu yang terlihat seperti produk. Urutan
yang diusulkan tetap M1 lebih dulu, dengan tiga alasan:

1. **Referensi menggantung bertambah tiap hari.** Bagian 2 di atas.
2. **M1 yang membuat tingkat berbayar tertinggi bisa dijual.** Yang dibeli lembaga
   sertifikasi adalah protokol berversi dengan tingkat bukti dan penulis bernama.
3. **Netralitas vendor belum ditegakkan di tempat yang paling menentukan.** Rekomendasi
   hidup di Lapis 2, dan Lapis 2 belum punya pemeriksa.

---

## 6. Iterasi pertama

1. `spec/schema/protocol.schema.json`, beserta klaim blok ID `op:pro` yang barisnya
   ditambahkan ke [`spec/00-konvensi-kerja-paralel.md`](../spec/00-konvensi-kerja-paralel.md)
   **dalam commit yang sama**, sesuai cara mengklaim blok di sana.
2. Aturan `L30`–`L33`: protokol tanpa produk; cakupan wajib; tingkat bukti wajib beralasan;
   `content_hash` cocok dengan isinya.
3. Uji negatif untuk keempatnya di `spec/fixtures-invalid/`. Pemeriksa yang tidak pernah
   gagal tidak membuktikan apa pun.
4. Satu protokol cabai nyata di `spec/examples/`, diturunkan dari isi jalur 1 sampai 3
   yang sudah ada — bukan dikarang.

Gate iterasi ini: `npm run all` hijau, dan `Cycle` contoh cabai bisa menunjuk protokol itu
lewat `protocol_ref` dengan `content_hash` yang benar-benar terhitung.

---

## 7. Yang belum diputuskan

Empat hal sengaja dibiarkan terbuka, dan sebaiknya dijawab sebelum M2 dimulai:

1. **Apakah protokol boleh mewarisi protokol lain?** Menggoda untuk cabai dataran rendah
   versus dataran tinggi, tetapi pewarisan membuat `content_hash` dan tingkat bukti jadi
   berlapis — dan tingkat bukti tidak boleh diwarisi diam-diam.
2. **Siapa dewan redaksinya, dan apa yang membuat agronom mau menempelkan namanya** pada
   protokol yang bisa direvisi orang lain. Ini pertanyaan kelima pada
   [02-tiga-pasar.md](02-tiga-pasar.md) bagian 8, dan masih belum terjawab.
3. **Di mana rencana musim disimpan, dan milik siapa.** `data_classification` sudah ada di
   ketiga skema Lapis 3, tetapi kebijakan penyimpanannya belum ditulis.
4. **Bentuk permukaan M3.** Distribusi pada [02-tiga-pasar.md](02-tiga-pasar.md) mengandalkan
   WhatsApp; pencatatan lewat kanal itu punya batasan yang belum diuji.
