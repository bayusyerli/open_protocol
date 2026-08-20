// Menyusun skala fase tembakau dari CORESTA Guide N° 7:
//   vocab/stage-scale-bbch-tembakau.json   op:sca:00000018, fase op:stg:00001700-1899
//
// Sumber: CORESTA Guide N° 7, "A Scale For Coding Growth Stages in Tobacco Crops",
// Versi 2, Desember 2019, Cooperation Centre for Scientific Research Relative to
// Tobacco; disusun Growth Stages and Identification Keys for Tobacco Task Force
// (Henri Papenfus, Norbert Billenkamp). Kuncinya sendiri menyatakan berbasis
// BBCH-scale diperluas dan merujuk BBCH Monograph edisi ke-2 (2001).
//
// Bentuknya berbeda dari seluruh skala lain di repositori ini: kode 2 digit pada
// fase utama 0, 4, 5, 6, 7, dan 8; kode 4 DIGIT pada fase utama 1, 2, 3, dan 9,
// karena keempatnya perlu membedakan meso-stage — persemaian vs lapangan, tunas
// air bawah vs tunas kepala, tutupan dalam vs antarbarisan, dan empat tahap
// panen-pengeringan. Bidang `order` karena itu memakai kunci urut 4 digit
// ternormalisasi supaya seluruh fase tetap terurut benar dalam satu deret.
//
// Jalankan dari akar repositori:  node spec/tools/bangun-skala-bbch-tembakau.mjs

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const VOCAB = join(dirname(fileURLToPath(import.meta.url)), '..', 'vocab');
const STAMP = '2026-08-19T00:00:00Z';
const ANTARA = 'Kode antara. Sumber menulis "stages continuous till"; teksnya mengikuti pola deret persen pada kunci ini.';

// deret persen ber-4 digit: awalan + 1..9
const persen4 = (awalan, id, en, kecuali = []) =>
  Array.from({ length: 9 }, (_, i) => i + 1)
    .filter((n) => !kecuali.includes(n))
    .map((n) => [`${awalan}${n}`, id(n * 10), en(n * 10), n >= 6 && n <= 8 ? 'antara' : undefined]);
const persen2 = (awalan, id, en, kecuali = []) =>
  Array.from({ length: 9 }, (_, i) => i + 1)
    .filter((n) => !kecuali.includes(n))
    .map((n) => [`${awalan}${n}`, id(n * 10), en(n * 10), n >= 6 && n <= 8 ? 'antara' : undefined]);

const TEMBAKAU = [
  [0, [
    ['00', 'Benih kering', 'Dry seed'],
    ['01', 'Awal imbibisi', 'Beginning of imbibition'],
    ['03', 'Imbibisi selesai', 'Imbibition complete'],
    ['05', 'Radikula muncul dari benih', 'Radicle emerged from seed'],
    ['06', 'Radikula memanjang, bulu akar terbentuk', 'Radicle elongated, root hairs developing'],
    ['07', 'Hipokotil bersama kotiledon muncul dari benih', 'Hypocotyl with cotyledons emerged from seed'],
    ['08', 'Hipokotil tumbuh ke arah permukaan tanah', 'Hypocotyl growing towards soil surface'],
    ['09', 'Kemunculan: kotiledon menembus permukaan tanah', 'Emergence: cotyledons breaking through soil surface'],
  ]],
  [1, [
    ['1000', 'Persemaian: kotiledon membuka penuh', 'Seedling: cotyledons completely unfolded'],
    ['1001', 'Persemaian: daun sejati ke-1 membuka', 'Seedling: 1st true leaf unfolded'],
    ['1002', 'Persemaian: daun sejati ke-2 membuka', 'Seedling: 2nd true leaf unfolded'],
    ['1003', 'Persemaian: daun sejati ke-3 membuka', 'Seedling: 3rd true leaf unfolded'],
    ['1004', 'Persemaian: daun sejati ke-4 membuka', 'Seedling: 4th true leaf unfolded'],
    ['1005', 'Persemaian: daun sejati ke-5 membuka', 'Seedling: 5th true leaf unfolded'],
    ['1100', 'Tanaman lapangan: pindah tanam', 'Field plant: transplanting'],
    ['1101', 'Tanaman lapangan: daun ke-1 membuka (panjang > 4 cm)', 'Field plant: 1st leaf unfolded (>4 cm length)'],
    ['1102', 'Tanaman lapangan: daun ke-2 membuka (panjang > 4 cm)', 'Field plant: 2nd leaf unfolded (>4 cm length)'],
    ['1103', 'Tanaman lapangan: daun ke-3 membuka (panjang > 4 cm)', 'Field plant: 3rd leaf unfolded (>4 cm length)'],
    ['1104', 'Tanaman lapangan: daun ke-4 membuka (panjang > 4 cm)', 'Field plant: 4th leaf unfolded (>4 cm length)'],
    ['1105', 'Tanaman lapangan: daun ke-5 membuka (panjang > 4 cm)', 'Field plant: 5th leaf unfolded (>4 cm length)'],
  ]],
  [2, [
    ['2000', 'Perkembangan tunas air bawah', 'Ground sucker development'],
    ['2001', 'Tunas air bawah ke-1 tampak', '1st ground sucker visible'],
    ['2002', 'Tunas air bawah ke-2 tampak', '2nd ground sucker visible'],
    ['2003', 'Tunas air bawah ke-3 tampak', '3rd ground sucker visible'],
    ['2004', 'Tunas air bawah ke-4 tampak', '4th ground sucker visible'],
    ['2005', 'Tunas air bawah ke-5 tampak', '5th ground sucker visible'],
    ['2100', 'Perkembangan tunas kepala', 'Head sucker development'],
    ['2101', 'Tunas kepala ke-1 tampak', '1st head sucker visible'],
    ['2102', 'Tunas kepala ke-2 tampak', '2nd head sucker visible'],
    ['2103', 'Tunas kepala ke-3 tampak', '3rd head sucker visible'],
    ['2104', 'Tunas kepala ke-4 tampak', '4th head sucker visible'],
    ['2105', 'Tunas kepala ke-5 tampak', '5th head sucker visible'],
  ]],
  [3, [
    ['3000', 'Persemaian: awal pemanjangan batang', 'Seedling: beginning of stem elongation'],
    ...persen4('300', (p) => `Persemaian: batang mencapai ${p}% panjang khasnya`, (p) => `Seedling: stem reaches ${p} % of typical length`),
    ['3100', 'Tanaman lapangan: awal pemanjangan batang (pindah tanam)', 'Field plant: beginning of stem elongation (transplanting)'],
    ...persen4('310', (p) => `Tanaman lapangan: batang mencapai ${p}% panjang khasnya`, (p) => `Field plant: stem reaches ${p} % of typical length`),
    ['3200', 'Tutupan dalam barisan: pindah tanam', 'Crop cover within rows: transplanting'],
    ...persen4('320', (p) => `${p}% panjang barisan tertutup tajuk`, (p) => `${p} % of row length covered`),
    ['3300', 'Tutupan antarbarisan: pindah tanam', 'Crop cover between rows: transplanting'],
    ...persen4('330', (p) => `${p}% permukaan tanah antarbarisan tertutup tajuk`, (p) => `${p} % of ground between rows covered`),
  ]],
  [4, [
    ['40', 'Daun panen pertama membuka penuh dan mulai masak', '1st harvestable leaf fully expanded and beginning to ripen'],
    ...persen2('4', (p) => `${p}% daun panen sudah masak`, (p) => `${p} % of harvestable leaves ripe`, [9]),
    ['49', 'Seluruh daun panen sudah masak', 'All harvestable leaves ripe'],
  ]],
  [5, [
    ['50', 'Kuncup ujung membengkak, perbungaan belum tampak', 'Apical bud swelling but inflorescence not yet visible'],
    ['51', 'Perbungaan tampak di antara daun pucuk', 'Inflorescence visible between apical leaves'],
    ['55', 'Mahkota pertama tampak tetapi masih tertutup', '1st corolla visible but still closed'],
    ['59', 'Kelopak pertama tampak tetapi belum mekar', 'First petals visible but not yet open'],
  ]],
  [6, [
    ['60', 'Awal berbunga: kelopak pertama mekar', 'Beginning of flowering: first petals open'],
    ...persen2('6', (p) => `${p}% bunga mekar`, (p) => `${p} % of flowers open`, [9]),
    ['69', 'Lebih dari 90% bunga mekar', 'More than 90 % of flowers open'],
  ]],
  [7, [
    ['70', 'Kapsul hijau pertama terbentuk', '1st green capsules formed'],
    ...persen2('7', (p) => `${p}% kapsul hijau membengkak sampai ukuran khasnya`, (p) => `${p} % green capsules swollen to typical size`, [9]),
    ['79', 'Lebih dari 90% kapsul hijau membengkak sampai ukuran khasnya', 'More than 90 % green capsules swollen to typical size'],
  ]],
  [8, [
    ['80', 'Awal pemasakan: kapsul biji tertua mulai menggelap', 'Beginning of ripening, oldest seed capsules darkening'],
    ...persen2('8', (p) => `${p}% kapsul biji menggelap`, (p) => `${p} % of seed capsules darkened`, [9]),
    ['89', 'Lebih dari 90% kapsul biji menggelap', 'More than 90 % of seed capsules darkened'],
  ]],
  [9, [
    ['9000', 'Panen daun: daun bawah masak penuh dan siap dipetik', 'Harvesting: lower leaves fully ripe and ready to be harvested'],
    ...persen4('900', (p) => `${p}% daun sudah dipetik`, (p) => `${p} % of leaves harvested`),
    ['9100', 'Tahap pewarnaan: awal pengeringan', 'Colouring phase: start of curing'],
    ...persen4('910', (p) => `${p}% lamina daun berubah warna`, (p) => `${p} % of leaf lamina coloured`),
    ['9200', 'Tahap pengeringan lamina: awal pengeringan lamina', 'Lamina drying phase: start of lamina drying'],
    ...persen4('920', (p) => `${p}% lamina daun kering`, (p) => `${p} % of leaf lamina dry`),
    ['9300', 'Tahap pengeringan tulang daun: awal pengeringan tulang daun utama', 'Mid-vein drying phase: start of mid-vein drying'],
    ...persen4('930', (p) => `${p}% tulang daun utama kering`, (p) => `${p} % of mid-vein dried`),
  ]],
];

// kunci urut ternormalisasi: kode 2 digit dinaikkan ke bentuk 4 digit
const urut = (code) => (code.length === 2 ? Number(code) * 100 : Number(code));

const stages = [];
let n = 1700;
for (const [principal, baris] of TEMBAKAU) {
  for (const [code, id, en, tanda] of baris) {
    const map = { scheme: 'BBCH', id: code, relation: 'close', note: 'Kode pada skala CORESTA untuk tembakau, yang menyatakan dirinya berbasis BBCH diperluas. Relasi ditandai close, bukan exact: kodenya bukan berasal dari BBCH Monograph melainkan dari kunci turunan yang menambah meso-stage khas tembakau.' };
    if (tanda === 'antara') map.note = `${ANTARA} ${map.note}`;
    stages.push({ id: `op:stg:${String(n++).padStart(8, '0')}`, code, label: { id, en }, principal, order: urut(code), mappings: [map] });
  }
}

const doc = {
  $schema: '../schema/stage-scale.schema.json',
  id: 'op:sca:00000018',
  key: 'bbch-tembakau',
  label: { id: 'CORESTA — Tembakau (Nicotiana tabacum)', en: 'CORESTA growth stage scale — tobacco' },
  definition: {
    id: 'Skala fase tembakau menurut CORESTA Guide N° 7, yang menyatakan dirinya berbasis BBCH diperluas. Empat hal membuatnya berbeda dari kunci BBCH mana pun di repositori ini. Pertama, ia memisahkan fase persemaian dan fase lapangan, karena pindah tanam memutus kesinambungan pemanjangan batang dan pertumbuhan daun. Kedua, ia membedakan tunas air bawah dari tunas kepala, dua hal yang perlakuannya berbeda. Ketiga, ia memakai tutupan tajuk — dalam barisan dan antarbarisan — sebagai fase tersendiri karena menentukan penjadwalan irigasi dan penyemprotan. Keempat, dan paling khas, fase utama 9 bukan penuaan melainkan PANEN DAN PENGERINGAN: pemetikan daun, pewarnaan lamina, pengeringan lamina, lalu pengeringan tulang daun. Tidak ada skala lain di sini yang meneruskan penomoran fase sampai ke pascapanen.',
  },
  basis: 'phenology',
  applies_to: { commodity_kinds: ['crop'], commodities: [] },
  mappings: [{
    scheme: 'OTHER', id: 'CORESTA-Guide-7', relation: 'exact',
    note: 'CORESTA Guide N° 7 versi 2 (Desember 2019). Kuncinya sendiri merujuk BBCH Monograph edisi ke-2 (2001) sebagai dasar.',
  }],
  notes: {
    id: 'Kode 2 digit dipakai pada fase utama 0, 4, 5, 6, 7, dan 8; kode 4 DIGIT pada fase utama 1, 2, 3, dan 9, karena keempatnya perlu membedakan meso-stage. Supaya seluruh fase tetap terurut benar dalam satu deret, bidang order memakai kunci ternormalisasi 4 digit: kode 2 digit dikalikan 100, sehingga 49 menjadi 4900 dan tetap berada sebelum 50 yang menjadi 5000. Yang belum dibawa: deret jumlah daun dan jumlah tunas yang oleh sumbernya ditulis terbuka — 10nn, 11nn, 20nn, 21nn — karena jumlah daun tembakau bergantung varietas dan pemangkasan pucuk, dan menetapkan batas atas berarti mengarang batas yang tidak ada di sumber. Yang tertabelkan, 1000–1005 dan seterusnya, disalin apa adanya; kode berikutnya bisa dibentuk mengikuti pola yang sama. Sumber juga menetapkan dua konvensi penulisan: tanda hubung untuk rentang (51-69) dan garis miring untuk fase yang berlangsung bersamaan (1112/3103). Ambang tegakan: satu hamparan dianggap mencapai suatu fase bila 50% tanamannya sudah mencapainya.',
  },
  stages,
  lifecycle: { version: '0.1.0', status: 'draft', created_at: STAMP, review_due: '2027-08-19' },
  provenance: {
    license: 'CC-BY-SA-4.0',
    sources: [{
      title: 'A Scale For Coding Growth Stages in Tobacco Crops — CORESTA Guide N° 7',
      publisher: 'Cooperation Centre for Scientific Research Relative to Tobacco (CORESTA)',
      year: 2019,
      url: 'https://www.coresta.org/scale-coding-growth-stages-tobacco-crops-29211.html',
      locator: 'Versi 2, Desember 2019; Growth Stages and Identification Keys for Tobacco Task Force — Henri Papenfus, Norbert Billenkamp. Lampiran: Coding for growth stages in tobacco',
    }],
  },
  id_blocks: [{ from: 18, to: 18 }],
};

writeFileSync(join(VOCAB, 'stage-scale-bbch-tembakau.json'), JSON.stringify(doc, null, 2) + '\n');
const per = new Map();
for (const s of stages) per.set(s.principal, (per.get(s.principal) ?? 0) + 1);
console.log(`stage-scale-bbch-tembakau.json: ${stages.length} fase — ${[...per].map(([p, c]) => `${p}:${c}`).join(' ')}`);
console.log(`stg ${stages[0].id.slice(-4)}–${stages.at(-1).id.slice(-4)}`);
