// Menarik penetapan harga TBS kelapa sawit Kalimantan Timur — Surat Keputusan Disbun Kaltim,
// terbit sebagai PDF tanpa lapisan teks, jadi perlu OCR.
//
//   node harga_data/tarik-tbs-kaltim.mjs           # tarik yang belum ada, OCR, gabung
//   node harga_data/tarik-tbs-kaltim.mjs --ulang   # olah ulang seluruhnya
//
// Menuntut binernya sudah dikompilasi:
//   swiftc -O harga_data/ocr-vision.swift -o harga_data/bin/ocr-vision
//
// KENAPA PROVINSI INI PALING BERHARGA MESKI PALING MAHAL DIBACA
// Ketiga provinsi sebelumnya menerbitkan harga TBS jadi. Kaltim menerbitkan RUMUSNYA:
// tabelnya berkolom Indeks K, harga CPO, **rendemen CPO per pita umur**, harga inti sawit,
// rendemen inti sawit, lalu harga TBS-nya.
//
// Kolom rendemen itu yang menentukan. docs/16 bagian 7a menyimpulkan satu-satunya sumber
// rendemen TERUKUR yang bisa dikutip adalah MPOB Malaysia — dan MPOB benih privat, tidak
// boleh diterbitkan ulang. Kaltim menerbitkan rendemen per umur tanaman di dalam surat
// keputusan, yang menurut UU 28/2014 Pasal 41 huruf b bukan objek hak cipta. Nilainya
// 0,1930–0,2183 pada Januari 2023, mengapit angka bawaan 19,7% yang dokumen itu tetapkan.
//
// TABELNYA DIBACA MENURUT LETAK, BUKAN URUTAN
// Vision membaca kolom demi kolom, bukan baris demi baris: seluruh harga CPO keluar
// berurutan, lalu seluruh rendemen, lalu seluruh harga TBS. Membacanya sebagai aliran teks
// menghasilkan omong kosong. Yang mengembalikan susunannya kotak batas — baris disusun ulang
// dari koordinat y, kolom dikenali dari koordinat x. Itu sebabnya ocr-vision.swift
// mengeluarkan kotak batas dan bukan cuma teks.
//
// UMURNYA DARI NOMOR BARIS, BUKAN DARI KOLOMNYA
// Kolom umur paling kiri kerap tidak terbaca OCR — pada berkas uji hanya 2 dari 8 baris yang
// umurnya terbaca. Tetapi nomor barisnya terbaca, dan urutan pitanya tetap: 3, 4, 5, 6, 7, 8,
// 9, lalu ≥10. Umur karena itu diturunkan dari POSISI baris dalam tabel, dan tabel yang
// jumlah barisnya bukan 8 ditolak alih-alih ditebak.
//
// DATA PRIBADI ADA DI BERKASNYA, DAN TIDAK IKUT KELUAR
// Surat keputusan membawa blok tanda tangan berisi nama pejabat dan NIP. Yang diambil berkas
// ini hanya baris di dalam rentang y tabel harga; blok tanda tangan berada jauh di bawahnya
// dan tidak pernah tersentuh. Penjaga di akhir memeriksa keluarannya, bukan niatnya.

import { writeFileSync, readFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const UA = 'OpenProtocols/0.1 (+https://github.com/bayusyerli/open_protocol) riset harga sawit';
const BASIS = 'https://disbun.kaltimprov.go.id';
const KATEGORI = `${BASIS}/kategori-download/harga-komoditi-perkebunan-harga-tbs-kelapa-sawit-tahun-2021-2025`;
const KELUAR = join('harga_data', 'tbs-kaltim.ndjson');
const SINGGAH = join('harga_data', 'mentah', 'kaltim');
const OCR = join('harga_data', 'bin', 'ocr-vision');
const ulang = process.argv.includes('--ulang');

if (!existsSync(OCR)) {
  console.error(`Biner OCR belum ada. Kompilasi dulu:\n  swiftc -O harga_data/ocr-vision.swift -o ${OCR}`);
  process.exit(1);
}

const JEDA_MS = 700;
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

const BULAN = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
};

// Pita umur menurut urutan barisnya. Tetap di seluruh berkas yang diperiksa.
const PITA = ['3', '4', '5', '6', '7', '8', '9', '>=10'];

// ---------------------------------------------------------------------------
// Angka OCR: separator tertukar, dan itu tidak bisa dianggap kebetulan
// ---------------------------------------------------------------------------
// Pada satu berkas uji saja, tiga bentuk muncul untuk bilangan yang sama:
//   "11.490,75"   benar — titik ribuan, koma desimal
//   "11,490.75"   tertukar gaya Inggris
//   "5.282.23"    koma desimal terbaca titik
// Ketiganya diratakan dengan aturan yang sama: pemisah TERAKHIR adalah desimal bila ia
// diikuti tepat dua digit; sisanya pemisah ribuan. Itu benar untuk ketiga bentuk di atas
// tanpa perlu menebak gaya penulisannya.
function angkaOcr(s) {
  const bersih = String(s).replace(/[^\d.,]/g, '');
  if (!bersih) return null;
  const m = bersih.match(/^(.*)([.,])(\d+)$/);
  if (!m) {
    const n = Number(bersih);
    return Number.isFinite(n) ? n : null;
  }
  // Kelompok terakhir TEPAT tiga digit dengan sesuatu di depannya adalah pemisah ribuan
  // ("1.234"); panjang lain adalah desimal ("11.490,75" dua digit, "0,1930" empat digit).
  // Aturan panjang-dua saja tidak cukup, dan itu ketahuan dengan mahal: kolom rendemen
  // "0,1930" terbaca 1930 lalu tampil sebagai 193.000%.
  const ribuan = m[3].length === 3 && m[1].length > 0;
  const utuh = m[1].replace(/[.,]/g, '');
  const n = Number(ribuan ? `${utuh}${m[3]}` : `${utuh || '0'}.${m[3]}`);
  return Number.isFinite(n) ? n : null;
}

async function ambil(alamat, biner = false) {
  const r = await fetch(alamat, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  if (!r.ok) throw new Error(`${alamat}: HTTP ${r.status}`);
  return biner ? Buffer.from(await r.arrayBuffer()) : r.text();
}

// ---------------------------------------------------------------------------
// 1. Indeks
// ---------------------------------------------------------------------------
// PERIODENYA DIAMBIL DARI DOKUMEN, BUKAN DARI NAMA BERKASNYA
// Slug-nya tidak konsisten sama sekali: dari 107 unduhan hanya 16 berbentuk
// "16-31-januari-2023"; sisanya "harga-tbs-bulan-april-2021", "harga-tbs-bermitra-bulan-juli-
// periode-1-tahun-2024", "harga-tbs-feb-periode-1-tahun-2023", dan belasan bentuk lain.
// Mengejar seluruhnya dengan pola nama berkas berarti menulis pola yang tumbuh tanpa habis
// dan tetap melewatkan yang berikutnya.
//
// Surat keputusannya sendiri menyebutkan periodenya dengan bentuk yang SERAGAM:
// "PERIODE II(16 sd 31 Januari 2023)". Itu sumber yang benar; nama berkas cuma pengenal.
// Yang tetap dipakai dari slug: sebagai PEMBANDING bila ia kebetulan terbaca.
function periodeDariSlug(slug) {
  const m = slug.match(/(\d{1,2})-(\d{1,2})-([a-z]+)-(\d{4})/i);
  if (!m) return null;
  const b = BULAN[m[3].toLowerCase()];
  if (!b) return null;
  const p = (d) => `${m[4]}-${String(b).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return { awal: p(m[1]), akhir: p(m[2]) };
}

function periodeDariDokumen(baris) {
  const t = baris.map((b) => b.teks).join(' ').replace(/\s+/g, ' ');
  // "16 sd 31 Januari 2023" — bentuk yang dipakai seluruh surat keputusan yang diperiksa.
  const rentang = t.match(/(\d{1,2})\s*s\.?\s*d\.?\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i);
  if (rentang) {
    const b = BULAN[rentang[3].toLowerCase()];
    if (b) {
      const p = (d) => `${rentang[4]}-${String(b).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      return { awal: p(rentang[1]), akhir: p(rentang[2]), nominal: false };
    }
  }
  // Tanpa rentang tanggal: periode romawi + bulan. Tanggalnya jadi NOMINAL, dan ditandai.
  const rom = t.match(/PERIODE\s*:?\s*(IV|III|II|I)\b/i);
  const bln = t.match(/\b([A-Za-z]+)\s+(\d{4})\b/);
  if (bln) {
    const b = BULAN[bln[1].toLowerCase()];
    if (b) {
      const ke = rom ? { I: 1, II: 2, III: 3, IV: 4 }[rom[1].toUpperCase()] : 1;
      const hari = ke === 1 ? 1 : 16;
      const p = `${bln[2]}-${String(b).padStart(2, '0')}-${String(hari).padStart(2, '0')}`;
      return { awal: p, akhir: p, nominal: true };
    }
  }
  return null;
}

async function daftar() {
  const html = await ambil(KATEGORI);
  const slug = [...new Set([...html.matchAll(/\/download\/([a-z0-9-]+)/g)].map((m) => m[1]))];
  process.stderr.write(`Indeks: ${slug.length} unduhan\n`);
  return slug.map((s) => ({ slug: s, dariSlug: periodeDariSlug(s) }));
}

// ---------------------------------------------------------------------------
// 2. Urai tabel dari hasil OCR
// ---------------------------------------------------------------------------
function uraiTabel(hasil) {
  const B = (hasil.baris ?? []).filter((b) => b.teks.trim());
  if (!B.length) return { lewat: 'OCR tidak menghasilkan satu baris pun' };

  // Baris tabel dikenali dari kolom paling kanan: harga TBS. Ia satu-satunya kolom yang
  // seluruh nilainya BERBEDA dan berbentuk ribuan — kolom CPO dan inti sawit berulang
  // identik di tiap baris, jadi memakainya sebagai jangkar akan menyatukan baris.
  const kanan = B.filter((b) => b.x > 0.78 && angkaOcr(b.teks) !== null && angkaOcr(b.teks) > 500)
    .sort((a, b) => b.y - a.y);
  if (kanan.length !== PITA.length) {
    return { lewat: `kolom harga TBS berisi ${kanan.length} baris, perlu ${PITA.length}` };
  }

  const pita = {};
  const rendemenCpo = {};
  const rendemenIs = {};
  let indeksK = null, cpo = null, is = null;

  kanan.forEach((baris, i) => {
    const umur = PITA[i];
    pita[umur] = angkaOcr(baris.teks);
    // Sebaris dengannya, menurut y: rendemen CPO (x≈0,49) dan rendemen inti (x≈0,77).
    const sebaris = B.filter((b) => Math.abs(b.y - baris.y) < 0.006);
    const ambilKolom = (lo, hi) => {
      const c = sebaris.find((b) => b.x > lo && b.x < hi && /^0[.,]\d{3,4}$/.test(b.teks.trim()));
      return c ? angkaOcr(c.teks) : null;
    };
    const rc = ambilKolom(0.44, 0.55);
    const ri = ambilKolom(0.72, 0.80);
    if (rc !== null) rendemenCpo[umur] = rc;
    if (ri !== null) rendemenIs[umur] = ri;

    if (indeksK === null) {
      const k = sebaris.find((b) => b.x > 0.28 && b.x < 0.36 && /^\d{2}[.,]\d{2}$/.test(b.teks.trim()));
      if (k) indeksK = angkaOcr(k.teks);
    }
    if (cpo === null) {
      const c = sebaris.find((b) => b.x > 0.35 && b.x < 0.45 && (angkaOcr(b.teks) ?? 0) > 3000);
      if (c) cpo = angkaOcr(c.teks);
    }
    if (is === null) {
      const c = sebaris.find((b) => b.x > 0.62 && b.x < 0.72 && (angkaOcr(b.teks) ?? 0) > 1000);
      if (c) is = angkaOcr(c.teks);
    }
  });

  // Uji bentuk kurva, aturan yang sama dengan Kalteng: pita termuda wajib yang terendah.
  // Pada OCR ia bekerja lebih keras lagi — satu digit tertukar menghasilkan angka yang masuk
  // akal sebagai harga tetapi merusak urutannya.
  const nilai = PITA.map((u) => pita[u]);
  if (nilai.some((v) => v === null)) return { lewat: 'ada pita tanpa harga terbaca' };
  if (nilai.slice(1).some((v) => v < nilai[0])) {
    return { lewat: `bentuk kurva tidak wajar: pita termuda (${nilai[0]}) bukan yang terendah` };
  }
  // Dan menaik: harga TBS naik menurut umur di seluruh berkas yang diperiksa. Satu turunan
  // di tengah berarti satu digit terbaca keliru.
  for (let i = 1; i < nilai.length; i++) {
    if (nilai[i] < nilai[i - 1]) {
      return { lewat: `urutan tidak menaik pada pita ${PITA[i]} (${nilai[i]} < ${nilai[i - 1]})` };
    }
  }

  return { pita, rendemenCpo, rendemenIs, indeksK, cpo, is, tbs: nilai.at(-1), pitaPuncak: PITA.at(-1) };
}

// ---------------------------------------------------------------------------
// 3. Jalan
// ---------------------------------------------------------------------------
const lama = existsSync(KELUAR)
  ? readFileSync(KELUAR, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))
  : [];
const sudah = new Set(lama.map((r) => r.slug));

mkdirSync(SINGGAH, { recursive: true });
const semua = await daftar();
const perlu = semua.filter((x) => ulang || !sudah.has(x.slug));
process.stderr.write(`Perlu diambil: ${perlu.length}\n`);

const baru = [];
const ditolak = [];
for (const [i, x] of perlu.entries()) {
  const singgah = join(SINGGAH, `${x.slug}.bin`);
  try {
    if (!existsSync(singgah)) {
      writeFileSync(singgah, await ambil(`${BASIS}/download/${x.slug}`, true));
      await tidur(JEDA_MS);
    }
    const keluaran = execFileSync(OCR, [singgah], { maxBuffer: 64 * 1024 * 1024 }).toString();
    const hasil = JSON.parse(keluaran)[0];
    if (hasil.galat) { ditolak.push({ slug: x.slug, lewat: hasil.galat }); continue; }

    const periode = periodeDariDokumen(hasil.baris ?? []);
    if (!periode) { ditolak.push({ slug: x.slug, lewat: 'periode tidak terbaca dari dokumen' }); continue; }
    // Bila slug-nya kebetulan berperiode, ia jadi pembanding. Tidak sepakat = ditolak, bukan
    // dipilih salah satunya: dua sumber yang berselisih berarti salah satunya salah baca.
    if (x.dariSlug && x.dariSlug.awal !== periode.awal) {
      ditolak.push({ slug: x.slug, lewat: `periode dokumen (${periode.awal}) dan slug (${x.dariSlug.awal}) tidak sepakat` });
      continue;
    }

    const tabel = uraiTabel(hasil);
    if (tabel.lewat) { ditolak.push({ slug: x.slug, lewat: tabel.lewat }); continue; }

    baru.push({
      slug: x.slug,
      provinsi: 'Kalimantan Timur',
      t: periode.awal,
      periode_akhir: periode.akhir,
      ...(periode.nominal ? { tanggal_nominal: true } : {}),
      pita_puncak: tabel.pitaPuncak,
      tbs: tabel.tbs,
      tbs_umur: tabel.pita,
      // Inilah yang membuat provinsi ini berharga: rendemen per pita umur, dari surat
      // keputusan yang bukan objek hak cipta.
      rendemen_cpo: tabel.rendemenCpo,
      rendemen_inti: tabel.rendemenIs,
      ...(tabel.indeksK !== null ? { indeks_k: tabel.indeksK } : {}),
      ...(tabel.cpo !== null ? { cpo: tabel.cpo } : {}),
      ...(tabel.is !== null ? { inti_sawit: tabel.is } : {}),
      asal_teks: hasil.asal,
      sumber: `${BASIS}/download/${x.slug}`,
    });
  } catch (e) {
    ditolak.push({ slug: x.slug, lewat: e.message.slice(0, 90) });
  }
  if ((i + 1) % 20 === 0) process.stderr.write(`  ${i + 1}/${perlu.length}…\n`);
}

const peta = new Map(lama.map((r) => [r.slug, r]));
for (const r of baru) peta.set(r.slug, r);
const keluar = [...peta.values()].sort((a, b) => a.t.localeCompare(b.t));

const TERLARANG = ['nik', 'nip', 'no_telp', 'telepon', 'alamat', 'email', 'pangkat', 'golongan'];
const bocor = TERLARANG.filter((f) => JSON.stringify(keluar).toLowerCase().includes(`"${f}"`));
if (bocor.length) {
  console.error(`BERHENTI — medan data pribadi ikut ke keluaran: ${bocor.join(', ')}.`);
  process.exit(1);
}

writeFileSync(KELUAR, keluar.map((r) => JSON.stringify(r)).join('\n') + '\n');

const n = (x) => x.toLocaleString('id-ID');
const berRendemen = keluar.filter((r) => Object.keys(r.rendemen_cpo ?? {}).length >= 6);
console.log(`\nBerkas diproses        : ${n(perlu.length)}`);
console.log(`  terurai              : ${n(baru.length)}`);
console.log(`  DITOLAK              : ${n(ditolak.length)}`);
for (const d of ditolak.slice(0, 10)) console.log(`      ${d.slug}: ${d.lewat}`);
if (ditolak.length > 10) console.log(`      … dan ${n(ditolak.length - 10)} lagi`);
console.log(`Arsip seluruhnya       : ${n(keluar.length)} penetapan${keluar.length ? ` — ${keluar[0].t} s.d. ${keluar.at(-1).t}` : ''}`);
console.log(`  ber-RENDEMEN per umur: ${n(berRendemen.length)} — sumber rendemen terbuka yang tidak ada di provinsi lain`);
if (berRendemen.length) {
  const r = berRendemen.at(-1).rendemen_cpo;
  const v = Object.values(r);
  console.log(`      terakhir (${berRendemen.at(-1).t}): ${(Math.min(...v) * 100).toFixed(2)}% – ${(Math.max(...v) * 100).toFixed(2)}% menurut umur`);
}
console.log(`  ber-Indeks K         : ${n(keluar.filter((r) => r.indeks_k).length)} · ber-CPO: ${n(keluar.filter((r) => r.cpo).length)}`);
console.log(`Penjaga PII            : lolos`);
console.log(`Ditulis ke             : ${KELUAR}`);
