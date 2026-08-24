/* Menguraikan sebuah PERTANYAAN jadi bagian yang bisa dicari — dan bagian yang tidak.
 *
 * KENAPA BERKAS INI ADA
 * Kepala pencarian mencocokkan satu kueri sebagai satu untaian huruf: `rapikan()` membuang
 * seluruh spasi, lalu mencari untaian itu di dalam nama entri. Untuk satu kata itu tepat.
 * Untuk satu kalimat itu selalu nol — dan nol tanpa sebab, karena tidak ada satu pun galat.
 * Ketiga contoh di bawah ini dijawab NOL sebelum berkas ini ada, dan ketiganya kalimat yang
 * memang diketik orang:
 *
 *   "Phonska produk perusahaan apa?"                 → "phonskaprodukperusahaanapa"
 *   "Apa saja varietas alpukat untuk 500 mdpl?"      → "apasajavarietasalpukatuntuk500mdpl"
 *   "Kapan waktu yang cocok untuk menanam cabai?"    → "kapanwaktuyangcocokuntukmenanamcabai"
 *
 * Yang dikerjakan di sini memecah kalimat itu jadi kata, lalu MENGGOLONGKAN tiap kata —
 * bukan sekadar membuang yang tidak berguna. Golongannya menentukan apa yang terjadi
 * padanya, dan dua golongan justru ada supaya kata itu bisa DIJAWAB, bukan didiamkan:
 *
 *   istilah      dicari di kepala pencarian                     "phonska", "alpukat", "cabai"
 *   jenis        menyempitkan macam entri, bukan dicari         "varietas", "pupuk"
 *   atribut      medan yang ditanyakan, dijawab dari hasilnya   "perusahaan", "bahan aktif"
 *   nilai        DITOLAK dijawab, dan penolakannya disebutkan   "cocok", "terbaik", "aman"
 *   waktu        pertanyaan waktu — dirutekan, tidak dihitung   "kapan", "musim"
 *   ketinggian   angka bersatuan, dijadikan kelas bernama       "500 mdpl"
 *   henti        dibuang tanpa suara                            "apa", "yang", "untuk"
 *
 * GOLONGAN `nilai` YANG PALING MENENTUKAN, DAN IA BUKAN URUSAN PENGURAIAN KALIMAT.
 * "cocok", "terbaik", "paling ampuh", "aman" adalah permintaan PERINGKAT, dan permukaan ini
 * memang tidak memeringkat apa pun: registri mencatat pendaftaran, bukan mutu, bukan
 * kemanjuran, dan bukan kecocokan. Kata seperti itu karena itu tidak dibuang diam-diam
 * seperti "yang" — ia dikenali, dikeluarkan dari pencarian, lalu DISEBUTKAN di layar sebagai
 * yang tidak dijawab. Membuangnya tanpa suara akan membuat "pestisida paling ampuh untuk
 * trips" menjawab daftar pestisida untuk trips, dan daftar itu akan terbaca sebagai
 * jawaban atas "paling ampuh". Itu kekeliruan yang jauh lebih mahal daripada nol hasil.
 *
 * DAFTARNYA DITULIS TANGAN DAN SENGAJA PENDEK — aturan yang sama yang sudah dipakai daftar
 * perutean niat di beranda.js. Pemenggal kata yang pintar (stemmer) menebak lebih sering,
 * dan tebakan di pintu masuk berarti orang mendarat di layar yang salah tanpa tahu kenapa.
 * Yang ada di sini hanya kata yang artinya tidak bisa lain di dalam kalimat pertanian.
 *
 * BERKAS INI TIDAK MENYENTUH DOM DAN TIDAK MENGAMBIL APA PUN. Seluruh isinya fungsi murni,
 * jadi ia bisa diuji tanpa peramban — spec/tools/uji-tanya.mjs menjalankan ketiga kalimat di
 * atas beserta tiga puluh lainnya sebagai uji.
 */

// ---------------------------------------------------------------------------
// 1. Memecah kalimat jadi kata
// ---------------------------------------------------------------------------

/* Angka DIPERTAHANKAN, huruf lain dibuang. Bedanya dengan `rapikan()` di pustaka.js: yang di
 * sana membuang spasi juga, karena ia memang membandingkan satu untaian dengan satu nama.
 * Di sini spasi justru satu-satunya yang memberi tahu di mana kata berakhir. */
export const rapiKata = (s) => (s ?? '')
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

/* Akhiran `-nya` dipenggal, satu-satunya penggalan yang dilakukan berkas ini.
 *
 * Alasannya bukan kerapian melainkan sebaran: "harganya", "isinya", "pabriknya",
 * "perusahaannya", "bahannya" adalah bentuk yang paling lazim diketik orang, dan tanpa
 * penggalan ini kelimanya jatuh ke "tidak dikenali". Batas empat huruf menahannya dari
 * merusak kata yang memang berakhiran itu: "hanya", "punya", "tanya", "bunya" tinggal utuh
 * karena sisanya cuma dua huruf. */
const penggalNya = (k) => (k.length >= 7 && k.endsWith('nya') ? k.slice(0, -3) : k);

/* Bentuk berimbuhan yang dipetakan ke bentuk dasarnya — DITULIS SATU-SATU, bukan diturunkan
 * aturan. Imbuhan meN- Indonesia meluluhkan huruf pertama katanya ("menanam" dari "tanam",
 * "menyemprot" dari "semprot"), dan aturan peluluhan itu punya cukup pengecualian sehingga
 * penebaknya akan salah pada kata yang justru sering diketik. Sebelas baris yang benar lebih
 * berguna daripada satu aturan yang benar delapan dari sepuluh kali. */
const BENTUK = {
  menanam: 'tanam', penanaman: 'tanam', ditanam: 'tanam', bertanam: 'tanam', nanam: 'tanam',
  tanamnya: 'tanam', menyemai: 'semai', persemaian: 'semai', menabur: 'tabur',
  menyemprot: 'semprot', penyemprotan: 'semprot', disemprot: 'semprot', nyemprot: 'semprot',
  memupuk: 'pupuk', pemupukan: 'pupuk', dipupuk: 'pupuk',
  memanen: 'panen', pemanenan: 'panen', dipanen: 'panen',
  menyiram: 'siram', penyiraman: 'siram',
  perusahaannya: 'perusahaan', pabriknya: 'pabrik', produsennya: 'produsen',
  membuat: 'pembuat', pembuatnya: 'pembuat', bikinan: 'buatan', keluaran: 'buatan',
  memproduksi: 'produksi', diproduksi: 'produksi', produksinya: 'produksi',
  kandungannya: 'kandungan', komposisinya: 'komposisi', bahannya: 'bahan',
  varietasnya: 'varietas', benihnya: 'benih', bibitnya: 'bibit',
  ketinggiannya: 'ketinggian', tingginya: 'ketinggian',
  harganya: 'harga', berapaan: 'harga',
};

const dasarkan = (k) => BENTUK[k] ?? penggalNya(k);

// ---------------------------------------------------------------------------
// 2. Golongan kata
// ---------------------------------------------------------------------------

/* Perekat kalimat. Dibuang tanpa disebutkan, karena membuangnya tidak menghilangkan satu pun
 * hal yang bisa dijawab. Yang TIDAK masuk sini kata yang kelihatannya perekat tetapi
 * sebenarnya menentukan bentuk jawaban — "kapan", "siapa", "berapa" — dan ketiganya punya
 * golongannya sendiri di bawah. */
export const KATA_HENTI = new Set([
  'apa', 'apakah', 'adakah', 'saja', 'yang', 'untuk', 'buat', 'dari', 'di', 'ke', 'pada',
  'dengan', 'dan', 'atau', 'itu', 'ini', 'adalah', 'ada', 'bisa', 'dapat', 'boleh', 'mau',
  'ingin', 'pengen', 'tolong', 'mohon', 'minta', 'tahu', 'tau', 'info', 'informasi',
  'tentang', 'soal', 'mengenai', 'ya', 'dong', 'sih', 'kah', 'nih', 'deh', 'kalau', 'jika',
  'bila', 'saya', 'aku', 'kami', 'kita', 'punya', 'milik', 'sebuah', 'para', 'lah', 'pun',
  'juga', 'lagi', 'lebih', 'semua', 'seluruh', 'tiap', 'setiap', 'jadi', 'akan', 'sudah',
  'belum', 'masih', 'sedang', 'agar', 'supaya', 'oleh', 'sebagai', 'seperti', 'antara',
  'gimana', 'bagaimana', 'kenapa', 'mengapa', 'nya', 'dpl', 'mdpl', 'm', 'meter',
]);

/* Kata yang menyebut MACAM entri, bukan namanya. Ia menyempitkan, tidak dicari.
 *
 * Penyempitannya LUNAK dan itu menentukan: kalau menyaring menurut jenis ini menghabiskan
 * seluruh hasil, saringannya dijatuhkan dan penjatuhannya disebutkan. "Phonska produk
 * perusahaan apa" contohnya — "perusahaan" menyebut jenis `principal`, tetapi tidak ada
 * badan bernama Phonska; yang benar bukan menjawab nol melainkan menjawab produknya lalu
 * menyebutkan perusahaannya. */
export const KATA_JENIS = {
  pupuk: 'pupuk', npk: 'pupuk', urea: null, kompos: null,
  pestisida: 'pestisida', insektisida: 'pestisida', fungisida: 'pestisida',
  herbisida: 'pestisida', bakterisida: 'pestisida', akarisida: 'pestisida',
  nematisida: 'pestisida', rodentisida: 'pestisida', moluskisida: 'pestisida',
  racun: 'pestisida', pembasmi: 'pestisida',
  varietas: 'varietas', benih: 'varietas', bibit: 'varietas', kultivar: 'varietas',
  hama: 'opt', penyakit: 'opt', opt: 'opt', gulma: 'opt',
  harga: 'harga',
  sediaan: 'sediaan', resep: 'sediaan', ramuan: 'sediaan',
  perusahaan: 'principal', produsen: 'principal', pabrik: 'principal',
  pabrikan: 'principal', principal: 'principal',
  tanaman: 'komoditas', komoditas: 'komoditas',
  bahan: 'bahan', zat: 'bahan',
};
// `null` berarti kata itu sengaja TIDAK menyempitkan walau kelihatannya jenis: "urea" dan
// "kompos" nama barang yang benar-benar ada di indeks, dan menyaringnya jadi "pupuk" akan
// membuang entri sediaan buatan sendiri yang justru namanya itu.

/* Medan yang ditanyakan pertanyaannya. Keduanya dijawab dari hasil pencarian yang sudah
 * terambil — `k`/`pk` untuk pemegang, `f` untuk isinya — jadi menjawabnya tidak menambah
 * satu pengambilan pun, dan tidak menambah satu klaim pun di luar registri. */
export const KATA_ATRIBUT = {
  siapa: 'pemegang', perusahaan: 'pemegang', produsen: 'pemegang', pabrik: 'pemegang',
  pabrikan: 'pemegang', pembuat: 'pemegang', pemilik: 'pemegang', pemegang: 'pemegang',
  pendaftar: 'pemegang', pemulia: 'pemegang', pemelihara: 'pemegang', buatan: 'pemegang',
  produksi: 'pemegang', merek: 'pemegang',
  bahan: 'isi', zat: 'isi', kandungan: 'isi', komposisi: 'isi', isi: 'isi', aktif: 'isi',
  kadar: 'isi',
};

/* Kata yang meminta PERINGKAT atau PENILAIAN. Dikenali, dikeluarkan dari pencarian, lalu
 * disebutkan sebagai yang tidak dijawab.
 *
 * Ini bukan kekurangan yang menunggu ditambal dengan data yang lebih banyak. Registri
 * mencatat izin edar; ia tidak menguji apa pun dan tidak memeringkat apa pun — kalimat itu
 * sudah tertulis di meta.batas.sumber.pestisida.alasan sejak indeks pertama. Yang menjawab
 * "paling ampuh" karena itu bukan permukaan ini, dan diam soal itu lebih berbahaya daripada
 * mengaku: daftar yang muncul sesudah kata "terbaik" akan dibaca sebagai peringkat. */
export const KATA_NILAI = new Set([
  'cocok', 'sesuai', 'tepat', 'bagus', 'baik', 'terbaik', 'paling', 'unggul', 'ampuh',
  'manjur', 'mujarab', 'efektif', 'efisien', 'aman', 'berbahaya', 'bahaya', 'murah',
  'mahal', 'hemat', 'rekomendasi', 'direkomendasikan', 'saran', 'disarankan', 'anjuran',
  'dianjurkan', 'sebaiknya', 'wajib', 'harus', 'mantap', 'favorit', 'populer', 'laris',
  'terlaris', 'bermutu', 'berkualitas', 'kualitas', 'mutu', 'ideal', 'optimal',
]);

/* Kata yang menanyakan WAKTU. Ia tidak dicari dan tidak menyempitkan — ia menandai bahwa
 * pertanyaannya soal kalender, dan kalender adalah salah satu dari sedikit hal yang indeks
 * ini menyatakan sendiri tidak dimilikinya (meta.tidakAda.rencanaBukanKalender). Layar
 * merutekannya ke rencana musim SEKALIGUS menyebutkan batas itu; tanpa kalimat batasnya,
 * merutekan saja akan terbaca sebagai janji bahwa tanggalnya ada di sana. */
export const KATA_WAKTU = new Set([
  'kapan', 'waktu', 'musim', 'jadwal', 'tanggal', 'bulan', 'hari', 'kalender', 'penanggalan',
]);

/* Kata kerja budidaya. Sama seperti kata waktu: bukan nama apa pun, jadi mencarinya di
 * kepala pencarian hanya menarik merek yang kebetulan bernama mirip. Ia dipakai perutean
 * niat di beranda, yang membaca kalimat aslinya. */
export const KATA_TINDAKAN = new Set([
  'tanam', 'semai', 'tabur', 'semprot', 'panen', 'siram', 'pangkas', 'olah', 'bajak',
  'cangkul', 'sebar', 'rawat', 'kendalikan', 'basmi',
]);

/* Kata tanya yang menentukan BENTUK jawaban, bukan isinya. Disimpan supaya penyaji tahu ia
 * sedang menjawab pertanyaan — bukan sedang melengkapi nama yang setengah diketik. */
export const KATA_TANYA = new Set(['apa', 'apakah', 'siapa', 'kapan', 'berapa', 'mana',
  'kenapa', 'mengapa', 'bagaimana', 'gimana', 'adakah', 'dimana']);

// ---------------------------------------------------------------------------
// 3. Ketinggian — satu-satunya angka bersatuan yang diurai berkas ini
// ---------------------------------------------------------------------------
/* Kenapa cuma ketinggian, padahal orang juga mengetik "2 hektare" dan "16 liter": karena
 * ketinggian satu-satunya yang PUNYA ambang terbit untuk diadu. spec/vocab/agroklimat-*.json
 * menyatakan pada meter berapa sebuah tempat berpindah kelas, lengkap dengan terbitan yang
 * menjadi asalnya; luas dan volume tidak punya padanan seperti itu dan sudah punya layarnya
 * sendiri (kalibrasi, titik impas), yang dicapai lewat perutean niat.
 *
 * Angka Indonesia memakai titik sebagai pemisah ribuan: "1.200 mdpl" seribu dua ratus, bukan
 * satu koma dua. Titik karena itu dibuang, koma jadi titik desimal — kebalikan dari yang
 * dilakukan pengurai bawaan, dan salah membacanya di sini berarti menempatkan sebuah kebun
 * di kelas dataran yang keliru. */
const angkaId = (s) => {
  const n = Number(String(s).replace(/\./g, '').replace(/,/g, '.'));
  return Number.isFinite(n) ? n : null;
};

const PENANDA_TINGGI = /\b(dpl|mdpl|dpal|ketinggian|elevasi|tinggi|dataran|altitude)\b/;

export function uraiKetinggian(kueri) {
  const s = (kueri ?? '').toLowerCase();
  const bersatuan = s.match(/(\d[\d.,]*)\s*(?:m|meter)?\s*(?:mdpl|dpl|dpal)\b/)
    || s.match(/\b(?:ketinggian|elevasi|altitude)\s*(?:di\s*)?(\d[\d.,]*)\s*(?:m|meter)?\b/);
  if (bersatuan) {
    const m = angkaId(bersatuan[1]);
    // Batas atas bukan kerapian: puncak tertinggi Indonesia 4.884 m, jadi "5000 mdpl" hampir
    // pasti salah ketik dan menjawabnya dengan kelas zona akan menyahihkan salah ketik itu.
    if (m !== null && m >= 0 && m <= 5000) return { meter: m, teks: bersatuan[0].trim() };
  }
  // "500 m" telanjang baru dibaca sebagai ketinggian kalau kalimatnya memang menyebut
  // ketinggian di tempat lain. Tanpa syarat itu, "dosis 500 ml" dan "jarak 500 m" ikut
  // terbaca sebagai kebun di dataran menengah.
  const telanjang = s.match(/(\d[\d.,]*)\s*(?:m|meter)\b/);
  if (telanjang && PENANDA_TINGGI.test(s)) {
    const m = angkaId(telanjang[1]);
    if (m !== null && m >= 0 && m <= 5000) return { meter: m, teks: telanjang[0].trim() };
  }
  return null;
}

/* "dataran rendah" dan "dataran tinggi" adalah cara paling lazim orang menyebut ketinggian,
 * dan keduanya TIDAK berarti sebuah angka — ia menyebut kelasnya langsung. Dikembalikan
 * sebagai kode kelas, bukan diterjemahkan jadi meter: menerjemahkannya berarti memilih satu
 * titik di dalam rentang, dan rentang itulah yang dimaksud. */
export function uraiDataran(kueri) {
  const m = (kueri ?? '').toLowerCase().match(/\bdataran\s+(rendah|menengah|sedang|tinggi)\b/);
  if (!m) return null;
  return m[1] === 'sedang' ? 'menengah' : m[1];
}

// ---------------------------------------------------------------------------
// 4. Penguraian
// ---------------------------------------------------------------------------

/**
 * Menguraikan satu kueri jadi golongan katanya.
 *
 * Kueri satu kata tetap lewat sini dan hasilnya tetap satu istilah — jadi tidak ada perilaku
 * lama yang berubah untuk orang yang memang cuma mengetik satu nama.
 */
export function uraikan(kueri) {
  const bersih = rapiKata(kueri);
  const kata = bersih ? bersih.split(' ') : [];

  const istilah = [];
  const jenis = [];
  const atribut = [];
  const nilai = [];
  const waktu = [];
  const tindakan = [];
  const tanya = [];

  for (const mentah of kata) {
    const k = dasarkan(mentah);
    if (KATA_TANYA.has(k)) tanya.push(k);

    // Urutan pemeriksaan menentukan hasilnya, dan urutan ini disengaja. Kata penilaian
    // diperiksa PALING DULU supaya "baik" tidak pernah lolos jadi istilah pencarian; kata
    // atribut sebelum kata jenis supaya "perusahaan" jadi pertanyaan, bukan cuma saringan.
    if (KATA_NILAI.has(k)) { nilai.push(k); continue; }
    if (KATA_WAKTU.has(k)) { waktu.push(k); continue; }
    if (KATA_TINDAKAN.has(k)) { tindakan.push(k); continue; }

    let dipakai = false;
    if (KATA_ATRIBUT[k]) { atribut.push(KATA_ATRIBUT[k]); dipakai = true; }
    if (k in KATA_JENIS) {
      if (KATA_JENIS[k]) jenis.push(KATA_JENIS[k]);
      dipakai = true;
    }
    if (dipakai) continue;

    if (KATA_HENTI.has(k)) continue;
    // Angka telanjang tidak dicari: nomor pendaftaran tidak ada di kepala pencarian, dan
    // "500" akan mencocoki puluhan nama merek yang kebetulan memuatnya.
    if (/^\d+$/.test(k)) continue;
    // Dua huruf ke bawah tidak menyempitkan apa pun pada indeks berember dua huruf.
    if (k.length < 3) continue;
    istilah.push(k);
  }

  const ketinggian = uraiKetinggian(kueri);
  const dataran = uraiDataran(kueri);

  return {
    asli: (kueri ?? '').trim(),
    kata,
    istilah: [...new Set(istilah)],
    jenis: [...new Set(jenis)],
    atribut: [...new Set(atribut)],
    nilai: [...new Set(nilai)],
    waktu: [...new Set(waktu)],
    tindakan: [...new Set(tindakan)],
    tanya: [...new Set(tanya)],
    ketinggian,
    dataran,
    // Sebuah kueri diperlakukan sebagai PERTANYAAN kalau ia berkata lebih dari satu dan
    // membawa tanda tanya, kata tanya, kata penilaian, kata waktu, atau satuan. Bedanya
    // dipakai layar untuk memutuskan apakah ia perlu menjelaskan apa yang dibacanya:
    // menjelaskan penguraian atas satu kata tunggal cuma kebisingan.
    pertanyaan: kata.length > 1 && Boolean(
      /\?/.test(kueri ?? '') || tanya.length || nilai.length || waktu.length
      || ketinggian || dataran || atribut.length,
    ),
  };
}

// ---------------------------------------------------------------------------
// 5. Kelas agroklimat dari sebuah angka
// ---------------------------------------------------------------------------
/* Pemeriksa ambang yang sama persis dengan spec/tools/agroklimat.mjs — batas terbuka dan
 * tertutup dibedakan sungguh-sungguh, karena 700 m tepat harus jatuh ke satu kelas saja.
 * Disalin, tidak diimpor: berkas itu modul Node yang membaca berkas dari cakram, dan
 * permukaan ini tidak punya cakram. Yang menjaga keduanya tetap sama uji di
 * spec/tools/uji-tanya.mjs, yang menjalankan kedua penghitung atas ambang yang sama. */
const penuhi = (nilai, syarat) => {
  if (typeof nilai !== 'number' || Number.isNaN(nilai)) return false;
  if (syarat.ge !== undefined && !(nilai >= syarat.ge)) return false;
  if (syarat.gt !== undefined && !(nilai > syarat.gt)) return false;
  if (syarat.le !== undefined && !(nilai <= syarat.le)) return false;
  if (syarat.lt !== undefined && !(nilai < syarat.lt)) return false;
  return true;
};

/**
 * Kelas mana saja yang cocok dengan sebuah ketinggian, dari seluruh skema bersumbu
 * `elevation` yang berambang.
 *
 * Mengembalikan SATU BARIS PER SKEMA, bukan satu kelas terpilih. Dua skema ketinggian
 * memang menjawab pertanyaan yang berbeda dengan batas yang berbeda — 500 m "dataran
 * menengah" menurut konvensi hortikultura tetapi "zona panas" menurut Junghuhn — dan
 * memilih salah satunya diam-diam berarti menyembunyikan bahwa istilah yang dipakai orang
 * setiap hari punya dua arti yang sah.
 */
export function kelasKetinggian(skema, meter) {
  if (typeof meter !== 'number') return [];
  const out = [];
  for (const s of skema ?? []) {
    if (s.sumbu !== 'elevation' || s.putus !== 'threshold') continue;
    const cocok = (s.kelas ?? []).filter(
      (k) => Array.isArray(k.syarat) && k.syarat.length
        && k.syarat.every((c) => penuhi(meter, c)),
    );
    // Nol berarti angkanya di luar seluruh kelas; lebih dari satu berarti skemanya sendiri
    // bertindih. Keduanya kekeliruan, dan keduanya harus bisa dibedakan dari "cocok satu" —
    // jadi larik yang dikembalikan apa adanya, bukan dipaksa jadi satu.
    out.push({ skema: s, kelas: cocok });
  }
  return out;
}
