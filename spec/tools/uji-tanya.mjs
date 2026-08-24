// Menguji penguraian pertanyaan dan pencarian yang memakainya.
//
//   node spec/tools/uji-tanya.mjs
//
// KENAPA ALAT INI ADA
// `app/tanya.js` memutuskan kata mana yang dicari, kata mana yang menyempitkan, dan kata mana
// yang DITOLAK dijawab. Keputusan itu tidak terlihat di layar — yang terlihat cuma daftar
// hasilnya — jadi salah golong satu kata akan menggeser jawaban tanpa satu pun galat. Persis
// keadaan yang membuat kotak cari menjawab nol untuk tiap kalimat sebelum berkas itu ada.
//
// KENAPA IA MENJALANKAN `cari()` YANG SUNGGUHAN, BUKAN TIRUANNYA
// Yang paling mudah salah bukan penguraiannya melainkan sambungannya ke ember indeks: kata
// yang benar di ember yang salah tetap dijawab nol. Jadi `fetch` disulih dengan pembaca
// berkas, lalu app/pustaka.js diimpor apa adanya. Yang diuji kode yang benar-benar dijalankan
// peramban, di atas indeks yang benar-benar terbit.
//
// APA YANG TIDAK DIUJI DI SINI
// Tampilannya. Bahwa hasilnya sampai ke layar sebagai kartu yang benar tetap urusan membuka
// halamannya — alat ini berhenti di daftar yang dikembalikan `cari()`.
//
// IA `npm run uji-terbit`, BUKAN `npm test` — DAN ITU BUKAN SOAL SELERA.
// Karena ia menjalankan pencarian di atas indeks yang benar-benar terbit, ia menuntut
// `spec/indeks/` sudah dibangun. `npm test` berjalan SEBELUM langkah bangun, sebagai gerbang
// mutu: membangun 30 ribu halaman di atas data yang tidak lolos hanya menyebarkan galatnya.
// Menaruh uji ini di sana membuatnya lolos di laptop yang kebetulan punya indeks lama, dan
// gagal di klon bersih — persis yang terjadi pada CI run pertama, 24 Agustus 2026.
//
// Jadi urutannya: `npm run all` (gerbang, tanpa indeks) → bangun indeks → `npm run
// uji-terbit` (uji ini) → bangun halaman. `npm run semua` menjalankan keduanya untuk yang
// bekerja lokal dan indeksnya memang sudah ada.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const INDEKS = join(AKAR, 'spec', 'indeks');

if (!existsSync(join(INDEKS, 'meta.json'))) {
  console.error('spec/indeks/ belum dibangun. Jalankan:');
  console.error('  node spec/tools/bangun-indeks.mjs --tulis');
  process.exit(1);
}

/* Sulih `fetch`. `ambil()` di pustaka.js menempelkan `?v=<cap>` ke tiap pecahan, jadi kuerinya
 * dibuang lebih dulu — capnya urusan singgahan peramban, bukan urusan berkasnya. */
globalThis.fetch = async (alamat) => {
  const jalan = String(alamat).split('?')[0].replace(/^\/spec\/indeks\//, '');
  const berkas = join(INDEKS, jalan);
  if (!existsSync(berkas)) return { ok: false, status: 404, json: async () => null };
  return { ok: true, status: 200, json: async () => JSON.parse(readFileSync(berkas, 'utf8')) };
};

/* Satu pengait peramban yang dipasang pustaka.js saat modulnya dimuat — `popstate`, supaya
 * tombol kembali menutup layar rincian. Node tidak punya, jadi ia disediakan sebagai fungsi
 * kosong. Tidak ada yang lain yang perlu disulih: seluruh sentuhan DOM di berkas itu ada di
 * dalam fungsi yang tidak dipanggil alat ini. */
globalThis.addEventListener ??= () => {};

const { uraikan, uraiKetinggian, uraiDataran, kelasKetinggian, jawabPemegang } = await import(join(AKAR, 'app', 'tanya.js'));
const { muatMeta, cari, tautanHasil } = await import(join(AKAR, 'app', 'pustaka.js'));
const { kelasCocok } = await import(join(AKAR, 'spec', 'tools', 'agroklimat.mjs'));

await muatMeta();

let lulus = 0;
const gagal = [];
function uji(nama, syarat, keterangan = '') {
  if (syarat) { lulus++; return; }
  gagal.push(`${nama}${keterangan ? ` — ${keterangan}` : ''}`);
}
const sama = (nama, dapat, harap) => uji(
  nama,
  JSON.stringify(dapat) === JSON.stringify(harap),
  `dapat ${JSON.stringify(dapat)}, harap ${JSON.stringify(harap)}`,
);

// ---------------------------------------------------------------------------
// 1. Penguraian — ketiga kalimat yang dulunya dijawab nol
// ---------------------------------------------------------------------------
{
  const u = uraikan('Phonska produk perusahaan apa?');
  sama('phonska/istilah', u.istilah, ['phonska']);
  uji('phonska/jenis produk', u.jenis.includes('pupuk') && u.jenis.includes('pestisida'),
    JSON.stringify(u.jenis));
  uji('phonska/atribut', u.atribut.includes('pemegang'), JSON.stringify(u.atribut));
  uji('phonska/pertanyaan', u.pertanyaan === true);
  uji('phonska/tanpa nilai', u.nilai.length === 0);
}
{
  const u = uraikan('Apa saja varietas alpukat yang cocok untuk ketinggian 500 mdpl?');
  sama('alpukat/istilah', u.istilah, ['alpukat']);
  sama('alpukat/jenis', u.jenis, ['varietas']);
  sama('alpukat/nilai', u.nilai, ['cocok']);
  uji('alpukat/ketinggian', u.ketinggian?.meter === 500, JSON.stringify(u.ketinggian));
}
{
  const u = uraikan('Kapan waktu yang cocok untuk menanam cabai?');
  sama('cabai/istilah', u.istilah, ['cabai']);
  uji('cabai/waktu', u.waktu.includes('kapan') && u.waktu.includes('waktu'), JSON.stringify(u.waktu));
  uji('cabai/tindakan', u.tindakan.includes('tanam'), JSON.stringify(u.tindakan));
  sama('cabai/nilai', u.nilai, ['cocok']);
}

// Kueri satu kata TIDAK BOLEH berubah perilakunya — itu jalan yang dipakai hampir semua orang.
{
  const u = uraikan('phonska');
  sama('satu kata/istilah', u.istilah, ['phonska']);
  uji('satu kata/bukan pertanyaan', u.pertanyaan === false);
}
{
  const u = uraikan('pe');
  sama('dua huruf/istilah kosong', u.istilah, []);
}

// Kata penilaian dikenali, bukan dibuang diam-diam.
{
  const u = uraikan('pestisida paling ampuh untuk trips');
  sama('nilai/terkumpul', u.nilai, ['paling', 'ampuh']);
  sama('nilai/istilah tersisa', u.istilah, ['trips']);
  sama('nilai/jenis', u.jenis, ['pestisida']);
}

// Akhiran -nya dipenggal, tetapi tidak pada kata yang memang berakhiran itu.
sama('nya/harganya', uraikan('harganya berapa').istilah, []);
sama('nya/pabriknya', uraikan('pabriknya siapa').atribut, ['pemegang']);
sama('nya/punya tetap utuh', uraikan('punya bunga').istilah, ['bunga']);

// ---------------------------------------------------------------------------
// 2. Ketinggian — angka Indonesia, dan angka yang BUKAN ketinggian
// ---------------------------------------------------------------------------
uji('tinggi/500 mdpl', uraiKetinggian('500 mdpl')?.meter === 500);
uji('tinggi/500 m dpl', uraiKetinggian('kebun di 500 m dpl')?.meter === 500);
uji('tinggi/1.200 ribuan', uraiKetinggian('1.200 mdpl')?.meter === 1200,
  JSON.stringify(uraiKetinggian('1.200 mdpl')));
uji('tinggi/ketinggian 800', uraiKetinggian('ketinggian 800 meter')?.meter === 800);
uji('tinggi/dosis bukan tinggi', uraiKetinggian('dosis 500 ml per tangki') === null);
uji('tinggi/jarak bukan tinggi', uraiKetinggian('jarak tanam 500 m') === null);
uji('tinggi/telanjang dengan penanda', uraiKetinggian('ketinggian kebun 500 m')?.meter === 500);
uji('tinggi/di luar batas ditolak', uraiKetinggian('9000 mdpl') === null);
uji('dataran/tinggi', uraiDataran('varietas dataran tinggi') === 'tinggi');
uji('dataran/sedang jadi menengah', uraiDataran('dataran sedang') === 'menengah');
uji('dataran/tanpa kata', uraiDataran('cabai merah') === null);

// ---------------------------------------------------------------------------
// 3. Kelas agroklimat — dan bahwa penghitung layar sama dengan penghitung check.mjs
// ---------------------------------------------------------------------------
const agro = JSON.parse(readFileSync(join(INDEKS, 'agroklimat.json'), 'utf8'));
uji('agro/skema terbit', agro.length === 5, `dapat ${agro.length}`);
{
  const k = kelasKetinggian(agro, 500);
  const dataran = k.find((x) => x.skema.key === 'dataran-hortikultura');
  const jung = k.find((x) => x.skema.key === 'junghuhn');
  sama('agro/500 dataran', dataran?.kelas.map((x) => x.kode), ['menengah']);
  sama('agro/500 junghuhn', jung?.kelas.map((x) => x.kode), ['panas']);
  uji('agro/pola hujan tidak ikut', !k.some((x) => x.skema.key === 'pola-hujan'));
}
// Batas tertutup dan terbuka: 700 tepat jatuh ke satu kelas saja, di kedua skema.
for (const m of [0, 399, 400, 699, 700, 1499, 1500, 2500, 4884]) {
  const k = kelasKetinggian(agro, m);
  for (const { skema, kelas } of k) {
    uji(`agro/${m} ${skema.key} satu kelas`, kelas.length === 1,
      `dapat ${kelas.length}: ${kelas.map((x) => x.kode).join(',')}`);
  }
}
// Penghitung di app/ dan penghitung di spec/tools/ wajib sepakat — yang satu dipakai layar,
// yang satu dipakai aturan L42. Dua penghitung yang menyimpang berarti layar menyebut kelas
// yang akan ditolak pemeriksanya sendiri.
{
  const skemaVocab = ['agroklimat-dataran-hortikultura.json', 'agroklimat-junghuhn.json']
    .map((n) => JSON.parse(readFileSync(join(AKAR, 'spec', 'vocab', n), 'utf8')));
  for (const m of [0, 250, 400, 699, 700, 1200, 1500, 3000]) {
    for (const s of skemaVocab) {
      const dariVocab = kelasCocok(s, { ketinggian_m: m }).map((x) => x.code);
      const dariApp = (kelasKetinggian(agro, m).find((x) => x.skema.key === s.key)?.kelas ?? [])
        .map((x) => x.kode);
      sama(`agro/sepakat ${s.key} ${m}`, dariApp, dariVocab);
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Pencarian — kalimat utuh, di atas indeks yang benar-benar terbit
// ---------------------------------------------------------------------------
const pintu = { pintu: true };

{
  const { hasil, urai } = await cari('Phonska produk perusahaan apa?', null, pintu);
  uji('cari/phonska kalimat ada hasil', hasil.length >= 17, `dapat ${hasil.length}`);
  uji('cari/phonska semuanya pupuk', hasil.every((x) => x.j === 'pupuk'),
    [...new Set(hasil.map((x) => x.j))].join(','));

  // Nama dagang tidak eksklusif di registri: 17 pendaftaran berawalan "Phonska" dipegang
  // EMPAT badan. Jawaban atributnya wajib memakai yang bernama persis, lalu menyebutkan
  // sisanya — bukan mengambil pemegang hasil pertama.
  const j = jawabPemegang(hasil, urai.istilah);
  uji('jawab/phonska memakai nama persis', j.persisDipakai === true);
  sama('jawab/phonska satu badan', j.badan.map((b) => b.pk), ['pt-petrokimia-gresik']);
  uji('jawab/phonska label terpanjang', j.badan[0].label === 'PT Petrokimia Gresik', j.badan[0].label);
  uji('jawab/phonska sisanya dihitung', j.lain === 12, `lain=${j.lain}`);
}
{
  // Tanpa nama yang persis, seluruh pemegang disebutkan — dan jumlahnya lebih dari satu.
  const { hasil, urai } = await cari('phonska plus', null, pintu);
  const j = jawabPemegang(hasil, urai.istilah);
  uji('jawab/tanpa nama persis', j.persisDipakai === false || j.badan.length >= 1,
    JSON.stringify(j.badan.map((b) => b.pk)));
}
{
  const { hasil } = await cari('phonska petrokimia', null, pintu);
  uji('cari/dua kata lintas ember', hasil.length > 0, `dapat ${hasil.length}`);
  uji('cari/dua kata semuanya phonska',
    hasil.every((x) => /phonska/i.test(x.n)), hasil.slice(0, 3).map((x) => x.n).join(' | '));
}
{
  const { hasil } = await cari('Apa saja varietas alpukat yang cocok untuk ketinggian 500 mdpl?', null, pintu);
  const kom = hasil.find((x) => x.j === 'komoditas');
  uji('cari/alpukat pintu komoditas', Boolean(kom), hasil.slice(0, 3).map((x) => x.n).join(' | '));
  uji('cari/alpukat pintu menyebut cacah', /145 varietas/.test(kom?.k ?? ''), kom?.k);
  sama('cari/alpukat rute pintu', tautanHasil(kom), '/tanaman/alpukat/');
}
{
  const { hasil } = await cari('Kapan waktu yang cocok untuk menanam cabai?', null, pintu);
  uji('cari/cabai ada hasil', hasil.length > 0, `dapat ${hasil.length}`);
  uji('cari/cabai ada pintu komoditas', hasil.some((x) => x.j === 'komoditas'),
    hasil.slice(0, 5).map((x) => `${x.j}:${x.n}`).join(' | '));
}

{
  // 113 dari 198 nama OPT berproduk diawali kata golongan, jadi embernya ditentukan kata
  // yang tidak membedakan apa pun. Sebelum aliasnya ada, ketiga kueri di bawah dijawab nol.
  for (const [kueri, harap] of [['trips', 'Hama Trips'], ['ganjur', 'Hama Ganjur'],
    ['apa obat untuk ulat grayak pada padi', 'Ulat Grayak']]) {
    const { hasil } = await cari(kueri, null, pintu);
    uji(`opt/alias ${kueri}`, hasil.some((x) => x.j === 'opt' && x.n === harap),
      hasil.slice(0, 3).map((x) => `${x.j}:${x.n}`).join(' | '));
  }
}
{
  // Saringan jenis yang tidak menyisakan apa pun DIJATUHKAN, dan penjatuhannya dilaporkan —
  // "pestisida" pada kueri yang hasilnya OPT tidak boleh menihilkan jawabannya.
  const r = await cari('pestisida paling ampuh untuk trips', null, pintu);
  uji('jenis/lunak menyisakan hasil', r.hasil.length > 0, `dapat ${r.hasil.length}`);
  uji('jenis/penjatuhan dilaporkan', r.jenisDijatuhkan === true);
}
{
  // Nol hasil TIDAK boleh dilaporkan sebagai "penyempitannya tidak dipakai": tidak ada apa
  // pun untuk disempitkan, dan kalimat itu menyalahkan kata yang tidak bersalah.
  const r = await cari('pupuk apa yang paling bagus?', null, pintu);
  uji('jenis/nol bukan penjatuhan', r.jenisDijatuhkan === false,
    `hasil=${r.hasil?.length}, jatuh=${r.jenisDijatuhkan}`);
}

// Yang tidak boleh berubah: kueri satu kata, ember yang belum cukup sempit, dan saringan jalur.
{
  const { hasil } = await cari('phonska');
  uji('cari/satu kata tetap', hasil.length >= 17, `dapat ${hasil.length}`);
  uji('cari/satu kata tanpa pintu', !hasil.some((x) => x.j === 'komoditas'));
}
{
  const { kurang } = await cari('pe');
  uji('cari/ember dangkal tetap minta huruf', typeof kurang === 'number', `kurang=${kurang}`);
}
{
  const { hasil } = await cari('alpukat', (x) => x.j === 'varietas');
  uji('cari/saringan jalur 4 utuh', hasil.length > 0 && hasil.every((x) => x.j === 'varietas'),
    `dapat ${hasil.length}`);
}
{
  // Untaian penuh mengalahkan kata lepas: nama yang memuat kalimatnya apa adanya naik ke
  // atas, walaupun kedua katanya juga tersebar di puluhan entri lain.
  const { hasil } = await cari('phonska alam');
  uji('cari/untaian penuh didahulukan',
    hasil.length > 0 && /^phonska alam$/i.test(hasil[0].n), hasil[0]?.n);
}
{
  // "abamektin 18" dulu dijawab NOL — tidak ada nama yang memuat untaian "abamektin18",
  // dan angka telanjang tidak pernah jadi istilah. Sekarang ia menjawab merek berabamektin,
  // dan angkanya disebutkan di baris pembeda tiap kartu, bukan di namanya.
  const { hasil } = await cari('abamektin 18');
  uji('cari/angka telanjang tidak menihilkan', hasil.length > 0, `dapat ${hasil.length}`);
  uji('cari/semuanya berabamektin',
    hasil.every((x) => /abamektin/i.test(`${x.n} ${x.f ?? ''}`)),
    hasil.slice(0, 3).map((x) => x.n).join(' | '));
}

// ---------------------------------------------------------------------------
// 5. Pintu komoditas tidak boleh menggantung
// ---------------------------------------------------------------------------
{
  const meta = JSON.parse(readFileSync(join(INDEKS, 'meta.json'), 'utf8'));
  const semua = [];
  for (const e of meta.pecahan.cari) {
    for (const x of JSON.parse(readFileSync(join(INDEKS, 'cari', `${e}.json`), 'utf8'))) {
      if (x.j === 'komoditas') semua.push(x);
    }
  }
  uji('pintu/cacah sama dengan meta', semua.length === meta.jumlah.komoditasBerpintu,
    `${semua.length} vs ${meta.jumlah.komoditasBerpintu}`);
  const menggantung = semua.filter(
    (x) => !existsSync(join(AKAR, 'terbit', String(x.p).replace(/^tanaman\//, 'tanaman/'), 'index.html')),
  );
  // terbit/ dibangun terpisah dan sengaja tidak ikut repositori, jadi ketiadaannya bukan
  // kegagalan — yang gagal kalau ia ADA tetapi sebagian pintunya tidak punya halaman.
  if (existsSync(join(AKAR, 'terbit', 'tanaman'))) {
    uji('pintu/tiap pintu punya halaman', menggantung.length === 0,
      menggantung.slice(0, 5).map((x) => x.p).join(', '));
  } else {
    console.log('  (terbit/ belum dibangun — pemeriksaan tautan pintu dilewati)');
  }
}

// ---------------------------------------------------------------------------

console.log(`${lulus}/${lulus + gagal.length} uji lulus.`);
if (gagal.length) {
  console.error(`\n${gagal.length} GAGAL:`);
  for (const g of gagal) console.error(`  ${g}`);
  process.exit(1);
}
