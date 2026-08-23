// Memanen identitas bahan aktif dari Wikidata untuk kunci padanan yang belum bernama
// kanonik, lalu menulisnya ke wikidata_data/bahan-aktif-wikidata.json.
//
//   node tools/tarik-wikidata-bahan-aktif.mjs
//
// ---------------------------------------------------------------------------
// Kenapa Wikidata, dan kenapa hanya Wikidata
// ---------------------------------------------------------------------------
// 476 dari 1.593 kunci pada padanan-bahan-aktif.json tidak pernah dituliskan nama
// internasionalnya oleh registri, sehingga tidak bisa di-join ke daftar larangan, ke MRL,
// maupun ke sumber internasional mana pun. Sumber luar yang bisa menutupnya harus boleh
// DIREKAM ULANG, bukan sekadar boleh dibaca: isi repositori ini dipakai ulang orang lain.
// Wikidata berlisensi CC0 dan memenuhi syarat itu. Basis pestisida berlisensi pembatas
// tidak, dan tidak dipakai — termasuk lewat pintu belakang: yang diambil dari Wikidata
// hanya PERNYATAAN Wikidata sendiri (label, alias, peran, pengenal), bukan isi basis lain
// yang kebetulan ditautkannya.
//
// ---------------------------------------------------------------------------
// Sopan santun
// ---------------------------------------------------------------------------
// Seluruh permintaan lewat satu endpoint SPARQL, memakai klausa VALUES yang di-batch —
// bukan satu permintaan per nama. Sekitar tiga puluh permintaan menutup 476 kunci.
// User-Agent deskriptif dipasang karena kebijakan Wikimedia mensyaratkannya, dan ada jeda
// antar-permintaan. Hasil mentahnya disimpan ke berkas supaya penyaringnya bisa diperbaiki
// berkali-kali tanpa menyentuh endpoint lagi.
//
// ---------------------------------------------------------------------------
// Empat jaring, dan kenapa dua
// ---------------------------------------------------------------------------
//   korpus  entitas yang MENURUT WIKIDATA agrokimia — lewat P366 (has use), P2868
//           (subject has role), P279/P31 ke kelas peran, atau punya P11949
//           (PesticideInfo chemical ID). Ini yang jadi sumber padanan.
//   jaring  pencarian label/alias EKSAK untuk ejaan internasional yang mungkin, TANPA
//           saringan peran. Ia sengaja menangkap yang bukan agrokimia juga — itulah yang
//           memberi gigi pada penyaring peran: tanpa jaring ini "matrin" akan terlihat
//           tidak punya padanan, padahal yang sebenarnya terjadi adalah ia bertemu
//           "Matrix metallopeptidase 7" dan DITOLAK.
//
// Berkas keluarannya memuat kedua-duanya, beserta peran tiap entitas, sehingga penyaringan
// dan penolakannya bisa ditelusuri ulang tanpa jaringan.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { kunciUrut, indukAlkil } from './lipat-ejaan.mjs';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PADANAN = join(AKAR, 'spec', 'vocab', 'padanan-bahan-aktif.json');
const KELUAR_DIR = join(AKAR, 'wikidata_data');
const KELUAR = join(KELUAR_DIR, 'bahan-aktif-wikidata.json');
const ENDPOINT = 'https://query.wikidata.org/sparql';
const UA = 'OpenProtocolsID-BahanAktifCrosswalk/0.1 (https://openprotocols.id; kontak lewat repositori) node-fetch';
const JEDA = 2000;

// Akar peran agrokimia. Ditulis dengan labelnya supaya bisa diperiksa mata, dan supaya
// pergeseran label di Wikidata terlihat sebagai selisih, bukan sebagai diam.
const AKAR_PERAN = {
  Q131656: 'pesticide', Q2746959: 'agrochemical', Q864939: 'biocide', Q408245: 'plant growth regulator',
  Q123682686: 'insect repellent', Q1340459: 'repellent', Q2690011: 'attractant', Q167377: 'pheromone',
  Q192949: 'plant hormone', Q190022: 'auxin', Q422032: 'cytokinin', Q53744: 'defoliant',
  Q13221746: 'desiccant', Q112671289: 'fumigant', Q6037222: 'Insect growth regulator', Q416014: 'acaricide',
  Q910391: 'nematicide', Q901537: 'molluscicide', Q904414: 'algaecide', Q791192: 'avicide',
  Q898877: 'piscicide', Q11801296: 'ovicide', Q522817: 'larvicide', Q924146: 'rodenticide',
  Q178266: 'herbicide', Q181322: 'insecticide', Q193237: 'fungicide', Q804539: 'bactericide',
  Q3560867: 'virucide', Q987575: 'biopesticide',
};
const BAHASA = '"en","id","mul","ms"';
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

async function sparql(q, coba = 0) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Accept: 'application/sparql-results+json', 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
    body: new URLSearchParams({ query: q }),
  });
  const teks = await res.text();
  if (!res.ok || !teks.startsWith('{')) {
    if (coba < 2) { await tidur(5000 * (coba + 1)); return sparql(q, coba + 1); }
    throw new Error(`SPARQL gagal (${res.status}): ${teks.slice(0, 120)}`);
  }
  await tidur(JEDA);
  return JSON.parse(teks).results.bindings;
}

const qid = (b) => b.value.split('/').pop();

// Permintaan ber-VALUES yang terlalu lebar ditolak endpoint dengan timeout. Yang gagal
// dibelah dua dan diulang, bukan dilepas — melepasnya akan terlihat sebagai "tidak ada
// padanan", persis kegagalan diam yang dihindari berkas ini.
async function berbatch(nilai, buat, ukuran) {
  const out = [];
  const antre = [];
  for (let i = 0; i < nilai.length; i += ukuran) antre.push(nilai.slice(i, i + ukuran));
  while (antre.length) {
    const potong = antre.shift();
    try {
      out.push(...await sparql(buat(potong)));
      process.stderr.write(`.`);
    } catch (e) {
      if (potong.length <= 8) throw e;
      const t = Math.ceil(potong.length / 2);
      antre.unshift(potong.slice(0, t), potong.slice(t));
      process.stderr.write('/');
    }
  }
  process.stderr.write('\n');
  return out;
}

// Ejaan internasional yang MUNGKIN untuk satu tulisan Indonesia. Ini jaring, bukan
// penyaring: hasilnya cuma dipakai untuk menanyai Wikidata, dan tiap calon yang kembali
// tetap harus lolos pelipatan yang sama persis.
const BALIK = (t, i) => {
  if (t.startsWith('ks', i)) return [['ks', 'x'], 2];
  if (t.startsWith('kw', i)) return [['kw', 'qu'], 2];
  const c = t[i];
  if (c === 'f') return [['f', 'ph'], 1];
  if (c === 'k') return [i + 1 >= t.length || !'eiy'.includes(t[i + 1]) ? ['k', 'c', 'ch'] : ['k', 'ch'], 1];
  if (c === 's') return [i + 1 < t.length && 'eiy'.includes(t[i + 1]) ? ['s', 'c', 'z'] : ['s', 'z'], 1];
  if (c === 'z') return [['z', 's'], 1];
  if (c === 't') return [['t', 'th'], 1];
  if (c === 'i') return [['i', 'y'], 1];
  if (c === 'v') return [['v', 'w'], 1];
  if (c === 'u') return [['u', 'ou'], 1];
  return [[c], 1];
};
const MAKS = 400;
function varian(kata) {
  const t = String(kata).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[\s\-_.']/g, '');
  if (!t || t.length > 30 || !/^[a-z0-9,]+$/.test(t)) return [];
  let hasil = [''];
  for (let i = 0; i < t.length;) {
    const [alts, maju] = BALIK(t, i);
    const baru = [];
    for (const h of hasil) for (const a of alts) baru.push(h + a);
    hasil = baru.length > MAKS ? baru.slice(0, MAKS) : baru;
    i += maju;
  }
  const out = new Set();
  for (const h of hasil) {
    out.add(h); out.add(`${h}e`);
    if (h.endsWith('id')) out.add(`${h}a`);
    if (h.endsWith('ida')) out.add(`${h.slice(0, -1)}e`);
  }
  return [...out].filter((v) => v.length >= 4 && v.length <= 40);
}

// ===========================================================================
const pad = JSON.parse(readFileSync(PADANAN, 'utf8'));
// Kunci yang dicari: yang belum terpetakan, DAN yang sudah ditutup panen ini sebelumnya.
// Definisi itu tetap sama sebelum dan sesudah alat pengisi dijalankan, sehingga panennya
// tidak menyusut sendiri setelah pemakaian pertama.
const sasaran = pad.padanan_items.filter(
  (r) => r.hubungan === 'belum-terpetakan' || r.kanonik?.dasar === 'wikidata',
);
console.log(`Kunci sasaran     : ${sasaran.length}`);

const V = (qs) => qs.map((q) => `wd:${q}`).join(' ');

console.log('1. Menutup pohon kelas peran…');
const tutup = await sparql(`SELECT DISTINCT ?peran ?akar WHERE {
  VALUES ?akar { ${V(Object.keys(AKAR_PERAN))} }
  ?peran wdt:P279* ?akar .
} LIMIT 20000`);
const peranAkar = new Map();
for (const b of tutup) {
  const p = qid(b.peran); const a = AKAR_PERAN[qid(b.akar)];
  if (!peranAkar.has(p)) peranAkar.set(p, new Set());
  peranAkar.get(p).add(a);
}
console.log(`   kelas peran    : ${peranAkar.size}`);

console.log('2. Memanen korpus agrokimia…');
const korpus = new Set();
for (const p of ['P366', 'P2868', 'P279', 'P31']) {
  const r = await berbatch([...peranAkar.keys()], (qs) => `SELECT ?item WHERE {
  VALUES ?peran { ${V(qs)} }
  ?item wdt:${p} ?peran .
} LIMIT 200000`, 1200);
  for (const b of r) korpus.add(qid(b.item));
  console.log(`   ${p} → korpus ${korpus.size}`);
}
for (const b of await sparql('SELECT ?item WHERE { ?item wdt:P11949 [] } LIMIT 50000')) korpus.add(qid(b.item));
console.log(`   P11949 → korpus ${korpus.size}`);

console.log('3. Menarik label & alias korpus…');
const namaBaris = await berbatch([...korpus], (qs) => `SELECT ?item ?jenis ?nilai WHERE {
  VALUES ?item { ${V(qs)} }
  { ?item rdfs:label ?nilai . FILTER(LANG(?nilai) IN (${BAHASA})) BIND("label" AS ?jenis) }
  UNION { ?item skos:altLabel ?nilai . FILTER(LANG(?nilai) IN (${BAHASA})) BIND("alias" AS ?jenis) }
}`, 350);

const namaItem = new Map();
const foldKorpus = new Set();
const idxFold = new Map();
const catat = (q, jenis, lang, teks) => {
  if (!namaItem.has(q)) namaItem.set(q, []);
  namaItem.get(q).push({ jenis, lang, teks });
  if (teks.length < 4) return;
  const [f] = kunciUrut(teks);
  if (!f) return;
  if (!idxFold.has(f)) idxFold.set(f, new Set());
  idxFold.get(f).add(q);
};
for (const b of namaBaris) catat(qid(b.item), b.jenis.value, b.nilai['xml:lang'] ?? '', b.nilai.value);
for (const f of idxFold.keys()) foldKorpus.add(f);
console.log(`   entitas bernama: ${namaItem.size}, bentuk lipat: ${idxFold.size}`);

console.log('4. Jaring lebar untuk kunci yang belum bertemu korpus…');
const belum = sasaran.filter((r) => !idxFold.has(kunciUrut(r.kunci)[0]));
const literal = new Set();
for (const r of belum) {
  for (const t of r.kunci.split(/[\s-]+/)) if (t.length >= 4) for (const v of varian(t)) literal.add(v);
  literal.add(r.kunci);
}
console.log(`   kunci ${belum.length}, literal ${literal.size}`);
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const jalaBaris = await berbatch([...literal].sort(), (vs) => `SELECT ?item ?nilai WHERE {
  VALUES ?nilai { ${vs.flatMap((v) => ['en', 'mul', 'id'].map((l) => `"${esc(v)}"@${l}`)).join(' ')} }
  { ?item rdfs:label ?nilai } UNION { ?item skos:altLabel ?nilai }
}`, 600);
const jalaItem = new Set();
for (const b of jalaBaris) {
  const q = qid(b.item);
  jalaItem.add(q);
  catat(q, 'label', b.nilai['xml:lang'] ?? '', b.nilai.value);
}
console.log(`   entitas terjaring: ${jalaItem.size} (di luar korpus: ${[...jalaItem].filter((q) => !korpus.has(q)).length})`);

console.log('5. Memilih kandidat…');
const kandidat = new Set();
for (const r of sasaran) for (const q of idxFold.get(kunciUrut(r.kunci)[0]) ?? []) kandidat.add(q);
console.log(`   kandidat: ${kandidat.size}`);

console.log('6. Menarik peran & pengenal kandidat…');
const detBaris = await berbatch([...kandidat], (qs) => `SELECT ?item ?jenis ?nilai ?nilaiLabel WHERE {
  VALUES ?item { ${V(qs)} }
  { ?item wdt:P31 ?nilai . BIND("P31" AS ?jenis) }
  UNION { ?item wdt:P279 ?nilai . BIND("P279" AS ?jenis) }
  UNION { ?item wdt:P366 ?nilai . BIND("P366" AS ?jenis) }
  UNION { ?item wdt:P2868 ?nilai . BIND("P2868" AS ?jenis) }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}`, 250);
const idBaris = await berbatch([...kandidat], (qs) => `SELECT ?item ?jenis ?nilai WHERE {
  VALUES ?item { ${V(qs)} }
  { ?item wdt:P231 ?nilai . BIND("cas" AS ?jenis) }
  UNION { ?item wdt:P235 ?nilai . BIND("inchikey" AS ?jenis) }
  UNION { ?item wdt:P11949 ?nilai . BIND("pinfo" AS ?jenis) }
  UNION { ?item rdfs:label ?nilai . FILTER(LANG(?nilai) IN (${BAHASA})) BIND("label" AS ?jenis) }
  UNION { ?item skos:altLabel ?nilai . FILTER(LANG(?nilai) IN (${BAHASA})) BIND("alias" AS ?jenis) }
}`, 250);

const peranItem = new Map();
for (const b of detBaris) {
  const q = qid(b.item); const v = qid(b.nilai);
  if (!peranItem.has(q)) peranItem.set(q, new Map());
  const k = `${b.jenis.value}|${v}`;
  peranItem.get(q).set(k, { properti: b.jenis.value, qid: v, label: b.nilaiLabel?.value ?? v, akar: [...(peranAkar.get(v) ?? [])].sort() });
}
const idItem = new Map();
for (const b of idBaris) {
  const q = qid(b.item); const j = b.jenis.value;
  if (!idItem.has(q)) idItem.set(q, { cas: new Set(), inchikey: new Set(), pinfo: new Set() });
  if (j === 'label' || j === 'alias') catat(q, j, b.nilai['xml:lang'] ?? '', b.nilai.value);
  else idItem.get(q)[j].add(b.nilai.value);
}

// Induk alkil yang benar-benar ada sebagai entitas agrokimia. Dipakai alat pengisi untuk
// membedakan "kresoxim-methyl" (nama bahannya sendiri) dari "mcpa-isooctyl" (ester MCPA).
const foldIndukAgro = new Set();
for (const q of kandidat) {
  for (const n of namaItem.get(q) ?? []) {
    const ind = indukAlkil(n.teks);
    if (!ind) continue;
    const [f] = kunciUrut(ind);
    if (f && foldKorpus.has(f)) foldIndukAgro.add(f);
  }
}

const uniq = (a) => [...new Set(a)];
const entitas = [...kandidat].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))).map((q) => {
  const nm = uniq((namaItem.get(q) ?? []).map((n) => `${n.jenis}|${n.lang}|${n.teks}`)).sort()
    .map((s) => { const [jenis, lang, ...t] = s.split('|'); return { jenis, lang, teks: t.join('|') }; })
    .filter((n) => n.teks.length <= 120);
  const id = idItem.get(q) ?? { cas: new Set(), inchikey: new Set(), pinfo: new Set() };
  return {
    qid: q,
    nama: nm,
    peran: [...(peranItem.get(q) ?? new Map()).values()].sort((a, b) => `${a.properti}${a.qid}`.localeCompare(`${b.properti}${b.qid}`)),
    cas: [...id.cas].sort(), inchikey: [...id.inchikey].sort(), pinfo: [...id.pinfo].sort(),
    di_korpus_agrokimia: korpus.has(q),
  };
});

mkdirSync(KELUAR_DIR, { recursive: true });
const doc = {
  wikidata: {
    label: { id: 'Panen Wikidata untuk bahan aktif pestisida yang tak bernama internasional di registri' },
    scope: {
      id: 'Bukti mentah untuk tools/isi-kanonik-wikidata.mjs, dipanen sekali lalu dipakai berkali-kali secara luring. '
        + `Berisi ${entitas.length} entitas Wikidata yang bentuk lipat salah satu nama-nya bertemu bentuk lipat salah satu kunci sasaran pada padanan-bahan-aktif.json, `
        + 'beserta SELURUH pernyataan peran entitas itu (P31, P279, P366, P2868) dan pengenalnya (P231 CAS, P235 InChIKey, P11949 PesticideInfo). '
        + 'Entitas yang BUKAN agrokimia sengaja ikut disimpan dan ditandai `di_korpus_agrokimia: false` — merekalah yang memperlihatkan bahwa penyaring peran benar-benar menolak sesuatu, '
        + 'alih-alih membiarkan kunci terlihat seperti tidak punya padanan. Berkas ini tidak memuat satu pun baris dari basis data pestisida berlisensi pembatas: '
        + 'kehadiran P11949 dipakai sebagai PERNYATAAN WIKIDATA bahwa entitasnya bahan pestisida, bukan sebagai jalan masuk isi basis itu.',
    },
    lifecycle: { version: '0.1.0', status: 'draft', created_at: new Date().toISOString().slice(0, 10) },
    provenance: {
      license: 'CC0-1.0',
      sources: [{
        title: 'Wikidata', publisher: 'Wikimedia Foundation', url: ENDPOINT, year: new Date().getFullYear(),
        locator: `Wikidata Query Service, ditarik ${new Date().toISOString().slice(0, 10)}. Properti yang dipakai: P366 (has use), P2868 (subject has role), P279 (subclass of), P31 (instance of), P11949 (PesticideInfo chemical ID), P231 (CAS), P235 (InChIKey), rdfs:label, skos:altLabel. Seluruh isi Wikidata berlisensi CC0, sehingga boleh direkam ulang di sini.`,
      }],
    },
    panen: {
      endpoint: ENDPOINT,
      user_agent: UA,
      kunci_sasaran: sasaran.length,
      kelas_peran: peranAkar.size,
      korpus_agrokimia: korpus.size,
      terjaring_tanpa_saringan_peran: jalaItem.size,
      kandidat: entitas.length,
    },
    akar_peran: AKAR_PERAN,
    fold_induk_agrokimia: [...foldIndukAgro].sort(),
  },
  entitas,
};
writeFileSync(KELUAR, `${JSON.stringify(doc, null, 1)}\n`);
console.log(`\nDitulis ke ${KELUAR} — ${entitas.length} entitas.`);
