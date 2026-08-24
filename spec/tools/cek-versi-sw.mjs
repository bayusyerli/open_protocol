// Menjaga `VERSI` di sw.js ikut berubah setiap kali cangkang aplikasi berubah.
//
//   node spec/tools/cek-versi-sw.mjs           # periksa
//   node spec/tools/cek-versi-sw.mjs --tulis   # segarkan sidik jarinya sesudah bump
//
// MODE GAGALNYA SUNYI, DAN ITU YANG MEMBUATNYA MAHAL. Service worker menyajikan cangkang
// cache-first: berkas HTML, modul, dan gaya dilayani dari cache tanpa bertanya. Yang
// membebaskan cache itu cuma satu hal — `VERSI` berubah, sehingga nama cache berubah dan
// yang lama dibuang. Deploy yang mengubah app/ tetapi lupa menaikkan `VERSI` membuat
// pengguna yang pernah membuka permukaan ini terkunci di versi lama TANPA BATAS WAKTU dan
// tanpa satu pun tanda — perbaikan keselamatan sekalipun tidak akan sampai kepadanya.
//
// Ini bukan kekhawatiran teoretis: selama satu sesi kerja 24 Agustus 2026 saja, kelalaian
// ini terjadi berkali-kali dan tiap kali baru ketahuan lewat verifikasi manual di peramban
// — "kenapa perubahannya tidak muncul" — bukan lewat sesuatu yang memberi tahu.
//
// Yang disimpan sidik jari isi cangkang, bukan daftar berkasnya: nama berkas yang sama
// dengan isi berbeda persis kasus yang harus tertangkap.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SW = join(AKAR, 'sw.js');
const APP = join(AKAR, 'app');
const SIDIK = join(AKAR, 'spec', 'tools', 'sidik-cangkang.json');
const tulis = process.argv.includes('--tulis');

const sw = readFileSync(SW, 'utf8');
const versi = /const VERSI = '([^']+)'/.exec(sw)?.[1];
if (!versi) { console.error('sw.js: tidak menemukan `const VERSI`.'); process.exit(1); }

/* Daftar cangkang dibaca DARI sw.js, bukan diketik ulang di sini. Dua daftar yang wajib
 * sama akan menyimpang, dan yang menyimpang membuat pemeriksa ini menjaga berkas yang
 * bukan berkas yang benar-benar di-cache. */
const blok = /const BERKAS_CANGKANG = \[([\s\S]*?)\]\.map/.exec(sw)?.[1];
if (!blok) { console.error('sw.js: tidak menemukan BERKAS_CANGKANG.'); process.exit(1); }
const daftar = [...blok.matchAll(/'([^']+)'/g)].map((m) => m[1]);

const hilang = daftar.filter((f) => !existsSync(join(APP, f)));
// Berkas app/ yang ADA tetapi tidak didaftar juga masalah — ia gagal senyap saat luring.
const punya = new Set(daftar);
const tercecer = readdirSync(APP)
  .filter((f) => /\.(html|css|js|webmanifest|svg)$/.test(f) && !punya.has(f))
  .filter((f) => !f.endsWith('.md'));

const sidikKini = createHash('sha256');
for (const f of daftar) {
  if (!existsSync(join(APP, f))) continue;
  sidikKini.update(f).update('\0').update(readFileSync(join(APP, f)));
}
const sidik = sidikKini.digest('hex').slice(0, 16);

const lama = existsSync(SIDIK) ? JSON.parse(readFileSync(SIDIK, 'utf8')) : null;

console.log(`sw.js VERSI        : ${versi}`);
console.log(`  berkas cangkang  : ${daftar.length}`);
console.log(`  sidik isi        : ${sidik}${lama ? ` (tercatat: ${lama.sidik} pada ${lama.versi})` : ' — belum pernah dicatat'}`);

const salah = [];
for (const f of hilang) salah.push(`sw.js mendaftar '${f}', tetapi app/${f} tidak ada — precache-nya akan gagal senyap`);
for (const f of tercecer) salah.push(`app/${f} tidak didaftar di BERKAS_CANGKANG — ia tidak akan tersedia saat luring`);

if (lama && lama.sidik !== sidik && lama.versi === versi) {
  salah.push(
    `isi cangkang berubah tetapi VERSI masih '${versi}'.\n`
    + '      Pengguna yang pernah membuka permukaan ini akan terkunci di versi lama tanpa batas waktu.\n'
    + `      Naikkan VERSI di sw.js, lalu: node spec/tools/cek-versi-sw.mjs --tulis`,
  );
}

if (salah.length) {
  console.error(`\n${salah.length} masalah:`);
  for (const s of salah) console.error(`  ✗ ${s}`);
  process.exit(1);
}

if (!lama || lama.sidik !== sidik || lama.versi !== versi) {
  if (!tulis) {
    console.log('\nSidik jarinya perlu dicatat. Jalankan dengan --tulis.');
    process.exit(0);
  }
  writeFileSync(SIDIK, `${JSON.stringify({ versi, sidik, dicatat: 'oleh cek-versi-sw.mjs' }, null, 2)}\n`);
  console.log(`\nDicatat: ${versi} → ${sidik}`);
} else {
  console.log('\nVERSI cocok dengan isi cangkang.');
}
