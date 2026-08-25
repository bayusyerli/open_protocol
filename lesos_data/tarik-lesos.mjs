// Menarik daftar klien/operator bersertifikat organik dari LeSOS (Lembaga Sertifikasi
// Organik Seloliman), badan sertifikasi terakreditasi KAN nomor LSPr-092-IDN. Skema
// sertifikasinya nomor 4 dan 5 mencakup pupuk, pestisida organik, dan benih — itulah
// satu-satunya alasan registri ini menyentuh Pranatani.
//
//   node lesos_data/tarik-lesos.mjs [direktori-keluaran]
//
// LISENSI — BACA SEBELUM MEMAKAI KELUARANNYA.
// Situsnya tidak menyatakan lisensi apa pun, hanya "© Lembaga Sertifikasi Organik
// Seloliman". Nomor sertifikat, tanggal, dan ruang lingkup adalah fakta dan tidak berhak
// cipta; kompilasi dan fotonya lain soal. Karena itu keluarannya BENIH PRIVAT: dipakai
// menghitung dan mencocokkan ke PUKPES, TIDAK diterbitkan ulang. Keluaran default jatuh
// ke lesos_data/privat/ yang di-gitignore. Pola yang sama dengan harga_data/privat/.
//
// DATA PRIBADI — DIBUANG SEBELUM MENYENTUH DISK.
// Tiap halaman rinci memuat nama seorang narahubung beserta nomor HP pribadinya. Skema
// principal sudah memutuskan perkara ini: perorangan tidak masuk, karena halaman profil
// untuk orang bernama adalah pengumpulan data pribadi tanpa dasar pemrosesan di sini.
// Maka blok itu dibuang di `bersihkanPII()` SEBELUM HTML-nya disinggahkan — bukan
// disimpan lalu disaring di hilir. Singgahan di disk tidak pernah memuatnya.
//
// LAJU. Servernya membatasi diri di sekitar satu permintaan tiap 15-30 detik dan menjawab
// 429 kalau dilanggar. Skrip ini berjalan satu utas dengan jeda yang menyesuaikan diri,
// jadi satu tarikan penuh memakan ~2 jam. Singgahannya membuat tarikan bisa dilanjutkan
// kalau putus. robots.txt situsnya mengizinkan seluruh jalan (`Disallow:` kosong).

import { writeFileSync, readFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const UA = 'OpenProtocols/0.1 (+https://github.com/bayusyerli/open_protocol) riset sertifikasi organik';
const BASE = 'https://lesosindonesia.com';
const out = process.argv[2] ?? 'lesos_data/privat';
const singgah = join(out, 'singgahan');
mkdirSync(singgah, { recursive: true });

// Satu penarik pada satu waktu. Dua proses pada server berbatas laju bukan cuma dua kali
// lebih cepat kehabisan jatah — keduanya saling memicu 429 lalu sama-sama mundur, dan
// keduanya menimpa klien.json dengan potongan hasil yang berlainan. Kunci ini memuat PID;
// kunci milik proses yang sudah mati dianggap tidak ada.
const kunci = join(out, '.kunci');
if (existsSync(kunci)) {
  const pid = Number(readFileSync(kunci, 'utf8').trim());
  let hidup = false;
  try { process.kill(pid, 0); hidup = true; } catch { hidup = false; }
  if (hidup) {
    console.error(`tarikan lain sedang jalan (pid ${pid}). Tunggu, atau hapus ${kunci} kalau yakin ia mati.`);
    process.exit(1);
  }
  console.error(`kunci basi dari pid ${pid} dibuang.`);
}
writeFileSync(kunci, String(process.pid));
const lepasKunci = () => { try { unlinkSync(kunci); } catch {} };
process.on('exit', lepasKunci);
for (const sinyal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(sinyal, () => { lepasKunci(); process.exit(1); });
}

const tidur = (ms) => new Promise((r) => setTimeout(r, ms));
let jeda = 22_000;
const JEDA_MIN = 18_000;
const JEDA_MAX = 90_000;

let kontakDibuang = 0;

// Dijalankan sebelum penyinggahan. Dua lapis: blok narahubung dibuang utuh, lalu apa pun
// yang berbentuk nomor HP disapu di seluruh dokumen kalau-kalau ada varian markah yang
// lolos lapis pertama. Nomor sertifikat tidak ikut tersapu — pola "0" lalu "8" lalu digit
// tidak pernah muncul di dalamnya ("...-08-26" berhenti di tanda hubung).
function bersihkanPII(html) {
  let t = html.replace(
    /<medium[^>]*>\s*Kontak Person:[\s\S]*?<\/medium>/gi,
    () => { kontakDibuang++; return '<!-- narahubung dibuang saat panen: data pribadi -->'; },
  );
  t = t.replace(/(?:\+?62|0)\s?8\d[\d\s.\-]{6,14}\d/g, '[nomor-dibuang]');
  return t;
}

async function ambil(url, kunci) {
  const berkas = join(singgah, kunci.replace(/[^A-Za-z0-9]+/g, '_').slice(0, 120) + '.html');
  if (existsSync(berkas)) {
    const isi = readFileSync(berkas, 'utf8');
    if (isi.length > 500) return isi;
  }
  for (let coba = 0; coba < 8; coba++) {
    let r;
    try {
      r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(45_000) });
    } catch (e) {
      process.stderr.write(`galat ${e.name} ${url}\n`);
      await tidur(20_000);
      continue;
    }
    if (r.status === 429) {
      jeda = Math.min(JEDA_MAX, Math.round(jeda * 1.5));
      process.stderr.write(`429 -> jeda ${Math.round(jeda / 1000)}d ${url}\n`);
      await tidur(jeda);
      continue;
    }
    if (!r.ok) {
      process.stderr.write(`HTTP ${r.status} ${url}\n`);
      return '';
    }
    const bersih = bersihkanPII(await r.text());
    writeFileSync(berkas, bersih);
    jeda = Math.max(JEDA_MIN, Math.round(jeda * 0.97));
    await tidur(jeda);
    return bersih;
  }
  return '';
}

const teks = (s) =>
  s.replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ').trim();

// Bagian antara <a> dan <h5> ditangkap utuh lalu digali terpisah. Menaruh <img> sebagai
// grup opsional di sini tidak jalan: `[\s\S]*?` yang malas lebih suka mencocokkan kosong
// dan melewatinya, jadi seluruh 298 gambar hilang tanpa satu pun galat.
const KARTU = new RegExp(
  '<a href="(/klien(?:_soi)?/([a-z0-9-]+)/(\\d+))">' +
  '([\\s\\S]*?)<h5 class="card-title">([\\s\\S]*?)</h5>' +
  '\\s*<p class="card-text">([\\s\\S]*?)</p>', 'g');

// Enam medan per rekaman, berulang sekali untuk tiap keputusan pengawasan tahunan. Nomor
// yang sama muncul berkali-kali karena itu — pengelompokan menurut nomor dilakukan di hilir,
// bukan di sini, supaya jejak tiap pengawasan tidak hilang.
const SERTIFIKAT = new RegExp(
  'Pemberian sertifikat\\s*(?:</[^>]+>\\s*)*([\\s\\S]*?)' +
  'Tgl berakhir sertifikat\\s*(?:</[^>]+>\\s*)*([\\s\\S]*?)' +
  'Masa aktif sertifikat\\s*(?:</[^>]+>\\s*)*([\\s\\S]*?)' +
  'Tgl pengesahan sertifikat\\s*:\\s*([\\s\\S]*?)' +
  'Nomor sertifikat\\s*:\\s*([\\s\\S]*?)' +
  'Ruang lingkup\\s*:\\s*([\\s\\S]*?)' +
  'Status sertifikat\\s*:\\s*([\\s\\S]*?)</', 'g');

const BULAN = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, mei: 5, jun: 6, jul: 7,
  aug: 8, agu: 8, agt: 8, ags: 8, sep: 9, oct: 10, okt: 10, nov: 11, dec: 12, des: 12,
  januari: 1, februari: 2, maret: 3, april: 4, juni: 6, juli: 7,
  agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
};

// Dua bentuk hidup berdampingan di satu halaman: "18-Apr-2028" dan "19 April 2025".
function tanggal(s) {
  const t = (s || '').trim();
  let m = t.match(/^(\d{1,2})[-\s]([A-Za-z]+)[-\s](\d{4})$/);
  if (m) {
    const b = BULAN[m[2].toLowerCase()];
    if (b) return `${m[3]}-${String(b).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  return null;
}

// Zona waktu Jakarta, bukan UTC. `toISOString()` pada mesin di WIB mengembalikan tanggal
// kemarin sepanjang pukul 00:00-07:00, dan seluruh guna medan ini adalah membandingkan
// tanggal berakhir sertifikat Indonesia — selisih satu hari di sana bukan kerapian.
const hariIni = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(new Date());

async function main() {
  const indeks = [];
  const dilihat = new Set();
  for (const [jalan, halaman] of [['klien', 14], ['klien_soi', 1]]) {
    for (let p = 1; p <= halaman; p++) {
      const h = await ambil(`${BASE}/${jalan}?page_l24_client=${p}`, `daftar_${jalan}_${p}`);
      let n = 0;
      for (const m of h.matchAll(KARTU)) {
        const [, href, slug, id, antara, nama, alamat] = m;
        const img = antara.match(/<img src="([^"]*)"/);
        const gambar = img ? img[1] : null;
        if (dilihat.has(`${jalan}/${id}`)) continue;
        dilihat.add(`${jalan}/${id}`);
        n++;
        indeks.push({
          jenis: jalan, id: Number(id), slug, href,
          nama: teks(nama), alamat: teks(alamat),
          gambar: gambar ? `${BASE}/${gambar.replace(/^\//, '')}` : null,
        });
      }
      console.log(`daftar ${jalan} h${p}: ${n} kartu (kumulatif ${indeks.length})`);
    }
  }
  writeFileSync(join(out, 'klien-indeks.json'), JSON.stringify(indeks, null, 1));

  const baris = [];
  for (let i = 0; i < indeks.length; i++) {
    const c = indeks[i];
    const h = await ambil(BASE + c.href, `rinci_${c.jenis}_${c.id}_${c.slug}`);
    const std = h.match(/Standart Sertifikasi\s*:\s*([\s\S]*?)<\/p>/);
    const sert = [];
    for (const m of h.matchAll(SERTIFIKAT)) {
      const [, terbit, berakhir, masaAktif, pengesahan, nomor, lingkup, status] = m.map(teks);
      const habis = tanggal(berakhir);
      sert.push({
        nomor, lingkup,
        // Dua medan status, dan yang kedua yang boleh dipercaya. `status_situs` beku pada
        // saat keputusan pengawasan dibuat: baris bertulis "Aktif" dengan tanggal berakhir
        // yang sudah lewat itu lumrah, bukan kekecualian.
        status_situs: status,
        // Uji tanggal saja. Sengaja dipisah dari pencabutan supaya keduanya bisa diperiksa
        // terpisah — tetapi JANGAN dipakai sendirian sebagai keberlakuan.
        berlaku_pada_tarikan: habis ? habis >= hariIni : null,
        // Inilah yang boleh dibaca sebagai "berlaku hari ini". Sertifikat yang dicabut
        // tetap membawa tanggal berakhir di masa depan — empat di antaranya ada di tarikan
        // ini — jadi uji tanggal sendirian akan menayangkan sertifikat cabutan sebagai sah.
        berlaku_efektif: habis ? habis >= hariIni && status.toLowerCase() !== 'dicabut' : null,
        terbit: tanggal(terbit) ?? terbit,
        berakhir: habis ?? berakhir,
        masa_aktif: tanggal(masaAktif) ?? masaAktif,
        pengesahan: tanggal(pengesahan) ?? pengesahan,
        lingkup_pecah: lingkup.split(/\s*,\s*|\s+dan\s+/i).map((x) => x.trim()).filter(Boolean),
      });
    }
    baris.push({ ...c, terambil: Boolean(h), standar: std ? teks(std[1]) : null, sertifikat: sert });
    if ((i + 1) % 10 === 0 || i + 1 === indeks.length) {
      writeFileSync(join(out, 'klien.json'), JSON.stringify(baris, null, 1));
      const s = baris.reduce((a, b) => a + b.sertifikat.length, 0);
      console.log(`rinci ${i + 1}/${indeks.length} — ${s} baris sertifikat, jeda ${Math.round(jeda / 1000)}d`);
    }
  }

  writeFileSync(join(out, 'klien.json'), JSON.stringify(baris, null, 1));
  writeFileSync(join(out, 'klien.ndjson'), baris.map((b) => JSON.stringify(b)).join('\n') + '\n');
  // Tanggal acuan ikut turun sebagai berkas sendiri. Seluruh medan keberlakuan dihitung
  // terhadapnya, dan kalimat jawaban di halaman nanti wajib menyebutnya — tanpa berkas ini
  // rantai provenansinya putus di tengah.
  writeFileSync(join(out, 'tarikan.json'), JSON.stringify({ tanggal: hariIni, operator: baris.length }, null, 1));
  const total = baris.reduce((a, b) => a + b.sertifikat.length, 0);
  const nomor = new Set(baris.flatMap((b) => b.sertifikat.map((s) => s.nomor)));
  const aktif = baris.flatMap((b) => b.sertifikat).filter((s) => s.berlaku_pada_tarikan).length;
  console.log(`\nSELESAI ${baris.length} operator, ${total} baris sertifikat, ${nomor.size} nomor unik`);
  console.log(`berlaku pada ${hariIni}: ${aktif} baris`);
  console.log(`blok narahubung dibuang sebelum menyentuh disk: ${kontakDibuang}`);
}

main();
