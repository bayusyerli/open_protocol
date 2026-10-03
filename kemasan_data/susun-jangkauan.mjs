// Menghitung JANGKAUAN satu kemasan: berapa hektare yang bisa disemprot sekali beli.
//
//   node kemasan_data/susun-jangkauan.mjs
//
// PERTANYAAN YANG DITUTUPNYA, DAN KENAPA IA BELUM BISA DITUTUP
// "Dari dua produk berbahan aktif sama, mana yang lebih murah per hektare?" Menjawabnya
// menuntut tiga hal: kadar bahan aktif, dosis per hektare, dan ISI KEMASAN. Yang ketiga
// tidak ada di registri sama sekali — nol medan, kata "kemasan" nol kemunculan.
//
// SATU PREMIS DI MATRIKS YANG TERNYATA TIDAK UTUH
// No. 11 tertulis "dosisnya kini sudah lengkap dari no. 1; yang hilang tinggal ukuran
// kemasannya". Yang kedua benar, yang pertama tidak: dari 23.058 baris penggunaan
// berlabel, 10.901 menyatakan dosis per hektare — dan 6.302 menyatakannya PER LITER AIR
// SEMPROT. Angka per liter tidak bisa diubah jadi per hektare tanpa volume semprot per
// hektare, dan volume itu tidak dicatat registri di mana pun. Jadi yang menghalangi
// no. 11 dua hal, bukan satu, dan yang kedua tidak akan tertutup oleh data kemasan
// selengkap apa pun.
//
// DARI MANA ISI KEMASAN YANG SEDIKIT ITU DATANG
// Dari medan `pack` pada gambar_produk/manifes.ndjson — dipanen sebagai efek samping
// pekerjaan gambar kemasan, dari halaman katalog principal. Bukan dari registri, dan
// bukan dari OCR label.
//
// SATUAN TIDAK PERNAH DIPAKSAKAN
// Kemasan dalam mililiter hanya diadu dengan dosis dalam liter/ha atau ml/ha; kemasan
// dalam gram hanya dengan g/ha atau kg/ha. Kemasan cair melawan dosis massa — dan
// sebaliknya — DILEWATI, karena mengubahnya menuntut berat jenis, dan berat jenis
// pupuk/pestisida cair adalah lubang yang sudah tercatat sendiri di repositori ini.
//
// Keluaran:
//   jangkauan-kemasan.ndjson / .csv   satu baris per pendaftaran × kemasan × penggunaan
//   LAPIS.md                          hitungannya, dan dua penghalangnya

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const AKAR = join(DIR, '..');
const rapi = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const kutip = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
const n = (x) => Number(x ?? 0).toLocaleString('id-ID');

// --- isi kemasan dari manifes gambar --------------------------------------------------
const manifes = readFileSync(join(AKAR, 'gambar_produk/manifes.ndjson'), 'utf8')
  .split('\n').filter((x) => x.trim()).map((x) => JSON.parse(x));
const kemasanPer = new Map();
let packTeksSaja = 0;
for (const r of manifes) {
  const pk = r.pack;
  if (!pk) continue;
  if (pk.value === undefined || pk.value === null) { packTeksSaja++; continue; }
  for (const x of (r.narrowed_to ?? [])) {
    if (!kemasanPer.has(x.id)) kemasanPer.set(x.id, new Map());
    kemasanPer.get(x.id).set(`${pk.value} ${pk.unit}`, { nilai: Number(pk.value), satuan: rapi(pk.unit), teks: rapi(pk.text) });
  }
}

// --- registri ---------------------------------------------------------------------------
const produk = readFileSync(join(AKAR, 'spec/vocab/product/pestisida.ndjson'), 'utf8')
  .split('\n').filter((x) => x.trim()).map((x) => JSON.parse(x));

// Satuan diubah ke satuan dasar: mL untuk volume, g untuk massa. Kalau salah satunya
// tidak dikenal, barisnya dilewati — bukan ditebak.
const KE_ML = { ml: 1, mL: 1, l: 1000, L: 1000, liter: 1000 };
const KE_G = { g: 1, gr: 1, gram: 1, kg: 1000 };
const dimensi = (s) => (KE_ML[s] ? 'volume' : (KE_G[s] ? 'massa' : null));
const keDasar = (nilai, s) => (KE_ML[s] ? nilai * KE_ML[s] : (KE_G[s] ? nilai * KE_G[s] : null));

// "1 - 3", "0,75 - 1,5", "15" -> [min, maks]
const rentang = (teks) => {
  const angka = String(teks ?? '').replace(/,/g, '.').match(/\d+(?:\.\d+)?/g);
  if (!angka?.length) return null;
  const v = angka.map(Number);
  return [Math.min(...v), Math.max(...v)];
};

const baris = [];
const alasanLewat = { 'satuan tidak sedimensi': 0, 'satuan dosis tidak dikenal': 0, 'angka dosis tidak terbaca': 0 };
let punyaKemasan = 0; let punyaPerHa = 0; let irisan = 0;

const perHaRe = /^(m?l|g|gr|kg|liter)\s*\/\s*ha$/i;
for (const p of produk) {
  const kem = kemasanPer.get(p.id);
  const uses = p.label_uses ?? [];
  const perHa = uses.filter((u) => perHaRe.test(rapi(u.rate_unit_text).replace(/\s+/g, '')));
  if (kem) punyaKemasan++;
  if (perHa.length) punyaPerHa++;
  if (!kem || !perHa.length) continue;
  irisan++;

  for (const k of kem.values()) {
    const dimK = dimensi(k.satuan);
    for (const u of perHa) {
      const satuanDosis = rapi(u.rate_unit_text).replace(/\s+/g, '').split('/')[0];
      const dimD = dimensi(satuanDosis);
      if (!dimD) { alasanLewat['satuan dosis tidak dikenal']++; continue; }
      if (!dimK || dimK !== dimD) { alasanLewat['satuan tidak sedimensi']++; continue; }
      const r = rentang(u.rate_text);
      if (!r) { alasanLewat['angka dosis tidak terbaca']++; continue; }

      const isiDasar = keDasar(k.nilai, k.satuan);
      const dosisDasar = r.map((x) => keDasar(x, satuanDosis));
      // dosis terkecil menyapu paling luas
      const haMaks = isiDasar / dosisDasar[0];
      const haMin = isiDasar / dosisDasar[1];
      baris.push({
        nomor_pendaftaran: rapi(p.registration?.number),
        merek: rapi(p.label?.id),
        kemasan: `${k.nilai} ${k.satuan}`,
        kemasan_teks: k.teks,
        komoditas: rapi(u.commodity_label),
        opt: rapi(u.pest_label),
        dosis: `${rapi(u.rate_text)} ${rapi(u.rate_unit_text)}`,
        ha_per_kemasan_min: Number(haMin.toFixed(3)),
        ha_per_kemasan_maks: Number(haMaks.toFixed(3)),
        m2_per_kemasan_min: Math.round(haMin * 10000),
        m2_per_kemasan_maks: Math.round(haMaks * 10000),
        kemasan_per_ha_maks: Number((1 / haMin).toFixed(2)),
      });
    }
  }
}

baris.sort((a, b) => a.merek.localeCompare(b.merek) || a.komoditas.localeCompare(b.komoditas));

// --- sebaran satuan dosis di seluruh registri -------------------------------------------
const satuanSemua = {};
let barisPenggunaan = 0;
for (const p of produk) {
  for (const u of (p.label_uses ?? [])) {
    barisPenggunaan++;
    const s = rapi(u.rate_unit_text).toLowerCase() || '(kosong)';
    satuanSemua[s] = (satuanSemua[s] ?? 0) + 1;
  }
}
const perLiter = Object.entries(satuanSemua).filter(([k]) => /\/\s*l$|\/\s*liter/.test(k)).reduce((a, [, v]) => a + v, 0);
const perHektare = Object.entries(satuanSemua).filter(([k]) => /\/\s*ha$/.test(k)).reduce((a, [, v]) => a + v, 0);

mkdirSync(DIR, { recursive: true });
const KOLOM = ['nomor_pendaftaran', 'merek', 'kemasan', 'komoditas', 'opt', 'dosis', 'ha_per_kemasan_min', 'ha_per_kemasan_maks', 'm2_per_kemasan_min', 'm2_per_kemasan_maks', 'kemasan_per_ha_maks', 'kemasan_teks'];
writeFileSync(join(DIR, 'jangkauan-kemasan.ndjson'), baris.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync(join(DIR, 'jangkauan-kemasan.csv'),
  KOLOM.join(',') + '\n' + baris.map((r) => KOLOM.map((k) => kutip(r[k])).join(',')).join('\n') + '\n');

const merek = new Set(baris.map((r) => r.merek));
// Satu merek bisa punya belasan baris untuk OPT berbeda pada kemasan dan komoditas yang
// sama; daftar sorotan dipendekkan per merek × kemasan × komoditas supaya menampilkan
// keragaman, bukan pengulangan.
const terlihat = new Set();
const terkecil = [...baris]
  .sort((a, b) => a.m2_per_kemasan_maks - b.m2_per_kemasan_maks)
  .filter((r) => {
    const k = `${r.merek}|${r.kemasan}|${r.komoditas}`;
    if (terlihat.has(k)) return false;
    terlihat.add(k);
    return true;
  })
  .slice(0, 8);

writeFileSync(join(DIR, 'LAPIS.md'), `# Jangkauan satu kemasan — berapa hektare sekali beli

Disusun ulang oleh \`susun-jangkauan.mjs\` dari isi kemasan di \`gambar_produk/manifes.ndjson\`
dan dosis berlabel di \`spec/vocab/product/pestisida.ndjson\`.

## Yang bisa dijawab hari ini: ${n(baris.length)} baris, ${n(merek.size)} merek

Satu baris per pendaftaran × ukuran kemasan × penggunaan berlabel. Angkanya jangkauan:
berapa hektare yang tersapu satu kemasan pada dosis label.

${terkecil.map((r) => `- **${r.merek}** ${r.kemasan} pada ${r.komoditas} — ${n(r.m2_per_kemasan_min)}–${n(r.m2_per_kemasan_maks)} m² sekali beli`).join('\n')}

## Dua penghalang, bukan satu

Matriks menulis no. 11 sebagai "dosisnya kini sudah lengkap; yang hilang tinggal ukuran
kemasannya". Yang kedua benar. Yang pertama tidak.

| | Baris penggunaan |
|---|---:|
| Menyatakan dosis **per hektare** | ${n(perHektare)} |
| Menyatakan dosis **per liter air semprot** | ${n(perLiter)} |
| Seluruh baris penggunaan berlabel | ${n(barisPenggunaan)} |

Dosis per liter air semprot **tidak bisa** diubah jadi per hektare tanpa volume semprot
per hektare, dan volume itu tidak dicatat registri di mana pun. Untuk baris-baris itu,
pertanyaan "berapa rupiah per hektare" tidak punya jawaban betapapun lengkap data
kemasannya nanti.

| | Pendaftaran |
|---|---:|
| Punya isi kemasan terurai | **${n(punyaKemasan)}** dari ${n(produk.length)} |
| Punya sedikitnya satu dosis per hektare | ${n(punyaPerHa)} |
| **Punya keduanya** | **${n(irisan)}** |

## Satuan tidak pernah dipaksakan

Kemasan cair hanya diadu dengan dosis volume, kemasan padat hanya dengan dosis massa.
Yang tidak sedimensi dilewati — mengubahnya menuntut berat jenis, dan berat jenis cairan
adalah lubang yang sudah tercatat sendiri di repositori ini.

${Object.entries(alasanLewat).filter(([, v]) => v).map(([k, v]) => `- ${k}: ${n(v)} pasangan dilewati`).join('\n') || '- tidak ada pasangan yang dilewati'}

## Yang tidak dijawab

- **Harga.** Berkas ini menghitung jangkauan, bukan biaya. Rupiah per hektare menuntut
  harga kemasan, dan harga tidak ada di registri mana pun.
- **Isi kemasan untuk ${n(produk.length - punyaKemasan)} pendaftaran lainnya.** Yang ada di sini efek samping panen
  gambar kemasan, dari halaman katalog principal — bukan sumber yang dirancang untuk itu.
- **Apakah kemasannya masih dijual dalam ukuran itu.** Katalog principal berubah tanpa
  memberi tahu, dan tidak ada tanggal pada medan \`pack\`.
`);

console.log(`${n(baris.length)} baris jangkauan · ${n(merek.size)} merek`);
console.log(`  punya isi kemasan ${n(punyaKemasan)}/${n(produk.length)} · punya dosis per ha ${n(punyaPerHa)} · keduanya ${n(irisan)}`);
console.log(`  dosis per hektare ${n(perHektare)} baris · per liter semprot ${n(perLiter)} baris`);
if (packTeksSaja) console.log(`  ${packTeksSaja} medan pack hanya teks tanpa angka terurai — dilewati`);
