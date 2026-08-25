// Menarik seri Harga Nasional Tertimbang (HNT) SP2KP Kemendag, lalu menormalkannya jadi
// satu berkas per varian yang bisa dibaca pembangun indeks.
//
//   node harga_data/tarik-sp2kp.mjs                 # jendela harian, gabung ke yang sudah ada
//   node harga_data/tarik-sp2kp.mjs --jendela 30    # perlebar jendelanya jadi 30 hari
//   node harga_data/tarik-sp2kp.mjs --penuh         # tarik SELURUH riwayat, tulis ulang
//   node harga_data/tarik-sp2kp.mjs --dari-berkas   # normalkan dari mentah/ yang sudah ada
//   node harga_data/tarik-sp2kp.mjs --penuh --mundur # izinkan hasilnya berakhir lebih awal
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
// JENDELA HARIAN — DITAMBAHKAN 25 AGUSTUS 2026
// Sampai tanggal itu berkas ini hanya punya satu cara berjalan: tarik 56 MB, tulis ulang
// seluruhnya. Sekali sebulan itu wajar; sekali sehari ia jadi 1,7 GB sebulan yang ditanggung
// server kementerian demi satu tanggal baru berisi 56 baris.
//
// Endpoint yang sama ternyata menerima `?tanggal=YYYY-MM-DD` dan menjawab HANYA hari itu:
// 91 KB, 56 baris. Enam ratus kali lebih ringan, dan tetap endpoint yang sama — jadi ia
// bukan pengunduhan "di luar yang disediakan Portal" melainkan persis yang disediakannya.
// Tiga parameter lain yang dicoba pada hari yang sama (`limit`, `start_date`/`end_date`,
// `page`/`per_page`) DIABAIKAN diam-diam oleh server: jawabannya tetap seluruh riwayat.
// Hanya `tanggal` yang benar-benar menyaring, dan itu yang dipakai di sini.
//
// KENAPA JENDELANYA 14 HARI, BUKAN 1
// Tiga sebab, dan ketiganya teramati — bukan kehati-hatian yang dikarang:
//   1. SP2KP menerbitkan dengan jeda. Pada 25 Agustus 2026 pukul 14 WIB, tanggal 25 masih
//      kosong sementara 24 sudah terisi. Menarik "hari ini" saja akan sering pulang kosong.
//   2. Sabtu dan Minggu memang tidak ada. 22 dan 23 Agustus 2026 menjawab 0 baris — bukan
//      galat, melainkan hari kerja yang tidak ada. Jendela sempit membuat Senin pagi
//      tampak seperti kegagalan.
//   3. Angka lama DIREVISI. Baris untuk tanggal 29 Februari 2024 membawa
//      `created_at` 15 Februari 2026 — dua tahun sesudah tanggalnya. Sumbernya menulis ulang
//      ke belakang, jadi penarik yang hanya menambah di ujung akan menyimpan angka yang sudah
//      tidak lagi diakui sumbernya, selamanya.
//
// Sebab ketiga itu tidak bisa ditutup jendela selebar apa pun. Karena itu `--penuh` tetap
// ada dan tetap harus dijalankan berkala — .github/workflows/harga.yml memanggilnya setiap
// tanggal 1. Jendela menjaga kesegaran; tarikan penuh menjaga kebenaran.
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
const MENTAH_HARIAN = join('harga_data', 'mentah', 'harian');
const KELUAR = join('harga_data', 'sp2kp-hnt.ndjson');
// Sidik tarikan — kecil, dan ia yang membuat `retrieved` di meta kosakata menyebut tanggal
// yang sebenarnya alih-alih tanggal yang ditulis tangan sekali lalu membeku.
const TARIKAN = join('harga_data', 'sp2kp-tarikan.json');
const sidikLama = existsSync(TARIKAN) ? JSON.parse(readFileSync(TARIKAN, 'utf8')) : null;

// Jeda antar permintaan pada mode jendela. Server kementerian, dan yang diminta cuma 14
// berkas kecil sehari; menariknya secepat mungkin adalah biaya yang ditanggung orang lain
// tanpa alasan.
const JEDA_MS = 700;
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

// Medan yang tidak boleh ada di keluaran, apa pun yang terjadi. Diperiksa sesudah normalisasi
// dan bukan sebelum: yang menjaga bukan niat penulisnya, melainkan pemeriksaan atas hasilnya.
// Kalau endpoint berubah dan mulai menyertakan `creator`, skrip ini berhenti, bukan menulis.
const TERLARANG = ['nik', 'nip', 'no_telp', 'alamat', 'email', 'first_name', 'last_name', 'jabatan', 'creator'];

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const dariBerkas = process.argv.includes('--dari-berkas');
const penuh = process.argv.includes('--penuh');
const lebarJendela = Number(arg('jendela')) || 14;

// Tanggal menurut Waktu Indonesia Barat, bukan menurut zona waktu runner. GitHub Actions
// berjalan di UTC; pada 07.00 WIB "hari ini" di sana masih kemarin, dan jendela yang
// dihitung dari UTC akan meleset sehari tiap pagi tanpa satu pun galat.
const tglWIB = (d) => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
const mundurHari = (n) => tglWIB(new Date(Date.now() - n * 86400000));

async function ambil(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.text();
}

async function tarikPenuh() {
  process.stderr.write(`Menarik ${SUMBER} — satu permintaan, ±56 MB…\n`);
  const teks = await ambil(SUMBER);
  mkdirSync(join('harga_data', 'mentah'), { recursive: true });
  writeFileSync(MENTAH, teks);
  process.stderr.write(`Mentah disimpan ke ${MENTAH} (${(teks.length / 1024 / 1024).toFixed(1)} MB)\n`);
  return JSON.parse(teks).data ?? [];
}

async function tarikJendela(n) {
  mkdirSync(MENTAH_HARIAN, { recursive: true });
  const baris = [];
  const kosong = [];
  for (let i = 0; i < n; i++) {
    const t = mundurHari(i);
    if (i) await tidur(JEDA_MS);
    const teks = await ambil(`${SUMBER}?tanggal=${t}`);
    writeFileSync(join(MENTAH_HARIAN, `${t}.json`), teks);
    const d = JSON.parse(teks).data ?? [];
    if (d.length) baris.push(...d); else kosong.push(t);
    process.stderr.write(`  ${t}  ${String(d.length).padStart(3)} baris\n`);
  }
  // Seluruh jendela kosong berarti salah satu dari dua hal, dan keduanya alasan untuk
  // BERHENTI: endpointnya berubah bentuk, atau SP2KP berhenti menerbitkan. Menulis hasilnya
  // tetap tidak merusak apa-apa (gabungannya sama dengan yang lama), tetapi diamnya akan
  // terbaca sebagai "tidak ada yang baru" selama berbulan-bulan.
  if (!baris.length) {
    console.error(`BERHENTI — ${n} hari terakhir seluruhnya kosong (${kosong[0]} s.d. ${kosong.at(-1)}).`);
    console.error('Dua hari libur berturut wajar; dua minggu tidak. Periksa endpointnya sebelum melanjutkan.');
    process.exit(1);
  }
  return baris;
}

// ---------------------------------------------------------------------------
// Normalisasi — satu rekaman per varian, titiknya sebagai larik sejajar
// ---------------------------------------------------------------------------
// Bentuk panjang (satu baris per varian per tanggal) berukuran ±4 MB dan memaksa penyaji
// mengelompokkan sendiri. Bentuk ini menyimpan tanggal sekali per varian dan harganya
// sebagai larik sejajar, jadi berkasnya ±1 MB dan grafiknya langsung bisa digambar.
function normalkan(baris) {
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
  return perVarian;
}

function bacaLama() {
  const m = new Map();
  if (!existsSync(KELUAR)) return m;
  for (const baris of readFileSync(KELUAR, 'utf8').split('\n')) {
    if (!baris.trim()) continue;
    const v = JSON.parse(baris);
    m.set(v.variant_id, v);
  }
  return m;
}

// Menggabung jendela ke seri yang sudah tersimpan. Yang datang MENIMPA yang ada pada tanggal
// yang sama — itu bukan kelalaian melainkan syarat: revisi hanya sampai ke sini kalau yang
// baru boleh mengalahkan yang lama. Varian yang tidak muncul di jendela dibiarkan utuh; ia
// tidak hilang dari sumbernya, ia cuma tidak diterbitkan minggu ini.
function gabung(lama, baru) {
  const hasil = new Map(lama);
  let tanggalBaru = 0, tanggalDirevisi = 0, varianBaru = 0;
  for (const [id, v] of baru) {
    const ada = hasil.get(id);
    if (!ada) { hasil.set(id, v); varianBaru++; tanggalBaru += v.titik.length; continue; }
    const perTanggal = new Map(ada.titik.map((p) => [p.t, p]));
    for (const p of v.titik) {
      const sebelum = perTanggal.get(p.t);
      if (!sebelum) tanggalBaru++;
      else if (JSON.stringify(sebelum) !== JSON.stringify(p)) tanggalDirevisi++;
      else continue;
      perTanggal.set(p.t, p);
    }
    // Metadata varian diambil dari tarikan TERBARU: kalau SP2KP mengganti nama atau satuan,
    // yang berlaku namanya yang sekarang, sama seperti pada tarikan penuh.
    hasil.set(id, { ...v, titik: [...perTanggal.values()] });
  }
  return { hasil, tanggalBaru, tanggalDirevisi, varianBaru };
}

// ---------------------------------------------------------------------------
// Jalan
// ---------------------------------------------------------------------------
if (dariBerkas && !existsSync(MENTAH)) {
  console.error(`--dari-berkas dipakai tetapi ${MENTAH} tidak ada. Jalankan dengan --penuh dulu.`);
  process.exit(1);
}

// Tanpa bendera apa pun: jendela kalau serinya sudah ada, penuh kalau belum. Yang menjalankan
// pertama kali tidak perlu tahu bendera mana yang benar — tidak ada yang bisa digabungkan
// ke berkas yang belum ada.
const modeLengkap = dariBerkas || penuh || !existsSync(KELUAR);
const mode = modeLengkap ? (dariBerkas ? 'dari-berkas' : 'penuh') : 'jendela';

let baris;
if (dariBerkas) baris = JSON.parse(readFileSync(MENTAH, 'utf8')).data ?? [];
else if (modeLengkap) baris = await tarikPenuh();
else {
  process.stderr.write(`Menarik ${lebarJendela} hari terakhir, satu permintaan per tanggal (±91 KB masing-masing)…\n`);
  baris = await tarikJendela(lebarJendela);
}

if (!baris.length) {
  console.error('Endpoint menjawab tanpa baris. Tidak menulis apa pun — lebih baik berhenti daripada menimpa seri lama dengan kosong.');
  process.exit(1);
}

const segar = normalkan(baris);
const { hasil, tanggalBaru, tanggalDirevisi, varianBaru } = modeLengkap
  ? { hasil: segar, tanggalBaru: 0, tanggalDirevisi: 0, varianBaru: 0 }
  : gabung(bacaLama(), segar);

const keluar = [...hasil.values()]
  .map((v) => ({ ...v, titik: v.titik.sort((a, b) => a.t.localeCompare(b.t)) }))
  .filter((v) => v.titik.length > 0)
  .sort((a, b) => a.komoditas.localeCompare(b.komoditas) || a.nama.localeCompare(b.nama));

// Penjaga PII. Berjalan atas keluaran, bukan atas masukan — dan atas keluaran GABUNGAN,
// bukan cuma atas jendelanya, supaya ia tetap memeriksa seluruh isi berkas tiap kali.
const serial = JSON.stringify(keluar);
const bocor = TERLARANG.filter((f) => serial.includes(`"${f}"`));
if (bocor.length) {
  console.error(`BERHENTI — medan data pribadi ikut ke keluaran: ${bocor.join(', ')}.`);
  console.error('Endpoint sumbernya berubah. Periksa docs/16 bagian 5 butir 1 sebelum melanjutkan.');
  process.exit(1);
}

const semuaTanggal = [...new Set(keluar.flatMap((v) => v.titik.map((p) => p.t)))].sort();

// SERI TIDAK BOLEH MUNDUR TANPA ADA YANG MENGATAKANNYA.
// `--penuh` dan `--dari-berkas` MENIMPA, bukan menggabung — itu memang yang diminta keduanya.
// Akibatnya satu perintah yang terlihat tidak berbahaya bisa menghapus hari-hari yang sudah
// tersimpan: menjalankan `--dari-berkas` di atas mentah berumur seminggu memundurkan seluruh
// seri seminggu, menulis 34.660 titik di tempat 34.716, dan tidak mengeluh sedikit pun.
// Terjadi sekali saat berkas ini ditulis, 25 Agustus 2026.
//
// Sumbernya memang boleh menarik kembali tanggal terakhirnya, dan itu sebabnya ini bukan
// larangan melainkan pertanyaan: kalau kemunduran itu disengaja, ulangi dengan `--mundur`.
if (sidikLama?.tanggalTerakhir && semuaTanggal.at(-1) < sidikLama.tanggalTerakhir && !process.argv.includes('--mundur')) {
  console.error(`BERHENTI — keluaran berakhir ${semuaTanggal.at(-1)}, sedangkan yang tersimpan sudah sampai ${sidikLama.tanggalTerakhir}.`);
  console.error('Menulisnya akan MENGHAPUS hari-hari yang sudah ada. Kalau memang itu yang dimaksud, ulangi dengan --mundur.');
  process.exit(1);
}

writeFileSync(KELUAR, keluar.map((v) => JSON.stringify(v)).join('\n') + '\n');
writeFileSync(TARIKAN, JSON.stringify({
  // `--dari-berkas` tidak menyentuh jaringan, jadi ia tidak boleh mengaku ditarik hari ini:
  // yang dinormalkan mentah yang sudah ada, setua apa pun. Tanggal tarikan sebelumnya
  // dipertahankan, dan kalau belum pernah ada, medannya null — bukan tanggal karangan yang
  // nanti tercetak di meta kosakata sebagai `retrieved`.
  ditarik: dariBerkas ? (sidikLama?.ditarik ?? null) : tglWIB(new Date()),
  mode,
  jendelaHari: modeLengkap ? null : lebarJendela,
  tanggalTerakhir: semuaTanggal.at(-1),
  varian: keluar.length,
  titik: keluar.reduce((a, v) => a + v.titik.length, 0),
}, null, 2) + '\n');

console.log(`Mode              : ${mode}${modeLengkap ? '' : ` — ${lebarJendela} hari`}`);
console.log(`Varian            : ${keluar.length}`);
console.log(`Komoditas induk   : ${new Set(keluar.map((v) => v.komoditas)).size}`);
console.log(`Tanggal           : ${semuaTanggal.length} — ${semuaTanggal[0]} s.d. ${semuaTanggal.at(-1)}`);
console.log(`Titik harga       : ${keluar.reduce((a, v) => a + v.titik.length, 0)}`);
if (!modeLengkap) {
  console.log(`Titik baru        : ${tanggalBaru}`);
  console.log(`Titik direvisi    : ${tanggalDirevisi}${tanggalDirevisi ? ' — sumbernya menulis ulang angka lama' : ''}`);
  console.log(`Varian baru       : ${varianBaru}`);
}
console.log(`Penjaga PII       : lolos — tak satu pun dari ${TERLARANG.length} medan terlarang muncul`);
console.log(`Ditulis ke        : ${KELUAR} dan ${TARIKAN}`);
