/* C2 — pemeriksaan keaslian lewat kandungan, bukan nomor pendaftaran.
 *
 * Premis versi pertama memakai nomor pendaftaran sebagai pintu. Jawaban lapangan
 * membatalkannya: "Tidak. Biasanya langsung lihat kemasan, cek kandungan." Registri
 * membenarkannya dari sisi yang sama sekali lain — 667 dari 7.196 pupuk (9,3%) tidak
 * punya nomor pendaftaran sama sekali, sementara 71,3% punya komposisi. Dua garis bukti
 * yang tidak berhubungan menunjuk arah yang sama.
 *
 * YANG DIPERIKSA, DAN YANG TIDAK. Kandungan yang cocok membuktikan LABELNYA sesuai
 * dengan yang terdaftar. Ia tidak membuktikan isi karungnya, dan justru di situ
 * bahayanya paling tajam: kasus pupuk palsu Rp3,3 triliun persis berupa karung yang
 * berbeda dari labelnya sendiri — NPK di bawah 1% padahal minimum 15%. Batas itu tercetak
 * di layar, bukan di catatan kaki.
 *
 * TIDAK ADA JALUR LAPOR, DAN ITU KEPUTUSAN. Ditanya apa yang terjadi hari ini ketika
 * seseorang mencurigai pupuk palsu, jawabannya "berhenti di pemeriksaan". Kotak masuk
 * yang tak seorang pun di ujungnya lebih buruk daripada tidak ada kotak masuk, jadi
 * pelaporan dicabut dari cakupan C2 — bukan tertunda, dicabut.
 */

import { ambil, bacaMeta, teks } from './pustaka.js';
import { catatLubang, LUBANG } from './ukur.js';

// Ketujuh belas hara registri. Tertutup dan pendek, jadi bisa jadi daftar pilihan —
// beda dari bahan aktif pestisida yang 1.706 dan menuntut pencarian sendiri.
const HARA = [
  [1, 'Nitrogen (N)'], [2, 'Fosfor (P2O5)'], [3, 'Kalium (K2O)'], [4, 'Kalsium (CaO)'],
  [5, 'Magnesium (MgO)'], [20, 'Karbon organik (C-organik)'], [11, 'Boron (B)'],
  [12, 'Tembaga (Cu)'], [13, 'Seng (Zn)'], [14, 'Mangan (Mn)'], [15, 'Molibdenum (Mo)'],
  [16, 'Besi (Fe)'], [17, 'Klor (Cl)'], [18, 'Silikat (SiO2)'], [19, 'Natrium (Na)'],
  [9, 'Kapur dolomit'], [10, 'Pakan udang protein 32%'],
];

/* Satuan yang boleh dimasukkan, beserta basis dan pengalinya.
 *
 * PERSEN HARUS MENYEBUT KEMASANNYA, dan itu bukan kerewelan. Karung NPK mencetak
 * "15-8-10", sedangkan registri menyimpan 150 g/kg — dan NOL dari 5.130 pupuk
 * berkomposisi memakai persen. Kalau "%" dibiarkan berdiri sendiri, justru bentuk yang
 * paling sering dibaca orang dari karung yang tidak akan pernah cocok. Jadi 1% = 10 g
 * per kilogram untuk kemasan padat, atau 10 g per liter untuk kemasan cair, dan yang
 * memilih kemasannya orang yang memegangnya — bukan tebakan mesin.
 *
 * Padat dan cair tetap tidak dijembatani: berat jenis tidak ada di registri, jadi 150
 * g/kg dan 150 g/L bukan hal yang sama dan tidak pernah dicocokkan silang.
 *
 * Basis ketiga di indeks — persen apa adanya, `p` — milik sisi pestisida, tempat
 * registri memang menyimpan 3.617 kadar dalam persen. Permukaan ini belum mencakupnya,
 * jadi pilihannya tidak ditawarkan di sini.
 */
const SATUAN = {
  '%kg': { basis: 'm', kali: 10, label: '% — kemasan kilogram' },
  '%L': { basis: 'v', kali: 10, label: '% — kemasan liter' },
  'g/kg': { basis: 'm', kali: 1, label: 'g/kg' },
  'mg/kg': { basis: 'm', kali: 0.001, label: 'mg/kg' },
  'g/L': { basis: 'v', kali: 1, label: 'g/L' },
  'mg/L': { basis: 'v', kali: 0.001, label: 'mg/L' },
};
const NAMA_BASIS = { m: 'per kilogram', v: 'per liter', p: 'persen' };

const angka = (x) => String(Math.round(x * 10000) / 10000);
const satuanBasis = (b) => (b === 'p' ? '%' : b === 'm' ? 'g/kg' : 'g/L');

/* Harus menghasilkan angka yang PERSIS sama dengan emberSidik() di bangun-indeks.mjs.
 * FNV-1a 32-bit dipilih justru karena itu: pendek, tanpa pustaka, dan hash kripto di
 * peramban asinkron serta menuntut konteks aman. */
function ember(sidik) {
  let h = 0x811c9dc5;
  for (let i = 0; i < sidik.length; i++) {
    h ^= sidik.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return (h & 0xff).toString(16).padStart(2, '0');
}

const el = {};
let baris = 0;

function tambahBaris(kode = null) {
  const n = ++baris;
  const div = document.createElement('div');
  div.className = 'baris-hara';
  div.innerHTML = `
    <label class="khusus-pembaca" for="hara${n}">Hara</label>
    <select id="hara${n}" class="k-hara">
      ${HARA.map(([k, nama]) => `<option value="${k}"${k === kode ? ' selected' : ''}>${teks(nama)}</option>`).join('')}
    </select>
    <label class="khusus-pembaca" for="nilai${n}">Kadar</label>
    <input id="nilai${n}" class="k-nilai" type="number" inputmode="decimal" min="0" step="any" placeholder="0">
    <label class="khusus-pembaca" for="satuan${n}">Satuan</label>
    <select id="satuan${n}" class="k-satuan">
      ${Object.entries(SATUAN).map(([k, v]) => `<option value="${teks(k)}">${teks(v.label)}</option>`).join('')}
    </select>
    <button type="button" class="k-buang" aria-label="Buang baris ini">×</button>`;
  div.querySelector('.k-buang').addEventListener('click', () => {
    if (el.baris.children.length > 1) div.remove();
  });
  el.baris.appendChild(div);
}

function bacaFormulir() {
  const bagian = [];
  for (const b of el.baris.children) {
    const kode = Number(b.querySelector('.k-hara').value);
    const nilai = parseFloat(b.querySelector('.k-nilai').value);
    const sat = SATUAN[b.querySelector('.k-satuan').value];
    if (!Number.isFinite(nilai) || nilai <= 0) continue;
    bagian.push({ kode, nilai: nilai * sat.kali, basis: sat.basis, sat: b.querySelector('.k-satuan').value, asli: nilai });
  }
  return bagian;
}

const namaHara = (kode) => HARA.find(([k]) => k === kode)?.[1] ?? `Hara ${kode}`;

function gambarKosong(bagian, basis) {
  // B4: kandungan yang tidak cocok dengan satu pun pendaftaran. Ini permintaan data
  // sekaligus sinyal lain — registri belum tentu lengkap, dan 28,7% pupuk tidak
  // berkomposisi sama sekali. Yang dicatat cacahnya, bukan komposisinya.
  catatLubang('2', LUBANG.kandunganTakTerdaftar);
  return `
    <div class="kartu peringatan">
      <h2>Tidak ada pupuk terdaftar dengan kandungan itu</h2>
      <p>
        Tidak satu pun dari ${bacaMeta()?.jumlah?.produkBerkandungan?.toLocaleString('id-ID') ?? ''}
        produk berkandungan di registri memuat kombinasi ini ${teks(NAMA_BASIS[basis] ?? '')}.
      </p>
      <p class="catatan">
        <strong>Itu bukan bukti palsu, dan bukan bukti asli.</strong> Tiga hal bisa
        menjelaskannya sekaligus: angkanya salah baca atau salah ketik; produknya
        terdaftar dengan kandungan yang sedikit berbeda dari yang tercetak; atau memang
        tidak terdaftar. Kandungan dicocokkan <strong>persis</strong> — 15% tidak sama
        dengan 15,5%.
      </p>
    </div>`;
}

function gambarCocok(daftar, bagian, basis) {
  const n = daftar.length;
  return `
    <div class="kartu">
      <h2>${n} produk terdaftar berkandungan sama</h2>
      <p>
        Kandungan yang kamu masukkan cocok dengan ${n} pendaftaran
        ${teks(NAMA_BASIS[basis] ?? '')}. Itu berarti <strong>angka di label ini memang
        ada di registri</strong>.
      </p>
      <div class="pembungkus-tabel">
        <table>
          <thead><tr><th>Nama terdaftar</th><th>Pemegang pendaftaran</th></tr></thead>
          <tbody>
            ${daftar.slice(0, 40).map((m) => `
              <tr>
                <td><button type="button" class="tautan" data-id="${teks(m.i)}" data-pecahan="${teks(m.p)}">${teks(m.n)}</button></td>
                <td>${teks(m.k ?? '—')}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${n > 40 ? `<p class="catatan">${n - 40} lainnya tidak ditampilkan.</p>` : ''}
    </div>`;
}

// Ambang mustahil: kadar tidak bisa melebihi bahannya sendiri. Ini satu-satunya bagian
// C2 yang tidak bergantung pada registri sama sekali — mesin bisa menangkapnya dari
// angka yang diketik, bahkan kalau registrinya basi. Registri sendiri memuat 27 produk
// yang melewatinya, dan `L27` di pemeriksa menandainya.
function blokMustahil(jumlah, basis) {
  const batas = basis === 'p' ? 100 : 1000;
  const satuan = satuanBasis(basis);
  if (jumlah <= batas) return '';
  return `
    <div class="kartu tabrakan">
      <h2>Angka ini mustahil secara fisik</h2>
      <p>
        Jumlah kadarnya <strong>${teks(angka(jumlah))} ${teks(satuan)}</strong>, padahal
        satu ${basis === 'p' ? 'bahan tidak bisa lebih dari 100% dirinya sendiri' :
        `kilogram bahan tidak bisa memuat lebih dari ${teks(String(batas))} ${teks(satuan)}`}.
      </p>
      <p class="catatan">
        Yang paling mungkin salah baca atau salah ketik — periksa lagi karungnya. Kalau
        angkanya memang tercetak begitu di kemasan, itu sendiri temuan: labelnya menyatakan
        sesuatu yang tidak bisa benar. Pemeriksaan di bawah tetap dijalankan.
      </p>
    </div>`;
}

async function periksa() {
  const bagian = bacaFormulir();
  if (!bagian.length) {
    el.hasil.innerHTML = '<p class="kosong">Isi dulu setidaknya satu kadar yang lebih besar dari nol.</p>';
    return;
  }
  const basis = [...new Set(bagian.map((b) => b.basis))];
  if (basis.length > 1) {
    el.hasil.innerHTML = `
      <div class="kartu peringatan">
        <h2>Satuannya tercampur</h2>
        <p>
          Ada baris ${teks(basis.map((b) => NAMA_BASIS[b]).join(' dan '))} sekaligus. Ketiganya
          tidak bisa dibandingkan tanpa berat jenis, dan berat jenis tidak ada di registri —
          jadi satu kemasan harus dibaca dalam satu satuan saja.
        </p>
      </div>`;
    el.hasil.focus();
    return;
  }

  // Baris ganda untuk hara yang sama dijumlahkan lebih dulu; kalau tidak, sidiknya tidak
  // akan pernah cocok dengan registri yang menyimpan satu baris per hara.
  const gabung = new Map();
  for (const b of bagian) gabung.set(b.kode, (gabung.get(b.kode) ?? 0) + b.nilai);
  const rapi = [...gabung.entries()].map(([kode, nilai]) => ({ kode, nilai, basis: basis[0] }));

  const sidik = rapi.map((c) => `${c.kode}@${angka(c.nilai)}`).sort().join('|') + `#${basis[0]}`;
  const jumlah = rapi.reduce((a, c) => a + c.nilai, 0);

  const ringkas = `
    <p class="bantuan">
      Diperiksa: ${rapi.map((c) => `${teks(namaHara(c.kode))} ${teks(angka(c.nilai))}`).join(' · ')}
      ${teks(satuanBasis(basis[0]))}.
    </p>`;

  el.hasil.innerHTML = ringkas + '<p class="kosong">Mencocokkan…</p>';
  try {
    const isi = await ambil(`kandungan/${ember(sidik)}`);
    const cocok = isi[sidik] ?? [];
    el.hasil.innerHTML =
      ringkas +
      blokMustahil(jumlah, basis[0]) +
      (cocok.length ? gambarCocok(cocok, rapi, basis[0]) : gambarKosong(rapi, basis[0]));
    el.hasil.focus();
  } catch (e) {
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Pemeriksaan gagal</h2>
      <p>Berkas indeksnya tidak terambil. Periksa sambungan lalu coba lagi.</p>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
}

/** @param {(id: string, pecahan: string) => void} buka  perender rincian milik jalur 2 */
export function pasangKandungan(buka) {
  el.baris = document.getElementById('barisKandungan');
  el.hasil = document.getElementById('hasilKandungan');
  if (!el.baris) return;

  // Tiga baris N, P2O5, K2O sudah terisi: itu bentuk yang paling sering dibaca dari
  // karung, dan formulir kosong menuntut orang menebak apa yang diharapkan darinya.
  for (const k of [1, 2, 3]) tambahBaris(k);

  document.getElementById('tambahHara').addEventListener('click', () => tambahBaris());
  document.getElementById('periksaKandungan').addEventListener('click', periksa);

  // Nama produk yang cocok tetap dibuka perender jalur 2 — satu layar rincian, satu
  // tempat, seperti varietas.js dipakai jalur 2 dan 4.
  el.hasil.addEventListener('click', (ev) => {
    const t = ev.target.closest('button[data-id]');
    if (t) buka(t.dataset.id, t.dataset.pecahan);
  });
}
