/* E1 — rencana musim dari protokol.
 *
 * Barisnya di docs/15 berbunyi "penyusun selesai; permukaan belum", dan itu tepat:
 * `spec/tools/susun-rencana.mjs` sudah menyusun rencana sejak lama, tetapi keluarannya
 * hanya bisa dilihat orang yang menjalankan Node di terminal — bukan petani.
 *
 * BERKAS INI CERMIN PENYUSUN ITU, DAN ITU RISIKO YANG DINYATAKAN. Dua salinan aritmetika
 * yang sama akan menyimpang begitu salah satunya diperbaiki; itu alasan `serah.js` dan
 * `batas.css` masing-masing tinggal di satu tempat. Di sini pemisahan tidak terhindarkan —
 * penyusun berjalan di Node atas `spec/vocab/`, permukaan di peramban atas `spec/indeks/`.
 * Yang menahan penyimpangannya karena itu bukan struktur melainkan UJI: keluaran keduanya
 * dibandingkan untuk masukan yang sama, dan aturan aritmetikanya disalin apa adanya di
 * bawah, bukan ditulis ulang dengan kata-kata sendiri.
 *
 * SATU HAL YANG PALING MUDAH DIRUSAK LAYAR: MENYEBUTNYA KALENDER.
 * Timing punya lima bentuk dan hanya `relative` yang bisa jadi tanggal. Entitas fase tidak
 * memuat hari, durasi, maupun akumulasi suhu — jadi "BBCH 51 kira-kira hari ke-45" adalah
 * fenologi yang dikarang, dan justru penjadwalan berbasis fase dipilih KARENA hari setelah
 * tanam sering meleset saat musim mundur atau varietas lebih genjah. Menanggalkannya
 * membatalkan alasan ia dipakai.
 *
 * Dari empat langkah protokol yang ada, dua bisa ditanggalkan. Angka itu disebutkan di
 * layar setiap kali, bukan disembunyikan di catatan kaki — daftar bertanggal yang memuat
 * dua baris "menunggu fase" di tengahnya tetap terbaca sebagai kalender kalau tidak ada
 * yang mengatakan sebaliknya.
 */

import { ambil, muatMeta, teks, tanggal } from './pustaka.js';
import { pasangBatas } from './batas.js';
import { pasangTombolTema } from './tema.js';
import * as musim from './musim.js';
import * as buku from './buku.js';

pasangTombolTema();
document.getElementById('tanpaJs')?.remove();

const el = {};
for (const id of ['protokol', 'tentangProtokol', 'tanam', 'semai', 'luas', 'susun', 'kabar', 'hasil',
  'luarRencana', 'lrTanggal', 'lrAlasan', 'lrApa', 'lrBiaya', 'lrKategori', 'lrTambah', 'lrKabar',
  'kartuMusim', 'ringkasMusim', 'bagianPanen', 'pnTanggal', 'pnJumlah', 'pnMutu', 'pnUang',
  'pnTambah', 'pnKabar', 'daftarPanen', 'tutupMusim'])
  el[id] = document.getElementById(id);
el.batas = document.getElementById('batasJawaban');

const n = (x, d = 2) => Number(x ?? 0).toLocaleString('id-ID', { maximumFractionDigits: d });

let daftar = [];
let rinci = null;
let alasan = [];
let gambarKartuMusim = () => {};

/* ---------------------------------------------------------------------------
 * E2 — pencatatan realisasi
 * ---------------------------------------------------------------------------
 * Barisnya berbunyi "skema selesai; permukaan belum", dan yang membentuk permukaannya dua
 * kalimat yang sudah ada di skema itu sendiri:
 *
 *   plan_ref            "Kosong berarti tindakan di luar rencana — ITU JUGA TEMUAN YANG
 *                        BERHARGA." Jadi tindakan di luar rencana punya pintunya sendiri,
 *                        bukan diperlakukan sebagai kesalahan pengisian.
 *   recording_lag_note  "Pencatatan mundur beberapa hari itu wajar di lapangan. JANGAN
 *                        DISEMBUNYIKAN — mutu data ikut dinilai dari sini." Jadi jarak
 *                        antara tanggal kejadian dan tanggal pencatatan dihitung sendiri
 *                        dan ditampilkan, bukan diam-diam dibiarkan nol.
 *
 * Dan satu dari pemeriksa: L8 menolak realisasi yang berbeda dari rencana tanpa alasan —
 * "simpangan tanpa alasan tidak bisa dipakai memperbaiki protokol". Di sini itu berarti
 * dua keadaan yang WAJIB beralasan: langkah yang dilewati, dan langkah yang dikerjakan
 * pada tanggal yang berbeda jauh dari rencananya.
 *
 * REALISASI DIKUNCI KE MUSIM BERSAMA, bukan ke `protokol|tanggal-tanam`. Kunci lama itu
 * tidak pernah terlihat siapa pun dan tidak pernah bertemu musim di buku kas, jadi biaya
 * yang dicatat di sana tidak bisa ditaruh di sebelah langkah yang menimbulkannya di sini.
 * Skema sudah menyatakannya sejak lama: `Step.cycle` WAJIB, dan `Cycle.plot` menunjuk
 * petak — realisasi tanpa siklus bukan Step yang kurang lengkap, ia bukan Step. */
const KUNCI = 'op:realisasi';
let realisasi = {};

function bacaRealisasi() {
  try {
    const m = JSON.parse(localStorage.getItem(KUNCI) ?? '{}');
    return m && typeof m === 'object' ? m : {};
  } catch { return {}; }
}

function tulisRealisasi() {
  try { localStorage.setItem(KUNCI, JSON.stringify(realisasi)); return true; } catch { return false; }
}

const hariIni = () => new Date().toISOString().slice(0, 10);
const selisihHari = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
const kunciMusim = () => musim.idMusimAktif();
const catatanMusim = () => {
  const c = (realisasi[kunciMusim()] ??= { langkah: {}, luar: [], panen: [] });
  c.panen ??= [];   // musim yang sudah ada sebelum panen dicatat di sini
  return c;
};

/* Catatan yang sudah terlanjur tersimpan di bawah kunci `protokol|tanggal` TIDAK BOLEH
 * hilang karena pembaruan ini. Tiap kunci lama dijadikan satu musim bernama — nama
 * protokolnya dan tanggal tanamnya, yang memang dua hal yang membedakannya — lalu
 * catatannya dipindahkan apa adanya. Aturan yang sama dipakai buku kas saat bentuk
 * simpanannya berubah: dibungkus, bukan dibuang. */
function pindahkanKunciLama() {
  const lama = Object.keys(realisasi).filter((k) => /\|\d{4}-\d{2}-\d{2}$/.test(k));
  if (!lama.length) return 0;
  // Musim yang sedang aktif di buku kas TIDAK boleh bergeser diam-diam karena pemindahan
  // ini. Menambah musim membuatnya aktif, dan buku kas yang tiba-tiba menampilkan musim
  // lain tanpa ada yang menyentuhnya adalah cara tercepat membuat orang mengira catatannya
  // hilang. Yang aktif sebelumnya dikembalikan; kalau memang belum ada, yang baru berlaku.
  const sebelumnya = musim.idMusimAktif();
  for (const k of lama) {
    const [kunciProtokol, tanam] = k.split('|');
    const p = daftar.find((x) => x.key === kunciProtokol);
    const baru = musim.tambah({
      nama: `${p?.nama ?? kunciProtokol} — tanam ${tanam}`,
      komoditas: p?.komoditas ?? null,
      tanam,
      protokol: kunciProtokol,
    });
    realisasi[baru.i] = realisasi[k];
    delete realisasi[k];
  }
  if (sebelumnya) musim.setAktif(sebelumnya);
  tulisRealisasi();
  return lama.length;
}

/* Disalin apa adanya dari susun-rencana.mjs. Offset boleh berjam, berminggu, atau
 * berbulan; hanya yang bisa jadi hari yang dipakai menanggalkan, dan "mo" sengaja kasar
 * karena ia memang hanya dipakai untuk offset kasar. */
const keHari = (d) => {
  if (!d) return null;
  const { value, unit } = d;
  if (unit === 'd') return value;
  if (unit === 'wk') return value * 7;
  if (unit === 'mo') return value * 30;
  return null;
};

const tambahHari = (iso, h) => {
  const t = new Date(`${iso}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + h);
  return t.toISOString().slice(0, 10);
};

/** Jadwal dan kebutuhan input — aturannya sama persis dengan penyusun di spec/tools. */
export function susunRencana(p, { tanam, semai, luas }) {
  const acuan = { transplanting: tanam, ...(semai ? { sowing: semai } : {}) };
  const jadwal = [];
  for (const s of p.langkah ?? []) {
    const w = s.waktu ?? {};
    if (w.kind === 'relative' && acuan[w.anchor]) {
      const h = keHari(w.offset);
      if (h === null) {
        jadwal.push({ s, jenis: 'tak-bertanggal', sebab: `satuan offset "${w.offset?.unit}" tidak bisa dijadikan hari` });
      } else {
        jadwal.push({ s, jenis: 'bertanggal', tgl: tambahHari(acuan[w.anchor], h), jendela: keHari(w.window) });
      }
    } else if (w.kind === 'relative') {
      jadwal.push({ s, jenis: 'tak-bertanggal', sebab: `tanggal acuan "${w.anchor}" tidak diberikan` });
    } else if (w.kind === 'stage') {
      jadwal.push({ s, jenis: 'fase', fase: w.stage?.label ?? w.stage?.id ?? null });
    } else if (w.kind === 'condition') {
      jadwal.push({ s, jenis: 'bersyarat' });
    } else {
      jadwal.push({ s, jenis: 'tak-bertanggal', sebab: `bentuk waktu "${w.kind ?? 'tidak ada'}" tidak bisa ditanggalkan` });
    }
  }

  // Hanya dosis berbasis luas yang bisa dikalikan luas petak. Dosis konsentrasi
  // (per_volume_water) butuh tahu berapa kali disemprot semusim, dan protokol tidak
  // menyebutnya — jadi ia TIDAK dijumlahkan, dan alasannya ikut.
  const kebutuhan = new Map();
  const takTerjumlah = [];
  for (const s of p.langkah ?? []) {
    for (const a of s.pakai ?? []) {
      const nama = a.substance?.label ?? a.substance?.id;
      if (a.rate?.basis === 'per_area' && luas) {
        const k = `${nama}|${a.rate.unit}`;
        kebutuhan.set(k, (kebutuhan.get(k) ?? 0) + a.rate.value * luas);
      } else {
        takTerjumlah.push({ nama, basis: a.rate?.basis ?? '(tanpa basis)', langkah: s.kunci });
      }
    }
  }
  return { jadwal, kebutuhan, takTerjumlah };
}

function blokPeringatan(p) {
  const lemah = p.tingkat === 'D' || p.status === 'draft';
  if (!lemah) return '';
  return `
    <div class="kartu peringatan">
      <h2>Rencana ini boleh diperiksa, belum boleh dijalankan sebagai anjuran</h2>
      <p>
        Protokolnya berstatus <strong>${teks(p.status ?? '—')}</strong> dengan tingkat bukti
        <strong>${teks(p.tingkat ?? 'belum ditetapkan')}</strong>. Tingkat D berarti
        pengalaman tunggal yang belum terverifikasi — bukan uji lapangan, bukan standar
        institusi, dan belum ditinjau agronom bernama.
      </p>
      ${p.alasanTingkat ? `<p class="catatan">${teks(p.alasanTingkat)}</p>` : ''}
    </div>`;
}

/* Usulan kategori buku kas dari jenis operasinya.
 *
 * Dicocokkan lewat KUNCI jenis operasi, bukan labelnya: label boleh diubah editor kapan
 * saja, kunci dijanjikan tetap. Yang tidak terdaftar jatuh ke "Lainnya" — dan jatuh ke
 * "Lainnya" jauh lebih baik daripada ditebak: kategori yang salah di buku kas tidak
 * kelihatan salah, ia cuma membuat "biaya terbesar" menunjuk ke tempat yang keliru.
 *
 * Ini USULAN. Medannya tetap bisa diganti sebelum disimpan, karena satu langkah bisa
 * berbiaya bahan pada satu petani dan berbiaya upah borongan pada petani lain. */
const KATEGORI_OPERASI = new Map(Object.entries({
  'Pupuk': ['pemupukan', 'pemupukan-dasar', 'pemupukan-susulan', 'pemupukan-lewat-daun',
    'fertigasi', 'pengapuran', 'pengomposan'],
  'Pestisida': ['perlindungan-tanaman', 'aplikasi-pestisida', 'penyiangan-kimiawi',
    'pengendalian-hayati', 'perlakuan-benih'],
  'Benih atau bibit': ['pembibitan', 'penyemaian', 'penyapihan', 'pengerasan-bibit',
    'penebaran-benih-ikan'],
  'Tenaga kerja — olah tanah': ['persiapan-lahan', 'olah-tanah', 'perataan-lahan',
    'pembuatan-bedengan', 'pengelolaan-sisa-tanaman', 'sanitasi-lahan', 'sterilisasi-media'],
  'Tenaga kerja — tanam': ['penanaman', 'penanaman-langsung', 'pindah-tanam', 'penyulaman'],
  'Tenaga kerja — pemeliharaan': ['perawatan-tanaman', 'penyiangan-gulma', 'penyiangan-manual',
    'pemangkasan', 'perempelan-tunas', 'penjarangan-buah', 'pengikatan-tanaman', 'pembumbunan',
    'pengendalian-mekanis', 'pemasangan-perangkap'],
  'Tenaga kerja — panen': ['panen', 'panen-bertahap'],
  'Mulsa & ajir': ['pemasangan-mulsa', 'pengajiran'],
  'Pengairan': ['pengairan', 'penyiraman', 'pengaturan-drainase', 'pengelolaan-kualitas-air'],
  'Angkut & kemas': ['pascapanen', 'sortasi', 'pengkelasan', 'pencucian', 'pengeringan',
    'pengemasan', 'penyimpanan', 'pengangkutan'],
}).flatMap(([kat, kunci]) => kunci.map((k) => [k, kat])));

const usulKategori = (langkah) => KATEGORI_OPERASI.get(langkah?.tindakan?.k) ?? 'Lainnya';
const rupiah = (x) => 'Rp ' + Math.round(x).toLocaleString('id-ID');

/* Keadaan satu langkah, dan hanya tiga: belum, dikerjakan, dilewati. Skala yang lebih
 * halus ("sebagian", "tertunda") menggoda dan menyesatkan — yang menentukan bagi protokol
 * cuma apakah ia terjadi, dan kalau tidak, kenapa. */
function blokAksi(j, r) {
  if (r?.keadaan === 'dikerjakan') {
    const lag = r.dicatat && r.tanggal ? selisihHari(r.tanggal, r.dicatat) : 0;
    const geser = j.jenis === 'bertanggal' && j.tgl ? selisihHari(j.tgl, r.tanggal) : null;
    const taut = buku.cariTaut(kunciMusim(), j.s.kunci);
    return `<span class="sudah">
      dikerjakan ${teks(tanggal(r.tanggal) ?? r.tanggal)}
      ${geser ? `<span class="sub">${Math.abs(geser)} hari ${geser > 0 ? 'lebih lambat' : 'lebih cepat'} dari rencana${r.alasan ? ` — ${teks(r.alasan)}` : ''}</span>` : ''}
      ${lag > 0 ? `<span class="sub">dicatat ${n(lag, 0)} hari sesudahnya</span>` : ''}
      ${taut ? `<span class="sub biaya">${rupiah(taut.n)} — ${teks(taut.k)}, masuk buku kas</span>` : ''}
      <button type="button" data-batal="${teks(j.s.kunci)}">batalkan</button>
    </span>`;
  }
  if (r?.keadaan === 'dilewati') {
    return `<span class="sudah dilewati">
      dilewati<span class="sub">${teks(r.alasan ?? 'tanpa alasan')}</span>
      <button type="button" data-batal="${teks(j.s.kunci)}">batalkan</button>
    </span>`;
  }
  return `<span class="aksi-langkah">
    <button type="button" data-kerja="${teks(j.s.kunci)}">sudah dikerjakan</button>
    <button type="button" data-lewat="${teks(j.s.kunci)}">dilewati</button>
  </span>`;
}

/* ---------------------------------------------------------------------------
 * Penanda panen
 * ---------------------------------------------------------------------------
 * Lubang ini disebut namanya di blok batas D3: "kapan rencana boleh dianggap tertutup"
 * tidak punya jawaban, dan karena itu tidak ada layar yang boleh membandingkan hasil
 * dengan perkiraannya. Yang menahan ternyata BUKAN skema — `Cycle.status` sudah berenum
 * enam sampai `closed`, `Cycle.actual_end` sudah bertanggal, dan `Step.outputs` sudah
 * membawa kuantitas beserta kelas mutunya. Ketiganya ada sejak lama dan tidak satu pun
 * pernah sampai ke permukaan.
 *
 * PANEN ITU DAFTAR, BUKAN TANGGAL. Kosakata operasi sudah memisahkan `panen` dari
 * `panen-bertahap`, dan yang kedua itulah keadaan biasa pada cabai, tomat, dan cabai
 * rawit: dipetik berulang selama berminggu-minggu. Satu medan "tanggal panen" akan
 * memaksa orang memilih petikan mana yang dianggap panen, dan menjumlahkan sisanya dalam
 * ingatan.
 *
 * UANGNYA LEWAT BUKU KAS, BUKAN MEDAN KEDUA. Kalau panen menyimpan rupiahnya sendiri, ia
 * jadi gagasan pemasukan yang kedua — dan dua gagasan pemasukan yang menjumlahkan hal
 * yang sama adalah cara termudah membuat total yang tidak pernah cocok. Jadi uang masuk
 * yang diisi di sini ditulis ke buku kas sebagai "Hasil jual", tertaut ke panennya
 * dengan mekanisme yang sama seperti biaya langkah.
 */
function gambarPanen() {
  const c = catatanMusim();
  const m = musim.aktif();
  const totalKg = c.panen.reduce((a, x) => a + Number(x.kg || 0), 0);
  const uang = c.panen.reduce((a, x) => {
    const t = buku.cariTaut(kunciMusim(), x.kunci);
    return a + (t ? Number(t.n || 0) : 0);
  }, 0);

  el.daftarPanen.innerHTML = !c.panen.length
    ? '<p class="kosong">Belum ada panen tercatat.</p>'
    : `<div class="kartu">
        <h2>${n(totalKg)} kg dari ${n(c.panen.length, 0)} kali panen</h2>
        <dl class="kunci">
          ${m?.luas > 0 ? `<dt>Hasil per hektare</dt><dd>${n(totalKg / m.luas)} kg/ha<span class="sub">dari ${n(m.luas)} ha</span></dd>` : ''}
          ${uang ? `<dt>Sudah terjual</dt><dd>${rupiah(uang)}<span class="sub">${rupiah(uang / totalKg)} per kg yang sudah dipanen</span></dd>` : ''}
        </dl>
        <ul class="jadwal">
          ${c.panen.slice().sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal))).map((x) => {
            const t = buku.cariTaut(kunciMusim(), x.kunci);
            const lag = selisihHari(x.tanggal, x.dicatat);
            return `<li>
              <span class="kapan tgl">${teks(tanggal(x.tanggal) ?? x.tanggal)}</span>
              <span class="apa">${n(x.kg)} kg${x.mutu ? ` — ${teks(x.mutu)}` : ''}
                ${lag > 0 ? `<span class="sub">dicatat ${n(lag, 0)} hari sesudahnya</span>` : ''}
                ${t ? `<span class="sub biaya">${rupiah(t.n)} masuk buku kas${x.kg ? ` — ${rupiah(t.n / x.kg)}/kg` : ''}</span>` : '<span class="sub">belum ada uang masuk yang dicatat untuk petikan ini</span>'}
                <span class="aksi-langkah"><button type="button" data-hapus-panen="${teks(x.kunci)}">hapus</button></span>
              </span></li>`;
          }).join('')}
        </ul>
        ${m?.luas > 0 ? '' : '<p class="catatan">Luas belum diisi, jadi <strong>hasil per hektare</strong> tidak bisa dihitung — dan itu satu-satunya bentuk yang bisa dibandingkan dengan angka siapa pun di luar petak ini.</p>'}
      </div>`;
  gambarTutup(m, totalKg);
}

/* Menutup musim adalah PERISTIWA, bukan medan yang diisi. Ia dipasang di sini, di bawah
 * daftar panen, karena di situlah orang berada saat memutuskannya — bukan di kartu musim
 * di kepala halaman, yang dibuka orang untuk mengganti musim, bukan untuk mengakhirinya. */
function gambarTutup(m, totalKg) {
  if (!m) { el.tutupMusim.innerHTML = ''; return; }
  if (musim.sudahBerakhir(m)) {
    el.tutupMusim.innerHTML = `
      <div class="kartu">
        <h2>Musim ini ${teks(musim.namaStatus(musim.statusMusim(m)).toLowerCase())}</h2>
        <p>Berakhir <strong>${teks(tanggal(m.ditutup) ?? m.ditutup ?? '—')}</strong>${totalKg ? `, dengan ${n(totalKg)} kg tercatat` : ', tanpa panen tercatat'}.
          <a href="usaha.html">Analisis usaha tani</a> sekarang bisa membandingkan hasilnya dengan perkiraan yang kamu susun.</p>
        <p class="catat-aksi"><button type="button" id="bukaLagi">Buka lagi</button></p>
        <p class="catatan">
          Membuka lagi mencabut tanggal berakhirnya juga. Tanggal yang tertinggal pada musim
          yang berjalan membuat yang membaca status melihat musim yang belum selesai dan yang
          membaca tanggal melihat musim yang sudah — dan yang membaca tanggal biasanya mesin.
        </p>
      </div>`;
    return;
  }
  el.tutupMusim.innerHTML = `
    <div class="kartu kartu-catat">
      <h2>Menutup musim ini</h2>
      <p>
        Selama musim belum ditutup, biaya yang sudah keluar selalu lebih kecil daripada
        rencananya — jadi tidak ada layar yang boleh menyimpulkan apa pun dari selisihnya.
        Menutupnya <strong>keputusanmu</strong>, bukan kesimpulan yang ditarik halaman ini
        dari tanggal atau dari jumlah panen.
      </p>
      <div class="catat-baris">
        <span>
          <label for="tmStatus">Berakhir sebagai</label>
          <select id="tmStatus">
            ${musim.STATUS_MUSIM.filter(([k]) => musim.BERAKHIR.includes(k))
              .map(([k, l]) => `<option value="${k}">${teks(l)}</option>`).join('')}
          </select>
        </span>
        <span>
          <label for="tmTanggal">Tanggal berakhir</label>
          <input type="date" id="tmTanggal" value="${teks(hariIni())}">
        </span>
      </div>
      <p class="catat-aksi"><button type="button" id="tmTutup">Tutup musim ini</button></p>
      <p class="catat-kabar" id="tmKabar" role="status" aria-live="polite"></p>
      <p class="catatan">
        <strong>Gagal tercatat tanpa sebab yang bisa dijumlahkan.</strong> Skema siklus
        menyediakan medan alasan kegagalan, tetapi kosakata alasannya belum pernah dibuat —
        tidak ada satu pun berkas untuknya. Sampai ada, "gagal" di sini hanya menandai
        bahwa musimnya gagal, bukan kenapa.
      </p>
    </div>`;
}

function gambarLuar() {
  const c = catatanMusim();
  const lama = el.luarRencana.querySelector('.daftar-luar');
  if (lama) lama.remove();
  if (!c.luar.length) return;
  const d = document.createElement('div');
  d.className = 'kartu daftar-luar';
  d.innerHTML = `
    <h2>${n(c.luar.length, 0)} tindakan di luar rencana</h2>
    <ul class="jadwal">
      ${c.luar.map((x) => `<li>
        <span class="kapan tgl">${teks(tanggal(x.tanggal) ?? x.tanggal)}</span>
        <span class="apa">${teks(x.apa)}
          ${x.alasan ? `<span class="sub">${teks(x.alasan)}</span>` : ''}
          ${selisihHari(x.tanggal, x.dicatat) > 0 ? `<span class="sub">dicatat ${n(selisihHari(x.tanggal, x.dicatat), 0)} hari sesudahnya</span>` : ''}
          ${x.kunci && buku.cariTaut(kunciMusim(), x.kunci) ? `<span class="sub biaya">${rupiah(buku.cariTaut(kunciMusim(), x.kunci).n)} — ${teks(buku.cariTaut(kunciMusim(), x.kunci).k)}, masuk buku kas</span>` : ''}
        </span></li>`).join('')}
    </ul>
    <p class="catatan">
      Tindakan yang berulang di luar rencana adalah <strong>sinyal tentang protokolnya</strong>,
      bukan tentang yang mengerjakannya. Yang menimbangnya peninjau bernama, bukan halaman ini.
    </p>`;
  el.luarRencana.appendChild(d);
}

/* Satu baris yang membuat sambungannya TERLIHAT. Tanpa ini, biaya yang dikirim dari sini
 * menghilang ke halaman lain dan yang mengirimnya tidak punya cara memastikan ia sampai —
 * dan yang tidak bisa dipastikan sampai tidak akan diisi lagi lain kali. */
function gambarRingkasMusim() {
  const m = musim.aktif();
  if (!m) { el.ringkasMusim.innerHTML = ''; el.ringkasMusim.hidden = true; return; }
  const { keluar, cacah } = buku.hitung(m.i);
  const dariSini = buku.perMusim(m.i).filter((c) => c.s === 'rencana');
  el.ringkasMusim.hidden = false;
  el.ringkasMusim.innerHTML = `
    <h2>Biaya musim ini</h2>
    <dl class="kunci">
      <dt>Uang keluar</dt><dd>${rupiah(keluar)}<span class="sub">${n(cacah, 0)} catatan, ${n(dariSini.length, 0)} dari layar ini</span></dd>
      ${m.luas > 0 ? `<dt>Biaya per hektare</dt><dd>${rupiah(keluar / m.luas)}<span class="sub">dari ${n(m.luas)} ha</span></dd>` : ''}
    </dl>
    ${m.luas > 0 ? '' : '<p class="catatan">Luas belum diisi, jadi <strong>biaya per hektare</strong> tidak bisa dihitung — dan itu satuan yang dipakai hampir semua program yang meminta angka biaya usaha tani.</p>'}
    <p class="catatan"><a href="kas.html">Buka buku kas</a> untuk melihat seluruh catatannya, termasuk uang masuk.</p>`;
}

function gambarHasil(p, { jadwal, kebutuhan, takTerjumlah }, luas) {
  const bertanggal = jadwal.filter((j) => j.jenis === 'bertanggal');
  const fase = jadwal.filter((j) => j.jenis === 'fase');
  const syarat = jadwal.filter((j) => j.jenis === 'bersyarat');
  const lain = jadwal.filter((j) => j.jenis === 'tak-bertanggal');

  el.hasil.innerHTML = `
    ${blokPeringatan(p)}
    <div class="kartu">
      <h2>Jadwal — ${n(bertanggal.length, 0)} dari ${n(jadwal.length, 0)} langkah bisa ditanggalkan</h2>
      <ul class="jadwal">
        ${jadwal.map((j) => {
          const r = catatanMusim().langkah[j.s.kunci];
          const aksi = blokAksi(j, r);
          if (j.jenis === 'bertanggal') {
            return `<li><span class="kapan tgl">${teks(tanggal(j.tgl) ?? j.tgl)}</span>
              <span class="apa">${teks(j.s.nama)}${j.jendela ? `<span class="sub">tenggang ${n(j.jendela, 0)} hari</span>` : ''}${aksi}</span></li>`;
          }
          if (j.jenis === 'fase') {
            return `<li><span class="kapan">menunggu fase</span>
              <span class="apa">${teks(j.s.nama)}<span class="sub">${teks(j.fase ?? 'fase tidak disebut')}</span>${aksi}</span></li>`;
          }
          if (j.jenis === 'bersyarat') {
            return `<li><span class="kapan">bila ambang</span>
              <span class="apa">${teks(j.s.nama)}<span class="sub">boleh tidak pernah berjalan sepanjang musim — dan itu hasil yang benar, bukan kepatuhan yang gagal</span>${aksi}</span></li>`;
          }
          return `<li><span class="kapan">tak bertanggal</span>
            <span class="apa">${teks(j.s.nama)}<span class="sub">${teks(j.sebab)}</span>${aksi}</span></li>`;
        }).join('')}
      </ul>
      <p class="catatan">
        <strong>Ini bukan kalender penuh, dan tidak akan jadi kalender penuh.</strong>
        ${fase.length ? `${n(fase.length, 0)} langkah menunggu fase pertumbuhan: entitas fase tidak
          memuat hari, durasi, maupun akumulasi suhu, jadi tanggalnya <strong>tidak ditebak</strong>
          — pengamatan lapangan yang menentukannya, dan itu memang alasan penjadwalan berbasis
          fase dipilih. ` : ''}
        ${syarat.length ? `${n(syarat.length, 0)} langkah dipicu ambang pengamatan. ` : ''}
        ${lain.length ? `${n(lain.length, 0)} langkah tidak bisa ditanggalkan karena sebab lain, disebut di barisnya.` : ''}
      </p>
    </div>

    <div class="kartu">
      <h2>Kebutuhan input</h2>
      ${!luas ? '<p class="kosong">Luas petak belum diisi, jadi tidak ada yang bisa dikalikan.</p>'
        : kebutuhan.size ? `
          <dl class="kunci">
            ${[...kebutuhan].map(([k, v]) => {
              const [nama, satuan] = k.split('|');
              return `<dt>${teks(nama)}</dt><dd>${n(v)} ${teks(satuan.replace('/har', ''))}<span class="sub">untuk ${n(luas)} ha</span></dd>`;
            }).join('')}
          </dl>`
        : '<p class="kosong">Tidak ada dosis berbasis luas pada protokol ini.</p>'}
      ${takTerjumlah.length ? `
        <p class="catatan">
          <strong>Tidak dijumlahkan:</strong>
          ${takTerjumlah.map((t) => `${teks(t.nama)} — basis <code>${teks(t.basis)}</code>`).join('; ')}.
          Dosis konsentrasi butuh tahu berapa kali diaplikasikan semusim, dan protokol tidak
          menyebutnya. Menebaknya berarti mengarang jumlah yang akan dibeli orang.
        </p>` : ''}
      <p class="catatan">
        <strong>Rupiahnya tidak dihitung di sini.</strong> Harga tidak ada di registri sama
        sekali. <a href="jalur-3.html">Jalur 3</a> menghitung rupiah per kilogram hara dari
        harga yang kamu masukkan sendiri, dan <a href="usaha.html">titik impas</a> memakainya
        untuk seluruh anggaran musim.
      </p>
    </div>`;
}

/* Formulir SEBARIS, bukan prompt(). Memilih satu dari sebelas alasan dengan mengetik
 * nomornya di kotak bawaan peramban adalah interaksi yang gagal di ponsel — dan halaman
 * yang di tempat lain menuntut target sentuh 44 px tidak boleh menawarkan itu di sini.
 * Ia juga tidak bisa diberi keterangan: pilihan alasan butuh definisinya terlihat. */
function formRealisasi(kunci, jenis, rencanaTgl, langkah) {
  const taut = buku.cariTaut(kunciMusim(), kunci);
  return `
    <form class="form-realisasi" data-untuk="${teks(kunci)}" onsubmit="return false">
      ${jenis === 'kerja' ? `
        <label>Tanggal dikerjakan
          <input type="date" name="tgl" value="${teks(hariIni())}">
        </label>
        <div class="catat-baris">
          <span>
            <label for="bi-${teks(kunci)}">Biaya (boleh kosong)</label>
            <input type="number" id="bi-${teks(kunci)}" name="biaya" inputmode="numeric" min="0" step="1000"
                   value="${taut ? teks(String(taut.n)) : ''}" placeholder="misal 250000">
          </span>
          <span>
            <label for="bk-${teks(kunci)}">Masuk kategori</label>
            <select id="bk-${teks(kunci)}" name="kategori">
              ${buku.KATEGORI_KELUAR.map((k) => {
                const pilih = taut?.k ?? usulKategori(langkah);
                return `<option value="${teks(k)}"${k === pilih ? ' selected' : ''}>${teks(k)}</option>`;
              }).join('')}
            </select>
          </span>
        </div>
        <p class="catatan">
          Diisi berarti satu catatan masuk ke <a href="kas.html">buku kas</a> musim ini —
          tidak perlu diketik dua kali. Dikosongkan berarti langkahnya tetap tercatat
          dikerjakan, tanpa biaya.
        </p>` : ''}
      <label class="alasan-medan" hidden>Alasannya
        <select name="alasan">
          ${alasan.map((a) => `<option value="${teks(a.nama)}">${teks(a.nama)}</option>`).join('')}
        </select>
      </label>
      <p class="alasan-sebab" hidden></p>
      <span class="aksi-langkah">
        <button type="button" data-simpan="${teks(kunci)}" data-jenis="${teks(jenis)}"
                data-rencana="${teks(rencanaTgl ?? '')}">Simpan</button>
        <button type="button" data-tutup="1">Batal</button>
      </span>
    </form>`;
}

function ulangGambar() {
  el.susun.click();
}

/* Alasan diminta HANYA saat memang ada simpangan — dilewati, atau bergeser di luar
 * tenggangnya. L8 menuntutnya di sana ("simpangan tanpa alasan tidak bisa dipakai
 * memperbaiki protokol"), dan menuntutnya juga saat tepat waktu cuma melatih orang
 * memilih pilihan pertama sampai medannya kehilangan arti. */
function perbaruiAlasan(form) {
  const jenis = form.querySelector('[data-simpan]').dataset.jenis;
  const rencanaTgl = form.querySelector('[data-simpan]').dataset.rencana || null;
  const medan = form.querySelector('.alasan-medan');
  const sebab = form.querySelector('.alasan-sebab');
  if (jenis === 'lewat') {
    medan.hidden = false;
    sebab.hidden = false;
    sebab.textContent = 'Langkah yang dilewati selalu menuntut alasan — itu yang membedakan simpangan yang bisa dipakai memperbaiki protokol dari yang cuma hilang.';
    return true;
  }
  const tgl = form.querySelector('[name="tgl"]')?.value;
  if (!rencanaTgl || !tgl) { medan.hidden = true; sebab.hidden = true; return false; }
  const geser = selisihHari(rencanaTgl, tgl);
  const jendela = Number(form.dataset.jendela ?? 0);
  const perlu = Math.abs(geser) > jendela;
  medan.hidden = !perlu;
  sebab.hidden = !perlu;
  if (perlu) {
    sebab.textContent = `Bergeser ${Math.abs(geser)} hari ${geser > 0 ? 'lebih lambat' : 'lebih cepat'} dari rencana${jendela ? ` (tenggang ${jendela} hari)` : ''}. Simpangan sebesar ini menuntut alasan.`;
  }
  return perlu;
}

el.hasil.addEventListener('input', (ev) => {
  const f = ev.target.closest('.form-realisasi');
  if (f) perbaruiAlasan(f);
});

el.hasil.addEventListener('click', (ev) => {
  const kerja = ev.target.closest('button[data-kerja]');
  const lewat = ev.target.closest('button[data-lewat]');
  const batal = ev.target.closest('button[data-batal]');
  const simpan = ev.target.closest('button[data-simpan]');
  const tutup = ev.target.closest('button[data-tutup]');
  const c = catatanMusim();

  if (tutup) { tutup.closest('.form-realisasi').remove(); return; }
  if (batal) {
    // Biayanya ikut dicabut. Membiarkannya berarti buku kas memuat biaya untuk langkah
    // yang menurut layar ini tidak pernah dikerjakan — dan selisih senyap di buku kas
    // tidak terlihat sampai totalnya dipakai.
    delete c.langkah[batal.dataset.batal];
    buku.hapusTaut(kunciMusim(), batal.dataset.batal);
    tulisRealisasi();
    ulangGambar();
    return;
  }

  if (kerja || lewat) {
    const b = kerja ?? lewat;
    const kunci = b.dataset.kerja ?? b.dataset.lewat;
    const jadwal = susunRencana(rinci, { tanam: el.tanam.value, semai: el.semai.value || null, luas: null }).jadwal;
    const j = jadwal.find((x) => x.s.kunci === kunci);
    const wadah = b.closest('.apa');
    wadah.querySelector('.form-realisasi')?.remove();
    wadah.insertAdjacentHTML('beforeend', formRealisasi(kunci, kerja ? 'kerja' : 'lewat', j?.tgl ?? null, j?.s));
    const f = wadah.querySelector('.form-realisasi');
    f.dataset.jendela = String(j?.jendela ?? 0);
    perbaruiAlasan(f);
    f.querySelector('input, select')?.focus();
    return;
  }

  if (!simpan) return;
  const f = simpan.closest('.form-realisasi');
  const kunci = simpan.dataset.simpan;
  const j = (rinci?.langkah ?? []).find((x) => x.kunci === kunci);
  const perlu = perbaruiAlasan(f);
  const alasanNilai = perlu ? f.querySelector('[name="alasan"]').value : null;
  if (simpan.dataset.jenis === 'lewat') {
    c.langkah[kunci] = { keadaan: 'dilewati', alasan: alasanNilai, dicatat: hariIni() };
  } else {
    const tgl = f.querySelector('[name="tgl"]').value;
    if (!tgl) return;
    c.langkah[kunci] = { keadaan: 'dikerjakan', tanggal: tgl, alasan: alasanNilai, dicatat: hariIni() };
    // Satu langkah menimbulkan PALING BANYAK satu catatan biaya: yang lama dicabut lebih
    // dulu, supaya mengoreksi tanggal tidak menggandakan biayanya di buku.
    buku.hapusTaut(kunciMusim(), kunci);
    const biaya = Number(f.querySelector('[name="biaya"]')?.value);
    if (Number.isFinite(biaya) && biaya > 0) {
      buku.tambah({
        m: kunciMusim(),
        t: tgl,
        a: 'keluar',
        k: f.querySelector('[name="kategori"]').value,
        n: biaya,
        c: j?.nama ?? kunci,
        s: 'rencana',
        l: kunci,
      });
    }
  }
  tulisRealisasi();
  ulangGambar();
});

el.lrTambah.addEventListener('click', () => {
  const apa = el.lrApa.value.trim();
  if (!apa) { el.lrKabar.textContent = 'Tulis dulu apa yang dikerjakan.'; el.lrApa.focus(); return; }
  const c = catatanMusim();
  const tgl = el.lrTanggal.value || hariIni();
  const kunciLuar = `luar:${Date.now()}`;
  c.luar.push({
    apa,
    tanggal: tgl,
    alasan: el.lrAlasan.value || null,
    dicatat: hariIni(),
    kunci: kunciLuar,
  });
  const biayaLuar = Number(el.lrBiaya.value);
  if (Number.isFinite(biayaLuar) && biayaLuar > 0) {
    buku.tambah({ m: kunciMusim(), t: tgl, a: 'keluar', k: el.lrKategori.value, n: biayaLuar, c: apa, s: 'rencana', l: kunciLuar });
  }
  const ok = tulisRealisasi();
  el.lrApa.value = '';
  el.lrBiaya.value = '';
  el.lrKabar.textContent = ok
    ? 'Tercatat. Tindakan di luar rencana adalah temuan — kalau ia berulang, protokolnya yang perlu ditinjau.'
    : 'Tercatat, tetapi TIDAK tersimpan — peramban menolak menyimpan.';
  ulangGambar();
});

el.pnTambah.addEventListener('click', () => {
  const kg = Number(el.pnJumlah.value);
  if (!Number.isFinite(kg) || kg <= 0) {
    el.pnKabar.textContent = 'Isi berapa kilogramnya — itu satu-satunya yang wajib.';
    el.pnJumlah.focus();
    return;
  }
  const c = catatanMusim();
  const tgl = el.pnTanggal.value || hariIni();
  const kunci = `panen:${Date.now()}`;
  c.panen.push({ kg, tanggal: tgl, mutu: el.pnMutu.value.trim() || null, dicatat: hariIni(), kunci });
  const uang = Number(el.pnUang.value);
  if (Number.isFinite(uang) && uang > 0) {
    buku.tambah({ m: kunciMusim(), t: tgl, a: 'masuk', k: 'Hasil jual', n: uang, c: `Panen ${n(kg)} kg`, s: 'rencana', l: kunci });
  }
  const ok = tulisRealisasi();
  el.pnJumlah.value = ''; el.pnMutu.value = ''; el.pnUang.value = '';
  el.pnKabar.textContent = ok
    ? 'Tercatat. Panen berikutnya dicatat sebagai baris sendiri — bukan menimpa yang ini.'
    : 'Tercatat, tetapi TIDAK tersimpan — peramban menolak menyimpan.';
  ulangGambar();
});

el.daftarPanen.addEventListener('click', (ev) => {
  const b = ev.target.closest('button[data-hapus-panen]');
  if (!b) return;
  const c = catatanMusim();
  c.panen = c.panen.filter((x) => x.kunci !== b.dataset.hapusPanen);
  // Uang masuknya ikut dicabut, alasan yang sama seperti biaya langkah: pemasukan yang
  // tertinggal untuk panen yang tidak ada membuat harga per kilogram naik tanpa sebab.
  buku.hapusTaut(kunciMusim(), b.dataset.hapusPanen);
  tulisRealisasi();
  ulangGambar();
});

el.tutupMusim.addEventListener('click', (ev) => {
  if (ev.target.id === 'bukaLagi') {
    musim.bukaLagi(kunciMusim());
    gambarKartuMusim();
    ulangGambar();
    return;
  }
  if (ev.target.id !== 'tmTutup') return;
  const hasil = musim.tutup(kunciMusim(), el.tutupMusim.querySelector('#tmStatus').value, el.tutupMusim.querySelector('#tmTanggal').value);
  const kabar = el.tutupMusim.querySelector('#tmKabar');
  if (!hasil.ok) { kabar.textContent = `Belum bisa ditutup: ${hasil.sebab}.`; return; }
  // Kartu musim ikut digambar ulang: keadaan berakhir muncul di baris ringkasnya, dan
  // kartu yang masih menyebut musim berjalan sesudah orang menutupnya adalah kartu yang
  // membuat orang menekan tombolnya dua kali.
  gambarKartuMusim();
  ulangGambar();
});

el.protokol.addEventListener('change', async () => {
  rinci = null;
  el.hasil.innerHTML = '';
  const k = el.protokol.value;
  const p = daftar.find((x) => x.key === k);
  el.tentangProtokol.innerHTML = p
    ? `${teks(p.komoditas ?? '')} · ${n(p.langkah, 0)} langkah, ${n(p.bertanggal, 0)} bisa ditanggalkan
       · tingkat bukti ${teks(p.tingkat ?? '—')} · status ${teks(p.status ?? '—')}`
    : '';
});

el.susun.addEventListener('click', async () => {
  const k = el.protokol.value;
  if (!k) { el.kabar.textContent = 'Pilih protokolnya dulu.'; return; }
  if (!el.tanam.value) { el.kabar.textContent = 'Isi tanggal pindah tanam — tanpa itu tidak ada yang bisa ditanggalkan.'; el.tanam.focus(); return; }
  // Musim wajib ADA sebelum ada yang dicatat, dengan alasan yang sama seperti di buku kas:
  // catatan tanpa musim tidak bisa dijumlahkan, dan tidak bisa dipindahkan ke musim mana
  // pun sesudahnya tanpa menebak. Yang tidak wajib: mengisinya lengkap.
  if (!kunciMusim()) {
    el.kabar.textContent = 'Beri nama musimnya dulu di atas — sekali saja, lalu rencana dan biayanya ikut ke sana.';
    const d = el.kartuMusim.querySelector('.atur-musim');
    if (d) d.open = true;
    el.kartuMusim.querySelector('#mNama')?.focus();
    return;
  }
  el.kabar.textContent = 'Menyusun…';
  try {
    if (!rinci || rinci.key !== k) rinci = await ambil(`protokol/${k}`);
    const luasNum = Number(el.luas.value);
    const luas = Number.isFinite(luasNum) && luasNum > 0 ? luasNum : null;
    // Ditambal, bukan ditimpa: layar ini tahu protokol dan tanggal tanam, buku kas tahu
    // komoditas dan luas. Yang satu tidak boleh menghapus isian yang lain.
    musim.perbarui(kunciMusim(), { protokol: k, tanam: el.tanam.value, ...(luas ? { luas } : {}) });
    gambarHasil(rinci, susunRencana(rinci, { tanam: el.tanam.value, semai: el.semai.value || null, luas }), luas);
    gambarRingkasMusim();
    gambarLuar();
    gambarPanen();
    el.luarRencana.hidden = false;
    el.bagianPanen.hidden = false;
    el.pnTanggal.value = el.pnTanggal.value || hariIni();
    el.kabar.textContent = '';
  } catch (e) {
    el.kabar.textContent = '';
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Protokolnya gagal diambil</h2>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
});

(async function mulai() {
  try {
    await muatMeta();
    [daftar, alasan] = await Promise.all([
      ambil('protokol'),
      ambil('alasan-simpangan').catch(() => []),
    ]);
    realisasi = bacaRealisasi();
    const dipindah = pindahkanKunciLama();
    el.lrTanggal.value = hariIni();
    el.lrKategori.innerHTML = buku.KATEGORI_KELUAR.map((x) =>
      `<option value="${teks(x)}">${teks(x)}</option>`).join('');
    el.lrAlasan.innerHTML = alasan.map((a) =>
      `<option value="${teks(a.nama)}">${teks(a.nama)}</option>`).join('');
    el.protokol.innerHTML = daftar.map((p) =>
      `<option value="${teks(p.key)}">${teks(p.nama)}</option>`).join('');
    el.protokol.dispatchEvent(new Event('change'));
    // Cacah 1 disebut, bukan disembunyikan. Daftar pilihan berisi satu tanpa keterangan
    // terbaca sebagai "yang lain menyusul"; yang perlu dibaca justru bahwa memang baru ada
    // satu, dan menaruh harapan pada jalur ini berarti menaruhnya pada satu protokol draft.
    if (daftar.length <= 1) {
      el.tentangProtokol.innerHTML += `<br><strong>Baru ada ${n(daftar.length, 0)} protokol di
        seluruh kosakata.</strong> Menyusun protokol adalah pekerjaan agronomi bernama, bukan
        pekerjaan indeks — alurnya dibuka di <a href="${teks('../CONTRIBUTING.md')}">CONTRIBUTING.md</a>.`;
    }
    el.tanam.value = new Date().toISOString().slice(0, 10);

    /* Memilih musim mengisi ulang layar dari apa yang musim itu sudah tahu. Yang membuka
     * halaman ini di tengah musim tidak sedang menyusun rencana baru — ia mau melihat
     * rencana yang sudah disusunnya, dan mengetik ulang protokol serta tanggal tanam tiap
     * kali adalah cara tercepat membuat orang berhenti memakainya. */
    const isiDariMusim = (m) => {
      if (!m) return;
      if (m.protokol && daftar.some((x) => x.key === m.protokol)) {
        el.protokol.value = m.protokol;
        el.protokol.dispatchEvent(new Event('change'));
      }
      if (m.tanam) el.tanam.value = m.tanam;
      if (m.luas > 0) el.luas.value = m.luas;
      el.hasil.innerHTML = '';
      el.luarRencana.hidden = true;
      el.bagianPanen.hidden = true;
      gambarRingkasMusim();
    };
    gambarKartuMusim = musim.pasangMusim(el.kartuMusim, { onGanti: isiDariMusim });
    isiDariMusim(musim.aktif());
    if (dipindah) {
      el.kabar.textContent = `${n(dipindah, 0)} catatan realisasi lama dipindahkan ke musim `
        + 'bernama, dan sekarang satu musim dengan buku kas. Tidak ada yang hilang.';
    }

    pasangBatas(el.batas, {
      sumber: ['protokol'],
      takDijawab: ['rencanaBukanKalender', 'arusKasMusim', 'harga', {
        judul: 'Petak ini belum bisa disandingkan dengan petak siapa pun',
        teks:
          'Realisasi dan biaya di sini sekarang satu musim dengan buku kas, dan musim itu menyebut '
          + 'petaknya. Yang masih tidak bisa dilakukan: menyandingkan petak ini dengan petak petani '
          + 'lain. Skema petak mewajibkan pemegang — artinya menyebut nama orang — dan sidik petak '
          + 'menolak apa pun yang lebih kasar daripada poligon, karena satu titik presisi lima '
          + 'desimal di dalam satu kabupaten habis ditebak dalam 0,08 detik dan sidiknya jadi '
          + 'penunjuk lokasi, bukan penjagaan. Lapisan ini tidak meminta keduanya. Cukup untuk '
          + 'menyambungkan layar satu sama lain, tidak cukup untuk menyambungkan petani satu sama '
          + 'lain. Dan seperti buku kas, peramban boleh menghapus catatan ini tanpa memberitahu.',
      }, {
        judul: 'Kegagalan musim tercatat tanpa sebab yang bisa dijumlahkan',
        teks:
          'Skema siklus menyediakan medan alasan kegagalan, dan medan itu menunjuk kosakata — '
          + 'tetapi kosakata alasan kegagalan siklus BELUM PERNAH DIBUAT: tidak ada satu pun '
          + 'berkas untuknya. Jadi "gagal" di layar ini menandai bahwa musimnya gagal, bukan '
          + 'kenapa, dan sepuluh musim gagal karena sepuluh sebab berbeda terbaca sama. '
          + 'Pemeriksa menyebutnya peringatan, bukan kegagalan, justru karena menuntut rujukan '
          + 'ke sesuatu yang tidak bisa dirujuk siapa pun bukan tuntutan yang adil.',
      }, {
        judul: 'Catatan di sini tidak bisa keluar sebagai dokumen spesifikasi',
        teks:
          'Panen yang kamu catat memetakan lurus ke `Step.outputs` — kuantitas dan kelas mutu — '
          + 'dan musimnya ke `Cycle` beserta statusnya. Tetapi tidak ada satu pun jalan keluar '
          + 'yang menghasilkan dokumen berbentuk itu: yang tersimpan bentuk layar ini sendiri, '
          + 'di peramban ini saja. Yang mau menyerahkan catatannya ke lembaga, koperasi, atau '
          + 'pembeli tidak bisa melakukannya dari sini, dan membuat jalan keluarnya menuntut '
          + 'keputusan yang belum diambil: siapa penerimanya, dan atas nama siapa ia ditandatangani.',
      }, {
        judul: 'Upah, jam kerja, dan luas yang benar-benar dikerjakan',
        teks:
          'Skema langkah punya medan `labor` (jam-orang, jumlah orang, sumber tenaga) dan '
          + '`area_covered` — luas yang benar-benar dikerjakan, yang kerap berbeda dari luas petak. '
          + 'Keduanya tidak diminta di sini. Yang diminta baru satu angka biaya, dan satu angka '
          + 'biaya tidak bisa dipecah jadi upah dan bahan sesudahnya. Menambahkan medannya murah; '
          + 'yang mahal memintanya pada tiap langkah, dan tiap medan wajib tambahan adalah alasan '
          + 'berhenti mencatat.',
      }],
    });
  } catch (e) {
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Indeks tidak terambil</h2>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
})();
