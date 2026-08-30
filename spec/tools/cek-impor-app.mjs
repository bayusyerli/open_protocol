// Memeriksa setiap berkas app/*.js benar-benar MENGIMPOR apa yang dipanggilnya.
//
//   node spec/tools/cek-impor-app.mjs
//
// KENAPA ALAT INI ADA
// Pada 28 Agustus 2026 `jalur-1.js` mulai memanggil `ambilPecahan()` dan mengimpornya
// pada baris yang sama. Dua hari kemudian sebuah merge menyatukan cabang itu dengan
// main, yang baris impornya sudah berubah karena sebab lain. Penyelesaian konflik
// mengambil baris impor main dan badan berkas dari cabang — panggilannya ikut, namanya
// tidak. Berkasnya tetap terurai sempurna: ReferenceError baru lahir saat DIJALANKAN.
//
// Akibatnya jalur 1 tayang selama dua hari dengan pemilih gejala yang tidak pernah
// muncul. Tidak ada yang menangkapnya: `cek-urai-app.mjs` hanya memeriksa sintaksis,
// dan suite Playwright memang membuka tanaman.html tetapi yang tergambar di sana adalah
// kartu galat yang sepenuhnya aksesibel — axe hijau, satu <h1>, tidak meluber.
//
// APA YANG DIPERIKSA
// Untuk tiap app/*.js: nama yang DIPANGGIL sebagai `nama(...)`, yang diekspor modul
// app/ LAIN, tetapi tidak diimpor berkas ini dan tidak dideklarasikan di dalamnya.
//
// Sengaja pelit, bukan menyeluruh. Ini bukan pengganti linter: ia tidak tahu lingkup,
// tidak melihat nama global, dan melewatkan ekspor yang dipakai tanpa dipanggil. Yang
// ditutup satu kelas kesalahan yang sudah pernah tayang — nama yang jatuh dari baris
// impor — dengan syarat lolos yang longgar, supaya CI tidak pernah merah karena tebakan.

import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP = join(AKAR, 'app');

// Komentar dan string biasa dibuang sebelum apa pun dicocokkan: prosa Indonesia di
// dalamnya menyebut nama fungsi terus-menerus. Literal template DIBIARKAN — di dalamnya
// ada `${...}` yang memang kode — dan itu aman karena yang dicari `nama(`, bentuk yang
// tidak muncul dalam kalimat.
// Barisnya dipertahankan — komentar blok diganti sebanyak baris yang dimakannya — supaya
// nomor baris yang dilaporkan menunjuk ke berkas aslinya, bukan ke salinan yang menyusut.
const bersihkan = (s) => s
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
  .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
  .replace(/"(?:[^"\\\n]|\\.)*"/g, '""');

const berkas = readdirSync(APP).filter((n) => n.endsWith('.js')).sort();
const asli = new Map(berkas.map((n) => [n, readFileSync(join(APP, n), 'utf8')]));
const sumber = new Map(berkas.map((n) => [n, bersihkan(asli.get(n))]));

// 1. Apa yang diekspor tiap modul.
const ekspor = new Map();
for (const [n, s] of sumber) {
  const nama = new Set();
  for (const m of s.matchAll(/^export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm)) nama.add(m[1]);
  for (const m of s.matchAll(/^export\s+(?:const|let|class)\s+([A-Za-z_$][\w$]*)/gm)) nama.add(m[1]);
  for (const m of s.matchAll(/^export\s*\{([^}]*)\}/gm)) {
    for (const bagian of m[1].split(',')) {
      const t = bagian.trim().split(/\s+as\s+/);
      if (t[0]) nama.add((t.at(-1) ?? t[0]).trim());
    }
  }
  ekspor.set(n, nama);
}

// 2. Nama yang diikat sebuah berkas lewat impor — dari mana pun, alias ikut.
function diimpor(s) {
  const nama = new Set();
  for (const m of s.matchAll(/import\s*(?:([A-Za-z_$][\w$]*)\s*,?\s*)?(?:\{([^}]*)\})?\s*from/g)) {
    if (m[1]) nama.add(m[1]);
    for (const bagian of (m[2] ?? '').split(',')) {
      const t = bagian.trim().split(/\s+as\s+/);
      if (t[0]) nama.add((t.at(-1) ?? t[0]).trim());
    }
  }
  for (const m of s.matchAll(/import\s*\*\s*as\s+([A-Za-z_$][\w$]*)/g)) nama.add(m[1]);
  return nama;
}

const temuan = [];
for (const [n, s] of sumber) {
  const punya = diimpor(s);
  const baris = asli.get(n).split('\n');

  for (const [asal, nama] of ekspor) {
    if (asal === n) continue;
    for (const x of nama) {
      if (punya.has(x)) continue;
      // Dideklarasikan sendiri di berkas ini — termasuk sebagai apa pun yang kebetulan
      // senama. Longgar dengan sengaja: melewatkan satu temuan jauh lebih murah daripada
      // menghentikan CI atas nama yang sebenarnya sah.
      if (new RegExp(`\\b(?:const|let|var|function|class)\\s+${x}\\b`).test(s)) continue;

      const semua = [...s.matchAll(new RegExp(`(?<![\\w$.])${x}\\b`, 'g'))];
      if (!semua.length) continue;
      // Nama yang HANYA pernah muncul sebagai panggilan. Kalau ia pernah muncul dalam
      // bentuk lain — parameter, sisi kanan penugasan, medan objek — ia punya pengikat
      // yang tidak terbaca aturan di atas, dan berkas ini bukan tempat menebaknya.
      if (!semua.every((m) => s.slice(m.index + x.length).startsWith('('))) continue;

      const ke = s.slice(0, semua[0].index).split('\n').length;
      temuan.push({ n, ke, x, asal, baris: baris[ke - 1].trim() });
    }
  }
}

for (const t of temuan) {
  console.error(`GAGAL app/${t.n}:${t.ke}  memanggil ${t.x}() — ekspor app/${t.asal}, tidak ada di baris impor`);
  console.error(`    ${t.baris}`);
}

console.log(`${berkas.length} berkas app/ diperiksa; ${temuan.length} panggilan tanpa impor.`);
if (temuan.length) {
  console.error('\nHalamannya akan terurai, memuat, lalu melempar ReferenceError saat dijalankan.');
  process.exit(1);
}
