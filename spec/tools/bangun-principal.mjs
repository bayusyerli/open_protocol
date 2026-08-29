// Menyusun kosakata `principal` — satu rekaman per badan yang memegang pendaftaran.
//
//   node spec/tools/bangun-principal.mjs            # periksa saja, laporkan sebarannya
//   node spec/tools/bangun-principal.mjs --tulis    # tulis spec/vocab/principal/
//
// KENAPA SATU ENTITAS PER BADAN, BUKAN SATU PER REGISTRI
// Pupuk, pestisida, dan varietas datang dari dua registri yang berbeda dan tidak saling
// mengenal. Tetapi 19 perusahaan memegang pendaftaran di keduanya — Petrokimia Gresik,
// Syngenta, Bayer, Kenso, dan seterusnya. Menyimpannya sebagai dua rekaman akan membelah
// daftar produknya jadi dua halaman yang masing-masing tampak setengah benar, dan
// pertanyaan "perusahaan ini menjual apa saja" jadi tidak bisa dijawab dari mana pun.
//
// TIGA SUMBER, DAN HANYA DUA DI ANTARANYA BERTINGKAT B
//   pukpes_data/principal_kanonik.csv    2.304 ejaan -> 1.949 badan. Turunan registri.
//   proseed_data/pemohon_varietas.csv    1.259 pemohon varietas. Turunan registri.
//   data/pengaya-principal.csv           101 baris. RISET AGEN, bukan sumber primer.
//   data/principals-benih.csv            102 baris. RISET AGEN, bukan sumber primer.
//
// Dua yang pertama masuk ke `holdings` dan `registry_names`; keduanya bisa dihitung ulang
// dari registri dan karena itu bertingkat B. Dua yang terakhir masuk ke blok `profile`
// yang TERPISAH, bertingkat D, dan membawa alasannya sendiri. Kalau keduanya dituang ke
// satu kartu, grup induk hasil tebakan agen akan tampil sesetara cacah pendaftaran yang
// bisa diverifikasi — dan itu persis kekeliruan yang B1 pada docs/15 dibangun untuk cegah.
//
// PERORANGAN SENGAJA TIDAK MASUK
// 281 dari 1.259 pemohon varietas berjenis `perorangan/lainnya`: pemulia yang mendaftarkan
// atas nama sendiri, sebagian berupa daftar lima-enam nama orang dalam satu medan. Membuat
// halaman profil untuk orang bernama berarti menyusun berkas data pribadi dari sumber
// publik, tanpa dasar pemrosesan apa pun. Namanya tetap tampil di kartu varietas apa
// adanya — yang tidak dibuat hanyalah halaman profil dan tautannya.
//
// ID TIDAK PERNAH DIDAUR ULANG
// Penomoran urut menurut abjad akan menggeser seluruh ID begitu satu badan baru masuk.
// Karena itu berkas yang sudah ada dibaca lebih dulu: `key` yang sudah bernomor
// mempertahankan nomornya, dan yang baru mengambil nomor bebas berikutnya. Menjalankan
// ulang pada sumber yang sama menghasilkan berkas yang sama persis.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tulis = process.argv.includes('--tulis');
const KELUAR = join(akar, 'spec', 'vocab', 'principal');
const NDJSON = join(KELUAR, 'principal.ndjson');
const META = join(KELUAR, 'principal.meta.json');

const BLOK = { from: 1000, to: 9999 };

// ---------------------------------------------------------------------------
// Pembaca CSV — cukup untuk berkas yang ada, tidak berpura-pura umum
// ---------------------------------------------------------------------------
function bacaCsv(jalan) {
  const teks = readFileSync(join(akar, jalan), 'utf8').replace(/^﻿/, '');
  const baris = [];
  let medan = [], kini = '', kutip = false;
  for (let i = 0; i < teks.length; i++) {
    const c = teks[i];
    if (kutip) {
      if (c === '"' && teks[i + 1] === '"') { kini += '"'; i++; }
      else if (c === '"') kutip = false;
      else kini += c;
    } else if (c === '"') kutip = true;
    else if (c === ',') { medan.push(kini); kini = ''; }
    else if (c === '\n') { medan.push(kini); baris.push(medan); medan = []; kini = ''; }
    else if (c !== '\r') kini += c;
  }
  if (kini || medan.length) { medan.push(kini); baris.push(medan); }
  const kepala = baris.shift();
  return baris.filter((b) => b.some((x) => x.trim()))
    .map((b) => Object.fromEntries(kepala.map((h, i) => [h.trim(), (b[i] ?? '').trim()])));
}

const bacaNdjson = (jalan) =>
  readFileSync(join(akar, jalan), 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));

// Ejaan registri memuat spasi ganda dan titik yang tidak konsisten. Penyamaan hanya untuk
// MENCOCOKKAN; nama aslinya tidak pernah ditimpa (konvensi paralel bagian 4).
const samakan = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
const kunciBanding = (s) =>
  samakan(s).toUpperCase().replace(/\bPT\.?\b/g, 'PT').replace(/\bCV\.?\b/g, 'CV')
    .replace(/\bUD\.?\b/g, 'UD').replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// Pemotongan ke 80 karakter dilakukan SEBELUM tanda hubung ekor dibuang. Urutan
// sebaliknya menghasilkan `...-mutu-` yang ditolak pola `key` di common.schema.json.
const slug = (s) =>
  samakan(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-')
    .slice(0, 80).replace(/^-+|-+$/g, '');

// ---------------------------------------------------------------------------
// 1. Registri: siapa memegang apa
// ---------------------------------------------------------------------------
const produk = [
  ...bacaNdjson('spec/vocab/product/pestisida.ndjson').map((p) => ({ ...p, sisi: 'pesticide' })),
  ...bacaNdjson('spec/vocab/product/pupuk.ndjson').map((p) => ({ ...p, sisi: 'fertilizer' })),
];
const varietas = bacaNdjson('spec/vocab/variety/varietas.ndjson');

// nama mentah -> nama kanonik, dari kedua berkas alias
const kanonPukpes = new Map();
for (const r of bacaCsv('pukpes_data/principal_kanonik.csv'))
  kanonPukpes.set(kunciBanding(r.nama_asli), samakan(r.nama_kanonik));

const kanonBenih = new Map();
for (const r of bacaCsv('proseed_data/pemohon_alias.csv'))
  kanonBenih.set(kunciBanding(r.pemohon_asli), samakan(r.nama_kanonik));

// Jenis badan hanya tercatat di sisi benih. Sisi pupuk/pestisida diturunkan dari prefiks
// namanya sendiri — itu satu-satunya keterangan yang benar-benar ada di registri.
const badanBenih = new Map();
const rincianBenih = new Map();
for (const r of bacaCsv('proseed_data/pemohon_varietas.csv')) {
  const k = kunciBanding(kanonBenih.get(kunciBanding(r.pemohon)) ?? r.pemohon);
  badanBenih.set(k, r.jenis_badan);
  const lama = rincianBenih.get(k);
  const tahun = (x) => (Number.isInteger(x) && x > 1800 && x < 2200 ? x : null);
  const baru = {
    first_year: tahun(Number(r.tahun_pertama)),
    last_year: tahun(Number(r.tahun_terakhir)),
    main_commodity: r.komoditas_utama || null,
    commodities: (r.komoditas_semua || '').split(';').map((x) => x.trim()).filter(Boolean),
    top_permit_kind: r.jenis_perizinan_terbanyak || null,
  };
  // Satu badan bisa muncul beberapa baris lewat ejaan berbeda; rentang tahunnya digabung.
  // Medan yang tetap kosong DIBUANG, bukan ditulis null: skema menuntut bilangan, dan
  // `null` di sana berarti "tahunnya nol" — pernyataan yang tidak sama dengan "tak tercatat".
  const gabung = lama ? {
    first_year: tahun(Math.min(lama.first_year ?? Infinity, baru.first_year ?? Infinity)),
    last_year: tahun(Math.max(lama.last_year ?? -Infinity, baru.last_year ?? -Infinity)),
    main_commodity: lama.main_commodity ?? baru.main_commodity,
    commodities: [...new Set([...lama.commodities, ...baru.commodities])],
    top_permit_kind: lama.top_permit_kind ?? baru.top_permit_kind,
  } : baru;
  rincianBenih.set(k, gabung);
}

const PERORANGAN = 'perorangan/lainnya';

// ---------------------------------------------------------------------------
// Orang atau badan — dan kenapa raguan dijawab "orang"
// ---------------------------------------------------------------------------
// `jenis_badan` di pemohon_varietas.csv TIDAK bisa dipakai sendirian. Embernya bernama
// `perorangan/lainnya`, dan kata "lainnya" itu memuat BRIN, LIPI, BATAN, IPB, Syngenta
// Crop Protection AG, Pacific Seeds (Thai) Ltd, PT BISI International Tbk, dan Taman Buah
// Mekarsari — berdampingan dengan Prof. Dr. Ir. Setyo Budi, MS dan Iwan Linuhung. 281 baris
// dalam satu ember, dan keduanya benar-benar tercampur.
//
// Membuang seluruh ember berarti membuang puluhan lembaga sungguhan beserta tautan profil
// dari kartu varietasnya. Menerima seluruh ember berarti membuat halaman profil bernama
// untuk pemulia perorangan — menyusun berkas data pribadi dari sumber publik, tanpa dasar
// pemrosesan apa pun menurut UU 27/2022, dan bertentangan dengan kalimat pembuka
// actor.schema.json.
//
// Karena itu keputusannya diambil dari BENTUK NAMANYA, dan raguan dijatuhkan ke sisi yang
// aman: yang tidak terbukti badan diperlakukan sebagai orang, sehingga ia tidak dapat
// halaman profil. Lembaga yang keliru terlewat kehilangan satu fitur; orang yang keliru
// masuk kehilangan privasinya. Kedua galat itu tidak sepadan, jadi ambangnya tidak di tengah.
const GELAR = /(^|[\s.,(])(prof|dr|ir|drs|dra|hj|s\.?p|s\.?si|s\.?t|m\.?s|m\.?p|m\.?si|m\.?sc|m\.?agr|ph\.?d|apt|mm)([\s.,)]|$)/i;

const BADAN_HUKUM = /\b(pt|cv|ud|koperasi|kud|perum|persero|tbk|ltd|inc|corp\w*|co|ag|nv|bv|gmbh|pte|sdn|bhd|llc|plc|ltda)\b/i;

// Registri menuliskan sebagian bentuk badan dengan titik di dalamnya — "Better3fruit N.V",
// "Kaneko Seed.Co.Ltd" — sehingga `\bnv\b` tidak pernah berbunyi. Dan pada belasan baris
// prefiksnya menempel ke nama: "PTAgri Makmur Pertiwi". Keduanya diratakan sebelum diuji.
// Dua rataan, bukan satu: titik jadi spasi menangkap "Prof.Dr.Ir.H.M. Nurdin", sedangkan
// titik dibuang menangkap "N.V" dan "Co.Ltd" yang justru hancur kalau diberi spasi.
const rataBadan = (n) => [
  n.replace(/\./g, ' ').replace(/^(PT|CV|UD)(?=[A-Z])/i, '$1 ').replace(/\s+/g, ' ').trim(),
  n.replace(/\./g, '').replace(/^(PT|CV|UD)(?=[A-Z])/i, '$1 ').replace(/\s+/g, ' ').trim(),
];

// Kata yang menyebut sebuah lembaga atau kegiatan, bukan seseorang.
//
// Yang SENGAJA TIDAK ADA di sini: `sari`, `jaya`, `makmur`, `putra`, `indah`. Ketiganya
// memang lazim pada nama dagang — dan sama lazimnya sebagai nama orang Indonesia. Memasukkan
// `sari` akan membuat "Sari Wahyuni" dinilai badan lalu diberi halaman profil bernama, dan
// itu justru galat yang paling mahal di antara dua arah galat yang mungkin.
const LEMBAGA = new RegExp([
  'balai', 'balit\\w*', 'bb', 'bptp', 'bpsb\\w*', 'bbpptp', 'pptk', 'bptk', 'ppks', 'bsip', 'bisip', 'brin', 'batan', 'lipi',
  'patir', 'pair', 'p3gi', 'pkbt', 'bpatp', 'perhutani', 'puslit\\w*', 'litbang',
  'ipb', 'ugm', 'itb', 'upn', 'unpad', 'unibraw', 'unsoed', 'undip', 'unhas', 'unand',
  'universitas', 'university', 'fakultas', 'faculty', 'institut\\w*', 'politeknik',
  'sekolah\\s+tinggi', 'akademi', 'pusat', 'centre', 'center', 'departemen', 'department',
  'dinas', 'instansi', 'pemerintah', 'pemda', 'pemkab', 'pemprov', 'prefecture',
  'prov', 'kab', 'kota', 'provinsi', 'kabupaten',
  'kementerian', 'ministry', 'lembaga', 'badan', 'agency', 'yayasan', 'foundation',
  'persyarikatan', 'muhammadiyah', 'taman', 'kebun', 'estate', 'plantation',
  'kelompok\\s+tani', 'poktan', 'gapoktan', 'uptd', 'upt', 'ptpn', 'perkebunan',
  'seed', 'seeds', 'agro\\w*', 'agri\\w*', 'benih', 'crop', 'chemical', 'kimia',
  'indonesia', 'international', 'internasional', 'overseas', 'nusantara', 'creative',
  'research', 'teknologi', 'technolog\\w*', 'industr\\w*', 'pioneer',
].map((w) => `\\b${w}\\b`).join('|'), 'i');

/**
 * true kalau namanya lebih mirip orang daripada badan. Raguan dijawab true.
 *
 * Urutannya menentukan: penanda badan diperiksa lebih dulu karena ia positif —
 * "Hokuto Corporation" memuat kata yang hanya dipakai badan. Gelar diperiksa sesudahnya
 * karena ia positif ke arah sebaliknya. Yang tersisa diputus dari panjang dan kapitalisasi,
 * dan di situlah raguan dijatuhkan ke "orang".
 */
function tampakOrang(nama) {
  const n = samakan(nama);
  if (!n) return true;
  // Penampung registri, bukan nama siapa pun. Tidak dibuatkan entitas apa pun.
  if (/^n\/a\b/i.test(n)) return true;
  const r = rataBadan(n);
  if (r.some((x) => BADAN_HUKUM.test(x))) return false;
  if (r.some((x) => LEMBAGA.test(x))) return false;
  // Gelar akademik atau keprofesian hanya melekat pada orang.
  if (GELAR.test(n)) return true;
  // Beberapa nama yang dirangkai "A, B, dan C" — daftar pemulia, bukan satu badan.
  if (/\bdan\b/i.test(n) && n.split(',').length > 1) return true;
  // HURUF BESAR SEMUA berkata TIGA atau lebih adalah nama dagang. Ambangnya tiga, bukan dua:
  // "CHANDRA ARIANDRI" dua kata dan itu nama orang, sedangkan "GEMA INOVASI AGRI" tiga.
  if (n === n.toUpperCase() && n.split(/\s+/).length >= 3 && /[A-Z]{3}/.test(n)) return false;
  // Sisanya: satu sampai tiga kata tanpa satu pun penanda badan.
  return n.split(/\s+/).length <= 3;
}

function bentukBadan(nama, dariBenih) {
  if (dariBenih && dariBenih !== PERORANGAN) return dariBenih;
  const n = samakan(nama).toUpperCase();
  if (/^PT\b|^PT\./.test(n)) return 'PT';
  if (/^CV\b|^CV\./.test(n)) return 'CV';
  if (/^UD\b|^UD\./.test(n)) return 'UD';
  if (/^KOPERASI|^KUD\b/.test(n)) return 'Koperasi';
  if (/BALAI|DINAS|PEMERINTAH|KEMENTERIAN|PUSAT PENELITIAN|BADAN /.test(n)) return 'Pemerintah';
  if (/UNIVERSITAS|INSTITUT|POLITEKNIK|SEKOLAH TINGGI|FAKULTAS|\bIPB\b|\bUGM\b/.test(n)) return 'Perguruan tinggi';
  if (/^(LIPI|BRIN|BATAN)\b|LEMBAGA|BALITBANG|\bBRIN\b/.test(n)) return 'Lembaga riset';
  if (/\b(LTD|INC|AG|NV|BV|GMBH|PTE|SDN|BHD|LLC|PLC)\b/.test(n)) return 'Asing';
  return 'tidak_diketahui';
}

// ---------------------------------------------------------------------------
// 2. Kumpulkan per badan
// ---------------------------------------------------------------------------
const badan = new Map(); // kunciBanding(kanonik) -> rekaman kerja

function ambilBadan(namaKanonik, namaMentah) {
  const k = kunciBanding(namaKanonik);
  if (!badan.has(k)) {
    badan.set(k, {
      kunci: k,
      nama: samakan(namaKanonik),
      registry_names: new Set(),
      holdings: { pesticide: 0, fertilizer: 0, seed: 0 },
      produk: [],
      varietas: [],
    });
  }
  const b = badan.get(k);
  if (namaMentah) b.registry_names.add(samakan(namaMentah));
  return b;
}

let produkTanpaPemegang = 0;
for (const p of produk) {
  const mentah = p.manufacturer;
  if (!mentah || !samakan(mentah)) { produkTanpaPemegang++; continue; }
  const kanonik = kanonPukpes.get(kunciBanding(mentah)) ?? samakan(mentah);
  const b = ambilBadan(kanonik, mentah);
  b.holdings[p.sisi]++;
  b.produk.push({ id: p.id, sisi: p.sisi });
}

let varietasPerorangan = 0;
let varietasTanpaPemelihara = 0;
for (const v of varietas) {
  const mentah = v.maintainer;
  if (!mentah || !samakan(mentah)) { varietasTanpaPemelihara++; continue; }
  const kanonik = kanonBenih.get(kunciBanding(mentah)) ?? samakan(mentah);
  const jenis = badanBenih.get(kunciBanding(kanonik));
  // Perorangan tidak jadi entitas. Namanya tetap ada di rekaman varietasnya sendiri —
  // yang tidak dibuat hanyalah halaman profil dan tautannya.
  // `jenis_badan` dipercaya hanya kalau ia MENYEBUT sebuah badan; embernya yang bernama
  // `perorangan/lainnya` diputuskan ulang dari bentuk namanya (lihat tampakOrang).
  if ((!jenis || jenis === PERORANGAN) && tampakOrang(kanonik)) {
    varietasPerorangan++;
    continue;
  }
  const b = ambilBadan(kanonik, mentah);
  b.holdings.seed++;
  b.varietas.push(v.id);
}

// ---------------------------------------------------------------------------
// 3. Pengaya riset — blok terpisah, tingkat D
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Penampung yang menyamar jadi nilai
// ---------------------------------------------------------------------------
// Kedua CSV riset memakai kalimat sebagai penampung kekosongan: "⚠️ belum terverifikasi",
// "belum terverifikasi", "⚠️ tidak dapat diverifikasi", "tidak ada induk yang disebutkan".
// Kalau ikut apa adanya, halaman profil menuliskan "Grup induk: ⚠️ belum terverifikasi"
// seolah itu jawabannya — padahal artinya justru TIDAK ADA jawaban, dan medan yang tidak
// ditulis sama sekali menyampaikan hal itu jauh lebih jujur.
//
// Yang TIDAK dibuang: nilai yang memuat isi beserta keraguannya. "Tiongkok (belum
// terverifikasi)" menyebut sebuah negara; membuangnya berarti membuang keterangan yang ada
// hanya karena periset jujur soal keyakinannya. Karena itu yang diuji SELURUH nilainya,
// bukan apakah ia mengandung kata "belum".
const PENAMPUNG = new Set([
  'belum terverifikasi', 'belum diverifikasi', 'belum-diverifikasi',
  'tidak dapat diverifikasi', 'tidak diketahui', 'tidak ada',
  'tidak ada induk yang disebutkan', 'merek belum terverifikasi', 'n/a', '-', '—',
]);
const bukanNilai = (x) => {
  const t = samakan(x).replace(/^[⚠️!\s]+/u, '').toLowerCase().replace(/\.$/, '');
  return !t || PENAMPUNG.has(t);
};
/** Nilai bersih, atau null. Emoji peringatan di depan ikut dibuang dari yang lolos. */
const nilai = (x) => (bukanNilai(x) ? null : samakan(x).replace(/^[⚠️!\s]+/u, ''));
const merekPayung = (x) =>
  (nilai(x) ?? '').split(',').map((m) => nilai(m)).filter(Boolean);

const ALASAN_D = 'Pengalaman tunggal belum terverifikasi: baris ini datang dari laporan agen riset web 19 Agustus 2026, bukan dari registri. data/README.md menyatakan sendiri bahwa tiap baris perlu diverifikasi ulang ke sumber aslinya, dan bahwa klaim kepemilikan merek berubah seiring waktu — registri 2014 mencatat Roundup di Monagro Kimia, hari ini dipasarkan Nufarm. Bukan C, karena C berarti konsensus praktisi dan tidak seorang praktisi pun dimintai pendapat.';

// Kolom `keyakinan` di kedua CSV adalah teks bebas, dan itu bukan kelalaian: ia menyimpan
// keyakinan PER MEDAN — "tinggi (merek) / sedang (badan hukum)" berarti mereknya bisa
// dipegang sedangkan bentuk badannya belum. Meratakannya jadi satu kata membuang persis
// pembedaan itu. Jadi keduanya dibawa: `confidence` yang bisa diperiksa mesin diambil dari
// kata pertama, dan kalimat aslinya disimpan utuh di `confidence_note`.
const KEYAKINAN = ['tinggi', 'sedang', 'rendah', 'belum-diverifikasi'];
function keyakinan(mentah) {
  const t = (mentah ?? '').trim();
  if (!t) return {};
  const pertama = t.toLowerCase().split(/[^a-z-]+/).find((w) => KEYAKINAN.includes(w));
  return {
    ...(pertama ? { confidence: pertama } : {}),
    ...(t.toLowerCase() !== pertama ? { confidence_note: t } : {}),
  };
}

const pengaya = new Map();
for (const r of bacaCsv('data/pengaya-principal.csv')) {
  const k = kunciBanding(kanonPukpes.get(kunciBanding(r.nama_di_registri)) ?? r.nama_di_registri);
  pengaya.set(k, {
    evidence_tier: 'D',
    tier_reason: ALASAN_D,
    ...keyakinan(r.keyakinan),
    ...(nilai(r.grup_induk) ? { parent_group: nilai(r.grup_induk) } : {}),
    ...(nilai(r.asal) ? { origin: nilai(r.asal) } : {}),
    ...(nilai(r.status_aktivitas) ? { activity_status: nilai(r.status_aktivitas) } : {}),
    ...(nilai(r.situs) ? { website: nilai(r.situs) } : {}),
    ...(merekPayung(r.merek_utama).length ? { umbrella_brands: merekPayung(r.merek_utama) } : {}),
    ...(nilai(r.sumber) ? { source: nilai(r.sumber) } : {}),
    source_kind: r.sumber_jenis || 'laporan-agen-riset',
    ...(r.diperbarui ? { updated: r.diperbarui } : {}),
  });
}

for (const r of bacaCsv('data/principals-benih.csv')) {
  const nama = r.nama_di_registri_varietas || r.badan_hukum_id || r.nama;
  const k = kunciBanding(kanonBenih.get(kunciBanding(nama)) ?? nama);
  if (!k || pengaya.has(k)) continue;
  pengaya.set(k, {
    evidence_tier: 'D',
    tier_reason: ALASAN_D,
    ...keyakinan(r.keyakinan),
    ...(nilai(r.grup_induk) ? { parent_group: nilai(r.grup_induk) } : {}),
    ...(nilai(r.asal) ? { origin: nilai(r.asal) } : {}),
    ...(nilai(r.status_aktivitas) ? { activity_status: nilai(r.status_aktivitas) } : {}),
    ...(nilai(r.situs) ? { website: nilai(r.situs) } : {}),
    ...(merekPayung(r.merek_utama).length ? { umbrella_brands: merekPayung(r.merek_utama) } : {}),
    ...(nilai(r.sumber) ? { source: nilai(r.sumber) } : {}),
    source_kind: r.sumber_jenis || 'laporan-agen-riset',
    ...(r.diperbarui ? { updated: r.diperbarui } : {}),
  });
}

// ---------------------------------------------------------------------------
// 4. Nomor ID — yang lama dipertahankan, yang baru mengambil nomor bebas
// ---------------------------------------------------------------------------
const idLama = new Map();
if (existsSync(NDJSON)) {
  for (const r of bacaNdjson('spec/vocab/principal/principal.ndjson')) idLama.set(r.key, r.id);
}

const daftar = [...badan.values()].sort((a, b) => a.nama.localeCompare(b.nama, 'id'));

// `key` unik di dalam jenis entitas. Bentrok diselesaikan dengan akhiran angka, bukan
// dengan menggabungkan dua badan yang kebetulan berslug sama.
const terpakaiKey = new Set();
for (const b of daftar) {
  let k = slug(b.nama) || `principal-${slug(b.kunci)}`;
  let n = 2;
  while (terpakaiKey.has(k)) k = `${slug(b.nama)}-${n++}`;
  terpakaiKey.add(k);
  b.key = k;
}

const terpakaiNomor = new Set([...idLama.values()].map((id) => Number(id.split(':')[2])));
let berikut = BLOK.from;
const nomorBaru = () => {
  while (terpakaiNomor.has(berikut)) berikut++;
  if (berikut > BLOK.to) throw new Error(`Blok pcp ${BLOK.from}–${BLOK.to} habis. Klaim blok baru di spec/00-konvensi-kerja-paralel.md.`);
  terpakaiNomor.add(berikut);
  return berikut;
};

// Medan bernilai null atau larik kosong dibuang, bukan ditulis. Skema menolak null pada
// medan bertipe, dan lebih penting: "tidak tercatat" dan "bernilai nol" adalah dua
// pernyataan berbeda — yang kedua mengaku tahu sesuatu yang tidak diketahui.
const bersih = (o) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined && !(Array.isArray(v) && !v.length)));

const items = daftar.map((b) => {
  const id = idLama.get(b.key) ?? `op:pcp:${String(nomorBaru()).padStart(8, '0')}`;
  const sectors = ['pesticide', 'fertilizer', 'seed'].filter((s) => b.holdings[s] > 0);
  const rb = rincianBenih.get(b.kunci);
  const prof = pengaya.get(b.kunci);
  return {
    id,
    key: b.key,
    label: { id: b.nama },
    entity_form: bentukBadan(b.nama, badanBenih.get(b.kunci)),
    sectors,
    registry_names: [...b.registry_names].sort(),
    holdings: b.holdings,
    ...(b.holdings.seed > 0 && rb ? { seed_profile: bersih(rb) } : {}),
    ...(prof ? { profile: prof } : {}),
    mappings: [...b.registry_names].sort().map((n) => ({
      scheme: 'KEMENTAN',
      id: n,
      relation: 'exact',
      note: 'Nama pemegang pendaftaran sebagaimana tertulis di registri.',
    })),
    lifecycle: { version: '0.1.0', status: 'draft', created_at: '2026-08-23T00:00:00Z' },
  };
});

// ---------------------------------------------------------------------------
// 5. Laporan
// ---------------------------------------------------------------------------
const hitung = (f) => items.filter(f).length;
const n = (x) => x.toLocaleString('id-ID');

console.log(`Badan                 : ${n(items.length)}`);
console.log(`  pestisida saja      : ${n(hitung((x) => x.sectors.length === 1 && x.sectors[0] === 'pesticide'))}`);
console.log(`  pupuk saja          : ${n(hitung((x) => x.sectors.length === 1 && x.sectors[0] === 'fertilizer'))}`);
console.log(`  benih saja          : ${n(hitung((x) => x.sectors.length === 1 && x.sectors[0] === 'seed'))}`);
console.log(`  lebih dari satu     : ${n(hitung((x) => x.sectors.length > 1))}`);
console.log(`  pukpes + benih      : ${n(hitung((x) => x.sectors.includes('seed') && (x.sectors.includes('pesticide') || x.sectors.includes('fertilizer'))))}`);
console.log(`Berpengaya riset (D)  : ${n(hitung((x) => x.profile))} — sisanya hanya bertingkat B dari registri`);
console.log(`Ejaan registri terserap: ${n(items.reduce((a, x) => a + x.registry_names.length, 0))}`);
console.log(`Produk tertaut        : ${n(items.reduce((a, x) => a + x.holdings.pesticide + x.holdings.fertilizer, 0))} dari ${n(produk.length)}`);
console.log(`Varietas tertaut      : ${n(items.reduce((a, x) => a + x.holdings.seed, 0))} dari ${n(varietas.length)}`);
console.log(`  perorangan dilewati : ${n(varietasPerorangan)} varietas — pemulia atas nama sendiri, sengaja tanpa halaman profil`);
console.log(`  tanpa pemelihara    : ${n(varietasTanpaPemelihara)}`);
console.log(`Produk tanpa pemegang : ${n(produkTanpaPemegang)}`);
console.log(`Nomor ID dipakai ulang: ${n([...idLama.keys()].filter((k) => terpakaiKey.has(k)).length)} dari ${n(idLama.size)} yang sudah ada`);

const bentuk = {};
for (const x of items) bentuk[x.entity_form] = (bentuk[x.entity_form] ?? 0) + 1;
console.log('Bentuk badan          :', Object.entries(bentuk).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · '));

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyimpan ke spec/vocab/principal/.');
  process.exit(0);
}

const meta = {
  $schema: '../../schema/collection.schema.json',
  collection: {
    entity_type: 'principal',
    label: { id: 'Badan pemegang pendaftaran — pupuk, pestisida, dan varietas' },
    scope: {
      id: `Seluruh ${items.length} badan yang namanya tercantum sebagai pemegang pendaftaran pupuk/pestisida di DB PUKPES atau sebagai pemohon varietas di registri perizinan Kementan, per 19 Agustus 2026. Satu rekaman per badan, bukan per registri: ${hitung((x) => x.sectors.includes('seed') && (x.sectors.includes('pesticide') || x.sectors.includes('fertilizer')))} badan memegang pendaftaran di kedua sisi. Pemulia perorangan SENGAJA TIDAK termasuk — ${varietasPerorangan} varietas dipegang orang atas nama sendiri, dan halaman profil untuk orang bernama adalah penyusunan data pribadi tanpa dasar pemrosesan. Cacah pendaftaran dan ejaan nama diturunkan dari registri; blok \`profile\` pada ${hitung((x) => x.profile)} rekaman datang dari riset web dan bertingkat D, terpisah dan tidak pernah dicampur ke angka registri.`,
    },
    lifecycle: {
      version: '0.1.0',
      status: 'draft',
      created_at: '2026-08-23T00:00:00Z',
      review_due: '2026-11-23',
    },
    provenance: {
      license: 'CC-BY-SA-4.0',
      sources: [
        {
          title: 'Database Pupuk dan Pestisida Terdaftar (PVTPP)',
          publisher: 'Kementerian Pertanian RI',
          url: 'https://ap-simpel.pertanian.go.id/',
          year: 2026,
          locator: 'Nama pemegang pendaftaran pada 14.920 baris produk; diseragamkan lewat pukpes_data/principal_alias.csv menurut spec/00-konvensi-kerja-paralel.md bagian 4.',
          retrieved: '2026-08-19',
        },
        {
          title: 'Registri perizinan varietas tanaman (SIPERINTIS)',
          publisher: 'Kementerian Pertanian RI',
          url: 'https://perizinan.pertanian.go.id/',
          year: 2026,
          locator: 'Nama pemohon pada 11.227 varietas; diseragamkan lewat proseed_data/pemohon_alias.csv.',
          retrieved: '2026-08-19',
        },
        {
          title: 'Pengaya principal hasil riset web — grup induk, asal, merek payung, situs',
          publisher: 'Pranatani',
          year: 2026,
          locator: 'data/pengaya-principal.csv dan data/principals-benih.csv. BUKAN sumber primer: sumber_jenis bernilai laporan-agen-riset, dan data/README.md mensyaratkan verifikasi ulang per baris. Masuk hanya ke blok `profile` bertingkat D.',
          retrieved: '2026-08-19',
        },
      ],
    },
    storage: 'ndjson',
    count: items.length,
    id_blocks: [BLOK],
  },
};

mkdirSync(KELUAR, { recursive: true });
writeFileSync(NDJSON, items.map((x) => JSON.stringify(x)).join('\n') + '\n');
writeFileSync(META, JSON.stringify(meta, null, 2) + '\n');
console.log(`\nDitulis ke ${KELUAR}`);
