# Hybrid Potato Tuber Dataset (Solanum tuberosum, Solanum phureja)

- **dataset_id**: KEN-10-hybrid-tuber-zenodo
- **Tanaman**: Kentang (*Solanum tuberosum* dan *Solanum phureja*) — **umbi**
- **Penyakit/kelas tercakup**: dua kelas tingkat atas — `Buen estado` (kondisi baik, 18.000) dan
  `Defectuoso` (cacat, 18.000). Penerbit merinci kelas cacat mencakup tiga subkategori:
  **luka permukaan**, **umbi bertunas**, dan **umbi busuk** — tetapi subkategori itu
  **tidak terwujud sebagai direktori** di dalam arsip.
- **Jenis data**: gambar
- **Format**: JPG 224x224 dalam ZIP, sudah terbagi `train/` `val/` `test/`
- **Jumlah**: **36.000 gambar — sama persis dengan klaim penerbit**
  (train 23.040 · test 7.200 · val 5.760)
- **Sumber**: Zenodo
- **URL sumber**: https://zenodo.org/records/20616990
- **DOI**: 10.5281/zenodo.20616990 (versi ini: 10.5281/zenodo.20616991)
- **Pembuat**: Armijos-Sarango, Cristian (Universidad Nacional de Loja, Ekuador)
- **Tahun terbit / pembaruan**: 2026-06-09
- **Lisensi**: CC BY 4.0
- **Ketentuan atribusi**: sebut pembuat, DOI, dan lisensi CC BY 4.0; nyatakan bila ada perubahan.
- **Tanggal akses**: 2026-08-25
- **Ukuran berkas**: 191.748.474 byte (182,9 MB)
- **SHA-256**: `25db7ce6a0db2ec433e732c7d712eaf262c48f69946dcfdc423bbb646bb7691d`
- **Status unduh**: diunduh
- **Status verifikasi**: **terverifikasi**
- **Cara verifikasi**:
  - `file -b raw/*.zip` → `Zip archive data, at least v1.0 to extract, compression method=store`
  - `unzip -tqq raw/*.zip` → lolos tanpa CRC error
  - **`md5 -q raw/*.zip` → `468ed3a9e2e9e1c509cd38e0f42282a9`, COCOK dengan checksum yang
    diterbitkan Zenodo** (`md5:468ed3a9e2e9e1c509cd38e0f42282a9`). Berkasnya identik
    dengan yang dideposit.
  - `unzip -l | grep -icE '\.(jpg|jpeg|png)$'` → **36.000**, sama persis dengan klaim
  - uji kebocoran: seluruh 36.000 nama berkas dikelompokkan menurut nama dasar →
    **0 nama muncul di lebih dari satu split**; indeks tiap kelas 1..18.000 tanpa lubang
- **Keterbatasan / masalah kualitas**:
  - **Hanya dua kelas biner.** Subkategori cacat (luka / bertunas / busuk) yang disebut
    penerbit **tidak ada sebagai label** — semuanya dilebur ke `Defectuoso`. Jadi dataset ini
    **tidak bisa membedakan busuk dari umbi bertunas**, padahal itu pembedaan yang penting
    secara agronomis (busuk = patogen; bertunas = masalah penyimpanan).
  - **Bukan dataset penyakit dalam arti sempit.** `Defectuoso` mencampur kerusakan mekanis,
    masalah fisiologis penyimpanan, dan pembusukan patogenik. Untuk basis pengetahuan
    penyakit, ini **tidak bisa dipetakan ke nama patogen mana pun**.
  - **Provenans per gambar terhapus.** Penomoran ulang rapat 1..18.000 per kelas dan
    pernyataan penerbit bahwa dataset ini *"incorporating multiple public potato datasets"*
    berarti ini himpunan **gabungan** dari beberapa sumber publik. Konsekuensinya:
    - hak cipta per gambar tidak dapat ditelusuri;
    - **kemungkinan tumpang tindih dengan KEN-01 / KEN-08 tidak dapat dikesampingkan**;
    - **tidak dapat dipastikan apakah augmentasi diterapkan sebelum pemisahan split.**
      Kalau ya, turunan dari satu umbi bisa jatuh di train dan test sekaligus, dan uji nama
      berkas yang dilakukan di sini **tidak akan mendeteksinya**.
  - **Sudah diperkecil ke 224x224** (rerata 5,2 KB/berkas). Detail tekstur halus — justru ciri
    pembeda kudis dan black scurf — kemungkinan besar sudah hilang. Tidak cocok untuk tugas
    yang menuntut resolusi.
  - Keseimbangan 18.000/18.000 yang sempurna bukan sifat alami; ini hasil penyetaraan sengaja.
  - Asal Ekuador (Loja); *S. phureja* adalah kentang Andes, bukan jenis yang ditanam di Indonesia.

## Nilai

Ini **dataset umbi terbesar dalam panen ini menurut jumlah gambar** (36.000, sepuluh kali
lipat KEN-01) dan satu-satunya yang datang dengan **split train/val/test bawaan yang bersih**
serta checksum penerbit yang bisa dicocokkan.

Namun perhatikan pembagian peran: **KEN-01 tetap sumber utama untuk diagnosis penyakit umbi**
karena punya 10 kelas bernama patogen. KEN-10 unggul untuk tugas **penapisan biner mutu umbi**
(baik vs cacat) — yaitu sortasi/grading, bukan diagnosis.
