/* Jalur 3 — hitungan hara.
 *
 * Bentuknya kalkulator, bukan layar insiden. Keputusan pupuk berkala, terikat
 * anggaran, dan diambil sebelum ada gejala apa pun — dan diagnosis hara berbasis
 * gejala akan salah dengan percaya diri, karena gejala kekurangan hara ambigu, muncul
 * terlambat, dan mudah tertukar dengan penyakit, kekeringan, atau masalah pH.
 *
 * Yang benar-benar ditanyakan orang di depan kios: "yang mana yang lebih murah untuk
 * hara yang saya butuhkan?" Itu pertanyaan aritmetika, dan aritmetikanya sudah lengkap
 * di data. Halaman ini berhenti di angka — "pakai NPK 16-16-16" saran agronomi, dan
 * itu ranah yang lain.
 */

import { ambil, muatMeta, cari, gambarHasil, teks, pasangKembali } from './pustaka.js';
import { catatBuka, catatJawab, catatLubang, LUBANG, JENIS as UKUR } from './ukur.js';
import { pasangBatas } from './batas.js';
import { pasangTombolTema } from './tema.js';

pasangTombolTema();

catatBuka(3);

const el = {
  q: document.getElementById('q'),
  bantuan: document.getElementById('bantuan'),
  hasil: document.getElementById('hasil'),
  rincian: document.getElementById('rincian'),
  batas: document.getElementById('batasJawaban'),
};

document.getElementById('tanpaJs')?.remove();

const rupiah = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const angka = (n, d = 1) => n.toLocaleString('id-ID', { maximumFractionDigits: d });

// HET pupuk bersubsidi — Perpres 6/2025 dan Permentan 15/2025. BUKAN dari registri
// produk: seluruh 7.196 pupuk terdaftar tidak satu pun menyebutkan status subsidi,
// jadi yang dicocokkan di sini bentuk komposisinya, bukan penanda pada produknya.
const HET = {
  urea: { rp: 2250, sebutan: 'Urea bersubsidi' },
  npk: { rp: 2300, sebutan: 'NPK bersubsidi' },
  organik: { rp: 800, sebutan: 'Pupuk organik bersubsidi' },
};

const punya = (p, re) => p.isi.find((c) => re.test(c.nama));

function skemaSubsidi(p, basis) {
  if (basis !== 'massa') return null; // HET bersubsidi seluruhnya per kilogram
  const N = punya(p, /Nitrogen/), P = punya(p, /Fosfor/), K = punya(p, /Kalium/);
  if (punya(p, /organik/i)) return HET.organik;
  if (N && P && K) return HET.npk;
  if (N && p.isi.length === 1) return HET.urea;
  return null;
}

// Satuan dinormalkan ke gram per satu satuan produk — kilogram untuk yang padat,
// liter untuk yang cair. Registri memakai empat satuan dan tidak satu pun produk
// mencampur basis massa dengan basis volume, jadi tiap produk punya satu basis yang
// jelas dan tidak ada konversi yang perlu ditebak.
const SATUAN = {
  'g/kg': { basis: 'massa', kali: 1 },
  'mg/kg': { basis: 'massa', kali: 0.001 },
  'g/L': { basis: 'volume', kali: 1 },
  'mg/L': { basis: 'volume', kali: 0.001 },
};

function hitungHara(p) {
  const basis = new Set(p.isi.map((c) => SATUAN[c.satuan]?.basis));
  if (basis.size !== 1 || basis.has(undefined)) return null;
  const b = [...basis][0];
  const rinci = p.isi.map((c) => ({ ...c, gram: c.nilai * (SATUAN[c.satuan].kali ?? 1) }));
  const total = rinci.reduce((a, c) => a + c.gram, 0);
  return { basis: b, satuan: b === 'massa' ? 'kg' : 'L', rinci, total };
}

// ---------------------------------------------------------------------------
let kini = null; // { p, h }

/* Rekaman yang sedang terbuka, dibaca blok sanggahan (B3) SAAT DIKETUK. Blok batas
 * digambar sekali saat halaman muat, sementara rekamannya dibuka jauh sesudahnya —
 * jadi yang diserahkan ke sana pembacanya, bukan nilainya. */
let terbukaKini = null;


function blokKadar(p, h) {
  return `
    <div class="kartu">
      <h2>Kadar hara menurut pendaftaran</h2>
      <div class="pembungkus-tabel">
        <table>
          <thead><tr><th>Hara</th><th>Kadar</th><th>Setara g/${h.satuan}</th></tr></thead>
          <tbody>${h.rinci.map((c) => `
            <tr><td>${teks(c.nama)}</td>
                <td class="angka">${angka(c.nilai, 2)} ${teks(c.satuan)}</td>
                <td class="angka">${angka(c.gram, 2)}</td></tr>`).join('')}
            <tr><td><strong>Hara total</strong></td><td></td>
                <td class="angka"><strong>${angka(h.total, 1)} g/${h.satuan}</strong> — ${angka(h.total / 10, 1)}%</td></tr>
          </tbody>
        </table>
      </div>
      <p class="catatan">
        Basisnya <strong>per ${h.basis === 'massa' ? 'kilogram' : 'liter'}</strong>,
        mengikuti cara registri menuliskannya. Kadar padat (g/kg) dan cair (g/L)
        <strong>tidak bisa dibandingkan langsung</strong> tanpa berat jenis, dan berat
        jenis tidak ada di registri.
      </p>
    </div>`;
}

function blokMasukan(h) {
  const preset = h.basis === 'massa' ? [50, 25, 5] : [20, 5, 1];
  return `
    <div class="kartu">
      <h2>Harga yang kamu bayar</h2>
      <div class="masukan">
        <label for="harga">Harga satu kemasan (Rp)</label>
        <input id="harga" type="number" inputmode="numeric" min="0" step="any" placeholder="misal: 180000">
      </div>
      <div class="masukan">
        <label for="isi">Isi kemasan (${h.satuan})</label>
        <input id="isi" type="number" inputmode="decimal" min="0" step="any" placeholder="misal: ${preset[0]}">
        <div class="preset">
          ${preset.map((n) => `<button type="button" data-isi="${n}">${n} ${h.satuan}</button>`).join('')}
        </div>
      </div>
      <p class="catatan">
        Ukuran kemasan <strong>tidak tercatat di registri</strong>, jadi harus dipilih
        sendiri. Harga juga bukan dari registri — ini angka yang kamu masukkan.
      </p>
    </div>`;
}

function blokHasil(p, h, harga, isi) {
  if (!(harga > 0) || !(isi > 0)) {
    return `<div class="kartu"><p class="kosong">Masukkan harga dan isi kemasan untuk melihat rupiah per kg hara.</p></div>`;
  }
  const perSatuan = harga / isi;
  const fraksi = h.total / 1000;
  const perKgHara = perSatuan / fraksi;
  const skema = skemaSubsidi(p, h.basis);

  return `
    <div class="kartu sorot">
      <p class="angka-besar">${rupiah(perKgHara)}</p>
      <p class="angka-label">per kilogram hara</p>
      <p class="catatan">
        Dihitung dari harga yang <strong>kamu</strong> masukkan, bukan dari registri.
      </p>
      <div class="pembungkus-tabel">
        <table>
          <tbody>
            <tr><td>Harga per ${h.satuan}</td>
                <td class="angka">${rupiah(harga)} ÷ ${angka(isi, 2)} ${h.satuan} = <strong>${rupiah(perSatuan)}</strong></td></tr>
            <tr><td>Fraksi hara</td>
                <td class="angka">${angka(h.total, 1)} g/${h.satuan} ÷ 1.000 = <strong>${angka(fraksi, 3)}</strong></td></tr>
            <tr><td>Rupiah per kg hara</td>
                <td class="angka">${rupiah(perSatuan)} ÷ ${angka(fraksi, 3)} = <strong>${rupiah(perKgHara)}</strong></td></tr>
          </tbody>
        </table>
      </div>
      <p class="catatan">
        Pembagiannya ditulis terbuka supaya bisa dibantah siapa pun yang tidak percaya.
      </p>
    </div>
    ${h.rinci.length > 1 ? `
      <div class="kartu">
        <h2>Nisbah haranya</h2>
        <div class="pembungkus-tabel">
          <table>
            <thead><tr><th>Hara</th><th>Bagian dari hara total</th></tr></thead>
            <tbody>${h.rinci.slice().sort((a, b) => b.gram - a.gram).map((c) => `
              <tr><td>${teks(c.nama)}</td><td class="angka">${angka((c.gram / h.total) * 100, 1)}%</td></tr>`).join('')}</tbody>
          </table>
        </div>
        <p class="catatan">
          Membaginya <strong>per hara sendiri-sendiri menyesatkan</strong>: nitrogennya
          tidak bisa dibeli terpisah dari yang lain. Karena itu angka besar di atas
          memakai hara <em>total</em>.
        </p>
      </div>` : `
      <div class="kartu">
        <h2>Hara tunggal</h2>
        <p class="catatan">
          Pupuk ini hanya membawa satu hara, jadi rupiah per kg hara di atas memang
          rupiah per kg ${teks(h.rinci[0].nama)}. Membandingkannya dengan pupuk majemuk
          <strong>hanya masuk akal kalau yang kamu butuhkan memang cuma hara ini</strong>.
        </p>
      </div>`}
    ${skema ? `
      <div class="kartu">
        <h2>Dibandingkan HET bersubsidi</h2>
        <p>
          Patokan ${teks(skema.sebutan)}: <strong>${rupiah(skema.rp)}/kg</strong>.
          Yang kamu bayar <strong>${angka(perSatuan / skema.rp, 2)}× lipat</strong> dari itu
          (${rupiah(perSatuan)}/kg).
        </p>
        <div class="bilah"><span style="width:${Math.min(100, (skema.rp / perSatuan) * 100).toFixed(1)}%"></span></div>
        <p class="catatan">
          <strong>HET bersubsidi bukan harga yang tersedia untuk semua orang.</strong>
          Syaratnya: maksimal 2 hektare, wajib terdaftar SIMLUHTAN dan masuk e-RDKK.
          Angka HET dari Perpres 6/2025 dan Permentan 15/2025 — <strong>bukan</strong>
          dari registri, yang tidak menandai status subsidi pada satu pun dari 7.196
          pupuknya. Kecocokan skema di atas ditebak dari bentuk komposisinya.
        </p>
      </div>` : ''}`;
}

async function blokSetara(p) {
  if (!p.setara) return '';
  const [pecahan, kunci] = p.setara.split(':');
  const kelompok = (await ambil(`setara/${pecahan}`))[kunci] ?? [];
  const lain = kelompok.filter((x) => x.i !== p.id);
  if (!lain.length) return '';
  return `
    <div class="kartu">
      <h2>Kadar haranya sama persis dengan ${lain.length} merek lain</h2>
      <p class="catatan">
        Kadar hara dan bentuk fisiknya identik. Harganya bisa berbeda jauh, dan itu
        justru yang membuat hitungan di atas ada gunanya — tetapi halaman ini tidak
        menyarankan yang mana; ia berhenti di angka.
      </p>
      <div class="pembungkus-tabel">
        <table>
          <thead><tr><th>Merek</th><th>Pemegang</th><th>Nomor pendaftaran</th></tr></thead>
          <tbody>${lain.slice().sort((a, b) => String(a.p).localeCompare(String(b.p))).slice(0, 25).map((x) => `
            <tr><td>${teks(x.n)}</td><td>${teks(x.k ?? '—')}</td><td class="angka">${teks(x.p ?? '—')}</td></tr>`).join('')}</tbody>
        </table>
      </div>
      ${lain.length > 25 ? `<p class="catatan">Ditampilkan 25 dari ${lain.length}, diurutkan menurut nomor pendaftaran menaik.</p>` : ''}
    </div>`;
}

// Cabang "tidak sanggup" — keadaan nyata, bukan kasus tepi, dan hari ini tidak ada
// layanan mana pun yang melayaninya. Sengaja TANPA angka: aturan L18 menolak
// menghitung hara dari batch yang belum diuji, dan kadar kompos berbeda tiap tumpukan.
// Memberinya rupiah per kg hara akan membuat seluruh perbandingan di atas bohong.
async function blokDiLuarJangkauan() {
  const resep = (await ambil('sediaan')).resep.filter((r) => r.jalur === 5);
  return `
    <div class="kartu">
      <h2>Kalau angkanya di luar jangkauan</h2>
      <p>
        Itu keadaan nyata, bukan kasus tepi. Cabangnya <strong>meramu sendiri</strong> —
        ${resep.length} resep yang berada di luar rezim pendaftaran lewat Pasal 72
        UU 22/2019, kriteria pelepasannya lengkap, dan tidak menunggu apa pun.
      </p>
      <ul class="daftar polos">
        ${resep.map((r) => `<li><span class="nama">${teks(r.nama)}</span><span class="sub">tingkat bukti ${teks(r.bukti)}</span></li>`).join('')}
      </ul>
      <p class="catatan">
        <strong>Sengaja tanpa angka.</strong> Kadar hara kompos berbeda tiap tumpukan,
        dan aturan <code>L18</code> menolak menghitung hara dari batch yang belum
        diuji — memberinya rupiah per kg hara akan membuat seluruh perbandingan di atas
        bohong. Yang bisa dihitung biaya bahan dan tenaganya, bukan harga per kg haranya.
      </p>
    </div>`;
}

// ---------------------------------------------------------------------------
function gambarUlang() {
  if (!kini) return;
  const { p, h } = kini;
  const harga = parseFloat(document.getElementById('harga')?.value);
  const isi = parseFloat(document.getElementById('isi')?.value);
  document.getElementById('keluaran').innerHTML = blokHasil(p, h, harga, isi);
}

async function buka(id, pecahan) {
  el.rincian.innerHTML = '<p class="kosong">Mengambil rinciannya…</p>';
  el.rincian.focus();
  try {
    const p = (await ambil(pecahan)).find((x) => x.id === id);
    if (!p) throw new Error('tidak ada di pecahannya');
    const h = hitungHara(p);

    if (!h) {
      el.rincian.innerHTML = `
        <div class="kartu peringatan">
          <h2>${teks(p.nama)}</h2>
          <p>Registri tidak mencatat kadar hara berangka untuk pupuk ini, jadi rupiah per
          kg hara tidak bisa dihitung. Dari 7.196 pupuk terdaftar, 2.066 dalam keadaan itu.</p>
        </div>
        <button type="button" class="kembali" id="kembali">← Kembali ke hasil pencarian</button>`;
    } else {
      kini = { p, h };
      terbukaKini = { id: p.id, nama: p.nama };
      el.rincian.innerHTML = `
        <div class="kartu">
          <h2>${teks(p.nama)}<span class="lencana">Pupuk</span></h2>
          <dl class="kunci">
            <dt>Pemegang pendaftaran</dt><dd>${teks(p.produsen ?? '—')}</dd>
            <dt>Nomor pendaftaran</dt><dd>${teks(p.daftar ?? '—')}</dd>
            <dt>Bentuk</dt><dd>${teks(p.bentuk ?? '—')}</dd>
          </dl>
        </div>
        ${blokKadar(p, h)}
        ${blokMasukan(h)}
        <div id="keluaran">${blokHasil(p, h, NaN, NaN)}</div>
        ${await blokSetara(p)}
        ${await blokDiLuarJangkauan()}
        <button type="button" class="kembali" id="kembali">← Kembali ke hasil pencarian</button>`;

      for (const n of ['harga', 'isi']) document.getElementById(n).addEventListener('input', gambarUlang);
      el.rincian.querySelectorAll('.preset button').forEach((b) => b.addEventListener('click', () => {
        document.getElementById('isi').value = b.dataset.isi;
        gambarUlang();
      }));
    }

    catatJawab(3, h ? UKUR.isi : UKUR.takSanggup);
    // B4: komposisinya kosong di registri, jadi rupiah per kg hara memang tidak ada.
    if (!h) catatLubang('3', LUBANG.haraSediaan);
    pasangKembali(el.rincian, { fokus: el.q, sesudah: () => { kini = null; } });
  } catch (e) {
    catatJawab(3, UKUR.gagal);
    el.rincian.innerHTML = `<div class="kartu peringatan">
      <h2>Rinciannya gagal diambil</h2>
      <p>Sambungan terputus atau berkasnya tidak ada. Coba lagi.</p>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
}

el.hasil.addEventListener('click', (ev) => {
  const t = ev.target.closest('button[data-id]');
  if (t) buka(t.dataset.id, t.dataset.pecahan);
});

let jeda;
el.q.addEventListener('input', () => {
  clearTimeout(jeda);
  jeda = setTimeout(jalankan, 180);
});

const kosongHtml = (kueri) => (catatLubang('3', LUBANG.namaDagang), `
  <p class="kosong">
    Tidak ada pupuk terdaftar yang namanya memuat <strong>${teks(kueri)}</strong>.
    Nama di karung sering berbeda dari nama terdaftarnya, dan pemetaannya belum ada.
  </p>`);

async function jalankan() {
  const kueri = el.q.value.trim();
  el.rincian.innerHTML = '';
  kini = null;
  if (!kueri) { el.hasil.innerHTML = ''; el.bantuan.textContent = 'Ketik minimal dua huruf.'; return; }
  try {
    const { hasil, kurang } = await cari(kueri, (x) => x.j === 'pupuk');
    if (kurang) {
      el.hasil.innerHTML = '';
      el.bantuan.textContent = `Tambah ${kurang} huruf lagi.`;
      return;
    }
    el.bantuan.textContent = 'Ketik minimal dua huruf.';
    gambarHasil(el.hasil, hasil, kueri, kosongHtml);
  } catch (e) {
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Pencarian gagal</h2>
      <p>Berkas indeksnya tidak terambil. Periksa sambungan, lalu ketik ulang.</p>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
}

(async function mulai() {
  try {
    await muatMeta();
    // Angka HET tidak tinggal di indeks, dan memang tidak boleh: ia datang dari
    // peraturan, bukan dari registri — yang tidak menandai status subsidi pada satu pun
    // dari 7.196 pupuknya. Menaruhnya di indeks berarti berpura-pura registri memuatnya.
    pasangBatas(el.batas, {
      sumber: [
        { dari: 'pupuk', cakupan: 'komposisi hara dan satuannya; harga tidak ada di dalamnya' },
        {
          label: 'HET pupuk bersubsidi — Perpres 6/2025 dan Permentan 15/2025',
          penerbit: 'Pemerintah Republik Indonesia',
          tarikan: '2026-08-20',
          status: 'disalin tangan ke layar ini',
          lisensi: 'Bebas hak cipta — UU 28/2014 Pasal 42',
          tingkat: 'B',
          alasan:
            'Bunyi peraturannya sendiri, dan peraturan tidak menjadi lebih benar dengan diuji. Yang belum dipastikan bukan angkanya melainkan salinannya: ketiga angka disalin tangan dan belum dicocokkan ke salinan resmi yang dihosting Kementan. Kecocokan skema subsidi pada tiap pupuk juga ditebak dari bentuk komposisinya, karena registri tidak menandai status subsidi sama sekali.',
        },
      ],
      takDijawab: ['harga', 'beratJenis', 'haraSediaan'],
      sanggah: () => terbukaKini,
    });
    el.q.disabled = false;
  } catch (e) {
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Indeks tidak ditemukan</h2>
      <p>Halaman ini membaca <code>spec/indeks/</code>, yang dibangun ulang dengan
      <code>node spec/tools/bangun-indeks.mjs --tulis</code>.</p>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
})();
