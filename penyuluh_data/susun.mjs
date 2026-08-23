// Menyusun panen SIMLUHTAN jadi dua lapis: satu baris per kecamatan (BPP yang membinanya
// dan berapa penyuluh di dalamnya), dan satu baris per wilayah untuk dinas yang menaungi.
// Inilah jalan keluar manusiawi ketika keempat bentuk jawaban aplikasi ini mentok —
// yang dicari bukan data, melainkan orang yang bisa ditanya.
//
//   node penyuluh_data/susun.mjs
//
// Keluaran:
//   bpp-kecamatan.ndjson / .csv   7.002 kecamatan: nama BPP, poktan, cacahan penyuluh
//   dinas-wilayah.ndjson / .csv   dinas pertanian tiap provinsi dan kabupaten
//   LAPIS.md                      isi tiap lapis, hitungannya, dan yang tidak ada di dalamnya

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const RAW = join(DIR, 'raw');

const kutip = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
const rapi = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const kunciBerkas = (s) => String(s).replace(/\W+/g, '_');

// Nama BPP ditulis sekenanya di sumber: "BPP  Menthobi Raya", "BPP BULIK", "Air Anyut".
// Nama asli tidak pernah ditimpa — hasil penyeragaman masuk kolom sendiri.
function kanonik (nama) {
  let s = rapi(nama).replace(/^(bpp|bp3k|upt(d)?\.?\s*bpp|balai penyuluhan( pertanian)?)\b[\s.:-]*/i, '');
  s = rapi(s);
  if (!s) return rapi(nama);
  return s.replace(/\S+/g, (k) => (/^[A-Z0-9.'-]+$/.test(k) && k.length > 3 ? k[0] + k.slice(1).toLowerCase() : k));
}

// --- lapis 1: kecamatan --------------------------------------------------------------
const provinsi = JSON.parse(readFileSync(join(RAW, 'provinsi.json'), 'utf8'));
const tenaga = new Map();   // provinsi|kabupaten|kecamatan -> cacahan
let adaTenaga = 0;
for (const f of readdirSync(RAW).filter((x) => x.startsWith('tenaga-kecamatan-'))) {
  for (const r of JSON.parse(readFileSync(join(RAW, f), 'utf8'))) {
    tenaga.set(`${r.provinsi}|${r.kabupaten}|${r.kecamatan}`, r);
    adaTenaga++;
  }
}

// Dasar barisnya gabungan dua panen, bukan salah satunya: ada kecamatan yang punya
// penyuluh tetapi belum tercatat BPP-nya, dan sebaliknya. Yang dijatuhkan diam-diam
// justru kecamatan yang paling ingin diketahui keadaannya.
const kecamatan = new Map();
for (const f of readdirSync(RAW).filter((x) => x.startsWith('kecamatan-'))) {
  for (const r of JSON.parse(readFileSync(join(RAW, f), 'utf8'))) {
    kecamatan.set(`${r.provinsi}|${r.kabupaten}|${r.kecamatan}`, r);
  }
}
for (const [k, t] of tenaga) {
  if (kecamatan.has(k)) continue;
  const [provinsi, kabupaten, kec] = k.split('|');
  kecamatan.set(k, { provinsi, kabupaten, kecamatan: kec, kd_kab: '', bpp: '', poktan: '' });
}

const baris = [];
{
  for (const r of kecamatan.values()) {
    const t = tenaga.get(`${r.provinsi}|${r.kabupaten}|${r.kecamatan}`) ?? {};
    const pns = t.pnsaktif ?? null;
    const jml = (k) => (t[k] === undefined ? '' : t[k]);
    baris.push({
      provinsi: rapi(r.provinsi),
      kabupaten: rapi(r.kabupaten),
      kecamatan: rapi(r.kecamatan),
      kode_kabupaten: rapi(r.kd_kab),
      bpp: rapi(r.bpp),
      bpp_kanonik: r.bpp ? kanonik(r.bpp) : '',
      poktan: r.poktan ?? '',
      penyuluh_pns: jml('pnsaktif'),
      penyuluh_p3k: jml('p3k'),
      penyuluh_thl: jml('thl'),
      penyuluh_swadaya: jml('swadaya'),
      penyuluh_swasta: jml('swasta'),
      penyuluh_total: pns === null ? '' : (t.pnsaktif ?? 0) + (t.p3k ?? 0) + (t.thl ?? 0) + (t.swadaya ?? 0) + (t.swasta ?? 0),
    });
  }
}
baris.sort((a, b) => a.provinsi.localeCompare(b.provinsi) || a.kabupaten.localeCompare(b.kabupaten) || a.kecamatan.localeCompare(b.kecamatan));

const K1 = ['provinsi', 'kabupaten', 'kecamatan', 'kode_kabupaten', 'bpp', 'bpp_kanonik', 'poktan', 'penyuluh_pns', 'penyuluh_p3k', 'penyuluh_thl', 'penyuluh_swadaya', 'penyuluh_swasta', 'penyuluh_total'];
writeFileSync(join(DIR, 'bpp-kecamatan.ndjson'), baris.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync(join(DIR, 'bpp-kecamatan.csv'), K1.join(',') + '\n' + baris.map((r) => K1.map((k) => kutip(r[k])).join(',')).join('\n') + '\n');

// --- lapis 2: dinas per wilayah -------------------------------------------------------
// Cacahan penyuluh tingkat kabupaten datang dari panen ketenagaan. Baris semu
// "PROVINSI <nama>" di dalamnya adalah penyuluh yang bertugas di kantor provinsi,
// bukan kabupaten — dipisahkan ke baris provinsinya, tidak dijumlahkan dua kali.
const tenagaKab = new Map();
for (const f of readdirSync(RAW).filter((x) => x.startsWith('tenaga-kabupaten-'))) {
  for (const r of JSON.parse(readFileSync(join(RAW, f), 'utf8'))) tenagaKab.set(`${r.provinsi}|${r.nama}`, r);
}
const jumlahOrang = (t) => (t ? (t.pnsaktif ?? 0) + (t.p3k ?? 0) + (t.thl ?? 0) + (t.swadaya ?? 0) + (t.swasta ?? 0) : '');

const wilayah = [];
for (const p of provinsi) {
  const nama = rapi(p.nama);
  wilayah.push({ tingkat: 'provinsi', provinsi: nama, kabupaten: '', dinas: rapi(p.dinas), bpp: p.bpp, penyuluh: jumlahOrang(tenagaKab.get(`${nama}|PROVINSI ${nama}`)) });
  const berkasKab = readdirSync(RAW).filter((x) => x.startsWith('kabupaten-'));
  for (const f of berkasKab) {
    for (const k of JSON.parse(readFileSync(join(RAW, f), 'utf8'))) {
      if (rapi(k.provinsi) !== nama) continue;
      wilayah.push({ tingkat: 'kabupaten', provinsi: nama, kabupaten: rapi(k.nama), dinas: rapi(k.dinas), bpp: k.bpp, penyuluh: jumlahOrang(tenagaKab.get(`${nama}|${rapi(k.nama)}`)) });
    }
  }
}
const K2 = ['tingkat', 'provinsi', 'kabupaten', 'dinas', 'bpp', 'penyuluh'];
writeFileSync(join(DIR, 'dinas-wilayah.ndjson'), wilayah.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync(join(DIR, 'dinas-wilayah.csv'), K2.join(',') + '\n' + wilayah.map((r) => K2.map((k) => kutip(r[k])).join(',')).join('\n') + '\n');

// --- laporan ---------------------------------------------------------------------------
const kab = wilayah.filter((w) => w.tingkat === 'kabupaten');
const tanpaDinas = kab.filter((w) => !w.dinas || w.dinas === '-').length;
const bppUnik = new Set(baris.filter((r) => r.bpp).map((r) => r.bpp_kanonik.toLowerCase())).size;
const tanpaBpp = baris.filter((r) => !r.bpp).length;
const berTenaga = baris.filter((r) => r.penyuluh_total !== '').length;
const jml = (k) => baris.reduce((a, r) => a + (Number(r[k]) || 0), 0);
const tanpaPenyuluh = baris.filter((r) => r.bpp && r.penyuluh_total === 0).length;

writeFileSync(join(DIR, 'LAPIS.md'), `# Lapis kelembagaan & ketenagaan penyuluhan

Disusun ulang oleh \`susun.mjs\` dari \`tarik-simluhtan.mjs\` + \`tarik-ketenagaan.mjs\`.
Sumbernya laporan tamu SIMLUHTAN — halaman \`/guestreport\` yang tidak meminta login,
sementara aplikasi utamanya menutup semuanya di balik kata sandi. Karya pemerintah,
sinkronisasi harian dari basis data SIMLUHTAN.

## 1. \`bpp-kecamatan.ndjson\` / \`.csv\` — satu baris per kecamatan
**${baris.length.toLocaleString('id-ID')}** kecamatan di ${provinsi.length} provinsi dan ${kab.length} kabupaten/kota,
${(baris.length - tanpaBpp).toLocaleString('id-ID')} di antaranya menyebut **nama BPP** yang membinanya — ${bppUnik.toLocaleString('id-ID')} nama BPP
berbeda setelah penyeragaman ejaan; ${tanpaBpp.toLocaleString('id-ID')} kecamatan punya catatan penyuluh tetapi belum
punya BPP terdaftar.

- Poktan terbina: **${jml('poktan').toLocaleString('id-ID')}**
- Cacahan penyuluh terisi pada ${berTenaga.toLocaleString('id-ID')} dari ${baris.length.toLocaleString('id-ID')} kecamatan
- Penyuluh PNS ${jml('penyuluh_pns').toLocaleString('id-ID')} · P3K ${jml('penyuluh_p3k').toLocaleString('id-ID')} · THL ${jml('penyuluh_thl').toLocaleString('id-ID')} · swadaya ${jml('penyuluh_swadaya').toLocaleString('id-ID')} · swasta ${jml('penyuluh_swasta').toLocaleString('id-ID')}
- **${tanpaPenyuluh.toLocaleString('id-ID')} kecamatan punya BPP tetapi nol penyuluh** — ada gedungnya, tidak ada orangnya

Nama asli BPP tidak pernah ditimpa; \`bpp_kanonik\` adalah kolom terpisah yang membuang
awalan "BPP"/"BP3K" dan merapikan kapitalisasi.

## 2. \`dinas-wilayah.ndjson\` / \`.csv\` — dinas yang menaungi
${wilayah.length} baris: ${provinsi.length} dinas provinsi dan ${kab.length} dinas kabupaten/kota${tanpaDinas ? `, ${tanpaDinas} di antaranya belum mengisi nama dinasnya` : ''}.
Tiap baris membawa cacahan BPP dan penyuluh di wilayahnya — inilah alamat yang dituju
ketika pertanyaannya tidak lagi bisa dijawab berkas.

## Yang tidak ada di dalamnya, dan tidak dicari

- **Tidak ada nama, NIP, atau nomor telepon penyuluh.** Laporan tamu hanya memberi
  cacahan, dan memang hanya itu yang diambil: halaman bernama tentang orang adalah
  pemrosesan data pribadi yang tidak punya dasar di sini.
- **Tidak ada alamat atau koordinat BPP.** Yang ada hanya namanya dan kecamatan yang
  dibinanya. Menggeokode massal akan bertabrakan dengan rancangan "klaim" yang sama
  seperti pada toko tani.
- **34 provinsi, bukan 38.** Pemekaran Papua belum masuk ke basis data sumbernya.
- **Update SIMLUHTAN sedang ditutup** untuk pemeliharaan sistem sampai 30 Agustus 2026
  menurut pengumuman di halaman depannya; angka di sini adalah potret sebelum itu.
- **Sudah tersambung** ke \`spec/vocab/bpp/\` — satu entitas \`op:bpp:\` per balai, bukan per
  kecamatan, dibangun ulang dengan \`node spec/tools/bangun-bpp.mjs --tulis\`. Yang belum: indeks
  turunan dan halaman terbitnya.
`);

console.log(`kecamatan ${baris.length} | BPP unik ${bppUnik} | kabupaten ${kab.length} | penyuluh terisi ${berTenaga} | nol penyuluh ${tanpaPenyuluh}`);
