// Menyusun skala fase budidaya durian:
//   vocab/stage-scale-durian.json   op:sca:00000020, fase op:stg:00002000-2099
//
// BUKAN skala BBCH. Tidak ada kunci BBCH durian yang pernah diterbitkan siapa pun —
// monograf BBCH memuat 28 kunci tanaman dan durian bukan salah satunya, dan
// penelusuran pustaka tidak menemukan terbitan lain. Skala ini disusun sendiri,
// mengikuti pola skala DOC udang vaname yang juga tidak punya standar terbitan.
//
// Yang menopangnya:
//   - urutan fase: kosakata praktisi durian yang lazim dipakai di Malaysia,
//     Indonesia, dan Vietnam — mata ketam, kuncup putih, antesis, gugur buah muda
//   - jangkar hari pada buah: Husin dkk. (2023) pada kultivar D24
//   - fase vegetatif: pemantauan fenologi pohon durian di Queensland utara,
//     Diczbalis dkk., yang menilai pucuk sebagai baru / mengeras / tua
//
// Yang TIDAK ditopang sumber, dan karena itu tidak dicantumkan: angka hari untuk
// fase bunga, dan lama periode kering yang memicu induksi. Keduanya beredar di
// pustaka penyuluhan tanpa rujukan yang bisa dilacak.
//
// Jalankan dari akar repositori:  node spec/tools/bangun-skala-durian.mjs

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const VOCAB = join(dirname(fileURLToPath(import.meta.url)), '..', 'vocab');
const STAMP = '2026-08-19T00:00:00Z';

const FASE = [
  ['DUR-V0', 'Istirahat setelah panen',
   'Pohon berhenti berbuah. Akar dan tajuk memulihkan cadangan makanan, dan belum ada pucuk baru. Diczbalis dkk. memakai periode ini sebagai salah satu dari tiga saat injeksi fosfonat, karena penyerapan ke akar paling baik ketika tajuk tidak sedang tumbuh.'],
  ['DUR-V1', 'Trubus daun',
   'Pucuk baru serentak keluar; daun muda tipis, mengilap, warnanya lebih pucat atau kemerahan, dan belum mengeras. Trubus durian sering tidak merata — sebagian tajuk bertrubus, sebagian belum.'],
  ['DUR-V2', 'Daun mengeras',
   'Daun trubus terakhir menua: menebal, hijau tua, dan mengeras. Inilah keadaan yang dicari sebelum pembungaan diinduksi; pohon yang masih bertrubus tidak akan berbunga.'],
  ['DUR-G0', 'Induksi bunga',
   'Periode kering yang memicu pembentukan bakal bunga. Pemicunya cekaman air, bukan umur, sehingga panjang fase ini ditentukan cuaca dan bukan kalender. Belum ada tanda apa pun yang tampak pada cabang.'],
  ['DUR-G1', 'Mata ketam',
   'Bakal bunga pertama tampak sebagai bintik kecil menonjol pada cabang dan batang — namanya diambil dari bentuknya. Ini tanda paling awal yang bisa dilihat mata, dan penanda bahwa induksi berhasil.'],
  ['DUR-G2', 'Kuncup memanjang',
   'Bakal bunga tumbuh jadi dompolan yang memanjang, kuncup-kuncupnya mulai terpisah satu sama lain dan tangkainya memanjang.'],
  ['DUR-G3', 'Kuncup putih',
   'Kuncup membesar cepat dan memutih menjelang mekar. Pembesaran terbesar terjadi pada hari-hari terakhir sebelum antesis.'],
  ['DUR-G4', 'Antesis',
   'Bunga mekar. Durian mekar sore sampai malam dan diserbuki malam hari, terutama oleh kelelawar — waktu penyemprotan apa pun pada fase ini menentukan hidup-matinya penyerbuk.'],
  ['DUR-B0', 'Buah jadi',
   'Bakal buah mulai membesar sesudah penyerbukan berhasil. Sebagian besar bunga tidak menjadi buah.'],
  ['DUR-B1', 'Gugur buah muda',
   'Periode gugur buah muda. Sebagian gugur karena tidak terserbuki sempurna, sebagian karena pohon menyeimbangkan jumlah buah dengan kemampuannya. Penjarangan buah biasanya dikerjakan sesudah periode ini reda.'],
  ['DUR-B2', 'Pembesaran buah',
   'Buah membesar cepat: duri terbentuk penuh, daging buah mulai terisi. Fase terpanjang dalam siklus buah dan yang paling banyak menuntut hara serta air.'],
  ['DUR-B3', 'Masak fisiologis',
   'Buah mencapai ukuran akhir dan mutu makannya terbentuk, tetapi belum lunak. Pada kultivar D24, Husin dkk. mencatat buah muda pada 90 hari setelah antesis dan buah masak pada 120 hari; kultivar lain berbeda-beda, sehingga angka ini penanda kasar, bukan patokan.'],
  ['DUR-P0', 'Panen',
   'Dua cara panen yang berbeda berakhir di sini, dan keduanya sah. Buah dipetik pada masak fisiologis lalu diperam — cara yang lazim untuk pengiriman jauh — atau dibiarkan masak di pohon sampai jatuh sendiri, cara yang lazim di kebun rakyat dan yang menentukan mutu rasa menurut banyak petani.'],
  ['DUR-P1', 'Pemeraman',
   'Buah yang dipetik melunak dan matang sesudah lepas dari pohon. Husin dkk. mencatat buah D24 yang dipetik pada 120 hari setelah antesis matang penuh setelah sekitar tujuh hari pada suhu ruang. Fase ini tidak berlaku untuk buah yang dibiarkan jatuh sendiri.'],
];

const stages = FASE.map(([code, label, definisi], i) => ({
  id: `op:stg:${String(2000 + i).padStart(8, '0')}`,
  code,
  label: { id: label },
  definition: { id: definisi },
  order: i,
}));

const doc = {
  $schema: '../schema/stage-scale.schema.json',
  id: 'op:sca:00000020',
  key: 'fase-durian',
  label: { id: 'Fase budidaya durian (Durio zibethinus)', en: 'Durian cultivation stage scale' },
  definition: {
    id: 'Empat belas fase budidaya durian, dari istirahat setelah panen sampai pemeraman. BUKAN skala BBCH: tidak ada kunci BBCH durian yang pernah diterbitkan, dan skala ini disusun sendiri mengikuti pola skala DOC udang vaname. Urutan fasenya memakai kosakata praktisi yang lazim di Malaysia, Indonesia, dan Vietnam — mata ketam, kuncup putih, antesis, gugur buah muda — sementara jangkar hari pada sisi buah diambil dari penelitian yang bisa dirujuk. Tiga hal membuat siklus durian tidak muat di kunci tanaman semusim mana pun: pembungaannya dipicu cekaman kering dan bukan umur, sehingga panjang siklusnya ditentukan cuaca; penyerbukannya berlangsung malam hari oleh kelelawar, sehingga fase antesis punya akibat langsung pada aturan penyemprotan; dan panennya punya dua cara sah yang berakhir berbeda — dipetik lalu diperam, atau dibiarkan jatuh sendiri.',
  },
  basis: 'phenology',
  applies_to: { commodity_kinds: ['crop'], commodities: [] },
  no_mapping_reason: 'Tidak ada kunci BBCH durian yang pernah diterbitkan siapa pun. BBCH Monograph edisi ke-2 (2001) memuat 28 kunci tanaman dan durian bukan salah satunya; penelusuran pustaka pada Agustus 2026 juga tidak menemukan terbitan lain, hanya penelitian fenologi dengan kosakata masing-masing. Skala ini karena itu tidak memetakan diri ke skema luar mana pun. Ditinjau ulang bila kunci BBCH durian terbit.',
  notes: {
    id: 'Yang sengaja TIDAK dicantumkan: angka hari untuk fase bunga (mata ketam sampai antesis) dan lama periode kering yang memicu induksi. Keduanya beredar luas di pustaka penyuluhan tetapi rujukannya tidak bisa dilacak sampai ke pengamatan aslinya, dan menaruhnya di sini akan memberi kesan pasti yang tidak dimiliki sumbernya. Yang dicantumkan hanya jangkar hari pada sisi buah, dari Husin dkk. (2023) pada kultivar D24. Angka itu pun kultivar-spesifik: pustaka menyebut rentang antesis sampai masak yang berbeda-beda antar-kultivar, jadi 120 hari bukan patokan yang bisa dipindahkan begitu saja. Fase vegetatif mengikuti pembagian pucuk baru / mengeras / tua yang dipakai Diczbalis dkk. dalam pemantauan fenologi durian di Queensland utara. Skala ini berstatus draft dan dimaksudkan untuk diperbaiki dengan pengamatan lapangan Fase 1, bukan dianggap selesai.',
  },
  stages,
  lifecycle: { version: '0.1.0', status: 'draft', created_at: STAMP, review_due: '2027-02-19' },
  provenance: {
    license: 'CC-BY-SA-4.0',
    sources: [
      {
        title: 'Transcriptome analysis during fruit developmental stages in durian (Durio zibethinus Murr.) var. D24',
        publisher: 'Genetics and Molecular Biology 45(4):e20210379',
        year: 2023,
        url: 'https://doi.org/10.1590/1678-4685-GMB-2021-0379',
        locator: 'Husin, Rahman, Karunakaran & Bhore; fase buah muda 90 hari setelah antesis, masak 120 hari, matang 127 hari',
      },
      {
        title: 'Durian Tree Phenology and the Control of Phytophthora Diseases of Durian Using Phosphonate Trunk Injection',
        publisher: 'ACIAR proceedings, bab 8.5',
        locator: 'Diczbalis, Vawdrey, Alvero, Campagnolo, Huynh Van Thanh, Mai Van Tri, Binh, Binh, Tan, Nguyen Minh Chau, O’Gara & Guest; pemantauan fenologi 30 bulan di Queensland utara, penilaian pucuk baru/mengeras/tua',
      },
    ],
  },
  id_blocks: [{ from: 20, to: 20 }],
};

writeFileSync(join(VOCAB, 'stage-scale-durian.json'), JSON.stringify(doc, null, 2) + '\n');
console.log(`stage-scale-durian.json: ${stages.length} fase — ${stages.map((s) => s.code).join(' ')}`);
