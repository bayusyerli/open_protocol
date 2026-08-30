// Memeriksa tiap nama berkas yang DISEBUT ke pembaca benar-benar ada.
//
//   node spec/tools/bangun-indeks.mjs --tulis && node spec/tools/cek-penunjuk-indeks.mjs
//
// KENAPA ALAT INI ADA
// Blok "batas jawaban" jalur 1 berbunyi, selama berhari-hari di situs yang tayang:
//
//   …dan seluruhnya bertekst gejala (lihat gejala.json).
//
// `gejala.json` berhenti terbit ketika daftar gejala melewati anggaran 48 KB dan dipecah
// jadi `gejala-daftar/NNN.json`. Kalimatnya dirakit `bangun-indeks.mjs` dan ikut ke
// `meta.tidakAda.gejalaOpt`, jadi ia sampai ke tiap pembaca yang membuka batas jawaban —
// menyuruh mereka ke berkas yang 404.
//
// Tidak ada yang bisa menangkapnya. Ia bukan tautan, jadi pemeriksa tautan `rakit-situs`
// tidak melihatnya. Ia bukan angka, jadi `cek-angka-docs` tidak melihatnya. Ia bukan
// daftar prasimpan, jadi `cek-luring-indeks` tidak melihatnya. Ia cuma sebuah nama di
// dalam sebuah kalimat, dan nama di dalam kalimat tidak pernah gagal dengan berisik.
//
// APA YANG DIPERIKSA, DAN DI MANA
// Nama berakhiran `.json` yang muncul di dalam STRING — nilai apa pun di `meta.json`, dan
// literal berkutip di `app/*.js` maupun `app/*.html`. Tiap nama harus mendarat di
// `spec/indeks/` atau `spec/vocab/`.
//
// KOMENTAR SENGAJA TIDAK IKUT. "Dulu bernama gejala.json" adalah dokumentasi yang baik,
// dan alat yang melarangnya akan menghukum orang karena mencatat riwayat. Yang dijaga
// permukaan yang dibaca orang, bukan yang dibaca pengelola.
//
// `r.json()` dan sebangsanya dilewati: nama yang diikuti kurung buka adalah pemanggilan
// metode, bukan penunjuk berkas.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const INDEKS = join(AKAR, 'spec', 'indeks');
const VOCAB = join(AKAR, 'spec', 'vocab');
const APP = join(AKAR, 'app');

if (!existsSync(join(INDEKS, 'meta.json'))) {
  console.error('spec/indeks/meta.json tidak ada. Bangun dulu:\n'
    + '  node spec/tools/bangun-indeks.mjs --tulis');
  process.exit(1);
}

// Nama boleh berupa jalur — `gejala-daftar/000.json`, `spec/vocab/pest.json` — jadi
// awalan yang menyebut direktori sumbernya dilepas dulu sebelum dicoba dari kedua akar.
const NAMA = /(?<![\w./-])((?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.json)(?!\s*\()/g;

const ada = (n) => {
  const bersih = n.replace(/^(?:spec\/)?(?:indeks|vocab)\//, '');
  return existsSync(join(INDEKS, bersih)) || existsSync(join(VOCAB, bersih));
};

const temuan = [];
const catat = (asal, teks) => {
  for (const m of teks.matchAll(NAMA)) {
    if (!ada(m[1])) temuan.push({ asal, nama: m[1], petik: teks.trim().slice(0, 110) });
  }
};

// 1 — meta.json: seluruh nilai string, sedalam apa pun letaknya.
const meta = JSON.parse(readFileSync(join(INDEKS, 'meta.json'), 'utf8'));
let cacahMeta = 0;
(function jelajah(o, jalan) {
  if (typeof o === 'string') { cacahMeta++; catat(`meta${jalan}`, o); return; }
  if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) jelajah(v, `${jalan}.${k}`);
}(meta, ''));

/* 2 — app/: hanya literal berkutip. Ketiga bentuknya diambil kasar dan itu memang cukup:
 * yang dicari nama berkas, dan nama berkas tidak berisi kutip. Literal template ikut
 * karena justru di sanalah kalimat yang dirender orang ditulis. */
const LITERAL = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g;
const berkas = readdirSync(APP).filter((n) => /\.(js|html)$/.test(n)).sort();
let cacahLiteral = 0;
for (const n of berkas) {
  for (const m of readFileSync(join(APP, n), 'utf8').matchAll(LITERAL)) {
    cacahLiteral++;
    catat(`app/${n}`, m[0]);
  }
}

console.log(`penunjuk berkas    : ${cacahMeta} string meta, ${cacahLiteral} literal di ${berkas.length} berkas app/`);

if (temuan.length) {
  console.error(`\n${temuan.length} penunjuk mengarah ke berkas yang tidak ada:`);
  for (const t of temuan.slice(0, 12)) {
    console.error(`  ${t.nama}  — di ${t.asal}`);
    console.error(`      ${t.petik}`);
  }
  console.error('\nTidak ada di spec/indeks/ maupun spec/vocab/. Yang membacanya akan mendarat di 404.');
  process.exit(1);
}
console.log('Tiap nama berkas yang disebut ke pembaca mendarat di berkas yang ada.');
