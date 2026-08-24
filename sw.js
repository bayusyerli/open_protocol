/* A5 — luring. Satu-satunya berkas aplikasi yang tinggal di akar repositori.
 *
 * KENAPA DI AKAR, DAN BUKAN DI app/. Service worker hanya bisa mencegat permintaan di
 * dalam CAKUPANNYA, dan cakupan ditentukan letak berkasnya. Permukaan ada di `/app/`
 * tetapi indeksnya di `/spec/indeks/` — dua cabang yang tidak saling membawahi. Dari
 * `/app/sw.js`, seluruh indeks berada di luar jangkauan dan tidak satu pun pecahan bisa
 * disimpan. Header `Service-Worker-Allowed` bisa melonggarkannya, tetapi ia header
 * server, dan repositori ini belum punya host. Jadi berkasnya naik ke akar, dan
 * penyaringan di bawah yang menahannya supaya tidak menyentuh apa pun selain kedua
 * cabang itu.
 *
 * TIGA TINGKAT, DAN "PENUH" TIDAK BERARTI SEMUANYA. Indeksnya 29 MB pada 4.283 berkas.
 * Mengunduh semuanya diam-diam pada sambungan berbayar adalah kekerasan terhadap orang
 * yang justru jadi alasan permukaan ini ringan. Jadi:
 *
 *   1. Otomatis, ±230 KB — cangkang aplikasi, berkas indeks akar, dan sediaan/.
 *      Sesudah sekali buka: aplikasi terbuka tanpa sinyal, jalur 5 dan 6 utuh, daftar
 *      gejala jalur 1 utuh, pencarian gejala dan nama lokal utuh.
 *   2. Atas permintaan, ±4,6 MB — kepala pencarian `cari/`. Barulah pencarian nama
 *      bekerja tanpa sinyal. Ukurannya disebut sebelum diketuk, tidak sesudah.
 *   3. Sisanya menyusul saat dibuka, dan bertahan. Rincian produk, varietas, dan merek
 *      per OPT — 24 MB kalau seluruhnya, dan hampir tidak ada yang membuka seluruhnya.
 *
 * AMAN KARENA URL-NYA BERCAP. Pecahan diambil dengan `?v=<cap>`; isi berubah berarti URL
 * berubah, jadi cache-first tidak bisa menyajikan yang basi. Sebelum cap ada (lihat
 * `ambil()` di app/pustaka.js), strategi ini tidak akan aman dipasang sama sekali.
 * meta.json sendiri TIDAK bercap — ia yang menyebutkan capnya — jadi ia satu-satunya
 * yang diambil jaringan-dulu.
 */

const VERSI = 'v31';
const CANGKANG = `op-cangkang-${VERSI}`;
const PECAHAN_AWALAN = 'op-pecahan-';

/* DITERIMA DARI HALAMAN, BUKAN DITEBAK. Berkas permukaan tinggal di `/app/` selama
 * pengembangan dan di akar pada situs terbitan — dan pekerja ini berada di akar pada
 * keduanya, jadi letaknya sendiri tidak bisa membedakannya. `luring.js` menyematkan
 * direktori halaman pemanggil sebagai query saat mendaftar; yang dipakai di bawah itu.
 * Nilai bawaan `/app/` cuma untuk pekerja yang terdaftar sebelum baris ini ada — ia
 * digantikan pada pendaftaran berikutnya.
 *
 * INDEKS tidak butuh perlakuan yang sama: ia mutlak dan sama di kedua bentuk. */
const APP = new URL(self.location.href).searchParams.get('app') || '/app/';
const INDEKS = '/spec/indeks/';

// Cangkang: seluruh halaman, gaya, dan modul. Didaftar tangan, bukan dipindai — berkas
// yang lupa didaftar akan gagal senyap saat luring, dan daftar yang terlihat lebih mudah
// diperiksa daripada pemindai yang benar diam-diam.
const BERKAS_CANGKANG = [
  'index.html', 'produk.html', 'jalur-1.html', 'jalur-3.html', 'jalur-4.html',
  'jalur-5.html', 'jalur-6.html', 'ukur.html', 'takaran.html', 'harga.html',
  'principal.html', 'toko.html', 'usaha.html', 'kas.html', 'rencana.html',
  'gaya.css', 'beranda.css', 'batas.css',
  'hitung.js', 'tanya.js',
  'pustaka.js', 'batas.js', 'sanggah.js', 'serah.js', 'teruskan.js', 'lapor.js',
  'simpanan.js',
  'musim.js', 'buku.js', 'keselamatan.js',
  'tema.js', 'luring.js', 'cangkang.js',
  'ukur.js', 'ukur-layar.js',
  'beranda.js', 'jalur-1.js', 'jalur-2.js', 'jalur-3.js', 'jalur-4.js', 'jalur-5.js',
  'jalur-6.js', 'bahan.js', 'varietas.js', 'kandungan.js', 'takaran.js',
  'harga.js', 'principal.js', 'gambar.js', 'toko.js', 'usaha.js', 'kas.js', 'rencana.js',
  'manifest.webmanifest', 'ikon.svg', 'ikon-maskable.svg',
  // Tanda merek. Versi gelapnya ikut walaupun cuma dipakai satu tema: yang berpindah
  // tema saat luring tidak punya jaringan untuk mengambil yang belum tersimpan, dan
  // kepala tanpa tanda lebih terasa rusak daripada kepala bertanda salah warna.
  // Yang mendatar tidak dipakai satu layar pun; ia disimpan sebagai aset merek.
  'logo-pranatani.svg', 'logo-pranatani-gelap.svg', 'logo-pranatani-horizontal.svg',
].map((f) => APP + f);

// Berkas indeks yang kecil dan hampir selalu dipakai. `sediaan/` ikut karena keduabelas
// resepnya cuma 36 KB, dan tanpanya jalur 5 dan 6 kosong saat luring — dua jalur yang
// justru paling mungkin dibuka jauh dari sinyal.
const INDEKS_AKAR = [
  'gejala.json', 'gejala-cari.json', 'nama-lokal.json',
  'sediaan.json', 'varian.json', 'larangan.json', 'harga.json',
].map((f) => INDEKS + f);

/* Keduabelas resep sediaan, 36 KB seluruhnya. Daftarnya tidak ada di meta, jadi diambil
 * dari sediaan.json — tanpa ini jalur 5 dan 6 terbuka tetapi kosong saat luring, dan
 * keduanya justru paling mungkin dibuka jauh dari sinyal. */
const SEDIAAN_LUARAN = (m, cap) =>
  (m.pecahan?.sediaan ?? []).map((k) => `${INDEKS}sediaan/${k}.json?v=${cap}`);

const dalamJangkauan = (u) => u.pathname.startsWith(APP) || u.pathname.startsWith(INDEKS);
const adalahMeta = (u) => u.pathname === `${INDEKS}meta.json`;

// Cache pecahan diberi nama menurut capnya, jadi cap baru = cache baru, dan yang lama
// dibuang utuh tanpa perlu memeriksa satu per satu.
const namaPecahan = (cap) => PECAHAN_AWALAN + cap;

async function simpanDiam(nama, daftar) {
  const c = await caches.open(nama);
  // Satu per satu, bukan addAll: addAll batal seluruhnya kalau satu berkas gagal, dan
  // satu berkas yang hilang tidak boleh membatalkan seluruh kemampuan luring.
  let berhasil = 0;
  await Promise.all(daftar.map(async (u) => {
    try { await c.add(new Request(u, { cache: 'reload' })); berhasil++; } catch { /* dilewati */ }
  }));
  return berhasil;
}

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    // Cangkang disimpan telanjang: URL-nya memang tidak bercap.
    await simpanDiam(CANGKANG, [...BERKAS_CANGKANG, `${INDEKS}meta.json`]);

    // Berkas indeks akar HARUS disimpan dengan capnya. `ambil()` memintanya sebagai
    // `...json?v=<cap>`, jadi salinan telanjang tidak akan pernah cocok — dan
    // mencocokkannya dengan `ignoreSearch` akan menghidupkan kembali persis risiko basi
    // yang dicabut cap itu. Capnya dibaca di sini, sekali, saat pemasangan.
    try {
      const m = await (await fetch(`${INDEKS}meta.json`, { cache: 'no-cache' })).json();
      const cap = m.cap ?? 'x';
      await simpanDiam(namaPecahan(cap), [
        ...INDEKS_AKAR.map((u) => `${u}?v=${cap}`),
        ...SEDIAAN_LUARAN(m, cap),
      ]);
    } catch { /* tanpa jaringan saat pasang: cangkangnya saja, dan itu tetap berguna */ }

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const n of await caches.keys()) {
      if (n.startsWith('op-cangkang-') && n !== CANGKANG) await caches.delete(n);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || !dalamJangkauan(u)) return;

  // meta.json jaringan-dulu: ia yang menyebutkan cap, jadi ia tidak boleh basi. Kalau
  // jaringan tidak ada, salinan terakhir tetap dipakai — itu justru inti luringnya.
  if (adalahMeta(u)) {
    e.respondWith((async () => {
      try {
        const r = await fetch(e.request);
        const c = await caches.open(CANGKANG);
        c.put(e.request, r.clone());
        buangCapLama(r.clone());
        return r;
      } catch {
        return (await caches.match(e.request)) ?? Response.error();
      }
    })());
    return;
  }

  const cap = u.searchParams.get('v');
  const nama = cap ? namaPecahan(cap) : CANGKANG;

  e.respondWith((async () => {
    const tersimpan = await caches.match(e.request, { ignoreSearch: false });
    if (tersimpan) return tersimpan;
    try {
      const r = await fetch(e.request);
      if (r.ok) (await caches.open(nama)).put(e.request, r.clone());
      return r;
    } catch (err) {
      // Halaman yang belum tersimpan saat luring: jawab apa adanya. Menyodorkan
      // halaman lain sebagai pengganti akan membuat orang mengira ia sudah sampai.
      return (await caches.match(e.request)) ?? Response.error();
    }
  })());
});

/** Cap berubah berarti seluruh pecahan lama tidak akan pernah diminta lagi. */
async function buangCapLama(r) {
  try {
    const m = await r.json();
    const simpan = namaPecahan(m.cap ?? 'x');
    for (const n of await caches.keys()) {
      if (n.startsWith(PECAHAN_AWALAN) && n !== simpan) await caches.delete(n);
    }
  } catch { /* meta tidak terbaca; membuang cache atas dugaan lebih buruk daripada diam */ }
}

// ---------------------------------------------------------------------------
// Tingkat 2 — kepala pencarian, atas permintaan
// ---------------------------------------------------------------------------
self.addEventListener('message', (e) => {
  const { jenis } = e.data ?? {};
  if (jenis === 'simpanCari') e.waitUntil(simpanCari(e.source));
  if (jenis === 'buangSemua') e.waitUntil(buangSemua(e.source));
  if (jenis === 'ukuran') e.waitUntil(laporUkuran(e.source));
});

const kabar = (klien, pesan) => klien?.postMessage(pesan);

async function simpanCari(klien) {
  try {
    const m = await (await fetch(`${INDEKS}meta.json`, { cache: 'no-cache' })).json();
    const cap = m.cap ?? 'x';
    const daftar = (m.pecahan?.cari ?? []).map((e) => `${INDEKS}cari/${e}.json?v=${cap}`);
    const c = await caches.open(namaPecahan(cap));
    let n = 0;
    for (const u of daftar) {
      try { if (!(await c.match(u))) await c.add(new Request(u, { cache: 'reload' })); } catch { /* dilewati */ }
      n++;
      if (n % 25 === 0 || n === daftar.length) kabar(klien, { jenis: 'maju', n, dari: daftar.length });
    }
    kabar(klien, { jenis: 'selesai', n, dari: daftar.length });
  } catch (err) {
    kabar(klien, { jenis: 'gagal', pesan: String(err.message ?? err) });
  }
}

async function buangSemua(klien) {
  for (const n of await caches.keys()) if (n.startsWith('op-')) await caches.delete(n);
  kabar(klien, { jenis: 'terbuang' });
}

async function laporUkuran(klien) {
  let berkas = 0;
  for (const n of await caches.keys()) {
    if (!n.startsWith('op-')) continue;
    berkas += (await (await caches.open(n)).keys()).length;
  }
  // navigator.storage.estimate() menyebut seluruh penyimpanan asal ini, bukan cache
  // saja — dinyatakan begitu di layar, bukan disamarkan jadi "ukuran cache".
  let byte = null;
  try { byte = (await navigator.storage?.estimate?.())?.usage ?? null; } catch { /* ditolak kebijakan */ }
  kabar(klien, { jenis: 'ukuran', berkas, byte });
}
