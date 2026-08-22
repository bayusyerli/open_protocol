/* Jalur 6 — sediaan pengendali sendiri.
 *
 * Sisi yang terikat, dan satu-satunya jalur yang dibangun UNTUK TIDAK MENGANJURKAN.
 * Untuk pestisida larangannya tidak berhenti di peredaran: Pasal 77 ayat (1) menyebut
 * "mengedarkan dan/atau MENGGUNAKAN", kata yang tidak muncul di sisi pupuk, dan tidak
 * ada pasal yang sepadan dengan Pasal 72 — kelonggaran petani kecil hanya ada untuk
 * pupuk.
 *
 * Rangkaian kata pada Pasal 77 ayat (1) bisa dibaca kumulatif maupun alternatif, dan
 * bacaannya menentukan apakah memakai pestisida nabati untuk keperluan sendiri
 * benar-benar terlarang. Itu pertanyaan hukum yang belum dijawab. Sikap yang wajib
 * diikuti layar ini, diwarisi dari spesifikasi: NYATAKAN STATUSNYA APA ADANYA, TANDAI
 * own_use_only, JANGAN MENYIMPULKAN AMAN.
 *
 * Karena itu jalur ini tidak pernah muncul sebagai cabang "yang bisa kamu pakai" dari
 * jalur insiden. Ia berdiri sendiri, dan pintunya membuka dengan pasalnya.
 */

import { ambil, muatMeta, teks, pasangKembali } from './pustaka.js';
import { catatBuka, catatJawab, JENIS as UKUR } from './ukur.js';
import { pasangBatas } from './batas.js';
import { pasangTombolTema } from './tema.js';

pasangTombolTema();

catatBuka(6);

const el = {
  fungsi: document.getElementById('fungsi'),
  daftar: document.getElementById('daftar'),
  resep: document.getElementById('resep'),
  batas: document.getElementById('batasJawaban'),
};

document.getElementById('tanpaJs')?.remove();

const FUNGSI = [
  { kunci: 'pest_control', nama: 'Membasmi hama', ringkas: 'Ekstrak nabati', terlarang: true },
  { kunci: 'disease_suppression', nama: 'Menekan penyakit', ringkas: 'Agens hayati' },
  {
    kunci: 'growth_stimulation',
    nama: 'Merangsang pertumbuhan',
    ringkas: 'Zona kabur Pasal 75 huruf d',
    kabur: true,
  },
];

const PERAN = {
  nitrogen_source: 'sumber nitrogen', carbon_source: 'sumber karbon', water: 'air',
  energy_source: 'sumber energi', active_material: 'bahan aktif', carrier: 'pembawa',
  inoculum: 'inokulum', additive: 'tambahan',
};
const SATUAN_TAKAR = {
  parts_by_volume: 'bagian menurut volume',
  parts_by_mass: 'bagian menurut bobot',
  percent_by_mass: '% menurut bobot',
};
const APD = {
  gloves: 'sarung tangan', mask: 'masker', boots: 'sepatu bot',
  goggles: 'kacamata pelindung', long_sleeves: 'baju lengan panjang',
};
const BUKTI = {
  A: 'A — uji terkendali berulang', B: 'B — penelitian terbit, belum berulang',
  C: 'C — praktik mapan, bukti terbatas', D: 'D — praktik lapangan, bukti belum ada',
};
const LAMA = { d: 'hari', mo: 'bulan', wk: 'minggu', a: 'tahun' };
const SATUAN_TAMPIL = { Cel: '°C', har: 'ha', 'kg/har': 'kg/ha', 'L/har': 'L/ha' };

const satuanTerbaca = (u) => (u == null || u === '1' ? '' : (SATUAN_TAMPIL[u] ?? String(u).replace(/[{}]/g, '')));
const angkaId = (n) => Number(n).toLocaleString('id-ID', { maximumFractionDigits: 3 });
const OPERATOR = { '>=': '≥', '<=': '≤', '>': '>', '<': '<', '==': '=' };

// Sebagian pembandingan KATEGORIK, bukan berangka: patogenitas pada tanaman uji
// dibandingkan dengan "negative". Melewatkannya ke pemformat angka menghasilkan NaN
// dan mencetak "Patogenitas pada tanaman uji = NaN" di layar.
const KATEGORI = { negative: 'negatif', positive: 'positif' };

function pembanding(x) {
  if (!x.ubah) return null;
  const angka = typeof x.nilai === 'number';
  const kosong = x.nilai == null || (angka && x.operator === '>=' && x.nilai === 0);
  if (kosong) return { teks: x.ubah, berambang: false };
  const sat = satuanTerbaca(x.satuan);
  const nilai = angka ? angkaId(x.nilai) : (KATEGORI[x.nilai] ?? String(x.nilai));
  return { teks: `${x.ubah} ${OPERATOR[x.operator] ?? x.operator} ${nilai}${sat ? ' ' + sat : ''}`, berambang: true };
}

let daftarResep = null;
let bahanOlehId = null;

// ---------------------------------------------------------------------------
function gambarDaftar(f) {
  const cocok = daftarResep.filter((r) => r.fungsi.includes(f.kunci) && r.jalur === 6);
  const terlarang = [...bahanOlehId.values()].filter((b) => b.status === 'prohibited');
  el.resep.innerHTML = '';
  el.daftar.innerHTML = `
    <h2 class="judul-bagian">Yang mana? <span class="lencana">${cocok.length}</span></h2>
    ${f.kabur ? `
      <div class="kartu peringatan">
        <h2>Zona kabur Pasal 75 huruf d</h2>
        <p>
          Bahan yang mengatur pertumbuhan tanaman <strong>dan tidak termasuk pupuk</strong>
          masuk definisi pestisida. Sediaan yang menolak disebut pupuk justru
          <strong>tertarik masuk ke sini</strong> — bukan keluar.
        </p>
      </div>` : ''}
    ${cocok.length ? `<ul class="daftar">
      ${cocok.map((r) => `
        <li>
          <button type="button" data-berkas="${teks(r.berkas)}">
            <span class="nama">${teks(r.nama)}</span>
            <span class="sub">tingkat bukti ${teks(BUKTI[r.bukti] ?? r.bukti ?? '—')}${r.adaKriteria ? '' : ' · tanpa kriteria pelepasan'}</span>
          </button>
        </li>`).join('')}
    </ul>` : '<p class="kosong">Tidak ada sediaan untuk fungsi ini.</p>'}
    ${f.terlarang && terlarang.length ? `
      <hr class="pemisah">
      <h2 class="judul-bagian">Dua bahan yang tidak pernah boleh dipakai</h2>
      <p class="catatan">
        Ditampilkan <strong>dengan sengaja</strong>, bukan disembunyikan. Yang mencarinya
        harus sampai ke alasannya — kalau hasil pencariannya kosong, ia akan mencari di
        tempat lain yang tidak menjelaskan apa pun.
      </p>
      <ul class="daftar">
        ${terlarang.map((b) => `
          <li>
            <button type="button" data-terlarang="${teks(b.id)}">
              <span class="nama">${teks(b.nama)}<span class="tanda-larangan">ditolak</span></span>
              <span class="sub">aturan L19 menolak resep apa pun yang memakainya</span>
            </button>
          </li>`).join('')}
      </ul>` : ''}`;
}

// ---------------------------------------------------------------------------
function blokHukum(r) {
  return `
    <div class="kartu tabrakan">
      <h2>Kedudukan hukumnya</h2>
      ${r.hukum.rezim.includes('unclear') ? `
        <p><strong>Rezimnya sendiri belum jelas.</strong> Kosakata menandainya
        <code>unclear</code> berdampingan dengan <code>pesticide_like</code> — bukan
        kelalaian pencatatan, melainkan keadaan yang memang belum terjawab.</p>` : ''}
      <div class="pembungkus-tabel">
        <table>
          <thead><tr><th>Dasar</th><th>Bunyinya</th></tr></thead>
          <tbody>${r.hukum.dasar.map((d) => `
            <tr><td>${teks(d.instrumen)} ${teks(d.pasal)}</td><td>${teks(d.bunyi ?? '—')}</td></tr>`).join('')}</tbody>
        </table>
      </div>
      <dl class="kunci">
        <dt>Rezim</dt><dd><code>${teks(r.hukum.rezim.join(', '))}</code></dd>
        <dt>Peredaran</dt><dd>${r.hukum.peredaran === 'own_use_only'
          ? '<strong>hanya untuk keperluan sendiri</strong>' : teks(r.hukum.peredaran ?? '—')}</dd>
      </dl>
      <p class="catatan">
        Halaman ini <strong>tidak menyimpulkan bahwa memakainya aman atau sah</strong>.
        Bacaan Pasal 77 ayat (1) belum dijawab penasihat hukum, dan sampai itu status di
        atas dinyatakan apa adanya — tidak lebih.
      </p>
    </div>`;
}

function blokBahan(r) {
  if (!r.bahan.length) return '';
  return `
    <div class="kartu">
      <h2>Bahan dan perbandingannya</h2>
      <div class="pembungkus-tabel">
        <table>
          <thead><tr><th>Bahan</th><th>Peran</th><th>Takaran</th></tr></thead>
          <tbody>${r.bahan.map((b) => {
            const s = bahanOlehId.get(b.zat);
            const tanda = s?.status === 'prohibited' ? '<span class="tanda-larangan">terlarang</span>'
                        : s?.status === 'restricted' ? '<span class="tanda-syarat">bersyarat</span>' : '';
            return `<tr>
              <td>${teks(b.nama ?? '—')}${tanda}${b.pilihan ? ' <em>(boleh tidak ada)</em>' : ''}</td>
              <td>${teks(PERAN[b.peran] ?? b.peran ?? '—')}</td>
              <td class="angka">${b.takaran ? `${angkaId(b.takaran.nilai)} ${teks(SATUAN_TAKAR[b.takaran.satuan] ?? b.takaran.satuan)}` : '—'}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>
      ${r.bahan.map((b) => bahanOlehId.get(b.zat)).filter((s) => s?.status === 'restricted' || s?.status === 'prohibited')
        .map((s) => `<p class="catatan"><strong>${teks(s.nama)} — ${s.status === 'prohibited' ? 'terlarang' : 'bersyarat'}.</strong> ${teks(s.alasan ?? '')}</p>`).join('')}
    </div>`;
}

function blokProses(r) {
  if (!r.proses) return '';
  return `
    <div class="kartu">
      <h2>Proses dan titik kendalinya</h2>
      <dl class="kunci">
        <dt>Lama</dt><dd>${r.proses.lama ? `${angkaId(r.proses.lama.value)} ${teks(LAMA[r.proses.lama.unit] ?? r.proses.lama.unit)}` : '—'}</dd>
      </dl>
      ${r.proses.titikKendali.length ? `
        <div class="pembungkus-tabel">
          <table>
            <thead><tr><th>Titik kendali</th><th>Sasaran</th><th>Cara memeriksa</th><th>Kalau meleset</th></tr></thead>
            <tbody>${r.proses.titikKendali.map((t) => `
              <tr><td>${teks(t.nama ?? '—')}</td><td class="angka">${teks(pembanding(t)?.teks ?? '—')}</td>
                  <td>${teks(t.cara ?? '—')}</td><td>${teks(t.kalauMeleset ?? '—')}</td></tr>`).join('')}</tbody>
          </table>
        </div>` : ''}
    </div>`;
}

// Sisi ini punya masalah yang tidak dimiliki sisi pupuk: mutunya sering TIDAK BISA
// diperiksa tanpa laboratorium. Kosakata mengakuinya alih-alih menyamarkannya, dan
// pengakuan itu yang justru harus sampai ke layar — PGPR menyatakan terus terang
// bahwa larutan keruh saja bukan bukti.
function blokKriteria(r) {
  if (!r.kriteria.length) return '';
  return `
    <div class="kartu">
      <h2>Kapan boleh dipakai <span class="lencana">${r.kriteria.length}</span></h2>
      ${r.kriteria.map((k) => `
        <div class="kriteria">
          <p class="kriteria-ukuran">${teks(pembanding(k)?.teks ?? k.jenis ?? '—')}${k.metode ? ` — ${teks(k.metode)}` : ''}</p>
          ${pembanding(k) && !pembanding(k).berambang
            ? '<p class="catatan">Sengaja <strong>tanpa ambang angka</strong> — penanda kasar yang diperiksa dengan mata, bukan diukur.</p>' : ''}
          ${k.diKebun
            ? `<p class="kriteria-kebun"><strong>Di kebun, tanpa alat:</strong> ${teks(k.diKebun)}</p>`
            : `<p class="catatan"><strong>Padanan lapangannya belum ada di kosakata.</strong>
                 Kriteria di atas butuh laboratorium, dan halaman ini tidak mengarang
                 uji kebun yang belum pernah diputuskan siapa pun.</p>`}
          ${k.alasan ? `<p class="catatan">${teks(k.alasan)}</p>` : ''}
        </div>`).join('')}
    </div>`;
}

// PHI di sini BUKAN hasil uji. Keempat sediaan yang membawanya menandainya
// precautionary_default — angka bawaan yang sengaja berhati-hati. Menampilkannya
// tanpa keterangan itu akan membuatnya terbaca seperti hasil uji residu.
function blokPakai(r) {
  const d = r.pemakaian?.dosis;
  const a = r.keselamatan;
  return `
    <div class="kartu">
      <h2>Pemakaian dan keselamatan</h2>
      <dl class="kunci">
        ${d ? `<dt>Takaran</dt><dd>${angkaId(d.nilai)} ${teks(satuanTerbaca(d.satuan) || d.satuan)}${d.min && d.maks ? ` (kisaran ${angkaId(d.min)}–${angkaId(d.maks)})` : ''}</dd>` : ''}
        ${r.pemakaian?.cara ? `<dt>Cara</dt><dd>${teks(r.pemakaian.cara)}</dd>` : ''}
        ${r.simpan?.lama ? `<dt>Tahan simpan</dt><dd>${angkaId(r.simpan.lama.value)} ${teks(LAMA[r.simpan.lama.unit] ?? r.simpan.lama.unit)}</dd>` : ''}
        ${a.apd.length ? `<dt>Pelindung diri</dt><dd>${a.apd.map((x) => teks(APD[x] ?? x)).join(', ')}</dd>` : ''}
      </dl>
      ${a.bahaya.length ? `<p class="catatan"><strong>Bahaya:</strong> ${a.bahaya.map(teks).join(' ')}</p>` : ''}
    </div>
    ${a.phi != null ? `
      <div class="kartu peringatan">
        <h2>Tenggang panen ${angkaId(a.phi)} hari — <em>bukan hasil uji</em></h2>
        <p>
          Angka ini <code>${teks(a.phiDasar ?? '—')}</code>: <strong>bawaan yang sengaja
          berhati-hati</strong>, bukan hasil uji residu. Tidak ada uji residu untuk
          sediaan buatan sendiri.
        </p>
        ${a.catatan ? `<p class="catatan">${teks(a.catatan)}</p>` : ''}
      </div>` : ''}`;
}

// Tanpa kriteria pelepasan, sebuah sediaan tidak bisa dibakukan — dan yang tidak bisa
// dibakukan tidak boleh diberi dosis, karena dosis atas sesuatu yang isinya tidak
// diketahui bukan takaran melainkan tebakan. Kosakata memang memuat angkanya; layar
// ini yang menahan diri, dan mengatakan bahwa penahanan itu disengaja.
function blokTakBisaDibakukan(r) {
  return `
    <div class="kartu peringatan">
      <h2>Berhenti sebelum dosis dan cara pakai</h2>
      <p>
        Sediaan ini <strong>tidak punya kriteria pelepasan</strong> sama sekali — tidak
        ada satu pun ukuran yang menyatakan kapan ia jadi dan kapan ia gagal. Yang tidak
        bisa dibakukan tidak bisa diberi takaran: dosis atas sesuatu yang isinya tidak
        diketahui bukan takaran, melainkan tebakan.
      </p>
      <p class="catatan">
        Kosakata memuat angka dosisnya, dan halaman ini <strong>sengaja tidak
        menampilkannya</strong>. Penahanan itu disengaja, bukan data yang hilang.
      </p>
    </div>`;
}

async function bukaResep(berkas) {
  el.resep.innerHTML = '<p class="kosong">Mengambil resepnya…</p>';
  el.resep.focus();
  try {
    const r = await ambil(berkas);
    const bisaDibakukan = r.kriteria.length > 0;
    el.resep.innerHTML = `
      <div class="kartu">
        <h2>${teks(r.nama)}</h2>
        ${r.definisi ? `<p>${teks(r.definisi)}</p>` : ''}
        <dl class="kunci"><dt>Tingkat bukti</dt><dd>${teks(BUKTI[r.bukti] ?? r.bukti ?? '—')}</dd></dl>
        ${r.buktiCatatan ? `<p class="catatan">${teks(r.buktiCatatan)}</p>` : ''}
      </div>
      ${blokHukum(r)}${blokBahan(r)}${blokProses(r)}
      ${bisaDibakukan ? blokKriteria(r) + blokPakai(r) : blokTakBisaDibakukan(r)}
      <button type="button" class="kembali" id="kembali">← Kembali ke daftar</button>`;
    catatJawab(6, bisaDibakukan ? UKUR.isi : UKUR.takSanggup);
    pasangKembali(el.resep, { gulirKe: el.daftar });
  } catch (e) {
    catatJawab(6, UKUR.gagal);
    el.resep.innerHTML = `<div class="kartu peringatan"><h2>Resepnya gagal diambil</h2>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
}

// Penolakan lebih dulu, alasannya sesudahnya, dan kalimat yang paling sering luput
// paling akhir — bahwa yang paling terpapar justru pembuatnya, bukan hamanya.
function bukaTerlarang(id) {
  const b = bahanOlehId.get(id);
  const bolehnya = daftarResep.filter((r) => r.jalur === 6 && r.adaKriteria);
  el.resep.innerHTML = `
    <div class="kartu tabrakan">
      <h2>${teks(b.nama)} — ditolak</h2>
      <p>
        Aturan <code>L19</code> menolak resep apa pun yang memakainya. Tidak ada dosis
        dan tidak ada cara pakai di halaman ini, dan itu <strong>disengaja</strong>.
      </p>
      <p class="catatan">${teks(b.alasan ?? '')}</p>
    </div>
    <div class="kartu">
      <h2>Kalau tetap dicari</h2>
      <p class="catatan">
        Bahan ini masuk daftar larangan justru <em>karena</em> lazim dipakai. Pada
        rendaman buatan sendiri kadarnya tidak diketahui sama sekali — sehingga yang
        paling terpapar justru <strong>pembuatnya</strong>, bukan hamanya.
      </p>
      ${bolehnya.length ? `
        <p class="catatan">Yang punya kriteria pelepasan dan boleh dicatat:</p>
        <ul class="daftar">
          ${bolehnya.map((r) => `
            <li>
              <button type="button" data-berkas="${teks(r.berkas)}">
                <span class="nama">${teks(r.nama)}</span>
                <span class="sub">tingkat bukti ${teks(BUKTI[r.bukti] ?? r.bukti)}</span>
              </button>
            </li>`).join('')}
        </ul>` : ''}
    </div>
    <button type="button" class="kembali" id="kembali">← Kembali ke daftar</button>`;
  el.resep.focus();
  pasangKembali(el.resep, { gulirKe: el.daftar });
}

// ---------------------------------------------------------------------------
el.fungsi.addEventListener('click', (ev) => {
  const t = ev.target.closest('button[data-fungsi]');
  if (!t) return;
  el.fungsi.querySelectorAll('button').forEach((b) => b.classList.toggle('terpilih', b === t));
  gambarDaftar(FUNGSI.find((f) => f.kunci === t.dataset.fungsi));
});

for (const wadah of [el.daftar, el.resep]) {
  wadah.addEventListener('click', (ev) => {
    const t = ev.target.closest('button[data-terlarang]');
    if (t) return bukaTerlarang(t.dataset.terlarang);
    const b = ev.target.closest('button[data-berkas]');
    if (b) return bukaResep(b.dataset.berkas);
  });
}

(async function mulai() {
  try {
    const s = await ambil('sediaan');
    daftarResep = s.resep;
    bahanOlehId = new Map(s.bahan.map((b) => [b.id, b]));
    el.fungsi.innerHTML = `
      <ul class="daftar">
        ${FUNGSI.map((f) => {
          const n = daftarResep.filter((r) => r.fungsi.includes(f.kunci) && r.jalur === 6).length;
          return `<li>
            <button type="button" data-fungsi="${teks(f.kunci)}">
              <span class="nama">${teks(f.nama)}<span class="lencana">${n}</span></span>
              <span class="sub">${teks(f.ringkas)}</span>
            </button>
          </li>`;
        }).join('')}
      </ul>`;
    const jalur6 = daftarResep.filter((r) => r.jalur === 6).length;
    await muatMeta();
    // Satu-satunya jalur yang dibangun untuk tidak menganjurkan, jadi yang tidak
    // diketahuinya bukan catatan kaki — ia isi utamanya. Keduanya di bawah adalah
    // pertanyaan terbuka, bukan lubang data yang menunggu tarikan berikutnya.
    pasangBatas(el.batas, {
      sumber: [{
        dari: 'sediaan',
        cakupan: `${jalur6} resep sisi pengendali dari ${daftarResep.length} — status hukum, bahan, titik kendali, kriteria pelepasan, PHI, dan APD diambil apa adanya`,
      }],
      takDijawab: [
        {
          judul: 'Bacaan Pasal 77 ayat (1)',
          teks:
            'Rangkaian kata "mengedarkan dan/atau menggunakan" bisa dibaca kumulatif maupun alternatif, dan bacaan mana yang benar menentukan apakah memakai sediaan sendiri di kebun sendiri termasuk di dalamnya. Itu pertanyaan hukum, bukan agronomi, dan belum terjawab — layar menyatakan statusnya dan tidak menyimpulkan aman.',
        },
        {
          judul: 'Tenggang panen sediaan buatan sendiri',
          teks:
            'Keempat angka PHI di jalur ini precautionary_default — bawaan yang sengaja berhati-hati, bukan hasil uji residu. Tidak ada uji residu untuk sediaan buatan sendiri, dan angkanya tidak boleh dibaca sebagai hasil pengukuran.',
        },
      ],
    });
  } catch (e) {
    el.fungsi.innerHTML = `<div class="kartu peringatan"><h2>Indeks tidak ditemukan</h2>
      <p>Dibangun ulang dengan <code>node spec/tools/bangun-indeks.mjs --tulis</code>.</p>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
})();
