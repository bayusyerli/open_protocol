// Menyusun rencana musim dari protokol Lapis 2: Protocol + Plot + tanggal acuan
// menjadi Cycle beserta Step bermode "planned".
//
//   node spec/tools/susun-rencana.mjs --protokol cabai-dataran-rendah \
//        --plot spec/examples/rec-plot-cabai.json --tanam 2026-07-01 [--semai 2026-06-05] \
//        [--tulis <dir>]
//
// KENAPA ALAT INI ADA
// Lapis 2 menyimpan protokol, Lapis 3 menyimpan yang benar-benar terjadi. Yang
// menghubungkan keduanya adalah rencana musim, dan sampai sekarang tidak ada yang
// menyusunnya — Step contoh di spec/examples/ ditulis tangan satu per satu.
//
// YANG PALING PENTING DIPAHAMI SEBELUM MEMBACA KELUARANNYA
// Rencana ini BUKAN kalender penuh, dan tidak boleh disajikan sebagai kalender penuh.
// Timing punya lima bentuk dan hanya satu yang bisa jadi tanggal:
//
//   relative   -> BISA ditanggalkan. Tanggal acuan + offset.
//   stage      -> TIDAK BISA. Entitas Stage hanya memuat kode, label, dan urutan;
//                 tidak ada satu pun medan hari, durasi, atau akumulasi suhu. Menebak
//                 "BBCH 51 kira-kira hari ke-45" berarti mengarang fenologi, dan justru
//                 penjadwalan berbasis fase dipilih docs/00 KARENA hari setelah tanam
//                 sering salah. Menanggalkannya membatalkan alasan ia dipakai.
//   condition  -> TIDAK BISA, dan memang tidak seharusnya. Langkah berambang boleh tidak
//                 pernah berjalan sepanjang musim; itu hasil yang benar, bukan kepatuhan
//                 yang gagal.
//   absolute   -> ditolak L32 pada dokumen protokol, jadi tidak akan muncul di sini.
//
// Alat ini menghitung ketiganya dan menyebut jumlahnya, supaya yang membaca tahu berapa
// bagian rencananya benar-benar bertanggal. Cabang "tidak sanggup" ditampilkan tanpa
// angka, aturan yang sama dipakai kalkulator jalur 3.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const baca = (p) => JSON.parse(readFileSync(resolve(AKAR, p), 'utf8'));

// --- argumen ---------------------------------------------------------------
const arg = (n, wajib = false) => {
  const i = process.argv.indexOf(`--${n}`);
  const v = i > -1 ? process.argv[i + 1] : undefined;
  if (wajib && !v) { console.error(`--${n} wajib diisi.`); process.exit(2); }
  return v;
};
const kunciProtokol = arg('protokol', true);
const berkasPlot = arg('plot', true);
const tglTanam = arg('tanam', true);
const tglSemai = arg('semai');
const dirTulis = arg('tulis');

// --- ID yang bisa diulang --------------------------------------------------
// UUIDv7 membawa stempel waktu di 48 bit pertama. Di sini stempelnya diambil dari
// TANGGAL ACUAN, bukan jam saat perintah dijalankan, dan sisanya dari hash masukan —
// sehingga menjalankan ulang perintah yang sama menghasilkan ID yang sama persis.
// Kalau ID-nya berubah tiap jalan, dua keluaran tidak bisa dibandingkan sama sekali.
function idRekaman(prefiks, benih) {
  const ms = Date.parse(`${tglTanam}T00:00:00Z`);
  const waktu = ms.toString(16).padStart(12, '0').slice(-12);
  const h = createHash('sha256').update(benih).digest('hex');
  const b = (parseInt(h.slice(16, 17), 16) & 0x3 | 0x8).toString(16); // varian 89ab
  return `op:${prefiks}:${waktu.slice(0, 8)}-${waktu.slice(8, 12)}-7${h.slice(0, 3)}-${b}${h.slice(4, 7)}-${h.slice(8, 20)}`;
}

const tambahHari = (tgl, n) => {
  const d = new Date(`${tgl}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// Offset boleh berjam, berminggu, atau berbulan; hanya hari yang dipakai menanggalkan.
const keHari = (d) => {
  if (!d) return null;
  const { value, unit } = d;
  if (unit === 'd') return value;
  if (unit === 'wk') return value * 7;
  if (unit === 'mo') return value * 30;   // kasar, dan hanya dipakai untuk offset kasar
  return null;
};

// --- muat ------------------------------------------------------------------
const protokol = baca(`spec/vocab/protocol-${kunciProtokol}.json`);
const plot = baca(berkasPlot);

const acuan = { transplanting: tglTanam, ...(tglSemai ? { sowing: tglSemai } : {}) };

// --- susun langkah ---------------------------------------------------------
const langkah = [];
const jadwal = [];

for (const s of protokol.steps) {
  const id = idRekaman('stp', `${protokol.key}/${s.key}|${plot.id}|${tglTanam}`);
  const step = {
    $schema: '../schema/step.schema.json',
    id,
    cycle: { id: null },                       // diisi setelah Cycle punya ID
    mode: 'planned',
    operation_type: s.operation_type,
    timing: s.timing,
    protocol_step_key: `${protokol.key}/${s.key}`,
    ...(s.applications ? { applications: s.applications } : {}),
    ...(s.observations ? { observations: s.observations } : {}),
    data_classification: 'farm_private',
  };
  langkah.push(step);

  // Ini bagian yang menentukan kejujuran keluarannya.
  if (s.timing.kind === 'relative' && acuan[s.timing.anchor]) {
    const h = keHari(s.timing.offset);
    if (h === null) {
      jadwal.push({ s, jenis: 'tak-bertanggal', sebab: `satuan offset "${s.timing.offset?.unit}" tidak bisa dijadikan hari` });
    } else {
      const tgl = tambahHari(acuan[s.timing.anchor], h);
      const jendela = keHari(s.timing.window);
      jadwal.push({ s, jenis: 'bertanggal', tgl, jendela });
    }
  } else if (s.timing.kind === 'relative') {
    jadwal.push({ s, jenis: 'tak-bertanggal', sebab: `tanggal acuan "${s.timing.anchor}" tidak diberikan` });
  } else if (s.timing.kind === 'stage') {
    jadwal.push({ s, jenis: 'berfase', fase: s.timing.stage?.label ?? s.timing.stage?.id });
  } else if (s.timing.kind === 'condition' || s.timing.kind === 'threshold') {
    jadwal.push({ s, jenis: 'bersyarat' });
  } else {
    jadwal.push({ s, jenis: 'tak-bertanggal', sebab: `bentuk timing "${s.timing.kind}" belum ditangani` });
  }
}

// --- susun siklus ----------------------------------------------------------
const bertanggal = jadwal.filter((j) => j.jenis === 'bertanggal');
const tanggalAwal = bertanggal.length ? bertanggal.map((j) => j.tgl).sort()[0] : tglTanam;

const idSiklus = idRekaman('cyc', `${protokol.key}|${plot.id}|${tglTanam}`);
const siklus = {
  $schema: '../schema/cycle.schema.json',
  id: idSiklus,
  plot: { id: plot.id, label: plot.label?.id ?? plot.label },
  commodity: protokol.applicability.commodity,
  ...(protokol.stage_scale ? { stage_scale: protokol.stage_scale } : {}),
  ...(protokol.applicability.system ? { system: protokol.applicability.system } : {}),
  protocol_ref: { id: protokol.id, version: protokol.lifecycle.version },
  anchors: Object.entries(acuan).map(([event, date]) => ({ event, date })),
  planned_start: tanggalAwal < tglTanam ? tanggalAwal : (tglSemai ?? tglTanam),
  status: 'planned',
  data_classification: 'farm_private',
};
for (const s of langkah) s.cycle = { id: idSiklus };

// --- kebutuhan input -------------------------------------------------------
// Hanya dosis berbasis luas yang bisa dikalikan luas petak. Dosis konsentrasi
// (per_volume_water) butuh tahu berapa kali disemprot semusim, dan itu tidak ada di
// protokol — jadi ia TIDAK dijumlahkan, dan alasannya disebut.
const luas = plot.area?.value;
const kebutuhan = new Map();
const takTerjumlah = [];
for (const s of protokol.steps) {
  for (const a of s.applications ?? []) {
    const nama = a.substance?.label ?? a.substance?.id;
    if (a.rate?.basis === 'per_area' && luas) {
      const k = `${nama}|${a.rate.unit}`;
      kebutuhan.set(k, (kebutuhan.get(k) ?? 0) + a.rate.value * luas);
    } else {
      takTerjumlah.push({ nama, basis: a.rate?.basis, langkah: s.key });
    }
  }
}

// --- laporan ---------------------------------------------------------------
const P = (...x) => console.log(...x);
P(`\nProtokol : ${protokol.label.id}`);
P(`           ${protokol.id} v${protokol.lifecycle.version} · tingkat bukti ${protokol.evidence_tier} · status ${protokol.lifecycle.status}`);
P(`Petak    : ${plot.label?.id ?? plot.label} · ${luas ?? '—'} ${plot.area?.unit ?? ''}`);
P(`Acuan    : ${Object.entries(acuan).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
P(`Siklus   : ${idSiklus}\n`);

if (protokol.lifecycle.status !== 'published') {
  P(`  ! Protokol ini berstatus "${protokol.lifecycle.status}" dengan tingkat bukti ${protokol.evidence_tier}.`);
  P(`    Rencana yang disusun darinya boleh diperiksa, belum boleh dijalankan sebagai anjuran.\n`);
}

P('JADWAL');
for (const j of jadwal) {
  const nama = j.s.label?.id ?? j.s.key;
  if (j.jenis === 'bertanggal') {
    P(`  ${j.tgl}   ${nama}${j.jendela ? `  (tenggang ${j.jendela} hari)` : ''}`);
  } else if (j.jenis === 'berfase') {
    P(`  menunggu fase   ${nama}  ->  ${j.fase}`);
  } else if (j.jenis === 'bersyarat') {
    P(`  bila ambang     ${nama}  ->  boleh tidak pernah berjalan`);
  } else {
    P(`  tak bertanggal  ${nama}  ->  ${j.sebab}`);
  }
}

const n = (t) => jadwal.filter((j) => j.jenis === t).length;
P(`\n  ${n('bertanggal')} dari ${jadwal.length} langkah bisa ditanggalkan.`);
if (n('berfase')) {
  P(`  ${n('berfase')} menunggu fase pertumbuhan. Entitas Stage tidak memuat hari, durasi,`);
  P(`  maupun akumulasi suhu, jadi tanggalnya TIDAK ditebak — pengamatan lapangan yang`);
  P(`  menentukannya, dan itu memang alasan penjadwalan berbasis fase dipilih.`);
}
if (n('bersyarat')) {
  P(`  ${n('bersyarat')} dipicu ambang pengamatan dan boleh tidak pernah berjalan.`);
}

P('\nKEBUTUHAN INPUT');
if (!luas) {
  P('  Luas petak tidak diketahui, jadi tidak ada yang bisa dikalikan.');
} else if (kebutuhan.size) {
  for (const [k, v] of kebutuhan) {
    const [nama, satuan] = k.split('|');
    P(`  ${nama.padEnd(28)} ${(+v.toFixed(2)).toString().padStart(10)} ${satuan.replace('/har', '')} untuk ${luas} ${plot.area.unit}`);
  }
} else {
  P('  Tidak ada dosis berbasis luas pada protokol ini.');
}
for (const t of takTerjumlah) {
  P(`  ${String(t.nama).padEnd(28)}        — tidak dijumlahkan: basis "${t.basis}" butuh tahu berapa kali`);
  P(`  ${''.padEnd(28)}          diaplikasikan semusim, dan protokol tidak menyebutnya (${t.langkah})`);
}
P('\n  Harga tidak ada di registri sama sekali, jadi RAB tidak dihitung di sini.');
P('  Jalur 3 sudah menghitung rupiah per kg hara dari harga yang dimasukkan sendiri.\n');

// --- tulis -----------------------------------------------------------------
if (dirTulis) {
  const d = resolve(AKAR, dirTulis);
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, 'rencana-cycle.json'), JSON.stringify(siklus, null, 2) + '\n');
  langkah.forEach((s, i) => {
    const nama = `rencana-step-${String(i + 1).padStart(2, '0')}-${protokol.steps[i].key}.json`;
    writeFileSync(join(d, nama), JSON.stringify(s, null, 2) + '\n');
  });
  P(`Ditulis ke ${dirTulis}: 1 siklus + ${langkah.length} langkah.\n`);
}
