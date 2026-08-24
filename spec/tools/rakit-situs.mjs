// Merakit SATU direktori yang bisa diunggah apa adanya — dan memeriksa bahwa isinya tidak
// menaut ke berkas yang tidak ikut terangkut.
//
//   node spec/tools/rakit-situs.mjs                 # rakit ke _situs/, lalu periksa
//   node spec/tools/rakit-situs.mjs --keluar=DIR    # rakit ke tempat lain
//   node spec/tools/rakit-situs.mjs --salin         # salin berkas, jangan hardlink
//
// KENAPA LANGKAH INI ADA, DAN KENAPA IA BUKAN SEKADAR `cp -r`.
// Sampai 24 Agustus 2026 tidak ada satu pun langkah yang menyatukan tiga bagian yang
// masing-masing sudah benar sendiri-sendiri:
//
//   app/          permukaan — HTML, modul, gaya, gambar
//   spec/indeks/  data yang dibaca permukaan itu
//   terbit/       30 ribu halaman entitas, sitemap, robots.txt
//
// Halaman di terbit/ menaut `/gaya.css`, `/index.html`, dan `/manifest.webmanifest` —
// artinya ia mengasumsikan app/ disajikan DI AKAR. Tanpa langkah perakitan, seluruh
// navigasi, gaya, dan skrip di 30 ribu halaman itu 404, dan situsnya terindeks sebagai
// halaman rusak. Itu bukan dugaan: audit 24 Agustus menemukan `test -f terbit/principal.html`
// gagal, dan 14.920 halaman produk menaut berkas itu.
//
// Jadi yang dikerjakan berkas ini dua hal, dan yang kedua yang membuatnya layak jadi alat:
// ia MEMERIKSA hasil rakitannya sendiri. Tiap href dan src mutlak di seluruh HTML dicocokkan
// ke berkas yang benar-benar ada; satu saja yang menggantung, perintah ini gagal dengan kode
// bukan nol dan menyebut berkasnya. Deploy yang bolong berhenti di sini, bukan di mesin
// pencari.

import { readdirSync, statSync, mkdirSync, rmSync, copyFileSync, linkSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname, relative, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (n) => (process.argv.find((a) => a.startsWith(`--${n}=`)) ?? '').split('=').slice(1).join('=');
const bendera = (n) => process.argv.includes(`--${n}`);

const KELUAR = arg('keluar') ? join(AKAR, arg('keluar')) : join(AKAR, '_situs');
const SALIN = bendera('salin');

/* Sumbernya tiga, dan urutannya menentukan. app/ lebih dulu supaya kalau suatu hari sebuah
 * nama bertabrakan dengan nama di terbit/, yang menang permukaan — dan tabrakannya
 * dilaporkan, bukan didiamkan. */
const SUMBER = [
  { dari: 'app', ke: '.', apa: 'permukaan' },
  { dari: 'spec/indeks', ke: 'spec/indeks', apa: 'data indeks' },
  { dari: 'terbit', ke: '.', apa: 'halaman terbitan' },
];

const BERKAS_AKAR = [{ dari: 'sw.js', ke: 'sw.js' }];

// ---------------------------------------------------------------------------

function berkasDi(dir, awalan = '') {
  const keluar = [];
  for (const nama of readdirSync(dir)) {
    if (nama === '.DS_Store') continue;
    const penuh = join(dir, nama);
    const rel = awalan ? posix.join(awalan, nama) : nama;
    if (statSync(penuh).isDirectory()) keluar.push(...berkasDi(penuh, rel));
    else keluar.push(rel);
  }
  return keluar;
}

/* Hardlink, bukan salinan. Rakitan ini 478 MB; menyalinnya memakan waktu dan ruang dua kali
 * lipat untuk isi yang identik dengan yang sudah ada di disk. Hardlink hanya bisa dalam satu
 * berkas sistem, jadi kalau ia gagal — mount berbeda, atau berkas sistem yang tidak
 * mendukungnya — kita jatuh ke salinan tanpa menghentikan perakitan. */
let denganTaut = 0; let denganSalin = 0;
function pasang(sumber, tujuan) {
  mkdirSync(dirname(tujuan), { recursive: true });
  if (!SALIN) {
    try { linkSync(sumber, tujuan); denganTaut++; return; } catch { /* jatuh ke salinan */ }
  }
  copyFileSync(sumber, tujuan);
  denganSalin++;
}

console.log(`Merakit ke ${relative(AKAR, KELUAR) || '.'}/`);
rmSync(KELUAR, { recursive: true, force: true });
mkdirSync(KELUAR, { recursive: true });

const asal = new Map();     // jalur di situs -> dari mana ia datang
const tabrakan = [];

for (const { dari, ke, apa } of SUMBER) {
  const dirSumber = join(AKAR, dari);
  if (!existsSync(dirSumber)) {
    console.error(`\n${dari}/ belum ada. Bangun dulu:`);
    console.error('  node spec/tools/bangun-indeks.mjs --tulis');
    console.error('  node spec/tools/bangun-halaman.mjs --tulis --asal=https://pranatani.com');
    process.exit(1);
  }
  const daftar = berkasDi(dirSumber);
  for (const rel of daftar) {
    const diSitus = ke === '.' ? rel : posix.join(ke, rel);
    if (asal.has(diSitus)) { tabrakan.push([diSitus, asal.get(diSitus), dari]); continue; }
    asal.set(diSitus, dari);
    pasang(join(dirSumber, rel), join(KELUAR, diSitus));
  }
  console.log(`  ${String(daftar.length).padStart(6)}  ${dari}/`.padEnd(34) + `— ${apa}`);
}

for (const { dari, ke } of BERKAS_AKAR) {
  const s = join(AKAR, dari);
  if (!existsSync(s)) { console.error(`${dari} tidak ada.`); process.exit(1); }
  asal.set(ke, dari);
  pasang(s, join(KELUAR, ke));
  console.log(`  ${String(1).padStart(6)}  ${dari}`.padEnd(34) + '— service worker');
}

if (tabrakan.length) {
  console.error(`\n${tabrakan.length} nama bertabrakan antar-sumber:`);
  for (const [jalan, a, b] of tabrakan.slice(0, 10)) console.error(`  ${jalan} — ${a}/ menang atas ${b}/`);
  console.error('Tabrakan berarti satu berkas menimpa berkas lain diam-diam. Beri nama berbeda.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Pemeriksaan: tiap tautan mutlak harus mendarat di berkas yang ada
// ---------------------------------------------------------------------------
/* Yang diperiksa hanya jalur MUTLAK. Tautan relatif sudah dijaga oleh strukturnya sendiri —
 * ia berpindah bersama berkasnya — sedangkan jalur mutlak menyatakan asumsi tentang bentuk
 * situs, dan asumsi itulah yang pernah salah. Query dan fragmen dibuang sebelum dicocokkan:
 * `/principal.html?key=x` adalah berkas `principal.html`. */
const punya = (jalan) => {
  const bersih = jalan.split('#')[0].split('?')[0];
  if (!bersih || bersih === '/') return asal.has('index.html');
  const rel = bersih.replace(/^\/+/, '');
  return asal.has(rel) || asal.has(posix.join(rel, 'index.html')) || asal.has(rel.replace(/\/$/, ''));
};

const halaman = [...asal.keys()].filter((j) => j.endsWith('.html'));
const menggantung = new Map();
let diperiksa = 0;

for (const h of halaman) {
  const isi = readFileSync(join(KELUAR, h), 'utf8');
  for (const m of isi.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    const target = m[1];
    if (/^\/\//.test(target)) continue;               // //cdn.example.com — bukan jalur situs
    diperiksa++;
    if (!punya(target)) {
      if (!menggantung.has(target)) menggantung.set(target, []);
      menggantung.get(target).push(h);
    }
  }
}

console.log(`\nBerkas    : ${asal.size.toLocaleString('id-ID')} — ${denganTaut.toLocaleString('id-ID')} hardlink, ${denganSalin.toLocaleString('id-ID')} salinan`);
console.log(`Halaman   : ${halaman.length.toLocaleString('id-ID')} HTML`);
console.log(`Tautan    : ${diperiksa.toLocaleString('id-ID')} jalur mutlak diperiksa`);

if (menggantung.size) {
  console.error(`\n${menggantung.size} tautan mutlak tidak mendarat di berkas mana pun:`);
  for (const [target, dari] of [...menggantung].slice(0, 15)) {
    console.error(`  ${target}  — dirujuk ${dari.length.toLocaleString('id-ID')} halaman, mis. ${dari[0]}`);
  }
  if (menggantung.size > 15) console.error(`  … dan ${menggantung.size - 15} lagi`);
  console.error('\nSitus dengan tautan menggantung terindeks sebagai halaman rusak. Perakitan dihentikan.');
  process.exit(1);
}

console.log('Tautan mutlak seluruhnya mendarat. Direktori siap diunggah apa adanya.');
