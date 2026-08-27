// Menulis teks gejala dan ciri pembanding untuk sepuluh OPT cabai terkurasi.
//
//   node spec/tools/tulis-gejala-opt.mjs            # periksa saja
//   node spec/tools/tulis-gejala-opt.mjs --tulis    # tulis ke vocab/pest.json
//
// KENAPA MEDANNYA BARU, DAN KENAPA `definition` TIDAK DIPAKAI
// Sepuluh OPT ini sudah punya `definition`, dan sempat terhitung sebagai "sudah punya
// teks gejala". Isinya bukan gejala:
//
//   Trips        "Vektor virus, menyebabkan daun keriting ke atas."
//   Kutu kebul   "Vektor virus kuning keriting."
//   Antraknosa   "Patek. Penyebab kerugian terbesar pada cabai di banyak sentra."
//
// Itu catatan epidemiologi — berguna, tetapi bukan yang dicari orang yang berdiri di
// depan tanamannya. Jalur insiden masuk lewat APA YANG TERLIHAT, dan yang panik tahu
// daunnya mengeriting ke atas; ia tidak tahu kata "trips". Karena itu `symptoms`
// berdiri sendiri, dan `definition` dibiarkan apa adanya.
//
// KENAPA CIRI PEMBANDING WAJIB IKUT
// Mesin tidak menebak, orang yang memilih — itu keputusan rancangan jalur 1, dan
// bagian sistem yang paling dekat ke tanggung jawab hukum. Diagnosis salah yang
// percaya diri menghasilkan semprotan salah: uang hilang, tanaman tetap mati,
// kepercayaan habis di kejadian pertama. Jadi tiap gejala membawa dua pemeriksaan
// yang bisa dikerjakan sendiri tanpa alat, dan tiap pemeriksaan menyebut OPT mana
// yang terbantah kalau hasilnya begitu.
//
// Dua di antaranya uji yang benar-benar memutuskan, bukan sekadar ciri:
//   - Uji gelas untuk layu bakteri: potongan batang dicelup air bening mengeluarkan
//     untaian lendir putih. Fusarium tidak. Ini membedakan dua penyakit yang gejalanya
//     nyaris sama dan penanganannya sama sekali berbeda.
//   - Kertas putih untuk trips: daun dikibaskan di atasnya, trips terlihat bergerak.
//     Tanpa itu, keriting ke atas mudah tertukar dengan virus kuning — dan virus tidak
//     bisa disemprot apa pun.
//
// ALAT INI TIDAK LAGI BERWENANG PENUH ATAS DUA ENTRI
// Sejak spec/tools/kurasi-opt-bawang.mjs (28 Agustus 2026), layu fusarium dan kutu daun
// persik melayani cabai SEKALIGUS bawang merah, dan teks gejalanya di sana dibuka jadi
// dua kalimat bertanaman. Teks di bawah masih versi cabai-saja. Kalau alat ini dijalankan
// ulang dengan --tulis, jalankan alat itu sesudahnya — kalau tidak, klausa bawang merah
// hilang tanpa ada yang menyalak.
//
// BATAS YANG HARUS IKUT TERBACA
// Teks di bawah disusun dari pengetahuan agronomi yang mapan tentang OPT cabai, BUKAN
// dari tarikan registri dan bukan dari satu terbitan tertentu. Statusnya draft dan
// wajib ditinjau penyuluh atau BPTP sebelum naik ke published — itu sebabnya tiap
// entri diberi catatan yang menyatakannya, dan catatannya ikut sampai ke layar.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BERKAS = join(akar, 'spec', 'vocab', 'pest.json');
const STAMP = '2026-08-20T00:00:00Z';
const tulis = process.argv.includes('--tulis');

const CATATAN =
  'Teks gejala dan ciri pembanding disusun dari pengetahuan agronomi mapan tentang OPT cabai, bukan dari registri. ' +
  'Berstatus draft: wajib ditinjau penyuluh atau BPTP sebelum dipakai sebagai dasar keputusan.';

// nama dipakai penjaga: kalau labelnya berubah, entri ini sudah menunjuk hal lain.
const GEJALA = {
  'op:pst:00000001': {
    nama: 'Trips',
    gejala:
      'Daun muda mengeriting ke ATAS seperti mangkuk, dan permukaan bawahnya keperakan atau kecoklatan seperti tergores halus. Bunga dan tunas rontok sebelum jadi buah; tanaman kerdil dan pucuknya mengumpul.',
    pembanding: [
      {
        cek: 'Kibaskan daun pucuk di atas kertas putih. Trips terlihat sebagai serangga kuning kecoklatan sepanjang 1–2 mm yang langsung bergerak cepat. Kalau tidak ada yang bergerak, penyebabnya bukan trips.',
        membantah: { id: 'op:pst:00000010', label: 'Virus kuning keriting' },
      },
      {
        cek: 'Lihat warna daun yang mengeriting. Pada trips daunnya tetap hijau dengan goresan keperakan; kalau daunnya menguning terang dan mengecil tanpa goresan, itu gejala virus dan tidak ada semprotan yang menyembuhkannya.',
        membantah: { id: 'op:pst:00000010', label: 'Virus kuning keriting' },
      },
    ],
  },
  'op:pst:00000002': {
    nama: 'Kutu daun persik',
    gejala:
      'Daun muda mengeriting ke BAWAH dan mengerut. Permukaan daun lengket, sering ditumbuhi jelaga hitam, dan semut naik-turun di batang.',
    pembanding: [
      {
        cek: 'Balik daun pucuk. Kutu daun bertubuh lunak seperti buah pir kecil, hijau atau kekuningan, berkelompok rapat dan bergerak lambat — berbeda dari trips yang langsing dan berlari cepat.',
        membantah: { id: 'op:pst:00000001', label: 'Trips' },
      },
      {
        cek: 'Raba permukaan daun. Lengket berarti ada embun madu, dan itu hanya dihasilkan kutu daun atau kutu kebul. Trips dan tungau tidak menghasilkannya.',
        membantah: { id: 'op:pst:00000006', label: 'Tungau merah' },
      },
    ],
  },
  'op:pst:00000003': {
    nama: 'Kutu kebul',
    gejala:
      'Serangga putih sangat kecil beterbangan berhamburan saat tanaman disentuh, lalu hinggap lagi. Daun lengket dan berjelaga hitam, dan lama-lama menguning.',
    pembanding: [
      {
        cek: 'Goyang tanaman. Kutu kebul terbang seperti serbuk bedak putih lalu kembali hinggap; kutu daun tidak terbang berhamburan seperti itu.',
        membantah: { id: 'op:pst:00000002', label: 'Kutu daun persik' },
      },
      {
        cek: 'Balik daun bawah. Nimfa kutu kebul menempel seperti sisik bening pipih dan tidak bergerak sama sekali — mudah dikira kotoran.',
      },
    ],
  },
  'op:pst:00000004': {
    nama: 'Lalat buah',
    gejala:
      'Buah berlubang tusukan sebesar ujung jarum, di sekitarnya melunak dan basah, lalu gugur sebelum tua. Di dalam buah yang gugur ada belatung putih.',
    pembanding: [
      {
        cek: 'Belah buah yang gugur. Kalau ada belatung putih tanpa kaki yang melenting saat disentuh, itu lalat buah. Antraknosa tidak pernah berbelatung.',
        membantah: { id: 'op:pst:00000007', label: 'Antraknosa' },
      },
      {
        cek: 'Lihat bentuk kerusakannya. Lalat buah meninggalkan titik tusukan dengan daerah lembek berair di sekitarnya; antraknosa memberi bercak melingkar cekung dan kering dengan titik hitam di tengahnya.',
        membantah: { id: 'op:pst:00000007', label: 'Antraknosa' },
      },
    ],
  },
  'op:pst:00000005': {
    nama: 'Ulat grayak',
    gejala:
      'Daun berlubang tidak beraturan sampai tinggal tulang daunnya, dan kerusakannya bertambah cepat dalam semalam. Ada butiran kotoran hitam menumpuk di ketiak daun.',
    pembanding: [
      {
        cek: 'Cari pada siang hari di bawah daun, di ketiak, atau di tanah dekat pangkal batang. Ulat grayak bersembunyi saat panas dan makan pada malam hari; kalau tidak ditemukan di bagian atas tanaman, itu justru cocok.',
      },
      {
        cek: 'Perhatikan ulatnya. Ulat muda berkelompok rapat pada satu daun sebelum menyebar, dan ulat besar punya sepasang bintik hitam di ruas belakang kepalanya.',
      },
    ],
  },
  'op:pst:00000006': {
    nama: 'Tungau merah',
    gejala:
      'Daun berbintik kuning halus rapat seperti tertusuk jarum, lalu menguning menyeluruh, kecoklatan, dan kering. Serangan berat meninggalkan anyaman benang halus di pucuk dan bawah daun.',
    pembanding: [
      {
        cek: 'Cari anyaman benang halus di bawah daun dan di sela pucuk, paling jelas kena sinar miring. Trips dan kutu tidak pernah membuat anyaman.',
        membantah: { id: 'op:pst:00000001', label: 'Trips' },
      },
      {
        cek: 'Balik daun dan tatap lama. Tungau tampak sebagai titik-titik bergerak jauh lebih kecil dari trips — di bawah setengah milimeter, kemerahan atau kehijauan dengan dua bercak gelap.',
      },
    ],
  },
  'op:pst:00000007': {
    nama: 'Antraknosa',
    gejala:
      'Bercak melingkar cekung pada buah, mula-mula berair lalu meluas dan menghitam. Di tengah bercak muncul titik-titik hitam kecil tersusun melingkar. Buah akhirnya mengering dan keriput.',
    pembanding: [
      {
        cek: 'Lihat titik hitam di tengah bercak. Susunannya melingkar sepusat, dan itu tubuh buah jamurnya — tidak ada pada busuk karena tusukan lalat buah.',
        membantah: { id: 'op:pst:00000004', label: 'Lalat buah' },
      },
      {
        cek: 'Tekan bercaknya. Antraknosa cekung dan kering seperti kulit tertarik ke dalam; busuk bakteri lembek berair dan berbau.',
      },
    ],
  },
  'op:pst:00000008': {
    nama: 'Layu fusarium',
    gejala:
      'Tanaman layu perlahan selama beberapa hari. Daun bawah menguning lebih dulu, sering hanya pada satu sisi tanaman, dan layunya menetap walau tanah lembap.',
    pembanding: [
      {
        cek: 'Belah pangkal batang membujur. Pembuluh di dalamnya berwarna coklat memanjang, sementara jaringan lain masih putih.',
      },
      {
        cek: 'UJI GELAS. Potong batang dekat pangkal, celupkan ujungnya ke gelas berisi air bening, diamkan lima menit. Kalau TIDAK keluar lendir putih, penyebabnya fusarium, bukan bakteri.',
        membantah: { id: 'op:pst:00000009', label: 'Layu bakteri' },
      },
    ],
  },
  'op:pst:00000009': {
    nama: 'Layu bakteri',
    gejala:
      'Tanaman layu mendadak, sering hanya dalam satu sampai dua hari, dan daunnya MASIH HIJAU saat layu — tidak menguning lebih dulu. Pangkal batang kecoklatan dan basah.',
    pembanding: [
      {
        cek: 'UJI GELAS. Potong batang dekat pangkal, celupkan ujungnya ke gelas berisi air bening, diamkan lima menit. Untaian lendir putih susu yang turun perlahan dari potongan berarti layu bakteri.',
        membantah: { id: 'op:pst:00000008', label: 'Layu fusarium' },
      },
      {
        cek: 'Perhatikan warna daun saat layu. Layu bakteri menyerang cepat dengan daun masih hijau; fusarium menguningkan daun bawah lebih dulu dan berjalan berhari-hari.',
        membantah: { id: 'op:pst:00000008', label: 'Layu fusarium' },
      },
    ],
  },
  'op:pst:00000010': {
    nama: 'Virus kuning keriting',
    gejala:
      'Daun muda menguning terang, mengecil, dan mengeriting ke atas dengan tulang daun menebal. Tanaman kerdil, buahnya sedikit dan kecil, dan tidak pulih walau disemprot apa pun.',
    pembanding: [
      {
        cek: 'Periksa daun yang menguning itu sendiri. Tidak ada lubang, bercak, goresan, anyaman, atau serangga di atasnya — yang berubah hanya warna dan bentuknya.',
        membantah: { id: 'op:pst:00000001', label: 'Trips' },
      },
      {
        cek: 'Goyang tanaman di sekitarnya dan cari kutu kebul putih yang beterbangan. Virus ini ditularkan kutu kebul, jadi kehadirannya menguatkan — tetapi mengendalikan kutu kebulnya tidak menyembuhkan tanaman yang sudah terkena.',
        membantah: { id: 'op:pst:00000003', label: 'Kutu kebul' },
      },
    ],
  },
};

const larik = (o) => (Array.isArray(o) ? o : o[Object.keys(o).find((k) => Array.isArray(o[k]))]);
const bungkus = JSON.parse(readFileSync(BERKAS, 'utf8'));
const opt = larik(bungkus);
const olehId = new Map(opt.map((e) => [e.id, e]));

const salah = [];
for (const [id, g] of Object.entries(GEJALA)) {
  const e = olehId.get(id);
  if (!e) { salah.push(`${id} tidak ada di pest.json`); continue; }
  if (e.label.id !== g.nama) salah.push(`${id} kini bernama ${JSON.stringify(e.label.id)}, tabel mencatat ${JSON.stringify(g.nama)}`);
  for (const p of g.pembanding) {
    if (!p.membantah) continue;
    const t = olehId.get(p.membantah.id);
    if (!t) salah.push(`${id}: rules_out ${p.membantah.id} tidak ada`);
    else if (t.label.id !== p.membantah.label) salah.push(`${id}: rules_out ${p.membantah.id} kini bernama ${JSON.stringify(t.label.id)}`);
  }
}
const belum = opt.filter((e) => !GEJALA[e.id]).map((e) => `${e.id} ${e.label.id}`);
if (belum.length) salah.push(`OPT terkurasi tanpa entri gejala: ${belum.join(', ')}`);

if (salah.length) {
  console.error('BERHENTI — tabel tidak cocok dengan kosakata:');
  for (const s of salah) console.error(`  ${s}`);
  process.exit(1);
}

const kurang = Object.entries(GEJALA).filter(([, g]) => g.pembanding.length < 2);
if (kurang.length) {
  console.error('BERHENTI — tiap gejala wajib membawa dua ciri pembanding:');
  for (const [id, g] of kurang) console.error(`  ${id} ${g.nama}: ${g.pembanding.length}`);
  process.exit(1);
}

console.log(`OPT terkurasi        : ${opt.length}`);
console.log(`Entri gejala         : ${Object.keys(GEJALA).length}`);
console.log(`Ciri pembanding      : ${Object.values(GEJALA).reduce((a, g) => a + g.pembanding.length, 0)}`);
console.log(`Yang menyebut bantahan: ${Object.values(GEJALA).reduce((a, g) => a + g.pembanding.filter((p) => p.membantah).length, 0)}\n`);
for (const [, g] of Object.entries(GEJALA)) console.log(`  ${g.nama.padEnd(23)} ${g.gejala.slice(0, 68)}…`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menerapkan.');
  process.exit(0);
}

let ubah = 0;
for (const [id, g] of Object.entries(GEJALA)) {
  const e = olehId.get(id);
  e.symptoms = { id: g.gejala };
  e.distinguishing = g.pembanding.map((p) => ({
    check: { id: p.cek },
    ...(p.membantah ? { rules_out: p.membantah } : {}),
  }));
  e.notes = { id: CATATAN };
  e.lifecycle = { ...(e.lifecycle ?? {}), updated_at: STAMP };
  ubah++;
}
writeFileSync(BERKAS, JSON.stringify(bungkus, null, 2) + '\n');
console.log(`\nDitulis: ${ubah} entri ke vocab/pest.json`);
