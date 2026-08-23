/* D4 kalibrasi semprot + D5 takaran alat rumah tangga.
 *
 * Dua kapabilitas termurah yang paling langsung menyentuh keselamatan, dan keduanya
 * tidak menuntut satu baris data baru — hanya aritmetika dan bentuk layar yang benar.
 * Anjuran "2 ml per liter" tidak berguna bagi yang menakar dengan tutup botol, dan dosis
 * label yang benar jadi salah begitu kalibrasi tangki keliru.
 *
 * DITULIS UNTUK ORANG YANG TIDAK MEMILIH DOSISNYA. Ditanya siapa yang menakar di lahan,
 * jawabannya "keduanya" — petani dan buruh semprot. Yang kedua menerima dosis, tidak
 * memutuskannya. Jadi layar ini tidak pernah bertanya "mau pakai berapa"; ia bertanya
 * "berapa yang tertulis", lalu menghitung.
 *
 * SELURUH PEMBAGIAN DITULIS TERBUKA, aturan yang sama seperti jalur 3: yang tidak
 * percaya harus bisa membantahnya tanpa membuka kode.
 *
 * YANG SENGAJA TIDAK ADA. Tidak ada ukuran bawaan untuk tutup botol, sendok, atau gelas.
 * Tutup yang berbeda berselisih dua sampai empat kali lipat, jadi menyebut "satu tutup"
 * sebagai takaran berarti mengarang angka yang bisa melipatgandakan dosis — pada layar
 * yang justru dibangun untuk keselamatan. Kalau takarannya belum diukur, yang ditampilkan
 * sebaran akibatnya, bukan satu angka.
 */

import { muatMeta, bacaMeta, teks } from './pustaka.js';
import { pasangBatas } from './batas.js';
import { pasangTombolTema } from './tema.js';

pasangTombolTema();
document.getElementById('tanpaJs')?.remove();

const el = {};
const n = (x, d = 2) => Number(x).toLocaleString('id-ID', { maximumFractionDigits: d });
const angka = (id) => {
  const v = parseFloat(el[id]?.value);
  return Number.isFinite(v) && v > 0 ? v : null;
};

// Satuan dosis mengikuti apa yang benar-benar tercetak di registri, bukan daftar yang
// rapi menurut SI. `gr` dan `cc` ikut karena label memang menuliskannya begitu.
const SATUAN = {
  perLiter: [['ml', 'ml per liter air'], ['g', 'g per liter air']],
  perHektare: [['l', 'liter per hektare'], ['ml', 'ml per hektare'], ['kg', 'kg per hektare'], ['g', 'g per hektare']],
};
// Ke mililiter atau gram — dua besaran yang TIDAK disatukan: berat jenis tidak ada di
// registri, jadi ml dan g tidak pernah saling dikonversi. Yang disamakan hanya kelipatan
// di dalam masing-masing.
const KE_DASAR = { ml: [1, 'ml'], l: [1000, 'ml'], g: [1, 'g'], kg: [1000, 'g'] };

// ---------------------------------------------------------------------------
// 1 · Kalibrasi
// ---------------------------------------------------------------------------
function hitungKalibrasi() {
  const air = angka('airTerpakai');
  const luas = angka('luasSemprot');
  const tangki = angka('volTangki');
  if (!air || !luas) {
    el.hasilKalibrasi.innerHTML = '<p class="kosong">Isi air terpakai dan luas tersemprot.</p>';
    return null;
  }
  const perHa = (air / luas) * 10000;
  const luasTangki = tangki ? (tangki / air) * luas : null;

  el.hasilKalibrasi.innerHTML = `
    <div class="hasil-besar">
      <strong>${teks(n(perHa, 0))} liter</strong>
      <span>larutan per hektare</span>
    </div>
    <div class="pembungkus-tabel">
      <table>
        <tbody>
          <tr><th>Volume semprot</th><td class="angka">${teks(n(air))} L ÷ ${teks(n(luas, 0))} m² × 10.000 = ${teks(n(perHa, 0))} L/ha</td></tr>
          ${luasTangki ? `<tr><th>Satu tangki menjangkau</th><td class="angka">${teks(n(tangki))} L ÷ ${teks(n(air))} L × ${teks(n(luas, 0))} m² = ${teks(n(luasTangki, 0))} m²</td></tr>` : ''}
        </tbody>
      </table>
    </div>
    ${luasTangki ? '' : '<p class="catatan">Isi volume tangki juga, supaya luas jangkauan satu tangki ikut terhitung.</p>'}`;
  return { perHa, luasTangki, tangki };
}

// ---------------------------------------------------------------------------
// 2 · Berapa yang masuk ke tangki
// ---------------------------------------------------------------------------
function isiSatuan() {
  const bentuk = el.bentukDosis.value;
  el.satuanDosis.innerHTML = SATUAN[bentuk]
    .map(([k, label]) => `<option value="${teks(k)}">${teks(label)}</option>`).join('');
  el.bungkusLuasPetak.hidden = false;
}

function hitungDosis(kal) {
  const nilai = angka('nilaiDosis');
  const bentuk = el.bentukDosis.value;
  const [kali, dasar] = KE_DASAR[el.satuanDosis.value] ?? [1, 'ml'];
  const luasPetak = angka('luasPetak');

  if (!nilai) {
    el.hasilDosis.innerHTML = '<p class="kosong">Isi angka dosis dari labelmu.</p>';
    return;
  }

  let perTangki = null;
  let uraian = '';
  // Dihitung terpisah dari `perTangki × jumlahTangki`: jumlah tangki ditampilkan
  // dibulatkan, dan mengalikan angka yang sudah dibulatkan menghasilkan baris yang
  // TIDAK bisa direproduksi pembaca — 45 × 6,7 = 301,5, bukan 300. Pada layar yang
  // menjanjikan pembagiannya bisa dibantah, itu cacat yang membatalkan janjinya.
  let totalPetak = null;
  let uraianTotal = '';

  if (bentuk === 'perLiter') {
    if (!kal?.tangki) {
      el.hasilDosis.innerHTML = '<p class="kosong">Isi volume tangki di bagian 1 dulu.</p>';
      return;
    }
    perTangki = nilai * kali * kal.tangki;
    uraian = `${teks(n(nilai))} ${teks(el.satuanDosis.value)}/L × ${teks(n(kal.tangki))} L = ${teks(n(perTangki))} ${teks(dasar)}`;
    if (luasPetak && kal.perHa) {
      const larutanPetak = kal.perHa * (luasPetak / 10000);
      totalPetak = nilai * kali * larutanPetak;
      uraianTotal = `${teks(n(nilai))} ${teks(el.satuanDosis.value)}/L × ${teks(n(larutanPetak, 1))} L larutan = ${teks(n(totalPetak))} ${teks(dasar)}`;
    }
  } else {
    if (!kal?.luasTangki) {
      el.hasilDosis.innerHTML = `
        <div class="kartu peringatan">
          <h2>Dosis per hektare belum bisa dihitung</h2>
          <p>
            Berapa yang masuk ke satu tangki bergantung pada luas yang dijangkau tangki
            itu — dan itu berbeda di tiap penyemprot. Selesaikan kalibrasi di bagian 1
            dulu; tanpa itu angkanya memang tidak ada, bukan sekadar belum ditampilkan.
          </p>
        </div>`;
      return;
    }
    perTangki = nilai * kali * (kal.luasTangki / 10000);
    uraian = `${teks(n(nilai))} ${teks(el.satuanDosis.value)}/ha ÷ 10.000 m² × ${teks(n(kal.luasTangki, 0))} m² = ${teks(n(perTangki))} ${teks(dasar)}`;
    if (luasPetak) {
      totalPetak = nilai * kali * (luasPetak / 10000);
      uraianTotal = `${teks(n(nilai))} ${teks(el.satuanDosis.value)}/ha ÷ 10.000 m² × ${teks(n(luasPetak, 0))} m² = ${teks(n(totalPetak))} ${teks(dasar)}`;
    }
  }

  const jumlahTangki = luasPetak && kal?.luasTangki ? luasPetak / kal.luasTangki : null;

  el.hasilDosis.innerHTML = `
    <div class="hasil-besar">
      <strong>${teks(n(perTangki))} ${teks(dasar)}</strong>
      <span>produk per satu tangki penuh</span>
    </div>
    <div class="pembungkus-tabel">
      <table>
        <tbody>
          <tr><th>Per tangki</th><td class="angka">${uraian}</td></tr>
          ${jumlahTangki ? `<tr><th>Tangki untuk petak</th><td class="angka">${teks(n(luasPetak, 0))} m² ÷ ${teks(n(kal.luasTangki, 0))} m² = ${teks(n(jumlahTangki, 1))} tangki</td></tr>` : ''}
          ${totalPetak ? `<tr><th>Produk untuk petak</th><td class="angka">${uraianTotal}</td></tr>` : ''}
        </tbody>
      </table>
    </div>
    <p class="catatan">
      Pembagiannya ditulis terbuka supaya bisa dibantah. Angka dosisnya milik labelmu —
      halaman ini tidak memilihkannya, dan tidak memeriksa apakah dosis itu cocok untuk
      tanamanmu.
      ${jumlahTangki && jumlahTangki % 1 > 0.05 ? '<strong>Tangki terakhir tidak penuh</strong> — campur seperlunya saja, karena sisa larutan tidak bisa disimpan aman.' : ''}
    </p>`;

  // Menyambung ke bagian 3 hanya kalau satuannya volume; gram tidak bisa ditakar
  // dengan tutup botol tanpa berat jenis, dan menyodorkannya begitu saja akan
  // menyarankan pengukuran yang salah.
  if (dasar === 'ml' && !el.perluMl.value) {
    el.perluMl.value = Math.round(perTangki * 100) / 100;
    hitungTakar();
  }
}

// ---------------------------------------------------------------------------
// 3 · Menakar tanpa gelas ukur
// ---------------------------------------------------------------------------
// Sebaran ini BUKAN daftar ukuran tutup botol yang berlaku. Ia contoh yang sengaja
// dipilih berjauhan, untuk memperlihatkan berapa besar jawabannya bergeser kalau
// takarannya ditebak — dan itulah isi jawabannya, bukan angkanya sendiri.
const CONTOH_ML = [5, 10, 15, 20, 30];

function hitungTakar() {
  const perlu = angka('perluMl');
  const isi = angka('isiTakaran');
  if (!perlu) {
    el.hasilTakar.innerHTML = '<p class="kosong">Isi berapa mililiter yang perlu ditakar.</p>';
    return;
  }
  if (isi) {
    const kali = perlu / isi;
    el.hasilTakar.innerHTML = `
      <div class="hasil-besar">
        <strong>${teks(n(kali, 1))}×</strong>
        <span>takaranmu, untuk ${teks(n(perlu))} ml</span>
      </div>
      <div class="pembungkus-tabel">
        <table><tbody>
          <tr><th>Hitungannya</th><td class="angka">${teks(n(perlu))} ml ÷ ${teks(n(isi))} ml = ${teks(n(kali, 2))}</td></tr>
        </tbody></table>
      </div>
      ${kali < 1 ? `<p class="catatan"><strong>Kurang dari satu takaran penuh.</strong> Menakar sebagian isi tutup dengan mata adalah tebakan; kalau bisa, campur untuk beberapa tangki sekaligus supaya angkanya jadi takaran utuh, atau pakai alat yang lebih kecil.</p>` : ''}`;
    return;
  }
  el.hasilTakar.innerHTML = `
    <div class="kartu peringatan">
      <h2>Takaranmu belum diukur, jadi belum ada satu angka</h2>
      <p>
        Untuk <strong>${teks(n(perlu))} ml</strong>, jawabannya bergeser sejauh ini
        tergantung isi takaranmu:
      </p>
      <div class="pembungkus-tabel">
        <table>
          <thead><tr><th>Kalau takaranmu…</th><th>maka perlu</th></tr></thead>
          <tbody>
            ${CONTOH_ML.map((m) => `<tr><td class="angka">${m} ml</td><td class="angka">${teks(n(perlu / m, 1))}× takaran</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <p class="catatan">
        Baris paling atas dan paling bawah berselisih <strong>${teks(n(CONTOH_ML[CONTOH_ML.length - 1] / CONTOH_ML[0], 0))} kali lipat</strong>.
        Itu sebabnya layar ini tidak menyebut satu angka sebelum takaranmu diukur —
        dan mengukurnya cuma sekali seumur alat.
      </p>
    </div>`;
}

// ---------------------------------------------------------------------------
// Mulai
// ---------------------------------------------------------------------------
for (const id of ['airTerpakai', 'luasSemprot', 'volTangki', 'nilaiDosis', 'satuanDosis',
  'bentukDosis', 'luasPetak', 'perluMl', 'isiTakaran', 'hasilKalibrasi', 'hasilDosis',
  'hasilTakar', 'bungkusLuasPetak', 'sebaranDosis', 'batas']) {
  el[id] = document.getElementById(id === 'batas' ? 'batasJawaban' : id);
}

isiSatuan();

const perbarui = () => { hitungDosis(hitungKalibrasi()); };
for (const id of ['airTerpakai', 'luasSemprot', 'volTangki', 'nilaiDosis', 'luasPetak']) {
  el[id].addEventListener('input', perbarui);
}
for (const id of ['satuanDosis']) el[id].addEventListener('change', perbarui);
el.bentukDosis.addEventListener('change', () => { isiSatuan(); perbarui(); });
for (const id of ['perluMl', 'isiTakaran']) el[id].addEventListener('input', hitungTakar);

hitungKalibrasi();
hitungTakar();

(async function mulai() {
  try {
    const m = await muatMeta();
    const j = m.jumlah;
    const total = j.dosisPerHektare + j.dosisPerLiter + j.dosisKosong + j.dosisLain;
    const pct = (x) => (x / total * 100).toLocaleString('id-ID', { maximumFractionDigits: 1 });
    el.sebaranDosis.innerHTML =
      `Dari ${teks(n(total, 0))} penggunaan berlabel di registri pestisida: ` +
      `<strong>${teks(pct(j.dosisPerHektare))}%</strong> per hektare, ` +
      `<strong>${teks(pct(j.dosisPerLiter))}%</strong> per liter air, dan ` +
      `<strong>${teks(pct(j.dosisKosong))}%</strong> tidak memuat dosis sama sekali — ` +
      `medannya kosong di registri, jadi untuk penggunaan itu dosis hanya bisa dibaca dari kemasannya.`;

    pasangBatas(el.batas, {
      sumber: [
        {
          label: 'Aritmetika di peranti ini',
          penerbit: 'Open Protocols',
          tarikan: '2026-08-23',
          status: 'berlaku',
          tingkat: 'A',
          alasan:
            'Bukan klaim agronomi, melainkan pembagian. Tingkat A dipakai justru karena yang dinyatakan cuma aritmetika: hasilnya bisa diperiksa ulang siapa pun dengan kalkulator, dan tiap pembaginya tercetak di layar. Yang TIDAK dinaungi tingkat ini angka yang masuk — dosis dari label, luas percobaan, dan isi takaran semuanya masukan pengguna, dan aritmetika yang jujur atas angka yang salah tetap menghasilkan angka yang salah.',
        },
        { dari: 'pestisida', cakupan: 'hanya sebaran bentuk dosis pada label — tidak satu pun angka dosis diambil dari sini' },
      ],
      takDijawab: ['dosisKosong', 'takaranRumahTangga', 'phi'],
    });
  } catch (e) {
    el.sebaranDosis.textContent = 'Sebaran bentuk dosis tidak terambil; hitungan di bawah tetap jalan.';
  }
})();
