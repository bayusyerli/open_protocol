# Agroklimat sebuah lokasi

Kapabilitas mendefinisikan agroklimat sebuah area, lokasi, atau kawasan — apa yang
dibangun, apa yang sengaja tidak, dan aturan yang menjaga bedanya.

Spesifikasinya di [`spec/schema/agroclimate-scheme.schema.json`](../spec/schema/agroclimate-scheme.schema.json),
kosakatanya di `spec/vocab/agroklimat-*.json`, penghitungnya di
[`spec/tools/agroklimat.mjs`](../spec/tools/agroklimat.mjs), dan penegaknya aturan
`L40`–`L43` di [`spec/check.mjs`](../spec/check.mjs).

---

## 1. Yang dibangun bukan iklim, melainkan putusan atas iklim

Repositori ini **tidak menyimpan satu pun deret hujan**, dan tidak berencana. Yang
disimpan adalah lapis di atasnya: aturan main yang mengubah deret panjang jadi satu kelas
bernama, dan penetapan yang menempelkan kelas itu pada sebuah lokasi beserta angka
asalnya.

Pembagian itu bukan penghematan. Deret iklim berubah tiap bulan dan sudah dipelihara
lembaga yang pekerjaannya memang itu; **putusan atas deret itu tidak berubah selama
puluhan tahun dan tidak dipelihara siapa pun dalam bentuk yang bisa dibaca mesin.**
Lubangnya ada di lapis kedua, bukan lapis pertama.

```
       deret hujan bulanan            ←  dipinjam, tidak disimpan (CHIRPS, BMKG, stasiun)
              ↓
       skema + ambangnya              ←  DIBANGUN — op:akl, 5 skema
              ↓
       kelas untuk satu lokasi        ←  DIBANGUN — penetapan pada Plot / Region
              ↓
       cakupan protokol               ←  DISAMBUNGKAN — applicability.agroclimate
```

## 2. Kenapa ini bukan pelanggaran atas putusan "PINJAM" pada C5

[`15-kapabilitas-lintas-pemangku.md`](15-kapabilitas-lintas-pemangku.md) menulis satu
baris untuk C5 — *"Cuaca & iklim per lokasi · keadaan data 0 · **PINJAM** (BMKG)"* — dan
dokumen yang sama memperingatkan bahwa godaan membangun ulang salah satu dari lima
kapabilitas pinjaman **akan datang**, dan jawabannya sudah tertulis di sana.

Peringatan itu berlaku, dan tidak dilanggar di sini. Yang dilanggar justru anggapan bahwa
C5 satu kapabilitas. Ia dua:

| | Cuaca | Agroklimat |
|---|---|---|
| Menjawab | apa yang terjadi minggu ini | tempat macam apa ini |
| Berubah | tiap jam | tiap beberapa dasawarsa |
| Diterbitkan BMKG | **ya**, sampai tingkat kelurahan, lewat API terbuka | **tidak**, tidak untuk sembarang titik |
| Putusan | **PINJAM**, tidak berubah | **BANGUN** |

Prakiraan cuaca tetap dipinjam dan tidak akan dibangun ulang. Yang dibangun sisi yang
pinjamannya **tidak pernah mencakupnya**: tidak ada satu pun sumber yang, diberi
koordinat, mengembalikan "zona Oldeman C3" dalam bentuk terbaca mesin. Yang ada peta
kertas 1975–1980, berkas raster berlisensi terbatas, dan jurnal per provinsi.

Pelajaran C4 berlaku terbalik di sini. C4 turun dari pinjam ke bangun karena pinjamannya
**mati**. C5 dibelah karena pinjamannya **hidup tetapi hanya menutup separuh** — dan
separuh yang tertutup itu yang paling sering diminta, sehingga separuh yang menganga
tidak pernah terlihat.

## 3. Lima skema, dan kenapa lima

Satu tempat punya lebih dari satu agroklimat, karena "agroklimat" bukan satu pertanyaan.
Menyimpannya sebagai satu medan tunggal akan memaksa memilih satu, lalu melupakan bahwa
pilihan itu pernah dibuat.

| Skema | Sumbu | Kelas | Menjawab |
|---|---|---:|---|
| **Oldeman** | rezim hujan | 18 | berapa lama jendela tanam padi, berapa lama paceklik |
| **Schmidt-Ferguson** | rezim hujan | 8 | seberapa kering tempat ini secara keseluruhan |
| **Junghuhn** | ketinggian | 4 | sebaran vegetasi menurut suhu, lewat ketinggian sebagai pengganti |
| **Kelas dataran hortikultura** | ketinggian | 3 | apa yang dimaksud anjuran budidaya dengan "dataran rendah" |
| **Pola hujan BMKG** | bentuk hujan | 3 | kapan hujannya datang — dan apakah kalender tanam bisa dipindahkan ke sini |

Empat yang pertama **berambang**: kelasnya seluruhnya ditentukan potongan angka, jadi bisa
dihitung ulang dan dibantah. Yang kelima **kualitatif**, dan skemanya wajib mengatakan
kenapa — pola hujan dibedakan bentuk grafiknya, bukan ambang pada sebuah bilangan, dan
memaksakan ambang di sana akan mengarang ketegasan yang tidak dimiliki sumbernya.

### Jebakan yang membuat kelima-limanya harus berdampingan

**Kata yang sama berarti hal yang berbeda.**

| | bulan basah | bulan kering | bulan lembab |
|---|---|---|---|
| Oldeman | > 200 mm | < 100 mm | 100–200 mm, tidak dihitung keduanya |
| Schmidt-Ferguson | > 100 mm | < 60 mm | 60–100 mm, tidak masuk hitungan Q |

Satu tempat bisa punya **nol bulan kering menurut Schmidt-Ferguson dan empat bulan kering
menurut Oldeman** tanpa ada yang keliru. Karena itu tiap skema mendeklarasikan kunci
masukannya sendiri, dan `L42` menolak penetapan yang memasok kunci milik skema lain —
kekeliruan yang, kalau lolos, menghasilkan kelas yang tampak sah sepenuhnya.

**Ketinggian pun tidak sepakat.** Lahan 500 m dpl adalah *zona panas* menurut Junghuhn dan
*dataran menengah* menurut kelas hortikultura. Keduanya benar menurut skemanya. Itulah
sebabnya menulis "dataran rendah" tanpa menyebut skemanya bukan penyederhanaan melainkan
kekaburan.

> **Aturannya langsung menemukan satu contohnya di repositori ini sendiri.** Protokol
> `cabai-dataran-rendah` menamai dirinya "dataran rendah" dan mencakupkan diri pada
> **0–400 m** — batas hortikultura. Pada Junghuhn, dataran rendah membentang sampai
> **700 m**. Lahan 500 m dpl memenuhi judulnya dan gagal cakupannya, dan tidak ada apa pun
> di dalam berkasnya yang bisa mengatakan mana yang dimaksud. `L43` menyalakannya;
> protokolnya naik ke 0.2.0 dengan skemanya disebut namanya.

## 4. Empat aturan, dan yang mana yang penting

| Aturan | Menolak |
|---|---|
| `L40` | Kelas yang bukan milik skema yang disebut; kode yang tidak cocok dengan id-nya; nomor kelas kembar; blok kelas bertindih antar-skema |
| `L41` | Penetapan tanpa asal-usul yang lengkap **menurut caranya sendiri** — raster tanpa resolusi, stasiun tanpa jarak, peta tanpa skala, pernyataan tanpa nama; dan deret yang lebih pendek daripada tuntutan skemanya |
| `L42` | Kelas yang **tidak mengikuti dari angkanya sendiri** |
| `L43` | Cakupan ketinggian protokol yang keluar dari pita kelas yang dicakupnya |

`L42` yang menjadikan ini kapabilitas, bukan sekadar tempat penyimpanan. Ia bentuk yang
sama dengan `L34` — *content_hash* harus cocok dengan isinya — dan `L36` — sidik geometri
harus cocok dengan geometrinya. **Ketiganya membuat sebuah klaim bisa dibantah dari
rekamannya sendiri.**

Kelas "C3" yang tersimpan bersama BB=5 dan BK=4 bisa diperiksa siapa pun dengan
menjumlahkan dua bilangan. Kelas "C3" yang tersimpan sendirian tidak bisa diperiksa siapa
pun — dan yang tidak bisa dibantah lama-lama dibaca sebagai fakta.

`L41` bentuknya meniru `geometry_quality` pada `Plot`: *titik tunggal harus terlihat
sebagai titik tunggal, bukan disamarkan.* Label zona punya bahaya yang persis sama dan
lebih halus, karena tidak ada yang terlihat berbeda. "C3" terbaca identik entah ia
dihitung dari 30 tahun deret berjarak 4 km, dibaca dari peta 1:250.000, atau diucapkan
seseorang di rapat. Ketiganya sah; yang tidak sah adalah menyajikannya tanpa membedakannya.

Karena itu `basis.source_kind` punya lima nilai dan **medan wajibnya berbeda-beda**:

| `source_kind` | Wajib menyebut | Kenapa |
|---|---|---|
| `gridded` | deret, rentang tahun, **resolusi** | petak 5,5 km yang disebut "iklim lahan ini" memberi angka yang sama kepada lereng atas dan lereng bawah satu gunung |
| `station` | deret, rentang tahun, **jarak ke stasiun** | stasiun 40 km jauhnya mengukur tempat lain |
| `measured` | **alat atau datanya** | dipakai skema ketinggian: masukannya satu pengukuran, bukan deret iklim |
| `map_lookup` | peta, **skala** | satu milimeter pada peta 1:250.000 adalah 250 m di lapangan; batas zona tidak pernah setajam garisnya |
| `declared` | **siapa** | dan `L41` menolaknya membawa angka masukan: kalau ada angkanya, ia dihitung, dan yang dihitung wajib menyebut deretnya |

## 5. Yang sengaja tidak dibangun

**Deret iklimnya sendiri.** Tidak disimpan, tidak ditarik, tidak dicache. Sumber terbuka
yang cukup untuk menurunkan keempat skema berambang sudah ada dan berlisensi longgar —
CHIRPS (Climate Hazards Center, UCSB/USGS) berada di **domain publik**, resolusi ~5,5 km,
1981 sampai sekarang, dan sudah dipakai kepustakaan pemetaan Oldeman Indonesia termasuk
buletin BMKG sendiri. Menyalinnya ke sini berarti memelihara salinan usang dari sesuatu
yang pemiliknya perbarui sendiri.

**Zona Musim (ZOM) BMKG.** 699 zona, dan **tidak disalin**. ZOM pembagian wilayah, bukan
kelas iklim: batasnya berubah ketika BMKG memutakhirkannya. Yang disalin cuma ketiga
**pola** hujannya, yang tidak berubah tiap musim. ZOM dipinjam.

**Köppen–Geiger — dan ini penolakan yang bermuatan.** Ia satu-satunya skema di daftar ini
yang punya crosswalk internasional, jadi ia yang paling menggoda. Ia ditolak karena
batas Am/Aw-nya bukan ambang melainkan **hubungan antar-masukan**: sebuah bulan terkering
menentukan kelas menurut nilai yang dihitung dari curah hujan tahunan (100 − MAP/25).
Model kriteria di sini hanya bisa menyatakan potongan pada satu masukan. Menambahkan
Köppen menuntut model kriterianya diperluas dulu — dan memasukkannya setengah jalan akan
menghasilkan kelas yang lolos `L42` tanpa benar-benar dihitung. **Ini batas yang
dinyatakan, bukan kelalaian.**

**Penetapan otomatis dari koordinat.** Tidak ada satu pun jalur yang mengambil koordinat
petak lalu mengisi kelasnya sendiri. Kelas yang muncul tanpa diminta adalah kelas yang
tidak akan pernah dibaca ulang siapa pun — dan `Plot.agroclimate` yang kosong berarti
"belum pernah dihitung", yang benar, bukan "tidak diketahui", yang kabur.

**Anjuran dari kelasnya.** Medan `agronomy` pada tiap kelas ada dan bersifat keterangan
saja: tidak satu pun aturan membacanya, dan tidak satu pun anjuran boleh bersandar
padanya. Yang menganjurkan protokol, yang membawa tingkat bukti dan penulis bernama.
Zona agroklimat menyempitkan protokol mana yang berlaku; ia tidak pernah menggantikannya.

## 6. Kemenduaan Oldeman, yang tidak diputuskan diam-diam

Dua cara menghitung runtun bulan sama-sama beredar di kepustakaan, dan keduanya bisa
memberi kelas berbeda untuk deret yang sama:

- **rerata-dulu** — dua belas nilai bulanan dirata-ratakan lintas tahun, baru runtunnya dihitung;
- **runtun-dulu** — runtun dihitung per tahun, baru cacahannya dirata-ratakan.

Alat di sini menghitung **keduanya**, mencetak keduanya, dan menyalakan peringatan bila
hasilnya berbeda. Ia tidak memilih salah satu. Yang memilih harus manusia, dan pilihannya
dicatat di `basis.note` penetapannya.

Satu hal yang **tidak** menduakan: runtun dihitung **melingkar**, bukan Januari ke
Desember. Musim hujan Jawa membentang November–Maret; menghitungnya lurus memotongnya jadi
dua runtun pendek dan menurunkan zona sebagian besar wilayah monsunal Indonesia satu-dua
tingkat. Batas tahun kalender bukan batas musim.

```bash
node spec/tools/agroklimat.mjs deret-hujan.json
```

Berkas masukannya `{ "1992": [12 angka mm, Januari dulu], "1993": [...] }`. Keluarannya
kelas Oldeman menurut kedua cara, dan tipe Schmidt-Ferguson beserta nilai Q-nya.

## 7. Yang masih menganga

| Lubang | Akibatnya sekarang |
|---|---|
| ~~Kosakata wilayah (`op:rgn`) masih kosong~~ — **ditutup 24 Agustus 2026** | 7.768 wilayah sampai kecamatan kini ada ([22-wilayah.md](22-wilayah.md)), jadi `Region.agroclimate` punya tempat menempel. Yang tersisa bukan lagi wadahnya melainkan **isinya**: nol dari 7.768 wilayah punya kelas agroklimat, karena itu menuntut deret hujan per wilayah yang belum ditarik siapa pun di sini |
| **Nol lokasi nyata berkelas Oldeman** | Kelas ketinggian bisa dihitung dari `elevation_m` yang sudah ada; kelas hujan menuntut deret yang belum ditarik siapa pun di sini |
| **`altitude_m` tidak menyatakan terbuka atau tertutup** | `L43` tidak bisa membedakan ≤400 dari <400. Selisihnya satu meter, dan tepat di perbatasan itulah dua skema ketinggian berpisah |
| **Kelas mayoritas versus kelas wakil** | Sebuah kabupaten hampir tidak pernah berkelas tunggal — Jawa Tengah memuat tujuh zona Oldeman sekaligus. Skemanya menuntut `basis.note` mengatakan yang mana, tetapi tidak ada aturan yang menegakkannya |
| **Nol peninjau bernama** | Seperti seluruh kosakata di repositori ini: 36 kelas, semuanya `draft`, tidak satu pun ditinjau seseorang |

Lubang pertama **sudah ditutup** — dan yang tersisa sesudahnya berpindah jenis, bukan
hilang. Sebelumnya pertanyaan "agroklimat **kawasan ini**" tidak bisa dijawab karena tidak
ada kawasan untuk ditanyai. Sekarang kawasannya ada 7.768 dan tidak satu pun punya
jawabannya. Yang tadinya lubang skema kini lubang data — dan lubang data bisa diisi tanpa
menyentuh satu baris skema pun.

Satu hal yang perlu diputuskan sebelum mengisinya, dan sudah tertulis di skemanya: sebuah
kabupaten hampir tidak pernah berkelas tunggal. Jawa Tengah memuat tujuh zona Oldeman
sekaligus. Penetapan pada tingkat wilayah karena itu selalu kelas **mayoritas** atau
**wakil**, dan `basis.note` yang harus mengatakan yang mana.

## 8. Sumber, menurut lapis lisensinya

| Sumber | Untuk | Lisensi | Putusan |
|---|---|---|---|
| CHIRPS v2.0/v3.0 (UCSB/USGS) | deret hujan bulanan, ~5,5 km, 1981– | domain publik (CC0) | **PINJAM** — dipakai menghitung, tidak disalin |
| Prakiraan & ZOM BMKG | cuaca, awal musim, pola hujan | terbitan resmi, syarat pemakaian sendiri | **PINJAM** — polanya disalin, zonanya tidak |
| Oldeman 1975, Contr. CRIA Bogor No. 17 | ambang & tabel zona | terbitan cetak | ambangnya **disalin**, petanya tidak |
| Schmidt & Ferguson 1951, Verhandelingen No. 42 | definisi Q & kedelapan tipe | terbitan cetak | ambangnya **disalin** |
| Junghuhn 1857 | zona ketinggian | domain publik | ambangnya **disalin** |
| DEM (SRTM/DEMNAS) | ketinggian titik | beragam | **belum disambungkan** — ketinggian masih diisi tangan |

Ambang klasifikasi adalah fakta bernomor, bukan karya berhak cipta; yang berhak cipta
peta dan tulisannya. Yang disalin ke sini ambangnya.

---

## Bacaan lain

- [`spec/README.md`](../spec/README.md) — bagian `L40`–`L43`
- [`spec/00-konvensi-kerja-paralel.md`](../spec/00-konvensi-kerja-paralel.md) — blok `akl` dan `akz`
- [`15-kapabilitas-lintas-pemangku.md`](15-kapabilitas-lintas-pemangku.md) — baris C5 dan C6
