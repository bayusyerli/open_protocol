// Menyusun hasil panen KAN jadi dua lapis: direktori LPK apa adanya, dan irisan
// laboratorium yang benar-benar bisa dipakai petani. Pemisahannya menurut RUANG
// LINGKUP, bukan menurut nama: "laboratorium terakreditasi" tidak berarti apa pun
// sampai diketahui ia menguji tanah, pupuk, air, atau residu.
//
//   node lpk_data/susun.mjs
//
// Dua sumber, dua kelengkapan yang berbeda. Papan Looker memuat seluruh laboratorium
// penguji beserta masa berlaku akreditasinya tetapi ringkasan lingkupnya satu paragraf;
// aplikasi layanan.kan.or.id baru memuat sebagian kecil lembaga tetapi lingkupnya
// terurai per parameter. Yang satu jadi kerangka, yang lain jadi isian di mana cocok.
//
// Keluaran:
//   lpk-kan.ndjson / .csv        seluruh LPK dari aplikasi layanan (bahan no. 7 & 8)
//   lab-uji-tani.ndjson / .csv   laboratorium penguji yang lingkupnya menyentuh usaha tani
//   LAPIS.md                     isi tiap lapis, hitungannya, dan lubang yang tersisa

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const RAW = join(DIR, 'raw');
const LINGKUP = join(RAW, 'lingkup');

// --- pembersih ---------------------------------------------------------------------
// Beberapa medan tersimpan UTF-8 yang telanjur dibaca sebagai latin-1 di sisi sana.
const perbaiki = (s) => {
  const t = String(s ?? '').trim().replace(/\s+/g, ' ');
  if (!/[ÃÂâ€]/.test(t)) return t;
  try { return Buffer.from(t, 'latin1').toString('utf8'); } catch { return t; }
};
const kutip = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;

const PROVINSI = ['Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi', 'Sumatera Selatan', 'Kepulauan Bangka Belitung', 'Bengkulu', 'Lampung', 'DKI Jakarta', 'Jakarta', 'Jawa Barat', 'Banten', 'Jawa Tengah', 'DI Yogyakarta', 'Yogyakarta', 'Jawa Timur', 'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara', 'Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Maluku', 'Maluku Utara', 'Papua', 'Papua Barat'];
const BAKU = { Jakarta: 'DKI Jakarta', Yogyakarta: 'DI Yogyakarta' };
// Cadangan kedua: nama kabupaten/kota dari panen SIMLUHTAN (penyuluh_data). Dua pekerjaan
// yang tidak berhubungan, satu daftar wilayah — alamat laboratorium jarang menyebut
// provinsinya, hampir selalu menyebut kotanya.
const KOTA = [];
try {
  const dirKab = join(DIR, '..', 'penyuluh_data', 'raw');
  for (const f of readdirSync(dirKab).filter((x) => x.startsWith('kabupaten-'))) {
    for (const r of JSON.parse(readFileSync(join(dirKab, f), 'utf8'))) {
      const nama = String(r.nama ?? '').replace(/^(KABUPATEN|KOTA)\s+/i, '').trim().toLowerCase();
      const prov = String(r.provinsi ?? '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
      if (nama.length >= 5) KOTA.push([nama, BAKU[prov] ?? prov]);
    }
  }
  KOTA.sort((a, b) => b[0].length - a[0].length);
} catch { /* penyuluh_data belum dipanen; cukup pakai nama provinsi saja */ }

const RAPI_PROV = { 'Dki Jakarta': 'DKI Jakarta', 'Di Yogyakarta': 'DI Yogyakarta' };

function provinsiDari (alamat) {
  const a = ` ${alamat.toLowerCase()} `;
  let ketemu = '';
  for (const p of PROVINSI) if (a.includes(` ${p.toLowerCase()}`) && p.length > ketemu.length) ketemu = p;
  if (ketemu) return BAKU[ketemu] ?? ketemu;
  for (const [nama, prov] of KOTA) {
    const i = a.indexOf(` ${nama}`);
    // "Jl. Raya Bogor" di Jakarta bukan alamat di Bogor — nama jalan dilewati.
    if (i > 0 && !/\b(jl\.?|jalan|raya|kav\.?)\s*$/.test(a.slice(Math.max(0, i - 12), i + 1))) {
      return RAPI_PROV[prov] ?? prov;
    }
  }
  return '';
}

// --- lapis 1: direktori LPK ---------------------------------------------------------
const skema = JSON.parse(readFileSync(join(RAW, 'skema.json'), 'utf8'));
const lpk = new Map();
let barisMentah = 0;

for (const s of skema) {
  const berkas = join(RAW, `lpk-${s.id}.json`);
  if (!existsSync(berkas)) continue;
  for (const r of JSON.parse(readFileSync(berkas, 'utf8'))) {
    barisMentah++;
    const kunci = `${s.id}:${r.id}`;
    if (lpk.has(kunci)) continue;   // endpoint memulangkan baris kembar; lihat LAPIS.md
    const alamat = perbaiki(r.alamat);
    lpk.set(kunci, {
      no_akreditasi: perbaiki(r.no_akreditasi) || '',
      nama: perbaiki(r.nama),
      skema_kode: perbaiki(r.skema_kode),
      skema: perbaiki(r.skema),
      alamat,
      provinsi: provinsiDari(alamat),
      telepon: perbaiki(r.no_telp_fax),
      // pic_name & pic_id sengaja dibuang: nama petugas adalah data pribadi, dan
      // direktori ini tidak butuh orangnya untuk menjawab "ke mana saya kirim sampel".
      sumber: `https://layanan.kan.or.id/direktori-lpk/${r.id}/${s.id}`,
    });
  }
}
const semua = [...lpk.values()].sort((a, b) => a.skema_kode.localeCompare(b.skema_kode) || a.no_akreditasi.localeCompare(b.no_akreditasi));

const KOLOM = ['no_akreditasi', 'nama', 'skema_kode', 'skema', 'alamat', 'provinsi', 'telepon', 'sumber'];
writeFileSync(join(DIR, 'lpk-kan.ndjson'), semua.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync(join(DIR, 'lpk-kan.csv'), KOLOM.join(',') + '\n' + semua.map((r) => KOLOM.map((k) => kutip(r[k])).join(',')).join('\n') + '\n');

// --- lapis 2: laboratorium penguji dari papan Looker, disaring ke yang menyentuh tani ---
// Penanda dibaca dari ringkasan lingkup papan. Kata "pestisida" saja sudah cukup untuk
// menandai kemampuan residu — di ringkasan ini ia tidak pernah muncul sebagai nama produk.
const TANDA = {
  uji_tanah: /\btanah\b|\bsoil\b/i,
  uji_pupuk: /\bpupuk\b|fertili[sz]er/i,
  uji_air: /\bair\b|\bwater\b/i,
  uji_pangan: /pangan|\bberas\b|sayur|\bbuah\b|serealia|kakao|\bkopi\b|rempah|biji-bijian/i,
  uji_tanaman: /jaringan tanaman|\bbenih\b|\bbibit\b|hortikultura|\bdaun\b/i,
  uji_residu_pestisida: /pestisida|pesticide/i,
};

const BULAN = { januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6, juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12 };
// Papan menulis tanggalnya nyaris seragam ISO, dengan satu baris berformat Indonesia dan
// satu lagi salah ketik (`20231-08-24`). Yang tidak terbaca dibiarkan kosong, nilai
// aslinya tetap ikut di kolom `masa_berlaku_asli` — tidak ditebak, tidak dibuang.
function tanggal (v) {
  const t = String(v ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (m && BULAN[m[2].toLowerCase()]) return `${m[3]}-${String(BULAN[m[2].toLowerCase()]).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return '';
}

// Isian dari aplikasi layanan: lingkup terurai per parameter, dicocokkan lewat nomor
// akreditasi. Yang tidak ketemu bukan kesalahan — memang belum semua lembaga pindah ke sana.
const rinci = new Map();
if (existsSync(LINGKUP)) {
  for (const berkas of readdirSync(LINGKUP).filter((f) => f.startsWith('1-'))) {
    const d = JSON.parse(readFileSync(join(LINGKUP, berkas), 'utf8'));
    const induk = lpk.get(`1:${d.id}`);
    if (!induk?.no_akreditasi) continue;
    const halaman = d.halaman ?? '';
    const kode = new Set();
    for (const r of d.lingkup) {
      const nomor = Number(String(r['Kode Lingkup sesuai KAN K-01'] ?? '').trim().slice(0, 2));
      if (Number.isFinite(nomor) && nomor > 0) kode.add(nomor);
    }
    rinci.set(induk.no_akreditasi.replace(/\s+/g, ''), {
      surel_rinci: (halaman.match(/([\w.+-]+@[\w.-]+\.\w+)/) ?? [])[1] ?? '',
      status: (halaman.match(/Status Akreditasi\s*:[\s\S]{0,120}?>\s*([A-Za-z ]{4,40})\s*</) ?? [])[1]?.trim() ?? '',
      lingkup_per: (halaman.match(/data-tanggal="(\d{4}-\d{2}-\d{2})"/) ?? [])[1] ?? '',
      baris_lingkup: d.lingkup.length,
      kode_k01: [...kode].sort((a, b) => a - b).map((n) => String(n).padStart(2, '0')).join(' '),
      rincian: induk.sumber,
    });
  }
}

const berkasLooker = join(RAW, 'looker-lp.json');
const lab = [];
let totalLP = 0;
if (existsSync(berkasLooker)) {
  for (const r of JSON.parse(readFileSync(berkasLooker, 'utf8'))) {
    totalLP++;
    const lingkup = perbaiki(r.lingkup);
    const tanda = Object.fromEntries(Object.entries(TANDA).map(([k, re]) => [k, re.test(lingkup)]));
    if (!Object.values(tanda).some(Boolean)) continue;
    const alamat = perbaiki(r.alamat);
    const nomor = perbaiki(r.no_akreditasi).replace(/\s+/g, '');
    const tambahan = rinci.get(nomor) ?? {};
    lab.push({
      no_akreditasi: nomor,
      nama: perbaiki(r.nama),
      alamat,
      provinsi: provinsiDari(alamat),
      telepon: perbaiki(r.telepon),
      surel: perbaiki(r.surel) || tambahan.surel_rinci || '',
      masa_berlaku: tanggal(r.masa_berlaku),
      masa_berlaku_asli: perbaiki(r.masa_berlaku),
      ...tanda,
      kode_k01: tambahan.kode_k01 ?? '',
      baris_lingkup: tambahan.baris_lingkup ?? '',
      lingkup_per: tambahan.lingkup_per ?? '',
      lingkup: lingkup,
      berkas_lingkup: perbaiki(r.tautan).replace(/^Link\s*/i, ''),
      rincian: tambahan.rincian ?? '',
    });
  }
}
lab.sort((a, b) => a.no_akreditasi.localeCompare(b.no_akreditasi, 'en', { numeric: true }));

const KOLOM2 = ['no_akreditasi', 'nama', 'alamat', 'provinsi', 'telepon', 'surel', 'masa_berlaku', 'masa_berlaku_asli', 'uji_tanah', 'uji_pupuk', 'uji_air', 'uji_pangan', 'uji_tanaman', 'uji_residu_pestisida', 'kode_k01', 'baris_lingkup', 'lingkup_per', 'lingkup', 'berkas_lingkup', 'rincian'];
writeFileSync(join(DIR, 'lab-uji-tani.ndjson'), lab.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync(join(DIR, 'lab-uji-tani.csv'), KOLOM2.join(',') + '\n' + lab.map((r) => KOLOM2.map((k) => kutip(r[k])).join(',')).join('\n') + '\n');

// --- laporan --------------------------------------------------------------------------
const hitung = (f) => lab.filter(f).length;
const perSkema = {};
for (const r of semua) perSkema[`${r.skema_kode} ${r.skema}`] = (perSkema[`${r.skema_kode} ${r.skema}`] ?? 0) + 1;
const tanpaProv = semua.filter((r) => !r.provinsi).length;
const cocok = lab.filter((r) => r.baris_lingkup !== '').length;
const tanpaTanggal = lab.filter((r) => !r.masa_berlaku).length;
// Kedaluwarsa dibandingkan dengan TANGGAL TARIKAN, bukan tanggal menjalankan skrip:
// yang ditanyakan "sudah lewat pada saat data ini diambil?", dan jawabannya harus sama
// setiap kali berkas ini dibangun ulang dari tarikan yang sama.
const TARIKAN = '2026-08-23';
const lewat = lab.filter((r) => r.masa_berlaku && r.masa_berlaku < TARIKAN);
const lewatResidu = lewat.filter((r) => r.uji_residu_pestisida);
const barisRinci = [...rinci.values()].reduce((a, r) => a + r.baris_lingkup, 0);

writeFileSync(join(DIR, 'LAPIS.md'), `# Lapis direktori LPK terakreditasi KAN

Disusun ulang oleh \`susun.mjs\` dari tiga panen: \`tarik-looker.mjs\` (daftar resmi
lengkap), \`tarik-kan.mjs\` dan \`tarik-lingkup.mjs\` (aplikasi layanan, lingkup terurai).
Satu panen, dua kebutuhan: **no. 8** — ke mana sampel tanah dan uji residu dikirim — dan
**no. 7**, lembaga sertifikasi yang menentukan panen ditolak atau tidak. Pemisahan
cakupannya di sini, bukan di sumbernya.

## 1. \`lpk-kan.ndjson\` / \`.csv\` — seluruh LPK di aplikasi layanan
${semua.length} lembaga dari ${barisMentah} baris mentah${barisMentah > semua.length ? ` (${barisMentah - semua.length} baris kembar dibuang)` : ''}, ${skema.length} skema akreditasi.

${Object.entries(perSkema).sort((a, b) => b[1] - a[1]).map(([k, v]) => `- ${k}: **${v}**`).join('\n')}

Provinsi dibaca dari teks alamat — lebih dulu nama provinsinya, lalu nama kabupaten/kota
dari panen SIMLUHTAN di \`penyuluh_data/\`, karena alamat laboratorium hampir selalu
menyebut kota tetapi jarang menyebut provinsi. ${tanpaProv} catatan tetap kosong, tidak ditebak.

## 2. \`lab-uji-tani.ndjson\` / \`.csv\` — laboratorium yang menyentuh usaha tani
**${lab.length}** dari **${totalLP.toLocaleString('id-ID')}** laboratorium penguji berakreditasi aktif di papan resmi KAN.
Sisanya — kelistrikan, bahan bakar, konstruksi, tekstil — tidak menyentuh pertanyaan siapa pun di sini.

| Bisa menguji | Laboratorium |
|---|---|
| Air | ${hitung((r) => r.uji_air)} |
| Tanah | ${hitung((r) => r.uji_tanah)} |
| Produk pangan | ${hitung((r) => r.uji_pangan)} |
| Pupuk | ${hitung((r) => r.uji_pupuk)} |
| Jaringan tanaman / benih | ${hitung((r) => r.uji_tanaman)} |
| **Residu pestisida** | **${hitung((r) => r.uji_residu_pestisida)}** |

Masa berlaku akreditasi ikut di tiap baris — medan yang tidak ada di aplikasi layanan.
Diadu dengan tanggal tarikan (${TARIKAN}), **${lewat.length} akreditasi sudah lewat masa berlakunya**,
${lewatResidu.length === 0 ? 'dan tidak satu pun ada di daftar residu pestisida' : `**${lewatResidu.length} di antaranya** ada di daftar ${hitung((r) => r.uji_residu_pestisida)} yang bisa mengukur residu pestisida — ${lewatResidu.map((r) => `${r.no_akreditasi} (berakhir ${r.masa_berlaku})`).join(', ')}`}.
Akreditasi yang habis berarti hasil ujinya tidak lagi diakui sebagai hasil laboratorium terakreditasi.
${tanpaTanggal ? `${tanpaTanggal} baris tanggalnya tidak terbaca dan dibiarkan kosong; nilai aslinya tetap disimpan di \`masa_berlaku_asli\`.` : 'Seluruh baris tanggalnya terbaca.'}

${cocok} dari ${lab.length} laboratorium juga ada di aplikasi layanan, dan hanya untuk
mereka tersedia lingkup terurai per parameter (\`kode_k01\`, \`baris_lingkup\`,
\`lingkup_per\`) di ${barisRinci.toLocaleString('id-ID')} baris \`raw/lingkup/\`.

## Yang belum bisa dijawab berkas ini

- **Dua sumber, dua kelengkapan.** Papan Looker punya semua lembaga tetapi lingkupnya
  hanya satu paragraf ringkasan; aplikasi layanan menguraikan lingkup per parameter
  tetapi baru memuat ${lpk.size} lembaga dari seluruh skema. Berkas ini memakai papan
  sebagai kerangka dan aplikasi layanan sebagai isian.
- **Endpoint aplikasi layanan memulangkan baris kembar** — satu lembaga bisa muncul
  sampai sebelas kali dengan isi identik. Dedup menurut \`id\` + skema.
- **Penanda dibaca dari teks, bukan dari kode.** Ringkasan lingkup papan tidak berkode;
  \`uji_tanah\` dan kawan-kawannya adalah hasil pembacaan kata, dan bisa meleset pada
  lembaga yang menulis ringkasannya dengan cara lain.
- **Nama bahan aktif tidak seragam.** Lingkup laboratorium ditulis dengan nama ISO
  (\`glyphosate\`, \`mancozeb\`), registri Kementan dengan nama Indonesia (\`glifosat\`,
  \`mankozeb\`). Penyilangan ke kosakata bahan aktif baru akan rapat setelah no. 5 berdiri.
- **Sudah tersambung** ke \`spec/vocab/lab/\` — ${lab.length} entitas \`op:lab:\`, dibangun ulang
  dengan \`node spec/tools/bangun-lab.mjs --tulis\`. Yang belum: indeks turunan dan halaman
  terbitnya, karena keduanya masih perlu penyaji per jenis entitas.
`);

console.log(`LPK layanan ${semua.length} (dari ${barisMentah} baris) | lab tani ${lab.length}/${totalLP} | lingkup terurai ${cocok}`);
console.log(`  kedaluwarsa ${lewat.length} (residu ${lewatResidu.length}) per tarikan ${TARIKAN}`);
console.log(`  air ${hitung((r) => r.uji_air)} | tanah ${hitung((r) => r.uji_tanah)} | pangan ${hitung((r) => r.uji_pangan)} | pupuk ${hitung((r) => r.uji_pupuk)} | residu pestisida ${hitung((r) => r.uji_residu_pestisida)}`)
