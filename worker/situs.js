/* Pelayan situs statis di depan R2 — dan alasan ia harus ada.
 *
 * R2 BUKAN HOSTING SITUS STATIS. Ia menyimpan objek dan menyajikannya menurut kunci yang
 * persis: `GET /produk/larban-500-50-ec/` mencari objek bernama `produk/larban-500-50-ec/`
 * yang tidak pernah ada — yang ada `produk/larban-500-50-ec/index.html`. Seluruh 30 ribu
 * halaman entitas berbentuk begitu, dan tanpa berkas ini semuanya 404.
 *
 * Yang dikerjakan Worker ini empat hal, dan tiga di antaranya tidak bisa dikerjakan di
 * tempat lain:
 *
 *   1. Memetakan jalur berakhiran `/` ke `index.html` di dalamnya.
 *   2. Menyeragamkan alamat: `/produk/x` dialihkan ke `/produk/x/` dengan 301, supaya satu
 *      halaman tidak punya dua URL yang keduanya menjawab 200 — mesin pencari
 *      memperlakukannya sebagai isi ganda, dan canonical tidak menghapus pemborosan
 *      anggaran rayapnya.
 *   3. Memasang header yang TIDAK BISA dikirim lewat <meta>: `frame-ancestors` dan
 *      `X-Content-Type-Options`. Keduanya tercatat menunggu host di docs/20.
 *   4. Menyetel `Cache-Control` menurut jenis isinya — dan ini yang paling menentukan
 *      ongkos, karena yang menagih pada skala besar bukan bandwidth melainkan permintaan.
 *
 * KENAPA BUKAN WORKERS STATIC ASSETS, yang menangani nomor 1 dan 2 secara bawaan.
 * Ia menuntut Workers Paid begitu berkasnya lewat 20.000 — situs ini 41.852 — jadi ia $5
 * per bulan sejak hari pertama. R2 pada trafik awal benar-benar nol, dan permintaan Worker
 * masih di dalam kuota gratis 100.000/hari. Pindah ke sana layak dipertimbangkan ketika
 * permintaan Worker mulai ditagih; struktur berkasnya sama persis, jadi pindahnya murah.
 */

// Berapa lama peramban dan edge boleh menyimpan, menurut apa yang diminta.
//
// Pecahan indeks diambil dengan `?v=<cap>`: isi berubah berarti URL berubah, jadi salinan
// lama tidak akan pernah terpakai lagi dan peramban boleh berhenti bertanya sama sekali.
// `meta.json` justru sebaliknya — ia yang MENYEBUTKAN cap itu, jadi ia satu-satunya yang
// tidak boleh basi walau sedetik.
const setahun = 'public, max-age=31536000, immutable';
const seharian = 'public, max-age=86400';
const sejam = 'public, max-age=3600, must-revalidate';

function cacheUntuk(jalur, adaCap) {
  if (jalur.endsWith('/meta.json')) return 'no-cache';
  if (adaCap) return setahun;                               // pecahan indeks bercap
  if (/\.(webp|png|jpg|jpeg|svg|woff2?)$/.test(jalur)) return setahun;
  if (/\.(css|js)$/.test(jalur)) return seharian;           // cangkang app, dibebaskan cap sw
  if (/\.(xml|txt)$/.test(jalur)) return seharian;          // sitemap, robots, llms
  return sejam;                                             // HTML — berubah tiap build
}

const KEAMANAN = {
  // Diabaikan bila dikirim lewat <meta>, jadi ia hanya bisa dipasang di sini.
  'Content-Security-Policy': "frame-ancestors 'none'",
  // Menahan peramban menebak tipe dari isi — relevan karena situs ini menyajikan ribuan
  // berkas JSON berdampingan dengan HTML.
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export default {
  async fetch(permintaan, env) {
    const url = new URL(permintaan.url);

    if (permintaan.method !== 'GET' && permintaan.method !== 'HEAD') {
      return new Response('Metode tidak dilayani', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }

    let jalur = decodeURIComponent(url.pathname);

    // Jalur direktori -> index.html di dalamnya. Akar situs ikut aturan yang sama.
    if (jalur.endsWith('/')) jalur += 'index.html';

    let objek = await env.SITUS.get(jalur.replace(/^\/+/, ''));

    /* Tanpa garis miring di ujung: kalau yang diminta ternyata sebuah direktori, alihkan
     * alih-alih melayani. Melayani keduanya membuat satu halaman punya dua URL yang
     * sama-sama menjawab 200 — dan anggaran rayap terbuang pada salinan yang canonical
     * saja tidak cukup menghapusnya. */
    if (!objek && !jalur.endsWith('/index.html')) {
      const sebagaiDirektori = `${jalur.replace(/^\/+/, '')}/index.html`;
      if (await env.SITUS.head(sebagaiDirektori)) {
        const tujuan = new URL(url);
        tujuan.pathname = `${url.pathname}/`;
        return Response.redirect(tujuan.toString(), 301);
      }
    }

    if (!objek) {
      // 404 memakai halaman beranda situs supaya yang tersesat tetap punya jalan masuk —
      // tetapi dengan status 404, bukan 200. Halaman lunak yang menjawab 200 membuat
      // mesin pencari mengindeks ribuan alamat yang tidak ada.
      const beranda = await env.SITUS.get('index.html');
      if (!beranda) return new Response('Tidak ditemukan', { status: 404 });
      return new Response(beranda.body, {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': sejam, ...KEAMANAN },
      });
    }

    const kepala = new Headers();
    objek.writeHttpMetadata(kepala);                 // Content-Type dari metadata objek
    kepala.set('ETag', objek.httpEtag);
    kepala.set('Cache-Control', cacheUntuk(jalur, url.searchParams.has('v')));
    for (const [k, v] of Object.entries(KEAMANAN)) kepala.set(k, v);

    return new Response(permintaan.method === 'HEAD' ? null : objek.body, { headers: kepala });
  },
};
