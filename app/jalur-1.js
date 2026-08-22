/* Jalur 1 — masuk dari gejala.
 *
 * Keputusan pestisida memang reaktif: masalah muncul, dan orang butuh jawaban
 * sekarang. Momen itu bukan masalah yang harus diatasi — ia titik masuk terbaik yang
 * akan pernah dimiliki platform ini, karena tidak menuntut persiapan apa pun.
 *
 * Empat keputusan rancangan yang menahan bentuknya:
 *   1. Masuk lewat APA YANG TERLIHAT, bukan nama hama. Yang panik tahu daunnya
 *      mengeriting ke atas; ia tidak tahu kata "trips".
 *   2. Mesin tidak menebak, ORANG yang memilih. Tidak ada pengenal foto — diagnosis
 *      salah yang percaya diri menghasilkan semprotan salah.
 *   3. Merek diruntuhkan jadi BAHAN AKTIF + KADAR. Kesetaraan hanya benar pada
 *      pasangan itu, bukan pada nama bahannya: satu entitas "Abamektin" dipakai pada
 *      33 kadar berbeda, 24 di antaranya dalam g/L.
 *   4. Informasi negatif didahulukan — apa yang dilarang, dan apa yang tidak akan
 *      menolong. Itu yang paling bernilai, dan paling kecil risiko hukumnya.
 *
 * Dosis TIDAK PERNAH ditempel ke bahan. Dari 26 produk berisi Abamektin 18 g/L yang
 * terdaftar untuk trips di cabai, dosisnya 0,375 · 0,5 · 0,75 · 1 · 1,5 · 1–2 · 2 ml/l
 * — dan satu memakai `1 l/ha`. Dosis milik pendaftaran tiap produk.
 */

import { ambil, muatMeta, teks, tautanMasuk, pasangKembali } from './pustaka.js';
import { catatBuka, catatJawab, JENIS as UKUR } from './ukur.js';
import { pasangBatas } from './batas.js';
import { pasangTombolTema } from './tema.js';

pasangTombolTema();

catatBuka(1);

const el = {
  gejala: document.getElementById('gejala'),
  hasil: document.getElementById('hasil'),
  batas: document.getElementById('batasJawaban'),
};

document.getElementById('tanpaJs')?.remove();

let daftarOpt = null;
let larangan = null;

const angkaId = (n) => Number(n).toLocaleString('id-ID');

// ---------------------------------------------------------------------------
// Layar 1 — daftar gejala
// ---------------------------------------------------------------------------
function gambarGejala() {
  // Diurutkan menurut banyaknya produk terdaftar, bukan abjad: yang paling sering jadi
  // masalah paling sering dicari. Yang nol produk tetap ikut — justru layar itu yang
  // paling bernilai di seluruh jalur ini.
  const urut = daftarOpt.slice().sort((a, b) =>
    b.di.reduce((x, y) => x + y.produk, 0) - a.di.reduce((x, y) => x + y.produk, 0));
  el.gejala.innerHTML = `
    <ul class="daftar">
      ${urut.map((k) => `
        <li>
          <button type="button" data-opt="${teks(k.id)}">
            <span class="nama">${teks(k.gejala)}</span>
            <span class="sub">${k.di.length
              ? `${angkaId(k.di.reduce((a, b) => a + b.produk, 0))} produk terdaftar di ${k.di.length} komoditas`
              : 'tidak ada produk terdaftar sama sekali'}</span>
          </button>
        </li>`).join('')}
    </ul>`;
}

// ---------------------------------------------------------------------------
// Blok "pastikan dulu" — sebelum apa pun yang bisa dibeli
// ---------------------------------------------------------------------------
function blokPastikan(k) {
  return `
    <div class="kartu pelepasan">
      <h2>Pastikan dulu</h2>
      <p>
        Dugaannya <strong>${teks(k.nama)}</strong>${k.ilmiah ? ` (<em>${teks(k.ilmiah)}</em>)` : ''}.
        Sebelum membeli apa pun, periksa dua hal ini sendiri:
      </p>
      <ol class="periksa">
        ${k.pembanding.map((p) => `
          <li>
            ${teks(p.cek)}
            ${p.membantah ? `<span class="sub">Kalau tidak cocok, kemungkinannya ${teks(p.membantah.label)}.</span>` : ''}
          </li>`).join('')}
      </ol>
      ${k.keterangan ? `<p class="catatan">${teks(k.keterangan)}</p>` : ''}
      ${k.catatan ? `<p class="catatan">${teks(k.catatan)}</p>` : ''}
    </div>`;
}

// ---------------------------------------------------------------------------
// Cabang nol produk — layar terpenting di jalur ini
// ---------------------------------------------------------------------------
// Nol produk untuk virus adalah KEBENARAN AGRONOMI, bukan lubang data: tidak ada
// pestisida yang menyembuhkan virus. Kios akan tetap menjual sesuatu — hampir pasti
// insektisida — dan uang keluar sementara tanaman tetap mati. Di sinilah halaman ini
// punya nilai yang tidak bisa ditandingi siapa pun yang hidup dari margin penjualan:
// kemampuan berkata "jangan beli apa-apa untuk ini".
function blokNolProduk(k) {
  const vektor = k.pembanding.map((p) => p.membantah).find((m) => m && /kutu kebul/i.test(m.label));
  return `
    <div class="kartu tabrakan">
      <h2>Jangan beli apa pun untuk ini</h2>
      <p>
        <strong>Tidak satu pun pestisida terdaftar menyembuhkan ${teks(k.nama.toLowerCase())}.</strong>
        Itu bukan kekurangan data — itu kenyataan: yang sudah terinfeksi tidak bisa
        disembuhkan dengan semprotan apa pun.
      </p>
      <p class="catatan">
        Kios kemungkinan besar tetap akan menjual sesuatu, hampir pasti insektisida.
        Uang keluar, tanaman tetap mati.
      </p>
    </div>
    <div class="kartu">
      <h2>Yang justru berpengaruh</h2>
      <ol class="periksa">
        <li>Cabut dan musnahkan tanaman yang sudah terinfeksi, jangan dibiarkan jadi sumber penularan.</li>
        <li>Kendalikan serangga penularnya pada tanaman yang <em>belum</em> terkena — itu yang masih bisa diselamatkan.</li>
        <li>Musim depan, pilih varietas tahan dan pasang perangkap sejak awal.</li>
      </ol>
      ${vektor ? `
        <p class="catatan">
          Penularnya <strong>${teks(vektor.label)}</strong>, dan untuk itu memang ada produk terdaftar.
        </p>
        <button type="button" class="kembali" data-opt="${teks(vektor.id)}">
          Lihat yang terdaftar untuk ${teks(vektor.label)} →
        </button>` : ''}
    </div>`;
}

// ---------------------------------------------------------------------------
// Pilih komoditas
// ---------------------------------------------------------------------------
function blokKomoditas(k) {
  const urut = k.di.slice().sort((a, b) => b.produk - a.produk);
  return `
    <div class="kartu">
      <h2>Di tanaman apa?</h2>
      <p class="catatan">
        Yang terdaftar berbeda-beda menurut tanamannya. Di luar daftar ini,
        <strong>tidak ada produk yang terdaftar</strong> untuk ${teks(k.nama.toLowerCase())}.
      </p>
      <ul class="daftar">
        ${urut.map((d) => `
          <li>
            <button type="button" data-berkas="${teks(d.berkas)}">
              <span class="nama">${teks(d.nama)}</span>
              <span class="sub">${angkaId(d.produk)} produk terdaftar</span>
            </button>
          </li>`).join('')}
      </ul>
    </div>`;
}

// ---------------------------------------------------------------------------
// Kartu bahan + kadar
// ---------------------------------------------------------------------------
function blokLaranganRingkas(grup, produkKena) {
  const kena = grup.filter((g) => g.larangan || g.laranganLain);
  if (!kena.length) return '';
  const berlaku = kena.filter((g) => g.larangan);
  const lain = kena.filter((g) => !g.larangan && g.laranganLain);
  // Didedup menurut ZAT, bukan menurut kartu: satu bahan muncul di beberapa kartu
  // kadar, dan larangannya melekat pada bahannya — mengulangnya sekali per kadar
  // membuat tabelnya berlipat tanpa menambah satu keterangan pun. Nama peraturannya
  // dipindah ke kaki, sama seperti di jalur 2: di layar HP kolom itu membungkus jadi
  // beberapa baris dan menenggelamkan lingkup larangan.
  const instrumen = new Set();
  const sudah = new Set();
  const baris = [];
  for (const g of lain) {
    if (sudah.has(g.zat)) continue;
    sudah.add(g.zat);
    for (const r of larangan[g.zat] ?? []) {
      if (r.instrumen) instrumen.add(r.instrumen);
      const lingkup = r.menyeluruh
        ? 'seluruh bidang penggunaan pestisida'
        : (r.komoditasNama.length ? r.komoditasNama.join(', ') : r.lingkup.join(', '));
      baris.push(`<tr><td>${teks(g.nama)}</td><td>${teks(lingkup)}</td><td>${teks((r.kutipan ?? '—').replace(/^Lampiran\s+/, ''))}</td></tr>`);
    }
  }
  return `
    <div class="kartu ${berlaku.length ? 'tabrakan' : 'peringatan'}">
      <h2>Bahan yang ada larangannya</h2>
      ${berlaku.length ? `
        <p>
          <strong>${berlaku.length} bahan di daftar bawah dilarang untuk tanaman ini.</strong>
          Produk yang memuatnya tidak boleh dipakai di sini.
        </p>` : ''}
      ${lain.length ? `
        <p>
          ${sudah.size} bahan di daftar bawah <strong>tercantum di daftar larangan, tetapi
          untuk hal lain</strong> — bukan untuk tanaman ini:
        </p>
        <div class="pembungkus-tabel">
          <table>
            <thead><tr><th>Bahan</th><th>Dilarang untuk</th><th>Pasal</th></tr></thead>
            <tbody>${baris.join('')}</tbody>
          </table>
        </div>
        <p class="catatan">Dasar: ${teks([...instrumen].join('; ')) || '—'}.</p>
        <p class="catatan">
          Ditampilkan apa adanya beserta lingkupnya. Menulis “dilarang” tanpa menyebut
          untuk apa adalah pernyataan yang tidak benar; menyembunyikannya lebih buruk lagi.
        </p>` : ''}
      ${produkKena ? `<p class="catatan">${angkaId(produkKena)} produk terdaftar memuat salah satunya.</p>` : ''}
    </div>`;
}

function kartuBahan(g, i) {
  const jumlah = Array.isArray(g.merek) ? g.merek.length : g.merek;
  return `
    <div class="kartu bahan">
      <button type="button" class="bahan-kepala" data-buka="${i}" aria-expanded="false">
        <span class="bahan-nama">${teks(g.nama)} ${teks(g.kadar)}</span>
        <span class="bahan-jumlah">${angkaId(jumlah)} merek</span>
        ${g.larangan ? '<span class="tanda-larangan">dilarang di sini</span>'
          : g.laranganLain ? '<span class="tanda-syarat">ada larangan lain</span>' : ''}
      </button>
      <div class="bahan-isi" id="bahan-${i}" hidden></div>
    </div>`;
}

function tabelMerek(merek) {
  return `
    <p class="catatan">
      Diurutkan menurut <strong>nomor pendaftaran menaik</strong> — tanpa peringkat,
      tanpa slot berbayar. Nomornya ada di kolom sebelah, jadi urutannya bisa diperiksa
      sendiri. <strong>Dosisnya berbeda-beda walau isinya sama</strong>, karena dosis
      milik pendaftaran tiap produk.
    </p>
    <div class="pembungkus-tabel">
      <table>
        <thead><tr><th>Merek</th><th>Nomor pendaftaran</th><th>Berlaku sampai</th><th>Dosis terdaftar</th></tr></thead>
        <tbody>${merek.map((m) => `
          <tr><td>${teks(m.nama)}</td><td class="angka">${teks(m.daftar ?? '—')}</td>
              <td class="angka">${teks(m.berlaku ?? '—')}</td>
              <td class="angka">${teks(m.dosis ?? '—')}</td></tr>`).join('')}</tbody>
      </table>
    </div>`;
}

// ---------------------------------------------------------------------------
let kartuKini = null;

async function bukaKomoditas(berkas, k) {
  el.hasil.querySelector('#daftarBahan')?.remove();
  const r = await ambil(berkas);
  const semuaGrup = [r.grup, ...(await Promise.all((r.kartuDi ?? []).map((x) => ambil(x))))].flat();
  kartuKini = { berkas, grup: semuaGrup };

  // Jumlahnya dibaca dari indeks, TIDAK dihitung ulang dari keanggotaan kartu: pada
  // OPT terpadat daftar mereknya dikeluarkan ke berkas terpisah, dan menghitung ulang
  // di sini menghasilkan nol.
  const bagian = document.createElement('div');
  bagian.id = 'daftarBahan';
  bagian.innerHTML = `
    <div class="kartu sorot">
      <p class="angka-besar">${angkaId(r.produk)}</p>
      <p class="angka-label">produk terdaftar untuk ${teks(r.optNama)} di ${teks(r.komoditasNama)}</p>
      <p class="catatan">
        Isinya hanya <strong>${angkaId(r.zat)} bahan aktif</strong> berbeda, yang jatuh jadi
        <strong>${angkaId(r.kartu)} kartu bahan + kadar</strong>. Menampilkan ratusan nama
        dagang adalah menyalin kebingungan kios ke dalam layar.
      </p>
    </div>
    ${blokLaranganRingkas(semuaGrup, r.berlarangan)}
    <h2 class="judul-bagian">Bahan aktif dan kadarnya</h2>
    <p class="catatan">
      Diurutkan menurut banyaknya produk. Kesetaraan hanya benar pada pasangan
      <strong>bahan + kadar</strong>: satu bahan bisa dipakai pada belasan kadar yang
      berbeda, dan kadarnya menentukan.
    </p>
    ${semuaGrup.slice(0, 12).map(kartuBahan).join('')}
    ${semuaGrup.length > 12 ? `<p class="catatan">Ditampilkan 12 kartu teratas dari ${angkaId(semuaGrup.length)}.</p>` : ''}`;
  el.hasil.appendChild(bagian);
  bagian.scrollIntoView({ block: 'start' });
}

async function bukaOpt(id) {
  const k = daftarOpt.find((x) => x.id === id);
  if (!k) return;
  el.hasil.innerHTML = '<p class="kosong">Menyiapkan…</p>';
  el.hasil.focus();
  try {
    if (!larangan) larangan = await ambil('larangan');
    el.hasil.innerHTML = blokPastikan(k) +
      (k.di.length ? blokKomoditas(k) : blokNolProduk(k)) +
      '<button type="button" class="kembali" id="kembali">← Pilih gejala lain</button>';
    catatJawab(1, k.di.length ? UKUR.isi : UKUR.nol);
    pasangKembali(el.hasil, { gulirKe: el.gejala });
    // Kalau hanya satu komoditas, langsung buka — satu ketukan lebih sedikit.
    if (k.di.length === 1) await bukaKomoditas(k.di[0].berkas, k);
  } catch (e) {
    catatJawab(1, UKUR.gagal);
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Gagal mengambil datanya</h2>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
}

el.gejala.addEventListener('click', (ev) => {
  const t = ev.target.closest('button[data-opt]');
  if (t) bukaOpt(t.dataset.opt);
});

el.hasil.addEventListener('click', async (ev) => {
  const opt = ev.target.closest('button[data-opt]');
  if (opt) return bukaOpt(opt.dataset.opt);

  const kom = ev.target.closest('button[data-berkas]');
  if (kom) return bukaKomoditas(kom.dataset.berkas);

  const buka = ev.target.closest('button[data-buka]');
  if (!buka) return;
  const i = Number(buka.dataset.buka);
  const isi = document.getElementById(`bahan-${i}`);
  if (!isi.hidden) { isi.hidden = true; buka.setAttribute('aria-expanded', 'false'); return; }
  const g = kartuKini.grup[i];
  isi.innerHTML = '<p class="kosong">Mengambil daftar mereknya…</p>';
  isi.hidden = false;
  buka.setAttribute('aria-expanded', 'true');
  // Daftar merek pada OPT terpadat dikeluarkan ke berkas sendiri; kartu yang lain
  // membawanya langsung. Penyaji cukup memeriksa satu medan.
  const merek = Array.isArray(g.merek) ? g.merek : (await ambil(g.merekDi))[g.kunci];
  isi.innerHTML = tabelMerek(merek);
});

(async function mulai() {
  try {
    daftarOpt = await ambil('gejala');
    const berpintu = daftarOpt.filter((k) => k.adaPintu);
    if (berpintu.length < daftarOpt.length) {
      el.gejala.innerHTML = `<p class="catatan">${daftarOpt.length - berpintu.length} OPT
        terkurasi belum punya teks gejala dan tidak bisa dimasuki dari sini.</p>`;
    }
    daftarOpt = berpintu;
    gambarGejala();
    // Dua sumber dengan tingkat bukti yang berbeda jauh, dan justru layar ini yang
    // paling perlu memisahkannya: sisi gejalanya belum ditinjau siapa pun, sisi bahan
    // aktifnya registri resmi. Meratakan keduanya jadi satu kalimat "sumber: Kementan"
    // meminjamkan wibawa registri kepada kurasi yang belum punya.
    await muatMeta();
    pasangBatas(el.batas, {
      sumber: [
        { dari: 'kurasiOpt', cakupan: `teks gejala dan dua ciri pembanding untuk ${berpintu.length} OPT cabai` },
        { dari: 'pestisida', cakupan: 'bahan aktif, kadar, dan merek yang terdaftar untuk OPT itu' },
      ],
      takDijawab: ['gejalaOpt', 'phi', 'namaDagang'],
    });

    // Datang dari beranda dengan satu gejala sudah terpilih. Daftarnya tetap
    // digambar lebih dulu: yang dibuka lewat pencarian teks belum tentu yang
    // dimaksud, dan tombol "pilih gejala lain" harus mendarat pada sesuatu.
    const { opt } = tautanMasuk();
    if (opt) await bukaOpt(opt);
  } catch (e) {
    el.gejala.innerHTML = `<div class="kartu peringatan"><h2>Indeks tidak ditemukan</h2>
      <p>Dibangun ulang dengan <code>node spec/tools/bangun-indeks.mjs --tulis</code>.</p>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
})();
