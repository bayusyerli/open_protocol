// Menyalin logo badan yang lolos tinjauan ke app/gambar/, lalu menulis berkas sambungan
// yang dibaca pembangun indeks.
//
//   node gambar_produk/terbitkan-logo.mjs            # periksa saja, laporkan sebarannya
//   node gambar_produk/terbitkan-logo.mjs --tulis    # salin berkas dan tulis terbit-logo.ndjson
//
// KEPUTUSAN PENERBITAN — PERLUASAN, DAN DICATAT SEPERTI YANG PERTAMA
// Kepala `terbitkan.mjs` mencatat keputusan 23 Agustus 2026: gambar KEMASAN tetap
// diterbitkan walau tiap barisnya membawa `redistributable: false` dan `permission:
// belum_diminta`, dengan alasan gambar itu sudah tersedia publik di kanal terbit principal
// masing-masing.
//
// Keputusan itu menyebut gambar kemasan, dan logo bukan gambar kemasan. Pada 24 Agustus 2026
// pemilik repositori memperluasnya ke logo badan, dan perluasan itu dicatat di sini alih-alih
// diberlakukan diam-diam — sama seperti yang pertama, supaya siapa pun yang membaca berkas ini
// kelak melihat dua hal sekaligus: apa yang manifes katakan, dan apa yang diputuskan di atasnya.
//
// Logo adalah MEREK DAGANG, dan itu menambah dua kewajiban yang tidak dibawa foto kemasan:
//   1. Tidak diubah rupanya. Tidak diwarnai ulang, tidak dibalik, tidak dipotong tandanya.
//      Yang dilakukan `normalkan-logo.py` hanya memangkas bantalan transparan dan mengecilkan.
//   2. Dipakai untuk MENUNJUK badannya, bukan untuk menyiratkan hubungan dengan platform ini.
//      Halaman profil menyebutnya "logo yang dipasang di situsnya sendiri", bukan lencana mitra.
//
// Membalikkannya semurah yang pertama: hapus berkas `*__logo__*` dari app/gambar/, bangun ulang
// indeks, dan tiap slot logo jatuh ke placeholder tanpa satu pun perubahan kode.
//
// YANG TIDAK IKUT, DAN KENAPA
//   baris berstatus selain `ternormalisasi`  — belum lewat alat normalisasi
//   berkas yang tidak ada di ternormalkan/   — dilaporkan, bukan didiamkan
//
// SAMBUNGANNYA BERKUNCI PRINCIPAL, BUKAN PRODUK, dan itu sebabnya berkas ini ada di samping
// `terbitkan.mjs` alih-alih di dalamnya: yang satu menjawab "gambar apa untuk produk ini",
// yang satu "logo apa untuk badan ini". Menyatukan keduanya berarti satu berkas yang harus
// menebak kunci mana yang sedang dipakai.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from '../spec/node_modules/ajv/dist/2020.js';
import addFormats from '../spec/node_modules/ajv-formats/dist/index.js';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..');
const tulis = process.argv.includes('--tulis');
const MANIFES = join(akar, 'gambar_produk', 'logo-principal.ndjson');
const SUMBER = join(akar, 'gambar_produk');
const TUJUAN = join(akar, 'app', 'gambar');
const SAMBUNG = join(akar, 'gambar_produk', 'terbit-logo.ndjson');

if (!existsSync(MANIFES)) {
  console.error(`Manifes ${MANIFES} tidak ada. normalkan-logo.py menulisnya lebih dulu.`);
  process.exit(1);
}

const baris = readFileSync(MANIFES, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));

// Skema diperiksa DI SINI, bukan di alat terpisah yang bisa lupa dijalankan: ini gerbang
// terakhir sebelum berkas menyeberang ke app/gambar/, dan baris yang bentuknya salah
// menyeberang diam-diam akan muncul sebagai medan kosong di layar, bukan sebagai galat.
const spec = join(akar, 'spec');
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
for (const f of readdirSync(join(spec, 'schema')).filter((f) => f.endsWith('.schema.json'))) {
  try { ajv.addSchema(JSON.parse(readFileSync(join(spec, 'schema', f), 'utf8'))); } catch { /* dilewati */ }
}
const periksa = ajv.getSchema('https://spec.openprotocols.id/v0.1/principal-logo.schema.json');
const cacat = [];
for (const r of baris) if (periksa && !periksa(r)) cacat.push([r.principal_key, periksa.errors?.[0]?.message ?? '?']);
if (cacat.length) {
  console.error(`${cacat.length} baris tidak lolos principal-logo.schema.json:`);
  for (const [k, e] of cacat.slice(0, 8)) console.error(`  ${k}: ${e}`);
  process.exit(1);
}

const siap = baris.filter((x) => x.review?.status === 'ternormalisasi');

const n = (x) => x.toLocaleString('id-ID');
const keluar = [];
let hilang = 0;
const hilangNama = [];

for (const r of siap) {
  const semua = [r.file, ...(r.variants ?? [])].filter(Boolean);
  const berkas = {};
  for (const f of semua) {
    if (!existsSync(join(SUMBER, f.path))) { hilang++; hilangNama.push(f.path); continue; }
    berkas[f.rendition] = { n: f.path.split('/').pop(), w: f.width_px, h: f.height_px };
  }
  if (!Object.keys(berkas).length) continue;
  keluar.push({
    principal: r.principal_key,
    logo: {
      berkas,
      penerbit: r.source?.publisher ?? null,
      halaman: r.source?.page_url ?? null,
      diambil: r.source?.retrieved_at ? String(r.source.retrieved_at).slice(0, 10) : null,
      hak: r.source?.rights ?? 'tidak_diketahui',
      // Tingkat bukti sambungan badan->situs ikut, sebab ia yang menentukan seberapa
      // jauh layar boleh berjanji. D berarti: situsnya datang dari laporan agen riset.
      tingkat: r.attribution?.evidence_tier ?? null,
      cocok: r.attribution?.nama_registri_cocok ?? null,
      catatan: r.notes?.id ?? null,
    },
  });
}

console.log(`manifes            : ${n(baris.length)} baris · ${n(siap.length)} ternormalisasi`);
console.log(`badan berlogo      : ${n(keluar.length)}`);
console.log(`berkas hilang      : ${n(hilang)}${hilangNama.length ? ' — ' + hilangNama.slice(0, 3).join(', ') : ''}`);
const perHak = {};
for (const r of keluar) perHak[r.logo.hak] = (perHak[r.logo.hak] ?? 0) + 1;
console.log(`dasar hak          : ${Object.entries(perHak).map(([k, v]) => `${k} ${v}`).join(' · ')}`);

if (!tulis) {
  console.log('\nPeriksa saja. Tambahkan --tulis untuk menyalin berkas dan menulis sambungannya.');
  process.exit(0);
}

mkdirSync(TUJUAN, { recursive: true });
let disalin = 0;
for (const r of siap) {
  for (const f of [r.file, ...(r.variants ?? [])].filter(Boolean)) {
    const asal = join(SUMBER, f.path);
    if (!existsSync(asal)) continue;
    copyFileSync(asal, join(TUJUAN, f.path.split('/').pop()));
    disalin++;
  }
}
writeFileSync(SAMBUNG, keluar.map((r) => JSON.stringify(r)).join('\n') + '\n');
console.log(`\ndisalin ${n(disalin)} berkas ke app/gambar/`);
console.log(`sambungan ditulis  : ${SAMBUNG}`);
