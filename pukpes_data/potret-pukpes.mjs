// Potret berkala registri PUKPES (DB Pupuk Pestisida, Kementan/PVTPP).
//
// Pekerjaan berkas ini bukan mengumpulkan data baru — datanya sudah mengalir tiap kali
// endpoint dipanggil. Yang membuatnya bernilai cuma melakukannya berulang dan tidak pernah
// menghapus apa pun. Registri pestisida MEMBUANG rekaman yang kedaluwarsa; begitu sebuah
// izin lewat tanggalnya, ia lenyap dari sumbernya dan potret di sini jadi satu-satunya
// bukti bahwa produk itu pernah terdaftar.
//
//   node pukpes_data/potret-pukpes.mjs --ambil
//       Ambil sekali dari portal, arsipkan mentahnya, lalu kanonikalisasi.
//
//   node pukpes_data/potret-pukpes.mjs --serap <tanggal> <pestisida.json> <pupuk.json> <legacy.json>
//       Serap berkas mentah yang sudah ada sebagai potret bertanggal <tanggal>.
//       Dipakai sekali untuk memasukkan potret 19 Agustus 2026 ke dalam arsip.
//
//   node pukpes_data/potret-pukpes.mjs --kanonikkan <tanggal>
//       Bangun ulang lapis kanonik dari potret mentah yang sudah diarsipkan.
//       Lapis kanonik selalu bisa dibangun ulang; yang tidak tergantikan cuma yang mentah.
//
// Endpoint bersifat publik tetapi butuh cookie sesi tamu yang terbentuk saat mengunjungi
// portal. Tidak ada kredensial dan tidak ada yang dilewati; skrip ini hanya melakukan apa
// yang dilakukan peramban biasa saat membuka halaman datanya. Sekali jalan, berurutan,
// dengan jeda — data publik milik lembaga negara, diperlakukan seperlunya saja.

import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from 'node:fs';
import { gzipSync, gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), 'potret');
const MENTAH = join(AKAR, 'mentah');
const KANONIK = join(AKAR, 'kanonik');
const MANIFES = join(AKAR, 'manifes.ndjson');

const BASE = 'https://ap-simpel.pertanian.go.id';
const HALAMAN = 2000;
const JEDA_MS = 1500;

// Tiga sumber, masing-masing dengan kunci identitasnya.
//
// `kunci` dipilih lewat percobaan, bukan tebakan: himpunan `id` dibandingkan antara potret
// 19 dan 23 Agustus 2026 dan bertahan 100% di kedua sisi, sementara `nomorPendaftaran`
// terbukti BERUBAH pada rekaman yang `id`-nya tetap (pupuk AgrindoPhos, 01.01.2026.551 ->
// 01.01.2026.615). Nomor pendaftaran karena itu tidak bisa jadi identitas.
//
// Basis lama SIMPUK 2020 tidak punya identitas per rekaman sama sekali — hanya `no` yang
// posisional. Ia dipakai apa adanya karena isi seluruh 1.321 barisnya identik bita per bita
// antara kedua potret; basis itu beku. Kalau server pernah mengurutkannya ulang, diff-nya
// akan ramai, dan keramaian itu sendiri yang jadi sinyalnya.
const SUMBER = [
  {
    nama: 'pestisida',
    jalur: '/Datatables_filtering/pestisida_terdaftar',
    kunci: (r) => r.id,
    urut: (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  },
  {
    nama: 'pupuk-simpel',
    jalur: '/pupuk/json_pupuk_publik_simpel',
    kunci: (r) => r.id,
    urut: (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  },
  {
    nama: 'pupuk-legacy',
    jalur: '/pupuk/json_pupuk_publik_new',
    kunci: (r) => String(r.no),
    urut: (a, b) => Number(a.no) - Number(b.no),
  },
];

const tidur = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (buf) => createHash('sha256').update(buf).digest('hex');

// --- kanonikalisasi -------------------------------------------------------------------
//
// Dua hal saja, dan sengaja tidak lebih: urutan medan dibakukan (menurut titik kode, jadi
// medan baru pun tertampung sendirinya) dan urutan rekaman dibakukan menurut kunci
// identitas. Isi medan tidak disentuh — termasuk `bahanAktif` dan `Komoditas` yang berupa
// JSON terbungkus string. Menguraikan dan merapikannya akan membuat berkas ini lebih enak
// dibaca, tetapi juga akan diam-diam menghapus bukti: pada 23 Agustus 2026, 67 rekaman
// pestisida mendapat elemen bahan aktif yang terduplikasi persis dan 16 mendapat varian
// ejaan berkapitalisasi beda. Itu keadaan sungguhan di basis data sumber. Lapis ini
// merekam, tidak membersihkan.
const bakukan = (r) => {
  const out = {};
  for (const k of Object.keys(r).sort()) out[k] = r[k];
  return out;
};

function kanonikalkan(rows, sumber) {
  const lihat = new Map();
  let duplikatDibuang = 0;
  const bentrok = new Map();
  const simpan = [];

  for (const r of rows) {
    const k = sumber.kunci(r);
    const baris = JSON.stringify(bakukan(r));
    const sebelumnya = lihat.get(k);
    if (sebelumnya !== undefined) {
      if (sebelumnya === baris) {
        // Rekaman yang sama persis dikirim server lebih dari sekali. Bukan rekaman
        // berbeda, jadi salinannya dibuang — tetapi jumlahnya dicatat di manifes tiap
        // potret. Yang mentah tetap memuat penggandaannya apa adanya.
        duplikatDibuang++;
        continue;
      }
      // Kunci yang sama dengan isi BERBEDA: dua produk berlainan memakai satu identitas.
      // Memilih salah satunya berarti menghapus rekaman yang berbeda dari arsip untuk
      // selamanya — kegagalan terburuk yang mungkin untuk sistem ini. Dikumpulkan dulu
      // supaya galatnya bisa menyebut seluruhnya sekaligus, lalu berhenti.
      bentrok.set(k, (bentrok.get(k) ?? 1) + 1);
      continue;
    }
    lihat.set(k, baris);
    simpan.push(r);
  }

  if (bentrok.size) {
    const rincian = [...bentrok.entries()].map(([k, n]) => `    ${k}  (${n} rekaman)`);
    throw new Error(
      `${sumber.nama}: ${bentrok.size} kunci identitas dipakai oleh rekaman yang isinya ` +
        `BERBEDA. Ini bukan penggandaan baris, ini tabrakan identitas, dan memilih salah ` +
        `satu akan menghapus rekaman yang berbeda dari arsip selamanya. Tidak ada yang ` +
        `ditulis.\n${rincian.join('\n')}\n` +
        `  Arsip mentah potret ini tetap utuh; periksa di sana lalu putuskan tangan.`,
    );
  }

  simpan.sort(sumber.urut);
  const teks = simpan.map((r) => JSON.stringify(bakukan(r))).join('\n') + '\n';
  return { teks, kunciUnik: simpan.length, duplikatDibuang };
}

// --- arsip mentah ---------------------------------------------------------------------

function arsipkanMentah(tanggal, nama, teksMentah) {
  const dir = join(MENTAH, tanggal);
  mkdirSync(dir, { recursive: true });
  const berkas = join(dir, `${nama}.json.gz`);
  if (existsSync(berkas)) {
    throw new Error(
      `${berkas} sudah ada. Potret mentah tidak pernah ditimpa — itu satu-satunya lapis ` +
        `yang tak tergantikan. Hapus tangan kalau memang disengaja.`,
    );
  }
  const gz = gzipSync(Buffer.from(teksMentah, 'utf8'), { level: 9 });
  writeFileSync(berkas, gz);
  return { berkas, bytesMentah: Buffer.byteLength(teksMentah, 'utf8'), bytesGz: gz.length };
}

const bacaMentah = (tanggal, nama) =>
  gunzipSync(readFileSync(join(MENTAH, tanggal, `${nama}.json.gz`))).toString('utf8');

// --- pengambilan ----------------------------------------------------------------------

async function sesiTamu() {
  const res = await fetch(`${BASE}/home`);
  const ci = (res.headers.getSetCookie?.() ?? [])
    .map((c) => c.split(';')[0])
    .find((c) => c.startsWith('ci_session'));
  if (!ci) throw new Error('Portal tidak memberi cookie sesi; struktur situsnya mungkin berubah.');
  return ci;
}

async function post(jalur, cookie, start, length) {
  const res = await fetch(`${BASE}${jalur}`, {
    method: 'POST',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookie,
    },
    body: `draw=1&start=${start}&length=${length}&search[value]=`,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} pada ${jalur} start=${start}`);
  return res.text();
}

// Endpoint dipanggil sekali per halaman, berurutan, dengan jeda. Hasil tiap halaman
// disimpan apa adanya sebagai teks; penguraian menyusul secara luring supaya mengutak-atik
// pengurai tidak pernah berarti menghantam portalnya lagi.
async function ambilSumber(sumber, cookie) {
  const halaman = [];
  const p0 = await post(sumber.jalur, cookie, 0, HALAMAN);
  halaman.push(p0);
  const j0 = JSON.parse(p0);
  const total = Array.isArray(j0) ? j0.length : j0.recordsTotal;
  for (let s = HALAMAN; s < total; s += HALAMAN) {
    await tidur(JEDA_MS);
    halaman.push(await post(sumber.jalur, cookie, s, HALAMAN));
  }
  const rows = [];
  for (const h of halaman) {
    const j = JSON.parse(h);
    rows.push(...(Array.isArray(j) ? j : j.data));
  }
  if (rows.length !== total) {
    console.warn(`  ! ${sumber.nama}: server bilang ${total}, terkumpul ${rows.length}`);
  }
  return { rows, total };
}

// --- satu potret ----------------------------------------------------------------------

function catatManifes(baris) {
  mkdirSync(AKAR, { recursive: true });
  appendFileSync(MANIFES, JSON.stringify(baris) + '\n');
}

function sudahAda(tanggal) {
  if (!existsSync(MANIFES)) return false;
  return readFileSync(MANIFES, 'utf8')
    .split('\n')
    .filter(Boolean)
    .some((l) => JSON.parse(l).tanggal === tanggal);
}

function tulisKanonik(tanggal, hasil) {
  mkdirSync(KANONIK, { recursive: true });
  for (const [nama, h] of Object.entries(hasil)) {
    writeFileSync(join(KANONIK, `${nama}.ndjson`), h.teks);
  }
  // Penanda potret mana yang sedang terpasang di lapis kanonik. Ia ikut berubah tiap
  // potret, jadi `git log` pada berkas ini membaca sebagai daftar tanggal potret.
  writeFileSync(
    join(KANONIK, 'potret.json'),
    JSON.stringify(
      {
        tanggal,
        sumber: Object.fromEntries(
          Object.entries(hasil).map(([n, h]) => [
            n,
            { kunci_unik: h.kunciUnik, duplikat_dibuang: h.duplikatDibuang },
          ]),
        ),
      },
      null,
      2,
    ) + '\n',
  );
}

function laporkan(tanggal, hasil, ukuran) {
  console.log(`\n  potret ${tanggal}`);
  let gz = 0;
  let mentah = 0;
  for (const s of SUMBER) {
    const h = hasil[s.nama];
    const u = ukuran[s.nama];
    gz += u.bytesGz;
    mentah += u.bytesMentah;
    // Cacahnya selalu dicetak, termasuk saat nol — angka yang menghilang ketika nol adalah
    // angka yang tidak bisa dipercaya, dan pembuangan tanpa jejak adalah sifat yang salah
    // untuk berkas yang tugasnya justru tidak pernah membuang.
    console.log(
      `    ${s.nama.padEnd(13)} mentah ${String(u.rekamanMentah).padStart(5)}` +
        ` -> ${String(h.kunciUnik).padStart(5)} ${s.nama === 'pupuk-legacy' ? 'no' : 'id'} unik` +
        `, ${h.duplikatDibuang} baris kembar dibuang` +
        `  (${(u.bytesMentah / 1e6).toFixed(2)} MB -> gz ${(u.bytesGz / 1e6).toFixed(2)} MB)`,
    );
  }
  console.log(
    `    total          mentah ${(mentah / 1e6).toFixed(2)} MB -> terkompresi ${(gz / 1e6).toFixed(2)} MB`,
  );
  console.log(`\n  lapis kanonik sekarang memuat potret ${tanggal}.`);
  console.log(`  Perubahannya terhadap potret sebelumnya adalah keluaran \`git diff\`.`);
}

async function jalankanPotret(tanggal, muat) {
  if (sudahAda(tanggal)) {
    throw new Error(`Potret ${tanggal} sudah tercatat di manifes. Tidak ada yang ditimpa.`);
  }
  const hasil = {};
  const ukuran = {};
  const catatan = [];

  // Dua babak yang sengaja dipisah. Seluruh yang mentah diarsipkan lebih dulu, baru
  // dikanonikalisasi. Kalau kanonikalisasi berhenti karena tabrakan identitas, buktinya
  // sudah lengkap tersimpan untuk ketiga sumber — dan bukti itulah yang tak tergantikan.
  const mentahTersimpan = {};
  for (const s of SUMBER) {
    const { teks, total } = await muat(s);
    ukuran[s.nama] = arsipkanMentah(tanggal, s.nama, teks);
    ukuran[s.nama].rekamanMentah = JSON.parse(teks).length;
    mentahTersimpan[s.nama] = { teks, total };
  }

  for (const s of SUMBER) {
    const { teks, total } = mentahTersimpan[s.nama];
    hasil[s.nama] = kanonikalkan(JSON.parse(teks), s);
    catatan.push({
      tanggal,
      sumber: s.nama,
      endpoint: s.jalur,
      kunci_identitas: s.nama === 'pupuk-legacy' ? 'no' : 'id',
      // Ketiga cacah ini selalu ditulis, juga ketika duplikatnya nol. Selisih antara
      // rekaman_mentah dan kunci_unik harus selalu sama dengan duplikat_dibuang; kalau
      // suatu potret jumlah kembarnya berubah, perubahan itu ikut terlihat di riwayat.
      rekaman_mentah: ukuran[s.nama].rekamanMentah,
      kunci_unik: hasil[s.nama].kunciUnik,
      duplikat_dibuang: hasil[s.nama].duplikatDibuang,
      records_total_server: total ?? null,
      sha256_mentah: sha(teks),
      bytes_mentah: ukuran[s.nama].bytesMentah,
      bytes_gz: ukuran[s.nama].bytesGz,
    });
  }

  tulisKanonik(tanggal, hasil);
  for (const c of catatan) catatManifes(c);
  laporkan(tanggal, hasil, ukuran);
}

// --- perintah -------------------------------------------------------------------------

const [mode, ...arg] = process.argv.slice(2);
const hariIni = () => new Date().toISOString().slice(0, 10);

// Dijalankan penjadwal, jadi kegagalan harus terbaca sebagai satu kalimat di berkas log,
// bukan sebagai jejak tumpukan — dan harus keluar dengan kode bukan-nol.
process.on('uncaughtException', (e) => {
  console.error(`\nGAGAL: ${e.message}`);
  process.exit(1);
});

if (mode === '--ambil') {
  const tanggal = arg[0] ?? hariIni();
  console.log(`Mengambil potret ${tanggal} dari ${BASE}`);
  const cookie = await sesiTamu();
  let pertama = true;
  await jalankanPotret(tanggal, async (s) => {
    if (!pertama) await tidur(JEDA_MS);
    pertama = false;
    const { rows, total } = await ambilSumber(s, cookie);
    console.log(`  ${s.nama}: ${rows.length} rekaman terambil`);
    return { teks: JSON.stringify(rows), total };
  });
} else if (mode === '--serap') {
  const [tanggal, ...berkas] = arg;
  if (!tanggal || berkas.length !== SUMBER.length) {
    console.error(
      `Pemakaian: --serap <tanggal> ${SUMBER.map((s) => `<${s.nama}.json>`).join(' ')}`,
    );
    process.exit(1);
  }
  console.log(`Menyerap potret ${tanggal} dari berkas yang sudah ada`);
  const peta = Object.fromEntries(SUMBER.map((s, i) => [s.nama, berkas[i]]));
  await jalankanPotret(tanggal, async (s) => {
    const teks = readFileSync(peta[s.nama], 'utf8');
    console.log(`  ${s.nama}: <- ${peta[s.nama]}`);
    // Dinormalkan lewat JSON.parse/stringify supaya yang diarsipkan adalah deret rekaman,
    // sama bentuknya dengan hasil --ambil. Isi tiap rekaman tidak disentuh.
    return { teks: JSON.stringify(JSON.parse(teks)), total: null };
  });
} else if (mode === '--kanonikkan') {
  const tanggal = arg[0];
  if (!tanggal) {
    console.error('Pemakaian: --kanonikkan <tanggal>');
    process.exit(1);
  }
  const hasil = {};
  const ukuran = {};
  for (const s of SUMBER) {
    const teks = bacaMentah(tanggal, s.nama);
    const rows = JSON.parse(teks);
    hasil[s.nama] = kanonikalkan(rows, s);
    ukuran[s.nama] = {
      rekamanMentah: rows.length,
      bytesMentah: Buffer.byteLength(teks, 'utf8'),
      bytesGz: readFileSync(join(MENTAH, tanggal, `${s.nama}.json.gz`)).length,
    };
  }
  tulisKanonik(tanggal, hasil);
  laporkan(tanggal, hasil, ukuran);
} else {
  console.error(
    [
      'Pemakaian:',
      '  --ambil [tanggal]                  ambil dari portal, arsipkan, kanonikalisasi',
      '  --serap <tanggal> <a> <b> <c>      serap berkas mentah yang sudah ada',
      '  --kanonikkan <tanggal>             bangun ulang lapis kanonik dari arsip mentah',
    ].join('\n'),
  );
  process.exit(1);
}
