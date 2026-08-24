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

// ---------- Rujukan wilayah ----------
// Kosakata wilayah (op:rgn) sekarang ADA, jadi janji yang tertulis di harga.schema.json
// ditagih di sini: "Begitu kosakata wilayah benar-benar dibangun, medan `id` bisa
// ditambahkan di sampingnya tanpa membatalkan yang ini."
//
// Dicocokkan menurut NAMA, bukan menurut tabel kode ISO yang ditulis tangan. Tabel
// tulis-tangan adalah tempat kekeliruan diam bersembunyi — dan repositori ini sudah
// punya satu contohnya: `op:rgn:00003318` berlabel "Kabupaten Rembang" ternyata kode
// Pati. Pencocokan nama gagal berisik, tabel tulis-tangan gagal diam-diam.
const KAMUS_WILAYAH = (() => {
  const f = new URL('../vocab/region/wilayah.ndjson', import.meta.url);
  const m = new Map();
  for (const baris of readFileSync(f, 'utf8').split('\n')) {
    if (!baris.trim()) continue;
    const e = JSON.parse(baris);
    if (e.level !== 'province') continue;
    m.set(rapikanNama(e.label.id), { id: e.id, label: e.label.id });
  }
  return m;
})();

// "Kep. Bangka Belitung" (BPS) dan "Kepulauan Bangka Belitung" (ISO) tempat yang sama.
function rapikanNama(s) {
  return String(s).toLowerCase().replace(/\bkep\.?\b/g, 'kepulauan').replace(/[^a-z]+/g, '');
}

function wilayahRef(kode, label) {
  const w = KAMUS_WILAYAH.get(rapikanNama(label));
  if (!w) throw new Error(`Provinsi "${label}" tidak ada di kosakata wilayah. Jalankan node spec/tools/bangun-wilayah.mjs --tulis lebih dulu.`);
  // Label ASLI dipertahankan, bukan ditimpa nama BPS: "Kepulauan Bangka Belitung" itulah
  // yang tertulis di sumber harganya, dan konvensi repositori ini melarang menimpa nama asli.
  return { id: w.id, code: kode, label };
}

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tulis = process.argv.includes('--tulis');
const MASUK = join(akar, 'harga_data', 'sp2kp-hnt.ndjson');
const KELUAR = join(akar, 'spec', 'vocab', 'harga');
const NDJSON = join(KELUAR, 'harga.ndjson');
const META = join(KELUAR, 'harga.meta.json');

const BLOK = { from: 1000, to: 1999 };

const ATRIBUSI =
  'Sumber: Portal Satu Data Kementerian Perdagangan (satudata.kemendag.go.id) – 2026, diolah kembali oleh Pranatani.';

if (!existsSync(MASUK)) {
  console.error(`${MASUK} tidak ada. Jalankan dulu: node harga_data/tarik-sp2kp.mjs`);
  process.exit(1);
}

const bacaNdjson = (p) =>
  readFileSync(p, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
const bacaJson = (p) => JSON.parse(readFileSync(join(akar, 'spec', 'vocab', p), 'utf8'));

const varian = bacaNdjson(MASUK);

// Sumber kedua: penetapan TBS Kalimantan Barat. Opsional — indeks tetap terbangun tanpanya.
const TBS_KALBAR = join(akar, 'harga_data', 'tbs-kalbar.ndjson');
const tbsKalbar = existsSync(TBS_KALBAR) ? bacaNdjson(TBS_KALBAR) : [];
const TBS_RIAU = join(akar, 'harga_data', 'tbs-riau.ndjson');
const tbsRiau = existsSync(TBS_RIAU) ? bacaNdjson(TBS_RIAU) : [];
const TBS_KALTENG = join(akar, 'harga_data', 'tbs-kalteng.ndjson');
const tbsKalteng = existsSync(TBS_KALTENG) ? bacaNdjson(TBS_KALTENG) : [];
const TBS_KALTIM = join(akar, 'harga_data', 'tbs-kaltim.ndjson');
const tbsKaltim = existsSync(TBS_KALTIM) ? bacaNdjson(TBS_KALTIM) : [];
const TBS_BABEL = join(akar, 'harga_data', 'tbs-babel.ndjson');
const tbsBabel = existsSync(TBS_BABEL) ? bacaNdjson(TBS_BABEL) : [];
const TBS_ACEH = join('harga_data', 'tbs-aceh.ndjson');
const tbsAceh = existsSync(TBS_ACEH) ? bacaNdjson(TBS_ACEH) : [];

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
//   luar     bahan bangunan, LPG, PANGAN OLAHAN, dan BARANG IMPOR — ketiganya keluar lewat
//            satu pertanyaan yang sama: apakah harga ini dihadapi yang menghasilkan barangnya?
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

// Barang impor keluar lewat aturan yang SAMA, bukan aturan tambahan: tidak ada petani
// Indonesia yang menghadapi harga daging sapi impor beku atau kedelai impor, jadi
// menayangkannya di sini menyiratkan hubungan yang tidak ada — persis seperti gula terhadap
// petani tebu.
//
// Ini POLA, bukan daftar nama, dan itu satu-satunya tempat di berkas ini yang memakai pola.
// Alasannya: asal impor dinyatakan SP2KP di dalam nama variannya sendiri — "Daging Sapi
// Impor Beku", "Kedelai Impor", "Daging Kerbau Impor Beku". Selama penamaan itu bertahan,
// varian impor baru ikut tersaring tanpa ada yang perlu ingat menambahkannya.
//
// BATASNYA, dan ia nyata: yang tersaring hanya yang MENGAKU impor di namanya. Bawang Putih
// Honan dan Bawang Putih Kating hampir seluruhnya impor dari Tiongkok — Indonesia memenuhi
// sekitar 5% kebutuhan bawang putihnya sendiri — tetapi namanya tidak menyebutkannya, jadi
// keduanya lolos. Mengeluarkannya menuntut pengetahuan yang tidak ada di data ini, dan
// menuliskannya sebagai daftar nama berarti mengaku begitu. Dibiarkan, dan dicatat di sini.
const BERNAMA_IMPOR = /\bimpor\b/i;

function golongan(v) {
  if (INDUK_INPUT.has(v.komoditas)) return 'input';
  if (PANGAN_OLAHAN.has(v.nama)) return 'luar';
  if (BERNAMA_IMPOR.test(v.nama)) return 'luar';
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
  // Titik acuan untuk perubahan berjangka: yang terakhir PADA ATAU SEBELUM n hari lalu.
  // Untuk seri harian itu tepat n hari; untuk seri penetapan yang terbit dua pekan sekali —
  // atau, seperti Aceh, beberapa kali setahun — ia bisa jauh lebih tua. Riau mitra plasma
  // memakai titik 56 hari lalu untuk jendela "7 hari", dan Aceh 112 hari untuk "30 hari".
  //
  // Angkanya sendiri benar; yang salah LABELNYA. "turun 2,3% dalam 30 hari" untuk perubahan
  // yang sebenarnya memakan 112 hari bukan pembulatan, ia pernyataan yang keliru tentang
  // seberapa cepat harga bergerak. Karena itu jarak sesungguhnya ikut dikeluarkan, dan yang
  // menuliskan jangkanya di layar memakai angka ini alih-alih nama jendelanya.
  const mundur = (n) => {
    const d = new Date(akhir.t);
    d.setUTCDate(d.getUTCDate() - n);
    return padaAtauSebelum(titik, d.toISOString().slice(0, 10));
  };
  const jarakHari = (n) => {
    const r = mundur(n);
    if (!r) return null;
    return Math.round((new Date(akhir.t) - new Date(r.t)) / 86400000);
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
    // Jarak sebenarnya tiap jendela, dalam hari. Lihat catatan di `mundur` di atas.
    ubahHari: { 7: jarakHari(7), 30: jarakHari(30), 90: jarakHari(90), 365: jarakHari(365) },
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
      source_system: 'SP2KP',
      basis: 'survei',
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
    source_system: 'SP2KP',
    basis: 'survei',
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
// TBS Kalimantan Barat — harga pertama di repositori ini yang menyentuh sisi pekebun
// ---------------------------------------------------------------------------
// SATU rekaman, bukan enam belas. Sumbernya memberi 13 pita umur ditambah CPO, PKO, dan
// Indeks K pada tiap periode — enam belas seri kalau tiap kolom jadi rekaman sendiri. Tetapi
// lima belas di antaranya BUKAN harga yang dihadapi siapa pun:
//
//   pita umur   satu kebun hanya menghadapi pitanya sendiri, bukan ketiga belasnya
//   CPO & PKO   harga yang dihadapi pabrik, bukan pekebun
//   Indeks K    bukan harga sama sekali — ia proporsi nilai CPO yang mengalir ke pekebun
//
// Ketiganya rumus DI BALIK harga yang dihadapi pekebun, jadi ia dibawa di dalam rekamannya
// (`formula` dan `age_bands`) alih-alih berdiri sebagai baris tersendiri di daftar. Itu juga
// yang membuat aturan tayang docs/16 butir 3 bisa ditegakkan: faktor konversinya terbuka dan
// ada di layar yang sama, bukan di halaman lain.
//
// Yang jadi `series` kolom RERATA — satu angka per periode, bisa digambar dan dibandingkan.
const itemsTbs = [];
// Sumbu tabel pita dan arti garis grafiknya ikut DATA, bukan diasumsikan perender.
//
// Sebabnya ketahuan saat Aceh masuk: pita swadayanya persentase tenera, bukan tahun, dan
// perender yang menempelkan "tahun" pada tiap pita akan menayangkan "40 tahun" untuk kebun
// yang komposisinya 40% tenera. Satuan yang salah bukan salah tulis — ia angka yang berbeda.
//
// Sekalian memperbaiki yang lebih lama: perender menutup tabelnya dengan kalimat "ia
// rata-rata seluruh pita", padahal TIDAK SATU PUN dari enam provinsi memakai rata-rata —
// semuanya memakai pita puncak atau pita tertentu, dan tiap keterangannya sudah menyebutkan
// itu. Layar karena itu membantah keterangannya sendiri di kartu yang sama. `grafik`
// menutupnya: yang tahu arti garisnya pembangun, bukan penyaji.
const SUMBU_UMUR = { judul: 'Umur tanaman', sufiks: ' tahun' };

if (tbsKalbar.length) {
  const titik = tbsKalbar
    .filter((r) => r.tbs_rerata > 0)
    .map((r) => ({ t: r.t, p: Math.round(r.tbs_rerata * 100) / 100 }));

  if (titik.length) {
    const key = 'tbs-kelapa-sawit-kalimantan-barat';
    const id = idLama.get(key) ?? `op:hrg:${String(nomorBaru()).padStart(8, '0')}`;
    const sawit = komoditas.find((k) => rapikan(k.nama).includes('kelapasawit'));

    itemsTbs.push({
      id,
      key,
      label: { id: 'TBS Kelapa Sawit — Kalimantan Barat' },
      commodity_group: 'Kelapa Sawit',
      ...(sawit ? { commodity: { id: sawit.id, label: sawit.nama } } : {}),
      // Kode ISO 3166-2:ID, bukan rujukan op:rgn: — kosakata wilayah belum ada, dan mencetak
      // satu entitas untuk satu provinsi meninggalkan jenis entitas setengah jadi.
      region: wilayahRef('ID-KB', 'Kalimantan Barat'),
      source_system: 'SIDIKH-TBS',
      basis: 'penetapan',
      // Medan yang paling menentukan di seluruh rekaman ini. Tanpa kalimat ini, layar
      // menayangkan harga yang TIDAK diterima mayoritas pembacanya seolah harga mereka.
      legal_scope:
        'Menaungi pekebun mitra dan plasma menurut Permentan 13/2024 tentang Pembelian Tandan Buah Segar Kelapa Sawit Produksi Pekebun Mitra. PEKEBUN SWADAYA BERADA DI LUAR CAKUPANNYA — dan pekebun swadaya adalah mayoritas petani sawit Indonesia. Harga yang mereka terima tidak diterbitkan lembaga mana pun kecuali Riau, dan tidak ada di sini.',
      price_level: 'farmgate',
      sector: 'pangan',
      unit: 'kg',
      qty: 1,
      // Tanggal harian nominal: yang ditetapkan periode, bukan hari.
      nominal_dates: true,
      coverage: {
        from: titik[0].t,
        to: titik.at(-1).t,
        points: titik.length,
        gaps: 0,
      },
      series: titik,
      stats: statistik(titik),
      age_bands: {
        keterangan:
          'Harga per pita umur tanaman, rupiah per kg, pada periode terakhir. Sawit berbuah berbeda menurut umur — meratakannya jadi satu angka membuang pembedaan yang menentukan berapa yang diterima satu kebun tertentu.',
        sumbu: SUMBU_UMUR,
        grafik: 'Garis grafik memakai pita tertinggi periode itu.',
        pita: Object.keys(tbsKalbar.at(-1).tbs_umur),
        terakhir: tbsKalbar.at(-1).tbs_umur,
        seri: tbsKalbar.map((r) => ({ t: r.t, u: r.tbs_umur })),
      },
      formula: {
        keterangan:
          'Angka pembentuk harga TBS pada tiap periode. Indeks K adalah proporsi nilai CPO yang mengalir ke pekebun; CPO dan PKO harga yang dihadapi pabrik, bukan pekebun.',
        terakhir: {
          indeks_k: tbsKalbar.at(-1).indeks_k,
          cpo: tbsKalbar.at(-1).cpo,
          pko: tbsKalbar.at(-1).pko,
        },
        seri: tbsKalbar.map((r) => ({ t: r.t, k: r.indeks_k, cpo: r.cpo, pko: r.pko })),
      },
      mappings: [{
        scheme: 'KEMENTAN',
        id: 'Permentan 13/2024',
        relation: 'related',
        note: 'Penetapan harga TBS pekebun mitra oleh tim provinsi; dasar perhitungan Kepdirjenbun 144/Kpts./PP.320/E/12/2025.',
      }],
      lifecycle: { version: '0.1.0', status: 'draft', created_at: '2026-08-23T00:00:00Z' },
    });
  }
}

// ---------------------------------------------------------------------------
// TBS Riau — dua seri, dan salah satunya tidak ada di provinsi mana pun
// ---------------------------------------------------------------------------
// Riau menerbitkan penetapan mingguan untuk DUA kelompok pekebun secara terpisah: mitra
// plasma, dan SWADAYA. Yang kedua itu yang menentukan: Permentan 13/2024 hanya menaungi
// pekebun mitra, sehingga di provinsi lain pekebun swadaya tidak punya angka sama sekali.
// Riau menerbitkannya, dan sejauh riset ini menjangkau, hanya Riau.
//
// Angkanya harga pada UMUR 9 TAHUN — puncak kurva hasil sawit, dan tertinggi di antara
// seluruh pita umur. Sumbernya menyebutkannya sendiri: pada artikel yang memuat tabel penuh,
// baris umur 9 diberi keterangan "(tertinggi)". Menayangkannya tanpa menyebut umurnya akan
// menaksir terlalu tinggi apa yang diterima kebun muda maupun kebun tua.
const RIAU_JENIS = {
  swadaya: {
    label: 'TBS Kelapa Sawit — Riau (pekebun swadaya)',
    key: 'tbs-kelapa-sawit-riau-swadaya',
    scope:
      'Diterbitkan Dinas Perkebunan Provinsi Riau sebagai seri terpisah untuk pekebun SWADAYA, di samping seri mitra plasma. Ini satu-satunya harga pekebun swadaya yang diterbitkan pemerintah daerah mana pun di Indonesia — Permentan 13/2024 hanya menaungi pekebun mitra, sehingga di provinsi lain kelompok ini tidak punya angka sama sekali. BELUM DIPASTIKAN apakah seri swadaya ini membawa daya ikat hukum yang sama dengan penetapan mitra, atau diterbitkan sebagai keterangan; yang pasti hanya bahwa ia diumumkan rapat penetapan yang sama.',
  },
  plasma: {
    label: 'TBS Kelapa Sawit — Riau (mitra plasma)',
    key: 'tbs-kelapa-sawit-riau-plasma',
    scope:
      'Menaungi pekebun mitra dan plasma menurut Permentan 13/2024 tentang Pembelian Tandan Buah Segar Kelapa Sawit Produksi Pekebun Mitra, dengan dasar perhitungan Kepdirjenbun 144/Kpts./PP.320/E/12/2025. Pekebun swadaya berada di luar cakupannya — untuk mereka, Riau menerbitkan seri terpisah.',
  },
};

for (const [jenis, sp] of Object.entries(RIAU_JENIS)) {
  const baris = tbsRiau.filter((r) => r.jenis === jenis && r.tbs > 0)
    .sort((a, b) => a.t.localeCompare(b.t));
  if (!baris.length) continue;

  const titik = baris.map((r) => ({ t: r.t, p: Math.round(r.tbs * 100) / 100 }));
  const id = idLama.get(sp.key) ?? `op:hrg:${String(nomorBaru()).padStart(8, '0')}`;
  const sawit = komoditas.find((k) => rapikan(k.nama).includes('kelapasawit'));
  const bertabel = baris.filter((r) => r.tbs_umur);
  const terakhirBertabel = bertabel.at(-1);
  const berIndeks = baris.filter((r) => r.indeks_k);

  itemsTbs.push({
    id,
    key: sp.key,
    label: { id: sp.label },
    commodity_group: 'Kelapa Sawit',
    ...(sawit ? { commodity: { id: sawit.id, label: sawit.nama } } : {}),
    region: wilayahRef('ID-RI', 'Riau'),
    source_system: 'Media Center Riau',
    basis: 'penetapan',
    legal_scope: sp.scope,
    price_level: 'farmgate',
    sector: 'pangan',
    unit: 'kg',
    qty: 1,
    coverage: { from: titik[0].t, to: titik.at(-1).t, points: titik.length, gaps: 0 },
    series: titik,
    stats: statistik(titik),
    ...(terakhirBertabel ? {
      age_bands: {
        keterangan:
          `Harga per pita umur tanaman pada penetapan ${terakhirBertabel.t}, terurai dari prosa artikelnya. Umur 9 tahun adalah puncak kurva hasil — sumbernya sendiri menandainya "(tertinggi)" — dan angka pada grafik di atas memakai pita itu, bukan rata-rata. Tabel penuh hanya tersedia pada ${bertabel.length} dari ${baris.length} penetapan; sisanya hanya mengumumkan angka umur 9.`,
        sumbu: SUMBU_UMUR,
        grafik: 'Garis grafik memakai pita umur 9 tahun — puncak kurva hasil, dan satu-satunya pita yang diumumkan tiap pekan.',
        pita: Object.keys(terakhirBertabel.tbs_umur),
        terakhir: terakhirBertabel.tbs_umur,
        seri: bertabel.map((r) => ({ t: r.t, u: r.tbs_umur })),
      },
    } : {}),
    ...(berIndeks.length ? {
      formula: {
        keterangan:
          `Indeks K pada tiap penetapan — proporsi nilai CPO yang mengalir ke pekebun. Tersedia pada ${berIndeks.length} dari ${baris.length} penetapan; artikel yang tidak menyebutkannya dibiarkan kosong alih-alih diisi dari periode lain.`,
        terakhir: { indeks_k: berIndeks.at(-1).indeks_k, ...(berIndeks.at(-1).cangkang ? { cangkang: berIndeks.at(-1).cangkang } : {}) },
        seri: berIndeks.map((r) => ({ t: r.t, k: r.indeks_k, ...(r.cangkang ? { cangkang: r.cangkang } : {}) })),
      },
    } : {}),
    mappings: [{
      scheme: 'KEMENTAN',
      id: 'Permentan 13/2024',
      relation: 'related',
      note: 'Penetapan harga TBS oleh tim provinsi Riau; diumumkan lewat Media Center Riau sebagai prosa berangka.',
    }],
    lifecycle: { version: '0.1.0', status: 'draft', created_at: '2026-08-23T00:00:00Z' },
  });
}


// ---------------------------------------------------------------------------
// TBS Kalimantan Tengah
// ---------------------------------------------------------------------------
// Arsip terdalam dari ketiga provinsi — mundur sampai Januari 2021. Bentuknya sama dengan
// Riau: prosa, tabel umur di dalam kalimat, dan angka utama pada pita puncak.
//
// Pita puncaknya BERBEDA dari Riau, dan itu perlu dinyatakan alih-alih diratakan. Riau
// mengumumkan umur 9; Kalteng mengumumkan pita 10–20 tahun. Keduanya puncak kurva hasil di
// daerahnya, tetapi keduanya pita yang berlainan — menyandingkan angkanya tanpa menyebut
// pitanya berarti membandingkan dua hal yang berbeda.
if (tbsKalteng.length) {
  const baris = tbsKalteng.filter((r) => r.tbs > 0).sort((a, b) => a.t.localeCompare(b.t));
  const titik = baris.map((r) => ({ t: r.t, p: Math.round(r.tbs * 100) / 100 }));
  const key = 'tbs-kelapa-sawit-kalimantan-tengah';
  const id = idLama.get(key) ?? `op:hrg:${String(nomorBaru()).padStart(8, '0')}`;
  const sawit = komoditas.find((k) => rapikan(k.nama).includes('kelapasawit'));
  const akhir = baris.at(-1);
  const berIndeks = baris.filter((r) => r.indeks_k);
  const nominal = baris.filter((r) => r.tanggal_nominal).length;
  const pitaCacah = {};
  for (const r of baris) pitaCacah[r.pita_puncak] = (pitaCacah[r.pita_puncak] ?? 0) + 1;

  itemsTbs.push({
    id,
    key,
    label: { id: 'TBS Kelapa Sawit — Kalimantan Tengah' },
    commodity_group: 'Kelapa Sawit',
    ...(sawit ? { commodity: { id: sawit.id, label: sawit.nama } } : {}),
    region: wilayahRef('ID-KT', 'Kalimantan Tengah'),
    source_system: 'Media Center Kalteng',
    basis: 'penetapan',
    legal_scope:
      'Menaungi pekebun mitra menurut Permentan 13/2024 tentang Pembelian Tandan Buah Segar Kelapa Sawit Produksi Pekebun Mitra. Artikel penetapannya menyebutkan sendiri bahwa hasil perhitungan "dibayarkan kepada semua pekebun mitra". PEKEBUN SWADAYA BERADA DI LUAR CAKUPANNYA, dan Kalteng tidak menerbitkan seri terpisah untuk mereka — hanya Riau yang melakukannya.',
    price_level: 'farmgate',
    sector: 'pangan',
    unit: 'kg',
    qty: 1,
    ...(nominal ? { nominal_dates: true } : {}),
    coverage: { from: titik[0].t, to: titik.at(-1).t, points: titik.length, gaps: 0 },
    series: titik,
    stats: statistik(titik),
    age_bands: {
      keterangan:
        `Harga per pita umur tanaman pada penetapan ${akhir.t}, terurai dari prosa artikelnya. Angka pada grafik memakai PITA PUNCAK tiap periode — ${Object.entries(pitaCacah).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} tahun pada ${v} penetapan`).join(', ')} — bukan rata-rata seluruh pita. Satu kebun hanya menghadapi pitanya sendiri.`,
      sumbu: SUMBU_UMUR,
      grafik: 'Garis grafik memakai pita puncak tiap periode.',
      pita: Object.keys(akhir.tbs_umur),
      terakhir: akhir.tbs_umur,
      seri: baris.map((r) => ({ t: r.t, u: r.tbs_umur })),
    },
    ...(berIndeks.length ? {
      formula: {
        keterangan:
          `Indeks K dan harga CPO/PK pada tiap penetapan. Tersedia pada ${berIndeks.length} dari ${baris.length} penetapan; yang tidak menyebutkannya dibiarkan kosong alih-alih diisi dari periode lain.`,
        terakhir: {
          indeks_k: berIndeks.at(-1).indeks_k,
          ...(berIndeks.at(-1).cpo ? { cpo: berIndeks.at(-1).cpo } : {}),
          ...(berIndeks.at(-1).pk ? { pko: berIndeks.at(-1).pk } : {}),
        },
        seri: berIndeks.map((r) => ({ t: r.t, k: r.indeks_k, ...(r.cpo ? { cpo: r.cpo } : {}), ...(r.pk ? { pko: r.pk } : {}) })),
      },
    } : {}),
    mappings: [{
      scheme: 'KEMENTAN',
      id: 'Permentan 13/2024',
      relation: 'related',
      note: 'Penetapan harga TBS oleh tim Pokja provinsi Kalteng; diumumkan lewat Media Center Kalteng sebagai prosa berangka.',
    }],
    lifecycle: { version: '0.1.0', status: 'draft', created_at: '2026-08-23T00:00:00Z' },
  });
}


// ---------------------------------------------------------------------------
// Kaltim dan Babel — keduanya lewat OCR, dan keduanya berbentuk sama
// ---------------------------------------------------------------------------
// Dibangun lewat satu fungsi, bukan dua salinan. Kalbar dan Riau di atas masih blok
// tersendiri karena bentuknya memang lain — Kalbar punya kolom rumusnya sendiri, Riau punya
// dua seri terpisah. Kalau provinsi ketujuh masuk kelak, ketiga blok itu layak disatukan;
// hari ini menyatukannya berarti menulis ulang kode yang sudah bekerja demi kerapian saja.
function buatTbs({ baris, key, label, kode, wilayah, sistem, cakupanHukum, catatanPita, rendemen }) {
  if (!baris.length) return null;
  const urut = [...baris].filter((r) => r.tbs > 0).sort((a, b) => a.t.localeCompare(b.t));
  if (!urut.length) return null;
  const titik = urut.map((r) => ({ t: r.t, p: Math.round(r.tbs * 100) / 100 }));
  const akhir = urut.at(-1);
  const berIndeks = urut.filter((r) => r.indeks_k);
  const nominal = urut.filter((r) => r.tanggal_nominal).length;
  const sawit = komoditas.find((k) => rapikan(k.nama).includes('kelapasawit'));

  return {
    id: idLama.get(key) ?? `op:hrg:${String(nomorBaru()).padStart(8, '0')}`,
    key,
    label: { id: label },
    commodity_group: 'Kelapa Sawit',
    ...(sawit ? { commodity: { id: sawit.id, label: sawit.nama } } : {}),
    region: wilayahRef(kode, wilayah),
    source_system: sistem,
    basis: 'penetapan',
    legal_scope: cakupanHukum,
    price_level: 'farmgate',
    sector: 'pangan',
    unit: 'kg',
    qty: 1,
    ...(nominal ? { nominal_dates: true } : {}),
    coverage: { from: titik[0].t, to: titik.at(-1).t, points: titik.length, gaps: 0 },
    series: titik,
    stats: statistik(titik),
    age_bands: {
      keterangan: catatanPita,
      sumbu: SUMBU_UMUR,
      grafik: 'Garis grafik memakai pita tertinggi periode itu.',
      pita: Object.keys(akhir.tbs_umur),
      terakhir: akhir.tbs_umur,
      seri: urut.map((r) => ({ t: r.t, u: r.tbs_umur })),
    },
    ...(berIndeks.length || rendemen ? {
      formula: {
        keterangan: [
          berIndeks.length
            ? `Indeks K dan harga bahan pada tiap penetapan; tersedia pada ${berIndeks.length} dari ${urut.length}.`
            : null,
          rendemen ? rendemen.keterangan : null,
        ].filter(Boolean).join(' '),
        ...(berIndeks.length ? {
          terakhir: {
            indeks_k: berIndeks.at(-1).indeks_k,
            ...(berIndeks.at(-1).cpo ? { cpo: berIndeks.at(-1).cpo } : {}),
            ...(berIndeks.at(-1).inti_sawit ?? berIndeks.at(-1).kernel ? { pko: berIndeks.at(-1).inti_sawit ?? berIndeks.at(-1).kernel } : {}),
          },
          seri: berIndeks.map((r) => ({
            t: r.t, k: r.indeks_k,
            ...(r.cpo ? { cpo: r.cpo } : {}),
            ...(r.inti_sawit ?? r.kernel ? { pko: r.inti_sawit ?? r.kernel } : {}),
          })),
        } : {}),
        ...(rendemen ? { rendemen: rendemen.isi } : {}),
      },
    } : {}),
    mappings: [{
      scheme: 'KEMENTAN', id: 'Permentan 13/2024', relation: 'related',
      note: `Penetapan harga TBS oleh tim provinsi ${wilayah}.`,
    }],
    lifecycle: { version: '0.1.0', status: 'draft', created_at: '2026-08-23T00:00:00Z' },
  };
}

// Kaltim membawa yang tidak dibawa provinsi mana pun: RENDEMEN per pita umur, di dalam surat
// keputusan yang bukan objek hak cipta. docs/16 bagian 7a menyimpulkan satu-satunya sumber
// rendemen terukur yang bisa dikutip adalah MPOB Malaysia — dan MPOB benih privat. Ini
// menggantinya dengan sumber Indonesia yang boleh terbit.
const kaltimBerRendemen = tbsKaltim.filter((r) => Object.keys(r.rendemen_cpo ?? {}).length >= 6);
const rendemenKaltim = kaltimBerRendemen.length ? (() => {
  const akhir = kaltimBerRendemen.at(-1);
  const semua = kaltimBerRendemen.flatMap((r) => Object.values(r.rendemen_cpo)).filter((x) => x > 0).sort((a, b) => a - b);
  return {
    keterangan:
      `Rendemen CPO per pita umur, dari surat keputusan penetapan — bukan asumsi. Pada ${akhir.t} nilainya ${(Math.min(...Object.values(akhir.rendemen_cpo)) * 100).toFixed(2)}% sampai ${(Math.max(...Object.values(akhir.rendemen_cpo)) * 100).toFixed(2)}% menurut umur tanaman. Ini menjawab langsung docs/16 bagian 7a: satu angka rendemen nasional memperlakukan seluruh kebun seolah setua satu sama lain, padahal selisih antar-umur di sini saja lebih dari dua poin.`,
    isi: {
      terakhir: akhir.rendemen_cpo,
      ...(akhir.rendemen_inti ? { inti_terakhir: akhir.rendemen_inti } : {}),
      median: Math.round(semua[Math.floor(semua.length / 2)] * 10000) / 10000,
      seri: kaltimBerRendemen.map((r) => ({ t: r.t, cpo: r.rendemen_cpo, ...(r.rendemen_inti ? { inti: r.rendemen_inti } : {}) })),
    },
  };
})() : null;

// ---------------------------------------------------------------------------
// Aceh — dua kelas pekebun, dua wilayah, dan sumbu yang berbeda di antara keduanya
// ---------------------------------------------------------------------------
// Aceh jadi provinsi KEDUA yang menerbitkan harga pekebun swadaya, sesudah Riau. Sampai
// sebelum ini dokumen ini menyatakan hanya Riau yang melakukannya; pernyataan itu keliru
// dan sudah dikoreksi di docs/16 bagian 8b.
//
// TETAPI SWADAYA-NYA TIDAK SEBANDING DENGAN SWADAYA RIAU, DAN ITU BUKAN RINCIAN
// Riau menetapkan harga swadaya menurut UMUR TANAMAN, sama seperti harga mitranya. Aceh
// menetapkannya menurut KOMPOSISI BAHAN TANAM — berapa persen tenera berbanding dura —
// dan tidak menyebut umur sama sekali. Sumbunya berlainan, jadi keduanya tidak boleh
// disandingkan sebagai "harga swadaya" begitu saja.
//
// Perbedaan sumbunya sendiri menerangkan sesuatu. Pekebun plasma kebunnya tercatat, jadi
// umurnya diketahui dan dipakai. Pekebun swadaya kebunnya tidak tercatat, jadi umurnya tidak
// diketahui — dan yang dipakai sebagai gantinya bahan tanamnya, karena dura menghasilkan
// minyak jauh lebih sedikit daripada tenera. Sumbu itu mengukur apa yang bisa diketahui
// tentang kebun yang tidak tercatat, bukan apa yang paling menentukan harganya.
//
// DUA WILAYAH, DAN YANG BARAT SELALU LEBIH RENDAH
// Aceh membelah provinsinya jadi wilayah timur dan barat, masing-masing dengan Indeks K
// sendiri. Yang tampil sebagai harga seri wilayah TIMUR; angka wilayah barat ikut dibawa
// utuh di `age_bands.barat` supaya selisihnya bisa dibaca, bukan hanya disebut. Memilih
// salah satu diam-diam akan membuat separuh Aceh membaca harga yang bukan miliknya.
if (tbsAceh.length) {
  const sawit = komoditas.find((k) => rapikan(k.nama).includes('kelapasawit'));
  const urut = [...tbsAceh].sort((a, b) => a.t.localeCompare(b.t));
  const CAKUPAN =
    'Menaungi pekebun mitra menurut Permentan 13/2024 tentang Pembelian Tandan Buah Segar Kelapa Sawit Produksi Pekebun Mitra. Aceh menerbitkan DUA kelas sekaligus — mitra plasma dan mitra swadaya — sehingga sebagian pekebun swadaya ikut tercakup, berbeda dari lima provinsi lain di repositori ini. Yang tetap tidak tercakup pekebun swadaya yang bukan mitra pabrik mana pun.';

  // Kunci pita diurutkan menurut nilai awalnya. Berlaku untuk kedua kelas: umur (3…25, dengan
  // '10-20' di tempatnya) maupun komposisi tenera (40…100).
  const urutPita = (k) => [...k].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const buat = (kelas) => {
    const punya = urut.filter((r) => Object.keys(r[kelas] ?? {}).length);
    if (!punya.length) return;
    const akhir = punya.at(-1);
    // Harga seri diambil dari pita tertinggi periode itu — pita puncak, bukan rata-rata.
    // Satu kebun hanya menghadapi pitanya sendiri; merata-ratakan tigabelas pita
    // menghasilkan angka yang tidak pernah dibayarkan kepada siapa pun.
    const tinggi = (r) => Math.max(...Object.values(r[kelas]).map((v) => v.timur));
    const titik = punya.map((r) => ({ t: r.t, p: tinggi(r) }));
    const pitaOf = (r) => Object.fromEntries(Object.entries(r[kelas]).map(([k, v]) => [k, v.timur]));
    const baratOf = (r) => Object.fromEntries(
      Object.entries(r[kelas]).filter(([, v]) => v.barat).map(([k, v]) => [k, v.barat]));
    const berIndeks = punya.filter((r) => r.indeks_k?.timur);
    const key = `tbs-kelapa-sawit-aceh-${kelas}`;

    itemsTbs.push({
      id: idLama.get(key) ?? `op:hrg:${String(nomorBaru()).padStart(8, '0')}`,
      key,
      label: { id: `TBS Kelapa Sawit — Aceh (mitra ${kelas})` },
      commodity_group: 'Kelapa Sawit',
      ...(sawit ? { commodity: { id: sawit.id, label: sawit.nama } } : {}),
      region: wilayahRef('ID-AC', 'Aceh'),
      source_system: 'Distanbun Aceh',
      basis: 'penetapan',
      legal_scope: CAKUPAN,
      price_level: 'farmgate',
      sector: 'pangan',
      unit: 'kg',
      qty: 1,
      coverage: { from: titik[0].t, to: titik.at(-1).t, points: titik.length, gaps: 0 },
      series: titik,
      stats: statistik(titik),
      age_bands: {
        keterangan: kelas === 'plasma'
          ? `Harga per pita umur tanaman pada penetapan ${akhir.t}, dibaca OCR dari selebaran resminya. Angka pada grafik memakai pita puncak (10–20 tahun), bukan rata-rata seluruh pita — satu kebun hanya menghadapi pitanya sendiri. Kolom "barat" harga untuk wilayah barat Aceh pada penetapan yang sama; ia selalu lebih rendah, dan selisihnya bagian dari penetapan, bukan pembulatan.`
          : `Harga pekebun SWADAYA pada penetapan ${akhir.t}, disusun bukan menurut umur tanaman melainkan menurut KOMPOSISI BAHAN TANAM — angka pitanya persentase tenera, sisanya dura. Aceh tidak menetapkan umur untuk kelas ini karena kebun swadaya umumnya tidak tercatat umurnya. Karena sumbunya berlainan, angka ini TIDAK sebanding dengan seri swadaya Riau yang disusun menurut umur.`,
        sumbu: kelas === 'plasma'
          ? SUMBU_UMUR
          : { judul: 'Komposisi bahan tanam', sufiks: '% tenera' },
        grafik: kelas === 'plasma'
          ? 'Garis grafik memakai pita puncak (10–20 tahun).'
          : 'Garis grafik memakai komposisi 100% tenera — yang tertinggi.',
        // Pita diurutkan menurut umur, bukan menurut abjad kunci: Object.keys mengembalikan
        // '10-20' di belakang '25' karena ia satu-satunya kunci berhuruf. Tabel yang
        // melompat 9 → 21 → … → 10-20 membuat kurvanya tampak patah padahal tidak.
        pita: urutPita(Object.keys(akhir[kelas])),
        terakhir: pitaOf(akhir),
        ...(Object.keys(baratOf(akhir)).length ? { barat: baratOf(akhir) } : {}),
        seri: punya.map((r) => ({ t: r.t, u: pitaOf(r) })),
      },
      ...(berIndeks.length ? {
        formula: {
          keterangan:
            `Indeks K, harga CPO, dan harga inti sawit pada tiap penetapan; tersedia pada ${berIndeks.length} dari ${punya.length}. Aceh menetapkan DUA Indeks K — satu untuk wilayah timur, satu untuk barat — dan keduanya dibawa apa adanya.`
            + (kelas === 'plasma'
              ? ' Rendemen di bawah TABEL TETAP: tigabelas nilainya identik di seluruh periode yang terbaca, jadi ia patokan administratif untuk menghitung harga, bukan rendemen terukur di pabrik. Bentuknya tetap menerangkan sesuatu yang tidak dimiliki tabel Kaltim: ia naik sampai pita 10–20 lalu TURUN sampai 25 tahun — kebun tua menghasilkan lebih sedikit, dan tabelnya mengakui itu.'
              : ''),
          terakhir: {
            indeks_k: Math.round(berIndeks.at(-1).indeks_k.timur * 10000) / 100,
            ...(berIndeks.at(-1).indeks_k.barat ? { indeks_k_barat: Math.round(berIndeks.at(-1).indeks_k.barat * 10000) / 100 } : {}),
            ...(berIndeks.at(-1).cpo ? { cpo: berIndeks.at(-1).cpo } : {}),
            ...(berIndeks.at(-1).kernel ? { pko: berIndeks.at(-1).kernel } : {}),
          },
          seri: berIndeks.map((r) => ({
            t: r.t, k: Math.round(r.indeks_k.timur * 10000) / 100,
            ...(r.cpo ? { cpo: r.cpo } : {}), ...(r.kernel ? { pko: r.kernel } : {}),
          })),
          ...(kelas === 'plasma' && Object.keys(akhir.rendemen ?? {}).length >= 10 ? {
            rendemen: {
              keterangan:
                'Tabel rendemen tetap Aceh — tigabelas nilai yang identik di seluruh penetapan yang terbaca. Ia patokan untuk MENGHITUNG harga, bukan rendemen yang terukur di pabrik; lihat docs/16 bagian 7a. Yang membuatnya tetap layak tayang: bentuknya naik sampai umur 10–20 lalu turun, jadi ia satu-satunya tabel di repositori ini yang memperlihatkan penurunan hasil kebun tua.',
              tetap: true,
              terakhir: Object.fromEntries(
                Object.entries(akhir.rendemen).map(([k, v]) => [k, Math.round(v * 1e4) / 1e4])),
            },
          } : {}),
        },
      } : {}),
      mappings: [{
        scheme: 'KEMENTAN', id: 'Permentan 13/2024', relation: 'related',
        note: `Penetapan harga TBS oleh Tim Penetapan Harga provinsi Aceh, kelas mitra ${kelas}; dibaca OCR dari selebaran resmi Distanbun Aceh.`,
      }],
      lifecycle: { version: '0.1.0', status: 'draft', created_at: '2026-08-23T00:00:00Z' },
    });
  };

  buat('plasma');
  buat('swadaya');
}

const tbsKaltimRec = buatTbs({
  baris: tbsKaltim,
  key: 'tbs-kelapa-sawit-kalimantan-timur',
  label: 'TBS Kelapa Sawit — Kalimantan Timur',
  kode: 'ID-KI',
  wilayah: 'Kalimantan Timur',
  sistem: 'SK Disbun Kaltim (OCR)',
  cakupanHukum:
    'Surat Keputusan Dinas Perkebunan Provinsi Kalimantan Timur tentang penetapan harga pembelian TBS "produksi pekebun yang BERMITRA". Pekebun swadaya berada di luar cakupannya, dan Kaltim tidak menerbitkan seri terpisah untuk mereka. Angkanya dibaca lewat OCR dari PDF pindaian — tiap tabel lolos uji bentuk kurva sebelum diterima, tetapi OCR tetap bisa menukar satu digit tanpa mengaku.',
  catatanPita:
    'Harga per pita umur tanaman, dibaca lewat OCR dari tabel surat keputusannya. Angka pada grafik memakai pita tertua (≥10 tahun), yang tertinggi di seluruh berkas yang diperiksa — bukan rata-rata.',
  rendemen: rendemenKaltim,
});
if (tbsKaltimRec) itemsTbs.push(tbsKaltimRec);

const tbsBabelRec = buatTbs({
  baris: tbsBabel,
  key: 'tbs-kelapa-sawit-bangka-belitung',
  label: 'TBS Kelapa Sawit — Kepulauan Bangka Belitung',
  kode: 'ID-BB',
  wilayah: 'Kepulauan Bangka Belitung',
  sistem: 'Selebaran DPKP Babel (OCR)',
  cakupanHukum:
    'Penetapan harga pembelian TBS kelapa sawit pekebun mitra plasma oleh Dinas Pertanian dan Ketahanan Pangan Provinsi Kepulauan Bangka Belitung. Pekebun swadaya berada di luar cakupannya. Arsipnya TIPIS dan bergulir — hanya empat pengumuman terjangkau saat ditarik, dan yang lama menghilang seiring pengumuman baru terbit.',
  catatanPita:
    'Harga per pita umur tanaman, dibaca lewat OCR dari selebaran PNG-nya — bukan dari berita acara PDF, yang lapisan teksnya hasil OCR pihak lain yang rusak. Kurvanya naik sampai pita 10–20 tahun lalu menurun sampai umur 25; angka pada grafik memakai pita puncaknya.',
  rendemen: null,
});
if (tbsBabelRec) itemsTbs.push(tbsBabelRec);

items.push(...itemsTbs);

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
console.log(`  disembunyikan layar  : ${n(perGolongan.luar ?? 0)} — bahan bangunan, LPG, pangan olahan, dan barang impor`);
console.log(`Tingkat pekebun       : ${n(items.filter((x) => x.price_level === 'farmgate').length)} seri — ${items.filter((x) => x.price_level === 'farmgate').map((x) => x.region?.label).join(', ')}`);
console.log(`  ber-tabel umur      : ${n(items.filter((x) => x.age_bands).length)}`);
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
