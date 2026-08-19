// CLI pemeriksa spesifikasi. Jalankan: npm run check
import { runChecks } from './check.mjs';

const dirs = process.argv.length > 2 ? process.argv.slice(2) : ['vocab', 'examples'];
const { errors, warnings, validated, total, schemaCount } = runChecks({ dirs });
const pad = (s, n) => String(s).padEnd(n);

console.log(`\nSkema   : ${schemaCount} berkas dimuat`);
console.log(`Dokumen : ${validated}/${total} lolos skema  (${dirs.join(', ')})\n`);

for (const w of warnings) console.log(`PERINGATAN  ${pad(w.rule, 22)} ${w.file}\n            ${w.msg}`);
if (warnings.length) console.log('');
for (const e of errors) console.log(`GALAT       ${pad(e.rule, 22)} ${e.file}\n            ${e.msg}`);

if (errors.length) {
  console.log(`\n${errors.length} galat, ${warnings.length} peringatan.\n`);
  process.exit(1);
}
console.log(`Lolos: 0 galat, ${warnings.length} peringatan.\n`);
