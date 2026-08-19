// Menarik ulang seluruh registri pupuk dan pestisida terdaftar Kementan, lalu menurunkan
// daftar bahan aktif kanonik dan daftar principal. Sumber vocab/substance-pestisida.json
// dan vocab/product/*.ndjson berasal dari sini.
//
//   node tools/tarik-registri.mjs [direktori-keluaran]
//
// Endpoint bersifat publik tetapi butuh cookie sesi tamu yang terbentuk saat mengunjungi
// portal. Tidak ada kredensial dan tidak ada yang dilewati; skrip ini hanya melakukan apa
// yang dilakukan peramban biasa saat membuka halaman datanya.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://ap-simpel.pertanian.go.id';
const PAGE = 2000;
const out = process.argv[2] ?? 'data-registri';

const norm = (s) => (s ?? '').normalize('NFKD').trim().toLowerCase().replace(/\s+/g, ' ');

async function guestSession() {
  const res = await fetch(`${BASE}/home`);
  const raw = res.headers.getSetCookie?.() ?? [];
  const ci = raw.map((c) => c.split(';')[0]).find((c) => c.startsWith('ci_session'));
  if (!ci) throw new Error('Portal tidak memberi cookie sesi; struktur situsnya mungkin berubah.');
  return ci;
}

async function post(path, cookie, start = 0, length = PAGE) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookie,
    },
    body: `draw=1&start=${start}&length=${length}&search[value]=`,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} pada ${path} start=${start}`);
  return res.json();
}

async function pagedAll(path, cookie, label) {
  const first = await post(path, cookie, 0);
  const total = first.recordsTotal;
  const rows = [...first.data];
  for (let s = PAGE; s < total; s += PAGE) rows.push(...(await post(path, cookie, s)).data);
  console.log(`  ${label}: ${rows.length}/${total}`);
  return rows;
}

const cookie = await guestSession();

const pestisida = await pagedAll('/Datatables_filtering/pestisida_terdaftar', cookie, 'pestisida');
const pupuk = await pagedAll('/pupuk/json_pupuk_publik_simpel', cookie, 'pupuk (SIMPEL)');
// Endpoint lama mengabaikan paginasi dan mengembalikan array polos sekaligus.
const pupukLegacy = await post('/pupuk/json_pupuk_publik_new', cookie, 0, PAGE);
const legacyRows = Array.isArray(pupukLegacy) ? pupukLegacy : pupukLegacy.data;
console.log(`  pupuk (SIMPUK 2020): ${legacyRows.length}`);

// --- turunan: bahan aktif kanonik ---
const canon = new Map();
for (const r of pestisida) {
  let bahan = [];
  try { bahan = JSON.parse(r.bahanAktif || '[]'); } catch { continue; }
  for (const b of bahan) {
    const nama = (b.namaBahan ?? '').trim();
    if (!nama) continue;
    const k = norm(nama);
    const e = canon.get(k) ?? { count: 0, variants: new Set(), jenis: new Set() };
    e.count++; e.variants.add(nama); e.jenis.add(r.JenisPestisidaNama);
    canon.set(k, e);
  }
}

// --- turunan: principal, dari kedua sisi ---
const principal = new Map();
const bump = (nama, jenis) => {
  if (!nama) return;
  const e = principal.get(nama) ?? { jumlah: 0, rincian: {} };
  e.jumlah++; e.rincian[jenis] = (e.rincian[jenis] ?? 0) + 1;
  principal.set(nama, e);
};
for (const r of pestisida) bump(`${(r.jenisPerseroan ?? '').trim()} ${r.perusahaanName ?? ''}`.trim(), r.JenisPestisidaNama);
for (const r of pupuk) bump((r.perusahaanName ?? '').trim(), `Pupuk — ${r.jenisName ?? 'tidak tercantum'}`);
for (const r of legacyRows) bump((r.pemegang_nomor_pendaftaran ?? '').trim(), 'Pupuk (SIMPUK 2020)');

mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'pestisida.json'), JSON.stringify(pestisida));
writeFileSync(join(out, 'pupuk.json'), JSON.stringify(pupuk));
writeFileSync(join(out, 'pupuk-legacy.json'), JSON.stringify(legacyRows));
writeFileSync(join(out, 'bahan-aktif.json'), JSON.stringify(
  [...canon.entries()]
    .map(([kanonik, e]) => ({ kanonik, jumlah: e.count, ejaan: [...e.variants].sort(), jenis: [...e.jenis].sort() }))
    .sort((a, b) => b.jumlah - a.jumlah), null, 2));
writeFileSync(join(out, 'principal.json'), JSON.stringify(
  [...principal.entries()].map(([nama, e]) => ({ nama, ...e })).sort((a, b) => b.jumlah - a.jumlah), null, 2));

console.log(`\n  formulasi pestisida : ${pestisida.length}`);
console.log(`  produk pupuk        : ${pupuk.length + legacyRows.length}`);
console.log(`  bahan aktif kanonik : ${canon.size}`);
console.log(`  principal gabungan  : ${principal.size}`);
console.log(`  keluaran            : ${out}/`);
