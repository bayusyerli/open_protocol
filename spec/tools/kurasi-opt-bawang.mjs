// Membuka pintu gejala jalur 1 untuk komoditas KEDUA: bawang merah.
//
//   node spec/tools/kurasi-opt-bawang.mjs            # periksa saja
//   node spec/tools/kurasi-opt-bawang.mjs --tulis    # tulis perubahannya
//
// KENAPA BAWANG MERAH, DAN KENAPA BUKAN PADI
// Padi lebih besar di setiap kolom — 59 OPT non-gulma, 1.421 baris penggunaan, 1.035
// produk terjangkau lawan 32 · 808 · 758 milik bawang merah. Yang menentukan bukan
// besarnya, melainkan BENTUK KEGAGALANNYA: bawang merah gagal dengan cara yang sama
// seperti cabai — penyemprotan sangat sering, biaya input mendominasi, dan salah kenal
// langsung jadi rupiah. Tiga OPT saja menutup 78% baris penggunaannya, dan dua di
// antaranya persis pasangan yang tertukar di kebun (ulat bawang lawan pengorok daun,
// keduanya membuat daun menerawang). Itu tepat bentuk blok "pastikan dulu".
//
// KENAPA ENTRI BARU, BUKAN MENAMBAH MEDAN PADA ENTRI REGISTRI
// Delapan dari sepuluh OPT ini sudah punya entitas di vocab/pest-registri.json. Menambah
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
// sama persis dengan satukan-opt-kembar.mjs, dan sudah dipakai 17 kali untuk salah
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
// dipakai di kebun — "Ulat bawang", "Bercak ungu", "Busuk leher umbi". Label registri
// tidak hilang; ia turun jadi synonyms dan tetap bisa dicari. Kunci lama juga tidak
// didaur ulang: entri yang digantikan tetap memegangnya, dan L1 menghitungnya.
//
// SATU YANG TIDAK PUNYA KEMBARAN REGISTRI, DAN ITU DISENGAJA
// Virus mosaik bawang tidak punya satu pun produk terdaftar, jadi ia tidak pernah muncul
// di label mana pun dan tidak punya entitas registri. Ia tetap dibuat, karena layar
// "jangan beli apa pun untuk ini" adalah layar paling bernilai di seluruh jalur — dan
// pada bawang merah jawabannya bukan semprotan melainkan umbi bibit, yang menyerahkannya
// ke jalur 4. Pemetaan luarnya sengaja KOSONG dengan alasan tertulis: kode EPPO yang
// tidak diperiksa ke sumbernya lebih buruk daripada tidak ada kode.
//
// SEBARAN KOMODITAS MENENTUKAN ENTITAS MANA YANG BOLEH DINAIKKAN
// Satu entitas OPT memegang SATU teks gejala, sementara satu patogen bisa terdaftar di
// belasan tanaman. Menaikkan entitas polifag lalu menuliskan gejala bawang merah di
// atasnya berarti membuka pintu bergejala bawang untuk tanaman lain yang belum dikurasi.
// Karena itu tiap calon diperiksa sebarannya lebih dulu, dan satu calon gugur:
//
//   Colletotrichum gloeosporioides   49 baris — mangga 20, cabai 12, bawang merah 5
//   Colletotrichum circinans          5 baris — bawang merah 5, dan tidak di mana pun lagi
//
// Antraknosa bawang ("otomatis") karena itu naik lewat C. circinans, bukan lewat entitas
// yang namanya lebih sering disebut literatur. Harganya dinyatakan di `definition` entri
// itu, tidak disembunyikan: lima produk yang terdaftar atas nama C. gloeosporioides
// tidak ikut terdaftar di bawah pintunya. Pola yang sama berlaku untuk pengorok daun,
// yang naik lewat Liriomyza chinensis dan meninggalkan 32 baris atas nama L. huidobrensis
// dan Liriomyza sp. Ulat tanah dinaikkan walau polifag, karena gejalanya memang sama di
// kentang, jagung, cabai, dan kubis — dan teksnya sengaja tidak menyebut satu tanaman pun.
//
// DUA ENTRI CABAI IKUT DIPERLUAS, BUKAN DIGANDAKAN
// Fusarium oxysporum (moler) dan Myzus persicae sudah terkurasi untuk cabai dan
// terdaftar juga pada bawang merah — 13 dan 16 baris. Membuat entri kedua untuk takson
// yang sama akan melanggar andaian satukan-opt-kembar.mjs ("nol entitas berbagi
// scientific_name yang sama persis") dan membuat L26 menyalak, karena label produk
// menulis "Fusarium oxysporum" polos tanpa forma specialis. Jadi keduanya diperluas:
// `hosts` bertambah, dan teks gejalanya menyebut kedua tanaman secara terpisah. Teks
// gejala yang menyamaratakan dua tanaman akan salah pada keduanya.
//
// AKIBATNYA spec/tools/tulis-gejala-opt.mjs TIDAK LAGI BERWENANG PENUH atas kedua entri
// itu. Alat ini yang terakhir bicara; kalau alat itu dijalankan ulang, jalankan alat ini
// sesudahnya.
//
// Idempoten: entri yang sudah ada dilewati, dan penulisan ulang label_uses hanya
// menyentuh yang masih menunjuk id lama.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VOCAB = join(akar, 'spec', 'vocab');
const NDJSON = join(VOCAB, 'product', 'pestisida.ndjson');
const STAMP = '2026-08-28T00:00:00Z';
const tulis = process.argv.includes('--tulis');

const INANG = { id: 'op:cmd:00000004', label: 'Bawang merah' };

const CATATAN =
  'Teks gejala dan ciri pembanding disusun dari pengetahuan agronomi mapan tentang OPT bawang merah, bukan dari registri. ' +
  'Berstatus draft: wajib ditinjau penyuluh atau BPTP sebelum dipakai sebagai dasar keputusan.';

// ---------------------------------------------------------------------------
// Sepuluh pintu
// ---------------------------------------------------------------------------
// `dari` menyebut entitas registri yang dinaikkan; null berarti entri baru sama sekali.
// `nama` dipakai penjaga: kalau label entri registri berubah, entri ini sudah menunjuk
// hal lain dan alat berhenti, bukan menaikkan organisme yang keliru.
const PINTU = [
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
        membantah: { id: 'op:pst:00000012', label: 'Pengorok daun' },
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
    label: 'Pengorok daun',
    definition:
      'Lalat pengorok daun bawang. Registri juga mendaftarkan Liriomyza huidobrensis dan Liriomyza sp. sebagai sasaran pada bawang merah — 32 baris penggunaan lagi. Keduanya tidak bisa dibedakan dari lorongnya di kebun, dan produk yang terdaftar atas nama itu TIDAK ikut terdaftar di bawah pintu ini.',
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
        membantah: { id: 'op:pst:00000012', label: 'Pengorok daun' },
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

// ---------------------------------------------------------------------------
// Dua entri cabai yang diperluas
// ---------------------------------------------------------------------------
// Teks lama TIDAK dibuang, ia dibuka jadi dua kalimat bertanaman. Menyamaratakan dua
// tanaman dalam satu kalimat gejala akan salah pada keduanya: layu fusarium pada cabai
// menguningkan daun bawah lebih dulu, sementara pada bawang merah yang khas justru daun
// yang MELENGKUNG terpelintir — dari situ nama "moler".
const PERLUAS = [
  {
    // Bukan perluasan inang, melainkan pemindahan pengetahuan yang tadinya hidup sebagai
    // TEBAKAN NAMA di app/jalur-1.js: layar nol-produk mencari penular dengan mencocokkan
    // /kutu kebul/i pada label yang dibantah. Itu bekerja selama satu-satunya virus yang
    // dikurasi virus cabai. Begitu virus bawang masuk, penularnya kutu daun persik dan
    // tombolnya diam-diam hilang. Penular karena itu kini dinyatakan pada entitasnya.
    id: 'op:pst:00000010',
    nama: 'Virus kuning keriting',
    penular: { id: 'op:pst:00000003', label: 'Kutu kebul' },
  },
  {
    id: 'op:pst:00000008',
    nama: 'Layu fusarium',
    gejala:
      'Pada cabai tanaman layu perlahan selama beberapa hari; daun bawah menguning lebih dulu, sering hanya pada satu sisi tanaman, dan layunya menetap walau tanah lembap. Pada bawang merah daun menguning dari ujung lalu MELENGKUNG dan terpelintir — dari situ nama moler — dan tanaman mudah tercabut karena dasar umbinya sudah membusuk.',
    pembanding: [
      {
        cek: 'Belah pangkal batang atau umbi membujur. Pada cabai pembuluh di dalamnya coklat memanjang sementara jaringan lain masih putih. Pada bawang merah dasar umbi tempat akar keluar membusuk kecoklatan, sering berselaput putih seperti kapas.',
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
    gejala:
      'Pada cabai daun muda mengeriting ke BAWAH dan mengerut. Pada bawang merah kutu berkelompok di ketiak daun dan pangkal umbi, dan daunnya tidak mengeriting sejelas itu — yang lebih dulu terlihat justru permukaan yang lengket. Pada keduanya daun lengket sering ditumbuhi jelaga hitam, dan semut naik-turun di tanaman.',
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
const dilewati = [];
const diperluas = [];
let diratakan = 0;

for (const p of PINTU) {
  if (olehId.has(p.id)) {
    // Entri yang sudah ada tidak dibangun ulang — teksnya boleh sudah disunting tangan
    // sesudah tinjauan, dan menimpanya akan menghapus hasil tinjauan itu. Yang tetap
    // dirapatkan hanya `vector`, karena ia bukan prosa melainkan rujukan: layar
    // nol-produk memakainya, dan yang salah di sana mengarahkan orang menyemprot
    // serangga yang tidak menularkan apa pun.
    const ada = olehId.get(p.id);
    if (p.penular && ada.vector?.id !== p.penular.id) {
      ada.vector = p.penular;
      diperluas.push(`${p.id} ${p.label} — penular dinyatakan: ${p.penular.label}`);
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
      hosts: [INANG],
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
      hosts: [INANG],
      ...(p.definition ? { definition: { id: p.definition } } : {}),
      no_mapping_reason: p.no_mapping_reason,
      lifecycle: { version: '0.1.0', status: 'draft', created_at: STAMP },
      taxonomic_rank: p.taxonomic_rank,
    };
  }
  if (p.penular) entri.vector = p.penular;
  entri.symptoms = { id: p.gejala };
  entri.distinguishing = p.pembanding.map((c) => ({
    check: { id: c.cek },
    ...(c.membantah ? { rules_out: c.membantah } : {}),
  }));
  entri.notes = { id: CATATAN };
  kurasi.push(entri);
  olehId.set(entri.id, entri);
  naik.push(`${p.dari ?? '(baru)'} → ${p.id} ${p.label}`);
}

// ---------------------------------------------------------------------------
// Rantai penggantian diratakan
// ---------------------------------------------------------------------------
// Delapan entitas yang dinaikkan sudah lebih dulu jadi tujuan penggantian bagi salah
// ketiknya sendiri: "Spodoptera exiqua" menunjuk op:pst:00001019, dan op:pst:00001019
// kini menunjuk op:pst:00000011. L29 menolak rantai seperti itu, dan benar menolaknya —
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
  let rata = 0;
  for (const e of [...kurasi, ...registri]) {
    const tuju = e.lifecycle?.superseded_by?.id;
    if (!tuju) continue;
    const akhir = ujung(tuju);
    if (akhir === tuju) continue;
    e.lifecycle = { ...e.lifecycle, superseded_by: { id: akhir }, updated_at: STAMP };
    rata += 1;
  }
  if (rata) diratakan = rata;
}

// Rujukan `rules_out` diperiksa sesudah semuanya masuk: pintu saling menunjuk, dan
// yang ditunjuk belum tentu sudah dibuat saat gilirannya tiba.
for (const e of kurasi) {
  for (const d of e.distinguishing ?? []) {
    const r = d.rules_out?.id;
    if (!r) continue;
    const t = olehId.get(r);
    if (!t) bantah.push(`${e.id} membantah ${r} yang tidak ada.`);
    else if (t.label?.id !== d.rules_out.label) bantah.push(`${e.id} menyebut ${r} sebagai "${d.rules_out.label}" padahal labelnya "${t.label?.id}".`);
    else if (t.lifecycle?.status === 'superseded') bantah.push(`${e.id} membantah ${r} yang sudah digantikan.`);
  }
}

for (const x of PERLUAS) {
  const e = olehId.get(x.id);
  if (!e) { bantah.push(`${x.id} tidak ada — entri cabai yang mau diperluas hilang.`); continue; }
  if (e.label?.id !== x.nama) { bantah.push(`${x.id} berlabel "${e.label?.id}", diharapkan "${x.nama}".`); continue; }
  if (x.penular) {
    const baru = e.vector?.id !== x.penular.id;
    e.vector = x.penular;
    if (baru) diperluas.push(`${x.id} ${x.nama} — penular dinyatakan: ${x.penular.label}`);
  }
  if (!x.gejala) { e.lifecycle = { ...(e.lifecycle ?? {}), updated_at: STAMP }; continue; }
  const sudah = (e.hosts ?? []).some((h) => h.id === INANG.id);
  if (!sudah) e.hosts = [...(e.hosts ?? []), INANG];
  const berubah = e.symptoms?.id !== x.gejala;
  e.symptoms = { id: x.gejala };
  if (x.pembanding) {
    e.distinguishing = x.pembanding.map((c) => ({
      check: { id: c.cek },
      ...(c.membantah ? { rules_out: c.membantah } : {}),
    }));
  }
  e.lifecycle = { ...(e.lifecycle ?? {}), updated_at: STAMP };
  if (!sudah || berubah) diperluas.push(`${x.id} ${x.nama} — inang bertambah bawang merah${berubah ? ', teks gejala dibuka jadi dua tanaman' : ''}`);
}

// Cakupan koleksi tidak lagi cabai saja. Membiarkannya berbunyi "OPT utama cabai"
// sementara isinya dua komoditas adalah cara paling murah membuat berkas ini berbohong.
bungkusKurasi.collection.label = { id: 'OPT utama cabai dan bawang merah' };
bungkusKurasi.collection.scope = {
  id:
    'OPT yang paling menentukan hasil dan biaya pada dua komoditas: sepuluh untuk cabai dan sepuluh untuk bawang merah, ' +
    'dua di antaranya (layu fusarium dan kutu daun persik) dipakai bersama. Kode EPPO diisi sebagai kandidat dan ' +
    'SEMUANYA masih bertanda perlu verifikasi — pemeriksa akan terus memperingatkan sampai dicek satu per satu.',
};
bungkusKurasi.collection.lifecycle = { ...bungkusKurasi.collection.lifecycle, updated_at: STAMP, review_due: '2027-02-28' };

kurasi.sort((a, b) => a.id.localeCompare(b.id));

// ---------------------------------------------------------------------------
// label_uses: pest.id lama → id baru
// ---------------------------------------------------------------------------
const pindah = new Map(PINTU.filter((p) => p.dari).map((p) => [p.dari, p.id]));
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
for (const d of diperluas) console.log(`  perluas   ${d}`);
for (const d of dilewati) console.log(`  lewat     ${d}`);
console.log(`\n  pest.json                 — ${naik.length} entri baru, ${diperluas.length} diperluas, ${kurasi.length} seluruhnya`);
console.log(`  pest-registri.json        — ${pindah.size} entitas jadi superseded, ${diratakan} rantai diratakan`);
console.log(`  product/pestisida.ndjson  — ${ubahRekaman} rekaman, ${ubahBaris} baris penggunaan`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyimpan.');
  process.exit(0);
}

writeFileSync(join(VOCAB, 'pest.json'), JSON.stringify(bungkusKurasi, null, 2) + '\n');
writeFileSync(join(VOCAB, 'pest-registri.json'), JSON.stringify(bungkusRegistri, null, 2) + '\n');
writeFileSync(NDJSON, baruNdjson.join('\n'));
console.log('\nDitulis.');
