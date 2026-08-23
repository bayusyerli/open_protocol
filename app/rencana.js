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
for (const id of ['protokol', 'tentangProtokol', 'tanam', 'semai', 'luas', 'susun', 'kabar', 'hasil'])
  el[id] = document.getElementById(id);
el.batas = document.getElementById('batasJawaban');

const n = (x, d = 2) => Number(x ?? 0).toLocaleString('id-ID', { maximumFractionDigits: d });

let daftar = [];
let rinci = null;

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
          if (j.jenis === 'bertanggal') {
            return `<li><span class="kapan tgl">${teks(tanggal(j.tgl) ?? j.tgl)}</span>
              <span class="apa">${teks(j.s.nama)}${j.jendela ? `<span class="sub">tenggang ${n(j.jendela, 0)} hari</span>` : ''}</span></li>`;
          }
          if (j.jenis === 'fase') {
            return `<li><span class="kapan">menunggu fase</span>
              <span class="apa">${teks(j.s.nama)}<span class="sub">${teks(j.fase ?? 'fase tidak disebut')}</span></span></li>`;
          }
          if (j.jenis === 'bersyarat') {
            return `<li><span class="kapan">bila ambang</span>
              <span class="apa">${teks(j.s.nama)}<span class="sub">boleh tidak pernah berjalan sepanjang musim — dan itu hasil yang benar, bukan kepatuhan yang gagal</span></span></li>`;
          }
          return `<li><span class="kapan">tak bertanggal</span>
            <span class="apa">${teks(j.s.nama)}<span class="sub">${teks(j.sebab)}</span></span></li>`;
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
    gambarHasil(rinci, susunRencana(rinci, { tanam: el.tanam.value, semai: el.semai.value || null, luas }), luas);
    el.kabar.textContent = '';
    el.hasil.scrollIntoView({ block: 'start' });
  } catch (e) {
    el.kabar.textContent = '';
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Protokolnya gagal diambil</h2>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
});

(async function mulai() {
  try {
    await muatMeta();
    daftar = await ambil('protokol');
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
      takDijawab: ['rencanaBukanKalender', 'arusKasMusim', 'harga'],
    });
  } catch (e) {
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Indeks tidak terambil</h2>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
})();
