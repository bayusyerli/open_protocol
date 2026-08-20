// Memeriksa setiap klaim berangka di docs/03 sampai docs/09 terhadap datanya.
//
//   node spec/tools/cek-angka-docs.mjs
//
// KENAPA ALAT INI ADA
// Dokumen jalur memuat lebih dari lima puluh angka, dan tiap penggabungan kosakata
// menggeser sebagiannya. Pemeriksaan tangan sudah dua kali melewatkan yang salah —
// termasuk "PHI 290 dari 23.058", yang ternyata nol dan sempat tersebar ke dua layar
// aplikasi dan ke meta.tidakAda pada indeks.
//
// Angka harapan di bawah adalah yang TERTULIS DI DOKUMEN. Kalau data bergeser, alat
// ini menyebut selisihnya; yang harus diperbaiki bisa dokumennya, bisa juga sondaan
// di sini — dan membedakan keduanya tetap pekerjaan manusia. Dua kekeliruan sondaan
// sudah terjadi dan keduanya ditinggalkan sebagai catatan: pupuk cair dihitung dari
// `formulation`, bukan dari satuan komposisi; dan "Abamektin 18" wajib menyaring
// satuan g/L, karena ada produk berabamektin 18 PERSEN.

import { readFileSync, readdirSync } from 'node:fs';
const L = (o) => (Array.isArray(o) ? o : Object.values(o).find(Array.isArray));
const J = (p) => JSON.parse(readFileSync(p, 'utf8'));
const nd = (p) => readFileSync(p, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));

const P = nd('spec/vocab/product/pestisida.ndjson');
const PU = nd('spec/vocab/product/pupuk.ndjson');
const V = nd('spec/vocab/variety/varietas.ndjson');
const ZAT = L(J('spec/vocab/substance-pestisida.json'));
const KUR = L(J('spec/vocab/pest.json'));
const OPTR = L(J('spec/vocab/pest-registri.json'));
const SED = L(J('spec/vocab/preparation.json'));
const meta = J('spec/indeks/meta.json');
const larangan = J('spec/indeks/larangan.json');

const hidup = (a) => a.filter((e) => e.lifecycle?.status !== 'superseded');
const hasil = [];
const cek = (doc, klaim, nyata, harap) =>
  hasil.push({ doc, klaim, nyata, harap, ok: String(nyata) === String(harap) });

// ---- dasar
cek('semua', 'pestisida terdaftar', P.length, 7724);
cek('semua', 'pupuk terdaftar', PU.length, 7196);
cek('semua', 'varietas', V.length, 11227);
const guna = P.flatMap((p) => p.label_uses ?? []);
cek('04/05', 'penggunaan berlabel', guna.length, 23058);
cek('04', 'tertaut OPT %', ((guna.filter((u) => u.pest?.id).length / guna.length) * 100).toFixed(1), '96.1');
cek('04', 'PHI ada', guna.filter((u) => /\\bPHI\\b|tenggang panen/i.test(JSON.stringify(u))).length, 0);
cek('04', 'OPT registri hidup', hidup(OPTR).length, 768);
cek('04', 'OPT registri bergejala', OPTR.filter((e) => e.symptoms).length, 0);
cek('04', 'OPT terkurasi bergejala', KUR.filter((e) => e.symptoms).length, 10);

// ---- irisan cabai x trips
const CABAI = 'op:cmd:00001003', TRIPS = 'op:pst:00000001', KLOR = 'op:sub:00000105';
const iris = (kom, pst) => {
  const s = new Set(), z = new Set(), zk = new Set(), dl = new Set(), kl = new Set();
  for (const p of P) for (const u of p.label_uses ?? []) if (u.commodity?.id === kom && u.pest?.id === pst) {
    s.add(p.id);
    for (const c of p.composition ?? []) {
      z.add(c.substance.id); zk.add(c.substance.id + c.value + c.unit);
      if (larangan[c.substance.id]) dl.add(p.id);
      if (c.substance.id === KLOR) kl.add(p.id);
    }
  }
  return { produk: s.size, zat: z.size, kartu: zk.size, larangan: dl.size, klor: kl.size };
};
const t = iris(CABAI, TRIPS);
cek('04', 'trips@cabai produk', t.produk, 246);
cek('04', 'trips@cabai bahan aktif', t.zat, 72);
cek('04', 'trips@cabai kartu', t.kartu, 164);
cek('04', 'trips@cabai klorpirifos', t.klor, 14);
cek('04', 'trips@cabai berdaftar-larangan', t.larangan, 34);
const kk = iris(CABAI, 'op:pst:00000003'), ug = iris(CABAI, 'op:pst:00000005');
cek('04', 'kutu kebul@cabai', kk.produk, 32);
cek('04', 'ulat grayak@cabai', ug.produk, 184);
cek('04', 'virus kuning@cabai', iris(CABAI, 'op:pst:00000010').produk, 0);

// ---- larangan menyeluruh
const MEN = 'semua bidang penggunaan pestisida';
const menyeluruh = ZAT.filter((s) => (s.hazard?.regulatory_status ?? []).some((r) => r.jurisdiction === 'ID' && r.status === 'prohibited' && (r.scope ?? []).includes(MEN)));
const dipakai = new Set(P.flatMap((p) => (p.composition ?? []).map((c) => c.substance.id)));
cek('04', 'zat dilarang menyeluruh', menyeluruh.length, 91);
cek('04', 'di antaranya muncul di produk', menyeluruh.filter((s) => dipakai.has(s.id)).length, 0);
const perKom = ZAT.filter((s) => (s.hazard?.regulatory_status ?? []).some((r) => r.jurisdiction === 'ID' && r.status === 'prohibited' && r.commodities?.length));
cek('04', 'zat dilarang khusus komoditas', perKom.length, 31);

// ---- abamektin
const AB = 'op:sub:00000007';
const kadarAb = new Set(P.flatMap((p) => (p.composition ?? []).filter((c) => c.substance.id === AB).map((c) => `${c.value}${c.unit}`)));
cek('04', 'abamektin ragam kadar', kadarAb.size, 33);
const ab18cabai = new Set();
for (const p of P) for (const u of p.label_uses ?? []) if (u.commodity?.id === CABAI && u.pest?.id === TRIPS)
  if ((p.composition ?? []).some((c) => c.substance.id === AB && c.value === 18 && c.unit === 'g/L')) ab18cabai.add(p.id);
cek('04/05', 'abamektin 18 utk trips@cabai', ab18cabai.size, 26);
const ab18semua = new Set();
for (const p of P) if ((p.composition ?? []).length === 1 && p.composition[0].substance.id === AB && p.composition[0].value === 18 && p.composition[0].unit === 'g/L') ab18semua.add(p.id);
cek('05', 'abamektin 18 seluruh registri (tunggal)', ab18semua.size, 58);

// ---- kesetaraan
const sidik = (p, j) => {
  const isi = (p.composition ?? []).map((c) => `${c.substance.id}@${c.value}${c.unit}`).sort().join('|');
  return j === 'pupuk' ? `${isi}#${p.formulation ?? ''}` : isi;
};
const grup = (arr, j) => {
  const m = new Map();
  for (const p of arr) { if (!p.composition?.length) continue; const k = sidik(p, j); (m.get(k) ?? m.set(k, []).get(k)).push(p); }
  return [...m.values()].filter((v) => v.length > 1);
};
const gp = grup(P, 'pestisida'), gu = grup(PU, 'pupuk');
cek('05', 'kelompok setara pestisida', gp.length, 890);
cek('05', 'produk setara pestisida', gp.reduce((a, v) => a + v.length, 0), 4905);
cek('05', 'kesetaraan pestisida %', ((gp.reduce((a, v) => a + v.length, 0) / P.length) * 100).toFixed(1), '63.5');
cek('05/06', 'kelompok setara pupuk', gu.length, 386);
cek('05/06', 'produk setara pupuk', gu.reduce((a, v) => a + v.length, 0), 1904);
cek('05/06', 'pupuk berkomposisi', PU.filter((p) => p.composition?.length).length, 5130);
const besar = [...gp, ...gu].sort((a, b) => b.length - a.length).slice(0, 5).map((v) => v.length);
cek('05/06', 'tiga kelompok terbesar', besar.slice(0, 3).join('/'), '184/144/126');
cek('05', 'komposisi pestisida %', ((P.filter((p) => p.composition?.length).length / P.length) * 100).toFixed(1), '96.4');
cek('05', 'komposisi pupuk %', ((PU.filter((p) => p.composition?.length).length / PU.length) * 100).toFixed(1), '71.3');

// ---- pupuk cair / satuan
const sat = new Map();
for (const p of PU) for (const c of p.composition ?? []) sat.set(c.unit, (sat.get(c.unit) ?? 0) + 1);
cek('06', 'entri g/kg', sat.get('g/kg'), 10822);
cek('06', 'entri g/L', sat.get('g/L'), 2282);
cek('06', 'pupuk cair (formulation)', PU.filter((p) => /cair|liquid/i.test(p.formulation ?? '')).length, 1721);
cek('06', 'pupuk menyebut subsidi', PU.filter((p) => /subsidi/i.test(JSON.stringify(p))).length, 0);

// ---- varietas
const izin = V.flatMap((v) => v.permits ?? []);
const perJenis = (k) => new Set(V.filter((v) => (v.permits ?? []).some((p) => p.kind === k)).map((v) => v.id)).size;
cek('07', 'varietas dgn pelepasan', perJenis('release'), 5822);
cek('07', 'varietas dgn pendaftaran', perJenis('registration'), 5138);
cek('07', 'varietas dgn PVT', perJenis('protection'), 580);
cek('07', 'varietas dgn penamaan', perJenis('naming_approval'), 22);
cek('07', 'entri surat pelepasan', izin.filter((p) => p.kind === 'release').length, 5826);
cek('07', 'pelepasan tanpa tanggal', izin.filter((p) => p.kind === 'release' && !p.decree_date).length, 5801);
cek('07', 'sebutan Pendaftaran Varietas Tanaman', izin.filter((p) => p.kind_label === 'Pendaftaran Varietas Tanaman').length, 4919);
cek('07', 'variety_type terisi', V.filter((v) => v.variety_type).length, 1173);
cek('07', 'varietas >1 jenis surat', V.filter((v) => new Set((v.permits ?? []).map((p) => p.kind)).size > 1).length, 329);
const traits = V.filter((v) => /ketahanan|umur panen|potensi hasil/i.test(JSON.stringify(v)));
cek('03/07', 'sifat agronomi di luar nama pemelihara',
  traits.filter((v) => /ketahanan|umur panen|potensi hasil/i.test(JSON.stringify({ ...v, maintainer: '' }))).length, 0);
cek('07', 'menyebut BPSB (seluruhnya pemelihara)', V.filter((v) => /BPSB/i.test(JSON.stringify(v))).length, 44);

// ---- sediaan
const sisi = (s) => (/pesticide|unclear/.test((s.regulatory?.regime ?? []).join('+')) ? 6 : 5);
cek('08', 'resep sisi pupuk', SED.filter((s) => sisi(s) === 5).length, 7);
cek('09', 'resep sisi pengendali', SED.filter((s) => sisi(s) === 6).length, 5);
cek('09', 'PHI precautionary_default', SED.filter((s) => s.safety?.phi_basis === 'precautionary_default').length, 4);
cek('08/09', 'bahan baku', L(J('spec/vocab/substance-organik.json')).length, 21);
cek('08/09', 'bahan terlarang', L(J('spec/vocab/substance-organik.json')).filter((b) => b.on_farm?.status === 'prohibited').length, 2);

const gagal = hasil.filter((h) => !h.ok);
for (const h of hasil) console.log(`${h.ok ? '  ok  ' : ' BEDA '} ${h.doc.padEnd(7)} ${h.klaim.padEnd(34)} data=${String(h.nyata).padStart(7)}  dokumen=${h.harap}`);
console.log(`\n${hasil.length - gagal.length}/${hasil.length} cocok, ${gagal.length} berbeda`);
