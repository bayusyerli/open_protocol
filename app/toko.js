/* C7 — direktori layanan. Empat pintu, karena datanya memang empat bentuk.
 *
 * KEEMPATNYA DISEBUT SEKALIGUS DI KEPALA HALAMAN, DAN ITU PERUBAHAN 25 AGUSTUS 2026.
 * Sampai hari itu keempat pintu berdiri berurutan ke bawah: 7.269 px pada layar 812 px,
 * laboratorium mulai di layar keempat, balai penyuluhan di layar ketiga, dan di antara
 * pintu dua dan tiga berdiri satu kartu peringatan setinggi layar penuh yang terbaca
 * seperti akhir halaman. Yang mendarat di sini melihat satu dari empat, dan satu-satunya
 * tempat keempatnya disebut adalah paragraf pembuka tujuh baris — bentuk paling sulit
 * dipindai untuk sesuatu yang sebenarnya sebuah daftar pilihan.
 *
 * Yang menggantikannya bukan tab. Kartu pemilihnya membawa KETERJANGKAUAN masing-masing,
 * bukan sekadar namanya, karena itulah satu-satunya perbedaan yang menentukan di halaman
 * ini — dan menyebutnya di kartu membuat pemisahan yang selama ini cuma diterangkan prosa
 * jadi hal pertama yang terbaca.
 *
 * YANG PALING MENENTUKAN DI HALAMAN INI BUKAN PENCARIANNYA, MELAINKAN PEMISAHANNYA.
 * 234 rekaman punya koordinat dan bisa dituju; 2.248 hanya punya nama kabupaten dan
 * tidak bisa. Menggabungkannya jadi satu daftar akan membuat yang kedua tampak setara
 * dengan yang pertama — dan itu satu-satunya perbedaan yang menentukan apakah halaman
 * ini berguna sama sekali.
 *
 * POSISI TIDAK PERNAH MENINGGALKAN PERANTI. Jarak dihitung di sini terhadap daftar yang
 * sudah diambil; tidak ada permintaan jaringan saat menghitungnya, dan tidak ada server
 * yang bisa menerimanya. Itu bukan kebetulan arsitektur — beranda menjanjikan "kata yang
 * dicari tidak dikirim ke mana pun", dan koordinat rumah orang jauh lebih menentukan
 * daripada kata yang dicarinya.
 *
 * TIDAK ADA GEOKODE. Yang berkoordinat tidak diberi nama wilayah, dan yang bernama
 * wilayah tidak diberi koordinat. Keduanya menuntut geokode massal, dan itu sudah
 * diputuskan tidak dilakukan — medan kosong menunggu pemilik toko mengklaimnya, bukan
 * ditambal tebakan.
 */

import { ambil, muatMeta, teks, pasangKembali } from './pustaka.js';
import { pasangBatas } from './batas.js';
import { pasangTombolTema } from './tema.js';

pasangTombolTema();
document.getElementById('tanpaJs')?.remove();

/* Empat pintu berdiri sendiri, dan penutupannya dulu ditulis dua kali dengan tangan:
 * satu penangan untuk pintu wilayah, satu gelung untuk BPP dan lab. Keduanya sekadar
 * mengosongkan wadah — tanpa entri riwayat, jadi tombol Back perangkat MENINGGALKAN
 * halaman alih-alih menutup layar rincian. Kesembilan permukaan lain sudah memakai
 * pasangKembali(); halaman ini satu-satunya yang belum.
 *
 * Daftar dan rinciannya juga tidak pernah tampil bersamaan lagi — alasan yang sama dengan
 * harga dan jalur 1. Di sini ia berlaku PER PINTU: yang disembunyikan hanya daftar milik
 * pintu yang sedang dibuka, karena keempat pintu memang menjawab pertanyaan berbeda dan
 * yang membuka satu balai penyuluhan tidak sedang menutup pencarian tokonya. */
function bukaRincian(daftar, rincian, fokus) {
  daftar.hidden = true;
  pasangKembali(rincian, {
    fokus,
    sesudah: () => {
      daftar.hidden = false;
      // Paksa tata letak dihitung ulang sebelum fokus menggulir ke kotak carinya.
      void document.documentElement.scrollHeight;
    },
  });
}

const el = {};
for (const id of ['ringkasTitik', 'cariDekat', 'hasilDekat', 'ringkasWilayah', 'q',
  'hasilWilayah', 'rincian', 'pctRinci',
  'ringkasBpp', 'qBpp', 'qKec', 'bantuKec', 'hasilBpp', 'rincianBpp',
  'ringkasLab', 'saringLab', 'hasilLab', 'rincianLab',
  'pemilih', 'pemilihBantu']) el[id] = document.getElementById(id);
el.batas = document.getElementById('batasJawaban');

const n = (x, d = 0) => Number(x ?? 0).toLocaleString('id-ID', { maximumFractionDigits: d });
const rapi = (s) => (s ?? '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/* `null` berarti BELUM DIAMBIL, dan itu bukan sama dengan kosong. Sejak indeks tiap
 * pintu baru diambil saat pintunya dibuka, penyajinya bisa terpanggil sebelum berkasnya
 * sampai — dan daftar kosong yang menjawab "tidak ada wilayah yang cocok" berbohong
 * tentang cakupan. Bedanya dijaga di sini, bukan di tiap penyaji. */
let titik = null;
let wilayah = null;
let bppWilayah = null;
let bppKecamatan = null;   // dimuat malas — lihat muatKecamatan()
let labKepala = null;
let saringan = null;

// ---------------------------------------------------------------------------
// Pemilih — keempat pintu, dan hanya satu yang terbuka
// ---------------------------------------------------------------------------
/* TIAP INDEKS DIAMBIL SAAT PINTUNYA DIBUKA, BUKAN SAAT HALAMAN DIMUAT.
 *
 * Keempatnya dulu diambil sekaligus di `mulai()`: 12,7 + 8,4 + 40,2 + 3,1 KB, jadi 64 KB
 * di atas meta 27 KB — dibayar penuh oleh tiap orang yang membuka layar ini, termasuk
 * yang datang hanya untuk satu pintu dan tidak pernah menyentuh tiga sisanya. Alasannya
 * persis alasan yang sudah dipakai daftar kecamatan 99 KB di bawah; yang berubah cuma
 * bahwa kini ia berlaku konsisten untuk keempatnya.
 *
 * CACAH DI KARTU PEMILIH TIDAK IKUT MENUNGGU. Angkanya datang dari meta yang memang
 * sudah dimuat tiap halaman, jadi keempat kartu sudah lengkap — nama, cacah, dan apa
 * yang benar-benar didapat — sebelum satu berkas indeks pun diambil. */
const PINTU = {
  toko: {
    panel: 'pintuToko', judul: 'judulToko', ringkas: 'ringkasTitik',
    muat: async () => { titik = await ambil('toko-titik'); },
  },
  benih: {
    panel: 'pintuBenih', judul: 'judulBenih', ringkas: 'ringkasWilayah',
    muat: async () => { wilayah = await ambil('toko-wilayah'); gambarWilayah(); },
  },
  bpp: {
    panel: 'pintuBpp', judul: 'judulBpp', ringkas: 'ringkasBpp',
    muat: async () => { bppWilayah = await ambil('bpp-wilayah'); gambarBpp(); },
  },
  lab: {
    panel: 'pintuLab', judul: 'judulLab', ringkas: 'ringkasLab',
    muat: async () => { labKepala = await ambil('lab-kemampuan'); gambarSaringLab(); gambarLab(); },
  },
};
for (const [k, p] of Object.entries(PINTU)) {
  p.kunci = k;
  p.elPanel = document.getElementById(p.panel);
  p.elJudul = document.getElementById(p.judul);
  p.elKartu = el.pemilih.querySelector(`button[data-ada="${k}"]`);
}

/* `ambil()` sudah mengingat janjinya sendiri, jadi pemanggilan kedua tidak menambah
 * perjalanan. Yang disimpan di sini janji SESUDAH penyajinya jalan — supaya tombol
 * "cari yang terdekat" bisa menunggunya, dan supaya kegagalan berbunyi di ringkasan
 * pintu yang bersangkutan alih-alih diam. */
function muatPintu(kunci) {
  const p = PINTU[kunci];
  if (!p.janji) {
    p.janji = p.muat().catch((e) => {
      p.janji = null;
      el[p.ringkas].innerHTML =
        `<span class="kosong">Daftarnya tidak terambil: ${teks(e.message)}. Coba buka lagi pintu ini.</span>`;
      throw e;
    });
  }
  return p.janji;
}

let adaKini = null;

/* Yang dibuka ditulis ke alamat supaya bisa dibagikan dan bertahan saat dimuat ulang —
 * tetapi lewat `replaceState`, bukan `pushState`. Tombol Back di halaman ini sudah punya
 * arti: menutup layar rincian yang sedang terbuka. Menumpuk entri untuk tiap perpindahan
 * pintu akan membuat orang menekan Back empat kali hanya untuk keluar dari halaman,
 * padahal keempat kartunya memang tidak pernah hilang dari layar. */
function bukaAda(kunci, { gulir = true } = {}) {
  adaKini = PINTU[kunci] ? kunci : null;

  for (const p of Object.values(PINTU)) {
    const buka = p.kunci === adaKini;
    p.elPanel.hidden = !buka;
    p.elKartu.setAttribute('aria-expanded', String(buka));
  }
  if (adaKini) el.pemilih.dataset.terpilih = adaKini;
  else delete el.pemilih.dataset.terpilih;
  el.pemilihBantu.hidden = Boolean(adaKini);

  const u = new URL(location.href);
  if (adaKini) u.searchParams.set('ada', adaKini);
  else u.searchParams.delete('ada');
  try { history.replaceState(history.state, '', u); } catch { /* peramban menolak menulis riwayat */ }

  if (!adaKini) return;
  muatPintu(adaKini).catch(() => { /* sudah dilaporkan di ringkasan pintunya */ });
  // Judulnya yang menerima fokus, bukan kartunya — pola yang sama dengan layar rincian
  // di seluruh permukaan lain, jadi pembaca layar mendarat di nama bagian yang baru
  // dipilihnya alih-alih tertinggal di daftar kartu.
  if (gulir) PINTU[adaKini].elJudul.focus();
}

/* Berpindah pintu SEMENTARA LAYAR RINCIAN TERBUKA harus melepas entri riwayatnya dulu.
 * Tanpa ini, rincian pintu lama tetap terpasang di panel yang baru disembunyikan dan
 * penutupnya masih terpasang di riwayat — sehingga tekanan Back berikutnya terpakai
 * untuk menutup sesuatu yang sudah tidak terlihat. `popstate` milik pustaka.js terpasang
 * lebih dulu, jadi ia menutup rinciannya sebelum penangan sekali-pakai di bawah membuka
 * pintu barunya. */
function pindahAda(kunci) {
  if (history.state?.rincian) {
    addEventListener('popstate', () => bukaAda(kunci), { once: true });
    history.back();
    return;
  }
  bukaAda(kunci);
}

/* Dipasang di dokumen, bukan di `el.pemilih`, karena kartu pemilih bukan satu-satunya
 * tempat yang menawarkan pindah pintu: kalimat jalan keluar di hasil "terdekat" —
 * dipakai justru oleh yang peramban atau izinnya tidak menyebutkan posisi — menunjuk
 * pintu penjual benih, dan ia tidak berada di dalam kartu mana pun. */
document.addEventListener('click', (ev) => {
  const b = ev.target.closest('button[data-ada]');
  if (!b) return;
  // Mengetuk kartu yang sedang terbuka menutupnya kembali ke daftar pilihan — kartu
  // penuhnya kembali, beserta kalimat yang menerangkan keempatnya.
  pindahAda(b.dataset.ada === adaKini ? null : b.dataset.ada);
});

// Haversine. Bumi bukan bola sempurna, dan pada jarak sekian kilometer selisihnya di
// bawah satu persen — jauh lebih kecil daripada ketidakpastian titik OSM itu sendiri.
function jarakKm(a, b, c, d) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (c - a) * r, dLon = (d - b) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const petaOsm = (y, x) =>
  `https://www.openstreetmap.org/?mlat=${y}&mlon=${x}#map=17/${y}/${x}`;

// ---------------------------------------------------------------------------
// Pintu 1 — terdekat
// ---------------------------------------------------------------------------
el.cariDekat.addEventListener('click', async () => {
  // 12 KB titiknya baru diminta saat pintu ini dibuka. Yang mengetuk sebelum berkasnya
  // sampai tetap harus dilayani — ditunggu di sini, bukan dibiarkan menghitung jarak
  // terhadap daftar yang belum ada.
  el.hasilDekat.innerHTML = '<p class="kosong" role="status">Menyiapkan daftar titik…</p>';
  try { await muatPintu('toko'); } catch { el.hasilDekat.innerHTML = ''; return; }

  if (!navigator.geolocation) {
    el.hasilDekat.innerHTML =
      '<p class="kosong" role="status">Peramban ini tidak bisa menyebutkan posisi, jadi urutan terdekat tidak bisa dihitung. ' +
      '<button type="button" class="tautan" data-ada="benih">Telusuri penjual benih menurut wilayah</button> — walau daftar itu memang tidak bisa dituju.</p>';
    return;
  }
  el.hasilDekat.innerHTML = '<p class="kosong" role="status">Menunggu izin lokasi…</p>';
  navigator.geolocation.getCurrentPosition(
    (pos) => gambarDekat(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
    (err) => {
      el.hasilDekat.innerHTML = `
        <p class="kosong" role="status">
          Posisi tidak diberikan${err.code === 1 ? ' — izinnya ditolak' : ''}. Itu pilihan yang sah;
          <button type="button" class="tautan" data-ada="benih">telusuri penjual benih menurut wilayah</button>,
          walau daftar itu memang tidak bisa dituju.
        </p>`;
    },
    { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
  );
});

function gambarDekat(lat, lon, akurasi) {
  const dekat = titik
    .map((t) => ({ ...t, km: jarakKm(lat, lon, t.y, t.x) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 15);

  el.hasilDekat.innerHTML = `
    <p class="bantuan" role="status">
      Lima belas terdekat dari ${n(titik.length)} titik. Posisimu terbaca dengan ketelitian
      sekitar ${n(akurasi)} m — jarak di bawah itu tidak berarti apa-apa.
    </p>
    <div class="pembungkus-tabel">
      <table>
        <thead><tr><th>Nama</th><th>Jarak</th><th>Peta</th></tr></thead>
        <tbody>
          ${dekat.map((t) => `
            <tr>
              <td>${teks(t.n)}</td>
              <td class="angka">${t.km < 1 ? `${n(t.km * 1000)} m` : `${n(t.km, 1)} km`}</td>
              <td><a href="${teks(petaOsm(t.y, t.x))}" rel="noopener noreferrer">buka peta</a></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="catatan">
      Jarak <strong>garis lurus</strong>, bukan jarak jalan — yang terdekat di peta bisa
      jadi yang terjauh kalau sungainya tidak berjembatan. Dan titik ini dari
      OpenStreetMap: <strong>tidak ada yang memastikan tokonya masih buka</strong>.
    </p>`;
}

// ---------------------------------------------------------------------------
// Pintu 2 — wilayah
// ---------------------------------------------------------------------------

/* Berapa banyak yang ditampilkan SEBELUM dan SESUDAH diketik — T5 pada audit alur.
 *
 * Empat puluh kabupaten urut abjad bukan jawaban, ia gulir. Dua daftar seperti itu di
 * satu halaman, ditambah daftar laboratorium, membuat toko.html sepanjang 13.111 px
 * dengan 130 kendali sebelum orang mengetik satu huruf pun — dan kalimat kaveat yang
 * sama tercetak tiga puluh delapan kali di antaranya.
 *
 * Yang ditampilkan sebelum ada ketikan cukup untuk menunjukkan BENTUK daftarnya —
 * bahwa isinya kabupaten, bahwa tiap baris membawa cacah, bahwa sebagian tidak
 * beralamat rinci. Delapan sudah mengatakan keempatnya. Sesudah diketik, empat puluh,
 * karena di situ daftarnya memang sedang dibaca. */
const PRATAMPIL = 8;
const AMBIL = 40;
function gambarWilayah() {
  if (!wilayah) {
    el.hasilWilayah.innerHTML = '<p class="kosong" role="status">Memuat daftar wilayah…</p>';
    return;
  }
  const r = rapi(el.q.value);
  const cocok = r ? wilayah.filter((w) => rapi(w.w).includes(r)) : wilayah;
  if (!cocok.length) {
    el.hasilWilayah.innerHTML =
      `<p class="kosong" role="status">Tidak ada wilayah yang cocok. Cakupannya baru ${n(wilayah.length)} kabupaten dan kota — jauh dari seluruh Indonesia.</p>`;
    return;
  }
  const tampil = cocok.slice(0, r ? AMBIL : PRATAMPIL);
  el.hasilWilayah.innerHTML = `
    <p class="bantuan" role="status">${n(cocok.length)} wilayah${cocok.length > tampil.length
      ? (r ? `, ditampilkan ${tampil.length} teratas` : ` — ${tampil.length} pertama di bawah, ketik untuk menyaring`)
      : ''}.</p>
    <ul class="daftar">
      ${tampil.map((w) => `
        <li>
          <button type="button" data-wilayah="${teks(w.k)}">
            <span class="nama">${teks(w.w)}<span class="lencana">${n(w.n)}</span></span>
            <span class="sub">${w.rinci ? `${n(w.rinci)} beralamat lebih rinci` : 'tidak satu pun beralamat lebih rinci dari kabupaten'}</span>
          </button>
        </li>`).join('')}
    </ul>`;
}

el.hasilWilayah.addEventListener('click', async (ev) => {
  const b = ev.target.closest('button[data-wilayah]');
  if (!b) return;
  const w = wilayah.find((x) => x.k === b.dataset.wilayah);
  el.rincian.innerHTML = '<p class="kosong">Mengambil…</p>';
  try {
    const isi = await ambil(`toko/${b.dataset.wilayah}`);
    const rinci = isi.filter((x) => x.j);
    el.rincian.innerHTML = `
      <div class="kartu">
        <h2>${teks(w?.w ?? '')}</h2>
        <p>
          ${n(isi.length)} penjual benih tercatat di wilayah ini.
          ${rinci.length
            ? `<strong>${n(rinci.length)}</strong> di antaranya menyebut alamat yang lebih rinci daripada kabupaten; sisanya tidak.`
            : '<strong>Tidak satu pun</strong> menyebut alamat yang lebih rinci daripada nama kabupaten ini.'}
        </p>
        <div class="pembungkus-tabel">
          <table>
            <thead><tr><th>Nama</th><th>Yang tercatat sebagai alamat</th></tr></thead>
            <tbody>
              ${isi.slice(0, 200).map((x) => `
                <tr>
                  <td>${teks(x.n)}</td>
                  <td>${x.j ? teks(x.a) : `<span class="kosong">hanya ${teks(w?.w ?? 'kabupaten')}</span>`}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        ${isi.length > 200 ? `<p class="catatan">${n(isi.length - 200)} lainnya tidak ditampilkan.</p>` : ''}
        <p class="catatan">
          <strong>Nama tanpa alamat tidak bisa dituju.</strong> Yang tercatat di sini bukti
          bahwa penjual benih ada di wilayah itu, bukan petunjuk ke mana pergi. Tidak ada
          nomor telepon, jam buka, maupun keterangan apakah tokonya masih ada.
        </p>
        <button type="button" class="kembali" id="kembali">← Kembali ke daftar wilayah</button>
      </div>`;
    el.rincian.focus();
    bukaRincian(el.hasilWilayah, el.rincian, el.q);
  } catch (e) {
    el.rincian.innerHTML = `<div class="kartu peringatan"><h2>Gagal diambil</h2>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
});

el.q.addEventListener('input', gambarWilayah);

// ---------------------------------------------------------------------------
// Balai penyuluhan — ditelusuri menurut KECAMATAN, karena itu satu-satunya penanda
// tempat yang dipunyainya
// ---------------------------------------------------------------------------
// Rekaman balai TIDAK punya alamat, dan itu batas sumbernya: laporan tamu SIMLUHTAN
// hanya memberi nama balai dan kecamatan binaannya. Halaman ini tidak menambalnya dengan
// geokode — keputusan yang sama seperti pada toko tani di atas.
//
// Tetapi "tanpa alamat" di sini TIDAK sama artinya dengan pada penjual benih. Nama
// penjual benih tanpa alamat tidak bisa dituju siapa pun; nama balai beserta kecamatan
// binaannya bisa dituju oleh orang yang tinggal di kecamatan itu — dan dialah yang
// mencarinya. Yang tidak tahu letaknya mesinnya, bukan orangnya. Karena itu kecamatan
// ditampilkan sebagai penanda utama, bukan sebagai catatan kaki.
/* DIAMBIL SAAT DISENTUH, BUKAN SAAT HALAMAN DIBUKA.
 *
 * 99 KB pada permukaan yang seluruh cangkangnya 230 KB bukan angka yang boleh dibebankan
 * kepada tiap orang yang membuka layar ini — termasuk yang datang hanya untuk penjual
 * benih di bagian atas dan tidak pernah menggulir sampai ke sini. Jadi ukurannya disebut
 * di bawah kotaknya, dan berkasnya menyusul saat kotak itu benar-benar dipakai.
 *
 * `ambil()` sudah mengingat janjinya sendiri, jadi pemanggilan kedua tidak menambah
 * perjalanan; penjaga di sini hanya untuk kalimat statusnya. */
let janjiKecamatan = null;
async function muatKecamatan() {
  if (bppKecamatan) return bppKecamatan;
  if (!janjiKecamatan) {
    el.bantuKec.textContent = 'Mengambil daftar kecamatan (99 KB)…';
    janjiKecamatan = ambil('bpp-kecamatan').then((d) => {
      bppKecamatan = d;
      el.bantuKec.textContent = `${n(Object.values(d).reduce((a, x) => a + x.length, 0))} kecamatan siap disaring.`;
      return d;
    }).catch((e) => {
      janjiKecamatan = null;
      el.bantuKec.textContent = `Daftar kecamatan gagal diambil: ${e.message}. Saringan kabupaten di atas tetap jalan.`;
      throw e;
    });
  }
  return janjiKecamatan;
}

// Tetapi "tanpa alamat" di sini TIDAK sama artinya dengan pada penjual benih. Nama
// penjual benih tanpa alamat tidak bisa dituju siapa pun; nama balai beserta kecamatan
// binaannya bisa dituju oleh orang yang tinggal di kecamatan itu — dan dialah yang
// mencarinya. Yang tidak tahu letaknya mesinnya, bukan orangnya. Karena itu kecamatan
// ditampilkan sebagai penanda utama, bukan sebagai catatan kaki.
//
// KECAMATAN MENYARING WILAYAH, dan itu arah yang benar. Yang mengetik "Cicurug" tidak
// sedang mempersempit daftar kabupaten yang sudah dipilihnya — ia sedang bertanya
// kabupaten mana yang memuat Cicurug. Karena itu nama kecamatan yang cocok ikut tercetak
// di kartunya: kalau jawabannya sudah terlihat di daftar, kartunya tidak perlu dibuka.
function kecCocok(kunci, r) {
  if (!r || !bppKecamatan) return null;
  return (bppKecamatan[kunci] ?? []).filter((x) => rapi(x).includes(r));
}

function gambarBpp() {
  if (!bppWilayah) {
    el.hasilBpp.innerHTML = '<p class="kosong" role="status">Memuat daftar kabupaten…</p>';
    return;
  }
  const r = rapi(el.qBpp.value);
  const rk = rapi(el.qKec.value);
  // Kecamatan diketik tetapi daftarnya belum sampai: yang salah bukan kuerinya, dan
  // menjawab "tidak ada yang cocok" di sini berbohong tentang cakupan.
  if (rk && !bppKecamatan) {
    el.hasilBpp.innerHTML = '<p class="kosong" role="status">Menunggu daftar kecamatan…</p>';
    return;
  }

  let cocok = r ? bppWilayah.filter((w) => rapi(w.w).includes(r)) : bppWilayah;
  if (rk) cocok = cocok.filter((w) => kecCocok(w.k, rk)?.length);

  if (!cocok.length) {
    el.hasilBpp.innerHTML = rk
      ? `<p class="kosong" role="status">Tidak ada kecamatan bernama itu${r ? ' di kabupaten yang cocok' : ''}. Yang terdaftar 6.824 kecamatan binaan dari ${n(bppWilayah.length)} kabupaten dan kota — kecamatan yang tidak punya balai binaan memang tidak ada di sini.</p>`
      : `<p class="kosong" role="status">Tidak ada kabupaten atau kota yang cocok. Cakupannya ${n(bppWilayah.length)} dari 514 — 34 provinsi, karena pemekaran Papua belum masuk basis data sumbernya.</p>`;
    return;
  }
  const tampil = cocok.slice(0, (r || rk) ? AMBIL : PRATAMPIL);
  el.hasilBpp.innerHTML = `
    <p class="bantuan" role="status">${n(cocok.length)} wilayah${cocok.length > tampil.length
      ? ((r || rk) ? `, ditampilkan ${tampil.length} teratas` : ` — ${tampil.length} pertama di bawah, ketik untuk menyaring`)
      : ''}.</p>
    <ul class="daftar">
      ${tampil.map((w) => {
        const kec = kecCocok(w.k, rk);
        return `
        <li>
          <button type="button" data-bpp="${teks(w.k)}">
            <span class="nama">${teks(w.w)}<span class="lencana">${n(w.n)}</span></span>
            <span class="sub">${kec?.length
              ? `${teks(kec.slice(0, 4).join(', '))}${kec.length > 4 ? ` dan ${n(kec.length - 4)} kecamatan lain` : ''}`
              : `membina ${n(w.kec)} kecamatan`}</span>
          </button>
        </li>`;
      }).join('')}
    </ul>`;
}

el.hasilBpp.addEventListener('click', async (ev) => {
  const b = ev.target.closest('button[data-bpp]');
  if (!b) return;
  const w = bppWilayah.find((x) => x.k === b.dataset.bpp);
  el.rincianBpp.innerHTML = '<p class="kosong">Mengambil…</p>';
  try {
    const isi = await ambil(`bpp/${b.dataset.bpp}`);
    const kosong = isi.filter((x) => !x.k.length).length;
    // Kuerinya dibawa masuk ke rincian. Yang mengetik "Cicurug" lalu membuka Sukabumi
    // mencari satu baris di antara 47 balai, dan menyuruhnya memindai tabel sendiri
    // membuang saringan yang baru saja dipakainya.
    const rk = rapi(el.qKec.value);
    const semua = isi;
    const cocokKec = rk ? isi.filter((x) => x.k.some((y) => rapi(y).includes(rk))) : isi;
    const disaring = rk && cocokKec.length && cocokKec.length < semua.length;
    const tampil = rk && cocokKec.length ? cocokKec : semua;
    el.rincianBpp.innerHTML = `
      <div class="kartu">
        <h2>${teks(w?.w ?? '')}</h2>
        <p>${n(semua.length)} balai penyuluhan, membina ${n(w?.kec ?? 0)} kecamatan.</p>
        ${disaring ? `<p class="bantuan" role="status">Ditampilkan ${n(tampil.length)} balai yang kecamatan binaannya cocok dengan &ldquo;${teks(el.qKec.value.trim())}&rdquo;. <button type="button" class="tautan" id="bppSemua">Tampilkan ${n(semua.length)} balai di wilayah ini</button></p>` : ''}
        ${rk && !cocokKec.length ? `<p class="bantuan" role="status">Tidak ada balai di sini yang kecamatan binaannya cocok dengan &ldquo;${teks(el.qKec.value.trim())}&rdquo;; seluruh ${n(semua.length)} balai ditampilkan.</p>` : ''}
        <div class="pembungkus-tabel">
          <table>
            <thead><tr><th>Balai</th><th>Kecamatan binaan</th><th class="angka">Penyuluh</th><th class="angka">Poktan</th></tr></thead>
            <tbody>
              ${tampil.map((x) => `
                <tr>
                  <td>${teks(x.n)}</td>
                  <td>${x.k.length ? teks(x.k.join(', ')) : '<span class="kosong">kosong di sumbernya</span>'}</td>
                  <td class="angka">${x.p == null ? '—' : n(x.p)}</td>
                  <td class="angka">${x.g == null ? '—' : n(x.g)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        ${kosong ? `<p class="catatan">${n(kosong)} balai di sini kecamatan binaannya kosong di sumbernya — bukan berarti ia tidak membina satu pun.</p>` : ''}
        <p class="catatan">
          <strong>Tidak ada alamat, telepon, maupun nama penyuluh</strong>, dan tidak akan
          ditambal. Laporan tamu SIMLUHTAN memang hanya memberi nama balai, kecamatan
          binaannya, dan cacahan orangnya. Yang menemukan balainya kecamatan, bukan peta.
        </p>
        <button type="button" class="kembali" id="kembali">← Kembali ke daftar wilayah</button>
      </div>`;
    // Saringan yang tidak bisa dilepas adalah saringan yang menyembunyikan. Tombolnya
    // menggambar ulang kartunya tanpa kueri kecamatan, bukan mengosongkan kotaknya —
    // kotaknya masih dipakai daftar wilayah di belakang.
    el.rincianBpp.querySelector('#bppSemua')?.addEventListener('click', () => {
      el.rincianBpp.querySelectorAll('tbody tr').forEach((x) => x.remove());
      const tb = el.rincianBpp.querySelector('tbody');
      for (const x of semua) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${teks(x.n)}</td><td>${x.k.length ? teks(x.k.join(', ')) : '<span class="kosong">kosong di sumbernya</span>'}</td><td class="angka">${x.p == null ? '—' : n(x.p)}</td><td class="angka">${x.g == null ? '—' : n(x.g)}</td>`;
        tb.appendChild(tr);
      }
      el.rincianBpp.querySelector('#bppSemua').closest('p').remove();
    });
    el.rincianBpp.focus();
    bukaRincian(el.hasilBpp, el.rincianBpp, el.qBpp);
  } catch (e) {
    el.rincianBpp.innerHTML = `<div class="kartu peringatan"><h2>Gagal diambil</h2><p class="catatan">${teks(e.message)}</p></div>`;
  }
});

// ---------------------------------------------------------------------------
// Laboratorium — disaring menurut KEMAMPUAN lebih dulu, baru tempat
// ---------------------------------------------------------------------------
// "Siapa yang bisa mengukur residu pestisida" menyaring 889 jadi 17. Daftar provinsi
// tanpa penyaring itu cuma memindahkan pekerjaan memilah ke pembacanya.
//
// MASA BERLAKU AKREDITASI DITANDAI, DAN ITU BUKAN HIASAN. 11 dari 889 sudah lewat masa
// berlakunya — dan satu di antaranya termasuk 17 yang bisa mengukur residu. Artinya
// penyaring "residu" mengembalikan satu jawaban yang hasil ujinya TIDAK LAGI DIAKUI, dan
// itu tidak terlihat dari nama laboratoriumnya. Cacah yang ditampilkan karena itu selalu
// menyebutkan berapa di antaranya yang sudah lewat.
const HARI_INI = new Date().toISOString().slice(0, 10);
const lewatMasa = (x) => Boolean(x.sd) && x.sd < HARI_INI;

function gambarSaringLab() {
  const arti = labKepala.arti;
  el.saringLab.innerHTML = `<legend>Yang perlu diuji</legend>` + Object.entries(arti)
    .sort((a, b) => (labKepala.cacah[b[0]] ?? 0) - (labKepala.cacah[a[0]] ?? 0))
    .map(([kode, nama]) => `
      <label class="saring-pilih">
        <input type="radio" name="kemampuan" value="${teks(kode)}"${kode === saringan ? ' checked' : ''}>
        <span>${teks(nama)} <span class="lencana">${n(labKepala.cacah[kode] ?? 0)}</span></span>
      </label>`).join('')
    + `<label class="saring-pilih">
         <input type="radio" name="kemampuan" value=""${saringan ? '' : ' checked'}>
         <span>semua <span class="lencana">${n(labKepala.wilayah.reduce((a, w) => a + w.n, 0))}</span></span>
       </label>`;
}

function gambarLab() {
  if (!labKepala) {
    el.hasilLab.innerHTML = '<p class="kosong" role="status">Memuat daftar laboratorium…</p>';
    return;
  }
  const w = labKepala.wilayah
    .map((x) => ({ ...x, cocok: saringan ? (x.per?.[saringan] ?? 0) : x.n }))
    .filter((x) => x.cocok > 0)
    .sort((a, b) => b.cocok - a.cocok || a.w.localeCompare(b.w));
  const nama = saringan ? labKepala.arti[saringan] : null;
  if (!w.length) {
    el.hasilLab.innerHTML = `<p class="kosong" role="status">Tidak ada provinsi yang punya laboratorium untuk ${teks(nama ?? 'itu')}.</p>`;
    return;
  }
  el.hasilLab.innerHTML = `
    <p class="bantuan" role="status">${n(w.reduce((a, x) => a + x.cocok, 0))} laboratorium${nama ? ` yang lingkupnya menyentuh ${teks(nama)}` : ''} di ${n(w.length)} provinsi.</p>
    <ul class="daftar">
      ${w.map((x) => `
        <li>
          <button type="button" data-lab="${teks(x.k)}">
            <span class="nama">${teks(x.w)}<span class="lencana">${n(x.cocok)}</span></span>
            ${nama ? `<span class="sub">dari ${n(x.n)} laboratorium di provinsi ini</span>` : ''}
          </button>
        </li>`).join('')}
    </ul>`;
}

el.saringLab.addEventListener('change', (ev) => {
  if (ev.target.name !== 'kemampuan') return;
  saringan = ev.target.value || null;
  el.rincianLab.innerHTML = '';
  gambarLab();
});

el.hasilLab.addEventListener('click', async (ev) => {
  const b = ev.target.closest('button[data-lab]');
  if (!b) return;
  const w = labKepala.wilayah.find((x) => x.k === b.dataset.lab);
  el.rincianLab.innerHTML = '<p class="kosong">Mengambil…</p>';
  try {
    const semua = await ambil(`lab/${b.dataset.lab}`);
    const isi = saringan ? semua.filter((x) => x.k.includes(saringan)) : semua;
    const lewat = isi.filter(lewatMasa);
    const nama = saringan ? labKepala.arti[saringan] : null;
    el.rincianLab.innerHTML = `
      <div class="kartu">
        <h2>${teks(w?.w ?? '')}</h2>
        <p>
          ${n(isi.length)} laboratorium${nama ? ` yang lingkupnya menyentuh <strong>${teks(nama)}</strong>` : ''}.
          ${lewat.length
            ? `<strong>${n(lewat.length)}</strong> di antaranya masa akreditasinya sudah lewat — hasil ujinya tidak lagi diakui sampai diperbarui.`
            : 'Seluruhnya masih dalam masa akreditasi.'}
        </p>
        <div class="pembungkus-tabel">
          <table>
            <thead><tr><th>Laboratorium</th><th>Alamat</th><th>Kontak</th><th>Akreditasi</th></tr></thead>
            <tbody>
              ${isi.map((x) => `
                <tr${lewatMasa(x) ? ' class="lewat-masa"' : ''}>
                  <td>${teks(x.n)}<br><span class="sub">${teks((x.k || '').split('').map((c) => labKepala.arti[c]).filter(Boolean).join(', '))}</span></td>
                  <td>${x.a ? teks(x.a) : '<span class="kosong">tidak tercatat</span>'}</td>
                  <td>${[x.t && teks(x.t), x.e && teks(x.e)].filter(Boolean).join('<br>') || '<span class="kosong">tidak tercatat</span>'}</td>
                  <td>${teks(x.no ?? '—')}<br><span class="sub">${x.sd ? `${lewatMasa(x) ? '<strong>lewat</strong> ' : 'sampai '}${teks(x.sd)}` : 'tanpa tanggal'}</span></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <p class="catatan">
          <strong>Tarif, waktu tunggu, dan apakah ia menerima sampel dari luar tidak ada
          di sini</strong> — tidak satu pun terbit di papan KAN. Yang dijamin akreditasi
          bukan harganya melainkan bahwa metodenya diperiksa.
        </p>
        <button type="button" class="kembali" id="kembali">← Kembali ke daftar provinsi</button>
      </div>`;
    el.rincianLab.focus();
    bukaRincian(el.hasilLab, el.rincianLab, el.saringLab);
  } catch (e) {
    el.rincianLab.innerHTML = `<div class="kartu peringatan"><h2>Gagal diambil</h2><p class="catatan">${teks(e.message)}</p></div>`;
  }
});

el.qBpp.addEventListener('input', gambarBpp);
el.qKec.addEventListener('input', () => {
  if (!el.qKec.value.trim()) { gambarBpp(); return; }
  muatKecamatan().then(gambarBpp, () => gambarBpp());
});

// ---------------------------------------------------------------------------
// Mulai
// ---------------------------------------------------------------------------
(async function mulai() {
  try {
    const m = await muatMeta();
    const j = m.jumlah;

    // Cacah di kartu pemilih datang dari meta, jadi keempat kartu sudah lengkap sebelum
    // satu berkas indeks pun diambil — lihat catatan di PINTU.
    const cacah = { toko: j.tokoBertitik, benih: j.tokoBerwilayah, bpp: j.bpp, lab: j.lab };
    for (const [k, v] of Object.entries(cacah)) {
      const c = el.pemilih.querySelector(`[data-cacah="${k}"]`);
      if (c) c.textContent = n(v);
    }

    el.ringkasTitik.innerHTML =
      `<strong>${n(j.tokoBertitik)} toko tani berkoordinat</strong> dari OpenStreetMap. ` +
      `Hanya ini yang benar-benar bisa dituju — dan seluruhnya di Pulau Jawa.`;
    el.ringkasWilayah.innerHTML =
      `<strong>${n(j.tokoBerwilayah)} penjual benih</strong> di ${n(j.tokoWilayah)} kabupaten dan kota. ` +
      `Hanya <strong>${n(j.tokoLebihRinci)}</strong> — ${(j.tokoLebihRinci / j.tokoBerwilayah * 100).toFixed(1)}% — ` +
      `menyebut sesuatu yang lebih rinci daripada nama kabupaten.`;
    if (el.pctRinci) {
      el.pctRinci.textContent =
        `${n(j.tokoLebihRinci)} dari ${n(j.tokoBerwilayah)} (${(j.tokoLebihRinci / j.tokoBerwilayah * 100).toFixed(1)}%)`;
    }

    // Balai dan laboratorium menjawab dua pertanyaan yang berbeda dari toko, dan
    // ringkasannya menyebut yang menentukan masing-masing: untuk balai, bahwa ia tidak
    // beralamat; untuk laboratorium, berapa yang bisa mengukur residu — angka yang
    // menyaring 889 jadi 17.
    el.ringkasBpp.innerHTML =
      `<strong>${n(j.bpp)} balai penyuluhan</strong> di ${n(j.bppWilayah)} kabupaten dan kota, ` +
      `membina ${n(j.bppKecamatanTerbina)} kecamatan. Tidak satu pun punya alamat — ` +
      `yang menemukannya kecamatan, bukan peta.`;
    el.ringkasLab.innerHTML =
      `<strong>${n(j.lab)} laboratorium terakreditasi KAN</strong> di ${n(j.labWilayah)} provinsi, ` +
      `yang ruang lingkupnya menyentuh usaha tani. Hanya <strong>${n(j.labResidu)}</strong> ` +
      `di antaranya bisa mengukur residu pestisida.`;

    pasangBatas(el.batas, {
      sumber: ['tokoTitik', 'tokoWilayah', 'bpp', 'lab'],
      takDijawab: ['tokoTakBisaDituju', 'tokoTanpaKontak', 'bppTanpaAlamat'],
    });

    /* Pintu yang diminta alamat dibuka tanpa memindahkan fokus: yang datang lewat tautan
     * `?ada=lab` belum menyentuh apa pun, dan merebut fokus ke tengah halaman sebelum ia
     * sempat membaca kepalanya justru membalik urutan yang dijanjikan halaman ini. */
    const minta = new URLSearchParams(location.search).get('ada');
    if (PINTU[minta]) bukaAda(minta, { gulir: false });
  } catch (e) {
    el.pemilihBantu.innerHTML =
      `<span class="kosong">Indeks tidak terambil: ${teks(e.message)}</span>`;
    el.pemilihBantu.hidden = false;
  }
})();
