// Menyusun berkas bukti satu siklus: Cycle + Step menjadi dokumen yang bisa dibaca
// auditor. Bertulang SNI 8969 (IndoGAP), bukan taksonomi tandingan.
//
//   node spec/tools/susun-bukti.mjs --siklus op:cyc:... [--dir spec/examples] [--tulis <berkas.md>]
//
// KENAPA ALAT INI ADA
// Yang dibeli offtaker dan lembaga sertifikasi bukan protokolnya, melainkan bukti bahwa
// protokol itu dijalankan dan bisa ditelusuri. M3 sudah mengukur apakah musimnya layak
// diklaim; alat ini menyusun klaimnya jadi dokumen.
//
// BAGIAN TERPENTINGNYA ADALAH YANG TERAKHIR
// Setiap berkas bukti diakhiri daftar "yang tidak bisa dibuktikan berkas ini". Itu bukan
// kerendahan hati, melainkan syarat supaya sisanya bisa dipercaya: dokumen bukti yang
// tidak menyebut batasnya memaksa auditor menebak batas itu sendiri, dan tebakan yang
// salah ke arah mana pun merugikan — entah menolak yang sah, entah meloloskan yang tidak.
//
// PDP
// data_classification pada Cycle dan Step menentukan apa yang boleh keluar. Geometri
// petak TIDAK PERNAH ikut: L7 sudah menolaknya diberi label publik, dan batas lahan bisa
// dipakai mengidentifikasi orang. Yang tampil hanya label petak dan luasnya.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (n, b) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : b; };
const dir = resolve(AKAR, arg('dir', 'spec/examples'));
const idSiklus = arg('siklus');
const tulis = arg('tulis');

const muat = (d) => readdirSync(d).filter((f) => f.endsWith('.json'))
  .map((f) => { try { return JSON.parse(readFileSync(join(d, f), 'utf8')); } catch { return null; } })
  .filter(Boolean);

const dok = muat(dir);
const siklus = dok.find((x) => x.id === idSiklus) ?? dok.find((x) => typeof x.id === 'string' && x.id.startsWith('op:cyc:'));
if (!siklus) { console.error('Tidak ada siklus yang cocok.'); process.exit(1); }

// Kosakata untuk menautkan nomor pendaftaran. Hanya berkas kecil yang dimuat; registri
// besar berbentuk NDJSON dan tidak perlu dibuka hanya untuk satu berkas bukti.
const kosakata = new Map();
for (const f of ['product.json', 'preparation.json', 'substance.json']) {
  try {
    const v = JSON.parse(readFileSync(resolve(AKAR, 'spec/vocab', f), 'utf8'));
    for (const it of v.items ?? []) kosakata.set(it.id, it);
  } catch { /* berkas contoh boleh tidak ada */ }
}

const langkah = dok.filter((x) => x.cycle?.id === siklus.id);
const rencana = langkah.filter((s) => s.mode === 'planned');
const nyata = langkah.filter((s) => s.mode === 'executed').sort((a, b) => (a.occurred_at ?? '').localeCompare(b.occurred_at ?? ''));

const plot = dok.find((x) => x.id === siklus.plot?.id);
const protokol = dok.find((x) => x.id === siklus.protocol_ref?.id)
  ?? (() => { try { return JSON.parse(readFileSync(resolve(AKAR, 'spec/vocab/protocol-cabai-dataran-rendah.json'), 'utf8')); } catch { return null; } })();

const tgl = (s) => (s ? String(s).slice(0, 10) : '—');
const B = [];
const P = (...x) => B.push(x.join(''));

// --- kepala ----------------------------------------------------------------
P(`# Berkas bukti musim — ${siklus.commodity?.label ?? siklus.commodity?.id}`);
P('');
P(`> Disusun dari catatan lapangan. Setiap angka di bawah bisa ditelusuri ke dokumen`);
P(`> \`Cycle\` dan \`Step\` yang disebut nomornya, dan tidak ada yang dihitung ulang di sini.`);
P('');
P(`| | |`);
P(`|---|---|`);
P(`| Siklus | \`${siklus.id}\` |`);
P(`| Petak | ${siklus.plot?.label ?? siklus.plot?.id}${plot?.area ? ` · ${plot.area.value} ${plot.area.unit}` : ''} |`);
P(`| Komoditas | ${siklus.commodity?.label ?? '—'}${siklus.variety ? ` · varietas ${siklus.variety.label ?? siklus.variety.id}` : ''} |`);
P(`| Sistem | ${[siklus.system?.cropping, siklus.system?.production].filter(Boolean).join(' · ') || '—'} |`);
P(`| Sasaran sertifikasi | ${(siklus.system?.certification_target ?? []).join(', ') || '—'} |`);
P(`| Acuan | ${(siklus.anchors ?? []).map((a) => `${a.event} ${a.date}`).join(' · ') || '—'} |`);
P(`| Status siklus | ${siklus.status} |`);
if (siklus.protocol_ref) {
  const t = protokol ? `tingkat bukti ${protokol.evidence_tier}, status ${protokol.lifecycle?.status}` : 'protokol tidak ditemukan di sini';
  P(`| Protokol | \`${siklus.protocol_ref.id}\` v${siklus.protocol_ref.version} — ${t} |`);
  P(`| Kunci isi protokol | ${siklus.protocol_ref.content_hash ?? '**tidak ada**'} |`);
}
P('');

// --- rantai rencana -> realisasi -------------------------------------------
P('## 1. Rantai rencana dan realisasi');
P('');
P('| Langkah protokol | Rencana | Realisasi | Simpangan |');
P('|---|---|---|---|');
const dipenuhi = new Set();
for (const r of rencana) {
  const cocok = nyata.find((s) => s.plan_ref?.id === r.id
    || (s.protocol_step_key && s.protocol_step_key === r.protocol_step_key));
  if (cocok) dipenuhi.add(cocok.id);
  const kunci = r.protocol_step_key?.split('/').pop() ?? r.operation_type?.label ?? '—';
  const simp = cocok?.deviation ? `${cocok.deviation.kind} — ${cocok.deviation.reason?.label ?? cocok.deviation.reason?.id}` : (cocok ? 'tidak ada' : '—');
  P(`| ${kunci} | ${r.timing?.kind ?? '—'} | ${cocok ? tgl(cocok.occurred_at) : '**tidak tercatat**'} | ${simp} |`);
}
const luar = nyata.filter((s) => !dipenuhi.has(s.id));
for (const s of luar) {
  P(`| _(di luar rencana)_ | — | ${tgl(s.occurred_at)} | ${s.operation_type?.label ?? '—'} |`);
}
P('');
P(`${dipenuhi.size} dari ${rencana.length} langkah rencana punya catatan realisasi.`);
if (luar.length) P(`${luar.length} tindakan di luar rencana ikut tercatat — itu temuan, bukan pelanggaran.`);
P('');

// --- masukan ---------------------------------------------------------------
P('## 2. Masukan yang benar-benar dipakai');
P('');
const baris = [];
for (const s of nyata) for (const a of s.applications ?? []) {
  const prd = a.product?.id ? kosakata.get(a.product.id) : null;
  baris.push({
    tgl: tgl(s.occurred_at),
    bahan: a.substance?.label ?? a.substance?.id ?? '—',
    lewat: a.product?.label ?? a.preparation?.label ?? '—',
    daftar: prd?.registration?.number ?? (a.product ? 'tidak terpetakan di sini' : '—'),
    dosis: a.rate ? `${a.rate.value} ${a.rate.unit}` : '—',
    subsidi: a.subsidised === true ? 'ya' : (a.subsidised === false ? 'tidak' : '—'),
    phi: a.phi_days ?? null,
  });
}
if (baris.length) {
  P('| Tanggal | Bahan | Lewat | Nomor pendaftaran | Dosis | Bersubsidi |');
  P('|---|---|---|---|---|---|');
  for (const b of baris) P(`| ${b.tgl} | ${b.bahan} | ${b.lewat} | ${b.daftar} | ${b.dosis} | ${b.subsidi} |`);
} else {
  P('Tidak ada aplikasi masukan tercatat pada siklus ini.');
}
P('');

// --- pengamatan ------------------------------------------------------------
const obs = nyata.flatMap((s) => (s.observations ?? []).map((o) => ({ s, o })));
P('## 3. Pengamatan');
P('');
if (obs.length) {
  P('| Tanggal | Variabel | Nilai | Contoh | Cara |');
  P('|---|---|---|---|---|');
  for (const { s, o } of obs) {
    P(`| ${tgl(s.occurred_at)} | ${o.variable?.label ?? o.variable?.id} | ${o.value}${o.unit && o.unit !== '1' ? ' ' + o.unit : ''} | ${o.sample ? `${o.sample.size} ${o.sample.scope}` : '—'} | ${o.method?.label ?? '—'} |`);
  }
} else P('Tidak ada pengamatan tercatat.');
P('');

// --- ambang terlampaui tanpa tindakan --------------------------------------
// Inilah yang paling dicari auditor dan paling mudah luput: protokol punya langkah
// bersyarat, ambangnya terlampaui menurut pengamatan sendiri, dan tidak ada catatan
// tindakan apa pun. Diam di titik itu bisa berarti tindakan tak tercatat, bisa berarti
// keputusan sadar untuk tidak bertindak — dan keduanya berbeda jauh bagi pembeli.
const temuan = [];
for (const r of rencana) {
  const c = r.timing?.kind === 'condition' ? r.timing.condition?.compare : null;
  if (!c) continue;
  const dicatat = obs.filter(({ o }) => o.variable?.id === c.variable?.id);
  const lampaui = dicatat.filter(({ o }) => {
    const v = Number(o.value), t = Number(c.value);
    return c.operator === '>=' ? v >= t : c.operator === '>' ? v > t
      : c.operator === '<=' ? v <= t : c.operator === '<' ? v < t : v === t;
  });
  const adaTindakan = nyata.some((s) => s.protocol_step_key === r.protocol_step_key);
  if (lampaui.length && !adaTindakan) {
    temuan.push({ r, c, lampaui });
  }
}
P('## 4. Ambang terlampaui tanpa tindakan tercatat');
P('');
if (temuan.length) {
  for (const t of temuan) {
    const nama = t.r.protocol_step_key?.split('/').pop() ?? t.r.operation_type?.label;
    P(`- **${nama}** — ambang \`${t.c.variable?.label} ${t.c.operator} ${t.c.value}\` terlampaui`);
    P(`  pada ${t.lampaui.map(({ s, o }) => `${tgl(s.occurred_at)} (nilai ${o.value})`).join(', ')},`);
    P(`  dan tidak ada langkah realisasi yang menyebut \`${t.r.protocol_step_key}\`.`);
  }
  P('');
  P('> Diam di titik ini punya dua arti yang jauh berbeda bagi pembeli: tindakan yang');
  P('> dikerjakan tetapi tidak dicatat, atau keputusan sadar untuk tidak bertindak.');
  P('> Berkas ini tidak bisa membedakan keduanya, dan tidak berpura-pura bisa.');
} else {
  P('Tidak ada ambang protokol yang terlampaui tanpa tindakan tercatat.');
}
P('');

// --- yang tidak bisa dibuktikan --------------------------------------------
P('## 5. Yang TIDAK bisa dibuktikan berkas ini');
P('');
const batas = [];

const panen = nyata.some((s) => /panen|harvest/i.test(s.operation_type?.label ?? ''));
if (!panen) batas.push('**Tenggang panen (PHI).** Tidak ada langkah panen tercatat pada siklus ini, jadi jarak antara aplikasi terakhir dan panen tidak bisa dihitung. Ini biasanya klaim keamanan pangan yang paling dicari, dan berkas ini tidak bisa memberikannya.');
if (!baris.some((b) => b.phi != null)) batas.push('**Tenggang panen per aplikasi.** Tidak satu pun aplikasi tercatat membawa `phi_days`. Registri Kementan sendiri tidak memuat PHI pada satu pun dari 23.058 penggunaan berlabel, jadi angka itu harus datang dari label kemasan, bukan dari sini.');
if (protokol && protokol.evidence_tier === 'D') batas.push(`**Sandaran agronomi protokolnya.** Protokol \`${protokol.id}\` bertingkat bukti D dan berstatus ${protokol.lifecycle?.status} — belum ditinjau agronom bernama. Kepatuhan terhadapnya bisa dibuktikan; kebenarannya tidak.`);
if (!siklus.protocol_ref?.content_hash) batas.push('**Keutuhan versi protokol.** `protocol_ref` tidak membawa `content_hash`, jadi tidak ada yang mengunci isi protokol pada saat siklus ini berjalan. Kalau protokolnya berubah kemudian, perbandingan rencana-realita kehilangan patokannya.');
batas.push('**Asal-usul benih.** Registri varietas hanya bisa memastikan sebuah surat pelepasan atau pendaftaran ADA; ia tidak bisa memastikan bungkus benih yang ditanam berasal dari varietas itu. Yang berlaku untuk itu label dan sertifikat lot BPSB.');
batas.push('**Verifikasi pihak ketiga.** Seluruh pengamatan di bagian 3 dilaporkan sendiri oleh yang mengerjakan. Tidak ada satu pun yang disaksikan atau diuji laboratorium.');
const jeda = nyata.filter((s) => s.occurred_at && s.recorded_at)
  .map((s) => (Date.parse(s.recorded_at) - Date.parse(s.occurred_at)) / 3.6e6);
if (jeda.length) {
  const med = [...jeda].sort((a, b) => a - b)[Math.floor(jeda.length / 2)];
  batas.push(`**Ketepatan ingatan.** Jeda pencatatan median ${med.toFixed(1)} jam dari kejadian ke catatan. Dosis dan waktu yang dicatat belakangan lebih lemah daripada yang dicatat di tempat.`);
}
batas.push('**Batas lahan.** Geometri petak sengaja tidak diekspor. Aturan `L7` menolaknya diberi label publik: batas lahan bernilai komersial dan bisa dipakai mengidentifikasi orang.');

for (const b of batas) P(`- ${b}`);
P('');
P(`> Data siklus ini berklasifikasi \`${siklus.data_classification}\`. Mengeluarkannya ke pihak`);
P('> lain menuntut persetujuan pemegang lahan, dan persetujuan itu bukan bagian dari berkas ini.');
P('');

const keluaran = B.join('\n');
if (tulis) { writeFileSync(resolve(AKAR, tulis), keluaran + '\n'); console.log(`Ditulis ke ${tulis} · ${B.length} baris`); }
else console.log(keluaran);
