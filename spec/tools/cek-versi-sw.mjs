// Menjaga daftar cangkang service worker tetap utuh — dan menjaga capnya tetap disuntikkan,
// bukan diketik.
//
//   node spec/tools/cek-versi-sw.mjs
//
// APA YANG BERUBAH, DAN KENAPA ALAT INI TIDAK LAGI MENUNTUT BUMP.
// Versi sebelumnya menyimpan sidik isi cangkang dan gagal bila isinya berubah sementara
// `VERSI` di sw.js tidak. Ia bekerja — empat kali menangkap kelalaian nyata, sekali pada
// orang yang memasangnya sendiri. Tetapi keempatnya berpola identik: versi dinaikkan dan
// sidiknya dicatat, lalu app/ disunting lagi sebelum commit. Yang salah urutannya, dan
// urutan yang mudah salah akan terus salah.
//
// Sejak 25 Agustus 2026 capnya tidak lagi diketik siapa pun: `rakit-situs.mjs` menghitungnya
// dari isi berkas cangkang yang benar-benar terangkut, sesudah penyalinan terakhir, lalu
// menuliskannya ke salinan sw.js di `_situs/`. Cap yang lahir sesudah suntingan terakhir
// tidak bisa didahului suntingan — kelas kesalahannya hilang, bukan dijaga.
//
// YANG MASIH DIJAGA DI SINI, dan kenapa alat ini tetap ada:
//
//   1. Placeholder `dev` masih berbentuk yang bisa disuntik. Kalau baris `const VERSI`
//      berubah bentuk, penyuntikan gagal — dan gagalnya akan sunyi kalau tidak diperiksa.
//   2. Tiap berkas yang didaftar BERKAS_CANGKANG benar-benar ada di app/. Yang didaftar
//      tetapi tidak ada gagal di-precache tanpa satu pun galat.
//   3. Tiap berkas app/ yang layak masuk cangkang memang didaftar. Yang tercecer tidak
//      tersedia saat luring — dan itu persis cara `hitung.js` dan `tanya.js` nyaris lolos.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SW = join(AKAR, 'sw.js');
const APP = join(AKAR, 'app');

const sw = readFileSync(SW, 'utf8');
const salah = [];

// 1 — bentuk yang bisa disuntik rakit-situs.mjs. Pola ini SAMA dengan miliknya; kalau
// keduanya menyimpang, yang satu memeriksa sesuatu yang tidak pernah disuntik yang lain.
const versi = /^const VERSI = '([^']*)';$/m.exec(sw)?.[1];
if (versi === undefined) {
  salah.push('baris `const VERSI = \'…\';` tidak ketemu — rakit-situs.mjs tidak akan bisa menyuntikkan capnya');
} else if (versi !== 'dev') {
  salah.push(`VERSI di sumber berbunyi '${versi}', bukan 'dev'. Capnya disuntikkan saat perakitan; `
    + 'angka yang diketik di sini akan tertimpa, dan sementara itu ia menyesatkan pembacanya.');
}

// 2 & 3 — daftar cangkang terhadap isi app/ yang sebenarnya.
const blok = /const BERKAS_CANGKANG = \[([\s\S]*?)\]\.map/.exec(sw)?.[1];
if (!blok) salah.push('BERKAS_CANGKANG tidak ketemu di sw.js');

const daftar = blok ? [...blok.matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
const punya = new Set(daftar);

for (const f of daftar) {
  if (!existsSync(join(APP, f))) {
    salah.push(`sw.js mendaftar '${f}', tetapi app/${f} tidak ada — precache-nya akan gagal senyap`);
  }
}
for (const f of readdirSync(APP)) {
  if (!/\.(html|css|js|webmanifest|svg)$/.test(f) || punya.has(f)) continue;
  salah.push(`app/${f} tidak didaftar di BERKAS_CANGKANG — ia tidak akan tersedia saat luring`);
}

console.log(`sw.js VERSI        : ${versi ?? '—'}${versi === 'dev' ? ' (cap disuntikkan saat perakitan)' : ''}`);
console.log(`  berkas cangkang  : ${daftar.length}`);

if (salah.length) {
  console.error(`\n${salah.length} masalah:`);
  for (const s of salah) console.error(`  ✗ ${s}`);
  process.exit(1);
}
console.log('Daftar cangkang utuh, dan capnya siap disuntikkan.');
