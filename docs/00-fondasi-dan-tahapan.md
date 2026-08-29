# Pranatani — Fondasi & Tahapan Pembangunan

> Dokumen kerja. Versi 0.1 — 19 Agustus 2026.
> Status: hasil riset awal + rekomendasi tahapan. Belum ada keputusan yang dikunci.

---

## 0. Ringkasan: 7 keputusan yang menentukan nasib platform ini

Tahapan teknis bisa dikoreksi kapan saja. Tujuh hal di bawah ini mahal sekali
untuk diubah setelah ada pengguna dan mitra — jadi ini yang harus benar duluan,
sebelum satu baris kode pun ditulis.

| # | Keputusan | Rekomendasi awal |
|---|---|---|
| 1 | Pranatani itu **infrastruktur data** atau **aplikasi**? | Infrastruktur (skema + registry protokol) dulu; aplikasi tipis di atasnya |
| 2 | Cara "agnostik" diwujudkan | Agnostik di **skema**, dalam di **konten**. Bukan aplikasi generik |
| 3 | Komoditas beachhead | Satu komoditas hortikultura siklus pendek (cabai / bawang merah) |
| 4 | Netralitas vendor ditegakkan bagaimana | Lapis generik (bahan aktif & hara) terpisah dari lapis produk; produk hanya boleh menempel lewat nomor pendaftaran resmi |
| 5 | Lisensi & kepemilikan data | Kode Apache-2.0; konten protokol CC BY-SA 4.0; **data usaha tani milik petani**, bukan milik platform |
| 6 | Siapa yang bayar | Bukan petani. Aktor rantai nilai: offtaker, eksportir (EUDR), principal input, lembaga keuangan, pemerintah |
| 7 | Metrik utara | Bukan MAU/GMV. **Kepatuhan protokol × delta hasil-biaya per musim**, dengan baseline |

---

## 1. Diagnosis: kenapa platform petani biasanya patah

Tiga pola kegagalan yang harus dihindari secara struktural, bukan lewat niat baik.

**a. Metrik palsu dan neraca yang berat.**
eFishery dan TaniHub adalah dua kasus paling mahal di Indonesia — bukan karena
teknologinya salah, tapi karena model bisnisnya menuntut pertumbuhan angka
(GMV, jumlah petani mitra) yang akhirnya digelembungkan, dan karena keduanya
menaruh barang serta pembiayaan di neraca sendiri. Platform yang menjual/membeli
komoditas atau input dengan modal sendiri akan selalu tergoda mengejar volume.
**Implikasi desain:** Pranatani jangan menyentuh kepemilikan barang di
tahap awal. Jadi lapisan pengetahuan dan pencatatan, bukan pedagang.

**b. Salah mengukur nilai.**
Bukti RCT dari Precision Development (PxD) di padi India — 13.675 petani —
menunjukkan pola yang konsisten: layanan advisori digital meningkatkan
pengetahuan dan adopsi praktik secara signifikan, menaikkan hasil panen secara
**moderat**, tapi menurunkan probabilitas **gagal panen secara besar**.
**Implikasi desain:** posisikan Pranatani sebagai alat *penurun risiko dan
biaya*, bukan janji "hasil naik 30%". Janji hasil naik akan menghancurkan
kredibilitas di musim pertama yang cuacanya jelek.

**c. Konten statis yang tidak bisa dikoreksi.**
"Package of Practices" klasik (dan sebagian besar SOP budidaya di Indonesia)
diterbitkan sebelum musim, di level zona agroklimat, dan jarang diperbarui —
tidak bisa menyesuaikan serangan OPT, anomali cuaca, atau heterogenitas tanah.
**Implikasi desain:** protokol harus punya versi, penulis, tanggal tinjau, dan
mekanisme umpan balik dari lapangan. Kalau tidak, ini cuma PDF dengan tampilan
lebih bagus.

---

## 2. Tesis produk: tiga lapis yang harus dipisah sejak awal

Ini inti arsitekturnya. Kalau tiga lapis ini tercampur, platform akan mentok
di komoditas kedua.

### Lapis 1 — Ontologi (agnostik komoditas)
Primitif yang berlaku untuk padi, cabai, kopi, sawit, sampai udang:

- `Plot` — geometri lahan, ID stabil, kepemilikan/penguasaan
- `Cycle` / `Season` — satu siklus budidaya, punya awal-akhir dan target
- `Stage` — fase pertumbuhan, dikodekan dengan **skala BBCH** (00–99); ini yang
  membuat "hari ke-30 setelah tanam" bisa diganti "fase 5 daun", yang jauh lebih
  benar secara agronomis dan berlaku lintas komoditas
- `Operation` / `Task` — tindakan: olah tanah, tanam, aplikasi, irigasi, panen
- `InputApplication` — bahan, dosis, cara, waktu, interval, PHI (pre-harvest interval)
- `Observation` — pengamatan: OPT, tinggi tanaman, pH, EC, gejala
- `Measurement` — nilai + satuan (pakai daftar satuan standar, jangan free text)
- `Cost` / `Yield` — supaya tiap protokol bisa dihitung ekonominya

Jangan bikin ontologi dari nol. Petakan ke standar yang sudah ada supaya data
bisa keluar-masuk: **AGROVOC** (tesaurus multibahasa FAO), **Crop Ontology** dan
**Agronomy Ontology (AgrO)** dari CGIAR, **ICASA** (variabel model tanaman),
**AgGateway ADAPT Standard v1.0** (skema operasi lapangan B2B), dan **AgStack
GeoID / Asset Registry** (Linux Foundation) untuk identitas lahan.

### Lapis 2 — Protokol (dalam per komoditas)
Sebuah *protocol template*: rangkaian `Stage → Operation → InputApplication`
dengan syarat dan cabang keputusan. Yang membedakannya dari artikel blog:

- **Versi** (semver) dan changelog
- **Penulis + institusi + tanggal tinjau ulang**
- **Tingkat bukti** — usulkan 4 tingkat: A (uji multi-lokasi/multi-musim),
  B (standar institusi resmi: SNI/BSIP/Balai), C (konsensus praktisi/penyuluh),
  D (pengalaman tunggal, belum terverifikasi)
- **Cakupan berlaku** — komoditas, varietas, zona agroekologi, sistem budidaya,
  musim. Protokol tanpa cakupan yang jelas adalah protokol yang salah di 80% lahan
- **Provenance sumber** — dari mana turunannya, lisensinya apa
- **Lisensi** dan cara mengutip

### Lapis 3 — Eksekusi (nilai riil untuk petani)
Protokol dipakai jadi **rencana musim**: kalender tugas, kebutuhan input, RAB.
Lalu yang benar-benar terjadi dicatat: apa yang dikerjakan, kapan, dosisnya
berapa, hasilnya berapa, biayanya berapa. Selisih antara rencana dan realita
inilah asetnya.

**Loop inilah produknya.** Dokumen protokol digratiskan; kemampuan menjalankan,
mencatat, membuktikan, dan memperbaiki protokol dari data lapangan yang bernilai.
Ini juga satu-satunya cara jujur menaikkan tingkat bukti sebuah protokol dari D
ke A tanpa punya kebun percobaan sendiri.

---

## 3. Tahapan

Tujuh fase. Setiap fase punya **gate** — syarat lulus sebelum lanjut. Jangan
lompat gate; ini persis mekanisme yang mencegah pola kegagalan di bagian 1.

### Fase 0 — Penajaman tesis & nama (2–4 minggu)

**Kerjakan:**
- Tulis "apa ini / apa BUKAN ini" satu halaman. Yang paling penting: nyatakan
  eksplisit bahwa ini bukan marketplace input, bukan offtaker, bukan fintech.
- **Uji nama.** ~~"Open Protocol(s)" itu deskriptif dan sudah dipakai di domain
  lain (mis. standar pelaporan risiko OPERA di keuangan). Nama deskriptif sulit
  dilindungi sebagai merek dan mudah tertukar.~~ **Diputuskan 24 Agustus 2026:
  nama platform jadi Pranatani, domain `pranatani.com`.** Ia nama pendek
  berbahasa Indonesia — persis opsi yang disiapkan baris ini — dan "protokol
  budidaya" turun jadi deskriptor, bukan merek. Seluruh permukaan, kosakata, dan
  30.739 berkas terbitan sudah dibangun ulang dengan nama dan asal itu.
  Prefiks pengenal `op:` **tidak** ikut berubah: ia menyatukan 155.916 rujukan
  antar-entitas, dan pengenal yang berubah karena rebranding berhenti jadi
  pengenal. Yang **belum** ditutup: penelusuran merek resmi ke DJKI kelas
  9/42/44 — itu pekerjaan konsultan HKI, bukan pekerjaan repositori ini.
- Kunci **struktur lisensi** (kode / konten / data) dan **struktur badan hukum**.
- Tetapkan model tata kelola: rujuk **DPG Standard** (9 indikator: relevansi SDG,
  lisensi terbuka, kepemilikan jelas, independensi platform, dokumentasi,
  ekstraksi data non-PII, privasi & kepatuhan hukum, standar terbuka, keamanan
  konten). Ini checklist paling murah untuk memaksa disiplin "publik" sejak awal,
  sekaligus pintu masuk ke pendanaan filantropi/multilateral nanti.

**Gate:** satu halaman tesis + nama yang aman + lisensi terkunci.

---

### Fase 1 — Kebenaran lapangan (4–8 minggu, boleh paralel dengan Fase 2)

Ini fase yang paling sering dilewati dan paling mahal kalau dilewati.

**Kerjakan:**
- Wawancara mendalam **30–60 petani** di 2–3 sentra, plus **penyuluh (PPL),
  kios/toko tani, ketua poktan/gapoktan, offtaker/bandar, dan koperasi**.
- Pertanyaan intinya bukan "mau aplikasi seperti apa", tapi: *keputusan budidaya
  siapa yang sebenarnya menentukan?* Di banyak sentra, yang menentukan pilihan
  benih, pupuk, dan pestisida adalah **kios** (karena ada kredit saprodi) atau
  **bandar**, bukan petani. Kalau ini benar, maka pengguna pertama Pranatani
  bukan petani — melainkan penyuluh, kios, atau koperasi.
- Kumpulkan **korpus protokol yang sudah ada**: SNI 8969:2021 (IndoGAP tanaman
  pangan), pedoman GAP hortikultura/perkebunan, terbitan BSIP/Balai, buku saku
  penyuluh, SOP internal offtaker, dan catatan tulis tangan petani. Ini bahan
  baku Fase 3 sekaligus peta lisensi konten.
- Ukur baseline: biaya per hektar, hasil, kerugian akibat OPT, sumber informasi.

**Gate:** peta pengambil keputusan yang tervalidasi + ≥20 protokol nyata
terkumpul + baseline terukur.

---

### Fase 2 — Model domain & standar (4–6 minggu)

**Kerjakan:**
- Tulis skema Lapis 1, dipetakan ke AGROVOC / Crop Ontology / AgrO / ICASA /
  ADAPT. Terbitkan sebagai spesifikasi terbuka + JSON Schema + contoh.
- **ID stabil sejak hari pertama.** Setiap protokol, versi protokol, komoditas,
  varietas, bahan aktif, dan plot punya identifier permanen yang tidak pernah
  didaur ulang. Migrasi ID setelah ada mitra integrasi adalah mimpi buruk.
- Tetapkan skema **provenance** dan **tingkat bukti** (lihat Lapis 2).
- Rancang **lapis produk terpisah**: entitas `ActiveIngredient` / `Nutrient`
  (generik) versus `Product` (komersial). Produk hanya boleh ditautkan lewat
  **nomor pendaftaran resmi Kementan** (pestisida wajib terdaftar sesuai UU
  Sistem Budidaya Tanaman; pupuk punya izin edar berjangka). Rekomendasi selalu
  dihasilkan di level generik; produk muncul sebagai *pemenuhan* rekomendasi,
  bukan sebagai rekomendasi itu sendiri.
- Rancang model **consent & kepemilikan data** yang sesuai **UU 27/2022 (PDP)**:
  dasar pemrosesan, hak subjek data, retensi, pemrosesan oleh pihak ketiga.
  Data petani harus bisa diekspor dan dicabut.

**Gate:** spesifikasi v0.1 dipublikasikan + satu protokol nyata berhasil
diekspresikan penuh dalam skema itu tanpa "field catch-all".

---

### Fase 3 — Konten inti: satu komoditas, dalam (6–10 minggu)

**Pilih beachhead.** Kriterianya: (a) kepatuhan protokol terlihat langsung di
uang, (b) ada aktor rantai nilai yang mau bayar, (c) siklus cukup pendek untuk
iterasi. Ini menghasilkan trade-off yang nyata:

| Kandidat | Kelebihan | Kekurangan |
|---|---|---|
| **Cabai / bawang merah** | Siklus 90–120 hari → 3 musim belajar/tahun; input intensif; kerugian OPT besar; nyeri petani nyata | Pembayar tidak jelas; harga sangat volatil |
| **Kopi / kakao** | Ada uang: **EUDR berlaku 30 Des 2026** (operator besar-menengah; UMK 30 Juni 2027) menuntut ketertelusuran sampai titik geolokasi kebun | 1 siklus/tahun → loop belajar lambat |
| **Padi** | Skala terbesar, akses program pemerintah | Margin tipis, sangat tersubsidi, ramai pemain |

**Rekomendasi:** bangun mesinnya dengan **hortikultura siklus pendek**, karena
mesin protokol butuh banyak siklus untuk matang. Simpan **kopi/kakao sebagai
jalur pendapatan** di Fase 6 — permintaan ketertelusuran EUDR adalah salah satu
dari sedikit anggaran yang benar-benar cair di sektor ini sekarang.

**Kerjakan:**
- Susun 1 protokol referensi lengkap: pra-tanam sampai pascapanen, dengan
  cabang keputusan (varietas, musim hujan/kemarau, tingkat serangan OPT).
- Bentuk **dewan redaksi agronomi** — minimal 3 orang dengan nama dan afiliasi
  yang tercantum publik, plus aturan konflik kepentingan tertulis. Ini yang
  mengubah "database" jadi "protokol".
- Tulis **aturan netralitas vendor** dan publikasikan. Karena latar belakang
  proyek ini bersinggungan dengan produk input tertentu, netralitas tidak cukup
  dijanjikan — harus dibuat sebagai mekanisme: tidak ada penempatan berbayar di
  rekomendasi, pengungkapan pendanaan, dan setiap orang boleh mengajukan produk
  yang punya izin edar dengan syarat sama.

**Gate:** 1 protokol referensi lolos tinjauan 3 agronom independen + aturan
netralitas terbit.

---

### Fase 4 — Produk tipis & pilot tertutup (1 musim penuh)

**Kerjakan:**
- Bangun seminimal mungkin: rencana musim → kalender tugas → pencatatan realisasi
  → ringkasan biaya/hasil. Tidak ada fitur lain.
- **Offline-first dan low-bandwidth.** Asumsikan sinyal buruk dan HP entry-level.
  Antarmuka yang menang di lapangan Indonesia hampir selalu **WhatsApp**, bukan
  aplikasi terpisah — pertimbangkan WhatsApp sebagai kanal utama dan web app
  sebagai kanal penyuluh/koperasi.
- Pilot **1 kabupaten, 1 komoditas, 1 musim**, 50–150 petani, lewat penyuluh atau
  koperasi. Sertakan kelompok pembanding yang tidak pakai — tanpa pembanding,
  klaim dampak tidak akan dipercaya pembeli institusional mana pun.
- Ukur: kepatuhan protokol, biaya per hektar, kejadian gagal/kerugian panen,
  hasil, dan waktu yang dihemat penyuluh.

**Gate:** data satu musim penuh + minimal satu bukti kuantitatif penurunan biaya
atau kerugian. Kalau tidak ada, jangan tambah komoditas — perbaiki protokolnya.

---

### Fase 5 — Fondasi kelembagaan & hukum (paralel mulai Fase 3)

**Kerjakan:**
- **Struktur badan hukum.** Untuk sesuatu yang publik + vendor-neutral tapi harus
  berkelanjutan, pola yang lazim: yayasan/perkumpulan memegang standar, konten,
  dan merek; PT menjalankan layanan komersial di atasnya. Pemisahan ini yang
  menjaga kredibilitas netralitas saat pendapatan mulai masuk.
- **Kepatuhan PDP (UU 27/2022):** persetujuan berlapis, hak akses/koreksi/hapus,
  perjanjian pemrosesan data dengan mitra, kebijakan retensi. Data lokasi lahan
  adalah data sensitif secara komersial — perlakukan setara data pribadi.
- **Batas tanggung jawab advisori.** Rekomendasi pestisida dan pupuk punya
  konsekuensi hukum dan keselamatan. Aturan minimum: hanya bahan yang terdaftar,
  dosis dalam rentang label, PHI selalu ditampilkan, ada penafian yang jelas,
  dan jejak audit siapa mengubah protokol apa dan kapan.
- **Sikap terhadap ekosistem negara.** Pupuk bersubsidi kini diatur Perpres
  6/2025 dan Permentan 15/2025, dialokasikan lewat **e-RDKK** dan diverifikasi
  penyuluh lewat **SIMLUHTAN**. Pranatani tidak perlu menggantikan itu —
  tapi rencana musim yang keluar dari platform sebaiknya bisa dicetak dalam
  format yang cocok dengan alur RDKK. Itu jalan masuk paling murah ke penyuluh.

**Gate:** entitas berdiri, kebijakan privasi & netralitas terbit, penafian
advisori terpasang di produk.

---

### Fase 6 — Model pendapatan (mulai setelah Fase 4 punya bukti)

Petani bukan pembayar. Yang punya anggaran dan diuntungkan oleh kepatuhan
protokol:

1. **Eksportir & offtaker** — ketertelusuran plot, bukti praktik, kepatuhan EUDR
   (tenggat 30 Des 2026 / 30 Juni 2027). Ini permintaan berbatas waktu yang nyata.
2. **Principal input** — bukan untuk membeli rekomendasi, tapi untuk *bukti
   kinerja produk di lapangan* dan dukungan dossier registrasi. Dijual sebagai
   data hasil agregat & anonim, dengan aturan main terbuka.
3. **Lembaga keuangan & asuransi** — rencana musim terstruktur + riwayat
   kepatuhan adalah bahan penilaian kredit yang jauh lebih baik daripada agunan.
   Nilai kredit rantai nilai untuk petani kecil di Asia Tenggara, Afrika, dan
   Amerika Latin ditaksir >USD 32 miliar/tahun dan mayoritas datang dari offtaker
   — artinya pembelinya sudah ada.
4. **Sertifikasi** — IndoGAP/SNI 8969:2021 (sertifikat berlaku 3 tahun), organik,
   RA, dsb. Pencatatan yang rapi memangkas biaya audit.
5. **Pemerintah & koperasi** — **Kopdes Merah Putih** (±25.000 unit berdiri,
   target tambahan 35.000 pada 2026–2027) adalah jalur distribusi terbesar yang
   pernah ada untuk hal semacam ini. Berisiko secara politik, tapi terlalu besar
   untuk diabaikan.

**Aturan:** yang dijual adalah *layanan dan bukti*, bukan akses ke protokol.
Begitu protokol dibayar untuk dilihat, klaim "open" hilang dan dengan itu hilang
pula alasan orang menyumbang konten.

---

### Fase 7 — Skala ke agnostik

Baru di sini kata "agnostik" ditagih.

- Komoditas ke-2 dan ke-3 harus bisa masuk **tanpa mengubah skema**. Kalau perlu
  ubah skema, berarti Fase 2 belum selesai — kembali, jangan tambal.
- Buka **kontribusi eksternal**: penyuluh, universitas, koperasi, principal.
  Butuh alur usul → tinjau → terbit, dengan reviewer bernama.
- Terbitkan **API publik** dan ekspor data. Interoperabilitas adalah alasan
  keberadaan proyek ini; kalau datanya terkunci, ini cuma SaaS biasa.
- Pertimbangkan mendaftar ke **registry Digital Public Goods** — sinyal
  kredibilitas dan pintu pendanaan.

---

## 4. Konteks Indonesia yang wajib jadi batasan desain

Angka-angka ini bukan hiasan; masing-masing membunuh satu asumsi desain.

- **Sensus Pertanian 2023 (BPS):** ±28,4 juta rumah tangga usaha pertanian, naik
  8,74% dari 2013. Dari ±27,8 juta petani pengguna lahan, **±17,2 juta adalah
  petani gurem (<0,5 ha)**.
  → Desain harus jalan di lahan sangat kecil dan literasi digital rendah. Fitur
  ala "farm management untuk 50 ha" tidak relevan untuk mayoritas.
- **Subsektor tanaman pangan turun 12,28%** (17,7 → 15,5 juta rumah tangga).
  → Arus struktural menjauhi padi. Hortikultura dan perkebunan lebih hidup.
- **Pupuk bersubsidi** (Perpres 6/2025, Permentan 15/2025): 2026 Urea Rp2.250/kg,
  NPK Rp2.300/kg, organik Rp800/kg; maksimal 2 ha; wajib terdaftar SIMLUHTAN dan
  masuk e-RDKK (batas usul 15 September).
  → Rekomendasi dosis yang mengabaikan kuota dan harga subsidi akan diabaikan
  petani. Mesin protokol harus sadar-subsidi.
- **SNI 8969:2021 (IndoGAP tanaman pangan)** mencakup sumber daya, proses tanam,
  panen, pascapanen, sanitasi, dan kelas produk — sertifikasi berlaku 3 tahun.
  → Ini kerangka bawaan yang sebaiknya dipakai sebagai tulang punggung struktur
  protokol, bukan bikin taksonomi tandingan.
- **EUDR:** berlaku 30 Desember 2026 (operator besar & menengah), 30 Juni 2027
  (usaha mikro & kecil); butuh geolokasi plot + bukti bebas deforestasi + legalitas.
  → Jendela komersial paling konkret dalam 12 bulan ke depan.
- **UU 27/2022 tentang Pelindungan Data Pribadi** berlaku penuh.
  → Consent, hak subjek data, dan perjanjian pemrosesan bukan opsional.

---

## 5. Metrik: apa yang diukur sejak hari pertama

Ini penangkal langsung dari pelajaran eFishery/TaniHub.

**Metrik utara:** *jumlah plot-musim yang dijalankan dengan protokol dan tercatat
sampai panen* — bukan jumlah unduhan, bukan jumlah petani terdaftar, bukan GMV.

Pendukung:
- **Kepatuhan protokol** — % tugas terjadwal yang benar-benar dikerjakan tepat waktu
- **Delta biaya per hektar** vs baseline
- **Insiden kerugian panen** vs kelompok pembanding (ini nilai utamanya)
- **Tingkat bukti rata-rata** korpus protokol (naik dari D/C ke B/A dari waktu ke waktu)
- **Retensi musim ke musim** — satu-satunya metrik yang tidak bisa dipalsukan

Aturan: setiap angka yang dipublikasikan harus punya definisi tertulis dan bisa
ditelusuri ke catatan mentah. Tulis definisi itu sekarang, saat belum ada tekanan.

---

## 6. Risiko utama

| Risiko | Mitigasi |
|---|---|
| Dianggap corong produk input tertentu | Pemisahan badan hukum, aturan netralitas terbit, dewan redaksi bernama, pengungkapan pendanaan |
| Konten protokol dangkal → tidak dipercaya agronom | Satu komoditas dalam sebelum melebar; tingkat bukti eksplisit; reviewer bernama |
| Petani tidak pakai karena bukan dia pengambil keputusan | Fase 1 memetakan ini dulu; kemungkinan besar pengguna pertama adalah penyuluh/kios/koperasi |
| Rekomendasi salah → kerugian → tanggung jawab hukum | Batasi ke bahan terdaftar & rentang label; PHI wajib; penafian; jejak audit |
| Terjebak jadi pedagang input/hasil panen | Larangan tertulis di Fase 0: tidak memegang barang |
| Ketergantungan berlebihan pada program pemerintah | Pakai sebagai distribusi, jangan sebagai satu-satunya sumber pendapatan |
| Nama "Pranatani" bermasalah / tidak bisa dilindungi | Nama dipilih di Fase 0 (24 Agu 2026) justru karena distingtif, bukan deskriptif; penelusuran DJKI kelas 9/42/44 masih terbuka, dan sampai ia ditutup nama dipakai tanpa klaim perlindungan |

---

## 7. 30 / 60 / 90 hari

**Hari 1–30**
- Tulis satu halaman "apa ini / apa bukan"
- Uji nama (DJKI, domain, GitHub/npm) dan kunci lisensi kode/konten/data
- Susun daftar 30–60 responden Fase 1 dan mulai wawancara
- Kumpulkan korpus protokol yang ada (mulai dari SNI 8969:2021 dan terbitan BSIP)

**Hari 31–60**
- Selesaikan wawancara; terbitkan peta pengambil keputusan
- Draf skema Lapis 1 v0.1 + pemetaan ke AGROVOC/AgrO/ICASA/ADAPT
- Uji skema dengan memaksa 3 protokol nyata masuk ke dalamnya
- Putuskan komoditas beachhead berdasarkan data, bukan preferensi

**Hari 61–90**
- Bentuk dewan redaksi agronomi (3 nama + afiliasi)
- Selesaikan 1 protokol referensi lengkap dan lolos tinjauan
- Terbitkan spesifikasi v0.1 + aturan netralitas vendor secara publik
- Kunci mitra pilot (koperasi/penyuluh/offtaker) untuk musim berikutnya

---

## 8. Artefak terkait

- [`spec/`](../spec/) — Spesifikasi Lapis 1 (ontologi) v0.1: 16 skema, 15 contoh lintas komoditas
  (cabai, kopi, udang vaname), 9 aturan kebijakan yang ditegakkan pemeriksa, dan uji
  negatif yang membuktikan tiap aturan menyala. Ini keluaran Fase 2.

## 9. Sumber

- BPS — [Sensus Pertanian 2023](https://sensus.bps.go.id/main/index/st2023), [hasil pencacahan lengkap tahap I](https://www.bps.go.id/en/pressrelease/2023/12/04/2050/hasil-pencacahan-lengkap-sensus-pertanian-2023---tahap-i.html)
- BSIP — [penerapan SNI 8969:2021 IndoGAP](https://babel.bsip.pertanian.go.id/berita/penerapan-sni-89692021-sebagai-pengantar-gap-dan-ghp-tanaman-pangan)
- Ditjen PSP Kementan — [peraturan pupuk & pestisida](https://psp.pertanian.go.id/layanan-publik/peraturan-perundangan-terkait-pupuk-dan-pestisida)
- [UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022)
- [e-RDKK Kementan](https://erdkk25.pertanian.go.id/)
- Komisi Eropa — [implementasi EUDR](https://green-forum.ec.europa.eu/nature-and-biodiversity/deforestation-regulation-implementation_en)
- Linux Foundation — [AgStack](https://github.com/agstack), [Asset Registry & field boundaries](https://www.linuxfoundation.org/press/agstack-first-dataset-field-boundaries)
- AgGateway — [ADAPT Standard v1.0](https://adaptstandard.org/docs/)
- CGIAR — [Agronomy Ontology](https://bigdata.cgiar.org/resources/agronomy-ontology/), [AgroFIMS & data FAIR](https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2021.726646/full)
- [Digital Public Goods Standard](https://www.digitalpublicgoods.net/standard)
- Precision Development — [RCT layanan advisori digital, padi Odisha](https://precisiondev.org/wp-content/uploads/2025/02/Odisha_RCT_02052025.pdf); J-PAL — [phone-based agricultural information](https://www.povertyactionlab.org/case-study/phone-based-technology-agricultural-information-delivery)
- ISF Advisors — [lanskap pembiayaan rantai nilai petani kecil](https://isfadvisors.co/understanding-the-value-chain-finance-landscape-for-smallholder-farmers/)
- [OpenTEAM](https://openteam.community/), [LiteFarm](https://www.litefarm.org/), [farmOS](https://farmos.org/community/press/) — preseden open source manajemen usaha tani
- MSC — [AgriStack sebagai DPI pertanian India](https://www.microsave.net/2025/11/12/agristack-a-dpi-approach-to-transform-indian-agriculture/)
- Analisis kasus [eFishery](https://ravmedia.id/profil-efishery-lessons-learned/) dan [TaniHub](https://www.kompasiana.com/taufikuieks/679f4db534777c4837135543/bisnis-start-up-janji-manis-realita-pahit-dalam-kasus-tani-hub)
