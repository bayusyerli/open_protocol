# Wikidata — relasi patogen/hama ↔ inang (P2975) untuk 4 komoditas prioritas

- **dataset_id**: BWM-09-wikidata-patogen-inang
- **Tanaman**: *Allium cepa*, *Allium ascalonicum* (bawang merah), *Capsicum annuum*, *Capsicum frutescens*, *Solanum lycopersicum*, *Solanum tuberosum* (+ *Allium cepa* var. *aggregatum* diminta tapi **nihil**)
- **Penyakit/kelas tercakup**: **271 organisme unik** yang di Wikidata dinyatakan punya salah satu dari keenam tanaman itu sebagai inang. Termasuk *Alternaria solani*, *Fusarium oxysporum* (+ f.sp. *lycopersici*), *Stemphylium lycopersici*/*solani*, *Colletotrichum gloeosporioides*/*coccodes*, *Ralstonia solanacearum*, *Phytophthora capsici*/*cryptogea*, 7 *Spodoptera*, 4 *Liriomyza*.
- **Jenis data**: tabular
- **Format**: CSV + JSON (respons SPARQL asli, keduanya disimpan)
- **Jumlah**: **291 baris**, 271 patogen unik. Kolom: `pathogen, pathogenLabel, host, hostLabel, hostName`
  | Inang | Baris |
  |---|---|
  | *Solanum lycopersicum* (tomat) | 136 |
  | *Solanum tuberosum* (kentang) | 133 |
  | *Capsicum frutescens* | 10 |
  | ***Allium ascalonicum* (bawang merah)** | **8** |
  | *Capsicum annuum* (cabai) | 3 |
  | *Allium cepa* | **1** |
  | *Allium cepa* var. *aggregatum* | **0** |
- **Sumber**: Wikidata Query Service (WDQS)
- **URL sumber**: https://query.wikidata.org/sparql
- **DOI**: tidak ada
- **Pembuat**: komunitas Wikidata / Wikimedia Foundation
- **Tahun terbit / pembaruan**: basis data hidup; snapshot 2026-08-25
- **Lisensi**: **CC0 1.0 (domain publik)** — lisensi paling bersih di seluruh koleksi ini. Boleh diterbitkan ulang tanpa syarat.
- **Ketentuan atribusi**: tidak diwajibkan oleh CC0. Sebagai praktik baik: "Wikidata, diakses 25 Agustus 2026, CC0".
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 203 KB (CSV 37.167 B + JSON 166.753 B)
- **SHA-256**: lihat `SHA256SUMS.txt`
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**: kueri SPARQL persis + seluruh keluaran ada di `struktur.txt`. Perintah:
  - `curl -sG -H 'Accept: text/csv' --data-urlencode "query=<SPARQL>" https://query.wikidata.org/sparql` → `200`, `text/csv;charset=utf-8`, 37.167 B
  - Versi JSON diambil terpisah dengan `Accept: application/sparql-results+json` → `200`
  - **Cek silang**: JSON berisi **291 binding**, CSV berisi **291 baris data** → **cocok**
  - `file raw/*` → `CSV text` dan `JSON data` (tipe cocok dengan nama)
  - `python3` modul `csv` + `json`: cacah per inang, daftar lengkap patogen *Allium ascalonicum*, pencarian genus sasaran
  - `shasum -a 256 raw/*` → `SHA256SUMS.txt`
  - **Tanpa akun.** WDQS melayani permintaan tanpa header `User-Agent` khusus sekalipun.
  - **Catatan jebakan**: meminta `format=csv` lewat parameter kueri **tidak dihormati** kalau header `Accept` menyebut hal lain — permintaan pertama mengembalikan `application/sparql-results+xml` walau namanya `.csv`. Berkas salah tipe itu dibuang dan diambil ulang dengan `Accept: text/csv` saja. `file` menangkap kesalahan ini.
- **Keterbatasan / masalah kualitas**:
  1. **Cakupan bawang merah nyaris nihil, dan yang ada pun salah jenis.** Hanya **8 baris** untuk *Allium ascalonicum* dan **1** untuk *Allium cepa*. Kedelapan-delapannya **serangga Lepidoptera** (*Blastobasis*, *Cadra cautella*, *Dasyses rugosella*, ngengat bawang/leek moth, *Spodoptera litura*, *Utetheisa pulchella*, beet armyworm/*S. exigua*). **Tidak ada satu pun jamur, bakteri, atau virus.**
  2. **Patogen utama bawang merah sama sekali tidak ada**, dicek per genus di seluruh hasil:
     - *Peronospora* → **0 hasil** (embun bulu tidak ada)
     - *Botrytis* → **0 hasil** (busuk umbi tidak ada)
     - *Alternaria* → hanya *A. solani* dan *A. tomato*; ***Alternaria porri* (trotol) TIDAK ADA**
     - *Fusarium* → ada f.sp. *lycopersici* (tomat), **bukan** f.sp. *cepae* (moler)
     - *Stemphylium* → hanya *S. lycopersici* dan *S. solani*; ***S. vesicarium* TIDAK ADA**
     - *Bemisia* → **0 hasil** (kutu kebul tidak ada, padahal vektor virus utama cabai/tomat)
  3. **Bias berat ke Solanaceae dan ke serangga.** Tomat + kentang menyumbang **269 dari 291 baris (92%)**. Cabai hanya 13. Sesuai peringatan: kekuatan Wikidata ada pada Lepidoptera–kentang, bukan patogen jamur Allium.
  4. **Sinonim taksonomi memecah data.** *Allium ascalonicum*, *Allium cepa*, dan *Allium cepa* var. *aggregatum* diperlakukan sebagai tiga entitas berbeda; yang terakhir mengembalikan **0**. Bawang merah karena itu tersebar/hilang tergantung nama yang dipakai.
  5. **Label campur bahasa dan tidak konsisten.** `SERVICE wikibase:label` dengan `"en,id"` mengembalikan campuran nama ilmiah dan nama umum Inggris ("Leek moth", "beet armyworm") di kolom yang sama. Label Indonesia praktis tidak ada.
  6. **P2975 "host" tidak membedakan peran.** Tidak ada pemisahan patogen / hama / inang alternatif / vektor, dan tidak ada tingkat kepentingan (major/minor) seperti EPPO. Hubungan genus dan spesies bercampur (mis. `Blastobasis` genus berdampingan dengan `Blastobasis ochromorpha`).
  7. **Tidak ada geografi dan tidak ada waktu** — tidak bisa dipakai untuk epidemiologi maupun peta risiko Indonesia.
  8. **Tidak ada sitasi per pernyataan** pada hasil kueri ini; rujukan ada di tingkat pernyataan Wikidata dan harus diambil terpisah.
  9. **Tidak ada data pribadi.**

**Kesimpulan pemakaian**: berguna sebagai lapis pelengkap CC0 untuk **tomat dan kentang**, dan sebagai sumber tautan identitas (QID) lintas basis data. **Tidak berguna untuk bawang merah** — untuk itu andalkan `BWM-08` (GloBI) dan `BWM-05` (EPPO).

## Catatan lintas-agen

269 dari 291 baris melayani **tomat dan kentang**; 13 melayani **cabai**. Agen tomat & kentang silakan merujuk `datasets/additional/BWM-09-wikidata-patogen-inang/raw/` — lisensinya CC0, bebas dipakai ulang.
