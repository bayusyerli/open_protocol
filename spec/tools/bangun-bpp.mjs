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

// --- sambungan ke kosakata wilayah -------------------------------------------------------
//
// Skema bpp menuliskan janjinya sendiri: "Wilayah sebagai teks, bukan rujukan ke entitas
// wilayah: kosakata `region` belum terisi. Begitu kosakata wilayah berdiri, medan-medan ini
// yang jadi jalannya." Kosakatanya sudah berdiri, jadi ditagih di sini.
//
// Dua sambungan dengan mutu yang BERBEDA, dan bedanya harus terlihat:
//   1. Kabupaten/kota — lewat KODE. SIMLUHTAN memakai kode BPS (5.842 dari 5.844 cocok
//      sebagai kode BPS, hanya 5.649 sebagai kode Kemendagri). Kode itu keras dan tidak
//      menebak apa pun.
//   2. Kecamatan — lewat NAMA, karena SIMLUHTAN tidak memberi kodenya. Nama itu lunak,
//      dan kelunakannya dicatat pada tiap baris lewat medan `match`.
const rapikanKunci = (x) => String(x).toLowerCase().replace(/[^a-z0-9]/g, '');
const KOSAKATA_WILAYAH = readFileSync(new URL('../vocab/region/wilayah.ndjson', import.meta.url), 'utf8')
  .split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
const kabByKode = new Map();
const kecByInduk = new Map();
const kabByProvinsi = new Map();
for (const w of KOSAKATA_WILAYAH) {
  if ((w.level === 'regency' || w.level === 'city') && w.code_scheme === 'BPS') {
    kabByKode.set(w.code, w);
    const kunci = rapikanKunci(w.parent?.label ?? '');
    if (!kabByProvinsi.has(kunci)) kabByProvinsi.set(kunci, []);
    kabByProvinsi.get(kunci).push(w);
  }
  if (w.level === 'district') {
    if (!kecByInduk.has(w.parent.id)) kecByInduk.set(w.parent.id, []);
    kecByInduk.get(w.parent.id).push(w);
  }
}

// Jarak sunting, dibatasi: begitu melewati ambang, hitungannya dihentikan. Yang dicari
// bukan seberapa jauh melainkan apakah masih di dalam ambang.
function jarak(a, b, ambang) {
  if (Math.abs(a.length - b.length) > ambang) return ambang + 1;
  let baris = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const baru = [i];
    let min = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(baru[j - 1] + 1, baris[j] + 1, baris[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      baru.push(v);
      if (v < min) min = v;
    }
    if (min > ambang) return ambang + 1;
    baris = baru;
  }
  return baris[b.length];
}

// Ambang jarak sunting SEBANDING panjang nama, bukan angka tetap — dan itu dipelajari
// dari kekeliruan, bukan dari teori.
//
// Ambang tetap 2 mula-mula dipakai, dan hasilnya diperiksa satu per satu: 36 pasangan,
// 33 di antaranya benar-benar varian ejaan (Minangkabau menulis "Sintuak" untuk "Sintuk",
// Aceh menulis "Seunuddon" untuk "Seunudon"). TIGA di antaranya salah, dan ketiganya
// salah dengan cara yang sama:
//
//   "NAMBO"        → "Kambu"          — dua kecamatan BERBEDA di Kota Kendari
//   "YARO"         → "Yaur"           — dua kecamatan BERBEDA di Nabire
//   "BARUMUN BARU" → "Barumun Barat"  — dua kecamatan BERBEDA di Padang Lawas
//
// Pada nama pendek, dua sunting bukan salah ketik melainkan tempat lain. Ambang yang
// sebanding panjang menolak ketiganya sekaligus menerima yang panjang, dan gerbang
// panjang minimum menutup sisanya. Ongkosnya satu pasangan benar yang ikut ditolak
// ("Lubuk Alung" → "Lubuak Aluang") — dan itu ongkos yang sengaja dibayar: tautan yang
// hilang terlihat di cacahan, tautan yang salah tidak terlihat siapa pun.
const RASIO = 0.18;
const PANJANG_MINIMUM = 6;
const ambangUntuk = (k) => Math.min(2, Math.max(1, Math.floor(k.length * RASIO)));

const tally = { exact: 0, approx: 0, none: 0, pendek: 0, ambigu: 0 };
const contohGagal = [];

// Pencocokan longgar hanya diterima bila TEPAT SATU calon berada di dalam ambang. Dua
// calon berarti alat ini sedang menebak, dan menebak nama tempat menghasilkan balai yang
// dicantumkan di kecamatan yang salah — kekeliruan yang tidak bisa dilihat pembacanya.
function cocokkanKecamatan(nama, induk) {
  const calon = induk ? (kecByInduk.get(induk.id) ?? []) : [];
  const k = rapikanKunci(nama);
  const persis = calon.find((c) => rapikanKunci(c.label.id) === k);
  if (persis) { tally.exact++; return { name: nama, id: persis.id, match: 'exact' }; }

  if (k.length >= PANJANG_MINIMUM) {
    const ambang = ambangUntuk(k);
    const dekat = calon
      .map((c) => ({ c, d: jarak(k, rapikanKunci(c.label.id), ambang) }))
      .filter((x) => x.d <= ambang);
    if (dekat.length === 1) {
      tally.approx++;
      return { name: nama, id: dekat[0].c.id, match: 'approx' };
    }
    if (dekat.length > 1) tally.ambigu++;
  } else {
    tally.pendek++;
  }

  tally.none++;
  if (contohGagal.length < 12) contohGagal.push(`${induk?.label.id ?? '(tanpa induk)'} — "${nama}"`);
  // Tanpa id, TETAPI namanya tetap ada. Baris yang tidak bisa dicocokkan tidak dijatuhkan:
  // kecamatan yang hilang dari daftar binaan terbaca sebagai kecamatan yang tidak dibina.
  return { name: nama, match: 'none' };
}

const kodeTakDikenal = new Set();
let lewatNama = 0;
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
  // Kode dulu; nama hanya kalau kodenya tidak dikenal. SIMLUHTAN memuat satu kode yang
  // bukan kode BPS mana pun — 9191 untuk Manokwari Selatan, yang kode BPS-nya 9111 — dan
  // membiarkan dua balai tak tertaut karena satu salah ketik di sumber adalah ongkos yang
  // tidak perlu dibayar. Cadangannya dibatasi kabupaten/kota DI PROVINSI YANG SAMA, dan
  // itu bukan kehati-hatian berlebihan: ada juga KECAMATAN bernama "Manokwari Selatan",
  // di dalam Kabupaten Manokwari, dan pencocokan nama tanpa batas tingkat akan
  // menyambungkan balai ke kecamatan alih-alih ke kabupatennya.
  let indukWilayah = kabByKode.get(kodeKab);
  let indukLewatNama = false;
  if (!indukWilayah) {
    const seprovinsi = kabByProvinsi.get(rapikanKunci(provinsi)) ?? [];
    const calon = seprovinsi.filter((w) => rapikanKunci(w.label.id).replace(/^(kabupaten|kota)/, '') === rapikanKunci(kabupaten).replace(/^(kabupaten|kota)/, ''));
    if (calon.length === 1) { indukWilayah = calon[0]; indukLewatNama = true; }
  }
  if (kodeKab && !kabByKode.has(kodeKab)) {
    kodeTakDikenal.add(`${kodeKab} ${provinsi}/${kabupaten}${indukWilayah ? ` → dicocokkan lewat nama ke ${indukWilayah.code}` : ' → TIDAK tertaut'}`);
  }
  if (indukLewatNama) lewatNama++;

  items.push({
    id: `op:bpp:${String(nomor).padStart(8, '0')}`,
    key,
    label: { id: `BPP ${judul(kanonik)}` },
    lifecycle: { version: '0.1.0', status: 'draft', created_at: '2026-08-23T00:00:00Z' },
    no_mapping_reason: 'SIMLUHTAN tidak memberi nomor identitas balai; yang ada hanya namanya dan kecamatan binaannya, jadi tidak ada pengenal luar yang bisa dipetakan.',
    region: {
      province: provinsi,
      regency: kabupaten,
      ...(kodeKab ? { regency_code: kodeKab, regency_code_scheme: 'BPS' } : {}),
      ...(indukWilayah ? { id: indukWilayah.id } : {}),
    },
    serves: [...new Set(rows.map((r) => r.kecamatan).filter((x) => x && x.length >= 2))]
      .sort()
      .map((n) => cocokkanKecamatan(n, indukWilayah)),
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
const totalKec = tally.exact + tally.approx + tally.none;
console.log(`  wilayah  : ${items.filter((x) => x.region.id).length}/${items.length} balai tertaut kabupaten/kota (${items.filter((x) => x.region.id).length - lewatNama} lewat kode BPS, ${lewatNama} lewat nama karena kodenya tidak dikenal)`);
if (kodeTakDikenal.size) console.log(`             ! ${kodeTakDikenal.size} kode kabupaten tidak dikenal kosakata wilayah: ${[...kodeTakDikenal].join('; ')}`);
console.log(`  kecamatan: ${totalKec} sebutan · ${tally.exact} persis · ${tally.approx} dicocokkan longgar · ${tally.none} TIDAK tertaut (${tally.pendek} namanya terlalu pendek untuk dicocokkan longgar, ${tally.ambigu} punya lebih dari satu calon)`);
if (contohGagal.length) console.log(`             contoh tak tertaut: ${contohGagal.slice(0, 6).join(' · ')}`);
console.log(`  nomor ${Math.min(...items.map((x) => Number(x.id.slice(-8))))}–${Math.max(...items.map((x) => Number(x.id.slice(-8))))} dalam blok ${BLOK.from}–${BLOK.to}`);

if (!tulis) { console.log('\n(hanya periksa; tambahkan --tulis untuk menulis)'); process.exit(0); }

const meta = {
  $schema: '../../schema/collection.schema.json',
  collection: {
    entity_type: 'bpp',
    label: { id: 'Balai Penyuluhan Pertanian beserta kecamatan binaannya' },
    scope: {
      id: `${items.length} balai penyuluhan di 34 provinsi dan 514 kabupaten/kota, membina ${jml((x) => x.counts.districts).toLocaleString('id-ID')} kecamatan, menurut laporan tamu SIMLUHTAN per 23 Agustus 2026. Entitasnya balai, bukan kecamatan: ${banyak} balai membina lebih dari satu kecamatan. ${tanpaBalai} kecamatan punya catatan penyuluh tetapi belum punya balai terdaftar dan karena itu tidak jadi entitas di sini. Nama, NIP, dan kontak penyuluh tidak ada di sumbernya dan tidak dicari; yang disimpan hanya kelembagaan dan cacahan orangnya. Update SIMLUHTAN sedang ditutup untuk pemeliharaan sampai 30 Agustus 2026 menurut pengumuman di halaman depannya — angka ini potret sebelum itu.

Sejak 24 Agustus 2026 wilayahnya tidak lagi hanya teks. ${items.filter((x) => x.region.id).length} dari ${items.length} balai tertaut ke kabupaten/kota di kosakata wilayah — ${items.filter((x) => x.region.id).length - lewatNama} lewat kode BPS, ${lewatNama} lewat nama karena SIMLUHTAN mengirim kode yang bukan kode BPS mana pun (9191 untuk Manokwari Selatan; yang benar 9111). Kode aslinya tetap disimpan apa adanya.

Kecamatan binaannya lebih lunak, dan kelunakannya tercatat per baris di medan \`match\`: dari ${tally.exact + tally.approx + tally.none} sebutan, ${tally.exact} cocok persis, ${tally.approx} dicocokkan longgar, dan ${tally.none} TIDAK tertaut — barisnya tetap ada dengan namanya, karena daftar binaan yang kehilangan barisnya terbaca sebagai kecamatan yang tidak dibina. Sebagian besar yang tak tertaut bukan kegagalan pencocokan melainkan kecamatan yang memang belum ada di potret wilayah BPS: SIMLUHTAN lebih baru.`,
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
