/* Yang dipakai bersama jalur 2 dan jalur 4.
 *
 * Keduanya membaca indeks statis yang sama dan memakai kotak pencarian yang sama;
 * yang berbeda cuma apa yang ditampilkan sesudah satu entri dibuka. Menaruhnya di
 * satu tempat menahan dua perender agar tidak menyimpang diam-diam — dan layar
 * varietas memang muncul di kedua jalur.
 */

// Tidak diekspor: hanya `ambil()` di bawah yang memakainya.
const BASIS = '../spec/indeks';

const ingatan = new Map();

// Cap bangunan, dibaca dari meta.json. Ia yang membedakan satu indeks dari indeks
// berikutnya, dan karena itu ia yang membebaskan pecahan dari keharusan ditanyakan.
let cap = null;

/* Satu berkas ditanya, sisanya tidak.
 *
 * Sampai 23 Agustus 2026 setiap pengambilan memakai `cache: 'no-cache'` — "tanya dulu",
 * bukan "jangan simpan". Bytenya memang hemat: yang belum berubah dijawab 304 tanpa isi,
 * terukur 300 byte untuk berkas 13,5 KB. Yang tetap dibayar perjalanan pulang-perginya,
 * satu per berkas per muat halaman. Pada satu penelusuran 3–5 berkas dan RTT 300–600 ms
 * itu 1–3 detik sebelum apa pun tergambar, diulang tiap pindah halaman — pada permukaan
 * yang syarat lapangan nomor satunya justru sinyal buruk.
 *
 * Alasan `no-cache` sendiri tidak keliru: tanpa bertanya, yang membangun ulang indeks
 * akan melihat data lama tanpa satu pun tanda, dan diam-diam salah lebih buruk daripada
 * lambat. Yang berubah sekarang sebabnya, bukan gejalanya. `bangun-indeks.mjs` menerbitkan
 * `meta.cap`, hash atas seluruh pecahan, dan cap itu ditempelkan ke tiap URL. Isi berubah
 * → cap berubah → URL berubah → salinan lama tidak akan pernah terpakai lagi. Basi jadi
 * mustahil, jadi bertanya jadi tidak perlu.
 *
 * Yang tersisa satu pertanyaan per muat halaman, untuk meta.json sendiri: ia titik masuk
 * yang menyebutkan capnya, jadi ia satu-satunya yang namanya tidak boleh ikut berubah.
 *
 * Berapa lama salinan bercap disimpan tetap urusan yang menyajikan. Tanpa header
 * `Cache-Control` peramban memakai perkiraannya sendiri; dengan `immutable` ia berhenti
 * bertanya sama sekali. Keduanya kini aman — sebelum ada cap, tidak satu pun aman.
 */
export async function ambil(jalan) {
  // Pecahan tidak bisa diambil sebelum capnya diketahui. Ini tidak menambah perjalanan:
  // tiap halaman memang sudah memuat meta.json, hanya urutannya yang dipastikan.
  if (jalan !== 'meta' && cap === null) await muatMeta();
  if (ingatan.has(jalan)) return ingatan.get(jalan);

  const alamat = jalan === 'meta'
    ? `${BASIS}/meta.json`
    : `${BASIS}/${jalan}.json?v=${encodeURIComponent(cap)}`;

  const janji = fetch(alamat, jalan === 'meta' ? { cache: 'no-cache' } : undefined).then((r) => {
    if (!r.ok) throw new Error(`${jalan}: ${r.status}`);
    return r.json();
  });
  ingatan.set(jalan, janji);
  // Kegagalan tidak boleh ikut teringat: sinyal yang putus sebentar akan membuat
  // berkas itu gagal selamanya sampai halaman dimuat ulang.
  janji.catch(() => ingatan.delete(jalan));
  return janji;
}

// Tidak diekspor: pemakaiannya seluruhnya di dalam berkas ini.
const rapikan = (s) => (s ?? '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g, '');

export const teks = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const tanggal = (s) => {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(+d) ? s : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const JENIS = {
  pestisida: 'Pestisida', pupuk: 'Pupuk', varietas: 'Varietas', bahan: 'Bahan aktif',
  gejala: 'Gejala', principal: 'Perusahaan', harga: 'Harga',
  sediaan: 'Sediaan sendiri', opt: 'Hama & penyakit',
};

/**
 * Nama pemegang pendaftaran sebagai tautan ke profilnya — atau sebagai teks biasa.
 *
 * Dipakai di enam tempat: rincian produk, tabel setara, tabel merek per kadar, kartu
 * varietas, kartu hasil pencarian, dan daftar di halaman profil itu sendiri. Ditaruh di sini
 * karena aturannya satu dan mudah menyimpang: NAMANYA SELALU TAMPIL, tautannya hanya kalau
 * badan itu memang ada di kosakata principal.
 *
 * 576 varietas dipegang pemulia perorangan, dan mereka SENGAJA tidak punya halaman profil —
 * halaman bernama tentang orang adalah pemrosesan data pribadi tanpa dasar. Untuk mereka
 * fungsi ini mengembalikan nama apa adanya, dan itu bukan kegagalan yang perlu ditutup.
 */
export function namaPemegang(nama, key) {
  const t = teks(nama ?? '—');
  if (!nama || !key) return t;
  return `<a class="tautan-principal" href="principal.html?key=${encodeURIComponent(key)}">${t}</a>`;
}

let meta = null;
export const bacaMeta = () => meta;
export async function muatMeta() {
  meta = await ambil('meta');
  // Dipasang sebelum pengambilan pecahan mana pun; `ambil()` menunggu ini.
  cap = meta.cap ?? 'x';
  return meta;
}

// ---------------------------------------------------------------------------
// Ember pencarian
// ---------------------------------------------------------------------------
// Kepala pencarian dipecah menurut dua huruf pertama, dan awalan yang terlalu padat
// didalamkan jadi tiga. Yang didalamkan dicatat di meta, jadi penyaji tahu harus
// meminta tiga huruf tanpa perlu satu perjalanan gagal lebih dulu.
function emberUntuk(kueri) {
  const r = rapikan(kueri);
  if (r.length < 2) return { kurang: 2 - r.length };

  let panjang = 2;
  while (r.length >= panjang && meta.pecahan.cariDalam.includes(r.slice(0, panjang))) panjang++;

  if (r.length >= panjang) {
    const e = r.slice(0, panjang);
    return { ember: meta.pecahan.cari.includes(e) ? [e] : [] };
  }

  // Kueri lebih pendek dari ember yang dibutuhkan — ambil seluruh ember yang
  // berawalan sama. Daftar embernya sudah ada di meta, jadi tidak ada tebakan.
  const cocok = meta.pecahan.cari.filter((e) => e.startsWith(r));
  return cocok.length > 4 ? { kurang: 1 } : { ember: cocok };
}

/** `saring` membatasi jenis entri, mis. hanya varietas untuk jalur 4. */
export async function cari(kueri, saring) {
  const r = rapikan(kueri);
  const { ember, kurang } = emberUntuk(kueri);
  if (kurang) return { kurang };
  const isi = await Promise.all(ember.map((e) => ambil(`cari/${e}`)));
  const semua = isi.flat()
    .filter((x) => (saring ? saring(x) : true))
    .filter((x) => rapikan(x.n).includes(r));
  // Yang diawali kueri didahulukan; sisanya tetap ditampilkan karena nama di kemasan
  // kerap cuma sepotong dari nama terdaftarnya.
  semua.sort((a, b) => {
    const pa = rapikan(a.n).startsWith(r), pb = rapikan(b.n).startsWith(r);
    return pb - pa || a.n.localeCompare(b.n);
  });
  return { hasil: semua };
}

/**
 * Nama yang mudah tertukar: ejaan lain yang berdekatan, di ember yang sama.
 * Dipakai dua arah — untuk memperingatkan saat satu varietas dibuka, dan untuk
 * menawarkan ejaan terdekat saat sebuah nama tidak ditemukan sama sekali.
 */
export async function namaBerdekatan(nama, saring, batas = 5) {
  const r = rapikan(nama);
  if (r.length < 2) return [];
  const { ember } = emberUntuk(nama.slice(0, 3));
  if (!ember?.length) return [];
  const isi = (await Promise.all(ember.map((e) => ambil(`cari/${e}`)))).flat();
  return isi
    .filter((x) => (saring ? saring(x) : true))
    .map((x) => ({ x, d: jarak(r, rapikan(x.n)) }))
    .filter(({ x, d }) => d > 0 && d <= Math.max(1, Math.min(3, Math.floor(r.length / 3))) && rapikan(x.n) !== r)
    .sort((a, b) => a.d - b.d || a.x.n.localeCompare(b.x.n))
    .slice(0, batas)
    .map(({ x, d }) => ({ ...x, jarak: d }));
}

function jarak(a, b) {
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 3) return 99;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}

// ---------------------------------------------------------------------------
// Daftar hasil — bentuknya sama di kedua jalur
// ---------------------------------------------------------------------------
export function gambarHasil(wadah, daftar, kueri, kosongHtml) {
  if (!daftar.length) {
    wadah.innerHTML = kosongHtml(kueri);
    return;
  }
  const tampil = daftar.slice(0, 40);

  // Lencana jenis hanya berarti kalau hasilnya memang bercampur. Di jalur 3 seluruh
  // hasilnya pupuk dan di jalur 4 seluruhnya varietas: mencetak "PUPUK" tujuh belas kali
  // di halaman yang memang cuma tentang pupuk memakai tempat yang seharusnya milik
  // pembedanya, dan tidak memberi tahu apa pun.
  const banyakJenis = new Set(tampil.map((x) => x.j)).size > 1;

  // Nama yang muncul lebih dari sekali. Di situlah baris di bawah nama berhenti jadi
  // keterangan tambahan dan jadi SATU-SATUNYA cara memilih — PHONSKA ada empat grade
  // NPK, dan keempatnya rekaman yang sah, bukan rekaman ganda.
  const grup = new Map();
  for (const x of tampil) {
    const k = String(x.n ?? '').toLowerCase();
    if (!grup.has(k)) grup.set(k, []);
    grup.get(k).push(x);
  }
  const berulang = [...grup.values()].filter((g) => g.length > 1);
  const bernamaSama = berulang.reduce((a, g) => a + g.length, 0);
  const senama = (x) => (grup.get(String(x.n ?? '').toLowerCase())?.length ?? 0) > 1;

  // Yang diperiksa bukan "apakah medannya sama persis", melainkan APAKAH MEDAN ITU
  // MEMISAHKAN kelompoknya. Dua ABAMEKTIN 95 TC berkomposisi identik dan berbeda
  // pemegang: komposisinya ada, tetapi bukan komposisi yang membedakan keduanya.
  // Kalimat yang menyuruh membaca komposisi di layar itu mengirim orang ke baris yang
  // justru sama. Varietas lebih tajam lagi — ia tidak punya komposisi sama sekali.
  const beda = (g, ambilKunci) => new Set(g.map(ambilKunci)).size === g.length;
  const kunciPenuh = (x) => [x.f ?? '', x.k ?? ''].join('\u0000').toLowerCase();
  const olehKomposisi = berulang.every((g) => beda(g, (x) => String(x.f ?? '')));
  const grupKembar = berulang.filter((g) => !beda(g, kunciPenuh));

  // Rekaman yang tidak terpisahkan medan mana pun di indeks cari. Ia tetap bukan rekaman
  // ganda — yang membedakannya nomor pendaftaran, dan indeks cari tidak membawanya.
  // Menampilkan dua kartu kembar tanpa keterangan terbaca sebagai data rusak; yang benar
  // mengatakan bahwa layar inilah yang tidak bisa membedakannya.
  const kembarSet = new Set();
  for (const g of grupKembar) {
    const hitung = new Map();
    for (const x of g) hitung.set(kunciPenuh(x), (hitung.get(kunciPenuh(x)) ?? 0) + 1);
    for (const x of g) if (hitung.get(kunciPenuh(x)) > 1) kembarSet.add(x);
  }

  const catatan = bernamaSama < 2 ? ''
    : olehKomposisi
      ? ` <strong>${bernamaSama} di antaranya bernama sama</strong> — yang membedakan komposisinya.`
      : grupKembar.length === 0
        ? ` <strong>${bernamaSama} di antaranya bernama sama</strong> — yang membedakan ada di baris di bawah namanya.`
        : grupKembar.length === berulang.length
          ? ` <strong>${bernamaSama} di antaranya bernama sama</strong>, dan indeks pencarian tidak membawa yang membedakannya — buka untuk melihat.`
          : ` <strong>${bernamaSama} di antaranya bernama sama</strong> — sebagian terbedakan di baris di bawahnya, sisanya baru setelah dibuka.`;

  wadah.innerHTML = `
    <p class="bantuan">${daftar.length} hasil${daftar.length > tampil.length ? `, ditampilkan ${tampil.length} teratas` : ''}.${catatan}</p>
    <ul class="daftar">
      ${tampil.map((x) => {
        const serupa = senama(x);
        const kembar = kembarSet.has(x);
        const pembeda = x.f
          ? `<span class="pembeda${serupa ? ' pembeda-utama' : ''}">${teks(x.f)}</span>`
          : (x.j === 'pupuk' || x.j === 'pestisida')
            ? '<span class="pembeda kosong-pembeda">komposisi tidak tercatat di registri</span>' : '';
        return `
        <li>
          <button type="button" data-id="${teks(x.i)}" data-pecahan="${teks(x.p)}">
            <span class="nama">${teks(x.n)}${banyakJenis ? `<span class="lencana">${teks(JENIS[x.j] ?? x.j)}</span>` : ''}</span>
            ${pembeda}
            <span class="sub">${teks(x.k ?? '—')}</span>
            ${kembar ? '<span class="sub kembar">Pendaftaran terpisah — yang membedakannya tidak dibawa indeks pencarian.</span>' : ''}
          </button>
        </li>`;
      }).join('')}
    </ul>`;
}

/**
 * Pasang perilaku tombol "kembali" yang sudah tergambar di dalam `wadah`.
 *
 * Versi sebelumnya, `tombolKembali()`, tidak pernah dipanggil satu berkas pun — dan
 * sementara ia menganggur, keenam jalur menulis penangannya masing-masing: tujuh
 * salinan dari perilaku yang sama. Sebabnya kelihatan begitu ketujuhnya disejajarkan:
 * fungsi lamanya hanya melayani satu dari dua rupa yang benar-benar dipakai, jadi
 * empat jalur memang tidak bisa memakainya. (Parameter pertamanya bahkan tidak
 * terpakai di dalam badannya.)
 *
 * Dua rupa itu, dan keduanya bukan pilihan gaya:
 *  - `fokus`    layar yang dibuka dari kotak cari. Kosongkan, lalu kembalikan fokus ke
 *               kotaknya supaya yang mengetik bisa langsung mengetik lagi.
 *  - `gulirKe`  layar yang dibuka dari daftar di halaman yang sama. Kosongkan, lalu
 *               bawa mata kembali ke daftarnya. Fokus tidak dipindah karena yang
 *               ditinggalkan daftar, bukan satu kontrol.
 *  - `sesudah`  keadaan yang ikut direset; jalur 3 menyimpan pilihan produknya.
 */
export function pasangKembali(wadah, { fokus, gulirKe, sesudah } = {}) {
  const b = wadah.querySelector('#kembali');
  if (!b) return;
  b.addEventListener('click', () => {
    wadah.innerHTML = '';
    sesudah?.();
    if (gulirKe) gulirKe.scrollIntoView({ block: 'start' });
    fokus?.focus();
  });
}

export const HTML_KEMBALI =
  '<button type="button" class="kembali" id="kembali">← Kembali ke hasil pencarian</button>';

// ---------------------------------------------------------------------------
// Pencarian gejala
// ---------------------------------------------------------------------------
// Gejala tidak bisa diember menurut dua huruf pertama: yang mengetik "daun
// mengeriting ke atas" bukan sedang mengetik awalan sebuah nama, ia sedang menyebut
// apa yang dilihatnya. Kepalanya kecil — sembilan belas OPT, 9,6 KB — jadi dibawa utuh
// sekali per sesi lalu dicocokkan kata per kata di sini.

const kata = (s) => (s ?? '')
  .normalize('NFKD').toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
  .split(/\s+/).filter(Boolean);

// ---------------------------------------------------------------------------
// Kamus nama lokal — A3
// ---------------------------------------------------------------------------
// Yang mengetik "patek" tidak sedang mengetik awalan nama terdaftar, dan tidak sedang
// menyebut gejala — ia menyebut nama penyakitnya dalam bahasanya sendiri. Kamusnya
// kecil, jadi dibawa utuh sekali per sesi seperti kepala gejala.
//
// Yang belum terpetakan ikut dikembalikan, dan itu disengaja: "bercak daun" yang
// dijawab nol terbaca sebagai "tidak ada penyakitnya", sedangkan yang dijawab
// "namanya kami kenal, cakupannya yang belum ada" mengirim orang ke tempat yang benar.
export async function cariNamaLokal(kueri) {
  const r = rapikan(kueri);
  if (r.length < 3) return [];
  const daftar = await ambil('nama-lokal');
  return daftar
    .filter((x) => rapikan(x.n).includes(r))
    // Yang persis lebih dulu, lalu yang terpetakan, lalu abjad. Nama yang belum
    // terpetakan tetap tampil, cuma tidak mendahului yang bisa dibuka.
    .sort((a, b) =>
      (rapikan(b.n) === r) - (rapikan(a.n) === r) ||
      (b.ke.length > 0) - (a.ke.length > 0) ||
      a.n.localeCompare(b.n))
    .slice(0, 6);
}

export async function cariGejala(kueri) {
  const kk = kata(kueri).filter((w) => w.length >= 3);
  if (!kk.length) return [];
  const daftar = await ambil('gejala-cari');

  // Separuh kata harus cocok, dibulatkan ke atas. Tanpa ambang itu satu kata lazim
  // seperti "daun" memanggil kesepuluh gejalanya, dan daftar yang selalu penuh sama
  // tidak berartinya dengan daftar yang selalu kosong.
  const ambang = Math.ceil(kk.length / 2);

  return daftar
    .map((g) => {
      const t = kata(g.t);
      const ada = new Set(t);
      // Kata utuh, atau awalan sepanjang minimal empat huruf — supaya "kerit"
      // menemukan "mengeriting" tanpa "ata" ikut menemukan "atas".
      const cocok = kk.filter((w) => ada.has(w) || (w.length >= 4 && t.some((x) => x.startsWith(w))));
      return { ...g, cocok: cocok.length, dari: kk.length };
    })
    .filter((g) => g.cocok >= ambang)
    .sort((a, b) => b.cocok - a.cocok || b.produk - a.produk)
    .slice(0, 6);
}

// ---------------------------------------------------------------------------
// Tautan masuk dari beranda
// ---------------------------------------------------------------------------
// Beranda mencari nama, bahan aktif, dan gejala; yang membuka rinciannya tetap jalur
// yang memang perendernya. Bentuk tautannya dibaca di satu tempat supaya ketiga jalur
// membacanya sama, dan supaya nanti tidak ada jalur keempat yang mengarangnya sendiri.
//
// Nilainya datang dari bilah alamat, jadi tidak dipercaya: `pecahan` ikut menyusun
// jalur berkas yang diambil, jadi hanya bentuk `nama/berkas` yang diterima.

const BENTUK_PECAHAN = /^[a-z]+\/[a-z0-9_-]+$/i;
const BENTUK_ID = /^op:[a-z]{3}:[0-9]+$/;

export function tautanMasuk() {
  const p = new URLSearchParams(location.search);
  const pecahan = p.get('pecahan');
  const opt = p.get('opt');
  const resep = p.get('resep');
  const hama = p.get('hama');
  const kom = p.get('kom');
  return {
    q: p.get('q'),
    id: p.get('id'),
    pecahan: pecahan && BENTUK_PECAHAN.test(pecahan) ? pecahan : null,
    // Jalur 1 tidak memakai pecahan: daftar gejalanya dibawa utuh, jadi yang perlu
    // disebut cuma OPT mana yang dibuka.
    opt: opt && BENTUK_ID.test(opt) ? opt : null,
    // Kunci resep ikut menyusun jalur berkas, jadi bentuknya dibatasi sama ketatnya
    // seperti `pecahan`: huruf dan angka saja, tanpa titik dan tanpa garis miring.
    resep: resep && /^[a-z0-9]+$/i.test(resep) ? resep : null,
    hama: hama && /^[a-z0-9]+$/i.test(hama) ? hama : null,
    // Komoditas yang ikut disebut penunjuk. Nilainya TIDAK dipakai menyusun jalur
    // berkas — jalur 1 mencocokkannya dengan daftar komoditas yang memang dibawa
    // rekaman OPT-nya, lalu memakai berkas dari daftar itu. Bentuknya tetap dibatasi
    // supaya yang tidak cocok gugur sebelum sempat dibandingkan.
    kom: kom && /^[a-z0-9]+$/i.test(kom) ? kom : null,
  };
}
