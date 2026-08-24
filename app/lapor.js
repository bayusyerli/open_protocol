/* Pintu serah-terima laporan gejala — G3 pada docs/15-kapabilitas-lintas-pemangku.md.
 *
 * G3 menulis bahayanya sebelum satu baris kode pun ada, dan bahaya itu yang merancang
 * berkas ini: "laporan gejala dari warga adalah data mentah; MENYEBUTNYA WABAH ADALAH
 * KESIMPULAN. Peta yang menampilkan titik-titik laporan tanpa verifikasi bisa memicu
 * penyemprotan massal yang tidak perlu — dan kerugiannya ditanggung petani, sementara
 * yang untung penjual pestisida."
 *
 * Dari situ turun tiga hal yang TIDAK dibangun, dan ketiganya keputusan bukan kekurangan:
 *
 *   Tidak ada kotak masuk. Permukaan ini tidak menerima laporan — ia menyusunnya lalu
 *   menyerahkannya kembali. Aturan lapisan gratis, dan preseden C2: kotak masuk yang tak
 *   seorang pun di ujungnya lebih buruk daripada tidak ada kotak masuk.
 *
 *   Tidak ada peta. Titik laporan yang belum diverifikasi persis bahaya di atas, dan
 *   `L37` menolaknya di lapis data supaya ia tidak bisa tersusun bahkan kalau ada yang
 *   mencoba membuatnya di lapis penyaji.
 *
 *   Tidak ada identifikasi. Yang keluar dari sini "dugaan beserta dasarnya", bukan nama
 *   hama sebagai kesimpulan — sama seperti medan `suspected` di observation.schema.json,
 *   yang memang tidak punya saudara bernama `identified`.
 *
 * YANG DIBANGUN: LENGAN. docs/15 menyebut perannya "memberi lengan pada rantai POPT yang
 * sudah ada, bukan menggantikannya: laporan warga masuk sebagai pengamatan, verifikasi
 * tetap milik POPT". Lengan itu tiga bagian — menyusun laporan yang berdasar, menemukan
 * balai penyuluhan yang membina kecamatannya, dan menyerahkan keduanya kepada yang
 * melapor.
 *
 * DASARNYA DATANG DARI BLOK "PASTIKAN DULU", DAN ITU YANG MEMBEDAKANNYA DARI TEBAKAN.
 * Tiap OPT terkurasi membawa dua ciri pembanding yang bisa diperiksa sendiri. Laporan
 * yang menyebut ciri mana yang sudah dicek dan mana yang belum berhenti jadi "sepertinya
 * trips" dan mulai jadi pengamatan yang bisa ditimbang orang lain. Yang belum diperiksa
 * ikut tertulis — justru itu yang paling berguna bagi penyuluh yang datang, karena ia
 * tahu apa yang harus dilihat lebih dulu.
 *
 * DAN LAPORAN INI MENYATAKAN APA YANG BUKAN DIRINYA. Ia bukan permintaan penyemprotan.
 * Kalimat itu dicetak di badan laporan, bukan di layar yang ditinggalkan saat pesannya
 * dikirim — karena yang membaca laporannya penyuluh, bukan yang menyusunnya.
 */

import { teks } from './pustaka.js';
import { salin } from './serah.js';

const n = (x) => Number(x ?? 0).toLocaleString('id-ID');

const LUAS = {
  few_plants: 'baru beberapa tanaman',
  patches: 'berpetak-petak, belum merata',
  widespread: 'hampir merata di petak',
  unknown: 'belum bisa diperkirakan',
};

const CEK = {
  cocok: 'cocok',
  tidak: 'TIDAK cocok',
  belum: 'belum diperiksa',
};

/**
 * Blok pintu laporan. `k` rekaman OPT terkurasi yang sedang terbuka —
 * yang dipakai `nama`, `ilmiah`, dan `pembanding`.
 */
export function blokLapor(k) {
  const ciri = k.pembanding ?? [];
  return `
    <details class="lapor">
      <summary>Laporkan ke penyuluh</summary>
      <div class="lapor-isi">
        <p>
          Yang disusun di sini <strong>pengamatan</strong>, bukan kesimpulan. Yang
          memastikan hama ini memang yang ada di kebunmu bukan halaman ini, melainkan
          petugas yang datang melihat — dan laporan yang baik justru yang menyebutkan apa
          yang <em>belum</em> dipastikan.
        </p>

        ${ciri.length ? `
        <fieldset class="lapor-medan">
          <legend>Dua ciri di atas — mana yang sudah kamu periksa?</legend>
          ${ciri.map((p, i) => `
            <div class="lapor-ciri">
              <p class="lapor-tanya">${teks(p.cek)}</p>
              <div class="lapor-pilih">
                ${Object.entries(CEK).map(([v, label]) => `
                  <label>
                    <input type="radio" name="ciri${i}" value="${v}"${v === 'belum' ? ' checked' : ''}>
                    <span>${teks(label)}</span>
                  </label>`).join('')}
              </div>
            </div>`).join('')}
        </fieldset>` : ''}

        <fieldset class="lapor-medan">
          <legend>Seberapa luas yang kamu lihat</legend>
          <div class="lapor-pilih">
            ${Object.entries(LUAS).map(([v, label]) => `
              <label>
                <input type="radio" name="luas" value="${v}"${v === 'unknown' ? ' checked' : ''}>
                <span>${teks(label)}</span>
              </label>`).join('')}
          </div>
        </fieldset>

        <label for="lp-lihat">Apa yang kamu lihat, dengan katamu sendiri</label>
        <textarea id="lp-lihat" name="lihat" rows="3"
                  placeholder="misal: daun muda mengeriting ke atas dan mengecil, ada bintik perak di permukaan atasnya, mulai di pojok petak dekat pematang"></textarea>

        <label for="lp-wilayah">Kabupaten atau kota kamu — untuk menemukan balai penyuluhannya</label>
        <input type="search" id="lp-wilayah" name="wilayah" autocomplete="off"
               placeholder="misal: Rembang">
        <div class="lapor-balai" aria-live="polite"></div>

        <p class="lapor-catat lapor-catat-tegas">
          <strong>Tidak ada yang terkirim dari halaman ini.</strong> Laporannya disusun di
          perangkatmu lalu diserahkan kembali kepadamu — disalin, atau dibuka di WhatsApp
          untuk kamu kirim sendiri ke penyuluh yang kamu pilih. Tidak ada peta laporan, dan
          itu disengaja: titik-titik yang belum diperiksa siapa pun memicu penyemprotan yang
          kerugiannya ditanggung petani.
        </p>

        <p class="lapor-aksi">
          <button type="button" data-lapor="wa">Kirim lewat WhatsApp</button>
          <button type="button" data-lapor="salin">Salin laporannya</button>
        </p>
        <p class="lapor-kabar" role="status" aria-live="polite"></p>
        <pre class="lapor-pratinjau" hidden></pre>
      </div>
    </details>`;
}

function susunLaporan(kotak, k, balai) {
  const ciri = k.pembanding ?? [];
  const nilai = (nm) => kotak.querySelector(`[name="${nm}"]:checked`)?.value ?? null;
  const lihat = kotak.querySelector('[name="lihat"]')?.value.trim();
  if (!lihat) return { salah: 'Tulis dulu apa yang kamu lihat — itu bagian yang tidak bisa digantikan daftar centang.' };

  const baris = [
    '*Laporan gejala — belum diverifikasi*',
    '───────────────',
    `Yang saya lihat: ${lihat}`,
    `Seberapa luas: ${LUAS[nilai('luas')] ?? LUAS.unknown}`,
    '',
    `Dugaan sementara: *${k.nama}*${k.ilmiah ? ` (${k.ilmiah})` : ''}`,
  ];

  if (ciri.length) {
    baris.push('', 'Ciri yang saya periksa sendiri:');
    for (const [i, p] of ciri.entries()) {
      baris.push(`· ${p.cek} — ${CEK[nilai(`ciri${i}`)] ?? CEK.belum}`);
    }
    const belum = ciri.filter((_, i) => (nilai(`ciri${i}`) ?? 'belum') === 'belum').length;
    // Yang belum diperiksa disebut sebagai kalimat, bukan dibiarkan tersirat dari daftar.
    // Penyuluh yang membaca ini perlu tahu apa yang harus dilihat lebih dulu, dan itu
    // justru bagian yang paling mudah hilang saat laporan dipendekkan.
    if (belum) baris.push(`(${belum} dari ${ciri.length} ciri belum saya periksa.)`);
  }

  if (balai) {
    baris.push('', `Balai penyuluhan yang membina: ${balai}`);
  }

  baris.push(
    '',
    '⚠ Ini *pengamatan*, bukan kesimpulan, dan *bukan permintaan penyemprotan*.',
    'Yang memastikan hamanya petugas yang datang melihat. Dugaan di atas datang dari',
    'mencocokkan gejala di halaman Pranatani, bukan dari pemeriksaan lapangan.',
    '───────────────',
  );
  return { teks: baris.join('\n') };
}

/**
 * Pasang penangan pintu laporan.
 * @param {HTMLElement} wadah wadah yang memuat blokLapor
 * @param {() => object|null} bacaOpt OPT yang sedang terbuka, dibaca saat diketuk
 * @param {() => Array} bacaWilayah daftar wilayah BPP `[{k,w,n,kec}]`
 * @param {(kunci: string) => Promise<Array>} ambilBalai pengambil pecahan balai
 */
export function pasangLapor(wadah, bacaOpt, bacaWilayah, ambilBalai) {
  let balaiTerpilih = null;

  wadah.addEventListener('input', async (ev) => {
    if (ev.target.name !== 'wilayah') return;
    const kotak = ev.target.closest('.lapor');
    const tampil = kotak.querySelector('.lapor-balai');
    const r = ev.target.value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    balaiTerpilih = null;
    if (r.length < 3) { tampil.innerHTML = ''; return; }
    const cocok = (bacaWilayah() ?? []).filter((w) =>
      w.w.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, ' ').includes(r)).slice(0, 6);
    if (!cocok.length) {
      tampil.innerHTML = '<p class="kosong">Tidak ada kabupaten yang cocok. Cakupannya 504 dari 514 — pemekaran Papua belum masuk basis data sumbernya.</p>';
      return;
    }
    tampil.innerHTML = `<ul class="lapor-daftar">${cocok.map((w) => `
      <li><button type="button" data-balai="${teks(w.k)}">${teks(w.w)}<span class="lencana">${n(w.n)}</span></button></li>`).join('')}</ul>`;
  });

  wadah.addEventListener('click', async (ev) => {
    const pilih = ev.target.closest('button[data-balai]');
    if (pilih) {
      const kotak = pilih.closest('.lapor');
      const tampil = kotak.querySelector('.lapor-balai');
      tampil.innerHTML = '<p class="kosong">Mengambil…</p>';
      try {
        const isi = await ambilBalai(pilih.dataset.balai);
        const w = (bacaWilayah() ?? []).find((x) => x.k === pilih.dataset.balai);
        // Balai tidak punya alamat, jadi yang ditawarkan BUKAN peta melainkan pilihan
        // menurut kecamatan — dan yang melapor tahu kecamatannya sendiri.
        tampil.innerHTML = `
          <p class="bantuan">${n(isi.length)} balai di ${teks(w?.w ?? '')}. Pilih yang membina kecamatanmu:</p>
          <ul class="lapor-daftar">${isi.map((b) => `
            <li><button type="button" data-pilihbalai="${teks(b.n)}">
              ${teks(b.n)}<span class="sub">${b.k.length ? teks(b.k.join(', ')) : 'kecamatan kosong di sumbernya'}</span>
            </button></li>`).join('')}</ul>`;
      } catch (e) {
        tampil.innerHTML = `<p class="kosong">Gagal diambil: ${teks(e.message)}</p>`;
      }
      return;
    }

    const set = ev.target.closest('button[data-pilihbalai]');
    if (set) {
      balaiTerpilih = set.dataset.pilihbalai;
      const kotak = set.closest('.lapor');
      kotak.querySelector('.lapor-balai').innerHTML =
        `<p class="lapor-terpilih">Balai terpilih: <strong>${teks(balaiTerpilih)}</strong>. Laporan akan menyebutkannya.</p>`;
      return;
    }

    const tombol = ev.target.closest('button[data-lapor]');
    if (!tombol) return;
    const kotak = tombol.closest('.lapor');
    const kabar = kotak.querySelector('.lapor-kabar');
    const pratinjau = kotak.querySelector('.lapor-pratinjau');
    const k = bacaOpt?.();
    if (!k) { kabar.textContent = 'Tidak ada dugaan yang sedang terbuka.'; return; }

    const { teks: isi, salah } = susunLaporan(kotak, k, balaiTerpilih);
    if (salah) { kabar.textContent = salah; kotak.querySelector('[name="lihat"]').focus(); return; }

    pratinjau.textContent = isi;
    pratinjau.hidden = false;

    if (tombol.dataset.lapor === 'salin') {
      kabar.textContent = (await salin(isi))
        ? 'Tersalin. Tempelkan ke mana pun — WhatsApp, SMS, atau tunjukkan langsung di balai.'
        : 'Peramban menolak papan klip. Salin dari kotak di bawah.';
      return;
    }
    const alamat = `https://wa.me/?text=${encodeURIComponent(isi)}`;
    if (alamat.length > 2000) {
      await salin(isi);
      kabar.textContent = 'Laporannya terlalu panjang untuk alamat WhatsApp, dan memotongnya '
        + 'akan membuang bagian yang menyebut apa yang belum diperiksa. Sudah disalin; tempelkan langsung.';
      return;
    }
    const tab = window.open(alamat, '_blank', 'noopener,noreferrer');
    kabar.textContent = tab
      ? 'WhatsApp dibuka dengan laporannya. Belum terkirim — kamu yang memilih penerimanya.'
      : 'Peramban memblokir tab baru. Salin dari kotak di bawah.';
    if (!tab) await salin(isi);
  });
}
