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

for (const file of fixtures) {
  // Galat pada item di dalam koleksi dilaporkan dengan label berimbuhan —
  // "fixtures-invalid/x.json [0] kunci" — sehingga endsWith saja tidak pernah cocok, dan
  // fixture berbentuk koleksi diam-diam tidak teruji. Imbuhannya dipotong lebih dulu.
  const jalur = (f) => f.replace(/[\s[].*$/, '');
  const rules = [...byFile.entries()].filter(([f]) => jalur(f).endsWith(file)).flatMap(([, r]) => r);
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
