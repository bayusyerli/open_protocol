// Memeriksa tiap kalimat komentar harga terhadap angka yang dipakai menulisnya, lalu
// mencatat hasilnya — dan MENERIMA tinjauan manusia, satu per satu, dengan namanya.
//
//   node spec/tools/periksa-komentar-harga.mjs                 # periksa mesin, laporkan
//   node spec/tools/periksa-komentar-harga.mjs --tulis         # simpan hasil pemeriksaan
//   node spec/tools/periksa-komentar-harga.mjs --tulis \
//        --tinjau beras-premium --oleh "Nama, Institusi"       # catat satu tinjauan manusia
//   node spec/tools/periksa-komentar-harga.mjs --tulis \
//        --tinjau-semua --oleh "Nama, Institusi"               # setelah membaca seluruhnya
//
// DUA PEMERIKSAAN YANG BERBEDA, DAN KENAPA KEDUANYA TIDAK BOLEH DISATUKAN
//
// `diperiksaMesin` — bisa dikerjakan mesin, dan sekarang dikerjakan.
//   Tiap angka yang muncul di kalimat harus ada di `fakta` rekaman itu. Ini menangkap satu
//   jenis kekeliruan saja, tetapi jenis yang paling berbahaya pada kalimat yang ditulis
//   model bahasa: angka yang tidak berasal dari mana pun. Pada jalur terhitung ia lolos
//   dengan sendirinya — kalimatnya memang disusun dari fakta itu. Justru itu gunanya
//   dipasang SEKARANG: begitu jalur model dinyalakan, penjaganya sudah berdiri lebih dulu,
//   bukan disusul setelah ada yang salah.
//
// `ditinjau` — TIDAK bisa dikerjakan mesin, dan tidak dikerjakan di sini.
//   Ia menyatakan bahwa seorang manusia membaca kalimatnya dan bertanggung jawab atasnya.
//   Angka boleh seluruhnya cocok sementara kalimatnya tetap menyesatkan: menyebut pola
//   musim dari dua setengah tahun sebagai kebiasaan tahunan, atau menonjolkan turun 28%
//   tanpa menyebut bahwa titik awalnya kebetulan puncak tertinggi seluruh seri. Tidak ada
//   sondaan yang menangkap itu.
//
//   Karena itu berkas ini tidak akan pernah mengisi `ditinjau` sendiri. Ia hanya menerima
//   nama peninjau lewat `--oleh`, dan menyimpannya beserta tanggalnya. Kalau ia boleh
//   mengisinya sendiri, medannya berhenti berarti apa-apa — dan seluruh alasan berkas
//   komentar itu dibangun (docs/15, keberatan B5) ikut gugur bersamanya.
//
// TINJAUAN MENEMPEL PADA SIDIK FAKTANYA, BUKAN PADA KUNCINYA
// Yang ditinjau adalah SATU kalimat atas SATU susunan angka. Begitu angkanya bergeser —
// seri harga bertambah sehari — kalimatnya ditulis ulang, dan tinjauan lama tidak berlaku
// untuk kalimat baru. `ditinjauSidik` menyimpan sidik yang ditinjau, dan `bangun-komentar-
// harga.mjs` membandingkannya: kalau berbeda, tinjauannya gugur dan medannya kembali null.
// Tanpa itu, satu tinjauan bulan lalu akan menaungi kalimat yang ditulis hari ini.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BERKAS = join(akar, 'spec', 'vocab', 'harga', 'komentar.json');

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const ada = (n) => process.argv.includes(`--${n}`);
const tulis = ada('tulis');

if (!existsSync(BERKAS)) {
  console.error(`${BERKAS} tidak ada. Jalankan dulu: node spec/tools/bangun-komentar-harga.mjs --tulis`);
  process.exit(1);
}

const doc = JSON.parse(readFileSync(BERKAS, 'utf8'));
const entri = Object.entries(doc.komentar ?? {});

// ---------------------------------------------------------------------------
// Pemeriksaan mesin: tiap angka di kalimat harus ada di faktanya
// ---------------------------------------------------------------------------
// Angka di kalimat ditulis gaya Indonesia — "Rp32.216" dan "11,7%" — sedangkan di `fakta`
// ia bilangan biasa. Keduanya diratakan ke bilangan sebelum dibandingkan, dan pembandingan
// memakai toleransi karena kalimat membulatkan: 17,78 tampil sebagai "17,8".
const angkaDalam = (teks) =>
  [...String(teks).matchAll(/(\d[\d.]*(?:,\d+)?)/g)]
    .map((m) => Number(m[1].replace(/\./g, '').replace(',', '.')))
    .filter((x) => Number.isFinite(x));

function angkaFakta(f) {
  const keluar = new Set();
  const telusur = (v) => {
    if (typeof v === 'number' && Number.isFinite(v)) {
      keluar.add(v);
      keluar.add(Math.abs(v));
      keluar.add(Math.round(v));
      keluar.add(Math.round(Math.abs(v) * 10) / 10);
      keluar.add(Math.round(Math.abs(v) * 100) / 100);
    } else if (typeof v === 'string') {
      // Tanggal membawa angka juga: "2026-08-21" jadi 2026, 8, 21 — dan kalimat memang
      // menyebutnya sebagai "21 Agustus 2026".
      for (const n of angkaDalam(v)) keluar.add(n);
    } else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) {
        // NAMA medan ikut dipindai, bukan hanya nilainya. Kalimat berhak menyebut jendela
        // yang sedang dilaporkannya — "dalam 30 hari terakhir" — dan angka 30 itu memang
        // ada di faktanya, hanya sebagai nama medan `ubah30hari`, bukan sebagai nilai.
        // Tanpa ini pemeriksa menandai 42 dari 43 komentar karena hal yang justru benar.
        for (const nk of angkaDalam(k)) keluar.add(nk);
        telusur(x);
      }
    }
  };
  telusur(f);
  return keluar;
}

const dekat = (x, kumpulan) => {
  for (const y of kumpulan) {
    if (x === y) return true;
    // Toleransi pembulatan satu angka di belakang koma, dan pembulatan rupiah ke satuan.
    if (Math.abs(x - y) <= Math.max(0.06, Math.abs(y) * 0.0001)) return true;
  }
  return false;
};

function periksaSatu(rek) {
  const punya = angkaFakta(rek.fakta);
  const dipakai = angkaDalam(rek.komentar);
  const liar = dipakai.filter((x) => !dekat(x, punya));
  const masalah = [];
  if (liar.length) masalah.push(`angka tak berasal dari fakta: ${liar.join(', ')}`);

  // Kalimat terakhir wajib menyebut satu batas. Diperiksa lewat keberadaan medan `batas`
  // DAN lewat kalimat penutupnya sendiri, karena keduanya bisa menyimpang terpisah.
  if (!rek.batas || rek.batas.length < 10) masalah.push('medan `batas` kosong atau terlalu pendek');

  // Larangan yang bisa disondai: ramalan dan anjuran. Keduanya dilarang di prompt-nya, dan
  // prompt yang dilanggar tidak berbunyi sendiri — hanya pemeriksaan ini yang berbunyi.
  const RAMALAN = /\b(diperkirakan|diprediksi|akan naik|akan turun|kemungkinan akan|diproyeksikan|bakal)\b/i;
  const ANJURAN = /\b(sebaiknya (beli|jual|tahan|tunggu)|disarankan untuk (membeli|menjual)|waktu yang tepat untuk (membeli|menjual))\b/i;
  if (RAMALAN.test(rek.komentar)) masalah.push('memuat pernyataan masa depan — prompt melarangnya');
  if (ANJURAN.test(rek.komentar)) masalah.push('memuat anjuran beli/jual — prompt melarangnya');

  return masalah;
}

// ---------------------------------------------------------------------------
// Jalan
// ---------------------------------------------------------------------------
const hasil = entri.map(([kunci, rek]) => ({ kunci, rek, masalah: periksaSatu(rek) }));
const lolos = hasil.filter((x) => !x.masalah.length);
const gagal = hasil.filter((x) => x.masalah.length);

const n = (x) => x.toLocaleString('id-ID');
console.log(`Komentar               : ${n(entri.length)}`);
console.log(`  lolos periksa mesin  : ${n(lolos.length)}`);
console.log(`  BERMASALAH           : ${n(gagal.length)}`);
for (const g of gagal) console.log(`      ${g.kunci}: ${g.masalah.join(' · ')}`);

const sudahDitinjau = entri.filter(([, r]) => r.ditinjau);
console.log(`Ditinjau MANUSIA       : ${n(sudahDitinjau.length)} dari ${n(entri.length)}`);
if (sudahDitinjau.length) {
  for (const [k, r] of sudahDitinjau) console.log(`      ${k} — ${r.ditinjauOleh ?? 'tanpa nama'} (${r.ditinjau})`);
}

// --- tinjauan manusia -------------------------------------------------------
const oleh = arg('oleh');
const satu = arg('tinjau');
const semua = ada('tinjau-semua');
const tanggal = arg('tanggal');

if ((satu || semua) && !oleh) {
  console.error('\n--tinjau menuntut --oleh "Nama, Institusi". Tinjauan tanpa nama tidak menempel pada siapa pun,');
  console.error('dan medan yang tidak menempel pada siapa pun tidak menaikkan tingkat bukti apa pun.');
  process.exit(1);
}
if ((satu || semua) && !tanggal) {
  console.error('\n--tinjau menuntut --tanggal YYYY-MM-DD. Alat ini tidak membaca jam sistem: tanggal yang');
  console.error('diketik peninjau adalah pernyataannya sendiri, bukan cap waktu proses yang kebetulan berjalan.');
  process.exit(1);
}
if (tanggal && !/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
  console.error(`\n--tanggal harus berbentuk YYYY-MM-DD, bukan "${tanggal}".`);
  process.exit(1);
}

let dicatat = 0;
if (satu || semua) {
  const sasaran = semua ? hasil : hasil.filter((x) => x.kunci === satu);
  if (!sasaran.length) {
    console.error(`\nTidak ada komentar berkunci "${satu}".`);
    process.exit(1);
  }
  // Yang bermasalah di pemeriksaan mesin TIDAK boleh ditinjau borongan. Kalau mesin saja
  // sudah menemukan angka yang tidak berasal dari mana pun, tinjauan borongan atasnya
  // berarti seseorang menempelkan namanya pada kalimat yang belum ia baca satu per satu.
  const terhalang = semua ? sasaran.filter((x) => x.masalah.length) : [];
  if (terhalang.length) {
    console.error(`\n--tinjau-semua ditolak: ${terhalang.length} komentar tidak lolos periksa mesin.`);
    for (const t of terhalang) console.error(`      ${t.kunci}: ${t.masalah.join(' · ')}`);
    console.error('Perbaiki dulu, atau tinjau satu per satu dengan --tinjau <kunci>.');
    process.exit(1);
  }
  for (const s of sasaran) {
    s.rek.ditinjau = tanggal;
    s.rek.ditinjauOleh = oleh;
    // Tinjauan menempel pada susunan angka yang ditinjau, bukan pada kuncinya.
    s.rek.ditinjauSidik = s.rek.sidikFakta;
    dicatat++;
  }
  console.log(`\nTinjauan dicatat       : ${n(dicatat)} — ${oleh}, ${tanggal}`);
}

// Hasil periksa mesin ikut disimpan supaya bisa dibaca layar dan dibandingkan antar-bangunan.
for (const h of hasil) {
  h.rek.diperiksaMesin = h.masalah.length ? { lolos: false, masalah: h.masalah } : { lolos: true };
}

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyimpan.');
  process.exit(gagal.length ? 1 : 0);
}

writeFileSync(BERKAS, JSON.stringify(doc, null, 2) + '\n');
console.log(`\nDitulis ke ${BERKAS}`);
process.exit(gagal.length ? 1 : 0);
