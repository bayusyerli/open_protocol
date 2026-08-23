// Menarik penetapan harga TBS kelapa sawit Kepulauan Bangka Belitung — terbit sebagai
// selebaran PNG, jadi perlu OCR.
//
//   node harga_data/tarik-tbs-babel.mjs           # tarik yang belum ada, OCR, gabung
//   node harga_data/tarik-tbs-babel.mjs --ulang   # olah ulang seluruhnya
//
// Menuntut binernya sudah dikompilasi:
//   swiftc -O harga_data/ocr-vision.swift -o harga_data/bin/ocr-vision
//
// PNG-NYA DIBACA, PDF-NYA TIDAK — DAN ITU BERLAWANAN DENGAN NALURI
// Tiap pengumuman membawa dua lampiran: berita acara PDF dan selebaran PNG. PDF biasanya
// pilihan yang benar karena ia bisa berlapis teks — dan PDF ini MEMANG berlapis teks. Tetapi
// lapisan itu hasil OCR pihak lain yang rusak: "Ju.'n", "e219", "'t5.7 t7,3f", "2'1.23".
// Membacanya menghasilkan angka yang tampak wajar dan salah.
//
// Selebaran PNG-nya, sebaliknya, terbaca Vision dengan keyakinan 1,00 pada hampir seluruh
// barisnya. Jadi yang dipakai gambar, dan PDF-nya diabaikan. Inilah alasan ocr-vision.swift
// mengeluarkan medan `asal`: tanpa membedakan lapisan teks dari pengenalan gambar, keputusan
// ini tidak bisa diambil — dan yang salah justru akan terpilih.
//
// SELEBARANNYA PALING RAPI DARI SELURUH PROVINSI
// Label umur dan harganya SEBARIS: "3 TAHUN | 3.171". Tidak perlu menurunkan umur dari nomor
// baris seperti Kaltim, dan tidak perlu memisahkan kolom seperti Kalteng. Yang dibutuhkan
// hanya memasangkan keduanya menurut koordinat y.
//
// ARSIPNYA TIPIS DAN BERGULIR
// Hanya 4 pengumuman TBS di seluruh arsip, dan yang lama menghilang seiring pengumuman baru
// terbit. Seperti Kalbar, arsipnya jadi milik kita: berkas ini tidak pernah menimpa, dan
// menjalankannya rutin membangun riwayat yang tidak bisa didapat sekali tarik.
//
// CRAWL-DELAY 10 DETIK, DAN ITU MENGIKAT
// `drupal.dpkp.babelprov.go.id/robots.txt` memasang `Crawl-delay: 10`. Lampirannya diambil
// dari host itu, jadi jeda sepuluh detik dihormati apa adanya. Lambat, dan memang seharusnya.

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const UA = 'OpenProtocols/0.1 (+https://github.com/bayusyerli/open_protocol) riset harga sawit';
const BASIS = 'https://dpkp.babelprov.go.id';
const KELUAR = join('harga_data', 'tbs-babel.ndjson');
const SINGGAH = join('harga_data', 'mentah', 'babel');
const OCR = join('harga_data', 'bin', 'ocr-vision');
const ulang = process.argv.includes('--ulang');

if (!existsSync(OCR)) {
  console.error(`Biner OCR belum ada. Kompilasi dulu:\n  swiftc -O harga_data/ocr-vision.swift -o ${OCR}`);
  process.exit(1);
}

// Dua jeda berbeda untuk dua host. Yang memasang Crawl-delay dihormati apa adanya.
const JEDA_SITUS = 700;
const JEDA_DRUPAL = 10_000;
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

const BULAN = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
};
const ROMAWI = { i: 1, ii: 2, iii: 3, iv: 4 };

const angka = (s) => {
  const b = String(s).replace(/[^\d.,]/g, '');
  if (!b) return null;
  const m = b.match(/^(.*)([.,])(\d+)$/);
  if (!m) { const n = Number(b); return Number.isFinite(n) ? n : null; }
  const ribuan = m[3].length === 3 && m[1].length > 0;
  const utuh = m[1].replace(/[.,]/g, '');
  const n = Number(ribuan ? `${utuh}${m[3]}` : `${utuh || '0'}.${m[3]}`);
  return Number.isFinite(n) ? n : null;
};

async function ambil(alamat, biner = false) {
  const r = await fetch(alamat, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  if (!r.ok) throw new Error(`${alamat}: HTTP ${r.status}`);
  return biner ? Buffer.from(await r.arrayBuffer()) : r.text();
}

// ---------------------------------------------------------------------------
// 1. Indeks
// ---------------------------------------------------------------------------
async function daftar() {
  const semua = new Set();
  for (let p = 1; p <= 40; p++) {
    const html = await ambil(`${BASIS}/pengumuman?page=${p}`);
    const sl = [...new Set([...html.matchAll(/\/pengumuman_detil\/([a-z0-9-]+)/g)].map((m) => m[1]))];
    const baru = sl.filter((x) => !semua.has(x));
    for (const x of sl) semua.add(x);
    if (!baru.length) break;
    await tidur(JEDA_SITUS);
  }
  const tbs = [...semua].filter((x) => /tbs|sawit/i.test(x));
  process.stderr.write(`Indeks: ${semua.size} pengumuman, ${tbs.length} menyebut TBS/sawit\n`);
  return tbs;
}

function periodeDari(slug, teks) {
  const sumber = `${slug} ${teks}`;
  // "PERIODE II 16 APRIL 2026 - 30 APRIL 2026" bila ada rentangnya.
  const rentang = sumber.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s*[-–—]\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (rentang) {
    const b1 = BULAN[rentang[2].toLowerCase()], b2 = BULAN[rentang[5].toLowerCase()];
    if (b1 && b2) {
      return {
        awal: `${rentang[3]}-${String(b1).padStart(2, '0')}-${String(rentang[1]).padStart(2, '0')}`,
        akhir: `${rentang[6]}-${String(b2).padStart(2, '0')}-${String(rentang[4]).padStart(2, '0')}`,
        nominal: false,
      };
    }
  }
  // "periode-ii-april-2026" — periode romawi + bulan. Tanggalnya NOMINAL.
  const m = sumber.match(/periode[\s-]+(iv|iii|ii|i)[\s-]+([a-z]+)[\s-]+(\d{4})/i);
  if (m) {
    const b = BULAN[m[2].toLowerCase()], ke = ROMAWI[m[1].toLowerCase()];
    if (b && ke) {
      const hari = ke === 1 ? 1 : 16;
      const p = `${m[3]}-${String(b).padStart(2, '0')}-${String(hari).padStart(2, '0')}`;
      return { awal: p, akhir: p, nominal: true, periode: ke };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// 2. Urai selebaran
// ---------------------------------------------------------------------------
function uraiSelebaran(hasil) {
  const B = (hasil.baris ?? []).filter((b) => b.teks.trim());
  if (!B.length) return { lewat: 'OCR tidak menghasilkan satu baris pun' };

  // Label umur di kolom kiri, harganya di kolom kanan, SEBARIS. Dipasangkan menurut y.
  const label = B.filter((b) => /^\s*\d{1,2}(\s*[-–—]\s*\d{1,2})?\s*TAHUN\s*$/i.test(b.teks));
  const pita = {};
  for (const l of label) {
    const umur = l.teks.replace(/\s*TAHUN\s*/i, '').trim().replace(/\s*[-–—]\s*/, '-');
    const kanan = B.filter((b) => b.x > l.x + 0.1 && Math.abs(b.y - l.y) < 0.012)
      .map((b) => angka(b.teks)).filter((v) => v !== null && v > 500);
    if (kanan.length) pita[umur] = kanan[0];
  }
  if (Object.keys(pita).length < 6) {
    return { lewat: `tabel umur tidak terurai (${Object.keys(pita).length} pita, perlu ≥6)` };
  }

  // Uji bentuk kurva: pita termuda wajib yang terendah. TIDAK dipakai uji menaik seperti
  // Kaltim — kurva Babel naik sampai pita 10–20 lalu TURUN sampai umur 25, dan itu bentuk
  // yang benar. Menuntutnya menaik akan menolak data yang justru sahih.
  const termuda = Object.keys(pita).map((k) => Number(String(k).split('-')[0])).sort((a, b) => a - b)[0];
  const nilaiTermuda = pita[String(termuda)];
  if (nilaiTermuda !== undefined && Object.entries(pita).some(([k, v]) => Number(String(k).split('-')[0]) !== termuda && v < nilaiTermuda)) {
    return { lewat: `bentuk kurva tidak wajar: umur ${termuda} (${nilaiTermuda}) bukan yang terendah` };
  }

  const t = B.map((b) => b.teks).join(' ');
  const mCpo = t.match(/CPO[^:]{0,40}:?\s*Rp\s?([\d.]+,\d{2})/i);
  const mKernel = t.match(/Kernel[^:]{0,40}:?\s*Rp\s?([\d.]+,\d{2})/i);
  const mK = t.match(/Indeks\s*"?\s*K\s*"?\s*:?\s*([\d]{1,3},\d{1,2})\s*%/i);

  const puncak = Object.entries(pita).sort((a, b) => b[1] - a[1])[0];
  return {
    pita,
    pitaPuncak: puncak[0],
    tbs: puncak[1],
    ...(mCpo ? { cpo: angka(mCpo[1]) } : {}),
    ...(mKernel ? { kernel: angka(mKernel[1]) } : {}),
    ...(mK ? { indeksK: angka(mK[1]) } : {}),
    teksGabung: t,
  };
}

// ---------------------------------------------------------------------------
// 3. Jalan
// ---------------------------------------------------------------------------
const lama = existsSync(KELUAR)
  ? readFileSync(KELUAR, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))
  : [];
const sudah = new Set(lama.map((r) => r.slug));

mkdirSync(SINGGAH, { recursive: true });
const slugTbs = await daftar();
const perlu = slugTbs.filter((s) => ulang || !sudah.has(s));
process.stderr.write(`Perlu diambil: ${perlu.length}\n`);

const baru = [];
const ditolak = [];
for (const [i, slug] of perlu.entries()) {
  try {
    const halaman = await ambil(`${BASIS}/pengumuman_detil/${slug}`);
    await tidur(JEDA_SITUS);

    // Hanya lampiran GAMBAR yang diambil. PDF-nya berlapis teks hasil OCR yang rusak —
    // lihat catatan di kepala berkas.
    const png = [...halaman.matchAll(/https?:\/\/[^"'\s<>]*?\/sites\/default\/files\/images\/[^"'\s<>]+/g)]
      .map((m) => m[0]).find((u) => /\.(png|jpe?g)$/i.test(u));
    if (!png) { ditolak.push({ slug, lewat: 'tidak ada lampiran gambar' }); continue; }

    const nama = join(SINGGAH, `${slug}.png`);
    if (!existsSync(nama)) {
      writeFileSync(nama, await ambil(png, true));
      await tidur(JEDA_DRUPAL);   // Crawl-delay: 10 pada host lampiran
    }

    const hasil = JSON.parse(execFileSync(OCR, [nama], { maxBuffer: 64 * 1024 * 1024 }).toString())[0];
    if (hasil.galat) { ditolak.push({ slug, lewat: hasil.galat }); continue; }

    const sel = uraiSelebaran(hasil);
    if (sel.lewat) { ditolak.push({ slug, lewat: sel.lewat }); continue; }

    const periode = periodeDari(slug, sel.teksGabung);
    if (!periode) { ditolak.push({ slug, lewat: 'periode tidak terbaca' }); continue; }

    baru.push({
      slug,
      provinsi: 'Kepulauan Bangka Belitung',
      t: periode.awal,
      periode_akhir: periode.akhir,
      ...(periode.nominal ? { tanggal_nominal: true } : {}),
      pita_puncak: sel.pitaPuncak,
      tbs: sel.tbs,
      tbs_umur: sel.pita,
      ...(sel.indeksK !== undefined ? { indeks_k: sel.indeksK } : {}),
      ...(sel.cpo !== undefined ? { cpo: sel.cpo } : {}),
      ...(sel.kernel !== undefined ? { kernel: sel.kernel } : {}),
      asal_teks: hasil.asal,
      sumber: `${BASIS}/pengumuman_detil/${slug}`,
    });
  } catch (e) {
    ditolak.push({ slug, lewat: e.message.slice(0, 90) });
  }
  process.stderr.write(`  ${i + 1}/${perlu.length}\n`);
}

const peta = new Map(lama.map((r) => [r.slug, r]));
for (const r of baru) peta.set(r.slug, r);
const keluar = [...peta.values()].sort((a, b) => a.t.localeCompare(b.t));

// Berita acara PDF membawa nama pejabat, NIP, dan pangkat/golongan. Berkas itu tidak dibaca
// sama sekali, tetapi penjaga tetap memeriksa KELUARAN — yang menjaga bukan niatnya.
const TERLARANG = ['nik', 'nip', 'no_telp', 'telepon', 'alamat', 'email', 'pangkat', 'golongan'];
const bocor = TERLARANG.filter((f) => JSON.stringify(keluar).toLowerCase().includes(`"${f}"`));
if (bocor.length) {
  console.error(`BERHENTI — medan data pribadi ikut ke keluaran: ${bocor.join(', ')}.`);
  process.exit(1);
}

writeFileSync(KELUAR, keluar.map((r) => JSON.stringify(r)).join('\n') + '\n');

const n = (x) => x.toLocaleString('id-ID');
console.log(`\nPengumuman diproses    : ${n(perlu.length)}`);
console.log(`  terurai              : ${n(baru.length)}`);
console.log(`  DITOLAK              : ${n(ditolak.length)}`);
for (const d of ditolak) console.log(`      ${d.slug}: ${d.lewat}`);
console.log(`Arsip seluruhnya       : ${n(keluar.length)} penetapan${keluar.length ? ` — ${keluar[0].t} s.d. ${keluar.at(-1).t}` : ''}`);
console.log(`  pita per penetapan   : ${keluar.length ? Object.keys(keluar.at(-1).tbs_umur).length : 0}`);
console.log(`  ber-Indeks K         : ${n(keluar.filter((r) => r.indeks_k).length)} · ber-CPO: ${n(keluar.filter((r) => r.cpo).length)}`);
console.log(`  dibaca dari          : ${[...new Set(keluar.map((r) => r.asal_teks))].join(', ') || '—'} (PDF berlapis teks sengaja diabaikan)`);
console.log(`Penjaga PII            : lolos`);
console.log(`Ditulis ke             : ${KELUAR}`);
