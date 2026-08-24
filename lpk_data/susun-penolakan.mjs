// Menyusun peta keterukuran alasan panen ditolak — bagian no. 7 yang bisa dijawab data.
//
//   node lpk_data/susun-penolakan.mjs            # periksa saja
//   node lpk_data/susun-penolakan.mjs --tulis    # tulis docs/22-apa-yang-membuat-panen-ditolak.md
//
// PRASYARAT: ruang lingkup terurai harus sudah ditarik.
//   node lpk_data/tarik-lingkup.mjs 1
//
// APA YANG DIJAWAB BERKAS INI, DAN APA YANG TIDAK
// Alasan panen ditolak itu sedikit dan konkret: residu pestisida, aflatoksin, kadar air,
// benda asing, logam berat, cemaran mikroba. Tetapi menyebut alasannya saja tidak menolong
// siapa pun — yang menolong adalah mengetahui apakah alasan itu BISA DIUKUR di sini, oleh
// siapa, dan untuk komoditas apa. Itu yang dijawab berkas ini, seluruhnya dari ruang lingkup
// akreditasi yang sudah dipanen.
//
// Yang TIDAK dijawab: berapa batasnya. Angka batas milik no. 17, dan menaruh angka tanpa
// instrumennya di sini akan membuat tabel yang terlihat pasti padahal tidak punya dasar.
// Yang disebut cuma nama peraturan yang mengaturnya, tanpa satu pun angkanya disalin.
//
// KENAPA ANGKANYA LANTAI, BUKAN JUMLAH SEBENARNYA
// Lingkup terurai per parameter hanya ada untuk laboratorium yang sudah pindah ke aplikasi
// direktori KAN — 174 dari 1.671 yang terbit di papan resminya. Sebuah parameter yang di
// sini tercatat "3 laboratorium" bisa saja punya tiga puluh; yang tidak bisa terjadi
// sebaliknya. Tiap angka di bawah dibaca sebagai LANTAI.
//
// Residu pestisida memperlihatkannya paling terang: di sini tercatat 2 laboratorium, padahal
// ringkasan lingkup di papan resmi menyebut 17. Keduanya benar pada sumbernya masing-masing,
// dan yang 17 itu yang lebih dekat ke kenyataan. Selisih itu ditulis di dokumennya, bukan
// disembunyikan dengan memilih angka yang lebih enak.
//
// PENANDANYA DITULIS SATU PER SATU SUPAYA BISA DIBANTAH SATU PER SATU
// Tidak ada pencocokan samar. Tiap alasan penolakan membawa daftar kata yang menandainya
// di teks lingkup, dan daftar itu ada di berkas ini, bukan tersembunyi di dalam model.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const AKAR = join(DIR, '..');
const LINGKUP = join(DIR, 'raw', 'lingkup');
const tulis = process.argv.includes('--tulis');

// Enam alasan penolakan, penandanya, dan peraturan yang mengaturnya. Nama peraturan
// disebut sebagai ALAMAT, bukan sebagai kutipan: tidak satu pun angka batasnya disalin
// ke sini, karena angka tanpa pasalnya adalah klaim tanpa dasar.
const ALASAN = [
  {
    nama: 'Residu pestisida',
    tanda: /residu\s*pestisida|pestici(de|da)/i,
    diatur: 'Batas maksimum residu — no. 17, belum berdiri. Acuannya SNI 7313 dan Codex MRL.',
    kenapa: 'Penolakan paling mahal, karena baru ketahuan setelah panen sampai di pembeli.',
  },
  {
    nama: 'Aflatoksin',
    tanda: /aflatoksin|aflatoxin/i,
    diatur: 'Perka BPOM tentang batas maksimum cemaran mikotoksin dalam pangan olahan.',
    kenapa: 'Alasan penolakan ekspor lada, kakao, jagung, dan kacang tanah yang paling sering.',
  },
  {
    nama: 'Mikotoksin lain',
    tanda: /okratoksin|ochratoxin|deoksinivalenol|zearalenon|fumonisin/i,
    diatur: 'Perka BPOM yang sama; okratoksin A punya batasnya sendiri untuk kopi.',
    kenapa: 'Okratoksin A pada kopi diperiksa pembeli Eropa meski tidak diwajibkan di sini.',
  },
  {
    nama: 'Logam berat',
    tanda: /\btimbal\b|\bPb\b|kadmium|\bCd\b|merkuri|\bHg\b|\barsen\b/i,
    diatur: 'Perka BPOM tentang batas maksimum cemaran logam berat dalam pangan olahan.',
    kenapa: 'Terbawa dari tanah dan air irigasi, bukan dari perlakuan — tidak bisa dicuci hilang.',
  },
  {
    nama: 'Cemaran mikroba',
    tanda: /salmonella|escherichia|coliform|angka lempeng|kapang|khamir/i,
    diatur: 'Perka BPOM tentang batas maksimum cemaran mikroba dalam pangan olahan.',
    kenapa: 'Menentukan lolos-tidaknya pangan segar asal tumbuhan di pasar modern.',
  },
  {
    nama: 'Kadar air',
    tanda: /kadar\s*air|\bmoisture\b/i,
    diatur: 'SNI mutu per komoditas; juga syarat kontrak pembelian.',
    kenapa: 'Menentukan harga sekaligus memicu tumbuhnya jamur penghasil aflatoksin.',
  },
  {
    nama: 'Benda asing & kotoran',
    tanda: /benda\s*asing|\bkotoran\b|foreign\s*matter/i,
    diatur: 'SNI mutu per komoditas; potongan harga, kadang penolakan.',
    kenapa: 'Paling mudah diperbaiki petani sendiri, dan paling sering diabaikan.',
  },
];

if (!existsSync(LINGKUP)) {
  console.error(`Ruang lingkup terurai belum ada di ${LINGKUP}\nJalankan dulu: node lpk_data/tarik-lingkup.mjs 1`);
  process.exit(1);
}

const lab = new Map();
for (const l of readFileSync(join(DIR, 'lab-uji-tani.ndjson'), 'utf8').split('\n').filter((x) => x.trim())) {
  const x = JSON.parse(l);
  lab.set(x.no_akreditasi, x);
}

// Berkas lingkup dinamai menurut id internal aplikasi layanan, bukan nomor akreditasi.
// Pemetaannya ada di hasil panen daftarnya sendiri — dibaca dari sana alih-alih dikorek
// dari HTML halaman, yang menulis nomornya dengan spasi ekor yang tidak tetap.
const nomorDariId = new Map();
for (const r of JSON.parse(readFileSync(join(DIR, 'raw', 'lpk-1.json'), 'utf8'))) {
  nomorDariId.set(String(r.id), String(r.no_akreditasi ?? '').replace(/\s+/g, ''));
}

const berkas = readdirSync(LINGKUP).filter((f) => f.startsWith('1-'));
const hasil = ALASAN.map((a) => ({ ...a, lab: new Map(), produk: new Map(), baris: 0 }));
let barisTotal = 0; let labTerbaca = 0;

for (const f of berkas) {
  const d = JSON.parse(readFileSync(join(LINGKUP, f), 'utf8'));
  const nomor = nomorDariId.get(String(d.id)) ?? '';
  labTerbaca++;
  for (const r of d.lingkup ?? []) {
    barisTotal++;
    const param = String(r['Parameter yang Diuji'] ?? '');
    const produk = String(r['Jenis Produk atau Bahan yang Diuji'] ?? '').replace(/\s+/g, ' ').trim();
    for (const h of hasil) {
      if (!h.tanda.test(`${param} ${produk}`)) continue;
      h.baris++;
      if (nomor) h.lab.set(nomor, (h.lab.get(nomor) ?? 0) + 1);
      if (produk) h.produk.set(produk, (h.produk.get(produk) ?? 0) + 1);
    }
  }
}

const n = (x) => Number(x ?? 0).toLocaleString('id-ID');
const namaLab = (no) => lab.get(no)?.nama ?? no;
const provLab = (no) => lab.get(no)?.provinsi ?? '';

console.log(`${labTerbaca} laboratorium berlingkup terurai · ${n(barisTotal)} baris lingkup\n`);
for (const h of hasil) {
  console.log(`  ${String(h.lab.size).padStart(3)} lab · ${String(h.baris).padStart(5)} baris  ${h.nama}`);
}

if (!tulis) { console.log('\n(hanya periksa; tambahkan --tulis untuk menulis dokumennya)'); process.exit(0); }

const B = [];
const P = (...x) => B.push(x.join(''));

P('# Apa yang Membuat Panen Ditolak — dan Apakah Bisa Diukur di Sini');
P('');
P('> Dibangkitkan dari ruang lingkup akreditasi laboratorium oleh');
P('> `lpk_data/susun-penolakan.mjs`. Menjawab **separuh** dari no. 7: alasan penolakannya,');
P('> dan apakah alasan itu bisa diukur di Indonesia, oleh siapa, untuk komoditas apa.');
P('>');
P('> **Batasnya tidak ada di sini.** Angka batas milik no. 17; yang disebut di bawah cuma');
P('> nama peraturan yang mengaturnya, tanpa satu pun angkanya disalin.');
P('');
P('---');
P('');
P('## Kenapa setiap angka di halaman ini adalah lantai');
P('');
P(`Lingkup terurai per parameter hanya ada untuk **${labTerbaca} dari 1.671** laboratorium penguji`);
P('berakreditasi aktif — yang sudah pindah ke aplikasi direktori KAN. Sisanya hanya punya');
P('ringkasan satu paragraf di papan resmi, dan ringkasan itu tidak menyebut parameter.');
P('');
P('Artinya: parameter yang di sini tercatat "3 laboratorium" bisa saja punya tiga puluh.');
P('Yang **tidak** bisa terjadi sebaliknya — tidak ada angka di bawah yang kebesaran.');
P('');
P('**Residu pestisida memperlihatkannya paling terang.** Tabel di bawah mencatat');
P(`${n(hasil[0].lab.size)} laboratorium, sementara \`lpk_data/lab-uji-tani.csv\` — yang dibangun dari ringkasan`);
P('lingkup di papan resmi KAN, mencakup seluruh 1.671 — mencatat **17**. Keduanya benar pada');
P('sumbernya masing-masing, dan yang 17 itu yang lebih dekat ke kenyataan. Angka di halaman');
P('ini dipakai untuk melihat **apa yang diuji pada komoditas apa**, bukan untuk menghitung');
P('berapa banyak laboratorium yang ada.');
P('');
P('## Tujuh alasan, dan keterukurannya');
P('');
P('| Alasan | Lab | Baris lingkup | Yang mengaturnya |');
P('|---|---:|---:|---|');
for (const h of hasil) {
  P(`| **${h.nama}** | ${n(h.lab.size)} | ${n(h.baris)} | ${h.diatur} |`);
}
P('');
P('---');
P('');

for (const h of hasil) {
  P(`## ${h.nama}`);
  P('');
  P(`*${h.kenapa}*`);
  P('');
  if (!h.lab.size) {
    P('**Tidak satu pun laboratorium berlingkup terurai menyebut parameter ini.** Itu bukan');
    P('bukti tidak ada yang bisa mengukurnya — lihat catatan lantai di atas — melainkan bukti');
    P('bahwa dari yang terbaca, tidak ada.');
    P('');
    continue;
  }
  P(`**${n(h.lab.size)} laboratorium**, ${n(h.baris)} baris ruang lingkup. Yang mengaturnya: ${h.diatur}`);
  P('');
  P('Komoditas dan bahan yang lingkupnya menyebut parameter ini:');
  P('');
  const produk = [...h.produk.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  for (const [nama, c] of produk) P(`- ${nama} *(${n(c)} baris)*`);
  P('');
  P('| Laboratorium | Provinsi | Baris |');
  P('|---|---|---:|');
  for (const [no, c] of [...h.lab.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)) {
    P(`| ${namaLab(no)} \`${no}\` | ${provLab(no) || '—'} | ${n(c)} |`);
  }
  P('');
}

P('---');
P('');
P('## Yang belum dijawab, dan siapa yang menjawabnya');
P('');
P('- **Berapa batasnya.** Tidak ada satu angka batas pun di halaman ini. Itu no. 17, dan');
P('  memasukkannya ke sini akan membuat tabel yang terlihat pasti padahal pasalnya tidak');
P('  ikut. Halaman ini menyiapkan alamatnya: ke laboratorium mana sampel dikirim.');
P('- **Apakah pembeli benar-benar menolak.** Yang tercatat kemampuan mengukur, bukan');
P('  praktik penolakan. Sebuah parameter bisa terukur rapi dan tidak pernah dipakai menolak;');
P('  sebaliknya, pembeli bisa menolak atas alasan yang tidak ada di daftar mana pun.');
P('- **Tarif dan waktu tunggu pengujian.** Tidak terbit di mana pun; harus ditanyakan');
P('  langsung ke laboratoriumnya.');

writeFileSync(join(AKAR, 'docs/22-apa-yang-membuat-panen-ditolak.md'), B.join('\n') + '\n');
console.log('\nDitulis ke docs/22-apa-yang-membuat-panen-ditolak.md');
