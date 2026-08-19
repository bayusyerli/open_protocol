// Menyusun dua skala fase BBCH dari sumber primernya:
//   vocab/stage-scale-bbch-padi.json     op:sca:00000003, fase op:stg:00000200-299
//   vocab/stage-scale-bbch-jagung.json   op:sca:00000004, fase op:stg:00000300-399
//
// Sumber: BBCH Monograph, "Growth stages of mono- and dicotyledonous plants",
// edisi ke-2 (2001), disunting Uwe Meier, Federal Biological Research Centre for
// Agriculture and Forestry. Kunci padi dirujuk sumber ke Lancashire dkk. (1991);
// kunci jagung ke Weber & Bleiholder (1990) dan Lancashire dkk. (1991).
//
// Teks Inggris pada label.en disalin APA ADANYA dari monograf, termasuk salah
// ketiknya, supaya terjemahan Indonesianya bisa diperiksa terhadap sumbernya.
// Jalankan dari akar repositori:  node spec/tools/bangun-skala-bbch-serealia.mjs

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const VOCAB = join(dirname(fileURLToPath(import.meta.url)), '..', 'vocab');
const STAMP = '2026-08-19T00:00:00Z';
const CATATAN_ANTARA = 'Kode antara. Mengikuti pola deret ke-n pada sistem BBCH; tidak ditabelkan terpisah di sumber.';

const SUMBER = [
  {
    title: 'Growth stages of mono- and dicotyledonous plants — BBCH Monograph',
    publisher: 'Federal Biological Research Centre for Agriculture and Forestry (BBA)',
    year: 2001,
    locator: 'Edisi ke-2, disunting Uwe Meier',
  },
];

// deret: dari kode awal sampai akhir, teks memakai nomor urut
const deret = (dari, sampai, id, en) =>
  Array.from({ length: sampai - dari + 1 }, (_, i) => {
    const n = dari + i;
    return [String(n), id(n % 10), en(n % 10), true];
  });

// [kode, label id, label en, kodeAntara?]
const PADI = [
  [0, 'Perkecambahan', [
    ['00', 'Benih kering (kariopsis)', 'Dry seed (caryopsis)'],
    ['01', 'Awal imbibisi benih', 'Beginning of seed imbibition'],
    ['03', 'Imbibisi benih selesai (dada merpati)', 'Seed imbibition complete (pigeon breast)'],
    ['05', 'Radikula muncul dari kariopsis', 'Radicle emerged from caryopsis'],
    ['06', 'Radikula memanjang, bulu akar dan/atau akar samping tampak', 'Radicle elongated, root hairs and/or side roots visible'],
    ['07', 'Koleoptil muncul dari kariopsis — pada padi air fase ini terjadi sebelum fase 05', 'Coleoptile emerged from caryopsis (in water-rice this stage occurs before stage 05)'],
    ['09', 'Daun tak sempurna muncul, masih menggulung, di ujung koleoptil', 'Imperfect leaf emerges (still rolled) at the tip of the coleoptile'],
  ]],
  [1, 'Perkembangan daun', [
    ['10', 'Daun tak sempurna membuka, ujung daun sejati pertama tampak', 'Imperfect leaf unrolled, tip of first true leaf visible'],
    ['11', 'Daun pertama membuka penuh', 'First leaf unfolded'],
    ['12', '2 daun membuka penuh', '2 leaves unfolded'],
    ['13', '3 daun membuka penuh', '3 leaves unfolded'],
    ...deret(14, 18, (n) => `${n} daun membuka penuh`, (n) => `${n} leaves unfolded`),
    ['19', '9 daun atau lebih membuka penuh', '9 or more leaves unfolded'],
  ]],
  [2, 'Pembentukan anakan', [
    ['21', 'Awal pembentukan anakan: anakan pertama terdeteksi', 'Beginning of tillering: first tiller detectable'],
    ['22', '2 anakan terdeteksi', '2 tillers detectable'],
    ['23', '3 anakan terdeteksi', '3 tillers detectable'],
    ...deret(24, 28, (n) => `${n} anakan terdeteksi`, (n) => `${n} tillers detectable`),
    ['29', 'Jumlah anakan maksimum terdeteksi', 'Maximum number of tillers detectable'],
  ]],
  [3, 'Pemanjangan batang', [
    ['30', 'Inisiasi malai atau fase cincin hijau: klorofil menumpuk di jaringan batang dan membentuk cincin hijau', 'Panicle initiation or green ring stage: chlorophyll accumulates in the stem tissue, forming a green ring'],
    ['32', 'Pembentukan malai: panjang malai 1–2 mm', 'Panicle formation: panicle 1–2 mm in length'],
    ['34', 'Pemanjangan ruas atau fase buku: ruas mulai memanjang, malai lebih dari 2 mm — bergantung varietas', 'Internode elongation or jointing stage: internodes begin to elongate, panicle more than 2 mm long (variety-dependent)'],
    ['37', 'Daun bendera mulai tampak, masih menggulung, malai bergerak ke atas', 'Flag leaf just visible, still rolled, panicle moving upwards'],
    ['39', 'Fase daun bendera: daun bendera membuka penuh, leher daun — aurikel dan ligula — daun bendera sejajar dengan daun kedua terakhir (pra-bunting)', 'Flag leaf stage: flag leaf unfolded, collar regions (auricle and ligule) of flag leaf and penultimate leaf aligned (pre-boot stage)'],
  ]],
  [4, 'Bunting', [
    ['41', 'Awal bunting: bagian atas batang sedikit menebal, pelepah daun bendera keluar sekitar 5 cm dari pelepah daun kedua terakhir', 'Early boot stage: upper part of stem slightly thickened, sheath of flag leaf about 5 cm out of penultimate leaf sheath'],
    ['43', 'Pertengahan bunting: pelepah daun bendera keluar 5–10 cm dari pelepah daun kedua terakhir', 'Mid boot stage: sheath of flag leaf 5–10 cm out of the penultimate leaf sheath'],
    ['45', 'Akhir bunting: pelepah daun bendera menggembung, keluar lebih dari 10 cm dari pelepah daun kedua terakhir', 'Late boot stage: flag leaf sheath swollen, sheath of flag leaf more than 10 cm out of penultimate leaf sheath'],
    ['47', 'Pelepah daun bendera mulai membuka', 'Flag leaf sheath opening'],
    ['49', 'Pelepah daun bendera terbuka', 'Flag leaf sheath open'],
  ]],
  [5, 'Keluarnya malai', [
    ['51', 'Awal keluar malai: ujung malai keluar dari pelepah', 'Beginning of panicle emergence: tip of inflorescence emerged from sheath'],
    ['52', '20% malai keluar', '20% of panicle emerged'],
    ['53', '30% malai keluar', '30% of panicle emerged'],
    ['54', '40% malai keluar', '40% of panicle emerged'],
    ['55', 'Pertengahan keluar malai: buku leher masih di dalam pelepah', 'Middle of panicle emergence: neck node still in sheath'],
    ['56', '60% malai keluar', '60% of panicle emerged'],
    ['57', '70% malai keluar', '70% of panicle emerged'],
    ['58', '80% malai keluar', '80% of panicle emerged'],
    ['59', 'Akhir keluar malai: buku leher sejajar dengan aurikel daun bendera, kepala sari belum tampak', 'End of panicle emergence: neck node level with the flag leaf auricle, anthers not yet visible'],
  ]],
  [6, 'Pembungaan', [
    ['61', 'Awal berbunga: kepala sari tampak di ujung malai', 'Beginning of flowering: anthers visible at top of panicle'],
    ['65', 'Berbunga penuh: kepala sari tampak pada sebagian besar bulir', 'Full flowering: anthers visible on most spikelets'],
    ['69', 'Akhir berbunga: seluruh bulir selesai berbunga, sebagian kepala sari yang mengering mungkin masih tersisa', 'End of flowering: all spikelets have completed flowering but some dehydrated anthers may remain'],
  ]],
  [7, 'Perkembangan bulir', [
    ['71', 'Masak berair: bulir pertama mencapai setengah ukuran akhirnya', 'Watery ripe: first grains have reached half their final size'],
    ['73', 'Awal masak susu', 'Early milk'],
    ['75', 'Pertengahan masak susu: isi bulir menyerupai susu', 'Medium milk: grain content milky'],
    ['77', 'Akhir masak susu', 'Late milk'],
  ]],
  [8, 'Pemasakan', [
    ['83', 'Awal masak adonan', 'Early dough'],
    ['85', 'Masak adonan lunak: isi bulir lunak tetapi kering, bekas kuku tidak bertahan, bulir dan sekam masih hijau', 'Soft dough: grain content soft but dry, fingernail impression not held, grains and glumes still green'],
    ['87', 'Masak adonan keras: isi bulir padat, bekas kuku bertahan', 'Hard dough: grain content solid, fingernail impression held'],
    ['89', 'Masak penuh: bulir keras, sulit dibelah dengan kuku ibu jari', 'Fully ripe: grain hard, difficult to divide with thumbnail'],
  ]],
  [9, 'Penuaan', [
    ['92', 'Lewat masak: bulir sangat keras, tidak bisa dilekukkan dengan kuku ibu jari', 'Over-ripe: grain very hard, cannot be dented by thumbnail'],
    ['97', 'Tanaman mati dan rebah', 'Plant dead and collapsing'],
    ['99', 'Produk hasil panen', 'Harvested product'],
  ]],
];

const JAGUNG = [
  [0, 'Perkecambahan', [
    ['00', 'Benih kering (kariopsis)', 'Dry seed (caryopsis)'],
    ['01', 'Awal imbibisi benih', 'Beginning of seed imbibition'],
    ['03', 'Imbibisi benih selesai', 'Seed imbibition complete'],
    ['05', 'Radikula muncul dari kariopsis', 'Radicle emerged from caryopsis'],
    ['06', 'Radikula memanjang, bulu akar dan/atau akar samping tampak', 'Radicle elongated, root hairs and/or side roots visible'],
    ['07', 'Koleoptil muncul dari kariopsis', 'Coleptile emerged from caryopsis'],
    ['09', 'Kemunculan: koleoptil menembus permukaan tanah (fase pecah tanah)', 'Emergence: coleoptile penetrates soil surface (cracking stage)'],
  ]],
  [1, 'Perkembangan daun', [
    ['10', 'Daun pertama menembus koleoptil', 'First leaf through coleoptile'],
    ['11', 'Daun pertama membuka penuh', 'First leaf unfolded'],
    ['12', '2 daun membuka penuh', '2 leaves unfolded'],
    ['13', '3 daun membuka penuh', '3 leaves unfolded'],
    ...deret(14, 18, (n) => `${n} daun membuka penuh`, (n) => `${n} leaves unfolded`),
    ['19', '9 daun atau lebih membuka penuh', '9 or more leaves unfolded'],
  ]],
  [3, 'Pemanjangan batang', [
    ['30', 'Awal pemanjangan batang', 'Beginning of stem elongation'],
    ['31', 'Buku pertama terdeteksi', 'First node detectable'],
    ['32', '2 buku terdeteksi', '2 nodes detectable'],
    ['33', '3 buku terdeteksi', '3 nodes detectable'],
    ...deret(34, 38, (n) => `${n} buku terdeteksi`, (n) => `${n} nodes detectable`),
    ['39', '9 buku atau lebih terdeteksi', '9 or more nodes detectable'],
  ]],
  [5, 'Keluarnya malai jantan', [
    ['51', 'Awal keluar malai jantan: malai terdeteksi di ujung batang', 'Beginning of tassel emergence: tassel detectable at top of stem'],
    ['53', 'Ujung malai jantan tampak', 'Tip of tassel visible'],
    ['55', 'Pertengahan keluar malai jantan: bagian tengah malai mulai merenggang', 'Middle of tassel emergence: middle of tassel begins to separate'],
    ['59', 'Akhir keluar malai jantan: malai keluar penuh dan merenggang', 'End of tassel emergence: tassel fully emerged and separated'],
  ]],
  [6, 'Pembungaan', [
    ['61', 'Jantan: benang sari di tengah malai tampak. Betina: ujung tongkol keluar dari pelepah daun', 'Male: stamens in middle of tassel visible / Female: tip of ear emerging from leaf sheath'],
    ['63', 'Jantan: awal pelepasan serbuk sari. Betina: ujung rambut tongkol tampak', 'Male: beginning of pollen shedding / Female: tips of stigmata visible'],
    ['65', 'Jantan: bagian atas dan bawah malai berbunga. Betina: rambut tongkol keluar penuh', 'Male: upper and lower parts of tassel in flower / Female: stigmata fully emerged'],
    ['67', 'Jantan: pembungaan selesai. Betina: rambut tongkol mengering', 'Male: flowering completed / Female: stigmata drying'],
    ['69', 'Akhir pembungaan: rambut tongkol kering seluruhnya', 'End of flowering: stigmata completely dry'],
  ]],
  [7, 'Perkembangan biji', [
    ['71', 'Awal perkembangan biji: biji pada fase lepuh, bahan kering sekitar 16%', 'Beginning of grain development: kernels at blister stage, about 16% dry matter'],
    ['73', 'Awal masak susu', 'Early milk'],
    ['75', 'Biji di tengah tongkol putih kekuningan — bergantung varietas — isinya menyerupai susu, bahan kering sekitar 40%', 'Kernels in middle of cob yellowish-white (variety-dependent), content milky, about 40% dry matter'],
    ['79', 'Hampir seluruh biji mencapai ukuran akhirnya', 'Nearly all kernels have reached final size'],
  ]],
  [8, 'Pemasakan', [
    ['83', 'Awal masak adonan: isi biji lunak, bahan kering sekitar 45%', 'Early dough: kernel content soft, about 45% dry matter'],
    ['85', 'Fase adonan: biji kekuningan sampai kuning — bergantung varietas — bahan kering sekitar 55%', 'Dough stage: kernels yellowish to yellow (variety dependent), about 55% dry matter'],
    ['87', 'Masak fisiologis: titik atau lapisan hitam tampak di pangkal biji, bahan kering sekitar 60%', 'Physiological maturity: black dot/layer visible at base of kernels, about 60% dry matter'],
    ['89', 'Masak penuh: biji keras dan mengilap, bahan kering sekitar 65%', 'Fully ripe: kernels hard and shiny, about 65% dry matter'],
  ]],
  [9, 'Penuaan', [
    ['97', 'Tanaman mati dan rebah', 'Plant dead and collapsing'],
    ['99', 'Produk hasil panen', 'Harvested product'],
  ]],
];

function bangunFase(tabel, dariId) {
  const out = [];
  let n = dariId;
  for (const [principal, , baris] of tabel) {
    for (const [code, id, en, antara] of baris) {
      const map = { scheme: 'BBCH', id: code, relation: 'exact' };
      if (antara) map.note = CATATAN_ANTARA;
      if (code === '07' && en.startsWith('Coleptile')) {
        map.note = 'Sumber menulis "Coleptile"; salah ketik untuk "Coleoptile". Direkam apa adanya sesuai aturan menyalin sumber.';
      }
      out.push({
        id: `op:stg:${String(n++).padStart(8, '0')}`,
        code,
        label: { id, en },
        principal,
        order: Number(code),
        mappings: [map],
      });
    }
  }
  return out;
}

const berkas = [
  {
    nama: 'stage-scale-bbch-padi.json',
    doc: {
      id: 'op:sca:00000003',
      key: 'bbch-padi',
      label: { id: 'BBCH — Padi (Oryza sativa)', en: 'BBCH scale — rice' },
      definition: {
        id: 'Skala fenologi BBCH untuk padi, seluruh sepuluh fase utama dari benih kering sampai produk hasil panen. Kode yang ditabelkan sumber disalin apa adanya; kode antara pada deret jumlah daun (14–18) dan jumlah anakan (24–28) mengikuti pola baku BBCH dan ditandai pada mappings.note masing-masing.',
      },
      basis: 'phenology',
      applies_to: { commodity_kinds: ['crop'], commodities: [] },
      mappings: [{
        scheme: 'BBCH', id: 'bbch-rice', relation: 'exact',
        note: 'Kunci BBCH padi, dirujuk monograf ke Lancashire dkk. (1991).',
      }],
      notes: {
        id: 'Catatan kaki sumber, dipertahankan karena mengubah cara skala ini dibaca di lapangan: (1) daun dihitung membuka penuh bila ligulanya tampak atau ujung daun berikutnya tampak; (2) pembentukan anakan atau pemanjangan batang bisa terjadi lebih awal dari fase 13 — bila begitu, lanjutkan ke fase 21 atau 30; (3) bila pemanjangan batang mulai sebelum pembentukan anakan selesai, lanjutkan ke fase 30; (4) pembungaan biasanya mulai sebelum fase 55 — lanjutkan ke fase utama 6.',
      },
      stages: bangunFase(PADI, 200),
      id_blocks: [{ from: 3, to: 3 }],
    },
  },
  {
    nama: 'stage-scale-bbch-jagung.json',
    doc: {
      id: 'op:sca:00000004',
      key: 'bbch-jagung',
      label: { id: 'BBCH — Jagung (Zea mays)', en: 'BBCH scale — maize' },
      definition: {
        id: 'Skala fenologi BBCH untuk jagung. Fase utama 2 (pembentukan anakan) dan 4 (bunting) memang tidak dipakai pada jagung, jadi deretnya melompat dari 19 ke 30 dan dari 39 ke 51. Fase utama 6 memuat dua deskripsi sekaligus — bunga jantan pada malai dan bunga betina pada tongkol — karena keduanya berlangsung terpisah pada tanaman yang sama.',
      },
      basis: 'phenology',
      applies_to: { commodity_kinds: ['crop'], commodities: [] },
      mappings: [{
        scheme: 'BBCH', id: 'bbch-maize', relation: 'exact',
        note: 'Kunci BBCH jagung, dirujuk monograf ke Weber & Bleiholder (1990) dan Lancashire dkk. (1991).',
      }],
      notes: {
        id: 'Catatan kaki sumber: (1) daun dianggap membuka penuh bila ligulanya tampak atau ujung daun berikutnya tampak; (2) pembentukan anakan atau pemanjangan batang bisa terjadi lebih awal dari fase 19 — bila begitu, lanjutkan ke fase utama 3; (3) pada jagung, keluarnya malai jantan bisa terjadi lebih awal — bila begitu, lanjutkan ke fase utama 5.',
      },
      stages: bangunFase(JAGUNG, 300),
      id_blocks: [{ from: 4, to: 4 }],
    },
  },
];

for (const { nama, doc } of berkas) {
  const isi = {
    $schema: '../schema/stage-scale.schema.json',
    ...doc,
    lifecycle: { version: '0.1.0', status: 'draft', created_at: STAMP, review_due: '2027-08-19' },
    provenance: { license: 'CC-BY-SA-4.0', sources: SUMBER },
  };
  // urutan field: id_blocks di akhir seperti berkas skala yang sudah ada
  const { id_blocks, ...tanpaBlok } = isi;
  writeFileSync(join(VOCAB, nama), JSON.stringify({ ...tanpaBlok, id_blocks }, null, 2) + '\n');
  const perPrincipal = new Map();
  for (const s of doc.stages) perPrincipal.set(s.principal, (perPrincipal.get(s.principal) ?? 0) + 1);
  console.log(`${nama}: ${doc.stages.length} fase — ${[...perPrincipal].map(([p, n]) => `${p}:${n}`).join(' ')} | stg ${doc.stages[0].id.slice(-4)}–${doc.stages.at(-1).id.slice(-4)}`);
}
