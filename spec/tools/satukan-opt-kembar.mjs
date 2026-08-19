// Menyatukan OPT kembar — satu organisme yang terlanjur terdaftar sebagai beberapa
// entitas karena registri menuliskan nama ilmiahnya dengan ejaan yang berbeda-beda.
//
//   node spec/tools/satukan-opt-kembar.mjs            # periksa saja
//   node spec/tools/satukan-opt-kembar.mjs --tulis    # tulis perubahannya
//
// KENAPA LABEL SAMA SEKALI BUKAN KUNCINYA
// Godaan pertama adalah menyatukan menurut nama Indonesia yang sama, seperti pada
// komoditas. Di sini itu bencana: "Gulma Berdaun Lebar" dipakai 417 entitas dan
// keempat ratus tujuh belasnya organisme yang berbeda — Ageratum conyzoides,
// Mikania micrantha, Chromolaena odorata, dan seterusnya. Labelnya KATEGORI, bukan
// nama. Menyatukan menurutnya akan melebur 417 spesies jadi satu dan membuat
// pertanyaan "boleh pakai apa untuk gulma ini" kehilangan artinya sama sekali.
//
// Yang benar-benar terbelah justru nama ilmiahnya:
//
//   Ageratum conyzoides · conyziodes · conizoides · conyzoide · cpnyzoides
//   Mikania micrantha · micranta · michrantha · micarantha · michranta
//
// KUNCINYA VERIFIKASI GBIF, BUKAN KEMIRIPAN HURUF
// Tiap entitas sudah membawa accepted_scientific_name hasil pencocokan ke GBIF
// beserta taxon_verification.match_type. Itu putusan taksonomi yang sudah dilakukan
// pihak yang berwenang, jauh lebih dapat dipercaya daripada jarak edit yang dihitung
// sendiri. Entitas yang accepted-nya sama adalah takson yang sama.
//
// TETAPI HANYA KALAU PENCOCOKANNYA SAMPAI TINGKAT SPESIES
// match_type "higher_rank" berarti GBIF hanya sanggup menambatkannya ke genus.
// Menyatukan atas dasar itu menggabungkan spesies yang berbeda:
//
//   Echinochloa <- Echinochloa crus-galli, Echinochloa NODOSA, Echinochloa crusgalli
//   Colletotrichum <- gloeosporioides, circinans, capsici, lagenarium
//
// Empat puluh delapan kelompok seperti itu ditolak seluruhnya — 132 entitas sengaja
// dibiarkan terpecah. Yang tersisa 193 kelompok yang setiap anggotanya cocok "exact"
// atau "fuzzy" di tingkat spesies, mencakup 649 entitas. Di seluruh 193 kelompok itu,
// jarak ejaan terjauh ANTAR-ANGGOTA cuma lima huruf ("Cloeme rutidospermae" lawan
// "Cleome rutidosprema"), dan 145 kelompok berjarak paling jauh dua huruf. Tidak ada
// yang perlu ditebak.
//
// STADIUM HIDUP MEMBEDAKAN, DAN ITU BUKAN SOAL KERAPIAN
// Culex quinquefasciatus menaungi "Nyamuk" dan "Larva Nyamuk". Keduanya organisme
// yang sama, tetapi larvasida tidak mengendalikan nyamuk dewasa dan sebaliknya —
// menyatukannya berarti menganjurkan produk yang tidak bekerja. Label yang menyebut
// stadium karena itu dipisahkan, walau accepted-nya sama.
//
// ID TIDAK DIDAUR ULANG. Yang kalah jadi "superseded" dengan superseded_by menunjuk
// yang menang; L29 menegakkannya. Rantai penggantian diratakan tiap kali dijalankan,
// karena penyatuan bisa berjalan bertahap dan yang kalah kemarin bisa jadi yang
// digantikan hari ini.
//
// SALINAN LABEL PADA REKAMAN PRODUK TIDAK DISENTUH. `pest_label` pada label_uses
// snapshot sesaat yang sengaja dibiarkan — ia satu-satunya tempat bunyi asli
// registri masih terbaca. Yang ditulis ulang hanya `pest.id`.
//
// Idempoten: entitas yang sudah superseded dilewati.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VOCAB = join(akar, 'spec', 'vocab');
const STAMP = '2026-08-20T00:00:00Z';
const tulis = process.argv.includes('--tulis');

const bacaJson = (p) => JSON.parse(readFileSync(join(VOCAB, p), 'utf8'));
const kunciLarik = (o) => (Array.isArray(o) ? null : Object.keys(o).find((k) => Array.isArray(o[k])));
const larik = (o) => (Array.isArray(o) ? o : o[kunciLarik(o)]);

const bungkusRegistri = bacaJson('pest-registri.json');
const bungkusKurasi = bacaJson('pest.json');
const registri = larik(bungkusRegistri);
const kurasi = larik(bungkusKurasi);
const semua = [...kurasi, ...registri];
const olehId = new Map(semua.map((e) => [e.id, e]));

// Stadium hidup yang memisahkan sasaran pengendalian, bukan sekadar nama umum.
// "Ulat" TIDAK termasuk: pada "Ulat Grayak" dan "Ulat Api" ia bagian nama Indonesia
// organismenya, bukan penanda bahwa yang disasar cuma stadium ulatnya.
const STADIUM = /\b(larva|jentik|nimfa|nympha|telur|imago|pupa|kepompong)\b/i;

const NDJSON = join(VOCAB, 'product', 'pestisida.ndjson');
const baris = readFileSync(NDJSON, 'utf8').split('\n');
const pakai = new Map();
for (const b of baris) {
  if (!b.trim()) continue;
  for (const u of JSON.parse(b).label_uses ?? []) {
    const i = u.pest?.id;
    if (i) pakai.set(i, (pakai.get(i) ?? 0) + 1);
  }
}

// ---------------------------------------------------------------------------
// Kelompok
// ---------------------------------------------------------------------------
// accepted_scientific_name HANYA diisi kalau berbeda dari yang tercatat: 711 entitas
// punya, 451 sisanya cocok "exact" dan karena itu accepted-nya null — namanya sendiri
// sudah nama yang diterima. Mengelompokkan menurut accepted saja akan meninggalkan
// justru entitas yang ejaannya BENAR di luar kelompok, lalu menyatukan sebelas salah
// ketik jadi satu kanonik yang juga salah ketik. Karena itu kuncinya jatuh balik ke
// scientific_name — dan nol entitas berbagi scientific_name yang sama persis, jadi
// jatuhan itu tidak pernah menyatukan apa pun yang belum diverifikasi.
const hidup = semua.filter((e) => e.lifecycle?.status !== 'superseded');
const kasar = new Map();
for (const e of hidup) {
  const acc = ((e.accepted_scientific_name ?? e.scientific_name) ?? '').trim();
  if (!acc) continue;
  // Stadium ikut jadi bagian kunci, jadi "Larva Nyamuk" tidak pernah bertemu "Nyamuk".
  const st = (e.label.id.match(STADIUM) ?? [''])[0].toLowerCase();
  const k = st ? `${acc} [${st}]` : acc;
  (kasar.get(k) ?? kasar.set(k, []).get(k)).push(e);
}

const gabung = [];
const ditolak = [];
for (const [k, anggota] of [...kasar.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  if (anggota.length < 2) continue;
  const genusSaja = anggota.filter((e) => e.taxon_verification?.match_type === 'higher_rank');
  if (genusSaja.length) {
    ditolak.push({ kunci: k, anggota, sebab: `${genusSaja.length} anggota cuma cocok sampai genus` });
    continue;
  }
  const jenis = new Set(anggota.map((e) => e.pest_kind));
  if (jenis.size > 1) {
    ditolak.push({ kunci: k, anggota, sebab: `pest_kind berbeda: ${[...jenis].join(', ')}` });
    continue;
  }
  const acc = k.replace(/\s*\[.*\]$/, '');
  // Yang menang: ejaannya persis nama accepted → cocok exact, bukan fuzzy → paling
  // banyak dipakai → id terkecil. Tingkat pertama yang menentukan: ia memastikan
  // entitas kanonik membawa ejaan yang benar, bukan salah ketik yang kebetulan
  // paling sering muncul di registri.
  const urutan = anggota.slice().sort(
    (a, b) =>
      Number((b.scientific_name ?? '') === acc) - Number((a.scientific_name ?? '') === acc) ||
      Number(b.taxon_verification?.match_type === 'exact') - Number(a.taxon_verification?.match_type === 'exact') ||
      (pakai.get(b.id) ?? 0) - (pakai.get(a.id) ?? 0) ||
      a.id.localeCompare(b.id),
  );
  gabung.push({ kunci: k, menang: urutan[0], kalah: urutan.slice(1) });
}

const kalahSemua = new Map();
for (const g of gabung) for (const e of g.kalah) kalahSemua.set(e.id, g.menang.id);

// Label mana yang KATEGORI, bukan nama. "Gulma Berdaun Lebar" dipakai 417 entitas;
// menaikkannya jadi synonyms pada Ottochloa nodosa bukan cuma mubazir, ia keliru —
// Ottochloa rumput, bukan berdaun lebar. Ukurannya tidak perlu ambang: label yang
// juga dipakai entitas DI LUAR rumpun ini jelas bukan nama organisme ini.
const pemakaiLabel = new Map();
for (const e of hidup) {
  const k = e.label.id.toLowerCase().replace(/\s+/g, ' ').trim();
  (pemakaiLabel.get(k) ?? pemakaiLabel.set(k, new Set()).get(k)).add(e.id);
}
const labelKategori = (label, rumpun) => {
  const k = label.toLowerCase().replace(/\s+/g, ' ').trim();
  const pakaiLabel = pemakaiLabel.get(k) ?? new Set();
  const dalam = new Set(rumpun.map((e) => e.id));
  return [...pakaiLabel].some((id) => !dalam.has(id));
};

// ---------------------------------------------------------------------------
// Laporan
// ---------------------------------------------------------------------------
const rujukanPindah = [...pakai].filter(([id]) => kalahSemua.has(id)).reduce((a, [, n]) => a + n, 0);
console.log(`OPT hidup            : ${hidup.length}`);
console.log(`Berverifikasi GBIF   : ${hidup.filter((e) => e.accepted_scientific_name).length}`);
console.log(`Kelompok disatukan   : ${gabung.length}`);
console.log(`Entitas digantikan   : ${kalahSemua.size}  (${hidup.length} → ${hidup.length - kalahSemua.size})`);
console.log(`Rujukan produk       : ${rujukanPindah} penggunaan berlabel ikut dialihkan`);
console.log(`Kelompok DITOLAK     : ${ditolak.length}  (${ditolak.reduce((a, d) => a + d.anggota.length, 0)} entitas dibiarkan terpecah)`);
// Penjaga: kalau pemenang masih membawa ejaan yang bukan nama diterima, penyatuan ini
// justru mengangkat salah ketik jadi kanonik — persis kekeliruan yang diperbaiki pada
// putaran pertama alat ini.
const menangSalah = gabung.filter((g) => g.menang.scientific_name !== g.kunci.replace(/\s*\[.*\]$/, ''));
console.log(`Pemenang beda ejaan  : ${menangSalah.length} (harus 0 kalau ejaan benarnya ada di rumpun)`);
for (const g of menangSalah.slice(0, 6)) console.log(`   ${JSON.stringify(g.menang.scientific_name)} untuk takson ${JSON.stringify(g.kunci)}`);
console.log('');

const batas = process.argv.includes('--semua') ? gabung.length : 8;
for (const g of gabung.slice().sort((a, b) => b.kalah.length - a.kalah.length).slice(0, batas)) {
  console.log(`  ${g.menang.scientific_name}  <-  ${g.kalah.length} ejaan lain`);
  console.log(`     ${g.kalah.map((e) => JSON.stringify(e.scientific_name)).slice(0, 5).join(' ')}${g.kalah.length > 5 ? ' …' : ''}`);
}

console.log(`\nDitolak — dibiarkan terpecah karena menyatukannya akan menggabungkan spesies berbeda:`);
for (const d of ditolak.sort((a, b) => b.anggota.length - a.anggota.length).slice(0, 6))
  console.log(`  ${d.kunci.padEnd(24)} ${String(d.anggota.length).padStart(2)} entitas — ${d.sebab}`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menerapkan.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Terapkan
// ---------------------------------------------------------------------------
for (const g of gabung) {
  const menang = olehId.get(g.menang.id);
  menang.synonyms ??= [];
  for (const kalah of g.kalah) {
    const e = olehId.get(kalah.id);
    // Ejaan yang kalah naik jadi synonyms — berbeda dari dosis pada komoditas, ini
    // memang nama, dan orang yang menyalinnya dari label kemasan harus tetap sampai.
    // Saringan kategori berlaku untuk SEMUA calon, bukan cuma label. Synonyms yang
    // sudah menempel pada entitas registri ternyata juga memuat kategori — menyalinnya
    // apa adanya membuat Phytophthora infestans bersinonim "Hama Trips", padahal itu
    // serangga dan ini jamur. Yang disalin hanya nama yang benar-benar menunjuk
    // organisme ini.
    const rumpun = [g.menang, ...g.kalah];
    for (const n of [e.scientific_name, e.label.id, ...(e.synonyms ?? [])]) {
      if (!n || n === menang.scientific_name || n === menang.label.id) continue;
      if (menang.synonyms.includes(n)) continue;
      if (labelKategori(n, rumpun)) continue;
      menang.synonyms.push(n);
    }
    for (const m of e.mappings ?? []) {
      if (!menang.mappings.some((x) => x.scheme === m.scheme && x.id === m.id)) menang.mappings.push({ ...m });
    }
    e.lifecycle = { ...(e.lifecycle ?? {}), status: 'superseded', updated_at: STAMP, superseded_by: { id: menang.id } };
  }
  menang.synonyms.sort();
  menang.mappings.sort((a, b) => a.scheme.localeCompare(b.scheme) || String(a.id).localeCompare(String(b.id)));
  menang.lifecycle = { ...(menang.lifecycle ?? {}), updated_at: STAMP };
}

// Ratakan rantai penggantian — sama alasannya dengan satukan-komoditas-serumpun.mjs.
const hidupId = new Set(semua.filter((e) => e.lifecycle?.status !== 'superseded').map((e) => e.id));
const ujung = (id, jejak = new Set()) => {
  if (hidupId.has(id) || jejak.has(id)) return id;
  jejak.add(id);
  const lanjut = olehId.get(id)?.lifecycle?.superseded_by?.id;
  return lanjut ? ujung(lanjut, jejak) : id;
};
let rantai = 0;
for (const e of semua) {
  const tuju = e.lifecycle?.superseded_by?.id;
  if (!tuju) continue;
  const akhir = ujung(tuju);
  if (akhir !== tuju) {
    e.lifecycle = { ...e.lifecycle, superseded_by: { id: akhir }, updated_at: STAMP };
    rantai++;
  }
}

writeFileSync(join(VOCAB, 'pest-registri.json'), JSON.stringify(bungkusRegistri, null, 2) + '\n');
writeFileSync(join(VOCAB, 'pest.json'), JSON.stringify(bungkusKurasi, null, 2) + '\n');

let ubah = 0;
const baruNdjson = baris.map((b) => {
  if (!b.trim()) return b;
  const p = JSON.parse(b);
  let berubah = false;
  for (const u of p.label_uses ?? []) {
    const menang = kalahSemua.get(u.pest?.id);
    if (!menang) continue;
    u.pest.id = menang;
    berubah = true;
  }
  if (!berubah) return b;
  ubah++;
  return JSON.stringify(p);
});
writeFileSync(NDJSON, baruNdjson.join('\n'));

console.log(`\nDitulis:`);
console.log(`  pest-registri.json, pest.json  — ${kalahSemua.size} entitas jadi superseded, ${rantai} rantai diratakan`);
console.log(`  product/pestisida.ndjson       — ${ubah} rekaman`);
