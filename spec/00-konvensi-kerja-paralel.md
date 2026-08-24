# Konvensi kerja paralel

Dibaca lebih dulu oleh siapa pun — orang maupun agen — yang akan menambah entitas atau
aturan ke spesifikasi ini.

---

## Kenapa dokumen ini ada

Pada 19 Agustus 2026 dua sesi menulis ke repositori ini bersamaan. Keduanya menambah
entitas ke jenis `substance`, keduanya menghitung `nomor tertinggi + 1` dari keadaan yang
sudah usang, dan keduanya memberikan nomor `op:sub:00001701`–`1721` ke entitas yang
berbeda. Aturan `L1` menangkapnya sebelum tersimpan, tetapi baru setelah ratusan entitas
telanjur dibuat dan harus dinomori ulang.

Nyaris terjadi juga pada nomor aturan: `L16` hampir dipakai dua kali untuk hal yang tidak
berhubungan.

Akar masalahnya bukan kecerobohan. Penomoran berurutan dari satu antrean tunggal
**mensyaratkan satu penulis**. Begitu ada dua, tabrakan hanya soal waktu.

---

## 1. Blok nomor ID

Setiap berkas kosakata menyatakan rentang nomor yang diklaimnya lewat `id_blocks`.
Penambahan baru mengambil nomor dari blok berkasnya sendiri — tidak pernah dari
`maksimum global + 1`.

### Registri blok

| Jenis | Berkas | Blok | Sisa ruang |
|---|---|---|---|
| `sub` | `vocab/substance.json` | 1–5, 9–99 | inti, dikurasi tangan |
| `sub` | `vocab/substance-pestisida.json` | 6–8, 101–1690, 5001–9999 | turunan registri & Permentan |
| `sub` | `vocab/substance-organik.json` | 1701–1999 | bahan sediaan buatan sendiri |
| `prd` | `vocab/product.json` | 1–999 | contoh struktur |
| `prd` | `vocab/product/pestisida.meta.json` | 1001–9999 | registri pestisida |
| `prd` | `vocab/product/pupuk.meta.json` | 10001–19999 | registri pupuk |
| `sca` | `vocab/stage-scale-bbch-solanaceae.json` | 1 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-doc-udang.json` | 2 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-padi.json` | 3 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-jagung.json` | 4 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-cucurbit.json` | 5 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-kedelai.json` | 6 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-kentang.json` | 7 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-kopi.json` | 8 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-bawang.json` | 9 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-kubis.json` | 10 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-daun-tak-berkrop.json` | 11 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-brassica-lain.json` | 12 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-umbi-batang.json` | 13 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-buncis.json` | 14 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-kacang-tanah.json` | 15 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-bit.json` | 16 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-kacang-polong.json` | 17 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-tembakau.json` | 18 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-bbch-alpukat.json` | 19 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-durian.json` | 20 | berkas entitas tunggal |
| `sca` | `vocab/stage-scale-kacang-panjang.json` | 21 | berkas entitas tunggal |
| `stg` | `vocab/stage-scale-bbch-solanaceae.json` | 1–99 | fase di dalam skala |
| `stg` | `vocab/stage-scale-doc-udang.json` | 100–199 | fase di dalam skala |
| `stg` | `vocab/stage-scale-bbch-padi.json` | 200–299 | fase di dalam skala |
| `stg` | `vocab/stage-scale-bbch-jagung.json` | 300–399 | fase di dalam skala |
| `stg` | `vocab/stage-scale-bbch-cucurbit.json` | 400–499 | fase di dalam skala |
| `stg` | `vocab/stage-scale-bbch-kedelai.json` | 500–599 | fase di dalam skala |
| `stg` | `vocab/stage-scale-bbch-kentang.json` | 600–699 | fase di dalam skala |
| `stg` | `vocab/stage-scale-bbch-kopi.json` | 700–799 | fase di dalam skala |
| `stg` | `vocab/stage-scale-bbch-bawang.json` | 800–899 | fase di dalam skala |
| `stg` | `vocab/stage-scale-bbch-kubis.json` | 900–999 | fase di dalam skala |
| `stg` | `vocab/stage-scale-bbch-daun-tak-berkrop.json` | 1000–1099 | fase di dalam skala |
| `stg` | `vocab/stage-scale-bbch-brassica-lain.json` | 1100–1199 | fase di dalam skala |
| `stg` | `vocab/stage-scale-bbch-umbi-batang.json` | 1200–1299 | fase di dalam skala |
| `stg` | `vocab/stage-scale-bbch-buncis.json` | 1300–1399 | fase di dalam skala |
| `stg` | `vocab/stage-scale-bbch-kacang-tanah.json` | 1400–1499 | fase di dalam skala |
| `stg` | `vocab/stage-scale-bbch-bit.json` | 1500–1599 | fase di dalam skala |
| `stg` | `vocab/stage-scale-bbch-kacang-polong.json` | 1600–1699 | fase di dalam skala |
| `stg` | `vocab/stage-scale-bbch-tembakau.json` | 1700–1899 | **200 nomor** — 156 fase, satu-satunya skala yang melampaui satu ratusan |
| `stg` | `vocab/stage-scale-bbch-alpukat.json` | 1900–1999 | fase di dalam skala |
| `stg` | `vocab/stage-scale-durian.json` | 2000–2099 | fase di dalam skala |
| `stg` | `vocab/stage-scale-kacang-panjang.json` | 2100–2199 | fase di dalam skala |
| `cmd` | `vocab/commodity.json` | 1–999 | dikurasi tangan |
| `cmd` | `vocab/commodity-registri.json` | 1000–1999 | sasaran dari label produk |
| `cmd` | `vocab/commodity-varietas.json` | 2000–2999 | jenis tanaman dari registri varietas |
| `vty` | `vocab/variety/varietas.meta.json` | 1000–19999 | registri varietas; 1–999 disisakan untuk kurasi tangan |
| `pst` | `vocab/pest.json` | 1–999 | dikurasi tangan |
| `pst` | `vocab/pest-registri.json` | 1000–3999 | sasaran dari label produk |
| `proto` | `vocab/protocol-cabai-dataran-rendah.json` | 1 | berkas entitas tunggal, seperti skala fase |
| `sit` | `vocab/target-site.json` | 1–999 | tempat aplikasi |
| `pcp` | `vocab/principal/principal.meta.json` | 1000–9999 | badan pemegang pendaftaran, turunan kedua registri; 1–999 disisakan untuk kurasi tangan |
| `hrg` | `vocab/harga/harga.meta.json` | 1000–1999 | seri harga komoditas SP2KP; 1–999 disisakan untuk patokan regulasi yang dikurasi tangan |
| `lab` | `vocab/lab/lab.meta.json` | 1000–9999 | laboratorium penguji terakreditasi KAN; 1–999 disisakan untuk kurasi tangan |
| `bpp` | `vocab/bpp/bpp.meta.json` | 1000–19999 | balai penyuluhan, turunan laporan tamu SIMLUHTAN; 1–999 disisakan untuk kurasi tangan |
| `rgn` | `vocab/region/wilayah.meta.json` | 1–19999 | wilayah administratif; internalnya: 1–9 negara, 10–99 provinsi, 100–1999 kabupaten/kota, 2000–19999 kecamatan |
| `akl` | `vocab/agroklimat-oldeman.json` | 1 | berkas entitas tunggal, seperti skala fase |
| `akl` | `vocab/agroklimat-schmidt-ferguson.json` | 2 | berkas entitas tunggal |
| `akl` | `vocab/agroklimat-junghuhn.json` | 3 | berkas entitas tunggal |
| `akl` | `vocab/agroklimat-dataran-hortikultura.json` | 4 | berkas entitas tunggal |
| `akl` | `vocab/agroklimat-pola-hujan.json` | 5 | berkas entitas tunggal |
| `akz` | `vocab/agroklimat-oldeman.json` | 1–99 | kelas di dalam skema; diklaim lewat `class_id_blocks` |
| `akz` | `vocab/agroklimat-schmidt-ferguson.json` | 100–199 | kelas di dalam skema |
| `akz` | `vocab/agroklimat-junghuhn.json` | 200–299 | kelas di dalam skema |
| `akz` | `vocab/agroklimat-dataran-hortikultura.json` | 300–399 | kelas di dalam skema |
| `akz` | `vocab/agroklimat-pola-hujan.json` | 400–499 | kelas di dalam skema |
| `dev` `met` `opt` `sed` `var` | masing-masing satu berkas | 1–999 | belum dipakai bersama |

**Belum dialokasikan** pada jenis `sub`: 100, 1691–1700, 2000–4999, 10000 ke atas; pada `cmd`: 3000 ke atas;
pada `vty`: 1–999 dan 20000 ke atas; pada `sca`: 22 ke atas; pada `stg`: 2200 ke atas; pada `pcp`: 1–999 dan
10000 ke atas; pada `hrg`: 1–999 dan 2000 ke atas; pada `lab`: 1–999 dan 10000 ke atas; pada `bpp`:
1–999 dan 20000 ke atas; pada `akl`: 6 ke atas; pada `akz`: 500 ke atas; pada `rgn`: 20000 ke atas — **zona agroekologi ambil dari sana**, jangan dari sisa blok wilayah administratif.

Fase (`stg`) hidup di dalam berkas skalanya, bukan sebagai dokumen tersendiri, sehingga
aturan `L1` dan `L23` tidak menyentuhnya. Bloknya tetap dicatat di sini dan dijaga tangan —
satu skala satu ratusan.

Kelas agroklimat (`akz`) bersarang dengan cara yang sama tetapi **tidak dijaga tangan**.
Ia mengklaim bloknya lewat medan tersendiri, `class_id_blocks`, dan `L40` menegakkannya
persis seperti `L23` dan `L25` menegakkan blok entitas tingkat atas: kelas di luar blok
ditolak, blok yang bertindih antar-skema ditolak, dan nomor kelas yang kembar ditolak.
Bentuk bersarang milik `stg` ditiru; lubang penegakannya tidak. Kalau `stg` kelak diberi
perlakuan yang sama, aturannya sudah ada bentuknya.
Ambil dari situ bila butuh blok baru, lalu tambahkan barisnya ke tabel ini.

### Cara mengklaim blok

1. Pilih rentang yang belum ada di tabel di atas.
2. Tulis `id_blocks` pada header koleksi berkasmu.
3. Tambahkan barisnya ke tabel ini **dalam commit yang sama**.
4. Jalankan `npm run all`. Kalau bertindih dengan klaim orang lain, `L25` akan menolaknya.

---

## 2. Rentang nomor aturan

Nomor aturan sama langkanya dengan nomor ID, dan sama mudahnya bertabrakan.

| Rentang | Untuk | Sudah dipakai |
|---|---|---|
| `L1`–`L15` | Struktur inti, netralitas vendor, PDP, keselamatan dasar | seluruhnya |
| `L16`–`L21` | Sediaan buatan petani | seluruhnya |
| `L22`–`L29` | Kepatuhan regulasi dan integritas kosakata | seluruhnya |
| `L30`–`L39` | Protokol Lapis 2 dan keutuhan isi | `L30`–`L38` |
| `L40`–`L49` | Agroklimat & wilayah — skema, kelas, asal-usul penetapan, dan jenjang wilayah | `L40`–`L44` |
| `L50`+ | **Belum diklaim** | — |

Sebelum menambah aturan, jalankan:

```bash
grep -oE "'L[0-9]+-[a-z-]+'" spec/check.mjs | sort -uV
```

Ambil nomor dari rentang yang sudah jadi milikmu. Kalau butuh rentang baru, klaim satu blok
sepuluhan di tabel ini lebih dulu.

---

## 3. Sebelum mulai menulis

```bash
git status --short                       # ada perubahan yang belum di-commit?
find spec -newermt '-30 minutes' -name '*.json' | head   # ada yang baru diubah?
cd spec && npm run all                   # pohonnya valid sekarang?
```

Kalau ada berkas yang berubah dalam setengah jam terakhir dan bukan kamu yang mengubahnya,
anggap ada penulis lain yang aktif.

---

## 4. Penyeragaman nama principal

Registri Kementan menulis nama pemegang pendaftaran dengan ejaan yang tidak konsisten.
Dua sisi repositori ini memakai **satu** cara, jangan sampai jadi dua:

| Sisi | Pemetaan | Data |
|---|---|---|
| Benih | `proseed_data/pemohon_alias.csv` | `varietas_terdaftar.csv` kolom `pemohon` + `pemohon_kanonik` |
| Pupuk & pestisida | `pukpes_data/principal_alias.csv` | `principal_kanonik.csv` kolom `nama_asli` + `nama_kanonik` |

Aturannya:

- **Nama asli tidak pernah ditimpa.** Hasil penyeragaman selalu masuk kolom terpisah.
- **Setiap penggabungan dicatat beserta alasannya** di berkas alias, memakai kosakata `dasar`
  yang sama di kedua sisi: `kanonik`, `ejaan/kapitalisasi/spasi`, `tanda-baca`,
  `beda-bentuk-badan`.
- **Pemilihan bentuk kanonik**, berurutan: ada prefiks badan hukum → bukan ALL CAPS → tanpa
  spasi ganda atau spasi ekor → paling sering muncul.
- **`perlu_tinjau=ya`** untuk nama yang sama tetapi bentuk badannya berbeda (CV vs PT vs UD).
  Digabung karena hampir pasti salah entri, ditandai supaya bisa dipisah lagi.
- **Singkatan tidak pernah digabung.** `PT BCA` mungkin PT Benih Citra Asia, `PT BISI` bisa
  PT BISI International atau PT Benih Inti Subur Intani — dua-duanya masuk akal. Tandai,
  jangan tebak.
- **Membalik penggabungan** = sunting berkas alias, bangkitkan ulang kolom kanoniknya. Tidak
  ada data asli yang hilang.

Catatan: `pukpes_data/produsen_master.csv` dibuat sebelum konvensi ini disepakati dan memakai
cara lama — nama asli tidak disimpan, alasan penggabungan tidak dicatat, dan bentuk
kanoniknya kadang keliru (ia memilih `PT. SINAR␣␣GENERAL INDUSTRIES` dengan spasi ganda).
Berkas itu dibiarkan apa adanya sebagai jejak, tetapi yang mengikat adalah `principal_alias.csv`.

## 4b. Nomor wilayah bukan kode wilayah

Godaan yang paling besar saat kosakata wilayah dibangun adalah memakai kode BPS sebagai
nomor ID — kodenya hierarkis, sudah unik, dan enak dibaca. **Jangan.**

Repositori ini sudah pernah melakukannya tanpa sengaja. Tiga berkas contoh menunjuk
`op:rgn:00003318` berlabel *"Kabupaten Rembang"* — nomor yang disusun agar menyerupai
kode BPS Rembang. Kode BPS Rembang **3317**; 3318 adalah Pati. Ketika kosakata wilayah
akhirnya dibangun, nomor itu ternyata menunjuk **Babat Toman, sebuah kecamatan di Musi
Banyuasin**, 700 km dari petak yang dimaksud. `L10` meloloskannya karena tujuannya memang
ada.

Alasan yang lebih dalam: **kode wilayah bukan identitas.** Kode 91 berarti Papua Barat
menurut BPS dan Papua menurut Kemendagri, dan 167 kode lain sah di kedua sistem sambil
menunjuk kabupaten yang berlainan. Nomor yang janjinya tidak pernah didaur ulang tidak
boleh diturunkan dari angka yang artinya bergantung skema.

Kode hidup di `code` beserta `code_scheme`, dan di `mappings`. `L44` menegakkan ketiganya
— termasuk bahwa label pada rujukan wilayah harus sepakat dengan wilayah yang ditunjuknya.

---

## 5. Aturan main

- **Jangan hapus berkas yang bukan kamu buat.** Konfirmasi ke pemilik repositori dulu.
- **Jangan nomori ulang ID milik orang lain.** Kalau bertabrakan, yang pindah adalah entitas
  yang belum dirujuk siapa pun — biasanya milikmu, karena baru dibuat.
- **ID tidak pernah didaur ulang**, bahkan setelah dipindah antar-berkas. Belerang, abamektin,
  dan Trichoderma harzianum pindah dari `substance.json` ke `substance-pestisida.json` dan
  membawa nomor 6, 7, 8 ikut serta. Itulah kenapa blok berkas itu punya potongan `6–8`.
- **Jangan pernah `git add -A` atau `git add .`.** Stage berkas milikmu sendiri dengan
  menyebut jalurnya satu per satu. Berkas yang kotor tapi bukan garapanmu ditinggalkan
  saja — pemiliknya yang akan meng-commit-nya.

  ```bash
  git status --short          # lihat apa saja yang kotor
  git add spec/vocab/berkas-yang-kamu-ubah.json spec/README.md
  git commit
  ```

  Pada 19 Agustus 2026 satu sesi meng-commit seluruh working tree dan ikut menyapu masuk
  kosakata sesi lain yang masih setengah jadi — 459 dari 1.806 entitas bernama sampah.
  Pemeriksa tidak menangkapnya: bentuknya sah, hanya isinya yang belum benar. Aturan hanya
  bisa menangkap yang bisa dinyatakan sebagai aturan, dan "nama ini sampah" bukan salah satunya.
- **Commit sesering mungkin.** Titik pulih lebih murah daripada penggabungan manual.

---

## 6. Yang menegakkan ini

Konvensi yang hanya tertulis akan dilanggar diam-diam. Tiga aturan pemeriksa menegakkannya:

| Aturan | Isi |
|---|---|
| `L23` | Entitas harus berada di dalam blok yang diklaim berkasnya |
| `L24` | Berkas yang berbagi jenis entitas wajib menyatakan `id_blocks` |
| `L25` | Blok yang diklaim tidak boleh bertindih antar-berkas |

Ketiganya punya fixture di `fixtures-invalid/` yang membuktikannya benar-benar menolak.
