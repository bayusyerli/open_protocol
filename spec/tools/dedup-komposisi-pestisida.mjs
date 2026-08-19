// Membuang entri composition yang terduplikasi pada vocab/product/pestisida.ndjson.
//
// Registri SIMPEL menyimpan bahan aktif sebagai beberapa catatan per pendaftaran —
// sisa daur ulang izin, perluasan, dan ejaan yang diperbaiki — dan penarikan kami
// memuat semuanya apa adanya. Akibatnya 1.260 dari 7.724 produk mengulang bahan
// aktif yang sama: ACTELLIC 500 EC mencantumkan "Pirimiphos methyl 500 g/L" tujuh
// kali, RIOMAX 150/150 EC mencantumkan tiap bahannya empat kali. Totalnya 4.488
// entri berlebih, dan L27 menyalakan 328 peringatan "komposisi mustahil" karena
// kadar yang sama dijumlahkan berulang.
//
// Sumber: pukpes_data/raw/pestisida_terdaftar.json (field bahanAktif), tarikan
// 19 Agustus 2026 — sumber yang sama yang dipakai membangun NDJSON-nya.
// Jalankan dari akar repositori:  node spec/tools/dedup-komposisi-pestisida.mjs
//
// Idempoten: putusan sengketa dipakai dari tabel, bukan dari sengketa yang masih
// terlihat di berkas — kalau tidak, catatannya ikut hilang begitu jalan pertama
// selesai. Setiap nilai yang dipertahankan diuji balik ke bahanAktif mentah, dan
// rekaman yang tidak berubah wajib keluar sama persis seperti aslinya. Jalan kedua
// tidak mengubah apa pun.
//
// Skrip ini TIDAK memetakan ulang nama bahan ke substance id — pemetaan itu
// pekerjaan pembangun NDJSON; di sini yang dilakukan hanya membuang ulangan. Itu
// juga sebabnya lima produk masih menyalakan L27 sesudah dedup: bahan yang sama
// terdaftar di dua substance id karena registri menuliskan keterangan kesetaraan
// ke dalam nama bahannya ("2,4-D dimetil amina" vs "2,4-D dimetil amina (setara
// dengan 2,4-D 720 g/l)"). Menggabungkan dua id itu keputusan kosakata, bukan
// keputusan ulangan, dan perlu tinjauannya sendiri — tinjauan itu ada di
// gabung-id-zat-kembar.mjs, yang dijalankan SESUDAH skrip ini.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RAW = join(root, 'pukpes_data', 'raw', 'pestisida_terdaftar.json');
const NDJSON = join(root, 'spec', 'vocab', 'product', 'pestisida.ndjson');
const STAMP = '2026-08-19T00:00:00Z';

// ---------------------------------------------------------------------------
// 1. Tujuh sengketa nilai — diputuskan satu per satu, bukan didedup buta.
//
//    Pada tujuh produk, satu substance id muncul dengan kadar yang BERBEDA.
//    Sumbernya memang memuat dua-duanya, dan tidak ada satu pun kolom di registri
//    yang menentukan mana yang benar. Yang menentukan di sini adalah bukti dari
//    dalam registri itu sendiri, terutama konvensi penamaan: pada 4.495 dari
//    4.508 produk yang komposisinya tidak bersengketa, angka pada nama dagang
//    sama persis dengan kadar yang tercatat ("NORTHAM 480 SC" = 480 g/l).
//
//    Nilai yang ditolak tidak hilang diam-diam — ia ditulis ke notes pada
//    rekaman yang bersangkutan, lengkap dengan dasarnya, supaya bisa dibalik.
// ---------------------------------------------------------------------------
const SENGKETA = {
  'markotop-300-sl-01030120134788': {
    'op:sub:00000104': {
      pilih: { value: 300, unit: 'g/L' },
      tolak: [{ value: 276, unit: 'g/L' }],
      dasar:
        'Angka pada nama dagang mengunci kadar di registri ini. SANTAQUAT 276 SL* dari ' +
        'pemegang pendaftaran yang sama tercatat 276 g/l tanpa sengketa, jadi 276 di sini ' +
        'catatan asing — 276 g/l adalah kadar parakuat diklorida paling lazim (170 kali di ' +
        'seluruh registri) dan mudah terbawa sebagai nilai bawaan.',
    },
  },
  'topjos-300-sl-01030120238070': {
    'op:sub:00000104': {
      pilih: { value: 300, unit: 'g/L' },
      tolak: [{ value: 276, unit: 'g/L' }],
      dasar:
        'Tiga belas produk parakuat PT. SARI KRESNA KIMIA yang tidak bersengketa semuanya ' +
        'cocok antara angka nama dan kadar: BAKARXONE 276 SL, BROTOP 276 SL, OK JOSS 276 SL, ' +
        'HELITOP 255 SL, PROXON 200 SL, RAKSON 140 SL, KOBONG 138 SL, BOXONE 135 SL, dan ' +
        'seterusnya. Konvensinya utuh, jadi 300 yang dipakai.',
    },
  },
  'biartop-333-sl-01030120237972': {
    'op:sub:00000104': {
      pilih: { value: 333, unit: 'g/L' },
      tolak: [{ value: 276, unit: 'g/L' }],
      dasar:
        'Sama seperti TOPJOS 300 SL — pemegang pendaftaran yang sama, konvensi nama yang sama. ' +
        'Kadar 333 g/l hanya muncul sekali di seluruh registri, tepat pada produk yang namanya ' +
        '333; kebetulan seperti itu tidak masuk akal kalau 333 cuma salah entri.',
    },
  },
  'marxone-300-sl-01030120072774': {
    'op:sub:00000178': {
      pilih: { value: 300, unit: 'g/L' },
      tolak: [{ value: 276, unit: 'g/L' }],
      dasar:
        'Angka pada nama dagang. Di sumber, 300 g/l tercatat enam kali dan 276 g/l sekali — ' +
        'tetapi jumlah kemunculan bukan suara: ia hanya cermin berapa baris yang ikut ' +
        'tergabung. Yang menentukan tetap konvensi nama.',
    },
  },
  'platinum-20-sc-01010120175781': {
    'op:sub:00000184': {
      pilih: { value: 20, unit: 'g/L' },
      tolak: [{ value: 200, unit: 'g/L' }],
      perlu_tinjau: true,
      dasar:
        'Konvensi nama: KONSULTAN 200 SC tercatat klotianidin 200 g/l, dan di seluruh registri ' +
        'hanya SATU produk yang angka namanya sepersepuluh kadarnya — pembacaan "20 SC = 20% = ' +
        '200 g/l" praktis tidak dipakai di sini. Ditandai perlu tinjau: kedua nilai berselisih ' +
        'sepuluh kali lipat, dan salah pilih berarti salah dosis sepuluh kali lipat.',
    },
  },
  'cts-natural-coil-032022515': {
    'op:sub:00000414': {
      pilih: { value: 0.0135, unit: '%' },
      tolak: [{ value: 0.015, unit: '%' }],
      perlu_tinjau: true,
      dasar:
        'Namanya tidak memuat angka, jadi konvensi nama tidak bisa dipakai. Yang dipakai: ' +
        'sesama obat nyamuk bakar "natural" dari PT. FUMAKILLA NOMOS, NEW CROCODILE NATURAL ' +
        'MOSQUITO COIL, tercatat metoflutrin 0,0135 % — sedangkan lini MC biasa (CROC 0.015MC, ' +
        'MOSHIELD 0.015MC, MOSPEL 0.015MC) tercatat 0,015 %. Ditandai perlu tinjau: dasarnya ' +
        'kemiripan lini produk, bukan angka di sumber.',
    },
  },
  // Putusan ini dulu dikunci pada op:sub:00000484 "Dimeflutrhin". Id itu sekarang
  // berstatus superseded — gabung-id-zat-kembar.mjs menetapkan bahwa "dimeflutrhin"
  // dan "dimeflutrin" satu bahan — sehingga seluruh kadar NOMOS yang tergabung di
  // pendaftaran ini bermuara ke op:sub:00000403. Putusannya sendiri tidak berubah:
  // yang dipilih tetap 0,2 %, yang ditolak tetap enam kadar milik saudara sekutunya.
  'nomos-0-2mc-06080120227337': {
    'op:sub:00000403': {
      pilih: { value: 0.2, unit: '%' },
      tolak: [
        { value: 0.031, unit: '%' }, { value: 0.051, unit: '%' },
        { value: 0.081, unit: '%' }, { value: 0.1, unit: '%' },
        { value: 6.1, unit: 'g/L' }, { value: 12.1, unit: 'g/L' },
      ],
      dasar:
        'Lini NOMOS menamai kadarnya persis — NOMOS 0.041MC, 0.05MC, 0.051MC, 0.1MC — dan ' +
        '0,2 % juga nilai terbanyak di sumber (12 kali). Enam kadar lain pada pendaftaran ini ' +
        'adalah catatan milik pendaftaran NOMOS bersaudara yang ikut tergabung.',
    },
  },
};

// Sisa yang tidak disentuh dedup-per-substance-id, tetapi perlu diketahui pembaca.
const CATATAN_TAMBAHAN = {
  'nomos-0-2mc-06080120227337':
    'Pendaftaran ini masih memuat satu bahan yang bukan milik NOMOS 0.2MC: op:sub:00000291 ' +
    '"metofluthrin" 0,015 %, yang berasal dari NOMOS 0.041MC. Dedup per substance id tidak ' +
    'boleh menyentuhnya — membuang bahan yang berbeda bukan keputusan ulangan — dan ' +
    'penggabungan id juga tidak, karena metoflutrin memang bahan lain, bukan ejaan lain. ' +
    'Perlu tinjauan terpisah, dan tinjauannya harus ke label produk, bukan ke registri: ' +
    'sumber tidak memisahkan baris milik pendaftaran mana.',
};

// ---------------------------------------------------------------------------
// 2. Pembacaan sumber mentah
// ---------------------------------------------------------------------------
const angka = (t) => {
  let s = String(t ?? '').trim();
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '');
  return Number(s.replace(',', '.'));
};

// Satuan registri ditulis huruf kecil ("g/l", "ml/l"); NDJSON memakai bentuk UCUM
// ("g/L", "mL/L"). Dua baris memuat satuan kosong atau "-" — di situ pembangun
// NDJSON menyimpulkan satuannya dari bahan sebelahnya, jadi pemeriksaan silang
// di bawah cukup mencocokkan angkanya saja.
const SATUAN = {
  'g/l': 'g/L', 'ml/l': 'mL/L', 'mg/l': 'mg/L',
  'g/kg': 'g/kg', 'mg/kg': 'mg/kg', '%': '%',
  'g/m2': 'g/m2', 'mg/m2': 'mg/m2', 'mg/pcs': 'mg/pcs',
};
const TAK_DINYATAKAN = '*';

const satuan = (t) => {
  const s = String(t ?? '').trim().toLowerCase();
  if (!s || s === '-') return TAK_DINYATAKAN;
  return SATUAN[s] ?? String(t).trim();
};

function kadarMentah(bahanAktif) {
  let arr;
  try { arr = JSON.parse(bahanAktif || '[]'); } catch { return null; }
  if (!Array.isArray(arr)) return null;
  const set = new Set();
  for (const b of arr) {
    const v = angka(b?.kadarBahan);
    if (Number.isFinite(v)) set.add(`${v}|${satuan(b?.satuanBahan)}`);
  }
  return set;
}

// Cocok bila angka DAN satuannya sama, atau bila sumbernya tidak menyatakan satuan.
const adaDiSumber = (set, e) => set.has(`${e.value}|${e.unit}`) || set.has(`${e.value}|${TAK_DINYATAKAN}`);

const tanda = (e) => `${e.value}|${e.unit}`;

// Berkas ini semula ditulis pembangun Python. Keluarannya memakai pemisah ", " dan
// ": ", dan composition[].value — satu-satunya field angka di seluruh berkas —
// selalu berupa float, sehingga 480 ditulis "480.0". JSON.stringify bawaan Node
// menulis kedua hal itu berbeda, jadi menulis ulang berkas dengannya akan mengubah
// ke-7.724 barisnya padahal yang berubah hanya 1.260 — perubahan yang sesungguhnya
// jadi tenggelam dan tidak bisa ditinjau. Fungsi ini meniru keluaran
// json.dumps(obj, ensure_ascii=False) persis; kesetiaannya diuji di bawah terhadap
// setiap rekaman yang tidak berubah, jadi kalau ada bentuk yang tidak tertiru,
// skrip berhenti alih-alih diam-diam menulis ulang seisi berkas.
function tulisBarisPython(v) {
  if (v === null) return 'null';
  if (typeof v === 'number') return Number.isInteger(v) ? `${v}.0` : String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(tulisBarisPython).join(', ')}]`;
  return `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${tulisBarisPython(x)}`).join(', ')}}`;
}

// ---------------------------------------------------------------------------
// 3. Jalan
// ---------------------------------------------------------------------------
const rawJson = JSON.parse(readFileSync(RAW, 'utf8'));
const rows = Array.isArray(rawJson) ? rawJson : Object.values(rawJson).find(Array.isArray);
const barisAsli = readFileSync(NDJSON, 'utf8').trim().split('\n');
const records = barisAsli.map((l) => JSON.parse(l));
const berubah = new Set();

if (rows.length !== records.length) {
  throw new Error(`Jumlah tidak cocok: ${rows.length} baris di sumber, ${records.length} di NDJSON.`);
}

// NDJSON dibangun berurutan dari sumber; kalau urutannya meleset, seluruh
// pemeriksaan silang di bawah ini membandingkan produk yang salah.
records.forEach((rec, i) => {
  const a = String(rec.label?.id ?? '').trim().toUpperCase();
  const b = String(rows[i].namaProduk ?? '').trim().toUpperCase();
  const na = String(rec.registration?.number ?? '').trim();
  const nb = String(rows[i].nomorPendaftaran ?? '').trim();
  if (a !== b || na !== nb) {
    throw new Error(`Urutan meleset di posisi ${i}: NDJSON "${a}" (${na}) vs sumber "${b}" (${nb}).`);
  }
});

const stat = {
  produkDidedup: 0, entriDibuang: 0, produkSengketa: 0,
  entriSebelum: 0, entriSesudah: 0, tanpaKomposisi: 0,
};
const sengketaBaru = [];
const takAdaDiSumber = [];
const putusanBasi = [];
const kunciTerpakai = new Set();

records.forEach((rec, i) => {
  const asli = rec.composition ?? [];
  if (!asli.length) { stat.tanpaKomposisi++; return; }
  stat.entriSebelum += asli.length;

  const mentah = kadarMentah(rows[i].bahanAktif);
  const putusan = SENGKETA[rec.key] ?? {};
  if (SENGKETA[rec.key]) kunciTerpakai.add(rec.key);

  // Kelompokkan per substance id, urutan kemunculan pertama dipertahankan.
  const grup = new Map();
  for (const e of asli) {
    const id = e.substance?.id;
    if (!grup.has(id)) grup.set(id, []);
    grup.get(id).push(e);
  }

  const baru = [];
  const catatanSengketa = [];

  for (const [id, entri] of grup) {
    const p = putusan[id];

    // Putusan tertulis dipakai lebih dulu, tanpa menunggu sengketanya terlihat di
    // berkas. Sesudah jalan pertama sengketanya memang sudah tidak ada di NDJSON —
    // kalau putusan hanya dipicu oleh sengketa yang terdeteksi, catatannya akan
    // ikut hilang pada jalan kedua dan skrip ini berhenti idempoten.
    if (p) {
      const dipilih = entri.find((e) => e.value === p.pilih.value && e.unit === p.pilih.unit);
      if (!dipilih) {
        throw new Error(`Putusan untuk ${rec.key} memilih ${p.pilih.value} ${p.pilih.unit}, tetapi nilai itu tidak ada di NDJSON.`);
      }
      baru.push(dipilih);
      stat.produkSengketa++;

      // Sengketanya harus masih ada di sumber. Kalau registri sudah dirapikan,
      // putusan ini kedaluwarsa dan harus ditinjau ulang, bukan dipakai diam-diam.
      if (mentah) {
        const hilang = [p.pilih, ...p.tolak].filter((v) => !mentah.has(`${v.value}|${v.unit}`));
        if (hilang.length) {
          putusanBasi.push(`${rec.key} — ${id}: ${hilang.map((v) => `${v.value} ${v.unit}`).join(', ')} tidak lagi ada di sumber`);
        }
      }

      const ditolak = p.tolak.map((t) => `${t.value} ${t.unit}`).join('; ');
      catatanSengketa.push(
        `Registri memuat lebih dari satu kadar untuk ${dipilih.substance.label} pada pendaftaran ini. ` +
        `Yang dipakai ${p.pilih.value} ${p.pilih.unit}; yang tidak dipakai ${ditolak}. ${p.dasar}` +
        (p.perlu_tinjau ? ' PERLU TINJAU.' : '')
      );
      continue;
    }

    const nilai = [...new Set(entri.map(tanda))];
    if (nilai.length === 1) {
      baru.push(entri[0]);                       // ulangan murni — buang sisanya
      continue;
    }

    // Nilainya berbeda dan tidak ada putusan tertulis. Tidak ada tebakan diam-diam.
    sengketaBaru.push(`${rec.key} (${rec.label?.id}) — ${id}: ${nilai.join(', ')}`);
    baru.push(...entri);                         // biarkan apa adanya sampai diputuskan
  }

  // Setiap kadar yang bertahan wajib benar-benar ada di bahanAktif mentah.
  if (mentah) {
    for (const e of baru) {
      if (!adaDiSumber(mentah, e)) {
        takAdaDiSumber.push(`${rec.key} — ${e.substance?.id} ${e.value} ${e.unit}`);
      }
    }
  }

  stat.entriSesudah += baru.length;

  if (baru.length !== asli.length) {
    stat.produkDidedup++;
    stat.entriDibuang += asli.length - baru.length;
    rec.composition = baru;
    rec.lifecycle = { ...rec.lifecycle, updated_at: STAMP };
    berubah.add(i);
  }

  const tambahan = CATATAN_TAMBAHAN[rec.key];
  const catatan = [...catatanSengketa, ...(tambahan ? [tambahan] : [])];
  if (catatan.length) {
    rec.notes = { id: catatan.join(' ') };
    rec.lifecycle = { ...rec.lifecycle, updated_at: STAMP };
    berubah.add(i);
  }
});

// ---------------------------------------------------------------------------
// 4. Penjagaan — sumber yang diperbarui tidak boleh lolos diam-diam
// ---------------------------------------------------------------------------
const gagal = [];
if (sengketaBaru.length) {
  gagal.push('Ada sengketa kadar yang belum diputuskan — periksa ke sumber, lalu tambahkan ke tabel SENGKETA:');
  for (const s of sengketaBaru) gagal.push(`  ${s}`);
}
if (takAdaDiSumber.length) {
  gagal.push('Ada kadar yang bertahan tetapi tidak ada di bahanAktif mentah:');
  for (const s of takAdaDiSumber) gagal.push(`  ${s}`);
}
if (putusanBasi.length) {
  gagal.push('Ada putusan sengketa yang tidak lagi cocok dengan sumber — tinjau ulang:');
  for (const s of putusanBasi) gagal.push(`  ${s}`);
}
const tanpaProduk = Object.keys(SENGKETA).filter((k) => !kunciTerpakai.has(k));
if (tanpaProduk.length) {
  gagal.push('Ada putusan sengketa yang produknya tidak ada di NDJSON:');
  for (const s of tanpaProduk) gagal.push(`  ${s}`);
}
if (gagal.length) {
  for (const b of gagal) console.error(b);
  process.exit(1);
}

const keluaran = records.map(tulisBarisPython);

// Rekaman yang tidak disentuh wajib keluar sama persis seperti aslinya.
const menyimpang = [];
records.forEach((_, i) => {
  if (!berubah.has(i) && keluaran[i] !== barisAsli[i]) menyimpang.push(i);
});
if (menyimpang.length) {
  console.error(`Penulis baris tidak setia pada ${menyimpang.length} rekaman yang tidak berubah — contoh baris ${menyimpang.slice(0, 3).map((i) => i + 1).join(', ')}.`);
  console.error('Menulis berkas sekarang akan mengubah baris yang tidak ada urusannya dengan dedup ini. Dibatalkan.');
  process.exit(1);
}

writeFileSync(NDJSON, keluaran.join('\n') + '\n');

console.log(`Produk diperiksa          : ${records.length}`);
console.log(`  baris ditulis ulang     : ${berubah.size} (sisanya keluar apa adanya)`);
console.log(`  tanpa composition       : ${stat.tanpaKomposisi}`);
console.log(`  komposisinya didedup    : ${stat.produkDidedup}`);
console.log(`Entri composition sebelum : ${stat.entriSebelum}`);
console.log(`Entri composition sesudah : ${stat.entriSesudah}`);
console.log(`  entri berlebih dibuang  : ${stat.entriDibuang}`);
console.log(`Sengketa kadar diputuskan : ${stat.produkSengketa} (tabel SENGKETA)`);
