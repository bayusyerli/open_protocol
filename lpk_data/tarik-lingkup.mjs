// Menarik ruang lingkup akreditasi tiap laboratorium penguji, plus halaman rinciannya
// (surel dan status akreditasi yang tidak ikut di daftar). Ruang lingkup inilah yang
// membedakan "laboratorium terakreditasi" dari "laboratorium yang bisa menguji tanah
// atau residu pestisida" — tanpa itu, direktori ini cuma daftar nama.
//
//   node lpk_data/tarik-lingkup.mjs [skema] [direktori-keluaran]
//
// Bawaannya skema 1 (Laboratorium Penguji). Satu lab bisa punya ratusan baris lingkup —
// yang terbesar 591 baris, 363 KB — jadi hasil mentahnya tidak ikut naik ke repo dan
// dibangun ulang dengan perintah ini. Yang naik hanya ringkasannya, dari susun.mjs.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { request } from 'node:https';
import { rootCertificates } from 'node:tls';

const BASE = 'layanan.kan.or.id';
const AIA = 'http://crt.sectigo.com/SectigoPublicServerAuthenticationCAOVR36.crt';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const JEDA = 200;
const skema = process.argv[2] ?? '1';
const dir = process.argv[3] ?? 'lpk_data/raw';
const keluar = join(dir, 'lingkup');

const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

const der = Buffer.from(await (await fetch(AIA)).arrayBuffer());
const ca = [...rootCertificates, `-----BEGIN CERTIFICATE-----\n${der.toString('base64').replace(/(.{64})/g, '$1\n')}\n-----END CERTIFICATE-----\n`];

let cookie = '';
function ambil (path) {
  return new Promise((tepat, gagal) => {
    const req = request({ host: BASE, path, ca, headers: { 'User-Agent': UA, 'X-Requested-With': 'XMLHttpRequest', ...(cookie ? { Cookie: cookie } : {}) } }, (res) => {
      const kue = (res.headers['set-cookie'] ?? []).map((c) => c.split(';')[0]);
      if (kue.length && !cookie) cookie = kue.join('; ');
      let buf = '';
      res.setEncoding('utf8');
      res.on('data', (d) => { buf += d; });
      res.on('end', () => (res.statusCode === 200 ? tepat(buf) : gagal(new Error(`HTTP ${res.statusCode} pada ${path}`))));
    });
    req.on('error', gagal);
    req.setTimeout(90000, () => req.destroy(new Error(`waktu habis pada ${path}`)));
    req.end();
  });
}

async function coba (path, n = 3) {
  for (let i = 1; i <= n; i++) {
    try { return await ambil(path); } catch (e) { if (i === n) throw e; await tidur(1500 * i); }
  }
}

mkdirSync(keluar, { recursive: true });
await ambil('/');

const daftar = JSON.parse(readFileSync(join(dir, `lpk-${skema}.json`), 'utf8'));
let ada = 0; let baru = 0; let gagal = 0; let barisTotal = 0;

for (const [i, lpk] of daftar.entries()) {
  const berkas = join(keluar, `${skema}-${lpk.id}.json`);
  if (existsSync(berkas)) { ada++; barisTotal += JSON.parse(readFileSync(berkas, 'utf8')).lingkup.length; continue; }
  try {
    const lingkup = JSON.parse(await coba(`/direktori-lpk/detail/${lpk.id}/${skema}?draw=1&start=0&length=100000`));
    await tidur(JEDA);
    const halaman = await coba(`/direktori-lpk/${lpk.id}/${skema}`);
    writeFileSync(berkas, JSON.stringify({ id: lpk.id, skema, halaman, lingkup: lingkup.data ?? [] }) + '\n');
    barisTotal += (lingkup.data ?? []).length;
    baru++;
  } catch (e) {
    console.log(`  ! ${lpk.id} ${lpk.nama?.slice(0, 40)}: ${e.message}`);
    gagal++;
  }
  if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/${daftar.length} — ${barisTotal} baris lingkup`);
  await tidur(JEDA);
}
console.log(`\nskema ${skema}: ${baru} baru, ${ada} sudah ada, ${gagal} gagal — ${barisTotal} baris ruang lingkup`);
