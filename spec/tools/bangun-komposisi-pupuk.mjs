// Membongkar kolom hasilAnalisaUji registri pupuk jadi tabel komposisi hara
// per produk: nama parameter bersih dari HTML, nilai sebagai angka, satuan terpisah.
//
// Sumber: pukpes_data/raw/pupuk_terdaftar.json (tarikan 19 Agustus 2026, basis
// SIMPEL). Dibaca saja, tidak pernah ditulis. Jalankan dari akar repositori:
//
//   node spec/tools/bangun-komposisi-pupuk.mjs            # hitung & laporkan saja
//   node spec/tools/bangun-komposisi-pupuk.mjs --tulis    # tulis ke pukpes_data/
//
// KENAPA ADA
// `hasilAnalisaUji` terisi pada seluruh 5.875 baris, tetapi isinya JSON di dalam
// string, dan tiap nilainya dibungkus HTML — sehingga tidak pernah muncul di CSV
// mana pun. Padahal komposisi inilah yang membedakan SKU: PHONSKA bukan satu
// produk melainkan beberapa grade NPK yang namanya sama dan angkanya berbeda.
//
// EMPAT JEBAKAN DI DALAM HTML-NYA, DAN CARA MASING-MASING DITANGANI
//
// 1. <sub> vs <sup> tidak boleh diperlakukan sama.
//    P<sub>2</sub>O<sub>5</sub> memang harus jadi "P2O5" — angkanya menempel.
//    Tetapi 4,85 x 10<sup>6</sup> CFU/g TIDAK boleh jadi "4,85 x 106 CFU/g":
//    pangkatnya hilang dan cacah mikrobanya meleset lima kali lipat. <sup>
//    dipertahankan sebagai "^", lalu pangkatnya dipindah ke kolom `pengali`.
//
// 2. Satu sel bisa memuat BEBERAPA parameter.
//    Pada 110 sel, key dan value sama-sama berisi beberapa blok <p> yang
//    berpasangan berurutan — PHONSKA PLUS memuat delapan hara dalam satu sel.
//    Menggabungkannya jadi satu teks akan melahirkan parameter bernama
//    "N P2O5 K2O S Zn B Cu Kadar air" yang tidak cocok dengan apa pun, dan tujuh
//    hara ikut hilang bersamanya. Blok yang jumlahnya sepadan dipecah jadi
//    beberapa baris; yang tidak sepadan disatukan kembali dan ditandai, sebab di
//    situ blok kedua biasanya cuma sambungan baris ("Kehalusan" / "lolos 80 Mesh").
//
// 3. Nilainya sering diawali titik dua, sisa tata letak "N : 16%".
//    Titik dua di depan dibuang sebelum diurai; tanpa itu 50 nilai gagal terbaca.
//
// 4. Desimal memakai koma, dan kadang memakai titik.
//    Koma selalu desimal. Titik yang diikuti TEPAT tiga angka bisa saja pemisah
//    ribuan — itu tidak ditebak: nilainya dibaca sebagai desimal DAN ditandai
//    `titik-ambigu` di berkas anomali supaya bisa ditinjau.
//
// YANG TIDAK DINORMALKAN, DAN KENAPA
// Nama parameter keluar apa adanya setelah HTML dilepas. `parameter_kunci` hanya
// menyeragamkan huruf besar-kecil, spasi berlebih, dan tanda baca di ujung —
// tidak lebih. "Fe-total", "Fe total", dan "Fe" TIDAK disatukan: ketiganya bisa
// saja parameter uji yang berbeda, dan menyatukannya adalah keputusan agronomi,
// bukan keputusan pembersihan teks. Sebaran variannya ada di
// komposisi_pupuk_parameter.csv supaya keputusan itu bisa diambil dengan angka
// di tangan, bukan dengan dugaan.
//
// HUBUNGANNYA DENGAN isi-komposisi-pupuk.mjs
// Skrip itu MENGISI composition dan analysis pada vocab/product/pupuk.ndjson, dan
// hanya meloloskan hara bentuk total ke composition. Skrip ini tidak menyentuh
// NDJSON sama sekali; ia menerbitkan seluruh parameter — hara, sifat fisik, cacah
// mikroba, uji kualitatif — sebagai tabel tersendiri, termasuk yang sengaja
// ditinggalkan di sana.
//
// KELUARANNYA DETERMINISTIK
// Tanpa stempel waktu; urutan baris mengikuti urutan registri, inventaris parameter
// diurutkan menurut jumlah lalu abjad. Jalan kedua menghasilkan berkas yang sama
// persis.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RAW = join(akar, 'pukpes_data', 'raw', 'pupuk_terdaftar.json');
const NDJSON = join(akar, 'spec', 'vocab', 'product', 'pupuk.ndjson');
const KELUAR = join(akar, 'pukpes_data');
const tulis = process.argv.includes('--tulis');

const TANGGAL_TARIK = '2026-08-19';

// ---------------------------------------------------------------------------
// HTML -> teks, per blok <p>
// ---------------------------------------------------------------------------
function blokTeks(html) {
  if (html == null) return [];
  let s = String(html).replace(/\r\n?/g, '\n');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  // <sup> dipertahankan sebagai pangkat, <sub> dilebur ke dalam nama
  s = s.replace(/<sup>\s*([\s\S]*?)\s*<\/sup>/gi, (_, x) => `^${x.replace(/\s+/g, '')}`);
  s = s.replace(/<sub>\s*([\s\S]*?)\s*<\/sub>/gi, (_, x) => x.replace(/\s+/g, ''));
  const potong = s.split(/<\/p>\s*<p[^>]*>|<\/p>|<p[^>]*>|\n/i);
  const keluar = [];
  for (let p of potong) {
    p = p.replace(/<[^>]+>/g, '');
    p = p
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/g, "'");
    p = p.replace(/ /g, ' ').replace(/﻿/g, '');
    p = p.replace(/[ \t]+/g, ' ').trim();
    if (p) keluar.push(p);
  }
  return keluar;
}

const bersihNama = (s) => s.replace(/^[\s:.\-–]+/, '').replace(/[\s:.]+$/, '').replace(/[ \t]+/g, ' ').trim();

// Penyeragaman seadanya: huruf kecil, spasi rapat, tanda baca ujung dibuang.
// Sengaja tidak lebih jauh dari itu.
const kunciParameter = (s) => bersihNama(s).toLowerCase();

// Penyeragaman yang LEBIH agresif — tidak dipakai untuk mengelompokkan, hanya
// dihitung supaya laporan bisa menyebut berapa banyak nama yang MASIH akan
// menyatu bila spasi dan tanda hubung ikut dibuang. Keputusannya ada di tangan
// manusia, bukan di skrip ini.
const kunciAgresif = (s) => kunciParameter(s).replace(/[\s\-–_()]/g, '');

// ---------------------------------------------------------------------------
// Pengurai nilai
// ---------------------------------------------------------------------------
const ANGKA = String.raw`\d+(?:[.,]\d+)*`;
const KUALIFIER = String.raw`(?:min\.?|minimal|minimum|maks\.?|maksimal|maksimum|max\.?|≥|≤|>=|<=|>|<|±|\+\/-)`;
const POLA_NILAI = new RegExp(
  String.raw`^(?<q>${KUALIFIER})?\s*(?<lo>${ANGKA})(?:\s*(?:-|–|—|s\/d|s\.d\.?|sampai)\s*(?<hi>${ANGKA}))?\s*(?<sisa>[\s\S]*)$`,
  'i',
);
// "x 10^6 CFU/g", "x10^6CFU/g", dan "10^5 CFU/g" (tanpa x) sama-sama diterima —
// (?!\d) dipakai alih-alih \b sebab "10^7CFU" tidak punya batas kata sesudah 7.
const POLA_PENGALI = new RegExp(String.raw`^(?:x\s*)?10\s*\^\s*(?<p>\d{1,2})(?!\d)\s*(?<sisa>[\s\S]*)$`, 'i');
const POLA_PENGALI_TANPA_PANGKAT = /^x\s*\^?\s*10\s*(\d{1,2})(?!\d)/i;

// Satuan yang masuk akal diawali huruf, "%", atau "/". Yang lain — ",21 ppm",
// "i %", "5" — pertanda nilainya rusak, dan itu dicatat, bukan dibereskan diam-diam.
const SATUAN_LAZIM = /^[A-Za-z%/]/;

const KUALITATIF = /^(positif|negatif|posirif|ada|tidak ada|nihil|terdeteksi|tidak terdeteksi)$/i;

// Pembaca angka bergaya Indonesia.
//
// "11.221,34 ppm" bukan 11,221 melainkan 11.221,34 — dan salah membacanya membuat
// kadar Fe meleset seribu kali. Aturannya: kalau titik DAN koma sama-sama muncul,
// yang terakhir adalah tanda desimal dan sisanya pemisah ribuan; kalau satu tanda
// muncul berkali-kali, semuanya pemisah ribuan. Sisanya — satu titik yang diikuti
// tepat tiga angka, tanpa koma di mana pun — memang tidak bisa dipastikan; ia
// dibaca sebagai desimal DAN ditandai, bukan ditebak diam-diam.
function keAngka(s) {
  if (s == null) return null;
  let t = String(s).replace(/\s/g, '');
  const titik = (t.match(/\./g) || []).length;
  const koma = (t.match(/,/g) || []).length;
  if (titik && koma) {
    const desimal = t.lastIndexOf('.') > t.lastIndexOf(',') ? '.' : ',';
    const ribuan = desimal === '.' ? ',' : '.';
    t = t.split(ribuan).join('');
    if (desimal === ',') t = t.replace(',', '.');
  } else if (koma > 1) t = t.split(',').join('');
  else if (titik > 1) t = t.split('.').join('');
  else if (koma === 1) t = t.replace(',', '.');
  const n = Number(t);
  return Number.isNaN(n) ? null : n;
}

const angkaAmbigu = (s) => {
  if (s == null) return false;
  const t = String(s).replace(/\s/g, '');
  return !t.includes(',') && /^\d+\.\d{3}$/.test(t) && !/^0\./.test(t);
};

// ---------------------------------------------------------------------------
// Tautan ke op:prd — posisi larik raw = urutan baris NDJSON, dan itu DIPERIKSA.
// Nomor pendaftaran tidak bisa jadi kunci: 98 nomor dipakai lebih dari satu produk
// dan 26 baris tidak mencantumkan nomor sama sekali.
// ---------------------------------------------------------------------------
function bacaProduk(jml) {
  if (!existsSync(NDJSON)) return { rec: [], catatan: 'vocab/product/pupuk.ndjson tidak ada — produk_id dikosongkan.' };
  const baris = readFileSync(NDJSON, 'utf8').split('\n').filter((l) => l.trim());
  if (baris.length < jml)
    return { rec: [], catatan: `vocab/product/pupuk.ndjson hanya ${baris.length} baris, raw ${jml} — produk_id dikosongkan.` };
  return { rec: baris.slice(0, jml).map((l) => JSON.parse(l)), catatan: '' };
}

function csv(kolom, baris) {
  const sel = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + [kolom, ...baris].map((r) => r.map(sel).join(',')).join('\r\n') + '\r\n';
}

// ===========================================================================
// Jalan utama
// ===========================================================================
const raw = JSON.parse(readFileSync(RAW, 'utf8'));
const prd = bacaProduk(raw.length);

const barisKomposisi = [];
const barisAnomali = [];
const inventaris = new Map(); // kunci -> { varian:Map(nama->jml), baris, produk:Set, satuan:Map }
const satuanSemua = new Map();

const h = {
  produk: raw.length,
  produkPunyaAnalisa: 0,
  produkPunyaParameterTerurai: 0,
  sel: 0,
  selMajemuk: 0,
  selMajemukSepadan: 0,
  selMajemukTakSepadan: 0,
  parameterTambahanDariSelMajemuk: 0,
  baris: 0,
  numerik: 0,
  kualitatif: 0,
  takTerurai: 0,
  rentang: 0,
  berkualifier: 0,
  tanpaSatuan: 0,
  pengali: 0,
  pengaliAmbigu: 0,
  titikAmbigu: 0,
  satuanTakLazim: 0,
};

const anomali = (r, jenis, teks, ket) =>
  barisAnomali.push([r.noPendaftaran || '', (r.merkDagang || '').trim(), jenis, teks, ket]);

for (let i = 0; i < raw.length; i++) {
  const r = raw[i];
  const rec = prd.rec[i];
  if (rec) {
    const nomorSama = (rec.registration?.number || '') === (r.noPendaftaran || 'TIDAK-TERCANTUM');
    const namaSama = (rec.label?.id || '').trim() === (r.merkDagang || '').trim();
    if (!nomorSama && !namaSama)
      throw new Error(
        `Urutan raw dan NDJSON melenceng di indeks ${i}: "${(r.merkDagang || '').trim()}" vs "${(rec.label?.id || '').trim()}".`,
      );
  }
  const produkId = rec ? rec.id : '';
  const nomor = r.noPendaftaran || '';
  const merk = (r.merkDagang || '').trim();

  let arr = [];
  try {
    arr = r.hasilAnalisaUji ? JSON.parse(r.hasilAnalisaUji) : [];
  } catch {
    anomali(r, 'analisa-json-rusak', String(r.hasilAnalisaUji).slice(0, 200), 'JSON di dalam string gagal diurai.');
    continue;
  }
  if (arr.length) h.produkPunyaAnalisa++;
  let adaTerurai = false;
  let urut = 0;

  for (const it of arr) {
    h.sel++;
    const bk = blokTeks(it.key);
    const bv = blokTeks(it.value);
    let pasangan;
    let catatanSel = '';
    if (bk.length > 1 || bv.length > 1) {
      h.selMajemuk++;
      if (bk.length === bv.length && bk.length > 1) {
        h.selMajemukSepadan++;
        h.parameterTambahanDariSelMajemuk += bk.length - 1;
        pasangan = bk.map((k, n) => [k, bv[n]]);
      } else {
        h.selMajemukTakSepadan++;
        catatanSel = 'sel-majemuk-tak-sepadan';
        anomali(
          r,
          'sel-majemuk-tak-sepadan',
          `key=[${bk.join(' | ')}] value=[${bv.join(' | ')}]`,
          `${bk.length} blok nama lawan ${bv.length} blok nilai; blok disatukan jadi satu parameter.`,
        );
        pasangan = [[bk.join(' '), bv.join(' ')]];
      }
    } else {
      pasangan = [[bk[0] || '', bv[0] || '']];
    }

    for (const [namaMentah, nilaiMentah] of pasangan) {
      const nama = bersihNama(namaMentah);
      const nilaiTeks = (nilaiMentah || '').replace(/^[\s:=]+/, '').trim();
      urut++;
      h.baris++;

      if (!nama && !nilaiTeks) {
        h.takTerurai++;
        anomali(r, 'parameter-kosong', '', 'Nama dan nilai sama-sama kosong setelah HTML dilepas.');
        continue;
      }

      let kualifier = '';
      let nilaiMin = '';
      let nilaiMaks = '';
      let pengali = '';
      let satuan = '';
      let catatan = catatanSel;
      let jenisNilai = '';
      const tambahCatatan = (c) => (catatan = catatan ? `${catatan}; ${c}` : c);

      if (!nilaiTeks) {
        jenisNilai = 'kosong';
        h.takTerurai++;
        anomali(r, 'nilai-kosong', nama, 'Parameter ada, nilainya kosong.');
      } else if (KUALITATIF.test(nilaiTeks)) {
        jenisNilai = 'kualitatif';
        h.kualitatif++;
      } else {
        const m = POLA_NILAI.exec(nilaiTeks);
        if (!m) {
          jenisNilai = 'tak-terurai';
          h.takTerurai++;
          anomali(r, 'nilai-tak-terurai', `${nama} = ${nilaiTeks}`, 'Tidak diawali angka maupun kata kualitatif.');
        } else {
          jenisNilai = 'numerik';
          h.numerik++;
          kualifier = (m.groups.q || '').toLowerCase();
          if (kualifier) h.berkualifier++;
          nilaiMin = keAngka(m.groups.lo);
          nilaiMaks = m.groups.hi ? keAngka(m.groups.hi) : nilaiMin;
          if (m.groups.hi) h.rentang++;
          for (const angka of [m.groups.lo, m.groups.hi]) {
            if (angkaAmbigu(angka)) {
              h.titikAmbigu++;
              tambahCatatan('titik-ambigu');
              anomali(
                r,
                'titik-ambigu',
                `${nama} = ${nilaiTeks}`,
                `"${angka}" dibaca sebagai desimal; tanpa koma di mana pun, titik yang diikuti tepat tiga angka bisa juga pemisah ribuan.`,
              );
            }
          }
          let sisa = (m.groups.sisa || '').trim();
          const mp = POLA_PENGALI.exec(sisa);
          if (mp) {
            pengali = Math.pow(10, Number(mp.groups.p));
            sisa = (mp.groups.sisa || '').trim();
            h.pengali++;
          } else if (POLA_PENGALI_TANPA_PANGKAT.test(sisa)) {
            h.pengaliAmbigu++;
            tambahCatatan('pengali-tanpa-pangkat');
            anomali(
              r,
              'pengali-tanpa-pangkat',
              `${nama} = ${nilaiTeks}`,
              'Sumbernya menulis "x 10n" tanpa tag <sup>; pangkatnya tidak bisa dipastikan, jadi tidak diisi.',
            );
          }
          satuan = sisa;
          if (!satuan) h.tanpaSatuan++;
          else if (!SATUAN_LAZIM.test(satuan)) {
            h.satuanTakLazim++;
            tambahCatatan('satuan-tak-lazim');
            anomali(r, 'satuan-tak-lazim', `${nama} = ${nilaiTeks}`, `Satuan terbaca "${satuan}"; angkanya kemungkinan tidak utuh.`);
          }
        }
      }

      if (jenisNilai === 'numerik' || jenisNilai === 'kualitatif') adaTerurai = true;

      const kunci = kunciParameter(nama);
      if (!inventaris.has(kunci))
        inventaris.set(kunci, { varian: new Map(), baris: 0, produk: new Set(), satuan: new Map() });
      const inv = inventaris.get(kunci);
      inv.varian.set(nama, (inv.varian.get(nama) || 0) + 1);
      inv.baris++;
      inv.produk.add(produkId || `${nomor}#${i}`);
      if (satuan) inv.satuan.set(satuan, (inv.satuan.get(satuan) || 0) + 1);
      if (satuan) satuanSemua.set(satuan, (satuanSemua.get(satuan) || 0) + 1);

      barisKomposisi.push([
        nomor, produkId, merk, (r.perusahaanName || '').trim(),
        (r.jenisName || '').trim(), (r.bentuk_formula || '').trim(),
        urut, nama, kunci, nilaiTeks, jenisNilai, kualifier,
        nilaiMin === '' ? '' : nilaiMin, nilaiMaks === '' ? '' : nilaiMaks,
        pengali, satuan, catatan,
      ]);
    }
  }
  if (adaTerurai) h.produkPunyaParameterTerurai++;
}

// ---------------------------------------------------------------------------
// Inventaris parameter — bahan tinjauan, bukan pemetaan yang sudah diputuskan
// ---------------------------------------------------------------------------
const urutStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const barisInventaris = [...inventaris.entries()]
  .sort((a, b) => b[1].baris - a[1].baris || urutStr(a[0], b[0]))
  .map(([kunci, v]) => {
    const varian = [...v.varian.entries()].sort((a, b) => b[1] - a[1] || urutStr(a[0], b[0]));
    const satuan = [...v.satuan.entries()].sort((a, b) => b[1] - a[1] || urutStr(a[0], b[0]));
    return [
      kunci,
      varian.length,
      varian.map(([n, c]) => `${n} (${c})`).join(' | '),
      v.baris,
      v.produk.size,
      satuan.length,
      satuan.slice(0, 5).map(([n, c]) => `${n} (${c})`).join(' | '),
    ];
  });

const kelompokAgresif = new Set();
for (const kunci of inventaris.keys()) kelompokAgresif.add(kunciAgresif(kunci));

// ---------------------------------------------------------------------------
// Tulis & laporkan
// ---------------------------------------------------------------------------
const berkas = [
  ['komposisi_pupuk.csv', csv(
    ['nomor_pendaftaran','produk_id','merk_dagang','pemegang_pendaftaran','jenis_pupuk','bentuk_formula','urutan','parameter','parameter_kunci','nilai_teks','jenis_nilai','kualifier','nilai_min','nilai_maks','pengali','satuan','catatan'],
    barisKomposisi)],
  ['komposisi_pupuk_parameter.csv', csv(
    ['parameter_kunci','jml_varian','varian','jml_baris','jml_produk','jml_satuan','satuan_terbanyak'],
    barisInventaris)],
  ['komposisi_pupuk_anomali.csv', csv(
    ['nomor_pendaftaran','merk_dagang','jenis_anomali','teks','keterangan'], barisAnomali)],
];

const persen = (a, b) => (b ? ((100 * a) / b).toFixed(2) : '0.00');

console.log(`Produk pupuk (basis SIMPEL)          : ${h.produk}`);
console.log(`  punya hasilAnalisaUji tak kosong   : ${h.produkPunyaAnalisa} (${persen(h.produkPunyaAnalisa, h.produk)}%)`);
console.log(`  punya sedikitnya satu parameter terurai: ${h.produkPunyaParameterTerurai} (${persen(h.produkPunyaParameterTerurai, h.produk)}%)`);
console.log('');
console.log('SEL {key,value} DAN BARIS PARAMETER');
console.log(`  sel mentah                         : ${h.sel}`);
console.log(`  sel berisi lebih dari satu blok <p>: ${h.selMajemuk} (sepadan ${h.selMajemukSepadan}, tak sepadan ${h.selMajemukTakSepadan})`);
console.log(`  parameter yang terungkap dari sel majemuk: +${h.parameterTambahanDariSelMajemuk}`);
console.log(`  parameter sesudah pemecahan blok   : ${h.baris}`);
console.log(`  baris ditulis ke CSV               : ${barisKomposisi.length} (${h.baris - barisKomposisi.length} dilewati: nama dan nilai sama-sama kosong)`);
console.log('');
console.log('URAIAN NILAI');
console.log(`  numerik                            : ${h.numerik} (${persen(h.numerik, h.baris)}%)`);
console.log(`  kualitatif (Positif/Negatif)       : ${h.kualitatif}`);
console.log(`  tak terurai / kosong               : ${h.takTerurai}`);
console.log(`  rentang (a - b)                    : ${h.rentang}`);
console.log(`  berkualifier (min./maks./<)        : ${h.berkualifier}`);
console.log(`  tanpa satuan (mis. pH, C/N)        : ${h.tanpaSatuan}`);
console.log(`  pakai pengali 10^n                 : ${h.pengali}`);
console.log(`  pengali tanpa tag <sup> (ambigu)   : ${h.pengaliAmbigu}`);
console.log(`  titik desimal ambigu (x.yyy)       : ${h.titikAmbigu}`);
console.log(`  satuan tak lazim (ditandai)        : ${h.satuanTakLazim}`);
console.log('');
console.log('SEBARAN NAMA PARAMETER');
console.log(`  nama mentah unik                   : ${new Set(barisKomposisi.map((b) => b[7])).size}`);
console.log(`  parameter_kunci unik (huruf & spasi diseragamkan): ${inventaris.size}`);
console.log(`  kalau spasi & tanda hubung IKUT dibuang: ${kelompokAgresif.size} kelompok — selisih ${inventaris.size - kelompokAgresif.size} pasang nama menunggu putusan manusia, TIDAK digabung di sini`);
console.log(`  satuan unik                        : ${satuanSemua.size}`);
console.log('');
console.log('ANOMALI (tercatat, tidak dibuang)');
const perJenis = new Map();
for (const a of barisAnomali) perJenis.set(a[2], (perJenis.get(a[2]) || 0) + 1);
for (const j of [...perJenis.keys()].sort(urutStr)) console.log(`  ${j.padEnd(28)}: ${perJenis.get(j)}`);
console.log(`  ${'TOTAL'.padEnd(28)}: ${barisAnomali.length}`);
if (prd.catatan) console.log(`\nCatatan: ${prd.catatan}`);
console.log(`\nSumber: pukpes_data/raw/pupuk_terdaftar.json, tarikan ${TANGGAL_TARIK}.`);

if (!tulis) {
  console.log('\nPeriksa saja. Jalankan dengan --tulis untuk menyimpan ke pukpes_data/:');
  for (const [n, isi] of berkas) console.log(`  ${n.padEnd(34)} ${(Buffer.byteLength(isi) / 1024).toFixed(1)} KB`);
} else {
  for (const [n, isi] of berkas) {
    writeFileSync(join(KELUAR, n), isi);
    console.log(`Ditulis: pukpes_data/${n} (${(Buffer.byteLength(isi) / 1024).toFixed(1)} KB)`);
  }
}
