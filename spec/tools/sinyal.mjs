// Sinyal umpan balik lapangan — G2 pada docs/15-kapabilitas-lintas-pemangku.md.
//
//   node spec/tools/sinyal.mjs [--dir spec/examples]
//
// G2 tertulis "umpan balik lapangan menaikkan tingkat bukti D→A", dan separuh judul itu
// TIDAK BISA DIPENUHI mekanisme yang disebutnya sendiri. Tangga tingkat bukti bukan tangga
// volume melainkan tangga METODE:
//
//   A  uji multi-lokasi/multi-musim
//   B  standar institusi resmi
//   C  konsensus praktisi & penyuluh
//   D  pengalaman tunggal belum terverifikasi
//
// Umpan balik lapangan yang menumpuk ADALAH tingkat C menurut definisinya — itu persis
// bunyi barisnya. Jadi ia bisa memindahkan D ke C, dan berhenti di situ: mencapai B
// menuntut institusi mengadopsinya, dan mencapai A menuntut uji multi-lokasi. Seribu
// petani yang melaporkan hal yang sama tetap konsensus praktisi, bukan uji lapangan.
//
// YANG DILAKUKAN ALAT INI KARENA ITU BUKAN MENAIKKAN, MELAINKAN MENUNJUK. Ia membaca
// alasan simpangan yang tercatat, mengelompokkannya menurut `DeviationReason.signals` —
// medan yang deskripsinya sendiri berbunyi "apa yang seharusnya ditindaklanjuti tim ketika
// alasan ini sering muncul" — lalu menyebutkan rekaman mana yang klaim tingkat buktinya
// sedang tertekan. Yang menaikkannya tetap orang bernama lewat alur G1, dan itu bukan
// keterbatasan: kenaikan tingkat adalah kesimpulan, dan kesimpulan tidak boleh jadi efek
// samping penjumlahan.
//
// PENYEBUT MINIMUM, DAN KENAPA ANGKANYA DINYATAKAN DI SINI SAJA.
// docs/17 bagian 7.3 menetapkan aturannya — "di bawah ambang minimum panelnya menolak
// menampilkan angka sama sekali" — tetapi TIDAK PERNAH menyebut angkanya, dan aturan tanpa
// angka tidak bisa ditegakkan mesin. Angka di bawah ini karena itu KEPUTUSAN YANG BELUM
// DIRATIFIKASI, ditulis di satu tempat supaya bisa dibantah di satu tempat.
//
// Dipilih 5 petak berbeda, dengan dua alasan yang keduanya bukan statistik:
//   · Penyebut kecil tempat termurah untuk dibajak — satu orang yang melapor lima kali
//     dari satu petak bukan lima petak, jadi yang dihitung PETAK BERBEDA, bukan laporan.
//   · Di bawah lima, "sering muncul" tidak bisa dibedakan dari "kebetulan dua kali".
const PENYEBUT_MINIMUM = 5;

import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const iDir = argv.indexOf('--dir');
const DIR = iDir >= 0 && argv[iDir + 1] ? argv[iDir + 1] : 'spec/examples';

const ARTI_SINYAL = {
  protocol_problem: 'protokolnya yang perlu ditinjau',
  access_problem: 'inputnya tidak terjangkau — bukan protokolnya yang salah',
  external_shock: 'guncangan dari luar; tidak menuntut perubahan protokol',
  recording_problem: 'pencatatannya yang bermasalah, bukan lapangannya',
};

function bacaSemua(dir) {
  const p = resolve(AKAR, dir);
  let nama = [];
  try { nama = readdirSync(p).filter((f) => f.endsWith('.json')); } catch { return []; }
  return nama.map((f) => {
    try { return JSON.parse(readFileSync(join(p, f), 'utf8')); } catch { return null; }
  }).filter(Boolean);
}

const dok = bacaSemua(DIR);
const alasan = new Map();
try {
  const d = JSON.parse(readFileSync(resolve(AKAR, 'spec/vocab/deviation-reason.json'), 'utf8'));
  for (const x of (d.items ?? d)) alasan.set(x.id, x);
} catch { /* tanpa kosakata, sinyalnya tidak bisa diartikan — dinyatakan di bawah */ }

// Simpangan dikumpulkan beserta PETAKNYA, bukan cuma dihitung. Penyebut yang benar untuk
// "sering muncul" adalah berapa petak berbeda yang mengalaminya — bukan berapa baris,
// karena satu petak yang melapor lima kali bukan lima petak.
const siklusPetak = new Map();
for (const d of dok) if (String(d.id).startsWith('op:cyc:')) siklusPetak.set(d.id, d.plot?.id ?? null);

const perSinyal = new Map();
let cacahSimpangan = 0;
for (const d of dok) {
  if (!d.deviation?.reason?.id) continue;
  cacahSimpangan++;
  const a = alasan.get(d.deviation.reason.id);
  const s = a?.signals ?? '(tidak diketahui)';
  if (!perSinyal.has(s)) perSinyal.set(s, { baris: 0, petak: new Set(), alasan: new Map() });
  const e = perSinyal.get(s);
  e.baris++;
  const petak = siklusPetak.get(d.cycle?.id) ?? d.cycle?.id ?? null;
  if (petak) e.petak.add(petak);
  const nm = d.deviation.reason.label ?? d.deviation.reason.id;
  e.alasan.set(nm, (e.alasan.get(nm) ?? 0) + 1);
}

console.log(`\nDokumen dibaca      : ${dok.length} (${DIR})`);
console.log(`Simpangan tercatat  : ${cacahSimpangan}`);
console.log(`Penyebut minimum    : ${PENYEBUT_MINIMUM} petak berbeda — keputusan yang belum diratifikasi, lihat kepala berkas ini`);

if (!cacahSimpangan) {
  console.log('\nBelum ada satu simpangan pun yang tercatat, jadi tidak ada sinyal untuk dibaca.');
  console.log('Itu keadaan yang jujur, bukan galat: mekanismenya siap, catatan lapangannya belum ada.\n');
  process.exit(0);
}

console.log('');
for (const [s, e] of [...perSinyal].sort((a, b) => b[1].petak.size - a[1].petak.size)) {
  const n = e.petak.size;
  const cukup = n >= PENYEBUT_MINIMUM;
  console.log(`${s}`);
  console.log(`  ${ARTI_SINYAL[s] ?? 'arti sinyal tidak dikenal'}`);
  console.log(`  ${e.baris} baris dari ${n} petak berbeda`);
  for (const [nm, c] of [...e.alasan].sort((a, b) => b[1] - a[1])) console.log(`    · ${nm} — ${c}`);
  // Di bawah penyebut minimum, TIDAK ADA kesimpulan yang ditawarkan — bukan kesimpulan
  // yang dilemahkan kata-kata. Angka yang ditampilkan dengan peringatan tetap dibaca
  // sebagai angka.
  console.log(cukup
    ? `  → Penyebutnya cukup. Rekaman yang dirujuk layak masuk antrean tinjauan G1; yang menaikkan tingkat buktinya tetap peninjau bernama, bukan alat ini.`
    : `  → PENYEBUT BELUM CUKUP (${n} dari ${PENYEBUT_MINIMUM}). Tidak ada kesimpulan yang ditarik, dan itu bukan kehati-hatian berlebihan: penyebut kecil tempat termurah untuk dibajak.`);
  console.log('');
}

console.log('Alat ini tidak pernah menaikkan tingkat bukti, dan tidak bisa.');
console.log('Umpan balik lapangan yang menumpuk ADALAH tingkat C menurut definisinya');
console.log('("konsensus praktisi & penyuluh"), jadi ia memindahkan D ke C dan berhenti.');
console.log('Mencapai B menuntut institusi mengadopsinya; mencapai A menuntut uji');
console.log('multi-lokasi. Seribu petani yang melaporkan hal yang sama tetap konsensus');
console.log('praktisi, bukan uji lapangan.\n');
