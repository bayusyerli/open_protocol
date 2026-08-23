// Alur kontribusi & tinjauan bernama — G1 pada docs/15-kapabilitas-lintas-pemangku.md.
//
//   node spec/tools/tinjau.mjs                     # keadaan tinjauan seluruh korpus
//   node spec/tools/tinjau.mjs <berkas...>         # keadaan berkas tertentu
//   node spec/tools/tinjau.mjs --tambah <berkas> --nama "..." --peran reviewer \
//        --benturan "none" [--afiliasi "..."] [--orcid 0000-0000-0000-0000] [--tanggal 2026-08-23]
//   node spec/tools/tinjau.mjs --tambah <koleksi> --rekaman <key> --nama "..." ...
//
// KENAPA ALAT INI ADA, PADAHAL MENYUNTING JSON DENGAN TANGAN JUGA BISA.
// Dua medan wajib bepergian bersama dan keduanya tinggal di tempat berbeda: nama peninjau
// di provenance.contributors, tanggalnya di lifecycle.reviewed_at. Aturan L35 menolak yang
// satu tanpa yang lain — dengan alasan yang bagus — tetapi penyunting tangan yang lupa
// baru mengetahuinya setelah pemeriksa berbunyi. Alat ini menulis keduanya sekaligus,
// jadi yang benar juga yang paling mudah.
//
// TINJAUAN TIDAK PERNAH MENAIKKAN TINGKAT BUKTI SENDIRI, dan itu sengaja. Menempelkan
// nama pada satu rekaman menyatakan "saya sudah memeriksanya", bukan "buktinya sekarang
// lebih kuat". Yang menaikkan D ke C atau B adalah isi tinjauannya, ditimbang orang, lalu
// ditulis di evidence_note beserta alasannya — bukan efek samping sebuah tombol.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hitungHash } from '../kanonik.mjs';

const AKAR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const VOCAB = 'spec/vocab';

const argv = process.argv.slice(2);
const bendera = (nama) => {
  const i = argv.indexOf(`--${nama}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
};
const tambah = argv.includes('--tambah');
let berkas = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && argv[i - 1] !== '--tambah'));

const PERAN = ['author', 'reviewer', 'editor', 'translator', 'data_steward'];

/* Berkas kosakata berbentuk dua macam: dokumen tunggal ber-id, dan koleksi berisi `items`.
 * Keduanya menaruh provenance di tempat yang berbeda, dan menyamakannya di sini sekali
 * lebih baik daripada tiap pemanggil mengingatnya. */
function rekaman(d) {
  if (Array.isArray(d?.items)) return d.items;
  return d && typeof d === 'object' && d.id ? [d] : [];
}

function keadaan(r) {
  const kontrib = r.provenance?.contributors ?? [];
  const peninjau = kontrib.filter((c) => c.role === 'reviewer');
  return {
    id: r.id ?? '(tanpa id)',
    nama: r.label?.id ?? r.key ?? '',
    status: r.lifecycle?.status ?? '(tanpa status)',
    tingkat: r.evidence_tier ?? null,
    kontrib: kontrib.length,
    peninjau: peninjau.map((c) => c.name),
    ditinjau: r.lifecycle?.reviewed_at ?? null,
  };
}

// ---------------------------------------------------------------- laporan
function laporan(daftar) {
  let total = 0, berkontrib = 0, berpeninjau = 0;
  const perStatus = new Map();
  const orang = new Map();
  const barisTertinjau = [];

  for (const f of daftar) {
    let d;
    try { d = JSON.parse(readFileSync(resolve(AKAR, f), 'utf8')); } catch { continue; }
    for (const r of rekaman(d)) {
      const k = keadaan(r);
      total++;
      perStatus.set(k.status, (perStatus.get(k.status) ?? 0) + 1);
      if (k.kontrib) berkontrib++;
      if (k.peninjau.length) {
        berpeninjau++;
        barisTertinjau.push([f.replace(`${VOCAB}/`, ''), k]);
        for (const n of k.peninjau) orang.set(n, (orang.get(n) ?? 0) + 1);
      }
    }
  }

  console.log(`\nRekaman kosakata      : ${total.toLocaleString('id-ID')}`);
  console.log(`Punya kontributor     : ${berkontrib.toLocaleString('id-ID')}`);
  console.log(`Punya peninjau bernama: ${berpeninjau.toLocaleString('id-ID')}`);
  console.log(`Status                : ${[...perStatus].sort().map(([s, n]) => `${s} ${n.toLocaleString('id-ID')}`).join(' · ')}`);

  if (!berpeninjau) {
    // Nol dinyatakan sebagai kalimat, bukan sebagai tabel kosong. Angka nol yang hanya
    // ditampilkan sebagai "0" terbaca sebagai kolom yang belum diisi; yang perlu dibaca
    // adalah bahwa belum seorang pun pernah menempelkan namanya.
    console.log('\nBelum seorang pun menempelkan namanya pada satu rekaman pun.');
    console.log('Itu keadaan yang jujur, bukan galat — dan itulah yang dibuka CONTRIBUTING.md.\n');
    return;
  }

  console.log('\nPeninjau:');
  for (const [n, j] of [...orang].sort((a, b) => b[1] - a[1])) console.log(`  ${n} — ${j} rekaman`);
  console.log('\nRekaman tertinjau:');
  for (const [f, k] of barisTertinjau) {
    console.log(`  ${k.id}  ${k.ditinjau}  ${k.peninjau.join(', ')}  (${f})`);
  }
  console.log();
}

// ---------------------------------------------------------------- --tambah
function tambahKontributor(f) {
  const p = resolve(AKAR, f);
  const d = JSON.parse(readFileSync(p, 'utf8'));
  const rec = rekaman(d);
  // Koleksi tetap menuntut penunjukan rekaman yang mana — itu maksud aslinya, dan tetap
  // dipegang. Yang berubah: menunjuknya tidak lagi berarti menyunting JSON dengan tangan,
  // karena pasangan L35 dan sematan hash-nya justru paling mudah keliru di situ.
  const kunciDiminta = bendera('rekaman');
  let r;
  if (rec.length === 1 && !kunciDiminta) {
    r = rec[0];
  } else if (!kunciDiminta) {
    console.error(`  ${f} memuat ${rec.length} rekaman. Sebutkan yang mana dengan --rekaman <key>.`);
    console.error(`  Tersedia: ${rec.slice(0, 8).map((x) => x.key ?? x.id).join(', ')}${rec.length > 8 ? `, dan ${rec.length - 8} lagi` : ''}`);
    process.exit(2);
  } else {
    r = rec.find((x) => x.key === kunciDiminta || x.id === kunciDiminta);
    if (!r) { console.error(`  Tidak ada rekaman berkunci "${kunciDiminta}" di ${f}.`); process.exit(2); }
  }

  const c = {
    name: bendera('nama'),
    affiliation: bendera('afiliasi') ?? undefined,
    role: bendera('peran'),
    orcid: bendera('orcid') ?? undefined,
    conflict_of_interest: bendera('benturan'),
  };
  const tanggal = bendera('tanggal') ?? new Date().toISOString().slice(0, 10);

  const salah = [];
  if (!c.name) salah.push('--nama wajib');
  if (!PERAN.includes(c.role)) salah.push(`--peran wajib, salah satu dari: ${PERAN.join(', ')}`);
  // Diminta di sini dan bukan diisikan "none" diam-diam. Bawaan yang mengisi sendiri
  // membuat pernyataan benturan kepentingan jadi formalitas yang tidak pernah dibaca
  // siapa pun — dan justru pembacanya yang menanggung akibatnya.
  if (!c.conflict_of_interest) salah.push('--benturan wajib. Tulis "none" bila memang tidak ada kepentingan komersial pada produk, principal, atau varietas yang disebut rekaman ini.');
  if (c.orcid && !/^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9X]$/.test(c.orcid)) salah.push('--orcid tidak berbentuk 0000-0000-0000-000X');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) salah.push('--tanggal harus YYYY-MM-DD');
  if (salah.length) { for (const s of salah) console.error(`  ${s}`); process.exit(2); }

  if (c.role === 'reviewer') c.date = tanggal;
  for (const k of Object.keys(c)) if (c[k] === undefined) delete c[k];

  r.provenance ??= {};
  r.provenance.contributors ??= [];
  const kembar = r.provenance.contributors.find((x) => x.name === c.name && x.role === c.role);
  if (kembar) { console.error(`  ${c.name} sudah tercatat sebagai ${c.role} di rekaman ini.`); process.exit(2); }
  r.provenance.contributors.push(c);

  // Pasangan yang dituntut L35 ditulis sekaligus. Menulis salah satunya saja adalah
  // kegagalan yang paling mudah dilakukan dengan tangan, dan paling tidak enak ditemukan
  // belakangan lewat pemeriksa.
  if (c.role === 'reviewer') {
    r.lifecycle ??= {};
    r.lifecycle.reviewed_at = tanggal;
  }

  // Sematan tinjauan ditulis di sini dan bukan diserahkan ke langkah berikutnya, karena
  // urutannya penting dan mudah keliru: hash dihitung SESUDAH kontributor masuk, lalu
  // disalin ke reviewed_hash. Keduanya dikecualikan dari kanonikalisasi, jadi menuliskannya
  // tidak menggeser hash yang baru saja dihitung.
  let sematan = null;
  if (c.role === 'reviewer' && r.lifecycle?.content_hash) {
    sematan = hitungHash(d.items ? r : d);
    r.lifecycle.content_hash = sematan;
    r.lifecycle.reviewed_hash = sematan;
  }

  writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
  console.log(`  tulis  ${f}`);
  console.log(`         ${c.role} ${c.name}${c.affiliation ? ` (${c.affiliation})` : ''} — benturan: ${c.conflict_of_interest}`);
  if (c.role === 'reviewer') console.log(`         lifecycle.reviewed_at = ${tanggal}`);
  if (sematan) console.log(`         lifecycle.reviewed_hash = ${sematan}`);
  else if (r.lifecycle?.content_hash) {
    console.log('\n  Rekaman ini punya content_hash, dan isinya baru saja berubah.');
    console.log('  Segarkan: node spec/tools/hitung-hash.mjs --tulis ' + f);
  }
  console.log('\n  Periksa sebelum mengirim PR:  cd spec && npm run check && npm test\n');
}

// ---------------------------------------------------------------- jalan
if (tambah) {
  if (berkas.length !== 1) { console.error('--tambah menerima tepat satu berkas.'); process.exit(2); }
  tambahKontributor(berkas[0]);
} else {
  if (!berkas.length) {
    berkas = readdirSync(resolve(AKAR, VOCAB), { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith('.json') && !e.name.endsWith('.meta.json'))
      .map((e) => join(VOCAB, e.name)).sort();
  }
  laporan(berkas);
}
