// Uji negatif: membuktikan setiap aturan benar-benar menolak data yang salah.
// Nama berkas di fixtures-invalid/ menyatakan aturan yang harus menyala.
// Berkas berawalan "ok-" adalah pelengkap dan harus lolos.
// Jalankan: npm test

import { runChecks } from './check.mjs';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'fixtures-invalid';
// Kosakata ikut dimuat supaya aturan yang butuh pencarian entitas (L10, L12, L13) bisa diuji.
const { errors } = runChecks({ dirs: ['vocab', DIR] });
const byFile = new Map();
for (const e of errors) {
  if (!byFile.has(e.file)) byFile.set(e.file, []);
  byFile.get(e.file).push(e.rule);
}

let pass = 0;
let fail = 0;
const fixtures = [
  ...readdirSync(DIR, { withFileTypes: true }).filter((e) => e.isFile() && e.name.endsWith('.json')).map((e) => e.name),
  ...readdirSync(DIR, { withFileTypes: true }).filter((e) => e.isDirectory())
    .flatMap((d) => readdirSync(join(DIR, d.name)).filter((f) => f.endsWith('.meta.json')).map((f) => `${d.name}/${f}`)),
].sort();

// Galat pada berkas KOLEKSI dilaporkan dengan buntut penunjuk item — "berkas.json [0]
// kunci-entitas" — supaya yang membacanya tahu item mana yang salah. Buntut itu membuat
// endsWith() gagal, dan akibatnya fixture berbentuk koleksi tidak akan pernah cocok
// dengan aturannya sendiri: ia terbaca "tidak ada yang menyala" dan lolos diam-diam,
// justru pada berkas yang ditulis untuk membuktikan sebuah aturan menyala. Jadi buntutnya
// dipotong dulu, dan pencocokannya tetap pada nama berkasnya.
const namaBerkas = (f) => f.replace(/ \[\d+\].*$/, '');

for (const file of fixtures) {
  // Galat pada item di dalam koleksi dilaporkan dengan label berimbuhan —
  // "fixtures-invalid/x.json [0] kunci" — sehingga endsWith saja tidak pernah cocok, dan
  // fixture berbentuk koleksi diam-diam tidak teruji. Imbuhannya dipotong `namaBerkas()`
  // di atas, yang memotong tepat pada " [N]" alih-alih pada spasi pertama: nama berkas
  // yang mengandung spasi tidak boleh ikut terpotong.
  const rules = [...byFile.entries()].filter(([f]) => namaBerkas(f).endsWith(file)).flatMap(([, r]) => r);
  if (file.split('/').pop().startsWith('ok-')) {
    if (rules.length === 0) { console.log(`  OK    ${file} — lolos, sesuai harapan`); pass++; }
    else { console.log(`  GAGAL ${file} — seharusnya lolos, tapi menyala: ${rules.join(', ')}`); fail++; }
    continue;
  }
  const expected = file.split('/').pop().split('-')[0];
  const hit = rules.find((r) => r.startsWith(expected));
  if (hit) { console.log(`  OK    ${file} — tertangkap oleh ${hit}`); pass++; }
  else { console.log(`  GAGAL ${file} — aturan ${expected} tidak menyala (yang menyala: ${rules.join(', ') || 'tidak ada'})`); fail++; }
}

console.log(`\n${pass} lolos, ${fail} gagal.\n`);
process.exit(fail ? 1 : 0);
