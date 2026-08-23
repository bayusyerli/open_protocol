// Menarik daftar LPK terakreditasi yang LENGKAP dari papan Looker Studio yang ditaut
// kan.or.id. Aplikasi publik layanan.kan.or.id baru memuat sebagian kecil lembaga —
// papan inilah daftar resminya, dan satu-satunya tempat masa berlaku akreditasi terbit.
//
//   node lpk_data/tarik-looker.mjs [direktori-keluaran]
//
// Papan Looker tidak punya API terbuka; yang dipakai di sini adalah permintaan yang
// sama persis dengan yang dikirim peramban saat membuka papannya — `batchedDataV2` —
// dengan satu perubahan: `paginateInfo` diminta seluruh baris sekaligus, bukan 100.
//
// Badan permintaannya direkam sekali per papan ke `looker/<kode>.json`. Isinya id
// laporan, halaman, komponen, dan nama medan kueri — semuanya milik papan itu, tidak
// bisa ditebak dan tidak perlu ditebak. Kalau papannya dirombak pemiliknya, rekam ulang:
// buka papannya di peramban, sadap `fetch` ke /embed/batchedDataV2, klik halaman
// berikutnya, lalu simpan badan permintaannya.
//
// Keluaran:
//   raw/looker-<kode>.json   baris apa adanya, satu objek per lembaga

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const SPEK = join(DIR, 'looker');
const out = process.argv[2] ?? join(DIR, 'raw');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const VERSI = 'appVersion=20260818_0003';

// Cookie diambil dengan mengikuti pengalihan satu per satu; papan embed berpindah dari
// lookerstudio.google.com ke datastudio.google.com dan menaruh cookienya di sana.
async function sesi (url) {
  const kue = new Map();
  for (let lompat = 0; lompat < 6; lompat++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Cookie: [...kue].map(([k, v]) => `${k}=${v}`).join('; ') }, redirect: 'manual' });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [k, v] = c.split(';')[0].split('=');
      if (k) kue.set(k.trim(), v);
    }
    const berikut = res.headers.get('location');
    if (!berikut) return { kue, akhir: url };
    url = new URL(berikut, url).href;
  }
  throw new Error('terlalu banyak pengalihan');
}

// Jawabannya kolom-per-kolom, bukan baris-per-baris: tiap kolom membawa daftar nilai
// yang tidak kosong plus daftar indeks yang kosong. Keduanya harus dijahit ulang.
function jahit (td, kolom) {
  const tinggi = Math.max(...td.column.map((c) => (c.stringColumn?.values?.length ?? 0) + (c.nullIndex?.length ?? 0)));
  const petak = td.column.map((c) => {
    const nilai = c.stringColumn?.values ?? [];
    const kosong = new Set(c.nullIndex ?? []);
    const keluar = []; let i = 0;
    for (let b = 0; b < tinggi; b++) keluar.push(kosong.has(b) ? '' : (nilai[i++] ?? ''));
    return keluar;
  });
  return Array.from({ length: tinggi }, (_, b) => Object.fromEntries(kolom.map((k, j) => [k, String(petak[j]?.[b] ?? '').trim()])));
}

mkdirSync(out, { recursive: true });
for (const berkas of readdirSync(SPEK).filter((f) => f.endsWith('.json'))) {
  const spek = JSON.parse(readFileSync(join(SPEK, berkas), 'utf8'));
  const { kue, akhir } = await sesi(spek.papan);
  const asal = new URL(akhir).origin;

  const badan = structuredClone(spek.permintaan);
  badan.dataRequest[0].datasetSpec.paginateInfo = { startRow: 1, rowsCount: 20000 };

  const res = await fetch(`${asal}/embed/batchedDataV2?${VERSI}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': UA,
      'X-Same-Domain': '1',
      Origin: asal,
      Referer: akhir,
      Cookie: [...kue].map(([k, v]) => `${k}=${v}`).join('; '),
    },
    body: JSON.stringify(badan),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} pada papan ${spek.kode}`);
  const teks = await res.text();
  const jawab = JSON.parse(teks.slice(teks.indexOf('{')));
  if (jawab.errorStatus) throw new Error(`papan ${spek.kode} menolak: ${JSON.stringify(jawab.errorStatus)}`);

  const td = jawab.dataResponse[0].dataSubset[0].dataset.tableDataset;
  const baris = jahit(td, spek.kolom);
  writeFileSync(join(out, `looker-${spek.kode.toLowerCase()}.json`), JSON.stringify(baris, null, 1) + '\n');
  console.log(`${spek.kode} ${spek.label}: ${baris.length} lembaga`);
}
