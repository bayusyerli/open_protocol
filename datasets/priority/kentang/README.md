# Kentang (*Solanum tuberosum*) — indeks dataset

Agen: **KEN** · Tanggal panen: 2026-08-25
Laporan lengkap: `datasets/reports/agen-kentang.md`
Katalog: `datasets/metadata/rows/kentang.csv` · Klaim: `datasets/metadata/klaim/kentang.tsv`

## Dataset di direktori ini

| id | isi | organ | jumlah | lisensi | verifikasi |
|---|---|---|---:|---|---|
| `KEN-01-potatocare-umbi-mendeley` | 10 kelas penyakit umbi bernama patogen | **umbi** | 3.905 | CC BY 4.0 | sebagian |
| `KEN-10-hybrid-tuber-zenodo` | biner: kondisi baik vs cacat | **umbi** | **36.000** | CC BY 4.0 | terverifikasi |
| `KEN-02-virus-daun-umbi-mendeley` | virus: mosaik, PLRV, PSTVd, retak PVY | **daun + umbi** | 6.565 | CC BY 4.0 | sebagian |
| `KEN-08-umbi-augmentasi-mendeley` | 6 kelas umbi, seluruhnya augmentasi | **umbi** | 138.000 | CC BY 4.0 | terverifikasi |
| `KEN-11-foliar-yolov8-zenodo` | 4 kelas daun berlabel kotak YOLOv8 | daun | 3.060 | **CC BY-NC 4.0** | terverifikasi |
| `KEN-16-pldd-up-lb-mendeley` | **hawar daun lapangan asli** (hanya kelas LB) | daun | **6.116** (6.069 unik) | CC BY 4.0 | terverifikasi |
| `KEN-15-stagewise-hawar-zenodo` | citra lapangan asli, **tanpa label** | daun | 1.561 (**1.544 unik**) | CC BY 4.0 | terverifikasi |
| `KEN-03-daun-kentang-mendeley` | 6 kelas daun (BARI Bangladesh) | daun | 2.351 | CC BY 4.0 | sebagian |
| `KEN-06-cip-hawar-genebank` | keparahan hawar + AUDPC (tabular) | — | 1.517 baris | CC BY 4.0 | terverifikasi |
| `KEN-07-cip-hawar-lbhtc2` | keparahan hawar + AUDPC (tabular) | — | 5.808 baris | CC BY 4.0 | terverifikasi |
| `KEN-09-cip-pengelolaan-terpadu` | uji fungisida ↔ AUDPC ↔ hasil (tabular) | — | 309 baris | **tidak dinyatakan** | terverifikasi |
| `KEN-14-fenotip-multitahun-zenodo` | hawar + virus + **Rhizoctonia** (Vietnam) | — | 426 baris | CC BY 4.0 | terverifikasi |

### Mana yang dipakai untuk apa

- **Diagnosis penyakit umbi bernama patogen** → `KEN-01` (satu-satunya dengan 10 kelas patogen).
- **Penapisan/grading mutu umbi (baik vs cacat)** → `KEN-10` (36.000 citra, split bawaan bersih).
  Jangan tertukar: KEN-10 **tidak** berlabel patogen.
- **Latih detektor daun langsung tanpa anotasi** → `KEN-11` (YOLOv8 siap pakai; **non-komersial**).
- **Citra hawar daun lapangan asli berlabel** → `KEN-16` (6.069 unik). Hanya satu kelas,
  jadi perlu kelas pembanding dari dataset lain.
- **Korpus citra daun lapangan asli untuk dianotasi sendiri** → `KEN-15` (1.544 unik, tanpa label).
- **Epidemiologi & ketahanan varietas** → `KEN-06`, `KEN-07`, `KEN-09`, `KEN-14`.
- **Rujukan visual gangren & busuk akar ungu** → `KEN-08` (hanya rujukan, bukan data latih).

## Rujukan silang — dataset kentang yang tinggal di luar direktori ini

Dataset multi-tanaman (≥3 tanaman) disimpan di `datasets/additional/` sesuai
`KETENTUAN.md` bagian 3, tetapi **memuat kelas kentang** dan relevan untuk tanaman ini:

### PlantDoc — milik agen kentang (KETENTUAN bagian 4)

- **`datasets/additional/KEN-04-plantdoc-lapangan`** — varian **klasifikasi**
  (Cropped-PlantDoc). 2.579 gambar, 28 kelas, 13 spesies, CC BY 4.0.
  **Kentang: 222 gambar dalam 2 kelas** — `Potato leaf early blight` (117),
  `Potato leaf late blight` (105). **Tidak ada kelas kentang sehat.**
  **Tomat: 746 gambar dalam 9 kelas.**

- **`datasets/additional/KEN-05-plantdoc-deteksi-objek`** — varian **deteksi objek**
  berkotak-batas. 2.594 gambar, 8.921 kotak, CC BY 4.0.
  Anotasi **ikut**, dua format: PASCAL VOC XML per gambar + `train_labels.csv`/`test_labels.csv`
  (`filename,width,height,class,xmin,ymin,xmax,ymax`).
  **Kentang: 594 kotak dalam 3 kelas** — di sini **ada** kelas sehat `Potato leaf`
  (11 kotak, hanya di `train`), yang tidak ada di varian klasifikasi.
  **Tomat: 2.932 kotak dalam 9 kelas.**

Nilai PlantDoc bagi kentang bukan pada jumlah (222 gambar itu sedikit), melainkan pada
**jenis citranya**: foto lapangan/internet berlatar ramai. Ini pelengkap langsung
PlantVillage yang berlatar studio seragam, dan berfungsi sebagai **tolok ukur** untuk
mengukur seberapa jauh model jatuh saat pindah dari studio ke kebun.

> **Jangan mencampur KEN-04 dan KEN-05 dalam satu split latih/uji** — gambarnya sebagian
> besar bertumpang tindih.

### PlantVillage — milik agen tomat

`datasets/additional/TOM-01-plantvillage` (klaim `TOM-01-plantvillage`).
Memuat kelas kentang: Potato early blight, Potato late blight, **Potato healthy**.
Tidak diunduh ulang oleh agen kentang sesuai aturan anti-duplikasi.
**Ini satu-satunya sumber kelas kentang sehat berjumlah memadai dalam seluruh panen bersama** —
KEN-04 tidak punya sama sekali dan KEN-05 hanya 11 kotak.

### Pota-Toma-To / AgroGuard — milik agen tomat

`datasets/priority/tomat/TOM-09-agroguard-kentang-tomat` (DOI `10.17632/354fsxwccb.1`).
Dataset **kentang + tomat**. Periksa direktori agen tomat sebelum menyimpulkan cakupan
daun kentang kurang.

## Peringatan pemakaian yang berlaku untuk beberapa dataset di sini

1. **Augmentasi tanpa induk.** KEN-03 (100% berawalan `aug_`), KEN-08 (100% augmentasi,
   nol citra asli), dan dua zip kecil KEN-02 (tepat 1.080/kelas) tidak menyertakan pemetaan
   turunan→induk. **Split acak per berkas akan bocor lintas latih/uji.**
2. **Citra asli tetap minoritas, meski basisnya menebal.** Dari 197.716 gambar kentang yang
   diunduh, **14.885 asli terverifikasi** (7,5%) — naik 3,5x dari 4.212 di putaran awal.
   Potong 2.152 duplikasi PlantVillage di dalam KEN-11 → **12.733** unik; potong juga 92
   pasangan KEN-16 yang mungkin foto sama pada dua ukuran → **12.641**. KEN-08 sendirian
   menyumbang 138.000 citra sintetis. Jangan membaca "jumlah gambar" mentah-mentah.
3. **KEN-10 provenansnya tak terverifikasi.** Uji nama berkas bersih (0 tumpang tindih antar
   split), tetapi penomoran ulang menghapus provenans dan penerbit menggabungkan beberapa
   sumber publik — kalau augmentasi diterapkan sebelum split, kebocoran tidak akan terdeteksi.
   Tumpang tindih dengan KEN-01/KEN-08 juga tidak dapat dikesampingkan.
4. **Lisensi**: `KEN-09` **tidak menyatakan lisensi** (penerbitan ulang berisiko);
   **`KEN-11` CC BY-NC 4.0** — tidak boleh dipakai bila produk turunannya komersial.
   Perhatikan juga `data.yaml` KEN-11 menulis `license: Private`, yang bercanggah dengan
   pernyataan Zenodo; yang mengikat adalah Zenodo (CC BY-NC 4.0).
5. **Kelas yang bukan penyakit**: `Blackspot Bruising` (KEN-01), `cut` (KEN-08), dan seluruh
   kelas `Defectuoso` (KEN-10) adalah kerusakan mekanis/fisiologis yang dicampur dengan
   pembusukan; `Miscellaneous` (KEN-01) tidak terdefinisi.
6. **Duplikat internal ditemukan lewat SHA-256 per gambar**: KEN-15 punya 17 pasang berkas
   identik (1.561 → **1.544** unik); KEN-16 punya 47 berkas berlebih (6.116 → **6.069** unik).
   Uji irisan hash antara KEN-16, KEN-15, dan PlantVillage: **0 hash bersama** di semua pasangan.
7. **KEN-16 hanya satu kelas** (LB). `EB.zip` dan `Healthy.zip` tidak diunduh karena dataset
   penuhnya 8,77 GB — jadi KEN-16 tidak bisa melatih pengklasifikasi sendirian. Klaim penerbit
   "original resolutions" juga tidak akurat: 975 gambar (15,9%) berukuran tepat 224x224.
8. **KEN-15 tidak berlabel.** 1.561 citra lapangan asli, tetapi label kelas, anotasi kotak,
   dan manifes split tidak disertakan — harus dianotasi ulang dari nol.
