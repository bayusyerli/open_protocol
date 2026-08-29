# Gambar OPT

Gambar yang memperlihatkan apa yang diceritakan teks gejala pada `spec/vocab/pest.json`.
Bukan hiasan: jalur 1 menyuruh orang memastikan sendiri sebelum menyemprot, dan sebagian
ciri pembanding praktis tidak bisa disampaikan kalimat saja — anyaman benang tungau,
untaian lendir pada uji gelas, titik hitam yang tersusun melingkar sepusat di tengah
bercak antraknosa.

## Kenapa datanya lebih dulu, berkasnya belakangan

Satu-satunya saat asal-usul sebuah gambar masih diketahui pasti adalah **saat
pengambilannya**. Berkas yang turun lebih dulu lalu dicarikan sumbernya belakangan akan
selalu punya celah, dan celah itu yang berubah jadi pelanggaran hak cipta enam bulan
kemudian.

Jadi urutannya dibalik. 48 rekaman gambar sudah tertulis di `spec/vocab/pest.json`
lengkap dengan lisensi, kredit, dan dasar identifikasinya **sebelum satu byte pun
diunduh**. `panen.py` hanya menjemput piksel untuk rekaman yang sudah ada; ia tidak
pernah menambah rekaman baru.

## Dua gerbang

Enam puluh kandidat masuk, empat puluh delapan tercatat.

| Gerbang | Yang dijaga | Medannya |
|---|---|---|
| Lisensi | Hak ciptanya mengizinkan | `source.redistributable` |
| Identifikasi | Spesiesnya dipertanggungjawabkan di sumbernya | `identification` + `confidence` |

Gerbang kedua yang sering dilupakan, dan justru yang paling menentukan di sini. **Gambar
salah label lebih buruk daripada tidak ada gambar**: foto berlabel "serangan trips" yang
ternyata memperlihatkan gejala virus akan meruntuhkan seluruh guna blok pembanding —
pembacanya menyemprot tanaman yang tidak bisa disembuhkan semprotan apa pun.

Yang lolos lisensi tetapi identifikasinya cuma klaim pengunggah tetap masuk dengan
`confidence: "rendah"`, dan penyaji menandainya di layar dengan bingkai putus-putus plus
satu kalimat: pakai untuk mengenali kelompoknya, bukan untuk memastikan spesiesnya.

## Alurnya

```
spec/vocab/pest.json   48 rekaman + asal-usul, ditulis lebih dulu
        │
        ▼  python3 gambar_opt/panen.py --tulis
app/gambar/opt/*.webp   berkas ternormalkan, EXIF dibuang, sRGB, sisi terpanjang 1200
        │               (`file` ditulis balik ke pest.json: path, ukuran, sha256)
        ▼  node spec/tools/bangun-indeks.mjs --tulis
spec/indeks/gejala.json hanya yang `file.path`-nya terisi DAN masih redistributable
        │
        ▼
app/tanaman.js          figur menempel pada kalimat yang diperlihatkannya
```

Selama panen belum dijalankan, `k.gambar` kosong dan penyaji tidak merender apa pun.
Itu disengaja: **layar tanpa gambar jauh lebih baik daripada layar dengan kotak rusak.**

## Keadaan sekarang (25 Agu 2026)

**38 dari 48 terpasang.** Delapan dari sepuluh OPT punya gambar tepat pada ciri
pembandingnya. Yang belum: 7 tertanam di dalam PDF, 1 dijawab 403 oleh Silverchair
(lisensinya memang belum tuntas diverifikasi), 1 ditahan sesudah diperiksa mata karena
isinya tidak cocok dengan keterangannya, dan 1 dibuang karena potongan mana pun lemah.

Dua pelajaran yang mahal kalau harus ditemukan ulang:

- **URL `upload.wikimedia.org` tidak boleh disalin apa adanya.** Jalurnya memuat dua digit
  hash MD5 atas NAMA berkasnya, jadi nama yang meleset satu huruf menghasilkan 404 — dan
  itu terjadi pada 12 dari 23 baris. `panen.py` karena itu meminta lewat
  `Special:FilePath` yang diturunkan dari `page_url`, lalu menuliskan balik alamat
  sesudah pengalihan ke `source.url`.
- **Wikimedia menuntut User-Agent yang menyebut CARA MENGHUBUNGI, dan menegakkannya
  dengan mesin.** UA yang cuma menyebut nama dijawab 429 pada permintaan pertama,
  seberapa pun panjang jedanya. Yang membuka pintu bukan menunggu lebih lama melainkan
  menyebut alamat yang bisa dihubungi.

## Yang ditahan panen, dan kenapa

Dari 48, hanya 23 yang bisa dijemput mesin tanpa campur tangan. Sisanya ditahan bukan
karena lisensi:

- **24 perlu dipotong panelnya lebih dulu.** Gambar ilmiah hampir selalu berpelat banyak.
  Memotong adalah keputusan mata — panel mana yang dimaksud, dan panel mana yang JUSTRU
  menyesatkan kalau ikut terbawa. Ada satu pelat di daftar ini yang memuat empat spesies
  *Fusarium* berbeda dan hanya satu yang dimaksud. Skrip yang memotong sendiri akan salah
  tanpa bersuara.
- **7 tertanam di dalam PDF.** Ironisnya justru sumber Indonesia terkuat yang begini —
  lisensinya paling mudah (CC-BY-SA-4.0, kembar dengan repositori), pengambilannya paling
  panjang.

Keduanya tercatat di `prep.crop_from` dan `prep.from_pdf`, jadi yang mengerjakannya tahu
persis panel mana yang dicari tanpa membuka artikelnya dua kali.

## Kewajiban yang ikut terpasang

**Kredit dirender bersama gambarnya, bukan disimpan di berkas terpisah.** Kecuali CC0,
seluruh lisensi di sini menuntut atribusi, dan atribusi yang hilang membatalkan izin
pakainya — gambar tanpa kreditnya adalah pelanggaran, bukan gambar yang kurang rapi.

**Memotong panel adalah mengubah, dan perubahan wajib dinyatakan.** CC BY 4.0 §3(a)(1)(B)
mewajibkannya, jadi kredit gambar yang dipotong harus berbunyi `dipotong dari Gambar 2`.

**ShareAlike menular ke potongannya, bukan ke seluruh halaman.** Potongan dari gambar
CC BY-SA adalah karya turunan yang wajib terbit di bawah CC BY-SA 4.0 juga; menampilkan
gambar utuh berdampingan dengan teks lain tidak menularkan apa-apa — itu kumpulan, bukan
turunan. Karena repositori ini sudah CC-BY-SA-4.0, keduanya beres.

**EXIF selalu dibuang.** Foto OPT sering foto lapangan, dan EXIF foto lapangan membawa
titik GPS pemotretnya — data pribadi menurut UU 27/2022.

## Lubang yang tidak akan tertutup pencarian

Sudah disisir Europe PMC, Wikimedia Commons, Bugwood, iNaturalist, GBIF, EPPO, Plantwise,
dan OJS Indonesia. Yang di bawah ini kosong bukan karena kurang dicari:

- **Foto dua penyebab berdampingan** (`role: kekeliruan`) — kosong untuk tujuh dari
  sepuluh OPT. Literatur ilmiah memotret SATU patogen untuk membuktikan SATU klaim;
  tidak ada yang berkepentingan memotret trips di sebelah virus kuning. Padahal justru
  bentuk itulah yang dibutuhkan blok "Pastikan dulu".
- **Batang fusarium dibelah membujur** — Bugwood punya nol rekaman `f.sp. capsici` dari
  335.181 gambar.
- **Uji gelas negatif** — versi positifnya ada dan CC0; versi negatifnya nihil di lisensi
  apa pun. Padahal pasangan positif–negatif itulah yang membuat ujinya terbaca.
- **Buah cabai dibelah dengan belatung**, dan **butiran frass di ketiak daun**.

Ketiganya cuma bisa ditutup dengan pemotretan sendiri. Yang terakhir tidak: `symptom_title`
kutu kebul menggambarkan **gerakan** ("berhamburan saat tanaman disentuh"), dan tidak ada
foto diam yang bisa menyampaikannya — itu klip video, atau kalimatnya saja.
