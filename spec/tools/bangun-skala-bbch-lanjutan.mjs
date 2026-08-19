// Menyusun lima skala fase BBCH berikutnya dari sumber primer yang sama:
//   kedelai   op:sca:00000006  fase op:stg:00000500-599  Munger dkk., 1997
//   kentang   op:sca:00000007  fase op:stg:00000600-699  Hack dkk., 1993
//   kopi      op:sca:00000008  fase op:stg:00000700-799  Arcila-Pulgarín dkk.
//   bawang    op:sca:00000009  fase op:stg:00000800-899  Feller dkk., 1995 a
//   kubis     op:sca:00000010  fase op:stg:00000900-999  Feller dkk., 1995 a
//
// Sumber: BBCH Monograph edisi ke-2 (2001), disunting Uwe Meier, Federal
// Biological Research Centre for Agriculture and Forestry. Teks Inggris sumber
// disimpan apa adanya di label.en supaya terjemahannya bisa diperiksa.
//
// Kunci yang menabelkan dua kolom kode (kedelai, kentang, bawang) diperlakukan
// seperti kunci cucurbit: kolom 2 digit jadi entitas fase, padanan 3 digitnya
// jadi pemetaan kedua. Kunci kopi dan kubis hanya punya kolom 2 digit.
//
// Jalankan dari akar repositori:  node spec/tools/bangun-skala-bbch-lanjutan.mjs

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const VOCAB = join(dirname(fileURLToPath(import.meta.url)), '..', 'vocab');
const STAMP = '2026-08-19T00:00:00Z';
const ANTARA = 'Kode antara. Mengikuti pola deret ke-n pada sistem BBCH; tidak ditabelkan terpisah di sumber.';
const TIGA = 'Padanan kode 3 digit pada kunci yang sama; menunjuk fase yang sama.';
const sumber = (locator) => [{
  title: 'Growth stages of mono- and dicotyledonous plants — BBCH Monograph',
  publisher: 'Federal Biological Research Centre for Agriculture and Forestry (BBA)',
  year: 2001,
  locator: `Edisi ke-2, disunting Uwe Meier; ${locator}`,
}];

// baris: [kode, id, en] atau [kode, id, en, 'antara']
const seri = (dari, sampai, id, en) =>
  Array.from({ length: sampai - dari + 1 }, (_, i) => {
    const n = dari + i;
    return [String(n), id(n % 10), en(n % 10), 'antara'];
  });
const persen = (dari, sampai, id, en) =>
  Array.from({ length: sampai - dari + 1 }, (_, i) => {
    const n = dari + i, p = (n % 10) * 10;
    return [String(n), id(p), en(p), 'antara'];
  });

const KEDELAI = [
  [0, [
    ['00', 'Benih kering', 'Dry seed'],
    ['01', 'Awal imbibisi benih', 'Beginning of seed imbibition'],
    ['03', 'Imbibisi benih selesai', 'Seed imbibition complete'],
    ['05', 'Radikula muncul dari benih', 'Radicle emerged from seed'],
    ['06', 'Radikula memanjang, bulu akar terbentuk', 'Elongation of radicle; formation of root hairs'],
    ['07', 'Hipokotil bersama kotiledon menembus kulit benih', 'Hypocotyl with cotyledons breaking through seed coat'],
    ['08', 'Hipokotil mencapai permukaan tanah, lengkung hipokotil tampak', 'Hypocotyl reaches the soil surface; hypocotyl arch visible'],
    ['09', 'Kemunculan: hipokotil bersama kotiledon muncul di atas permukaan tanah (fase pecah tanah)', 'Emergence: hypocotyl with cotyledons emerged above soil surface ("cracking stage")'],
  ]],
  [1, [
    ['10', 'Kotiledon membuka penuh', 'Cotyledons completely unfolded'],
    ['11', 'Sepasang daun sejati pertama membuka — daun tunggal pada buku pertama', 'First pair of true leaves unfolded (unifoliolate leaves on the first node)'],
    ['12', 'Daun trifoliolat pada buku ke-2 membuka', 'Trifoliolate leaf on the 2nd node unfolded'],
    ['13', 'Daun trifoliolat pada buku ke-3 membuka', 'Trifoliolate leaf on the 3rd node unfolded'],
    ...seri(14, 18, (n) => `Daun trifoliolat pada buku ke-${n} membuka`, (n) => `Trifoliolate leaf on the ${n}th node unfolded`),
    ['19', 'Daun trifoliolat pada buku ke-9 membuka; belum ada tunas samping', 'Trifoliolate leaf on the 9th node unfolded. No side shoots visible'],
  ]],
  [2, [
    ['21', 'Tunas samping pertama tampak', 'First side shoot visible'],
    ['22', 'Tunas samping ordo pertama ke-2 tampak', '2nd side shoot of first order visible'],
    ['23', 'Tunas samping ordo pertama ke-3 tampak', '3rd side shoot of first order visible'],
    ...seri(24, 28, (n) => `Tunas samping ordo pertama ke-${n} tampak`, (n) => `${n}th side shoot of first order visible`),
    ['29', '9 tunas samping ordo pertama atau lebih tampak', '9 or more side shoots of first order visible'],
  ]],
  [4, [
    ['49', 'Bagian vegetatif yang dipanen mencapai ukuran akhir — pemotongan tanaman kedelai untuk pakan', 'Harvestable vegetative plant parts have reached final size (Cutting of soybean plants for feeding purposes)'],
  ]],
  [5, [
    ['51', 'Kuncup bunga pertama tampak', 'First flower buds visible'],
    ['55', 'Kuncup bunga pertama membesar', 'First flower buds enlarged'],
    ['59', 'Mahkota bunga pertama tampak, kuncup masih tertutup', 'First flower petals visible; flower buds still closed'],
  ]],
  [6, [
    ['60', 'Bunga pertama mekar, tersebar dalam populasi', 'First flowers opened (sporadically in population)'],
    ['61', 'Awal berbunga: sekitar 10% bunga mekar', 'Beginning of flowering: about 10% of flowers open'],
    ...persen(62, 64, (p) => `Sekitar ${p}% bunga mekar`, (p) => `About ${p}% of flowers open`),
    ['65', 'Berbunga penuh: sekitar 50% bunga mekar', 'Full flowering: about 50% of flowers open'],
    ['66', 'Sekitar 60% bunga mekar', 'About 60% of flowers open'],
    ['67', 'Pembungaan menurun', 'Flowering declining'],
    ['69', 'Akhir berbunga: polong pertama tampak, panjang sekitar 5 mm', 'End of flowering: first pods visible (approx. 5 mm length)'],
  ]],
  [7, [
    ['70', 'Polong pertama mencapai panjang akhir (15–20 mm)', 'First pod reached final length (15–20 mm)'],
    ['71', 'Sekitar 10% polong mencapai panjang akhir (15–20 mm) — awal perkembangan polong', 'About 10% of pods have reached final length (15–20 mm); Beginning of pod development'],
    ['72', 'Sekitar 20% polong mencapai panjang akhir (15–20 mm)', 'About 20% of pods have reached final length (15–20 mm)'],
    ['73', 'Sekitar 30% polong mencapai panjang akhir (15–20 mm) — awal pengisian polong', 'About 30% of pods have reached final length (15–20 mm); Beginning of pod filling'],
    ['74', 'Sekitar 40% polong mencapai panjang akhir (15–20 mm)', 'About 40% of pods have reached final length (15–20 mm)'],
    ['75', 'Sekitar 50% polong mencapai panjang akhir (15–20 mm), pengisian polong berlanjut', 'About 50% of pods have reached final length (15–20 mm). Continuation of pod filling'],
    ['77', 'Sekitar 70% polong mencapai panjang akhir (15–20 mm), pengisian polong lanjut', 'About 70% of pods have reached final length (15–20 mm); Advanced pod filling'],
    ['79', 'Hampir seluruh polong mencapai panjang akhir (15–20 mm), biji memenuhi rongga sebagian besar polong', 'Approx. all pods have reached final length (15–20 mm). Seeds filling the cavity of the majority of pods'],
  ]],
  [8, [
    ['80', 'Polong pertama masak, biji berwarna akhir, kering dan keras', 'First pod ripe, beans final colour, dry and hard'],
    ['81', 'Awal pemasakan: sekitar 10% polong masak, biji berwarna akhir, kering dan keras', 'Beginning of ripening; about 10% of pods are ripe, beans final colour, dry and hard'],
    ...persen(82, 84, (p) => `Sekitar ${p}% polong masak, biji berwarna akhir, kering dan keras`, (p) => `About ${p}% of pods are ripe; beans final colour, dry and hard`),
    ['85', 'Pemasakan lanjut: sekitar 50% polong masak, biji berwarna akhir, kering dan keras', 'Advanced ripening; about 50% of pods are ripe; beans final colour, dry and hard'],
    ...persen(86, 88, (p) => `Sekitar ${p}% polong masak, biji berwarna akhir, kering dan keras`, (p) => `About ${p}% of pods are ripe; beans final colour, dry and hard`),
    ['89', 'Masak penuh: hampir seluruh polong masak, biji berwarna akhir, kering dan keras — masak panen', 'Full maturity: approx. all pods are ripe; beans final colour, dry and hard (= Harvest maturity)'],
  ]],
  [9, [
    ['91', 'Sekitar 10% daun berubah warna atau gugur', 'About 10% of leaves discoloured or fallen'],
    ...persen(92, 96, (p) => `Sekitar ${p}% daun berubah warna atau gugur`, (p) => `About ${p}% of leaves discoloured or fallen`),
    ['97', 'Bagian tanaman di atas tanah mati', 'Above ground parts of plants dead'],
    ['99', 'Produk hasil panen (biji)', 'Harvested product (seeds)'],
  ]],
];

const KENTANG = [
  [0, [
    ['00', 'Dari umbi: dormansi alami atau paksa, umbi belum bertunas. Dari biji: benih kering', 'From tuber: Innate or enforced dormancy, tuber not sprouted / From seed: Dry seed'],
    ['01', 'Dari umbi: awal bertunas, tunas tampak (< 1 mm). Dari biji: awal imbibisi benih', 'From tuber: Beginning of sprouting: sprouts visible (< 1 mm) / From seed: Beginning of seed imbibition'],
    ['02', 'Dari umbi: tunas tegak (< 2 mm)', 'From tuber: Sprouts upright (< 2 mm)'],
    ['03', 'Dari umbi: akhir dormansi, tunas 2–3 mm. Dari biji: imbibisi benih selesai', 'From tuber: End of dormancy: sprouts 2–3 mm / From seed: Seed imbibition complete'],
    ['05', 'Dari umbi: awal pembentukan akar. Dari biji: radikula muncul dari benih', 'From tuber: Beginning of root formation / From seed: Radicle (root) emerged from seed'],
    ['07', 'Dari umbi: awal pembentukan batang. Dari biji: hipokotil bersama kotiledon menembus kulit benih', 'From tuber: Beginning of stem formation / From seed: Hypocotyl with cotyledons breaking through seed coat'],
    ['08', 'Dari umbi: batang tumbuh ke arah permukaan tanah, terbentuk daun sisik yang ketiaknya kelak menumbuhkan stolon. Dari biji: hipokotil bersama kotiledon tumbuh ke arah permukaan tanah', 'From tuber: Stems growing towards soil surface, formation of scale leaves in the axils of which stolons will develop later / From seed: Hypocotyl with cotyledons growing towards soil surface'],
    ['09', 'Kemunculan — dari umbi: batang menembus permukaan tanah. Dari biji: kotiledon menembus permukaan tanah', 'Emergence: stems break through soil surface / Emergence: cotyledons break through soil surface'],
  ]],
  [1, [
    ['10', 'Dari umbi: daun pertama mulai memanjang. Dari biji: kotiledon membuka penuh', 'From tuber: first leaves begin to extend / From seed: cotyledons completely unfolded'],
    ['11', 'Daun ke-1 batang utama membuka (> 4 cm)', '1st leaf of main stem unfolded (> 4 cm)'],
    ['12', 'Daun ke-2 batang utama membuka (> 4 cm)', '2nd leaf of main stem unfolded (> 4 cm)'],
    ['13', 'Daun ke-3 batang utama membuka (> 4 cm)', '3rd leaf of main stem unfolded (> 4 cm)'],
    ...seri(14, 18, (n) => `Daun ke-${n} batang utama membuka (> 4 cm)`, (n) => `${n}th leaf of main stem unfolded (> 4 cm)`),
    ['19', '9 daun batang utama atau lebih membuka (> 4 cm)', '9 or more leaves of main stem unfolded (> 4 cm)'],
  ]],
  [2, [
    ['21', 'Tunas samping basal pertama tampak (> 5 cm)', 'First basal side shoot visible (> 5 cm)'],
    ['22', 'Tunas samping basal ke-2 tampak (> 5 cm)', '2nd basal side shoot visible (> 5 cm)'],
    ['23', 'Tunas samping basal ke-3 tampak (> 5 cm)', '3rd basal side shoot visible (> 5 cm)'],
    ...seri(24, 28, (n) => `Tunas samping basal ke-${n} tampak (> 5 cm)`, (n) => `${n}th basal side shoot visible (> 5 cm)`),
    ['29', '9 tunas samping basal atau lebih tampak (> 5 cm)', '9 or more basal side shoots visible (> 5 cm)'],
  ]],
  [3, [
    ['31', 'Awal penutupan tajuk: 10% tanaman bertemu antarbarisan', 'Beginning of crop cover: 10% of plants meet between rows'],
    ...persen(32, 38, (p) => `${p}% tanaman bertemu antarbarisan`, (p) => `${p}% of plants meet between rows`),
    ['39', 'Penutupan tajuk selesai: sekitar 90% tanaman bertemu antarbarisan', 'Crop cover complete: about 90% of plants meet between rows'],
  ]],
  [4, [
    ['40', 'Inisiasi umbi: ujung stolon pertama membengkak jadi dua kali garis tengah stolonnya', 'Tuber initiation: swelling of first stolon tips to twice the diameter of subtending stolon'],
    ...persen(41, 47, (p) => `${p}% dari total bobot umbi akhir tercapai`, (p) => `${p}% of total final tuber mass reached`),
    ['48', 'Bobot umbi total maksimum tercapai, umbi mudah lepas dari stolon, kulit belum mengeras — masih bisa dikelupas dengan ibu jari', 'Maximum of total tuber mass reached, tubers detach easily from stolons, skin set not yet complete (skin easily removable with thumb)'],
    ['49', 'Kulit umbi mengeras sempurna — tidak bisa dikelupas dengan ibu jari pada ujung apikal; 95% umbi pada fase ini', 'Skin set complete: (skin at apical end of tuber not removable with thumb) 95% of tubers in this stage'],
  ]],
  [5, [
    ['51', 'Kuncup pertama perbungaan pertama tampak (1–2 mm) pada batang utama', 'First individual buds (1–2 mm) of first inflorescence visible (main stem)'],
    ['55', 'Kuncup perbungaan pertama memanjang sampai 5 mm', 'Buds of first inflorescence extended to 5 mm'],
    ['59', 'Mahkota bunga pertama pada perbungaan pertama tampak', 'First flower petals of first inflorescence visible'],
  ]],
  [6, [
    ['60', 'Bunga pertama mekar dalam populasi', 'First open flowers in population'],
    ['61', 'Awal berbunga: 10% bunga pada perbungaan pertama mekar (batang utama)', 'Beginning of flowering: 10% of flowers in the first inflorescence open (main stem)'],
    ...persen(62, 64, (p) => `${p}% bunga pada perbungaan pertama mekar`, (p) => `${p}% of flowers in the first inflorescence open`),
    ['65', 'Berbunga penuh: 50% bunga pada perbungaan pertama mekar', 'Full flowering: 50% of flowers in the first inflorescence open'],
    ...persen(66, 68, (p) => `${p}% bunga pada perbungaan pertama mekar`, (p) => `${p}% of flowers in the first inflorescence open`),
    ['69', 'Akhir berbunga pada perbungaan pertama', 'End of flowering in the first inflorescence'],
  ]],
  [7, [
    ['70', 'Buah beri pertama tampak', 'First berries visible'],
    ['71', '10% buah beri pada pembuahan pertama mencapai ukuran penuh (batang utama)', '10% of berries in the first fructification have reached full size (main stem)'],
    ...persen(72, 78, (p) => `${p}% buah beri pada pembuahan pertama mencapai ukuran penuh`, (p) => `${p}% of berries in the first fructification have reached full size`),
    ['79', 'Hampir seluruh buah beri pada pembuahan pertama mencapai ukuran penuh atau sudah gugur', 'Nearly all berries in the first fructification have reached full size (or have been shed)'],
  ]],
  [8, [
    ['81', 'Buah beri pada pembuahan pertama masih hijau, biji berwarna terang (batang utama)', 'Berries in the first fructification still green, seed light-coloured (main stem)'],
    ['85', 'Buah beri pada pembuahan pertama berwarna oker atau kecoklatan', 'Berries in the first fructification ochre-coloured or brownish'],
    ['89', 'Buah beri pada pembuahan pertama mengerut, biji berwarna gelap', 'Berries in the first fructification shrivelled, seed dark'],
  ]],
  [9, [
    ['91', 'Awal daun menguning', 'Beginning of leaf yellowing'],
    ['93', 'Sebagian besar daun menguning', 'Most of the leaves yellowish'],
    ['95', '50% daun kecoklatan', '50% of the leaves brownish'],
    ['97', 'Daun dan batang mati, batang memucat dan kering', 'Leaves and stem dead, stems bleached and dry'],
    ['99', 'Produk hasil panen', 'Harvested product'],
  ]],
];

const KOPI = [
  [0, [
    ['00', 'Benih kering, kadar air 11–12%, berwarna krem bila kulit tanduk masih ada atau hijau kebiruan bila kulit tanduk dan kulit ari dilepas. Setek satu buku sepanjang 60 mm dengan dua daun dipangkas separuh. Stum berbuku tebal tanpa tunas', 'Dry seed (11-12% moisture content), beige color if parchment present or bluish-green if parchment and silver skin removed. Cutting (orthotropic, mononodal, 60 mm long, two half trimmed leaves). Stump with bulky nodes and no buds visible'],
    ['01', 'Awal imbibisi benih, biji membengkak, keputihan, radikula belum tampak. Setek sudah ditanam di media perakaran, belum ada tunas maupun kalus', 'Beginning of seed imbibition, bean swollen, whitish, no radicle visible. Cutting planted in rooting media, no shoots visible, no callus visible'],
    ['02', 'Imbibisi benih selesai, biji keputihan, ada pembengkakan kecil di ujung tempat embrio berada. Kalus mulai terbentuk pada setek; tunas mulai pecah pada stum', 'Seed imbibition complete, bean whitish, small swelling visible at one end of bean where the embryo is located. Callus formation begins on cuttings. Bud burst start on stumps'],
    ['05', 'Radikula benih menyembul dan melengkung. Tunas dan akar terbentuk pada setek; tunas hijau membulat tampak pada stum', 'Seed radicle protrusion and hooking. Shoot and root formation on the cuttings. Green, rounded buds visible on the stumps'],
    ['06', 'Radikula memanjang, bulu akar dan akar lateral terbentuk pada benih maupun setek', 'Elongation of radicle, formation of root hairs and lateral roots on seeds and cuttings'],
    ['07', 'Hipokotil bersama kotiledon menembus kulit benih. Setek sudah membentuk tunas dan akar bercabang', 'Hypocotyl with cotyledons breaking through the seed coat. Cuttings have formed shoots and branched roots'],
    ['09', 'Kemunculan: benih muncul dari tanah dengan hipokotil dan kotiledon masih terbungkus kulit tanduk. Setek berakar 6–7 cm dengan tunas 1–2 buku. Stum menumbuhkan tunas dengan bakal daun pertama', 'Emergence: Seeds have emerged from soil and show the hypocotile with cotyledons still enclosed in the parchment. The cuttings present roots 6-7 cm. long and shoots with 1-2 nodes. Stumps show sprouts with first leaf initials'],
  ]],
  [1, [
    ['10', 'Kotiledon membuka penuh; sepasang daun sejati pertama memisah pada tunas atau pada cabang pohon kopi', 'Cotyledons completely unfolded. First pair of true leaves separating on shoot or first pair of true leaves separating on branch of the coffee tree'],
    ['11', 'Sepasang daun pertama membuka, belum berukuran penuh; daun hijau muda atau perunggu', 'First leaf pair unfolded, not yet at full size. Leaves are light green or bronze'],
    ['12', '2 pasang daun membuka, belum berukuran penuh; daun hijau muda atau perunggu', '2 leaf pairs unfolded, not yet at full size. Leaves are light green or bronze'],
    ['13', '3 pasang daun membuka, belum berukuran penuh; pasangan daun ketiga dari pucuk berwarna hijau tua', '3 leaf pairs unfolded, not yet full size. The third leaf pair from apex is dark green'],
    ['14', '4 pasang daun membuka; pasangan daun keempat dari pucuk hijau tua dan berukuran penuh', '4 leaf pairs unfolded. The fourth leaf pair from apex is dark green and has reached full size'],
    ...seri(15, 18, (n) => `${n} pasang daun membuka`, (n) => `${n} leaf pairs unfolded`),
    ['19', '9 pasang daun atau lebih membuka', '9 or more leaf pairs unfolded'],
  ]],
  [2, [
    ['20', 'Sepasang cabang primer pertama tampak', 'First pair of primary branches are visible'],
    ['21', '10 pasang cabang primer tampak', '10 pair of primary branches visible'],
    ['22', '20 pasang cabang primer tampak', '20 pair of primary branches visible'],
    ['23', '30 pasang cabang primer tampak', '30 pair of primary branches visible'],
    ...persen(24, 28, (p) => `${p} pasang cabang primer tampak`, (p) => `${p} pair of primary branches visible`),
    ['29', '90 pasang cabang primer atau lebih tampak', '90 or more pairs of primary branches visible'],
  ]],
  [3, [
    ['31', '10 buku pada cabang', '10 nodes present in the branch(es)'],
    ['32', '20 buku pada cabang', '20 nodes present in the branch(es)'],
    ...persen(33, 38, (p) => `${p} buku pada cabang`, (p) => `${p} nodes present in the branch(es)`),
    ['39', '90 buku atau lebih pada cabang', '90 or more nodes present in the branch(es)'],
  ]],
  [5, [
    ['51', 'Kuncup perbungaan membengkak di ketiak daun', 'Inflorescence buds swelling in leaf axils'],
    ['53', 'Kuncup perbungaan pecah dan terbungkus lendir kecoklatan; bunga belum tampak', 'Inflorescence buds burst and covered by brown mucilage; no flowers visible'],
    ['57', 'Bunga tampak, masih tertutup dan rapat, pada perbungaan bermahkota banyak — 3–4 bunga per perbungaan', 'Flowers visible, still closed and tightly join, borne on multiflowered inflorescence (3-4 flowers per inflorescence)'],
    ['58', 'Bunga tampak, merenggang, masih tertutup, mahkota 4–6 mm dan hijau (fase dorman)', 'Flowers visible, untight, still closed, petals 4-6 mm long and green (dormant stage)'],
    ['59', 'Bunga dengan mahkota memanjang 6–10 mm, masih tertutup dan berwarna putih', 'Flowers with petals elongated (6-10 mm long), still closed and white color'],
  ]],
  [6, [
    ['60', 'Bunga pertama mekar', 'First flowers open'],
    ['61', '10% bunga mekar', '10% of flowers open'],
    ['63', '30% bunga mekar', '30% of flowers open'],
    ['65', '50% bunga mekar', '50% of flowers open'],
    ['67', '70% bunga mekar', '70% of flowers open'],
    ['69', '90% bunga mekar', '90% of flowers open'],
  ]],
  [7, [
    ['70', 'Buah tampak sebagai beri kecil kekuningan', 'Fruits visible as small yellowish berries'],
    ['71', 'Buah jadi: awal pertumbuhan beri, buah mencapai 10% ukuran akhir (sebesar kepala jarum)', 'Fruit set: Beginning of berry growth. Fruits have reached 10% of final size (pinheads)'],
    ['73', 'Buah hijau muda, isinya cair dan bening; buah mencapai 30% ukuran akhir (pertumbuhan cepat)', 'Fruits are light green and contents are liquid and crystalline. Fruits have reached 30% of final size (fast growth)'],
    ['75', 'Buah hijau muda, isinya cair dan bening; buah mencapai 50% ukuran akhir', 'Fruits are light green and its contents are liquid and crystalline. Fruits have reached 50% of final size'],
    ['77', 'Buah hijau tua, isinya padat dan putih; buah mencapai 70% ukuran akhir', 'Fruits are dark green and its contents are solid and white. Fruits have reached 70% of final size'],
    ['79', 'Buah hijau pucat, isinya padat dan putih; kemasakan fisiologis selesai, buah mencapai 90% ukuran akhir', 'Fruits are pale green and its contents are solid and white. Physiological maturity is complete. Fruits have reached 90% of final size'],
  ]],
  [8, [
    ['81', 'Awal perubahan warna buah dari hijau pucat ke kuning atau merah', 'Beginning of change of fruit coloration from pale green to yellow or red'],
    ['85', 'Warna buah menguat — kuning atau merah, khas varietas; buah belum siap dipetik', 'Increase in intensity (variety-specific), yellow or red, fruit color; fruit not yet ready for picking'],
    ['88', 'Buah berwarna masak penuh dan siap dipetik', 'Fruit is fully-ripe color and ready for picking'],
    ['89', 'Lewat masak: mulai menghitam atau mengering; buah bertahan di pohon atau mulai gugur', 'Overripe; beginning of darkening or drying; fruits stay on the tree or abscission begins'],
  ]],
  [9, [
    ['90', 'Tunas selesai berkembang; tanaman tampak hijau tua pekat, daun berukuran normal, dan panen berada di bagian bawah tanaman', 'Shoots have completed their development; the plant appears of an intense dark green color, leaves are of normal size and harvest locates at the bottom part of the plant'],
    ['93', 'Daun tua berubah dari hijau pekat ke kuning berbercak merah, dan gugur terutama pada saat panen', 'Older leaves change its color from deep green to yellow with red spots, and fall specially at harvesting time'],
    ['94', 'Tajuk berubah hijau pucat; daun gugur di bagian bawah batang utama dan cabang bawah', 'The foliage changes to a pale green color. Defoliation is observed on the bottom part of the main stem and lower branches'],
    ['97', 'Zona produksi berpindah ke bagian atas tunas utama dan bagian luar cabang; daun lebih kecil dari normal, daun gugur banyak di bagian bawah dan dalam, sebagian cabang bawah mati', 'The production zone has moved towards the upper parts in the main shoot and outer parts of branches, leaves are of smaller size than normal, strong defoliation is observed on the bottom and inner part of the plant, some dead branches are observed at the bottom'],
    ['98', 'Zona produksi tinggal beberapa cabang di pucuk dan beberapa buku di ujungnya; tanaman meranggas berat, penuaan tinggi, 90% panen atau lebih selesai', 'The production zone is limited to a very few branches on the top of the shoot and a very few nodes on the tip of these branches, and the plant is heavily defoliated. A high-degree of senescence has been reached. 90% or more of the harvest completed'],
    ['99', 'Perlakuan pascapanen atau penyimpanan', 'Post harvest or storage treatments'],
  ]],
];

const BAWANG = [
  [0, [
    ['00', 'Benih kering; umbi dorman', 'Dry seed, dormant bulb'],
    ['01', 'Awal imbibisi benih', 'Beginning of seed imbibition'],
    ['03', 'Imbibisi benih selesai', 'Seed imbibition complete'],
    ['05', 'Radikula muncul dari benih; akar mulai tampak', 'Radicle emerged from seed. Roots appearing'],
    ['07', 'Kotiledon menembus kulit benih', 'Cotyledon breaking through seed coat'],
    ['09', 'Kemunculan: kotiledon menembus permukaan tanah; tunas hijau tampak', 'Emergence: cotyledon breaks through soil surface. Green shoot visible'],
  ]],
  [1, [
    ['10', 'Fase cambuk lanjut: cambuk mulai mengering', 'Advanced whip stage: whip begins to die off'],
    ['11', 'Daun pertama (> 3 cm) jelas tampak', 'First leaf (> 3 cm) clearly visible'],
    ['12', 'Daun ke-2 (> 3 cm) jelas tampak', '2nd leaf (> 3 cm) clearly visible'],
    ['13', 'Daun ke-3 (> 3 cm)', '3rd leaf (> 3 cm)'],
    ...seri(14, 18, (n) => `Daun ke-${n} (> 3 cm) jelas tampak`, (n) => `${n}th leaf (> 3 cm) clearly visible`),
    ['19', '9 daun atau lebih jelas tampak', '9 or more leaves clearly visible'],
  ]],
  [4, [
    ['41', 'Pangkal daun mulai menebal atau memanjang', 'Leaf bases begin to thicken or extend'],
    ['43', '30% garis tengah umbi atau batang semu yang diharapkan tercapai', '30% of the expected bulb or shaft diameter reached'],
    ['45', '50% garis tengah umbi atau batang semu yang diharapkan tercapai', '50% of the expected bulb or shaft diameter reached'],
    ['47', 'Mulai membentuk tangkai bunga; 10% tanaman daunnya rebah. Untuk bawang daun: 70% panjang dan garis tengah batang semu tercapai', 'Bolting begins; in 10% of the plants leaves bent over / 70% of the expected shaft length and diameter reached'],
    ['48', 'Daun rebah pada 50% tanaman', 'Leaves bent over in 50% of plants'],
    ['49', 'Daun mati, ujung umbi kering, dormansi. Untuk bawang daun: pertumbuhan selesai, panjang dan garis tengah batang khas varietas tercapai', 'Leaves dead, bulb top dry; dormancy / Growth complete; length and stem diameter typical for variety reached'],
  ]],
  [5, [
    ['51', 'Umbi bawang mulai memanjang', 'Onion bulb begins to elongate'],
    ['53', '30% panjang tangkai bunga yang diharapkan tercapai', '30% of the expected length of flower stem reached'],
    ['55', 'Tangkai bunga mencapai panjang penuh; seludang masih menutup', 'Flower stem at full length; sheath closed'],
    ['57', 'Seludang pecah terbuka', 'Sheath burst open'],
    ['59', 'Mahkota bunga pertama tampak; bunga masih tertutup', 'First flower petals visible; flowers still closed'],
  ]],
  [6, [
    ['60', 'Bunga pertama mekar, tersebar', 'First flowers open (sporadically)'],
    ['61', 'Awal berbunga: 10% bunga mekar', 'Beginning of flowering: 10% of flowers open'],
    ...persen(62, 64, (p) => `${p}% bunga mekar`, (p) => `${p}% of flowers open`),
    ['65', 'Berbunga penuh: 50% bunga mekar', 'Full flowering: 50% of flowers open'],
    ['67', 'Pembungaan berakhir: 70% mahkota gugur atau kering', 'Flowering finishing: 70% of petals fallen or dry'],
    ['69', 'Akhir berbunga', 'End of flowering'],
  ]],
  [7, [
    ['71', 'Kapsul pertama terbentuk', 'First capsules formed'],
    ...persen(72, 78, (p) => `${p}% kapsul terbentuk`, (p) => `${p}% of capsules formed`),
    ['79', 'Perkembangan kapsul selesai; biji masih pucat', 'Capsule development complete; seeds pale'],
  ]],
  [8, [
    ['81', 'Awal pemasakan: 10% kapsul masak', 'Beginning of ripening: 10% of capsules ripe'],
    ['85', 'Kapsul pertama pecah', 'First capsules bursting'],
    ['89', 'Masak penuh: biji hitam dan keras', 'Fully ripe: seeds black and hard'],
  ]],
  [9, [
    ['92', 'Daun dan tunas mulai berubah warna', 'Leaves and shoots beginning to discolour'],
    ['95', '50% daun kuning atau mati', '50% of leaves yellow or dead'],
    ['97', 'Tanaman atau bagian di atas tanah mati', 'Plants or above ground parts dead'],
    ['99', 'Produk hasil panen (biji)', 'Harvested product (seeds)'],
  ]],
];

const KUBIS = [
  [0, [
    ['00', 'Benih kering', 'Dry seed'],
    ['01', 'Awal imbibisi benih', 'Beginning of seed imbibition'],
    ['03', 'Imbibisi benih selesai', 'Seed imbibition complete'],
    ['05', 'Radikula muncul dari benih', 'Radicle emerged from seed'],
    ['07', 'Hipokotil bersama kotiledon menembus kulit benih', 'Hypocotyl with cotyledons breaking through seed coat'],
    ['09', 'Kemunculan: kotiledon menembus permukaan tanah', 'Emergence: cotyledons break through soil surface'],
  ]],
  [1, [
    ['10', 'Kotiledon membuka penuh; titik tumbuh atau bakal daun sejati tampak', 'Cotyledons completely unfolded; growing point or true leaf initial visible'],
    ['11', 'Daun sejati pertama membuka', 'First true leaf unfolded'],
    ['12', 'Daun sejati ke-2 membuka', '2nd true leaf unfolded'],
    ['13', 'Daun sejati ke-3 membuka', '3rd true leaf unfolded'],
    ...seri(14, 18, (n) => `Daun sejati ke-${n} membuka`, (n) => `${n}th true leaf unfolded`),
    ['19', '9 daun sejati atau lebih membuka', '9 or more true leaves unfolded'],
  ]],
  [4, [
    ['41', 'Krop mulai terbentuk: dua daun termuda tidak membuka', 'Heads begin to form: the two youngest leaves do not unfold'],
    ...persen(42, 48, (p) => `${p}% ukuran krop yang diharapkan tercapai`, (p) => `${p}% of the expected head size reached`),
    ['49', 'Ukuran, bentuk, dan kepadatan krop yang khas tercapai', 'Typical size, form and firmness of heads reached'],
  ]],
  [5, [
    ['51', 'Tunas utama di dalam krop mulai memanjang', 'Main shoot inside head begins to elongate'],
    ['53', '30% tinggi tunas utama yang diharapkan tercapai', '30% of the expected height of the main shoot reached'],
    ['55', 'Bunga pertama perbungaan utama tampak, masih tertutup', 'First individual flowers of main inflorescence visible (still closed)'],
    ['57', 'Bunga pertama perbungaan samping tampak, masih tertutup', 'First individual flowers of secondary inflorescences visible (still closed)'],
    ['59', 'Mahkota bunga pertama tampak; bunga masih tertutup', 'First flower petals visible; flowers still closed'],
  ]],
  [6, [
    ['60', 'Bunga pertama mekar, tersebar', 'First flowers open (sporadically)'],
    ['61', 'Awal berbunga: 10% bunga mekar', 'Beginning of flowering: 10% of flowers open'],
    ...persen(62, 64, (p) => `${p}% bunga mekar`, (p) => `${p}% of flowers open`),
    ['65', 'Berbunga penuh: 50% bunga mekar', 'Full flowering: 50% of flowers open'],
    ['67', 'Pembungaan berakhir: sebagian besar mahkota gugur atau kering', 'Flowering finishing: majority of petals fallen or dry'],
    ['69', 'Akhir berbunga', 'End of flowering'],
  ]],
  [7, [
    ['71', 'Buah pertama terbentuk', 'First fruits formed'],
    ...persen(72, 78, (p) => `${p}% buah mencapai ukuran khasnya`, (p) => `${p}% of fruits have reached typical size`),
    ['79', 'Buah mencapai ukuran khasnya', 'Fruits have reached typical size'],
  ]],
  [8, [
    ['81', 'Awal pemasakan: 10% buah masak, atau 10% biji berwarna khas, kering dan keras', 'Beginning of ripening: 10% of fruits ripe, or 10% of seeds of typical colour, dry and hard'],
    ...persen(82, 88, (p) => `${p}% buah masak, atau ${p}% biji berwarna khas, kering dan keras`, (p) => `${p}% of fruits ripe, or ${p}% of seeds of typical colour, dry and hard`),
    ['89', 'Masak penuh: biji pada seluruh tanaman berwarna khas dan keras', 'Fully ripe: seeds on the whole plant of typical colour and hard'],
  ]],
  [9, [
    ['92', 'Daun dan tunas mulai berubah warna', 'Leaves and shoots beginning to discolour'],
    ['95', '50% daun kuning atau mati', '50% of leaves yellow or dead'],
    ['97', 'Tanaman mati', 'Plants dead'],
    ['99', 'Produk hasil panen (biji)', 'Harvested product (seeds)'],
  ]],
];

function bangun(tabel, dariId, tigaDigit) {
  const out = [];
  let n = dariId;
  for (const [principal, baris] of tabel) {
    for (const [code, id, en, tanda] of baris) {
      const maps = [{ scheme: 'BBCH', id: code, relation: 'exact' }];
      if (tanda === 'antara') maps[0].note = ANTARA;
      if (tigaDigit) {
        const tiga = `${code[0]}0${code[1]}`;
        maps.push({ scheme: 'BBCH', id: tiga, relation: 'exact', note: TIGA });
      }
      out.push({
        id: `op:stg:${String(n++).padStart(8, '0')}`,
        code, label: { id, en }, principal, order: Number(code), mappings: maps,
      });
    }
  }
  return out;
}

const BERKAS = [
  ['stage-scale-bbch-kedelai.json', {
    id: 'op:sca:00000006', key: 'bbch-kedelai',
    label: { id: 'BBCH — Kedelai (Glycine max)', en: 'BBCH scale — soybean' },
    definition: { id: 'Skala fenologi BBCH untuk kedelai. Fase utama 3 tidak dipakai, dan fase utama 4 hanya memuat satu kode — pemanenan bagian vegetatif untuk pakan. Sumber memberi dua rumusan berbeda untuk sebagian kode pada fase 6 sampai 8, satu untuk varietas determinat dan satu untuk indeterminat; yang disalin ke sini rumusan determinat, dan perbedaannya dicatat di notes.' },
    mapId: 'bbch-soybean', mapNote: 'Kunci BBCH kedelai, dirujuk monograf ke Munger dkk. (1997).',
    notes: { id: 'Sumber membedakan varietas determinat dan indeterminat pada fase 61–69, 71–79, dan 81–89: untuk indeterminat, kode 61 berbunyi "awal berbunga", 65 "periode utama berbunga", 71 "awal perkembangan polong", 73 "awal pengisian polong", 75 "periode utama perkembangan polong", 77 "pengisian polong lanjut", 81 "awal pemasakan polong dan biji", 85 "periode utama pemasakan", 89 "sebagian besar polong masak". Perbedaan ini belum dimodelkan sebagai fase terpisah; kalau protokol kedelai nanti membedakannya, skala ini perlu dipecah dua. Kode 76 dan 78 memang tidak ada di sumber.' },
    tiga: true, tabel: KEDELAI, stg: 500, locator: 'kunci kedelai dirujuk ke Munger dkk. (1997)',
  }],
  ['stage-scale-bbch-kentang.json', {
    id: 'op:sca:00000007', key: 'bbch-kentang',
    label: { id: 'BBCH — Kentang (Solanum tuberosum)', en: 'BBCH scale — potato' },
    definition: { id: 'Skala fenologi BBCH untuk kentang. Sumber menabelkan dua jalur perkembangan berdampingan — dari umbi dan dari biji — yang berbeda isinya pada fase utama 0 dan 1; keduanya disalin ke dalam satu label supaya tidak ada yang hilang. Fase utama 4 memuat pembentukan umbi, bagian yang tidak ada pada kunci Solanaceae sayuran buah, dan itulah alasan kentang tidak boleh memakai kunci itu.' },
    mapId: 'bbch-potato', mapNote: 'Kunci BBCH kentang, dirujuk monograf ke Hack dkk. (1993).',
    notes: { id: 'Yang belum dibawa: kode 3 digit yang tidak punya padanan 2 digit — daun ke-10 ke atas (110–119), daun pada cabang ordo kedua dan ketiga (121–129, 131–139), perbungaan dan pembungaan ke-2 dan ke-3 (521–529, 531–539, 621–629, 631–639), pembuahan dan pemasakan pada pembuahan berikutnya (721 dan seterusnya, 821 dan seterusnya), serta kode tunas generasi kedua (021–029). Kentang bercabang simpodial dan kuncinya memang jauh lebih dalam daripada kolom 2 digitnya.' },
    tiga: true, tabel: KENTANG, stg: 600, locator: 'kunci kentang dirujuk ke Hack dkk. (1993)',
  }],
  ['stage-scale-bbch-kopi.json', {
    id: 'op:sca:00000008', key: 'bbch-kopi',
    label: { id: 'BBCH — Kopi (Coffea sp.)', en: 'BBCH scale — coffee' },
    definition: { id: 'Skala fenologi BBCH untuk kopi. Berbeda dari kunci tanaman semusim, fase utama 0 mencakup tiga cara perbanyakan sekaligus — benih, setek, dan stum — dan fase utama 9 menggambarkan penuaan pohon bertahun-tahun, bukan akhir satu musim. Hanya punya kolom kode 2 digit.' },
    mapId: 'bbch-coffee', mapNote: 'Kunci BBCH kopi, dirujuk monograf ke Arcila-Pulgarín dkk.; saat monograf terbit berstatus in press.',
    notes: { id: 'Fase utama 2 dan 3 memakai satuan puluhan, bukan satuan: kode 21 berarti 10 pasang cabang primer dan 29 berarti 90 pasang atau lebih; kode 31 berarti 10 buku pada cabang dan 39 berarti 90 buku atau lebih. Salah membacanya sebagai hitungan satuan akan meleset sepuluh kali lipat. Fase utama 4 tidak dipakai.' },
    tiga: false, tabel: KOPI, stg: 700, locator: 'kunci kopi dirujuk ke Arcila-Pulgarín dkk., in press',
  }],
  ['stage-scale-bbch-bawang.json', {
    id: 'op:sca:00000009', key: 'bbch-bawang',
    label: { id: 'BBCH — Sayuran umbi lapis (bawang merah, bawang putih, bawang daun)', en: 'BBCH scale — bulb vegetables' },
    definition: { id: 'Skala fenologi BBCH untuk sayuran umbi lapis. Sumber menyebut jenis cakupannya satu per satu: bawang bombai (Allium cepa), bawang daun (A. porrum), bawang putih (A. sativum), dan bawang merah (A. ascalonicum). Fase utama 2 dan 3 tidak dipakai; pembentukan umbi ada di fase utama 4.' },
    mapId: 'bbch-bulb-vegetables', mapNote: 'Kunci BBCH sayuran umbi lapis, dirujuk monograf ke Feller dkk. (1995 a).',
    notes: { id: 'Sumber memberi rumusan berbeda untuk sebagian kode menurut jenisnya: kode 47 dan 49 punya bacaan tersendiri untuk bawang daun, dan keduanya disalin ke dalam satu label. Kode 00, 05, dan 09 juga punya bacaan ganda — untuk tanaman dari benih dan untuk tanaman dari umbi bibit, siung, atau bawang merah. Yang belum dibawa: kode 3 digit tanpa padanan 2 digit pada fase perkecambahan (010 kotiledon tampak sebagai kait, 011 fase kait, 012 fase cambuk).' },
    tiga: true, tabel: BAWANG, stg: 800, locator: 'kunci sayuran umbi lapis dirujuk ke Feller dkk. (1995 a)',
  }],
  ['stage-scale-bbch-kubis.json', {
    id: 'op:sca:00000010', key: 'bbch-kubis',
    label: { id: 'BBCH — Sayuran daun berkrop (kubis, sawi putih, selada)', en: 'BBCH scale — leaf vegetables forming heads' },
    definition: { id: 'Skala fenologi BBCH untuk sayuran daun yang membentuk krop. Sumber menyebut jenis cakupannya satu per satu: kubis (Brassica oleracea var. capitata f. alba dan rubra), sawi putih (Brassica chinensis), selada krop (Lactuca sativa var. capitata), dan endive (Cichorium endivia). Fase utama 2 dan 3 tidak dipakai; pembentukan krop ada di fase utama 4, dan panen umumnya terjadi pada fase 49 — jauh sebelum tanaman berbunga.' },
    mapId: 'bbch-leaf-vegetables-heads', mapNote: 'Kunci BBCH sayuran daun berkrop, dirujuk monograf ke Feller dkk. (1995 a).',
    notes: { id: 'Fase 5 sampai 8 hanya terjadi pada tanaman yang dibiarkan berbunga untuk produksi benih. Pada budidaya konsumsi, siklusnya berhenti di fase 49. Hanya punya kolom kode 2 digit.' },
    tiga: false, tabel: KUBIS, stg: 900, locator: 'kunci sayuran daun berkrop dirujuk ke Feller dkk. (1995 a)',
  }],
];

let n = 0;
for (const [nama, k] of BERKAS) {
  const stages = bangun(k.tabel, k.stg, k.tiga);
  if (stages.length > 100) throw new Error(`${nama}: ${stages.length} fase melampaui blok 100 nomor.`);
  const doc = {
    $schema: '../schema/stage-scale.schema.json',
    id: k.id, key: k.key, label: k.label, definition: k.definition,
    basis: 'phenology',
    applies_to: { commodity_kinds: ['crop'], commodities: [] },
    mappings: [{ scheme: 'BBCH', id: k.mapId, relation: 'exact', note: k.mapNote }],
    notes: k.notes,
    stages,
    lifecycle: { version: '0.1.0', status: 'draft', created_at: STAMP, review_due: '2027-08-19' },
    provenance: { license: 'CC-BY-SA-4.0', sources: sumber(k.locator) },
    id_blocks: [{ from: Number(k.id.slice(-2)), to: Number(k.id.slice(-2)) }],
  };
  writeFileSync(join(VOCAB, nama), JSON.stringify(doc, null, 2) + '\n');
  const per = new Map();
  for (const s of stages) per.set(s.principal, (per.get(s.principal) ?? 0) + 1);
  console.log(`${nama.padEnd(32)} ${String(stages.length).padStart(3)} fase — ${[...per].map(([p, c]) => `${p}:${c}`).join(' ')}`);
  n += stages.length;
}
console.log(`\nTotal fase baru: ${n}`);
