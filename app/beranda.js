/* Beranda — pintu depan keenam jalur.
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
};

// Jalur mana yang memiliki perender untuk satu jenis entri.
// Jalur mana yang memiliki perender untuk satu jenis entri. Bahan aktif tinggal di
// jalur 2 bersama merek — pertanyaannya sama-sama "sebenarnya ini apa", dan gejala
// di jalur 1, karena di sanalah blok "pastikan dulu" berada.
const RUMAH = { varietas: 'jalur-4.html', pestisida: 'index.html', pupuk: 'index.html', bahan: 'index.html' };

// `q` ikut supaya jalur tujuan memulihkan daftar hasilnya sendiri di belakang layar
// rincian — tombol "kembali ke hasil pencarian" di sana harus mendarat pada sesuatu.
// Untuk saran ejaan, yang dikirim adalah nama yang benar, bukan kueri yang salah ketik:
// mengirim salah ketiknya membuat jalur tujuan mencari sesuatu yang memang nol.
const tautan = (x, kueri = el.q.value.trim()) => {
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

const kelompok = (judul, catatan, isi) => `
  <div class="kelompok-hasil">
    <p class="ringkas-hasil"><strong>${judul}</strong>${catatan ? ` — ${catatan}` : ''}</p>
    <ul class="daftar-hasil">${isi}</ul>
  </div>`;

function gambar(nama, bahan, gejala, lokal, kueri) {
  const bagian = [];

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
      'sepuluh OPT cabai terkurasi, <strong>berstatus draft</strong>',
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

  if (nama.length) {
    const tampil = nama.slice(0, BATAS);
    bagian.push(kelompok(
      `${angkaId(nama.length)} nama terdaftar`,
      `memuat <strong>${teks(kueri)}</strong>${nama.length > tampil.length ? `, ${tampil.length} teratas` : ''} · yang diawali kueri didahulukan`,
      tampil.map((x) => kartuNama(x, kueri)).join('')));
  }

  el.hasil.innerHTML = bagian.join('');
}

async function gambarKosong(kueri) {
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
    const [namaHasil, gejala, lokal] = await Promise.all([
      cari(kueri),
      cariGejala(kueri).catch(() => []),
      cariNamaLokal(kueri).catch(() => []),
    ]);
    const { hasil, kurang } = namaHasil;

    if (kurang && !gejala.length && !lokal.length) {
      el.hasil.innerHTML =
        `<p class="ringkas-hasil">Tambah ${kurang} huruf lagi supaya pecahan indeksnya cukup sempit.</p>`;
      return;
    }
    el.saran.hidden = true;

    const daftar = hasil ?? [];
    const bahan = daftar.filter((x) => x.j === 'bahan');
    const nama = daftar.filter((x) => x.j !== 'bahan');
    if (!nama.length && !bahan.length && !gejala.length && !lokal.length) return gambarKosong(kueri);
    gambar(nama, bahan, gejala, lokal, kueri);
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

    el.sumber.innerHTML =
      `Sumber: registri Kementan lewat <code>spec/indeks/</code> — ` +
      `${n(j.pestisida)} pestisida, ${n(j.pupuk)} pupuk, ${n(j.varietas)} varietas. ` +
      `${n(j.produkSetara)} produk berada dalam ${n(j.kelompokSetara)} kelompok berisi sama.`;

    // Empat registri di balik satu kotak, dan tanggal masing-masing. Kotak yang
    // menjawab tiga macam pertanyaan menyembunyikan bahwa jawabannya datang dari
    // sumber yang berbeda usia — di sinilah perbedaan itu dinyatakan.
    pasangBatas(el.batas, {
      sumber: ['pestisida', 'pupuk', 'varietas', 'kurasiOpt', 'namaLokal'],
      takDijawab: ['namaDagang', 'wilayahNamaLokal', 'bahanHara', 'harga'],
    });

    el.cacah.innerHTML = [
      ['Pestisida terdaftar', j.pestisida],
      ['Pupuk terdaftar', j.pupuk],
      ['Varietas terdaftar', j.varietas],
      ['Substansi pestisida', j.zatHidup],
      ['Kelompok berisi sama', j.kelompokSetara],
      ['OPT cabai terkurasi', j.optTerkurasi],
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
