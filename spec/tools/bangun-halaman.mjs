// Menurunkan indeks jadi HALAMAN — satu berkas HTML per entitas, siap dirayapi.
// Rencananya di docs/19-strategi-seo.md; berkas ini mengerjakan empat template S1.
//
//   node spec/tools/bangun-halaman.mjs                       # periksa saja, laporkan
//   node spec/tools/bangun-halaman.mjs --tulis               # tulis ke terbit/
//   node spec/tools/bangun-halaman.mjs --tulis --asal=https://contoh.id
//
// KENAPA HTML, PADAHAL PERMUKAANNYA SUDAH BERJALAN
// app/ menjawab dengan benar, tetapi seluruh jawabannya dirakit di peramban dari
// spec/indeks/. Perayap memang menjalankan JavaScript — yang tidak ia lakukan adalah
// menemukan 26 ribu entitas yang tidak ditaut dari mana pun. Berkas ini menerbitkan
// jalan masuknya: URL sendiri per entitas, tertaut satu sama lain, dengan jawabannya
// sudah ada di HTML sebelum satu baris skrip berjalan.
//
// SATU LABEL REGISTRI BISA MILIK BEBERAPA SPESIES
// Lima OPT bernama "Gulma Berdaun Lebar" pada satu komoditas ternyata lima spesies
// (Ageratum conyzoides, Bidens pilosa, Amaranthus sp., Borreria latifolia, Galinsoga
// parviflora). Menyatukan halamannya akan menyatukan pendaftaran yang memang terpisah;
// menerbitkannya apa adanya akan memberi lima halaman berjudul sama persis. Keduanya
// ditolak: yang bertabrakan dibedakan menurut taksonnya, dan tiap halaman menyebut siapa
// saja yang berbagi labelnya. spec/vocab/pest-registri.json yang membuatnya mungkin.
//
// YANG DIHASILKAN
//   hama/<komoditas>/<opt>/index.html   OPT pada satu komoditas: bahan aktif, kadar,
//                                       merek terdaftar, dan dosis berlabelnya
//   bahan/<bahan>/index.html            satu bahan aktif: kadar, merek, dan untuk apa
//                                       saja ia terdaftar
//   kandungan/<n-p-k>/index.html        pupuk terdaftar dengan kandungan itu
//   setara/<komposisi>/index.html       merek yang isinya sama persis
//   produk/<merek>-<nomor>/index.html   satu pendaftaran: isi, masa berlaku, penggunaan
//   badan/<kunci>/index.html            pemegang pendaftaran: merek & varietas yang dipegang
//   tanaman/<komoditas>/index.html      pintu komoditas: OPT-nya, varietasnya, harganya
//   robots.txt, sitemap-*.xml, manifest.json
//
// KELUARANNYA DETERMINISTIK, SAMA SEPERTI bangun-indeks.mjs
// Tidak ada stempel waktu — `lastmod` diambil dari tanggal TARIKAN sumber di meta.json,
// bukan dari jam membangun. Kalau tidak, 19 ribu URL akan mengaku berubah tiap hari, dan
// anggaran rayap habis untuk klaim yang tidak benar. Seluruh larik diurutkan, sehingga
// membangun ulang sumber yang sama menghasilkan berkas yang sama persis.
//
// YANG SENGAJA TIDAK DILAKUKAN
//   - tidak ada halaman untuk orang (pemulia, pemilik toko bernama orang)
//   - tidak ada halaman "terbaik", tidak ada peringkat: merek diurutkan menurut NOMOR
//     PENDAFTARAN MENAIK, dan nomornya ikut tercetak supaya urutannya bisa diperiksa
//   - tidak ada kesimpulan hukum: larangan ditampilkan sebagai fakta beserta lingkupnya
//   - tidak ada dosis per tangki untuk dosis per hektare. Mengubah l/ha jadi ml/tangki
//     menuntut volume semprot, dan volume semprot itu hasil kalibrasi orangnya sendiri —
//     menebaknya di sini berarti mengarang anjuran. Yang per liter dikalikan isi tangki,
//     karena itu aritmetika, bukan agronomi.
//   - tidak ada halaman yang dipotong diam-diam: yang melewati anggaran dan yang
//     daftarnya dipangkas dilaporkan di ringkasan, DAN dikatakan di halamannya sendiri.
//
// ANGGARAN 48 KB DINILAI ATAS UKURAN TER-GZIP
// Itu yang melintas jaringan. Ukuran mentah tetap dilaporkan karena ia yang menentukan
// lama uraiannya di HP entry-level. Yang membebani halaman ternyata bukan barisnya
// melainkan kartunya — satu kartu bahan+kadar berbiaya ~900 byte walau isinya satu baris,
// dan satu OPT bisa punya 141 kartu.

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { hitungHash } from '../kanonik.mjs';
import { TANGKI, BATAS_TANGKI, angkaId, perTangki as perTangkiDasar } from './dosis.mjs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const INDEKS = join(AKAR, 'spec', 'indeks');
const KELUAR = join(AKAR, 'terbit');
const ANGGARAN = 48 * 1024;       // sama seperti anggaran pecahan indeks
const BATAS_DAFTAR = 120;          // panjang daftar tautan sebelum dipangkas & dilaporkan
// Yang membebani halaman ternyata bukan barisnya melainkan KARTUNYA: satu kartu
// bahan+kadar membawa judul, catatan, dan kepala tabelnya sendiri — sekitar 900 byte
// walau isinya satu baris. "Perusak Daun" pada kubis punya 141 kartu untuk 216 merek,
// dan menabelkan semuanya menghasilkan 176 KB. Jadi yang dianggarkan kartunya dulu.
const BATAS_KARTU_PENUH = 12;      // kartu yang ditabelkan penuh; sisanya jadi daftar ringkas
const BUDGET_BARIS = 120;          // baris tabel merek per halaman
const BATAS_BARIS_KARTU = 60;      // baris tabel merek dalam SATU kartu
const BATAS_RINGKAS = 120;         // panjang daftar ringkas sebelum sisanya cuma dihitung
const BUDGET_BARIS_BAHAN = 240;    // baris tabel merek di halaman bahan
const BATAS_SAUDARA = 20;          // takson selabel yang ditaut sebelum sisanya dihitung

const bendera = (n) => process.argv.includes(`--${n}`);
const opsi = (n, bawaan = '') => {
  const p = process.argv.find((a) => a.startsWith(`--${n}=`));
  return p ? p.slice(n.length + 3) : bawaan;
};
const tulis = bendera('tulis');
// Gambar kemasan haknya tercatat milik PEMEGANG PENDAFTARAN, bukan milik repositori ini.
// Ia tetap ditampilkan — permukaan app/ sudah menampilkannya untuk mengenali produk, dan
// tiap gambar membawa penerbit serta tautan halaman asalnya — tetapi mesin pencari
// diminta TIDAK mengindeks gambarnya lewat `noimageindex`, mengikuti pagar di
// docs/19-strategi-seo.md §10. Kalau dasar lisensinya sudah diputuskan, cabut dengan
// --gambar-terindeks.
const gambarTerindeks = bendera('gambar-terindeks');
// Tanpa --asal, kanonik ditulis relatif dan sitemap dilewati: sitemap menuntut URL
// mutlak, dan menebak domain yang belum diputuskan akan menuliskannya ke 19 ribu berkas.
const ASAL = opsi('asal').replace(/\/+$/, '');

/* PLACEHOLDER DITOLAK, BUKAN DITERIMA DIAM-DIAM. Build sebelum 24 Agustus 2026 pernah
 * dijalankan dengan `--asal=https://domain-anda` harfiah, dan hasilnya 30.723 halaman
 * dengan canonical, og:url, dan dua belas sitemap yang semuanya menunjuk domain yang tidak
 * pernah ada. Tidak ada yang gagal saat itu: skripnya menerima string apa pun, dan
 * placeholder itu baru ketahuan ketika seluruh terbitan diaudit.
 *
 * Menolak lebih awal lebih murah daripada menulis 30 ribu berkas yang harus dibuang. Yang
 * diperiksa bentuknya, bukan daftar hitam nama: URL yang tidak bisa diurai, yang bukan
 * http/https, atau yang nama hostnya tidak bertitik — termasuk `domain-anda` dan
 * `contoh` — dihentikan di sini. Membangun tanpa --asal sama sekali tetap sah: itu mode
 * periksa dengan kanonik relatif, dan ia tidak menerbitkan sitemap. */
if (ASAL) {
  let host = null;
  try { const u = new URL(ASAL); host = u.protocol === 'http:' || u.protocol === 'https:' ? u.hostname : null; } catch { host = null; }
  if (!host || !host.includes('.') || /^(domain-anda|contoh|example)\b/i.test(host)) {
    console.error(`--asal=${ASAL} bukan domain yang bisa diterbitkan.`);
    console.error('Ia ditulis ke canonical, og:url, dan seluruh sitemap di 30 ribu halaman,');
    console.error('jadi placeholder dihentikan di sini alih-alih ketahuan sesudah terbit.');
    console.error('Contoh yang sah:\n  node spec/tools/bangun-halaman.mjs --tulis --asal=https://pranatani.com');
    process.exit(1);
  }
}

if (!existsSync(INDEKS)) {
  console.error('spec/indeks/ belum ada — jalankan dulu:\n  node spec/tools/bangun-indeks.mjs --tulis');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Alat kecil
// ---------------------------------------------------------------------------
const baca = (p) => JSON.parse(readFileSync(join(INDEKS, p), 'utf8'));
const bacaBila = (p) => (existsSync(join(INDEKS, p)) ? baca(p) : null);
const berkasDi = (d) => (existsSync(join(INDEKS, d)) ? readdirSync(join(INDEKS, d)).sort() : []);

// Indeks memecah tiga tingkat, bukan dua: satu kartu bahan+kadar yang mereknya banyak
// menyimpan CACAHNYA saja lalu menunjuk `merekDi`. Glifosat pada budidaya padi punya 76
// merek dalam satu kartu — memuatnya bersama 231 kartu lain akan menarik berkas yang
// tidak akan dibaca. Di sini ia dimuat, karena halaman statis memang harus utuh.
const singgahan = new Map();
const bacaSinggah = (p) => {
  if (!singgahan.has(p)) singgahan.set(p, baca(p));
  return singgahan.get(p);
};
const merekKadar = (k) => {
  if (Array.isArray(k.m)) return k.m;
  if (!k.merekDi) return [];
  const pecahan = bacaSinggah(`${k.merekDi}.json`);
  return Array.isArray(pecahan) ? pecahan : (pecahan[k.k] ?? []);
};
const merekDari = (gr) => {
  if (Array.isArray(gr.merek)) return gr.merek;
  if (!gr.merekDi) return [];
  const pecahan = bacaSinggah(`${gr.merekDi}.json`);
  // Pecahan merek dikunci menurut kartunya, karena satu berkas menampung beberapa kartu.
  return Array.isArray(pecahan) ? pecahan : (pecahan[gr.kunci] ?? []);
};

const teks = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n = (x) => Number(x ?? 0).toLocaleString('id-ID');
const jsonLd = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

const slug = (s) => String(s ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 72) || 'tanpa-nama';

// Nama bertabrakan lebih sering daripada dugaan: satu komoditas bisa punya lima OPT
// bernama "Gulma Berdaun Lebar" dengan id berbeda, dan menyatukannya akan menyatukan
// lima pendaftaran yang memang terpisah. Yang bertabrakan diberi ekor id — bukan yang
// pertama datang menang, karena "yang pertama" bergantung urutan baca.
const ekorId = (id) => String(id).split(':').pop().replace(/^0+/, '') || '0';
function pembuatSlug() {
  const dipakai = new Map();
  const tabrakan = [];
  return {
    ambil(nama, id) {
      const dasar = slug(nama);
      if (!dipakai.has(dasar)) { dipakai.set(dasar, id); return dasar; }
      if (dipakai.get(dasar) === id) return dasar;
      tabrakan.push(dasar);
      return `${dasar}-${ekorId(id)}`;
    },
    tabrakan,
  };
}

// ---------------------------------------------------------------------------
// Sumber
// ---------------------------------------------------------------------------
const meta = baca('meta.json');
const larangan = bacaBila('larangan.json') ?? {};
const gejalaKurasi = bacaBila('gejala.json') ?? [];
const varian = bacaBila('varian.json') ?? {};
const kepalaHarga = bacaBila('harga.json') ?? [];

// Kosakata dibaca langsung dari spec/vocab/, bukan dari indeks: indeks memang tidak
// membawa nama ilmiah, dan tanpa nama ilmiah halaman ini akan menerbitkan LIMA halaman
// berjudul "Gulma Berdaun Lebar pada Tomat" — padahal kelimanya spesies yang berbeda
// (Ageratum conyzoides, Bidens pilosa, Amaranthus sp., Borreria latifolia, Galinsoga
// parviflora). Satu label registri dipakai bersama; yang membedakannya taksonnya.
const VOCAB = join(AKAR, 'spec', 'vocab');
const bacaVocab = (f) => {
  const j = JSON.parse(readFileSync(join(VOCAB, f), 'utf8'));
  return Array.isArray(j) ? j : (Object.values(j).find(Array.isArray) ?? []);
};
// Kosakata besar disimpan per baris; dibaca langsung karena isinya — ringkasan lingkup
// laboratorium, cacahan penyuluh per status — sengaja tidak ikut ke indeks. Indeks dipakai
// untuk MENCARI, kosakata untuk MEMBACA, dan halaman entitas butuh keduanya.
const bacaVocabNdjson = (f) => {
  const jalur = join(VOCAB, f);
  if (!existsSync(jalur)) return [];
  return readFileSync(jalur, 'utf8').split('\n').filter((x) => x.trim()).map((x) => JSON.parse(x));
};

const tanggalPanjang = (s) => (s ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

const kosakata = (berkas) => {
  const m = new Map();
  for (const f of berkas) {
    if (!existsSync(join(VOCAB, f))) continue;
    for (const x of bacaVocab(f)) if (x?.id) m.set(x.id, x);
  }
  return m;
};
const vocabOpt = kosakata(['pest-registri.json', 'pest.json']);
// Dihitung terpisah: sepuluh OPT cabai terkurasi BUKAN isi registri, dan prosa yang
// menyebut "registri mencatat 1.370" akan mengklaim sepuluh yang ditulis sendiri sebagai
// catatan kementerian.
const vocabOptRegistri = kosakata(['pest-registri.json']);
const vocabKomoditas = kosakata(['commodity-registri.json', 'commodity.json']);
const ilmiahDari = (id) => vocabOpt.get(id)?.scientific_name ?? null;
// Satu takson bisa punya beberapa rujukan pada skema yang sama — tiga tautan bertuliskan
// "GBIF" tidak memberi tahu apa pun tentang bedanya, jadi yang berulang membawa idnya.
const rujukanDari = (id) => {
  const semua = (vocabOpt.get(id)?.mappings ?? []).filter((m) => m.uri);
  const unik = [...new Map(semua.map((m) => [m.uri, m])).values()]
    .sort((a, b) => a.scheme.localeCompare(b.scheme) || String(a.id).localeCompare(String(b.id)));
  const cacah = unik.reduce((a, m) => ({ ...a, [m.scheme]: (a[m.scheme] ?? 0) + 1 }), {});
  return unik.map((m) => ({ label: cacah[m.scheme] > 1 ? `${m.scheme} ${m.id}` : m.scheme, uri: m.uri }));
};

const gejalaMenurutOpt = new Map(gejalaKurasi.map((g) => [g.id, g]));
const hargaMenurutKomoditas = new Map();
for (const h of kepalaHarga) if (h.c && !hargaMenurutKomoditas.has(h.c)) hargaMenurutKomoditas.set(h.c, h);

// Produk dibaca sekali, dipakai tiga kali: peta id -> pecahan (supaya nama merek bisa
// ditaut ke kartu produknya di jalur 2), peta zat -> penggunaan berlabel (supaya halaman
// bahan bisa menjawab "untuk hama apa"), dan cacah dosis.
const pecahanProduk = new Map();
const produkPenuh = new Map();      // id -> rekaman utuh, dipakai template produk & setara
const gunaZat = new Map();          // zat -> Map(`komoditas|opt` -> {komoditas, komoditasNama, opt, optNama, produk:Set})
const komoditasNama = new Map();
for (const f of berkasDi('produk')) {
  for (const p of baca(`produk/${f}`)) {
    pecahanProduk.set(p.id, `produk/${f.replace(/\.json$/, '')}`);
    produkPenuh.set(p.id, p);
    const zatDiProduk = [...new Set((p.isi ?? []).map((i) => i.zat).filter(Boolean))];
    for (const g of p.guna ?? []) {
      if (g.komoditas && g.komoditasNama) komoditasNama.set(g.komoditas, g.komoditasNama);
      if (!g.komoditas || !g.opt) continue;
      for (const z of zatDiProduk) {
        if (!gunaZat.has(z)) gunaZat.set(z, new Map());
        const kunci = `${g.komoditas}|${g.opt}`;
        const m = gunaZat.get(z);
        if (!m.has(kunci)) m.set(kunci, { komoditas: g.komoditas, komoditasNama: g.komoditasNama, opt: g.opt, optNama: g.optNama, produk: new Set() });
        m.get(kunci).produk.add(p.id);
      }
    }
  }
}

// Varietas hanya dihitung, tidak dihalamani — nol sifat agronomi dari 11.227 membuat
// halaman per varietas pasti lebih miskin daripada deskripsi yang sudah diterbitkan
// dinas. Angkanya tetap berguna sebagai pintu di halaman komoditas.
const varietasPerKomoditas = new Map();
for (const f of berkasDi('varietas')) {
  for (const v of baca(`varietas/${f}`)) {
    if (!v.komoditas) continue;
    varietasPerKomoditas.set(v.komoditas, (varietasPerKomoditas.get(v.komoditas) ?? 0) + 1);
    if (v.komoditasNama) komoditasNama.set(v.komoditas, v.komoditasNama);
  }
}

// ---------------------------------------------------------------------------
// Dosis: yang per liter boleh dikalikan, yang per hektare tidak.
// Perkaliannya sendiri tinggal di tools/dosis.mjs supaya ada yang bisa mengujinya —
// alasannya tertulis di kepala berkas itu, dan ujinya di tools/uji-dosis.mjs.
// ---------------------------------------------------------------------------
let dosisDitahanAmbang = 0;
const LAPOR_DOSIS = { ambang: () => { dosisDitahanAmbang++; } };
const perTangki = (dosis) => perTangkiDasar(dosis, LAPOR_DOSIS);

// ---------------------------------------------------------------------------
// Blok batas jawaban (B1) — bentuk yang sama seperti app/batas.js, dirakit di sini
// karena batas.js hidup di peramban. Aturannya juga sama: sumber tanpa alasan ditolak,
// dan layar yang tidak menyebut satu pun yang tidak diketahuinya gagal dengan berisik.
// ---------------------------------------------------------------------------
const JUDUL_LUBANG = {
  gejalaOpt: 'Gejala OPT di luar sepuluh yang terkurasi',
  gejalaOptRegistri: 'Deskripsi gejala OPT registri',
  phi: 'Tenggang panen (PHI)',
  kelasBahayaWho: 'Kelas bahaya WHO bahan aktif',
  apdProduk: 'Alat pelindung diri produk terdaftar',
  namaDagang: 'Nama dagang di kemasan',
  dosisKosong: 'Dosis yang tidak tercatat di registri',
  takaranRumahTangga: 'Ukuran tutup botol, sendok, dan gelas',
  isiKarung: 'Isi karung, bukan labelnya',
  kandunganTakTerdaftar: 'Kandungan yang tidak ketemu di registri',
  beratJenis: 'Berat jenis pupuk cair',
  hasilVarietas: 'Potensi hasil varietas',
  hargaPetani: 'Harga yang diterima petani',
  hargaWilayah: 'Harga per provinsi dan per pasar',
  bahanHara: 'Unsur hara sebagai bahan yang bisa dicari',
  gambarKemasan: 'Gambar kemasan',
  harga: 'Harga',
  hargaPupuk: 'Harga pupuk dan sarana produksi',
  hargaKomoditasTani: 'Harga yang diterima petani untuk komoditasnya',
  sertifikasiLot: 'Sertifikasi lot benih yang di tangan',
  tokoTakBisaDituju: 'Toko yang tidak bisa dituju',
  tokoTanpaKontak: 'Telepon, jam buka, dan apakah tokonya masih ada',
  haraSediaan: 'Kandungan hara sediaan buatan sendiri',
  bppTanpaAlamat: 'Alamat dan koordinat balai penyuluhan',
  penyuluhTanpaNama: 'Nama dan kontak penyuluh',
  labTarif: 'Tarif dan waktu tunggu pengujian',
  labLingkupRingkas: 'Lingkup terurai per parameter',
};

// Lubang yang hanya dipakai halaman-halaman di berkas ini. Ditaruh di sini, bukan
// dititipkan ke meta.json, supaya penambahan template tidak menuntut suntingan di
// pembangun indeks — dua berkas besar yang kerap digarap dua orang sekaligus.
// meta.tidakAda tetap didahulukan bila kuncinya ada di sana.
const LUBANG_LOKAL = {
  labTarif: 'Tarif pengujian, waktu tunggu hasil, dan apakah laboratoriumnya menerima sampel dari luar tidak terbit di mana pun — KAN mengakreditasi kompetensi, ia tidak mengatur harga layanan. Ketiganya harus ditanyakan langsung ke laboratoriumnya, dan halaman ini hanya bisa memberi nomor teleponnya.',
  labLingkupRingkas: 'Ruang lingkup yang terbaca di sini ringkasan satu paragraf dari papan KAN, bukan daftar parameter. Hanya sebagian laboratorium yang lingkupnya terurai per parameter, karena baru sebagian yang pindah ke aplikasi direktori KAN. Penanda kemampuan karena itu dibaca dari kata, bukan dari kode — dan bisa meleset pada lembaga yang menulis ringkasannya dengan cara lain.',
  penyuluhTanpaNama: 'Nama, NIP, dan nomor telepon penyuluh tidak ada di sini. Laporan tamu SIMLUHTAN memang hanya memberi cacahan, dan hanya itu yang diambil: halaman bernama tentang orang adalah pemrosesan data pribadi yang tidak punya dasar pemrosesan di sini. Yang bisa dituju balainya, lewat dinas kabupaten yang menaunginya.',
};

const cacatBatas = [];
function blokBatas(spek, jalan) {
  const salah = [];
  const arti = meta?.batas?.arti ?? {};
  const sumber = (spek.sumber ?? []).map((a) => {
    const kunci = typeof a === 'string' ? a : a.dari;
    const s = meta?.batas?.sumber?.[kunci];
    if (!s) { salah.push(`sumber "${kunci}" tidak ada di meta.batas.sumber`); return null; }
    const gabung = { ...s, ...(typeof a === 'string' ? {} : a) };
    if (!gabung.alasan) salah.push(`sumber "${kunci}" tanpa alasan tingkat bukti`);
    if (!gabung.tarikan) salah.push(`sumber "${kunci}" tanpa tanggal`);
    return gabung;
  }).filter(Boolean);
  const lubang = (spek.takDijawab ?? []).map((k) => {
    const t = meta?.tidakAda?.[k] ?? LUBANG_LOKAL[k];
    if (!t) { salah.push(`lubang "${k}" tidak ada di meta.tidakAda`); return null; }
    if (!JUDUL_LUBANG[k]) salah.push(`lubang "${k}" belum punya judul`);
    return { judul: JUDUL_LUBANG[k] ?? k, teks: t };
  }).filter(Boolean);
  if (!sumber.length) salah.push('halaman ini tidak menyebut satu sumber pun');
  if (!lubang.length) salah.push('halaman ini tidak menyebut satu pun yang tidak diketahuinya');
  if (salah.length) cacatBatas.push([jalan, salah]);

  const tgl = (s) => (s ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : null);
  const kartuSumber = (s) => {
    const t = ['A', 'B', 'C', 'D'].includes(s.tingkat) ? s.tingkat : null;
    const lencana = t
      ? `<span class="bj-tingkat bj-tingkat-${teks(t.toLowerCase())}">${teks(t)}</span>`
      : '<span class="bj-tingkat bj-tingkat-kosong" aria-hidden="true">–</span>';
    const artiT = t ? `tingkat bukti ${teks(t)} — ${teks(arti[t] ?? '')}` : 'tingkat bukti belum ditetapkan';
    const keping = [s.penerbit && teks(s.penerbit), s.cacah != null && `${n(s.cacah)} rekaman`, s.lisensi && teks(s.lisensi)]
      .filter(Boolean).join(' · ');
    const waktu = [`Tarikan ${teks(tgl(s.tarikan) ?? s.tarikan)}`, s.tinjau && `tinjau ulang sebelum ${teks(tgl(s.tinjau) ?? s.tinjau)}`, s.status && `status ${teks(s.status)}`]
      .filter(Boolean).join(' · ');
    return `<li>
      <p class="bj-kepala">${lencana}<span>${s.url ? `<a href="${teks(s.url)}" rel="noopener noreferrer">${teks(s.label)}</a>` : `<strong>${teks(s.label)}</strong>`}</span></p>
      <p class="bj-arti">${artiT}</p>
      ${s.cakupan ? `<p class="bj-cakupan">Yang dibaca halaman ini: ${teks(s.cakupan)}</p>` : ''}
      ${keping ? `<p class="bj-keping">${keping}</p>` : ''}
      <p class="bj-keping">${waktu}</p>
      <p class="bj-alasan">${teks(s.alasan)}</p>
    </li>`;
  };
  const t = meta?.tinjauan;
  const tinjau = !t ? '' : t.berpeninjau
    ? `<p class="bj-tinjau">Ditinjau orang bernama: <strong>${n(t.berpeninjau)} dari ${n(t.rekaman)}</strong> rekaman kosakata kurasi.</p>`
    : `<p class="bj-tinjau"><strong>Belum seorang pun menempelkan namanya pada isi ini.</strong> Nol dari ${n(t.rekaman)} rekaman kosakata kurasi punya peninjau bernama.</p>`;

  return `<section class="batas-jawaban">
    <h2 class="bj-judul">Batas jawaban di halaman ini</h2>
    <ul class="bj-sumber">${sumber.map(kartuSumber).join('')}</ul>
    ${tinjau}
    <h3 class="bj-judul-lubang">Yang tidak diketahui, dan karena itu tidak ditebak</h3>
    <dl class="bj-lubang">${lubang.map((l) => `<dt>${teks(l.judul)}</dt><dd>${teks(l.teks)}</dd>`).join('')}</dl>
  </section>`;
}

// ---------------------------------------------------------------------------
// Cangkang halaman
// ---------------------------------------------------------------------------
const TEMA_SEBARIS = `<script>
  try {
    var t = localStorage.getItem('op:tema');
    if (t === 'terang' || t === 'gelap') document.documentElement.dataset.tema = t;
  } catch (e) { /* mode privat menolak localStorage; bawaan "ikut sistem" tetap benar */ }
</script>`;

const mutlak = (jalan) => (ASAL ? `${ASAL}/${jalan}` : `/${jalan}`);

function halaman({ jalan, judul, deskripsi, jalur, h1, lede, isi, ld, batas, robots }) {
  const kanonik = mutlak(jalan);
  const arahan = robots ? `\n<meta name="robots" content="${teks(robots)}">` : '';
  const og = ASAL ? `
<meta property="og:type" content="article">
<meta property="og:site_name" content="Pranatani">
<meta property="og:locale" content="id_ID">
<meta property="og:title" content="${teks(judul)}">
<meta property="og:description" content="${teks(deskripsi)}">
<meta property="og:url" content="${teks(kanonik)}">` : '';
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#00442f">
<title>${teks(judul)}</title>
<meta name="description" content="${teks(deskripsi)}">
<link rel="canonical" href="${teks(kanonik)}">${arahan}${og}
${TEMA_SEBARIS}
<link rel="manifest" href="/manifest.webmanifest">
<link rel="stylesheet" href="/gaya.css">
<link rel="stylesheet" href="/batas.css">
<script type="application/ld+json">${jsonLd(ld)}</script>
</head>
<body>

<header class="atas">
  <div class="baris-atas">
    <p class="jalur">${teks(jalur)}</p>
    <button class="tombol-tema" type="button" id="tombolTema"
            aria-label="Tampilan layar: ikut sistem. Ketuk untuk terang."></button>
  </div>
  <h1>${teks(h1)}</h1>
  <p class="lede">${lede}</p>
</header>

<main>
${isi}
${batas}
</main>

<script type="module">
  import { pasangTombolTema } from '/tema.js';
  pasangTombolTema();
</script>
</body>
</html>
`;
}

// Pertanyaan hanya ditandai FAQPage kalau ia benar-benar tercetak di halaman, dan
// jawabannya benar-benar dipegang datanya. Pertanyaan yang jawabannya "belum ada" tetap
// boleh ditulis — yang tidak boleh adalah menandainya seolah terjawab.
function blokTanya(daftar) {
  if (!daftar.length) return { html: '', ld: null };
  const html = `
  <section class="kartu">
    <h2>Pertanyaan yang sering ditanyakan</h2>
    ${daftar.map((q) => `<h3>${teks(q.t)}</h3>\n    <p>${q.jHtml ?? teks(q.j)}</p>`).join('\n    ')}
  </section>`;
  const ld = {
    '@type': 'FAQPage',
    mainEntity: daftar.map((q) => ({
      '@type': 'Question', name: q.t,
      acceptedAnswer: { '@type': 'Answer', text: q.j },
    })),
  };
  return { html, ld };
}

const remah = (jalur) => ({
  '@type': 'BreadcrumbList',
  itemListElement: jalur.map((x, i) => ({
    '@type': 'ListItem', position: i + 1, name: x.nama,
    ...(x.jalan ? { item: mutlak(x.jalan) } : {}),
  })),
});

const daftarMerek = (merek) => ({
  '@type': 'ItemList',
  numberOfItems: merek.length,
  itemListElement: merek.slice(0, 100).map((m, i) => ({
    '@type': 'ListItem', position: i + 1, name: m.nama ?? m.n,
    ...(m.daftar ? { identifier: m.daftar } : {}),
  })),
});

// ---------------------------------------------------------------------------
// Potongan yang dipakai lebih dari satu template
// ---------------------------------------------------------------------------
const tautProduk = (id, nama) => {
  const p = pecahanProduk.get(id);
  return p
    ? `<a href="/produk.html?id=${encodeURIComponent(id)}&amp;pecahan=${encodeURIComponent(p)}">${teks(nama)}</a>`
    : teks(nama);
};

let dosisTerkonversi = 0;
const CATATAN_URUTAN = `
  <p class="catatan">
    Merek diurutkan menurut <strong>nomor pendaftaran menaik</strong> — tanpa peringkat,
    tanpa slot berbayar. Nomornya ikut tercetak, jadi urutannya bisa diperiksa sendiri.
    <strong>Dosisnya berbeda-beda walau isinya sama</strong>, karena dosis milik
    pendaftaran tiap produk, bukan milik bahannya.
  </p>`;
function tabelMerek(merek) {
  const adaTangki = merek.some((m) => perTangki(m.dosis));
  return `
    <div class="pembungkus-tabel">
      <table>
        <thead><tr><th>Merek</th><th>Nomor pendaftaran</th><th>Berlaku sampai</th><th>Dosis terdaftar</th>${adaTangki ? `<th>Per tangki ${TANGKI} L</th>` : ''}</tr></thead>
        <tbody>${merek.map((m) => {
          const t = perTangki(m.dosis);
          if (t) dosisTerkonversi++;
          return `
          <tr><td>${tautProduk(m.id ?? m.i, m.nama ?? m.n)}</td><td class="angka">${teks(m.daftar ?? '—')}</td>
              <td class="angka">${teks(m.berlaku ?? '—')}</td>
              <td class="angka">${teks(m.dosis ?? '—')}</td>${adaTangki ? `<td class="angka">${t ? teks(t) : '—'}</td>` : ''}</tr>`;
        }).join('')}</tbody>
      </table>
    </div>
    ${adaTangki ? `<p class="catatan">
      Kolom tangki cuma perkalian: dosis per liter × ${TANGKI} liter. Dosis <strong>per
      hektare tidak ikut dikonversi</strong> — mengubahnya jadi isi tangki menuntut volume
      semprot, dan volume semprot itu hasil kalibrasi alat dan cara jalan orangnya sendiri.
      <a href="/takaran.html">Kalibrasi &amp; takaran semprot →</a>
    </p>` : ''}`;
}

function kartuLarangan(zatDilarang) {
  if (!zatDilarang.length) return '';
  const baris = zatDilarang.flatMap(({ zat, nama }) =>
    (larangan[zat] ?? []).map((l) => `
      <tr><td>${teks(nama)}</td><td>${teks(l.menyeluruh ? 'menyeluruh' : (l.lingkup ?? []).join(', ') || '—')}</td>
          <td>${teks(l.instrumen ?? '—')}${l.kutipan ? ` — ${teks(l.kutipan)}` : ''}</td></tr>`));
  if (!baris.length) return '';
  return `
  <div class="kartu tabrakan">
    <h2>Bahan yang ada larangannya</h2>
    <div class="pembungkus-tabel">
      <table>
        <thead><tr><th>Bahan</th><th>Lingkup larangan</th><th>Dasar</th></tr></thead>
        <tbody>${baris.join('')}</tbody>
      </table>
    </div>
    <p class="catatan">
      Yang ditampilkan <strong>dua fakta apa adanya</strong>: bahannya terdaftar, dan ada
      larangan dengan lingkup itu. Halaman ini tidak menyimpulkan legal atau ilegal —
      kesimpulan hukum bukan wewenangnya.
    </p>
  </div>`;
}

// ---------------------------------------------------------------------------
// Kumpulan berkas keluaran
// ---------------------------------------------------------------------------
const berkas = new Map();
const urlTemplate = { hama: [], bahan: [], kandungan: [], tanaman: [], setara: [], produk: [], badan: [], harga: [], toko: [], lab: [], bpp: [], sediaan: [], editorial: [] };
const dipangkas = [];
const simpan = (jalan, isi) => berkas.set(jalan, isi);

const TARIKAN = {
  pestisida: meta?.batas?.sumber?.pestisida?.tarikan ?? null,
  pupuk: meta?.batas?.sumber?.pupuk?.tarikan ?? null,
  lab: meta?.batas?.sumber?.lab?.tarikan ?? null,
  bpp: meta?.batas?.sumber?.bpp?.tarikan ?? null,
};

/* KUNCI BADAN DIKUMPULKAN LEBIH DULU, supaya halaman produk bisa menaut ke halaman
 * badannya — dan bukan ke layar aplikasi berparameter.
 *
 * Sampai 24 Agustus 2026, 14.920 halaman produk menyebut pemegang pendaftarannya lewat
 * `/principal.html?key=…`, sementara halaman `/badan/<kunci>/` yang isinya persis itu
 * berdiri tanpa satu pun tautan masuk: 3.136 halaman dibangun dengan benar, dirujuk nol
 * kali. Akibatnya dua-duanya rugi — halaman statisnya nyaris tak terlihat perayap, dan
 * layar berparameter yang menggantikannya menduplikasi isinya tanpa canonical.
 *
 * Halaman badan dibangun jauh di bawah, jadi daftarnya dipindai di sini lebih dulu. Yang
 * dipindai kuncinya saja — berkasnya sendiri tetap dibaca sekali, di tempatnya. Saringnya
 * sama persis dengan yang dipakai loop badan; kalau keduanya menyimpang, tautan akan
 * menunjuk halaman yang tidak pernah ditulis, dan itu tepat yang dicegah di sini. */
const KUNCI_BADAN = new Set();
for (const f of berkasDi('principal')) {
  const k = baca(`principal/${f}`)?.key;
  if (/^[a-z0-9-]+$/.test(k ?? '')) KUNCI_BADAN.add(k);
}
let tautBadanStatis = 0; let tautBadanDinamis = 0;

/* Seri harga yang PUNYA halaman sendiri. Loop harga di bawah hanya menerbitkan golongan
 * `pangan` dan `input` — 55 dari 96 — dan sisanya sengaja dibuang (baja ringan, besi
 * beton, dan sebangsanya di luar misi). Pintu komoditas dulu menaut layar aplikasi untuk
 * semuanya, sehingga 55 halaman harga yang sudah dibangun tidak pernah dirujuk sekali pun.
 * Medan `r` pada kepala harga diverifikasi identik dengan `golongan` pada berkasnya untuk
 * ke-96 seri, jadi ia cukup untuk memutuskan tanpa membaca berkasnya lebih awal. */
const hargaTerbit = (h) => h?.r === 'pangan' || h?.r === 'input';

/* KANAL KEBERATAN, DAN KENAPA IA HARUS ADA DI HALAMANNYA SENDIRI.
 *
 * 1.113 gambar kemasan terbit dengan manifes yang mencatat sendiri `permission:
 * "belum_diminta"`. Keputusan menerbitkannya sudah dinyatakan terbuka di kepala
 * `gambar_produk/terbitkan.mjs`, dan itu jujur — tetapi kejujuran yang hanya bisa dibaca di
 * dalam repositori tidak menolong pemegang hak yang menemukan gambarnya lewat mesin
 * pencari. Ia mendarat di halaman produk, bukan di berkas skrip.
 *
 * Jadi jalan keluarnya dipasang di tempat gambarnya benar-benar tampil, dengan merek dan
 * URL halamannya sudah terisi. Kanalnya kanal yang sudah ada — isu di repositori, sama
 * seperti sanggahan data — supaya permintaan pencabutan tercatat di tempat yang sama
 * dengan koreksi lain, bukan di kotak surel yang tidak bisa diperiksa siapa pun. */
const REPO_ISU = 'https://github.com/bayusyerli/open_protocol/issues/new';
const alamatKeberatanGambar = (merek, jalan) => {
  const p = new URLSearchParams({
    title: `Keberatan gambar: ${merek}`,
    labels: 'gambar,keberatan-hak',
    body: [
      `Halaman: ${ASAL ? `${ASAL}/${jalan}` : `/${jalan}`}`,
      `Merek: ${merek}`,
      '',
      'Saya pemegang hak atas gambar di halaman ini dan meminta pencabutannya.',
      '',
      'Hubungan dengan pemegang hak (pilih satu): pemegang pendaftaran / kuasa / lainnya —',
      'Yang diminta (pilih satu): dicabut / diganti gambar resmi / cukup diperbaiki atribusinya —',
      '',
      'Catatan tambahan:',
    ].join('\n'),
  });
  return `${REPO_ISU}?${p}`;
};

/* Nama pemegang pendaftaran sebagai tautan — ke halaman badannya kalau ia terbit, ke layar
 * aplikasi kalau tidak. Aturannya satu dan dipakai enam tempat, persis seperti
 * `namaPemegang()` di app/pustaka.js; dua salinan akan menyimpang. */
function tautBadan(key, nama) {
  const t = teks(nama ?? '—');
  if (!key) return t;
  if (KUNCI_BADAN.has(key)) { tautBadanStatis++; return `<a href="/badan/${teks(key)}/">${t}</a>`; }
  // Sisanya badan yang kuncinya ditolak saringan di atas — tidak punya halaman sendiri,
  // jadi layar aplikasi yang menampungnya. Jumlahnya kecil dan dilaporkan di ringkasan.
  tautBadanDinamis++;
  return `<a href="/principal.html?key=${encodeURIComponent(key)}">${t}</a>`;
}

// ---------------------------------------------------------------------------
// Template 1 — hama × komoditas
// ---------------------------------------------------------------------------
const slugKomoditas = pembuatSlug();
const petaKomoditas = new Map();   // id komoditas -> {slug, nama, berkas}
for (const f of berkasDi('opt')) {
  if (!f.endsWith('.json')) continue;
  const k = baca(`opt/${f}`);
  // Kunci kosakata dipakai kalau ada — ia sudah dikurasi, pendek, dan tidak ikut berubah
  // saat label registrinya diperbaiki ejaannya.
  const kunciVocab = vocabKomoditas.get(k.komoditas)?.key;
  petaKomoditas.set(k.komoditas, {
    // Slug DIBACA dari indeks, tidak dihitung ulang. Sejak kotak cari ikut menaut
    // /tanaman/<slug>/, dua tempat menurunkan slug yang sama dari sumber yang sama — dan
    // dua turunan yang wajib sama persis adalah tautan menggantung yang menunggu giliran.
    // Yang menghitungnya bangun-indeks.mjs, karena di sanalah kepala pencarian dibuat.
    // Hitungan di sini tinggal sebagai cadangan untuk indeks lama yang belum membawanya.
    slug: k.slug ?? slugKomoditas.ambil(kunciVocab ?? k.nama, k.komoditas),
    nama: k.nama, kunci: f.replace(/\.json$/, ''), opt: k.opt ?? [],
  });
  komoditasNama.set(k.komoditas, k.nama);
}

// Slug bahan dipakai dua template (hama menaut ke bahan), jadi dibuat lebih dulu.
const slugBahan = pembuatSlug();
const petaBahan = new Map();       // id zat -> {slug, nama, larangan, produk, kadar}
// Direktori bahan/ memuat DUA jenis berkas: indeks zat (`000.json`) dan pecahan luapan
// merek (`opsub00000102-merek-00.json`) yang dikunci menurut KADAR, bukan menurut id zat.
// Membaca keduanya sebagai indeks zat menerbitkan 67 halaman bernama "tanpa-nama-480 g/L"
// — dengan spasi dan garis miring di dalam URL-nya.
for (const f of berkasDi('bahan').filter((x) => /^\d+\.json$/.test(x))) {
  for (const [zat, b] of Object.entries(baca(`bahan/${f}`))) {
    petaBahan.set(zat, { ...b, zat, slug: slugBahan.ambil(b.n, zat) });
  }
}

// Slug OPT dihitung SEKALI di sini, bukan di dalam tiap perulangan: halaman komoditas
// menaut ke halaman hama, dan dua perhitungan terpisah yang kebetulan sama hari ini akan
// berhenti sama pada perubahan pertama.
const slugOpt = new Map();          // `${idKomoditas}|${idOpt}` -> slug
for (const [idKom, kom] of [...petaKomoditas.entries()].sort()) {
  const pembuat = pembuatSlug();
  for (const o of [...kom.opt].sort((a, b) => a.id.localeCompare(b.id))) {
    // Label dulu, karena itu yang diketik orang. Yang bertabrakan diberi kunci
    // kosakatanya — `gulma-berdaun-lebar-bidens-pilosa`, bukan nomor yang tak berarti.
    const kunciVocab = vocabOpt.get(o.id)?.key;
    const dasar = slug(o.nama);
    const s2 = pembuat.ambil(o.nama, o.id);
    slugOpt.set(`${idKom}|${o.id}`, s2 === dasar ? dasar : (kunciVocab ? `${dasar}-${slug(kunciVocab)}` : s2));
  }
}

for (const [idKom, kom] of [...petaKomoditas.entries()].sort()) {
  for (const o of [...kom.opt].sort((a, b) => a.id.localeCompare(b.id))) {
    const isiOpt = baca(`${o.berkas}.json`);
    const grup = [
      ...(isiOpt.grup ?? []),
      ...(isiOpt.kartuDi ?? []).flatMap((p) => baca(`${p}.json`)),
    ].sort((a, b) => String(a.kunci).localeCompare(String(b.kunci)));

    const sOpt = slugOpt.get(`${idKom}|${o.id}`);
    const jalan = `hama/${kom.slug}/${sOpt}/`;
    const ilmiah = ilmiahDari(o.id);
    const sebutan = ilmiah && ilmiah.toLowerCase() !== o.nama.toLowerCase()
      ? `${o.nama} (${ilmiah})` : o.nama;
    const merekSemua = grup.flatMap(merekDari);
    const merekUnik = [...new Map(merekSemua.map((m) => [m.id, m])).values()]
      .sort((a, b) => String(a.daftar ?? '').localeCompare(String(b.daftar ?? '')));
    const zatDilarang = grup.filter((g) => g.larangan || g.laranganLain)
      .map((g) => ({ zat: g.zat, nama: g.nama }));
    const zatUnikDilarang = [...new Map(zatDilarang.map((z) => [z.zat, z])).values()].sort((a, b) => a.zat.localeCompare(b.zat));

    // Label registri dipakai bersama lebih sering daripada dugaan. Menyebut siapa saja
    // yang memakainya di komoditas ini adalah pembeda yang paling berguna di halaman —
    // sekaligus alasan halaman ini tidak boleh disatukan dengan saudara selabelnya.
    const saudaraLabel = kom.opt
      .filter((x) => x.id !== o.id && slug(x.nama) === slug(o.nama))
      .map((x) => ({ ...x, ilmiah: ilmiahDari(x.id), slug: slugOpt.get(`${idKom}|${x.id}`) }))
      .sort((a, b) => String(a.ilmiah ?? '').localeCompare(String(b.ilmiah ?? '')));
    const rujukan = rujukanDari(o.id);
    const kartuTakson = (ilmiah || saudaraLabel.length) ? `
  <div class="kartu">
    <h2>Yang mana persisnya</h2>
    ${ilmiah ? `<p>Label registrinya <strong>${teks(o.nama)}</strong>; taksonnya
      <strong><em>${teks(ilmiah)}</em></strong>${vocabOpt.get(o.id)?.taxonomic_rank ? ` (${teks(vocabOpt.get(o.id).taxonomic_rank)})` : ''}.</p>` : ''}
    ${saudaraLabel.length ? `<p class="catatan">
      Label “${teks(o.nama)}” dipakai bersama ${n(saudaraLabel.length)} takson lain pada
      ${teks(kom.nama)}, dan pendaftarannya berbeda-beda. Yang lain:
      ${saudaraLabel.slice(0, BATAS_SAUDARA).map((x) => `<a href="/hama/${teks(kom.slug)}/${teks(x.slug)}/">${x.ilmiah ? `<em>${teks(x.ilmiah)}</em>` : teks(x.nama)}</a>`).join(' · ')}${saudaraLabel.length > BATAS_SAUDARA ? ` — dan ${n(saudaraLabel.length - BATAS_SAUDARA)} lagi` : ''}
    </p>` : ''}
    ${rujukan.length ? `<p class="catatan">Rujukan taksonomi: ${rujukan.map((r) => `<a href="${teks(r.uri)}" rel="noopener noreferrer">${teks(r.label)}</a>`).join(' · ')}</p>` : ''}
  </div>` : '';

    const g = gejalaMenurutOpt.get(o.id);
    const kartuGejala = g?.gejala ? `
  <div class="kartu pelepasan">
    <h2>Pastikan dulu ini memang ${teks(g.nama)}</h2>
    <p>${teks(g.gejala)}</p>
    ${(g.pembanding ?? []).length ? `<ol class="periksa">${g.pembanding.map((p) => `<li>${teks(p.cek ?? p.label ?? '')}</li>`).join('')}</ol>` : ''}
    ${g.keterangan ? `<p class="catatan">${teks(g.keterangan)}</p>` : ''}
  </div>` : `
  <div class="kartu peringatan">
    <h2>Halaman ini tidak bisa membantu mengenali gejalanya</h2>
    <p class="catatan">${teks(meta?.tidakAda?.gejalaOptRegistri ?? 'Registri tidak memuat deskripsi gejala.')}</p>
  </div>`;

    // Kartu ditabelkan sampai anggaran baris habis, sisanya jadi daftar ringkas yang
    // tetap menyebut jumlahnya dan tetap menaut ke halaman bahannya. Yang dipangkas
    // dikatakan, bukan didiamkan: gulma pada budidaya kelapa sawit punya 232 kartu, dan
    // menabelkan semuanya menghasilkan satu halaman 394 KB untuk HP bersinyal buruk.
    const kartuUrut = [...grup].sort((a, b) => {
      const ja = Array.isArray(a.merek) ? a.merek.length : (a.merek ?? 0);
      const jb = Array.isArray(b.merek) ? b.merek.length : (b.merek ?? 0);
      return (jb - ja) || String(a.kunci).localeCompare(String(b.kunci));
    });
    let sisaBaris = BUDGET_BARIS;
    const kartuPenuh = []; const kartuRingkas = [];
    let barisDitahan = 0; let kartuTakTerdaftar = 0;
    for (const gr of kartuUrut) {
      const b = petaBahan.get(gr.zat);
      const merek = [...merekDari(gr)].sort((a, b2) => String(a.daftar ?? '').localeCompare(String(b2.daftar ?? '')));
      const tanda = gr.larangan ? '<span class="tanda-larangan">dilarang di sini</span>'
        : gr.laranganLain ? '<span class="tanda-syarat">ada larangan lain</span>' : '';
      const tautBahan = b ? `<a href="/bahan/${teks(b.slug)}/">semua ${n(b.produk)} produk dengan ${teks(gr.nama)} →</a>` : '';
      if (kartuPenuh.length >= BATAS_KARTU_PENUH || sisaBaris <= 0) {
        barisDitahan += merek.length;
        if (kartuRingkas.length >= BATAS_RINGKAS) { kartuTakTerdaftar++; continue; }
        const tanda2 = gr.larangan ? ' · dilarang di sini' : gr.laranganLain ? ' · ada larangan lain' : '';
        kartuRingkas.push(b
          ? `<li><a href="/bahan/${teks(b.slug)}/"><span class="nama">${teks(gr.nama)} ${teks(gr.kadar)}</span><span class="sub">${n(merek.length)} merek${tanda2}</span></a></li>`
          : `<li><span class="nama">${teks(gr.nama)} ${teks(gr.kadar)}</span><span class="sub">${n(merek.length)} merek${tanda2}</span></li>`);
        continue;
      }
      const muat = merek.slice(0, Math.min(BATAS_BARIS_KARTU, Math.max(sisaBaris, 1)));
      barisDitahan += merek.length - muat.length;
      sisaBaris -= muat.length;
      kartuPenuh.push(`
  <div class="kartu bahan">
    <h3>${teks(gr.nama)} ${teks(gr.kadar)} ${tanda}</h3>
    <p class="catatan">${n(merek.length)} merek terdaftar${tautBahan ? ` · ${tautBahan}` : ''}</p>
    ${tabelMerek(muat)}
    ${muat.length < merek.length ? `<p class="catatan">${n(merek.length - muat.length)} merek lain dengan bahan dan kadar yang sama tidak ditabelkan di halaman ini — seluruhnya ada di ${tautBahan || 'halaman bahannya'}</p>` : ''}
  </div>`);
    }
    if (kartuRingkas.length || barisDitahan) dipangkas.push([jalan, `${kartuRingkas.length} kartu diringkas, ${barisDitahan} baris merek ditahan${kartuTakTerdaftar ? `, ${kartuTakTerdaftar} kartu hanya dihitung` : ''}`]);
    const kartuBahan = kartuPenuh.join('\n') + (kartuRingkas.length ? `
  <h3 class="judul-bagian">${n(kartuRingkas.length)} kombinasi bahan dan kadar lainnya</h3>
  <p class="bantuan">
    Tidak ditabelkan di sini supaya halaman tetap bisa dibuka dengan sinyal buruk.
    Jumlah mereknya tetap disebut, dan tiap bahan punya halamannya sendiri.
  </p>
  <ul class="daftar">${kartuRingkas.join('\n    ')}</ul>
  ${kartuTakTerdaftar ? `<p class="catatan">${n(kartuTakTerdaftar)} kombinasi lain bahkan tidak didaftar di halaman ini, dengan alasan yang sama. Seluruhnya bisa ditelusuri di <a href="/jalur-1.html?opt=${encodeURIComponent(o.id)}">versi yang bisa ditelusuri</a>.</p>` : ''}` : '');

    const contohDosis = merekUnik.map((m) => m.dosis).filter(Boolean).slice(0, 3);
    const tangkiAda = merekUnik.filter((m) => perTangki(m.dosis));
    const tanya = [
      { t: `Merek apa saja yang terdaftar untuk ${o.nama} pada ${kom.nama}?`,
        j: `${merekUnik.length} merek terdaftar, dari ${grup.length} kartu bahan+kadar. Daftarnya ada di halaman ini, diurutkan menurut nomor pendaftaran menaik — bukan menurut peringkat.` },
      { t: `Berapa dosis terdaftarnya?`,
        j: contohDosis.length
          ? `Dosis milik pendaftaran tiap produk, bukan milik bahannya, jadi berbeda-beda walau isinya sama. Contoh yang tercatat: ${contohDosis.join('; ')}. Yang ditampilkan dosis berlabel, bukan anjuran.`
          : `Registri tidak mencatat dosis untuk pendaftaran ini. Kosongnya ada di sumbernya, bukan di halaman ini.` },
    ];
    if (tangkiAda.length) {
      tanya.push({ t: `Berapa takarannya untuk satu tangki ${TANGKI} liter?`,
        j: `Untuk ${tangkiAda.length} pendaftaran yang dosisnya per liter, kalikan saja dengan ${TANGKI}: misalnya ${tangkiAda[0].dosis} menjadi ${perTangki(tangkiAda[0].dosis)} per tangki. Dosis per hektare tidak bisa dikonversi tanpa volume semprot hasil kalibrasi sendiri.` });
    }
    if (zatUnikDilarang.length) {
      tanya.push({ t: `Apakah ada bahan yang dilarang untuk ini?`,
        j: `${zatUnikDilarang.length} bahan di halaman ini punya catatan larangan beserta lingkupnya. Yang ditampilkan dua fakta apa adanya — halaman ini tidak menyimpulkan legal atau ilegal.` });
    }
    const { html: htmlTanya, ld: ldTanya } = blokTanya(tanya);

    const isi = `
  ${kartuTakson}
  ${kartuGejala}
  ${kartuLarangan(zatUnikDilarang)}
  <h2 class="judul-bagian">Bahan aktif dan merek yang terdaftar</h2>
  <p class="bantuan">
    ${n(merekUnik.length)} merek terdaftar untuk ${teks(o.nama)} pada ${teks(kom.nama)},
    dari ${n(grup.length)} kombinasi bahan dan kadar. Kartu diurutkan menurut banyaknya
    merek terdaftar — angka dari registri, bukan penilaian.
  </p>
  ${CATATAN_URUTAN}
  ${kartuBahan}
  ${htmlTanya}
  <details class="batas">
    <summary><h2>Batas yang perlu diketahui sebelum memakai halaman ini</h2></summary>
    <div class="batas-isi">
      <h3>Terdaftar bukan berarti manjur</h3>
      <p>Yang dicatat registri izin edar, bukan hasil uji lapangan. Halaman ini tidak
      pernah menyebut ada merek yang lebih ampuh dari merek lain.</p>
      <h3>Isi sama bukan berarti dosis sama</h3>
      <p>Dosis milik pendaftaran tiap produk. Dua produk dengan bahan dan kadar identik
      bisa punya dosis terdaftar yang berbeda.</p>
      <h3>Nama di kemasan bisa berbeda dari nama terdaftar</h3>
      <p>Registri menyimpan nama produk terdaftar; kemasan sering memakai nama jualan
      lain. Tidak ketemu bukan bukti tidak terdaftar.</p>
    </div>
  </details>
  <p class="lain">
    <a href="/tanaman/${teks(kom.slug)}/">Semua OPT pada ${teks(kom.nama)} →</a> ·
    <a href="/jalur-1.html?opt=${encodeURIComponent(o.id)}">Buka versi yang bisa ditelusuri →</a> ·
    <a href="/takaran.html">Kalibrasi &amp; takaran semprot →</a> ·
    <a href="/index.html">Beranda</a>
  </p>`;

    simpan(`${jalan}index.html`, halaman({
      jalan,
      judul: `${sebutan} pada ${kom.nama} — bahan aktif dan merek yang terdaftar`,
      deskripsi: `${merekUnik.length} merek terdaftar dari ${grup.length} kombinasi bahan dan kadar untuk ${sebutan} pada ${kom.nama}, beserta nomor pendaftaran dan dosis berlabelnya. Urut nomor pendaftaran, tanpa peringkat.`,
      jalur: 'Jalur 1 · masuk dari gejala',
      h1: `${sebutan} pada ${kom.nama}`,
      lede: `${n(merekUnik.length)} merek terdaftar, ${n(grup.length)} kombinasi bahan dan kadar.${saudaraLabel.length ? ` Label ini dipakai ${n(saudaraLabel.length + 1)} takson berbeda pada ${teks(kom.nama)} — halaman ini yang <em>${teks(ilmiah ?? o.nama)}</em>.` : ''} Yang ditampilkan <strong>apa yang terdaftar</strong> — bukan mana yang paling ampuh.`,
      isi,
      ld: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'DefinedTerm', name: o.nama, identifier: o.id,
            ...(ilmiah ? { alternateName: ilmiah } : {}),
            ...(rujukanDari(o.id).length ? { sameAs: rujukanDari(o.id).map((r) => r.uri) } : {}),
            inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'Registri pestisida terdaftar — Kementerian Pertanian RI' },
          },
          daftarMerek(merekUnik),
          remah([{ nama: 'Beranda', jalan: '' }, { nama: kom.nama, jalan: `tanaman/${kom.slug}/` }, { nama: o.nama, jalan }]),
          ...(ldTanya ? [ldTanya] : []),
        ],
      },
      batas: blokBatas({
        sumber: [
          { dari: 'pestisida', cakupan: `bahan aktif, kadar, merek, dan dosis berlabel yang terdaftar untuk ${o.nama} pada ${kom.nama}` },
          ...(g?.gejala ? [{ dari: 'kurasiOpt', cakupan: 'teks gejala dan ciri pembanding untuk OPT ini' }] : []),
        ],
        takDijawab: ['phi', 'namaDagang', 'dosisKosong', ...(g?.gejala ? [] : ['gejalaOptRegistri'])],
      }, jalan),
    }));
    urlTemplate.hama.push([jalan, TARIKAN.pestisida]);
  }
}

// ---------------------------------------------------------------------------
// Template 2 — bahan aktif
// ---------------------------------------------------------------------------
let bahanNoindex = 0;
for (const [zat, b] of [...petaBahan.entries()].sort()) {
  const jalan = `bahan/${b.slug}/`;
  const kadar = [...(b.kadar ?? [])].sort((a, c) => String(a.k).localeCompare(String(c.k)));
  const merekSemua = kadar.flatMap(merekKadar);
  const pakai = [...(gunaZat.get(zat)?.values() ?? [])]
    .sort((a, c) => (c.produk.size - a.produk.size) || a.komoditasNama.localeCompare(c.komoditasNama));
  const pakaiTampil = pakai.slice(0, BATAS_DAFTAR);
  if (pakai.length > pakaiTampil.length) dipangkas.push([jalan, `${pakai.length - pakaiTampil.length} pasangan komoditas×OPT tidak ditampilkan`]);

  // Kadar dengan merek terbanyak ditabelkan lebih dulu sampai anggaran baris habis.
  // Parakuat diklorida punya ratusan pendaftaran dalam satu kadar; menabelkan semuanya
  // membuat satu halaman melewati 120 KB, dan halaman itu dibuka orang dengan sinyal buruk.
  let sisaBahan = BUDGET_BARIS_BAHAN;
  let merekDitahan = 0;
  const jumlahKadar = (k) => (Array.isArray(k.m) ? k.m.length : (k.merek ?? 0));
  const kadarUrut = [...kadar].sort((a, c) => (jumlahKadar(c) - jumlahKadar(a)) || String(a.k).localeCompare(String(c.k)));
  const kartuKadar = kadarUrut.map((k) => {
    const merek = [...merekKadar(k)].sort((x, y) => String(x.n).localeCompare(String(y.n)));
    const muat = sisaBahan <= 0 ? [] : merek.slice(0, Math.min(BATAS_BARIS_KARTU, sisaBahan));
    sisaBahan -= muat.length;
    merekDitahan += merek.length - muat.length;
    const adaCampuran = muat.some((m) => m.f);
    if (!muat.length) {
      return `
  <div class="kartu bahan">
    <h3>${teks(b.n)} ${teks(k.k)}</h3>
    <p class="catatan">${n(merek.length)} merek terdaftar dengan kadar ini — tidak ditabelkan di halaman ini supaya tetap ringan. Namanya bisa dicari di <a href="/produk.html">jalur 2</a>.</p>
  </div>`;
    }
    return `
  <div class="kartu bahan">
    <h3>${teks(b.n)} ${teks(k.k)}</h3>
    <p class="catatan">${n(merek.length)} merek terdaftar dengan kadar ini.</p>
    <div class="pembungkus-tabel">
      <table>
        <thead><tr><th>Merek</th><th>Pemegang pendaftaran</th>${adaCampuran ? '<th>Campurannya</th>' : ''}</tr></thead>
        <tbody>${muat.map((m) => `
          <tr><td>${tautProduk(m.i, m.n)}</td><td>${tautBadan(m.pk, m.k)}</td>${adaCampuran ? `<td>${teks(m.f ?? 'tunggal')}</td>` : ''}</tr>`).join('')}</tbody>
      </table>
    </div>
    ${muat.length < merek.length ? `<p class="catatan">${n(merek.length - muat.length)} merek lain dengan kadar ini tidak ditabelkan di sini.</p>` : ''}
  </div>`;
  }).join('\n');
  if (merekDitahan) dipangkas.push([jalan, `${merekDitahan} baris merek ditahan`]);

  const daftarPakai = pakaiTampil.map((u) => {
    const kom = petaKomoditas.get(u.komoditas);
    return `<li>${kom ? `<a href="/tanaman/${teks(kom.slug)}/">${teks(u.komoditasNama)}</a>` : teks(u.komoditasNama)} — ${teks(u.optNama)} <span class="sub">${n(u.produk.size)} produk</span></li>`;
  }).join('\n      ');

  const tanya = [
    { t: `${b.n} untuk hama apa?`,
      j: pakai.length
        ? `Terdaftar untuk ${pakai.length} pasangan tanaman dan OPT, di antaranya ${pakaiTampil.slice(0, 5).map((u) => `${u.optNama} pada ${u.komoditasNama}`).join('; ')}. Yang dicatat penggunaan berlabel, bukan hasil uji kemanjuran.`
        : `Tidak ada penggunaan berlabel yang tercatat untuk bahan ini di registri. Kosongnya ada di sumbernya.` },
    { t: `Merek apa saja yang mengandung ${b.n}?`,
      j: `${b.produk} produk terdaftar memuatnya, tersebar di ${kadar.length} kadar yang berbeda. Daftarnya lengkap di halaman ini, urut abjad di tiap kadar.` },
    { t: `Kadar berapa saja yang terdaftar?`,
      j: kadar.length ? kadar.map((k) => k.k).join(', ') + '.' : 'Tidak ada kadar yang tercatat.' },
  ];
  if (larangan[zat]) {
    tanya.push({ t: `Apakah ${b.n} dilarang?`,
      j: `Ada ${larangan[zat].length} catatan larangan beserta lingkupnya untuk bahan ini. Halaman menampilkan lingkup dan dasarnya apa adanya, tanpa menyimpulkan legal atau ilegal.` });
  }
  const { html: htmlTanya, ld: ldTanya } = blokTanya(tanya);

  /* Rekaman uji registri (`u` dari bangun-indeks.mjs) diterbitkan, tetapi tidak
   * diindeks. Halamannya tetap ada karena halaman produk dan halaman OPT menaut ke sini,
   * dan tautan yang jadi 404 menyembunyikan bahwa barisnya memang ada di registri.
   * Yang dicabut cuma pintu masuk dari mesin pencari: "test — 1 produk terdaftar" yang
   * mendarat dari Google terbaca sebagai bahan aktif sungguhan, dan halaman ini tidak
   * punya isi yang bisa membantahnya sendiri. Alasannya ditulis di halamannya juga —
   * yang datang lewat tautan tetap berhak tahu kenapa halaman ini tampak kosong. */
  if (b.u) bahanNoindex++;

  const isi = `
  ${b.u ? `<div class="kartu">
    <h2>Ini rekaman uji registri, bukan bahan aktif</h2>
    <p>“${teks(b.n)}” terbawa ke daftar bahan aktif karena tercantum sebagai satu baris
    komposisi di registri Kementan, tetapi bentuk namanya artefak QA dan bukan nama bahan.
    Halamannya tetap diterbitkan supaya barisnya bisa diperiksa apa adanya — yang dihapus
    diam-diam membuat cacah di sini berbeda dari cacah di sumbernya tanpa ada yang tahu
    kenapa. Produk yang memuatnya di bawah ini pendaftaran sungguhan; yang artefak
    barisnya, bukan produknya.</p>
  </div>` : ''}
  ${kartuLarangan(larangan[zat] ? [{ zat, nama: b.n }] : [])}
  <h2 class="judul-bagian">Untuk apa saja ${teks(b.n)} terdaftar</h2>
  <p class="bantuan">
    ${pakai.length ? `${n(pakai.length)} pasangan tanaman dan OPT, diurutkan menurut banyaknya produk.` : 'Tidak ada penggunaan berlabel yang tercatat untuk bahan ini.'}
  </p>
  ${pakai.length ? `<ul class="daftar">
      ${daftarPakai}
    </ul>` : ''}
  ${pakai.length > pakaiTampil.length ? `<p class="catatan">${n(pakai.length - pakaiTampil.length)} pasangan lain tidak ditampilkan di sini supaya halaman tetap ringan. Seluruhnya bisa ditelusuri di <a href="/jalur-1.html">jalur 1</a>.</p>` : ''}
  <h2 class="judul-bagian">Kadar dan merek yang terdaftar</h2>
  ${kartuKadar}
  ${htmlTanya}
  <details class="batas">
    <summary><h2>Batas yang perlu diketahui sebelum memakai halaman ini</h2></summary>
    <div class="batas-isi">
      <h3>Ini daftar pendaftaran, bukan perbandingan kemanjuran</h3>
      <p>Registri mendaftarkan; ia tidak menguji. Halaman ini tidak menyebut kadar atau
      merek mana yang lebih kuat.</p>
      <h3>Campuran mengubah artinya</h3>
      <p>Sebagian produk memuat bahan ini bersama bahan lain. Kolom “campurannya”
      menyebutkannya, dan produk campuran tidak sebanding dengan produk tunggal.</p>
    </div>
  </details>
  <p class="lain">
    <a href="/produk.html">Cari nama di kemasan →</a> ·
    <a href="/jalur-1.html">Masuk dari gejala →</a> ·
    <a href="/index.html">Beranda</a>
  </p>`;

  simpan(`${jalan}index.html`, halaman({
    jalan,
    robots: b.u ? 'noindex,follow' : null,
    judul: `${b.n} — ${b.produk} produk terdaftar, dan untuk apa saja terdaftarnya`,
    deskripsi: `${b.produk} produk terdaftar memuat ${b.n}, dalam ${kadar.length} kadar${pakai.length ? `, terdaftar untuk ${pakai.length} pasangan tanaman dan OPT` : ''}. Daftar lengkap dari registri Kementan, tanpa peringkat.`,
    jalur: 'Jalur 2 · masuk dari kemasan',
    h1: b.n,
    lede: `${n(b.produk)} produk terdaftar memuatnya, dalam ${n(kadar.length)} kadar. Yang ditampilkan <strong>apa yang terdaftar</strong> — bukan mana yang paling ampuh.`,
    isi,
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'DefinedTerm', name: b.n, identifier: zat, inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'Substansi pestisida terdaftar — Kementerian Pertanian RI' } },
        daftarMerek(merekSemua.map((m) => ({ nama: m.n }))),
        remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Bahan aktif', jalan: null }, { nama: b.n, jalan }]),
        ...(ldTanya ? [ldTanya] : []),
      ],
    },
    batas: blokBatas({
      sumber: [{ dari: 'pestisida', cakupan: `kadar, merek, pemegang pendaftaran, dan penggunaan berlabel untuk ${b.n}` }],
      takDijawab: ['phi', 'namaDagang', 'dosisKosong'],
    }, jalan),
  }));
  if (!b.u) urlTemplate.bahan.push([jalan, TARIKAN.pestisida]);
}

// ---------------------------------------------------------------------------
// Template 3 — kandungan pupuk
// ---------------------------------------------------------------------------
// Sidik indeks berbentuk `1@150|2@150|3@150#m`: kode hara @ nilai, dipisah pipa, lalu
// basisnya. Nilai disimpan dalam satuan basisnya (g/kg atau g/L); karung mencetak persen,
// dan persen = nilai ÷ 10. Basis `p` milik sisi pestisida dan dilewati — pasangannya di
// sana bukan halaman kandungan melainkan /setara/.
const HARA = new Map([
  [1, ['N', 'Nitrogen (N)']], [2, ['P2O5', 'Fosfor (P2O5)']], [3, ['K2O', 'Kalium (K2O)']],
  [4, ['CaO', 'Kalsium (CaO)']], [5, ['MgO', 'Magnesium (MgO)']], [20, ['C-org', 'Karbon organik']],
  [11, ['B', 'Boron (B)']], [12, ['Cu', 'Tembaga (Cu)']], [13, ['Zn', 'Seng (Zn)']],
  [14, ['Mn', 'Mangan (Mn)']], [15, ['Mo', 'Molibdenum (Mo)']], [16, ['Fe', 'Besi (Fe)']],
  [17, ['Cl', 'Klor (Cl)']], [18, ['SiO2', 'Silikat (SiO2)']], [19, ['Na', 'Natrium (Na)']],
  [9, ['Dolomit', 'Kapur dolomit']], [10, ['Udang', 'Pakan udang protein 32%']],
]);
const NAMA_BASIS = { m: 'per kilogram', v: 'per liter' };
const SATUAN_BASIS = { m: 'g/kg', v: 'g/L' };

const uraiSidik = (sidik) => {
  const [isi, basis] = sidik.split('#');
  if (!NAMA_BASIS[basis]) return null;
  const hara = isi.split('|').map((x) => {
    const [k, v] = x.split('@');
    return { kode: Number(k), nilai: Number(v) };
  });
  if (hara.some((h) => !HARA.has(h.kode) || !Number.isFinite(h.nilai))) return null;
  return { hara, basis };
};
const persen = (nilai) => angkaId(nilai / 10);

let kandunganTunggal = 0;
const kandunganProduk = new Map();  // id produk -> {slug, nama, jumlah}
const slugKandungan = pembuatSlug();
const semuaKandungan = [];
for (const f of berkasDi('kandungan')) {
  for (const [sidik, produk] of Object.entries(baca(`kandungan/${f}`))) {
    const u = uraiSidik(sidik);
    if (!u) continue;
    if (produk.length < 2) { kandunganTunggal++; continue; }
    semuaKandungan.push({ sidik, ...u, produk });
  }
}
semuaKandungan.sort((a, b) => a.sidik.localeCompare(b.sidik));

for (const k of semuaKandungan) {
  const kodeUrut = [...k.hara].sort((a, b) => a.kode - b.kode);
  const npkMurni = kodeUrut.length === 3 && kodeUrut.every((h, i) => h.kode === [1, 2, 3][i]);
  const dasar = npkMurni
    ? `npk-${kodeUrut.map((h) => persen(h.nilai).replace(',', '.')).join('-')}`
    : kodeUrut.map((h) => `${slug(HARA.get(h.kode)[0])}-${persen(h.nilai).replace(',', '.')}`).join('-');
  const nama = npkMurni
    ? `NPK ${kodeUrut.map((h) => persen(h.nilai)).join('-')}`
    : kodeUrut.map((h) => `${HARA.get(h.kode)[0]} ${persen(h.nilai)}%`).join(', ');
  const sKandungan = slugKandungan.ambil(`${dasar}${k.basis === 'v' ? '-cair' : ''}`, k.sidik);
  const jalan = `kandungan/${sKandungan}/`;
  const produk = [...k.produk].sort((a, b) => String(a.n).localeCompare(String(b.n)));
  for (const x of produk) kandunganProduk.set(x.i, { slug: sKandungan, nama, jumlah: produk.length });

  const tanya = [
    { t: `Pupuk apa saja yang terdaftar dengan kandungan ${nama}?`,
      j: `${produk.length} produk terdaftar membawa kandungan itu pada labelnya. Daftarnya lengkap di halaman ini, urut abjad, tanpa peringkat.` },
    { t: `Kalau kandungannya cocok, berarti pupuknya asli?`,
      j: `Tidak. Kandungan yang cocok berarti LABELNYA sesuai dengan sesuatu yang memang terdaftar. Ia tidak membuktikan isi karungnya — dan justru di situ bahayanya paling tajam.` },
    { t: `Apa bedanya kemasan kilogram dan liter?`,
      j: `Registri menyimpan ${SATUAN_BASIS[k.basis]} untuk kandungan ini, yaitu ${NAMA_BASIS[k.basis]}. Padat dan cair tidak dijembatani: berat jenis tidak ada di registri, jadi ${SATUAN_BASIS.m} dan ${SATUAN_BASIS.v} bukan hal yang sama.` },
  ];
  const { html: htmlTanya, ld: ldTanya } = blokTanya(tanya);

  const isi = `
  <div class="kartu">
    <h2>Kandungan yang tercetak di label</h2>
    <div class="pembungkus-tabel">
      <table>
        <thead><tr><th>Hara</th><th>Persen di kemasan</th><th>Nilai registri</th></tr></thead>
        <tbody>${kodeUrut.map((h) => `
          <tr><td>${teks(HARA.get(h.kode)[1])}</td><td class="angka">${teks(persen(h.nilai))}%</td>
              <td class="angka">${teks(angkaId(h.nilai))} ${teks(SATUAN_BASIS[k.basis])}</td></tr>`).join('')}</tbody>
      </table>
    </div>
    <p class="catatan">
      Basis kandungan ini <strong>${teks(NAMA_BASIS[k.basis])}</strong>. Persen di kemasan
      = nilai registri ÷ 10. Padat dan cair tidak pernah dicocokkan silang, karena berat
      jenis tidak ada di registri.
    </p>
  </div>
  <h2 class="judul-bagian">${n(produk.length)} produk terdaftar dengan kandungan ini</h2>
  <p class="bantuan">Urut abjad. Tanpa peringkat, tanpa slot berbayar.</p>
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>Merek</th><th>Pemegang pendaftaran</th><th>Jenis</th></tr></thead>
      <tbody>${produk.map((p) => `
        <tr><td>${tautProduk(p.i, p.n)}</td><td>${teks(p.k ?? '—')}</td><td>${teks(p.j ?? '—')}</td></tr>`).join('')}</tbody>
    </table>
  </div>
  ${htmlTanya}
  <details class="batas">
    <summary><h2>Batas yang perlu diketahui sebelum memakai halaman ini</h2></summary>
    <div class="batas-isi">
      <h3>Ini memeriksa label terhadap registri, bukan isi karung terhadap labelnya</h3>
      <p>${teks(meta?.tidakAda?.isiKarung ?? 'Isi karung tidak diperiksa di sini.')}</p>
      <h3>Kandungan yang sama bukan berarti pupuk yang sama</h3>
      <p>Bentuk butiran, kelarutan, dan bahan pembawa tidak masuk registri, dan karena itu
      tidak ada di halaman ini.</p>
    </div>
  </details>
  <p class="lain">
    <a href="/produk.html">Periksa kandungan dari karung →</a> ·
    <a href="/jalur-3.html">Hitung rupiah per kg hara →</a> ·
    <a href="/index.html">Beranda</a>
  </p>`;

  simpan(`${jalan}index.html`, halaman({
    jalan,
    judul: `Pupuk ${nama} — ${produk.length} produk terdaftar dengan kandungan itu`,
    deskripsi: `${produk.length} pupuk terdaftar membawa kandungan ${nama} (${NAMA_BASIS[k.basis]}) pada labelnya, beserta pemegang pendaftarannya. Dari registri pupuk Kementan, urut abjad, tanpa peringkat.`,
    jalur: 'Jalur 2 · masuk dari kemasan',
    h1: `Pupuk ${nama}`,
    lede: `${n(produk.length)} produk terdaftar membawa kandungan ini di labelnya. Yang cocok adalah <strong>labelnya</strong>, bukan isi karungnya.`,
    isi,
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        daftarMerek(produk.map((p) => ({ nama: p.n }))),
        remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Kandungan pupuk', jalan: null }, { nama, jalan }]),
        ...(ldTanya ? [ldTanya] : []),
      ],
    },
    batas: blokBatas({
      sumber: [{ dari: 'pupuk', cakupan: `komposisi label dan pemegang pendaftaran untuk ${produk.length} pupuk berkandungan ${nama}` }],
      takDijawab: ['isiKarung', 'beratJenis', 'kandunganTakTerdaftar'],
    }, jalan),
  }));
  urlTemplate.kandungan.push([jalan, TARIKAN.pupuk]);
}

// ---------------------------------------------------------------------------
// Template 4 — komoditas
// ---------------------------------------------------------------------------
const varianDari = new Map();
for (const [, daftar] of Object.entries(varian)) {
  for (const v of daftar) varianDari.set(v.id, daftar);
}

for (const [idKom, kom] of [...petaKomoditas.entries()].sort()) {
  const jalan = `tanaman/${kom.slug}/`;
  const opt = [...kom.opt].sort((a, b) => a.id.localeCompare(b.id))
    .map((o) => ({ ...o, slug: slugOpt.get(`${idKom}|${o.id}`), ilmiah: ilmiahDari(o.id) }))
    .sort((a, b) => (b.produk - a.produk) || a.nama.localeCompare(b.nama));
  const totalProduk = opt.reduce((a, o) => a + (o.produk ?? 0), 0);
  const harga = hargaMenurutKomoditas.get(idKom);
  const varietas = varietasPerKomoditas.get(idKom) ?? 0;
  const saudara = (varianDari.get(idKom) ?? []).filter((v) => v.id !== idKom);

  const tanya = [
    { t: `OPT apa saja yang punya pestisida terdaftar untuk ${kom.nama}?`,
      j: `${opt.length} OPT punya setidaknya satu produk terdaftar untuk ${kom.nama}. Daftarnya di halaman ini, diurutkan menurut banyaknya produk terdaftar.` },
    { t: `Berapa produk terdaftar untuk ${kom.nama}?`,
      j: `${totalProduk} pendaftaran produk tercatat untuk ${kom.nama}, tersebar di ${opt.length} OPT. Satu produk bisa terdaftar untuk beberapa OPT sekaligus.` },
  ];
  if (varietas) tanya.push({ t: `Ada berapa varietas ${kom.nama} yang terdaftar?`,
    j: `${varietas} varietas ${kom.nama} tercatat di registri perizinan varietas. Yang tercatat keberadaan suratnya — sifat agronominya nol dari seluruh registri, jadi halaman ini tidak menjanjikannya.` });
  const { html: htmlTanya, ld: ldTanya } = blokTanya(tanya);

  const isi = `
  <h2 class="judul-bagian">OPT yang punya produk terdaftar</h2>
  <p class="bantuan">
    Diurutkan menurut banyaknya produk terdaftar — bukan menurut seberapa sering ia jadi
    masalah, karena registri tidak mencatat itu.
  </p>
  <ul class="daftar">
    ${opt.map((o) => `<li>
      <a href="/hama/${teks(kom.slug)}/${teks(o.slug)}/">
        <span class="nama">${teks(o.nama)}${o.ilmiah && o.ilmiah.toLowerCase() !== o.nama.toLowerCase() ? ` <em>${teks(o.ilmiah)}</em>` : ''}</span>
        <span class="sub">${n(o.produk)} produk terdaftar · ${n(o.zat)} bahan aktif${o.dilarang ? ' · ada bahan yang dilarang di sini' : ''}</span>
      </a></li>`).join('\n    ')}
  </ul>
  ${saudara.length ? `<div class="kartu peringatan">
    <h2>Tanaman ini punya varian yang tidak disatukan</h2>
    <p class="catatan">
      Registri mencatatnya terpisah menurut fase atau sistem budidaya, dan menyatukannya
      akan menyatukan pendaftaran yang memang berbeda:
      ${saudara.map((v) => {
        const s = petaKomoditas.get(v.id);
        return s ? `<a href="/tanaman/${teks(s.slug)}/">${teks(v.nama)}</a>` : teks(v.nama);
      }).join(' · ')}
    </p>
  </div>` : ''}
  ${harga ? `<div class="kartu">
    <h2>Harganya</h2>
    <p>${teks(harga.n)} tercatat di seri harga harian — <strong>harga eceran</strong>, bukan
    harga yang diterima petani. <a href="${hargaTerbit(harga) ? `/harga/${teks(harga.k)}/` : `/harga.html?k=${encodeURIComponent(harga.k)}`}">Lihat serinya →</a></p>
  </div>` : ''}
  ${varietas ? `<div class="kartu">
    <h2>Varietasnya</h2>
    <p>${n(varietas)} varietas ${teks(kom.nama)} tercatat di registri perizinan.
    <a href="/jalur-4.html">Cek keabsahan benih &amp; bibit →</a></p>
    <p class="catatan">${teks(meta?.tidakAda?.hasilVarietas ?? '')}</p>
  </div>` : ''}
  ${htmlTanya}
  <details class="batas">
    <summary><h2>Batas yang perlu diketahui sebelum memakai halaman ini</h2></summary>
    <div class="batas-isi">
      <h3>Daftar ini daftar pendaftaran, bukan daftar masalah lapangan</h3>
      <p>Yang tidak punya produk terdaftar tidak muncul di sini — dan itu bukan berarti ia
      tidak menyerang tanaman ini.</p>
      <h3>Satu tanaman bisa punya beberapa nama registri</h3>
      <p>Fase dan sistem budidaya dicatat terpisah. Yang tidak disatukan sengaja tidak
      disatukan.</p>
    </div>
  </details>
  <p class="lain">
    <a href="/jalur-1.html">Masuk dari gejala →</a> ·
    <a href="/produk.html">Cari nama di kemasan →</a> ·
    <a href="/index.html">Beranda</a>
  </p>`;

  simpan(`${jalan}index.html`, halaman({
    jalan,
    judul: `${kom.nama} — OPT terdaftar, varietas, dan harga`,
    deskripsi: `${opt.length} OPT dengan ${totalProduk} pendaftaran produk untuk ${kom.nama}${varietas ? `, ${varietas} varietas terdaftar` : ''}${harga ? ', beserta seri harga eceran hariannya' : ''}. Dari registri Kementan.`,
    jalur: 'Pintu komoditas',
    h1: kom.nama,
    lede: `${n(opt.length)} OPT punya produk terdaftar untuk ${teks(kom.nama)}, ${n(totalProduk)} pendaftaran seluruhnya.`,
    isi,
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'DefinedTerm', name: kom.nama, identifier: idKom, inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'Komoditas registri — Kementerian Pertanian RI' } },
        { '@type': 'ItemList', numberOfItems: opt.length, itemListElement: opt.slice(0, 100).map((o, i) => ({ '@type': 'ListItem', position: i + 1, name: o.nama, item: mutlak(`hama/${kom.slug}/${o.slug}/`) })) },
        remah([{ nama: 'Beranda', jalan: '' }, { nama: kom.nama, jalan }]),
        ...(ldTanya ? [ldTanya] : []),
      ],
    },
    batas: blokBatas({
      sumber: [
        { dari: 'pestisida', cakupan: `OPT dan jumlah produk terdaftar untuk ${kom.nama}` },
        ...(varietas ? [{ dari: 'varietas', cakupan: `jumlah varietas ${kom.nama} yang punya surat` }] : []),
      ],
      takDijawab: ['gejalaOptRegistri', 'phi', ...(varietas ? ['hasilVarietas'] : [])],
    }, jalan),
  }));
  urlTemplate.tanaman.push([jalan, TARIKAN.pestisida]);
}


// ---------------------------------------------------------------------------
// Slug produk — dihitung lebih dulu, karena halaman setara menaut ke sini
// ---------------------------------------------------------------------------
// Nomor pendaftaran ikut masuk slug supaya URL-nya tidak bergantung nama saja: 271 nomor
// dipakai lebih dari satu produk dan nama produk berulang lebih sering lagi. Yang tetap
// bertabrakan sesudah itu diberi ekor id.
const slugProdukBuat = pembuatSlug();
const slugProduk = new Map();
for (const [id, pr] of [...produkPenuh.entries()].sort()) {
  slugProduk.set(id, slugProdukBuat.ambil(`${pr.nama}-${pr.daftar ?? ''}`, id));
}
const tautHalamanProduk = (id, nama) => (slugProduk.has(id)
  ? `<a href="/produk/${teks(slugProduk.get(id))}/">${teks(nama)}</a>`
  : teks(nama));

// ---------------------------------------------------------------------------
// Template 5 — setara: merek yang isinya sama persis
// ---------------------------------------------------------------------------
// Ini satu-satunya template yang tidak punya pesaing sama sekali di hasil pencarian
// (docs/19 §3). Ia menjawab "pengganti X apa?" tanpa pernah menyebut mana yang lebih
// murah — harga memang tidak ada di registri, dan mengarangnya akan menjual sesuatu.
const sebutanIsi = (isi) => (isi ?? []).map((i) => `${i.nama} ${angkaId(i.nilai)} ${i.satuan}`).join(' + ');
const slugSetaraBuat = pembuatSlug();
const setaraProduk = new Map();     // id produk -> {slug, jumlah}
const kelompokSetara = [];
for (const f of berkasDi('setara')) {
  const pecahan = f.replace(/\.json$/, '');
  for (const [grup, anggota] of Object.entries(baca(`setara/${f}`))) {
    if ((anggota ?? []).length < 2) continue;
    kelompokSetara.push({ kunci: `${pecahan}:${grup}`, anggota });
  }
}
kelompokSetara.sort((a, b) => a.kunci.localeCompare(b.kunci));

let setaraTanpaKomposisi = 0;
for (const kel of kelompokSetara) {
  const contoh = produkPenuh.get(kel.anggota[0].i);
  const isi = contoh?.isi ?? [];
  // Kelompok yang contohnya tak berkomposisi tidak bisa ditulis judulnya. Ia dilewati dan
  // dihitung, bukan diterbitkan dengan judul kosong.
  if (!isi.length) { setaraTanpaKomposisi++; continue; }
  const jenis = contoh.jenis;
  const nama = sebutanIsi(isi);
  const dasar = isi.map((i) => `${slug(i.nama)}-${angkaId(i.nilai).replace(',', '.')}-${slug(i.satuan)}`).join('-plus-');
  const sSetara = slugSetaraBuat.ambil(dasar, kel.kunci);
  const jalan = `setara/${sSetara}/`;
  const anggota = [...kel.anggota].sort((a, b) => String(a.p ?? '').localeCompare(String(b.p ?? '')));
  for (const a of anggota) setaraProduk.set(a.i, { slug: sSetara, jumlah: anggota.length });

  // Dosis diambil dari rekaman tiap anggota, bukan dari kelompoknya: itu justru inti
  // halaman ini — isinya sama, dosis terdaftarnya belum tentu.
  const dosisAnggota = anggota.map((a) => {
    const pr = produkPenuh.get(a.i);
    const d = [...new Set((pr?.guna ?? []).map((g) => g.dosis).filter(Boolean))];
    return { ...a, dosis: d, status: pr?.status, berlaku: pr?.berlaku };
  });
  const dosisBerbeda = new Set(dosisAnggota.flatMap((a) => a.dosis)).size;

  const tanya = [
    { t: `Merek apa saja yang isinya sama persis dengan ${nama}?`,
      j: `${anggota.length} merek terdaftar membawa bahan dan kadar yang identik: ${anggota.slice(0, 6).map((a) => a.n).join(', ')}${anggota.length > 6 ? `, dan ${anggota.length - 6} lainnya` : ''}. Kesetaraan dihitung dari id bahan, bukan dari kemiripan nama.` },
    { t: `Kalau isinya sama, apakah dosisnya sama?`,
      j: dosisBerbeda > 1
        ? `Tidak. Ada ${dosisBerbeda} dosis terdaftar yang berbeda di antara merek-merek ini, karena dosis milik pendaftaran tiap produk — bukan milik bahannya.`
        : `Dosis milik pendaftaran tiap produk, bukan milik bahannya. Untuk kelompok ini registri tidak mencatat dosis yang berbeda-beda, tetapi itu keadaan datanya, bukan jaminan.` },
    { t: `Mana yang paling murah?`,
      j: `Halaman ini tidak tahu, dan tidak akan menebak: harga tidak ada di registri. Yang bisa dilakukan halaman ini adalah menyebut mana saja yang isinya sama, supaya perbandingan harganya dilakukan sendiri di kios.` },
  ];
  const { html: htmlTanya, ld: ldTanya } = blokTanya(tanya);

  const isiHtml = `
  <div class="kartu">
    <h2>Isi yang dipakai bersama</h2>
    <div class="pembungkus-tabel">
      <table>
        <thead><tr><th>Bahan</th><th>Kadar</th></tr></thead>
        <tbody>${isi.map((i) => {
          const b = petaBahan.get(i.zat);
          return `
          <tr><td>${b ? `<a href="/bahan/${teks(b.slug)}/">${teks(i.nama)}</a>` : teks(i.nama)}</td>
              <td class="angka">${teks(angkaId(i.nilai))} ${teks(i.satuan)}</td></tr>`;
        }).join('')}</tbody>
      </table>
    </div>
    <p class="catatan">
      Kesetaraan dihitung dari <strong>id bahan</strong>, tidak pernah dari label.
      Mengelompokkan menurut label akan memecah satu bahan jadi beberapa kelompok dan
      menaksir kesetaraan terlalu rendah.
    </p>
  </div>
  <h2 class="judul-bagian">${n(anggota.length)} merek terdaftar dengan isi ini</h2>
  ${CATATAN_URUTAN}
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>Merek</th><th>Nomor pendaftaran</th><th>Pemegang pendaftaran</th><th>Dosis terdaftar</th></tr></thead>
      <tbody>${dosisAnggota.map((a) => `
        <tr><td>${tautHalamanProduk(a.i, a.n)}</td><td class="angka">${teks(a.p ?? '—')}</td>
            <td>${tautBadan(a.pk, a.k)}</td>
            <td class="angka">${a.dosis.length ? teks(a.dosis.slice(0, 3).join('; ')) : '—'}</td></tr>`).join('')}</tbody>
    </table>
  </div>
  ${htmlTanya}
  <details class="batas">
    <summary><h2>Batas yang perlu diketahui sebelum memakai halaman ini</h2></summary>
    <div class="batas-isi">
      <h3>Isi sama bukan berarti dosis sama</h3>
      <p>Dosis milik pendaftaran tiap produk. Dua produk dengan bahan dan kadar identik
      bisa punya dosis terdaftar yang berbeda, dan bisa terdaftar untuk tanaman yang
      berbeda.</p>
      <h3>Yang sama isinya, bukan mutunya</h3>
      <p>Formulasi, bahan pembawa, dan kendali mutu pabrik tidak masuk registri — dan
      karena itu tidak ada di halaman ini.</p>
      <h3>Harga tidak ada di sini</h3>
      <p>${teks(meta?.tidakAda?.harga ?? 'Registri tidak memuat harga.')}</p>
    </div>
  </details>
  <p class="lain">
    <a href="/produk.html">Cari nama di kemasan →</a> ·
    ${jenis === 'pupuk' ? '<a href="/jalur-3.html">Hitung rupiah per kg hara →</a> ·' : ''}
    <a href="/index.html">Beranda</a>
  </p>`;

  simpan(`${jalan}index.html`, halaman({
    jalan,
    judul: `${nama} — ${anggota.length} merek terdaftar dengan isi identik`,
    deskripsi: `${anggota.length} merek ${jenis} terdaftar membawa ${nama} — bahan dan kadar yang sama persis, beserta nomor pendaftaran, pemegang, dan dosis berlabel masing-masing.`,
    jalur: 'Jalur 2 · masuk dari kemasan',
    h1: nama,
    lede: `${n(anggota.length)} merek terdaftar isinya <strong>sama persis</strong>. Yang belum tentu sama: dosis terdaftarnya, dan tanaman yang boleh disasarnya.`,
    isi: isiHtml,
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        daftarMerek(anggota.map((a) => ({ nama: a.n, daftar: a.p }))),
        remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Isi identik', jalan: null }, { nama, jalan }]),
        ...(ldTanya ? [ldTanya] : []),
      ],
    },
    batas: blokBatas({
      sumber: [{ dari: jenis === 'pupuk' ? 'pupuk' : 'pestisida', cakupan: `komposisi, nomor pendaftaran, pemegang, dan dosis berlabel ${anggota.length} produk berisi identik` }],
      takDijawab: jenis === 'pupuk' ? ['isiKarung', 'beratJenis', 'harga'] : ['dosisKosong', 'namaDagang', 'harga'],
    }, jalan),
  }));
  urlTemplate.setara.push([jalan, jenis === 'pupuk' ? TARIKAN.pupuk : TARIKAN.pestisida]);
}

// ---------------------------------------------------------------------------
// Template 6 — produk
// ---------------------------------------------------------------------------
const BATAS_GUNA = 120;
let produkNoindex = 0; let produkBergambar = 0; let gunaDitahan = 0; let gunaTanpaPintu = 0;
for (const [id, pr] of [...produkPenuh.entries()].sort()) {
  const jalan = `produk/${slugProduk.get(id)}/`;
  const guna = [...(pr.guna ?? [])].sort((a, b) =>
    String(a.komoditasNama ?? '').localeCompare(String(b.komoditasNama ?? '')) ||
    String(a.optNama ?? '').localeCompare(String(b.optNama ?? '')));
  const isi = pr.isi ?? [];
  const kadaluwarsa = pr.status === 'expired';
  const setara = setaraProduk.get(id);
  const kandungan = kandunganProduk.get(id);

  // Gerbang tipis docs/19 §6: pestisida tanpa penggunaan berlabel dan pupuk tanpa
  // komposisi tidak punya isi yang cukup untuk berdiri sendiri di hasil pencarian.
  // Halamannya tetap ada — tautan dari halaman lain tidak boleh 404 — tapi noindex.
  const tipis = (pr.jenis === 'pestisida' && !guna.length) || (pr.jenis === 'pupuk' && !isi.length);
  if (tipis) produkNoindex++;
  const gambar = gambarTerindeks ? (pr.gambar ?? []) : (pr.gambar ?? []);
  if (gambar.length) produkBergambar++;
  const arahan = [tipis ? 'noindex,follow' : null, gambar.length && !gambarTerindeks ? 'noimageindex' : null]
    .filter(Boolean).join(', ') || null;

  const gunaTampil = guna.slice(0, BATAS_GUNA);
  gunaDitahan += guna.length - gunaTampil.length;
  const barisGuna = gunaTampil.map((g) => {
    const kom = petaKomoditas.get(g.komoditas);
    const sOpt = slugOpt.get(`${g.komoditas}|${g.opt}`);
    const t = perTangki(g.dosis);
    if (t) dosisTerkonversi++;
    // Sebagian penggunaan berlabel tidak punya pintu OPT di indeks (lihat terbuang.tanpaOpt
    // di bangun-indeks.mjs). Barisnya tetap ditampilkan tanpa tautan — menghilangkannya
    // akan membuat daftar penggunaan produk ini tampak lebih pendek daripada labelnya.
    if (!(kom && sOpt)) gunaTanpaPintu++;
    return `
      <tr><td>${kom ? `<a href="/tanaman/${teks(kom.slug)}/">${teks(g.komoditasNama)}</a>` : teks(g.komoditasNama ?? '—')}</td>
          <td>${kom && sOpt ? `<a href="/hama/${teks(kom.slug)}/${teks(sOpt)}/">${teks(g.optNama)}</a>` : teks(g.optNama ?? '—')}</td>
          <td class="angka">${teks(g.dosis ?? '—')}</td>
          <td class="angka">${t ? teks(t) : '—'}</td></tr>`;
  }).join('');

  const kartuGambar = gambar.length ? `
  <figure class="kemasan">
    <img src="/gambar/${teks(gambar[0].f)}" width="${teks(gambar[0].w)}" height="${teks(gambar[0].h)}"
         alt="Kemasan ${teks(pr.nama)}" loading="lazy" decoding="async">
    <figcaption class="catatan">
      Gambar kemasan dari ${teks(gambar[0].penerbit ?? 'situs pemegang pendaftaran')}${gambar[0].halaman ? ` — <a href="${teks(gambar[0].halaman)}" rel="noopener noreferrer nofollow">halaman asalnya</a>` : ''}.
      Haknya milik pemegang pendaftaran; ditampilkan untuk mengenali produk, tidak diubah
      rupa, dan izin tertulisnya belum diminta.
      <a href="${teks(alamatKeberatanGambar(pr.nama, jalan))}" rel="noopener noreferrer nofollow">Pemegang
      hak yang keberatan bisa meminta pencabutannya →</a>
    </figcaption>
  </figure>` : '';

  const tanya = [];
  if (pr.jenis === 'pestisida') {
    tanya.push({ t: `${pr.nama} untuk hama apa?`,
      j: guna.length
        ? `Terdaftar untuk ${guna.length} penggunaan berlabel, di antaranya ${gunaTampil.slice(0, 5).map((g) => `${g.optNama} pada ${g.komoditasNama}`).join('; ')}. Yang dicatat penggunaan berlabel — bukan hasil uji kemanjuran.`
        : `Registri tidak mencatat satu pun penggunaan berlabel untuk pendaftaran ini. Kosongnya ada di sumbernya, bukan di halaman ini.` });
  }
  if (isi.length) {
    tanya.push({ t: `Apa isi ${pr.nama}?`, j: `${sebutanIsi(isi)}. Itu yang tercatat di pendaftarannya — bukan hasil uji isi kemasan.` });
  }
  const adaTangkiGuna = gunaTampil.filter((g) => perTangki(g.dosis));
  if (adaTangkiGuna.length) {
    tanya.push({ t: `Berapa takaran ${pr.nama} untuk satu tangki ${TANGKI} liter?`,
      j: `Untuk penggunaan yang dosisnya per liter, kalikan dengan ${TANGKI}: ${adaTangkiGuna[0].dosis} menjadi ${perTangki(adaTangkiGuna[0].dosis)} per tangki. Dosis per hektare tidak bisa dikonversi tanpa volume semprot hasil kalibrasi sendiri.` });
  }
  tanya.push({ t: `${pr.nama} terdaftar sampai kapan?`,
    j: pr.berlaku
      ? `Nomor pendaftarannya ${pr.daftar}, berlaku sampai ${pr.berlaku}${kadaluwarsa ? ' — dan tanggal itu sudah lewat menurut tarikan terakhir' : ''}. Halaman ini menyebut tanggalnya, bukan kesimpulan hukum atas boleh-tidaknya dipakai.`
      : `Registri tidak mencatat tanggal berlakunya untuk pendaftaran ini.` });
  if (setara) {
    tanya.push({ t: `Ada merek lain yang isinya sama dengan ${pr.nama}?`,
      j: `Ada ${setara.jumlah - 1} merek lain dengan bahan dan kadar yang identik. Yang belum tentu sama: dosis terdaftar dan tanaman sasarannya.` });
  }
  const { html: htmlTanya, ld: ldTanya } = blokTanya(tanya);

  const isiHtml = `
  <div class="kartu">
    <h2>Yang tercatat di pendaftarannya</h2>
    <div class="pembungkus-tabel">
      <table>
        <tbody>
          <tr><td>Nomor pendaftaran</td><td class="angka">${teks(pr.daftar ?? '—')}</td></tr>
          <tr><td>Pemegang pendaftaran</td><td>${pr.pcp?.key ? tautBadan(pr.pcp.key, pr.pcp.nama ?? pr.produsen) : teks(pr.produsen ?? '—')}</td></tr>
          <tr><td>Berlaku sampai</td><td class="angka">${teks(pr.berlaku ?? '—')}${kadaluwarsa ? ' — sudah lewat' : ''}</td></tr>
          <tr><td>Bentuk</td><td>${teks(pr.bentuk ?? '—')}</td></tr>
          <tr><td>Jenis</td><td>${teks(pr.jenis)}</td></tr>
        </tbody>
      </table>
    </div>
    ${kadaluwarsa ? `<p class="catatan"><strong>Masa berlakunya sudah lewat menurut tarikan terakhir.</strong> Yang ditampilkan tanggal apa adanya — halaman ini tidak menyimpulkan boleh atau tidak boleh diedarkan.</p>` : ''}
  </div>
  ${kartuGambar}
  ${isi.length ? `
  <h2 class="judul-bagian">Isinya</h2>
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>${pr.jenis === 'pupuk' ? 'Hara' : 'Bahan aktif'}</th><th>Kadar</th></tr></thead>
      <tbody>${isi.map((i) => {
        const b = petaBahan.get(i.zat);
        return `
        <tr><td>${b ? `<a href="/bahan/${teks(b.slug)}/">${teks(i.nama)}</a>` : teks(i.nama)}</td>
            <td class="angka">${teks(angkaId(i.nilai))} ${teks(i.satuan)}</td></tr>`;
      }).join('')}</tbody>
    </table>
  </div>` : `
  <div class="kartu peringatan">
    <h2>Registri tidak mencatat komposisinya</h2>
    <p class="catatan">Yang ada hanya nama dan nomor pendaftarannya. Kosongnya ada di sumbernya, dan halaman ini tidak menambalnya dengan tebakan.</p>
  </div>`}
  ${setara ? `
  <div class="kartu">
    <h2>Merek lain yang isinya sama persis</h2>
    <p>${n(setara.jumlah - 1)} merek terdaftar lain membawa bahan dan kadar yang identik.
    <a href="/setara/${teks(setara.slug)}/">Lihat seluruhnya →</a></p>
    <p class="catatan">Yang sama isinya, bukan mutunya — dan dosis terdaftarnya bisa berbeda.</p>
  </div>` : ''}
  ${kandungan ? `
  <div class="kartu">
    <h2>Pupuk lain dengan kandungan yang sama</h2>
    <p>${n(kandungan.jumlah - 1)} pupuk terdaftar lain membawa kandungan ${teks(kandungan.nama)}.
    <a href="/kandungan/${teks(kandungan.slug)}/">Lihat seluruhnya →</a></p>
  </div>` : ''}
  ${guna.length ? `
  <h2 class="judul-bagian">Terdaftar untuk apa</h2>
  <p class="bantuan">${n(guna.length)} penggunaan berlabel. Kolom tangki cuma perkalian dosis per liter × ${TANGKI} liter; dosis per hektare tidak dikonversi.</p>
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>Tanaman</th><th>OPT</th><th>Dosis terdaftar</th><th>Per tangki ${TANGKI} L</th></tr></thead>
      <tbody>${barisGuna}</tbody>
    </table>
  </div>
  ${guna.length > gunaTampil.length ? `<p class="catatan">${n(guna.length - gunaTampil.length)} penggunaan lain tidak ditabelkan di halaman ini supaya tetap ringan.</p>` : ''}` : (pr.jenis === 'pestisida' ? `
  <div class="kartu peringatan">
    <h2>Tidak ada penggunaan berlabel yang tercatat</h2>
    <p class="catatan">Registri memuat pendaftarannya, tetapi tidak memuat satu pun tanaman dan OPT yang disasarnya. Halaman ini tidak menebak sasarannya.</p>
  </div>` : '')}
  ${htmlTanya}
  <details class="batas">
    <summary><h2>Batas yang perlu diketahui sebelum memakai halaman ini</h2></summary>
    <div class="batas-isi">
      <h3>Nama di kemasan bisa berbeda dari nama terdaftar</h3>
      <p>${teks(meta?.tidakAda?.namaDagang ?? '')}</p>
      <h3>Terdaftar bukan berarti manjur, dan bukan berarti asli</h3>
      <p>Registri mendaftarkan; ia tidak menguji, dan ia tidak memeriksa isi kemasan yang
      beredar. Halaman ini memeriksa label terhadap registri, bukan isi terhadap label.</p>
      ${kadaluwarsa ? `<h3>Masa berlakunya sudah lewat</h3><p>Tanggal ditampilkan apa adanya. Apa yang boleh dilakukan terhadap stok yang sudah terlanjur ada bukan kesimpulan yang ditarik halaman ini.</p>` : ''}
    </div>
  </details>
  <p class="lain">
    <a href="/produk.html">Cari nama lain di kemasan →</a> ·
    <a href="/takaran.html">Kalibrasi &amp; takaran semprot →</a> ·
    ${pr.pcp?.key ? `<a href="${KUNCI_BADAN.has(pr.pcp.key) ? `/badan/${teks(pr.pcp.key)}/` : `/principal.html?key=${encodeURIComponent(pr.pcp.key)}`}">Profil pemegang pendaftaran →</a> ·` : ''}
    <a href="/index.html">Beranda</a>
  </p>`;

  simpan(`${jalan}index.html`, halaman({
    jalan,
    robots: arahan,
    judul: `${pr.nama} — isi, nomor pendaftaran, dan dosis berlabelnya${kadaluwarsa ? ' (izin berakhir)' : ''}`,
    deskripsi: `${pr.nama}: ${isi.length ? sebutanIsi(isi) : 'komposisi tidak tercatat di registri'}. Nomor pendaftaran ${pr.daftar ?? '—'}${guna.length ? `, ${guna.length} penggunaan berlabel beserta dosisnya` : ''}${setara ? `, ${setara.jumlah - 1} merek lain berisi identik` : ''}.`,
    jalur: 'Jalur 2 · masuk dari kemasan',
    h1: pr.nama,
    lede: `${teks(pr.jenis === 'pupuk' ? 'Pupuk' : 'Pestisida')} terdaftar atas nama ${teks(pr.pcp?.nama ?? pr.produsen ?? '—')}${kadaluwarsa ? ', <strong>masa berlakunya sudah lewat</strong>' : ''}. Yang ditampilkan isi pendaftarannya — bukan penilaian atasnya.`,
    isi: isiHtml,
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'DefinedTerm', name: pr.nama, identifier: pr.daftar ?? id,
          inDefinedTermSet: { '@type': 'DefinedTermSet', name: pr.jenis === 'pupuk' ? 'Registri pupuk terdaftar — Kementerian Pertanian RI' : 'Registri pestisida terdaftar — Kementerian Pertanian RI' },
        },
        ...(guna.length ? [{ '@type': 'ItemList', numberOfItems: guna.length, itemListElement: gunaTampil.slice(0, 100).map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: `${g.optNama} pada ${g.komoditasNama}` })) }] : []),
        remah([{ nama: 'Beranda', jalan: '' }, { nama: pr.jenis === 'pupuk' ? 'Pupuk' : 'Pestisida', jalan: null }, { nama: pr.nama, jalan }]),
        ...(ldTanya ? [ldTanya] : []),
      ],
    },
    batas: blokBatas({
      sumber: [{ dari: pr.jenis === 'pupuk' ? 'pupuk' : 'pestisida', cakupan: `satu pendaftaran: komposisi, pemegang, masa berlaku${guna.length ? ', dan penggunaan berlabelnya' : ''}` }],
      takDijawab: pr.jenis === 'pupuk'
        ? ['isiKarung', 'beratJenis', ...(gambar.length ? [] : ['gambarKemasan'])]
        : ['phi', 'kelasBahayaWho', 'apdProduk', 'namaDagang', 'dosisKosong', ...(gambar.length ? [] : ['gambarKemasan'])],
    }, jalan),
  }));
  if (!tipis) urlTemplate.produk.push([jalan, pr.jenis === 'pupuk' ? TARIKAN.pupuk : TARIKAN.pestisida]);
}


// ---------------------------------------------------------------------------
// Template 7 — badan pemegang pendaftaran
// ---------------------------------------------------------------------------
// Satu rekaman per BADAN, bukan per registri: 19 badan memegang pendaftaran di kedua
// sisi, dan memecahnya akan membelah daftar produknya jadi dua halaman yang
// masing-masing tampak setengah benar.
//
// Pengaya riset web TIDAK ikut ke JSON-LD. Ia tingkat D — datang dari laporan agen riset,
// bukan dari registri — dan menuliskannya sebagai `url` atau `sameAs` pada Organization
// berarti menyatakannya kepada mesin sebagai fakta terverifikasi. Di layar ia tampil
// dengan lencana tingkatnya, seperti di app/principal.js; di data terstruktur ia absen.
const BATAS_BARIS_BADAN = 150;
const BENTUK_LABEL = { tidak_diketahui: 'tidak tercatat' };
const SEKTOR_LABEL = { pesticide: 'pestisida', fertilizer: 'pupuk', seed: 'benih' };
const namaKeKomoditas = new Map([...petaKomoditas.values()].map((k) => [k.nama.toLowerCase(), k]));
const alamatAman = (x) => {
  const t = String(x ?? '').trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(t)) return `https://${t}`;
  return null;
};
let badanBerpengaya = 0; let barisBadanDitahan = 0; let kunciBadanAneh = 0;

for (const f of berkasDi('principal')) {
  const b = baca(`principal/${f}`);
  if (!/^[a-z0-9-]+$/.test(b.key ?? '')) { kunciBadanAneh++; continue; }
  const jalan = `badan/${b.key}/`;
  const punya = b.punya ?? {};
  const jumlah = (punya.pesticide ?? 0) + (punya.fertilizer ?? 0) + (punya.seed ?? 0);
  const daftar = b.daftar ?? [];
  const produk = daftar.filter((x) => x.j === 'pupuk' || x.j === 'pestisida')
    .sort((x, y) => String(x.d ?? '').localeCompare(String(y.d ?? '')));
  const varietas = daftar.filter((x) => x.j === 'varietas')
    .sort((x, y) => String(x.n).localeCompare(String(y.n)));
  const produkTampil = produk.slice(0, BATAS_BARIS_BADAN);
  const varietasTampil = varietas.slice(0, BATAS_BARIS_BADAN);
  barisBadanDitahan += (produk.length - produkTampil.length) + (varietas.length - varietasTampil.length);

  const sektor = (b.sektor ?? []).map((x) => SEKTOR_LABEL[x] ?? x);
  const pegang = Object.entries(punya).filter(([, v]) => v > 0)
    .map(([k, v]) => `${n(v)} ${SEKTOR_LABEL[k] ?? k}`).join(', ');

  const g = b.pengaya;
  if (g) badanBerpengaya++;
  const situs = g ? alamatAman(g.website) : null;
  const kartuPengaya = g ? `
  <div class="kartu pengaya">
    <h2>Yang disebut riset web, dan kenapa ia belum bisa dipercaya</h2>
    <p><span class="lencana lencana-d">Tingkat D · belum diverifikasi</span></p>
    <div class="pembungkus-tabel">
      <table>
        <tbody>
          ${g.parent_group ? `<tr><td>Grup induk</td><td>${teks(g.parent_group)}</td></tr>` : ''}
          ${g.origin ? `<tr><td>Negara asal</td><td>${teks(g.origin)}</td></tr>` : ''}
          ${g.activity_status ? `<tr><td>Status keaktifan</td><td>${teks(g.activity_status)}</td></tr>` : ''}
          ${situs ? `<tr><td>Situs</td><td><a href="${teks(situs)}" rel="nofollow noopener noreferrer external">${teks(g.website)}</a></td></tr>` : ''}
        </tbody>
      </table>
    </div>
    ${(g.umbrella_brands ?? []).length ? `<p class="catatan">Merek payung yang disebut: ${teks((g.umbrella_brands ?? []).join(', '))}</p>` : ''}
    <p class="catatan"><strong>Kenapa tingkat D:</strong> ${teks(g.tier_reason ?? 'belum ditetapkan')}</p>
    ${g.source ? `<p class="catatan">Sumber yang dicatat riset: ${teks(g.source)}</p>` : ''}
  </div>` : '';

  const tanya = [
    { t: `Produk apa saja yang terdaftar atas nama ${b.nama}?`,
      j: `${n(jumlah)} pendaftaran tercatat atas namanya: ${pegang || 'tidak ada'}. Daftarnya ada di halaman ini, urut nomor pendaftaran.` },
  ];
  if (produk.length) {
    tanya.push({ t: `Berapa merek pupuk dan pestisida yang dipegang ${b.nama}?`,
      j: `${produk.length} merek terdaftar, di antaranya ${produkTampil.slice(0, 5).map((x) => x.n).join(', ')}${produk.length > 5 ? `, dan ${produk.length - 5} lainnya` : ''}.` });
  }
  if (b.benih?.first_year) {
    tanya.push({ t: `Sejak kapan ${b.nama} mendaftarkan varietas?`,
      j: `Pendaftaran varietas tercatat dari ${b.benih.first_year} sampai ${b.benih.last_year ?? b.benih.first_year}${b.benih.main_commodity ? `, terbanyak pada ${b.benih.main_commodity}` : ''}${b.benih.top_permit_kind ? `, dengan surat terbanyak berupa ${b.benih.top_permit_kind}` : ''}.` });
  }
  const { html: htmlTanya, ld: ldTanya } = blokTanya(tanya);

  const isiHtml = `
  <div class="kartu">
    <h2>Yang tercatat di registri</h2>
    <div class="pembungkus-tabel">
      <table>
        <tbody>
          <tr><td>Bentuk badan</td><td>${teks(BENTUK_LABEL[b.bentuk] ?? b.bentuk ?? 'tidak tercatat')}</td></tr>
          <tr><td>Sektor</td><td>${teks(sektor.join(', ') || '—')}</td></tr>
          <tr><td>Pendaftaran</td><td>${teks(pegang || '—')}</td></tr>
          ${b.benih?.first_year ? `<tr><td>Rentang pendaftaran varietas</td><td class="angka">${teks(b.benih.first_year)}–${teks(b.benih.last_year ?? b.benih.first_year)}</td></tr>` : ''}
          ${b.benih?.main_commodity ? `<tr><td>Komoditas benih terbanyak</td><td>${teks(b.benih.main_commodity)}</td></tr>` : ''}
        </tbody>
      </table>
    </div>
    <p class="catatan">
      Satu rekaman per <strong>badan</strong>, bukan per registri: badan yang memegang
      pendaftaran di kedua sisi tetap satu halaman, supaya daftarnya tidak terbelah jadi
      dua yang masing-masing tampak setengah benar.
    </p>
  </div>
  ${kartuPengaya}
  ${produk.length ? `
  <h2 class="judul-bagian">${n(produk.length)} merek pupuk &amp; pestisida terdaftar</h2>
  ${CATATAN_URUTAN}
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>Merek</th><th>Jenis</th><th>Nomor pendaftaran</th></tr></thead>
      <tbody>${produkTampil.map((x) => `
        <tr><td>${tautHalamanProduk(x.i, x.n)}</td><td>${teks(x.j)}</td><td class="angka">${teks(x.d ?? '—')}</td></tr>`).join('')}</tbody>
    </table>
  </div>
  ${produk.length > produkTampil.length ? `<p class="catatan">${n(produk.length - produkTampil.length)} merek lain tidak ditabelkan di halaman ini supaya tetap ringan. Seluruhnya bisa ditelusuri di <a href="/principal.html?key=${encodeURIComponent(b.key)}">profil yang bisa ditelusuri</a>.</p>` : ''}` : ''}
  ${varietas.length ? `
  <h2 class="judul-bagian">${n(varietas.length)} varietas terdaftar</h2>
  <p class="bantuan">
    Yang tercatat <strong>keberadaan suratnya</strong>, bukan sifat agronominya —
    ${teks(meta?.tidakAda?.hasilVarietas ?? 'registri tidak memuat potensi hasil')}
  </p>
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>Varietas</th><th>Komoditas</th></tr></thead>
      <tbody>${varietasTampil.map((x) => {
        const kom = x.k ? namaKeKomoditas.get(String(x.k).toLowerCase()) : null;
        return `
        <tr><td><a href="/jalur-4.html?id=${encodeURIComponent(x.i)}&amp;pecahan=${encodeURIComponent(x.p)}">${teks(x.n)}</a></td>
            <td>${kom ? `<a href="/tanaman/${teks(kom.slug)}/">${teks(x.k)}</a>` : teks(x.k ?? '—')}</td></tr>`;
      }).join('')}</tbody>
    </table>
  </div>
  ${varietas.length > varietasTampil.length ? `<p class="catatan">${n(varietas.length - varietasTampil.length)} varietas lain tidak ditabelkan di halaman ini.</p>` : ''}` : ''}
  ${htmlTanya}
  <details class="batas">
    <summary><h2>Batas yang perlu diketahui sebelum memakai halaman ini</h2></summary>
    <div class="batas-isi">
      <h3>Nama pemegang pendaftaran bukan nama pabrik</h3>
      <p>Yang dicatat registri badan yang memegang izinnya. Siapa yang memformulasi,
      mengemas, dan memasarkan bisa badan lain, dan registri tidak mencatatnya.</p>
      <h3>Daftar ini bukan katalog jualan</h3>
      <p>Yang ditampilkan pendaftaran yang tercatat, termasuk yang masa berlakunya sudah
      lewat. Halaman ini tidak tahu apa yang benar-benar beredar hari ini.</p>
      <h3>Yang datang dari riset web dipisah, dan diberi tingkatnya sendiri</h3>
      <p>Grup induk, negara asal, situs, dan merek payung bukan isi registri. Ia tingkat D
      — belum diverifikasi ke sumber aslinya — dan karena itu tidak ikut ke data
      terstruktur halaman ini.</p>
    </div>
  </details>
  <p class="lain">
    <a href="/principal.html?key=${encodeURIComponent(b.key)}">Profil yang bisa ditelusuri →</a> ·
    <a href="/produk.html">Cari nama di kemasan →</a> ·
    <a href="/index.html">Beranda</a>
  </p>`;

  simpan(`${jalan}index.html`, halaman({
    jalan,
    judul: `${b.nama} — ${pegang || 'pendaftaran'} terdaftar`,
    deskripsi: `${b.nama}${b.bentuk && b.bentuk !== 'tidak_diketahui' ? ` (${b.bentuk})` : ''} memegang ${pegang || 'pendaftaran'} di registri Kementan. Daftar mereknya, nomor pendaftarannya, dan varietas yang didaftarkannya.`,
    jalur: 'Profil pemegang pendaftaran',
    h1: b.nama,
    lede: `${teks(pegang || 'Tidak ada pendaftaran tercatat')}. Yang ditampilkan <strong>isi registri</strong> — bukan penilaian atas badannya.`,
    isi: isiHtml,
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', name: b.nama, identifier: b.id },
        ...(produk.length ? [{ '@type': 'ItemList', numberOfItems: produk.length, itemListElement: produkTampil.slice(0, 100).map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.n, ...(x.d ? { identifier: x.d } : {}) })) }] : []),
        remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Pemegang pendaftaran', jalan: null }, { nama: b.nama, jalan }]),
        ...(ldTanya ? [ldTanya] : []),
      ],
    },
    batas: blokBatas({
      sumber: [
        { dari: 'principal', cakupan: `satu badan: bentuk, sektor, dan ${n(jumlah)} pendaftaran yang dipegangnya` },
        ...(punya.pesticide ? [{ dari: 'pestisida', cakupan: 'merek pestisida yang dipegangnya' }] : []),
        ...(punya.fertilizer ? [{ dari: 'pupuk', cakupan: 'merek pupuk yang dipegangnya' }] : []),
        ...(punya.seed ? [{ dari: 'varietas', cakupan: 'varietas yang didaftarkannya, beserta suratnya' }] : []),
      ],
      takDijawab: ['namaDagang', 'gambarKemasan', ...(punya.seed ? ['hasilVarietas'] : [])],
    }, jalan),
  }));
  urlTemplate.badan.push([jalan, TARIKAN.pestisida ?? TARIKAN.pupuk]);
}


// ---------------------------------------------------------------------------
// Template 8 — harga komoditas
// ---------------------------------------------------------------------------
// SP2KP menerbitkan 96 varian, dan 41 di antaranya baja ringan serta besi beton. Yang di
// luar misi TIDAK diterbitkan sama sekali: halaman harga besi beton di sini hanya akan
// mendatangkan orang yang salah dan mengencerkan topiknya.
//
// Komentar seri ikut, tetapi hanya yang `sumber: terhitung` — kalimat yang diturunkan
// dari angkanya sendiri dan lolos pemeriksa. Yang ditulis model tidak diterbitkan sampai
// seorang manusia menempelkan namanya (docs/18-tinjauan-komentar-harga.md).
const rupiah = (x) => 'Rp' + Math.round(Number(x)).toLocaleString('id-ID');
const persenUbah = (x) => (x == null ? null : `${x > 0 ? '+' : ''}${angkaId(x)}%`);
let hargaLuar = 0; let komentarDitahan = 0;

function grafikSeri(seri) {
  // Grafik dirakit di sini, bukan di peramban: halaman ini harus utuh sebelum satu baris
  // skrip berjalan. Titiknya dibulatkan satu desimal supaya keluarannya deterministik.
  if (seri.length < 2) return '';
  const L = 8; const A = 600; const T = 160;
  const nilai = seri.map((x) => x.p);
  const min = Math.min(...nilai); const maks = Math.max(...nilai);
  const rentang = maks - min || 1;
  const x = (i) => (L + (i * (A - 2 * L)) / (seri.length - 1)).toFixed(1);
  const y = (v) => (T - L - ((v - min) * (T - 2 * L)) / rentang).toFixed(1);
  const titik = seri.map((s2, i) => `${x(i)},${y(s2.p)}`).join(' ');
  return `
  <svg class="grafik" viewBox="0 0 ${A} ${T}" role="img" preserveAspectRatio="none"
       aria-label="Grafik harga ${seri[0].t} sampai ${seri[seri.length - 1].t}, terendah ${rupiah(min)}, tertinggi ${rupiah(maks)}">
    <polyline class="g-garis" fill="none" stroke="currentColor" stroke-width="1.5" points="${titik}"></polyline>
  </svg>
  <p class="catatan g-label">
    ${teks(seri[0].t)} — ${teks(seri[seri.length - 1].t)} · terendah ${teks(rupiah(min))} · tertinggi ${teks(rupiah(maks))}
  </p>`;
}

for (const f of berkasDi('harga')) {
  const h = baca(`harga/${f}`);
  if (h.golongan !== 'pangan' && h.golongan !== 'input') { hargaLuar++; continue; }
  const jalan = `harga/${h.key}/`;
  const st = h.statistik ?? {};
  const akhir = st.terakhir ?? null;
  const seri = h.seri ?? [];
  const terakhir14 = seri.slice(-14).reverse();
  const kom = h.komoditas?.id ? petaKomoditas.get(h.komoditas.id) : null;

  // Komentar model tidak diterbitkan. Yang terhitung ikut, dengan sebutan apa adanya:
  // ia dihitung dari angkanya, bukan ditulis orang, dan belum ditinjau siapa pun.
  const kom2 = h.komentar;
  const komentarTerbit = kom2 && kom2.sumber === 'terhitung' && kom2.periksa?.lolos !== false ? kom2 : null;
  if (kom2 && !komentarTerbit) komentarDitahan++;

  const tanya = [];
  if (akhir) {
    tanya.push({ t: `Berapa harga ${h.nama} hari ini?`,
      j: `Angka terakhir yang diterbitkan sumbernya: ${rupiah(akhir.p)} per ${h.satuan} pada ${akhir.t}. Itu harga ECERAN nasional tertimbang penduduk — bukan harga yang diterima petani.` });
  }
  tanya.push({ t: `Apakah ini harga yang diterima petani?`,
    j: `Bukan. ${meta?.tidakAda?.hargaPetani ?? 'Harga yang diterima petani tidak terukur di sumber mana pun yang boleh diterbitkan.'}` });
  tanya.push({ t: `Dari mana angkanya?`,
    j: `Sistem ${h.sistem ?? 'SP2KP'} Kementerian Perdagangan, dasar ${h.dasar ?? 'survei'}, tingkat ${h.tingkat ?? 'eceran'}. Cakupannya ${h.cakupan?.from ?? '—'} sampai ${h.cakupan?.to ?? '—'}, ${n(h.cakupan?.points ?? 0)} titik${h.cakupan?.gaps ? ` dengan ${n(h.cakupan.gaps)} hari kosong` : ''}.` });
  const { html: htmlTanya, ld: ldTanya } = blokTanya(tanya);

  const isiHtml = `
  <div class="kartu">
    <h2>Angka terakhir yang diterbitkan sumbernya</h2>
    ${akhir ? `<p class="harga-besar">${teks(rupiah(akhir.p))} <span class="catatan">per ${teks(h.satuan)} · ${teks(akhir.t)}</span></p>` : '<p class="kosong">Sumber menerbitkan seri ini tanpa satu pun angka.</p>'}
    <div class="pembungkus-tabel">
      <table>
        <tbody>
          ${persenUbah(st.ubah7) ? `<tr><td>7 hari</td><td class="angka">${teks(persenUbah(st.ubah7))}</td></tr>` : ''}
          ${persenUbah(st.ubah30) ? `<tr><td>30 hari</td><td class="angka">${teks(persenUbah(st.ubah30))}</td></tr>` : ''}
          ${persenUbah(st.ubah90) ? `<tr><td>90 hari</td><td class="angka">${teks(persenUbah(st.ubah90))}</td></tr>` : ''}
          ${persenUbah(st.ubah365) ? `<tr><td>Setahun</td><td class="angka">${teks(persenUbah(st.ubah365))}</td></tr>` : ''}
          ${st.min ? `<tr><td>Terendah tercatat</td><td class="angka">${teks(rupiah(st.min.p))} · ${teks(st.min.t)}</td></tr>` : ''}
          ${st.maks ? `<tr><td>Tertinggi tercatat</td><td class="angka">${teks(rupiah(st.maks.p))} · ${teks(st.maks.t)}</td></tr>` : ''}
        </tbody>
      </table>
    </div>
  </div>
  <div class="kartu tabrakan">
    <h2>Ini harga eceran, bukan harga yang diterima petani</h2>
    <p>${teks(komentarTerbit?.batas ?? meta?.tidakAda?.hargaPetani ?? '')}</p>
    <p class="catatan">
      Jaraknya terpasang di dalam definisi sumbernya, bukan di celah cakupannya — harga
      eceran memuat marjin seluruh rantai sesudah petani, dan halaman ini tidak menebak
      berapa besarnya.
    </p>
  </div>
  ${grafikSeri(seri)}
  ${komentarTerbit ? `
  <div class="kartu">
    <h2>Apa yang terbaca dari angkanya</h2>
    <p>${teks(komentarTerbit.teks)}</p>
    <p class="catatan">
      Kalimat ini <strong>dihitung dari serinya sendiri</strong>, bukan ditulis orang, dan
      belum ditinjau siapa pun. Ia lolos pemeriksa angka; itu saja yang bisa dijanjikan.
    </p>
  </div>` : ''}
  ${terakhir14.length ? `
  <h2 class="judul-bagian">Empat belas hari terakhir</h2>
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>Tanggal</th><th>Harga per ${teks(h.satuan)}</th></tr></thead>
      <tbody>${terakhir14.map((x) => `
        <tr><td class="angka">${teks(x.t)}</td><td class="angka">${teks(rupiah(x.p))}</td></tr>`).join('')}</tbody>
    </table>
  </div>` : ''}
  ${htmlTanya}
  <details class="batas">
    <summary><h2>Batas yang perlu diketahui sebelum memakai halaman ini</h2></summary>
    <div class="batas-isi">
      <h3>Nasional, bukan pasar di dekat Anda</h3>
      <p>${teks(meta?.tidakAda?.hargaWilayah ?? 'Harga per provinsi dan per pasar tidak diterbitkan di sini.')}</p>
      <h3>Hari kosong bukan harga nol</h3>
      <p>Sumbernya tidak menerbitkan angka tiap hari. Yang kosong dilewati, tidak
      ditambal dengan tebakan${h.cakupan?.gaps ? ` — ${n(h.cakupan.gaps)} hari kosong pada seri ini` : ''}.</p>
    </div>
  </details>
  <p class="lain">
    <a href="/harga.html?k=${encodeURIComponent(h.key)}">Buka versi yang bisa ditelusuri →</a> ·
    ${kom ? `<a href="/tanaman/${teks(kom.slug)}/">${teks(kom.nama)} — OPT &amp; varietasnya →</a> ·` : ''}
    <a href="/usaha.html">Hitung titik impas usaha tani →</a> ·
    <a href="/index.html">Beranda</a>
  </p>`;

  simpan(`${jalan}index.html`, halaman({
    jalan,
    judul: `Harga ${h.nama}${akhir ? ` — ${rupiah(akhir.p)} per ${h.satuan}, ${akhir.t}` : ''} (eceran nasional)`,
    deskripsi: `${akhir ? `${rupiah(akhir.p)} per ${h.satuan} pada ${akhir.t}. ` : ''}Seri harga eceran nasional ${h.nama} dari ${h.sistem ?? 'SP2KP'} Kemendag, ${n(h.cakupan?.points ?? 0)} titik sejak ${h.cakupan?.from ?? '—'}. Bukan harga yang diterima petani.`,
    jalur: 'Harga komoditas',
    h1: `Harga ${h.nama}`,
    lede: `${akhir ? `${teks(rupiah(akhir.p))} per ${teks(h.satuan)} pada ${teks(akhir.t)}` : 'Seri tanpa angka'} — <strong>harga eceran nasional</strong>, bukan harga yang diterima petani.`,
    isi: isiHtml,
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Dataset', name: `Harga ${h.nama} — eceran nasional`,
          description: `Seri harga eceran nasional ${h.nama} dari ${h.sistem ?? 'SP2KP'}`,
          license: 'https://creativecommons.org/licenses/by-sa/4.0/',
          creator: { '@type': 'Organization', name: 'Pranatani' },
          ...(h.cakupan?.from && h.cakupan?.to ? { temporalCoverage: `${h.cakupan.from}/${h.cakupan.to}` } : {}),
          ...(h.satuan ? { measurementTechnique: `Survei harga ${h.tingkat ?? 'eceran'}` } : {}),
        },
        remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Harga komoditas', jalan: null }, { nama: h.nama, jalan }]),
        ...(ldTanya ? [ldTanya] : []),
      ],
    },
    batas: blokBatas({
      sumber: [{ dari: 'harga', cakupan: `satu seri harian ${h.nama}: ${n(h.cakupan?.points ?? 0)} titik, tingkat ${h.tingkat ?? 'eceran'}` }],
      takDijawab: ['hargaPetani', 'hargaWilayah'],
    }, jalan),
  }));
  // lastmod-nya tanggal DATA, bukan tanggal tarikan registri: seri ini berubah harian.
  urlTemplate.harga.push([jalan, akhir?.t ?? null]);
}

// ---------------------------------------------------------------------------
// Template 9 — toko tani per wilayah
// ---------------------------------------------------------------------------
// Gerbangnya keras dan hasilnya sedikit, dan itu jawaban yang benar: 2.181 dari 2.248
// titik cuma nama tanpa alamat di luar nama kabupatennya. Halaman berisi 47 nama telanjang
// kalah dari listicle berisi 7 nama beralamat — dan pantas kalah.
const BATAS_TOKO_WILAYAH = 5;
const alamatRinci = (a) => Boolean(a) && !/^(Kab\.|Kabupaten|Kota)\s/i.test(String(a).trim());
const SUMBER_TOKO = {
  'opendata-jateng': 'Portal data terbuka Provinsi Jawa Tengah',
  'tti-kementan-arsip-wayback': 'Arsip Toko Tani Indonesia (Kementan) lewat Wayback Machine',
};
let wilayahGugur = 0; let tokoTanpaAlamat = 0;
const wilayahSemua = bacaBila('toko-wilayah.json') ?? [];
for (const w of [...wilayahSemua].sort((a, b) => a.k.localeCompare(b.k))) {
  const isi = bacaBila(`toko/${w.k}.json`) ?? [];
  const beralamat = isi.filter((x) => alamatRinci(x.a))
    .sort((a, b) => String(a.n).localeCompare(String(b.n)));
  tokoTanpaAlamat += isi.length - beralamat.length;
  if (beralamat.length < BATAS_TOKO_WILAYAH) { wilayahGugur++; continue; }
  const jalan = `toko/${w.k}/`;
  const sumberDipakai = [...new Set(beralamat.map((x) => x.s))].sort();

  const tanya = [
    { t: `Ada berapa toko tani di ${w.w}?`,
      j: `${beralamat.length} titik dengan alamat yang bisa dituju tercatat di sini, dari ${isi.length} nama yang terkumpul untuk wilayah ini. Sisanya cuma nama tanpa alamat, dan tidak ditampilkan.` },
    { t: `Apakah daftar ini lengkap?`,
      j: `Tidak. Ini yang terkumpul dari data terbuka dan arsip — bukan sensus. Toko yang tidak ada di sini belum tentu tidak ada.` },
    { t: `Apakah tokonya masih buka?`,
      j: `${meta?.tidakAda?.tokoTanpaKontak ?? 'Telepon, jam buka, dan apakah tokonya masih ada tidak tercatat.'}` },
  ];
  const { html: htmlTanya, ld: ldTanya } = blokTanya(tanya);

  const isiHtml = `
  <div class="kartu peringatan">
    <h2>Yang halaman ini bisa dan tidak bisa jamin</h2>
    <p class="catatan">
      ${teks(meta?.tidakAda?.tokoTakBisaDituju ?? '')}
    </p>
  </div>
  <h2 class="judul-bagian">${n(beralamat.length)} titik dengan alamat</h2>
  <p class="bantuan">
    Urut abjad. ${isi.length > beralamat.length ? `${n(isi.length - beralamat.length)} nama lain untuk wilayah ini tidak ditampilkan karena alamatnya cuma nama kabupaten — nama telanjang tidak menolong siapa pun sampai di toko.` : ''}
  </p>
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>Nama</th><th>Alamat</th></tr></thead>
      <tbody>${beralamat.map((x) => `
        <tr><td>${teks(x.n)}</td><td>${teks(x.a)}</td></tr>`).join('')}</tbody>
    </table>
  </div>
  <p class="catatan atribusi">
    Sumber: ${teks(sumberDipakai.map((x) => SUMBER_TOKO[x] ?? x).join('; '))}.
  </p>
  ${htmlTanya}
  <details class="batas">
    <summary><h2>Batas yang perlu diketahui sebelum memakai halaman ini</h2></summary>
    <div class="batas-isi">
      <h3>Bukan sensus, dan bukan rekomendasi</h3>
      <p>Yang terkumpul dari data terbuka dan arsip, apa adanya. Tidak ada urutan yang
      bisa dibeli, dan tidak ada penilaian atas tokonya.</p>
      <h3>Tidak ada telepon dan jam buka</h3>
      <p>${teks(meta?.tidakAda?.tokoTanpaKontak ?? '')}</p>
    </div>
  </details>
  <p class="lain">
    <a href="/toko.html">Cari toko di wilayah lain →</a> ·
    <a href="/index.html">Beranda</a>
  </p>`;

  simpan(`${jalan}index.html`, halaman({
    jalan,
    judul: `Toko tani di ${w.w} — ${beralamat.length} titik beralamat`,
    deskripsi: `${beralamat.length} toko tani dan penjual sarana produksi di ${w.w} dengan alamat yang bisa dituju, dari data terbuka dan arsip. Bukan sensus, tanpa peringkat.`,
    jalur: 'Toko tani',
    h1: `Toko tani di ${w.w}`,
    lede: `${n(beralamat.length)} titik dengan alamat yang bisa dituju. <strong>Bukan sensus</strong> — yang tidak ada di sini belum tentu tidak ada.`,
    isi: isiHtml,
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'ItemList', numberOfItems: beralamat.length, itemListElement: beralamat.slice(0, 100).map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.n })) },
        remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Toko tani', jalan: null }, { nama: w.w, jalan }]),
        ...(ldTanya ? [ldTanya] : []),
      ],
    },
    batas: blokBatas({
      sumber: [{ dari: 'tokoWilayah', cakupan: `${beralamat.length} titik beralamat di ${w.w}` }],
      takDijawab: ['tokoTakBisaDituju', 'tokoTanpaKontak'],
    }, jalan),
  }));
  urlTemplate.toko.push([jalan, TARIKAN.pestisida]);
}

// ---------------------------------------------------------------------------
// Template 10 — sediaan buatan sendiri, dan bahan bakunya
// ---------------------------------------------------------------------------
// Jalur 5 lapang, jalur 6 terikat — dan halaman jalur 6 membuka dengan pasalnya, bukan
// dengan resepnya. Sikap yang diwarisi dari app/jalur-6.js: NYATAKAN STATUSNYA APA ADANYA,
// TANDAI own_use_only, JANGAN MENYIMPULKAN AMAN.
const PERAN = {
  nitrogen_source: 'sumber nitrogen', carbon_source: 'sumber karbon', water: 'air',
  energy_source: 'sumber energi', active_material: 'bahan aktif', carrier: 'pembawa',
  inoculum: 'inokulum', additive: 'tambahan',
};
const SATUAN_TAKAR = {
  parts_by_volume: 'bagian menurut volume', parts_by_mass: 'bagian menurut bobot',
  percent_by_mass: '% menurut bobot',
};
const APD = {
  gloves: 'sarung tangan', mask: 'masker', boots: 'sepatu bot',
  goggles: 'kacamata pelindung', long_sleeves: 'baju lengan panjang',
};
const BUKTI = {
  A: 'A — uji terkendali berulang', B: 'B — penelitian terbit, belum berulang',
  C: 'C — praktik mapan, bukti terbatas', D: 'D — praktik lapangan, bukti belum ada',
};
const STATUS_BAHAN = {
  allowed: 'boleh dipakai', restricted: 'boleh dengan syarat', prohibited: 'terlarang',
};
const SATUAN_TAMPIL = { Cel: '°C', har: 'ha', 'kg/har': 'kg/ha', 'L/har': 'L/ha', d: 'hari', mo: 'bulan', h: 'jam' };
const satuanTerbaca = (u) => (u == null || u === '1' ? '' : (SATUAN_TAMPIL[u] ?? String(u).replace(/[{}]/g, '')));
const OPERATOR = { '>=': '≥', '<=': '≤', '>': '>', '<': '<', '==': '=' };
const besaran = (o) => (o == null ? '—' : `${angkaId(o.value ?? o.nilai)} ${satuanTerbaca(o.unit ?? o.satuan)}`.trim());

const sediaanKepala = bacaBila('sediaan.json') ?? { bahan: [], resep: [] };
const slugSediaan = pembuatSlug();
const slugBahanSediaan = pembuatSlug();
const petaBahanSediaan = new Map();
for (const b of sediaanKepala.bahan ?? []) {
  petaBahanSediaan.set(b.id, { ...b, slug: slugBahanSediaan.ambil(b.nama, b.id) });
}
const resepPakaiBahan = new Map();   // id bahan -> [{nama, slug, jalur}]
const resepSemua = [];
for (const f of berkasDi('sediaan')) {
  const r = baca(`sediaan/${f}`);
  const sR = slugSediaan.ambil(r.nama, r.id);
  resepSemua.push({ ...r, slug: sR });
  for (const b of r.bahan ?? []) {
    if (!resepPakaiBahan.has(b.zat)) resepPakaiBahan.set(b.zat, []);
    resepPakaiBahan.get(b.zat).push({ nama: r.nama, slug: sR, jalur: r.jalur });
  }
}
let bahanSediaanTipis = 0;

for (const r of resepSemua.sort((a, b) => a.id.localeCompare(b.id))) {
  const jalan = `sediaan/${r.slug}/`;
  const enam = r.jalur === 6;
  const hukum = r.hukum ?? {};
  const kartuHukum = `
  <div class="kartu ${enam ? 'tabrakan' : 'cakupan-hukum'}">
    <h2>${enam ? 'Kedudukan hukumnya, sebelum apa pun yang lain' : 'Kedudukan hukumnya'}</h2>
    <dl class="kunci">
      <dt>Rezim</dt><dd><code>${teks((hukum.rezim ?? []).join(', ') || '—')}</code></dd>
      <dt>Peredaran</dt><dd>${hukum.peredaran === 'own_use_only'
        ? '<strong>hanya untuk keperluan sendiri</strong>'
        : hukum.peredaran === 'limited_kabupaten_kota'
          ? 'terbatas dalam satu kabupaten/kota'
          : teks(hukum.peredaran ?? '—')}</dd>
    </dl>
    ${(hukum.dasar ?? []).length ? `
    <div class="pembungkus-tabel">
      <table>
        <thead><tr><th>Instrumen</th><th>Pasal</th><th>Bunyinya</th></tr></thead>
        <tbody>${hukum.dasar.map((d) => `
          <tr><td>${teks(d.instrumen)}</td><td>${teks(d.pasal)}</td><td>${teks(d.bunyi)}</td></tr>`).join('')}</tbody>
      </table>
    </div>` : ''}
    <p class="catatan">
      ${enam
        ? 'Halaman ini <strong>tidak menyimpulkan bahwa memakainya aman atau sah</strong>. Bacaan Pasal 77 ayat (1) belum dijawab penasihat hukum, dan sampai itu status di atas dinyatakan apa adanya — tidak lebih.'
        : 'Membuat dan memakai untuk lahan sendiri di luar rezim pendaftaran. <strong>Mengedarkannya tidak</strong> — Pasal 73 melarang mengedarkan pupuk yang tidak terdaftar atau tidak berlabel, dengan sanksi Pasal 122.'}
    </p>
  </div>`;

  const bahanBaris = (r.bahan ?? []).map((b) => {
    const bb = petaBahanSediaan.get(b.zat);
    return `
      <tr><td>${bb ? `<a href="/sediaan/bahan/${teks(bb.slug)}/">${teks(b.nama)}</a>` : teks(b.nama)}</td>
          <td>${teks(PERAN[b.peran] ?? b.peran ?? '—')}</td>
          <td class="angka">${b.takaran ? `${teks(angkaId(b.takaran.nilai))} ${teks(SATUAN_TAKAR[b.takaran.satuan] ?? b.takaran.satuan ?? '')}` : '—'}</td>
          <td>${b.pilihan ? 'boleh diganti' : 'wajib'}</td></tr>`;
  }).join('');

  const kriteria = (r.kriteria ?? []).map((k) => `
      <tr><td>${teks(k.ubah ?? k.jenis)}</td>
          <td class="angka">${k.nilai != null ? `${teks(OPERATOR[k.operator] ?? k.operator ?? '')} ${teks(typeof k.nilai === 'number' ? angkaId(k.nilai) : k.nilai)} ${teks(satuanTerbaca(k.satuan))}` : '—'}</td>
          <td>${teks(k.diKebun ?? k.metode ?? '—')}</td></tr>`).join('');

  const tanya = [
    { t: `Boleh tidak ${r.nama.toLowerCase()} diedarkan?`,
      j: hukum.peredaran === 'own_use_only'
        ? `Statusnya hanya untuk keperluan sendiri, dan bacaan Pasal 77 ayat (1) yang menentukan batasnya belum dijawab penasihat hukum. Halaman ini menyatakan statusnya apa adanya dan tidak menyimpulkan aman atau sah.`
        : `Membuat dan memakai untuk lahan sendiri berada di luar rezim pendaftaran. Mengedarkannya tidak: Pasal 73 melarang mengedarkan pupuk yang tidak terdaftar atau tidak berlabel.` },
    { t: `Seberapa kuat buktinya?`,
      j: `${BUKTI[r.bukti] ?? 'belum ditetapkan'}. ${r.buktiCatatan ?? ''}` },
  ];
  if (r.proses?.lama) {
    tanya.push({ t: `Berapa lama prosesnya?`, j: `${besaran(r.proses.lama)}${r.proses.cara ? `, dengan cara ${r.proses.cara}` : ''}.` });
  }
  if ((r.kriteria ?? []).length) {
    tanya.push({ t: `Bagaimana tahu ia sudah jadi?`,
      j: `Ada ${r.kriteria.length} kriteria pelepasan yang bisa diperiksa sendiri di kebun, di antaranya ${r.kriteria[0].ubah ?? r.kriteria[0].jenis}. Tanpa kriteria itu, "sudah jadi" cuma perasaan.` });
  }
  const { html: htmlTanya, ld: ldTanya } = blokTanya(tanya);

  const isiHtml = `
  ${kartuHukum}
  <div class="kartu">
    <h2>Apa ini</h2>
    <p>${teks(r.definisi ?? '')}</p>
    <p class="catatan">
      Tingkat bukti <span class="bj-tingkat bj-tingkat-${teks(String(r.bukti ?? 'kosong').toLowerCase())}">${teks(r.bukti ?? '–')}</span>
      ${teks(BUKTI[r.bukti] ?? 'belum ditetapkan')}. ${teks(r.buktiCatatan ?? '')}
    </p>
  </div>
  ${(r.bahan ?? []).length ? `
  <h2 class="judul-bagian">Bahannya</h2>
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>Bahan</th><th>Peran</th><th>Takaran</th><th>Wajib?</th></tr></thead>
      <tbody>${bahanBaris}</tbody>
    </table>
  </div>` : ''}
  ${r.proses ? `
  <div class="kartu">
    <h2>Prosesnya</h2>
    <div class="pembungkus-tabel">
      <table>
        <tbody>
          ${r.proses.cara ? `<tr><td>Cara</td><td>${teks(r.proses.cara)}</td></tr>` : ''}
          ${r.proses.lama ? `<tr><td>Lama</td><td class="angka">${teks(besaran(r.proses.lama))}</td></tr>` : ''}
          ${r.proses.wadah ? `<tr><td>Wadah</td><td>${teks(r.proses.wadah)}</td></tr>` : ''}
          ${r.proses.sanitasi?.regime ? `<tr><td>Sanitasi</td><td>${teks(r.proses.sanitasi.regime)}${r.proses.sanitasi.min_temperature ? ` · minimal ${teks(besaran(r.proses.sanitasi.min_temperature))}` : ''}</td></tr>` : ''}
        </tbody>
      </table>
    </div>
  </div>` : ''}
  ${(r.kriteria ?? []).length ? `
  <h2 class="judul-bagian">Kriteria pelepasan — bagaimana tahu ia sudah jadi</h2>
  <p class="bantuan">Bisa diperiksa sendiri di kebun. Tanpa ini, "sudah jadi" cuma perasaan.</p>
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>Yang diukur</th><th>Ambang</th><th>Caranya di kebun</th></tr></thead>
      <tbody>${kriteria}</tbody>
    </table>
  </div>` : ''}
  ${r.pemakaian ? `
  <div class="kartu">
    <h2>Pemakaiannya</h2>
    <p>${r.pemakaian.dosis ? `${teks(angkaId(r.pemakaian.dosis.nilai))} ${teks(satuanTerbaca(r.pemakaian.dosis.satuan))}${r.pemakaian.dosis.min != null ? ` (rentang ${teks(angkaId(r.pemakaian.dosis.min))}–${teks(angkaId(r.pemakaian.dosis.maks))})` : ''}` : '—'}${r.pemakaian.cara ? ` · ${teks(r.pemakaian.cara)}` : ''}</p>
  </div>` : ''}
  ${r.keselamatan ? `
  <div class="kartu peringatan">
    <h2>Keselamatan</h2>
    ${(r.keselamatan.bahaya ?? []).length ? `<ul>${r.keselamatan.bahaya.map((x) => `<li>${teks(x)}</li>`).join('')}</ul>` : ''}
    ${(r.keselamatan.apd ?? []).length ? `<p class="catatan">Pelindung: ${teks(r.keselamatan.apd.map((a) => APD[a] ?? a).join(', '))}.</p>` : ''}
    ${r.keselamatan.catatan ? `<p class="catatan">${teks(r.keselamatan.catatan)}</p>` : ''}
  </div>` : ''}
  ${(r.rendemen || r.simpan) ? `
  <div class="kartu">
    <h2>Hasil dan penyimpanan</h2>
    ${r.rendemen ? `<p>Rendemen ${teks(angkaId((r.rendemen.nisbah ?? 0) * 100))}% dari bobot awal. ${teks(r.rendemen.catatan ?? '')}</p>` : ''}
    ${r.simpan ? `<p class="catatan">Simpan ${teks(besaran(r.simpan.lama))} — ${teks(r.simpan.cara ?? '')}</p>` : ''}
  </div>` : ''}
  ${htmlTanya}
  <details class="batas">
    <summary><h2>Batas yang perlu diketahui sebelum memakai halaman ini</h2></summary>
    <div class="batas-isi">
      <h3>Kadar haranya tidak diketahui</h3>
      <p>${teks(meta?.tidakAda?.haraSediaan ?? 'Kadar hara sediaan buatan sendiri tidak terukur di sini.')}</p>
      <h3>Resep bukan jaminan hasil</h3>
      <p>Bahan organik biasanya baru terasa pada musim kedua ke atas, dan tanggapannya
      berbeda menurut tanah serta musim.</p>
    </div>
  </details>
  <p class="lain">
    <a href="/jalur-${enam ? '6' : '5'}.html">Buka versi yang bisa ditelusuri →</a> ·
    <a href="/sediaan/bahan/">Bahan baku dan statusnya →</a> ·
    <a href="/index.html">Beranda</a>
  </p>`;

  simpan(`${jalan}index.html`, halaman({
    jalan,
    judul: `${r.nama} — kedudukan hukum, bahan, dan titik kendalinya`,
    deskripsi: `${r.definisi ? String(r.definisi).slice(0, 150) : r.nama}. Kedudukan hukum, bahan beserta takaran, proses, kriteria pelepasan yang bisa diperiksa di kebun, dan tingkat buktinya.`,
    jalur: `Jalur ${r.jalur} · ${enam ? 'sediaan pengendali — status hukum' : 'sediaan pupuk'}`,
    h1: r.nama,
    lede: enam
      ? `<strong>Statusnya hanya untuk keperluan sendiri</strong>, dan bacaan Pasal 77 ayat (1) belum dijawab penasihat hukum. Yang ditampilkan status apa adanya — bukan kesimpulan bahwa ia aman atau sah.`
      : `Di luar rezim pendaftaran selama untuk lahan sendiri. Tingkat bukti ${teks(r.bukti ?? '–')}.`,
    isi: isiHtml,
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'DefinedTerm', name: r.nama, identifier: r.id, inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'Sediaan buatan sendiri — Pranatani' } },
        remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Sediaan buatan sendiri', jalan: null }, { nama: r.nama, jalan }]),
        ...(ldTanya ? [ldTanya] : []),
      ],
    },
    batas: blokBatas({
      sumber: [{ dari: 'sediaan', cakupan: `satu resep: kedudukan hukum, bahan, proses, kriteria pelepasan, dan tingkat buktinya` }],
      takDijawab: ['haraSediaan', 'phi'],
    }, jalan),
  }));
  urlTemplate.sediaan.push([jalan, TARIKAN.pestisida]);
}

for (const [id, b] of [...petaBahanSediaan.entries()].sort()) {
  const jalan = `sediaan/bahan/${b.slug}/`;
  const dipakai = (resepPakaiBahan.get(id) ?? []).sort((x, y) => x.nama.localeCompare(y.nama));
  // Bahan yang boleh, tanpa alasan tertulis, dan tidak dipakai resep mana pun cuma
  // membawa dua fakta. Halamannya tetap ada supaya tautan tidak putus, tapi tidak diindeks.
  const tipis = b.status === 'allowed' && !b.alasan && !dipakai.length;
  if (tipis) bahanSediaanTipis++;

  const tanya = [
    { t: `${b.nama} boleh dipakai untuk sediaan sendiri?`,
      j: b.status === 'prohibited'
        ? `Tidak. Bahan ini masuk daftar terlarang. ${b.alasan ?? ''}`
        : b.status === 'restricted'
          ? `Boleh, dengan syarat. ${b.alasan ?? ''}`
          : `Boleh.${b.sanitasiWajib ? ' Sanitasinya wajib sebelum dipakai.' : ''}` },
  ];
  if (dipakai.length) {
    tanya.push({ t: `Resep apa saja yang memakai ${b.nama}?`,
      j: `${dipakai.length} resep: ${dipakai.map((x) => x.nama).join('; ')}.` });
  }
  const { html: htmlTanya, ld: ldTanya } = blokTanya(tanya);

  const isiHtml = `
  <div class="kartu ${b.status === 'prohibited' ? 'tabrakan' : b.status === 'restricted' ? 'peringatan' : ''}">
    <h2>Statusnya</h2>
    <p><strong>${teks(STATUS_BAHAN[b.status] ?? b.status)}</strong>${b.sanitasiWajib ? ' · sanitasi wajib sebelum dipakai' : ''}</p>
    ${b.alasan ? `<p>${teks(b.alasan)}</p>` : ''}
    ${b.status === 'prohibited' ? `<p class="catatan">
      Yang ditampilkan <strong>keadaan daftarnya</strong>, bukan kesimpulan hukum atas
      siapa pun yang sudah terlanjur memakainya.
    </p>` : ''}
  </div>
  ${dipakai.length ? `
  <h2 class="judul-bagian">Dipakai ${n(dipakai.length)} resep</h2>
  <ul class="daftar">
    ${dipakai.map((x) => `<li><a href="/sediaan/${teks(x.slug)}/"><span class="nama">${teks(x.nama)}</span><span class="sub">jalur ${teks(x.jalur)}</span></a></li>`).join('\n    ')}
  </ul>` : `
  <div class="kartu peringatan">
    <h2>Tidak dipakai resep mana pun di sini</h2>
    <p class="catatan">Ia tercatat statusnya, tetapi belum jadi bahan pada satu pun dari
    dua belas resep yang sudah ditulis.</p>
  </div>`}
  ${htmlTanya}
  <details class="batas">
    <summary><h2>Batas yang perlu diketahui sebelum memakai halaman ini</h2></summary>
    <div class="batas-isi">
      <h3>Status bukan resep</h3>
      <p>Boleh dipakai tidak berarti boleh dipakai sembarang cara. Takaran dan prosesnya
      ada di resepnya, bukan di halaman bahan.</p>
      <h3>Kadar haranya tidak diketahui</h3>
      <p>${teks(meta?.tidakAda?.haraSediaan ?? '')}</p>
    </div>
  </details>
  <p class="lain">
    <a href="/jalur-5.html">Meramu pupuk sendiri →</a> ·
    <a href="/jalur-6.html">Sediaan pengendali — status hukumnya →</a> ·
    <a href="/index.html">Beranda</a>
  </p>`;

  simpan(`${jalan}index.html`, halaman({
    jalan,
    robots: tipis ? 'noindex,follow' : null,
    judul: `${b.nama} — ${STATUS_BAHAN[b.status] ?? b.status} untuk sediaan buatan sendiri`,
    deskripsi: `${b.nama}: ${STATUS_BAHAN[b.status] ?? b.status}${b.sanitasiWajib ? ', sanitasi wajib' : ''}${b.alasan ? `. ${String(b.alasan).slice(0, 120)}` : ''}${dipakai.length ? `. Dipakai ${dipakai.length} resep.` : ''}`,
    jalur: 'Bahan baku sediaan',
    h1: b.nama,
    lede: `<strong>${teks(STATUS_BAHAN[b.status] ?? b.status)}</strong>${b.sanitasiWajib ? ' · sanitasi wajib sebelum dipakai' : ''}.`,
    isi: isiHtml,
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'DefinedTerm', name: b.nama, identifier: id, inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'Bahan baku sediaan buatan sendiri — Pranatani' } },
        remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Bahan baku sediaan', jalan: null }, { nama: b.nama, jalan }]),
        ...(ldTanya ? [ldTanya] : []),
      ],
    },
    batas: blokBatas({
      sumber: [{ dari: 'sediaan', cakupan: `status satu bahan baku beserta alasannya${dipakai.length ? `, dan ${dipakai.length} resep yang memakainya` : ''}` }],
      takDijawab: ['haraSediaan', 'phi'],
    }, jalan),
  }));
  if (!tipis) urlTemplate.sediaan.push([jalan, TARIKAN.pestisida]);
}


// Halaman induk bahan baku — ditaut dari tiap resep, dan tempat tiga bahan yang terlalu
// tipis untuk halamannya sendiri tetap terbaca.
{
  const jalan = 'sediaan/bahan/';
  const urut = ['prohibited', 'restricted', 'allowed'];
  const kelompok = urut.map((st) => [st, [...petaBahanSediaan.values()]
    .filter((b) => b.status === st).sort((a, b) => a.nama.localeCompare(b.nama))]).filter(([, v]) => v.length);
  const tanya = [
    { t: `Bahan apa saja yang terlarang untuk sediaan buatan sendiri?`,
      j: `${(kelompok.find(([k]) => k === 'prohibited')?.[1] ?? []).map((b) => b.nama).join('; ') || 'Tidak ada'}. Yang ditampilkan keadaan daftarnya, bukan kesimpulan hukum atas siapa pun.` },
    { t: `Berapa bahan baku yang tercatat?`,
      j: `${petaBahanSediaan.size} bahan, terbagi jadi ${kelompok.map(([k, v]) => `${v.length} ${STATUS_BAHAN[k]}`).join(', ')}.` },
  ];
  const { html: htmlTanya, ld: ldTanya } = blokTanya(tanya);
  const isiHtml = `
  <p class="bantuan">
    Dua di antaranya justru bahan yang lazim dipakai orang, dan keduanya masuk daftar
    terlarang. Statusnya disebut lebih dulu, resepnya belakangan.
  </p>
  ${kelompok.map(([st, daftar]) => `
  <h2 class="judul-bagian">${n(daftar.length)} bahan · ${teks(STATUS_BAHAN[st])}</h2>
  <ul class="daftar">
    ${daftar.map((b) => `<li><a href="/sediaan/bahan/${teks(b.slug)}/">
      <span class="nama">${teks(b.nama)}</span>
      <span class="sub">${teks(b.alasan ? String(b.alasan).slice(0, 110) : (b.sanitasiWajib ? 'sanitasi wajib sebelum dipakai' : 'tanpa syarat tambahan'))}</span></a></li>`).join('\n    ')}
  </ul>`).join('\n')}
  ${htmlTanya}
  <p class="lain">
    <a href="/jalur-5.html">Meramu pupuk sendiri →</a> ·
    <a href="/jalur-6.html">Sediaan pengendali — status hukumnya →</a> ·
    <a href="/index.html">Beranda</a>
  </p>`;
  simpan(`${jalan}index.html`, halaman({
    jalan,
    judul: `Bahan baku sediaan buatan sendiri — ${petaBahanSediaan.size} bahan dan statusnya`,
    deskripsi: `${petaBahanSediaan.size} bahan baku sediaan buatan sendiri beserta statusnya: boleh, boleh dengan syarat, atau terlarang — dengan alasannya masing-masing.`,
    jalur: 'Bahan baku sediaan',
    h1: 'Bahan baku sediaan buatan sendiri',
    lede: `${n(petaBahanSediaan.size)} bahan tercatat statusnya. <strong>Dua yang lazim dipakai justru terlarang.</strong>`,
    isi: isiHtml,
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'DefinedTermSet', name: 'Bahan baku sediaan buatan sendiri — Pranatani' },
        remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Bahan baku sediaan', jalan }]),
        ...(ldTanya ? [ldTanya] : []),
      ],
    },
    batas: blokBatas({
      sumber: [{ dari: 'sediaan', cakupan: `status ${petaBahanSediaan.size} bahan baku beserta alasannya` }],
      takDijawab: ['haraSediaan', 'phi'],
    }, jalan),
  }));
  urlTemplate.sediaan.push([jalan, TARIKAN.pestisida]);
}


// ---------------------------------------------------------------------------
// Template 11 — editorial
// ---------------------------------------------------------------------------
// Lima belas halaman yang tidak bisa diturunkan dari indeks, karena isinya argumen —
// dan argumen memang ditulis, bukan dibangkitkan. Yang DIBANGKITKAN cuma angkanya:
// tiap bilangan di prosa ini datang dari `angka` di bawah, dihitung ulang tiap kali
// halaman dibangun. Prosa yang mengetik angkanya sendiri akan basi diam-diam, dan
// halaman yang basi diam-diam persis yang dilawan seluruh dokumen ini.
//
// Seluruhnya turunan dokumen yang sudah ada di repositori: tiap halaman menyebut
// docs/ mana yang jadi dasarnya, supaya yang membacanya bisa memeriksa asal argumennya.
const angka = (() => {
  const semuaProduk = [...produkPenuh.values()];
  const perLabelTakson = new Map();
  for (const x of vocabOptRegistri.values()) {
    const l = String(x.label?.id ?? '').trim().toLowerCase();
    if (!l) continue;
    if (!perLabelTakson.has(l)) perLabelTakson.set(l, new Set());
    perLabelTakson.get(l).add(x.scientific_name ?? x.id);
  }
  const tumpuk = [...perLabelTakson].filter(([, v]) => v.size > 1).sort((a, b) => b[1].size - a[1].size);
  let klasterTerbesar = { anggota: 0, dosis: 0, komposisi: '' };
  for (const kel of kelompokSetara) {
    const d = new Set();
    for (const a of kel.anggota) for (const g of (produkPenuh.get(a.i)?.guna ?? [])) if (g.dosis) d.add(g.dosis);
    if (d.size > klasterTerbesar.dosis) {
      klasterTerbesar = { anggota: kel.anggota.length, dosis: d.size, komposisi: sebutanIsi(produkPenuh.get(kel.anggota[0].i)?.isi ?? []) };
    }
  }
  return {
    produk: semuaProduk.length,
    pestisida: meta.jumlah?.pestisida ?? 0,
    pupuk: meta.jumlah?.pupuk ?? 0,
    aktif: semuaProduk.filter((x) => x.status === 'active').length,
    kedaluwarsa: semuaProduk.filter((x) => x.status === 'expired').length,
    setaraKelompok: kelompokSetara.length,
    setaraProduk: kelompokSetara.reduce((a, k) => a + k.anggota.length, 0),
    klasterTerbesar,
    penggunaan: (meta.jumlah?.dosisPerHektare ?? 0) + (meta.jumlah?.dosisPerLiter ?? 0) + (meta.jumlah?.dosisKosong ?? 0) + (meta.jumlah?.dosisLain ?? 0),
    dosisHa: meta.jumlah?.dosisPerHektare ?? 0,
    dosisLiter: meta.jumlah?.dosisPerLiter ?? 0,
    dosisKosong: meta.jumlah?.dosisKosong ?? 0,
    optRegistri: vocabOptRegistri.size,
    labelTumpuk: tumpuk.length,
    taksonTertumpuk: tumpuk.reduce((a, [, v]) => a + v.size, 0),
    labelTerbesar: tumpuk[0] ? { nama: tumpuk[0][0], takson: tumpuk[0][1].size } : { nama: '—', takson: 0 },
    labelKedua: tumpuk[1] ? { nama: tumpuk[1][0], takson: tumpuk[1][1].size } : { nama: '—', takson: 0 },
    optTerkurasi: meta.jumlah?.optTerkurasi ?? 0,
    varietas: meta.jumlah?.varietas ?? 0,
    badan: meta.jumlah?.principal ?? 0,
    pupukTanpaKomposisi: semuaProduk.filter((x) => x.jenis === 'pupuk' && !(x.isi ?? []).length).length,
    pestisidaTanpaGuna: semuaProduk.filter((x) => x.jenis === 'pestisida' && !(x.guna ?? []).length).length,
    kandunganKelompok: semuaKandungan.length,
    hargaSeri: urlTemplate.harga.length,
    hargaLuar,
    sediaanResep: resepSemua.length,
    sediaanBahan: petaBahanSediaan.size,
    sediaanTerlarang: [...petaBahanSediaan.values()].filter((b) => b.status === 'prohibited').length,
    tokoTitik: (bacaBila('toko-titik.json') ?? []).length,
    tokoWilayahLolos: urlTemplate.toko.length,
    tinjauan: meta.tinjauan ?? { rekaman: 0, berpeninjau: 0 },
  };
})();

// Prosanya tidak lagi tinggal di sini. Ia rekaman kosakata di spec/vocab/editorial.json,
// tunduk pada aturan yang sama seperti kurasi lain: L35 menuntut nama peninjau dan
// tanggalnya bepergian bersama, dan `reviewed_hash` menyematkan tinjauan pada isi yang
// benar-benar dibaca peninjaunya. Yang tetap dibangkitkan cuma angkanya — penanda
// {{jalur.medan}} diisi dari `angka` tiap kali halaman dibangun.
//
// Akibat yang disengaja dari pemisahan itu: harga cabai bergerak TIDAK menggugurkan
// tinjauan, karena angkanya bukan bagian dari isi yang di-hash. Yang menggugurkannya
// perubahan argumennya sendiri.
const penandaHilang = [];
const isiPenanda = (prosa) => String(prosa ?? '').replace(/\{\{([a-zA-Z.]+)\}\}/g, (_, jalur) => {
  const v = jalur.split('.').reduce((o, k) => (o == null ? o : o[k]), angka);
  // Penanda yang tidak ketemu TIDAK diganti string kosong: kalimat yang kehilangan
  // angkanya diam-diam lebih buruk daripada kalimat yang memperlihatkan lubangnya.
  if (v == null) { penandaHilang.push(jalur); return `{{${jalur}}}`; }
  return typeof v === 'number' ? n(v) : teks(v);
});

const editorialDoc = JSON.parse(readFileSync(join(AKAR, 'spec', 'vocab', 'editorial.json'), 'utf8'));
const keadaanTinjau = (item) => {
  const peninjau = (item.provenance?.contributors ?? []).filter((c) => c.role === 'reviewer');
  if (!peninjau.length || !item.lifecycle?.reviewed_at) return { keadaan: 'belum', peninjau: [] };
  // Hash dihitung ulang di sini, tidak dipercayakan pada content_hash yang tersimpan:
  // yang perlu dijawab adalah "apakah yang ditinjau masih isi yang sekarang", dan medan
  // tersimpan bisa saja belum disegarkan setelah isinya berubah.
  const sekarang = hitungHash(item);
  if (item.lifecycle.reviewed_hash !== sekarang) return { keadaan: 'kedaluwarsa', peninjau: peninjau.map((c) => c.name), tanggal: item.lifecycle.reviewed_at };
  return { keadaan: 'ditinjau', peninjau: peninjau.map((c) => c.name), tanggal: item.lifecycle.reviewed_at };
};

const EDITORIAL = editorialDoc.items.map((item) => ({
  item,
  jalan: item.path.replace(/^\//, ''),
  judul: item.title,
  deskripsi: item.description,
  h1: item.label.id,
  lede: isiPenanda(item.dek),
  dasar: item.basis,
  isi: isiPenanda(item.body),
  tanya: (item.questions ?? []).map((q) => ({ t: isiPenanda(q.q), j: isiPenanda(q.a) })),
  sumber: item.sources,
  takDijawab: item.unanswered,
  tinjau: keadaanTinjau(item),
}));


// Perender editorial — satu bentuk untuk kelima belasnya, supaya yang berbeda cuma
// argumennya. Tiap halaman menyebut dokumen repositori yang jadi dasarnya.
for (const e of EDITORIAL) {
  const { html: htmlTanya, ld: ldTanya } = blokTanya(e.tanya);
  // Gerbang tinjau. Tulisan yang belum dibaca seorang pun tetap TERBIT — peninjaunya
  // harus bisa membacanya sebagai halaman, bukan sebagai JSON — tetapi ia tidak diindeks,
  // tidak masuk sitemap, dan mengatakan sendiri keadaannya di paling atas layar.
  const belumLolos = e.tinjau.keadaan !== 'ditinjau';
  const pitaTinjau = e.tinjau.keadaan === 'ditinjau' ? '' : `
  <div class="kartu ${e.tinjau.keadaan === 'kedaluwarsa' ? 'tabrakan' : 'peringatan'}">
    <h2>${e.tinjau.keadaan === 'kedaluwarsa' ? 'Tinjauan tulisan ini sudah tidak berlaku' : 'Tulisan ini belum ditinjau siapa pun'}</h2>
    <p class="catatan">
      ${e.tinjau.keadaan === 'kedaluwarsa'
        ? `Isinya berubah setelah ditinjau ${teks(e.tinjau.peninjau.join(', '))} pada ${teks(e.tinjau.tanggal)}. Sematan tinjauannya menunjuk isi yang lama, jadi ia tidak ikut menanggung yang sekarang.`
        : 'Argumennya diturunkan dari dokumen keputusan di repositori, tetapi belum seorang pun menempelkan namanya pada tulisan ini. Sampai itu terjadi ia tidak dimasukkan ke mesin pencari — dan sebaiknya dibaca sebagai draf.'}
      Angka di dalamnya tetap dihitung dari indeks tiap kali halaman dibangun.
    </p>
  </div>`;
  const isiHtml = `${pitaTinjau}
  ${e.isi}
  ${htmlTanya}
  <p class="catatan">
    Tulisan ini turunan dari <code>${teks(e.dasar)}</code> di repositori — dasar
    argumennya bisa ditelusuri di sana. Angka di dalamnya dihitung ulang tiap kali halaman
    dibangun, jadi ia tidak bisa basi tanpa ketahuan.
  </p>
  <p class="lain">
    <a href="/batas/">Semua halaman batas →</a> ·
    <a href="/sumber/cara-mengutip/">Sumber &amp; cara mengutip →</a> ·
    <a href="/index.html">Beranda</a>
  </p>`;
  simpan(`${e.jalan}index.html`, halaman({
    jalan: e.jalan,
    robots: belumLolos ? 'noindex,follow' : null,
    judul: e.judul,
    deskripsi: e.deskripsi,
    jalur: 'Batas jawaban',
    h1: e.h1,
    lede: e.lede,
    isi: isiHtml,
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article', headline: e.judul, description: e.deskripsi,
          inLanguage: 'id', isAccessibleForFree: true,
          license: 'https://creativecommons.org/licenses/by-sa/4.0/',
          publisher: { '@type': 'Organization', name: 'Pranatani' },
          ...(TARIKAN.pestisida ? { dateModified: TARIKAN.pestisida } : {}),
        },
        remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Batas jawaban', jalan: 'batas/' }, { nama: e.h1, jalan: e.jalan }]),
        ...(ldTanya ? [ldTanya] : []),
      ],
    },
    batas: blokBatas({ sumber: e.sumber, takDijawab: e.takDijawab }, e.jalan),
  }));
  if (!belumLolos) urlTemplate.editorial.push([e.jalan, TARIKAN.pestisida]);
}

// Induk editorial. Ia ikut digerbangi: halaman induk yang terindeks sementara seluruh
// isinya noindex cuma mengirim perayap ke jalan buntu.
{
  const jalan = 'batas/';
  const adaYangLolos = EDITORIAL.some((e) => e.tinjau.keadaan === 'ditinjau');
  const isiHtml = `
  <p class="bantuan">
    Lima belas tulisan tentang apa yang bisa dan tidak bisa disimpulkan dari data di sini.
    Seluruhnya turunan dokumen yang sudah ada di repositori, dengan angka yang dihitung
    ulang tiap kali halaman dibangun. Yang belum ditinjau seorang pun mengatakannya
    sendiri di kepala halamannya, dan tidak dimasukkan ke mesin pencari.
  </p>
  <ul class="daftar">
    ${EDITORIAL.map((e) => `<li><a href="/${teks(e.jalan)}">
      <span class="nama">${teks(e.h1)}</span>
      <span class="sub">${e.tinjau.keadaan === 'ditinjau' ? `ditinjau ${teks(e.tinjau.peninjau.join(', '))} · ${teks(e.tinjau.tanggal)}` : e.tinjau.keadaan === 'kedaluwarsa' ? 'tinjauannya sudah tidak berlaku — isinya berubah' : 'belum ditinjau'} · ${teks(String(e.deskripsi).slice(0, 100))}</span></a></li>`).join('\n    ')}
  </ul>`;
  simpan(`${jalan}index.html`, halaman({
    jalan,
    robots: adaYangLolos ? null : 'noindex,follow',
    judul: `Batas jawaban — ${EDITORIAL.length} tulisan tentang apa yang tidak bisa disimpulkan dari data ini`,
    deskripsi: `${EDITORIAL.length} tulisan tentang batas data registri pertanian: dosis yang bertentangan, isi yang sama persis, label yang dipakai ratusan spesies, harga eceran yang bukan harga petani, dan yang sengaja tidak diterbitkan.`,
    jalur: 'Batas jawaban',
    h1: 'Batas jawaban',
    lede: `${n(EDITORIAL.length)} tulisan tentang apa yang <strong>tidak</strong> bisa disimpulkan dari data di sini — dan kenapa itu ditulis alih-alih ditutupi.`,
    isi: isiHtml,
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'ItemList', numberOfItems: EDITORIAL.length, itemListElement: EDITORIAL.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: e.h1, item: mutlak(e.jalan) })) },
        remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Batas jawaban', jalan }]),
      ],
    },
    batas: blokBatas({
      sumber: [{ dari: 'pestisida', cakupan: 'angka yang dikutip seluruh tulisan di halaman ini' }],
      takDijawab: ['gejalaOptRegistri', 'harga'],
    }, jalan),
  }));
  if (adaYangLolos) urlTemplate.editorial.push([jalan, TARIKAN.pestisida]);
}

// ---------------------------------------------------------------------------
// Template 10 — laboratorium penguji: siapa yang bisa mengukur apa, dan di mana
// ---------------------------------------------------------------------------
// "Laboratorium terakreditasi" bukan jawaban. Yang dicari orang selalu kemampuan lebih
// dulu, baru tempat: siapa yang bisa menguji tanah, siapa yang bisa mengukur residu
// pestisida. Karena itu halamannya tiga lapis — satu pintu kemampuan, satu pintu
// provinsi, dan satu halaman per laboratorium yang membawa ringkasan lingkupnya utuh.
//
// RINGKASAN LINGKUP IKUT UTUH, DAN ITU BUKAN HIASAN
// Penanda kemampuan dibaca dari teks ringkasan, bukan dari kode. Menerbitkan enam
// boolean tanpa teks yang mendasarinya berarti meminta pembaca memercayai pembacaan
// yang tidak bisa ia periksa. Teksnya ikut, apa adanya, betapapun panjangnya.
//
// MASA BERLAKU DIBANDINGKAN DENGAN TANGGAL TARIKAN, BUKAN JAM MEMBANGUN
// Akreditasi yang sudah lewat masa berlakunya adalah laboratorium yang hasil ujinya
// tidak lagi diakui. Tetapi membandingkannya dengan `new Date()` akan membuat halaman
// yang sama berbeda isi tiap kali dibangun. Acuannya tanggal tarikan sumber, dan
// tanggal itu tercetak di halamannya.
const labKepala = bacaBila('lab-kemampuan.json');
if (labKepala) {
  const ARTI = labKepala.arti ?? {};
  const ACUAN = TARIKAN.lab ?? '2026-08-23';
  const KEMAMPUAN_JALAN = { t: 'uji-tanah', p: 'uji-pupuk', a: 'uji-air', m: 'uji-pangan', j: 'uji-jaringan-tanaman', r: 'uji-residu-pestisida' };
  const KEMAMPUAN_TANYA = {
    t: 'Ke mana saya kirim sampel tanah?',
    p: 'Ke mana saya kirim sampel pupuk?',
    a: 'Ke mana saya kirim sampel air?',
    m: 'Siapa yang bisa menguji hasil panen saya?',
    j: 'Siapa yang bisa menguji jaringan tanaman atau benih?',
    r: 'Siapa yang bisa mengukur residu pestisida?',
  };

  // Ringkasan lingkup dan lingkup terurai tidak ikut ke indeks — indeks memang dipakai
  // untuk mencari, bukan untuk membaca. Keduanya dibaca dari kosakatanya sendiri.
  const BATAS_BARIS_LAB = 250;
  let labBarisDitahan = 0;
  const labVocab = new Map();
  for (const x of bacaVocabNdjson('lab/lab.ndjson')) labVocab.set(x.accreditation?.number ?? x.key, x);

  const semuaLab = [];
  for (const w of labKepala.wilayah ?? []) {
    for (const x of bacaBila(`lab/${w.k}.json`) ?? []) semuaLab.push({ ...x, w });
  }
  const jalanLab = (x) => `lab/${slug(x.no)}/`;
  // Kepala indeks memuat cacah residu per provinsi; bentuknya sempat `r`, lalu jadi
  // `per` yang memuat seluruh kemampuan. Dibaca keduanya supaya halaman tidak ikut
  // pecah setiap kali sisi indeks merapikan bentuknya.
  const cacahWilayah = (w, huruf) => w?.per?.[huruf] ?? (huruf === 'r' ? (w?.r ?? 0) : 0);
  const hurufDari = (x) => String(x.k ?? '').split('').filter((h) => ARTI[h]);
  const bisaBaca = (x) => hurufDari(x).map((h) => ARTI[h]);
  let labTanpaLingkup = 0; let labKedaluwarsa = 0;

  // --- satu halaman per laboratorium ---------------------------------------------------
  for (const x of semuaLab.sort((a, b) => String(a.no).localeCompare(String(b.no), 'en', { numeric: true }))) {
    const jalan = jalanLab(x);
    const v = labVocab.get(x.no);
    if (!v?.scope_summary) labTanpaLingkup++;
    const lewat = x.sd && x.sd < ACUAN;
    if (lewat) labKedaluwarsa++;
    const bisa = bisaBaca(x);
    const rinci = v?.scope_detail;

    const tanya = [
      { t: `Apa saja yang bisa diuji ${x.n}?`,
        j: bisa.length
          ? `Ruang lingkup akreditasinya menyentuh ${bisa.join(', ')}. Daftar lengkapnya ada di halaman ini, apa adanya dari papan KAN.`
          : 'Ruang lingkupnya tidak menyentuh satu pun bidang usaha tani yang dibaca halaman ini.' },
      { t: `Sampai kapan akreditasi ${x.no} berlaku?`,
        j: x.sd
          ? `Sampai ${tanggalPanjang(x.sd)}${lewat ? ', dan per tanggal tarikan data ini masa berlakunya sudah lewat' : ''}.`
          : 'Masa berlakunya tidak terbaca di sumber.' },
      { t: `Berapa biaya pengujiannya?`,
        j: meta?.tidakAda?.labTarif ?? LUBANG_LOKAL.labTarif },
    ];
    const { html: htmlTanya, ld: ldTanya } = blokTanya(tanya);

    const isiHtml = `
  ${lewat ? `<div class="kartu peringatan">
    <h2>Masa berlaku akreditasi ini sudah lewat</h2>
    <p class="catatan">Berakhir ${teks(tanggalPanjang(x.sd))}, sementara data ini ditarik ${teks(tanggalPanjang(ACUAN))}.
    Akreditasi yang habis berarti hasil ujinya tidak lagi diakui sebagai hasil laboratorium terakreditasi —
    tanyakan langsung apakah sudah diperpanjang sebelum mengirim sampel.</p>
  </div>` : ''}
  <div class="kartu">
    <h2>Yang tercatat di KAN</h2>
    <div class="pembungkus-tabel">
      <table>
        <tbody>
          <tr><td>Nomor akreditasi</td><td class="angka">${teks(x.no)}</td></tr>
          <tr><td>Skema</td><td>Laboratorium penguji (SNI ISO/IEC 17025)</td></tr>
          <tr><td>Masa berlaku</td><td class="angka">${x.sd ? teks(tanggalPanjang(x.sd)) : '—'}</td></tr>
          <tr><td>Alamat</td><td>${teks(x.a || '—')}</td></tr>
          <tr><td>Provinsi</td><td>${teks(x.w.w)}</td></tr>
          ${x.t ? `<tr><td>Telepon / faks</td><td>${teks(x.t)}</td></tr>` : ''}
          ${x.e ? `<tr><td>Surel</td><td>${teks(x.e)}</td></tr>` : ''}
        </tbody>
      </table>
    </div>
    <p class="catatan">Kontak yang tercetak di sini kontak kelembagaan yang KAN sendiri terbitkan supaya
    laboratoriumnya bisa dihubungi. Nama petugas penghubung ada di sumbernya dan sengaja tidak diambil.</p>
  </div>
  <h2 class="judul-bagian">Bidang yang disentuh ruang lingkupnya</h2>
  ${bisa.length ? `<ul class="daftar-kemampuan">${hurufDari(x).map((h) => `
    <li><a href="/lab/${teks(KEMAMPUAN_JALAN[h])}/">${teks(ARTI[h])}</a></li>`).join('')}
  </ul>
  <p class="bantuan">Keenam penanda ini dibaca dari <strong>teks</strong> ringkasan lingkupnya, bukan dari kode.
  Teks yang mendasarinya tercetak di bawah supaya pembacaannya bisa diperiksa sendiri.</p>` : '<p class="bantuan">Tidak ada.</p>'}
  ${v?.scope_summary ? `
  <h2 class="judul-bagian">Ruang lingkup, apa adanya dari papan KAN</h2>
  <p class="lingkup-mentah">${teks(v.scope_summary)}</p>` : ''}
  ${rinci ? `
  <div class="kartu">
    <h2>Lingkup terurai per parameter</h2>
    <div class="pembungkus-tabel">
      <table>
        <tbody>
          ${rinci.rows !== undefined ? `<tr><td>Baris lingkup</td><td class="angka">${n(rinci.rows)}</td></tr>` : ''}
          ${rinci.amended_at ? `<tr><td>Amandemen terkini</td><td class="angka">${teks(tanggalPanjang(rinci.amended_at))}</td></tr>` : ''}
          ${(rinci.k01_codes ?? []).length ? `<tr><td>Kode bidang KAN K-01</td><td>${teks((rinci.k01_codes ?? []).join(', '))}</td></tr>` : ''}
        </tbody>
      </table>
    </div>
    ${rinci.source ? `<p class="catatan"><a href="${teks(rinci.source)}" rel="nofollow noopener noreferrer external">Rincian lingkup di aplikasi direktori KAN</a></p>` : ''}
  </div>` : `<p class="catatan">${teks(meta?.tidakAda?.labLingkupRingkas ?? LUBANG_LOKAL.labLingkupRingkas)}</p>`}
  ${htmlTanya}
  <p class="lain">
    <a href="/lab/di-${teks(x.w.k)}/">Laboratorium lain di ${teks(x.w.w)} →</a> ·
    <a href="/lab/">Semua kemampuan</a> ·
    <a href="/index.html">Beranda</a>
  </p>`;

    simpan(`${jalan}index.html`, halaman({
      jalan,
      judul: `${x.n} — ${x.no}, laboratorium penguji terakreditasi KAN`,
      deskripsi: `${x.n} di ${x.w.w}, akreditasi ${x.no}${x.sd ? ` berlaku sampai ${x.sd}` : ''}. ${bisa.length ? `Ruang lingkupnya menyentuh ${bisa.join(', ')}.` : ''}`,
      jalur: `Laboratorium · ${x.w.w}`,
      h1: x.n,
      lede: `Laboratorium penguji terakreditasi <strong>${teks(x.no)}</strong>${bisa.length ? ` — ruang lingkupnya menyentuh ${teks(bisa.join(', '))}` : ''}.`,
      isi: isiHtml,
      ld: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization', name: x.n, identifier: x.no,
            ...(x.a ? { address: { '@type': 'PostalAddress', streetAddress: x.a, addressRegion: x.w.w, addressCountry: 'ID' } } : {}),
            ...(x.t ? { telephone: x.t } : {}),
            hasCredential: { '@type': 'EducationalOccupationalCredential', credentialCategory: 'Akreditasi SNI ISO/IEC 17025', recognizedBy: { '@type': 'Organization', name: 'Komite Akreditasi Nasional' }, identifier: x.no, ...(x.sd ? { validUntil: x.sd } : {}) },
          },
          remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Laboratorium', jalan: 'lab/' }, { nama: x.w.w, jalan: `lab/di-${x.w.k}/` }, { nama: x.n, jalan }]),
          ...(ldTanya ? [ldTanya] : []),
        ],
      },
      batas: blokBatas({
        sumber: [{ dari: 'lab', cakupan: `satu laboratorium beserta ringkasan ruang lingkupnya` }],
        takDijawab: ['labTarif', 'labLingkupRingkas'],
      }, jalan),
    }));
    urlTemplate.lab.push([jalan, ACUAN]);
  }

  // --- pintu kemampuan ------------------------------------------------------------------
  for (const [huruf, jalanKe] of Object.entries(KEMAMPUAN_JALAN)) {
    const semua = semuaLab.filter((x) => String(x.k ?? '').includes(huruf))
      .sort((a, b) => String(a.w.w).localeCompare(String(b.w.w)) || String(a.n).localeCompare(String(b.n)));
    if (!semua.length) continue;
    // Daftar air memuat 653 lembaga; satu tabel sepanjang itu tidak menolong siapa pun dan
    // halamannya jadi 147 KB. Dipotong, jumlah yang dipotong disebutkan, dan pintu provinsi
    // yang memuat sisanya ditunjuk — bukan dihilangkan diam-diam.
    const isi = semua.slice(0, BATAS_BARIS_LAB);
    const ditahan = semua.length - isi.length;
    labBarisDitahan += ditahan;
    const jalan = `lab/${jalanKe}/`;
    const nama = ARTI[huruf];
    const perProv = new Map();
    for (const x of semua) perProv.set(x.w.w, (perProv.get(x.w.w) ?? 0) + 1);

    const tanya = [
      { t: KEMAMPUAN_TANYA[huruf] ?? `Siapa yang bisa menguji ${nama}?`,
        j: `${semua.length} laboratorium terakreditasi KAN yang ruang lingkupnya menyebut ${nama}, tersebar di ${perProv.size} provinsi.${ditahan ? ` Halaman ini memuat ${isi.length} pertama; sisanya lewat pintu provinsi.` : ' Daftarnya di halaman ini, urut provinsi lalu nama.'}` },
      { t: `Apakah daftar ini lengkap?`,
        j: `Ini seluruh laboratorium penguji berakreditasi aktif di papan KAN yang ringkasan lingkupnya menyebut ${nama}. Laboratorium yang melakukan pengujian itu tanpa menyebutnya di ringkasan lingkupnya tidak akan tertangkap.` },
    ];
    const { html: htmlTanya, ld: ldTanya } = blokTanya(tanya);

    simpan(`${jalan}index.html`, halaman({
      jalan,
      judul: `${semua.length} laboratorium yang bisa menguji ${nama} — terakreditasi KAN`,
      deskripsi: `Daftar ${semua.length} laboratorium penguji terakreditasi KAN yang ruang lingkupnya menyebut ${nama}, di ${perProv.size} provinsi, beserta masa berlaku akreditasinya.`,
      jalur: 'Laboratorium',
      h1: `Laboratorium yang bisa menguji ${nama}`,
      lede: `<strong>${n(semua.length)}</strong> laboratorium terakreditasi di ${n(perProv.size)} provinsi. Urut provinsi, lalu nama — <strong>tanpa peringkat</strong>.`,
      isi: `
  ${ditahan ? `<p class="bantuan">${n(semua.length)} laboratorium menyebut ${teks(nama)} di ringkasan lingkupnya. Halaman ini memuat ${n(isi.length)} pertama menurut provinsi lalu nama; <strong>${n(ditahan)} sisanya</strong> ada di pintu provinsinya masing-masing.</p>` : ''}
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>Laboratorium</th><th>Provinsi</th><th>Nomor</th><th>Berlaku sampai</th></tr></thead>
      <tbody>${isi.map((x) => `
        <tr><td><a href="/${teks(jalanLab(x))}">${teks(x.n)}</a></td><td>${teks(x.w.w)}</td><td class="angka">${teks(x.no)}</td><td class="angka">${teks(x.sd ?? '—')}</td></tr>`).join('')}</tbody>
    </table>
  </div>
  ${htmlTanya}
  <p class="lain"><a href="/lab/">Kemampuan lain →</a> · <a href="/index.html">Beranda</a></p>`,
      ld: {
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'ItemList', numberOfItems: isi.length, itemListElement: isi.slice(0, 100).map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.n, item: mutlak(jalanLab(x)) })) },
          remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Laboratorium', jalan: 'lab/' }, { nama: nama, jalan }]),
          ...(ldTanya ? [ldTanya] : []),
        ],
      },
      batas: blokBatas({
        sumber: [{ dari: 'lab', cakupan: `${semua.length} laboratorium yang ringkasan lingkupnya menyebut ${nama}` }],
        takDijawab: ['labLingkupRingkas', 'labTarif'],
      }, jalan),
    }));
    urlTemplate.lab.push([jalan, ACUAN]);
  }

  // --- pintu provinsi -------------------------------------------------------------------
  for (const w of (labKepala.wilayah ?? []).filter((x) => x.n > 0)) {
    const isi = (bacaBila(`lab/${w.k}.json`) ?? []).map((x) => ({ ...x, w }))
      .sort((a, b) => String(a.n).localeCompare(String(b.n)));
    if (!isi.length) continue;
    const jalan = `lab/di-${w.k}/`;
    const tanya = [
      { t: `Ada berapa laboratorium penguji terakreditasi di ${w.w}?`,
        j: `${isi.length} laboratorium yang ruang lingkupnya menyentuh usaha tani${cacahWilayah(w, 'r') ? `, ${cacahWilayah(w, 'r')} di antaranya bisa mengukur residu pestisida` : ', dan tidak satu pun bisa mengukur residu pestisida'}.` },
    ];
    const { html: htmlTanya, ld: ldTanya } = blokTanya(tanya);
    simpan(`${jalan}index.html`, halaman({
      jalan,
      judul: `Laboratorium penguji terakreditasi di ${w.w} — ${isi.length} lembaga`,
      deskripsi: `${isi.length} laboratorium penguji terakreditasi KAN di ${w.w} yang ruang lingkupnya menyentuh usaha tani, beserta kemampuan dan masa berlaku akreditasinya.`,
      jalur: 'Laboratorium',
      h1: `Laboratorium penguji di ${w.w}`,
      lede: `<strong>${n(isi.length)}</strong> laboratorium terakreditasi yang lingkupnya menyentuh usaha tani${cacahWilayah(w, 'r') ? `, <strong>${n(cacahWilayah(w, 'r'))}</strong> di antaranya bisa mengukur residu pestisida` : ''}.`,
      isi: `
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>Laboratorium</th><th>Bisa menguji</th><th>Nomor</th><th>Berlaku sampai</th></tr></thead>
      <tbody>${isi.map((x) => `
        <tr><td><a href="/${teks(jalanLab(x))}">${teks(x.n)}</a></td><td>${teks(bisaBaca(x).join(', ') || '—')}</td><td class="angka">${teks(x.no)}</td><td class="angka">${teks(x.sd ?? '—')}</td></tr>`).join('')}</tbody>
    </table>
  </div>
  ${htmlTanya}
  <p class="lain"><a href="/lab/">Cari menurut kemampuan →</a> · <a href="/index.html">Beranda</a></p>`,
      ld: {
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'ItemList', numberOfItems: isi.length, itemListElement: isi.slice(0, 100).map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.n, item: mutlak(jalanLab(x)) })) },
          remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Laboratorium', jalan: 'lab/' }, { nama: w.w, jalan }]),
          ...(ldTanya ? [ldTanya] : []),
        ],
      },
      batas: blokBatas({
        sumber: [{ dari: 'lab', cakupan: `${isi.length} laboratorium di ${w.w}` }],
        takDijawab: ['labTarif', 'labLingkupRingkas'],
      }, jalan),
    }));
    urlTemplate.lab.push([jalan, ACUAN]);
  }

  // --- pintu utama ----------------------------------------------------------------------
  {
    const jalan = 'lab/';
    const urutKemampuan = Object.keys(KEMAMPUAN_JALAN).filter((h) => (labKepala.cacah ?? {})[h]);
    simpan(`${jalan}index.html`, halaman({
      jalan,
      judul: `Ke mana sampel tanah dan uji residu dikirim — ${semuaLab.length} laboratorium terakreditasi`,
      deskripsi: `${semuaLab.length} laboratorium penguji terakreditasi KAN yang ruang lingkupnya menyentuh usaha tani, dicari menurut kemampuan lalu provinsi. Termasuk ${(labKepala.cacah ?? {}).r ?? 0} yang bisa mengukur residu pestisida.`,
      jalur: 'Laboratorium',
      h1: 'Laboratorium penguji terakreditasi',
      lede: `<strong>${n(semuaLab.length)}</strong> laboratorium yang lingkupnya menyentuh usaha tani. Dicari menurut <strong>kemampuan</strong> lebih dulu, baru tempat.`,
      isi: `
  <h2 class="judul-bagian">Menurut yang bisa diuji</h2>
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>Bisa menguji</th><th>Laboratorium</th></tr></thead>
      <tbody>${urutKemampuan.map((h) => `
        <tr><td><a href="/lab/${teks(KEMAMPUAN_JALAN[h])}/">${teks(ARTI[h])}</a></td><td class="angka">${n((labKepala.cacah ?? {})[h] ?? 0)}</td></tr>`).join('')}</tbody>
    </table>
  </div>
  <p class="bantuan">Hanya <strong>${n((labKepala.cacah ?? {}).r ?? 0)}</strong> laboratorium di seluruh Indonesia yang ruang lingkupnya menyebut residu pestisida.
  Itu bukan kekosongan data — itu keadaannya, dan ia yang membuat batas maksimum residu jadi aturan tanpa alat ukur.</p>
  <h2 class="judul-bagian">Menurut provinsi</h2>
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>Provinsi</th><th>Laboratorium</th><th>Bisa uji residu</th></tr></thead>
      <tbody>${(labKepala.wilayah ?? []).filter((w) => w.n > 0).map((w) => `
        <tr><td><a href="/lab/di-${teks(w.k)}/">${teks(w.w)}</a></td><td class="angka">${n(w.n)}</td><td class="angka">${n(cacahWilayah(w, 'r'))}</td></tr>`).join('')}</tbody>
    </table>
  </div>
  <p class="lain"><a href="/index.html">Beranda</a></p>`,
      ld: {
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'ItemList', numberOfItems: urutKemampuan.length, itemListElement: urutKemampuan.map((h, i) => ({ '@type': 'ListItem', position: i + 1, name: ARTI[h], item: mutlak(`lab/${KEMAMPUAN_JALAN[h]}/`) })) },
          remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Laboratorium', jalan }]),
        ],
      },
      batas: blokBatas({
        sumber: [{ dari: 'lab', cakupan: `${semuaLab.length} laboratorium beserta kemampuan dan provinsinya` }],
        takDijawab: ['labLingkupRingkas', 'labTarif'],
      }, jalan),
    }));
    urlTemplate.lab.push([jalan, ACUAN]);
  }
  angka.labHalaman = urlTemplate.lab.length;
  angka.labSemua = semuaLab.length;
  angka.labBarisDitahan = labBarisDitahan;
  angka.labResidu = (labKepala.cacah ?? {}).r ?? 0;
  angka.labKedaluwarsa = labKedaluwarsa;
  angka.labTanpaLingkup = labTanpaLingkup;
}

// ---------------------------------------------------------------------------
// Template 11 — balai penyuluhan: jalan keluar ketika keempat bentuk jawaban mentok
// ---------------------------------------------------------------------------
// Halaman ini satu-satunya di seluruh terbitan yang ujungnya BUKAN data, melainkan orang
// yang bisa ditanya. Karena itu ia tidak berpura-pura punya peta: balai penyuluhan tidak
// punya alamat maupun koordinat di sumbernya, dan yang menemukannya memang kecamatan,
// bukan titik. Bagi yang tinggal di sana, itu cukup.
//
// SATU HALAMAN PER BALAI, BUKAN PER KECAMATAN
// 519 balai membina lebih dari satu kecamatan. Satu halaman per kecamatan akan memecah
// balai yang sama jadi beberapa URL yang masing-masing tampak berdiri sendiri, dan
// pertanyaan "balai ini membina mana saja" jadi tidak terjawab di mana pun.
//
// NOL PENYULUH DITULIS, BUKAN DISEMBUNYIKAN
// Balai yang ada gedungnya tetapi tidak ada orangnya bukan rekaman yang gagal — ia
// keadaan yang justru perlu terbaca. Angka nol dicetak apa adanya, dengan kalimat yang
// mengatakan apa artinya.
const bppWilayah = bacaBila('bpp-wilayah.json');
if (bppWilayah) {
  const ACUAN_BPP = TARIKAN.bpp ?? '2026-08-23';
  const bppVocab = new Map();
  for (const b of bacaVocabNdjson('bpp/bpp.ndjson')) {
    bppVocab.set(`${b.region?.regency ?? ''}|${(b.label?.id ?? '').toLowerCase()}`, b);
  }
  const jalanBpp = (b) => `bpp/${b.key}/`;
  let bppNolPenyuluh = 0; let bppTakBerpasangan = 0;

  for (const w of [...bppWilayah].sort((a, b) => a.k.localeCompare(b.k))) {
    const isi = (bacaBila(`bpp/${w.k}.json`) ?? []).sort((a, b) => String(a.n).localeCompare(String(b.n)));
    if (!isi.length) continue;
    const [namaKab] = String(w.w).split(',');

    // --- satu halaman per balai --------------------------------------------------------
    const berpasangan = [];
    for (const x of isi) {
      const v = bppVocab.get(`${namaKab.trim()}|${String(x.n).toLowerCase()}`);
      if (!v) { bppTakBerpasangan++; continue; }
      berpasangan.push({ x, v });
      const jalan = jalanBpp(v);
      const orang = v.counts?.extension_workers ?? {};
      const kosong = (orang.total ?? 0) === 0;
      if (kosong) bppNolPenyuluh++;
      const kec = v.serves ?? [];
      const takBernama = v.counts?.districts_unnamed ?? 0;

      const tanya = [
        { t: `${x.n} membina kecamatan apa saja?`,
          j: kec.length
            ? `${kec.length} kecamatan: ${kec.join(', ')}.${takBernama ? ` Ditambah ${takBernama} kecamatan yang namanya tidak tercatat di sumber.` : ''}`
            : 'Kecamatan binaannya tidak tercatat namanya di sumber.' },
        { t: `Ada berapa penyuluh di ${x.n}?`,
          j: kosong
            ? 'Nol. Balai ini tercatat membina kecamatan tetapi tidak ada penyuluh yang terdaftar di dalamnya — angka nol di sini keadaan, bukan data yang belum diisi.'
            : `${orang.total} orang: ${[[orang.pns, 'PNS'], [orang.p3k, 'P3K'], [orang.thl, 'THL'], [orang.swadaya, 'swadaya'], [orang.swasta, 'swasta']].filter(([v2]) => v2).map(([v2, l]) => `${v2} ${l}`).join(', ')}.` },
        { t: `Di mana alamat ${x.n}?`,
          j: meta?.tidakAda?.bppTanpaAlamat ?? 'Alamat balai tidak tercatat di sumber.' },
      ];
      const { html: htmlTanya, ld: ldTanya } = blokTanya(tanya);

      simpan(`${jalan}index.html`, halaman({
        jalan,
        judul: `${x.n} — ${namaKab.trim()}, ${kec.length || takBernama} kecamatan binaan`,
        deskripsi: `${x.n} di ${w.w}: ${kec.length ? `membina ${kec.join(', ')}` : 'kecamatan binaannya tidak bernama di sumber'}, ${v.counts?.farmer_groups ?? 0} kelompok tani, ${orang.total ?? 0} penyuluh.`,
        jalur: `Penyuluhan · ${w.w}`,
        h1: x.n,
        lede: `Balai penyuluhan di <strong>${teks(w.w)}</strong>${kec.length ? `, membina ${n(kec.length)} kecamatan` : ''}. ${kosong ? '<strong>Nol penyuluh terdaftar.</strong>' : `<strong>${n(orang.total)}</strong> penyuluh.`}`,
        isi: `
  ${kosong ? `<div class="kartu peringatan">
    <h2>Balai ini tidak punya penyuluh terdaftar</h2>
    <p class="catatan">Ada balainya, tercatat membina ${teks(String(kec.length || takBernama))} kecamatan dan ${teks(n(v.counts?.farmer_groups ?? 0))} kelompok tani,
    tetapi nol orang terdaftar di dalamnya. Yang bisa dituju dinas kabupaten yang menaunginya.</p>
  </div>` : ''}
  <div class="kartu">
    <h2>Yang tercatat di SIMLUHTAN</h2>
    <div class="pembungkus-tabel">
      <table>
        <tbody>
          <tr><td>Kabupaten / kota</td><td>${teks(namaKab.trim())}</td></tr>
          <tr><td>Provinsi</td><td>${teks(v.region?.province ?? '—')}</td></tr>
          <tr><td>Kecamatan binaan</td><td class="angka">${n(v.counts?.districts ?? kec.length)}</td></tr>
          <tr><td>Kelompok tani terbina</td><td class="angka">${n(v.counts?.farmer_groups ?? 0)}</td></tr>
          ${v.supervising_office ? `<tr><td>Dinas yang menaungi</td><td>${teks(v.supervising_office)}</td></tr>` : ''}
        </tbody>
      </table>
    </div>
    <p class="catatan">${teks(meta?.tidakAda?.bppTanpaAlamat ?? '')}</p>
  </div>
  ${kec.length ? `
  <h2 class="judul-bagian">${n(kec.length)} kecamatan binaan</h2>
  <p class="daftar-kecamatan">${kec.map((k) => teks(k)).join(' · ')}</p>
  ${takBernama ? `<p class="bantuan">Ditambah ${n(takBernama)} kecamatan yang namanya kosong di sumber. Tidak dinamai di sini, karena menamainya berarti menebak.</p>` : ''}` : ''}
  <h2 class="judul-bagian">Penyuluh yang terdaftar</h2>
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>Status</th><th>Orang</th></tr></thead>
      <tbody>
        <tr><td>PNS aktif</td><td class="angka">${n(orang.pns ?? 0)}</td></tr>
        <tr><td>P3K</td><td class="angka">${n(orang.p3k ?? 0)}</td></tr>
        <tr><td>THL (APBN &amp; APBD)</td><td class="angka">${n(orang.thl ?? 0)}</td></tr>
        <tr><td>Swadaya</td><td class="angka">${n(orang.swadaya ?? 0)}</td></tr>
        <tr><td>Swasta</td><td class="angka">${n(orang.swasta ?? 0)}</td></tr>
        <tr><td><strong>Seluruhnya</strong></td><td class="angka"><strong>${n(orang.total ?? 0)}</strong></td></tr>
      </tbody>
    </table>
  </div>
  <p class="catatan">${teks(meta?.tidakAda?.penyuluhTanpaNama ?? LUBANG_LOKAL.penyuluhTanpaNama)}</p>
  ${(v.name_variants ?? []).length > 1 ? `<p class="catatan">Ejaan nama balai ini di sumber: ${teks((v.name_variants ?? []).join(' · '))}. Yang tercetak sebagai judul bentuk yang sudah diseragamkan; ejaan aslinya tidak ditimpa.</p>` : ''}
  ${htmlTanya}
  <p class="lain">
    <a href="/penyuluhan/${teks(w.k)}/">Balai lain di ${teks(w.w)} →</a> ·
    <a href="/penyuluhan/">Semua kabupaten</a> ·
    <a href="/index.html">Beranda</a>
  </p>`,
        ld: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'GovernmentOrganization', name: x.n,
              areaServed: kec.map((k) => ({ '@type': 'AdministrativeArea', name: k })),
              ...(v.supervising_office ? { parentOrganization: { '@type': 'GovernmentOrganization', name: v.supervising_office } } : {}),
              address: { '@type': 'PostalAddress', addressRegion: v.region?.province, addressLocality: namaKab.trim(), addressCountry: 'ID' },
            },
            remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Penyuluhan', jalan: 'penyuluhan/' }, { nama: w.w, jalan: `penyuluhan/${w.k}/` }, { nama: x.n, jalan }]),
            ...(ldTanya ? [ldTanya] : []),
          ],
        },
        batas: blokBatas({
          sumber: [{ dari: 'bpp', cakupan: 'satu balai beserta kecamatan binaan dan cacahan penyuluhnya' }],
          takDijawab: ['bppTanpaAlamat', 'penyuluhTanpaNama'],
        }, jalan),
      }));
      urlTemplate.bpp.push([jalan, ACUAN_BPP]);
    }

    // --- pintu kabupaten ---------------------------------------------------------------
    const jalanKab = `penyuluhan/${w.k}/`;
    const totalOrang = isi.reduce((a, x) => a + (x.p ?? 0), 0);
    const totalPoktan = isi.reduce((a, x) => a + (x.g ?? 0), 0);
    const tanyaKab = [
      { t: `Ada berapa balai penyuluhan di ${w.w}?`,
        j: `${isi.length} balai, membina ${w.kec} kecamatan, dengan ${totalOrang} penyuluh dan ${totalPoktan} kelompok tani terbina.` },
      { t: `Kalau aplikasi ini tidak cukup, saya tanya siapa?`,
        j: `Balai penyuluhan di kecamatan Anda. Daftarnya di halaman ini beserta kecamatan yang dibina masing-masing. ${meta?.tidakAda?.bppTanpaAlamat ?? ''}` },
    ];
    const { html: htmlTanyaKab, ld: ldTanyaKab } = blokTanya(tanyaKab);

    simpan(`${jalanKab}index.html`, halaman({
      jalan: jalanKab,
      judul: `Balai penyuluhan pertanian di ${w.w} — ${isi.length} balai, ${w.kec} kecamatan`,
      deskripsi: `${isi.length} balai penyuluhan pertanian (BPP) di ${w.w} beserta kecamatan yang dibina masing-masing, ${totalOrang} penyuluh dan ${totalPoktan} kelompok tani terbina.`,
      jalur: 'Penyuluhan',
      h1: `Balai penyuluhan di ${w.w}`,
      lede: `<strong>${n(isi.length)}</strong> balai membina <strong>${n(w.kec)}</strong> kecamatan. Cari kecamatan Anda di kolom kedua.`,
      isi: `
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>Balai</th><th>Kecamatan binaan</th><th>Penyuluh</th><th>Poktan</th></tr></thead>
      <tbody>${isi.map((x) => {
        const v = bppVocab.get(`${namaKab.trim()}|${String(x.n).toLowerCase()}`);
        const nama = v ? `<a href="/${teks(jalanBpp(v))}">${teks(x.n)}</a>` : teks(x.n);
        return `
        <tr><td>${nama}</td><td>${teks((x.k ?? []).join(', ') || '—')}</td><td class="angka">${n(x.p ?? 0)}</td><td class="angka">${n(x.g ?? 0)}</td></tr>`;
      }).join('')}</tbody>
    </table>
  </div>
  <p class="catatan">${teks(meta?.tidakAda?.bppTanpaAlamat ?? '')}</p>
  ${htmlTanyaKab}
  <p class="lain"><a href="/penyuluhan/">Kabupaten lain →</a> · <a href="/index.html">Beranda</a></p>`,
      ld: {
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'ItemList', numberOfItems: isi.length, itemListElement: isi.slice(0, 100).map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.n })) },
          remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Penyuluhan', jalan: 'penyuluhan/' }, { nama: w.w, jalan: jalanKab }]),
          ...(ldTanyaKab ? [ldTanyaKab] : []),
        ],
      },
      batas: blokBatas({
        sumber: [{ dari: 'bpp', cakupan: `${isi.length} balai di ${w.w}` }],
        takDijawab: ['bppTanpaAlamat', 'penyuluhTanpaNama'],
      }, jalanKab),
    }));
    urlTemplate.bpp.push([jalanKab, ACUAN_BPP]);
    void berpasangan;
  }

  // --- pintu utama penyuluhan -------------------------------------------------------------
  {
    const jalan = 'penyuluhan/';
    const perProvinsi = new Map();
    for (const w of bppWilayah) {
      const prov = String(w.w).split(',').slice(1).join(',').trim() || '(tanpa provinsi)';
      if (!perProvinsi.has(prov)) perProvinsi.set(prov, []);
      perProvinsi.get(prov).push(w);
    }
    const totalBalai = bppWilayah.reduce((a, w) => a + w.n, 0);
    const totalKec = bppWilayah.reduce((a, w) => a + w.kec, 0);
    simpan(`${jalan}index.html`, halaman({
      jalan,
      judul: `Balai penyuluhan pertanian — ${totalBalai} balai di ${bppWilayah.length} kabupaten`,
      deskripsi: `Daftar balai penyuluhan pertanian (BPP) se-Indonesia menurut kabupaten/kota: ${totalBalai} balai membina ${totalKec} kecamatan. Jalan keluar ketika data tidak lagi cukup — ada orangnya yang bisa ditanya.`,
      jalur: 'Penyuluhan',
      h1: 'Balai penyuluhan pertanian',
      lede: `<strong>${n(totalBalai)}</strong> balai membina <strong>${n(totalKec)}</strong> kecamatan. Ini yang dituju ketika jawaban di layar tidak lagi cukup.`,
      isi: `
  <div class="kartu">
    <h2>Kenapa halaman ini ada</h2>
    <p class="catatan">Registri bisa mengatakan apa yang terdaftar dan apa yang tertulis di label. Yang tidak bisa
    ia katakan: apakah anjuran itu cocok untuk lahan Anda, musim ini. Untuk itu ada orangnya — dan halaman ini
    yang memberi tahu di mana.</p>
  </div>
  ${[...perProvinsi.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([prov, daftar]) => `
  <h2 class="judul-bagian">${teks(prov)}</h2>
  <div class="pembungkus-tabel">
    <table>
      <thead><tr><th>Kabupaten / kota</th><th>Balai</th><th>Kecamatan</th></tr></thead>
      <tbody>${daftar.sort((a, b) => String(a.w).localeCompare(String(b.w))).map((w) => `
        <tr><td><a href="/penyuluhan/${teks(w.k)}/">${teks(String(w.w).split(',')[0])}</a></td><td class="angka">${n(w.n)}</td><td class="angka">${n(w.kec)}</td></tr>`).join('')}</tbody>
    </table>
  </div>`).join('')}
  <p class="lain"><a href="/index.html">Beranda</a></p>`,
      ld: {
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'ItemList', numberOfItems: bppWilayah.length, itemListElement: bppWilayah.slice(0, 100).map((w, i) => ({ '@type': 'ListItem', position: i + 1, name: w.w, item: mutlak(`penyuluhan/${w.k}/`) })) },
          remah([{ nama: 'Beranda', jalan: '' }, { nama: 'Penyuluhan', jalan }]),
        ],
      },
      batas: blokBatas({
        sumber: [{ dari: 'bpp', cakupan: `${totalBalai} balai di ${bppWilayah.length} kabupaten/kota` }],
        takDijawab: ['bppTanpaAlamat', 'penyuluhTanpaNama'],
      }, jalan),
    }));
    urlTemplate.bpp.push([jalan, ACUAN_BPP]);
  }
  angka.bppHalaman = urlTemplate.bpp.length;
  angka.bppNolPenyuluh = bppNolPenyuluh;
  angka.bppTakBerpasangan = bppTakBerpasangan;
}

// llms.txt — mesin jawaban dianggap pembaca kelas satu (docs/19 §8). Yang diminta cuma
// atribusi, dan itu memang syarat lisensinya.
simpan('llms.txt', `# Pranatani

> Registri pupuk, pestisida, dan varietas terdaftar Indonesia, diterbitkan sebagai halaman
> yang bisa dibaca — beserta batas jawabannya. Netral terhadap vendor: urutan merek
> mengikuti nomor pendaftaran, tanpa peringkat dan tanpa slot berbayar.

Lisensi konten: CC BY-SA 4.0 (atribusi, berbagi serupa). Kode: Apache-2.0.
Perayap tidak diblokir. Yang diminta atribusi, beserta TANGGAL TARIKAN sumber yang
tercetak di tiap halaman — registri berubah tiap musim.

## Yang diterbitkan
- /produk/  ${n(angka.produk)} pendaftaran: isi, masa berlaku, penggunaan berlabel
- /setara/  ${n(angka.setaraKelompok)} kelompok berisi identik (${n(angka.setaraProduk)} produk)
- /bahan/   bahan aktif beserta produk dan penggunaan terdaftarnya
- /hama/    OPT per komoditas, dipisah menurut takson
- /kandungan/ kandungan pupuk yang dipakai lebih dari satu produk
- /tanaman/ pintu komoditas
- /badan/   ${n(angka.badan)} pemegang pendaftaran
- /harga/   ${n(angka.hargaSeri)} seri harga harian — SELURUHNYA HARGA ECERAN
- /sediaan/ ${n(angka.sediaanResep)} resep buatan sendiri beserta kedudukan hukumnya
- /batas/   ${n(EDITORIAL.length)} tulisan tentang apa yang tidak bisa disimpulkan

## Yang wajib ikut kalau isinya dikutip
- Registri mendaftarkan, ia tidak menguji: "terdaftar" bukan "manjur".
- Dosis milik pendaftaran tiap produk, bukan milik bahannya.
- Harga yang diterbitkan harga eceran, bukan harga yang diterima petani.
- Nol dari ${n(angka.optRegistri)} OPT registri punya deskripsi gejala.
- Sifat agronomi nol dari ${n(angka.varietas)} varietas.
`);

// ---------------------------------------------------------------------------
// robots.txt, sitemap, manifest
// ---------------------------------------------------------------------------
simpan('robots.txt', [
  '# Registri terbuka. Yang dilarang cuma dua hal, dan keduanya bukan isi:',
  '# halaman hasil pencarian internal, yang menggandakan isi yang sudah punya URL-nya',
  '# sendiri; dan pecahan indeks JSON yang menyuapi permukaan aplikasi. Yang kedua bukan',
  '# halaman sama sekali — 9.301 berkas data yang isinya sudah terbit sebagai HTML di',
  '# /produk/, /bahan/, dan seterusnya. Membiarkannya dirayapi menghabiskan anggaran rayap',
  '# pada salinan mesin dari sesuatu yang versi manusianya sudah ada.',
  'User-agent: *',
  'Allow: /',
  'Disallow: /*?q=',
  'Disallow: /spec/indeks/',
  '',
  ...(ASAL ? [`Sitemap: ${ASAL}/sitemap-index.xml`, ''] : ['# Sitemap belum ditulis: jalankan dengan --asal=https://pranatani.com', '']),
].join('\n'));

if (ASAL) {
  for (const [nama, daftar] of Object.entries(urlTemplate)) {
    if (!daftar.length) continue;
    simpan(`sitemap-${nama}.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${daftar.sort().map(([j, tgl]) => `  <url><loc>${ASAL}/${j}</loc>${tgl ? `<lastmod>${tgl}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`);
  }
  simpan('sitemap-index.xml', `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.entries(urlTemplate).filter(([, d]) => d.length).map(([nama]) => `  <sitemap><loc>${ASAL}/sitemap-${nama}.xml</loc></sitemap>`).join('\n')}
</sitemapindex>
`);
}

// Manifest halaman: dipakai bangunan BERIKUTNYA untuk tahu URL mana yang hilang, supaya
// entitas yang dicabut registri dijawab 410 — bukan 404 diam-diam, yang terbaca sebagai
// "halaman ini tidak pernah ada" padahal ia ada dan pendaftarannya dicabut.
simpan('manifest.json', JSON.stringify({
  versi: 1,
  capIndeks: meta.cap ?? null,
  jumlah: Object.fromEntries(Object.entries(urlTemplate).map(([k, v]) => [k, v.length])),
  halaman: Object.entries(urlTemplate).flatMap(([t, d]) => d.map(([j, tgl]) => ({ url: `/${j}`, template: t, lastmod: tgl }))).sort((a, b) => a.url.localeCompare(b.url)),
}, null, 1) + '\n');

// ---------------------------------------------------------------------------
// Laporan
// ---------------------------------------------------------------------------
const kb = (x) => (x / 1024).toFixed(1) + ' KB';
const ukuran = [...berkas.values()].reduce((a, s) => a + Buffer.byteLength(s), 0);
const halamanHtml = [...berkas].filter(([p]) => p.endsWith('.html'));
const lewat = halamanHtml.filter(([, s]) => Buffer.byteLength(s) > ANGGARAN);
// Yang benar-benar melintas jaringan ukuran ter-gzip — dan itu yang dipakai menilai
// anggaran lapangan. Ukuran mentah tetap dilaporkan, karena ia yang menentukan berapa
// lama peramban menguraikannya di HP entry-level.
const gz = halamanHtml.map(([, s]) => gzipSync(Buffer.from(s), { level: 9 }).length).sort((a, b) => a - b);
const lewatGz = gz.filter((x) => x > ANGGARAN).length;
const kuartil = (f) => gz[Math.min(gz.length - 1, Math.floor(gz.length * f))];
const terbesar = [...berkas.entries()].map(([p, s]) => [p, Buffer.byteLength(s)]).sort((a, b) => b[1] - a[1]).slice(0, 5);

console.log(`Halaman              : ${n(Object.values(urlTemplate).reduce((a, d) => a + d.length, 0))}`);
for (const [t, d] of Object.entries(urlTemplate)) console.log(`  ${t.padEnd(18)} : ${String(d.length).padStart(6)}`);
console.log(`Berkas seluruhnya    : ${berkas.size} — ${(ukuran / 1024 / 1024).toFixed(2)} MB`);
console.log(`  ukuran halaman     : mentah p50 ${kb(Buffer.byteLength(halamanHtml[Math.floor(halamanHtml.length / 2)][1]))} · ter-gzip p50 ${kb(kuartil(0.5))}, p90 ${kb(kuartil(0.9))}, maks ${kb(gz[gz.length - 1])}`);
console.log(`  lewat anggaran     : ${lewat.length} mentah, ${lewatGz} ter-gzip, dari ${halamanHtml.length} halaman di atas ${kb(ANGGARAN)}`);
console.log(`  dosis dikonversi   : ${n(dosisTerkonversi)} sel dosis per liter dikalikan jadi per tangki ${TANGKI} L${dosisDitahanAmbang ? `; ${n(dosisDitahanAmbang)} tidak dikalikan karena hasilnya melewati ${n(BATAS_TANGKI)} per tangki — dosis terdaftarnya tetap tampil apa adanya` : ''}`);
console.log(`  tautan ke badan    : ${n(tautBadanStatis)} menunjuk halaman /badan/ sendiri${tautBadanDinamis ? `; ${n(tautBadanDinamis)} jatuh ke layar aplikasi karena badannya tak berhalaman` : ''}`);
console.log(`  kandungan dilewati : ${n(kandunganTunggal)} sidik hanya dipakai satu produk — halamannya akan menduplikasi halaman produknya`);
console.log(`  produk noindex     : ${n(produkNoindex)} halaman terbit tapi tidak diindeks — gerbang tipis docs/19 §6`);
console.log(`  bahan noindex      : ${n(bahanNoindex)} halaman bahan terbit tapi tidak diindeks — rekaman uji registri, menyebut dirinya di halamannya`);
console.log(`  gambar kemasan     : ${n(produkBergambar)} produk bergambar${gambarTerindeks ? ' — DIIZINKAN diindeks lewat --gambar-terindeks' : ', ditampilkan dengan noimageindex'}`);
console.log(`  setara dilewati    : ${n(setaraTanpaKomposisi)} kelompok tanpa komposisi pada contohnya`);
console.log(`  penggunaan ditahan : ${n(gunaDitahan)} baris penggunaan berlabel di luar ${BATAS_GUNA} per halaman`);
console.log(`  penggunaan tanpa pintu: ${n(gunaTanpaPintu)} baris tampil tanpa tautan OPT — OPT-nya tidak punya berkas di indeks`);
console.log(`  badan berpengaya   : ${n(badanBerpengaya)} badan membawa riset web tingkat D — tampil berlencana, tidak ikut ke JSON-LD${kunciBadanAneh ? `; ${kunciBadanAneh} kunci ditolak karena bentuknya` : ''}`);
console.log(`  baris badan ditahan: ${n(barisBadanDitahan)} baris produk & varietas di luar ${BATAS_BARIS_BADAN} per tabel`);
console.log(`  harga di luar misi : ${n(hargaLuar)} seri tidak diterbitkan sama sekali — baja ringan, besi beton, dan sebangsanya`);
console.log(`  komentar ditahan   : ${n(komentarDitahan)} komentar seri tidak diterbitkan karena ditulis model atau tidak lolos pemeriksa`);
console.log(`  wilayah toko gugur : ${n(wilayahGugur)} dari ${n(wilayahSemua.length)} wilayah di bawah ${BATAS_TOKO_WILAYAH} entri beralamat — ${n(tokoTanpaAlamat)} titik tanpa alamat di luar nama kabupaten`);
console.log(`  lab residu         : ${n(angka.labResidu ?? 0)} dari ${n(angka.labSemua ?? 0)} laboratorium bisa mengukur residu pestisida${angka.labKedaluwarsa ? `; ${n(angka.labKedaluwarsa)} akreditasinya sudah lewat masa berlaku per tanggal tarikan` : ''}${angka.labTanpaLingkup ? `; ${n(angka.labTanpaLingkup)} tanpa ringkasan lingkup` : ''}${angka.labBarisDitahan ? `; ${n(angka.labBarisDitahan)} baris di luar ${'250'} per pintu kemampuan, ditunjuk ke pintu provinsinya` : ''}`);
console.log(`  bpp nol penyuluh   : ${n(angka.bppNolPenyuluh ?? 0)} balai punya kecamatan binaan tetapi nol penyuluh terdaftar${angka.bppTakBerpasangan ? `; ${n(angka.bppTakBerpasangan)} baris indeks tidak berpasangan dengan kosakatanya dan dilewati` : ''}`);
console.log(`  bahan sediaan tipis: ${n(bahanSediaanTipis)} bahan boleh-tanpa-alasan-tanpa-resep, terbit tapi noindex`);
const tinjauCacah = EDITORIAL.reduce((a, e) => ({ ...a, [e.tinjau.keadaan]: (a[e.tinjau.keadaan] ?? 0) + 1 }), {});
console.log(`  editorial          : ${n(EDITORIAL.length)} tulisan + 1 induk — ${n(tinjauCacah.ditinjau ?? 0)} ditinjau, ${n(tinjauCacah.belum ?? 0)} belum, ${n(tinjauCacah.kedaluwarsa ?? 0)} tinjauannya gugur; yang belum lolos terbit tapi noindex`);
if (penandaHilang.length) console.log(`  PENANDA HILANG     : ${[...new Set(penandaHilang)].join(', ')} — prosa menyebut angka yang tidak ada di indeks`);
console.log(`  slug bertabrakan   : komoditas ${slugKomoditas.tabrakan.length}, bahan ${slugBahan.tabrakan.length}, kandungan ${slugKandungan.tabrakan.length} — diberi ekor id`);
console.log(`  daftar dipangkas   : ${dipangkas.length} halaman${dipangkas.length ? ` (contoh: ${dipangkas[0][0]} — ${dipangkas[0][1]})` : ''}`);
console.log(`  kanonik            : ${ASAL ? ASAL : 'relatif — jalankan dengan --asal=https://domain untuk sitemap dan og:'}`);
if (cacatBatas.length) {
  console.log(`\nBATAS JAWABAN CACAT  : ${cacatBatas.length} halaman`);
  for (const [j, salah] of cacatBatas.slice(0, 5)) console.log(`  ${j} — ${salah.join('; ')}`);
}
console.log('Lima berkas terbesar:');
for (const [p, x] of terbesar) console.log(`  ${kb(x).padStart(10)}  ${p}`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyimpan ke terbit/.');
  process.exit(0);
}

if (existsSync(KELUAR)) rmSync(KELUAR, { recursive: true });
for (const [p, isi] of berkas) {
  const tujuan = join(KELUAR, p);
  mkdirSync(dirname(tujuan), { recursive: true });
  writeFileSync(tujuan, isi);
}
console.log(`\nDitulis ke ${KELUAR}`);
