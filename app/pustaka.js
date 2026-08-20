/* Yang dipakai bersama jalur 2 dan jalur 4.
 *
 * Keduanya membaca indeks statis yang sama dan memakai kotak pencarian yang sama;
 * yang berbeda cuma apa yang ditampilkan sesudah satu entri dibuka. Menaruhnya di
 * satu tempat menahan dua perender agar tidak menyimpang diam-diam — dan layar
 * varietas memang muncul di kedua jalur.
 */

export const BASIS = '../spec/indeks';

const ingatan = new Map();

export async function ambil(jalan) {
  if (ingatan.has(jalan)) return ingatan.get(jalan);
  const janji = fetch(`${BASIS}/${jalan}.json`).then((r) => {
    if (!r.ok) throw new Error(`${jalan}: ${r.status}`);
    return r.json();
  });
  ingatan.set(jalan, janji);
  // Kegagalan tidak boleh ikut teringat: sinyal yang putus sebentar akan membuat
  // berkas itu gagal selamanya sampai halaman dimuat ulang.
  janji.catch(() => ingatan.delete(jalan));
  return janji;
}

export const rapikan = (s) => (s ?? '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g, '');

export const teks = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const tanggal = (s) => {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(+d) ? s : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const JENIS = { pestisida: 'Pestisida', pupuk: 'Pupuk', varietas: 'Varietas' };

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
          </button>
        </li>`).join('')}
    </ul>`;
}

export function tombolKembali(el, wadah, fokus) {
  const b = wadah.querySelector('#kembali');
  if (b) b.addEventListener('click', () => { wadah.innerHTML = ''; fokus.focus(); });
}

export const HTML_KEMBALI =
  '<button type="button" class="kembali" id="kembali">← Kembali ke hasil pencarian</button>';
