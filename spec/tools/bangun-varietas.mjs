// Membangun kosakata varietas dari registri perizinan varietas Kementan, plus
// komoditas baru yang dibutuhkannya. Dua keluaran:
//
//   vocab/variety/varietas.ndjson + .meta.json   entitas Variety (op:vty)
//   vocab/commodity-varietas.json                komoditas jenis tanaman yang
//                                                belum ada di kosakata (op:cmd)
//
// Sumber: proseed_data/raw/nama-varietas.json (tarikan 19 Agustus 2026) dan
// proseed_data/pemohon_alias.csv untuk nama pemohon yang sudah diseragamkan.
// Jalankan dari akar repositori:  node spec/tools/bangun-varietas.mjs
//
// Idempoten: kedua berkas dibangun ulang dari nol tiap kali dijalankan, dan
// nomor ID-nya deterministik — komoditas menurut abjad, varietas menurut urutan
// registri. Menjalankan ulang tanpa perubahan sumber menghasilkan berkas sama.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RAW = join(root, 'proseed_data', 'raw', 'nama-varietas.json');
const ALIAS = join(root, 'proseed_data', 'pemohon_alias.csv');
const VOCAB = join(root, 'spec', 'vocab');
const OUT_CMD = join(VOCAB, 'commodity-varietas.json');
const OUT_DIR = join(VOCAB, 'variety');
const STAMP = '2026-08-19T00:00:00Z';

const BLOK_CMD = { from: 2000, to: 2999 };   // komoditas dari registri varietas
const BLOK_VTY = { from: 1000, to: 19999 };  // varietas dari registri; 1-999 disisakan untuk kurasi tangan

// ---------------------------------------------------------------------------
// Alat
// ---------------------------------------------------------------------------
const norm = (s) =>
  (s ?? '').toLowerCase().trim().replace(/[^a-z0-9 /()-]/g, '').replace(/\s+/g, ' ');

// "Jagung Hibrida" dan "Padi Inbrida" menyebut jenis benihnya, bukan komoditas
// yang berbeda. Kualifikasinya dilepas untuk pencarian; teks aslinya tetap
// disimpan sebagai sinonim.
const lepasKualifikasi = (s) =>
  s.replace(/\b(hibrida|hybrid|inbrida|f1)\b/g, '').replace(/\s+/g, ' ').trim();

const slug = (s, maks = 80) => {
  let t = (s ?? '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (t.length > maks) t = t.slice(0, maks).replace(/-+[^-]*$/, '').replace(/-+$/, '');
  return t;
};

const judul = (s) => s.replace(/\b[a-z]/g, (c) => c.toUpperCase());

function bacaCsv(path) {
  const [kepala, ...baris] = readFileSync(path, 'utf8').replace(/^﻿/, '').trim().split('\n');
  const kolom = kepala.split(',');
  return baris.map((b) => {
    const nilai = b.match(/("([^"]|"")*"|[^,]*)(,|$)/g).slice(0, kolom.length)
      .map((x) => x.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
    return Object.fromEntries(kolom.map((k, i) => [k, nilai[i] ?? '']));
  });
}

// ---------------------------------------------------------------------------
// Sumber
// ---------------------------------------------------------------------------
const rows = JSON.parse(readFileSync(RAW, 'utf8')).data;
const kanonik = new Map(bacaCsv(ALIAS).map((r) => [r.pemohon_asli, r.nama_kanonik]));

// Kosakata komoditas yang sudah ada — dicari lewat label dan sinonim.
const indeksCmd = new Map();
const keyCmdTerpakai = new Set();
for (const f of ['commodity.json', 'commodity-registri.json']) {
  const d = JSON.parse(readFileSync(join(VOCAB, f), 'utf8'));
  for (const it of d.items) {
    keyCmdTerpakai.add(it.key);
    for (const nm of [it.label.id, ...(it.synonyms ?? [])]) {
      const n = norm(nm);
      if (n && !indeksCmd.has(n)) indeksCmd.set(n, it);
    }
  }
}

// ---------------------------------------------------------------------------
// 1. Petakan setiap "jenis tanaman" ke komoditas — pakai yang ada, atau buat baru
// ---------------------------------------------------------------------------
function kandidat(jenis) {
  const n = norm(jenis);
  const bagian = n.split(/\s*\/\s*/).filter(Boolean);
  const out = [n, lepasKualifikasi(n)];
  for (const b of bagian) out.push(b, lepasKualifikasi(b));
  return [...new Set(out.filter(Boolean))];
}

const jenisHitung = new Map();
for (const r of rows) {
  const j = (r.jenis ?? '').trim();
  if (j) jenisHitung.set(j, (jenisHitung.get(j) ?? 0) + 1);
}

const petaJenis = new Map();          // teks jenis apa adanya -> {ref}
const cmdBaru = new Map();            // nama kanonik -> {varian:Set, jumlah}
for (const [j, n] of jenisHitung) {
  const kand = kandidat(j);
  const hit = kand.map((k) => indeksCmd.get(k)).find(Boolean);
  if (hit) {
    petaJenis.set(j, { id: hit.id, label: hit.label.id });
  } else {
    const kanon = kand[kand.length - 1] || norm(j);
    const e = cmdBaru.get(kanon) ?? { varian: new Set(), jumlah: 0 };
    e.varian.add(j);
    e.jumlah += n;
    cmdBaru.set(kanon, e);
  }
}

const namaBaru = [...cmdBaru.keys()].sort();
if (namaBaru.length > BLOK_CMD.to - BLOK_CMD.from + 1) {
  throw new Error(`Butuh ${namaBaru.length} komoditas baru, blok hanya menyediakan ${BLOK_CMD.to - BLOK_CMD.from + 1}.`);
}

const itemsCmd = namaBaru.map((kanon, i) => {
  const e = cmdBaru.get(kanon);
  const id = `op:cmd:${String(BLOK_CMD.from + i).padStart(8, '0')}`;
  let key = slug(kanon);
  if (keyCmdTerpakai.has(key)) key = `${key}-varietas`;
  keyCmdTerpakai.add(key);
  const varian = [...e.varian].sort();
  const label = judul(kanon);
  for (const v of varian) petaJenis.set(v, { id, label });
  return {
    id,
    key,
    label: { id: label },
    kind: 'crop',
    synonyms: varian.filter((v) => v !== label),
    mappings: [{
      scheme: 'KEMENTAN',
      id: varian[0],
      relation: 'exact',
      note: `Nama jenis tanaman pada registri perizinan varietas; dipakai ${e.jumlah} varietas terdaftar.`,
    }],
    lifecycle: { version: '0.1.0', status: 'draft', created_at: STAMP },
  };
});

writeFileSync(OUT_CMD, JSON.stringify({
  $schema: '../schema/collection.schema.json',
  collection: {
    entity_type: 'commodity',
    label: { id: 'Komoditas dari registri perizinan varietas' },
    scope: {
      id: `${itemsCmd.length} jenis tanaman yang disebut registri perizinan varietas Kementan tetapi belum ada di kosakata komoditas. Kualifikasi jenis benih pada nama sumber — "Hibrida", "Inbrida", "F1" — dilepas supaya "Aglaonema Hibrida" tidak jadi komoditas terpisah dari Aglaonema; teks aslinya disimpan sebagai sinonim. Kegranularan registri dipertahankan apa adanya: Cabai Keriting dan Cabai Besar tetap terpisah dari Cabai, karena agronominya memang berbeda dan menggabungkannya berarti membuang keterangan yang ada di sumber.`,
    },
    lifecycle: { version: '0.1.0', status: 'draft', created_at: STAMP, review_due: '2026-11-19' },
    provenance: {
      license: 'CC-BY-SA-4.0',
      sources: [{
        title: 'Registri perizinan varietas tanaman (SIPERINTIS)',
        publisher: 'Kementerian Pertanian RI',
        url: 'https://perizinan.pertanian.go.id/',
        year: 2026,
        locator: 'GET /permohonan/v1/informasi/nama-varietas; ditarik 19 Agustus 2026.',
      }],
    },
    id_blocks: [BLOK_CMD],
  },
  items: itemsCmd,
}, null, 2) + '\n');

// ---------------------------------------------------------------------------
// 2. Entitas varietas
// ---------------------------------------------------------------------------
const JENIS_IZIN = [
  [/^Pelepasan/i, 'release'],
  [/^Pendaftaran/i, 'registration'],
  [/^Perlindungan/i, 'protection'],
  [/^Persetujuan Penamaan/i, 'naming_approval'],
];
const kindIzin = (teks) => (JENIS_IZIN.find(([re]) => re.test(teks)) ?? [, 'other'])[1];

function tipeVarietas(r) {
  const jenis = r.jenis ?? '';
  const nama = r.nama_varietas ?? '';
  const asal = r.asal ?? '';
  const izin = (r.permohonan ?? []).map((p) => p.perizinan ?? '').join(' ');
  if (/hibrida|hybrid/i.test(jenis) || /\bf1\b/i.test(nama)) return 'hybrid';
  if (/\bklon\b|clone/i.test(`${jenis} ${nama}`)) return 'clone';
  if (/inbrida/i.test(jenis)) return 'line';
  if (/varietas lokal/i.test(izin) || /^lokal$/i.test(asal.trim())) return 'landrace';
  return undefined;
}

const dilewati = [];
const entitas = [];
const keyTerpakai = new Set();
const statTipe = new Map();
const statIzin = new Map();

for (const r of rows) {
  const jenis = (r.jenis ?? '').trim();
  const nama = (r.nama_varietas ?? '').trim();
  const cmd = jenis ? petaJenis.get(jenis) : null;
  if (!cmd) { dilewati.push({ nama, pemohon: r.pemohon ?? '', tahun: r.tahun ?? '' }); continue; }

  let key = slug(`${nama}-${jenis}`, 74) || slug(nama, 74) || 'varietas';
  if (keyTerpakai.has(key)) {
    let n = 2;
    while (keyTerpakai.has(`${key}-${n}`)) n++;
    key = `${key}-${n}`;
  }
  keyTerpakai.add(key);

  const izin = (r.permohonan ?? []).map((p) => ({
    kind: kindIzin(p.perizinan ?? ''),
    kind_label: (p.perizinan ?? '').trim(),
    decree_number: (p.no_sk ?? '').trim() || undefined,
    decree_date: /^\d{4}-\d{2}-\d{2}$/.test((p.tgl_sk ?? '').slice(0, 10)) ? (p.tgl_sk ?? '').slice(0, 10) : undefined,
  })).filter((p) => p.kind_label);
  for (const p of izin) statIzin.set(p.kind, (statIzin.get(p.kind) ?? 0) + 1);

  const tahun = /^\d{4}$/.test((r.tahun ?? '').trim()) ? Number(r.tahun.trim()) : undefined;
  const pelepasan = izin.find((p) => p.kind === 'release');
  const utama = pelepasan ?? izin[0];
  const tipe = tipeVarietas(r);
  if (tipe) statTipe.set(tipe, (statTipe.get(tipe) ?? 0) + 1);

  const pemohon = (r.pemohon ?? '').trim();
  const e = {
    id: null,
    key,
    label: { id: nama },
    commodity: { id: cmd.id, label: cmd.label },
    ...(tipe ? { variety_type: tipe } : {}),
    ...(pelepasan ? {
      release: {
        authority: 'KEMENTAN',
        ...(pelepasan.decree_number ? { decree_number: pelepasan.decree_number } : {}),
        ...(tahun ? { year: tahun } : {}),
      },
    } : {}),
    permits: izin,
    ...(pemohon ? { maintainer: kanonik.get(pemohon) ?? pemohon } : {}),
    ...((r.asal ?? '').trim() ? { origin: r.asal.trim() } : {}),
    mappings: [{
      scheme: 'KEMENTAN',
      id: utama?.decree_number || nama,
      relation: 'exact',
      note: `${utama?.kind_label ?? 'Perizinan varietas'}${tahun ? ` tahun ${tahun}` : ''}; jenis tanaman menurut registri: ${jenis}.${utama?.decree_number ? '' : ' Registri tidak mencantumkan nomor SK, jadi yang dipakai nama varietasnya.'}`,
    }],
    lifecycle: { version: '0.1.0', status: 'draft', created_at: STAMP },
  };
  entitas.push(e);
}

if (entitas.length > BLOK_VTY.to - BLOK_VTY.from + 1) {
  throw new Error(`Butuh ${entitas.length} nomor varietas, blok hanya menyediakan ${BLOK_VTY.to - BLOK_VTY.from + 1}.`);
}
entitas.forEach((e, i) => { e.id = `op:vty:${String(BLOK_VTY.from + i).padStart(8, '0')}`; });

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'varietas.ndjson'), entitas.map((e) => JSON.stringify(e)).join('\n') + '\n');
writeFileSync(join(OUT_DIR, 'varietas.meta.json'), JSON.stringify({
  $schema: '../../schema/collection.schema.json',
  collection: {
    entity_type: 'variety',
    label: { id: 'Registri varietas tanaman terdaftar' },
    scope: {
      id: `${entitas.length} varietas dari registri perizinan varietas Kementan, tarikan 19 Agustus 2026. Satu entitas untuk satu catatan registri, bukan untuk satu nama: 1.350 nama dipakai lebih dari sekali — PERTIWI ada pada beberapa komoditas — dan 772 kelompok nama+jenis berulang dengan pemohon atau tahun berbeda. Menggabungkannya berarti menebak bahwa dua catatan menyebut varietas yang sama, dan registri tidak menyediakan dasar untuk tebakan itu. Registri mencatat PERIZINAN, bukan benih yang beredar: varietas terdaftar tidak berarti benihnya masih dijual. ${dilewati.length} catatan tidak diterbitkan karena jenis tanamannya kosong sehingga tidak bisa ditautkan ke komoditas mana pun.`,
    },
    lifecycle: { version: '0.1.0', status: 'draft', created_at: STAMP, review_due: '2026-11-19' },
    provenance: {
      license: 'CC-BY-SA-4.0',
      sources: [{
        title: 'Registri perizinan varietas tanaman (SIPERINTIS)',
        publisher: 'Kementerian Pertanian RI',
        url: 'https://perizinan.pertanian.go.id/',
        year: 2026,
        locator: 'GET /permohonan/v1/informasi/nama-varietas; ditarik 19 Agustus 2026. Endpoint mengembalikan seluruh registri dalam satu panggilan.',
      }],
    },
    storage: 'ndjson',
    count: entitas.length,
    id_blocks: [BLOK_VTY],
  },
}, null, 2) + '\n');

// ---------------------------------------------------------------------------
console.log(`Komoditas baru dibuat    : ${itemsCmd.length} (blok ${BLOK_CMD.from}-${BLOK_CMD.to})`);
console.log(`Jenis tanaman tertaut    : ${petaJenis.size} teks jenis -> komoditas`);
console.log(`Varietas jadi entitas    : ${entitas.length} (blok ${BLOK_VTY.from}-${BLOK_VTY.to})`);
console.log(`  punya variety_type     : ${[...statTipe.values()].reduce((a, b) => a + b, 0)} — ${[...statTipe].map(([k, v]) => `${k}:${v}`).join(' ')}`);
console.log(`  punya release (SK)     : ${entitas.filter((e) => e.release).length}`);
console.log(`  punya maintainer       : ${entitas.filter((e) => e.maintainer).length}`);
console.log(`  punya origin           : ${entitas.filter((e) => e.origin).length}`);
console.log(`Perizinan tercatat       : ${[...statIzin.values()].reduce((a, b) => a + b, 0)} — ${[...statIzin].map(([k, v]) => `${k}:${v}`).join(' ')}`);
console.log(`Dilewati (tanpa jenis)   : ${dilewati.length}`);
for (const d of dilewati) console.log(`   ${d.nama} — ${d.pemohon} (${d.tahun})`);
