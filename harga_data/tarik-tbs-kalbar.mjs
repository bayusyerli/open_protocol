// Menarik penetapan harga TBS kelapa sawit Kalimantan Barat dari SIDIKH TBS, lalu
// menormalkannya jadi NDJSON yang bisa dibaca pembangun kosakata harga.
//
//   node harga_data/tarik-tbs-kalbar.mjs                 # tarik, gabung, tulis
//   node harga_data/tarik-tbs-kalbar.mjs --dari-berkas   # olah ulang dari mentah/
//
// KENAPA SUMBER INI YANG PERTAMA DI SISI SAWIT
// Ini satu-satunya penetapan TBS provinsi yang ditemukan terbit dalam bentuk TERBACA MESIN.
// Riau, Kalteng, Kaltim, dan Babel menerbitkannya sebagai PDF pindai, JPEG desain, atau
// tangkapan layar WhatsApp. Yang di sini tabel HTML ter-render server: satu GET, tanpa
// autentikasi, tanpa AJAX, dan `robots.txt` berbunyi `Disallow:` kosong.
//
// Diperiksa 23 Agustus 2026: 50 baris, NOL sel kosong, empat periode per bulan, Agustus 2025
// Periode II sampai Agustus 2026 Periode III. Tidak ada satu pun medan orang — pemindaian
// atas seluruh halaman memberi nol untuk nik, nip, telepon, dan surel; dua kemunculan "@"
// keduanya alamat CDN Bootstrap.
//
// INI HARGA YANG DITERIMA PEKEBUN — DAN ITU BUKAN BERARTI SEMUA PEKEBUN
// Seluruh harga lain di repositori ini eceran. Yang ini bukan: ia harga yang WAJIB dibayar
// pabrik kepada pekebun, ditetapkan rapat provinsi. Untuk pertama kalinya ada angka yang
// benar-benar menyentuh sisi petani.
//
// Tetapi batasnya terpasang di dasar hukumnya sendiri, dan wajib ikut sampai ke layar.
// Permentan 01/2018 sudah dicabut Permentan 13/2024, yang berjudul "Pembelian Tandan Buah
// Segar Kelapa Sawit Produksi PEKEBUN MITRA". Penetapan ini secara hukum menaungi pekebun
// plasma dan mitra; PEKEBUN SWADAYA BERADA DI LUAR CAKUPANNYA — dan merekalah mayoritas
// petani sawit Indonesia. Angka di sini bukan harga yang mereka terima, dan menayangkannya
// seolah begitu mengulang persis kekeliruan "harga produsen ternyata harga pengumpul" yang
// docs/16 bagian 4 sudah bongkar untuk beras.
//
// JENDELA BERGULIR — ARSIPNYA JADI MILIK KITA, DAN ITU MENGUBAH CARA BERKAS INI MENULIS
// Halaman sumber hanya memajang sekitar 13 bulan terakhir; yang lebih tua hilang dari sana.
// Karena itu berkas ini TIDAK PERNAH menimpa: ia membaca keluaran sebelumnya, menggabungkan
// baris baru, dan mempertahankan yang sudah tidak ada lagi di sumbernya. Menjalankannya tiap
// bulan membangun riwayat yang tidak bisa didapat sekali tarik — dan sekali satu periode
// hilang tanpa pernah tersimpan, ia hilang selamanya.
//
// TANGGAL HARIANNYA NOMINAL, DAN ITU DINYATAKAN
// Yang ditetapkan PERIODE, bukan hari: I, II, III, IV dalam sebulan. Untuk bisa digambar
// sebagai garis, tiap periode diberi tanggal nominal (1, 8, 15, 22). Medan `nominal: true`
// ikut ditulis supaya penyaji tidak pernah menampilkannya sebagai tanggal penetapan.

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const UA = 'OpenProtocols/0.1 (+https://github.com/bayusyerli/open_protocol) riset harga sawit';
const SUMBER = 'https://sidikhtbs-disbunnak.kalbarprov.go.id/';
const MENTAH = join('harga_data', 'mentah', 'sidikh-tbs-kalbar.html');
const KELUAR = join('harga_data', 'tbs-kalbar.ndjson');

// Kolom umur tanaman, urut seperti di sumbernya. "10-20" satu pita, bukan sebelas.
const UMUR = ['3', '4', '5', '6', '7', '8', '9', '10-20', '21', '22', '23', '24', '25'];
const BULAN = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const PERIODE = { I: 1, II: 2, III: 3, IV: 4 };
// Hari nominal per periode. Bukan tanggal penetapan — lihat kepala berkas.
const HARI_NOMINAL = { 1: 1, 2: 8, 3: 15, 4: 22 };

const TERLARANG = ['nik', 'nip', 'no_telp', 'telepon', 'alamat', 'email', 'first_name', 'last_name', 'jabatan'];

async function tarik() {
  process.stderr.write(`Menarik ${SUMBER}…\n`);
  const r = await fetch(SUMBER, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${SUMBER}: HTTP ${r.status}`);
  const teks = await r.text();
  mkdirSync(join('harga_data', 'mentah'), { recursive: true });
  writeFileSync(MENTAH, teks);
  process.stderr.write(`Mentah disimpan ke ${MENTAH} (${(teks.length / 1024).toFixed(0)} KB)\n`);
  return teks;
}

const dariBerkas = process.argv.includes('--dari-berkas');
if (dariBerkas && !existsSync(MENTAH)) {
  console.error(`--dari-berkas dipakai tetapi ${MENTAH} tidak ada.`);
  process.exit(1);
}
const html = dariBerkas ? readFileSync(MENTAH, 'utf8') : await tarik();

// ---------------------------------------------------------------------------
// Urai
// ---------------------------------------------------------------------------
// Pengurai seadanya, dan itu disengaja: satu tabel, satu bentuk, tanpa dependensi. Kalau
// bentuknya berubah, yang benar adalah BERHENTI — bukan menebak. Karena itu tiap harapan
// diperiksa dan pelanggarannya menghentikan proses, bukan menghasilkan baris setengah jadi.
const lepas = (s) =>
  s.replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ').trim();

const angka = (s) => {
  const t = String(s).replace(/[^0-9.,-]/g, '').replace(/,/g, '');
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

const tabel = html.match(/<table[\s\S]*?<\/table>/g) ?? [];
if (tabel.length < 1) {
  console.error('BERHENTI — tidak ada satu pun tabel di halaman. Bentuk sumbernya berubah.');
  process.exit(1);
}

const baris = [];
for (const tr of tabel[0].match(/<tr[\s\S]*?<\/tr>/g) ?? []) {
  const td = (tr.match(/<td[\s\S]*?<\/td>/g) ?? []).map(lepas);
  if (td.length < 6 + UMUR.length) continue;

  const [bln, per, indeksK, cpo, pko] = td;
  const kunciBulan = BULAN[bln.slice(0, 3).toLowerCase()];
  const kunciPeriode = PERIODE[per.trim().toUpperCase()];
  const tahun = Number(bln.split('-')[1]);
  if (!kunciBulan || !kunciPeriode || !Number.isInteger(tahun)) continue;

  const hargaUmur = {};
  UMUR.forEach((u, i) => { hargaUmur[u] = angka(td[5 + i]); });
  const rerata = angka(td[5 + UMUR.length]);

  baris.push({
    provinsi: 'Kalimantan Barat',
    bulan: `${tahun}-${String(kunciBulan).padStart(2, '0')}`,
    periode: kunciPeriode,
    // Tanggal nominal, bukan tanggal penetapan. Ada supaya bisa digambar sebagai garis.
    t: `${tahun}-${String(kunciBulan).padStart(2, '0')}-${String(HARI_NOMINAL[kunciPeriode]).padStart(2, '0')}`,
    nominal: true,
    indeks_k: angka(indeksK),
    cpo: angka(cpo),
    pko: angka(pko),
    tbs_umur: hargaUmur,
    tbs_rerata: rerata,
  });
}

if (!baris.length) {
  console.error('BERHENTI — tabelnya ada tetapi tidak satu baris pun terurai. Bentuknya berubah.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Gabung dengan yang sudah tersimpan — jendelanya bergulir, arsipnya milik kita
// ---------------------------------------------------------------------------
const lama = existsSync(KELUAR)
  ? readFileSync(KELUAR, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))
  : [];

const peta = new Map(lama.map((r) => [`${r.bulan}#${r.periode}`, r]));
let baru = 0, berubah = 0;
for (const r of baris) {
  const k = `${r.bulan}#${r.periode}`;
  const ada = peta.get(k);
  if (!ada) { peta.set(k, r); baru++; continue; }
  // Penetapan yang direvisi sesudah terbit: yang baru menang, tetapi selisihnya dilaporkan
  // alih-alih ditelan. Angka resmi yang berubah diam-diam adalah hal yang perlu diketahui.
  if (JSON.stringify(ada) !== JSON.stringify(r)) {
    console.error(`  revisi ${k}: rerata ${ada.tbs_rerata} -> ${r.tbs_rerata}`);
    peta.set(k, r);
    berubah++;
  }
}

const keluar = [...peta.values()].sort((a, b) => a.t.localeCompare(b.t) || a.periode - b.periode);

// Penjaga data pribadi, atas keluaran.
const serial = JSON.stringify(keluar);
const bocor = TERLARANG.filter((f) => serial.toLowerCase().includes(`"${f}"`));
if (bocor.length) {
  console.error(`BERHENTI — medan data pribadi ikut ke keluaran: ${bocor.join(', ')}.`);
  process.exit(1);
}

writeFileSync(KELUAR, keluar.map((r) => JSON.stringify(r)).join('\n') + '\n');

const n = (x) => x.toLocaleString('id-ID');
console.log(`Baris di sumber        : ${n(baris.length)}`);
console.log(`  baru                 : ${n(baru)}`);
console.log(`  revisi angka         : ${n(berubah)}`);
console.log(`Arsip seluruhnya       : ${n(keluar.length)} periode — ${keluar[0].t} s.d. ${keluar.at(-1).t}`);
console.log(`  dipertahankan dari arsip: ${n(keluar.length - baris.length)} periode yang sudah hilang dari halaman sumber`);
console.log(`Pita umur              : ${UMUR.length} — ${UMUR.join(', ')} tahun`);
console.log(`Sel kosong             : ${n(keluar.reduce((a, r) => a + Object.values(r.tbs_umur).filter((v) => v === null).length + [r.cpo, r.pko, r.indeks_k, r.tbs_rerata].filter((v) => v === null).length, 0))}`);
console.log(`Penjaga PII            : lolos — tak satu pun dari ${TERLARANG.length} medan terlarang muncul`);
console.log(`Ditulis ke             : ${KELUAR}`);
