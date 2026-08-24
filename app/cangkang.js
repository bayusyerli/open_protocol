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

import { cari, cariGejala, cariNamaLokal, tautanHasil, teks, JENIS } from './pustaka.js';

/** Satu-satunya daftar halaman. Urutannya urutan tampilnya. */
const HALAMAN = [
  { u: 'jalur-1.html',   t: 'Tanaman bermasalah',        g: 'Enam jalur' },
  { u: 'produk.html',     t: 'Cek isi produk',            g: 'Enam jalur' },
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

/* Tab bawah — K2 pada docs/17, bagian "cangkang".
 *
 * Lima slot, dan yang menentukan pilihannya bukan popularitas melainkan JANGKAUAN JEMPOL:
 * kaki halaman sudah memuat keempat belas halaman, tetapi mencapainya menuntut menggulir
 * sampai habis. Yang ditaruh di sini yang tidak boleh menuntut gulir — pintu pulang, dua
 * jalur yang paling sering jadi pintu masuk, harga, dan satu pintu ke selebihnya.
 *
 * "Semua" membuka lembar berisi daftar YANG SAMA dengan kaki halaman, dibangun dari
 * `HALAMAN` juga. Dua daftar navigasi yang ditulis terpisah akan menyimpang, dan itu
 * persis penyakit yang dibereskan berkas ini. */
const TAB = [
  { u: 'index.html', t: 'Beranda' },
  { u: 'jalur-1.html', t: 'Gejala' },
  { u: 'produk.html',   t: 'Produk' },
  { u: 'harga.html',   t: 'Harga' },
  { u: null,           t: 'Semua' },
];

const berkasKini = () => {
  const b = location.pathname.split('/').pop();
  return b && b.endsWith('.html') ? b : 'produk.html';
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
  // Simbolnya dekoratif — alt kosong: namanya sudah jadi teks di sebelahnya, dan
  // mengisi alt="Pranatani" membuat pembaca layar menyebutnya dua kali dalam satu
  // tautan. Teksnya dibungkus <span> karena barisnya kini mendatar: tanpa pembungkus,
  // <strong> dan <small> jadi dua kolom di sebelah tanda, bukan dua baris.
  bilah.innerHTML =
    `<a class="merek-cangkang" href="index.html">` +
    `<img class="tanda-merek" src="logo-pranatani.svg" alt="" width="30" height="30">` +
    `<span class="teks-merek"><strong>Pranatani</strong>` +
    `<small>DATA PERTANIAN TERBUKA</small></span></a>`;

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
      <a href="index.html">← Beranda</a> ·
      <strong>Pranatani</strong> — gratis, tanpa akun, dan kata yang dicari tidak
      dikirim ke mana pun.
    </p>`;

  // Paragraf tautan lama dibuang, dan kakinya ditaruh DI LUAR <main>. Blok batas jawaban
  // milik isinya dan harus tetap yang terakhir di dalam main; navigasi bukan isi.
  document.querySelector('p.lain')?.remove();
  utama.after(kaki);

  pasangCari(bilah);
  pasangTab(kini, grup);
}

/* Kotak cari yang tidak pernah pergi.
 *
 * Sebelum ini kotak cari universal cuma ada di beranda: siapa pun yang sedang di jalur 3
 * dan teringat nama lain harus pulang dulu. Kotaknya kini ikut di bilah tiap halaman, dan
 * hasilnya dibuka di lembar — BUKAN dengan berpindah halaman, supaya yang sedang dikerjakan
 * di layar itu tidak hilang hanya karena satu nama ingin dicek.
 *
 * Rutenya `tautanHasil()` di pustaka.js, sama persis dengan yang dipakai beranda. */
function pasangCari(bilah) {
  const borang = document.createElement('form');
  borang.className = 'cari-cangkang';
  borang.setAttribute('role', 'search');
  borang.innerHTML = `
    <label class="khusus-pembaca" for="qCangkang">Cari nama produk, bahan aktif, atau gejala</label>
    <input id="qCangkang" type="search" autocomplete="off" spellcheck="false"
           enterkeyhint="search" placeholder="Cari nama, bahan, gejala">`;
  borang.addEventListener('submit', (e) => e.preventDefault());
  bilah.querySelector('.merek-cangkang').after(borang);

  const lembar = lembarKosong('cariLembar', 'Hasil pencarian');
  const isi = lembar.querySelector('.lembar-cangkang-isi');
  const q = borang.querySelector('input');

  let jalan = 0;
  const cariSekarang = async () => {
    const kueri = q.value.trim();
    if (kueri.length < 2) { lembar.open && lembar.close(); return; }
    const giliran = ++jalan;
    if (!lembar.open) lembar.showModal();
    isi.innerHTML = '<p class="bantuan">Mencari…</p>';
    try {
      // KETIGANYA, bukan cuma nama. Versi pertama kotak ini hanya memanggil cari(), dan
      // akibatnya kotak yang RUPANYA sama dengan kotak beranda menjawab lebih sedikit:
      // "antraknosa" memberi nol, padahal beranda menemukannya lewat kepala gejala. Kotak
      // yang mengajari orang "app ini tidak tahu antraknosa" lebih buruk daripada tidak
      // ada kotak sama sekali.
      //
      // Ditangkap sendiri-sendiri, sama seperti beranda: satu cabang yang tidak sanggup
      // tidak boleh membungkam cabang yang sanggup.
      const [namaHasil, gejala, lokal] = await Promise.all([
        cari(kueri).catch(() => ({ takTerambil: true })),
        cariGejala(kueri).catch(() => []),
        cariNamaLokal(kueri).catch(() => []),
      ]);
      if (giliran !== jalan) return;                 // ketikan yang lebih baru menang
      const { hasil = [], kurang } = namaHasil;
      if (kurang && !gejala.length && !lokal.length) {
        isi.innerHTML = `<p class="bantuan">Tambah ${kurang} huruf lagi.</p>`; return;
      }
      const lain = [
        ...gejala.map((g) => ({ t: g.n ?? g.nama ?? 'Gejala', k: 'Gejala di kebun',
          u: `jalur-1.html?${new URLSearchParams({ opt: g.i })}` })),
        ...lokal.map((l) => ({ t: l.n ?? l.nama ?? 'Nama lokal', k: 'Nama lokal',
          u: `jalur-1.html?${new URLSearchParams({ opt: l.i })}` })),
      ];
      if (!hasil.length && !lain.length) {
        isi.innerHTML = `<p class="bantuan">Tidak ada yang bernama <strong>${teks(kueri)}</strong>.
          Nama di kemasan sering berbeda dari nama terdaftarnya, jadi ini
          <strong>bukan bukti produknya tidak terdaftar</strong>.</p>`;
        return;
      }
      const tampil = hasil.slice(0, 25);
      const blokLain = lain.length ? `
        <ul class="daftar-cangkang">
          ${lain.map((x) => `
            <li><a href="${teks(x.u)}">
              <span class="nama">${teks(x.t)}</span>
              <span class="sub">${teks(x.k)}</span>
            </a></li>`).join('')}
        </ul>` : '';
      // Aturan kartu yang sama dengan gambarHasil() di pustaka.js — lencana jenis hanya
      // saat hasilnya bercampur, dan PEMBEDA naik ke atas nama pemegang. Tanpa itu lembar
      // ini akan memberi lima kartu "PHONSKA" yang tampak seragam, yaitu persis keadaan
      // yang sudah diperbaiki di daftar hasil halaman.
      const banyakJenis = new Set(tampil.map((x) => x.j)).size > 1;
      isi.innerHTML = `
        <p class="bantuan">${hasil.length + lain.length} hasil${hasil.length > tampil.length
          ? `, ditampilkan ${tampil.length + lain.length} teratas` : ''}.</p>
        <ul class="daftar-cangkang">
          ${tampil.map((x) => `
            <li><a href="${teks(tautanHasil(x, kueri))}">
              <span class="nama">${teks(x.n)}${banyakJenis
                ? `<span class="lencana">${teks(JENIS[x.j] ?? x.j)}</span>` : ''}</span>
              ${x.f ? `<span class="pembeda">${teks(x.f)}</span>`
                : (x.j === 'pupuk' || x.j === 'pestisida')
                  ? '<span class="pembeda kosong-pembeda">komposisi tidak tercatat di registri</span>' : ''}
              <span class="sub">${teks(x.k ?? '—')}</span>
            </a></li>`).join('')}
        </ul>
        ${blokLain}`;
    } catch {
      if (giliran !== jalan) return;
      isi.innerHTML = '<p class="bantuan">Indeksnya tidak terambil. Periksa sambungan, lalu ketik ulang.</p>';
    }
  };

  let tunda;
  q.addEventListener('input', () => { clearTimeout(tunda); tunda = setTimeout(cariSekarang, 220); });
}

/** Lembar kosong bergaya sama, dipakai hasil pencarian dan daftar "Semua". */
function lembarKosong(id, judul) {
  const l = document.createElement('dialog');
  l.id = id;
  l.className = 'lembar-cangkang';
  l.innerHTML = `
    <form method="dialog" class="lembar-cangkang-kepala">
      <h2>${judul}</h2><button aria-label="Tutup">×</button>
    </form>
    <div class="lembar-cangkang-isi"></div>`;
  l.addEventListener('click', (e) => {
    const k = l.getBoundingClientRect();
    if (e.clientX < k.left || e.clientX > k.right || e.clientY < k.top || e.clientY > k.bottom) l.close();
  });
  document.body.append(l);
  return l;
}

function pasangTab(kini, grup) {
  const semua = lembarKosong('semuaLembar', 'Semua halaman');
  semua.querySelector('.lembar-cangkang-isi').innerHTML = `
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
    </nav>`;

  const bar = document.createElement('nav');
  bar.className = 'tab-cangkang';
  bar.setAttribute('aria-label', 'Pintasan');
  bar.innerHTML = TAB.map((t) => (t.u === null
    ? `<button type="button" data-semua>${t.t}</button>`
    : t.u === kini
      ? `<span aria-current="page">${t.t}</span>`
      : `<a href="${t.u}">${t.t}</a>`)).join('');
  bar.querySelector('[data-semua]').addEventListener('click', () => semua.showModal());
  document.body.append(bar);
  document.body.classList.add('bertab');
}
