// Membuka pintu gejala jalur 1, satu komoditas demi satu komoditas.
//
//   node spec/tools/kurasi-opt.mjs            # periksa saja
//   node spec/tools/kurasi-opt.mjs --tulis    # tulis perubahannya
//
// Sudah dipakai untuk: bawang merah, tomat & kentang, padi, jagung, kubis, kedelai,
// kakao, kopi, kelapa sawit, jeruk, cucurbit, legum, tembakau, teh, mangga, apel,
// tebu, karet, lada, pisang, krisan, celah cabai, dan hama gudang (seluruhnya
// 28 Agustus 2026), lalu celah yang tersisa lintas komoditas.
//
// KAKAO TANAMAN TAHUNAN PERTAMA, DAN YANG BERUBAH LEBIH SEDIKIT DARIPADA DUGAAN
// Yang dikhawatirkan sebelum masuk: kakao belum punya skala fase BBCH. Ternyata itu tidak
// menghalangi apa pun di sini — `pest.schema.json` tidak menyentuh skala fase sama sekali,
// dan pintu gejala berdiri di atas `hosts` yang cuma rujukan ke komoditas. Skala fase
// prasyarat LAPIS 2 (protokol), bukan prasyarat jalur 1. Kekhawatiran itu benar untuk
// pekerjaan yang lain, dan salah untuk yang ini.
//
// Yang memang berubah: teks gejalanya tidak bisa menambatkan waktu pada fase pertumbuhan
// ("saat masak susu", "tiga minggu pertama") karena pohon tahunan berbuah terus-menerus.
// Penambatnya jadi KEADAAN BENDA yang dipegang — buah muda, buah belang, ranting yang
// menggundul di tengah — dan itu lebih mudah diperiksa, bukan lebih sulit.
// Cabai — sepuluh entri pertama — ditulis lebih dulu oleh spec/tools/tulis-gejala-opt.mjs,
// sebelum pola di bawah ini ada.
//
// KENAPA ENTRI BARU, BUKAN MENAMBAH MEDAN PADA ENTRI REGISTRI
// Sebagian besar OPT ini sudah punya entitas di vocab/pest-registri.json. Menambah
// `symptoms` di sana akan tampak paling murah dan salah karena dua hal:
//
//   1. spec/tools/bangun-indeks.mjs mengambil pintu jalur 1 HANYA dari pest.json
//      (`optTerkurasi`). Gejala yang ditulis di berkas registri tidak akan pernah
//      sampai ke layar.
//   2. Pembagian dua berkas itu memang pembagian PROVENANS, bukan pembagian rapi-rapi:
//      pest-registri.json diturunkan dari label produk terdaftar dan menyatakan sumber
//      itu di `provenance`-nya. Teks gejala tidak berasal dari registri sama sekali —
//      ia ditulis tangan dan tingkat buktinya belum ditetapkan. Menaruh keduanya di
//      satu berkas dengan satu blok provenance membuat layar tidak bisa lagi
//      membedakan mana yang ditarik dan mana yang dikarang.
//
// Jadi entitasnya NAIK: entri registri disalin ke pest.json dengan nomor dari blok
// terkurasi (1–999), lalu yang lama jadi "superseded" menunjuk yang baru — pola yang
// sama persis dengan satukan-opt-kembar.mjs, dan sudah dipakai belasan kali untuk salah
// ketik. Yang ikut naik: mappings, synonyms, dan taxon_verification. Verifikasi GBIF-nya
// TIDAK diulang dan TIDAK dikarang ulang — ia jejak pemeriksaan 19 Agustus 2026, dan
// menyalinnya utuh lebih jujur daripada menuliskan tanggal hari ini di atas kerja yang
// tidak dikerjakan hari ini.
//
// `pest.id` pada label_uses ikut ditulis ulang, karena L29 melarang rujukan menunjuk
// entitas yang sudah digantikan. `pest_label` dan `pest_scientific_name` pada rekaman
// produk TIDAK disentuh — keduanya satu-satunya tempat bunyi asli registri masih
// terbaca, dan L26 sudah menerima ejaan yang tercatat pada entitas penerusnya.
//
// KENAPA KUNCI BERUBAH DAN LABEL BERUBAH
// Registri menamai entitasnya menurut nama ilmiah (`spodoptera-exigua`) dan melabelinya
// dengan bahasa registri ("Ulat Grayak", "Botrytis allii"). Pintu jalur 1 dimasuki orang
// yang panik, bukan orang yang tahu nama ilmiahnya, jadi label naik jadi nama yang
// dipakai di kebun. Label registri tidak hilang; ia turun jadi synonyms dan tetap bisa
// dicari. Kunci lama juga tidak didaur ulang: entri yang digantikan tetap memegangnya,
// dan L1 menghitungnya.
//
// SEBARAN KOMODITAS MENENTUKAN ENTITAS MANA YANG BOLEH DINAIKKAN
// Satu entitas OPT memegang SATU teks gejala, sementara satu patogen bisa terdaftar di
// belasan tanaman. Menaikkan entitas polifag lalu menuliskan gejala satu tanaman di
// atasnya berarti membuka pintu bergejala salah untuk tanaman lain yang belum dikurasi.
// Karena itu tiap calon diperiksa sebarannya lebih dulu. Dua contoh yang menentukan:
//
//   Colletotrichum gloeosporioides  49 baris — mangga 20, cabai 12, bawang merah 5  DITOLAK
//   Colletotrichum circinans         5 baris — bawang merah 5, dan tidak di mana pun  naik
//   Phytophthora infestans         484 baris — kentang 376, tomat 100, cabai 7       naik, dua klausa
//
// Pengecualiannya OPT yang gejalanya memang sama di mana-mana: ulat tanah, penggerek
// buah, dan pengorok daun dinaikkan walau polifag, dengan teks yang sengaja tidak
// menyebut satu tanaman pun atau menyebut bentuk daunnya, bukan jenisnya.
//
// KELOMPOK DIJALANKAN BERURUTAN, TETAPI `PERLUAS` HANYA SATU
// `pintu` dipecah per komoditas karena pintu memang milik satu kurasi. `PERLUAS` tidak:
// entri yang melayani lebih dari satu komoditas — layu fusarium sudah tiga, kutu daun
// persik empat — hanya boleh punya SATU teks yang berlaku, dan menyimpan versi lama
// per kelompok berarti menyimpan teks yang tidak pernah menang. Jadi PERLUAS berdiri
// sendiri dan memuat bunyi terakhirnya.
//
// Pada entri yang SUDAH ADA, alat ini menyegarkan `label`, `definition`, `hosts`, dan
// `vector`, dan TIDAK PERNAH menyentuh `symptoms`, `distinguishing`, maupun `notes`.
// Pembagian itu bukan kerapian: tiga medan terakhir yang diminta ditinjau penyuluh di
// docs/14-tinjauan-gejala.md, dan menimpanya berarti menghapus hasil tinjauan tanpa
// ada yang menyadarinya. Empat medan pertama struktural — inang bertambah, nama pintu
// tetangga berubah — dan justru berbahaya kalau dibiarkan basi.
//
// SATU PINTU PER KOMODITAS YANG TIDAK PUNYA KEMBARAN REGISTRI, DAN ITU DISENGAJA
// Virus mosaik bawang dan virus penggulung daun kentang tidak punya satu pun produk
// terdaftar, jadi keduanya tidak pernah muncul di label mana pun dan tidak punya entitas
// registri. Keduanya tetap dibuat, karena layar "jangan beli apa pun untuk ini" adalah
// layar paling bernilai di seluruh jalur — dan pada kedua komoditas itu jawabannya bukan
// semprotan melainkan umbi bibit, yang menyerahkannya ke jalur 4. Pemetaan luarnya
// sengaja KOSONG dengan alasan tertulis: kode EPPO yang tidak diperiksa ke sumbernya
// lebih buruk daripada tidak ada kode.
//
// AKIBATNYA spec/tools/tulis-gejala-opt.mjs TIDAK LAGI BERWENANG PENUH atas entri cabai
// yang ikut diperluas. Alat ini yang terakhir bicara; kalau alat itu dijalankan ulang,
// jalankan alat ini sesudahnya.
//
// Idempoten: entri yang sudah ada tidak dibangun ulang, dan penulisan ulang label_uses
// hanya menyentuh yang masih menunjuk id lama.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VOCAB = join(akar, 'spec', 'vocab');
const NDJSON = join(VOCAB, 'product', 'pestisida.ndjson');
const STAMP = '2026-08-28T00:00:00Z';
const tulis = process.argv.includes('--tulis');

const BAWANG_MERAH = { id: 'op:cmd:00000004', label: 'Bawang merah' };
const TOMAT = { id: 'op:cmd:00000003', label: 'Tomat' };
const KENTANG = { id: 'op:cmd:00001008', label: 'Kentang' };
// Ditambatkan ke entitas registri "Cabai" (op:cmd:00001003), bukan ke komoditas
// terkurasi "Cabai merah besar" (op:cmd:00000001). Dua alasan, dan keduanya baru
// terlihat sesudah belasan komoditas masuk:
//
//   1. Pintunya memang ditulis untuk CABAI, bukan khusus cabai merah besar — rawit dan
//      keriting memakai teks yang sama, dan saringan tanaman yang berbunyi "Cabai merah
//      besar" menyempitkan janji lebih daripada yang dimaksud.
//   2. Seluruh pendaftarannya duduk di bawah "Cabai". Pencakupan sasaran bertingkat
//      genus ("Thrips sp." pada cabai) mensyaratkan inang pintu memuat komoditas baris
//      itu; dengan inang yang tidak pernah dipakai registri, 39 baris cabai gagal
//      tercakup tanpa ada yang menyalak.
const CABAI = { id: 'op:cmd:00001003', label: 'Cabai' };
const PADI = { id: 'op:cmd:00000006', label: 'Padi' };
const JAGUNG = { id: 'op:cmd:00001002', label: 'Jagung' };
const KUBIS = { id: 'op:cmd:00001011', label: 'Kubis' };
const KEDELAI = { id: 'op:cmd:00001007', label: 'Kedelai' };
const KAKAO = { id: 'op:cmd:00001010', label: 'Kakao' };
// Ditambatkan ke entitas TANAMAN ('Kopi'), bukan ke 'Budidaya kopi' tempat sebagian besar
// pendaftarannya duduk. `hosts` menyatakan teks ini ditulis untuk TANAMAN apa, dan
// "budidaya kopi" bukan nama tanaman melainkan cara registri menandai sasaran yang
// sebenarnya lahannya — 469 dari 497 barisnya herbisida. Daftar produk pada layar kedua
// tetap datang dari pendaftarannya, jadi yang terdaftar di bawah "Budidaya kopi" tetap
// muncul; yang berubah cuma nama yang tampil di saringan tanaman.
const KOPI = { id: 'op:cmd:00001244', label: 'Kopi' };
const SAWIT = { id: 'op:cmd:00001151', label: 'Kelapa sawit' };
const JERUK = { id: 'op:cmd:00001015', label: 'Jeruk' };
const SEMANGKA = { id: 'op:cmd:00001021', label: 'Semangka' };
const MELON = { id: 'op:cmd:00001031', label: 'Melon' };
const MENTIMUN = { id: 'op:cmd:00001045', label: 'Mentimun' };
const KACANG_PANJANG = { id: 'op:cmd:00001026', label: 'Kacang panjang' };
const KACANG_HIJAU = { id: 'op:cmd:00001032', label: 'Kacang hijau' };
const KACANG_TANAH = { id: 'op:cmd:00001034', label: 'Kacang tanah' };
const TEMBAKAU = { id: 'op:cmd:00001018', label: 'Tembakau' };
const TEH = { id: 'op:cmd:00001014', label: 'Teh' };
const MANGGA = { id: 'op:cmd:00001019', label: 'Mangga' };
const APEL = { id: 'op:cmd:00001028', label: 'Apel' };
const TEBU = { id: 'op:cmd:00001006', label: 'Tebu' };
const KARET = { id: 'op:cmd:00001464', label: 'Karet' };
const LADA = { id: 'op:cmd:00001036', label: 'Lada' };
const PISANG = { id: 'op:cmd:00001041', label: 'Pisang' };
const KRISAN = { id: 'op:cmd:00001082', label: 'Krisan' };
const BAWANG_DAUN = { id: 'op:cmd:00001103', label: 'Bawang daun' };
const PALA = { id: 'op:cmd:00001276', label: 'Pala' };
const EUCALYPTUS = { id: 'op:cmd:00001048', label: 'Eucalyptus' };
const GANDUM = { id: 'op:cmd:00001355', label: 'Gandum' };
const SAWIT_BIBIT = { id: 'op:cmd:00001055', label: 'Pembibitan kelapa sawit' };
const TEH_BIBIT = { id: 'op:cmd:00001230', label: 'Pembibitan teh' };
const TEMBAKAU_SIMPAN = { id: 'op:cmd:00001482', label: 'Tembakau di penyimpanan' };
const TEMBAKAU_SEMAI = { id: 'op:cmd:00001207', label: 'Tembakau di persemaian' };
const CENGKEH = { id: 'op:cmd:00001040', label: 'Cengkeh' };
const CENGKEH_BIBIT = { id: 'op:cmd:00001508', label: 'Pembibitan cengkeh' };
const NENAS = { id: 'op:cmd:00001052', label: 'Nenas' };
const TERUNG = { id: 'op:cmd:00001108', label: 'Terung' };
const ANGGREK = { id: 'op:cmd:00001165', label: 'Anggrek' };
const KAPAS = { id: 'op:cmd:00001131', label: 'Kapas' };
const UBI_JALAR = { id: 'op:cmd:00001503', label: 'Ubi jalar' };
const ALPUKAT = { id: 'op:cmd:00001417', label: 'Alpukat' };
const RAMBUTAN = { id: 'op:cmd:00001373', label: 'Rambutan' };
const JAMBU_BIJI = { id: 'op:cmd:00001374', label: 'Jambu biji' };
const WORTEL = { id: 'op:cmd:00001105', label: 'Wortel' };
const BUAH_NAGA = { id: 'op:cmd:00001215', label: 'Buah naga' };
const KUBIS_BUNGA = { id: 'op:cmd:00001221', label: 'Kubis Bunga' };
const KACANG_TANAH_BIBIT = { id: 'op:cmd:00001450', label: 'Bibit kacang tanah' };
const ANGGUR = { id: 'op:cmd:00001157', label: 'Anggur' };
const STROBERI = { id: 'op:cmd:00001345', label: 'Stroberi' };
const KELAPA = { id: 'op:cmd:00001043', label: 'Kelapa' };
const BAWANG_PUTIH = { id: 'op:cmd:00001073', label: 'Bawang putih' };
const SAWI = { id: 'op:cmd:00001132', label: 'Sawi' };
const BERAS_SIMPAN = { id: 'op:cmd:00001023', label: 'Beras di penyimpanan' };
const JAGUNG_SIMPAN = { id: 'op:cmd:00001080', label: 'Jagung di penyimpanan' };
// "Beras" (gabah/beras curah, bukan gudang) dan tepung terigu tersimpan tetap entitas
// tersendiri: keduanya bukan ejaan lain dari gudang beras, melainkan bentuk komoditas
// yang berbeda. Ejaan yang memang cuma beda kata sudah disatukan lebih dulu oleh
// spec/tools/satukan-komoditas-ejaan.mjs.
const TERIGU_SIMPAN = { id: 'op:cmd:00001170', label: 'Tepung terigu dalam penyimpanan' };
const BERAS = { id: 'op:cmd:00001074', label: 'Beras' };
const TAMBAK = { id: 'op:cmd:00001109', label: 'Budidaya udang windu dan ikan bandeng' };

const CATATAN = (tanaman) =>
  `Teks gejala dan ciri pembanding disusun dari pengetahuan agronomi mapan tentang OPT ${tanaman}, bukan dari registri. ` +
  'Berstatus draft: wajib ditinjau penyuluh atau BPTP sebelum dipakai sebagai dasar keputusan.';

// ---------------------------------------------------------------------------
// Pintu per komoditas
// ---------------------------------------------------------------------------
// `dari` menyebut entitas registri yang dinaikkan; null berarti entri baru sama sekali.
// `nama` dipakai penjaga: kalau label entri registri berubah, entri ini sudah menunjuk
// hal lain dan alat berhenti, bukan menaikkan organisme yang keliru. `inang` boleh
// menimpa inang kelompoknya — sebagian pintu hanya berlaku untuk satu dari dua tanaman.
const PINTU_BAWANG = [
  {
    id: 'op:pst:00000011',
    dari: 'op:pst:00001019',
    nama: 'Ulat Grayak',
    key: 'ulat-bawang',
    inang: [BAWANG_MERAH, BAWANG_PUTIH],
    label: 'Ulat bawang',
    definition:
      'Ulat grayak bawang. Ulatnya makan dari DALAM daun yang berongga, jadi kerusakannya sudah luas sebelum ulatnya terlihat dari luar.',
    gejala:
      'Daun berlubang kecil di satu titik, lalu bagian di atas lubang itu memutih menerawang seperti kertas dan terkulai. Serangan berat menyisakan tunggak daun yang tinggal berdiri, dan petak terlihat gundul berpetak-petak, bukan merata.',
    pembanding: [
      {
        cek: 'Terawang daun yang memutih ke arah cahaya, lalu belah membujur. Ulat hijau kecoklatan bergaris memanjang ada di dalam rongga daun. Kalau rongganya kosong dan yang ada hanya lorong berkelok di dalam lapisan daun, penyebabnya pengorok daun.',
        membantah: { id: 'op:pst:00000012', label: 'Pengorok daun bawang' },
      },
      {
        cek: 'Cari kelompok telur di permukaan daun: gundukan kecil tertutup bulu putih kecoklatan seperti kapas. Trips dan pengorok daun tidak meninggalkan apa pun seperti itu.',
        membantah: { id: 'op:pst:00000013', label: 'Trips bawang' },
      },
    ],
  },
  {
    id: 'op:pst:00000012',
    dari: 'op:pst:00001032',
    nama: 'Pengorok Daun',
    key: 'pengorok-daun-bawang',
    label: 'Pengorok daun bawang',
    inang: [BAWANG_MERAH, BAWANG_DAUN],
    definition:
      'Pengorok daun yang khusus Allium — bawang merah dan bawang daun — dan karena daunnya berbentuk pipa, lorongnya terlihat sebagai garis putih memanjang, bukan berkelok seperti pada daun pipih. Registri juga mendaftarkan Liriomyza huidobrensis pada bawang merah (24 baris), spesies yang tidak bisa dibedakan dari lorongnya di kebun dan yang punya pintunya sendiri, "Pengorok daun kentang", karena teksnya ditulis untuk daun lebar.',
    gejala:
      'Bintik-bintik putih berjajar seperti tusukan jarum pada daun, lalu muncul lorong berkelok berwarna putih keperakan di dalam lapisan daun. Daun mengering dari ujung ke bawah; pada serangan berat seluruh rumpun terlihat kecoklatan seperti terbakar.',
    pembanding: [
      {
        cek: 'Terawang daun ke cahaya dan ikuti lorongnya. Lorong pengorok berkelok dan MELEBAR di ujungnya, dengan larva kuning bening sebesar biji wijen di bagian yang paling lebar. Ulat bawang tidak membuat lorong — ia mengosongkan rongga daun dari dalam.',
        membantah: { id: 'op:pst:00000011', label: 'Ulat bawang' },
      },
      {
        cek: 'Lihat bintik putih di permukaan. Bintik tusukan pengorok berukuran seragam dan berjajar mengikuti panjang daun; goresan trips tidak berbentuk titik melainkan bidang keperakan memanjang yang tepinya tidak beraturan.',
        membantah: { id: 'op:pst:00000013', label: 'Trips bawang' },
      },
    ],
  },
  {
    id: 'op:pst:00000013',
    dari: 'op:pst:00001094',
    nama: 'Hama Trips',
    key: 'trips-bawang',
    inang: [BAWANG_MERAH, BAWANG_PUTIH],
    label: 'Trips bawang',
    definition:
      'Paling parah pada musim kemarau dan pada petak yang jarang disiram. Registri juga mendaftarkan Thrips parvispinus dan Thrips sp. pada bawang merah, masing-masing lewat pintunya sendiri.',
    gejala:
      'Bidang keperakan mengkilap memanjang searah daun, mulai dari ketiak daun termuda, lalu berubah kecoklatan dan daun mengering dari ujung. Di atas bidang keperakan itu ada titik-titik kotoran hitam sangat halus. Daun melengkung, tanaman kerdil, dan umbinya kecil.',
    pembanding: [
      {
        cek: 'Buka ketiak daun termuda dan kibaskan di atas kertas putih. Trips terlihat sebagai serangga kuning kecoklatan sepanjang 1–2 mm yang langsung berlari. Kalau tidak ada yang bergerak, penyebabnya bukan trips.',
        membantah: { id: 'op:pst:00000012', label: 'Pengorok daun bawang' },
      },
      {
        cek: 'Periksa permukaan bidang keperakannya. Trips tidak meninggalkan lorong dan tidak melubangi: kalau ada lorong berkelok di dalam daun itu pengorok daun, dan kalau daunnya berlubang lalu memutih menerawang di atas lubangnya itu ulat bawang.',
        membantah: { id: 'op:pst:00000011', label: 'Ulat bawang' },
      },
    ],
  },
  {
    id: 'op:pst:00000014',
    dari: 'op:pst:00001136',
    nama: 'Ulat Tanah',
    key: 'ulat-tanah',
    label: 'Ulat tanah',
    inang: [BAWANG_MERAH, KENTANG, JAGUNG, KUBIS, KACANG_TANAH_BIBIT],
    definition:
      'Menyerang pada malam hari dan bersembunyi di tanah pada siang hari. Polifag: terdaftar juga pada kentang, jagung, cabai, dan kubis, dan gejalanya sama di semuanya — jadi teks di bawah sengaja tidak menyebut satu tanaman pun. ' +
      'Orong-orong (Gryllotalpa sp.) merusak dengan cara yang mirip, tetapi meninggalkan lorong gembur di permukaan tanah dan terdaftar lewat pintunya sendiri.',
    gejala:
      'Tanaman muda rebah dan terpotong tepat di pangkal, dekat permukaan tanah. Yang rebah ditemukan pagi hari, bergerombol di beberapa titik dalam petak dan bukan merata, dan daunnya masih hijau segar — tidak menguning lebih dulu.',
    pembanding: [
      {
        cek: 'Korek tanah sedalam 2–5 cm di sekeliling tanaman yang rebah, pagi hari. Ulat gemuk kelabu kecoklatan yang MELINGKAR seperti huruf C saat disentuh bersembunyi di situ. Kalau tidak ada, penyebab rebahnya bukan ulat tanah.',
      },
      {
        cek: 'Lihat bekas patahannya. Ulat tanah memotong batang bersih seperti disayat, dan sisa tanaman masih segar. Tanaman yang roboh karena pangkalnya membusuk tidak terpotong: batang atau umbinya lunak, dan seluruh tanaman terangkat hanya dengan menarik daunnya.',
        membantah: { id: 'op:pst:00000008', label: 'Layu fusarium' },
      },
    ],
  },
  {
    id: 'op:pst:00000015',
    dari: 'op:pst:00001022',
    nama: 'Penyakit Bercak Ungu',
    key: 'bercak-ungu',
    inang: [BAWANG_MERAH, BAWANG_PUTIH],
    label: 'Bercak ungu',
    definition:
      'Trotol. Penyakit daun paling banyak didaftarkan pada bawang merah — 215 baris penggunaan berlabel, kedua terbanyak sesudah ulat bawang.',
    gejala:
      'Bercak kecil keputihan berpusat di tengah daun, membesar jadi lonjong dengan bagian tengah keunguan dan tepi kuning. Daun patah terkulai tepat pada bercak yang sudah melingkari daun. Pada cuaca lembap permukaan bercak berbulu halus kehitaman.',
    pembanding: [
      {
        cek: 'Perhatikan susunan di dalam bercaknya. Bercak ungu bercincin sepusat seperti sasaran panah dengan tepi kuning yang tegas. Embun bulu tidak berbercak bercincin — ia menutup bidang daun dengan lapisan berbulu keunguan yang merata dan tepinya kabur.',
        membantah: { id: 'op:pst:00000017', label: 'Embun bulu' },
      },
      {
        cek: 'Lihat di daun mana ia mulai. Bercak ungu muncul lebih dulu pada daun TUA dan meluas sesudah hujan atau embun berat; goresan keperakan trips justru mulai di daun MUDA di ketiak, dan tidak pernah membentuk bercak bercincin.',
        membantah: { id: 'op:pst:00000013', label: 'Trips bawang' },
      },
    ],
  },
  {
    id: 'op:pst:00000016',
    dari: 'op:pst:00001326',
    nama: 'Penyakit Antraknosa',
    key: 'antraknosa-bawang',
    label: 'Antraknosa bawang',
    definition:
      'Di sentra Brebes disebut "otomatis" karena tanaman rebah serentak dalam beberapa hari. Terbawa umbi bibit, jadi petak berbibit turunan sendiri lebih berisiko. ' +
      'BATAS YANG HARUS IKUT TERBACA: registri menautkan nama "antraknosa pada bawang merah" ke DUA spesies Colletotrichum — C. circinans (5 baris penggunaan, hanya pada bawang merah) ' +
      'dan C. gloeosporioides (5 baris pada bawang merah, tetapi 44 baris lagi pada mangga, cabai, jeruk, dan karet). Literatur menautkan gejala "otomatis" yang khas — leher terpelintir, ' +
      'tanaman rebah serentak — pada C. gloeosporioides, sedangkan C. circinans penyebab smudge, bercak gelap pada sisik luar umbi. Pintu ini berdiri di atas C. circinans karena hanya ' +
      'entitas itu yang terdaftar semata-mata pada bawang merah; membuka pintu di atas yang satunya berarti menjanjikan teks gejala kepada mangga dan cabai, yang belum dikurasi. ' +
      'Gejala di bawah mencakup KEDUANYA, dan memisahkan keduanya menuntut laboratorium, bukan mata — jadi lima produk yang terdaftar atas nama C. gloeosporioides TIDAK ikut terdaftar di bawah pintu ini.',
    gejala:
      'Bercak lonjong keputihan pada daun, di tengahnya titik-titik hitam kecil tersusun melingkar. Leher tanaman terpelintir dan daun melengkung, lalu tanaman terkulai serentak dalam beberapa hari. Pada umbi muncul bercak gelap seperti jelaga pada sisik terluar, dan umbi yang terserang membusuk.',
    pembanding: [
      {
        cek: 'Tatap titik hitam di tengah bercak, kalau perlu dengan kaca pembesar. Titiknya tersusun melingkar sepusat dan itu tubuh buah jamurnya. Bercak ungu tidak pernah bertitik hitam seperti itu — bagian tengahnya keunguan polos.',
        membantah: { id: 'op:pst:00000015', label: 'Bercak ungu' },
      },
      {
        cek: 'Cabut tanaman yang terkulai dan lihat lehernya. Pada antraknosa lehernya terpelintir dan berbercak sementara akarnya masih menahan tanah. Pada moler lehernya tidak terpelintir, dasar umbinya sudah membusuk, dan tanaman terangkat hampir tanpa perlawanan.',
        membantah: { id: 'op:pst:00000008', label: 'Layu fusarium' },
      },
    ],
  },
  {
    id: 'op:pst:00000017',
    dari: 'op:pst:00001134',
    nama: 'Penyakit Embun Bulu',
    key: 'embun-bulu',
    label: 'Embun bulu',
    definition:
      'Oomycete, bukan jamur sejati — dan pembedaan itu menentukan bahan aktifnya. Metalaksil dan dimetomorf bekerja pada oomycete; banyak fungisida untuk jamur sejati tidak.',
    gejala:
      'Bidang pucat kehijauan memanjang pada daun, tertutup lapisan berbulu halus keunguan atau kelabu yang paling jelas terlihat pagi hari saat daun masih berembun. Daun menguning, terkulai dari ujung, lalu mengering. Menyebar cepat pada musim hujan dan di petak yang lembap.',
    pembanding: [
      {
        cek: 'Periksa pagi-pagi sebelum matahari naik, saat daun masih basah. Lapisan berbulu keunguan yang merata di permukaan daun hanya dibuat embun bulu; siang hari lapisan itu hilang dan yang tersisa cuma bidang pucat yang mudah dikira bercak biasa.',
      },
      {
        cek: 'Lihat bentuk kerusakannya. Embun bulu memberi BIDANG pucat memanjang yang tepinya kabur dan tanpa cincin; bercak ungu memberi bercak lonjong bercincin sepusat dengan tepi kuning yang tegas.',
        membantah: { id: 'op:pst:00000015', label: 'Bercak ungu' },
      },
    ],
  },
  {
    id: 'op:pst:00000018',
    dari: 'op:pst:00002334',
    nama: 'Botrytis allii',
    key: 'busuk-leher-umbi',
    label: 'Busuk leher umbi',
    definition:
      'Kerugian penyimpanan, bukan kerugian lahan: gejalanya sering baru terlihat berminggu-minggu sesudah panen, pada umbi yang tampak sehat saat diangkat.',
    gejala:
      'Leher umbi melunak dan basah menjelang atau sesudah panen, lalu di antara sisiknya tumbuh lapisan kelabu berdebu. Umbi yang dibelah terlihat berair kecoklatan dari leher ke bawah, dan di antara sisik kadang muncul butiran hitam kecil sekeras pasir.',
    pembanding: [
      {
        cek: 'Belah umbi yang lunak membujur dari leher ke dasar. Busuk leher berjalan dari LEHER turun ke bawah. Moler kebalikannya: busuknya mulai dari dasar umbi, tempat akar keluar.',
        membantah: { id: 'op:pst:00000008', label: 'Layu fusarium' },
      },
      {
        cek: 'Tekan dan cium. Busuk leher berbau apak seperti jamur dan jaringannya lunak berair tanpa lendir; busuk karena bakteri berbau menyengat dan mengeluarkan lendir saat ditekan.',
      },
    ],
  },
  {
    id: 'op:pst:00000019',
    dari: null,
    key: 'virus-mosaik-bawang',
    label: 'Virus mosaik bawang',
    pest_kind: 'disease_viral',
    scientific_name: 'Onion yellow dwarf virus',
    taxonomic_rank: 'species',
    no_mapping_reason:
      'Belum dipetakan ke EPPO maupun GBIF. Kode kandidat tidak diperiksa ke sumbernya dalam sesi ini, dan kode yang tidak diperiksa lebih buruk daripada tidak ada kode. Tidak punya kembaran registri karena tidak satu pun produk terdaftar menyasarnya — sasaran yang tidak pernah muncul di label tidak pernah jadi entitas registri.',
    definition:
      'Ditularkan kutu daun dan terbawa umbi bibit; tidak ada pengendalian kuratif. Umbi dari tanaman yang terkena meneruskan virusnya ke musim berikutnya, dan itulah kenapa petak berbibit turunan sendiri makin parah tiap musim.',
    penular: { id: 'op:pst:00000002', label: 'Kutu daun persik' },
    gejala:
      'Garis-garis kuning memanjang searah daun, mulai dari pangkal daun muda. Daun jadi pipih, berkelok, dan terkulai; tanaman kerdil dan umbinya kecil. Gejalanya sudah ada sejak awal pertumbuhan, bukan muncul di tengah musim.',
    pembanding: [
      {
        cek: 'Periksa daun yang bergaris kuning itu sendiri. Tidak ada lorong, lubang, bercak bercincin, bidang keperakan, atau lapisan berbulu di atasnya — yang berubah hanya warna dan bentuknya.',
        membantah: { id: 'op:pst:00000013', label: 'Trips bawang' },
      },
      {
        cek: 'Ingat asal umbi bibitnya. Gejala yang merata sejak awal pertumbuhan pada petak berbibit turunan sendiri menguatkan dugaan virus. Mengendalikan kutu daunnya melindungi tanaman yang BELUM terkena, dan tidak menyembuhkan satu pun yang sudah bergaris.',
        membantah: { id: 'op:pst:00000002', label: 'Kutu daun persik' },
      },
    ],
  },
];

const PINTU_TOMAT_KENTANG = [
  {
    id: 'op:pst:00000020',
    dari: 'op:pst:00001010',
    nama: 'Penyakit Hawar Daun',
    key: 'hawar-daun-solanaceae',
    label: 'Hawar daun',
    inang: [KENTANG, TOMAT],
    definition:
      'Oomycete, bukan jamur sejati — dan pembedaan itu menentukan bahan aktifnya: metalaksil, dimetomorf, dan simoksanil bekerja padanya, banyak fungisida untuk jamur sejati tidak. Pasangan OPT–komoditas dengan pendaftaran terbanyak KEDUA di seluruh registri: 376 baris pada kentang, sesudah wereng coklat pada padi.',
    gejala:
      'Bercak basah kelabu kehijauan pada daun, mulai dari ujung atau tepi, membesar cepat jadi coklat kehitaman. Batang ikut membusuk kecoklatan. Saat cuaca dingin berkabut satu petak bisa habis dalam dua sampai tiga hari — kecepatan itu sendiri gejalanya.',
    pembanding: [
      {
        cek: 'Periksa pagi-pagi saat daun masih basah embun. Cari selaput putih halus tepat di BATAS antara bagian yang sudah mati dan yang masih hijau, di permukaan bawah daun. Bercak kering tidak pernah berselaput putih seperti itu.',
        membantah: { id: 'op:pst:00000021', label: 'Bercak kering' },
      },
      {
        cek: 'Belah umbi (kentang) atau buah (tomat) yang berbercak. Hawar daun memberi busuk coklat kemerahan yang KERAS dan berbatas tidak rata dari kulit ke dalam, tanpa lendir. Layu bakteri memberi cincin pembuluh kecoklatan yang mengeluarkan lendir putih saat ditekan.',
        membantah: { id: 'op:pst:00000009', label: 'Layu bakteri' },
      },
    ],
  },
  {
    id: 'op:pst:00000021',
    dari: 'op:pst:00001056',
    nama: 'Penyakit Bercak Kering',
    key: 'bercak-kering',
    label: 'Bercak kering',
    inang: [TOMAT, KENTANG],
    definition:
      'Menyerang daun TUA lebih dulu, jadi tanaman yang kekurangan hara dan yang sudah berbuah lebat paling cepat terkena. Berjalan lambat — berbeda dari hawar daun, ia jarang menghabiskan petak dalam hitungan hari.',
    gejala:
      'Bercak coklat kehitaman pada daun TUA di bawah lebih dulu, bundar atau bersudut, dengan cincin sepusat di dalamnya seperti sasaran panah dan sering dikelilingi halo kuning. Daun bawah menguning lalu rontok dari bawah ke atas; batang dan buah dekat tangkai bisa ikut berbercak cekung berwarna gelap.',
    pembanding: [
      {
        cek: 'Tatap ke dalam bercaknya kena cahaya miring, lalu raba. Bercak kering bercincin sepusat, tepinya tegas, dan terasa KERING. Hawar daun berair, tepinya kabur, dan meluas jauh lebih cepat.',
        membantah: { id: 'op:pst:00000020', label: 'Hawar daun' },
      },
      {
        cek: 'Ukur bercaknya. Bercak kering seukuran kuku atau lebih dan bercincin; bercak septoria kecil-kecil rapat seukuran kepala jarum, tengahnya kelabu keputihan dengan titik hitam halus di dalamnya.',
        membantah: { id: 'op:pst:00000027', label: 'Bercak daun septoria' },
      },
    ],
  },
  {
    id: 'op:pst:00000022',
    dari: 'op:pst:00001048',
    nama: 'Pengorok Daun',
    key: 'pengorok-daun-kentang',
    label: 'Pengorok daun kentang',
    inang: [KENTANG, TOMAT, MENTIMUN, KACANG_PANJANG, KRISAN],
    definition:
      'Lalat pengorok daun berdaun lebar: kentang, tomat, mentimun, kacang panjang, dan krisan. Pada krisan ia jadi masalah karantina dan bukan cuma masalah hasil, karena bunga potong yang berlorong ditolak. Teks di bawah ditulis untuk daun LEBAR; pada bawang merah lorongnya berjalan di dalam daun yang berongga dan pintunya berdiri sendiri, atas nama Liriomyza chinensis.',
    gejala:
      'Lorong berkelok putih keperakan DI DALAM lapisan daun, melebar makin ke ujung, paling jelas bila daun diterawang ke cahaya. Permukaan daun bertitik putih bekas tusukan yang berjajar. Daun yang penuh lorong mengering dan rontok mulai dari bawah, sementara umbi atau buahnya belum tua.',
    pembanding: [
      {
        cek: 'Terawang daun ke cahaya dan ikuti lorongnya sampai bagian paling lebar. Di situ ada larva kuning bening tanpa kaki sebesar biji wijen. Bercak penyakit tidak punya lorong dan tidak punya larva.',
        membantah: { id: 'op:pst:00000021', label: 'Bercak kering' },
      },
      {
        cek: 'Lihat apakah daunnya benar-benar berlubang. Lorong pengorok berada di ANTARA dua lapisan daun, jadi permukaan atas dan bawah tetap utuh. Kalau daunnya berlubang tembus atau tepinya tergigit, itu ulat.',
        membantah: { id: 'op:pst:00000005', label: 'Ulat grayak' },
      },
    ],
  },
  {
    id: 'op:pst:00000023',
    dari: 'op:pst:00001038',
    nama: 'Penggerek Buah',
    key: 'penggerek-buah',
    label: 'Penggerek buah',
    inang: [TOMAT, CABAI, JAGUNG, SEMANGKA, MELON, TEMBAKAU, KAPAS],
    definition:
      'Polifag, dan teks di bawah sengaja tidak menyebut satu tanaman pun karena cara merusaknya sama di semuanya — tomat, cabai, jagung, tembakau, semangka, melon. Registri masih memuatnya DUA KALI, atas nama Helicoverpa armigera dan nama lamanya Heliothis armigera (13 baris lagi, 8 di antaranya pada tomat); keduanya belum disatukan, jadi produk atas nama yang kedua tidak ikut terdaftar di bawah pintu ini.',
    gejala:
      'Buah atau tongkol berlubang bundar bersih di dekat tangkainya, dan dari lubang itu menyembul kotoran berbutir basah. Di dalam satu buah biasanya hanya ADA SATU ulat, karena yang lebih besar memakan yang lain. Buah yang terlanjur berlubang membusuk dan gugur.',
    pembanding: [
      {
        cek: 'Belah buah yang berlubang. Penggerek buah meninggalkan SATU ulat gemuk bergaris memanjang beserta rongga besar dan kotoran. Lalat buah meninggalkan belatung putih tanpa kaki yang melenting, beberapa sekaligus, dan tidak ada lubang masuk yang bundar.',
        membantah: { id: 'op:pst:00000004', label: 'Lalat buah' },
      },
      {
        cek: 'Lihat lubangnya dari luar. Penggerek buah masuk lewat lubang bundar seukuran ujung pensil dengan kotoran menyembul. Antraknosa tidak berlubang — ia memberi bercak melingkar cekung dengan titik hitam di tengahnya.',
        membantah: { id: 'op:pst:00000007', label: 'Antraknosa' },
      },
    ],
  },
  {
    id: 'op:pst:00000024',
    dari: 'op:pst:00001077',
    nama: 'Hama Trips',
    key: 'trips-kentang',
    label: 'Trips kentang',
    inang: [KENTANG, TOMAT, SEMANGKA, MELON, MENTIMUN, KACANG_PANJANG],
    definition:
      'Trips ketiga yang dikurasi, dan ketiganya TIDAK BISA dibedakan satu sama lain di kebun — pemisahannya menuntut preparat dan mikroskop. Yang membedakan pintunya karena itu TANAMANNYA, bukan spesiesnya: Thrips parvispinus untuk cabai, Thrips tabaci untuk bawang merah, dan yang ini untuk solanaceae, cucurbitaceae, dan kacang-kacangan — inang terluas di antara ketiganya, karena yang dilakukannya sama pada semuanya: mengisap isi sel daun muda.',
    gejala:
      'Daun muda keperakan mengkilap lalu menebal dan mengeras, tepinya melengkung ke atas, dan permukaannya bertitik kotoran hitam sangat halus. Pucuk berhenti memanjang dan tanaman kerdil; pada serangan berat daun berubah kecoklatan seperti terbakar lalu rontok.',
    pembanding: [
      {
        cek: 'Kibaskan pucuk di atas kertas putih. Trips terlihat sebagai serangga kuning kecoklatan sepanjang 1–2 mm yang langsung berlari. Kalau tidak ada yang bergerak dan daunnya tetap menggulung kaku, curigai virus — dan virus tidak bisa disembuhkan semprotan apa pun.',
        membantah: { id: 'op:pst:00000028', label: 'Virus penggulung daun kentang' },
      },
      {
        cek: 'Periksa permukaan daunnya. Trips meninggalkan bidang keperakan tanpa lorong. Kalau ada lorong berkelok DI DALAM daun, itu pengorok daun.',
        membantah: { id: 'op:pst:00000022', label: 'Pengorok daun kentang' },
      },
    ],
  },
  {
    id: 'op:pst:00000025',
    dari: 'op:pst:00001153',
    nama: 'Penggerek Umbi',
    key: 'penggerek-umbi-kentang',
    label: 'Penggerek umbi kentang',
    inang: [KENTANG],
    definition:
      'Menyerang di lahan lewat umbi yang tersembul dari tanah, dan berlanjut di gudang — di gudanglah kerugiannya paling besar, karena satu umbi terserang menulari tumpukan.',
    gejala:
      'Pada daun, lorong lebar tembus pandang di dekat tulang daun, dan pucuk yang layu terkulai karena digerek dari dalam. Pada umbi, lubang kecil di permukaan dengan butiran kotoran menempel di mulutnya; umbi yang dibelah penuh lorong berkelok berisi kotoran, dan daging di sekitarnya menghitam.',
    pembanding: [
      {
        cek: 'Belah umbi yang berlubang. Penggerek umbi meninggalkan lorong berisi kotoran beserta ulat kecil merah jambu atau kehijauan sepanjang kurang dari satu sentimeter. Busuk karena penyakit tidak berlorong dan tidak berkotoran.',
        membantah: { id: 'op:pst:00000020', label: 'Hawar daun' },
      },
      {
        cek: 'Bandingkan lorongnya di daun. Penggerek umbi membuat lorong LEBAR yang menembus dekat tulang daun dan sering berujung pada pucuk yang layu. Lorong pengorok daun tipis, berkelok panjang, dan tidak pernah membuat pucuk layu.',
        membantah: { id: 'op:pst:00000022', label: 'Pengorok daun kentang' },
      },
    ],
  },
  {
    id: 'op:pst:00000026',
    dari: 'op:pst:00001891',
    nama: 'Nematoda Sista Kuning',
    key: 'nematoda-sista-kuning',
    label: 'Nematoda sista kuning',
    inang: [KENTANG],
    definition:
      'Organisme pengganggu tumbuhan KARANTINA. Tidak bisa diberantas dari lahan yang sudah terinfestasi — sistanya bertahan bertahun-tahun di dalam tanah — sehingga yang menentukan justru asal umbi bibit dan lalu lintas tanah serta alat, bukan semprotan. Temuan baru wajib dilaporkan ke petugas karantina. Registri juga memuat Globodera sp. (2 baris lagi) yang belum disatukan; produk atas nama itu tidak ikut terdaftar di bawah pintu ini.',
    gejala:
      'Tanaman kerdil berkelompok pada bagian petak tertentu, daunnya menguning dari bawah dan layu di siang hari walau tanah lembap; umbinya kecil-kecil. Gejalanya MEMBENTUK LINGKARAN atau lajur yang melebar tiap kali kentang ditanam lagi di petak yang sama, bukan tersebar merata.',
    pembanding: [
      {
        cek: 'Cabut tanaman kerdil beserta tanahnya hati-hati, lalu tatap akarnya kena cahaya. Butiran bulat sebesar butir pasir MENEMPEL pada akar — mula-mula putih, lalu kuning keemasan, lalu coklat. Kalau akarnya justru menggembung jadi bagian dari akar itu sendiri, itu nematoda puru akar, bukan sista kuning.',
        membantah: { id: 'op:pst:00000130', label: 'Nematoda puru akar' },
      },
      {
        cek: 'Perhatikan sebaran dan riwayat petaknya. Sista kuning membentuk lingkaran yang MELEBAR di tempat yang sama tiap musim tanam kentang, dan paling parah di petak yang pernah dimasuki bibit atau alat dari luar. Layu karena penyakit tidak mengikuti pola lingkaran yang tetap begitu.',
        membantah: { id: 'op:pst:00000009', label: 'Layu bakteri' },
      },
    ],
  },
  {
    id: 'op:pst:00000027',
    dari: 'op:pst:00001395',
    nama: 'Penyakit Bercak Daun',
    key: 'bercak-daun-septoria',
    label: 'Bercak daun septoria',
    inang: [TOMAT],
    definition:
      'Menular lewat percikan air dari tanah, jadi paling parah pada tanaman yang daun bawahnya menyentuh tanah dan pada musim hujan. Menyerang daun dan tangkai saja — buahnya tidak.',
    gejala:
      'Bercak kecil-kecil rapat pada daun TUA di bawah, bundar seukuran kepala jarum sampai sebesar biji sawi, tengahnya kelabu keputihan dengan tepi coklat gelap. Di dalam bagian kelabu itu ada titik-titik hitam sangat halus. Daun menguning lalu rontok dari bawah ke atas, sementara buahnya sendiri tetap mulus.',
    pembanding: [
      {
        cek: 'Ukur bercaknya dan lihat isinya. Bercak septoria kecil-kecil rapat dengan tengah KELABU bertitik hitam halus. Bercak kering jauh lebih besar, tengahnya coklat bercincin sepusat, dan tidak bertitik hitam.',
        membantah: { id: 'op:pst:00000021', label: 'Bercak kering' },
      },
      {
        cek: 'Periksa buahnya. Septoria menyerang daun dan tangkai saja, buahnya tetap mulus. Kalau buah ikut berbercak coklat keras berminyak, penyebabnya bukan septoria.',
        membantah: { id: 'op:pst:00000020', label: 'Hawar daun' },
      },
    ],
  },
  {
    id: 'op:pst:00000028',
    dari: null,
    key: 'virus-penggulung-daun-kentang',
    label: 'Virus penggulung daun kentang',
    pest_kind: 'disease_viral',
    scientific_name: 'Potato leafroll virus',
    taxonomic_rank: 'species',
    inang: [KENTANG],
    penular: { id: 'op:pst:00000002', label: 'Kutu daun persik' },
    no_mapping_reason:
      'Belum dipetakan ke EPPO maupun GBIF. Kode kandidat tidak diperiksa ke sumbernya dalam sesi ini, dan kode yang tidak diperiksa lebih buruk daripada tidak ada kode. Tidak punya kembaran registri karena tidak satu pun produk terdaftar menyasarnya — sasaran yang tidak pernah muncul di label tidak pernah jadi entitas registri.',
    definition:
      'Ditularkan kutu daun persik dan terbawa umbi bibit; tidak ada pengendalian kuratif. Umbi dari tanaman yang terkena meneruskan virusnya ke musim berikutnya, dan itulah sebab hasil menurun tiap kali bibit diturunkan sendiri — yang dijawab dengan kelas benih G0 sampai G4, bukan dengan semprotan.',
    gejala:
      'Daun TUA di bawah menggulung ke ATAS menutup seperti tabung, terasa kaku dan getas sehingga berderik bila diremas. Warnanya pucat kekuningan, kadang keunguan di tepi. Tanaman kerdil dan tegak kaku, umbinya kecil dan sedikit, dan petak berbibit turunan sendiri terkena lebih parah tiap musim.',
    pembanding: [
      {
        cek: 'Kibaskan pucuk di atas kertas putih dan periksa permukaan daunnya. Tidak ada serangga yang berlari, tidak ada bidang keperakan, tidak ada lorong — yang berubah hanya bentuk dan warna daunnya.',
        membantah: { id: 'op:pst:00000024', label: 'Trips kentang' },
      },
      {
        cek: 'Ingat asal umbi bibitnya dan lihat di mana gejalanya mulai. Virus ini mulai dari daun TUA di bawah dan paling parah pada petak berbibit turunan sendiri. Mengendalikan kutu daunnya melindungi tanaman yang BELUM terkena, dan tidak menyembuhkan satu pun yang sudah menggulung.',
        membantah: { id: 'op:pst:00000002', label: 'Kutu daun persik' },
      },
    ],
  },
];

const PINTU_PADI = [
  {
    id: 'op:pst:00000029',
    dari: 'op:pst:00001009',
    nama: 'Wereng Coklat',
    key: 'wereng-coklat',
    label: 'Wereng coklat',
    definition:
      'Pasangan OPT–komoditas dengan pendaftaran TERBANYAK di seluruh registri: 455 baris pada padi. Selain mengisap, ia menularkan virus kerdil hampa dan kerdil rumput — dan yang sudah tertular tidak bisa disembuhkan semprotan apa pun. Kedua virus itu belum punya pintunya sendiri di sini.',
    gejala:
      'Tanaman menguning lalu mengering seperti terbakar, mulai dari satu titik lalu MELEBAR MEMBUNDAR ke sekelilingnya — dari pematang terlihat sebagai petak gundul di tengah hamparan yang masih hijau. Di pangkal rumpun, tepat di atas permukaan air, ada serangga coklat sebesar biji wijen yang berhamburan turun saat rumpun disibak.',
    pembanding: [
      {
        cek: 'Sibak rumpun dan tunduk sampai pangkal batang, tepat di atas air. Wereng coklat berkerumun DI SITU, bukan di daun atas, dan langsung berhamburan saat disibak. Kalau pangkalnya bersih dan yang mengering justru mulai dari ujung daun, penyebabnya bukan wereng.',
        membantah: { id: 'op:pst:00000036', label: 'Hawar daun bakteri' },
      },
      {
        cek: 'Tangkap satu werengnya dan lihat punggungnya. Wereng coklat coklat merata tanpa garis; wereng punggung putih punya garis putih memanjang jelas di punggung dan lebih sering berada di batang bagian tengah, bukan di pangkal.',
        membantah: { id: 'op:pst:00000040', label: 'Wereng punggung putih' },
      },
    ],
  },
  {
    id: 'op:pst:00000030',
    dari: 'op:pst:00001023',
    nama: 'Penggerek Batang',
    key: 'penggerek-batang-padi',
    label: 'Penggerek batang',
    definition:
      'Sundep saat masih anakan, beluk sesudah malai keluar — satu hama, dua nama, menurut kapan ia menyerang. Registri juga memuatnya atas nama lama Tryporyza incertulas (5 baris) dan sebagai Scirpophaga innotata, penggerek batang putih (4 baris), keduanya belum disatukan; produk atas nama itu tidak ikut terdaftar di bawah pintu ini.',
    gejala:
      'Pucuk anakan muda menguning lalu mati sementara daun lain masih hijau, dan pucuk itu MUDAH DITARIK LEPAS tanpa perlawanan — itu sundep. Sesudah berbunga, malai keluar putih dan hampa seluruhnya sementara batangnya masih hijau — itu beluk. Pada batang ada lubang gerekan kecil.',
    pembanding: [
      {
        cek: 'Tarik pucuk atau malai yang mati. Kalau lepas ringan dan pangkalnya berlubang serta berkotoran, itu gerekan. Malai yang hampa karena walang sangit tidak lepas ditarik dan batangnya tidak berlubang.',
        membantah: { id: 'op:pst:00000035', label: 'Walang sangit' },
      },
      {
        cek: 'Lihat apakah batangnya terpotong. Penggerek meninggalkan batang UTUH dengan lubang kecil dan lorong berisi kotoran di dalamnya; tikus memotong batang miring rapi seperti disayat, dan yang terpotong bergerombol membentuk jalur.',
        membantah: { id: 'op:pst:00000038', label: 'Tikus sawah' },
      },
    ],
  },
  {
    id: 'op:pst:00000031',
    dari: 'op:pst:00001030',
    nama: 'Penyakit Hawar Pelepah',
    key: 'hawar-pelepah',
    label: 'Hawar pelepah',
    definition:
      'Paling parah pada tanaman yang dipupuk nitrogen berlebih dan ditanam rapat, karena jamurnya menjalar lewat pelepah yang saling bersentuhan. Registri juga memuat Rhizoctonia sp. (6 baris) dan Rhizoctonia oryzae (1 baris) yang belum disatukan. Empat baris lagi terdaftar di luar padi — jagung dan kentang — dan teks di bawah ditulis untuk padi.',
    gejala:
      'Bercak lonjong pada PELEPAH dekat permukaan air, mula-mula kelabu kehijauan berair lalu memutih di tengah dengan tepi coklat bergelombang seperti kulit ular. Bercaknya merambat naik ke pelepah dan daun di atasnya; pada serangan berat butiran coklat sebesar biji sawi menempel di pelepah.',
    pembanding: [
      {
        cek: 'Lihat dari mana bercaknya mulai. Hawar pelepah mulai di PELEPAH dekat permukaan air lalu naik. Blas memberi bercak di helai daun mana saja, termasuk yang paling atas, dan bentuknya belah ketupat, bukan lonjong bertepi bergelombang.',
        membantah: { id: 'op:pst:00000032', label: 'Blas' },
      },
      {
        cek: 'Cari butiran coklat keras sebesar biji sawi yang menempel dan mudah lepas dari pelepah — itu sklerotianya. Bercak coklat sempit tidak pernah meninggalkan butiran, dan bercaknya kecil memanjang di helai daun, bukan lonjong di pelepah.',
        membantah: { id: 'op:pst:00000037', label: 'Bercak coklat sempit' },
      },
    ],
  },
  {
    id: 'op:pst:00000032',
    dari: 'op:pst:00001037',
    nama: 'Penyakit Blas',
    key: 'blas',
    label: 'Blas',
    definition:
      'Menyerang dua kali dalam satu musim dengan dua nama: blas daun saat vegetatif, blas leher saat malai keluar — dan yang kedua jauh lebih menentukan hasil karena memutus jalan hara ke bulir. Registri juga memuat Pyricularia grisea (6 baris) dan Pyricularia sp. (1 baris) yang belum disatukan.',
    gejala:
      'Bercak pada daun berbentuk BELAH KETUPAT — lancip di kedua ujung, lebar di tengah — dengan tengah kelabu keputihan dan tepi coklat. Menjelang panen leher malai menghitam dan mengering sehingga malai patah menggantung dan bulirnya hampa, sementara batang di bawahnya masih hijau.',
    pembanding: [
      {
        cek: 'Perhatikan bentuk bercak daunnya. Blas belah ketupat dengan kedua ujung lancip dan melebar di tengah; bercak coklat sempit lurus memanjang seperti garis dan tidak pernah melebar.',
        membantah: { id: 'op:pst:00000037', label: 'Bercak coklat sempit' },
      },
      {
        cek: 'Kalau yang menghitam lehernya, pegang malai yang menggantung. Blas leher memutus tepat di leher, malainya hampa dan mudah patah di titik itu, dan batang di bawahnya tetap hijau. Beluk karena penggerek meninggalkan malai putih UTUH yang bisa ditarik lepas dari batang yang berlubang.',
        membantah: { id: 'op:pst:00000030', label: 'Penggerek batang' },
      },
    ],
  },
  {
    id: 'op:pst:00000033',
    dari: 'op:pst:00001058',
    nama: 'Siput Murbei',
    key: 'keong-mas',
    label: 'Keong mas',
    definition:
      'Paling merusak pada sepuluh sampai dua puluh satu hari pertama sesudah tanam pindah, dan pada tabela sejak benih disebar; sesudah itu batangnya sudah terlalu keras. Registri juga memuat Pomacea sp. dan Pomacea spp. (5 baris) serta Pila ampullacea (1 baris) yang belum disatukan.',
    gejala:
      'Bibit muda hilang atau tinggal potongan mengapung, paling banyak di bagian petak yang genangannya PALING DALAM, sehingga petak jadi jarang berpetak-petak. Di pematang, batang, dan apa saja yang menonjol dari air ada kelompok telur merah muda terang seperti butiran sagu.',
    pembanding: [
      {
        cek: 'Cari kelompok telur MERAH MUDA di pematang, batang padi, atau benda apa pun yang menonjol dari air. Tidak ada hama padi lain yang bertelur merah muda mencolok seperti itu; tikus tidak bertelur dan memotong batang yang sudah tinggi, bukan memakan bibit di bawah air.',
        membantah: { id: 'op:pst:00000038', label: 'Tikus sawah' },
      },
      {
        cek: 'Lihat di mana tanaman hilangnya. Keong mas merusak paling parah di bagian yang genangannya PALING DALAM, dan kerusakannya berhenti begitu air disurutkan sampai macak-macak. Kerusakan yang tidak mengikuti dalamnya air penyebabnya bukan keong.',
      },
    ],
  },
  {
    id: 'op:pst:00000034',
    dari: 'op:pst:00001132',
    nama: 'Hama Putih Palsu',
    key: 'hama-putih-palsu',
    label: 'Hama putih palsu',
    definition:
      'Disebut "palsu" untuk membedakannya dari hama putih (Nymphula depunctalis), yang memotong daun jadi tabung lalu menjatuhkannya ke air. Sering terlihat mengkhawatirkan tetapi jarang menurunkan hasil selama daun bendera masih utuh — dan itu yang paling sering membuat orang menyemprot lebih dulu daripada perlu.',
    gejala:
      'Daun menggulung MEMANJANG searah tulang daun dan terikat benang halus jadi seperti pipa. Bagian dalam gulungan memutih menerawang karena hijau daunnya dikerok, tanpa berlubang tembus. Dari kejauhan petak terlihat memutih berpetak-petak.',
    pembanding: [
      {
        cek: 'Buka gulungan daunnya. Ada ulat hijau bening yang menggeliat mundur cepat saat terganggu, dan permukaan dalam daun tergerus memutih tetapi TIDAK berlubang tembus. Gulungan kosong dengan daun berlubang tembus penyebabnya ulat lain.',
      },
      {
        cek: 'Periksa DAUN BENDERA — daun teratas tepat di bawah malai. Selama daun bendera masih utuh hijau, kerusakan ini hampir tidak menurunkan hasil, dan menyemprot lebih banyak merugikan daripada menolong.',
      },
    ],
  },
  {
    id: 'op:pst:00000035',
    dari: 'op:pst:00001093',
    nama: 'Walang Sangit',
    key: 'walang-sangit',
    label: 'Walang sangit',
    definition:
      'Menyerang pada fase masak susu — sekitar satu sampai dua minggu sesudah berbunga — dan hanya pada fase itu. Di luar jendela itu menyemprotnya tidak menyelamatkan apa pun.',
    gejala:
      'Bulir hampa atau berisi separuh dengan bercak coklat bekas tusukan pada kulitnya, dan gabahnya jadi berkapur. Saat petak dimasuki tercium BAU MENYENGAT khas, dan serangga hijau kecoklatan ramping berkaki panjang beterbangan rendah dari malai.',
    pembanding: [
      {
        cek: 'Masuki petak pagi hari dan cium. Bau menyengat khas itu sendiri sudah penanda, dan serangganya beterbangan dari malai saat rumpun disibak. Kalau tidak ada bau dan tidak ada yang terbang, hampa itu sebabnya lain.',
        membantah: { id: 'op:pst:00000030', label: 'Penggerek batang' },
      },
      {
        cek: 'Lihat malai yang hampa. Walang sangit meninggalkan malai berwarna normal dengan bulir bertusuk dan hampa sebagian; beluk karena penggerek meninggalkan SELURUH malai putih kering dan hampa total.',
        membantah: { id: 'op:pst:00000030', label: 'Penggerek batang' },
      },
    ],
  },
  {
    id: 'op:pst:00000036',
    dari: 'op:pst:00001101',
    nama: 'Penyakit Hawar Daun Bakteri',
    key: 'hawar-daun-bakteri',
    label: 'Hawar daun bakteri',
    definition:
      'Kresek pada tanaman muda, hawar daun pada tanaman dewasa. Menyebar lewat air dan lewat luka, jadi paling parah sesudah hujan deras, angin kencang, atau petak yang baru disiangi — dan pemupukan nitrogen berlebih memperparahnya.',
    gejala:
      'Daun mengering dari UJUNG atau TEPI ke arah pangkal, dengan batas basah bergelombang kekuningan antara bagian yang mati dan yang masih hijau. Pada tanaman muda seluruh daun bisa layu mengering dalam beberapa hari — itu kresek. Pagi hari pada tepi bercak sering ada tetesan kuning kental yang mengering jadi kerak.',
    pembanding: [
      {
        cek: 'UJI GELAS. Potong ujung daun yang bergejala, celupkan ke gelas berisi air bening, diamkan lima menit. Untaian keruh kekuningan yang turun perlahan dari potongan berarti bakteri. Kalau airnya tetap bening, penyebabnya bukan hawar daun bakteri.',
        membantah: { id: 'op:pst:00000037', label: 'Bercak coklat sempit' },
      },
      {
        cek: 'Lihat arah mengeringnya. Hawar daun bakteri berjalan dari ujung atau tepi daun ke pangkal dengan batas bergelombang. Wereng coklat mengeringkan seluruh rumpun sekaligus dari pangkal, dan pangkalnya berkerumun serangga.',
        membantah: { id: 'op:pst:00000029', label: 'Wereng coklat' },
      },
    ],
  },
  {
    id: 'op:pst:00000037',
    dari: 'op:pst:00001125',
    nama: 'Penyakit Bercak Coklat Sempit',
    key: 'bercak-coklat-sempit',
    label: 'Bercak coklat sempit',
    definition:
      'Registri juga memuatnya atas nama lama Cercospora oryzae (14 baris) dan Cercospora sp. (12 baris) yang belum disatukan; produk atas nama itu tidak ikut terdaftar di bawah pintu ini. Menumpuk pada tanaman yang kekurangan kalium dan pada tanah miskin, jadi bercaknya sering pertanda hara, bukan cuma pertanda jamur.',
    gejala:
      'Bercak SEMPIT MEMANJANG lurus searah tulang daun, panjangnya beberapa milimeter sampai satu sentimeter dan lebarnya hanya sekitar satu milimeter, berwarna coklat gelap. Paling banyak pada daun tua menjelang panen; pelepah dan kulit gabah bisa ikut berbercak.',
    pembanding: [
      {
        cek: 'Ukur lebar bercaknya. Bercak coklat sempit selebar sekitar satu milimeter dan lurus memanjang; blas melebar di tengah membentuk belah ketupat dengan kedua ujung lancip.',
        membantah: { id: 'op:pst:00000032', label: 'Blas' },
      },
      {
        cek: 'Lihat di mana ia terbanyak. Bercak coklat sempit menumpuk di helai daun TUA menjelang panen; hawar pelepah tidak berbercak di helai daun melainkan di pelepah dekat permukaan air.',
        membantah: { id: 'op:pst:00000031', label: 'Hawar pelepah' },
      },
    ],
  },
  {
    id: 'op:pst:00000038',
    dari: 'op:pst:00001089',
    nama: 'Tikus Sawah',
    key: 'tikus-sawah',
    label: 'Tikus sawah',
    definition:
      'Kerusakannya bertumpuk pada fase generatif, dan pengendaliannya menuntut gerakan bersama satu hamparan — petak yang dikendalikan sendirian akan dimasuki lagi dari petak tetangga. Registri mencatat "Tikus sawah" juga sebagai KOMODITAS pada tujuh baris; itu keliru di sumbernya, dan produk pada baris-baris itu tidak ikut terdaftar di bawah pintu ini.',
    gejala:
      'Batang terpotong MIRING dan rapi seperti disayat, pada ketinggian yang seragam, dan yang terpotong bergerombol membentuk jalur atau petak bertepi tegas. Kerusakan mulai dari pinggir petak dekat pematang, saluran, atau semak, lalu masuk ke tengah. Ada jalur pipih bekas lalu-lalang di antara rumpun dan lubang di pematang.',
    pembanding: [
      {
        cek: 'Periksa bekas potongannya. Tikus memotong batang miring rapi seperti disayat pisau, dan potongannya sering ditinggalkan di tempat. Batang yang mati karena penggerek TIDAK terpotong — ia utuh dengan lubang kecil dan lorong di dalamnya.',
        membantah: { id: 'op:pst:00000030', label: 'Penggerek batang' },
      },
      {
        cek: 'Ikuti bentuk kerusakannya. Tikus masuk dari PINGGIR petak dekat pematang atau saluran dan meninggalkan jalur pipih di antara rumpun. Petak kering karena wereng justru mulai dari satu titik di tengah lalu melebar membundar.',
        membantah: { id: 'op:pst:00000029', label: 'Wereng coklat' },
      },
    ],
  },
  {
    id: 'op:pst:00000039',
    dari: 'op:pst:00001168',
    nama: 'Wereng Hijau',
    key: 'wereng-hijau',
    label: 'Wereng hijau',
    definition:
      'Kerusakan isapannya sendiri jarang menentukan hasil. Yang menentukan penularannya: ia penular tungro, dan tungro tidak bisa disembuhkan semprotan apa pun. Registri juga memuat Nephotettix sp. dan Nephotetix sp. (6 baris) yang belum disatukan.',
    gejala:
      'Serangga hijau ramping sepanjang sekitar 3–5 mm melompat dan terbang pendek dari DAUN ATAS saat rumpun disibak, terutama pada tanaman muda. Daun bisa berbintik kuning halus, tetapi tanamannya sendiri sering tampak masih baik — dan justru itu yang menyesatkan.',
    pembanding: [
      {
        cek: 'Sibak rumpun dan lihat di ketinggian mana serangganya. Wereng hijau berada di DAUN ATAS dan melompat; wereng coklat berkerumun di pangkal batang tepat di atas air dan berhamburan turun.',
        membantah: { id: 'op:pst:00000029', label: 'Wereng coklat' },
      },
      {
        cek: 'Periksa apakah ada tanaman kerdil berdaun kuning jingga di sekitarnya. Kalau ada, yang menentukan bukan wereng hijaunya melainkan tungro yang dibawanya — dan menyemprot tidak menyembuhkan tanaman yang sudah tertular.',
        membantah: { id: 'op:pst:00000041', label: 'Tungro' },
      },
    ],
  },
  {
    id: 'op:pst:00000040',
    dari: 'op:pst:00001205',
    nama: 'Wereng Punggung Putih',
    key: 'wereng-punggung-putih',
    label: 'Wereng punggung putih',
    definition:
      'Datang lebih awal dalam satu musim daripada wereng coklat, umumnya pada fase vegetatif, dan jarang menimbulkan petak terbakar seluas itu. Membedakan keduanya menentukan karena ambang pengendaliannya berbeda.',
    gejala:
      'Daun menguning dari ujung dan tanaman kerdil pada fase anakan, dengan serangga sebesar biji wijen di batang bagian TENGAH sampai atas. Punggungnya bergaris putih memanjang jelas di antara sayap. Serangan berat mengeringkan rumpun, tetapi petaknya jarang selebar dan secepat wereng coklat.',
    pembanding: [
      {
        cek: 'Tangkap satu dan lihat punggungnya. Wereng punggung putih punya garis PUTIH memanjang jelas di punggung; wereng coklat coklat merata tanpa garis.',
        membantah: { id: 'op:pst:00000029', label: 'Wereng coklat' },
      },
      {
        cek: 'Lihat di ketinggian mana ia berkerumun. Punggung putih lebih banyak di batang bagian tengah dan di daun; wereng coklat menumpuk di pangkal tepat di atas permukaan air.',
        membantah: { id: 'op:pst:00000029', label: 'Wereng coklat' },
      },
    ],
  },
  {
    id: 'op:pst:00000041',
    dari: null,
    key: 'tungro',
    label: 'Tungro',
    pest_kind: 'disease_viral',
    scientific_name: 'Rice tungro virus complex',
    taxonomic_rank: 'group',
    penular: { id: 'op:pst:00000039', label: 'Wereng hijau' },
    no_mapping_reason:
      'Belum dipetakan ke EPPO maupun GBIF. Kode kandidat tidak diperiksa ke sumbernya dalam sesi ini, dan kode yang tidak diperiksa lebih buruk daripada tidak ada kode. Tidak punya kembaran registri karena tidak satu pun produk terdaftar menyasarnya — sasaran yang tidak pernah muncul di label tidak pernah jadi entitas registri. Ditulis sebagai KELOMPOK, bukan spesies, karena memang dua virus.',
    definition:
      'Dua virus sekaligus — RTBV dan RTSV — dan keduanya harus ada untuk menimbulkan gejala penuh. Ditularkan wereng hijau, tidak terbawa benih, dan tidak bisa disembuhkan. Yang menentukan justru tanam serempak dan varietas tahan, bukan semprotan.',
    gejala:
      'Tanaman kerdil dengan anakan sedikit, dan daunnya menguning sampai JINGGA kemerahan mulai dari UJUNG daun muda lalu turun. Gejalanya muncul BERKELOMPOK di beberapa titik dalam petak, bukan merata, dan melebar dari arah petak tetangga yang lebih tua.',
    pembanding: [
      {
        cek: 'Periksa daun yang menguning jingga itu sendiri. Tidak ada bercak, tidak ada lubang, tidak ada bekas gerekan — yang berubah hanya warna, tinggi tanaman, dan jumlah anakannya. Petak kering karena wereng coklat mengering coklat dari PANGKAL, dan pangkalnya berkerumun serangga.',
        membantah: { id: 'op:pst:00000029', label: 'Wereng coklat' },
      },
      {
        cek: 'Lihat sebarannya dan umur petak di sekitarnya. Tungro muncul berkelompok dan melebar dari arah petak yang lebih tua. Mengendalikan wereng hijaunya melindungi tanaman yang BELUM tertular; yang sudah menguning jingga tidak akan pulih.',
        membantah: { id: 'op:pst:00000039', label: 'Wereng hijau' },
      },
    ],
  },
];

const PINTU_JAGUNG = [
  {
    id: 'op:pst:00000042',
    dari: 'op:pst:00001033',
    nama: 'Ulat Grayak',
    key: 'ulat-grayak-jagung',
    label: 'Ulat grayak jagung',
    definition:
      'Masuk Indonesia 2019 dan menyebar ke seluruh sentra dalam dua tahun; 151 baris penggunaan berlabel menjadikannya sasaran terbanyak pada jagung sejauh ini. Berbeda dari ulat grayak Spodoptera litura yang lebih dulu ada di sini: yang ini masuk ke DALAM corong pucuk dan bertahan di situ, sehingga semprotan yang tidak sampai ke corong tidak mengenainya.',
    gejala:
      'Daun muda berlubang-lubang berbaris sejajar seperti ditembak jarum saat daunnya membuka — bekas gigitan waktu daun masih tergulung di pucuk. Di corong pucuk menumpuk butiran kotoran basah seperti serbuk gergaji, dan pucuk yang terserang berat rusak compang-camping. Pada jagung tua ulatnya masuk ke ujung tongkol.',
    pembanding: [
      {
        cek: 'Tengok ke DALAM corong pucuk. Ulat grayak jagung ada di situ bersama kotoran basahnya; di kepalanya ada tanda huruf Y terbalik berwarna terang, dan di ruas belakangnya empat bintik hitam tersusun persegi. Kalau pucuknya bersih dan yang berlubang hanya daun tua, penyebabnya ulat lain.',
        membantah: { id: 'op:pst:00000005', label: 'Ulat grayak' },
      },
      {
        cek: 'Perhatikan pola lubangnya. Lubang berbaris sejajar melintang daun berarti daun itu digigit saat masih tergulung — khas hama yang hidup di pucuk. Belalang menggigit dari TEPI daun ke dalam dan tidak meninggalkan kotoran di pucuk.',
        membantah: { id: 'op:pst:00000045', label: 'Belalang' },
      },
    ],
  },
  {
    id: 'op:pst:00000043',
    dari: 'op:pst:00001075',
    nama: 'Penyakit Bulai',
    key: 'bulai',
    label: 'Bulai',
    definition:
      'Oomycete, bukan jamur sejati — dan itu menentukan bahan aktifnya: metalaksil bekerja padanya, banyak fungisida untuk jamur sejati tidak. Tanaman yang sudah bergejala TIDAK bisa disembuhkan; yang menentukan perlakuan benih sebelum tanam, varietas tahan, dan mencabut tanaman sakit sejak dini. Lima dari pendaftarannya memang tertulis untuk benih jagung dan perlakuan benih, bukan untuk semprotan di lahan. Registri juga memuat satu baris atas ejaan "Perenospora maydis" yang belum disatukan.',
    gejala:
      'Garis-garis KLOROTIK memanjang searah tulang daun, putih kekuningan, mulai dari pangkal daun muda lalu meluas ke seluruh helai. Pagi hari saat daun masih berembun, permukaan BAWAH daun berselaput putih halus seperti tepung. Tanaman kerdil dengan ruas memendek, dan yang terserang sejak muda tidak berbuah sama sekali.',
    pembanding: [
      {
        cek: 'Periksa pagi-pagi sebelum matahari naik, saat daun masih basah. Selaput putih seperti tepung di permukaan BAWAH daun hanya dibuat bulai; siang hari selaput itu hilang dan yang tersisa cuma garis kuning yang mudah dikira kekurangan hara.',
      },
      {
        cek: 'Lihat arah dan bentuk gejalanya. Bulai memberi GARIS memanjang searah tulang daun dan menguningkan seluruh helai dari pangkal; hawar daun jagung memberi bercak lonjong panjang seperti perahu dengan tepi tegas, dan daun di sekitarnya tetap hijau.',
        membantah: { id: 'op:pst:00000044', label: 'Hawar daun jagung' },
      },
    ],
  },
  {
    id: 'op:pst:00000044',
    dari: 'op:pst:00001118',
    nama: 'Penyakit Hawar Daun',
    key: 'hawar-daun-jagung',
    label: 'Hawar daun jagung',
    definition:
      'Paling parah pada musim hujan dan di dataran menengah ke atas, dan menular dari sisa tanaman jagung musim sebelumnya — jadi petak yang terus-menerus ditanami jagung paling berisiko. Registri juga memuat Helminthosporium sp. dan spp. (3 baris) serta H. maydis, hawar daun selatan (1 baris), yang belum disatukan.',
    gejala:
      'Bercak LONJONG PANJANG seperti perahu pada daun, panjangnya beberapa sampai belasan sentimeter, kelabu kecoklatan dengan tepi tegas dan sejajar tulang daun. Mulai dari daun BAWAH lalu naik; bercak yang bersambung membuat seluruh daun mengering sementara daun di atasnya masih hijau.',
    pembanding: [
      {
        cek: 'Lihat bentuk dan batas gejalanya. Hawar daun jagung lonjong panjang seperti perahu dengan tepi tegas, dan daun di antara bercaknya tetap hijau; bulai tidak berbercak melainkan menggarisi SELURUH helai daun dengan kuning pucat.',
        membantah: { id: 'op:pst:00000043', label: 'Bulai' },
      },
      {
        cek: 'Raba permukaan bercaknya dengan jari. Hawar daun jagung kering rata dan tidak meninggalkan apa pun di jari; karat daun meninggalkan bintil kecil yang pecah dan menyisakan SERBUK coklat kemerahan.',
        membantah: { id: 'op:pst:00001662', label: 'Penyakit Karat' },
      },
    ],
  },
  {
    id: 'op:pst:00000045',
    dari: 'op:pst:00001112',
    nama: 'Hama Belalang',
    key: 'belalang',
    label: 'Belalang',
    inang: [JAGUNG, PADI],
    definition:
      'Belalang yang tinggal di petaknya dan tidak berpindah bergerombol — itu yang membedakannya dari belalang kembara, dan bedanya menentukan apakah tindakannya per petak atau se-hamparan. Oxya justru belalang padi yang paling lazim, jadi padi ikut jadi inangnya di samping jagung; cara merusaknya sama di keduanya, sehingga teks di bawah sengaja tidak menyebut satu tanaman pun.',
    gejala:
      'Daun tergigit dari TEPI ke dalam dengan tepi bergerigi tidak beraturan, dan tulang daun utama sering ditinggalkan utuh. Kerusakan paling banyak di pinggir petak yang berbatasan dengan rumput, pematang, atau lahan bera, lalu berkurang ke arah tengah.',
    pembanding: [
      {
        cek: 'Berjalan menyusuri petak pada siang hari yang terik. Belalang melompat dan terbang pendek di depan kaki; tidak ada hama daun lain yang melompat seperti itu. Kalau tidak ada yang melompat, gigitan itu bukan belalang.',
      },
      {
        cek: 'Lihat dari mana daunnya tergigit. Belalang menggigit dari TEPI daun ke dalam dan tidak meninggalkan kotoran di pucuk; ulat grayak jagung melubangi tengah daun dan menumpuk kotoran basah di corong pucuk.',
        membantah: { id: 'op:pst:00000042', label: 'Ulat grayak jagung' },
      },
    ],
  },
  {
    id: 'op:pst:00000046',
    dari: 'op:pst:00001242',
    nama: 'Lalat Bibit',
    key: 'lalat-bibit',
    label: 'Lalat bibit',
    inang: [JAGUNG, PADI],
    definition:
      'Menyerang tanaman berumur kurang dari tiga minggu; sesudah itu batangnya sudah terlalu keras. Lalat bibit jagung dan lalat bibit padi lalat yang SAMA marganya dan memberi kerusakan yang sama — pucuk mati sementara daun luar masih hijau — sehingga pintunya berinang keduanya dan teksnya sengaja tidak menyebut satu tanaman pun. Registri memecahnya jadi tiga entitas Atherigona, dan hanya satu yang cocok tepat sampai spesies di GBIF; ketiganya toh tidak bisa dibedakan di kebun.',
    gejala:
      'Pucuk tanaman muda menguning lalu mati dan MUDAH DITARIK LEPAS, sementara daun di bawahnya masih hijau. Tanaman jadi kerdil dan bertunas banyak dari pangkal, atau mati sama sekali sehingga petak terlihat jarang berpetak-petak pada tiga minggu pertama.',
    pembanding: [
      {
        cek: 'Belah pangkal batang tanaman yang pucuknya mati. Ada BELATUNG putih tanpa kaki di dalam pangkal dan jaringan di sekitarnya membusuk berbau. Penggerek batang meninggalkan ulat BERKAKI di dalam lorong bersih berisi butiran kotoran.',
        membantah: { id: 'op:pst:00000047', label: 'Penggerek batang jagung' },
      },
      {
        cek: 'Ingat umur tanamannya. Lalat bibit hanya menyerang pada tiga minggu pertama. Pucuk yang mati pada tanaman yang sudah lebih tua penyebabnya bukan lalat bibit, sebanyak apa pun yang mati.',
      },
    ],
  },
  {
    id: 'op:pst:00000047',
    dari: 'op:pst:00001310',
    nama: 'Penggerek Batang',
    key: 'penggerek-batang-jagung',
    label: 'Penggerek batang jagung',
    definition:
      'Registri juga memuat Ostrinia nubilalis, penggerek batang jagung EROPA, pada lima baris. Spesies itu tidak ada di Indonesia, dan kelima barisnya hampir pasti salah nama untuk yang ini — tetapi keduanya belum disatukan, jadi produk atas nama itu tidak ikut terdaftar di bawah pintu ini.',
    gejala:
      'Lubang gerekan bulat di ruas batang dengan butiran kotoran menyembul di mulutnya, sering berbaris ke atas mengikuti ruas. Batang mudah patah tepat di titik gerekan saat berangin, dan tangkai bunga jantan di pucuk patah menggantung. Tongkol bisa ikut digerek dari pangkalnya.',
    pembanding: [
      {
        cek: 'Belah batang yang berlubang membujur. Ada lorong memanjang berisi kotoran beserta ulat berwarna krem kecoklatan bertitik gelap di tiap ruas. Lalat bibit meninggalkan belatung putih TANPA KAKI di pangkal, bukan ulat berkaki di dalam ruas batang.',
        membantah: { id: 'op:pst:00000046', label: 'Lalat bibit' },
      },
      {
        cek: 'Lihat di mana lubangnya. Penggerek batang melubangi BATANG dan tangkai bunga jantan pada tanaman yang sudah tinggi; ulat grayak jagung merusak dari corong pucuk dan ujung tongkol, dan tidak menggerek ruas batang.',
        membantah: { id: 'op:pst:00000042', label: 'Ulat grayak jagung' },
      },
    ],
  },
  {
    id: 'op:pst:00000048',
    dari: 'op:pst:00001284',
    nama: 'Kutu Daun',
    key: 'kutu-daun-jagung',
    label: 'Kutu daun jagung',
    definition:
      'Paling menentukan pada fase berbunga, saat kutu menutupi bunga jantan dan mengganggu penyerbukan. Di luar fase itu koloni yang tampak banyak sering tidak menurunkan hasil, dan musuh alaminya biasanya menyusul dalam satu sampai dua minggu.',
    gejala:
      'Koloni kutu hijau kebiruan rapat pada bunga jantan di pucuk, di ketiak daun muda, dan di ujung tongkol. Permukaan daun di bawahnya lengket dan lama-lama ditumbuhi jelaga hitam; semut naik-turun di batang.',
    pembanding: [
      {
        cek: 'Raba permukaan daun di bawah koloninya. Lengket berarti embun madu, dan itu hanya dihasilkan kutu. Jelaga hitam yang tumbuh di atasnya bisa DIUSAP HILANG dan tidak menyerang daunnya — jadi yang perlu ditangani kutunya, bukan jelaganya.',
      },
      {
        cek: 'Periksa fase tanamannya sebelum memutuskan. Kalau bunga jantan belum keluar atau penyerbukan sudah selesai, koloni sebanyak apa pun jarang menurunkan hasil. Cari juga kepik dan larvanya di antara koloni — kalau ada, musuh alaminya sudah bekerja.',
      },
    ],
  },
];

const PINTU_KUBIS = [
  {
    id: 'op:pst:00000049',
    dari: 'op:pst:00001028',
    nama: 'Perusak Daun',
    key: 'ulat-daun-kubis',
    label: 'Ulat daun kubis',
    definition:
      'Ulat tritip. Sasaran terbanyak pada kubis — 176 baris — dan hama sayuran dengan riwayat resistensi paling panjang di dunia: ia sudah kebal terhadap hampir setiap golongan insektisida di suatu tempat. Yang menentukan karena itu merotasi GOLONGAN bahan aktif, bukan berganti merek; dua merek berbeda yang segolongan tidak menghitung sebagai rotasi.',
    gejala:
      'Daun berlubang seperti JENDELA: lapisan bawah daun dikerok habis sementara lapisan atasnya tertinggal sebagai selaput bening, lalu sobek jadi lubang. Ulat hijau kecil kurang dari satu sentimeter menggeliat cepat dan MENJATUHKAN DIRI menggantung pada benang sutra saat daun disentuh. Kepompongnya berjaring seperti anyaman kasar, menempel di bawah daun.',
    pembanding: [
      {
        cek: 'Sentuh daun yang berulat. Ulat daun kubis menjatuhkan diri dan menggantung pada benang sutra — tidak ada ulat kubis lain yang melakukannya. Ulat krop tetap di tempat, dan justru bergerak lebih dalam ke krop.',
        membantah: { id: 'op:pst:00000050', label: 'Ulat krop' },
      },
      {
        cek: 'Terawang daun yang rusak ke arah cahaya. Ulat daun kubis meninggalkan selaput bening seperti jendela sebelum sobek; bekicot dan siput memakan daun sampai tembus sejak awal, dengan tepi tergerus halus.',
        membantah: { id: 'op:pst:00000051', label: 'Bekicot' },
      },
    ],
  },
  {
    id: 'op:pst:00000050',
    dari: 'op:pst:00001047',
    nama: 'Ulat Krop',
    key: 'ulat-krop',
    inang: [KUBIS, SAWI],
    label: 'Ulat krop',
    definition:
      'Jauh lebih menentukan daripada ulat daun kubis begitu krop mulai terbentuk, karena kerusakannya DI DALAM krop dan tidak terjangkau semprotan yang hanya membasahi daun luar. Registri juga memuatnya atas nama lama Crocidolomia binotalis (14 baris) yang belum disatukan; produk atas nama itu tidak ikut terdaftar di bawah pintu ini.',
    gejala:
      'Titik tumbuh dan daun muda di tengah rumpun habis dimakan sehingga krop gagal terbentuk atau berlubang di dalamnya. Ulatnya berkelompok, hijau bergaris memanjang dan berbulu halus, dan di antara daun yang dimakan menumpuk kotoran hijau kehitaman. Dari luar tanaman bisa tampak masih baik.',
    pembanding: [
      {
        cek: 'Buka krop atau daun muda di tengah rumpun. Ulat krop ada DI DALAM bersama kotorannya; ulat daun kubis makan di permukaan daun luar dan tidak masuk ke titik tumbuh.',
        membantah: { id: 'op:pst:00000049', label: 'Ulat daun kubis' },
      },
      {
        cek: 'Cari kelompok telurnya di permukaan bawah daun. Ulat krop bertelur BERKELOMPOK menyerupai sisik yang saling menindih; ulat daun kubis bertelur satu-satu tersebar dan telurnya nyaris tidak terlihat.',
        membantah: { id: 'op:pst:00000049', label: 'Ulat daun kubis' },
      },
    ],
  },
  {
    id: 'op:pst:00000051',
    dari: 'op:pst:00001211',
    nama: 'Siput Babi',
    key: 'bekicot',
    label: 'Bekicot',
    inang: [KUBIS, KUBIS_BUNGA],
    definition:
      'Paling merusak di persemaian dan pada dua sampai tiga minggu pertama sesudah tanam pindah; aktif malam hari dan sesudah hujan. Registri memuat siput lain — Filicaulis bleekeri, Bradybaena similaris, Parmarion pupillaris — yang kini dicakup pintu ini karena kedua ciri yang dipakainya, jejak lendir dan tepi gerusan yang halus, tidak menyentuh cangkang sama sekali.',
    gejala:
      'Daun berlubang besar tidak beraturan dengan tepi tergerus halus, dan bibit muda bisa habis sama sekali dalam semalam. Ada JEJAK LENDIR mengkilap yang mengering seperti perak di daun, batang, dan permukaan tanah, dengan butiran kotoran memanjang di dekatnya.',
    pembanding: [
      {
        cek: 'Periksa malam hari dengan senter, atau pagi-pagi sekali. Jejak lendir mengkilap yang mengering seperti perak hanya ditinggalkan siput dan bekicot; tidak ada ulat yang meninggalkannya. Siang hari mereka bersembunyi di bawah mulsa, sisa tanaman, atau bongkahan tanah.',
      },
      {
        cek: 'Lihat tepi lubangnya. Bekicot menggerus tepi lubang jadi halus dan berlekuk lebar; ulat meninggalkan tepi bergerigi beserta butiran kotoran, bukan lendir.',
        membantah: { id: 'op:pst:00000049', label: 'Ulat daun kubis' },
      },
    ],
  },
  {
    id: 'op:pst:00000052',
    dari: 'op:pst:00001286',
    nama: 'Penyakit Akar Gada',
    key: 'akar-gada',
    label: 'Akar gada',
    definition:
      'Bertahan di tanah sepuluh tahun atau lebih sebagai spora istirahat, dan menyebar lewat tanah yang menempel di alat, sepatu, dan bibit. Tidak ada semprotan yang menyembuhkan tanaman yang sudah bergejala: yang menentukan pengapuran sampai pH tanah naik, rotasi dengan bukan-brassica, dan bibit dari persemaian yang bebas — enam baris pendaftarannya tidak mengubah kenyataan itu.',
    gejala:
      'Tanaman layu di siang hari lalu segar lagi menjelang sore, berulang beberapa hari, sampai akhirnya kerdil dan menguning; kropnya kecil atau tidak terbentuk sama sekali. Gejalanya BERKELOMPOK di bagian petak yang paling lembap, dan bagian itu melebar tiap kali brassica ditanam lagi di situ.',
    pembanding: [
      {
        cek: 'Cabut tanaman yang layu beserta akarnya, lalu cuci tanahnya. Akarnya menggembung jadi bonggol tidak beraturan seperti gada atau jari yang bengkak. Tidak ada penyakit kubis lain yang membentuknya — dan begitu terlihat, petak itu terinfestasi untuk bertahun-tahun ke depan.',
      },
      {
        cek: 'Perhatikan pola layunya. Akar gada membuat tanaman layu siang lalu pulih sore, berulang selama beberapa hari; busuk lunak bakteri membuat jaringannya hancur berbau dan tanaman tidak pernah pulih.',
        membantah: { id: 'op:pst:00000054', label: 'Busuk lunak' },
      },
    ],
  },
  {
    id: 'op:pst:00000053',
    dari: 'op:pst:00001248',
    nama: 'Penyakit Bercak Daun',
    key: 'bercak-daun-alternaria',
    inang: [KUBIS, SAWI],
    label: 'Bercak daun alternaria',
    definition:
      'Terdaftar merata pada kubis dan sawi, dan gejalanya sama pada seluruh brassica. Menular lewat benih dan sisa tanaman; paling parah pada musim hujan dan pada daun yang sudah tua atau terluka.',
    gejala:
      'Bercak bundar coklat kehitaman pada daun TUA lebih dulu, dengan cincin sepusat di dalamnya seperti sasaran panah dan sering dikelilingi halo kuning. Bercak yang bersambung membuat daun menguning lalu kering. Pada krop yang sudah terbentuk, bercaknya menurunkan mutu jual walau kropnya masih utuh.',
    pembanding: [
      {
        cek: 'Tatap ke dalam bercaknya. Bercak alternaria bercincin sepusat, tepinya tegas, dan terasa kering. Busuk hitam tidak bercincin: ia masuk dari TEPI daun membentuk huruf V kuning dengan tulang daun di dalamnya menghitam.',
        membantah: { id: 'op:pst:00001198', label: 'Penyakit Busuk Hitam' },
      },
      {
        cek: 'Lihat daun mana yang kena lebih dulu. Bercak alternaria menumpuk di daun TUA di luar; ulat daun kubis melubangi daun mana saja termasuk yang muda, dan lubangnya berselaput bening sebelum sobek.',
        membantah: { id: 'op:pst:00000049', label: 'Ulat daun kubis' },
      },
    ],
  },
  {
    id: 'op:pst:00000054',
    dari: 'op:pst:00001499',
    nama: 'Penyakit Bakteri Busuk Lunak',
    key: 'busuk-lunak',
    label: 'Busuk lunak',
    definition:
      'Masuk lewat LUKA — bekas gigitan ulat, bekas potong, atau retak karena hujan sesudah kering — jadi mengendalikan ulat krop ikut menurunkan busuk lunak. Berkembang cepat pada suhu hangat dan lembap, dan berlanjut di dalam keranjang sesudah panen. Registri juga memuat busuk hitam (Xanthomonas campestris) pada kubis dan kembang kol (4 baris), tetapi entitas itu didominasi TUJUH baris pada padi — hampir pasti salah nama, karena bakteri hawar padi adalah X. oryzae — sehingga menaikkannya berarti membuka pintu bergejala kubis untuk padi. Busuk hitam karena itu belum berpintu di sini.',
    gejala:
      'Krop atau pangkal daun melunak dan berair, warnanya coklat kelabu, dan jaringannya hancur jadi bubur yang menempel di tangan. Baunya BUSUK MENYENGAT dan khas. Menjalar cepat — satu krop bisa hancur dalam dua sampai tiga hari — dan menular ke krop di sebelahnya lewat air.',
    pembanding: [
      {
        cek: 'Tekan bagian yang lunak, lalu cium. Busuk lunak bakteri berbau menyengat dan mengeluarkan cairan keruh berlendir saat ditekan; busuk karena jamur berbau apak dan jaringannya tidak hancur jadi bubur.',
      },
      {
        cek: 'Cari luka tempat ia masuk. Busuk lunak hampir selalu mulai dari bekas gigitan ulat, bekas potong, atau retakan — bukan dari daun yang utuh. Kalau tidak ada luka dan yang layu justru tanaman berakar menggembung, penyebabnya akar gada.',
        membantah: { id: 'op:pst:00000052', label: 'Akar gada' },
      },
    ],
  },
];

const PINTU_KEDELAI = [
  {
    id: 'op:pst:00000055',
    dari: 'op:pst:00001055',
    nama: 'Penggerek Polong',
    key: 'penggerek-polong',
    label: 'Penggerek polong',
    inang: [KEDELAI, KACANG_HIJAU],
    definition:
      'Terdaftar juga pada kacang hijau (3 baris) dan cara merusaknya sama pada legum berpolong. Kerusakannya baru terlihat saat polong DIBUKA — dari luar polong yang terserang sering tampak normal — jadi keputusan menyemprot harus diambil pada fase pembentukan polong, bukan sesudah melihat kerusakannya. Registri juga memuat Etiella sp. (1 baris) dan Maruca testulalis (2 baris) yang belum disatukan.',
    gejala:
      'Polong berlubang kecil bundar pada kulitnya, kadang dengan butiran kotoran menempel di mulut lubang, sementara polongnya sendiri masih hijau. Biji di dalamnya berlubang atau habis dimakan dan tergantikan kotoran; satu ulat bisa pindah ke beberapa biji dalam satu polong. Polong yang terserang berat mengering lebih cepat daripada yang lain.',
    pembanding: [
      {
        cek: 'Buka polong yang berlubang. Penggerek polong meninggalkan ULAT di dalam beserta kotorannya, dan bijinya berlubang atau habis. Pengisap polong tidak melubangi kulit — ia menusuk halus, dan bijinya mengempis atau bernoda tanpa ada ulat di dalam.',
        membantah: { id: 'op:pst:00000060', label: 'Pengisap polong' },
      },
      {
        cek: 'Periksa sebaran polong yang rusak di seluruh petak, bukan hanya yang ada di tangan. Kerusakan penggerek polong menyebar merata; kalau yang rusak menumpuk di pinggir petak, curigai kepik yang datang dari luar.',
        membantah: { id: 'op:pst:00000059', label: 'Kepik hijau' },
      },
    ],
  },
  {
    id: 'op:pst:00000056',
    dari: 'op:pst:00001073',
    nama: 'Penggulung Daun',
    key: 'penggulung-daun',
    label: 'Penggulung daun',
    inang: [KEDELAI, KACANG_HIJAU, KACANG_TANAH],
    definition:
      'Identitasnya di GBIF hanya tertambat sampai GENUS — nama spesiesnya tidak dikenali — jadi yang dijanjikan pintu ini CIRINYA, bukan nama spesiesnya. Terdaftar juga pada kacang hijau dan kacang tanah (3 baris). Registri juga memuat ejaan Lamprosemma indicata dan Lamprosema indicate (2 baris) yang belum disatukan.',
    gejala:
      'Daun terlipat atau tergulung dan terikat benang sutra jadi seperti kantong, dan permukaan di dalamnya dikerok sampai tinggal selaput. Beberapa helai daun bisa terikat jadi satu. Dari kejauhan tanaman terlihat berbintik coklat kering di antara daun yang masih hijau.',
    pembanding: [
      {
        cek: 'Buka lipatan daunnya. Ada ulat hijau bening yang bergerak cepat mundur saat terganggu, beserta butiran kotoran di dalam lipatan. Ulat jengkal tidak melipat daun — ia makan di permukaan terbuka dan berjalan melengkung seperti mengukur.',
        membantah: { id: 'op:pst:00000061', label: 'Ulat jengkal' },
      },
      {
        cek: 'Lihat apakah daunnya TERIKAT. Penggulung daun mengikat daun dengan benang sutra sehingga lipatannya tidak membuka sendiri; daun yang keriting karena kutu atau virus tidak terikat dan bisa dibuka tanpa merobek.',
        membantah: { id: 'op:pst:00000003', label: 'Kutu kebul' },
      },
    ],
  },
  {
    id: 'op:pst:00000057',
    dari: 'op:pst:00001131',
    nama: 'Penyakit Karat Daun',
    key: 'karat-daun-kedelai',
    label: 'Karat daun kedelai',
    definition:
      'Penyakit kedelai paling menentukan di lahan lembap dan pada musim hujan; hasil turun banyak kalau menyerang sebelum polong terisi penuh. Sporanya terbawa angin dari petak lain, jadi menanam serempak satu hamparan ikut menentukan. Registri juga memuat Phakospora spp. (1 baris) yang belum disatukan.',
    gejala:
      'Bintil-bintil kecil coklat kemerahan MENONJOL di permukaan BAWAH daun, mula-mula pada daun bawah lalu naik. Dari permukaan atas terlihat sebagai bercak bersudut kecil kecoklatan di antara tulang daun halus. Daun menguning lalu rontok dari bawah ke atas, dan tanaman gundul sebelum polongnya tua.',
    pembanding: [
      {
        cek: 'Balik daun dan raba permukaan bawahnya dengan jari. Karat daun meninggalkan bintil menonjol yang pecah dan MENYISAKAN SERBUK coklat di jari; bercak mata katak rata dan tidak berserbuk.',
        membantah: { id: 'op:pst:00000062', label: 'Bercak mata katak' },
      },
      {
        cek: 'Lihat dari daun mana ia mulai dan ke mana ia berjalan. Karat mulai dari daun BAWAH lalu naik, dan daun yang terserang rontok. Kerusakan ulat tidak berjalan dari bawah ke atas begitu, dan daunnya berlubang bukan berbintil.',
        membantah: { id: 'op:pst:00000056', label: 'Penggulung daun' },
      },
    ],
  },
  {
    id: 'op:pst:00000058',
    dari: 'op:pst:00001209',
    nama: 'Lalat Bibit',
    key: 'lalat-bibit-kedelai',
    label: 'Lalat bibit kedelai',
    inang: [KEDELAI, KACANG_HIJAU, KACANG_PANJANG],
    definition:
      'Menyerang kedelai, kacang hijau, dan kacang panjang pada dua minggu pertama sesudah tumbuh; sesudah itu batangnya sudah terlalu keras. Karena jendelanya sempit dan seragam, perlakuan benih lebih menentukan daripada penyemprotan sesudah tanam. Registri memecahnya jadi beberapa entitas atas nama marga lama Agromyza, yang sudah disatukan ke sini kecuali sasaran bertingkat marga Agromyza sp.',
    gejala:
      'Daun bibit berbintik-bintik putih bekas tusukan, lalu muncul lorong halus dari helai daun turun ke tangkai dan pangkal batang. Tanaman muda layu, menguning, dan mati sejak dua minggu pertama; yang bertahan jadi kerdil dengan pangkal batang membengkak dan retak.',
    pembanding: [
      {
        cek: 'Belah pangkal batang tanaman yang layu, membujur. Ada lorong kecoklatan tepat di bawah kulit batang beserta belatung putih atau kepompong coklat di dalamnya. Rebah karena penyakit tidak berlorong — jaringannya membusuk merata.',
      },
      {
        cek: 'Ingat umur tanamannya. Lalat bibit hanya menyerang pada dua minggu pertama. Tanaman yang layu sesudah berbunga penyebabnya bukan lalat bibit, sebanyak apa pun yang layu.',
      },
    ],
  },
  {
    id: 'op:pst:00000059',
    dari: 'op:pst:00001127',
    nama: 'Kepik Hijau',
    key: 'kepik-hijau',
    label: 'Kepik hijau',
    definition:
      'Menyerang pada fase pengisian polong, dan bau yang ditinggalkannya menempel pada biji sehingga menurunkan mutu jual walau bijinya utuh. Datang dari luar petak, jadi kerusakannya sering menumpuk di pinggir lebih dulu.',
    gejala:
      'Polong bernoda coklat bekas tusukan halus, dan biji di dalamnya mengempis, keriput, atau bernoda coklat kehitaman; polong yang tertusuk saat masih muda gugur. Kepik hijau polos seukuran kuku jari beterbangan rendah saat rumpun disibak, dan meninggalkan BAU MENYENGAT khas.',
    pembanding: [
      {
        cek: 'Sibak rumpun pagi hari, lalu lihat dan cium. Kepik hijau berbentuk perisai lebar, hijau polos seukuran kuku, dan berbau menyengat; pengisap polong lebih ramping, coklat kekuningan, dan berkaki belakang panjang.',
        membantah: { id: 'op:pst:00000060', label: 'Pengisap polong' },
      },
      {
        cek: 'Buka polong yang bernoda. Kepik hijau tidak melubangi kulit polong — bijinya mengempis atau bernoda tanpa ada ulat maupun kotoran di dalam. Kalau ada ulat dan kotoran, itu penggerek polong.',
        membantah: { id: 'op:pst:00000055', label: 'Penggerek polong' },
      },
    ],
  },
  {
    id: 'op:pst:00000060',
    dari: 'op:pst:00001143',
    nama: 'Pengisap Polong',
    key: 'pengisap-polong',
    label: 'Pengisap polong',
    definition:
      'Bersama kepik hijau menentukan MUTU biji, bukan jumlah polong: yang diserang isi polongnya sementara polongnya tetap di tanaman sampai panen. Kerugiannya karena itu baru terlihat saat perontokan, dan pada saat itu sudah terlambat disemprot.',
    gejala:
      'Polong bernoda dan biji di dalamnya mengempis atau berbintik coklat mengeras; polong yang tertusuk saat muda gugur atau tetap kempis sampai panen. Serangga ramping coklat kekuningan berkaki belakang panjang dan berduri terlihat di polong, dan berpindah cepat ke sisi lain batang saat didekati.',
    pembanding: [
      {
        cek: 'Lihat bentuk serangganya. Pengisap polong RAMPING memanjang, coklat kekuningan, dengan kaki belakang panjang berduri; kepik hijau lebar berbentuk perisai dan hijau polos.',
        membantah: { id: 'op:pst:00000059', label: 'Kepik hijau' },
      },
      {
        cek: 'Buka polong yang kempis. Pengisap polong tidak meninggalkan lubang, ulat, maupun kotoran — hanya biji yang mengempis atau bernoda. Lubang bundar pada kulit polong berarti penggerek polong.',
        membantah: { id: 'op:pst:00000055', label: 'Penggerek polong' },
      },
    ],
  },
  {
    id: 'op:pst:00000061',
    dari: 'op:pst:00001222',
    nama: 'Ulat Jengkal',
    key: 'ulat-jengkal',
    label: 'Ulat jengkal',
    definition:
      'Registri juga memuatnya atas nama lama Plusia chalcites (14 baris, sebagian pada kacang hijau, kacang tanah, dan tembakau) serta Plusia spp. dan Plusia sp. (2 baris); ketiganya belum disatukan. Produk atas nama itu tidak ikut terdaftar di bawah pintu ini — LEBIH BANYAK daripada yang terdaftar di sini, dan pintu ini tetap berdiri atas nama yang diterima GBIF, bukan atas nama yang barisnya lebih banyak.',
    gejala:
      'Daun berlubang tidak beraturan dari tengah helai, sering menyisakan tulang daun halus seperti jala, dan daun yang habis menyisakan tangkainya. Ulatnya hijau dengan garis putih memanjang di sisi tubuh, dan BERJALAN MELENGKUNG seperti sedang mengukur karena kaki tengahnya tidak lengkap.',
    pembanding: [
      {
        cek: 'Perhatikan cara ulatnya berjalan. Ulat jengkal melengkungkan punggungnya tiap melangkah seperti mengukur; ulat grayak merayap lurus dan bertubuh jauh lebih gemuk.',
        membantah: { id: 'op:pst:00000005', label: 'Ulat grayak' },
      },
      {
        cek: 'Lihat apakah daunnya terlipat. Ulat jengkal makan di permukaan daun yang terbuka; penggulung daun mengikat daun dengan benang sutra dan makan dari dalam lipatan.',
        membantah: { id: 'op:pst:00000056', label: 'Penggulung daun' },
      },
    ],
  },
  {
    id: 'op:pst:00000062',
    dari: 'op:pst:00001331',
    nama: 'Penyakit Bercak Daun',
    key: 'bercak-mata-katak',
    label: 'Bercak mata katak',
    definition:
      'Menular lewat benih dan sisa tanaman, jadi benih dari petak yang terserang meneruskannya ke musim berikutnya. Registri juga memuat Cercospora sp., C. canescens, dan C. capsici sebagai sasaran pada kedelai (3 baris) yang belum disatukan.',
    gejala:
      'Bercak bundar kecil pada daun dengan tengah KELABU KEPUTIHAN dan tepi coklat kemerahan yang tegas — bentuknya seperti mata, dan dari situ namanya. Bercaknya tetap terpisah satu-satu, tidak menyatu jadi hawar luas; daun yang penuh bercak menguning lalu rontok. Polong dan biji bisa ikut berbercak.',
    pembanding: [
      {
        cek: 'Lihat tengah bercaknya dan raba permukaannya. Bercak mata katak bertengah kelabu keputihan dengan tepi coklat kemerahan tegas, dan permukaannya RATA; karat daun menonjol berbintil dan menyisakan serbuk coklat di jari.',
        membantah: { id: 'op:pst:00000057', label: 'Karat daun kedelai' },
      },
      {
        cek: 'Perhatikan apakah bercaknya menyatu. Bercak mata katak tetap terpisah satu-satu walau jumlahnya banyak; bercak yang menyatu jadi bidang kering luas penyebabnya bukan ini.',
      },
    ],
  },
];

const PINTU_KAKAO = [
  {
    id: 'op:pst:00000063',
    dari: 'op:pst:00001066',
    nama: 'Pengisap Buah',
    key: 'helopeltis',
    label: 'Helopeltis',
    inang: [KAKAO, TEH, JERUK],
    definition:
      'Terdaftar juga pada teh (7 baris) dan teks di bawah ditulis untuk kakao. Registri memecahnya jadi beberapa entitas — Helopeltis sp. (21 baris, 12 di antaranya pada teh), Helopeltis spp. (3), dan ejaan Helopelthis sp. (1) — semuanya bertambat hanya sampai GENUS di GBIF dan belum disatukan; produk atas nama itu tidak ikut terdaftar di bawah pintu ini. Luka tusukannya jadi pintu masuk busuk buah, jadi dua masalah itu saling menyusul.',
    gejala:
      'Buah muda berbintik-bintik coklat kehitaman CEKUNG, seukuran ujung jarum sampai sebesar biji, mula-mula berair lalu mengering dan retak; buah yang tertusuk saat masih kecil mengering seluruhnya dan tetap menggantung. Pada pucuk dan ranting muda, tusukannya membuat kulit menghitam, daun layu, dan ranting mati dari ujung.',
    pembanding: [
      {
        cek: 'Lihat bintiknya dari dekat, kalau perlu kena cahaya miring. Helopeltis meninggalkan bintik CEKUNG bertepi tegas, tersebar dan tidak menyatu walau jumlahnya banyak. Busuk buah memberi bercak yang MELUAS dan menyatu sampai menutup sebagian besar buah.',
        membantah: { id: 'op:pst:00000065', label: 'Busuk buah kakao' },
      },
      {
        cek: 'Cari serangganya pagi atau sore hari, di buah yang PALING MUDA. Helopeltis ramping seperti nyamuk besar dengan tonjolan seperti jarum di punggungnya, dan langsung berpindah ke sisi lain buah saat didekati. Kalau bintiknya ada tetapi serangganya tidak, ia sudah pindah ke buah yang lebih muda.',
      },
    ],
  },
  {
    id: 'op:pst:00000064',
    dari: 'op:pst:00001108',
    nama: 'Penggerek Buah',
    key: 'penggerek-buah-kakao',
    label: 'Penggerek buah kakao',
    definition:
      'PBK. Yang menentukan bukan semprotan melainkan SARUNGISASI — membungkus buah muda dengan kantong plastik — panen sering setiap tujuh sampai sepuluh hari, dan memendam kulit buah bekas panen. Ulatnya berada DI DALAM buah sejak menetas, jadi semprotan hanya bisa mengenai ngengat dewasa yang aktif malam hari, dan itu jendela yang sempit.',
    gejala:
      'Buah masak lebih cepat dan warnanya BELANG — sebagian kuning, sebagian masih hijau — padahal umurnya belum cukup. Buah terasa berat, dan saat diguncang tidak berbunyi karena bijinya saling melekat. Dibelah, bijinya kempis dan menempel satu sama lain sehingga sulit dipisahkan, dengan lorong kecoklatan di antara daging buahnya.',
    pembanding: [
      {
        cek: 'Guncang buah yang warnanya belang di dekat telinga. Buah masak yang sehat BERBUNYI karena bijinya lepas; buah yang terserang PBK tidak berbunyi karena bijinya melekat. Pemeriksaan ini tidak merusak buahnya, jadi bisa dikerjakan pada banyak buah sekaligus.',
      },
      {
        cek: 'Belah buah yang tidak berbunyi. PBK meninggalkan lorong halus di antara daging buah dan biji yang saling melekat, sementara KULIT LUARNYA tidak membusuk. Busuk buah sebaliknya: kulitnya menghitam meluas dari luar, dan bijinya membusuk bersama dagingnya.',
        membantah: { id: 'op:pst:00000065', label: 'Busuk buah kakao' },
      },
    ],
  },
  {
    id: 'op:pst:00000065',
    dari: 'op:pst:00001097',
    nama: 'Penyakit Busuk Buah',
    key: 'busuk-buah-kakao',
    label: 'Busuk buah kakao',
    definition:
      'Oomycete, bukan jamur sejati — dan itu menentukan bahan aktifnya: metalaksil dan dimetomorf bekerja padanya, banyak fungisida untuk jamur sejati tidak. Terdaftar juga pada durian dan lada (4 baris) dan teks di bawah ditulis untuk kakao. Yang paling menurunkan serangan bukan semprotan melainkan memangkas agar kebun tidak lembap, memetik dan MEMENDAM buah sakit, serta mengatur naungan.',
    gejala:
      'Bercak coklat kehitaman pada buah, mulai dari ujung atau pangkal, MELUAS cepat dan menyatu sampai menutup sebagian besar buah dalam beberapa hari, dengan batas tegas antara bagian sakit dan sehat. Pada cuaca lembap permukaan bercak berselaput putih halus seperti tepung. Buah yang terserang mengering menghitam dan tetap menggantung di batang.',
    pembanding: [
      {
        cek: 'Perhatikan bagaimana bercaknya berubah dalam beberapa hari. Busuk buah MELUAS dan menyatu; bintik helopeltis tetap kecil, cekung, dan terpisah satu-satu walau jumlahnya banyak.',
        membantah: { id: 'op:pst:00000063', label: 'Helopeltis' },
      },
      {
        cek: 'Belah buah yang menghitam. Busuk buah membusukkan daging DAN biji bersama-sama dari kulit ke dalam; penggerek buah kakao meninggalkan kulit yang tidak membusuk dengan biji melekat di dalamnya.',
        membantah: { id: 'op:pst:00000064', label: 'Penggerek buah kakao' },
      },
    ],
  },
  {
    id: 'op:pst:00000066',
    dari: 'op:pst:00001230',
    nama: 'Penyakit Pembuluh Kayu Vascular Streak Dieback Vsd',
    key: 'mati-ranting-vsd',
    label: 'Mati ranting VSD',
    definition:
      'Vascular streak dieback. Registri juga memuatnya atas nama barunya, Ceratobasidium theobromae (1 baris), yang belum disatukan — jamur yang sama. Sporanya terbawa angin pada malam lembap dan masuk lewat daun muda, jadi yang menentukan varietas atau klon tahan, sambung samping, dan memangkas ranting sakit sampai sekitar 30 cm di bawah bagian yang bergejala — bukan menyemprot daun.',
    gejala:
      'Satu atau dua daun di TENGAH ranting menguning dengan bercak hijau tersisa di antara tulang daun, lalu rontok — bukan daun paling tua di pangkal, bukan daun paling muda di pucuk. Ranting menggundul dari tengah ke ujung dan tinggal ranting telanjang berbintil bekas dudukan daun. Akhirnya ranting mati dari ujung ke pangkal.',
    pembanding: [
      {
        cek: 'Potong ranting yang menggundul MELINTANG, lalu tatap penampangnya. Ada tiga titik coklat tersusun seperti segitiga pada berkas pembuluhnya; dibelah membujur, titik itu jadi garis coklat memanjang — dari situ nama vascular streak. Ranting yang mati karena penggerek berlubang dan berlorong, bukan bergaris.',
        membantah: { id: 'op:pst:00002112', label: 'Penggerek Batang' },
      },
      {
        cek: 'Lihat daun mana yang menguning lebih dulu. VSD mulai dari daun di TENGAH ranting. Kekurangan hara menguningkan daun TUA di pangkal lebih dulu dan merata di seluruh pohon, bukan ranting per ranting.',
      },
    ],
  },
  {
    id: 'op:pst:00000067',
    dari: 'op:pst:00001458',
    nama: 'Ulat Kilan',
    key: 'ulat-kilan',
    label: 'Ulat kilan',
    definition:
      'Ulat jengkal kakao. Datang berkala dalam ledakan singkat dan bisa menggunduli pohon dalam hitungan hari, lalu menghilang; di luar ledakan itu jarang menuntut tindakan apa pun — dan menyemprot terjadwal di luar ledakan menghabiskan biaya tanpa menyelamatkan apa pun.',
    gejala:
      'Daun muda dan pucuk habis dimakan dari TEPI ke dalam sampai tinggal tulang daun, dan pada ledakan berat pohon gundul sampai ke ranting. Ulatnya coklat kehijauan dan BERJALAN MELENGKUNG seperti sedang mengukur; saat terganggu ia menegang lurus menyerupai ranting kecil, atau menjatuhkan diri pada benang.',
    pembanding: [
      {
        cek: 'Perhatikan cara ulatnya berjalan dan bersikap saat disentuh. Ulat kilan melengkungkan punggung tiap melangkah, lalu menegang lurus seperti ranting kecil. Tidak ada hama daun kakao lain yang bersikap begitu.',
      },
      {
        cek: 'Lihat mengapa daunnya hilang. Ulat kilan menggigit dari TEPI daun sehingga tinggal tulang daun. Ranting yang menggundul karena VSD daunnya rontok sendiri sesudah menguning — tidak tergigit — dan yang tinggal ranting telanjang berbintil, bukan tulang daun.',
        membantah: { id: 'op:pst:00000066', label: 'Mati ranting VSD' },
      },
    ],
  },
];

const PINTU_KOPI = [
  {
    id: 'op:pst:00000068',
    dari: 'op:pst:00001202',
    nama: 'Penyakit Karat Daun',
    key: 'karat-daun-kopi',
    label: 'Karat daun kopi',
    definition:
      'Penyakit kopi paling menentukan di dunia, dan yang membuat arabika sulit dipertahankan di dataran rendah tanpa varietas tahan; robusta jauh lebih tahan. Yang menentukan pemangkasan agar tajuk tidak lembap, pemupukan berimbang, dan pilihan varietas — semprotan tembaga hanya menahan, dan hanya kalau diberikan sebelum bercaknya meluas.',
    gejala:
      'Bercak bulat kuning terang di permukaan BAWAH daun, dan di atas bercak itu ada SERBUK jingga kekuningan yang menempel di jari. Dari permukaan atas terlihat sebagai bercak kuning pucat berbatas kabur. Daun rontok dari bawah ke atas sampai ranting telanjang, dan pohon yang gundul tidak berbuah pada musim berikutnya.',
    pembanding: [
      {
        cek: 'Balik daun dan usap bercaknya dengan jari. Karat daun meninggalkan SERBUK jingga di jari — tidak ada penyakit daun kopi lain yang begitu. Bercak daun kopi rata, kering, dan tidak berserbuk.',
        membantah: { id: 'op:pst:00000072', label: 'Bercak daun kopi' },
      },
      {
        cek: 'Periksa apakah daunnya lengket. Karat daun tidak melengketkan daun. Kalau daun menguning DAN lengket serta berjelaga hitam, yang menguningkannya kutu, bukan karat.',
        membantah: { id: 'op:pst:00000071', label: 'Kutu tempurung' },
      },
    ],
  },
  {
    id: 'op:pst:00000069',
    dari: 'op:pst:00001381',
    nama: 'Penggerek Buah Kopi',
    key: 'penggerek-buah-kopi',
    label: 'Penggerek buah kopi',
    definition:
      'PBKo — hama kopi paling menentukan di Indonesia, dan sekaligus yang paling sedikit produk terdaftarnya: LIMA baris penggunaan berlabel di seluruh registri. Yang menentukan memang bukan semprotan melainkan PETIK BUBUK dan LELESAN — memetik buah terserang lebih awal dan memungut buah jatuh sampai bersih — ditambah Beauveria bassiana dan perangkap beralkohol. Kumbangnya berada di dalam biji hampir seumur hidupnya, jadi semprotan hanya mengenai yang sedang terbang. Registri juga memuatnya atas nama genus lama Stephanoderes hampei (1 baris) yang belum disatukan.',
    gejala:
      'Lubang bundar kecil sebesar ujung jarum tepat di UJUNG buah — sisi yang berseberangan dengan tangkai — kadang dengan serbuk halus di mulut lubang. Buah yang terserang saat masih muda gugur; yang bertahan sampai panen bijinya berlubang dan berlorong, dan bobot serta mutunya turun.',
    pembanding: [
      {
        cek: 'Lihat DI MANA lubangnya. Penggerek buah kopi hampir selalu masuk lewat ujung buah, sisi yang berlawanan dengan tangkai, dan lubangnya bundar rapi sebesar ujung jarum. Lubang di sisi lain buah, atau yang tidak bundar, penyebabnya lain.',
      },
      {
        cek: 'Belah buah yang berlubang. Ada lorong dan ruang di dalam biji beserta kumbang hitam kecil kurang dari dua milimeter, kadang beberapa sekaligus. Buah yang gugur karena kekurangan air atau hara tidak berlubang dan bijinya utuh.',
      },
    ],
  },
  {
    id: 'op:pst:00000070',
    dari: 'op:pst:00001252',
    nama: 'Kutu Putih',
    key: 'kutu-putih-kopi',
    label: 'Kutu putih',
    inang: [KOPI, JERUK, KAKAO, NENAS, RAMBUTAN, JAMBU_BIJI, CENGKEH_BIBIT],
    definition:
      'Terdaftar juga pada jeruk (2 baris). Registri juga memuatnya atas nama genus lama Pseudococcus citri (3 baris) yang belum disatukan — kutu yang sama. SEMUT memelihara dan memindahkannya dari pohon ke pohon, jadi mengendalikan semutnya ikut menentukan; registri mencatat semut sebagai sasaran tersendiri pada kopi (3 baris) lewat pintunya sendiri.',
    gejala:
      'Gerombolan kutu berlapis lilin PUTIH seperti kapas di dompolan buah, ketiak cabang, dan pucuk, sehingga bagian itu tampak seperti ditaburi tepung. Buah dan daun di bawahnya lengket lalu ditumbuhi jelaga hitam. Dompolan yang tertutup kutu buahnya kecil-kecil dan banyak yang gugur.',
    pembanding: [
      {
        cek: 'Usap gerombolan putihnya. Kutu putih berlapis lilin yang HANCUR jadi bubuk saat diusap, dan menyisakan tubuh kutu berwarna merah muda kekuningan di bawahnya. Jelaga dan jamur tidak menyisakan tubuh serangga.',
      },
      {
        cek: 'Bandingkan dengan kutu tempurung. Kutu putih lonjong berlapis tepung dan MASIH BISA berjalan pelan; kutu tempurung menempel keras seperti sisik cembung kehijauan dan tidak bergerak sama sekali.',
        membantah: { id: 'op:pst:00000071', label: 'Kutu tempurung' },
      },
    ],
  },
  {
    id: 'op:pst:00000071',
    dari: 'op:pst:00001444',
    nama: 'Kutu Tempurung',
    key: 'kutu-tempurung',
    label: 'Kutu tempurung',
    inang: [KOPI, JERUK, CENGKEH],
    definition:
      'Kutu hijau. Terdaftar juga pada jeruk (1 baris). Seperti kutu putih ia dipelihara semut dan menghasilkan embun madu yang mengundang jelaga — dan JELAGA itu yang menutup daun sehingga pohon kehilangan cahaya, bukan kutunya secara langsung.',
    gejala:
      'Sisik cembung hijau kekuningan seukuran kepala jarum menempel RAPAT di tulang daun bagian bawah, di pucuk, dan di buah muda, dan tidak bergerak sama sekali. Daun di bawahnya lengket lalu tertutup jelaga hitam sampai permukaannya gelap; pucuk kerdil dan buah muda gugur.',
    pembanding: [
      {
        cek: 'Coba dorong sisiknya dengan kuku. Kutu tempurung MENEMPEL keras dan terangkat utuh seperti perisai kecil dengan tubuh lunak di bawahnya; kutu putih hancur jadi bubuk lilin saat diusap.',
        membantah: { id: 'op:pst:00000070', label: 'Kutu putih' },
      },
      {
        cek: 'Usap jelaga hitamnya dengan kain basah. Jelaga TERANGKAT dan daun di bawahnya masih hijau — ia tumbuh di atas embun madu, bukan menyerang daunnya. Yang perlu ditangani kutunya; membersihkan jelaganya saja tidak menghentikan apa pun.',
      },
    ],
  },
  {
    id: 'op:pst:00000072',
    dari: 'op:pst:00001517',
    nama: 'Penyakit Bercak Daun',
    key: 'bercak-daun-kopi',
    label: 'Bercak daun kopi',
    definition:
      'Paling parah pada bibit di pembibitan dan pada pohon yang kekurangan hara atau kepanasan karena naungannya terlalu terbuka — jadi bercaknya sering pertanda pemeliharaan, bukan cuma pertanda jamur. Menyerang daun dan buah; pada buah ia membuat kulit melekat pada biji sehingga sulit dikupas.',
    gejala:
      'Bercak bulat pada daun dengan tengah KEPUTIHAN atau kelabu dan tepi coklat kemerahan yang tegas, sering dikelilingi halo kuning, dan di bagian tengahnya ada titik-titik hitam halus. Pada buah muncul bercak coklat kehitaman cekung memanjang yang membuat kulit buah melekat ke biji.',
    pembanding: [
      {
        cek: 'Raba dan usap bercaknya. Bercak daun kopi RATA dan kering serta tidak meninggalkan apa pun di jari; karat daun meninggalkan serbuk jingga saat diusap di permukaan bawah daun.',
        membantah: { id: 'op:pst:00000068', label: 'Karat daun kopi' },
      },
      {
        cek: 'Lihat di mana bercak terbanyak. Bercak daun kopi menumpuk pada bibit dan pada pohon yang naungannya terlalu terbuka atau kurang pupuk; karat daun tidak memilih begitu, dan justru menyerang pohon yang tajuknya rimbun dan lembap.',
        membantah: { id: 'op:pst:00000068', label: 'Karat daun kopi' },
      },
    ],
  },
];

const PINTU_SAWIT = [
  {
    id: 'op:pst:00000073',
    dari: 'op:pst:00001064',
    nama: 'Ulat Kantong',
    key: 'ulat-kantong',
    label: 'Ulat kantong',
    inang: [SAWIT, KELAPA],
    definition:
      'Hama daun sawit dengan pendaftaran terbanyak — 62 baris. Ulatnya hidup di dalam kantong dari potongan daun yang dibawanya ke mana-mana, dan kantong itulah yang membuat semprotan kontak sering gagal: cairannya tidak masuk. Yang menentukan SENSUS PELEPAH — menghitung ulat hidup pada pelepah contoh sebelum memutuskan — karena musuh alaminya banyak dan penyemprotan menyeluruh membunuh musuh alami itu lebih dulu daripada ulatnya. Registri bahkan mencatat kumbang penyerbuk Elaeidobius kamerunicus sebagai sasaran terdaftar pada satu baris; menyemprotnya MENURUNKAN pembentukan buah, bukan menaikkannya. Mahasena corbetti (1 baris), ulat kantong jenis lain, belum disatukan.',
    gejala:
      'Pelepah bawah menggundul dari ujung anak daun sampai tinggal tulang anak daun seperti lidi, dan pohon terlihat berlubang-lubang saat ditengadah. Di bawah anak daun menggantung KANTONG kecil memanjang dari potongan daun kering, sepanjang satu sampai tiga sentimeter, yang ikut bergoyang saat pelepah digerakkan.',
    pembanding: [
      {
        cek: 'Pegang salah satu kantongnya dan buka. Ada ulat di dalamnya, dan kantong itu ikut terbawa ke mana pun ulatnya berpindah — tidak menempel tetap di satu tempat. Ulat api tidak berkantong: ia menempel telanjang di bawah anak daun.',
        membantah: { id: 'op:pst:00000074', label: 'Ulat api' },
      },
      {
        cek: 'Hitung dulu sebelum memutuskan. Ambil satu pelepah contoh dari beberapa pohon dan hitung ulat HIDUPNYA; kantong kosong yang tertinggal dari serangan lama menipu, dan menyemprot karena kantong kosong membunuh musuh alaminya tanpa alasan.',
      },
    ],
  },
  {
    id: 'op:pst:00000074',
    dari: 'op:pst:00001084',
    nama: 'Ulat Api',
    key: 'ulat-api',
    label: 'Ulat api',
    inang: [SAWIT, KELAPA],
    definition:
      'Registri memecah ulat api jadi beberapa entitas: Setothosea asigna (40 baris), nama lamanya Thosea asigna (12), serta Setora nitens (18) dan Darna trima (1) yang jenis lain tetapi ditangani sama. Pintu ini berdiri di atas yang pertama; tiga puluh satu baris atas nama entitas lain tidak ikut terdaftar di sini. Bulunya MENYENGAT kulit — periksa dengan ranting atau bersarung tangan, jangan dengan tangan telanjang.',
    gejala:
      'Anak daun tergerus dari permukaan BAWAH sampai tinggal selaput bening, lalu berlubang dan mengering sehingga pelepah tampak seperti terbakar. Ulatnya menempel telanjang di bawah anak daun: pipih seperti siput, hijau kekuningan berpola, dengan duri-duri bercabang di punggungnya. Serangan berat menggunduli pohon dan menunda buah sampai dua tahun.',
    pembanding: [
      {
        cek: 'Lihat ulatnya — JANGAN dipegang. Ulat api pipih dan menempel telanjang di bawah anak daun dengan duri bercabang yang menyengat; ulat kantong selalu berada di dalam kantong dari potongan daun.',
        membantah: { id: 'op:pst:00000073', label: 'Ulat kantong' },
      },
      {
        cek: 'Perhatikan bentuk kerusakannya. Ulat api mengerok anak daun sampai tinggal selaput lalu berlubang, sementara pelepahnya sendiri tetap utuh. Kumbang tanduk memotong pelepah muda sehingga saat membuka daunnya bertakik segitiga seperti digunting.',
        membantah: { id: 'op:pst:00000075', label: 'Kumbang tanduk' },
      },
    ],
  },
  {
    id: 'op:pst:00000075',
    dari: 'op:pst:00001119',
    nama: 'Kumbang Tanduk',
    key: 'kumbang-tanduk',
    label: 'Kumbang tanduk',
    inang: [SAWIT, KELAPA, SAWIT_BIBIT],
    definition:
      'Paling merusak pada tanaman muda dan pada tahun-tahun sesudah replanting, karena berkembang biak di batang sawit tua yang dibiarkan melapuk dan di tumpukan tandan kosong. Yang menentukan MEMBERANTAS TEMPAT BERKEMBANG BIAKNYA — mencacah dan meratakan batang tumbang, membalik tumpukan tandan kosong — ditambah perangkap feromon. Menyemprot pohon tidak menjangkau kumbang yang hidup di dalam tumpukan.',
    gejala:
      'Pelepah muda yang BARU MEMBUKA bertakik segitiga seperti digunting, dan pada serangan berat anak daunnya berbentuk kipas terpotong. Di pucuk ada lubang gerekan besar berserat kasar dengan serbuk seperti sabut menyembul. Tanaman muda yang titik tumbuhnya digerek bisa mati.',
    pembanding: [
      {
        cek: 'Perhatikan bentuk potongan pada pelepah yang BARU MEMBUKA. Takik segitiga rapi seperti guntingan berarti pelepah itu digerek saat masih terlipat di pucuk — khas kumbang tanduk, dan kerusakannya baru terlihat berminggu-minggu sesudah kumbangnya pergi.',
      },
      {
        cek: 'Raba lubang di pucuk. Kumbang tanduk meninggalkan lubang besar berserat kasar dengan serbuk seperti sabut; ulat api dan ulat kantong tidak melubangi pucuk sama sekali.',
        membantah: { id: 'op:pst:00000074', label: 'Ulat api' },
      },
    ],
  },
  {
    id: 'op:pst:00000076',
    dari: 'op:pst:00001061',
    nama: 'Rayap Tanah',
    key: 'rayap-tanah',
    label: 'Rayap tanah',
    inang: [SAWIT, KELAPA, KARET],
    definition:
      'Dari 71 baris pendaftarannya, 43 justru BUKAN untuk tanaman melainkan untuk bangunan — registri mencatatnya sebagai tempat aplikasi, bukan komoditas — dan yang tersisa untuk sawit 18 baris. Paling merusak di lahan gambut dan pada tanaman muda, dan menyerang dari akar ke atas sehingga kerusakannya sudah lanjut saat terlihat dari luar.',
    gejala:
      'Pelepah bawah menguning lalu mengering seluruhnya sementara pelepah atas masih hijau, dan tanaman muda bisa mati mendadak. Pada pangkal batang dan akar menempel LORONG TANAH berkerak seperti jalur lumpur kering, dan bila dikupas ada rayap putih kecoklatan berhamburan di dalamnya.',
    pembanding: [
      {
        cek: 'Kupas kerak tanah yang menempel di pangkal batang dengan parang atau kayu. Kalau di dalamnya ada rayap putih kecoklatan yang berhamburan, itu rayap tanah; kerak tanpa isi berarti serangan lama yang sudah berhenti, dan menyemprotnya tidak menyelamatkan apa pun.',
      },
      {
        cek: 'Ketuk pangkal batang dan korek sedikit. Rayap memakan bagian dalam sehingga terdengar kopong sementara kulit luarnya masih utuh, dan selalu meninggalkan lorong tanah. Busuk pangkal batang melunakkan jaringan jadi rapuh dan berbau jamur, TANPA lorong tanah.',
        membantah: { id: 'op:pst:00000080', label: 'Busuk pangkal batang' },
      },
    ],
  },
  {
    id: 'op:pst:00000077',
    dari: 'op:pst:00001184',
    nama: 'Penyakit Bercak Daun Coklat',
    key: 'bercak-daun-bibit-sawit',
    label: 'Bercak daun bibit sawit',
    definition:
      'Penyakit PEMBIBITAN: dua belas dari tiga belas barisnya terdaftar untuk pembibitan kelapa sawit, bukan untuk kebun. Menyebar cepat pada bibit yang ditanam terlalu rapat dan disiram dari atas — menjarangkan bibit dan menyiram ke tanah mengurangi lebih banyak daripada menambah semprotan.',
    gejala:
      'Bintik bulat kecil TEMBUS CAHAYA pada daun bibit, lalu membesar jadi bercak coklat bertengah kelabu dengan halo kuning mengelilinginya. Bercak yang bersambung membuat daun mengering dari ujung; bibit yang berat serangannya kerdil dan tidak layak tanam.',
    pembanding: [
      {
        cek: 'Terawang daun bibit ke arah cahaya saat bintiknya masih kecil. Bercak ini mulai sebagai bintik TEMBUS CAHAYA sebelum berwarna — tahap paling dini, dan tahap itulah yang masih bisa dijawab dengan menjarangkan bibit.',
      },
      {
        cek: 'Lihat apakah ada halo kuning tegas mengelilingi bercaknya. Halo kuning dengan tengah kelabu khas penyakit ini; kerusakan karena terbakar matahari atau pupuk tidak berhalo dan mengikuti tepi daun.',
      },
    ],
  },
  {
    id: 'op:pst:00000078',
    dari: 'op:pst:00001133',
    nama: 'Tikus Pohon',
    key: 'tikus-pohon',
    label: 'Tikus pohon',
    definition:
      'Berbeda dari tikus sawah: yang ini MEMANJAT dan bersarang di tajuk, di ketiak pelepah, dan di tumpukan pelepah bekas tunasan. Yang menentukan burung hantu Tyto alba beserta pagupon sarangnya, dan itu berjalan di tingkat hamparan bukan per kebun — sebelas baris pendaftaran racun tidak menggantikannya.',
    gejala:
      'Buah pada tandan tergerek dengan bekas gigitan bergerigi, dan brondolan bertumpuk di piringan dalam keadaan tergerus. Bunga jantan dan tandan muda ikut dimakan sehingga tandan gagal terbentuk. Ada jalur licin bekas lalu-lalang di pelepah, dan sarang dari serat di ketiak pelepah.',
    pembanding: [
      {
        cek: 'Lihat bekas gigitan pada buahnya. Tikus meninggalkan gerusan bergerigi dengan bekas dua gigi seri yang sejajar; penggerek tandan meninggalkan lubang kecil beserta jaring dan kotoran di antara buah.',
        membantah: { id: 'op:pst:00000079', label: 'Penggerek tandan' },
      },
      {
        cek: 'Periksa ketiak pelepah dan tumpukan pelepah bekas tunasan. Tikus pohon bersarang DI ATAS, bukan di tanah. Kalau sarang dan lubangnya justru di tanah, itu tikus jenis lain dan penanganannya berbeda.',
      },
    ],
  },
  {
    id: 'op:pst:00000079',
    dari: 'op:pst:00001319',
    nama: 'Penggerek Buah',
    key: 'penggerek-tandan',
    label: 'Penggerek tandan',
    definition:
      'Paling merusak pada tanaman muda yang baru mulai berbuah dan pada kebun yang penyerbukannya buruk, karena bunga yang tidak jadi buah justru jadi tempatnya berkembang. Registri juga memuat Tirathaba sp. (2 baris) yang belum disatukan.',
    gejala:
      'Di antara buah pada tandan ada JARING benang bercampur kotoran berbutir dan sisa gerekan yang menggumpal, dan buah di sekitarnya berlubang lalu membusuk. Bunga jantan dan tandan muda paling sering terkena; tandan yang terserang berat gugur sebelum matang.',
    pembanding: [
      {
        cek: 'Buka gumpalan di antara buah pada tandan. Penggerek tandan meninggalkan jaring benang bercampur kotoran beserta ulat kemerahan di dalamnya; tikus tidak berjaring dan meninggalkan gerusan terbuka pada permukaan buah.',
        membantah: { id: 'op:pst:00000078', label: 'Tikus pohon' },
      },
      {
        cek: 'Perhatikan umur kebun dan penyerbukannya. Penggerek tandan menumpuk pada tanaman muda dan pada kebun yang banyak buahnya tidak jadi — dan kalau kumbang penyerbuk Elaeidobius ikut mati karena penyemprotan, masalah itu justru bertambah, bukan berkurang.',
      },
    ],
  },
  {
    id: 'op:pst:00000080',
    dari: 'op:pst:00001410',
    nama: 'Penyakit Busuk Batang',
    key: 'busuk-pangkal-batang',
    label: 'Busuk pangkal batang',
    inang: [SAWIT, KELAPA],
    definition:
      'Ganoderma — penyakit sawit paling merugikan di Indonesia, dan punya TIGA baris penggunaan berlabel di seluruh registri. Tidak ada yang menyembuhkan pohon yang sudah bergejala: begitu tubuh buahnya muncul, pohon itu tinggal menunggu tumbang. Yang menentukan dikerjakan saat REPLANTING — membongkar dan mencacah tunggul serta akar sawit lama, memberi jeda tanam, dan tidak menanam bibit baru tepat di bekas lubang pohon sakit. Menyemprot pohon yang berdiri tidak menjangkau jamur yang hidup di akarnya.',
    gejala:
      'Pelepah bawah menguning lalu mengering dan MENGGANTUNG di sekeliling batang seperti rok, sementara pucuknya masih tegak dengan daun tombak menumpuk tidak membuka. Pada pangkal batang tumbuh TUBUH BUAH seperti kipas atau piring, bertepi putih dengan permukaan coklat mengkilap. Pohon akhirnya tumbang di pangkal walau daunnya masih ada.',
    pembanding: [
      {
        cek: 'Periksa pangkal batang sampai ke permukaan tanah, termasuk sisi yang tertutup pelepah dan gulma. Tubuh buah seperti kipas bertepi putih tanda yang paling pasti — dan begitu muncul, pohon itu tidak bisa diselamatkan. Yang masih bisa diselamatkan pohon di sekitarnya, lewat tindakan saat replanting.',
      },
      {
        cek: 'Ketuk pangkal batang dan bandingkan bunyinya dengan pohon sehat. Yang terserang terdengar kopong dan jaringannya rapuh berbau jamur bila dikorek, TANPA lorong tanah. Rayap tanah selalu meninggalkan lorong tanah berkerak di permukaan batang.',
        membantah: { id: 'op:pst:00000076', label: 'Rayap tanah' },
      },
    ],
  },
];

const PINTU_JERUK = [
  {
    id: 'op:pst:00000081',
    dari: 'op:pst:00001096',
    nama: 'Kutu Loncat',
    key: 'kutu-loncat-jeruk',
    label: 'Kutu loncat',
    definition:
      'Penular CVPD, dan itulah yang membuatnya menentukan — bukan isapannya. Satu kutu loncat yang membawa bakteri cukup untuk menulari satu pohon selamanya. Yang menentukan mengendalikannya pada TUNAS MUDA, karena hanya di tunas muda ia bertelur, ditambah bibit berlabel bebas penyakit dan mencabut pohon yang sudah sakit.',
    gejala:
      'Tunas muda mengeriting, kerdil, dan tidak membuka sempurna; pada tunas itu ada serangga kecil 2–3 mm yang hinggap MIRING sekitar 45 derajat terhadap permukaan daun dan MELONCAT saat didekati. Nimfanya kuning kecoklatan bertubuh pipih dan mengeluarkan benang lilin putih melingkar seperti pegas.',
    pembanding: [
      {
        cek: 'Perhatikan cara serangganya duduk dan pergi. Kutu loncat hinggap MIRING dengan ekor terangkat, lalu meloncat saat didekati; kutu daun duduk rata, berkelompok rapat, dan tidak meloncat.',
        membantah: { id: 'op:pst:00000083', label: 'Kutu daun jeruk' },
      },
      {
        cek: 'Periksa apakah ada benang lilin putih melingkar seperti pegas di sekitar nimfanya, dan periksa daun tua pohon yang sama. Kalau daun tuanya belang kuning tidak setangkup di kiri-kanan tulang daun, pohon itu kemungkinan sudah CVPD — dan mengendalikan kutu loncatnya tidak menyembuhkannya.',
        membantah: { id: 'op:pst:00000088', label: 'CVPD' },
      },
    ],
  },
  {
    id: 'op:pst:00000082',
    dari: 'op:pst:00001190',
    nama: 'Penyakit Embun Tepung',
    key: 'embun-tepung-jeruk',
    label: 'Embun tepung jeruk',
    definition:
      'Registri juga memuat Oidium sp. sebagai sasaran pada jeruk (9 baris) yang belum disatukan; produk atas nama itu tidak ikut terdaftar di bawah pintu ini. Menyerang tunas dan daun muda saja — daun yang sudah tua tidak lagi tertular, jadi jendela tindakannya mengikuti pertunasan.',
    gejala:
      'Lapisan putih seperti TEPUNG di permukaan daun muda dan tunas, mula-mula setitik lalu meluas menutup helai. Daun yang tertutup mengeriting, mengecil, dan rontok; tunas berhenti memanjang. Buah muda yang terkena berkulit kasar dan gugur.',
    pembanding: [
      {
        cek: 'Usap lapisan putihnya dengan jari. Embun tepung TERANGKAT dan menempel di jari seperti bedak, dan daun di bawahnya masih hijau. Embun jelaga hitam juga terangkat tetapi warnanya gelap dan tumbuh di atas embun madu kutu, bukan di daun muda.',
        membantah: { id: 'op:pst:00000083', label: 'Kutu daun jeruk' },
      },
      {
        cek: 'Lihat daun mana yang terkena. Embun tepung hanya menyerang daun MUDA dan tunas; kalau yang berbercak justru daun tua dan bercaknya bertepi tegas kecoklatan, penyebabnya bukan embun tepung.',
      },
    ],
  },
  {
    id: 'op:pst:00000083',
    dari: 'op:pst:00001408',
    nama: 'Kutu Daun',
    key: 'kutu-daun-jeruk',
    label: 'Kutu daun jeruk',
    definition:
      'Penular virus tristeza (CTV). Registri memecah kutu daun jeruk jadi beberapa entitas — Toxoptera aurantii (3 baris), Toxoptera sp. (2), dan Aphis sp. (6) — semuanya belum disatukan dan tidak ikut terdaftar di bawah pintu ini. Seperti kutu lain, ia dipelihara semut, dan mengendalikan semutnya ikut menentukan.',
    gejala:
      'Kutu hitam kecoklatan berkelompok RAPAT di permukaan bawah daun muda dan pada tunas, sehingga tunas mengeriting ke bawah dan memendek. Daun di bawahnya lengket lalu ditumbuhi jelaga hitam; semut naik-turun di batang.',
    pembanding: [
      {
        cek: 'Perhatikan cara serangganya bergerak. Kutu daun duduk rata dan berkelompok rapat, bergerak lambat kalau disentuh; kutu loncat hinggap miring dan MELONCAT pergi.',
        membantah: { id: 'op:pst:00000081', label: 'Kutu loncat' },
      },
      {
        cek: 'Raba permukaan daun di bawah koloninya. Lengket berarti embun madu, dan jelaga hitam yang tumbuh di atasnya bisa diusap hilang. Embun tepung sebaliknya PUTIH dan menempel di jari seperti bedak.',
        membantah: { id: 'op:pst:00000082', label: 'Embun tepung jeruk' },
      },
    ],
  },
  {
    id: 'op:pst:00000084',
    dari: 'op:pst:00001351',
    nama: 'Pengorok Daun',
    key: 'pengorok-daun-jeruk',
    label: 'Pengorok daun jeruk',
    definition:
      'Menyerang daun muda saja, dan kerusakannya jarang menurunkan hasil pada pohon dewasa — yang menentukan justru pada BIBIT dan tanaman muda yang daunnya sedikit. Lorong yang dibuatnya juga jadi pintu masuk kanker jeruk, jadi dua masalah itu saling menyusul.',
    gejala:
      'Lorong berkelok PERAK MENGKILAP di dalam daun muda, dengan garis gelap halus di tengah lorong. Daun yang penuh lorong mengeriting, terlipat, dan tepinya menggulung; pertumbuhan tunas terhambat.',
    pembanding: [
      {
        cek: 'Terawang daun ke cahaya dan lihat isi lorongnya. Pengorok daun meninggalkan garis GELAP halus memanjang di tengah lorong perak — itu kotorannya. Bekas gigitan di permukaan tidak punya lorong dan tidak berkelok.',
      },
      {
        cek: 'Lihat umur daun yang terkena. Pengorok daun jeruk hanya menyerang daun MUDA yang masih lemas; daun tua yang mengeriting penyebabnya kutu atau penyakit, bukan pengorok.',
        membantah: { id: 'op:pst:00000083', label: 'Kutu daun jeruk' },
      },
    ],
  },
  {
    id: 'op:pst:00000085',
    dari: 'op:pst:00001364',
    nama: 'Penyakit Blendok',
    key: 'blendok-jeruk',
    label: 'Blendok',
    definition:
      'Oomycete, bukan jamur sejati — dan itu menentukan bahan aktifnya: metalaksil dan dimetomorf bekerja padanya, banyak fungisida untuk jamur sejati tidak. Masuk lewat luka dan lewat pangkal batang yang terlalu dalam tertimbun tanah atau terlalu sering basah; meninggikan guludan dan menjauhkan tanah dari pangkal batang mengurangi lebih banyak daripada menambah semprotan.',
    gejala:
      'Kulit batang atau pangkal batang mengeluarkan GETAH kental kekuningan yang mengering jadi kerak, dan kulit di bawahnya coklat kehitaman serta basah bila dikupas. Kanopi di atas bagian yang terserang menguning dan meranggas, dan cabangnya mati dari ujung.',
    pembanding: [
      {
        cek: 'Kupas tipis kulit di sekitar getah dengan pisau bersih. Blendok memberi jaringan coklat kehitaman BASAH dengan batas tegas terhadap jaringan sehat yang keputihan. Getah tanpa jaringan coklat di bawahnya bisa berasal dari luka biasa.',
      },
      {
        cek: 'Lihat di mana getahnya keluar. Blendok mulai dari pangkal batang dekat tanah lalu naik; kanker jeruk tidak mengeluarkan getah dan bercaknya di daun, ranting, serta buah, bukan di kulit batang.',
        membantah: { id: 'op:pst:00000086', label: 'Kanker jeruk' },
      },
    ],
  },
  {
    id: 'op:pst:00000086',
    dari: 'op:pst:00001482',
    nama: 'Penyakit Kanker',
    key: 'kanker-jeruk',
    label: 'Kanker jeruk',
    definition:
      'Menyebar lewat percikan air dan angin kencang, dan masuk lewat LUKA — termasuk lorong pengorok daun dan duri yang menggores buah. Karena itu mengendalikan pengorok daun dan memangkas agar tajuk tidak saling menggores ikut menurunkannya; bahan tembaga hanya melindungi jaringan yang belum terkena.',
    gejala:
      'Bercak bulat MENONJOL kasar seperti gabus pada daun, ranting, dan buah, berwarna coklat muda dengan tepi berminyak dan sering dikelilingi halo kuning. Pada daun bercaknya tembus dari kedua sisi. Buah yang berbercak tetap bisa dimakan tetapi tidak laku dijual.',
    pembanding: [
      {
        cek: 'Raba bercak pada daun dengan ujung jari, dan lihat dari kedua sisi daun. Kanker jeruk MENONJOL kasar seperti gabus dan terlihat dari sisi atas maupun bawah; bercak jamur biasa rata dan sering hanya jelas dari satu sisi.',
      },
      {
        cek: 'Cari halo kuning dan tepi berminyak di sekeliling bercaknya, lalu periksa apakah ada lorong pengorok daun di dekatnya. Bercak kanker sering duduk tepat di bekas lorong itu — dua masalah yang datang berurutan.',
        membantah: { id: 'op:pst:00000084', label: 'Pengorok daun jeruk' },
      },
    ],
  },
  {
    id: 'op:pst:00000087',
    dari: 'op:pst:00001573',
    nama: 'Kutu Sisik Merah',
    key: 'kutu-sisik-merah',
    label: 'Kutu sisik merah',
    definition:
      'Registri juga memuat kutu sisik jenis lain pada jeruk, Lepidosaphes beckii (1 baris), yang belum disatukan. Musuh alaminya — tabuhan parasit kecil — biasanya menahannya; penyemprotan menyeluruh justru sering diikuti ledakan karena musuh alaminya mati lebih dulu.',
    gejala:
      'Sisik bundar kemerahan sampai coklat seukuran kepala jarum menempel RAPAT dan tidak bergerak di daun, ranting, dan kulit buah. Daun di sekitarnya menguning setempat membentuk lingkaran pucat; buah yang tertutup sisik tidak laku walau dagingnya utuh.',
    pembanding: [
      {
        cek: 'Dorong sisiknya dengan kuku. Kutu sisik terangkat utuh seperti perisai kecil dengan tubuh lunak di bawahnya, dan tidak bergerak sama sekali; kutu putih hancur jadi bubuk lilin saat diusap.',
        membantah: { id: 'op:pst:00000070', label: 'Kutu putih' },
      },
      {
        cek: 'Periksa apakah daun di bawahnya lengket. Kutu sisik merah TIDAK menghasilkan embun madu, jadi daunnya tidak lengket dan tidak berjelaga; kutu daun dan kutu tempurung menghasilkannya.',
        membantah: { id: 'op:pst:00000071', label: 'Kutu tempurung' },
      },
    ],
  },
  {
    id: 'op:pst:00000088',
    dari: null,
    key: 'cvpd',
    label: 'CVPD',
    pest_kind: 'disease_bacterial',
    scientific_name: 'Candidatus Liberibacter asiaticus',
    taxonomic_rank: 'species',
    penular: { id: 'op:pst:00000081', label: 'Kutu loncat' },
    no_mapping_reason:
      'Belum dipetakan ke EPPO maupun GBIF. Kode kandidat tidak diperiksa ke sumbernya dalam sesi ini, dan kode yang tidak diperiksa lebih buruk daripada tidak ada kode. Tidak punya kembaran registri karena tidak satu pun produk terdaftar menyasarnya — sasaran yang tidak pernah muncul di label tidak pernah jadi entitas registri.',
    definition:
      'Citrus vein phloem degeneration, di dunia disebut huanglongbing. Bakteri yang hidup di dalam pembuluh dan TIDAK BISA disembuhkan; pohon yang sudah bergejala akan terus menurun sampai tidak berbuah. Yang menentukan tiga hal, dan tidak satu pun berupa semprotan ke pohon sakit: bibit berlabel bebas penyakit, mengendalikan kutu loncat pada tunas muda, dan MENCABUT pohon sakit supaya tidak jadi sumber penularan bagi kebun sendiri dan tetangga.',
    gejala:
      'Daun belang kuning TIDAK SETANGKUP di kiri dan kanan tulang daun — itu bedanya dengan kekurangan hara, yang belangnya setangkup. Daun mengecil, tegak, dan tulang daunnya menebal pucat. Buah kecil, miring bentuknya, dan bila dibelah bijinya banyak yang gugur berwarna gelap; rasanya masam. Ranting mati dari ujung, dan pohon berbunga di luar musim.',
    pembanding: [
      {
        cek: 'Bandingkan sisi kiri dan kanan helai daun terhadap tulang daun tengahnya. CVPD memberi belang kuning yang TIDAK setangkup — pola kuningnya berbeda di kedua sisi. Kekurangan hara memberi pola yang setangkup, sama di kiri dan kanan.',
      },
      {
        cek: 'Belah beberapa buah yang bentuknya miring. CVPD membuat biji gugur berwarna gelap dan bagian dalam buah tidak simetris. Kalau bijinya penuh dan buahnya simetris, penyebab kuningnya bukan CVPD — dan itu kabar baik, karena yang lain masih bisa dijawab.',
      },
    ],
  },
];

const PINTU_CUCURBIT = [
  {
    id: 'op:pst:00000089',
    dari: 'op:pst:00001083',
    nama: 'Penyakit Embun Bulu',
    key: 'embun-bulu-cucurbit',
    label: 'Embun bulu cucurbit',
    definition:
      'Oomycete, bukan jamur sejati — dan itu menentukan bahan aktifnya: metalaksil, dimetomorf, dan simoksanil bekerja padanya, banyak fungisida untuk jamur sejati tidak. Penyakit daun paling banyak didaftarkan pada seluruh cucurbit — 40 baris. Sporanya terbawa angin antar-kebun, jadi menanam serempak dan menjarangkan tanaman ikut menentukan. Registri juga memuat ejaan Peronosclerospora cubensis (1 baris) yang belum disatukan.',
    gejala:
      'Bercak BERSUDUT dibatasi tulang daun — kotak-kotak kuning yang tidak melewati tulang daun — mula-mula pada daun tua di dekat pangkal lalu naik. Pagi hari saat masih berembun, permukaan BAWAH bercak berselaput halus keunguan sampai kelabu. Daun mengering dan menggulung ke atas; buahnya tetap terbentuk tetapi kecil dan hambar karena daunnya habis lebih dulu.',
    pembanding: [
      {
        cek: 'Lihat batas bercaknya terhadap tulang daun. Embun bulu berhenti di tulang daun sehingga bercaknya BERSUDUT seperti kotak; embun tepung tidak berbercak sudut melainkan menaburkan lapisan putih di permukaan atas daun.',
        membantah: { id: 'op:pst:00000092', label: 'Embun tepung cucurbit' },
      },
      {
        cek: 'Balik daun pagi-pagi sebelum matahari naik. Selaput halus keunguan di permukaan BAWAH bercak hanya dibuat embun bulu; siang hari selaput itu hilang dan yang tersisa cuma bercak kuning bersudut.',
      },
    ],
  },
  {
    id: 'op:pst:00000090',
    dari: 'op:pst:00001142',
    nama: 'Penyakit Antraknosa',
    key: 'antraknosa-cucurbit',
    label: 'Antraknosa cucurbit',
    definition:
      'Menular lewat benih dan sisa tanaman, dan menyebar lewat percikan air — jadi paling parah pada musim hujan dan pada petak tanpa mulsa. Registri juga memuat Colletotrichum sp. (3 baris), C. gloeosporioides (2), dan C. capsici (1) sebagai sasaran pada cucurbit; semuanya belum disatukan dan tidak ikut terdaftar di bawah pintu ini.',
    gejala:
      'Bercak bulat coklat kemerahan pada daun yang tengahnya lama-lama berlubang seperti ditembak, dan pada batang bercak memanjang cekung. Pada buah muncul bercak CEKUNG bundar berair yang meluas, dan di tengahnya keluar massa spora merah jambu sampai jingga saat lembap.',
    pembanding: [
      {
        cek: 'Perhatikan bercak pada BUAH dan warnanya saat lembap. Antraknosa memberi bercak cekung dengan massa spora MERAH JAMBU di tengahnya; busuk karena bakteri berbau menyengat dan tidak berwarna merah jambu.',
      },
      {
        cek: 'Lihat bercak daunnya. Antraknosa memberi bercak bulat yang tengahnya berlubang seperti ditembak, tidak dibatasi tulang daun; embun bulu memberi bercak BERSUDUT yang berhenti tepat di tulang daun.',
        membantah: { id: 'op:pst:00000089', label: 'Embun bulu cucurbit' },
      },
    ],
  },
  {
    id: 'op:pst:00000091',
    dari: 'op:pst:00001342',
    nama: 'Kumbang Pemakan Daun',
    key: 'oteng-oteng',
    label: 'Oteng-oteng',
    inang: [SEMANGKA, MELON, MENTIMUN, SAWI],
    definition:
      'Kumbang daun cucurbit; di banyak daerah disebut oteng-oteng. Identitasnya di GBIF hanya tertambat sampai GENUS, jadi yang dijanjikan pintu ini cirinya bukan nama spesiesnya. Registri juga mendaftarkannya pada sawi, dan cara merusaknya di sana sama. Larvanya di dalam tanah memakan akar dan pangkal batang, jadi kerusakan daun yang terlihat hanya separuh ceritanya.',
    gejala:
      'Daun berlubang BUNDAR rapi seperti dilubangi pelubang kertas, sering berbaris melingkar, dan pada serangan berat daun muda habis tinggal tulangnya. Kumbangnya bulat lonjong seukuran biji jagung, jingga kekuningan mengkilap, dan langsung menjatuhkan diri atau terbang saat daun disentuh.',
    pembanding: [
      {
        cek: 'Perhatikan bentuk lubangnya. Oteng-oteng meninggalkan lubang BUNDAR rapi berukuran seragam, sering melingkar; ulat meninggalkan lubang tidak beraturan dengan tepi bergerigi dan butiran kotoran.',
        membantah: { id: 'op:pst:00000005', label: 'Ulat grayak' },
      },
      {
        cek: 'Sentuh daunnya dan lihat apa yang terjadi. Kumbangnya menjatuhkan diri atau terbang seketika — kalau tidak ada yang bergerak dan lubangnya tetap bundar rapi, kumbangnya makan malam hari dan perlu diperiksa saat itu.',
      },
    ],
  },
  {
    id: 'op:pst:00000092',
    dari: 'op:pst:00001401',
    nama: 'Penyakit Embun Tepung',
    key: 'embun-tepung-cucurbit',
    label: 'Embun tepung cucurbit',
    definition:
      'Registri lebih banyak memuatnya sebagai Oidium sp. (6 baris) daripada atas nama spesies ini (2 baris), dan keduanya belum disatukan; pintu ini berdiri di atas nama yang dikenali GBIF sampai spesies, jadi enam baris itu tidak ikut terdaftar di sini. Berbeda dari embun bulu, ia justru menyukai cuaca KERING dan panas — dua penyakit dengan nama mirip yang datang pada musim berlawanan.',
    gejala:
      'Lapisan PUTIH seperti tepung di permukaan ATAS daun tua lebih dulu, mula-mula setitik lalu meluas menutup helai dan menyeberang ke tangkai. Daun yang tertutup menguning lalu mengering tetapi tidak menggulung; buah yang terbuka karena daunnya habis jadi terbakar matahari.',
    pembanding: [
      {
        cek: 'Usap lapisan putihnya dengan jari. Embun tepung TERANGKAT dan menempel di jari seperti bedak, dan daun di bawahnya masih hijau. Embun bulu tidak bisa diusap begitu — selaputnya di permukaan bawah dan bercaknya sudah menguning.',
        membantah: { id: 'op:pst:00000089', label: 'Embun bulu cucurbit' },
      },
      {
        cek: 'Ingat cuaca beberapa hari terakhir. Embun tepung menumpuk pada cuaca KERING dan panas; embun bulu justru meledak sesudah hujan dan embun berat. Cuacanya sendiri sudah setengah jawaban.',
        membantah: { id: 'op:pst:00000089', label: 'Embun bulu cucurbit' },
      },
    ],
  },
];

const PINTU_LEGUM = [
  {
    id: 'op:pst:00000093',
    dari: 'op:pst:00001104',
    nama: 'Penggerek Polong',
    key: 'penggerek-polong-kacang-panjang',
    label: 'Penggerek polong kacang panjang',
    inang: [KACANG_PANJANG, KACANG_HIJAU],
    definition:
      'Berbeda dari penggerek polong kedelai (Etiella zinckenella) yang masuk diam-diam lewat lubang kecil: yang ini MENGIKAT bunga dan polong dengan benang sutra dan makan dari dalam ikatan itu, jadi kerusakannya terlihat dari luar. Menyerang sejak fase bunga, dan bunga yang rontok lebih dulu sering satu-satunya tanda sebelum polong terbentuk.',
    gejala:
      'Bunga dan polong muda TERIKAT jadi gumpalan oleh benang sutra bercampur kotoran berbutir, dan bunga rontok banyak sebelum jadi polong. Polong yang terbentuk berlubang dengan kotoran menyembul di mulut lubang; dibelah, bijinya berlubang dan ada ulat bergaris dengan bintik gelap berbaris di punggungnya.',
    pembanding: [
      {
        cek: 'Cari GUMPALAN bunga atau polong yang terikat benang, lalu buka. Penggerek polong kacang panjang meninggalkan benang sutra bercampur kotoran; penggerek polong kedelai tidak mengikat apa pun — ia masuk lewat lubang kecil dan polongnya tampak normal dari luar.',
        membantah: { id: 'op:pst:00000055', label: 'Penggerek polong' },
      },
      {
        cek: 'Perhatikan kapan kerusakannya mulai. Penggerek polong kacang panjang sudah bekerja sejak FASE BUNGA — bunga rontok banyak sebelum ada polong. Kalau bunganya utuh dan hanya polong tua yang rusak, penyebabnya lain.',
      },
    ],
  },
  {
    id: 'op:pst:00000094',
    dari: 'op:pst:00001146',
    nama: 'Kutu Daun',
    key: 'kutu-daun-kacang',
    label: 'Kutu daun kacang',
    inang: [KACANG_PANJANG, KACANG_HIJAU],
    definition:
      'Penular beberapa virus mosaik pada kacang-kacangan, dan itu yang membuatnya menentukan pada tanaman muda — bukan isapannya. Registri juga memuat Aphis sp. (2 baris) yang belum disatukan. Musuh alaminya banyak; koloni yang terlihat besar sering sudah didatangi kepik dan larva syrphid, dan menyemprot menyeluruh membunuh keduanya lebih dulu.',
    gejala:
      'Kutu HITAM mengkilap berkelompok sangat rapat di pucuk, tangkai bunga, dan polong muda sampai bagian itu terlihat menghitam seluruhnya. Pucuk mengeriting dan memendek, bunga rontok, dan polong yang terbentuk bengkok. Daun di bawahnya lengket lalu berjelaga; semut naik-turun.',
    pembanding: [
      {
        cek: 'Lihat warnanya. Kutu daun kacang HITAM mengkilap dan berkerumun sampai menghitamkan pucuk; kutu daun persik hijau atau kekuningan dan tidak sepadat itu.',
        membantah: { id: 'op:pst:00000002', label: 'Kutu daun persik' },
      },
      {
        cek: 'Cari musuh alaminya di antara koloni sebelum memutuskan: kepik bertitik, larva pipih kehijauan, atau kutu yang menggembung kecoklatan seperti balon — yang terakhir berarti sudah diparasit. Kalau banyak, koloni itu sedang runtuh sendiri.',
      },
    ],
  },
  {
    id: 'op:pst:00000095',
    dari: 'op:pst:00001302',
    nama: 'Penyakit Bercak Daun',
    key: 'bercak-daun-kacang-tanah',
    label: 'Bercak daun kacang tanah',
    inang: [KACANG_TANAH],
    definition:
      'Bercak daun awal. Registri juga memuat pasangannya, bercak daun lambat Cercospora personata (3 baris), dan Cercospora sp. (2) — keduanya belum disatukan dan tidak ikut terdaftar di bawah pintu ini. Keduanya bersama karat daun menggunduli tanaman sebelum polong terisi penuh, dan gundul itulah yang menurunkan hasil, bukan bercaknya sendiri.',
    gejala:
      'Bercak bulat coklat pada daun dengan HALO KUNING tegas mengelilinginya, mula-mula pada daun bawah lalu naik. Bercaknya terlihat lebih gelap dari sisi atas daripada sisi bawah. Daun yang penuh bercak menguning lalu rontok, dan tanaman gundul dari bawah sementara polongnya belum tua.',
    pembanding: [
      {
        cek: 'Bandingkan bercak dari sisi atas dan sisi bawah daun. Bercak daun kacang tanah lebih GELAP dari sisi atas dan berhalo kuning tegas; karat daun sebaliknya menonjol di sisi BAWAH dan meninggalkan serbuk coklat di jari.',
        membantah: { id: 'op:pst:00000096', label: 'Karat daun kacang tanah' },
      },
      {
        cek: 'Lihat dari daun mana ia mulai dan seberapa cepat gundulnya. Bercak daun mulai dari daun BAWAH lalu naik; kalau daun rontok tanpa bercak sama sekali, penyebabnya bukan penyakit daun ini.',
      },
    ],
  },
  {
    id: 'op:pst:00000096',
    dari: 'op:pst:00001372',
    nama: 'Penyakit Karat Daun',
    key: 'karat-daun-kacang-tanah',
    label: 'Karat daun kacang tanah',
    inang: [KACANG_TANAH],
    definition:
      'Hampir selalu datang bersama bercak daun, dan gabungan keduanya yang menggunduli tanaman — memutuskan berdasarkan salah satunya saja sering keliru menilai keparahan. Sporanya terbawa angin dan bertahan pada sisa tanaman, jadi jarak tanam dan rotasi ikut menentukan.',
    gejala:
      'Bintil kecil coklat kemerahan MENONJOL di permukaan BAWAH daun, yang pecah dan menyisakan serbuk coklat di jari. Dari sisi atas terlihat sebagai bintik kuning kecil. Daun mengering tetapi sering tetap MENGGANTUNG di tanaman, tidak langsung rontok.',
    pembanding: [
      {
        cek: 'Usap permukaan bawah daun dengan jari. Karat daun meninggalkan SERBUK coklat kemerahan; bercak daun kacang tanah rata dan tidak berserbuk.',
        membantah: { id: 'op:pst:00000095', label: 'Bercak daun kacang tanah' },
      },
      {
        cek: 'Lihat apakah daun yang mati rontok atau menggantung. Karat daun sering menyisakan daun kering yang tetap menggantung di batang; bercak daun membuat daunnya rontok.',
        membantah: { id: 'op:pst:00000095', label: 'Bercak daun kacang tanah' },
      },
    ],
  },
  {
    id: 'op:pst:00000097',
    dari: 'op:pst:00001332',
    nama: 'Penyakit Bercak Daun',
    key: 'bercak-daun-kacang-panjang',
    label: 'Bercak daun kacang panjang',
    inang: [KACANG_PANJANG, KACANG_HIJAU],
    definition:
      'Registri juga memuat Cercospora cruenta (2 baris) dan Cercospora sp. (1) sebagai sasaran pada kacang panjang; keduanya belum disatukan dan tidak ikut terdaftar di bawah pintu ini. Paling parah pada musim hujan dan pada pertanaman rapat yang daunnya lama basah.',
    gejala:
      'Bercak BERSUDUT kecoklatan dibatasi tulang daun halus, sering menyatu jadi bidang kering yang lebih besar, dan pada cuaca lembap permukaan bawahnya berbulu halus kelabu. Daun menguning lalu rontok dari bawah ke atas; polong yang terbentuk lebih pendek karena daunnya habis lebih dulu.',
    pembanding: [
      {
        cek: 'Lihat batas bercaknya terhadap tulang daun. Bercak daun kacang panjang BERSUDUT dan berhenti di tulang daun halus; bercak karena kutu atau terbakar pupuk tidak mengikuti tulang daun.',
        membantah: { id: 'op:pst:00000094', label: 'Kutu daun kacang' },
      },
      {
        cek: 'Periksa permukaan bawah bercak pada pagi lembap. Bulu halus kelabu di bawah bercak menandakan jamurnya sedang bersporulasi — itu saat penularannya paling cepat, dan saat menjarangkan atau memangkas daun bawah paling berguna.',
      },
    ],
  },
];

const PINTU_TEMBAKAU = [
  {
    id: 'op:pst:00000098',
    dari: 'op:pst:00001166',
    nama: 'Penyakit Lanas',
    key: 'lanas',
    label: 'Lanas',
    definition:
      'Oomycete, bukan jamur sejati — metalaksil dan dimetomorf bekerja padanya, banyak fungisida untuk jamur sejati tidak. Menular lewat air yang mengalir di permukaan tanah, jadi satu petak yang terkena bisa menulari petak di bawahnya lewat parit. Yang menentukan guludan tinggi, drainase, dan tidak menyiram melimpah dari atas — semprotan ke daun tidak menjangkau jamur yang menyerang dari pangkal batang.',
    gejala:
      'Tanaman layu mendadak pada siang hari lalu tidak pulih, dan pada pangkal batang ada bercak coklat kehitaman BASAH yang melingkari batang. Batang yang dibelah membujur berlubang berongga dengan sekat-sekat melintang seperti tangga. Kerusakan menyebar mengikuti arah aliran air, bukan tersebar merata.',
    pembanding: [
      {
        cek: 'Belah pangkal batang tanaman yang layu MEMBUJUR. Lanas meninggalkan rongga bersekat melintang seperti tangga di dalam empulur — tidak ada penyakit tembakau lain yang membentuknya.',
      },
      {
        cek: 'Perhatikan arah sebarannya di petak. Lanas mengikuti aliran air dan menumpuk di bagian rendah atau di sepanjang parit; layu karena bakteri atau fusarium tidak mengikuti aliran air seperti itu.',
        membantah: { id: 'op:pst:00000009', label: 'Layu bakteri' },
      },
    ],
  },
  {
    id: 'op:pst:00000099',
    dari: 'op:pst:00001182',
    nama: 'Penyakit Patik Daun',
    key: 'patik-daun-tembakau',
    label: 'Patik daun',
    definition:
      'Menyerang daun yang justru dipanen, jadi kerugiannya langsung pada mutu — bukan pada jumlah. Paling parah pada daun bawah yang lama basah dan pada pertanaman rapat; memangkas daun bawah yang sudah tua memutus sumber penularan ke daun di atasnya.',
    gejala:
      'Bercak bulat kecil pada daun dengan tengah KEPUTIHAN tipis sampai tembus cahaya dan tepi coklat tegas, mula-mula pada daun BAWAH lalu naik. Bercak yang banyak menyatu jadi bidang kering dan daunnya sobek di bagian itu saat dipanen atau dijemur.',
    pembanding: [
      {
        cek: 'Terawang bercaknya ke cahaya. Patik daun bertengah tipis sampai TEMBUS CAHAYA dan sering berlubang saat kering; bercak karena terbakar pupuk tidak tembus cahaya dan mengikuti tepi atau ujung daun.',
      },
      {
        cek: 'Lihat daun mana yang kena lebih dulu. Patik daun mulai dari daun BAWAH yang paling tua dan lama basah, lalu naik. Kalau justru daun pucuk yang bergejala sementara daun bawah bersih, penyebabnya bukan patik daun.',
      },
    ],
  },
];

const PINTU_TEH = [
  {
    id: 'op:pst:00000100',
    dari: 'op:pst:00001129',
    nama: 'Wereng Daun',
    key: 'wereng-daun-teh',
    label: 'Wereng daun teh',
    definition:
      'Identitasnya di GBIF hanya tertambat sampai GENUS, jadi yang dijanjikan pintu ini cirinya bukan nama spesiesnya. Menyerang pucuk yang justru dipetik, sehingga kerugiannya langsung pada mutu dan bobot pucuk. Ledakannya mengikuti giliran petik: pucuk muda yang serentak muncul sesudah pemetikan adalah yang paling disukainya.',
    gejala:
      'Tepi daun muda menguning lalu MENCOKLAT dan menggulung ke bawah, mulai dari ujung dan tepi ke dalam, sehingga pucuk terlihat seperti terbakar. Pucuk kerdil dan ruasnya memendek. Serangga hijau pucat ramping berjalan MENYAMPING seperti kepiting saat daun dibalik, lalu melompat.',
    pembanding: [
      {
        cek: 'Balik daun muda dan perhatikan cara serangganya bergerak. Wereng daun berjalan MENYAMPING lalu melompat — tidak ada hama teh lain yang berjalan begitu. Kalau tidak ada yang bergerak dan tepi daunnya tetap mencoklat, curigai kekurangan hara atau terbakar angin.',
      },
      {
        cek: 'Lihat dari mana kerusakan daun mulai. Wereng daun merusak dari TEPI dan ujung ke dalam sehingga daun menggulung; helopeltis meninggalkan bintik cekung kehitaman yang tersebar di tengah helai, bukan di tepi.',
        membantah: { id: 'op:pst:00000063', label: 'Helopeltis' },
      },
    ],
  },
  {
    id: 'op:pst:00000101',
    dari: 'op:pst:00001191',
    nama: 'Penyakit Cacar Daun',
    key: 'cacar-daun-teh',
    label: 'Cacar daun teh',
    definition:
      'Hanya menyerang daun MUDA yang belum mengeras — daun tua kebal — jadi ia menyerang tepat bagian yang dipetik. Menyukai kebun yang lembap, berkabut, dan bernaungan berat; mengurangi naungan dan mempersingkat giliran petik menurunkan lebih banyak daripada menambah semprotan.',
    gejala:
      'Bintik kecil TEMBUS CAHAYA pada daun muda, lalu membesar jadi bercak bundar yang CEKUNG di permukaan atas dan MENONJOL di permukaan bawah seperti cacar. Bagian yang menonjol itu berselaput putih keabuan berisi spora. Daun sobek di bekas bercaknya dan pucuk yang berat serangannya patah.',
    pembanding: [
      {
        cek: 'Raba bercak dari kedua sisi daun. Cacar daun CEKUNG di atas dan MENONJOL di bawah — satu-satunya penyakit teh yang begitu — dan bagian menonjolnya berselaput putih.',
      },
      {
        cek: 'Lihat umur daun yang terkena. Cacar daun hanya menyerang daun muda yang masih lemas; kalau yang berbercak justru daun tua yang sudah keras, penyebabnya bukan cacar daun.',
      },
    ],
  },
  {
    id: 'op:pst:00000102',
    dari: 'op:pst:00001306',
    nama: 'Tungau Jingga',
    key: 'tungau-jingga',
    label: 'Tungau jingga',
    definition:
      'Paling parah pada musim kemarau dan pada kebun yang berdebu di pinggir jalan. Musuh alaminya — tungau pemangsa — mudah mati oleh penyemprotan menyeluruh, dan ledakan tungau sesudah menyemprot hama lain adalah pola yang lazim.',
    gejala:
      'Permukaan ATAS daun tua berubah kemerahan sampai coklat kusam seperti berkarat, mulai dari sepanjang tulang daun tengah lalu meluas. Daun mengeras, mengkilap tidak wajar, lalu rontok. Tungaunya jingga kemerahan dan JAUH lebih kecil dari kepala jarum — perlu ditatap lama atau dengan kaca pembesar.',
    pembanding: [
      {
        cek: 'Tatap sepanjang tulang daun tengah di permukaan ATAS daun tua, kena cahaya miring. Tungau jingga berkumpul di situ lebih dulu sebelum menyebar. Tungau merah sebaliknya berkumpul di permukaan BAWAH dan meninggalkan anyaman benang halus.',
        membantah: { id: 'op:pst:00000006', label: 'Tungau merah' },
      },
      {
        cek: 'Periksa apakah ada anyaman benang. Tungau jingga TIDAK menganyam; kalau ada anyaman halus di pucuk atau bawah daun, itu tungau jenis lain.',
        membantah: { id: 'op:pst:00000006', label: 'Tungau merah' },
      },
    ],
  },
];

const PINTU_MANGGA = [
  {
    id: 'op:pst:00000103',
    dari: 'op:pst:00001081',
    nama: 'Penyakit Antraknosa',
    key: 'antraknosa-mangga',
    label: 'Antraknosa mangga',
    definition:
      'Entitas ini terdaftar juga di luar mangga — cabai 12 baris, jeruk 3, karet 2, dan lainnya — dan teks di bawah ditulis UNTUK MANGGA. Cabai punya pintu antraknosanya sendiri atas nama Colletotrichum spp. Sporanya menempel di buah sejak masih pentil lalu diam sampai buah matang, jadi bercaknya baru muncul menjelang atau sesudah panen; menyemprot saat buah sudah berbercak sudah terlambat.',
    gejala:
      'Bercak hitam bersudut pada daun muda yang lalu berlubang, dan pada tangkai bunga bercak hitam memanjang yang membuat bunga mengering hitam sebelum jadi pentil. Pada buah, bercak hitam CEKUNG bundar yang meluas dan menyatu, sering membentuk aliran memanjang seperti bekas air mata dari pangkal buah.',
    pembanding: [
      {
        cek: 'Lihat bentuk bercak pada buah yang sudah tua. Antraknosa mangga membentuk aliran memanjang seperti bekas air mata dari pangkal ke bawah, karena sporanya terbawa air hujan yang mengalir di kulit buah. Bercak daun mangga tidak pernah membentuk aliran begitu.',
        membantah: { id: 'op:pst:00000104', label: 'Bercak daun mangga' },
      },
      {
        cek: 'Ingat kapan bercaknya muncul. Antraknosa menempel sejak pentil dan baru terlihat menjelang matang — jadi buah yang mulus di pohon bisa berbercak di keranjang. Kalau bercaknya sudah ada sejak buah masih kecil dan tidak meluas, penyebabnya lain.',
      },
    ],
  },
  {
    id: 'op:pst:00000104',
    dari: 'op:pst:00001185',
    nama: 'Penyakit Bercak Daun',
    key: 'bercak-daun-mangga',
    label: 'Bercak daun mangga',
    definition:
      'Menyerang daun dan ranting, bukan buah — jadi kerugiannya lewat daun yang habis dan pohon yang melemah, bukan lewat buah yang tidak laku. Paling parah pada pohon yang tajuknya rapat dan jarang dipangkas.',
    gejala:
      'Bercak bersudut coklat kehitaman pada daun yang dibatasi tulang daun, tengahnya lama-lama keabuan dengan titik hitam halus, dan tepinya kadang berhalo kuning. Bercak yang banyak menyatu sampai daun mengering dan rontok; ranting muda ikut berbercak dan mati dari ujung.',
    pembanding: [
      {
        cek: 'Lihat apakah buahnya ikut berbercak. Bercak daun mangga menyerang DAUN dan ranting saja — buahnya mulus. Kalau buah ikut berbercak hitam cekung, itu antraknosa.',
        membantah: { id: 'op:pst:00000103', label: 'Antraknosa mangga' },
      },
      {
        cek: 'Perhatikan batas bercaknya. Bercak daun mangga bersudut dibatasi tulang daun; antraknosa pada daun muda memberi bercak hitam yang lalu berlubang, tidak mengikuti tulang daun.',
        membantah: { id: 'op:pst:00000103', label: 'Antraknosa mangga' },
      },
    ],
  },
  {
    id: 'op:pst:00000105',
    dari: 'op:pst:00001359',
    nama: 'Kutu Putih',
    key: 'kutu-putih-mangga',
    label: 'Kutu putih mangga',
    definition:
      'Identitasnya di GBIF hanya tertambat sampai GENUS. Nimfanya naik dari tanah ke tajuk lewat batang, jadi PITA PERANGKAP dari plastik licin atau lem di batang memutus jalannya — tindakan yang tidak menuntut semprotan sama sekali. Semut memelihara dan mengangkutnya, dan mengendalikan semutnya ikut menentukan.',
    gejala:
      'Gerombolan kutu berlapis lilin PUTIH seperti kapas menutup tangkai bunga, pentil, dan pucuk sampai bagian itu tampak memutih. Bunga dan pentil rontok banyak; daun di bawahnya lengket lalu tertutup jelaga hitam sampai gelap.',
    pembanding: [
      {
        cek: 'Periksa batang dari pangkal ke atas, bukan cuma tajuknya. Kutu putih mangga NAIK lewat batang dari tanah, jadi barisan kutu di kulit batang menandakan gelombang berikutnya sedang berjalan — dan di situlah pita perangkap masih sempat memutusnya.',
      },
      {
        cek: 'Usap gerombolan putihnya. Kutu putih hancur jadi bubuk lilin dan menyisakan tubuh kutu di bawahnya; embun tepung juga putih tetapi tidak menyisakan tubuh serangga apa pun.',
      },
    ],
  },
  {
    id: 'op:pst:00000106',
    dari: 'op:pst:00001442',
    nama: 'Wereng Mangga',
    key: 'wereng-mangga',
    label: 'Wereng mangga',
    definition:
      'Identitasnya di GBIF hanya tertambat sampai GENUS, dan registri memecahnya lagi jadi Idioscopus sp. (2 baris) serta ejaan Ideocerus spp. (1) yang belum disatukan. Menyerang tepat pada fase BERBUNGA, dan di luar fase itu jarang menuntut tindakan — jendela pengendaliannya sempit dan terikat pada saat malai keluar.',
    gejala:
      'Malai bunga mengering dan rontok sebelum jadi pentil, dan saat malai diguncang serangga pipih berbentuk baji seukuran biji wijen BERHAMBURAN keluar lalu hinggap lagi. Bunga dan daun muda lengket oleh embun madu, lalu tertutup jelaga hitam sampai malai menghitam seluruhnya.',
    pembanding: [
      {
        cek: 'Guncang malai bunga di pagi hari dan lihat apa yang berhamburan. Wereng mangga pipih berbentuk BAJI — lebar di kepala, meruncing ke belakang — dan langsung hinggap lagi; kutu putih tidak terbang dan tetap menempel bergerombol.',
        membantah: { id: 'op:pst:00000105', label: 'Kutu putih mangga' },
      },
      {
        cek: 'Perhatikan fase pohonnya. Wereng mangga menumpuk tepat saat malai keluar sampai pentil terbentuk; di luar fase itu jumlahnya turun sendiri, dan menyemprot terjadwal di luar masa berbunga menghabiskan biaya tanpa menyelamatkan apa pun.',
      },
    ],
  },
];

const PINTU_APEL = [
  {
    id: 'op:pst:00000107', dari: 'op:pst:00001232', nama: 'Penyakit Bercak Daun',
    key: 'bercak-daun-apel', label: 'Bercak daun apel',
    definition:
      'Menggunduli pohon sebelum buah masak, dan gundul itulah yang menurunkan hasil serta melemahkan pohon untuk musim berikutnya — bukan bercaknya sendiri. Menular dari daun rontok yang menumpuk di bawah pohon, jadi mengumpulkan dan memendam serasah memutus daur tahunannya.',
    gejala:
      'Bercak bulat coklat kehitaman pada daun dengan tepi menyebar tidak tegas, dan di tengahnya titik-titik hitam halus. Bercak yang banyak membuat daun menguning lalu RONTOK dari bawah ke atas, sampai pohon gundul sementara buahnya masih menggantung.',
    pembanding: [
      { cek: 'Usap permukaan bercaknya. Bercak daun apel RATA dan kering tanpa lapisan yang bisa diusap; embun tepung meninggalkan lapisan putih yang menempel di jari seperti bedak.',
        membantah: { id: 'op:pst:00000108', label: 'Embun tepung apel' } },
      { cek: 'Periksa serasah daun di bawah pohon. Bercak daun apel menular dari daun rontok musim lalu, jadi tumpukan serasah di bawah pohon yang paling parah adalah sumbernya — dan itu bagian yang masih bisa dijawab tanpa menyemprot.' },
    ],
  },
  {
    id: 'op:pst:00000108', dari: 'op:pst:00001203', nama: 'Penyakit Embun Tepung',
    key: 'embun-tepung-apel', label: 'Embun tepung apel',
    definition:
      'Bertahan di dalam TUNAS selama musim dingin lalu keluar bersama tunas itu, jadi tunas yang terserang tahun lalu adalah sumber tahun ini — memangkas dan membakar tunas berpucuk putih pada awal musim memutus daurnya. Registri juga memuat Oidium sp. (3 baris) sebagai sasaran pada apel yang belum disatukan.',
    gejala:
      'Lapisan PUTIH seperti tepung menutup daun muda, tunas, dan kadang bunga, sehingga tunas yang membuka sudah tampak keputihan sejak awal. Daun yang tertutup menggulung ke atas memanjang seperti perahu, mengeras, dan tidak membesar; buah yang terkena berkulit kasar berjala.',
    pembanding: [
      { cek: 'Lihat tunas yang BARU membuka pada awal musim. Embun tepung sudah putih sejak tunas itu keluar — bukan menular ke daun yang sudah jadi. Tunas seperti itu yang perlu dipangkas.' },
      { cek: 'Perhatikan bentuk daun yang terkena. Embun tepung membuat daun menggulung memanjang ke atas seperti perahu dan mengeras; kutu daun apel membuat daun menggulung ke bawah dan tetap lemas, serta meninggalkan permukaan lengket.',
        membantah: { id: 'op:pst:00000109', label: 'Kutu daun apel' } },
    ],
  },
  {
    id: 'op:pst:00000109', dari: 'op:pst:00001357', nama: 'Kutu Daun',
    key: 'kutu-daun-apel', label: 'Kutu daun apel',
    definition:
      'Menyerang pucuk yang sedang memanjang, jadi kerugiannya pada pertumbuhan tunas dan pada bibit — pohon dewasa yang sudah berhenti bertunas jarang dirugikan. Musuh alaminya banyak, dan koloni pada pohon dewasa umumnya runtuh sendiri sebelum menuntut tindakan.',
    gejala:
      'Kutu hijau berkelompok rapat di permukaan bawah daun MUDA dan di pucuk, sehingga daun menggulung ke BAWAH dan tetap lemas. Permukaan daun di bawahnya lengket lalu ditumbuhi jelaga hitam; semut naik-turun di cabang.',
    pembanding: [
      { cek: 'Buka gulungan daunnya. Kutu daun apel ada di dalam gulungan dan daunnya tetap LEMAS; daun yang menggulung karena embun tepung kosong, mengeras, dan berlapis putih.',
        membantah: { id: 'op:pst:00000108', label: 'Embun tepung apel' } },
      { cek: 'Periksa apakah pohonnya masih bertunas. Kalau pucuk sudah berhenti memanjang, koloni sebanyak apa pun jarang menurunkan hasil — dan menyemprot saat itu membunuh musuh alaminya menjelang musim berikutnya.' },
    ],
  },
  {
    id: 'op:pst:00000110', dari: 'op:pst:00001366', nama: 'Hama Tungau',
    key: 'tungau-merah-apel', label: 'Tungau merah apel',
    definition:
      'Telurnya yang berwarna merah bata bertahan di kulit ranting sepanjang musim tanpa daun, dan itu yang bisa dihitung SEBELUM musim dimulai — pemeriksaan ranting pada awal musim memberi peringatan berminggu-minggu lebih awal daripada menunggu daun berubah warna. Musuh alaminya tungau pemangsa, yang mati lebih dulu oleh penyemprotan menyeluruh.',
    gejala:
      'Daun berbintik kuning halus rapat seperti tertusuk jarum, lalu berubah keperunggu kusam menyeluruh dan mengeras; daun rontok pada serangan berat. Tungaunya kemerahan dan sangat kecil, terkumpul di permukaan BAWAH daun di sepanjang tulang daun.',
    pembanding: [
      { cek: 'Periksa kulit ranting dan ketiak tunas pada awal musim, sebelum daun banyak. Kumpulan telur MERAH BATA sebesar butir debu di situ menandakan populasi yang akan meledak — itu peringatan paling awal yang bisa didapat.' },
      { cek: 'Balik daun yang keperunggu dan tatap lama kena cahaya. Ada titik-titik kemerahan yang bergerak; kalau tidak ada yang bergerak dan warna perunggunya merata mengikuti tepi daun, curigai kekurangan hara atau terbakar.' },
    ],
  },
];

const PINTU_TEBU = [
  {
    id: 'op:pst:00000111', dari: 'op:pst:00001210', nama: 'Penggerek Batang',
    key: 'penggerek-batang-tebu', label: 'Penggerek batang tebu',
    definition:
      'Registri juga memuat Chilo auricilius (3 baris) dan Phragmataecia castaneae (3 baris, dua ejaan) sebagai penggerek batang tebu; semuanya belum disatukan dan tidak ikut terdaftar di bawah pintu ini. Ulatnya berada di dalam ruas, jadi semprotan hanya mengenai ngengat dan ulat yang sedang berpindah antar-ruas — jendela yang sempit.',
    gejala:
      'Lubang gerekan bulat pada ruas batang, sering berbaris ke atas, dengan butiran kotoran menyembul di mulutnya. Batang yang dibelah berlorong memanjang menembus beberapa ruas dan berisi kotoran. Ruas yang digerek memendek dan batangnya mudah patah saat berangin.',
    pembanding: [
      { cek: 'Belah batang yang berlubang membujur dan ikuti lorongnya. Penggerek batang membuat lorong yang MENEMBUS beberapa ruas dari samping; penggerek pucuk menggerek dari pucuk ke bawah dan mematikan titik tumbuhnya.',
        membantah: { id: 'op:pst:00000112', label: 'Penggerek pucuk tebu' } },
      { cek: 'Lihat apakah pucuknya masih hidup. Penggerek batang menyerang ruas di bawah dan pucuknya tetap tumbuh; kalau pucuknya mati dan mudah ditarik lepas, itu penggerek pucuk.',
        membantah: { id: 'op:pst:00000112', label: 'Penggerek pucuk tebu' } },
    ],
  },
  {
    id: 'op:pst:00000112', dari: 'op:pst:00001225', nama: 'Penggerek Pucuk',
    key: 'penggerek-pucuk-tebu', label: 'Penggerek pucuk tebu',
    definition:
      'Registri juga memuat Scirpophaga nivella (7 baris) — nama yang lama dipakai untuk penggerek pucuk tebu yang sama — dan keduanya belum disatukan, jadi tujuh baris itu tidak ikut terdaftar di bawah pintu ini. Menyerang sejak tanaman muda, dan tunas samping yang tumbuh menggantikan pucuk mati membuat batang bercabang serta tidak layak giling.',
    gejala:
      'Pucuk menguning lalu mati dan MUDAH DITARIK LEPAS, sementara daun di bawahnya masih hijau; dari kejauhan terlihat sebagai titik-titik kering di atas hamparan hijau. Pada daun yang masih menggulung ada deretan lubang kecil sejajar bekas gigitan sebelum daunnya membuka. Tunas samping tumbuh banyak menggantikan pucuk yang mati.',
    pembanding: [
      { cek: 'Tarik pucuk yang menguning. Kalau lepas ringan dan pangkalnya berlubang serta berkotoran, itu gerekan pucuk. Pucuk yang mati karena kekeringan tidak lepas ditarik dan pangkalnya kering tanpa lubang.' },
      { cek: 'Buka daun yang masih menggulung di pucuk. Deretan lubang kecil SEJAJAR di situ berarti daun itu digigit saat masih terlipat — tanda paling dini, jauh sebelum pucuknya mati.' },
    ],
  },
  {
    id: 'op:pst:00000113', dari: 'op:pst:00001257', nama: 'Hama Uret',
    key: 'uret-tebu', label: 'Uret',
    inang: [TEBU, JAGUNG],
    definition:
      'Larva kumbang yang hidup di dalam tanah dan memakan akar, jadi kerusakannya sudah lanjut saat terlihat dari atas. Paling parah di lahan kering berpasir dan di petak yang dekat pohon tempat kumbang dewasanya makan; menggenangi petak beberapa hari dan mengumpulkan kumbang dewasa saat menyala lampu adalah dua tindakan yang tidak menuntut semprotan.',
    gejala:
      'Rumpun menguning lalu layu dan mudah DICABUT karena akarnya habis, dan yang mati berkelompok membentuk petak-petak yang melebar. Digali sedalam sejengkal di sekitar rumpun mati, ada larva gemuk keputihan yang MELENGKUNG seperti huruf C dengan kepala coklat.',
    pembanding: [
      { cek: 'Gali tanah sedalam sekitar 20 cm di sekeliling rumpun yang layu. Uret melengkung seperti huruf C, berkepala coklat keras, dan diam saat diangkat — ulat tanah lebih ramping, kelabu, dan bergerak aktif.',
        membantah: { id: 'op:pst:00000014', label: 'Ulat tanah' } },
      { cek: 'Tarik rumpun yang menguning. Kalau tercabut ringan karena akarnya habis sementara pangkal batangnya utuh tanpa lubang gerekan, penyebabnya di TANAH — bukan penggerek batang.',
        membantah: { id: 'op:pst:00000111', label: 'Penggerek batang tebu' } },
    ],
  },
];

const PINTU_KARET = [
  {
    id: 'op:pst:00000114', dari: 'op:pst:00001189', nama: 'Penyakit Bidang Sadap',
    key: 'kanker-bidang-sadap', label: 'Kanker bidang sadap',
    definition:
      'Masuk lewat LUKA SADAP yang basah, jadi ia praktis penyakit yang dibuat oleh cara menyadap: pisau yang tidak bersih, sadapan terlalu dalam, dan menyadap saat kulit masih basah. Paling parah pada musim hujan. Yang menentukan menjarangkan giliran sadap saat hujan dan mengoles bidang sadap, bukan menyemprot tajuk.',
    gejala:
      'Garis coklat kehitaman memanjang TEGAK LURUS terhadap alur sadap, mulai tepat di alur lalu turun ke kulit di bawahnya. Lateks di sekitarnya menghitam dan membeku, kulit membusuk berbau, dan bila dikupas jaringan di bawahnya coklat berair. Bidang sadap yang parah tidak bisa disadap lagi.',
    pembanding: [
      { cek: 'Lihat arah garis kerusakannya terhadap alur sadap. Kanker bidang sadap membentuk garis TEGAK LURUS terhadap alur — tidak sejajar. Luka mekanis karena pisau mengikuti arah alurnya sendiri.' },
      { cek: 'Kupas tipis kulit di bawah garis hitam itu. Kalau jaringannya coklat berair dengan batas tegas terhadap kulit sehat, itu jamurnya sudah masuk; kalau di bawahnya masih putih bersih, yang terlihat cuma lateks kering.' },
    ],
  },
  {
    id: 'op:pst:00000115', dari: 'op:pst:00001253', nama: 'Penyakit Jamur Akar Putih',
    key: 'jamur-akar-putih', label: 'Jamur akar putih',
    definition:
      'Registri juga memuatnya atas nama lama Rigidoporus lignosus (8 baris) — jamur yang sama — yang belum disatukan, jadi baris itu tidak ikut terdaftar di bawah pintu ini. Menular lewat SENTUHAN AKAR antar-pohon dan dari tunggul kayu yang tertinggal saat pembukaan lahan, jadi ia menyebar melingkar dari satu titik dan yang menentukan membongkar tunggul serta membuat parit isolasi — bukan menyemprot.',
    gejala:
      'Daun menguning lalu rontok dan tajuk menipis sementara pohon di sebelahnya masih hijau, dan pohon yang mati membentuk LINGKARAN yang melebar tiap tahun. Digali di sekitar leher akar, ada benang jamur PUTIH pipih menempel rata pada permukaan akar seperti akar yang dijalari urat putih; benang itu tidak lepas bila disikat ringan.',
    pembanding: [
      { cek: 'Gali leher akar dan cuci sedikit dengan air. Jamur akar putih menempel RATA pada permukaan akar sebagai benang putih pipih yang tidak lepas disikat; akar berjamur biasa berlapisan yang mudah lepas.' },
      { cek: 'Petakan pohon yang mati di atas kertas. Jamur akar putih menular lewat sentuhan akar sehingga yang mati membentuk lingkaran melebar dari satu titik; kematian yang tersebar acak penyebabnya bukan ini.' },
    ],
  },
];

const PINTU_LADA = [
  {
    id: 'op:pst:00000116', dari: 'op:pst:00001219', nama: 'Hama Penghisap Buah',
    key: 'pengisap-buah-lada', label: 'Pengisap buah lada',
    definition:
      'Menyerang buah sejak pentil sampai menjelang masak, dan kerugiannya pada JUMLAH buah yang jadi — bukan pada mutu buah yang terkumpul. Registri juga memuat bubuk buah Lophobaris piperis (1 baris) yang menggerek dari dalam, masalah lain dengan gejala yang mirip dari kejauhan.',
    gejala:
      'Buah pada malai berbintik coklat kehitaman bekas tusukan lalu mengering dan gugur, sehingga malai berbulir jarang-jarang atau tinggal tangkainya. Serangga coklat kekuningan ramping berkaki panjang beterbangan rendah dari malai saat sulur diguncang, dan meninggalkan bau khas.',
    pembanding: [
      { cek: 'Guncang sulur berbuah pada pagi hari dan cium. Pengisap buah lada beterbangan dan meninggalkan bau khas; kalau buah gugur tanpa ada serangga dan tanpa bau, periksa apakah ada lubang gerekan pada tangkainya.' },
      { cek: 'Periksa buah yang masih menempel. Pengisap buah meninggalkan BINTIK tusukan pada kulit tanpa lubang tembus; bubuk buah meninggalkan lubang bundar kecil dan bubuk halus di mulutnya.' },
    ],
  },
  {
    id: 'op:pst:00000117', dari: 'op:pst:00001456', nama: 'Hama Penghisap Bunga',
    key: 'pengisap-bunga-lada', label: 'Pengisap bunga lada',
    definition:
      'Menyerang pada fase BERBUNGA saja, dan di luar fase itu tidak menuntut apa pun — jendelanya terikat pada saat malai bunga keluar. Registri memecahnya lagi jadi Diplogomphus hewitti dan Diplogomphus hewiti (2 baris) yang belum disatukan.',
    gejala:
      'Malai bunga mengering dari ujung lalu gugur sebelum jadi pentil, sehingga sulur berbunga banyak tetapi berbuah sedikit. Pada malai ada serangga pipih kecil kecoklatan yang bersembunyi di sela bunga dan bergerak menyamping saat malai dibuka.',
    pembanding: [
      { cek: 'Buka sela bunga pada malai yang mengering, jangan cuma melihat dari luar. Pengisap bunga bersembunyi di dalamnya dan bergerak menyamping; malai yang kering karena kekurangan air mengering merata tanpa serangga.' },
      { cek: 'Perhatikan fase tanamannya. Pengisap bunga hanya menuntut tindakan saat malai keluar sampai pentil terbentuk. Kalau yang gugur justru buah yang sudah besar, penyebabnya pengisap buah, bukan pengisap bunga.',
        membantah: { id: 'op:pst:00000116', label: 'Pengisap buah lada' } },
    ],
  },
];

const PINTU_PISANG = [
  {
    id: 'op:pst:00000118', dari: 'op:pst:00001200', nama: 'Penyakit Sigatoka',
    key: 'sigatoka', label: 'Sigatoka',
    definition:
      'Menggunduli daun sehingga tandan tidak terisi penuh dan matang terlalu cepat setelah dipanen — kerugiannya lewat daun, bukan lewat buah yang berbercak. Registri juga memuat Cercospora musicola (1 baris) dan bercak speckle Cladosporium musae (1) yang belum disatukan. Memotong dan memendam daun yang bergejala memutus sumber spora, dan itu tindakan yang menentukan pada kebun kecil.',
    gejala:
      'Garis kecil kuning MEMANJANG sejajar tulang daun pada helai daun, lalu melebar jadi bercak lonjong bertengah kelabu dengan tepi coklat gelap. Bercak yang menyatu membuat helai daun mengering dari tepi dan menggantung; pohon yang parah tinggal beberapa daun saat tandan terbentuk.',
    pembanding: [
      { cek: 'Lihat arah bercak yang paling muda. Sigatoka selalu mulai sebagai GARIS memanjang sejajar tulang daun sebelum melebar — bukan sebagai bintik bundar. Garis itu tanda paling dini dan yang menentukan kapan daun sakit perlu dipotong.' },
      { cek: 'Hitung daun sehat yang tersisa saat tandan keluar. Kalau tinggal kurang dari sekitar delapan helai, tandannya tidak akan terisi penuh sebanyak apa pun disemprot sesudah itu — keputusannya sudah lewat.' },
    ],
  },
];

const PINTU_KRISAN = [
  {
    id: 'op:pst:00000119', dari: 'op:pst:00001512', nama: 'Penyakit Karat Daun',
    key: 'karat-krisan', label: 'Karat krisan',
    definition:
      'Registri juga memuat karat putih Puccinia horiana (1 baris), jenis lain yang dikarantina di banyak negara, serta embun tepung Oidium chrysanthemi (1); keduanya belum disatukan. Menyebar lewat percikan air dan kelembapan tinggi di dalam rumah lindung, jadi mengatur jarak tanam dan menyiram ke tanah bukan ke daun menurunkan lebih banyak daripada menambah semprotan.',
    gejala:
      'Bintil kecil MENONJOL di permukaan BAWAH daun, coklat kemerahan dan pecah menyisakan serbuk di jari, sementara dari sisi atas terlihat sebagai bintik kuning pucat. Daun bawah menguning lalu mengering; bunga yang terkena tidak laku dijual walau tangkainya sehat.',
    pembanding: [
      { cek: 'Balik daun dan usap bintilnya. Karat krisan meninggalkan SERBUK coklat kemerahan di jari. Kalau bintilnya PUTIH dan tidak berserbuk coklat, itu karat putih — jenis yang dikarantina, dan temuannya perlu dilaporkan, bukan cuma disemprot.' },
      { cek: 'Lihat dari sisi mana bintilnya menonjol. Karat menonjol di permukaan BAWAH; embun tepung menaburkan lapisan putih di permukaan ATAS yang bisa diusap seperti bedak.' },
    ],
  },
];

const PINTU_CABAI_LANJUT = [
  {
    id: 'op:pst:00000120', dari: 'op:pst:00001043', nama: 'Penyakit Antraknosa',
    key: 'antraknosa-cabai', label: 'Antraknosa cabai',
    inang: [CABAI],
    definition:
      'Patek. Entitas INI yang memegang hampir seluruh pendaftaran antraknosa cabai — 102 baris — sementara pintu "Antraknosa" yang lebih dulu ada berdiri di atas sasaran genus Colletotrichum spp. yang cuma dipakai 8 baris. Keduanya penyakit yang sama di kebun dan tidak bisa dibedakan tanpa laboratorium; yang membedakan hanya bagaimana registri menuliskan sasarannya. Sporanya menempel sejak buah masih hijau lalu diam sampai buah memerah, jadi menyemprot saat buah sudah berbercak selalu terlambat.',
    gejala:
      'Bercak melingkar CEKUNG pada buah, mula-mula berair lalu meluas dan menghitam, dan di tengah bercak muncul titik-titik hitam kecil tersusun melingkar sepusat. Buah yang terkena mengering keriput dan tetap menggantung; pada serangan berat buah merah berguguran sebelum sempat dipetik.',
    pembanding: [
      { cek: 'Lihat susunan titik hitam di tengah bercak. Antraknosa menyusunnya MELINGKAR sepusat — itu tubuh buah jamurnya. Busuk karena tusukan lalat buah tidak bertitik hitam bersusun dan berbelatung di dalamnya.',
        membantah: { id: 'op:pst:00000004', label: 'Lalat buah' } },
      { cek: 'Ingat kapan buahnya mulai berbercak. Antraknosa menempel sejak buah masih hijau dan baru terlihat saat memerah — buah yang mulus di kebun bisa berbercak di keranjang. Kalau bercak sudah ada sejak buah kecil dan tidak meluas, penyebabnya lain.' },
    ],
  },
  {
    id: 'op:pst:00000121', dari: 'op:pst:00001049', nama: 'Penyakit Bercak Daun',
    key: 'bercak-daun-cabai', label: 'Bercak daun cabai',
    inang: [CABAI],
    definition:
      'Bercak mata katak pada cabai — 73 baris penggunaan berlabel, dan sampai sekarang tidak punya pintu sama sekali di jalur ini. Menyerang daun, bukan buah, dan kerugiannya lewat daun yang rontok sehingga buah terbakar matahari dan tanaman berhenti berbunga. Paling parah pada musim hujan dan pada pertanaman rapat.',
    gejala:
      'Bercak bulat pada daun dengan tengah KEPUTIHAN atau kelabu tipis dan tepi coklat gelap yang tegas — bentuknya seperti mata, dan tengahnya sering berlubang saat mengering. Daun yang berbercak banyak menguning lalu RONTOK dari bawah ke atas, sampai batang tinggal telanjang sementara buahnya masih menggantung.',
    pembanding: [
      { cek: 'Lihat apakah buahnya ikut berbercak. Bercak daun cabai menyerang DAUN dan tangkai saja — buahnya mulus. Kalau buah ikut berbercak melingkar cekung, itu antraknosa.',
        membantah: { id: 'op:pst:00000120', label: 'Antraknosa cabai' } },
      { cek: 'Terawang bercak daunnya ke cahaya. Bercak daun cabai bertengah TIPIS sampai tembus cahaya dan sering berlubang; bercak karena tusukan trips atau terbakar pupuk tidak bundar dan tidak bertepi coklat tegas.',
        membantah: { id: 'op:pst:00000001', label: 'Trips' } },
    ],
  },
];

const PINTU_GUDANG = [
  {
    id: 'op:pst:00000122', dari: 'op:pst:00001082', nama: 'Hama Gudang',
    key: 'kumbang-tepung', label: 'Kumbang tepung',
    inang: [BERAS_SIMPAN, JAGUNG_SIMPAN, TERIGU_SIMPAN, BERAS, GANDUM],
    definition:
      'Hama gudang dengan pendaftaran terbanyak — 23 baris. Ia TIDAK bisa melubangi butir yang utuh dan keras: ia hidup dari butir pecah, dedak, dan tepung, jadi kehadirannya menandakan ada butir rusak lebih dulu — sering bekas hama lain atau bekas penggilingan. Registri juga memuat Tribolium sp. dan Tribolium confusum (5 baris) yang belum disatukan. Yang menentukan kebersihan gudang, kadar air gabah di bawah 14%, dan mengosongkan sisa tumpukan lama sebelum memasukkan yang baru.',
    gejala:
      'Kumbang pipih coklat kemerahan sepanjang 3–4 mm bergerak cepat di permukaan tumpukan dan di sela karung, dan berlarian saat karung dibuka. Beras berdebu, menggumpal, dan berbau apak tajam; butir yang pecah habis tinggal kulit. Tepung dan dedak di dasar tumpukan bergerak bila ditatap lama.',
    pembanding: [
      { cek: 'Ambil segenggam dan tuang perlahan di atas nampan terang. Kumbang tepung PIPIH dan berlari cepat di permukaan; kumbang bubuk beras bertubuh silinder dengan moncong panjang menonjol ke depan.',
        membantah: { id: 'op:pst:00000123', label: 'Bubuk beras' } },
      { cek: 'Periksa apakah butirnya berlubang. Kumbang tepung tidak bisa melubangi butir utuh — kalau ada butir berlubang bundar, ada hama LAIN yang membukanya lebih dulu, dan itu yang perlu ditangani.',
        membantah: { id: 'op:pst:00000123', label: 'Bubuk beras' } },
    ],
  },
  {
    id: 'op:pst:00000123', dari: 'op:pst:00001116', nama: 'Hama Gudang',
    key: 'bubuk-beras', label: 'Bubuk beras',
    inang: [BERAS_SIMPAN, JAGUNG_SIMPAN, TERIGU_SIMPAN, BERAS, GANDUM],
    definition:
      'Kumbang bubuk beras. Berbeda dari kumbang tepung, ia MELUBANGI butir utuh dan berkembang di dalamnya, jadi ia bisa memulai serangan pada beras yang masih bagus. Registri juga memuat Sitophilus spp. (9 baris) dan Sitophilus zeamais, bubuk jagung (8 baris), yang belum disatukan. Betinanya bertelur di dalam butir dan menutupnya, jadi butir yang tampak utuh bisa sudah berisi larva.',
    gejala:
      'Butir beras atau jagung berlubang BUNDAR rapi seukuran ujung jarum, dan bila digenggam terasa ringan serta berdebu. Kumbang kecoklatan sampai kehitaman sepanjang 3–4 mm dengan MONCONG panjang menonjol ke depan berjalan di antara butir. Tumpukan yang berat serangannya terasa hangat dan berbau apak.',
    pembanding: [
      { cek: 'Lihat kepala kumbangnya dari dekat. Bubuk beras punya MONCONG panjang seperti belalai yang menonjol ke depan — tidak ada hama gudang beras lain yang punya. Kumbang tepung berkepala rata tanpa moncong.',
        membantah: { id: 'op:pst:00000122', label: 'Kumbang tepung' } },
      { cek: 'Rendam segenggam beras di air. Butir yang MENGAPUNG berisi rongga karena sudah dimakan dari dalam; itu memperlihatkan serangan yang belum terlihat dari luar, dan angkanya menentukan apakah tumpukan masih layak disimpan lebih lama.' },
    ],
  },
  {
    id: 'op:pst:00000124', dari: 'op:pst:00001183', nama: 'Hama Gudang',
    key: 'bubuk-gabah', label: 'Bubuk gabah',
    inang: [BERAS_SIMPAN, JAGUNG_SIMPAN, TERIGU_SIMPAN, BERAS, GANDUM],
    definition:
      'Kumbang bubuk gabah. Seperti bubuk beras ia melubangi butir utuh, tetapi jauh lebih tahan panas dan kering — jadi ia yang paling sering bertahan di gudang yang sudah dikeringkan dengan baik. Larvanya menghasilkan bubuk halus yang menumpuk di dasar karung, dan bubuk itu sering tanda pertama sebelum kumbangnya terlihat.',
    gejala:
      'Butir berlubang tidak beraturan dengan tepi bergerigi, dan di dasar karung menumpuk BUBUK HALUS berwarna terang seperti tepung. Kumbangnya silinder memanjang coklat gelap sepanjang 2–3 mm, berkepala tertunduk sehingga tidak terlihat dari atas, dan pura-pura mati saat disentuh.',
    pembanding: [
      { cek: 'Angkat karung dan lihat apa yang tertinggal di bawahnya. Bubuk gabah meninggalkan BUBUK HALUS terang di dasar — tanda paling dini, sering sebelum satu kumbang pun terlihat.' },
      { cek: 'Sentuh kumbangnya. Bubuk gabah berpura-pura mati dan diam kaku; kumbang tepung justru berlari cepat, dan bubuk beras bermoncong panjang.',
        membantah: { id: 'op:pst:00000122', label: 'Kumbang tepung' } },
    ],
  },
];

const PINTU_SISA = [
  {
    id: 'op:pst:00000125', dari: 'op:pst:00001135', nama: 'Penyakit Busuk Daun',
    key: 'busuk-pangkal-batang-cabai', label: 'Busuk pangkal batang cabai',
    inang: [CABAI],
    definition:
      'Oomycete, bukan jamur sejati — metalaksil dan dimetomorf bekerja padanya, banyak fungisida untuk jamur sejati tidak. Terdaftar juga pada lada (6 baris) dan bawang merah (1), dan teks di bawah ditulis untuk cabai. Menyebar lewat air yang menggenang dan mengalir di permukaan tanah, jadi ia menyerang berlajur mengikuti bedengan yang tergenang — guludan tinggi dan drainase menurunkan lebih banyak daripada menambah semprotan.',
    gejala:
      'Tanaman layu mendadak dan tidak pulih, dan pada pangkal batang tepat di permukaan tanah ada bagian yang MELINGKARI batang berwarna coklat kehitaman dan basah, sering dengan batas tegas seperti diikat. Daun tetap menempel saat tanaman mati. Buah yang menyentuh tanah membusuk berair dan berselaput putih halus pada cuaca lembap.',
    pembanding: [
      { cek: 'Lihat di mana batangnya berubah warna. Busuk pangkal batang melingkari batang tepat di PERMUKAAN TANAH dengan batas tegas seperti diikat; layu fusarium tidak menghitamkan permukaan batang — yang coklat justru pembuluh di dalamnya saat dibelah.',
        membantah: { id: 'op:pst:00000008', label: 'Layu fusarium' } },
      { cek: 'Petakan tanaman yang mati di bedengan. Busuk pangkal batang menyerang BERLAJUR mengikuti alur air dan bagian yang tergenang; layu bakteri tersebar tanpa mengikuti aliran air.',
        membantah: { id: 'op:pst:00000009', label: 'Layu bakteri' } },
    ],
  },
  {
    id: 'op:pst:00000126', dari: 'op:pst:00001156', nama: 'Tungau Kuning',
    key: 'tungau-kuning', label: 'Tungau kuning',
    inang: [CABAI, TOMAT],
    definition:
      'Jauh lebih kecil daripada tungau merah dan TIDAK menganyam benang — dan justru itu yang membuatnya sering terlambat dikenali: gejalanya dikira virus, lalu tanaman dicabut padahal masih bisa diselamatkan. Menyerang hanya pucuk dan daun muda. Terdaftar juga pada kedelai dan teh (2 baris).',
    gejala:
      'Daun muda mengeriting ke BAWAH, tepinya menggulung ke bawah dan menyempit memanjang, permukaannya mengeras dan MENGKILAP seperti berminyak, sering keperakan atau keunguan di bawahnya. Pucuk berhenti memanjang dan menjadi kaku; bunga rontok. Daun tua di bawahnya tetap normal.',
    pembanding: [
      { cek: 'Lihat ARAH keritingnya dan permukaannya. Tungau kuning menggulungkan daun ke BAWAH dan membuatnya mengkilap seperti berminyak; trips menggulungkan daun ke ATAS seperti mangkuk dan meninggalkan goresan keperakan kusam, bukan mengkilap.',
        membantah: { id: 'op:pst:00000001', label: 'Trips' } },
      { cek: 'Bandingkan daun muda dengan daun tua pada satu tanaman. Tungau kuning hanya merusak PUCUK — daun tua di bawahnya tetap normal dan hijau. Virus kuning keriting menguningkan seluruh tanaman termasuk daun yang sudah jadi, dan tanamannya kerdil menyeluruh.',
        membantah: { id: 'op:pst:00000010', label: 'Virus kuning keriting' } },
    ],
  },
  {
    id: 'op:pst:00000127', dari: 'op:pst:00001188', nama: 'Penyakit Busuk Batang',
    key: 'busuk-batang-padi', label: 'Busuk batang padi',
    inang: [PADI],
    definition:
      'Bertahan sebagai butiran keras di jerami dan tunggul, lalu mengapung ke permukaan air saat lahan digenangi dan menempel pada pangkal batang — jadi membenamkan jerami dan mengeringkan lahan di antara musim memutus daurnya. Diperparah pemupukan nitrogen berlebih dan kalium yang kurang.',
    gejala:
      'Bercak kehitaman pada pelepah tepat di batas permukaan air, lalu batang di dalamnya membusuk dan menjadi kopong sehingga rumpun REBAH menjelang panen sementara malainya sudah terbentuk. Batang yang dibelah berongga dengan butiran hitam kecil sekeras pasir di dalamnya.',
    pembanding: [
      { cek: 'Belah pangkal batang rumpun yang rebah, membujur. Busuk batang meninggalkan rongga dengan BUTIRAN HITAM kecil sekeras pasir di dalamnya; penggerek batang meninggalkan lorong berisi kotoran halus beserta ulatnya.',
        membantah: { id: 'op:pst:00000030', label: 'Penggerek batang' } },
      { cek: 'Lihat di ketinggian mana bercaknya. Busuk batang mulai tepat di BATAS PERMUKAAN AIR dan turun ke dalam batang; hawar pelepah juga mulai dekat air tetapi bercaknya lonjong bertepi bergelombang di permukaan pelepah dan merambat NAIK, bukan menghitamkan batang dari dalam.',
        membantah: { id: 'op:pst:00000031', label: 'Hawar pelepah' } },
    ],
  },
  {
    id: 'op:pst:00000128', dari: 'op:pst:00001173', nama: 'Siput Trisipan',
    key: 'siput-trisipan', label: 'Siput trisipan',
    inang: [TAMBAK],
    definition:
      'Bukan hama tanaman: ia bersaing dengan udang dan bandeng memakan KLEKAP — lapisan lumut dasar tambak yang jadi pakan alami — sehingga pertumbuhan udang melambat tanpa ada tanda penyakit apa pun. Yang menentukan pengeringan dasar tambak sampai retak dan pembalikan lumpur antar-siklus; pemberantasan dengan racun di tambak berisi menuntut kehati-hatian karena sasaran dan yang dibudidayakan sama-sama hewan air.',
    gejala:
      'Cangkang kerucut memanjang seperti sekrup, coklat kehitaman, sepanjang dua sampai empat sentimeter, menempel rapat di dasar dan pematang tambak serta terlihat saat air disurutkan. Klekap di dasar menipis atau habis berpetak-petak; udang dan bandeng tumbuh lambat walau pakan tetap diberi dan air terlihat baik.',
    pembanding: [
      { cek: 'Surutkan air pada satu petak sudut dan periksa dasarnya. Siput trisipan bercangkang KERUCUT MEMANJANG seperti sekrup — bukan bulat seperti keong sawah — dan menempel rapat di dasar, tidak mengapung.' },
      { cek: 'Bandingkan tebal klekap di bagian yang bersiput dengan bagian yang bersih. Kalau klekapnya menipis tepat di bagian yang bersiput sementara mutu air sama, pertumbuhan yang lambat itu soal PAKAN ALAMI yang habis, bukan soal penyakit.' },
    ],
  },
];

const PINTU_SISA2 = [
  {
    id: 'op:pst:00000129', dari: 'op:pst:00001217', nama: 'Kutu Daun',
    key: 'kutu-daun-kapas', label: 'Kutu daun kapas',
    inang: [CABAI, TOMAT, KENTANG, SEMANGKA, MELON, MENTIMUN, JERUK, KUBIS, BAWANG_MERAH, APEL, KACANG_PANJANG],
    definition:
      'Kutu daun paling polifag di antara semuanya, dan yang paling sering tercatat registri sekadar sebagai "Aphis sp." — 35 baris lagi tanpa nama spesies, yang kini ikut terhitung di bawah pintu ini pada komoditas yang sama. Warnanya berubah-ubah dari kuning pucat sampai hijau tua sampai hampir hitam menurut cuaca dan tanaman inangnya, jadi WARNA bukan cara mengenalinya. Penular banyak virus; mengendalikannya melindungi tanaman yang belum tertular, bukan menyembuhkan yang sudah.',
    gejala:
      'Kutu bertubuh lunak seperti buah pir kecil berkelompok di permukaan BAWAH daun muda dan pucuk, warnanya bisa apa saja dari kuning sampai kehitaman dalam satu petak yang sama. Daun muda mengeriting ke bawah dan mengerut; permukaan di bawahnya lengket lalu ditumbuhi jelaga hitam, dan semut naik-turun di batang.',
    pembanding: [
      { cek: 'Balik daun muda dan lihat bentuk tubuhnya, bukan warnanya. Kutu daun berbentuk seperti buah pir kecil dengan sepasang tonjolan seperti knalpot di ujung belakang tubuh; kutu kebul bersayap putih dan beterbangan saat tanaman disentuh.',
        membantah: { id: 'op:pst:00000003', label: 'Kutu kebul' } },
      { cek: 'Raba permukaan daun di bawah koloninya. Lengket berarti embun madu, dan jelaga hitam yang tumbuh di atasnya bisa diusap hilang — yang perlu ditangani kutunya. Trips dan tungau tidak menghasilkan embun madu sama sekali.',
        membantah: { id: 'op:pst:00000001', label: 'Trips' } },
    ],
  },
  {
    id: 'op:pst:00000130', dari: 'op:pst:00001223', nama: 'Nematoda Puru Akar',
    key: 'nematoda-puru-akar', label: 'Nematoda puru akar',
    inang: [TOMAT, CABAI, KENTANG, SEMANGKA, MELON, MENTIMUN, KUBIS, TEBU, KRISAN, PISANG, TEH_BIBIT, WORTEL],
    definition:
      'Identitasnya di GBIF hanya tertambat sampai GENUS, dan itu memang batas yang jujur: membedakan jenisnya menuntut laboratorium, sementara penanganannya sama. Hidup di dalam tanah dan bertahan bertahun-tahun, jadi yang menentukan rotasi dengan tanaman bukan inang, bahan organik, dan bibit dari persemaian yang tanahnya bersih — bukan menyemprot daun, yang tidak menjangkau apa pun.',
    gejala:
      'Tanaman kerdil dan layu pada siang hari lalu pulih sore, berulang, sementara pupuk dan air cukup; gejalanya BERKELOMPOK di bagian petak tertentu, bukan merata. Dicabut, akarnya menggembung jadi BINTIL bulat tidak beraturan yang menyatu dengan akar itu sendiri — tidak bisa dilepas dengan kuku.',
    pembanding: [
      { cek: 'Cabut tanaman kerdil beserta akarnya lalu cuci tanahnya. Puru akar adalah pembengkakan yang MENYATU dengan akar dan tidak bisa dicungkil lepas; bintil rhizobium pada kacang-kacangan menempel di sisi akar dan lepas ditekan kuku, dan itu justru menguntungkan.' },
      { cek: 'Bandingkan tanaman kerdil dengan tetangganya yang sehat, dan lihat sebarannya. Nematoda puru akar berkelompok di petak yang sama tiap musim; kekurangan hara membuat seluruh petak kerdil merata.' },
    ],
  },
  {
    id: 'op:pst:00000131', dari: 'op:pst:00001141', nama: 'Ulat Api',
    key: 'ulat-api-setora', label: 'Ulat api Setora',
    inang: [SAWIT, KELAPA],
    definition:
      'Jenis ulat api kedua yang punya pendaftarannya sendiri di registri — 18 baris — dan ditangani persis sama dengan Setothosea asigna: sensus pelepah lebih dulu, dan bulunya menyengat sehingga diperiksa dengan ranting bukan tangan. Yang membedakan keduanya cuma rupa ulatnya, dan itu disebut di bawah supaya sensusnya tidak salah hitung, bukan supaya pengendaliannya berbeda.',
    gejala:
      'Anak daun tergerus dari permukaan bawah sampai tinggal selaput lalu berlubang, sama seperti ulat api yang lain. Ulatnya HIJAU dengan garis biru kehitaman memanjang di tengah punggung dan garis kuning di sisinya, bertubuh lonjong pipih dengan duri di sepanjang tepi — berbeda dari Setothosea yang berpola coklat bercabang di punggung.',
    pembanding: [
      { cek: 'Lihat punggung ulatnya, JANGAN dipegang. Setora bergaris biru kehitaman memanjang di tengah punggung dengan latar hijau; Setothosea berpola coklat bercabang. Keduanya ulat api dan ditangani sama — yang berubah cuma angka pada lembar sensus.',
        membantah: { id: 'op:pst:00000074', label: 'Ulat api' } },
      { cek: 'Hitung ulat hidup per pelepah contoh sebelum memutuskan, dan jumlahkan KEDUA jenis. Ambang pengendalian ulat api dihitung dari jumlah seluruh ulat api, bukan per jenis.',
        membantah: { id: 'op:pst:00000074', label: 'Ulat api' } },
    ],
  },
  {
    id: 'op:pst:00000132', dari: 'op:pst:00001162', nama: 'Hama Gudang',
    key: 'bubuk-jagung', label: 'Bubuk jagung',
    inang: [BERAS_SIMPAN, JAGUNG_SIMPAN, TERIGU_SIMPAN, BERAS, GANDUM],
    definition:
      'Kembar dekat bubuk beras dan ditangani sama; membedakan keduanya menuntut kaca pembesar dan tidak mengubah tindakan. Yang membedakannya dari sisi kerugian: ia lebih menyukai jagung dan biji yang lebih besar, dan lebih kuat terbang sehingga menyebar antar-gudang lewat udara, bukan cuma lewat karung yang dipindahkan.',
    gejala:
      'Butir jagung atau beras berlubang bundar rapi dan terasa ringan, dengan bubuk halus di dasar tumpukan. Kumbang bermoncong panjang sepanjang 3–4 mm berjalan di antara butir; pada tumpukan jagung ia sering terlihat TERBANG pendek saat karung dibuka, dan itu yang paling membedakannya dari bubuk beras.',
    pembanding: [
      { cek: 'Buka karung dan perhatikan apakah ada yang TERBANG. Bubuk jagung terbang pendek; bubuk beras jarang terbang dan lebih sering merayap. Keduanya bermoncong panjang, dan keduanya ditangani sama.',
        membantah: { id: 'op:pst:00000123', label: 'Bubuk beras' } },
      { cek: 'Rendam segenggam di air dan hitung butir yang MENGAPUNG. Butir berongga karena dimakan dari dalam akan mengapung — pemeriksaan yang sama berlaku untuk kedua kumbang bermoncong, dan angkanya yang menentukan apakah tumpukan masih layak disimpan.' },
    ],
  },
];

const PINTU_PADI_EKOR = [
  {
    id: 'op:pst:00000133', dari: 'op:pst:00001447', nama: 'Penyakit Gosong Palsu',
    key: 'gosong-palsu', label: 'Gosong palsu',
    inang: [PADI],
    definition:
      'Menyerang tepat saat bunga terbuka, dan hanya saat itu — jadi jendela tindakannya sekitar seminggu menjelang malai keluar, bukan sesudah gumpalannya terlihat. Diperparah hujan pada masa berbunga dan pemupukan nitrogen berlebih. Bertahan pada gabah dan sisa tanaman, jadi benih dari petak yang terserang meneruskannya.',
    gejala:
      'Beberapa bulir pada malai berubah jadi GUMPALAN BULAT jauh lebih besar daripada gabah normal, mula-mula jingga kekuningan lalu hijau zaitun kehitaman dan berdebu bila disentuh. Malainya sendiri tetap hijau dan bulir lain di sebelahnya normal — biasanya hanya beberapa bulir per malai.',
    pembanding: [
      { cek: 'Hitung berapa bulir per malai yang jadi gumpalan. Gosong palsu hanya mengenai beberapa bulir dan menyisakan sisanya normal; malai yang hampa SELURUHNYA penyebabnya beluk karena penggerek atau blas leher.',
        membantah: { id: 'op:pst:00000032', label: 'Blas' } },
      { cek: 'Pecahkan satu gumpalan. Isinya serbuk hijau zaitun sampai kehitaman yang menempel di jari — bukan bulir kosong, bukan ulat. Gumpalan itu jamurnya sendiri yang menggantikan bulir.' },
    ],
  },
  {
    id: 'op:pst:00000134', dari: 'op:pst:00001293', nama: 'Penyakit Bercak Daun Coklat',
    key: 'bercak-coklat-padi', label: 'Bercak coklat padi',
    inang: [PADI],
    definition:
      'Lebih sering pertanda TANAH daripada pertanda jamur: menumpuk pada lahan yang kekurangan kalium, tanah masam, dan sawah tadah hujan yang miskin hara. Menyemprot tanpa membenahi pemupukan hanya menunda. Terbawa benih juga, sehingga perlakuan benih menahan serangan awal di persemaian.',
    gejala:
      'Bercak BULAT LONJONG seperti biji wijen pada daun — coklat dengan tengah keabuan dan tepi kecoklatan, tersebar merata di seluruh helai. Pada gabah muncul bercak coklat kehitaman yang membuat beras berbintik saat digiling. Bibit di persemaian bisa mati kalau bercaknya rapat.',
    pembanding: [
      { cek: 'Lihat bentuk bercaknya. Bercak coklat padi BULAT LONJONG seperti biji wijen dan tersebar merata; blas melebar di tengah membentuk belah ketupat dengan kedua ujung lancip, dan bercak coklat sempit lurus memanjang selebar satu milimeter.',
        membantah: { id: 'op:pst:00000032', label: 'Blas' } },
      { cek: 'Periksa riwayat pemupukan dan jenis lahannya sebelum memutuskan menyemprot. Bercak coklat menumpuk pada lahan yang kurang kalium dan tanah masam; kalau seluruh hamparan bergejala merata dan pemupukannya memang tipis, yang perlu dibenahi haranya.' },
    ],
  },
  {
    id: 'op:pst:00000135', dari: 'op:pst:00001361', nama: 'Hama Ganjur',
    key: 'ganjur', label: 'Ganjur',
    inang: [PADI],
    definition:
      'Hanya menyerang anakan yang belum berbunga, dan kerusakannya tidak bisa diperbaiki: anakan yang jadi puru tidak akan pernah bermalai. Menumpuk pada musim hujan dan pada pertanaman yang tidak serempak, karena ia berpindah dari petak yang lebih tua. Semprotan sesudah puru terlihat sudah terlambat — larvanya di dalam.',
    gejala:
      'Dari tengah anakan keluar tabung putih keperakan panjang seperti DAUN BAWANG, tegak dan menggulung rapat, sepanjang beberapa sentimeter sampai sejengkal. Anakan yang membentuknya berhenti tumbuh dan tidak bermalai, tetapi rumpun mengeluarkan anakan baru sehingga terlihat rimbun namun hampa.',
    pembanding: [
      { cek: 'Perhatikan bentuk yang keluar dari tengah anakan. Ganjur membentuk TABUNG keperakan mirip daun bawang — tidak ada OPT padi lain yang membentuknya, dan sekali terlihat tidak perlu diperiksa lagi.' },
      { cek: 'Lihat apakah anakannya mati atau cuma berhenti. Ganjur menyisakan anakan HIDUP yang tidak bermalai; sundep karena penggerek batang mematikan pucuknya dan pucuk itu mudah ditarik lepas.',
        membantah: { id: 'op:pst:00000030', label: 'Penggerek batang' } },
    ],
  },
  {
    id: 'op:pst:00000136', dari: 'op:pst:00001336', nama: 'Hama Putih',
    key: 'hama-putih', label: 'Hama putih',
    inang: [PADI],
    definition:
      'Berbeda dari hama putih PALSU yang menggulung daun di tempatnya: yang ini MEMOTONG ujung daun jadi tabung lalu menjatuhkannya ke air dan hidup di dalamnya. Karena larvanya hidup di air, menyurutkan air beberapa hari menghentikannya tanpa semprotan apa pun — dan itu tindakan yang lebih murah daripada menyemprot petak tergenang.',
    gejala:
      'Daun terpotong rapi di ujung, dan potongan itu menggulung jadi TABUNG yang mengapung atau menempel di pangkal rumpun. Daun yang tersisa tergerus memutih menerawang dari ujung. Petak yang berat serangannya terlihat memutih dan air di sekitarnya penuh tabung kecil.',
    pembanding: [
      { cek: 'Lihat permukaan air di sela rumpun. Hama putih meninggalkan TABUNG daun yang mengapung atau menempel di pangkal, dan di dalamnya ada larva. Hama putih palsu tidak memotong daun — gulungannya tetap menempel di tanamannya.',
        membantah: { id: 'op:pst:00000034', label: 'Hama putih palsu' } },
      { cek: 'Coba surutkan air pada sebagian petak. Serangan hama putih berhenti begitu air surut karena larvanya hidup di air; kerusakan yang berlanjut walau air surut penyebabnya bukan ini.' },
    ],
  },
  {
    id: 'op:pst:00000137', dari: 'op:pst:00001396', nama: 'Lalat Daun',
    key: 'lalat-daun-padi', label: 'Lalat daun padi',
    inang: [PADI],
    definition:
      'Menyerang pada bulan pertama sesudah tanam, terutama pada petak yang airnya dalam dan tanamannya lambat tumbuh. Tanaman yang haranya cukup umumnya pulih sendiri dan tetap bermalai penuh — jadi keputusannya lebih sering "perbaiki pengairan dan pemupukan" daripada "semprot".',
    gejala:
      'Daun muda yang baru membuka bertepi TERGERUS tidak beraturan dan berlubang memanjang sejajar tulang daun, seperti bekas dikerok dari dalam gulungan. Daun terlihat kuning pucat dan terpuntir; anakan berkurang dan tanaman lambat tumbuh, tetapi rumpunnya tidak mati.',
    pembanding: [
      { cek: 'Buka daun termuda yang masih menggulung. Lalat daun meninggalkan belatung putih kecil dan bekas kerokan DI DALAM gulungan, sehingga kerusakannya muncul saat daun membuka. Kalau gulungannya bersih, penyebabnya bukan ini.' },
      { cek: 'Periksa dalamnya air dan warna tanaman sebelum memutuskan. Lalat daun menumpuk di petak yang airnya dalam dan tanamannya lambat; menurunkan tinggi air dan memupuk sering cukup, dan tanamannya pulih sendiri.' },
    ],
  },
];

const PINTU_EKOR = [
  {
    id: 'op:pst:00000138', dari: 'op:pst:00001322', nama: 'Penyakit Embun Tepung',
    key: 'embun-tepung-cabai', label: 'Embun tepung cabai',
    inang: [CABAI, KENTANG, TOMAT],
    definition:
      'Berbeda dari embun tepung yang lain: jamurnya hidup DI DALAM daun dan hanya menyembulkan spora lewat mulut daun di permukaan bawah, sehingga tepung putihnya muncul di bawah sementara yang terlihat dari atas cuma bercak kuning. Itu sebabnya ia sering dikira penyakit lain atau kekurangan hara. Menyukai cuaca kering berangin dan suhu hangat.',
    gejala:
      'Bercak kuning bersudut di permukaan ATAS daun tua, dibatasi tulang daun, dan tepat di baliknya lapisan PUTIH keabuan seperti tepung di permukaan BAWAH. Daun yang terkena menggulung ke atas lalu rontok, dan tanaman menggundul dari bawah sehingga buah terbakar matahari.',
    pembanding: [
      { cek: 'Balik daun yang bercak kuningnya terlihat dari atas. Embun tepung cabai menaburkan tepung putih di permukaan BAWAH saja; embun tepung pada tanaman lain justru memutih di permukaan atas.' },
      { cek: 'Usap tepung putihnya. Ia terangkat seperti bedak dan daun di bawahnya masih hijau kekuningan; embun bulu meninggalkan selaput yang tidak bisa diusap begitu dan bercaknya sudah mati kecoklatan.' },
    ],
  },
  {
    id: 'op:pst:00000139', dari: 'op:pst:00001553', nama: 'Semut',
    key: 'semut-api', label: 'Semut api',
    inang: [JAGUNG, KOPI, KAKAO],
    definition:
      'Jarang jadi masalah karena memakan tanaman — ia jadi masalah karena MEMELIHARA kutu putih dan kutu tempurung, mengangkutnya dari pohon ke pohon, dan mengusir musuh alami kutu itu. Karena itu ia sering pintu masuk yang lebih murah: memutus jalur semut di batang menurunkan kutu tanpa menyemprot tajuk sama sekali. Pada jagung ia juga memakan benih yang baru ditugal.',
    gejala:
      'Barisan semut merah kecoklatan naik-turun di batang sepanjang hari, paling ramai menuju bagian yang bergerombol kutu. Di tanah ada gundukan sarang lepas di dekat pangkal batang. Pada jagung, benih hilang atau berlubang beberapa hari sesudah ditugal, dan tanaman tidak tumbuh berpetak-petak.',
    pembanding: [
      { cek: 'Ikuti barisan semutnya ke atas dan lihat ke mana ia menuju. Kalau ujungnya gerombolan kutu, yang sedang dilihat SEBAB dan AKIBAT sekaligus — memutus jalur semut di batang menurunkan keduanya.',
        membantah: { id: 'op:pst:00000070', label: 'Kutu putih' } },
      { cek: 'Pada jagung, korek tanah di titik yang benihnya tidak tumbuh. Benih berlubang dengan semut di sekitarnya berarti semut; benih utuh yang membusuk berarti masalah benih atau kelembapan, dan menyemprot semut tidak menolong apa pun.' },
    ],
  },
  {
    id: 'op:pst:00000140', dari: 'op:pst:00001208', nama: 'Belalang',
    key: 'belalang-kembara', label: 'Belalang kembara',
    inang: [JAGUNG, PADI],
    definition:
      'Identitasnya di GBIF tidak tertambat sama sekali — registri menulisnya bertingkat genus — jadi yang dijanjikan pintu ini cirinya, bukan nama spesiesnya. Berbeda dari belalang biasa yang tinggal di petaknya: jenis ini BERGEROMBOL dan berpindah, sehingga petak yang bersih pagi ini bisa habis sore nanti. Karena itu yang menentukan pengamatan bersama satu hamparan dan tindakan serentak, bukan penyemprotan per petak.',
    gejala:
      'Daun habis dimakan dari tepi dalam waktu singkat dan merata di seluruh petak, bukan cuma di pinggir; pada serangan berat tinggal tulang daun dan batang. Belalang terlihat BERGEROMBOL dalam jumlah besar, hinggap rapat di tanaman dan pematang, dan berpindah bersama-sama saat terganggu.',
    pembanding: [
      { cek: 'Perhatikan jumlah dan cara perginya. Belalang kembara bergerombol dan berpindah bersama-sama; belalang biasa melompat satu-satu di depan kaki dan tetap di petak yang sama.',
        membantah: { id: 'op:pst:00000045', label: 'Belalang' } },
      { cek: 'Lihat dari mana kerusakan mulai. Belalang kembara menghabiskan daun merata dan cepat di seluruh petak; belalang biasa merusak paling banyak di pinggir yang berbatasan rumput lalu berkurang ke tengah.',
        membantah: { id: 'op:pst:00000045', label: 'Belalang' } },
    ],
  },
];

// Sasaran registri berspesies LAIN yang sebuah pintu jawab, ditulis satu per satu.
//
// KENAPA INI TIDAK BOLEH DIHITUNG MESIN
// Pencakupan "Genus sp." di bangun-indeks.mjs aman karena LABELNYA SENDIRI menolak
// menyebut spesies: produk yang terdaftar untuk "Thrips sp. pada cabai" memang menjawab
// trips apa pun di cabai. Yang di bawah ini berbeda — labelnya MENYEBUT spesies, dan
// mengarahkannya ke pintu spesies lain adalah pernyataan, bukan pembacaan.
//
// Percobaan yang menunjukkan kenapa aturan otomatis salah: "spesies semarga dengan pintu
// yang ada, dipilah menurut inang" menjangkau 94 baris — dan baris terbesarnya
// Xanthomonas campestris, yang pada padi berarti hawar daun bakteri dan pada kubis
// berarti busuk hitam, dua penyakit yang tidak punya kemiripan apa pun. Saringan inang
// kebetulan memisahkan keduanya dengan benar; kebetulan bukan dasar.
//
// Jadi setiap baris di bawah menyebut CIRINYA, bukan kekerabatannya, dan alat ini menolak
// `dasar` yang lebih pendek dari 60 aksara supaya tidak ada yang lolos dengan "semarga".
const CAKUP = [
  {
    pintu: 'op:pst:00000092',
    cakup: [
      { id: 'op:pst:00002316', nama: 'Penyakit Embun Tepung',
        dasar: 'Erysiphe cichoracearum embun tepung cucurbit yang satunya lagi, dan keduanya kerap ada pada daun yang sama; memisahkannya menuntut melihat bentuk konidiumnya di bawah mikroskop, sementara tepung putih di permukaan atas daun tua dan cara mengusapnya sama persis.' },
    ],
  },
  {
    pintu: 'op:pst:00000138',
    cakup: [
      { id: 'op:pst:00002278', nama: 'Penyakit Embun Tepung',
        dasar: 'Oidium lycopersici bentuk tak berkelamin embun tepung tomat, dan pada tomat gejalanya sama dengan yang dijanjikan pintu ini: bercak kuning di permukaan atas daun tua dengan tepung putih tepat di baliknya.' },
    ],
  },
  {
    pintu: 'op:pst:00000022',
    cakup: [
      { id: 'op:pst:00002324', nama: 'Pengorok Daun',
        dasar: 'Liriomyza chrysanthemi pengorok daun krisan yang meninggalkan lorong berkelok putih keperakan di dalam lapisan daun, sama bentuknya dengan L. huidobrensis pada tanaman yang sama; keduanya dipilah dari ngengat dewasanya, bukan dari lorongnya.' },
    ],
  },
  {
    pintu: 'op:pst:00000158',
    cakup: [
      { id: 'op:pst:00002129', nama: 'Penyakit Karat',
        dasar: 'Uromyces phaseoli karat kacang-kacangan yang memberi bintil menonjol coklat kemerahan di permukaan bawah daun dan meninggalkan bubuk warna karat bila diusap, sama dengan U. vignae; pada kacang hijau keduanya dicatat bergantian di pustaka untuk karat yang sama.' },
    ],
  },
  {
    pintu: 'op:pst:00000171',
    cakup: [
      { id: 'op:pst:00001857', nama: 'Kutu Sisik',
        dasar: 'Lepidosaphes ulmi kutu sisik koma pada apel — sisik memanjang melengkung yang sama bentuknya, menempel rapat di kulit ranting yang sama, dan sama-sama hanya bisa disemprot saat anakannya merayap sebelum perisainya terbentuk.' },
    ],
  },
  {
    pintu: 'op:pst:00000177',
    cakup: [
      { id: 'op:pst:00001198', nama: 'Penyakit Busuk Hitam',
        dasar: 'Registri menulis "Xanthomonas campestris" telanjang tanpa patovar dan memakainya untuk dua penyakit sekaligus. Pada KUBIS yang dimaksud pv. campestris — busuk hitam, dengan bercak V dari tepi daun dan tulang daun yang menghitam — dan label Indonesianya sendiri berbunyi "Penyakit Busuk Hitam". Barisnya pada padi dicakup pintu hawar daun bakteri; saringan inang yang memisahkan keduanya.' },
    ],
  },
  {
    pintu: 'op:pst:00000178',
    cakup: [
      { id: 'op:pst:00001063', nama: 'Hama Trips',
        dasar: 'Pada jeruk dan apel tidak ada pintu bermarga Thrips, sehingga sasaran "Thrips sp." di sana tidak terjangkau pencakupan marga. Yang dimaksud label kerusakan trips pada kulit buah — kerak keperakan melingkar di sekitar bekas kelopak — dan itu persis yang dijanjikan pintu ini, apa pun marga tripsnya. Pada tanaman lain sasaran yang sama tetap dilayani pintu trips bermarga Thrips lewat pencakupan marga.' },
      { id: 'op:pst:00001883', nama: 'Hama Trips',
        dasar: 'Scirtothrips dorsalis salah satu jenis trips yang mendasari pintu ini — pintunya berdiri bertingkat MARGA — dan pada cengkeh ia memberi kerak keperakan pada bagian yang masih muda dengan jendela penyemprotan yang sama.' },
    ],
  },
  {
    pintu: 'op:pst:00000180',
    cakup: [
      { id: 'op:pst:00001470', nama: 'Jamur Biru',
        dasar: 'Diplodia sp. sasaran bertingkat marga yang sama dengan yang jadi dasar pintu ini, dan pada jeruk ia memberi kulit batang yang mengering mengelupas dengan titik hitam kecil di tepinya; memisahkan spesies Diplodia menuntut mengukur konidium di bawah mikroskop.' },
      { id: 'op:pst:00002258', nama: 'Penyakit Jamur Merah',
        dasar: 'Nectria cinnabarina menumpang pada cabang jeruk yang SUDAH mati atau terluka, sama seperti Botryodiplodia, dan tindakannya sama: potong cabang di bawah batas kematian dan tutup lukanya. Bintil merah bata yang membedakannya baru muncul sesudah cabangnya mati, jadi tidak mengubah keputusan.' },
    ],
  },
  {
    pintu: 'op:pst:00000120',
    cakup: [
      { id: 'op:pst:00001674', nama: 'Penyakit Antraknosa',
        dasar: 'Gloeosporium piperatum nama bentuk tak berkelamin yang dipakai pustaka lama untuk antraknosa cabai — "piperatum" merujuk Capsicum — dan bercak melingkar cekung bertitik hitam pada buah yang dijanjikan pintu ini memang gejala yang dimaksud.' },
      { id: 'op:pst:00001875', nama: 'Penyakit Antarknosa',
        dasar: 'Salah eja "Gleosporium gleosporioides" untuk Gloeosporium gloeosporioides, bentuk tak berkelamin Colletotrichum gloeosporioides; barisnya pada cabai, dan antraknosa cabai tidak terbedakan dari yang lain di kebun.' },
      { id: 'op:pst:00002186', nama: 'Gloeosporium gloeosporioides',
        dasar: 'Gloeosporium gloeosporioides bentuk tak berkelamin Colletotrichum gloeosporioides, salah satu penyebab antraknosa cabai yang dicatat registri sendiri; bercaknya sama dan tidak ada cara memisahkannya dari C. capsici tanpa membiakkan jamurnya.' },
    ],
  },
  {
    pintu: 'op:pst:00000107',
    cakup: [
      { id: 'op:pst:00001120', nama: 'Penyakit Bercak Daun',
        dasar: 'Cercospora sasaran bertingkat marga bercak daun, dan pada apel tidak ada pintu bermarga Cercospora sehingga ia tidak terjangkau pencakupan marga. Bercaknya coklat bertepi tegas pada daun tua yang menggugurkan daun dari bawah — sama bentuk, sama waktunya, dan sama jadwal semprotnya dengan bercak daun apel.' },
    ],
  },
  {
    pintu: 'op:pst:00000192',
    cakup: [
      { id: 'op:pst:00002191', nama: 'Nematoda Parasit',
        dasar: 'Criconemoides nematoda cincin yang mengisap akar bibit teh dari luar, dan di bedengan gejalanya tidak terbedakan dari Pratylenchus: bibit kerdil berpetak dengan akar pendek berujung menghitam. Memisahkannya menuntut menyaring tanah dan mengenali nematodanya di bawah mikroskop.' },
    ],
  },
  {
    pintu: 'op:pst:00000141',
    cakup: [
      { id: 'op:pst:00002237', nama: 'Penyakit Rebah Semai',
        dasar: 'Pythium debaryanum salah satu jenis Pythium penyebab rebah kecambah yang sama, dan pada bedengan semai kubis ia memberi pangkal batang menyempit berair pada bibit yang daunnya masih hijau — persis yang dijanjikan pintu ini, termasuk bahan aktifnya yang harus mengenai oomycete.' },
      { id: 'op:pst:00001845', nama: 'Penyakit Rebah Kecambah',
        dasar: 'Phytophthora parasitica sama-sama OOMYCETE dan memberi rebah kecambah yang sama di persemaian tembakau: pangkal batang menyempit berair sementara daun bibit masih hijau. Yang menentukan bagi pembacanya golongan itu, bukan marganya — metalaksil dan dimetomorf bekerja pada keduanya, fungisida jamur sejati pada tidak satu pun.' },
    ],
  },
  {
    pintu: 'op:pst:00000051',
    cakup: [
      { id: 'op:pst:00001605', nama: 'Siput',
        dasar: 'Filicaulis bleekeri siput telanjang tanpa cangkang, tetapi kedua ciri yang dipakai pintu ini tidak menyentuh cangkang sama sekali: jejak lendir mengkilap yang mengering seperti perak, dan tepi lubang yang tergerus halus. Umpan dan pemungutan malamnya pun sama.' },
      { id: 'op:pst:00002350', nama: 'Siput Darat',
        dasar: 'Bradybaena similaris siput darat bercangkang kecil yang merusak kubis dengan cara yang sama seperti bekicot — menggerus tepi daun halus dan meninggalkan jejak lendir mengkilap — dan sama-sama dipungut malam hari atau diumpan.' },
      { id: 'op:pst:00001993', nama: 'Siput',
        dasar: 'Parmarion pupillaris siput setengah telanjang dengan cangkang tersisa kecil di punggung, dan di kebun kubis bunga ia meninggalkan jejak lendir serta tepi daun tergerus halus yang sama; tindakannya sama-sama umpan dan pemungutan malam.' },
    ],
  },
  {
    pintu: 'op:pst:00000070',
    cakup: [
      { id: 'op:pst:00001989', nama: 'Kutu Daun Kutuputih',
        dasar: 'Dysmicoccus kutu putih berlapis lilin seperti kapas yang bergerombol di pangkal daun nenas dan di akar, sama bentuknya dengan Planococcus dan sama-sama dipelihara semut; keduanya dipilah dari jumlah dan susunan juntai lilin di tepi badan, yang menuntut kaca pembesar.' },
      { id: 'op:pst:00001859', nama: 'Kutu Putih',
        dasar: 'Pseudococcus lilacinus kutu putih berlapis lilin yang bergerombol di dompolan buah rambutan dan ketiak cabang, sama bentuk dan sama akibatnya — embun madu yang lalu ditumbuhi jelaga — dengan Planococcus citri.' },
      { id: 'op:pst:00001860', nama: 'Kutu Putih',
        dasar: 'Ferrisia virgata kutu putih bergaris yang bergerombol di pucuk dan buah jambu biji; juntai lilin panjangnya lebih menonjol, tetapi gerombolan berlilin putih, embun madu, dan semut yang memeliharanya sama persis.' },
      { id: 'op:pst:00002032', nama: 'Kutu Putih',
        dasar: 'Planococcus spp. bentuk jamak dari marga yang sama dengan yang jadi dasar pintu ini, dan pada bibit cengkeh ia bergerombol di pucuk dengan lapisan lilin putih yang sama.' },
    ],
  },
  {
    pintu: 'op:pst:00000128',
    cakup: [
      { id: 'op:pst:00001932', nama: 'Siput Trisipan',
        dasar: 'Cerithidea angulata salah satu jenis trisipan yang mendasari pintu ini — pintunya memang berdiri bertingkat MARGA — dan di tambak ia bertumpuk di dasar dan di pematang dengan cangkang kerucut memanjang yang sama.' },
    ],
  },
  {
    pintu: 'op:pst:00000166',
    cakup: [
      { id: 'op:pst:00002304', nama: 'Jambret',
        dasar: 'Mesopodopsis slaberri salah satu jenis jembret yang mendasari pintu ini, dan di tambak ia bening kelabu bergerombol di permukaan air pada pagi dan senja persis seperti yang dijanjikan pintu ini; penyaringan air masuknya pun sama.' },
    ],
  },
  {
    pintu: 'op:pst:00000201',
    cakup: [
      { id: 'op:pst:00002053', nama: 'Penyakit Rebah Kecambah',
        dasar: 'Fusarium spp. sama-sama JAMUR SEJATI dan memberi rebah kecambah yang sama di bedengan: pangkal batang mengering mencoklat dan mengeras, bukan berair. Yang menentukan bagi pembacanya golongan itu — bahan aktif untuk oomycete tidak bekerja pada keduanya — dan memisahkan Fusarium dari Rhizoctonia menuntut membiakkan jamurnya.' },
    ],
  },
  {
    pintu: 'op:pst:00000203',
    cakup: [
      { id: 'op:pst:00002171', nama: 'Hama Penggerek Batang',
        dasar: 'Entri registrinya menulis "Bactrocera hercules" — marga lalat buah — sementara label Indonesianya berbunyi "Hama Penggerek Batang" dan komoditasnya pala. Yang dimaksud Batocera hercules, kumbang sungut panjang penggerek batang, dan lubang bundar dengan tumpukan serbuk kayu yang dijanjikan pintu ini memang gejala yang dimaksud label.' },
    ],
  },
  {
    pintu: 'op:pst:00000204',
    cakup: [
      { id: 'op:pst:00001063', nama: 'Hama Trips',
        dasar: 'Pada padi tidak ada pintu bermarga Thrips, sehingga sasaran "Thrips sp." di sana tidak terjangkau pencakupan marga. Yang dimaksud label trips yang menggulung ujung daun bibit padi, dan itu persis yang dijanjikan pintu ini. Pada tanaman lain sasaran yang sama tetap dilayani pintu trips bermarga Thrips lewat pencakupan marga.' },
    ],
  },
  {
    pintu: 'op:pst:00000046',
    cakup: [
      { id: 'op:pst:00001392', nama: 'Lalat Bibit',
        dasar: 'Atherigona oryzae merusak jagung muda dengan cara yang sama seperti A. exigua: pucuk layu lalu mati sementara daun luar masih hijau, dan bila ditarik lepas dengan pangkal tergerek belatung. Keduanya lalat bibit yang menyerang pada dua sampai tiga minggu pertama dan ditangani dengan perlakuan benih yang sama.' },
      { id: 'op:pst:00001428', nama: 'Lalat Bibit',
        dasar: 'Registri menulis pest_label "Lalat bibit" untuk baris ini, dan pada jagung lalat bibit berarti Atherigona — Hydrellia lalat sawah yang tidak menyerang jagung, sementara barisnya berdosis 225 ml/ha bersama dua OPT jagung sejati pada label yang sama. Pada padi keduanya sama-sama lalat perusak bibit yang diperiksa dengan cara yang sama: tarik pucuk yang layu dan cari belatung di pangkalnya.' },
    ],
  },
  {
    pintu: 'op:pst:00000122',
    cakup: [
      { id: 'op:pst:00001362', nama: 'Hama Gudang',
        dasar: 'Tribolium confusum dan T. castaneum hanya dibedakan dari bentuk ujung sungutnya di bawah kaca pembesar — di karung keduanya kumbang pipih coklat kemerahan yang sama, meninggalkan tepung menggumpal berbau tengik yang sama, dan disanitasi gudang yang sama.' },
      { id: 'op:pst:00001250', nama: 'Kumbang',
        dasar: 'Alphitobius diaperinus kumbang gudang bersuku sama dengan Tribolium — Tenebrionidae — dan sama-sama memakan butir yang SUDAH pecah beserta sisa tepungnya, bukan butir utuh. Di tumpukan keduanya kumbang coklat kehitaman kecil yang berlari saat karung dibuka, dan keputusannya sama: cari dulu apa yang melubangi butir utuh, lalu sanitasi gudang.' },
    ],
  },
  {
    pintu: 'op:pst:00000073',
    cakup: [
      { id: 'op:pst:00001851', nama: 'Ulat Kantong',
        dasar: 'Mahasena corbetti ulat kantung sawit yang lebih besar, dan bentuk yang terlihat sama: kantung dari potongan daun yang tergantung di permukaan bawah pelepah, dan daun tergerus memutih menerawang dari dalam kantung. Pemeriksaannya sama — hitung kantung per pelepah contoh — dan ambang tindakannya sama.' },
    ],
  },
  {
    pintu: 'op:pst:00000074',
    cakup: [
      { id: 'op:pst:00001850', nama: 'Ulat Api',
        dasar: 'Darna trima ulat api yang lebih kecil tetapi sama sengatnya dan sama bentuk kerusakannya: daun tergerus dari permukaan bawah sampai tinggal urat sehingga pelepah terlihat menerawang. Ketiga jenis ulat api sawit sering ditemukan bersamaan pada pelepah yang sama, dan pengamatannya memang dilakukan bersama.' },
    ],
  },
  {
    pintu: 'op:pst:00000004',
    cakup: [
      { id: 'op:pst:00001952', nama: 'Lalat Buah',
        dasar: 'Bactrocera tryoni lalat buah Queensland yang tidak ada di Indonesia — sebarannya Australia timur — sehingga barisnya pada cabai salah nama untuk lalat buah yang memang ada di sini. Tusukan sebesar ujung jarum dengan belatung di dalam buah yang gugur memang gejala yang dimaksud label.' },
    ],
  },
  {
    pintu: 'op:pst:00000033',
    cakup: [
      { id: 'op:pst:00001834', nama: 'Siput Murbei',
        dasar: 'Label Indonesianya berbunyi "Siput Murbei" — nama keong mas — sementara kolom nama ilmiahnya berisi Pila ampullacea, keong sawah asli yang justru dipungut untuk dimakan. Yang dimaksud pendaftarannya keong yang merusak bibit padi, dan cirinya cangkang bulat dengan telur merah jambu di batang.' },
    ],
  },
  {
    pintu: 'op:pst:00000113',
    cakup: [
      { id: 'op:pst:00001703', nama: 'Hama Lundi Uret',
        dasar: 'Stibarophus molginus uret tebu yang larvanya melengkung seperti huruf C di dalam tanah dan memakan akar, sama bentuk dan sama letaknya dengan Lepidiota stigma; keduanya dipilah dengan melihat pola bulu di ujung perut larva, yang menuntut kaca pembesar.' },
      { id: 'op:pst:00001739', nama: 'Hama Lindu Uret',
        dasar: 'Phyllophaga sp. uret yang larvanya sama melengkung seperti huruf C, sama putih gemuk berkepala coklat, dan memakan akar dengan cara yang sama; pada jagung ia memberi tanaman yang menguning berpetak dan mudah dicabut, persis yang dijanjikan pintu ini.' },
    ],
  },
  {
    pintu: 'op:pst:00000147',
    cakup: [
      { id: 'op:pst:00001689', nama: 'Hama Gudang',
        dasar: 'Cryptolestes kumbang gudang yang sama pipihnya, sama kecilnya, dan sama-sama hanya memakan butir yang SUDAH pecah beserta tepungnya. Memisahkannya dari Oryzaephilus menuntut melihat tepi dada di bawah kaca pembesar, sementara keputusan lapangannya — cari dulu apa yang melubangi butir utuh — sama.' },
    ],
  },
  {
    pintu: 'op:pst:00000060',
    cakup: [
      { id: 'op:pst:00001808', nama: 'Penghisap Polong',
        dasar: 'Piezodorus — registri menulisnya "Peizodorus" — kepik pengisap polong yang menusuk polong kedelai dari luar sama seperti Riptortus, meninggalkan bintik coklat pada kulit polong dan biji yang kempis atau kosong di baliknya. Pemeriksaannya sama: buka polong yang berbintik dan lihat bijinya.' },
    ],
  },
  {
    pintu: 'op:pst:00000062',
    cakup: [
      { id: 'op:pst:00001446', nama: 'Penyakit Bercak Daun',
        dasar: 'Cercospora canescens pada kedelai memberi bercak bersudut kecoklatan yang dibatasi tulang daun, dan pada tanaman yang sama ia ditemukan bersama C. sojina tanpa cara memisahkannya tanpa mikroskop. Jadwal penyemprotannya sama.' },
    ],
  },
  {
    pintu: 'op:pst:00000118',
    cakup: [
      { id: 'op:pst:00001856', nama: 'Penyakit Speckle Daun Pisang',
        dasar: 'Cladosporium musae memberi bintik dan bercak pada daun pisang yang di kebun bercampur dengan sigatoka pada helai yang sama, dan keduanya dikendalikan dengan memangkas daun terbawah yang bergejala serta jadwal fungisida yang sama.' },
    ],
  },
  {
    pintu: 'op:pst:00000058',
    cakup: [
      { id: 'op:pst:00001968', nama: 'Lalat Pucuk',
        dasar: 'Melanagromyza sojae menggerek batang kedelai muda dari dalam sama seperti Ophiomyia phaseoli, dan pemeriksaannya sama: belah batang tanaman yang layu dan cari lorong berisi belatung. Keduanya lalat pengorok yang menyerang pada dua minggu pertama dan sama-sama ditahan perlakuan benih.' },
      { id: 'op:pst:00002023', nama: 'Lalat Bibit',
        dasar: 'Melanagromyza sasaran bertingkat marga lalat pengorok batang kacang-kacangan yang pada tanaman muda memberi kerusakan yang sama dengan Ophiomyia: bintik putih bekas tusukan pada daun bibit, lorong halus turun ke pangkal batang, dan tanaman yang layu sejak dua minggu pertama.' },
    ],
  },
  {
    pintu: 'op:pst:00000030',
    cakup: [
      { id: 'op:pst:00001389', nama: 'Penggerek Batang',
        dasar: 'Scirpophaga innotata memberi sundep dan beluk yang sama persis dengan S. incertulas — pucuk mati mudah ditarik lepas, malai putih hampa dengan batang masih hijau — dan tidak ada ciri lapangan yang membedakan keduanya tanpa membedah ngengatnya. Yang berbeda musimnya, bukan yang terlihat, dan tindakannya sama.' },
      { id: 'op:pst:00002172', nama: 'Penggerek Batang',
        dasar: 'Chilo suppressalis pada padi memberi sundep dan beluk yang sama dengan Scirpophaga incertulas — pucuk mati mudah ditarik lepas, malai putih hampa dengan batang masih hijau — dan pemeriksaan lapangannya sama: belah batang dan lihat lorong berisi kotoran. Pemisahannya menuntut ngengat dewasa.' },
    ],
  },
  {
    pintu: 'op:pst:00000006',
    cakup: [
      { id: 'op:pst:00001557', nama: 'Tungau Merah',
        dasar: 'Panonychus citri memberi gejala yang sama pada jeruk: daun kusam berbintik keperakan lalu memerah tembaga, dan tungau merah kecil di permukaan bawah yang cuma terlihat bila daun ditepuk di atas kertas putih. Membedakannya dari Tetranychus menuntut kaca pembesar kuat, sementara keputusan lapangannya — akarisida, bukan insektisida — sama.' },
    ],
  },
  {
    pintu: 'op:pst:00000045',
    cakup: [
      { id: 'op:pst:00001462', nama: 'Belalang',
        dasar: 'Valanga nigricornis belalang kayu yang jauh lebih besar tetapi merusak dengan cara yang sama: daun habis dimakan dari tepi, paling banyak di pinggir petak yang berbatasan rumput, dan ia melompat satu-satu di depan kaki alih-alih berpindah bergerombol. Yang membedakannya dari belalang kembara perilakunya, dan perilaku itu sama dengan pintu ini.' },
      { id: 'op:pst:00001598', nama: 'Belalang',
        dasar: 'Patanga succincta belalang yang tinggal di petaknya seperti Oxya, memakan daun jagung dari tepi dan tidak bergerombol berpindah. Ia sesekali berkerumun di pohon saat musim kering, tetapi kerusakan yang didaftarkan registri kerusakan daun biasa yang dijanjikan pintu ini.' },
    ],
  },
  {
    pintu: 'op:pst:00000095',
    cakup: [
      { id: 'op:pst:00001426', nama: 'Penyakit Bercak Daun',
        dasar: 'Cercospora personata bercak daun LAMBAT kacang tanah, muncul sesudah bercak daun awal dan sering di daun yang sama. Bercaknya lebih gelap dan bertepi lebih tegas, tetapi keduanya menggugurkan daun dari bawah pada waktu yang tumpang tindih dan disemprot dengan jadwal yang sama; memisahkannya menuntut melihat susunan konidiofor.' },
    ],
  },
  {
    pintu: 'op:pst:00000097',
    cakup: [
      { id: 'op:pst:00001446', nama: 'Penyakit Bercak Daun',
        dasar: 'Cercospora canescens memberi bercak bersudut kecoklatan yang dibatasi tulang daun halus pada kacang hijau dan kedelai, sama bentuknya dengan yang di kacang panjang, dan sama-sama berbulu kelabu di permukaan bawah pada cuaca lembap. Memisahkan spesies Cercospora menuntut mengukur konidium di bawah mikroskop.' },
      { id: 'op:pst:00001614', nama: 'Penyakit Bercak Daun',
        dasar: 'Cercospora cruenta bercak daun kacang panjang yang lain, dan registri mendaftarkannya pada tanaman yang sama. Bercaknya bersudut dibatasi tulang daun seperti C. vignae, muncul pada fase yang sama, dan disemprot dengan jadwal yang sama; yang berbeda cuma ukuran konidiumnya.' },
    ],
  },
  {
    pintu: 'op:pst:00000142',
    cakup: [
      { id: 'op:pst:00001631', nama: 'Hama Orong Orong',
        dasar: 'Gryllotalpa africana salah satu jenis orong-orong yang pintu ini janjikan: pintunya berdiri bertingkat MARGA karena yang terlihat di lapangan — kaki depan melebar seperti sekop, alur galian dangkal, batang terpotong rapi di batas tanah — sama pada seluruh jenisnya.' },
    ],
  },
  {
    pintu: 'op:pst:00000036',
    cakup: [
      { id: 'op:pst:00001198', nama: 'Penyakit Busuk Hitam',
        dasar: 'Registri menulis "Xanthomonas campestris" telanjang tanpa patovar. Pada padi yang dimaksud pv. oryzae — hawar daun bakteri — karena tidak ada Xanthomonas lain yang didaftarkan pada padi, dan tujuh barisnya semua padi. Pencakupan ini hanya berlaku pada inang pintu ini; baris kubisnya penyakit lain sama sekali dan tidak ikut.' },
    ],
  },
  {
    pintu: 'op:pst:00000047',
    cakup: [
      { id: 'op:pst:00001318', nama: 'Penggerek Batang',
        dasar: 'Ostrinia nubilalis tidak ada di Indonesia — sebarannya Eropa dan Amerika Utara — sehingga kelima baris registri ini salah nama untuk O. furnacalis, satu-satunya penggerek batang jagung Ostrinia di sini. Gejala yang dijanjikan pintu ini, lubang berderet pada daun yang membuka lalu gerekan di batang, memang gejala yang dimaksud label.' },
    ],
  },
  {
    pintu: 'op:pst:00000083',
    cakup: [
      { id: 'op:pst:00001425', nama: 'Kutu Daun',
        dasar: 'Toxoptera aurantii bergerombol di tunas dan daun muda jeruk persis seperti T. citricidus, sama-sama hitam mengkilap dan sama-sama meninggalkan embun madu berjelaga. Bedanya yang penting bukan yang terlihat: T. citricidus penular CVPD yang jauh lebih mampu, dan itu menaikkan alasan bertindak, bukan mengubah apa yang dilihat.' },
    ],
  },
  {
    pintu: 'op:pst:00000091',
    cakup: [
      { id: 'op:pst:00001441', nama: 'Kutu Daun',
        dasar: 'Aulacophora femoralis kumbang oteng-oteng yang sama bentuk dan cara makannya: melubangi daun mentimun-semangka-melon berbentuk bundar seperti ditembus, dan larvanya menggerek akar. Pintu ini memang bertingkat marga Aulacophora, jadi yang dijanjikannya sudah mencakup spesies ini apa adanya.' },
      { id: 'op:pst:00002286', nama: 'Oteng Oteng Kutu Kuya',
        dasar: 'Aulocophora similis salah eja untuk Aulacophora similis, kumbang oteng-oteng bermarga sama dengan lubang daun bundar yang sama, dan nama Indonesianya di registri pun "Oteng Oteng". Pintu ini bertingkat marga sehingga cakupannya memang sampai ke spesies ini.' },
    ],
  },
  {
    pintu: 'op:pst:00000111',
    cakup: [
      { id: 'op:pst:00001434', nama: 'Penggerek Batang',
        dasar: 'Chilo auricilius menggerek ruas tebu dengan lorong dan lubang keluar yang sama dengan C. sacchariphagus, dan di lapangan keduanya cuma dibedakan dengan membedah ngengat dewasa. Mati pucuk pada tebu muda dan ruas berlubang pada tebu tua sama-sama gejala keduanya.' },
      { id: 'op:pst:00002172', nama: 'Penggerek Batang',
        dasar: 'Chilo suppressalis pada pendaftaran tebu memberi gerekan ruas yang sama dengan C. sacchariphagus, dan pemeriksaan lapangannya sama: belah ruas yang lubangnya terlihat dan lihat lorong berisi kotoran. Pemilahan spesies Chilo menuntut pembedahan ngengat, jadi tidak masuk akal dijadikan syarat sebelum bertindak.' },
      { id: 'op:pst:00001610', nama: 'Penggerek Batang',
        dasar: 'Phragmataecia castaneae menggerek ruas tebu dari dalam persis seperti Chilo: mati pucuk pada tebu muda, ruas berlubang dengan lorong berisi kotoran pada tebu tua. Ngengatnya berbeda marga dan jauh lebih besar, tetapi yang terlihat di kebun — dan yang menentukan tindakan — lubang gerekannya.' },
    ],
  },
  {
    pintu: 'op:pst:00000140',
    cakup: [
      { id: 'op:pst:00001555', nama: 'Locusta migratoria',
        dasar: 'Locusta migratoria justru spesies yang dimaksud "belalang kembara": pintu ini ditulis bertingkat marga Locusta karena registri menuliskannya begitu, dan gerombolan yang berpindah bersama-sama yang dijanjikannya adalah perilaku spesies ini.' },
    ],
  },
];

const PINTU_EKOR2 = [
  {
    id: 'op:pst:00000141', dari: 'op:pst:00001244', nama: 'Penyakit Rebah Kecambah',
    key: 'rebah-kecambah', label: 'Rebah kecambah',
    inang: [CABAI, TOMAT, KENTANG, KUBIS, TEMBAKAU, JAGUNG, TEMBAKAU_SEMAI],
    definition:
      'Penyakit PERSEMAIAN, dan hampir selalu penyakit pengelolaan air: menumpuk pada media yang terlalu basah, naungan terlalu rapat, dan semaian terlalu padat. Bukan jamur sejati melainkan oomycete — golongan yang sama dengan busuk daun kentang — sehingga fungisida untuk jamur sejati tidak menyentuhnya, dan yang bekerja metalaksil atau dimetomorf. Menjarangkan semaian dan mengurangi siraman menghentikannya tanpa semprotan apa pun.',
    gejala:
      'Bibit rebah mendadak sementara daunnya masih HIJAU segar, dan bila diangkat pangkal batangnya menyempit berwarna coklat berair seperti tercekik. Rebahnya bermula dari satu titik lalu melebar melingkar hari demi hari. Sebagian benih malah tidak pernah muncul karena membusuk sebelum menembus permukaan.',
    pembanding: [
      { cek: 'Pegang pangkal batang bibit yang rebah. Rebah kecambah menyempitkannya jadi berair dan lunak sementara DAUNNYA MASIH HIJAU; bibit yang mati karena layu fusarium menguning dari daun bawah dulu dan pangkalnya tetap keras.',
        membantah: { id: 'op:pst:00000008', label: 'Layu fusarium' } },
      { cek: 'Perhatikan sebarannya di bedengan. Rebah kecambah melebar MELINGKAR dari satu titik yang paling basah; kerusakan yang tersebar merata atau terpotong rapi di pangkal penyebabnya hama tanah, bukan ini.' },
    ],
  },
  {
    id: 'op:pst:00000142', dari: 'op:pst:00001324', nama: 'Orong Orong',
    key: 'orong-orong', label: 'Orong-orong',
    inang: [BAWANG_MERAH, PADI, JAGUNG],
    definition:
      'Hidup di dalam tanah dan hampir tidak pernah terlihat siang hari, sehingga kerusakannya berulang kali disalahkan pada penyakit akar atau kekurangan air. Menyukai tanah gembur berbahan organik banyak dan lembap — persis keadaan bedengan bawang yang baru diolah. Umpan beracun di permukaan tanah menjelang malam lebih tepat sasaran daripada penyemprotan tajuk, karena ia naik hanya saat gelap.',
    gejala:
      'Tanaman muda REBAH karena batangnya terpotong tepat di batas tanah, dan potongannya rapi seperti digunting; tanaman yang rebah masih segar. Di permukaan tanah ada alur gundukan sempit berkelok seperti bekas galian dangkal, paling jelas pagi hari sesudah tanah disiram.',
    pembanding: [
      { cek: 'Cari ALUR gundukan berkelok di permukaan tanah pagi hari. Orong-orong meninggalkannya karena menggali tepat di bawah permukaan; ulat tanah tidak menggali alur, ia bersembunyi di bawah gumpalan tanah dekat tanaman yang dipotongnya.',
        membantah: { id: 'op:pst:00000060', label: 'Ulat tanah' } },
      { cek: 'Korek tanah sedalam sejengkal di dekat tanaman yang rebah menjelang senja. Orong-orong bertubuh coklat sepanjang ruas jari dengan sepasang kaki depan MELEBAR seperti sekop — tidak ada hama tanah lain yang punya itu.' },
    ],
  },
  {
    id: 'op:pst:00000143', dari: 'op:pst:00001423', nama: 'Perusak Daun',
    key: 'kumbang-kedelai', label: 'Kumbang daun kedelai',
    inang: [KEDELAI],
    definition:
      'Merusak dua kali dalam satu musim dengan bentuk yang berbeda: kumbang dewasa memakan daun dan pucuk, larvanya memakan bunga dan polong muda. Karena itu yang menentukan waktu pengamatan, bukan ambangnya — kerusakan daun bisa dibiarkan, kerusakan polong tidak. Paling padat pada pertanaman yang tidak serempak, karena ia berpindah dari petak yang lebih tua.',
    gejala:
      'Daun berlubang tidak beraturan dari tengah helai, dan pada pucuk muda daunnya habis sampai tinggal tulang. Kumbang berukuran sebiji beras berwarna coklat kemerahan mengkilap terlihat di pucuk dan mudah jatuh menjatuhkan diri bila disentuh. Pada fase polong, polong muda berlubang dan bijinya kosong.',
    pembanding: [
      { cek: 'Goyang pucuk tanaman di atas kertas. Kumbang daun kedelai menjatuhkan diri dan berpura-pura mati — ciri kumbang, bukan ulat. Kalau yang jatuh berbadan lunak tanpa sayap keras, itu ulat dan pintunya lain.',
        membantah: { id: 'op:pst:00000005', label: 'Ulat grayak' } },
      { cek: 'Buka polong yang berlubang. Larva kumbang ini berada DI DALAM polong memakan biji; polong yang berlubang tetapi kosong tanpa larva biasanya bekas pengisap polong, yang menusuk dari luar dan tidak masuk.' },
    ],
  },
  {
    id: 'op:pst:00000144', dari: 'op:pst:00001513', nama: 'Penyakit Embun Tepung',
    key: 'embun-bulu-anggur', label: 'Embun bulu anggur',
    inang: [ANGGUR],
    definition:
      'Registri menamainya "embun tepung", dan itu keliru dengan akibat langsung: ia oomycete, bukan jamur sejati, sehingga fungisida embun tepung — belerang, triadimefon — tidak menyentuhnya sama sekali, dan yang bekerja metalaksil, dimetomorf, atau tembaga. Menyerang sesudah hujan pada suhu hangat, dan seluruh bagian hijau yang masih muda rentan, termasuk dompolan bunga.',
    gejala:
      'Bercak MINYAK kuning tembus cahaya di permukaan ATAS daun, dan tepat di baliknya lapisan putih berbulu halus seperti kapas basah di permukaan BAWAH. Dompolan bunga dan buah muda menghitam lalu mengering; buah yang lebih tua berubah keunguan dan keras.',
    pembanding: [
      { cek: 'Terawang daun yang berbercak ke arah cahaya. Embun bulu memberi bercak MINYAK yang tembus cahaya sebelum lapisan putihnya muncul; embun tepung tidak pernah tembus cahaya, dan tepungnya di permukaan ATAS.' },
      { cek: 'Raba lapisan putihnya. Embun bulu BERBULU halus dan lembap seperti beledu; embun tepung kering seperti bedak dan terangkat bila diusap. Bedanya menentukan bahan aktifnya, jadi ini pemeriksaan yang menentukan biaya.' },
    ],
  },
  {
    id: 'op:pst:00000145', dari: 'op:pst:00001379', nama: 'Penyakit Kapang Kelabu',
    key: 'kapang-kelabu', label: 'Kapang kelabu',
    inang: [STROBERI, TOMAT],
    definition:
      'Masuk lewat LUKA dan lewat bunga yang sudah layu, jadi kelopak yang tertinggal menempel di pangkal buah pintu masuknya yang paling sering. Menumpuk pada kelembapan tinggi dan udara yang tidak bergerak; membuka jarak tanam dan membuang buah busuk lebih menentukan daripada menambah semprotan. Berlanjut SESUDAH panen di dalam keranjang, sehingga satu buah yang terlewat menulari sekeranjang.',
    gejala:
      'Buah membusuk lunak dan tertutup lapisan KELABU berdebu yang beterbangan bila disentuh, mulai dari titik yang bersentuhan dengan buah lain atau dari pangkal tempat kelopak menempel. Bunga dan tangkai yang terkena mencoklat lalu mengering, dan buah muda gugur.',
    pembanding: [
      { cek: 'Sentuh lapisan berdebunya. Kapang kelabu menerbangkan spora KELABU seperti asap; antraknosa memberi titik-titik hitam tersusun melingkar yang tidak beterbangan.',
        membantah: { id: 'op:pst:00000007', label: 'Antraknosa' } },
      { cek: 'Lihat dari mana busuknya bermula. Kapang kelabu bermula dari LUKA, dari titik singgung antarbuah, atau dari kelopak yang layu menempel — bukan dari tengah permukaan buah yang mulus.' },
    ],
  },
  {
    id: 'op:pst:00000146', dari: 'op:pst:00001226', nama: 'Kutu Daun',
    key: 'kutu-daun-kedelai', label: 'Kutu daun kedelai',
    inang: [KEDELAI],
    definition:
      'Yang merugikan biasanya bukan isapannya melainkan VIRUS yang dibawanya — mosaik kedelai — dan virus itu berpindah dalam hitungan detik saat kutu mencoba tanaman baru. Akibatnya penyemprotan sesudah kutu terlihat tidak menghentikan penularan yang sudah terjadi; yang menahan penularan justru tanaman pembatas dan benih sehat. Semut yang naik-turun batang memeliharanya dan mengusir musuh alaminya.',
    gejala:
      'Gerombolan kutu kecil kuning kehijauan di pucuk dan permukaan BAWAH daun muda, rapat sampai bertumpuk. Daun muda mengeriting dan mengerdil, permukaannya lengket oleh embun madu, dan di atas lengket itu tumbuh jelaga hitam. Semut hilir-mudik di batang.',
    pembanding: [
      { cek: 'Balik daun muda dan lihat warnanya. Kutu daun kedelai KUNING kehijauan dan bergerombol rapat di pucuk; kutu kebul putih bertepung dan BETERBANGAN saat daun digoyang.',
        membantah: { id: 'op:pst:00000003', label: 'Kutu kebul' } },
      { cek: 'Periksa apakah daun yang mengeriting juga BELANG kuning-hijau tidak beraturan. Kalau ya, yang sedang berjalan penularan virus mosaik, dan menyemprot kutunya tidak memulihkan tanaman yang sudah belang — ia hanya menahan penularan ke tanaman berikutnya.' },
    ],
  },
  {
    id: 'op:pst:00000147', dari: 'op:pst:00001363', nama: 'Hama Gudang',
    key: 'kumbang-gudang-gepeng', label: 'Kumbang gudang gepeng',
    inang: [BERAS_SIMPAN, JAGUNG_SIMPAN, TERIGU_SIMPAN, BERAS, GANDUM],
    definition:
      'Tidak bisa melubangi butir utuh — ia hanya memakan butir yang SUDAH pecah, dedak, dan tepung. Karena itu kehadirannya menunjukkan ada yang melubangi lebih dulu, dan menyemprotnya tanpa menangani kumbang bermoncong hanya mengulang pekerjaan. Badannya sangat gepeng sehingga ia masuk lewat lipatan karung dan sambungan kemasan yang terlihat rapat.',
    gejala:
      'Kumbang coklat sangat PIPIH sepanjang 2–3 mm bergerak cepat di antara butir dan di lipatan karung, jauh lebih ramping daripada kumbang gudang lain. Yang termakan bukan butir utuh melainkan pecahan dan tepung, sehingga tumpukan terasa berdebu dan menggumpal, tetapi butir yang utuh tetap mulus.',
    pembanding: [
      { cek: 'Lihat apakah butir yang UTUH berlubang. Kumbang gudang gepeng tidak bisa melubangi butir utuh; kalau ada lubang bundar rapi, yang bekerja kumbang bermoncong dan itu yang harus ditangani lebih dulu.',
        membantah: { id: 'op:pst:00000123', label: 'Bubuk beras' } },
      { cek: 'Perhatikan bentuk badannya dari samping. Kumbang ini PIPIH seperti tertekan dan bertepi bergerigi halus; kumbang tepung berbadan bulat memanjang dan tidak segepeng ini.',
        membantah: { id: 'op:pst:00000122', label: 'Kumbang tepung' } },
    ],
  },
];

const PINTU_EKOR3 = [
  {
    id: 'op:pst:00000148', dari: 'op:pst:00002306', nama: 'Penyakit Busuk Gabah',
    key: 'busuk-bulir-bakteri', label: 'Busuk bulir bakteri',
    inang: [PADI],
    definition:
      'Menyerang tepat saat berbunga sampai pengisian, dan menumpuk pada malam yang panas sesudah hujan — jadi ia penyakit MUSIM, bukan penyakit petak. Terbawa benih, sehingga gabah dari petak yang terserang meneruskannya ke musim berikutnya, dan itu titik paling murah untuk memutusnya. Bakteri: fungisida tidak menyentuhnya.',
    gejala:
      'Bulir pada malai berubah COKLAT KEMERAHAN dari pangkal ke ujung sementara malainya tetap tegak, dan bulir yang terkena hampa atau berisi sebagian. Warnanya berbatas jelas dengan bulir sehat di sebelahnya, dan bercaknya tidak berdebu maupun bergumpal.',
    pembanding: [
      { cek: 'Pijit bulir yang mencoklat. Busuk bulir bakteri menyisakan bulir HAMPA atau setengah isi tanpa serbuk apa pun; gosong palsu menggantikan bulirnya dengan gumpalan berdebu hijau kehitaman yang jauh lebih besar.',
        membantah: { id: 'op:pst:00000133', label: 'Gosong palsu' } },
      { cek: 'Lihat apakah SELURUH malai putih hampa atau cuma sebagian bulirnya yang mencoklat. Busuk bulir mengenai bulir satu-satu; malai yang hampa seluruhnya dan mudah dicabut penyebabnya penggerek batang.',
        membantah: { id: 'op:pst:00000030', label: 'Penggerek batang' } },
    ],
  },
  {
    id: 'op:pst:00000149', dari: 'op:pst:00001978', nama: 'Ulat Grayak',
    key: 'ulat-grayak-padi', label: 'Ulat grayak padi',
    inang: [PADI],
    definition:
      'Berbeda dari ulat grayak sayuran: yang ini menyerang BERGEROMBOL dan berpindah dari petak ke petak seperti pasukan, sehingga petak yang bersih pagi ini bisa gundul sore nanti. Menumpuk sesudah musim kering panjang yang diputus hujan, dan pada padi gogo lebih sering daripada di sawah berair. Aktif malam; siang hari ia bersembunyi di pangkal rumpun dan di retakan tanah.',
    gejala:
      'Daun habis dimakan dari tepi sampai tinggal tulang daun, merata di satu bagian petak dan berbatas tegas dengan bagian yang belum terserang. Pada fase malai, tangkai malai terpotong sehingga malai jatuh. Ulat berwarna coklat kelabu bergaris memanjang, ditemukan di pangkal rumpun atau retakan tanah pada siang hari.',
    pembanding: [
      { cek: 'Korek pangkal rumpun dan retakan tanah pada SIANG hari. Ulat grayak padi bersembunyi di sana dan keluar malam; ulat yang terlihat makan di siang bolong biasanya ulat lain.' },
      { cek: 'Lihat batas kerusakannya. Ulat grayak padi menggunduli satu bagian petak dengan batas tegas lalu maju bergerombol; hama putih palsu meninggalkan daun tergulung dan memutih menerawang yang tersebar merata.',
        membantah: { id: 'op:pst:00000034', label: 'Hama putih palsu' } },
    ],
  },
  {
    id: 'op:pst:00000150', dari: 'op:pst:00001611', nama: 'Hama Lundi',
    key: 'lundi-padi', label: 'Lundi padi',
    inang: [PADI],
    definition:
      'Yang merusak LARVANYA di dalam tanah, bukan kumbangnya, sehingga tanaman terlihat kekurangan air atau hara sampai dicabut. Masalah padi GOGO dan sawah tadah hujan; pada sawah yang tergenang terus ia tidak bertahan, dan menggenangi petak beberapa hari adalah tindakan yang lebih murah daripada menyemprot. Satu generasi setahun, muncul serempak pada awal musim hujan.',
    gejala:
      'Rumpun menguning dan layu berpetak-petak walau tanahnya lembap, dan bila ditarik rumpunnya LEPAS dengan mudah karena akarnya habis. Di tanah sekitar akar ada larva putih gemuk melengkung seperti huruf C dengan kepala coklat dan tiga pasang kaki di depan.',
    pembanding: [
      { cek: 'Tarik rumpun yang menguning. Lundi membuat rumpun LEPAS ringan tanpa akar; rumpun yang menguning tetapi akarnya masih mencengkeram penyebabnya hara atau penyakit, bukan hama tanah.' },
      { cek: 'Korek tanah sedalam sejengkal di bawah rumpun yang mati. Larva lundi melengkung seperti huruf C, gemuk, dan berkaki tiga pasang; orong-orong bertubuh lurus dengan kaki depan melebar seperti sekop.',
        membantah: { id: 'op:pst:00000142', label: 'Orong-orong' } },
    ],
  },
  {
    id: 'op:pst:00000151', dari: 'op:pst:00001650', nama: 'Kepinding Tanah',
    key: 'kepinding-tanah', label: 'Kepinding tanah',
    inang: [PADI],
    definition:
      'Mengisap pangkal batang di batas air, bukan daun maupun malai, sehingga gejalanya mudah dikira kekurangan hara. Bersembunyi di pangkal rumpun dan di celah tanah siang hari dan naik malam; karena itu pengamatan siang hampir selalu menyatakan tidak ada apa-apa. Tertarik lampu, sehingga perangkap lampu berguna untuk mengetahui kapan populasinya naik.',
    gejala:
      'Rumpun kerdil dan menguning dari daun bawah, anakan berkurang, dan pada serangan berat rumpun mengering berpetak seperti terbakar. Di pangkal batang tepat di batas air ada kepik pipih coklat kehitaman sepanjang sebutir beras yang mengeluarkan BAU MENYENGAT bila diganggu.',
    pembanding: [
      { cek: 'Buka pangkal rumpun di batas air dan cium. Kepinding tanah mengeluarkan bau menyengat khas dan berkumpul di pangkal batang; walang sangit berbau serupa tetapi berada di MALAI, bukan di pangkal, dan menyerang saat bulir masak susu.',
        membantah: { id: 'op:pst:00000035', label: 'Walang sangit' } },
      { cek: 'Periksa malam hari atau pasang perangkap lampu. Kepinding tanah naik ke batang saat gelap; petak yang siangnya terlihat bersih bisa penuh saat diperiksa malam.' },
    ],
  },
  {
    id: 'op:pst:00000152', dari: 'op:pst:00001471', nama: 'Penyakit Bulir Kotor',
    key: 'bulir-kotor', label: 'Bulir kotor',
    inang: [PADI],
    definition:
      'Bukan satu jamur melainkan BEBERAPA yang menumpang pada bulir yang sudah terluka atau yang pengisiannya terganggu — registri sendiri menuliskannya sebagai "Dirty panicle", nama gejala, bukan nama organisme. Karena itu pintu ini menjanjikan cirinya dan bukan penyebabnya, dan yang paling menentukan justru sebabnya yang lebih dulu: tusukan walang sangit, hujan saat berbunga, atau pemupukan nitrogen berlebih.',
    gejala:
      'Bulir bernoda COKLAT sampai kehitaman tidak beraturan, sebagian berbercak kelabu berjelaga, tersebar tidak merata pada malai dan bercampur dengan bulir yang bersih. Gabahnya ringan dan berasnya berbintik saat digiling. Malainya sendiri tetap tegak dan hijau.',
    pembanding: [
      { cek: 'Periksa apakah ada tusukan kecil pada bulir yang bernoda, dan cari walang sangit pada malai menjelang senja. Bulir kotor sangat sering MENUMPANG pada bekas tusukan; kalau walang sangitnya masih ada, yang perlu ditangani lebih dulu itu.',
        membantah: { id: 'op:pst:00000035', label: 'Walang sangit' } },
      { cek: 'Bandingkan sebaran nodanya. Bulir kotor bernoda tidak beraturan dan bercampur bulir bersih di malai yang sama; bercak coklat padi memberi bercak bulat lonjong seragam yang juga ada di DAUN, bukan cuma di bulir.',
        membantah: { id: 'op:pst:00000134', label: 'Bercak coklat padi' } },
    ],
  },
  {
    id: 'op:pst:00000153', dari: 'op:pst:00002325', nama: 'Wereng',
    key: 'wereng-jagung', label: 'Wereng jagung',
    inang: [JAGUNG],
    definition:
      'Yang merugikan bukan isapannya melainkan VIRUS yang dibawanya — mosaik kerdil jagung — dan tanaman yang sudah terinfeksi tidak bisa dipulihkan. Karena itu keputusannya soal waktu: menahan wereng pada bulan pertama menentukan, menyemprot sesudah tanaman kerdil tidak. Menumpuk pada musim kering dan pada pertanaman yang tidak serempak.',
    gejala:
      'Wereng kecil putih kekuningan bergerombol di dalam GULUNGAN daun pucuk, terlihat begitu daun termuda dibuka, dan berlompatan saat terganggu. Tanaman yang terinfeksi virusnya kerdil dengan ruas memendek, daun bergaris kuning putus-putus sejajar tulang daun, dan tongkolnya kecil atau tidak terbentuk.',
    pembanding: [
      { cek: 'Buka gulungan daun pucuk. Wereng jagung bergerombol DI DALAM gulungan itu — bukan di permukaan bawah daun terbuka seperti kutu daun jagung, yang bergerombol rapat dan meninggalkan embun madu lengket.',
        membantah: { id: 'op:pst:00000048', label: 'Kutu daun jagung' } },
      { cek: 'Lihat garis kuning pada daunnya. Wereng jagung menularkan virus yang memberi garis PUTUS-PUTUS sejajar tulang daun pada tanaman kerdil; bulai memberi garis kuning MEMANJANG penuh dengan tepung putih di permukaan bawah pada pagi berembun.',
        membantah: { id: 'op:pst:00000043', label: 'Bulai' } },
    ],
  },
  {
    id: 'op:pst:00000154', dari: 'op:pst:00001662', nama: 'Penyakit Karat',
    key: 'karat-jagung', label: 'Karat jagung',
    inang: [JAGUNG],
    definition:
      'Menumpuk di dataran TINGGI dan pada musim berembun panjang; di dataran rendah panas ia jarang jadi masalah. Merugikan bila menyerang sebelum berbunga — sesudah pengisian biji, daun yang berkarat sudah tidak banyak mengubah hasil, dan menyemprot pada saat itu ongkos tanpa balasan.',
    gejala:
      'Bintil kecil lonjong COKLAT KEMERAHAN seperti karat besi bertaburan di kedua permukaan daun, dan bila diusap dengan jari meninggalkan bubuk berwarna karat. Bintilnya menonjol dan pecah, bukan bercak rata. Pada serangan berat daun mengering dari bawah.',
    pembanding: [
      { cek: 'Usap bintilnya dengan jari. Karat meninggalkan BUBUK berwarna karat di jari karena bintilnya pecah menaburkan spora; bercak hawar daun jagung rata, tidak menonjol, dan tidak meninggalkan bubuk apa pun.',
        membantah: { id: 'op:pst:00000044', label: 'Hawar daun jagung' } },
      { cek: 'Perhatikan bentuknya. Karat memberi bintil BULAT LONJONG kecil bertaburan; hawar daun memberi bercak panjang berbentuk perahu sepanjang beberapa sentimeter.',
        membantah: { id: 'op:pst:00000044', label: 'Hawar daun jagung' } },
    ],
  },
  {
    id: 'op:pst:00000155', dari: 'op:pst:00001697', nama: 'Penyakit Bercak Daun',
    key: 'hawar-daun-maydis', label: 'Hawar daun maydis',
    inang: [JAGUNG],
    definition:
      'Hawar jagung yang kedua, dan bedanya dari yang pertama bukan bentuk pengendaliannya melainkan IKLIMNYA: yang ini menumpuk di dataran RENDAH yang panas dan lembap, sementara hawar daun jagung lebih menyukai dataran menengah dan tinggi. Bertahan pada sisa tanaman, jadi jagung yang ditanam terus-menerus di petak yang sama menaikkannya musim demi musim.',
    gejala:
      'Bercak lonjong SEJAJAR tulang daun, coklat kekuningan bertepi lebih tua, panjangnya satu sampai dua sentimeter dan dibatasi tulang daun sehingga sisinya lurus. Bercaknya banyak dan menyatu jadi bidang kering; menyerang dari daun bawah ke atas.',
    pembanding: [
      { cek: 'Ukur dan lihat bentuk bercaknya. Hawar maydis memberi bercak PENDEK satu sampai dua sentimeter dengan sisi lurus dibatasi tulang daun; hawar daun jagung memberi bercak panjang berbentuk perahu yang melampaui tulang daun.',
        membantah: { id: 'op:pst:00000044', label: 'Hawar daun jagung' } },
      { cek: 'Ingat ketinggian tempatnya. Hawar maydis menumpuk di dataran rendah panas lembap; kalau kebunnya di dataran tinggi berembun, yang lebih mungkin hawar daun jagung atau karat.',
        membantah: { id: 'op:pst:00000044', label: 'Hawar daun jagung' } },
    ],
  },
  {
    id: 'op:pst:00000156', dari: 'op:pst:00001934', nama: 'Penyakit Busuk Tongkol',
    key: 'busuk-tongkol', label: 'Busuk tongkol',
    inang: [JAGUNG],
    definition:
      'Bahayanya berlanjut SESUDAH panen: tongkol yang terserang menghasilkan biji yang berjamur di penyimpanan, dan sebagian jamur busuk tongkol menghasilkan racun yang menyusahkan bila jagungnya dipakai untuk pakan. Masuk lewat luka — bekas gerekan, bekas patukan burung, kelobot yang terbuka — dan lewat ujung tongkol yang basah. Memanen tepat waktu dan mengeringkan cepat lebih menentukan daripada penyemprotan.',
    gejala:
      'Biji pada tongkol tertutup jamur berwarna PUTIH KELABU sampai kehitaman, mulai dari pangkal atau ujung tongkol, dan biji yang terkena kusam, ringan, serta melekat satu sama lain. Kelobot yang menutupinya ikut mengering dan menempel; tongkol yang dibuka berbau apak.',
    pembanding: [
      { cek: 'Buka kelobot dan lihat dari mana busuknya bermula. Busuk tongkol bermula dari PANGKAL atau UJUNG dan menyebar sepanjang tongkol; kerusakan yang terpusat pada beberapa biji berlubang dengan kotoran halus penyebabnya penggerek.',
        membantah: { id: 'op:pst:00000047', label: 'Penggerek batang jagung' } },
      { cek: 'Periksa apakah ada luka atau gerekan pada tongkol yang berjamur. Busuk tongkol hampir selalu MENUMPANG pada luka; menutup jalan masuknya — menahan penggerek dan memanen tepat waktu — lebih menolong daripada menyemprot tongkol yang sudah berjamur.' },
    ],
  },
  {
    id: 'op:pst:00000157', dari: 'op:pst:00002235', nama: 'Ulat Jengkal',
    key: 'ulat-jengkal-kubis', label: 'Ulat jengkal kubis',
    inang: [KUBIS, SAWI],
    definition:
      'Ulatnya berjalan MELENGKUNG seperti mengukur jengkal karena kaki tengahnya berkurang — itu satu-satunya ciri yang tidak bisa tertukar dengan ulat kubis lain. Memakan daun luar lebih dulu dan baru masuk ke krop, jadi ia terlihat lebih awal daripada ulat krop dan masih bisa ditangani sebelum kropnya rusak.',
    gejala:
      'Daun luar berlubang besar tidak beraturan, tepinya tergerus, dan pada permukaan bawah ada ulat hijau bergaris putih tipis yang berjalan MELENGKUNG mengangkat badan tengahnya. Kotoran hijau kehitaman bertaburan di ketiak daun.',
    pembanding: [
      { cek: 'Perhatikan cara ulatnya berjalan. Ulat jengkal melengkung mengangkat badan tengah setiap langkah; ulat daun kubis berjalan rata dan menjatuhkan diri dengan benang sutera bila disentuh.',
        membantah: { id: 'op:pst:00000049', label: 'Ulat daun kubis' } },
      { cek: 'Lihat di mana kerusakannya. Ulat jengkal memakan DAUN LUAR lebih dulu; ulat krop masuk langsung ke titik tumbuh dan kerusakannya baru terlihat saat krop dibelah.',
        membantah: { id: 'op:pst:00000050', label: 'Ulat krop' } },
    ],
  },
  {
    id: 'op:pst:00000158', dari: 'op:pst:00001514', nama: 'Penyakit Karat Daun',
    key: 'karat-kacang-panjang', label: 'Karat kacang panjang',
    inang: [KACANG_PANJANG, KACANG_HIJAU],
    definition:
      'Menumpuk pada musim hujan dan pada pertanaman yang rapat serta lembap; jarak tanam dan pemangkasan sulur bagian bawah menurunkannya tanpa semprotan. Menyerang dari daun tua ke atas, dan bila mencapai daun muda sebelum polong terisi, hasilnya turun tajam.',
    gejala:
      'Bintil kecil menonjol COKLAT KEMERAHAN di permukaan BAWAH daun, mula-mula terpencar lalu rapat, dan bila diusap meninggalkan bubuk warna karat di jari. Dari atas terlihat sebagai bintik kuning pucat tepat di atas tiap bintil. Daun tua menguning lalu rontok.',
    pembanding: [
      { cek: 'Balik daun dan usap bintilnya. Karat menonjol di permukaan BAWAH dan meninggalkan bubuk warna karat; bercak daun kacang panjang rata, bersudut, dibatasi tulang daun, dan tidak berbubuk.',
        membantah: { id: 'op:pst:00000097', label: 'Bercak daun kacang panjang' } },
      { cek: 'Lihat urutan daun yang terkena. Karat naik dari daun TUA ke daun muda; kerusakan yang bermula di pucuk dan daun termuda penyebabnya hama pengisap, bukan karat.' },
    ],
  },
  {
    id: 'op:pst:00000159', dari: 'op:pst:00001536', nama: 'Penyakit Kudis',
    key: 'kudis-kacang-hijau', label: 'Kudis kacang hijau',
    inang: [KACANG_HIJAU],
    definition:
      'Menyerang bagian yang masih MUDA — daun yang baru membuka, tangkai, dan polong muda — dan berhenti begitu jaringannya mengeras, sehingga penyemprotan hanya berarti pada fase pertumbuhan cepat. Menumpuk pada musim hujan berangin, karena percikan air yang memindahkan sporanya. Bertahan pada sisa tanaman dan pada benih.',
    gejala:
      'Bercak kecil menonjol seperti KUDIS di daun, tangkai, dan polong: coklat kemerahan dengan tengah kelabu kasar, dan bila diraba terasa berkerak. Daun muda yang bercaknya rapat menggulung dan terpuntir; polong yang terkena bengkok dan bijinya kecil.',
    pembanding: [
      { cek: 'Raba bercaknya. Kudis MENONJOL dan berkerak kasar seperti amplas; bercak daun rata dan hanya terlihat sebagai perubahan warna.',
        membantah: { id: 'op:pst:00000097', label: 'Bercak daun kacang panjang' } },
      { cek: 'Lihat apakah TANGKAI dan POLONG ikut berbercak, bukan cuma daunnya. Kudis mengenai ketiganya; penyakit daun yang berhenti di daun bukan ini.' },
    ],
  },
  {
    id: 'op:pst:00000160', dari: 'op:pst:00001453', nama: 'Penyakit Gugur Daun',
    key: 'gugur-daun-karet', label: 'Gugur daun karet',
    inang: [KARET],
    definition:
      'Menggugurkan daun di luar musim gugur daun alaminya, dan itu yang membedakannya dari daun yang rontok karena musim: pohon yang menggugurkan daun berulang kali dalam setahun menurunkan hasil sadapan musim berikutnya. Menumpuk pada musim hujan dengan kelembapan tinggi terus-menerus. Menyerang daun TUA lebih dulu, berbeda dari gugur daun yang menyerang daun muda saat pohon bertunas.',
    gejala:
      'Bercak bulat COKLAT bertepi lebih tua pada daun tua, sering dengan titik hitam kecil di tengahnya, dan bercaknya melebar sampai menyatu. Daun menguning lalu gugur berjatuhan di bawah tajuk walau bukan musim gugur daun; tajuk menipis berpetak-petak di kebun.',
    pembanding: [
      { cek: 'Ingat waktunya. Gugur daun karena penyakit terjadi di LUAR musim gugur daun tahunan dan berulang; gugur daun musiman menggugurkan seluruh kebun serempak lalu pohon bertunas kembali.' },
      { cek: 'Lihat umur daun yang gugur. Pintu ini untuk gugur daun yang mengenai daun TUA berbercak bulat bertitik hitam; bercak pada daun muda yang baru membuka saat pohon bertunas penyebabnya lain dan waktu penyemprotannya berbeda.' },
    ],
  },
  {
    id: 'op:pst:00000161', dari: 'op:pst:00001874', nama: 'Penyakit Jamur Upas',
    key: 'jamur-upas', label: 'Jamur upas',
    inang: [KAKAO, APEL, KARET],
    definition:
      'Menyerang CABANG dan batang, bukan daun, dan cabang yang sudah dilingkari seluruhnya tidak bisa diselamatkan — yang bisa hanya memotongnya di bawah batas serangan sebelum menyebar. Karena itu keputusannya soal waktu memeriksa, bukan soal bahan aktif: sekali terlihat merah muda, cabangnya sudah mati. Menumpuk di kebun rapat yang lembap dan kurang cahaya.',
    gejala:
      'Lapisan tipis merah JAMBU sampai jingga menempel rata di kulit cabang, seperti dicat, sering dimulai dari sisi bawah cabang. Di atas batas lapisan itu daun menguning dan cabangnya mati mengering sementara bagian bawahnya masih hidup. Kulit di bawah lapisan itu mengelupas dan mengeluarkan getah kering.',
    pembanding: [
      { cek: 'Lihat WARNANYA dan di mana ia menempel. Jamur upas berwarna merah jambu sampai jingga menempel rata di KULIT CABANG; jamur akar putih memberi benang putih rata di AKAR dan pangkal batang, di bawah permukaan tanah.',
        membantah: { id: 'op:pst:00000115', label: 'Jamur akar putih' } },
      { cek: 'Periksa apakah bagian cabang di BAWAH lapisan itu masih hidup. Jamur upas mematikan cabang dari batas lapisannya ke ujung; pohon yang mati dari bawah ke atas penyebabnya akar, bukan ini.' },
    ],
  },
  {
    id: 'op:pst:00000162', dari: 'op:pst:00002332', nama: 'Didymella bryoniae',
    key: 'busuk-batang-bergetah', label: 'Busuk batang bergetah',
    inang: [SEMANGKA, MELON, MENTIMUN],
    definition:
      'Masuk lewat LUKA — bekas pangkas sulur, bekas petik, retakan batang — sehingga pekerjaan tangan di kebun basah adalah cara penularannya yang paling sering. Karena itu memangkas saat kering dan tidak berpindah petak dengan alat yang sama menurunkannya lebih banyak daripada menambah semprotan. Terbawa benih dan bertahan pada sisa tanaman.',
    gejala:
      'Batang dekat pangkal atau di ketiak sulur retak memanjang dan mengeluarkan GETAH coklat kemerahan yang mengering seperti damar, dan di sekitarnya jaringan mencoklat berbatas jelas. Daun bertepi bercak coklat kekuningan bersudut yang meluas dari tepi ke dalam; tanaman layu sebagian, sisi yang batangnya terluka lebih dulu.',
    pembanding: [
      { cek: 'Cari GETAH kering berwarna coklat kemerahan di retakan batang. Busuk batang bergetah meninggalkannya; layu fusarium tidak mengeluarkan getah, dan batangnya bila dibelah memperlihatkan pembuluh yang mencoklat dari dalam.',
        membantah: { id: 'op:pst:00000008', label: 'Layu fusarium' } },
      { cek: 'Lihat apakah layunya sebagian atau seluruh tanaman sekaligus. Busuk batang bergetah mematikan sisi yang batangnya terluka lebih dulu; layu bakteri melayukan seluruh tanaman dalam hitungan hari sementara daunnya masih hijau.',
        membantah: { id: 'op:pst:00000009', label: 'Layu bakteri' } },
    ],
  },
  {
    id: 'op:pst:00000163', dari: 'op:pst:00001592', nama: 'Hama Kutu Daun',
    key: 'kutu-daun-bawang', label: 'Kutu daun bawang',
    inang: [BAWANG_MERAH, BAWANG_PUTIH],
    definition:
      'Kutu daun yang khusus Allium, dan bertahan di gudang pada umbi yang disimpan — jadi umbi bibit yang berkutu membawanya ke petak baru, dan memeriksa bibit sebelum tanam menutup jalur yang paling sering. Menumpuk pada musim kering. Semut yang naik-turun daun memeliharanya.',
    gejala:
      'Gerombolan kutu kecil COKLAT KEMERAHAN sampai kehitaman di pangkal daun dan di sela daun yang masih menggulung, rapat sampai bertumpuk. Daun terpuntir dan menguning dari ujung, permukaannya lengket oleh embun madu, dan di atas lengket itu tumbuh jelaga hitam.',
    pembanding: [
      { cek: 'Buka sela daun yang masih menggulung di pangkal. Kutu daun bawang bergerombol DI SANA dan berwarna coklat kemerahan sampai kehitaman; trips bawang jauh lebih kecil, kuning kecoklatan, dan meninggalkan bercak keperakan bukan gerombolan.',
        membantah: { id: 'op:pst:00000013', label: 'Trips bawang' } },
      { cek: 'Raba permukaan daunnya. Kutu daun meninggalkan LENGKET embun madu yang lalu berjelaga hitam; trips tidak meninggalkan apa pun yang lengket.',
        membantah: { id: 'op:pst:00000013', label: 'Trips bawang' } },
    ],
  },
  {
    id: 'op:pst:00000164', dari: 'op:pst:00001502', nama: 'Belalang',
    key: 'belalang-kelapa', label: 'Belalang kelapa',
    inang: [KELAPA],
    definition:
      'Aktif MALAM dan bersembunyi di ketiak pelepah siang hari, sehingga kebun yang terlihat rusak parah sering diperiksa tanpa menemukan seekor pun. Kerusakannya menumpuk lambat tetapi tidak pulih cepat: pelepah yang habis dimakan tidak diganti sampai pelepah baru terbentuk, dan buah muda rontok berbulan-bulan sesudahnya. Menyebar dari pohon ke pohon lewat tajuk yang bersentuhan.',
    gejala:
      'Anak daun pelepah habis dimakan dari tepi sehingga tinggal lidi, dimulai dari pelepah TUA di bawah dan naik ke atas; tajuk terlihat compang-camping seperti sapu. Bunga dan buah muda ikut dimakan lalu rontok. Belalang hijau kecoklatan bersungut sangat panjang ditemukan di ketiak pelepah pada siang hari.',
    pembanding: [
      { cek: 'Periksa ketiak pelepah pada SIANG hari, atau datang malam dengan senter. Belalang kelapa bersembunyi di sana dan bersungut lebih panjang daripada badannya — tidak ada belalang lain di kelapa yang begitu.' },
      { cek: 'Lihat dari pelepah mana kerusakannya bermula. Belalang kelapa memakan dari pelepah TUA di bawah ke atas; kumbang tanduk merusak pucuk yang belum membuka sehingga daun baru keluar bergerigi seperti digunting segitiga.',
        membantah: { id: 'op:pst:00000075', label: 'Kumbang tanduk' } },
    ],
  },
  {
    id: 'op:pst:00000165', dari: 'op:pst:00001760', nama: 'Penggerek Pucuk',
    key: 'penggerek-pucuk-tembakau', label: 'Penggerek pucuk tembakau',
    inang: [TEMBAKAU],
    definition:
      'Menggerek titik tumbuh, dan itu yang membuatnya berbeda dari ulat pemakan daun mana pun: satu ulat menghabisi satu tanaman, karena pucuk yang mati menghentikan pembentukan daun yang justru jadi hasilnya. Kerabat dekat penggerek buah yang menyerang tomat dan jagung, dan bergerak di antara ketiganya bila ditanam berdekatan.',
    gejala:
      'Pucuk berlubang dan mengeluarkan kotoran halus seperti serbuk gergaji di ketiaknya; daun termuda yang membuka sesudahnya berlubang berderet karena tergerek saat masih terlipat. Pucuk akhirnya mati dan tanaman mengeluarkan tunas samping berlebihan.',
    pembanding: [
      { cek: 'Cari KOTORAN halus seperti serbuk gergaji di ketiak pucuk. Penggerek pucuk meninggalkannya karena ia menggerek dari dalam; ulat grayak memakan dari luar dan tidak meninggalkan serbuk di dalam ketiak.',
        membantah: { id: 'op:pst:00000005', label: 'Ulat grayak' } },
      { cek: 'Lihat apakah lubang pada daun BERDERET rapi. Daun yang tergerek saat masih terlipat membuka dengan lubang berderet; lubang yang tersebar tidak beraturan penyebabnya ulat pemakan daun.' },
    ],
  },
  {
    id: 'op:pst:00000166', dari: 'op:pst:00001507', nama: 'Hama Jembret',
    key: 'jembret', label: 'Jembret',
    inang: [TAMBAK],
    definition:
      'Udang kecil liar yang masuk bersama air pasang dan BERSAING dengan udang atau bandeng yang dipelihara — memakan pakan yang ditebar dan menghabiskan oksigen — bukan memangsa. Karena itu pengendaliannya terjadi saat persiapan tambak, sebelum benur ditebar; sesudah benur masuk, hampir tidak ada yang bisa dipakai tanpa membahayakan yang dipelihara. Penyaringan air masuk lebih menentukan daripada bahan apa pun.',
    gejala:
      'Udang kecil bening kelabu sepanjang kuku jari berenang bergerombol di permukaan air terutama pagi dan senja, dan terangkat banyak bila air diciduk dengan ember. Pakan cepat habis tetapi udang atau bandeng yang dipelihara tidak bertambah besar; air terlihat berkabut oleh gerombolannya.',
    pembanding: [
      { cek: 'Ciduk air dengan ember pada pagi hari dan lihat isinya. Jembret bening kelabu, berukuran seragam kecil, dan bergerombol; benur yang dipelihara berukuran lebih besar dan menyebar, bukan bergerombol di permukaan.' },
      { cek: 'Periksa saringan air masuk sebelum menyimpulkan. Jembret masuk bersama air pasang; kalau saringannya rusak atau terlalu kasar, mengobati petaknya tidak akan menyelesaikan apa pun karena ia masuk lagi pada pasang berikutnya.' },
    ],
  },
];

const PINTU_EKOR4 = [
  {
    id: 'op:pst:00000167', dari: 'op:pst:00001673', nama: 'Penyakit Bercak Daun',
    key: 'bercak-daun-cucurbit', label: 'Bercak daun cucurbit',
    inang: [SEMANGKA, MELON, MENTIMUN],
    definition:
      'Menyerang DAUN saja dan tidak masuk ke buah, sehingga kerugiannya tidak langsung: daun yang gugur membuat buah terbakar matahari dan gulanya tidak terbentuk. Karena itu keputusannya bergantung fase — sebelum buah membesar layak ditahan, sesudah panen dekat tidak. Menumpuk pada musim hujan dan pada pertanaman rapat yang lama basah.',
    gejala:
      'Bercak BULAT kecil pada daun tua, tengahnya kelabu keputihan dan tepinya coklat tua berbatas tegas, kadang dengan lingkaran kuning di luarnya. Bercak yang tua berlubang karena bagian tengahnya rontok. Daun mengering dari bawah dan gugur sementara sulur dan buahnya tetap sehat.',
    pembanding: [
      { cek: 'Lihat apakah BUAHNYA ikut berbercak. Bercak daun cucurbit berhenti di daun; antraknosa cucurbit memberi bercak melingkar cekung pada buah juga, dan itu yang menentukan buahnya masih bisa dijual atau tidak.',
        membantah: { id: 'op:pst:00000090', label: 'Antraknosa cucurbit' } },
      { cek: 'Balik daun yang berbercak. Bercak daun cucurbit tidak menumbuhkan apa pun di permukaan bawah; embun bulu menumbuhkan lapisan keunguan berbulu tepat di balik bercak kuning bersudutnya.',
        membantah: { id: 'op:pst:00000089', label: 'Embun bulu cucurbit' } },
    ],
  },
  {
    id: 'op:pst:00000168', dari: 'op:pst:00001719', nama: 'Procontarinia sp.',
    key: 'puru-daun-mangga', label: 'Puru daun mangga',
    inang: [MANGGA],
    definition:
      'Menyerang daun MUDA saja — begitu daun mengeras ia tidak bisa masuk lagi — sehingga jendelanya persis saat pohon bertunas, beberapa minggu setelah pemangkasan atau setelah hujan pertama. Menyemprot di luar masa bertunas tidak menolong apa pun. Larvanya keluar dari puru dan menjatuhkan diri ke tanah untuk jadi kepompong, jadi tanah di bawah tajuk bagian dari daurnya.',
    gejala:
      'Daun muda bertaburan BENJOL bulat sebesar kepala jarum yang menonjol di kedua permukaan, mula-mula hijau kekuningan lalu menghitam berlubang di tengah setelah larvanya keluar. Daun yang purunya rapat terpuntir, mengering di ujung, dan gugur; tunas baru jadi pendek dan tidak beraturan.',
    pembanding: [
      { cek: 'Belah satu benjol yang masih hijau. Puru daun mangga berisi belatung kecil putih di rongga di dalamnya; benjol yang berisi jaringan padat tanpa rongga bukan ini.' },
      { cek: 'Lihat umur daun yang berpuru. Puru daun hanya terbentuk pada daun MUDA saat pohon bertunas; kerusakan yang muncul pada daun tua yang sudah mengeras penyebabnya lain.' },
    ],
  },
  {
    id: 'op:pst:00000169', dari: 'op:pst:00001720', nama: 'Noorda albizonalis',
    key: 'penggerek-buah-mangga', label: 'Penggerek buah mangga',
    inang: [MANGGA],
    definition:
      'Menggerek buah dari UJUNG, dan itu yang membedakannya dari lalat buah yang menusuk di mana saja. Buah yang tergerek tidak bisa diselamatkan, jadi seluruh nilainya ada pada pencegahan: membungkus buah sejak sebesar telur ayam menghentikannya sepenuhnya tanpa bahan apa pun, dan itu tindakan yang sudah lazim di sentra mangga.',
    gejala:
      'Buah berlubang di bagian UJUNG (bagian yang jauh dari tangkai) dengan kotoran coklat basah keluar dari lubangnya, dan di sekitarnya getah mengering. Buah yang dibelah berisi ulat kemerahan di rongga dekat biji. Buah yang terserang gugur sebelum tua.',
    pembanding: [
      { cek: 'Lihat DI MANA lubangnya. Penggerek buah mangga masuk dari ujung buah dan mengeluarkan kotoran basah dari lubang itu; lalat buah menusuk sebesar ujung jarum di mana saja dan tidak mengeluarkan kotoran.',
        membantah: { id: 'op:pst:00000004', label: 'Lalat buah' } },
      { cek: 'Belah buah yang gugur. Penggerek buah mangga meninggalkan satu ulat kemerahan di rongga dekat biji; lalat buah meninggalkan banyak belatung putih kecil di daging buah yang membusuk lunak.',
        membantah: { id: 'op:pst:00000004', label: 'Lalat buah' } },
    ],
  },
  {
    id: 'op:pst:00000170', dari: 'op:pst:00001518', nama: 'Penyakit Bercak Daun',
    key: 'bercak-daun-phyllosticta', label: 'Bercak daun phyllosticta',
    inang: [MANGGA],
    definition:
      'Penyakit daun yang jarang menentukan hasil sendirian — yang membuatnya penting kebun yang tajuknya sudah menipis karena hal lain, karena daun yang gugur berulang menurunkan pembungaan musim berikutnya. Menumpuk pada kebun rapat yang lembap dan pada pohon yang lama tidak dipangkas. Bertahan pada daun gugur di bawah tajuk.',
    gejala:
      'Bercak BULAT pada daun tua, tengahnya kelabu keputihan bertaburan titik hitam kecil dan tepinya coklat tua berbatas tegas seperti digambar. Bercak yang berdekatan menyatu jadi bidang kering; daun tua menguning lalu gugur sementara daun muda masih bersih.',
    pembanding: [
      { cek: 'Lihat titik hitam di TENGAH bercak dengan cermat. Bercak phyllosticta menaburkannya tidak beraturan di bagian kelabu; antraknosa menyusunnya MELINGKAR sepusat, dan itu pembeda yang paling mudah dilihat.',
        membantah: { id: 'op:pst:00000103', label: 'Antraknosa mangga' } },
      { cek: 'Periksa apakah buah dan tangkai bunga ikut bergejala. Bercak phyllosticta berhenti di daun; antraknosa mangga menghitamkan tangkai bunga dan memberi bercak cekung pada buah, dan itu yang menentukan kerugiannya.',
        membantah: { id: 'op:pst:00000103', label: 'Antraknosa mangga' } },
    ],
  },
  {
    id: 'op:pst:00000171', dari: 'op:pst:00001797', nama: 'Kutu Sisik',
    key: 'kutu-sisik-koma', label: 'Kutu sisik koma',
    inang: [JERUK, APEL],
    definition:
      'Menempel dan tidak berpindah lagi seumur hidupnya, dan perisai lilin di atasnya menahan semprotan — jadi satu-satunya saat penyemprotan berarti ketika anakannya masih merayap, sebelum perisainya terbentuk. Di luar jendela itu yang bekerja minyak yang menyelimuti, bukan racun yang menembus. Semut yang naik-turun batang mengusir musuh alaminya.',
    gejala:
      'Sisik kecil coklat berbentuk KOMA atau tanda kutip sepanjang dua sampai tiga milimeter menempel rapat pada kulit ranting, tangkai daun, dan kulit buah, sering bertumpuk sampai kulitnya terlihat berkerak. Ranting yang tertutup rapat mengering dari ujung; buah yang bersisik tetap keras tetapi tidak laku.',
    pembanding: [
      { cek: 'Perhatikan BENTUK sisiknya. Kutu sisik koma memanjang melengkung seperti tanda koma; kutu sisik merah bundar seperti tetesan lilin dengan titik di tengah.',
        membantah: { id: 'op:pst:00000087', label: 'Kutu sisik merah' } },
      { cek: 'Congkel satu sisik dengan kuku. Kutu sisik meninggalkan perisai keras yang terlepas dan menyisakan tubuh lunak di bawahnya; kutu putih tidak berperisai keras — ia berlapis lilin seperti kapas yang hancur bila ditekan.',
        membantah: { id: 'op:pst:00000070', label: 'Kutu putih' } },
    ],
  },
  {
    id: 'op:pst:00000172', dari: 'op:pst:00002343', nama: 'Hama Lalat Buat',
    key: 'lalat-buah-cucurbit', label: 'Lalat buah cucurbit',
    inang: [SEMANGKA, MELON, MENTIMUN],
    definition:
      'Lalat buah yang khusus labu-labuan, dan berbeda dari lalat buah oriental ia menyerang buah yang masih SANGAT MUDA — sering sebelum sebesar telur — sehingga buah gugur tanpa pernah terlihat bertusukan. Karena itu petak yang buahnya "tidak jadi" berulang kali perlu diperiksa untuk ini sebelum disimpulkan sebagai masalah penyerbukan.',
    gejala:
      'Buah muda menguning lalu gugur, dan bila dibelah berisi belatung putih di daging yang membusuk lunak berbau. Pada buah yang lebih tua terlihat tusukan sebesar ujung jarum dengan getah mengering di sekitarnya. Lalat bersayap bening bertanda gelap hinggap di daun pada pagi hari.',
    pembanding: [
      { cek: 'Belah buah muda yang gugur. Lalat buah cucurbit meninggalkan belatung putih di dalamnya; buah muda yang gugur tanpa belatung dan tanpa bekas tusukan biasanya gagal diserbuki, dan menyemprot tidak akan mengubah apa pun.' },
      { cek: 'Lihat pada UMUR buah berapa kerugiannya terjadi. Lalat buah cucurbit menyerang buah yang masih sangat muda; kerusakan yang baru muncul pada buah tua menjelang panen lebih mungkin lalat buah oriental atau busuk buah.',
        membantah: { id: 'op:pst:00000004', label: 'Lalat buah' } },
    ],
  },
  {
    id: 'op:pst:00000173', dari: 'op:pst:00002060', nama: 'Penyakit Pokkah Boeng',
    key: 'pokkah-boeng', label: 'Pokkah boeng',
    inang: [TEBU],
    definition:
      'Menyerang lewat DAUN MUDA yang masih menggulung di pucuk, bukan lewat akar maupun luka batang, dan itu sebabnya gejalanya muncul serentak sesudah hujan pada tanaman muda. Sebagian besar tanaman pulih sendiri begitu cuaca berubah — yang tidak pulih hanya yang pucuknya telanjur membusuk, dan itu jumlahnya kecil. Menyemprot seluruh kebun karena gejala daun sering ongkos tanpa balasan.',
    gejala:
      'Daun muda di pucuk MENGKERUT dan terpuntir dengan pangkal helai berwarna kuning pucat keputihan, tepinya bergerigi seperti robek, dan pelepah yang membuka lebih pendek daripada yang lain. Pada serangan berat pucuk membusuk berbau dan mudah dicabut; batang di bawahnya bisa berlekuk seperti tangga.',
    pembanding: [
      { cek: 'Tarik pucuk yang terpuntir. Pokkah boeng membuat pucuk membusuk basah berbau dan mudah lepas TANPA lubang gerekan; penggerek pucuk tebu meninggalkan lubang dan lorong berisi kotoran di dalam batangnya.',
        membantah: { id: 'op:pst:00000112', label: 'Penggerek pucuk tebu' } },
      { cek: 'Lihat pangkal helai daun mudanya. Pokkah boeng memucatkan pangkal helai jadi kuning keputihan sementara ujungnya masih hijau — pola yang khas dan tidak diberikan penggerek mana pun.' },
    ],
  },
  {
    id: 'op:pst:00000174', dari: 'op:pst:00001900', nama: 'Bubuk Buah',
    key: 'bubuk-buah-lada', label: 'Bubuk buah lada',
    inang: [LADA],
    definition:
      'Menggerek buah DAN ruas batang, sehingga kerugiannya dua lapis: buah yang gugur pada musim ini, dan sulur yang mati pada musim berikutnya. Karena larvanya di dalam jaringan, penyemprotan hanya mengenai kumbang dewasa yang keluar — jadi waktunya menentukan, dan memungut buah gugur serta memotong sulur yang berlubang memutus daurnya lebih pasti.',
    gejala:
      'Buah pada dompolan berlubang BUNDAR sebesar ujung jarum dengan serbuk halus di sekitar lubang, menghitam lalu gugur sehingga dompolan menjadi jarang. Ruas batang dan sulur juga berlubang; sulur di atas lubang layu dan mengering sementara bagian bawahnya masih hijau.',
    pembanding: [
      { cek: 'Cari SERBUK halus seperti bubuk gergaji di sekitar lubang pada buah atau ruas. Bubuk buah lada meninggalkannya karena menggerek dari dalam; pengisap buah lada menusuk dari luar dan tidak meninggalkan serbuk maupun lubang bundar.',
        membantah: { id: 'op:pst:00000116', label: 'Pengisap buah lada' } },
      { cek: 'Periksa apakah RUAS BATANG ikut berlubang, bukan cuma buahnya. Bubuk buah lada menggerek keduanya, dan sulur yang mati di atas lubang gerekan tanda yang paling menentukan.' },
    ],
  },
  {
    id: 'op:pst:00000175', dari: 'op:pst:00001861', nama: 'Ulat Penggulung Pucuk',
    key: 'penggulung-pucuk-teh', label: 'Penggulung pucuk teh',
    inang: [TEH],
    definition:
      'Menyerang PUCUK — bagian yang justru dipetik — sehingga kerugiannya langsung terlihat pada hasil petikan, bukan pada pertumbuhan pohon. Bersembunyi di dalam gulungan daun, jadi semprotan kontak sulit menjangkaunya dan waktunya harus mengenai ulat yang baru menetas sebelum menggulung. Menumpuk sesudah pemangkasan, saat pucuk baru keluar serempak.',
    gejala:
      'Daun pucuk MENGGULUNG memanjang dan terikat benang sutera, dan di dalam gulungan ada ulat hijau kecoklatan beserta kotoran hitam halus. Bagian dalam gulungan tergerus sehingga daun yang dibuka berlubang tidak beraturan; pucuk yang terserang tidak layak petik.',
    pembanding: [
      { cek: 'Buka gulungan pucuknya. Penggulung pucuk teh meninggalkan ulat dan kotoran hitam DI DALAM gulungan yang terikat benang; daun yang menggulung karena kekeringan atau tungau tidak berbenang dan tidak berisi apa pun.' },
      { cek: 'Periksa permukaan bawah daun yang tidak menggulung. Kalau di sana ada bercak seperti karat dan daun terasa kasar berdebu, yang sedang berjalan tungau jingga dan bukan ini.',
        membantah: { id: 'op:pst:00000102', label: 'Tungau jingga' } },
    ],
  },
  {
    id: 'op:pst:00000176', dari: 'op:pst:00002058', nama: 'Penyakit Busuk Batang',
    key: 'busuk-pangkal-batang-sklerotium', label: 'Busuk pangkal batang sklerotium',
    inang: [KEDELAI, KACANG_TANAH],
    definition:
      'Hidup di TANAH dan bertahan bertahun-tahun sebagai butiran keras sebesar biji sawi, sehingga petak yang pernah terserang tetap berisiko walau tanamannya diganti. Menumpuk pada tanah yang banyak sisa tanaman belum lapuk dan pada cuaca panas lembap. Fungisida tajuk tidak menjangkaunya; yang menentukan pergiliran tanaman, pembenaman sisa tanaman, dan drainase.',
    gejala:
      'Tanaman layu mendadak dan mati satu-satu di antara tanaman sehat, dan pada pangkal batang tepat di batas tanah ada lapisan benang PUTIH seperti kapas yang menjalar ke tanah di sekitarnya. Di atas lapisan itu muncul butiran bulat keras sebesar biji sawi, mula-mula putih lalu coklat kemerahan.',
    pembanding: [
      { cek: 'Cari BUTIRAN bulat keras seperti biji sawi pada benang putih di pangkal batang. Tidak ada penyakit pangkal batang lain yang membentuknya, dan sekali terlihat tidak perlu diperiksa lagi.' },
      { cek: 'Belah batang di atas pangkal yang membusuk. Busuk sklerotium menyerang dari LUAR ke dalam dan pembuluh di atasnya masih putih; layu fusarium mencoklatkan pembuluh jauh ke atas batang tanpa benang putih di pangkalnya.',
        membantah: { id: 'op:pst:00000008', label: 'Layu fusarium' } },
    ],
  },
];

const PINTU_EKOR5 = [
  {
    // Satu-satunya pintu yang TIDAK dinaikkan dari entri registri, dan sebabnya
    // menentukan. Registri menulis satu entitas "Xanthomonas campestris" telanjang tanpa
    // patovar untuk DUA penyakit yang tidak punya kemiripan apa pun: pv. oryzae pada padi
    // (hawar daun bakteri) dan pv. campestris pada kubis (busuk hitam). Entitas itu sudah
    // dicakup pintu hawar daun bakteri padi, dan menaikkannya jadi pintu kubis akan
    // mencabut tujuh baris padi. Jadi pintu ini berdiri sendiri dan MENCAKUP entitas yang
    // sama dari sisi kubis — saringan inang yang memisahkan keduanya, dan pemisahan itu
    // dinyatakan di kedua dasarnya.
    id: 'op:pst:00000177',
    key: 'busuk-hitam-kubis', label: 'Busuk hitam kubis',
    pest_kind: 'disease_bacterial', scientific_name: 'Xanthomonas campestris pv. campestris',
    taxonomic_rank: 'species',
    no_mapping_reason:
      'Registri tidak memuat patovarnya: yang ada satu entitas "Xanthomonas campestris" telanjang yang dipakai untuk hawar daun bakteri padi sekaligus busuk hitam kubis. Menautkan pintu ini ke entitas itu berarti mengklaim keduanya penyakit yang sama; ia dicakup lewat `covers` dari sisi kubis saja.',
    inang: [KUBIS, SAWI, KUBIS_BUNGA],
    definition:
      'Masuk lewat MULUT AIR di tepi daun dan lewat luka, bukan lewat akar, sehingga hujan berangin dan pekerjaan tangan di kebun basah yang menyebarkannya. Terbawa BENIH, dan itu jalur masuknya ke petak yang belum pernah terserang — perlakuan benih air panas lebih menentukan daripada penyemprotan sesudahnya. Bakteri: fungisida tidak menyentuhnya, dan bakterisida tembaga hanya menahan, tidak menyembuhkan.',
    gejala:
      'Bercak kuning berbentuk HURUF V yang pangkalnya di TEPI daun dan ujungnya menunjuk ke tengah, dan di dalamnya tulang daun MENGHITAM sehingga terlihat seperti jala hitam bila daun diterawang. Daun yang terkena mengering dari tepi; pada serangan berat batang yang dipotong memperlihatkan cincin pembuluh yang menghitam.',
    pembanding: [
      { cek: 'Terawang daun yang menguning ke arah cahaya dan lihat tulang daunnya. Busuk hitam MENGHITAMKAN tulang daun di dalam bercak berbentuk V dari tepi; bercak daun alternaria memberi bercak bulat bercincin sepusat dan tidak menyentuh tulang daun.',
        membantah: { id: 'op:pst:00000053', label: 'Bercak daun alternaria' } },
      { cek: 'Potong batang dan lihat penampangnya. Busuk hitam meninggalkan cincin pembuluh yang menghitam sementara jaringan di sekitarnya masih padat; busuk lunak melunakkan seluruh jaringan jadi bubur berbau busuk.',
        membantah: { id: 'op:pst:00000054', label: 'Busuk lunak' } },
    ],
  },
  {
    id: 'op:pst:00000178', dari: 'op:pst:00002000', nama: 'Hama Trips',
    key: 'trips-buah', label: 'Trips buah',
    inang: [JERUK, APEL, CENGKEH],
    definition:
      'Merusak KULIT buah, bukan daunnya, dan kerusakan itu tidak menular ke dalam: buahnya tetap layak dimakan tetapi tidak layak dijual. Karena itu keputusannya soal harga, bukan soal panen. Menyerang pada jendela yang sempit — sejak kelopak bunga rontok sampai buah sebesar kelereng — dan sesudah itu kulitnya sudah terlalu tebal untuk ditembus.',
    gejala:
      'Buah muda bercincin atau berbercak KERAK KEPERAKAN sampai kecoklatan seperti tergores halus, paling sering melingkar di sekitar bekas kelopak, dan bekasnya ikut membesar bersama buah sehingga terlihat makin jelas menjelang panen. Daun muda menebal, tepinya melengkung ke atas, dan permukaan bawahnya keperakan.',
    pembanding: [
      { cek: 'Lihat DI MANA kerak keperakannya berada pada buah. Trips buah meninggalkannya melingkar di sekitar bekas kelopak dan pada permukaan yang bersentuhan dengan daun atau buah lain; kudis jeruk menonjol berkerak kasar dan tersebar di mana saja.',
        membantah: { id: 'op:pst:00000179', label: 'Kudis jeruk' } },
      { cek: 'Raba bekasnya. Trips buah menyisakan permukaan yang RATA atau sedikit kasar tetapi tidak menonjol; kudis dan kanker menonjol dan terasa seperti amplas kasar.' },
    ],
  },
  {
    id: 'op:pst:00000179', dari: 'op:pst:00002335', nama: 'Elsinoe fawcettii',
    key: 'kudis-jeruk', label: 'Kudis jeruk',
    inang: [JERUK],
    definition:
      'Menyerang jaringan MUDA saja — daun yang baru membuka, tunas, dan buah sebelum sebesar kelereng — dan berhenti begitu jaringannya mengeras. Jadi jendela penyemprotannya persis saat pohon bertunas dan sesudah bunga rontok; di luar itu ongkos tanpa balasan. Menumpuk pada musim hujan dan pada kebun yang embunnya lama bertahan.',
    gejala:
      'Bintil MENONJOL berkerak kasar seperti gabus pada daun, tunas, dan kulit buah, mula-mula kuning jernih lalu coklat keabuan, dan bila diraba terasa seperti amplas. Daun muda yang berbintil rapat terpuntir dan bergelombang; buah yang terkena tetap keras dan tidak membusuk, tetapi kulitnya kasar sehingga tidak laku.',
    pembanding: [
      { cek: 'Raba bintilnya dan tekan. Kudis jeruk MENONJOL kasar seperti gabus dan tidak pecah; kanker jeruk juga menonjol tetapi tengahnya cekung berlubang dengan tepi kuning berair di sekelilingnya.',
        membantah: { id: 'op:pst:00000086', label: 'Kanker jeruk' } },
      { cek: 'Lihat umur bagian yang terkena. Kudis jeruk hanya membentuk bintil pada jaringan MUDA; bercak yang baru muncul pada daun tua yang sudah mengeras penyebabnya bukan ini.' },
    ],
  },
  {
    id: 'op:pst:00000180', dari: 'op:pst:00002175', nama: 'Penyakit Kulit',
    key: 'busuk-kulit-batang-jeruk', label: 'Busuk kulit batang jeruk',
    inang: [JERUK],
    definition:
      'Masuk lewat LUKA — bekas pangkas, bekas sambung, retak kulit karena panas, dan lubang gerekan — dan hampir tidak pernah menembus kulit yang utuh. Karena itu ia penyakit pekerjaan kebun: memangkas dengan alat bersih pada cuaca kering, dan menutup luka pangkas besar, menutup jalannya. Pohon yang sudah dilingkari batangnya tidak bisa diselamatkan.',
    gejala:
      'Kulit batang atau cabang mengering dan MENGELUPAS dalam lembaran, di bawahnya jaringan mencoklat kering dan berbatas jelas dengan kulit sehat. Pada tepi bagian yang mati muncul titik-titik hitam kecil menonjol. Daun di atas bagian yang terkena menguning lalu rontok, dan cabangnya mati dari ujung ke pangkal.',
    pembanding: [
      { cek: 'Tekan kulit yang bergejala. Busuk kulit batang mengering dan MENGELUPAS tanpa mengeluarkan apa pun; blendok mengeluarkan getah kental yang mengalir dan mengering seperti damar di permukaan kulit.',
        membantah: { id: 'op:pst:00000085', label: 'Blendok' } },
      { cek: 'Lihat apakah ada LUKA di batas bagian yang mati — bekas pangkas, sambungan, atau lubang gerekan. Busuk kulit batang hampir selalu bermula dari sana; kematian cabang tanpa luka apa pun penyebabnya lebih mungkin akar atau pembuluh.' },
    ],
  },
  {
    id: 'op:pst:00000181', dari: 'op:pst:00002085', nama: 'Penyakit Layu Stewart',
    key: 'layu-stewart', label: 'Layu Stewart',
    inang: [JAGUNG],
    definition:
      'DITULARKAN KUMBANG — kumbang loncat jagung memindahkannya saat makan, dan bakterinya bertahan di dalam kumbang yang berhibernasi — sehingga menyemprot tanaman yang sudah layu tidak memulihkan apa pun. Yang menentukan menahan kumbangnya pada bulan pertama dan memakai benih yang bebas, karena ia juga terbawa benih. Termasuk penyakit yang diawasi lalu lintas benihnya antarnegara.',
    gejala:
      'Garis KUNING PUCAT memanjang sejajar tulang daun dengan tepi bergelombang, sering bermula dari bekas luka makan kumbang, lalu meluas sehingga daun mengering. Tanaman muda yang terinfeksi layu dan kerdil; batang yang dipotong mengeluarkan lendir kuning bila ditekan.',
    pembanding: [
      { cek: 'Potong batang dan TEKAN penampangnya. Layu Stewart mengeluarkan lendir kuning keruh dari berkas pembuluh; bulai tidak mengeluarkan lendir apa pun dan tepungnya justru di permukaan bawah daun pada pagi berembun.',
        membantah: { id: 'op:pst:00000043', label: 'Bulai' } },
      { cek: 'Lihat tepi garis kuningnya. Layu Stewart memberi garis bertepi BERGELOMBANG yang sering bermula dari bekas luka makan kumbang; bulai memberi garis bertepi lurus yang bermula dari pangkal daun.',
        membantah: { id: 'op:pst:00000043', label: 'Bulai' } },
    ],
  },
  {
    id: 'op:pst:00000182', dari: 'op:pst:00001872', nama: 'Penyakit Karat',
    key: 'karat-putih-krisan', label: 'Karat putih krisan',
    inang: [KRISAN],
    definition:
      'Berbeda dari karat krisan yang cokelat: yang ini termasuk penyakit yang diawasi lalu lintas tanamannya, dan sekali masuk ke rumah lindung ia bertahan pada tunas yang disimpan untuk stek. Karena itu yang menentukan bukan penyemprotan melainkan asal-usul steknya, dan membuang tanaman yang bergejala beserta steknya lebih murah daripada menahannya semusim. Menumpuk pada kelembapan tinggi dengan suhu sejuk.',
    gejala:
      'Bintil PUTIH sampai merah jambu pucat menonjol di permukaan BAWAH daun, dan tepat di atasnya bercak kuning pucat yang terlihat dari permukaan atas. Bintilnya berubah coklat muda saat tua tetapi tidak pernah berwarna karat. Daun yang bintilnya rapat mengering dan menggantung tanpa gugur.',
    pembanding: [
      { cek: 'Lihat WARNA bintil di permukaan bawah daun. Karat putih memberi bintil putih sampai merah jambu pucat; karat krisan yang biasa memberi bintil coklat kemerahan yang meninggalkan bubuk warna karat bila diusap.',
        membantah: { id: 'op:pst:00000119', label: 'Karat krisan' } },
      { cek: 'Usap bintilnya. Karat putih tidak menaburkan bubuk berwarna karat di jari; kalau jarinya berwarna karat, yang sedang dilihat karat krisan biasa.',
        membantah: { id: 'op:pst:00000119', label: 'Karat krisan' } },
    ],
  },
  {
    id: 'op:pst:00000183', dari: 'op:pst:00002314', nama: 'Penyakit Embun Tepung',
    key: 'embun-tepung-krisan', label: 'Embun tepung krisan',
    inang: [KRISAN],
    definition:
      'Menumpuk justru pada cuaca KERING dengan malam lembap — kebalikan dari kebanyakan penyakit jamur — sehingga menyiram lebih banyak tidak menolong dan sering memperburuk lewat kelembapan malam. Yang menentukan jarak tanam dan aliran udara di rumah lindung. Merusak nilai bunga potong walau tanamannya tidak mati.',
    gejala:
      'Lapisan PUTIH seperti bedak di permukaan ATAS daun dan pada tangkai serta kelopak bunga, mula-mula berbercak lalu menyatu menutupi helai. Daun di bawahnya menguning lalu mengering; kuncup yang tertutup tepung tidak membuka sempurna.',
    pembanding: [
      { cek: 'Usap tepung putihnya dengan jari. Embun tepung terangkat seperti bedak dan menyisakan daun yang masih hijau kekuningan di bawahnya; karat memberi bintil MENONJOL yang tidak bisa diusap.',
        membantah: { id: 'op:pst:00000119', label: 'Karat krisan' } },
      { cek: 'Lihat di permukaan mana tepungnya. Embun tepung krisan memutih di permukaan ATAS daun; karat putih justru membentuk bintilnya di permukaan bawah.',
        membantah: { id: 'op:pst:00000182', label: 'Karat putih krisan' } },
    ],
  },
  {
    id: 'op:pst:00000184', dari: 'op:pst:00001768', nama: 'Penyakit Embun Tepung',
    key: 'embun-tepung-tembakau', label: 'Embun tepung tembakau',
    inang: [TEMBAKAU],
    definition:
      'Menyerang daun TUA di bagian bawah lebih dulu — daun yang justru dipetik pertama dan bermutu paling tinggi — sehingga kerugiannya jatuh pada bagian yang paling bernilai. Menumpuk pada akhir musim saat malam lembap dan siang kering, dan pada pertanaman yang rapat. Daun yang terkena tetap bisa dipetik tetapi mutunya turun karena bercaknya tetap terlihat sesudah dikeringkan.',
    gejala:
      'Lapisan PUTIH keabuan seperti bedak berbercak di permukaan ATAS daun bawah, meluas menyatu sampai menutupi helai, dan di bawahnya jaringan menguning lalu mencoklat. Menyebar ke atas daun demi daun; daun yang parah mengering dan menggantung.',
    pembanding: [
      { cek: 'Usap lapisan putihnya. Embun tepung terangkat seperti bedak; patik daun memberi bercak bulat kering bertepi tegas yang tidak bisa diusap dan sering berlubang di tengah.',
        membantah: { id: 'op:pst:00000099', label: 'Patik daun' } },
      { cek: 'Lihat dari daun mana ia bermula. Embun tepung tembakau bermula dari daun TUA di bawah dan naik; kerusakan yang bermula di pucuk penyebabnya bukan ini.' },
    ],
  },
  {
    id: 'op:pst:00000185', dari: 'op:pst:00001836', nama: 'Penyakit Embun Tepung',
    key: 'embun-tepung-karet', label: 'Embun tepung karet',
    inang: [KARET],
    definition:
      'Menyerang HANYA daun muda yang baru membuka sesudah gugur daun tahunan, dan jendelanya karena itu bisa diramalkan: beberapa minggu sekali setahun, saat kebun bertunas serempak. Daun yang gugur karenanya diganti tanaman dengan tunas kedua, dan itu yang memakan cadangan makanan sehingga hasil sadapan turun beberapa bulan sesudahnya. Pengasapan belerang saat bertunas dipakai justru karena jendelanya sempit dan pasti.',
    gejala:
      'Daun MUDA yang baru membuka tertutup lapisan putih keabuan seperti bedak, terpuntir dan berkerut, lalu gugur berjatuhan sehingga tanah di bawah tajuk tertutup daun muda. Tangkai daun yang tertinggal di ranting rontok belakangan; kebun terlihat botak untuk kedua kalinya dalam satu musim bertunas.',
    pembanding: [
      { cek: 'Lihat UMUR daun yang gugur. Embun tepung karet hanya menggugurkan daun muda yang baru membuka dan berlapis tepung putih; gugur daun yang mengenai daun tua berbercak bulat penyebabnya lain.',
        membantah: { id: 'op:pst:00000160', label: 'Gugur daun karet' } },
      { cek: 'Ingat waktunya terhadap gugur daun tahunan. Embun tepung karet muncul TEPAT saat kebun bertunas serempak sesudah gugur daun; di luar jendela itu ia tidak ada.' },
    ],
  },
  {
    id: 'op:pst:00000186', dari: 'op:pst:00002112', nama: 'Penggerek Batang',
    key: 'penggerek-batang-kakao', label: 'Penggerek batang kakao',
    inang: [KAKAO, KOPI],
    definition:
      'Menggerek ke dalam KAYU, dan sekali larvanya di dalam tidak ada semprotan yang menjangkaunya — yang bekerja hanya menyumbat lubangnya atau memotong cabang di bawah gerekan. Karena itu seluruh nilainya ada pada menemukan lubangnya lebih awal, dan tanda yang paling mudah dilihat justru kotoran yang menggantung di bawah lubang. Menyerang cabang dan batang muda berdiameter jari sampai lengan.',
    gejala:
      'Lubang BUNDAR sebesar pensil pada batang atau cabang, dan di bawahnya menggantung kotoran serbuk kayu berwarna kemerahan yang terikat benang, sering menumpuk di pangkal pohon. Cabang di atas lubang layu, daunnya menguning lalu mengering, dan cabang itu mudah patah saat tertiup angin.',
    pembanding: [
      { cek: 'Cari LUBANG BUNDAR pada batang beserta kotoran serbuk kayu yang menggantung di bawahnya. Penggerek batang kakao meninggalkan keduanya; mati ranting VSD tidak melubangi apa pun dan bekasnya justru di bekas daun yang gugur.',
        membantah: { id: 'op:pst:00000066', label: 'Mati ranting VSD' } },
      { cek: 'Potong cabang yang layu tepat di bawah lubang dan belah. Penggerek batang meninggalkan lorong memanjang di dalam kayu; kayu yang utuh tetapi bergaris coklat di berkas pembuluh penyebabnya VSD.',
        membantah: { id: 'op:pst:00000066', label: 'Mati ranting VSD' } },
    ],
  },
  {
    id: 'op:pst:00000187', dari: 'op:pst:00002173', nama: 'Kutu Daun',
    key: 'kutu-perisai-kelapa', label: 'Kutu perisai kelapa',
    inang: [KELAPA, SAWIT],
    definition:
      'Menempel di permukaan BAWAH anak daun dan tidak berpindah lagi, dengan perisai lilin tipis yang menahan semprotan — jadi yang bekerja minyak yang menyelimuti, bukan racun yang menembus, dan waktunya harus mengenai anakan yang masih merayap. Pada kebun yang musuh alaminya utuh ia jarang jadi masalah; ledakan hampir selalu menyusul penyemprotan berspektrum luas yang menghabiskan kumbang pemangsanya.',
    gejala:
      'Anak daun bertaburan sisik BULAT PIPIH bening kekuningan seukuran kepala jarum di permukaan BAWAH, rapat sampai terlihat seperti taburan lilin. Di permukaan atas tepat di baliknya muncul bercak kuning yang menyatu, dan anak daun mengering dari ujung; pelepah tua terlihat menguning menyeluruh.',
    pembanding: [
      { cek: 'Balik anak daun dan congkel satu sisik dengan kuku. Kutu perisai meninggalkan perisai bening yang terlepas dengan tubuh lunak kekuningan di bawahnya; tungau tidak berperisai dan bergerak saat diamati.' },
      { cek: 'Lihat apakah bercak kuning di permukaan ATAS berpasangan tepat dengan sisik di baliknya. Kutu perisai membuat pasangan itu; daun yang menguning merata tanpa sisik di baliknya penyebabnya hara atau akar.' },
    ],
  },
  {
    id: 'op:pst:00000188', dari: 'op:pst:00001701', nama: 'Penyakit Busuk Putih Mati Pucuk',
    key: 'busuk-putih-bawang', label: 'Busuk putih bawang',
    inang: [BAWANG_MERAH, BAWANG_PUTIH],
    definition:
      'Oomycete — bukan jamur sejati — sehingga yang bekerja metalaksil atau dimetomorf, dan fungisida untuk jamur sejati tidak menyentuhnya. Menumpuk pada bedengan yang airnya menggenang dan pada musim hujan dengan suhu sejuk; memperbaiki drainase dan meninggikan bedengan menahannya lebih pasti daripada menambah semprotan. Bertahan di tanah, jadi petak yang pernah terserang tetap berisiko.',
    gejala:
      'Pucuk daun MEMUTIH lalu mengering dari ujung ke bawah sementara pangkalnya masih hijau, dan daun yang mati rebah menggantung. Pada pangkal umbi dan leher terdapat lapisan putih berair yang lunak bila ditekan, dan umbi yang dibelah membusuk basah tanpa bau menyengat.',
    pembanding: [
      { cek: 'Tekan pangkal umbi dan cium. Busuk putih melunakkan jaringannya jadi berair TANPA bau menyengat; busuk lunak bakteri melunakkannya jadi bubur dengan bau busuk yang tajam.',
        membantah: { id: 'op:pst:00000054', label: 'Busuk lunak' } },
      { cek: 'Lihat dari mana matinya bermula pada daun. Busuk putih memutihkan dan mengeringkan dari UJUNG ke bawah; bercak ungu memberi bercak lonjong keunguan bercincin di tengah helai daun lebih dulu.',
        membantah: { id: 'op:pst:00000015', label: 'Bercak ungu' } },
    ],
  },
  {
    id: 'op:pst:00000189', dari: 'op:pst:00001715', nama: 'Tetranychus piercei',
    key: 'tungau-sawit', label: 'Tungau sawit',
    inang: [SAWIT],
    definition:
      'Masalah PEMBIBITAN dan tanaman muda, hampir tidak pernah pada tanaman menghasilkan: bibit di polibag yang kekurangan air dan berdebu paling rentan, dan menyiram dengan cukup serta menyemprot air ke tajuk sering sudah menghentikannya. Bukan serangga, jadi insektisida umum tidak menyentuhnya dan justru menghabiskan tungau pemangsa yang menahannya.',
    gejala:
      'Anak daun kusam berbintik KEPERAKAN sangat halus yang menyatu jadi bidang keperakan lalu kecoklatan, paling parah di permukaan bawah dan di sepanjang tulang tengah. Pada serangan berat ada anyaman benang halus di antara anak daun, dan tungau merah kecil terlihat bila daun ditepuk di atas kertas putih.',
    pembanding: [
      { cek: 'Tepuk anak daun di atas kertas putih dan amati beberapa detik. Tungau terlihat sebagai titik merah yang BERGERAK; debu atau bintik penyakit tidak bergerak.' },
      { cek: 'Lihat apakah ada ANYAMAN benang halus di antara anak daun, terutama di permukaan bawah. Tungau meninggalkannya pada serangan berat; bercak daun bibit sawit memberi bercak bulat bercincin tanpa benang apa pun.',
        membantah: { id: 'op:pst:00000077', label: 'Bercak daun bibit sawit' } },
    ],
  },
];

const PINTU_EKOR6 = [
  {
    id: 'op:pst:00000190', dari: 'op:pst:00001619', nama: 'Penyakit Bercak Daun',
    key: 'bercak-daun-pestalotiopsis-sawit', label: 'Bercak daun pestalotiopsis bibit sawit',
    inang: [SAWIT_BIBIT],
    definition:
      'Masuk lewat LUKA dan lewat daun yang lama basah, jadi ia hampir selalu menyusul sesuatu yang lain: bibit yang tergores saat dipindah, disiram dari atas menjelang sore, atau ditaruh terlalu rapat sehingga daunnya bersentuhan. Membenahi jarak polibag dan waktu penyiraman menurunkannya lebih banyak daripada menambah semprotan. Bibit yang sepertiga daunnya bergejala tidak layak ditanam ke lapangan.',
    gejala:
      'Bercak lonjong pada anak daun, tengahnya KELABU KEPUTIHAN kering dan tepinya coklat tua bergaris kuning di luarnya, sering bermula dari UJUNG atau tepi daun yang terluka. Bercak yang berdekatan menyatu jadi bidang kering yang luas; pada bagian yang mati muncul titik hitam kecil bertaburan.',
    pembanding: [
      { cek: 'Lihat DI MANA bercaknya bermula. Bercak pestalotiopsis bermula dari ujung atau tepi anak daun yang terluka lalu menjalar ke dalam; bercak daun bibit sawit yang lain bermula sebagai bintik bulat di tengah helai dan melebar melingkar.',
        membantah: { id: 'op:pst:00000077', label: 'Bercak daun bibit sawit' } },
      { cek: 'Periksa pangkal pelepah dan pucuknya. Bercak pestalotiopsis berhenti di helai daun; kalau pucuknya ikut membusuk dan berbau, yang sedang berjalan busuk pucuk dan itu jauh lebih menentukan.',
        membantah: { id: 'op:pst:00000191', label: 'Busuk pucuk bibit sawit' } },
    ],
  },
  {
    id: 'op:pst:00000191', dari: 'op:pst:00002333', nama: 'Marasmius palmivorus',
    key: 'busuk-pucuk-bibit-sawit', label: 'Busuk pucuk bibit sawit',
    inang: [SAWIT_BIBIT],
    definition:
      'Jamur yang hidup dari SISA TANAMAN dan berpindah ke bibit hidup lewat benang putihnya, jadi tumpukan pelepah dan gulma lapuk di sela polibag adalah sumbernya. Membersihkan sisa itu dan menjarangkan polibag memutus jalannya. Bibit yang pucuknya sudah membusuk tidak bisa diselamatkan dan harus dibuang beserta media tanamnya supaya tidak menulari tetangganya.',
    gejala:
      'Benang jamur PUTIH seperti tali halus menjalar di permukaan media tanam, memanjat pangkal pelepah, dan mengikat sisa daun di sekitarnya. Pucuk yang dijangkaunya membusuk basah dan mudah dicabut; daun termuda menguning lalu mati sementara daun tua di bawahnya masih hijau.',
    pembanding: [
      { cek: 'Cari BENANG PUTIH yang menjalar di permukaan media tanam dan memanjat pangkal pelepah. Busuk pucuk bibit sawit meninggalkannya; bercak daun tidak menumbuhkan benang apa pun di media tanam.',
        membantah: { id: 'op:pst:00000190', label: 'Bercak daun pestalotiopsis bibit sawit' } },
      { cek: 'Tarik pucuk yang menguning. Busuk pucuk membuatnya lepas basah dan berbau; pucuk yang menguning tetapi masih melekat kuat penyebabnya hara atau air, bukan ini.' },
    ],
  },
  {
    id: 'op:pst:00000192', dari: 'op:pst:00002190', nama: 'Nematoda Parasit',
    key: 'nematoda-akar-bibit-teh', label: 'Nematoda akar bibit teh',
    inang: [TEH_BIBIT],
    definition:
      'Merusak AKAR, jadi yang terlihat di atas selalu terlambat dan selalu mirip kekurangan air atau hara — dan itu sebabnya bibit yang kerdil berulang kali dipupuk tanpa hasil. Bertahan di media tanam, sehingga tanah bekas persemaian yang dipakai ulang membawanya ke angkatan berikutnya; mengganti atau memanaskan media lebih menentukan daripada menyiram nematisida ke bibit yang sudah kerdil.',
    gejala:
      'Bibit KERDIL berpetak-petak di bedengan, daunnya kecil menguning dan gugur dari bawah walau disiram cukup, dan pertumbuhannya berhenti sementara bibit di sebelahnya normal. Akar yang dicuci terlihat PENDEK bercabang banyak dengan ujung menghitam dan sebagian luruh; tidak ada bengkakan bulat pada akarnya.',
    pembanding: [
      { cek: 'Cuci akar bibit yang kerdil dan lihat ujungnya. Nematoda akar memberi akar PENDEK berujung menghitam tanpa bengkakan; nematoda puru akar justru membentuk bengkakan bulat seperti manik pada akarnya.',
        membantah: { id: 'op:pst:00000130', label: 'Nematoda puru akar' } },
      { cek: 'Bandingkan bibit yang kerdil dengan tetangganya yang normal di bedengan yang sama. Nematoda memberi kerdil BERPETAK karena sebarannya di media tanam tidak merata; kekurangan hara membuat seluruh bedengan menguning bersamaan.' },
    ],
  },
  {
    id: 'op:pst:00000193', dari: 'op:pst:00001387', nama: 'Hama Gudang',
    key: 'kumbang-tembakau', label: 'Kumbang tembakau',
    inang: [TEMBAKAU_SIMPAN],
    definition:
      'Kumbang gudang yang paling merugikan pada tembakau karena ia melubangi DAUN — bagian yang justru dijual — sehingga kerusakannya langsung memotong harga, bukan sekadar bobot. Larvanya di dalam bal dan tidak terjangkau semprotan permukaan; yang dipakai fumigasi atau pendinginan, dan pencegahannya sanitasi gudang serta memutus sisa bal lama. Terbang dan tertarik cahaya, jadi perangkap feromon dipakai untuk mengetahui kapan populasinya naik.',
    gejala:
      'Daun tembakau dalam bal berlubang BUNDAR kecil bertaburan, dengan bubuk halus seperti debu tembakau jatuh di bawah bal. Kumbang coklat kemerahan sepanjang dua sampai tiga milimeter dengan kepala menunduk sehingga badannya terlihat membungkuk, berjalan atau terbang di sekitar tumpukan.',
    pembanding: [
      { cek: 'Lihat bentuk kumbangnya dari samping. Kumbang tembakau MEMBUNGKUK — kepalanya tertunduk di bawah dada sehingga badannya terlihat melengkung; kumbang gudang lain berbadan lurus memanjang.',
        membantah: { id: 'op:pst:00000122', label: 'Kumbang tepung' } },
      { cek: 'Periksa apakah lubangnya menembus beberapa lapis daun sekaligus. Kumbang tembakau menggerek dari lapisan luar ke dalam bal; kerusakan yang cuma di permukaan luar biasanya bekas penanganan, bukan hama.' },
    ],
  },
  {
    id: 'op:pst:00000194', dari: 'op:pst:00001213', nama: 'Penyakit Busuk Daun',
    key: 'busuk-daun-cengkeh', label: 'Busuk daun cengkeh',
    inang: [CENGKEH],
    definition:
      'Oomycete, bukan jamur sejati — jadi yang bekerja metalaksil, dimetomorf, atau tembaga, dan fungisida untuk jamur sejati tidak menyentuhnya. Menumpuk pada musim hujan panjang dan pada kebun yang tajuknya rapat sehingga daun lama basah. Percikan air dari tanah yang membawanya naik, sehingga daun paling bawah hampir selalu yang pertama.',
    gejala:
      'Bercak coklat kehitaman BERAIR pada daun, bertepi tidak tegas dan basah seperti tersiram air panas, mulai dari daun paling BAWAH dan dari ujung atau tepi helai. Daun yang terkena gugur cepat sehingga ranting bawah menggundul; pada cuaca sangat lembap tangkai dan ranting muda ikut menghitam dan mati.',
    pembanding: [
      { cek: 'Raba tepi bercaknya. Busuk daun cengkeh memberi bercak BERAIR yang tepinya tidak tegas dan terasa lunak; bercak jamur sejati kering dengan tepi tegas berbatas jelas.' },
      { cek: 'Lihat dari daun mana ia bermula. Busuk daun cengkeh bermula dari daun paling BAWAH karena percikan air dari tanah; kematian yang bermula dari pucuk dan turun penyebabnya lain — pada cengkeh yang paling sering penyakit pembuluh kayu, dan itu tidak bisa disembuhkan dengan semprotan.' },
    ],
  },
  {
    id: 'op:pst:00000195', dari: 'op:pst:00001784', nama: 'Penyakit Busuk Hati',
    key: 'busuk-hati-nenas', label: 'Busuk hati nenas',
    inang: [NENAS],
    definition:
      'Oomycete yang masuk lewat AIR yang menggenang di pucuk dan di pangkal daun, sehingga drainase dan arah tanam menentukan lebih banyak daripada bahan aktif. Menyerang paling parah pada bibit yang baru ditanam di musim hujan; merendam bibit sebelum tanam adalah tindakan pencegahan yang lazim dan jauh lebih murah daripada menyemprot hamparan. Bertahan di tanah.',
    gejala:
      'Daun MUDA di tengah roset menguning lalu memerah, dan bila DITARIK ia lepas dengan mudah — pangkalnya membusuk basah, berwarna coklat berbatas jelas dengan jaringan sehat, dan berbau. Daun tua di luar masih hijau saat pucuknya sudah busuk, sehingga tanaman terlihat sehat dari jauh.',
    pembanding: [
      { cek: 'TARIK daun termuda di tengah roset. Busuk hati membuatnya lepas ringan dengan pangkal yang membusuk basah; tanaman yang sehat menahan daunnya dan daun akan robek alih-alih lepas.' },
      { cek: 'Cium pangkal daun yang lepas. Busuk hati berbau busuk basah tanpa berlendir; busuk yang berlendir kental dan berbau tajam biasanya bakteri, dan bahan aktifnya berbeda.' },
    ],
  },
  {
    id: 'op:pst:00000196', dari: 'op:pst:00001723', nama: 'Epilachna sp.',
    key: 'kumbang-epilachna', label: 'Kumbang epilachna',
    inang: [TERUNG],
    definition:
      'Satu-satunya kumbang koksi yang MEMAKAN DAUN — kerabatnya yang lain justru pemangsa kutu dan harus dijaga, sehingga menyemprot berspektrum luas karena kumbang ini sering menukar satu masalah dengan dua. Dewasa dan larvanya memakan bagian yang sama pada waktu yang sama, jadi keduanya terlihat berbarengan. Memungut kumbang dan kelompok telurnya pada pagi hari cukup pada pertanaman kecil.',
    gejala:
      'Daun tergerus dalam pola GARIS SEJAJAR melengkung sehingga tinggal jaring urat daun yang menerawang seperti renda, dan bekasnya mengering kecoklatan. Kumbang bulat kubah jingga kemerahan berbintik hitam banyak, berbulu halus sehingga terlihat kusam; larvanya kuning berduri lunak bercabang, di permukaan bawah daun.',
    pembanding: [
      { cek: 'Lihat POLA gerusannya. Kumbang epilachna menggerus dalam garis sejajar melengkung sehingga daun terlihat seperti renda dengan urat yang tersisa; ulat memakan tembus sampai berlubang atau memakan dari tepi.' },
      { cek: 'Perhatikan permukaan kumbangnya. Epilachna berbulu halus sehingga KUSAM; kumbang koksi pemangsa kutu licin mengkilap, dan yang itu justru harus dibiarkan.' },
    ],
  },
  {
    id: 'op:pst:00000197', dari: 'op:pst:00001516', nama: 'Penyakit Bercak Daun',
    key: 'bercak-daun-anggrek', label: 'Bercak daun anggrek',
    inang: [ANGGREK],
    definition:
      'Menyebar lewat PERCIKAN air dan lewat tangan serta alat yang berpindah antar-pot, sehingga rumah lindung yang rapat justru menaikkannya. Menyiram dari bawah dan tidak menyemprot air ke daun menjelang sore menurunkannya tanpa bahan apa pun. Daun anggrek berumur panjang dan bekas bercaknya tidak hilang, jadi kerugiannya menetap pada tanaman yang dijual sebagai tanaman hias.',
    gejala:
      'Bercak BULAT sampai lonjong pada daun, mula-mula kuning jernih lalu coklat tua dengan tengah lebih pucat dan tepi yang jelas, sering dikelilingi lingkaran kuning. Bercak yang berdekatan menyatu; pada daun tua bercaknya menghitam dan bagian tengahnya bisa mengering menipis.',
    pembanding: [
      { cek: 'Tekan bercaknya. Bercak daun anggrek KERING dan menipis tetapi tidak berair; busuk bakteri anggrek melunak berair dan menyebar cepat dalam hitungan hari, dan itu menuntut membuang daunnya segera.' },
      { cek: 'Lihat apakah bercaknya bertepi tegas dengan lingkaran kuning. Bercak jamur memberikannya; bekas terbakar matahari atau bekas air dingin bertepi kabur tanpa lingkaran dan tidak bertambah luas.' },
    ],
  },
  {
    id: 'op:pst:00000198', dari: 'op:pst:00002027', nama: 'Sundapteryx biguttulla',
    key: 'wereng-kapas', label: 'Wereng kapas',
    inang: [KAPAS],
    definition:
      'Yang merusak bukan lubang melainkan RACUN dalam air liurnya, sehingga daun rusak tanpa satu lubang pun dan gejalanya mudah dikira kekurangan hara atau keracunan pupuk. Menumpuk pada musim kering dan pada tanaman yang dipupuk nitrogen berlebih. Varietas berdaun berbulu jauh lebih tahan, dan itu keputusan yang diambil saat memilih benih, bukan saat menyemprot.',
    gejala:
      'Tepi daun menguning lalu MELENGKUNG KE BAWAH seperti mangkuk terbalik, kemudian mencoklat dan mengering dari tepi ke dalam sementara tengahnya masih hijau. Di permukaan bawah daun ada wereng hijau pucat kecil yang berjalan MENYAMPING dan melompat saat daun digoyang.',
    pembanding: [
      { cek: 'Balik daun dan goyang. Wereng kapas berjalan MENYAMPING lalu melompat — gerak yang khas dan tidak dilakukan kutu daun, yang bergerombol diam dan meninggalkan embun madu lengket.' },
      { cek: 'Lihat arah melengkungnya daun. Wereng kapas melengkungkan tepi daun KE BAWAH dan mengeringkannya dari tepi; kekurangan kalium menguningkan tepi tanpa melengkungkan, dan bercaknya merata di seluruh tanaman bukan di daun tengah lebih dulu.' },
    ],
  },
  {
    id: 'op:pst:00000199', dari: 'op:pst:00002299', nama: 'Hama Lanas',
    key: 'lanas-ubi-jalar', label: 'Lanas ubi jalar',
    inang: [UBI_JALAR],
    definition:
      'Hama yang menentukan pada ubi jalar, dan kerugiannya dua lapis: umbi berlubang, DAN umbi yang tersisa jadi pahit serta berbau tidak enak karena tanaman mengeluarkan zat pertahanan — sehingga umbi yang cuma sedikit terserang pun tidak laku. Masuk lewat RETAKAN tanah ke umbi, jadi menggemburkan dan menimbun guludan saat tanah retak di musim kering adalah tindakan yang paling menentukan. Terbawa pada stek, jadi bibit dari petak yang terserang meneruskannya.',
    gejala:
      'Umbi berlubang kecil dengan kotoran halus di sekitar lubang, dan bila dibelah ada lorong berkelok berisi larva putih berkepala coklat; daging umbi di sekitar lorong menghitam kehijauan dan BERBAU seperti terpentin serta terasa pahit. Batang di dekat pangkal juga berlubang dan tanaman layu sebagian.',
    pembanding: [
      { cek: 'Belah umbi yang berlubang dan CIUM. Lanas meninggalkan bau tajam seperti terpentin dari jaringan yang menghitam; lubang tanpa bau itu dan tanpa lorong berkelok biasanya bekas hama tanah lain.' },
      { cek: 'Periksa apakah tanah di sekitar guludan RETAK. Lanas masuk lewat retakan; guludan yang tanahnya rapat menutup umbi hampir tidak pernah terserang, dan menimbunnya lebih menentukan daripada menyemprot.' },
    ],
  },
  {
    id: 'op:pst:00000200', dari: 'op:pst:00001936', nama: 'Penyakit Embun Jelaga',
    key: 'embun-jelaga', label: 'Embun jelaga',
    inang: [ALPUKAT, JERUK, KOPI, MANGGA, KAKAO],
    definition:
      'BUKAN penyakit tanaman, dan itu satu-satunya hal yang perlu diketahui sebelum membeli apa pun: jamurnya tumbuh di atas EMBUN MADU — cairan manis yang dikeluarkan kutu — dan tidak menembus jaringan tanaman sama sekali. Menyemprot fungisida menghilangkan jelaganya sebentar lalu ia kembali, karena kutunya masih ada. Yang menghentikannya menangani kutu putih, kutu tempurung, atau kutu daun yang ada di atasnya, dan memutus jalur semut yang memelihara kutu itu. Kerugiannya nyata tetapi tidak langsung: daun yang tertutup jelaga berkurang cahayanya, dan buah yang berjelaga tidak laku walau isinya utuh.',
    gejala:
      'Lapisan HITAM seperti jelaga menutupi permukaan ATAS daun, ranting, dan kulit buah, kering dan bisa DIKELUPAS sebagai lembaran tipis sehingga permukaan di bawahnya terlihat HIJAU SEHAT tidak berbekas. Permukaan di sekitarnya terasa lengket. Hampir selalu ada gerombolan kutu di atasnya — di pucuk, ketiak daun, atau dompolan buah — dan barisan semut naik-turun batang.',
    pembanding: [
      { cek: 'KELUPAS lapisan hitamnya dengan kuku atau usap dengan kain basah. Embun jelaga terangkat sebagai lembaran dan menyisakan jaringan HIJAU SEHAT di bawahnya; penyakit yang benar-benar menyerang daun meninggalkan jaringan mati kecoklatan yang tidak bisa dikelupas.' },
      { cek: 'Cari SUMBERNYA di atas bagian yang berjelaga: gerombolan kutu putih, kutu tempurung, atau kutu daun, dan barisan semut di batang. Kalau ketemu, itu yang harus ditangani — menyemprot jelaganya saja akan mengulang pekerjaan yang sama bulan depan.',
        membantah: { id: 'op:pst:00000071', label: 'Kutu tempurung' } },
    ],
  },
];

const PINTU_EKOR7 = [
  {
    // Tanpa `dari`: pintu ini pasangan rebah kecambah oomycete, dan yang membuatnya
    // berdiri sendiri justru BAHAN AKTIFNYA. Registri memuat "Rhizoctonia sp." sebagai
    // sasaran, tetapi entitas itu sudah jadi sumber pencakupan bagi pintu hawar pelepah
    // padi; menaikkannya akan mencabut delapan baris padi. Ia dicakup dari sisi persemaian
    // lewat pencakupan marga, karena inang kedua pintu tidak beririsan.
    id: 'op:pst:00000201',
    key: 'rebah-kecambah-jamur', label: 'Rebah kecambah jamur sejati',
    pest_kind: 'disease_fungal', scientific_name: 'Rhizoctonia solani',
    taxonomic_rank: 'species',
    no_mapping_reason:
      'Registri memuat sasarannya sebagai "Rhizoctonia sp." dan "Fusarium spp.", dua entri bertingkat marga yang keduanya sudah bekerja sebagai sumber pencakupan bagi pintu lain — hawar pelepah padi dan layu fusarium. Menaikkan salah satunya akan mencabut jangkauan pintu itu, jadi pintu ini berdiri tanpa tautan dan menjangkau keduanya lewat pencakupan.',
    inang: [CABAI, TOMAT, KENTANG, KUBIS, TEMBAKAU_SEMAI, JAGUNG],
    definition:
      'PASANGAN rebah kecambah yang oomycete, dan seluruh alasan ia berdiri sendiri satu keputusan: BAHAN AKTIFNYA berbeda. Metalaksil dan dimetomorf bekerja pada oomycete dan tidak menyentuh jamur sejati; yang ini justru sebaliknya. Karena gejalanya di bedengan hampir sama, urutan yang masuk akal biasanya: benahi dulu penyiraman dan kerapatan semai — itu menahan keduanya — dan kalau perlakuan oomycete sudah dicoba tanpa hasil, kemungkinan besar yang berjalan yang ini.',
    gejala:
      'Bibit rebah dengan pangkal batang MENGERING mencoklat dan MENGERAS seperti tercekik tali, bukan berair, dan bagian yang mengering itu sering menyempit rapi di batas permukaan media. Bibit yang lebih tua tidak rebah melainkan kerdil dengan pangkal batang bercekik coklat; pada media yang lembap terlihat benang jamur coklat halus menempel di pangkal.',
    pembanding: [
      { cek: 'Pijit pangkal batang bibit yang rebah. Rebah kecambah jamur sejati membuatnya KERING dan keras mencoklat; yang oomycete membuatnya lunak berair, dan bedanya menentukan bahan aktif yang dibeli.',
        membantah: { id: 'op:pst:00000141', label: 'Rebah kecambah' } },
      { cek: 'Ingat apa yang sudah dicoba. Kalau perlakuan untuk oomycete — metalaksil atau dimetomorf — sudah dipakai dan bibit tetap rebah, kemungkinan besar yang berjalan jamur sejati, dan menambah dosis bahan yang sama tidak akan mengubah apa pun.',
        membantah: { id: 'op:pst:00000141', label: 'Rebah kecambah' } },
    ],
  },
  {
    id: 'op:pst:00000202', dari: 'op:pst:00002340', nama: 'Hama Symphyla',
    key: 'simfila-nenas', label: 'Simfila nenas',
    inang: [NENAS],
    definition:
      'Hewan tanah bertubuh putih menyerupai kelabang kecil — bukan serangga — yang memakan UJUNG AKAR, sehingga tanaman kehilangan akar rambut dan berhenti tumbuh tanpa satu gejala pun di daun selain kerdil. Menumpuk pada tanah gembur berbahan organik banyak dan pada petak yang ditanami nenas terus-menerus. Ia bergerak cepat dan turun dalam saat tanah kering, jadi contoh tanah yang diambil siang hari di musim kering sering menyatakan tidak ada apa-apa.',
    gejala:
      'Tanaman KERDIL berpetak-petak dengan daun memendek dan memucat walau dipupuk, dan pertumbuhannya berhenti sementara tanaman di sebelahnya normal. Akar yang dicuci PENDEK tanpa akar rambut, ujungnya menggemuk lalu mati. Di gumpalan tanah yang baru dibongkar terlihat hewan putih ramping sepanjang beberapa milimeter yang berlari cepat menghindari cahaya.',
    pembanding: [
      { cek: 'Bongkar gumpalan tanah di sekitar akar dan amati beberapa detik. Simfila BERLARI CEPAT menghindari cahaya dan berkaki banyak seperti kelabang mini; nematoda tidak terlihat mata telanjang, dan larva kumbang bergerak lambat melengkung seperti huruf C.' },
      { cek: 'Cuci akar tanaman yang kerdil. Simfila menghabiskan AKAR RAMBUT sehingga akar utama pendek berujung menggemuk; akar yang berbengkak bulat seperti manik penyebabnya nematoda puru akar.',
        membantah: { id: 'op:pst:00000130', label: 'Nematoda puru akar' } },
    ],
  },
  {
    // Tanpa `dari` karena registri MENYALAHKAN nama marganya: entri "Bactrocera hercules"
    // menyebut lalat buah, sementara label Indonesianya berbunyi "Hama Penggerek Batang"
    // dan tanamannya pala. Yang dimaksud Batocera — kumbang sungut panjang penggerek
    // batang — dan entri registrinya dicakup pintu ini beserta dasarnya.
    id: 'op:pst:00000203',
    key: 'penggerek-batang-pala', label: 'Penggerek batang pala',
    pest_kind: 'insect', scientific_name: 'Batocera hercules',
    taxonomic_rank: 'species',
    no_mapping_reason:
      'Entri registrinya menulis "Bactrocera hercules" — marga lalat buah — sementara label Indonesianya berbunyi "Hama Penggerek Batang" dan komoditasnya pala. Yang dimaksud Batocera hercules, kumbang sungut panjang; menautkan pintu ini ke entri itu berarti mengklaim nama yang salah eja sebagai identitasnya.',
    inang: [PALA],
    definition:
      'Larvanya menggerek ke dalam KAYU dan sekali di dalam tidak ada semprotan yang menjangkaunya — yang bekerja menyumbat lubangnya atau menusuknya dengan kawat. Karena itu seluruh nilainya ada pada menemukan lubang lebih awal, dan tandanya justru kotoran serbuk kayu yang menumpuk di pangkal pohon. Menyerang pohon yang sudah lemah lebih dulu, jadi pohon yang terserang berulang biasanya menandakan masalah akar atau hara yang belum ditangani.',
    gejala:
      'Lubang BUNDAR sebesar jari kelingking pada batang, dan dari lubang itu keluar serbuk kayu kasar bercampur kotoran yang menumpuk di pangkal pohon atau menggantung di kulit. Cabang atau seluruh pohon di atas gerekan menguning dan meranggas; batang yang digerek berat mudah patah tertiup angin.',
    pembanding: [
      { cek: 'Cari TUMPUKAN serbuk kayu kasar di pangkal pohon, lalu telusuri ke atas sampai lubangnya. Penggerek batang meninggalkan keduanya; pohon yang meranggas tanpa lubang dan tanpa serbuk penyebabnya akar atau pembuluh, dan menyemprot batang tidak menolong.' },
      { cek: 'Perhatikan ukuran lubangnya. Penggerek batang pala melubangi sebesar jari kelingking; lubang sebesar ujung jarum dengan serbuk halus penyebabnya kumbang penggerek yang jauh lebih kecil, dan penanganannya berbeda.' },
    ],
  },
  {
    // Tanpa `dari`: sasaran "Thrips sp." pada padi tidak bisa dinaikkan karena entitas itu
    // sumber pencakupan bagi tiga pintu trips lain; ia dicakup pintu ini dari sisi padi.
    id: 'op:pst:00000204',
    key: 'trips-padi', label: 'Trips padi',
    pest_kind: 'insect', scientific_name: 'Stenchaetothrips biformis',
    taxonomic_rank: 'species',
    no_mapping_reason:
      'Registri tidak memuat Stenchaetothrips; yang ada sasaran bertingkat marga "Thrips sp." yang sudah bekerja sebagai sumber pencakupan bagi tiga pintu trips lain, sehingga menaikkannya akan mencabut jangkauan ketiganya. Entri itu dicakup pintu ini dari sisi padi saja.',
    inang: [PADI],
    definition:
      'Masalah PERSEMAIAN dan padi muda, dan hampir selalu masalah AIR: menumpuk pada persemaian yang kering dan pada sawah yang airnya belum masuk, lalu berhenti sendiri begitu petak tergenang. Menggenangi persemaian beberapa hari sering menyelesaikannya tanpa semprotan apa pun, dan itu tindakan yang lebih murah daripada menyemprot bedengan. Tanaman yang sudah melewati fase anakan jarang dirugikan.',
    gejala:
      'Ujung daun MENGGULUNG memanjang ke dalam seperti pipa lalu menguning dan mengering dari ujung, dan daun yang digulung terasa kasar. Persemaian terlihat menguning berpetak dan bibitnya kerdil. Bila gulungan dibuka, di dalamnya ada serangga sangat kecil berwarna kuning kecoklatan yang bergerak cepat.',
    pembanding: [
      { cek: 'BUKA ujung daun yang menggulung. Trips padi ada di DALAM gulungan itu, berupa serangga kuning kecoklatan sangat kecil; daun yang menggulung karena kekeringan kosong dan menggulung dari kedua tepi, bukan memanjang dari ujung.' },
      { cek: 'Periksa keadaan airnya. Trips padi menumpuk saat persemaian atau petak KERING dan berhenti sendiri begitu tergenang; kalau petaknya sudah berair dan gejalanya berlanjut, penyebabnya bukan ini.' },
    ],
  },
  {
    id: 'op:pst:00000205', dari: 'op:pst:00001962', nama: 'Penyakit Busuk Batang',
    key: 'busuk-batang-sklerotinia', label: 'Busuk batang sklerotinia',
    inang: [TEMBAKAU],
    definition:
      'Bertahan di tanah sebagai butiran keras BESAR yang bisa hidup bertahun-tahun, sehingga petak yang pernah terserang tetap berisiko walau tanamannya diganti — dan itu yang membedakan keputusannya dari penyakit daun: yang menentukan pergiliran tanaman dan drainase, bukan jadwal semprot. Menumpuk pada cuaca sejuk lembap dan pada pertanaman rapat yang pangkal batangnya lama basah.',
    gejala:
      'Pangkal atau batang tengah membusuk BASAH dan memucat seperti direbus, lalu tertutup benang jamur PUTIH tebal seperti kapas. Di dalam batang yang dibelah dan di permukaan benang itu terdapat butiran keras HITAM sebesar biji kacang hijau sampai sebesar kuku. Tanaman layu di atas batas busuk sementara akarnya masih hidup.',
    pembanding: [
      { cek: 'Belah batang yang membusuk dan cari BUTIRAN HITAM keras di dalamnya. Busuk batang sklerotinia membentuknya sebesar biji kacang hijau atau lebih; busuk sklerotium pada kacang-kacangan membentuk butiran jauh lebih kecil sebesar biji sawi dan berwarna coklat kemerahan, di luar batang.',
        membantah: { id: 'op:pst:00000176', label: 'Busuk pangkal batang sklerotium' } },
      { cek: 'Lihat di mana busuknya bermula. Busuk batang sklerotinia bisa bermula di BATANG TENGAH, bukan cuma di pangkal, dan sering dari ketiak daun yang tertinggal; lanas bermula dari pangkal batang di batas tanah dan mengempis ke atas.',
        membantah: { id: 'op:pst:00000098', label: 'Lanas' } },
    ],
  },
  {
    id: 'op:pst:00000206', dari: 'op:pst:00002026', nama: 'Empoasca spp.',
    key: 'wereng-daun-kedelai', label: 'Wereng daun kedelai',
    inang: [KEDELAI, KACANG_PANJANG],
    definition:
      'Yang merusak bukan lubang melainkan RACUN dalam air liurnya, sehingga daun rusak tanpa satu lubang pun dan gejalanya mudah dikira kekurangan hara, keracunan pupuk, atau kekeringan. Menumpuk pada musim kering. Karena kerusakannya terjadi saat mengisap, ambangnya rendah: begitu tepi daun mulai menguning, sebagian hasil sudah hilang.',
    gejala:
      'Tepi daun menguning lalu MELENGKUNG KE BAWAH dan mencoklat mengering dari tepi ke dalam, sementara tulang daun dan bagian tengahnya masih hijau. Di permukaan bawah ada wereng hijau pucat kecil yang berjalan MENYAMPING dan melompat saat daun digoyang. Tanaman kerdil dan polongnya sedikit.',
    pembanding: [
      { cek: 'Balik daun dan goyang. Wereng daun berjalan MENYAMPING lalu melompat; kutu daun kedelai bergerombol diam di pucuk dan meninggalkan embun madu lengket berjelaga.',
        membantah: { id: 'op:pst:00000146', label: 'Kutu daun kedelai' } },
      { cek: 'Lihat pola menguningnya. Wereng daun menguningkan dan melengkungkan TEPI daun ke bawah sementara tengahnya hijau; kekurangan kalium juga menguningkan tepi tetapi tidak melengkungkan dan mengenai seluruh tanaman merata, bukan daun tengah lebih dulu.' },
    ],
  },
  {
    id: 'op:pst:00000207', dari: 'op:pst:00002185', nama: 'Wereng Daun',
    key: 'wereng-daun-padi', label: 'Wereng daun padi',
    inang: [PADI],
    definition:
      'Jarang menentukan hasil sendirian, dan itu bagian dari jawabannya: ia terlihat mencolok karena bertubuh besar dan berlapis lilin putih, sehingga sering disemprot padahal jumlahnya belum mendekati ambang apa pun. Menyemprotnya justru merugikan bila menghabiskan laba-laba dan kepik pemangsa yang menahan wereng coklat — dan wereng coklat itulah yang benar-benar bisa memuso satu petak.',
    gejala:
      'Serangga bersayap seperti perahu berwarna hijau pucat sampai kecoklatan, jauh lebih besar daripada wereng coklat, hinggap di daun dan pelepah dan melompat jauh saat diganggu. Nimfanya berlapis lilin putih seperti kapas di ujung perut. Daun berembun madu lengket dan kadang berjelaga, tetapi tanaman tetap hijau dan tidak menguning berpetak.',
    pembanding: [
      { cek: 'Bandingkan UKURAN dan tempat hinggapnya. Wereng daun padi besar dan hinggap di daun atas; wereng coklat kecil dan berkumpul di PANGKAL batang di batas air — dan yang di pangkal itulah yang berbahaya.',
        membantah: { id: 'op:pst:00000029', label: 'Wereng coklat' } },
      { cek: 'Lihat apakah ada rumpun yang menguning lalu mengering berpetak melingkar. Wereng daun tidak memberikan itu; kalau ada, yang sedang berjalan wereng coklat dan tindakannya jauh lebih mendesak.',
        membantah: { id: 'op:pst:00000029', label: 'Wereng coklat' } },
    ],
  },
  {
    id: 'op:pst:00000208', dari: 'op:pst:00001925', nama: 'Penggulung Daun',
    key: 'penggulung-daun-eucalyptus', label: 'Penggulung daun eucalyptus',
    inang: [EUCALYPTUS],
    definition:
      'Masalah PEMBIBITAN dan tegakan muda; pada tegakan yang sudah menutup ia jarang menentukan. Ulatnya bersembunyi di dalam gulungan daun sehingga semprotan kontak sulit menjangkaunya, dan waktunya harus mengenai ulat yang baru menetas sebelum menggulung. Pada bibit di persemaian, memungut dan membuang gulungan lebih cepat daripada menyemprot seluruh bedengan.',
    gejala:
      'Daun pucuk MENGGULUNG atau dua daun terekat menjadi satu oleh benang sutera, dan di dalamnya ada ulat hijau kecoklatan beserta kotoran hitam halus. Bagian dalam gulungan tergerus sehingga daun yang dibuka berlubang; pucuk yang berulang terserang bercabang tidak beraturan dan batangnya bengkok.',
    pembanding: [
      { cek: 'BUKA gulungan atau daun yang terekat. Penggulung daun meninggalkan ulat dan kotoran hitam di dalamnya beserta benang sutera; daun yang menggulung karena kekeringan kosong dan tidak berbenang.' },
      { cek: 'Lihat apakah kerusakannya terpusat di PUCUK. Penggulung daun menyerang daun termuda; daun tua yang berlubang tersebar tanpa gulungan penyebabnya kumbang atau belalang.' },
    ],
  },
];

const KELOMPOK = [
  { kunci: 'bawang-merah', tanaman: 'bawang merah', inang: [BAWANG_MERAH], pintu: PINTU_BAWANG },
  { kunci: 'tomat-kentang', tanaman: 'tomat dan kentang', inang: [TOMAT, KENTANG], pintu: PINTU_TOMAT_KENTANG },
  { kunci: 'padi', tanaman: 'padi', inang: [PADI], pintu: PINTU_PADI },
  { kunci: 'jagung', tanaman: 'jagung', inang: [JAGUNG], pintu: PINTU_JAGUNG },
  { kunci: 'kubis', tanaman: 'kubis', inang: [KUBIS], pintu: PINTU_KUBIS },
  { kunci: 'kedelai', tanaman: 'kedelai', inang: [KEDELAI], pintu: PINTU_KEDELAI },
  { kunci: 'kakao', tanaman: 'kakao', inang: [KAKAO], pintu: PINTU_KAKAO },
  { kunci: 'kopi', tanaman: 'kopi', inang: [KOPI], pintu: PINTU_KOPI },
  { kunci: 'sawit', tanaman: 'kelapa sawit', inang: [SAWIT], pintu: PINTU_SAWIT },
  { kunci: 'jeruk', tanaman: 'jeruk', inang: [JERUK], pintu: PINTU_JERUK },
  { kunci: 'cucurbit', tanaman: 'semangka, melon, dan mentimun', inang: [SEMANGKA, MELON, MENTIMUN], pintu: PINTU_CUCURBIT },

  { kunci: 'legum', tanaman: 'kacang panjang, kacang hijau, dan kacang tanah', inang: [KACANG_PANJANG, KACANG_HIJAU, KACANG_TANAH], pintu: PINTU_LEGUM },

  { kunci: 'tembakau', tanaman: 'tembakau', inang: [TEMBAKAU], pintu: PINTU_TEMBAKAU },
  { kunci: 'teh', tanaman: 'teh', inang: [TEH], pintu: PINTU_TEH },
  { kunci: 'mangga', tanaman: 'mangga', inang: [MANGGA], pintu: PINTU_MANGGA },

  { kunci: 'apel', tanaman: 'apel', inang: [APEL], pintu: PINTU_APEL },
  { kunci: 'tebu', tanaman: 'tebu', inang: [TEBU], pintu: PINTU_TEBU },
  { kunci: 'karet', tanaman: 'karet', inang: [KARET], pintu: PINTU_KARET },
  { kunci: 'lada', tanaman: 'lada', inang: [LADA], pintu: PINTU_LADA },
  { kunci: 'pisang', tanaman: 'pisang', inang: [PISANG], pintu: PINTU_PISANG },
  { kunci: 'krisan', tanaman: 'krisan', inang: [KRISAN], pintu: PINTU_KRISAN },

  { kunci: 'cabai-lanjut', tanaman: 'cabai', inang: [CABAI], pintu: PINTU_CABAI_LANJUT },
  { kunci: 'gudang', tanaman: 'hasil pertanian di penyimpanan', inang: [BERAS_SIMPAN, JAGUNG_SIMPAN], pintu: PINTU_GUDANG },

  { kunci: 'sisa', tanaman: 'cabai, padi, dan tambak', inang: [CABAI], pintu: PINTU_SISA },

  { kunci: 'sisa2', tanaman: 'beberapa komoditas', inang: [CABAI], pintu: PINTU_SISA2 },

  { kunci: 'padi-ekor', tanaman: 'padi', inang: [PADI], pintu: PINTU_PADI_EKOR },
  { kunci: 'ekor', tanaman: 'beberapa komoditas', inang: [CABAI], pintu: PINTU_EKOR },

  { kunci: 'ekor2', tanaman: 'beberapa komoditas', inang: [CABAI], pintu: PINTU_EKOR2 },

  { kunci: 'ekor3', tanaman: 'beberapa komoditas', inang: [CABAI], pintu: PINTU_EKOR3 },

  { kunci: 'ekor4', tanaman: 'beberapa komoditas', inang: [CABAI], pintu: PINTU_EKOR4 },

  { kunci: 'ekor5', tanaman: 'beberapa komoditas', inang: [CABAI], pintu: PINTU_EKOR5 },

  { kunci: 'ekor6', tanaman: 'beberapa komoditas', inang: [CABAI], pintu: PINTU_EKOR6 },

  { kunci: 'ekor7', tanaman: 'beberapa komoditas', inang: [CABAI], pintu: PINTU_EKOR7 },
];

// ---------------------------------------------------------------------------
// Entri yang melayani lebih dari satu komoditas
// ---------------------------------------------------------------------------
// Berdiri di luar kelompok, dan memuat BUNYI TERAKHIRNYA — bukan satu versi per
// kurasi. `inang` di sini daftar LENGKAP yang seharusnya dibawa entri itu; yang sudah
// ada tidak diduakan. Teks gejala yang menyamaratakan beberapa tanaman akan salah di
// semuanya, jadi yang bentuknya memang berbeda ditulis berklausa per tanaman, dan yang
// bentuknya memang sama dibiarkan tanpa menyebut tanaman sama sekali.
const PERLUAS = [
  // --- Inang diperluas ke tanaman yang teksnya memang sudah menjangkau ---
  {
    // Bukan perluasan inang, melainkan pemindahan pengetahuan yang tadinya hidup sebagai
    // TEBAKAN NAMA di app/jalur-1.js: layar nol-produk mencari penular dengan mencocokkan
    // /kutu kebul/i pada label yang dibantah. Itu bekerja selama satu-satunya virus yang
    // dikurasi virus cabai. Begitu virus bawang masuk, penularnya kutu daun persik dan
    // tombolnya diam-diam hilang. Penular karena itu kini dinyatakan pada entitasnya.
    id: 'op:pst:00000010',
    nama: 'Virus kuning keriting',
    inang: [CABAI, TOMAT],
    definition: 'Ditularkan kutu kebul; tidak ada pengendalian kuratif, hanya pencegahan. Menyerang cabai dan tomat.',
    penular: { id: 'op:pst:00000003', label: 'Kutu kebul' },
  },
  {
    id: 'op:pst:00000009',
    nama: 'Layu bakteri',
    inang: [CABAI, TOMAT, KENTANG],
    gejala:
      'Tanaman layu mendadak, sering hanya dalam satu sampai dua hari, dan daunnya MASIH HIJAU saat layu — tidak menguning lebih dulu. Pangkal batang kecoklatan dan basah. Pada kentang umbinya ikut terkena: cincin pembuluh di dalam umbi kecoklatan, dan dari mata tunas keluar lendir putih yang mengering jadi kerak bertanah.',
    pembanding: [
      {
        cek: 'UJI GELAS. Potong batang dekat pangkal — pada kentang boleh juga umbinya — lalu celupkan ujungnya ke gelas berisi air bening dan diamkan lima menit. Untaian lendir putih susu yang turun perlahan dari potongan berarti layu bakteri.',
        membantah: { id: 'op:pst:00000008', label: 'Layu fusarium' },
      },
      {
        cek: 'Perhatikan warna daun saat layu. Layu bakteri menyerang cepat dengan daun masih hijau; fusarium menguningkan daun bawah lebih dulu dan berjalan berhari-hari.',
        membantah: { id: 'op:pst:00000008', label: 'Layu fusarium' },
      },
    ],
  },
  {
    id: 'op:pst:00000008',
    nama: 'Layu fusarium',
    inang: [CABAI, BAWANG_MERAH, TOMAT],
    gejala:
      'Pada cabai dan tomat tanaman layu perlahan selama beberapa hari; daun bawah menguning lebih dulu, sering hanya pada satu sisi tanaman, dan layunya menetap walau tanah lembap. Pada bawang merah daun menguning dari ujung lalu MELENGKUNG dan terpelintir — dari situ nama moler — dan tanaman mudah tercabut karena dasar umbinya sudah membusuk.',
    pembanding: [
      {
        cek: 'Belah pangkal batang atau umbi membujur. Pada cabai dan tomat pembuluh di dalamnya coklat memanjang sementara jaringan lain masih putih. Pada bawang merah dasar umbi tempat akar keluar membusuk kecoklatan, sering berselaput putih seperti kapas.',
      },
      {
        cek: 'UJI GELAS. Potong batang atau leher umbi dekat pangkal, celupkan ujungnya ke gelas berisi air bening, diamkan lima menit. Kalau TIDAK keluar lendir putih, penyebabnya fusarium, bukan bakteri.',
        membantah: { id: 'op:pst:00000009', label: 'Layu bakteri' },
      },
    ],
  },
  {
    id: 'op:pst:00000002',
    nama: 'Kutu daun persik',
    inang: [CABAI, BAWANG_MERAH, TOMAT, KENTANG, KUBIS, SEMANGKA, MELON, MENTIMUN, TEMBAKAU],
    definition:
      'Vektor beberapa virus penting, termasuk virus penggulung daun pada kentang. Mengendalikannya melindungi tanaman yang BELUM terkena, dan tidak menyembuhkan satu pun yang sudah bergejala.',
    gejala:
      'Pada cabai, tomat, dan kentang daun muda mengeriting ke BAWAH dan mengerut. Pada bawang merah kutu berkelompok di ketiak daun dan pangkal umbi, dan daunnya tidak mengeriting sejelas itu — yang lebih dulu terlihat justru permukaan yang lengket. Pada kubis kutu berkelompok rapat di permukaan bawah daun luar dan di sela daun krop, sering berselaput lilin kelabu. Pada semuanya daun lengket sering ditumbuhi jelaga hitam, dan semut naik-turun di tanaman.',
  },
  {
    // Pintu antraknosa cabai yang lebih dulu ada berdiri di atas sasaran GENUS, dan
    // ternyata cuma dipakai 8 baris pendaftaran sementara species-nya memegang 102.
    // Entri ini tidak dibuang — ia sah, dan produk yang terdaftar atas nama genus memang
    // hanya terjangkau lewat sini — tetapi pembagiannya berhenti jadi teka-teki: yang
    // membaca salah satunya kini diberi tahu bahwa yang satunya ada dan kenapa.
    id: 'op:pst:00000007',
    nama: 'Antraknosa',
    inang: [CABAI, TOMAT, JERUK, BUAH_NAGA],
    definition:
      'Patek. Entri ini berdiri di atas sasaran GENUS "Colletotrichum spp." yang dipakai 8 baris pendaftaran. Hampir seluruh pendaftaran antraknosa cabai — 102 baris — justru tertulis atas nama spesiesnya, Colletotrichum capsici, dan punya pintunya sendiri: "Antraknosa cabai". Keduanya penyakit yang sama di kebun dan tidak bisa dibedakan tanpa laboratorium; yang berbeda hanya cara registri menuliskan sasarannya, jadi periksa KEDUA pintu sebelum menyimpulkan produknya sedikit. Tomat ikut jadi inang di sini dan tidak di pintu spesiesnya, karena antraknosa buah tomat memang dilayani beberapa Colletotrichum yang tidak terpisahkan di kebun.',
  },
  // Dua pintu cabai yang tidak pernah masuk tabel mana pun di alat ini — keduanya lahir
  // dari tulis-gejala-opt.mjs dan tidak pernah diperluas ke komoditas lain — sehingga
  // inangnya tertinggal pada "Cabai merah besar" saat yang lain pindah ke "Cabai".
  { id: 'op:pst:00000001', nama: 'Trips', inang: [CABAI] },
  {
    id: 'op:pst:00000006', nama: 'Tungau merah', inang: [CABAI, JERUK, APEL, TOMAT, MELON, CENGKEH_BIBIT],
    definition: 'Tungau berinang sangat luas yang menumpuk pada musim kering dan pada tanaman berdebu di pinggir jalan. Bukan serangga: insektisida umum tidak menyentuhnya, dan justru menghabiskan tungau pemangsa yang menahannya.',
  },
  { id: 'op:pst:00000003', nama: 'Kutu kebul', inang: [CABAI, TOMAT, KENTANG, KEDELAI, SEMANGKA, MELON, MENTIMUN, KACANG_PANJANG] },
  {
    id: 'op:pst:00000004', nama: 'Lalat buah', inang: [CABAI, JERUK, MANGGA, TOMAT],
    definition: 'Lalat buah oriental, berinang sangat luas — cabai, jeruk, mangga, tomat, dan puluhan buah lain — sehingga petak yang bersih tetap terserang dari pohon tetangga. Yang menentukan pengumpulan buah gugur dan perangkap serempak se-hamparan, bukan penyemprotan sendiri-sendiri.',
  },
  {
    id: 'op:pst:00000005',
    nama: 'Ulat grayak',
    inang: [CABAI, TOMAT, KENTANG, JAGUNG, KEDELAI, SEMANGKA, KACANG_HIJAU, TEMBAKAU],
    // Definisi baru dan ciri kedua ditulis ulang begitu ulat grayak JAGUNG punya
    // pintunya sendiri: dua ulat bernama sama pada satu tanaman, dan yang membedakan
    // keduanya menentukan cara menyemprotnya — yang satu makan dari luar, yang satu
    // bertahan di dalam corong pucuk yang tidak terkena semprotan biasa.
    definition:
      'Berbeda dari ulat grayak jagung (Spodoptera frugiperda) yang masuk ke dalam corong pucuk dan bertahan di situ: yang ini makan dari luar, dan bersembunyi di tanah atau ketiak daun pada siang hari.',
    pembanding: [
      {
        cek: 'Cari pada siang hari di bawah daun, di ketiak, atau di tanah dekat pangkal batang. Ulat grayak bersembunyi saat panas dan makan pada malam hari; kalau tidak ditemukan di bagian atas tanaman, itu justru cocok.',
      },
      {
        cek: 'Perhatikan ulatnya. Ulat muda berkelompok rapat pada satu daun sebelum menyebar, dan ulat besar punya sepasang bintik hitam di ruas belakang kepalanya. Ulat grayak jagung berbeda: ia bertahan di dalam corong pucuk bersama kotoran basahnya, dan kepalanya bertanda Y terbalik.',
        membantah: { id: 'op:pst:00000042', label: 'Ulat grayak jagung' },
      },
    ],
  },
];

// ---------------------------------------------------------------------------

const bacaJson = (p) => JSON.parse(readFileSync(join(VOCAB, p), 'utf8'));
const kunciLarik = (o) => (Array.isArray(o) ? null : Object.keys(o).find((k) => Array.isArray(o[k])));
const larik = (o) => (Array.isArray(o) ? o : o[kunciLarik(o)]);

const bungkusKurasi = bacaJson('pest.json');
const bungkusRegistri = bacaJson('pest-registri.json');
const kurasi = larik(bungkusKurasi);
const registri = larik(bungkusRegistri);
const olehId = new Map([...kurasi, ...registri].map((e) => [e.id, e]));

const bantah = [];
const naik = [];
const disegarkan = [];
const dilewati = [];
let diratakan = 0;

// `inang` pada tabel adalah daftar LENGKAP, bukan tambahan — jadi hosts disetel persis,
// bukan digabung. Semula ia menggabung, dan itu terlihat aman sampai satu inang ditulis
// keliru: kopi sempat ditambatkan ke "Budidaya kopi" (sasaran lahan, 469 dari 497 barisnya
// herbisida) sebelum dibetulkan ke entitas tanamannya, dan penggabungan menyimpan KEDUANYA
// tanpa ada yang menyalak. Alat yang cuma bisa menambah tidak bisa dipakai membetulkan.
//
// Yang DIBUANG dilaporkan tersendiri, tidak didiamkan: menghapus inang mengubah komoditas
// mana yang menyaring pintu ini di layar daftar, dan itu terlalu besar untuk lewat sebagai
// "disegarkan" biasa. Urutannya ikut daftar yang diminta, karena `hosts` ikut terbaca
// manusia di docs/14.
const rapatkanInang = (e, minta) => {
  const lama = (e.hosts ?? []).map((h) => h.id);
  const baru = minta.map((h) => h.id);
  if (lama.length === baru.length && lama.every((x, i) => x === baru[i])) return null;
  const dibuang = (e.hosts ?? []).filter((h) => !baru.includes(h.id)).map((h) => h.label);
  e.hosts = minta.map((h) => ({ ...h }));
  return dibuang.length ? `inang (buang ${dibuang.join(', ')})` : 'inang';
};

const bangunPembanding = (pembanding) =>
  pembanding.map((c) => ({ check: { id: c.cek }, ...(c.membantah ? { rules_out: c.membantah } : {}) }));

for (const kel of KELOMPOK) {
  for (const p of kel.pintu) {
    const inang = p.inang ?? kel.inang;
    if (olehId.has(p.id)) {
      // Entri yang sudah ada TIDAK dibangun ulang: `symptoms`, `distinguishing`, dan
      // `notes` boleh sudah disunting sesudah tinjauan penyuluh, dan menimpanya berarti
      // menghapus tinjauan itu tanpa ada yang menyadarinya. Yang disegarkan hanya medan
      // struktural — nama pintu tetangga bisa berubah, inang bisa bertambah, dan yang
      // basi di sana justru menyesatkan.
      const ada = olehId.get(p.id);
      const ubah = [];
      if (ada.label?.id !== p.label) { ada.label = { id: p.label }; ubah.push('label'); }
      if (p.definition && ada.definition?.id !== p.definition) { ada.definition = { id: p.definition }; ubah.push('definition'); }
      if (p.penular && ada.vector?.id !== p.penular.id) { ada.vector = p.penular; ubah.push('penular'); }
      const kabarInang = rapatkanInang(ada, inang);
      if (kabarInang) ubah.push(kabarInang);
      if (ubah.length) {
        ada.lifecycle = { ...(ada.lifecycle ?? {}), updated_at: STAMP };
        disegarkan.push(`${p.id} ${p.label} — ${ubah.join(', ')}`);
      } else {
        dilewati.push(`${p.id} sudah ada`);
      }
      continue;
    }
    let entri;
    if (p.dari) {
      const asal = olehId.get(p.dari);
      if (!asal) {
        bantah.push(`${p.dari} tidak ada — entri registri yang mau dinaikkan hilang.`);
        continue;
      }
      if (asal.label?.id !== p.nama) {
        bantah.push(`${p.dari} berlabel "${asal.label?.id}", diharapkan "${p.nama}". Entri registri sudah berubah; jangan naikkan sebelum diperiksa.`);
        continue;
      }
      if (asal.lifecycle?.status === 'superseded') {
        bantah.push(`${p.dari} sudah digantikan ${asal.lifecycle?.superseded_by?.id}; menaikkannya akan menyalin entitas mati.`);
        continue;
      }
      // Yang ikut naik: identitas taksonomi beserta jejak pemeriksaannya, dan seluruh
      // ejaan registri. Yang TIDAK ikut: id, key, label, dan lifecycle — keempatnya
      // milik entri baru.
      entri = {
        id: p.id,
        key: p.key,
        label: { id: p.label },
        pest_kind: asal.pest_kind,
        scientific_name: asal.scientific_name,
        hosts: inang,
        ...(p.definition ? { definition: { id: p.definition } } : {}),
        mappings: asal.mappings,
        lifecycle: { version: '0.1.0', status: 'draft', created_at: STAMP },
        ...(asal.synonyms ? { synonyms: [...new Set([...asal.synonyms, asal.label.id])].sort() } : {}),
        taxonomic_rank: asal.taxonomic_rank,
        ...(asal.accepted_scientific_name ? { accepted_scientific_name: asal.accepted_scientific_name } : {}),
        ...(asal.taxon_verification ? { taxon_verification: asal.taxon_verification } : {}),
      };
      asal.lifecycle = { ...(asal.lifecycle ?? {}), status: 'superseded', updated_at: STAMP, superseded_by: { id: p.id } };
    } else {
      entri = {
        id: p.id,
        key: p.key,
        label: { id: p.label },
        pest_kind: p.pest_kind,
        scientific_name: p.scientific_name,
        hosts: inang,
        ...(p.definition ? { definition: { id: p.definition } } : {}),
        no_mapping_reason: p.no_mapping_reason,
        lifecycle: { version: '0.1.0', status: 'draft', created_at: STAMP },
        taxonomic_rank: p.taxonomic_rank,
      };
    }
    if (p.penular) entri.vector = p.penular;
    entri.symptoms = { id: p.gejala };
    entri.distinguishing = bangunPembanding(p.pembanding);
    entri.notes = { id: CATATAN(kel.tanaman) };
    kurasi.push(entri);
    olehId.set(entri.id, entri);
    naik.push(`${p.dari ?? '(baru)'} → ${p.id} ${p.label}`);
  }
}

// Satu entri tidak boleh dipegang PINTU sekaligus PERLUAS. Keduanya menulis medan yang
// sama, jadi yang terjadi bukan salah satu menang melainkan keduanya bergantian menang
// tiap kali alat dijalankan — dan alat yang tidak pernah diam adalah alat yang tidak bisa
// dipakai memeriksa apakah masih ada yang perlu diubah. Entri yang lahir dari PINTU
// memegang seluruh medannya di sana; PERLUAS hanya untuk yang lahir di luar alat ini.
const idPintu = new Set(KELOMPOK.flatMap((k) => k.pintu).map((p) => p.id));
for (const x of PERLUAS) if (idPintu.has(x.id)) bantah.push(`${x.id} ada di PINTU sekaligus PERLUAS; pindahkan seluruh medannya ke PINTU.`);
// Id kembar DI DALAM satu tabel, dan ini bukan kehati-hatian berlebihan: `inang` memasang
// himpunan inang PERSIS, jadi dua entri untuk id yang sama membuat yang belakangan
// membatalkan yang duluan — diam-diam, dengan kedua entri terlihat benar sendiri-sendiri.
// Kambuhnya sudah terjadi: entri tungau merah dan lalat buah ditambahkan di kepala tabel
// sementara entri lamanya masih di ekor, dan Tomat yang baru ditambahkan langsung dibuang
// lagi pada langkah berikutnya di jalannya yang sama.
for (const [nama, tabel] of [['PINTU', [...idPintu]], ['PERLUAS', PERLUAS.map((x) => x.id)]]) {
  const kali = new Map();
  for (const id of tabel) kali.set(id, (kali.get(id) ?? 0) + 1);
  for (const [id, n] of kali) if (n > 1) bantah.push(`${id} muncul ${n} kali di ${nama}; entri belakangan membatalkan yang duluan. Satukan medannya jadi satu entri.`);
}

for (const x of PERLUAS) {
  const e = olehId.get(x.id);
  if (!e) { bantah.push(`${x.id} tidak ada — entri yang mau diperluas hilang.`); continue; }
  if (e.label?.id !== x.nama) { bantah.push(`${x.id} berlabel "${e.label?.id}", diharapkan "${x.nama}".`); continue; }
  const ubah = [];
  if (x.penular && e.vector?.id !== x.penular.id) { e.vector = x.penular; ubah.push('penular'); }
  const kabarInang = x.inang && rapatkanInang(e, x.inang);
  if (kabarInang) ubah.push(kabarInang);
  if (x.definition && e.definition?.id !== x.definition) { e.definition = { id: x.definition }; ubah.push('definition'); }
  // Teks gejala pada PERLUAS SENGAJA menimpa: entri yang melayani banyak komoditas hanya
  // boleh punya satu bunyi, dan bunyi itu ada di sini. Bedanya dengan pintu di atas —
  // di sana yang sudah ada dibiarkan supaya tinjauan tidak terhapus — dinyatakan supaya
  // tidak terbaca sebagai kelalaian: perluasan memang mengubah kalimatnya, karena tanaman
  // yang dilayaninya bertambah.
  if (x.gejala && e.symptoms?.id !== x.gejala) { e.symptoms = { id: x.gejala }; ubah.push('gejala'); }
  if (x.pembanding) {
    const baru = bangunPembanding(x.pembanding);
    if (JSON.stringify(e.distinguishing) !== JSON.stringify(baru)) { e.distinguishing = baru; ubah.push('ciri pembanding'); }
  }
  if (ubah.length) {
    e.lifecycle = { ...(e.lifecycle ?? {}), updated_at: STAMP };
    disegarkan.push(`${x.id} ${x.nama} — ${ubah.join(', ')}`);
  }
}

// ---------------------------------------------------------------------------
// Rantai penggantian diratakan
// ---------------------------------------------------------------------------
// Entitas yang dinaikkan sudah lebih dulu jadi tujuan penggantian bagi salah ketiknya
// sendiri: "Spodoptera exiqua" menunjuk op:pst:00001019, dan op:pst:00001019 kini
// menunjuk op:pst:00000011. L29 menolak rantai seperti itu, dan benar menolaknya —
// rujukan yang harus dikejar dua langkah adalah rujukan yang suatu saat akan dikejar
// setengah langkah oleh pembaca yang lain. Perataan ini sama dengan yang dikerjakan
// satukan-opt-kembar.mjs, dan sengaja dijalankan tiap kali, bukan hanya saat ada yang
// baru naik: rantai bisa terbentuk dari arah mana saja.
{
  const ujung = (id) => {
    const lewat = new Set();
    let kini = id;
    while (olehId.get(kini)?.lifecycle?.superseded_by?.id) {
      const lanjut = olehId.get(kini).lifecycle.superseded_by.id;
      if (lewat.has(lanjut)) { bantah.push(`rantai penggantian berputar di ${lanjut}.`); break; }
      lewat.add(lanjut);
      kini = lanjut;
    }
    return kini;
  };
  for (const e of [...kurasi, ...registri]) {
    const tuju = e.lifecycle?.superseded_by?.id;
    if (!tuju) continue;
    const akhir = ujung(tuju);
    if (akhir === tuju) continue;
    e.lifecycle = { ...e.lifecycle, superseded_by: { id: akhir }, updated_at: STAMP };
    diratakan += 1;
  }
}

// Rujukan `rules_out` diperiksa sesudah semuanya masuk: pintu saling menunjuk, dan yang
// ditunjuk belum tentu sudah dibuat saat gilirannya tiba. Labelnya IKUT DISEGARKAN, bukan
// sekadar diperiksa — ia salinan tampilan, dan pintu yang berganti nama ("Pengorok daun"
// jadi "Pengorok daun bawang" begitu ada pengorok daun kedua) meninggalkan salinan basi
// di entri tetangganya. Yang tetap ditolak: menunjuk entitas yang tidak ada atau yang
// sudah digantikan.
let labelDisegarkan = 0;
let rujukanDiarahkan = 0;
for (const e of kurasi) {
  for (const d of e.distinguishing ?? []) {
    let r = d.rules_out?.id;
    if (!r) continue;
    // Entri yang DIBANTAH bisa ikut dinaikkan pada jalannya alat ini juga: nematoda puru
    // akar sempat jadi rujukan bagi pintu nematoda sista kuning sebagai entitas registri,
    // lalu naik jadi pintu tersendiri. Rujukan yang tertinggal diarahkan ke penerusnya —
    // menolaknya berarti menyuruh orang menyunting tangan sesuatu yang alat ini sendiri
    // yang menggesernya.
    while (olehId.get(r)?.lifecycle?.superseded_by?.id) {
      r = olehId.get(r).lifecycle.superseded_by.id;
      d.rules_out.id = r;
      rujukanDiarahkan += 1;
    }
    const t = olehId.get(r);
    if (!t) { bantah.push(`${e.id} membantah ${r} yang tidak ada.`); continue; }
    if (d.rules_out.label !== t.label?.id) { d.rules_out.label = t.label?.id; labelDisegarkan += 1; }
  }
  const v = e.vector?.id && olehId.get(e.vector.id);
  if (e.vector && !v) bantah.push(`${e.id} menyebut penular ${e.vector.id} yang tidak ada.`);
  else if (v && e.vector.label !== v.label?.id) { e.vector.label = v.label?.id; labelDisegarkan += 1; }
}

// CAKUP dipasang di sini, sesudah semua pintu berdiri dan sesudah rantai diratakan —
// supaya sasaran yang hari ini baru saja digantikan tidak sempat masuk sebagai cakupan.
let cakupDipasang = 0;
{
  const punyaPintu = new Set(kurasi.map((e) => e.id));
  // CAKUP menyatakan KEADAAN, bukan tambahan: pintu yang tidak ada di tabel ini wajib
  // tidak punya `covers` sama sekali. Tanpa baris ini, menghapus sekelompok cakupan dari
  // tabel meninggalkan nilai lamanya hidup di pest.json — dan itu bukan kemungkinan
  // teoretis: cakupan Aphis glycines pada kutu daun kapas harus dicabut begitu ia naik
  // jadi pintu kutu daun kedelai, dan alat ini diam saja sampai penjagaannya dipasang.
  const disebut = new Set(CAKUP.map((g) => g.pintu));
  // Pintu kembar di dalam CAKUP sendiri, dan ini kambuh yang kelima dengan bentuk yang
  // sama: kelompok belakangan MENGGANTI `covers` kelompok duluan, bukan menambahnya, jadi
  // cakupan Scirpophaga innotata lenyap tanpa suara begitu kelompok kedua untuk pintu yang
  // sama ditulis. Yang menyakitkan justru bahwa tabel ini baru saja dibuat menyatakan
  // keadaan — dan sifat itu yang membuat kelompok kedua membatalkan yang pertama.
  if (disebut.size !== CAKUP.length) {
    const kali = new Map();
    for (const g of CAKUP) kali.set(g.pintu, (kali.get(g.pintu) ?? 0) + 1);
    for (const [id, n] of kali) if (n > 1) bantah.push(`${id} punya ${n} kelompok di CAKUP; yang belakangan mengganti yang duluan. Satukan sasarannya jadi satu kelompok.`);
  }
  for (const e of kurasi) {
    if (disebut.has(e.id) || !e.covers) continue;
    delete e.covers;
    cakupDipasang += 1;
  }
  for (const g of CAKUP) {
    const pintu = olehId.get(g.pintu);
    if (!pintu) { bantah.push(`${g.pintu} tidak ada — pintu yang mau diberi cakupan hilang.`); continue; }
    if (!punyaPintu.has(g.pintu)) { bantah.push(`${g.pintu} bukan pintu terkurasi; cakupan hanya boleh dipasang pada pintu.`); continue; }
    const isi = [];
    for (const c of g.cakup) {
      const t = olehId.get(c.id);
      if (!t) { bantah.push(`${g.pintu} mencakup ${c.id} yang tidak ada.`); continue; }
      if (t.label?.id !== c.nama) { bantah.push(`${c.id} berlabel "${t.label?.id}", diharapkan "${c.nama}". Entri registri berubah; periksa dulu sebelum mencakupnya.`); continue; }
      if (t.lifecycle?.status === 'superseded') { bantah.push(`${g.pintu} mencakup ${c.id} yang sudah digantikan ${t.lifecycle?.superseded_by?.id}; cakup penerusnya, atau hapus barisnya kalau penerusnya pintu ini sendiri.`); continue; }
      if (punyaPintu.has(c.id)) { bantah.push(`${c.id} sudah jadi pintu sendiri; ia tidak boleh sekaligus dicakup pintu lain.`); continue; }
      if (!c.dasar || c.dasar.length < 60) { bantah.push(`${g.pintu} → ${c.id}: dasar cakupan terlalu pendek untuk diperiksa orang lain.`); continue; }
      // "Semarga" bukan dasar — itu justru yang dicoba dan gagal. Kalau seluruh dasarnya
      // cuma menyebut kekerabatan, ia ditolak.
      if (!/[a-z]/.test(c.dasar.replace(/[^a-z]/g, '')) || /^\s*(se)?marga\b/i.test(c.dasar)) { bantah.push(`${g.pintu} → ${c.id}: dasar harus menyebut ciri lapangannya, bukan kekerabatannya.`); continue; }
      isi.push({ pest: { id: c.id, label: t.label?.id }, dasar: c.dasar });
    }
    const lama = JSON.stringify(pintu.covers ?? null);
    if (isi.length) pintu.covers = isi; else delete pintu.covers;
    if (JSON.stringify(pintu.covers ?? null) !== lama) cakupDipasang += 1;
  }
}

// Cakupan koleksi tidak lagi cabai saja. Membiarkannya berbunyi "OPT utama cabai"
// sementara isinya empat komoditas adalah cara paling murah membuat berkas ini berbohong.
const tanamanKoleksi = [...new Set(kurasi.flatMap((e) => (e.hosts ?? []).map((h) => h.label)))].sort();
bungkusKurasi.collection.label = { id: `OPT utama ${tanamanKoleksi.join(', ').replace(/, ([^,]*)$/, ' dan $1').toLowerCase()}` };
bungkusKurasi.collection.scope = {
  id:
    `OPT yang paling menentukan hasil dan biaya pada ${tanamanKoleksi.length} komoditas: ${tanamanKoleksi.join(', ')}. ` +
    'Entri yang melayani lebih dari satu komoditas membawa teks gejala berklausa per tanaman, karena kalimat yang ' +
    'menyamaratakan akan salah di semuanya. Kode EPPO diisi sebagai kandidat dan SEMUANYA masih bertanda perlu ' +
    'verifikasi — pemeriksa akan terus memperingatkan sampai dicek satu per satu.',
};
bungkusKurasi.collection.lifecycle = { ...bungkusKurasi.collection.lifecycle, updated_at: STAMP, review_due: '2027-02-28' };

kurasi.sort((a, b) => a.id.localeCompare(b.id));

// ---------------------------------------------------------------------------
// label_uses: pest.id lama → id baru
// ---------------------------------------------------------------------------
const pindah = new Map(KELOMPOK.flatMap((k) => k.pintu).filter((p) => p.dari).map((p) => [p.dari, p.id]));
const baris = readFileSync(NDJSON, 'utf8').split('\n');
let ubahRekaman = 0;
let ubahBaris = 0;
const baruNdjson = baris.map((b) => {
  if (!b.trim()) return b;
  const p = JSON.parse(b);
  let kena = false;
  for (const u of p.label_uses ?? []) {
    const tuju = u.pest?.id && pindah.get(u.pest.id);
    if (!tuju) continue;
    u.pest.id = tuju;
    kena = true;
    ubahBaris += 1;
  }
  if (kena) ubahRekaman += 1;
  return kena ? JSON.stringify(p) : b;
});

// ---------------------------------------------------------------------------

if (bantah.length) {
  for (const b of bantah) console.error(`  TOLAK  ${b}`);
  console.error(`\n${bantah.length} penolakan — tidak ada yang ditulis.`);
  process.exit(1);
}

for (const n of naik) console.log(`  naik      ${n}`);
for (const d of disegarkan) console.log(`  segar     ${d}`);
console.log(`\n  pest.json                 — ${naik.length} entri baru, ${disegarkan.length} disegarkan, ${labelDisegarkan} salinan label, ${rujukanDiarahkan} rujukan diarahkan, ${kurasi.length} seluruhnya`);
console.log(`  pest-registri.json        — ${pindah.size} entitas jadi superseded, ${diratakan} rantai diratakan`);
console.log(`  product/pestisida.ndjson  — ${ubahRekaman} rekaman, ${ubahBaris} baris penggunaan`);
console.log(`  cakupan sasaran berspesies lain: ${cakupDipasang} pintu diperbarui, ${CAKUP.reduce((n, g) => n + g.cakup.length, 0)} sasaran ditulis tangan`);
console.log(`  ${dilewati.length} entri dilewati tanpa perubahan`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyimpan.');
  process.exit(0);
}

writeFileSync(join(VOCAB, 'pest.json'), JSON.stringify(bungkusKurasi, null, 2) + '\n');
writeFileSync(join(VOCAB, 'pest-registri.json'), JSON.stringify(bungkusRegistri, null, 2) + '\n');
writeFileSync(NDJSON, baruNdjson.join('\n'));
console.log('\nDitulis.');
