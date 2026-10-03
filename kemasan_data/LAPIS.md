# Jangkauan satu kemasan — berapa hektare sekali beli

Disusun ulang oleh `susun-jangkauan.mjs` dari isi kemasan di `gambar_produk/manifes.ndjson`
dan dosis berlabel di `spec/vocab/product/pestisida.ndjson`.

## Yang bisa dijawab hari ini: 110 baris, 19 merek

Satu baris per pendaftaran × ukuran kemasan × penggunaan berlabel. Angkanya jangkauan:
berapa hektare yang tersapu satu kemasan pada dosis label.

- **OXADAN 3 GR** 1 kg pada Jagung — 500–500 m² sekali beli
- **SANVIN 88 SP** 100 g pada Jagung — 500–500 m² sekali beli
- **AMCOPYR 670 EC** 100 mL pada Kakao (TBM) — 500–1.000 m² sekali beli
- **AMCOPYR 670 EC** 100 mL pada Kelapa Sawit (TBM) — 500–1.000 m² sekali beli
- **CARBAFUR 3 GR** 2 kg pada Padi sawah — 1.333–1.333 m² sekali beli
- **CARBAFUR 3 GR** 2 kg pada Tebu — 1.333–1.333 m² sekali beli
- **FLURAN 290 EC** 500 mL pada Budidaya tanaman kelapa sawit (TBM): — 1.667–2.500 m² sekali beli
- **VERLON 10/20 WP** 25 g pada Padi sawah — 1.667–2.500 m² sekali beli

## Dua penghalang, bukan satu

Matriks menulis no. 11 sebagai "dosisnya kini sudah lengkap; yang hilang tinggal ukuran
kemasannya". Yang kedua benar. Yang pertama tidak.

| | Baris penggunaan |
|---|---:|
| Menyatakan dosis **per hektare** | 10.901 |
| Menyatakan dosis **per liter air semprot** | 6.302 |
| Seluruh baris penggunaan berlabel | 23.058 |

Dosis per liter air semprot **tidak bisa** diubah jadi per hektare tanpa volume semprot
per hektare, dan volume itu tidak dicatat registri di mana pun. Untuk baris-baris itu,
pertanyaan "berapa rupiah per hektare" tidak punya jawaban betapapun lengkap data
kemasannya nanti.

| | Pendaftaran |
|---|---:|
| Punya isi kemasan terurai | **76** dari 7.724 |
| Punya sedikitnya satu dosis per hektare | 2.351 |
| **Punya keduanya** | **20** |

## Satuan tidak pernah dipaksakan

Kemasan cair hanya diadu dengan dosis volume, kemasan padat hanya dengan dosis massa.
Yang tidak sedimensi dilewati — mengubahnya menuntut berat jenis, dan berat jenis cairan
adalah lubang yang sudah tercatat sendiri di repositori ini.

- tidak ada pasangan yang dilewati

## Yang tidak dijawab

- **Harga.** Berkas ini menghitung jangkauan, bukan biaya. Rupiah per hektare menuntut
  harga kemasan, dan harga tidak ada di registri mana pun.
- **Isi kemasan untuk 7.648 pendaftaran lainnya.** Yang ada di sini efek samping panen
  gambar kemasan, dari halaman katalog principal — bukan sumber yang dirancang untuk itu.
- **Apakah kemasannya masih dijual dalam ukuran itu.** Katalog principal berubah tanpa
  memberi tahu, dan tidak ada tanggal pada medan `pack`.
