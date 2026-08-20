// Memeriksa satu musim: rencana lawan realisasi, lalu mengadu hasilnya dengan dua
// sinyal batal yang ditetapkan docs/02 bagian 7.
//
//   node spec/tools/periksa-musim.mjs [--dir spec/examples] [--siklus op:cyc:...]
//
// KENAPA ALAT INI ADA
// Yang dijual ke pembayar bukan protokolnya, melainkan bukti bahwa protokol itu
// dijalankan dan simpangannya jujur. Dua ambang di docs/02 menyatakan kapan klaim itu
// kehilangan dasar:
//
//   < 70% tugas terjadwal tercatat  -> yang salah produknya, bukan segmennya
//   < 30% simpangan punya alasan    -> datanya tidak jujur, hentikan penjualan
//
// TEMUAN YANG MENGUBAH ARTI AMBANG KEDUA
// step.schema.json menetapkan deviation.reason sebagai medan WAJIB. Artinya setiap
// simpangan yang tercatat pasti punya alasan, dan "persentase simpangan yang punya
// alasan" selalu 100% menurut bentuknya sendiri — ambang 30% tidak akan pernah menyala,
// bukan karena datanya jujur melainkan karena pertanyaannya tidak bisa dijawab tidak.
//
// Risiko sesungguhnya pindah ke tempat lain: alasan tampung-segalanya. Dua dari sebelas
// alasan terkurasi bersinyal "recording_problem" — "lain-lain" dan "keliru" — dan
// keduanya bisa dipakai menutup apa pun tanpa berbohong. Jadi yang diukur di sini
// adalah proporsi simpangan yang alasannya SUBSTANTIF, dan ambang 30% diadu dengan itu.
// Ini pembacaan ulang, bukan pelonggaran: yang dituju docs/02 adalah kejujuran data,
// dan pengukuran yang tidak bisa gagal tidak mengukur kejujuran apa pun.

import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (n, bawaan) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : bawaan;
};
const dir = resolve(AKAR, arg('dir', 'spec/examples'));
const saringSiklus = arg('siklus');

// Alasan yang tidak menerangkan apa pun. Bukan terlarang — kadang memang itu jawabannya —
// tetapi tidak boleh dihitung sebagai simpangan yang beralasan.
const TAMPUNG = new Set(['op:dev:00000010', 'op:dev:00000011']); // keliru, lain-lain

const dokumen = readdirSync(dir).filter((f) => f.endsWith('.json'))
  .map((f) => { try { return { f, d: JSON.parse(readFileSync(join(dir, f), 'utf8')) }; } catch { return null; } })
  .filter(Boolean);

const siklus = dokumen.filter(({ d }) => typeof d.id === 'string' && d.id.startsWith('op:cyc:'));
const langkah = dokumen.filter(({ d }) => typeof d.id === 'string' && d.id.startsWith('op:stp:'));

if (!siklus.length) { console.error(`Tidak ada dokumen siklus di ${dir}`); process.exit(1); }

const jam = (a, b) => (Date.parse(b) - Date.parse(a)) / 3.6e6;
const median = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : null);
const pct = (n, d) => (d ? (100 * n / d) : null);
const tulisPct = (v) => (v == null ? '—' : `${v.toFixed(1)}%`);

for (const { d: c } of siklus) {
  if (saringSiklus && c.id !== saringSiklus) continue;

  const milik = langkah.filter(({ d }) => d.cycle?.id === c.id).map(({ d }) => d);
  const rencana = milik.filter((s) => s.mode === 'planned');
  const nyata = milik.filter((s) => s.mode === 'executed');

  // Realisasi dipautkan lewat plan_ref lebih dulu; protocol_step_key jadi cadangan,
  // karena rencana yang disusun ulang bisa punya ID berbeda untuk langkah yang sama.
  const idRencana = new Set(rencana.map((s) => s.id));
  const kunciRencana = new Map(rencana.filter((s) => s.protocol_step_key).map((s) => [s.protocol_step_key, s]));
  const terpenuhi = new Set();
  const gantung = [];
  const luarRencana = [];

  for (const s of nyata) {
    const viaId = s.plan_ref?.id && idRencana.has(s.plan_ref.id) ? s.plan_ref.id : null;
    const viaKunci = !viaId && s.protocol_step_key && kunciRencana.has(s.protocol_step_key)
      ? kunciRencana.get(s.protocol_step_key).id : null;
    if (viaId || viaKunci) terpenuhi.add(viaId ?? viaKunci);
    else if (s.plan_ref?.id) gantung.push(s);
    else luarRencana.push(s);
  }

  const simpangan = nyata.filter((s) => s.deviation);
  const substantif = simpangan.filter((s) => !TAMPUNG.has(s.deviation.reason?.id));
  const jeda = nyata.filter((s) => s.occurred_at && s.recorded_at).map((s) => jam(s.occurred_at, s.recorded_at));

  const kepatuhan = pct(terpenuhi.size, rencana.length);
  const kejujuran = pct(substantif.length, simpangan.length);

  console.log(`\n${'='.repeat(72)}`);
  console.log(`Siklus ${c.id}`);
  console.log(`  ${c.commodity?.label ?? c.commodity?.id ?? '—'} di ${c.plot?.label ?? c.plot?.id ?? '—'} · status ${c.status}`);
  if (c.protocol_ref) console.log(`  Protokol ${c.protocol_ref.id} v${c.protocol_ref.version}`);

  console.log(`\n  Langkah rencana   : ${rencana.length}`);
  console.log(`  Langkah realisasi : ${nyata.length}`);
  console.log(`  Rencana terpenuhi : ${terpenuhi.size}`);
  if (gantung.length) console.log(`  plan_ref menggantung: ${gantung.length} (menunjuk rencana yang tidak ada di sini)`);
  if (luarRencana.length) console.log(`  Di luar rencana   : ${luarRencana.length} — bukan pelanggaran; docs menyebutnya temuan yang berharga`);

  console.log('\n  SINYAL BATAL');
  const nilai = (v, ambang, label, sebab) => {
    if (v == null) { console.log(`    —      ${label}: tidak bisa dihitung — ${sebab}`); return; }
    const lulus = v >= ambang;
    console.log(`    ${lulus ? 'LULUS ' : 'BATAL '} ${label}: ${tulisPct(v)} (ambang ${ambang}%)`);
  };
  nilai(kepatuhan, 70, 'Tugas terjadwal tercatat', 'tidak ada langkah rencana pada siklus ini');
  nilai(kejujuran, 30, 'Simpangan beralasan substantif', 'tidak ada simpangan tercatat, jadi tidak ada yang bisa diadu');

  if (simpangan.length) {
    console.log(`\n  Simpangan (${simpangan.length}):`);
    for (const s of simpangan) {
      const r = s.deviation.reason;
      const tanda = TAMPUNG.has(r?.id) ? ' [tampung-segalanya]' : '';
      console.log(`    ${s.deviation.kind.padEnd(16)} ${r?.label ?? r?.id}${tanda}`);
      if (s.deviation.note) console.log(`      ${s.deviation.note.slice(0, 96)}`);
    }
  }

  if (jeda.length) {
    console.log(`\n  Jeda pencatatan   : median ${median(jeda).toFixed(1)} jam dari kejadian ke catatan (${jeda.length} langkah)`);
    console.log('    Jeda panjang bukan sekadar rapi-tidaknya: ingatan dosis dan waktu memudar,');
    console.log('    dan itu memburukkan mutu data yang justru dijual ke pembayar.');
  }
}

console.log(`\n${'='.repeat(72)}`);
console.log('Ambang berasal dari docs/02-tiga-pasar.md bagian 7. Ambang kedua dibaca ulang:');
console.log('deviation.reason wajib di skema, jadi "punya alasan" selalu 100% menurut');
console.log('bentuknya sendiri — yang diukur di sini alasan yang SUBSTANTIF, di luar');
console.log('"lain-lain" dan "keliru". Pengukuran yang tidak bisa gagal tidak mengukur apa pun.\n');
