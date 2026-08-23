/* Gambar kemasan pada layar rincian produk — beserta jalan bagi pembaca menyumbangkan
 * gambar yang lebih baru.
 *
 * DUA KEADAAN, DAN KEDUANYA HARUS BERBUNYI
 * 568 dari 14.920 produk punya gambar — 3,8%. Artinya keadaan yang LAZIM adalah tidak ada
 * gambar, dan slot kosong yang diam akan terbaca sebagai "produk ini meragukan". Karena itu
 * placeholder di sini tidak berupa kotak abu-abu: ia mengatakan apa yang terjadi
 * ("belum dipanen dari situs principal"), dan menawarkan apa yang bisa dilakukan.
 *
 * KENAPA FORMULIRNYA TIDAK MENGIRIM APA PUN SENDIRI
 * Permukaan ini statis: tanpa akun, tanpa server, tanpa satu pun tulisan pengguna yang
 * disimpan. Kotak masuk yang tak seorang pun di ujungnya lebih buruk daripada tidak ada
 * kotak masuk — itu alasan yang sama yang mencabut jalur lapor dari C2 di docs/15.
 *
 * Jadi yang dilakukan formulir ini SATU: menyusun rekaman berbentuk manifes dari apa yang
 * diketik, lalu menyerahkannya kembali kepada yang mengetik. Dua jalan keluar, dan keduanya
 * baru berjalan setelah ORANGNYA menekan: menyalin ke papan klip, atau membuka isu GitHub
 * yang sudah terisi. Tidak ada permintaan jaringan yang berangkat diam-diam, dan tidak ada
 * satu pun data yang meninggalkan peramban tanpa ketukan.
 *
 * Bentuk rekamannya mengikuti spec/schema/product-image.schema.json supaya yang masuk bisa
 * langsung ditinjau dengan alat yang sudah ada, bukan disalin ulang dengan tangan.
 */

import { teks, tanggal } from './pustaka.js';
import { bukaIsu, salin, REPO } from './serah.js';

const PERAN = {
  kemasan_depan: 'kemasan depan',
  panel_label: 'panel label',
  bidikan_produk: 'bidikan produk',
  logo: 'logo',
  lainnya: 'lainnya',
};

const HAK = {
  pemegang_pendaftaran: 'kanal terbit pemegang pendaftaran',
  pihak_ketiga: 'pihak ketiga — bukan pemegang pendaftaran',
  tidak_diketahui: 'tidak diketahui',
};

/**
 * Blok gambar untuk satu produk. `p` rekaman rincian produk dari indeks.
 * Selalu mengembalikan sesuatu — tidak pernah string kosong.
 */
export function blokGambar(p) {
  const ada = p.gambar?.length ? p.gambar : null;
  return `
    <div class="kartu kartu-gambar">
      <h2>Gambar kemasan</h2>
      ${ada ? gambarAda(p, ada) : gambarBelum(p)}
      ${formulirUsul(p)}
    </div>`;
}

function gambarAda(p, daftar) {
  const utama = daftar[0];
  const lain = daftar.slice(1);
  return `
    <figure class="kemasan">
      <img src="gambar/${teks(utama.f)}" alt="Kemasan ${teks(p.nama)}, ${teks(PERAN[utama.peran] ?? utama.peran)}."
           ${utama.w ? `width="${teks(utama.w)}"` : ''} ${utama.h ? `height="${teks(utama.h)}"` : ''}
           loading="lazy" decoding="async">
      <figcaption>
        ${teks(PERAN[utama.peran] ?? utama.peran)}${utama.penerbit ? ` · diterbitkan ${teks(utama.penerbit)}` : ''}${utama.diambil ? ` · diambil ${teks(tanggal(utama.diambil) ?? utama.diambil)}` : ''}.
        ${utama.halaman ? `<a href="${teks(utama.halaman)}" rel="nofollow noopener noreferrer external" target="_blank">Halaman sumbernya</a>.` : ''}
      </figcaption>
    </figure>

    ${lain.length ? `
      <div class="kemasan-lain">
        ${lain.map((g) => `
          <figure>
            <img src="gambar/${teks(g.k ?? g.f)}" alt="${teks(p.nama)} — ${teks(PERAN[g.peran] ?? g.peran)}."
                 loading="lazy" decoding="async">
            <figcaption>${teks(PERAN[g.peran] ?? g.peran)}</figcaption>
          </figure>`).join('')}
      </div>` : ''}

    ${utama.nomor ? `
      <p class="catatan">
        Nomor pendaftaran yang terbaca di gambar: <strong>${teks(utama.nomor)}</strong> —
        ${utama.nomorCocok
          ? 'dan nomor itu memang milik merek ini di registri.'
          : '<strong>dan nomor itu bukan milik merek ini di registri.</strong> Salah satunya keliru; halaman ini tidak memutuskan yang mana.'}
      </p>` : ''}

    <p class="catatan">
      <strong>Gambar ini bukan bukti apa pun tentang barang di tangan Anda.</strong> Ia foto
      dari kanal terbit ${utama.hak === 'pemegang_pendaftaran' ? 'pemegang pendaftarannya' : 'pihak lain'},
      diambil ${utama.diambil ? teks(tanggal(utama.diambil) ?? utama.diambil) : 'pada tarikan sebelumnya'} —
      desain kemasan berubah, dan pemalsu menyalin desain. Yang dibandingkan sebaiknya
      <em>kandungan yang tercetak</em>, bukan rupa kemasannya.
    </p>
    <p class="catatan">
      Dasar hak: ${teks(HAK[utama.hak] ?? utama.hak)}. Izin tertulis belum diminta.
    </p>`;
}

function gambarBelum(p) {
  return `
    <div class="kemasan-kosong" role="img"
         aria-label="Gambar kemasan belum tersedia di platform untuk ${teks(p.nama)}.">
      <span class="kemasan-ikon" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="48" height="48" focusable="false" aria-hidden="true">
          <rect x="7" y="12" width="34" height="28" rx="3"></rect>
          <path d="M7 32l9-9 7 7 6-6 12 12"></path>
          <circle cx="18" cy="21" r="3"></circle>
        </svg>
      </span>
      <p class="kemasan-kosong-judul">Gambar kemasan belum tersedia di platform</p>
    </div>
    <p class="catatan">
      Ini <strong>bukan tanda produknya tidak terdaftar</strong> — nomor pendaftarannya ada di
      kartu di atas. Yang belum ada gambarnya: situs pemegang pendaftaran belum dipanen, atau
      mereknya memang tidak dijual dalam kemasan eceran.
    </p>
    <p class="catatan">
      Gambar tersedia untuk <strong>568 dari 14.920 produk</strong> terdaftar. Kosong adalah
      keadaan yang lazim di sini, dan dinyatakan begitu alih-alih ditutupi kotak abu-abu.
    </p>`;
}

// ---------------------------------------------------------------------------
// Formulir usul — menyusun, lalu menyerahkan kembali
// ---------------------------------------------------------------------------
function formulirUsul(p) {
  const id = teks(p.id);
  return `
    <details class="usul-gambar" data-produk="${id}">
      <summary>Punya gambar kemasan yang lebih baru? Usulkan</summary>
      <div class="usul-isi">
        <p class="catatan">
          Yang paling berguna: <strong>foto dari kanal terbit pemegang pendaftarannya
          sendiri</strong> — situs resmi, katalog, atau akun resminya. Foto dari lapak
          penjual dan lokapasar tidak dipakai: yang perlu dipastikan bukan rupa barangnya,
          melainkan bahwa yang menerbitkan gambarnya adalah yang memegang pendaftarannya.
        </p>

        <label for="u-alamat-${id}">Alamat gambarnya (URL)</label>
        <input type="url" id="u-alamat-${id}" name="alamat" inputmode="url"
               placeholder="https://situs-principal.co.id/…/kemasan.jpg" autocomplete="off">

        <label for="u-halaman-${id}">Alamat halaman tempat gambar itu terbit</label>
        <input type="url" id="u-halaman-${id}" name="halaman" inputmode="url"
               placeholder="https://situs-principal.co.id/produk/…" autocomplete="off">

        <label for="u-peran-${id}">Yang tampak di gambar</label>
        <select id="u-peran-${id}" name="peran">
          <option value="kemasan_depan">Kemasan tampak depan</option>
          <option value="panel_label">Panel label (teks bahan aktif &amp; dosis)</option>
          <option value="bidikan_produk">Bidikan produk</option>
          <option value="lainnya">Lainnya</option>
        </select>

        <label for="u-catatan-${id}">Catatan — dari mana Anda tahu ini terbitan resminya</label>
        <textarea id="u-catatan-${id}" name="catatan" rows="3"
                  placeholder="misal: halaman produk di situs resmi PT …, bilah sisinya menyebut pemegang nomor pendaftaran"></textarea>

        <p class="catatan catatan-tegas">
          <strong>Tidak ada yang terkirim dari halaman ini.</strong> Tombol di bawah menyusun
          rekamannya lalu menyerahkannya kembali kepada Anda — disalin ke papan klip, atau
          dibuka sebagai isu GitHub yang sudah terisi. Anda yang menekan kirim, di tempat yang
          Anda pilih. Jangan menuliskan nama, nomor telepon, atau alamat Anda di kolom mana pun.
        </p>

        <p class="aksi-usul">
          <button type="button" data-aksi="salin">Salin rekamannya</button>
          <button type="button" data-aksi="isu">Buka isu GitHub yang sudah terisi</button>
        </p>
        <p class="usul-kabar" role="status" aria-live="polite"></p>
        <pre class="usul-pratinjau" hidden></pre>
      </div>
    </details>`;
}

/** Rekaman berbentuk manifes, dari apa yang diketik. Tidak pernah dikirim oleh berkas ini. */
function susunRekaman(p, medan) {
  return {
    brand_key: null,
    brand: { name: p.nama, manufacturer: p.produsen ?? null },
    narrowed_to: [{ id: p.id, label: p.nama }],
    narrowing: {
      basis: 'usulan_pembaca',
      strength: 'lemah',
      evidence: 'Diusulkan lewat halaman produk; belum diperiksa siapa pun.',
    },
    role: medan.peran || 'kemasan_depan',
    source: {
      url: medand(medan.alamat),
      page_url: medand(medan.halaman),
      publisher: null,
      rights: 'tidak_diketahui',
      permission: 'belum_diminta',
      redistributable: false,
    },
    review: { status: 'usulan', by: null, at: null },
    notes: { id: medand(medan.catatan) },
  };
}
const medand = (x) => (x && String(x).trim() ? String(x).trim() : null);

function medanDari(wadah, id) {
  const ambil = (nama) => wadah.querySelector(`[name="${nama}"]`)?.value ?? '';
  return { alamat: ambil('alamat'), halaman: ambil('halaman'), peran: ambil('peran'), catatan: ambil('catatan') };
}

/**
 * Pasang penangan untuk seluruh formulir usul di dalam `wadah`.
 * `bacaProduk()` mengembalikan rekaman produk yang sedang terbuka.
 */
export function pasangUsulGambar(wadah, bacaProduk) {
  wadah.addEventListener('click', async (ev) => {
    const tombol = ev.target.closest('.usul-gambar button[data-aksi]');
    if (!tombol) return;
    const kotak = tombol.closest('.usul-gambar');
    const kabar = kotak.querySelector('.usul-kabar');
    const pratinjau = kotak.querySelector('.usul-pratinjau');
    const p = bacaProduk();
    if (!p) return;

    const medan = medanDari(kotak, p.id);
    if (!medand(medan.alamat)) {
      kabar.textContent = 'Alamat gambarnya belum diisi — itu satu-satunya kolom yang wajib.';
      return;
    }

    const rekaman = susunRekaman(p, medan);
    const ndjson = JSON.stringify(rekaman);
    pratinjau.textContent = JSON.stringify(rekaman, null, 2);
    pratinjau.hidden = false;

    if (tombol.dataset.aksi === 'salin') {
      // Papan klip bisa ditolak peramban (mode privat, atau tanpa HTTPS). Pratinjau di
      // bawah tetap ada, jadi masih bisa disalin tangan — itu sebabnya ia digambar dulu.
      kabar.textContent = (await salin(ndjson))
        ? 'Tersalin. Tempelkan ke isu, surel, atau berkas manifes — terserah Anda.'
        : 'Peramban menolak papan klip. Salin dari kotak di bawah.';
      return;
    }

    // Isu GitHub: yang dibuka TAB BARU berisi formulir yang sudah terisi. Halaman ini tidak
    // mengirim apa pun; yang menekan "Submit" tetap orangnya, di situs yang ia kenali.
    const judul = `Usul gambar kemasan: ${p.nama}`;
    const badan = [
      `Produk: \`${p.id}\` — ${p.nama}`,
      `Pemegang pendaftaran: ${p.produsen ?? '—'}`,
      `Nomor pendaftaran: ${p.daftar ?? '—'}`,
      '',
      'Rekaman usulan (bentuk manifes):',
      '',
      '```json',
      JSON.stringify(rekaman, null, 2),
      '```',
      '',
      '_Disusun dari halaman produk. Belum diperiksa; `review.status` sengaja `usulan`._',
    ].join('\n');
    const hasil = bukaIsu({ judul, badan, label: 'gambar-kemasan' });
    if (hasil.dibuka) {
      kabar.textContent = 'Tab baru dibuka dengan isu yang sudah terisi. Belum terkirim — Anda yang menekan kirim di sana.';
      return;
    }
    // Alamat kepanjangan atau tab baru diblokir. Yang sudah diketik tidak boleh hilang
    // bersamanya — pratinjau di bawah sudah digambar, dan papan klip dicoba sekali lagi.
    await salin(ndjson);
    kabar.textContent = hasil.sebab === 'panjang'
      ? `Rekamannya terlalu panjang untuk dimuat alamat formulir isu. Sudah dicoba disalin — buka ${REPO}/issues/new lalu tempelkan.`
      : `Peramban memblokir tab baru. Salin dari kotak di bawah, lalu tempelkan di ${REPO}/issues/new`;
  });
}
