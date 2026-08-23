// Menyusun kosakata `harga` dari tarikan SP2KP, beserta statistik yang dibaca layar dan
// pembangkit komentar.
//
//   node spec/tools/bangun-harga.mjs            # periksa saja
//   node spec/tools/bangun-harga.mjs --tulis    # tulis spec/vocab/harga/
//
// Masukannya harga_data/sp2kp-hnt.ndjson — keluaran `node harga_data/tarik-sp2kp.mjs`.
// Alasan endpoint dan batas lisensinya ada di kepala berkas itu; yang penting di sini satu:
// INI SATU-SATUNYA SUMBER HARGA YANG BOLEH TERBIT, dan atribusinya wajib ikut sampai ke layar.
//
// SATU REKAMAN PER VARIAN, BUKAN PER KOMODITAS
// SP2KP memberi "Beras Premium" dan "Beras Medium" sebagai dua seri, dan selisih keduanya
// pada Agustus 2026 sekitar Rp1.670/kg. Meratakannya jadi satu "Beras" membuang angka yang
// justru menentukan — dan membuat halaman harga menjawab pertanyaan yang tidak ditanyakan
// siapa pun.
//
// APA YANG TIDAK ADA DI SINI, DAN KENAPA ITU HARUS TERBACA
// Seri ini ECERAN NASIONAL. Ia bukan harga yang diterima petani, dan jaraknya bukan celah
// cakupan yang bisa dirapatkan — docs/16 bagian 4 menunjukkan bahwa "harga produsen" yang
// dicatat negara pun sebenarnya harga beli pengumpul, karena respondennya memang pengumpul.
// Karena itu `price_level` di sini selalu `retail`, dan tidak ada jalan bagi layar untuk
// menayangkannya sebagai sesuatu yang lain.
//
// Cakupannya juga jauh dari menyeluruh, dan angkanya perlu diucapkan utuh: dari 88 varian
// yang diterbitkan SP2KP, hanya 43 benar-benar berangka, hanya 31 punya padanan di kosakata
// komoditas sendiri, dan itu menyentuh 23 dari 906 komoditas yang dikenal repositori ini.
// Sisanya bukan komoditas tani sama sekali — besi beton, semen, triplek, LPG, paku, olahan.
// Ketiga angka itu dihitung di sini dan diterbitkan ke meta, supaya layar bisa mengatakan
// komoditas mana yang TIDAK punya harga alih-alih diam untuk pertanyaan yang sah.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tulis = process.argv.includes('--tulis');
const MASUK = join(akar, 'harga_data', 'sp2kp-hnt.ndjson');
const KELUAR = join(akar, 'spec', 'vocab', 'harga');
const NDJSON = join(KELUAR, 'harga.ndjson');
const META = join(KELUAR, 'harga.meta.json');

const BLOK = { from: 1000, to: 1999 };

const ATRIBUSI =
  'Sumber: Portal Satu Data Kementerian Perdagangan (satudata.kemendag.go.id) – 2026, diolah kembali oleh Open Protocols.';

if (!existsSync(MASUK)) {
  console.error(`${MASUK} tidak ada. Jalankan dulu: node harga_data/tarik-sp2kp.mjs`);
  process.exit(1);
}

const bacaNdjson = (p) =>
  readFileSync(p, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
const bacaJson = (p) => JSON.parse(readFileSync(join(akar, 'spec', 'vocab', p), 'utf8'));

const varian = bacaNdjson(MASUK);

// ---------------------------------------------------------------------------
// Sambungan ke kosakata komoditas sendiri
// ---------------------------------------------------------------------------
// Dicocokkan menurut nama yang dirapikan, persis dulu lalu memuat. Yang tidak ketemu
// DIBIARKAN KOSONG: memaksa "Besi Beton 10 mm" menempel ke sebuah tanaman akan membuat
// jalur lain menariknya sebagai komoditas tani.
const rapikan = (s) => (s ?? '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');

// `satuan` datang sebagai objek {display, deskripsi, ...}, bukan string. Yang dipakai layar
// singkatannya — "kg", "lt", "btg" — karena itu yang tercetak di sebelah angka rupiah.
const satuanTeks = (s) =>
  (typeof s === 'string' ? s : (s?.display ?? s?.deskripsi ?? '')).trim() || '—';
const komoditas = [];
for (const f of ['commodity.json', 'commodity-registri.json', 'commodity-varietas.json'])
  for (const it of bacaJson(f).items ?? []) komoditas.push({ id: it.id, nama: it.label?.id ?? '' });

function sambungKomoditas(nama) {
  const r = rapikan(nama);
  if (!r) return null;
  const persis = komoditas.find((k) => rapikan(k.nama) === r);
  if (persis) return persis;
  // Hanya arah "nama komoditas termuat di nama varian" yang dipakai, dan hanya kalau nama
  // komoditasnya cukup panjang. Arah sebaliknya membuat "Bawang" menyerap "Bawang Bombai",
  // "Bawang Merah", dan "Bawang Putih" ke satu komoditas yang sama.
  const muat = komoditas
    .filter((k) => rapikan(k.nama).length >= 5 && r.includes(rapikan(k.nama)))
    .sort((a, b) => rapikan(b.nama).length - rapikan(a.nama).length);
  return muat[0] ?? null;
}

// ---------------------------------------------------------------------------
// Relevansi — apa yang layak tampil di permukaan pertanian
// ---------------------------------------------------------------------------
// SP2KP mencampur dua keranjang dalam satu endpoint, dan penggolongannya sendiri yang
// memisahkan: `tipe_komoditas_id` 1 = barang kebutuhan pokok, 2 = barang penting. Keranjang
// kedua memuat baja ringan, besi beton, kayu balok, triplek, paku, semen, dan LPG — tidak
// satu pun urusan platform ini.
//
// Tetapi garis "tipe 1 saja" KELIRU, dan kelirunya ke arah yang paling merugikan: keranjang
// kedua juga memuat **Benih** dan **Pupuk Non Subsidi**, yang justru subjek inti repositori
// ini. Membuang tipe 2 seluruhnya berarti membuang satu-satunya harga sarana produksi yang
// pernah diterbitkan pemerintah secara terbuka.
//
// Maka tiga golongan, bukan dua:
//   pangan   yang dipanen, diternakkan, atau ditangkap — barang yang petani, peternak, dan
//            nelayan hasilkan sendiri
//   input    sarana produksi: benih dan pupuk. Tipe 2 di sumbernya, tetapi inti di sini.
//   luar     bahan bangunan, LPG, dan PANGAN OLAHAN — termasuk yang bahan bakunya tumbuh
//            di sini, karena yang menghadapi harganya tetap pembeli di toko
//
// Yang `luar` TIDAK dibuang dari kosakata — ia tetap tercatat, karena SP2KP memang
// menerbitkannya dan menghapusnya membuat cacah di dokumen tidak bisa direkonsiliasi dengan
// sumbernya. Yang berubah hanya: layar tidak menampilkannya, dan mengatakan berapa banyak
// yang tidak ditampilkan beserta sebabnya.
//
// ALASAN PEMISAHNYA DIPERBAIKI, DAN KEKELIRUANNYA LAYAK DICATAT
// Versi pertama daftar ini beralasan "bahan bakunya sebagian besar impor" — susu bubuk, mie
// instan, tepung terigu. Alasan itu KELIRU, dan kelirunya ketahuan begitu gula pasir dan
// minyak goreng sawit ikut dikeluarkan: tebu dan sawit ditanam di Indonesia, jadi asal bahan
// baku bukan yang membedakan.
//
// Yang membedakan TINGKAT OLAHANNYA, dan siapa yang menghadapi harganya. Harga gula pasir
// adalah harga yang dibayar pembeli di toko; yang diterima petani tebu ada di ujung lain
// rantai yang panjang, dan angka di sini tidak mengukurnya. Sama untuk minyak goreng
// terhadap petani sawit. Permukaan ini melayani yang MENGHASILKAN barangnya, bukan yang
// membelinya — dan menampilkan harga eceran barang olahan di sini menyiratkan sebuah
// hubungan yang datanya tidak punya.
//
// Beras tetap masuk meski digiling: gabah dan beras satu rantai pendek dengan satu langkah,
// dan beras adalah cara harga padi diucapkan di seluruh Indonesia. Daging potong juga —
// potongan karkas masih keluaran peternakan, bukan produk pabrik.
const INDUK_INPUT = new Set(['Benih', 'Pupuk Non Subsidi']);

// Disebut satu per satu, bukan disaring dengan kata kunci. Daftar nama yang bisa dibaca
// lebih mudah dibantah daripada regex yang diam-diam menangkap sesuatu yang lain — dan
// daftar ini memang pernah dibantah, dua kali.
const PANGAN_OLAHAN = new Set([
  // Berbahan baku sebagian besar impor
  'Susu Bubuk',
  'Susu Bubuk Balita',
  'Susu Kental Manis',
  'Mie Instan',
  'Tepung Terigu',
  // Berbahan baku dalam negeri, tetapi tetap harga eceran barang olahan: yang menghadapinya
  // pembeli di toko, bukan petani tebu maupun petani sawit.
  'Gula Pasir Curah',
  'Gula Pasir Kemasan',
  'Minyak Goreng Sawit Curah',
  'Minyak Goreng Sawit Kemasan Premium',
  'Minyakita',
  // Olahan kedelai. Aturan yang sama dengan gula terhadap tebu — dan sinyal harga bahannya
  // tidak hilang, karena Kedelai Lokal dan Kedelai Impor tetap ditampilkan.
  'Tahu Putih',
  'Tempe Bungkus',
  // Garam menempuh jalan yang sedikit berbeda ke kesimpulan yang sama. Petani garam memang
  // memanennya sendiri, jadi bukan "bukan hasil tani" yang mengeluarkannya. Yang SP2KP
  // terbitkan `Garam Halus` — sudah digiling dan beryodium — sementara garam krosok yang
  // benar-benar keluar dari tambak tidak diterbitkan sama sekali. Jadi angka yang ada bukan
  // angka yang dihadapi petani garam, dan itu alasan yang sama persis seperti gula.
  'Garam Halus',
]);

function golongan(v) {
  if (INDUK_INPUT.has(v.komoditas)) return 'input';
  if (PANGAN_OLAHAN.has(v.nama)) return 'luar';
  return v.tipe === 1 ? 'pangan' : 'luar';
}

// ---------------------------------------------------------------------------
// Statistik — dihitung sekali, dibaca layar dan pembangkit komentar
// ---------------------------------------------------------------------------
const HARI = 86400000;
const hari = (a, b) => Math.round((new Date(b) - new Date(a)) / HARI);

/** Harga pada tanggal terdekat SEBELUM atau PADA `sasaran`. null kalau serinya belum mulai. */
function padaAtauSebelum(titik, sasaran) {
  let hasil = null;
  for (const p of titik) {
    if (p.t <= sasaran) hasil = p; else break;
  }
  return hasil;
}

const persen = (baru, lama) => (lama > 0 ? ((baru - lama) / lama) * 100 : null);
const bulat2 = (x) => (x === null || x === undefined || Number.isNaN(x) ? null : Math.round(x * 100) / 100);

function statistik(titik) {
  const akhir = titik.at(-1);
  const mundur = (n) => {
    const d = new Date(akhir.t);
    d.setUTCDate(d.getUTCDate() - n);
    return padaAtauSebelum(titik, d.toISOString().slice(0, 10));
  };

  const nilai = titik.map((p) => p.p);
  const min = titik.reduce((a, p) => (p.p < a.p ? p : a));
  const maks = titik.reduce((a, p) => (p.p > a.p ? p : a));
  const rata = nilai.reduce((a, x) => a + x, 0) / nilai.length;
  const sd = Math.sqrt(nilai.reduce((a, x) => a + (x - rata) ** 2, 0) / nilai.length);

  // Musim: rata-rata per bulan kalender, dirata-ratakan lintas tahun. Hanya dihitung kalau
  // serinya benar-benar melewati dua belas bulan — pola musim dari delapan bulan data adalah
  // pola yang dikarang, bukan yang ditemukan.
  const rentangHari = hari(titik[0].t, akhir.t);
  let musim = null;
  if (rentangHari >= 365) {
    const perBulan = Array.from({ length: 12 }, () => []);
    for (const p of titik) perBulan[Number(p.t.slice(5, 7)) - 1].push(p.p);
    const rerata = perBulan.map((xs) => (xs.length ? xs.reduce((a, x) => a + x, 0) / xs.length : null));
    const ada = rerata.map((v, i) => ({ i, v })).filter((x) => x.v !== null);
    if (ada.length === 12) {
      const tertinggi = ada.reduce((a, x) => (x.v > a.v ? x : a));
      const terendah = ada.reduce((a, x) => (x.v < a.v ? x : a));
      musim = {
        bulanTertinggi: tertinggi.i + 1,
        bulanTerendah: terendah.i + 1,
        rentangPersen: bulat2(persen(tertinggi.v, terendah.v)),
      };
    }
  }

  // Kesenjangan hari — dinyatakan, tidak diinterpolasi. Seri yang bolong dua bulan tetap
  // tergambar sebagai garis kalau tidak ada yang menyebutkannya.
  const bolong = rentangHari + 1 - titik.length;

  return {
    terakhir: { t: akhir.t, p: bulat2(akhir.p) },
    ubah7: bulat2(persen(akhir.p, mundur(7)?.p ?? 0)),
    ubah30: bulat2(persen(akhir.p, mundur(30)?.p ?? 0)),
    ubah90: bulat2(persen(akhir.p, mundur(90)?.p ?? 0)),
    ubah365: bulat2(persen(akhir.p, mundur(365)?.p ?? 0)),
    min: { t: min.t, p: bulat2(min.p) },
    maks: { t: maks.t, p: bulat2(maks.p) },
    rata: bulat2(rata),
    // Koefisien variasi, bukan simpangan baku telanjang: Rp500 pada beras dan Rp500 pada
    // cabai bukan gejolak yang sebanding.
    gejolak: bulat2((sd / rata) * 100),
    ...(musim ? { musim } : {}),
    bolong: Math.max(0, bolong),
  };
}

// ---------------------------------------------------------------------------
// Susun
// ---------------------------------------------------------------------------
const slug = (s) =>
  (s ?? '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').slice(0, 80).replace(/^-+|-+$/g, '');

const idLama = new Map();
if (existsSync(NDJSON)) for (const r of bacaNdjson(NDJSON)) idLama.set(r.key, r.id);

const terpakaiKey = new Set();
const urut = [...varian].sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
for (const v of urut) {
  let k = slug(v.nama);
  let n = 2;
  while (terpakaiKey.has(k)) k = `${slug(v.nama)}-${n++}`;
  terpakaiKey.add(k);
  v._key = k;
}

const terpakaiNomor = new Set([...idLama.values()].map((id) => Number(id.split(':')[2])));
let berikut = BLOK.from;
const nomorBaru = () => {
  while (terpakaiNomor.has(berikut)) berikut++;
  if (berikut > BLOK.to) throw new Error(`Blok hrg ${BLOK.from}–${BLOK.to} habis.`);
  terpakaiNomor.add(berikut);
  return berikut;
};

// SP2KP menerbitkan 88 varian dan mengisi angkanya hanya untuk 43. Yang 45 lagi kosong di
// KEEMPAT ukuran tertimbang — bukan cuma di yang dipakai layar — dan `is_nasional` tidak
// menjelaskannya: 43 dari 45 justru bertanda nasional. Termasuk di dalamnya keempat harga
// pupuk dan kedua harga benih, yang docs/16 sudah sebut sebagai "arsip mati": 13–15 tanggal
// mingguan pada paruh pertama 2024, lalu berhenti.
//
// Varian kosong TETAP jadi entitas. Menghapusnya berarti pencarian "Pupuk Urea" menjawab nol,
// dan nol terbaca sebagai "tidak ada harganya di mana pun" — padahal yang benar adalah
// "SP2KP mendaftarkannya dan tidak mengisi satu pun angkanya". Keduanya pernyataan berbeda,
// dan yang kedua justru mengarahkan orang ke sumber lain.
const items = urut.map((v) => {
  const titik = v.titik.filter((p) => p.p !== null && p.p !== undefined && p.p > 0)
    .map((p) => ({ t: p.t, p: Math.round(p.p * 100) / 100 }));
  const cocok = sambungKomoditas(v.nama);
  const id = idLama.get(v._key) ?? `op:hrg:${String(nomorBaru()).padStart(8, '0')}`;

  if (!titik.length) {
    const berangkaLain = v.titik.some((p) => [p.s, p.gp, p.gs].some((x) => x > 0));
    const tanggal = v.titik.map((p) => p.t).sort();
    return {
      id,
      key: v._key,
      label: { id: v.nama },
      ...(v.komoditas ? { commodity_group: v.komoditas } : {}),
      ...(cocok ? { commodity: { id: cocok.id, label: cocok.nama } } : {}),
      price_level: 'retail',
      sector: golongan(v),
      unit: satuanTeks(v.satuan),
      ...(v.qty ? { qty: v.qty } : {}),
      weighting: 'penduduk',
      coverage: { points: 0 },
      empty_reason:
        `SP2KP menerbitkan ${v.titik.length} tanggal untuk varian ini (${tanggal[0]} s.d. ${tanggal.at(-1)}) tetapi ` +
        `tidak mengisi satu pun harganya — kosong pada keempat ukuran tertimbang, bukan hanya pada yang dipakai layar` +
        `${berangkaLain ? ', kecuali sebagian kecil' : ''}. Ini bukan pernyataan bahwa komoditasnya tidak berharga; ` +
        `ini pernyataan bahwa sumber ini tidak memuat harganya.`,
      mappings: [
        ...(v.kode ? [{ scheme: 'KEMENDAG', id: String(v.kode), relation: 'exact', note: 'Kode varian pada SP2KP Kemendag.' }] : []),
        ...(v.kode_kbki ? [{ scheme: 'BPS', id: String(v.kode_kbki), relation: 'exact', note: `KBKI — ${v.nama_kbki_bps || 'Klasifikasi Baku Komoditas Indonesia'}.` }] : []),
      ],
      ...(!v.kode && !v.kode_kbki
        ? { no_mapping_reason: 'Varian ini tidak membawa kode SP2KP maupun KBKI pada tarikan 23 Agustus 2026.' }
        : {}),
      lifecycle: { version: '0.1.0', status: 'draft', created_at: '2026-08-23T00:00:00Z' },
    };
  }

  return {
    id,
    key: v._key,
    label: { id: v.nama },
    ...(v.komoditas ? { commodity_group: v.komoditas } : {}),
    ...(cocok ? { commodity: { id: cocok.id, label: cocok.nama } } : {}),
    // Selalu retail. Lihat kepala berkas: tidak ada jalan bagi layar menayangkannya
    // sebagai harga petani, karena medannya memang tidak pernah bernilai lain.
    price_level: 'retail',
    sector: golongan(v),
    unit: satuanTeks(v.satuan),
    ...(v.qty ? { qty: v.qty } : {}),
    weighting: 'penduduk',
    coverage: {
      from: titik[0].t,
      to: titik.at(-1).t,
      points: titik.length,
      gaps: Math.max(0, hari(titik[0].t, titik.at(-1).t) + 1 - titik.length),
    },
    series: titik,
    stats: statistik(titik),
    mappings: [
      ...(v.kode ? [{ scheme: 'KEMENDAG', id: String(v.kode), relation: 'exact', note: 'Kode varian pada SP2KP Kemendag.' }] : []),
      ...(v.kode_kbki ? [{ scheme: 'BPS', id: String(v.kode_kbki), relation: 'exact', note: `KBKI — ${v.nama_kbki_bps || 'Klasifikasi Baku Komoditas Indonesia'}.` }] : []),
    ],
    ...(!v.kode && !v.kode_kbki
      ? { no_mapping_reason: 'Varian ini tidak membawa kode SP2KP maupun KBKI pada tarikan 23 Agustus 2026.' }
      : {}),
    lifecycle: { version: '0.1.0', status: 'draft', created_at: '2026-08-23T00:00:00Z' },
  };
});

// ---------------------------------------------------------------------------
// Laporan
// ---------------------------------------------------------------------------
const n = (x) => x.toLocaleString('id-ID');
const berangka = items.filter((x) => x.series);
const kosong = items.filter((x) => !x.series);
const bersambung = items.filter((x) => x.commodity).length;
const semuaTanggal = [...new Set(berangka.flatMap((x) => [x.coverage.from, x.coverage.to]))].sort();
const komoditasKosakata = new Set(komoditas.map((k) => k.id));
const komoditasBerharga = new Set(items.filter((x) => x.commodity).map((x) => x.commodity.id));

console.log(`Varian diterbitkan    : ${n(items.length)}`);
console.log(`  berangka            : ${n(berangka.length)}`);
console.log(`  KOSONG di 4 ukuran  : ${n(kosong.length)} — tetap jadi entitas beserta empty_reason`);
console.log(`Rentang               : ${semuaTanggal[0]} s.d. ${semuaTanggal.at(-1)}`);
console.log(`Titik harga           : ${n(berangka.reduce((a, x) => a + x.series.length, 0))}`);
console.log(`Tersambung ke komoditas: ${n(bersambung)} dari ${n(items.length)} varian`);
console.log(`  komoditas terjangkau : ${n(komoditasBerharga.size)} dari ${n(komoditasKosakata.size)} di kosakata`);
const perGolongan = {};
for (const x of items) perGolongan[x.sector] = (perGolongan[x.sector] ?? 0) + 1;
const berangkaGol = {};
for (const x of berangka) berangkaGol[x.sector] = (berangkaGol[x.sector] ?? 0) + 1;
console.log(`Golongan              : pangan ${n(perGolongan.pangan ?? 0)} · input ${n(perGolongan.input ?? 0)} · luar ${n(perGolongan.luar ?? 0)}`);
console.log(`  berangka per golongan: pangan ${n(berangkaGol.pangan ?? 0)} · input ${n(berangkaGol.input ?? 0)} · luar ${n(berangkaGol.luar ?? 0)}`);
console.log(`  yang TAMPIL di layar : ${n((berangkaGol.pangan ?? 0) + (berangkaGol.input ?? 0))} berangka, dari ${n((perGolongan.pangan ?? 0) + (perGolongan.input ?? 0))} varian tani`);
console.log(`  disembunyikan layar  : ${n(perGolongan.luar ?? 0)} — bahan bangunan, LPG, dan pangan olahan`);
console.log(`Bermusim (≥12 bulan)  : ${n(berangka.filter((x) => x.stats.musim).length)}`);
console.log(`Seri berlubang        : ${n(berangka.filter((x) => x.coverage.gaps > 0).length)} varian punya hari tanpa angka`);
console.log(`Sisi pupuk & benih    : ${items.filter((x) => /^(pupuk|benih)/i.test(x.label.id)).map((x) => `${x.label.id}${x.series ? '' : ' (kosong)'}`).join(' · ') || '—'}`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyimpan ke spec/vocab/harga/.');
  process.exit(0);
}

const meta = {
  $schema: '../../schema/collection.schema.json',
  collection: {
    entity_type: 'harga',
    label: { id: 'Harga eceran nasional tertimbang — SP2KP' },
    scope: {
      id: `${items.length} varian komoditas dengan harga eceran harian nasional tertimbang penduduk, ${semuaTanggal[0]} sampai ${semuaTanggal.at(-1)}. SELURUHNYA TINGKAT ECERAN — bukan harga yang diterima petani, dan jaraknya terpasang di dalam definisi sumbernya, bukan celah cakupan yang bisa dirapatkan (docs/16 bagian 4). Cakupannya juga tidak menyeluruh: ${items.length - bersambung} dari ${items.length} varian bukan komoditas tani sama sekali — besi beton, semen, triplek, LPG, paku — dan hanya ${komoditasBerharga.size} komoditas di kosakata sendiri yang punya harga. Empat ukuran tertimbang tersedia di sumbernya; yang disimpan di sini hanya tertimbang penduduk, sisanya di harga_data/sp2kp-hnt.ndjson.`,
    },
    lifecycle: {
      version: '0.1.0',
      status: 'draft',
      created_at: '2026-08-23T00:00:00Z',
      review_due: '2026-09-23',
    },
    provenance: {
      license: 'Data Terbuka (Portal Satu Data Kemendag) — penggunaan komersial diizinkan, atribusi wajib',
      sources: [
        {
          title: 'Harga Nasional Tertimbang (HNT) — SP2KP',
          publisher: 'Kementerian Perdagangan RI',
          url: 'https://sp2kp.kemendag.go.id/',
          year: 2026,
          locator: `Endpoint GET api-sp2kp.kemendag.go.id/report/api/hnt; satu permintaan untuk seluruh riwayat. Endpoint average-price-public SENGAJA TIDAK dipakai karena membawa NIK, NIP, nomor telepon, dan alamat pencacah pada tiap rekaman. Atribusi wajib: "${ATRIBUSI}"`,
          retrieved: '2026-08-23',
        },
      ],
    },
    storage: 'ndjson',
    count: items.length,
    id_blocks: [BLOK],
  },
};

mkdirSync(KELUAR, { recursive: true });
writeFileSync(NDJSON, items.map((x) => JSON.stringify(x)).join('\n') + '\n');
writeFileSync(META, JSON.stringify(meta, null, 2) + '\n');
console.log(`\nDitulis ke ${KELUAR}`);
