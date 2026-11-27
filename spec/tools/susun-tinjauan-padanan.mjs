// Menyusun daftar tinjauan nama bahan aktif yang belum punya padanan internasional.
//
//   node spec/tools/susun-tinjauan-padanan.mjs [--tulis docs/21-tinjauan-padanan-bahan-aktif.md]
//
// KENAPA ALAT INI ADA
// `susun-padanan-bahan-aktif.mjs` memetakan 87,9% penyebutan bahan aktif ke identitas
// kimia yang bisa di-join. Sisanya — 613 kunci — DIBIARKAN KOSONG dengan sengaja, karena
// registri tidak pernah menuliskan nama internasionalnya dan perancangnya menolak menebak:
// satu kesetaraan yang salah menjalar ke pemeriksaan larangan, ke MRL, dan ke nasihat
// rotasi. Penolakan itu benar, dan berkas ini tidak membatalkannya.
//
// Yang menahan sisanya bukan lagi kode, melainkan tidak adanya orang yang tahu jawabannya
// dan mau menempelkan namanya. Meminta orang itu menelusuri 1.593 baris NDJSON untuk
// menemukan mana yang perlu dijawab adalah cara paling pasti membuat ia tidak jadi
// menjawab. Berkas ini yang menyiapkan pertanyaannya, urut menurut bobot.
//
// Dibuat sebagai alat, bukan dokumen tangan, karena daftarnya menyusut SEBAGAI HASIL
// tinjauan — dan daftar tinjauan yang sudah usang lebih buruk daripada tidak ada.
// Jalankan ulang setelah tabel padanannya berubah.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const tulis = arg('tulis');

const pad = JSON.parse(readFileSync(resolve(AKAR, 'spec/vocab/padanan-bahan-aktif.json'), 'utf8'));
const semua = pad.padanan_items ?? [];
const KOSONG = new Set(['belum-terpetakan', 'nama-sistematis-belum-terpetakan']);
const belum = semua.filter((x) => KOSONG.has(x.hubungan));

const BOBOT = 5;   // batas "berbobot": muncul pada lima formulasi atau lebih
const urut = (a, b) => (b.formulasi ?? 0) - (a.formulasi ?? 0) || a.kunci.localeCompare(b.kunci);
const berbobot = belum.filter((x) => x.hubungan === 'belum-terpetakan' && (x.formulasi ?? 0) >= BOBOT).sort(urut);
const ekor = belum.filter((x) => x.hubungan === 'belum-terpetakan' && (x.formulasi ?? 0) < BOBOT).sort(urut);
const sistematis = belum.filter((x) => x.hubungan === 'nama-sistematis-belum-terpetakan').sort(urut);

const n = (x) => Number(x ?? 0).toLocaleString('id-ID');
const sebut = (arr) => (arr ?? []).map((s) => `\`${s}\``).join(' · ');
const pipa = (s) => String(s ?? '').replace(/\|/g, '\\|');
// Angka desimal ditulis dengan koma, sama seperti seluruh dokumen di repositori ini.
const pct = (x, d = 1) => x.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });

const totalPenyebutan = semua.reduce((a, x) => a + (x.formulasi ?? 0), 0);
const kosongPenyebutan = belum.reduce((a, x) => a + (x.formulasi ?? 0), 0);
const terpetakanPersen = ((totalPenyebutan - kosongPenyebutan) / totalPenyebutan) * 100;
const bobotBerbobot = berbobot.reduce((a, x) => a + (x.formulasi ?? 0), 0);

const B = [];
const P = (...x) => B.push(x.join(''));

P('# Daftar Tinjauan — Nama Bahan Aktif yang Belum Punya Padanan Internasional');
P('');
P('> Bahan untuk ahli pestisida, Komisi Pestisida, atau BPTP · dibangkitkan dari');
P('> `spec/vocab/padanan-bahan-aktif.json` oleh `spec/tools/susun-tinjauan-padanan.mjs`');
P('> · jalankan ulang bila tabel padanannya berubah.');
P('>');
P(`> Potret registri ${pad.padanan?.potret?.tarikan ?? '—'} · ${n(semua.length)} kunci ·`);
P(`> **${pct(terpetakanPersen)}% penyebutan sudah terpetakan**; yang di bawah ini sisanya.`);
P('');
P('---');
P('');
P('## 1. Apa yang ditanyakan, dan kenapa hanya ini yang ditanyakan');
P('');
P(`Registri Kementan menuliskan bahan aktif dengan ejaan Indonesia — \`sipermetrin\`,`);
P('`mankozeb`, `glifosat`. Untuk sebagian, registri menyebutkan sendiri nama');
P('internasionalnya di dalam kurung — *"Sipermetrin (cypermethrin)"* — dan dari situlah');
P(`${n(semua.length - belum.length)} kunci sudah terpetakan tanpa satu pun tebakan.`);
P('');
P(`**${n(belum.length)} kunci di bawah ini tidak pernah mendapat kurung itu.** Ejaannya juga tidak`);
P('bertemu satu pun nama yang sudah dideklarasikan registri di tempat lain. Keduanya');
P('dibiarkan kosong, dengan alasan tertulis per baris, karena aturan yang menyusunnya');
P('menolak tiga hal:');
P('');
P('> Tidak ada pencocokan dengan jarak edit, kemiripan, atau tebakan struktur — satu');
P('> kesetaraan yang salah di tabel ini menjalar ke pemeriksaan larangan, ke MRL, dan ke');
P('> nasihat rotasi.');
P('');
P('Penolakan itu tidak dibatalkan oleh daftar ini. Yang berubah hanya sumber buktinya:');
P('dari deklarasi registri jadi **orang bernama yang tahu jawabannya**.');
P('');
P('Untuk tiap entri, yang diminta tiga hal:');
P('');
P('1. **Nama umum internasionalnya** — nama umum ISO bila ada. Kalau bahan itu memang');
P('   tidak punya nama umum, tulis begitu; itu jawaban yang sah dan berguna.');
P('2. **Jenis hubungannya** dengan nama itu — bukan sekadar "sama". Pilih satu:');
P('   `sama-dengan`, `varian-ejaan`, `garam-dari`, `ester-dari`, `stereoisomer-dari`,');
P('   `organisme`, atau `bukan-bahan-aktif`. Pembedaan inilah yang menentukan apakah');
P('   larangan atas induknya mengenai garamnya, dan apakah kadar label sebanding dengan');
P('   MRL.');
P('3. **Di mana Anda melihatnya** — monografi, label produk, keputusan menteri, atau');
P('   pengetahuan kerja. Tanpa ini jawabannya tidak bisa dibedakan dari tebakan, dan');
P('   tabelnya menolak tebakan.');
P('');
P('Yang **tidak** diminta:');
P('');
P('- Bukan meninjau ulang yang sudah terpetakan. Yang itu berdiri di atas deklarasi');
P('  registri sendiri dan tidak melewati penilaian peninjau.');
P('- Bukan menilai apakah bahannya layak beredar. Daftar ini soal **nama**, bukan soal');
P('  izin, dosis, atau keamanan.');
P('- Bukan mengisi semuanya. Entri yang Anda tidak yakin lebih baik dilewati daripada');
P('  dijawab setengah — kosong sudah jadi keadaan sekarang, dan kosong tidak merugikan');
P('  siapa pun. Jawaban yang salah merugikan.');
P('');
P('## 2. Apa yang menempel pada nama peninjau');
P('');
P('Disebut di muka supaya tidak ada yang tersembunyi.');
P('');
P('- Jawaban yang diterima masuk ke `padanan-bahan-aktif.json` dengan `dasar` yang');
P('  menyebut tinjauan, **bukan** dilebur jadi seolah datang dari registri. Asal-usul tiap');
P('  baris tetap bisa dibedakan selamanya.');
P('- Nama, institusi, dan tanggal tinjau ikut tercatat, dan tampil di layar sebagai');
P('  penanggung jawabnya.');
P('- Tinjauan boleh berupa **penolakan.** "Tulisan ini bukan bahan aktif" atau "bahan ini');
P('  tidak punya nama umum internasional" adalah hasil yang sah.');
P('- Satu hal yang belum ada, dan disebut supaya tidak jadi kejutan: skema padanan saat');
P('  ini hanya mengenal empat `dasar` — `deklarasi-registri`, `ejaan`, `ejaan-arah`,');
P('  `kosakata-zat`. Menerima jawaban dari daftar ini menuntut satu nilai baru ditambahkan');
P('  lebih dulu. Itu keputusan pemilik berkasnya, bukan syarat yang bisa dilewati diam-diam.');
P('');
P('---');
P('');
P(`## 3. Bagian A — ${n(berbobot.length)} bahan yang paling banyak dipakai`);
P('');
P(`Muncul pada ${BOBOT} formulasi atau lebih. Bersama-sama menyentuh **${n(bobotBerbobot)} dari`);
P(`${n(kosongPenyebutan)}** penyebutan yang belum terpetakan — menjawab bagian ini saja sudah menutup`);
P(`${pct((bobotBerbobot / kosongPenyebutan) * 100, 0)}% bobotnya.`);
P('');

for (const [i, x] of berbobot.entries()) {
  P(`### A${i + 1}. \`${x.kunci}\``);
  P('');
  P(`Muncul pada **${n(x.formulasi)} formulasi** terdaftar · entitas zat \`${x.substance?.id ?? '—'}\` (${x.substance?.label ?? '—'})`);
  P('');
  if ((x.tulisan_teramati ?? []).length > 1) {
    P(`Ejaan yang teramati di registri: ${sebut(x.tulisan_teramati)}`);
    P('');
  }
  P('| Pertanyaan | Jawaban peninjau |');
  P('|---|---|');
  P('| Nama umum internasional (ISO) | |');
  P('| Jenis hubungan | |');
  P('| Di mana Anda melihatnya | |');
  P('| Kalau tidak punya nama umum — kenapa | |');
  P('');
}

P('---');
P('');
P(`## 4. Bagian B — ${n(sistematis.length)} tulisan yang berupa nama kimia sistematis`);
P('');
P('Registri menuliskan nama sistematis atau semi-sistematis, bukan nama umum. Pertanyaannya');
P('karena itu berbeda: **apakah bahan ini punya nama umum sama sekali?** Banyak bahan');
P('pembantu dan pengawet memang tidak punya, dan "tidak punya" adalah jawaban yang');
P('menutup barisnya untuk selamanya — sama berharganya dengan sebuah nama.');
P('');
P('| # | Tulisan di registri | Formulasi | Nama umum bila ada | Jenis hubungan | Sumber |');
P('|---|---|---:|---|---|---|');
for (const [i, x] of sistematis.entries()) {
  P(`| B${i + 1} | \`${pipa(x.kunci)}\` | ${n(x.formulasi)} | | | |`);
}
P('');
P('---');
P('');
P(`## 5. Bagian C — ${n(ekor.length)} sisanya, ekor panjang`);
P('');
P(`Masing-masing muncul pada kurang dari ${BOBOT} formulasi; ${n(ekor.filter((x) => (x.formulasi ?? 0) === 1).length)} di antaranya hanya satu.`);
P('Bobotnya kecil satu per satu, tetapi di sinilah bahan baru dan bahan khusus berkumpul —');
P('dan bahan yang baru masuk registri hari ini adalah bahan yang akan banyak dipakai tahun');
P('depan. Dikerjakan setelah Bagian A dan B, bukan sebagai gantinya.');
P('');
P('| # | Tulisan di registri | Formulasi | Nama umum internasional | Jenis hubungan | Sumber |');
P('|---|---|---:|---|---|---|');
for (const [i, x] of ekor.entries()) {
  P(`| C${i + 1} | \`${pipa(x.kunci)}\` | ${n(x.formulasi)} | | | |`);
}
P('');
P('---');
P('');
P('## 6. Bagaimana jawabannya dikembalikan');
P('');
P('Salin bagian yang Anda isi, kirim balik apa adanya — berkas ini dibangkitkan ulang dari');
P('data, jadi menyuntingnya di tempat akan tertimpa. Yang masuk ke repositori bukan berkas');
P('ini, melainkan barisnya di `padanan-bahan-aktif.json`, satu per satu, masing-masing');
P('membawa nama Anda dan sumber yang Anda sebut.');
P('');
P(`Setelah diterima, jalankan ulang \`spec/tools/susun-tinjauan-padanan.mjs\` — daftar ini`);
P('akan menyusut sendiri, dan yang tersisa selalu yang benar-benar masih kosong.');

const teks = B.join('\n') + '\n';
if (tulis) {
  writeFileSync(resolve(AKAR, tulis), teks);
  console.log(`Ditulis ke ${tulis}`);
} else {
  console.log(teks.slice(0, 2000));
  console.log('…');
}
console.log(`\nbelum terpetakan : ${n(belum.length)} kunci · ${n(kosongPenyebutan)} penyebutan (${pct(100 - terpetakanPersen)}%)`);
console.log(`  Bagian A       : ${n(berbobot.length)} bahan berbobot ≥${BOBOT} formulasi — ${n(bobotBerbobot)} penyebutan (${pct((bobotBerbobot / kosongPenyebutan) * 100, 0)}% bobot)`);
console.log(`  Bagian B       : ${n(sistematis.length)} nama sistematis`);
console.log(`  Bagian C       : ${n(ekor.length)} ekor panjang`);
