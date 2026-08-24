/* Cangkang bersama — T4 pada audit alur & rasa pakai.
 *
 * Empat belas halaman di luar beranda tidak punya <nav>, tidak punya <footer>, dan tidak
 * punya tautan lewati-ke-isi. Yang menggantikan ketiganya `<p class="lain">`: dua belas
 * tautan mentah dipisah titik-tengah, 476 px tinggi, huruf 14,7 px — dan isinya SAMA
 * PERSIS di tiap halaman, jadi ia tidak pernah memberi tahu orang ia sedang di mana.
 *
 * KARENA DISALIN TANGAN, IA SUDAH MENYIMPANG. Saat diaudit: 12 tautan di enam jalur dan
 * takaran, 7 di toko, 6 di usaha, 4 di harga, principal, dan ukur, 2 di kas. kas.html —
 * halaman terbaru waktu itu — hanya ditaut dari beranda; nol dari dua belas halaman lain
 * menyebutnya. Menambah halaman berarti menyunting empat belas berkas, dan yang terjadi
 * justru sebaliknya: halaman baru tidak masuk ke mana pun.
 *
 * SATU DAFTAR, DI SINI. `HALAMAN` di bawah satu-satunya tempat daftar itu tinggal.
 * Halaman baru cukup ditambahkan satu baris dan langsung muncul di keempat belas
 * halaman sekaligus — termasuk di halaman itu sendiri, yang menandai dirinya dengan
 * `aria-current` alih-alih menautkan dirinya sendiri.
 *
 * KENAPA DISUNTIK JS, BUKAN DISALIN KE TIAP BERKAS. Menyalinnya mengembalikan persis
 * masalah yang sedang diperbaiki. Sertakan-partial menuntut langkah bangun, dan repo ini
 * sengaja tanpa langkah bangun — berkas yang dilayani berkas yang ditulis. Yang tersisa
 * menyuntiknya saat jalan. Ongkosnya tidak ada permintaan tambahan: berkas ini diimpor
 * `tema.js`, satu-satunya modul yang sudah diimpor kelima belas halaman, dan itu pula
 * alasan `pasangLuring()` tinggal di sana.
 *
 * YANG TERTINGGAL UNTUK TANPA-JS, DAN KENAPA SEPENDEK ITU. `<p class="lain">` di tiap
 * halaman dipangkas jadi satu tautan pulang. Halaman-halaman ini memang tidak berfungsi
 * tanpa JavaScript — pencarian, daftar, dan hitungannya seluruhnya berjalan di peramban,
 * dan tiap halaman sudah mengatakannya lewat blok `#tanpaJs`. Yang masih berutang
 * disediakan cuma jalan keluar, dan satu tautan menanggungnya. Menyalin dua belas tautan
 * ke empat belas berkas demi keadaan yang layarnya sendiri sudah menyerah adalah harga
 * yang dibayar tiap kali daftar itu berubah.
 *
 * BERANDA DILEWATI. Ia sudah punya cangkangnya sendiri — kepala, kaki, lembar, dan
 * tautan lewati — dan menyuntikkan yang kedua akan menghasilkan dua merek dan dua tombol
 * tema di satu layar.
 */

/** Satu-satunya daftar halaman. Urutannya urutan tampilnya. */
const HALAMAN = [
  { u: 'jalur-1.html',   t: 'Tanaman bermasalah',        g: 'Enam jalur' },
  { u: 'index.html',     t: 'Cek isi produk',            g: 'Enam jalur' },
  { u: 'jalur-3.html',   t: 'Bandingkan harga pupuk',    g: 'Enam jalur' },
  { u: 'jalur-4.html',   t: 'Cek nama varietas',         g: 'Enam jalur' },
  { u: 'jalur-5.html',   t: 'Buat pupuk sendiri',        g: 'Enam jalur' },
  { u: 'jalur-6.html',   t: 'Pengendali buatan sendiri', g: 'Enam jalur' },

  { u: 'takaran.html',   t: 'Kalibrasi & takaran',       g: 'Hitungan di lahan' },
  { u: 'usaha.html',     t: 'Titik impas usaha tani',    g: 'Hitungan di lahan' },
  { u: 'rencana.html',   t: 'Rencana musim',             g: 'Hitungan di lahan' },
  { u: 'kas.html',       t: 'Buku kas per petak',        g: 'Hitungan di lahan' },

  { u: 'harga.html',     t: 'Harga komoditas',           g: 'Cari & rujukan' },
  { u: 'principal.html', t: 'Profil perusahaan',         g: 'Cari & rujukan' },
  { u: 'toko.html',      t: 'Toko tani, benih, penyuluhan & lab', g: 'Cari & rujukan' },

  { u: 'ukur.html',      t: 'Yang tercatat di peranti ini', g: 'Peranti ini' },
];

const berkasKini = () => {
  const b = location.pathname.split('/').pop();
  return b && b.endsWith('.html') ? b : 'index.html';
};

export function pasangCangkang() {
  // Beranda sudah bercangkang; menyuntik yang kedua menghasilkan dua merek sekaligus.
  if (document.querySelector('header.kepala')) return;
  const utama = document.querySelector('main');
  if (!utama) return;
  if (document.querySelector('.bilah-cangkang')) return;   // aman dipanggil dua kali

  const kini = berkasKini();
  if (!utama.id) utama.id = 'konten';

  const bilah = document.createElement('div');
  // Namanya berakhiran -cangkang karena `.bilah` SUDAH DIPAKAI gaya.css untuk bilah
  // kemajuan di jalur 3 dan halaman harga. Memakai nama yang sama membuat kedua bilah
  // itu ikut jadi lengket dan setinggi kepala halaman.
  bilah.className = 'bilah-cangkang';
  bilah.innerHTML =
    `<a class="merek-cangkang" href="beranda.html">` +
    `<strong>Open Protocols</strong><small>DATA PERTANIAN TERBUKA</small></a>`;

  // Tombol tema DIPINDAH, bukan dibuat ulang: `tema.js` mencarinya lewat id dan tiap
  // halaman memanggil pasangTombolTema() sendiri, jadi memindahkannya tidak memutus
  // apa pun — sementara membuat tombol kedua akan menghasilkan dua tombol yang
  // ikonnya berbeda pendapat.
  const tombol = document.getElementById('tombolTema');
  if (tombol) bilah.append(tombol);

  const lewati = document.createElement('a');
  lewati.className = 'lewati';
  lewati.href = `#${utama.id}`;
  lewati.textContent = 'Lewati ke isi';

  document.body.prepend(bilah);
  document.body.prepend(lewati);

  const grup = [...new Set(HALAMAN.map((h) => h.g))];
  const kaki = document.createElement('footer');
  kaki.className = 'kaki';
  kaki.innerHTML = `
    <nav aria-label="Semua halaman">
      ${grup.map((g) => `
        <div class="kaki-grup">
          <h2>${g}</h2>
          <ul>
            ${HALAMAN.filter((h) => h.g === g).map((h) => `<li>${
              h.u === kini
                ? `<span class="kaki-kini" aria-current="page">${h.t}</span>`
                : `<a href="${h.u}">${h.t}</a>`
            }</li>`).join('')}
          </ul>
        </div>`).join('')}
    </nav>
    <p class="kaki-catatan">
      <a href="beranda.html">← Beranda</a> ·
      <strong>Open Protocols</strong> — gratis, tanpa akun, dan kata yang dicari tidak
      dikirim ke mana pun.
    </p>`;

  // Paragraf tautan lama dibuang, dan kakinya ditaruh DI LUAR <main>. Blok batas jawaban
  // milik isinya dan harus tetap yang terakhir di dalam main; navigasi bukan isi.
  document.querySelector('p.lain')?.remove();
  utama.after(kaki);
}
