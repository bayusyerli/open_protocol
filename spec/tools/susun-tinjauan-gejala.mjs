// Menyusun daftar tinjauan gejala OPT untuk agronom atau BPTP.
//
//   node spec/tools/susun-tinjauan-gejala.mjs [--tulis docs/14-tinjauan-gejala.md]
//
// KENAPA ALAT INI ADA, DAN KENAPA IA ALAT
// Teks gejala jalur 1 berstatus draft dan mengatakannya sendiri di layar. Yang
// menahannya naik bukan datanya, melainkan tidak adanya orang yang mau menempelkan
// namanya. Meminta orang itu menelusuri repositori untuk membaca yang perlu ditinjau
// adalah cara paling pasti membuat ia tidak jadi meninjau.
//
// Dibuat sebagai alat, bukan dokumen tangan, karena teks gejalanya akan berubah justru
// SEBAGAI HASIL tinjauan — dan daftar tinjauan yang sudah usang lebih buruk daripada
// tidak ada. Jalankan ulang setelah teksnya berubah.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const tulis = arg('tulis');

const pest = JSON.parse(readFileSync(resolve(AKAR, 'spec/vocab/pest.json'), 'utf8'));
const opt = (pest.items ?? []).filter((p) => p.symptoms);

// Menandai sendiri entri yang paling mungkin lemah, alih-alih menyerahkan pencarian itu
// ke peninjau. Dua pola yang bisa dihitung tanpa pengetahuan agronomi -- keduanya bukan
// bukti bahwa entrinya salah, hanya alasan mendahulukannya.
const penanda = (p) => {
  const c = p.distinguishing ?? [];
  const t = [];
  if (!c.length) t.push('tanpa ciri pembanding sama sekali');
  const ro = c.map((x) => x.rules_out?.id);
  if (c.length && ro.some((x) => !x)) t.push(`${ro.filter((x) => !x).length} ciri tidak menyebut apa yang dibantahnya`);
  const isi = ro.filter(Boolean);
  if (isi.length >= 2 && new Set(isi).size === 1) t.push('kedua cirinya membantah OPT yang sama');
  return t;
};
const bertanda = opt.filter((p) => penanda(p).length);

// Dikelompokkan menurut INANG, bukan menurut nomor id. Sejak bawang merah masuk,
// peninjau untuk cabai dan peninjau untuk bawang merah bukan orang yang sama, dan
// daftar yang menyelang-nyeling keduanya memaksa masing-masing membaca separuh yang
// bukan urusannya. Dua entri berinang dua — layu fusarium dan kutu daun persik —
// sengaja muncul di kedua kelompok: teksnya memang harus benar untuk keduanya.
const rumpun = [];
for (const p of opt) {
  for (const h of p.hosts?.length ? p.hosts : [{ id: '-', label: 'Tanpa inang tercatat' }]) {
    let r = rumpun.find((x) => x.id === h.id);
    if (!r) rumpun.push((r = { id: h.id, label: h.label, anggota: [] }));
    r.anggota.push(p);
  }
}
rumpun.sort((a, b) => b.anggota.length - a.anggota.length || a.label.localeCompare(b.label));
const rangkap = opt.filter((p) => (p.hosts ?? []).length > 1);
// Dirangkai dengan koma dan satu "dan" di ujung, bukan "dan" berulang: sejak inangnya
// empat, `join(' dan ')` menghasilkan judul yang tidak bisa dibaca sekali jalan.
const rangkai = (x) => (x.length < 2 ? x.join('') : `${x.slice(0, -1).join(', ')}, dan ${x[x.length - 1]}`);
const sebutInang = rangkai(rumpun.map((r) => r.label));

const B = [];
const P = (...x) => B.push(x.join(''));

P(`# Daftar Tinjauan — ${opt.length} Teks Gejala OPT ${sebutInang}`);
P('');
P('> Bahan untuk agronom atau BPTP · dibangkitkan dari `spec/vocab/pest.json`');
P('> oleh `spec/tools/susun-tinjauan-gejala.mjs` · jalankan ulang bila teksnya berubah');
P('>');
P('> Menutup butir **M0** terakhir pada [10-peta-modul.md](10-peta-modul.md) begitu');
P('> tinjauannya diterima.');
P('');
P('---');
P('');
P('## 1. Apa yang diminta, dan apa yang tidak');
P('');
P(`Seluruh ${opt.length} teks di bawah tampil di layar yang dibuka petani ketika tanamannya`);
P('bermasalah. Layar itu **tidak mendiagnosis**: ia menyajikan dugaan, lalu membuka blok');
P('“pastikan dulu” berisi dua ciri yang bisa diperiksa sendiri tanpa alat. Tiap ciri');
P('menyebut OPT mana yang **terbantah** kalau hasilnya begitu.');
P('');
P('Yang diminta dari peninjau, untuk tiap entri:');
P('');
P('1. **Apakah teks gejalanya benar** — bukan lengkap, tetapi benar sejauh yang disebut.');
P('2. **Apakah kedua ciri pembandingnya sungguh membedakan,** dan bisa dikerjakan petani');
P('   tanpa alat, di kebun, tanpa pelatihan.');
P('3. **Apakah OPT yang disebut terbantah memang terbantah** oleh ciri itu — atau justru');
P('   masih mungkin.');
P('');
P('Yang **tidak** diminta:');
P('');
P(`- Bukan menambah OPT baru. Yang ${opt.length} ini dipilih karena paling sering dicari; kekurangan`);
P('  cakupan sudah diketahui dan bukan yang ditinjau di sini.');
P('- Bukan merekomendasikan bahan aktif atau merek. Sisi itu datang dari registri resmi');
P('  dan tidak melewati penilaian peninjau.');
P('- Bukan menjamin bebas kekeliruan. Yang dicari **kesalahan yang menyesatkan**, bukan');
P('  ketidaksempurnaan.');
P('');
P('## 2. Apa yang menempel pada nama peninjau');
P('');
P('Ini disebut di muka supaya tidak ada yang tersembunyi.');
P('');
P('- Nama, institusi, dan tanggal tinjau **ikut tercatat** pada entitas yang ditinjau, dan');
P('  tampil di layar sebagai penanggung jawabnya.');
P('- Tingkat buktinya naik dari **D** (belum terverifikasi) ke **C** (konsensus praktisi)');
P('  atau **B** (standar institusi resmi) menurut siapa yang meninjau.');
P('- Entitas ini **berversi**. Teks yang ditinjau hari ini tidak bisa diubah diam-diam:');
P('  perubahan menuntut versi baru, dan versi lama tetap bisa ditelusuri lewat riwayat.');
P('  Nama peninjau menempel pada **versi yang ia tinjau**, bukan pada apa pun yang');
P('  ditulis sesudahnya.');
P('- Tinjauan boleh berupa **penolakan.** “Teks ini salah dan sebaiknya dicabut” adalah');
P('  hasil yang sah dan lebih berharga daripada persetujuan setengah hati.');
P('');
P('---');
P('');
P(`## 3. Seluruh ${opt.length} entri`);
P('');
if (rangkap.length) {
  P(`${rangkap.length} entri berinang lebih dari satu dan karena itu muncul di lebih dari satu kelompok:`);
  P(`${rangkap.map((p) => `**${p.label?.id}**`).join(', ')}. Teksnya menyebut tiap tanaman secara terpisah,`);
  P('dan yang perlu ditinjau justru apakah pemisahan itu sudah benar untuk tanaman Anda.');
  P('');
}

for (const r of rumpun) {
P(`### ${r.label} — ${r.anggota.length} entri`);
P('');
for (const [n, p] of r.anggota.entries()) {
  const cir = p.distinguishing ?? [];
  P(`#### ${n + 1}. ${p.label?.id} — *${p.scientific_name ?? '—'}*`);
  P('');
  P(`\`${p.id}\` · ${p.pest_kind}${p.taxon_verification ? ` · taksonomi terverifikasi ${p.taxon_verification.source} (${p.taxon_verification.match_type}, ${p.taxon_verification.confidence}%)` : ''}`);
  P('');
  if (p.definition?.id) { P(`*${p.definition.id}*`); P(''); }
  const tanda = penanda(p);
  if (tanda.length) { P(`> **Ditandai untuk didahulukan:** ${tanda.join('; ')}.`); P(''); }
  P('**Teks gejala yang tampil di layar**');
  P('');
  P(`> ${p.symptoms.id}`);
  P('');
  if (cir.length) {
    P('**Ciri pembanding**');
    P('');
    for (const [m, c] of cir.entries()) {
      P(`${m + 1}. ${c.check?.id}`);
      P(`   → membantah: **${c.rules_out?.label ?? c.rules_out?.id ?? '—'}**`);
    }
  } else {
    P('**Ciri pembanding — TIDAK ADA.** Entri ini tampil tanpa cara memastikan, dan itu');
    P('yang paling perlu ditinjau.');
  }
  P('');
  P('| Pertanyaan | Jawaban peninjau |');
  P('|---|---|');
  P('| Teks gejalanya benar? | |');
  P(`| Kedua cirinya bisa dikerjakan petani tanpa alat? | |`);
  P('| Yang disebut terbantah memang terbantah? | |');
  P('| Kalau ada yang salah — apa yang seharusnya? | |');
  P('');
}
}

P('---');
P('');
P('## 4. Yang kami tandai sendiri');
P('');
P('Dihitung dari datanya, bukan dari penilaian agronomi — supaya waktu peninjau tidak habis');
const ciriTot = opt.reduce((n, p) => n + (p.distinguishing ?? []).length, 0);
const ciriKosong = opt.reduce((n, p) => n + (p.distinguishing ?? []).filter((c) => !c.rules_out).length, 0);
P(`menemukan yang sudah kami ragukan. ${bertanda.length} dari ${opt.length} entri bertanda,`);
P(`dan secara keseluruhan **${ciriKosong} dari ${ciriTot} ciri pembanding tidak menyebut apa yang dibantahnya**:`);
P('');
for (const p of bertanda) P(`- **${p.label?.id}** — ${penanda(p).join('; ')}.`);
P('');
P('Dua pola itu **bukan bukti entrinya salah.** Ciri yang membantah OPT yang sama dua kali');
P('bisa saja memang dua sudut yang berbeda terhadap satu kekeliruan yang paling sering');
P('terjadi. Ciri tanpa `rules_out` bisa saja memang tidak membantah apa pun, hanya');
P('menguatkan. Keduanya hanya alasan untuk mendahulukan, bukan untuk menolak.');
P('');
P('Satu dugaan yang **tidak** bisa kami hitung, dan hanya peninjau yang tahu: apakah ciri');
P('yang menuntut membedakan warna atau ukuran kecil terlalu menuntut di lapangan — cahaya');
P('sore, mata lelah, daun berdebu. Ciri yang menuntut sebuah **tindakan** (mengibaskan ke');
P('kertas putih, merendam potongan batang di gelas) tampaknya lebih tahan, tetapi itu');
P('dugaan kami, bukan pengetahuan kami.');
P('');
P('## 5. Kalau tinjauannya tidak jadi');
P('');
P('Teks-teks ini tetap tampil, tetap bertingkat bukti D, dan tetap menyatakan dirinya');
P('draft di layar. Yang hilang bukan produknya, melainkan hak untuk berhenti');
P('memperingatkan — dan bagi pembeli institusional, protokol tanpa peninjau bernama tidak');
P('bisa naik dari catatan menjadi anjuran.');

const teks = B.join('\n') + '\n';
if (tulis) { writeFileSync(resolve(AKAR, tulis), teks); console.log(`Ditulis ke ${tulis} · ${opt.length} entri, ${B.length} baris`); }
else console.log(teks);
