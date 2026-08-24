/* Layar baca instrumentasi.
 *
 * Halaman ini satu-satunya cara catatan pemakaian keluar dari peranti, dan itu
 * disengaja: ukur.js tidak pernah menghubungi jaringan. Pengumpulan saat pilot
 * berarti meminta, bukan menarik diam-diam.
 *
 * Semua yang ditampilkan turunan dari catatan mentah yang juga ditampilkan di bawah,
 * supaya tiap angka bisa dibantah oleh yang membacanya — aturan yang sama dipakai
 * kalkulator jalur 3.
 */

import { ringkas, hapus } from './ukur.js';
import { daftarSimpanan, hapusSemua, ringkasSimpanan } from './simpanan.js';
import { teks } from './pustaka.js';
import { pasangTombolTema } from './tema.js';
import { perintah, luringAktif } from './luring.js';

pasangTombolTema();

const NAMA = {
  1: 'Insiden — masuk dari gejala',
  2: 'Produk — masuk dari kemasan',
  3: 'Hitungan — rupiah per kg hara',
  4: 'Keabsahan — benih & bibit',
  5: 'Sediaan pupuk sendiri',
  6: 'Sediaan pengendali sendiri',
};

document.getElementById('tanpaJs')?.remove();

/* B4 — nama lubang untuk dibaca manusia. Kunci teknisnya sama dengan meta.tidakAda,
 * jadi apa yang dicacah di sini persis apa yang sudah dinyatakan blok batas jawaban di
 * tiap layar. B1 menyatakan lubangnya; B4 menghitung berapa kali ia benar-benar
 * ditabrak. */
const LUBANG_NAMA = {
  namaDagang: ['Nama di kemasan tidak ketemu', 'Pemetaan nama dagang ke nama terdaftar'],
  gejalaOpt: ['Gejala di luar sepuluh OPT terkurasi', 'Deskripsi gejala untuk OPT registri'],
  namaLokalTakTerpetakan: ['Nama lokal belum terpetakan', 'Perluasan kamus nama lokal'],
  kandunganTakTerdaftar: ['Kandungan tidak cocok satu pun', 'Kelengkapan komposisi registri pupuk'],
  haraSediaan: ['Komposisi pupuk kosong di registri', 'Kelengkapan komposisi registri pupuk'],
  takaranRumahTangga: ['Menakar tanpa alat terukur', 'Panduan takaran — bukan tarikan data'],
};

const el = {
  ringkas: document.getElementById('ringkas'),
  antrean: document.getElementById('antrean'),
  luringKeadaan: document.getElementById('luringKeadaan'),
  luringKabar: document.getElementById('luringKabar'),
  perJalur: document.getElementById('perJalur'),
  tindakan: document.getElementById('tindakan'),
  mentah: document.getElementById('mentah'),
  kabar: document.getElementById('kabar'),
};

const ms = (v) => (v == null ? '—' : v >= 1000 ? `${(v / 1000).toFixed(1)} dtk` : `${v} ms`);

function gambar() {
  const r = ringkas();

  if (!r.hariTercatat) {
    el.ringkas.innerHTML = `
      <div class="kartu">
        <h2>Belum ada catatan</h2>
        <p>Peranti ini belum pernah membuka satu jalur pun, atau catatannya sudah dihapus.</p>
      </div>`;
    el.perJalur.innerHTML = '';
    el.antrean.innerHTML = '';
    el.tindakan.hidden = true;
    return;
  }

  el.ringkas.innerHTML = `
    <div class="kartu">
      <h2>Ringkasan peranti ini</h2>
      <dl class="kunci">
        <dt>Rentang tercatat</dt><dd>${teks(r.sejak)} sampai ${teks(r.sampai)}</dd>
        <dt>Hari dengan pemakaian</dt><dd>${r.hariTercatat}</dd>
        <dt>Hari sampai ke jawaban</dt><dd>${r.hariMenjawab}</dd>
        <dt>Pemakaian berulang</dt><dd>${r.berulang ? 'Ya' : 'Belum'}</dd>
      </dl>
      <p class="catatan">
        <strong>Berulang</strong> berarti peranti ini sampai ke layar jawaban pada dua hari
        berbeda atau lebih. Diukur per hari, bukan per kunjungan: membuka lima kali dalam
        satu sore adalah satu hari, dan yang menandakan jalur ini berguna adalah kembalinya
        di hari lain.
      </p>
    </div>`;

  const baris = Object.entries(r.perJalur).sort(([a], [b]) => a.localeCompare(b)).map(([j, d]) => `
    <tr>
      <td>${j} · ${teks(NAMA[j] ?? '—')}</td>
      <td>${d.buka}</td>
      <td>${d.jawab}</td>
      <td>${d.nol}</td>
      <td>${d.takSanggup}</td>
      <td>${d.gagal}</td>
      <td>${d.ditinggal}</td>
      <td>${ms(d.waktuP50)}</td>
      <td>${ms(d.waktuP90)}</td>
      <td>${d.berulang ? 'ya' : '—'}</td>
    </tr>`).join('');

  el.perJalur.innerHTML = `
    <div class="kartu">
      <h2>Per jalur</h2>
      <table>
        <thead><tr>
          <th>Jalur</th><th>Dibuka</th><th>Jawaban</th><th>Nol</th><th>Tak sanggup</th>
          <th>Gagal</th><th>Ditinggal</th><th>Waktu p50</th><th>Waktu p90</th><th>Berulang</th>
        </tr></thead>
        <tbody>${baris}</tbody>
      </table>
      <p class="catatan">
        <strong>Nol</strong> dan <strong>tak sanggup</strong> ikut dihitung sebagai jawaban,
        karena pada jalur-jalur ini keduanya memang jawaban yang benar — “jangan beli apa pun
        untuk ini”, atau “registri tidak memuatnya”. Yang dipisahkan justru
        <strong>gagal</strong>: itu sambungan putus, bukan keputusan layar.
      </p>
      <p class="catatan">
        <strong>Waktu</strong> dihitung sejak halaman dibuka sampai jawaban terbaca, bukan
        sejak ketukan pertama — yang dirasakan di lapangan adalah tunggu totalnya, termasuk
        memuat indeks di sinyal buruk.
      </p>
      <p class="catatan">
        <strong>Ditinggal</strong> adalah penelusuran yang melewati dua menit. Dari dalam
        peramban, halaman yang dibiarkan terbuka tidak bisa dibedakan dari sambungan yang
        lambat, jadi waktunya tidak dipakai menghitung p50 dan p90. Ia tetap ditampilkan
        alih-alih dibuang diam-diam: kalau kolom ini besar, angka waktunya berdiri di atas
        sedikit contoh dan tidak boleh dipercaya sendirian.
      </p>
    </div>`;

  // ---------------------------------------------------------------- B4
  // Terurut menurut seberapa sering ditabrak, bukan menurut seberapa penting menurut
  // kami. Itu seluruh gunanya: yang paling sering menabrak yang paling layak ditarik.
  if (!r.antrean.length) {
    el.antrean.innerHTML = `
      <div class="kartu">
        <h2>Antrean pertanyaan tak terjawab</h2>
        <p>Belum ada satu pun lubang data yang tertabrak di peranti ini.</p>
      </div>`;
  } else {
    const total = r.antrean.reduce((a, x) => a + x.n, 0);
    el.antrean.innerHTML = `
      <div class="kartu">
        <h2>Antrean pertanyaan tak terjawab</h2>
        <p>
          ${total} kali peranti ini menabrak lubang data yang sudah dinyatakan di layar.
          Urutannya menurut <strong>seberapa sering</strong>, bukan menurut seberapa
          penting menurut kami — dan itu seluruh gunanya.
        </p>
        <div class="pembungkus-tabel">
          <table>
            <thead><tr><th>Yang tidak terjawab</th><th>Kali</th><th>Dari layar</th><th>Terakhir</th><th>Yang menutupnya</th></tr></thead>
            <tbody>
              ${r.antrean.map((x) => {
                const [nama, tutup] = LUBANG_NAMA[x.kunci] ?? [x.kunci, '—'];
                return `<tr>
                  <td>${teks(nama)}</td>
                  <td class="angka">${x.n}</td>
                  <td>${teks(Object.entries(x.dari).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} (${v})`).join(', '))}</td>
                  <td class="angka">${teks(x.akhir ?? '—')}</td>
                  <td>${teks(tutup)}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        <p class="catatan">
          <strong>Yang dicatat cacahnya, bukan kata yang kamu ketik.</strong>
          <code>docs/11</code> bagian 3 menyatakan isi pencarian sengaja tidak diukur —
          jejak minat bisa mengenali orang di desa kecil — dan B4 tidak mengubahnya. Tiap
          baris di atas nama lubang yang sudah tercetak di layar lewat blok batas
          jawaban; mencacahnya tidak menambah satu keterangan pun tentang orangnya.
        </p>
        <p class="catatan">
          <strong>Tidak ada yang diberi tahu.</strong> Antrean ini tinggal di peranti ini
          saja, sama seperti angka di atasnya. Ia berguna kalau dan hanya kalau
          diserahkan atas permintaan — dan sampai itu terjadi, tidak seorang pun di ujung
          sana membacanya.
        </p>
      </div>`;
  }

  el.mentah.textContent = JSON.stringify(r.mentah, null, 1);
  el.tindakan.hidden = false;
}

/* Daftar apa yang benar-benar tersimpan — bukan cuma yang diukur berkas ini.
 *
 * Tabel di atas meringkas `op.ukur.v1` saja. Sejak angka mengalir antar layar, peranti
 * ini juga memegang musim, buku kas, anggaran, dan realisasi — dan halaman yang berjudul
 * "apa yang tercatat di peranti ini" yang tidak menyebutnya sedang mengingkari judulnya
 * sendiri. */
function gambarSimpanan() {
  const d = daftarSimpanan();
  const wadah = document.getElementById('simpanan');
  if (!wadah) return;

  if (d === null) {
    wadah.innerHTML = `
      <p class="catatan">Peramban ini menolak membaca penyimpanan lokal — mode privat, atau
      kebijakan peranti. Artinya tidak ada yang tersimpan, dan tidak ada yang bisa dihapus.</p>`;
    return;
  }
  if (!d.length) {
    wadah.innerHTML = '<p class="catatan">Belum ada apa pun yang tersimpan di peranti ini.</p>';
    document.getElementById('hapusSemua').hidden = true;
    return;
  }

  const total = d.reduce((a, x) => a + x.bita, 0);
  const asing = d.filter((x) => !x.dikenal);

  wadah.innerHTML = `
    <p class="bantuan">${d.length} hal tersimpan, ${(total / 1024).toFixed(1)} KB seluruhnya.</p>
    ${asing.length ? `
      <div class="simpanan-asing" role="alert">
        <strong>${asing.length} kunci belum dijelaskan di halaman ini.</strong>
        Ia tetap terhapus oleh tombol di bawah — penghapusannya memindai, bukan memakai
        daftar. Yang perlu diperbaiki keterangannya di <code>simpanan.js</code>.
      </div>` : ''}
    <dl class="simpanan">
      ${d.map((x) => `
        <dt>${teks(x.nama)}${x.dikenal ? '' : ' <em>— belum dijelaskan</em>'}
          <span class="simpanan-ukur">${(x.bita / 1024).toFixed(1)} KB</span></dt>
        <dd>${x.apa ? teks(x.apa) : `Kunci <code>${teks(x.kunci)}</code>.`}</dd>`).join('')}
    </dl>`;
  document.getElementById('hapusSemua').hidden = false;
}

/* SATU KETUKAN TIDAK BOLEH MENGHAPUS SEMUSIM KERJA.
 *
 * Sampai 24 Agustus 2026 tombol ini langsung menghapus musim, buku kas, anggaran,
 * realisasi, dan kalibrasi — tanpa satu pun pertanyaan. Halaman ini sendiri menyebut
 * penghapusannya tidak bisa dibatalkan, tidak ada cadangan di luar peranti, dan target
 * sentuhnya sengaja 44 px sehingga justru mudah kena. Sementara itu `kas.js` sudah
 * memakai `confirm()` untuk penghapusan yang jauh lebih kecil — disiplinnya ada, dan
 * kebetulan tidak dipasang di tombol yang paling merusak.
 *
 * Yang ditanyakan menyebut ISINYA, bukan cacah kuncinya: "3 musim dan 47 catatan kas"
 * memberi tahu apa yang akan hilang, sedangkan "7 hal" tidak memberi tahu apa pun kepada
 * orang yang sedang memutuskan. */
document.getElementById('hapusSemua').addEventListener('click', () => {
  const r = ringkasSimpanan();
  if (!r) { el.kabar.textContent = 'Tidak ada apa pun yang tersimpan di peranti ini.'; return; }
  const isi = r.bagian.length
    ? r.bagian.join(' dan ')
    : `${r.kunci} hal yang tersimpan`;
  if (!confirm(`Hapus ${isi}?\n\nSeluruh simpanan lain di peranti ini ikut terhapus — kalibrasi, anggaran, dan pilihan tampilan. Tidak ada cadangannya di mana pun, dan ini tidak bisa dibatalkan.`)) return;
  const n = hapusSemua();
  el.kabar.textContent = `${n} hal dihapus dari peranti ini — termasuk musim, buku kas, dan anggaran kalau ada.`;
  gambar();
  gambarSimpanan();
});

document.getElementById('salin').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(el.mentah.textContent);
    el.kabar.textContent = 'Tersalin. Tempelkan ke mana pun catatan pilot dikumpulkan.';
  } catch {
    el.kabar.textContent = 'Peramban menolak menyalin. Blok di bawah bisa disalin tangan.';
  }
});

document.getElementById('hapus').addEventListener('click', () => {
  hapus();
  el.kabar.textContent = 'Hitungan penggunaan dihapus. Musim, buku kas, dan anggaran TIDAK ikut — itu tombol di bawah.';
  gambar();
  gambarSimpanan();
});

gambar();
gambarSimpanan();

// ---------------------------------------------------------------------------
// A5 — kendali simpanan luring
// ---------------------------------------------------------------------------

const kb = (b) => (b == null ? null : b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

async function keadaanLuring() {
  if (!('serviceWorker' in navigator)) {
    el.luringKeadaan.textContent =
      'Peramban ini tidak mendukung penyimpan luring, jadi permukaan hanya bekerja saat ada sinyal.';
    return;
  }
  if (!luringAktif()) {
    el.luringKeadaan.textContent =
      'Penyimpan luring belum aktif. Ia menyala sesudah halaman dimuat sekali lagi — atau tidak sama sekali kalau situs disajikan tanpa TLS di luar localhost.';
    return;
  }
  try {
    const u = await perintah('ukuran');
    el.luringKeadaan.innerHTML =
      `Aktif. <strong>${u.berkas}</strong> berkas tersimpan di peranti ini` +
      (u.byte ? `, dan seluruh penyimpanan situs ini memakai <strong>${kb(u.byte)}</strong> — angka itu mencakup lebih dari cache, jadi ia batas atas, bukan ukuran cachenya sendiri.` : '.');
  } catch (e) {
    el.luringKeadaan.textContent = `Penyimpan luring tidak menjawab: ${e.message}`;
  }
}

document.getElementById('simpanCari')?.addEventListener('click', async (ev) => {
  const b = ev.currentTarget;
  b.disabled = true;
  el.luringKabar.textContent = 'Mengambil kepala pencarian…';
  try {
    await perintah('simpanCari', (d) => {
      if (d.jenis === 'maju') el.luringKabar.textContent = `Menyimpan ${d.n} dari ${d.dari} ember…`;
    });
    el.luringKabar.textContent = 'Selesai. Pencarian nama kini bekerja tanpa sinyal.';
    keadaanLuring();
  } catch (e) {
    el.luringKabar.textContent = `Gagal: ${e.message}. Yang sudah tersimpan tetap tersimpan.`;
  } finally {
    b.disabled = false;
  }
});

document.getElementById('buangLuring')?.addEventListener('click', async () => {
  el.luringKabar.textContent = 'Membuang…';
  try {
    await perintah('buangSemua');
    el.luringKabar.textContent = 'Simpanan luring dibuang. Cangkangnya akan tersimpan lagi saat halaman dibuka dengan sinyal.';
    keadaanLuring();
  } catch (e) {
    el.luringKabar.textContent = `Gagal: ${e.message}`;
  }
});

keadaanLuring();
