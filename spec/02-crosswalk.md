# Crosswalk — pemetaan ke standar yang sudah ada

Open Protocols tidak membuat kosakata baru kalau sudah ada yang bisa dipakai.
Aturan `L9` menegakkan ini: setiap entitas terkurasi wajib punya minimal satu
pemetaan luar, atau `no_mapping_reason` tertulis yang menjelaskan mengapa tidak ada.

---

## Semantik relasi

Memakai semantik SKOS supaya kaitan yang tidak persis tetap jujur:

| Relasi | Artinya |
|---|---|
| `exact` | Konsepnya sama persis, bisa saling tukar |
| `close` | Sangat berdekatan, aman untuk penelusuran, tidak aman untuk inferensi |
| `broad` | Konsep luar lebih luas |
| `narrow` | Konsep luar lebih sempit |
| `related` | Berkaitan tanpa hubungan hierarkis |

Klaim `exact` yang tidak benar lebih merusak daripada tidak memetakan sama sekali,
karena ia diam-diam merusak agregasi data lintas sumber.

---

## Peta per entitas

| Entitas Open Protocols | Standar tujuan | Bentuk pengenal | Catatan |
|---|---|---|---|
| `Commodity` | **AGROVOC** | `c_12332` → `http://aims.fao.org/aos/agrovoc/c_12332` | Konsep SKOS, tersedia sampai 39 bahasa. Format URI terverifikasi |
| `Commodity` | **NCBITaxon** | `4072` | Untuk kepastian spesies |
| `Variety` | **Crop Ontology** | ID germplasm | Belum diverifikasi per komoditas |
| `Variety` | **KEMENTAN** | Nomor SK pelepasan varietas | Otoritas lokal, bukan kosakata global |
| `StageScale` / `Stage` | **BBCH** | Kode `00`–`99`, fase utama `0`–`9` | Skala fenologi lintas komoditas |
| `Substance` (hara) | **ICASA** | Nama variabel, mis. `FEN` | Daftar variabel induk ICASA |
| `Substance` (bahan aktif) | **CHEBI**, nomor CAS | `CHEBI:xxxxx`, `1912-24-9` | |
| `Substance` (cara kerja) | **FRAC / IRAC / HRAC** | Kode golongan | Dasar aturan rotasi anti-resistensi |
| `Product` | **KEMENTAN** | Nomor pendaftaran / izin edar | **Wajib.** Tanpa ini produk tidak boleh terbit |
| `OperationType` | **AgrO** | CURIE `AGRO:00020007` (`^AGRO:\d{8}$`) | AgrO dibangun di atas variabel ICASA dan BFO. Format terverifikasi |
| `OperationType` | **ADAPT** | Jenis Operation | Untuk tukar-menukar data mesin |
| `Variable` | **ICASA** | Nama variabel | Padanan langsung konsep "variable" |
| `Variable` | **Crop Ontology** | ID trait | Untuk sifat tanaman |
| `Pest` | **EPPO** | Kode EPPO, mis. `SPODLI` | Pengenal OPT yang paling luas dipakai |
| `Pest` | **AGROVOC** | `c_xxxxx` | Untuk penelusuran multibahasa |
| `Plot` | **AgStack** | GeoID dari Asset Registry | Identitas deterministik dari geometri |
| `Plot` | **ADAPT** | `Field` / `CropZone` | Padanan konsep terdekat |
| `Region` | **BPS / Kemendagri** | Kode wilayah | |
| Satuan | **UCUM** | `kg/har`, `mL/L`, `%` | Tidak ada registry satuan sendiri |
| Geometri | **GeoJSON RFC 7946** | Selalu WGS84 | ADAPT memakai WKT EPSG:4326 — konversi saat ekspor |
| Sertifikasi | **SNI 8969:2021** | IndoGAP | Dirujuk lewat `Cycle.system.certification_target` |

> **Status verifikasi.** Format pengenal (pola URI AGROVOC, pola CURIE AgrO, aturan
> ADAPT) sudah dicek ke sumbernya. **Nomor konsep spesifik di dalam `examples/`
> belum.** Semuanya ditandai `PERLU VERIFIKASI` di field `note` dan dilaporkan
> sebagai peringatan oleh pemeriksa. Tidak boleh naik ke `published` sebelum dicek
> satu per satu.

---

## Konvensi yang diambil dari ADAPT

Empat aturan ADAPT diadopsi apa adanya, karena sudah teruji di pertukaran data
mesin pertanian dan tidak ada gunanya berbeda:

1. **Komposisi produk dinyatakan sebagai massa/volume per massa/volume** — bukan
   persentase, bukan dosis per satuan luas. Ditegakkan di
   `product.schema.json#/properties/composition`.
2. **Semua tanggal dan waktu dalam ISO 8601.** Waktu kejadian memakai UTC.
3. **Geometri selalu WGS84 (EPSG:4326).**
4. **Satu tindakan, satu catatan.** Sekali jalan yang menggabungkan dua pekerjaan
   (mis. tanam sekaligus aplikasi) dicatat sebagai dua `Step`, bukan satu.

---

## Yang sengaja berbeda dari ADAPT

| Hal | ADAPT | Open Protocols | Alasan |
|---|---|---|---|
| Hierarki | Grower → Farm → Field → CropZone | Actor → Plot → Cycle | Empat tingkat kepemilikan tidak cocok untuk petani gurem 0,28 ha. Struktur lahan Indonesia jarang punya "Farm" sebagai lapis nyata |
| Cakupan sektor | Tanaman, berorientasi mesin | Tanaman, ternak, perikanan budidaya | Beachhead hortikultura, tetapi tambak dan kandang harus muat sejak awal |
| Rencana | Tidak dimodelkan | `Step.mode = planned` | Nilai utama platform ada di perbandingan rencana-realisasi |
| Dasar dosis | Umumnya per satuan luas | `Rate.basis` dengan 9 pilihan | Pakan udang tidak bisa dinyatakan per hektar |

---

## Cakupan nyata per 19 Agustus 2026

Angka dari `npm run check`, bukan perkiraan.

| Jenis | Entitas | Termapping | Perlu verifikasi |
|---|---:|---:|---:|
| `product` | 14.923 | 14.920 (100%) | 0 |
| `substance` | 1.600 | 1.598 (100%) | 1 |
| `operation-type` | 61 | 28 (46%) | 0 |
| `variable` | 46 | 15 (33%) | 0 |
| `method` | 19 | 9 (47%) | 0 |
| `deviation-reason` | 11 | 0 | 0 |
| `pest` | 10 | 10 (100%) | 10 |
| `commodity` | 5 | 5 (100%) | 5 |
| `stage-scale` | 2 | 1 (50%) | 0 |
| **Total** | **16.677** | **16.586 (99%)** | **16** |

Skema tujuan yang benar-benar terpakai: KEMENTAN (16.513 kaitan), AgrO (38), ICASA (33),
EPPO (10), NCBITaxon (5), BBCH (2), CHEBI (1), SNI (1). Di luar `mappings`, 58 bahan aktif
membawa kode cara kerja IRAC, FRAC, atau HRAC pada `mode_of_action`.


**Registri nasional adalah kosakata yang sah.** Untuk bahan aktif pestisida, otoritas
identitas bukan AGROVOC atau CHEBI melainkan daftar terdaftar Kementan — itulah yang
menentukan apa yang boleh beredar. Karena itu relasi `exact` ke skema `KEMENTAN` bukan
jalan pintas: ia menunjuk ke sumber kebenaran yang sebenarnya, dan bisa diverifikasi
ulang kapan saja.

**Angka 99% itu menyesatkan kalau dibaca mentah.** Ia tinggi karena didominasi 16.513
kaitan ke registri Kementan, yang memang identitas resmi produk dan bahan aktif. Untuk
kosakata agronomi — `operation-type`, `variable`, `method` — cakupannya masih 33–47%, dan
di situlah pekerjaan sesungguhnya.

**Kenapa kosakata agronomi baru 33–47%.** Kosakata agronomi global dibangun terutama dari
pertanian beriklim sedang dan berorientasi mesin. Banyak tindakan hortikultura tropis
yang justru menentukan hasil — pengajiran, perempelan tunas air, pembumbunan, kocor,
tugal, penyulaman — tidak punya padanan di AgrO maupun ICASA. Begitu pula variabel
pengamatan OPT berbasis ambang yang jadi tulang punggung PHT di Indonesia.

Ini temuan, bukan kegagalan. Kalau porsi `no_mapping_reason` tetap tinggi setelah
penelusuran ulang, itu justru bahan kontribusi balik ke AgrO — dan alasan yang bagus
bagi proyek ini untuk hadir di forum kosakata agronomi, bukan sekadar memakainya.

## Cara menambah pemetaan

1. Cari dulu di AGROVOC, AgrO, Crop Ontology, ICASA, dan EPPO — dengan sungguh-sungguh.
2. Kalau ketemu, isi `mappings` dengan relasi yang jujur.
3. Kalau tidak ketemu, isi `no_mapping_reason` minimal 10 karakter yang menjelaskan
   pencarian yang sudah dilakukan. Contoh nyata ada di
   `examples/vocab-scale-doc-udang.json` — memang tidak ada skala fase baku untuk
   udang vaname, dan itu dinyatakan terbuka beserta syarat peninjauan ulangnya.
4. Jangan pernah membiarkan keduanya kosong. Pemeriksa akan menolaknya.
