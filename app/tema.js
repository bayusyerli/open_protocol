/* Tema — tiga keadaan, satu tempat, kedelapan halaman.
 *
 * "Ikut sistem" adalah bawaan dan harus bisa dipilih kembali; tombol yang cuma
 * berpindah terang/gelap tidak memberi jalan pulang kepada yang sudah pernah memilih.
 *
 * KENAPA BERKAS SENDIRI. Logika ini semula tinggal di beranda.js, dan akibatnya
 * pilihannya berhenti di beranda: enam jalur dan halaman ukur tidak punya tombolnya,
 * tidak membaca simpanannya, dan lembar gayanya bahkan mendengarkan atribut yang
 * berbeda. Orang yang memilih gelap lalu mengetuk satu jalur mendapat layar terang,
 * tanpa satu pun galat yang menandainya.
 *
 * SATU NAMA ATRIBUT. Sekarang `data-tema="terang"|"gelap"` di kedua lembar gaya.
 * Sebelumnya gaya.css memakai `data-theme="light"|"dark"` sementara tombolnya menulis
 * `data-tema` — dua belahan yang tidak bisa bertemu, dan memasang skrip pembacanya saja
 * di jalur 1–6 tidak akan berpengaruh sampai namanya seragam.
 *
 * YANG TIDAK ADA DI SINI, DAN SENGAJA. Pembaca simpanan pertama tetap disalin sebaris
 * di dalam <head> tiap halaman, sebelum lembar gaya. Ia harus berjalan sebelum cat
 * pertama — kalau tidak, layar gelap berkedip putih dulu — dan memuatnya sebagai berkas
 * berarti satu perjalanan pulang-pergi lagi sebelum apa pun tergambar, pada permukaan
 * yang syarat lapangannya justru sinyal buruk. Salinan itu sengaja tidak memuat
 * keputusan apa pun: ia membaca satu nilai dan memasang satu atribut. Seluruh
 * putarannya, ikonnya, dan labelnya ada di sini.
 */

import { pasangLuring } from './luring.js';

// Dipasang di sini karena tema.js satu-satunya modul yang diimpor kesebelas halaman.
// Menyalin pendaftarannya ke sebelas berkas akan mengulang persis dua kekeliruan yang
// sudah ditemukan di permukaan ini: tema yang berhenti di beranda, dan enam salinan
// penangan tombol kembali.
pasangLuring();

const IKON = {
  sistem: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17Z" fill="currentColor" stroke="none"/>',
  terang: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',
  gelap: '<path d="M20.5 14.6A8.8 8.8 0 0 1 9.4 3.5a8.8 8.8 0 1 0 11.1 11.1Z"/>',
};
const SEBUTAN = { sistem: 'ikut sistem', terang: 'terang', gelap: 'gelap' };
const PUTARAN = ['sistem', 'terang', 'gelap'];

export function pasangTema(pilihan, tombol) {
  if (pilihan === 'sistem') delete document.documentElement.dataset.tema;
  else document.documentElement.dataset.tema = pilihan;

  if (tombol) {
    // Label menyebut yang sedang berlaku DAN yang akan terjadi kalau diketuk. Ikon
    // sendiri tidak bisa mengatakan keduanya, dan tombol berputar yang tidak menyebut
    // tujuannya memaksa orang mencobanya untuk tahu.
    const lanjut = PUTARAN[(PUTARAN.indexOf(pilihan) + 1) % PUTARAN.length];
    tombol.innerHTML =
      `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">${IKON[pilihan]}</svg>`;
    tombol.setAttribute('aria-label', `Tampilan layar: ${SEBUTAN[pilihan]}. Ketuk untuk ${SEBUTAN[lanjut]}.`);
    tombol.dataset.tema = pilihan;
  }

  try {
    if (pilihan === 'sistem') localStorage.removeItem('op:tema');
    else localStorage.setItem('op:tema', pilihan);
  } catch { /* mode privat menolak menulis; pilihannya tetap berlaku sampai halaman ditutup */ }
}

/** Pasang tombol berputar. Aman dipanggil di halaman yang tidak punya tombolnya. */
export function pasangTombolTema(tombol = document.getElementById('tombolTema')) {
  if (!tombol) return;
  tombol.addEventListener('click', () => {
    const kini = tombol.dataset.tema ?? 'sistem';
    pasangTema(PUTARAN[(PUTARAN.indexOf(kini) + 1) % PUTARAN.length], tombol);
  });
  // Atributnya sudah dipasang skrip sebaris di <head>; ini menyelaraskan ikon dan label
  // dengan keadaan yang sudah berlaku, bukan menetapkannya ulang.
  pasangTema(document.documentElement.dataset.tema ?? 'sistem', tombol);
}
