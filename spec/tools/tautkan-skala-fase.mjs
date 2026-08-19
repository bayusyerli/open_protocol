// Menautkan skala fase ke komoditas yang memang dicakupnya, dua arah:
//   StageScale.applies_to.commodities  <->  Commodity.default_stage_scale
// Varietas mewarisi skalanya lewat komoditas — tidak ada tautan langsung dari
// Variety ke StageScale, karena fenologi adalah sifat tanamannya, bukan sifat
// varietasnya. Siklus yang perlu menyimpang tetap bisa menimpa lewat Cycle.stage_scale.
//
// Daftar cakupan di bawah ini DIKURASI TANGAN. Kunci BBCH sayuran buah Solanaceae
// (Feller dkk. 1995) berlaku untuk cabai, tomat, dan terung — bukan untuk seluruh
// Solanaceae. Kentang dan tembakau punya kunci BBCH sendiri; keduanya sengaja tidak
// ditautkan ke sini sampai kuncinya masuk repositori.
//
// Jalankan dari akar repositori:  node spec/tools/tautkan-skala-fase.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VOCAB = join(root, 'spec', 'vocab');
const BERKAS_CMD = ['commodity.json', 'commodity-registri.json', 'commodity-varietas.json'];

// --- Cakupan terkurasi -------------------------------------------------------
const CAKUPAN = {
  // BBCH — sayuran buah Solanaceae: Capsicum spp., Solanum lycopersicum, S. melongena
  'stage-scale-bbch-solanaceae.json': [
    'op:cmd:00000001', // Cabai merah besar
    'op:cmd:00000002', // Cabai rawit
    'op:cmd:00000003', // Tomat
    'op:cmd:00001003', // Cabai
    'op:cmd:00001033', // Cabai merah
    'op:cmd:00001108', // Terung
    'op:cmd:00002069', // Cabai Besar
    'op:cmd:00002070', // Cabai Habanero — Capsicum chinense
    'op:cmd:00002071', // Cabai Hias — Capsicum annuum, dipelihara sebagai hias
    'op:cmd:00002072', // Cabai Keriting
    'op:cmd:00002073', // Cabai Paprika
    'op:cmd:00002074', // Cabai Rawit Hias
    'op:cmd:00002076', // Cabe Keriting
    'op:cmd:00002077', // Cabe Merah
    'op:cmd:00002078', // Cabe Rawit
    'op:cmd:00002307', // Paprika
    'op:cmd:00002394', // Terong
    'op:cmd:00002397', // Terong Bulat
    'op:cmd:00002398', // Terong Panjang
    'op:cmd:00002401', // Terong Telunjuk
    'op:cmd:00002402', // Tomat Ceri
    'op:cmd:00002403', // Tomat Rampai
  ],
  // BBCH — padi (Oryza sativa)
  'stage-scale-bbch-padi.json': [
    'op:cmd:00000006', // Padi
    'op:cmd:00002299', // Padi Beliah
    'op:cmd:00002300', // Padi Hitam
    'op:cmd:00002301', // Padi Ketan
    'op:cmd:00002302', // Padi Ladang
  ],
  // BBCH — jagung (Zea mays), termasuk jagung manis dan jagung pulut
  'stage-scale-bbch-jagung.json': [
    'op:cmd:00001002', // Jagung
    'op:cmd:00001087', // Budidaya jagung manis — nama masih bawaan label pestisida, tetapi 219 varietas menunjuk ke sini
    'op:cmd:00002134', // Jagung Ketan
    'op:cmd:00002135', // Jagung Pulut
    'op:cmd:00002136', // Jagung Pulut Manis
  ],
  // Umur budidaya udang vaname (DOC)
  'stage-scale-doc-udang.json': [
    'op:cmd:00000005', // Udang vaname
  ],
};

// Sengaja TIDAK ditautkan, beserta alasannya. Ditulis di sini supaya keputusannya
// bisa dibantah orang berikutnya, bukan hilang jadi daftar yang tampak lengkap.
const DIKECUALIKAN = {
  'op:cmd:00002347': 'Rumput Padi-Padian — kelompok gulma Poaceae, bukan Oryza sativa; namanya menipu',
  'op:cmd:00001023': 'Beras di penyimpanan — produk pascapanen, bukan tanaman yang tumbuh; skala fenologi tidak berlaku',
  'op:cmd:00002075': 'Cabe Jawa — Piper retrofractum, famili Piperaceae, bukan Solanaceae',
  'op:cmd:00002395': 'Terong Belanda — Solanum betaceum, pohon tahunan; kunci sayuran buah semusim tidak cocok',
  'op:cmd:00002396': 'Terong Berastagi — nama lain terong belanda, alasan sama',
  'op:cmd:00002399': 'Terong Pirus — nama lain terong belanda, alasan sama',
  'op:cmd:00002400': 'Terong Susu — Solanum mammosum, tanaman hias beracun, bukan sayuran buah',
  'op:cmd:00002375': 'Solanum — nama genus, terlalu kabur untuk dinyatakan tercakup',
  'op:cmd:00002056': 'Buah Terung Terung — artefak nama dari registri, perlu dibereskan lebih dulu',
};

// --- Muat kosakata -----------------------------------------------------------
const berkas = new Map();
const entitas = new Map();
for (const f of BERKAS_CMD) {
  const d = JSON.parse(readFileSync(join(VOCAB, f), 'utf8'));
  berkas.set(f, d);
  for (const it of d.items) entitas.set(it.id, { it, file: f });
}

const skala = new Map();
for (const f of Object.keys(CAKUPAN)) skala.set(f, JSON.parse(readFileSync(join(VOCAB, f), 'utf8')));

// --- Tautkan dua arah --------------------------------------------------------
const dipakai = new Map(); // cmd id -> skala
for (const [f, ids] of Object.entries(CAKUPAN)) {
  const sc = skala.get(f);
  const refs = [];
  for (const id of ids) {
    const e = entitas.get(id);
    if (!e) throw new Error(`Komoditas ${id} disebut ${f} tetapi tidak ada di kosakata.`);
    if (dipakai.has(id)) throw new Error(`Komoditas ${id} diklaim dua skala: ${dipakai.get(id)} dan ${sc.id}.`);
    dipakai.set(id, sc.id);
    refs.push({ id, label: e.it.label.id });
    e.it.default_stage_scale = { id: sc.id, label: sc.label.id };
  }
  sc.applies_to = { ...(sc.applies_to ?? {}), commodities: refs };
  writeFileSync(join(VOCAB, f), JSON.stringify(sc, null, 2) + '\n');
}

// Komoditas yang tautannya dicabut — supaya alat ini benar-benar idempoten dan
// mencabut sisa jalan sebelumnya bila daftar cakupan dipersempit.
let dicabut = 0;
for (const [id, { it }] of entitas) {
  if (!dipakai.has(id) && it.default_stage_scale) { delete it.default_stage_scale; dicabut++; }
}
for (const [f, d] of berkas) writeFileSync(join(VOCAB, f), JSON.stringify(d, null, 2) + '\n');

// --- Laporan cakupan ---------------------------------------------------------
const varietas = readFileSync(join(VOCAB, 'variety', 'varietas.ndjson'), 'utf8')
  .trim().split('\n').map((l) => JSON.parse(l));
const perCmd = new Map();
for (const v of varietas) perCmd.set(v.commodity.id, (perCmd.get(v.commodity.id) ?? 0) + 1);

let tercakup = 0;
for (const id of dipakai.keys()) tercakup += perCmd.get(id) ?? 0;

const tanpaSkala = [...perCmd.entries()]
  .filter(([id]) => !dipakai.has(id))
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

console.log(`Skala ditautkan          : ${skala.size}`);
for (const [f, ids] of Object.entries(CAKUPAN)) console.log(`  ${f} -> ${ids.length} komoditas`);
console.log(`Tautan dicabut           : ${dicabut}`);
console.log(`Dikecualikan sengaja     : ${Object.keys(DIKECUALIKAN).length}`);
console.log(`\nVarietas yang mewarisi skala: ${tercakup} dari ${varietas.length} (${(tercakup / varietas.length * 100).toFixed(1)}%)`);
console.log(`\nKomoditas terbesar yang belum punya skala:`);
for (const [id, n] of tanpaSkala) console.log(`  ${String(n).padStart(5)}  ${entitas.get(id)?.it.label.id ?? id}`);
