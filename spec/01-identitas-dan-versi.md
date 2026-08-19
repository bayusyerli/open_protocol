# Identitas, versi, dan status

Bagian tersulit untuk diubah belakangan. Semua di sini bersifat mengikat sejak v0.1.

---

## 1. Dua jenis ID, dua alasan berbeda

### Kosakata terkurasi — nomor 8 digit

```
op:cmd:00000012        # Cabai merah besar
op:sed:00000001        # Kompos kotoran sapi, proses termofilik
op:sub:00000001        # Nitrogen (N)
op:stg:00000051        # BBCH 51 — kuncup bunga pertama tampak
```

Pola: `^op:(cmd|vty|var|sca|stg|sub|prd|sed|opt|met|pst|rgn|dev):[0-9]{8}$`

Diberikan sekali oleh dewan redaksi, berurutan, **tidak pernah didaur ulang**.
Nomor sengaja tidak bermakna: begitu ID bisa dibaca isinya, orang akan
menyimpulkan sesuatu darinya, dan perubahan isi jadi tidak mungkin.

Setiap entitas juga punya **`key`** — slug ASCII yang stabil (`cabai-merah-besar`)
untuk URL, API, dan pembacaan manusia. `key` unik **di dalam jenis entitasnya** — bukan
lintas jenis — dan tidak boleh dipakai ulang setelah terbit. Daun tembakau sah menjadi
komoditas sekaligus bahan nabati untuk sediaan; memaksa slug-nya unik secara global akan
menolak fakta yang benar. Kalau nama berubah, `key` lama ditandai usang dan diarahkan ke yang
baru — tidak pernah dipindahtangankan ke entitas lain.

### Data usaha tani — UUIDv7

```
op:plt:019e80e8-c900-79c9-ac35-7cced06151d9
op:bat:019e8300-1200-7a41-9c22-6b1f0d4e7a01
op:stp:019e8232-6000-705d-b41c-424e305f3ff7
```

Pola: `^op:(act|plt|cyc|stp|obs|bat):[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`

**UUIDv7, bukan v4 dan bukan nomor urut dari server.** Dua alasan yang keduanya
mengikat:

1. **Offline.** Sinyal di lahan tidak bisa diandalkan. Aplikasi harus bisa membuat
   ID yang sah tanpa menghubungi server, lalu menyinkronkannya belakangan tanpa
   tabrakan. Nomor urut dari server mustahil memenuhi ini.
2. **Terurut menurut waktu.** 48 bit pertama UUIDv7 adalah stempel waktu Unix
   dalam milidetik, jadi ID terurut sesuai urutan pembuatannya. Ini membuat indeks
   basis data tetap sehat dan urutan kejadian tetap masuk akal walau jam perangkat
   agak melenceng.

Skema menolak UUIDv4 — lihat `fixtures-invalid/schema-uuid-v4.json`. Penolakan ini
disengaja: sekali data v4 masuk, jaminan urutan hilang selamanya.

### Alokasi blok nomor

Nomor terkurasi diberikan berurutan, tetapi **per blok menurut asal-usulnya** — bukan satu
antrean tunggal:

| Blok | Isi |
|---|---|
| `1`–`999` | Kosakata inti yang dikurasi tangan |
| `100`–`4999` | Turunan registri pestisida terdaftar Kementan |
| `5001`–`5999` | Turunan Permentan 43/2019 — bahan dilarang yang tidak ada di registri |

Alasannya bukan kerapian. Nomor berurutan dari satu antrean tunggal mensyaratkan satu
penulis; begitu ada dua pihak menambah entitas pada saat yang sama, keduanya menghitung
`max + 1` dari keadaan yang sudah usang dan memberikan nomor yang sama ke entitas berbeda.
Itu benar-benar terjadi di repositori ini pada 19 Agustus 2026 dan tertangkap aturan `L1`.

Blok terpisah per sumber membuat penambahan paralel aman tanpa koordinasi. Setiap penulis
baru mengambil bloknya sendiri dan mencatatnya di tabel ini.

### Rujukan antar-entitas

```json
{ "id": "op:sub:00000001", "label": "Nitrogen (N)" }
```

`label` ikut disalin supaya berkas tetap terbaca manusia saat ditinjau. **`label`
bukan sumber kebenaran** dan tidak boleh dipakai untuk mencocokkan apa pun —
hanya `id` yang mengikat.

---

## 2. Identitas geospasial

`Plot` punya UUID sendiri **dan** daftar `geoids` — identitas deterministik dari
pihak luar, mis. GeoID AgStack yang dihitung dari geometri.

Keduanya dibutuhkan karena berbeda sifat:

- **UUID plot** tetap sama sepanjang hidup petak itu, walau batasnya direvisi.
- **GeoID** berubah ketika geometri berubah, dan justru itu gunanya: dua sistem
  berbeda yang memetakan lahan yang sama akan menghasilkan GeoID yang sama, tanpa
  perlu saling bertukar basis data.

`geometry_quality` wajib menyatakan mutu geometri secara jujur:
`surveyed_polygon`, `walked_polygon`, `drawn_polygon`, `single_point`, `unknown`.
EUDR menuntut poligon; titik tunggal harus tetap terlihat sebagai titik tunggal
dan tidak boleh disamarkan jadi poligon perkiraan.

---

## 3. Versi

`Lifecycle` menempel pada setiap entitas terkurasi:

```json
{
  "version": "1.2.0",
  "status": "published",
  "reviewed_at": "2026-08-19",
  "review_due": "2027-08-19",
  "content_hash": "sha256:..."
}
```

**Semver, dengan arti yang disepakati untuk konten agronomi:**

| Naik | Artinya |
|---|---|
| **MAYOR** | Perubahan yang bisa mengubah keputusan di lapangan — dosis, bahan, ambang, cakupan berlaku |
| **MINOR** | Tambahan yang tidak membatalkan yang lama — langkah opsional baru, terjemahan, penajaman definisi |
| **PATCH** | Perbaikan salah ketik, sumber, atau metadata. Tidak menyentuh isi anjuran |

Aturan praktisnya: **kalau seorang petani yang mengikuti versi lama bisa dirugikan
karena tidak tahu perubahannya, itu MAYOR.**

**`content_hash`** wajib untuk apa pun berstatus `published` (aturan `L2`). Hash
SHA-256 dari JSON terkanonikalisasi. `Cycle.protocol_ref` menyimpan hash ini,
sehingga perbandingan rencana-realisasi tetap sahih walau protokolnya direvisi
di tengah musim.

**Status:** `draft` → `review` → `published` → `deprecated` | `superseded`.
Tidak ada penghapusan. Entitas yang salah ditandai `deprecated` dengan
`superseded_by`, karena mungkin sudah ada data musim lalu yang menunjuk ke sana.

---

## 4. Tingkat bukti

Melekat pada protokol (Lapis 2), tetapi didefinisikan di sini karena dipakai
seluruh sistem.

| Tingkat | Dasar |
|---|---|
| **A** | Uji multi-lokasi dan multi-musim |
| **B** | Standar institusi resmi — SNI, BSIP, Balai Penelitian |
| **C** | Konsensus praktisi dan penyuluh |
| **D** | Pengalaman tunggal, belum terverifikasi |

Tingkat bukti **wajib ditampilkan ke pengguna**, bukan disimpan diam-diam sebagai
metadata. Petani berhak tahu apakah anjuran yang ia baca berasal dari uji lapangan
bertahun-tahun atau dari satu orang yang pernah mencoba.

Data Lapis 3 adalah jalan naik dari D ke A — dan satu-satunya jalan yang jujur
tanpa punya kebun percobaan sendiri.

---

## 5. Lisensi

| Bagian | Lisensi |
|---|---|
| Skema dan kode pemeriksa | Apache-2.0 |
| Kosakata dan protokol terkurasi | CC-BY-SA-4.0 |
| Data usaha tani | **Milik petani.** Platform hanya pemroses, bukan pemilik |

`Provenance.license` memakai pengenal SPDX. `Provenance.sources[].license` mencatat
lisensi bahan asal — penting karena sebagian konten diturunkan dari terbitan
pemerintah yang ketentuan pemakaian ulangnya perlu dipastikan satu per satu.

`Contributor.conflict_of_interest` wajib diisi bila kontributor punya kepentingan
komersial pada produk terkait. `"none"` bila memang tidak ada. Kosong bukan pilihan.
