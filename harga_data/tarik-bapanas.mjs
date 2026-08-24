// Menarik CSV harga pangan bulanan Badan Pangan Nasional, lalu menormalkan bentuknya jadi
// NDJSON yang bisa dihitung. Sumber tingkat produsen memuat `GKP Tk. Petani` — satu-satunya
// harga gabah tingkat petani yang terbuka tanpa kunci.
//
//   node harga_data/tarik-bapanas.mjs [direktori-keluaran]
//
// LISENSI — BACA SEBELUM MEMAKAI KELUARANNYA.
// Dataset ini tidak punya medan lisensi (`license_id` kosong) dan ditandai
// `accesslevel: "terbatas"` di data.go.id, meskipun berkasnya terunduh tanpa autentikasi.
// Karena itu keluarannya adalah BENIH PRIVAT: boleh dipakai menghitung dan mengkalibrasi,
// TIDAK boleh diterbitkan ulang. Keluaran default jatuh ke harga_data/privat/ yang
// di-gitignore. Lihat docs/16-sumber-harga-komoditas.md bagian 2 dan 3a.
//
// Portal aslinya menanyakan tujuan unduh dan sektor pengunduh lewat formulir. Skrip ini
// tidak mengisi formulir itu dan tidak melewati autentikasi apa pun — berkasnya memang
// dilayani publik. Sebagai gantinya ia menyebut dirinya di User-Agent, dan menarik satu
// salinan per jalan. Datanya bulanan; menjalankan ini lebih dari sebulan sekali sia-sia.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const UA = 'OpenProtocols/0.1 (+https://github.com/bayusyerli/open_protocol) riset harga komoditas';
const BASE = 'https://data.badanpangan.go.id';
const out = process.argv[2] ?? 'harga_data/privat';

// Token unduhan tidak bisa ditebak dan ikut berubah saat dataset disegarkan tiap bulan.
// `id` di sini adalah id yang berlaku saat berkas terakhir diverifikasi; `slug` dipakai
// untuk memeriksa apakah portal sudah menerbitkan id yang lebih baru.
const SUMBER = [
  {
    nama: 'produsen-provinsi',
    tingkat: 'produsen',
    slug: 'j9t/rata-rata-harga-pangan-bulanan-produsen-provinsi',
    id: 429,
    token: '1783678109',
    provinsi: true,
  },
  {
    nama: 'konsumen-provinsi',
    tingkat: 'konsumen',
    slug: 'mqm/rata-rata-harga-pangan-bulanan-konsumen-provinsi',
    id: 427,
    token: '1783677781',
    provinsi: true,
  },
  {
    nama: 'konsumen-nasional',
    tingkat: 'konsumen',
    slug: 'f1h/rata-rata-harga-pangan-bulanan-konsumen-nasional',
    id: 428,
    token: '1783678001',
    provinsi: false,
  },
];

const BULAN = ['januari','februari','maret','april','mei','juni',
               'juli','agustus','september','oktober','november','desember'];

// Penamaan komoditas di sumbernya belum baku: "Tingkat Penggilingan" dan "Tk. Penggilingan"
// hadir sebagai dua entri untuk hal yang sama, begitu pula "Minyak Kita" dan "Minyakita".
// Nama asli tetap dibawa di medan `komoditas`; `komoditas_baku` yang dipakai berhitung.
const bakukan = (nama) =>
  nama
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\bTk\.\s*/gi, 'Tingkat ')
    .replace(/\bMinyakita\b/gi, 'Minyak Kita')
    .replace(/\s+/g, ' ')
    .trim();

// Harga tersimpan sebagai string ber-prefiks dengan koma pemisah ribuan: "Rp5,494".
// Sel kosong berarti tidak ada pengamatan — itu bukan nol, dan tidak boleh jadi nol.
const rupiah = (s) => {
  const bersih = (s ?? '').replace(/["Rp\s]/g, '').replace(/,/g, '');
  if (!bersih) return null;
  const n = Number(bersih);
  return Number.isFinite(n) ? n : null;
};

// Pengurai CSV kecil yang menghormati tanda kutip — harga selalu terkutip karena berkoma.
function uraiBaris(baris) {
  const sel = [];
  let buf = '';
  let kutip = false;
  for (let i = 0; i < baris.length; i++) {
    const c = baris[i];
    if (c === '"') {
      if (kutip && baris[i + 1] === '"') { buf += '"'; i++; } else kutip = !kutip;
    } else if (c === ',' && !kutip) { sel.push(buf); buf = ''; }
    else buf += c;
  }
  sel.push(buf);
  return sel;
}

async function ambil(url, sebagai) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} saat mengambil ${sebagai}\n  ${url}`);
  return res.text();
}

// Kesegaran diukur dari data, bukan dari nomor katalog. Laman portal memang memuat
// `dataset_id` yang naik tiap penyegaran (429 → 439), tetapi id itu bukan yang dipakai
// endpoint unduhan: 429 dan 439 mengembalikan byte yang identik. Membandingkannya hanya
// menghasilkan alarm palsu. Yang benar-benar menentukan adalah periode terakhir yang ada
// di dalam berkas.
//
// Bapanas menjadwalkan rilis B+1, jadi tertinggal satu bulan itu normal; dua bulan masih
// wajar di awal bulan. Lebih dari itu patut dicurigai.
const AMBANG_BULAN_TERTINGGAL = 3;

function periksaKesegaran(nama, periode) {
  const terbaru = periode[periode.length - 1];
  if (!terbaru) return `  ${nama}: ⚠ tidak ada periode terbaca`;
  const [th, bl] = terbaru.split('-').map(Number);
  const kini = new Date();
  const tertinggal = (kini.getFullYear() - th) * 12 + (kini.getMonth() + 1 - bl);
  const tanda = tertinggal >= AMBANG_BULAN_TERTINGGAL ? '⚠ ' : '';
  return `  ${tanda}${nama}: terbaru ${terbaru}, tertinggal ${tertinggal} bulan` +
    (tertinggal >= AMBANG_BULAN_TERTINGGAL
      ? `\n     Portal mungkin berhenti menyegarkan. Periksa ${BASE}/datasetpublications/${nama}`
      : '');
}

function normalkan(csv, s) {
  const baris = csv.split(/\r?\n/).filter((b) => b.trim());
  const kepala = uraiBaris(baris[0]).map((h) => h.trim().toLowerCase());
  const kol = (nama) => kepala.indexOf(nama);
  const iKom = kol('komoditas');
  const iThn = kol('tahun');
  const iBln = kol('bulan');
  const iHrg = kol('harga');
  const iKodeProv = kol('kode provinsi');
  const iNamaProv = kol('nama provinsi');
  if (iKom < 0 || iThn < 0 || iBln < 0 || iHrg < 0)
    throw new Error(`Kolom tak dikenal pada ${s.nama}: ${kepala.join(' | ')}`);

  const keluar = [];
  let kosong = 0;
  for (const b of baris.slice(1)) {
    const sel = uraiBaris(b);
    const harga = rupiah(sel[iHrg]);
    if (harga === null) kosong++;
    const bulanNama = (sel[iBln] ?? '').trim();
    const bulanKe = BULAN.indexOf(bulanNama.toLowerCase()) + 1;
    const komoditas = (sel[iKom] ?? '').trim();
    keluar.push({
      sumber: 'bapanas',
      tingkat: s.tingkat,
      komoditas,
      komoditas_baku: bakukan(komoditas),
      kode_provinsi: s.provinsi ? (sel[iKodeProv] ?? '').trim() || null : null,
      provinsi: s.provinsi ? (sel[iNamaProv] ?? '').trim() || null : null,
      tahun: Number(sel[iThn]),
      bulan: bulanKe || null,
      periode: bulanKe ? `${sel[iThn]}-${String(bulanKe).padStart(2, '0')}` : null,
      harga,
    });
  }
  return { keluar, kosong };
}

mkdirSync(out, { recursive: true });

console.log('Menarik dan menormalkan…');
const ringkas = [];
for (const s of SUMBER) {
  const url = `${BASE}/download/document/dataset/${s.id}/${s.token}.csv/csv`;
  const csv = await ambil(url, s.nama);
  if (csv.trimStart().startsWith('<'))
    throw new Error(`${s.nama} mengembalikan HTML, bukan CSV — token kemungkinan sudah mati.`);

  const { keluar, kosong } = normalkan(csv, s);
  const berkas = join(out, `bapanas-${s.nama}.ndjson`);
  writeFileSync(berkas, keluar.map((r) => JSON.stringify(r)).join('\n') + '\n');

  const terisi = keluar.length - kosong;
  const komoditas = new Set(keluar.map((r) => r.komoditas_baku));
  const periode = keluar.map((r) => r.periode).filter(Boolean).sort();
  console.log(
    `  ${berkas}\n` +
    `    ${keluar.length} baris · ${terisi} terisi (${Math.round((100 * terisi) / keluar.length)}%) · ` +
    `${komoditas.size} komoditas · ${periode[0]} → ${periode[periode.length - 1]}`,
  );
  ringkas.push({ nama: s.nama, baris: keluar.length, terisi, komoditas: komoditas.size, periode });
}

console.log('\nKesegaran:');
for (const r of ringkas) console.log(periksaKesegaran(r.nama, r.periode));

console.log(
  '\nBENIH PRIVAT — lisensi sumber kosong. Boleh dipakai menghitung, tidak diterbitkan ulang.\n' +
  `Total ${ringkas.reduce((a, r) => a + r.baris, 0)} baris di ${out}/`,
);
