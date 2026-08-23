// Menarik seri Harga Nasional Tertimbang (HNT) SP2KP Kemendag, lalu menormalkannya jadi
// satu berkas per varian yang bisa dibaca pembangun indeks.
//
//   node harga_data/tarik-sp2kp.mjs                 # tarik ulang lalu normalkan
//   node harga_data/tarik-sp2kp.mjs --dari-berkas   # normalkan dari mentah/ yang sudah ada
//
// LISENSI — INI SATU-SATUNYA SUMBER HARGA HARIAN YANG BOLEH TERBIT.
// Ketentuan Portal Satu Data Kemendag menyatakan "Data Terbuka" secara eksplisit dan
// mengizinkan penggunaan komersial. Atribusi wajib, dan bunyinya sudah ditentukan:
//
//   Sumber: Portal Satu Data Kementerian Perdagangan (satudata.kemendag.go.id) – 2026,
//   diolah kembali oleh Open Protocols.
//
// Kalimat itu ikut ke meta.json lewat spec/tools/bangun-harga.mjs, jadi ia sampai ke layar
// dan tidak berhenti di komentar ini. Bandingkan dengan Bapanas dan PIHPS di
// harga_data/tarik-bapanas.mjs dan docs/16 bagian 2: keduanya benih privat, tidak terbit.
//
// KENAPA `hnt`, DAN KENAPA BUKAN DUA ENDPOINT LAIN YANG TERLIHAT LEBIH COCOK
// Tiga endpoint publik menjawab pertanyaan harga, dan dua di antaranya tidak boleh dipakai:
//
//   report/api/average-price-public              MEMBAWA DATA PRIBADI. Tiap rekaman punya
//                                                objek `creator` berisi nik, nip, no_telp,
//                                                alamat, email, first_name, last_name, dan
//                                                jabatan pencacah. Diperiksa ulang 23 Agustus
//                                                2026: kesembilan medan itu masih ada. Data
//                                                pribadi menurut UU 27/2022, dan NIP memuat
//                                                tanggal lahir. JANGAN DIPANGGIL.
//   report/api/average-price-komoditas-public    bersih dari PII, tetapi 5.099.865 baris pada
//                                                10 baris per halaman = 509.987 permintaan.
//                                                Ketentuan Kemendag melarang "mengunduh data
//                                                di luar yang telah disediakan pada Portal";
//                                                setengah juta permintaan jelas melewatinya.
//   report/api/hnt                               SATU permintaan, 56 MB, seluruh riwayat.
//                                                Bersih dari PII — diperiksa atas seluruh isi,
//                                                bukan atas cuplikan. Inilah yang dipakai.
//
// Ini penerapan langsung docs/16 bagian 5 butir 1 dan 2. Pilihan endpoint di sini bukan soal
// kenyamanan: satu di antaranya akan menyimpan KTP orang lain di repositori ini.
//
// EMPAT UKURAN, DAN KENAPA KEEMPATNYA DIBAWA
// Tiap titik membawa empat rata-rata tertimbang: aritmetik dan geometrik, masing-masing
// ditimbang penduduk dan ditimbang Survei Biaya Hidup. Yang dipakai layar `hnt_penduduk`,
// karena pertanyaan petani "harga di Indonesia berapa" paling dekat ke timbangan penduduk.
// Ketiganya yang lain tetap disimpan: begitu salah satu dibuang, perbedaan antar-ukuran jadi
// tidak bisa diperiksa lagi, dan selisihnya bukan nol.

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const UA = 'OpenProtocols/0.1 (+https://github.com/bayusyerli/open_protocol) riset harga komoditas';
const SUMBER = 'https://api-sp2kp.kemendag.go.id/report/api/hnt';
const MENTAH = join('harga_data', 'mentah', 'sp2kp-hnt.json');
const KELUAR = join('harga_data', 'sp2kp-hnt.ndjson');

// Medan yang tidak boleh ada di keluaran, apa pun yang terjadi. Diperiksa sesudah normalisasi
// dan bukan sebelum: yang menjaga bukan niat penulisnya, melainkan pemeriksaan atas hasilnya.
// Kalau endpoint berubah dan mulai menyertakan `creator`, skrip ini berhenti, bukan menulis.
const TERLARANG = ['nik', 'nip', 'no_telp', 'alamat', 'email', 'first_name', 'last_name', 'jabatan', 'creator'];

async function tarik() {
  process.stderr.write(`Menarik ${SUMBER} — satu permintaan, ±56 MB…\n`);
  const r = await fetch(SUMBER, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!r.ok) throw new Error(`${SUMBER}: HTTP ${r.status}`);
  const teks = await r.text();
  mkdirSync(join('harga_data', 'mentah'), { recursive: true });
  writeFileSync(MENTAH, teks);
  process.stderr.write(`Mentah disimpan ke ${MENTAH} (${(teks.length / 1024 / 1024).toFixed(1)} MB)\n`);
  return JSON.parse(teks);
}

const dariBerkas = process.argv.includes('--dari-berkas');
if (dariBerkas && !existsSync(MENTAH)) {
  console.error(`--dari-berkas dipakai tetapi ${MENTAH} tidak ada. Jalankan tanpa bendera itu dulu.`);
  process.exit(1);
}

const mentah = dariBerkas ? JSON.parse(readFileSync(MENTAH, 'utf8')) : await tarik();
const baris = mentah.data ?? [];
if (!baris.length) {
  console.error('Endpoint menjawab tanpa baris. Tidak menulis apa pun — lebih baik berhenti daripada menimpa seri lama dengan kosong.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Normalisasi — satu rekaman per varian, titiknya sebagai larik sejajar
// ---------------------------------------------------------------------------
// Bentuk panjang (satu baris per varian per tanggal) berukuran ±4 MB dan memaksa penyaji
// mengelompokkan sendiri. Bentuk ini menyimpan tanggal sekali per varian dan harganya
// sebagai larik sejajar, jadi berkasnya ±1 MB dan grafiknya langsung bisa digambar.
const perVarian = new Map();

for (const b of baris) {
  const v = b.variant ?? {};
  const id = b.variant_id;
  if (id == null) continue;
  if (!perVarian.has(id)) {
    perVarian.set(id, {
      variant_id: id,
      kode: v.kode ?? null,
      nama: (v.nama ?? '').trim(),
      komoditas: (b.komoditas?.nama ?? '').trim(),
      satuan: (v.satuan?.nama ?? v.satuan ?? null),
      qty: v.qty ?? null,
      // Penggolongan milik SUMBERNYA, dibawa apa adanya: 1 = barang kebutuhan pokok,
      // 2 = barang penting. Ia yang nanti memisahkan pangan dari besi beton, tanpa kita
      // perlu menyusun daftar kata sendiri yang akan basi diam-diam.
      tipe: v.tipe_komoditas_id ?? b.komoditas?.tipe_komoditas_id ?? null,
      kode_kbki: v.kode_kbki || null,
      nama_kbki_bps: v.nama_kbki_bps || null,
      nasional: v.is_nasional ?? null,
      publik: v.is_public ?? null,
      titik: [],
    });
  }
  perVarian.get(id).titik.push({
    t: b.tanggal,
    // Empat ukuran dibawa apa adanya; pembulatan ke rupiah utuh dilakukan penyaji, bukan di sini.
    p: b.hnt_penduduk ?? null,
    s: b.hnt_sbh ?? null,
    gp: b.hnt_geom_penduduk ?? null,
    gs: b.hnt_geom_sbh ?? null,
  });
}

const keluar = [...perVarian.values()]
  .map((v) => ({ ...v, titik: v.titik.sort((a, b) => a.t.localeCompare(b.t)) }))
  .filter((v) => v.titik.length > 0)
  .sort((a, b) => a.komoditas.localeCompare(b.komoditas) || a.nama.localeCompare(b.nama));

// Penjaga PII. Berjalan atas keluaran, bukan atas masukan.
const serial = JSON.stringify(keluar);
const bocor = TERLARANG.filter((f) => serial.includes(`"${f}"`));
if (bocor.length) {
  console.error(`BERHENTI — medan data pribadi ikut ke keluaran: ${bocor.join(', ')}.`);
  console.error('Endpoint sumbernya berubah. Periksa docs/16 bagian 5 butir 1 sebelum melanjutkan.');
  process.exit(1);
}

const semuaTanggal = [...new Set(keluar.flatMap((v) => v.titik.map((p) => p.t)))].sort();
writeFileSync(KELUAR, keluar.map((v) => JSON.stringify(v)).join('\n') + '\n');

console.log(`Varian            : ${keluar.length}`);
console.log(`Komoditas induk   : ${new Set(keluar.map((v) => v.komoditas)).size}`);
console.log(`Tanggal           : ${semuaTanggal.length} — ${semuaTanggal[0]} s.d. ${semuaTanggal.at(-1)}`);
console.log(`Titik harga       : ${keluar.reduce((a, v) => a + v.titik.length, 0)}`);
console.log(`Penjaga PII       : lolos — tak satu pun dari ${TERLARANG.length} medan terlarang muncul`);
console.log(`Ditulis ke        : ${KELUAR}`);
