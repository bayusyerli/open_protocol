// Menulis komentar untuk tiap seri harga, sekali, saat build — bukan saat halaman dibuka.
//
//   node spec/tools/bangun-komentar-harga.mjs            # periksa saja
//   node spec/tools/bangun-komentar-harga.mjs --tulis    # tulis spec/vocab/harga/komentar.json
//   node spec/tools/bangun-komentar-harga.mjs --tulis --paksa   # tulis ulang yang sudah ada
//   node spec/tools/bangun-komentar-harga.mjs --tulis --terhitung  # paksa jalur aturan
//
// KENAPA SAAT BUILD, DAN KENAPA ITU BUKAN SEKADAR SOAL BIAYA
// docs/15 menaruh B5 — ringkasan berbasis model bahasa — pada status TUNDA, dengan alasan
// yang bukan soal teknologi: "asisten yang selalu menjawab tidak punya cara salahnya
// ketahuan." Keberatan itu benar, dan ia menentukan bentuk berkas ini.
//
// Komentar yang dibangkitkan saat halaman dibuka lenyap begitu layar ditutup: tidak ada yang
// bisa membacanya ulang, membandingkannya dengan angkanya, atau menunjukkan bahwa ia keliru.
// Komentar yang ditulis ke berkas ini bisa. Ia bertanggal, berversi, masuk riwayat git,
// bisa di-diff, dan — yang paling menentukan — DISIMPAN BERSAMA ANGKA YANG DIBERIKAN
// KEPADANYA. Peninjau tidak perlu memercayai kalimatnya; ia bisa memeriksanya terhadap
// `fakta` di rekaman yang sama.
//
// Tiga pengikat lain, semuanya turunan dari keberatan itu:
//   1. Model hanya boleh memakai angka di `fakta`. Tidak ada pencarian, tidak ada
//      pengetahuan luar, tidak ada nama peraturan yang tidak diberikan.
//   2. Tiap komentar WAJIB menyebut satu hal yang angkanya TIDAK katakan. Layar yang hanya
//      menyatakan temuan terbaca lebih yakin daripada datanya.
//   3. Tidak ada anjuran dan tidak ada ramalan. Kelompok D pada docs/15 berbunyi "kalkulator
//      yang tidak menganjurkan"; komentar harga tidak boleh jadi pengecualiannya.
//
// TANPA KREDENSIAL, IA TETAP JALAN — DAN MENGAKU
// Kalau tidak ada kredensial Anthropic, berkas ini tidak berhenti dan tidak diam-diam
// menulis kalimat kosong. Ia menyusun narasi dari aturan atas angka yang sama, lalu menandai
// rekamannya `sumber: "terhitung"`. Yang membaca meta tahu persis mana yang ditulis model
// dan mana yang dihitung — dan keduanya tidak pernah tertukar.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tulis = process.argv.includes('--tulis');
const paksa = process.argv.includes('--paksa');
const NDJSON = join(akar, 'spec', 'vocab', 'harga', 'harga.ndjson');
const KELUAR = join(akar, 'spec', 'vocab', 'harga', 'komentar.json');

const MODEL = 'claude-opus-5';

if (!existsSync(NDJSON)) {
  console.error(`${NDJSON} tidak ada. Jalankan dulu: node spec/tools/bangun-harga.mjs --tulis`);
  process.exit(1);
}

const seri = readFileSync(NDJSON, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
const berangka = seri.filter((x) => x.series?.length);

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const rp = (x) => 'Rp' + Math.round(x).toLocaleString('id-ID');
// Tanggal ditulis seperti sisa layar menulisnya. Bentuk ISO benar dan tidak taksa, tetapi ia
// satu-satunya potongan di halaman yang tidak berbahasa Indonesia — dan komentar justru
// bagian yang dibaca sebagai kalimat, bukan dipindai sebagai data.
const tgl = (s) => {
  const d = new Date(s);
  return Number.isNaN(+d) ? s : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};
// Koma desimal, dan TANPA tanda: arahnya sudah diucapkan kata "naik"/"turun" di depannya,
// sehingga "turun -11,7%" jadi negatif ganda yang terbaca sebagai kenaikan.
const angkaId = (x, d = 1) => Number(x).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (x) => (x === null || x === undefined ? 'tidak terhitung' : `${angkaId(Math.abs(x))}%`);

// ---------------------------------------------------------------------------
// Fakta — persis ini yang diberikan ke model, dan persis ini yang ikut disimpan
// ---------------------------------------------------------------------------
function fakta(x) {
  const s = x.stats;
  return {
    nama: x.label.id,
    kelompok: x.commodity_group ?? null,
    satuan: `${x.qty && x.qty !== 1 ? x.qty + ' ' : ''}${x.unit}`,
    // Tingkatnya dibaca dari rekamannya, tidak lagi ditulis mati. Sejak penetapan TBS Kalbar
    // masuk, tidak semua harga di sini eceran — dan kalimat yang menyebut "eceran nasional"
    // untuk harga yang ditetapkan bagi pekebun adalah pernyataan yang keliru, bukan sekadar
    // tidak tepat.
    tingkat: x.price_level === 'farmgate'
      ? `pekebun, hasil penetapan${x.region ? ` ${x.region.label}` : ''}`
      : `eceran nasional tertimbang ${x.weighting ?? 'penduduk'}`,
    ...(x.legal_scope ? { cakupanHukum: x.legal_scope } : {}),
    hargaTerakhir: s.terakhir.p,
    tanggalTerakhir: s.terakhir.t,
    ubah7hari: s.ubah7,
    ubah30hari: s.ubah30,
    ubah90hari: s.ubah90,
    ubah1tahun: s.ubah365,
    terendah: s.min,
    tertinggi: s.maks,
    rataRata: s.rata,
    gejolakPersen: s.gejolak,
    musim: s.musim
      ? {
        bulanTermahal: BULAN[s.musim.bulanTertinggi - 1],
        bulanTermurah: BULAN[s.musim.bulanTerendah - 1],
        selisihMusimPersen: s.musim.rentangPersen,
      }
      : null,
    cakupan: {
      dari: x.coverage.from,
      sampai: x.coverage.to,
      jumlahTitik: x.coverage.points,
      hariTanpaAngka: x.coverage.gaps ?? 0,
    },
  };
}

// ---------------------------------------------------------------------------
// Jalur mundur — narasi dari aturan, dipakai kalau tidak ada kredensial
// ---------------------------------------------------------------------------
// Bukan tiruan komentar model, dan tidak berpura-pura jadi itu. Ia menyusun kalimat dari
// angka yang sama dengan aturan tetap, lalu ditandai `terhitung` supaya bedanya terbaca.
function terhitung(f) {
  const arah = (p) => (p === null ? null : Math.abs(p) < 0.5 ? 'nyaris tidak bergerak' : p > 0 ? 'naik' : 'turun');
  const bagian = [];

  bagian.push(
    `Per ${tgl(f.tanggalTerakhir)}, ${f.nama} tercatat ${rp(f.hargaTerakhir)} per ${f.satuan} ` +
    `pada tingkat ${f.tingkat}.`);

  // "nyaris tidak bergerak 0,2%" tidak berbunyi seperti kalimat; yang datar diberi bentuknya
  // sendiri alih-alih ditempeli angka di belakang kata kerja.
  const gerak = (p) => (Math.abs(p) < 0.5 ? `nyaris tidak bergerak (${pct(p)})` : `${arah(p)} ${pct(p)}`);
  if (f.ubah30hari !== null && f.ubah1tahun !== null) {
    bagian.push(
      `Dalam 30 hari terakhir ia ${gerak(f.ubah30hari)}, ` +
      `dan dibanding setahun lalu ${gerak(f.ubah1tahun)}.`);
  }

  bagian.push(
    `Sepanjang ${tgl(f.cakupan.dari)} sampai ${tgl(f.cakupan.sampai)} rentangnya ` +
    `${rp(f.terendah.p)} (${tgl(f.terendah.t)}) sampai ${rp(f.tertinggi.p)} (${tgl(f.tertinggi.t)}), ` +
    `dengan koefisien variasi ${angkaId(f.gejolakPersen)}%.`);

  if (f.musim) {
    bagian.push(
      `Rata-rata bulanannya paling tinggi pada ${f.musim.bulanTermahal} dan paling rendah pada ` +
      `${f.musim.bulanTermurah}, berselisih ${angkaId(f.musim.selisihMusimPersen)}% — pola dari ` +
      `${f.cakupan.jumlahTitik} titik, belum tentu berulang.`);
  }

  // Batas yang disebut kalimat terakhir BERBEDA menurut tingkatnya, dan perbedaannya bukan
  // gaya. Untuk harga eceran, yang tidak diketahui adalah bagian petani. Untuk penetapan
  // TBS, bagian pekebun MITRA justru itulah angkanya — yang tidak diketahui adalah pekebun
  // swadaya, yang berada di luar cakupan hukumnya dan berjumlah lebih banyak.
  bagian.push(f.cakupanHukum
    ? `Yang angka ini TIDAK katakan: berapa yang diterima pekebun SWADAYA. Penetapan ini ` +
      `menaungi pekebun mitra dan plasma; swadaya berada di luar cakupannya, dan harga yang ` +
      `mereka terima tidak diterbitkan lembaga mana pun kecuali Riau.`
    : `Yang angka ini TIDAK katakan: berapa yang diterima petani. Seluruhnya harga eceran, ` +
      `dan selisih eceran-ke-petani tidak terukur di sumber mana pun yang boleh diterbitkan.`);

  return bagian.join(' ');
}

// ---------------------------------------------------------------------------
// Jalur model
// ---------------------------------------------------------------------------
const SISTEM = `Kamu menulis satu paragraf komentar untuk halaman harga komoditas pada sebuah platform data pertanian Indonesia yang bersikap netral terhadap vendor dan berhati-hati terhadap klaim.

ATURAN YANG MENGIKAT:
1. Pakai HANYA angka yang ada di objek fakta. Jangan menambahkan angka, nama peraturan, peristiwa, kebijakan, atau sebab dari pengetahuanmu sendiri. Kalau sesuatu tidak ada di fakta, ia tidak ada.
2. JANGAN meramal harga. Jangan menulis "diperkirakan", "kemungkinan akan", atau bentuk lain yang menyatakan masa depan.
3. JANGAN memberi anjuran. Jangan menyuruh membeli, menjual, menahan, atau menunggu.
4. JANGAN menyebut sebab. Data ini tidak memuat sebab apa pun; menuliskannya berarti mengarang.
5. Kalimat TERAKHIR wajib menyebut satu hal yang angka ini tidak katakan — batas yang nyata, bukan basa-basi.
6. Bahasa Indonesia, lugas, 3 sampai 5 kalimat. Tanpa tanda bintang, tanpa daftar berpoin, tanpa judul.
7. Tulis rupiah seperti "Rp13.910" dan persen seperti "1,2%" (koma desimal).

Yang berguna disebut: arah dan besar perubahan, posisi harga sekarang terhadap rentang riwayatnya, seberapa bergejolak dibanding rata-ratanya, dan pola bulanan bila ada. Sebut juga bila cakupan datanya bolong.`;

const SKEMA = {
  type: 'object',
  properties: {
    komentar: {
      type: 'string',
      description: 'Tiga sampai lima kalimat bahasa Indonesia. Kalimat terakhir menyebut satu batas dari angka ini.',
    },
    batas: {
      type: 'string',
      description: 'Batas yang disebut di kalimat terakhir, diulang sendiri supaya bisa ditampilkan terpisah.',
    },
  },
  required: ['komentar', 'batas'],
  additionalProperties: false,
};

async function buatKlien() {
  // Impor dinamis: yang menjalankan tanpa SDK terpasang tetap dapat jalur terhitung.
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    return new Anthropic();
  } catch (e) {
    return null;
  }
}

/**
 * Apakah ada kredensial — diputuskan dengan MENCOBA, bukan dengan menebak.
 *
 * Versi pertama berkas ini memeriksa tiga variabel lingkungan dan berhenti di situ. Itu
 * keliru, dan kelirunya jenis yang paling mahal: `ant auth login` menyimpan profil di
 * ~/.config/anthropic/ TANPA menyetel satu pun variabel lingkungan, sehingga yang sudah
 * login dengan benar tetap dijawab "tanpa kredensial" dan diam-diam mendapat jalur
 * terhitung — persis kebalikan dari yang ia minta, tanpa satu pun tanda.
 *
 * Jadi yang menentukan sekarang satu panggilan sungguhan yang sangat murah. Kalau ia lewat,
 * kredensialnya ada — apa pun sumbernya: variabel lingkungan, profil `ant`, atau federasi
 * identitas. Kalau ia ditolak karena autentikasi, jalur terhitung dipakai dan SEBABNYA
 * disebut, bukan disamarkan jadi "tidak ada kredensial".
 */
async function adaKredensial(klien) {
  if (!klien) return { ada: false, sebab: '@anthropic-ai/sdk belum terpasang — jalankan `npm install` di spec/' };
  try {
    await klien.models.retrieve(MODEL);
    return { ada: true };
  } catch (e) {
    const status = e?.status;
    // SDK menolak sebelum permintaan berangkat kalau tak satu pun sumber kredensial ada;
    // itu keadaan yang sama dengan 401, dan pesannya sebaiknya juga sama.
    if (/Could not resolve authentication/i.test(e?.message ?? '') || status === 401 || status === 403) {
      return { ada: false, sebab: 'kredensial Anthropic tidak ditemukan atau ditolak — jalankan `ant auth login`, atau setel ANTHROPIC_API_KEY' };
    }
    if (status === 404) {
      return { ada: false, sebab: `kredensialnya ada, tetapi model ${MODEL} tidak terjangkau akun ini` };
    }
    return { ada: false, sebab: `tidak bisa memastikan kredensial: ${e?.message ?? e}` };
  }
}

async function lewatModel(klien, f) {
  const r = await klien.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: SISTEM,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SKEMA } },
    messages: [{ role: 'user', content: JSON.stringify(f, null, 1) }],
  });
  if (r.stop_reason === 'refusal') throw new Error(`ditolak: ${r.stop_details?.category ?? 'tanpa kategori'}`);
  const teks = r.content.find((b) => b.type === 'text')?.text ?? '';
  return JSON.parse(teks);
}

// ---------------------------------------------------------------------------
// Jalan
// ---------------------------------------------------------------------------
const lama = existsSync(KELUAR) ? JSON.parse(readFileSync(KELUAR, 'utf8')) : { versi: 1, komentar: {} };
const klien = await buatKlien();

// `--terhitung` memaksa jalur aturan meski kredensialnya ada — dipakai saat ingin
// membandingkan keduanya, atau saat sedang tidak ingin membelanjakan panggilan.
const paksaTerhitung = process.argv.includes('--terhitung');
const cek = paksaTerhitung ? { ada: false, sebab: 'diminta lewat --terhitung' } : await adaKredensial(klien);
const pakaiModel = cek.ada;

console.log(`Seri berangka        : ${berangka.length}`);
console.log(`Jalur                : ${pakaiModel ? `model ${MODEL}` : 'TERHITUNG — narasi disusun dari aturan'}`);
if (!pakaiModel) {
  console.log(`                       sebab: ${cek.sebab}`);
  console.log(`                       jalankan ulang dengan --paksa setelah itu beres, untuk menulis ulang lewat model`);
}

const hasil = { ...lama.komentar };
let dibuat = 0, dilewati = 0, gagal = 0;
const gugur = [];

for (const x of berangka) {
  const f = fakta(x);
  const sidik = JSON.stringify(f);
  const ada = hasil[x.key];
  // Komentar tidak ditulis ulang selama faktanya belum berubah. Itu yang membuat berkas ini
  // bisa di-diff: selisihnya berarti angkanya bergeser, bukan modelnya sedang bervariasi.
  if (ada && ada.sidikFakta === sidik && !paksa) { dilewati++; continue; }

  // Tinjauan manusia menempel pada SUSUNAN ANGKA yang ditinjau, bukan pada kuncinya. Kalau
  // sampai sini, faktanya sudah bergeser (atau --paksa dipakai), jadi kalimatnya akan
  // ditulis ulang — dan tinjauan atas kalimat lama tidak berlaku untuk kalimat baru.
  // Membiarkannya berarti satu tinjauan bulan lalu menaungi kalimat yang ditulis hari ini,
  // yang persis jenis kekeliruan diam-diam yang berkas ini dibangun untuk cegah.
  const tinjauanGugur = ada?.ditinjau && ada.ditinjauSidik !== sidik;
  if (tinjauanGugur) gugur.push({ kunci: x.key, oleh: ada.ditinjauOleh, pada: ada.ditinjau });

  let isi = null;
  if (pakaiModel) {
    try {
      isi = await lewatModel(klien, f);
    } catch (e) {
      gagal++;
      console.error(`  gagal ${x.key}: ${e.message}`);
    }
  }

  hasil[x.key] = {
    id: x.id,
    nama: x.label.id,
    ...(isi
      ? { komentar: isi.komentar, batas: isi.batas, sumber: 'model', model: MODEL }
      : {
        komentar: terhitung(f),
        batas: f.cakupanHukum
          ? 'Menaungi pekebun mitra dan plasma; pekebun swadaya berada di luar cakupannya, dan merekalah mayoritas petani sawit Indonesia.'
          : 'Seluruhnya harga eceran; berapa yang diterima petani tidak terukur di sumber mana pun yang boleh diterbitkan.',
        sumber: 'terhitung',
      }),
    // Angka yang dipakai ikut disimpan. Inilah yang membuat kalimat di atas bisa diperiksa
    // tanpa memercayai penulisnya — dan itu jawaban langsung atas keberatan B5.
    fakta: f,
    sidikFakta: sidik,
    ditulis: '2026-08-23',
    ditinjau: null,
  };
  dibuat++;
}

console.log(`Dibuat/diperbarui    : ${dibuat}`);
if (gugur.length) {
  console.log(`Tinjauan GUGUR       : ${gugur.length} — faktanya bergeser, kalimatnya ditulis ulang`);
  for (const g of gugur) console.log(`      ${g.kunci} — ditinjau ${g.oleh ?? 'tanpa nama'} pada ${g.pada}, perlu ditinjau ulang`);
}
console.log(`Dilewati (tak berubah): ${dilewati}`);
if (gagal) console.log(`Gagal                : ${gagal}`);
const lewatModelJumlah = Object.values(hasil).filter((x) => x.sumber === 'model').length;
console.log(`Sumber komentar      : ${lewatModelJumlah} model · ${Object.keys(hasil).length - lewatModelJumlah} terhitung`);
console.log(`Belum ditinjau orang : ${Object.values(hasil).filter((x) => !x.ditinjau).length} dari ${Object.keys(hasil).length}`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyimpan.');
  process.exit(0);
}

const keluar = {
  $schema: '../../schema/komentar-harga.schema.json',
  versi: 1,
  tentang:
    'Komentar per seri harga, ditulis sekali saat build. Tiap rekaman menyimpan `fakta` — angka persis yang diberikan kepada penulisnya — supaya kalimatnya bisa diperiksa tanpa memercayai penulisnya. `sumber` menyebut siapa yang menulis: `model` atau `terhitung`. `ditinjau` masih null di seluruh rekaman; tidak satu pun sudah dibaca manusia.',
  tingkatBukti: 'D',
  alasanTingkat:
    'Pengalaman tunggal belum terverifikasi. Angkanya sendiri bertingkat B — registri harga Kemendag, disalin apa adanya — tetapi KALIMAT di sini bukan angka: ia tafsir atas angka, ditulis mesin, dan belum dibaca seorang pun. Menandainya B berarti meminjamkan tingkat sumbernya kepada tafsirnya. Tingkat naik begitu `ditinjau` terisi.',
  ditulis: '2026-08-23',
  komentar: hasil,
};
writeFileSync(KELUAR, JSON.stringify(keluar, null, 2) + '\n');
console.log(`\nDitulis ke ${KELUAR}`);
