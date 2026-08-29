// Konversi dosis berlabel jadi takaran per tangki punggung — dan satu-satunya angka di
// seluruh terbitan yang, kalau salah, langsung dituang orang ke tangki.
//
// BERKAS INI TERPISAH SUPAYA BISA DIUJI. Sebelumnya fungsinya tinggal di dalam
// bangun-halaman.mjs, yang menjalankan seluruh build begitu di-import — jadi tidak ada
// cara menguji perkaliannya tanpa membangun 30 ribu halaman lebih dulu, dan karena itu
// tidak pernah ada satu pun uji atasnya. Bug sepuluh kali lipat yang dijelaskan di bawah
// hidup di sana berbulan-bulan tanpa tertangkap apa pun.
//
// Ujinya di uji-dosis.mjs, dan ia berjalan lewat `npm test`.

export const TANGKI = 16;          // liter — isi tangki punggung yang paling lazim

/* Perkalian ini klaim halaman, bukan fakta registri — jadi halaman berhak menolak
 * mengalikan ketika hasilnya mustahil, dan wajib tetap menampilkan dosis terdaftarnya apa
 * adanya. Ambangnya dari fisika tangki punggung: menuang lebih dari satu kilogram atau
 * satu liter bahan ke dalam 16 liter air bukan penyemprotan lagi. Dari 6.459 nilai
 * bersatuan per liter di registri, 6.427 (99,5%) lolos; yang tertahan 32 nilai pada 9
 * produk, termasuk 950 g/l yang akan berbunyi "15,2 kg per tangki" — lebih berat daripada
 * airnya sendiri. Ini jaring KEDUA: galat sepuluh kali lipat lolos dari ambang mana pun
 * yang masuk akal, dan yang menangkapnya uji, bukan ambang. */
export const BATAS_TANGKI = 1000;  // ml atau g per tangki, di atasnya konversi ditahan

export const angkaId = (x) => {
  const b = Math.round(x * 1000) / 1000;
  return b.toLocaleString('id-ID', { maximumFractionDigits: 3 });
};

/* TITIK DI SINI DESIMAL, BUKAN PEMISAH RIBUAN — dan membacanya terbalik pernah membuat
 * halaman ini menyuruh orang menuang sepuluh kali lipat. Versi pertama membuang titik
 * sebagai pemisah ribuan sebelum mengurai, sehingga `1.5 ml/l` jadi 15, dikalikan 16, dan
 * tercetak "240 ml per tangki" — padahal jawabannya 24 ml. Kesalahannya kena 1.745 sel di
 * 483 halaman, dan yang terburuk `0.25 g/l` tercetak 400 g alih-alih 4 g: seratus kali.
 * Angkanya juga ikut ke JSON-LD FAQPage, jadi ia berjalan sampai ke cuplikan mesin pencari.
 *
 * Yang menentukan bukan selera, melainkan medannya sendiri. Dari 6.298 nilai `rate_text`
 * bersatuan per liter di registri: 1.813 memakai koma desimal, 949 memakai titik desimal,
 * 3.729 bulat, dan NOL memakai titik sebagai pemisah ribuan. Jadi keduanya dibaca desimal.
 * Bentuk yang tidak terbaca — `0.,5` yang memang rusak di sumbernya, atau titik ganda bila
 * suatu hari muncul — menjadi NaN lalu ditolak: menolak lebih aman daripada menebak,
 * karena yang ditebak di kolom takaran melukai orang. */
export const angkaDosis = (s) => Number(String(s).replace(',', '.'));

const BENTUK = /^([\d.,]+)\s*(?:[-–]\s*([\d.,]+)\s*)?(ml|cc|g|gr|kg|l)\s*\/\s*(l|liter)\b/;

/* Mengembalikan teks siap tampil, atau null bila dosisnya bukan per liter, tidak terbaca,
 * atau hasilnya melewati ambang. Pemanggil menampilkan "—" untuk null — dosis terdaftarnya
 * sendiri tetap tampil apa adanya di kolom sebelahnya. */
export function perTangki(dosis, lapor) {
  if (!dosis) return null;
  const m = String(dosis).trim().toLowerCase().match(BENTUK);
  if (!m) return null;
  const a = angkaDosis(m[1]);
  const b = m[2] ? angkaDosis(m[2]) : null;
  if (!Number.isFinite(a) || a <= 0) return null;
  if (m[2] && (!Number.isFinite(b) || b <= 0)) return null;
  if ((b ?? a) * TANGKI > BATAS_TANGKI) { lapor?.ambang?.(); return null; }
  const satuan = m[3] === 'cc' ? 'ml' : m[3] === 'gr' ? 'g' : m[3];
  return b
    ? `${angkaId(a * TANGKI)}–${angkaId(b * TANGKI)} ${satuan}`
    : `${angkaId(a * TANGKI)} ${satuan}`;
}
