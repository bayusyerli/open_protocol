# Sediaan Pengendali Sendiri

> Rancangan · jalur keenam · sediaan pengendali sendiri  
> Sisi yang terikat. Lima resep yang larangannya menyentuh kata **menggunakan**, tanpa pengecualian petani kecil — dan karena itu tidak bisa dirilis sebagai anjuran sampai ada pendapat hukum.  
> Data **5 resep** dari 12 · Rezim **pesticide_like** · Prasyarat **pendapat hukum**  
>
> Diekstrak dari dokumen konsep HTML dengan judul sama, 20 Agustus 2026.
> Isi, angka, dan tabelnya utuh; simulasi yang bisa diklik tidak ikut —
> alurnya ditulis ulang sebagai teks.
>
> Jalur 6 dari [03-enam-pintu.md](03-enam-pintu.md). Sisi pupuknya di [08-jalur-sediaan-pupuk.md](08-jalur-sediaan-pupuk.md).

---

## 1. Kenapa sisi ini terikat

Untuk pestisida, larangannya tidak berhenti di peredaran. Tiga hal membedakannya dari sisi pupuk, dan ketiganya mengubah rancangan layar.

| Pasal | Bunyi ringkasnya |
|---|---|
| **75** | Definisi pestisida mencakup semua zat serta **jasad renik dan virus** untuk memberantas OPT — dan pada huruf d, bahan yang mengatur pertumbuhan tanaman **yang tidak termasuk pupuk** |
| **76 ayat (2)** | Pestisida yang **diedarkan** wajib terdaftar |
| **77 ayat (1)** | Dilarang mengedarkan **dan/atau MENGGUNAKAN** pestisida yang tidak terdaftar, membahayakan, dan/atau tidak berlabel |
| **123** | Sanksi maks. **7 tahun** dan **Rp5 miliar** |

*Diambil langsung dari naskah UU 22/2019. Bandingkan dengan tabel Pasal 71–73 pada jalur pupuk.*

- **Kata “menggunakan” muncul di sini dan tidak muncul di sisi pupuk.** Larangannya tidak berhenti di peredaran.
- **Tidak ada Pasal 72 yang sepadan.** Kelonggaran petani kecil hanya ada untuk pupuk. Pasal 66 ayat (4) mengecualikan sarana produksi lokal dari kewajiban *sertifikasi mutu* — bukan dari *pendaftaran*.
- **Definisinya ditentukan kegunaan, bukan asal bahan.** Ekstrak daun untuk hama adalah pestisida. Biakan *Trichoderma* untuk layu adalah pestisida — Pasal 75 menyebut jasad renik secara eksplisit.

> **Batas kejujuran yang diwarisi dari spesifikasi**
>
> Rangkaian kata pada Pasal 77 ayat (1) — “tidak terdaftar, membahayakan …, dan/atau tidak berlabel” — bisa dibaca kumulatif maupun alternatif, dan bacaan itu menentukan apakah memakai pestisida nabati untuk keperluan sendiri benar-benar terlarang. Itu pertanyaan hukum, bukan pertanyaan agronomi.
>
> Sikap yang wajib diikuti layar: **nyatakan status hukumnya apa adanya, tandai `own_use_only`, jangan menyimpulkan aman.**

---

## 2. Satu klaim pengendalian sudah cukup

Yang menarik sebuah sediaan ke sisi ini bukan bahannya dan bukan cara membuatnya — melainkan **klaimnya**. Satu fungsi yang menyentuh pengendalian OPT sudah cukup memindahkan seluruh sediaan.

| Sediaan | Fungsi yang diklaim | Letaknya |
|---|---|---|
| MOL bonggol pisang | pemicu penguraian · merangsang pertumbuhan | tetap di jalur pupuk |
| **Biakan PGPR bambu** | merangsang pertumbuhan · **menekan penyakit** | pindah ke sini |
| **Trichoderma** | **menekan penyakit** · memperbaiki tanah | di sini, walau organismenya hidup |
| **Biosaka** | merangsang pertumbuhan saja | di sini lewat Pasal 75 huruf d — menolak disebut pupuk justru menariknya masuk |

*Empat sediaan pada garis batas, beserta yang menentukan letaknya.*

---

## 3. Simulasi

Coba **menekan penyakit** lalu Trichoderma untuk melihat kriteria pelepasan yang jujur mengakui batasnya, dan **merangsang pertumbuhan** untuk sampai ke Biosaka — sediaan yang boleh dicatat tetapi tidak boleh dianjurkan.

Semuanya dari kosakata

Bahan, titik kendali, kriteria pelepasan, dosis, PHI, REI, dan APD diambil apa adanya dari `spec/vocab/preparation.json`.

PHI di sini bukan hasil uji

Keempat sediaan yang membawa PHI menandainya `precautionary_default` — angka bawaan yang sengaja berhati-hati, bukan hasil uji residu. Layar menyebutkannya di tiap kartu.

---

## 4. Kriteria pelepasan yang mengaku batasnya

Sisi ini punya masalah yang tidak dimiliki sisi pupuk: **mutunya sering tidak bisa diperiksa tanpa laboratorium**. Kosakata mengakuinya alih-alih menyamarkannya.

Trichoderma · penanda kasar

Kriteria resminya kerapatan mikroba hidup. Padanan lapangannya menyebut dirinya kasar: *“Tanpa laboratorium, penanda kasarnya adalah media tertutup penuh spora hijau merata pada hari ke-10 sampai ke-14.”*

PGPR · mengaku tidak bisa

Yang paling jujur di seluruh kosakata: *“Tanpa laboratorium tidak bisa dipastikan. Larutan keruh saja bukan bukti.”* Sebuah kriteria pelepasan yang menyatakan dirinya tidak bisa dipenuhi di kebun.

Mimba · sensoris, dan menyebut batasnya

Tidak ada uji kadar bahan aktif yang bisa dikerjakan di kebun, jadi kriterianya sensoris: larutan berbau tajam khas mimba dan tidak berbusa busuk — *bau tengik berarti sudah terfermentasi dan harus dibuang.*

---

## 5. Dua bahan yang tidak pernah boleh muncul

Keduanya masuk daftar larangan justru *karena* lazim dipakai. Aturan `L19` menolak resep apa pun yang memakainya, dan daftarnya hidup di dalam entitas bahannya — bukan di dokumen kebijakan terpisah.

Daun tembakau & puntung rokok

Bahan aktifnya nikotin — neurotoksin yang terserap lewat kulit, dengan dosis mematikan pada anak serendah sekitar 1 mg per kg bobot badan. Tidak pernah terdaftar di Indonesia, tidak disetujui di Uni Eropa, dilarang dalam standar organik. Pada rendaman buatan sendiri kadarnya tidak diketahui, **sehingga yang paling terpapar justru pembuatnya, bukan hamanya.**

Akar tuba

Bahan aktifnya rotenon — sangat beracun bagi ikan dan organisme perairan, dan penelitian sejak 1990-an mengaitkan paparannya dengan penyakit Parkinson. Izinnya dicabut penuh di Uni Eropa pada 31 Oktober 2011. Pemakaian di sawah beririgasi memindahkan racunnya langsung ke perairan umum.

> **Kenapa keduanya tetap ditampilkan di daftar**
>
> Bukan disembunyikan, melainkan ditaruh di bawah pemisah dengan penolakannya. Orang yang mencarinya harus sampai ke alasannya — kalau hasil pencariannya kosong, ia akan mencari di tempat lain yang tidak menjelaskan apa pun.

---

## 6. Prasyarat rilis

- **Pendapat hukum lebih dulu.** Bacaan Pasal 77 ayat (1) harus dijawab penasihat hukum sebelum Fase 4. Sampai itu, sisi ini boleh *ditampilkan beserta status hukumnya* — tetapi tidak boleh disajikan sebagai anjuran, dan tidak boleh muncul sebagai cabang “yang bisa kamu pakai” dari jalur insiden.
- **Biosaka ditampilkan tanpa dianjurkan.** Tanpa kriteria pelepasan, ia tidak bisa dibakukan. Layar menampilkannya beserta alasannya, dan menolak memberi dosis maupun cara.
- **PHI harus selalu menyebut dasarnya.** Keempat angka PHI di sini `precautionary_default`. Menampilkannya tanpa keterangan itu akan membuatnya terbaca seperti hasil uji residu.
- **Peringatan silang dari jalur pupuk wajib mengarah ke sini** pada dua fungsi yang merentang kedua sisi — memperbaiki tanah dan merangsang pertumbuhan.

---

## Alur layar

1. **Untuk apa?** Tiga fungsi — membasmi hama, menekan penyakit, merangsang
   pertumbuhan; yang terakhir bertanda zona kabur Pasal 75 huruf d. Plus satu kartu
   penyeberangan ke jalur pupuk untuk orang yang sebenarnya mencari penyubur.
2. **Yang mana?** Sediaan yang cocok. Pada cabang membasmi hama, dua bahan terlarang
   **ikut ditampilkan** di bawah pemisah — supaya orang yang mencarinya sampai ke
   penolakannya, bukan ke pencarian kosong.
3. **Resep terbuka.** Kedudukan hukum lebih dulu, dengan Pasal 75, 77 ayat (1), dan
   123 tercetak apa adanya, serta penanda `own_use_only`.
4. **Kriteria pelepasan yang mengaku batasnya.** Trichoderma menyebut penandanya
   kasar; PGPR menyatakan terus terang bahwa tanpa laboratorium tidak bisa
   dipastikan dan larutan keruh saja bukan bukti.
5. **PHI selalu menyebut dasarnya.** Tiap kartu PHI menyatakan angkanya bawaan yang
   sengaja berhati-hati, bukan hasil uji residu.
6. **Cabang Biosaka.** Kedudukan hukum berbunyi "rezimnya sendiri belum jelas", lalu
   blok yang menjelaskan kenapa ia tidak bisa dibakukan. Layar **berhenti sebelum
   dosis dan cara pakai**, dan menyebutkan bahwa itu disengaja.
7. **Cabang bahan terlarang.** Penolakan `L19` lebih dulu, lalu bahan aktifnya dan
   alasannya, lalu kalimat yang paling sering luput. Tidak ada dosis, tidak ada cara
   pakai, dan satu jalan keluar ke resep yang boleh.
