# Lapis wilayah administratif

Ditarik `tarik-bps.mjs` dari layanan **bridging kode wilayah BPS**
(`sig.bps.go.id/rest-bridging/getwilayah`), 24 Agustus 2026.
Karya pemerintah. `robots.txt` situsnya berbunyi `Disallow:` kosong — seluruhnya diizinkan.

## Kenapa layanan *bridging*, bukan daftar wilayah biasa

Karena ia mengembalikan **dua kode berdampingan** untuk wilayah yang sama: kode BPS dan
kode Kemendagri. Daftar wilayah biasa hanya memberi satu, dan satu tidak cukup.

Indonesia punya dua sistem penomoran wilayah yang dipelihara dua lembaga, dan keduanya
tidak sepakat:

| | BPS | Kemendagri |
|---|---|---|
| Papua | 94 | **91** |
| Papua Barat | **91** | 92 |
| Kab. Simeulue | 1101 | 11.09 |
| Kuantan Singingi | 1401 | 14.09 |
| Kab. Kampar | 1406 | **14.01** |

**167 kode sah di kedua sistem sekaligus sambil menunjuk wilayah yang berlainan.** Angka
`1401` tanpa nama skemanya bukan kabur — ia bisa Kuantan Singingi, bisa Kabupaten Kampar.
Itulah yang membuat kode wilayah tidak boleh dipakai sebagai identitas, dan kenapa
`op:rgn` bernomor sendiri.

## Isi

| Berkas | Isi |
|---|---|
| `raw/provinsi.json` | 34 provinsi |
| `raw/kabupaten-<kode>.json` | 514 kabupaten/kota, satu berkas per provinsi |
| `raw/kecamatan-<kode>.json` | 7.219 kecamatan, satu berkas per kabupaten/kota |

Tidak ada permintaan yang gagal pada tarikan ini. Penarik membedakan
"gagal ditanya" dari "jawabannya kosong", dan mencetak keduanya — daftar wilayah yang
bolong tanpa disebut bolongnya akan terbaca sebagai wilayah yang memang tidak ada.

## Yang tidak ada di dalamnya

- **Desa/kelurahan.** Layanan ini menyediakannya, tetapi ~83.000 desa akan melipatgandakan
  berkasnya sepuluh kali untuk tingkat yang belum dipakai satu pun rekaman di repositori
  ini. Kecamatan sudah dipakai: balai penyuluhan dibina per kecamatan, dan Katam berskala
  kecamatan.
- **Empat provinsi Papua hasil pemekaran 2022** — Papua Selatan, Papua Tengah, Papua
  Pegunungan, Papua Barat Daya. Layanan bridging BPS memuat 34 provinsi pada tanggal
  tarikan ini, bukan 38, dan yang tidak diberikan sumbernya tidak dikarang di sini.
  Kekosongannya konsisten dengan seluruh data lain di repositori ini — SIMLUHTAN juga 34
  provinsi dan 514 kabupaten/kota — sehingga menambahkan empat provinsi dari ingatan justru
  akan menghasilkan wilayah yang tidak bisa dijoin dengan satu berkas pun.
- **Geometri.** Tidak ada batas wilayah, tidak ada koordinat. Yang ditarik daftar dan
  kodenya saja.
- **Kode ISO 3166-2:ID.** Tidak ada di sumber ini. Enam provinsi punya kodenya lewat sisi
  harga, dan pencocokannya di sana dilakukan menurut nama, bukan tabel tulis tangan.

## Kejanggalan ejaan di sumbernya

Empat nama dieja huruf demi huruf — `S I A K`, `D U M A I`, `B A T A M`, `B U L O` — dan
enam berspasi ganda. Keduanya dirapikan saat kosakata disusun, dan yang dirapikan
**menyimpan ejaan aslinya di `synonyms`**: konvensi repositori ini berbunyi *nama asli
tidak pernah ditimpa*.

Lima puluh nama memuat angka Romawi yang benar-benar bagian dari namanya — `Rokan IV Koto`,
`Bathin VIII`, `X Koto`. Daftar angka Romawinya eksplisit, bukan pola, karena `IDI`
(Aceh Timur), `LILI`, dan `DI` semuanya cocok dengan pola angka Romawi tanpa satu pun di
antaranya angka.

## Menarik ulang

```bash
node wilayah_data/tarik-bps.mjs           # ~550 permintaan, sekitar 5 menit
node spec/tools/bangun-wilayah.mjs --tulis
```

Penyusunnya **mempertahankan nomor yang sudah pernah diberikan**: ia membaca keluarannya
sendiri lebih dulu dan hanya menomori wilayah yang belum punya. Tanpa itu, satu kabupaten
pemekaran akan menggeser nomor seluruh wilayah sesudahnya dan membuat tiap rujukan lama
menunjuk tempat yang salah tanpa satu galat pun menyala.
