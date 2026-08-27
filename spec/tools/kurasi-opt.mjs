// Membuka pintu gejala jalur 1, satu komoditas demi satu komoditas.
//
//   node spec/tools/kurasi-opt.mjs            # periksa saja
//   node spec/tools/kurasi-opt.mjs --tulis    # tulis perubahannya
//
// Sudah dipakai untuk: bawang merah (28 Agustus 2026), tomat & kentang (28 Agustus 2026).
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
    inang: [TOMAT, CABAI],
    definition:
      'Polifag: terdaftar juga pada jagung (19 baris), tembakau, semangka, dan melon, dan cara merusaknya sama di semuanya — karena itu teks di bawah sengaja tidak menyebut satu tanaman pun. Registri masih memuatnya DUA KALI, atas nama Helicoverpa armigera dan nama lamanya Heliothis armigera (13 baris lagi, 8 di antaranya pada tomat); keduanya belum disatukan, jadi produk atas nama yang kedua tidak ikut terdaftar di bawah pintu ini.',
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

const KELOMPOK = [
  { kunci: 'bawang-merah', tanaman: 'bawang merah', inang: [BAWANG_MERAH], pintu: PINTU_BAWANG },
  { kunci: 'tomat-kentang', tanaman: 'tomat dan kentang', inang: [TOMAT, KENTANG], pintu: PINTU_TOMAT_KENTANG },
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
    inang: [CABAI, BAWANG_MERAH, TOMAT, KENTANG],
    definition:
      'Vektor beberapa virus penting, termasuk virus penggulung daun pada kentang. Mengendalikannya melindungi tanaman yang BELUM terkena, dan tidak menyembuhkan satu pun yang sudah bergejala.',
    gejala:
      'Pada cabai, tomat, dan kentang daun muda mengeriting ke BAWAH dan mengerut. Pada bawang merah kutu berkelompok di ketiak daun dan pangkal umbi, dan daunnya tidak mengeriting sejelas itu — yang lebih dulu terlihat justru permukaan yang lengket. Pada semuanya daun lengket sering ditumbuhi jelaga hitam, dan semut naik-turun di tanaman.',
  },
  { id: 'op:pst:00000003', nama: 'Kutu kebul', inang: [CABAI, TOMAT, KENTANG] },
  { id: 'op:pst:00000005', nama: 'Ulat grayak', inang: [CABAI, TOMAT, KENTANG] },
  { id: 'op:pst:00000014', nama: 'Ulat tanah', inang: [BAWANG_MERAH, KENTANG] },
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

// Menambah inang tanpa menduakan yang sudah ada. Urutannya ikut daftar yang diminta,
// karena `hosts` ikut terbaca manusia di docs/14 dan urutan acak menyulitkan pembacaan.
const rapatkanInang = (e, minta) => {
  const ada = new Map((e.hosts ?? []).map((h) => [h.id, h]));
  let berubah = false;
  for (const h of minta) if (!ada.has(h.id)) { ada.set(h.id, h); berubah = true; }
  if (berubah) e.hosts = [...ada.values()];
  return berubah;
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
      if (rapatkanInang(ada, inang)) ubah.push('inang');
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

for (const x of PERLUAS) {
  const e = olehId.get(x.id);
  if (!e) { bantah.push(`${x.id} tidak ada — entri yang mau diperluas hilang.`); continue; }
  if (e.label?.id !== x.nama) { bantah.push(`${x.id} berlabel "${e.label?.id}", diharapkan "${x.nama}".`); continue; }
  const ubah = [];
  if (x.penular && e.vector?.id !== x.penular.id) { e.vector = x.penular; ubah.push('penular'); }
  if (x.inang && rapatkanInang(e, x.inang)) ubah.push('inang');
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
