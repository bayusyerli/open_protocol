// Menyusun tabel MRL Codex dan menyambungkannya ke registri pestisida Indonesia.
//
//   node mrl_data/susun.mjs
//
// SAMBUNGANNYA LEWAT NO. 5, DAN ITU SEBABNYA INI MENUNGGUNYA
// Codex menyebut bahan dengan nama ISO — "Paraquat", "Glyphosate". Registri Kementan
// menyebutnya dengan ejaan Indonesia, dan sering sebagai GARAMNYA: "parakuat diklorida".
// Tabel padanan bahan aktif menyediakan keduanya sekaligus — nama kanonik dan induk
// garamnya — dan tanpa itu penyilangan ini cuma bisa mencocokkan yang ejaannya kebetulan
// sama.
//
// TIGA HAL YANG TIDAK BOLEH HILANG DARI TABEL INI
//
// 1. INI CODEX, BUKAN HUKUM INDONESIA.
//    Batas resmi Indonesia ada di SNI 7313 dan teksnya berbayar. Angka di sini acuan
//    internasional yang diselaraskan banyak pasar tujuan — berguna untuk memperkirakan
//    apakah panen akan ditolak PEMBELI, bukan untuk menyatakan apa yang sah di sini.
//
// 2. DEFINISI RESIDU MENENTUKAN ANGKANYA BERLAKU ATAS APA.
//    "Paraquat cation", "sum of X and Y expressed as X" — label menuliskan kadar garam,
//    MRL dinyatakan dalam bentuk ion atau asam. Medannya ikut di tiap baris, dan tanpa
//    membacanya perbandingan angka label dengan angka MRL membandingkan dua besaran
//    yang berbeda.
//
// 3. SELURUHNYA SUDAH DIADOPSI, DAN ITU DIPERIKSA BUKAN DIANDAIKAN.
//    `stepCode` CXL berarti sudah diadopsi jadi Codex MRL. Keenam ribu empat ratus
//    sembilan puluh baris bertanda CXL — basis datanya memang hanya menerbitkan yang
//    sudah diadopsi. Kolomnya tetap ikut supaya kalau suatu saat ada yang bukan CXL, ia
//    kelihatan; bukan karena ada yang disaring di sini.
//
// Keluaran:
//   mrl-bahan.ndjson / .csv   satu baris per bahan aktif: definisi residu, ADI, golongan
//   mrl-codex.ndjson / .csv   satu baris per bahan × komoditas, disambung lewat id_codex
//   LAPIS.md                  hitungan sambungannya, dan yang tidak dijawabnya

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const AKAR = join(DIR, '..');
const RAW = join(DIR, 'raw');

if (!existsSync(RAW)) {
  console.error(`Panen Codex belum ada di ${RAW}\nJalankan dulu: node mrl_data/tarik-codex.mjs`);
  process.exit(1);
}

const rapi = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const kunci = (s) => rapi(s).toLowerCase();
const kutip = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
const n = (x) => Number(x ?? 0).toLocaleString('id-ID');

// --- sisi Indonesia: nama kanonik & induk dari tabel padanan --------------------------
const KOSONG = new Set(['belum-terpetakan', 'nama-sistematis-belum-terpetakan']);
const pad = JSON.parse(readFileSync(join(AKAR, 'spec/vocab/padanan-bahan-aktif.json'), 'utf8'));
// nama ISO -> daftar kunci registri yang menuju ke sana, langsung maupun lewat induk
const isoKeKunci = new Map();
const catat = (nama, entri, lewat) => {
  const k = kunci(nama);
  if (!k) return;
  if (!isoKeKunci.has(k)) isoKeKunci.set(k, []);
  isoKeKunci.get(k).push({ kunci: entri.kunci, formulasi: entri.formulasi ?? 0, lewat });
};
for (const e of pad.padanan_items) {
  if (KOSONG.has(e.hubungan)) continue;
  if (e.kanonik?.nama) catat(e.kanonik.nama, e, 'kanonik');
  if (e.induk?.nama) catat(e.induk.nama, e, 'induk');
}

// --- sisi Codex ------------------------------------------------------------------------
// Codex kadang menamai satu entri sebagai kelompok: "Cypermethrins (including alpha- and
// zeta- cypermethrin)". Bentuk tunggalnya diterima sebagai nama yang sama HANYA bila ia
// benar-benar tertulis di dalam kurungnya — jadi yang menyatakan kesetaraan itu Codex
// sendiri, bukan penebakan bentuk jamak. Tanpa aturan ini, `sipermetrin` yang sudah punya
// nama kanonik `cypermethrin` terbaca seolah tidak punya MRL sama sekali.
const namaCodexUntuk = (nama) => {
  const semua = [kunci(nama)];
  const kurung = nama.match(/^([^(]+)\(([^)]*)\)/);
  if (kurung) {
    const kepala = kunci(kurung[1]);
    const isi = kunci(kurung[2]);
    semua.push(kepala);
    if (kepala.endsWith('s') && isi.includes(kepala.slice(0, -1))) semua.push(kepala.slice(0, -1));
  }
  return [...new Set(semua.filter(Boolean))];
};

const daftar = JSON.parse(readFileSync(join(RAW, 'pestisida.json'), 'utf8'));
const baris = [];
let tanpaBerkas = 0; let barisMentah = 0;
const bahanCocok = new Set(); const bahanTakCocok = [];

for (const p of daftar) {
  const berkas = join(RAW, `mrl-${p.id}.json`);
  if (!existsSync(berkas)) { tanpaBerkas++; continue; }
  const d = JSON.parse(readFileSync(berkas, 'utf8'));
  const nama = rapi(d.pesticide || p.name?.en);
  const alias = namaCodexUntuk(nama);
  const cocok = alias.flatMap((a) => isoKeKunci.get(a) ?? []);
  if (cocok.length) bahanCocok.add(nama); else bahanTakCocok.push(nama);

  for (const m of d.mrls?.mrl ?? []) {
    barisMentah++;
    baris.push({
      bahan: nama,
      id_codex: String(p.id),
      golongan: rapi(d.name),
      definisi_residu: rapi(d.residue),
      adi: rapi(d.adi),
      adi_satuan: rapi(d.adiUnit),
      komoditas: rapi(m.commodity?.name),
      kode_komoditas: rapi(m.commodity?.commCode),
      mrl: rapi(m.mrl),
      satuan: 'mg/kg',
      tahap: rapi(m.step?.stepCode),
      diadopsi: rapi(m.step?.stepCode) === 'CXL',
      jmpr: rapi(m.jmpr),
      cac: rapi(m.cacYear),
      catatan: rapi(m.footnote),
      // sisi Indonesia — kosong bila bahannya tidak terdaftar di sini
      kunci_registri: cocok.map((c) => c.kunci).join('; '),
      formulasi_indonesia: cocok.reduce((a, c) => a + c.formulasi, 0),
      lewat: [...new Set(cocok.map((c) => c.lewat))].join('; '),
    });
  }
}

baris.sort((a, b) => a.bahan.localeCompare(b.bahan) || a.komoditas.localeCompare(b.komoditas));

// Definisi residu, ADI, dan golongan milik BAHAN, bukan milik tiap baris komoditas.
// Mengulangnya 6.490 kali menggandakan berkasnya tanpa menambah satu keterangan pun —
// dan yang lebih buruk, membuat definisi residu terbaca seolah bisa berbeda antar
// komoditas untuk bahan yang sama. Keduanya dipisah; `id_codex` yang menyambungkan.
const perBahan = new Map();
for (const r of baris) {
  if (!perBahan.has(r.id_codex)) {
    perBahan.set(r.id_codex, {
      id_codex: r.id_codex, bahan: r.bahan, golongan: r.golongan,
      definisi_residu: r.definisi_residu, adi: r.adi, adi_satuan: r.adi_satuan,
      kunci_registri: r.kunci_registri, formulasi_indonesia: r.formulasi_indonesia, lewat: r.lewat,
      baris_mrl: 0,
    });
  }
  perBahan.get(r.id_codex).baris_mrl++;
}
const bahanBaris = [...perBahan.values()].sort((a, b) => a.bahan.localeCompare(b.bahan));
const KOLOM_BAHAN = ['id_codex', 'bahan', 'golongan', 'definisi_residu', 'adi', 'adi_satuan', 'baris_mrl', 'kunci_registri', 'formulasi_indonesia', 'lewat'];
writeFileSync(join(DIR, 'mrl-bahan.ndjson'), bahanBaris.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync(join(DIR, 'mrl-bahan.csv'),
  KOLOM_BAHAN.join(',') + '\n' + bahanBaris.map((r) => KOLOM_BAHAN.map((k) => kutip(r[k])).join(',')).join('\n') + '\n');

const ringkas = baris.map(({ golongan, definisi_residu, adi, adi_satuan, ...sisa }) => sisa);
const KOLOM = ['bahan', 'id_codex', 'komoditas', 'kode_komoditas', 'mrl', 'satuan', 'tahap', 'diadopsi', 'jmpr', 'cac', 'kunci_registri', 'formulasi_indonesia', 'lewat', 'catatan'];
writeFileSync(join(DIR, 'mrl-codex.ndjson'), ringkas.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync(join(DIR, 'mrl-codex.csv'),
  KOLOM.join(',') + '\n' + ringkas.map((r) => KOLOM.map((k) => kutip(r[k])).join(',')).join('\n') + '\n');

// --- yang terdaftar di sini tetapi tidak punya MRL Codex sama sekali --------------------
// Dihitung per NAMA ISO, bukan per kunci registri: satu bahan bisa punya belasan ejaan
// dan garam, dan menghitung ejaannya akan melipatgandakan angkanya tanpa menambah satu
// bahan pun. Nama induk ikut diperiksa, jadi garam yang induknya punya MRL tidak dihitung
// sebagai kekosongan.
const isoCodex = new Set(daftar.flatMap((p) => namaCodexUntuk(rapi(p.name?.en))));
const perIso = new Map();
for (const e of pad.padanan_items) {
  if (KOSONG.has(e.hubungan)) continue;
  const nama = e.kanonik?.nama ?? e.induk?.nama;
  if (!nama) continue;
  const punya = [e.kanonik?.nama, e.induk?.nama].filter(Boolean).some((x) => isoCodex.has(kunci(x)));
  const k = kunci(nama);
  if (!perIso.has(k)) perIso.set(k, { iso: nama, formulasi: 0, ejaan: 0, punya });
  const v = perIso.get(k);
  v.formulasi += e.formulasi ?? 0;
  v.ejaan++;
  v.punya = v.punya || punya;
}
const terdaftarTanpaMrl = [...perIso.values()].filter((v) => !v.punya).sort((a, b) => b.formulasi - a.formulasi);
const terdaftarBerMrl = [...perIso.values()].filter((v) => v.punya).length;

const beradopsi = baris.filter((r) => r.diadopsi).length;
const bersambung = baris.filter((r) => r.kunci_registri).length;
const bahanBersambung = new Set(baris.filter((r) => r.kunci_registri).map((r) => r.bahan));
const komoditas = new Set(baris.map((r) => r.kode_komoditas || r.komoditas));

writeFileSync(join(DIR, 'LAPIS.md'), `# MRL Codex, dan sambungannya ke registri Indonesia

Disusun ulang oleh \`susun.mjs\` dari panen \`tarik-codex.mjs\`.

> **Ini Codex, bukan hukum Indonesia.** Batas resmi Indonesia ada di SNI 7313 dan teksnya
> berbayar; belum ada di repositori ini. Angka di bawah acuan internasional yang
> diselaraskan banyak pasar tujuan — berguna memperkirakan apakah panen akan ditolak
> **pembeli**, bukan untuk menyatakan apa yang sah di sini.

## Isi

| | |
|---|---:|
| Bahan aktif di basis data Codex | ${n(daftar.length)} |
| Baris MRL (bahan × komoditas) | **${n(baris.length)}** |
| Sudah diadopsi (\`CXL\`) | ${n(beradopsi)}${beradopsi === baris.length ? ' — seluruhnya' : ''} |
| Komoditas berbeda | ${n(komoditas.size)} |

## Sambungan ke registri Indonesia

Lewat tabel padanan bahan aktif — nama kanonik maupun induk garamnya. Tanpa no. 5,
penyilangan ini cuma bisa mencocokkan yang ejaannya kebetulan sama.

| | |
|---|---:|
| Bahan Codex yang juga terdaftar di Indonesia | **${n(bahanCocok.size)}** dari ${n(daftar.length)} |
| Nama ISO berbeda di registri Indonesia | ${n(perIso.size)} |
| Di antaranya punya MRL Codex | ${n(terdaftarBerMrl)} |
| Baris MRL yang menyentuh bahan terdaftar | **${n(bersambung)}** |
| Bahan bersambung yang punya baris MRL | ${n(bahanBersambung.size)} |

## Temuan: ${n(terdaftarTanpaMrl.length)} bahan terdaftar tanpa satu pun MRL Codex

Bahan yang beredar di sini tetapi tidak punya angka acuan internasional sama sekali.
Menyemprotkannya bukan pelanggaran — tetapi tidak ada angka yang bisa dipakai
memperkirakan apakah panennya akan ditolak pembeli, dan tidak ada yang bisa diukur
laboratorium terhadap apa pun.

${terdaftarTanpaMrl.slice(0, 15).map((x) => `- **${x.iso}** — ${n(x.formulasi)} formulasi terdaftar`).join('\n')}

Nama Codex yang berbentuk kelompok — \`Cypermethrins (including alpha- and zeta-
cypermethrin)\` — diterima sebagai nama tunggalnya **hanya bila tunggalnya benar-benar
tertulis di dalam kurungnya**. Yang menyatakan kesetaraan itu Codex sendiri, bukan
penebakan bentuk jamak. Tanpa aturan itu, sipermetrin dan parakuat terbaca seolah tidak
punya MRL sama sekali — dan keduanya punya.

## Yang tidak dijawab tabel ini

- **Batas Indonesia sendiri.** SNI 7313 berbayar. Sampai ia masuk, tabel ini menjawab
  pertanyaan pasar, bukan pertanyaan hukum.
- **Apakah angkanya bisa dibandingkan langsung dengan label.** Tidak selalu: label
  menuliskan kadar **garam**, MRL dinyatakan dalam bentuk ion atau asam. Kolom
  \`definisi_residu\` membawa rumusannya per bahan, dan faktor kesetaraan garam→induk ada
  di tabel padanan — keduanya harus dibaca sebelum satu angka dibandingkan dengan angka
  lain.
- **Apakah ada yang bisa mengukurnya.** Hanya **17 laboratorium** di seluruh Indonesia
  yang ruang lingkupnya menyebut residu pestisida, dan pada lingkup terurai per parameter
  hanya 2. Batas tanpa alat ukur adalah aturan yang tidak bisa diperiksa siapa pun —
  lihat \`docs/22-apa-yang-membuat-panen-ditolak.md\`.
- **Belum tersambung** ke \`spec/vocab/\`: masih berkas data, belum entitas.
`);

console.log(`${n(baris.length)} baris MRL · ${n(beradopsi)} diadopsi · ${n(komoditas.size)} komoditas`);
console.log(`  bahan Codex terdaftar di Indonesia : ${n(bahanCocok.size)}/${n(daftar.length)} · baris bersambung ${n(bersambung)}`);
console.log(`  bahan terdaftar tanpa MRL Codex    : ${n(terdaftarTanpaMrl.length)}`);
if (tanpaBerkas) console.log(`  berkas panen hilang: ${tanpaBerkas}`);
