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
import { salin, bukaTab } from './serah.js';
import * as buku from './buku.js';
import * as musim from './musim.js';

pasangTombolTema();
document.getElementById('tanpaJs')?.remove();

const el = {};
for (const id of ['ringkas', 'tanggal', 'arah', 'kategori', 'jumlah', 'catatan', 'tambah',
  'kabar', 'daftar', 'peringatanSimpan', 'kabarBawa', 'pratinjau', 'hapusSemua', 'kartuMusim'])
  el[id] = document.getElementById(id);
el.batas = document.getElementById('batasJawaban');
el.bawa = document.querySelector('.kartu-bawa');

const rupiah = (x) => 'Rp ' + Math.round(x).toLocaleString('id-ID');
const n = (x) => Number(x ?? 0).toLocaleString('id-ID');

/* Kategori, catatan, dan musim tidak lagi tinggal di berkas ini.
 *
 * Kategorinya pindah ke `buku.js` bersama simpanannya karena LAYAR RENCANA IKUT MENULIS
 * ke buku ini: yang mencatat "pemupukan susulan sudah dikerjakan" di sana tidak perlu
 * mengetik "Pupuk, Rp 250.000" lagi di sini. Musimnya pindah ke `musim.js` karena tiga
 * layar memerlukannya, bukan satu — dan tiga gagasan "musim" yang tidak pernah bertemu
 * persis yang membuat biaya tidak bisa ditaruh di sebelah langkah yang menimbulkannya.
 *
 * Yang TIDAK berubah: rancangan halaman ini. Musim tetap ada di kepala dan bukan di tiap
 * catatan, tetap satu catatan tiga medan, tetap tanpa akun. */
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
const simpananHidup = () => buku.simpananHidup() && musim.simpananHidup();

const tulis = () => {
  const ok = buku.tulis();
  if (!ok) gambarPeringatan();
  return ok;
};

async function gambarPeringatan() {
  let permanen = null;
  try {
    if (navigator.storage?.persisted) {
      permanen = await navigator.storage.persisted();
      if (!permanen && navigator.storage.persist) permanen = await navigator.storage.persist();
    }
  } catch { /* peramban lama; keadaannya tetap "tidak dijanjikan" */ }

  if (!simpananHidup()) {
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
  const daftar = el.arah.value === 'masuk' ? buku.KATEGORI_MASUK : buku.KATEGORI_KELUAR;
  el.kategori.innerHTML = daftar.map((k) => `<option value="${teks(k)}">${teks(k)}</option>`).join('');
}

const catatanMusim = () => buku.perMusim(musim.idMusimAktif());
const musimKini = () => musim.aktif();
const hitung = () => buku.hitung(musim.idMusimAktif());

// Formulir musim tinggal di `musim.js`, jadi yang mau membukanya harus melewati DOM-nya.
function bukaFormulirMusim() {
  const d = el.kartuMusim.querySelector('.atur-musim');
  if (d) d.open = true;
  el.kartuMusim.querySelector('#mNama')?.focus();
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
                <td>${teks(c.k)}${c.c ? `<span class="sub">${teks(c.c)}</span>` : ''}${c.s === 'rencana' ? '<span class="sub asal">dari layar rencana</span>' : ''}</td>
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
  const { keluar, masuk, selisih, cacah } = hitung();
  const m = musimKini();
  const baris = [
    '*Buku kas — Pranatani*',
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
      .map((c) => `${c.t}  ${c.a === 'masuk' ? '+' : '−'} ${rupiah(c.n)}  ${c.k}${c.c ? ` — ${c.c}` : ''}${c.s === 'rencana' ? ' [rencana]' : ''}`),
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
    el.kabarBawa.textContent = `Catatanmu ${n(catatanMusim().length)} baris — terlalu panjang untuk `
      + 'dimuat alamat WhatsApp, dan memotongnya akan membuang sebagian catatan tanpa terlihat. '
      + 'Sudah disalin; tempelkan langsung di WhatsApp.';
    return;
  }
  el.kabarBawa.textContent = bukaTab(alamat)
    ? 'WhatsApp dibuka. Belum terkirim — kamu yang memilih penerimanya, dan boleh mengirimnya ke dirimu sendiri.'
    : 'Peramban menolak membuka tab baru. Salin dari kotak di bawah.';
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
  if (!musim.idMusimAktif()) {
    el.kabar.textContent = 'Beri nama musimnya dulu di atas — sekali saja, lalu tiap catatan ikut ke sana.';
    bukaFormulirMusim();
    return;
  }
  const { tersimpan: ok } = buku.tambah({
    m: musim.idMusimAktif(),
    t: el.tanggal.value || new Date().toISOString().slice(0, 10),
    a: el.arah.value,
    k: el.kategori.value,
    n: j,
    c: el.catatan.value.trim() || undefined,
  });
  if (!ok) gambarPeringatan();
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
  buku.hapus(b.dataset.hapus);
  gambar();
});

el.hapusSemua.addEventListener('click', () => {
  const isi = catatanMusim();
  if (!isi.length) return;
  // Konfirmasi karena ini satu-satunya tombol di seluruh permukaan yang menghancurkan
  // kerja pemakainya, dan tidak ada cadangan di mana pun untuk memulihkannya.
  const m = musimKini();
  if (!confirm(`Hapus ${isi.length} catatan di "${m?.nama ?? 'musim ini'}"? Musim lain tidak ikut terhapus, tetapi yang ini tidak ada cadangannya dan tidak bisa dibatalkan.`)) return;
  for (const c of isi) buku.hapus(c.i);
  gambar();
  el.kabarBawa.textContent = `Catatan di "${teks(m?.nama ?? 'musim ini')}" dihapus.`;
});

// ---------------------------------------------------------------------------
// Mulai
// ---------------------------------------------------------------------------
(async function mulai() {
  // Migrasi dituliskan SEKALI di dalam kedua modul simpanan, bukan diturunkan ulang tiap
  // muat. Menurunkannya ulang memang idempoten, tetapi ia membuat bentuk tersimpan berbeda
  // dari yang dibaca layar — dan bentuk yang berbeda dari yang terlihat adalah tempat
  // kekeliruan berikutnya lahir.
  musim.pasangMusim(el.kartuMusim, { onGanti: gambar });
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
        'Musim dan petak sudah bisa dipisahkan di sini, tetapi dua hal lain belum: arus kas '
        + 'bertanggal menuntut kalender fase yang punya medan hari — kosakata fase sengaja '
        + 'tidak punya, dan hanya dua dari empat langkah protokol cabai bertanggal — '
        + 'sedangkan berbagi dengan kelompok tani menuntut tempat menyimpan yang bukan '
        + 'peramban.',
    }, {
      judul: 'Petak ini belum bisa disandingkan dengan petak siapa pun',
      teks:
        'Musim dan petak yang kamu namai di atas sekarang dipakai bersama layar rencana, jadi '
        + 'biaya dan langkah yang dicatat di sana masuk ke buku yang sama. Yang masih tidak '
        + 'bisa dilakukan: menyandingkan petak ini dengan petak petani lain. Skema petak '
        + 'mewajibkan pemegang — artinya menyebut nama orang — dan sidik petak menolak apa pun '
        + 'yang lebih kasar daripada poligon, karena satu titik presisi lima desimal di dalam '
        + 'satu kabupaten habis ditebak dalam 0,08 detik dan sidiknya jadi penunjuk lokasi, '
        + 'bukan penjagaan. Lapisan ini tidak meminta keduanya. Cukup untuk menyambungkan '
        + 'layar satu sama lain, tidak cukup untuk menyambungkan petani satu sama lain.',
    }],
  });
})();
