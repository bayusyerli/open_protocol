// Menyusun kosakata `lab` — laboratorium penguji terakreditasi yang lingkupnya menyentuh
// usaha tani.
//
//   node spec/tools/bangun-lab.mjs            # periksa saja, laporkan sebarannya
//   node spec/tools/bangun-lab.mjs --tulis    # tulis spec/vocab/lab/
//
// KENAPA HANYA YANG MENYENTUH USAHA TANI
// Papan resmi KAN memuat 1.671 laboratorium penguji berakreditasi aktif; sebagian besar
// menguji kWh meter, bahan bakar, tekstil, dan beton. Registri ini menjanjikan jawaban
// atas pertanyaan usaha tani — memasukkan laboratorium kalibrasi minyak lumas ke dalamnya
// bukan kelengkapan, melainkan kebisingan yang membuat pencarian "uji tanah" memulangkan
// hal yang tidak ada hubungannya. Penyaringnya ruang lingkup, bukan nama.
//
// DUA SUMBER, DUA KELENGKAPAN YANG BERBEDA
//   lpk_data/lab-uji-tani.ndjson   papan Looker KAN: seluruh lembaga + masa berlaku,
//                                  tetapi lingkupnya satu paragraf ringkasan.
//   lpk_data/raw/lingkup/          aplikasi layanan.kan.or.id: lingkup terurai per
//                                  parameter, tetapi baru memuat sekitar seperlima lembaga.
// Yang pertama jadi kerangka, yang kedua mengisi blok `scope_detail` di mana cocok.
// Ketiadaan `scope_detail` berarti lembaganya belum pindah ke aplikasi itu — BUKAN berarti
// lingkupnya sempit, dan skema menuliskannya supaya tidak terbaca begitu.
//
// NAMA PETUGAS DIBUANG
// Tiap catatan di aplikasi layanan membawa nama dan id petugas penghubung. Direktori ini
// tidak butuh orangnya untuk menjawab ke mana sampel dikirim, jadi medannya tidak pernah
// ikut — bukan disamarkan, tidak diambil sama sekali.
//
// ID TIDAK PERNAH DIDAUR ULANG
// Nomor akreditasi jadi `key`, dan berkas yang sudah ada dibaca lebih dulu: key yang sudah
// bernomor mempertahankan nomornya, yang baru mengambil nomor bebas berikutnya. Menjalankan
// ulang pada sumber yang sama menghasilkan berkas yang sama persis.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tulis = process.argv.includes('--tulis');
const SUMBER = join(akar, 'lpk_data', 'lab-uji-tani.ndjson');
const KELUAR = join(akar, 'spec', 'vocab', 'lab');
const NDJSON = join(KELUAR, 'lab.ndjson');
const META = join(KELUAR, 'lab.meta.json');

const BLOK = { from: 1000, to: 9999 };

if (!existsSync(SUMBER)) {
  console.error(`Sumber tidak ada: ${SUMBER}\nJalankan dulu: node lpk_data/susun.mjs`);
  process.exit(1);
}

const baris = readFileSync(SUMBER, 'utf8').split('\n').filter((x) => x.trim()).map((x) => JSON.parse(x));

// --- nomor yang sudah diberikan --------------------------------------------------------
const nomorLama = new Map();
if (existsSync(NDJSON)) {
  for (const b of readFileSync(NDJSON, 'utf8').split('\n').filter((x) => x.trim())) {
    const e = JSON.parse(b);
    nomorLama.set(e.key, Number(e.id.slice(-8)));
  }
}
const terpakai = new Set(nomorLama.values());
let berikut = BLOK.from;
const nomorBaru = () => {
  while (terpakai.has(berikut)) berikut++;
  if (berikut > BLOK.to) throw new Error(`Blok ${BLOK.from}-${BLOK.to} habis`);
  terpakai.add(berikut);
  return berikut;
};

const kunci = (nomor) => nomor.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// --- rakit -----------------------------------------------------------------------------
const items = [];
const bentrok = new Map();
for (const r of baris) {
  const k = kunci(r.no_akreditasi);
  if (bentrok.has(k)) { bentrok.set(k, bentrok.get(k) + 1); continue; }
  bentrok.set(k, 1);
  const nomor = nomorLama.get(k) ?? nomorBaru();

  const item = {
    id: `op:lab:${String(nomor).padStart(8, '0')}`,
    key: k,
    label: { id: r.nama },
    lifecycle: { version: '0.1.0', status: 'draft', created_at: '2026-08-23T00:00:00Z' },
    mappings: [{
      scheme: 'KAN',
      id: r.no_akreditasi,
      relation: 'exact',
      note: 'Nomor akreditasi sebagaimana tertulis di papan lembaga terakreditasi KAN.',
    }],
    accreditation: {
      number: r.no_akreditasi,
      scheme_code: r.no_akreditasi.split('-')[0],
      ...(r.masa_berlaku ? { valid_until: r.masa_berlaku } : { valid_until_raw: r.masa_berlaku_asli }),
    },
    address: { text: r.alamat, ...(r.provinsi ? { province: r.provinsi } : {}) },
    capabilities: {
      soil: !!r.uji_tanah,
      fertilizer: !!r.uji_pupuk,
      water: !!r.uji_air,
      food: !!r.uji_pangan,
      plant_tissue: !!r.uji_tanaman,
      pesticide_residue: !!r.uji_residu_pestisida,
    },
    scope_summary: r.lingkup,
  };

  const kontak = {};
  if (r.telepon) kontak.phone = r.telepon;
  if (r.surel) kontak.email = r.surel;
  if (Object.keys(kontak).length) item.contact = kontak;

  if (r.kode_k01 || r.baris_lingkup !== '' || r.lingkup_per) {
    item.scope_detail = {
      ...(r.kode_k01 ? { k01_codes: r.kode_k01.split(' ').filter(Boolean) } : {}),
      ...(r.baris_lingkup !== '' ? { rows: Number(r.baris_lingkup) } : {}),
      ...(r.lingkup_per ? { amended_at: r.lingkup_per } : {}),
      ...(r.rincian ? { source: r.rincian } : {}),
    };
  }
  if (/^https?:\/\//.test(r.berkas_lingkup)) item.scope_document = r.berkas_lingkup;

  items.push(item);
}
items.sort((a, b) => a.id.localeCompare(b.id));

// --- laporan ----------------------------------------------------------------------------
const hitung = (f) => items.filter(f).length;
const ganda = [...bentrok.values()].filter((n) => n > 1).length;
console.log(`\nlab: ${items.length} entitas dari ${baris.length} baris sumber${ganda ? ` (${ganda} nomor akreditasi kembar digabung)` : ''}`);
console.log(`  tanah ${hitung((x) => x.capabilities.soil)} · pupuk ${hitung((x) => x.capabilities.fertilizer)} · air ${hitung((x) => x.capabilities.water)} · pangan ${hitung((x) => x.capabilities.food)} · jaringan tanaman ${hitung((x) => x.capabilities.plant_tissue)} · residu pestisida ${hitung((x) => x.capabilities.pesticide_residue)}`);
console.log(`  lingkup terurai ${hitung((x) => x.scope_detail?.rows !== undefined)} · masa berlaku terbaca ${hitung((x) => x.accreditation.valid_until)} · provinsi terbaca ${hitung((x) => x.address?.province)}`);
console.log(`  nomor ${Math.min(...items.map((x) => Number(x.id.slice(-8))))}–${Math.max(...items.map((x) => Number(x.id.slice(-8))))} dalam blok ${BLOK.from}–${BLOK.to}`);

if (!tulis) { console.log('\n(hanya periksa; tambahkan --tulis untuk menulis)'); process.exit(0); }

const meta = {
  $schema: '../../schema/collection.schema.json',
  collection: {
    entity_type: 'lab',
    label: { id: 'Laboratorium penguji terakreditasi yang lingkupnya menyentuh usaha tani' },
    scope: {
      id: `${items.length} dari 1.671 laboratorium penguji berakreditasi aktif di papan lembaga terakreditasi KAN per 23 Agustus 2026 — yang ruang lingkupnya menyebut tanah, pupuk, air, pangan, jaringan tanaman, atau residu pestisida. Sisanya sengaja tidak dijadikan entitas: laboratorium yang seluruhnya menguji kelistrikan, bahan bakar, tekstil, atau konstruksi tidak menjawab pertanyaan siapa pun di registri ini. Penanda kemampuan dibaca dari teks ringkasan lingkup, bukan dari kode, dan \`scope_summary\` selalu ikut supaya pembacaannya bisa diperiksa ulang. Blok \`scope_detail\` hanya ada pada lembaga yang juga terdaftar di aplikasi direktori KAN — ketiadaannya bukan berarti lingkupnya sempit. Nama petugas penghubung tersedia di sumbernya dan sengaja tidak diambil.`,
    },
    lifecycle: {
      version: '0.1.0',
      status: 'draft',
      created_at: '2026-08-23T00:00:00Z',
      review_due: '2026-11-23',
    },
    provenance: {
      license: 'CC-BY-SA-4.0',
      sources: [
        {
          title: 'Papan lembaga terakreditasi — Laboratorium Penguji (LP Active)',
          publisher: 'Komite Akreditasi Nasional (BSN)',
          url: 'https://kan.or.id/index.php/documents/terakreditasi/77-laboratorium',
          year: 2026,
          locator: 'Papan Looker Studio yang ditaut dari halaman Terakreditasi; 1.671 baris beserta masa berlaku akreditasi. Ditarik dengan lpk_data/tarik-looker.mjs.',
          retrieved: '2026-08-23',
        },
        {
          title: 'Direktori LPK — aplikasi layanan KAN',
          publisher: 'Komite Akreditasi Nasional (BSN)',
          url: 'https://layanan.kan.or.id/',
          year: 2026,
          locator: 'Ruang lingkup terurai per parameter untuk lembaga yang sudah pindah ke aplikasi ini. Ditarik dengan lpk_data/tarik-kan.mjs dan lpk_data/tarik-lingkup.mjs.',
          retrieved: '2026-08-23',
        },
      ],
    },
    storage: 'ndjson',
    count: items.length,
    id_blocks: [BLOK],
  },
};

mkdirSync(KELUAR, { recursive: true });
writeFileSync(NDJSON, items.map((x) => JSON.stringify(x)).join('\n') + '\n');
writeFileSync(META, JSON.stringify(meta, null, 2) + '\n');
console.log(`\nDitulis ke ${KELUAR}`);
