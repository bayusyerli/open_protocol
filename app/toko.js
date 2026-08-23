/* C7 — direktori layanan. Dua pintu, karena datanya memang dua bentuk.
 *
 * YANG PALING MENENTUKAN DI HALAMAN INI BUKAN PENCARIANNYA, MELAINKAN PEMISAHANNYA.
 * 234 rekaman punya koordinat dan bisa dituju; 2.248 hanya punya nama kabupaten dan
 * tidak bisa. Menggabungkannya jadi satu daftar akan membuat yang kedua tampak setara
 * dengan yang pertama — dan itu satu-satunya perbedaan yang menentukan apakah halaman
 * ini berguna sama sekali.
 *
 * POSISI TIDAK PERNAH MENINGGALKAN PERANTI. Jarak dihitung di sini terhadap daftar yang
 * sudah diambil; tidak ada permintaan jaringan saat menghitungnya, dan tidak ada server
 * yang bisa menerimanya. Itu bukan kebetulan arsitektur — beranda menjanjikan "kata yang
 * dicari tidak dikirim ke mana pun", dan koordinat rumah orang jauh lebih menentukan
 * daripada kata yang dicarinya.
 *
 * TIDAK ADA GEOKODE. Yang berkoordinat tidak diberi nama wilayah, dan yang bernama
 * wilayah tidak diberi koordinat. Keduanya menuntut geokode massal, dan itu sudah
 * diputuskan tidak dilakukan — medan kosong menunggu pemilik toko mengklaimnya, bukan
 * ditambal tebakan.
 */

import { ambil, muatMeta, teks } from './pustaka.js';
import { pasangBatas } from './batas.js';
import { pasangTombolTema } from './tema.js';

pasangTombolTema();
document.getElementById('tanpaJs')?.remove();

const el = {};
for (const id of ['ringkasTitik', 'cariDekat', 'hasilDekat', 'ringkasWilayah', 'q',
  'hasilWilayah', 'rincian', 'pctRinci',
  'ringkasBpp', 'qBpp', 'hasilBpp', 'rincianBpp',
  'ringkasLab', 'saringLab', 'hasilLab', 'rincianLab']) el[id] = document.getElementById(id);
el.batas = document.getElementById('batasJawaban');

const n = (x, d = 0) => Number(x ?? 0).toLocaleString('id-ID', { maximumFractionDigits: d });
const rapi = (s) => (s ?? '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

let titik = [];
let wilayah = [];
let bppWilayah = [];
let labKepala = null;
let saringan = null;

// Haversine. Bumi bukan bola sempurna, dan pada jarak sekian kilometer selisihnya di
// bawah satu persen — jauh lebih kecil daripada ketidakpastian titik OSM itu sendiri.
function jarakKm(a, b, c, d) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (c - a) * r, dLon = (d - b) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const petaOsm = (y, x) =>
  `https://www.openstreetmap.org/?mlat=${y}&mlon=${x}#map=17/${y}/${x}`;

// ---------------------------------------------------------------------------
// Pintu 1 — terdekat
// ---------------------------------------------------------------------------
el.cariDekat.addEventListener('click', () => {
  if (!navigator.geolocation) {
    el.hasilDekat.innerHTML =
      '<p class="kosong">Peramban ini tidak bisa menyebutkan posisi, jadi urutan terdekat tidak bisa dihitung. Telusuri menurut wilayah di bawah.</p>';
    return;
  }
  el.hasilDekat.innerHTML = '<p class="kosong">Menunggu izin lokasi…</p>';
  navigator.geolocation.getCurrentPosition(
    (pos) => gambarDekat(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
    (err) => {
      el.hasilDekat.innerHTML = `
        <p class="kosong">
          Posisi tidak diberikan${err.code === 1 ? ' — izinnya ditolak' : ''}. Itu pilihan yang sah;
          telusuri menurut wilayah di bawah, walau daftar itu memang tidak bisa dituju.
        </p>`;
    },
    { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
  );
});

function gambarDekat(lat, lon, akurasi) {
  const dekat = titik
    .map((t) => ({ ...t, km: jarakKm(lat, lon, t.y, t.x) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 15);

  el.hasilDekat.innerHTML = `
    <p class="bantuan">
      Lima belas terdekat dari ${n(titik.length)} titik. Posisimu terbaca dengan ketelitian
      sekitar ${n(akurasi)} m — jarak di bawah itu tidak berarti apa-apa.
    </p>
    <div class="pembungkus-tabel">
      <table>
        <thead><tr><th>Nama</th><th>Jarak</th><th>Peta</th></tr></thead>
        <tbody>
          ${dekat.map((t) => `
            <tr>
              <td>${teks(t.n)}</td>
              <td class="angka">${t.km < 1 ? `${n(t.km * 1000)} m` : `${n(t.km, 1)} km`}</td>
              <td><a href="${teks(petaOsm(t.y, t.x))}" rel="noopener noreferrer">buka peta</a></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="catatan">
      Jarak <strong>garis lurus</strong>, bukan jarak jalan — yang terdekat di peta bisa
      jadi yang terjauh kalau sungainya tidak berjembatan. Dan titik ini dari
      OpenStreetMap: <strong>tidak ada yang memastikan tokonya masih buka</strong>.
    </p>`;
}

// ---------------------------------------------------------------------------
// Pintu 2 — wilayah
// ---------------------------------------------------------------------------
function gambarWilayah() {
  const r = rapi(el.q.value);
  const cocok = r ? wilayah.filter((w) => rapi(w.w).includes(r)) : wilayah;
  if (!cocok.length) {
    el.hasilWilayah.innerHTML =
      `<p class="kosong">Tidak ada wilayah yang cocok. Cakupannya baru ${n(wilayah.length)} kabupaten dan kota — jauh dari seluruh Indonesia.</p>`;
    return;
  }
  const tampil = cocok.slice(0, 40);
  el.hasilWilayah.innerHTML = `
    <p class="bantuan">${n(cocok.length)} wilayah${cocok.length > tampil.length ? `, ditampilkan ${tampil.length} teratas` : ''}.</p>
    <ul class="daftar">
      ${tampil.map((w) => `
        <li>
          <button type="button" data-wilayah="${teks(w.k)}">
            <span class="nama">${teks(w.w)}<span class="lencana">${n(w.n)}</span></span>
            <span class="sub">${w.rinci ? `${n(w.rinci)} beralamat lebih rinci` : 'tidak satu pun beralamat lebih rinci dari kabupaten'}</span>
          </button>
        </li>`).join('')}
    </ul>`;
}

el.hasilWilayah.addEventListener('click', async (ev) => {
  const b = ev.target.closest('button[data-wilayah]');
  if (!b) return;
  const w = wilayah.find((x) => x.k === b.dataset.wilayah);
  el.rincian.innerHTML = '<p class="kosong">Mengambil…</p>';
  try {
    const isi = await ambil(`toko/${b.dataset.wilayah}`);
    const rinci = isi.filter((x) => x.j);
    el.rincian.innerHTML = `
      <div class="kartu">
        <h2>${teks(w?.w ?? '')}</h2>
        <p>
          ${n(isi.length)} penjual benih tercatat di wilayah ini.
          ${rinci.length
            ? `<strong>${n(rinci.length)}</strong> di antaranya menyebut alamat yang lebih rinci daripada kabupaten; sisanya tidak.`
            : '<strong>Tidak satu pun</strong> menyebut alamat yang lebih rinci daripada nama kabupaten ini.'}
        </p>
        <div class="pembungkus-tabel">
          <table>
            <thead><tr><th>Nama</th><th>Yang tercatat sebagai alamat</th></tr></thead>
            <tbody>
              ${isi.slice(0, 200).map((x) => `
                <tr>
                  <td>${teks(x.n)}</td>
                  <td>${x.j ? teks(x.a) : `<span class="kosong">hanya ${teks(w?.w ?? 'kabupaten')}</span>`}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        ${isi.length > 200 ? `<p class="catatan">${n(isi.length - 200)} lainnya tidak ditampilkan.</p>` : ''}
        <p class="catatan">
          <strong>Nama tanpa alamat tidak bisa dituju.</strong> Yang tercatat di sini bukti
          bahwa penjual benih ada di wilayah itu, bukan petunjuk ke mana pergi. Tidak ada
          nomor telepon, jam buka, maupun keterangan apakah tokonya masih ada.
        </p>
        <button type="button" class="kembali" id="kembali">← Kembali ke daftar wilayah</button>
      </div>`;
    el.rincian.focus();
    el.rincian.querySelector('#kembali')?.addEventListener('click', () => {
      el.rincian.innerHTML = '';
      el.q.focus();
    });
  } catch (e) {
    el.rincian.innerHTML = `<div class="kartu peringatan"><h2>Gagal diambil</h2>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
});

el.q.addEventListener('input', gambarWilayah);

// ---------------------------------------------------------------------------
// Balai penyuluhan — ditelusuri menurut KECAMATAN, karena itu satu-satunya penanda
// tempat yang dipunyainya
// ---------------------------------------------------------------------------
// Rekaman balai TIDAK punya alamat, dan itu batas sumbernya: laporan tamu SIMLUHTAN
// hanya memberi nama balai dan kecamatan binaannya. Halaman ini tidak menambalnya dengan
// geokode — keputusan yang sama seperti pada toko tani di atas.
//
// Tetapi "tanpa alamat" di sini TIDAK sama artinya dengan pada penjual benih. Nama
// penjual benih tanpa alamat tidak bisa dituju siapa pun; nama balai beserta kecamatan
// binaannya bisa dituju oleh orang yang tinggal di kecamatan itu — dan dialah yang
// mencarinya. Yang tidak tahu letaknya mesinnya, bukan orangnya. Karena itu kecamatan
// ditampilkan sebagai penanda utama, bukan sebagai catatan kaki.
function gambarBpp() {
  const r = rapi(el.qBpp.value);
  const cocok = r ? bppWilayah.filter((w) => rapi(w.w).includes(r)) : bppWilayah;
  if (!cocok.length) {
    el.hasilBpp.innerHTML = `<p class="kosong">Tidak ada kabupaten atau kota yang cocok. Cakupannya ${n(bppWilayah.length)} dari 514 — 34 provinsi, karena pemekaran Papua belum masuk basis data sumbernya.</p>`;
    return;
  }
  const tampil = cocok.slice(0, 40);
  el.hasilBpp.innerHTML = `
    <p class="bantuan">${n(cocok.length)} wilayah${cocok.length > tampil.length ? `, ditampilkan ${tampil.length} teratas` : ''}.</p>
    <ul class="daftar">
      ${tampil.map((w) => `
        <li>
          <button type="button" data-bpp="${teks(w.k)}">
            <span class="nama">${teks(w.w)}<span class="lencana">${n(w.n)}</span></span>
            <span class="sub">membina ${n(w.kec)} kecamatan</span>
          </button>
        </li>`).join('')}
    </ul>`;
}

el.hasilBpp.addEventListener('click', async (ev) => {
  const b = ev.target.closest('button[data-bpp]');
  if (!b) return;
  const w = bppWilayah.find((x) => x.k === b.dataset.bpp);
  el.rincianBpp.innerHTML = '<p class="kosong">Mengambil…</p>';
  try {
    const isi = await ambil(`bpp/${b.dataset.bpp}`);
    const kosong = isi.filter((x) => !x.k.length).length;
    el.rincianBpp.innerHTML = `
      <div class="kartu">
        <h2>${teks(w?.w ?? '')}</h2>
        <p>${n(isi.length)} balai penyuluhan, membina ${n(w?.kec ?? 0)} kecamatan.</p>
        <div class="pembungkus-tabel">
          <table>
            <thead><tr><th>Balai</th><th>Kecamatan binaan</th><th class="angka">Penyuluh</th><th class="angka">Poktan</th></tr></thead>
            <tbody>
              ${isi.map((x) => `
                <tr>
                  <td>${teks(x.n)}</td>
                  <td>${x.k.length ? teks(x.k.join(', ')) : '<span class="kosong">kosong di sumbernya</span>'}</td>
                  <td class="angka">${x.p == null ? '—' : n(x.p)}</td>
                  <td class="angka">${x.g == null ? '—' : n(x.g)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        ${kosong ? `<p class="catatan">${n(kosong)} balai di sini kecamatan binaannya kosong di sumbernya — bukan berarti ia tidak membina satu pun.</p>` : ''}
        <p class="catatan">
          <strong>Tidak ada alamat, telepon, maupun nama penyuluh</strong>, dan tidak akan
          ditambal. Laporan tamu SIMLUHTAN memang hanya memberi nama balai, kecamatan
          binaannya, dan cacahan orangnya. Yang menemukan balainya kecamatan, bukan peta.
        </p>
        <button type="button" class="kembali" data-tutup="bpp">← Kembali ke daftar wilayah</button>
      </div>`;
    el.rincianBpp.focus();
  } catch (e) {
    el.rincianBpp.innerHTML = `<div class="kartu peringatan"><h2>Gagal diambil</h2><p class="catatan">${teks(e.message)}</p></div>`;
  }
});

// ---------------------------------------------------------------------------
// Laboratorium — disaring menurut KEMAMPUAN lebih dulu, baru tempat
// ---------------------------------------------------------------------------
// "Siapa yang bisa mengukur residu pestisida" menyaring 889 jadi 17. Daftar provinsi
// tanpa penyaring itu cuma memindahkan pekerjaan memilah ke pembacanya.
//
// MASA BERLAKU AKREDITASI DITANDAI, DAN ITU BUKAN HIASAN. 11 dari 889 sudah lewat masa
// berlakunya — dan satu di antaranya termasuk 17 yang bisa mengukur residu. Artinya
// penyaring "residu" mengembalikan satu jawaban yang hasil ujinya TIDAK LAGI DIAKUI, dan
// itu tidak terlihat dari nama laboratoriumnya. Cacah yang ditampilkan karena itu selalu
// menyebutkan berapa di antaranya yang sudah lewat.
const HARI_INI = new Date().toISOString().slice(0, 10);
const lewatMasa = (x) => Boolean(x.sd) && x.sd < HARI_INI;

function gambarSaringLab() {
  const arti = labKepala.arti;
  el.saringLab.innerHTML = `<legend>Yang perlu diuji</legend>` + Object.entries(arti)
    .sort((a, b) => (labKepala.cacah[b[0]] ?? 0) - (labKepala.cacah[a[0]] ?? 0))
    .map(([kode, nama]) => `
      <label class="saring-pilih">
        <input type="radio" name="kemampuan" value="${teks(kode)}"${kode === saringan ? ' checked' : ''}>
        <span>${teks(nama)} <span class="lencana">${n(labKepala.cacah[kode] ?? 0)}</span></span>
      </label>`).join('')
    + `<label class="saring-pilih">
         <input type="radio" name="kemampuan" value=""${saringan ? '' : ' checked'}>
         <span>semua <span class="lencana">${n(labKepala.wilayah.reduce((a, w) => a + w.n, 0))}</span></span>
       </label>`;
}

function gambarLab() {
  const w = labKepala.wilayah
    .map((x) => ({ ...x, cocok: saringan ? (x.per?.[saringan] ?? 0) : x.n }))
    .filter((x) => x.cocok > 0)
    .sort((a, b) => b.cocok - a.cocok || a.w.localeCompare(b.w));
  const nama = saringan ? labKepala.arti[saringan] : null;
  if (!w.length) {
    el.hasilLab.innerHTML = `<p class="kosong">Tidak ada provinsi yang punya laboratorium untuk ${teks(nama ?? 'itu')}.</p>`;
    return;
  }
  el.hasilLab.innerHTML = `
    <p class="bantuan">${n(w.reduce((a, x) => a + x.cocok, 0))} laboratorium${nama ? ` yang lingkupnya menyentuh ${teks(nama)}` : ''} di ${n(w.length)} provinsi.</p>
    <ul class="daftar">
      ${w.map((x) => `
        <li>
          <button type="button" data-lab="${teks(x.k)}">
            <span class="nama">${teks(x.w)}<span class="lencana">${n(x.cocok)}</span></span>
            ${nama ? `<span class="sub">dari ${n(x.n)} laboratorium di provinsi ini</span>` : ''}
          </button>
        </li>`).join('')}
    </ul>`;
}

el.saringLab.addEventListener('change', (ev) => {
  if (ev.target.name !== 'kemampuan') return;
  saringan = ev.target.value || null;
  el.rincianLab.innerHTML = '';
  gambarLab();
});

el.hasilLab.addEventListener('click', async (ev) => {
  const b = ev.target.closest('button[data-lab]');
  if (!b) return;
  const w = labKepala.wilayah.find((x) => x.k === b.dataset.lab);
  el.rincianLab.innerHTML = '<p class="kosong">Mengambil…</p>';
  try {
    const semua = await ambil(`lab/${b.dataset.lab}`);
    const isi = saringan ? semua.filter((x) => x.k.includes(saringan)) : semua;
    const lewat = isi.filter(lewatMasa);
    const nama = saringan ? labKepala.arti[saringan] : null;
    el.rincianLab.innerHTML = `
      <div class="kartu">
        <h2>${teks(w?.w ?? '')}</h2>
        <p>
          ${n(isi.length)} laboratorium${nama ? ` yang lingkupnya menyentuh <strong>${teks(nama)}</strong>` : ''}.
          ${lewat.length
            ? `<strong>${n(lewat.length)}</strong> di antaranya masa akreditasinya sudah lewat — hasil ujinya tidak lagi diakui sampai diperbarui.`
            : 'Seluruhnya masih dalam masa akreditasi.'}
        </p>
        <div class="pembungkus-tabel">
          <table>
            <thead><tr><th>Laboratorium</th><th>Alamat</th><th>Kontak</th><th>Akreditasi</th></tr></thead>
            <tbody>
              ${isi.map((x) => `
                <tr${lewatMasa(x) ? ' class="lewat-masa"' : ''}>
                  <td>${teks(x.n)}<br><span class="sub">${teks((x.k || '').split('').map((c) => labKepala.arti[c]).filter(Boolean).join(', '))}</span></td>
                  <td>${x.a ? teks(x.a) : '<span class="kosong">tidak tercatat</span>'}</td>
                  <td>${[x.t && teks(x.t), x.e && teks(x.e)].filter(Boolean).join('<br>') || '<span class="kosong">tidak tercatat</span>'}</td>
                  <td>${teks(x.no ?? '—')}<br><span class="sub">${x.sd ? `${lewatMasa(x) ? '<strong>lewat</strong> ' : 'sampai '}${teks(x.sd)}` : 'tanpa tanggal'}</span></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <p class="catatan">
          <strong>Tarif, waktu tunggu, dan apakah ia menerima sampel dari luar tidak ada
          di sini</strong> — tidak satu pun terbit di papan KAN. Yang dijamin akreditasi
          bukan harganya melainkan bahwa metodenya diperiksa.
        </p>
        <button type="button" class="kembali" data-tutup="lab">← Kembali ke daftar provinsi</button>
      </div>`;
    el.rincianLab.focus();
  } catch (e) {
    el.rincianLab.innerHTML = `<div class="kartu peringatan"><h2>Gagal diambil</h2><p class="catatan">${teks(e.message)}</p></div>`;
  }
});

for (const [wadah, fokus] of [[el.rincianBpp, el.qBpp], [el.rincianLab, el.saringLab]]) {
  wadah.addEventListener('click', (ev) => {
    if (!ev.target.closest('button[data-tutup]')) return;
    wadah.innerHTML = '';
    fokus?.focus?.();
  });
}

el.qBpp.addEventListener('input', gambarBpp);

// ---------------------------------------------------------------------------
// Mulai
// ---------------------------------------------------------------------------
(async function mulai() {
  try {
    const m = await muatMeta();
    const j = m.jumlah;
    [titik, wilayah, bppWilayah, labKepala] = await Promise.all([
      ambil('toko-titik'), ambil('toko-wilayah'), ambil('bpp-wilayah'), ambil('lab-kemampuan'),
    ]);

    el.ringkasTitik.innerHTML =
      `<strong>${n(j.tokoBertitik)} toko tani berkoordinat</strong> dari OpenStreetMap. ` +
      `Hanya ini yang benar-benar bisa dituju — dan seluruhnya di Pulau Jawa.`;
    el.ringkasWilayah.innerHTML =
      `<strong>${n(j.tokoBerwilayah)} penjual benih</strong> di ${n(j.tokoWilayah)} kabupaten dan kota. ` +
      `Hanya <strong>${n(j.tokoLebihRinci)}</strong> — ${(j.tokoLebihRinci / j.tokoBerwilayah * 100).toFixed(1)}% — ` +
      `menyebut sesuatu yang lebih rinci daripada nama kabupaten.`;
    if (el.pctRinci) {
      el.pctRinci.textContent =
        `${n(j.tokoLebihRinci)} dari ${n(j.tokoBerwilayah)} (${(j.tokoLebihRinci / j.tokoBerwilayah * 100).toFixed(1)}%)`;
    }

    // Balai dan laboratorium menjawab dua pertanyaan yang berbeda dari toko, dan
    // ringkasannya menyebut yang menentukan masing-masing: untuk balai, bahwa ia tidak
    // beralamat; untuk laboratorium, berapa yang bisa mengukur residu — angka yang
    // menyaring 889 jadi 17.
    el.ringkasBpp.innerHTML =
      `<strong>${n(j.bpp)} balai penyuluhan</strong> di ${n(j.bppWilayah)} kabupaten dan kota, ` +
      `membina ${n(j.bppKecamatanTerbina)} kecamatan. Tidak satu pun punya alamat — ` +
      `yang menemukannya kecamatan, bukan peta.`;
    el.ringkasLab.innerHTML =
      `<strong>${n(j.lab)} laboratorium terakreditasi KAN</strong> di ${n(j.labWilayah)} provinsi, ` +
      `yang ruang lingkupnya menyentuh usaha tani. Hanya <strong>${n(j.labResidu)}</strong> ` +
      `di antaranya bisa mengukur residu pestisida.`;

    gambarWilayah();
    gambarBpp();
    gambarSaringLab();
    gambarLab();

    pasangBatas(el.batas, {
      sumber: ['tokoTitik', 'tokoWilayah', 'bpp', 'lab'],
      takDijawab: ['tokoTakBisaDituju', 'tokoTanpaKontak', 'bppTanpaAlamat'],
    });
  } catch (e) {
    el.ringkasTitik.innerHTML = `<span class="kosong">Indeks tidak terambil: ${teks(e.message)}</span>`;
  }
})();
