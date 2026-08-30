// Uji pelayan situs R2 — pemetaan jalur, pengalihan, dan header.
//
//   node spec/tools/uji-worker.mjs
//
// KENAPA INI DIUJI, PADAHAL WORKER-NYA CUMA SERATUS BARIS.
// Ia berdiri di antara pengunjung dan 30 ribu halaman, dan satu keputusan di dalamnya —
// bahwa `/produk/x/` berarti objek `produk/x/index.html` — menentukan seluruh situs jalan
// atau seluruhnya 404. Tidak ada keadaan di antaranya, dan tidak ada cara mengetahuinya
// selain mencoba. Mencobanya di produksi berarti mengetahuinya dari pengunjung.
//
// R2 disulih dengan Map: yang diuji logika pemetaan dan headernya, bukan R2-nya sendiri.

const { default: worker } = await import(new URL('../../worker/situs.js', import.meta.url));

const ISI = new Map([
  ['index.html', '<h1>beranda</h1>'],
  ['produk/index.html', '<h1>Produk terdaftar</h1>'],
  ['produk/larban-500-50-ec/index.html', '<h1>LARBAN</h1>'],
  ['gaya.css', 'body{}'],
  ['gambar/kemasan.webp', 'biner'],
  ['sitemap-produk.xml', '<urlset/>'],
  ['spec/indeks/meta.json', '{"cap":"abc"}'],
  ['spec/indeks/produk/001.json', '[]'],
]);

const objek = (kunci) => ({
  body: ISI.get(kunci),
  httpEtag: `"${kunci.length}"`,
  writeHttpMetadata(h) {
    // TANPA charset, dan itu disengaja: `aws s3 sync` menurunkan tipe dari ekstensi dan
    // berhenti di situ, jadi inilah yang benar-benar tersimpan di R2. Stub yang murah hati
    // menuliskan `; charset=utf-8` sendiri akan membuat uji ini menegaskan perilaku yang
    // produksi tidak punya — dan itu persis yang terjadi sampai 30 Agustus 2026.
    const t = kunci.endsWith('.html') ? 'text/html'
      : kunci.endsWith('.json') ? 'application/json'
        : kunci.endsWith('.css') ? 'text/css'
          : kunci.endsWith('.xml') ? 'application/xml'
            : kunci.endsWith('.webp') ? 'image/webp' : 'application/octet-stream';
    h.set('Content-Type', t);
  },
});

const env = {
  SITUS: {
    async get(k) { return ISI.has(k) ? objek(k) : null; },
    async head(k) { return ISI.has(k) ? { key: k } : null; },
  },
};

const minta = (jalur, metode = 'GET') =>
  worker.fetch(new Request(`https://pranatani.com${jalur}`, { method: metode, redirect: 'manual' }), env);

const mintaHost = (host, jalur) =>
  worker.fetch(new Request(`https://${host}${jalur}`, { redirect: 'manual' }), env);

let lolos = 0; const gagal = [];
const uji = (nama, dapat, harap) => {
  if (Object.is(dapat, harap)) { lolos++; return; }
  gagal.push(`${nama}\n    diharap : ${JSON.stringify(harap)}\n    didapat : ${JSON.stringify(dapat)}`);
};

// --- pemetaan direktori ke index.html — inti berkas ini -------------------------------
{
  const r = await minta('/produk/larban-500-50-ec/');
  uji('halaman entitas dilayani', r.status, 200);
  uji('  isinya benar', await r.text(), '<h1>LARBAN</h1>');
  uji('  tipenya HTML', r.headers.get('Content-Type'), 'text/html; charset=utf-8');
}
uji('akar situs jadi index.html', (await minta('/')).status, 200);
uji('hub klaster dilayani', (await minta('/produk/')).status, 200);

// --- satu halaman, satu URL ------------------------------------------------------------
{
  const r = await minta('/produk/larban-500-50-ec');
  uji('tanpa garis miring dialihkan', r.status, 301);
  uji('  ke jalur bergaris miring', new URL(r.headers.get('Location')).pathname,
    '/produk/larban-500-50-ec/');
}

// --- satu situs, satu host --------------------------------------------------------------
// `www` diproksi sama seperti apex; tanpa alihan ini ia tidak pernah sampai ke Worker
// dengan benar dan situsnya punya dua alamat yang sama-sama sah.
{
  const r = await mintaHost('www.pranatani.com', '/produk/larban-500-50-ec/');
  uji('www dialihkan ke apex', r.status, 301);
  uji('  host jadi apex', new URL(r.headers.get('Location')).hostname, 'pranatani.com');
  uji('  jalurnya utuh', new URL(r.headers.get('Location')).pathname,
    '/produk/larban-500-50-ec/');
  const q = await mintaHost('www.pranatani.com', '/spec/indeks/produk/001.json?v=abc');
  uji('  kueri ikut terbawa', new URL(q.headers.get('Location')).search, '?v=abc');
  uji('apex TIDAK dialihkan', (await mintaHost('pranatani.com', '/produk/')).status, 200);
}

// --- yang benar-benar tidak ada ---------------------------------------------------------
{
  const r = await minta('/produk/tidak-pernah-ada/');
  uji('entitas tak ada -> 404', r.status, 404);
  uji('  bukan 200 lunak', r.status !== 200, true);
  uji('  tetap memberi jalan masuk', (await r.text()).includes('beranda'), true);
}

// --- Cache-Control menurut jenis isinya -------------------------------------------------
const cc = async (jalur) => (await minta(jalur)).headers.get('Cache-Control');
uji('pecahan bercap -> setahun immutable', await cc('/spec/indeks/produk/001.json?v=abc'),
  'public, max-age=31536000, immutable');
uji('meta.json TIDAK pernah di-cache', await cc('/spec/indeks/meta.json'), 'no-cache');
uji('meta.json tetap no-cache walau bercap', await cc('/spec/indeks/meta.json?v=abc'), 'no-cache');
uji('gambar -> setahun', await cc('/gambar/kemasan.webp'), 'public, max-age=31536000, immutable');
// Cangkang seumur HTML-nya, bukan lebih lama: umur simpan yang berbeda pada dua berkas
// yang wajib sepakat menghasilkan halaman campur bagi pembaca tanpa service worker.
uji('css -> sejam, wajib revalidasi', await cc('/gaya.css'), 'public, max-age=3600, must-revalidate');
uji('js -> sejam, wajib revalidasi', await cc('/tanaman.js'), 'public, max-age=3600, must-revalidate');
uji('sitemap -> sehari', await cc('/sitemap-produk.xml'), 'public, max-age=86400');
uji('html -> sejam, wajib revalidasi', await cc('/produk/'), 'public, max-age=3600, must-revalidate');

// --- charset yang R2 tidak simpan ------------------------------------------------------
{
  const ct = async (jalur) => (await minta(jalur)).headers.get('Content-Type');
  uji('html dapat charset', await ct('/produk/'), 'text/html; charset=utf-8');
  uji('json dapat charset', await ct('/spec/indeks/meta.json'), 'application/json; charset=utf-8');
  uji('css dapat charset', await ct('/gaya.css'), 'text/css; charset=utf-8');
  uji('xml dapat charset', await ct('/sitemap-produk.xml'), 'application/xml; charset=utf-8');
  uji('gambar TIDAK dapat charset', await ct('/gambar/kemasan.webp'), 'image/webp');
  uji('404 pun bercharset', (await minta('/tidak-ada/')).headers.get('Content-Type'),
    'text/html; charset=utf-8');
}

// --- header yang hanya bisa dipasang di sini --------------------------------------------
{
  const h = (await minta('/produk/')).headers;
  uji('frame-ancestors dipasang', h.get('Content-Security-Policy'), "frame-ancestors 'none'");
  uji('nosniff dipasang', h.get('X-Content-Type-Options'), 'nosniff');
  uji('referrer-policy dipasang', h.get('Referrer-Policy'), 'strict-origin-when-cross-origin');
  const h404 = (await minta('/tidak-ada/')).headers;
  uji('header keamanan ikut di 404', h404.get('X-Content-Type-Options'), 'nosniff');
}

// --- metode -----------------------------------------------------------------------------
{
  const r = await minta('/produk/', 'HEAD');
  uji('HEAD dilayani tanpa badan', r.status, 200);
  uji('  badannya kosong', await r.text(), '');
  const p = await minta('/produk/', 'POST');
  uji('POST ditolak', p.status, 405);
}

// ----------------------------------------------------------------------------------------
if (gagal.length) {
  console.error(`uji worker: ${gagal.length} GAGAL, ${lolos} lolos\n`);
  for (const g of gagal) console.error(`  ✗ ${g}\n`);
  process.exit(1);
}
console.log(`uji worker: ${lolos}/${lolos} lolos — pemetaan jalur, pengalihan, cache, dan header terkunci`);
