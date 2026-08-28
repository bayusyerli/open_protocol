// Membetulkan `pest_kind` pada entitas registri yang salah golongan.
//
//   node spec/tools/perbaiki-jenis-opt.mjs            # periksa saja
//   node spec/tools/perbaiki-jenis-opt.mjs --tulis    # tulis perubahannya
//
// KENAPA INI TIDAK BISA DIHITUNG
// `pest_kind` diturunkan dari kingdom dan kelas GBIF, dan itu keputusan yang benar: ia
// mengganti penurunan dari nama Indonesia, yang dulu menempatkan Phytophthora di jamur
// sejati. Tetapi penurunan itu diam pada baris yang GBIF sendiri tidak kenali — dan yang
// tersisa persis baris yang paling perlu digolongkan tangan:
//
//   "Philantus niruri"        salah eja Phyllanthus niruri, meniran — TUMBUHAN,
//                             dan label registrinya sendiri berbunyi "Gulma Berdaun Lebar"
//   "Fentin hydroxide"        nama BAHAN AKTIF yang tersalin ke kolom sasaran
//   "Mematikan tunggul"       MAKSUD perlakuan, bukan sasarannya
//   "Elaeidobius kamerunicus" kumbang penyerbuk kelapa sawit — yang justru DIJAGA
//
// Ketiga bentuk terakhir tidak akan pernah tertangkap aturan apa pun, karena bentuknya
// sah: dua kata berawalan huruf besar, persis seperti nama ilmiah.
//
// APA YANG RUSAK KALAU DIBIARKAN
// Dua hal. Pertama pembukuan: 144 baris yang tercatat "OPT belum berpintu" ternyata memuat
// belasan baris yang tidak akan pernah punya pintu, dan angka yang mencampurnya menyuruh
// orang mengerjakan sesuatu yang tidak ada. Kedua, dan lebih buruk: selama golongannya
// masih "insect", tidak ada yang menghalangi seseorang menulis teks gejala untuk
// "Mematikan tunggul" — atau, pada Elaeidobius, menulis pintu yang menganjurkan menyemprot
// penyerbuk yang justru menentukan hasil panen sawit.
//
// Idempoten: entri yang golongannya sudah betul dilewati.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VOCAB = join(akar, 'spec', 'vocab');
const STAMP = '2026-08-28T00:00:00Z';
const tulis = process.argv.includes('--tulis');

// `dasar` wajib menyebut KENAPA golongannya begitu, bukan cuma menyatakan golongannya.
const BETULKAN = [
  // --- tumbuhan yang tercatat sebagai serangga ---
  { id: 'op:pst:00001882', nama: 'Philantus niruri', jadi: 'weed',
    dasar: 'Salah eja Phyllanthus niruri, meniran — tumbuhan berdaun lebar. Label registrinya sendiri berbunyi "Gulma Berdaun Lebar", jadi kolom nama dan kolom golongannya bertentangan di baris yang sama.' },
  { id: 'op:pst:00001779', nama: 'Brachia mutica', jadi: 'weed',
    dasar: 'Salah eja Brachiaria mutica, rumput bebek — rumput menahun. Label registrinya berbunyi "Gulma Golongan Rumput".' },
  { id: 'op:pst:00001996', nama: 'Rotalia indica', jadi: 'weed',
    dasar: 'Salah eja Rotala indica, gulma sawah berdaun lebar. Tercatat disease_oomycete, yang tidak mungkin: label registrinya berbunyi "Gulma Berdaun Lebar".' },
  { id: 'op:pst:00001980', nama: 'Alternantera philoxoides', jadi: 'weed',
    dasar: 'Salah eja Alternanthera philoxeroides, kremah air — gulma air berdaun lebar yang lazim di pematang sawah, bukan serangga.' },
  { id: 'op:pst:00002168', nama: 'Melostoma mabathricunm', jadi: 'weed',
    dasar: 'Salah eja Melastoma malabathricum, senduduk — perdu berkayu yang jadi gulma utama di piringan kelapa sawit muda.' },
  { id: 'op:pst:00001639', nama: 'Nephrolepsis sp.', jadi: 'weed',
    dasar: 'Salah eja Nephrolepis, paku pedang — tumbuhan paku yang tumbuh di batang kakao dan teh, bukan serangga.' },
  { id: 'op:pst:00002219', nama: 'Kacangan penutup', jadi: 'weed',
    dasar: 'Bukan nama organisme melainkan sebutan untuk kacangan penutup tanah di kebun sawit. Digolongkan tumbuhan karena memang tumbuhan; bahwa ia ditanam sengaja urusan lain, dan yang menentukan di sini kolom sasaran herbisida.' },

  { id: 'op:pst:00002194', nama: 'Naphrolepsis sp.', jadi: 'weed',
    dasar: 'Salah eja Nephrolepis, paku pedang — sama dengan entri "Nephrolepsis sp." yang sudah dibetulkan; tumbuhan paku yang tumbuh menempel di batang cengkeh, bukan serangga.' },
  { id: 'op:pst:00002270', nama: 'Mempercepat pematangan', jadi: 'not_an_organism',
    dasar: 'Menyebut MAKSUD perlakuan — mempercepat pematangan buah manggis dengan zat pengatur tumbuh — bukan organisme yang dikendalikan.' },

  // --- organisme yang justru dijaga ---
  { id: 'op:pst:00001924', nama: 'Elaeidobius kamerunicus', jadi: 'beneficial',
    dasar: 'Kumbang penyerbuk kelapa sawit, dan satu-satunya penyerbuk yang menentukan pembentukan buah sejak dilepas 1982. Ia tercatat sebagai "sasaran" hanya karena label menyatakan produknya aman baginya; menawarkan pintu gejala untuknya berarti menganjurkan menyemprot yang justru menentukan hasil panen.' },
  { id: 'op:pst:00002210', nama: 'Elaedobius spp.', jadi: 'beneficial',
    dasar: 'Salah eja Elaeidobius, marga kumbang penyerbuk kelapa sawit yang sama. Dijaga, bukan dikendalikan.' },

  // --- bukan makhluk hidup sama sekali ---
  { id: 'op:pst:00002330', nama: 'Fentin hydroxide', jadi: 'not_an_organism',
    dasar: 'Nama BAHAN AKTIF — senyawa organotin moluskisida — yang tersalin ke kolom sasaran. Labelnya berbunyi "Siput Murbei", jadi sasaran sebenarnya Pomacea; barisnya sendiri menyebut bahannya, bukan sasarannya.' },
  { id: 'op:pst:00001679', nama: 'Mematikan tunggul', jadi: 'not_an_organism',
    dasar: 'Menyebut MAKSUD perlakuan — mematikan tunggul pohon karet supaya tidak bertunas lagi — bukan organisme yang dikendalikan.' },
  { id: 'op:pst:00002288', nama: 'Mematikan tunggak', jadi: 'not_an_organism',
    dasar: 'Sama dengan "Mematikan tunggul": maksud perlakuan pada tunggak pohon karet, bukan organisme.' },
  { id: 'op:pst:00001751', nama: 'Meningkat tinggi', jadi: 'not_an_organism',
    dasar: 'Potongan kalimat yang tersalin ke kolom sasaran; tidak menyebut organisme, tidak menyebut perlakuan, dan tidak bisa ditafsirkan tanpa dokumen aslinya.' },
  { id: 'op:pst:00002274', nama: 'Mempengaruhi pada', jadi: 'not_an_organism',
    dasar: 'Potongan kalimat yang tersalin ke kolom sasaran, sama seperti "Meningkat tinggi".' },
];

const bacaJson = (p) => JSON.parse(readFileSync(join(VOCAB, p), 'utf8'));
const kunciLarik = (o) => (Array.isArray(o) ? null : Object.keys(o).find((k) => Array.isArray(o[k])));
const larik = (o) => (Array.isArray(o) ? o : o[kunciLarik(o)]);

const bungkus = bacaJson('pest-registri.json');
const olehId = new Map(larik(bungkus).map((e) => [e.id, e]));

const bantah = [];
const ubah = [];
const dilewati = [];

for (const b of BETULKAN) {
  const e = olehId.get(b.id);
  if (!e) { bantah.push(`${b.id} tidak ada.`); continue; }
  // Penjaga nama: entri registri bisa berubah pada tarikan berikutnya, dan membetulkan
  // golongan entri yang BUKAN yang dimaksud lebih buruk daripada tidak membetulkan apa pun.
  if (e.scientific_name !== b.nama) { bantah.push(`${b.id} bernama ilmiah "${e.scientific_name}", diharapkan "${b.nama}". Entri registri berubah; periksa dulu.`); continue; }
  if (!b.dasar || b.dasar.length < 60) { bantah.push(`${b.id}: dasar terlalu pendek untuk diperiksa orang lain.`); continue; }
  if (e.pest_kind === b.jadi) { dilewati.push(b.id); continue; }
  ubah.push(`${e.label?.id} (${b.nama}) — ${e.pest_kind} → ${b.jadi}`);
  e.pest_kind = b.jadi;
  e.lifecycle = { ...(e.lifecycle ?? {}), updated_at: STAMP };
}

if (bantah.length) {
  for (const x of bantah) console.error(`  TOLAK  ${x}`);
  console.error(`\n${bantah.length} penolakan — tidak ada yang ditulis.`);
  process.exit(1);
}

for (const x of ubah) console.log(`  betul   ${x}`);
console.log(`\n  pest-registri.json — ${ubah.length} golongan dibetulkan, ${dilewati.length} sudah betul`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyimpan.');
  process.exit(0);
}

writeFileSync(join(VOCAB, 'pest-registri.json'), JSON.stringify(bungkus, null, 2) + '\n');
console.log('\nDitulis.');
