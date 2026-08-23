/* E5 — buku kas per petak.
 *
 * SATU JAWABAN LAPANGAN MENGUBAH SELURUH RANCANGANNYA. docs/15 semula menduga buku kas
 * sudah ada dalam bentuk apa pun sehingga E5 tinggal memindahkan bentuknya. Jawaban yang
 * datang membatalkannya: "kalaupun ada dalam bentuk buku kertas. Umumnya petani kecil
 * mengandalkan ingatan saja." Jadi ini KEBIASAAN BARU, bukan pemindahan — dan dokumen itu
 * menutupnya dengan kalimat yang jadi brief berkas ini: "ingin tahu untungnya berapa tidak
 * sama dengan mau mencatat, dan JARAK ANTARA KEDUANYA yang harus dirancang, bukan
 * diasumsikan hilang."
 *
 * Tiga hal yang mempersempit jarak itu, dan ketiganya membatasi apa yang boleh dibangun:
 *
 *   1. Jawabannya di ATAS, bukan di akhir musim. Yang membuat orang mencatat catatan
 *      kedua adalah melihat hasil catatan pertama. Ringkasan karena itu diperbarui tiap
 *      penambahan, bukan disembunyikan di balik tombol "hitung".
 *   2. Satu catatan tiga medan. Tanggal terisi sendiri hari ini, kategori punya bawaan,
 *      dan hanya JUMLAH yang wajib. Tiap medan wajib tambahan adalah alasan berhenti.
 *   3. Tanpa akun, tanpa masuk, tanpa kirim. Bukan cuma karena aturan lapisan gratis —
 *      pendaftaran di depan catatan pertama membunuh kebiasaan sebelum ia lahir.
 *
 * BAHAYA UTAMANYA BUKAN RUANG, MELAINKAN KETAHANAN — DAN ITU DIUKUR.
 * Kuota penyimpanan 4.180 MB sementara satu musim penuh (200 catatan) cuma 14,5 KB, jadi
 * ruang tidak pernah jadi soal. Yang jadi soal: `navigator.storage.persist()` menjawab
 * FALSE pada kunjungan biasa — peramban MENOLAK menjanjikan catatan ini tidak dihapusnya.
 * Petani yang mencatat semusim lalu kehilangannya lebih buruk keadaannya daripada yang
 * memakai kertas, dan halaman yang tidak mengatakannya sedang menjual janji yang bukan
 * miliknya untuk dijanjikan.
 *
 * Karena itu tiga hal: keadaan penyimpanan dinyatakan apa adanya di layar, izin permanen
 * tetap diminta (peluangnya naik kalau aplikasinya dipasang lewat A5), dan "bawa keluar"
 * bukan fitur tambahan melainkan bagian yang didorong — dengan pengingat yang muncul
 * sendiri begitu catatannya cukup banyak untuk sakit kalau hilang.
 */

import { teks } from './pustaka.js';
import { pasangBatas } from './batas.js';
import { pasangTombolTema } from './tema.js';
import { salin } from './serah.js';

pasangTombolTema();
document.getElementById('tanpaJs')?.remove();

const el = {};
for (const id of ['ringkas', 'tanggal', 'arah', 'kategori', 'jumlah', 'catatan', 'tambah',
  'kabar', 'daftar', 'peringatanSimpan', 'kabarBawa', 'pratinjau', 'hapusSemua'])
  el[id] = document.getElementById(id);
el.batas = document.getElementById('batasJawaban');
el.bawa = document.querySelector('.kartu-bawa');

const KUNCI = 'op:kas';
const rupiah = (x) => 'Rp ' + Math.round(x).toLocaleString('id-ID');
const n = (x) => Number(x ?? 0).toLocaleString('id-ID');

/* Kategori yang sama dengan D3, dan itu disengaja. Yang sudah menyusun rencana anggaran
 * di sana tidak memulai dari buku kosong di sini — ia mengisi kategori yang sudah ia
 * pikirkan. Jarak antara "ingin tahu" dan "mau mencatat" sebagian dipersempit dengan
 * tidak menyuruh orang memikirkan ulang hal yang sudah dipikirkannya. */
const KATEGORI_KELUAR = [
  'Benih atau bibit', 'Pupuk', 'Pestisida', 'Tenaga kerja — olah tanah',
  'Tenaga kerja — tanam', 'Tenaga kerja — pemeliharaan', 'Tenaga kerja — panen',
  'Sewa lahan', 'Sewa alat', 'Mulsa & ajir', 'Pengairan', 'Angkut & kemas', 'Lainnya',
];
const KATEGORI_MASUK = ['Hasil jual', 'Hasil jual — sortiran', 'Bantuan atau subsidi', 'Lainnya'];

let catatan = [];

// ---------------------------------------------------------------------------
// Simpanan
// ---------------------------------------------------------------------------
// Gagal menulis TIDAK boleh diam. Mode privat menolak localStorage, dan pemakai yang
// mengira catatannya tersimpan padahal tidak adalah keadaan terburuk yang bisa dihasilkan
// halaman ini — lebih buruk daripada tidak menawarkan penyimpanan sama sekali.
let simpananHidup = true;

function baca() {
  try {
    const m = JSON.parse(localStorage.getItem(KUNCI) ?? '[]');
    return Array.isArray(m) ? m : [];
  } catch { simpananHidup = false; return []; }
}

function tulis() {
  try {
    localStorage.setItem(KUNCI, JSON.stringify(catatan));
    return true;
  } catch {
    simpananHidup = false;
    gambarPeringatan();
    return false;
  }
}

async function gambarPeringatan() {
  let permanen = null;
  try {
    if (navigator.storage?.persisted) {
      permanen = await navigator.storage.persisted();
      if (!permanen && navigator.storage.persist) permanen = await navigator.storage.persist();
    }
  } catch { /* peramban lama; keadaannya tetap "tidak dijanjikan" */ }

  if (!simpananHidup) {
    el.peringatanSimpan.innerHTML = `<strong>Catatanmu TIDAK tersimpan.</strong> Peramban ini
      menolak menyimpan apa pun — biasanya karena mode privat. Yang kamu ketik hilang begitu
      halaman ditutup, jadi bawa keluar sekarang juga kalau ingin menyimpannya.`;
    el.peringatanSimpan.hidden = false;
    return;
  }
  // Angkanya disebut, bukan disamarkan jadi "mungkin hilang". Yang membaca berhak tahu
  // bahwa yang menolak menjamin bukan halaman ini melainkan peramballnya.
  el.peringatanSimpan.innerHTML = permanen
    ? `Catatanmu tersimpan di perangkat ini, dan peramban sudah <strong>menyetujui</strong>
       untuk tidak menghapusnya sendiri. Tetap bawa keluar sesekali — persetujuan itu tidak
       berlaku kalau kamu mengganti peranti atau membersihkan data situs.`
    : `<strong>Peramban menolak menjanjikan catatan ini bertahan.</strong> Ia tersimpan di
       perangkat ini dan biasanya bertahan, tetapi bisa dihapus tanpa memberitahu — saat
       ruang menipis, saat data situs dibersihkan, atau saat kamu ganti peranti. Kami sudah
       meminta izin permanen dan ditolak; peluangnya naik kalau halaman ini
       <strong>dipasang sebagai aplikasi</strong>. Sampai itu: <strong>bawa keluar
       sesekali.</strong>`;
  el.peringatanSimpan.hidden = false;
}

// ---------------------------------------------------------------------------
// Gambar
// ---------------------------------------------------------------------------
function isiKategori() {
  const daftar = el.arah.value === 'masuk' ? KATEGORI_MASUK : KATEGORI_KELUAR;
  el.kategori.innerHTML = daftar.map((k) => `<option value="${teks(k)}">${teks(k)}</option>`).join('');
}

function hitung() {
  const keluar = catatan.filter((c) => c.a === 'keluar').reduce((a, c) => a + c.n, 0);
  const masuk = catatan.filter((c) => c.a === 'masuk').reduce((a, c) => a + c.n, 0);
  return { keluar, masuk, selisih: masuk - keluar };
}

function gambarRingkas() {
  const { keluar, masuk, selisih } = hitung();
  if (!catatan.length) {
    el.ringkas.innerHTML = `
      <h2>Belum ada catatan</h2>
      <p>Tambahkan satu di bawah. Angka di sini berubah seketika — itu seluruh gunanya.</p>`;
    return;
  }
  // "Untung" hanya disebut kalau memang ada uang masuk. Selisih dari nol pemasukan bukan
  // rugi; ia biaya yang belum berhasil — dan menyebutnya rugi di tengah musim keliru.
  const adaMasuk = masuk > 0;
  el.ringkas.innerHTML = `
    <h2>${adaMasuk ? (selisih >= 0 ? 'Untung sejauh ini' : 'Masih di bawah biaya') : 'Biaya sejauh ini'}</h2>
    <p class="angka-besar">${adaMasuk ? rupiah(Math.abs(selisih)) : rupiah(keluar)}</p>
    <dl class="kunci">
      <dt>Uang keluar</dt><dd>${rupiah(keluar)}</dd>
      <dt>Uang masuk</dt><dd>${adaMasuk ? rupiah(masuk) : '<span class="kosong">belum ada</span>'}</dd>
      <dt>Catatan</dt><dd>${n(catatan.length)}</dd>
    </dl>
    ${adaMasuk ? '' : `<p class="catatan">Selama belum ada uang masuk, angka ini <strong>biaya</strong>, bukan kerugian. Musim yang belum panen bukan musim yang rugi.</p>`}`;
}

function gambarDaftar() {
  if (!catatan.length) { el.daftar.innerHTML = '<p class="kosong">Belum ada catatan.</p>'; return; }
  const urut = [...catatan].sort((a, b) => String(b.t).localeCompare(String(a.t)) || b.i - a.i);
  const perKat = new Map();
  for (const c of catatan) {
    if (c.a !== 'keluar') continue;
    perKat.set(c.k, (perKat.get(c.k) ?? 0) + c.n);
  }
  const teratas = [...perKat].sort((a, b) => b[1] - a[1]).slice(0, 5);
  el.daftar.innerHTML = `
    ${teratas.length ? `
      <div class="kartu">
        <h2>Biaya terbesar</h2>
        <dl class="kunci">${teratas.map(([k, v]) => `<dt>${teks(k)}</dt><dd>${rupiah(v)}</dd>`).join('')}</dl>
      </div>` : ''}
    <div class="kartu">
      <h2>${n(catatan.length)} catatan</h2>
      <div class="pembungkus-tabel">
        <table>
          <thead><tr><th>Tanggal</th><th>Untuk apa</th><th class="angka">Jumlah</th><th></th></tr></thead>
          <tbody>
            ${urut.map((c) => `
              <tr>
                <td>${teks(c.t)}</td>
                <td>${teks(c.k)}${c.c ? `<span class="sub">${teks(c.c)}</span>` : ''}</td>
                <td class="angka">${c.a === 'masuk' ? '+' : '−'} ${rupiah(c.n)}</td>
                <td><button type="button" class="hapus-satu" data-hapus="${c.i}" aria-label="Hapus catatan ${teks(c.t)} ${teks(c.k)}">hapus</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function gambar() { gambarRingkas(); gambarDaftar(); }

// ---------------------------------------------------------------------------
// Bawa keluar — bukan fitur tambahan
// ---------------------------------------------------------------------------
function susunTeks() {
  const { keluar, masuk, selisih } = hitung();
  const baris = [
    '*Buku kas — Open Protocols*',
    '───────────────',
    `Catatan: ${n(catatan.length)}`,
    `Uang keluar: ${rupiah(keluar)}`,
    `Uang masuk: ${masuk > 0 ? rupiah(masuk) : 'belum ada'}`,
    masuk > 0 ? `Selisih: ${selisih >= 0 ? '+' : '−'} ${rupiah(Math.abs(selisih))}` : null,
    '',
    ...[...catatan].sort((a, b) => String(a.t).localeCompare(String(b.t)))
      .map((c) => `${c.t}  ${c.a === 'masuk' ? '+' : '−'} ${rupiah(c.n)}  ${c.k}${c.c ? ` — ${c.c}` : ''}`),
    '───────────────',
    'Disusun di perangkat sendiri. Tidak ada yang dikirim ke mana pun.',
  ].filter((x) => x !== null);
  return baris.join('\n');
}

el.bawa.addEventListener('click', async (ev) => {
  const b = ev.target.closest('button[data-bawa]');
  if (!b) return;
  if (!catatan.length) { el.kabarBawa.textContent = 'Belum ada catatan untuk dibawa.'; return; }
  const isi = susunTeks();
  el.pratinjau.textContent = isi;
  el.pratinjau.hidden = false;
  if (b.dataset.bawa === 'salin') {
    el.kabarBawa.textContent = (await salin(isi))
      ? 'Tersalin. Tempelkan ke catatan, surel, atau kirim ke dirimu sendiri.'
      : 'Peramban menolak papan klip. Salin dari kotak di bawah.';
    return;
  }
  const alamat = `https://wa.me/?text=${encodeURIComponent(isi)}`;
  if (alamat.length > 2000) {
    await salin(isi);
    el.kabarBawa.textContent = `Catatanmu ${n(catatan.length)} baris — terlalu panjang untuk `
      + 'dimuat alamat WhatsApp, dan memotongnya akan membuang sebagian catatan tanpa terlihat. '
      + 'Sudah disalin; tempelkan langsung di WhatsApp.';
    return;
  }
  const tab = window.open(alamat, '_blank', 'noopener,noreferrer');
  el.kabarBawa.textContent = tab
    ? 'WhatsApp dibuka. Belum terkirim — kamu yang memilih penerimanya, dan boleh mengirimnya ke dirimu sendiri.'
    : 'Peramban memblokir tab baru. Salin dari kotak di bawah.';
  if (!tab) await salin(isi);
});

// ---------------------------------------------------------------------------
// Ubah
// ---------------------------------------------------------------------------
el.arah.addEventListener('change', isiKategori);

el.tambah.addEventListener('click', () => {
  const j = Number(el.jumlah.value);
  if (!Number.isFinite(j) || j <= 0) {
    el.kabar.textContent = 'Isi jumlahnya dulu — itu satu-satunya yang wajib.';
    el.jumlah.focus();
    return;
  }
  catatan.push({
    i: Date.now(),
    t: el.tanggal.value || new Date().toISOString().slice(0, 10),
    a: el.arah.value,
    k: el.kategori.value,
    n: j,
    c: el.catatan.value.trim() || undefined,
  });
  const ok = tulis();
  gambar();
  el.jumlah.value = '';
  el.catatan.value = '';
  el.jumlah.focus();
  // Pengingat membawa keluar muncul sendiri begitu kehilangan mulai terasa sakit.
  // Sepuluh dipilih karena di bawah itu mengetik ulang masih murah.
  el.kabar.textContent = !ok
    ? 'Catatan ditambahkan, tetapi TIDAK tersimpan — lihat peringatan di bawah.'
    : catatan.length >= 10 && catatan.length % 10 === 0
      ? `Tersimpan. Sudah ${n(catatan.length)} catatan — bawa keluar sekarang, selagi murah.`
      : 'Tersimpan di perangkat ini.';
});

el.daftar.addEventListener('click', (ev) => {
  const b = ev.target.closest('button[data-hapus]');
  if (!b) return;
  catatan = catatan.filter((c) => String(c.i) !== b.dataset.hapus);
  tulis();
  gambar();
});

el.hapusSemua.addEventListener('click', () => {
  if (!catatan.length) return;
  // Konfirmasi karena ini satu-satunya tombol di seluruh permukaan yang menghancurkan
  // kerja pemakainya, dan tidak ada cadangan di mana pun untuk memulihkannya.
  if (!confirm(`Hapus seluruh ${catatan.length} catatan? Tidak ada cadangan, dan ini tidak bisa dibatalkan.`)) return;
  catatan = [];
  tulis();
  gambar();
  el.kabarBawa.textContent = 'Seluruh catatan dihapus.';
});

// ---------------------------------------------------------------------------
// Mulai
// ---------------------------------------------------------------------------
(async function mulai() {
  catatan = baca();
  el.tanggal.value = new Date().toISOString().slice(0, 10);
  isiKategori();
  gambar();
  await gambarPeringatan();

  pasangBatas(el.batas, {
    sumber: [{
      label: 'Catatanmu sendiri',
      penerbit: null,
      tarikan: new Date().toISOString().slice(0, 10),
      lisensi: 'milikmu — tidak berlisensi, tidak diterbitkan, tidak dikirim',
      tingkat: null,
      alasan:
        'Seluruh angka di halaman ini kamu yang mengetiknya, jadi tidak ada tingkat bukti '
        + 'untuk diberikan: ia tidak diambil dari registri mana pun dan tidak diperiksa siapa '
        + 'pun. Yang bisa dijamin halaman ini cuma aritmetikanya — penjumlahan yang bisa kamu '
        + 'periksa sendiri dari daftar di atas.',
    }],
    takDijawab: [{
      judul: 'Apakah catatan ini akan bertahan',
      teks:
        'Catatan tersimpan di peramban perangkat ini. Kuota penyimpanannya jauh lebih besar '
        + 'daripada yang dibutuhkan — satu musim penuh sekitar 14,5 KB dari kuota bermega-mega '
        + '— jadi yang membatasi bukan ruang melainkan ketahanan: peramban boleh menghapusnya '
        + 'tanpa memberitahu, dan permintaan izin permanen ditolaknya pada kunjungan biasa. '
        + 'Karena itu "bawa keluar" bukan pelengkap di halaman ini.',
    }, {
      judul: 'Arus kas bertanggal, banyak petak, dan berbagi dengan kelompok',
      teks:
        'Ketiganya belum ada, dan masing-masing menunggu hal yang berbeda: kalender fase '
        + 'bertanggal, identitas petak yang dipakai lintas layar, dan tempat menyimpan yang '
        + 'bukan peramban. Menambahkannya sekarang berarti menjanjikan ketiganya.',
    }],
  });
})();
