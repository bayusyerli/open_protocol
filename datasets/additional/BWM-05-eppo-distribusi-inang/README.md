# EPPO Global Database — tabel distribusi geografis & daftar tanaman inang (CSV)

- **dataset_id**: BWM-05-eppo-distribusi-inang
- **Tanaman**: lintas komoditas — tabel inang memuat *Allium cepa*, ***Allium ascalonicum*** (bawang merah), *Capsicum annuum* (cabai), *Solanum lycopersicum* (tomat), *Solanum tuberosum* (kentang), dan ratusan inang lain
- **Penyakit/kelas tercakup**: 8 OPT, dengan kode EPPO apa adanya:
  | Kode EPPO | Organisme | distribusi | inang |
  |---|---|---|---|
  | `PLEOAL` | *Stemphylium vesicarium* (teleomorf *Pleospora allii*) — hawar daun bawang | ✔ 114 baris | — |
  | `PHYTIN` | *Phytophthora infestans* — busuk daun kentang/tomat | — | ✔ 1 baris |
  | `LIRIHU` | *Liriomyza huidobrensis* — lalat pengorok daun | ✔ 143 | ✔ 290 |
  | `LIRISA` | *Liriomyza sativae* — lalat pengorok daun | ✔ 167 | ✔ 75 |
  | `LIRITR` | *Liriomyza trifolii* — lalat pengorok daun | ✔ 201 | ✔ 102 |
  | `OYDV00` | *Onion yellow dwarf virus* (kini *Potyvirus cepae*) — OYDV | ✔ 77 | ✔ 17 |
  | `BEMITA` | *Bemisia tabaci* — kutu kebul, vektor virus | ✔ 307 | ✔ 61 |
  | `RALSSL` | *Ralstonia solanacearum* — layu bakteri | ✔ 172 | ✔ 76 |
- **Jenis data**: tabular
- **Format**: CSV (14 berkas), UTF-8 dengan BOM
- **Jumlah**: **1.803 baris data** (di luar header) dalam 14 berkas
  - 7 berkas `distribution_*.csv` — kolom: `continent, country, state, country code, state code, Status`
  - 7 berkas `hosts_*.csv` — kolom: `type, EPPOCode, Pref_name, References`
- **Sumber**: EPPO Global Database (European and Mediterranean Plant Protection Organization)
- **URL sumber**: https://gd.eppo.int/taxon/ — pola unduh
  `https://gd.eppo.int/taxon/<KODE>/download/distribution_csv` dan `.../download/hosts_csv`
- **DOI**: tidak ada
- **Pembuat**: EPPO Secretariat, Paris
- **Tahun terbit / pembaruan**: basis data hidup, diperbarui terus-menerus; snapshot diambil 2026-08-25
- **Lisensi**: **tidak dinyatakan**. `gd.eppo.int/termsofuse` dan `/terms` sama-sama mengembalikan 404; tidak ada pernyataan lisensi yang bisa dibaca mesin. Berkasnya terbuka publik tanpa login. **Penerbitan ulang isi utuhnya berisiko** — pakai sebagai rujukan internal, dan untuk publikasi cukup tautkan ke halaman taxon EPPO.
- **Ketentuan atribusi**: "EPPO (2026) EPPO Global Database. https://gd.eppo.int" + tanggal akses.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 392 KB total (terbesar `hosts_LIRIHU.csv` 191.545 byte)
- **SHA-256**: lihat `SHA256SUMS.txt`
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**: keluaran lengkap di `struktur.txt`. Perintah persis:
  - `curl -sL --max-time 90 -A 'Mozilla/5.0' -o <out> -w '%{http_code}' 'https://gd.eppo.int/taxon/<KODE>/download/<distribution|hosts>_csv'` — 14 respons `200`, 14 lainnya `404` (dihapus, tidak disimpan sebagai berkas kosong)
  - `file raw/*.csv` → `CSV text` untuk 13 berkas, `ASCII text, with very long lines` untuk `hosts_PHYTIN.csv` (isinya memang satu baris dengan daftar pustaka panjang) — **tidak ada** HTML tersamar sebagai CSV
  - `python3` modul `csv`: baca header tiap berkas, cacah baris, hitung sebaran nilai `Status` / `type`, lalu **saring baris Indonesia** dan **saring inang yang cocok dengan 4 komoditas prioritas**. Contoh hasil nyata:
    - `distribution_OYDV00.csv` → 4 baris Indonesia: `ID` (Present, no details), Java, Irian Jaya, Nusa Tenggara
    - `distribution_BEMITA.csv` → 4 baris Indonesia: `ID` restricted, Java, Sulawesi, Sumatra
    - `hosts_OYDV00.csv` → 17 dari 17 barisnya adalah *Allium*, termasuk `ALLCE Allium cepa`
    - `hosts_LIRIHU.csv` → memuat `ALLAS Allium ascalonicum` (bawang merah) secara eksplisit, bersama 7 *Allium* lain
  - `shasum -a 256 raw/*` → `SHA256SUMS.txt`
- **Keterbatasan / masalah kualitas**:
  1. **Lubang cakupan justru di patogen yang paling penting untuk bawang merah.** EPPO hanya menyimpan tabel distribusi/inang untuk OPT yang **masuk daftar karantina**. Empat patogen endemik utama bawang merah **tidak punya tabel sama sekali** (semua mengembalikan HTTP 404, dicek untuk kedua jenis tabel):
     - `ALTEPO` *Alternaria porri* (bercak ungu / **trotol**) — 404
     - `PERODE` *Peronospora destructor* (embun bulu) — 404
     - `FUSACE` *Fusarium oxysporum* f.sp. *cepae* (**moler**) — 404
     - `BOTRAL` *Botrytis allii* (busuk umbi/leher) — 404
     - `LAPHEG` *Spodoptera exigua* (ulat bawang) — 404
     - `COLLGL` *Colletotrichum gloeosporioides* (antraknosa/"otomatis") — 404

     Ini **lubang cakupan, bukan pembatasan akses** — halaman taxon-nya ada, tabelnya yang tidak. Jadi untuk 6 OPT terpenting bawang merah Indonesia, EPPO tidak memberi apa pun yang bisa diunduh.
  2. **Dua jebakan kode yang mudah salah** dan sudah diverifikasi di sini:
     - *Spodoptera exigua* = `LAPHEG`. Kode `LAPHEX` adalah ***Spodoptera exempta***, spesies lain.
     - *Stemphylium vesicarium* tersimpan di bawah kode teleomorfnya `PLEOAL` (*Pleospora allii*); `STEMVE` mengembalikan 404.
  3. **Granularitas Indonesia kasar dan tidak konsisten.** Yang tersedia hanya tingkat pulau (`Java`, `Sumatra`, `Sulawesi`, `Nusa Tenggara`, `Irian Jaya`) — **tidak ada provinsi, apalagi kabupaten**. Nama `Irian Jaya` juga sudah usang (kini Papua). Tidak bisa dipakai untuk peta risiko tingkat kabupaten.
  4. **Tidak ada dimensi waktu.** Kolomnya hanya status kini (`Present, widespread` / `Absent, confirmed by survey` / dst.), tanpa tahun pengamatan dan tanpa deret waktu. **Tidak bisa dipakai untuk analisis epidemiologi**; ini basis pengetahuan statis.
  5. **Nilai `Status` banyak yang lemah.** `Present, no details` mendominasi (mis. 228 dari 307 baris di `distribution_BEMITA.csv`; 108 dari 114 di `PLEOAL`). Artinya kehadiran tercatat tanpa perincian sebaran. Ada pula `Absent, unreliable record` — mis. **`RALSSL` di Indonesia tercatat "Absent, unreliable record"**, padahal layu bakteri jelas ada di Indonesia; jangan dibaca sebagai bukti ketiadaan.
  6. **Kolom `References` sangat besar dan berisi teks bebas** dengan baris baru di dalam sel. `hosts_LIRIHU.csv` sendiri 191 KB untuk 290 baris — hampir seluruhnya sitasi. Parser CSV wajib menangani newline dalam sel berkutip.
  7. **`Content-Type` salah label.** Rute `_csv` mengirim header `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` padahal isinya CSV murni. Jangan percayai `Content-Type` untuk rute ini; periksa isinya.
  8. **API REST `data.eppo.int` butuh token** (`403 {"message":"You do not have sufficent rights..."}`) — tidak dipakai di sini. Yang dipakai hanya rute CSV `gd.eppo.int` yang memang terbuka tanpa akun.
  9. Pencarian di `gd.eppo.int` digerakkan JavaScript dan tidak mengembalikan hasil ke `curl` — akses harus langsung ke `/taxon/<KODE>`.
  10. **Tidak ada data pribadi** — isinya nama negara, nama takson, dan sitasi pustaka.

## Catatan lintas-agen

Berkas di sini melayani keempat komoditas prioritas, bukan hanya bawang merah:
- **kentang & tomat** → `hosts_PHYTIN.csv`, `distribution_RALSSL.csv` + `hosts_RALSSL.csv`, `hosts_LIRISA.csv` (*S. tuberosum* & *S. lycopersicum* sebagai `Major host`)
- **cabai** → `hosts_BEMITA.csv`, `hosts_RALSSL.csv`, `hosts_LIRI*.csv` (*Capsicum annuum*, *C. baccatum*, *C. chinense*)

Agen lain silakan merujuk `datasets/additional/BWM-05-eppo-distribusi-inang/raw/` — jangan unduh ulang.
