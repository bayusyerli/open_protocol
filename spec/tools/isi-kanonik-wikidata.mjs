// Mengisi `kanonik` pada baris padanan-bahan-aktif.json yang belum bernama internasional,
// dari panen Wikidata di wikidata_data/bahan-aktif-wikidata.json.
//
//   node tools/isi-kanonik-wikidata.mjs            laporan saja, tidak menulis
//   node tools/isi-kanonik-wikidata.mjs --tulis    tulis ke vocab/padanan-bahan-aktif.json
//   node tools/isi-kanonik-wikidata.mjs --ukur     berapa pendaftaran yang bisa diperiksa
//
// ---------------------------------------------------------------------------
// Duduk perkaranya
// ---------------------------------------------------------------------------
// Tabel padanan lahir dari deklarasi registri sendiri, dan itu benar: 597 nama kanonik
// datang dari kurung seperti "Sipermetrin (cypermethrin)". Tetapi 476 kunci tidak pernah
// dituliskan nama internasionalnya oleh registri — tiametoksam, paklobutrazol, metribuzin —
// sehingga tidak bisa di-join ke daftar larangan, ke MRL, maupun ke sumber internasional
// mana pun. Bobotnya 10% pemakaian tapi 30% kunci, dan 799 pendaftaran (10,4%) sama sekali
// tidak bisa diperiksa karena tak satu pun bahannya beridentitas.
//
// ---------------------------------------------------------------------------
// Kenapa alat ini terpisah dari penyusunnya
// ---------------------------------------------------------------------------
// `susun-padanan-bahan-aktif.mjs` MENULIS ULANG berkasnya dari nol tiap kali dijalankan.
// Alat ini lapisan sesudahnya, dan sengaja dibuat IDEMPOTEN: ia mengembalikan dulu baris
// yang pernah diisinya ke keadaan semula, baru memutuskan lagi dari nol. Akibatnya urutan
// menjalankan tidak berpengaruh, dan sesi yang belakangan tinggal memutarnya lagi di atas
// hasil sesi yang duluan — tidak ada penggabungan tangan. Yang TIDAK pernah disentuh alat
// ini: baris yang sudah bernama kanonik dari deklarasi registri, dan medan `induk`.
//
// ---------------------------------------------------------------------------
// Kecocokan salah lebih buruk daripada kosong
// ---------------------------------------------------------------------------
// Mencocokkan transliterasi Indonesia ke basis pengetahuan umum jauh lebih longgar
// daripada mencocokkan ke daftar pestisida terbitan. Jaringnya karena itu dilonggarkan
// (lihat lipat-ejaan.mjs) dan penyaringnya diketatkan: SETIAP kecocokan wajib dikuatkan
// sedikitnya satu bukti di luar kemiripan nama, dan lima pintu di bawah ini menolak
// sebelum sampai ke sana.
//
//   nihil             tak satu pun entitas Wikidata berbentuk lipat sama
//   bukan-agrokimia   ada, tapi Wikidata tidak menyebutnya agrokimia. "matrin" bertemu
//                     "Matrix metallopeptidase 7" — sebuah protein. Ditolak.
//   ambigu            lebih dari satu entitas agrokimia berbentuk lipat sama
//   bentuk-turunan    yang bertemu garam/ester/stereoisomer. Baris itu wajib menyebut
//                     induknya, dan induk hanya boleh datang dari klausa "setara dengan"
//                     milik registri — bukan dari sini
//   beda-peran        registri menyebutnya herbisida, Wikidata menyebutnya fungisida.
//                     Ditolak DAN dilaporkan: ketidakcocokannya sendiri sebuah temuan

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { kunciUrut, bentukTurunan } from './lipat-ejaan.mjs';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PADANAN = join(AKAR, 'spec', 'vocab', 'padanan-bahan-aktif.json');
const PANEN = join(AKAR, 'wikidata_data', 'bahan-aktif-wikidata.json');
const REGISTRI = join(AKAR, 'pukpes_data', 'raw', 'pestisida_terdaftar.json');

// Kalimat yang ditulis penyusunnya untuk baris yang tak terpetakan. Disalin ke sini karena
// alat ini harus bisa MENGEMBALIKAN baris ke keadaan itu supaya idempoten.
const ALASAN_KOSONG = 'Registri tidak pernah menuliskan nama internasional untuk tulisan ini, dan pelipatan ortografisnya tidak bertemu satu pun nama yang dideklarasikan registri. Dibiarkan kosong; jangan dicocokkan dengan kemiripan atau jarak edit.';

// Peran umum tidak membedakan apa-apa — hampir setiap agrokimia menyandangnya — sehingga
// tidak bisa dipakai memeriksa kecocokan terhadap jenis pestisida menurut registri.
const PERAN_UMUM = new Set(['pesticide', 'agrochemical', 'biocide']);

// Peta jenis pestisida menurut registri ke peran Wikidata yang boleh menyertainya.
// Longgar dengan sengaja: satu bahan sering berperan ganda (paklobutrazol fungisida DAN
// zat pengatur tumbuh), dan yang dicari di sini bukan kesamaan melainkan PERTENTANGAN.
// `null` berarti jenisnya sendiri tidak menyempitkan apa pun.
const IZIN_PERAN = {
  Insektisida: ['insecticide', 'larvicide', 'ovicide', 'acaricide', 'Insect growth regulator', 'biopesticide', 'fumigant', 'nematicide'],
  Herbisida: ['herbicide', 'plant growth regulator', 'plant hormone', 'auxin', 'cytokinin', 'defoliant', 'desiccant'],
  Fungisida: ['fungicide', 'bactericide', 'virucide', 'biopesticide', 'algaecide'],
  Bakterisida: ['bactericide', 'fungicide', 'virucide', 'algaecide', 'biopesticide'],
  Akarisida: ['acaricide', 'insecticide', 'larvicide', 'ovicide', 'Insect growth regulator'],
  Nematisida: ['nematicide', 'insecticide', 'fumigant', 'biopesticide'],
  Moluskisida: ['molluscicide', 'insecticide', 'biopesticide'],
  Rodentisida: ['rodenticide', 'avicide'],
  'Zat Pengatur Tumbuh Tanaman': ['plant growth regulator', 'plant hormone', 'auxin', 'cytokinin', 'herbicide', 'fungicide', 'defoliant', 'desiccant'],
  Repelen: ['repellent', 'insect repellent', 'insecticide', 'larvicide'],
  'Atraktan / Feromon': ['attractant', 'pheromone', 'insecticide'],
  Fumigan: ['fumigant', 'insecticide', 'nematicide', 'fungicide', 'rodenticide', 'molluscicide'],
  'Bahan pengawet kayu': ['fungicide', 'insecticide', 'bactericide', 'algaecide', 'biopesticide'],
  'Pestisida Rumah Tangga': ['insecticide', 'larvicide', 'ovicide', 'rodenticide', 'repellent', 'insect repellent', 'acaricide', 'fungicide', 'bactericide', 'molluscicide', 'attractant', 'pheromone', 'avicide', 'Insect growth regulator', 'fumigant'],
  'Pestisida Pengendalian Vektor Penyakit Pada Manusia': ['insecticide', 'larvicide', 'ovicide', 'repellent', 'insect repellent', 'acaricide', 'Insect growth regulator', 'attractant', 'pheromone', 'molluscicide', 'piscicide'],
  'Pestisida lain-lain': null,
  'Pestisida untuk peternakan': null,
};

const URUT_BAHASA = { en: 0, mul: 1, ms: 2, id: 3 };
const INTERNASIONAL = new Set(['en', 'mul']);
const kunciMentah = (s) => String(s).replace(/ /g, ' ').toLowerCase().replace(/\s+/g, ' ').trim();

// ---------------------------------------------------------------------------
// 1. Jenis pestisida per kunci, dari registri sendiri — penguat terkuat dan gratis
// ---------------------------------------------------------------------------
function jenisPerKunci() {
  const baris = JSON.parse(readFileSync(REGISTRI, 'utf8'));
  const unik = new Map();
  for (const r of baris) if (!unik.has(r.id)) unik.set(r.id, r);
  const peta = new Map();
  for (const r of unik.values()) {
    let ba = [];
    try { ba = r.bahanAktif ? JSON.parse(r.bahanAktif) : []; } catch { ba = []; }
    for (const b of ba) {
      if (!b?.namaBahan) continue;
      const k = kunciMentah(b.namaBahan);
      if (!peta.has(k)) peta.set(k, new Map());
      const m = peta.get(k);
      m.set(r.JenisPestisidaNama, (m.get(r.JenisPestisidaNama) ?? 0) + 1);
    }
  }
  return { peta, unik };
}

// ---------------------------------------------------------------------------
// 2. Indeks panen
// ---------------------------------------------------------------------------
function indeksPanen(panen) {
  const ent = new Map();
  const idx = new Map();
  for (const e of panen.entitas) {
    ent.set(e.qid, e);
    for (const n of e.nama) {
      if (n.teks.length < 4) continue;
      const [f] = kunciUrut(n.teks);
      if (!f) continue;
      if (!idx.has(f)) idx.set(f, new Set());
      idx.get(f).add(e.qid);
    }
  }
  return { ent, idx };
}

const akarPeran = (e) => new Set(e.peran.flatMap((p) => p.akar));
const agrokimia = (e) => akarPeran(e).size > 0 || e.pinfo.length > 0;

// Nama bukti = nama yang bentuk lipatnya bertemu kunci. Nama kanonik = nama internasional
// entitas itu. Keduanya bisa berbeda: kalau yang bertemu hanya label Indonesia-nya,
// nama internasionalnya diambil dari label en/mul entitas yang SAMA — dan barisnya
// ditandai perlu_tinjau, karena ejaan yang dipakai untuk mengenali bukan ejaan yang dicatat.
function pilihNama(e, fold) {
  const cocok = e.nama.filter((n) => kunciUrut(n.teks)[0] === fold)
    .sort((a, b) => (a.jenis === b.jenis ? 0 : a.jenis === 'label' ? -1 : 1)
      || (URUT_BAHASA[a.lang] ?? 9) - (URUT_BAHASA[b.lang] ?? 9)
      || (a.teks === a.teks.toLowerCase() ? 0 : 1) - (b.teks === b.teks.toLowerCase() ? 0 : 1)
      || a.teks.localeCompare(b.teks));
  if (!cocok.length) return null;
  const intl = cocok.filter((n) => INTERNASIONAL.has(n.lang));
  if (intl.length) {
    const kecil = intl.filter((n) => n.teks === n.teks.toLowerCase());
    const p = (kecil.length ? kecil : intl)[0];
    return { bukti: p, nama: p.teks, lewatLabelIndonesia: false };
  }
  const label = e.nama.filter((n) => n.jenis === 'label' && INTERNASIONAL.has(n.lang))
    .sort((a, b) => (URUT_BAHASA[a.lang] ?? 9) - (URUT_BAHASA[b.lang] ?? 9) || a.teks.localeCompare(b.teks));
  if (!label.length) return null;
  return { bukti: cocok[0], nama: label[0].teks, lewatLabelIndonesia: true };
}

// ---------------------------------------------------------------------------
// 3. Putusan per kunci
// ---------------------------------------------------------------------------
function putuskan(r, { idx, ent, jenis, indukAgro }) {
  const [fold, aturan] = kunciUrut(r.kunci);
  const calon = [...(idx.get(fold) ?? [])].sort();
  if (!calon.length) return { kode: 'nihil' };
  const lolos = calon.filter((q) => agrokimia(ent.get(q)));
  if (!lolos.length) return { kode: 'bukan-agrokimia', calon };
  if (lolos.length > 1) return { kode: 'ambigu', calon: lolos };
  const e = ent.get(lolos[0]);
  const p = pilihNama(e, fold);
  if (!p) return { kode: 'tanpa-nama-internasional', calon: lolos };
  const td = bentukTurunan(p.nama, (f) => indukAgro.has(f)) ?? bentukTurunan(r.kunci, (f) => indukAgro.has(f));
  if (td) return { kode: 'bentuk-turunan', calon: lolos, nama: p.nama, bentuk: td };

  const akar = akarPeran(e);
  const spesifik = [...akar].filter((a) => !PERAN_UMUM.has(a)).sort();
  const reg = [...(jenis.get(r.kunci) ?? new Map()).keys()].sort();
  let bebas = false; const izin = new Set();
  for (const j of reg) {
    const d = Object.prototype.hasOwnProperty.call(IZIN_PERAN, j) ? IZIN_PERAN[j] : null;
    if (d === null) bebas = true; else for (const a of d) izin.add(a);
  }
  const bisaDiuji = spesifik.length > 0 && !bebas;
  const cocokJenis = bisaDiuji && spesifik.some((a) => izin.has(a));
  if (bisaDiuji && !cocokJenis) return { kode: 'beda-peran', calon: lolos, nama: p.nama, spesifik, reg };

  // Aturan pelipatan hanya dihitung kalau ia memang MEMPERTEMUKAN dua ejaan yang berbeda.
  // "metribuzin" ditulis sama di kedua sisi; menyebut E12 di situ akan terbaca seolah ada
  // transliterasi yang menanggung kecocokannya, padahal tidak ada. Yang dihitung gabungan
  // aturan yang menyala di kedua sisi — sisi Indonesia sering tidak menyalakan apa pun,
  // karena yang berubah justru ejaan internasionalnya (methoxyfenozide → metoksifenosida).
  const aturanDipakai = kunciMentah(p.bukti.teks) === r.kunci
    ? [] : [...new Set([...aturan, ...kunciUrut(p.bukti.teks)[1]])].sort();

  const penguat = [];
  if (akar.size) penguat.push('peran-wikidata');
  if (e.pinfo.length) penguat.push('basis-pestisida-wikidata');
  if (cocokJenis) penguat.push('jenis-registri');
  if (p.lewatLabelIndonesia) penguat.push('label-indonesia');
  if (aturanDipakai.length) penguat.push('aturan-ejaan');
  return { kode: 'terima', e, p, fold, aturanDipakai, penguat, spesifik, reg, akar: [...akar].sort() };
}

// ---------------------------------------------------------------------------
// 4. Terapkan
// ---------------------------------------------------------------------------
const URUT_MEDAN = ['kunci', 'tulisan_teramati', 'formulasi', 'substance', 'hubungan', 'bentuk',
  'induk', 'kanonik', 'kesetaraan', 'wikidata', 'dasar', 'alasan', 'catatan'];
const rapikan = (r) => {
  const o = {};
  for (const k of URUT_MEDAN) if (r[k] !== undefined) o[k] = r[k];
  for (const k of Object.keys(r)) if (!(k in o)) o[k] = r[k];
  return o;
};

function terapkan(pad, panen, jenis) {
  const { ent, idx } = indeksPanen(panen);
  const indukAgro = new Set(panen.wikidata.fold_induk_agrokimia ?? []);
  const rekap = new Map();
  let diserahkan = 0;
  const laporan = { terima: [], tolak: [] };

  for (let i = 0; i < pad.padanan_items.length; i++) {
    const r = pad.padanan_items[i];
    // Kembalikan dulu baris yang pernah diisi alat ini — supaya putusannya dihitung dari
    // nol tiap kali, bukan ditumpuk di atas putusan lama yang mungkin sudah tidak berlaku.
    // Kalau sesi lain sudah mengambil alih baris ini — menambahkan `induk`, `bentuk`, atau
    // faktor kesetaraan di atasnya — alat ini menyingkir sepenuhnya. Buktinya milik jalur
    // induk lebih kuat daripada milik jalur ini: ia datang dari klausa "setara dengan"
    // registri sendiri, bukan dari pelipatan ejaan ke basis pengetahuan umum.
    if (r.kanonik?.dasar === 'wikidata' && (r.induk || r.bentuk || r.kesetaraan)) {
      diserahkan++;
      continue;
    }
    if (r.kanonik?.dasar === 'wikidata') {
      delete r.kanonik; delete r.wikidata;
      r.hubungan = 'belum-terpetakan';
      r.alasan = ALASAN_KOSONG;
      pad.padanan_items[i] = rapikan(r);
    }
    if (r.hubungan !== 'belum-terpetakan') continue;

    const p = putuskan(r, { idx, ent, jenis, indukAgro });
    rekap.set(p.kode, (rekap.get(p.kode) ?? 0) + 1);
    if (p.kode !== 'terima') {
      laporan.tolak.push({ kunci: r.kunci, formulasi: r.formulasi, ...p });
      continue;
    }
    const { e, penguat, aturanDipakai, spesifik, reg, akar } = p;
    const nama = p.p.nama;
    const properti = [...new Set([p.p.bukti.jenis === 'label' ? 'rdfs:label' : 'skos:altLabel',
      ...e.peran.filter((x) => x.akar.length).map((x) => x.properti),
      ...(e.pinfo.length ? ['P11949'] : [])])].sort();
    const peranTeks = e.peran.filter((x) => x.akar.length)
      .map((x) => `${x.properti} → ${x.label} (${x.qid})`).join('; ')
      || (e.pinfo.length ? `P11949 → ${e.pinfo[0]}` : '');

    r.hubungan = kunciMentah(nama) === r.kunci ? 'sama-dengan' : 'varian-ejaan';
    delete r.alasan;
    r.kanonik = {
      nama,
      dasar: 'wikidata',
      kutipan: `Wikidata ${e.qid} ${p.p.bukti.jenis === 'label' ? 'rdfs:label' : 'skos:altLabel'} "${p.p.bukti.teks}"@${p.p.bukti.lang}; ${peranTeks}; registri: ${reg.join(', ')}`,
    };
    if (p.p.lewatLabelIndonesia) {
      r.kanonik.perlu_tinjau = true;
      r.kanonik.catatan_tinjau = `Yang bertemu kunci ini label Wikidata berbahasa ${p.p.bukti.lang} ("${p.p.bukti.teks}"), bukan label internasionalnya. Nama yang dicatat diambil dari label en/mul entitas yang sama, sehingga ejaan yang dipakai mengenali berbeda dari ejaan yang direkam — periksa bahwa keduanya memang bahan yang sama sebelum dipakai menyambung larangan atau MRL.`;
    }
    r.wikidata = {
      qid: e.qid,
      properti,
      penguat,
      ...(aturanDipakai.length ? { aturan_ejaan: aturanDipakai } : {}),
      nama_bukti: { teks: p.p.bukti.teks, jenis: p.p.bukti.jenis, bahasa: p.p.bukti.lang || 'tanpa-bahasa' },
      peran: e.peran.filter((x) => x.akar.length).map((x) => ({ properti: x.properti, qid: x.qid, label: x.label })),
      peran_akar: spesifik,
      jenis_registri: reg,
    };
    if (e.cas.length) r.wikidata.cas = e.cas;
    pad.padanan_items[i] = rapikan(r);
    laporan.terima.push({ kunci: r.kunci, formulasi: r.formulasi, qid: e.qid, nama, penguat, spesifik, reg, akar });
  }
  if (diserahkan) rekap.set('diserahkan-ke-jalur-induk', diserahkan);
  return { rekap, laporan };
}

// ---------------------------------------------------------------------------
// 5. Hitungan kepala, ditulis ulang dari isinya
// ---------------------------------------------------------------------------
function hitungUlang(pad) {
  const it = pad.padanan_items;
  const sebaran = new Map();
  for (const r of it) sebaran.set(r.hubungan, (sebaran.get(r.hubungan) ?? 0) + 1);
  pad.padanan.hitungan = {
    kunci: it.length,
    formulasi: pad.padanan.hitungan.formulasi,
    per_hubungan: Object.fromEntries([...sebaran].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
    berkanonik: it.filter((r) => r.kanonik?.nama).length,
    berinduk: it.filter((r) => r.induk).length,
    berfaktor: it.filter((r) => r.kesetaraan?.faktor).length,
    perlu_tinjau: it.filter((r) => r.kanonik?.perlu_tinjau || r.induk?.perlu_tinjau || r.kesetaraan?.perlu_tinjau).length,
  };
}

// Kepala berkas menyatakan bahwa TIDAK ADA nama dari pihak lain yang disalin. Sesudah alat
// ini dijalankan pernyataan itu tidak benar lagi, dan membiarkannya akan lebih buruk
// daripada padanan yang salah — ia menyesatkan tentang lisensinya. Penambalannya idempoten.
const KALIMAT_LAMA = 'Tidak ada daftar nama umum milik pihak lain yang disalin ke berkas ini, sehingga isinya bebas dipakai ulang seperti sisa repositori. Konsekuensinya jelas dan sengaja: bahan yang nama internasionalnya tidak pernah dituliskan registri tetap kosong.';
const KALIMAT_BARU = 'Sisa kunci yang tidak pernah dituliskan nama internasionalnya oleh registri ditutup dari Wikidata (CC0, boleh direkam ulang) lewat tools/isi-kanonik-wikidata.mjs, dengan `kanonik.dasar` = "wikidata" dan Q-id-nya terekam di `wikidata` supaya tiap kecocokan bisa ditelusuri ulang; tidak ada basis pestisida berlisensi pembatas yang disalin, sehingga isinya tetap bebas dipakai ulang seperti sisa repositori. Konsekuensinya jelas dan sengaja: kunci yang bahkan Wikidata tidak mengenalinya sebagai agrokimia tetap kosong beralasan.';

function tambalKepala(pad, panen) {
  const s = pad.padanan.scope.id;
  if (s.includes(KALIMAT_LAMA)) pad.padanan.scope.id = s.replace(KALIMAT_LAMA, KALIMAT_BARU);
  const sumber = pad.padanan.provenance.sources;
  const judul = 'Wikidata — identitas kimia bahan aktif';
  const baru = {
    title: judul,
    publisher: 'Wikimedia Foundation',
    url: panen.wikidata.panen.endpoint,
    year: Number(String(panen.wikidata.lifecycle.created_at).slice(0, 4)),
    locator: `wikidata_data/bahan-aktif-wikidata.json — ${panen.entitas.length} entitas, ditarik ${panen.wikidata.lifecycle.created_at}. Properti: P366 (has use), P2868 (subject has role), P279, P31, P11949 (PesticideInfo chemical ID), P231 (CAS), rdfs:label, skos:altLabel. Lisensi CC0, boleh direkam ulang. Dipakai HANYA untuk baris yang registrinya sendiri tidak pernah menuliskan nama internasionalnya, dan tiap kecocokan wajib dikuatkan peran agrokimia Wikidata yang tidak bertentangan dengan JenisPestisidaNama registri.`,
  };
  const i = sumber.findIndex((x) => x.title === judul);
  if (i >= 0) sumber[i] = baru; else sumber.push(baru);
}

// ---------------------------------------------------------------------------
// 6. Pengukuran: berapa pendaftaran yang seluruh/sebagian/tak satu pun bahannya beridentitas
// ---------------------------------------------------------------------------
function ukur(pad, unik) {
  const peta = new Map(pad.padanan_items.map((r) => [r.kunci, r]));
  const punya = (r) => Boolean(r && (r.kanonik?.nama || r.induk?.nama));
  const c = { seluruh: 0, sebagian: 0, tidak: 0, tanpa_bahan: 0 };
  for (const r of unik.values()) {
    let ba = [];
    try { ba = r.bahanAktif ? JSON.parse(r.bahanAktif) : []; } catch { ba = []; }
    const nama = ba.map((b) => b?.namaBahan).filter(Boolean);
    if (!nama.length) { c.tanpa_bahan++; continue; }
    const f = nama.map((n) => punya(peta.get(kunciMentah(n))));
    if (f.every(Boolean)) c.seluruh++;
    else if (f.some(Boolean)) c.sebagian++;
    else c.tidak++;
  }
  c.total = c.seluruh + c.sebagian + c.tidak;
  return c;
}

// ===========================================================================
const pad = JSON.parse(readFileSync(PADANAN, 'utf8'));
const panen = JSON.parse(readFileSync(PANEN, 'utf8'));
const { peta: jenis, unik } = jenisPerKunci();

const sebelum = ukur(pad, unik);
const { rekap, laporan } = terapkan(pad, panen, jenis);
hitungUlang(pad);
tambalKepala(pad, panen);
const sesudah = ukur(pad, unik);

const pct = (n, t) => `${((100 * n) / t).toFixed(1)}%`;
console.log(`\nKunci belum terpetakan diperiksa : ${[...rekap.values()].reduce((a, b) => a + b, 0)}`);
for (const [k, v] of [...rekap].sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log(`\nBerkanonik : ${pad.padanan.hitungan.berkanonik} dari ${pad.padanan.hitungan.kunci}`);
console.log('\nPendaftaran (dedup id) yang bahan aktifnya beridentitas:');
for (const k of ['seluruh', 'sebagian', 'tidak']) {
  console.log(`  ${k.padEnd(9)} ${String(sebelum[k]).padStart(5)} (${pct(sebelum[k], sebelum.total)})  ->  ${String(sesudah[k]).padStart(5)} (${pct(sesudah[k], sesudah.total)})`);
}

if (process.argv.includes('--laporan')) {
  const perPenguat = new Map();
  for (const t of laporan.terima) for (const g of t.penguat) perPenguat.set(g, (perPenguat.get(g) ?? 0) + 1);
  console.log('\n--- penguat yang menyala ---');
  for (const [k, v] of [...perPenguat].sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
  console.log('\n--- ketidakcocokan peran registri vs Wikidata (ditolak) ---');
  for (const t of laporan.tolak.filter((x) => x.kode === 'beda-peran')) {
    console.log(`  ${String(t.formulasi).padStart(4)}  ${t.kunci} -> ${t.nama}: Wikidata ${t.spesifik.join('/')} vs registri ${t.reg.join('/')}`);
  }
  console.log('\n--- bentuk turunan, diserahkan ke jalur induk ---');
  for (const t of laporan.tolak.filter((x) => x.kode === 'bentuk-turunan')) console.log(`  ${String(t.formulasi).padStart(4)}  ${t.kunci} -> ${t.nama} (${t.bentuk})`);
  console.log('\n--- nama mirip, entitasnya bukan agrokimia (ditolak) ---');
  for (const t of laporan.tolak.filter((x) => x.kode === 'bukan-agrokimia')) console.log(`  ${String(t.formulasi).padStart(4)}  ${t.kunci} -> ${t.calon.join(' ')}`);
  console.log('\n--- ambigu ---');
  for (const t of laporan.tolak.filter((x) => x.kode === 'ambigu')) console.log(`  ${String(t.formulasi).padStart(4)}  ${t.kunci} -> ${t.calon.join(' ')}`);
  console.log('\n--- terisi ---');
  for (const t of [...laporan.terima].sort((a, b) => b.formulasi - a.formulasi)) {
    console.log(`  ${String(t.formulasi).padStart(4)}  ${t.kunci.padEnd(34)} -> ${t.nama.padEnd(36)} ${t.qid.padEnd(11)} ${t.penguat.join(',')}`);
  }
}

if (process.argv.includes('--tulis')) {
  writeFileSync(PADANAN, `${JSON.stringify(pad, null, 2)}\n`);
  console.log(`\nDitulis ke ${PADANAN}`);
} else {
  console.log('\n(tidak ditulis — tambahkan --tulis)');
}
