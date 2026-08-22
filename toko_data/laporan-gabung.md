# Laporan penggabungan

Berkas sumber: opendata.ndjson, pupuk-indonesia.ndjson, syngenta.ndjson

- Baris terbaca: **1607**
- Lolos saringan: **1605**
- Hasil akhir setelah dedup: **1593**
- Tanpa titik, alamat lengkap → `toko-tani-jawa-tanpa-titik.ndjson`: **270**

## Yang dibuang
| Sebab | Jumlah |
|---|---|
| Tanpa koordinat / JSON rusak | 0 |
| Koordinat di luar Pulau Jawa | 0 |
| Nama kosong setelah dinormalkan | 2 |
| Duplikat (nama sama, jarak < ~110 m) | 10 |

## Per sumber
| Sumber | Jumlah |
|---|---|
| syngenta | 1593 |

## Per provinsi
| Provinsi | Jumlah |
|---|---|
| Jawa Timur | 614 |
| Jawa Tengah | 495 |
| Jawa Barat | 416 |
| Banten | 48 |
| DI Yogyakarta | 16 |
| DKI Jakarta | 4 |

## Tanpa titik, menunggu diklaim
Nama, alamat, dan telepon lengkap; yang belum ada cuma koordinat tepercaya.

| Sumber | Jumlah |
|---|---|
| syngenta | 210 |
| opendata-jateng | 60 |
