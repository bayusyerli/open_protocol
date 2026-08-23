// Menarik kelembagaan penyuluhan dari SIMLUHTAN lewat laporan tamunya — halaman
// /guestreport yang tidak meminta login sama sekali, sementara aplikasi utamanya
// (simluh.pertanian.go.id) menutup semuanya di balik kata sandi dan reCAPTCHA.
//
//   node penyuluh_data/tarik-simluhtan.mjs [direktori-keluaran]
//
// Tiga tingkat, satu endpoint yang sama (`render_table`) dengan token berbeda:
//   nasional   -> 34 provinsi: jumlah BPP + nama dinas provinsi (pemekaran Papua belum masuk)
//   provinsi   -> kabupaten/kota: jumlah BPP + nama dinas kabupaten
//   kabupaten  -> kecamatan: NAMA BPP + jumlah poktan
//
// Hanya di tingkat ketiga nama BPP-nya muncul; dua tingkat di atasnya cuma cacahan.
// Itu sebabnya penarikan harus turun sampai kabupaten satu per satu, ~550 permintaan.
//
// `mode` dan `t` adalah muatan terenkripsi Laravel yang ditanam di HTML tabelnya —
// dibaca ulang tiap kali dijalankan, tidak pernah ditebak atau dibongkar.
//
// Keluaran:
//   raw/provinsi.json           baris tingkat nasional
//   raw/kabupaten-<kdprov>.json baris tingkat provinsi
//   raw/kecamatan-<kdkab>.json  baris tingkat kabupaten (memuat nama BPP)

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://simluh.pertanian.go.id/guestreport';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const JEDA = 300;
const out = process.argv[2] ?? 'penyuluh_data/raw';

const tidur = (ms) => new Promise((r) => setTimeout(r, ms));
const teks = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
const idDari = (s) => (String(s ?? '').match(/data-id='([^']+)'/) ?? [])[1] ?? '';

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

function token (html, tabel, kunci) {
  const blok = html.match(new RegExp(`${tabel} = [\\s\\S]{0,2500}?d\\.${kunci} = "([^"]+)"`));
  if (!blok) throw new Error(`token ${tabel}.${kunci} tidak ketemu — struktur halamannya berubah`);
  return blok[1];
}

async function tabel ({ t, mode = '', prov = '', kab = '' }) {
  const q = new URLSearchParams({ draw: '1', start: '0', length: '2000', search: '', prov_id: prov, kab_id: kab, mode, t });
  const d = await ambil(`${BASE}/render_table?${q}`, true);
  return d.data ?? [];
}

mkdirSync(out, { recursive: true });
await ambil(BASE);                                   // cookie sesi tamu
const html = await ambil(`${BASE}/render_content?mt=m1`);
const TK = {
  nas: { t: token(html, 'klNasTable', 't') },
  prov: { t: token(html, 'klProvTable', 't'), mode: token(html, 'klProvTable', 'mode') },
  kab: { t: token(html, 'klKabTable', 't'), mode: token(html, 'klKabTable', 'mode') },
};

// --- tingkat 1: provinsi ----------------------------------------------------------
const provinsi = (await tabel(TK.nas)).map((r) => ({
  nama: teks(r.nm_prov), bpp: Number(r.jumlahbpp), dinas_kab: Number(r.jumlahdinaskab),
  dinas: teks(r.nm_dinasprov), tanda: idDari(r.nm_prov),
}));
writeFileSync(join(out, 'provinsi.json'), JSON.stringify(provinsi, null, 1) + '\n');
console.log(`provinsi: ${provinsi.length}, ${provinsi.reduce((a, b) => a + b.bpp, 0)} BPP`);

// --- tingkat 2 & 3 ----------------------------------------------------------------
let totKab = 0; let totKec = 0; let totBpp = 0;
for (const p of provinsi) {
  const baris = await tabel({ ...TK.prov, prov: p.tanda });
  const kdProv = teks(baris[0]?.kd_prov) || p.nama.replace(/\W+/g, '-').toLowerCase();
  const kab = baris.map((r) => ({
    kd_prov: teks(r.kd_prov), provinsi: p.nama, nama: teks(r.nm_kab),
    bpp: Number(r.jumlahbpp), dinas: teks(r.nm_dinaskab), tanda: idDari(r.nm_kab),
  }));
  writeFileSync(join(out, `kabupaten-${kdProv}.json`), JSON.stringify(kab, null, 1) + '\n');
  totKab += kab.length;
  await tidur(JEDA);

  for (const k of kab) {
    const berkas = join(out, `kecamatan-${k.kd_prov}-${k.nama.replace(/\W+/g, '_')}.json`);
    if (existsSync(berkas)) { totKec += JSON.parse(readFileSync(berkas, 'utf8')).length; continue; }
    const kec = (await tabel({ ...TK.kab, prov: p.tanda, kab: k.tanda })).map((r) => ({
      kd_kab: teks(r.kd_kab), provinsi: p.nama, kabupaten: k.nama,
      kecamatan: teks(r.nm_kec), bpp: teks(r.nama_bpp), poktan: Number(r.jumlahpoktan),
    }));
    writeFileSync(berkas, JSON.stringify(kec, null, 1) + '\n');
    totKec += kec.length;
    totBpp += kec.filter((x) => x.bpp && x.bpp !== '-').length;
    await tidur(JEDA);
  }
  console.log(`  ${p.nama}: ${kab.length} kabupaten, ${totKec} kecamatan kumulatif`);
}
console.log(`\n${provinsi.length} provinsi, ${totKab} kabupaten, ${totKec} baris kecamatan, ${totBpp} bernama BPP -> ${out}`);
