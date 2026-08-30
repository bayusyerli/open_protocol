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
 *   1. Otomatis, ±1,2 MB (terukur 30 Agustus 2026: cangkang 882 KB pada 58 berkas,
 *      indeks 308 KB) — cangkang aplikasi, berkas indeks akar, sediaan/, serta daftar
 *      gejala dan kepala pencariannya. Sesudah sekali buka: aplikasi terbuka tanpa
 *      sinyal, jalur 5 dan 6 utuh, daftar gejala jalur 1 utuh, pencarian gejala dan
 *      nama lokal utuh.
 *   2. Atas permintaan, ±4,6 MB — kepala pencarian `cari/`. Barulah pencarian nama
 *      bekerja tanpa sinyal. Ukurannya disebut sebelum diketuk, tidak sesudah.
 *   3. Sisanya menyusul saat dibuka, dan bertahan. Rincian tiap pintu gejala, rincian
 *      produk, varietas, dan merek per OPT — 24 MB kalau seluruhnya, dan hampir tidak
 *      ada yang membuka seluruhnya.
 *
 * ANGKA TINGKAT 1 ITU PERNAH BERBUNYI "±230 KB", dan itu bukan sekadar basi: sampai
 * 30 Agustus 2026 daftar gejalanya memang TIDAK ikut. `INDEKS_AKAR` masih menyebut
 * `gejala.json` dan `gejala-cari.json` — dua berkas yang berhenti ada ketika indeks
 * memecahnya jadi `gejala-daftar/NNN.json` dan `gejala-cari/NNN.json`. `simpanDiam()`
 * menelan kegagalan per berkas supaya satu berkas hilang tidak membatalkan seluruh
 * kemampuan luring, jadi keduanya 404 tanpa suara dan pemasangan tetap melapor berhasil.
 * Yang tersisa janji di baris ini, dan jalur 1 yang kosong justru saat tanpa sinyal —
 * syarat lapangan nomor satunya. Lihat `cek-luring-indeks.mjs`, yang kini menolak nama
 * indeks yang tidak ada di keranjang mana pun.
 *
 * AMAN KARENA URL-NYA BERCAP. Pecahan diambil dengan `?v=<cap>`; isi berubah berarti URL
 * berubah, jadi cache-first tidak bisa menyajikan yang basi. Sebelum cap ada (lihat
 * `ambil()` di app/pustaka.js), strategi ini tidak akan aman dipasang sama sekali.
 * meta.json sendiri TIDAK bercap — ia yang menyebutkan capnya — jadi ia satu-satunya
 * yang diambil jaringan-dulu.
 */

/* CAPNYA DISUNTIKKAN SAAT PERAKITAN, BUKAN DIKETIK.
 *
 * Nilai di bawah sengaja `dev` dan sengaja tidak pernah diubah tangan.
 * `spec/tools/rakit-situs.mjs` menghitung sidik isi seluruh berkas cangkang lalu
 * menuliskannya ke salinan sw.js di `_situs/` — jadi cap ini berubah tepat ketika isinya
 * berubah, tidak pernah lebih awal dan tidak pernah tertinggal.
 *
 * KENAPA BUKAN ANGKA YANG DINAIKKAN ORANG. Selama empat kali berturut-turut, CI menolak
 * push karena isi cangkang berubah sementara versinya tidak — dan keempatnya berpola sama:
 * versi dinaikkan dan sidiknya dicatat, lalu app/ disunting lagi sebelum commit. Sekali di
 * antaranya dilakukan justru oleh yang memasang pagarnya. Yang menghapus kelas kesalahan
 * itu bukan kedisiplinan melainkan mencabut kesempatannya: cap yang dihitung dari isi tidak
 * bisa didahului suntingan, karena ia lahir sesudah suntingan terakhir.
 *
 * SAAT PENGEMBANGAN nilainya tetap `dev`, dan itu berarti cangkang tidak berganti sendiri
 * ketika app/ disunting. Pakai "Update on reload" di DevTools, atau cabut pekerjanya —
 * halaman ukur/peranti punya tombolnya. Yang tayang ke orang selalu hasil rakitan, dan di
 * sana capnya nyata. */
const VERSI = 'dev';
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

/* CAP IKUT KE URL CANGKANG, bukan cuma ke nama cache — dan itu yang menghapus satu kelas
 * kesalahan alih-alih mempersempitnya.
 *
 * Pecahan indeks sudah begitu sejak awal: `?v=<cap>`, isi berubah berarti URL berubah,
 * jadi salinan lama tidak akan pernah terpakai lagi dan boleh disajikan `immutable`
 * setahun. Cangkang tidak, dan akibatnya `.css`/`.js` harus disajikan berumur pendek
 * supaya HTML terbitan baru tidak berpasangan dengan JS terbitan lama. Umur pendek
 * mempersempit jendela campurnya; ia tidak menutupnya.
 *
 * YANG MENEMPELKAN CAP BUKAN BERKAS INI, dan itu keputusan yang perlu dibaca sebagai
 * keputusan. `rakit-situs.mjs` menempelkannya ke tiap `href`, `src`, dan specifier
 * `import` di seluruh rakitan — DAN ke literal di daftar bawah ini, pada salinan `_situs/`.
 * Daftar di repositori tetap telanjang, sama seperti `VERSI` tetap berbunyi `dev`.
 *
 * Sempat dicoba sebaliknya: berkas ini menempelkan sendiri `?v=${VERSI}` ke tiap nama.
 * Ia salah dengan cara yang hanya kelihatan saat luring. Yang dicap di rakitan cuma
 * `.css` dan `.js` — `.html` sengaja tidak, karena dua URL yang menjawab 200 untuk satu
 * halaman adalah isi ganda di mata mesin pencari — jadi pekerja yang mencap SEMUA
 * namanya menyimpan `/produk.html?v=cap` sementara navigasi meminta `/produk.html`.
 * Precache-nya penuh, cache-nya meleset di tiap navigasi, dan tidak ada satu pun galat.
 * Aturan yang sama harus dipegang dua tempat, jadi ia dipegang satu: yang merakit. */

// Cangkang: seluruh halaman, gaya, dan modul. Didaftar tangan, bukan dipindai — berkas
// yang lupa didaftar akan gagal senyap saat luring, dan daftar yang terlihat lebih mudah
// diperiksa daripada pemindai yang benar diam-diam.
const BERKAS_CANGKANG = [
  'index.html', 'produk.html', 'tanaman.html', 'harga-pupuk.html', 'varietas.html',
  'pupuk-sendiri.html', 'pengendali-sendiri.html', 'peranti.html', 'takaran.html', 'harga.html',
  'perusahaan.html', 'toko.html', 'usaha.html', 'kas.html', 'rencana.html',
  'gaya.css', 'beranda.css', 'batas.css',
  'hitung.js', 'tanya.js',
  'pustaka.js', 'batas.js', 'sanggah.js', 'serah.js', 'teruskan.js', 'lapor.js',
  'simpanan.js',
  'musim.js', 'buku.js',
  'tema.js', 'luring.js', 'cangkang.js',
  'ukur.js', 'peranti.js',
  'beranda.js', 'tanaman.js', 'produk.js', 'harga-pupuk.js', 'cek-varietas.js', 'pupuk-sendiri.js',
  'pengendali-sendiri.js', 'bahan.js', 'layar-varietas.js', 'kandungan.js', 'takaran.js',
  'harga.js', 'perusahaan.js', 'gambar.js', 'toko.js', 'usaha.js', 'kas.js', 'rencana.js',
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
  'nama-lokal.json',
  'sediaan.json', 'varian.json', 'larangan.json', 'harga.json',
].map((f) => INDEKS + f);

/* Keduabelas resep sediaan, 36 KB seluruhnya. Daftarnya tidak ada di meta, jadi diambil
 * dari sediaan.json — tanpa ini jalur 5 dan 6 terbuka tetapi kosong saat luring, dan
 * keduanya justru paling mungkin dibuka jauh dari sinyal. */
const SEDIAAN_LUARAN = (m, cap) =>
  (m.pecahan?.sediaan ?? []).map((k) => `${INDEKS}sediaan/${k}.json?v=${cap}`);

/* Daftar gejala dan kepala pencariannya. Keduanya dipecah bernomor sejak berkas
 * tunggalnya melewati anggaran 48 KB, dan keduanya WAJIB ada saat luring: yang pertama
 * isi layar pertama jalur 1, yang kedua satu-satunya cara mencarinya. 188 KB berdua.
 *
 * Rincian tiap pintu — `gejala/<kunci>.json`, ciri pembanding dan blok "pastikan dulu" —
 * SENGAJA tidak ikut di sini, dan itu perubahan sikap terhadap 286 KB pada 208 pintu.
 * Saat pintunya masih 28 dan seluruhnya 29 KB, memprasimpan semuanya hampir gratis;
 * pada 208 ia jadi tiga perempat unduhan otomatis, dibayar semua orang demi satu-dua
 * pintu yang benar-benar dibuka. Ia turun ke tingkat 3 — terambil saat dibuka, lalu
 * bertahan. Yang menahannya aman: kartu yang belum tersimpan GAGAL saat luring, bukan
 * tergambar tanpa blok pastikan-dulunya. Dugaan tanpa cara memastikan persis yang
 * ditolak jalur ini, dan diam-diam menghilangkan bloknya lebih buruk daripada berkata
 * datanya belum ada. */
const bernomor = (m, cap, akar, kunci) =>
  Array.from({ length: m.pecahan?.[kunci] ?? 0 },
    (_, i) => `${INDEKS}${akar}/${String(i).padStart(3, '0')}.json?v=${cap}`);

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
        ...bernomor(m, cap, 'gejala-daftar', 'gejalaDaftar'),
        ...bernomor(m, cap, 'gejala-cari', 'gejalaCari'),
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

  /* Keranjangnya ditentukan LETAK, bukan ada-tidaknya `?v=`. Sejak cangkang ikut bercap,
   * keduanya membawa query yang sama bentuknya tetapi capnya berbeda asal: cangkang
   * memakai sidik isi cangkang, pecahan indeks memakai cap meta. Menyortirnya menurut
   * query akan menaruh `gaya.css?v=<cap cangkang>` ke keranjang pecahan, lalu
   * `buangCapLama()` menghapusnya begitu meta berganti cap — cangkang yang dibuang oleh
   * pergantian data yang tidak ada hubungannya dengannya. */
  const cap = u.searchParams.get('v');
  const nama = u.pathname.startsWith(APP) ? CANGKANG : (cap ? namaPecahan(cap) : CANGKANG);

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
