// Menarik penetapan harga TBS kelapa sawit Kalimantan Tengah dari Media Center Kalteng.
//
//   node harga_data/tarik-tbs-kalteng.mjs           # tarik yang belum ada, gabung
//   node harga_data/tarik-tbs-kalteng.mjs --ulang   # ambil ulang seluruhnya
//
// SUMBERNYA SATU PERMINTAAN UNTUK SELURUH INDEKS
// `POST /berita` dengan `cari=Harga TBS` mengembalikan KESELURUHAN 58 artikel dalam satu
// respons — tanpa paginasi, tanpa token. Sesudah itu satu permintaan per artikel. Arsipnya
// mundur sampai 2022, lebih dalam daripada Kalbar (2025) dan sebanding dengan Riau (2023).
//
// `robots.txt` MENJAWAB 403, DAN ITU BUKAN PENOLAKAN TERHADAP KITA
// Yang 403 hanya berkasnya; seluruh isi situs terlayani 200 dengan User-Agent yang sama.
// Ini pola salah konfigurasi Apache yang lazim — berkasnya tidak ada, dan server menjawab
// Forbidden alih-alih Not Found. RFC 9309 bagian 2.3.1.3 menyatakan status 4xx selain 429
// diperlakukan sebagai tanpa pembatasan. Diperiksa, bukan diasumsikan: kalau isinya ikut
// 403, kesimpulannya akan sebaliknya.
//
// ANGKA UTAMANYA PITA UMUR TERTINGGI, DAN TIAP PROVINSI BERBEDA PITANYA
// Riau mengumumkan umur 9; Kalteng mengumumkan pita 10–20 tahun. Keduanya puncak kurva hasil
// di daerahnya masing-masing, dan keduanya BUKAN rata-rata. Karena itu yang dipakai sebagai
// seri di sini bukan angka yang kebetulan disebut judulnya, melainkan NILAI TERTINGGI dari
// tabel umur yang terurai — dan pita mana yang tertinggi ikut disimpan. Menyamakan "harga TBS
// Riau" dengan "harga TBS Kalteng" tanpa menyebut pitanya akan membandingkan dua hal berbeda.
//
// PEMERIKSAAN SILANG LEWAT SLUG
// Sebagian slug memuat harganya sendiri — `...-di-angka-rp3-295-71`. Di mana itu ada, ia
// dipakai membandingi angka yang terurai dari badan artikel. Alasannya sama dengan Riau:
// satu artikel memuat empat bilangan berbentuk rupiah — tingkat harga, selisihnya, CPO, dan
// PK — dan pengurai yang mengambil salah satunya tidak akan ketahuan tanpa pembanding.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const UA = 'OpenProtocols/0.1 (+https://github.com/bayusyerli/open_protocol) riset harga sawit';
const BASIS = 'https://mmc.kalteng.go.id';
const KELUAR = join('harga_data', 'tbs-kalteng.ndjson');
const ulang = process.argv.includes('--ulang');

const JEDA_MS = 700;
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

async function ambil(alamat, opsi = {}) {
  const r = await fetch(alamat, { headers: { 'User-Agent': UA, ...(opsi.headers ?? {}) }, ...opsi });
  if (!r.ok) throw new Error(`${alamat}: HTTP ${r.status}`);
  return r.text();
}

const lepas = (s) =>
  s.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/&\w+;/g, ' ')
    .replace(/\s+/g, ' ').trim();

const rupiah = (s) => {
  const n = Number(String(s).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const BULAN = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
};
const ROMAWI = { I: 1, II: 2, III: 3, IV: 4 };

// Artikel lama mengeja umurnya dengan KATA — "umur tanaman tiga tahun Rp1.723,70" — dan
// artikel baru memakai angka. Keduanya dipakai bergantian bahkan di dalam satu artikel yang
// sama, karena pita 10–20 selalu berangka sementara umur tunggal kerap tereja. Tanpa ini,
// 33 dari 58 artikel tertolak — seluruhnya yang lebih tua dari 2024.
const EJAAN = {
  tiga: '3', empat: '4', lima: '5', enam: '6', tujuh: '7',
  delapan: '8', sembilan: '9', sepuluh: '10',
};
const RE_PITA = new RegExp(
  'umur(?:\\s+tanaman)?\\s+' +
  '(\\d{1,2}(?:\\s*[-–—]\\s*\\d{1,2})?|' + Object.keys(EJAAN).join('|') + ')' +
  '\\s*(?:\\([a-z ]+\\)\\s*)?tahun\\s*,?\\s*(?:sebesar\\s+)?Rp\\s?([\\d.]+,\\d{2})',
  'gi');

// ---------------------------------------------------------------------------
// 1. Indeks — satu permintaan
// ---------------------------------------------------------------------------
async function daftarArtikel() {
  const html = await ambil(`${BASIS}/berita`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'cari=Harga TBS',
  });
  const keluar = new Map();
  for (const m of html.matchAll(/\/berita\/read\/(\d+)\/([a-z0-9-]+)/g)) keluar.set(m[1], m[2]);
  const cacah = html.match(/Ditemukan\s+(\d+)\s+berita/i);
  process.stderr.write(`Indeks: ${keluar.size} artikel${cacah ? ` (situs menyebut ${cacah[1]})` : ''}\n`);
  return keluar;
}

// ---------------------------------------------------------------------------
// 2. Urai satu artikel
// ---------------------------------------------------------------------------
function urai(id, slug, html) {
  const t = lepas(html);

  // Tabel umur. Dua bentuk penulisan dipakai bergantian di dalam satu artikel yang sama:
  //   "umur tanaman 3 (tiga) tahun Rp2.409,66"   angka lalu ejaannya dalam kurung
  //   "umur 10 - 20 tahun Rp3.295,71"            pita, tanpa ejaan
  const pita = {};
  for (const m of t.matchAll(RE_PITA)) {
    const label = (m[1] ?? '').trim();
    const angkaUmur = EJAAN[label.toLowerCase()] ?? label.replace(/\s*[-–—]\s*/, '-');
    pita[angkaUmur] = rupiah(m[2]);
  }
  if (Object.keys(pita).length < 6) {
    return { id, lewat: `tabel umur tidak terurai (${Object.keys(pita).length} pita ditemukan, perlu ≥6)` };
  }

  // UJI BENTUK KURVA. Harga TBS naik menurut umur tanaman sampai puncaknya lalu turun —
  // itu agronomi, bukan kebetulan penulisan. Maka pita termuda WAJIB yang terendah.
  //
  // Uji ini ada karena satu rekaman lolos seluruh pemeriksaan lain sambil rusak: umur 3
  // terurai Rp2.901 — lebih tinggi daripada pita 10–20 — dengan umur 6 dan 8 hilang, akibat
  // pola yang menyeberangi batas kalimat. Uji julat meloloskannya karena nilainya masuk akal
  // sebagai harga. Yang menangkapnya hanya bentuk, bukan besaran.
  const termuda = Object.keys(pita).map((k) => Number(String(k).split('-')[0])).sort((a, b) => a - b)[0];
  const nilaiTermuda = pita[String(termuda)];
  const nilaiLain = Object.entries(pita).filter(([k]) => Number(String(k).split('-')[0]) !== termuda).map(([, v]) => v);
  if (nilaiTermuda !== undefined && nilaiLain.some((v) => v < nilaiTermuda)) {
    return { id, lewat: `bentuk kurva tidak wajar: umur ${termuda} (${nilaiTermuda}) bukan yang terendah` };
  }

  // Yang dipakai sebagai seri: pita TERTINGGI, bukan yang kebetulan disebut judul. Tiap
  // provinsi mengumumkan pita puncaknya sendiri, dan menyamakan keduanya tanpa menyebut
  // pitanya akan membandingkan dua hal yang berbeda.
  const urut = Object.entries(pita).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  if (!urut.length) return { id, lewat: 'tabel umur terurai tetapi seluruh nilainya nol' };
  const [pitaPuncak, harga] = urut[0];

  // Pemeriksaan silang lewat slug, bila ia memuat angkanya: "...-di-angka-rp3-295-71".
  let silang = 'julat';
  const mSlug = slug.match(/rp-?(\d{1,2}(?:-\d{3})*)-(\d{2})(?:-|$)/i);
  if (mSlug) {
    const dariSlug = Number(`${mSlug[1].replace(/-/g, '')}.${mSlug[2]}`);
    if (Number.isFinite(dariSlug) && dariSlug >= 1000) {
      silang = 'slug';
      if (Math.trunc(dariSlug) !== Math.trunc(harga)) {
        return { id, lewat: `badan (${harga}) dan slug (${dariSlug}) tidak sepakat` };
      }
    }
  }

  // Periode: "periode II bulan Juli 2025" + rentang berlakunya "16 s.d. 31 Juli 2025".
  const mRentang = t.match(/berlaku[^.]{0,40}?(\d{1,2})\s*(?:s\.?d\.?|sampai(?:\s+dengan)?|hingga|[-–—])\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i);
  const mPeriode = t.match(/periode\s+(I{1,3}V?|IV)\s+bulan\s+([A-Za-z]+)\s+(\d{4})/i)
    ?? t.match(/periode\s+bulan\s+([A-Za-z]+)\s+(\d{4})/i);

  let awal, akhir, periode = null;
  if (mRentang) {
    const b = BULAN[mRentang[3].toLowerCase()];
    if (!b) return { id, lewat: `bulan tidak dikenali: ${mRentang[3]}` };
    const p = (d) => `${mRentang[4]}-${String(b).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    awal = p(mRentang[1]); akhir = p(mRentang[2]);
  } else if (mPeriode) {
    // Tanpa rentang tanggal eksplisit, periode dipetakan ke paruh bulan. Ini NOMINAL, dan
    // ditandai begitu — periode I berlaku 1–15, periode II 16–akhir bulan.
    const rom = mPeriode.length === 4 ? ROMAWI[mPeriode[1].toUpperCase()] : 1;
    const nb = mPeriode.length === 4 ? mPeriode[2] : mPeriode[1];
    const th = mPeriode.length === 4 ? mPeriode[3] : mPeriode[2];
    const b = BULAN[nb.toLowerCase()];
    if (!b || !rom) return { id, lewat: `periode tidak dikenali: ${mPeriode[0]}` };
    periode = rom;
    const hari = rom === 1 ? 1 : 16;
    awal = `${th}-${String(b).padStart(2, '0')}-${String(hari).padStart(2, '0')}`;
    akhir = awal;
  } else {
    return { id, lewat: 'periode tidak ditemukan' };
  }

  const mCpo = t.match(/harga CPO\s*(?:sebesar\s*)?Rp\s?([\d.]+,\d{2})/i);
  const mPk = t.match(/harga (?:PK|inti)[^.]{0,40}?Rp\s?([\d.]+,\d{2})/i);
  const mK = t.match(/indeks\s*"?\s*K\s*"?[^.]{0,60}?([\d]{1,3},\d{1,2})\s*%/i);

  return {
    id,
    provinsi: 'Kalimantan Tengah',
    t: awal,
    periode_akhir: akhir,
    ...(periode ? { periode, tanggal_nominal: true } : {}),
    pita_puncak: pitaPuncak,
    tbs: harga,
    tbs_umur: pita,
    ...(mCpo ? { cpo: rupiah(mCpo[1]) } : {}),
    ...(mPk ? { pk: rupiah(mPk[1]) } : {}),
    ...(mK ? { indeks_k: rupiah(mK[1]) } : {}),
    silang,
    sumber: `${BASIS}/berita/read/${id}/${slug}`,
  };
}

// ---------------------------------------------------------------------------
// 3. Jalan
// ---------------------------------------------------------------------------
const lama = existsSync(KELUAR)
  ? readFileSync(KELUAR, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))
  : [];
const sudah = new Set(lama.map((r) => String(r.id)));

const indeks = await daftarArtikel();
const perlu = [...indeks.entries()].filter(([id]) => ulang || !sudah.has(id));
process.stderr.write(`Perlu diambil: ${perlu.length}\n`);

const baru = [];
const ditolak = [];
for (const [i, [id, slug]] of perlu.entries()) {
  try {
    const hasil = urai(id, slug, await ambil(`${BASIS}/berita/read/${id}/${slug}`));
    if (hasil.lewat) ditolak.push(hasil); else baru.push(hasil);
  } catch (e) {
    ditolak.push({ id, lewat: e.message });
  }
  if ((i + 1) % 20 === 0) process.stderr.write(`  ${i + 1}/${perlu.length}…\n`);
  if (i + 1 < perlu.length) await tidur(JEDA_MS);
}

// Uji julat untuk yang tidak punya angka di slug-nya.
const semua = [...lama, ...baru];
const acuan = semua.filter((r) => r.silang === 'slug').map((r) => r.tbs).sort((a, b) => a - b);
const gugur = new Set();
if (acuan.length >= 3) {
  const median = acuan[Math.floor(acuan.length / 2)];
  for (const r of baru.filter((x) => x.silang === 'julat')) {
    if (r.tbs < median * 0.5 || r.tbs > median * 1.8) {
      ditolak.push({ id: r.id, lewat: `uji julat gagal: ${r.tbs} jauh dari median ${median}` });
      gugur.add(String(r.id));
    }
  }
}

const peta = new Map(lama.map((r) => [String(r.id), r]));
for (const r of baru) if (!gugur.has(String(r.id))) peta.set(String(r.id), r);
const keluar = [...peta.values()].sort((a, b) => a.t.localeCompare(b.t));

const TERLARANG = ['nik', 'nip', 'no_telp', 'telepon', 'alamat', 'email'];
const bocor = TERLARANG.filter((f) => JSON.stringify(keluar).toLowerCase().includes(`"${f}"`));
if (bocor.length) {
  console.error(`BERHENTI — medan data pribadi ikut ke keluaran: ${bocor.join(', ')}.`);
  process.exit(1);
}

writeFileSync(KELUAR, keluar.map((r) => JSON.stringify(r)).join('\n') + '\n');

const n = (x) => x.toLocaleString('id-ID');
const pitaCacah = {};
for (const r of keluar) pitaCacah[r.pita_puncak] = (pitaCacah[r.pita_puncak] ?? 0) + 1;
console.log(`\nArtikel diperiksa      : ${n(perlu.length)}`);
console.log(`  terurai              : ${n(baru.length - gugur.size)}`);
console.log(`  DITOLAK              : ${n(ditolak.length)}`);
for (const d of ditolak.slice(0, 10)) console.log(`      ${d.id}: ${d.lewat}`);
if (ditolak.length > 10) console.log(`      … dan ${n(ditolak.length - 10)} lagi`);
console.log(`Arsip seluruhnya       : ${n(keluar.length)} penetapan${keluar.length ? ` — ${keluar[0].t} s.d. ${keluar.at(-1).t}` : ''}`);
console.log(`  pita puncak          : ${Object.entries(pitaCacah).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} th (${v})`).join(' · ')}`);
console.log(`  ber-Indeks K         : ${n(keluar.filter((r) => r.indeks_k).length)} · ber-CPO: ${n(keluar.filter((r) => r.cpo).length)} · ber-PK: ${n(keluar.filter((r) => r.pk).length)}`);
console.log(`  tanggal nominal      : ${n(keluar.filter((r) => r.tanggal_nominal).length)} — periode tanpa rentang tanggal eksplisit`);
console.log(`  silang lewat slug    : ${n(keluar.filter((r) => r.silang === 'slug').length)} · lewat uji julat: ${n(keluar.filter((r) => r.silang === 'julat').length)}`);
console.log(`Penjaga PII            : lolos`);
console.log(`Ditulis ke             : ${KELUAR}`);
