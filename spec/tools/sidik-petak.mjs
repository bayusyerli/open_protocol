// Sidik geometri petak — G5 pada docs/15-kapabilitas-lintas-pemangku.md.
//
//   node spec/tools/sidik-petak.mjs <berkas...>          # hitung dan tampilkan
//   node spec/tools/sidik-petak.mjs --tulis <berkas...>  # tulis ke plot.geoids[]
//
// APA YANG DIJANJIKAN, DAN APA YANG TIDAK
// Yang dijanjikan G5: dua pihak bisa memastikan mereka membicarakan PETAK YANG SAMA tanpa
// seorang pun menerbitkan batasnya. Sidik ini alatnya — sha256 atas geometri yang sudah
// dinormalkan, jadi batas yang sama menghasilkan nilai yang sama di mesin siapa pun,
// sementara nilainya sendiri tidak memuat satu koordinat pun.
//
// Yang TIDAK dijanjikan: kecocokan dengan GeoID AgStack. docs/00 menyebut AgStack sebagai
// preseden identitas lahan, dan skemanya tetap ada di `geoids[].scheme`. Tetapi
// menghitung nilai lalu melabelinya `AGSTACK` tanpa bisa memastikan Asset Registry
// menghasilkan nilai yang sama berarti menerbitkan identitas yang tidak akan cocok dengan
// apa pun — hiasan yang menyerupai interoperabilitas. Alat ini karena itu menulis di
// bawah skemanya sendiri, `OP_GEOM_SHA256`, yang seluruh aturannya ada di berkas ini dan
// bisa dihitung ulang siapa pun. Nilai AGSTACK hanya boleh DISALIN dari registrinya.
//
// SIDIK TIDAK SELALU MERAHASIAKAN, DAN ITU DIUKUR BUKAN DIDUGA
// Sidik menyembunyikan geometri hanya kalau geometrinya cukup sulit ditebak. Untuk TITIK
// TUNGGAL pada presisi 5 desimal (~1,1 m) di dalam satu kabupaten seluas 1.014 km²,
// kandidatnya 8,2×10⁸ — sekitar 2³⁰. Satu GPU menebaknya habis dalam 0,08 detik, dan
// python satu utas dalam 6,6 menit. Menerbitkan sidik titik tunggal sama dengan
// menerbitkan titiknya.
//
// Poligon berjalan kaki berbeda tiga ratus kali lipat: delapan simpul bebas memberi ~2²³⁷.
// Karena itu gerbangnya bukan "apakah ada geometri" melainkan MUTU geometrinya:
//
//   surveyed_polygon, walked_polygon  aman — banyak simpul bebas
//   drawn_polygon                     PERINGATAN — kotak yang digambar cuma dua sudut
//                                     bebas (~2⁵⁹), dan yang menggambarnya kerap
//                                     mengunci ke petak peta
//   single_point, unknown             DITOLAK — 2³⁰, atau entropi yang tidak diketahui
//
// NORMALISASI: KENAPA TIAP LANGKAHNYA ADA
// Sidik yang berubah karena hal yang tidak mengubah petaknya sama tidak bergunanya dengan
// sidik yang tidak berubah saat petaknya berubah. Empat hal disamakan lebih dulu, dan
// masing-masing pernah jadi sebab dua salinan batas yang sama menghasilkan nilai berbeda:
//
//   1. Presisi dibulatkan ke 6 desimal (~0,11 m). Lebih halus daripada alat ukur mana pun
//      yang dipakai di lahan, dan cukup kasar untuk menahan derau pembulatan float.
//   2. Titik penutup cincin dibuang. GeoJSON menuntutnya, tetapi ia pengulangan.
//   3. Cincin diputar supaya mulai dari simpul terkecil secara leksikografis. Dua orang
//      yang berjalan mengelilingi petak yang sama dari sudut berbeda menghasilkan urutan
//      berbeda untuk batas yang sama.
//   4. Arah putaran disamakan berlawanan jarum jam. Berjalan ke kiri dan ke kanan
//      mengelilingi petak yang sama bukan dua petak.
//
// Sesudah itu kanonikalisasi RFC 8785 yang sama dengan content_hash — dipilih di
// spec/kanonik.mjs karena ia standar dengan vektor uji, bukan aturan buatan sendiri.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { kanonik } from '../kanonik.mjs';

const AKAR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DESIMAL = 6;

/** Mutu geometri yang sidiknya aman diterbitkan, beserta sebabnya. */
export const GERBANG = {
  surveyed_polygon: { boleh: true },
  walked_polygon: { boleh: true },
  drawn_polygon: {
    boleh: true,
    peringatan: 'Poligon gambar kerap hanya kotak: dua sudut bebas, ~2^59 kandidat. '
      + 'Kalau ia digambar dengan mengunci ke petak peta, ruangnya jauh lebih kecil lagi.',
  },
  single_point: {
    boleh: false,
    sebab: 'Titik tunggal presisi 5 desimal di dalam satu kabupaten ~2^30 kandidat — habis '
      + 'ditebak GPU dalam 0,08 detik. Sidiknya bukan penjagaan; ia penunjuk lokasi yang bisa dibalik.',
  },
  unknown: {
    boleh: false,
    sebab: 'Mutu geometri tidak dinyatakan, jadi entropinya tidak diketahui. Yang tidak bisa '
      + 'diukur tidak bisa dinyatakan aman.',
  },
};

const bulat = (n) => Number(Number(n).toFixed(DESIMAL));

/* Posisi dipangkas ke dua sumbu. Ketinggian tidak ikut menentukan petak mana yang
 * dimaksud, dan sumber yang satu menyertakannya sementara yang lain tidak akan
 * menghasilkan dua sidik untuk satu batas. */
const posisi = (p) => [bulat(p[0]), bulat(p[1])];

/** Luas bertanda; tandanya menyatakan arah putaran (positif = berlawanan jarum jam). */
function luasBertanda(cincin) {
  let a = 0;
  for (let i = 0; i < cincin.length; i++) {
    const [x1, y1] = cincin[i];
    const [x2, y2] = cincin[(i + 1) % cincin.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}

function normalCincin(cincin) {
  let t = cincin.map(posisi);
  // Titik penutup dibuang sebelum apa pun — memutar cincin yang masih tertutup akan
  // memindahkan pengulangannya ke tengah.
  if (t.length > 1) {
    const [a, b] = [t[0], t[t.length - 1]];
    if (a[0] === b[0] && a[1] === b[1]) t = t.slice(0, -1);
  }
  if (t.length < 3) throw new Error(`cincin cuma ${t.length} simpul setelah pembulatan — bukan poligon`);
  if (luasBertanda(t) < 0) t.reverse();
  // Putar ke simpul terkecil. Perbandingan leksikografis, bukan sudut: sudut menuntut
  // titik acuan, dan titik acuan menuntut keputusan lain lagi.
  let m = 0;
  for (let i = 1; i < t.length; i++) {
    if (t[i][0] < t[m][0] || (t[i][0] === t[m][0] && t[i][1] < t[m][1])) m = i;
  }
  return t.slice(m).concat(t.slice(0, m));
}

/** Bentuk kanonik geometri — inilah yang benar-benar di-hash. */
export function normalGeometri(g) {
  if (!g?.type) throw new Error('geometri tanpa type');
  if (g.type === 'Point') return { type: 'Point', coordinates: posisi(g.coordinates) };
  if (g.type === 'Polygon') return { type: 'Polygon', coordinates: g.coordinates.map(normalCincin) };
  if (g.type === 'MultiPolygon') {
    // Poligon-poligonnya diurutkan menurut bentuk kanoniknya sendiri: urutan penulisan
    // dua bidang yang terpisah tidak menyatakan apa pun tentang lahannya.
    const p = g.coordinates.map((poly) => poly.map(normalCincin));
    p.sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1));
    return { type: 'MultiPolygon', coordinates: p };
  }
  throw new Error(`bentuk geometri "${g.type}" tidak dikenal`);
}

/** Sidik geometri, siap ditaruh di plot.geoids[].value. */
export function sidikGeometri(g) {
  return 'sha256:' + createHash('sha256').update(kanonik(normalGeometri(g)), 'utf8').digest('hex');
}

// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const tulis = argv.includes('--tulis');
  const berkas = argv.filter((a) => !a.startsWith('--'));
  if (!berkas.length) { console.error('Sebutkan berkas petaknya.'); process.exit(2); }

  let ditulis = 0;
  let ditolak = 0;
  for (const f of berkas) {
    const p = resolve(AKAR, f);
    const d = JSON.parse(readFileSync(p, 'utf8'));
    if (!d.geometry) { console.log(`  lewat  ${f} — tanpa geometri, tidak ada yang bisa disidik`); continue; }

    const mutu = d.geometry_quality ?? 'unknown';
    const gerbang = GERBANG[mutu] ?? GERBANG.unknown;
    if (!gerbang.boleh) {
      console.log(`  TOLAK  ${f} — geometry_quality "${mutu}"`);
      console.log(`         ${gerbang.sebab}`);
      ditolak++;
      continue;
    }

    let sidik;
    try { sidik = sidikGeometri(d.geometry); }
    catch (e) { console.log(`  GAGAL  ${f} — ${e.message}`); ditolak++; continue; }

    const lama = (d.geoids ?? []).filter((g) => g.scheme === 'OP_GEOM_SHA256').at(-1);
    const cocok = lama?.value === sidik;
    console.log(`  ${cocok ? 'cocok ' : lama ? 'BEDA  ' : 'baru  '} ${f}`);
    console.log(`         ${sidik}`);
    if (gerbang.peringatan) console.log(`         PERINGATAN: ${gerbang.peringatan}`);
    if (lama && !cocok) console.log(`         tertulis: ${lama.value}`);

    if (!tulis || cocok) continue;
    d.geoids ??= [];
    // Yang lama TIDAK dibuang. Sidik berubah karena batasnya direvisi, dan riwayat revisi
    // itu justru yang membuat identitas petaknya bisa ditelusuri lintas musim — yang tetap
    // `id` rekaman, yang berubah sidiknya.
    d.geoids.push({ scheme: 'OP_GEOM_SHA256', value: sidik, computed_at: new Date().toISOString() });
    writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
    ditulis++;
    if (d.lifecycle?.content_hash) {
      console.log(`         isinya berubah — segarkan: node spec/tools/hitung-hash.mjs --tulis ${f}`);
    }
  }
  if (tulis) console.log(`\n${ditulis} berkas disidik, ${ditolak} ditolak.\n`);
}
