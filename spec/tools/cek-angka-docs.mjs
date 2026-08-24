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
// APA YANG ALAT INI TANGKAP, DAN APA YANG TIDAK
// Angka harapan di bawah DISALIN dari dokumen ke dalam skrip ini — ia tidak dibaca
// dari berkasnya. Akibatnya alat ini punya dua bagian dengan daya yang berbeda:
//
//   1. Lima puluh dua pemeriksaan angka: DATA lawan angka yang tersalin di sini.
//      Menangkap data yang bergeser — tarikan registri baru, penggabungan kosakata —
//      sehingga angka yang dulu benar jadi salah.
//   2. Sapuan teks: menangkap pola angka yang PERNAH salah kalau ia muncul lagi, di
//      docs/, app/, maupun spec/tools/.
//
// Yang TIDAK ditangkap keduanya: angka baru yang salah, ditulis ke dokumen setelah
// ini. Mengubah "26 produk" jadi "99 produk" di docs/05 tidak membuat alat ini
// menyalak, karena harapannya ada di sini, bukan di sana. Menutup lubang itu berarti
// mengurai angka dari prosa, dan prosa ini menulis angka dalam belasan bentuk —
// pekerjaan tersendiri yang belum dikerjakan.
//
// Jadi "52/52 cocok" berarti: data belum bergeser dari yang tercatat di sini. Bukan:
// seluruh angka di dokumen sudah diperiksa ulang.
//
// Dua kekeliruan SONDAAN sudah terjadi dan keduanya ditinggalkan sebagai catatan:
// pupuk cair dihitung dari `formulation`, bukan dari satuan komposisi; dan
// "Abamektin 18" wajib menyaring satuan g/L, karena ada produk berabamektin 18 PERSEN.
// Membedakan "dokumennya salah" dari "sondaannya salah" tetap pekerjaan manusia.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Lintasan diselesaikan dari letak berkas ini, bukan dari cwd — `npm run all`
// berjalan dari spec/, sedangkan yang dibaca ada di akar repositori.
const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dari = (p) => join(akar, p);
const L = (o) => (Array.isArray(o) ? o : Object.values(o).find(Array.isArray));
const J = (p) => JSON.parse(readFileSync(dari(p), 'utf8'));
const nd = (p) => readFileSync(dari(p), 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));

const P = nd('spec/vocab/product/pestisida.ndjson');
const PU = nd('spec/vocab/product/pupuk.ndjson');
const V = nd('spec/vocab/variety/varietas.ndjson');
const ZAT = L(J('spec/vocab/substance-pestisida.json'));
const KUR = L(J('spec/vocab/pest.json'));
const OPTR = L(J('spec/vocab/pest-registri.json'));
const SED = L(J('spec/vocab/preparation.json'));
const BPP = nd('spec/vocab/bpp/bpp.ndjson');
const LAB = nd('spec/vocab/lab/lab.ndjson');
const meta = J('spec/indeks/meta.json');
const larangan = J('spec/indeks/larangan.json');

const hidup = (a) => a.filter((e) => e.lifecycle?.status !== 'superseded');
const hasil = [];
const cek = (doc, klaim, nyata, harap) =>
  hasil.push({ doc, klaim, nyata, harap, ok: String(nyata) === String(harap) });

// ---- hitungan berkas yang dicetak spec/README
// Angka ini basi dua kali dalam sehari: sekali meleset tujuh, dan sekali lagi satu jam
// sesudah dibetulkan karena skema baru masuk. Ia contoh paling murni dari yang dijaga alat
// ini — angka yang benar saat ditulis dan tidak punya apa pun yang memberitahu saat ia
// berhenti benar.
// Balai penyuluhan & laboratorium. Angka keduanya dicetak di docs/15 dan app/toko.html,
// dan keduanya persis jenis angka yang basi diam-diam: sapuan berikutnya menambah balai,
// dan tidak ada yang memberitahu halaman yang mencetaknya.
cek('15', 'balai penyuluhan', BPP.length, 5844);
cek('15', 'kabupaten/kota ber-BPP', new Set(BPP.map((b) => `${b.region?.province}|${b.region?.regency}`)).size, 504);
cek('15', 'laboratorium terakreditasi', LAB.length, 889);
cek('15', 'lab bisa ukur residu pestisida', LAB.filter((x) => x.capabilities?.pesticide_residue).length, 17);

cek('spec/README', 'berkas skema JSON', readdirSync(dari('spec/schema')).filter((f) => f.endsWith('.schema.json')).length, 35);

// ---- wilayah
// Yang dijaga di sini bukan cuma cacahnya melainkan klaim yang bersandar padanya:
// 34 provinsi (bukan 38), 514 kabupaten/kota, dan 167 kode taksa antara BPS & Kemendagri.
const RGN = nd('spec/vocab/region/wilayah.ndjson');
const tingkat = (t) => RGN.filter((x) => x.level === t).length;
cek('22', 'wilayah seluruhnya', RGN.length, 7768);
cek('22', 'provinsi', tingkat('province'), 34);
cek('22', 'kabupaten', tingkat('regency'), 416);
cek('22', 'kota', tingkat('city'), 98);
cek('22', 'kabupaten/kota', tingkat('regency') + tingkat('city'), 514);
cek('22', 'kecamatan', tingkat('district'), 7219);
cek('22', 'nama dirapikan ejaannya', RGN.filter((x) => x.synonyms?.length).length, 10);
{
  // Kode yang sah di kedua sistem sambil menunjuk wilayah berlainan.
  const dagri = new Map();
  for (const x of RGN) {
    const d = x.mappings?.find((m) => m.scheme === 'KEMENDAGRI')?.id;
    if (d) dagri.set(d.replace(/\D/g, ''), x.id);
  }
  const taksa = RGN.filter((x) => x.code_scheme === 'BPS' && dagri.has(x.code) && dagri.get(x.code) !== x.id);
  cek('22', 'kode taksa BPS vs Kemendagri', taksa.length, 167);
}
// Sambungan BPP → wilayah. Mutu tautan kecamatan dijaga per kelas, bukan sebagai satu
// angka: "6.737 tertaut" tanpa memisah persis dari longgar menyembunyikan yang ditebak.
{
  const B = nd('spec/vocab/bpp/bpp.ndjson');
  const kec = B.flatMap((x) => x.serves ?? []);
  cek('22', 'balai tertaut kabupaten/kota', B.filter((x) => x.region?.id).length, 5844);
  cek('22', 'balai tertaut lewat kode BPS', B.filter((x) => x.region?.regency_code_scheme === 'BPS' && x.region?.id && x.region.regency_code && x.region.id).length, 5844);
  cek('22', 'sebutan kecamatan', kec.length, 6824);
  cek('22', 'kecamatan cocok persis', kec.filter((x) => x.match === 'exact').length, 6704);
  cek('22', 'kecamatan cocok longgar', kec.filter((x) => x.match === 'approx').length, 33);
  cek('22', 'kecamatan tidak tertaut', kec.filter((x) => x.match === 'none').length, 87);
}
cek('22', 'seri harga bertaut wilayah', nd('spec/vocab/harga/harga.ndjson').filter((x) => x.region?.id).length, 8);

// ---- agroklimat
// Cacahan kelas per skema disalin ke docs/21. Yang dijaga di sini bukan sekadar
// jumlahnya melainkan klaim yang bersandar padanya: 18 zona Oldeman, bukan 17 seperti
// yang beredar di tabel yang memotong barisnya, dan 8 tipe Schmidt-Ferguson.
const AKL = readdirSync(dari('spec/vocab'))
  .filter((f) => f.startsWith('agroklimat-') && f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(dari('spec/vocab'), f), 'utf8')));
const skema = (key) => AKL.find((x) => x.key === key);
cek('21', 'skema agroklimat', AKL.length, 5);
cek('21', 'zona Oldeman', skema('oldeman').classes.length, 18);
cek('21', 'tipe Schmidt-Ferguson', skema('schmidt-ferguson').classes.length, 8);
cek('21', 'zona Junghuhn', skema('junghuhn').classes.length, 4);
cek('21', 'kelas dataran hortikultura', skema('dataran-hortikultura').classes.length, 3);
cek('21', 'pola hujan BMKG', skema('pola-hujan').classes.length, 3);
cek('21', 'kelas agroklimat seluruhnya', AKL.reduce((a, x) => a + x.classes.length, 0), 36);
cek('21', 'skema berambang', AKL.filter((x) => x.decidable === 'threshold').length, 4);

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

// ---- padanan bahan aktif: berapa yang bernama, dan dari mana namanya
// Angka ini punya DUA sumber yang bergerak sendiri-sendiri — tarikan registri baru dan
// panen Wikidata baru — dan dicetak di spec/README serta spec/02-crosswalk. Pemisahan
// per `dasar` yang penting: pemakai yang hanya mau isi turunan-registri harus bisa tahu
// berapa banyak yang akan hilang kalau ia membuang baris berdasar Wikidata.
const PAD = J('spec/vocab/padanan-bahan-aktif.json').padanan_items;
const dasar = (d) => PAD.filter((r) => r.kanonik?.nama && r.kanonik.dasar === d).length;
cek('spec/README', 'kunci padanan bahan aktif', PAD.length, 1593);
cek('spec/README', 'padanan bernama kanonik', PAD.filter((r) => r.kanonik?.nama).length, 1093);
cek('02', 'padanan bernama dari deklarasi registri', PAD.length - PAD.filter((r) => r.kanonik?.dasar === 'wikidata').length - PAD.filter((r) => !r.kanonik?.nama).length, 934);
cek('02', 'padanan bernama dari Wikidata', dasar('wikidata'), 159);
cek('02', 'padanan belum terpetakan', PAD.filter((r) => r.hubungan === 'belum-terpetakan').length, 298);
cek('02', 'padanan Wikidata tanpa Q-id', PAD.filter((r) => r.kanonik?.dasar === 'wikidata' && !r.wikidata?.qid).length, 0);

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
cek('04', 'trips@cabai bahan aktif', t.zat, 60);
cek('04', 'trips@cabai kartu', t.kartu, 159);
cek('04', 'trips@cabai klorpirifos', t.klor, 14);
cek('04', 'trips@cabai berdaftar-larangan', t.larangan, 39);
const kk = iris(CABAI, 'op:pst:00000003'), ug = iris(CABAI, 'op:pst:00000005');
cek('04', 'kutu kebul@cabai', kk.produk, 32);
cek('04', 'ulat grayak@cabai', ug.produk, 184);
cek('04', 'virus kuning@cabai', iris(CABAI, 'op:pst:00000010').produk, 0);

// ---- larangan menyeluruh
const MEN = 'semua bidang penggunaan pestisida';
const menyeluruh = hidup(ZAT).filter((s) => (s.hazard?.regulatory_status ?? []).some((r) => r.jurisdiction === 'ID' && r.status === 'prohibited' && (r.scope ?? []).includes(MEN)));
const dipakai = new Set(P.flatMap((p) => (p.composition ?? []).map((c) => c.substance.id)));
cek('04', 'zat dilarang menyeluruh', menyeluruh.length, 91);
cek('04', 'di antaranya muncul di produk', menyeluruh.filter((s) => dipakai.has(s.id)).length, 0);
// Disaring `hidup` sejak penyatuan keluarga ejaan: blok `hazard` disalin ke entitas yang
// menang supaya larangannya tetap terjangkau, sedangkan yang kalah tetap memegangnya agar
// rekamannya setia. Menghitung keduanya berarti menghitung satu bahan dua kali — larangan
// fenitrotion dan ometoat sempat tercatat ganda karena itu.
const perKom = hidup(ZAT).filter((s) => (s.hazard?.regulatory_status ?? []).some((r) => r.jurisdiction === 'ID' && r.status === 'prohibited' && r.commodities?.length));
cek('04', 'zat dilarang khusus komoditas', perKom.length, 30);

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
cek('05', 'kelompok setara pestisida', gp.length, 897);
cek('05', 'produk setara pestisida', gp.reduce((a, v) => a + v.length, 0), 5268);
cek('05', 'kesetaraan pestisida %', ((gp.reduce((a, v) => a + v.length, 0) / P.length) * 100).toFixed(1), '68.2');
cek('05/06', 'kelompok setara pupuk', gu.length, 386);
cek('05/06', 'produk setara pupuk', gu.reduce((a, v) => a + v.length, 0), 1904);
cek('05/06', 'pupuk berkomposisi', PU.filter((p) => p.composition?.length).length, 5130);
const besar = [...gp, ...gu].sort((a, b) => b.length - a.length).slice(0, 5).map((v) => v.length);
cek('05/06', 'tiga kelompok terbesar', besar.slice(0, 3).join('/'), '184/144/131');
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

// --- 15/16: principal dan harga, ditambahkan 23 Agustus 2026 ---------------
// Keduanya kosakata turunan yang dibangun alat sendiri, jadi angkanya bergeser tiap kali
// registri ditarik ulang atau SP2KP menerbitkan tanggal baru. Tanpa baris-baris ini, angka
// di docs/15 dan docs/16 akan basi diam-diam — persis pola yang membuat alat ini ada.
const PCP = existsSync(dari('spec/vocab/principal/principal.ndjson'))
  ? nd('spec/vocab/principal/principal.ndjson') : null;
const HRG = existsSync(dari('spec/vocab/harga/harga.ndjson'))
  ? nd('spec/vocab/harga/harga.ndjson') : null;

if (PCP) {
  cek('15', 'badan pemegang pendaftaran', PCP.length, 3136);
  cek('15', 'badan berpengaya riset (D)', PCP.filter((b) => b.profile).length, 151);
  cek('15', 'badan di kedua registri', PCP.filter((b) =>
    b.sectors.includes('seed') && (b.sectors.includes('pesticide') || b.sectors.includes('fertilizer'))).length, 19);
}
if (HRG) {
  cek('16', 'varian harga diterbitkan', HRG.length, 96);
  cek('16', 'varian harga berangka', HRG.filter((h) => h.series?.length).length, 51);
  cek('16', 'varian harga TANPA angka', HRG.filter((h) => !h.series?.length).length, 45);
  cek('16', 'titik harga', HRG.reduce((a, h) => a + (h.series?.length ?? 0), 0), 26752);
  cek('16', 'komoditas tersambung', new Set(HRG.filter((h) => h.commodity).map((h) => h.commodity.id)).size, 24);
  // Keempat harga pupuk kosong. Ini bukan angka hiasan: sisi HET pada C9 bergantung padanya,
  // dan kalau SP2KP suatu saat MENGISINYA, baris ini yang akan memberi tahu.
  cek('16', 'harga pupuk berangka', HRG.filter((h) => /^pupuk/i.test(h.label.id) && h.series?.length).length, 0);

  // Sifat dataset yang dipakai docs/18 dan layar harga: kedua ekstrem menumpuk di empat
  // bulan pertama karena serinya mulai di tengah lonjakan pangan. Kalau SP2KP suatu saat
  // menerbitkan riwayat yang lebih panjang ke belakang, kedua baris ini yang memberi tahu —
  // dan kalimat di layar harus ikut berubah.
  // Disaring ke SP2KP saja, dan itu bukan kerapian: kalimat yang dikawal baris ini berbunyi
  // "SP2KP mulai mencatat 1 Februari 2024, di tengah lonjakan pangan". Begitu seri penetapan
  // TBS provinsi masuk — yang mulai pada tanggal lain dan bukan hasil survei — mengukur
  // keduanya bersama membuat angkanya berhenti mengukur kalimatnya.
  const berangka = HRG.filter((h) => h.series?.length && h.source_system === 'SP2KP');
  const diJendelaAwal = (h, t) =>
    (new Date(t) - new Date(h.coverage.from)) / 86400000 <= 120;
  cek('16/18', 'puncak di 4 bulan pertama', berangka.filter((h) => diJendelaAwal(h, h.stats.maks.t)).length, 40);
  cek('16/18', 'terendah di 4 bulan pertama', berangka.filter((h) => diJendelaAwal(h, h.stats.min.t)).length, 38);

  // Golongan relevansi. Kalau SP2KP menambah varian, ketiga baris ini yang memberi tahu
  // bahwa tabel di docs/16 bagian 8a — dan kalimat "30 varian tidak ditampilkan" di layar —
  // sudah tidak cocok lagi dengan datanya.
  const gol = (g) => HRG.filter((h) => (h.sector ?? 'pangan') === g);
  cek('16', 'varian golongan pangan', gol('pangan').length, 48);
  cek('16', 'varian golongan input', gol('input').length, 7);
  cek('16', 'varian golongan luar (tak tampil)', gol('luar').length, 41);
  cek('16', 'berangka yang tampil di layar', HRG.filter((h) => (h.sector ?? 'pangan') !== 'luar' && h.series?.length).length, 38);

  // Harga tingkat pekebun. Selama angka ini 1, seluruh kalimat "ini harga eceran" di layar
  // masih benar untuk sisanya — dan begitu provinsi kedua masuk, kalimat itu perlu ditinjau.
  cek('16', 'seri tingkat pekebun (farmgate)', HRG.filter((h) => h.price_level === 'farmgate').length, 8);
  cek('16', 'seri pekebun SWADAYA', HRG.filter((h) => /swadaya/i.test(h.key)).length, 2);
  cek('16', 'pita umur TBS Kalbar', Object.keys(HRG.find((h) => h.key === 'tbs-kelapa-sawit-kalimantan-barat')?.age_bands?.terakhir ?? {}).length, 13);
  cek('16', 'periode penetapan TBS Kalbar', HRG.find((h) => h.key === 'tbs-kelapa-sawit-kalimantan-barat')?.series?.length ?? 0, 50);
  cek('16', 'penetapan swadaya Riau', HRG.find((h) => h.key === 'tbs-kelapa-sawit-riau-swadaya')?.series?.length ?? 0, 71);
  cek('16', 'penetapan TBS Kalteng', HRG.find((h) => h.key === 'tbs-kelapa-sawit-kalimantan-tengah')?.series?.length ?? 0, 41);
  cek('16', 'provinsi ber-tabel umur', HRG.filter((h) => h.age_bands).length, 7);
  // Rendemen per pita umur dari SK Kaltim — satu-satunya sumber rendemen terbuka Indonesia,
  // dan dasar koreksi OER pada bagian 7a. Kalau ia hilang, kalimat itu kehilangan sandarannya.
  cek('16', 'penetapan Kaltim ber-rendemen', Object.keys(HRG.find((h) => h.key === 'tbs-kelapa-sawit-kalimantan-timur')?.formula?.rendemen?.seri?.at(-1)?.cpo ?? {}).length, 8);
  cek('16', 'penetapan TBS Kaltim', HRG.find((h) => h.key === 'tbs-kelapa-sawit-kalimantan-timur')?.series?.length ?? 0, 83);
  // Batas rentang rendemen dikunci karena bagian 7a MENCETAKNYA sebagai tabel, dan halaman
  // harga menghitungnya ulang dari indeks. Dua tempat menyebut angka yang sama dari sumber
  // berbeda; kalau salah satunya bergeser tanpa yang lain, di sinilah ketahuan.
  {
    const r = HRG.find((h) => h.key === 'tbs-kelapa-sawit-kalimantan-timur')?.formula?.rendemen?.seri?.at(-1) ?? {};
    const cpo = Object.values(r.cpo ?? {}).filter((x) => x > 0);
    const inti = Object.values(r.inti ?? {}).filter((x) => x > 0);
    // Dibulatkan dua desimal karena rendemen disimpan sebagai pecahan: 0,0505 × 100 tidak
    // menghasilkan 5,05 persis di titik-mengambang, dan selisih 10^-15 bukan pergeseran data.
    const persen = (x) => Math.round(x * 10000) / 100;
    cek('16', 'rendemen CPO Kaltim terendah (%)', persen(Math.min(...cpo)), 19.3);
    cek('16', 'rendemen CPO Kaltim tertinggi (%)', persen(Math.max(...cpo)), 21.83);
    cek('16', 'rentang rendemen CPO Kaltim (poin)', persen(Math.max(...cpo) - Math.min(...cpo)), 2.53);
    cek('16', 'rendemen inti Kaltim terendah (%)', persen(Math.min(...inti)), 4.35);
    cek('16', 'rendemen inti Kaltim tertinggi (%)', persen(Math.max(...inti)), 5.05);
  }
  cek('16', 'penetapan TBS Babel', HRG.find((h) => h.key === 'tbs-kelapa-sawit-bangka-belitung')?.series?.length ?? 0, 4);

  // Aceh — provinsi keenam, dan yang pertama membawa DUA kelas pekebun sekaligus. Kalau salah
  // satunya hilang, kalimat "Aceh menerbitkan swadaya juga" di bagian 8b kehilangan dasarnya.
  {
    const pl = HRG.find((h) => h.key === 'tbs-kelapa-sawit-aceh-plasma');
    const sw = HRG.find((h) => h.key === 'tbs-kelapa-sawit-aceh-swadaya');
    cek('16', 'penetapan TBS Aceh plasma', pl?.series?.length ?? 0, 9);
    cek('16', 'penetapan TBS Aceh swadaya', sw?.series?.length ?? 0, 3);
    cek('16', 'pita umur Aceh', pl?.age_bands?.pita?.length ?? 0, 13);
    cek('16', 'komposisi tenera Aceh', sw?.age_bands?.pita?.length ?? 0, 7);
    // Rendemen Aceh naik LALU TURUN — satu-satunya tabel di repositori ini yang mengakui
    // penurunan hasil kebun tua. Batasnya dikunci karena docs/16 mencetaknya.
    const r = Object.values(pl?.formula?.rendemen?.terakhir ?? {}).filter((x) => x > 0);
    const persen = (x) => Math.round(x * 10000) / 100;
    cek('16', 'rendemen Aceh terendah (%)', r.length ? persen(Math.min(...r)) : 0, 15.82);
    cek('16', 'rendemen Aceh tertinggi (%)', r.length ? persen(Math.max(...r)) : 0, 21.83);
    cek('16', 'rentang rendemen Aceh (poin)', r.length ? persen(Math.max(...r) - Math.min(...r)) : 0, 6.01);
    // Yang paling mudah rusak diam-diam: seri swadaya yang sumbunya bukan umur. Kalau
    // sumbunya hilang, layar akan menayangkan "40 tahun" untuk kebun 40% tenera.
    cek('16', 'sumbu swadaya Aceh bukan umur', sw?.age_bands?.sumbu?.sufiks === '% tenera' ? 1 : 0, 1);
  }
  cek('16', 'provinsi sawit terserap', new Set(HRG.filter((h) => h.commodity_group === 'Kelapa Sawit').map((h) => h.region?.code)).size, 6);
}

// Sapuan teks: angka yang PERNAH salah dan sudah dikoreksi tidak boleh muncul lagi
// di mana pun — termasuk di app/, yang menampilkannya ke pengguna. Koreksi dokumen
// sempat tidak ikut ke layar, dan itu ketahuan hanya karena disapu.
const BEKAS_SALAH = [
  [/290 dari 23\.058/, 'PHI 290 — sebenarnya nol'],
  [/hanya 35\b[^.]{0,40}sifat agronomi|35 dari 11\.227/, 'sifat agronomi 35 — sebenarnya nol'],
  [/44 dari 11\.227 rekaman menyinggung/, 'sertifikasi lot 44 menyinggung — sebenarnya nol'],
  [/15 kadar berbeda/, 'abamektin 15 kadar — sebenarnya 33'],
  [/Dari 25 produk berisi Abamektin/, 'abamektin 18 g/L 25 produk — sebenarnya 26'],
  [/778 OPT registri/, '778 OPT registri — sebenarnya 768 registri + 10 terkurasi'],
  // Rendemen sawit. Dikoreksi 23 Agustus 2026 dari 21% ke 19,7% — lihat docs/16 bagian 7a.
  // Angka 21% bukan salah hitung melainkan ASUMSI yang menyamar jadi pengukuran, dan itu
  // jenis kekeliruan yang paling mudah kembali: ia terlihat wajar, dan ia masih tertulis di
  // Permentan 01/2018 yang sudah dicabut. Ketiga pola di bawah menjaga agar ia tidak
  // menyelinap balik ke dokumen maupun ke layar.
  [/OER sawit\s*±?\s*21/, 'OER sawit 21% — asumsi, bukan pengukuran; yang terukur 19,7%'],
  [/sebenarnya 1,52×/, 'rasio terkoreksi 1,52× — hasil OER 21%; dengan 19,7% ia 1,43×'],
  [/66% setara-CPO/, '66% setara-CPO — hasil OER 21%; dengan 19,7% ia 70%'],
];
const sapuDir = (d) => readdirSync(dari(d), { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? sapuDir(`${d}/${e.name}`) : [`${d}/${e.name}`]);
const berkas = [...sapuDir('docs'), ...sapuDir('app'), ...sapuDir('spec/tools')]
  .filter((f) => /\.(md|html|js|mjs)$/.test(f) && !f.endsWith('cek-angka-docs.mjs'));
for (const f of berkas) {
  const isi = readFileSync(dari(f), 'utf8');
  for (const [re, sebab] of BEKAS_SALAH)
    if (re.test(isi)) hasil.push({ doc: 'sapuan', klaim: `${f}: ${sebab}`, nyata: 'ADA', harap: 'tidak ada', ok: false });
}

const gagal = hasil.filter((h) => !h.ok);
for (const h of hasil) console.log(`${h.ok ? '  ok  ' : ' BEDA '} ${h.doc.padEnd(7)} ${h.klaim.padEnd(34)} data=${String(h.nyata).padStart(7)}  dokumen=${h.harap}`);
console.log(`\n${hasil.length - gagal.length}/${hasil.length} cocok, ${gagal.length} berbeda`);
console.log('Artinya: data belum bergeser dari angka yang tersalin di alat ini.');
console.log('BUKAN: seluruh angka di dokumen sudah diperiksa ulang — angka baru yang');
console.log('salah, ditulis sesudah ini, tidak akan tertangkap.');
// Keluar dengan status gagal supaya `npm run all` berhenti, bukan sekadar mencetak.
if (gagal.length) process.exit(1);
