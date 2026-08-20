/* Jalur 4 — pintu benih & bibit.
 *
 * Pencariannya disaring ke varietas saja: yang datang ke halaman ini memegang bungkus
 * benih atau label bibit, dan mencampur 14.920 produk pestisida dan pupuk ke dalam
 * hasilnya cuma menambah kebisingan.
 *
 * Layar hasilnya sendiri ada di varietas.js, dipakai bersama jalur 2 — satu perender,
 * dua pintu, supaya keduanya tidak menyimpang diam-diam.
 */

import { ambil, muatMeta, cari, gambarHasil, teks } from './pustaka.js';
import { layarVarietas, layarTakDitemukan } from './varietas.js';
import { catatBuka, catatJawab, JENIS as UKUR } from './ukur.js';

catatBuka(4);

const el = {
  q: document.getElementById('q'),
  bantuan: document.getElementById('bantuan'),
  hasil: document.getElementById('hasil'),
  rincian: document.getElementById('rincian'),
  sumber: document.getElementById('sumber'),
};

document.getElementById('tanpaJs')?.remove();

const hanyaVarietas = (x) => x.j === 'varietas';

async function buka(id, pecahan) {
  el.rincian.innerHTML = '<p class="kosong">Mengambil rinciannya…</p>';
  el.rincian.focus();
  try {
    const v = (await ambil(pecahan)).find((x) => x.id === id);
    if (!v) throw new Error('tidak ada di pecahannya');
    el.rincian.innerHTML = await layarVarietas(v);
    catatJawab(4, UKUR.isi);
    el.rincian.querySelector('#kembali')?.addEventListener('click', () => {
      el.rincian.innerHTML = '';
      el.q.focus();
    });
  } catch (e) {
    catatJawab(4, UKUR.gagal);
    el.rincian.innerHTML = `<div class="kartu peringatan">
      <h2>Rinciannya gagal diambil</h2>
      <p>Sambungan terputus atau berkasnya tidak ada. Coba lagi — yang sudah terambil
      tetap tersimpan, jadi percobaan berikutnya lebih ringan.</p>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
}

// Kartu "nama yang mudah tertukar" dan "ejaan terdekat" juga berisi tombol varietas,
// jadi pendengarnya dipasang di kedua wadah.
for (const wadah of [el.hasil, el.rincian]) {
  wadah.addEventListener('click', (ev) => {
    const t = ev.target.closest('button[data-id]');
    if (t) buka(t.dataset.id, t.dataset.pecahan);
  });
}

let jeda;
el.q.addEventListener('input', () => {
  clearTimeout(jeda);
  jeda = setTimeout(jalankan, 180);
});

async function jalankan() {
  const kueri = el.q.value.trim();
  el.rincian.innerHTML = '';
  if (!kueri) { el.hasil.innerHTML = ''; el.bantuan.textContent = 'Ketik minimal dua huruf.'; return; }
  try {
    const { hasil, kurang } = await cari(kueri, hanyaVarietas);
    if (kurang) {
      el.hasil.innerHTML = '';
      el.bantuan.textContent = `Tambah ${kurang} huruf lagi.`;
      return;
    }
    el.bantuan.textContent = 'Ketik minimal dua huruf.';
    if (!hasil.length) {
      // Nol hasil di jalur ini bukan sekadar daftar kosong — ia layar tersendiri,
      // dan layar itulah yang paling bernilai di seluruh jalur 4.
      el.hasil.innerHTML = '';
      el.rincian.innerHTML = await layarTakDitemukan(kueri);
      catatJawab(4, UKUR.takSanggup);
      return;
    }
    gambarHasil(el.hasil, hasil, kueri, () => '');
  } catch (e) {
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Pencarian gagal</h2>
      <p>Berkas indeksnya tidak terambil. Periksa sambungan, lalu ketik ulang.</p>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
}

(async function mulai() {
  try {
    const m = await muatMeta();
    el.sumber.innerHTML =
      `Sumber: registri perizinan varietas Kementan lewat <code>spec/indeks/</code> — ` +
      `${m.jumlah.varietas.toLocaleString('id-ID')} varietas terdaftar. ` +
      `Nama varietas, komoditas, pemelihara, jenis surat, dan nomor SK diambil apa adanya.`;
    el.q.disabled = false;
  } catch (e) {
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Indeks tidak ditemukan</h2>
      <p>Halaman ini membaca <code>spec/indeks/</code>, yang dibangun ulang dengan
      <code>node spec/tools/bangun-indeks.mjs --tulis</code> dan sengaja tidak ikut
      disimpan di repositori.</p>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
})();
