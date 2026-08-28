// Menautkan komoditas yang lebih SEMPIT ke yang lebih luas.
//
//   node spec/tools/tautkan-komoditas-broader.mjs            # periksa saja
//   node spec/tools/tautkan-komoditas-broader.mjs --tulis    # tulis perubahannya
//
// KENAPA BUKAN PENYATUAN
// satukan-komoditas-ejaan.mjs menyatukan yang memang satu hal ditulis dua cara — "Beras
// dalam penyimpanan" dan "Beras di penyimpanan". Yang di bawah ini BUKAN itu: "Cabai
// merah" benar-benar lebih sempit daripada "Cabai", dan registri VARIETAS memakai
// pembedaannya — 35 catatan varietas berdiri di atas "Cabai merah", 103 di atas "Cabai",
// 8 di atas "Jeruk Siam". Menyatukannya membuang pembedaan yang memang dimaksud, dan itu
// sudah dicoba lalu dibatalkan.
//
// Tetapi membiarkannya terpisah juga salah, dan salahnya terlihat di layar: pintu
// antraknosa berinang "Cabai" tidak menjangkau tiga baris yang registrinya menulis "Cabai
// merah", padahal apa pun yang berlaku untuk cabai berlaku untuk cabai merah.
//
// ARAHNYA SATU, DAN ITU YANG MENAHANNYA JADI TEBAKAN
// Yang lebih luas menjangkau ke bawah; yang lebih sempit TIDAK menjangkau ke atas.
// Pendaftaran yang tertulis "Bawang" karena itu tidak ikut — bisa saja yang dimaksud
// bawang putih, dan mengklaimnya untuk pintu bawang merah adalah menebak. Barisnya
// dibiarkan di luar jangkauan, dan itu jawaban yang benar.
//
// Idempoten: tautan yang sudah betul dilewati.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VOCAB = join(akar, 'spec', 'vocab');
const STAMP = '2026-08-28T00:00:00Z';
const tulis = process.argv.includes('--tulis');

// `dasar` wajib menyebut kenapa yang satu benar-benar TERMASUK di dalam yang lain, dan
// kenapa keduanya tetap dipisah.
const TAUTAN = [
  { sempit: 'op:cmd:00001033', nama: 'Cabai merah', luas: 'op:cmd:00001003',
    dasar: 'Cabai merah salah satu bentuk cabai, dan apa pun yang terdaftar untuk cabai berlaku baginya. Tetap terpisah karena 35 catatan varietas berdiri di atasnya, dan registri memakai pembedaannya terhadap cabai rawit.' },
  { sempit: 'op:cmd:00000001', nama: 'Cabai merah besar', luas: 'op:cmd:00001003',
    dasar: 'Cabai merah besar bentuk cabai yang lebih sempit lagi, dan entitas terkurasi paling awal di kosakata ini; tetap terpisah karena siklus contoh dan skala fase berdiri di atasnya.' },
  { sempit: 'op:cmd:00000002', nama: 'Cabai rawit', luas: 'op:cmd:00001003',
    dasar: 'Cabai rawit bentuk cabai yang registri kadang menyebut sendiri; tetap terpisah karena pembedaannya terhadap cabai merah memang dimaksud pada sebagian pendaftaran.' },
  { sempit: 'op:cmd:00001415', nama: 'Jeruk Siam', luas: 'op:cmd:00001015',
    dasar: 'Jeruk siam varietas jeruk keprok yang paling luas ditanam di Indonesia, jadi ia termasuk di dalam jeruk. Tetap terpisah karena delapan catatan varietas berdiri di atasnya.' },
  { sempit: 'op:cmd:00001343', nama: 'Jeruk nipis', luas: 'op:cmd:00001015',
    dasar: 'Jeruk nipis jenis jeruk tersendiri — Citrus aurantiifolia — sehingga ia termasuk di dalam jeruk sebagai komoditas, tetapi tetap terpisah karena buah dan pemakaiannya berbeda dari jeruk manis.' },
  { sempit: 'op:cmd:00001194', nama: 'Padi sawah', luas: 'op:cmd:00000006',
    dasar: 'Padi sawah padi yang ditanam pada lahan tergenang, jadi ia termasuk di dalam padi. Tetap terpisah karena pembedaannya terhadap padi gogo menentukan pada pendaftaran herbisida, yang menyebut cara olah tanah dan cara tanamnya.' },
];

const bacaJson = (p) => JSON.parse(readFileSync(join(VOCAB, p), 'utf8'));
const kunciLarik = (o) => (Array.isArray(o) ? null : Object.keys(o).find((k) => Array.isArray(o[k])));
const larik = (o) => (Array.isArray(o) ? o : o[kunciLarik(o)]);

const bungkusRegistri = bacaJson('commodity-registri.json');
const bungkusKurasi = bacaJson('commodity.json');
const olehId = new Map([...larik(bungkusKurasi), ...larik(bungkusRegistri)].map((e) => [e.id, e]));

const bantah = [];
const pasang = [];
const dilewati = [];

for (const t of TAUTAN) {
  const s = olehId.get(t.sempit);
  const l = olehId.get(t.luas);
  if (!s) { bantah.push(`${t.sempit} tidak ada.`); continue; }
  if (!l) { bantah.push(`${t.luas} tidak ada — komoditas yang lebih luas hilang.`); continue; }
  if (s.label?.id !== t.nama) { bantah.push(`${t.sempit} berlabel "${s.label?.id}", diharapkan "${t.nama}". Entri registri berubah; periksa dulu.`); continue; }
  if (s.lifecycle?.status === 'superseded') { bantah.push(`${t.sempit} sudah digantikan; tautkan penerusnya, atau hapus barisnya.`); continue; }
  if (l.lifecycle?.status === 'superseded') { bantah.push(`${t.luas} sudah digantikan; jangan jadikan tujuan.`); continue; }
  if (t.sempit === t.luas) { bantah.push(`${t.sempit} menunjuk dirinya sendiri.`); continue; }
  if (!t.dasar || t.dasar.length < 60) { bantah.push(`${t.sempit}: dasar terlalu pendek untuk diperiksa orang lain.`); continue; }
  if (s.broader?.id === t.luas) { dilewati.push(t.sempit); continue; }
  s.broader = { id: t.luas, label: l.label?.id };
  s.lifecycle = { ...(s.lifecycle ?? {}), updated_at: STAMP };
  pasang.push(`${t.nama} → ${l.label?.id}`);
}

// Rantai berputar. Tidak mungkin dari tabel di atas, tetapi tabelnya akan tumbuh, dan
// putaran membuat penjangkauan di bangun-indeks.mjs berjalan selamanya.
for (const e of olehId.values()) {
  const lewat = new Set([e.id]);
  let kini = e.broader?.id;
  while (kini) {
    if (lewat.has(kini)) { bantah.push(`rantai broader berputar di ${kini}.`); break; }
    lewat.add(kini);
    kini = olehId.get(kini)?.broader?.id;
  }
}

if (bantah.length) {
  for (const x of bantah) console.error(`  TOLAK  ${x}`);
  console.error(`\n${bantah.length} penolakan — tidak ada yang ditulis.`);
  process.exit(1);
}

for (const x of pasang) console.log(`  taut    ${x}`);
console.log(`\n  commodity*.json — ${pasang.length} tautan dipasang, ${dilewati.length} sudah betul`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyimpan.');
  process.exit(0);
}

writeFileSync(join(VOCAB, 'commodity-registri.json'), JSON.stringify(bungkusRegistri, null, 2) + '\n');
writeFileSync(join(VOCAB, 'commodity.json'), JSON.stringify(bungkusKurasi, null, 2) + '\n');
console.log('\nDitulis.');
