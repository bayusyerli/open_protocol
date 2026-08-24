// Memasang dan memeriksa Content-Security-Policy di halaman app/.
//
//   node spec/tools/cek-csp.mjs           # periksa; keluar bukan nol kalau ada yang salah
//   node spec/tools/cek-csp.mjs --tulis   # pasang atau perbarui meta CSP di tiap halaman
//
// KENAPA CSP DI SINI PENTING, DAN KENAPA IA HARUS DIPERIKSA MESIN.
// Permukaan ini menyisipkan HTML di ratusan titik, dan seluruhnya melolos datanya lewat
// `teks()`. Disiplin itu nyata dan terperiksa — tetapi ia bergantung pada tiap penulis
// layar mengingatnya di tiap baris baru. CSP adalah lapis kedua yang tidak bergantung pada
// ingatan siapa pun: kalau satu nilai lolos tanpa dilolos, ia tetap tidak bisa mengeksekusi
// apa pun. Tanpa lapis kedua, satu kelalaian menjadi eksekusi penuh — termasuk membaca
// `op:kas`, catatan uang orangnya sendiri.
//
// KENAPA HASH, BUKAN 'unsafe-inline' DAN BUKAN BERKAS TERPISAH.
// Tiap halaman memuat satu skrip sebaris: penyetel tema anti-kedip, yang WAJIB berjalan
// sebelum halaman tergambar. Memindahkannya ke berkas terpisah menambah satu perjalanan
// pulang-pergi yang memblokir render — pada permukaan yang syarat lapangan nomor satunya
// sinyal buruk, itu membayar dengan mata uang yang paling mahal di sini. `unsafe-inline`
// akan membatalkan seluruh gunanya. Jadi yang dipakai hash skripnya, dan berkas ini yang
// menjaga hash itu tetap cocok: begitu skrip temanya disunting satu spasi pun, `npm run
// all` gagal dan menyebut hash barunya.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP = join(AKAR, 'app');
const tulis = process.argv.includes('--tulis');

const hashSkrip = (isi) => `sha256-${createHash('sha256').update(isi, 'utf8').digest('base64')}`;

/* Kebijakannya sesempit yang masih membuat permukaan ini jalan, dan tiap arahan punya
 * alasannya sendiri:
 *
 *   default-src 'self'   tidak ada satu pun aset dari luar asal — diperiksa di bawah
 *   script-src           hanya skrip milik sendiri, plus hash skrip tema sebaris
 *   style-src            gaya sebaris dipakai untuk lebar bilah dan sejenisnya, yang
 *                        nilainya dihitung dari data; keduanya tidak bisa mengeksekusi
 *   img-src data:        placeholder gambar kemasan digambar sebagai data URI
 *   connect-src 'self'   indeks dan meta.json; tidak ada telemetri, dan CSP menegakkannya
 *   form-action 'self'   tidak ada formulir yang menyeberang asal
 *   base-uri 'none'      <base> yang disuntik tidak bisa membelokkan jalur relatif
 *
 * `frame-ancestors` SENGAJA TIDAK ADA DI SINI. Ia diabaikan bila dikirim lewat <meta> —
 * peramban mencetak peringatan dan melewatinya — jadi menuliskannya cuma menghasilkan
 * kebisingan di konsol dan rasa aman yang keliru. Ia harus dipasang sebagai header oleh
 * yang menyajikan, bersama `X-Content-Type-Options: nosniff`; keduanya tercatat di
 * docs/20-jalur-tayang.md sebagai pekerjaan yang menunggu pemilihan host. */
const arahan = (hash) => [
  "default-src 'self'",
  `script-src 'self' '${hash}'`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "base-uri 'none'",
].join('; ');

const BENTUK_META = /^[ \t]*<meta http-equiv="Content-Security-Policy"[^>]*>\n/m;
const BENTUK_SKRIP = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
const LUAR = /(?:src|href)="(https?:)?\/\/[^"]*"/g;

const halaman = readdirSync(APP).filter((f) => f.endsWith('.html')).sort();
const salah = [];
let dipasang = 0; let cocok = 0;
const hashTerpakai = new Set();

for (const f of halaman) {
  const jalan = join(APP, f);
  let isi = readFileSync(jalan, 'utf8');

  // Satu asal saja. Sumber luar akan diblokir CSP saat tayang, dan lebih baik ketahuan di
  // sini daripada sebagai layar kosong di HP orang.
  const luar = [...isi.matchAll(LUAR)].map((m) => m[0]);
  if (luar.length) salah.push(`${f}: memuat sumber dari luar asal — ${luar[0]}`);

  const skrip = [...isi.matchAll(BENTUK_SKRIP)];
  if (skrip.length > 1) salah.push(`${f}: ${skrip.length} skrip sebaris; kebijakan ini menganggap hanya ada satu (penyetel tema)`);
  if (!skrip.length) { salah.push(`${f}: tidak ada skrip tema sebaris — kalau ia memang dihapus, perbarui berkas ini`); continue; }

  const hash = hashSkrip(skrip[0][1]);
  hashTerpakai.add(hash);
  const meta = `<meta http-equiv="Content-Security-Policy" content="${arahan(hash)}">\n`;

  // Dibandingkan SELURUH barisnya, bukan hashnya saja. Membandingkan hash saja membuat
  // perubahan arahan — mencabut satu, menambah satu — lolos tanpa ketahuan, dan itu persis
  // yang sempat terjadi ketika `frame-ancestors` dikeluarkan.
  const ada = BENTUK_META.exec(isi);
  if (ada && ada[0].trim() === meta.trim()) { cocok++; continue; }

  if (!tulis) {
    salah.push(ada
      ? `${f}: CSP terpasang tetapi isinya sudah tidak cocok dengan kebijakan di berkas ini — jalankan dengan --tulis`
      : `${f}: belum punya meta CSP — jalankan dengan --tulis`);
    continue;
  }

  isi = ada ? isi.replace(BENTUK_META, meta) : isi.replace(/(<meta name="viewport"[^>]*>\n)/, `$1${meta}`);
  if (!isi.includes('Content-Security-Policy')) { salah.push(`${f}: tidak ada <meta name="viewport"> untuk menyisipkan CSP sesudahnya`); continue; }
  writeFileSync(jalan, isi);
  dipasang++;
}

console.log(`Halaman app        : ${halaman.length}`);
if (dipasang) console.log(`  CSP dipasang     : ${dipasang}`);
if (cocok) console.log(`  CSP sudah cocok  : ${cocok}`);
console.log(`  hash skrip tema  : ${[...hashTerpakai].join(', ') || '—'}`);

if (salah.length) {
  console.error(`\n${salah.length} halaman bermasalah:`);
  for (const s of salah) console.error(`  ✗ ${s}`);
  process.exit(1);
}
console.log('CSP terpasang dan hashnya cocok di seluruh halaman.');
