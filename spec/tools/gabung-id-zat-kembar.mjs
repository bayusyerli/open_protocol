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
// AMCOMIN 865 SL, DIMINA 720 SL, GALATOP 620 SL, RONDA GOLD 525 SL). Dua puluh
// delapan sisanya TIDAK tertangkap — jumlah gandanya masih di bawah 1.000 g/l
// (KILL UP 480/1 SL 961, RUSO 485 SL 970) atau kadarnya dalam persen, yang memang
// tidak dijumlahkan L27 sama sekali (PRAMEX 40 SP 40 % + 40 %). Penjumlahan ganda
// yang diam itu justru yang paling berbahaya: tidak ada peringatan yang menyalak.
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
  "op:sub:00000138": {
    kanonik: "op:sub:00000102",
    jenis: "ejaan",
    dasar:
      "Dua id bersih untuk garam yang sama, berbeda spasi saja. Yang dipakai op:sub:00000102 " +
      "karena ia bentuk terbanyak di registri — 209 rekaman lawan 49. Tiebreaker \"paling " +
      "sering muncul\" itu yang sama dipakai konvensi penyeragaman nama principal. Putaran " +
      "sebelumnya sempat memilih arah kebalikannya; keputusan ini yang berlaku.",
  },
  "op:sub:00000260": {
    kanonik: "op:sub:00000114",
    jenis: "nama-inggris",
  },
  "op:sub:00000329": {
    kanonik: "op:sub:00000106",
    jenis: "nama-inggris",
  },
  "op:sub:00000346": {
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
  "op:sub:00000647": {
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
  "op:sub:00000673": {
    kanonik: "op:sub:00000127",
    jenis: "nama-inggris",
  },
  "op:sub:00000714": {
    kanonik: "op:sub:00000122",
    jenis: "kesetaraan",
    dasar:
      "Nisbah 0,831 pada keterangan kesetaraannya adalah nisbah bobot molekul 2,4-D asam " +
      "terhadap garam dimetil aminanya.",
  },
  "op:sub:00000811": {
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
  "op:sub:00000826": {
    kanonik: "op:sub:00000117",
    jenis: "nama-inggris",
  },
  "op:sub:00000847": {
    kanonik: "op:sub:00000384",
    jenis: "nama-inggris",
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
  "op:sub:00001358": {
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
  "op:sub:00001369": {
    kanonik: "op:sub:00000102",
    jenis: "kesetaraan",
    dasar:
      "Nisbah kesetaraan yang ditulis registri, 0,741, adalah nisbah bobot molekul glifosat " +
      "asam terhadap garam isopropilaminanya; angka itu hanya cocok kalau kedua nama menunjuk " +
      "garam yang sama.",
  },
  "op:sub:00001382": {
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
  "op:sub:00001387": {
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
  "op:sub:00001547": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah 0,724 pada keterangan kesetaraannya adalah nisbah bobot molekul ion parakuat " +
      "terhadap garam dikloridanya.",
  },
  "op:sub:00001554": {
    kanonik: "op:sub:00000104",
    jenis: "kesetaraan",
    dasar:
      "Nisbah 0,724 pada keterangan kesetaraannya adalah nisbah bobot molekul ion parakuat " +
      "terhadap garam dikloridanya.",
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
  "hippo-400-sl-01010120175693": { gabung: ["op:sub:00000621"], kembar: 1, l27: null },
  "k-blutanil-75-wp-01020120237771": { gabung: ["op:sub:00000826"], kembar: 1, l27: null },
  "k-kingfield-60-20-wg-01010120237774": { gabung: ["op:sub:00000673", "op:sub:00000862"], kembar: 2, l27: null },
  "k-kinggold-10-wp-01030120237775": { gabung: ["op:sub:00001230"], kembar: 1, l27: null },
  "k-voltaz-180-120-sc-01010120237781": { gabung: ["op:sub:00000555", "op:sub:00000641"], kembar: 2, l27: null },
  "kill-up-480-1-sl-01030120072767": { gabung: ["op:sub:00000412"], kembar: 1, l27: null },
  "kill-up-neo-481-sl-01030120227547": { gabung: ["op:sub:00000811", "op:sub:00001369"], kembar: 1, l27: null },
  "lentra-200-sl-04110120072773": { gabung: ["op:sub:00000501"], kembar: 1, l27: null },
  "mateno-up-160-5-1-sl-01030120093350": { gabung: ["op:sub:00000818", "op:sub:00001382"], kembar: 1, l27: null },
  "mega-9-865-sl-01030120072778": { gabung: ["op:sub:00000938"], kembar: 1, l27: 1730 },
  "metindo-plus-42-wp-01010120175704": { gabung: ["op:sub:00000260", "op:sub:00000436"], kembar: 2, l27: null },
  "monoamonium-glifosat-45-tc-042000113": { gabung: ["op:sub:00000847"], kembar: 1, l27: null },
  "neo-pilarquat-137-sl-01030120227335": { gabung: ["op:sub:00001554"], kembar: 1, l27: null },
  "neomine-300-100-sl-01030120237790": { gabung: ["op:sub:00000593", "op:sub:00000647", "op:sub:00000819"], kembar: 2, l27: null },
  "nomos-0-2mc-06080120227337": { gabung: ["op:sub:00000484"], kembar: 1, l27: null },
  "pramex-40-sp-01010120227347": { gabung: ["op:sub:00000260"], kembar: 1, l27: null },
  "primabat-50-wp-01020120248418": { gabung: ["op:sub:00001203"], kembar: 1, l27: null },
  "primax-480-1-sl-01030120072791": { gabung: ["op:sub:00000346", "op:sub:00000412"], kembar: 1, l27: null },
  "pumaris-240-sl-01030119971309": { gabung: ["op:sub:00000651"], kembar: 1, l27: null },
  "ronda-gold-525-sl-01030120124437": { gabung: ["op:sub:00000813", "op:sub:00001387"], kembar: 1, l27: 1050 },
  "ruso-485-sl-01030120083224": { gabung: ["op:sub:00000650"], kembar: 1, l27: null },
  "setting-126-sl-01030120237810": { gabung: ["op:sub:00000821", "op:sub:00001358"], kembar: 1, l27: null },
  "sibiru-80-wp-01020120238061": { gabung: ["op:sub:00000329"], kembar: 1, l27: null },
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

  const buang = asli.length - rapi.length;

  // Setiap pembuangan entri wajib ada catatannya. Pemetaan ulang tanpa pembuangan
  // tidak — kosakatalah yang menyimpan alasannya, dan seratusan catatan bernada sama
  // hanya akan menenggelamkan yang benar-benar perlu dibaca. Jumlahnya tetap dilaporkan.
  if (buang > 0 && !p) {
    tanpaCatatan.push(`${rec.key} (${rec.label?.id}) membuang ${buang} entri tetapi tidak ada di tabel PRODUK`);
    return;
  }
  if (buang > 0 && buang !== p.kembar) {
    kembarMeleset.push(`${rec.key}: tabel menyebut ${p.kembar} entri kembar, berkas membuang ${buang}`);
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
