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
  'hasilWilayah', 'rincian', 'pctRinci']) el[id] = document.getElementById(id);
el.batas = document.getElementById('batasJawaban');

const n = (x, d = 0) => Number(x ?? 0).toLocaleString('id-ID', { maximumFractionDigits: d });
const rapi = (s) => (s ?? '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

let titik = [];
let wilayah = [];

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
// Mulai
// ---------------------------------------------------------------------------
(async function mulai() {
  try {
    const m = await muatMeta();
    const j = m.jumlah;
    [titik, wilayah] = await Promise.all([ambil('toko-titik'), ambil('toko-wilayah')]);

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

    gambarWilayah();

    pasangBatas(el.batas, {
      sumber: ['tokoTitik', 'tokoWilayah'],
      takDijawab: ['tokoTakBisaDituju', 'tokoTanpaKontak'],
    });
  } catch (e) {
    el.ringkasTitik.innerHTML = `<span class="kosong">Indeks tidak terambil: ${teks(e.message)}</span>`;
  }
})();
