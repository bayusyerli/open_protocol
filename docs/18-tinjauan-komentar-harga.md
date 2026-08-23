# Daftar Tinjauan — Komentar Harga Komoditas

> Bahan untuk pemilik repositori atau siapa pun yang mau menempelkan namanya ·
> dibangkitkan dari `spec/vocab/harga/komentar.json` oleh
> `spec/tools/susun-tinjauan-komentar.mjs` · jalankan ulang bila komentarnya berubah
>
> Menaikkan tingkat bukti komentar dari **D** begitu tinjauannya masuk.

---

## 1. Apa yang diminta, dan apa yang tidak

Kalimat-kalimat di bawah tampil di halaman harga, tepat di bawah angkanya. Halaman
itu **tidak menganjurkan apa pun**: ia menyajikan angka, lalu satu paragraf yang
membacanya. Paragraf itulah yang ditinjau di sini — bukan angkanya.

Angkanya sendiri bertingkat **B**: survei resmi Kemendag, disalin apa adanya, dan
sudah lewat pemeriksaan mesin yang memastikan tiap angka di kalimat memang berasal
dari faktanya. Yang belum diperiksa siapa pun adalah **apakah kalimatnya membaca
angka itu dengan jujur.**

Yang diminta dari peninjau, untuk tiap entri:

1. **Apakah kalimatnya menyesatkan** — bukan apakah ia lengkap, tetapi apakah
   seseorang yang membacanya akan menyimpulkan sesuatu yang tidak benar.
2. **Apakah pola yang disebutnya sungguh ada,** atau ia kebetulan dua tahun yang
   dibungkus jadi kebiasaan tahunan.
3. **Apakah batas di kalimat terakhirnya batas yang benar** — apakah itu memang hal
   terpenting yang angka ini tidak katakan, atau ada yang lebih penting.

**Satu catatan yang berlaku untuk seluruh 43 entri, dan sebaiknya dibaca sekali di sini
alih-alih diulang di tiap entri.** Seri SP2KP mulai 1 Februari 2024, di tengah lonjakan
harga pangan — sehingga **40 dari 43 komoditas mencapai puncak tertingginya pada
Februari–Mei 2024, dan 38 dari 43 mencapai titik terendahnya di jendela yang sama.**
Kedua ekstremnya menumpuk di empat bulan pertama.

Akibatnya "terendah" dan "tertinggi" di tiap kalimat lebih banyak berkata tentang
**kapan serinya kebetulan dimulai** daripada tentang komoditasnya. Itu bukan alasan
menolak kalimatnya — angkanya benar — tetapi ia alasan memeriksa apakah kalimatnya
menyiratkan lebih daripada itu.

Yang **tidak** diminta:

- Bukan menghitung hari yang kosong. Sekitar **32,2% hari kalender di tiap seri
  tidak punya angka**, dan itu normal: SP2KP tidak mencacah akhir pekan, yang saja sudah
  28,5% hari. Angka "300 hari tanpa angka" di tabel bawah karena itu bukan tanda bahaya —
  yang ditandai hanya seri yang menyimpang jauh dari norma itu.
- Bukan memeriksa aritmetikanya. Itu sudah dikerjakan mesin, dan hasilnya tercatat
  di medan `diperiksaMesin` tiap rekaman.
- Bukan menambah komoditas. Cakupan yang sempit sudah diketahui dan dinyatakan di
  layar; ia bukan yang ditinjau di sini.
- Bukan menjamin bebas kekeliruan. Yang dicari **bacaan yang menyesatkan**, bukan
  ketidaksempurnaan.

## 2. Apa yang menempel pada nama peninjau

- Nama dan tanggal tinjau **ikut tercatat** di `komentar.json` dan bisa tampil di layar.
- Tingkat buktinya naik dari **D**; seberapa tinggi bergantung siapa yang meninjau.
- **Tinjauan menempel pada susunan angka yang ditinjau, bukan pada komoditasnya.**
  Begitu serinya bertambah dan kalimatnya ditulis ulang, tinjauan lama gugur
  sendiri dan medannya kembali kosong. Nama Anda tidak akan pernah menaungi kalimat
  yang belum Anda baca.
- Tinjauan boleh berupa **penolakan.** "Kalimat ini menyesatkan dan sebaiknya
  dicabut" adalah hasil yang sah dan lebih berharga daripada persetujuan setengah hati.

Mencatat tinjauan, satu per satu:

```bash
node spec/tools/periksa-komentar-harga.mjs --tulis \
  --tinjau <kunci> --oleh "Nama, Institusi" --tanggal YYYY-MM-DD
```

Atau, setelah membaca seluruhnya, sekaligus dengan `--tinjau-semua`. Perintah itu
**menolak jalan** bila ada satu saja yang tidak lolos pemeriksaan mesin.

---

## 3. Keadaan sekarang

| | |
|---|---:|
| Komentar | 43 |
| Ditulis model bahasa | 0 |
| Ditulis aturan atas angkanya sendiri | 43 |
| Lolos pemeriksaan mesin | 43 |
| **Sudah ditinjau manusia** | **0** |
| Bertanda perlu didahulukan | 6 |

---

## 4. Keempat puluh tiga entri

Diurutkan menurut jumlah penanda, lalu abjad. Yang berhenti di tengah tetap sudah
membaca yang paling mungkin bermasalah.

### 1. Benih Padi

`benih-padi` · op:hrg:00001010 · ditulis aturan · **belum ditinjau**

> **Didahulukan karena:**
> - 161 dari 176 hari kalender tanpa angka (91,5%) — jauh di atas norma 32,2%, jadi ini bukan sekadar akhir pekan; rata-rata bulanannya bersandar pada lebih sedikit pengamatan daripada yang terbaca

**Kalimatnya:**

> Per 26 Juni 2024, Benih Padi tercatat Rp14.591 per kg pada tingkat eceran nasional tertimbang penduduk. Sepanjang 3 Januari 2024 sampai 26 Juni 2024 rentangnya Rp12.991 (7 Februari 2024) sampai Rp63.375 (20 Maret 2024), dengan koefisien variasi 60,3%. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp14.591 / kg pada 2024-06-26 |
| Ubah 7 / 30 / 90 / 365 hari | 3,8% · 1,4% · -26,9% · —% |
| Terendah | Rp12.991 pada 2024-02-07 |
| Tertinggi | Rp63.375 pada 2024-03-20 |
| Rata-rata · gejolak | Rp20.104 · 60,3% |
| Cakupan | 2024-01-03 – 2024-06-26 · 15 titik · 161 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 2. Beras SPHP Bulog

`beras-sphp-bulog` · op:hrg:00001014 · ditulis aturan · **belum ditinjau**

> **Didahulukan karena:**
> - 371 dari 933 hari kalender tanpa angka (39,8%) — jauh di atas norma 32,2%, jadi ini bukan sekadar akhir pekan; rata-rata bulanannya bersandar pada lebih sedikit pengamatan daripada yang terbaca

**Kalimatnya:**

> Per 21 Agustus 2026, Beras SPHP Bulog tercatat Rp12.350 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,1%), dan dibanding setahun lalu turun 1,0%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp10.351 (3 Februari 2024) sampai Rp13.000 (29 Maret 2024), dengan koefisien variasi 3,0%. Rata-rata bulanannya paling tinggi pada September dan paling rendah pada April, berselisih 5,6% — pola dari 562 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp12.350 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,0% · -0,1% · -0,0% · -1,0% |
| Terendah | Rp10.351 pada 2024-02-03 |
| Tertinggi | Rp13.000 pada 2024-03-29 |
| Rata-rata · gejolak | Rp12.228 · 3,0% |
| Bulan termahal / termurah | 9 / 4 — selisih 5,6% |
| Cakupan | 2024-02-01 – 2026-08-21 · 562 titik · 371 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 3. Cabai Merah Besar

`cabai-merah-besar` · op:hrg:00001020 · ditulis aturan · **belum ditinjau**

> **Didahulukan karena:**
> - gejolak 22,9% dengan klaim pola bulanan — sebarannya lebar, dan "paling tinggi pada bulan X" bisa kebetulan dua tahun

**Kalimatnya:**

> Per 21 Agustus 2026, Cabai Merah Besar tercatat Rp41.883 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia naik 3,4%, dan dibanding setahun lalu naik 9,7%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp26.392 (7 November 2024) sampai Rp83.333 (1 Mei 2024), dengan koefisien variasi 22,9%. Rata-rata bulanannya paling tinggi pada Februari dan paling rendah pada September, berselisih 40,7% — pola dari 631 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp41.883 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -2,7% · 3,4% · -15,6% · 9,7% |
| Terendah | Rp26.392 pada 2024-11-07 |
| Tertinggi | Rp83.333 pada 2024-05-01 |
| Rata-rata · gejolak | Rp44.570 · 22,9% |
| Bulan termahal / termurah | 2 / 9 — selisih 40,7% |
| Cakupan | 2024-02-01 – 2026-08-21 · 631 titik · 302 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 4. Cabai Merah Keriting

`cabai-merah-keriting` · op:hrg:00001021 · ditulis aturan · **belum ditinjau**

> **Didahulukan karena:**
> - gejolak 22,3% dengan klaim pola bulanan — sebarannya lebar, dan "paling tinggi pada bulan X" bisa kebetulan dua tahun

**Kalimatnya:**

> Per 21 Agustus 2026, Cabai Merah Keriting tercatat Rp38.540 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia naik 3,2%, dan dibanding setahun lalu naik 8,2%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp10.000 (27 April 2024) sampai Rp72.078 (23 Februari 2024), dengan koefisien variasi 22,3%. Rata-rata bulanannya paling tinggi pada Februari dan paling rendah pada November, berselisih 32,4% — pola dari 633 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp38.540 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -2,3% · 3,2% · -16,6% · 8,2% |
| Terendah | Rp10.000 pada 2024-04-27 |
| Tertinggi | Rp72.078 pada 2024-02-23 |
| Rata-rata · gejolak | Rp43.261 · 22,3% |
| Bulan termahal / termurah | 2 / 11 — selisih 32,4% |
| Cakupan | 2024-02-01 – 2026-08-21 · 633 titik · 300 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 5. Cabai Rawit Merah

`cabai-rawit-merah` · op:hrg:00001023 · ditulis aturan · **belum ditinjau**

> **Didahulukan karena:**
> - gejolak 26,2% dengan klaim pola bulanan — sebarannya lebar, dan "paling tinggi pada bulan X" bisa kebetulan dua tahun

**Kalimatnya:**

> Per 21 Agustus 2026, Cabai Rawit Merah tercatat Rp53.626 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia naik 18,0%, dan dibanding setahun lalu naik 43,5%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp26.608 (9 Mei 2024) sampai Rp100.000 (29 Maret 2024), dengan koefisien variasi 26,2%. Rata-rata bulanannya paling tinggi pada Maret dan paling rendah pada November, berselisih 92,3% — pola dari 632 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp53.626 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 6,3% · 18,0% · -18,3% · 43,5% |
| Terendah | Rp26.608 pada 2024-05-09 |
| Tertinggi | Rp100.000 pada 2024-03-29 |
| Rata-rata · gejolak | Rp51.412 · 26,2% |
| Bulan termahal / termurah | 3 / 11 — selisih 92,3% |
| Cakupan | 2024-02-01 – 2026-08-21 · 632 titik · 301 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 6. Tomat

`tomat` · op:hrg:00001083 · ditulis aturan · **belum ditinjau**

> **Didahulukan karena:**
> - gejolak 30,6% dengan klaim pola bulanan — sebarannya lebar, dan "paling tinggi pada bulan X" bisa kebetulan dua tahun

**Kalimatnya:**

> Per 21 Agustus 2026, Tomat tercatat Rp9.685 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia turun 21,1%, dan dibanding setahun lalu turun 19,2%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp6.992 (17 September 2024) sampai Rp34.705 (11 April 2024), dengan koefisien variasi 30,6%. Rata-rata bulanannya paling tinggi pada April dan paling rendah pada September, berselisih 98,2% — pola dari 634 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp9.685 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -3,1% · -21,1% · -31,7% · -19,2% |
| Terendah | Rp6.992 pada 2024-09-17 |
| Tertinggi | Rp34.705 pada 2024-04-11 |
| Rata-rata · gejolak | Rp13.086 · 30,6% |
| Bulan termahal / termurah | 4 / 9 — selisih 98,2% |
| Cakupan | 2024-02-01 – 2026-08-21 · 634 titik · 299 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 7. Bawang Merah

`bawang-merah` · op:hrg:00001005 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Bawang Merah tercatat Rp32.216 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia turun 11,7%, dan dibanding setahun lalu turun 28,5%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp23.349 (27 Agustus 2024) sampai Rp58.068 (20 April 2024), dengan koefisien variasi 17,8%. Rata-rata bulanannya paling tinggi pada Mei dan paling rendah pada September, berselisih 39,2% — pola dari 634 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp32.216 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -2,1% · -11,7% · -25,1% · -28,5% |
| Terendah | Rp23.349 pada 2024-08-27 |
| Tertinggi | Rp58.068 pada 2024-04-20 |
| Rata-rata · gejolak | Rp37.812 · 17,8% |
| Bulan termahal / termurah | 5 / 9 — selisih 39,2% |
| Cakupan | 2024-02-01 – 2026-08-21 · 634 titik · 299 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 8. Bawang Putih Honan

`bawang-putih-honan` · op:hrg:00001006 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Bawang Putih Honan tercatat Rp34.488 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia turun 7,4%, dan dibanding setahun lalu turun 1,3%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp33.165 (2 Juni 2026) sampai Rp47.500 (27 April 2024), dengan koefisien variasi 6,9%. Rata-rata bulanannya paling tinggi pada April dan paling rendah pada Oktober, berselisih 8,5% — pola dari 634 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp34.488 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,6% · -7,4% · 3,2% · -1,3% |
| Terendah | Rp33.165 pada 2026-06-02 |
| Tertinggi | Rp47.500 pada 2024-04-27 |
| Rata-rata · gejolak | Rp37.499 · 6,9% |
| Bulan termahal / termurah | 4 / 10 — selisih 8,5% |
| Cakupan | 2024-02-01 – 2026-08-21 · 634 titik · 299 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 9. Bawang Putih Kating

`bawang-putih-kating` · op:hrg:00001007 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Bawang Putih Kating tercatat Rp37.600 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia turun 5,2%, dan dibanding setahun lalu turun 2,5%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp35.000 (21 April 2024) sampai Rp50.000 (5 Mei 2024), dengan koefisien variasi 6,3%. Rata-rata bulanannya paling tinggi pada April dan paling rendah pada Oktober, berselisih 6,8% — pola dari 631 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp37.600 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,3% · -5,2% · 4,7% · -2,5% |
| Terendah | Rp35.000 pada 2024-04-21 |
| Tertinggi | Rp50.000 pada 2024-05-05 |
| Rata-rata · gejolak | Rp40.188 · 6,3% |
| Bulan termahal / termurah | 4 / 10 — selisih 6,8% |
| Cakupan | 2024-02-01 – 2026-08-21 · 631 titik · 302 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 10. Beras Medium

`beras-medium` · op:hrg:00001012 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Beras Medium tercatat Rp13.844 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,3%), dan dibanding setahun lalu turun 1,1%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp12.300 (11 Maret 2024) sampai Rp17.600 (29 Maret 2024), dengan koefisien variasi 2,4%. Rata-rata bulanannya paling tinggi pada Maret dan paling rendah pada November, berselisih 3,2% — pola dari 632 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp13.844 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 0,2% · 0,3% · 1,0% · -1,1% |
| Terendah | Rp12.300 pada 2024-03-11 |
| Tertinggi | Rp17.600 pada 2024-03-29 |
| Rata-rata · gejolak | Rp13.696 · 2,4% |
| Bulan termahal / termurah | 3 / 11 — selisih 3,2% |
| Cakupan | 2024-02-01 – 2026-08-21 · 632 titik · 301 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 11. Beras Premium

`beras-premium` · op:hrg:00001013 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Beras Premium tercatat Rp15.483 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,2%), dan dibanding setahun lalu turun 1,2%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp13.383 (11 Maret 2024) sampai Rp17.600 (29 Maret 2024), dengan koefisien variasi 1,8%. Rata-rata bulanannya paling tinggi pada Maret dan paling rendah pada Desember, berselisih 2,1% — pola dari 634 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp15.483 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 0,1% · 0,2% · 1,0% · -1,2% |
| Terendah | Rp13.383 pada 2024-03-11 |
| Tertinggi | Rp17.600 pada 2024-03-29 |
| Rata-rata · gejolak | Rp15.346 · 1,8% |
| Bulan termahal / termurah | 3 / 12 — selisih 2,1% |
| Cakupan | 2024-02-01 – 2026-08-21 · 634 titik · 299 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 12. Cabai Rawit Hijau

`cabai-rawit-hijau` · op:hrg:00001022 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Cabai Rawit Hijau tercatat Rp45.316 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia naik 2,5%, dan dibanding setahun lalu naik 30,9%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp15.972 (4 Februari 2024) sampai Rp100.000 (29 Maret 2024), dengan koefisien variasi 19,2%. Rata-rata bulanannya paling tinggi pada Januari dan paling rendah pada November, berselisih 72,1% — pola dari 631 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp45.316 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 2,4% · 2,5% · 0,7% · 30,9% |
| Terendah | Rp15.972 pada 2024-02-04 |
| Tertinggi | Rp100.000 pada 2024-03-29 |
| Rata-rata · gejolak | Rp39.766 · 19,2% |
| Bulan termahal / termurah | 1 / 11 — selisih 72,1% |
| Cakupan | 2024-02-01 – 2026-08-21 · 631 titik · 302 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 13. Daging Ayam Kampung

`daging-ayam-kampung` · op:hrg:00001024 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Daging Ayam Kampung tercatat Rp76.796 per ekor pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,0%), dan dibanding setahun lalu naik 2,8%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp50.000 (12 Maret 2024) sampai Rp180.000 (21 April 2024), dengan koefisien variasi 7,1%. Rata-rata bulanannya paling tinggi pada April dan paling rendah pada Februari, berselisih 7,4% — pola dari 634 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp76.796 / ekor pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 0,0% · 0,0% · -0,7% · 2,8% |
| Terendah | Rp50.000 pada 2024-03-12 |
| Tertinggi | Rp180.000 pada 2024-04-21 |
| Rata-rata · gejolak | Rp75.468 · 7,1% |
| Bulan termahal / termurah | 4 / 2 — selisih 7,4% |
| Cakupan | 2024-02-01 – 2026-08-21 · 634 titik · 299 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 14. Daging Ayam Ras

`daging-ayam-ras` · op:hrg:00001025 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Daging Ayam Ras tercatat Rp40.283 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia naik 10,5%, dan dibanding setahun lalu naik 17,4%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp33.000 (11 Maret 2024) sampai Rp60.000 (5 Mei 2024), dengan koefisien variasi 6,4%. Rata-rata bulanannya paling tinggi pada Maret dan paling rendah pada Juli, berselisih 8,7% — pola dari 634 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp40.283 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 2,8% · 10,5% · 10,3% · 17,4% |
| Terendah | Rp33.000 pada 2024-03-11 |
| Tertinggi | Rp60.000 pada 2024-05-05 |
| Rata-rata · gejolak | Rp36.437 · 6,4% |
| Bulan termahal / termurah | 3 / 7 — selisih 8,7% |
| Cakupan | 2024-02-01 – 2026-08-21 · 634 titik · 299 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 15. Daging Sapi Impor Beku

`daging-sapi-impor-beku` · op:hrg:00001028 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Daging Sapi Impor Beku tercatat Rp113.640 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia turun 1,6%, dan dibanding setahun lalu turun 4,9%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp83.467 (26 Februari 2024) sampai Rp120.000 (11 April 2024), dengan koefisien variasi 3,0%. Rata-rata bulanannya paling tinggi pada April dan paling rendah pada Februari, berselisih 3,2% — pola dari 617 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp113.640 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 0,3% · -1,6% · -1,8% · -4,9% |
| Terendah | Rp83.467 pada 2024-02-26 |
| Tertinggi | Rp120.000 pada 2024-04-11 |
| Rata-rata · gejolak | Rp110.042 · 3,0% |
| Bulan termahal / termurah | 4 / 2 — selisih 3,2% |
| Cakupan | 2024-02-01 – 2026-08-21 · 617 titik · 316 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 16. Daging Sapi Paha Belakang

`daging-sapi-paha-belakang` · op:hrg:00001029 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Daging Sapi Paha Belakang tercatat Rp141.746 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia naik 0,6%, dan dibanding setahun lalu naik 7,5%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp111.642 (10 Februari 2024) sampai Rp160.000 (11 Maret 2024), dengan koefisien variasi 2,9%. Rata-rata bulanannya paling tinggi pada April dan paling rendah pada Februari, berselisih 3,3% — pola dari 633 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp141.746 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 0,3% · 0,6% · 2,3% · 7,5% |
| Terendah | Rp111.642 pada 2024-02-10 |
| Tertinggi | Rp160.000 pada 2024-03-11 |
| Rata-rata · gejolak | Rp133.535 · 2,9% |
| Bulan termahal / termurah | 4 / 2 — selisih 3,3% |
| Cakupan | 2024-02-01 – 2026-08-21 · 633 titik · 300 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 17. Daging Sapi Paha Depan

`daging-sapi-paha-depan` · op:hrg:00001030 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Daging Sapi Paha Depan tercatat Rp139.699 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia naik 0,5%, dan dibanding setahun lalu naik 7,0%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp111.642 (10 Februari 2024) sampai Rp172.586 (15 April 2024), dengan koefisien variasi 3,1%. Rata-rata bulanannya paling tinggi pada April dan paling rendah pada Februari, berselisih 3,4% — pola dari 632 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp139.699 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 0,2% · 0,5% · 2,4% · 7,0% |
| Terendah | Rp111.642 pada 2024-02-10 |
| Tertinggi | Rp172.586 pada 2024-04-15 |
| Rata-rata · gejolak | Rp131.736 · 3,1% |
| Bulan termahal / termurah | 4 / 2 — selisih 3,4% |
| Cakupan | 2024-02-01 – 2026-08-21 · 632 titik · 301 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 18. Daging Sapi Sandung Lamur

`daging-sapi-sandung-lamur` · op:hrg:00001031 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Daging Sapi Sandung Lamur tercatat Rp100.807 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia naik 1,1%, dan dibanding setahun lalu naik 6,4%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp65.288 (14 April 2024) sampai Rp150.000 (23 Mei 2024), dengan koefisien variasi 3,8%. Rata-rata bulanannya paling tinggi pada Mei dan paling rendah pada Januari, berselisih 2,1% — pola dari 628 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp100.807 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 0,5% · 1,1% · 3,1% · 6,4% |
| Terendah | Rp65.288 pada 2024-04-14 |
| Tertinggi | Rp150.000 pada 2024-05-23 |
| Rata-rata · gejolak | Rp96.489 · 3,8% |
| Bulan termahal / termurah | 5 / 1 — selisih 2,1% |
| Cakupan | 2024-02-01 – 2026-08-21 · 628 titik · 305 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 19. Daging Sapi Tetelan

`daging-sapi-tetelan` · op:hrg:00001032 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Daging Sapi Tetelan tercatat Rp78.558 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia naik 0,6%, dan dibanding setahun lalu naik 4,7%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp62.818 (8 Februari 2024) sampai Rp130.000 (4 Februari 2024), dengan koefisien variasi 4,7%. Rata-rata bulanannya paling tinggi pada April dan paling rendah pada November, berselisih 3,5% — pola dari 631 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp78.558 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 0,2% · 0,6% · 1,1% · 4,7% |
| Terendah | Rp62.818 pada 2024-02-08 |
| Tertinggi | Rp130.000 pada 2024-02-04 |
| Rata-rata · gejolak | Rp76.369 · 4,7% |
| Bulan termahal / termurah | 4 / 11 — selisih 3,5% |
| Cakupan | 2024-02-01 – 2026-08-21 · 631 titik · 302 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 20. Garam Halus

`garam-halus` · op:hrg:00001033 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Garam Halus tercatat Rp10.803 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,0%), dan dibanding setahun lalu nyaris tidak bergerak (0,3%). Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp8.235 (4 Februari 2024) sampai Rp18.720 (21 April 2024), dengan koefisien variasi 3,6%. Rata-rata bulanannya paling tinggi pada April dan paling rendah pada Mei, berselisih 1,6% — pola dari 634 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp10.803 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 0,0% · 0,0% · 0,4% · -0,3% |
| Terendah | Rp8.235 pada 2024-02-04 |
| Tertinggi | Rp18.720 pada 2024-04-21 |
| Rata-rata · gejolak | Rp10.855 · 3,6% |
| Bulan termahal / termurah | 4 / 5 — selisih 1,6% |
| Cakupan | 2024-02-01 – 2026-08-21 · 634 titik · 299 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 21. Gula Pasir Curah

`gula-pasir-curah` · op:hrg:00001034 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Gula Pasir Curah tercatat Rp18.068 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,1%), dan dibanding setahun lalu naik 2,7%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp16.113 (4 Februari 2024) sampai Rp19.333 (5 Mei 2024), dengan koefisien variasi 1,9%. Rata-rata bulanannya paling tinggi pada Mei dan paling rendah pada Oktober, berselisih 3,4% — pola dari 634 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp18.068 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,0% · -0,1% · -0,3% · 2,7% |
| Terendah | Rp16.113 pada 2024-02-04 |
| Tertinggi | Rp19.333 pada 2024-05-05 |
| Rata-rata · gejolak | Rp17.647 · 1,9% |
| Bulan termahal / termurah | 5 / 10 — selisih 3,4% |
| Cakupan | 2024-02-01 – 2026-08-21 · 634 titik · 299 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 22. Gula Pasir Kemasan

`gula-pasir-kemasan` · op:hrg:00001035 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Gula Pasir Kemasan tercatat Rp19.019 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,1%), dan dibanding setahun lalu naik 1,1%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp16.750 (3 Februari 2024) sampai Rp23.000 (11 Mei 2024), dengan koefisien variasi 2,1%. Rata-rata bulanannya paling tinggi pada Mei dan paling rendah pada Februari, berselisih 2,7% — pola dari 631 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp19.019 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,0% · -0,1% · 0,1% · 1,1% |
| Terendah | Rp16.750 pada 2024-02-03 |
| Tertinggi | Rp23.000 pada 2024-05-11 |
| Rata-rata · gejolak | Rp18.707 · 2,1% |
| Bulan termahal / termurah | 5 / 2 — selisih 2,7% |
| Cakupan | 2024-02-01 – 2026-08-21 · 631 titik · 302 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 23. Ikan Kembung

`ikan-kembung` · op:hrg:00001037 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Ikan Kembung tercatat Rp43.669 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia naik 1,2%, dan dibanding setahun lalu naik 11,2%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp25.000 (27 April 2024) sampai Rp43.786 (13 Agustus 2026), dengan koefisien variasi 7,1%. Rata-rata bulanannya paling tinggi pada Januari dan paling rendah pada September, berselisih 4,8% — pola dari 623 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp43.669 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,1% · 1,2% · 1,8% · 11,2% |
| Terendah | Rp25.000 pada 2024-04-27 |
| Tertinggi | Rp43.786 pada 2026-08-13 |
| Rata-rata · gejolak | Rp39.220 · 7,1% |
| Bulan termahal / termurah | 1 / 9 — selisih 4,8% |
| Cakupan | 2024-02-01 – 2026-08-21 · 623 titik · 310 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 24. Jeruk Lokal

`jeruk-lokal` · op:hrg:00001041 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Jeruk Lokal tercatat Rp18.806 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,5%), dan dibanding setahun lalu naik 4,0%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp13.000 (29 Maret 2024) sampai Rp24.931 (11 Februari 2024), dengan koefisien variasi 3,7%. Rata-rata bulanannya paling tinggi pada Mei dan paling rendah pada September, berselisih 7,3% — pola dari 631 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp18.806 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,5% · -0,5% · -3,4% · 4,0% |
| Terendah | Rp13.000 pada 2024-03-29 |
| Tertinggi | Rp24.931 pada 2024-02-11 |
| Rata-rata · gejolak | Rp18.879 · 3,7% |
| Bulan termahal / termurah | 5 / 9 — selisih 7,3% |
| Cakupan | 2024-02-01 – 2026-08-21 · 631 titik · 302 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 25. Kacang Panjang

`kacang-panjang` · op:hrg:00001043 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Kacang Panjang tercatat Rp12.561 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia naik 6,8%, dan dibanding setahun lalu naik 11,5%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp5.000 (5 Mei 2024) sampai Rp23.000 (29 Maret 2024), dengan koefisien variasi 7,5%. Rata-rata bulanannya paling tinggi pada Desember dan paling rendah pada Mei, berselisih 6,7% — pola dari 633 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp12.561 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,4% · 6,8% · 13,3% · 11,5% |
| Terendah | Rp5.000 pada 2024-05-05 |
| Tertinggi | Rp23.000 pada 2024-03-29 |
| Rata-rata · gejolak | Rp10.989 · 7,5% |
| Bulan termahal / termurah | 12 / 5 — selisih 6,7% |
| Cakupan | 2024-02-01 – 2026-08-21 · 633 titik · 300 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 26. Kangkung

`kangkung` · op:hrg:00001045 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Kangkung tercatat Rp8.627 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia turun 1,3%, dan dibanding setahun lalu naik 7,7%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp5.000 (1 Mei 2024) sampai Rp17.969 (21 April 2024), dengan koefisien variasi 8,1%. Rata-rata bulanannya paling tinggi pada April dan paling rendah pada Oktober, berselisih 8,2% — pola dari 633 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp8.627 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -1,2% · -1,3% · -0,8% · 7,7% |
| Terendah | Rp5.000 pada 2024-05-01 |
| Tertinggi | Rp17.969 pada 2024-04-21 |
| Rata-rata · gejolak | Rp8.274 · 8,1% |
| Bulan termahal / termurah | 4 / 10 — selisih 8,2% |
| Cakupan | 2024-02-01 – 2026-08-21 · 633 titik · 300 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 27. Kedelai Impor

`kedelai-impor` · op:hrg:00001051 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Kedelai Impor tercatat Rp13.637 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,1%), dan dibanding setahun lalu nyaris tidak bergerak (0,4%). Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp11.500 (20 April 2024) sampai Rp19.000 (29 Maret 2024), dengan koefisien variasi 3,9%. Rata-rata bulanannya paling tinggi pada Februari dan paling rendah pada Januari, berselisih 3,2% — pola dari 628 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp13.637 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 0,0% · -0,1% · 0,4% · -0,4% |
| Terendah | Rp11.500 pada 2024-04-20 |
| Tertinggi | Rp19.000 pada 2024-03-29 |
| Rata-rata · gejolak | Rp13.900 · 3,9% |
| Bulan termahal / termurah | 2 / 1 — selisih 3,2% |
| Cakupan | 2024-02-01 – 2026-08-21 · 628 titik · 305 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 28. Kedelai Lokal

`kedelai-lokal` · op:hrg:00001052 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Kedelai Lokal tercatat Rp14.106 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,3%), dan dibanding setahun lalu nyaris tidak bergerak (0,2%). Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp12.000 (10 April 2024) sampai Rp18.000 (29 Maret 2024), dengan koefisien variasi 2,7%. Rata-rata bulanannya paling tinggi pada Mei dan paling rendah pada Januari, berselisih 2,5% — pola dari 623 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp14.106 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 0,2% · 0,3% · 0,5% · 0,2% |
| Terendah | Rp12.000 pada 2024-04-10 |
| Tertinggi | Rp18.000 pada 2024-03-29 |
| Rata-rata · gejolak | Rp14.286 · 2,7% |
| Bulan termahal / termurah | 5 / 1 — selisih 2,5% |
| Cakupan | 2024-02-01 – 2026-08-21 · 623 titik · 310 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 29. Kentang Sedang

`kentang-sedang` · op:hrg:00001053 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Kentang Sedang tercatat Rp17.249 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia naik 0,7%, dan dibanding setahun lalu turun 1,5%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp12.000 (11 Maret 2024) sampai Rp26.755 (21 April 2024), dengan koefisien variasi 7,1%. Rata-rata bulanannya paling tinggi pada September dan paling rendah pada Desember, berselisih 11,9% — pola dari 634 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp17.249 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 0,2% · 0,7% · 5,6% · -1,5% |
| Terendah | Rp12.000 pada 2024-03-11 |
| Tertinggi | Rp26.755 pada 2024-04-21 |
| Rata-rata · gejolak | Rp17.560 · 7,1% |
| Bulan termahal / termurah | 9 / 12 — selisih 11,9% |
| Cakupan | 2024-02-01 – 2026-08-21 · 634 titik · 299 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 30. Ketimun Sedang

`ketimun-sedang` · op:hrg:00001055 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Ketimun Sedang tercatat Rp11.024 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia turun 5,0%, dan dibanding setahun lalu naik 20,4%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp4.000 (27 April 2024) sampai Rp32.523 (21 April 2024), dengan koefisien variasi 14,9%. Rata-rata bulanannya paling tinggi pada Agustus dan paling rendah pada Oktober, berselisih 14,3% — pola dari 633 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp11.024 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -3,7% · -5,0% · 17,5% · 20,4% |
| Terendah | Rp4.000 pada 2024-04-27 |
| Tertinggi | Rp32.523 pada 2024-04-21 |
| Rata-rata · gejolak | Rp8.741 · 14,9% |
| Bulan termahal / termurah | 8 / 10 — selisih 14,3% |
| Cakupan | 2024-02-01 – 2026-08-21 · 633 titik · 300 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 31. Mie Instan

`mie-instan` · op:hrg:00001058 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Mie Instan tercatat Rp3.215 per bks pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,0%), dan dibanding setahun lalu nyaris tidak bergerak (0,4%). Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp3.000 (11 Maret 2024) sampai Rp3.628 (21 April 2024), dengan koefisien variasi 1,4%. Rata-rata bulanannya paling tinggi pada Mei dan paling rendah pada Maret, berselisih 1,2% — pola dari 634 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp3.215 / bks pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 0,0% · 0,0% · 0,1% · 0,4% |
| Terendah | Rp3.000 pada 2024-03-11 |
| Tertinggi | Rp3.628 pada 2024-04-21 |
| Rata-rata · gejolak | Rp3.199 · 1,4% |
| Bulan termahal / termurah | 5 / 3 — selisih 1,2% |
| Cakupan | 2024-02-01 – 2026-08-21 · 634 titik · 299 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 32. Minyak Goreng Sawit Curah

`minyak-goreng-sawit-curah` · op:hrg:00001059 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Minyak Goreng Sawit Curah tercatat Rp19.305 per lt pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,1%), dan dibanding setahun lalu naik 9,8%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp14.641 (10 Februari 2024) sampai Rp19.496 (26 Mei 2026), dengan koefisien variasi 7,4%. Rata-rata bulanannya paling tinggi pada Januari dan paling rendah pada Februari, berselisih 6,1% — pola dari 634 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp19.305 / lt pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 0,0% · -0,1% · -0,8% · 9,8% |
| Terendah | Rp14.641 pada 2024-02-10 |
| Tertinggi | Rp19.496 pada 2026-05-26 |
| Rata-rata · gejolak | Rp17.302 · 7,4% |
| Bulan termahal / termurah | 1 / 2 — selisih 6,1% |
| Cakupan | 2024-02-01 – 2026-08-21 · 634 titik · 299 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 33. Minyak Goreng Sawit Kemasan Premium

`minyak-goreng-sawit-kemasan-premium` · op:hrg:00001060 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Minyak Goreng Sawit Kemasan Premium tercatat Rp22.530 per lt pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,0%), dan dibanding setahun lalu naik 7,3%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp17.262 (8 Februari 2024) sampai Rp22.544 (14 Agustus 2026), dengan koefisien variasi 4,8%. Rata-rata bulanannya paling tinggi pada Juli dan paling rendah pada Februari, berselisih 4,0% — pola dari 633 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp22.530 / lt pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,1% · 0,0% · 1,2% · 7,3% |
| Terendah | Rp17.262 pada 2024-02-08 |
| Tertinggi | Rp22.544 pada 2026-08-14 |
| Rata-rata · gejolak | Rp20.598 · 4,8% |
| Bulan termahal / termurah | 7 / 2 — selisih 4,0% |
| Cakupan | 2024-02-01 – 2026-08-21 · 633 titik · 300 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 34. Minyakita

`minyakita` · op:hrg:00001061 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Minyakita tercatat Rp15.884 per lt pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,0%), dan dibanding setahun lalu turun 4,9%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp14.000 (11 Maret 2024) sampai Rp18.000 (5 Mei 2024), dengan koefisien variasi 3,6%. Rata-rata bulanannya paling tinggi pada Januari dan paling rendah pada Februari, berselisih 5,5% — pola dari 633 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp15.884 / lt pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 0,0% · -0,0% · 0,0% · -4,9% |
| Terendah | Rp14.000 pada 2024-03-11 |
| Tertinggi | Rp18.000 pada 2024-05-05 |
| Rata-rata · gejolak | Rp16.364 · 3,6% |
| Bulan termahal / termurah | 1 / 2 — selisih 5,5% |
| Cakupan | 2024-02-01 – 2026-08-21 · 633 titik · 300 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 35. Pisang Lokal

`pisang-lokal` · op:hrg:00001068 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Pisang Lokal tercatat Rp13.053 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia naik 0,5%, dan dibanding setahun lalu turun 0,9%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp8.000 (27 April 2024) sampai Rp23.258 (21 April 2024), dengan koefisien variasi 7,2%. Rata-rata bulanannya paling tinggi pada April dan paling rendah pada Desember, berselisih 4,7% — pola dari 633 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp13.053 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | 0,4% · 0,5% · 1,0% · -0,9% |
| Terendah | Rp8.000 pada 2024-04-27 |
| Tertinggi | Rp23.258 pada 2024-04-21 |
| Rata-rata · gejolak | Rp13.480 · 7,2% |
| Bulan termahal / termurah | 4 / 12 — selisih 4,7% |
| Cakupan | 2024-02-01 – 2026-08-21 · 633 titik · 300 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 36. Sawi Hijau

`sawi-hijau` · op:hrg:00001073 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Sawi Hijau tercatat Rp9.790 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,1%), dan dibanding setahun lalu naik 5,7%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp5.000 (1 Mei 2024) sampai Rp26.000 (29 Maret 2024), dengan koefisien variasi 9,8%. Rata-rata bulanannya paling tinggi pada April dan paling rendah pada September, berselisih 10,8% — pola dari 631 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp9.790 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,7% · 0,1% · -11,8% · 5,7% |
| Terendah | Rp5.000 pada 2024-05-01 |
| Tertinggi | Rp26.000 pada 2024-03-29 |
| Rata-rata · gejolak | Rp9.843 · 9,8% |
| Bulan termahal / termurah | 4 / 9 — selisih 10,8% |
| Cakupan | 2024-02-01 – 2026-08-21 · 631 titik · 302 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 37. Susu Bubuk Balita

`susu-bubuk-balita` · op:hrg:00001076 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Susu Bubuk Balita tercatat Rp44.496 per 400gr pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,1%), dan dibanding setahun lalu turun 0,6%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp38.305 (10 Februari 2024) sampai Rp65.000 (11 Februari 2024), dengan koefisien variasi 2,9%. Rata-rata bulanannya paling tinggi pada April dan paling rendah pada Maret, berselisih 0,7% — pola dari 632 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp44.496 / 400gr pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,1% · 0,1% · -0,0% · -0,6% |
| Terendah | Rp38.305 pada 2024-02-10 |
| Tertinggi | Rp65.000 pada 2024-02-11 |
| Rata-rata · gejolak | Rp44.549 · 2,9% |
| Bulan termahal / termurah | 4 / 3 — selisih 0,7% |
| Cakupan | 2024-02-01 – 2026-08-21 · 632 titik · 301 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 38. Tahu Putih

`tahu-putih` · op:hrg:00001078 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Tahu Putih tercatat Rp11.711 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,3%), dan dibanding setahun lalu naik 1,9%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp8.000 (4 Februari 2024) sampai Rp20.000 (21 April 2024), dengan koefisien variasi 4,8%. Rata-rata bulanannya paling tinggi pada April dan paling rendah pada Mei, berselisih 3,2% — pola dari 632 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp11.711 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,1% · -0,3% · -0,2% · 1,9% |
| Terendah | Rp8.000 pada 2024-02-04 |
| Tertinggi | Rp20.000 pada 2024-04-21 |
| Rata-rata · gejolak | Rp11.672 · 4,8% |
| Bulan termahal / termurah | 4 / 5 — selisih 3,2% |
| Cakupan | 2024-02-01 – 2026-08-21 · 632 titik · 301 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 39. Telur Ayam Kampung

`telur-ayam-kampung` · op:hrg:00001079 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Telur Ayam Kampung tercatat Rp54.948 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,0%), dan dibanding setahun lalu naik 1,1%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp7.818 (11 Februari 2024) sampai Rp70.000 (27 April 2024), dengan koefisien variasi 4,8%. Rata-rata bulanannya paling tinggi pada Maret dan paling rendah pada Februari, berselisih 4,2% — pola dari 632 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp54.948 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,0% · -0,0% · -0,0% · 1,1% |
| Terendah | Rp7.818 pada 2024-02-11 |
| Tertinggi | Rp70.000 pada 2024-04-27 |
| Rata-rata · gejolak | Rp54.761 · 4,8% |
| Bulan termahal / termurah | 3 / 2 — selisih 4,2% |
| Cakupan | 2024-02-01 – 2026-08-21 · 632 titik · 301 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 40. Telur Ayam Ras

`telur-ayam-ras` · op:hrg:00001080 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Telur Ayam Ras tercatat Rp26.225 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia turun 3,3%, dan dibanding setahun lalu turun 7,8%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp25.929 (10 Juli 2026) sampai Rp40.000 (21 April 2024), dengan koefisien variasi 4,7%. Rata-rata bulanannya paling tinggi pada Maret dan paling rendah pada Agustus, berselisih 9,2% — pola dari 634 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp26.225 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,4% · -3,3% · -5,7% · -7,8% |
| Terendah | Rp25.929 pada 2026-07-10 |
| Tertinggi | Rp40.000 pada 2024-04-21 |
| Rata-rata · gejolak | Rp28.761 · 4,7% |
| Bulan termahal / termurah | 3 / 8 — selisih 9,2% |
| Cakupan | 2024-02-01 – 2026-08-21 · 634 titik · 299 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 41. Tempe Bungkus

`tempe-bungkus` · op:hrg:00001081 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Tempe Bungkus tercatat Rp15.048 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,3%), dan dibanding setahun lalu nyaris tidak bergerak (0,3%). Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp10.000 (11 Maret 2024) sampai Rp30.000 (29 Maret 2024), dengan koefisien variasi 6,3%. Rata-rata bulanannya paling tinggi pada April dan paling rendah pada Januari, berselisih 2,6% — pola dari 634 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp15.048 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,1% · -0,3% · 0,6% · 0,3% |
| Terendah | Rp10.000 pada 2024-03-11 |
| Tertinggi | Rp30.000 pada 2024-03-29 |
| Rata-rata · gejolak | Rp15.210 · 6,3% |
| Bulan termahal / termurah | 4 / 1 — selisih 2,6% |
| Cakupan | 2024-02-01 – 2026-08-21 · 634 titik · 299 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 42. Tepung Terigu

`tepung-terigu` · op:hrg:00001082 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Tepung Terigu tercatat Rp12.490 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,3%), dan dibanding setahun lalu nyaris tidak bergerak (0,0%). Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp11.000 (11 Maret 2024) sampai Rp15.000 (21 April 2024), dengan koefisien variasi 1,8%. Rata-rata bulanannya paling tinggi pada Juli dan paling rendah pada Februari, berselisih 1,2% — pola dari 634 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp12.490 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,1% · -0,3% · 0,2% · -0,0% |
| Terendah | Rp11.000 pada 2024-03-11 |
| Tertinggi | Rp15.000 pada 2024-04-21 |
| Rata-rata · gejolak | Rp12.355 · 1,8% |
| Bulan termahal / termurah | 7 / 2 — selisih 1,2% |
| Cakupan | 2024-02-01 – 2026-08-21 · 634 titik · 299 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---

### 43. Udang Basah

`udang-basah` · op:hrg:00001087 · ditulis aturan · **belum ditinjau**

**Kalimatnya:**

> Per 21 Agustus 2026, Udang Basah tercatat Rp76.232 per kg pada tingkat eceran nasional tertimbang penduduk. Dalam 30 hari terakhir ia nyaris tidak bergerak (0,4%), dan dibanding setahun lalu naik 2,9%. Sepanjang 1 Februari 2024 sampai 21 Agustus 2026 rentangnya Rp60.000 (1 Mei 2024) sampai Rp95.069 (10 April 2024), dengan koefisien variasi 3,1%. Rata-rata bulanannya paling tinggi pada April dan paling rendah pada November, berselisih 3,0% — pola dari 630 titik, belum tentu berulang. Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.

**Angka yang dipakai menulisnya:**

| | |
|---|---:|
| Harga terakhir | Rp76.232 / kg pada 2026-08-21 |
| Ubah 7 / 30 / 90 / 365 hari | -0,2% · 0,4% · -0,2% · 2,9% |
| Terendah | Rp60.000 pada 2024-05-01 |
| Tertinggi | Rp95.069 pada 2024-04-10 |
| Rata-rata · gejolak | Rp73.948 · 3,1% |
| Bulan termahal / termurah | 4 / 11 — selisih 3,0% |
| Cakupan | 2024-02-01 – 2026-08-21 · 630 titik · 303 hari tanpa angka |

- [ ] Kalimatnya tidak menyesatkan
- [ ] Pola yang disebutnya sungguh ada
- [ ] Batas di kalimat terakhirnya batas yang benar

Catatan peninjau:

---
