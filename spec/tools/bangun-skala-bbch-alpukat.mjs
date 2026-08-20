// Menyusun skala fase alpukat dari sumbernya:
//   vocab/stage-scale-bbch-alpukat.json   op:sca:00000019, fase op:stg:00001900-1999
//
// Sumber: M.L. Alcaraz, T.G. Thorp, J.I. Hormaza (2013), "Phenological growth
// stages of avocado (Persea americana) according to the BBCH scale",
// Scientia Horticulturae 164, 434–439.
//
// Kunci ini memakai BBCH DIPERLUAS 3 digit dengan arti yang khas: digit ke-1
// fase utama, digit ke-2 MESOSTAGE, digit ke-3 fase sekunder. Mesostage
// membedakan pertumbuhan yang berulang dalam satu tahun — alpukat di Spanyol
// selatan bertunas dua kali, jadi 010–019 tunas pertama dan 020–029 tunas kedua.
// Penulisnya menyatakan mesostage boleh ditambah bila iklimnya menghasilkan
// lebih banyak periode; di Indonesia jumlahnya perlu diamati sendiri.
//
// Jalankan dari akar repositori:  node spec/tools/bangun-skala-bbch-alpukat.mjs

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const VOCAB = join(dirname(fileURLToPath(import.meta.url)), '..', 'vocab');
const STAMP = '2026-08-19T00:00:00Z';
const ANTARA = 'Kode antara. Sumber menulis "stages continue until…"; teksnya mengikuti pola deret persen pada kunci ini.';

// deret persen: awalan + digit, dari..sampai
const pct = (awalan, dari, sampai, id, en) =>
  Array.from({ length: sampai - dari + 1 }, (_, i) => {
    const d = dari + i;
    return [`${awalan}${d}`, id(d * 10), en(d * 10), 'antara'];
  });

// satu blok tunas vegetatif (fase 0-3) untuk satu mesostage
const tunas = (m, ket) => [
  [0, [
    [`0${m}0`, `${ket}: kuncup vegetatif dorman — kuncup tertutup dan terbungkus sisik kuncup hijau kecoklatan`, `${ket}: Vegetative buds dormant: vegetative buds are closed and covered by green-brown bud scales`],
    [`0${m}1`, `${ket}: awal kuncup membengkak — sisik kuncup mulai merenggang, kuncup jelas membengkak`, `${ket}: Beginning of bud swell: bud scales begin to separate, buds visibly swollen`],
    [`0${m}3`, `${ket}: akhir kuncup membengkak — sisik kuncup merenggang penuh, bagian dalam yang lebih hijau muda tampak`, `${ket}: End of bud swell: bud scales completely separated, lighter green sections of inner bud scales visible`],
    [`0${m}7`, `${ket}: awal kuncup pecah — sisik kuncup terlipat sebagian, ujung daun hijau pertama mulai tampak`, `${ket}: Beginning of bud break: bud scales partially folded back and first green leaf tips just visible`],
    [`0${m}9`, `${ket}: akhir kuncup pecah — ujung daun sekitar 3 mm di atas sisik kuncup, sisik luar gugur`, `${ket}: End of bud break: leaf tips about 3 mm above bud scales, external bud scales shed`],
  ]],
  [1, [
    [`1${m}0`, `${ket}: daun pertama memisah — daun membuka dengan ujung 10 mm di atas sisik kuncup`, `${ket}: First leaves separating: leaves unfolding with leaf tips 10 mm above the bud scales`],
    [`1${m}1`, `${ket}: daun pertama membuka — sumbu utama tunas yang sedang tumbuh tampak`, `${ket}: First leaf unfolded: primary axis of developing shoot visible`],
    [`1${m}2`, `${ket}: daun bertambah membuka — daun pertama mencapai 20% ukuran penuhnya`, `${ket}: More leaves unfolded. First leaf at 20% of its full size`],
    [`1${m}3`, `${ket}: daun bertambah membuka — daun pertama mencapai 30% ukuran penuhnya`, `${ket}: More leaves unfolded. First leaf at 30% of its full size`],
    ...pct(`1${m}`, 4, 4, (p) => `${ket}: daun bertambah membuka — daun pertama mencapai ${p}% ukuran penuhnya`, (p) => `${ket}: More leaves unfolded. First leaf at ${p}% of its full size`),
    [`1${m}5`, `${ket}: daun bertambah membuka — daun pertama mencapai 50% ukuran penuhnya, tangkai daun memanjang`, `${ket}: More leaves unfolded: first leaf of the flush at 50% of its full size, leaf petioles extending`],
    ...pct(`1${m}`, 6, 8, (p) => `${ket}: daun bertambah membuka — daun pertama mencapai ${p}% ukuran penuhnya`, (p) => `${ket}: More leaves unfolded. First leaf at ${p}% of its full size`),
    [`1${m}9`, `${ket}: seluruh daun membuka dan mengembang penuh`, `${ket}: All leaves unfolded and fully expanded`],
  ]],
  [2, [
    [`2${m}0`, `${ket}: belum ada tunas siléptik`, `${ket}: No sylleptic shoots visible`],
    [`2${m}1`, `${ket}: tunas siléptik pertama tampak`, `${ket}: First sylleptic shoot is visible`],
    [`2${m}2`, `${ket}: dua tunas siléptik tampak`, `${ket}: Two sylleptic shoots visible`],
    [`2${m}3`, `${ket}: tiga tunas siléptik tampak`, `${ket}: Three sylleptic shoots visible`],
    ...Array.from({ length: 5 }, (_, i) => i + 4).map((d) => [
      `2${m}${d}`, `${ket}: ${d} tunas siléptik tampak`, `${ket}: ${d} sylleptic shoots visible`, 'antara']),
    [`2${m}9`, `${ket}: sembilan tunas siléptik atau lebih tampak`, `${ket}: Nine or more sylleptic shoots visible`],
  ]],
  [3, [
    [`3${m}0`, `${ket}: awal pemanjangan tunas — sumbu tunas yang sedang tumbuh tampak`, `${ket}: Beginning of shoot extension: axes of developing shoots visible`],
    [`3${m}1`, `${ket}: tunas mencapai 10% panjang akhirnya, daun sedang membuka`, `${ket}: 10% of final shoot length: shoots 10% of final length, leaves unfolding`],
    ...pct(`3${m}`, 2, 4, (p) => `${ket}: tunas mencapai ${p}% panjang akhirnya`, (p) => `${ket}: ${p}% of final shoot length`),
    [`3${m}5`, `${ket}: tunas mencapai 50% panjang akhirnya, seluruh daun sudah membuka`, `${ket}: 50% of final shoot length: shoots 50% of final length, all leaves unfolded`],
    ...pct(`3${m}`, 6, 8, (p) => `${ket}: tunas mencapai ${p}% panjang akhirnya`, (p) => `${ket}: ${p}% of final shoot length`),
    [`3${m}9`, `${ket}: tunas melampaui 90% panjang akhirnya — pemanjangan berhenti, kuncup ujung terbentuk`, `${ket}: Shoots more than 90% of final length: end of shoot extension (apical bud set)`],
  ]],
];

const REPRODUKTIF = [
  [5, [
    ['510', 'Kuncup generatif dorman — terbungkus sisik kuncup hijau kecoklatan tanpa tanda pertumbuhan', 'Reproductive buds dormant: buds covered with green-brown bud scales with no sign of growth'],
    ['511', 'Awal kuncup generatif membengkak — sisik coklat muda mulai merenggang, kuncup jelas membengkak', 'Beginning of reproductive bud swell: light brown scales begin to separate, buds visibly swollen'],
    ['512', 'Akhir kuncup generatif membengkak — sisik kuncup merenggang penuh, bagian dalam yang lebih hijau muda tampak', 'End of reproductive bud swell: bud scales completely separated, lighter green sections of inner bud scales visible'],
    ['513', 'Kuncup generatif pecah — sisik terlipat, perbungaan mulai tampak di ketiak sisik kuncup', 'Reproductive bud break: bud scales folded back, inflorescences just visible in axils of bud scales'],
    ['514', 'Perbungaan majemuk memisah — perbungaan tunggal terpisah dan mulai memanjang', 'Compound inflorescence separated: individual inflorescences separated and beginning of inflorescence elongation'],
    ['515', 'Perbungaan mencapai 50% panjang akhirnya — sumbu sekunder memanjang, sumbu tersier masih terbungkus braktea, bunga kecil masih tertutup', 'Inflorescences 50% of final length: secondary axes elongated, tertiary axes still covered by bracts, small closed flowers'],
    ['517', 'Perbungaan mencapai 70% panjang akhirnya — sumbu tersier memanjang, bunga terpisah satu per satu, daun pada perbungaan tak terbatas mulai mengembang', 'Inflorescences 70% of final length: tertiary axes elongated, individual flowers separated, first visible expansion of leaves on indeterminate inflorescences'],
    ['518', 'Perbungaan mencapai 80% panjang akhirnya', 'Inflorescences 80% of final length'],
    ['519', 'Akhir pemanjangan perbungaan — sumbu sekunder dan tersier berkembang penuh, tangkai bunga memanjang, kelopak menutup, bunga terdiferensiasi dan tertutup, tunas pada perbungaan tak terbatas mulai memanjang', 'End of inflorescence extension: secondary and tertiary axis fully developed, individual flower pedicels elongated, sepals closed, flowers differentiated and closed, shoot extension underway on indeterminate inflorescences'],
  ]],
  [6, [
    ['610', 'Bunga pertama mekar', 'First flowers opened'],
    ['611', '10% bunga mekar', '10% of flowers opened'],
    ...pct('61', 2, 4, (p) => `${p}% bunga mekar`, (p) => `${p}% of flowers opened`),
    ['615', '50% bunga mekar — puncak mekar tengah', '50% of flowers opened; mid-bloom'],
    ['616', '60% bunga mekar', '60% of flowers opened', 'antara'],
    ['617', '70% bunga mekar', '70% of flowers opened'],
    ['618', '80% bunga mekar', '80% of flowers opened', 'antara'],
    ['619', '90% bunga atau lebih mekar — mekar penuh', '90% or more of flowers opened: full bloom'],
  ]],
  [7, [
    ['710', 'Belum tampak pertumbuhan bakal buah', 'No ovary growth visible'],
    ['711', 'Awal pertumbuhan bakal buah — menyusul pembuahan dan buah jadi', 'Initial ovary growth: following fertilization and fruit set'],
    ['712', 'Gugur buah muda pertama — bakal buah hijau dikelilingi kelopak yang mengering, garis tengah buah yang bertahan 5–10 mm', 'First fruitlet abscission: ovaries green and surrounded by dying sepals, diameter of retained fruit 5–10 mm'],
    ['715', 'Buah mencapai 50% ukuran akhirnya — periode utama kedua gugur buah', '50% of final fruit size: second main period of fruit drop'],
    ['717', 'Buah mencapai 70% ukuran akhirnya', '70% of final fruit size'],
    ['719', 'Buah mencapai 90% ukuran akhirnya atau lebih — siap dipanen untuk pasar', '90% or more of final fruit size: fruit ready for commercial harvest'],
  ]],
];

// gabungkan: mesostage 1 & 2 untuk fase 0-3, lalu fase reproduktif
const gabung = () => {
  const per = new Map();
  const tambah = (blok) => {
    for (const [principal, baris] of blok) {
      if (!per.has(principal)) per.set(principal, []);
      per.get(principal).push(...baris);
    }
  };
  tambah(tunas(1, 'Trubus ke-1'));
  tambah(tunas(2, 'Trubus ke-2'));
  tambah(REPRODUKTIF);
  return [...per.entries()].sort((a, b) => a[0] - b[0]);
};

const stages = [];
let n = 1900;
for (const [principal, baris] of gabung()) {
  for (const [code, id, en, tanda] of [...baris].sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const map = {
      scheme: 'BBCH', id: code, relation: 'exact',
      note: 'Kode pada skala BBCH diperluas untuk alpukat, Alcaraz dkk. (2013). Digit ke-2 adalah mesostage, bukan fase sekunder.',
    };
    if (tanda === 'antara') map.note = `${ANTARA} ${map.note}`;
    stages.push({ id: `op:stg:${String(n++).padStart(8, '0')}`, code, label: { id, en }, principal, order: Number(code), mappings: [map] });
  }
}

const doc = {
  $schema: '../schema/stage-scale.schema.json',
  id: 'op:sca:00000019',
  key: 'bbch-alpukat',
  label: { id: 'BBCH — Alpukat (Persea americana)', en: 'BBCH scale — avocado' },
  definition: {
    id: 'Skala fenologi BBCH diperluas untuk alpukat. Kodenya 3 digit dengan arti yang khas: digit ke-1 fase utama, digit ke-2 MESOSTAGE, digit ke-3 fase sekunder. Mesostage membedakan pertumbuhan yang berulang dalam satu tahun — alpukat di Spanyol selatan bertunas dua kali, sehingga 010–019 menggambarkan trubus pertama dan 020–029 trubus kedua dengan deskripsi yang sama persis. Pemanjangan tunas siléptik (fase utama 2) berlangsung bersamaan dengan pemanjangan tunas utama (fase utama 3), jadi keduanya dicatat berdampingan, bukan berurutan. Fase utama 4 dan 9 tidak dipakai, dan fase utama 8 sengaja dikecualikan penulisnya: buah alpukat tidak masak di pohon, melainkan sesudah dipanen.',
  },
  basis: 'phenology',
  applies_to: { commodity_kinds: ['crop'], commodities: [] },
  mappings: [{
    scheme: 'BBCH', id: 'bbch-avocado', relation: 'exact',
    note: 'Kunci BBCH diperluas untuk alpukat, Alcaraz, Thorp & Hormaza (2013), Scientia Horticulturae 164:434–439.',
  }],
  notes: {
    id: 'Dua mesostage disalin karena keduanya ditabelkan sumbernya untuk fase utama 0 sampai 3. Penulisnya menyatakan mesostage boleh ditambah bila iklimnya menghasilkan lebih banyak periode trubus atau pembungaan; berapa kali alpukat bertrubus di Indonesia perlu diamati sendiri, dan menyalin dua begitu saja bukan berarti dua itu benar di sini. Waktu yang disebut sumber juga khas Spanyol selatan — kuncup pecah Februari/Maret, mekar akhir Maret, panen 31–37 minggu sesudah pembungaan berakhir untuk kultivar Hass — dan tidak bisa dipindahkan mentah-mentah ke tropis. Yang berlaku lintas tempat adalah urutan fasenya, bukan tanggalnya. Fase utama 5 dan 6 hanya punya mesostage 1 di sumber, dengan catatan bahwa periode pembungaan tambahan boleh ditambah sebagai mesostage baru.',
  },
  stages,
  lifecycle: { version: '0.1.0', status: 'draft', created_at: STAMP, review_due: '2027-08-19' },
  provenance: {
    license: 'CC-BY-SA-4.0',
    sources: [{
      title: 'Phenological growth stages of avocado (Persea americana) according to the BBCH scale',
      publisher: 'Scientia Horticulturae 164, 434–439 (Elsevier)',
      year: 2013,
      locator: 'M.L. Alcaraz, T.G. Thorp, J.I. Hormaza; Tabel 1 dan bagian 3.1–3.7',
    }],
  },
  id_blocks: [{ from: 19, to: 19 }],
};

writeFileSync(join(VOCAB, 'stage-scale-bbch-alpukat.json'), JSON.stringify(doc, null, 2) + '\n');
const per = new Map();
for (const s of stages) per.set(s.principal, (per.get(s.principal) ?? 0) + 1);
console.log(`stage-scale-bbch-alpukat.json: ${stages.length} fase — ${[...per].map(([p, c]) => `${p}:${c}`).join(' ')}`);
console.log(`urut naik: ${stages.every((s, i) => i === 0 || stages[i - 1].order < s.order)}`);
