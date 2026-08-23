// Menarik penetapan harga TBS kelapa sawit Aceh — Distanbun Aceh, terbit sebagai selebaran
// gambar di dalam artikel berita, jadi perlu OCR.
//
//   node harga_data/tarik-tbs-aceh.mjs           # tarik yang belum ada, OCR, gabung
//   node harga_data/tarik-tbs-aceh.mjs --ulang   # olah ulang seluruhnya
//
// Menuntut binernya sudah dikompilasi:
//   swiftc -O harga_data/ocr-vision.swift -o harga_data/bin/ocr-vision
//
// ARSIPNYA UTUH DALAM SATU PERMINTAAN, DAN ITU KEBALIKAN SULBAR
// Halaman /berita dirender di peramban, jadi sekilas ia tampak menuntut penjelajahan. Ia
// tidak: skrip halamannya sendiri menyusun alamat `'/json' + pathname + '.json'` dan menarik
// isinya dari sana. Endpoint itu mengembalikan SELURUH 1.765 artikel dalam satu respons —
// tanpa paginasi, tanpa kunci, tanpa autentikasi. Kelengkapan seri karena itu bisa
// dibuktikan, bukan diharapkan; ini satu-satunya provinsi sejauh ini yang arsipnya bisa
// dienumerasi sepenuhnya. Bandingkan Sulbar, yang gugur justru karena `?page=N` diabaikan.
//
// (Pelajaran yang sama dengan SP2KP: halaman yang tampak dirender peramban kerap punya
// endpoint bersih di belakangnya. Yang menemukannya membaca skrip halaman, bukan menebak.)
//
// HARGANYA HANYA ADA DI GAMBAR
// Prosa artikelnya menceritakan rapat — siapa hadir, di mana, apa yang dibahas — dan tidak
// pernah menyebut angkanya. Dari 42 artikel penetapan, hanya 4 memuat rupiah di badan teks,
// dan keempatnya artikel berita, bukan penetapan. Angkanya ada di selebaran yang dilampirkan.
// Tanpa OCR, provinsi ini akan tergolong "rapatnya ada, harganya tidak diterbitkan" — persis
// kesimpulan yang diambil untuk Sulbar. Bedanya di sini gambarnya memang memuat tabelnya.
//
// SELEBARANNYA DIKENALI DARI ISI, BUKAN DARI URUTAN — DAN BUKAN DARI KATANYA
// Tiap artikel melampirkan dua sampai lima gambar: tangkapan layar Zoom, foto ruang rapat,
// dan selebaran harganya. Urutannya tidak tetap — kadang lampiran ketiga, kadang kelima.
//
// Percobaan pertama mengenalinya dari kata kunci ("INFO HARGA", "MITRA PLASMA", "RENDEMEN")
// dan gagal pada 38 dari 42 artikel, karena Aceh MENGGANTI TATA LETAK SELEBARANNYA dua kali
// dan kata kuncinya ikut berubah. Yang dipakai sekarang tanda yang tidak berubah: sebuah
// gambar adalah selebaran harga bila ≥10 barisnya berjangkar ke tabel rendemen tetap.
// Selebaran diurai lebih dulu, baru dinilai — pengenalan dan penguraian jadi satu langkah.
//
// TIGA GENERASI TATA LETAK, DAN DUA DI ANTARANYA DIBACA
//   A (2021–2025) : hanya pekebun plasma, ribuan dipisah TITIK ("2.290")
//   B (2026→)     : plasma DAN swadaya berdampingan, ribuan dipisah KOMA ("3,455")
//   C (2023)      : pindaian berita acara — ditolak, lihat catatan di bawah
// Karena kolomnya bergeser antar-generasi, tak satu pun koordinat kolom ditulis di berkas
// ini. Baris diurai menurut JENIS selnya: persen yang cocok tabel rendemen menjadi jangkar,
// bilangan 500–10.000 sesudahnya menjadi harga, bilangan bulat kelipatan 10 antara 40 dan 100
// menjadi penanda komposisi tenera, dan harga sesudah penanda itu menjadi harga swadaya.
//
// GENERASI C DITOLAK, DAN PENOLAKANNYA KEHILANGAN SESUATU
// Dua artikel Januari–Maret 2023 melampirkan pindaian berita acara, bukan selebaran: lembar
// kerja lengkap berkolom R-CPO, R-IS, harga inti sawit, dan rumusnya. Rendemennya di sana
// BERBEDA-BEDA per umur dan per periode (14,49% sampai 21,30% pada satu lembar) — yaitu
// rendemen yang benar-benar dihitung, bukan tabel tetap. Itu lebih berharga daripada yang
// diserap berkas ini, dan ia justru yang tidak terserap: barisnya terlalu rapat sehingga
// Vision menggabungkan tigabelas baris tabel jadi satu, dan susunannya tidak bisa dipulihkan
// dari koordinat. Ia ditolak sendiri oleh uji jangkar (rendemennya tidak cocok tabel tetap),
// yang kebetulan perilaku yang benar. Lembar itu juga memuat nama pejabat dan NIP.
//
// Ini kekosongan yang diketahui, bukan yang tersembunyi: lihat docs/16 bagian 8b.
//
// DUA TABEL BERBAGI SATU KISI, DAN JUMLAH BARISNYA BERBEDA
// Sisi kiri harga pekebun MITRA PLASMA menurut umur tanaman: 13 baris, 3 tahun sampai 25
// tahun. Sisi kanan harga pekebun MITRA SWADAYA menurut KOMPOSISI TENERA/DURA: 7 baris,
// 100% tenera sampai 40% tenera. Keduanya tercetak berdampingan sehingga tampak satu tabel,
// padahal barisnya tidak berpasangan sama sekali — baris kedelapan sisi kiri (10–20 tahun)
// tidak punya lawan di sisi kanan. Membacanya sebagai satu tabel berbaris-13 akan memasangkan
// harga swadaya ke umur yang salah pada tiap barisnya.
//
// Perbedaan sumbunya sendiri temuan: pekebun plasma ditakar menurut UMUR karena kebunnya
// tercatat, pekebun swadaya menurut BAHAN TANAM karena kebunnya tidak. Dura menghasilkan
// minyak jauh lebih sedikit daripada tenera, dan proporsi dura itulah yang jadi pengganti
// umur ketika umur tidak diketahui.
//
// RENDEMENNYA TETAP, DAN ITU DIPAKAI DUA KALI
// Tigabelas nilai rendemen — 15,82% sampai 21,83% lalu turun ke 19,65% — IDENTIK di seluruh
// periode yang terbaca. Ia tabel peraturan, bukan pengukuran bulanan. Dua akibatnya:
//
//   1. Ia jadi jangkar baris. Kolom umur paling kiri kerap tidak terbaca OCR (pada berkas uji
//      hanya 6 dari 13 baris), tetapi kolom rendemennya hampir selalu terbaca. Umur karena
//      itu diturunkan dari kecocokan rendemen terhadap tabel tetap, bukan dari posisi semata
//      — dan baris yang rendemennya tidak cocok ditolak alih-alih ditebak.
//   2. Ia jadi uji silang. Tabel yang rendemennya menyimpang dari yang tetap itu menandakan
//      OCR salah baca atau tata letak berubah; keduanya alasan menolak, bukan meneruskan.
//
// BENTUK KURVANYA MENANGKAP APA YANG JULAT LOLOSKAN
// Kalteng mengajarkan bahwa nilai yang masuk akal SEBAGAI HARGA bisa tetap salah tempat.
// Di sini bentuknya lebih tajam daripada di provinsi mana pun karena tabel rendemennya naik
// lalu TURUN: harga plasma wajib naik menurut umur sampai puncaknya di 10–20 tahun, lalu
// turun sampai 25 tahun. Kebun tua menghasilkan lebih sedikit, dan tabelnya mengakui itu.
// Uji ini karena itu memeriksa dua arah, bukan satu.
//
// ANGKANYA MEMAKAI DUA KELAZIMAN SEKALIGUS
// Harga tercetak dengan koma sebagai pemisah ribuan — "3,455" berarti Rp3.455 — sementara
// rendemen memakai koma sebagai desimal — "21,83%". Satu berkas, dua kelaziman. Pengurai
// yang memilih salah satunya akan menerbitkan Rp3,46 atau rendemen 2.183%.
//
// DATA PRIBADI ADA DI SUMBERNYA, DAN TIDAK IKUT KELUAR
// Artikelnya menyebut nama peserta rapat, dan tangkapan layar Zoom-nya menampilkan nama
// tampilan peserta. Yang keluar dari berkas ini hanya angka tabel: tidak ada prosa artikel,
// tidak ada hasil OCR selain selebaran harga, tidak ada nama. Penjaga di akhir memeriksa
// keluarannya, bukan niatnya.

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const UA = 'OpenProtocols/0.1 (+https://github.com/bayusyerli/open_protocol) riset harga sawit';
const BASIS = 'https://distanbun.acehprov.go.id';
const DAFTAR = `${BASIS}/json/berita.json?mode=origin`;
const KELUAR = join('harga_data', 'tbs-aceh.ndjson');
const SINGGAH = join('harga_data', 'mentah', 'aceh');
const OCR = join('harga_data', 'bin', 'ocr-vision');
const ulang = process.argv.includes('--ulang');

if (!existsSync(OCR)) {
  console.error(`Biner OCR belum ada. Kompilasi dulu:\n  swiftc -O harga_data/ocr-vision.swift -o ${OCR}`);
  process.exit(1);
}

// robots.txt Aceh berbunyi `User-agent: * Allow: /` tanpa Crawl-delay. Jeda tetap dipasang:
// tidak adanya batas tertulis bukan undangan menghantam host dinas provinsi.
const JEDA_MS = 500;
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

const BULAN = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
  agust: 8, sept: 9, okt: 10, nov: 11, des: 12, jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7,
};

// Tabel rendemen tetap Aceh, berurut dari pita termuda. Nilainya identik di seluruh periode
// yang terbaca; ia dipakai sebagai jangkar baris DAN sebagai uji silang. Lihat catatan kepala.
const RENDEMEN = [
  ['3', 0.1582], ['4', 0.1778], ['5', 0.1863], ['6', 0.1971], ['7', 0.2097],
  ['8', 0.2114], ['9', 0.2128], ['10-20', 0.2183], ['21', 0.2043], ['22', 0.2022],
  ['23', 0.2020], ['24', 0.1997], ['25', 0.1965],
];
const PITA = RENDEMEN.map(([u]) => u);

// Komposisi bahan tanam pada sisi swadaya, berurut dari yang paling banyak tenera.
const TENERA = [100, 90, 80, 70, 60, 50, 40];

// Harga memakai koma sebagai pemisah RIBUAN ("3,455" = 3455) sementara persen memakainya
// sebagai desimal ("21,83%"). Keduanya dibaca fungsi terpisah supaya kelazimannya tidak
// pernah tertukar diam-diam — lihat catatan kepala.
function angkaHarga(s) {
  const t = String(s).trim();
  if (/rp/i.test(t)) return null;           // "Rp. 13.910,60" itu harga CPO, bukan harga TBS
  const m = t.replace(/[^\d.,]/g, '').match(/^(\d{1,2})[.,](\d{3})$/);
  const v = m ? Number(m[1] + m[2]) : (/^\d{3,4}$/.test(t) ? Number(t) : null);
  return v !== null && v >= 500 && v <= 10000 ? v : null;
}

// Penanda komposisi pada sisi swadaya: bilangan bulat kelipatan sepuluh antara 40 dan 100.
// Ia dibedakan dari harga oleh besarannya sendiri, bukan oleh letaknya — itu yang membuat
// pengurai ini bertahan ketika kolomnya bergeser antar-generasi.
const penandaTenera = (s) => {
  const t = String(s).trim();
  return /^\d{2,3}$/.test(t) && TENERA.includes(Number(t)) ? Number(t) : null;
};

function angkaPersen(s) {
  const m = String(s).match(/(\d{1,3})[.,](\d{1,2})\s*%/);
  if (m) return Number(`${m[1]}.${m[2]}`) / 100;
  const n = String(s).match(/^(\d{1,3})\s*%$/);
  return n ? Number(n[1]) / 100 : null;
}

// "Rp. 15.657,13" — di sini titik memisahkan ribuan dan koma memisahkan desimal, kebalikan
// dari kolom harga TBS di selebaran yang sama. Karena itu ia fungsi ketiga, bukan cabang.
function angkaRupiah(s) {
  const m = String(s).match(/Rp\.?\s*([\d.]+)(?:,(\d{1,2}))?/i);
  if (!m) return null;
  const utuh = Number(m[1].replace(/\./g, ''));
  return Number.isFinite(utuh) && utuh > 1000 ? utuh + (m[2] ? Number(`0.${m[2]}`) : 0) : null;
}

async function ambil(alamat, biner = false) {
  const r = await fetch(alamat, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(40000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} untuk ${alamat}`);
  return biner ? Buffer.from(await r.arrayBuffer()) : r.text();
}

// "29 Juli - 11 Agustus 2026", "1 - 14 Juli 2026", "8-21 April 2026". Yang diambil tanggal
// MULAI berlakunya, bukan tanggal artikel: artikel kerap terbit beberapa hari setelah rapat,
// dan yang menjadi harga adalah periode berlakunya.
function periodeBerlaku(teks) {
  const t = teks.replace(/\s+/g, ' ');
  const m = t.match(
    /(\d{1,2})\s*(?:([A-Za-z]+)\s*)?[-–]\s*(\d{1,2})\s*([A-Za-z]+)\s*(\d{4})/,
  );
  if (!m) return null;
  const [, d1, b1, , b2, th] = m;
  const bulan = BULAN[(b1 ?? b2).toLowerCase()] ?? BULAN[(b1 ?? b2).toLowerCase().slice(0, 4)];
  if (!bulan) return null;
  const hari = Number(d1);
  if (hari < 1 || hari > 31) return null;
  return `${th}-${String(bulan).padStart(2, '0')}-${String(hari).padStart(2, '0')}`;
}

// Baris disusun ulang dari koordinat y — Vision membaca kolom demi kolom, bukan baris demi
// baris. Toleransinya setengah tinggi huruf; lebih longgar akan menggabungkan dua baris tabel.
function keBaris(kotak) {
  if (!kotak?.length) return [];   // gambar tanpa teks terbaca — foto ruang rapat, misalnya
  const urut = [...kotak].sort((a, b) => b.y - a.y);
  const keluar = [];
  let kini = [urut[0]];
  for (const k of urut.slice(1)) {
    if (Math.abs(k.y - kini[kini.length - 1].y) < 0.012) kini.push(k);
    else { keluar.push(kini); kini = [k]; }
  }
  keluar.push(kini);
  return keluar.map((b) => b.sort((p, q) => p.x - q.x));
}

function uraiSelebaran(hasil) {
  const baris = keBaris(hasil.baris);

  const plasma = {}, swadaya = {}, rendemenBaca = {};
  for (const row of baris) {
    // Baris tabel dikenali dari RENDEMENNYA, bukan dari umurnya dan bukan dari kolomnya:
    // kolom umur kerap tak terbaca OCR, dan letak kolom berubah antar-generasi selebaran.
    // Baris tanpa rendemen yang cocok tabel tetap dilewati — termasuk baris judul, catatan
    // "BERLAKU MULAI DARI", blok Indeks K, dan seluruh isi pindaian berita acara.
    // Kecocokan harus PERSIS sampai empat desimal, bukan sekadar dekat. Pita 22 tahun
    // (20,22%) dan 23 tahun (20,20%) hanya berjarak 0,0002; toleransi 0,0005 yang tampak
    // ketat menyerap keduanya ke pita yang sama, dan pita 23 hilang dari seluruh rekaman
    // tanpa satu pun uji berbunyi. Nilai tabelnya bulat empat desimal, jadi persis bisa.
    const cocok = (v) => RENDEMEN.find(([, r]) => Math.round(r * 1e4) === Math.round(v * 1e4));
    let i = row.findIndex((k) => {
      const v = angkaPersen(k.teks);
      return v !== null && cocok(v);
    });
    if (i < 0) continue;
    const pita = cocok(angkaPersen(row[i].teks))[0];
    const nilai = angkaPersen(row[i].teks);
    rendemenBaca[pita] = nilai;

    // Sesudah jangkar, sel dibaca menurut jenisnya. Dua harga pertama milik pekebun plasma;
    // penanda komposisi tenera menutup bagian itu dan membuka bagian swadaya. Selebaran
    // generasi A tidak punya penanda itu sama sekali, dan berhenti setelah dua harga.
    const kiri = [], kanan = [];
    let tenera = null;
    for (const k of row.slice(i + 1)) {
      const tn = penandaTenera(k.teks);
      if (tn !== null && tenera === null) { tenera = tn; continue; }
      const h = angkaHarga(k.teks);
      if (h === null) continue;
      (tenera === null ? kiri : kanan).push(h);
    }
    if (kiri.length) plasma[pita] = { timur: kiri[0], ...(kiri[1] ? { barat: kiri[1] } : {}) };
    // Sisi swadaya sengaja TIDAK dikunci ke pita umur baris ini — ia tabel lain yang kebetulan
    // sebaris. Lihat catatan "DUA TABEL BERBAGI SATU KISI" di kepala berkas.
    if (tenera !== null && kanan.length)
      swadaya[String(tenera)] = { timur: kanan[0], ...(kanan[1] ? { barat: kanan[1] } : {}) };
  }

  // Indeks K terbit dua kali — satu untuk wilayah timur, satu untuk barat. Ia diambil dari
  // baris yang memuat "INDEK"/"INDES" (OCR mengeja keduanya) dan bukan dari posisi tetap.
  let indeks = null;
  for (const row of baris) {
    if (!/INDE[KS]/i.test(row.map((k) => k.teks).join(' '))) continue;
    const p = row.map((k) => angkaPersen(k.teks)).filter((v) => v !== null && v > 0.5 && v < 1);
    if (p.length >= 2) indeks = { timur: p[0], barat: p[1] };
    else if (p.length === 1) indeks = { timur: p[0] };
    if (indeks) break;
  }

  // CPO dan kernel dua-duanya tercetak "Rp. …". Yang membedakan hanya letaknya: CPO di atas,
  // kernel di bawah. Diambil menurut y, dan bila hanya satu terbaca, tak satu pun dipakai —
  // menebak mana yang terbaca akan menukar CPO dengan kernel tanpa ketahuan.
  const rupiah = hasil.baris
    .map((b) => ({ y: b.y, v: angkaRupiah(b.teks) }))
    .filter((o) => o.v !== null)
    .sort((a, b) => b.y - a.y);
  const rumus = rupiah.length >= 2 ? { cpo: rupiah[0].v, kernel: rupiah[1].v } : null;

  // Periodenya tercetak di panel kanan, kadang sebaris dengan "BERLAKU MULAI DARI" dan kadang
  // di baris berikutnya. Ia dicari baris demi baris dari atas ke bawah dan yang pertama cocok
  // dipakai. Yang membuat ini aman: pola menuntut RENTANG dua tanggal, sedangkan tanggal rapat
  // berikutnya ("Tanggal : 13 Agustus 2025") tunggal dan karena itu tidak pernah tertangkap.
  let mulai = null;
  for (const row of baris) {
    mulai = periodeBerlaku(row.map((k) => k.teks).join(' '));
    if (mulai) break;
  }

  return { plasma, swadaya, rendemen: rendemenBaca, indeks, rumus, mulai };
}

// Tiga uji yang saling bebas. Satu pun gagal, seluruh selebaran ditolak — sebagian tabel yang
// benar tidak lebih berguna daripada tabel yang salah, karena tak ada cara menandai bagiannya.
function tolakKarena(u) {
  const pitaAda = Object.keys(u.plasma);
  if (pitaAda.length < 10) return `hanya ${pitaAda.length} pita plasma terbaca (perlu ≥10)`;
  if (!u.mulai) return 'periode berlaku tak terbaca';

  // 1. Julat — harga TBS di luar Rp500–10.000/kg bukan harga TBS.
  const nilai = Object.values(u.plasma).flatMap((v) => [v.timur, v.barat].filter(Boolean))
    .concat(Object.values(u.swadaya).flatMap((v) => [v.timur, v.barat].filter(Boolean)));
  const luar = nilai.filter((v) => v < 500 || v > 10000);
  if (luar.length) return `${luar.length} harga di luar julat: ${luar.slice(0, 3).join(', ')}`;

  // 2. Bentuk kurva plasma. Ruas NAIK diuji ketat: dari 3 tahun ke puncaknya harga bergerak
  //    2.290 → 3.150, langkah besar yang tak mungkin terbalik karena salah baca satu digit.
  //    Ruas TURUN diuji longgar — hanya puncaknya dan ujungnya — karena tabel Aceh sendiri
  //    tidak menurun rapi di sana: pada Agustus 2025 pita 23 tercetak Rp3.023 sementara pita
  //    22 Rp3.011, padahal rendemennya justru lebih rendah. Menuntut penurunan berpasangan
  //    akan menolak lembar yang terbaca BENAR, dan menolak yang benar sama merusaknya dengan
  //    menerima yang salah.
  const puncak = '10-20';
  const naik = PITA.slice(0, PITA.indexOf(puncak) + 1).filter((p) => u.plasma[p]);
  for (let i = 1; i < naik.length; i++)
    if (u.plasma[naik[i]].timur <= u.plasma[naik[i - 1]].timur)
      return `kurva naik terlanggar di pita ${naik[i]} (${u.plasma[naik[i]].timur} ≤ ${u.plasma[naik[i - 1]].timur})`;
  if (u.plasma[puncak]) {
    const tertinggi = Math.max(...Object.values(u.plasma).map((v) => v.timur));
    if (u.plasma[puncak].timur < tertinggi)
      return `puncak bukan di pita ${puncak} (${u.plasma[puncak].timur} < ${tertinggi})`;
    const ujung = ['25', '24', '23'].map((p) => u.plasma[p]?.timur).find(Boolean);
    if (ujung !== undefined && ujung >= u.plasma[puncak].timur)
      return `pita tertua tidak turun dari puncak (${ujung} ≥ ${u.plasma[puncak].timur})`;
  }

  // 3. Bentuk kurva swadaya — makin banyak dura, makin sedikit minyak, makin rendah harganya.
  const sw = TENERA.filter((t) => u.swadaya[String(t)]);
  for (let i = 1; i < sw.length; i++)
    if (u.swadaya[String(sw[i])].timur >= u.swadaya[String(sw[i - 1])].timur)
      return `kurva swadaya terlanggar di tenera ${sw[i]}%`;

  // 4. Silang — wilayah barat selalu lebih rendah daripada timur (jaraknya ke pelabuhan
  //    ekspor lebih jauh). Tertukarnya kedua kolom akan lolos ketiga uji di atas.
  const tertukar = Object.entries(u.plasma).filter(([, v]) => v.barat && v.barat > v.timur);
  if (tertukar.length) return `wilayah barat > timur pada ${tertukar.length} pita — kolom mungkin tertukar`;

  return null;
}

// ————— jalan —————

mkdirSync(SINGGAH, { recursive: true });

const lama = existsSync(KELUAR)
  ? readFileSync(KELUAR, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))
  : [];
const sudah = new Set(lama.map((r) => r.slug));   // olah-ulang dilewati per artikel

console.log('Menarik daftar artikel (satu permintaan, seluruh arsip)…');
const daftar = JSON.parse(await ambil(DAFTAR)).data;
const penetapan = daftar.filter((r) => /penetapan\s+harga.*\bTBS\b|harga\s+TBS/i.test(r.judul));
console.log(`  ${daftar.length} artikel, ${penetapan.length} menyebut penetapan harga TBS`);

const perlu = penetapan.filter((x) => ulang || !sudah.has(x.slug));
console.log(`  ${perlu.length} perlu diolah\n`);

const baru = [], ditolak = [];
for (const [i, art] of perlu.entries()) {
  process.stderr.write(`[${i + 1}/${perlu.length}] ${art.tanggal.trim()} … `);
  try {
    const d = JSON.parse(await ambil(`${BASIS}/json${art.slug}.json?mode=origin`));
    const gambar = [...(d.konten ?? '').matchAll(/<img[^>]+src="([^"]+)"/gi)].map((m) => m[1]);
    if (!gambar.length) { ditolak.push({ slug: art.slug, tgl: art.tanggal.trim(), sebab: 'tanpa lampiran gambar' }); process.stderr.write('tanpa gambar\n'); continue; }

    const jalur = [];
    for (const g of gambar) {
      const nama = g.split('/').pop().replace(/[^\w.-]/g, '_');
      const p = join(SINGGAH, nama);
      if (!existsSync(p)) { writeFileSync(p, await ambil(g.startsWith('http') ? g : BASIS + g, true)); await tidur(JEDA_MS); }
      jalur.push(p);
    }

    const hasil = JSON.parse(execFileSync(OCR, jalur, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
    // Tiap lampiran diurai, lalu yang paling banyak pitanya dipilih. Pengenalan dan
    // penguraian jadi satu langkah — lihat catatan "DIKENALI DARI ISI" di kepala berkas.
    // Tangkapan layar Zoom dan foto ruang rapat berakhir dengan nol pita, jadi tidak pernah
    // menang; berkas yang seluruh lampirannya nol pita ditolak beserta jumlah lampirannya.
    const u = hasil
      .map(uraiSelebaran)
      .sort((a, b) => Object.keys(b.plasma).length - Object.keys(a.plasma).length)[0];
    if (!u || !Object.keys(u.plasma).length) { ditolak.push({ slug: art.slug, tgl: art.tanggal.trim(), sebab: `${gambar.length} lampiran, tak satu pun berjangkar ke tabel rendemen` }); process.stderr.write('bukan selebaran\n'); continue; }

    const sebab = tolakKarena(u);
    if (sebab) { ditolak.push({ slug: art.slug, tgl: art.tanggal.trim(), sebab }); process.stderr.write(`ditolak — ${sebab}\n`); continue; }

    baru.push({
      slug: art.slug, t: u.mulai, judul: art.judul.trim(),
      plasma: u.plasma, swadaya: u.swadaya, rendemen: u.rendemen,
      ...(u.indeks ? { indeks_k: u.indeks } : {}), ...(u.rumus ?? {}),
    });
    process.stderr.write(`ok ${u.mulai} — ${Object.keys(u.plasma).length} pita, ${Object.keys(u.swadaya).length} komposisi\n`);
  } catch (e) {
    ditolak.push({ slug: art.slug, tgl: art.tanggal.trim(), sebab: String(e.message).slice(0, 80) });
    process.stderr.write(`galat — ${String(e.message).slice(0, 60)}\n`);
  }
  await tidur(JEDA_MS);
}

// Dikunci menurut PERIODE BERLAKU, bukan menurut slug. Aceh kerap menerbitkan penetapan yang
// sama dua kali — sekali sebagai "Rapat Penetapan…" dan sekali sebagai "Penetapan Harga…" —
// dan keduanya melampirkan selebaran yang identik. Berkunci slug, satu penetapan akan terhitung
// dua kali dan seri mingguannya tampak lebih rapat daripada kenyataannya. Yang menang rekaman
// dengan pita terbanyak; kalau seri, yang terbaru.
const peta = new Map(lama.map((r) => [r.t, r]));
for (const r of baru) {
  const ada = peta.get(r.t);
  if (!ada || Object.keys(r.plasma).length >= Object.keys(ada.plasma).length) peta.set(r.t, r);
}
const keluar = [...peta.values()].sort((a, b) => a.t.localeCompare(b.t));

// Penjaga memeriksa KELUARAN, bukan niat. Artikel dan tangkapan layar Zoom membawa nama
// peserta rapat; kalau salah satunya pernah bocor ke rekaman, di sinilah ia berhenti.
const TERLARANG = ['nama', 'nip', 'peserta', 'telepon', 'email', 'jabatan', 'zoom'];
const bocor = TERLARANG.filter((f) => JSON.stringify(keluar).toLowerCase().includes(f));
if (bocor.length) {
  console.error(`\nBERHENTI: keluaran memuat medan terlarang: ${bocor.join(', ')}`);
  process.exit(1);
}

writeFileSync(KELUAR, keluar.map((r) => JSON.stringify(r)).join('\n') + '\n');

const n = (x) => x.toLocaleString('id-ID');
console.log(`\nPenetapan terurai      : ${n(keluar.length)} (${n(baru.length)} baru)`);
if (keluar.length) console.log(`Rentang                : ${keluar[0].t} → ${keluar[keluar.length - 1].t}`);
console.log(`Ditolak sesi ini       : ${n(ditolak.length)}`);
for (const d of ditolak) console.log(`  ${d.tgl.padEnd(26)} ${d.sebab}`);
console.log(`Ditulis ke             : ${KELUAR}`);
