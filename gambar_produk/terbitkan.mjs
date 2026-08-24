// Menyalin gambar kemasan yang lolos tinjauan ke app/gambar/, lalu menulis berkas sambungan
// yang dibaca pembangun indeks.
//
//   node gambar_produk/terbitkan.mjs            # periksa saja, laporkan sebarannya
//   node gambar_produk/terbitkan.mjs --tulis    # salin berkas dan tulis terbit.ndjson
//
// KEPUTUSAN PENERBITAN — DIBUAT PEMILIK REPOSITORI, DICATAT DI SINI
// Tiap baris manifes membawa `source.redistributable: false` dan `source.permission:
// "belum_diminta"`. Nilai itu TIDAK diubah berkas ini, dan tidak boleh diubah: ia catatan
// keadaan pada saat panen, bukan izin.
//
// Pada 23 Agustus 2026 pemilik repositori memutuskan tetap menerbitkan gambar-gambar ini,
// dengan alasan yang dinyatakannya sendiri: gambar kemasan ini sudah tersedia publik di
// kanal terbit principal masing-masing. Keputusan itu dicatat di sini, bukan diberlakukan
// diam-diam dengan membalik satu medan, supaya siapa pun yang membaca berkas ini kelak
// melihat dua hal sekaligus: apa yang manifes katakan, dan apa yang diputuskan di atasnya.
//
// Membalikkannya murah dan itu disengaja: hapus app/gambar/, bangun ulang indeks, dan tiap
// slot gambar jatuh ke placeholder tanpa satu pun perubahan kode.
//
// Keputusan itu menyebut GAMBAR KEMASAN. Pada 24 Agustus 2026 pemilik repositori
// memperluasnya ke logo badan, dan perluasan itu dicatat di kepala `terbitkan-logo.mjs` —
// berkas terpisah karena sambungannya berkunci principal, bukan produk. Logo membawa dua
// kewajiban tambahan yang tidak dibawa foto kemasan; keduanya ditulis di sana.
//
// YANG TIDAK IKUT, DAN KENAPA
//   baris berstatus `ditolak` di tinjauan  — ditolak berarti ditolak
//   baris tanpa `narrowed_to`              — tidak diketahui pendaftaran mana yang dirujuk;
//                                            span 1 semestinya tidak pernah ada di sini
//   ukuran `besar`                         — halaman produk tidak memerlukannya; yang dipakai
//                                            `kecil` untuk daftar, `sedang` untuk layar rincian
//
// BARIS BERHAK PIHAK KETIGA
// `source.rights` bernilai `pihak_ketiga` pada sebagian baris — bukan pemegang pendaftaran, dan
// bukan kita. Semuanya tetap disalin sesuai keputusan di atas, tetapi ditandai `hak` di berkas
// sambungan dan dilaporkan terpisah beserta nama mereknya, supaya pencabutan per baris tidak
// perlu memeriksa ulang seluruh manifes untuk menemukan yang mana.
//
// KEPALA BERKAS INI SENGAJA TANPA JUMLAH
// Empat angka pernah berdiri di sini: 76 ditolak, 35 tanpa narrowed_to, empat baris berhak
// pihak ketiga, 42,2 MB ukuran besar. Keempatnya salah dalam hitungan minggu, dan sempat
// menyesatkan pembacanya ke kesimpulan bahwa yang tak terbit cuma segelintir. Panen tumbuh,
// komentar tidak. Jadi yang disebut di sini bentuk kategorinya saja — jumlahnya dicetak alat
// ini sendiri, dan cara membacanya satu perintah: jalankan tanpa --tulis.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..');
const tulis = process.argv.includes('--tulis');
const MANIFES = join(akar, 'gambar_produk', 'manifes.ndjson');
const SUMBER = join(akar, 'gambar_produk');
const TUJUAN = join(akar, 'app', 'gambar');
const SAMBUNG = join(akar, 'gambar_produk', 'terbit.ndjson');

// `besar` sengaja tidak ikut — lihat kepala berkas.
const UKURAN = ['kecil', 'sedang'];

const manifes = readFileSync(MANIFES, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));

const diterima = manifes.filter((x) => x.review?.status === 'ternormalisasi');
const ditolak = manifes.length - diterima.length;

// ---------------------------------------------------------------------------
// Susun sambungan: id produk -> gambar
// ---------------------------------------------------------------------------
// Satu merek bisa menaungi beberapa pendaftaran, dan sebaliknya satu pendaftaran bisa punya
// beberapa baris gambar (kemasan depan, panel label). Yang dipakai halaman produk satu:
// kemasan depan dengan penyempitan terkuat. Sisanya tetap tercatat sebagai `lain` supaya
// halaman bisa menampilkannya tanpa pengambilan kedua.
const PERAN_UTAMA = ['kemasan_depan', 'bidikan_produk', 'panel_label', 'lainnya', 'logo'];
const KUAT = { kuat: 3, sedang: 2, lemah: 1 };

const perProduk = new Map();
let tanpaId = 0;
let tanpaBerkas = 0;

for (const x of diterima) {
  const tujuan = x.narrowed_to ?? [];
  if (!tujuan.length) { tanpaId++; continue; }

  const semua = [x.file, ...(x.variants ?? [])].filter(Boolean);
  const berkas = {};
  for (const u of UKURAN) {
    const f = semua.find((v) => v.rendition === u);
    if (f) berkas[u] = { jalan: f.path, w: f.width_px, h: f.height_px, byte: f.bytes };
  }
  if (!Object.keys(berkas).length) { tanpaBerkas++; continue; }

  for (const t of tujuan) {
    if (!perProduk.has(t.id)) perProduk.set(t.id, []);
    perProduk.get(t.id).push({
      merek: x.brand_key,
      peran: x.role,
      kuat: KUAT[x.narrowing?.strength] ?? 0,
      hak: x.source?.rights ?? 'tidak_diketahui',
      izin: x.source?.permission ?? 'belum_diminta',
      penerbit: x.source?.publisher ?? null,
      halaman: x.source?.page_url ?? null,
      diambil: x.source?.retrieved_at ?? null,
      nomorTerbaca: x.printed_registration?.number_as_read ?? null,
      nomorCocok: x.printed_registration?.matches_brand ?? null,
      berkas,
    });
  }
}

// Urutan: peran dulu, lalu kekuatan penyempitan, lalu nama berkas supaya deterministik.
for (const [, daftar] of perProduk) {
  daftar.sort((a, b) =>
    PERAN_UTAMA.indexOf(a.peran) - PERAN_UTAMA.indexOf(b.peran) ||
    b.kuat - a.kuat ||
    String(a.berkas.kecil?.jalan ?? '').localeCompare(String(b.berkas.kecil?.jalan ?? '')));
}

// ---------------------------------------------------------------------------
// Laporan
// ---------------------------------------------------------------------------
const semuaBerkas = new Set();
const hak = {};
let byte = 0;
for (const [, daftar] of perProduk) {
  for (const g of daftar) {
    hak[g.hak] = (hak[g.hak] ?? 0) + 1;
    for (const u of UKURAN) if (g.berkas[u]) { semuaBerkas.add(g.berkas[u].jalan); byte += g.berkas[u].byte ?? 0; }
  }
}

const n = (x) => x.toLocaleString('id-ID');
console.log(`Baris manifes         : ${n(manifes.length)}`);
console.log(`  diterima tinjauan   : ${n(diterima.length)}`);
console.log(`  DITOLAK, tidak ikut : ${n(ditolak)}`);
console.log(`  tanpa narrowed_to   : ${n(tanpaId)} — tak diketahui pendaftaran mana yang dirujuk, tidak ikut`);
if (tanpaBerkas) console.log(`  tanpa ukuran terpakai: ${n(tanpaBerkas)}`);
console.log(`Produk bergambar      : ${n(perProduk.size)}`);
console.log(`Berkas disalin        : ${n(semuaBerkas.size)} (${(byte / 1024 / 1024).toFixed(1)} MB) — ukuran ${UKURAN.join(' + ')}`);
console.log(`Dasar hak             : ${Object.entries(hak).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
const pihakKetiga = [...perProduk.values()].flat().filter((g) => g.hak === 'pihak_ketiga');
if (pihakKetiga.length) {
  console.log(`  ⚠ berhak PIHAK KETIGA: ${n(pihakKetiga.length)} — bukan pemegang pendaftaran, bukan kita.`);
  for (const g of pihakKetiga) console.log(`      ${g.merek} — ${g.halaman ?? 'tanpa halaman sumber'}`);
}
console.log(`Izin tertulis         : belum diminta pada seluruh baris; manifes tetap menyatakan redistributable: false`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyalin ke app/gambar/.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Salin
// ---------------------------------------------------------------------------
if (existsSync(TUJUAN)) rmSync(TUJUAN, { recursive: true });
mkdirSync(TUJUAN, { recursive: true });

let disalin = 0, hilang = 0;
for (const jalan of [...semuaBerkas].sort()) {
  const dari = join(SUMBER, jalan);
  if (!existsSync(dari)) { hilang++; continue; }
  copyFileSync(dari, join(TUJUAN, basename(jalan)));
  disalin++;
}

// Berkas sambungan menyimpan NAMA DASAR saja: app/gambar/ rata, dan halaman tidak perlu tahu
// susunan direktori panen.
const baris = [...perProduk.entries()]
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([id, daftar]) => ({
    produk: id,
    gambar: daftar.map((g) => ({
      ...g,
      berkas: Object.fromEntries(Object.entries(g.berkas)
        .filter(([, f]) => existsSync(join(SUMBER, f.jalan)))
        .map(([u, f]) => [u, { n: basename(f.jalan), w: f.w, h: f.h }])),
    })).filter((g) => Object.keys(g.berkas).length),
  }))
  .filter((r) => r.gambar.length);

writeFileSync(SAMBUNG, baris.map((r) => JSON.stringify(r)).join('\n') + '\n');

console.log(`\nDisalin               : ${n(disalin)} berkas ke ${TUJUAN}`);
if (hilang) console.log(`Hilang di disk        : ${n(hilang)} — manifes menyebutnya, berkasnya tidak ada`);
console.log(`Sambungan             : ${n(baris.length)} produk ditulis ke ${SAMBUNG}`);
console.log(`Isi app/gambar/       : ${n(readdirSync(TUJUAN).length)} berkas`);
