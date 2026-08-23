<!-- Baca CONTRIBUTING.md kalau ini PR pertama Anda di repositori ini. -->

## Apa yang berubah

<!-- Satu paragraf. Sebutkan rekaman atau berkas yang disentuh. -->

## Bentuknya

- [ ] **Tinjauan** — saya membaca satu rekaman atau lebih dan menempelkan nama saya
- [ ] **Rekaman baru** — protokol, resep, pemetaan, atau kosakata yang belum ada
- [ ] **Perbaikan salinan** — yang ditampilkan tidak sesuai sumbernya
- [ ] **Kode atau alat** — tidak menyentuh isi korpus

## Kalau ini tinjauan

- [ ] Ditulis lewat `node spec/tools/tinjau.mjs --tambah …`, bukan dengan tangan
- [ ] `conflict_of_interest` terisi — `none` bila memang tidak ada
- [ ] `lifecycle.reviewed_at` dan `lifecycle.reviewed_hash` ikut tertulis

Menempelkan nama berarti *"saya sudah memeriksanya"*, bukan *"buktinya sekarang lebih
kuat"*. Kalau PR ini juga menaikkan `evidence_tier`, sebutkan alasannya di
`evidence_note` — kenaikan tingkat tanpa alasan tertulis akan diminta diperbaiki.

## Pemeriksa

```
cd spec && npm run check && npm test
```

- [ ] Keduanya lolos di mesin saya

<!-- Kalau ada peringatan baru yang muncul dan Anda sengaja membiarkannya, tulis di sini
     kenapa. Peringatan yang dibiarkan tanpa penjelasan akan ditanyakan. -->
