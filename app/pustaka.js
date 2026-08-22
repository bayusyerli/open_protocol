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

export async function ambil(jalan) {
  if (ingatan.has(jalan)) return ingatan.get(jalan);
  // `no-cache` berarti "tanya dulu", bukan "jangan simpan": peramban tetap menyimpan
  // berkasnya dan mengirim permintaan bersyarat, jadi yang belum berubah dijawab 304
  // tanpa isi. Ini dibayar satu perjalanan pulang-pergi per pecahan per muat halaman,
  // dan itu memang mahal di sinyal buruk — tetapi indeksnya turunan dan dibangun ulang
  // dengan `bangun-indeks.mjs`. Tanpa ini, yang membangun ulang akan melihat data lama
  // tanpa satu pun tanda bahwa yang dilihatnya sudah basi, dan diam-diam salah lebih
  // buruk daripada lambat. Anggaran byte di app/README.md tidak berubah karenanya:
  // 304 tidak membawa isi.
  const janji = fetch(`${BASIS}/${jalan}.json`, { cache: 'no-cache' }).then((r) => {
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

export const JENIS = { pestisida: 'Pestisida', pupuk: 'Pupuk', varietas: 'Varietas', bahan: 'Bahan aktif', gejala: 'Gejala' };

let meta = null;
export const bacaMeta = () => meta;
export async function muatMeta() {
  meta = await ambil('meta');
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
  wadah.innerHTML = `
    <p class="bantuan">${daftar.length} hasil${daftar.length > tampil.length ? `, ditampilkan ${tampil.length} teratas` : ''}.</p>
    <ul class="daftar">
      ${tampil.map((x) => `
        <li>
          <button type="button" data-id="${teks(x.i)}" data-pecahan="${teks(x.p)}">
            <span class="nama">${teks(x.n)}<span class="lencana">${teks(JENIS[x.j] ?? x.j)}</span></span>
            <span class="sub">${teks(x.k ?? '—')}</span>
            ${x.f ? `<span class="pembeda">${teks(x.f)}</span>`
              : (x.j === 'pupuk' || x.j === 'pestisida')
                ? '<span class="pembeda kosong-pembeda">komposisi tidak tercatat di registri</span>' : ''}
          </button>
        </li>`).join('')}
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
// apa yang dilihatnya. Kepalanya kecil — sepuluh OPT, 3,2 KB — jadi dibawa utuh
// sekali per sesi lalu dicocokkan kata per kata di sini.

const kata = (s) => (s ?? '')
  .normalize('NFKD').toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
  .split(/\s+/).filter(Boolean);

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
  return {
    q: p.get('q'),
    id: p.get('id'),
    pecahan: pecahan && BENTUK_PECAHAN.test(pecahan) ? pecahan : null,
    // Jalur 1 tidak memakai pecahan: daftar gejalanya dibawa utuh, jadi yang perlu
    // disebut cuma OPT mana yang dibuka.
    opt: opt && BENTUK_ID.test(opt) ? opt : null,
  };
}
