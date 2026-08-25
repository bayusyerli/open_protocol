// Menjodohkan operator bersertifikat LeSOS dengan badan di spec/vocab/principal, lalu
// menulis DUA berkas: calon yang perlu ditinjau tangan, dan rekaman yang cukup kuat untuk
// dibaca pembangun halaman.
//
//   node lesos_data/susun-sertifikasi.mjs
//
// KENAPA ADA GERBANG TINJAUAN.
// `terbit/badan/` memuat bumi-subur-khatulistiwa, bumi-subur-rizquna, bumi-subur-utama, dan
// trans-bumi-subur-sejahtera — empat badan berlainan yang namanya beririsan dengan
// PT. Bumi Subur Sentosa. Pencocokan nama yang jalan saat build akan, cepat atau lambat,
// menempelkan sertifikat organik ke badan yang salah. Itu bukan medan kosong; itu tuduhan.
// Maka pencocokan dikerjakan sekali di sini, hasilnya dibekukan, dan yang meragukan
// ditahan di berkas calon sampai ada yang memutuskannya.
//
// Uji "kuat": nama ternormalkan harus SAMA PERSIS dengan salah satu registry_names, hanya
// satu badan yang cocok, dan namanya harus punya sedikitnya satu kata yang MEMBEDAKAN.
//
// Yang berbahaya bukan nama pendek, melainkan nama umum. Ambang panjang huruf menahan
// "POLOWIJO GOSARI" (14 huruf, khas, satu-satunya di registri) sekaligus meloloskan nama
// panjang yang seluruh katanya pasaran. Maka daftar kata umumnya diturunkan dari data:
// token yang muncul di lebih dari 1% nama badan di registri dianggap tidak membedakan
// apa-apa. "SUMBER", "REJEKI", "TANI", "MAKMUR" jatuh ke sana dengan sendirinya; "POLOWIJO"
// dan "GOSARI" tidak.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const AKAR = join(dirname(new URL(import.meta.url).pathname), '..');
const KLIEN = join(AKAR, 'lesos_data/privat/klien.json');
const PRINCIPAL = join(AKAR, 'spec/vocab/principal/principal.ndjson');
const CALON = join(AKAR, 'lesos_data/privat/sertifikasi-calon.ndjson');
const VOCAB = join(AKAR, 'spec/vocab/sertifikasi/sertifikasi-organik.ndjson');

const INPUT = /pupuk|pestisid|benih|agensi hayati|biopestisida|kompos|pembenah|probiotik|dekomposer|pgpr/i;

const norm = (s) => (s ?? '')
  .replace(/^"|"$/g, '')
  .toUpperCase()
  .replace(/\b(PT|CV|UD|PERSERO|TBK|BUMP|PERKUMPULAN|KELOMPOK TANI|GAPOKTAN|KOPERASI|YAYASAN|SUBAK|ASOSIASI)\b/g, '')
  .replace(/[^A-Z0-9]+/g, '');

const klien = JSON.parse(readFileSync(KLIEN, 'utf8'));
const TARIKAN = JSON.parse(readFileSync(join(AKAR, 'lesos_data/privat/tarikan.json'), 'utf8')).tanggal;
const barisPrincipal = readFileSync(PRINCIPAL, 'utf8').split('\n').filter((x) => x.trim());

// Satu nama ternormalkan bisa menunjuk lebih dari satu badan. Petanya menyimpan SEMUA
// yang cocok, supaya keberbilangan itu sendiri bisa jadi alasan menahan.
const peta = new Map();
for (const line of barisPrincipal) {
  const b = JSON.parse(line);
  for (const n of [b.label?.id, ...(b.registry_names ?? [])]) {
    const k = norm(n);
    if (!k) continue;
    if (!peta.has(k)) peta.set(k, []);
    const daftar = peta.get(k);
    if (!daftar.some((x) => x.id === b.id)) daftar.push({ id: b.id, key: b.key, label: (b.label?.id ?? '').replace(/^"|"$/g, '') });
  }
}

// Kata yang muncul di >1% nama badan tidak membedakan siapa pun. Dihitung, bukan didaftar
// tangan — daftar tangan akan memuat tebakan saya tentang bahasa, bukan isi registrinya.
const cacahToken = new Map();
for (const line of barisPrincipal) {
  const b = JSON.parse(line);
  const kata = new Set(((b.label?.id ?? '').replace(/^"|"$/g, '').toUpperCase().match(/[A-Z]{3,}/g) ?? []));
  for (const w of kata) cacahToken.set(w, (cacahToken.get(w) ?? 0) + 1);
}
const AMBANG = barisPrincipal.length * 0.01;
const UMUM = new Set([...cacahToken].filter(([, v]) => v >= AMBANG).map(([k]) => k));
const BENTUK = new Set(['PT', 'CV', 'UD', 'BUMP', 'KOPERASI', 'YAYASAN', 'SUBAK', 'GAPOKTAN', 'KELOMPOK', 'TANI', 'PERKUMPULAN', 'ASOSIASI']);
const pembeda = (nama) => (nama.toUpperCase().match(/[A-Z]{3,}/g) ?? [])
  .filter((w) => !BENTUK.has(w) && !UMUM.has(w));

const calon = [];
for (const k of klien) {
  const input = k.sertifikat.filter((s) => INPUT.test(s.lingkup));
  if (!input.length) continue;

  const kunci = norm(k.nama);
  const cocok = peta.get(kunci) ?? [];
  const khas = pembeda(k.nama);
  const semuaKata = (k.nama.toUpperCase().match(/[A-Z]{3,}/g) ?? []).filter((w) => !BENTUK.has(w));

  const alasan = [];
  if (!cocok.length) alasan.push('tidak ada badan yang cocok');
  if (cocok.length > 1) alasan.push(`${cocok.length} badan berbagi nama ternormalkan yang sama`);
  // Kegenerikan saja belum berbahaya. "AGRO LESTARI MAKMUR NUSANTARA" seluruhnya kata
  // pasaran, tetapi empat kata pasaran yang berderet tetap menunjuk satu badan. Yang
  // benar-benar bertabrakan adalah nama umum yang PENDEK — "Sumber Rejeki", "Sejahtera
  // Abadi" — karena dua usaha yang tak berhubungan bisa memakainya tanpa saling tahu.
  if (!khas.length && semuaKata.length < 3) {
    alasan.push(`${semuaKata.length} kata dan seluruhnya pasaran di registri`);
  }

  // Satu rekaman per badan, bukan per sertifikat: riwayat pengawasan tahunan dipadatkan
  // menurut nomor, dan yang dipakai halaman adalah keputusan terakhir per nomor.
  const perNomor = new Map();
  for (const s of input) {
    const ada = perNomor.get(s.nomor);
    if (!ada || String(s.berakhir) > String(ada.berakhir)) perNomor.set(s.nomor, s);
  }
  const riwayat = [...perNomor.values()].sort((a, b) => String(b.berakhir).localeCompare(String(a.berakhir)));
  const berlaku = riwayat.find((s) => s.berlaku_efektif);
  const dicabut = riwayat.find((s) => s.status_situs.toLowerCase() === 'dicabut');
  const terakhir = riwayat[0];

  const keadaan = berlaku ? 'berlaku' : (dicabut ? 'dicabut' : 'kedaluwarsa');
  const dipakai = berlaku ?? dicabut ?? terakhir;

  calon.push({
    lesos: { id: k.id, nama: k.nama },
    badan: cocok.length === 1 ? cocok[0] : null,
    kandidat: cocok.length > 1 ? cocok : undefined,
    kuat: alasan.length === 0,
    perlu_tinjau: alasan.length > 0,
    alasan: alasan.length ? alasan : undefined,
    keadaan,
    sertifikat: {
      nomor: dipakai.nomor,
      lingkup: dipakai.lingkup,
      lingkup_pecah: dipakai.lingkup_pecah,
      terbit: dipakai.terbit,
      berakhir: dipakai.berakhir,
      status_situs: dipakai.status_situs,
    },
    standar: k.standar,
    riwayat_nomor: riwayat.length,
  });
}

mkdirSync(dirname(CALON), { recursive: true });
writeFileSync(CALON, calon.map((x) => JSON.stringify(x)).join('\n') + '\n');

// Hanya yang kuat yang naik ke kosakata. Bentuknya sengaja ramping — pembangun halaman
// tidak perlu tahu apa pun tentang LeSOS selain apa yang dicetaknya.
const naik = calon.filter((x) => x.kuat).map((x) => ({
  principal: x.badan.id,
  key: x.badan.key,
  lembaga: 'LeSOS — Lembaga Sertifikasi Organik Seloliman',
  akreditasi: 'KAN LSPr-092-IDN',
  keadaan: x.keadaan,
  tarikan: TARIKAN,
  nomor: x.sertifikat.nomor,
  lingkup: x.sertifikat.lingkup,
  berakhir: x.sertifikat.berakhir,
  status_situs: x.sertifikat.status_situs,
  standar: x.standar,
})).sort((a, b) => a.key.localeCompare(b.key));

mkdirSync(dirname(VOCAB), { recursive: true });
writeFileSync(VOCAB, naik.map((x) => JSON.stringify(x)).join('\n') + '\n');

const hitung = (f) => naik.filter(f).length;
console.log(`kata pasaran : ${UMUM.size} token muncul di >1% dari ${barisPrincipal.length} nama badan`);
console.log(`calon        : ${calon.length} operator bersertifikat input`);
console.log(`  kuat       : ${naik.length} -> ${VOCAB.replace(AKAR + '/', '')}`);
console.log(`  perlu tinjau: ${calon.filter((x) => x.perlu_tinjau).length} -> ${CALON.replace(AKAR + '/', '')}`);
console.log(`keadaan yang naik: berlaku ${hitung((x) => x.keadaan === 'berlaku')}, kedaluwarsa ${hitung((x) => x.keadaan === 'kedaluwarsa')}, dicabut ${hitung((x) => x.keadaan === 'dicabut')}`);
