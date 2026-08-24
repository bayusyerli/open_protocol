// Uji perkalian dosis per tangki — angka paling ditindaklanjuti di seluruh terbitan.
//
//   node spec/tools/uji-dosis.mjs
//
// KENAPA BERKAS INI ADA. Kolom "per tangki 16 L" pernah salah sepuluh sampai seratus kali
// lipat di 483 halaman pestisida, berbulan-bulan, tanpa satu pun yang menangkapnya —
// karena perkaliannya tinggal di dalam skrip build yang menjalankan 30 ribu halaman begitu
// di-import, jadi tidak ada cara mengujinya. Kasus di bawah adalah kasus nyata dari
// registri: LARBAN 500/50 EC (klorpirifos + sipermetrin untuk cabai) yang tercetak 240 ml,
// dan MIPCIN 50 WP yang tercetak 400 g. Keduanya sekarang dikunci di sini.
//
// Aturannya sama seperti test-rules.mjs: gagal berarti keluar dengan kode bukan nol.

import { perTangki, angkaDosis, TANGKI, BATAS_TANGKI } from './dosis.mjs';

let lolos = 0; const gagal = [];

function uji(nama, dapat, harap) {
  if (dapat === harap) { lolos++; return; }
  gagal.push(`${nama}\n    diharap : ${JSON.stringify(harap)}\n    didapat : ${JSON.stringify(dapat)}`);
}

// --- titik sebagai desimal: kasus yang dulu salah -------------------------------------
// Inilah bug aslinya. `1.5` pernah dibaca 15, dan halaman tercetak "240 ml".
uji('LARBAN 500/50 EC — 1.5 ml/l pada cabai', perTangki('1.5 ml/l'), '24 ml');
uji('MIPCIN 50 WP — 0.25 g/l (dulu tercetak 400 g)', perTangki('0.25 g/l'), '4 g');
uji('CURACRON 500 EC — 1.125 ml/l (dulu tercetak 18.000 ml)', perTangki('1.125 ml/l'), '18 ml');
uji('0.75 ml/l', perTangki('0.75 ml/l'), '12 ml');
uji('0.375 ml/l — tiga angka di belakang titik tetap desimal', perTangki('0.375 ml/l'), '6 ml');
uji('2.0 ml/l', perTangki('2.0 ml/l'), '32 ml');
uji('1.66 ml/l', perTangki('1.66 ml/l'), '26,56 ml');

// --- koma sebagai desimal: bentuk mayoritas di registri --------------------------------
uji('1,5 ml/l', perTangki('1,5 ml/l'), '24 ml');
uji('0,25 g/l', perTangki('0,25 g/l'), '4 g');
uji('titik dan koma tak boleh berbeda hasil', perTangki('1.5 ml/l'), perTangki('1,5 ml/l'));

// --- bulat ----------------------------------------------------------------------------
uji('1 g/l', perTangki('1 g/l'), '16 g');
uji('4 ml/l', perTangki('4 ml/l'), '64 ml');

// --- rentang --------------------------------------------------------------------------
uji('1,5-2 ml/l', perTangki('1,5-2 ml/l'), '24–32 ml');
uji('1.5 - 2.5 g/l dengan spasi dan en dash', perTangki('1.5 – 2.5 g/l'), '24–40 g');

// --- satuan yang diseragamkan ---------------------------------------------------------
uji('cc jadi ml', perTangki('2 cc/l'), '32 ml');
uji('gr jadi g', perTangki('2 gr/l'), '32 g');
uji('liter ditulis panjang', perTangki('2 ml/liter'), '32 ml');
uji('huruf besar tetap terbaca', perTangki('1,5 ML/L'), '24 ml');

// --- yang harus DITOLAK, bukan ditebak ------------------------------------------------
// Menolak menghasilkan "—" di kolomnya; dosis terdaftarnya sendiri tetap tampil apa adanya.
uji('per hektare tidak boleh dikonversi', perTangki('150 - 300 ml/ha'), null);
uji('per pohon tidak boleh dikonversi', perTangki('20 ml/pohon'), null);
uji('bentuk rusak di sumber (0.,5) ditolak, bukan ditebak', perTangki('0.,5 ml/l'), null);
uji('titik ganda ditolak daripada ditebak', perTangki('1.234.5 ml/l'), null);
uji('kosong', perTangki(''), null);
uji('null', perTangki(null), null);
uji('nol bukan dosis', perTangki('0 ml/l'), null);
uji('teks tanpa angka', perTangki('sesuai anjuran ml/l'), null);
uji('batas bawah rentang nol ditolak', perTangki('1-0 ml/l'), null);

// --- ambang kewajaran: jaring kedua ---------------------------------------------------
uji('950 g/l = 15,2 kg per tangki — ditahan', perTangki('950 g/l'), null);
uji('tepat di ambang masih lewat', perTangki(`${BATAS_TANGKI / TANGKI} ml/l`), '1.000 ml');
uji('sedikit di atas ambang ditahan', perTangki(`${BATAS_TANGKI / TANGKI + 1} ml/l`), null);
uji('puncak rentang yang menentukan, bukan pangkalnya', perTangki('1-950 g/l'), null);

// --- lapor ambang dipanggil sekali, dan hanya saat ditahan ----------------------------
{
  let n = 0; const lapor = { ambang: () => { n++; } };
  perTangki('950 g/l', lapor);
  perTangki('1,5 ml/l', lapor);
  perTangki('150 ml/ha', lapor);
  uji('lapor.ambang() dipanggil tepat sekali', n, 1);
}

// --- pengurai angka telanjang ---------------------------------------------------------
uji('angkaDosis titik', angkaDosis('1.5'), 1.5);
uji('angkaDosis koma', angkaDosis('1,5'), 1.5);
uji('angkaDosis bulat', angkaDosis('12'), 12);
uji('angkaDosis bentuk rusak jadi NaN', Number.isNaN(angkaDosis('0.,5')), true);

// --- pembacaan yang dulu salah tidak boleh kembali secara diam-diam --------------------
// Penjaga arah: kalau seseorang memasang lagi pembuangan titik sebagai pemisah ribuan,
// nilai ini akan meloncat sepuluh kali lipat dan baris ini gagal lebih dulu.
{
  const salahLama = String(15 * TANGKI);          // 240 — hasil pembacaan yang keliru
  const benar = perTangki('1.5 ml/l');
  uji('hasil tidak boleh sama dengan pembacaan ribuan yang lama', benar.startsWith(salahLama), false);
}

// --------------------------------------------------------------------------------------
if (gagal.length) {
  console.error(`uji dosis: ${gagal.length} GAGAL, ${lolos} lolos\n`);
  for (const g of gagal) console.error(`  ✗ ${g}\n`);
  process.exit(1);
}
console.log(`uji dosis: ${lolos}/${lolos} lolos — perkalian per tangki ${TANGKI} L terkunci`);
