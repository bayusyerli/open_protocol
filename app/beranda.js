/* Beranda — pintu depan keenam jalur dan ketujuh alat.
 *
 * Halaman ini tidak menampilkan rincian apa pun. Ia hanya mencari nama, lalu
 * menyerahkan yang ditemukan ke jalur yang memang perendernya: produk ke jalur 2,
 * varietas ke jalur 4. Menyalin perendernya ke sini berarti dua layar yang sama
 * akan menyimpang diam-diam begitu salah satunya diperbaiki.
 *
 * Pencariannya sendiri memakai `cari()` yang sama dengan kedua jalur itu — kepala
 * indeks yang sama, pemecahan ember yang sama, urutan yang sama.
 */

import { muatMeta, bacaMeta, isiCacah, ambil, cari, cariGejala, cariNamaLokal, namaBerdekatan, tautanHasil, teks, JENIS, pesanGagalMuat, pasangCobaLagi } from './pustaka.js';
import { jawabPemegang, kelasKetinggian, kataDasar } from './tanya.js';
import { pasangTombolTema } from './tema.js';
import { catatLubang, LUBANG } from './ukur.js';
import { pasangBatas } from './batas.js';

const el = {
  form: document.getElementById('formCari'),
  q: document.getElementById('q'),
  kirim: document.querySelector('.tombol-cari'),
  hapus: document.getElementById('hapus'),
  saran: document.getElementById('saran'),
  hasil: document.getElementById('hasil'),
  sumber: document.getElementById('sumber'),
  batas: document.getElementById('batasJawaban'),
  cip: document.getElementById('cipJaringan'),
  lembar: document.getElementById('lembarTentang'),
  cacah: document.getElementById('cacahTentang'),
  atribusiHarga: document.getElementById('atribusiHarga'),
};

// Jalur mana yang memiliki perender untuk satu jenis entri.
// Jalur mana yang memiliki perender untuk satu jenis entri. Bahan aktif tinggal di
// Rute hasil pencarian pindah ke pustaka.js: cangkang.js memakai rute yang sama untuk
// kotak cari yang tetap, dan dua salinan aturan "jenis mana dibuka halaman mana" akan
// menyimpang persis seperti <p class="lain"> dulu menyimpang.
const tautan = (x, kueri = el.q.value.trim()) => tautanHasil(x, kueri);

const tautanGejala = (g) => `tanaman.html?${new URLSearchParams({ opt: g.i })}`;

const angkaId = (n) => Number(n ?? 0).toLocaleString('id-ID');

// ---------------------------------------------------------------------------
// Pencarian
// ---------------------------------------------------------------------------

const BATAS = 40;

const kartuNama = (x, kueri) => `
  <li>
    <a href="${teks(tautan(x, kueri))}" data-jenis="${teks(x.j)}">
      <span>
        <span class="nama-hasil">${teks(x.n)}</span>
        <span class="sub-hasil">${teks(x.k ?? '—')}</span>
        ${x.f ? `<span class="pembeda-hasil">${teks(x.f)}</span>`
          : (x.j === 'pupuk' || x.j === 'pestisida')
            ? '<span class="pembeda-hasil kosong-pembeda">komposisi tidak tercatat di registri</span>' : ''}
      </span>
      <span class="lencana">${teks(JENIS[x.j] ?? x.j)}</span>
    </a>
  </li>`;

// Satu nama lokal bisa menunjuk lebih dari satu OPT, dan itu bukan kekurangan yang
// disembunyikan melainkan jawabannya sendiri: "layu" memang tidak membedakan fusarium
// dari bakteri. Yang bertaksa jadi beberapa tautan berdampingan beserta kalimat yang
// menyebut apa yang tidak dibedakannya; memilih satu diam-diam akan mendahului uji
// pembanding yang justru dibangun jalur 1 untuk memutuskannya.
const kartuNamaLokal = (x) => {
  if (!x.ke.length) {
    return `
      <li class="hasil-belum">
        <span>
          <span class="nama-hasil">${teks(x.n)}</span>
          <span class="sub-hasil">${teks(x.belum ?? 'Belum terpetakan.')}</span>
        </span>
        <span class="lencana">Belum terpetakan</span>
      </li>`;
  }
  // Wilayah ikut tampil begitu diketahui. Kamus yang menyembunyikan batas wilayahnya
  // akan menyodorkan nama satu daerah kepada seluruh negeri — dan sejak ada rekaman
  // pertama yang wilayahnya tercatat, menyembunyikannya jadi kekeliruan aktif, bukan
  // sekadar keterangan yang kebetulan hilang.
  const sebaranNama = x.wilayah?.length ? `Terdengar di ${x.wilayah.join(', ')}.` : '';
  const bawah = [sebaranNama, x.taksa].filter(Boolean).join(' ');
  return x.ke.map((k, i) => `
    <li>
      <a href="tanaman.html?${new URLSearchParams({ opt: k.i })}" data-jenis="nama-lokal">
        <span>
          <span class="nama-hasil">${teks(x.n)} <em>→ ${teks(k.l ?? k.i)}</em></span>
          ${i === 0 && bawah ? `<span class="sub-hasil">${teks(bawah)}</span>` : ''}
        </span>
        <span class="lencana">Nama lokal</span>
      </a>
    </li>`).join('');
};

/* A1 — perutean niat. Tujuh layar bukan entitas dan tidak akan pernah muncul dari
 * pencarian nama: kalkulator hara, kalibrasi semprot, titik impas, rencana musim, buku
 * kas, direktori toko, dan harga eceran. Yang mengetik "berapa tangki" tidak sedang
 * menyebut nama apa pun — ia menyebut pertanyaannya.
 *
 * Invarian dengan papan di index.html: TIAP KARTU DI PAPAN HARUS BISA DICAPAI DARI
 * KOTAK INI. Keenam jalur dan profil perusahaan dicapai lewat namanya — produk, varietas,
 * dan badan memang entitas yang punya nama. Kelima sisanya tidak punya nama untuk
 * disebut, jadi merekalah yang wajib ada di daftar bawah ini. Kartu yang tidak memenuhi
 * salah satu dari keduanya cuma bisa ditemukan yang sudah tahu ia ada.
 *
 * INI MERUTEKAN, BUKAN MENJAWAB. Salah rute berbiaya satu ketukan terbuang; salah jawab
 * berbiaya semprotan yang keliru. Karena itu tautannya tampil sebagai PINTU di samping
 * hasil pencarian biasa, tidak pernah menggantikannya.
 *
 * Daftarnya sengaja pendek dan ditulis tangan. Pencocokan yang pintar menebak lebih
 * sering, dan tebakan yang lebih sering di pintu masuk berarti orang lebih sering
 * mendarat di layar yang salah tanpa tahu kenapa. */
const rapiNiat = (s) => (s ?? '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const NIAT = [
  { ke: 'harga-pupuk.html', judul: 'Hitung rupiah per kilogram hara',
    kata: ['hara', 'per kg hara', 'bandingkan pupuk', 'pupuk mana', 'murah mana', 'mahal mana'] },
  { ke: 'takaran.html', judul: 'Kalibrasi semprot & takaran',
    kata: ['tangki', 'kalibrasi', 'takaran', 'menakar', 'tutup botol', 'sendok', 'semprot', 'berapa ml'] },
  { ke: 'usaha.html', judul: 'Titik impas usaha tani',
    kata: ['impas', 'balik modal', 'modal', 'biaya tanam', 'untung', 'rugi', 'rab', 'anggaran'] },
  // Sengaja TIDAK mengambil "untung" dan "rugi" dari usaha.html, walau keduanya cocok.
  // Yang mengetiknya sebelum tanam memaksudkan rencana, yang mengetiknya di tengah musim
  // memaksudkan catatan — dan pintu masuk tidak bisa membedakannya. Yang diambil di sini
  // hanya kata yang berarti MENCATAT, bukan kata yang berarti ingin tahu hasilnya.
  { ke: 'rencana.html', judul: 'Rencana musim dari protokol',
    kata: ['rencana', 'jadwal', 'kapan tanam', 'urutan', 'protokol', 'musim'] },
  { ke: 'kas.html', judul: 'Buku kas per petak',
    kata: ['catat', 'mencatat', 'pembukuan', 'buku kas', 'pengeluaran', 'belanja', 'nota', 'kas'] },
  // Direktori ini menampung empat kumpulan yang menjawab tiga niat berbeda — membeli,
  // bertanya, dan menguji — jadi kata masuknya harus menutupi ketiganya. Yang berdiri
  // sendiri hanya kata yang tidak bisa berarti lain: "residu" saja bisa berarti
  // pertanyaan batas maksimum, sementara "tanah", "pupuk", dan "air" saja sudah jadi
  // milik jalur lain. Ketiganya baru diambil setelah dirangkai dengan "uji", yang tidak
  // bisa berarti apa pun selain minta diperiksakan ke laboratorium.
  { ke: 'toko.html', judul: 'Cari toko tani, benih, penyuluhan & lab',
    kata: ['toko', 'kios', 'beli di mana', 'penjual', 'terdekat', 'dekat sini',
           'penyuluh', 'penyuluhan', 'bpp',
           'lab', 'laboratorium', 'uji residu', 'uji tanah', 'uji pupuk', 'uji air'] },
  { ke: 'harga.html', judul: 'Harga eceran harian',
    kata: ['harga', 'berapa harga'] },
];

/* Frasa dicocokkan sebagai KUMPULAN KATA, bukan sebagai untaian berurutan.
 *
 * Versi pertama mencari "kapan tanam" apa adanya di dalam kalimat, dan itu benar hanya untuk
 * orang yang mengetiknya persis begitu. "Kapan waktu yang cocok untuk menanam cabai" memuat
 * kedua katanya, terpisah lima kata dan berimbuhan — dan dijawab tanpa satu pun pintu, di
 * bawah kalimat yang justru menyebut "pintunya di bawah". Kalimat yang menunjuk ke pintu
 * yang tidak digambar lebih buruk daripada tidak menyebut pintunya sama sekali.
 *
 * Yang dipakai bentuk dasar seluruh katanya, perekat sekalipun: frasa "beli di mana" dan
 * "berapa tangki" memang memakai perekatnya sebagai bagian frasa. Longgarnya disengaja dan
 * berbiaya rendah — ini merutekan, bukan menjawab, dan dua pintu yang ditawarkan bersamaan
 * masih lebih baik daripada nol pintu. */
const cariNiat = (kueri) => {
  const punya = new Set(kataDasar(kueri));
  return NIAT.filter((x) => x.kata.some(
    (k) => rapiNiat(k).split(' ').every((w) => punya.has(w)),
  ));
};

const kartuNiat = (x) => `
  <li>
    <a href="${teks(x.ke)}" data-jenis="niat">
      <span><span class="nama-hasil">${teks(x.judul)}</span></span>
      <span class="lencana">Pintu</span>
    </a>
  </li>`;

const kelompok = (judul, catatan, isi) => `
  <div class="kelompok-hasil">
    <p class="ringkas-hasil"><strong>${judul}</strong>${catatan ? ` — ${catatan}` : ''}</p>
    <ul class="daftar-hasil">${isi}</ul>
  </div>`;

// ---------------------------------------------------------------------------
// Membaca pertanyaan — dan menyatakan apa yang dibacanya
// ---------------------------------------------------------------------------
/* KENAPA PENGURAIANNYA DITAMPILKAN, BUKAN DIKERJAKAN DIAM-DIAM.
 *
 * Kotak ini sekarang membuang sebagian kata yang diketik: "apa", "yang", dan "untuk"
 * dibuang karena tidak menyempitkan apa pun, tetapi "cocok" dan "terbaik" dibuang karena
 * permukaan ini MENOLAK menjawabnya. Kedua pembuangan itu tidak bisa dibedakan dari luar,
 * dan yang kedua berbahaya kalau tidak terlihat: daftar yang muncul sesudah kata "terbaik"
 * akan dibaca sebagai peringkat, dan tidak ada satu pun peringkat di registri mana pun.
 *
 * Jadi tiap pertanyaan berkalimat menerangkan dirinya sendiri di atas hasilnya: kata mana
 * yang dicari, penyempitan apa yang dipakai, dan kata mana yang sengaja tidak dijawab
 * beserta alasannya. Kueri satu kata tidak menampilkannya — menerangkan penguraian atas
 * satu kata cuma kebisingan.
 *
 * INI TETAP BUKAN PERENDER RINCIAN. Yang digambar di sini kalimat tentang PERTANYAANNYA,
 * bukan kartu tentang entitas — pintu depan tetap menyerahkan rinciannya ke jalur yang
 * memang perendernya. Satu-satunya angka yang muncul di sini hasil hitungan atas ambang
 * yang diterbitkan (kelas dataran), dan hitungan itu tidak dimiliki layar mana pun. */

const daftarKata = (xs) => xs.map((x) => `<span class="keping-kata">${teks(x)}</span>`).join(' ');

const NAMA_JENIS_TANYA = {
  pupuk: 'pupuk', pestisida: 'pestisida', varietas: 'varietas', bahan: 'bahan aktif',
  opt: 'hama & penyakit', harga: 'harga', sediaan: 'sediaan sendiri',
  principal: 'perusahaan', komoditas: 'tanaman',
};

function blokBacaan(urai, jenisDijatuhkan) {
  const baris = [];
  if (urai.istilah.length) {
    baris.push(`<li><span class="bacaan-label">Dicari</span> ${daftarKata(urai.istilah)}</li>`);
  }
  if (urai.jenis.length) {
    const nama = urai.jenis.map((j) => NAMA_JENIS_TANYA[j] ?? j).join(', ');
    baris.push(`<li><span class="bacaan-label">Disempitkan ke</span> <span>${teks(nama)}${
      jenisDijatuhkan ? ' — <em>tidak dipakai, tidak ada yang cocok dengan jenis itu</em>' : ''}</span></li>`);
  }
  if (urai.nilai.length) {
    // B4: permintaan peringkat adalah permintaan yang paling sering datang dan paling
    // pasti ditolak. Mencacahnya memberi tahu seberapa besar jarak antara yang ditanyakan
    // orang dan yang sanggup dijawab data ini — dan itu angka yang belum pernah ada.
    catatLubang('beranda', LUBANG.peringkatDiminta);
    baris.push(`<li class="bacaan-tolak"><span class="bacaan-label">Tidak dijawab</span>
      <span>${daftarKata(urai.nilai)} — permukaan ini tidak memeringkat apa pun. Registri
      mencatat <strong>izin edar</strong>, bukan mutu, kemanjuran, atau kecocokan: ia tidak
      menguji apa pun, ia mendaftarkan. Yang di bawah daftar pendaftaran, bukan urutan
      terbaik.</span></li>`);
  }
  if (!baris.length) return '';
  return `
    <div class="bacaan-tanya">
      <p class="ringkas-hasil"><strong>Yang dibaca dari pertanyaan ini</strong></p>
      <ul class="bacaan">${baris.join('')}</ul>
    </div>`;
}

/* Jawaban "perusahaan apa" disusun dari medan yang SUDAH ada di kartu hasilnya — jadi ia
 * tidak menambah satu pengambilan pun, dan tidak menambah satu klaim pun di luar registri.
 * Aturan dua tingkatnya (nama persis dulu, sisanya tetap disebutkan) ada di tanya.js. */
function blokPemegang(hasil, urai) {
  const j = jawabPemegang(hasil, urai.istilah);
  if (!j || !j.badan.length) return '';
  const sebut = (b) => (b.pk
    ? `<a href="perusahaan.html?key=${encodeURIComponent(b.pk)}">${teks(b.label)}</a>`
    : `<strong>${teks(b.label)}</strong>`);

  const utama = j.badan.length === 1
    ? `Terdaftar atas nama ${sebut(j.badan[0])}.`
    : `Terdaftar atas nama <strong>${j.badan.length} badan</strong>: ${
      j.badan.slice(0, 4).map((b) => `${sebut(b)} <span class="cacah-badan">${b.cacah}</span>`).join(', ')
    }${j.badan.length > 4 ? ', dan lainnya' : ''}.`;

  // Nama dagang tidak eksklusif di registri, dan diam soal itu membuat jawaban tingkat
  // pertama terbaca sebagai "cuma ini yang ada".
  const catatan = j.persisDipakai && j.lain
    ? `Dihitung dari pendaftaran yang bernama <em>persis</em> itu. ${angkaId(j.lain)} pendaftaran
       lain namanya berawalan sama tetapi tidak sama — sebagiannya dipegang badan yang berbeda,
       dan semuanya ada di daftar di bawah.`
    : 'Yang dicatat registri pemegang pendaftarannya — belum tentu pabrik yang membuatnya, dan belum tentu yang menjualnya.';

  return `
    <div class="jawab-tanya">
      <p class="jawab-utama">${utama}</p>
      <p class="jawab-batas">${catatan}</p>
    </div>`;
}

/* Isi produk juga sudah ada di kepala pencarian — `f` memuat bahan aktif beserta kadarnya,
 * dan itu justru medan yang membedakan empat PHONSKA satu sama lain. Yang tidak punya `f`
 * bukan produk tanpa isi melainkan produk yang komposisinya kosong di registri, dan bedanya
 * disebutkan. */
function blokIsi(hasil, urai) {
  const kata = new Set(urai.istilah);
  const persis = hasil.filter((x) => kata.has(x.n.toLowerCase().replace(/[^a-z0-9]/g, '')));
  const dipakai = (persis.length ? persis : hasil).filter((x) => x.j === 'pupuk' || x.j === 'pestisida');
  if (!dipakai.length) return '';
  const isi = [...new Set(dipakai.filter((x) => x.f).map((x) => x.f))];
  const kosong = dipakai.filter((x) => !x.f).length;
  if (!isi.length) {
    return `
      <div class="jawab-tanya">
        <p class="jawab-utama">Komposisinya <strong>tidak tercatat di registri</strong> untuk
        ${angkaId(kosong)} pendaftaran yang cocok.</p>
        <p class="jawab-batas">Itu keadaan datanya, bukan berarti produknya tanpa isi —
        28,7% pupuk terdaftar tidak berkomposisi sama sekali di sumbernya.</p>
      </div>`;
  }
  return `
    <div class="jawab-tanya">
      <p class="jawab-utama">${isi.length === 1
        ? `Isinya <strong>${teks(isi[0])}</strong>.`
        : `Ada <strong>${isi.length} komposisi berbeda</strong> di bawah nama itu: ${
          isi.slice(0, 6).map((s) => `<strong>${teks(s)}</strong>`).join(', ')}${isi.length > 6 ? ', dan lainnya' : ''}.`}</p>
      <p class="jawab-batas">${isi.length > 1
        ? 'Nama yang sama dengan komposisi berbeda bukan rekaman ganda melainkan pendaftaran yang memang terpisah — dan komposisinya yang membedakan. Pilih yang tertulis di kemasan.'
        : 'Yang dibaca komposisi terdaftar, bukan isi karung. Yang bisa memastikan isi hanya uji laboratorium.'}${
  kosong ? ` ${angkaId(kosong)} pendaftaran lain yang cocok tidak berkomposisi di registri.` : ''}</p>
    </div>`;
}

/* Ketinggian: satu-satunya angka di kotak ini yang punya ambang terbit untuk diadu — dan
 * jawaban atasnya HAMPIR SELURUHNYA berupa batas.
 *
 * Yang bisa dihitung: 500 m termasuk kelas apa, menurut skema siapa, dengan ambang berapa.
 * Dua skema dijawab sekaligus dan sengaja tidak dipilihkan salah satunya — "dataran
 * menengah" menurut konvensi hortikultura dan "zona panas" menurut Junghuhn keduanya benar
 * untuk angka yang sama, dan istilah yang dipakai orang setiap hari memang punya dua arti.
 *
 * Yang TIDAK bisa dihitung, dan justru itu yang ditanyakan: varietas mana yang cocok di
 * sana. Nol dari 11.227 varietas membawa sifat agronomi apa pun. Menyaring daftar dengan
 * kelas ini berarti mengarang penyaringan yang datanya tidak punya dasar. */
function blokKetinggian(urai, agro) {
  if (!urai.ketinggian && !urai.dataran) return '';
  const meta = bacaMeta();
  catatLubang('beranda', LUBANG.ketinggianVarietas);

  let utama;
  if (urai.ketinggian) {
    const kelas = kelasKetinggian(agro, urai.ketinggian.meter);
    // Kalimat PERTAMA definisi kelas saja — kalimat itu selalu ambangnya, dan sisanya
    // keterangan yang panjangnya berbeda-beda per skema. Junghuhn menutup definisinya
    // dengan daftar tumbuhan contoh, dan daftar itu di dalam kurung akan terbaca seperti
    // anjuran tanam, yang justru bukan isi skemanya.
    const ambang = (s) => String(s ?? '').split(/(?<=\.)\s/)[0].replace(/\.$/, '');
    const sebut = kelas
      .map(({ skema, kelas: k }) => (k.length === 1
        ? `<strong>${teks(k[0].n)}</strong> menurut ${teks(skema.n)} <span class="ambang">(${teks(ambang(k[0].arti))})</span>`
        : null))
      .filter(Boolean);
    if (!sebut.length) return '';
    utama = `${angkaId(urai.ketinggian.meter)} m dpl — ${sebut.join('; ')}.`;
  } else {
    utama = `“Dataran ${teks(urai.dataran)}” adalah kelas pada skema dataran hortikultura,
      bukan sebuah angka. Sebutkan meternya kalau ingin kelasnya dihitung.`;
  }

  return `
    <div class="jawab-tanya">
      <p class="jawab-utama">${utama}</p>
      <p class="jawab-batas">${teks(meta?.tidakAda?.ketinggianVarietas
        ?? 'Registri tidak mencatat ketinggian yang cocok untuk satu pun varietas.')}</p>
    </div>`;
}

/* Waktu tanam: dirutekan, tidak dijawab — dan perutean tanpa kalimat batasnya akan terbaca
 * sebagai janji bahwa tanggalnya ada di layar tujuan. Kosakata fase memang sengaja tidak
 * punya medan hari; alasannya di meta.tidakAda, ditulis oleh yang membangun indeksnya. */
function blokWaktu(urai) {
  if (!urai.waktu.length && !urai.tindakan.includes('tanam')) return '';
  if (!urai.waktu.length) return '';
  const meta = bacaMeta();
  catatLubang('beranda', LUBANG.kalenderTanam);
  return `
    <div class="jawab-tanya">
      <p class="jawab-utama">Kapannya <strong>tidak dijawab dari sini</strong>, dan itu bukan
      data yang kebetulan belum ditarik.</p>
      <p class="jawab-batas">${teks(meta?.tidakAda?.rencanaBukanKalender
        ?? 'Rencana musim bukan kalender: fase tidak memuat hari, jadi tanggalnya tidak ditebak.')}
      Yang bisa dipakai rencana musim berbasis fase — pintunya di bawah.</p>
    </div>`;
}

/** Seluruh kepala jawaban, disusun sekali. `agro` boleh null — blok ketinggian tidak digambar. */
function kepalaTanya(urai, hasil, jenisDijatuhkan, agro) {
  if (!urai?.pertanyaan) return '';
  const blok = [
    blokBacaan(urai, jenisDijatuhkan),
    urai.atribut.includes('pemegang') ? blokPemegang(hasil, urai) : '',
    urai.atribut.includes('isi') ? blokIsi(hasil, urai) : '',
    blokKetinggian(urai, agro),
    blokWaktu(urai),
  ].filter(Boolean);
  return blok.join('');
}

/* Kosakata agroklimat diambil HANYA kalau pertanyaannya menyebut ketinggian. 16 KB pada
 * permukaan yang syarat lapangannya sinyal buruk terlalu mahal untuk dibawa tiap muat
 * halaman demi satu bentuk pertanyaan; `ambil()` mengingatnya sesudah pengambilan pertama,
 * jadi pertanyaan berikutnya tidak membayar lagi. */
async function agroBila(urai) {
  if (!urai?.ketinggian) return null;
  return ambil('agroklimat').catch(() => null);
}

// Sisa argumennya jadi objek bernama sejak yang keenam. Enam argumen berposisi sudah di
// batas terbaca; sepuluh berarti tiap penambahan berikutnya menuntut pemanggilnya menghitung
// koma, dan `gambar(a, b, c, d, e, [], [], x)` tidak memberi tahu apa pun tentang `x`.
function gambar(nama, bahan, gejala, lokal, kueri,
  { harga = [], badan = [], komoditas = [], kepala = '', urai = null } = {}) {
  const bagian = [];
  const niat = cariNiat(kueri);

  // Kepala jawaban di atas segalanya: yang bertanya "perusahaan apa" mendapat kalimatnya
  // lebih dulu, lalu daftar yang menjadi dasarnya. Urutan sebaliknya membuat jawabannya
  // tenggelam di bawah tujuh belas kartu.
  if (kepala) bagian.push(kepala);

  // Pintu komoditas mendahului seluruh daftar entri, dan itu disengaja: satu barisnya
  // menjawab "ada berapa" untuk seluruh varietas dan OPT tanaman itu, sementara kartu
  // entri di bawahnya cuma yang kebetulan namanya memuat kata yang diketik. Untuk
  // "alpukat" bedanya 145 lawan 20.
  if (komoditas.length) {
    bagian.push(kelompok(
      komoditas.length === 1 ? 'Pintu tanaman' : `${komoditas.length} pintu tanaman`,
      'daftar <strong>pendaftaran</strong> — OPT yang punya produk terdaftar, varietas yang punya surat, dan harganya kalau ada',
      komoditas.map((x) => kartuNama(x, kueri)).join('')));
  }

  // Nama lokal paling dulu. Yang mengetik "patek" sudah tahu apa yang dilihatnya dan
  // sedang menyebut namanya; itu kueri paling spesifik yang bisa masuk ke kotak ini.
  // Tingkat buktinya disebut di judul kelompoknya, bukan disembunyikan: kamusnya dari
  // satu jawaban lapangan, dan layar tidak boleh terdengar lebih yakin daripada itu.
  if (lokal.length) {
    // B4: nama yang dikenal tetapi rujukannya belum ada adalah permintaan data yang
    // paling langsung — seseorang benar-benar memakainya, dan kamusnya belum sampai.
    for (const x of lokal) if (!x.ke.length) catatLubang('beranda', LUBANG.namaLokalTakTerpetakan);
    // Keterangan kelompok DITURUNKAN dari rekaman yang benar-benar tampil, bukan ditulis
    // tangan. Kalimat lamanya menyebut "satu jawaban lapangan" dan "belum diketahui dipakai
    // di daerah mana"; keduanya berhenti benar begitu kamusnya memuat nama dari sumber lain
    // yang justru wilayahnya tercatat — dan kalimat tetap akan berbohong tepat pada rekaman
    // yang paling banyak diketahui.
    const berwilayah = lokal.filter((x) => x.wilayah?.length).length;
    const sebaran = berwilayah === 0
      ? 'dan belum diketahui dipakai di daerah mana'
      : berwilayah === lokal.length
        ? 'dan wilayah pemakaiannya tercatat'
        : `dan ${berwilayah} dari ${lokal.length} menyebut wilayah pemakaiannya`;
    const tingkat = [...new Set(lokal.map((x) => x.bukti).filter(Boolean))].sort();
    bagian.push(kelompok(
      `${lokal.length} nama lokal cocok`,
      `tingkat bukti <strong>${teks(tingkat.join('/')) || '—'}</strong>, belum ditinjau penyuluh — ${sebaran}`,
      lokal.map(kartuNamaLokal).join('')));
  }

  // Gejala lebih dulu. Kalau kueri memang cocok dengan apa yang terlihat di kebun,
  // itu hampir pasti yang dimaksud — dan itu pula cabang bertaruhan paling tinggi.
  if (gejala.length) {
    bagian.push(kelompok(
      `${gejala.length} gejala cocok`,
      'sepuluh OPT cabai terkurasi, <strong>berstatus draft</strong>',
      gejala.map((g) => `
        <li>
          <a href="${teks(tautanGejala(g))}" data-jenis="gejala">
            <span>
              <span class="nama-hasil">${teks(g.n)}${g.l ? ` <em>${teks(g.l)}</em>` : ''}</span>
              <span class="sub-hasil">${g.cocok} dari ${g.dari} kata cocok · ${angkaId(g.produk)} produk terdaftar di ${angkaId(g.komoditas)} komoditas</span>
            </span>
            <span class="lencana">Gejala</span>
          </a>
        </li>`).join('')));
  }

  // Lalu bahan aktif: satu kartu bahan membuka seluruh merek yang memuatnya, jadi ia
  // menjawab lebih banyak daripada satu merek yang kebetulan bernama sama.
  if (bahan.length) {
    bagian.push(kelompok(
      `${bahan.length} bahan aktif cocok`,
      'daftarnya dipecah per kadar — setara hanya kalau bahan <em>dan</em> kadarnya sama',
      bahan.map((x) => kartuNama(x, kueri)).join('')));
  }

  // Harga sebelum nama terdaftar: yang mengetik "cabai" di beranda lebih sering menanyakan
  // harganya daripada merek pestisida yang kebetulan bernama sama.
  if (harga.length) {
    bagian.push(kelompok(
      `${harga.length} komoditas berharga`,
      'harga <strong>eceran</strong> nasional — bukan harga yang diterima petani',
      harga.map((x) => kartuNama(x, kueri)).join('')));
  }

  if (badan.length) {
    const tampil = badan.slice(0, BATAS);
    bagian.push(kelompok(
      `${angkaId(badan.length)} perusahaan atau lembaga`,
      `memegang pendaftaran atas namanya${badan.length > tampil.length ? `, ${tampil.length} teratas` : ''}`,
      tampil.map((x) => kartuNama(x, kueri)).join('')));
  }

  if (nama.length) {
    const tampil = nama.slice(0, BATAS);
    // "Nama terdaftar" berhenti benar begitu sediaan dan OPT ikut masuk kepala
    // pencarian: resep sediaan diterbitkan proyek ini sendiri, dan nama OPT adalah
    // sasaran yang disebut pendaftaran orang lain — bukan sesuatu yang didaftarkan.
    // Yang membedakan tiap barisnya sudah dibawa lencananya masing-masing, jadi yang
    // perlu diperbaiki cuma judulnya: macam apa saja yang benar-benar ada di dalamnya
    // disebutkan, bukan diratakan jadi satu kata yang menaikkan sebagian isinya.
    const macam = [...new Set(tampil.map((x) => JENIS[x.j] ?? x.j))]
      .map((t) => t.toLowerCase()).join(', ');
    // Yang disebut di sini KATA YANG DICARI, bukan kalimat yang diketik. Sejak kotak ini
    // menerima pertanyaan, keduanya berbeda — dan menulis "memuat Kapan waktu yang cocok
    // untuk menanam cabai" pada daftar yang sebenarnya dicocokkan dengan "cabai" adalah
    // keterangan yang salah, bukan keterangan yang panjang.
    const dicari = urai?.pertanyaan && urai.istilah.length ? urai.istilah : [kueri];
    bagian.push(kelompok(
      `${angkaId(nama.length)} nama cocok`,
      `${macam} — memuat ${dicari.map((s) => `<strong>${teks(s)}</strong>`).join(' dan ')}${nama.length > tampil.length ? `, ${tampil.length} teratas` : ''} · yang diawali kata itu didahulukan`,
      tampil.map((x) => kartuNama(x, kueri)).join('')));
  }

  // Pintu ditawarkan di BAWAH hasil nama, tidak pernah menggantikannya: kalau ada hasil
  // nama, yang dicari hampir pasti namanya.
  if (niat.length) {
    bagian.push(kelompok(
      bagian.length ? 'Atau mungkin yang dicari alatnya' : 'Sepertinya yang dicari alatnya',
      'ini <strong>pintu</strong>, bukan jawaban — layar tujuannya yang menghitung',
      niat.map(kartuNiat).join('')));
  }

  el.hasil.innerHTML = bagian.join('');
}

const BLOK_NAMA_TAK_TERAMBIL = `
  <div class="pesan">
    <h2>Pencarian nama belum bisa dijalankan</h2>
    <p>
      Kepala pencarian nama tidak ada di peranti ini, dan sambungannya sedang tidak
      terjangkau. Yang di atas tetap benar — gejala dan nama lokal memang tersimpan.
    </p>
    <p>
      Supaya pencarian nama ikut bekerja tanpa sinyal, simpan sekali dari
      <a href="peranti.html">apa yang tercatat di peranti ini</a>. Ukurannya disebutkan di sana.
    </p>
  </div>`;

function gambarNamaTakTerambil() {
  el.hasil.innerHTML = BLOK_NAMA_TAK_TERAMBIL;
}

async function gambarKosong(kueri, kepala = '', urai = null) {
  // Nol hasil adalah tempat perutean niat paling berguna: yang mengetik "berapa tangki"
  // memang tidak akan pernah punya hasil nama, dan tanpa ini ia dijawab "tidak ada".
  //
  // Nol hasil juga tempat kepala jawaban paling perlu: pertanyaan yang tidak mengandung satu
  // pun nama terdaftar — "kapan waktu tanam", "yang paling ampuh apa" — memang akan selalu
  // nol, dan "tidak ada yang cocok" adalah jawaban yang keliru untuknya. Yang benar
  // menyebutkan apa yang dibaca dari pertanyaannya dan kenapa bagian itu tidak dijawab.
  const niat = cariNiat(kueri);
  if (niat.length) {
    el.hasil.innerHTML = kepala + kelompok(
      'Sepertinya yang dicari alatnya',
      'ini <strong>pintu</strong>, bukan jawaban — layar tujuannya yang menghitung',
      niat.map(kartuNiat).join(''));
    return;
  }
  // B4: dua lubang sekaligus tertabrak — nama yang dicari tidak punya padanan
  // terdaftar, dan gejalanya di luar sepuluh yang terkurasi. Yang dicatat cacahnya,
  // bukan kuerinya; lihat docs/11 bagian 3.
  catatLubang('beranda', LUBANG.namaDagang);
  catatLubang('beranda', LUBANG.gejalaOpt);

  /* DUA NOL YANG BERBEDA, dan sebelum kotak ini menerima kalimat hanya ada satu.
   *
   * Yang pertama: sebuah nama dicari dan tidak ada padanannya — itu keadaan data, dan
   * kalimat panjang di bawah memang untuk itu. Yang kedua: pertanyaannya tidak memuat satu
   * pun nama untuk dicari ("pupuk apa yang paling bagus"), dan nol di situ bukan soal
   * kelengkapan registri sama sekali. Menjawab keduanya dengan kalimat yang sama membuat
   * yang kedua terbaca sebagai "produknya tidak terdaftar", padahal tidak ada produk yang
   * ditanyakan. */
  const tanpaNama = urai?.pertanyaan && !urai.istilah.length;
  const blok = tanpaNama
    ? `
    <div class="pesan">
      <h2>Tidak ada nama yang bisa dicari di pertanyaan itu</h2>
      <p>
        Kotak ini menemukan sesuatu lewat <em>namanya</em> — nama merek di kemasan, bahan
        aktif, hama, tanaman, atau perusahaan. Pertanyaan tadi tidak menyebut satu pun.
        Sebutkan namanya, atau pakai salah satu alat di bawah kalau yang dicari hitungan.
      </p>
    </div>`
    : `
    <div class="pesan">
      <h2>Tidak ada yang cocok dengan “${teks(kueri)}”</h2>
      <p>
        Tidak ada nama terdaftar, bahan aktif, maupun gejala terkurasi yang memuatnya.
        Untuk nama, itu <em>bukan</em> berarti produknya tidak terdaftar: registri
        menyimpan nama <em>terdaftar</em>, kemasan sering memakai nama jualan yang lain,
        dan pemetaan antara keduanya belum ada.
      </p>
    </div>`;
  // Kepala jawaban DITAMBAHKAN di depan, bukan ditimpa. Versi pertama menulisnya lebih dulu
  // lalu menimpanya dengan blok di bawah, dan akibatnya persis kebalikan dari gunanya:
  // pertanyaan yang paling perlu dijelaskan justru yang penjelasannya hilang.
  el.hasil.innerHTML = kepala + blok;

  // Kalau kosongnya cuma karena satu-dua huruf keliru, ejaan terdekat lebih berguna
  // daripada penjelasan panjang. Kueri aslinya tidak diganti diam-diam — dan yang diadu
  // ejaannya ISTILAHNYA, bukan kalimatnya: "trips" bisa berjarak satu huruf dari "Thrips",
  // sedangkan "pestisida paling ampuh untuk trips" tidak berjarak dari apa pun.
  const untukEjaan = urai?.istilah?.length ? urai.istilah[0] : kueri;
  const dekat = await namaBerdekatan(untukEjaan).catch(() => []);
  if (!dekat.length) return;
  el.hasil.insertAdjacentHTML('beforeend', kelompok('Apakah maksudnya…', '',
    dekat.map((x) => kartuNama(x, x.n)).join('')));
}

let jeda;
async function jalankan() {
  const kueri = el.q.value.trim();
  el.hapus.hidden = !kueri;
  if (!kueri) {
    el.hasil.innerHTML = '';
    el.saran.hidden = false;
    return;
  }
  try {
    // Keduanya sekaligus, bukan berurutan: yang satu mengambil satu ember nama, yang
    // lain satu kepala gejala 3,2 KB yang sesudahnya teringat sesi ini.
    // Ketiganya ditangkap sendiri-sendiri. Sebelum A5 hanya dua yang ditangkap, dan
    // akibatnya baru kelihatan saat diuji tanpa jaringan: ember nama yang gagal diambil
    // membunuh hasil gejala dan nama lokal yang sebenarnya SUDAH ada di peranti. Satu
    // cabang yang tidak sanggup tidak boleh membungkam cabang yang sanggup — aturan yang
    // sama dengan "nol dan tak-sanggup bukan kegagalan" di docs/11.
    const [namaHasil, gejala, lokal] = await Promise.all([
      // `pintu: true` hanya di sini dan di kotak cangkang: pintu komoditas menaut ke halaman
      // terbitan, bukan ke pecahan indeks, jadi jalur yang membuka hasilnya sebagai rincian
      // (2, 3, 4) tidak boleh menerimanya.
      cari(kueri, null, { pintu: true }).catch(() => ({ takTerambil: true })),
      cariGejala(kueri).catch(() => []),
      cariNamaLokal(kueri).catch(() => []),
    ]);
    const { hasil, kurang, takTerambil, urai, jenisDijatuhkan } = namaHasil;

    if (kurang && !gejala.length && !lokal.length) {
      el.hasil.innerHTML =
        `<p class="ringkas-hasil">Tambah ${kurang} huruf lagi supaya pecahan indeksnya cukup sempit.</p>`;
      return;
    }
    el.saran.hidden = true;

    const daftar = hasil ?? [];
    const bahan = daftar.filter((x) => x.j === 'bahan');
    const harga = daftar.filter((x) => x.j === 'harga');
    const komoditas = daftar.filter((x) => x.j === 'komoditas');
    // Satu badan bisa muncul dua kali — sekali di bawah nama penuhnya, sekali di bawah nama
    // tanpa awalan lembaga. Di indeks keduanya memang harus ada; di layar cukup satu.
    const badan = [...new Map(daftar.filter((x) => x.j === 'principal').map((x) => [x.i, x])).values()];
    const nama = daftar.filter((x) => !['bahan', 'harga', 'principal', 'komoditas'].includes(x.j));

    // Kosakata agroklimat diambil sesudah hasilnya ada, bukan bersamaan: ia cuma perlu untuk
    // satu bentuk pertanyaan, dan menunggunya bersama pengambilan yang selalu terjadi akan
    // menahan seluruh layar demi pertanyaan yang jarang.
    const agro = await agroBila(urai);
    const kepala = kepalaTanya(urai, daftar, jenisDijatuhkan, agro);

    if (!nama.length && !bahan.length && !gejala.length && !lokal.length && !harga.length
        && !badan.length && !komoditas.length) {
      if (takTerambil) return gambarNamaTakTerambil();
      return gambarKosong(kueri, kepala, urai);
    }
    gambar(nama, bahan, gejala, lokal, kueri, { harga, badan, komoditas, kepala, urai });
    // Yang sanggup sudah tergambar di atas; yang tidak sanggup dinyatakan di bawahnya,
    // bukan dibiarkan terbaca sebagai "tidak ada namanya".
    if (takTerambil) el.hasil.insertAdjacentHTML('beforeend', BLOK_NAMA_TAK_TERAMBIL);
  } catch (e) {
    el.hasil.innerHTML = `
      <div class="pesan galat">
        <h2>Pencarian gagal</h2>
        <p>Berkas indeksnya tidak terambil. Periksa sambungan, lalu ketik ulang — yang
        sudah terambil tetap tersimpan, jadi percobaan berikutnya lebih ringan.</p>
        <p class="catatan">${teks(e.message)}</p>
      </div>`;
  }
}

el.q.addEventListener('input', () => {
  clearTimeout(jeda);
  jeda = setTimeout(jalankan, 180);
});
el.form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  clearTimeout(jeda);
  jalankan();
});
el.hapus.addEventListener('click', () => {
  el.q.value = '';
  el.q.focus();
  jalankan();
});
el.saran.addEventListener('click', (ev) => {
  const t = ev.target.closest('button[data-kueri]');
  if (!t) return;
  el.q.value = t.dataset.kueri;
  el.q.focus();
  jalankan();
});


// ---------------------------------------------------------------------------
// Tema — tiga keadaan, bukan dua
// ---------------------------------------------------------------------------
// Putaran, ikon, dan labelnya pindah ke tema.js supaya kedelapan halaman memakai yang
// sama. Selama ia tinggal di sini, pilihannya berhenti di beranda.

pasangTombolTema();


// ---------------------------------------------------------------------------
// Jaringan — dinyatakan, bukan disembunyikan
// ---------------------------------------------------------------------------

function cipJaringan() {
  const luring = !navigator.onLine;
  el.cip.dataset.luring = luring ? 'ya' : 'tidak';
  el.cip.lastElementChild.textContent = luring
    ? 'Luring — hanya yang sudah terambil'
    : 'Ada sinyal';
}
addEventListener('online', cipJaringan);
addEventListener('offline', cipJaringan);
cipJaringan();

// ---------------------------------------------------------------------------
// Lembar "tentang data"
// ---------------------------------------------------------------------------

// Ada dua pintu ke lembar ini — satu di kepala, satu di kaki. Yang di kepala hilang
// di layar paling sempit, jadi yang di kaki bukan hiasan.
for (const b of document.querySelectorAll('[data-buka-tentang]'))
  b.addEventListener('click', () => el.lembar.showModal());

// ---------------------------------------------------------------------------
// Mulai
// ---------------------------------------------------------------------------

(async function mulai() {
  try {
    const m = await muatMeta();
    // Angka yang tercetak di prosa halaman ini diisi dari meta, bukan diketik tangan —
    // lihat isiCacah() di pustaka.js. Dipanggil sesudah meta ada, sebelum apa pun digambar.
    isiCacah();
    const j = m.jumlah;
    const n = (x) => (x ?? 0).toLocaleString('id-ID');

    // Satu kementerian tidak lagi cukup disebut: kotak yang sama menjawab harga eceran
    // dari Kemendag dan tiga kumpulan yang diterbitkan proyek ini sendiri. Menyebut
    // Kementan saja membuat yang bukan salinan registri terbaca seolah salinan registri.
    el.sumber.innerHTML =
      `Sumber lewat <code>spec/indeks/</code> — registri Kementan: ` +
      `${n(j.pestisida)} pestisida, ${n(j.pupuk)} pupuk, ${n(j.varietas)} varietas, ` +
      `${n(j.principal)} badan pemegang pendaftaran; ${n(j.produkSetara)} produk berada ` +
      `dalam ${n(j.kelompokSetara)} kelompok berisi sama. Harga eceran dari SP2KP Kemendag. ` +
      `Kurasi gejala, kamus nama lokal, dan resep sediaan terbitan Pranatani sendiri.`;

    const atribusi = m.batas?.sumber?.harga?.atribusi;
    if (atribusi) el.atribusiHarga.textContent = atribusi;

    // Empat registri di balik satu kotak, dan tanggal masing-masing. Kotak yang
    // menjawab tiga macam pertanyaan menyembunyikan bahwa jawabannya datang dari
    // sumber yang berbeda usia — di sinilah perbedaan itu dinyatakan.
    pasangBatas(el.batas, {
      sumber: ['pestisida', 'pupuk', 'varietas', 'kurasiOpt', 'namaLokal', 'sediaan',
        'principal', 'harga'],
      takDijawab: ['namaDagang', 'wilayahNamaLokal', 'gejalaOptRegistri', 'bahanHara',
        'harga', 'hargaPetani'],
    });

    // Satu baris per macam yang benar-benar bisa dicari dari kotak di atas, plus dua
    // yang menerangkan isinya. Keping yang tampil di papan tanpa cacahnya di sini —
    // atau sebaliknya — berarti salah satu dari keduanya sudah menyimpang.
    el.cacah.innerHTML = [
      ['Pestisida terdaftar', j.pestisida],
      ['Pupuk terdaftar', j.pupuk],
      ['Varietas terdaftar', j.varietas],
      ['Perusahaan pemegang pendaftaran', j.principal],
      ['Hama & penyakit registri berproduk', j.optRegistriBerproduk],
      ['Komoditas berharga', j.hargaVarian],
      ['Substansi pestisida', j.zatHidup],
      ['Kelompok berisi sama', j.kelompokSetara],
      ['OPT cabai terkurasi', j.optTerkurasi],
      ['Nama lokal terkumpul', j.namaLokal],
      ['Resep sediaan sendiri', j.resepSediaan],
    ].map(([k, v]) => `<dt>${teks(k)}</dt><dd>${n(v)}</dd>`).join('');

    el.q.disabled = false;
    el.kirim.disabled = false;

    // Kembali dari jalur lain membawa kuerinya, supaya hasilnya tidak hilang.
    const q = new URLSearchParams(location.search).get('q');
    if (q) { el.q.value = q; await jalankan(); }
  } catch (e) {
    el.hasil.innerHTML = pesanGagalMuat(e);
    pasangCobaLagi(el.hasil);
  }
})();
