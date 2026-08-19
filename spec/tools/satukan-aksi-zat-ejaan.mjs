// Menyatukan pesticide_action dan substance_classes pada entitas zat yang akan
// menang dalam penggabungan ejaan — dijalankan SEBELUM gabung-id-zat-kembar.mjs.
//
// Kenapa langkah ini perlu berdiri sendiri
// gabung-id-zat-kembar.mjs sengaja BERHENTI kalau entitas yang kalah punya
// pesticide_action atau substance_classes yang tidak dimiliki kanoniknya, dengan
// pesan "pindahkan dulu". Penjagaan itu benar: memindahkan sifat antar entitas
// adalah klaim, bukan kerapian, jadi tidak boleh terjadi diam-diam sebagai efek
// samping penggabungan.
//
// Untuk kelas cacat ejaan, klaimnya lurus dan bisa dinyatakan sekali untuk semua.
// pesticide_action bukan sifat kimia bahannya; ia diturunkan dari konteks produk
// tempat nama itu muncul. Ketika satu bahan terbelah jadi beberapa ejaan, tiap
// ejaan hanya mewarisi konteks yang kebetulan memakainya:
//
//   "Lamda Sihalotrin"   83 rekaman  household, insecticide, public_health, wood_preservative
//   "lamda-sihalotrin"    1 rekaman  insecticide
//   "Lamdasihalotrin"     1 rekaman  insecticide
//
// Ketiganya lambda-sihalotrin yang sama. Selisih aksinya bukan bukti bahan
// berbeda — ia akibat dari keterbelahannya sendiri. Union-lah yang benar, karena
// bahan itu memang dipakai di keempat konteks tersebut; yang keliru justru
// membiarkan kanoniknya kehilangan aksi yang sudah tercatat pada ejaan lain.
//
// Yang TIDAK disentuh berkas ini: cas_number, hazard, mode_of_action, organism,
// dan default_unit. Kelimanya klaim substantif tentang bahannya, bukan turunan
// konteks, dan pemindahannya harus diputuskan satu per satu. Pada 75 kelompok
// ejaan yang ada sekarang tidak satu pun memerlukannya — kalau nanti muncul,
// gabung-id-zat-kembar.mjs akan berhenti dan meminta putusan, sebagaimana mestinya.
//
// Kelompok ejaan ditentukan dengan aturan yang sempit: dua entitas HIDUP yang
// deret huruf-dan-angkanya identik sesudah kapitalisasi, spasi, dan tanda baca
// dilepas. Karena huruf dan angkanya harus sama persis, locant dan nomor posisi
// pada nama kimia tetap membedakan — "2,4-D" tidak akan pernah bertemu "2,6-D".
//
// Kanonik dipilih dengan tiebreaker bertingkat:
//
//   1. rekaman komposisi terbanyak — konvensi yang sama dengan tabel GABUNG
//   2. label terpendek kalau seri
//   3. id terkecil kalau masih seri, semata supaya hasilnya deterministik
//
// Tingkat kedua ada karena tingkat pertama TIDAK memutuskan pada 31 dari 75
// kelompok — banyak nama pengawet dan biosida cuma punya satu atau nol rekaman,
// sehingga pemenangnya jatuh ke id terkecil, yang urutannya kebetulan belaka.
// Akibatnya label rusak bisa dinobatkan jadi kanonik:
//
//   "2 - Octyl - 2H _ Isothiazol - 3 One"   0 rekaman, id lebih kecil
//   "2-Octyl-2H-isothiazol-3-one"           0 rekaman, id lebih besar
//
// Keduanya bahan yang sama, tetapi yang pertama membawa spasi nyasar di sekitar
// tanda hubung dan sebuah garis bawah yang jelas artefak. Karena deret huruf dan
// angkanya sudah dipastikan identik, panjang label hanya berbeda oleh pemisah —
// jadi yang terpendek adalah yang paling sedikit pemisah nyasarnya. Itu proxy
// mekanis, bukan penilaian selera, dan bisa diperiksa ulang siapa saja.
//
//   node spec/tools/satukan-aksi-zat-ejaan.mjs          # periksa saja
//   node spec/tools/satukan-aksi-zat-ejaan.mjs --tulis  # tulis perubahannya
//   node spec/tools/satukan-aksi-zat-ejaan.mjs --tabel  # cetak entri GABUNG
//
// Idempoten: kalau union sudah lengkap, tidak ada yang ditulis. Jalankan dari
// akar repositori.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ZAT = join(root, 'spec', 'vocab', 'substance-pestisida.json');
const NDJSON = join(root, 'spec', 'vocab', 'product', 'pestisida.ndjson');
const ALAT = join(root, 'spec', 'tools', 'gabung-id-zat-kembar.mjs');
const STAMP = '2026-08-19T00:00:00Z';

const tulis = process.argv.includes('--tulis');
const cetakTabel = process.argv.includes('--tabel');

// Sifat yang boleh disatukan di sini, karena diturunkan dari konteks produk.
const TURUNAN = ['pesticide_action', 'substance_classes'];
// Sifat yang TIDAK boleh disentuh: klaim substantif tentang bahannya.
const SUBSTANTIF = ['cas_number', 'organism', 'hazard', 'default_unit'];

const zatDoc = JSON.parse(readFileSync(ZAT, 'utf8'));
const zat = Array.isArray(zatDoc) ? zatDoc : Object.values(zatDoc).find(Array.isArray);

const produk = readFileSync(NDJSON, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
const sudahDiTabel = new Set(
  [...readFileSync(ALAT, 'utf8').matchAll(/"(op:sub:\d+)":\s*\{/g)].map((m) => m[1]),
);

// Berapa kali tiap id dipakai pada composition — dihitung dari ID, tidak pernah
// dari label. Label pada composition adalah salinan sesaat dan sengaja tidak
// pernah ditulis ulang; memakainya untuk mencocokkan akan menyesatkan.
const rekaman = new Map();
for (const p of produk) {
  for (const c of p.composition ?? []) rekaman.set(c.substance.id, (rekaman.get(c.substance.id) ?? 0) + 1);
}
const R = (id) => rekaman.get(id) ?? 0;

const rapikan = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const hidup = zat.filter((s) => s.lifecycle?.status !== 'superseded');

const kelompokPeta = new Map();
for (const s of hidup) {
  const k = rapikan(s.label.id);
  if (!kelompokPeta.has(k)) kelompokPeta.set(k, []);
  kelompokPeta.get(k).push(s);
}

const kelompok = [];
for (const anggota of kelompokPeta.values()) {
  if (anggota.length < 2) continue;
  if (anggota.some((s) => sudahDiTabel.has(s.id))) continue; // sudah diputuskan di tabel
  const urut = anggota.slice().sort(
    (a, b) =>
      R(b.id) - R(a.id) ||
      a.label.id.length - b.label.id.length ||
      a.id.localeCompare(b.id),
  );
  kelompok.push({ menang: urut[0], kalah: urut.slice(1) });
}

// ---------------------------------------------------------------------------
// Penjagaan: berhenti kalau ada sifat substantif yang harus dipindah dengan sadar
// ---------------------------------------------------------------------------
const gagal = [];
for (const { menang, kalah } of kelompok) {
  for (const k of kalah) {
    for (const f of SUBSTANTIF) {
      if (k[f] !== undefined && menang[f] === undefined) {
        gagal.push(`${k.id} "${k.label.id}" punya ${f} yang tidak ada pada ${menang.id} — putuskan manual.`);
      }
    }
    const kode = (e) => new Set((e.mode_of_action ?? []).map((m) => `${m.scheme}:${m.code}`));
    const hilang = [...kode(k)].filter((x) => !kode(menang).has(x));
    if (hilang.length) {
      gagal.push(`${k.id} "${k.label.id}" punya mode_of_action ${hilang.join(', ')} yang tidak ada pada ${menang.id} — putuskan manual.`);
    }
  }
}
if (gagal.length) {
  console.error('Berhenti — ada sifat substantif yang tidak boleh dipindahkan diam-diam:');
  for (const g of gagal) console.error(`  ${g}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Union sifat turunan pada entitas yang menang
// ---------------------------------------------------------------------------
let disentuh = 0;
const rincian = [];
for (const { menang, kalah } of kelompok) {
  const ditambah = [];
  for (const f of TURUNAN) {
    const punya = new Set(menang[f] ?? []);
    const tambahan = [];
    for (const k of kalah) for (const x of k[f] ?? []) if (!punya.has(x)) { punya.add(x); tambahan.push(x); }
    if (tambahan.length) {
      menang[f] = [...punya].sort();
      ditambah.push(`${f}: +${tambahan.join(', ')}`);
    }
  }
  if (ditambah.length) {
    disentuh++;
    rincian.push([menang.id, menang.label.id, ditambah]);
    menang.lifecycle = { ...menang.lifecycle, updated_at: STAMP };
    const alasan =
      `Aksi dan kelas disatukan dari ejaan lain bahan yang sama sebelum penggabungan id: ` +
      `${kalah.map((k) => `"${k.label.id}"`).join(', ')}. ` +
      `pesticide_action diturunkan dari konteks produk tempat nama itu muncul, bukan dari kimia bahannya; ` +
      `ejaan yang jarang dipakai hanya mewarisi sebagian konteks.`;
    menang.notes = menang.notes?.id ? { id: `${menang.notes.id} ${alasan}` } : { id: alasan };
  }
}

// ---------------------------------------------------------------------------
// Keluaran
// ---------------------------------------------------------------------------
if (cetakTabel) {
  const baris = [];
  for (const { menang, kalah } of kelompok) {
    for (const k of kalah) {
      const pilihan =
        R(menang.id) > R(k.id)
          ? `Yang dipakai ${menang.id} karena bentuk terbanyak di registri: ${R(menang.id)} rekaman lawan ${R(k.id)}.`
          : `Rekamannya seri (${R(menang.id)} lawan ${R(k.id)}), jadi yang dipakai ${menang.id} karena labelnya ` +
            `lebih pendek — dan karena deret huruf-angkanya sudah dipastikan identik, yang lebih pendek adalah ` +
            `yang paling sedikit pemisah nyasarnya.`;
      const dasar =
        `Deret huruf dan angkanya identik dengan ${JSON.stringify(menang.label.id)} sesudah kapitalisasi, ` +
        `spasi, dan tanda baca dilepas — locant dan nomor posisi tetap dibandingkan, jadi nama kimia yang ` +
        `berbeda angka tidak akan pernah bertemu di sini. ${pilihan} Kedua id tidak pernah muncul pada ` +
        `pendaftaran yang sama, jadi tidak ada kadar yang terjumlah dua kali — dan karena itu pula tidak ada ` +
        `peringatan yang bisa menemukannya; yang rusak adalah penjumlahan lintas pendaftaran.`;
      baris.push(
        `  ${JSON.stringify(k.id)}: {\n` +
        `    kanonik: ${JSON.stringify(menang.id)},\n` +
        `    jenis: "ejaan",\n` +
        `    dasar:\n      ${JSON.stringify(dasar)},\n` +
        `  },`,
      );
    }
  }
  console.log(baris.join('\n'));
  process.exit(0);
}

console.log(`Kelompok ejaan terbelah   : ${kelompok.length}`);
console.log(`  entitas terlibat        : ${kelompok.reduce((a, g) => a + 1 + g.kalah.length, 0)}`);
console.log(`  id yang akan digantikan : ${kelompok.reduce((a, g) => a + g.kalah.length, 0)}`);
console.log(`Kanonik yang aksinya perlu disatukan : ${disentuh}`);
for (const [id, label, d] of rincian) console.log(`  ${id} ${JSON.stringify(label)} — ${d.join(' | ')}`);

if (!disentuh) {
  console.log('Tidak ada yang perlu ditulis.');
} else if (tulis) {
  writeFileSync(ZAT, JSON.stringify(zatDoc, null, 2) + '\n');
  console.log(`Ditulis ke ${ZAT}`);
} else {
  console.log('Periksa saja — jalankan dengan --tulis untuk menyimpan.');
}
