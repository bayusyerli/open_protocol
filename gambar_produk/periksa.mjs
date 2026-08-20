// Pemeriksa manifes gambar. Menegakkan spec/schema/product-image.schema.json ditambah
// aturan yang tidak bisa dinyatakan skema.
//
//   node periksa.mjs [manifes.ndjson]
//
// Butuh indeks-merek.json — bangun dengan `python3 merek.py`. Indeks itu, bukan ndjson
// registri, yang jadi wewenang soal merek: ia sudah mengkanonikkan nama produsen lewat
// principal_alias.csv, dan tanpa itu satu perusahaan yang ditulis dua cara akan tampak
// sebagai dua merek berbeda.

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

if (!existsSync(manifes)) { console.error(`Manifes tidak ada: ${manifes}`); process.exit(1); }

const ixPath = join(akar, 'indeks-merek.json');
if (!existsSync(ixPath)) {
  console.error('indeks-merek.json tidak ada. Jalankan: python3 merek.py');
  process.exit(1);
}
const merek = JSON.parse(readFileSync(ixPath, 'utf8')).merek;
// Nomor pendaftaran ditulis berbeda-beda: registri pestisida rapat (01030120269427),
// registri pupuk bertitik (02.02.2025.310), dan kemasan kerap memberi awalan "RI." atau
// "RI. ". Bidangnya bernama number_as_read — apa adanya seperti terbaca — jadi yang
// menormalkan harus pemeriksanya, bukan pemanennya. Putaran pertama memaksa dua agen
// mengambil dua kesimpulan berbeda soal ini, dan yang satu memotong awalan yang justru
// ingin disimpan.
const rapikan = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^RI/, '');
const nomorTerdaftar = new Map();
// 667 baris registri memakai penanda "TIDAK-TERCANTUM" sebagai ganti nomor. Itu penanda
// kekosongan, bukan nomor, dan kalau ikut masuk indeks maka baris yang mencatat teks itu
// sebagai number_as_read akan lolos G9 seolah nomornya terdaftar.
const BUKAN_NOMOR = new Set(['TIDAKTERCANTUM', '']);
for (const m of Object.values(merek)) {
  for (const r of m.registrations) {
    const k = rapikan(r.number);
    if (BUKAN_NOMOR.has(k)) continue;
    nomorTerdaftar.set(k, [...(nomorTerdaftar.get(k) ?? []), r]);
  }
}

const baris = readFileSync(manifes, 'utf8').split('\n').filter((l) => l.trim());
const galat = [];
const fail = (i, rule, msg) => galat.push({ i: i + 1, rule, msg });

const merekPeran = new Map();
const perPhash = new Map();
const spanBaris = [];

for (const [i, l] of baris.entries()) {
  let rec;
  try { rec = JSON.parse(l); } catch (e) { fail(i, 'G0-json', e.message); continue; }

  if (!validate(rec)) {
    for (const e of validate.errors) fail(i, 'G1-skema', `${e.instancePath || '/'} ${e.message}`);
    continue;
  }

  const m = merek[rec.brand_key];

  // G2 — merek harus benar-benar ada, dan produsen kanoniknya harus cocok.
  if (!m) {
    fail(i, 'G2-merek-hilang', `brand_key "${rec.brand_key}" tidak ada di indeks merek.`);
  } else {
    if (rec.brand.manufacturer_canonical !== m.manufacturer_canonical) {
      fail(i, 'G2-produsen-beda',
        `manufacturer_canonical "${rec.brand.manufacturer_canonical}" != indeks "${m.manufacturer_canonical}". `
        + `brand_key dibentuk dari bentuk kanonik, jadi keduanya tidak boleh berbeda.`);
    }
    // G7 — span wajib angka sebenarnya, bukan taksiran.
    if (rec.span.registrations !== m.registrations.length) {
      fail(i, 'G7-span-beda',
        `span.registrations ${rec.span.registrations} != ${m.registrations.length} di indeks. `
        + `Angka ini yang menyatakan seberapa ambigu barisnya; salah di sini menyesatkan pembacanya.`);
    }
    // G8 — penyempitan hanya boleh menunjuk pendaftaran di bawah merek ini.
    const milik = new Set(m.registrations.map((r) => r.id));
    for (const n of rec.narrowed_to ?? []) {
      if (!milik.has(n.id)) {
        fail(i, 'G8-sempit-asing', `narrowed_to ${n.id} bukan pendaftaran di bawah ${rec.brand_key}.`);
      }
    }
    if (rec.narrowing?.basis === 'merek_tunggal' && m.registrations.length !== 1) {
      fail(i, 'G8-tunggal-palsu',
        `narrowing.basis "merek_tunggal" padahal merek ini menaungi ${m.registrations.length} pendaftaran.`);
    }
    // G9 — nomor tercetak: klaim in_registry harus benar.
    if (rec.printed_registration) {
      const cocok = nomorTerdaftar.get(rapikan(rec.printed_registration.number_as_read)) ?? [];
      const ada = cocok.length > 0;
      if (ada !== rec.printed_registration.in_registry) {
        fail(i, 'G9-tercetak-salah',
          `printed_registration.in_registry=${rec.printed_registration.in_registry} `
          + `tetapi "${rec.printed_registration.number_as_read}" ${ada ? 'ADA' : 'TIDAK ADA'} di registri.`);
      }
      // matches_brand juga diperiksa: nomor bisa sah tetapi milik pendaftaran merek lain —
      // itu justru pola yang tiga kali tertangkap pada panen pilot.
      if (rec.printed_registration.matches_brand !== undefined) {
        const milikMerek = cocok.some((r) => milik.has(r.id));
        if (milikMerek !== rec.printed_registration.matches_brand) {
          fail(i, 'G9-tercetak-merek',
            `printed_registration.matches_brand=${rec.printed_registration.matches_brand} `
            + `tetapi "${rec.printed_registration.number_as_read}" ${milikMerek ? 'MEMANG' : 'BUKAN'} `
            + `pendaftaran di bawah ${rec.brand_key}`
            + (cocok.length && !milikMerek ? ` (melainkan ${cocok[0].id}).` : '.'));
        }
      }
    }
    if (m.registrations.length > 1 && !rec.narrowed_to && rec.review.status === 'terverifikasi') {
      fail(i, 'G10-ambigu-terbit',
        `${rec.brand_key} menaungi ${m.registrations.length} pendaftaran tanpa narrowed_to, `
        + `jadi tidak boleh berstatus terverifikasi — ia belum menunjuk apa pun secara pasti.`);
    }
    spanBaris.push([rec.brand_key, m.registrations.length, !!rec.narrowed_to]);
  }

  // G3 — netralitas vendor (turunan L3).
  if (rec.review.status === 'terverifikasi') {
    if (rec.quality?.overlay_promosi) fail(i, 'G3-netralitas', `${rec.brand_key}: overlay promosi tidak boleh terverifikasi.`);
    if (rec.quality?.watermark) fail(i, 'G3-netralitas', `${rec.brand_key}: watermark pihak ketiga tidak boleh terverifikasi.`);
  }

  // G11 — gambar yang bukan foto kemasan. Berkasnya ada, resolusinya bisa bagus, tetapi
  // ia tidak menggambarkan benda yang beredar. Justru lebih berbahaya daripada tidak ada
  // gambar: penambal m2u 1024x1024 adalah berkas terbesar di situsnya, sehingga penyaring
  // berbasis resolusi akan memilihnya lebih dulu.
  if (rec.review.status === 'terverifikasi') {
    // Penambal dan logo tidak membawa isi label sama sekali; tidak ada yang bisa
    // dikoroborasi, jadi keduanya tertahan tanpa syarat.
    for (const [f, sebab] of [
      ['penambal', 'gambar penambal, bukan foto kemasan'],
      ['logo_bukan_kemasan', 'hanya logo merek, bukan foto kemasan'],
    ]) {
      if (rec.quality?.[f]) fail(i, 'G11-bukan-kemasan', `${rec.brand_key}: ${sebab}.`);
    }
    // Render lain perkaranya. Ia tidak bisa menjawab "seperti apa rupa kemasannya" —
    // siluet dua botol beda merek pernah terukur berimpit pada IoU 0,998 — tetapi isi
    // labelnya karya seni resmi principal, dan justru lebih terbaca daripada foto.
    // Yang menyelamatkannya bukan gambarnya sendiri melainkan koroborasi dari luar:
    // nomor pendaftaran tercetak yang cocok ke registri DAN milik merek ini.
    if (rec.quality?.tampak_sintetis) {
      const pr = rec.printed_registration;
      if (!(pr?.in_registry && pr?.matches_brand)) {
        fail(i, 'G11-sintetis-tanpa-koroborasi',
          `${rec.brand_key}: tampak render buatan mesin dan nomor pendaftarannya belum `
          + `terkoroborasi registri. Render boleh terverifikasi hanya bila printed_registration `
          + `in_registry dan matches_brand keduanya benar.`);
      }
    }
  }

  // G4 — hak cipta.
  if (rec.source.redistributable === true) {
    const sah = rec.source.permission === 'izin_tertulis'
      || rec.source.rights === 'foto_sendiri'
      || (rec.source.license && rec.source.license !== 'tidak_diketahui');
    if (!sah) {
      fail(i, 'G4-hak-cipta',
        `${rec.brand_key}: redistributable=true tanpa izin tertulis, foto sendiri, atau lisensi. `
        + `Repositori ini CC-BY-SA-4.0; menyalin foto orang tidak mengubah haknya.`);
    }
  }

  // G5 — berkas ada dan hash-nya cocok.
  for (const f of [rec.file, ...(rec.variants ?? [])].filter(Boolean)) {
    const p = join(akar, f.path);
    if (!existsSync(p)) { fail(i, 'G5-berkas-hilang', f.path); continue; }
    const buf = readFileSync(p);
    const h = 'sha256:' + createHash('sha256').update(buf).digest('hex');
    if (h !== f.sha256) fail(i, 'G5-hash-beda', `${f.path}: manifes ${f.sha256.slice(0, 20)}…, berkas ${h.slice(0, 20)}…`);
    if (statSync(p).size !== f.bytes) fail(i, 'G5-bytes-beda', f.path);
  }

  // G6 — satu peran satu gambar per MEREK.
  const k = `${rec.brand_key}|${rec.role}`;
  if (merekPeran.has(k)) fail(i, 'G6-peran-ganda', `${k} sudah dipakai baris ${merekPeran.get(k) + 1}.`);
  else merekPeran.set(k, i);

  if (rec.file?.phash) perPhash.set(rec.file.phash, [...(perPhash.get(rec.file.phash) ?? []), rec.brand_key]);
}

const dipakaiUlang = [...perPhash.entries()]
  .map(([h, s]) => [h, [...new Set(s)]]).filter(([, s]) => s.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

const ambigu = spanBaris.filter(([, n, sempit]) => n > 1 && !sempit);
console.log(`\nManifes : ${baris.length} baris`);
console.log(`Merek   : ${new Set(spanBaris.map((x) => x[0])).size} unik, ${merekPeran.size} pasangan merek+peran\n`);

if (ambigu.length) {
  console.log(`TEMUAN  baris tingkat merek tanpa penyempitan (${ambigu.length}):`);
  for (const [k, n] of ambigu.slice(0, 10)) console.log(`        ${k.padEnd(44)} 1 dari ${n} pendaftaran`);
  console.log('        Sah, dan memang bentuk yang dipilih — tetapi tidak boleh naik ke terverifikasi.\n');
}
if (dipakaiUlang.length) {
  console.log(`TEMUAN  foto sama dipakai lintas merek (${dipakaiUlang.length} kelompok):`);
  for (const [h, s] of dipakaiUlang.slice(0, 10)) console.log(`        ${h.slice(8, 16)}…  ${s.length} merek  ${s.slice(0, 3).join(', ')}`);
  console.log('');
}

for (const e of galat) console.log(`GALAT   baris ${String(e.i).padEnd(5)} ${e.rule.padEnd(20)} ${e.msg}`);
if (galat.length) { console.log(`\n${galat.length} galat.\n`); process.exit(1); }
console.log('Lolos: 0 galat.\n');
