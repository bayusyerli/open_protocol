// Memeriksa situs yang SUDAH TAYANG tidak memuat apa pun dari asal lain.
//
//   node spec/tools/cek-suntikan-edge.mjs https://pranatani.com [/jalur ...]
//
// KENAPA ALAT INI ADA, DAN KENAPA IA SATU-SATUNYA YANG MENGAMBIL DARI JARINGAN
// Seluruh pemeriksa lain di direktori ini membaca repositori. Yang diperiksa di sini
// justru yang TIDAK ada di repositori: isi yang ditambahkan Cloudflare ke jawaban kita
// sesudah Worker selesai menulisnya. Zona ini sudah dua kali melakukannya tanpa satu
// baris pun berubah di sini —
//
//   robots.txt terkelola, yang menimpa milik kita sampai 29 Agustus 2026;
//   beacon Web Analytics, yang menyuntikkan <script> dari static.cloudflareinsights.com
//   ke tiap halaman sampai 30 Agustus 2026.
//
// Keduanya ketahuan karena kebetulan ada yang melihat. Yang kedua bahkan tidak terlihat
// dari `curl` biasa: penyuntikannya bergantung User-Agent, jadi permintaan yang tidak
// menyerupai peramban dijawab tanpa beacon. Alat ini karena itu MENYAMAR jadi peramban;
// tanpa itu ia akan hijau justru pada kasus yang melahirkannya.
//
// APA YANG DIANGGAP PELANGGARAN
// Apa pun yang DIMUAT dari asal lain: `src` pada elemen mana pun, dan `href` pada
// `<link>`. Bukan `<a href>` — menaut ke situs lain memang pekerjaan halaman entitas,
// dan tiap halaman produk menaut registri SIMPEL di pertanian.go.id.
//
// Ambangnya nol, dan itu bukan kekakuan: CSP situs ini berbunyi `default-src 'self'`
// tanpa satu pun pengecualian asal. Apa pun yang muncul dari luar akan diblokir peramban
// — jadi ia tidak pernah berguna, dan kehadirannya selalu berarti ada sakelar yang
// menyala tanpa sepengetahuan yang menulis halamannya.
//
// SEKALI ULANG SEBELUM MERAH. Setelan zona menyebar antar-PoP tidak serentak; sesudah
// sakelar dimatikan, satu PoP masih menyuntikkan sementara yang lain sudah bersih —
// terukur 30 Agustus 2026, selisihnya kurang dari satu menit. Satu ulangan menahan CI
// merah karena penyebaran, tanpa menahan yang benar-benar menyala.

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

const JALUR_BAWAAN = ['/', '/tanaman.html', '/produk.html', '/toko.html'];

const asal = process.argv[2];
if (!asal || !/^https?:\/\//.test(asal)) {
  console.error('Pakai: node spec/tools/cek-suntikan-edge.mjs https://contoh.com [/jalur ...]');
  process.exit(2);
}
const jalur = process.argv.slice(3).length ? process.argv.slice(3) : JALUR_BAWAAN;
const asalOrigin = new URL(asal).origin;

/* Diurai per tag, bukan per atribut, karena yang menentukan siapa pemilik atributnya.
 * `src` di mana pun berarti "muat ini"; `href` berarti begitu hanya pada `<link>`. */
function asing(html, dasar) {
  const keluar = [];
  for (const m of html.matchAll(/<([a-zA-Z][\w-]*)\b([^>]*)>/g)) {
    const tag = m[1].toLowerCase();
    const atribut = m[2];
    const calon = [];
    const src = /\bsrc\s*=\s*["']([^"']*)["']/i.exec(atribut)?.[1];
    if (src) calon.push(['src', src]);
    if (tag === 'link') {
      const href = /\bhref\s*=\s*["']([^"']*)["']/i.exec(atribut)?.[1];
      if (href) calon.push(['href', href]);
    }
    if (tag === 'object') {
      const data = /\bdata\s*=\s*["']([^"']*)["']/i.exec(atribut)?.[1];
      if (data) calon.push(['data', data]);
    }
    for (const [nama, nilai] of calon) {
      if (!nilai || nilai.startsWith('data:')) continue;
      let u;
      try { u = new URL(nilai, dasar); } catch { continue; }
      if (u.origin !== new URL(dasar).origin) keluar.push({ tag, nama, url: u.href });
    }
  }
  return keluar;
}

async function periksa(jalan) {
  const alamat = new URL(jalan, asal).href;
  const r = await fetch(alamat, { headers: { 'User-Agent': UA, Accept: 'text/html' } });
  if (!r.ok) throw new Error(`${jalan}: ${r.status}`);
  return { temuan: asing(await r.text(), alamat) };
}

const tunggu = (ms) => new Promise((s) => { setTimeout(s, ms); });

let gagal = 0;
for (const jalan of jalur) {
  let { temuan } = await periksa(jalan);
  if (temuan.length) {
    // Sekali ulang, dan katakan bahwa ia diulang: penyebaran antar-PoP yang lambat akan
    // terbaca sebagai "sempat ada" alih-alih hilang dari catatan.
    console.log(`  ${jalan} — ${temuan.length} asing pada percobaan pertama, diulang…`);
    await tunggu(15_000);
    ({ temuan } = await periksa(jalan));
  }
  if (!temuan.length) {
    console.log(`  ok    ${jalan}`);
    continue;
  }
  gagal++;
  console.error(`  ASING ${jalan}`);
  for (const t of temuan) console.error(`          <${t.tag} ${t.nama}="${t.url}">`);
}

console.log(`\n${jalur.length - gagal}/${jalur.length} halaman tayang tidak memuat apa pun dari asal lain.`);
if (gagal) {
  console.error(`\n${gagal} halaman memuat dari asal lain, dan tidak satu pun ditulis repositori ini.`);
  console.error('Periksa sakelar zona Cloudflare — Web Analytics, Rocket Loader, atau sejenisnya.');
  console.error(`Asal yang diperiksa: ${asalOrigin}`);
  process.exit(1);
}
