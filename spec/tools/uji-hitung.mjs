// Uji aritmetika yang keluarannya keputusan belanja petani.
//
//   node spec/tools/uji-hitung.mjs
//
// KENAPA BERKAS INI ADA. Kolom takaran per tangki pernah salah sepuluh sampai seratus kali
// lipat di 483 halaman, berbulan-bulan, tanpa satu pun yang menangkapnya — karena
// perkaliannya terkurung di dalam skrip yang tidak bisa dijalankan tanpa membangun 30 ribu
// halaman lebih dulu. Tiga angka lain di permukaan ini punya taruhan yang setara dan
// sampai 24 Agustus 2026 punya masalah yang sama: rupiah per kilogram hara, titik impas,
// dan harga yang benar-benar diterima semuanya tinggal di modul yang menyentuh DOM di
// baris pertamanya.
//
// Yang diuji di sini bukan cuma jawaban benarnya, melainkan PENOLAKANNYA. Nol adalah
// jawaban — ia berarti "gratis" atau "impas di angka nol" — dan mencetaknya ketika
// masukannya belum lengkap adalah cara paling halus sebuah kalkulator berbohong.

import {
  rupiahPerKgHara, titikImpas, hargaDiterima, rasioTerhadap, haraMustahil, BATAS_HARA,
} from '../../app/hitung.js';

let lolos = 0; const gagal = [];
const uji = (nama, dapat, harap) => {
  const sama = Object.is(dapat, harap)
    || (typeof dapat === 'number' && typeof harap === 'number' && Math.abs(dapat - harap) < 1e-9);
  if (sama) { lolos++; return; }
  gagal.push(`${nama}\n    diharap : ${JSON.stringify(harap)}\n    didapat : ${JSON.stringify(dapat)}`);
};

// --- rupiah per kilogram hara ---------------------------------------------------------
// PHONSKA 15-15-15: 450 g hara per kg. Sekarung 50 kg seharga Rp180.000 berarti Rp3.600/kg
// produk, dan karena haranya 45% → Rp8.000 per kg hara.
uji('NPK 15-15-15, Rp180.000 per 50 kg', rupiahPerKgHara(180000, 50, 450), 8000);
uji('hara separuh → dua kali lipat per kg hara', rupiahPerKgHara(180000, 50, 225), 16000);
uji('kemasan dua kali lebih besar → separuh harga per kg hara', rupiahPerKgHara(180000, 100, 450), 4000);
uji('hara 1000 g/kg (murni) = harga produknya sendiri', rupiahPerKgHara(10000, 1, 1000), 10000);

// Yang harus DITOLAK, bukan dijawab nol.
uji('tanpa harga', rupiahPerKgHara(0, 50, 450), null);
uji('tanpa isi kemasan', rupiahPerKgHara(180000, 0, 450), null);
uji('registri tidak mencatat komposisi', rupiahPerKgHara(180000, 50, 0), null);
uji('harga negatif', rupiahPerKgHara(-1000, 50, 450), null);
uji('harga bukan angka', rupiahPerKgHara(NaN, 50, 450), null);
uji('isi bukan angka', rupiahPerKgHara(180000, undefined, 450), null);

// Komposisi mustahil: fraksi di atas 1,0 membuat hasilnya lebih murah daripada produknya
// sendiri, dan layar pembanding kemurahan akan menobatkan data yang rusak sebagai juara.
uji('Eco Bio Farming — 1.308 g/kg ditolak', rupiahPerKgHara(180000, 50, 1308.3), null);
uji('tepat di ambang masih dijawab', rupiahPerKgHara(10000, 1, BATAS_HARA), 10000);
uji('sedikit di atas ambang ditolak', rupiahPerKgHara(10000, 1, BATAS_HARA + 0.1), null);
uji('haraMustahil di ambang', haraMustahil(BATAS_HARA), false);
uji('haraMustahil di atas ambang', haraMustahil(BATAS_HARA + 1), true);

// --- titik impas ----------------------------------------------------------------------
uji('biaya 12 juta, panen 3.000 kg', titikImpas(12000000, 3000), 4000);
uji('panen separuh → impas dua kali lipat', titikImpas(12000000, 1500), 8000);
uji('belum ada panen — bukan impas nol', titikImpas(12000000, 0), null);
uji('belum ada biaya', titikImpas(0, 3000), null);
uji('panen negatif', titikImpas(12000000, -5), null);

// --- harga yang benar-benar diterima ---------------------------------------------------
uji('Rp15 juta masuk atas 3.000 kg', hargaDiterima(15000000, 3000), 5000);
uji('belum ada uang masuk', hargaDiterima(0, 3000), null);
uji('belum ada panen tercatat', hargaDiterima(15000000, 0), null);

// --- rasio, bukan dua angka berdampingan ------------------------------------------------
uji('diterima 5.000 atas eceran 6.250 = 0,8', rasioTerhadap(5000, 6250), 0.8);
uji('sama persis = 1', rasioTerhadap(5000, 5000), 1);
uji('pembanding nol ditolak', rasioTerhadap(5000, 0), null);

// --- penjaga arah: hubungan antar-angka tidak boleh terbalik ----------------------------
// Kalau suatu hari pembilang dan penyebut tertukar, angka-angka ini meloncat ke arah yang
// salah dan baris di bawah gagal lebih dulu daripada layarnya.
{
  const murah = rupiahPerKgHara(100000, 50, 450);
  const mahal = rupiahPerKgHara(200000, 50, 450);
  uji('harga naik → rupiah per kg hara ikut naik', mahal > murah, true);
  const sedikitHara = rupiahPerKgHara(180000, 50, 200);
  const banyakHara = rupiahPerKgHara(180000, 50, 800);
  uji('hara lebih banyak → lebih murah per kg hara', banyakHara < sedikitHara, true);
  uji('panen lebih banyak → titik impas lebih rendah', titikImpas(12e6, 6000) < titikImpas(12e6, 3000), true);
}

// --------------------------------------------------------------------------------------
if (gagal.length) {
  console.error(`uji hitung: ${gagal.length} GAGAL, ${lolos} lolos\n`);
  for (const g of gagal) console.error(`  ✗ ${g}\n`);
  process.exit(1);
}
console.log(`uji hitung: ${lolos}/${lolos} lolos — rupiah/kg hara, titik impas, dan harga diterima terkunci`);
