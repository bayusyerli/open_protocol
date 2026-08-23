/* D3 — analisis usaha tani: rencana anggaran biaya, lalu titik impas.
 *
 * SATU ANGKA YANG MENENTUKAN SEBELUM MENANAM: rupiah per kilogram yang harus diterima
 * supaya biaya semusim tertutup. Seluruh masukannya milik pemakainya — aturan yang sama
 * seperti jalur 3, dan tandanya tetap terlihat di tiap hasil.
 *
 * KENAPA HARGA ECERAN TIDAK DITARUH BERSEBELAHAN. Titik impas di sebelah harga eceran
 * terbaca seolah selisihnya keuntungan. Ia bukan: eceran memuat marjin seluruh rantai.
 * Dan bahkan "harga produsen" resmi bukan harga petani — respondennya pengumpul,
 * penggilingan, dan pedagang; di Karawang satu orang. Jaraknya terpasang di dalam
 * DEFINISINYA, bukan celah cakupan. Jadi yang ditayangkan RASIO, mengikuti aturan tayang
 * ke-5 di docs/16: "Harga Anda = 70% setara-CPO dari harga dunia" jauh lebih sulit
 * disalahpahami daripada dua angka berdampingan.
 *
 * ARUS KAS SEMUSIM DITAHAN, BUKAN DITAMPILKAN SETENGAH. Kapan biaya keluar dan kapan uang
 * masuk menuntut kalender bertanggal; kosakata fase sengaja tidak punya medan hari, dan
 * hanya dua dari empat langkah protokol cabai bertanggal.
 */

import { ambil, muatMeta, teks } from './pustaka.js';
import { pasangBatas } from './batas.js';
import { pasangTombolTema } from './tema.js';

pasangTombolTema();
document.getElementById('tanpaJs')?.remove();

const el = {};
for (const id of ['barisBiaya', 'tambahBiaya', 'hasilBiaya', 'luas', 'hasil',
  'komoditas', 'hasilImpas']) el[id] = document.getElementById(id);
el.batas = document.getElementById('batasJawaban');

const rupiah = (x) => 'Rp ' + Math.round(x).toLocaleString('id-ID');
const n = (x, d = 0) => Number(x ?? 0).toLocaleString('id-ID', { maximumFractionDigits: d });

/* Kategori, bukan angka. Menyediakan daftar barisnya menolong orang mengingat apa yang
 * belum dihitung; menyediakan ANGKANYA berarti mengarang biaya yang tidak pernah diukur
 * siapa pun, dan tiap daerah berbeda. */
const KATEGORI = [
  'Benih atau bibit', 'Pupuk', 'Pestisida', 'Tenaga kerja — olah tanah',
  'Tenaga kerja — tanam', 'Tenaga kerja — pemeliharaan', 'Tenaga kerja — panen',
  'Sewa lahan', 'Sewa alat', 'Mulsa & ajir', 'Pengairan', 'Angkut & kemas', 'Lainnya',
];

let harga = [];
let baris = 0;

function tambahBaris(kategori = null) {
  const i = ++baris;
  const div = document.createElement('div');
  div.className = 'baris-hara';
  div.innerHTML = `
    <label class="khusus-pembaca" for="kat${i}">Jenis biaya</label>
    <select id="kat${i}" class="b-kat">
      ${KATEGORI.map((k) => `<option${k === kategori ? ' selected' : ''}>${teks(k)}</option>`).join('')}
    </select>
    <label class="khusus-pembaca" for="jml${i}">Jumlah rupiah</label>
    <input id="jml${i}" class="b-jml" type="number" inputmode="decimal" min="0" step="any" placeholder="Rp 0">
    <button type="button" class="k-buang" aria-label="Buang baris ini">×</button>`;
  div.querySelector('.k-buang').addEventListener('click', () => {
    if (el.barisBiaya.children.length > 1) { div.remove(); hitung(); }
  });
  div.querySelector('.b-jml').addEventListener('input', hitung);
  div.querySelector('.b-kat').addEventListener('change', hitung);
  el.barisBiaya.appendChild(div);
}

const angka = (x) => { const v = parseFloat(x); return Number.isFinite(v) && v > 0 ? v : 0; };

function bacaBiaya() {
  return [...el.barisBiaya.children]
    .map((b) => ({ kat: b.querySelector('.b-kat').value, jml: angka(b.querySelector('.b-jml').value) }))
    .filter((x) => x.jml > 0);
}

function hitung() {
  const isi = bacaBiaya();
  const total = isi.reduce((a, x) => a + x.jml, 0);
  const luas = angka(el.luas.value);
  const hasilKg = angka(el.hasil.value);

  el.hasilBiaya.innerHTML = !isi.length
    ? '<p class="kosong">Belum ada biaya yang diisi.</p>'
    : `<div class="hasil-besar"><strong>${rupiah(total)}</strong><span>biaya semusim, dari ${isi.length} baris</span></div>
       ${luas ? `<p class="bantuan">Setara ${rupiah(total / luas * 10000)} per hektare.</p>` : ''}`;

  if (!total || !hasilKg) {
    el.hasilImpas.innerHTML = '<p class="kosong">Isi biaya di atas, lalu perkiraan hasil panen.</p>';
    return;
  }

  const impas = total / hasilKg;
  const k = harga.find((h) => h.k === el.komoditas.value);

  el.hasilImpas.innerHTML = `
    <div class="hasil-besar">
      <strong>${rupiah(impas)}</strong>
      <span>per kilogram — di bawah ini rugi</span>
    </div>
    <div class="pembungkus-tabel">
      <table><tbody>
        <tr><th>Titik impas</th><td class="angka">${rupiah(total)} ÷ ${n(hasilKg)} kg = ${rupiah(impas)}/kg</td></tr>
        ${luas ? `<tr><th>Hasil per hektare</th><td class="angka">${n(hasilKg)} kg ÷ ${n(luas)} m² × 10.000 = ${n(hasilKg / luas * 10000)} kg/ha</td></tr>` : ''}
      </tbody></table>
    </div>
    ${k ? blokRasio(impas, k) : '<p class="catatan">Pilih komoditas di atas untuk melihat seberapa jauh titik impasmu dari harga di ujung rantai.</p>'}
    <p class="catatan">
      Pembagiannya ditulis terbuka supaya bisa dibantah. Seluruh angkanya masukanmu —
      biaya, luas, dan perkiraan hasil. <strong>Registri tidak memuat potensi hasil satu
      pun varietas</strong>, jadi tidak ada angka acuan yang bisa disodorkan untuk itu.
    </p>`;
}

/* Rasio, bukan dua angka bersebelahan — aturan tayang ke-5 di docs/16. */
function blokRasio(impas, k) {
  const pct = impas / k.p * 100;
  return `
    <div class="kartu ${pct >= 100 ? 'tabrakan' : ''}">
      <h2>Titik impasmu ${n(pct, 0)}% dari harga eceran ${teks(k.n)}</h2>
      <p>
        Harga eceran nasional ${teks(k.n)} <strong>${rupiah(k.p)}/${teks(k.s)}</strong>
        pada ${teks(k.t)}. Titik impasmu ${rupiah(impas)}/kg — <strong>${n(pct, 0)}%</strong> dari angka itu.
      </p>
      <p class="catatan">
        <strong>Selisihnya bukan keuntunganmu.</strong> Harga eceran memuat marjin seluruh
        rantai — pengumpul, pedagang besar, pengecer — dan tidak satu pun dari itu sampai
        ke petak. Bahkan "harga produsen" resmi pun bukan harga petani: respondennya
        pengumpul dan penggilingan, dan di Karawang tercatat <strong>satu orang</strong>.
        ${pct >= 100
          ? '<strong>Titik impasmu di atas harga eceran itu sendiri</strong> — pada harga sebesar itu, usaha ini rugi bahkan sebelum rantai mengambil bagiannya.'
          : 'Yang menentukan tetap harga yang <em>kamu</em> terima, dan tidak ada sumber terbuka yang mengukurnya.'}
      </p>
    </div>`;
}

el.tambahBiaya.addEventListener('click', () => tambahBaris());
for (const id of ['luas', 'hasil']) el[id].addEventListener('input', hitung);
el.komoditas.addEventListener('change', hitung);

// Empat baris terisi lebih dulu: bukan angka, hanya kategori yang paling sering ada.
for (const k of ['Benih atau bibit', 'Pupuk', 'Pestisida', 'Tenaga kerja — pemeliharaan']) tambahBaris(k);
hitung();

(async function mulai() {
  try {
    await muatMeta();
    harga = await ambil('harga');
    el.komoditas.innerHTML = '<option value="">— pilih komoditas —</option>' +
      harga.slice().sort((a, b) => a.n.localeCompare(b.n))
        .map((h) => `<option value="${teks(h.k)}">${teks(h.n)}</option>`).join('');

    pasangBatas(el.batas, {
      sumber: [
        {
          label: 'Biaya, luas, dan hasil — masukanmu sendiri',
          penerbit: 'Pemakai layar ini',
          tarikan: '2026-08-23',
          status: 'per pemakaian',
          tingkat: null,
          alasan:
            'Tidak bertingkat, karena bukan klaim siapa pun kecuali yang mengetiknya. Registri tidak memuat biaya usaha tani sama sekali, dan tidak memuat potensi hasil satu pun dari 11.227 varietas — jadi tidak ada angka acuan yang bisa disodorkan, dan menyodorkannya berarti mengarang. Aritmetikanya sendiri tercetak di layar supaya bisa dihitung ulang.',
        },
        { dari: 'harga', cakupan: 'harga eceran nasional, dipakai hanya sebagai pembanding rasio — bukan sebagai harga yang diterima petani' },
      ],
      takDijawab: ['hargaPetani', 'hasilVarietas', 'arusKasMusim'],
    });
  } catch (e) {
    el.komoditas.innerHTML = '<option value="">— harga tidak terambil —</option>';
  }
})();
