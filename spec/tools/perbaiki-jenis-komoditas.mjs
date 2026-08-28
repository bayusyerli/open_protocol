// Menandai baris kolom komoditas yang BUKAN komoditas.
//
//   node spec/tools/perbaiki-jenis-komoditas.mjs            # periksa saja
//   node spec/tools/perbaiki-jenis-komoditas.mjs --tulis    # tulis perubahannya
//
// APA YANG DITEMUKAN
// Pendaftaran pestisida rumah tangga mengisi kolom KOMODITAS dengan sasarannya —
// "Kecoak", "Nyamuk", "Rayap tanah", "Tikus rumah" — atau dengan konteks pemakaiannya:
// "Di dalam ruangan", "Di luar rumah", "Umum". Bentuknya sah sebagai entri komoditas dan
// tidak ada aturan yang bisa menolaknya, karena "Kecoak" tidak berbeda bentuknya dari
// "Kubis".
//
// Pasangannya perbaiki-jenis-opt.mjs, yang menangani sisi seberangnya: kolom SASARAN yang
// berisi nama bahan aktif atau potongan kalimat. Dua kolom, dua arah, cacat yang sama.
//
// KENAPA INI BUKAN KERAPIAN
// Dua hal. Pertama pembukuan: cakupan jalur 1 dihitung terhadap "baris label pada
// komoditas pertanian", dan memasukkan 24 entri ini membuat angkanya terbaca lebih buruk
// daripada sebenarnya sekaligus menyuruh orang mengurasi sesuatu yang tidak ada. Kedua,
// dan lebih buruk: selama golongannya masih "crop", tidak ada yang menghalangi seseorang
// menulis pintu gejala untuk "Umum" — atau menaruh keping "Kecoak" di saringan tanaman.
//
// YANG SENGAJA TIDAK DITANDAI
// "Beras di penyimpanan", "Tepung terigu dalam penyimpanan", dan sejenisnya TETAP
// komoditas: itu hasil pertanian yang disimpan, dan pintu hama gudang memang berdiri di
// atasnya. Yang ditandai hanya yang bukan hasil pertanian sama sekali.
//
// Idempoten: entri yang golongannya sudah betul dilewati.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VOCAB = join(akar, 'spec', 'vocab');
const STAMP = '2026-08-28T00:00:00Z';
const tulis = process.argv.includes('--tulis');

// `dasar` wajib menyebut APA isinya sebenarnya, bukan cuma bahwa ia bukan komoditas.
const BETULKAN = [
  // --- kolom komoditas berisi SASARANNYA ---
  { id: 'op:cmd:00001069', nama: 'Nyamuk', dasar: 'Nama sasaran, bukan komoditas: pendaftaran pestisida rumah tangga menaruh nyamuk di kolom komoditas karena tidak ada tanaman yang dilindungi.' },
  { id: 'op:cmd:00001110', nama: 'Jentik nyamuk', dasar: 'Nama sasaran pada fase larva, bukan komoditas; larvasida diterapkan pada genangan air, bukan pada tanaman.' },
  { id: 'op:cmd:00001225', nama: 'Larva nyamuk', dasar: 'Kata lain untuk jentik nyamuk, dan sama-sama nama sasaran di kolom komoditas.' },
  { id: 'op:cmd:00001286', nama: 'Kecoak', dasar: 'Nama sasaran pestisida rumah tangga di kolom komoditas; tidak ada tanaman maupun hasil pertanian yang dilindungi pendaftaran ini.' },
  { id: 'op:cmd:00001297', nama: 'Semut', dasar: 'Nama sasaran pestisida rumah tangga di kolom komoditas, dan berbeda dari semut api yang memelihara kutu di kebun — yang ini pendaftaran untuk di dalam bangunan.' },
  { id: 'op:cmd:00001298', nama: 'Kutu busuk', dasar: 'Nama sasaran pestisida rumah tangga di kolom komoditas; Cimex hidup di kasur dan celah dinding, bukan pada tanaman.' },
  { id: 'op:cmd:00001162', nama: 'Rayap tanah', dasar: 'Nama sasaran di kolom komoditas. Rayap tanah memang menyerang kelapa sawit dan karet — dan pintunya berdiri di atas komoditas itu — tetapi entri ini pendaftaran perlindungan BANGUNAN.' },
  { id: 'op:cmd:00001089', nama: 'Tikus sawah', dasar: 'Nama sasaran di kolom komoditas. Pintu tikus sawah berdiri di atas komoditas Padi; entri ini bukan komoditas melainkan salinan nama sasarannya.' },
  { id: 'op:cmd:00001116', nama: 'Tikus pohon', dasar: 'Nama sasaran di kolom komoditas; pintunya berdiri di atas komoditas Kelapa sawit.' },
  { id: 'op:cmd:00001239', nama: 'Tikus belukar', dasar: 'Nama sasaran di kolom komoditas, tanpa tanaman yang dilindungi.' },
  { id: 'op:cmd:00001356', nama: 'Tikus rumah', dasar: 'Nama sasaran pengendalian tikus di dalam bangunan, ditaruh di kolom komoditas.' },

  // --- kolom komoditas berisi KONTEKS PEMAKAIAN ---
  { id: 'op:cmd:00001056', nama: 'Pestisida Rumah Tangga', dasar: 'Golongan pendaftaran, bukan komoditas: ia menyatakan produknya untuk rumah tangga, bukan menyatakan apa yang dilindungi.' },
  { id: 'op:cmd:00001084', nama: 'Di luar rumah', dasar: 'Tempat pemakaian, bukan komoditas; menyatakan di mana produknya boleh dipakai.' },
  { id: 'op:cmd:00001264', nama: 'Di dalam rauangan', dasar: 'Tempat pemakaian — salah ketik "di dalam ruangan" — bukan komoditas.' },
  { id: 'op:cmd:00001287', nama: 'Umum', dasar: 'Tidak menyebut apa pun: kata "umum" di kolom komoditas menandai pendaftaran yang tidak dibatasi tanaman tertentu.' },
  { id: 'op:cmd:00001076', nama: 'Padang rumput golf', dasar: 'Rumput lapangan golf dipelihara sebagai permukaan main, bukan dipanen; tidak ada hasil pertanian yang keluar darinya.' },
  { id: 'op:cmd:00001123', nama: 'Kebutuhan Export', dasar: 'Menyatakan tujuan perlakuan — fumigasi untuk memenuhi syarat ekspor — bukan komoditas yang diperlakukan.' },
  { id: 'op:cmd:00001510', nama: 'Penyimpanan hasil pertanian', dasar: 'Menyebut TEMPATnya, bukan hasil pertanian mana yang disimpan; gudangnya sendiri bukan komoditas, dan hasil yang di dalamnya punya entri sendiri.' },

  { id: 'op:cmd:00001247', nama: 'AGITA 10 WG', dasar: 'Nama DAGANG produk yang tersalin ke kolom komoditas; barisnya pendaftaran umpan lalat untuk kandang, dan komoditas yang dilindungi tidak ada.' },

  // --- pakan ternak dan kandang ---
  { id: 'op:cmd:00001254', nama: 'Pakan ternak (Corn Mill)', dasar: 'Pakan ternak olahan, bukan hasil pertanian yang dipanen; jagung yang jadi bahannya punya entri sendiri.' },
  { id: 'op:cmd:00001227', nama: 'Bahan Pakan Ternak (Corn mill)', dasar: 'Kata lain untuk pakan ternak olahan yang sama, dan sama-sama bukan komoditas panen.' },
  { id: 'op:cmd:00001455', nama: 'Area peternakan ayam', dasar: 'Tempat pemakaian — kandang ayam — bukan komoditas; sasarannya lalat kandang.' },
  { id: 'op:cmd:00001484', nama: 'Peternakan ayam', dasar: 'Tempat pemakaian yang sama dengan "Area peternakan ayam", ditulis lebih pendek.' },
  { id: 'op:cmd:00001435', nama: 'Bungkil kelapa sawit', dasar: 'Hasil SAMPING pengolahan yang dipakai sebagai bahan pakan, bukan komoditas yang dipanen dari kebun.' },
];

const bacaJson = (p) => JSON.parse(readFileSync(join(VOCAB, p), 'utf8'));
const kunciLarik = (o) => (Array.isArray(o) ? null : Object.keys(o).find((k) => Array.isArray(o[k])));
const larik = (o) => (Array.isArray(o) ? o : o[kunciLarik(o)]);

const bungkusRegistri = bacaJson('commodity-registri.json');
const bungkusKurasi = bacaJson('commodity.json');
const olehId = new Map([...larik(bungkusKurasi), ...larik(bungkusRegistri)].map((e) => [e.id, e]));

const bantah = [];
const ubah = [];
const dilewati = [];

for (const b of BETULKAN) {
  const e = olehId.get(b.id);
  if (!e) { bantah.push(`${b.id} tidak ada.`); continue; }
  // Penjaga nama: entri registri bisa berubah pada tarikan berikutnya, dan menandai entri
  // yang BUKAN yang dimaksud lebih buruk daripada tidak menandai apa pun.
  if (e.label?.id !== b.nama) { bantah.push(`${b.id} berlabel "${e.label?.id}", diharapkan "${b.nama}". Entri registri berubah; periksa dulu.`); continue; }
  if (!b.dasar || b.dasar.length < 60) { bantah.push(`${b.id}: dasar terlalu pendek untuk diperiksa orang lain.`); continue; }
  if (e.kind === 'not_a_commodity') { dilewati.push(b.id); continue; }
  ubah.push(`${b.nama} — ${e.kind ?? 'tanpa kind'} → not_a_commodity`);
  e.kind = 'not_a_commodity';
  e.lifecycle = { ...(e.lifecycle ?? {}), updated_at: STAMP };
}

if (bantah.length) {
  for (const x of bantah) console.error(`  TOLAK  ${x}`);
  console.error(`\n${bantah.length} penolakan — tidak ada yang ditulis.`);
  process.exit(1);
}

for (const x of ubah) console.log(`  tandai  ${x}`);
console.log(`\n  commodity-registri.json — ${ubah.length} entri ditandai bukan komoditas, ${dilewati.length} sudah ditandai`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyimpan.');
  process.exit(0);
}

writeFileSync(join(VOCAB, 'commodity-registri.json'), JSON.stringify(bungkusRegistri, null, 2) + '\n');
writeFileSync(join(VOCAB, 'commodity.json'), JSON.stringify(bungkusKurasi, null, 2) + '\n');
console.log('\nDitulis.');
