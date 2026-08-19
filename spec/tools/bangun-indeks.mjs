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
//   sediaan.json           dua belas resep utuh; kecil, jadi tidak dipecah
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
//   PHI             290 dari 23.058 penggunaan — terlalu jarang untuk dijanjikan
//   harga           nol — masukan pengguna di jalur 3
//   berat jenis     nol — pupuk cair tidak sebanding dengan yang padat
// Keempatnya dicatat di meta.json supaya sisi penyaji tahu ia tidak boleh
// menjanjikannya, alih-alih menemukan sendiri bahwa datanya kosong.

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, statSync } from 'node:fs';
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
const komoditas = [...larik(bacaJson('commodity.json')), ...larik(bacaJson('commodity-registri.json'))];
const optRegistri = larik(bacaJson('pest-registri.json'));

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
// Rincian varietas — surat yang dipegang, apa adanya
// ---------------------------------------------------------------------------
function rinciVarietas(v) {
  return {
    id: v.id,
    nama: v.label?.id ?? '',
    jenis: 'varietas',
    komoditas: v.commodity?.id ?? null,
    komoditasNama: v.commodity?.label ?? null,
    tipe: v.variety_type ?? null,
    asal: v.origin ?? null,
    pemelihara: v.maintainer ?? null,
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
// satu entitas "Abamektin" dipakai pada 15 kadar berbeda, dari 7 sampai 72 g/L.
// Dosis menempel pada tiap merek, bukan pada bahannya — 25 produk berisi
// Abamektin 18 g/L punya dosis terdaftar 0,5 sampai 2 ml/l, dan satu di antaranya
// memakai satuan yang sama sekali lain.
// ---------------------------------------------------------------------------
const perKomoditas = new Map();
// Penggunaan yang salah satu tautannya kosong tidak bisa masuk indeks yang
// pintunya OPT — tanpa id OPT, tidak ada tempat menaruhnya. Tetapi ia TIDAK boleh
// hilang begitu saja: 2.438 dari 23.058 (10,6%) berada dalam keadaan itu, dan
// pembangun versi pertama membuangnya tanpa sepatah kata, sehingga trips di cabai
// terbaca 57 produk padahal registrinya memuat 286. Semuanya tetap terbaca dari
// sisi produk (`guna` pada rincian produk membawa null apa adanya); yang dicatat di
// sini adalah berapa banyak yang tidak bisa dijangkau dari jalur 1.
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
    if (!kom.opt.has(u.pest.id)) kom.opt.set(u.pest.id, { nama: namaOpt(u.pest.id, u.pest_label), grup: new Map() });
    const opt = kom.opt.get(u.pest.id);
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
    return { i: id, n: r?.nama ?? '', k: r?.produsen ?? null, p: r?.daftar ?? null };
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

const cari = {};
for (const r of [...semuaProduk, ...semuaVarietas]) {
  const e = ember(r.nama);
  if (!cari[e]) cari[e] = [];
  cari[e].push({
    n: r.nama,
    i: r.id,
    j: r.jenis,
    k: r.jenis === 'varietas' ? r.komoditasNama : r.produsen,
    p: petaPecahan.get(r.id),
  });
}
for (const e of Object.keys(cari)) cari[e].sort((a, b) => a.n.localeCompare(b.n) || a.i.localeCompare(b.i));

// Beberapa awalan jauh lebih padat dari yang lain — "ma" sendiri 80 KB. Yang
// melewati anggaran didalamkan satu huruf lagi, berulang sampai muat. Awalan yang
// didalamkan dicatat di meta.json, jadi penyaji tahu harus meminta tiga huruf
// alih-alih dua tanpa perlu satu perjalanan gagal lebih dulu.
const cariDalam = [];
const muat = (isi) => Buffer.byteLength(JSON.stringify(isi), 'utf8') <= ANGGARAN;
for (let panjang = 2; panjang < 8; panjang++) {
  const gemuk = Object.keys(cari).filter((e) => e.length === panjang && !muat(cari[e]));
  if (!gemuk.length) break;
  for (const e of gemuk) {
    for (const r of cari[e]) {
      const dalam = (rapikan(r.n) + '_______').slice(0, panjang + 1);
      (cari[dalam] ??= []).push(r);
    }
    delete cari[e];
    cariDalam.push(e);
  }
}
cariDalam.sort();

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
      .map((g) => ({ ...g, merek: g.merek.slice().sort((a, b) => (a.daftar ?? '').localeCompare(b.daftar ?? '')) }))
      .sort((a, b) => b.merek.length - a.merek.length || a.zat.localeCompare(b.zat));
    const produk = new Set();
    for (const g of grup) for (const m of g.merek) produk.add(m.id);
    const ko = kunciKomoditas(oid);
    daftarOpt.push({
      id: oid,
      nama: o.nama,
      produk: produk.size,
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
    const utuh = { komoditas: kc, komoditasNama: v.nama, opt: oid, optNama: o.nama, grup };
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
      const sisa = [];
      while (utuh.grup.length > 1 && Buffer.byteLength(JSON.stringify(utuh), 'utf8') > ANGGARAN) {
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
    }))
    .sort((a, b) => a.id.localeCompare(b.id)),
};

// ---------------------------------------------------------------------------
// Pintu masuk jalur 1: OPT terkurasi beserta teks gejalanya
// ---------------------------------------------------------------------------
// Teks gejala yang dicari jalur 1 ternyata sudah ada, tersimpan di `definition` pada
// pest.json — bukan di medan bernama gejala, dan bukan pada 1.360 OPT registri.
// Lima dari sepuluh OPT cabai terkurasi memilikinya; lima sisanya kosong, dan yang
// kosong itulah yang menutup pintu meski produknya banyak — ulat grayak punya 177
// produk terdaftar dan tetap tak bisa dimasuki.
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
      const produk = new Set();
      for (const g of o.grup.values()) for (const m of g.merek) produk.add(m.id);
      di.push({ komoditas: kc, nama: v.nama, produk: produk.size, berkas: `opt/${kunciKomoditas(kc)}/${kunciKomoditas(k.id)}` });
    }
    return {
      id: k.id,
      nama: k.label?.id ?? '',
      ilmiah: k.scientific_name ?? null,
      jenis: k.pest_kind ?? null,
      gejala: k.definition?.id ?? null,
      // Dinyatakan, bukan disembunyikan: tanpa teks gejala OPT ini tidak punya pintu
      // masuk sama sekali, sebanyak apa pun produk terdaftarnya.
      adaPintu: Boolean(k.definition?.id),
      di: di.sort((a, b) => b.produk - a.produk || a.komoditas.localeCompare(b.komoditas)),
    };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

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
// meta.json — termasuk apa yang TIDAK ada, supaya penyaji tidak menjanjikannya
// ---------------------------------------------------------------------------
const meta = {
  versi: 1,
  sumber: 'spec/vocab',
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
  },
  pecahan: {
    cari: Object.keys(cari).sort(),
    cariDalam,
    setara: pecahanSetara.length,
    produk: pecahanProduk.length,
    varietas: pecahanVarietas.length,
    opt: [...perKomoditas.keys()].map(kunciKomoditas).sort(),
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
    phi: 'Hanya 290 dari 23.058 penggunaan berlabel menyinggung tenggang panen. Penyaji tidak boleh menjanjikan tanggal aman panen.',
    harga: 'Registri tidak memuat harga sama sekali. Jalur 3 mengandalkan satu masukan pengguna.',
    beratJenis: 'Tidak ada, sehingga pupuk cair tidak sebanding dengan yang padat.',
    namaDagang: 'Registri menyimpan nama produk terdaftar; nama di kemasan bisa berbeda dan belum terpetakan.',
    sertifikasiLot: 'Jalur 4 hanya bisa memastikan varietasnya, bukan bungkus atau bibit yang di tangan.',
  },
};

// ---------------------------------------------------------------------------
// Tulis
// ---------------------------------------------------------------------------
const berkas = new Map();
const simpan = (p, data) => berkas.set(p, JSON.stringify(data) + '\n');

simpan('meta.json', meta);
for (const [nomor, isi] of berkasSetara) simpan(`setara/${nomor}.json`, isi);
simpan('sediaan.json', berkasSediaan);
simpan('gejala.json', gejala);
simpan('varian.json', varian);
simpan('larangan.json', Object.fromEntries([...laranganZat].sort()));
for (const [e, isi] of Object.entries(cari).sort()) simpan(`cari/${e}.json`, isi);
pecahanProduk.forEach((s, i) => simpan(`produk/${String(i).padStart(3, '0')}.json`, s));
pecahanVarietas.forEach((s, i) => simpan(`varietas/${String(i).padStart(3, '0')}.json`, s));
for (const [k, isi] of Object.entries(berkasOpt).sort()) simpan(`opt/${k}.json`, isi);

const ukuran = [...berkas.values()].reduce((a, s) => a + Buffer.byteLength(s), 0);
const terbesar = [...berkas.entries()]
  .map(([p, s]) => [p, Buffer.byteLength(s)])
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6);

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
if (process.argv.includes('--sebaran')) {
  for (const awalan of ['cari/', 'produk/', 'varietas/', 'setara/', 'opt/']) {
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
// Dilaporkan selalu, bukan cuma saat diminta: pemecahan yang diam-diam melewati
// anggarannya terbaca seolah semuanya muat.
const lewat = [...berkas].filter(([, s]) => Buffer.byteLength(s) > ANGGARAN);
console.log(`  lewat anggaran    : ${lewat.length} dari ${berkas.size} berkas di atas ${kb(ANGGARAN)}`);
console.log(`  tak terjangkau    : ${terbuang.tanpaOpt + terbuang.tanpaKomoditas + terbuang.tanpaKeduanya} dari ${terbuang.penggunaan} penggunaan berlabel tak punya pintu OPT`);
console.log(`  komoditas bervarian: ${Object.keys(varian).length} tanaman dengan lebih dari satu fase atau sistem budidaya`);
console.log(`  pintu jalur 1     : ${gejala.filter((g) => g.adaPintu).length} dari ${gejala.length} OPT terkurasi punya teks gejala`);
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
