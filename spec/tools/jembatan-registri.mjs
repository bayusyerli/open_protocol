// Langkah 2 kadensi registri — menyambung tarikan mentah ke alat turunannya.
//
//   node spec/tools/jembatan-registri.mjs           # periksa: apa yang akan berpindah
//   node spec/tools/jembatan-registri.mjs --tulis   # pindahkan
//
// RANTAI YANG PUTUS, DAN PUTUSNYA TIDAK TERLIHAT.
// `tarik-registri.mjs` menulis ke `data-registri/`; alat turunannya membaca
// `pukpes_data/raw/` dengan nama berkas yang berbeda pula. Sampai berkas ini ada, tidak ada
// satu pun alat yang menjembatani keduanya, dan langkah itu dikerjakan tangan.
//
// Yang membuatnya mahal bukan repetisinya melainkan MODE GAGALNYA: penarik berjalan mulus,
// berkas baru benar-benar muncul, tidak ada galat — dan kosakata tidak berubah sama sekali.
// Yang menjalankannya akan yakin registrinya sudah segar padahal ia menurunkan tarikan
// musim lalu. docs/12 §2 menamai kegagalan itu; berkas ini yang menutupnya.
//
// KENAPA IA MENYALIN, BUKAN MENGUBAH JALUR BACA ALAT TURUNAN.
// Memindahkan tarikan ke tempat yang dibaca alat turunan menjaga satu pemisahan yang
// disengaja: `data-registri/` adalah tarikan mentah apa adanya dan ada di .gitignore,
// sedangkan `pukpes_data/raw/` adalah masukan yang dipakai membangun kosakata. Menyatukan
// keduanya akan membuat "apa yang ditarik" dan "apa yang dipakai" tidak bisa dibedakan lagi
// — dan perbedaan itulah yang membuat sebuah tarikan bisa ditolak sebelum dipakai.

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DARI = join(AKAR, 'data-registri');
const KE = join(AKAR, 'pukpes_data', 'raw');
const tulis = process.argv.includes('--tulis');

/* Pemetaannya persis yang tercetak di docs/12 §2. Ditulis di sini supaya ia dijalankan,
 * bukan dibaca dan disalin tangan — dan kalau namanya berubah di salah satu sisi, yang
 * berubah satu baris di satu tempat. */
const PETA = [
  { dari: 'pestisida.json', ke: 'pestisida_terdaftar.json', apa: 'pestisida terdaftar' },
  { dari: 'pupuk.json', ke: 'pupuk_terdaftar.json', apa: 'pupuk terdaftar' },
  { dari: 'pupuk-legacy.json', ke: 'pupuk_terdaftar_legacy.json', apa: 'pupuk terdaftar (legacy)' },
];

const kb = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;
const cacah = (isi) => {
  try {
    const j = JSON.parse(isi);
    const larik = Array.isArray(j) ? j : (Object.values(j).find(Array.isArray) ?? []);
    return larik.length;
  } catch { return null; }
};

if (!existsSync(DARI)) {
  console.error(`data-registri/ belum ada. Tarik dulu:\n  node spec/tools/tarik-registri.mjs`);
  process.exit(1);
}

const salah = [];
const rencana = [];

for (const p of PETA) {
  const asal = join(DARI, p.dari);
  const tujuan = join(KE, p.ke);

  if (!existsSync(asal)) { salah.push(`${p.dari} tidak ada di data-registri/ — tarikannya belum lengkap`); continue; }

  const isi = readFileSync(asal, 'utf8');
  const n = cacah(isi);
  if (n === null) { salah.push(`${p.dari} bukan JSON yang bisa diurai — tarikannya rusak, dan menyalinnya akan merusak kosakata`); continue; }
  if (n === 0) { salah.push(`${p.dari} terurai tetapi KOSONG — menyalinnya akan mengosongkan ${p.apa} tanpa satu pun galat`); continue; }

  const lama = existsSync(tujuan) ? readFileSync(tujuan, 'utf8') : null;
  const nLama = lama === null ? null : cacah(lama);

  /* Penjaga arah. Registri bisa menyusut secara sah — pendaftaran kedaluwarsa dicabut —
   * tetapi susut lebih dari seperempat dalam satu tarikan jauh lebih mungkin berarti
   * tarikannya terpotong daripada berarti seperempat registri dicabut sekaligus. Menolak
   * di sini lebih murah daripada menemukan kosakata yang menyusut diam-diam tiga langkah
   * kemudian. */
  if (nLama && n < nLama * 0.75) {
    salah.push(`${p.dari} memuat ${n} rekaman, turun dari ${nLama} (−${Math.round((1 - n / nLama) * 100)}%) — tarikannya kemungkinan terpotong. Periksa dulu; kalau memang benar, salin tangan.`);
    continue;
  }

  rencana.push({ ...p, asal, tujuan, isi, n, nLama, sama: lama === isi, byte: statSync(asal).size });
}

console.log(`Jembatan langkah 2 — data-registri/ → pukpes_data/raw/\n`);
for (const r of rencana) {
  const arah = r.sama ? 'sudah sama' : (r.nLama == null ? 'baru' : `${r.nLama} → ${r.n}`);
  console.log(`  ${r.dari.padEnd(20)} → ${r.ke.padEnd(32)} ${String(r.n).padStart(6)} rekaman · ${kb(r.byte).padStart(8)} · ${arah}`);
}

if (salah.length) {
  console.error(`\n${salah.length} masalah — tidak ada yang dipindahkan:`);
  for (const s of salah) console.error(`  ✗ ${s}`);
  process.exit(1);
}

const berubah = rencana.filter((r) => !r.sama);
if (!berubah.length) {
  console.log('\nKetiganya sudah sama dengan tarikan. Tidak ada yang perlu dipindahkan.');
  process.exit(0);
}

if (!tulis) {
  console.log(`\n${berubah.length} berkas akan berpindah. Jalankan dengan --tulis.`);
  process.exit(0);
}

mkdirSync(KE, { recursive: true });
for (const r of berubah) writeFileSync(r.tujuan, r.isi);

console.log(`\n${berubah.length} berkas dipindahkan ke pukpes_data/raw/.`);
console.log('Lanjutkan langkah 3:');
console.log('  node spec/tools/isi-komposisi-pupuk.mjs --tulis');
console.log('  node spec/tools/dedup-komposisi-pestisida.mjs --tulis');
console.log('  cd spec && npm run all');
