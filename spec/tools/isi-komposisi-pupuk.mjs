// Mengisi composition dan analysis pada vocab/product/pupuk.ndjson dari kolom
// hasilAnalisaUji registri SIMPEL — kolom yang hilang saat penarikan pertama
// diekstrak ke CSV, sehingga 5.875 pupuk terlanjur terbit tanpa kandungan hara.
//
// Sumber: pukpes_data/raw/pupuk_terdaftar.json (tarikan 19 Agustus 2026).
// Jalankan dari akar repositori:  node spec/tools/isi-komposisi-pupuk.mjs
//
// Idempoten: composition, analysis, dan notes selalu dibangun ulang dari sumber,
// tidak pernah ditambahkan di atas hasil jalan sebelumnya.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RAW = join(root, 'pukpes_data', 'raw', 'pupuk_terdaftar.json');
const NDJSON = join(root, 'spec', 'vocab', 'product', 'pupuk.ndjson');
const STAMP = '2026-08-19T00:00:00Z';

// ---------------------------------------------------------------------------
// 1. Kosakata hara — hanya bentuk TOTAL yang boleh masuk composition.
//    Pecahan kelarutan (P2O5 larut air), fraksi (N-organik, Fe-tersedia), dan
//    penjumlahan (N + P2O5 + K2O) sengaja ditinggal di analysis supaya tidak
//    ada yang terhitung dua kali.
// ---------------------------------------------------------------------------
const S = (n, label) => ({ id: `op:sub:${String(n).padStart(8, '0')}`, label });

const HARA = [
  [/^n$|^n[-\s]?total$|^nitrogen(\s*\(n\))?$/, S(1, 'Nitrogen (N)')],
  [/^p2o5$|^p2o5[-\s]?total$|^p2o5\s*\(total\)$|^fosfor\s*\(p2o5\)$|^fosfat\s*\(p2o5\)$/, S(2, 'Fosfor (P2O5)')],
  [/^k2o$|^k2o[-\s]?total$|^kalium\s*\(k2o\)$/, S(3, 'Kalium (K2O)')],
  [/^cao$|^cao[-\s]?total$|^kalsium\s*\(cao\)$|^kalsium\s*oksida\s*\(cao\)$|^kalsium\s*oksida$/, S(4, 'Kalsium (CaO)')],
  [/^mgo$|^mgo[-\s]?total$|^magnesium\s*\(mgo\)$|^magnesium\s*oksida\s*\(mgo\)$|^magnesium\s*oksida$/, S(5, 'Magnesium (MgO)')],
  [/^s$|^s[-\s]?total$|^sulfur$|^belerang(\s*\(s\))?$/, S(6, 'Belerang (S)')],
  [/^b$|^b[-\s]?total$|^boron(\s*\(b\))?$/, S(11, 'Boron (B)')],
  [/^cu$|^cu[-\s]?total$|^tembaga(\s*\(cu\))?$/, S(12, 'Tembaga (Cu)')],
  [/^zn$|^zn[-\s]?total$|^seng(\s*\(zn\))?$/, S(13, 'Seng (Zn)')],
  [/^mn$|^mn[-\s]?total$|^mangan(\s*\(mn\))?$/, S(14, 'Mangan (Mn)')],
  [/^mo$|^mo[-\s]?total$|^molibden(um)?(\s*\(mo\))?$/, S(15, 'Molibdenum (Mo)')],
  [/^fe$|^fe[-\s]?total$|^besi(\s*\(fe\))?$/, S(16, 'Besi (Fe)')],
  [/^cl$|^cl[-\s]?total$|^klor(ida)?(\s*\(cl\))?$/, S(17, 'Klor (Cl)')],
  [/^sio2$|^silika(t)?\s*\(sio2\)$|^silika(t)?$/, S(18, 'Silikat (SiO2)')],
  [/^na$|^natrium\s*\(na\)$|^natrium$/, S(19, 'Natrium (Na)')],
  [/^c[-\s]?organik$|^karbon\s*organik$|^c[-\s]?organik\s*\(c\)$/, S(20, 'Karbon organik (C-organik)')],
];

// Diperiksa lebih dulu: apa pun yang cocok di sini tidak pernah jadi composition.
const BUKAN_HARA = [
  /\+/,                                     // penjumlahan, mis. N + P2O5 + K2O
  /larut|tersedia|terlarut/,                // pecahan kelarutan
  /^n[-\s]?organik|^n[-\s]?anorganik/,      // fraksi N, bukan N total
  /kadar\s*air|kelembaban/,
  /^ph\b|^p\s*h$/,
  /^c\s*\/\s*n|rasio/,
  /kehalusan|mesh|butiran|ukuran/,
  /netralisasi|caco3|kalsium\s*karbonat/,
  /kelarutan|berat\s*jenis|densitas|bobot|warna|bau|bentuk/,
  /asam\s*bebas/,
  /humat|fulvat|humus/,
  /b2o3|al2o3|fe2o3|so3|p2o3/,              // bentuk oksida yang belum dimodelkan
  /cfu|koloni|mikroba|bakteri|jamur|khamir|perombak|penambat|pelarut/,
  /\bsp\.?$|\bspp\.?$|bacillus|azotobacter|azospirillum|pseudomonas|trichoderma|rhizobium|streptomyces|lactobacillus|saccharomyces|aspergillus|penicillium|actynomycetes|actinomycetes|mikoriza|glomus|nitrosomonas|nitrobacter/,
  /logam\s*berat|^pb$|^cd$|^hg$|^as$|^cr$|arsen|timbal|kadmium|merkuri/,
  /e\.?\s*coli|salmonella|patogen/,
  /zat\s*pengatur|hormon|auksin|giberelin|sitokinin|iaa|ga3/,
  /organik$/,                               // "bahan organik", "C/N organik" dsb — kecuali c-organik di atas
];

// ---------------------------------------------------------------------------
// 2. Pembacaan nilai
// ---------------------------------------------------------------------------
const SUBSKRIP = { '\u2080': '0', '\u2081': '1', '\u2082': '2', '\u2083': '3', '\u2084': '4', '\u2085': '5', '\u2086': '6', '\u2087': '7', '\u2088': '8', '\u2089': '9' };

const norm = (s) =>
  s.toLowerCase()
    .replace(/[\u2080-\u2089]/g, (c) => SUBSKRIP[c])
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^[\s:.\-–]+/, '')
    .replace(/[\s:.]+$/, '')
    .replace(/\s*\(\s*/g, ' (')
    .replace(/\s*\)\s*/g, ')')
    .trim();

function angka(teks) {
  // "14,29" → 14.29 · "23.96" → 23.96 · "1.234,5" → 1234.5
  let t = teks.trim();
  if (t.includes(',') && t.includes('.')) t = t.replace(/\./g, '');
  return Number(t.replace(',', '.'));
}

function bacaNilai(raw) {
  const t = raw.replace(/﻿/g, ' ').replace(/\s+/g, ' ').replace(/^[\s:]+/, '').trim();
  const low = t.toLowerCase();

  // 4,85 x 10^6 CFU/g
  const cfu = low.match(/([\d.,]+)\s*x\s*10\s*\^?\s*(\d+)\s*(cfu|spora|sel)?\s*\/?\s*(g|gr|gram|ml|mL|l)?/i);
  if (cfu) {
    const nilai = angka(cfu[1]) * Math.pow(10, Number(cfu[2]));
    const per = (cfu[4] || '').toLowerCase();
    const satuan = per.startsWith('m') ? '[CFU]/mL' : per === 'l' ? '[CFU]/L' : '[CFU]/g';
    return Number.isFinite(nilai) ? { value: nilai, unit: satuan, kind: 'cfu' } : null;
  }

  const semua = low.match(/\d+(?:[.,]\d+)*/g) || [];
  if (semua.length !== 1) return null;               // rentang atau campuran → biarkan mentah
  const nilai = angka(semua[0]);
  if (!Number.isFinite(nilai)) return null;

  if (/%/.test(low)) return { value: nilai, unit: '%', kind: 'persen' };
  if (/ppm|mg\s*\/\s*kg/.test(low)) return { value: nilai, unit: '[ppm]', kind: 'ppm' };
  if (/mg\s*\/\s*l/.test(low)) return { value: nilai, unit: 'mg/L', kind: 'ppm' };
  if (/meq/.test(low)) return { value: nilai, unit: 'meq/(100.g)', kind: 'lain' };
  if (/cfu/.test(low)) return { value: nilai, unit: '[CFU]/g', kind: 'cfu' };
  return { value: nilai, unit: '1', kind: 'polos' };  // pH, C/N — tanpa satuan di sumber
}

// ---------------------------------------------------------------------------
// 3. Basis massa vs volume, dibaca dari bentuk formula
// ---------------------------------------------------------------------------
const CAIR = /cair|liquid/i;
function basis(bentuk) {
  if (CAIR.test(bentuk || '')) return { padat: false, per: 'L', catatan: 'cair' };
  if (!bentuk || /lainnya/i.test(bentuk)) return { padat: true, per: 'kg', catatan: 'tidak dinyatakan' };
  return { padat: true, per: 'kg', catatan: 'padat' };
}

// ---------------------------------------------------------------------------
// 4. Pembacaan HTML pada hasilAnalisaUji
// ---------------------------------------------------------------------------
function baris(html) {
  if (!html) return [];
  return html
    .split(/<\/p>|<br\s*\/?>|<\/li>/i)
    .map((p) =>
      p.replace(/<sup>\s*(.*?)\s*<\/sup>/gi, '^$1')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/﻿/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean);
}

function pasangan(hasilAnalisaUji) {
  let arr;
  try { arr = JSON.parse(hasilAnalisaUji || '[]'); } catch { return { pairs: [], rusak: true }; }
  if (!Array.isArray(arr)) return { pairs: [], rusak: true };
  const pairs = [];
  let tidakSejajar = 0;
  for (const e of arr) {
    const ks = baris(e?.key), vs = baris(e?.value);
    if (ks.length === vs.length && ks.length) {
      ks.forEach((k, i) => pairs.push([k, vs[i]]));
    } else {
      tidakSejajar += Math.max(ks.length, vs.length);
      // blok yang tidak sejajar tetap disimpan mentah, tanpa nilai terurai
      ks.forEach((k) => pairs.push([k, vs.join(' | ') || '']));
    }
  }
  return { pairs, tidakSejajar };
}

// ---------------------------------------------------------------------------
// 5. Jalan
// ---------------------------------------------------------------------------
const rawJson = JSON.parse(readFileSync(RAW, 'utf8'));
const rows = Array.isArray(rawJson) ? rawJson : Object.values(rawJson).find(Array.isArray);
const records = readFileSync(NDJSON, 'utf8').trim().split('\n').map((l) => JSON.parse(l));

const isSimpel = (r) => (r.mappings || []).some((m) => (m.note || '').includes('SIMPEL'));
const simpelIdx = records.map((r, i) => (isSimpel(r) ? i : -1)).filter((i) => i >= 0);

if (simpelIdx.length !== rows.length) {
  throw new Error(`Jumlah tidak cocok: ${rows.length} baris SIMPEL di sumber, ${simpelIdx.length} di NDJSON.`);
}

const stat = {
  denganKomposisi: 0, tanpaKomposisi: 0, entriKomposisi: 0, entriAnalisis: 0,
  gandaDibuang: 0, cfu: 0, rusak: 0, tidakSejajar: 0, legacy: 0,
};
const takTerpetakan = new Map();

simpelIdx.forEach((idx, n) => {
  const rec = records[idx];
  const row = rows[n];

  const merkRec = (rec.label?.id || '').trim().toUpperCase();
  const merkRaw = (row.merkDagang || '').trim().toUpperCase();
  if (merkRec !== merkRaw) {
    throw new Error(`Urutan meleset di posisi ${n}: NDJSON "${merkRec}" vs sumber "${merkRaw}".`);
  }

  const { pairs, rusak, tidakSejajar } = pasangan(row.hasilAnalisaUji);
  if (rusak) stat.rusak++;
  stat.tidakSejajar += tidakSejajar || 0;

  const b = basis(row.bentuk_formula);
  const composition = [];
  const analysis = [];
  const sudahAda = new Set();

  for (const [kRaw, vRaw] of pairs) {
    const k = norm(kRaw);
    const nilai = bacaNilai(vRaw);
    const entri = { parameter: kRaw, value_text: vRaw };
    if (nilai) { entri.value = Number(nilai.value.toPrecision(12)); entri.unit = nilai.unit; }
    if (nilai?.kind === 'cfu') stat.cfu++;

    const terlarang = BUKAN_HARA.some((re) => re.test(k)) && !/^c[-\s]?organik$|^karbon organik$/.test(k);
    // "kadar magnesium sebagai MgO" dan "kadar belerang" menyebut hara yang sama
    // dengan kata pengantar; pengantarnya dilepas, larangan tetap diuji pada nama asli.
    const varian = [k, k.replace(/^kadar\s+/, ''), k.replace(/^.*\bsebagai\s+/, ''), k.replace(/^kadar\s+/, '').replace(/\s*\(([^)]+)\)$/, '$1')];
    const hit = terlarang ? null : HARA.find(([re]) => varian.some((v) => re.test(v)));

    if (hit && nilai && (nilai.kind === 'persen' || nilai.kind === 'ppm') && nilai.value > 0) {
      const sub = hit[1];
      const masukAkal = nilai.kind === 'persen' ? nilai.value <= 100 : nilai.value <= 1_000_000;
      if (!masukAkal) {
        entri.in_composition = false;
      } else if (sudahAda.has(sub.id)) {
        entri.in_composition = false;
        stat.gandaDibuang++;
      } else {
        const value = nilai.kind === 'persen' ? nilai.value * 10 : nilai.value;
        const unit = nilai.kind === 'persen' ? `g/${b.per}` : `mg/${b.per}`;
        composition.push({ substance: sub, value: Number(value.toPrecision(12)), unit });
        sudahAda.add(sub.id);
        entri.in_composition = true;
      }
    } else {
      entri.in_composition = false;
      if (!terlarang && !hit && k) takTerpetakan.set(k, (takTerpetakan.get(k) || 0) + 1);
    }
    analysis.push(entri);
  }

  if (composition.length) {
    rec.composition = composition;
    stat.denganKomposisi++;
    stat.entriKomposisi += composition.length;
  } else {
    delete rec.composition;
    stat.tanpaKomposisi++;
  }

  if (analysis.length) {
    rec.analysis = analysis;
    stat.entriAnalisis += analysis.length;
  } else {
    delete rec.analysis;
  }

  const dasar = b.padat
    ? (b.catatan === 'tidak dinyatakan'
        ? 'Bentuk formula tidak dinyatakan registri, jadi persen dibaca sebagai bobot per bobot (b/b).'
        : 'Persen dibaca sebagai bobot per bobot (b/b) karena bentuknya padat.')
    : 'Persen dibaca sebagai bobot per volume (b/v) karena bentuknya cair — registri tidak menyatakan basisnya, dan angka aslinya tetap tersimpan di analysis.';

  rec.notes = {
    id: composition.length
      ? `Komposisi diturunkan dari hasil analisa uji pada registri SIMPEL. ${dasar} Angka ini hasil uji contoh yang didaftarkan, bukan jaminan kadar tiap kemasan; parameter yang bukan hara tunggal — pH, kadar air, C/N, kehalusan, cacah mikroba, dan pecahan kelarutan — ada di analysis, tidak ikut composition, supaya tidak terhitung dua kali.`
      : `Registri memuat hasil analisa uji, tetapi tidak ada satu pun parameter yang bisa dibaca sebagai kadar hara tunggal — isinya cacah mikroba, sifat fisik, atau bentuk oksida yang belum dimodelkan. Seluruhnya tersimpan apa adanya di analysis.`,
  };

  rec.lifecycle = { ...rec.lifecycle, updated_at: STAMP };
});

// Baris basis lama: sumbernya memang tidak punya kolom analisa.
for (const rec of records) {
  if (isSimpel(rec)) continue;
  stat.legacy++;
  rec.notes = {
    id: 'Basis lama SIMPUK-2020 tidak memuat hasil analisa uji, sehingga produk ini tidak punya composition dan tidak boleh dipakai menghitung hara yang benar-benar diberikan. Yang punya kandungan hara hanya baris dari basis SIMPEL.',
  };
  rec.lifecycle = { ...rec.lifecycle, updated_at: STAMP };
}

writeFileSync(NDJSON, records.map((r) => JSON.stringify(r)).join('\n') + '\n');

const top = [...takTerpetakan.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);
console.log(`Baris SIMPEL diproses     : ${simpelIdx.length}`);
console.log(`  punya composition       : ${stat.denganKomposisi}`);
console.log(`  tanpa composition       : ${stat.tanpaKomposisi}`);
console.log(`Baris basis lama (SIMPUK) : ${stat.legacy} — sumbernya tidak punya kolom analisa`);
console.log(`Entri composition         : ${stat.entriKomposisi}`);
console.log(`Entri analysis            : ${stat.entriAnalisis}`);
console.log(`  cacah mikroba (CFU)     : ${stat.cfu}`);
console.log(`  hara ganda dibuang      : ${stat.gandaDibuang}`);
console.log(`Blok key/value tak sejajar: ${stat.tidakSejajar}`);
console.log(`JSON analisa rusak        : ${stat.rusak}`);
console.log(`\nParameter tak terpetakan terbanyak (tersimpan mentah di analysis):`);
for (const [k, v] of top) console.log(`  ${String(v).padStart(5)}  ${k}`);
