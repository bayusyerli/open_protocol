/* Harga komoditas — daftar, riwayat, dan komentar.
 *
 * Dua pengambilan, dan pemisahannya mengikuti dua pertanyaan yang berbeda:
 *   harga.json          "apa saja yang ada harganya, dan berapa sekarang" — kepala daftar
 *   harga/<key>.json    "bagaimana riwayatnya" — seluruh seri, statistik, dan komentarnya
 *
 * Serinya dibawa utuh, bukan dijarangkan, karena grafiknya memang seluruh seri: 634 titik
 * ≈ 14 KB, di bawah anggaran satu berkas. Menjarangkannya akan menghaluskan lonjakan yang
 * justru paling penting dilihat.
 *
 * GRAFIKNYA SVG YANG DIGAMBAR SENDIRI, BUKAN PUSTAKA
 * Bukan penghematan gaya: satu pustaka grafik berukuran beberapa ratus kilobyte pada
 * permukaan yang syarat lapangan nomor satunya sinyal buruk, demi satu garis dan dua sumbu.
 * Yang digambar di sini garis, rentang, dan penanda — tanpa animasi, tanpa interaksi yang
 * menuntut tetikus, dan tetap terbaca pada layar 320 px.
 */

import { ambil, muatMeta, bacaMeta, teks, tanggal } from './pustaka.js';
import { pasangTombolTema } from './tema.js';
import { pasangBatas } from './batas.js';

pasangTombolTema();

const el = {
  judul: document.getElementById('judul'),
  q: document.getElementById('q'),
  bantuan: document.getElementById('bantuan'),
  daftar: document.getElementById('daftar'),
  rincian: document.getElementById('rincian'),
  batas: document.getElementById('batasJawaban'),
  atribusi: document.getElementById('atribusi'),
};

document.getElementById('tanpaJs')?.remove();

const BENTUK_KEY = /^[a-z0-9-]+$/;
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const rp = (x) => 'Rp' + Math.round(Number(x)).toLocaleString('id-ID');
const angkaId = (x, d = 1) =>
  x === null || x === undefined ? '—' : Number(x).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
const n = (x) => Number(x ?? 0).toLocaleString('id-ID');

// Arah perubahan dinyatakan lewat kata DAN tanda, bukan lewat warna saja: naik-turun harga
// dibaca berlawanan oleh pembeli dan penjual, dan warna sendirian tidak terbaca oleh yang
// buta warna maupun yang layarnya silau di kebun.
const arah = (p) => {
  if (p === null || p === undefined) return { kelas: 'datar', kata: 'tidak terhitung', tanda: '' };
  if (Math.abs(p) < 0.5) return { kelas: 'datar', kata: 'nyaris tetap', tanda: '' };
  return p > 0
    ? { kelas: 'naik', kata: 'naik', tanda: '▲' }
    : { kelas: 'turun', kata: 'turun', tanda: '▼' };
};

let kepala = [];

// ---------------------------------------------------------------------------
// Daftar
// ---------------------------------------------------------------------------
// Yang tampil di daftar: keluaran usaha tani, dan sarana produksinya. Yang tidak: baja
// ringan, besi beton, kayu balok, triplek, paku, semen, LPG, dan pangan olahan lanjut
// berbahan baku impor — SP2KP menerbitkannya dalam endpoint yang sama, tetapi tidak satu pun
// urusan permukaan ini.
//
// Yang disembunyikan TIDAK dihapus dari data dan TIDAK didiamkan: jumlahnya disebut, dan
// daftarnya bisa dibuka. Menyaring diam-diam membuat cacah di layar tidak pernah cocok
// dengan cacah di dokumen, dan selisih yang tak terjelaskan itu justru yang membuat orang
// berhenti memercayai keduanya.
const TANI = (x) => x.r !== 'luar';

function gambarDaftar(kueri = '') {
  const r = kueri.trim().toLowerCase();
  const dalamLingkup = kepala.filter(TANI);
  const cocok = r
    ? dalamLingkup.filter((x) => `${x.n} ${x.g ?? ''}`.toLowerCase().includes(r))
    : dalamLingkup;

  if (!cocok.length) {
    el.daftar.innerHTML = `
      <p class="kosong">
        Tidak ada komoditas tani yang namanya memuat <strong>${teks(kueri)}</strong>.
        Cakupannya memang sempit — dan bahan bangunan serta pangan olahan lanjut yang ikut
        diterbitkan SP2KP sengaja tidak dicari di sini. Tidak ada satu pun komoditas
        perkebunan.
      </p>`;
    return;
  }

  const berangka = cocok.filter((x) => !x.kosong);
  const kosong = cocok.filter((x) => x.kosong);

  const luar = kepala.filter((x) => !TANI(x));
  el.daftar.innerHTML = `
    <p class="bantuan">
      ${n(berangka.length)} komoditas berangka${kosong.length ? `, ${n(kosong.length)} diterbitkan tanpa angka` : ''}.
    </p>
    ${luar.length ? `
      <details class="luar-lingkup">
        <summary>${n(luar.length)} varian lain yang SP2KP terbitkan tidak ditampilkan di sini</summary>
        <p class="catatan">
          Endpoint yang sama memuat <strong>bahan bangunan</strong> — baja ringan, besi beton,
          kayu balok, triplek, paku, semen — beserta <strong>LPG</strong> dan
          <strong>pangan olahan</strong>: gula pasir, minyak goreng, tepung terigu, susu,
          mie instan.
        </p>
        <p class="catatan">
          Yang olahan dikeluarkan bukan karena bahan bakunya impor — tebu dan sawit ditanam di
          sini — melainkan karena <strong>harganya harga eceran barang jadi</strong>. Yang
          menghadapinya pembeli di toko, bukan petani tebu maupun petani sawit, dan jarak
          antara keduanya tidak diukur data ini. Beras tetap ditampilkan meski digiling: satu
          langkah dari gabah, dan itu cara harga padi diucapkan di seluruh Indonesia.
        </p>
        <p class="catatan">
          Keduanya tetap tercatat di <code>spec/vocab/harga/</code> apa adanya, supaya cacah
          di layar ini bisa direkonsiliasi dengan cacah di sumbernya. Yang berubah hanya apa
          yang layar ini pilih untuk tampilkan.
        </p>
        <p class="catatan">${luar.map((x) => teks(x.n)).join(' · ')}</p>
      </details>` : ''}
    <ul class="daftar-harga">
      ${berangka.map((x) => {
        const a = arah(x.u30);
        return `
        <li>
          <a class="baris-tautan" href="harga.html?k=${encodeURIComponent(x.k)}">
            <span class="nama">${teks(x.n)}${x.g && x.g !== x.n ? `<span class="lencana">${teks(x.g)}</span>` : ''}</span>
            <span class="harga-kini">${rp(x.p)}<span class="satuan">/${teks(x.s)}</span></span>
            <span class="ubah ${a.kelas}">${a.tanda} ${angkaId(Math.abs(x.u30 ?? 0))}% <span class="ubah-jangka">30 hari</span></span>
          </a>
        </li>`;
      }).join('')}
      ${kosong.map((x) => `
        <li class="hasil-belum">
          <a class="baris-tautan" href="harga.html?k=${encodeURIComponent(x.k)}">
            <span class="nama">${teks(x.n)}</span>
            <span class="sub">diterbitkan SP2KP tanpa satu pun angka</span>
          </a>
        </li>`).join('')}
    </ul>`;
}

// ---------------------------------------------------------------------------
// Grafik — SVG polos, digambar dari serinya sendiri
// ---------------------------------------------------------------------------
function grafik(seri, satuan) {
  if (seri.length < 2) return '';
  const L = 52, K = 8, A = 16, B = 26;      // tepi kiri, kanan, atas, bawah
  const W = 720, H = 260;
  const w = W - L - K, h = H - A - B;

  const nilai = seri.map((p) => p.p);
  let lo = Math.min(...nilai), hi = Math.max(...nilai);
  // Sumbu tidak dimulai dari nol, dan itu disengaja — tetapi karena itu ia WAJIB berlabel
  // di kedua ujungnya, supaya kenaikan 2% tidak terbaca sebagai kenaikan berlipat. Label
  // bawah dan atas keduanya digambar di bawah ini.
  const pad = (hi - lo) * 0.08 || Math.max(1, hi * 0.02);
  lo -= pad; hi += pad;

  const t0 = new Date(seri[0].t).getTime();
  const t1 = new Date(seri.at(-1).t).getTime();
  const x = (t) => L + ((new Date(t).getTime() - t0) / (t1 - t0 || 1)) * w;
  const y = (v) => A + (1 - (v - lo) / (hi - lo || 1)) * h;

  const d = seri.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)} ${y(p.p).toFixed(1)}`).join(' ');

  // Garis tahun sebagai penanda, bukan grid penuh: yang perlu dijawab mata "ini kapan",
  // dan kisi rapat pada layar 320 px justru menutupi garisnya sendiri.
  const tahun = [];
  for (let th = new Date(seri[0].t).getUTCFullYear() + 1; th <= new Date(seri.at(-1).t).getUTCFullYear(); th++) {
    const tx = x(`${th}-01-01`);
    if (tx > L && tx < L + w) tahun.push({ th, tx });
  }

  const akhir = seri.at(-1);
  return `
    <figure class="grafik">
      <svg viewBox="0 0 ${W} ${H}" role="img" preserveAspectRatio="none"
           aria-label="Grafik garis harga ${teks(satuan)} dari ${teks(seri[0].t)} sampai ${teks(akhir.t)}, terendah ${rp(Math.min(...nilai))}, tertinggi ${rp(Math.max(...nilai))}, terakhir ${rp(akhir.p)}.">
        <line class="g-sumbu" x1="${L}" y1="${A}" x2="${L}" y2="${A + h}"></line>
        <line class="g-sumbu" x1="${L}" y1="${A + h}" x2="${L + w}" y2="${A + h}"></line>
        ${tahun.map((t) => `
          <line class="g-tahun" x1="${t.tx.toFixed(1)}" y1="${A}" x2="${t.tx.toFixed(1)}" y2="${A + h}"></line>
          <text class="g-label" x="${t.tx.toFixed(1)}" y="${A + h + 17}" text-anchor="middle">${t.th}</text>`).join('')}
        <path class="g-garis" d="${d}"></path>
        <circle class="g-titik" cx="${x(akhir.t).toFixed(1)}" cy="${y(akhir.p).toFixed(1)}" r="3.5"></circle>
        <text class="g-label" x="${L - 6}" y="${(A + 4).toFixed(1)}" text-anchor="end">${rp(hi)}</text>
        <text class="g-label" x="${L - 6}" y="${(A + h).toFixed(1)}" text-anchor="end">${rp(lo)}</text>
      </svg>
      <figcaption>
        ${teks(seri[0].t)} – ${teks(akhir.t)} · ${n(seri.length)} titik harian.
        <strong>Sumbu tegaknya tidak mulai dari nol</strong>, jadi tinggi garis menunjukkan
        perubahan, bukan besaran. Kedua ujungnya berlabel supaya bisa dibaca apa adanya.
      </figcaption>
    </figure>`;
}

// ---------------------------------------------------------------------------
// Kartu-kartu rincian
// ---------------------------------------------------------------------------
function kartuAngka(h) {
  const s = h.statistik;
  const baris = [
    ['7 hari', s.ubah7],
    ['30 hari', s.ubah30],
    ['90 hari', s.ubah90],
    ['1 tahun', s.ubah365],
  ];
  return `
    <div class="kartu">
      <h2>${teks(h.nama)}<span class="lencana">${teks(h.kelompok ?? 'Komoditas')}</span></h2>
      <p class="harga-besar">
        ${rp(s.terakhir.p)}<span class="satuan">/${teks(h.qty && h.qty !== 1 ? h.qty + ' ' : '')}${teks(h.satuan)}</span>
      </p>
      <p class="catatan">Per ${teks(tanggal(s.terakhir.t) ?? s.terakhir.t)} · eceran nasional tertimbang penduduk.</p>

      <div class="ubah-baris">
        ${baris.map(([k, v]) => {
          const a = arah(v);
          return `<span class="ubah-keping ${a.kelas}">
            <span class="ubah-jangka">${teks(k)}</span>
            <strong>${a.tanda} ${angkaId(v === null ? null : Math.abs(v))}${v === null ? '' : '%'}</strong>
          </span>`;
        }).join('')}
      </div>

      <dl class="kunci">
        <dt>Terendah</dt><dd>${rp(s.min.p)} · ${teks(tanggal(s.min.t) ?? s.min.t)}</dd>
        <dt>Tertinggi</dt><dd>${rp(s.maks.p)} · ${teks(tanggal(s.maks.t) ?? s.maks.t)}</dd>
        <dt>Rata-rata</dt><dd>${rp(s.rata)}</dd>
        <dt>Gejolak</dt><dd>${angkaId(s.gejolak)}% koefisien variasi</dd>
      </dl>
      ${catatanLubang(h)}
      ${catatanAwalSeri(h)}
    </div>`;
}

// Dua catatan yang keduanya mencegah angka benar dibaca keliru.
//
// LUBANG. "299 hari kalender tanpa angka" terbaca sebagai data yang rusak, padahal
// sebagian besarnya akhir pekan — SP2KP tidak mencacah Sabtu dan Minggu, yang saja 28,5%
// hari kalender. Menyebut jumlahnya tanpa menyebut sebabnya menakut-nakuti tanpa memberi
// tahu apa pun; menyembunyikannya menutupi seri yang memang benar-benar bolong. Jadi
// keduanya disebut, dan akhir pekannya dihitung, bukan ditaksir.
function catatanLubang(h) {
  const bolong = h.cakupan?.gaps ?? 0;
  if (!bolong) return '';
  const a = new Date(h.cakupan.from), b = new Date(h.cakupan.to);
  let akhirPekan = 0;
  for (let t = a.getTime(); t <= b.getTime(); t += 86400000) {
    const d = new Date(t).getUTCDay();
    if (d === 0 || d === 6) akhirPekan++;
  }
  const sisa = Math.max(0, bolong - akhirPekan);
  return `
    <p class="catatan">
      <strong>${n(bolong)} hari kalender di dalam rentang ini tidak punya angka</strong> —
      ${n(Math.min(akhirPekan, bolong))} di antaranya akhir pekan, yang memang tidak dicacah.
      ${sisa > 0 ? `Sisanya ${n(sisa)} hari: hari libur, dan pada sebagian seri juga hari yang benar-benar terlewat.` : ''}
      Garis grafiknya menyambung langsung antar titik yang ada — tidak ada nilai yang
      diisikan diam-diam.
    </p>`;
}

// AWAL SERI. Seri SP2KP mulai 1 Februari 2024, di tengah lonjakan harga pangan: 40 dari 43
// komoditas mencapai puncak tertingginya pada Februari–Mei 2024, dan 38 dari 43 mencapai
// titik terendahnya di jendela yang sama. Maka "tertinggi" dan "terendah" di kartu ini
// lebih banyak berkata tentang KAPAN SERINYA DIMULAI daripada tentang komoditasnya —
// dan angka yang benar tetap bisa menyesatkan kalau asalnya tidak disebut.
const AWAL_JENDELA = 120;
function catatanAwalSeri(h) {
  const s = h.statistik;
  const a = new Date(h.cakupan.from).getTime();
  const dalam = (t) => (new Date(t).getTime() - a) / 86400000 <= AWAL_JENDELA;
  const kena = [dalam(s.min.t) && 'terendahnya', dalam(s.maks.t) && 'tertingginya'].filter(Boolean);
  if (!kena.length) return '';
  return `
    <p class="catatan">
      <strong>${kena.join(' dan ')} jatuh di empat bulan pertama seri ini.</strong> SP2KP mulai
      mencatat 1 Februari 2024, di tengah lonjakan harga pangan — 40 dari 43 komoditas
      mencapai puncaknya dan 38 dari 43 mencapai titik terendahnya pada jendela yang sama.
      Angka itu benar, tetapi ia lebih banyak berkata tentang kapan pencatatannya dimulai
      daripada tentang komoditas ini.
    </p>`;
}

function kartuMusim(h) {
  const m = h.statistik?.musim;
  if (!m) {
    return `
      <div class="kartu">
        <h2>Pola bulanan</h2>
        <p class="kosong">
          Tidak dihitung. Serinya belum melewati dua belas bulan penuh, dan pola musim yang
          ditarik dari kurang dari setahun adalah pola yang dikarang, bukan yang ditemukan.
        </p>
      </div>`;
  }
  return `
    <div class="kartu">
      <h2>Pola bulanan</h2>
      <dl class="kunci">
        <dt>Rata-rata tertinggi</dt><dd>${teks(BULAN[m.bulanTertinggi - 1])}</dd>
        <dt>Rata-rata terendah</dt><dd>${teks(BULAN[m.bulanTerendah - 1])}</dd>
        <dt>Selisih keduanya</dt><dd>${angkaId(m.rentangPersen)}%</dd>
      </dl>
      <p class="catatan">
        Dihitung dari rata-rata tiap bulan kalender sepanjang seri ini.
        <strong>Ini pola yang sudah terjadi, bukan ramalan.</strong> Dua setengah tahun
        adalah dua sampai tiga pengamatan per bulan — cukup untuk menyebut pola, tidak cukup
        untuk menjanjikannya berulang.
      </p>
    </div>`;
}

// Dua pemeriksaan berdampingan, dan bentuknya sengaja menahan yang satu agar tidak
// meminjam wibawa yang lain.
//
// Yang paling mudah keliru di sini adalah membuat "lolos periksa mesin" terbaca sebagai
// "sudah diperiksa". Ia bukan itu. Ia menyatakan tiga hal yang sempit dan bisa dihitung:
// tiap angka di kalimat memang ada di data, medan batasnya terisi, dan tidak ada ramalan
// maupun anjuran. Ia sama sekali tidak menyentuh pertanyaan apakah kalimatnya membaca
// angkanya dengan jujur — dan justru itu yang menentukan apakah pembacanya tersesat.
//
// Karena itu keduanya digambar sebagai dua baris setara, masing-masing dengan keadaannya
// sendiri, dan yang belum terpenuhi TIDAK ditulis lebih kecil atau lebih pucat daripada
// yang sudah. Satu centang hijau sendirian di kartu ini akan berbohong tanpa satu kata pun
// yang salah.
function kartuKomentar(h) {
  const k = h.komentar;
  if (!k) return '';
  const penulis = k.sumber === 'model' ? 'model bahasa' : 'aturan atas angkanya sendiri';
  const p = k.periksa;

  const barisMesin = !p
    ? {
      kelas: 'belum',
      tanda: '–',
      judul: 'Periksa mesin — belum dijalankan',
      isi: 'Jalankan <code>node spec/tools/periksa-komentar-harga.mjs --tulis</code>.',
    }
    : p.lolos
      ? {
        kelas: 'lolos',
        tanda: '✓',
        judul: 'Lolos periksa mesin',
        isi: 'Tiap angka di kalimat ini ada di data yang dipakai menulisnya, batasnya disebut, '
          + 'dan tidak ada ramalan maupun anjuran. <strong>Itu saja yang diperiksa</strong> — '
          + 'aritmetikanya bisa ditelusuri, bacaannya belum tentu jujur.',
      }
      : {
        kelas: 'gagal',
        tanda: '✕',
        judul: 'TIDAK lolos periksa mesin',
        isi: `<strong>${teks((p.masalah ?? []).join(' · '))}</strong> Kalimat ini tetap ditampilkan `
          + 'apa adanya, karena menyembunyikannya menghapus satu-satunya tanda bahwa ada yang keliru.',
      };

  const barisOrang = k.ditinjau
    ? {
      kelas: 'lolos',
      tanda: '✓',
      judul: `Ditinjau ${teks(k.oleh ?? 'tanpa nama')} pada ${teks(tanggal(k.ditinjau) ?? k.ditinjau)}`,
      isi: 'Seorang manusia membaca kalimat ini dan bertanggung jawab atas bacaannya. '
        + 'Tinjauan itu menempel pada susunan angka yang ia baca — begitu serinya bertambah '
        + 'dan kalimatnya ditulis ulang, ia gugur sendiri.',
    }
    : {
      kelas: 'belum',
      tanda: '–',
      judul: 'Belum ditinjau manusia',
      isi: 'Belum ada seorang pun yang membaca kalimat ini dan menempelkan namanya. '
        + 'Inilah yang menahan tingkatnya di D, dan bukan sesuatu yang bisa diselesaikan mesin.',
    };

  const baris = (b) => `
    <li class="periksa-${b.kelas}">
      <span class="periksa-tanda" aria-hidden="true">${b.tanda}</span>
      <span>
        <strong>${b.judul}</strong>
        <span class="periksa-isi">${b.isi}</span>
      </span>
    </li>`;

  return `
    <div class="kartu komentar">
      <h2>Bacaan angka ini
        <span class="lencana lencana-d">Tingkat ${k.ditinjau ? 'C' : 'D'} · ${k.ditinjau ? 'sudah ditinjau' : 'belum ditinjau'}</span>
      </h2>
      <p class="komentar-teks">${teks(k.teks)}</p>

      <ul class="periksa-daftar">
        ${baris(barisMesin)}
        ${baris(barisOrang)}
      </ul>

      <p class="catatan catatan-tegas">
        <strong>Kalimat di atas ditulis ${teks(penulis)}, bukan orang.</strong> Angkanya
        bertingkat B — survei resmi Kemendag, disalin apa adanya — tetapi kalimat ini
        <em>tafsir</em> atas angka itu, dan tafsir tidak mewarisi tingkat sumbernya. Angka
        yang dipakai menulisnya disimpan bersamanya di
        <code>spec/vocab/harga/komentar.json</code>, jadi ia bisa diperiksa tanpa memercayai
        penulisnya — dan daftar tinjauannya sudah siap di
        <code>docs/18-tinjauan-komentar-harga.md</code>.
      </p>
    </div>`;
}

function kartuKosong(h) {
  return `
    <div class="kartu peringatan">
      <h2>${teks(h.nama)} — terdaftar, tanpa angka</h2>
      <p>${teks(h.kosong)}</p>
      <p class="catatan">
        Halaman ini menampilkannya alih-alih menghilangkannya karena hasil pencarian nol
        terbaca sebagai <em>"tidak ada harganya di mana pun"</em>. Yang benar:
        <strong>sumber ini mendaftarkannya dan tidak mengisinya</strong> — dan itu
        mengarahkan pencarian ke tempat lain, bukan menghentikannya.
      </p>
    </div>`;
}

// ---------------------------------------------------------------------------
// Buka satu komoditas
// ---------------------------------------------------------------------------
async function buka(key) {
  el.rincian.innerHTML = '<p class="kosong">Mengambil riwayat harganya…</p>';
  el.rincian.focus();
  try {
    const h = await ambil(`harga/${key}`);
    document.title = `Harga ${h.nama} — Open Protocols`;
    el.judul.textContent = `Harga ${h.nama}`;

    el.rincian.innerHTML = h.seri?.length
      ? kartuAngka(h) + grafik(h.seri, `${h.nama} per ${h.satuan}`) + kartuMusim(h) + kartuKomentar(h) + tombolKembali()
      : kartuKosong(h) + tombolKembali();

    el.rincian.querySelector('#kembali')?.addEventListener('click', () => {
      el.rincian.innerHTML = '';
      history.pushState({}, '', 'harga.html');
      el.judul.textContent = 'Harga komoditas';
      document.title = 'Harga komoditas — Open Protocols';
      el.daftar.scrollIntoView({ block: 'start' });
    });
  } catch (e) {
    el.rincian.innerHTML = `
      <div class="kartu peringatan">
        <h2>Riwayatnya gagal diambil</h2>
        <p>Sambungan terputus atau berkasnya tidak ada. Coba lagi — yang sudah terambil tetap
        tersimpan, jadi percobaan berikutnya lebih ringan.</p>
        <p class="catatan">${teks(e.message)}</p>
      </div>`;
  }
}

const tombolKembali = () =>
  '<button type="button" class="kembali" id="kembali">← Kembali ke daftar komoditas</button>';

// ---------------------------------------------------------------------------
// Pencarian di dalam daftar
// ---------------------------------------------------------------------------
// Daftarnya 88 baris dan sudah ada di memori, jadi penyaringannya di sini — tanpa jeda,
// tanpa perjalanan jaringan. Kotak pencarian beranda yang menjangkau seluruh indeks.
let jeda;
el.q.addEventListener('input', () => {
  clearTimeout(jeda);
  jeda = setTimeout(() => gambarDaftar(el.q.value), 120);
});
document.getElementById('formCari').addEventListener('submit', (ev) => {
  ev.preventDefault();
  clearTimeout(jeda);
  gambarDaftar(el.q.value);
});

el.daftar.addEventListener('click', (ev) => {
  const a = ev.target.closest('a[href^="harga.html?k="]');
  if (!a) return;
  ev.preventDefault();
  const k = new URL(a.href, location.href).searchParams.get('k');
  if (!k || !BENTUK_KEY.test(k)) return;
  history.pushState({}, '', `harga.html?k=${encodeURIComponent(k)}`);
  buka(k);
});

addEventListener('popstate', () => {
  const k = new URLSearchParams(location.search).get('k');
  if (k && BENTUK_KEY.test(k)) buka(k);
  else { el.rincian.innerHTML = ''; el.judul.textContent = 'Harga komoditas'; }
});

// ---------------------------------------------------------------------------
// Mulai
// ---------------------------------------------------------------------------
(async function mulai() {
  try {
    await muatMeta();
    kepala = await ambil('harga');

    pasangBatas(el.batas, {
      sumber: ['harga'],
      takDijawab: ['hargaPetani', 'hargaWilayah', 'hargaKomoditasTani', 'hargaPupuk'],
    });

    // Atribusi Kemendag wajib dan bentuknya sudah ditentukan pemilik datanya. Dibaca dari
    // meta, bukan diketik di HTML: yang diketik dua kali akan basi di salah satunya.
    const atr = bacaMeta()?.batas?.sumber?.harga?.atribusi;
    if (atr) el.atribusi.textContent = atr;

    gambarDaftar('');

    const k = new URLSearchParams(location.search).get('k');
    if (k && BENTUK_KEY.test(k)) await buka(k);
  } catch (e) {
    el.daftar.innerHTML = `
      <div class="kartu peringatan">
        <h2>Indeks harga tidak ditemukan</h2>
        <p>
          Halaman ini membaca <code>spec/indeks/harga.json</code>, yang turunan. Bangun dulu
          dari akar repositori: <code>node harga_data/tarik-sp2kp.mjs</code>, lalu
          <code>node spec/tools/bangun-harga.mjs --tulis</code>,
          <code>node spec/tools/bangun-komentar-harga.mjs --tulis</code>, dan
          <code>node spec/tools/bangun-indeks.mjs --tulis</code>.
        </p>
        <p class="catatan">${teks(e.message)}</p>
      </div>`;
  }
})();
