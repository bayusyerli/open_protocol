// Menyusun lima kunci BBCH berikutnya dari sumber primer yang sama:
//   daun-tak-berkrop  op:sca:00000011  fase 1000-1099  Feller dkk., 1995 a
//   brassica-lain     op:sca:00000012  fase 1100-1199  Feller dkk., 1995 a
//   umbi-batang       op:sca:00000013  fase 1200-1299  Feller dkk., 1995 a
//   buncis            op:sca:00000014  fase 1300-1399  Feller dkk., 1995 b
//   kacang-tanah      op:sca:00000015  fase 1400-1499  Munger dkk., 1998 a
//
// Sumber: BBCH Monograph edisi ke-2 (2001), disunting Uwe Meier, Federal
// Biological Research Centre for Agriculture and Forestry. Teks Inggris sumber
// disimpan apa adanya di label.en, TERMASUK salah ketiknya, yang ditandai pada
// mappings.note fase bersangkutan.
//
// Jalankan dari akar repositori:  node spec/tools/bangun-skala-bbch-sayuran.mjs

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const VOCAB = join(dirname(fileURLToPath(import.meta.url)), '..', 'vocab');
const STAMP = '2026-08-19T00:00:00Z';
const ANTARA = 'Kode antara. Mengikuti pola deret ke-n pada sistem BBCH; tidak ditabelkan terpisah di sumber.';
const sumber = (locator) => [{
  title: 'Growth stages of mono- and dicotyledonous plants — BBCH Monograph',
  publisher: 'Federal Biological Research Centre for Agriculture and Forestry (BBA)',
  year: 2001,
  locator: `Edisi ke-2, disunting Uwe Meier; ${locator}`,
}];

const seri = (dari, sampai, id, en) => Array.from({ length: sampai - dari + 1 }, (_, i) => {
  const n = dari + i; return [String(n), id(n % 10), en(n % 10), 'antara'];
});
const persen = (dari, sampai, id, en) => Array.from({ length: sampai - dari + 1 }, (_, i) => {
  const n = dari + i, p = (n % 10) * 10; return [String(n), id(p), en(p), 'antara'];
});

// blok yang berulang di beberapa kunci sayuran Feller
const AWAL = [
  ['00', 'Benih kering', 'Dry seed'],
  ['01', 'Awal imbibisi benih', 'Beginning of seed imbibition'],
  ['03', 'Imbibisi benih selesai', 'Seed imbibition complete'],
  ['05', 'Radikula muncul dari benih', 'Radicle emerged from seed'],
  ['07', 'Hipokotil bersama kotiledon menembus kulit benih', 'Hypocotyl with cotyledons breaking through seed coat'],
  ['09', 'Kemunculan: kotiledon menembus permukaan tanah', 'Emergence: cotyledons break through soil surface'],
];
const DAUN = [
  ['10', 'Kotiledon membuka penuh; titik tumbuh atau bakal daun sejati tampak', 'Cotyledons completely unfolded; growing point or true leaf initial visible'],
  ['11', 'Daun sejati pertama membuka', 'First true leaf unfolded'],
  ['12', 'Daun sejati ke-2 membuka', '2nd true leaf unfolded'],
  ['13', 'Daun sejati ke-3 membuka', '3rd true leaf unfolded'],
  ...seri(14, 18, (n) => `Daun sejati ke-${n} membuka`, (n) => `${n}th true leaf unfolded`),
  ['19', '9 daun sejati atau lebih membuka', '9 or more true leaves unfolded'],
];
const BUNGA = [
  ['60', 'Bunga pertama mekar, tersebar', 'First flowers open (sporadically)'],
  ['61', 'Awal berbunga: 10% bunga mekar', 'Beginning of flowering: 10% of flowers open'],
  ...persen(62, 64, (p) => `${p}% bunga mekar`, (p) => `${p}% of flowers open`),
  ['65', 'Berbunga penuh: 50% bunga mekar', 'Full flowering: 50% of flowers open'],
  ['67', 'Pembungaan berakhir: sebagian besar mahkota gugur atau kering', 'Flowering finishing: majority of petals fallen or dry'],
  ['69', 'Akhir berbunga', 'End of flowering'],
];
const BUAH = [
  ['71', 'Buah pertama terbentuk', 'First fruits formed'],
  ...persen(72, 78, (p) => `${p}% buah mencapai ukuran khasnya`, (p) => `${p}% of fruits have reached typical size`),
  ['79', 'Buah mencapai ukuran khasnya', 'Fruits have reached typical size'],
];
const TUA = [
  ['92', 'Daun dan tunas mulai berubah warna', 'Leaves and shoots beginning to discolour'],
  ['95', '50% daun kuning atau mati', '50% of leaves yellow or dead'],
  ['97', 'Tanaman mati', 'Plants dead'],
  ['99', 'Produk hasil panen (biji)', 'Harvested product (seeds)'],
];

// --- 1. Sayuran daun tidak berkrop ---
const DAUN_TAK_BERKROP = [
  [0, AWAL],
  [1, DAUN],
  [3, [
    ['33', 'Roset daun mencapai 30% garis tengah yang khas varietas — untuk jenis beroset. Untuk jenis tanpa roset: tunas utama mencapai 30% tinggi yang khas varietas', 'Leaf rosette has reached 30% of the expected diameter typical for the variety / Main shoot has reached 30% of the expected height typical for the variety'],
    ['35', 'Roset daun mencapai 50% garis tengah yang khas varietas. Untuk jenis tanpa roset: tunas utama mencapai 50% tingginya', 'Leaf rosette has reached 50% of the expected diameter typical for the variety / Main shoot has reached 50% of the expected height typical for the variety'],
    ['37', 'Roset daun mencapai 70% garis tengah yang khas varietas. Untuk jenis tanpa roset: tunas utama mencapai 70% tingginya', 'Leaf rosette has reached 70% of the expected diameter typical for the variety / Main shoot has reached 70% of the expected height for the variety'],
    ['39', 'Perkembangan roset selesai. Untuk jenis tanpa roset: tunas utama mencapai tinggi yang khas varietas', 'Rosette development completed / Main shoot has reached the height typical for the variety'],
  ]],
  [4, [
    ['41', '10% bobot daun yang khas varietas tercapai', '10% of the leaf mass typical for the variety reached'],
    ...persen(42, 48, (p) => `${p}% bobot daun yang khas varietas tercapai`, (p) => `${p}% of the leaf mass typical for the variety reached`),
    ['49', 'Bobot daun yang khas varietas tercapai', 'Typical leaf mass reached'],
  ]],
  [5, [
    ['51', 'Tunas utama mulai memanjang — untuk jenis beroset. Untuk jenis tanpa roset: perbungaan utama tampak di antara daun teratas', 'Main shoot begins to elongate / Main inflorescence visible between uppermost leaves'],
    ['53', '30% tinggi tunas utama yang diharapkan tercapai', '30% of the expected height of the main shoot reached'],
    ['55', 'Bunga pertama perbungaan utama tampak, masih tertutup', 'First individual flowers of main inflorescence visible (still closed)'],
    ['59', 'Mahkota bunga pertama tampak; bunga masih tertutup', 'First flower petals visible; flowers still closed'],
  ]],
  [6, BUNGA],
  [7, BUAH],
  [8, [
    ['81', 'Awal pemasakan: 10% buah masak, atau 10% biji berwarna khas, kering dan keras', 'Beginning of ripening: 10% of fruits ripe, or 10% of seeds of typical colour, dry and hard'],
    ['82', '20% buah masak, atau 20% biji berwarna khas, kering dan keras', '20% of fruits ripe, or 20% of seeds of typical colour, dry and hard'],
    ['83', '30% buah masak, atau 30% biji berwarna khas, kering dan keras', '30% of fruits ripe, or 20% of seeds of typical colour, dry and hard', 'salahketik'],
    ['84', '40% buah masak, atau 40% biji berwarna khas, kering dan keras', '40% of fruits ripe, or 20% of seeds of typical colour, dry and hard', 'salahketik'],
    ['85', '50% buah masak, atau 50% biji berwarna khas, kering dan keras', '50% of fruits ripe, or 50% of seeds of typical colour, dry and hard'],
    ['86', '60% buah masak, atau 60% biji berwarna khas, kering dan keras', '60% of fruits ripe, or 20% of seeds of typical colour, dry and hard', 'salahketik'],
    ['87', '70% buah masak, atau 70% biji berwarna khas, kering dan keras', '70% of fruits ripe, or 20% of seeds of typical colour, dry and hard', 'salahketik'],
    ['88', '80% buah masak, atau 80% biji berwarna khas, kering dan keras', '80% of fruits ripe, or 20% of seeds of typical colour, dry and hard', 'salahketik'],
    ['89', 'Masak penuh: biji pada seluruh tanaman berwarna khas dan keras', 'Fully ripe: seeds on the whole plant of typical colour and hard'],
  ]],
  [9, TUA],
];

// --- 2. Brassica lain ---
const BRASSICA_LAIN = [
  [0, AWAL],
  [1, DAUN],
  [2, [
    ['21', 'Tunas samping pertama tampak — untuk brokoli', 'First side shoot visible (for broccoli)'],
    ['22', 'Tunas samping ke-2 tampak', '2nd side shoot visible'],
    ['23', 'Tunas samping ke-3 tampak', '3rd side shoot visible'],
    ...seri(24, 28, (n) => `Tunas samping ke-${n} tampak`, (n) => `${n}th side shoot visible`),
    ['29', '9 tunas samping atau lebih tampak', '9 or more side shoots visible'],
  ]],
  [3, [
    ['31', 'Tunas utama mencapai 10% tinggi yang khas varietas — untuk kubis brussel', 'Main shoot has reached 10% of the expected height typical for the variety (for brussels sprout)'],
    ...persen(32, 38, (p) => `Tunas utama mencapai ${p}% tinggi yang khas varietas`, (p) => `Main shoot has reached ${p}% of the expected height typical for the variety`),
    ['39', 'Tunas utama mencapai tinggi yang khas varietas', 'Main shoot has reached the height typical for the variety'],
  ]],
  [4, [
    ['41', 'Kubis brussel: kuncup samping mulai berkembang. Kembang kol dan brokoli: massa bunga mulai terbentuk, lebar titik tumbuh > 1 cm', 'Lateral buds begin to develop / Cauliflower heads begin to form; width of growing tip > 1 cm'],
    ['43', 'Kubis brussel: kuncup pertama menutup rapat. Kembang kol dan brokoli: 30% garis tengah massa bunga tercapai', 'First sprouts tightly closed / 30% of the expected head diameter reached'],
    ['45', 'Kubis brussel: 50% kuncup menutup rapat. Kembang kol dan brokoli: 50% garis tengah massa bunga tercapai', '50% of the sprouts tightly closed / 50% of the expected head diameter reached'],
    ['46', 'Kubis brussel: 60% kuncup menutup rapat. Kembang kol dan brokoli: 60% garis tengah tercapai', '60% of the sprouts tightly closed / 60% of the expected head diameter reached'],
    ['47', 'Kubis brussel: 70% kuncup menutup rapat. Kembang kol dan brokoli: 70% garis tengah tercapai', '70% of the sprouts tightly closed / 70% of the expected head diameter reached'],
    ['48', 'Kubis brussel: 80% kuncup menutup rapat. Kembang kol dan brokoli: 80% garis tengah tercapai', '80% of the sprouts tightly closed / 80% of the expected head diameter reached'],
    ['49', 'Kubis brussel: kuncup di bawah tunas ujung menutup rapat. Kembang kol dan brokoli: ukuran dan bentuk khas tercapai, massa bunga menutup rapat', 'Sprouts below terminal bud tightly closed / Typical size and form reached; head tightly closed'],
  ]],
  [5, [
    ['51', 'Kubis brussel: perbungaan utama tampak di antara daun teratas. Kembang kol dan brokoli: cabang perbungaan mulai memanjang', 'Main inflorescence visible between uppermost leaves / Branches of inflorescence begin to elongate'],
    ['55', 'Bunga pertama tampak, masih tertutup', 'First individual flowers visible (still closed)'],
    ['59', 'Mahkota bunga pertama tampak; bunga masih tertutup', 'First flower petals visible; flowers still closed'],
  ]],
  [6, BUNGA],
  [7, BUAH],
  [8, [
    ['81', 'Awal pemasakan: 10% buah masak', 'Beginning of ripening: 10% of fruits ripe'],
    ...persen(82, 88, (p) => `${p}% buah masak`, (p) => `${p}% of fruits ripe`),
    ['89', 'Masak penuh: biji pada seluruh tanaman berwarna khas dan keras', 'Fully ripe: seeds on the whole plant of typical color and hard'],
  ]],
  [9, TUA],
];

// --- 3. Sayuran umbi & batang ---
const UMBI_BATANG = [
  [0, AWAL],
  [1, DAUN],
  [4, [
    ['41', 'Umbi akar mulai membesar (garis tengah > 0,5 cm)', 'Roots beginning to expand (diameter > 0,5 cm)'],
    ...persen(42, 48, (p) => `${p}% garis tengah umbi akar yang diharapkan tercapai`, (p) => `${p}% of the expected root diameter reached`),
    ['49', 'Pembesaran selesai; bentuk dan ukuran umbi akar yang khas tercapai', 'Expansion complete; typical form and size of roots reached'],
  ]],
  [5, [
    ['51', 'Tunas utama mulai memanjang', 'Main shoot begins to elongate'],
    ['53', '30% tinggi tunas utama yang diharapkan tercapai', '30% of the expected height of the main shoot reached'],
    ['55', 'Bunga pertama perbungaan utama tampak, masih tertutup', 'First individual flowers of main inflorescence visible (still closed)'],
    ['57', 'Bunga pertama perbungaan samping tampak, masih tertutup', 'First individual flowers of secondary inflorescences visible (still closed)'],
    ['59', 'Mahkota bunga pertama tampak; bunga masih tertutup', 'First flower petals visible; flowers still closed'],
  ]],
  [6, BUNGA],
  [7, BUAH],
  [8, [
    ['81', 'Awal pemasakan: 10% buah masak, atau 10% biji berwarna khas, kering dan keras', 'Beginning of ripening: 10% of fruits ripe, or 10% of seeds of typical colour, dry and hard'],
    ['85', '50% buah masak, atau 50% biji berwarna khas, kering dan keras', '50% of the fruits ripe, or 50% of seeds of typical colour, dry and hard'],
    ['89', 'Masak penuh: biji pada seluruh tanaman berwarna khas dan keras', 'Fully ripe: seeds on the whole plant of typical colour and hard'],
  ]],
  [9, [
    ['92', 'Daun dan tunas mulai berubah warna', 'Leaves and shoots beginning to discolour'],
    ['95', '50% daun kuning atau mati', '50% of leaves yellow or dead'],
    ['97', 'Tanaman atau bagian di atas tanah mati', 'Plants or above ground parts dead'],
    ['99', 'Produk hasil panen (biji)', 'Harvested product (seeds)'],
  ]],
];

// --- 4. Kacang buncis ---
const BUNCIS = [
  [0, [
    ...AWAL.filter(([c]) => c !== '09'),
    ['08', 'Hipokotil mencapai permukaan tanah; lengkung hipokotil tampak', 'Hypocotyl reaches the soil surface; hypocotyl arch visible'],
    ['09', 'Kemunculan: hipokotil bersama kotiledon menembus permukaan tanah (fase pecah tanah)', 'Emergence: hypocotyl with cotyledons break through soil surface ("cracking stage")'],
  ]],
  [1, [
    ['10', 'Kotiledon membuka penuh', 'Cotyledons completely unfolded'],
    ['12', '2 daun penuh — sepasang daun pertama membuka', '2 full leaves (first leaf pair unfolded)'],
    ['13', 'Daun sejati ke-3 — daun trifoliat pertama — membuka', '3rd true leaf (first trifoliate leaf) unfolded'],
    ...seri(14, 18, (n) => `Daun ke-${n} membuka`, (n) => `${n}th leaf unfolded`),
    ['19', '9 daun atau lebih membuka — 2 daun penuh dan 7 daun trifoliat atau lebih', '9 or more leaves (2 full leaves, 7 or more trifoliate) unfolded'],
  ]],
  [2, [
    ['21', 'Tunas samping pertama tampak', 'First side shoot visible'],
    ['22', 'Tunas samping ke-2 tampak', '2nd side shoot visible'],
    ['23', 'Tunas samping ke-3 tampak', '3rd side shoot visible'],
    ...seri(24, 28, (n) => `Tunas samping ke-${n} tampak`, (n) => `${n}th side shoot visible`),
    ['29', '9 tunas samping atau lebih tampak', '9 or more side shoots visible'],
  ]],
  [5, [
    ['51', 'Kuncup bunga pertama tampak', 'First flower buds visible'],
    ['55', 'Kuncup bunga pertama membesar', 'First flower buds enlarged'],
    ['59', 'Mahkota pertama tampak, bunga masih tertutup', 'First petals visible, flowers still closed'],
  ]],
  [6, [
    ['60', 'Bunga pertama mekar, tersebar dalam populasi', 'First flowers open (sporadically within the population)'],
    ['61', 'Awal berbunga: 10% bunga mekar', 'Beginning of flowering: 10% of flowers open'],
    ...persen(62, 64, (p) => `${p}% bunga mekar`, (p) => `${p}% of flowers open`),
    ['65', 'Berbunga penuh: 50% bunga mekar', 'Full flowering: 50% of flowers open'],
    ['67', 'Pembungaan berakhir: sebagian besar mahkota gugur atau kering', 'Flowering finishing: majority of petals fallen or dry'],
    ['69', 'Akhir berbunga: polong pertama tampak', 'End of flowering: first pods visible'],
  ]],
  [7, [
    ['71', '10% polong mencapai panjang khasnya', '10% of pods have reached typical length'],
    ...persen(72, 74, (p) => `${p}% polong mencapai panjang khasnya`, (p) => `${p}% of pods have reached typical length`),
    ['75', '50% polong mencapai panjang khasnya, biji mulai mengisi', '50% of pods have reached typical length, beans beginning to fill out'],
    ['76', '60% polong mencapai panjang khasnya', '60% of pods have reached typical length'],
    ['77', '70% polong mencapai panjang khasnya, polong masih patah bersih', '70% of pods have reached typical length, pods still break cleanly'],
    ['78', '80% polong mencapai panjang khasnya', '80% of pods have reached typical length'],
    ['79', 'Polong: biji satu per satu mudah terlihat', 'Pods: individual beans easily visible'],
  ]],
  [8, [
    ['81', '10% polong masak, biji keras', '10% of pods ripe (beans hard)'],
    ...persen(82, 84, (p) => `${p}% polong masak, biji keras`, (p) => `${p}% of pods ripe (beans hard)`),
    ['85', '50% polong masak, biji keras', '50% of pods ripe (beans hard)'],
    ...persen(86, 88, (p) => `${p}% polong masak, biji keras`, (p) => `${p}% of pods ripe (beans hard)`),
    ['89', 'Masak penuh: polong masak, biji keras', 'Fully ripe: pods ripe (beans hard)'],
  ]],
  [9, [
    ['97', 'Tanaman mati', 'Plants dead'],
    ['99', 'Produk hasil panen', 'Harvested product'],
  ]],
];

// --- 5. Kacang tanah ---
const KACANG_TANAH = [
  [0, [
    ...AWAL.filter(([c]) => c !== '09'),
    ['08', 'Hipokotil mencapai permukaan tanah; lengkung hipokotil tampak', 'Hypocotyl reaches the soil surface; hypocotyl arch visible'],
    ['09', 'Kemunculan: hipokotil bersama kotiledon muncul di atas permukaan tanah (fase pecah tanah)', 'Emergence: hypocotyl with cotyledons arising above soil surface ("cracking stage")'],
  ]],
  [1, [
    ['10', 'Kotiledon membuka penuh', 'Cotyledons completely unfolded'],
    ['11', 'Daun sejati pertama (majemuk menyirip) membuka', 'First true leaf (pinnate) unfolded'],
    ['12', 'Daun sejati ke-2 (majemuk menyirip) membuka', '2nd true leaf (pinnate) unfolded'],
    ['13', 'Daun sejati ke-3 (majemuk menyirip) membuka', '3rd true leaf (pinnate) unfolded'],
    ...seri(14, 18, (n) => `Daun sejati ke-${n} (majemuk menyirip) membuka`, (n) => `${n}th true leaf (pinnate) unfolded`),
    ['19', '9 daun sejati atau lebih membuka; belum ada tunas samping', '9 or more true leaves unfolded. No side shoots visible'],
  ]],
  [2, [
    ['21', 'Tunas samping ke-1 tampak', '1st side shoot visible'],
    ['22', 'Tunas samping ke-2 tampak', '2nd side shoot visible'],
    ['23', 'Tunas samping ke-3 tampak', '3rd side shoot visible'],
    ...seri(24, 28, (n) => `Tunas samping ke-${n} tampak`, (n) => `${n}th side shoot visible`),
    ['29', '9 tunas samping atau lebih tampak', '9 or more side shoots visible'],
  ]],
  [3, [
    ['31', 'Awal penutupan tajuk: 10% tanaman bertemu antarbarisan', 'Beginning of crop cover: 10% of plants meets between rows'],
    ...persen(32, 38, (p) => `${p}% tanaman bertemu antarbarisan`, (p) => `${p}% of plants meets between rows`),
    ['39', 'Penutupan tajuk selesai: 90% tanaman bertemu antarbarisan', 'Crop cover complete: 90% of plants meets between rows'],
  ]],
  [5, [
    ['51', 'Kuncup perbungaan pertama tampak', 'First inflorescence buds visible'],
    ['55', 'Kuncup bunga tunggal pertama tampak', 'First individual flower buds visible'],
    ['59', 'Mahkota bunga pertama tampak; kuncup masih tertutup', 'First flower petals visible. Flower buds still closed'],
  ]],
  [6, [
    ['61', 'Awal berbunga', 'Beginning of flowering'],
    ['62', 'Ginofor pertama tampak', 'First carpophore pegs visible'],
    ['63', 'Pembungaan berlanjut', 'Continuation of flowering'],
    ['64', 'Ginofor pertama tampak memanjang', 'First carpophore pegs visibly elongated'],
    ['65', 'Berbunga penuh', 'Full flowering'],
    ['66', 'Ginofor pertama menembus tanah', 'First carpophore pegs penetrating the soil'],
    ['67', 'Pembungaan menurun', 'Flowering declining'],
    ['68', 'Ujung ginofor pertama tumbuh mendatar di dalam tanah', 'Tip of first carpophore pegs growing horizontally in the soil'],
    ['69', 'Akhir berbunga', 'End of flowering'],
  ]],
  [7, [
    ['71', 'Awal perkembangan polong: ujung ginofor pertama membengkak, sedikitnya dua kali garis tengah semula', 'Beginning of pod development: tip of first carpophore pegs swollen (at least twice the original diameter)'],
    ['73', 'Perkembangan polong berlanjut, awal pengisian polong: polong pertama mencapai ukuran akhir dan mulai masak', 'Continuation of pod development: beginning of pod filling: first pods have attained final size and are ripening'],
    ['75', 'Fase utama perkembangan polong: pengisian polong berlanjut', 'Main phase of pod development: continuation of pod filling'],
    ['77', 'Pengisian polong lanjut', 'Advanced pod filling'],
    ['79', 'Biji segar memenuhi rongga polong yang sudah mencapai ukuran akhirnya', 'Fresh seeds fill the cavity of the pods which have attained their final size'],
  ]],
  [8, [
    ['81', 'Awal pemasakan: sekitar 10% polong berukuran akhir sudah masak', 'Beginning of ripening: about 10% of pods developed to final size are ripe'],
    ['82', 'Sekitar 20% polong berukuran akhir sudah masak', 'About 20% of pods developed to final size are ripe'],
    ['83', 'Pemasakan berlanjut: sekitar 30% polong berukuran akhir sudah masak', 'Continuation of ripening: about 30% of pods developed to final size are ripe'],
    ['84', 'Sekitar 40% polong berukuran akhir sudah masak', 'About 40% of pods developed to final size are ripe'],
    ['85', 'Fase utama pemasakan: sekitar 50% polong berukuran akhir sudah masak', 'Main phase of ripening: about 50% of pods developed to final size are ripe'],
    ['86', 'Sekitar 60% polong berukuran akhir sudah masak', 'About 60% of pods developed to final size are ripe'],
    ['87', 'Pemasakan lanjut: sekitar 70% polong berukuran akhir sudah masak', 'Advanced ripening: about 70% of pods developed to final size are ripe'],
    ['88', 'Sekitar 80% polong berukuran akhir sudah masak', 'About 80% of pods developed to final size are ripe'],
    ['89', 'Masak penuh: hampir seluruh polong berukuran akhir sudah masak', 'Full maturity: nearly all pods developed to final size are ripe'],
  ]],
  [9, [
    ['91', 'Sekitar 10% bagian tanaman di atas tanah kering', 'About 10% of above ground parts of plant dry'],
    ['92', 'Sekitar 20% bagian tanaman di atas tanah kering', 'About 40% of above ground parts of plant dry', 'salahketik'],
    ['93', 'Sekitar 30% bagian tanaman di atas tanah kering', 'About 30% of above ground parts of plant dry'],
    ['94', 'Sekitar 40% bagian tanaman di atas tanah kering', 'About 40% of above ground parts of plant dry'],
    ['95', 'Sekitar 50% bagian tanaman di atas tanah kering', 'About 50% of above ground parts of plant dry'],
    ['96', 'Sekitar 60% bagian tanaman di atas tanah kering', 'About 60% of above ground parts of plant dry'],
    ['97', 'Bagian tanaman di atas tanah mati', 'Above ground parts of plant dead'],
    ['99', 'Produk hasil panen', 'Harvested product'],
  ]],
];

const SALAH_KETIK = 'Sumber menulis persentase yang tidak runtut pada kode ini — jelas salah ketik pada monografnya. Teks Inggris disalin apa adanya di label.en; label Indonesia memakai angka yang runtut dengan deretnya.';

function bangun(tabel, dariId) {
  const out = []; let n = dariId;
  for (const [principal, baris] of tabel) {
    for (const [code, id, en, tanda] of baris) {
      const map = { scheme: 'BBCH', id: code, relation: 'exact' };
      if (tanda === 'antara') map.note = ANTARA;
      if (tanda === 'salahketik') map.note = SALAH_KETIK;
      out.push({ id: `op:stg:${String(n++).padStart(8, '0')}`, code, label: { id, en }, principal, order: Number(code), mappings: [map] });
    }
  }
  return out;
}

const BERKAS = [
  ['stage-scale-bbch-daun-tak-berkrop.json', {
    id: 'op:sca:00000011', key: 'bbch-daun-tak-berkrop', stg: 1000, tabel: DAUN_TAK_BERKROP,
    label: { id: 'BBCH — Sayuran daun tidak berkrop (sawi, caisim, pak choi, selada daun)', en: 'BBCH scale — leaf vegetables not forming heads' },
    definition: { id: 'Skala fenologi BBCH untuk sayuran daun yang TIDAK membentuk krop. Sumber menyebut tiga jenis sebagai contoh — bayam eropa (Spinacia oleracea), selada daun (Lactuca sativa var. crispa), dan kale (Brassica oleracea var. sabellica) — tetapi catatan kakinya menyebut cakupannya lebih luas: "jenis dengan pertumbuhan beroset" dan "jenis tanpa pertumbuhan roset". Karena itu sawi, caisim, dan pak choi ditautkan ke sini, bukan ke kunci sayuran daun berkrop. Fase utama 2 tidak dipakai; panen konsumsi terjadi pada fase 49.' },
    mapId: 'bbch-leaf-vegetables-not-heading', mapNote: 'Kunci BBCH sayuran daun tidak berkrop, dirujuk monograf ke Feller dkk. (1995 a).',
    notes: { id: 'Fase 33–39 dan 51 punya dua bacaan: satu untuk jenis beroset (selada daun, bayam eropa), satu untuk jenis tanpa roset (kale dan sejenisnya). Keduanya disalin ke dalam satu label. Monografnya salah ketik pada fase 83, 84, 86, 87, dan 88 — kelimanya menulis "atau 20% biji" padahal deretnya jelas 30%, 40%, 60%, 70%, dan 80%. Teks Inggris disalin apa adanya, label Indonesia memakai angka yang runtut, dan tiap fase membawa penandanya.' },
    locator: 'kunci sayuran daun tidak berkrop dirujuk ke Feller dkk. (1995 a)',
  }],
  ['stage-scale-bbch-brassica-lain.json', {
    id: 'op:sca:00000012', key: 'bbch-brassica-lain', stg: 1100, tabel: BRASSICA_LAIN,
    label: { id: 'BBCH — Brassica lain (kembang kol, brokoli, kubis brussel)', en: 'BBCH scale — other brassica vegetables' },
    definition: { id: 'Skala fenologi BBCH untuk brassica yang dipanen bunga atau kuncupnya: kubis brussel (Brassica oleracea var. gemmifera), kembang kol (var. botrytis), dan brokoli (var. italica). Fase utama 4 punya dua bacaan berdampingan — perkembangan kuncup samping untuk kubis brussel, pembentukan massa bunga untuk kembang kol dan brokoli — dan keduanya disalin ke dalam satu label.' },
    mapId: 'bbch-other-brassica', mapNote: 'Kunci BBCH brassica lain, dirujuk monograf ke Feller dkk. (1995 a).',
    notes: { id: 'Fase utama 2 hanya berlaku untuk brokoli, fase utama 3 hanya untuk kubis brussel, dan fase 41–49 serta 51 punya bacaan berbeda menurut jenisnya. Kode 42 dan 44 tidak ada di sumber. Panen konsumsi terjadi pada fase 49; fase 5 sampai 8 hanya terjadi pada tanaman yang dibiarkan berbunga untuk produksi benih.' },
    locator: 'kunci brassica lain dirujuk ke Feller dkk. (1995 a)',
  }],
  ['stage-scale-bbch-umbi-batang.json', {
    id: 'op:sca:00000013', key: 'bbch-umbi-batang', stg: 1200, tabel: UMBI_BATANG,
    label: { id: 'BBCH — Sayuran umbi & batang (wortel, lobak, kohlrabi)', en: 'BBCH scale — root and stem vegetables' },
    definition: { id: 'Skala fenologi BBCH untuk sayuran yang dipanen umbi akar atau batangnya. Sumber menyebut jenis cakupannya satu per satu: wortel (Daucus carota ssp. sativus), seledri umbi (Apium graveolens var. rapaceum), kohlrabi (Brassica oleracea var. gongylodes), witloof (Cichorium intybus var. foliosum), lobak (Raphanus sativus), swede (Brassica napus ssp. rapifera), dan scorzonera (Scorzonera hispanica). Fase utama 2 dan 3 tidak dipakai; pembesaran umbi ada di fase utama 4, dan panen konsumsi terjadi pada fase 49.' },
    mapId: 'bbch-root-stem-vegetables', mapNote: 'Kunci BBCH sayuran umbi dan batang, dirujuk monograf ke Feller dkk. (1995 a).',
    notes: { id: 'Bit tidak masuk kunci ini walau umbinya mirip: monograf memberinya kunci tersendiri (Beet, Meier dkk. 1993) yang belum disalin. Judul fase utama 8 pada monograf tertulis "Rispening" — salah ketik untuk "Ripening". Fase 8 hanya memuat tiga kode: 81, 85, dan 89.' },
    locator: 'kunci sayuran umbi dan batang dirujuk ke Feller dkk. (1995 a)',
  }],
  ['stage-scale-bbch-buncis.json', {
    id: 'op:sca:00000014', key: 'bbch-buncis', stg: 1300, tabel: BUNCIS,
    label: { id: 'BBCH — Buncis (Phaseolus vulgaris)', en: 'BBCH scale — bean' },
    definition: { id: 'Skala fenologi BBCH untuk buncis, Phaseolus vulgaris var. nanus. Kunci ini menyebut Phaseolus, BUKAN Vigna — kacang panjang, kacang tunggak, dan kacang hijau adalah Vigna dan tidak tercakup. Fase utama 3 dan 4 tidak dipakai. Kode 11 tidak ada: deret daun melompat dari 10 ke 12 karena buncis membuka sepasang daun tunggal lebih dulu sebelum daun trifoliat pertama.' },
    mapId: 'bbch-bean', mapNote: 'Kunci BBCH buncis, dirujuk monograf ke Feller dkk. (1995 b).',
    notes: { id: 'Sumber memberi bacaan kedua untuk sebagian kode pada fase 6 sampai 8, ditujukan bagi varietas yang masa berbunganya tidak terbatas: kode 61 "awal berbunga", 65 "periode utama berbunga", 71 "awal perkembangan polong", 75 "periode utama perkembangan polong", 81 "biji mulai masak", 85 "periode utama pemasakan". Yang disalin bacaan untuk varietas bermasa berbunga terbatas; bacaan kedua belum dimodelkan sebagai fase terpisah.' },
    locator: 'kunci buncis dirujuk ke Feller dkk. (1995 b)',
  }],
  ['stage-scale-bbch-kacang-tanah.json', {
    id: 'op:sca:00000015', key: 'bbch-kacang-tanah', stg: 1400, tabel: KACANG_TANAH,
    label: { id: 'BBCH — Kacang tanah (Arachis hypogaea)', en: 'BBCH scale — peanut' },
    definition: { id: 'Skala fenologi BBCH untuk kacang tanah. Fase utama 6 kunci ini tidak hanya menggambarkan pembungaan, melainkan juga perjalanan ginofor — tangkai buah yang tumbuh dari bunga, memanjang, lalu menembus tanah tempat polong terbentuk. Kode 62, 64, 66, dan 68 seluruhnya tentang ginofor, dan tanpa itu perkembangan polong kacang tanah tidak bisa dijadwalkan. Fase utama 4 tidak dipakai.' },
    mapId: 'bbch-peanut', mapNote: 'Kunci BBCH kacang tanah, dirujuk monograf ke Munger dkk. (1998 a).',
    notes: { id: 'Daun dihitung dari buku kotiledon (= buku 0). Monografnya salah ketik pada fase 92: tertulis "About 40%" padahal deretnya 10-20-30-40 dan kode 94 juga "About 40%". Teks Inggris disalin apa adanya, label Indonesia memakai 20% yang runtut, dan fasenya membawa penanda. Kriteria masak menurut sumber: perikarp keras dengan tekstur jelas dan mudah dibelah, kulit ari kering berwarna gelap khas kultivar.' },
    locator: 'kunci kacang tanah dirujuk ke Munger dkk. (1998 a)',
  }],
];

let total = 0;
for (const [nama, k] of BERKAS) {
  const stages = bangun(k.tabel, k.stg);
  if (stages.length > 100) throw new Error(`${nama}: ${stages.length} fase melampaui blok.`);
  const nomor = Number(k.id.slice(-2));
  const doc = {
    $schema: '../schema/stage-scale.schema.json',
    id: k.id, key: k.key, label: k.label, definition: k.definition,
    basis: 'phenology',
    applies_to: { commodity_kinds: ['crop'], commodities: [] },
    mappings: [{ scheme: 'BBCH', id: k.mapId, relation: 'exact', note: k.mapNote }],
    notes: k.notes, stages,
    lifecycle: { version: '0.1.0', status: 'draft', created_at: STAMP, review_due: '2027-08-19' },
    provenance: { license: 'CC-BY-SA-4.0', sources: sumber(k.locator) },
    id_blocks: [{ from: nomor, to: nomor }],
  };
  writeFileSync(join(VOCAB, nama), JSON.stringify(doc, null, 2) + '\n');
  const per = new Map();
  for (const s of stages) per.set(s.principal, (per.get(s.principal) ?? 0) + 1);
  console.log(`${nama.padEnd(40)} ${String(stages.length).padStart(3)} fase — ${[...per].map(([p, c]) => `${p}:${c}`).join(' ')}`);
  total += stages.length;
}
console.log(`\nTotal fase baru: ${total}`);
