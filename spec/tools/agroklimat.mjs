// Penghitung agroklimat: dari deret hujan bulanan ke kelas bernama.
//
// Dipakai dua pihak, dan itu disengaja:
//   1. check.mjs — aturan L42 menghitung ulang kelas sebuah penetapan dari angka
//      yang direkam bersamanya, lalu menolak bila hasilnya lain. Sama seperti
//      sidik-petak.mjs dipakai L36.
//   2. manusia lewat CLI, untuk menurunkan kelas dari deret hujan yang dipegangnya.
//
// Yang TIDAK ada di sini: pengambilan datanya. Repositori ini tidak menyimpan deret
// hujan dan tidak menariknya dari mana pun — lihat docs/21-agroklimat.md soal kenapa.

import { readFileSync } from 'node:fs';

// ---------- 1. Ambang: apakah sebuah nilai memenuhi satu syarat ----------
// Batas terbuka dan tertutup dibedakan sungguh-sungguh. Q tepat 33,3 harus jatuh
// ke satu tipe saja, dan itu hanya bisa dijamin kalau `ge` benar-benar berarti ≥
// dan `lt` benar-benar berarti <.
export function penuhiSyarat(nilai, syarat) {
  if (typeof nilai !== 'number' || Number.isNaN(nilai)) return false;
  if (syarat.ge !== undefined && !(nilai >= syarat.ge)) return false;
  if (syarat.gt !== undefined && !(nilai > syarat.gt)) return false;
  if (syarat.le !== undefined && !(nilai <= syarat.le)) return false;
  if (syarat.lt !== undefined && !(nilai < syarat.lt)) return false;
  return true;
}

// ---------- 2. Kelas mana yang cocok dengan sekumpulan masukan ----------
// Mengembalikan LARIK, bukan satu kelas. Nol berarti masukannya jatuh di luar
// seluruh kelas; lebih dari satu berarti skemanya sendiri yang tumpang tindih.
// Keduanya kekeliruan, dan keduanya harus bisa dibedakan dari "cocok satu".
export function kelasCocok(skema, inputs) {
  return (skema.classes ?? []).filter((k) => {
    if (!Array.isArray(k.criteria) || k.criteria.length === 0) return false;
    return k.criteria.every((c) => penuhiSyarat(inputs[c.input], c));
  });
}

// ---------- 3. Kendala antar-masukan ----------
// Bukan pemeriksaan kelas melainkan pemeriksaan kewarasan angkanya: runtun bulan
// basah ditambah runtun bulan kering tidak bisa melewati 12.
export function kendalaDilanggar(skema, inputs) {
  const langgar = [];
  for (const k of skema.input_constraints ?? []) {
    const nilai = k.sum_of.reduce((a, key) => a + (inputs[key] ?? 0), 0);
    if (k.le !== undefined && nilai > k.le) langgar.push({ ...k, nilai });
    if (k.ge !== undefined && nilai < k.ge) langgar.push({ ...k, nilai });
  }
  return langgar;
}

// ---------- 4. Dari deret hujan ke cacahan bulan ----------
// `deret` berbentuk { "1992": [12 angka mm], "1993": [...] } — satu larik per tahun,
// Januari di indeks 0.
// Runtun dihitung MELINGKAR, bukan dari Januari ke Desember. Musim hujan Jawa
// membentang November–Maret; menghitungnya lurus akan memotongnya jadi dua runtun
// pendek (Nov–Des dan Jan–Mar) dan menurunkan zona Oldeman satu-dua tingkat pada
// sebagian besar wilayah monsunal Indonesia. Batas tahun kalender bukan batas musim.
export function runtunMelingkar(bendera) {
  if (bendera.every(Boolean)) return bendera.length;
  let maks = 0;
  let jalan = 0;
  for (const b of [...bendera, ...bendera]) {
    jalan = b ? jalan + 1 : 0;
    if (jalan > maks) maks = jalan;
  }
  return Math.min(maks, bendera.length);
}
const runtun = runtunMelingkar;

const tahunan = (deret) => Object.keys(deret).sort().map((t) => deret[t]);

// Oldeman punya DUA cara hitung yang sama-sama beredar, dan keduanya bisa memberi
// kelas berbeda untuk deret yang sama. Alat ini menghitung keduanya dan tidak
// memilih salah satunya diam-diam; yang memilih harus manusia, dan pilihannya
// dicatat di `basis.note` penetapannya.
export function runtunDariRerata(deret, md) {
  const tahun = tahunan(deret);
  const rerata = Array.from({ length: 12 }, (_, i) =>
    tahun.reduce((a, t) => a + t[i], 0) / tahun.length);
  return {
    cara: 'rerata-dulu',
    runtun_bulan_basah: runtun(rerata.map((v) => v > md.wet_month_min_mm)),
    runtun_bulan_kering: runtun(rerata.map((v) => v < md.dry_month_max_mm)),
    rerata_bulanan: rerata.map((v) => Math.round(v * 10) / 10),
  };
}

export function runtunRerataPerTahun(deret, md) {
  const tahun = tahunan(deret);
  const bb = tahun.map((t) => runtun(t.map((v) => v > md.wet_month_min_mm)));
  const bk = tahun.map((t) => runtun(t.map((v) => v < md.dry_month_max_mm)));
  const rata = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  return {
    cara: 'runtun-dulu',
    runtun_bulan_basah: Math.round(rata(bb)),
    runtun_bulan_kering: Math.round(rata(bk)),
  };
}

// Schmidt-Ferguson tidak punya kemenduaan itu: definisinya menyebut rata-rata
// CACAHAN, jadi cacahnya dulu per tahun, baru dirata-ratakan, baru dinisbahkan.
export function nilaiQ(deret, md) {
  const tahun = tahunan(deret);
  const rata = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const kering = rata(tahun.map((t) => t.filter((v) => v < md.dry_month_max_mm).length));
  const basah = rata(tahun.map((t) => t.filter((v) => v > md.wet_month_min_mm).length));
  return {
    bulan_kering_rerata: Math.round(kering * 100) / 100,
    bulan_basah_rerata: Math.round(basah * 100) / 100,
    // Basah nol berarti Q tak hingga. Dikembalikan sebagai null, bukan angka besar:
    // tipe H artinya "sangat kering", bukan "tidak punya bulan basah sama sekali".
    nilai_q: basah === 0 ? null : Math.round((kering / basah) * 1000) / 10,
  };
}

// ---------- CLI ----------
if (import.meta.url === `file://${process.argv[1]}`) {
  const berkas = process.argv[2];
  if (!berkas) {
    console.error('Pakai: node tools/agroklimat.mjs <deret-hujan.json>');
    console.error('Bentuk berkas: { "1992": [12 angka mm, Januari dulu], "1993": [...] }');
    process.exit(2);
  }
  const deret = JSON.parse(readFileSync(berkas, 'utf8'));
  const tahun = Object.keys(deret).sort();
  const muat = (f) => JSON.parse(readFileSync(new URL(`../vocab/${f}`, import.meta.url), 'utf8'));
  const oldeman = muat('agroklimat-oldeman.json');
  const sf = muat('agroklimat-schmidt-ferguson.json');

  console.log(`\nDeret: ${tahun.length} tahun (${tahun[0]}–${tahun[tahun.length - 1]})`);
  for (const skema of [oldeman, sf]) {
    const min = skema.period_requirement?.min_years;
    if (min && tahun.length < min) {
      console.log(`  ! ${skema.key} menuntut minimal ${min} tahun; deret ini ${tahun.length}.`);
    }
  }

  const md = oldeman.month_definitions;
  const cara = [runtunDariRerata(deret, md), runtunRerataPerTahun(deret, md)];
  const kode = [];
  console.log('\nOldeman  (bulan basah >200 mm, bulan kering <100 mm)');
  for (const c of cara) {
    const k = kelasCocok(oldeman, c);
    kode.push(k[0]?.code);
    console.log(`  ${c.cara.padEnd(12)} BB=${c.runtun_bulan_basah} BK=${c.runtun_bulan_kering}  →  ${k.map((x) => x.code).join(', ') || 'TIDAK ADA kelas yang cocok'}`);
  }
  if (kode[0] !== kode[1]) {
    console.log(`  ! Kedua cara memberi kelas BERBEDA (${kode[0]} vs ${kode[1]}). Pilih satu dengan sadar dan catat pilihannya di basis.note.`);
  }

  const q = nilaiQ(deret, sf.month_definitions);
  console.log('\nSchmidt-Ferguson  (bulan basah >100 mm, bulan kering <60 mm)');
  if (q.nilai_q === null) {
    console.log(`  BK rerata=${q.bulan_kering_rerata} BB rerata=0  →  Q tak terhingga; tidak diberi tipe.`);
  } else {
    const k = kelasCocok(sf, { nilai_q: q.nilai_q });
    console.log(`  BK rerata=${q.bulan_kering_rerata} BB rerata=${q.bulan_basah_rerata} Q=${q.nilai_q}  →  ${k.map((x) => x.code).join(', ') || 'TIDAK ADA tipe yang cocok'}`);
  }
  console.log('');
}
