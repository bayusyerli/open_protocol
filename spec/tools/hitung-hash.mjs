// Menghitung content_hash dokumen, dan menyegarkannya bila diminta.
//
//   node spec/tools/hitung-hash.mjs <berkas...>            # hitung dan tampilkan
//   node spec/tools/hitung-hash.mjs --tulis <berkas...>    # tulis ke lifecycle.content_hash
//   node spec/tools/hitung-hash.mjs --tulis --semua        # seluruh vocab yang sudah berhash
//
// Kanonikalisasi RFC 8785; apa yang di-hash dan apa yang dikecualikan dijelaskan di
// spec/kanonik.mjs. Aturan L34 menolak hash yang tidak cocok dengan isinya, jadi alat ini
// yang dipakai menyegarkannya setelah isi dokumen berubah.
//
// Menulis hash BUKAN pekerjaan rutin. Ia dilakukan sekali saat sebuah versi dianggap
// selesai, dan sesudah itu setiap perubahan isi menuntut versi baru — bukan hash baru
// pada versi lama. L34 tidak bisa membedakan keduanya; yang membedakan disiplin orangnya.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hitungHash } from '../kanonik.mjs';

const AKAR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const tulis = argv.includes('--tulis');
const semua = argv.includes('--semua');
let berkas = argv.filter((a) => !a.startsWith('--'));

if (semua) {
  const d = resolve(AKAR, 'spec/vocab');
  berkas = readdirSync(d).filter((f) => f.endsWith('.json'))
    .map((f) => join('spec/vocab', f))
    .filter((f) => { try { return Boolean(JSON.parse(readFileSync(resolve(AKAR, f), 'utf8')).lifecycle?.content_hash); } catch { return false; } });
}

if (!berkas.length) { console.error('Sebutkan berkasnya, atau pakai --semua.'); process.exit(2); }

let berubah = 0;
for (const f of berkas) {
  const p = resolve(AKAR, f);
  const d = JSON.parse(readFileSync(p, 'utf8'));
  if (!d.lifecycle) { console.log(`  lewat  ${f} — tanpa lifecycle, tidak ada tempat menaruh hash`); continue; }

  const baru = hitungHash(d);
  const lama = d.lifecycle.content_hash;
  const cocok = lama === baru;

  if (!tulis) {
    console.log(`  ${cocok ? 'cocok ' : lama ? 'BEDA  ' : 'kosong'} ${f}`);
    console.log(`         ${baru}`);
    if (lama && !cocok) console.log(`         tertulis: ${lama}`);
    continue;
  }
  if (cocok) { console.log(`  cocok  ${f} — tidak diubah`); continue; }

  d.lifecycle.content_hash = baru;
  writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
  console.log(`  tulis  ${f}`);
  console.log(`         ${lama ? `${lama} -> ` : ''}${baru}`);
  berubah++;
}
if (tulis) console.log(`\n${berubah} berkas disegarkan.\n`);
