# Lapis data toko tani

Disusun ulang oleh `susun-fondasi.mjs`. Pembagian menurut **lisensi sumber**, bukan isi:
data yang bersih boleh terbit, data principal hanya jadi benih privat.

> Angka OSM **sementara** — agen penyapu OSM dihentikan di tengah jalan.

## 1. TERBIT — `toko-tani-jawa.ndjson` / `.csv`
Nama + koordinat, lisensi terbuka (OSM/ODbL). Inilah yang boleh masuk repo publik.
- **234** toko (9 duplikat dibuang)
- Sumber: osm

## 2. PRIVAT — `privat/benih-principal.ndjson` (di-gitignore)
Koordinat dari direktori principal (Syngenta dkk). **Tidak terbit.** Dipakai hanya untuk
mengundang & mengisi-awal klaim pemilik toko. Begitu pemilik mengonfirmasi, catatannya jadi
setoran pemilik — berlisensi bersih — dan baru boleh naik ke lapis TERBIT.
- **1592** toko berkoordinat (0 duplikat dibuang) — Jawa Timur 611, Jawa Tengah 506, Jawa Barat 470, DKI Jakarta 4, DI Yogyakarta 1
- **205** principal tanpa koordinat → `privat/benih-principal-alamat.ndjson`

## 3. BENIH TERBUKA — `benih-alamat.ndjson`
Nama + alamat tanpa koordinat, lisензi terbuka/pemerintah. Benih untuk klaim & geokode-via-pemilik.
- Batang (CC-BY): 67
- TTI Kementan (arsip Wayback, karya pemerintah): 2181

## Dibuang
Luar Pulau Jawa: 0. Berkas sesi paralel (`semua.ndjson`, `peta-pairs`, dll) sengaja dilewati.
