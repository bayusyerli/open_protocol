// Menyusun kosakata `bpp` — Balai Penyuluhan Pertanian beserta kecamatan yang dibinanya.
//
//   node spec/tools/bangun-bpp.mjs            # periksa saja, laporkan sebarannya
//   node spec/tools/bangun-bpp.mjs --tulis    # tulis spec/vocab/bpp/
//
// KENAPA ENTITASNYA BALAI, BUKAN KECAMATAN
// Sumbernya memberi satu baris per kecamatan, dan 519 balai muncul di lebih dari satu
// baris karena membina beberapa kecamatan sekaligus. Menyimpannya satu rekaman per
// kecamatan akan memecah balai yang sama jadi beberapa halaman yang masing-masing tampak
// berdiri sendiri, dan pertanyaan "balai ini membina mana saja" tidak bisa dijawab dari
// mana pun. Karena itu barisnya dikelompokkan menurut provinsi + kabupaten + nama balai
// yang sudah diseragamkan, dan kecamatannya jadi medan `serves`.
//
// NAMA ASLI TIDAK PERNAH DITIMPA
// Sumber menulis nama balai sekenanya: "BPP  Menthobi Raya" berspasi ganda, "BPP BULIK"
// berhuruf besar semua, "Air Anyut" tanpa awalan sama sekali. `label` memuat bentuk yang
// sudah diseragamkan, `name_variants` memuat seluruh ejaan aslinya — sesuai bagian 4
// konvensi kerja paralel: hasil penyeragaman selalu masuk kolom terpisah.
//
// YANG SENGAJA TIDAK ADA DI SINI
// Nama, NIP, dan kontak penyuluh. Laporan tamu SIMLUHTAN hanya memberi cacahan, dan hanya
// itu yang dicari — halaman bernama tentang orang adalah pemrosesan data pribadi yang
// tidak punya dasar di sini. Begitu pula alamat dan koordinat balai: tidak ada di sumber,
// dan menggeokode massal akan bertabrakan dengan rancangan "klaim" yang sama seperti pada
// toko tani.
//
// KECAMATAN TANPA NAMA
// 59 catatan punya nama balai dan cacah poktan tetapi medan kecamatannya kosong di sumber.
// Balainya nyata, jadi tetap jadi entitas; kecamatannya dihitung di `districts_unnamed` dan
// tidak dikarang ke dalam `serves`.
//
// NOL BUKAN DATA YANG HILANG
// 590 kecamatan punya balai tetapi nol penyuluh; dikelompokkan per balai angkanya jadi 54,
// karena balai yang membina beberapa kecamatan bisa punya orang di salah satunya saja.
// Keduanya benar pada butirannya masing-masing. Itu temuan, bukan kekosongan; medannya
// tetap ditulis nol, tidak dihilangkan.
//
// ID TIDAK PERNAH DIDAUR ULANG
// Berkas yang sudah ada dibaca lebih dulu: key yang sudah bernomor mempertahankan nomornya,
// yang baru mengambil nomor bebas berikutnya.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tulis = process.argv.includes('--tulis');
const SUMBER = join(akar, 'penyuluh_data', 'bpp-kecamatan.ndjson');
const WILAYAH = join(akar, 'penyuluh_data', 'dinas-wilayah.ndjson');
const KELUAR = join(akar, 'spec', 'vocab', 'bpp');
const NDJSON = join(KELUAR, 'bpp.ndjson');
const META = join(KELUAR, 'bpp.meta.json');

const BLOK = { from: 1000, to: 19999 };

if (!existsSync(SUMBER)) {
  console.error(`Sumber tidak ada: ${SUMBER}\nJalankan dulu: node penyuluh_data/susun.mjs`);
  process.exit(1);
}

const baca = (jalur) => readFileSync(jalur, 'utf8').split('\n').filter((x) => x.trim()).map((x) => JSON.parse(x));
const slug = (s) => String(s).toLowerCase().replace(/&/g, ' dan ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const judul = (s) => s.replace(/\S+/g, (k) => (/^[A-Z0-9.'-]+$/.test(k) && k.length > 3 ? k[0] + k.slice(1).toLowerCase() : k));

// --- dinas penaung per kabupaten --------------------------------------------------------
const dinas = new Map();
if (existsSync(WILAYAH)) {
  for (const w of baca(WILAYAH)) {
    if (w.tingkat === 'kabupaten' && w.dinas && w.dinas !== '-') dinas.set(`${w.provinsi}|${w.kabupaten}`, w.dinas);
  }
}

// --- kelompokkan baris kecamatan jadi balai ---------------------------------------------
const kelompok = new Map();
let tanpaBalai = 0;
for (const r of baca(SUMBER)) {
  if (!r.bpp) { tanpaBalai++; continue; }
  const k = `${r.provinsi}|${r.kabupaten}|${r.bpp_kanonik.toLowerCase()}`;
  if (!kelompok.has(k)) kelompok.set(k, []);
  kelompok.get(k).push(r);
}

// --- nomor yang sudah diberikan ----------------------------------------------------------
const nomorLama = new Map();
if (existsSync(NDJSON)) {
  for (const e of baca(NDJSON)) nomorLama.set(e.key, Number(e.id.slice(-8)));
}
const terpakai = new Set(nomorLama.values());
let berikut = BLOK.from;
const nomorBaru = () => {
  while (terpakai.has(berikut)) berikut++;
  if (berikut > BLOK.to) throw new Error(`Blok ${BLOK.from}-${BLOK.to} habis`);
  terpakai.add(berikut);
  return berikut;
};

const angka = (v) => (v === '' || v === undefined || v === null ? 0 : Number(v) || 0);

const items = [];
const kunciDipakai = new Set();
for (const [k, rows] of [...kelompok].sort((a, b) => a[0].localeCompare(b[0]))) {
  const [provinsi, kabupaten] = k.split('|');
  const kanonik = rows[0].bpp_kanonik;
  let key = slug(`${kabupaten}-${kanonik}`);
  if (kunciDipakai.has(key)) {           // belum pernah terjadi; dijaga supaya tetap unik
    let n = 2;
    while (kunciDipakai.has(`${key}-${n}`)) n++;
    key = `${key}-${n}`;
  }
  kunciDipakai.add(key);
  const nomor = nomorLama.get(key) ?? nomorBaru();

  const orang = ['penyuluh_pns', 'penyuluh_p3k', 'penyuluh_thl', 'penyuluh_swadaya', 'penyuluh_swasta']
    .map((m) => rows.reduce((a, r) => a + angka(r[m]), 0));
  const kodeKab = rows.find((r) => r.kode_kabupaten)?.kode_kabupaten ?? '';
  const penaung = dinas.get(`${provinsi}|${kabupaten}`);

  items.push({
    id: `op:bpp:${String(nomor).padStart(8, '0')}`,
    key,
    label: { id: `BPP ${judul(kanonik)}` },
    lifecycle: { version: '0.1.0', status: 'draft', created_at: '2026-08-23T00:00:00Z' },
    no_mapping_reason: 'SIMLUHTAN tidak memberi nomor identitas balai; yang ada hanya namanya dan kecamatan binaannya, jadi tidak ada pengenal luar yang bisa dipetakan.',
    region: { province: provinsi, regency: kabupaten, ...(kodeKab ? { regency_code: kodeKab } : {}) },
    serves: [...new Set(rows.map((r) => r.kecamatan).filter((x) => x && x.length >= 2))].sort(),
    name_variants: [...new Set(rows.map((r) => r.bpp))].sort(),
    counts: {
      districts: new Set(rows.map((r, i) => r.kecamatan || `#${i}`)).size,
      ...(rows.filter((r) => !r.kecamatan || r.kecamatan.length < 2).length
        ? { districts_unnamed: rows.filter((r) => !r.kecamatan || r.kecamatan.length < 2).length }
        : {}),
      farmer_groups: rows.reduce((a, r) => a + angka(r.poktan), 0),
      extension_workers: {
        pns: orang[0], p3k: orang[1], thl: orang[2], swadaya: orang[3], swasta: orang[4],
        total: orang.reduce((a, b) => a + b, 0),
      },
    },
    ...(penaung ? { supervising_office: penaung } : {}),
  });
}
items.sort((a, b) => a.id.localeCompare(b.id));

// --- laporan ------------------------------------------------------------------------------
const jml = (f) => items.reduce((a, x) => a + f(x), 0);
const kosong = items.filter((x) => x.counts.extension_workers.total === 0).length;
const banyak = items.filter((x) => x.counts.districts > 1).length;
console.log(`\nbpp: ${items.length} balai dari ${kelompok.size} kelompok · ${jml((x) => x.counts.districts)} kecamatan terbina (${tanpaBalai} kecamatan belum punya balai terdaftar)`);
console.log(`  ${banyak} balai membina lebih dari satu kecamatan · ${kosong} balai nol penyuluh`);
console.log(`  poktan ${jml((x) => x.counts.farmer_groups).toLocaleString('id-ID')} · penyuluh ${jml((x) => x.counts.extension_workers.total).toLocaleString('id-ID')} · dinas penaung terisi ${items.filter((x) => x.supervising_office).length}`);
console.log(`  nomor ${Math.min(...items.map((x) => Number(x.id.slice(-8))))}–${Math.max(...items.map((x) => Number(x.id.slice(-8))))} dalam blok ${BLOK.from}–${BLOK.to}`);

if (!tulis) { console.log('\n(hanya periksa; tambahkan --tulis untuk menulis)'); process.exit(0); }

const meta = {
  $schema: '../../schema/collection.schema.json',
  collection: {
    entity_type: 'bpp',
    label: { id: 'Balai Penyuluhan Pertanian beserta kecamatan binaannya' },
    scope: {
      id: `${items.length} balai penyuluhan di 34 provinsi dan 514 kabupaten/kota, membina ${jml((x) => x.counts.districts).toLocaleString('id-ID')} kecamatan, menurut laporan tamu SIMLUHTAN per 23 Agustus 2026. Entitasnya balai, bukan kecamatan: ${banyak} balai membina lebih dari satu kecamatan. ${tanpaBalai} kecamatan punya catatan penyuluh tetapi belum punya balai terdaftar dan karena itu tidak jadi entitas di sini. Nama, NIP, dan kontak penyuluh tidak ada di sumbernya dan tidak dicari; yang disimpan hanya kelembagaan dan cacahan orangnya. Update SIMLUHTAN sedang ditutup untuk pemeliharaan sampai 30 Agustus 2026 menurut pengumuman di halaman depannya — angka ini potret sebelum itu.`,
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
          title: 'Laporan tamu SIMLUHTAN — Kelembagaan Penyuluhan dan Ketenaga Penyuluhan',
          publisher: 'Badan Penyuluhan dan Pengembangan SDM Pertanian, Kementerian Pertanian RI',
          url: 'https://simluh.pertanian.go.id/guestreport',
          year: 2026,
          locator: 'Tiga tingkat tabel (nasional, provinsi, kabupaten); nama balai hanya muncul di tingkat kabupaten. Ditarik dengan penyuluh_data/tarik-simluhtan.mjs dan penyuluh_data/tarik-ketenagaan.mjs.',
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
