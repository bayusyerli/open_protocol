// Menggabungkan substance id kembar — satu bahan aktif yang terlanjur terdaftar
// sebagai lebih dari satu entitas — pada vocab/substance-pestisida.json dan
// vocab/product/pestisida.ndjson.
//
// Registri Kementan menuliskan hal-hal yang bukan nama ke dalam FIELD NAMA BAHAN.
// Pembangun kosakata memperlakukan setiap string unik sebagai satu entitas, jadi
// bahan yang sama pecah jadi beberapa id. Ada lima bentuknya di berkas ini:
//
//   kesetaraan   "2,4-D dimetil amina" vs "2,4-D dimetil amina (setara dengan
//                2,4-D 720 g/l)" — anotasi kesetaraan ikut masuk ke nama
//   kadar        "Mankozeb" vs "mankozeb (mancozeb) : 80%"
//   nama-inggris "Metomil" vs "Metomil (Methomyl)"; "Fipronil" vs "Fipronil (Fipronil)"
//   ejaan        "dimeflutrin" vs "dimeflutrhin"; "Isopropilamina Glifosat" vs
//                "ISOPROPIL AMINA GLIFOSAT"
//   tanda-baca   "Diafenthiuron" vs "Diafenthiuron."
//
// Kalau dua id itu muncul pada pendaftaran yang SAMA, kadarnya terjumlah dua kali.
// Lima di antaranya melampaui 1.000 g per kg/L dan tertangkap L27 (Mega 9 865 SL,
// AMCOMIN 865 SL, DIMINA 720 SL, GALATOP 620 SL, RONDA GOLD 525 SL). Tiga puluh satu
// sisanya TIDAK tertangkap — jumlah gandanya masih di bawah 1.000 g/l (KILL UP 480/1
// SL 961, RUSO 485 SL 970) atau kadarnya dalam persen, yang memang tidak dijumlahkan
// L27 sama sekali (PRAMEX 40 SP 40 % + 40 %). Penjumlahan ganda yang diam itu justru
// yang paling berbahaya: tidak ada peringatan yang menyalak.
//
// Penggabungan yang cukup luas juga bisa MEMUNCULKAN sengketa kadar: begitu dua id
// jadi satu, dua angka berbeda untuk bahan yang sama bertemu di satu pendaftaran. Tiga
// pendaftaran parakuat kena — KONTAXONE 310 SL, SINARTOP 280 SL, JAGOQUAT 288 SL,
// semuanya melawan 276 g/l, kadar parakuat paling lazim di registri dan paling mudah
// terbawa sebagai nilai bawaan. Itu bukan ulangan dan tidak boleh didedup buta;
// putusannya ditulis satu per satu di tabel PRODUK, dan tanpa putusan skrip berhenti.
//
// Sebagian pasangan di tabel ini TIDAK pernah berbarengan di satu pendaftaran, jadi
// tidak ada kadar yang terjumlah dua kali dan tidak ada peringatan apa pun yang bisa
// menemukannya — "SIPERMETRIN" 277 rekaman berdampingan dengan "Sipermetrin
// (cypermethrin)" 6 rekaman, dua id untuk piretroid yang sama. Yang rusak di situ
// bukan satu pendaftaran melainkan penjumlahan lintas pendaftaran: siapa pun yang
// menghitung paparan sipermetrin akan kehilangan enam produk tanpa tahu.
//
// Ini keputusan KOSAKATA, bukan keputusan ulangan. Itu sebabnya ia terpisah dari
// dedup-komposisi-pestisida.mjs, yang hanya boleh membuang baris kembar dalam satu
// substance id. Urutan jalannya: dedup dulu, gabung id sesudahnya.
//
//   node spec/tools/dedup-komposisi-pestisida.mjs
//   node spec/tools/gabung-id-zat-kembar.mjs
//
// ID TIDAK DIDAUR ULANG. Entitas yang kalah tidak dihapus: statusnya jadi
// "superseded" dan lifecycle.superseded_by-nya menunjuk yang menang, sehingga
// ejaan registri yang asli tetap bisa ditelusuri dan rujukan lama tetap sampai.
// Aturan L29 menegakkannya — begitu berkas ini dibangun ulang dan pemetaan namanya
// jatuh lagi ke id yang sudah digantikan, pemeriksa menolaknya, bukan mendiamkannya.
//
// Yang TIDAK digabung: INTERPHERE VP memuat (Z)-9-Octadecenal dan (Z)-9-Hexadecenal
// masing-masing 4,5 %. Namanya mirip dan kadarnya sama, tetapi keduanya komponen
// feromon yang berbeda. Kemiripan nama bukan bukti; yang dipakai di sini nama bahan
// sesudah anotasinya dilepas, dan untuk garam, aritmetika kesetaraannya.
//
// Sumber: pukpes_data/raw/pestisida_terdaftar.json (field bahanAktif), tarikan
// 19 Agustus 2026. Jalankan dari akar repositori.
//
// Idempoten: putusan dipakai dari tabel, bukan dari kembar yang masih terlihat di
// berkas — kalau tidak, catatannya ikut hilang begitu jalan pertama selesai. Setiap
// penggabungan diuji balik ke bahanAktif mentah: nama yang kalah harus benar-benar
// ada pada pendaftaran itu, dan kadar yang bertahan harus ada di sumber. Rekaman
// yang tidak berubah wajib keluar sama persis seperti aslinya.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RAW = join(root, 'pukpes_data', 'raw', 'pestisida_terdaftar.json');
const NDJSON = join(root, 'spec', 'vocab', 'product', 'pestisida.ndjson');
const ZAT = join(root, 'spec', 'vocab', 'substance-pestisida.json');
const STAMP = '2026-08-19T00:00:00Z';

// Paragraf milik skrip ini pada notes selalu diawali penanda ini. Rekaman yang
// notes-nya juga ditulis dedup-komposisi-pestisida.mjs jadi bisa dipakai berdua:
// masing-masing skrip hanya menulis ulang paragrafnya sendiri.
const PENANDA = 'Penggabungan id zat: ';

// ---------------------------------------------------------------------------
// 1. Lima bentuk cacat, dan apa yang pantas dilakukan pada masing-masing.
//
//    'synonim' menentukan apakah nama yang kalah naik jadi synonyms pada entitas
//    yang menang. Nama yang cuma beda ejaan, padanan Inggris, atau tanda baca —
//    pantas, itu memang nama bahannya dan orang akan mencarinya. Nama yang sudah
//    tercampur kadar atau kesetaraan — tidak: itu anotasi pendaftaran, bukan nama
//    bahan, dan tempatnya memang pada entitas yang digantikan.
// ---------------------------------------------------------------------------
const JENIS = {
  kesetaraan: {
    synonim: false,
    kalimat: 'Registri menuliskan keterangan kesetaraan ke dalam field nama bahan',
    zat: 'Nama bahannya sama sesudah keterangan kesetaraan dilepas; anotasi itu milik pendaftaran, bukan bagian dari nama bahan.',
  },
  'nama-inggris': {
    synonim: true,
    kalimat: 'Registri menempelkan padanan Inggris ke belakang nama Indonesianya',
    zat: 'Nama yang sama dengan padanan Inggrisnya ditempelkan di belakang.',
  },
  ejaan: {
    synonim: true,
    kalimat: 'Sumber menuliskan nama bahannya dengan ejaan yang berbeda',
    zat: 'Ejaan lain untuk bahan yang sama — beda spasi, kapitalisasi, atau huruf.',
  },
  kadar: {
    synonim: false,
    kalimat: 'Registri menuliskan kadar ke dalam field nama bahan',
    zat: 'Nama bahannya sama sesudah kadarnya dilepas; angka itu milik pendaftaran, bukan bagian dari nama bahan.',
  },
  'tanda-baca': {
    synonim: true,
    kalimat: 'Sumber menempelkan tanda baca nyasar ke ujung nama bahannya',
    zat: 'Nama yang sama dengan tanda baca nyasar di ujungnya.',
  },
};

const GABUNG = {

  // --- Ejaan yang cuma beda kapitalisasi, spasi, atau tanda baca -------------
  // 106 id di bawah ini dihasilkan spec/tools/satukan-aksi-zat-ejaan.mjs --tabel,
  // yang juga menyatukan pesticide_action pada kanoniknya lebih dulu supaya
  // penjagaan "pindahkan dulu" di berkas ini tidak perlu dilonggarkan.
  "op:sub:00001425": {
    kanonik: "op:sub:00000126",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Lamda Sihalotrin\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000126 karena bentuk terbanyak di registri: 81 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001424": {
    kanonik: "op:sub:00000126",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Lamda Sihalotrin\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000126 karena bentuk terbanyak di registri: 81 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000242": {
    kanonik: "op:sub:00000122",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2,4-D DIMETIL AMINA\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000122 karena bentuk terbanyak di registri: 74 rekaman lawan 7. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000511": {
    kanonik: "op:sub:00000122",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2,4-D DIMETIL AMINA\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000122 karena bentuk terbanyak di registri: 74 rekaman lawan 4. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000725": {
    kanonik: "op:sub:00000122",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2,4-D DIMETIL AMINA\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000122 karena bentuk terbanyak di registri: 74 rekaman lawan 2. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000753": {
    kanonik: "op:sub:00000145",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Butil Sihalofop\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000145 karena bentuk terbanyak di registri: 33 rekaman lawan 2. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000318": {
    kanonik: "op:sub:00000152",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Alfa Sipermetrin\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000152 karena bentuk terbanyak di registri: 28 rekaman lawan 5. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000736": {
    kanonik: "op:sub:00000152",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Alfa Sipermetrin\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000152 karena bentuk terbanyak di registri: 28 rekaman lawan 2. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000751": {
    kanonik: "op:sub:00000171",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Beta Siflutrin\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000171 karena bentuk terbanyak di registri: 23 rekaman lawan 2. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001114": {
    kanonik: "op:sub:00000171",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Beta Siflutrin\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000171 karena bentuk terbanyak di registri: 23 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000287": {
    kanonik: "op:sub:00000219",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"LAMBDA CYHALOTHRIN\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000219 karena bentuk terbanyak di registri: 20 rekaman lawan 5. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000828": {
    kanonik: "op:sub:00000211",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"L-amonium glufosinat\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000211 karena bentuk terbanyak di registri: 7 rekaman lawan 2. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000939": {
    kanonik: "op:sub:00000221",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2,4-D dimetil amina (setara dengan 2,4-D : 720 g/l)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000221 karena bentuk terbanyak di registri: 10 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000964": {
    kanonik: "op:sub:00000221",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2,4-D dimetil amina (setara dengan 2,4-D : 720 g/l)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000221 karena bentuk terbanyak di registri: 10 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000953": {
    kanonik: "op:sub:00000221",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2,4-D dimetil amina (setara dengan 2,4-D : 720 g/l)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000221 karena bentuk terbanyak di registri: 10 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000513": {
    kanonik: "op:sub:00000221",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2,4-D dimetil amina (setara dengan 2,4-D : 720 g/l)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000221 karena bentuk terbanyak di registri: 10 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001599": {
    kanonik: "op:sub:00000228",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Sihalofop butil\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000228 karena bentuk terbanyak di registri: 11 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000584": {
    kanonik: "op:sub:00000236",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"1,2-Benzisothiazol-3(2H)-one\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000236 karena bentuk terbanyak di registri: 4 rekaman lawan 0. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000972": {
    kanonik: "op:sub:00000251",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2,4-D isopropil amina\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000251 karena bentuk terbanyak di registri: 4 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000451": {
    kanonik: "op:sub:00000257",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Glufosinate Ammonium\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000257 karena bentuk terbanyak di registri: 11 rekaman lawan 5. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001479": {
    kanonik: "op:sub:00000261",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Natrium bispiribak (bispyribac sodium)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000261 karena bentuk terbanyak di registri: 4 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001489": {
    kanonik: "op:sub:00000262",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Natrium para nitrofenol\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000262 karena bentuk terbanyak di registri: 5 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001494": {
    kanonik: "op:sub:00000262",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Natrium para nitrofenol\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000262 karena bentuk terbanyak di registri: 5 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001487": {
    kanonik: "op:sub:00000274",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Natrium orto nitrofenol\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000274 karena bentuk terbanyak di registri: 4 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001493": {
    kanonik: "op:sub:00000274",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Natrium orto nitrofenol\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000274 karena bentuk terbanyak di registri: 4 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000671": {
    kanonik: "op:sub:00000293",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Natrium 5 nitroguaiakol\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (3 lawan 3), jadi yang dipakai op:sub:00000293 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001491": {
    kanonik: "op:sub:00000293",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Natrium 5 nitroguaiakol\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000293 karena bentuk terbanyak di registri: 3 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001492": {
    kanonik: "op:sub:00000293",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Natrium 5 nitroguaiakol\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000293 karena bentuk terbanyak di registri: 3 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000562": {
    kanonik: "op:sub:00000293",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Natrium 5 nitroguaiakol\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000293 karena bentuk terbanyak di registri: 3 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000634": {
    kanonik: "op:sub:00000302",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Fluroksipir meptil\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000302 karena bentuk terbanyak di registri: 10 rekaman lawan 3. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001477": {
    kanonik: "op:sub:00000308",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Natrium 2,4 dinitrofenol\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000308 karena bentuk terbanyak di registri: 2 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001478": {
    kanonik: "op:sub:00000308",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Natrium 2,4 dinitrofenol\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000308 karena bentuk terbanyak di registri: 2 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001475": {
    kanonik: "op:sub:00000308",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Natrium 2,4 dinitrofenol\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000308 karena bentuk terbanyak di registri: 2 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000696": {
    kanonik: "op:sub:00000315",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Triclopyr Butoxy Ethyl Ester\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000315 karena bentuk terbanyak di registri: 6 rekaman lawan 3. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000560": {
    kanonik: "op:sub:00000351",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Metsulfuron-methyl\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000351 karena bentuk terbanyak di registri: 6 rekaman lawan 4. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001125": {
    kanonik: "op:sub:00000366",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"BPMC/Fenobucarb\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00000366 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000888": {
    kanonik: "op:sub:00000388",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Thiophanate-methyl\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (2 lawan 2), jadi yang dipakai op:sub:00000388 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000985": {
    kanonik: "op:sub:00000434",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2-Methyl-2H-isothiazol-3-one\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000434 karena bentuk terbanyak di registri: 1 rekaman lawan 0. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000435": {
    kanonik: "op:sub:00000596",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"3-iodo-2-propynyl-butylcarbamate\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000596 karena bentuk terbanyak di registri: 2 rekaman lawan 0. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001003": {
    kanonik: "op:sub:00000596",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"3-iodo-2-propynyl-butylcarbamate\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000596 karena bentuk terbanyak di registri: 2 rekaman lawan 0. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001002": {
    kanonik: "op:sub:00000596",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"3-iodo-2-propynyl-butylcarbamate\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000596 karena bentuk terbanyak di registri: 2 rekaman lawan 0. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000440": {
    kanonik: "op:sub:00000608",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Beta-Cyfluthrin\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000608 karena bentuk terbanyak di registri: 3 rekaman lawan 2. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001275": {
    kanonik: "op:sub:00000449",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Fluroksipir Meptil Heptil Ester\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000449 karena bentuk terbanyak di registri: 3 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000510": {
    kanonik: "op:sub:00000705",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"1,2-benzisothiazol-3(2H)-one (BIT)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00000705 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000912": {
    kanonik: "op:sub:00000705",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"1,2-benzisothiazol-3(2H)-one (BIT)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00000705 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000515": {
    kanonik: "op:sub:00000512",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2,4-D Natrium\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000512 karena bentuk terbanyak di registri: 4 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001042": {
    kanonik: "op:sub:00000520",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Alpha Cypermethrin\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000520 karena bentuk terbanyak di registri: 4 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001041": {
    kanonik: "op:sub:00000520",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Alpha Cypermethrin\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000520 karena bentuk terbanyak di registri: 4 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001103": {
    kanonik: "op:sub:00000530",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Bensulfuron metil\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000530 karena bentuk terbanyak di registri: 4 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001137": {
    kanonik: "op:sub:00000532",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Butil sihalofop (Cyhalofop-butyl)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000532 karena bentuk terbanyak di registri: 4 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000540": {
    kanonik: "op:sub:00000782",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"ethyl 4-methyloctanoate\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000782 karena bentuk terbanyak di registri: 2 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000795": {
    kanonik: "op:sub:00000548",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"FLUROXYPYR-MEPTYL\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000548 karena bentuk terbanyak di registri: 4 rekaman lawan 2. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001485": {
    kanonik: "op:sub:00000563",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"natrium-o-nitrofenol\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00000563 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001488": {
    kanonik: "op:sub:00000564",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"natrium-p-nitrofenol\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00000564 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001584": {
    kanonik: "op:sub:00000573",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Pyrazosulfuron-ethyl\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000573 karena bentuk terbanyak di registri: 4 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000582": {
    kanonik: "op:sub:00001664",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Trichoderma sp\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00001664 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000583": {
    kanonik: "op:sub:00001673",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Triklopir butoksi etil ester (setara dengan triklopir 480 g/l)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00001673 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000586": {
    kanonik: "op:sub:00000913",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"1,2-Benzisothiazolin-3-one\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00000913 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000981": {
    kanonik: "op:sub:00000993",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2-Octyl-2H-isothiazol-3-one\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00000993 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000980": {
    kanonik: "op:sub:00000993",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2-Octyl-2H-isothiazol-3-one\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00000993 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000589": {
    kanonik: "op:sub:00000993",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2-Octyl-2H-isothiazol-3-one\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00000993 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000706": {
    kanonik: "op:sub:00000993",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2-Octyl-2H-isothiazol-3-one\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00000993 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000929": {
    kanonik: "op:sub:00000993",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2-Octyl-2H-isothiazol-3-one\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00000993 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000930": {
    kanonik: "op:sub:00000993",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2-Octyl-2H-isothiazol-3-one\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00000993 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000931": {
    kanonik: "op:sub:00000993",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2-Octyl-2H-isothiazol-3-one\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00000993 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000603": {
    kanonik: "op:sub:00000601",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Amonium glufosinat (setara dengan glufosinat 137 g/l)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (3 lawan 3), jadi yang dipakai op:sub:00000601 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000602": {
    kanonik: "op:sub:00001062",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Amonium glufosinat, setara dengan glufosinat 182,7 g/l\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00001062 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001052": {
    kanonik: "op:sub:00001062",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Amonium glufosinat, setara dengan glufosinat 182,7 g/l\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00001062 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001059": {
    kanonik: "op:sub:00001062",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Amonium glufosinat, setara dengan glufosinat 182,7 g/l\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00001062 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001055": {
    kanonik: "op:sub:00001062",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Amonium glufosinat, setara dengan glufosinat 182,7 g/l\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00001062 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001118": {
    kanonik: "op:sub:00000609",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Bispiribak sodium\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000609 karena bentuk terbanyak di registri: 3 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000853": {
    kanonik: "op:sub:00000675",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"p-menthane-3,8-diol\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000675 karena bentuk terbanyak di registri: 3 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001592": {
    kanonik: "op:sub:00000685",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Reaction mass of 5-chloro-2-methyl-2H-isothiazol-3-one and 2-methyl-2H-isothiazol-3-one (3:1)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00000685 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000707": {
    kanonik: "op:sub:00000721",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2-methylisothiazol-3(2H)-one\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00000721 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000936": {
    kanonik: "op:sub:00000710",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2,4-D Dimethyl amine\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00000710 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000977": {
    kanonik: "op:sub:00000710",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2,4-D Dimethyl amine\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00000710 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000711": {
    kanonik: "op:sub:00000712",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2,4-D dimethylammonium\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (2 lawan 2), jadi yang dipakai op:sub:00000712 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000979": {
    kanonik: "op:sub:00000716",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2,4-D DMA\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000716 karena bentuk terbanyak di registri: 2 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000720": {
    kanonik: "op:sub:00000719",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2-methyl-2H-isothiazol-3-one (MIT)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000719 karena bentuk terbanyak di registri: 1 rekaman lawan 0. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001005": {
    kanonik: "op:sub:00000727",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"3-iodo-2-propynyl butylcarbamate (IPBC)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00000727 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001004": {
    kanonik: "op:sub:00000727",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"3-iodo-2-propynyl butylcarbamate (IPBC)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00000727 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001027": {
    kanonik: "op:sub:00000732",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"6-Benzylaminopurine\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000732 karena bentuk terbanyak di registri: 2 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000742": {
    kanonik: "op:sub:00000740",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Amonium glufosinat (Setara dengan glufosinat 183 g/l)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (2 lawan 2), jadi yang dipakai op:sub:00000740 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001065": {
    kanonik: "op:sub:00000743",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Asam 1-naptilasetik\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000743 karena bentuk terbanyak di registri: 2 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001066": {
    kanonik: "op:sub:00000743",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Asam 1-naptilasetik\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000743 karena bentuk terbanyak di registri: 2 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001083": {
    kanonik: "op:sub:00000746",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Atrazin (Atrazine)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000746 karena bentuk terbanyak di registri: 2 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001105": {
    kanonik: "op:sub:00000750",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Benzil florpirauksifen (Florpyrauxifen-benzyl)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000750 karena bentuk terbanyak di registri: 2 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001148": {
    kanonik: "op:sub:00000758",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Chlorimuron Ethyl\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000758 karena bentuk terbanyak di registri: 2 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001255": {
    kanonik: "op:sub:00000787",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Florilpikoksamid (Florylpicoxamid)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000787 karena bentuk terbanyak di registri: 2 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000800": {
    kanonik: "op:sub:00001286",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Gliocladium sp\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00001286 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001422": {
    kanonik: "op:sub:00000830",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"L-Glufosinate Ammonium\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000830 karena bentuk terbanyak di registri: 2 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001423": {
    kanonik: "op:sub:00000831",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Lamda sihalotrin (lambda cyhalothrin)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000831 karena bentuk terbanyak di registri: 2 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001440": {
    kanonik: "op:sub:00000836",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Mesotrion (Mesotrione)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000836 karena bentuk terbanyak di registri: 2 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001567": {
    kanonik: "op:sub:00000863",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Pirazosulfuron etil\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Yang dipakai op:sub:00000863 karena bentuk terbanyak di registri: 2 rekaman lawan 1. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000915": {
    kanonik: "op:sub:00000914",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"1,2-Benzisothiazolin-3-one (BIT-84%)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00000914 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000924": {
    kanonik: "op:sub:00000926",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"1-naphthylacetic acid\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00000926 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000965": {
    kanonik: "op:sub:00000963",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"2,4-D dimetil amina setara dengan 2,4 D 718 g/l\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00000963 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001007": {
    kanonik: "op:sub:00001008",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"4,5-dichloro-2-octyl-2H-isothiazol-3-one\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00001008 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001014": {
    kanonik: "op:sub:00001013",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"5 Chloro - 2 Methyl - 2H- Isothiazol 3 One and 2Methyl - 2 H - Isothiazol - 3 one\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00001013 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001101": {
    kanonik: "op:sub:00001102",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Bensulfuron methyl\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00001102 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001109": {
    kanonik: "op:sub:00001108",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Benzyl-C12-14 alkyldimethyl,  ammonium chlorides\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00001108 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001113": {
    kanonik: "op:sub:00001111",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"beta cypermethrin\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00001111 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001290": {
    kanonik: "op:sub:00001289",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"glufosinate-p ammonium\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00001289 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001498": {
    kanonik: "op:sub:00001499",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Nikosulfuron (Nicosulfuron)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00001499 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00001688": {
    kanonik: "op:sub:00001687",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Zeta sipermetrin\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (1 lawan 1), jadi yang dipakai op:sub:00001687 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00005080": {
    kanonik: "op:sub:00005044",
    jenis: "ejaan",
    dasar:
      "Deret huruf dan angkanya identik dengan \"Monokrotofos (monocrotophos)\" sesudah kapitalisasi, spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang berbeda angka tidak akan pernah bertemu di sini. Rekamannya seri (0 lawan 0), jadi yang dipakai op:sub:00005044 karena labelnya lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah yang paling sedikit pemisah nyasarnya. Kedua id tidak pernah muncul pada pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.",
  },
  "op:sub:00000138": {
    kanonik: "op:sub:00000102",
    jenis: "ejaan",
    dasar:
      "Dua id bersih untuk garam yang sama, berbeda spasi saja. Yang dipakai op:sub:00000102 " +
      "karena ia bentuk terbanyak di registri — 209 rekaman lawan 49. Tiebreaker \"paling " +
      "sering muncul\" itu yang sama dipakai konvensi penyeragaman nama principal. Putaran " +
      "sebelumnya sempat memilih arah kebalikannya; keputusan ini yang berlaku.",
  },
  "op:sub:00000157": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000172": {
    kanonik: "op:sub:00000104",
    jenis: "nama-inggris",
    dasar:
      "Nama Inggris polos tanpa anotasi apa pun, dan pemegang id terbesar kedua pada parakuat " +
      "— 31 rekaman. Membiarkannya berarti membiarkan registri parakuat terbelah dua.",
  },
  "op:sub:00000180": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000258": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000260": {
    kanonik: "op:sub:00000114",
    jenis: "nama-inggris",
  },
  "op:sub:00000284": {
    kanonik: "op:sub:00000102",
    jenis: "ejaan",
    dasar:
      "Urutan katanya dibalik — glifosat di depan, nama garamnya di belakang.",
  },
  "op:sub:00000305": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000309": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000329": {
    kanonik: "op:sub:00000106",
    jenis: "nama-inggris",
  },
  "op:sub:00000345": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nama depannya salah ketik, \"Isoporpil\" alih-alih \"Isopropil\". Nisbah kesetaraan yang " +
      "ditulis registri, 0,741, adalah nisbah bobot molekul glifosat asam terhadap garam " +
      "isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk garam yang sama.",
  },
  "op:sub:00000346": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000347": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000354": {
    kanonik: "op:sub:00000104",
    jenis: "nama-inggris",
  },
  "op:sub:00000379": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000380": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000404": {
    kanonik: "op:sub:00000103",
    jenis: "nama-inggris",
  },
  "op:sub:00000412": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000417": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000418": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000419": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000424": {
    kanonik: "op:sub:00000101",
    jenis: "nama-inggris",
  },
  "op:sub:00000433": {
    kanonik: "op:sub:00000220",
    jenis: "nama-inggris",
  },
  "op:sub:00000436": {
    kanonik: "op:sub:00000007",
    jenis: "nama-inggris",
  },
  "op:sub:00000452": {
    kanonik: "op:sub:00000102",
    jenis: "nama-inggris",
  },
  "op:sub:00000463": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000464": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000465": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000484": {
    kanonik: "op:sub:00000403",
    jenis: "ejaan",
    dasar:
      "\"dimeflutrhin\" adalah \"dimeflutrin\" dengan huruf h tertukar. Keduanya piretroid obat " +
      "nyamuk bakar dari lini produk yang sama, dengan kadar yang sama.",
  },
  "op:sub:00000501": {
    kanonik: "op:sub:00000107",
    jenis: "nama-inggris",
  },
  "op:sub:00000526": {
    kanonik: "op:sub:00000112",
    jenis: "nama-inggris",
  },
  "op:sub:00000534": {
    kanonik: "op:sub:00000108",
    jenis: "nama-inggris",
  },
  "op:sub:00000553": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000555": {
    kanonik: "op:sub:00000110",
    jenis: "nama-inggris",
  },
  "op:sub:00000556": {
    kanonik: "op:sub:00000105",
    jenis: "nama-inggris",
  },
  "op:sub:00000593": {
    kanonik: "op:sub:00000122",
    jenis: "kesetaraan",
    dasar:
      "Nisbah 0,831 pada keterangan kesetaraannya adalah nisbah bobot molekul 2,4-D asam " +
      "terhadap garam dimetil aminanya.",
  },
  "op:sub:00000621": {
    kanonik: "op:sub:00000113",
    jenis: "nama-inggris",
  },
  "op:sub:00000641": {
    kanonik: "op:sub:00000134",
    jenis: "nama-inggris",
  },
  "op:sub:00000643": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000644": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000645": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000646": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000647": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000648": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000649": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000650": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000651": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000652": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000653": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000654": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000655": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000656": {
    kanonik: "op:sub:00000102",
    jenis: "nama-inggris",
  },
  "op:sub:00000673": {
    kanonik: "op:sub:00000127",
    jenis: "nama-inggris",
  },
  "op:sub:00000676": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000677": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000678": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000679": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000714": {
    kanonik: "op:sub:00000122",
    jenis: "kesetaraan",
    dasar:
      "Nisbah 0,831 pada keterangan kesetaraannya adalah nisbah bobot molekul 2,4-D asam " +
      "terhadap garam dimetil aminanya.",
  },
  "op:sub:00000802": {
    kanonik: "op:sub:00000102",
    jenis: "nama-inggris",
  },
  "op:sub:00000807": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000808": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000809": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000810": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000811": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000812": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000813": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000814": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000815": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000816": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000817": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000818": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000819": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000820": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000821": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000822": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000826": {
    kanonik: "op:sub:00000117",
    jenis: "nama-inggris",
  },
  "op:sub:00000847": {
    kanonik: "op:sub:00000384",
    jenis: "nama-inggris",
  },
  "op:sub:00000854": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000855": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000856": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000857": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000858": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00000862": {
    kanonik: "op:sub:00000123",
    jenis: "nama-inggris",
  },
  "op:sub:00000869": {
    kanonik: "op:sub:00000423",
    jenis: "nama-inggris",
  },
  "op:sub:00000938": {
    kanonik: "op:sub:00000122",
    jenis: "kesetaraan",
    dasar:
      "Seluruh baris label ikut masuk ke field nama bahan, lengkap dengan kadar dan " +
      "kesetaraannya. Nisbah 0,831 pada keterangan kesetaraannya adalah nisbah bobot molekul " +
      "2,4-D asam terhadap garam dimetil aminanya.",
  },
  "op:sub:00000942": {
    kanonik: "op:sub:00000590",
    jenis: "kesetaraan",
    dasar:
      "Nisbah 0,831 pada keterangan kesetaraannya adalah nisbah bobot molekul 2,4-D asam " +
      "terhadap garam dimetil aminanya.",
  },
  "op:sub:00001031": {
    kanonik: "op:sub:00000007",
    jenis: "nama-inggris",
    dasar:
      "Kurungnya bukan padanan Inggris melainkan isi campurannya, dan abamektin memang " +
      "campuran avermektin B1a dengan B1b — jadi yang disebut tetap bahan yang sama, hanya " +
      "diurai komponennya.",
  },
  "op:sub:00001074": {
    kanonik: "op:sub:00000128",
    jenis: "nama-inggris",
  },
  "op:sub:00001185": {
    kanonik: "op:sub:00000619",
    jenis: "tanda-baca",
  },
  "op:sub:00001203": {
    kanonik: "op:sub:00000132",
    jenis: "nama-inggris",
  },
  "op:sub:00001230": {
    kanonik: "op:sub:00000156",
    jenis: "nama-inggris",
  },
  "op:sub:00001251": {
    kanonik: "op:sub:00000109",
    jenis: "nama-inggris",
    dasar:
      "Padanan Inggrisnya sama persis dengan nama Indonesianya, jadi yang tersisa sesudah " +
      "kurungnya dilepas benar-benar nama yang sama.",
  },
  "op:sub:00001292": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001293": {
    kanonik: "op:sub:00000102",
    jenis: "nama-inggris",
  },
  "op:sub:00001296": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001297": {
    kanonik: "op:sub:00000102",
    jenis: "nama-inggris",
    dasar:
      "Ditulis sebagai aminanya, bukan garam amoniumnya; garam isopropilamina glifosat memang " +
      "terbentuk dari amina itu.",
  },
  "op:sub:00001298": {
    kanonik: "op:sub:00000102",
    jenis: "nama-inggris",
  },
  "op:sub:00001326": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001327": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001328": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001329": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001330": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001331": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001332": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001333": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001334": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001335": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001336": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001337": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001338": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001339": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001340": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001341": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001342": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001343": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001344": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001345": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001346": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001347": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001348": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001349": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001350": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001351": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001352": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001353": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001354": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001355": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001356": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001357": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001358": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001359": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001360": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001361": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001362": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001363": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001364": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001365": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001366": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001367": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001368": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001369": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001370": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001371": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001372": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001373": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001374": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001375": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001380": {
    kanonik: "op:sub:00000102",
    jenis: "nama-inggris",
  },
  "op:sub:00001381": {
    kanonik: "op:sub:00000102",
    jenis: "nama-inggris",
  },
  "op:sub:00001382": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001383": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001384": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001385": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001386": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001387": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001388": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001389": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001432": {
    kanonik: "op:sub:00000106",
    jenis: "kadar",
    dasar:
      "Namanya membawa dua anotasi sekaligus: padanan Inggris dan kadar 80 %. Kadarnya yang " +
      "menentukan perlakuan — nama seperti ini tidak pantas naik jadi synonyms, karena 80 % " +
      "milik satu pendaftaran, bukan sifat mankozeb.",
  },
  "op:sub:00001520": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001521": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001522": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001523": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001524": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001525": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001526": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001527": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001528": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001529": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001530": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001531": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001532": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001533": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001534": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001535": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001536": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001537": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001538": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001539": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001540": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001541": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001542": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001543": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001544": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001545": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001546": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001547": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah 0,724 pada keterangan kesetaraannya adalah nisbah bobot molekul ion parakuat " +
      "terhadap garam dikloridanya.",
  },
  "op:sub:00001548": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001549": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001550": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001551": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001552": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001553": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001554": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah 0,724 pada keterangan kesetaraannya adalah nisbah bobot molekul ion parakuat " +
      "terhadap garam dikloridanya.",
  },
  "op:sub:00001555": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001556": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001557": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001558": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,724, adalah nisbah bobot molekul ion " +
      "parakuat terhadap garam dikloridanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001595": {
    kanonik: "op:sub:00000234",
    jenis: "nama-inggris",
  },
  "op:sub:00001670": {
    kanonik: "op:sub:00000479",
    jenis: "nama-inggris",
  },
};
// total 46 id

// ---------------------------------------------------------------------------
// 2. Pendaftaran yang kehilangan entri, beserta bukti keadaan sebelumnya.
//
//    Angka di sini tidak dihitung dari berkas: sesudah jalan pertama ia tidak bisa
//    dihitung lagi, sementara catatannya harus tetap menyebut apa yang diperbaiki.
//    Pada jalan pertama keduanya diuji balik ke berkas; kalau meleset, skrip berhenti.
//    "l27" hanya diisi bila penjumlahan gandanya sampai menyalakan L27.
// ---------------------------------------------------------------------------
const PRODUK = {
  "acero-4-40-wp-01010120258736": { gabung: ["op:sub:00001185"], kembar: 1, l27: null },
  "alphatech-240-4-25-sl-01030120083169": { gabung: ["op:sub:00000654", "op:sub:00001384"], kembar: 1, l27: null },
  "alphatech-neo-245-sl-01030120237726": { gabung: ["op:sub:00000655", "op:sub:00001367"], kembar: 1, l27: null },
  "amcomin-865-sl-01030120011606": { gabung: ["op:sub:00000714"], kembar: 1, l27: 1730 },
  "bakar-150-sl-01030120227278": { gabung: ["op:sub:00001547"], kembar: 1, l27: null },
  "dimina-720-sl-01030120062510": { gabung: ["op:sub:00000942"], kembar: 1, l27: 1440 },
  "dkprotio-mix-390-sc-01020120186025": { gabung: ["op:sub:00000433", "op:sub:00000869"], kembar: 2, l27: null },
  "fitagill-1-55-3-10-sl-01040120248375": { gabung: ["op:sub:00001074"], kembar: 1, l27: null },
  "galatop-620-sl-01030120124225": { gabung: ["op:sub:00000820", "op:sub:00000138"], kembar: 1, l27: 1240 },
  "grass-buster-500-sl-01030120175714": { gabung: ["op:sub:00000802"], kembar: 1, l27: null },
  "hippo-400-sl-01010120175693": { gabung: ["op:sub:00000621"], kembar: 1, l27: null },
  "jagoquat-288-sl-01030120227542": {
    gabung: ["op:sub:00000419", "op:sub:00001538"],
    kembar: 0,
    l27: null,
    sengketa: {
      "op:sub:00000104": {
        pilih: { value: 288, unit: "g/L" },
        tolak: [{ value: 276, unit: "g/L" }],
        dasar:
          "Sengketanya diputus aritmetika di dalam pendaftaran itu sendiri. Nama bahan yang " +
          "membawa 288 g/l ikut menuliskan kesetaraannya, 209 g/l ion parakuat, dan 288 x 0,724 " +
          "= 208,6 - cocok. Baris 276 g/l membawa kesetaraan 200 g/l, yang benar untuk 276 " +
          "tetapi bukan untuk produk bernama 288. Angka pada nama dagang menunjuk arah yang " +
          "sama.",
      },
    },
  },
  "k-blutanil-75-wp-01020120237771": { gabung: ["op:sub:00000826"], kembar: 1, l27: null },
  "k-kingfield-60-20-wg-01010120237774": { gabung: ["op:sub:00000673", "op:sub:00000862"], kembar: 2, l27: null },
  "k-kinggold-10-wp-01030120237775": { gabung: ["op:sub:00001230"], kembar: 1, l27: null },
  "k-voltaz-180-120-sc-01010120237781": { gabung: ["op:sub:00000555", "op:sub:00000641"], kembar: 2, l27: null },
  "kill-up-480-1-sl-01030120072767": { gabung: ["op:sub:00000412"], kembar: 1, l27: null },
  "kill-up-neo-481-sl-01030120227547": { gabung: ["op:sub:00000811", "op:sub:00001369"], kembar: 1, l27: null },
  "kleenup-480-sl-0103011989819": { gabung: ["op:sub:00000452"], kembar: 1, l27: null },
  "kontaxone-310-sl-01030120114139": {
    gabung: ["op:sub:00000172"],
    kembar: 0,
    l27: null,
    sengketa: {
      "op:sub:00000104": {
        pilih: { value: 310, unit: "g/L" },
        tolak: [{ value: 276, unit: "g/L" }],
        dasar:
          "Angka pada nama dagang mengunci kadar di registri ini: pada 4.495 dari 4.508 produk " +
          "yang komposisinya tidak bersengketa, angka nama sama persis dengan kadar tercatat. " +
          "Dan 276 g/l adalah kadar parakuat diklorida paling lazim di seluruh registri, jadi " +
          "ia yang paling mudah terbawa sebagai nilai bawaan - dasar yang sama sudah dipakai " +
          "dedup-komposisi-pestisida.mjs untuk MARKOTOP 300 SL dan TOPJOS 300 SL.",
      },
    },
  },
  "lentra-200-sl-04110120072773": { gabung: ["op:sub:00000501"], kembar: 1, l27: null },
  "mateno-up-160-5-1-sl-01030120093350": { gabung: ["op:sub:00000818", "op:sub:00001382"], kembar: 1, l27: null },
  "mega-9-865-sl-01030120072778": { gabung: ["op:sub:00000938"], kembar: 1, l27: 1730 },
  "metindo-plus-42-wp-01010120175704": { gabung: ["op:sub:00000260", "op:sub:00000436"], kembar: 2, l27: null },
  "monoamonium-glifosat-45-tc-042000113": { gabung: ["op:sub:00000847"], kembar: 1, l27: null },
  "neo-pilarquat-137-sl-01030120227335": { gabung: ["op:sub:00001554"], kembar: 1, l27: null },
  "neomine-300-100-sl-01030120237790": { gabung: ["op:sub:00000593", "op:sub:00000647", "op:sub:00000819"], kembar: 2, l27: null },
  "nomos-0-2mc-06080120227337": { gabung: ["op:sub:00000484"], kembar: 1, l27: null },
  "polado-240-105-sl-01030119991467": { gabung: ["op:sub:00000802"], kembar: 1, l27: null },
  "pramex-40-sp-01010120227347": { gabung: ["op:sub:00000260"], kembar: 1, l27: null },
  "primabat-50-wp-01020120248418": { gabung: ["op:sub:00001203"], kembar: 1, l27: null },
  "primax-480-1-sl-01030120072791": { gabung: ["op:sub:00000346", "op:sub:00000412"], kembar: 1, l27: null },
  "pumaris-240-sl-01030119971309": { gabung: ["op:sub:00000651"], kembar: 1, l27: null },
  "ronda-gold-525-sl-01030120124437": { gabung: ["op:sub:00000813", "op:sub:00001387"], kembar: 1, l27: 1050 },
  "ruso-485-sl-01030120083224": { gabung: ["op:sub:00000650"], kembar: 1, l27: null },
  "setting-126-sl-01030120237810": { gabung: ["op:sub:00000821", "op:sub:00001358"], kembar: 1, l27: null },
  "sibiru-80-wp-01020120238061": { gabung: ["op:sub:00000329"], kembar: 1, l27: null },
  "sinartop-280-sl-01030120114170": {
    gabung: ["op:sub:00000172"],
    kembar: 0,
    l27: null,
    sengketa: {
      "op:sub:00000104": {
        pilih: { value: 280, unit: "g/L" },
        tolak: [{ value: 276, unit: "g/L" }],
        dasar:
          "Angka pada nama dagang, dan dua bukti lain sejalan: pendaftaran kembarannya di " +
          "sumber hanya memuat 280 g/l tanpa 276, sementara 280 x 0,724 = 202,8 g/l ion " +
          "parakuat - nilai yang memang berdiri sebagai entitas tersendiri di registri ini. 276 " +
          "g/l kadar parakuat paling lazim dan paling mudah terbawa sebagai nilai bawaan.",
      },
    },
  },
  "voraxor-250-125-sc-01030120227480": { gabung: ["op:sub:00001595", "op:sub:00001670"], kembar: 2, l27: null },
};
// total 33 pendaftaran bercatatan

// ---------------------------------------------------------------------------
// 3. Pembacaan sumber mentah — sama seperti pada dedup-komposisi-pestisida.mjs
// ---------------------------------------------------------------------------
const angka = (t) => {
  let s = String(t ?? '').trim();
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '');
  return Number(s.replace(',', '.'));
};

const SATUAN = {
  'g/l': 'g/L', 'ml/l': 'mL/L', 'mg/l': 'mg/L',
  'g/kg': 'g/kg', 'mg/kg': 'mg/kg', '%': '%',
  'g/m2': 'g/m2', 'mg/m2': 'mg/m2', 'mg/pcs': 'mg/pcs',
};
const TAK_DINYATAKAN = '*';

const satuan = (t) => {
  const s = String(t ?? '').trim().toLowerCase();
  if (!s || s === '-') return TAK_DINYATAKAN;
  return SATUAN[s] ?? String(t).trim();
};

// Nama bahan dibandingkan sesudah spasi ganda dirapikan dan huruf besar-kecilnya
// disamakan — registri menulis nama yang sama dengan spasi ekor ("isopropilamina
// glifosat ") dan kapitalisasi yang berubah-ubah.
const rapikan = (t) => String(t ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

function bahanMentah(bahanAktif) {
  let arr;
  try { arr = JSON.parse(bahanAktif || '[]'); } catch { return null; }
  if (!Array.isArray(arr)) return null;
  const nama = new Set();
  const kadar = new Set();
  for (const b of arr) {
    nama.add(rapikan(b?.namaBahan));
    const v = angka(b?.kadarBahan);
    if (Number.isFinite(v)) kadar.add(`${v}|${satuan(b?.satuanBahan)}`);
  }
  return { nama, kadar };
}

const adaDiSumber = (set, e) => set.has(`${e.value}|${e.unit}`) || set.has(`${e.value}|${TAK_DINYATAKAN}`);

// Penulis baris yang meniru json.dumps(obj, ensure_ascii=False) — berkas NDJSON-nya
// semula ditulis pembangun Python, dan menulis ulangnya dengan JSON.stringify bawaan
// Node akan mengubah ke-7.724 barisnya padahal yang berubah hanya seratusan.
// Kesetiaannya diuji di bawah terhadap setiap rekaman yang tidak berubah.
function tulisBarisPython(v) {
  if (v === null) return 'null';
  if (typeof v === 'number') return Number.isInteger(v) ? `${v}.0` : String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(tulisBarisPython).join(', ')}]`;
  return `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${tulisBarisPython(x)}`).join(', ')}}`;
}

// ---------------------------------------------------------------------------
// 4. Kosakata zat — status "superseded" dan tautan penggantinya
// ---------------------------------------------------------------------------
const zatAsli = readFileSync(ZAT, 'utf8');
const zatDoc = JSON.parse(zatAsli);
const zatById = new Map(zatDoc.items.map((e) => [e.id, e]));

const gagal = [];

// Rantai A→B→C membuat pemakai berhenti di tempat yang salah. Diperiksa lebih dulu
// supaya kesalahan tabel ketahuan sebelum apa pun ditulis.
for (const [lama, p] of Object.entries(GABUNG)) {
  if (GABUNG[p.kanonik]) {
    gagal.push(`${lama} digantikan ${p.kanonik}, tetapi ${p.kanonik} sendiri ikut digabung — ratakan dulu rantainya.`);
  }
  if (!JENIS[p.jenis]) gagal.push(`${lama} memakai jenis "${p.jenis}" yang tidak dikenal.`);
}

for (const [lama, p] of Object.entries(GABUNG)) {
  const kalah = zatById.get(lama);
  const menang = zatById.get(p.kanonik);
  if (!kalah) { gagal.push(`Entitas ${lama} tidak ada di kosakata.`); continue; }
  if (!menang) { gagal.push(`Entitas kanonik ${p.kanonik} tidak ada di kosakata.`); continue; }

  // Apa pun yang hanya dimiliki entitas yang kalah akan hilang begitu rujukannya
  // pindah. Lebih baik berhenti dan memindahkannya dengan sadar.
  for (const field of ['substance_classes', 'pesticide_action']) {
    const hilang = (kalah[field] ?? []).filter((x) => !(menang[field] ?? []).includes(x));
    if (hilang.length) {
      gagal.push(`${lama} punya ${field} ${hilang.join(', ')} yang tidak ada pada ${p.kanonik} — pindahkan dulu.`);
    }
  }
  const kode = (e) => new Set((e.mode_of_action ?? []).map((m) => `${m.scheme}:${m.code}`));
  const moaHilang = [...kode(kalah)].filter((x) => !kode(menang).has(x));
  if (moaHilang.length) {
    gagal.push(`${lama} punya mode_of_action ${moaHilang.join(', ')} yang tidak ada pada ${p.kanonik} — pindahkan dulu.`);
  }
  for (const field of ['cas_number', 'organism', 'hazard', 'default_unit']) {
    if (kalah[field] !== undefined && menang[field] === undefined) {
      gagal.push(`${lama} punya ${field} yang tidak ada pada ${p.kanonik} — pindahkan dulu.`);
    }
  }

  if (JENIS[p.jenis].synonim) {
    const tambahan = [kalah.label.id, ...(kalah.synonyms ?? [])];
    const synonyms = [...new Set([...(menang.synonyms ?? []), ...tambahan])];
    if (synonyms.length !== (menang.synonyms ?? []).length) {
      menang.synonyms = synonyms;
      menang.lifecycle = { ...menang.lifecycle, updated_at: STAMP };
    }
  }

  kalah.lifecycle = {
    ...kalah.lifecycle,
    status: 'superseded',
    updated_at: STAMP,
    superseded_by: { id: p.kanonik },
  };
  kalah.notes = {
    id:
      `Digantikan ${p.kanonik} "${menang.label.id}" — bahan yang sama, terdaftar lebih dari sekali ` +
      `karena namanya ditulis berbeda di registri. ${JENIS[p.jenis].zat}` +
      (p.dasar ? ` ${p.dasar}` : '') +
      ` Entitas ini sengaja tidak dihapus: ID tidak pernah didaur ulang, dan ejaan registri yang ` +
      `asli beserta pemetaannya masih perlu bisa ditelusuri.`,
  };
}

// ---------------------------------------------------------------------------
// 5. Registri produk — pemetaan ulang dan penggabungan entri
// ---------------------------------------------------------------------------
const rawJson = JSON.parse(readFileSync(RAW, 'utf8'));
const rows = Array.isArray(rawJson) ? rawJson : Object.values(rawJson).find(Array.isArray);
const barisAsli = readFileSync(NDJSON, 'utf8').trim().split('\n');
const records = barisAsli.map((l) => JSON.parse(l));
const berubah = new Set();

if (rows.length !== records.length) {
  gagal.push(`Jumlah tidak cocok: ${rows.length} baris di sumber, ${records.length} di NDJSON.`);
}

records.forEach((rec, i) => {
  const a = String(rec.label?.id ?? '').trim().toUpperCase();
  const b = String(rows[i]?.namaProduk ?? '').trim().toUpperCase();
  const na = String(rec.registration?.number ?? '').trim();
  const nb = String(rows[i]?.nomorPendaftaran ?? '').trim();
  if (a !== b || na !== nb) {
    gagal.push(`Urutan meleset di posisi ${i}: NDJSON "${a}" (${na}) vs sumber "${b}" (${nb}).`);
  }
});

if (gagal.length) {
  for (const b of gagal) console.error(b);
  process.exit(1);
}

const jumlahKadar = (komposisi) => (komposisi ?? [])
  .filter((c) => c.unit === 'g/kg' || c.unit === 'g/L')
  .reduce((n, c) => n + c.value, 0);

// Nama yang dijawab entitas: labelnya sendiri atau salah satu synonyms-nya.
const namaDikenal = (id, label) => {
  const zat = zatById.get(id);
  if (!zat) return false;
  return [zat.label.id, ...(zat.synonyms ?? [])].some((n) => rapikan(n) === rapikan(label));
};

// Peta nama -> id, dibangun SESUDAH synonyms di atas ditambahkan, jadi ejaan yang baru
// saja dilebur pun ikut terjangkau. Satu nama bisa menunjuk lebih dari satu entitas —
// dibiarkan jamak, karena yang diperiksa nanti hanya id kanoniknya.
const idDariNama = new Map();
for (const e of zatDoc.items) {
  for (const n of [e.label.id, ...(e.synonyms ?? [])]) {
    const k = rapikan(n);
    if (!idDariNama.has(k)) idDariNama.set(k, new Set());
    idDariNama.get(k).add(e.id);
  }
}
const kanonikDari = (id) => GABUNG[id]?.kanonik ?? id;

const stat = { dipetakanUlang: 0, entriDibuang: 0, produkBerubah: 0, hanyaDipetakan: 0 };
const tanpaCatatan = [];
const takAdaDiSumber = [];
const kembarMeleset = [];
const sengketaBaru = [];
const l27Meleset = [];
const labelBeranotasi = [];
const kunciTerpakai = new Set();
const zatTerpakai = new Map();

records.forEach((rec, i) => {
  const asli = rec.composition ?? [];
  const kena = asli.some((e) => GABUNG[e.substance?.id]);
  const p = PRODUK[rec.key];
  if (p) kunciTerpakai.add(rec.key);
  if (!kena && !p) return;

  const mentah = bahanMentah(rows[i].bahanAktif);

  // Id kanonik yang sah untuk pendaftaran ini menurut sumbernya.
  const bolehId = new Set();
  for (const n of mentah?.nama ?? []) {
    for (const x of idDariNama.get(n) ?? []) bolehId.add(kanonikDari(x));
  }

  // Pemetaan ulang, lalu penggabungan entri yang jadi kembar persis.
  const kelompok = [];
  const posisi = new Map();

  for (const e of asli) {
    const lama = e.substance?.id;
    const g = GABUNG[lama];
    const id = g ? g.kanonik : lama;
    if (g) {
      zatTerpakai.set(lama, (zatTerpakai.get(lama) ?? 0) + 1);
      stat.dipetakanUlang++;
      // Penggabungan ini harus DIDUKUNG pendaftaran ini di sumber: salah satu nama pada
      // bahanAktif-nya, sesudah diresolusi lewat tabel, harus bermuara ke id kanonik yang
      // sama. Sengaja bukan "nama yang kalah harus ada apa adanya di sumber" — id yang
      // masuk lewat penggabungan sebelumnya tidak pernah punya nama di sumber. RONDA GOLD
      // 525 SL memuat op:sub:00000138 karena putaran lalu menaruhnya di situ; yang ada di
      // registri dua ejaan lain, dan dua-duanya bermuara ke tempat yang sama.
      if (mentah && bolehId.size && !bolehId.has(id)) {
        takAdaDiSumber.push(`${rec.key} — ${lama} digabung ke ${id}, tetapi tidak ada nama di bahanAktif pendaftaran ini yang bermuara ke sana`);
      }
    }
    const tanda = `${id}|${e.value}|${e.unit}`;
    if (!posisi.has(tanda)) {
      posisi.set(tanda, kelompok.length);
      kelompok.push({ id, entri: [] });
    }
    kelompok[posisi.get(tanda)].entri.push({ e, dipetakanUlang: Boolean(g) });
  }

  // Dari tiap kelompok, yang bertahan adalah entri yang MEMANG sudah memakai id kanonik.
  // Bukan sekadar yang pertama: pada AMCOMIN 865 SL entri beranotasi datang lebih dulu,
  // dan mempertahankannya akan menempelkan "(setara dengan 2,4-D 720 g/l)" pada id yang
  // namanya polos. Kalau seluruh entri kelompok itu dipetakan ulang, yang dipakai entri
  // pertama.
  //
  // Labelnya TIDAK pernah ditulis ulang. Field ini memang nama sebagaimana registri
  // menuliskannya untuk pendaftaran itu — bukan salinan nama kanonik — dan pada nama
  // beranotasi ia satu-satunya tempat angka kesetaraan itu masih terbaca dari rekaman
  // produk. Lima belas pendaftaran hanya dipetakan ulang tanpa catatan; menormalkan
  // labelnya akan membuang "setara dengan glifosat 356 g/l" tanpa ada yang menampung.
  const rapi = kelompok.map(({ id, entri }) => {
    const asal = entri.find((x) => !x.dipetakanUlang) ?? entri[0];
    if (!namaDikenal(id, asal.e.substance.label)) {
      labelBeranotasi.push(`${rec.key}: "${asal.e.substance.label}" (${id})`);
    }
    return { substance: { id, label: asal.e.substance.label }, value: asal.e.value, unit: asal.e.unit };
  });

  // Sesudah pemetaan ulang, satu id kanonik bisa memayungi lebih dari satu kadar. Itu
  // bukan ulangan melainkan sengketa: registri memuat dua angka untuk bahan yang sama
  // pada pendaftaran yang sama, dan tidak ada kolom yang menentukan mana yang benar.
  // Tidak ada tebakan diam-diam di sini — putusannya ditulis di tabel PRODUK, dan tanpa
  // putusan skrip berhenti.
  const perId = new Map();
  for (const e of rapi) {
    if (!perId.has(e.substance.id)) perId.set(e.substance.id, []);
    perId.get(e.substance.id).push(e);
  }
  const ditolak = [];
  for (const [id, entri] of perId) {
    if (entri.length < 2) continue;
    const putusan = p?.sengketa?.[id];
    if (!putusan) {
      sengketaBaru.push(`${rec.key} (${rec.label?.id}) — ${id}: ${entri.map((e) => `${e.value} ${e.unit}`).join(', ')}`);
      continue;
    }
    const menang = entri.find((e) => e.value === putusan.pilih.value && e.unit === putusan.pilih.unit);
    if (!menang) {
      sengketaBaru.push(`${rec.key} — putusan memilih ${putusan.pilih.value} ${putusan.pilih.unit} untuk ${id}, tetapi nilai itu tidak ada di berkas`);
      continue;
    }
    for (const e of entri) {
      if (e === menang) continue;
      ditolak.push(e);
      if (!putusan.tolak.some((t) => t.value === e.value && t.unit === e.unit)) {
        sengketaBaru.push(`${rec.key} — ${id} memuat ${e.value} ${e.unit} yang tidak disebut daftar tolak`);
      }
    }
  }
  if (ditolak.length) {
    for (let n = rapi.length - 1; n >= 0; n--) if (ditolak.includes(rapi[n])) rapi.splice(n, 1);
  }

  const buang = asli.length - rapi.length;

  // Setiap pembuangan entri wajib ada catatannya. Pemetaan ulang tanpa pembuangan
  // tidak — kosakatalah yang menyimpan alasannya, dan seratusan catatan bernada sama
  // hanya akan menenggelamkan yang benar-benar perlu dibaca. Jumlahnya tetap dilaporkan.
  if (buang > 0 && !p) {
    tanpaCatatan.push(`${rec.key} (${rec.label?.id}) membuang ${buang} entri tetapi tidak ada di tabel PRODUK`);
    return;
  }
  const harusBuang = p ? p.kembar + Object.values(p.sengketa ?? {}).reduce((n, x) => n + x.tolak.length, 0) : 0;
  if (buang > 0 && buang !== harusBuang) {
    kembarMeleset.push(`${rec.key}: tabel menyebut ${harusBuang} entri dibuang (${p.kembar} kembar + sisanya kadar yang ditolak), berkas membuang ${buang}`);
  }
  if (buang > 0 && p.l27 && Math.round(jumlahKadar(asli)) !== p.l27) {
    l27Meleset.push(`${rec.key}: tabel menyebut ${p.l27} g, berkas menjumlahkan ${Math.round(jumlahKadar(asli))} g`);
  }

  if (mentah) {
    for (const e of rapi) {
      if (!adaDiSumber(mentah.kadar, e)) {
        takAdaDiSumber.push(`${rec.key} — kadar ${e.value} ${e.unit} tidak ada di bahanAktif mentah`);
      }
    }
  }

  if (JSON.stringify(rapi) !== JSON.stringify(asli)) {
    stat.produkBerubah++;
    stat.entriDibuang += buang;
    if (buang === 0) stat.hanyaDipetakan++;
    rec.composition = rapi;
    rec.lifecycle = { ...rec.lifecycle, updated_at: STAMP };
    berubah.add(i);
  }

  if (!p) return;

  // Catatan ditulis dari tabel, bukan dari kembar yang masih terlihat — supaya jalan
  // kedua menghasilkan teks yang sama persis.
  const daftar = p.gabung
    .map((lama) => `${lama} "${zatById.get(lama).label.id}" ke ${GABUNG[lama].kanonik} "${zatById.get(GABUNG[lama].kanonik).label.id}"`)
    .join('; ');
  const bentuk = [...new Set(p.gabung.map((x) => GABUNG[x].jenis))];
  const sebab = bentuk.length === 1
    ? JENIS[bentuk[0]].kalimat
    : 'Registri menuliskan nama bahan yang sama dalam beberapa bentuk';
  const ringkas = rapi.map((e) => `${e.substance.label} ${e.value} ${e.unit}`).join(' + ');

  // L27 hanya menjumlahkan g/kg dan g/L. Dua sebab berbeda kenapa penjumlahan ganda ini
  // lolos darinya, dan catatannya harus menyebut yang benar-benar berlaku.
  const satuanGanda = [...new Set(
    rapi.filter((e) => p.gabung.some((x) => GABUNG[x].kanonik === e.substance.id)).map((e) => e.unit),
  )];
  const dalamPersen = satuanGanda.length > 0 && satuanGanda.every((u) => u === '%');

  const paragraf =
    `${PENANDA}${daftar}. ${sebab}, sehingga satu bahan aktif terdaftar sebagai lebih dari satu ` +
    `entitas${p.kembar ? ' dan kadarnya ikut terjumlah dua kali' : ''}. ` +
    (p.l27
      ? `L27 menyalakan "komposisi mustahil" pada ${p.l27} g/l sebelum ini. `
      : p.kembar
        ? dalamPersen
          ? `Kadarnya dalam persen, dan L27 hanya menjumlahkan g/kg dan g/L — penjumlahan ganda ` +
            `ini tidak pernah menyalakan peringatan apa pun. `
          : `Jumlah gandanya masih di bawah 1.000 g per kg/L, jadi L27 pun melewatkannya — ` +
            `penjumlahan ganda ini tidak pernah menyalakan peringatan apa pun. `
        : '') +
    Object.entries(p.sengketa ?? {}).map(([id, x]) =>
      `Penggabungan itu memunculkan sengketa kadar pada ${id}: registri memuat ` +
      `${[x.pilih, ...x.tolak].map((v) => `${v.value} ${v.unit}`).join(' dan ')} untuk bahan yang sama. ` +
      `Yang dipakai ${x.pilih.value} ${x.pilih.unit}; yang tidak dipakai ` +
      `${x.tolak.map((v) => `${v.value} ${v.unit}`).join('; ')}. ${x.dasar} `).join('') +
    `Komposisi sesudah digabung: ${ringkas}. Nama lama beserta anotasinya tetap terbaca pada ` +
    `entitas yang digantikan; entitas itu tidak dihapus, statusnya "superseded" dan menunjuk penggantinya.`;

  const sebelumnya = rec.notes?.id ?? '';
  const potong = sebelumnya.indexOf(PENANDA);
  const awalan = (potong === -1 ? sebelumnya : sebelumnya.slice(0, potong)).trim();
  const catatan = awalan ? `${awalan} ${paragraf}` : paragraf;

  if (catatan !== sebelumnya) {
    rec.notes = { ...rec.notes, id: catatan };
    rec.lifecycle = { ...rec.lifecycle, updated_at: STAMP };
    berubah.add(i);
  }
});

// ---------------------------------------------------------------------------
// 6. Penjagaan — tidak ada yang boleh berubah diam-diam
// ---------------------------------------------------------------------------
const tambah = (judul, daftar) => {
  if (!daftar.length) return;
  gagal.push(judul);
  for (const s of daftar) gagal.push(`  ${s}`);
};
tambah('Ada pendaftaran yang kehilangan entri tetapi belum ada di tabel PRODUK:', tanpaCatatan);
tambah('Ada penggabungan yang tidak didukung bahanAktif mentah — tinjau ulang tabel GABUNG:', takAdaDiSumber);
tambah('Jumlah entri kembar tidak cocok dengan berkas:', kembarMeleset);
tambah('Ada sengketa kadar yang belum diputuskan — periksa ke sumber, lalu tulis putusannya di tabel PRODUK:', sengketaBaru);
tambah('Jumlah kadar sebelum penggabungan tidak cocok dengan berkas:', l27Meleset);
tambah('Ada pendaftaran di tabel PRODUK yang tidak ada di NDJSON:', Object.keys(PRODUK).filter((k) => !kunciTerpakai.has(k)));
if (gagal.length) {
  for (const b of gagal) console.error(b);
  process.exit(1);
}

const keluaran = records.map(tulisBarisPython);
const menyimpang = [];
records.forEach((_, i) => {
  if (!berubah.has(i) && keluaran[i] !== barisAsli[i]) menyimpang.push(i);
});
if (menyimpang.length) {
  console.error(`Penulis baris tidak setia pada ${menyimpang.length} rekaman yang tidak berubah — contoh baris ${menyimpang.slice(0, 3).map((i) => i + 1).join(', ')}.`);
  console.error('Menulis berkas sekarang akan mengubah baris yang tidak ada urusannya dengan penggabungan ini. Dibatalkan.');
  process.exit(1);
}

writeFileSync(NDJSON, keluaran.join('\n') + '\n');
writeFileSync(ZAT, JSON.stringify(zatDoc, null, 2) + '\n');

const bentukHitung = {};
for (const p of Object.values(GABUNG)) bentukHitung[p.jenis] = (bentukHitung[p.jenis] ?? 0) + 1;
const tanpaRujukan = Object.keys(GABUNG).filter((k) => !zatTerpakai.has(k));

console.log(`Id zat digabung           : ${Object.keys(GABUNG).length} -> ${new Set(Object.values(GABUNG).map((p) => p.kanonik)).size} kanonik`);
for (const [j, n] of Object.entries(bentukHitung).sort((a, b) => b[1] - a[1])) console.log(`  ${j.padEnd(24)}: ${n}`);
console.log(`  sudah tanpa rujukan     : ${tanpaRujukan.length} (rujukannya dipindahkan pada jalan sebelumnya)`);
console.log(`Pendaftaran diperiksa     : ${records.length}`);
console.log(`  barisnya ditulis ulang  : ${berubah.size} (sisanya keluar apa adanya)`);
console.log(`  komposisinya berubah    : ${stat.produkBerubah}`);
console.log(`    entri kembar dibuang  : ${stat.entriDibuang} pada ${stat.produkBerubah - stat.hanyaDipetakan} pendaftaran`);
console.log(`    hanya dipetakan ulang : ${stat.hanyaDipetakan} pendaftaran (kadarnya tidak berubah, tanpa catatan)`);
console.log(`  entri dipetakan ulang   : ${stat.dipetakanUlang}`);
console.log(`  label beranotasi tetap  : ${labelBeranotasi.length} entri (nama registri dipertahankan apa adanya;`);
console.log(`                            angka kesetaraannya hanya terbaca di situ)`);
