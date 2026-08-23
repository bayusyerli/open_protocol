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
  cek('16', 'varian harga diterbitkan', HRG.length, 89);
  cek('16', 'varian harga berangka', HRG.filter((h) => h.series?.length).length, 44);
  cek('16', 'varian harga TANPA angka', HRG.filter((h) => !h.series?.length).length, 45);
  cek('16', 'titik harga', HRG.reduce((a, h) => a + (h.series?.length ?? 0), 0), 26525);
  cek('16', 'komoditas tersambung', new Set(HRG.filter((h) => h.commodity).map((h) => h.commodity.id)).size, 24);
  // Keempat harga pupuk kosong. Ini bukan angka hiasan: sisi HET pada C9 bergantung padanya,
  // dan kalau SP2KP suatu saat MENGISINYA, baris ini yang akan memberi tahu.
  cek('16', 'harga pupuk berangka', HRG.filter((h) => /^pupuk/i.test(h.label.id) && h.series?.length).length, 0);

  // Sifat dataset yang dipakai docs/18 dan layar harga: kedua ekstrem menumpuk di empat
  // bulan pertama karena serinya mulai di tengah lonjakan pangan. Kalau SP2KP suatu saat
  // menerbitkan riwayat yang lebih panjang ke belakang, kedua baris ini yang memberi tahu —
  // dan kalimat di layar harus ikut berubah.
  const berangka = HRG.filter((h) => h.series?.length);
  const diJendelaAwal = (h, t) =>
    (new Date(t) - new Date(h.coverage.from)) / 86400000 <= 120;
  cek('16/18', 'puncak di 4 bulan pertama', berangka.filter((h) => diJendelaAwal(h, h.stats.maks.t)).length, 40);
  cek('16/18', 'terendah di 4 bulan pertama', berangka.filter((h) => diJendelaAwal(h, h.stats.min.t)).length, 38);

  // Golongan relevansi. Kalau SP2KP menambah varian, ketiga baris ini yang memberi tahu
  // bahwa tabel di docs/16 bagian 8a — dan kalimat "30 varian tidak ditampilkan" di layar —
  // sudah tidak cocok lagi dengan datanya.
  const gol = (g) => HRG.filter((h) => (h.sector ?? 'pangan') === g);
  cek('16', 'varian golongan pangan', gol('pangan').length, 41);
  cek('16', 'varian golongan input', gol('input').length, 7);
  cek('16', 'varian golongan luar (tak tampil)', gol('luar').length, 41);
  cek('16', 'berangka yang tampil di layar', HRG.filter((h) => (h.sector ?? 'pangan') !== 'luar' && h.series?.length).length, 31);

  // Harga tingkat pekebun. Selama angka ini 1, seluruh kalimat "ini harga eceran" di layar
  // masih benar untuk sisanya — dan begitu provinsi kedua masuk, kalimat itu perlu ditinjau.
  cek('16', 'seri tingkat pekebun (farmgate)', HRG.filter((h) => h.price_level === 'farmgate').length, 1);
  cek('16', 'pita umur TBS Kalbar', Object.keys(HRG.find((h) => h.price_level === 'farmgate')?.age_bands?.terakhir ?? {}).length, 13);
  cek('16', 'periode penetapan TBS Kalbar', HRG.find((h) => h.price_level === 'farmgate')?.series?.length ?? 0, 50);
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
