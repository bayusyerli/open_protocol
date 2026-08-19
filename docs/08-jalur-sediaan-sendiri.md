# Sediaan Sendiri

> Rancangan · jalur kelima · sediaan buatan sendiri  
> Satu-satunya jalur yang tidak menjual apa pun — dan satu-satunya yang pertanyaan masuknya **sekaligus menentukan rezim hukumnya**.  
> Data **12 resep · 21 bahan baku** · Ditegakkan **L16–L21**  
>
> Diekstrak dari dokumen konsep HTML dengan judul sama, 20 Agustus 2026.
> Isi, angka, dan tabelnya utuh; simulasi yang bisa diklik tidak ikut —
> alurnya ditulis ulang sebagai teks.
>
> Jalur 5 dari [03-lima-pintu.md](03-lima-pintu.md).

---

## 1. Pertanyaan masuknya adalah pertanyaan hukumnya

Pasal 75 UU 22/2019 menentukan pestisida dari **kegunaannya**, bukan dari asal bahannya. Ekstrak daun untuk hama adalah pestisida. Biakan *Trichoderma* untuk layu adalah pestisida — pasal itu menyebut jasad renik secara eksplisit. Bahkan sediaan yang menolak disebut pupuk dan menamai dirinya elisitor justru jatuh tepat ke huruf d.

Konsekuensinya untuk rancangan layar menyenangkan: **menanyakan “untuk apa” sudah sekaligus menentukan rezim hukumnya.** Tidak perlu pertanyaan tambahan, dan tidak ada jalan memakai sesuatu tanpa melewati status hukumnya.

| Kalau untuk… | Rezimnya | Yang mengikat |
|---|---|---|
| Menambah hara — memperbaiki tanah | `fertilizer_like` | Kewajiban melekat pada **peredaran**. Pasal 72 ayat (1) mengecualikan pupuk buatan petani kecil dari pendaftaran; ayat (2) memberi jalan mengedarkan terbatas sekabupaten/kota |
| Mengendalikan OPT — hama, penyakit, gulma | `pesticide_like` | Pasal 77 ayat (1) melarang mengedarkan **dan/atau menggunakan**. Tidak ada Pasal 72 yang sepadan. Pasal 123: 7 tahun, Rp5 miliar |
| Merangsang pertumbuhan — zona paling kabur | `unclear` + `pesticide_like` | Pasal 75 huruf d menjangkau bahan yang mengatur pertumbuhan di luar pupuk — jadi menamai diri “bukan pupuk” justru menariknya ke sisi pestisida |

*Rezimnya ditentukan fungsi yang dituju, dan kedua sisi ini tidak boleh diratakan di layar.*

> **Batas kejujuran yang diwarisi dari spesifikasi**
>
> Rangkaian kata pada Pasal 77 ayat (1) — “tidak terdaftar, membahayakan …, dan/atau tidak berlabel” — bisa dibaca kumulatif maupun alternatif, dan bacaan itu menentukan apakah memakai pestisida nabati untuk keperluan sendiri benar-benar terlarang. Itu pertanyaan hukum, bukan pertanyaan agronomi.
>
> Sikap yang sudah diambil `docs/01-sediaan-buatan-sendiri.md` dan wajib diikuti layar: **nyatakan status hukumnya apa adanya, tandai `own_use_only`, jangan menyimpulkan aman.**

---

## 2. Simulasi

Mulai dari fungsi yang dituju. Coba **menambah hara** lalu kompos kotoran sapi untuk melihat sisi yang lapang, **mengendalikan OPT** lalu ekstrak mimba untuk melihat sisi yang terikat, dan **merangsang pertumbuhan** untuk sampai ke sediaan yang boleh dicatat tetapi tidak boleh dianjurkan.

Semuanya dari kosakata

Bahan baku beserta perbandingannya, titik kendali proses, kriteria pelepasan, dosis, PHI, dan APD diambil apa adanya dari `spec/vocab/preparation.json` — 12 resep dengan kedudukan hukum per pasal.

Kenapa jalur ini juga jadi tujuan

Jalur 1 bisa berakhir dengan 244 produk yang tak satu pun terbeli. Jalur 3 bisa berakhir dengan rupiah per kg hara di luar jangkauan. Keduanya butuh cabang yang tidak menjual apa pun, dan hari ini tidak ada layanan yang melayani keadaan itu.

---

## 3. Kriteria pelepasan: uji laboratorium yang diterjemahkan

Bagian paling berharga di kosakata ini, dan yang paling mudah terlewat. Sebelas dari dua belas sediaan membawa `release_criteria` — cara mengetahui sediaannya sudah jadi — dan tiap kriteria membawa `field_proxy`: uji yang bisa dikerjakan di kebun tanpa alat.

Contoh · kompos matang

Kriteria resminya indeks perkecambahan ≥ 80%. Padanan lapangannya: *“Kecambahkan 20 benih kangkung pada rendaman kompos 1:5 dan 20 benih pada air biasa. Bila yang tumbuh pada rendaman kurang dari 16 dari 20, kompos belum matang.”* Uji laboratorium yang jadi dua gelas dan seminggu menunggu.

Contoh · ekstrak mimba

Tidak ada uji kadar bahan aktif yang bisa dikerjakan di kebun, jadi kriterianya sensoris dan jujur mengatakannya: larutan berbau tajam khas mimba dan tidak berbusa busuk — *bau tengik berarti sudah terfermentasi dan harus dibuang.*

Yang tanpa kriteria

Satu-satunya: **Biosaka**. Bahannya rumput apa saja yang ada di petak, sehingga isinya berbeda tiap kali dibuat dan tidak ada yang bisa diukur, diulang, atau diuji. Ia masuk kosakata sebagai *bahan uji kejujuran model* — bila kerangka ini tidak sanggup menampung praktik yang sedang ramai tanpa ikut mengiklankannya, kerangkanya yang perlu diperbaiki.

---

## 4. Dua bahan yang tidak pernah boleh muncul

Keduanya justru masuk daftar larangan *karena* lazim dipakai. Menampilkannya sebagai “resep populer” akan aktif membahayakan.

Daun tembakau & puntung rokok

Bahan aktifnya nikotin — neurotoksin yang terserap lewat kulit, dengan dosis mematikan pada anak serendah sekitar 1 mg per kg bobot badan. Tidak pernah terdaftar di Indonesia, tidak disetujui di Uni Eropa, dilarang dalam standar organik. Pada rendaman buatan sendiri kadarnya tidak diketahui, **sehingga yang paling terpapar justru pembuatnya, bukan hamanya.**

Akar tuba

Bahan aktifnya rotenon — sangat beracun bagi ikan dan organisme perairan, dan penelitian sejak 1990-an mengaitkan paparannya dengan penyakit Parkinson. Izinnya dicabut penuh di Uni Eropa pada 31 Oktober 2011. Pemakaian di sawah beririgasi memindahkan racunnya langsung ke perairan umum.

Empat bahan lain berstatus `restricted`

Urine ternak wajib difermentasi tertutup ≥ 7 hari; molase maksimal 0,2% pada seduhan berbahan kotoran; media serealia wajib disterilkan penuh dan media berjamur dibakar, bukan dipakai; inokulum dari alam bebas identitasnya tidak bisa dipastikan tanpa laboratorium.

> **Kenapa larangannya disimpan bersama bahannya**
>
> Aturan `L19` menolak resep apa pun yang memakai bahan berstatus `prohibited`, dan daftarnya hidup di dalam entitas bahannya — bukan di dokumen kebijakan terpisah. Supaya tidak ada jalan memakainya tanpa melewati larangannya. Layar hanya perlu meneruskan penolakan itu, bukan menegakkannya sendiri.

---

## 5. Prasyarat rilis

- **Sisi `fertilizer_like` tidak menunggu apa pun.** Enam sediaan plus arang sekam berada di luar rezim pendaftaran lewat Pasal 72, kriteria pelepasannya lengkap, dan ia bisa ikut jalur 3 sejak awal sebagai cabang “tidak ada uangnya”.
- **Sisi `pesticide_like` menunggu pendapat hukum.** Empat sediaan bertanda `own_use_only`. Bacaan Pasal 77 ayat (1) harus dijawab penasihat hukum sebelum Fase 4 — sampai itu, sediaan ini boleh *ditampilkan beserta status hukumnya*, tetapi tidak boleh disajikan sebagai anjuran.
- **Biosaka ditampilkan tanpa dianjurkan.** Tanpa kriteria pelepasan, ia tidak bisa dibakukan. Layar menampilkannya beserta alasannya, dan menolak memberi dosis maupun cara.
- **Kadar hara sediaan tidak diketahui sampai satu batch diuji.** Aturan `L18` menolak menghitung hara dari batch yang belum terukur — jadi kompos tidak bisa masuk kalkulator jalur 3 dengan angka, hanya sebagai pos yang menunggu pengukuran.

---

## Alur layar

1. **Untuk apa?** Empat fungsi, dan tiap pilihan sudah membawa rezimnya di baris
   ketiga: *rezim pupuk — di luar pendaftaran*, *rezim pestisida — terikat Pasal 77*,
   *zona kabur — Pasal 75 huruf d*. Pertanyaan ini tidak bisa dilewati.
2. **Yang mana?** Sediaan yang cocok dengan fungsi itu, masing-masing dengan tingkat
   buktinya. Pada cabang pengendalian OPT, dua bahan terlarang **ikut ditampilkan**
   di bawah pemisah — supaya orang yang mencarinya sampai ke penolakannya, bukan ke
   pencarian kosong.
3. **Resep terbuka.** Kedudukan hukum selalu lebih dulu, dengan pasal yang dirujuk
   tercetak apa adanya. Menyusul tingkat bukti, bahan beserta perbandingannya, proses
   dengan titik kendalinya, kriteria pelepasan, pemakaian, lalu keselamatan.
4. **Kriteria pelepasan.** Kriteria resminya dan padanan lapangannya ditampilkan
   berdampingan — uji laboratorium di kepala kartu, cara memeriksanya di kebun di
   badannya.
5. **Cabang tanpa kriteria.** Untuk Biosaka, blok merah menggantikan kriteria
   pelepasan, disusul alasan kenapa ia tetap dicatat. Layar **berhenti sebelum dosis
   dan cara pakai** — sengaja, dan menyebutkan bahwa itu disengaja.
6. **Cabang bahan terlarang.** Penolakan `L19` disebut lebih dulu, lalu bahan
   aktifnya dan alasannya, lalu satu kalimat yang paling sering luput: yang paling
   terpapar justru pembuatnya. Tidak ada dosis, tidak ada cara pakai, dan satu jalan
   keluar ke resep yang boleh.
