// Membuka pintu gejala jalur 1, satu komoditas demi satu komoditas.
//
//   node spec/tools/kurasi-opt.mjs            # periksa saja
//   node spec/tools/kurasi-opt.mjs --tulis    # tulis perubahannya
//
// Sudah dipakai untuk: bawang merah, tomat & kentang, padi, jagung, kubis, kedelai,
// kakao, dan kopi (seluruhnya 28 Agustus 2026).
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
const CABAI = { id: 'op:cmd:00000001', label: 'Cabai merah besar' };
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
    definition:
      'Lalat pengorok daun bawang. Registri juga mendaftarkan Liriomyza huidobrensis pada bawang merah (24 baris) — spesies yang tidak bisa dibedakan dari lorongnya di kebun, dan yang sejak kurasi tomat & kentang punya pintunya sendiri, "Pengorok daun kentang", karena teksnya ditulis untuk daun lebar. Yang tetap di luar kedua pintu hanya 8 baris atas nama Liriomyza sp.',
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
    inang: [BAWANG_MERAH, KENTANG, JAGUNG, KUBIS],
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
    inang: [KENTANG, TOMAT],
    definition:
      'Lalat pengorok daun berdaun lebar. Registri juga mendaftarkannya pada bawang merah (24 baris), mentimun, krisan, cabai, dan seledri. Teks di bawah ditulis untuk daun LEBAR; pada bawang merah lorongnya berjalan di dalam daun yang berongga dan pintunya berdiri sendiri, atas nama Liriomyza chinensis.',
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
    inang: [TOMAT, CABAI, JAGUNG],
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
    inang: [KENTANG, TOMAT],
    definition:
      'Trips ketiga yang dikurasi, dan ketiganya TIDAK BISA dibedakan satu sama lain di kebun — pemisahannya menuntut preparat dan mikroskop. Yang membedakan pintunya karena itu TANAMANNYA, bukan spesiesnya: Thrips parvispinus untuk cabai, Thrips tabaci untuk bawang merah, dan yang ini untuk kentang dan tomat. Registri juga mendaftarkannya pada semangka, melon, dan kacang panjang.',
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
        membantah: { id: 'op:pst:00001223', label: 'Nematoda Puru Akar' },
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
    definition:
      'Terdaftar juga pada padi dan kelapa sawit (3 baris), dan cara merusaknya sama di semuanya — teks di bawah karena itu sengaja tidak menyebut satu tanaman pun. Registri memecah belalang jadi beberapa entitas: Locusta sp. (7 baris pada jagung), Oxya sp. (3), dan Patanga succincta (2), semuanya belum disatukan dan tidak ikut terdaftar di bawah pintu ini.',
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
    label: 'Lalat bibit jagung',
    definition:
      'Menyerang tanaman berumur kurang dari tiga minggu; sesudah itu batangnya sudah terlalu keras. Registri memecahnya jadi tiga entitas — Atherigona sp. (9 baris), Atherigona exigua (8), dan Atherigona oryzae (2) — dan hanya yang kedua cocok tepat sampai spesies di GBIF. Pintu ini berdiri di atasnya; sebelas baris atas nama dua entitas lain tidak ikut terdaftar di sini, dan ketiganya toh tidak bisa dibedakan di kebun.',
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
        membantah: { id: 'op:pst:00000046', label: 'Lalat bibit jagung' },
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
    definition:
      'Paling merusak di persemaian dan pada dua sampai tiga minggu pertama sesudah tanam pindah; aktif malam hari dan sesudah hujan. Registri juga memuat siput lain — Filicaulis bleekeri, Bradybaena similaris, Parmarion pupillaris — masing-masing satu sampai dua baris, semuanya belum disatukan dan tidak ikut terdaftar di bawah pintu ini.',
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
    definition:
      'Menyerang pada dua minggu pertama sesudah tumbuh; sesudah itu batangnya sudah terlalu keras. Registri memecahnya jadi empat entitas — Ophiomyia phaseoli (23 baris), Agromyza sp. (12), Agromyza phaseoli (7), dan ejaan Ophiornya phaseoli (1) — dan tiga yang terakhir nama genus lama untuk lalat yang sama. Pintu ini berdiri di atas yang pertama; sembilan belas baris atas nama tiga entitas lain tidak ikut terdaftar di sini.',
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

const KELOMPOK = [
  { kunci: 'bawang-merah', tanaman: 'bawang merah', inang: [BAWANG_MERAH], pintu: PINTU_BAWANG },
  { kunci: 'tomat-kentang', tanaman: 'tomat dan kentang', inang: [TOMAT, KENTANG], pintu: PINTU_TOMAT_KENTANG },
  { kunci: 'padi', tanaman: 'padi', inang: [PADI], pintu: PINTU_PADI },
  { kunci: 'jagung', tanaman: 'jagung', inang: [JAGUNG], pintu: PINTU_JAGUNG },
  { kunci: 'kubis', tanaman: 'kubis', inang: [KUBIS], pintu: PINTU_KUBIS },
  { kunci: 'kedelai', tanaman: 'kedelai', inang: [KEDELAI], pintu: PINTU_KEDELAI },
  { kunci: 'kakao', tanaman: 'kakao', inang: [KAKAO], pintu: PINTU_KAKAO },
  { kunci: 'kopi', tanaman: 'kopi', inang: [KOPI], pintu: PINTU_KOPI },
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
    inang: [CABAI, BAWANG_MERAH, TOMAT, KENTANG, KUBIS],
    definition:
      'Vektor beberapa virus penting, termasuk virus penggulung daun pada kentang. Mengendalikannya melindungi tanaman yang BELUM terkena, dan tidak menyembuhkan satu pun yang sudah bergejala.',
    gejala:
      'Pada cabai, tomat, dan kentang daun muda mengeriting ke BAWAH dan mengerut. Pada bawang merah kutu berkelompok di ketiak daun dan pangkal umbi, dan daunnya tidak mengeriting sejelas itu — yang lebih dulu terlihat justru permukaan yang lengket. Pada kubis kutu berkelompok rapat di permukaan bawah daun luar dan di sela daun krop, sering berselaput lilin kelabu. Pada semuanya daun lengket sering ditumbuhi jelaga hitam, dan semut naik-turun di tanaman.',
  },
  { id: 'op:pst:00000003', nama: 'Kutu kebul', inang: [CABAI, TOMAT, KENTANG, KEDELAI] },
  {
    id: 'op:pst:00000005',
    nama: 'Ulat grayak',
    inang: [CABAI, TOMAT, KENTANG, JAGUNG, KEDELAI],
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
for (const e of kurasi) {
  for (const d of e.distinguishing ?? []) {
    const r = d.rules_out?.id;
    if (!r) continue;
    const t = olehId.get(r);
    if (!t) { bantah.push(`${e.id} membantah ${r} yang tidak ada.`); continue; }
    if (t.lifecycle?.status === 'superseded') { bantah.push(`${e.id} membantah ${r} yang sudah digantikan.`); continue; }
    if (d.rules_out.label !== t.label?.id) { d.rules_out.label = t.label?.id; labelDisegarkan += 1; }
  }
  const v = e.vector?.id && olehId.get(e.vector.id);
  if (e.vector && !v) bantah.push(`${e.id} menyebut penular ${e.vector.id} yang tidak ada.`);
  else if (v && e.vector.label !== v.label?.id) { e.vector.label = v.label?.id; labelDisegarkan += 1; }
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
console.log(`\n  pest.json                 — ${naik.length} entri baru, ${disegarkan.length} disegarkan, ${labelDisegarkan} salinan label dirapatkan, ${kurasi.length} seluruhnya`);
console.log(`  pest-registri.json        — ${pindah.size} entitas jadi superseded, ${diratakan} rantai diratakan`);
console.log(`  product/pestisida.ndjson  — ${ubahRekaman} rekaman, ${ubahBaris} baris penggunaan`);
console.log(`  ${dilewati.length} entri dilewati tanpa perubahan`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyimpan.');
  process.exit(0);
}

writeFileSync(join(VOCAB, 'pest.json'), JSON.stringify(bungkusKurasi, null, 2) + '\n');
writeFileSync(join(VOCAB, 'pest-registri.json'), JSON.stringify(bungkusRegistri, null, 2) + '\n');
writeFileSync(NDJSON, baruNdjson.join('\n'));
console.log('\nDitulis.');
