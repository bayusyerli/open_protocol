// Menyusun skala fase kacang panjang:
//   vocab/stage-scale-kacang-panjang.json   op:sca:00000021, fase op:stg:00002100-2199
//
// BUKAN skala BBCH. Kunci BBCH buncis menyebut Phaseolus vulgaris, sementara
// kacang panjang Vigna unguiculata ssp. sesquipedalis — marga lain. Tidak ada
// kunci BBCH yang pernah diterbitkan untuk Vigna unguiculata; pustaka memakai
// kode kunci buncis secara informal, dan itu pemakaian, bukan kunci.
//
// Berbeda dari durian, di sini ADA yang bisa dipegang:
//   - urutan fase vegetatif dan generatif mengikuti pola penahapan legum yang
//     lazim (VE, VC, V1.., R1..R7, RH), yang untuk kacang tunggak didokumentasikan
//     Bean IPM. Halamannya sendiri menolak diambil mesin, jadi rumusan di sini
//     tulisan kami, bukan salinan
//   - jangkar hari pada polong: Ofori & Klogo (2005), yang dibaca utuh
//
// Jalankan dari akar repositori:  node spec/tools/bangun-skala-kacang-panjang.mjs

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const VOCAB = join(dirname(fileURLToPath(import.meta.url)), '..', 'vocab');
const STAMP = '2026-08-19T00:00:00Z';

const FASE = [
  ['KPJ-V0', 'Perkecambahan',
   'Benih menyerap air, radikula muncul, hipokotil memanjang ke arah permukaan tanah. Perkecambahan kacang panjang berlangsung 5–10 hari pada suhu 20–30 °C.'],
  ['KPJ-V1', 'Kemunculan',
   'Kotiledon menembus permukaan tanah. Padanan fase VE pada penahapan legum.'],
  ['KPJ-V2', 'Daun primer',
   'Sepasang daun primer membuka pada buku ke-1 dan ke-2, kotiledon masih ada. Padanan fase VC.'],
  ['KPJ-V3', 'Daun trifoliat pertama',
   'Daun trifoliat pertama membuka pada buku ke-3. Padanan fase V1; buku berikutnya menyusul satu per satu.'],
  ['KPJ-V4', 'Perkembangan daun dan percabangan',
   'Daun trifoliat berikutnya membuka pada buku ke-4 ke atas, dan cabang mulai terbentuk. Di sinilah dua tipe tumbuh kacang panjang memisah: tipe merambat mulai memanjat dan perlu lanjaran, tipe kerdil tidak. Tipe merambat lebih lambat mulai berpolong tetapi berbuah jauh lebih lama, dan itu tipe yang lazim ditanam untuk pasar.'],
  ['KPJ-G0', 'Kuncup bunga pertama',
   'Kuncup bunga pertama tampak pada ketiak daun. Pembungaan kacang panjang menyusul percabangan, bukan menggantikannya — tanaman tetap tumbuh sambil berbunga.'],
  ['KPJ-G1', 'Bunga pertama mekar',
   'Satu bunga mekar pada tanaman. Padanan fase R1. Kacang panjang menyerbuk sendiri, sehingga bunga yang mekar hampir selalu jadi polong bila tidak ada gangguan.'],
  ['KPJ-G2', 'Mekar penuh',
   'Sebagian besar bunga mekar. Padanan fase R2. Pembungaan berlangsung dua sampai empat minggu dan pada tipe merambat berlanjut bersamaan dengan pemanenan polong — inilah sebabnya siklus kacang panjang tidak bisa digambarkan sebagai deret fase yang saling menggantikan.'],
  ['KPJ-B0', 'Polong terbentuk',
   'Polong pertama mencapai panjang maksimumnya. Padanan fase R3. Menurut Ofori & Klogo, polong dan biji membesar paling cepat pada 0–15 hari sesudah bunga mekar.'],
  ['KPJ-B1', 'Polong siap petik',
   'Polong mencapai ukuran pasar: masih licin, mudah dipatahkan, biji di dalamnya belum menonjol. Ofori & Klogo mendapati waktu terbaik memetik polong segar adalah 15 hari sesudah bunga mekar, saat kadar air polong 847 g/kg. Memetik lebih lambat menurunkan mutu dan menaikkan serangan penggerek polong.'],
  ['KPJ-B2', 'Panen berulang',
   'Pemetikan berulang setiap beberapa hari selama pembungaan masih berlangsung. Fase ini berjalan bersamaan dengan G2 dan B0 — bukan sesudahnya — dan bisa berlangsung berminggu-minggu pada tipe merambat. Fase inilah yang paling membedakan kacang panjang dari buncis Phaseolus yang dipanen serentak.'],
  ['KPJ-B3', 'Pengisian biji',
   'Pada polong yang sengaja tidak dipetik, biji terisi penuh dan polong berhenti memanjang. Padanan fase R5–R6. Kadar air polong dan biji mulai turun pada 15–25 hari sesudah bunga mekar.'],
  ['KPJ-B4', 'Masak fisiologis',
   'Polong berubah ke warna masak dan mengering. Padanan fase R7. Ofori & Klogo mendapati polong pada 20 hari sesudah bunga mekar memberi kompromi terbaik antara hasil biji kering, daya kecambah, dan vigor bibit.'],
  ['KPJ-B5', 'Masak panen benih',
   'Sebagian besar polong sudah berwarna masak dan kering, siap dipanen sebagai benih. Padanan fase RH.'],
  ['KPJ-S0', 'Akhir siklus',
   'Tanaman berhenti berbunga dan mengering. Pada tipe merambat, fase ini datang jauh sesudah panen pertama, sehingga umur satu pertanaman ditentukan berhentinya pembungaan, bukan tanggal panen.'],
];

const stages = FASE.map(([code, label, definisi], i) => ({
  id: `op:stg:${String(2100 + i).padStart(8, '0')}`,
  code,
  label: { id: label },
  definition: { id: definisi },
  order: i,
}));

const doc = {
  $schema: '../schema/stage-scale.schema.json',
  id: 'op:sca:00000021',
  key: 'fase-kacang-panjang',
  label: { id: 'Fase budidaya kacang panjang (Vigna unguiculata ssp. sesquipedalis)', en: 'Yardlong bean cultivation stage scale' },
  definition: {
    id: 'Lima belas fase budidaya kacang panjang, dari perkecambahan sampai akhir siklus. BUKAN skala BBCH: kunci BBCH buncis menyebut Phaseolus vulgaris, sedangkan kacang panjang Vigna unguiculata — marga lain — dan tidak ada kunci BBCH yang pernah diterbitkan untuk jenis ini. Urutan fasenya mengikuti pola penahapan legum yang lazim (VE, VC, V1 ke atas, R1 sampai R7, RH), dan padanannya disebut pada tiap fase supaya bisa dibandingkan. Satu hal yang tidak dimiliki kunci buncis dan justru menentukan cara kerja di kebun: kacang panjang tipe merambat DIPANEN BERULANG selama berminggu-minggu sementara tanaman masih berbunga, sehingga fase panen berjalan bersamaan dengan fase pembungaan dan pembentukan polong, bukan sesudahnya.',
  },
  basis: 'phenology',
  applies_to: { commodity_kinds: ['crop'], commodities: [] },
  no_mapping_reason: 'Tidak ada kunci BBCH yang pernah diterbitkan untuk Vigna unguiculata. Kunci buncis pada BBCH Monograph menyebut Phaseolus vulgaris var. nanus; pustaka memang memakai kodenya pada Vigna, tetapi itu pemakaian informal, bukan kunci terbitan, dan menyalinnya akan mengarang kewenangan yang tidak dimiliki sumbernya. Ditinjau ulang bila kunci BBCH untuk Vigna unguiculata terbit.',
  notes: {
    id: 'Padanan fase VE/VC/V/R/RH disebut pada tiap fase karena penahapan itu yang dipakai pustaka kacang tunggak, dan Bean IPM mendokumentasikannya. Halaman Bean IPM sendiri menolak diambil mesin pada Agustus 2026, jadi rumusan di berkas ini tulisan kami yang mengikuti pola penahapan legum, BUKAN salinan halaman itu — perbedaan yang perlu diketahui siapa pun yang mau memverifikasi. Jangkar hari pada sisi polong berasal dari Ofori & Klogo (2005), yang dibaca utuh: polong dan biji membesar paling cepat 0–15 hari sesudah bunga mekar, waktu terbaik memetik polong segar 15 hari, kadar air turun pada 15–25 hari, dan 20 hari memberi kompromi terbaik untuk benih. Angka itu dari percobaan di Ghana; kultivar dan iklim Indonesia bisa menggeser, dan penggeseran itu justru yang perlu diukur di Fase 1. Skala ini berstatus draft dan dimaksudkan diperbaiki dengan pengamatan lapangan, bukan dianggap selesai.',
  },
  stages,
  lifecycle: { version: '0.1.0', status: 'draft', created_at: STAMP, review_due: '2027-02-19' },
  provenance: {
    license: 'CC-BY-SA-4.0',
    sources: [
      {
        title: 'Optimum Time for Harvesting Yardlong Bean (Vigna sesquipedalis) for High Yield and Quality of Pods and Seeds',
        publisher: 'Journal of Agriculture & Social Sciences 1(2):86–88',
        year: 2005,
        locator: 'K. Ofori & P.Y. Klogo, Department of Crop Science, University of Ghana; tiga fase perkembangan polong 0–15, 15–25 hari sesudah bunga mekar, panen polong segar terbaik 15 hari, benih terbaik 20 hari',
      },
      {
        title: 'Cowpea Growth Stages',
        publisher: 'Bean IPM (beanipm.pbgworks.org)',
        url: 'https://beanipm.pbgworks.org/cowpea',
        locator: 'Penahapan VE, VC, V1 ke atas, R1–R7, RH untuk Vigna unguiculata. Dipakai sebagai rujukan pola penahapan; halamannya tidak bisa diambil mesin, jadi rumusan fase di berkas ini bukan salinannya',
      },
    ],
  },
  id_blocks: [{ from: 21, to: 21 }],
};

writeFileSync(join(VOCAB, 'stage-scale-kacang-panjang.json'), JSON.stringify(doc, null, 2) + '\n');
console.log(`stage-scale-kacang-panjang.json: ${stages.length} fase — ${stages.map((s) => s.code).join(' ')}`);
