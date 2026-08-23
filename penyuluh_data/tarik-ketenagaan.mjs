// Menarik cacahan tenaga penyuluh per kecamatan dari laporan tamu SIMLUHTAN — tab
// "Ketenaga Penyuluhan" menurut status kepegawaian. Melengkapi tarik-simluhtan.mjs:
// yang itu menjawab "BPP mana", yang ini menjawab "ada berapa orang di dalamnya".
//
//   node penyuluh_data/tarik-ketenagaan.mjs [direktori-keluaran]
//
// Yang ditarik hanya CACAHAN per wilayah. Nama, NIP, dan alamat penyuluh tidak ada di
// laporan tamu ini, dan memang tidak dicari: halaman bernama tentang orang adalah
// pemrosesan data pribadi yang tidak punya dasar di sini.
//
// Keluaran:
//   raw/tenaga-kabupaten-<kdprov>.json   cacahan per kabupaten
//   raw/tenaga-kecamatan-<kdprov>-<kab>.json  cacahan per kecamatan

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://simluh.pertanian.go.id/guestreport';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const JEDA = 300;
const out = process.argv[2] ?? 'penyuluh_data/raw';

const tidur = (ms) => new Promise((r) => setTimeout(r, ms));
const teks = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
const angka = (s) => Number(teks(s)) || 0;

let cookie = '';
async function ambil (url, json = false) {
  for (let coba = 1; coba <= 4; coba++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, 'X-Requested-With': 'XMLHttpRequest', Referer: BASE, ...(cookie ? { Cookie: cookie } : {}) } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const kue = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]);
      if (kue.length && !cookie) cookie = kue.join('; ');
      return json ? await res.json() : await res.text();
    } catch (e) {
      if (coba === 4) throw new Error(`${e.message} pada ${url.slice(0, 90)}`);
      await tidur(1500 * coba);
    }
  }
}

// Token tiap tabel ditanam di dalam `data : function (d) { ... }` milik DataTable-nya.
function tokenTabel (html, tabel) {
  const i = html.indexOf(`${tabel} = $(`);
  if (i < 0) throw new Error(`tabel ${tabel} tidak ada — struktur halamannya berubah`);
  const j = html.indexOf('data : function (d) {', i);
  const seg = html.slice(j, html.indexOf('},', j));
  return Object.fromEntries([...seg.matchAll(/d\.(\w+)\s*=\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]));
}

async function tabel (tk, prov = '', kab = '') {
  const q = new URLSearchParams({ draw: '1', start: '0', length: '2000', search: '', prov_id: prov, kab_id: kab, mode: tk.mode ?? '', t: tk.t, st: tk.st ?? '' });
  return (await ambil(`${BASE}/render_table?${q}`, true)).data ?? [];
}

const STATUS = ['pnsaktif', 'pnspensiun', 'pnsmeninggaldunia', 'pnspindahstruktural', 'pnstugasbelajar', 'pnscpns', 'p3k', 'thl', 'thlapbn', 'thlapbd', 'swadaya', 'swasta'];
const cacah = (r) => Object.fromEntries(STATUS.map((k) => [k, angka(r[k])]));

mkdirSync(out, { recursive: true });
await ambil(BASE);
const html = await ambil(`${BASE}/render_content?mt=m2&ms=&st=2`);
const TK = { prov: tokenTabel(html, 'ktStatusProvTable'), kab: tokenTabel(html, 'ktStatusKabTable') };

// Tanda provinsi dipakai ulang dari panen kelembagaan — nilainya sama-sama kode provinsi
// terenkripsi, dan sisi server menerimanya lintas tab.
const provinsi = JSON.parse(readFileSync(join(out, 'provinsi.json'), 'utf8'));
let totKab = 0; let totKec = 0;

for (const p of provinsi) {
  const kabRaw = await tabel(TK.prov, p.tanda);
  const kab = kabRaw.map((r) => ({ provinsi: p.nama, nama: teks(r.nm_kab), tanda: teks(r.id_kab), ...cacah(r) }));
  const kunci = p.nama.replace(/\W+/g, '_');
  writeFileSync(join(out, `tenaga-kabupaten-${kunci}.json`), JSON.stringify(kab.map(({ tanda, ...s }) => s), null, 1) + '\n');
  totKab += kab.length;
  await tidur(JEDA);

  for (const k of kab) {
    const berkas = join(out, `tenaga-kecamatan-${kunci}-${k.nama.replace(/\W+/g, '_')}.json`);
    if (existsSync(berkas)) { totKec += JSON.parse(readFileSync(berkas, 'utf8')).length; continue; }
    const kec = (await tabel(TK.kab, p.tanda, k.tanda)).map((r) => ({
      provinsi: p.nama, kabupaten: k.nama, kecamatan: teks(r.nm_kec), ...cacah(r),
    }));
    writeFileSync(berkas, JSON.stringify(kec, null, 1) + '\n');
    totKec += kec.length;
    await tidur(JEDA);
  }
  console.log(`  ${p.nama}: ${kab.length} kabupaten, ${totKec} kecamatan kumulatif`);
}
console.log(`\n${provinsi.length} provinsi, ${totKab} kabupaten, ${totKec} baris kecamatan -> ${out}`);
