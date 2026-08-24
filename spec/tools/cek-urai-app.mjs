// Memeriksa setiap berkas app/*.js benar-benar terurai sebagai MODUL ES.
//
//   node spec/tools/cek-urai-app.mjs
//
// KENAPA ALAT INI ADA
// principal.js pernah terkirim dengan template literal yang tertutup di tengah
// komentar: sepasang backtick mengelilingi kata `lazy` di dalam komentar HTML, dan
// backtick pembukanya menutup literal yang dibuka empat baris di atasnya. Seluruh
// modul gagal diurai, principal.html tidak menjalankan JavaScript sama sekali —
// cangkang bersama tidak tersuntik, kartu perusahaan tidak pernah dirender — dan
// yang menangkapnya cuma membuka halamannya di peramban.
//
// KENAPA `node --check` TIDAK CUKUP
// Berkas .js tanpa "type": "module" di package.json terdekat diurai Node sebagai
// CommonJS. `node --check app/principal.js` LOLOS untuk galat di atas; app/ memang
// tidak punya package.json sendiri. Sementara halaman memuat berkas-berkas ini
// sebagai <script type="module">, yang aturan uraiannya lain. Jadi pemeriksaan wajib
// memaksa modus modul lewat --input-type=module, dan sumbernya wajib masuk lewat
// stdin karena bendera itu tidak berlaku untuk argumen lintasan.
//
// APA YANG ALAT INI TANGKAP, DAN APA YANG TIDAK
// Hanya sintaksis. Berkas yang terurai tapi melempar saat dijalankan, mengimpor
// berkas yang tidak ada, atau merender kosong tetap lolos di sini — itu urusan
// membuka halamannya. Yang ditutup lubangnya cuma satu: modul rusak yang membuat
// SELURUH halaman diam, dan yang selama ini tak terperiksa di CI mana pun.

import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

// Lintasan diselesaikan dari letak berkas ini, bukan dari cwd — `npm run all`
// berjalan dari spec/, sedangkan yang diperiksa ada di app/ pada akar repositori.
const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP = join(AKAR, 'app');

const berkas = readdirSync(APP).filter((n) => n.endsWith('.js')).sort();
let gagal = 0;

for (const n of berkas) {
  try {
    execFileSync(process.execPath, ['--input-type=module', '--check'], {
      input: readFileSync(join(APP, n)),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (e) {
    gagal++;
    // Baris galat Node menyebut [stdin] sebagai berkasnya, karena sumbernya memang
    // masuk lewat stdin. Namanya diganti supaya keluarannya bisa langsung dibuka.
    const pesan = String(e.stderr ?? e.message).replace(/\[stdin\]/g, `app/${n}`);
    console.error(`GAGAL app/${n}`);
    console.error(pesan.split('\n').slice(0, 8).map((b) => `    ${b}`).join('\n'));
  }
}

console.log(`${berkas.length - gagal}/${berkas.length} berkas app/ terurai sebagai modul ES.`);
if (gagal) {
  console.error(`\n${gagal} berkas gagal diurai — halamannya tidak akan menjalankan JavaScript sama sekali.`);
  process.exit(1);
}
