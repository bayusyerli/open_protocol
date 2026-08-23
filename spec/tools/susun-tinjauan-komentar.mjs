// Menyusun daftar tinjauan komentar harga untuk dibaca manusia.
//
//   node spec/tools/susun-tinjauan-komentar.mjs [--tulis docs/18-tinjauan-komentar-harga.md]
//
// KENAPA ALAT INI ADA, DAN KENAPA IA ALAT
// Sama seperti susun-tinjauan-gejala.mjs, dan karena alasan yang sama. 43 komentar harga
// bertingkat D dan mengatakannya sendiri di layar. Yang menahannya naik bukan datanya,
// melainkan tidak adanya orang yang sudah membacanya. Meminta orang itu membuka berkas
// JSON 1.855 baris untuk menemukan yang perlu dibaca adalah cara paling pasti membuat ia
// tidak jadi membaca.
//
// Dibuat sebagai alat, bukan dokumen tangan, karena komentarnya ditulis ulang setiap kali
// angkanya bergeser — dan daftar tinjauan yang sudah usang lebih buruk daripada tidak ada.
//
// YANG DITANDAI SENDIRI, ALIH-ALIH DISERAHKAN KE PEMBACA
// Empat pola yang bisa dihitung tanpa pengetahuan pasar, dan tiap satunya alasan untuk
// MENDAHULUKAN sebuah entri — bukan bukti bahwa entrinya salah:
//
//   1. DICABUT — dan pencabutannya sendiri sebuah temuan. Penanda pertama dulu berbunyi
//      "titik ekstremnya jatuh di sepersepuluh awal seri". Ia menyala pada 42 dari 43 entri,
//      dan yang menyala pada hampir semuanya tidak mendahulukan apa pun. Sebabnya bukan
//      ambang yang keliru melainkan sifat datasetnya: seluruh seri mulai 1 Februari 2024,
//      di tengah lonjakan pangan, sehingga 40 dari 43 mencapai PUNCAK tertingginya pada
//      Feb–Mei 2024 dan 38 dari 43 mencapai titik TERENDAHNYA di jendela yang sama.
//      Kedua ekstremnya menumpuk di empat bulan pertama. Itu keterangan tentang datasetnya,
//      bukan tentang satu komoditas, jadi ia dipindah jadi catatan menyeluruh di bagian 1
//      lembar tinjauan — dan ikut disebut di layar harga saat ekstremnya jatuh di sana.
//   2. Seri berlubang JAUH LEBIH banyak daripada seri lain. Ambang mutlak tidak berguna di
//      sini, dan itu ketahuan saat dijalankan: rasio lubang seluruh seri terkumpul rapat di
//      sekitar 32% — p25 32,0%, median 32,2%, p75 32,4% — karena SP2KP memang tidak mencacah
//      akhir pekan, yang saja sudah 28,5% hari kalender. Ambang "lebih dari seperempat"
//      karena itu menandai KESELURUHAN 43 entri dan tidak membedakan apa pun. Yang
//      membedakan adalah simpangan dari normanya, dan dengan itu tinggal dua yang tersisa:
//      Beras SPHP Bulog (39,8%) dan Benih Padi (91,5%).
//   3. Gejolak tinggi dengan klaim musim. Koefisien variasi di atas 20% berarti sebaran
//      bulanannya lebar, dan "paling tinggi pada Mei" bisa jadi kebetulan dua tahun.
//   4. Rentang seri pendek. Di bawah 500 titik, pola dua belas bulan bersandar pada satu
//      sampai dua pengamatan per bulan.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const tulis = arg('tulis');

const KOMENTAR = join(akar, 'spec', 'vocab', 'harga', 'komentar.json');
const HARGA = join(akar, 'spec', 'vocab', 'harga', 'harga.ndjson');

for (const p of [KOMENTAR, HARGA]) {
  if (!existsSync(p)) { console.error(`${p} tidak ada. Bangun dulu kosakata harga dan komentarnya.`); process.exit(1); }
}

const doc = JSON.parse(readFileSync(KOMENTAR, 'utf8'));
const seri = new Map(readFileSync(HARGA, 'utf8').split('\n').filter((l) => l.trim())
  .map((l) => JSON.parse(l)).map((h) => [h.key, h]));

const HARI = 86400000;
const rp = (x) => 'Rp' + Math.round(Number(x)).toLocaleString('id-ID');
const num = (x, d = 1) => (x === null || x === undefined ? '—'
  : Number(x).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d }));

// Norma rasio lubang, dihitung dari serinya sendiri — bukan angka yang diketik di sini.
// Kalau SP2KP suatu saat mulai mencacah akhir pekan, normanya turun sendiri dan ambangnya
// ikut, tanpa ada yang perlu ingat memperbaruinya.
const HARI_MS = 86400000;
const rasioLubang = (h) => {
  const r = (new Date(h.coverage.to) - new Date(h.coverage.from)) / HARI_MS + 1;
  return (h.coverage.gaps ?? 0) / r;
};
const semuaRasio = [...seri.values()].filter((h) => h.series?.length).map(rasioLubang).sort((a, b) => a - b);
const NORMA_LUBANG = semuaRasio.length ? semuaRasio[Math.floor(semuaRasio.length / 2)] : 0;

function penanda(kunci, rek) {
  const h = seri.get(kunci);
  const s = h?.stats;
  const t = [];
  if (!s) return t;

  const awal = new Date(h.coverage.from).getTime();
  const akhir = new Date(h.coverage.to).getTime();
  const rentang = (akhir - awal) / HARI || 1;
  const bolong = h.coverage.gaps ?? 0;
  const rasio = bolong / (rentang + 1);
  if (rasio > NORMA_LUBANG + 0.05) {
    t.push(`${bolong} dari ${Math.round(rentang) + 1} hari kalender tanpa angka (${num(rasio * 100)}%) — ` +
      `jauh di atas norma ${num(NORMA_LUBANG * 100)}%, jadi ini bukan sekadar akhir pekan; rata-rata bulanannya ` +
      `bersandar pada lebih sedikit pengamatan daripada yang terbaca`);
  }
  if (s.gejolak > 20 && s.musim) {
    t.push(`gejolak ${num(s.gejolak)}% dengan klaim pola bulanan — sebarannya lebar, dan "paling tinggi pada bulan X" bisa kebetulan dua tahun`);
  }
  if (h.coverage.points < 500 && s.musim) {
    t.push(`${h.coverage.points} titik untuk pola dua belas bulan — satu sampai dua pengamatan per bulan`);
  }
  return t;
}

const entri = Object.entries(doc.komentar ?? {})
  .map(([kunci, rek]) => ({ kunci, rek, tanda: penanda(kunci, rek), h: seri.get(kunci) }))
  // Yang bertanda didahulukan, lalu abjad. Peninjau yang berhenti di tengah tetap sudah
  // membaca yang paling mungkin bermasalah.
  .sort((a, b) => b.tanda.length - a.tanda.length || a.kunci.localeCompare(b.kunci, 'id'));

const sudah = entri.filter((x) => x.rek.ditinjau).length;
const sumberModel = entri.filter((x) => x.rek.sumber === 'model').length;

const baris = [];
baris.push('# Daftar Tinjauan — Komentar Harga Komoditas');
baris.push('');
baris.push('> Bahan untuk pemilik repositori atau siapa pun yang mau menempelkan namanya ·');
baris.push('> dibangkitkan dari `spec/vocab/harga/komentar.json` oleh');
baris.push('> `spec/tools/susun-tinjauan-komentar.mjs` · jalankan ulang bila komentarnya berubah');
baris.push('>');
baris.push('> Menaikkan tingkat bukti komentar dari **D** begitu tinjauannya masuk.');
baris.push('');
baris.push('---');
baris.push('');
baris.push('## 1. Apa yang diminta, dan apa yang tidak');
baris.push('');
baris.push('Kalimat-kalimat di bawah tampil di halaman harga, tepat di bawah angkanya. Halaman');
baris.push('itu **tidak menganjurkan apa pun**: ia menyajikan angka, lalu satu paragraf yang');
baris.push('membacanya. Paragraf itulah yang ditinjau di sini — bukan angkanya.');
baris.push('');
baris.push('Angkanya sendiri bertingkat **B**: survei resmi Kemendag, disalin apa adanya, dan');
baris.push('sudah lewat pemeriksaan mesin yang memastikan tiap angka di kalimat memang berasal');
baris.push('dari faktanya. Yang belum diperiksa siapa pun adalah **apakah kalimatnya membaca');
baris.push('angka itu dengan jujur.**');
baris.push('');
baris.push('Yang diminta dari peninjau, untuk tiap entri:');
baris.push('');
baris.push('1. **Apakah kalimatnya menyesatkan** — bukan apakah ia lengkap, tetapi apakah');
baris.push('   seseorang yang membacanya akan menyimpulkan sesuatu yang tidak benar.');
baris.push('2. **Apakah pola yang disebutnya sungguh ada,** atau ia kebetulan dua tahun yang');
baris.push('   dibungkus jadi kebiasaan tahunan.');
baris.push('3. **Apakah batas di kalimat terakhirnya batas yang benar** — apakah itu memang hal');
baris.push('   terpenting yang angka ini tidak katakan, atau ada yang lebih penting.');
baris.push('');
baris.push('**Satu catatan yang berlaku untuk seluruh 43 entri, dan sebaiknya dibaca sekali di sini');
baris.push('alih-alih diulang di tiap entri.** Seri SP2KP mulai 1 Februari 2024, di tengah lonjakan');
baris.push('harga pangan — sehingga **40 dari 43 komoditas mencapai puncak tertingginya pada');
baris.push('Februari–Mei 2024, dan 38 dari 43 mencapai titik terendahnya di jendela yang sama.**');
baris.push('Kedua ekstremnya menumpuk di empat bulan pertama.');
baris.push('');
baris.push('Akibatnya "terendah" dan "tertinggi" di tiap kalimat lebih banyak berkata tentang');
baris.push('**kapan serinya kebetulan dimulai** daripada tentang komoditasnya. Itu bukan alasan');
baris.push('menolak kalimatnya — angkanya benar — tetapi ia alasan memeriksa apakah kalimatnya');
baris.push('menyiratkan lebih daripada itu.');
baris.push('');
baris.push('Yang **tidak** diminta:');
baris.push('');
baris.push(`- Bukan menghitung hari yang kosong. Sekitar **${num(NORMA_LUBANG * 100)}% hari kalender di tiap seri`);
baris.push('  tidak punya angka**, dan itu normal: SP2KP tidak mencacah akhir pekan, yang saja sudah');
baris.push('  28,5% hari. Angka "300 hari tanpa angka" di tabel bawah karena itu bukan tanda bahaya —');
baris.push('  yang ditandai hanya seri yang menyimpang jauh dari norma itu.');
baris.push('- Bukan memeriksa aritmetikanya. Itu sudah dikerjakan mesin, dan hasilnya tercatat');
baris.push('  di medan `diperiksaMesin` tiap rekaman.');
baris.push('- Bukan menambah komoditas. Cakupan yang sempit sudah diketahui dan dinyatakan di');
baris.push('  layar; ia bukan yang ditinjau di sini.');
baris.push('- Bukan menjamin bebas kekeliruan. Yang dicari **bacaan yang menyesatkan**, bukan');
baris.push('  ketidaksempurnaan.');
baris.push('');
baris.push('## 2. Apa yang menempel pada nama peninjau');
baris.push('');
baris.push('- Nama dan tanggal tinjau **ikut tercatat** di `komentar.json` dan bisa tampil di layar.');
baris.push('- Tingkat buktinya naik dari **D**; seberapa tinggi bergantung siapa yang meninjau.');
baris.push('- **Tinjauan menempel pada susunan angka yang ditinjau, bukan pada komoditasnya.**');
baris.push('  Begitu serinya bertambah dan kalimatnya ditulis ulang, tinjauan lama gugur');
baris.push('  sendiri dan medannya kembali kosong. Nama Anda tidak akan pernah menaungi kalimat');
baris.push('  yang belum Anda baca.');
baris.push('- Tinjauan boleh berupa **penolakan.** "Kalimat ini menyesatkan dan sebaiknya');
baris.push('  dicabut" adalah hasil yang sah dan lebih berharga daripada persetujuan setengah hati.');
baris.push('');
baris.push('Mencatat tinjauan, satu per satu:');
baris.push('');
baris.push('```bash');
baris.push('node spec/tools/periksa-komentar-harga.mjs --tulis \\');
baris.push('  --tinjau <kunci> --oleh "Nama, Institusi" --tanggal YYYY-MM-DD');
baris.push('```');
baris.push('');
baris.push('Atau, setelah membaca seluruhnya, sekaligus dengan `--tinjau-semua`. Perintah itu');
baris.push('**menolak jalan** bila ada satu saja yang tidak lolos pemeriksaan mesin.');
baris.push('');
baris.push('---');
baris.push('');
baris.push('## 3. Keadaan sekarang');
baris.push('');
baris.push('| | |');
baris.push('|---|---:|');
baris.push(`| Komentar | ${entri.length} |`);
baris.push(`| Ditulis model bahasa | ${sumberModel} |`);
baris.push(`| Ditulis aturan atas angkanya sendiri | ${entri.length - sumberModel} |`);
baris.push(`| Lolos pemeriksaan mesin | ${entri.filter((x) => x.rek.diperiksaMesin?.lolos).length} |`);
baris.push(`| **Sudah ditinjau manusia** | **${sudah}** |`);
baris.push(`| Bertanda perlu didahulukan | ${entri.filter((x) => x.tanda.length).length} |`);
baris.push('');
baris.push('---');
baris.push('');
baris.push(`## 4. Keempat puluh tiga entri`);
baris.push('');
baris.push('Diurutkan menurut jumlah penanda, lalu abjad. Yang berhenti di tengah tetap sudah');
baris.push('membaca yang paling mungkin bermasalah.');
baris.push('');

for (const [i, x] of entri.entries()) {
  const s = x.h?.stats;
  baris.push(`### ${i + 1}. ${x.rek.nama}`);
  baris.push('');
  baris.push(`\`${x.kunci}\` · ${x.rek.id} · ditulis ${x.rek.sumber === 'model' ? `model ${x.rek.model ?? ''}`.trim() : 'aturan'} · ` +
    `${x.rek.ditinjau ? `**ditinjau ${x.rek.ditinjauOleh} pada ${x.rek.ditinjau}**` : '**belum ditinjau**'}`);
  baris.push('');
  if (x.tanda.length) {
    baris.push('> **Didahulukan karena:**');
    for (const t of x.tanda) baris.push(`> - ${t}`);
    baris.push('');
  }
  baris.push('**Kalimatnya:**');
  baris.push('');
  baris.push(`> ${x.rek.komentar}`);
  baris.push('');
  if (s) {
    baris.push('**Angka yang dipakai menulisnya:**');
    baris.push('');
    baris.push('| | |');
    baris.push('|---|---:|');
    baris.push(`| Harga terakhir | ${rp(s.terakhir.p)} / ${x.h.unit} pada ${s.terakhir.t} |`);
    baris.push(`| Ubah 7 / 30 / 90 / 365 hari | ${num(s.ubah7)}% · ${num(s.ubah30)}% · ${num(s.ubah90)}% · ${num(s.ubah365)}% |`);
    baris.push(`| Terendah | ${rp(s.min.p)} pada ${s.min.t} |`);
    baris.push(`| Tertinggi | ${rp(s.maks.p)} pada ${s.maks.t} |`);
    baris.push(`| Rata-rata · gejolak | ${rp(s.rata)} · ${num(s.gejolak)}% |`);
    if (s.musim) baris.push(`| Bulan termahal / termurah | ${s.musim.bulanTertinggi} / ${s.musim.bulanTerendah} — selisih ${num(s.musim.rentangPersen)}% |`);
    baris.push(`| Cakupan | ${x.h.coverage.from} – ${x.h.coverage.to} · ${x.h.coverage.points} titik · ${x.h.coverage.gaps ?? 0} hari tanpa angka |`);
    baris.push('');
  }
  baris.push('- [ ] Kalimatnya tidak menyesatkan');
  baris.push('- [ ] Pola yang disebutnya sungguh ada');
  baris.push('- [ ] Batas di kalimat terakhirnya batas yang benar');
  baris.push('');
  baris.push('Catatan peninjau:');
  baris.push('');
  baris.push('---');
  baris.push('');
}

const keluaran = baris.join('\n');
if (!tulis) {
  console.log(keluaran.slice(0, 2200));
  console.log(`\n… (${baris.length} baris) — jalankan dengan --tulis <jalur> untuk menyimpan.`);
  process.exit(0);
}
writeFileSync(join(akar, tulis), keluaran);
console.log(`Entri            : ${entri.length}`);
console.log(`Bertanda         : ${entri.filter((x) => x.tanda.length).length}`);
console.log(`Sudah ditinjau   : ${sudah}`);
console.log(`Ditulis ke       : ${tulis} (${baris.length} baris)`);
