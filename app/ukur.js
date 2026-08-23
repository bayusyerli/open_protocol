/* Instrumentasi enam jalur — gate fase kedua.
 *
 * Gate-nya berbunyi "ukur repeat use dan waktu ke jawaban". Sebelum berkas ini
 * tidak ada satu pun yang mengukurnya, jadi gate itu tidak bisa dilewati bukan
 * karena hasilnya jelek melainkan karena tidak ada angkanya.
 *
 * EMPAT BATAS YANG MEMBENTUKNYA, dan tidak boleh dilanggar diam-diam:
 *
 * 1. Tanpa akun, tanpa identitas. Tidak ada pengenal pengunjung, tidak ada sidik
 *    peramban, tidak ada IP. Lapisan gratis menjanjikan tanpa akun dan janji itu
 *    bagian dari yang dijual. "Repeat use" diukur sebagai CACAH HARI BERBEDA satu
 *    peranti sampai ke jawaban — localStorage memang sudah per-peranti, jadi
 *    menambahkan pengenal tidak menambah apa pun kecuali risiko.
 *
 * 2. Tanpa jaringan. Berkas ini tidak pernah fetch, tidak pernah sendBeacon. Tidak
 *    ada server aplikasi di arsitektur ini, dan menambahkannya diam-diam demi
 *    telemetri akan mengubah sifat produknya. Pengumpulan saat pilot dilakukan
 *    lewat layar baca ukur.html, atas sepengetahuan yang memegang peranti.
 *
 * 3. Tidak boleh merusak jalurnya. Seluruh isi berkas ini dibungkus penjagaan:
 *    localStorage bisa mati di mode privat, bisa penuh, bisa ditolak kebijakan.
 *    Kalau pengukuran gagal, jalurnya tetap jalan. Yang diukur lebih tidak penting
 *    daripada yang diukur itu sendiri.
 *
 * 4. Bergulir dan berbatas. Peranti di lapangan sering dipakai bergantian dan
 *    ruangnya sempit; simpanan dipangkas ke 60 hari terakhir dan 50 contoh waktu
 *    per jalur.
 *
 * Definisi tiap angka ada di docs/11-instrumentasi.md. docs/00 bagian 5 mewajibkan
 * itu: setiap angka yang dipublikasikan harus punya definisi tertulis dan bisa
 * ditelusuri ke catatan mentah.
 */

const KUNCI = 'op.ukur.v1';
const HARI_DISIMPAN = 60;
const CONTOH_WAKTU = 50;

// Langit-langit waktu ke jawaban. performance.now() menghitung jam dinding sejak
// navigasi, termasuk saat halaman dibiarkan terbuka tanpa disentuh — dan dari dalam
// peramban, menganggur tidak bisa dibedakan dari lambat. Contoh di atas langit-langit
// ini TIDAK dibuang diam-diam: ia dihitung terpisah sebagai "ditinggal", supaya p50
// dan p90 menggambarkan tunggu yang sungguh dirasakan, dan supaya jumlah yang
// dikeluarkan tetap terlihat. Dua menit dipilih karena satu penelusuran utuh di
// sinyal buruk masih jauh di bawahnya.
const LANGIT_WAKTU = 120_000;

// Jenis akhir sebuah penelusuran. "nol" dan "tak-sanggup" BUKAN kegagalan — pada
// jalur-jalur ini keduanya jawaban yang benar, dan justru yang paling menentukan.
// Memukul-ratakan ketiganya jadi "berhasil" akan menyembunyikan sinyal lubang data.
export const JENIS = {
  isi: 'isi',                  // jawaban berisi
  nol: 'nol',                  // cabang sengaja nol, mis. "jangan beli apa pun untuk ini"
  takSanggup: 'tak-sanggup',   // datanya tidak sanggup menjawab, dan layar mengatakannya
  gagal: 'gagal',              // pengambilan gagal — sinyal putus, bukan keputusan layar
};

/* B4 — antrean pertanyaan tak terjawab.
 *
 * Tiap "tidak sanggup" yang ditampilkan hari ini menghilang begitu layar ditutup.
 * Dicatat, ia jadi peta permintaan data: lubang mana yang benar-benar ditabrak orang,
 * bukan lubang mana yang menurut kami penting.
 *
 * YANG DICATAT CACAHNYA SAJA, TIDAK PERNAH KATANYA. docs/11 bagian 3 sudah menyatakan
 * isi pencarian sengaja tidak diukur, dengan alasan yang tidak berubah karena B4 datang:
 * jejak minat bisa mengenali orang di desa kecil. Yang dicatat di sini nomor lubang yang
 * tertabrak — dan lubang-lubang itu sudah bernama dan sudah tercetak di layar lewat
 * meta.tidakAda, jadi mencacahnya tidak menambah satu keterangan pun tentang orangnya.
 *
 * Pertanyaan yang dijawab: "registri mana yang layak ditarik berikutnya" — persis yang
 * diminta docs/15. Itu pertanyaan kategori, dan kategori tidak butuh teks kueri.
 */
export const LUBANG = {
  namaDagang: 'namaDagang',                     // nama dicari, tidak ada padanannya di registri
  gejalaOpt: 'gejalaOpt',                       // gejala dicari, di luar sepuluh yang terkurasi
  namaLokalTakTerpetakan: 'namaLokalTakTerpetakan', // nama lokal dikenal, rujukannya belum ada
  kandunganTakTerdaftar: 'kandunganTakTerdaftar',   // kandungan diperiksa, tidak ada yang cocok
  haraSediaan: 'haraSediaan',                   // pupuk tanpa komposisi, hara tak terhitung
  takaranRumahTangga: 'takaranRumahTangga',     // menakar tanpa alat terukur
};
// Daftar ini WAJIB berisi tepat yang dipanggil di layar, tidak lebih dan tidak kurang.
// Kunci yang tidak ada di sini ditolak diam-diam oleh catatLubang() — dan lubang yang
// gagal dicatat tanpa suara adalah kebalikan dari gunanya B4.


const hariIni = () => new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD waktu lokal

function baca() {
  try {
    const m = JSON.parse(localStorage.getItem(KUNCI) ?? '{}');
    return m && m.v === 1 ? { lubang: {}, ...m } : { v: 1, hari: {}, ms: {}, lubang: {} };
  } catch {
    return { v: 1, hari: {}, ms: {}, lubang: {} };
  }
}

function tulis(m) {
  try {
    const batas = new Date(Date.now() - HARI_DISIMPAN * 864e5).toLocaleDateString('sv-SE');
    for (const t of Object.keys(m.hari)) if (t < batas) delete m.hari[t];
    localStorage.setItem(KUNCI, JSON.stringify(m));
  } catch {
    // Penuh, mode privat, atau ditolak kebijakan. Diam adalah perilaku yang benar:
    // batas 3 di kepala berkas ini lebih penting daripada satu catatan yang hilang.
  }
}

/** Jalur dibuka. Dipanggil sekali per pemuatan halaman. */
export function catatBuka(jalur) {
  const m = baca();
  const t = (m.hari[hariIni()] ??= {});
  const j = (t[jalur] ??= {});
  j.buka = (j.buka ?? 0) + 1;
  tulis(m);
}

/**
 * Layar jawaban sampai. Dipanggil sekali per penelusuran, di titik jawaban benar-benar
 * terbaca — bukan saat pengambilan datanya mulai.
 *
 * Waktu ke jawaban diukur dari performance.now(), yang berpatokan pada awal navigasi,
 * jadi ia menghitung SEJAK HALAMAN DIBUKA sampai jawaban terbaca. Bukan sejak ketukan
 * pertama: yang dirasakan orang di lapangan adalah tunggu totalnya, termasuk memuat
 * indeks di sinyal yang buruk, dan mengukur dari ketukan akan menyembunyikan persis
 * bagian yang paling lambat.
 */
export function catatJawab(jalur, jenis = JENIS.isi) {
  const m = baca();
  const t = (m.hari[hariIni()] ??= {});
  const j = (t[jalur] ??= {});
  j[jenis] = (j[jenis] ?? 0) + 1;

  if (jenis !== JENIS.gagal) {
    const ms = Math.round(performance.now());
    if (ms > LANGIT_WAKTU) {
      j.ditinggal = (j.ditinggal ?? 0) + 1;
    } else {
      const d = (m.ms[jalur] ??= []);
      d.push(ms);
      if (d.length > CONTOH_WAKTU) d.splice(0, d.length - CONTOH_WAKTU);
    }
  }
  tulis(m);
}

/**
 * B4 — satu lubang data tertabrak. `kunci` wajib salah satu dari LUBANG; `sumber` nama
 * layarnya, bukan nomor jalur, supaya beranda bisa ikut mencatat tanpa diberi nomor
 * karangan — ia bukan jalur, dan tabel di docs/11 tidak berubah karenanya.
 *
 * Tidak menerima teks kueri, dan tidak boleh ditambahi belakangan tanpa mengubah
 * docs/11 bagian 3 lebih dulu. Tanda tangannya sengaja tidak menyediakan tempatnya.
 */
export function catatLubang(sumber, kunci) {
  if (!LUBANG[kunci]) return;
  const m = baca();
  const l = (m.lubang[kunci] ??= { n: 0, dari: {}, akhir: null });
  l.n += 1;
  l.dari[sumber] = (l.dari[sumber] ?? 0) + 1;
  l.akhir = hariIni();
  tulis(m);
}

// ---------------------------------------------------------------------------
// Pembacaan — dipakai ukur.html
// ---------------------------------------------------------------------------

const p50 = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : null);
const p90 = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * 0.9))] : null);

/**
 * Ringkasan siap baca. Seluruhnya turunan dari catatan mentah di localStorage —
 * tidak ada angka di sini yang tidak bisa ditelusuri balik ke sana.
 */
export function ringkas() {
  const m = baca();
  const tanggal = Object.keys(m.hari).sort();
  const perJalur = {};

  for (const t of tanggal) {
    for (const [jalur, c] of Object.entries(m.hari[t])) {
      const r = (perJalur[jalur] ??= { buka: 0, isi: 0, nol: 0, takSanggup: 0, gagal: 0, ditinggal: 0, hari: 0, hariMenjawab: 0 });
      r.buka += c.buka ?? 0;
      r.isi += c[JENIS.isi] ?? 0;
      r.nol += c[JENIS.nol] ?? 0;
      r.takSanggup += c[JENIS.takSanggup] ?? 0;
      r.gagal += c[JENIS.gagal] ?? 0;
      r.ditinggal += c.ditinggal ?? 0;
      r.hari += 1;
      if ((c[JENIS.isi] ?? 0) + (c[JENIS.nol] ?? 0) + (c[JENIS.takSanggup] ?? 0) > 0) r.hariMenjawab += 1;
    }
  }

  for (const [jalur, r] of Object.entries(perJalur)) {
    const ms = m.ms[jalur] ?? [];
    r.jawab = r.isi + r.nol + r.takSanggup;
    r.waktuP50 = p50(ms);
    r.waktuP90 = p90(ms);
    r.contohWaktu = ms.length;
    // Berulang bila peranti ini sampai ke jawaban pada DUA HARI BERBEDA atau lebih.
    r.berulang = r.hariMenjawab >= 2;
  }

  const hariMenjawabSemua = new Set(
    tanggal.filter((t) => Object.values(m.hari[t]).some(
      (c) => (c[JENIS.isi] ?? 0) + (c[JENIS.nol] ?? 0) + (c[JENIS.takSanggup] ?? 0) > 0)),
  );

  // Terurut menurut seberapa sering ditabrak, bukan menurut seberapa penting menurut
  // kami. Itu seluruh gunanya: yang paling sering menabrak yang paling layak ditarik.
  const antrean = Object.entries(m.lubang ?? {})
    .map(([kunci, l]) => ({ kunci, n: l.n, akhir: l.akhir, dari: l.dari ?? {} }))
    .sort((a, b) => b.n - a.n || a.kunci.localeCompare(b.kunci));

  return {
    antrean,
    sejak: tanggal[0] ?? null,
    sampai: tanggal.at(-1) ?? null,
    hariTercatat: tanggal.length,
    hariMenjawab: hariMenjawabSemua.size,
    berulang: hariMenjawabSemua.size >= 2,
    perJalur,
    mentah: m,
  };
}

/** Hapus seluruh catatan peranti ini. Disediakan supaya yang memegang peranti bisa. */
export function hapus() {
  try { localStorage.removeItem(KUNCI); } catch { /* sama seperti tulis() */ }
}
