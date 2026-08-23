/* Profil badan pemegang pendaftaran.
 *
 * Satu halaman, satu badan, satu pengambilan: `principal/<key>.json` membawa profil dan
 * SELURUH daftar pendaftarannya sekaligus. Itu bukan kelalaian anggaran — profil terbesar
 * 31,7 KB, masih di bawah 48 KB — melainkan bentuk yang mengikuti pertanyaannya. Yang
 * membuka halaman ini bertanya "perusahaan ini punya apa saja", dan jawaban yang datang
 * dalam dua perjalanan bukan jawaban yang lebih ringan; ia jawaban yang setengahnya muncul
 * belakangan.
 *
 * Dua tingkat bukti dalam satu layar, dan itu alasan utama berkas ini tidak sekadar
 * mencetak objeknya: cacah pendaftaran datang dari registri (B), sedangkan grup induk,
 * negara asal, dan merek payung datang dari riset web yang belum diverifikasi (D).
 * Keduanya dirender terpisah, dengan tingkat yang disebut di masing-masing kotak.
 */

import { ambil, muatMeta, cari, teks, tanggal, JENIS } from './pustaka.js';
import { pasangTombolTema } from './tema.js';
import { pasangBatas } from './batas.js';

pasangTombolTema();

const el = {
  judul: document.getElementById('judul'),
  lede: document.getElementById('lede'),
  isi: document.getElementById('isi'),
  q: document.getElementById('q'),
  bantuan: document.getElementById('bantuan'),
  hasil: document.getElementById('hasil'),
  batas: document.getElementById('batasJawaban'),
};

document.getElementById('tanpaJs')?.remove();

const n = (x) => Number(x ?? 0).toLocaleString('id-ID');

// Nilainya datang dari bilah alamat, jadi tidak dipercaya: `key` ikut menyusun jalur berkas
// yang diambil, jadi hanya slug yang diterima.
const BENTUK_KEY = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const SEKTOR = { pesticide: 'Pestisida', fertilizer: 'Pupuk', seed: 'Benih' };
const JENIS_PUNYA = { pestisida: 'Pestisida', pupuk: 'Pupuk', varietas: 'Varietas' };

// Ke mana satu baris daftar membuka rinciannya. Sama seperti beranda: halaman ini tidak
// punya perender produk sendiri, dan menyalinnya ke sini berarti dua layar yang akan
// menyimpang diam-diam.
const RUMAH = { varietas: 'jalur-4.html', pestisida: 'index.html', pupuk: 'index.html' };
const tautanEntri = (x) =>
  `${RUMAH[x.j] ?? 'index.html'}?${new URLSearchParams({ id: x.i, pecahan: x.p })}`;

// ---------------------------------------------------------------------------
// Kartu-kartu
// ---------------------------------------------------------------------------
function kartuPokok(b) {
  const sektor = (b.sektor ?? []).map((s) => SEKTOR[s] ?? s);
  const total = (b.punya?.pesticide ?? 0) + (b.punya?.fertilizer ?? 0) + (b.punya?.seed ?? 0);
  return `
    <div class="kartu">
      <h2>${teks(b.nama)}${b.bentuk && b.bentuk !== 'tidak_diketahui' ? `<span class="lencana">${teks(b.bentuk)}</span>` : ''}</h2>
      <dl class="kunci">
        <dt>Terdaftar di</dt><dd>${sektor.length ? teks(sektor.join(' · ')) : '—'}</dd>
        <dt>Pestisida</dt><dd>${n(b.punya?.pesticide)}</dd>
        <dt>Pupuk</dt><dd>${n(b.punya?.fertilizer)}</dd>
        <dt>Varietas</dt><dd>${n(b.punya?.seed)}</dd>
      </dl>
      <p class="catatan">
        ${n(total)} pendaftaran atas nama ini di registri Kementan. Angka ini
        <strong>izin edar yang dipegang, bukan produk yang sedang dijual</strong> — dan
        yang izinnya sudah habis hilang dari registri asalnya, sehingga hilang juga dari sini.
      </p>
    </div>`;
}

// Sisi benih punya keterangan yang registri varietas memang catat sendiri — rentang tahun,
// komoditas, jenis izin terbanyak. Ia tetap tingkat B, jadi ia berdiri di kartu biasa.
function kartuBenih(b) {
  const s = b.benih;
  if (!s) return '';
  const kom = (s.commodities ?? []).filter(Boolean);
  return `
    <div class="kartu">
      <h2>Sisi benih menurut registri varietas</h2>
      <dl class="kunci">
        ${s.first_year && s.last_year ? `<dt>Rentang pendaftaran</dt><dd>${teks(s.first_year)}–${teks(s.last_year)}</dd>` : ''}
        ${s.main_commodity ? `<dt>Kelompok terbanyak</dt><dd>${teks(s.main_commodity)}</dd>` : ''}
        ${s.top_permit_kind ? `<dt>Jenis izin terbanyak</dt><dd>${teks(s.top_permit_kind)}</dd>` : ''}
        ${kom.length > 1 ? `<dt>Kelompok lain</dt><dd>${teks(kom.slice(1).join(', '))}</dd>` : ''}
      </dl>
      <p class="catatan">
        Ini bukan sifat agronomi. Registri varietas memuat <strong>berkas perizinan</strong>;
        nol dari 11.227 varietas menyebut ketahanan, umur panen, atau potensi hasil.
      </p>
    </div>`;
}

// Kotak pengaya — sengaja berupa <div class="kartu pengaya"> dan sengaja membawa tingkat
// buktinya di kepala, bukan di catatan kaki. Isinya tidak pernah dicampur ke kartu di atas.
function kartuPengaya(b) {
  const p = b.pengaya;
  if (!p) {
    return `
      <div class="kartu">
        <h2>Keterangan perusahaan</h2>
        <p class="kosong">
          Tidak ada. Grup induk, negara asal, merek payung, dan situs resmi
          <strong>tidak dicatat registri mana pun</strong>, dan badan ini belum masuk lapis
          riset yang mengisinya — 151 dari ${n(bacaCacah())} badan yang sudah punya.
        </p>
      </div>`;
  }
  const merek = (p.umbrella_brands ?? []).filter(Boolean);
  const baris = [
    ['Grup induk', p.parent_group],
    ['Asal', p.origin],
    ['Status aktivitas', p.activity_status],
  ].filter(([, v]) => v);

  return `
    <div class="kartu pengaya">
      <h2>Keterangan perusahaan
        <span class="lencana lencana-d">Tingkat D · belum diverifikasi</span>
      </h2>
      <p class="catatan catatan-tegas">
        <strong>Kotak ini bukan dari registri.</strong> Isinya hasil riset web 19 Agustus
        2026 dan <strong>belum diperiksa ulang ke sumber aslinya</strong>. Klaim kepemilikan
        merek berubah seiring waktu — registri 2014 mencatat Roundup di Monagro Kimia, hari
        ini dipasarkan Nufarm. Jangan pakai satu baris pun tanpa memperhatikan tanggalnya.
      </p>
      ${baris.length ? `<dl class="kunci">${baris.map(([k, v]) => `<dt>${teks(k)}</dt><dd>${teks(v)}</dd>`).join('')}</dl>` : ''}
      ${p.website ? `<p class="situs">Situs yang disebut riset:
        <a href="${teks(alamatAman(p.website))}" rel="nofollow noopener noreferrer external" target="_blank">${teks(p.website)}</a></p>` : ''}
      ${merek.length ? `
        <h3>Merek payung yang disebut riset</h3>
        <ul class="merek-payung">${merek.map((m) => `<li>${teks(m)}</li>`).join('')}</ul>
        <p class="catatan">
          Daftar ini <strong>bukan</strong> daftar pendaftaran. Yang terdaftar ada di kartu
          di bawah; yang di sini nama dagang sebagaimana disebut sumber riset, dan keduanya
          kerap tidak sama.
        </p>` : ''}
      <p class="catatan">
        Keyakinan periset: <strong>${teks(p.confidence ?? 'tidak dinyatakan')}</strong>${p.confidence_note ? ` — ${teks(p.confidence_note)}` : ''}.
        ${p.updated ? `Diperbarui ${teks(tanggal(p.updated) ?? p.updated)}.` : ''}
      </p>
    </div>`;
}

// Situs dari lapis riset tidak dipercaya apa adanya: hanya http/https yang jadi tautan,
// dan yang tanpa skema diberi https. Selebihnya ditampilkan sebagai teks di pemanggilnya.
function alamatAman(s) {
  const t = String(s ?? '').trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(t)) return `https://${t}`;
  return '#';
}

let cacahPrincipal = 0;
const bacaCacah = () => cacahPrincipal;

function kartuDaftar(b) {
  const daftar = b.daftar ?? [];
  if (!daftar.length) {
    return `
      <div class="kartu">
        <h2>Yang terdaftar atas nama ini</h2>
        <p class="kosong">
          Tidak ada satu pun. Nama ini ada di kosakata karena pernah muncul sebagai pemegang,
          tetapi tidak ada baris registri yang tertaut ke sana pada tarikan ini.
        </p>
      </div>`;
  }

  const per = { pestisida: [], pupuk: [], varietas: [] };
  for (const x of daftar) (per[x.j] ??= []).push(x);

  const bagian = Object.entries(per)
    .filter(([, xs]) => xs.length)
    .map(([j, xs]) => `
      <h3>${teks(JENIS_PUNYA[j] ?? j)} <span class="lencana">${n(xs.length)}</span></h3>
      <div class="pembungkus-tabel">
        <table>
          <thead><tr>
            <th>Nama</th>
            <th>${j === 'varietas' ? 'Tanaman' : 'Nomor pendaftaran'}</th>
            ${j === 'varietas' ? '' : '<th>Gambar</th>'}
          </tr></thead>
          <tbody>${xs.map((x) => `
            <tr>
              <td><a href="${teks(tautanEntri(x))}">${teks(x.n)}</a></td>
              <td class="${j === 'varietas' ? '' : 'angka'}">${teks((j === 'varietas' ? x.k : x.d) ?? '—')}</td>
              ${j === 'varietas' ? '' : `<td>${x.g ? '<span class="ada-gambar">ada</span>' : '<span class="kosong">belum</span>'}</td>`}
            </tr>`).join('')}</tbody>
        </table>
      </div>`).join('');

  const bergambar = daftar.filter((x) => x.g).length;
  return `
    <div class="kartu">
      <h2>Yang terdaftar atas nama ini <span class="lencana">${n(daftar.length)}</span></h2>
      <p class="catatan">
        Diurutkan menurut <strong>nomor pendaftaran menaik</strong> di dalam tiap jenis —
        tanpa peringkat, tanpa slot berbayar. Urutannya ditentukan struktur data, bukan
        kebijakan yang bisa diubah.
      </p>
      ${bagian}
      <p class="catatan">
        Gambar kemasan ada pada ${n(bergambar)} dari ${n(daftar.filter((x) => x.j !== 'varietas').length)}
        pendaftaran non-benih di daftar ini. Yang kosong <strong>bukan tanda produknya tidak
        ada</strong> — situs principal-nya belum dipanen, atau mereknya memang tidak
        berkemasan eceran.
      </p>
    </div>`;
}

// ---------------------------------------------------------------------------
// Muat satu profil
// ---------------------------------------------------------------------------
async function buka(key) {
  el.isi.innerHTML = '<p class="kosong">Mengambil profil…</p>';
  try {
    const b = await ambil(`principal/${key}`);
    document.title = `${b.nama} — Open Protocols`;
    el.judul.textContent = b.nama;
    el.lede.innerHTML =
      `Apa saja yang terdaftar atas nama badan ini di registri Kementan — dan apa yang ` +
      `registri <em>tidak</em> catat tentangnya.`;
    el.isi.innerHTML = kartuPokok(b) + kartuPengaya(b) + kartuBenih(b) + kartuDaftar(b);
    el.isi.focus();
  } catch (e) {
    el.isi.innerHTML = `
      <div class="kartu peringatan">
        <h2>Profil itu tidak ada</h2>
        <p>
          Tidak ada badan dengan alamat itu di indeks. Kalau tautannya datang dari halaman
          lain, indeksnya mungkin dibangun ulang sesudah tautan itu dibuat — cari namanya
          di kotak di bawah.
        </p>
        <p class="catatan">${teks(e.message)}</p>
      </div>`;
  }
}

// ---------------------------------------------------------------------------
// Pencarian badan lain
// ---------------------------------------------------------------------------
function gambarHasilPrincipal(daftar, kueri) {
  if (!daftar.length) {
    el.hasil.innerHTML = `
      <p class="kosong">
        Tidak ada badan yang namanya memuat <strong>${teks(kueri)}</strong>. Badan pemerintah
        dan lembaga juga bisa dicari lewat nama tempatnya saja — "Probolinggo", bukan
        "Pemerintah Daerah Kabupaten Probolinggo".
      </p>`;
    return;
  }
  const tampil = daftar.slice(0, 40);
  el.hasil.innerHTML = `
    <p class="bantuan">${n(daftar.length)} badan${daftar.length > tampil.length ? `, ditampilkan ${tampil.length} teratas` : ''}.</p>
    <ul class="daftar">
      ${tampil.map((x) => `
        <li>
          <a class="baris-tautan" href="principal.html?key=${encodeURIComponent(kunciDari(x))}">
            <span class="nama">${teks(x.n)}${x.f ? `<span class="lencana">${teks(x.f)}</span>` : ''}</span>
            <span class="sub">${teks(x.k ?? '—')}</span>
          </a>
        </li>`).join('')}
    </ul>`;
}

// Entri pencarian principal menyimpan jalurnya sebagai `principal/<key>`; key-nya diambil
// dari situ alih-alih dibentuk ulang dari nama, supaya keduanya tidak pernah berbeda.
const kunciDari = (x) => String(x.p ?? '').replace(/^principal\//, '');

let jeda;
async function jalankan() {
  const kueri = el.q.value.trim();
  if (!kueri) { el.hasil.innerHTML = ''; el.bantuan.textContent = 'Ketik minimal dua huruf.'; return; }
  try {
    const { hasil, kurang } = await cari(kueri, (x) => x.j === 'principal');
    if (kurang) {
      el.hasil.innerHTML = '';
      el.bantuan.textContent = `Tambah ${kurang} huruf lagi supaya pecahan indeksnya cukup sempit.`;
      return;
    }
    el.bantuan.textContent = 'Ketik minimal dua huruf.';
    // Satu badan bisa muncul dua kali: sekali di bawah nama penuhnya, sekali di bawah nama
    // tanpa awalan lembaga. Yang kembar dibuang di sini, bukan di indeks — di indeks
    // keduanya memang harus ada, karena keduanya pintu masuk yang berbeda.
    const unik = [...new Map((hasil ?? []).map((x) => [x.i, x])).values()];
    gambarHasilPrincipal(unik, kueri);
  } catch (e) {
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Pencarian gagal</h2>
      <p>Berkas indeksnya tidak terambil. Periksa sambungan, lalu ketik ulang.</p>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
}
el.q.addEventListener('input', () => { clearTimeout(jeda); jeda = setTimeout(jalankan, 180); });
document.getElementById('formCari').addEventListener('submit', (ev) => {
  ev.preventDefault();
  clearTimeout(jeda);
  jalankan();
});

// ---------------------------------------------------------------------------
// Mulai
// ---------------------------------------------------------------------------
(async function mulai() {
  try {
    const m = await muatMeta();
    cacahPrincipal = m.jumlah?.principal ?? 0;

    pasangBatas(el.batas, {
      sumber: ['principal', 'pestisida', 'pupuk', 'varietas'],
      takDijawab: ['namaDagang', 'gambarKemasan'],
    });

    const key = new URLSearchParams(location.search).get('key');
    if (key && BENTUK_KEY.test(key)) {
      await buka(key);
    } else {
      el.isi.innerHTML = `
        <div class="kartu">
          <h2>Pilih satu badan lebih dulu</h2>
          <p>
            Halaman ini menampilkan satu badan pemegang pendaftaran sekaligus. Cari namanya
            di kotak di bawah — ${n(cacahPrincipal)} badan terindeks, mencakup perusahaan,
            balai penelitian, dinas, perguruan tinggi, dan pemerintah daerah.
          </p>
          <p class="catatan">
            Lembaga dan pemerintah daerah bisa dicari lewat <strong>nama tempatnya
            saja</strong>: "Bandung" menemukan Pemerintah Kabupaten Bandung dan Dinas
            Pertanian Kabupaten Bandung tanpa mengeja awalannya.
          </p>
        </div>`;
      el.q.focus();
    }
  } catch (e) {
    el.isi.innerHTML = `
      <div class="kartu peringatan">
        <h2>Indeks tidak ditemukan</h2>
        <p>
          Halaman ini membaca <code>spec/indeks/</code>, yang turunan dan sengaja tidak ikut
          disimpan di repositori. Bangun dulu dari akar repositori:
          <code>node spec/tools/bangun-principal.mjs --tulis</code> lalu
          <code>node spec/tools/bangun-indeks.mjs --tulis</code>, dan sajikan akarnya —
          menyajikan <code>app/</code> saja tidak cukup.
        </p>
        <p class="catatan">${teks(e.message)}</p>
      </div>`;
  }
})();
