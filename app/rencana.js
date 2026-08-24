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

pasangTombolTema();
document.getElementById('tanpaJs')?.remove();

const el = {};
for (const id of ['protokol', 'tentangProtokol', 'tanam', 'semai', 'luas', 'susun', 'kabar', 'hasil',
  'luarRencana', 'lrTanggal', 'lrAlasan', 'lrApa', 'lrTambah', 'lrKabar'])
  el[id] = document.getElementById(id);
el.batas = document.getElementById('batasJawaban');

const n = (x, d = 2) => Number(x ?? 0).toLocaleString('id-ID', { maximumFractionDigits: d });

let daftar = [];
let rinci = null;
let alasan = [];
let kunciMusim = null;

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
 * Realisasi tersimpan di peranti, dengan peringatan yang sama seperti buku kas: peramban
 * boleh menghapusnya. Ia BELUM tersambung ke musim di buku kas — musim di sana hanya nama
 * yang diketik, dan menyambungkannya menuntut identitas petak yang belum ada di permukaan.
 * Itu disebutkan di layar alih-alih dibiarkan tampak sudah tersambung. */
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
const catatanMusim = () => (realisasi[kunciMusim] ??= { langkah: {}, luar: [] });

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

/* Keadaan satu langkah, dan hanya tiga: belum, dikerjakan, dilewati. Skala yang lebih
 * halus ("sebagian", "tertunda") menggoda dan menyesatkan — yang menentukan bagi protokol
 * cuma apakah ia terjadi, dan kalau tidak, kenapa. */
function blokAksi(j, r) {
  if (r?.keadaan === 'dikerjakan') {
    const lag = r.dicatat && r.tanggal ? selisihHari(r.tanggal, r.dicatat) : 0;
    const geser = j.jenis === 'bertanggal' && j.tgl ? selisihHari(j.tgl, r.tanggal) : null;
    return `<span class="sudah">
      dikerjakan ${teks(tanggal(r.tanggal) ?? r.tanggal)}
      ${geser ? `<span class="sub">${Math.abs(geser)} hari ${geser > 0 ? 'lebih lambat' : 'lebih cepat'} dari rencana${r.alasan ? ` — ${teks(r.alasan)}` : ''}</span>` : ''}
      ${lag > 0 ? `<span class="sub">dicatat ${n(lag, 0)} hari sesudahnya</span>` : ''}
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
        </span></li>`).join('')}
    </ul>
    <p class="catatan">
      Tindakan yang berulang di luar rencana adalah <strong>sinyal tentang protokolnya</strong>,
      bukan tentang yang mengerjakannya. Yang menimbangnya peninjau bernama, bukan halaman ini.
    </p>`;
  el.luarRencana.appendChild(d);
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
function formRealisasi(kunci, jenis, rencanaTgl) {
  return `
    <form class="form-realisasi" data-untuk="${teks(kunci)}" onsubmit="return false">
      ${jenis === 'kerja' ? `
        <label>Tanggal dikerjakan
          <input type="date" name="tgl" value="${teks(hariIni())}">
        </label>` : ''}
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
  if (batal) { delete c.langkah[batal.dataset.batal]; tulisRealisasi(); ulangGambar(); return; }

  if (kerja || lewat) {
    const b = kerja ?? lewat;
    const kunci = b.dataset.kerja ?? b.dataset.lewat;
    const jadwal = susunRencana(rinci, { tanam: el.tanam.value, semai: el.semai.value || null, luas: null }).jadwal;
    const j = jadwal.find((x) => x.s.kunci === kunci);
    const wadah = b.closest('.apa');
    wadah.querySelector('.form-realisasi')?.remove();
    wadah.insertAdjacentHTML('beforeend', formRealisasi(kunci, kerja ? 'kerja' : 'lewat', j?.tgl ?? null));
    const f = wadah.querySelector('.form-realisasi');
    f.dataset.jendela = String(j?.jendela ?? 0);
    perbaruiAlasan(f);
    f.querySelector('input, select')?.focus();
    return;
  }

  if (!simpan) return;
  const f = simpan.closest('.form-realisasi');
  const kunci = simpan.dataset.simpan;
  const perlu = perbaruiAlasan(f);
  const alasanNilai = perlu ? f.querySelector('[name="alasan"]').value : null;
  if (simpan.dataset.jenis === 'lewat') {
    c.langkah[kunci] = { keadaan: 'dilewati', alasan: alasanNilai, dicatat: hariIni() };
  } else {
    const tgl = f.querySelector('[name="tgl"]').value;
    if (!tgl) return;
    c.langkah[kunci] = { keadaan: 'dikerjakan', tanggal: tgl, alasan: alasanNilai, dicatat: hariIni() };
  }
  tulisRealisasi();
  ulangGambar();
});

el.lrTambah.addEventListener('click', () => {
  const apa = el.lrApa.value.trim();
  if (!apa) { el.lrKabar.textContent = 'Tulis dulu apa yang dikerjakan.'; el.lrApa.focus(); return; }
  const c = catatanMusim();
  c.luar.push({
    apa,
    tanggal: el.lrTanggal.value || hariIni(),
    alasan: el.lrAlasan.value || null,
    dicatat: hariIni(),
  });
  const ok = tulisRealisasi();
  el.lrApa.value = '';
  el.lrKabar.textContent = ok
    ? 'Tercatat. Tindakan di luar rencana adalah temuan — kalau ia berulang, protokolnya yang perlu ditinjau.'
    : 'Tercatat, tetapi TIDAK tersimpan — peramban menolak menyimpan.';
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
  el.kabar.textContent = 'Menyusun…';
  try {
    if (!rinci || rinci.key !== k) rinci = await ambil(`protokol/${k}`);
    const luasNum = Number(el.luas.value);
    const luas = Number.isFinite(luasNum) && luasNum > 0 ? luasNum : null;
    kunciMusim = `${k}|${el.tanam.value}`;
    gambarHasil(rinci, susunRencana(rinci, { tanam: el.tanam.value, semai: el.semai.value || null, luas }), luas);
    gambarLuar();
    el.luarRencana.hidden = false;
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
    el.lrTanggal.value = hariIni();
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

    pasangBatas(el.batas, {
      sumber: ['protokol'],
      takDijawab: ['rencanaBukanKalender', 'arusKasMusim', 'harga', {
        judul: 'Sambungan ke buku kas dan ke petak',
        teks:
          'Realisasi yang dicatat di sini tersimpan di peranti dan BELUM tersambung ke musim di '
          + 'buku kas maupun ke identitas petak. Musim di buku kas hanya nama yang diketik, dan '
          + 'identitas petak belum ada di permukaan sama sekali — menyambungkannya sekarang berarti '
          + 'menjanjikan kaitan yang tidak bisa ditelusuri. Dan seperti buku kas, peramban boleh '
          + 'menghapus catatan ini tanpa memberitahu.',
      }],
    });
  } catch (e) {
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Indeks tidak terambil</h2>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
})();
