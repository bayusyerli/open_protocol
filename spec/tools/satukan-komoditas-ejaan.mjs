// Menyatukan komoditas yang terbelah karena EJAAN dan pilihan kata, bukan karena
// kurung berisi dosis.
//
//   node spec/tools/satukan-komoditas-ejaan.mjs            # periksa saja
//   node spec/tools/satukan-komoditas-ejaan.mjs --tulis    # tulis perubahannya
//
// KENAPA satukan-komoditas-serumpun.mjs TIDAK MENANGKAP INI
// Alat itu membuang derau di dalam KURUNG — "Cabai (1,5 ml/l)" jadi "Cabai" — dan itu
// menyelesaikan 214 entitas. Yang tersisa jenis lain: hal yang sama ditulis dengan kata
// yang berbeda, tanpa satu kurung pun.
//
//   "Beras di penyimpanan"  ·  "Beras dalam penyimpanan"  ·  "Beras di peyimpanan"
//   "Mentimun"              ·  "Ketimun"
//
// Tidak ada pola yang bisa dihitung dari ketiganya: "di" lawan "dalam" bukan derau di
// tempat lain, dan "Ketimun" bukan salah ketik "Mentimun" melainkan kata lain untuk
// tanaman yang sama. Jadi tabelnya ditulis tangan, satu kelompok satu baris, dan alat
// ini menolak apa pun yang tidak ada di dalamnya.
//
// APA YANG RUSAK KALAU DIBIARKAN
// Dua hal, dan keduanya terlihat di layar. Pertama, pintu gejala menyaring menurut inang:
// pintu hama gudang berinang "Beras di penyimpanan" tidak menjangkau tujuh baris yang
// registrinya menulis "Beras dalam penyimpanan". Kedua — dan ini yang lebih buruk —
// menambal lubang pertama dengan mendaftarkan SELURUH ejaan sebagai inang membuat
// saringan tanaman menumbuhkan lima keping yang nyaris sama bunyinya, dan yang membaca
// layar itu tidak punya cara tahu bahwa kelimanya gudang yang sama.
//
// YANG SENGAJA TIDAK DISATUKAN
// Fase dan cara budidaya BUKAN ejaan: "Tembakau di persemaian" bukan "Tembakau", dan
// "Pembibitan kelapa sawit" bukan "Kelapa sawit" — pendaftarannya memang berbeda karena
// tanamannya berbeda umur dan perlakuannya berbeda. Begitu juga "Cabai rawit" lawan
// "Cabai": rawit varietas tersendiri yang registri kadang menyebut sendiri, dan
// menyatukannya membuang pembedaan yang benar-benar dimaksud.
//
// Idempoten: kelompok yang anggotanya sudah superseded dilewati.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VOCAB = join(akar, 'spec', 'vocab');
const NDJSON = join(VOCAB, 'product', 'pestisida.ndjson');
const STAMP = '2026-08-28T00:00:00Z';
const tulis = process.argv.includes('--tulis');

// `dasar` wajib menyebut kenapa keduanya tempat/tanaman yang SAMA.
const KELOMPOK = [
  // --- "Budidaya X" bukan fase, melainkan kata untuk X ---
  // Ini kebalikan dari kelompok di bawah, dan pembalikannya yang membuatnya penting:
  // pada kelapa sawit dan kopi, MASSA pendaftaran justru duduk di ejaan "Budidaya", bukan
  // di nama tanamannya. Sembilan pintu kelapa sawit berinang "Kelapa sawit" yang cuma
  // dipegang 6 baris non-gulma, sementara 197 baris — Metisa plana 60, Setothosea asigna
  // 51, Oryctes rhinoceros 20 — berdiri di bawah "Budidaya kelapa sawit". Layar
  // menampilkan keduanya sebagai dua tanaman, dan yang membacanya tidak punya cara tahu
  // bahwa keduanya kebun sawit yang sama.
  //
  // Yang menang tetap NAMA TANAMANNYA, bukan yang barisnya lebih banyak: "Budidaya kelapa
  // sawit" bukan nama tanaman, dan keping saringan tanaman yang berbunyi begitu salah
  // membaca. Catatan varietas yang berdiri di atas yang kalah — 110 untuk sawit, 125 untuk
  // kopi, 103 untuk ubi kayu — ikut diarahkan ulang, dan itu justru alasan alat ini
  // sekarang membaca varietas: tanpa itu 338 catatan menggantung.
  //
  // "Budidaya" berbeda dari kualifikasi yang MEMANG membedakan. "Padi sawah" bukan "Padi"
  // (sawah lawan gogo), "Pembibitan kelapa sawit" bukan "Kelapa sawit" (umur dan
  // perlakuannya berbeda), dan "Budidaya padi sawah (Tapin)" menyebut cara tanam. Yang
  // disatukan di sini hanya yang kata tambahannya tidak membedakan apa pun.
  {
    menang: 'op:cmd:00001151',
    kalah: ['op:cmd:00001000', 'op:cmd:00001053', 'op:cmd:00001138', 'op:cmd:00001117'],
    dasar: '"Budidaya kelapa sawit", "Budidaya tanaman kelapa sawit", serta salah ketik "Budaidaya kelapa sawit" dan "Kepala sawit" seluruhnya menyebut kebun kelapa sawit yang sama; "budidaya" tidak membedakan apa pun dari nama tanamannya.',
  },
  {
    menang: 'op:cmd:00001244',
    kalah: ['op:cmd:00001009'],
    dasar: '"Budidaya kopi" menyebut kebun kopi yang sama dengan "Kopi"; kata "budidaya" tidak membedakan jenis, umur, maupun cara tanamnya.',
  },
  {
    menang: 'op:cmd:00001194',
    kalah: ['op:cmd:00001051', 'op:cmd:00001394'],
    dasar: '"Budidaya tanaman padi sawah" dan "Tanaman padi sawah" menyebut sawah padi yang sama dengan "Padi sawah"; yang membedakan dari "Padi" kata "sawah", bukan kata "budidaya" atau "tanaman".',
  },
  {
    menang: 'op:cmd:00001002',
    kalah: ['op:cmd:00001060', 'op:cmd:00001077'],
    dasar: '"Budidaya tanaman jagung" dan "Budidaya jagung" menyebut pertanaman jagung yang sama dengan "Jagung".',
  },
  {
    menang: 'op:cmd:00001018',
    kalah: ['op:cmd:00001361'],
    dasar: '"Tanaman Tembakau" menyebut pertanaman tembakau yang sama dengan "Tembakau"; kata "tanaman" tidak membedakan fase maupun cara budidayanya.',
  },
  {
    menang: 'op:cmd:00001003',
    kalah: ['op:cmd:00001513'],
    dasar: '"TANAMAN CABAI" — ditulis huruf besar seluruhnya di registri — menyebut pertanaman cabai yang sama dengan "Cabai".',
  },
  {
    menang: 'op:cmd:00001006',
    kalah: ['op:cmd:00001038'],
    dasar: '"Budidaya tanaman tebu" menyebut pertanaman tebu yang sama dengan "Tebu".',
  },
  {
    menang: 'op:cmd:00001464',
    kalah: ['op:cmd:00001057'],
    dasar: '"Tanaman Karet" menyebut kebun karet yang sama dengan "Karet".',
  },
  {
    menang: 'op:cmd:00001010',
    kalah: ['op:cmd:00001102'],
    dasar: '"Budidaya kakao" menyebut kebun kakao yang sama dengan "Kakao".',
  },
  {
    menang: 'op:cmd:00001007',
    kalah: ['op:cmd:00001124'],
    dasar: '"Budidaya tanaman kedelai" menyebut pertanaman kedelai yang sama dengan "Kedelai".',
  },
  {
    menang: 'op:cmd:00001218',
    kalah: ['op:cmd:00001020'],
    dasar: '"Budidaya ubi kayu" menyebut pertanaman ubi kayu yang sama dengan "Ubi Kayu"; 103 catatan varietas berdiri di atas yang kalah dan ikut diarahkan ulang.',
  },
  {
    menang: 'op:cmd:00001039',
    kalah: ['op:cmd:00001071'],
    dasar: '"Budidaya tanaman akasia" menyebut tegakan akasia yang sama dengan "Akasia".',
  },
  {
    menang: 'op:cmd:00001048',
    kalah: ['op:cmd:00001114'],
    dasar: '"Budidaya Tanaman Eucalyptus" menyebut tegakan eucalyptus yang sama dengan "Eucalyptus".',
  },
  {
    menang: 'op:cmd:00001055',
    kalah: ['op:cmd:00001292', 'op:cmd:00001496', 'op:cmd:00001086'],
    dasar: '"Bibit tanaman kelapa sawit", "Bibit kelapa sawit", dan "Budidaya persemaian kelapa sawit" seluruhnya menyebut fase pembibitan kelapa sawit yang sama. Fasenya TETAP terpisah dari "Kelapa sawit" — umur dan perlakuannya memang berbeda — yang disatukan cuma keempat cara menuliskan fase itu.',
  },
  {
    menang: 'op:cmd:00001023',
    kalah: ['op:cmd:00001113', 'op:cmd:00001144'],
    dasar: '"Beras dalam penyimpanan" dan salah ketik "Beras di peyimpanan" menyebut gudang beras yang sama dengan "Beras di penyimpanan".',
  },
  {
    menang: 'op:cmd:00001080',
    kalah: ['op:cmd:00001169'],
    dasar: '"Jagung dalam penyimpanan" menyebut gudang jagung yang sama dengan "Jagung di penyimpanan".',
  },
  {
    menang: 'op:cmd:00001170',
    kalah: ['op:cmd:00001245', 'op:cmd:00001486'],
    dasar: '"Terigu di penyimpanan" dan "Tepung di penyimpanan" menyebut tepung terigu tersimpan yang sama.',
  },
  {
    menang: 'op:cmd:00001045',
    kalah: ['op:cmd:00001091'],
    dasar: 'Ketimun dan mentimun dua kata untuk Cucumis sativus yang sama; keduanya dipakai bergantian di Indonesia.',
  },
  {
    menang: 'op:cmd:00001221',
    kalah: ['op:cmd:00001499'],
    dasar: '"Kembang kol" dan "Kubis Bunga" dua kata untuk Brassica oleracea var. botrytis yang sama. Yang menang justru yang ejaannya kaku, karena 60 catatan varietas berdiri di atasnya sementara "Kembang kol" cuma dipakai satu baris pendaftaran.',
  },
  {
    menang: 'op:cmd:00001345',
    kalah: ['op:cmd:00001330'],
    dasar: '"Strawberi" ejaan Inggris yang diserap sebagian untuk stroberi, Fragaria x ananassa yang sama; keduanya membawa satu baris Botrytis cinerea.',
  },
  {
    menang: 'op:cmd:00000004',
    kalah: ['op:cmd:00001477'],
    dasar: 'Salah ketik "Bawang Meraah" untuk "Bawang merah"; satu-satunya barisnya Alternaria porri, bercak ungu yang memang OPT bawang merah.',
  },
  {
    menang: 'op:cmd:00001207',
    kalah: ['op:cmd:00001295'],
    dasar: 'Salah ketik "Tembakau di pesemaian" untuk "Tembakau di persemaian"; keduanya fase persemaian tembakau yang sama, bukan dua cara budidaya.',
  },
  {
    menang: 'op:cmd:00001482',
    kalah: ['op:cmd:00001495'],
    dasar: 'Salah ketik "Tambakau di penyimpanan" untuk "Tembakau di penyimpanan".',
  },
];

const bacaJson = (p) => JSON.parse(readFileSync(join(VOCAB, p), 'utf8'));
const kunciLarik = (o) => (Array.isArray(o) ? null : Object.keys(o).find((k) => Array.isArray(o[k])));
const larik = (o) => (Array.isArray(o) ? o : o[kunciLarik(o)]);

const bungkusRegistri = bacaJson('commodity-registri.json');
const bungkusKurasi = bacaJson('commodity.json');
const semua = [...larik(bungkusKurasi), ...larik(bungkusRegistri)];
const olehId = new Map(semua.map((e) => [e.id, e]));

const bantah = [];
const satu = [];
const dilewati = [];

for (const g of KELOMPOK) {
  const m = olehId.get(g.menang);
  if (!m) { bantah.push(`${g.menang} tidak ada.`); continue; }
  if (m.lifecycle?.status === 'superseded') { bantah.push(`${g.menang} sudah digantikan; jangan jadikan tujuan.`); continue; }
  if (!g.dasar || g.dasar.length < 40) { bantah.push(`${g.menang}: dasar penyatuan terlalu pendek untuk diperiksa orang lain.`); continue; }
  for (const kid of g.kalah) {
    const k = olehId.get(kid);
    if (!k) { bantah.push(`${kid} tidak ada.`); continue; }
    if (k.lifecycle?.status === 'superseded') { dilewati.push(kid); continue; }
    // Ejaan registri milik yang kalah naik jadi synonyms pemenang. Berbeda dari OPT,
    // aturan L26 tidak menyentuh komoditas — tetapi nama itu tetap satu-satunya jejak
    // bahwa registri pernah menuliskannya begitu, dan membuangnya memutus penelusuran.
    const sin = new Set([...(m.synonyms ?? []), ...(k.synonyms ?? []), k.label?.id].filter(Boolean));
    m.synonyms = [...sin].sort();
    const adaKementan = new Set((m.mappings ?? []).filter((x) => x.scheme === 'KEMENTAN').map((x) => x.id));
    const naik = (k.mappings ?? []).filter((x) => x.scheme === 'KEMENTAN' && !adaKementan.has(x.id));
    if (naik.length) m.mappings = [...(m.mappings ?? []), ...naik];
    k.lifecycle = { ...(k.lifecycle ?? {}), status: 'superseded', updated_at: STAMP, superseded_by: { id: g.menang } };
    satu.push(`${k.label?.id} → ${m.label?.id}`);
  }
}

// Rantai penggantian diratakan. Entitas yang kalah hari ini sudah lebih dulu jadi tujuan
// bagi varian dosisnya sendiri — "Ketimun (4 g/l)" menunjuk "Ketimun", dan "Ketimun" kini
// menunjuk "Mentimun". L29 menolak rantai seperti itu, dan benar menolaknya.
let diratakan = 0;
{
  const ujung = (id) => {
    const lewat = new Set();
    let kini = id;
    while (olehId.get(kini)?.lifecycle?.superseded_by?.id) {
      const lanjut = olehId.get(kini).lifecycle.superseded_by.id;
      if (lewat.has(lanjut)) { bantah.push(`rantai berputar di ${lanjut}.`); break; }
      lewat.add(lanjut); kini = lanjut;
    }
    return kini;
  };
  for (const e of semua) {
    const tuju = e.lifecycle?.superseded_by?.id;
    if (!tuju) continue;
    const akhir = ujung(tuju);
    if (akhir === tuju) continue;
    e.lifecycle = { ...e.lifecycle, superseded_by: { id: akhir }, updated_at: STAMP };
    diratakan += 1;
  }
}

const pindah = new Map(KELOMPOK.flatMap((g) => g.kalah.map((k) => [k, g.menang])));

// Berkas skala fase: rujukan `applies_to.commodities` diarahkan ulang, kembar dibuang.
let ubahSkala = 0;
const berkasSkala = readdirSync(VOCAB).filter((f) => f.startsWith('stage-scale') && f.endsWith('.json'));
const tulisSkala = [];
for (const f of berkasSkala) {
  const isi = JSON.parse(readFileSync(join(VOCAB, f), 'utf8'));
  const daftar = Array.isArray(isi) ? isi : (isi.items ?? [isi]);
  let kena = false;
  for (const e of daftar) {
    const cs = e.applies_to?.commodities;
    if (!Array.isArray(cs)) continue;
    const lihat = new Set();
    const baru = [];
    for (const c of cs) {
      const tuju = pindah.get(c.id) ?? c.id;
      if (lihat.has(tuju)) { kena = true; continue; }
      lihat.add(tuju);
      if (tuju !== c.id) { kena = true; ubahSkala += 1; baru.push({ ...c, id: tuju, label: olehId.get(tuju)?.label?.id ?? c.label }); }
      else baru.push(c);
    }
    if (kena) e.applies_to.commodities = baru;
  }
  if (kena) tulisSkala.push([f, isi]);
}

// Sisi seberangnya: `default_stage_scale` milik yang kalah naik ke pemenang kalau pemenang
// belum punya, lalu DICABUT dari yang kalah. Pencabutannya bukan kerapian — `synonyms` dan
// `mappings` ditinggalkan di yang kalah justru supaya ejaan aslinya bisa ditelusuri,
// tetapi `default_stage_scale` bukan catatan asal-usul melainkan perintah yang masih
// hidup: "pakai skala ini untuk komoditas ini". Entitas yang sudah digantikan tidak lagi
// dicantumkan skalanya di `applies_to.commodities`, jadi meninggalkannya di sana membuat
// tautan yang putus sebelah — persis yang L28 dipasang untuk menolak.
let skalaNaik = 0;
let skalaDicabut = 0;
for (const g of KELOMPOK) {
  const m = olehId.get(g.menang);
  if (!m) continue;
  for (const kid of g.kalah) {
    const k = olehId.get(kid);
    if (!k?.default_stage_scale) continue;
    if (!m.default_stage_scale) { m.default_stage_scale = { ...k.default_stage_scale }; skalaNaik += 1; }
    if (k.lifecycle?.status === 'superseded') { delete k.default_stage_scale; skalaDicabut += 1; }
  }
}

// Seri harga ikut menunjuk komoditas, dan rujukannya sama nyatanya dengan rujukan pada
// label produk: seri "Ketimun sedang" menunjuk entitas ketimun yang kini digantikan.
// Skala fase menunjuk komoditas dari sisi seberang — `applies_to.commodities` — dan L28
// menuntut tautannya sepakat dua arah. Menyatukan "Budidaya kopi" karena itu menyalakan
// L29 pada stage-scale-bbch-kopi.json, dan memperbaikinya di berkas skala tidak cukup:
// kalau yang kalah membawa `default_stage_scale` sementara yang menang tidak, tautannya
// putus sebelah. Keduanya dirapikan di sini.
// Varietas menunjuk komoditas juga, dan lupa itu bukan kesalahan kecil: 105 galat L29
// menyala sekaligus saat "Kubis Bunga" digantikan, karena 60 catatan varietas kembang kol
// berdiri di atasnya. Lebih dari itu, cacah varietas per komoditas yang jadi ALASAN memilih
// pemenang — 60 lawan 0 — hanya bisa dilihat kalau berkas ini ikut dibaca.
const VARIETAS = join(VOCAB, 'variety', 'varietas.ndjson');

const HARGA = join(VOCAB, 'harga', 'harga.ndjson');
const barisHarga = readFileSync(HARGA, 'utf8').split('\n');
let ubahHarga = 0;
const baruHarga = barisHarga.map((b) => {
  if (!b.trim()) return b;
  const d = JSON.parse(b);
  const tuju = d.commodity?.id && pindah.get(d.commodity.id);
  if (!tuju) return b;
  d.commodity.id = tuju;
  ubahHarga += 1;
  return JSON.stringify(d);
});
const barisVarietas = readFileSync(VARIETAS, 'utf8').split('\n');
let ubahVarietas = 0;
const baruVarietas = barisVarietas.map((b) => {
  if (!b.trim()) return b;
  const d = JSON.parse(b);
  const tuju = d.commodity?.id && pindah.get(d.commodity.id);
  if (!tuju) return b;
  d.commodity.id = tuju;
  ubahVarietas += 1;
  return JSON.stringify(d);
});

const baris = readFileSync(NDJSON, 'utf8').split('\n');
let ubahRekaman = 0;
let ubahBaris = 0;
const baruNdjson = baris.map((b) => {
  if (!b.trim()) return b;
  const p = JSON.parse(b);
  let kena = false;
  for (const u of p.label_uses ?? []) {
    const tuju = u.commodity?.id && pindah.get(u.commodity.id);
    if (!tuju) continue;
    u.commodity.id = tuju;
    kena = true;
    ubahBaris += 1;
  }
  if (kena) ubahRekaman += 1;
  return kena ? JSON.stringify(p) : b;
});

if (bantah.length) {
  for (const b of bantah) console.error(`  TOLAK  ${b}`);
  console.error(`\n${bantah.length} penolakan — tidak ada yang ditulis.`);
  process.exit(1);
}

for (const s of satu) console.log(`  satu    ${s}`);
console.log(`\n  commodity-registri.json  — ${satu.length} entitas jadi superseded, ${diratakan} rantai diratakan, ${dilewati.length} dilewati`);
console.log(`  variety/varietas.ndjson  — ${ubahVarietas} catatan varietas diarahkan ulang`);
console.log(`  stage-scale-*.json       — ${ubahSkala} rujukan komoditas diarahkan ulang, ${skalaNaik} skala bawaan naik ke pemenang, ${skalaDicabut} dicabut dari yang kalah`);
console.log(`  harga/harga.ndjson       — ${ubahHarga} seri harga diarahkan ulang`);
console.log(`  product/pestisida.ndjson — ${ubahRekaman} rekaman, ${ubahBaris} baris penggunaan`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyimpan.');
  process.exit(0);
}

writeFileSync(join(VOCAB, 'commodity-registri.json'), JSON.stringify(bungkusRegistri, null, 2) + '\n');
writeFileSync(join(VOCAB, 'commodity.json'), JSON.stringify(bungkusKurasi, null, 2) + '\n');
writeFileSync(NDJSON, baruNdjson.join('\n'));
writeFileSync(VARIETAS, baruVarietas.join('\n'));
for (const [f, isi] of tulisSkala) writeFileSync(join(VOCAB, f), JSON.stringify(isi, null, 2) + '\n');
writeFileSync(HARGA, baruHarga.join('\n'));
console.log('\nDitulis.');
