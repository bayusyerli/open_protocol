/* Jalur 2 — masuk dari kemasan.
 *
 * Tidak ada server dan tidak ada basis data: seluruh jawaban datang dari berkas
 * statis di spec/indeks/, yang bentuknya memang sudah disusun mengikuti pertanyaan
 * yang akan diajukan (lihat spec/tools/bangun-indeks.mjs).
 *
 * Anggaran tiap berkas 48 KB, jadi yang diambil hanya yang benar-benar dibutuhkan
 * layar berikutnya: kepala pencarian dulu, rincian menyusul saat satu produk dibuka,
 * daftar setara menyusul lagi.
 *
 * Kalau yang dibuka ternyata varietas, layarnya datang dari varietas.js — perender
 * yang sama dengan jalur 4, supaya keduanya tidak menyimpang diam-diam.
 */

import { ambil, muatMeta, cari, gambarHasil, teks, tanggal, JENIS, HTML_KEMBALI, tautanMasuk, pasangKembali } from './pustaka.js';
import { layarVarietas } from './varietas.js';
import { layarBahan, tabelMerek, merekKadar } from './bahan.js';
import { catatBuka, catatJawab, catatLubang, LUBANG, JENIS as UKUR } from './ukur.js';
import { pasangKandungan } from './kandungan.js';
import { pasangBatas } from './batas.js';
import { pasangTombolTema } from './tema.js';

pasangTombolTema();

catatBuka(2);

const el = {
  q: document.getElementById('q'),
  bantuan: document.getElementById('bantuan'),
  hasil: document.getElementById('hasil'),
  rincian: document.getElementById('rincian'),
  batas: document.getElementById('batasJawaban'),
};

document.getElementById('tanpaJs')?.remove();

let larangan = null;
let bahanKini = null;

// ---------------------------------------------------------------------------
// Blok-blok layar rincian
// ---------------------------------------------------------------------------
function blokLarangan(isi) {
  const kena = isi.filter((c) => c.larangan);
  if (!kena.length) return '';
  // Nama peraturannya diletakkan sekali sebagai catatan kaki, bukan diulang tiap
  // baris: di layar HP kolom itu membungkus jadi tujuh baris dan menenggelamkan
  // lingkup larangan, yang justru bagian terpentingnya.
  const instrumen = new Set();
  const baris = kena.flatMap((c) => (larangan[c.zat] ?? []).map((r) => {
    const lingkup = r.menyeluruh
      ? 'seluruh bidang penggunaan pestisida'
      : (r.komoditasNama.length ? r.komoditasNama.join(', ') : r.lingkup.join(', '));
    if (r.instrumen) instrumen.add(r.instrumen);
    return `<tr><td>${teks(c.nama)}</td><td>${teks(lingkup)}</td><td>${teks(r.kutipan ?? '—')}</td></tr>`;
  }));
  return `
    <div class="kartu tabrakan">
      <h2>Dua fakta yang sama-sama benar</h2>
      <p>
        Produk ini <strong>memegang pendaftaran</strong>, dan isinya
        <strong>memuat bahan yang tercantum di daftar larangan</strong>. Keduanya ada di
        data, dan lingkup larangannya menentukan:
      </p>
      <div class="pembungkus-tabel">
        <table>
          <thead><tr><th>Bahan</th><th>Dilarang untuk</th><th>Pasal</th></tr></thead>
          <tbody>${baris.join('')}</tbody>
        </table>
      </div>
      <p class="catatan">Dasar: ${teks([...instrumen].join('; ')) || '—'}.</p>
      <p class="catatan">
        Halaman ini <strong>berhenti di sini</strong>. Menyatakan produknya ilegal adalah
        kesimpulan hukum yang bukan wewenang platform ini; menyembunyikan larangannya
        lebih buruk lagi; dan menulis "dilarang" tanpa menyebut untuk apa adalah
        pernyataan yang tidak benar.
      </p>
    </div>`;
}

function blokIsi(p) {
  if (!p.isi.length) {
    return `<div class="kartu">
      <h2>Isi</h2>
      <p class="kosong">Registri tidak mencatat komposisi untuk produk ini, jadi isinya
      tidak bisa ditampilkan dan produk ini tidak muncul di daftar setara mana pun.</p>
    </div>`;
  }
  return `
    <div class="kartu">
      <h2>Isi</h2>
      <div class="pembungkus-tabel">
        <table>
          <thead><tr><th>Bahan</th><th>Kadar</th></tr></thead>
          <tbody>${p.isi.map((c) => `
            <tr>
              <td>${teks(c.nama)}${c.larangan ? '<span class="tanda-larangan">ada larangan</span>' : ''}</td>
              <td class="angka">${teks(c.nilai)} ${teks(c.satuan)}</td>
            </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
}

function blokGuna(p) {
  if (p.jenis !== 'pestisida') return '';
  if (!p.guna?.length) {
    return `<div class="kartu"><h2>Terdaftar untuk</h2>
      <p class="kosong">Registri tidak mencatat penggunaan berlabel untuk produk ini.</p></div>`;
  }
  return `
    <div class="kartu">
      <h2>Terdaftar untuk</h2>
      <div class="pembungkus-tabel">
        <table>
          <thead><tr><th>Tanaman</th><th>OPT</th><th>Dosis terdaftar</th></tr></thead>
          <tbody>${p.guna.map((u) => `
            <tr>
              <td>${teks(u.komoditasNama ?? '—')}</td>
              <td>${teks(u.optNama ?? '—')}</td>
              <td class="angka">${teks(u.dosis ?? '—')}</td>
            </tr>`).join('')}</tbody>
        </table>
      </div>
      <p class="catatan">
        Di luar daftar ini, produk tersebut <strong>tidak terdaftar</strong> untuk dipakai.
        Tenggang panen tidak ditampilkan karena <strong>registri tidak memuatnya sama
        sekali</strong> — nol dari 23.058 penggunaan berlabel.
      </p>
    </div>`;
}

async function blokSetara(p) {
  if (!p.setara) {
    return `<div class="kartu"><h2>Merek lain dengan isi yang sama</h2>
      <p class="kosong">Tidak ada produk lain yang komposisinya identik dengan ini.</p></div>`;
  }
  const [pecahan, kunci] = p.setara.split(':');
  const kelompok = (await ambil(`setara/${pecahan}`))[kunci] ?? [];
  const lain = kelompok.filter((x) => x.i !== p.id).sort((a, b) => String(a.p).localeCompare(String(b.p)));
  return `
    <div class="kartu">
      <h2>Merek lain dengan isi yang sama <span class="lencana">${lain.length}</span></h2>
      <p class="catatan">
        Bahan dan kadarnya identik${p.jenis === 'pupuk' ? ', dan bentuk fisiknya juga sama' : ''}.
        Cakupannya <strong>seluruh registri</strong> — bukan hanya yang terdaftar untuk
        tanaman yang sama. Diurutkan menurut nomor pendaftaran menaik.
      </p>
      <div class="pembungkus-tabel">
        <table>
          <thead><tr><th>Merek</th><th>Pemegang</th><th>Nomor pendaftaran</th></tr></thead>
          <tbody>${lain.map((x) => `
            <tr><td>${teks(x.n)}</td><td>${teks(x.k ?? '—')}</td><td class="angka">${teks(x.p ?? '—')}</td></tr>`).join('')}</tbody>
        </table>
      </div>
      <p class="catatan">
        <strong>Isi sama bukan berarti dosis sama</strong>, dan bukan berarti terdaftar
        untuk tanaman yang sama. Dosis milik pendaftaran tiap produk.
      </p>
    </div>`;
}

// ---------------------------------------------------------------------------
function selesai() {
  catatJawab(2, UKUR.isi);
  pasangKembali(el.rincian, { fokus: el.q });
}

async function buka(id, pecahan) {
  el.rincian.innerHTML = '<p class="kosong">Mengambil rincian…</p>';
  el.rincian.focus();
  try {
    // Bahan aktif masuk lewat pintu yang sama dengan merek. Yang mengetik "Abamektin"
    // tidak tahu — dan tidak perlu tahu — bahwa yang diketiknya bahan, bukan merek;
    // memaksanya memilih pintu lebih dulu berarti menyuruhnya menjawab pertanyaan
    // yang justru sedang ia bawa ke sini.
    if (pecahan.startsWith('bahan/')) {
      const b = (await ambil(pecahan))[id];
      if (!b) throw new Error('tidak ada di pecahannya');
      bahanKini = b;
      el.rincian.innerHTML = layarBahan(id, b);
      return selesai();
    }

    const p = (await ambil(pecahan)).find((x) => x.id === id);
    if (!p) throw new Error('tidak ada di pecahannya');

    if (p.jenis === 'varietas') {
      el.rincian.innerHTML = await layarVarietas(p);
    } else {
      // larangan.json 27,6 KB dan hanya dipakai kalau produknya memang memuat bahan
      // berlarangan. Mengambilnya untuk tiap produk berarti membayar berkas terbesar
      // kedua di seluruh perjalanan demi kartu yang pada sebagian besar produk tidak
      // pernah muncul.
      if (!larangan && p.isi?.some((c) => c.larangan)) larangan = await ambil('larangan');

      el.rincian.innerHTML = `
        <div class="kartu">
          <h2>${teks(p.nama)}<span class="lencana">${teks(JENIS[p.jenis] ?? p.jenis)}</span></h2>
          <dl class="kunci">
            <dt>Pemegang pendaftaran</dt><dd>${teks(p.produsen ?? '—')}</dd>
            <dt>Nomor pendaftaran</dt><dd>${teks(p.daftar ?? '—')}</dd>
            <dt>Berlaku sampai</dt><dd>${teks(tanggal(p.berlaku) ?? '—')}${p.status && p.status !== 'active' ? ` (${teks(p.status)})` : ''}</dd>
            <dt>Bentuk</dt><dd>${teks(p.bentuk ?? '—')}</dd>
          </dl>
          <p class="catatan">Cocokkan nomor pendaftaran itu dengan yang tertera di kemasan.</p>
        </div>
        ${blokLarangan(p.isi)}${blokIsi(p)}${blokGuna(p)}${await blokSetara(p)}${HTML_KEMBALI}`;
    }

    selesai();
  } catch (e) {
    catatJawab(2, UKUR.gagal);
    el.rincian.innerHTML = `<div class="kartu peringatan">
      <h2>Rinciannya gagal diambil</h2>
      <p>Sambungan terputus atau berkasnya tidak ada. Coba lagi — yang sudah terambil
      tetap tersimpan, jadi percobaan berikutnya lebih ringan.</p>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
}

for (const wadah of [el.hasil, el.rincian]) {
  wadah.addEventListener('click', async (ev) => {
    const t = ev.target.closest('button[data-id]');
    if (t) return buka(t.dataset.id, t.dataset.pecahan);

    // Daftar merek per kadar diambil saat kartunya dibuka, bukan saat layarnya
    // digambar: Sipermetrin punya 37 kadar, dan yang membukanya cuma butuh satu.
    const kad = ev.target.closest('button[data-buka]');
    if (!kad || !bahanKini) return;
    const i = Number(kad.dataset.buka);
    const isi = document.getElementById(`bahan-${i}`);
    if (!isi.hidden) {
      isi.hidden = true;
      kad.setAttribute('aria-expanded', 'false');
      return;
    }
    isi.innerHTML = '<p class="kosong">Mengambil daftar mereknya…</p>';
    isi.hidden = false;
    kad.setAttribute('aria-expanded', 'true');
    try {
      isi.innerHTML = tabelMerek(await merekKadar(bahanKini.kadar[i]));
    } catch (e) {
      isi.innerHTML = `<p class="kosong">Daftar mereknya gagal diambil. ${teks(e.message)}</p>`;
    }
  });
}

let jeda;
el.q.addEventListener('input', () => {
  clearTimeout(jeda);
  jeda = setTimeout(jalankan, 180);
});

const kosongHtml = (kueri) => (catatLubang('2', LUBANG.namaDagang), `
  <p class="kosong">
    Tidak ada nama terdaftar yang memuat <strong>${teks(kueri)}</strong>.
    Itu <em>bukan</em> berarti produknya tidak terdaftar — nama di kemasan sering
    berbeda dari nama terdaftarnya, dan pemetaannya belum ada.
  </p>`);

async function jalankan() {
  const kueri = el.q.value.trim();
  el.rincian.innerHTML = '';
  if (!kueri) { el.hasil.innerHTML = ''; el.bantuan.textContent = 'Ketik minimal dua huruf.'; return; }
  try {
    const { hasil, kurang } = await cari(kueri);
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
    pasangBatas(el.batas, {
      sumber: ['pestisida', 'pupuk', 'varietas'],
      takDijawab: ['namaDagang', 'isiKarung', 'phi'],
    });
    // C2 — pintu kedua ke layar yang sama: masuk dari angka di karung, bukan dari nama.
    pasangKandungan(buka);
    el.q.disabled = false;

    // Datang dari beranda: kuerinya dipulihkan supaya tombol kembali peramban tidak
    // mendarat di halaman kosong, dan entri yang diklik langsung dibuka.
    const masuk = tautanMasuk();
    if (masuk.q) { el.q.value = masuk.q; await jalankan(); }
    if (masuk.id && masuk.pecahan) await buka(masuk.id, masuk.pecahan);
  } catch (e) {
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Indeks tidak ditemukan</h2>
      <p>Halaman ini membaca <code>spec/indeks/</code>, yang dibangun ulang dengan
      <code>node spec/tools/bangun-indeks.mjs --tulis</code> dan sengaja tidak ikut
      disimpan di repositori.</p>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
})();
