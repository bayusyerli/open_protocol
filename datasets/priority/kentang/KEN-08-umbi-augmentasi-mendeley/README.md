# Potato Crop Disease Augmentation Dataset

- **dataset_id**: KEN-08-umbi-augmentasi-mendeley
- **Tanaman**: Kentang (*Solanum tuberosum*) — **umbi**
- **Penyakit/kelas tercakup**: `common_scab` (kudis, *Streptomyces scabies*), `cut` (luka mekanis,
  bukan penyakit), `dry_rot` (busuk kering, *Fusarium* spp.), `gangrene` (gangren,
  *Boeremia foveata* / *Phoma foveata*), `healthy`, `violet_root_rot` (busuk akar ungu,
  *Helicobasidium purpureum*) — masing-masing **23.000 gambar**
- **Jenis data**: gambar
- **Format**: JPG dalam satu ZIP
- **Jumlah**: **138.000 gambar** (23.000 x 6 kelas, seimbang sempurna) — **semuanya augmentasi**
- **Sumber**: Mendeley Data
- **URL sumber**: https://data.mendeley.com/datasets/2rsrxwck2r/1
- **DOI**: 10.17632/2rsrxwck2r.1
- **Pembuat**: (tidak dirinci pada rekaman Mendeley)
- **Tahun terbit / pembaruan**: 2025-01-20 (versi 1)
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: sebut sumber, DOI, dan lisensi; nyatakan bila ada perubahan.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 742.827.034 byte (708,4 MB)
- **SHA-256**: `1f135d7c1774950389bc71eaf93a944b33ee4e79cff0c8abfe511d57f602515e`
- **Status unduh**: diunduh
- **Status verifikasi**: terverifikasi
- **Cara verifikasi**:
  - `file -b raw/*.zip` → `Zip archive data, at least v2.0 to extract, compression method=store`
  - `unzip -tqq raw/*.zip` → lolos tanpa CRC error
  - `unzip -l | grep -icE '\.(jpg|jpeg|png)$'` → **138.000**
  - cacah per kelas (`awk -F/ '{print $2}'`) → 23.000 untuk keenam kelas
  - cacah per jenis augmentasi (`awk -F/ '{print $3}'`) → 10 jenis, lihat `struktur.txt`
  - **uji citra asli**: `awk -F/ 'NF==3'` (berkas langsung di bawah folder kelas) → **0 berkas**
- **Keterbatasan / masalah kualitas**:
  - **NOL citra asli.** Struktur direktorinya
    `augmented_potato/<kelas>/<jenis_augmentasi>/<n>.jpg` — setiap berkas berada di dalam
    folder jenis augmentasi, dan tidak ada satu pun berkas pada kedalaman induk. Tidak ada
    pemetaan turunan→induk. Ini membuat dataset **tidak bisa dipakai untuk evaluasi jujur**:
    berapa pun akurasi yang diperoleh, tidak ada satu citra nyata pun untuk mengujinya.
  - Cacah 23.000 per kelas yang seragam sempurna mustahil berasal dari pemotretan lapangan;
    jumlah induk sebenarnya tidak dinyatakan di mana pun dan diduga sangat kecil
    (10 jenis augmentasi x banyak varian per induk).
  - **Rasio nilai terhadap ukuran paling buruk dalam panen ini**: 708 MB untuk nol informasi
    baru yang tidak bisa dihasilkan ulang sendiri dari citra induk — seandainya induknya ada.
  - Kelas `cut` adalah kerusakan mekanis, bukan penyakit patogenik. Jangan dicampur ke label
    patogen saat membangun basis pengetahuan.
  - Beberapa jenis augmentasi merusak sinyal diagnostik: `Random_Hue` dan
    `Color_Intensity_Modifications` (42.000 gambar, 30% dataset) mengubah warna, padahal
    **warna adalah ciri pembeda utama** antara busuk kering, gangren, dan busuk akar ungu.
    `Super_Resolution` (6.000) menciptakan detail tekstur yang tidak ada pada citra asli —
    berbahaya untuk kudis umbi yang dibedakan justru oleh tekstur permukaan.
  - Tidak ada metadata varietas, lokasi, tahun, atau konfirmasi laboratorium patogen.

## Mengapa tetap diunduh

Meski cacatnya berat, dataset ini menutup **dua penyakit umbi yang tidak ada di dataset lain
mana pun dalam panen ini**: **gangren** (*Boeremia foveata*) dan **busuk akar ungu**
(*Helicobasidium purpureum*). KEN-01 (PotatoCare) memuat kudis, busuk kering, black scurf,
blackleg, busuk lunak, busuk merah muda, dan busuk coklat — tetapi tidak keduanya ini.

**Cara pakai yang disarankan**: ambil sebagai sumber *rujukan visual* untuk basis pengetahuan
(seperti apa rupa gangren pada umbi), **bukan** sebagai data latih atau data uji. Untuk
pelatihan, gunakan KEN-01 dan KEN-02 yang punya citra asli.
