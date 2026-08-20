/* Jalur 2 — masuk dari kemasan.
 *
 * Tidak ada server dan tidak ada basis data: seluruh jawaban datang dari berkas
 * statis di spec/indeks/, yang bentuknya memang sudah disusun mengikuti pertanyaan
 * yang akan diajukan (lihat spec/tools/bangun-indeks.mjs).
 *
 * Anggaran tiap berkas 48 KB, jadi yang diambil hanya yang benar-benar dibutuhkan
 * layar berikutnya: kepala pencarian dulu, rincian menyusul saat satu produk dibuka,
 * daftar setara menyusul lagi. Tiap berkas yang sudah terambil disimpan di memori —
 * di sinyal buruk, perjalanan kedua ke berkas yang sama adalah pemborosan yang
 * paling terasa.
 */

const BASIS = '../spec/indeks';

const el = {
  q: document.getElementById('q'),
  bantuan: document.getElementById('bantuan'),
  hasil: document.getElementById('hasil'),
  rincian: document.getElementById('rincian'),
  sumber: document.getElementById('sumber'),
  tanpaJs: document.getElementById('tanpaJs'),
};

el.tanpaJs?.remove();

// ---------------------------------------------------------------------------
// Pengambilan berkas, dengan ingatan
// ---------------------------------------------------------------------------
const ingatan = new Map();

async function ambil(jalan) {
  if (ingatan.has(jalan)) return ingatan.get(jalan);
  const janji = fetch(`${BASIS}/${jalan}.json`).then((r) => {
    if (!r.ok) throw new Error(`${jalan}: ${r.status}`);
    return r.json();
  });
  ingatan.set(jalan, janji);
  // Kegagalan tidak boleh ikut teringat: sinyal yang putus sebentar akan membuat
  // berkas itu gagal selamanya sampai halaman dimuat ulang.
  janji.catch(() => ingatan.delete(jalan));
  return janji;
}

const rapikan = (s) => (s ?? '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g, '');
const teks = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let meta = null;
let larangan = null;

// ---------------------------------------------------------------------------
// Ember pencarian
// ---------------------------------------------------------------------------
// Kepala pencarian dipecah menurut dua huruf pertama, dan awalan yang terlalu padat
// didalamkan jadi tiga. Yang didalamkan dicatat di meta, jadi penyaji tahu harus
// meminta tiga huruf tanpa perlu satu perjalanan gagal lebih dulu.
function emberUntuk(kueri) {
  const r = rapikan(kueri);
  if (r.length < 2) return { kurang: 2 - r.length };

  let panjang = 2;
  while (r.length >= panjang && meta.pecahan.cariDalam.includes(r.slice(0, panjang))) panjang++;

  if (r.length >= panjang) {
    const e = r.slice(0, panjang);
    return { ember: meta.pecahan.cari.includes(e) ? [e] : [] };
  }

  // Kueri lebih pendek dari ember yang dibutuhkan — ambil seluruh ember yang
  // berawalan sama. Daftar embernya sudah ada di meta, jadi tidak ada tebakan.
  const cocok = meta.pecahan.cari.filter((e) => e.startsWith(r));
  return cocok.length > 4 ? { kurang: 1 } : { ember: cocok };
}

async function cari(kueri) {
  const r = rapikan(kueri);
  const { ember, kurang } = emberUntuk(kueri);
  if (kurang) return { kurang };
  const isi = await Promise.all(ember.map((e) => ambil(`cari/${e}`)));
  const semua = isi.flat().filter((x) => rapikan(x.n).includes(r));
  // Yang diawali kueri didahulukan; sisanya tetap ditampilkan karena nama di kemasan
  // kerap cuma sepotong dari nama terdaftarnya.
  semua.sort((a, b) => {
    const pa = rapikan(a.n).startsWith(r), pb = rapikan(b.n).startsWith(r);
    return pb - pa || a.n.localeCompare(b.n);
  });
  return { hasil: semua };
}

// ---------------------------------------------------------------------------
// Layar 1 — daftar hasil
// ---------------------------------------------------------------------------
const JENIS = { pestisida: 'Pestisida', pupuk: 'Pupuk', varietas: 'Varietas' };

function gambarHasil(daftar, kueri) {
  if (!daftar.length) {
    el.hasil.innerHTML = `
      <p class="kosong">
        Tidak ada nama terdaftar yang memuat <strong>${teks(kueri)}</strong>.
        Itu <em>bukan</em> berarti produknya tidak terdaftar — nama di kemasan sering
        berbeda dari nama terdaftarnya, dan pemetaannya belum ada.
      </p>`;
    return;
  }
  const tampil = daftar.slice(0, 40);
  el.hasil.innerHTML = `
    <p class="bantuan">${daftar.length} hasil${daftar.length > tampil.length ? `, ditampilkan ${tampil.length} teratas` : ''}.</p>
    <ul class="daftar">
      ${tampil.map((x) => `
        <li>
          <button type="button" data-id="${teks(x.i)}" data-pecahan="${teks(x.p)}">
            <span class="nama">${teks(x.n)}<span class="lencana">${teks(JENIS[x.j] ?? x.j)}</span></span>
            <span class="sub">${teks(x.k ?? '—')}</span>
          </button>
        </li>`).join('')}
    </ul>`;
}

// ---------------------------------------------------------------------------
// Layar 2 — rincian
// ---------------------------------------------------------------------------
const tanggal = (s) => {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(+d) ? s : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

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
        Tenggang panen tidak ditampilkan karena registri hanya mencatatnya pada 290 dari
        23.058 penggunaan berlabel — terlalu jarang untuk dijanjikan.
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

// Varietas tidak punya komposisi, tidak punya penggunaan berlabel, dan tidak punya
// "setara" sama sekali — dua varietas berbeda tidak pernah identik. Yang bisa
// dipastikan hanya surat yang dipegangnya, dan itu memang seluruh isi jalur ini
// untuk benih dan bibit. Bentuk pertanyaannya sama, isinya yang berbeda.
function layarVarietas(v) {
  const surat = (v.surat ?? []).map((x) => `
    <tr>
      <td>${teks(x.sebutan ?? x.jenis ?? '—')}</td>
      <td class="angka">${teks(x.sk ?? '—')}</td>
      <td class="angka">${teks(tanggal(x.tanggal) ?? '—')}</td>
    </tr>`).join('');
  return `
    <div class="kartu">
      <h2>${teks(v.nama)}<span class="lencana">Varietas</span></h2>
      <dl class="kunci">
        <dt>Jenis tanaman</dt><dd>${teks(v.komoditasNama ?? '—')}</dd>
        <dt>Asal</dt><dd>${teks(v.asal ?? '—')}</dd>
        <dt>Tipe</dt><dd>${teks(v.tipe ?? '—')}</dd>
        <dt>Pemelihara</dt><dd>${teks(v.pemelihara ?? '—')}</dd>
      </dl>
    </div>
    <div class="kartu">
      <h2>Surat yang dipegang <span class="lencana">${(v.surat ?? []).length}</span></h2>
      ${surat ? `<div class="pembungkus-tabel"><table>
        <thead><tr><th>Sebutan</th><th>Nomor SK</th><th>Tanggal</th></tr></thead>
        <tbody>${surat}</tbody></table></div>`
      : '<p class="kosong">Registri tidak mencatat surat untuk varietas ini.</p>'}
      <p class="catatan">
        Surat ini memastikan <strong>varietasnya</strong>, bukan bungkus atau bibit yang
        ada di tangan. Sertifikasi lot benih tidak ada di registri ini, jadi halaman ini
        tidak bisa mengatakan apa pun tentang mutu benih yang dibeli.
      </p>
    </div>
    <div class="kartu">
      <h2>Tidak ada "setara" untuk varietas</h2>
      <p class="catatan">
        Dua varietas yang berbeda tidak pernah identik, jadi pertanyaan "merek lain yang
        isinya sama" tidak berlaku di sini — berbeda dari pestisida dan pupuk.
      </p>
    </div>`;
}

async function bukaProduk(id, pecahan) {
  el.rincian.innerHTML = '<p class="kosong">Mengambil rincian…</p>';
  el.rincian.focus();
  try {
    const p = (await ambil(pecahan)).find((x) => x.id === id);
    if (!p) throw new Error('tidak ada di pecahannya');

    if (p.jenis === 'varietas') {
      el.rincian.innerHTML = layarVarietas(p) +
        '<button type="button" class="kembali" id="kembali">← Kembali ke hasil pencarian</button>';
      document.getElementById('kembali').addEventListener('click', () => { el.rincian.innerHTML = ''; el.q.focus(); });
      return;
    }

    // larangan.json 27,6 KB dan hanya dipakai kalau produknya memang memuat bahan
    // berlarangan. Mengambilnya untuk tiap produk berarti membayar berkas terbesar
    // kedua di seluruh perjalanan demi kartu yang pada sebagian besar produk tidak
    // pernah muncul.
    if (!larangan && p.isi?.some((c) => c.larangan)) larangan = await ambil('larangan');

    const kepala = `
      <div class="kartu">
        <h2>${teks(p.nama)}<span class="lencana">${teks(JENIS[p.jenis] ?? p.jenis)}</span></h2>
        <dl class="kunci">
          <dt>Pemegang pendaftaran</dt><dd>${teks(p.produsen ?? '—')}</dd>
          <dt>Nomor pendaftaran</dt><dd>${teks(p.daftar ?? '—')}</dd>
          <dt>Berlaku sampai</dt><dd>${teks(tanggal(p.berlaku) ?? '—')}${p.status && p.status !== 'active' ? ` (${teks(p.status)})` : ''}</dd>
          <dt>Bentuk</dt><dd>${teks(p.bentuk ?? '—')}</dd>
        </dl>
        <p class="catatan">Cocokkan nomor pendaftaran itu dengan yang tertera di kemasan.</p>
      </div>`;

    el.rincian.innerHTML =
      kepala + blokLarangan(p.isi) + blokIsi(p) + blokGuna(p) + (await blokSetara(p)) +
      '<button type="button" class="kembali" id="kembali">← Kembali ke hasil pencarian</button>';

    document.getElementById('kembali').addEventListener('click', () => {
      el.rincian.innerHTML = '';
      el.q.focus();
    });
  } catch (e) {
    el.rincian.innerHTML = `<div class="kartu peringatan">
      <h2>Rinciannya gagal diambil</h2>
      <p>Sambungan terputus atau berkasnya tidak ada. Coba lagi — yang sudah terambil
      tetap tersimpan, jadi percobaan berikutnya lebih ringan.</p>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
}

// ---------------------------------------------------------------------------
// Rangkaian
// ---------------------------------------------------------------------------
el.hasil.addEventListener('click', (ev) => {
  const t = ev.target.closest('button[data-id]');
  if (t) bukaProduk(t.dataset.id, t.dataset.pecahan);
});

let jeda;
el.q.addEventListener('input', () => {
  clearTimeout(jeda);
  jeda = setTimeout(jalankanCari, 180);
});

async function jalankanCari() {
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
    gambarHasil(hasil, kueri);
  } catch (e) {
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Pencarian gagal</h2>
      <p>Berkas indeksnya tidak terambil. Periksa sambungan, lalu ketik ulang.</p>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
}

(async function mulai() {
  try {
    meta = await ambil('meta');
    const j = meta.jumlah;
    el.sumber.innerHTML =
      `Sumber: registri Kementan lewat <code>spec/indeks/</code> — ` +
      `${j.pestisida.toLocaleString('id-ID')} pestisida, ${j.pupuk.toLocaleString('id-ID')} pupuk, ` +
      `${j.varietas.toLocaleString('id-ID')} varietas. ` +
      `${j.produkSetara.toLocaleString('id-ID')} produk berada dalam ${j.kelompokSetara.toLocaleString('id-ID')} kelompok berisi sama.`;
    el.q.disabled = false;
  } catch (e) {
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Indeks tidak ditemukan</h2>
      <p>Halaman ini membaca <code>spec/indeks/</code>, yang dibangun ulang dengan
      <code>node spec/tools/bangun-indeks.mjs --tulis</code> dan sengaja tidak ikut
      disimpan di repositori.</p>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
})();
