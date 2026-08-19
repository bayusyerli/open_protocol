// Menyusun skala fase BBCH kelompok cucurbit dari sumber primernya:
//   vocab/stage-scale-bbch-cucurbit.json   op:sca:00000005, fase op:stg:00000400-499
//
// Sumber: BBCH Monograph, "Growth stages of mono- and dicotyledonous plants",
// edisi ke-2 (2001), disunting Uwe Meier, Federal Biological Research Centre for
// Agriculture and Forestry. Kunci cucurbit dirujuk sumber ke Feller dkk. (1995 b).
//
// Kunci ini menabelkan DUA kolom kode: 2 digit dan 3 digit. Yang disalin jadi
// entitas fase adalah kolom 2 digit — sama seperti tiga skala lain di repositori
// ini — sementara padanan 3 digitnya disimpan sebagai pemetaan kedua pada fase
// yang sama. Fase yang HANYA ada di kolom 3 digit (daun ke-10 ke atas, tunas
// samping sekunder & tersier beserta bunga dan buahnya) sengaja belum dibawa;
// alasannya ada di definition berkas keluarannya.
//
// Jalankan dari akar repositori:  node spec/tools/bangun-skala-bbch-cucurbit.mjs

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const VOCAB = join(dirname(fileURLToPath(import.meta.url)), '..', 'vocab');
const STAMP = '2026-08-19T00:00:00Z';
const CATATAN_ANTARA = 'Kode antara. Mengikuti pola deret ke-n pada sistem BBCH; tidak ditabelkan terpisah di sumber.';
const CATATAN_3DIGIT = 'Padanan kode 3 digit pada kunci yang sama; menunjuk fase yang sama, dipakai bila tanaman bercabang dicatat lebih rinci.';

// [kode 2 digit, kode 3 digit, label id, label en, kodeAntara?]
const deret = (dari, sampai, tiga, id, en) =>
  Array.from({ length: sampai - dari + 1 }, (_, i) => {
    const n = dari + i, d = n % 10;
    return [String(n), String(tiga + d), id(d), en(d), true];
  });

const CUCURBIT = [
  [0, [
    ['00', '000', 'Benih kering', 'Dry seed'],
    ['01', '001', 'Awal imbibisi benih', 'Beginning of seed imbibition'],
    ['03', '003', 'Imbibisi benih selesai', 'Seed imbibition complete'],
    ['05', '005', 'Radikula muncul dari benih', 'Radicle emerged from seed'],
    ['07', '007', 'Hipokotil bersama kotiledon menembus kulit benih', 'Hypocotyl with cotyledons breaking through seed coat'],
    ['09', '009', 'Kemunculan: kotiledon menembus permukaan tanah', 'Emergence: cotyledons break through soil surface'],
  ]],
  [1, [
    ['10', '100', 'Kotiledon membuka penuh', 'Cotyledons completely unfolded'],
    ['11', '101', 'Daun sejati pertama pada batang utama membuka penuh', 'First true leaf on main stem fully unfolded'],
    ['12', '102', 'Daun sejati ke-2 pada batang utama membuka', '2nd true leaf on main stem unfolded'],
    ['13', '103', 'Daun sejati ke-3 pada batang utama membuka', '3rd true leaf on main stem unfolded'],
    ...deret(14, 18, 100, (n) => `Daun sejati ke-${n} pada batang utama membuka`, (n) => `${n}th true leaf on main stem unfolded`),
    ['19', '109', '9 daun atau lebih pada batang utama membuka — pada kolom 3 digit: daun ke-9 membuka', '9 or more leaves on main stem unfolded (2 digit) / 9th leaf unfolded on main stem (3 digit)'],
  ]],
  [2, [
    ['21', '201', 'Tunas samping primer pertama tampak', 'First primary side shoot visible'],
    ['22', '202', 'Tunas samping primer ke-2 tampak', '2nd primary side shoot visible'],
    ...deret(23, 28, 200, (n) => `Tunas samping primer ke-${n} tampak`, (n) => `${n}th primary side shoot visible`),
    ['29', '209', '9 tunas samping primer atau lebih tampak', '9 or more primary side shoots visible'],
  ]],
  [5, [
    ['51', '501', 'Bakal bunga pertama dengan bakal buah memanjang tampak pada batang utama', 'First flower initial with elongated ovary visible on main stem'],
    ['52', '502', 'Bakal bunga ke-2 dengan bakal buah memanjang tampak pada batang utama', '2nd flower initial with elongated ovary visible on main stem'],
    ['53', '503', 'Bakal bunga ke-3 dengan bakal buah memanjang tampak pada batang utama', '3rd flower initial with elongated ovary visible on main stem'],
    ...deret(54, 58, 500, (n) => `Bakal bunga ke-${n} dengan bakal buah memanjang tampak pada batang utama`, (n) => `${n}th flower initial with elongated ovary visible on main stem`),
    ['59', '509', '9 bakal bunga atau lebih dengan bakal buah memanjang sudah tampak pada batang utama', '9 or more flower initials with elongated ovary already visible on main stem'],
  ]],
  [6, [
    ['61', '601', 'Bunga pertama pada batang utama mekar', 'First flower open on main stem'],
    ['62', '602', 'Bunga ke-2 pada batang utama mekar', '2nd flower open on main stem'],
    ['63', '603', 'Bunga ke-3 pada batang utama mekar', '3rd flower open on main stem'],
    ...deret(64, 68, 600, (n) => `Bunga ke-${n} pada batang utama mekar`, (n) => `${n}th flower open on main stem`),
    ['69', '609', 'Bunga ke-9 pada batang utama mekar, atau 9 bunga pada batang utama sudah mekar', '9th flower open on main stem or 9 flowers on main stem already open'],
  ]],
  [7, [
    ['71', '701', 'Buah pertama pada batang utama mencapai ukuran dan bentuk khasnya', 'First fruit on main stem has reached typical size and form'],
    ['72', '702', 'Buah ke-2 pada batang utama mencapai ukuran dan bentuk khasnya', '2nd fruit on main stem has reached typical size and form'],
    ['73', '703', 'Buah ke-3 pada batang utama mencapai ukuran dan bentuk khasnya', '3rd fruit on main stem has reached typical size and form'],
    ...deret(74, 78, 700, (n) => `Buah ke-${n} pada batang utama mencapai ukuran dan bentuk khasnya`, (n) => `${n}th fruit on main stem has reached typical size and form`),
    ['79', '709', '9 buah atau lebih pada batang utama mencapai ukuran dan bentuk khasnya', '9 or more fruits on main stem has reached typical size and form'],
  ]],
  [8, [
    ['81', '801', '10% buah menunjukkan warna masak penuh yang khas', '10% of fruits show typical fully ripe colour'],
    ['82', '802', '20% buah menunjukkan warna masak penuh yang khas', '20% of fruits show typical fully ripe colour'],
    ['83', '803', '30% buah menunjukkan warna masak penuh yang khas', '30% of fruits show typical fully ripe colour'],
    ['84', '804', '40% buah menunjukkan warna masak penuh yang khas', '40% of fruits show typical fully ripe colour'],
    ['85', '805', '50% buah menunjukkan warna masak penuh yang khas', '50% of fruits show typical fully ripe colour'],
    ['86', '806', '60% buah menunjukkan warna masak penuh yang khas', '60% of fruits show typical fully ripe colour'],
    ['87', '807', '70% buah menunjukkan warna masak penuh yang khas', '70% of fruits show typical fully ripe colour'],
    ['88', '808', '80% buah menunjukkan warna masak penuh yang khas', '80% of fruits show typical fully ripe colour'],
    ['89', '809', 'Masak penuh: buah berwarna masak penuh yang khas', 'Fully ripe: fruits have typical fully ripe colour'],
  ]],
  [9, [
    ['97', '907', 'Tanaman mati', 'Plants dead'],
    ['99', '909', 'Produk hasil panen (biji)', 'Harvested product (seeds)'],
  ]],
];

const stages = [];
let n = 400;
for (const [principal, baris] of CUCURBIT) {
  for (const [dua, tiga, id, en, antara] of baris) {
    const map2 = { scheme: 'BBCH', id: dua, relation: 'exact' };
    if (antara) map2.note = CATATAN_ANTARA;
    stages.push({
      id: `op:stg:${String(n++).padStart(8, '0')}`,
      code: dua,
      label: { id, en },
      principal,
      order: Number(dua),
      mappings: [map2, { scheme: 'BBCH', id: tiga, relation: 'exact', note: CATATAN_3DIGIT }],
    });
  }
}

const doc = {
  $schema: '../schema/stage-scale.schema.json',
  id: 'op:sca:00000005',
  key: 'bbch-cucurbit',
  label: { id: 'BBCH — Cucurbit (semangka, melon, mentimun, labu)', en: 'BBCH scale — cucurbits' },
  definition: {
    id: 'Skala fenologi BBCH untuk kelompok cucurbit. Sumber menyebut jenis yang dicakupnya satu per satu: mentimun (Cucumis sativus), melon (Cucumis melo), labu dan squash (Cucurbita pepo), serta semangka (Citrullus). Fase utama 3 dan 4 memang tidak dipakai pada kelompok ini, jadi deretnya melompat dari 29 ke 51. Kunci ini menabelkan dua kolom kode sekaligus, 2 digit dan 3 digit; yang jadi entitas fase adalah kolom 2 digit, sedangkan padanan 3 digitnya disimpan sebagai pemetaan kedua pada fase yang sama.',
  },
  basis: 'phenology',
  applies_to: { commodity_kinds: ['crop'], commodities: [] },
  mappings: [{
    scheme: 'BBCH', id: 'bbch-cucurbits', relation: 'exact',
    note: 'Kunci BBCH cucurbit, dirujuk monograf ke Feller dkk. (1995 b).',
  }],
  notes: {
    id: 'Yang belum dibawa: fase yang HANYA ada di kolom 3 digit — daun ke-10 sampai ke-19 pada batang utama (110–119), tunas samping sekunder dan tersier (221–229, 231), serta bakal bunga, bunga, dan buah pada tunas-tunas itu (521, 531, 621, 631, 721, 731). Kolom 2 digit memang tidak membedakannya, dan membawanya berarti membuat entitas fase yang tidak punya padanan di tiga skala lain di repositori ini. Ditinggal sebagai pekerjaan tersendiri, bukan karena tidak ada di sumber. Catatan sumber lain yang layak diingat: monograf menulis "calabash = Cucurbita pepo L. var. giromontiina", padahal giromontiina adalah zukini sementara calabash lazimnya Lagenaria siceraria — nama jenis di sumbernya sendiri tidak rapi, jadi penautan komoditas dilakukan menurut jenis yang jelas disebut, bukan menurut nama umumnya.',
  },
  stages,
  lifecycle: { version: '0.1.0', status: 'draft', created_at: STAMP, review_due: '2027-08-19' },
  provenance: {
    license: 'CC-BY-SA-4.0',
    sources: [{
      title: 'Growth stages of mono- and dicotyledonous plants — BBCH Monograph',
      publisher: 'Federal Biological Research Centre for Agriculture and Forestry (BBA)',
      year: 2001,
      locator: 'Edisi ke-2, disunting Uwe Meier; kunci cucurbit dirujuk ke Feller dkk. (1995 b)',
    }],
  },
  id_blocks: [{ from: 5, to: 5 }],
};

writeFileSync(join(VOCAB, 'stage-scale-bbch-cucurbit.json'), JSON.stringify(doc, null, 2) + '\n');
const per = new Map();
for (const s of stages) per.set(s.principal, (per.get(s.principal) ?? 0) + 1);
console.log(`stage-scale-bbch-cucurbit.json: ${stages.length} fase — ${[...per].map(([p, c]) => `${p}:${c}`).join(' ')} | stg 0400–${stages.at(-1).id.slice(-4)}`);
