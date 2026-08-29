# PotatoCare: Deep learning based potato disease dataset

- **dataset_id**: KEN-01-potatocare-umbi-mendeley
- **Tanaman**: Kentang (*Solanum tuberosum*) — organ **umbi**, bukan daun
- **Penyakit/kelas tercakup**: `Black Scurf` (49), `Blackleg` (60), `Blackspot Bruising` (770),
  `Brown Rot` (105), `Common Scab` (60), `Dry Rot` (1.355), `Healthy Potatoes` (815),
  `Miscellaneous` (74), `Pink Rot` (57), `Soft Rot` (560) — nama kelas apa adanya dari arsip
- **Jenis data**: gambar
- **Format**: JPG/PNG dalam satu ZIP
- **Jumlah**: diklaim 10.117, terhitung **3.905**
- **Sumber**: Mendeley Data
- **URL sumber**: https://data.mendeley.com/datasets/7vm7xskfg4/2
- **DOI**: 10.17632/7vm7xskfg4.2
- **Pembuat**: Samiul Islam; Tanzila Afrin
- **Tahun terbit / pembaruan**: 2025-04-25 (versi 2)
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: wajib menyebut pembuat, sumber (Mendeley Data), DOI, dan lisensi;
  perubahan pada data harus dinyatakan. Penerbitan ulang diizinkan.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 94.618.508 byte (90,2 MB)
- **SHA-256**: `51efd54088740b2215ce5afacbc3ca4c403b38083d353fcf409a40384a6049cc`
- **Status unduh**: diunduh
- **Status verifikasi**: sebagian
- **Cara verifikasi**:
  - `file -b raw/*.zip` → `Zip archive data, at least v2.0 to extract, compression method=deflate`
  - `unzip -tqq raw/*.zip` → lolos, tidak ada CRC error
  - `unzip -l raw/*.zip | grep -icE '\.(jpg|jpeg|png)$'` → **3.905** gambar
  - cacah per kelas lewat `awk -F/` atas daftar isi arsip → lihat `struktur.txt`
- **Keterbatasan / masalah kualitas**:
  - **Selisih cacah**: deskripsi penerbit menyebut 10.117 gambar, arsip hanya berisi 3.905.
    Namun rincian per kelas yang ditulis penerbit (jumlah 3.891) cocok dengan isi arsip
    (selisih kecil: Blackleg 60 vs 47, Miscellaneous 74 vs 73). Angka 10.117 hampir pasti
    hitungan pascaaugmentasi yang tidak ikut diterbitkan. Karena itu statusnya `sebagian`.
  - **Ketidakseimbangan kelas ekstrem**: Dry Rot 1.355 lawan Black Scurf 49 — nisbah 28:1.
    Justru kelas terpenting untuk Indonesia (Common Scab 60, Black Scurf 49) yang paling tipis.
  - **Asal gambar campuran**: penerbit menyatakan dataset "compiled from various sources and
    merged". Tidak ada berkas provenans per gambar, sehingga asal, hak cipta per gambar, dan
    kemungkinan tumpang tindih dengan dataset lain **tidak dapat ditelusuri**. Ini risiko nyata
    bila hasil latihnya dipublikasikan.
  - Kelas `Miscellaneous` (74) tidak terdefinisi — bukan penyakit, bukan sehat.
  - `Blackspot Bruising` adalah kerusakan mekanis/fisiologis, bukan penyakit patogenik;
    jangan dicampur ke label patogen saat membangun basis pengetahuan.
  - Tidak ada metadata lokasi, varietas, tahun, maupun konfirmasi laboratorium patogen.
    Label semata-mata visual.
  - Bukan tanaman/kondisi Indonesia; latar dan pencahayaan bervariasi karena sumber campuran.

## Mengapa dataset ini penting

Ini satu-satunya dataset dalam panen ini yang menutup sisi **umbi** secara luas: busuk kering
(*Fusarium*), busuk basah/lunak (*Pectobacterium*), kudis/common scab (*Streptomyces scabies*),
black scurf (*Rhizoctonia solani*), blackleg, busuk merah muda (*Phytophthora erythroseptica*),
dan busuk coklat (*Ralstonia solanacearum*). Dataset kentang arus utama (PlantVillage, PlantDoc,
dan hampir semua turunan "potato leaf disease") hanya memuat **daun**, dan hampir seluruhnya
hanya early blight + late blight. Lihat `datasets/reports/agen-kentang.md` bagian celah data.
