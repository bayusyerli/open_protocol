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
import { teks } from './pustaka.js';
import { pasangTombolTema } from './tema.js';

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
  el.kabar.textContent = 'Catatan peranti ini dihapus.';
  gambar();
});

gambar();
