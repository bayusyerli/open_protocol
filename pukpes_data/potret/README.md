# Potret berkala registri PUKPES

Registri pestisida Kementan **membuang rekaman yang kedaluwarsa.** Begitu sebuah izin lewat
tanggalnya, ia hilang dari portal dan tidak ada cara mengambilnya kembali. Per 23 Agustus
2026 tidak ada satu pun rekaman kedaluwarsa yang masih tampil — yang paling awal berakhir
12 Oktober 2026, masih di depan. **148 produk berakhir dalam tiga bulan ke depan dan 584
dalam dua belas bulan.** Semuanya akan lenyap dari sumbernya.

Direktori ini ada supaya mereka tidak lenyap dari sini. Ini bukan pekerjaan mengumpulkan
data baru — seluruh datanya sudah mengalir tiap kali endpoint dipanggil. Yang membuatnya
bernilai cuma melakukannya berulang dan tidak pernah menghapus apa pun.

---

## Aturan yang tidak bisa ditawar

**`pukpes_data/raw/*.json` tidak pernah ditulisi.** Berkas itu potret 19 Agustus 2026 dalam
bentuk aslinya. Ia sudah diserap ke sini sebagai potret pertama; sumbernya dibiarkan utuh
sebagai jejak. Alat di repositori ini hanya membacanya.

**Arsip mentah tidak pernah ditimpa.** `potret-pukpes.mjs` menolak menulis ke tanggal yang
berkasnya sudah ada, dan menolak mencatat tanggal yang sudah ada di manifes.

---

## Keadaan pohon kerja saat ini — baca sebelum meng-commit

Arsip mentah sudah memuat **dua** potret: 19 dan 23 Agustus 2026. Lapis kanonik sengaja
dibiarkan memuat **yang 19 Agustus**, bukan yang terbaru, dan urutan commit-nya penting.

Kalau potret 23 Agustus yang di-commit lebih dulu, ia jadi titik awal riwayat dan perpindahan
19 → 23 tidak pernah muncul di `git log` sama sekali. Dua commit, berurutan:

```bash
# 1 — potret pertama masuk riwayat lebih dulu. Inilah yang tak tergantikan.
git add pukpes_data/potret pukpes_data/README.md pukpes_data/potret-pukpes.mjs
git commit -m "potret PUKPES 2026-08-19 (potret pertama)"

# 2 — lalu potret kedua, dan diff-nya jadi entri riwayat pertama
node pukpes_data/potret-pukpes.mjs --kanonikkan 2026-08-23
git add pukpes_data/potret/kanonik
git commit -m "potret PUKPES 2026-08-23"
```

Sesudah itu `git log -p pukpes_data/potret/kanonik/pestisida.ndjson` memperlihatkan 94
rekaman pestisida yang berubah, dan `pupuk-simpel.ndjson` memperlihatkan 3 produk baru
dan 12 yang berubah.

Kalau langkah 2 telanjur terlewat, tidak ada yang hilang — `--kanonikkan` membangun ulang
lapis kanonik potret mana pun dari arsip mentah, kapan saja.

---

## Dua lapis

| Lapis | Bentuk | Nasib |
|---|---|---|
| `mentah/<tanggal>/*.json.gz` | respons apa adanya, terkompresi | disimpan, tidak di-diff — jaring pengaman kalau kanonikalisatornya cacat |
| `kanonik/*.ndjson` | terurut, medan baku, jalur tetap | inilah yang berubah antarpotret dan jadi riwayatnya |

Lapis kanonik **selalu bisa dibangun ulang** dari lapis mentah lewat `--kanonikkan`. Yang
tidak tergantikan hanya yang mentah. Itu sebabnya lapis mentah bertanggal dan menumpuk,
sementara lapis kanonik duduk di satu jalur tetap.

### Kenapa jalur tetap

Kalau tiap potret dikanonikalisasi lalu diurutkan berdasarkan kunci yang stabil sebelum
disimpan ke **jalur yang sama**, `git log -p kanonik/pestisida.ndjson` sudah menjadi riwayat
perubahan — gratis, bisa ditinjau, bisa di-blame per baris. Tidak perlu ada perkakas diff
sendiri; `git diff` adalah perkakasnya.

Yang merusaknya cuma satu: urutan rekaman dari server yang berubah-ubah. Dan itu memang
terjadi. Antara 19 dan 23 Agustus server mengembalikan **5.518 dari 5.875 baris pupuk pada
posisi yang berbeda** sementara isinya sama. Tanpa pengurutan, diff pertama akan berbunyi
5.518 baris; dengan pengurutan menurut `id`, ia berbunyi 15 baris. Pengurutan bukan
kerapian, ia syarat supaya lapis ini punya arti.

```
                        pupuk-simpel, 19 -> 23 Agustus
  tanpa pengurutan   ############################################  ~5.518 baris
  dengan pengurutan  #                                                 15 baris
```

---

## Kunci identitas

| Sumber | Kunci | Dasar |
|---|---|---|
| `pestisida` | `id` (GUID) | bertahan 100% antarpotret |
| `pupuk-simpel` | `id` (GUID) | bertahan 100% antarpotret |
| `pupuk-legacy` | `no` (posisional) | tidak ada identitas per rekaman; basis beku |

Pilihan ini hasil percobaan, bukan tebakan. `id` berupa GUID, dan kalau portal
membangkitkannya ulang tiap render, seluruh rancangan diff runtuh — tiap potret akan tampak
seolah 7.724 rekaman mati dan 7.724 lahir. Himpunan `id` potret 19 dan 23 Agustus
dibandingkan lebih dulu:

```
pestisida     7.715 unik di kedua potret, irisan 7.715   — 0 hilang, 0 baru
pupuk-simpel  5.875 -> 5.878, irisan 5.875               — 0 hilang, 3 baru
```

**`id` stabil.** Ia kunci identitas yang sempurna.

Kunci cadangan `nomorPendaftaran` sebaliknya **terbukti gagal dalam percobaan yang sama**:
pupuk AgrindoPhos berpindah dari `01.01.2026.551` ke `01.01.2026.615` sementara `id`-nya
tidak bergerak. Nomor pendaftaran berubah saat perpanjangan; kalau ia dipakai sebagai
identitas, satu perpanjangan akan terbaca sebagai satu produk mati dan satu produk lahir.
Ia bukan identitas, ia atribut — dan perubahannya justru salah satu hal yang layak direkam.

Basis lama SIMPUK 2020 tidak punya identitas per rekaman sama sekali, hanya `no` yang
posisional. Ia dipakai apa adanya karena basis itu terbukti beku: seluruh 1.321 barisnya
identik bita per bita antara kedua potret (sha256 mentahnya sama persis). Kalau server
pernah mengurutkannya ulang, diff-nya akan ramai — dan keramaian itu sendiri yang jadi
sinyalnya.

---

## Apa yang dilakukan kanonikalisator

Dua hal, dan sengaja tidak lebih:

1. **Urutan medan dibakukan** menurut titik kode, jadi medan baru pun tertampung sendirinya.
2. **Urutan rekaman dibakukan** menurut kunci identitas.

Isi medan **tidak disentuh** — termasuk `bahanAktif` dan `Komoditas` yang berupa JSON
terbungkus string. Menguraikan dan merapikannya akan membuat berkas ini lebih enak dibaca,
tetapi juga akan diam-diam menghapus bukti. Pada 23 Agustus 2026, 67 rekaman pestisida
mendapat elemen bahan aktif yang terduplikasi persis dan 16 mendapat varian ejaan
berkapitalisasi beda. Itu keadaan sungguhan di basis data sumber, dan pada NDJSON satu
rekaman tetap satu baris, jadi menguraikannya pun tidak membuat diff-nya lebih halus. Lapis
ini merekam, tidak membersihkan. Kalau kelak diputuskan untuk menguraikannya, lapis mentah
membuat keputusan itu bisa diterapkan surut ke seluruh potret.

### Kembar: satu-satunya yang dibuang, dan tidak pernah diam-diam

Endpoint pestisida menggandakan baris. Delapan `id` dikembalikan lebih dari sekali (satu
tiga kali, tujuh dua kali) sehingga 7.724 baris hanya memuat 7.715 `id` unik. Penggandaan
itu menetap: delapan `id` yang sama persis muncul di potret 19 maupun 23 Agustus, jadi ini
perilaku endpoint, bukan kedip sesaat.

Kanonikalisator memeriksa **isi**, bukan sekadar kuncinya:

| Kembarnya | Yang terjadi |
|---|---|
| identik seluruhnya | salinannya dibuang, **cacahnya dicatat di manifes tiap potret** |
| isinya berbeda | **berhenti dengan galat**, menyebut tiap `id` yang bertabrakan; tidak ada yang ditulis |

Kalau dua produk berlainan memakai satu `id`, memilih salah satunya berarti **menghapus
rekaman yang berbeda dari arsip untuk selamanya** — kegagalan terburuk yang mungkin untuk
sistem ini. Karena itu ia berhenti, bukan memilih yang pertama. Aturan itu tertanam di kode
dan tidak bersandar pada kenyataan hari ini bahwa kesembilan-sembilannya kebetulan identik.

Saat berhenti, **arsip mentah potret itu sudah lengkap tersimpan untuk ketiga sumber** —
pengarsipan mentah sengaja dituntaskan lebih dulu sebelum kanonikalisasi dimulai, supaya
bukti tabrakannya selalu terekam. Yang tidak ditulis cuma lapis kanonik dan manifesnya.

Di berkas yang tugasnya justru menjadi arsip yang tidak pernah membuang, pembuangan senyap
adalah sifat yang salah meskipun pembuangannya benar. Karena itu cacahnya selalu keluar —
juga ketika nol, seperti pada pupuk-simpel dan legacy.

---

## Manifes

`manifes.ndjson` bertambah satu baris per (potret, sumber) dan tidak pernah disunting.

Tiga cacah ini **selalu ditulis, juga ketika nol** — angka yang menghilang ketika nol adalah
angka yang tidak bisa dipercaya:

| Medan | Arti |
|---|---|
| `rekaman_mentah` | baris yang dikembalikan endpoint |
| `kunci_unik` | `id` (atau `no`) unik di antaranya — sama dengan jumlah baris NDJSON |
| `duplikat_dibuang` | baris kembar identik yang dibuang |

`rekaman_mentah − duplikat_dibuang = kunci_unik` selalu berlaku, jadi selisihnya bisa
diperiksa sekilas dan tidak pernah lagi jadi teka-teki. Karena angkanya ada di tiap potret
dan bukan sekali di README, kalau jumlah kembarnya kelak berubah, perubahan itu ikut
terlihat di riwayat git.

Sisanya: tanggal, endpoint, `kunci_identitas`, `records_total` menurut server,
**sha256 respons mentah**, dan ukuran sebelum/sesudah kompresi.

sha256 itu yang membuat "tidak ada yang berubah" bisa dibedakan dari "pengambilannya gagal
diam-diam". Sha legacy 19 dan 23 Agustus sama persis — itu bukti positif basisnya beku,
bukan dugaan.

---

## Cara pakai

```bash
# Potret baru dari portal. Sekali jalan, berurutan, jeda 1,5 detik antarhalaman.
node pukpes_data/potret-pukpes.mjs --ambil

# Bangun ulang lapis kanonik dari potret mentah yang sudah diarsipkan.
node pukpes_data/potret-pukpes.mjs --kanonikkan 2026-08-23

# Serap berkas mentah yang sudah ada sebagai potret bertanggal.
node pukpes_data/potret-pukpes.mjs --serap 2026-08-19 a.json b.json c.json
```

Tanpa argumen tanggal, `--ambil` memakai tanggal hari ini.

### Alur satu potret

```bash
node pukpes_data/potret-pukpes.mjs --ambil
git diff --stat pukpes_data/potret/kanonik/     # apa yang berubah sejak potret lalu
git add pukpes_data/potret
git commit -m "potret PUKPES $(date +%F)"
```

Sesudah itu `git log -p pukpes_data/potret/kanonik/pestisida.ndjson` adalah riwayat
perubahan registri, dan `git log --follow` pada satu baris memberi tahu kapan produk itu
berubah dan bagaimana.

### Sopan santun

Skrip mengambil **sekali jalan, berurutan**, dengan jeda 1,5 detik antarhalaman dan 1,5
detik antarsumber — sembilan permintaan seluruhnya untuk satu potret penuh: satu untuk
membentuk sesi tamu, delapan untuk datanya. Jangan
memparalelkannya dan jangan mengulang pengambilan sambil mengutak-atik pengurai: ambil
sekali, simpan ke berkas, lalu iterasi dari berkas itu secara luring. Endpoint bersifat
publik dan tidak butuh kredensial, tetapi ini data milik lembaga negara.

---

## Irama yang disarankan

**Pestisida dan pupuk berperilaku berbeda, dan anggaran ketelitiannya sebaiknya ikut beda.**

Pupuk **tidak** membuang rekaman kedaluwarsa: 647 dari 5.878 rekaman sudah lewat masa
berlakunya dan tetap tampil, yang tertua berakhir 17 bulan lalu (2025-03-17). Pestisida
membuangnya: nol rekaman kedaluwarsa, yang paling awal berakhir masih 7 minggu di depan.

| Sumber | Perilaku kedaluwarsa | Risiko kehilangan | Irama |
|---|---|---|---|
| `pestisida` | dibuang saat lewat tanggal | **tinggi** — 148 berakhir dalam 3 bulan | dua mingguan atau lebih rapat |
| `pupuk-simpel` | disimpan (sejauh teramati) | rendah | bulanan cukup |
| `pupuk-legacy` | beku, tidak bergerak sama sekali | nihil | ikut saja, ongkosnya 50 KB |

Ketiganya diambil sekaligus karena ongkos satu potret penuh cuma sembilan permintaan;
memisahkan iramanya menambah rumit tanpa menghemat apa pun yang berarti.

**Catatan yang belum tuntas:** bahwa pupuk menyimpan rekaman kedaluwarsa sudah pasti, tetapi
apakah ia menyimpan *selamanya* belum terjawab. Tidak ada rekaman pupuk yang berakhir
sebelum Maret 2025 — itu bisa berarti ada jendela retensi sekitar 18 bulan, atau sekadar
berarti integrasi SIMPEL memang baru dimulai saat itu. Satu jendela empat hari tidak bisa
membedakannya. Yang bisa membedakannya cuma potret yang terus berjalan; kalau suatu saat
jumlah rekaman berakhir-2025 mulai menyusut, jawabannya retensi.

---

## Menjadwalkan

**Belum ada penjadwal yang terpasang, dan pemasangannya sengaja diserahkan ke pemilik
repositori.** Memasang konfigurasi yang berjalan terus-menerus adalah keputusan penggunanya.
Yang berikut ini dokumentasi, bukan pemasangan.

Skripnya sudah dibuat supaya bisa dijadwalkan: ia idempoten per tanggal (menolak menimpa),
keluar dengan kode bukan-nol saat gagal, dan tidak butuh masukan interaktif.

Perlu diingat penjadwal hanya menghasilkan **berkas di pohon kerja** — ia tidak meng-commit.
Riwayat git baru terbentuk saat seseorang meng-commitnya. Kalau memang diinginkan otomatis
penuh, tambahkan `git add`/`git commit` di pembungkusnya, dengan sadar bahwa itu berarti
commit tanpa peninjauan.

### launchd (macOS)

Simpan sebagai `~/Library/LaunchAgents/id.openprotocol.potret-pukpes.plist`, lalu
`launchctl load` berkas itu. Contoh: tiap Senin pukul 06.00.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>id.openprotocol.potret-pukpes</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/Users/NAMA/open_protocol/pukpes_data/potret-pukpes.mjs</string>
    <string>--ambil</string>
  </array>
  <key>WorkingDirectory</key><string>/Users/NAMA/open_protocol</string>
  <key>StartCalendarInterval</key>
  <dict><key>Weekday</key><integer>1</integer><key>Hour</key><integer>6</integer></dict>
  <key>StandardOutPath</key><string>/tmp/potret-pukpes.log</string>
  <key>StandardErrorPath</key><string>/tmp/potret-pukpes.err</string>
</dict>
</plist>
```

### cron

```cron
0 6 * * 1 cd /Users/NAMA/open_protocol && /usr/local/bin/node pukpes_data/potret-pukpes.mjs --ambil >> /tmp/potret-pukpes.log 2>&1
```

### GitHub Actions

Perhatikan bahwa runner GitHub mengambil dari alamat IP milik Microsoft, bukan dari mesin
sendiri — pertimbangkan apakah itu pantas untuk portal lembaga negara sebelum memakainya.

```yaml
on:
  schedule: [{ cron: '0 23 * * 0' }]   # Senin 06.00 WIB
  workflow_dispatch:
jobs:
  potret:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: node pukpes_data/potret-pukpes.mjs --ambil
      - run: |
          git config user.name  'potret-pukpes'
          git config user.email 'potret-pukpes@users.noreply.github.com'
          git add pukpes_data/potret
          git diff --cached --quiet || git commit -m "potret PUKPES $(date +%F)"
          git push
```

---

## Ongkos penyimpanan

Angka nyata dari dua potret pertama:

| | per potret |
|---|---|
| respons mentah, belum dikompresi | 15,7 MB |
| **`mentah/`, terkompresi (gz -9)** | **1,90 MB** — menumpuk tiap potret |
| `kanonik/` di pohon kerja | 15,7 MB — **tetap**, tidak menumpuk |
| `kanonik/` di git, batas atas (blob penuh) | 1,98 MB |
| `kanonik/` di git, batas bawah (delta) | 17 KB |

Rincian gz per sumber: pestisida 1,15 MB, pupuk-simpel 0,70 MB, pupuk-legacy 0,05 MB.

Lapis kanonik duduk di jalur tetap, jadi delta packfile git bekerja sangat baik padanya —
antarpotret hanya 109 dari 14.911 baris yang berubah. Lapis mentah sebaliknya gzip, dan git
tidak bisa mendelta bita terkompresi: ia menambah **1,9 MB penuh tiap potret, selalu.** Itu
sekitar 50 MB setahun kalau dua mingguan, 23 MB kalau bulanan.

Itu ongkos jaring pengamannya, dan ongkos itu disengaja. Kalau kelak dianggap terlalu mahal,
lapis mentah bisa dipindahkan ke luar git (rilis, penyimpanan objek, cakram) tanpa
mengganggu lapis kanonik sedikit pun — keduanya memang dirancang terpisah. Yang **tidak**
boleh dilakukan adalah membuangnya: ia satu-satunya yang tak tergantikan.

---

## Yang sengaja belum dibangun

Nisan untuk produk yang lenyap, penautan rantai perpanjangan lewat `nomorPendaftaran`,
deteksi perubahan senyap, laporan berkala. Semua itu bisa diturunkan belakangan dari
riwayat yang sudah tersimpan, dan membangunnya sekarang cuma menunda satu-satunya hal yang
mendesak: mulai menyimpan. Sifat penting versi ini bukan kelengkapannya, cuma bahwa ia
menyala.
