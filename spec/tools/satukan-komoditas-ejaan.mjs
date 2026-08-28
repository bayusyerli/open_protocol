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

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VOCAB = join(akar, 'spec', 'vocab');
const NDJSON = join(VOCAB, 'product', 'pestisida.ndjson');
const STAMP = '2026-08-28T00:00:00Z';
const tulis = process.argv.includes('--tulis');

// `dasar` wajib menyebut kenapa keduanya tempat/tanaman yang SAMA.
const KELOMPOK = [
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

// Seri harga ikut menunjuk komoditas, dan rujukannya sama nyatanya dengan rujukan pada
// label produk: seri "Ketimun sedang" menunjuk entitas ketimun yang kini digantikan.
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
console.log(`  harga/harga.ndjson       — ${ubahHarga} seri harga diarahkan ulang`);
console.log(`  product/pestisida.ndjson — ${ubahRekaman} rekaman, ${ubahBaris} baris penggunaan`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyimpan.');
  process.exit(0);
}

writeFileSync(join(VOCAB, 'commodity-registri.json'), JSON.stringify(bungkusRegistri, null, 2) + '\n');
writeFileSync(join(VOCAB, 'commodity.json'), JSON.stringify(bungkusKurasi, null, 2) + '\n');
writeFileSync(NDJSON, baruNdjson.join('\n'));
writeFileSync(HARGA, baruHarga.join('\n'));
console.log('\nDitulis.');
