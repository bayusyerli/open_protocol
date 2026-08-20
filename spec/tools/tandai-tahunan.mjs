// Menandai komoditas yang panen perdananya bertahun-tahun, memakai medan `perennial`
// yang memang sudah ada di commodity.schema.json.
//
//   node spec/tools/tandai-tahunan.mjs            # periksa saja
//   node spec/tools/tandai-tahunan.mjs --tulis    # tulis penandanya
//
// KENAPA INI PERLU
// Jalur 4 menjawab "varietas ini benar-benar ada, dan surat apa yang dipegangnya".
// Untuk benih semusim, salah pilih merugikan satu musim. Untuk bibit tanaman berkayu,
// kesalahannya BARU KETAHUAN SAAT BERBUAH — bertahun-tahun sesudah uangnya keluar,
// tanahnya terpakai, dan pemeliharaannya dibayar. Tidak ada yang bisa memeriksanya
// dengan melihat. Layar perlu mengatakan itu, dan untuk mengatakannya ia perlu tahu
// komoditas mana yang begitu.
//
// KENAPA TIDAK SEMUA TANAMAN TAHUNAN DITANDAI
// Pisang, tebu, dan nanas secara botani tahunan, tetapi panen perdananya sekitar satu
// sampai satu setengah tahun — kalimat "empat sampai tujuh tahun" tidak benar untuk
// mereka. Yang ditandai di sini hanya yang panen perdananya memang bertahun-tahun,
// karena kartu itu berbunyi tentang lamanya kesalahan tersembunyi, bukan tentang
// klasifikasi botani.
//
// Krisan, anggrek, aglaonema, dan begonia juga tahunan secara botani tetapi dibeli
// sebagai tanaman jadi atau ditanam semusim; taruhannya bukan taruhan yang sama.
// Semuanya sengaja dibiarkan tanpa putusan.
//
// KENAPA YANG SEMUSIM IKUT DITANDAI TEGAS
// Supaya "tidak ada penanda" berarti BELUM DIPUTUSKAN, bukan "sudah diperiksa dan
// bukan tahunan". Registri varietas menyentuh 482 komoditas; yang diputuskan di sini
// 60, mencakup sekitar 78% varietas. Sisanya tidak ditandai, dan layar diam untuknya
// — diam yang jujur, bukan diam yang menyamar jadi jawaban.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VOCAB = join(akar, 'spec', 'vocab');
const STAMP = '2026-08-20T00:00:00Z';
const tulis = process.argv.includes('--tulis');

// Panen perdana bertahun-tahun. Nama di sini nama kanonik entitasnya; kalau tidak
// cocok lagi sesudah kosakata berubah, skrip berhenti.
const TAHUNAN = {
  'op:cmd:00001171': 'Durian',
  'op:cmd:00001417': 'Alpukat',
  'op:cmd:00001009': 'Budidaya kopi',
  'op:cmd:00001000': 'Budidaya kelapa sawit',
  'op:cmd:00001019': 'Mangga',
  'op:cmd:00001043': 'Kelapa',
  'op:cmd:00001010': 'Kakao',
  'op:cmd:00002355': 'Salak',
  'op:cmd:00001014': 'Teh',
  'op:cmd:00001015': 'Jeruk',
  'op:cmd:00002157': 'Jeruk Keprok',
  'op:cmd:00002102': 'Duku',
  'op:cmd:00001288': 'Manggis',
  'op:cmd:00001373': 'Rambutan',
  'op:cmd:00002361': 'Sawo',
  'op:cmd:00002354': 'Sagu',
};

// Semusim atau sekali tanam sekali panen — ditandai supaya kesenyapan bermakna.
const SEMUSIM = {
  'op:cmd:00000006': 'Padi',
  'op:cmd:00001002': 'Jagung',
  'op:cmd:00001021': 'Semangka',
  'op:cmd:00000003': 'Tomat',
  'op:cmd:00001045': 'Mentimun',
  'op:cmd:00001018': 'Tembakau',
  'op:cmd:00001031': 'Melon',
  'op:cmd:00001026': 'Kacang panjang',
  'op:cmd:00001087': 'Budidaya jagung manis',
  'op:cmd:00001007': 'Kedelai',
  'op:cmd:00002072': 'Cabai Keriting',
  'op:cmd:00000002': 'Cabai rawit',
  'op:cmd:00002069': 'Cabai Besar',
  'op:cmd:00002394': 'Terong',
  'op:cmd:00001503': 'Ubi jalar',
  'op:cmd:00002309': 'Paria',
  'op:cmd:00001008': 'Kentang',
  'op:cmd:00001020': 'Budidaya ubi kayu',
  'op:cmd:00001003': 'Cabai',
  'op:cmd:00001011': 'Kubis',
  'op:cmd:00000004': 'Bawang merah',
  'op:cmd:00001034': 'Kacang tanah',
  'op:cmd:00002376': 'Sorgum',
  'op:cmd:00001344': 'Kacang Buncis',
  'op:cmd:00002181': 'Kangkung',
  'op:cmd:00002036': 'Bayam',
  'op:cmd:00001032': 'Kacang hijau',
  'op:cmd:00001221': 'Kubis Bunga',
  'op:cmd:00002315': 'Petsai',
  'op:cmd:00002110': 'Gambas',
  'op:cmd:00002410': 'Uwi',
  'op:cmd:00001131': 'Kapas',
  'op:cmd:00002359': 'Sawi Hijau',
  'op:cmd:00002385': 'Talas',
  'op:cmd:00002374': 'Slada',
  'op:cmd:00001033': 'Cabai merah',
};

const BERKAS = ['commodity.json', 'commodity-registri.json', 'commodity-varietas.json'];
const larik = (o) => (Array.isArray(o) ? o : o[Object.keys(o).find((k) => Array.isArray(o[k]))]);

const bungkus = new Map(BERKAS.map((n) => [n, JSON.parse(readFileSync(join(VOCAB, n), 'utf8'))]));
const olehId = new Map();
for (const [n, b] of bungkus) for (const e of larik(b)) olehId.set(e.id, { e, berkas: n });

const salah = [];
for (const [id, nama] of [...Object.entries(TAHUNAN), ...Object.entries(SEMUSIM)]) {
  const t = olehId.get(id);
  if (!t) { salah.push(`${id} (${nama}) tidak ada di kosakata`); continue; }
  if (t.e.label.id !== nama) salah.push(`${id} kini bernama ${JSON.stringify(t.e.label.id)}, tabel mencatat ${JSON.stringify(nama)}`);
  if (t.e.lifecycle?.status === 'superseded') salah.push(`${id} (${nama}) sudah digantikan ${t.e.lifecycle.superseded_by?.id}`);
}
if (salah.length) {
  console.error('BERHENTI — tabel tidak lagi cocok dengan kosakata:');
  for (const s of salah) console.error(`  ${s}`);
  process.exit(1);
}

// Berapa varietas yang tercakup putusan ini
const V = readFileSync(join(VOCAB, 'variety', 'varietas.ndjson'), 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
const hitung = { tahunan: 0, semusim: 0, tanpaPutusan: 0 };
for (const v of V) {
  const id = v.commodity?.id;
  hitung[TAHUNAN[id] ? 'tahunan' : SEMUSIM[id] ? 'semusim' : 'tanpaPutusan']++;
}

console.log(`Komoditas ditandai   : ${Object.keys(TAHUNAN).length} tahunan, ${Object.keys(SEMUSIM).length} semusim`);
console.log(`Varietas tercakup    : ${hitung.tahunan} tahunan, ${hitung.semusim} semusim, ${hitung.tanpaPutusan} belum diputuskan`);
console.log(`                       ${(((hitung.tahunan + hitung.semusim) / V.length) * 100).toFixed(1)}% dari ${V.length} varietas`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menandai.');
  process.exit(0);
}

let ubah = 0;
const ubahBerkas = new Set();
for (const [id, nilai] of [
  ...Object.keys(TAHUNAN).map((i) => [i, true]),
  ...Object.keys(SEMUSIM).map((i) => [i, false]),
]) {
  const { e, berkas } = olehId.get(id);
  if (e.perennial === nilai) continue;
  e.perennial = nilai;
  e.lifecycle = { ...(e.lifecycle ?? {}), updated_at: STAMP };
  ubah++;
  ubahBerkas.add(berkas);
}
for (const n of ubahBerkas) writeFileSync(join(VOCAB, n), JSON.stringify(bungkus.get(n), null, 2) + '\n');

console.log(`\nDitulis: ${ubah} entitas pada ${ubahBerkas.size} berkas — ${[...ubahBerkas].join(', ')}`);
