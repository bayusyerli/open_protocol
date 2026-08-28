/* Beranda — pintu depan keenam jalur dan ketujuh alat.
 *
 * Halaman ini tidak menampilkan rincian apa pun. Ia hanya mencari nama, lalu
 * menyerahkan yang ditemukan ke jalur yang memang perendernya: produk ke jalur 2,
 * varietas ke jalur 4. Menyalin perendernya ke sini berarti dua layar yang sama
 * akan menyimpang diam-diam begitu salah satunya diperbaiki.
 *
 * Pencariannya sendiri memakai `cari()` yang sama dengan kedua jalur itu — kepala
 * indeks yang sama, pemecahan ember yang sama, urutan yang sama.
 */

import { muatMeta, cari, cariGejala, cariNamaLokal, namaBerdekatan, teks, JENIS } from './pustaka.js';
import { pasangTombolTema } from './tema.js';
import { catatLubang, LUBANG } from './ukur.js';
import { pasangBatas } from './batas.js';

const el = {
  form: document.getElementById('formCari'),
  q: document.getElementById('q'),
  kirim: document.querySelector('.tombol-cari'),
  hapus: document.getElementById('hapus'),
  saran: document.getElementById('saran'),
  hasil: document.getElementById('hasil'),
  sumber: document.getElementById('sumber'),
  batas: document.getElementById('batasJawaban'),
  cip: document.getElementById('cipJaringan'),
  lembar: document.getElementById('lembarTentang'),
  cacah: document.getElementById('cacahTentang'),
  atribusiHarga: document.getElementById('atribusiHarga'),
};

// Jalur mana yang memiliki perender untuk satu jenis entri.
// Jalur mana yang memiliki perender untuk satu jenis entri. Bahan aktif tinggal di
// jalur 2 bersama merek — pertanyaannya sama-sama "sebenarnya ini apa", dan gejala
// di jalur 1, karena di sanalah blok "pastikan dulu" berada.
const RUMAH = { varietas: 'jalur-4.html', pestisida: 'index.html', pupuk: 'index.html', bahan: 'index.html' };

// Sediaan punya DUA rumah, dan yang menentukan rezimnya. Sisi pupuk dan sisi pengendali
// bukan dua tab dari satu layar — janjinya berbeda: yang satu resep terbuka, yang satu
// status hukum yang sengaja berhenti sebelum jadi anjuran.
const rumahSediaan = (x) => (String(x.p ?? '').includes('sediaan/') && x.k?.includes('pengendali')
  ? 'jalur-6.html' : 'jalur-5.html');

// Dua jenis entri baru tidak dibuka lewat `id`+`pecahan` seperti empat yang lain: keduanya
// punya berkasnya sendiri per entitas, jadi yang dibawa tautannya cukup satu kunci. Bentuk
// tautannya karena itu berbeda, dan perbedaannya ditulis sekali di sini alih-alih diulang di
// tiap pemanggil.
const tautanKunci = {
  // OPT registri dibuka jalur 1 lewat kuncinya sendiri, bukan lewat `opt=` yang dipakai
  // OPT terkurasi: keduanya ruang id yang berbeda, dan menyamakan pintunya akan
  // membuat jalur 1 mencari teks gejala yang memang tidak ada.
  opt: (x) => `jalur-1.html?hama=${encodeURIComponent(String(x.p ?? '').replace(/^opt-nama\//, ''))}`,
  sediaan: (x) => `${rumahSediaan(x)}?resep=${encodeURIComponent(String(x.p ?? '').replace(/^sediaan\//, ''))}`,
  principal: (x) => `principal.html?key=${encodeURIComponent(String(x.p ?? '').replace(/^principal\//, ''))}`,
  harga: (x) => `harga.html?k=${encodeURIComponent(String(x.p ?? '').replace(/^harga\//, ''))}`,
};

// `q` ikut supaya jalur tujuan memulihkan daftar hasilnya sendiri di belakang layar
// rincian — tombol "kembali ke hasil pencarian" di sana harus mendarat pada sesuatu.
// Untuk saran ejaan, yang dikirim adalah nama yang benar, bukan kueri yang salah ketik:
// mengirim salah ketiknya membuat jalur tujuan mencari sesuatu yang memang nol.
const tautan = (x, kueri = el.q.value.trim()) => {
  const khusus = tautanKunci[x.j];
  if (khusus) return khusus(x);
  const p = new URLSearchParams({ id: x.i, pecahan: x.p, q: kueri });
  return `${RUMAH[x.j] ?? 'index.html'}?${p}`;
};

const tautanGejala = (g) => `jalur-1.html?${new URLSearchParams({ opt: g.i })}`;

const angkaId = (n) => Number(n ?? 0).toLocaleString('id-ID');

// ---------------------------------------------------------------------------
// Pencarian
// ---------------------------------------------------------------------------

const BATAS = 40;

const kartuNama = (x, kueri) => `
  <li>
    <a href="${teks(tautan(x, kueri))}" data-jenis="${teks(x.j)}">
      <span>
        <span class="nama-hasil">${teks(x.n)}</span>
        <span class="sub-hasil">${teks(x.k ?? '—')}</span>
        ${x.f ? `<span class="pembeda-hasil">${teks(x.f)}</span>`
          : (x.j === 'pupuk' || x.j === 'pestisida')
            ? '<span class="pembeda-hasil kosong-pembeda">komposisi tidak tercatat di registri</span>' : ''}
      </span>
      <span class="lencana">${teks(JENIS[x.j] ?? x.j)}</span>
    </a>
  </li>`;

// Satu nama lokal bisa menunjuk lebih dari satu OPT, dan itu bukan kekurangan yang
// disembunyikan melainkan jawabannya sendiri: "layu" memang tidak membedakan fusarium
// dari bakteri. Yang bertaksa jadi beberapa tautan berdampingan beserta kalimat yang
// menyebut apa yang tidak dibedakannya; memilih satu diam-diam akan mendahului uji
// pembanding yang justru dibangun jalur 1 untuk memutuskannya.
const kartuNamaLokal = (x) => {
  if (!x.ke.length) {
    return `
      <li class="hasil-belum">
        <span>
          <span class="nama-hasil">${teks(x.n)}</span>
          <span class="sub-hasil">${teks(x.belum ?? 'Belum terpetakan.')}</span>
        </span>
        <span class="lencana">Belum terpetakan</span>
      </li>`;
  }
  return x.ke.map((k, i) => `
    <li>
      <a href="jalur-1.html?${new URLSearchParams({ opt: k.i })}" data-jenis="nama-lokal">
        <span>
          <span class="nama-hasil">${teks(x.n)} <em>→ ${teks(k.l ?? k.i)}</em></span>
          ${i === 0 && x.taksa ? `<span class="sub-hasil">${teks(x.taksa)}</span>` : ''}
        </span>
        <span class="lencana">Nama lokal</span>
      </a>
    </li>`).join('');
};

/* A1 — perutean niat. Tujuh layar bukan entitas dan tidak akan pernah muncul dari
 * pencarian nama: kalkulator hara, kalibrasi semprot, titik impas, rencana musim, buku
 * kas, direktori toko, dan harga eceran. Yang mengetik "berapa tangki" tidak sedang
 * menyebut nama apa pun — ia menyebut pertanyaannya.
 *
 * Invarian dengan papan di beranda.html: TIAP KARTU DI PAPAN HARUS BISA DICAPAI DARI
 * KOTAK INI. Keenam jalur dan profil perusahaan dicapai lewat namanya — produk, varietas,
 * dan badan memang entitas yang punya nama. Kelima sisanya tidak punya nama untuk
 * disebut, jadi merekalah yang wajib ada di daftar bawah ini. Kartu yang tidak memenuhi
 * salah satu dari keduanya cuma bisa ditemukan yang sudah tahu ia ada.
 *
 * INI MERUTEKAN, BUKAN MENJAWAB. Salah rute berbiaya satu ketukan terbuang; salah jawab
 * berbiaya semprotan yang keliru. Karena itu tautannya tampil sebagai PINTU di samping
 * hasil pencarian biasa, tidak pernah menggantikannya.
 *
 * Daftarnya sengaja pendek dan ditulis tangan. Pencocokan yang pintar menebak lebih
 * sering, dan tebakan yang lebih sering di pintu masuk berarti orang lebih sering
 * mendarat di layar yang salah tanpa tahu kenapa. */
const rapiNiat = (s) => (s ?? '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const NIAT = [
  { ke: 'jalur-3.html', judul: 'Hitung rupiah per kilogram hara',
    kata: ['hara', 'per kg hara', 'bandingkan pupuk', 'pupuk mana', 'murah mana', 'mahal mana'] },
  { ke: 'takaran.html', judul: 'Kalibrasi semprot & takaran',
    kata: ['tangki', 'kalibrasi', 'takaran', 'menakar', 'tutup botol', 'sendok', 'semprot', 'berapa ml'] },
  { ke: 'usaha.html', judul: 'Titik impas usaha tani',
    kata: ['impas', 'balik modal', 'modal', 'biaya tanam', 'untung', 'rugi', 'rab', 'anggaran'] },
  // Sengaja TIDAK mengambil "untung" dan "rugi" dari usaha.html, walau keduanya cocok.
  // Yang mengetiknya sebelum tanam memaksudkan rencana, yang mengetiknya di tengah musim
  // memaksudkan catatan — dan pintu masuk tidak bisa membedakannya. Yang diambil di sini
  // hanya kata yang berarti MENCATAT, bukan kata yang berarti ingin tahu hasilnya.
  { ke: 'rencana.html', judul: 'Rencana musim dari protokol',
    kata: ['rencana', 'jadwal', 'kapan tanam', 'urutan', 'protokol', 'musim'] },
  { ke: 'kas.html', judul: 'Buku kas per petak',
    kata: ['catat', 'mencatat', 'pembukuan', 'buku kas', 'pengeluaran', 'belanja', 'nota', 'kas'] },
  // Direktori ini menampung empat kumpulan yang menjawab tiga niat berbeda — membeli,
  // bertanya, dan menguji — jadi kata masuknya harus menutupi ketiganya. Yang berdiri
  // sendiri hanya kata yang tidak bisa berarti lain: "residu" saja bisa berarti
  // pertanyaan batas maksimum, sementara "tanah", "pupuk", dan "air" saja sudah jadi
  // milik jalur lain. Ketiganya baru diambil setelah dirangkai dengan "uji", yang tidak
  // bisa berarti apa pun selain minta diperiksakan ke laboratorium.
  { ke: 'toko.html', judul: 'Cari toko tani, benih, penyuluhan & lab',
    kata: ['toko', 'kios', 'beli di mana', 'penjual', 'terdekat', 'dekat sini',
           'penyuluh', 'penyuluhan', 'bpp',
           'lab', 'laboratorium', 'uji residu', 'uji tanah', 'uji pupuk', 'uji air'] },
  { ke: 'harga.html', judul: 'Harga eceran harian',
    kata: ['harga', 'berapa harga'] },
];

const cariNiat = (kueri) => {
  const r = ' ' + rapiNiat(kueri) + ' ';
  return NIAT.filter((x) => x.kata.some((k) => r.includes(' ' + rapiNiat(k) + ' ')));
};

const kartuNiat = (x) => `
  <li>
    <a href="${teks(x.ke)}" data-jenis="niat">
      <span><span class="nama-hasil">${teks(x.judul)}</span></span>
      <span class="lencana">Pintu</span>
    </a>
  </li>`;

const kelompok = (judul, catatan, isi) => `
  <div class="kelompok-hasil">
    <p class="ringkas-hasil"><strong>${judul}</strong>${catatan ? ` — ${catatan}` : ''}</p>
    <ul class="daftar-hasil">${isi}</ul>
  </div>`;

function gambar(nama, bahan, gejala, lokal, kueri, harga = [], badan = []) {
  const bagian = [];
  const niat = cariNiat(kueri);

  // Nama lokal paling dulu. Yang mengetik "patek" sudah tahu apa yang dilihatnya dan
  // sedang menyebut namanya; itu kueri paling spesifik yang bisa masuk ke kotak ini.
  // Tingkat buktinya disebut di judul kelompoknya, bukan disembunyikan: kamusnya dari
  // satu jawaban lapangan, dan layar tidak boleh terdengar lebih yakin daripada itu.
  if (lokal.length) {
    // B4: nama yang dikenal tetapi rujukannya belum ada adalah permintaan data yang
    // paling langsung — seseorang benar-benar memakainya, dan kamusnya belum sampai.
    for (const x of lokal) if (!x.ke.length) catatLubang('beranda', LUBANG.namaLokalTakTerpetakan);
    bagian.push(kelompok(
      `${lokal.length} nama lokal cocok`,
      'dari satu jawaban lapangan, <strong>belum ditinjau</strong> — dan belum diketahui dipakai di daerah mana',
      lokal.map(kartuNamaLokal).join('')));
  }

  // Gejala lebih dulu. Kalau kueri memang cocok dengan apa yang terlihat di kebun,
  // itu hampir pasti yang dimaksud — dan itu pula cabang bertaruhan paling tinggi.
  if (gejala.length) {
    bagian.push(kelompok(
      `${gejala.length} gejala cocok`,
      'OPT lima komoditas terkurasi, <strong>berstatus draft</strong>',
      gejala.map((g) => `
        <li>
          <a href="${teks(tautanGejala(g))}" data-jenis="gejala">
            <span>
              <span class="nama-hasil">${teks(g.n)}${g.l ? ` <em>${teks(g.l)}</em>` : ''}</span>
              <span class="sub-hasil">${g.cocok} dari ${g.dari} kata cocok · ${angkaId(g.produk)} produk terdaftar di ${angkaId(g.komoditas)} komoditas</span>
            </span>
            <span class="lencana">Gejala</span>
          </a>
        </li>`).join('')));
  }

  // Lalu bahan aktif: satu kartu bahan membuka seluruh merek yang memuatnya, jadi ia
  // menjawab lebih banyak daripada satu merek yang kebetulan bernama sama.
  if (bahan.length) {
    bagian.push(kelompok(
      `${bahan.length} bahan aktif cocok`,
      'daftarnya dipecah per kadar — setara hanya kalau bahan <em>dan</em> kadarnya sama',
      bahan.map((x) => kartuNama(x, kueri)).join('')));
  }

  // Harga sebelum nama terdaftar: yang mengetik "cabai" di beranda lebih sering menanyakan
  // harganya daripada merek pestisida yang kebetulan bernama sama.
  if (harga.length) {
    bagian.push(kelompok(
      `${harga.length} komoditas berharga`,
      'harga <strong>eceran</strong> nasional — bukan harga yang diterima petani',
      harga.map((x) => kartuNama(x, kueri)).join('')));
  }

  if (badan.length) {
    const tampil = badan.slice(0, BATAS);
    bagian.push(kelompok(
      `${angkaId(badan.length)} perusahaan atau lembaga`,
      `memegang pendaftaran atas namanya${badan.length > tampil.length ? `, ${tampil.length} teratas` : ''}`,
      tampil.map((x) => kartuNama(x, kueri)).join('')));
  }

  if (nama.length) {
    const tampil = nama.slice(0, BATAS);
    // "Nama terdaftar" berhenti benar begitu sediaan dan OPT ikut masuk kepala
    // pencarian: resep sediaan diterbitkan proyek ini sendiri, dan nama OPT adalah
    // sasaran yang disebut pendaftaran orang lain — bukan sesuatu yang didaftarkan.
    // Yang membedakan tiap barisnya sudah dibawa lencananya masing-masing, jadi yang
    // perlu diperbaiki cuma judulnya: macam apa saja yang benar-benar ada di dalamnya
    // disebutkan, bukan diratakan jadi satu kata yang menaikkan sebagian isinya.
    const macam = [...new Set(tampil.map((x) => JENIS[x.j] ?? x.j))]
      .map((t) => t.toLowerCase()).join(', ');
    bagian.push(kelompok(
      `${angkaId(nama.length)} nama cocok`,
      `${macam} — memuat <strong>${teks(kueri)}</strong>${nama.length > tampil.length ? `, ${tampil.length} teratas` : ''} · yang diawali kueri didahulukan`,
      tampil.map((x) => kartuNama(x, kueri)).join('')));
  }

  // Pintu ditawarkan di BAWAH hasil nama, tidak pernah menggantikannya: kalau ada hasil
  // nama, yang dicari hampir pasti namanya.
  if (niat.length) {
    bagian.push(kelompok(
      bagian.length ? 'Atau mungkin yang dicari alatnya' : 'Sepertinya yang dicari alatnya',
      'ini <strong>pintu</strong>, bukan jawaban — layar tujuannya yang menghitung',
      niat.map(kartuNiat).join('')));
  }

  el.hasil.innerHTML = bagian.join('');
}

const BLOK_NAMA_TAK_TERAMBIL = `
  <div class="pesan">
    <h2>Pencarian nama belum bisa dijalankan</h2>
    <p>
      Kepala pencarian nama tidak ada di peranti ini, dan sambungannya sedang tidak
      terjangkau. Yang di atas tetap benar — gejala dan nama lokal memang tersimpan.
    </p>
    <p>
      Supaya pencarian nama ikut bekerja tanpa sinyal, simpan sekali dari
      <a href="ukur.html">apa yang tercatat di peranti ini</a>. Ukurannya disebutkan di sana.
    </p>
  </div>`;

function gambarNamaTakTerambil() {
  el.hasil.innerHTML = BLOK_NAMA_TAK_TERAMBIL;
}

async function gambarKosong(kueri) {
  // Nol hasil adalah tempat perutean niat paling berguna: yang mengetik "berapa tangki"
  // memang tidak akan pernah punya hasil nama, dan tanpa ini ia dijawab "tidak ada".
  const niat = cariNiat(kueri);
  if (niat.length) {
    el.hasil.innerHTML = kelompok(
      'Sepertinya yang dicari alatnya',
      'ini <strong>pintu</strong>, bukan jawaban — layar tujuannya yang menghitung',
      niat.map(kartuNiat).join(''));
    return;
  }
  // B4: dua lubang sekaligus tertabrak — nama yang dicari tidak punya padanan
  // terdaftar, dan gejalanya di luar sepuluh yang terkurasi. Yang dicatat cacahnya,
  // bukan kuerinya; lihat docs/11 bagian 3.
  catatLubang('beranda', LUBANG.namaDagang);
  catatLubang('beranda', LUBANG.gejalaOpt);
  el.hasil.innerHTML = `
    <div class="pesan">
      <h2>Tidak ada yang cocok dengan “${teks(kueri)}”</h2>
      <p>
        Tidak ada nama terdaftar, bahan aktif, maupun gejala terkurasi yang memuatnya.
        Untuk nama, itu <em>bukan</em> berarti produknya tidak terdaftar: registri
        menyimpan nama <em>terdaftar</em>, kemasan sering memakai nama jualan yang lain,
        dan pemetaan antara keduanya belum ada.
      </p>
    </div>`;

  // Kalau kosongnya cuma karena satu-dua huruf keliru, ejaan terdekat lebih berguna
  // daripada penjelasan panjang. Kueri aslinya tidak diganti diam-diam.
  const dekat = await namaBerdekatan(kueri).catch(() => []);
  if (!dekat.length) return;
  el.hasil.insertAdjacentHTML('beforeend', kelompok('Apakah maksudnya…', '',
    dekat.map((x) => kartuNama(x, x.n)).join('')));
}

let jeda;
async function jalankan() {
  const kueri = el.q.value.trim();
  el.hapus.hidden = !kueri;
  if (!kueri) {
    el.hasil.innerHTML = '';
    el.saran.hidden = false;
    return;
  }
  try {
    // Keduanya sekaligus, bukan berurutan: yang satu mengambil satu ember nama, yang
    // lain satu kepala gejala 3,2 KB yang sesudahnya teringat sesi ini.
    // Ketiganya ditangkap sendiri-sendiri. Sebelum A5 hanya dua yang ditangkap, dan
    // akibatnya baru kelihatan saat diuji tanpa jaringan: ember nama yang gagal diambil
    // membunuh hasil gejala dan nama lokal yang sebenarnya SUDAH ada di peranti. Satu
    // cabang yang tidak sanggup tidak boleh membungkam cabang yang sanggup — aturan yang
    // sama dengan "nol dan tak-sanggup bukan kegagalan" di docs/11.
    const [namaHasil, gejala, lokal] = await Promise.all([
      cari(kueri).catch(() => ({ takTerambil: true })),
      cariGejala(kueri).catch(() => []),
      cariNamaLokal(kueri).catch(() => []),
    ]);
    const { hasil, kurang, takTerambil } = namaHasil;

    if (kurang && !gejala.length && !lokal.length) {
      el.hasil.innerHTML =
        `<p class="ringkas-hasil">Tambah ${kurang} huruf lagi supaya pecahan indeksnya cukup sempit.</p>`;
      return;
    }
    el.saran.hidden = true;

    const daftar = hasil ?? [];
    const bahan = daftar.filter((x) => x.j === 'bahan');
    const harga = daftar.filter((x) => x.j === 'harga');
    // Satu badan bisa muncul dua kali — sekali di bawah nama penuhnya, sekali di bawah nama
    // tanpa awalan lembaga. Di indeks keduanya memang harus ada; di layar cukup satu.
    const badan = [...new Map(daftar.filter((x) => x.j === 'principal').map((x) => [x.i, x])).values()];
    const nama = daftar.filter((x) => !['bahan', 'harga', 'principal'].includes(x.j));
    if (!nama.length && !bahan.length && !gejala.length && !lokal.length && !harga.length && !badan.length) {
      if (takTerambil) return gambarNamaTakTerambil();
      return gambarKosong(kueri);
    }
    gambar(nama, bahan, gejala, lokal, kueri, harga, badan);
    // Yang sanggup sudah tergambar di atas; yang tidak sanggup dinyatakan di bawahnya,
    // bukan dibiarkan terbaca sebagai "tidak ada namanya".
    if (takTerambil) el.hasil.insertAdjacentHTML('beforeend', BLOK_NAMA_TAK_TERAMBIL);
  } catch (e) {
    el.hasil.innerHTML = `
      <div class="pesan galat">
        <h2>Pencarian gagal</h2>
        <p>Berkas indeksnya tidak terambil. Periksa sambungan, lalu ketik ulang — yang
        sudah terambil tetap tersimpan, jadi percobaan berikutnya lebih ringan.</p>
        <p class="catatan">${teks(e.message)}</p>
      </div>`;
  }
}

el.q.addEventListener('input', () => {
  clearTimeout(jeda);
  jeda = setTimeout(jalankan, 180);
});
el.form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  clearTimeout(jeda);
  jalankan();
});
el.hapus.addEventListener('click', () => {
  el.q.value = '';
  el.q.focus();
  jalankan();
});
el.saran.addEventListener('click', (ev) => {
  const t = ev.target.closest('button[data-kueri]');
  if (!t) return;
  el.q.value = t.dataset.kueri;
  el.q.focus();
  jalankan();
});


// ---------------------------------------------------------------------------
// Tema — tiga keadaan, bukan dua
// ---------------------------------------------------------------------------
// Putaran, ikon, dan labelnya pindah ke tema.js supaya kedelapan halaman memakai yang
// sama. Selama ia tinggal di sini, pilihannya berhenti di beranda.

pasangTombolTema();


// ---------------------------------------------------------------------------
// Jaringan — dinyatakan, bukan disembunyikan
// ---------------------------------------------------------------------------

function cipJaringan() {
  const luring = !navigator.onLine;
  el.cip.dataset.luring = luring ? 'ya' : 'tidak';
  el.cip.lastElementChild.textContent = luring
    ? 'Luring — hanya yang sudah terambil'
    : 'Ada sinyal';
}
addEventListener('online', cipJaringan);
addEventListener('offline', cipJaringan);
cipJaringan();

// ---------------------------------------------------------------------------
// Lembar "tentang data"
// ---------------------------------------------------------------------------

// Ada dua pintu ke lembar ini — satu di kepala, satu di kaki. Yang di kepala hilang
// di layar paling sempit, jadi yang di kaki bukan hiasan.
for (const b of document.querySelectorAll('[data-buka-tentang]'))
  b.addEventListener('click', () => el.lembar.showModal());

// ---------------------------------------------------------------------------
// Mulai
// ---------------------------------------------------------------------------

(async function mulai() {
  try {
    const m = await muatMeta();
    const j = m.jumlah;
    const n = (x) => (x ?? 0).toLocaleString('id-ID');

    // Satu kementerian tidak lagi cukup disebut: kotak yang sama menjawab harga eceran
    // dari Kemendag dan tiga kumpulan yang diterbitkan proyek ini sendiri. Menyebut
    // Kementan saja membuat yang bukan salinan registri terbaca seolah salinan registri.
    el.sumber.innerHTML =
      `Sumber lewat <code>spec/indeks/</code> — registri Kementan: ` +
      `${n(j.pestisida)} pestisida, ${n(j.pupuk)} pupuk, ${n(j.varietas)} varietas, ` +
      `${n(j.principal)} badan pemegang pendaftaran; ${n(j.produkSetara)} produk berada ` +
      `dalam ${n(j.kelompokSetara)} kelompok berisi sama. Harga eceran dari SP2KP Kemendag. ` +
      `Kurasi gejala, kamus nama lokal, dan resep sediaan terbitan Open Protocols sendiri.`;

    const atribusi = m.batas?.sumber?.harga?.atribusi;
    if (atribusi) el.atribusiHarga.textContent = atribusi;

    // Empat registri di balik satu kotak, dan tanggal masing-masing. Kotak yang
    // menjawab tiga macam pertanyaan menyembunyikan bahwa jawabannya datang dari
    // sumber yang berbeda usia — di sinilah perbedaan itu dinyatakan.
    pasangBatas(el.batas, {
      sumber: ['pestisida', 'pupuk', 'varietas', 'kurasiOpt', 'namaLokal', 'sediaan',
        'principal', 'harga'],
      takDijawab: ['namaDagang', 'wilayahNamaLokal', 'gejalaOptRegistri', 'bahanHara',
        'harga', 'hargaPetani'],
    });

    // Satu baris per macam yang benar-benar bisa dicari dari kotak di atas, plus dua
    // yang menerangkan isinya. Keping yang tampil di papan tanpa cacahnya di sini —
    // atau sebaliknya — berarti salah satu dari keduanya sudah menyimpang.
    el.cacah.innerHTML = [
      ['Pestisida terdaftar', j.pestisida],
      ['Pupuk terdaftar', j.pupuk],
      ['Varietas terdaftar', j.varietas],
      ['Perusahaan pemegang pendaftaran', j.principal],
      ['Hama & penyakit registri berproduk', j.optRegistriBerproduk],
      ['Komoditas berharga', j.hargaVarian],
      ['Substansi pestisida', j.zatHidup],
      ['Kelompok berisi sama', j.kelompokSetara],
      ['OPT cabai terkurasi', j.optTerkurasi],
      ['Nama lokal terkumpul', j.namaLokal],
      ['Resep sediaan sendiri', j.resepSediaan],
    ].map(([k, v]) => `<dt>${teks(k)}</dt><dd>${n(v)}</dd>`).join('');

    el.q.disabled = false;
    el.kirim.disabled = false;

    // Kembali dari jalur lain membawa kuerinya, supaya hasilnya tidak hilang.
    const q = new URLSearchParams(location.search).get('q');
    if (q) { el.q.value = q; await jalankan(); }
  } catch (e) {
    el.hasil.innerHTML = `
      <div class="pesan galat">
        <h2>Indeks tidak ditemukan</h2>
        <p>
          Halaman ini membaca <code>spec/indeks/</code>, yang turunan dan sengaja tidak
          ikut disimpan di repositori. Bangun dulu dari akar repositori:
          <code>node spec/tools/bangun-indeks.mjs --tulis</code>, lalu sajikan akarnya —
          menyajikan <code>app/</code> saja tidak cukup.
        </p>
        <p class="catatan">${teks(e.message)}</p>
      </div>`;
  }
})();
