// Dua kunci terakhir dari BBCH Monograph yang punya padanan komoditas di registri:
//   bit           op:sca:00000016  fase 1500-1599  Meier dkk., 1993
//   kacang polong op:sca:00000017  fase 1600-1699  Weber & Bleiholder, 1990; Feller dkk., 1995 b
//
// Sumber: BBCH Monograph edisi ke-2 (2001), disunting Uwe Meier, BBA.
// Jalankan dari akar repositori:  node spec/tools/bangun-skala-bbch-bit-kapri.mjs

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const VOCAB = join(dirname(fileURLToPath(import.meta.url)), '..', 'vocab');
const STAMP = '2026-08-19T00:00:00Z';
const ANTARA = 'Kode antara. Mengikuti pola deret ke-n pada sistem BBCH; tidak ditabelkan terpisah di sumber.';
const sumber = (locator) => [{
  title: 'Growth stages of mono- and dicotyledonous plants — BBCH Monograph',
  publisher: 'Federal Biological Research Centre for Agriculture and Forestry (BBA)',
  year: 2001, locator: `Edisi ke-2, disunting Uwe Meier; ${locator}`,
}];
const seri = (dari, sampai, id, en) => Array.from({ length: sampai - dari + 1 }, (_, i) => {
  const n = dari + i; return [String(n), id(n % 10), en(n % 10), 'antara'];
});
const persen = (dari, sampai, id, en) => Array.from({ length: sampai - dari + 1 }, (_, i) => {
  const n = dari + i, p = (n % 10) * 10; return [String(n), id(p), en(p), 'antara'];
});

const BIT = [
  [0, [
    ['00', 'Benih kering', 'Dry seed'],
    ['01', 'Awal imbibisi: benih mulai menyerap air', 'Beginning of imbibition: seeds begins to take up water'],
    ['03', 'Imbibisi benih selesai (pelet retak)', 'Seed imbibition complete (pellet cracked)'],
    ['05', 'Radikula muncul dari benih (pelet)', 'Radicle emerged from seed (pellet)'],
    ['07', 'Tunas muncul dari benih (pelet)', 'Shoot emerged from seed (pellet)'],
    ['09', 'Kemunculan: tunas menembus permukaan tanah', 'Emergence: shoot emerges through soil surface'],
  ]],
  [1, [
    ['10', 'Daun pertama tampak sebesar kepala jarum; kotiledon membuka mendatar', 'First leaf visible (pinhead-size): cotyledons horizontally unfolded'],
    ['11', 'Sepasang daun pertama tampak, belum membuka, sebesar biji kacang polong', 'First pair of leaves visible, not yet unfolded (pea-size)'],
    ['12', '2 daun — sepasang daun pertama — membuka', '2 leaves (first pair of leaves) unfolded'],
    ['14', '4 daun — pasangan daun ke-2 — membuka', '4 leaves (2nd pair of leaves) unfolded'],
    ['15', '5 daun membuka', '5 leaves unfolded'],
    ...seri(16, 18, (n) => `${n} daun membuka`, (n) => `${n} leaves unfolded`),
    ['19', '9 daun atau lebih membuka', '9 and more leaves unfolded'],
  ]],
  [3, [
    ['31', 'Awal penutupan tajuk: daun menutup 10% permukaan tanah', 'Beginning of crop cover: leaves cover 10% of ground'],
    ...persen(32, 38, (p) => `Daun menutup ${p}% permukaan tanah`, (p) => `Leaves cover ${p}% of ground`),
    ['39', 'Penutupan tajuk selesai: daun menutup 90% permukaan tanah', 'Crop cover complete: leaves cover 90% of ground'],
  ]],
  [4, [
    ['49', 'Umbi bit mencapai ukuran siap panen', 'Beet root has reached harvestable size'],
  ]],
  [5, [
    ['51', 'Awal pemanjangan batang utama', 'Beginning of elongation of main stem'],
    ['52', 'Batang utama sepanjang 20 cm', 'Main stem 20 cm long'],
    ['53', 'Kuncup tunas samping tampak pada batang utama', 'Side shoot buds visible on main stem'],
    ['54', 'Tunas samping jelas tampak pada batang utama', 'Side shoots clearly visible on main stem'],
    ['55', 'Kuncup bunga tunggal pertama pada tunas samping tampak', 'First individual flower buds on side shoots visible'],
    ['59', 'Braktea pertama tampak; kuncup bunga masih tertutup', 'First bracts visible; flower buds still closed'],
  ]],
  [6, [
    ['60', 'Bunga pertama mekar', 'First flowers open'],
    ['61', 'Awal berbunga: 10% bunga mekar', 'Beginning of flowering: 10% of flowers open'],
    ...persen(62, 64, (p) => `${p}% bunga mekar`, (p) => `${p}% of flowers open`),
    ['65', 'Berbunga penuh: 50% bunga mekar', 'Full flowering: 50% of flowers open'],
    ['67', 'Pembungaan menurun: 70% bunga mekar atau kering', 'Flowering declining: 70% of flowers open or dry'],
    ['69', 'Akhir berbunga: seluruh bunga kering, buah jadi tampak', 'End of flowering: all flowers dry, fruit set visible'],
  ]],
  [7, [
    ['71', 'Awal perkembangan biji: biji tampak pada tandan buah', 'Beginning of seed development: seeds visible in infructescence'],
    ['75', 'Perikarp hijau, buah masih lentur, perisperm menyerupai susu, kulit biji berwarna krem', 'Pericarp green; fruit still mouldable; perisperm milky; colour of seed coat: beige'],
  ]],
  [8, [
    ['81', 'Awal pemasakan: perikarp hijau kecoklatan, kulit biji coklat muda', 'Beginning of ripening: pericarp green-brown, seed coat light brown'],
    ['85', 'Perikarp coklat muda, kulit biji coklat kemerahan', 'Pericarp light brown, seed coat reddish brown'],
    ['87', 'Perikarp keras, kulit biji coklat tua', 'Pericarp hard, seed coat dark brown'],
    ['89', 'Masak penuh: kulit biji berwarna akhir yang khas varietas dan jenisnya, perisperm keras', 'Fully ripe: seed coat final colour (specific to variety and species), perisperm hard'],
  ]],
  [9, [
    ['91', 'Awal daun berubah warna', 'Beginning of leaf discolouration'],
    ['93', 'Sebagian besar daun menguning', 'Most leaves yellowish'],
    ['95', '50% daun kecoklatan', '50% of leaves brownish'],
    ['97', 'Daun mati', 'Leaves dead'],
    ['99', 'Produk hasil panen (biji)', 'Harvested product (seeds)'],
  ]],
];

const KAPRI = [
  [0, [
    ['00', 'Benih kering', 'Dry seed'],
    ['01', 'Awal imbibisi benih', 'Beginning of seed imbibition'],
    ['03', 'Imbibisi benih selesai', 'Seed imbibition complete'],
    ['05', 'Radikula muncul dari benih', 'Radicle emerged from seed'],
    ['07', 'Tunas menembus kulit benih', 'Shoot breaking through seed coat'],
    ['08', 'Tunas tumbuh ke arah permukaan tanah; lengkung hipokotil tampak', 'Shoot growing towards soil surface; hypocotyl arch visible'],
    ['09', 'Kemunculan: tunas menembus permukaan tanah (fase pecah tanah)', 'Emergence: shoot breaks through soil surface ("cracking stage")'],
  ]],
  [1, [
    ['10', 'Sepasang daun sisik tampak', 'Pair of scale leaves visible'],
    ['11', 'Daun sejati pertama berdaun penumpu membuka, atau sulur pertama terbentuk', 'First true leaf (with stipules) unfolded or first tendril developed'],
    ['12', '2 daun berdaun penumpu membuka, atau 2 sulur terbentuk', '2 leaves (with stipules) unfolded or 2 tendrils developed'],
    ['13', '3 daun berdaun penumpu membuka, atau 3 sulur terbentuk', '3 leaves (with stipules) unfolded or 3 tendrils developed'],
    ...seri(14, 18, (n) => `${n} daun berdaun penumpu membuka, atau ${n} sulur terbentuk`, (n) => `${n} leaves (with stipules) unfolded or ${n} tendrils developed`),
    ['19', '9 daun atau lebih membuka, atau 9 sulur atau lebih terbentuk', '9 or more leaves (with stipules) unfolded or 9 or more tendrils developed'],
  ]],
  [3, [
    ['30', 'Awal pemanjangan batang', 'Beginning of stem elongation'],
    ['31', '1 ruas jelas memanjang', '1 visibly extended internode'],
    ['32', '2 ruas jelas memanjang', '2 visibly extended internodes'],
    ['33', '3 ruas jelas memanjang', '3 visibly extended internodes'],
    ...seri(34, 38, (n) => `${n} ruas jelas memanjang`, (n) => `${n} visibly extended internodes`),
    ['39', '9 ruas atau lebih jelas memanjang', '9 or more visibly extended internodes'],
  ]],
  [5, [
    ['51', 'Kuncup bunga pertama tampak di luar daun', 'First flower buds visible outside leaves'],
    ['55', 'Kuncup bunga pertama yang terpisah tampak di luar daun, masih tertutup', 'First separated flower buds visible outside leaves but still closed'],
    ['59', 'Mahkota pertama tampak, bunga masih tertutup', 'First petals visible, flowers still closed'],
  ]],
  [6, [
    ['60', 'Bunga pertama mekar, tersebar dalam populasi', 'First flowers open (sporadically within the population)'],
    ['61', 'Awal berbunga: 10% bunga mekar', 'Beginning of flowering: 10% of flowers open'],
    ...persen(62, 64, (p) => `${p}% bunga mekar`, (p) => `${p}% of flowers open`),
    ['65', 'Berbunga penuh: 50% bunga mekar', 'Full flowering: 50% of flowers open'],
    ['67', 'Pembungaan menurun', 'Flowering declining'],
    ['69', 'Akhir berbunga', 'End of flowering'],
  ]],
  [7, [
    ['71', '10% polong mencapai panjang khasnya; keluar cairan bila ditekan', '10% of pods have reached typical length; juice exudes if pressed'],
    ['72', '20% polong mencapai panjang khasnya; keluar cairan bila ditekan', '20% of pods have reached typical length; juice exudes if pressed'],
    ['73', '30% polong mencapai panjang khasnya; keluar cairan bila ditekan. Nilai tenderometer: 80 TE', '30% of pods have reached typical length; juice exudes if pressed. Tenderometer value: 80 TE'],
    ['74', '40% polong mencapai panjang khasnya; keluar cairan bila ditekan. Nilai tenderometer: 95 TE', '40% of pods have reached typical length; juice exudes if pressed. Tenderometer value: 95 TE'],
    ['75', '50% polong mencapai panjang khasnya; keluar cairan bila ditekan. Nilai tenderometer: 105 TE', '50% of pods have reached typical length; juice exudes if pressed. Tenderometer value: 105 TE'],
    ['76', '60% polong mencapai panjang khasnya; keluar cairan bila ditekan. Nilai tenderometer: 115 TE', '60% of pods have reached typical length; juice exudes if pressed. Tenderometer value: 115 TE'],
    ['77', '70% polong mencapai panjang khasnya. Nilai tenderometer: 130 TE', '70% of pods have reached typical length. Tenderometer value: 130 TE'],
    ['79', 'Polong mencapai ukuran khasnya (masak hijau); biji terbentuk penuh', 'Pods have reached typical size (green ripe); peas fully formed'],
  ]],
  [8, [
    ['81', '10% polong masak, biji berwarna akhir, kering dan keras', '10% of pods ripe, seeds final colour, dry and hard'],
    ...persen(82, 88, (p) => `${p}% polong masak, biji berwarna akhir, kering dan keras`, (p) => `${p}% of pods ripe, seeds final colour, dry and hard`),
    ['89', 'Masak penuh: seluruh polong kering dan coklat, biji kering dan keras', 'Fully ripe: all pods dry and brown. Seeds dry and hard (dry ripe)'],
  ]],
  [9, [
    ['97', 'Tanaman mati dan kering', 'Plants dead and dry'],
    ['99', 'Produk hasil panen', 'Harvested product'],
  ]],
];

const BERKAS = [
  ['stage-scale-bbch-bit.json', {
    id: 'op:sca:00000016', key: 'bbch-bit', stg: 1500, tabel: BIT,
    label: { id: 'BBCH — Bit (Beta vulgaris)', en: 'BBCH scale — beet' },
    definition: { id: 'Skala fenologi BBCH untuk bit, Beta vulgaris ssp. vulgaris — mencakup bit gula maupun bit meja. Bit berdaun berpasangan, sehingga deret fase daunnya melompat: 12 berarti 2 daun (pasangan pertama) dan 14 berarti 4 daun (pasangan kedua); kode 13 memang tidak ada. Fase utama 5 sampai 8 baru terjadi pada tahun kedua pertumbuhan, karena bit tanaman dua tahunan.' },
    mapId: 'bbch-beet', mapNote: 'Kunci BBCH bit, dirujuk monograf ke Meier dkk. (1993).',
    notes: { id: 'Fase utama 2 tidak dipakai. Fase utama 4 hanya memuat satu kode, 49, yaitu umbi mencapai ukuran siap panen — itulah akhir siklus untuk budidaya konsumsi maupun gula. Sumber menandai fase 5 dengan keterangan "tahun kedua pertumbuhan": bit hanya berbunga setelah melewati periode dingin, jadi di iklim tropis fase 5–8 praktis tidak akan tercapai kecuali di dataran tinggi untuk produksi benih.' },
    locator: 'kunci bit dirujuk ke Meier dkk. (1993)',
  }],
  ['stage-scale-bbch-kacang-polong.json', {
    id: 'op:sca:00000017', key: 'bbch-kacang-polong', stg: 1600, tabel: KAPRI,
    label: { id: 'BBCH — Kacang polong (Pisum sativum)', en: 'BBCH scale — pea' },
    definition: { id: 'Skala fenologi BBCH untuk kacang polong — kapri dan ercis. Fase daunnya menghitung daun berdaun penumpu ATAU sulur, karena varietas berdaun dan varietas bersulur (afila) sama-sama tercakup. Ruas pertama dihitung dari buku daun sisik sampai buku daun sejati pertama. Fase utama 2 dan 4 tidak dipakai.' },
    mapId: 'bbch-pea', mapNote: 'Kunci BBCH kacang polong, dirujuk monograf ke Weber & Bleiholder (1990) dan Feller dkk. (1995 b).',
    notes: { id: 'Fase 73 sampai 77 mencantumkan nilai tenderometer — 80, 95, 105, 115, dan 130 TE — satu-satunya kunci di repositori ini yang memasang angka alat ukur pada deskripsi fasenya. Nilai itu dipakai industri pengalengan untuk menentukan saat panen polong muda. Kode 78 tidak ada di sumber.' },
    locator: 'kunci kacang polong dirujuk ke Weber & Bleiholder (1990) dan Feller dkk. (1995 b)',
  }],
];

let total = 0;
for (const [nama, k] of BERKAS) {
  const stages = []; let n = k.stg;
  for (const [principal, baris] of k.tabel) {
    for (const [code, id, en, tanda] of baris) {
      const map = { scheme: 'BBCH', id: code, relation: 'exact' };
      if (tanda === 'antara') map.note = ANTARA;
      stages.push({ id: `op:stg:${String(n++).padStart(8, '0')}`, code, label: { id, en }, principal, order: Number(code), mappings: [map] });
    }
  }
  const nomor = Number(k.id.slice(-2));
  writeFileSync(join(VOCAB, nama), JSON.stringify({
    $schema: '../schema/stage-scale.schema.json',
    id: k.id, key: k.key, label: k.label, definition: k.definition,
    basis: 'phenology',
    applies_to: { commodity_kinds: ['crop'], commodities: [] },
    mappings: [{ scheme: 'BBCH', id: k.mapId, relation: 'exact', note: k.mapNote }],
    notes: k.notes, stages,
    lifecycle: { version: '0.1.0', status: 'draft', created_at: STAMP, review_due: '2027-08-19' },
    provenance: { license: 'CC-BY-SA-4.0', sources: sumber(k.locator) },
    id_blocks: [{ from: nomor, to: nomor }],
  }, null, 2) + '\n');
  const per = new Map();
  for (const s of stages) per.set(s.principal, (per.get(s.principal) ?? 0) + 1);
  console.log(`${nama.padEnd(36)} ${String(stages.length).padStart(3)} fase — ${[...per].map(([p, c]) => `${p}:${c}`).join(' ')}`);
  total += stages.length;
}
console.log(`\nTotal fase baru: ${total}`);
