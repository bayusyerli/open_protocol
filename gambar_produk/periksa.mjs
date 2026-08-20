// Pemeriksa manifes gambar. Menegakkan spec/schema/product-image.schema.json ditambah
// tiga aturan yang tidak bisa dinyatakan skema.
//
//   node periksa.mjs [manifes.ndjson]
//
// Sengaja berdiri sendiri, tidak disambung ke spec/check.mjs: manifes ini tinggal di
// folder kerja, bukan di spec/vocab/, dan `npm run all` tidak perlu ikut menunggu
// pembacaan 11 MB ndjson produk hanya untuk memeriksa gambar.

import { readFileSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from '../spec/node_modules/ajv/dist/2020.js';
import addFormats from '../spec/node_modules/ajv-formats/dist/index.js';

const akar = dirname(fileURLToPath(import.meta.url));
const spec = resolve(akar, '../spec');
const manifes = resolve(akar, process.argv[2] ?? 'manifes.ndjson');

const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
for (const f of ['common.schema.json', 'product-image.schema.json']) {
  ajv.addSchema(JSON.parse(readFileSync(join(spec, 'schema', f), 'utf8')));
}
const validate = ajv.getSchema('https://spec.openprotocols.id/v0.1/product-image.schema.json');

if (!existsSync(manifes)) {
  console.error(`Manifes tidak ada: ${manifes}`);
  process.exit(1);
}
const baris = readFileSync(manifes, 'utf8').split('\n').filter((l) => l.trim());
const galat = [];
const fail = (i, rule, msg) => galat.push({ i: i + 1, rule, msg });

// Kunci produk sah, dibaca sekali dari kedua ndjson registri.
const idProduk = new Set();
for (const f of ['pestisida.ndjson', 'pupuk.ndjson']) {
  const p = join(spec, 'vocab', 'product', f);
  if (!existsSync(p)) continue;
  for (const l of readFileSync(p, 'utf8').split('\n')) {
    if (l.trim()) idProduk.add(JSON.parse(l).id);
  }
}

const skuPeran = new Map();  // sku_key + role -> baris pertama
const perPhash = new Map();  // phash -> daftar sku_key

for (const [i, l] of baris.entries()) {
  let rec;
  try { rec = JSON.parse(l); } catch (e) { fail(i, 'G0-json', e.message); continue; }

  if (!validate(rec)) {
    for (const e of validate.errors) fail(i, 'G1-skema', `${e.instancePath || '/'} ${e.message}`);
    continue;
  }

  // G2 — produk yang ditunjuk harus benar-benar ada di registri.
  if (idProduk.size && !idProduk.has(rec.product.id)) {
    fail(i, 'G2-produk-hilang', `${rec.product.id} tidak ada di registri produk.`);
  }

  // G3 — netralitas vendor (turunan L3). Watermark dan overlay promosi tidak boleh terbit.
  if (rec.review.status === 'terverifikasi') {
    if (rec.quality?.overlay_promosi) {
      fail(i, 'G3-netralitas', `${rec.sku_key}: overlay promosi tidak boleh berstatus terverifikasi.`);
    }
    if (rec.quality?.watermark) {
      fail(i, 'G3-netralitas', `${rec.sku_key}: watermark pihak ketiga tidak boleh berstatus terverifikasi.`);
    }
  }

  // G4 — hak cipta. Biner hanya boleh ada bila redistributable, atau statusnya masih kerja.
  if (rec.source.redistributable === true) {
    const sah = rec.source.permission === 'izin_tertulis'
      || rec.source.rights === 'foto_sendiri'
      || (rec.source.license && rec.source.license !== 'tidak_diketahui');
    if (!sah) {
      fail(i, 'G4-hak-cipta',
        `${rec.sku_key}: redistributable=true tanpa izin tertulis, foto sendiri, atau lisensi. `
        + `Repositori ini CC-BY-SA-4.0; menyalin foto orang tidak mengubah haknya.`);
    }
  }

  // G5 — berkas yang disebut manifes harus ada, dan hash-nya harus cocok.
  for (const f of [rec.file, ...(rec.variants ?? [])].filter(Boolean)) {
    const p = join(akar, f.path);
    if (!existsSync(p)) { fail(i, 'G5-berkas-hilang', f.path); continue; }
    const buf = readFileSync(p);
    const h = 'sha256:' + createHash('sha256').update(buf).digest('hex');
    if (h !== f.sha256) fail(i, 'G5-hash-beda', `${f.path}: manifes ${f.sha256.slice(0, 20)}…, berkas ${h.slice(0, 20)}…`);
    if (statSync(p).size !== f.bytes) fail(i, 'G5-bytes-beda', f.path);
  }

  // G6 — satu peran satu gambar per SKU. Dua "kemasan_depan" berarti salah satunya salah.
  const k = `${rec.sku_key}|${rec.role}`;
  if (skuPeran.has(k)) fail(i, 'G6-peran-ganda', `${k} sudah dipakai baris ${skuPeran.get(k) + 1}.`);
  else skuPeran.set(k, i);

  if (rec.file?.phash) {
    perPhash.set(rec.file.phash, [...(perPhash.get(rec.file.phash) ?? []), rec.sku_key]);
  }
}

// Bukan galat: foto yang sama dipakai lintas pendaftaran adalah temuan yang ingin dilihat.
const dipakaiUlang = [...perPhash.entries()]
  .map(([h, s]) => [h, [...new Set(s)]])
  .filter(([, s]) => s.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

console.log(`\nManifes : ${baris.length} baris`);
console.log(`Berkas  : ${[...skuPeran.keys()].length} pasangan sku+peran unik\n`);

if (dipakaiUlang.length) {
  console.log(`TEMUAN  foto sama dipakai lintas SKU (${dipakaiUlang.length} kelompok):`);
  for (const [h, s] of dipakaiUlang.slice(0, 10)) {
    console.log(`        ${h.slice(8, 16)}…  ${s.length} SKU  ${s.slice(0, 3).join(', ')}${s.length > 3 ? ', …' : ''}`);
  }
  console.log('');
}

for (const e of galat) console.log(`GALAT   baris ${String(e.i).padEnd(5)} ${e.rule.padEnd(18)} ${e.msg}`);
if (galat.length) { console.log(`\n${galat.length} galat.\n`); process.exit(1); }
console.log('Lolos: 0 galat.\n');
