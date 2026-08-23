// Menarik penetapan harga TBS kelapa sawit Riau dari Media Center Riau, lalu menormalkannya
// jadi NDJSON. Dua seri mingguan: pekebun MITRA SWADAYA dan MITRA PLASMA.
//
//   node harga_data/tarik-tbs-riau.mjs               # tarik yang belum ada, gabung
//   node harga_data/tarik-tbs-riau.mjs --halaman 5   # batasi penelusuran indeks (uji cepat)
//   node harga_data/tarik-tbs-riau.mjs --ulang        # ambil ulang yang sudah tersimpan
//
// KENAPA RIAU, DAN KENAPA LEWAT PINTU INI
// Riau satu-satunya provinsi yang menerbitkan harga TBS PEKEBUN SWADAYA. Penetapan resmi di
// provinsi lain hanya menaungi pekebun mitra dan plasma — Permentan 13/2024 berjudul
// "Pembelian Tandan Buah Segar Kelapa Sawit Produksi Pekebun Mitra" — sementara swadaya
// adalah mayoritas petani sawit Indonesia. Angka swadaya Riau karena itu satu-satunya jendela
// yang ada ke sisi yang paling besar dan paling tidak terlihat.
//
// Disbun Riau sendiri menerbitkannya sebagai PDF PINDAI ±150 dpi tanpa lapisan teks, dan
// arsipnya hanya sampai November 2024 meski dropdown-nya menawarkan 2008. Media Center Riau
// menerbitkan hasil rapat yang sama sebagai PROSA HTML berangka — tidak perlu OCR, dan
// arsipnya lebih dalam. `robots.txt` berbunyi `Disallow:` kosong.
//
// ANGKANYA UMUR 9 TAHUN, BUKAN RATA-RATA — DAN ITU HARUS IKUT KE LAYAR
// Penetapan Riau memakai rentang umur 3–30 tahun, tetapi yang diumumkan satu angka: harga
// pada kelompok umur 9 tahun. Sembilan tahun adalah puncak kurva hasil sawit, jadi angka ini
// TERTINGGI di antara seluruh pita umur — bukan rata-rata, dan bukan yang diterima kebun muda
// maupun kebun tua. Menayangkannya sebagai "harga TBS Riau" tanpa menyebut umurnya akan
// menaksir terlalu tinggi apa yang diterima sebagian besar kebun.
//
// PROSA ITU RAPUH, JADI ADA PEMERIKSAAN SILANG
// Ini bukan tabel; ini kalimat wartawan. Dan bahaya terbesarnya bukan gagal mengurai —
// melainkan mengurai angka yang SALAH tanpa ada yang tahu. Satu artikel memuat sedikitnya
// empat bilangan berbentuk rupiah: tingkat harga TBS, SELISIH mingguannya, harga CPO, dan
// harga kernel. Pengurai naif akan mengambil selisihnya dan menerbitkannya sebagai harga.
//
// Karena itu tiap angka diambil dua kali dari dua tempat yang berbeda — badan artikel dan
// JUDULNYA — lalu dibandingkan. Yang tidak sepakat DITOLAK, bukan ditebak, dan jumlah yang
// ditolak dilaporkan. Judul memang membulatkan ke rupiah utuh, jadi yang diuji kesamaan
// bagian bulatnya.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { request } from 'node:https';
import { rootCertificates } from 'node:tls';

const UA = 'OpenProtocols/0.1 (+https://github.com/bayusyerli/open_protocol) riset harga sawit';
const BASIS = 'https://mediacenter.riau.go.id';
const KELUAR = join('harga_data', 'tbs-riau.ndjson');

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const ulang = process.argv.includes('--ulang');
const batasHalaman = Number(arg('halaman')) || Infinity;

// Jeda antar permintaan. Bukan basa-basi: ini situs pemerintah daerah, dan menariknya secepat
// mungkin demi arsip yang toh hanya diambil sebulan sekali adalah biaya yang ditanggung orang
// lain tanpa alasan.
const JEDA_MS = 700;
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// TLS — server ini mengirim rantai yang tidak lengkap
// ---------------------------------------------------------------------------
// mediacenter.riau.go.id menyajikan HANYA sertifikat daunnya, tanpa sertifikat perantara.
// curl di macOS tetap berhasil karena penyimpanan kepercayaan sistem mengejar perantara itu
// sendiri lewat AIA; Node tidak melakukannya, dan menolak dengan UNABLE_TO_VERIFY_LEAF_SIGNATURE.
//
// Yang TIDAK dilakukan di sini: mematikan verifikasi. `NODE_TLS_REJECT_UNAUTHORIZED=0` akan
// membuat berkas ini menerima sertifikat apa pun dari siapa pun, dan itu harga yang jauh
// terlalu mahal untuk mengambil tabel harga.
//
// Yang dilakukan: melengkapi rantainya. Perantaranya diambil sekali dari URL AIA yang
// disebut sertifikat daunnya sendiri, diperiksa subjeknya, lalu dipasang sebagai jangkar
// tambahan di samping akar bawaan Node. Verifikasi tanda tangan, nama host, dan masa berlaku
// tetap berjalan penuh — yang berubah hanya bahwa rantainya kini bisa disambungkan.
const AIA = 'http://crt.sectigo.com/SectigoRSADomainValidationSecureServerCA.crt';
const SUBJEK_PERANTARA = 'Sectigo RSA Domain Validation Secure Server CA';

let jangkar = null;
async function siapkanJangkar() {
  if (jangkar) return jangkar;
  const r = await fetch(AIA);
  if (!r.ok) throw new Error(`perantara TLS gagal diambil dari ${AIA}: HTTP ${r.status}`);
  const der = Buffer.from(await r.arrayBuffer());
  const { X509Certificate } = await import('node:crypto');
  const c = new X509Certificate(der);
  // Diperiksa, bukan dipercaya begitu saja: yang diambil lewat HTTP polos harus dipastikan
  // memang perantara yang disebut sertifikat daunnya.
  if (!c.subject.includes(SUBJEK_PERANTARA)) {
    throw new Error(`perantara TLS tak dikenali: ${c.subject}`);
  }
  if (new Date(c.validTo) < new Date('2026-08-23')) {
    throw new Error(`perantara TLS sudah kedaluwarsa: ${c.validTo}`);
  }
  jangkar = [...rootCertificates, c.toString()];
  return jangkar;
}

async function ambil(alamat) {
  const ca = await siapkanJangkar();
  return new Promise((tuntas, gagal) => {
    const req = request(alamat, { headers: { 'User-Agent': UA }, ca }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return gagal(new Error(`${alamat}: HTTP ${res.statusCode}`));
      }
      let isi = '';
      res.setEncoding('utf8');
      res.on('data', (d) => { isi += d; });
      res.on('end', () => tuntas(isi));
    });
    req.on('error', gagal);
    req.setTimeout(60_000, () => { req.destroy(new Error(`${alamat}: waktu habis`)); });
    req.end();
  });
}

const lepas = (s) =>
  s.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&ndash;/g, '–').replace(/&\w+;/g, ' ')
    .replace(/\s+/g, ' ').trim();

// "3.832,65" -> 3832.65
const rupiah = (s) => {
  const n = Number(String(s).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const BULAN = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
};

// ---------------------------------------------------------------------------
// 1. Telusuri indeks arsip
// ---------------------------------------------------------------------------
async function daftarArtikel() {
  const keluar = new Map();
  let halaman = 1, maks = 1;
  do {
    const html = await ambil(`${BASIS}/arsip?search=${encodeURIComponent('harga TBS')}&page=${halaman}`);
    if (halaman === 1) {
      const semua = [...html.matchAll(/arsip\?search=[^"]*page=(\d+)/g)].map((m) => Number(m[1]));
      maks = Math.min(semua.length ? Math.max(...semua) : 1, batasHalaman);
      process.stderr.write(`Indeks: ${maks} halaman hasil pencarian\n`);
    }
    for (const m of html.matchAll(/<a href="[^"]*\/arsip\/(\d+)"[^>]*class="text-decoration-none[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/a>/g)) {
      keluar.set(m[1], lepas(m[2]));
    }
    halaman++;
    if (halaman <= maks) await tidur(JEDA_MS);
  } while (halaman <= maks);
  return keluar;
}

// Hanya artikel penetapan harga TBS yang menyebut jenis pekebunnya. Yang tidak menyebutnya
// dilewati: tanpa tahu ia swadaya atau plasma, angkanya tidak bisa ditaruh di seri mana pun.
function jenisPekebun(judul) {
  const t = judul.toLowerCase();
  if (!t.includes('tbs')) return null;
  if (t.includes('swadaya')) return 'swadaya';
  if (t.includes('plasma')) return 'plasma';
  return null;
}

// ---------------------------------------------------------------------------
// 2. Urai satu artikel
// ---------------------------------------------------------------------------
function urai(id, judul, html) {
  const t = lepas(html);
  const jenis = jenisPekebun(judul);
  if (!jenis) return { id, lewat: 'judul tidak menyebut swadaya maupun plasma' };

  // Tingkat harga TBS. Dijangkarkan pada frasa "harga pembelian TBS" supaya tidak tertukar
  // dengan selisih mingguan, harga CPO, atau harga kernel yang bentuknya sama persis.
  // Sebagian artikel — dan justru yang paling lengkap — memuat TABEL UMUR utuh dalam prosanya:
  // "Umur 3 tahun: Rp2.841,56/Kg Umur 4 tahun: … Umur 9 tahun: Rp3.667,82/Kg (tertinggi)".
  // Itu jauh lebih berharga daripada satu angka, dan sekaligus MEMBUKTIKAN dari sumbernya
  // sendiri bahwa umur 9 memang yang tertinggi — asumsi yang sebelumnya hanya disimpulkan
  // dari judul-judul.
  const pita = {};
  for (const m of t.matchAll(/Umur\s+(\d{1,2}(?:\s*[–—-]\s*\d{1,2})?)\s*tahun\s*:?\s*Rp\s?([\d.]+,\d{2})/gi)) {
    pita[m[1].replace(/\s*[–—-]\s*/, '-')] = rupiah(m[2]);
  }

  // Tingkat harga umur 9. Tiga penjangkaran, seluruhnya menyebut bahwa yang diikutinya harga
  // TBS — bukan selisih, bukan CPO, bukan kernel. Kalau tabel umurnya ada, ia yang dipakai:
  // angka dari tabel tidak bisa tertukar dengan apa pun.
  const mHarga = t.match(/harga pembelian TBS[^.]{0,160}?Rp\s?([\d.]+,\d{2})/i)
    ?? t.match(/harga TBS pekebun[^.]{0,80}?ditetapkan sebesar Rp\s?([\d.]+,\d{2})/i)
    ?? t.match(/harga (?:TBS|pembelian)[^.]{0,80}?menjadi Rp\s?([\d.]+,\d{2})/i);
  const harga = pita['9'] ?? (mHarga ? rupiah(mHarga[1]) : null);
  if (harga === null) return { id, lewat: 'tingkat harga TBS tidak ditemukan di badan artikel' };

  // PEMERIKSAAN SILANG. Judul memuat angka yang sama, dibulatkan ke rupiah utuh. Kalau
  // keduanya tidak sepakat, yang terurai hampir pasti angka lain — dan menerbitkannya berarti
  // menerbitkan kekeliruan yang tak seorang pun akan menyadarinya.
  // Tidak setiap judul memuat angka — sebagian berbunyi "Kembali Naik, Dipicu Penguatan Harga
  // CPO" tanpa satu bilangan pun. Untuk yang begitu, pemeriksaan silang berpindah ke uji
  // JULAT terhadap serinya sendiri, yang dijalankan sesudah seluruh artikel terkumpul.
  // Uji itu justru lebih tajam untuk kekeliruan yang paling ditakuti di sini: selisih
  // mingguan berukuran puluhan rupiah, sedangkan tingkat harga ribuan — meleset dua kali
  // lipat besaran, bukan beberapa persen.
  // Angka di judul dipakai sebagai pembanding HANYA bila ia sendiri berbentuk tingkat harga.
  // Sebagian judul memuat selisih atau persentase — "Naik Rp5,15" — dan membandingkan tingkat
  // harga dengan selisih akan menggugurkan artikel yang sebenarnya benar. Ambangnya Rp1.000:
  // tidak pernah ada harga TBS di bawah itu, dan tidak pernah ada selisih mingguan di atasnya.
  const AMBANG_TINGKAT = 1000;
  let silang = 'julat';
  const kandidat = [...judul.matchAll(/Rp\s?([\d.]+(?:,\d{2})?)/gi)]
    .map((m) => rupiah(m[1]))
    .filter((x) => x !== null && x >= AMBANG_TINGKAT);
  if (kandidat.length) {
    silang = 'judul';
    if (!kandidat.some((x) => Math.trunc(x) === Math.trunc(harga))) {
      return { id, lewat: `badan (${harga}) dan judul (${kandidat.join(', ')}) tidak sepakat` };
    }
  }

  // Periode, tiga bentuk yang semuanya dipakai bergantian oleh penulis yang berbeda:
  //   "11–17 Maret 2026"          satu bulan, tanda pisah en dash
  //   "4 - 10 Maret 2026"         satu bulan, tanda hubung berspasi
  //   "29 April - 5 Mei 2026"     MELINTASI BULAN — dan ini yang menolak seperempat arsip
  //                               sebelum ditangani, karena pekan memang tidak berhenti di
  //                               pergantian bulan.
  const lintasBulan = t.match(/(\d{1,2})\s+([A-Za-z]+)\s*[–—-]\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  const satuBulan = t.match(/(\d{1,2})\s*[–—-]\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  let awal, akhir;
  if (lintasBulan) {
    const b1 = BULAN[lintasBulan[2].toLowerCase()], b2 = BULAN[lintasBulan[4].toLowerCase()];
    if (!b1 || !b2) return { id, lewat: `nama bulan tidak dikenali: ${lintasBulan[2]}/${lintasBulan[4]}` };
    const th = Number(lintasBulan[5]);
    // Pekan yang menyeberang pergantian TAHUN: bulan awal lebih besar dari bulan akhir.
    const thAwal = b1 > b2 ? th - 1 : th;
    awal = `${thAwal}-${String(b1).padStart(2, '0')}-${String(lintasBulan[1]).padStart(2, '0')}`;
    akhir = `${th}-${String(b2).padStart(2, '0')}-${String(lintasBulan[3]).padStart(2, '0')}`;
  } else if (satuBulan) {
    const b = BULAN[satuBulan[3].toLowerCase()];
    if (!b) return { id, lewat: `nama bulan tidak dikenali: ${satuBulan[3]}` };
    const p = (d) => `${satuBulan[4]}-${String(b).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    awal = p(satuBulan[1]); akhir = p(satuBulan[2]);
  } else {
    return { id, lewat: 'periode tidak ditemukan' };
  }

  const mK = t.match(/[Ii]ndeks K[^.]{0,60}?([\d]{1,3},\d{1,2})\s*persen/);
  const mCangkang = t.match(/cangkang[^.]{0,40}?Rp\s?([\d.]+,\d{2})/i);
  const mMinggu = t.match(/minggu ke[-\s]?(\d{1,2})\s+tahun\s+(\d{4})/i);

  return {
    id,
    provinsi: 'Riau',
    jenis,
    // Umur 9 tahun — puncak kurva hasil, bukan rata-rata. Ditulis sebagai medan supaya
    // penyaji tidak bisa lupa menyebutkannya.
    umur: 9,
    t: awal,
    periode_akhir: akhir,
    silang,
    ...(mMinggu ? { minggu: Number(mMinggu[1]), tahun: Number(mMinggu[2]) } : {}),
    tbs: harga,
    ...(Object.keys(pita).length >= 5 ? { tbs_umur: pita } : {}),
    ...(mK ? { indeks_k: rupiah(mK[1]) } : {}),
    ...(mCangkang ? { cangkang: rupiah(mCangkang[1]) } : {}),
    sumber: `${BASIS}/arsip/${id}`,
    judul,
  };
}

// ---------------------------------------------------------------------------
// 3. Jalan
// ---------------------------------------------------------------------------
const lama = existsSync(KELUAR)
  ? readFileSync(KELUAR, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))
  : [];
const sudah = new Set(lama.map((r) => String(r.id)));

const indeks = await daftarArtikel();
const calon = [...indeks.entries()].filter(([, j]) => jenisPekebun(j));
const perluAmbil = calon.filter(([id]) => ulang || !sudah.has(id));

process.stderr.write(`Artikel TBS di indeks: ${calon.length} · perlu diambil: ${perluAmbil.length}\n`);

const baru = [];
const ditolak = [];
for (const [i, [id, judul]] of perluAmbil.entries()) {
  try {
    const html = await ambil(`${BASIS}/arsip/${id}`);
    const hasil = urai(id, judul, html);
    if (hasil.lewat) ditolak.push(hasil); else baru.push(hasil);
  } catch (e) {
    ditolak.push({ id, lewat: e.message });
  }
  if ((i + 1) % 25 === 0) process.stderr.write(`  ${i + 1}/${perluAmbil.length}…\n`);
  if (i + 1 < perluAmbil.length) await tidur(JEDA_MS);
}

// Uji julat untuk yang tidak punya pembanding di judulnya. Ambangnya lebar — ±40% dari
// median serinya — karena yang dijaga bukan ketepatan melainkan KESALAHAN BESARAN: selisih
// mingguan puluhan rupiah lawan tingkat harga ribuan.
const semuaUntukJulat = [...lama, ...baru];
const ditolakJulat = [];
for (const jenis of ['swadaya', 'plasma']) {
  const nilai = semuaUntukJulat.filter((r) => r.jenis === jenis && r.silang === 'judul').map((r) => r.tbs).sort((a, b) => a - b);
  if (nilai.length < 3) continue;
  const median = nilai[Math.floor(nilai.length / 2)];
  for (const r of baru.filter((x) => x.jenis === jenis && x.silang === 'julat')) {
    if (r.tbs < median * 0.6 || r.tbs > median * 1.4) {
      ditolakJulat.push({ id: r.id, lewat: `uji julat gagal: ${r.tbs} jauh dari median ${median}` });
    }
  }
}
const gugur = new Set(ditolakJulat.map((d) => String(d.id)));
const baruLolos = baru.filter((r) => !gugur.has(String(r.id)));
ditolak.push(...ditolakJulat);

const peta = new Map(lama.map((r) => [String(r.id), r]));
for (const r of baruLolos) peta.set(String(r.id), r);
const keluar = [...peta.values()].sort((a, b) => a.t.localeCompare(b.t) || a.jenis.localeCompare(b.jenis));

// Penjaga data pribadi. Artikelnya mengutip pejabat bernama — itu siaran pers, bukan data
// pribadi sensitif, tetapi tidak ada alasan namanya ikut ke keluaran. Yang disimpan angka.
const TERLARANG = ['nik', 'nip', 'no_telp', 'telepon', 'alamat', 'email'];
const serial = JSON.stringify(keluar);
const bocor = TERLARANG.filter((f) => serial.toLowerCase().includes(`"${f}"`));
if (bocor.length) {
  console.error(`BERHENTI — medan data pribadi ikut ke keluaran: ${bocor.join(', ')}.`);
  process.exit(1);
}

writeFileSync(KELUAR, keluar.map((r) => JSON.stringify(r)).join('\n') + '\n');

const n = (x) => x.toLocaleString('id-ID');
const per = (j) => keluar.filter((r) => r.jenis === j);
console.log(`\nArtikel diperiksa      : ${n(perluAmbil.length)}`);
console.log(`  terurai              : ${n(baruLolos.length)}`);
console.log(`  DITOLAK              : ${n(ditolak.length)}`);
for (const d of ditolak.slice(0, 12)) console.log(`      ${d.id}: ${d.lewat}`);
if (ditolak.length > 12) console.log(`      … dan ${n(ditolak.length - 12)} lagi`);
console.log(`Arsip seluruhnya       : ${n(keluar.length)} penetapan`);
console.log(`  mitra SWADAYA        : ${n(per('swadaya').length)}${per('swadaya').length ? ` — ${per('swadaya')[0].t} s.d. ${per('swadaya').at(-1).t}` : ''}`);
console.log(`  mitra plasma         : ${n(per('plasma').length)}${per('plasma').length ? ` — ${per('plasma')[0].t} s.d. ${per('plasma').at(-1).t}` : ''}`);
console.log(`  ber-Indeks K         : ${n(keluar.filter((r) => r.indeks_k).length)}`);
console.log(`  ber-harga cangkang   : ${n(keluar.filter((r) => r.cangkang).length)}`);
console.log(`  BERTABEL UMUR penuh  : ${n(keluar.filter((r) => r.tbs_umur).length)} — pita umur 3-25 tahun terurai dari prosanya`);
console.log(`  silang lewat judul   : ${n(keluar.filter((r) => r.silang === 'judul').length)} · lewat uji julat: ${n(keluar.filter((r) => r.silang === 'julat').length)}`);
console.log(`Penjaga PII            : lolos`);
console.log(`Ditulis ke             : ${KELUAR}`);
