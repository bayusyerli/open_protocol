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
| `cmd` | `vocab/commodity.json` | 1–999 | dikurasi tangan |
| `cmd` | `vocab/commodity-registri.json` | 1000–1999 | sasaran dari label produk |
| `pst` | `vocab/pest.json` | 1–999 | dikurasi tangan |
| `pst` | `vocab/pest-registri.json` | 1000–3999 | sasaran dari label produk |
| `sit` | `vocab/target-site.json` | 1–999 | tempat aplikasi |
| `dev` `met` `opt` `sed` `var` | masing-masing satu berkas | 1–999 | belum dipakai bersama |

**Belum dialokasikan** pada jenis `sub`: 100, 1691–1700, 2000–4999, 10000 ke atas.
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
| `L22`–`L29` | Kepatuhan regulasi dan integritas kosakata | `L22`–`L26` |
| `L30`–`L39` | **Belum diklaim** | — |
| `L40`+ | **Belum diklaim** | — |

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

## 4. Aturan main

- **Jangan hapus berkas yang bukan kamu buat.** Konfirmasi ke pemilik repositori dulu.
- **Jangan nomori ulang ID milik orang lain.** Kalau bertabrakan, yang pindah adalah entitas
  yang belum dirujuk siapa pun — biasanya milikmu, karena baru dibuat.
- **ID tidak pernah didaur ulang**, bahkan setelah dipindah antar-berkas. Belerang, abamektin,
  dan Trichoderma harzianum pindah dari `substance.json` ke `substance-pestisida.json` dan
  membawa nomor 6, 7, 8 ikut serta. Itulah kenapa blok berkas itu punya potongan `6–8`.
- **Commit sesering mungkin.** Titik pulih lebih murah daripada penggabungan manual.

---

## 5. Yang menegakkan ini

Konvensi yang hanya tertulis akan dilanggar diam-diam. Tiga aturan pemeriksa menegakkannya:

| Aturan | Isi |
|---|---|
| `L23` | Entitas harus berada di dalam blok yang diklaim berkasnya |
| `L24` | Berkas yang berbagi jenis entitas wajib menyatakan `id_blocks` |
| `L25` | Blok yang diklaim tidak boleh bertindih antar-berkas |

Ketiganya punya fixture di `fixtures-invalid/` yang membuktikannya benar-benar menolak.
