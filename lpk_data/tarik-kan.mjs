// Menarik direktori Lembaga Penilaian Kesesuaian (LPK) terakreditasi KAN dari aplikasi
// publik layanan.kan.or.id. Satu panen untuk dua kebutuhan: laboratorium penguji — ke
// mana sampel tanah dan uji residu dikirim — dan lembaga sertifikasi, yang menentukan
// apa yang membuat panen ditolak. Pemisahan cakupannya dilakukan belakangan, di susun.mjs.
//
//   node lpk_data/tarik-kan.mjs [direktori-keluaran]
//
// Endpoint ini yang dipakai form "Direktori LPK" di halaman depan situsnya. Publik,
// robots.txt mengizinkan seluruhnya, tanpa kredensial. Cookie sesi tamu dibentuk persis
// seperti peramban biasa saat membuka halaman depan.
//
// Rantai sertifikat *.kan.or.id tidak lengkap — servernya tidak mengirim sertifikat
// antara Sectigo, jadi Node menolaknya (peramban menambalnya sendiri lewat AIA).
// Skrip ini melakukan hal yang sama: mengunduh sertifikat antara itu lebih dulu.
//
// Keluaran (mentah, apa adanya):
//   raw/skema.json          daftar skema akreditasi
//   raw/lpk-<skema>.json    daftar LPK per skema

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { request } from 'node:https';
import { rootCertificates } from 'node:tls';

const BASE = 'layanan.kan.or.id';
const AIA = 'http://crt.sectigo.com/SectigoPublicServerAuthenticationCAOVR36.crt';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const LIMIT = 100;   // `limit` dihormati server; `per_page` dan `length` diabaikan
const JEDA = 250;    // ms antar permintaan
const out = process.argv[2] ?? 'lpk_data/raw';

const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

// --- rantai sertifikat -----------------------------------------------------------
const der = Buffer.from(await (await fetch(AIA)).arrayBuffer());
const antara = `-----BEGIN CERTIFICATE-----\n${der.toString('base64').replace(/(.{64})/g, '$1\n')}\n-----END CERTIFICATE-----\n`;
const ca = [...rootCertificates, antara];

let cookie = '';

function ambil (path) {
  return new Promise((tepat, gagal) => {
    const req = request({ host: BASE, path, ca, headers: { 'User-Agent': UA, Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...(cookie ? { Cookie: cookie } : {}) } }, (res) => {
      const kue = (res.headers['set-cookie'] ?? []).map((c) => c.split(';')[0]);
      if (kue.length && !cookie) cookie = kue.join('; ');
      let buf = '';
      res.setEncoding('utf8');
      res.on('data', (d) => { buf += d; });
      res.on('end', () => (res.statusCode === 200 ? tepat(buf) : gagal(new Error(`HTTP ${res.statusCode} pada ${path}`))));
    });
    req.on('error', gagal);
    req.setTimeout(60000, () => req.destroy(new Error(`waktu habis pada ${path}`)));
    req.end();
  });
}

async function ambilJson (path) {
  for (let coba = 1; coba <= 4; coba++) {
    try { return JSON.parse(await ambil(path)); } catch (e) {
      if (coba === 4) throw e;
      await tidur(1500 * coba);
    }
  }
}

async function halamanPenuh (path, label) {
  const baris = [];
  for (let p = 1; p <= 200; p++) {
    const d = await ambilJson(`${path}${path.includes('?') ? '&' : '?'}limit=${LIMIT}&page=${p}`);
    baris.push(...d.data);
    // `next_page_url`, bukan panjang halaman: getSelData mengabaikan `limit` dan tetap
    // memberi 10 baris per halaman, jadi membandingkan dengan LIMIT memutusnya di halaman 1.
    if (!d.next_page_url || !d.data.length) break;
    await tidur(JEDA);
  }
  console.log(`  ${label}: ${baris.length}`);
  return baris;
}

mkdirSync(out, { recursive: true });
await ambil('/');   // membentuk cookie sesi tamu

console.log('skema akreditasi');
const skema = await halamanPenuh('/skema-akreditasi/getSelData', 'skema');
writeFileSync(join(out, 'skema.json'), JSON.stringify(skema, null, 1) + '\n');

let total = 0;
for (const s of skema) {
  const baris = await halamanPenuh(`/direktori-lpk/getJson?skema=${s.id}&nama_lpk=`, `${String(s.id).padStart(5)} ${s.nama}`);
  writeFileSync(join(out, `lpk-${s.id}.json`), JSON.stringify(baris, null, 1) + '\n');
  total += baris.length;
  await tidur(JEDA);
}
console.log(`\n${skema.length} skema, ${total} catatan LPK -> ${out}`);
