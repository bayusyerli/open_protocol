// Menurunkan registri jadi indeks siap-cari untuk permukaan baca-saja
// (docs/03-enam-pintu.md). Keluarannya berkas statis — tidak ada server, tidak
// ada basis data, tidak ada API.
//
//   node spec/tools/bangun-indeks.mjs            # periksa saja, laporkan ukuran
//   node spec/tools/bangun-indeks.mjs --tulis    # tulis ke spec/indeks/
//
// KENAPA STATIS, DAN KENAPA ITU MENENTUKAN BENTUK BERKASNYA
// Kelima jalur pertama baca-saja: tanpa akun, tanpa data pribadi, tanpa satu pun
// tulisan dari pengguna kecuali harga di jalur 3. Yang seperti itu tidak butuh
// server — ia butuh berkas yang bentuknya sudah sesuai pertanyaan yang akan
// diajukan. Maka susunan keluaran di bawah ini ADALAH antarmuka kuerinya, dan
// tiap berkas dirancang untuk satu pertanyaan, bukan untuk kerapian.
//
// Syarat lapangan ikut menentukan: sinyal buruk dan HP entry-level, jadi tidak
// boleh ada berkas yang harus diunduh utuh sebelum layar pertama muncul. Kepala
// pencarian dipecah menurut dua huruf pertama, rinciannya dipecah menurut ukuran
// dengan anggaran 48 KB per berkas, dan indeks OPT dipecah dua tingkat supaya
// daftar merek satu OPT tidak ikut terbawa saat komoditasnya dibuka.
//
// YANG DIHASILKAN
//   meta.json              asal data, jumlah, dan daftar seluruh pecahan
//   cari/<awalan>.json     nama -> id, untuk kotak pencarian jalur 2 dan 4
//   produk/<nnn>.json      rincian produk: isi, pendaftaran, penggunaan berlabel
//   varietas/<nnn>.json    rincian varietas: surat yang dipegang beserta SK-nya
//   setara/<nnn>.json      sidik komposisi -> daftar produk yang isinya identik
//   opt/<komoditas>.json        komoditas -> daftar OPT beserta jumlahnya
//   opt/<komoditas>/<opt>.json  bahan+kadar -> merek untuk satu OPT (jalur 1)
//   sediaan.json           daftar dua belas resep beserta bahan bakunya
//   sediaan/<id>.json      resep utuh: hukum, bahan, proses, kriteria, keselamatan
//   gejala.json            OPT terkurasi + teks gejalanya — pintu masuk jalur 1
//   larangan.json          id zat -> catatan larangan beserta lingkupnya
//   varian.json            satu tanaman dalam beberapa fase atau sistem budidaya —
//                          TBM lawan TM, tapin lawan tabela; sengaja tidak disatukan
//
// KESETARAAN DIHITUNG DARI id, TIDAK PERNAH DARI LABEL
// Salinan label pada composition[].substance.label adalah snapshot sesaat yang
// sengaja tidak pernah ditulis ulang — pada 17 entri ia satu-satunya tempat angka
// kesetaraan registri masih terbaca. Mengelompokkan menurut label akan memecah
// satu bahan jadi beberapa kelompok dan menaksir kesetaraan terlalu rendah;
// itu persis kekeliruan yang ditemukan dan diperbaiki pada 1a0f077.
//
// KELUARANNYA DETERMINISTIK
// Tidak ada stempel waktu, tidak ada urutan yang bergantung urutan pembacaan.
// Seluruh kunci objek dan isi larik diurutkan, sehingga menjalankan ulang pada
// sumber yang sama menghasilkan berkas yang sama persis — bisa di-diff, dan
// selisihnya berarti sumbernya yang berubah.
//
// YANG SENGAJA TIDAK DIINDEKS, KARENA MEMANG BELUM ADA DI SUMBERNYA
//   gejala OPT      0 dari 1.360 — jalur 1 belum punya pintu masuk
//   PHI             NOL dari 23.058 penggunaan — tidak ada sama sekali
//   harga           nol — masukan pengguna di jalur 3
//   berat jenis     nol — pupuk cair tidak sebanding dengan yang padat
// Keempatnya dicatat di meta.json supaya sisi penyaji tahu ia tidak boleh
// menjanjikannya, alih-alih menemukan sendiri bahwa datanya kosong.

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VOCAB = join(akar, 'spec', 'vocab');
const KELUAR = join(akar, 'spec', 'indeks');
const tulis = process.argv.includes('--tulis');

const bacaJson = (p) => JSON.parse(readFileSync(join(VOCAB, p), 'utf8'));
const larik = (x) => (Array.isArray(x) ? x : Object.values(x).find(Array.isArray));
const bacaNdjson = (p) =>
  readFileSync(join(VOCAB, p), 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));

// ---------------------------------------------------------------------------
// Sumber
// ---------------------------------------------------------------------------
const pestisida = bacaNdjson('product/pestisida.ndjson');
const pupuk = bacaNdjson('product/pupuk.ndjson');
const varietas = bacaNdjson('variety/varietas.ndjson');
const zat = larik(bacaJson('substance-pestisida.json'));
const hara = larik(bacaJson('substance.json'));
const sediaan = larik(bacaJson('preparation.json'));
const bahanOrganik = larik(bacaJson('substance-organik.json'));
const optTerkurasi = larik(bacaJson('pest.json'));
const namaLokal = larik(bacaJson('nama-lokal.json'));

// Direktori toko tinggal di toko_data/, bukan di vocab/ — ia hasil sapuan lapangan
// dengan pembagian lisensinya sendiri di toko_data/LAPIS.md, bukan kosakata terkurasi.
// Dibaca apa adanya; lisensinya diturunkan DARI rekamannya, tidak diketik ulang di sini.
const bacaToko = (p) => {
  try {
    return readFileSync(join(akar, 'toko_data', p), 'utf8')
      .split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  } catch { return []; }
};
const tokoTitik = bacaToko('toko-tani-jawa.ndjson');
const tokoAlamat = bacaToko('benih-alamat.ndjson');
// Ketiga berkas, bukan dua. Varietas banyak menunjuk blok op:cmd:00002xxx di
// commodity-varietas.json; tanpanya nama komoditasnya jatuh balik ke salinan basi
// pada rekaman varietas, dan penanda tahunan-nya hilang untuk 1.139 varietas.
const komoditas = [
  ...larik(bacaJson('commodity.json')),
  ...larik(bacaJson('commodity-registri.json')),
  ...larik(bacaJson('commodity-varietas.json')),
];
const optRegistri = larik(bacaJson('pest-registri.json'));

// Tiga sumber yang datang dari luar spec/vocab, dan masing-masing punya alasannya.
//   principal   kosakata sendiri, dibangun spec/tools/bangun-principal.mjs
//   harga       kosakata sendiri, dibangun spec/tools/bangun-harga.mjs
//   komentar    kalimat per seri harga, dibangun spec/tools/bangun-komentar-harga.mjs
//   gambar      sambungan gambar kemasan, dibangun gambar_produk/terbitkan.mjs — TIDAK di
//               spec/vocab karena ia lampiran pada produk, bukan entitas tersendiri; membuatnya
//               entitas berarti mengarang ruang ID ketiga untuk sesuatu yang sudah punya
//               skemanya sendiri di spec/schema/product-image.schema.json.
// Keempatnya OPSIONAL. Repositori yang belum menjalankan alatnya tetap bisa membangun indeks;
// yang hilang cuma bagian yang memang belum ada datanya, dan meta.json menyebutkannya.
const bacaLuar = (jalan, ndjson) => {
  const penuh = join(akar, jalan);
  if (!existsSync(penuh)) return null;
  const teks = readFileSync(penuh, 'utf8');
  return ndjson
    ? teks.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))
    : JSON.parse(teks);
};

const principal = bacaLuar('spec/vocab/principal/principal.ndjson', true) ?? [];
const hargaSeri = bacaLuar('spec/vocab/harga/harga.ndjson', true) ?? [];
const hargaKomentar = bacaLuar('spec/vocab/harga/komentar.json', false);
const gambarTerbit = bacaLuar('gambar_produk/terbit.ndjson', true) ?? [];

const zatById = new Map([...zat, ...hara].map((s) => [s.id, s]));
// LARANGAN ITU BERLINGKUP, DAN LINGKUPNYA MENENTUKAN
// Versi pertama pembangun ini menandai zat dengan satu boolean `dilarang` begitu kata
// "prohibited" muncul di mana pun dalam blok hazard. Itu menyatakan hukum yang tidak
// benar: klorpirifos dilarang untuk RUMAH TANGGA dan TANAMAN PADI, bukan untuk cabai.
// Menempelkan tanda "DILARANG" pada layar cabai sama salahnya dengan menyembunyikannya
// pada layar padi.
//
// Untungnya lingkupnya bisa diputuskan tanpa penafsiran hukum, karena registri
// menuliskannya secara terbatas:
//   92 catatan  "semua bidang penggunaan pestisida"  -> berlaku pada komoditas apa pun
//   31 catatan  "tanaman padi", commodities terisi   -> hanya pada komoditas itu
//    2 catatan  "rumah tangga", "perikanan"          -> konteks pakai, bukan komoditas
// Yang terakhir ditampilkan sebagai keterangan, bukan sebagai larangan atas tanaman
// yang sedang dilihat — sekali lagi: nyatakan kedua fakta, jangan simpulkan sendiri.
// `restricted` (16 catatan) status yang lain sama sekali dan tidak diperlakukan larangan.
const MENYELURUH = 'semua bidang penggunaan pestisida';
const laranganZat = new Map(); // id zat -> [catatan]
for (const s of zat) {
  const c = (s.hazard?.regulatory_status ?? [])
    .filter((r) => r.jurisdiction === 'ID' && r.status === 'prohibited')
    .map((r) => ({
      lingkup: r.scope ?? [],
      menyeluruh: (r.scope ?? []).includes(MENYELURUH),
      komoditas: (r.commodities ?? []).map((k) => k.id),
      komoditasNama: (r.commodities ?? []).map((k) => k.label),
      instrumen: r.instrument ?? null,
      kutipan: r.citation ?? null,
    }));
  if (c.length) laranganZat.set(s.id, c);
}

// Larangan yang berlaku pada satu komoditas. Tanpa komoditas (mis. layar rincian
// produk) seluruh catatan dikembalikan apa adanya, beserta lingkupnya.
const larangan = (idZat, idKomoditas) => {
  const c = laranganZat.get(idZat);
  if (!c) return null;
  if (!idKomoditas) return c;
  const kena = c.filter((r) => r.menyeluruh || r.komoditas.includes(idKomoditas));
  return kena.length ? kena : null;
};

// Nama kanonik SELALU diambil dari entitasnya, tidak pernah dari salinan label pada
// rekaman produk. `commodity_label` dan `pest_label` pada label_uses adalah snapshot
// sesaat yang sengaja tidak pernah ditulis ulang — sesudah penggabungan komoditas,
// puluhan di antaranya masih berbunyi "Karet (0,5 ml/l)" untuk entitas yang nama
// resminya kini "Karet". Menyajikan salinan itu berarti menampilkan nama yang sudah
// tidak ada lagi, dan mengelompokkan menurutnya berarti memecah lagi apa yang baru
// saja disatukan. Salinannya tetap berguna — ia satu-satunya jejak bunyi asli
// registri — tetapi tempatnya sebagai cadangan, bukan sebagai sumber.
const namaZat = (id, cadangan) => zatById.get(id)?.label?.id ?? cadangan ?? id;
const komoditasById = new Map(komoditas.map((k) => [k.id, k]));
const optById = new Map([...optRegistri, ...optTerkurasi].map((o) => [o.id, o]));
const namaKomoditas = (id, cadangan) => komoditasById.get(id)?.label?.id ?? cadangan ?? id;
const namaOpt = (id, cadangan) => optById.get(id)?.label?.id ?? cadangan ?? id;

// ---------------------------------------------------------------------------
// Kesetaraan: sidik jari komposisi, dihitung dari id
// ---------------------------------------------------------------------------
// Pupuk ikut dikunci pada bentuk fisiknya, pestisida tidak. Bukan karena salah satu
// lebih longgar, melainkan karena artinya berbeda bagi yang membeli: NPK 15-15-15
// cair tidak menggantikan NPK 15-15-15 butiran — takaran, cara sebar, dan harganya
// tidak sebanding, dan berat jenisnya tidak ada di registri sehingga mesin pun tidak
// bisa menjembataninya (lihat meta.tidakAda.beratJenis). Pada pestisida, isi dan
// kadar yang sama sudah cukup: dosisnya toh milik pendaftaran tiap produk, bukan
// milik formulasinya. Pemisahan ini yang menghasilkan 386 kelompok pupuk dan 890
// kelompok pestisida di docs/05-jalur-produk.md.
const sidik = (p, jenis) => {
  const isi = (p.composition ?? [])
    .map((c) => `${c.substance.id}@${c.value}${c.unit}`)
    .sort()
    .join('|');
  return jenis === 'pupuk' ? `${isi}#${p.formulation ?? ''}` : isi;
};

const kelompokSetara = new Map(); // sidik -> [id produk]
for (const [jenis, daftar] of [['pestisida', pestisida], ['pupuk', pupuk]])
for (const p of daftar) {
  if (!p.composition?.length) continue;
  const k = sidik(p, jenis);
  if (!kelompokSetara.has(k)) kelompokSetara.set(k, []);
  kelompokSetara.get(k).push(p.id);
}
// Hanya kelompok berisi lebih dari satu yang berguna; sisanya cuma menggemukkan berkas.
const setara = {};
const grupProduk = new Map(); // id produk -> kunci grup
let nomorGrup = 0;
for (const [k, anggota] of [...kelompokSetara.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  if (anggota.length < 2) continue;
  const kunci = `g${String(++nomorGrup).padStart(5, '0')}`;
  setara[kunci] = anggota.slice().sort();
  for (const id of anggota) grupProduk.set(id, kunci);
}

// ---------------------------------------------------------------------------
// Peta nama pemegang -> principal, dan produk -> gambar
// ---------------------------------------------------------------------------
// Nama pemegang di baris produk ditulis registri dengan ejaan yang tidak konsisten; yang
// menyeragamkannya `registry_names` pada tiap principal. Pemetaan dibangun dari sana, bukan
// dari nama kanoniknya, supaya baris produk mana pun ketemu tanpa penyamaan tambahan di sini.
const samakanNama = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
const kunciNama = (s) =>
  samakanNama(s).toUpperCase().replace(/\bPT\.?\b/g, 'PT').replace(/\bCV\.?\b/g, 'CV')
    .replace(/\bUD\.?\b/g, 'UD').replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const principalPerNama = new Map();
for (const b of principal)
  for (const nama of b.registry_names ?? []) principalPerNama.set(kunciNama(nama), b);

// Hanya id dan nama yang ikut ke rincian produk — halaman profilnya diambil terpisah saat
// tautannya diklik. Menyalin seluruh rekaman principal ke tiap produk berarti membayar
// daftar merek payungnya 14.920 kali.
const principalRingkas = (nama) => {
  const b = principalPerNama.get(kunciNama(nama));
  return b ? { id: b.id, nama: b.label?.id ?? nama, key: b.key } : null;
};

const gambarPerProduk = new Map(gambarTerbit.map((r) => [r.produk, r.gambar]));

/* Berkas gambar kemasan ukuran kecil untuk satu produk, atau null.
 *
 * Dipakai dua daftar merek yang berbeda letak tetapi sama isinya — tabel merek per
 * kadar di jalur 1, dan yang di layar bahan aktif jalur 2. Ditaruh di sini, di samping
 * sumbernya, supaya keduanya membaca aturan yang sama alih-alih menyalinnya.
 */
const gambarKecil = (id) => {
  const daftar = gambarPerProduk.get(id);
  if (!daftar?.length) return null;
  // Kemasan depan didahulukan: panel label terpotong jadi petak 40 px tidak
  // menunjukkan apa pun, sedangkan kemasan depan justru itu yang dicocokkan mata.
  const pilih = daftar.find((x) => x.peran === 'kemasan_depan') ?? daftar[0];
  return pilih.berkas.kecil?.n ?? pilih.berkas.sedang?.n ?? null;
};

// ---------------------------------------------------------------------------
// Rincian produk — dipangkas ke yang benar-benar dipakai layar
// ---------------------------------------------------------------------------
function rinciProduk(p, jenis) {
  const r = {
    id: p.id,
    nama: p.label?.id ?? '',
    jenis,                                   // 'pestisida' | 'pupuk'
    produsen: p.manufacturer ?? null,
    daftar: p.registration?.number ?? null,
    status: p.registration?.status ?? null,
    berlaku: p.registration?.valid_until ?? null,
    bentuk: p.formulation ?? null,
    isi: (p.composition ?? [])
      .map((c) => ({
        zat: c.substance.id,
        nama: namaZat(c.substance.id, c.substance.label),
        nilai: c.value,
        satuan: c.unit,
        ...(laranganZat.has(c.substance.id) ? { larangan: true } : {}),
      }))
      .sort((a, b) => a.zat.localeCompare(b.zat)),
  };
  const g = grupProduk.get(p.id);
  if (g) r.setara = g;

  // Tautan ke halaman profil pemegang pendaftaran. Ditulis hanya kalau ketemu; nama
  // pemegangnya sendiri tetap ada di `produsen` apa pun yang terjadi, sehingga layar tidak
  // pernah kehilangan namanya hanya karena tautannya belum ada.
  const pcp = principalRingkas(p.manufacturer);
  if (pcp) r.pcp = pcp;

  // Gambar kemasan. Yang dibawa cuma nama berkas dan ukurannya; halaman menyusun jalurnya
  // sendiri. Produk tanpa gambar TIDAK diberi medan kosong — layar sudah tahu artinya, dan
  // 14.493 medan null memakan pecahan tanpa memberi tahu apa pun.
  const gb = gambarPerProduk.get(p.id);
  if (gb?.length) {
    r.gambar = gb.map((x) => ({
      f: x.berkas.sedang?.n ?? x.berkas.kecil?.n,
      k: x.berkas.kecil?.n ?? null,
      w: x.berkas.sedang?.w ?? x.berkas.kecil?.w ?? null,
      h: x.berkas.sedang?.h ?? x.berkas.kecil?.h ?? null,
      peran: x.peran,
      hak: x.hak,
      penerbit: x.penerbit,
      halaman: x.halaman,
      diambil: x.diambil ? String(x.diambil).slice(0, 10) : null,
      ...(x.nomorTerbaca ? { nomor: x.nomorTerbaca, nomorCocok: x.nomorCocok } : {}),
    }));
  }

  if (jenis === 'pestisida') {
    r.guna = (p.label_uses ?? [])
      .map((u) => ({
        komoditas: u.commodity?.id ?? null,
        komoditasNama: u.commodity?.id ? namaKomoditas(u.commodity.id, u.commodity_label) : (u.commodity_label ?? null),
        opt: u.pest?.id ?? null,
        optNama: u.pest?.id ? namaOpt(u.pest.id, u.pest_label) : (u.pest_label ?? null),
        dosis: u.rate_text ? `${u.rate_text}${u.rate_unit_text ? ' ' + u.rate_unit_text : ''}` : null,
      }))
      .sort((a, b) => `${a.komoditasNama}${a.optNama}`.localeCompare(`${b.komoditasNama}${b.optNama}`));
  }
  return r;
}

// ---------------------------------------------------------------------------
// Pembeda SKU — komposisi ikut ke kepala pencarian
// ---------------------------------------------------------------------------
// Nama saja tidak membedakan produk. "PHONSKA" milik Petrokimia Gresik ada empat
// kali dengan grade berbeda — 15-8-10, 15-15-10, 15-10-15, 10-10-10 — dan "Pupuk
// Indonesia Holding Company Phonska Plus" delapan kali. Semuanya SKU yang berlainan,
// bukan rekaman ganda. Daftar hasil yang menampilkan empat baris identik menyuruh
// orang menebak mana yang di tangannya, jadi yang membedakannya ikut ke kepala
// pencarian — bukan cuma ke layar rinciannya.
//
// Grade NPK hanya dibentuk kalau N, P2O5, dan K2O ketiganya tercatat DAN ketiganya
// dalam g/kg. Kalau satuannya campur atau salah satunya hilang, angka yang dibagi
// sepuluh itu bukan grade, dan menuliskannya sebagai grade adalah mengarang.
const NPK = ['op:sub:00000001', 'op:sub:00000002', 'op:sub:00000003'];
const angka = (x) => String(Math.round(Number(x) * 100) / 100);

function pembeda(r) {
  const isi = r.isi ?? [];
  if (!isi.length) return null;

  const npk = NPK.map((id) => isi.find((c) => c.zat === id));
  if (npk.every((c) => c && c.satuan === 'g/kg')) return `NPK ${npk.map((c) => angka(c.nilai / 10)).join('-')}`;

  // Dua bahan pertama, lalu sisanya dihitung. Kartu hasil di HP cuma punya satu
  // baris; memuat tujuh hara di sana menenggelamkan namanya sendiri.
  const dua = isi.slice(0, 2).map((c) => `${c.nama} ${angka(c.nilai)} ${c.satuan}`);
  return dua.join(' · ') + (isi.length > 2 ? ` · +${isi.length - 2}` : '');
}

// ---------------------------------------------------------------------------
// Rincian varietas — surat yang dipegang, apa adanya
// ---------------------------------------------------------------------------
function rinciVarietas(v) {
  return {
    id: v.id,
    nama: v.label?.id ?? '',
    jenis: 'varietas',
    komoditas: v.commodity?.id ?? null,
    komoditasNama: namaKomoditas(v.commodity?.id, v.commodity?.label),
    tipe: v.variety_type ?? null,
    // Tiga keadaan, bukan dua. true berarti panen perdananya bertahun-tahun sehingga
    // bibit yang salah baru ketahuan lama sesudah uangnya keluar; false berarti
    // semusim; TIDAK ADA berarti belum diputuskan, dan layar harus diam untuknya
    // alih-alih menebak (lihat spec/tools/tandai-tahunan.mjs — 73,1% varietas
    // tercakup, sisanya sengaja dibiarkan tanpa putusan).
    ...(komoditasById.get(v.commodity?.id)?.perennial === undefined
      ? {}
      : { tahunan: komoditasById.get(v.commodity?.id).perennial }),
    asal: v.origin ?? null,
    pemelihara: v.maintainer ?? null,
    // Tautan ke profil pemeliharanya, kalau ia badan. 576 varietas dipegang pemulia
    // perorangan dan mereka sengaja tidak punya profil; untuk itu medannya tidak ditulis,
    // dan namanya tetap tampil apa adanya di `pemelihara`.
    ...(principalPerNama.get(kunciNama(v.maintainer))
      ? { pk: principalPerNama.get(kunciNama(v.maintainer)).key }
      : {}),
    // kind_label dibawa apa adanya: "Pendaftaran" saja mencakup empat instrumen
    // berbeda, dan meratakannya membuang persis informasi yang membedakan.
    surat: (v.permits ?? [])
      .map((p) => ({ jenis: p.kind, sebutan: p.kind_label ?? null, sk: p.decree_number ?? null, tanggal: p.decree_date ?? null }))
      .sort((a, b) => `${a.jenis}${a.sk}`.localeCompare(`${b.jenis}${b.sk}`)),
  };
}

// ---------------------------------------------------------------------------
// Indeks OPT: komoditas -> OPT -> bahan+kadar -> merek  (jalur 1)
// Dikelompokkan menurut PASANGAN bahan dan kadar, bukan menurut bahannya saja:
// satu entitas "Abamektin" dipakai pada 33 kadar berbeda, 24 di antaranya dalam g/L.
// Dosis menempel pada tiap merek, bukan pada bahannya — 25 produk berisi
// Abamektin 18 g/L punya dosis terdaftar 0,5 sampai 2 ml/l, dan satu di antaranya
// memakai satuan yang sama sekali lain.
// ---------------------------------------------------------------------------
const perKomoditas = new Map();
// Penggunaan yang salah satu tautannya kosong tidak bisa masuk indeks yang
// pintunya OPT — tanpa id OPT, tidak ada tempat menaruhnya. Tetapi ia TIDAK boleh
// hilang begitu saja: 2.438 dari 23.058 (10,6%) berada dalam keadaan itu, dan
// pembangun versi pertama membuangnya tanpa sepatah kata, sehingga trips di cabai
// terbaca 57 produk saat itu padahal pencocokan label memberi 286. (Angka 57 itu
// keadaan sebelum penyatuan komoditas dan OPT; sesudahnya irisan Cabai x Trips
// terkurasi jadi 246.) Semuanya tetap terbaca dari
// sisi produk (`guna` pada rincian produk membawa null apa adanya); yang dicatat di
// sini adalah berapa banyak yang tidak bisa dijangkau dari jalur 1.
// ---------------------------------------------------------------------------
// Bentuk dosis pada label — D4/D5
// ---------------------------------------------------------------------------
// Dosis label datang dalam dua keluarga yang aritmetikanya sama sekali berbeda, dan
// mengetahui yang mana yang dipegang menentukan apakah kalibrasi tangki perlu sama
// sekali. Per liter air: kadarnya tetap, kalibrasi hanya menentukan berapa tangki.
// Per hektare: berapa yang masuk ke satu tangki BERGANTUNG pada luas yang dijangkau
// tangki itu, jadi tanpa kalibrasi angkanya tidak bisa dihitung sama sekali.
//
// Dihitung di sini, bukan diketik di layar, supaya tidak bisa basi.
const bentukDosis = { perHektare: 0, perLiter: 0, kosong: 0, lain: 0 };
for (const p of pestisida) {
  for (const u of p.label_uses ?? []) {
    const t = (u.rate_unit_text ?? '').trim().toLowerCase();
    if (!u.rate_text || !t) bentukDosis.kosong++;
    else if (/\/\s*ha$|^liter\/ha$/.test(t)) bentukDosis.perHektare++;
    else if (/^(ml|g|gr|cc)\s*\/\s*l$/.test(t)) bentukDosis.perLiter++;
    else bentukDosis.lain++;
  }
}

const terbuang = { tanpaOpt: 0, tanpaKomoditas: 0, tanpaKeduanya: 0, penggunaan: 0 };
for (const p of pestisida) {
  for (const u of p.label_uses ?? []) {
    terbuang.penggunaan++;
    if (!u.commodity?.id || !u.pest?.id) {
      const a = !u.pest?.id;
      const b = !u.commodity?.id;
      terbuang[a && b ? 'tanpaKeduanya' : a ? 'tanpaOpt' : 'tanpaKomoditas']++;
      continue;
    }
    const kc = u.commodity.id;
    if (!perKomoditas.has(kc)) perKomoditas.set(kc, { nama: namaKomoditas(kc, u.commodity_label), opt: new Map() });
    const kom = perKomoditas.get(kc);
    if (!kom.opt.has(u.pest.id)) kom.opt.set(u.pest.id, { nama: namaOpt(u.pest.id, u.pest_label), grup: new Map(), produk: new Set() });
    const opt = kom.opt.get(u.pest.id);
    // Dicatat dari pendaftarannya sendiri, bukan dari keanggotaan kartu. Produk yang
    // komposisinya kosong tidak menghasilkan kartu bahan+kadar mana pun, dan kalau
    // jumlahnya diturunkan dari kartu ia lenyap dari hitungan — layar berkata "183
    // produk terdaftar" padahal registrinya memuat 184.
    opt.produk.add(p.id);
    for (const c of p.composition ?? []) {
      const kunci = `${c.substance.id}|${c.value}|${c.unit}`;
      if (!opt.grup.has(kunci)) {
        opt.grup.set(kunci, {
          kunci,
          zat: c.substance.id,
          nama: namaZat(c.substance.id, c.substance.label),
          kadar: `${c.value} ${c.unit}`,
          // Dua penanda, bukan satu, dan keduanya cuma penanda: bunyi lengkapnya ada
          // di larangan.json supaya tidak tersalin ke 17.377 kartu. `larangan` berarti
          // mengenai komoditas ini; `laranganLain` berarti zatnya memang dilarang,
          // tetapi untuk komoditas atau konteks lain. Tanpa yang kedua, layar cabai
          // punya dua pilihan yang sama-sama salah: menandai klorpirifos "dilarang"
          // (tidak benar untuk cabai) atau diam sama sekali (padahal zatnya dilarang
          // untuk padi dan rumah tangga). Dengan keduanya ia bisa menyatakan apa
          // adanya, seperti kartu LARBAN di jalur 2.
          larangan: !!larangan(c.substance.id, kc),
          laranganLain: !larangan(c.substance.id, kc) && laranganZat.has(c.substance.id),
          merek: [],
        });
      }
      opt.grup.get(kunci).merek.push({
        id: p.id,
        nama: p.label?.id ?? '',
        daftar: p.registration?.number ?? null,
        berlaku: p.registration?.valid_until ?? null,
        dosis: u.rate_text ? `${u.rate_text}${u.rate_unit_text ? ' ' + u.rate_unit_text : ''}` : null,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Pemecahan
// ---------------------------------------------------------------------------
const rapikan = (s) => (s ?? '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g, '');
// Dua huruf, bukan satu. Dengan satu huruf, ember terbesar melewati 300 KB dan
// harus diunduh utuh sebelum hasil pertama muncul; dua huruf memecahnya jadi
// pecahan yang wajar, dan orang memang mengetik minimal dua huruf sebelum hasil
// pencarian berarti.
const ember = (nama) => {
  const n = rapikan(nama);
  if (!n) return '__';
  return (n + '_').slice(0, 2);
};

// Dipecah menurut ukuran, bukan menurut jumlah. Isi satu produk berselisih jauh:
// pestisida dengan 300 penggunaan berlabel puluhan kali lebih besar dari pupuk
// dengan dua hara, jadi pecahan berjumlah tetap menghasilkan berkas 360 KB yang
// harus diunduh utuh demi satu produk. Anggarannya 48 KB — kira-kira 12 KB
// setelah gzip, satu perjalanan pulang-pergi di sinyal buruk.
const ANGGARAN = 48 * 1024;

function pecah(daftar) {
  const keluar = [];
  let kini = [];
  let ukuran = 2;
  for (const r of daftar) {
    const b = Buffer.byteLength(JSON.stringify(r), 'utf8') + 1;
    if (kini.length && ukuran + b > ANGGARAN) {
      keluar.push(kini);
      kini = [];
      ukuran = 2;
    }
    kini.push(r);
    ukuran += b;
  }
  if (kini.length) keluar.push(kini);
  if (keluar.length > 999) throw new Error(`pecahan melebihi 999 — lebarkan padStart`);
  return keluar;
}

const semuaProduk = [
  ...pestisida.map((p) => rinciProduk(p, 'pestisida')),
  ...pupuk.map((p) => rinciProduk(p, 'pupuk')),
].sort((a, b) => a.id.localeCompare(b.id));

const semuaVarietas = varietas.map(rinciVarietas).sort((a, b) => a.id.localeCompare(b.id));

// Daftar setara dipecah juga, dan anggotanya dibawa lengkap dengan nama serta
// produsennya. Satu berkas 135 KB yang diunduh utuh demi satu produk adalah
// pemborosan yang sama seperti pecahan berjumlah tetap; dan kalau anggotanya cuma
// id, penyaji harus menarik belasan pecahan produk lagi hanya untuk menuliskan
// namanya. Nomor pecahan ditempelkan ke kunci grup ("004:g00123") supaya berkasnya
// bisa disimpulkan dari rincian produk, tanpa tabel pencarian perantara.
const namaProduk = new Map(semuaProduk.map((r) => [r.id, r]));
const setaraRinci = Object.entries(setara).map(([kunci, anggota]) => ({
  kunci,
  anggota: anggota.map((id) => {
    const r = namaProduk.get(id);
    // `pk` = key principal. Cukup satu kata untuk membuat nama pemegang di tabel setara jadi
    // tautan ke profilnya; tanpa itu, satu-satunya jalan adalah mengunduh peta 3.136 baris.
    return {
      i: id, n: r?.nama ?? '', k: r?.produsen ?? null, p: r?.daftar ?? null,
      ...(r?.pcp ? { pk: r.pcp.key } : {}),
    };
  }),
}));
const pecahanSetara = pecah(setaraRinci);
const berkasSetara = [];
pecahanSetara.forEach((kelompok, i) => {
  const nomor = String(i).padStart(3, '0');
  const isi = {};
  for (const g of kelompok) {
    isi[g.kunci] = g.anggota;
    for (const a of g.anggota) namaProduk.get(a.i).setara = `${nomor}:${g.kunci}`;
  }
  berkasSetara.push([nomor, isi]);
});

const pecahanProduk = pecah(semuaProduk);
const pecahanVarietas = pecah(semuaVarietas);

// Kepala pencarian: cukup untuk menampilkan hasil, tidak cukup untuk menjawab.
// Rinciannya diambil belakangan lewat nomor pecahannya.
const petaPecahan = new Map();
pecahanProduk.forEach((s, i) => s.forEach((r) => petaPecahan.set(r.id, `produk/${String(i).padStart(3, '0')}`)));
pecahanVarietas.forEach((s, i) => s.forEach((r) => petaPecahan.set(r.id, `varietas/${String(i).padStart(3, '0')}`)));

// ---------------------------------------------------------------------------
// Sidik komposisi untuk pemeriksaan keaslian — C2
// ---------------------------------------------------------------------------
// Premis C2 diganti jawaban lapangan: "Tidak. Biasanya langsung lihat kemasan, cek
// kandungan." Nomor pendaftaran bukan pintu — registri membenarkannya dari sisi lain,
// 667 dari 7.196 pupuk (9,3%) tidak punya nomor sama sekali. Jadi yang diindeks di sini
// KANDUNGAN, dan pintunya angka yang tercetak di karung.
//
// Beda dari `setara/` di atas, yang tampak mirip tetapi tidak bisa dipakai:
//   - `setara/` hanya menyimpan kelompok berisi >= 2 anggota, karena tujuannya
//     menunjukkan "merek lain yang isinya sama". Untuk C2 justru produk tunggal yang
//     paling perlu terjawab: yang mencari ingin tahu apakah ADA yang cocok, sama sekali.
//   - `setara/` mengunci pupuk pada `formulation`, string registri yang tidak tercetak
//     di karung dan tidak diketahui pembeli. Di sini yang dipakai BASIS — per kilogram
//     atau per liter — karena itu yang bisa dibaca siapa pun dari kemasannya.
//
// Ember memakai hash, bukan awalan. Awalan sidik komposisi tidak berarti apa-apa bagi
// yang mengetik, dan sebarannya akan pincang; hash memberi ember yang rata dan penyaji
// bisa menghitung sendiri embernya tanpa satu pun berkas kepala.

// FNV-1a 32-bit. Dipilih karena pendek dan bisa ditulis ulang persis sama di peramban
// tanpa pustaka apa pun — pembangun dan penyaji WAJIB menghasilkan angka yang sama,
// dan hash kripto di peramban asinkron serta menuntut konteks aman.
function emberSidik(sidikTeks) {
  let h = 0x811c9dc5;
  for (let i = 0; i < sidikTeks.length; i++) {
    h ^= sidikTeks.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return (h & 0xff).toString(16).padStart(2, '0');
}

// Satuan registri ada empat, dan tidak satu pun produk mencampur basis massa dengan
// basis volume — jadi tiap produk punya satu basis yang jelas dan tidak ada konversi
// yang perlu ditebak. Berat jenis tidak ada di registri, jadi padat dan cair memang
// tidak bisa dijembatani (lihat meta.tidakAda.beratJenis).
//
// Persen jadi BASIS KETIGA, bukan dikonversi. 3.028 pestisida menuliskan kadarnya dalam
// persen, dan tanpa tahu itu b/b atau b/v tidak ada cara mengubahnya jadi g/kg maupun
// g/L — berat jenis tidak ada di registri. Membuangnya berarti 40,6% pestisida
// berkomposisi tidak bisa diperiksa sama sekali; mengonversinya berarti menebak. Basis
// ketiga menyimpan keduanya: yang membaca "2%" di kemasan tetap menemukan yang terdaftar
// dalam persen, dan tidak pernah dicocokkan silang dengan yang terdaftar dalam g/L.
const SATUAN_C2 = {
  'g/kg': ['m', 1], 'mg/kg': ['m', 0.001],
  'g/L': ['v', 1], 'mg/L': ['v', 0.001],
  '%': ['p', 1],
};

const angkaSidik = (x) => String(Math.round(x * 10000) / 10000);

/** Sidik yang bisa dihitung dari yang TERCETAK di kemasan: kode hara, kadar, basis. */
export function sidikKandungan(bagian) {
  const basis = new Set(bagian.map((c) => c.basis));
  if (basis.size !== 1) return null;
  return bagian
    .map((c) => `${c.kode}@${angkaSidik(c.nilai)}`)
    .sort()
    .join('|') + `#${[...basis][0]}`;
}

const sidikProduk = (p) => {
  const bagian = [];
  for (const c of p.composition ?? []) {
    const u = SATUAN_C2[c.unit];
    if (!u) return null;
    bagian.push({ kode: Number(c.substance.id.slice(-8)), nilai: c.value * u[1], basis: u[0] });
  }
  return bagian.length ? sidikKandungan(bagian) : null;
};

const kandungan = new Map(); // sidik -> [ringkas produk]
let produkTanpaSidik = 0;
for (const r of semuaProduk) {
  if (r.jenis !== 'pupuk' && r.jenis !== 'pestisida') continue;
  const asli = (r.jenis === 'pupuk' ? pupuk : pestisida).find((x) => x.id === r.id);
  const sk = asli ? sidikProduk(asli) : null;
  if (!sk) { if (asli?.composition?.length) produkTanpaSidik++; continue; }
  if (!kandungan.has(sk)) kandungan.set(sk, []);
  kandungan.get(sk).push({ i: r.id, n: r.nama, k: r.produsen ?? null, p: petaPecahan.get(r.id), j: r.jenis });
}

const berkasKandungan = {};
for (const [sk, daftar] of [...kandungan.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const e = emberSidik(sk);
  (berkasKandungan[e] ??= {})[sk] = daftar.sort((a, b) => a.n.localeCompare(b.n));
}

// ---------------------------------------------------------------------------
// Bahan aktif → kadar → merek
// ---------------------------------------------------------------------------
// Dikelompokkan menurut bahan DAN kadar, tidak pernah menurut bahan saja. Satu
// entitas "Abamektin" dipakai pada 30 kadar berbeda di registri; menampilkan 127
// merek dalam satu daftar datar menyiratkan semuanya bisa saling menggantikan, dan
// itu tidak benar — kesetaraan hanya berlaku pada pasangan bahan+kadar. Aturan yang
// sama sudah dipakai jalur 1; di sini ia dibuka lewat pintu lain.
//
// Hanya bahan aktif pestisida. Unsur hara pupuk sengaja tidak masuk: "seluruh produk
// yang memuat Nitrogen" adalah 2.582 pupuk — hampir seluruh registrinya — dan daftar
// sepanjang itu tidak menjawab apa pun. Pertanyaan haranya dijawab jalur 3, dalam
// rupiah per kilogram hara, bukan dalam daftar merek.
const zatPestisida = new Set(zat.map((z) => z.id));
const perZat = new Map();
for (const r of semuaProduk) {
  if (r.jenis !== 'pestisida') continue;
  for (const c of r.isi) {
    if (!zatPestisida.has(c.zat)) continue;
    let z = perZat.get(c.zat);
    if (!z) perZat.set(c.zat, (z = { nama: c.nama, larangan: !!c.larangan, kadar: new Map() }));
    const kk = `${angka(c.nilai)} ${c.satuan}`;
    if (!z.kadar.has(kk)) z.kadar.set(kk, []);
    z.kadar.get(kk).push(r);
  }
}

// ---------------------------------------------------------------------------
// Urutan merek — satu pembanding, dipakai jalur 1 dan jalur 2
// ---------------------------------------------------------------------------
// Layar menuliskan "diurutkan menurut nomor pendaftaran MENAIK", dan sampai 23 Agustus
// 2026 kalimat itu tidak sepenuhnya benar: pengurutannya `localeCompare` atas teksnya.
// Nomor pendaftaran tidak seragam — 7 sampai 20 digit, dan sepuluh di antaranya bukan
// digit murni (`01.01.01.2021.7272`, `.01030120083156`, `01010120165526.`). Pada
// panjang yang berbeda, urutan teks bukan urutan menaik, dan yang berawalan titik
// bahkan mendahului seluruhnya.
//
// Membuang non-digit sekaligus memperbaiki kesepuluh nomor cacat itu: ketiganya
// kembali ke bentuk 14 digit yang sama seperti sisanya. Perbandingannya BigInt, karena
// 20 digit melewati batas bilangan bulat aman JavaScript dan `Number` akan diam-diam
// membulatkan dua nomor berbeda jadi sama.
//
// Yang tidak bernomor jatuh ke belakang, bukan ke depan: mereka tidak punya kunci
// urutnya, dan menaruhnya di puncak persis terbaca sebagai slot teratas.
const digitDaftar = (x) => String(x ?? '').replace(/\D/g, '');

function urutDaftar(a, b) {
  const da = digitDaftar(a.daftar), db = digitDaftar(b.daftar);
  if (da && db && da !== db) return BigInt(da) < BigInt(db) ? -1 : 1;
  if (!da !== !db) return da ? -1 : 1;
  // Nomor sama atau sama-sama kosong: nama jadi pemutus supaya keluarannya tetap
  // deterministik, syarat yang dinyatakan di kepala berkas ini.
  return String(a.nama ?? '').localeCompare(String(b.nama ?? ''));
}

// Di dalam kartu "Abamektin 18 g/L", menuliskan "Abamektin 18 g/L" pada tiap
// anggotanya tidak memberi tahu apa pun — itu judul kartunya sendiri. Yang
// membedakan anggotanya justru bahan LAIN yang ikut di dalamnya: sebagian produk
// abamektin murni, sebagian campuran. Jadi `f` di sini memuat sisanya, dan produk
// berbahan tunggal tidak membawa medan itu sama sekali.
const anggotaBahan = (r, zatIni) => {
  const lain = r.isi.filter((c) => c.zat !== zatIni);
  const f = lain.length
    ? `+ ${lain.slice(0, 2).map((c) => `${c.nama} ${angka(c.nilai)} ${c.satuan}`).join(' · ')}` +
      (lain.length > 2 ? ` · +${lain.length - 2}` : '')
    : null;
  // Bentuk medan `g` sengaja sama dengan yang di tabel merek jalur 1: keduanya daftar
  // merek untuk satu pasangan bahan + kadar, dan dua rupa untuk satu hal yang sama
  // membuat orang mengira keduanya berbeda.
  const g = gambarKecil(r.id);
  return {
    i: r.id, n: r.nama, k: r.produsen ?? null, p: petaPecahan.get(r.id),
    ...(r.pcp ? { pk: r.pcp.key } : {}), ...(f ? { f } : {}), ...(g ? { g } : {}),
  };
};
const bahanRinci = [...perZat.entries()]
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([id, z]) => ({
    id,
    nama: z.nama,
    larangan: z.larangan,
    produk: new Set([...z.kadar.values()].flat().map((r) => r.id)).size,
    // Kadar terpadat lebih dulu: yang mencari "Abamektin" hampir selalu memegang
    // salah satu kadar yang lazim, bukan yang cuma dipakai satu produk.
    kadar: [...z.kadar.entries()]
      .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
      .map(([k, daftar]) => ({
        k,
        m: daftar.slice().sort(urutDaftar).map((r) => anggotaBahan(r, id)),
      })),
  }));

// Satu bahan bisa sendirian melewati anggaran: Sipermetrin dipakai 183 produk pada
// 37 kadar, dan nama pemegang pendaftaran tidak pendek. Yang dikeluarkan daftar
// mereknya per kadar — pola yang sama dengan `merekDi` pada berkas OPT — jadi daftar
// kartu kadarnya tetap sekali ambil, dan mereknya menyusul saat kartu itu dibuka.
// Penyaji cukup memeriksa satu medan: kalau `merekDi` ada, `m` tidak.
const kunciZat = (id) => id.replace(/[^a-z0-9]/gi, '');
const berkasBahanMerek = {};
const SISIPAN_BAHAN = 512;
for (const b of bahanRinci) {
  if (Buffer.byteLength(JSON.stringify(b), 'utf8') <= ANGGARAN - SISIPAN_BAHAN) continue;
  const kz = kunciZat(b.id);
  pecah(b.kadar.map((k) => ({ k: k.k, m: k.m }))).forEach((isi, i) => {
    const nomor = String(i).padStart(2, '0');
    const merek = {};
    for (const x of isi) merek[x.k] = x.m;
    berkasBahanMerek[`${kz}-merek-${nomor}`] = merek;
    for (const x of isi) {
      const kartu = b.kadar.find((y) => y.k === x.k);
      kartu.merek = x.m.length;
      kartu.merekDi = `bahan/${kz}-merek-${nomor}`;
      delete kartu.m;
    }
  });
}

const pecahanBahan = pecah(bahanRinci);
const berkasBahan = [];
const petaBahan = new Map();
pecahanBahan.forEach((kelompok, i) => {
  const nomor = String(i).padStart(3, '0');
  const isi = {};
  for (const b of kelompok) {
    isi[b.id] = { n: b.nama, larangan: b.larangan, produk: b.produk, kadar: b.kadar };
    petaBahan.set(b.id, `bahan/${nomor}`);
  }
  berkasBahan.push([nomor, isi]);
});

// ---------------------------------------------------------------------------
// Principal — profil badan pemegang pendaftaran
// ---------------------------------------------------------------------------
// Satu berkas memuat beberapa profil sekaligus, dipecah menurut anggaran yang sama dengan
// produk. Daftar produknya ikut DI DALAM profil, bukan di berkas kedua: profil terbesar —
// PT East West Seed Indonesia, 347 pendaftaran — berukuran sekitar 34 KB, masih di bawah
// anggaran, dan memecahnya dua tingkat berarti dua perjalanan untuk halaman yang justru
// pertanyaannya "perusahaan ini punya apa saja".
//
// Yang TIDAK ikut ke sini: `registry_names` selengkapnya. Ejaan mentah registri berguna saat
// membangun, tidak saat membaca — dan pada beberapa badan jumlahnya belasan.
const perPrincipal = new Map();
for (const b of principal) perPrincipal.set(b.id, []);

for (const r of semuaProduk) {
  if (!r.pcp) continue;
  perPrincipal.get(r.pcp.id)?.push({
    i: r.id, n: r.nama, j: r.jenis, d: r.daftar ?? null, p: petaPecahan.get(r.id),
    ...(r.gambar?.length ? { g: 1 } : {}),
  });
}
for (const r of semuaVarietas) {
  const b = principalPerNama.get(kunciNama(r.pemelihara));
  if (!b) continue;
  perPrincipal.get(b.id)?.push({
    i: r.id, n: r.nama, j: 'varietas', k: r.komoditasNama ?? null, p: petaPecahan.get(r.id),
  });
}

const principalRinci = principal.map((b) => {
  const punya = (perPrincipal.get(b.id) ?? []).sort((a, x) =>
    a.j.localeCompare(x.j) || String(a.d ?? '').localeCompare(String(x.d ?? '')) || a.n.localeCompare(x.n));
  return {
    id: b.id,
    key: b.key,
    nama: b.label?.id ?? '',
    bentuk: b.entity_form ?? null,
    sektor: b.sectors ?? [],
    punya: b.holdings,
    ...(b.seed_profile ? { benih: b.seed_profile } : {}),
    // Blok pengaya dibawa UTUH beserta tingkat bukti dan alasannya. Layar wajib
    // menampilkannya terpisah dari angka registri; memisahkannya di sini, bukan di penyaji,
    // membuat pemisahan itu tidak bisa lupa dilakukan.
    ...(b.profile ? { pengaya: b.profile } : {}),
    daftar: punya,
  };
});

// Satu berkas per badan, bukan pecahan menurut anggaran seperti produk. Sebabnya bukan
// ukuran — profil terbesar 34 KB, masih muat — melainkan TAUTAN. Setiap nama pemegang yang
// muncul di layar mana pun harus bisa menunjuk ke profilnya, dan itu berarti tiap tautan
// perlu tahu berkas mana yang memuatnya. Dengan pecahan menurut anggaran, nomor berkas itu
// tidak bisa diturunkan dari apa pun: ia harus dibawa serta di TIAP entri — di daftar setara,
// di tabel merek per kadar, di kartu hasil pencarian — atau peta 3.136 baris harus diunduh
// tiap halaman. Satu berkas per `key` menghapus keduanya: jalurnya `principal/<key>`, dan
// yang perlu dibawa satu kata yang memang sudah ada.
const kunciPrincipal = (k) => k.replace(/[^a-z0-9-]/gi, '');
const berkasPrincipal = {};
const petaPrincipal = new Map();
for (const b of principalRinci) {
  const k = kunciPrincipal(b.key);
  berkasPrincipal[k] = b;
  petaPrincipal.set(b.id, `principal/${k}`);
}

// ---------------------------------------------------------------------------
// Harga komoditas — satu berkas per varian, dan satu kepala untuk daftarnya
// ---------------------------------------------------------------------------
// Berbeda dari produk: yang membuka halaman harga membutuhkan SELURUH serinya sekaligus,
// karena grafiknya memang seluruh seri. Jadi pemecahannya per varian, bukan per anggaran.
// Seri terpanjang 634 titik ≈ 14 KB — di bawah anggaran tanpa perlu dipecah.
const kunciHarga = (k) => k.replace(/[^a-z0-9-]/gi, '');
const komentarPer = hargaKomentar?.komentar ?? {};

const berkasHarga = {};
for (const h of hargaSeri) {
  const k = kunciHarga(h.key);
  const kom = komentarPer[h.key];
  berkasHarga[k] = {
    id: h.id,
    key: h.key,
    nama: h.label?.id ?? '',
    kelompok: h.commodity_group ?? null,
    komoditas: h.commodity ?? null,
    tingkat: h.price_level,
    golongan: h.sector ?? 'pangan',
    // Empat medan yang membuat layar berhenti mengira semua harga di sini sama jenisnya.
    // Tanpa `cakupanHukum`, halaman TBS menayangkan harga yang TIDAK diterima mayoritas
    // pembacanya seolah harga mereka — dan itu kekeliruan yang tidak bisa diperbaiki pembaca.
    dasar: h.basis ?? 'survei',
    ...(h.region ? { wilayah: h.region } : {}),
    ...(h.legal_scope ? { cakupanHukum: h.legal_scope } : {}),
    ...(h.nominal_dates ? { tanggalNominal: true } : {}),
    ...(h.source_system ? { sistem: h.source_system } : {}),
    ...(h.age_bands ? { pitaUmur: h.age_bands } : {}),
    ...(h.formula ? { rumus: h.formula } : {}),
    satuan: h.unit,
    qty: h.qty ?? 1,
    timbangan: h.weighting,
    cakupan: h.coverage,
    ...(h.series ? { seri: h.series } : {}),
    ...(h.stats ? { statistik: h.stats } : {}),
    ...(h.empty_reason ? { kosong: h.empty_reason } : {}),
    // Komentar dibawa bersama `fakta` yang dipakai menulisnya, dan bersama `sumber` yang
    // menyebut siapa penulisnya. Tanpa keduanya kalimat itu tidak bisa diperiksa siapa pun —
    // dan itu persis keberatan B5 yang membuat kapabilitas ini ditunda.
    ...(kom
      ? {
        komentar: {
          teks: kom.komentar,
          batas: kom.batas,
          sumber: kom.sumber,
          // DUA keadaan yang berbeda, dan keduanya ikut ke layar terpisah. `periksa` hanya
          // menyatakan bahwa aritmetikanya bisa ditelusuri; `ditinjau` menyatakan seorang
          // manusia bertanggung jawab atas bacaannya. Membawa yang pertama tanpa yang kedua
          // membuat layar terdengar sudah diperiksa padahal yang diperiksa baru angkanya.
          ditinjau: kom.ditinjau ?? null,
          ...(kom.ditinjauOleh ? { oleh: kom.ditinjauOleh } : {}),
          ...(kom.diperiksaMesin
            ? {
              periksa: kom.diperiksaMesin.lolos
                ? { lolos: true }
                : { lolos: false, masalah: kom.diperiksaMesin.masalah ?? [] },
            }
            : {}),
        },
      }
      : {}),
  };
}

// Kepala daftar harga: cukup untuk menggambar halaman indeks tanpa mengambil 88 berkas seri.
const kepalaHarga = hargaSeri
  .map((h) => ({
    k: kunciHarga(h.key),
    n: h.label?.id ?? '',
    g: h.commodity_group ?? null,
    s: h.unit,
    // Golongan ikut ke kepala daftar, bukan cuma ke berkas rincinya: penyaringan terjadi
    // saat daftar digambar, dan mengambil 88 berkas rinci hanya untuk tahu mana yang tani
    // adalah 88 perjalanan untuk satu keputusan yang muat dalam satu huruf.
    r: h.sector ?? 'pangan',
    // Tingkat dan wilayah ikut ke kepala daftar: kartu di daftar harus bisa menandai mana
    // yang harga pekebun dan mana yang eceran, tanpa mengambil berkas rincinya lebih dulu.
    ...(h.price_level && h.price_level !== 'retail' ? { l: h.price_level } : {}),
    ...(h.region ? { w: h.region.label } : {}),
    ...(h.stats?.terakhir ? { p: h.stats.terakhir.p, t: h.stats.terakhir.t, u30: h.stats.ubah30, u30h: h.stats.ubahHari?.[30] ?? null } : {}),
    ...(h.series ? {} : { kosong: true }),
    ...(h.commodity ? { c: h.commodity.id } : {}),
  }))
  .sort((a, b) => (Number(Boolean(a.kosong)) - Number(Boolean(b.kosong))) || a.n.localeCompare(b.n, 'id'));

const cari = {};
// `_k` medan SEMENTARA: nama yang dipakai memfilekan entri ini, yang tidak selalu sama
// dengan nama yang ditampilkan. Pendalaman ember harus memakai kunci itu, bukan `n` —
// kalau tidak, alias "Probolinggo" untuk "Pemerintah Daerah Kabupaten Probolinggo" akan
// dipindahkan ke ember "pe" begitu embernya didalamkan, dan alias itu jadi tak terjangkau
// dari kata yang justru dibuatkan untuknya. Dibuang sebelum ditulis.
const tambah = (nama, entri) => {
  const e = ember(nama);
  (cari[e] ??= []).push(nama === entri.n ? entri : { ...entri, _k: nama });
};

for (const r of [...semuaProduk, ...semuaVarietas]) {
  // `f` cuma ditulis kalau ada isinya — medan bernilai null pada 26 ribu entri
  // memakan pecahan tanpa memberi tahu apa pun.
  const f = r.jenis === 'varietas' ? null : pembeda(r);
  // Varietas menautkan pemeliharanya lewat `principalPerNama`; produk lewat `pcp` yang sudah
  // terpasang di rinciannya. Keduanya menghasilkan `pk` yang sama bentuknya, sehingga kartu
  // hasil pencarian tidak perlu tahu ia sedang melihat produk atau varietas.
  const pk = r.jenis === 'varietas'
    ? principalPerNama.get(kunciNama(r.pemelihara))?.key
    : r.pcp?.key;
  tambah(r.nama, {
    n: r.nama,
    i: r.id,
    j: r.jenis,
    k: r.jenis === 'varietas' ? r.komoditasNama : r.produsen,
    ...(f ? { f } : {}),
    ...(pk ? { pk } : {}),
    p: petaPecahan.get(r.id),
  });
}

// Bahan aktif masuk ke ember yang sama dengan nama produk, bukan ke indeks terpisah:
// yang mengetik "Abamektin" tidak tahu — dan tidak perlu tahu — bahwa yang diketiknya
// bahan, bukan merek. Satu kotak, satu pengambilan, jenisnya dinyatakan di kartunya.
for (const b of bahanRinci) {
  tambah(b.nama, {
    n: b.nama,
    i: b.id,
    j: 'bahan',
    k: `${b.produk} produk terdaftar · ${b.kadar.length} kadar`,
    p: petaBahan.get(b.id),
  });
}

// Principal masuk ke ember yang sama juga. Yang mengetik "Petrokimia" sedang menyebut sebuah
// perusahaan, bukan sebuah merek — dan hari ini kotak itu menjawabnya nol.
const SEKTOR = { pesticide: 'pestisida', fertilizer: 'pupuk', seed: 'benih' };
// Awalan yang dipakai ratusan badan bersamaan, sehingga ia tidak membedakan apa pun. Dibuang
// hanya untuk membentuk kunci pencarian KEDUA; nama yang ditampilkan tetap utuh.
// Bentuk badan ikut dikupas, dan itu bukan sekadar kerapian: hampir seluruh perusahaan di
// registri bernama "PT ...", sehingga ketiganya menumpuk di satu ember. Yang mencari
// "East West" tidak mengetik "PT" lebih dulu — ia mengetik nama yang diingatnya.
const AWALAN_LEMBAGA =
  /^(pt|cv|ud|koperasi|kud|perum|perusahaan\s+perseroan(\s+\(persero\))?)\.?\s+|^(pemerintah\s+(daerah\s+)?(kabupaten|kota|provinsi)?|pemerintah|dinas\s+[\w\s]*?(kabupaten|kota|provinsi)|dinas|balai\s+(besar\s+)?(penelitian|pengkajian|pengembangan)?(\s+tanaman)?|universitas|fakultas\s+[\w\s]*?,?|institut|politeknik)\s+/i;
for (const b of principalRinci) {
  const isi = ['pesticide', 'fertilizer', 'seed']
    .filter((x) => b.punya[x] > 0)
    .map((x) => `${b.punya[x]} ${SEKTOR[x]}`)
    .join(' · ');
  const entri = {
    n: b.nama,
    i: b.id,
    j: 'principal',
    k: isi || 'tanpa pendaftaran tercatat',
    ...(b.bentuk && b.bentuk !== 'tidak_diketahui' ? { f: b.bentuk } : {}),
    p: petaPrincipal.get(b.id),
  };
  tambah(b.nama, entri);

  // Kunci kedua tanpa awalan lembaga. "Pemerintah Kabupaten Probolinggo" juga terdaftar di
  // bawah "Probolinggo", karena kata itulah yang diingat orang — dan karena tanpa itu, satu-
  // satunya jalan menemukannya adalah mengeja sembilan belas huruf yang sama untuk 676 badan.
  const tanpaAwalan = samakanNama(b.nama).replace(AWALAN_LEMBAGA, '');
  if (tanpaAwalan && rapikan(tanpaAwalan) !== rapikan(b.nama) && rapikan(tanpaAwalan).length >= 3) {
    tambah(tanpaAwalan, { ...entri, n: b.nama });
  }
}

// Harga ikut ke kotak yang sama. "cabai" sekarang bisa berarti tiga hal — OPT, produk, dan
// harga — dan kartunya yang membedakan, bukan pintu masuk yang berbeda.
for (const h of hargaSeri) {
  const k = kunciHarga(h.key);
  const b = berkasHarga[k];
  tambah(h.label?.id ?? '', {
    n: h.label?.id ?? '',
    i: h.id,
    j: 'harga',
    k: b.seri
      ? `${b.statistik.terakhir.p.toLocaleString('id-ID', { maximumFractionDigits: 0 })}/${h.unit} · ${b.statistik.terakhir.t}`
      : 'diterbitkan SP2KP tanpa satu pun angka',
    ...(h.commodity_group ? { f: h.commodity_group } : {}),
    p: `harga/${k}`,
  });
}
for (const e of Object.keys(cari)) cari[e].sort((a, b) => a.n.localeCompare(b.n) || a.i.localeCompare(b.i));

// Beberapa awalan jauh lebih padat dari yang lain — "ma" sendiri 80 KB. Yang
// melewati anggaran didalamkan satu huruf lagi, berulang sampai muat. Awalan yang
// didalamkan dicatat di meta.json, jadi penyaji tahu harus meminta tiga huruf
// alih-alih dua tanpa perlu satu perjalanan gagal lebih dulu.
// Kata yang menandai — "trichoderma", "biosaka", "PGPR", "kompos" — jarang ada di awal
// namanya. "Perbanyakan Trichoderma pada media serealia" masuk ember "pe", jadi yang
// mengetik nama jasad reniknya dijawab nol. Tiap kata penting karena itu difilekan
// sebagai alias, memakai mekanisme `_k` yang sudah dipakai alias principal.
// Diturunkan langsung dari kosakata, bukan dari berkasSediaan — berkas itu baru disusun
// jauh di bawah, sementara entri pencarian harus sudah masuk SEBELUM ember didalamkan.
// Entri yang masuk sesudahnya tertinggal di ember dangkal sementara penyaji mencarinya
// di ember dalam, dan hasilnya nol tanpa satu pun galat.
const sediaanCari = sediaan.map((x) => ({
  id: x.id,
  nama: x.label?.id ?? '',
  jalur: /pesticide|unclear/.test((x.regulatory?.regime ?? []).join('+')) ? 6 : 5,
  bukti: x.evidence_tier,
  berkas: `sediaan/${x.id.replace(/[^a-z0-9]/gi, '')}`,
}));

const REMEH = new Set(['pada', 'media', 'proses', 'dari', 'dan', 'atau', 'untuk', 'yang',
  'tanpa', 'buatan', 'sendiri', 'cair', 'padat', 'kotoran', 'bahan']);

for (const r of sediaanCari) {
  const entri = {
    n: r.nama,
    i: r.id,
    j: 'sediaan',
    k: r.jalur === 5 ? 'sediaan pupuk buatan sendiri' : 'sediaan pengendali — status hukum, bukan anjuran',
    f: `tingkat bukti ${r.bukti}`,
    p: r.berkas,
  };
  tambah(r.nama, entri);
  // Alias yang jatuh di ember yang sama dengan nama utuhnya menghasilkan entri ganda
  // di layar — "Kompos" dan "Kompos kotoran sapi" sama-sama masuk ember "ko".
  const sudah = new Set([rapikan(r.nama)]);
  const emberUtama = ember(r.nama);
  for (const kata of r.nama.split(/[^A-Za-z0-9]+/)) {
    if (kata.length < 4 || REMEH.has(kata.toLowerCase())) continue;
    const k = rapikan(kata);
    if (sudah.has(k) || ember(kata) === emberUtama) continue;
    sudah.add(k);
    tambah(kata, { ...entri, n: r.nama });
  }
}

// ---------------------------------------------------------------------------
// OPT registri yang bisa dicari menurut NAMA — C3, sisi yang tidak menuntut agronomi
// ---------------------------------------------------------------------------
// 749 OPT registri punya produk terdaftar; sepuluh di antaranya punya teks gejala. Yang
// 739 sisanya sampai hari ini TIDAK BISA DICAPAI SAMA SEKALI dari kotak beranda — nol
// entri OPT di kepala pencarian — walau bahan aktif yang terdaftar untuknya sudah ada
// di indeks. Yang tahu nama hamanya dijawab nol, dan itu bukan kekurangan data melainkan
// pintu yang belum dibuka.
//
// Yang dibuka DI SINI hanya pintunya. Menulis teks gejala untuk 739 OPT adalah pekerjaan
// agronomi, bukan pekerjaan indeks, dan mengarangnya persis yang ditolak jalur 1.
// `kunciKomoditas` baru ada di bawah, sesudah pendalaman ember. Bentuknya sepele, jadi
// disalin sebaris di sini alih-alih memindahkan definisi yang dipakai di tempat lain.
const kunciId = (id) => id.replace(/[^a-z0-9]/gi, '');

const optRegistriIndeks = [];
const berkasOptNama = {};
for (const k of optRegistri) {
  const di = [];
  for (const [kc, v] of perKomoditas) {
    const o = v.opt.get(k.id);
    if (!o) continue;
    di.push({ k: v.nama, b: `opt/${kunciId(kc)}/${kunciId(k.id)}`, p: o.produk.size });
  }
  if (!di.length) continue;
  const kunci = kunciId(k.id);
  // TIDAK ADA penanda "punya gejala" di sini, dan itu bukan kelalaian: OPT terkurasi
  // (op:pst:0000000x) dan OPT registri (op:pst:00001xxx) adalah DUA RUANG ID YANG
  // BERBEDA — tidak satu pun dari 738 ini ada di pest.json. Menandainya berarti
  // memeriksa kecocokan yang tidak pernah dibuat siapa pun.
  optRegistriIndeks.push({
    i: k.id, n: k.label?.id ?? '', l: k.scientific_name ?? null,
    komoditas: di.length, produk: di.reduce((a, x) => a + x.p, 0), kunci,
  });
  berkasOptNama[kunci] = {
    id: k.id, nama: k.label?.id ?? '', ilmiah: k.scientific_name ?? null,
    di: di.sort((a, b) => b.p - a.p || a.k.localeCompare(b.k)),
  };
}
optRegistriIndeks.sort((a, b) => a.n.localeCompare(b.n));

// C3 — nama OPT masuk kepala pencarian. Nama ilmiahnya ikut sebagai alias: yang
// mengetik "Spodoptera" tidak sedang mengetik awalan nama Indonesianya.
for (const o of optRegistriIndeks) {
  const entri = {
    n: o.n, i: o.i, j: 'opt',
    k: `${o.produk.toLocaleString('id-ID')} produk terdaftar di ${o.komoditas} komoditas · tanpa teks gejala`,
    ...(o.l ? { f: o.l } : {}),
    p: `opt-nama/${o.kunci}`,
  };
  tambah(o.n, entri);
  if (o.l && ember(o.l) !== ember(o.n)) tambah(o.l, { ...entri, n: o.n });
}

const cariDalam = [];
const muat = (isi) => Buffer.byteLength(JSON.stringify(isi), 'utf8') <= ANGGARAN;
// Batasnya dulu 8 dan itu diam-diam gagal begitu principal masuk: 676 badan bernama
// "Pemerintah Kabupaten X" berbagi sembilan belas huruf pertama, sehingga `cari/pemerint.json`
// berhenti didalamkan pada 64 KB — sepertiga di atas anggaran, pada permukaan yang syarat
// lapangannya sinyal buruk. Batasnya dinaikkan sampai pendalaman benar-benar selesai.
//
// Konsekuensinya nyata dan sengaja diterima: mengetik "pemerintah" saja akan dijawab "tambah
// huruf lagi", karena embernya memang belum cukup sempit. Yang menutupi itu bukan pengecualian
// di sini melainkan kunci tambahan di bawah — badan berawalan lembaga juga terdaftar di bawah
// nama tempatnya, sehingga "bandung" menemukannya tanpa mengeja awalannya.
for (let panjang = 2; panjang < 32; panjang++) {
  const gemuk = Object.keys(cari).filter((e) => e.length === panjang && !muat(cari[e]));
  if (!gemuk.length) break;
  for (const e of gemuk) {
    for (const r of cari[e]) {
      const dalam = (rapikan(r._k ?? r.n) + '_______').slice(0, panjang + 1);
      (cari[dalam] ??= []).push(r);
    }
    delete cari[e];
    cariDalam.push(e);
  }
}
cariDalam.sort();

// Medan sementara dibuang di sini, sesudah pendalaman selesai dan sebelum apa pun ditulis.
// Yang dibutuhkan penyaji hanya nama tampilnya; kunci filenya urusan pembangun.
for (const e of Object.keys(cari)) for (const r of cari[e]) delete r._k;

/* Dua medan yang membuat baris merek bisa DIBUKA, bukan cuma dibaca.
 *
 * Sampai sekarang tabel merek di jalur 1 buntu: ia menyebut nama, nomor, dan dosis,
 * lalu berhenti — yang mau tahu isinya harus menyalin namanya ke kotak cari jalur 2.
 * Nomor pendaftarannya sudah ada di layar, jadi yang kurang cuma alamat rinciannya.
 *
 *   `p` pecahan rincian produknya, supaya jalur 2 bisa dibuka langsung. Dihitung dari
 *       `petaPecahan`, TIDAK ditebak dari nomor urut: pecahan dipotong menurut ukuran,
 *       jadi tidak ada rumus dari id ke nomor pecahan.
 *   `g` berkas gambar kemasan ukuran kecil, dan hanya kalau produknya memang punya —
 *       694 dari 14.920. Yang tidak punya tidak diberi medan kosong, sama seperti di
 *       rincian produk: 14 ribu medan null memakan pecahan tanpa memberi tahu apa pun.
 *
 * Ukuran gambarnya tidak ikut. Yang `kecil` dibatasi 320 px pada sisi terpanjangnya
 * dan nisbahnya berselisih; layar memasangnya di kotak berukuran tetap, jadi tingginya
 * tidak pernah bergantung pada gambarnya dan tidak ada yang bergeser saat ia mendarat.
 */
const hiasMerek = (m) => {
  const p = petaPecahan.get(m.id);
  const g = gambarKecil(m.id);
  return { ...m, ...(p ? { p } : {}), ...(g ? { g } : {}) };
};

// Indeks OPT dipecah dua tingkat, karena satu berkas per komoditas bisa mencapai
// 960 KB — kelapa sawit sendiri punya 622 produk untuk satu gulma. Tingkat pertama
// hanya daftar OPT beserta jumlahnya, yang memang itulah isi layar sesudah
// komoditas dipilih; daftar bahan dan mereknya baru diambil saat satu OPT dibuka.
const berkasOpt = {};
const kunciKomoditas = (id) => id.replace(/[^a-z0-9]/gi, '');
for (const [kc, v] of [...perKomoditas.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const kk = kunciKomoditas(kc);
  const daftarOpt = [];
  for (const [oid, o] of [...v.opt.entries()].sort((a, b) => a[1].nama.localeCompare(b[1].nama))) {
    const grup = [...o.grup.values()]
      .map((g) => ({ ...g, merek: g.merek.slice().sort(urutDaftar).map(hiasMerek) }))
      .sort((a, b) => b.merek.length - a.merek.length || a.zat.localeCompare(b.zat));
    const berkartu = new Set();
    for (const g of grup) for (const m of g.merek) berkartu.add(m.id);
    const ko = kunciKomoditas(oid);
    daftarOpt.push({
      id: oid,
      nama: o.nama,
      produk: o.produk.size,
      // Selisihnya dinyatakan, bukan didiamkan: sekian produk terdaftar untuk OPT ini
      // tetapi komposisinya kosong di registri, jadi tidak bisa muncul sebagai kartu.
      tanpaKartu: o.produk.size - berkartu.size,
      // Dua angka berbeda yang mudah tertukar: 72 bahan aktif tetapi 161 kartu,
      // karena satu bahan dipakai pada banyak kadar. Layar menyebut yang pertama
      // sebagai angka besar dan menampilkan yang kedua sebagai kartu, jadi keduanya
      // harus tersedia — memilih salah satu memaksa penyaji menaksir yang lain.
      zat: new Set(grup.map((g) => g.zat)).size,
      kartu: grup.length,
      laranganLain: grup.some((g) => g.laranganLain),
      dilarang: grup.some((g) => g.larangan),
      berkas: `opt/${kk}/${ko}`,
    });
    // Dua belas dari 4.110 berkas OPT melewati anggaran — kelapa sawit dan padi,
    // yang satu gulmanya saja dilayani ratusan produk. Hanya pada yang gemuk itu
    // daftar mereknya dikeluarkan ke berkas sendiri; sisanya tetap sekali ambil,
    // karena p50-nya cuma 0,4 KB dan menambah perjalanan untuk semuanya justru
    // merugikan kasus yang lazim. Penyaji cukup memeriksa satu medan: kalau
    // `merekDi` ada, daftar merek diambil saat kartu dibuka.
    // Jumlahnya ikut ke berkas rincian, bukan cuma ke daftar: pada OPT terpadat daftar
    // mereknya dikeluarkan ke berkas terpisah, jadi penyaji yang menghitung ulang dari
    // keanggotaan kartu akan mendapat nol.
    const produkBerlarangan = new Set();
    for (const g of grup) if (g.larangan || g.laranganLain) for (const m of g.merek) produkBerlarangan.add(m.id);
    const utuh = {
      komoditas: kc,
      komoditasNama: v.nama,
      opt: oid,
      optNama: o.nama,
      produk: o.produk.size,
      zat: new Set(grup.map((g) => g.zat)).size,
      kartu: grup.length,
      berlarangan: produkBerlarangan.size,
      grup,
    };
    if (Buffer.byteLength(JSON.stringify(utuh), 'utf8') > ANGGARAN) {
      // Dikeluarkan per kartu, bukan sekaligus: mengeluarkan seluruh merek satu OPT
      // ke satu berkas hanya memindahkan berkas 84 KB, dan yang membukanya cuma
      // butuh satu kartu. Tiap grup menunjuk pecahannya sendiri lewat `merekDi`.
      pecah(grup.map((g) => ({ kunci: g.kunci, merek: g.merek }))).forEach((isi, i) => {
        const nomor = String(i).padStart(2, '0');
        const merek = {};
        for (const g of isi) merek[g.kunci] = g.merek;
        berkasOpt[`${kk}/${ko}-merek-${nomor}`] = merek;
        for (const g of isi) {
          const kartu = grup.find((x) => x.kunci === g.kunci);
          kartu.merekDi = `opt/${kk}/${ko}-merek-${nomor}`;
          kartu.merek = g.merek.length;
        }
      });
    }
    // Kalau daftar kartunya sendiri yang kelewat panjang, mengeluarkan merek tidak
    // menolong. Kartu sudah terurut menurut jumlah produk, jadi halaman pertama
    // memang lima teratas yang ditampilkan layar; sisanya menyusul saat diminta.
    // Jumlah yang tersisa disebutkan (`kartuLain`), bukan dipotong diam-diam.
    if (Buffer.byteLength(JSON.stringify(utuh), 'utf8') > ANGGARAN) {
      const halaman = pecah(utuh.grup);
      utuh.grup = halaman[0];
      utuh.kartuDi = halaman.slice(1).map((_, i) => `opt/${kk}/${ko}-kartu-${String(i + 1).padStart(2, '0')}`);
      utuh.kartuLain = halaman.slice(1).reduce((a, h) => a + h.length, 0);
      // Medan `kartuDi` dan `kartuLain` sendiri ikut memakan tempat, jadi halaman
      // pertama dirapatkan sampai berkasnya benar-benar muat — bukan sampai kira-kira.
      // Kelonggaran 512 bita: `kartuDi` ditulis SESUDAH pemangkasan ini, jadi
      // memangkas sampai pas di anggaran menyisakan berkas yang lewat beberapa bita
      // begitu daftar halamannya ikut masuk.
      const SISIPAN = 512;
      const sisa = [];
      while (utuh.grup.length > 1 && Buffer.byteLength(JSON.stringify(utuh), 'utf8') > ANGGARAN - SISIPAN) {
        sisa.unshift(utuh.grup.pop());
        utuh.kartuLain++;
      }
      const semuaHalaman = sisa.length ? [...halaman.slice(1), sisa] : halaman.slice(1);
      utuh.kartuDi = semuaHalaman.map((_, i) => `opt/${kk}/${ko}-kartu-${String(i + 1).padStart(2, '0')}`);
      semuaHalaman.forEach((h, i) => {
        berkasOpt[`${kk}/${ko}-kartu-${String(i + 1).padStart(2, '0')}`] = h;
      });
    }
    berkasOpt[`${kk}/${ko}`] = utuh;
  }
  berkasOpt[kk] = { komoditas: kc, nama: v.nama, opt: daftarOpt };
}

// ---------------------------------------------------------------------------
// Sediaan sendiri: kecil, dibawa utuh, tetapi dipisah menurut jalurnya
// ---------------------------------------------------------------------------
const kunciSediaan = (id) => id.replace(/[^a-z0-9]/gi, '');
const sisi = (s) => (/pesticide|unclear/.test((s.regulatory?.regime ?? []).join('+')) ? 'pengendali' : 'pupuk');
const berkasSediaan = {
  bahan: bahanOrganik
    .map((b) => ({
      id: b.id,
      nama: b.label?.id ?? '',
      // Diambil dari on_farm, bukan ditebak dari teks bebas. Larangannya ada di
      // `status`, dan `reason` bukan hiasan: pada bahan berstatus `restricted` ia
      // memuat syarat yang membuat bahannya boleh dipakai sama sekali — molase pada
      // seduhan kotoran ternak memicu perbanyakan patogen, urine sapi harus
      // difermentasi tertutup tujuh hari. Menyajikan statusnya tanpa alasannya
      // menyisakan perintah tanpa sebab, yang justru paling mudah diabaikan.
      status: b.on_farm?.status ?? null,
      alasan: b.on_farm?.reason ?? null,
      sanitasiWajib: b.on_farm?.sanitation_required ?? false,
    }))
    .sort((a, b) => a.id.localeCompare(b.id)),
  resep: sediaan
    .map((s) => ({
      id: s.id,
      nama: s.label?.id ?? '',
      jalur: sisi(s) === 'pupuk' ? 5 : 6,
      kelas: s.preparation_class ?? null,
      fungsi: (s.intended_functions ?? []).slice().sort(),
      rezim: (s.regulatory?.regime ?? []).slice().sort(),
      peredaran: s.regulatory?.circulation ?? null,
      bukti: s.evidence_tier ?? null,
      adaKriteria: Boolean(s.release_criteria?.length),
      phi: s.safety?.phi_days ?? null,
      phiDasar: s.safety?.phi_basis ?? null,
      berkas: `sediaan/${kunciSediaan(s.id)}`,
    }))
    .sort((a, b) => a.id.localeCompare(b.id)),
};

// Resep utuhnya di berkas sendiri-sendiri. Daftarnya kecil dan diambil jalur 3 juga
// (sebagai cabang "tidak sanggup"), jadi ia tidak boleh ikut menanggung bobot dua
// belas resep lengkap beserta titik kendali dan kriteria pelepasannya.
const berkasResep = {};
for (const s of sediaan) {
  berkasResep[kunciSediaan(s.id)] = {
    id: s.id,
    nama: s.label?.id ?? '',
    jalur: sisi(s) === 'pupuk' ? 5 : 6,
    definisi: s.definition?.id ?? null,
    kelas: s.preparation_class ?? null,
    fungsi: (s.intended_functions ?? []).slice().sort(),
    bukti: s.evidence_tier ?? null,
    buktiCatatan: s.evidence_note?.id ?? null,
    // Kedudukan hukumnya didahulukan dan pasalnya dibawa apa adanya: bunyi Pasal 72
    // itulah yang membuat sisi pupuk lapang, dan meringkasnya jadi "boleh" membuang
    // syarat peredaran terbatas yang menyertainya.
    hukum: {
      rezim: (s.regulatory?.regime ?? []).slice().sort(),
      peredaran: s.regulatory?.circulation ?? null,
      hanyaSendiri: s.regulatory?.own_use_only ?? null,
      dasar: (s.regulatory?.legal_basis ?? []).map((d) => ({
        instrumen: d.instrument ?? null,
        pasal: d.article ?? null,
        bunyi: d.effect ?? null,
      })),
    },
    bahan: (s.feedstocks ?? []).map((f) => ({
      zat: f.substance?.id ?? null,
      nama: f.substance?.label ?? null,
      peran: f.role ?? null,
      takaran: f.proportion ? { nilai: f.proportion.value, satuan: f.proportion.unit } : null,
      pilihan: f.optional ?? false,
    })),
    proses: s.process
      ? {
          cara: s.process.kind ?? null,
          lama: s.process.duration ?? null,
          wadah: s.process.vessel ?? null,
          sanitasi: s.process.sanitation ?? null,
          titikKendali: (s.process.critical_control_points ?? []).map((t) => ({
            nama: t.name?.id ?? null,
            ubah: t.target?.variable?.label ?? null,
            operator: t.target?.operator ?? null,
            nilai: t.target?.value ?? null,
            satuan: t.target?.unit ?? null,
            cara: t.check_method?.id ?? null,
            kalauMeleset: t.on_deviation?.id ?? null,
          })),
        }
      : null,
    // field_proxy yang KOSONG tidak diisi apa pun. Pada bokashi dan vermikompos
    // kosakata memang belum memuatnya, dan layar harus mengatakannya alih-alih
    // mengarang uji kebun yang tidak pernah diputuskan siapa pun.
    // Bagian pembandingnya dibawa terpisah, bukan sudah tergabung jadi satu kalimat.
    // Sebagian kriteria sengaja TIDAK berambang angka — kemurnian biakan MOL memakai
    // ">= 0 %" dengan alasan tertulis "tidak ada dasar mengukurnya di kebun" — dan
    // menggabungkannya lebih dulu memaksa penyaji mencetak ambang yang justru
    // sengaja tidak ada.
    kriteria: (s.release_criteria ?? []).map((k) => ({
      jenis: k.kind ?? null,
      ubah: k.compare?.variable?.label ?? null,
      operator: k.compare?.operator ?? null,
      nilai: k.compare?.value ?? null,
      satuan: k.compare?.unit ?? null,
      metode: k.method?.label ?? null,
      diKebun: k.field_proxy?.id ?? null,
      alasan: k.rationale?.id ?? null,
    })),
    pemakaian: s.application
      ? {
          dosis: s.application.default_rate
            ? {
                nilai: s.application.default_rate.value,
                satuan: s.application.default_rate.unit,
                basis: s.application.default_rate.basis ?? null,
                min: s.application.default_rate.min ?? null,
                maks: s.application.default_rate.max ?? null,
              }
            : null,
          cara: s.application.default_method?.label ?? null,
        }
      : null,
    keselamatan: {
      bahaya: (s.safety?.hazards ?? []).map((h) => h.id ?? String(h)),
      apd: s.safety?.ppe ?? [],
      catatan: s.safety?.note?.id ?? null,
      phi: s.safety?.phi_days ?? null,
      phiDasar: s.safety?.phi_basis ?? null,
    },
    rendemen: s.yield_ratio ? { nisbah: s.yield_ratio.output_per_input, catatan: s.yield_ratio.note?.id ?? null } : null,
    simpan: { lama: s.shelf_life ?? null, cara: s.storage?.id ?? null },
    // L18 menolak menghitung hara dari batch yang belum diuji, dan kadar kompos
    // berbeda tiap tumpukan. Ini yang menahan resep-resep ini keluar dari kalkulator
    // jalur 3 dengan angka.
    dasarKomposisi: s.composition_basis ?? null,
  };
}

// A1 — sediaan ikut kepala pencarian. Sebelum ini jalur 5 dan 6 TIDAK BISA DICAPAI dari
// kotak beranda sama sekali: keduanya hanya punya pintu sendiri, dan yang mengetik
// "trichoderma" atau "biosaka" dijawab nol. Dua belas resep, dan pintunya berbeda menurut
// rezimnya — sisi pupuk ke jalur 5, sisi pengendali ke jalur 6 — karena keduanya memang
// dua layar yang berbeda janjinya, bukan satu layar dengan dua tab.

// ---------------------------------------------------------------------------
// Pintu masuk jalur 1: OPT terkurasi beserta teks gejalanya
// ---------------------------------------------------------------------------
// `definition` pada pest.json sempat terhitung sebagai teks gejala. Isinya bukan:
// "Vektor virus kuning keriting" catatan epidemiologi, bukan apa yang terlihat orang
// yang berdiri di depan tanamannya. Sesudah spec/tools/tulis-gejala-opt.mjs,
// gejalanya punya medan sendiri — `symptoms` — beserta `distinguishing`, dua ciri
// yang bisa diperiksa sendiri tanpa alat. Keduanya dibawa ke sini; `definition` ikut
// juga, tetapi sebagai keterangan tambahan, bukan sebagai gejala.
//
// `hosts` pada entri terkurasi menunjuk "Cabai merah besar" (op:cmd:00000001)
// sementara pendaftarannya ada di bawah "Cabai" (op:cmd:00001003), jadi komoditasnya
// diturunkan dari pendaftaran yang benar-benar ada, bukan dari hosts.
const gejala = optTerkurasi
  .map((k) => {
    const di = [];
    for (const [kc, v] of perKomoditas) {
      const o = v.opt.get(k.id);
      if (!o) continue;
      di.push({ komoditas: kc, nama: v.nama, produk: o.produk.size, berkas: `opt/${kunciKomoditas(kc)}/${kunciKomoditas(k.id)}` });
    }
    return {
      id: k.id,
      nama: k.label?.id ?? '',
      ilmiah: k.scientific_name ?? null,
      jenis: k.pest_kind ?? null,
      gejala: k.symptoms?.id ?? null,
      keterangan: k.definition?.id ?? null,
      // Ciri pembanding ikut, dan `membantah` menunjuk OPT yang paling mudah tertukar
      // dengannya. Mesin tidak menebak — ini yang membuat orang bisa memastikan
      // sendiri sebelum menyemprot.
      pembanding: (k.distinguishing ?? []).map((d) => ({
        cek: d.check?.id ?? null,
        membantah: d.rules_out ?? null,
      })),
      catatan: k.notes?.id ?? null,
      // Dinyatakan, bukan disembunyikan: tanpa teks gejala OPT ini tidak punya pintu
      // masuk sama sekali, sebanyak apa pun produk terdaftarnya.
      adaPintu: Boolean(k.symptoms?.id),
      di: di.sort((a, b) => b.produk - a.produk || a.komoditas.localeCompare(b.komoditas)),
    };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

// ---------------------------------------------------------------------------
// Kepala pencarian gejala
// ---------------------------------------------------------------------------
// Gejala tidak bisa diember menurut dua huruf pertama seperti nama: yang mengetik
// "daun mengeriting ke atas" tidak sedang mengetik awalan sebuah nama, ia sedang
// menyebut apa yang dilihatnya. Jadi kepala ini kecil dan dibawa utuh — sepuluh OPT,
// sekitar 5 KB — lalu dicocokkan kata per kata di peramban.
//
// Yang ikut hanya nama, nama ilmiah, dan teks gejalanya. Ciri pembanding TIDAK ikut:
// begitu satu gejala dibuka, jalur 1 yang merendernya, dan di sanalah blok "pastikan
// dulu" berada. Gejala tanpa blok itu adalah tebakan yang dipoles, jadi pintu ini
// tidak boleh bisa dibuka tanpa melewatinya.

const gejalaCari = gejala
  .filter((g) => g.adaPintu)
  .map((g) => ({
    i: g.id,
    n: g.nama,
    l: g.ilmiah ?? null,
    // Satu medan teks, bukan tiga: penyaji cukup mencocokkan sekali, dan bobot antar
    // medan yang tidak pernah diputuskan siapa pun tidak perlu dikarang di sini.
    t: [g.nama, g.ilmiah, g.gejala, g.keterangan].filter(Boolean).join(' '),
    produk: g.di.reduce((a, b) => a + b.produk, 0),
    komoditas: g.di.length,
  }));

// ---------------------------------------------------------------------------
// Kamus nama lokal — A3
// ---------------------------------------------------------------------------
// Petani tidak menyebut Thrips parvispinus; ia menyebut nama lokalnya. Tanpa kamus ini
// jalur 1 hanya bisa dipakai orang yang sudah tahu jawabannya.
//
// Kecil, jadi dibawa utuh sekali per sesi — pola yang sama seperti gejala-cari.json.
// Tiga hal ikut, dan ketiganya penting justru karena tidak enak dibaca:
//   - satu nama boleh menunjuk LEBIH DARI SATU OPT, dan `taksa` menyatakan apa yang
//     tidak dibedakannya. Memilih satu diam-diam akan mendahului uji pembanding yang
//     justru dibangun untuk memutuskannya.
//   - nama yang BELUM terpetakan tetap ikut, dengan alasannya. Hasil nol membuat orang
//     mencari di tempat lain yang tidak menjelaskan apa pun.
//   - `wilayah` selalu ikut, termasuk saat kosong, beserta sebab kosongnya. Kamus nama
//     lokal yang tidak tahu batas wilayahnya menyodorkan nama satu daerah kepada
//     seluruh negeri.
const namaLokalCari = namaLokal
  .map((x) => ({
    n: x.name,
    // Hanya OPT yang memang punya pintu di jalur 1; menautkan ke OPT tanpa teks gejala
    // menghasilkan tautan yang mendarat di layar kosong.
    ke: (x.refers_to ?? [])
      .filter((r) => gejala.some((g) => g.id === r.id && g.adaPintu))
      .map((r) => ({ i: r.id, l: r.label ?? null })),
    ...(x.ambiguous_note?.id ? { taksa: x.ambiguous_note.id } : {}),
    ...(x.unmapped_reason ? { belum: x.unmapped_reason } : {}),
    wilayah: (x.regions ?? []).map((r) => r.label ?? r.id),
    ...(x.region_unknown_reason ? { wilayahSebab: x.region_unknown_reason } : {}),
    bukti: x.evidence_tier,
  }))
  .sort((a, b) => a.n.localeCompare(b.n));

// Rujukan yang gugur karena OPT-nya tidak berpintu dinyatakan, bukan didiamkan: kalau
// suatu saat sebuah nama kehilangan seluruh rujukannya di sini, ia akan tampil sebagai
// "belum terpetakan" tanpa ada yang menulis alasannya.
const namaLokalGugur = namaLokal
  .flatMap((x) => (x.refers_to ?? []).filter((r) => !gejala.some((g) => g.id === r.id && g.adaPintu)))
  .length;

// ---------------------------------------------------------------------------
// Varian satu tanaman — pembedaan yang SENGAJA dipertahankan
// ---------------------------------------------------------------------------
// Dulu berkas ini berisi kandidat kurasi: nama komoditas yang terpecah karena dosis
// bocor ke dalamnya. Kurasi itu sudah dikerjakan — 207 entitas digantikan oleh
// satukan-komoditas-serumpun.mjs — dan yang tersisa justru kebalikannya: keluarga
// yang sengaja TIDAK disatukan karena kurungnya memuat pembedaan sungguhan.
//
//   Karet (TBM) 118 OPT · Karet (TM) 8 OPT · Karet 2 OPT
//
// Ketiganya karet, dan ketiganya bukan hal yang sama: TBM belum menghasilkan, TM
// sudah. Menyajikannya sebagai tiga komoditas asing satu sama lain sama kelirunya
// dengan menyatukannya — orang yang membuka "Karet" harus melihat kedua fasenya
// sebagai saudara, dengan namanya sendiri-sendiri.
const pokok = (n) => (n ?? '').replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
const rumpun = new Map();
for (const [kc, v] of perKomoditas) {
  const k = pokok(v.nama);
  if (!k) continue;
  (rumpun.get(k) ?? rumpun.set(k, []).get(k)).push({ id: kc, nama: v.nama, opt: v.opt.size });
}
const varian = {};
for (const [k, anggota] of [...rumpun.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  if (anggota.length < 2) continue;
  varian[k] = anggota.sort((a, b) => b.opt - a.opt || a.id.localeCompare(b.id));
}

// ---------------------------------------------------------------------------
// Direktori layanan — C7
// ---------------------------------------------------------------------------
// DUA PINTU, KARENA DATANYA MEMANG DUA BENTUK, dan menyatukannya akan menyamarkan
// perbedaan yang paling menentukan: bisa dituju atau tidak.
//
//   Bertitik   234 dari OSM (ODbL). Punya koordinat, tidak punya alamat maupun wilayah.
//              Menurunkan wilayahnya menuntut geokode balik massal — dan itu justru yang
//              sudah diputuskan TIDAK dilakukan. Jadi pintunya jarak dari posisi pembaca,
//              dihitung di peranti, tanpa satu pun koordinat meninggalkan peranti.
//   Berwilayah 2.248 dari dua sumber. Punya nama dan wilayah, tidak punya koordinat.
//              Pintunya penelusuran menurut wilayah.
//
// SATU ANGKA YANG PERLU DIKOREKSI. docs/15 menyebut "2.181 benih TTI beralamat".
// Terhitung dari berkasnya: NOL dari 2.181 memuat alamat jalan — seluruhnya berhenti di
// kabupaten/kota, tersebar di 113 wilayah, terpadat 173 rekaman pada satu kota. Nama
// tanpa jalan tidak bisa dituju; ia bukti bahwa penjual benih ada di sana, bukan
// petunjuk ke mana pergi. Yang benar-benar beralamat 67 rekaman Batang, dan seluruhnya
// menyebut kecamatan.
const kunciWilayah = (w) => (w ?? '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tanpa-wilayah';
// Lebih rinci daripada kabupaten diukur dari STRUKTURNYA, bukan dari pola nama jalan.
// Versi pertama mencari kata "Jl."/"Jalan" dan melewatkan "Jendsud 1" — menebak bentuk
// nama jalan Indonesia adalah cara yang pasti kalah. Yang dihitung: apakah alamatnya
// menyebut sesuatu SEBELUM kabupaten dan provinsi.
const lebihRinci = (a) => (a ?? '').split(',').filter((x) => x.trim()).length > 2;

// Wilayah diambil dari dua bagian terakhir alamat — kabupaten/kota dan provinsi — karena
// itulah satu-satunya bagian yang ada pada SELURUH rekaman kedua sumber.
// Dua sumber mengeja kabupaten dengan cara berbeda — TTI menulis "Kab. Batang", data
// terbuka Batang menulis "Kabupaten Batang" — dan tanpa penyeragaman satu tempat pecah
// jadi dua wilayah, dengan yang beralamat lengkap terpisah dari yang tidak. Pola yang
// sama seperti "Minyak Kita" lawan "Minyakita" di docs/16: normalkan saat penyerapan.
// Terhitung: 77 memakai "Kab.", 1 memakai "Kabupaten", dan tepat satu tempat bentrok.
const wilayahDari = (a) => (a ?? '').split(',').map((x) => x.trim()).filter(Boolean).slice(-2)
  .join(', ').replace(/^Kab\.\s*/i, 'Kabupaten ');

const perWilayah = new Map();
for (const r of tokoAlamat) {
  const w = wilayahDari(r.alamat);
  const k = kunciWilayah(w);
  if (!perWilayah.has(k)) perWilayah.set(k, { kunci: k, wilayah: w, isi: [] });
  perWilayah.get(k).isi.push({
    n: r.nama,
    a: r.alamat ?? null,
    j: lebihRinci(r.alamat) ? 1 : 0,
    s: r.sumber,
  });
}

const berkasToko = {};
const tokoWilayah = [...perWilayah.values()]
  .sort((a, b) => a.wilayah.localeCompare(b.wilayah))
  .map((w) => {
    berkasToko[w.kunci] = w.isi.sort((a, b) => a.n.localeCompare(b.n));
    return { k: w.kunci, w: w.wilayah, n: w.isi.length, rinci: w.isi.filter((x) => x.j).length };
  });

// Titik OSM dibawa utuh: 234 rekaman, dan yang mencari "terdekat" butuh semuanya
// sekaligus untuk bisa mengurutkannya.
const tokoTitikIndeks = tokoTitik
  .map((r) => ({ n: r.nama, y: Math.round(r.lat * 1e5) / 1e5, x: Math.round(r.lon * 1e5) / 1e5 }))
  .sort((a, b) => a.n.localeCompare(b.n));

// Lisensi diturunkan dari rekamannya, bukan diketik ulang — kalau sapuan berikutnya
// membawa sumber berlisensi lain, angkanya ikut berubah tanpa ada yang perlu ingat.
const lisensiToko = {};
for (const r of tokoAlamat) lisensiToko[r.lisensi ?? 'tidak dinyatakan'] = (lisensiToko[r.lisensi ?? 'tidak dinyatakan'] ?? 0) + 1;

// ---------------------------------------------------------------------------
// Alasan simpangan — E2/E3, dan yang membuat simpangan berguna alih-alih sekadar tercatat
// ---------------------------------------------------------------------------
// Aturan L8 sudah menolak realisasi yang berbeda dari rencana tanpa objek `deviation`:
// "simpangan tanpa alasan tidak bisa dipakai memperbaiki protokol". Tetapi alasannya
// tinggal di kosakata yang tidak pernah terbit, jadi permukaan tidak punya cara
// menawarkannya — dan alasan yang harus diketik bebas akan jadi sebelas ejaan untuk satu
// hal, yang menghancurkan justru gunanya.
//
// Medan `signals` ikut karena ia yang membedakan simpangan yang menuntut protokol direvisi
// dari simpangan yang tidak. `sinyal.mjs` sudah membacanya; sejak sekarang permukaan bisa
// menyebutnya juga saat orang memilih alasannya.
const alasanSimpangan = larik(bacaJson('deviation-reason.json'))
  .map((a) => ({
    id: a.id,
    key: a.key,
    nama: a.label?.id ?? a.key,
    kategori: a.category ?? null,
    sinyal: a.signals ?? null,
    definisi: a.definition?.id ?? null,
  }))
  .sort((a, b) => a.nama.localeCompare(b.nama));

// ---------------------------------------------------------------------------
// Protokol Lapis 2 — E1, dan satu-satunya yang ada
// ---------------------------------------------------------------------------
// `susun-rencana.mjs` sudah menyusun rencana musim dari protokol sejak lama, dan sampai
// blok ini keluarannya hanya bisa dilihat orang yang menjalankan Node di terminal. Barisnya
// di docs/15 berbunyi "penyusun selesai; permukaan belum" — dan permukaan tidak bisa
// dibangun di atas berkas yang tidak pernah terbit ke indeks.
//
// SATU PROTOKOL, DAN ITU IKUT DITERBITKAN. Cabai dataran rendah, tingkat bukti D, status
// draft. Menerbitkan satu bukan kekurangan yang perlu ditutupi: yang menutupinya akan
// membuat layar tampak punya pilihan yang tidak ada, dan cacah 1 justru angka yang paling
// perlu dibaca sebelum orang menaruh harapan pada jalur ini.
const kunciOperasi = new Map(larik(bacaJson('operation-type.json')).map((o) => [o.id, o.key]));

const protokolBerkas = readdirSync(VOCAB).filter((f) => f.startsWith('protocol-') && f.endsWith('.json'));
const protokol = protokolBerkas.map((f) => bacaJson(f)).filter((p) => p?.id);

// Langkah dibawa UTUH, termasuk timing-nya. Penyaji tidak boleh menyimpulkan sendiri
// tanggal dari fase — itu keputusan yang sudah diambil susun-rencana.mjs dan alasannya
// panjang: entitas Stage tidak memuat hari, durasi, maupun akumulasi suhu, jadi menebak
// "BBCH 51 kira-kira hari ke-45" berarti mengarang fenologi. Bentuk timing-nya karena itu
// ikut apa adanya, dan yang membedakan dapat-ditanggalkan dari tidak tinggal di sana.
const berkasProtokol = {};
const protokolIndeks = protokol.map((p) => {
  const kunci = p.key;
  berkasProtokol[kunci] = {
    id: p.id,
    key: kunci,
    nama: p.label?.id ?? kunci,
    definisi: p.definition?.id ?? null,
    tingkat: p.evidence_tier ?? null,
    alasanTingkat: p.evidence_note?.id ?? p.evidence_note ?? null,
    status: p.lifecycle?.status ?? null,
    versi: p.lifecycle?.version ?? null,
    berlaku: p.applicability ?? null,
    skala: p.stage_scale ?? null,
    langkah: (p.steps ?? []).map((l) => ({
      kunci: l.key,
      nama: l.label?.id ?? l.key,
      // Kunci jenis operasinya ikut, bukan cuma label. Layar rencana memakainya untuk
      // MENGUSULKAN kategori biaya di buku kas — mencocokkan lewat teks label akan pecah
      // pada label pertama yang diubah editornya, sedangkan kunci memang dijanjikan tetap.
      tindakan: l.operation_type
        ? { ...l.operation_type, k: kunciOperasi.get(l.operation_type.id) ?? null }
        : null,
      waktu: l.timing ?? null,
      pakai: l.applications ?? null,
      catatan: l.notes?.id ?? null,
    })),
  };
  const w = (p.steps ?? []).map((l) => l.timing?.kind);
  return {
    key: kunci,
    nama: p.label?.id ?? kunci,
    komoditas: p.applicability?.commodity?.label ?? null,
    tingkat: p.evidence_tier ?? null,
    status: p.lifecycle?.status ?? null,
    langkah: w.length,
    // Cacah yang paling menentukan cara layar boleh menyajikannya: berapa langkah yang
    // benar-benar bisa jadi tanggal. Kalau ia lebih kecil daripada jumlah langkah,
    // menyebut hasilnya "kalender" sudah salah.
    bertanggal: w.filter((k) => k === 'relative').length,
  };
}).sort((a, b) => a.nama.localeCompare(b.nama));

// ---------------------------------------------------------------------------
// Balai penyuluhan & laboratorium — C7, dan ujung yang dicari G3
// ---------------------------------------------------------------------------
// Keduanya sudah jadi entitas kosakata, dan sampai blok ini tidak satu pun terbaca
// permukaan. G3 menahan layarnya justru karena itu: laporan gejala menuntut ujung yang
// bisa disebutkan, dan ujung yang ada di kosakata tetapi tidak di indeks sama tidak
// bisa disebutnya dengan ujung yang tidak ada.
//
// DUA POLA YANG BERBEDA, KARENA PERTANYAANNYA BERBEDA.
//
// Balai dicari menurut TEMPAT: yang bertanya sudah tahu kecamatannya sendiri, dan yang
// ia perlukan nama balai yang membinanya. Diember per kabupaten seperti toko — 504 ember,
// terbesar 2,8 KB.
//
// Laboratorium dicari menurut KEMAMPUAN lebih dulu, baru tempat: "siapa yang bisa
// mengukur residu pestisida" menyaring 889 jadi 17, dan tanpa penyaring itu daftar
// provinsi cuma memindahkan pekerjaan memilah ke pembacanya. Kemampuannya karena itu
// ikut di kepala, bukan cuma di pecahan.
const bppSemua = bacaNdjson('bpp/bpp.ndjson');
const labSemua = bacaNdjson('lab/lab.ndjson');

const perBpp = new Map();
for (const b of bppSemua) {
  const r = b.region ?? {};
  const w = [r.regency, r.province].filter(Boolean).join(', ') || '(tanpa wilayah)';
  const k = kunciWilayah(w);
  if (!perBpp.has(k)) perBpp.set(k, { kunci: k, wilayah: w, isi: [] });
  perBpp.get(k).isi.push({
    n: b.label?.id ?? b.key,
    // Kecamatan binaan ikut karena ia satu-satunya cara menemukan balai yang benar:
    // rekaman ini TIDAK punya alamat, dan itu batas sumbernya — laporan tamu SIMLUHTAN
    // hanya memberi nama dan kecamatan. Menggeokodenya massal ditolak dengan sadar,
    // karena bertabrakan dengan rancangan "klaim" yang sama seperti pada toko tani.
    k: b.serves ?? [],
    p: b.counts?.extension_workers?.total ?? null,
    g: b.counts?.farmer_groups ?? null,
  });
}

const berkasBpp = {};
const bppWilayah = [...perBpp.values()]
  .sort((a, b) => a.wilayah.localeCompare(b.wilayah))
  .map((w) => {
    berkasBpp[w.kunci] = w.isi.sort((a, b) => a.n.localeCompare(b.n));
    return {
      k: w.kunci,
      w: w.wilayah,
      n: w.isi.length,
      kec: w.isi.reduce((a, x) => a + x.k.length, 0),
    };
  });

// Kemampuan dipadatkan jadi huruf. Jawa Barat memuat 175 laboratorium, dan larik kata
// ("water", "plant_tissue") membuat pecahannya 47,6 KB — di bawah anggaran 48 KB, tetapi
// satu laboratorium berikutnya memecahkannya. Yang dipadatkan penulisannya, bukan isinya.
const KODE_KEMAMPUAN = {
  soil: 't', fertilizer: 'p', water: 'a', food: 'm', plant_tissue: 'j', pesticide_residue: 'r',
};
const ARTI_KEMAMPUAN = {
  t: 'tanah', p: 'pupuk', a: 'air', m: 'pangan', j: 'jaringan tanaman', r: 'residu pestisida',
};

const perLab = new Map();
const cacahKemampuan = {};
for (const x of labSemua) {
  const kode = Object.entries(x.capabilities ?? {})
    .filter(([, v]) => v).map(([k]) => KODE_KEMAMPUAN[k]).filter(Boolean).sort().join('');
  for (const c of kode) cacahKemampuan[c] = (cacahKemampuan[c] ?? 0) + 1;
  const prov = x.address?.province ?? '(tanpa provinsi)';
  const k = kunciWilayah(prov);
  if (!perLab.has(k)) perLab.set(k, { kunci: k, wilayah: prov, isi: [] });
  perLab.get(k).isi.push({
    n: x.label?.id ?? x.key,
    a: x.address?.text ?? null,
    no: x.accreditation?.number ?? null,
    // Masa berlaku ikut, dan bukan hiasan: akreditasi yang sudah lewat masa berlakunya
    // adalah laboratorium yang hasil ujinya tidak lagi diakui, dan itu persis yang
    // dicari orang yang datang ke sini.
    sd: x.accreditation?.valid_until ?? null,
    k: kode,
    t: x.contact?.phone ?? null,
    e: x.contact?.email ?? null,
  });
}

const berkasLab = {};
const labWilayah = [...perLab.values()]
  .sort((a, b) => a.wilayah.localeCompare(b.wilayah))
  .map((w) => {
    berkasLab[w.kunci] = w.isi.sort((a, b) => a.n.localeCompare(b.n));
    // Cacah PER KEMAMPUAN, bukan cuma total dan residu. Tanpa ini penyaring "siapa yang
    // bisa menguji tanah" memaksa orang membuka provinsi satu per satu untuk menemukan
    // nol — memindahkan pekerjaan memilah ke pembacanya, persis yang dihindari dengan
    // menaruh kemampuan di kepala sejak awal.
    const per = {};
    for (const kode of Object.keys(ARTI_KEMAMPUAN)) {
      const c = w.isi.filter((x) => x.k.includes(kode)).length;
      if (c) per[kode] = c;
    }
    return { k: w.kunci, w: w.wilayah, n: w.isi.length, per };
  });

const labKepala = { arti: ARTI_KEMAMPUAN, cacah: cacahKemampuan, wilayah: labWilayah };

// ---------------------------------------------------------------------------
// B1 pada docs/15: tiap layar menyebut TINGKAT BUKTI, TANGGAL, SUMBER, dan APA YANG
// TIDAK DIKETAHUINYA. Tiga di antaranya sudah ada di berkas koleksi dan siklus hidup
// kosakata; yang belum ada cuma jalan supaya sisi penyaji bisa membacanya tanpa
// mengunduh seluruh kosakata. Blok ini jalan itu.
//
// Satu aturan diwarisi dari preparation.schema.json dan diberlakukan di sini:
// TINGKAT BUKTI TANPA ALASAN ADALAH KLAIM TANPA DASAR. Tiap entri di bawah wajib
// membawa `alasan`, termasuk — terutama — yang tingkatnya belum ditetapkan. Yang
// menolak menetapkan tingkat harus mengatakan kenapa, bukan mengosongkan medannya.

const koleksi = (p) => bacaJson(p).collection;

// Tarikan dan tinjauan datang dari berkas koleksi, bukan diketik ulang di sini:
// mengetiknya dua kali berarti salah satunya akan basi diam-diam.
function dariKoleksi(berkas, { label, tingkat, alasan }) {
  const k = koleksi(berkas);
  const s = k.provenance?.sources?.[0] ?? {};
  return {
    label,
    penerbit: s.publisher ?? null,
    url: s.url ?? null,
    // `retrieved` baru ada sejak medan itu ditambahkan ke SourceRef. Sebelumnya
    // tanggalnya cuma prosa di dalam `locator` dan tidak terbaca mesin — persis yang
    // menghalangi layar menyebutkannya.
    tarikan: s.retrieved ?? null,
    tinjau: k.lifecycle?.review_due ?? null,
    status: k.lifecycle?.status ?? null,
    lisensi: k.provenance?.license ?? null,
    cacah: k.count ?? null,
    tingkat,
    alasan,
  };
}

// ---------------------------------------------------------------------------
// batas — empat medan yang wajib disebut tiap layar
// ---------------------------------------------------------------------------
// Kosakata terkurasi tidak punya berkas koleksi; tanggalnya diambil dari siklus hidup
// entitasnya, yang paling akhir. Kalau satu entri diperbarui, tanggal layar ikut maju.
const tanggalTerbaru = (daftar) =>
  daftar
    .map((x) => x.lifecycle?.updated_at ?? x.lifecycle?.created_at)
    .filter(Boolean)
    .sort()
    .at(-1)
    ?.slice(0, 10) ?? null;

const statusKumpulan = (daftar) => {
  const s = [...new Set(daftar.map((x) => x.lifecycle?.status).filter(Boolean))];
  return s.length === 1 ? s[0] : s.sort().join(' + ');
};

const sebaranTingkat = {};
for (const r of sediaan) sebaranTingkat[r.evidence_tier] = (sebaranTingkat[r.evidence_tier] ?? 0) + 1;

const batas = {
  // Disalin dari EvidenceTier di common.schema.json supaya layar tidak mengarang
  // katanya sendiri, dan supaya "B" tidak pernah tampil sebagai huruf telanjang.
  arti: {
    A: 'uji multi-lokasi/multi-musim',
    B: 'standar institusi resmi',
    C: 'konsensus praktisi & penyuluh',
    D: 'pengalaman tunggal belum terverifikasi',
  },
  sumber: {
    pestisida: dariKoleksi('product/pestisida.meta.json', {
      label: 'Registri pestisida terdaftar',
      tingkat: 'B',
      alasan:
        'Registri resmi kementerian, disalin apa adanya. Bukan A: yang dicatat izin edar, bukan hasil uji multi-lokasi — registri tidak menguji apa pun, ia mendaftarkan.',
    }),
    pupuk: dariKoleksi('product/pupuk.meta.json', {
      label: 'Registri pupuk terdaftar',
      tingkat: 'B',
      alasan:
        'Registri resmi kementerian, disalin apa adanya. Bukan A dengan alasan yang sama seperti pestisida: pendaftaran bukan pengujian.',
    }),
    varietas: dariKoleksi('variety/varietas.meta.json', {
      label: 'Registri perizinan varietas',
      tingkat: 'B',
      alasan:
        'Registri resmi kementerian. Tingkatnya berlaku untuk keberadaan suratnya, bukan untuk sifat varietasnya — sifat agronomi nol dari 11.227, jadi tidak ada klaim agronomi yang bisa dinaungi tingkat ini.',
    }),
    kurasiOpt: {
      label: 'Kurasi OPT & gejala cabai',
      penerbit: 'Open Protocols',
      url: null,
      tarikan: tanggalTerbaru(optTerkurasi),
      tinjau: null,
      status: statusKumpulan(optTerkurasi),
      lisensi: 'CC-BY-SA-4.0',
      cacah: optTerkurasi.length,
      tingkat: null,
      alasan:
        'Belum ditetapkan, dan itu disengaja. Teksnya disusun dari agronomi mapan — bukan dari registri — dan belum ditinjau penyuluh atau BPTP; daftar tinjauannya sudah siap di docs/14-tinjauan-gejala.md. Menandainya C berarti mengklaim konsensus penyuluh yang belum pernah diminta kepada seorang penyuluh pun.',
    },
    harga: {
      label: 'Harga eceran nasional tertimbang — SP2KP',
      penerbit: 'Kementerian Perdagangan RI',
      url: 'https://sp2kp.kemendag.go.id/',
      tarikan: hargaSeri.length ? '2026-08-23' : null,
      tinjau: '2026-09-23',
      status: 'draft',
      lisensi: 'Data Terbuka (Portal Satu Data Kemendag) — atribusi wajib',
      cacah: hargaSeri.filter((h) => h.series?.length).length,
      tingkat: 'B',
      alasan:
        'Survei harga resmi kementerian, disalin apa adanya. Bukan A: yang dicatat hasil pencacahan pasar, bukan uji multi-lokasi. Tingkat ini berlaku untuk ANGKANYA saja — kalimat komentar di halaman yang sama bertingkat D dan menyebutkannya sendiri, karena tafsir tidak mewarisi tingkat sumbernya.',
      atribusi:
        'Sumber: Portal Satu Data Kementerian Perdagangan (satudata.kemendag.go.id) – 2026, diolah kembali oleh Open Protocols.',
    },
    principal: {
      label: 'Badan pemegang pendaftaran',
      penerbit: 'Kementerian Pertanian RI',
      url: 'https://ap-simpel.pertanian.go.id/',
      tarikan: '2026-08-19',
      tinjau: '2026-11-19',
      status: 'draft',
      lisensi: 'CC-BY-SA-4.0',
      cacah: principalRinci.length,
      tingkat: 'B',
      alasan:
        'Diturunkan dari nama pemegang pendaftaran di kedua registri Kementan, diseragamkan lewat berkas alias yang mencatat tiap penggabungan beserta alasannya. Tingkat ini berlaku untuk CACAH PENDAFTARAN dan ejaan namanya. Blok pengaya pada 151 badan — grup induk, negara asal, merek payung, situs — datang dari riset web dan bertingkat D; layar menampilkannya terpisah, dan tidak pernah dicampur ke angka registri.',
    },
    namaLokal: {
      label: 'Kamus nama lokal',
      penerbit: 'Open Protocols',
      url: null,
      tarikan: tanggalTerbaru(namaLokal),
      tinjau: koleksi('nama-lokal.json').lifecycle?.review_due ?? null,
      status: statusKumpulan(namaLokal),
      lisensi: 'CC-BY-SA-4.0',
      cacah: namaLokal.length,
      tingkat: 'D',
      alasan:
        'Pengalaman tunggal belum terverifikasi, dan itu memang bunyinya: keenam nama datang dari satu jawaban lapangan pada 22 Agustus 2026, belum diperiksa penyuluh atau BPTP. Bukan C, karena C berarti konsensus praktisi — satu penjawab bukan konsensus. Tingkat ini justru yang membuat kamusnya boleh tampil: nama yang salah petakan tertangkap blok "pastikan dulu" di jalur 1, asalkan layar tidak berpura-pura yakin.',
    },
    tokoTitik: {
      label: 'Toko tani berkoordinat (OpenStreetMap)',
      penerbit: 'Kontributor OpenStreetMap',
      url: 'https://www.openstreetmap.org/copyright',
      tarikan: '2026-08-22',
      tinjau: null,
      status: 'draft',
      lisensi: 'ODbL-1.0',
      cacah: tokoTitikIndeks.length,
      tingkat: 'C',
      alasan:
        'Konsensus praktisi: OSM dipetakan sukarelawan yang datang ke tempatnya, bukan lembaga yang mendaftarkannya. Bukan B — tidak ada institusi yang menjaminnya, dan tidak ada yang memeriksa apakah tokonya masih buka. Bukan D — tiap titik bisa ditelusuri ke penyuntingnya dan diperbaiki siapa pun.',
    },
    tokoWilayah: {
      label: 'Penjual benih beralamat',
      penerbit: 'Kementerian Pertanian RI · Pemkab Batang',
      url: null,
      tarikan: '2026-08-22',
      tinjau: null,
      status: 'draft',
      lisensi: Object.keys(lisensiToko).sort().join(' · '),
      cacah: tokoAlamat.length,
      tingkat: 'D',
      alasan:
        'Yang 2.181 dari arsip Wayback halaman TTI Kementan yang sudah tidak ada lagi — tidak ada tanggal pada rekamannya, jadi tidak ada cara mengetahui seberapa basi, dan toko yang sudah tutup tidak bisa dibedakan dari yang masih buka. Yang 67 dari data terbuka Pemkab Batang berlisensi CC-BY, jauh lebih kuat, tetapi terlalu sedikit untuk menaikkan tingkat keseluruhannya.',
    },
    protokol: {
      label: 'Protokol budidaya Lapis 2',
      penerbit: 'Open Protocols',
      url: null,
      tarikan: '2026-08-20',
      tinjau: null,
      status: protokol[0]?.lifecycle?.status ?? 'draft',
      lisensi: 'CC-BY-SA-4.0',
      cacah: protokol.length,
      tingkat: protokol[0]?.evidence_tier ?? null,
      alasan:
        'Satu protokol, tingkat bukti D, status draft — dan ketiganya angka yang perlu dibaca sebelum menaruh harapan pada jalur ini. Langkahnya disalin dari contoh langkah rencana yang menunjukkan BENTUK yang benar, bukan dari uji lapangan maupun standar institusi, dan belum ditinjau agronom bernama. Menaikkannya ke C atau B menuntut orang yang mau menempelkan namanya — pertanyaan kelima docs/02 yang alurnya baru dibuka lewat G1.',
    },
    bpp: {
      label: 'Balai penyuluhan pertanian',
      penerbit: 'Badan Penyuluhan dan Pengembangan SDM Pertanian, Kementerian Pertanian RI',
      url: 'https://simluh.pertanian.go.id/guestreport',
      tarikan: '2026-08-23',
      tinjau: '2026-11-23',
      status: 'draft',
      lisensi: 'CC-BY-SA-4.0',
      cacah: bppSemua.length,
      tingkat: 'B',
      alasan:
        'Laporan tamu SIMLUHTAN, basis data resmi penyuluhan Kementan, disinkronkan harian — standar institusi, jadi tingkat B. Tiga hal yang membatasinya dan tidak boleh dibaca sebagai kelengkapan: rekamannya TIDAK punya alamat maupun koordinat, karena sumbernya memang hanya memberi nama balai dan kecamatan binaannya; provinsinya 34, bukan 38, karena pemekaran Papua belum masuk basis data sumbernya; dan pembaruan SIMLUHTAN sedang ditutup untuk pemeliharaan sampai 30 Agustus 2026, jadi angka ini potret sebelum itu.',
    },
    lab: {
      label: 'Laboratorium penguji terakreditasi',
      penerbit: 'Komite Akreditasi Nasional (BSN)',
      url: 'https://kan.or.id/index.php/documents/terakreditasi/77-laboratorium',
      tarikan: '2026-08-23',
      tinjau: '2026-11-23',
      status: 'draft',
      lisensi: 'CC-BY-SA-4.0',
      cacah: labSemua.length,
      tingkat: 'B',
      alasan:
        'Papan lembaga terakreditasi KAN, otoritas akreditasi nasional — standar institusi, jadi tingkat B. Yang masuk 889 dari 1.671 laboratorium penguji aktif: hanya yang ruang lingkupnya menyentuh tanah, pupuk, air, pangan, jaringan tanaman, atau residu pestisida. Masa berlaku akreditasi ikut tiap rekaman karena akreditasi yang lewat masa berlakunya berarti hasil ujinya tidak lagi diakui — dan itu tidak terlihat dari nama laboratoriumnya.',
    },
    sediaan: {
      label: 'Resep sediaan buatan sendiri',
      penerbit: 'Open Protocols',
      url: null,
      tarikan: tanggalTerbaru(sediaan),
      tinjau: null,
      status: statusKumpulan(sediaan),
      lisensi: 'CC-BY-SA-4.0',
      cacah: sediaan.length,
      tingkat: null,
      sebaran: sebaranTingkat,
      alasan:
        'Ditetapkan per resep, bukan per layar — tiap resep membawa evidence_tier-nya sendiri, dan layar menampilkannya di tiap kartu. Satu tingkat untuk seluruh halaman akan menaikkan yang D atau menurunkan yang B.',
    },
  },
};

// ---------------------------------------------------------------------------
// meta.json — termasuk apa yang TIDAK ada, supaya penyaji tidak menjanjikannya
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Keadaan tinjauan bernama — G1
// ---------------------------------------------------------------------------
// Angkanya nol hari ini, dan justru itu sebabnya ia dihitung dan dikirim ke layar. Nol
// yang tidak pernah ditampilkan terbaca sebagai nol yang tidak pernah diukur — dan
// pembaca yang tidak tahu bahwa belum seorang pun memeriksa isinya akan mengira sudah
// ada yang memeriksanya. Begitu angkanya berhenti nol, baris yang sama menyebutkan
// siapa.
const tinjauan = (() => {
  let rekaman = 0;
  let berpeninjau = 0;
  const orang = new Map();
  for (const f of readdirSync(VOCAB)) {
    if (!f.endsWith('.json') || f.endsWith('.meta.json')) continue;
    let d;
    try { d = bacaJson(f); } catch { continue; }
    const daftar = Array.isArray(d?.items) ? d.items : (d && d.id ? [d] : []);
    for (const r of daftar) {
      rekaman++;
      const peninjau = (r.provenance?.contributors ?? []).filter((c) => c.role === 'reviewer');
      if (!peninjau.length) continue;
      berpeninjau++;
      for (const c of peninjau) orang.set(c.name, (orang.get(c.name) ?? 0) + 1);
    }
  }
  return { rekaman, berpeninjau, peninjau: [...orang.keys()].sort() };
})();

const meta = {
  versi: 1,
  sumber: 'spec/vocab',
  batas,
  tinjauan,
  jumlah: {
    pestisida: pestisida.length,
    pupuk: pupuk.length,
    varietas: varietas.length,
    zatHidup: zat.filter((s) => s.lifecycle?.status !== 'superseded').length,
    kelompokSetara: Object.keys(setara).length,
    produkSetara: Object.values(setara).reduce((a, g) => a + g.length, 0),
    komoditasBerOpt: perKomoditas.size,
    resepSediaan: berkasSediaan.resep.length,
    komoditasBervarian: Object.keys(varian).length,
    optTerkurasi: gejala.length,
    optBerpintu: gejala.filter((g) => g.adaPintu).length,
    optRegistriBerproduk: optRegistriIndeks.length,

    namaLokal: namaLokalCari.length,
    namaLokalTerpetakan: namaLokalCari.filter((x) => x.ke.length).length,
    namaLokalTaksa: namaLokalCari.filter((x) => x.ke.length > 1).length,
    bahanAktifTerpakai: bahanRinci.length,
    kartuBahanKadar: bahanRinci.reduce((a, b) => a + b.kadar.length, 0),
    dosisPerHektare: bentukDosis.perHektare,
    dosisPerLiter: bentukDosis.perLiter,
    dosisKosong: bentukDosis.kosong,
    dosisLain: bentukDosis.lain,
    tokoBertitik: tokoTitikIndeks.length,
    tokoBerwilayah: tokoAlamat.length,
    tokoLebihRinci: tokoAlamat.filter((r) => lebihRinci(r.alamat)).length,
    tokoWilayah: tokoWilayah.length,
    protokol: protokol.length,
    alasanSimpangan: alasanSimpangan.length,
    protokolBertanggal: protokolIndeks.reduce((a, p) => a + p.bertanggal, 0),
    protokolLangkah: protokolIndeks.reduce((a, p) => a + p.langkah, 0),
    bpp: bppSemua.length,
    bppWilayah: bppWilayah.length,
    // Kecamatan yang benar-benar tersebut di `serves`, dan itu BUKAN angka yang sama
    // dengan "kecamatan yang menyebut nama BPP" di penyuluh_data/LAPIS.md. Yang di sana
    // 6.883 dihitung dari baris kecamatan; yang di sini dari balai. Selisihnya balai yang
    // kecamatannya kosong di sumbernya — dihitung terpisah supaya kedua angka tidak
    // tertukar, karena keduanya benar untuk pertanyaan yang berbeda.
    bppKecamatanTerbina: bppWilayah.reduce((a, w) => a + w.kec, 0),
    bppTanpaKecamatan: bppSemua.filter((b) => !(b.serves ?? []).length).length,
    lab: labSemua.length,
    labWilayah: labWilayah.length,
    labResidu: cacahKemampuan.r ?? 0,
    principal: principalRinci.length,
    principalPupuk: principalRinci.filter((b) => b.punya.fertilizer > 0).length,
    principalPestisida: principalRinci.filter((b) => b.punya.pesticide > 0).length,
    principalBenih: principalRinci.filter((b) => b.punya.seed > 0).length,
    principalBerpengaya: principalRinci.filter((b) => b.pengaya).length,
    produkBerprincipal: semuaProduk.filter((r) => r.pcp).length,
    produkBergambar: semuaProduk.filter((r) => r.gambar?.length).length,
    gambarKemasan: semuaProduk.reduce((a, r) => a + (r.gambar?.length ?? 0), 0),
    hargaVarian: hargaSeri.length,
    hargaBerangka: hargaSeri.filter((h) => h.series?.length).length,
    hargaTitik: hargaSeri.reduce((a, h) => a + (h.series?.length ?? 0), 0),
    hargaFarmgate: hargaSeri.filter((h) => h.price_level === 'farmgate').length,
    hargaTani: hargaSeri.filter((h) => h.sector !== 'luar').length,
    hargaTaniBerangka: hargaSeri.filter((h) => h.sector !== 'luar' && h.series?.length).length,
    hargaLuar: hargaSeri.filter((h) => h.sector === 'luar').length,
    hargaKomoditasTersambung: new Set(hargaSeri.filter((h) => h.commodity).map((h) => h.commodity.id)).size,
    sidikKandungan: kandungan.size,
    produkBerkandungan: [...kandungan.values()].reduce((a, d) => a + d.length, 0),
  },
  // ATURAN: daftar kunci hanya boleh ada di sini kalau ADA YANG MEMBACANYA. meta.json
  // satu-satunya berkas yang diambil di TIAP muat halaman, termasuk halaman yang tidak
  // menyentuh pecahan itu sama sekali, jadi tiap kunci yang tidak dibaca dibayar semua
  // orang di tiap kunjungan.
  //
  // Aturan itu sudah ditulis di sini sejak principal — "daftar 3.136 kunci membengkakkan
  // meta.json dari 19 KB jadi 114 KB" — lalu dilanggar lima kali berturut-turut oleh
  // penambahan yang masing-masing tampak kecil: opt, kandungan, toko, optNama, dan
  // akhirnya bpp. Terhitung 23 Agustus 2026 saat menyambungkan BPP: meta.json 60,1 KB,
  // dan 30 KB di antaranya daftar yang TIDAK DIBACA SATU BARIS KODE PUN. Penyaji tidak
  // pernah membutuhkannya: jalurnya `<jenis>/<kunci>`, dan kuncinya sudah dibawa berkas
  // kepala yang memang diambil halaman itu — toko-wilayah.json, bpp-wilayah.json,
  // lab-kemampuan.json.
  //
  // Yang tersisa tiga, dan ketiganya diperiksa dipakai: `cari` dan `cariDalam` dibaca
  // pustaka.js saat mendalamkan ember pencarian, `sediaan` dibaca sw.js untuk menyimpan
  // keduabelas resep luring — 36 KB, dan tanpanya jalur 5 dan 6 terbuka tetapi kosong
  // justru saat paling mungkin dibuka jauh dari sinyal.
  pecahan: {
    cari: Object.keys(cari).sort(),
    cariDalam,
    sediaan: Object.keys(berkasResep).sort(),

    setara: pecahanSetara.length,
    bahan: pecahanBahan.length,
    produk: pecahanProduk.length,
    varietas: pecahanVarietas.length,
    opt: perKomoditas.size,
    kandungan: Object.keys(berkasKandungan).length,
    toko: tokoWilayah.length,
    bpp: bppWilayah.length,
    lab: labWilayah.length,
    protokol: protokolIndeks.length,
    optNama: Object.keys(berkasOptNama).length,
    principal: Object.keys(berkasPrincipal).length,
    harga: Object.keys(berkasHarga).length,
  },
  terbuang: {
    ...terbuang,
    keterangan:
      'Penggunaan berlabel yang tautan OPT atau komoditasnya kosong di registri. Tidak bisa dijangkau dari jalur 1, tetap terbaca dari rincian produk.',
  },
  larangan: {
    aturan:
      'Hanya regulatory_status berjurisdiksi ID berstatus prohibited. Berlingkup "semua bidang penggunaan pestisida" berlaku pada komoditas apa pun; yang menyebut commodities hanya pada komoditas itu; sisanya konteks pakai, bukan komoditas.',
    zatDilarang: laranganZat.size,
    menyeluruh: zat.filter((s) =>
      (s.hazard?.regulatory_status ?? []).some(
        (r) => r.jurisdiction === 'ID' && r.status === 'prohibited' && (r.scope ?? []).includes(MENYELURUH),
      ),
    ).length,
    temuan:
      'Tidak satu pun produk terdaftar memuat zat yang dilarang menyeluruh, dan tidak satu pun terdaftar untuk komoditas yang melarang isinya. Seluruh zat dilarang yang masih beredar dilarang untuk padi atau rumah tangga, bukan untuk komoditas tempat ia terdaftar. Karena itu `dilarang` pada daftar OPT sekarang selalu salah — yang berbunyi adalah `laranganLain`.',
  },
  tidakAda: {
    gejalaOpt:
      'Nol dari 1.360 OPT registri membawa deskripsi gejala. Yang ada hanya 10 OPT cabai terkurasi di pest.json, 5 di antaranya bertekst gejala (lihat gejala.json). Di luar sepuluh itu jalur 1 tidak punya pintu masuk.',
    phi: 'Nol dari 23.058 penggunaan berlabel memuat tenggang panen — registri tidak mencatatnya sama sekali. Satu-satunya penyebutan di sumber mentah soal tenggang penebaran tambak, bukan tenggang panen. Penyaji tidak boleh menjanjikan tanggal aman panen.',
    harga: 'Registri tidak memuat harga sama sekali. Jalur 3 mengandalkan satu masukan pengguna.',
    bahanHara:
      'Indeks bahan hanya memuat bahan aktif pestisida. Unsur hara pupuk tidak diindeks sebagai bahan yang bisa dicari — Nitrogen sendiri ada di 2.582 pupuk, dan daftar sepanjang itu tidak menjawab apa pun. Pertanyaan haranya dijawab jalur 3.',
    beratJenis: 'Tidak ada, sehingga pupuk cair tidak sebanding dengan yang padat.',
    haraSediaan:
      'Kadar hara sediaan buatan sendiri tidak diketahui sebelum batchnya diuji: L18 menolak menghitung hara dari batch yang belum diuji, dan kadar kompos berbeda tiap tumpukan. Karena itu resep jalur 5 muncul di jalur 3 tanpa rupiah per kg hara — tanpa angka, bukan dengan angka taksiran.',
    namaDagang: 'Registri menyimpan nama produk terdaftar; nama di kemasan bisa berbeda dan belum terpetakan.',
    hargaPetani:
      'Seluruh harga di indeks ini ECERAN NASIONAL. Berapa yang diterima petani tidak ada, dan jaraknya bukan celah cakupan yang bisa dirapatkan dengan menambah sampel: "harga produsen" yang dicatat negara pun sebenarnya harga beli pengumpul, karena respondennya memang pengumpul — di Kabupaten Karawang satu orang. Lihat docs/16 bagian 4.',
    hargaWilayah:
      'Harga per provinsi dan per pasar tidak diindeks. Endpoint yang memuatnya membawa NIK, NIP, nomor telepon, dan alamat pencacah pada tiap rekaman; penggantinya yang bersih berukuran 5.099.865 baris pada 10 baris per halaman, dan mengiterasinya melanggar ketentuan portal. Yang diindeks agregat nasionalnya, satu permintaan.',
    hargaKomoditasTani:
      'Dari 88 varian yang diterbitkan SP2KP hanya 43 berangka, dan hanya 23 komoditas di kosakata ini yang tersentuh. Keempat harga pupuk dan dua dari tiga harga benih diterbitkan TANPA satu pun angka. Komoditas tani lain — termasuk seluruh perkebunan — tidak punya harga di sini sama sekali.',
    hargaPupuk:
      'SP2KP mendaftarkan Pupuk Urea, NPK 15-15-15, SP-36, dan ZA tetapi tidak mengisi harganya: 13-15 tanggal mingguan pada paruh pertama 2024, seluruhnya kosong pada keempat ukuran tertimbang. Jalur 3 karena itu tetap mengandalkan masukan pengguna untuk rupiah per kg hara.',
    // Angkanya DIHITUNG, tidak ditulis tangan. Kalimat ini pernah memuat 517, lalu 519, 530,
    // dan 591 — empat kali salah dalam tiga hari, karena panennya tumbuh sedangkan prosanya
    // tidak. Cakupan gambar adalah satu-satunya angka di blok ini yang bergerak tiap panen.
    gambarKemasan:
      `Gambar kemasan ada pada ${semuaProduk.filter((r) => r.gambar?.length).length.toLocaleString('id-ID')} dari ${semuaProduk.length.toLocaleString('id-ID')} produk — ${(semuaProduk.filter((r) => r.gambar?.length).length / semuaProduk.length * 100).toFixed(1).replace('.', ',')}%. Ketiadaannya BUKAN tanda produk tidak terdaftar; ia tanda situs principal-nya belum dipanen, atau merek itu tidak berkemasan eceran. Manifesnya sendiri menyatakan redistributable: false dengan izin belum diminta; penerbitannya keputusan pemilik repositori, tercatat di gambar_produk/terbitkan.mjs.`,
    sertifikasiLot: 'Jalur 4 hanya bisa memastikan varietasnya, bukan bungkus atau bibit yang di tangan.',
    dosisKosong:
      'Sebagian penggunaan berlabel tidak memuat dosis sama sekali di registri — bukan dosisnya nol, melainkan medannya kosong. Layar kalibrasi tidak bisa mengambilkan angkanya untuk penggunaan itu, dan dosis harus dibaca sendiri dari kemasannya.',
    namaLokalTakTerpetakan:
      'Sebagian nama lokal sudah terdengar tetapi belum bisa ditautkan ke OPT mana pun — entah calonnya bertabrakan, entah rujukannya memang di luar sepuluh OPT terkurasi. Namanya tetap tercatat supaya pencarian tidak menjawab nol, tetapi layar tidak bisa membukakan apa pun untuknya.',
    kandunganTakTerdaftar:
      'Kandungan yang tidak cocok dengan satu pun pendaftaran tidak membuktikan apa pun sendirian. Tiga hal menjelaskannya sekaligus: angkanya salah baca, produknya terdaftar dengan kandungan sedikit berbeda, atau memang tidak terdaftar. Registri juga tidak lengkap — 28,7% pupuk tidak berkomposisi sama sekali.',
    tokoTakBisaDituju:
      'Hanya 92 dari 2.248 rekaman berwilayah — 4,1% — menyebut sesuatu yang lebih rinci daripada kabupaten atau kota. Sisanya berhenti di nama kabupaten, tersebar di 93 wilayah. Nama tanpa alamat tidak bisa dituju: ia bukti bahwa penjual benih ada di sana, bukan petunjuk ke mana pergi.',
    tokoTanpaKontak:
      'Tidak satu pun rekaman memuat nomor telepon, surel, jam buka, atau apakah tokonya masih ada. Medan itu sengaja dibiarkan kosong menunggu pemilik toko mengklaimnya sendiri — menambalnya dengan geokode massal atau penarikan pihak ketiga akan mengisi direktori dengan tebakan yang tidak bisa dibantah siapa pun.',
    rencanaBukanKalender:
      'Rencana musim BUKAN kalender penuh, dan itu bukan kekurangan yang akan ditambal. Dari empat langkah protokol yang ada, dua bisa ditanggalkan karena waktunya relatif terhadap pindah tanam; satu menunggu fase pertumbuhan dan satu dipicu ambang pengamatan. Entitas fase tidak memuat hari, durasi, maupun akumulasi suhu — jadi tanggalnya TIDAK ditebak. Justru itu alasan penjadwalan berbasis fase dipilih: hari setelah tanam sering meleset ketika musimnya mundur atau varietasnya lebih genjah.',
    bppTanpaAlamat:
      'Balai penyuluhan tidak punya alamat maupun koordinat di rekaman ini, dan itu batas sumbernya: laporan tamu SIMLUHTAN hanya memberi nama balai dan kecamatan binaannya. Yang menemukan balainya bukan peta melainkan kecamatan — dan bagi yang tinggal di sana itu memang cukup. Menggeokode 5.844 balai secara massal ditolak dengan sadar, karena bertabrakan dengan rancangan "klaim" yang sama seperti pada toko tani.',
    gejalaOptRegistri:
      'Nol dari 738 OPT registri berproduk memuat teks gejala. Sepuluh OPT yang punya teksnya adalah entitas terkurasi tersendiri di ruang id yang berbeda — tidak satu pun dari 738 ini ada di antaranya. Akibatnya layar bisa menunjukkan bahan aktif yang terdaftar untuk sebuah hama, tetapi TIDAK bisa membantu memastikan bahwa hama itu memang yang ada di kebun. Menulis teksnya pekerjaan agronomi, bukan pekerjaan indeks.',
    hasilVarietas:
      'Registri tidak memuat potensi hasil satu pun varietas — nol dari 11.227. Perkiraan panen pada analisis usaha tani karena itu masukan pemakainya sendiri, dan tidak ada angka acuan yang bisa disodorkan menggantikannya.',
    arusKasMusim:
      'Kapan biaya keluar dan kapan uang masuk menuntut kalender musim yang bertanggal. Kosakata fase sengaja tidak punya medan hari, dan hanya dua dari empat langkah protokol cabai yang bertanggal — membangun kalender di atas itu berarti mengarang tanggal.',
    takaranRumahTangga:
      'Tidak ada satu pun ukuran baku untuk tutup botol, sendok, atau gelas, dan registri tidak memuatnya. Tutup botol yang berbeda berselisih dua sampai empat kali lipat, jadi menyebut "satu tutup" sebagai takaran berarti mengarang angka yang bisa melipatgandakan dosis. Yang bisa dilakukan layar hanya menghitung dari ukuran yang diukur sendiri pemakainya.',
    isiKarung:
      'Kandungan yang cocok membuktikan LABELNYA sesuai dengan yang terdaftar. Ia tidak membuktikan isi karungnya. Justru di situ bahayanya paling tajam: kasus pupuk palsu Rp3,3 triliun persis berupa karung yang berbeda dari labelnya sendiri — NPK di bawah 1% padahal minimum 15%. Yang bisa memastikan isi hanya uji laboratorium, dan itu di luar jangkauan permukaan ini.',
    wilayahNamaLokal:
      'Tidak satu pun dari enam nama lokal menyebutkan wilayah pemakaiannya. Sumbernya berbunyi "setiap daerah memiliki bahasa lokal yang berbeda, tapi umumnya", dan "umumnya" bukan nama tempat. Jadi kamus ini tidak bisa mengatakan sebuah nama dipakai di daerah pembacanya — ia hanya bisa mengatakan nama itu pernah didengar.',
  },
};

// ---------------------------------------------------------------------------
// Tulis
// ---------------------------------------------------------------------------
const berkas = new Map();
const simpan = (p, data) => berkas.set(p, JSON.stringify(data) + '\n');

simpan('meta.json', meta);
for (const [nomor, isi] of berkasSetara) simpan(`setara/${nomor}.json`, isi);
for (const [nomor, isi] of berkasBahan) simpan(`bahan/${nomor}.json`, isi);
for (const [k, isi] of Object.entries(berkasBahanMerek).sort()) simpan(`bahan/${k}.json`, isi);
simpan('sediaan.json', berkasSediaan);
for (const [k, isi] of Object.entries(berkasResep).sort()) simpan(`sediaan/${k}.json`, isi);
simpan('gejala.json', gejala);
simpan('gejala-cari.json', gejalaCari);
simpan('nama-lokal.json', namaLokalCari);
for (const [k, isi] of Object.entries(berkasOptNama).sort()) simpan(`opt-nama/${k}.json`, isi);
simpan('varian.json', varian);
simpan('larangan.json', Object.fromEntries([...laranganZat].sort()));
for (const [e, isi] of Object.entries(cari).sort()) simpan(`cari/${e}.json`, isi);
pecahanProduk.forEach((s, i) => simpan(`produk/${String(i).padStart(3, '0')}.json`, s));
pecahanVarietas.forEach((s, i) => simpan(`varietas/${String(i).padStart(3, '0')}.json`, s));
for (const [k, isi] of Object.entries(berkasOpt).sort()) simpan(`opt/${k}.json`, isi);
for (const [e, isi] of Object.entries(berkasKandungan).sort()) simpan(`kandungan/${e}.json`, isi);
simpan('toko-titik.json', tokoTitikIndeks);
simpan('toko-wilayah.json', tokoWilayah);
simpan('alasan-simpangan.json', alasanSimpangan);
simpan('protokol.json', protokolIndeks);
for (const [k, isi] of Object.entries(berkasProtokol).sort()) simpan(`protokol/${k}.json`, isi);
simpan('bpp-wilayah.json', bppWilayah);
for (const [k, isi] of Object.entries(berkasBpp).sort()) simpan(`bpp/${k}.json`, isi);
simpan('lab-kemampuan.json', labKepala);
for (const [k, isi] of Object.entries(berkasLab).sort()) simpan(`lab/${k}.json`, isi);
for (const [k, isi] of Object.entries(berkasToko).sort()) simpan(`toko/${k}.json`, isi);
for (const [k, isi] of Object.entries(berkasPrincipal).sort()) simpan(`principal/${k}.json`, isi);
for (const [k, isi] of Object.entries(berkasHarga).sort()) simpan(`harga/${k}.json`, isi);
if (kepalaHarga.length) simpan('harga.json', kepalaHarga);

// ---------------------------------------------------------------------------
// Cap bangunan — supaya penyaji tidak perlu bertanya "sudah berubah belum?"
// ---------------------------------------------------------------------------
// Sampai 23 Agustus 2026 `ambil()` di app/pustaka.js memakai `cache: 'no-cache'`:
// peramban selalu bertanya ke server, bahkan untuk berkas yang tidak berubah. Bytenya
// memang hemat — jawaban 304 cuma ~300 byte — tetapi satu perjalanan pulang-pergi tetap
// dibayar per berkas per muat halaman, dan syarat lapangan permukaan ini justru sinyal
// buruk. Alasan `no-cache` sendiri sah: tanpa bertanya, yang membangun ulang indeks akan
// melihat data lama tanpa satu pun tanda.
//
// Cap ini menghapus sebabnya, bukan gejalanya. Ia hash atas SELURUH pecahan yang
// diterbitkan, dan penyaji menempelkannya sebagai `?v=` pada tiap pengambilan. Isi
// berubah -> cap berubah -> URL berubah -> salinan lama tidak akan pernah terpakai lagi.
// Karena mustahil basi, `no-cache` boleh dicabut dan hanya meta.json yang perlu ditanya.
//
// Dihitung atas berkas selain meta.json, karena capnya sendiri masuk ke meta.json.
// Keluarannya deterministik (lihat kepala berkas ini), jadi membangun ulang sumber yang
// sama menghasilkan cap yang sama — dan cap yang tidak berubah berarti cache pembaca
// tidak perlu dibuang sama sekali.
const capIsi = createHash('sha256');
for (const [jalan, isi] of [...berkas.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  if (jalan === 'meta.json') continue;
  capIsi.update(jalan);
  capIsi.update('\u0000');
  capIsi.update(isi);
}
meta.cap = capIsi.digest('hex').slice(0, 12);
simpan('meta.json', meta);

const ukuran = [...berkas.values()].reduce((a, s) => a + Buffer.byteLength(s), 0);
const terbesar = [...berkas.entries()]
  .map(([p, s]) => [p, Buffer.byteLength(s)])
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6);

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
if (process.argv.includes('--sebaran')) {
  for (const awalan of ['cari/', 'produk/', 'varietas/', 'setara/', 'bahan/', 'opt/', 'kandungan/']) {
    const u = [...berkas].filter(([p]) => p.startsWith(awalan)).map(([, s]) => Buffer.byteLength(s)).sort((a, b) => a - b);
    if (!u.length) continue;
    const q = (f) => kb(u[Math.min(u.length - 1, Math.floor(u.length * f))]);
    const lewat = u.filter((n) => n > 48 * 1024).length;
    console.log(`${awalan.padEnd(10)} n=${String(u.length).padStart(4)}  p50=${q(0.5).padStart(9)}  p90=${q(0.9).padStart(9)}  p99=${q(0.99).padStart(9)}  maks=${kb(u[u.length - 1]).padStart(9)}  >48KB: ${lewat}`);
  }
}
console.log(`Berkas indeks       : ${berkas.size}`);
console.log(`Ukuran seluruhnya   : ${(ukuran / 1024 / 1024).toFixed(2)} MB`);
console.log(`  meta.json         : ${kb(Buffer.byteLength(berkas.get('meta.json')))}`);
console.log(`  kepala pencarian  : ${kb([...berkas].filter(([p]) => p.startsWith('cari/')).reduce((a, [, s]) => a + Buffer.byteLength(s), 0))} dalam ${Object.keys(cari).length} ember`);
console.log(`  setara/           : ${kb([...berkas].filter(([p]) => p.startsWith('setara/')).reduce((a, [, s]) => a + Buffer.byteLength(s), 0))} dalam ${pecahanSetara.length} pecahan — ${meta.jumlah.kelompokSetara} kelompok, ${meta.jumlah.produkSetara} produk`);
console.log(`  bahan/            : ${kb([...berkas].filter(([p]) => p.startsWith('bahan/')).reduce((a, [, s]) => a + Buffer.byteLength(s), 0))} dalam ${pecahanBahan.length} pecahan — ${meta.jumlah.bahanAktifTerpakai} bahan aktif, ${meta.jumlah.kartuBahanKadar} kartu bahan+kadar`);
// Dilaporkan selalu, bukan cuma saat diminta: pemecahan yang diam-diam melewati
// anggarannya terbaca seolah semuanya muat.
const lewat = [...berkas].filter(([, s]) => Buffer.byteLength(s) > ANGGARAN);
console.log(`  lewat anggaran    : ${lewat.length} dari ${berkas.size} berkas di atas ${kb(ANGGARAN)}`);
console.log(`  tak terjangkau    : ${terbuang.tanpaOpt + terbuang.tanpaKomoditas + terbuang.tanpaKeduanya} dari ${terbuang.penggunaan} penggunaan berlabel tak punya pintu OPT`);
console.log(`  komoditas bervarian: ${Object.keys(varian).length} tanaman dengan lebih dari satu fase atau sistem budidaya`);
console.log(`  alasan-simpangan  : ${alasanSimpangan.length} alasan, ${new Set(alasanSimpangan.map((a) => a.sinyal)).size} jenis sinyal`);
console.log(`  protokol/         : ${protokolIndeks.length} protokol, ${protokolIndeks.reduce((a, p) => a + p.langkah, 0)} langkah — ${protokolIndeks.reduce((a, p) => a + p.bertanggal, 0)} bisa ditanggalkan, sisanya menunggu fase atau ambang`);
console.log(`  bpp/              : ${bppSemua.length} balai di ${bppWilayah.length} kabupaten/kota, ${bppWilayah.reduce((a, w) => a + w.kec, 0)} kecamatan tersebut di serves (${bppSemua.filter((b) => !(b.serves ?? []).length).length} balai kecamatannya kosong di sumbernya) — tanpa alamat, dan itu juga batas sumbernya`);
console.log(`  lab/              : ${labSemua.length} laboratorium di ${labWilayah.length} provinsi — ${cacahKemampuan.r ?? 0} di antaranya bisa mengukur residu pestisida`);
console.log(`  toko/             : ${tokoTitikIndeks.length} bertitik (OSM), ${tokoAlamat.length} berwilayah di ${tokoWilayah.length} wilayah — ${tokoAlamat.filter((r) => lebihRinci(r.alamat)).length} lebih rinci dari kabupaten`);
console.log(`  kandungan/        : ${kb([...berkas].filter(([p]) => p.startsWith('kandungan/')).reduce((a, [, s]) => a + Buffer.byteLength(s), 0))} dalam ${Object.keys(berkasKandungan).length} ember — ${kandungan.size} sidik, ${[...kandungan.values()].reduce((a, d) => a + d.length, 0)} produk${produkTanpaSidik ? `, ${produkTanpaSidik} berkomposisi tak bersidik` : ''}`);
console.log(`  opt-nama/         : ${optRegistriIndeks.length} OPT registri berproduk dapat dicari menurut nama — tidak satu pun punya teks gejala`);
console.log(`  kamus nama lokal  : ${namaLokalCari.length} nama — ${namaLokalCari.filter((x) => x.ke.length).length} terpetakan, ${namaLokalCari.filter((x) => x.ke.length > 1).length} bertaksa, ${namaLokalCari.filter((x) => !x.ke.length).length} belum${namaLokalGugur ? `, ${namaLokalGugur} rujukan gugur karena OPT-nya tak berpintu` : ''}`);
console.log(`  pintu jalur 1     : ${gejala.filter((g) => g.adaPintu).length} dari ${gejala.length} OPT terkurasi punya teks gejala`);
console.log(`  principal/        : ${kb([...berkas].filter(([p]) => p.startsWith('principal/')).reduce((a, [, s]) => a + Buffer.byteLength(s), 0))} dalam ${Object.keys(berkasPrincipal).length} berkas — ${meta.jumlah.principal} badan, ${meta.jumlah.produkBerprincipal} dari ${semuaProduk.length} produk tertaut`);
console.log(`  harga/            : ${kb([...berkas].filter(([p]) => p.startsWith('harga/')).reduce((a, [, s]) => a + Buffer.byteLength(s), 0))} dalam ${Object.keys(berkasHarga).length} varian — ${meta.jumlah.hargaBerangka} berangka, ${meta.jumlah.hargaVarian - meta.jumlah.hargaBerangka} diterbitkan tanpa angka, ${meta.jumlah.hargaTitik} titik`);
console.log(`  gambar kemasan    : ${meta.jumlah.produkBergambar} dari ${semuaProduk.length} produk (${(meta.jumlah.produkBergambar / semuaProduk.length * 100).toFixed(1)}%), ${meta.jumlah.gambarKemasan} gambar`);
console.log(`  komentar harga    : ${hargaKomentar ? `${Object.values(hargaKomentar.komentar ?? {}).filter((x) => x.sumber === 'model').length} model, ${Object.values(hargaKomentar.komentar ?? {}).filter((x) => x.sumber === 'terhitung').length} terhitung, ${Object.values(hargaKomentar.komentar ?? {}).filter((x) => !x.ditinjau).length} belum ditinjau orang` : 'TIDAK ADA — jalankan spec/tools/bangun-komentar-harga.mjs'}`);
console.log('Enam berkas terbesar:');
for (const [p, n] of terbesar) console.log(`  ${kb(n).padStart(10)}  ${p}`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyimpan ke spec/indeks/.');
  process.exit(0);
}

if (existsSync(KELUAR)) rmSync(KELUAR, { recursive: true });
for (const [p, isi] of berkas) {
  const tujuan = join(KELUAR, p);
  mkdirSync(dirname(tujuan), { recursive: true });
  writeFileSync(tujuan, isi);
}
console.log(`\nDitulis ke ${KELUAR}`);
