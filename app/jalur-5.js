/* Jalur 5 — sediaan pupuk sendiri.
 *
 * Sisi yang lapang. Untuk pupuk, kewajiban pendaftaran melekat pada PEREDARAN — bukan
 * pada membuat, dan bukan pada memakai (UU 22/2019 Pasal 71 ayat 2 dan Pasal 72), jadi
 * tujuh resep di sini tidak menunggu apa pun untuk dirilis.
 *
 * Tidak ada kotak pencarian: yang datang ke sini tidak memegang kemasan apa pun. Ia
 * masuk lewat pertanyaan "untuk apa", dan itu pula sumbu yang menentukan rezim
 * hukumnya — Pasal 75 menentukan pestisida dari kegunaan yang DIKLAIM.
 */

import { ambil, muatMeta, bacaMeta, teks, pasangKembali, tautanMasuk, pesanGagalMuat, pasangCobaLagi } from './pustaka.js';
import { catatBuka, catatJawab, JENIS as UKUR } from './ukur.js';
import { pasangBatas } from './batas.js';
import { pasangKeselamatan } from './keselamatan.js';
import { HTML_TERUSKAN, pasangTeruskan } from './teruskan.js';
import { pasangTombolTema } from './tema.js';

pasangTombolTema();

catatBuka(5);

const el = {
  fungsi: document.getElementById('fungsi'),
  daftar: document.getElementById('daftar'),
  resep: document.getElementById('resep'),
  batas: document.getElementById('batasJawaban'),
};

document.getElementById('tanpaJs')?.remove();

// Empat fungsi yang jatuh di sisi pupuk. `silang` menandai yang merentang kedua sisi:
// di situ orang yang sebenarnya mencari pengendali penyakit bisa berhenti di jalur
// yang salah, dan peringatan silangnya wajib ikut.
const FUNGSI = [
  { kunci: 'nutrient_supply', nama: 'Menambah hara', ringkas: 'Kompos, kascing, pupuk organik cair' },
  { kunci: 'soil_conditioning', nama: 'Memperbaiki tanah', ringkas: 'Memperbaiki remah dan daya simpan air', silang: true },
  { kunci: 'decomposition_starter', nama: 'Mempercepat pengomposan', ringkas: 'Pemicu penguraian' },
  { kunci: 'growth_stimulation', nama: 'Merangsang pertumbuhan', ringkas: 'Perangsang akar dan tunas', silang: true },
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
  A: 'A — uji terkendali berulang',
  B: 'B — penelitian terbit, belum berulang',
  C: 'C — praktik mapan, bukti terbatas',
  D: 'D — praktik lapangan, bukti belum ada',
};
const LAMA = { d: 'hari', mo: 'bulan', wk: 'minggu', a: 'tahun' };

// UCUM menuliskan anotasi tak berdimensi dalam kurung kurawal — "{MPN}/g", "{CFU}/g" —
// dan satuan tak berdimensi sebagai "1". Kurawal dan "1" itu tata tulis UCUM, bukan
// bagian nama satuannya, jadi keduanya dilepas saat disajikan. Isi kurawalnya
// dibiarkan: MPN dan CFU memang begitu dibaca orang lab.
// UCUM juga menulis derajat Celsius sebagai "Cel" dan persen sebagai "%". Yang
// pertama tidak terbaca siapa pun di luar UCUM, jadi dialihkan.
const SATUAN_TAMPIL = { Cel: '°C', har: 'ha', 'kg/har': 'kg/ha', 'L/har': 'L/ha', d: 'hari' };
const satuanTerbaca = (u) =>
  u == null || u === '1' ? '' : (SATUAN_TAMPIL[u] ?? String(u).replace(/[{}]/g, ''));
const angkaId = (n) => Number(n).toLocaleString('id-ID', { maximumFractionDigits: 3 });
const OPERATOR = { '>=': '≥', '<=': '≤', '>': '>', '<': '<', '==': '=' };

/**
 * Kalimat pembanding, dan yang paling penting: kapan ia TIDAK dibuat.
 * ">= 0" tidak membatasi apa pun. Sebagian kriteria memang sengaja begitu — kemurnian
 * biakan MOL memakainya dengan alasan tertulis "tidak ada dasar mengukurnya di kebun" —
 * dan mencetaknya sebagai ambang mengubah ketiadaan ambang jadi ambang.
 */
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
function kartuSilang(f) {
  return `
    <div class="kartu peringatan">
      <h2>Sebagian sediaan berfungsi ini ada di jalur lain</h2>
      <p>
        “${teks(f.nama)}” <strong>merentang kedua sisi</strong>. Sediaan yang selain itu
        juga mengklaim <strong>menekan penyakit atau membasmi hama</strong> pindah ke
        rezim pestisida — dan di sana larangannya menyentuh kata
        <em>menggunakan</em>, tanpa pengecualian petani kecil.
      </p>
      <p class="catatan">
        Kalau yang kamu cari sebenarnya pengendali penyakit, sediaannya tidak ada di
        halaman ini. Contohnya berdampingan: <strong>MOL bonggol pisang</strong> tetap
        di sisi pupuk, <strong>biakan PGPR bambu</strong> pindah — bukan karena bahannya
        berbeda, hanya karena PGPR mengklaim menekan penyakit juga.
      </p>
    </div>`;
}

function gambarDaftar(f) {
  const cocok = daftarResep.filter((r) => r.fungsi.includes(f.kunci));
  const sini = cocok.filter((r) => r.jalur === 5);
  const sana = cocok.filter((r) => r.jalur !== 5);
  el.resep.innerHTML = '';
  el.daftar.innerHTML = `
    <h2 class="judul-bagian">Yang mana? <span class="lencana">${sini.length}</span></h2>
    ${f.silang ? kartuSilang(f) : ''}
    ${sini.length ? `<ul class="daftar">
      ${sini.map((r) => `
        <li>
          <button type="button" data-berkas="${teks(r.berkas)}">
            <span class="nama">${teks(r.nama)}</span>
            <span class="sub">tingkat bukti ${teks(BUKTI[r.bukti] ?? r.bukti ?? '—')}</span>
          </button>
        </li>`).join('')}
    </ul>` : '<p class="kosong">Tidak ada sediaan sisi pupuk untuk fungsi ini.</p>'}
    ${sana.length ? `<p class="catatan">
      ${sana.length} sediaan berfungsi sama ada di <strong>jalur 6</strong> karena juga
      mengklaim mengendalikan OPT: ${sana.map((r) => teks(r.nama)).join(', ')}.
      Jalur itu masih tertutup sampai bacaan Pasal 77 ayat (1) dijawab.
    </p>` : ''}`;
}

// ---------------------------------------------------------------------------
function blokHukum(r) {
  return `
    <div class="kartu pelepasan">
      <h2>Kedudukan hukumnya</h2>
      <div class="pembungkus-tabel">
        <table>
          <thead><tr><th>Dasar</th><th>Bunyinya</th></tr></thead>
          <tbody>${r.hukum.dasar.map((d) => `
            <tr><td>${teks(d.instrumen)} ${teks(d.pasal)}</td><td>${teks(d.bunyi ?? '—')}</td></tr>`).join('')}</tbody>
        </table>
      </div>
      <dl class="kunci">
        <dt>Rezim</dt><dd><code>${teks(r.hukum.rezim.join(', '))}</code></dd>
        <dt>Peredaran</dt><dd>${r.hukum.peredaran === 'limited_kabupaten_kota'
          ? 'terbatas dalam satu kabupaten/kota' : teks(r.hukum.peredaran ?? '—')}</dd>
      </dl>
      <p class="catatan">
        Membuat dan memakai untuk lahan sendiri di luar rezim pendaftaran.
        <strong>Mengedarkannya tidak</strong> — Pasal 73 melarang mengedarkan pupuk yang
        tidak terdaftar atau tidak berlabel, dengan sanksi Pasal 122.
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
              <td class="angka">${b.takaran ? `${teks(b.takaran.nilai)} ${teks(SATUAN_TAKAR[b.takaran.satuan] ?? b.takaran.satuan)}` : '—'}</td>
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
  const s = r.proses.sanitasi;
  return `
    <div class="kartu">
      <h2>Proses dan titik kendalinya</h2>
      <dl class="kunci">
        <dt>Lama</dt><dd>${r.proses.lama ? `${teks(r.proses.lama.value)} ${teks(LAMA[r.proses.lama.unit] ?? r.proses.lama.unit)}` : '—'}</dd>
        ${s?.min_temperature ? `<dt>Suhu tumpukan</dt><dd>≥ ${teks(s.min_temperature.value)} °C, ditahan ${teks(s.hold_days)} hari, ${teks(s.turnings)} kali pembalikan</dd>` : ''}
      </dl>
      ${r.proses.titikKendali.length ? `
        <div class="pembungkus-tabel">
          <table>
            <thead><tr><th>Titik kendali</th><th>Sasaran</th><th>Cara memeriksa</th><th>Kalau meleset</th></tr></thead>
            <tbody>${r.proses.titikKendali.map((t) => `
              <tr><td>${teks(t.nama ?? '—')}</td><td class="angka">${teks(pembanding(t)?.teks ?? '—')}</td>
                  <td>${teks(t.cara ?? '—')}</td><td>${teks(t.kalauMeleset ?? '—')}</td></tr>`).join('')}</tbody>
          </table>
        </div>
        <p class="catatan">
          Yang menentukan mutu <strong>bukan lama menumpuk</strong>, melainkan apakah
          titik kendali di atas tercapai.
        </p>` : ''}
    </div>`;
}

function blokKriteria(r) {
  if (!r.kriteria.length) {
    return `<div class="kartu"><h2>Kriteria pelepasan</h2>
      <p class="kosong">Kosakata belum memuat kriteria pelepasan untuk sediaan ini.</p></div>`;
  }
  return `
    <div class="kartu">
      <h2>Kapan boleh dipakai <span class="lencana">${r.kriteria.length}</span></h2>
      ${r.kriteria.map((k) => `
        <div class="kriteria">
          <p class="kriteria-ukuran">${teks(pembanding(k)?.teks ?? k.jenis ?? '—')}${k.metode ? ` — ${teks(k.metode)}` : ''}</p>
          ${pembanding(k) && !pembanding(k).berambang
            ? '<p class="catatan">Sengaja <strong>tanpa ambang angka</strong> — penanda kasar yang diperiksa dengan mata, bukan diukur.</p>'
            : ''}
          ${k.diKebun
            ? `<p class="kriteria-kebun"><strong>Di kebun, tanpa alat:</strong> ${teks(k.diKebun)}</p>`
            : `<p class="catatan"><strong>Padanan lapangannya belum ada di kosakata.</strong>
                 Kriteria di atas butuh laboratorium, dan halaman ini tidak mengarang
                 uji kebun yang belum pernah diputuskan siapa pun.</p>`}
          ${k.alasan ? `<p class="catatan">${teks(k.alasan)}</p>` : ''}
        </div>`).join('')}
    </div>`;
}

function blokPakai(r) {
  const d = r.pemakaian?.dosis;
  const a = r.keselamatan;
  return `
    <div class="kartu">
      <h2>Pemakaian dan keselamatan</h2>
      <dl class="kunci">
        ${d ? `<dt>Takaran</dt><dd>${teks(angkaId(d.nilai))} ${teks(satuanTerbaca(d.satuan) || d.satuan)}${d.min && d.maks ? ` (kisaran ${teks(angkaId(d.min))}–${teks(angkaId(d.maks))})` : ''}</dd>` : ''}
        ${r.pemakaian?.cara ? `<dt>Cara</dt><dd>${teks(r.pemakaian.cara)}</dd>` : ''}
        ${r.rendemen ? `<dt>Rendemen</dt><dd>${teks(angkaId(r.rendemen.nisbah))}× bobot bahan${r.rendemen.catatan ? ` — ${teks(r.rendemen.catatan)}` : ''}</dd>` : ''}
        ${r.simpan?.lama ? `<dt>Tahan simpan</dt><dd>${teks(r.simpan.lama.value)} ${teks(LAMA[r.simpan.lama.unit] ?? r.simpan.lama.unit)}</dd>` : ''}
        ${r.simpan?.cara ? `<dt>Cara menyimpan</dt><dd>${teks(r.simpan.cara)}</dd>` : ''}
        ${a.apd.length ? `<dt>Pelindung diri</dt><dd>${a.apd.map((x) => teks(APD[x] ?? x)).join(', ')}</dd>` : ''}
      </dl>
      ${a.bahaya.length ? `<p class="catatan"><strong>Bahaya:</strong> ${a.bahaya.map(teks).join(' ')}</p>` : ''}
      ${a.catatan ? `<p class="catatan">${teks(a.catatan)}</p>` : ''}
    </div>`;
}

const BLOK_HARA = `
  <div class="kartu peringatan">
    <h2>Kadar haranya tidak bisa dihitung</h2>
    <p>
      Kompos punya kadar hara, tetapi <strong>kadarnya berbeda tiap tumpukan</strong> —
      tergantung bahan, cara, dan cuaca. Aturan <code>L18</code> menolak menghitung hara
      dari batch yang belum terukur.
    </p>
    <p class="catatan">
      Karena itu sediaan ini <strong>tidak muncul di kalkulator jalur 3 dengan rupiah
      per kg hara</strong>: memberinya angka rujukan akan membuat seluruh perbandingan
      di sana bohong. Yang bisa dihitung biaya bahan dan tenaganya. Kadar haranya baru
      bisa dinyatakan sesudah satu batch diuji.
    </p>
  </div>`;


/* Rekaman yang sedang terbuka, dibaca blok sanggahan (B3) SAAT DIKETUK. Blok batas
 * digambar sekali saat halaman muat, sementara rekamannya dibuka jauh sesudahnya —
 * jadi yang diserahkan ke sana pembacanya, bukan nilainya. */
let terbukaKini = null;
let resepKini = null;

/* Kartu teruskan (A2). Sisi pupuk lebih lapang daripada jalur 6 — Pasal 72 mengecualikan
 * petani kecil dari kewajiban pendaftaran — tetapi `wajib`-nya tetap ada, dan justru yang
 * paling mudah dilupakan saat resep berpindah tangan: kadar haranya TIDAK diketahui, jadi
 * resep ini tidak boleh dipakai menghitung neraca hara seperti pupuk pabrik. */
function kartuResep(r) {
  if (!r) return null;
  const k = r.keselamatan ?? {};
  const d = r.pemakaian?.dosis;
  const wajib = [
    'Kadar haranya TIDAK terukur. Jangan dipakai menghitung neraca hara seperti pupuk '
    + 'berlabel — angka N-P-K sediaan buatan sendiri tidak ada di mana pun.',
  ];
  if (r.hukum?.hanyaSendiri || r.hukum?.peredaran === 'own_use_only') {
    wajib.push('Hanya untuk keperluan sendiri.');
  }
  return {
    sumber: 'sediaan',
    judul: `${r.nama} — sediaan buatan sendiri`,
    inti: [
      r.definisi ?? null,
      d?.nilai != null ? `Dosis: ${angkaId(d.nilai)} ${satuanTerbaca(d.satuan) || d.satuan}` : null,
      r.pemakaian?.cara ? `Cara: ${r.pemakaian.cara}` : null,
      k.apd?.length ? `APD: ${k.apd.map((x) => APD[x] ?? x).join(', ')}` : null,
    ].filter(Boolean),
    wajib,
    tautan: terbukaKini?.tautan ?? location.href,
  };
}
const tautanKe = (q) => new URL(q, location.href).href;


async function bukaResep(berkas) {
  el.resep.innerHTML = '<p class="kosong">Mengambil resepnya…</p>';
  el.resep.focus();
  try {
    const r = await ambil(berkas);
    resepKini = r;
    terbukaKini = { id: r.id, nama: r.nama,
      tautan: tautanKe(`?resep=${encodeURIComponent(berkas.split('/').pop())}`) };
    el.resep.innerHTML = `
      <div class="kartu">
        <h2>${teks(r.nama)}</h2>
        ${r.definisi ? `<p>${teks(r.definisi)}</p>` : ''}
        <dl class="kunci">
          <dt>Tingkat bukti</dt><dd>${teks(BUKTI[r.bukti] ?? r.bukti ?? '—')}</dd>
        </dl>
        ${r.buktiCatatan ? `<p class="catatan">${teks(r.buktiCatatan)}</p>` : ''}
      </div>
      ${blokHukum(r)}${blokBahan(r)}${blokProses(r)}${blokKriteria(r)}${blokPakai(r)}${BLOK_HARA}
      ${HTML_TERUSKAN}
      <button type="button" class="kembali" id="kembali">← Kembali ke daftar</button>`;
    catatJawab(5, UKUR.isi);
    pasangKembali(el.resep, { gulirKe: el.daftar });
  } catch (e) {
    catatJawab(5, UKUR.gagal);
    el.resep.innerHTML = `<div class="kartu peringatan"><h2>Resepnya gagal diambil</h2>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
}

// ---------------------------------------------------------------------------
el.fungsi.addEventListener('click', (ev) => {
  const t = ev.target.closest('button[data-fungsi]');
  if (!t) return;
  el.fungsi.querySelectorAll('button').forEach((b) => b.classList.toggle('terpilih', b === t));
  gambarDaftar(FUNGSI.find((f) => f.kunci === t.dataset.fungsi));
});

el.daftar.addEventListener('click', (ev) => {
  const t = ev.target.closest('button[data-berkas]');
  if (t) bukaResep(t.dataset.berkas);
});

pasangTeruskan(el.resep, () => kartuResep(resepKini), 'sediaan');

(async function mulai() {
  try {
    const s = await ambil('sediaan');
    daftarResep = s.resep;
    bahanOlehId = new Map(s.bahan.map((b) => [b.id, b]));
    el.fungsi.innerHTML = `
      <ul class="daftar">
        ${FUNGSI.map((f) => {
          const n = daftarResep.filter((r) => r.fungsi.includes(f.kunci) && r.jalur === 5).length;
          return `<li>
            <button type="button" data-fungsi="${teks(f.kunci)}">
              <span class="nama">${teks(f.nama)}<span class="lencana">${n}</span></span>
              <span class="sub">${teks(f.ringkas)}</span>
            </button>
          </li>`;
        }).join('')}
      </ul>`;
    const jalur5 = daftarResep.filter((r) => r.jalur === 5).length;
    await muatMeta();
    // A1 — datang dari kotak beranda dengan satu resep sudah dipilih. Daftar fungsinya
    // tetap digambar lebih dulu: tombol "kembali ke daftar" harus mendarat pada sesuatu.
    pasangKeselamatan(document.getElementById('keselamatan'), bacaMeta(), { ringkas: true });
    pasangBatas(el.batas, {
      sumber: [{
        dari: 'sediaan',
        cakupan: `${jalur5} resep sisi pupuk dari ${daftarResep.length}, beserta ${bahanOlehId.size} bahan baku — bahan, takaran, titik kendali, kriteria pelepasan, dosis, dan APD diambil apa adanya`,
      }],
      takDijawab: ['haraSediaan', {
        judul: 'Padanan lapangan untuk sebagian kriteria pelepasan',
        teks:
          'Sebagian kriteria pelepasan hanya bisa diperiksa di laboratorium, dan kosakata ini belum memuat padanan kebunnya untuk bokashi dan vermikompos. Layar menyebutkan kekosongan itu alih-alih mengarang uji kebun yang belum pernah diputuskan siapa pun.',
      }],
      sanggah: () => terbukaKini,
    });

    // A1 — datang dari kotak beranda dengan satu resep sudah dipilih. Dipanggil PALING
    // AKHIR, sesudah daftar fungsi dan blok batas selesai digambar: keduanya menyentuh
    // panel yang sama, dan memanggilnya lebih dulu membuat resepnya tergambar lalu
    // terhapus tanpa satu pun galat.
    const { resep } = tautanMasuk();
    if (resep) await bukaResep(`sediaan/${resep}`);
  } catch (e) {
    el.fungsi.innerHTML = pesanGagalMuat(e);
    pasangCobaLagi(el.fungsi);
  }
})();
