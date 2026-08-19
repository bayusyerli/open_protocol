# Sediaan Pupuk Sendiri

> Rancangan · jalur kelima · sediaan pupuk sendiri  
> Sisi yang lapang. Tujuh resep terbuka yang berada **di luar rezim pendaftaran**, kriteria pelepasannya lengkap, dan tidak menunggu apa pun untuk dirilis.  
> Data **7 resep** dari 12 · Rezim **fertilizer_like** · Prasyarat **tidak ada**  
>
> Diekstrak dari dokumen konsep HTML dengan judul sama, 20 Agustus 2026.
> Isi, angka, dan tabelnya utuh; simulasi yang bisa diklik tidak ikut —
> alurnya ditulis ulang sebagai teks.
>
> Jalur 5 dari [03-enam-pintu.md](03-enam-pintu.md). Sisi pengendalinya di [09-jalur-sediaan-pengendali.md](09-jalur-sediaan-pengendali.md); jalur yang bermuara ke sini adalah [06-jalur-hitungan-hara.md](06-jalur-hitungan-hara.md).

---

## 1. Kenapa sisi ini lapang

Untuk pupuk, kewajiban pendaftaran melekat pada **peredaran** — bukan pada membuat, dan bukan pada memakai. Petani yang mengomposkan untuk lahannya sendiri berada di luar rezim itu sepenuhnya.

| Pasal | Bunyi ringkasnya |
|---|---|
| **71 ayat (2)** | Pupuk yang **diedarkan** wajib terdaftar |
| **72 ayat (1)** | **Pupuk yang diproduksi Petani kecil dikecualikan dari pendaftaran** |
| **72 ayat (2)** | Hanya dapat diedarkan terbatas dalam satu kabupaten/kota |
| **73** | Dilarang **mengedarkan** pupuk yang tidak terdaftar atau tidak berlabel |
| **122** | Sanksi maks. 6 tahun dan Rp3 miliar — dikaitkan ke **peredaran** |

*Diambil langsung dari naskah UU 22/2019, bukan dari ringkasan pihak ketiga.*

Bandingkan dengan sisi pengendali, yang larangannya menyentuh kata *menggunakan* dan tidak punya pengecualian petani kecil sama sekali. Itulah alasan kedua sisi dipisah jadi dua jalur, bukan satu jalur dengan cabang.

---

## 2. Garis yang memisahkan, dan tempat ia mudah terlewat

Pasal 75 menentukan pestisida dari **kegunaan yang diklaim**, bukan dari bahannya. Akibatnya **satu klaim pengendalian sudah cukup** menarik seluruh sediaan ke rezim pestisida — walau fungsi lainnya murni menyuburkan.

| Sediaan | Fungsi yang diklaim | Rezimnya |
|---|---|---|
| **MOL bonggol pisang** | pemicu penguraian · merangsang pertumbuhan | `fertilizer_like` — tetap di sisi ini |
| **Biakan PGPR bambu** | merangsang pertumbuhan · **menekan penyakit** | `pesticide_like` — pindah ke jalur 6 |

*Dua sediaan yang sama-sama mengklaim merangsang pertumbuhan, tetapi jatuh di rezim berbeda.*

Yang memindahkan PGPR bukan bahannya dan bukan cara membuatnya — hanya klaim tambahan bahwa ia menekan penyakit. Karena itu layar ini menyimpan satu peringatan silang pada dua fungsi yang merentang kedua sisi: **memperbaiki tanah** dan **merangsang pertumbuhan**.

---

## 3. Simulasi

Coba **menambah hara** lalu kompos kotoran sapi untuk melihat kriteria pelepasan yang lengkap, dan **merangsang pertumbuhan** untuk sampai ke peringatan silang.

Semuanya dari kosakata

Bahan beserta perbandingannya, titik kendali proses, kriteria pelepasan, dosis, dan APD diambil apa adanya dari `spec/vocab/preparation.json`.

Kenapa jalur ini juga jadi tujuan

Jalur 3 — **hitungan hara** — bisa berakhir dengan rupiah per kg hara di luar jangkauan. Di situlah jalur ini jadi cabangnya — satu-satunya jawaban yang tidak menjual apa pun.

---

## 4. Kriteria pelepasan: uji laboratorium yang diterjemahkan

Ketujuh sediaan di sisi ini membawa `release_criteria` beserta `field_proxy` — uji yang bisa dikerjakan di kebun tanpa alat. Bagian paling berharga di kosakata ini, dan yang paling mudah terlewat.

Kompos matang

Kriteria resminya indeks perkecambahan ≥ 80%. Padanan lapangannya: *“Kecambahkan 20 benih kangkung pada rendaman kompos 1:5 dan 20 benih pada air biasa. Bila yang tumbuh pada rendaman kurang dari 16 dari 20, kompos belum matang.”* Uji laboratorium yang jadi dua gelas dan seminggu menunggu.

Yang menentukan mutu bukan lama menumpuk

Melainkan suhu tumpukan. Kompos kotoran sapi mensyaratkan di atas 55 °C ditahan 15 hari dengan 5 kali pembalikan — dan karena syarat termofilik itu terpenuhi, tenggang 90/120 hari untuk kotoran mentah tidak berlaku. Sediaan yang tidak mencapainya tetap membawa tenggang itu.

---

## 5. Batas: hara tidak bisa dihitung sampai satu batch diuji

Kompos punya kadar hara, tetapi kadarnya berbeda tiap tumpukan. Aturan `L18` menolak menghitung hara dari batch yang belum terukur.

Konsekuensinya untuk jalur 3 — hitungan hara — **kompos tidak bisa masuk kalkulatornya dengan angka**. Ia bisa masuk sebagai pos yang menunggu pengukuran, tetapi memberinya angka rujukan akan membuat seluruh perbandingan bohong. Yang bisa ditampilkan adalah biaya bahan dan tenaga, bukan harga per kg hara.

> **Yang perlu diputuskan sebelum menyambungkannya ke jalur 3**
>
> Apakah kalkulator boleh menampilkan sediaan sendiri tanpa angka hara sama sekali — sebagai pengingat bahwa ada pilihan yang tidak dibeli — atau menunggu sampai ada jalur mengukur batch. Kecondongan dokumen ini: **ditampilkan tanpa angka**, karena menyembunyikannya berarti petani yang tidak punya uang tidak melihat pilihan apa pun.

---

## 6. Prasyarat rilis

- **Tidak ada.** Ketujuh sediaan berada di luar rezim pendaftaran lewat Pasal 72, kriteria pelepasannya lengkap, dan tidak satu pun menunggu pendapat hukum. Sisi ini bisa dirilis bersama jalur 3, hitungan hara.
- **Peringatan silang wajib ikut** pada dua fungsi yang merentang kedua sisi — memperbaiki tanah dan merangsang pertumbuhan — supaya orang yang sebenarnya mencari pengendali penyakit tidak berhenti di sisi yang salah.
- **Empat bahan berstatus `restricted` membawa syaratnya sendiri:** urine ternak wajib difermentasi tertutup ≥ 7 hari; molase maksimal 0,2% pada seduhan berbahan kotoran; media serealia wajib disterilkan penuh dan media berjamur dibakar, bukan dipakai; inokulum dari alam bebas identitasnya tidak bisa dipastikan tanpa laboratorium.

---

## Alur layar

1. **Untuk apa?** Empat fungsi — menambah hara, memperbaiki tanah, mempercepat
   pengomposan, merangsang pertumbuhan. Di bawahnya satu baris yang mengingatkan
   bahwa membasmi hama atau menekan penyakit adalah rezim hukum yang lain.
2. **Yang mana?** Sediaan yang cocok, masing-masing dengan tingkat buktinya. Pada
   dua fungsi yang merentang kedua sisi — memperbaiki tanah dan merangsang
   pertumbuhan — muncul **kartu peringatan silang** ke jalur pengendali.
3. **Resep terbuka.** Kedudukan hukum lebih dulu dengan Pasal 72 tercetak apa
   adanya, lalu tingkat bukti, bahan beserta perbandingannya, proses dengan titik
   kendalinya, kriteria pelepasan, pemakaian, dan keselamatan.
4. **Kriteria pelepasan.** Kriteria resmi di kepala kartu, cara memeriksanya di
   kebun di badannya. Bila kosakata belum memuat padanan lapangan — seperti pada
   vermikompos — layar mengatakannya, bukan mengarang penggantinya.
5. **Batas hara.** Tiap resep ditutup satu blok yang menyatakan kadar haranya belum
   diketahui dan `L18` menolak menghitungnya dari batch yang belum diuji.
6. **Cabang peringatan silang.** Menjelaskan bahwa satu klaim pengendalian sudah
   cukup memindahkan sediaan, dengan MOL dan PGPR sebagai contoh berdampingan.
