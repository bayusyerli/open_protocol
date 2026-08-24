/* Yang dipakai bersama jalur 2 dan jalur 4.
 *
 * Keduanya membaca indeks statis yang sama dan memakai kotak pencarian yang sama;
 * yang berbeda cuma apa yang ditampilkan sesudah satu entri dibuka. Menaruhnya di
 * satu tempat menahan dua perender agar tidak menyimpang diam-diam — dan layar
 * varietas memang muncul di kedua jalur.
 */

// Penguraian kalimat tinggal di berkasnya sendiri karena ia tidak menyentuh jaringan maupun
// DOM — seluruhnya fungsi murni, dan itu yang membuatnya bisa diuji di luar peramban.
import { uraikan } from './tanya.js';

/* Tidak diekspor: hanya `ambil()` di bawah yang memakainya.
 *
 * MUTLAK, BUKAN RELATIF, dan itu yang membuat permukaan ini bisa tinggal di dua kedalaman
 * sekaligus. Selama pengembangan app/ disajikan di `/app/`, tetapi situs terbitan menaruhnya
 * di akar — halaman produk di `terbit/` menaut `/gaya.css` dan `/produk.html`, bukan
 * `/app/gaya.css`. Dengan `../spec/indeks`, satu di antara keduanya pasti salah: dari akar
 * ia menunjuk ke atas akar dan setiap pengambilan gagal. Jalur mutlak benar di keduanya,
 * dan ia juga yang sudah dipakai sw.js (`INDEKS = '/spec/indeks/'`) sejak awal — jadi ini
 * membuat ketiganya sepakat, bukan menambah satu asumsi baru. */
const BASIS = '/spec/indeks';

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

/* DUA KEGAGALAN YANG BERBEDA, DAN SELAMA INI KEDUANYA BERBUNYI SAMA.
 *
 * Sampai 24 Agustus 2026 kedelapan layar menjawab kegagalan muat pertama dengan kalimat
 * yang sama: "Indeks tidak ditemukan — bangun dulu dengan `node spec/tools/bangun-indeks.mjs
 * --tulis`". Itu benar untuk satu pembaca — orang yang menjalankan repositori di
 * laptopnya — dan salah untuk semua pembaca lain. Petani bersinyal buruk, yang justru
 * syarat lapangan nomor satu permukaan ini, dibalas instruksi terminal untuk masalah yang
 * sebenarnya cuma sambungan putus.
 *
 * Yang membedakan: `ambil()` melempar `Error` bertuliskan status HTTP hanya ketika peladen
 * MENJAWAB tetapi berkasnya tidak ada; kegagalan jaringan melempar TypeError dari fetch,
 * tanpa status. Ditambah `navigator.onLine` yang menyatakan peranti memang sedang lepas.
 * Petunjuk membangun tetap ada — ia turun ke console, tempat pembacanya memang menengok. */
const GAGAL_STATUS = /: (\d{3})$/;

export function pesanGagalMuat(e) {
  const status = Number(GAGAL_STATUS.exec(e?.message ?? '')?.[1]) || null;
  const luring = navigator.onLine === false || !status;

  if (luring) {
    return `
      <div class="kartu peringatan">
        <h2>Datanya belum bisa diambil</h2>
        <p>Sambungan ke jaringan sedang tidak jalan, atau terputus di tengah pengambilan.
        Yang di halaman ini tidak hilang — begitu sinyalnya kembali, muat ulang saja.</p>
        <p><button type="button" class="kembali" id="cobaLagi">Coba lagi</button></p>
        <p class="catatan">Kalau permukaan ini pernah dibuka sebelumnya dan luring sudah
        disimpan, sebagian layar tetap bisa dipakai tanpa sinyal.</p>
      </div>`;
  }

  // 404 dan sebangsanya: peladen menjawab, berkasnya yang tidak ada. Itu keadaan
  // pemasangan, bukan keadaan lapangan — dan orang yang bisa memperbaikinya bukan
  // pembaca halaman ini.
  console.error(
    `Indeks tidak terambil (${status}). Bangun dulu dari akar repositori:\n`
    + '  node spec/tools/bangun-indeks.mjs --tulis\n'
    + 'lalu sajikan AKARNYA — menyajikan app/ saja tidak cukup.', e,
  );
  return `
    <div class="kartu peringatan">
      <h2>Datanya belum tersedia di peladen ini</h2>
      <p>Halaman ini ada, tetapi berkas datanya tidak terkirim. Ini bukan sesuatu yang bisa
      diperbaiki dari sisi kamu — silakan coba lagi nanti.</p>
      <p class="catatan">Rinciannya ada di konsol peramban, untuk yang memasang permukaan ini.</p>
    </div>`;
}

/** Pasang tombol "Coba lagi" yang digambar `pesanGagalMuat`, kalau ada. */
export function pasangCobaLagi(wadah, aksi) {
  wadah.querySelector('#cobaLagi')?.addEventListener('click', aksi ?? (() => location.reload()));
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
  sediaan: 'Sediaan sendiri', opt: 'Hama & penyakit', komoditas: 'Tanaman',
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

/* Petak kemasan berukuran tetap, dipasang di depan atau di samping nama merek.
 *
 * Sudah ada DUA salinannya sebelum ini — di tabel merek jalur 1 dan di layar bahan aktif
 * jalur 2 — dan halaman profil badan menjadi yang ketiga. Tiga salinan dari satu aturan akan
 * menyimpang begitu salah satunya diperbaiki, persis sebab `namaPemegang` di atas tinggal
 * di sini. Yang diterima namanya BERKAS, bukan rekamannya, karena ketiga pemanggilnya
 * menamai medannya berbeda-beda dan petak ini tidak perlu tahu bentuk rekaman siapa pun.
 *
 * Yang tidak punya gambar TIDAK dibiarkan kosong melompong. Hanya 15% baris merek punya
 * gambar, jadi keadaan yang lazim justru yang tanpa — dan sederet sel kosong di antara yang
 * bergambar terbaca sebagai "yang ini yang meragukan", padahal artinya cuma situs
 * pemegangnya belum dipanen. Petak bergaris putus-putus menempati ruang yang sama, sehingga
 * barisnya sejajar dan tidak ada yang tampak tersisih.
 *
 * `alt` sengaja kosong: namanya selalu ada di sebelahnya, di baris yang sama. Membacakan
 * "Kemasan MATROS 18 EC" lalu "MATROS 18 EC" menggandakan tiap baris tabel bagi yang
 * memakai pembaca layar.
 *
 * `w`/`h` ditulis tetap 40 dan BUKAN ukuran gambar aslinya: yang `kecil` dibatasi 320 px
 * pada sisi terpanjangnya dan nisbahnya berselisih, sedangkan petaknya berukuran tetap
 * dengan `object-fit: contain`. Menuliskan 40×40 memesan ruang yang persis akan dipakai,
 * jadi tidak ada yang bergeser saat gambarnya mendarat.
 */
export const petakKemasan = (berkas) => (berkas
  ? `<img class="merek-kemasan" src="gambar/${teks(berkas)}" alt="" width="40" height="40"
          loading="lazy" decoding="async">`
  : '<span class="merek-kemasan merek-kemasan-kosong" aria-hidden="true"></span>');

/* Rute hasil pencarian — jenis mana dibuka halaman mana.
 *
 * Dulu tinggal di beranda.js, satu-satunya layar yang punya kotak cari universal. Sejak
 * cangkang.js membawa kotak yang sama ke keempat belas halaman lain, aturannya dipakai
 * dua tempat — dan dua salinan akan menyimpang persis seperti <p class="lain"> menyimpang
 * sebelum dipusatkan. Jadi ia tinggal di sini, dipakai keduanya.
 *
 * Pestisida, pupuk, dan bahan aktif serumah di jalur 2 karena pertanyaannya sama:
 * "sebenarnya ini apa". */
const RUMAH = { varietas: 'jalur-4.html', pestisida: 'produk.html', pupuk: 'produk.html', bahan: 'produk.html' };

// Sediaan punya DUA rumah, dan yang menentukan rezimnya. Sisi pupuk dan sisi pengendali
// bukan dua tab dari satu layar — janjinya berbeda: yang satu resep terbuka, yang satu
// status hukum yang sengaja berhenti sebelum jadi anjuran.
const rumahSediaan = (x) => (String(x.p ?? '').includes('sediaan/') && x.k?.includes('pengendali')
  ? 'jalur-6.html' : 'jalur-5.html');

// Dua jenis entri tidak dibuka lewat `id`+`pecahan` seperti empat yang lain: keduanya punya
// berkasnya sendiri per entitas, jadi yang dibawa tautannya cukup satu kunci.
const tautanKunci = {
  // OPT registri dibuka jalur 1 lewat kuncinya sendiri, bukan lewat `opt=` yang dipakai
  // sepuluh OPT terkurasi: keduanya ruang id yang berbeda, dan menyamakan pintunya akan
  // membuat jalur 1 mencari teks gejala yang memang tidak ada.
  opt: (x) => `jalur-1.html?hama=${encodeURIComponent(String(x.p ?? '').replace(/^opt-nama\//, ''))}`,
  sediaan: (x) => `${rumahSediaan(x)}?resep=${encodeURIComponent(String(x.p ?? '').replace(/^sediaan\//, ''))}`,
  principal: (x) => `principal.html?key=${encodeURIComponent(String(x.p ?? '').replace(/^principal\//, ''))}`,
  harga: (x) => `harga.html?k=${encodeURIComponent(String(x.p ?? '').replace(/^harga\//, ''))}`,
  // Satu-satunya rute yang keluar dari app/ dan masuk ke halaman terbitan. Pintu komoditas
  // memang sudah ada di sana — /tanaman/alpukat/ menyebut 145 varietas dan seluruh OPT
  // berproduknya sejak halaman pertama diterbitkan — dan yang tidak pernah ada cuma jalan
  // dari kotak cari ke sana. Membuat salinannya di app/ berarti dua layar yang sama akan
  // menyimpang; menautnya tidak.
  //
  // Mutlak, dengan alasan yang sama seperti `BASIS`: rakit-situs.mjs menaruh app/ di AKAR
  // bersama terbit/, jadi `/tanaman/…` benar di situs terbitan. Selama pengembangan app/
  // disajikan di `/app/` dan tautan ini menggantung — sama seperti seluruh 30 ribu halaman
  // terbitan lainnya, yang memang tidak ada sampai dirakit.
  komoditas: (x) => `/${String(x.p ?? '').replace(/^\/+|\/+$/g, '')}/`,
};

/**
 * Alamat yang membuka satu hasil pencarian.
 *
 * `kueri` ikut supaya jalur tujuan memulihkan daftar hasilnya sendiri di belakang layar
 * rincian — tombol "kembali ke hasil pencarian" di sana harus mendarat pada sesuatu.
 */
export function tautanHasil(x, kueri = '') {
  const khusus = tautanKunci[x.j];
  if (khusus) return khusus(x);
  const p = new URLSearchParams({ id: x.i, pecahan: x.p, q: kueri });
  return `${RUMAH[x.j] ?? 'produk.html'}?${p}`;
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

/* Medan yang ikut dicocokkan selain nama, dan kenapa cuma dua.
 *
 * `k` baris di bawah nama — komoditas untuk varietas, pemegang pendaftaran untuk produk,
 * cacah untuk bahan dan pintu komoditas. `f` pembedanya — komposisi untuk produk, nama
 * ilmiah untuk OPT, bentuk badan untuk principal. Keduanya sudah ada di kepala pencarian dan
 * sudah tercetak di tiap kartu, jadi mencocokkannya tidak menambah satu pengambilan pun.
 *
 * Sebelum ini keduanya TIDAK PERNAH dicocokkan, dan akibatnya paling terlihat pada kueri
 * berkata dua: "phonska petrokimia" dijawab nol walaupun kedua katanya tercetak berdampingan
 * di kartu yang sama. */
const medanCocok = (x) => [x.n, x.k, x.f].map((s) => rapikan(s));

/**
 * Mencari di kepala pencarian.
 *
 * TIGA HAL YANG BERBEDA DARI VERSI SATU-UNTAIAN, dan ketiganya hanya berlaku pada kueri
 * berkata lebih dari satu — kueri satu kata melewati jalan yang sama persis seperti dulu:
 *
 *   1. Kalimat dipecah jadi kata lewat `uraikan()`, dan kata yang bukan nama apa pun
 *      ("apa", "yang", "cocok", "kapan") tidak ikut dicari. Sebelum ini seluruh kalimat
 *      jadi satu untaian tanpa spasi, dan untaian seperti itu tidak pernah ada di nama
 *      mana pun — jadi tiap pertanyaan berkalimat dijawab nol tanpa satu pun galat.
 *   2. Tiap kata mengambil embernya sendiri, lalu hasilnya disatukan. Ini yang membuat
 *      "phonska petrokimia" bisa ketemu: PHONSKA tinggal di ember "ph" dan tidak akan
 *      pernah terambil dari ember "pe".
 *   3. DAN KALAU BISA, ATAU KALAU TIDAK. Kalau ada entri yang mencocoki SELURUH kata, hanya
 *      entri itu yang ditampilkan — itu jawaban yang jauh lebih tepat. Kalau tidak ada satu
 *      pun, saringannya dilonggarkan jadi "cocok salah satu" dan hasilnya diurutkan menurut
 *      berapa kata yang cocok. Nol hasil hampir selalu lebih buruk daripada hasil yang
 *      perlu dipilih sendiri.
 *
 * `saring` membatasi jenis entri, mis. hanya varietas untuk jalur 4 — tidak berubah.
 * `pintu` memasukkan entri yang bukan entitas melainkan tautan ke layar lain (hari ini:
 * komoditas). Dimatikan secara bawaan karena jalur 2, 3, dan 4 membuka hasilnya sebagai
 * rincian dari pecahan indeks, dan pintu tidak punya pecahan untuk dibuka.
 */
export async function cari(kueri, saring, { pintu = false } = {}) {
  const r = rapikan(kueri);
  const u = uraikan(kueri);

  // Kueri satu kata, atau kalimat yang seluruh katanya kata perekat: yang dicari untaiannya
  // sendiri. Ini juga yang menjaga "tambah N huruf lagi" tetap berbunyi seperti dulu.
  const istilah = u.istilah.length ? u.istilah : (r ? [r] : []);
  if (!istilah.length) return { hasil: [] };

  // Ember diambil untuk untaian penuh DAN untuk tiap istilah. Yang penuh dipertahankan
  // karena ia masih yang paling tepat untuk nama beruang seperti "abamektin 18": untaian
  // "abamektin18" mencocoki satu merek, sementara kata "abamektin" saja mencocoki ratusan.
  // Tiga istilah terpanjang saja yang diambil embernya — kalimat yang lebih panjang dari itu
  // tidak menyempit lebih jauh, dan tiap ember tambahan satu perjalanan lagi di sinyal buruk.
  const kunciEmber = [
    ...(u.istilah.length > 1 ? [r] : []),
    ...[...istilah].sort((a, b) => b.length - a.length).slice(0, 3),
  ];

  const emberDipakai = new Set();
  let kurangTerkecil = null;
  for (const k of kunciEmber) {
    const { ember, kurang } = emberUntuk(k);
    if (kurang) {
      // "Tambah huruf lagi" hanya berlaku kalau TIDAK ADA satu pun kata yang cukup panjang.
      // Satu kata pendek di dalam kalimat yang punya kata panjang bukan alasan menahan
      // seluruh jawabannya.
      kurangTerkecil = kurangTerkecil === null ? kurang : Math.min(kurangTerkecil, kurang);
      continue;
    }
    for (const e of ember) emberDipakai.add(e);
  }
  if (!emberDipakai.size) return { kurang: kurangTerkecil ?? 1, urai: u };

  const isi = await Promise.all([...emberDipakai].map((e) => ambil(`cari/${e}`)));

  // Satu entri bisa terambil dua kali — sekali dari ember namanya, sekali dari ember alias
  // yang dibuatkan untuknya (nama tanpa awalan lembaga, nama ilmiah OPT, kata penanda
  // sediaan). Di indeks keduanya memang harus ada; di layar cukup satu.
  const unik = new Map();
  for (const x of isi.flat()) {
    if (saring && !saring(x)) continue;
    if (!pintu && x.j === 'komoditas') continue;
    if (!unik.has(x.i)) unik.set(x.i, x);
  }

  const dinilai = [];
  for (const x of unik.values()) {
    const [n, k, f] = medanCocok(x);
    const cocok = istilah.filter((t) => n.includes(t) || k.includes(t) || f.includes(t)).length;
    const diNama = istilah.filter((t) => n.includes(t)).length;
    const utuh = r.length >= 2 && n.includes(r);
    if (!cocok && !utuh) continue;
    dinilai.push({
      x,
      cocok,
      diNama,
      utuh,
      awalan: istilah.some((t) => n.startsWith(t)) || (utuh && n.startsWith(r)),
    });
  }

  // DAN kalau bisa: kalau ada yang mencocoki seluruh kata, yang mencocoki sebagian dibuang.
  const penuh = dinilai.filter((d) => d.cocok === istilah.length);
  let dipakai = penuh.length ? penuh : dinilai;

  /* Saringan jenis, dan ia LUNAK — kalau menyaring menghabiskan hasilnya, saringannya
   * dijatuhkan dan penjatuhannya dilaporkan.
   *
   * Contohnya "Phonska produk perusahaan apa": kata "perusahaan" memang menyebut jenis
   * `principal`, tetapi tidak ada badan bernama Phonska. Menyaring dengan keras di sini akan
   * menjawab nol untuk pertanyaan yang jawabannya justru ada dan lengkap — yang benar
   * menjawab produknya, lalu menyebutkan siapa pemegangnya dari medan yang sudah terambil.
   *
   * Pintu komoditas dikecualikan karena ia bukan entri sejenis melainkan tautan ke daftar:
   * yang mengetik "varietas alpukat" justru paling terbantu oleh pintu yang menyebut seluruh
   * 145 varietasnya, dan pintu itu ber-`j` "komoditas", bukan "varietas". */
  let jenisDijatuhkan = false;
  // Syarat `dipakai.length` bukan kehati-hatian berlebih: tanpa itu, kueri yang memang nol
  // hasilnya dilaporkan sebagai "penyempitannya tidak dipakai" — padahal tidak ada apa pun
  // untuk disempitkan. Layar akan menyalahkan kata yang tidak bersalah.
  if (u.jenis.length && dipakai.length) {
    const diminta = new Set(u.jenis);
    const disaring = dipakai.filter((d) => diminta.has(d.x.j) || d.x.j === 'komoditas');
    if (disaring.length) dipakai = disaring;
    else jenisDijatuhkan = true;
  }

  dipakai.sort((a, b) => (
    // Untaian penuh lebih dulu — "abamektin 18" tetap menjawab merek itu, bukan seluruh
    // merek berabamektin. Lalu berapa kata yang cocok, lalu di mana cocoknya: nama yang
    // memuat kata yang diketik lebih tepat daripada baris keterangan yang memuatnya.
    Number(b.utuh) - Number(a.utuh)
    || b.cocok - a.cocok
    || b.diNama - a.diNama
    || Number(b.awalan) - Number(a.awalan)
    || a.x.n.localeCompare(b.x.n)
  ));

  return {
    hasil: dipakai.map((d) => d.x),
    urai: u,
    // Dua hal yang layar perlu bisa katakan, dan yang tidak bisa disimpulkan dari daftarnya:
    // bahwa hasilnya cuma cocok sebagian, dan bahwa penyempitan yang diminta tidak terpakai.
    sebagian: !penuh.length && istilah.length > 1,
    jenisDijatuhkan,
  };
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
  // Rekaman uji registri (`u`) diturunkan ke belakang, bukan dibuang. Registri Kementan
  // memuat artefak QA-nya sendiri — "testssl", "08oktest123", "Intel (Test)" — dan yang
  // mengetik "tes" mendapati belasan di antaranya di atas produk sungguhan. Menyaringnya
  // habis ditolak: permukaan ini menyalin registri apa adanya, dan yang hilang diam-diam
  // tidak bisa diperiksa siapa pun. Jadi ia turun, lalu menyebut dirinya di kartunya.
  const daftarUrut = daftar.some((x) => x.u)
    ? [...daftar].sort((a, b) => Number(Boolean(a.u)) - Number(Boolean(b.u)))
    : daftar;
  const tampil = daftarUrut.slice(0, 40);

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
        // Kalimatnya ikut jenisnya. "Bukan produk yang beredar" pada entri BAHAN AKTIF
        // menyangkal yang tidak pernah diakuinya — entri itu tidak pernah mengaku produk —
        // dan menyisakan pertanyaan yang justru penting: kalau bukan produk, apa ia bahan
        // sungguhan? Yang perlu dibantah di sana kebahanannya, bukan keberedarannya.
        const pembeda = x.u
          ? `<span class="pembeda kosong-pembeda">Rekaman uji registri — bukan ${x.j === 'bahan' ? 'bahan aktif sungguhan' : 'produk yang beredar'}.</span>`
          : x.f
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
/* TOMBOL KEMBALI PERANGKAT IKUT MENUTUP LAYAR RINCIAN — bukan melempar keluar halaman.
 *
 * Di HP Android, kebiasaan navigasi nomor satu adalah tombol back perangkat, dan sampai
 * 24 Agustus 2026 menekannya dari layar rincian jalur 1–6 membuang seluruh hasil pencarian
 * dan keluar dari halaman. Tombol "← Kembali ke hasil pencarian" memang ada, tetapi bukan
 * itu yang ditekan orang secara refleks. Hanya `harga.js` yang sudah memakai riwayat.
 *
 * Perbaikannya di sini, bukan di enam berkas: fungsi ini sudah dipanggil tepat pada saat
 * layar rincian selesai digambar, jadi ia tahu kapan sebuah "layar" dibuka. Ia menambah
 * satu entri riwayat, dan menutup layar ketika entri itu dilepas — dari tombol perangkat
 * maupun dari tombol di halaman, yang kini menempuh jalan yang sama supaya keduanya tidak
 * bisa menyimpang.
 *
 * URL-nya sengaja TIDAK diubah kecuali pemanggil menyediakan `alamat`. Menyusun URL yang
 * benar per jalur menuntut id dan pecahannya, dan menebaknya akan menghasilkan alamat yang
 * gagal saat dimuat ulang — lebih buruk daripada alamat yang tidak berubah. Jalur yang
 * memang punya alamatnya tinggal mengoperkannya. */
let tutupKini = null;

addEventListener('popstate', () => {
  const t = tutupKini;
  tutupKini = null;
  t?.();
});

export function pasangKembali(wadah, { fokus, gulirKe, sesudah, alamat } = {}) {
  const b = wadah.querySelector('#kembali');
  if (!b) return;

  const tutup = () => {
    wadah.innerHTML = '';
    sesudah?.();
    if (gulirKe) gulirKe.scrollIntoView({ block: 'start' });
    fokus?.focus();
  };

  // Satu entri per layar rincian. Membukanya berturut-turut tidak menumpuk entri:
  // yang sebelumnya sudah dilepas penutupnya sendiri, atau digantikan di sini.
  tutupKini = tutup;
  try {
    history.pushState({ rincian: true }, '', alamat ?? location.href);
  } catch { /* peramban menolak menulis riwayat — tombol di halaman tetap bekerja */ }

  b.addEventListener('click', () => {
    // Lewat riwayat, supaya entri yang tadi didorong ikut terlepas. Tanpa ini, tombol
    // perangkat sesudahnya akan menutup layar yang sudah tertutup.
    if (history.state?.rincian) history.back();
    else { tutupKini = null; tutup(); }
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
