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
  'kabar', 'daftar', 'peringatanSimpan', 'kabarBawa', 'pratinjau', 'hapusSemua',
  'pilihMusim', 'aturMusim', 'mNama', 'mKomoditas', 'mLuas', 'tambahMusim', 'kabarMusim'])
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
let musim = [];
let musimAktif = null;

/* MUSIM ADA DI KEPALA, BUKAN DI TIAP CATATAN — dan itu keputusan yang menjaga rancangan
 * halaman ini tetap utuh. Menambahkan medan petak dan luas ke tiap catatan akan membuat
 * satu catatan lima medan, dan tiap medan tambahan adalah alasan berhenti. Dinamai sekali
 * di kepala, ia gratis bagi tiap catatan sesudahnya.
 *
 * KENAPA LUAS SAMA SEKALI. Tanpa luas, buku ini menjawab "berapa habis semusim" dan
 * berhenti di situ. Dengan luas ia menjawab BIAYA PER HEKTARE — dan itu satuan yang
 * dipakai hampir semua program yang meminta angka biaya usaha tani, termasuk asuransi
 * usaha tani padi yang preminya, subsidinya, dan ganti ruginya seluruhnya per hektare.
 * Petani dengan lahan 0,25 ha yang cuma punya angka total tidak bisa membandingkan
 * dirinya dengan angka mana pun yang diterbitkan.
 *
 * Luas tetap BOLEH KOSONG. Yang tidak tahu luas petaknya — dan itu lazim — tetap bisa
 * mencatat; yang hilang cuma satu baris, bukan seluruh halamannya. */

// ---------------------------------------------------------------------------
// Simpanan
// ---------------------------------------------------------------------------
// Gagal menulis TIDAK boleh diam. Mode privat menolak localStorage, dan pemakai yang
// mengira catatannya tersimpan padahal tidak adalah keadaan terburuk yang bisa dihasilkan
// halaman ini — lebih buruk daripada tidak menawarkan penyimpanan sama sekali.
let simpananHidup = true;

/* Bentuk simpanan berubah setelah musim masuk, dan yang sudah mencatat TIDAK BOLEH
 * kehilangan apa pun karenanya. Larik datar versi pertama dibungkus jadi satu musim
 * bernama, bukan dibuang — kehilangan catatan karena pembaruan aplikasi persis kegagalan
 * yang paling merusak kepercayaan pada buku kas. */
function baca() {
  try {
    const m = JSON.parse(localStorage.getItem(KUNCI) ?? 'null');
    if (Array.isArray(m)) {
      const bawaan = { i: 'm0', nama: 'Musim pertama', komoditas: null, luas: null };
      return { musim: [bawaan], catatan: m.map((c) => ({ ...c, m: 'm0' })), aktif: 'm0', dimigrasi: true };
    }
    if (m && Array.isArray(m.catatan)) return m;
    return { musim: [], catatan: [], aktif: null };
  } catch { simpananHidup = false; return { musim: [], catatan: [], aktif: null }; }
}

function tulis() {
  try {
    localStorage.setItem(KUNCI, JSON.stringify({ musim, catatan, aktif: musimAktif }));
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

const catatanMusim = () => catatan.filter((c) => c.m === musimAktif);
const musimKini = () => musim.find((m) => m.i === musimAktif) ?? null;

function hitung() {
  const isi = catatanMusim();
  const keluar = isi.filter((c) => c.a === 'keluar').reduce((a, c) => a + c.n, 0);
  const masuk = isi.filter((c) => c.a === 'masuk').reduce((a, c) => a + c.n, 0);
  return { keluar, masuk, selisih: masuk - keluar, cacah: isi.length };
}

function gambarRingkas() {
  const { keluar, masuk, selisih, cacah } = hitung();
  const m = musimKini();
  if (!cacah) {
    el.ringkas.innerHTML = `
      <h2>Belum ada catatan</h2>
      <p>Tambahkan satu di bawah. Angka di sini berubah seketika — itu seluruh gunanya.</p>`;
    return;
  }
  // "Untung" hanya disebut kalau memang ada uang masuk. Selisih dari nol pemasukan bukan
  // rugi; ia biaya yang belum berhasil — dan menyebutnya rugi di tengah musim keliru.
  const adaMasuk = masuk > 0;
  const judulMusim = m?.nama ? ` — ${teks(m.nama)}` : '';
  el.ringkas.innerHTML = `
    <h2>${adaMasuk ? (selisih >= 0 ? 'Untung sejauh ini' : 'Masih di bawah biaya') : 'Biaya sejauh ini'}${judulMusim}</h2>
    <p class="angka-besar">${adaMasuk ? rupiah(Math.abs(selisih)) : rupiah(keluar)}</p>
    <dl class="kunci">
      <dt>Uang keluar</dt><dd>${rupiah(keluar)}</dd>
      <dt>Uang masuk</dt><dd>${adaMasuk ? rupiah(masuk) : '<span class="kosong">belum ada</span>'}</dd>
      ${m?.luas > 0 ? `
        <dt>Biaya per hektare</dt>
        <dd>${rupiah(keluar / m.luas)}<span class="sub">dari ${n(m.luas)} ha</span></dd>` : ''}
      <dt>Catatan</dt><dd>${n(cacah)}</dd>
    </dl>
    ${m && !(m.luas > 0) ? `<p class="catatan">Luas petak belum diisi, jadi <strong>biaya per
      hektare</strong> tidak bisa dihitung — dan itu satuan yang dipakai hampir semua program
      yang meminta angka biaya usaha tani. Isi di "ganti atau tambah musim" di atas.</p>` : ''}
    ${adaMasuk ? '' : `<p class="catatan">Selama belum ada uang masuk, angka ini <strong>biaya</strong>, bukan kerugian. Musim yang belum panen bukan musim yang rugi.</p>`}`;
}

function gambarDaftar() {
  const isi = catatanMusim();
  if (!isi.length) { el.daftar.innerHTML = '<p class="kosong">Belum ada catatan di musim ini.</p>'; return; }
  const urut = [...isi].sort((a, b) => String(b.t).localeCompare(String(a.t)) || b.i - a.i);
  const perKat = new Map();
  for (const c of isi) {
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
      <h2>${n(isi.length)} catatan</h2>
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

function gambarMusim() {
  if (!musim.length) {
    el.pilihMusim.innerHTML = `<p class="kosong">Belum ada musim. Beri nama satu di bawah —
      boleh sesederhana "Cabai petak belakang".</p>`;
    el.aturMusim.open = true;
    return;
  }
  const m = musimKini();
  el.pilihMusim.innerHTML = `
    <label for="musimAktif">Sedang dicatat</label>
    <select id="musimAktif">
      ${musim.map((x) => `<option value="${teks(x.i)}"${x.i === musimAktif ? ' selected' : ''}>
        ${teks(x.nama)}${x.luas > 0 ? ` — ${n(x.luas)} ha` : ''}</option>`).join('')}
    </select>
    ${m ? `<p class="catatan">${[
      m.komoditas && teks(m.komoditas),
      m.luas > 0 ? `${n(m.luas)} hektare` : 'luas belum diisi',
      `${n(catatanMusim().length)} catatan`,
    ].filter(Boolean).join(' · ')}</p>` : ''}`;
  el.pilihMusim.querySelector('#musimAktif')?.addEventListener('change', (ev) => {
    musimAktif = ev.target.value;
    tulis();
    gambar();
  });
}

function gambar() { gambarMusim(); gambarRingkas(); gambarDaftar(); }

el.tambahMusim.addEventListener('click', () => {
  const nama = el.mNama.value.trim();
  if (!nama) { el.kabarMusim.textContent = 'Beri namanya dulu — cukup satu yang kamu kenali sendiri.'; el.mNama.focus(); return; }
  const luas = Number(el.mLuas.value);
  const baru = {
    i: 'm' + Date.now(),
    nama,
    komoditas: el.mKomoditas.value.trim() || null,
    luas: Number.isFinite(luas) && luas > 0 ? luas : null,
  };
  musim.push(baru);
  musimAktif = baru.i;
  tulis();
  gambar();
  el.mNama.value = ''; el.mKomoditas.value = ''; el.mLuas.value = '';
  el.kabarMusim.textContent = `"${baru.nama}" jadi musim yang sedang dicatat.`;
  el.aturMusim.open = false;
});

// ---------------------------------------------------------------------------
// Bawa keluar — bukan fitur tambahan
// ---------------------------------------------------------------------------
function susunTeks() {
  const { keluar, masuk, selisih, cacah } = hitung();
  const m = musimKini();
  const baris = [
    '*Buku kas — Open Protocols*',
    '───────────────',
    m ? `Musim: ${m.nama}${m.komoditas ? ` — ${m.komoditas}` : ''}` : null,
    m?.luas > 0 ? `Luas: ${n(m.luas)} ha` : null,
    `Catatan: ${n(cacah)}`,
    `Uang keluar: ${rupiah(keluar)}`,
    `Uang masuk: ${masuk > 0 ? rupiah(masuk) : 'belum ada'}`,
    masuk > 0 ? `Selisih: ${selisih >= 0 ? '+' : '−'} ${rupiah(Math.abs(selisih))}` : null,
    m?.luas > 0 ? `Biaya per hektare: ${rupiah(keluar / m.luas)}` : null,
    '',
    ...catatanMusim().sort((a, b) => String(a.t).localeCompare(String(b.t)))
      .map((c) => `${c.t}  ${c.a === 'masuk' ? '+' : '−'} ${rupiah(c.n)}  ${c.k}${c.c ? ` — ${c.c}` : ''}`),
    '───────────────',
    'Disusun di perangkat sendiri. Tidak ada yang dikirim ke mana pun.',
  ].filter((x) => x !== null);
  return baris.join('\n');
}

el.bawa.addEventListener('click', async (ev) => {
  const b = ev.target.closest('button[data-bawa]');
  if (!b) return;
  if (!catatanMusim().length) { el.kabarBawa.textContent = 'Belum ada catatan di musim ini untuk dibawa.'; return; }
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
  if (!musimAktif) {
    el.kabar.textContent = 'Beri nama musimnya dulu di atas — sekali saja, lalu tiap catatan ikut ke sana.';
    el.aturMusim.open = true;
    el.mNama.focus();
    return;
  }
  catatan.push({
    i: Date.now(),
    m: musimAktif,
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
    : hitung().cacah >= 10 && hitung().cacah % 10 === 0
      ? `Tersimpan. Sudah ${n(hitung().cacah)} catatan di musim ini — bawa keluar sekarang, selagi murah.`
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
  const isi = catatanMusim();
  if (!isi.length) return;
  // Konfirmasi karena ini satu-satunya tombol di seluruh permukaan yang menghancurkan
  // kerja pemakainya, dan tidak ada cadangan di mana pun untuk memulihkannya.
  const m = musimKini();
  if (!confirm(`Hapus ${isi.length} catatan di "${m?.nama ?? 'musim ini'}"? Musim lain tidak ikut terhapus, tetapi yang ini tidak ada cadangannya dan tidak bisa dibatalkan.`)) return;
  catatan = catatan.filter((c) => c.m !== musimAktif);
  tulis();
  gambar();
  el.kabarBawa.textContent = `Catatan di "${teks(m?.nama ?? 'musim ini')}" dihapus.`;
});

// ---------------------------------------------------------------------------
// Mulai
// ---------------------------------------------------------------------------
(async function mulai() {
  const simpan = baca();
  musim = simpan.musim ?? [];
  catatan = simpan.catatan ?? [];
  musimAktif = simpan.aktif ?? musim[0]?.i ?? null;
  // Migrasi dituliskan SEKALI, bukan diturunkan ulang tiap muat. Menurunkannya ulang
  // memang idempoten, tetapi ia membuat bentuk tersimpan berbeda dari yang dibaca layar —
  // dan bentuk yang berbeda dari yang terlihat adalah tempat kekeliruan berikutnya lahir.
  if (simpan.dimigrasi) tulis();
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
      judul: 'Arus kas bertanggal, dan berbagi dengan kelompok',
      teks:
        'Beberapa musim dan petak sudah bisa dipisahkan di sini, tetapi dua hal lain belum: '
        + 'arus kas bertanggal menuntut kalender fase yang punya medan hari — kosakata fase '
        + 'sengaja tidak punya, dan hanya dua dari empat langkah protokol cabai bertanggal — '
        + 'sedangkan berbagi dengan kelompok tani menuntut tempat menyimpan yang bukan '
        + 'peramban. Petak di sini juga hanya nama yang kamu ketik, bukan identitas petak '
        + 'yang dipakai lintas layar.',
    }],
  });
})();
