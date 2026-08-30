// Memeriksa tiap berkas indeks yang diprasimpan sw.js benar-benar ADA di indeks terbangun.
//
//   node spec/tools/bangun-indeks.mjs --tulis && node spec/tools/cek-luring-indeks.mjs
//
// KENAPA ALAT INI ADA
// `cek-versi-sw.mjs` sudah menjaga sisi cangkang dengan alasan yang persis sama — "yang
// didaftar tetapi tidak ada gagal di-precache tanpa satu pun galat" — tetapi hanya sisi
// cangkang. Sisi indeksnya tidak terperiksa siapa pun, karena ia menuntut spec/indeks/
// yang belum ada di gerbang tanpa indeks.
//
// Celah itu terpakai. Antara 29 dan 30 Agustus 2026 `INDEKS_AKAR` menyebut `gejala.json`
// dan `gejala-cari.json`, dua berkas yang berhenti terbit ketika indeks memecah keduanya
// jadi `gejala-daftar/NNN.json` dan `gejala-cari/NNN.json`. `simpanDiam()` menelan
// kegagalan per berkas — sengaja, supaya satu berkas hilang tidak membatalkan seluruh
// kemampuan luring — jadi keduanya 404 tanpa suara dan pemasangan tetap melapor berhasil.
// Akibatnya jalur 1 kosong justru saat luring, syarat lapangan nomor satunya, sementara
// kepala sw.js tetap menjanjikan "daftar gejala jalur 1 utuh".
//
// Tidak ada uji yang bisa menangkapnya dari sisi peramban tanpa benar-benar luring, dan
// tidak ada galat yang bisa dibaca. Yang bisa diperiksa: apakah nama yang disebut ada.
//
// APA YANG DIPERIKSA
//   1. Tiap nama di `INDEKS_AKAR` punya berkasnya di spec/indeks/.
//   2. Tiap kunci `m.pecahan?.<kunci>` yang disebut sw.js ada di meta.json.
//   3. Tiap pecahan bernomor yang akan diminta `bernomor()` ada berkasnya.
//   4. Tiap keluarga berdaftar — `(m.pecahan?.X ?? []).map(... ${INDEKS}DIR/${k}.json)` —
//      punya berkas untuk SETIAP kunci yang didaftar meta.
//
// Gagal MEMBACA sw.js juga gagal, bukan dilewati: pemeriksa yang diam ketika polanya
// berubah adalah pemeriksa yang berhenti memeriksa tanpa memberi tahu.

import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const INDEKS = join(AKAR, 'spec', 'indeks');
const sw = readFileSync(join(AKAR, 'sw.js'), 'utf8');

if (!existsSync(join(INDEKS, 'meta.json'))) {
  console.error('spec/indeks/meta.json tidak ada. Bangun dulu:\n'
    + '  node spec/tools/bangun-indeks.mjs --tulis');
  process.exit(1);
}
const meta = JSON.parse(readFileSync(join(INDEKS, 'meta.json'), 'utf8'));
const salah = [];
const ukur = (p) => (existsSync(p) ? statSync(p).size : 0);
let byte = ukur(join(INDEKS, 'meta.json'));

// 1 — berkas indeks akar.
const blok = /const INDEKS_AKAR = \[([\s\S]*?)\]\.map/.exec(sw)?.[1];
if (blok === undefined) salah.push('INDEKS_AKAR tidak ketemu di sw.js — polanya berubah, dan alat ini jadi buta');
const akar = blok ? [...blok.matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
for (const f of akar) {
  if (existsSync(join(INDEKS, f))) byte += ukur(join(INDEKS, f));
  else salah.push(`INDEKS_AKAR menyebut '${f}', tetapi spec/indeks/${f} tidak ada — 404 senyap saat pemasangan`);
}

// 2 — kunci pecahan yang disebut sw.js, dalam bentuk `.pecahan?.nama` maupun `.pecahan?.[nama]`.
const kunciDisebut = new Set([
  ...[...sw.matchAll(/\.pecahan\?\.([A-Za-z_$][\w$]*)/g)].map((m) => m[1]),
  ...[...sw.matchAll(/bernomor\(\s*m\s*,\s*cap\s*,\s*'[^']+'\s*,\s*'([^']+)'\s*\)/g)].map((m) => m[1]),
]);
for (const k of kunciDisebut) {
  if (!(k in (meta.pecahan ?? {}))) salah.push(`sw.js membaca meta.pecahan.${k}, tetapi meta.json tidak punya kunci itu`);
}

// 3 — pecahan bernomor: `bernomor(m, cap, '<akar>', '<kunci>')`.
const bernomor = [...sw.matchAll(/bernomor\(\s*m\s*,\s*cap\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g)];
for (const [, dir, kunci] of bernomor) {
  const n = meta.pecahan?.[kunci];
  if (typeof n !== 'number') { salah.push(`bernomor('${dir}', '${kunci}'): meta.pecahan.${kunci} bukan angka`); continue; }
  if (n === 0) salah.push(`bernomor('${dir}', '${kunci}'): meta menyebut 0 pecahan — tidak ada yang akan tersimpan`);
  for (let i = 0; i < n; i++) {
    const f = `${dir}/${String(i).padStart(3, '0')}.json`;
    if (existsSync(join(INDEKS, f))) byte += ukur(join(INDEKS, f));
    else salah.push(`bernomor('${dir}', '${kunci}') akan meminta ${f}, tetapi berkasnya tidak ada`);
  }
}

// 4 — keluarga berdaftar, mis. `(m.pecahan?.sediaan ?? []).map((k) => \`${INDEKS}sediaan/${k}.json…\`)`.
for (const m of sw.matchAll(/\(m\.pecahan\?\.([A-Za-z_$][\w$]*) \?\? \[\]\)\.map\(\(k\) => `\$\{INDEKS\}([^/]+)\/\$\{k\}\.json/g)) {
  const [, kunci, dir] = m;
  const daftar = meta.pecahan?.[kunci];
  if (!Array.isArray(daftar)) { salah.push(`keluarga '${dir}' membaca meta.pecahan.${kunci}, yang bukan larik`); continue; }
  for (const k of daftar) {
    const f = `${dir}/${k}.json`;
    if (existsSync(join(INDEKS, f))) byte += ukur(join(INDEKS, f));
    else salah.push(`keluarga '${dir}' akan meminta ${f}, tetapi berkasnya tidak ada`);
  }
}

console.log(`prasimpan indeks   : ${akar.length} berkas akar, ${bernomor.length} keluarga bernomor`);
console.log(`  terkumpul        : ${(byte / 1024).toFixed(1)} KB (sisi indeks tingkat 1; cangkang app/ di luar ini)`);

if (salah.length) {
  console.error(`\n${salah.length} masalah — luring akan bolong tanpa satu pun galat:`);
  for (const s of salah) console.error(`  ✗ ${s}`);
  process.exit(1);
}
console.log('Tiap berkas yang diprasimpan sw.js ada di indeks.');
