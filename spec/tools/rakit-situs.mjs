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
// halaman rusak. Itu bukan dugaan: audit 24 Agustus menemukan `test -f terbit/perusahaan.html`
// gagal, dan 14.920 halaman produk menaut berkas itu.
//
// Jadi yang dikerjakan berkas ini dua hal, dan yang kedua yang membuatnya layak jadi alat:
// ia MEMERIKSA hasil rakitannya sendiri. Tiap href dan src mutlak di seluruh HTML dicocokkan
// ke berkas yang benar-benar ada; satu saja yang menggantung, perintah ini gagal dengan kode
// bukan nol dan menyebut berkasnya. Deploy yang bolong berhenti di sini, bukan di mesin
// pencari.

import { readdirSync, statSync, mkdirSync, rmSync, copyFileSync, linkSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
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
let denganTaut = 0; let denganSalin = 0; let ditulisUlang = 0;
/* Menulis ulang sebuah berkas rakitan berarti memutus hardlink-nya — berkasnya
 * berhenti berbagi inode dengan sumbernya. Pemutusan itu dicatat di sini supaya
 * ringkasan di bawah tidak melaporkan 41 ribu hardlink padahal 30 ribu di antaranya
 * sudah jadi berkas sendiri. Yang mana yang tadinya tertaut dibaca dari `nlink`,
 * bukan ditebak: `--salin` membuat semuanya salinan sejak awal. */
function putusTaut(p) {
  if (statSync(p).nlink > 1) denganTaut--; else denganSalin--;
  ditulisUlang++;
  rmSync(p);
}
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

/* CAP SERVICE WORKER DISUNTIKKAN DI SINI, dan itu satu-satunya tempat ia lahir.
 *
 * Cangkang disajikan cache-first, dan yang membebaskannya cuma nama cache yang berubah.
 * Selama nama itu berupa angka yang dinaikkan orang, ia akan tertinggal — empat kali
 * berturut-turut CI menolak push karena isi berubah sementara versinya tidak, dan tiap kali
 * berpola sama: versi dinaikkan, app/ disunting lagi, keduanya ikut satu commit.
 *
 * Di sini urutan itu mustahil. Capnya dihitung dari isi berkas cangkang yang BENAR-BENAR
 * terangkut ke rakitan — sesudah penyalinan terakhir, sebelum satu byte pun diunggah — jadi
 * ia tidak bisa didahului suntingan. Yang menyunting app/ lalu merakit ulang otomatis
 * mendapat cap baru; yang tidak menyunting apa pun mendapat cap yang sama, sehingga
 * pengguna tidak mengunduh ulang 700 KB tanpa alasan.
 *
 * Sumbernya tidak ikut berubah: `sw.js` di repositori tetap berbunyi `dev`, dan itu yang
 * dipakai saat pengembangan. Yang ditulis ulang hanya salinan di `_situs/`. */
const BENTUK_VERSI = /^const VERSI = '[^']*';$/m;

for (const { dari, ke } of BERKAS_AKAR) {
  const s = join(AKAR, dari);
  if (!existsSync(s)) { console.error(`${dari} tidak ada.`); process.exit(1); }
  asal.set(ke, dari);
  pasang(s, join(KELUAR, ke));
  console.log(`  ${String(1).padStart(6)}  ${dari}`.padEnd(34) + '— service worker');
}

// Cap dihitung dari isi berkas cangkang yang didaftar sw.js sendiri — bukan dari seluruh
// app/, karena yang menentukan kebaruan cache justru yang masuk ke dalamnya.
const swSumber = readFileSync(join(AKAR, 'sw.js'), 'utf8');
const daftarCangkang = [...(/const BERKAS_CANGKANG = \[([\s\S]*?)\]\.map/.exec(swSumber)?.[1] ?? '')
  .matchAll(/'([^']+)'/g)].map((m) => m[1]);

if (!daftarCangkang.length) {
  console.error('\nsw.js: BERKAS_CANGKANG tidak terbaca — cap tidak bisa dihitung.');
  process.exit(1);
}

const hilangCangkang = daftarCangkang.filter((f) => !asal.has(f));
if (hilangCangkang.length) {
  console.error(`\n${hilangCangkang.length} berkas cangkang tidak ada di rakitan:`);
  for (const f of hilangCangkang.slice(0, 10)) console.error(`  ${f}`);
  console.error('Precache-nya akan gagal senyap, dan luring jadi bolong tanpa satu pun galat.');
  process.exit(1);
}

const sidik = createHash('sha256');
for (const f of daftarCangkang) sidik.update(f).update('\0').update(readFileSync(join(KELUAR, f)));
const cap = `c${sidik.digest('hex').slice(0, 12)}`;

/* SATU PREDIKAT, DIPAKAI DUA TEMPAT — daftar prasimpan service worker dan rujukan di
 * seluruh HTML/JS. Keduanya WAJIB sepakat: yang diprasimpan dengan bentuk URL yang tidak
 * pernah diminta halaman adalah cache yang penuh dan meleset seluruhnya, tanpa satu pun
 * galat. `.html` sengaja di luar — dua URL yang menjawab 200 untuk satu halaman adalah isi
 * ganda di mata mesin pencari, dan canonical tidak menghapus pemborosan anggaran rayapnya.
 * `.webmanifest`, ikon, dan logo juga di luar: keduanya jarang berubah dan sudah disajikan
 * `immutable` menurut jenisnya. */
const BERCAP = (f) => /\.(css|js)$/.test(f);

const swRakit = join(KELUAR, 'sw.js');
const swIsi = readFileSync(swRakit, 'utf8');
if (!BENTUK_VERSI.test(swIsi)) {
  console.error('\nsw.js: baris `const VERSI = \'…\';` tidak ketemu — cap tidak bisa disuntikkan.');
  process.exit(1);
}
const BENTUK_DAFTAR = /(const BERKAS_CANGKANG = \[)([\s\S]*?)(\]\.map)/;
if (!BENTUK_DAFTAR.test(swIsi)) {
  console.error('\nsw.js: blok BERKAS_CANGKANG tidak ketemu — daftarnya tidak bisa dicap.');
  process.exit(1);
}

let literalDicap = 0;
const swBaru = swIsi
  .replace(BENTUK_VERSI, `const VERSI = '${cap}';`)
  .replace(BENTUK_DAFTAR, (_, buka, isi, tutup) => buka + isi.replace(/'([^']+)'/g, (asli, f) => {
    if (!BERCAP(f)) return asli;
    literalDicap++;
    return `'${f}?v=${cap}'`;
  }) + tutup);

const harusnya = daftarCangkang.filter(BERCAP).length;
if (literalDicap !== harusnya) {
  console.error(`\nsw.js: ${literalDicap} literal tercap, seharusnya ${harusnya}.`);
  console.error('Daftar prasimpan dan rujukan halaman akan menyimpang, dan simpangannya sunyi.');
  process.exit(1);
}

// Hardlink dibuang lebih dulu: menulis lewat tautan akan ikut mengubah sw.js di repositori.
putusTaut(swRakit);
writeFileSync(swRakit, swBaru);
console.log(`  ${String(daftarCangkang.length).padStart(6)}  cangkang`.padEnd(34)
  + `— cap ${cap}, ${literalDicap} nama dicap`);

/* CAP YANG SAMA DITEMPELKAN KE TIAP RUJUKAN CANGKANG.
 *
 * Sampai 30 Agustus 2026 cap ini hanya jadi nama cache service worker, dan URL cangkang
 * tetap telanjang. Akibatnya `.css` dan `.js` harus disajikan berumur pendek supaya HTML
 * terbitan baru tidak berpasangan dengan JS terbitan lama — mempersempit jendela campur,
 * bukan menutupnya, dan menagih permintaan bersyarat per berkas per jam kepada pembaca
 * yang belum punya service worker. Dengan cap di URL keduanya selesai: tidak ada URL yang
 * bisa menyajikan dua isi, jadi tidak ada versi campur DAN tidak ada yang perlu ditanyakan.
 *
 * DUA POSISI SAJA, DAN ITU DISENGAJA: atribut `href`/`src`, dan specifier `import`. Query
 * tidak ikut mewarisi ke dalam modul — `tanaman.js?v=c1` yang mengimpor `./pustaka.js`
 * meminta `pustaka.js` telanjang — jadi menandai pintu masuknya saja meninggalkan justru
 * modul yang paling banyak dipakai dan paling sering berubah tanpa cap sama sekali.
 *
 * CAPNYA DIHITUNG SEBELUM PENEMPELAN INI, dari isi cangkang yang belum ditempeli. Itu
 * terlihat melingkar dan bukan: penempelan sepenuhnya ditentukan capnya, jadi sumber yang
 * sama tetap menghasilkan rakitan yang sama byte demi byte. Yang tidak boleh terjadi
 * kebalikannya — cap dihitung dari isi yang sudah bercap, yang tidak akan pernah
 * mencapai titik tetap.
 *
 * `.html` TIDAK ikut dicap walaupun ia berkas cangkang: dua URL yang menjawab 200 untuk
 * satu halaman adalah isi ganda di mata mesin pencari, dan canonical tidak menghapus
 * pemborosan anggaran rayapnya. sw.js juga dilewati — di dalamnya nama cangkang muncul
 * sebagai literal daftar, bukan sebagai alamat, dan ia menempelkan capnya sendiri. */
const CANGKANG_BERCAP = daftarCangkang.filter(BERCAP);
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const NAMA_ALT = CANGKANG_BERCAP.map(escRe).join('|');
const POLA_RUJUKAN = [
  new RegExp(`((?:href|src)=)(["'])((?:\\./|/)?(?:${NAMA_ALT}))\\2`, 'g'),
  new RegExp(`(\\b(?:from|import)\\s*)(['"])((?:\\./|/)?(?:${NAMA_ALT}))\\2`, 'g'),
];

const bisaDicap = (jalan) => /\.(html|js)$/.test(jalan) && jalan !== 'sw.js';
let berkasDicap = 0; let rujukanDicap = 0;

for (const jalan of asal.keys()) {
  if (!bisaDicap(jalan)) continue;
  const p = join(KELUAR, jalan);
  const isi = readFileSync(p, 'utf8');
  let n = 0;
  let baru = isi;
  for (const pola of POLA_RUJUKAN) {
    baru = baru.replace(pola, (_, awalan, kutip, rujukan) => {
      n++;
      return `${awalan}${kutip}${rujukan}?v=${cap}${kutip}`;
    });
  }
  if (!n) continue;
  // Hardlink dibuang lebih dulu, sama alasannya dengan sw.js: menulis lewat tautan akan
  // ikut mengubah berkas sumbernya di repositori.
  putusTaut(p);
  writeFileSync(p, baru);
  berkasDicap++; rujukanDicap += n;
}

console.log(`  ${String(berkasDicap).padStart(6)}  berkas dicap`.padEnd(34)
  + `— ${rujukanDicap.toLocaleString('id-ID')} rujukan cangkang bercap`);

/* Diperiksa TERPISAH dari yang menempelkan, bukan dengan pola yang sama dibalik. Pola yang
 * memeriksa dirinya sendiri selalu hijau: yang luput ditempel juga luput diperiksa. Jadi
 * sapuan ini mencari bentuk yang lebih luas — string apa pun yang berakhiran `.css`/`.js`
 * dan bernama seperti berkas cangkang — lalu menuntut capnya ada. Bentuk rujukan yang
 * belum terpikir (`import()` dinamis, atribut lain) mendarat di sini, bukan di produksi. */
const telanjang = new Map();
for (const jalan of asal.keys()) {
  if (!bisaDicap(jalan)) continue;
  const isi = readFileSync(join(KELUAR, jalan), 'utf8');
  for (const m of isi.matchAll(/["']([^"'\s]*\.(?:css|js))["']/g)) {
    const nama = m[1].split('?')[0].split('/').pop();
    if (!CANGKANG_BERCAP.includes(nama)) continue;
    if (m[1].includes('?v=')) continue;
    if (!telanjang.has(m[1])) telanjang.set(m[1], []);
    telanjang.get(m[1]).push(jalan);
  }
}
if (telanjang.size) {
  console.error(`\n${telanjang.size} rujukan cangkang terbit tanpa cap:`);
  for (const [ref, dari] of [...telanjang].slice(0, 10)) {
    console.error(`  ${ref}  — di ${dari.length.toLocaleString('id-ID')} berkas, mis. ${dari[0]}`);
  }
  console.error('Tanpa cap ia disajikan berumur pendek, dan HTML baru bisa berpasangan dengan JS lama.');
  process.exit(1);
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
 * `/perusahaan.html?key=x` adalah berkas `perusahaan.html`. */
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

console.log(`\nBerkas    : ${asal.size.toLocaleString('id-ID')} — ${denganTaut.toLocaleString('id-ID')} hardlink, ${denganSalin.toLocaleString('id-ID')} salinan, ${ditulisUlang.toLocaleString('id-ID')} ditulis ulang`);
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
