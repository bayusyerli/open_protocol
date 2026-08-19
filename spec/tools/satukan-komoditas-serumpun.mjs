// Menyatukan komoditas serumpun — satu tanaman yang terlanjur terdaftar sebagai
// beberapa entitas karena registri menuliskan hal yang bukan nama ke dalam FIELD
// NAMA KOMODITAS.
//
//   node spec/tools/satukan-komoditas-serumpun.mjs            # periksa saja
//   node spec/tools/satukan-komoditas-serumpun.mjs --tulis    # tulis perubahannya
//
// APA YANG RUSAK
// Petani yang memilih "Cabai" melihat 95 OPT. Produk yang registrinya mendaftarkan
// sasarannya sebagai "Cabai (1,5 ml/l)" tidak akan pernah muncul di layarnya —
// bukan karena datanya tidak ada, melainkan karena dosis bocor ke dalam nama
// komoditas dan pembangun kosakata memperlakukan tiap string unik sebagai satu
// entitas. Cabai terpecah jadi 15, bawang merah 17, karet 13.
//
// YANG DALAM KURUNG TIDAK SELALU DERAU — DAN DI SINILAH BAHAYANYA
// Kurung yang sama bentuknya memuat dua hal yang sama sekali berbeda:
//
//   derau     "(1,5 ml/l)", "(700 ml/ha )"      dosis, milik pendaftaran
//             "(TBM)", "(TM)"                   fase pertumbuhan — lihat catatan
//   pembeda   "(TOT)"                           tanpa olah tanah
//             "(pra tumbuh)" vs "(purna tumbuh)" sebelum vs sesudah gulma tumbuh
//             "(Tapin)" vs "(Tabela)"           tanam pindah vs benih langsung
//             "(Acacia mangium)" vs "(Acacia crassicarpa)"  dua spesies
//
// Menyatukan TOT dengan olah tanah biasa akan menggabungkan dua sistem yang jadwal
// gulma dan herbisidanya berbeda; menyatukan pra tumbuh dengan purna tumbuh akan
// menganjurkan herbisida pada waktu yang salah. Itu kerusakan yang lebih besar
// daripada pemecahan yang hendak diperbaiki.
//
// TBM/TM sempat ditahan atas alasan yang sama, lalu dilepas: perbedaannya nyata,
// tetapi ia sifat PENGGUNAAN, dan fase pertumbuhan sudah punya Stage. Catatan
// panjangnya ada di tabel KURUNG, di dekat putusannya sendiri.
//
// Karena itu putusannya tidak diserahkan ke pola. Seluruh 111 isi kurung yang ada
// di kosakata diklasifikasi satu per satu di tabel KURUNG di bawah, dan isi kurung
// yang belum ada putusannya membuat skrip BERHENTI, bukan menebak. Tarikan registri
// berikutnya yang membawa bentuk baru akan menabrak penjaga itu, bukan lolos diam.
//
// ID TIDAK DIDAUR ULANG. Entitas yang kalah tidak dihapus: statusnya jadi
// "superseded" dan lifecycle.superseded_by menunjuk yang menang, sehingga ejaan
// registri aslinya tetap bisa ditelusuri dan rujukan lama tetap sampai. Aturan L29
// menegakkannya.
//
// SALINAN LABEL PADA REKAMAN PRODUK TIDAK DISENTUH. `commodity_label` pada
// label_uses adalah snapshot sesaat yang sengaja dibiarkan — pada entitas yang
// digantikan, ia satu-satunya tempat bunyi asli registri masih terbaca. Yang
// ditulis ulang hanya `commodity.id`. Ini pelajaran yang sama dengan 1a0f077.
//
// Idempoten: putusan diambil dari tabel dan dari label, bukan dari kembar yang
// masih terlihat — entitas yang sudah superseded dilewati, jadi jalan kedua tidak
// mengubah apa pun.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VOCAB = join(akar, 'spec', 'vocab');
const STAMP = '2026-08-20T00:00:00Z';
const tulis = process.argv.includes('--tulis');

// ---------------------------------------------------------------------------
// Tabel putusan: setiap isi kurung yang ada di kosakata, satu per satu.
//
// 'derau'   -> keterangan pendaftaran yang bocor ke nama; dilepas saat menghitung
//              apakah dua entitas menyebut tanaman yang sama.
// 'pembeda' -> keterangan yang memang membedakan; dipertahankan, dan dua entitas
//              yang pembedanya berbeda TIDAK PERNAH disatukan.
// ---------------------------------------------------------------------------
const DOSIS = 'Dosis milik pendaftaran, bukan bagian dari nama komoditas.';
const DOSIS_PEMBAWA = 'Dosis beserta pembawa atau basisnya; tetap keterangan pendaftaran.';

// `synonim` menentukan apakah label yang kalah naik jadi synonyms pada pemenang —
// pola yang sama dengan gabung-id-zat-kembar.mjs. Dosis: tidak, itu anotasi
// pendaftaran dan tempatnya memang pada entitas yang digantikan. Penanda fase:
// ya, "Karet (TM)" nama sungguhan yang akan diketik orang, dan kalau tertinggal
// pada entitas yang digantikan, pencarian tidak menemukannya lagi.
const KURUNG = {};
const derau = (isi, dasar = DOSIS, synonim = false) => { for (const k of isi) KURUNG[k] = { jenis: 'derau', dasar, synonim }; };
const pembeda = (isi, dasar) => { for (const k of isi) KURUNG[k] = { jenis: 'pembeda', dasar }; };

// --- Dosis murni: angka, satuan, dan pembaginya saja -------------------------
derau([
  '0,0625 g/l', '0,12 ml/l', '0,1375 ml/l', '0,2 ml/l', '0,25 ml/l', '0,3 ml/l',
  '0,375-0,5 l/ha', '0,4 ml/l', '0,5 - 1,5 l/ha', '0,5 g/l', '0,5 ml/l', '0,6 g/l',
  '0,625 ml/l', '0,75 - 1 l/ha', '0,75 - 1,25 l/ha', '0,75 - 1,5 l/ha', '0,75 -1,5 l/ha',
  '0,75 ml/l', '1 - 1,25 l/ha', '1 - 2 l/ha', '1 - 2 ml/l', '1 - 3 l/ha', '1 g/l',
  '1 ml/l', '1,125 g/l', '1,125 ml/l', '1,2 g/l', '1,5 - 2 l/ha', '1,5 - 2,5 g/l',
  '1,5 - 2,5 l/ha', '1,5 - 3 l/ha', '1,5 g/l', '1,5 ml/l', '1,5-2 l/ha', '1,875 g/l',
  '1-2 l/ha', '10 kg/ha', '10 ml/kg', '125 - 250 ml/ha', '15 kg/ha', '187,5 ml/ha',
  '2 - 2,5 l/ha', '2 - 3 l/ha', '2 - 4 l/ha', '2 g/l', '2 kg/ha', '2 ml/l',
  '2,25 - 3 l/ha', '2,25 g/l', '2,25 ml/l', '2,5 - 3 l/ha', '2,5 ml/l', '2-4 l/ha',
  '20 kg/ha', '25 kg/ha', '3 - 6 l/ha', '3 g/l', '3 ml/l', '3,75 g/l', '30 - 50 g/ha',
  '4 g/l', '4 ml/l', '5 g/l', '6 g/l', '60-100 ml/ha', '7,5 kg/ha', '700 ml/ha',
  '75 - 125 ml/ha',
]);

// --- Dosis yang ikut menyebut pembawa, basis, atau waktunya ------------------
// Tetap dosis: yang berubah cuma penyebutnya, bukan tanamannya. Semua ini melekat
// pada satu entitas saja, jadi tidak ada pembedaan yang hilang.
derau([
  '0,75 g/10 L air', '0,75 g/10 L air (5,6,7 MST)', '1 g/l air/aplikasi',
  '150 ml/10L/pohon', '150 ml/l solar', '175 ml/ha/aplikasi  (pada 5 HST, 25 HST dan 45 HST)',
  '20 ml/kg benih', '25 ml/100 ml', '3 tablet/500 l/ha', '3,75 ml/l air/pohon',
  '8 ml/l/pohon', 'Penyemprotan volume tinggi:  25 g/ha (20 HST dan 40 HST)',
  'Perendaman :  1 gram/200 ml', 'Perendaman:  0,5 tablet/50 liter',
], DOSIS_PEMBAWA);

// --- Klaim khasiat yang bocor ke nama sasaran --------------------------------
derau(
  ['Meningkatkan jumlah daun, hasil tanaman, hasil/petak, hasil/ha'],
  'Klaim khasiat produk, bukan keterangan tentang tanamannya. Tanamannya tetap bawang merah.',
);

// --- Fase tanaman tahunan: belum vs sudah menghasilkan -----------------------
// PUTUSAN YANG BERUBAH, DAN KENAPA.
// Putaran pertama menahan TBM dan TM sebagai pembeda, dengan alasan penyemprotan di
// sawit muda dan sawit panen tidak sebanding. Alasan itu benar, tetapi tempatnya
// keliru: TBM/TM adalah FASE PERTUMBUHAN, dan spesifikasi ini sudah punya Stage
// beserta lima belas skala fase untuk menyatakannya. Memodelkannya sebagai komoditas
// yang berbeda adalah kesalahan kategori — dan kesalahan yang sudah ditolak lebih
// dulu oleh collection.scope berkas ini sendiri: "keduanya sifat siklus, bukan
// komoditas yang berbeda".
//
// Kebijakan itu bahkan sudah diterapkan setengah jalan sebelum alat ini ada: delapan
// entitas membawa "(TM)" di dalam synonyms-nya sementara "Karet TM" berdiri sendiri
// sebagai entitas. Menahan TBM/TM berarti mengabadikan setengah jalan itu.
//
// Yang hilang tidak hilang: bunyi asli tetap terbaca pada entitas yang digantikan,
// pada mappings KEMENTAN, pada commodity_label rekaman produk, dan kini juga pada
// synonyms pemenang. Perbedaan perlakuan antara sawit muda dan sawit panen memang
// nyata, tetapi ia sifat PENGGUNAAN, dan tempatnya di Stage — bukan di identitas
// tanamannya.
derau(
  ['TBM', 'TM'],
  'Fase tanaman tahunan, bukan komoditas yang berbeda. Perbedaannya dinyatakan lewat Stage, sejalan dengan collection.scope.',
  true,
);

// --- Sistem olah tanah -------------------------------------------------------
pembeda(
  ['TOT', 'tanpa olah tanah', 'olah tanah minimum'],
  'Sistem olah tanah menentukan kapan dan berapa herbisida dipakai; bukan tanaman yang sama dalam keadaan yang sama.',
);

// --- Sistem tanam padi -------------------------------------------------------
pembeda(
  ['Tapin', 'tapin', 'Tanam Pindah', 'Tanam pindah', 'TABELA', 'Tabela', 'tabela', 'tanam benih langsung'],
  'Tanam pindah dan tabur benih langsung dua sistem budidaya yang berbeda; jadwal gulma dan herbisidanya ikut berbeda.',
);

// --- Waktu aplikasi terhadap pertumbuhan gulma -------------------------------
pembeda(
  ['pra tumbuh', 'purna tumbuh', 'pre-emergence, early post emergence', 'Pre‑Plant Incorporated (PPI)'],
  'Waktu aplikasi terhadap pertumbuhan gulma. Herbisida pra tumbuh dan purna tumbuh tidak saling menggantikan.',
);

// --- Siklus tebu -------------------------------------------------------------
pembeda(
  ['Plantcane', 'plant cane', 'ratooncane'],
  'Tanam baru dan keprasan dua siklus tebu yang berbeda.',
);

// --- Spesies dan konteks kehutanan ------------------------------------------
pembeda(
  ['Acacia mangium', 'Acacia crassicarpa', 'Eucalyptus', 'HTI'],
  'Menyebut spesies atau konteks penanaman; dua spesies berbeda tidak boleh disatukan atas nama kerapian.',
);

// --- Bukan tanaman sama sekali ----------------------------------------------
pembeda(
  ['Rain Fastness', 'Karantina dan Pra-pengapalan (QPS)', 'Corn Mill', 'Corn mill'],
  'Bukan keterangan tentang tanaman — ketahanan hujan, konteks karantina, atau bentuk olahan pakan.',
);

// ---------------------------------------------------------------------------
// Penanda yang sama, ditulis tanpa kurung
// ---------------------------------------------------------------------------
// Registri tidak konsisten meletakkan penandanya: ada "Karet (TM)" dan ada "Karet
// TM"; ada "Kedelai (TOT)" dan "Kedelai TOT". Dua puluh enam label menuliskannya
// telanjang. Kalau hanya isi kurung yang dibaca, keduanya tetap jadi dua entitas
// dan pemecahan yang hendak diperbaiki cuma pindah tempat.
//
// Sebagian penanda juga punya dua bentuk yang artinya sama persis — Tapin adalah
// singkatan tanam pindah, Tabela singkatan tabur/tanam benih langsung — jadi
// keduanya dinormalkan ke satu bentuk sebelum dibandingkan. Ini bukan tafsir:
// singkatan itu memang kepanjangannya sendiri, dan registri memakai keduanya
// bergantian pada baris yang sama.
const PENANDA = [
  [/\btbm\b/gi, 'tbm'],
  [/\btm\b/gi, 'tm'],
  [/\btot\b/gi, 'tot'],
  [/\btanpa olah tanah\b/gi, 'tot'],
  [/\bolah tanah minimum\b/gi, 'olah tanah minimum'],
  [/\btapin\b/gi, 'tapin'],
  [/\btanam pindah\b/gi, 'tapin'],
  [/\btabela\b/gi, 'tabela'],
  [/\btanam benih langsung\b/gi, 'tabela'],
  [/\btabur benih langsung\b/gi, 'tabela'],
  [/\bpra tumbuh\b/gi, 'pra tumbuh'],
  [/\bpurna[- ]tumbuh\b/gi, 'purna tumbuh'],
  [/\bpre-emergence, early post emergence\b/gi, 'pre-emergence'],
  [/\bpre‑plant incorporated \(ppi\)/gi, 'ppi'],
  [/\bplantcane\b/gi, 'plant cane'],
  [/\bplant cane\b/gi, 'plant cane'],
  [/\bratooncane\b/gi, 'ratooncane'],
  [/\bacacia mangium\b/gi, 'acacia mangium'],
  [/\bacacia crassicarpa\b/gi, 'acacia crassicarpa'],
  [/\bhti\b/gi, 'hti'],
];

// ---------------------------------------------------------------------------
// Pemuatan
// ---------------------------------------------------------------------------
const bacaJson = (p) => JSON.parse(readFileSync(join(VOCAB, p), 'utf8'));
const kunciLarik = (o) => (Array.isArray(o) ? null : Object.keys(o).find((k) => Array.isArray(o[k])));
const larik = (o) => (Array.isArray(o) ? o : o[kunciLarik(o)]);

const bungkusRegistri = bacaJson('commodity-registri.json');
const bungkusKurasi = bacaJson('commodity.json');
const registri = larik(bungkusRegistri);
const kurasi = larik(bungkusKurasi);
const semua = [...kurasi, ...registri];

// ---------------------------------------------------------------------------
// Pokok nama: label sesudah kurung derau dilepas, kurung pembeda dipertahankan
// ---------------------------------------------------------------------------
// Penjaga: setiap isi kurung yang ada di kosakata harus punya putusan di tabel.
// Dipindai tersendiri, bukan sebagai efek samping penurunan pokok nama — supaya
// penjaganya tidak ikut mati begitu cara menurunkan pokok nama berubah.
const belumDiputus = new Set();
function periksaKurung(daftar) {
  for (const e of daftar) {
    for (const m of e.label.id.matchAll(/\(([^()]*(?:\([^()]*\)[^()]*)*)\)?/g)) {
      const isi = m[1].trim();
      if (isi && !KURUNG[isi]) belumDiputus.add(isi);
    }
  }
}

function pokok(label) {
  // Kurung derau dilepas dulu; kurung pembeda dibiarkan supaya penandanya masih
  // terbaca pada langkah berikutnya, apa pun bentuk penulisannya.
  let sisa = bersihkanLabel(label).toLowerCase();
  // Lalu penandanya ditarik dari seluruh teks — di dalam kurung maupun telanjang.
  const tahan = new Set();
  for (const [pola, baku] of PENANDA) {
    if (pola.test(sisa)) { tahan.add(baku); sisa = sisa.replace(pola, ' '); }
    pola.lastIndex = 0;
  }
  const bersih = sisa
    .replace(/[()]/g, ' ')
    .replace(/[,:.\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // "Hutan Tanaman Industri (HTI) Acacia mangium" — di situ HTI bukan keterangan
  // tambahan, ia singkatan dari pokok namanya sendiri yang sudah tertulis lengkap.
  // Sebagai pembeda ia hanya memisahkan entitas dari kembarannya tanpa alasan.
  if (tahan.has('hti') && bersih.includes('hutan tanaman industri')) tahan.delete('hti');
  return tahan.size ? `${bersih} [${[...tahan].sort().join('][')}]` : bersih;
}

// ---------------------------------------------------------------------------
// Berapa kali tiap entitas benar-benar dipakai — menentukan siapa yang menang
// ---------------------------------------------------------------------------
const NDJSON_PRODUK = join(VOCAB, 'product', 'pestisida.ndjson');
const NDJSON_VARIETAS = join(VOCAB, 'variety', 'varietas.ndjson');
const barisProduk = readFileSync(NDJSON_PRODUK, 'utf8').split('\n');
const barisVarietas = readFileSync(NDJSON_VARIETAS, 'utf8').split('\n');

const pakai = new Map();
const catat = (id) => id && pakai.set(id, (pakai.get(id) ?? 0) + 1);
for (const b of barisProduk) {
  if (!b.trim()) continue;
  for (const u of JSON.parse(b).label_uses ?? []) catat(u.commodity?.id);
}
for (const b of barisVarietas) {
  if (!b.trim()) continue;
  catat(JSON.parse(b).commodity?.id);
}

// ---------------------------------------------------------------------------
// Kelompok dan pemenangnya
// ---------------------------------------------------------------------------
const hidup = semua.filter((e) => e.lifecycle?.status !== 'superseded');
periksaKurung(hidup);
if (belumDiputus.size) {
  console.error('BERHENTI — isi kurung tanpa putusan di tabel KURUNG:');
  for (const s of [...belumDiputus].sort()) console.error(`  ${JSON.stringify(s)}`);
  console.error('\nTambahkan putusannya ke tabel, jangan biarkan skrip menebak.');
  process.exit(1);
}

const rumpun = new Map();
for (const e of hidup) {
  const k = pokok(e.label.id);
  if (!k) continue;
  (rumpun.get(k) ?? rumpun.set(k, []).get(k)).push(e);
}

const berkurung = (e) => /\(/.test(e.label.id);
const terkurasi = (e) => kurasi.includes(e);

// Yang menang, berurutan: entitas terkurasi (jauh lebih kaya — punya nama ilmiah,
// pola panen, dan skala fase bawaan) → pemegang skala fase bawaan → label tanpa
// kurung → paling banyak dipakai → label terpendek → id terkecil. Tiga tingkat
// terakhir sama dengan tiebreaker pada satuan-aksi-zat-ejaan.mjs.
//
// Tingkat kedua ditambahkan sesudah putaran pertama merusak sesuatu: op:cmd:00001009
// memegang skala BBCH kopi tetapi kalah ke entitas yang tidak memegangnya, dan
// tautan fenologi itu lenyap tanpa suara sampai L28 menyalak. Yang kalah kadang
// justru yang lebih kaya; jumlah rekaman bukan ukuran nilai.
const urut = (a, b) =>
  Number(terkurasi(b)) - Number(terkurasi(a)) ||
  Number(Boolean(b.default_stage_scale)) - Number(Boolean(a.default_stage_scale)) ||
  Number(berkurung(a)) - Number(berkurung(b)) ||
  (pakai.get(b.id) ?? 0) - (pakai.get(a.id) ?? 0) ||
  a.label.id.length - b.label.id.length ||
  a.id.localeCompare(b.id);

// Sisa dari langkah pembersihan label — lihat catatannya di atas bersihkanLabel.
// Label pemenang yang MASIH berdosis harus dibersihkan. Sebagian rumpun tidak punya
// satu pun entitas bernama polos — tidak ada "Padi sawah", yang ada cuma "Padi sawah
// (2 ml/l )" dan sepuluh saudaranya. Membiarkan pemenangnya apa adanya berarti
// mengangkat derau registri jadi nama kanonik, kekeliruan yang sama dengan
// "2 - Octyl - 2H _ Isothiazol - 3 One" pada penggabungan zat. Yang ditulis di sini
// bukan nama karangan: ia kata-kata registri sendiri sesudah anotasinya dilepas.
// Seperti bersihkanLabel, tetapi HANYA melepas kurung yang bukan nama — dosis dan
// klaim. Penanda yang layak jadi synonyms dibiarkan, sehingga hasilnya persis bentuk
// yang pantas dicari orang: "Karet (TBM) (1,5 - 3 l/ha)" jadi "Karet (TBM)".
function labelPenanda(label) {
  let sisa = label;
  for (const m of label.matchAll(/\(([^()]*(?:\([^()]*\)[^()]*)*)\)?/g)) {
    const isi = m[1].trim();
    const k = KURUNG[isi];
    if (k && k.jenis === 'derau' && !k.synonim) sisa = sisa.replace(m[0], ' ');
  }
  return sisa
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s+/g, ' ')
    .replace(/[,:.\s]+$/g, '')
    .trim();
}

function bersihkanLabel(label) {
  let sisa = label;
  for (const m of label.matchAll(/\(([^()]*(?:\([^()]*\)[^()]*)*)\)?/g)) {
    const isi = m[1].trim();
    if (KURUNG[isi]?.jenis === 'derau') sisa = sisa.replace(m[0], ' ');
  }
  // Spasi nyasar di dalam kurung yang bertahan ikut dirapikan: registri menulis
  // "Padi sawah ( TOT )" dan "Budidaya kelapa sawit (TM )", dan itu jadi nama resmi
  // yang tampil di layar. Yang berubah cuma spasinya, bukan satu huruf pun isinya.
  //
  // Hanya koma, titik dua, titik, dan spasi yang dipangkas dari ujung. Kurung TIDAK
  // ikut: pada label yang pembedanya bertahan, kurung tutup itu miliknya —
  // "Karet (TBM)" tidak boleh berakhir jadi "Karet (TBM".
  return sisa
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s+/g, ' ')
    .replace(/[,:.\s]+$/g, '')
    .trim();
}

const gabung = [];
for (const [k, anggota] of [...rumpun.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  if (anggota.length < 2) continue;
  const urutan = anggota.slice().sort(urut);
  const menang = urutan[0];
  // Id pemenang dan label kanonik dipilih terpisah. Id ikut yang paling banyak
  // dipakai — itu yang menentukan rujukan mana yang paling sedikit berpindah.
  // Label ikut penulisan terbaik yang ADA di rumpun itu: registri menuliskan
  // penanda yang sama dengan dua cara ("Kelapa Sawit (TBM)" dan "Kelapa Sawit
  // TBM"), dan yang berkurung bentuk yang jauh lebih lazim — 33 label lawan
  // segelintir. Tanpa pemisahan ini, nama kanonik satu tanaman berkurung dan
  // tanaman sebelahnya telanjang, semata karena rekaman mana yang kebetulan lebih
  // banyak. Yang dipilih tetap kata-kata registri sendiri, bukan karangan.
  const adaPembeda = k.includes('[');
  const labelBaru = anggota
    .map((e) => bersihkanLabel(e.label.id))
    .sort(
      // Huruf pertama kapital didahulukan — itu nama tanaman, bukan kalimat lepas.
      // Sesudah itu localeCompare justru mendahulukan huruf kecil, dan di sini itu
      // yang benar: ejaan Indonesia menulis "Bawang putih", bukan "Bawang Putih".
      (a, b) =>
        (adaPembeda ? Number(/\(/.test(b)) - Number(/\(/.test(a)) : 0) ||
        Number(/^[A-Z]/.test(b)) - Number(/^[A-Z]/.test(a)) ||
        a.length - b.length ||
        a.localeCompare(b),
    )[0];
  gabung.push({
    pokok: k,
    menang,
    kalah: urutan.slice(1),
    labelBaru: labelBaru !== menang.label.id ? labelBaru : null,
  });
}

// ---------------------------------------------------------------------------
// Laporan
// ---------------------------------------------------------------------------
const kalahSemua = new Map(); // id kalah -> id menang
for (const g of gabung) for (const e of g.kalah) kalahSemua.set(e.id, g.menang.id);

console.log(`Isi kurung diputus  : ${Object.keys(KURUNG).length} (${Object.values(KURUNG).filter((x) => x.jenis === 'derau').length} derau, ${Object.values(KURUNG).filter((x) => x.jenis === 'pembeda').length} pembeda)`);
console.log(`Komoditas hidup     : ${hidup.length}`);
console.log(`Rumpun disatukan    : ${gabung.length}`);
console.log(`Entitas digantikan  : ${kalahSemua.size}  (${hidup.length} → ${hidup.length - kalahSemua.size})`);
console.log(`Rujukan produk      : ${[...pakai].filter(([id]) => kalahSemua.has(id)).reduce((a, [, n]) => a + n, 0)} penggunaan berlabel ikut dialihkan`);
const dibersihkan = gabung.filter((g) => g.labelBaru);
console.log(`Label dibaku        : ${dibersihkan.length} pemenang yang labelnya diganti penulisan terbaik dalam rumpunnya`);
for (const g of dibersihkan) console.log(`   ${JSON.stringify(g.menang.label.id)} -> ${JSON.stringify(g.labelBaru)}`);
console.log('');

const batas = process.argv.includes('--semua') ? gabung.length : 8;
for (const g of gabung.slice().sort((a, b) => b.kalah.length - a.kalah.length).slice(0, batas)) {
  console.log(`  ${g.labelBaru ?? g.menang.label.id}  <-  ${g.kalah.length} entitas${g.labelBaru ? `   (label pemenang dibersihkan dari ${JSON.stringify(g.menang.label.id)})` : ''}`);
  console.log(`     ${g.kalah.map((e) => JSON.stringify(e.label.id)).slice(0, 4).join(' ')}${g.kalah.length > 4 ? ' …' : ''}`);
}

// Yang sengaja TIDAK disatukan, supaya keputusannya terbaca, bukan tersirat.
// Yang menarik bukan "stem mana yang punya pembeda", melainkan stem mana yang punya
// LEBIH DARI SATU pembeda — persis kelompok yang akan tergabung keliru seandainya
// kurungnya diperlakukan derau semua.
const tanpaPembeda = new Map();
for (const [k, a] of rumpun) {
  const pokokSaja = k.replace(/\s*\[.*\]$/, '');
  const tanda = k.includes('[') ? k.slice(k.indexOf('[')) : '(polos)';
  (tanpaPembeda.get(pokokSaja) ?? tanpaPembeda.set(pokokSaja, new Map()).get(pokokSaja)).set(tanda, a.length);
}
const tertahan = [...tanpaPembeda].filter(([, v]) => v.size > 1).sort((a, b) => b[1].size - a[1].size);
console.log(`\nDitahan karena pembeda: ${tertahan.length} tanaman yang varian pembedanya lebih dari satu`);
console.log(`  (semuanya akan tergabung keliru kalau kurung diperlakukan derau semua)`);
for (const [k, v] of tertahan.slice(0, 8))
  console.log(`  ${k.padEnd(34)} ${[...v].map(([t, n]) => `${t}=${n}`).join('  ')}`);

// Penjaga tabrakan: dua entitas yang bertahan tidak boleh berakhir dengan label
// yang sama persis. Pembakuan label bisa mempertemukan dua rumpun yang pokoknya
// berbeda tipis — "Penyiapan lahan" dan "Persiapan lahan" — dan nama kembar pada
// dua id berbeda persis kerusakan yang sedang diperbaiki, cuma berpindah tempat.
const labelAkhir = new Map();
for (const e of hidup) {
  if (kalahSemua.has(e.id)) continue;
  const g = gabung.find((x) => x.menang.id === e.id);
  const label = g?.labelBaru ?? bersihkanLabel(e.label.id);
  (labelAkhir.get(label) ?? labelAkhir.set(label, []).get(label)).push(e.id);
}
// Dua skala fase berbeda dalam satu rumpun bukan hal yang boleh dipilih skrip:
// itu berarti dua entitas yang mengaku tanaman yang sama memakai kunci fenologi
// yang berbeda, dan salah satunya keliru.
const skalaBentrok = gabung
  .map((g) => [g, new Set([g.menang, ...g.kalah].map((e) => e.default_stage_scale?.id).filter(Boolean))])
  .filter(([, sk]) => sk.size > 1);
if (skalaBentrok.length) {
  console.error('BERHENTI — rumpun dengan lebih dari satu skala fase bawaan:');
  for (const [g, sk] of skalaBentrok) console.error(`  ${g.pokok}  ${[...sk].join(' ')}`);
  process.exit(1);
}

const tabrakan = [...labelAkhir].filter(([, ids]) => ids.length > 1);
if (tabrakan.length) {
  console.log(`\nTABRAKAN LABEL: ${tabrakan.length} nama dipakai lebih dari satu entitas`);
  for (const [l, ids] of tabrakan) console.log(`  ${JSON.stringify(l)}  ${ids.join(' ')}`);
}

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menerapkan.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Terapkan
// ---------------------------------------------------------------------------
const olehId = new Map(semua.map((e) => [e.id, e]));

for (const g of gabung) {
  const menang = olehId.get(g.menang.id);
  menang.mappings ??= [];
  menang.synonyms ??= [];
  for (const kalah of g.kalah) {
    const e = olehId.get(kalah.id);
    // Pemetaan KEMENTAN dibawa ke pemenang: string itu bunyi harfiah registri, dan
    // tanpanya penurunan ulang tidak lagi menemukan entitas mana pun untuk baris
    // penggunaan yang menyebutnya.
    for (const m of e.mappings ?? []) {
      if (!menang.mappings.some((x) => x.scheme === m.scheme && x.id === m.id)) menang.mappings.push({ ...m });
    }
    // Label yang kalah TIDAK naik jadi synonyms: "Cabai (1,5 ml/l)" bukan nama lain
    // untuk cabai, ia nama cabai yang kejatuhan dosis. Tempatnya memang pada entitas
    // yang digantikan, yang tetap ada dan tetap bisa ditelusuri.
    //
    // Tetapi synonyms yang MEMANG sudah dikurasi pada yang kalah ikut naik: itu nama
    // sungguhan, dan kalau tertinggal pada entitas yang digantikan, pencarian tidak
    // menemukannya lagi.
    for (const sin of e.synonyms ?? []) if (!menang.synonyms.includes(sin)) menang.synonyms.push(sin);
    // Label yang kalah naik jadi synonyms HANYA kalau yang membedakannya bukan
    // sekadar dosis. "Karet (TBM)" naik; "Karet (2 ml/l )" tidak, karena sesudah
    // dosisnya dilepas ia sama persis dengan nama pemenang dan tidak menambah apa pun.
    const bentukCari = labelPenanda(e.label.id);
    const kanonik = g.labelBaru ?? menang.label.id;
    if (bentukCari !== kanonik && !menang.synonyms.includes(bentukCari)) menang.synonyms.push(bentukCari);
    // Skala fase bawaan dipindahkan, bukan disalin: dibiarkan pada yang kalah, ia
    // jadi tautan fenologi dari entitas yang tidak lagi tercantum di applies_to
    // skalanya, dan L28 menolaknya — dengan benar.
    if (e.default_stage_scale) {
      menang.default_stage_scale ??= e.default_stage_scale;
      delete e.default_stage_scale;
    }
    e.lifecycle = {
      ...(e.lifecycle ?? {}),
      status: 'superseded',
      updated_at: STAMP,
      superseded_by: { id: menang.id },
    };
  }
  if (g.labelBaru) {
    // Bunyi asli pemenang tetap terbaca lewat mappings KEMENTAN miliknya sendiri,
    // yang memang tidak disentuh — jadi tidak ada jejak yang hilang.
    menang.label = { ...menang.label, id: g.labelBaru };
  }
  menang.mappings.sort((a, b) => a.scheme.localeCompare(b.scheme) || a.id.localeCompare(b.id));
  menang.synonyms.sort();
  menang.lifecycle = { ...(menang.lifecycle ?? {}), updated_at: STAMP };
}

// Dosis dilepas dari SELURUH label yang bertahan, bukan cuma dari pemenang rumpun.
// Tiga belas entitas berdiri sendiri di pokoknya — "Kelapa Sawit (TM) (60-100
// ml/ha)", "Strawberi (1,5 g/l)" — jadi tidak pernah masuk rumpun mana pun, dan
// kalau pembersihan hanya berlaku bagi pemenang, dosisnya menetap sebagai nama
// resmi hanya karena kebetulan tidak ada kembarannya.
let labelTunggal = 0;
for (const e of hidup) {
  if (kalahSemua.has(e.id)) continue;
  const baru = bersihkanLabel(e.label.id);
  if (baru === e.label.id) continue;
  e.label = { ...e.label, id: baru };
  e.lifecycle = { ...(e.lifecycle ?? {}), updated_at: STAMP };
  labelTunggal++;
}

// Ratakan rantai penggantian. Penyatuan berjalan bertahap: "Karet (TBM) (1,5 - 3
// l/ha)" digantikan "Karet (TBM)" pada putaran pertama, lalu "Karet (TBM)" sendiri
// digantikan "Karet" pada putaran berikutnya — dan yang pertama jadi menunjuk entitas
// yang sudah mati. L29 menolaknya, dengan benar: entitas yang digantikan disimpan
// supaya ejaan aslinya bisa ditelusuri, bukan supaya jadi persinggahan.
const hidupId = new Set(semua.filter((e) => e.lifecycle?.status !== 'superseded').map((e) => e.id));
const ujung = (id, jejak = new Set()) => {
  if (hidupId.has(id) || jejak.has(id)) return id;
  jejak.add(id);
  const lanjut = olehId.get(id)?.lifecycle?.superseded_by?.id;
  return lanjut ? ujung(lanjut, jejak) : id;
};
let rantai = 0;
for (const e of semua) {
  const tuju = e.lifecycle?.superseded_by?.id;
  if (!tuju) continue;
  const akhir = ujung(tuju);
  if (akhir === tuju) continue;
  e.lifecycle = { ...e.lifecycle, superseded_by: { id: akhir }, updated_at: STAMP };
  rantai++;
}

const tulisJson = (nama, bungkus) => writeFileSync(join(VOCAB, nama), JSON.stringify(bungkus, null, 2) + '\n');
tulisJson('commodity-registri.json', bungkusRegistri);
tulisJson('commodity.json', bungkusKurasi);

// Rekaman produk: hanya commodity.id yang dialihkan. commodity_label dibiarkan.
let ubahProduk = 0;
const produkBaru = barisProduk.map((b) => {
  if (!b.trim()) return b;
  const p = JSON.parse(b);
  let berubah = false;
  for (const u of p.label_uses ?? []) {
    const menang = kalahSemua.get(u.commodity?.id);
    if (!menang) continue;
    u.commodity.id = menang;
    berubah = true;
  }
  if (!berubah) return b;
  ubahProduk++;
  return JSON.stringify(p);
});
writeFileSync(NDJSON_PRODUK, produkBaru.join('\n'));

let ubahVarietas = 0;
const varietasBaru = barisVarietas.map((b) => {
  if (!b.trim()) return b;
  const v = JSON.parse(b);
  const menang = kalahSemua.get(v.commodity?.id);
  if (!menang) return b;
  v.commodity.id = menang;
  ubahVarietas++;
  return JSON.stringify(v);
});
writeFileSync(NDJSON_VARIETAS, varietasBaru.join('\n'));

// Skala fase menunjuk komoditas juga; kalau anchor-nya kalah, L29 akan menolaknya.
let ubahSkala = 0;
for (const nama of ['stage-scale-bbch-bawang.json', 'stage-scale-bbch-brassica-lain.json',
  'stage-scale-bbch-buncis.json', 'stage-scale-bbch-cucurbit.json', 'stage-scale-bbch-daun-tak-berkrop.json',
  'stage-scale-bbch-jagung.json', 'stage-scale-bbch-kacang-tanah.json', 'stage-scale-bbch-kedelai.json',
  'stage-scale-bbch-kentang.json', 'stage-scale-bbch-kopi.json', 'stage-scale-bbch-kubis.json',
  'stage-scale-bbch-solanaceae.json', 'stage-scale-bbch-umbi-batang.json', 'stage-scale-bbch-padi.json']) {
  const p = join(VOCAB, nama);
  let teks;
  try { teks = readFileSync(p, 'utf8'); } catch { continue; }
  let baru = teks;
  for (const [kalah, menang] of kalahSemua) baru = baru.split(`"${kalah}"`).join(`"${menang}"`);
  if (baru !== teks) { writeFileSync(p, baru); ubahSkala++; }
}

console.log(`\nDitulis:`);
console.log(`  commodity-registri.json, commodity.json  — ${kalahSemua.size} entitas jadi superseded, ${labelTunggal} label lain dibersihkan dari dosis, ${rantai} rantai penggantian diratakan`);
console.log(`  product/pestisida.ndjson                 — ${ubahProduk} rekaman`);
console.log(`  variety/varietas.ndjson                  — ${ubahVarietas} rekaman`);
console.log(`  skala fase                               — ${ubahSkala} berkas`);
