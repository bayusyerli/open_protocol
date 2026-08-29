# GloBI — interaksi patogen/hama ↔ tanaman inang untuk OPT komoditas prioritas

- **dataset_id**: BWM-08-globi-interaksi-inang
- **Tanaman**: keempat komoditas prioritas muncul sebagai **inang** — *Allium cepa*, ***Allium ascalonicum*** (bawang merah), *Capsicum annuum* (cabai), *Solanum lycopersicum* (tomat), *Solanum tuberosum* (kentang) — di antara ratusan inang lain.
- **Penyakit/kelas tercakup**: 14 organisme × 3 jenis interaksi (`pathogenOf`, `hasHost`, `interactsWith`):
  *Alternaria porri*, *Alternaria solani*, *Botrytis allii*, *Bemisia tabaci*, *Colletotrichum gloeosporioides*, *Fusarium oxysporum*, *Liriomyza huidobrensis*, *L. sativae*, *L. trifolii*, *Peronospora destructor*, *Phytophthora infestans*, *Ralstonia solanacearum*, *Spodoptera exigua*, *Stemphylium vesicarium*
- **Jenis data**: tabular
- **Format**: CSV (39 berkas)
- **Jumlah**: **14.532 baris data** dalam 39 berkas. Kolom (sama untuk semua):
  `source_taxon_name, source_taxon_path, interaction_type, target_taxon_name, target_taxon_path, study_citation, study_source_citation, latitude, longitude`
- **Sumber**: Global Biotic Interactions (GloBI)
- **URL sumber**: `https://api.globalbioticinteractions.org/interaction?sourceTaxon=<nama>&interactionType=<tipe>&type=csv&fields=<9 medan>`
- **DOI**: tidak ada untuk snapshot API ini. Arsip massal GloBI ber-DOI ada di Zenodo (CC-BY-4.0 / CC0), tetapi berukuran **2,4 GB** (`interactions.tsv.gz`) dan **tidak diperlukan** — cacah per organisme di sini jauh lebih kecil.
- **Pembuat**: GloBI (Jorrit Poelen dkk.) sebagai agregator; data asal dari ratusan dataset penyumbang
- **Tahun terbit / pembaruan**: basis data hidup; snapshot 2026-08-25
- **Lisensi**: GloBI menyatakan dirinya open access dan mengagregasi dataset terbuka; arsip Zenodo-nya berlisensi **CC-BY-4.0** dan **CC0**. Untuk rute API ini **tidak ada pernyataan lisensi per-baris**, jadi dicatat sebagai **tidak dinyatakan** — dan karena kolom sitasinya kosong (lihat Keterbatasan butir 2), **asal-usul tiap baris tidak bisa ditelusuri**, sehingga penerbitan ulang berisiko.
- **Ketentuan atribusi**: "Poelen JH, Simons JD, Mungall CJ (2014) Global Biotic Interactions. https://globalbioticinteractions.org" + tanggal akses.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 6,3 MB dalam 39 berkas CSV
- **SHA-256**: lihat `SHA256SUMS.txt` (39 baris)
- **Status unduh**: diunduh
- **Status verifikasi**: sebagian
- **Cara verifikasi**: keluaran lengkap di `struktur.txt`. Perintah persis:
  - `curl -s --max-time 120 -A 'Mozilla/5.0' 'https://api.globalbioticinteractions.org/interaction?sourceTaxon=<nama>&interactionType=<tipe>&type=csv&fields=…'` — tanpa kunci API
  - Kombinasi yang mengembalikan **0 baris tidak disimpan** (semua `Liriomyza` × `pathogenOf` — serangga memang tidak berperan sebagai patogen; harus ditanyakan lewat `hasHost`/`interactsWith`). Dari 42 kombinasi, **39 berisi data**.
  - `file raw/*.csv` → `CSV text` untuk seluruh berkas
  - `python3` modul `csv`: cacah baris & target unik per berkas, saring `target_taxon_name` yang cocok dengan 4 komoditas prioritas, hitung keterisian kolom sitasi & koordinat
  - `shasum -a 256 raw/*` → `SHA256SUMS.txt`
- **Keterbatasan / masalah kualitas**:
  1. **Sembilan berkas TERPOTONG di tepat 1.024 baris** — batas halaman API yang tidak diberitahukan dan tidak dilewati di sini. Berkas terdampak: `Bemisia_tabaci__interactsWith`, `Colletotrichum_gloeosporioides__hasHost` & `__interactsWith`, `Fusarium_oxysporum__hasHost` & `__interactsWith`, `Liriomyza_trifolii__interactsWith`, `Spodoptera_exigua__interactsWith`, `Stemphylium_vesicarium__hasHost` & `__interactsWith`. Untuk kesembilan itu **daftar inangnya tidak lengkap**; jumlah sebenarnya lebih besar. Karena itu status verifikasi dataset ini `sebagian`.
  2. **Kolom provenans SELURUHNYA KOSONG — ini kelemahan terbesarnya.** Terhitung persis: `study_citation` terisi **0 dari 14.532**, `study_source_citation` **0 dari 14.532**, `latitude` **0 dari 14.532**. Parameter `fields=` menerima nama kolom itu tetapi mengembalikan nilai kosong. Akibatnya **tidak ada satu pun baris yang bisa ditelusuri ke publikasi asalnya**, dan tidak ada informasi geografis apa pun. Data ini hanya berupa pasangan takson. Untuk mendapat sitasi, gunakan `type=json.v2` (bukan `type=csv`) atau unduhan massal Zenodo.
  3. **Duplikasi berat.** Baris jauh lebih banyak daripada pasangan unik — mis. `Alternaria_porri__hasHost` punya 124 baris tetapi hanya 48 target unik; `Colletotrichum_gloeosporioides__hasHost` 1.024 baris untuk 841 target unik. `hasHost` dan `interactsWith` juga sangat tumpang tindih (`interactsWith` adalah superset). **Jangan menjumlahkan baris sebagai bukti kekuatan asosiasi** — cacah baris mencerminkan berapa kali sebuah dataset menyetorkan pasangan yang sama, bukan seberapa sering penyakit itu terjadi.
  4. **Arah relasi kadang terbalik atau longgar.** `hasHost` dan `pathogenOf` tidak konsisten dipakai antar-dataset penyumbang. Serangga (*Liriomyza*, *Spodoptera*, *Bemisia*) mengembalikan 0 di `pathogenOf` — benar secara biologis, tapi berarti kueri naif akan mengira mereka tidak punya inang.
  5. **Takson sumber sengaja dilonggarkan untuk *Fusarium*.** Yang dikueri adalah *Fusarium oxysporum* tingkat spesies, **bukan** forma specialis *cepae* (moler) — GloBI tidak memisahkan f.sp. Jadi 1.024+ baris *Fusarium oxysporum* mencakup seluruh kompleks inang lintas tanaman, dan **tidak boleh dibaca sebagai daftar inang moler bawang merah**.
  6. **Tingkat takson target campur aduk.** Ada `Allium` (genus), `Allium cepa` (spesies), dan `Allium ascalonicum` berdampingan sebagai target terpisah. Penggabungan harus dilakukan sadar-hierarki; `target_taxon_path` menyediakan jalur lengkap untuk itu.
  7. **Nama *Allium ascalonicum* sendiri bermasalah secara taksonomi** — banyak otoritas menganggapnya sinonim dari *Allium cepa* var. *aggregatum*. GloBI menyimpan keduanya terpisah, sehingga rekaman bawang merah tersebar di dua nama.
  8. **Tidak ada dimensi waktu.** Tidak bisa dipakai untuk analisis epidemiologi; ini murni basis pengetahuan asosiasi.
  9. **Tidak ada data pribadi** — isinya nama takson dan (seharusnya) sitasi.

## Nilai utamanya: menambal lubang yang ditinggalkan EPPO

Empat patogen endemik bawang merah yang **tidak punya tabel apa pun di EPPO** (semua 404 — lihat `BWM-05`) justru **ada di sini**:

| Patogen | EPPO | GloBI (baris / target unik) | *Allium ascalonicum* sebagai inang |
|---|---|---|---|
| *Alternaria porri* (trotol) | ✗ 404 | 271 / 51 | **✔ 4 baris** |
| *Peronospora destructor* (embun bulu) | ✗ 404 | 192 / 30 | **✔ 4 baris** |
| *Botrytis allii* (busuk umbi) | ✗ 404 | 76 / 13 | **✔ 4 baris** |
| *Spodoptera exigua* (ulat bawang) | ✗ 404 | 1.390 / 392 | **✔ 6 baris** |
| *Colletotrichum gloeosporioides* (antraknosa) | ✗ 404 | 2.262 / 841 | *A. cepa* 6 baris |
| *Stemphylium vesicarium* | dist. saja | 2.078 / 729 | **✔ 1 baris** |

Total **19 baris** di seluruh koleksi menyebut *Allium ascalonicum* secara eksplisit sebagai inang.
**Keempat belas organisme punya kecocokan dengan setidaknya satu komoditas prioritas** — tidak ada yang nihil.

## Catatan lintas-agen

Berkas untuk *Phytophthora infestans*, *Alternaria solani*, *Ralstonia solanacearum*, dan *Bemisia tabaci* melayani **kentang, tomat, dan cabai**. Rujuk `datasets/additional/BWM-08-globi-interaksi-inang/raw/` — jangan panen ulang.
