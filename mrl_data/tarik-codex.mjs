// Menarik batas maksimum residu (MRL) Codex Alimentarius FAO/WHO.
//
//   node mrl_data/tarik-codex.mjs [direktori-keluaran]
//
// KENAPA CODEX, DAN APA YANG ITU BUKAN
// Batas resmi Indonesia ada di SNI 7313, dan teksnya berbayar. Codex terbuka, bisa
// dikutip per komoditas dan per bahan, dan jadi acuan yang diselaraskan banyak pasar
// tujuan. Yang ditarik ke sini karena itu HARUS ditandai Codex, bukan hukum Indonesia —
// menyamakan keduanya akan membuat angka internasional terbaca seperti batas yang
// mengikat di sini, dan itu keliru ke arah yang paling merugikan.
//
// TIGA MEDAN YANG MENENTUKAN BENAR-SALAHNYA PEMBANDINGAN
//   residue     definisi residu: "Paraquat cation", "sum of X and Y expressed as X".
//               Label menuliskan kadar GARAM; MRL dinyatakan dalam bentuk ion atau asam.
//               Tanpa medan ini, membandingkan angka label dengan angka MRL adalah
//               membandingkan dua besaran yang berbeda.
//   commCode    kode komoditas Codex ("MO 0105"), pengenal luar yang bisa dipetakan.
//   stepCode    CXL berarti sudah diadopsi; selain itu masih dalam proses dan tidak
//               boleh dibaca sebagai batas yang berlaku.
//
// Endpoint di balik halaman rincian pestisida di situs Codex — publik, tanpa kredensial,
// dan hanya melakukan apa yang dilakukan peramban saat membuka halamannya.
//
// Keluaran:
//   raw/pestisida.json      daftar 240 pestisida beserta id Codex-nya
//   raw/mrl-<id>.json       rincian per pestisida: ADI, definisi residu, dan baris MRL

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://www.fao.org/jsoncodexpest/jsonrequest/pesticides';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const JEDA = 300;
const out = process.argv[2] ?? 'mrl_data/raw';

const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

// Menutup string hanya bila karakter bukan-spasi berikutnya benar-benar mengakhiri nilai.
// Tanda kutip lain di dalam nilai di-escape, tidak dibuang.
function perbaiki (teks) {
  let keluar = ''; let diString = false; let luput = false;
  for (let i = 0; i < teks.length; i++) {
    const c = teks[i];
    if (!diString) { keluar += c; if (c === '"') diString = true; continue; }
    if (luput) { keluar += c; luput = false; continue; }
    if (c === '\\') { keluar += c; luput = true; continue; }
    if (c !== '"') { keluar += c; continue; }
    const berikut = teks.slice(i + 1).match(/^\s*(.)/)?.[1];
    if (berikut && ',:}]'.includes(berikut)) { keluar += c; diString = false; } else { keluar += '\\"'; }
  }
  return keluar;
}

// Jawabannya JSON tetapi dilayani sebagai text/html, dan memuat karakter kendali yang
// membuat JSON.parse gagal — situsnya sendiri membersihkannya di sisi peramban sebelum
// mengurai. Pembersihan yang sama dilakukan di sini.
//
// SATU CACAT YANG TIDAK BISA DIBERSIHKAN BEGITU SAJA
// Tiga pestisida — Chlordane, Permethrin, Pyrethrins — memuat tanda kutip DI DALAM nilai
// yang tidak di-escape: `Sum of cis- and trans-chlordane and "oxychlordane"`. Itu JSON
// tidak sah, dan situsnya sendiri kemungkinan besar juga gagal membacanya. Perbaikannya
// dilakukan di sini dengan mesin keadaan kecil yang menutup string hanya bila karakter
// bukan-spasi berikutnya salah satu dari `,:}]` — bukan dengan membuang tanda kutipnya,
// karena yang di dalam kurung itu bagian dari definisi residu dan menentukan artinya.
// Teks aslinya disimpan apa adanya di `raw/cacat/<id>.txt` supaya perbaikannya bisa
// diperiksa, dan tiap berkas hasil perbaikan membawa penanda `_diperbaiki`.
async function ambil (url) {
  for (let coba = 1; coba <= 4; coba++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json, text/plain, */*' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const teks = (await res.text()).replace(/[\u0000-\u0019]+/g, '');
      try { return JSON.parse(teks); } catch { return { ...JSON.parse(perbaiki(teks)), _diperbaiki: true, _mentah: teks }; }
    } catch (e) {
      if (coba === 4) throw new Error(`${e.message} pada ${url}`);
      await tidur(1500 * coba);
    }
  }
}

mkdirSync(out, { recursive: true });

const daftar = await ambil(`${BASE}/index.html`);
const pestisida = daftar.pesticides.pesticide;
writeFileSync(join(out, 'pestisida.json'), JSON.stringify(pestisida, null, 1) + '\n');
console.log(`${pestisida.length} pestisida di basis data Codex`);

let baru = 0; let ada = 0; let gagal = 0; let barisMrl = 0; let diperbaiki = 0;
for (const [i, p] of pestisida.entries()) {
  const berkas = join(out, `mrl-${p.id}.json`);
  if (existsSync(berkas)) {
    ada++;
    barisMrl += (JSON.parse(readFileSync(berkas, 'utf8')).mrls?.mrl ?? []).length;
    continue;
  }
  try {
    const d = await ambil(`${BASE}/details.html?id=${p.id}&lang=en`);
    if (d._diperbaiki) {
      mkdirSync(join(out, 'cacat'), { recursive: true });
      writeFileSync(join(out, 'cacat', `${p.id}.txt`), d._mentah);
      diperbaiki++;
      delete d._mentah;
    }
    writeFileSync(berkas, JSON.stringify(d, null, 1) + '\n');
    barisMrl += (d.mrls?.mrl ?? []).length;
    baru++;
  } catch (e) {
    console.log(`  ! ${p.id} ${p.name?.en}: ${e.message}`);
    gagal++;
  }
  if ((i + 1) % 40 === 0) console.log(`  ${i + 1}/${pestisida.length} — ${barisMrl} baris MRL`);
  await tidur(JEDA);
}
console.log(`\n${baru} baru, ${ada} sudah ada, ${gagal} gagal — ${barisMrl} baris MRL -> ${out}`);
if (diperbaiki) console.log(`  ${diperbaiki} jawaban JSON-nya cacat dan diperbaiki; teks aslinya di ${join(out, 'cacat')}`);
