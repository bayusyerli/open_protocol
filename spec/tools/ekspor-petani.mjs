// Mengeluarkan seluruh catatan satu siklus dalam bentuk yang bisa dibaca tanpa platform ini.
//
//   node spec/tools/ekspor-petani.mjs --siklus op:cyc:... [--dir spec/examples] --tulis <dir>
//
// KENAPA ALAT INI ADA
// Keputusan ke-5 di docs/00 berbunyi "data usaha tani milik petani, bukan milik platform",
// dan docs/02 menjualnya sebagai penghapus kekhawatiran kunci-vendor. Sampai sekarang
// klaim itu tidak punya satu pun mekanisme di belakangnya: tidak ada cara mengeluarkan
// datanya. Kepemilikan yang tidak bisa dijalankan adalah kepemilikan di atas kertas.
//
// YANG MEMBUAT EKSPOR INI BUKAN SEKADAR DUMP
// Menyalin catatan apa adanya menghasilkan berkas penuh ID buram: op:sub:00000001,
// op:stg:00000026, op:dev:00000002. Penerimanya tetap terkunci — hanya berpindah dari
// terkunci-di-platform jadi terkunci-di-kamus-yang-tidak-ia-punya. Portabilitas palsu.
//
// Karena itu bundel ini MEMBAWA KOSAKATANYA: setiap ID yang dirujuk ditelusuri dan
// definisinya ikut. Fase yang hidup di dalam skala ikut diangkat, karena ia tidak berdiri
// sebagai entitas sendiri. Protokolnya ikut utuh pada versi yang dipakai.
//
// PDP
// Geometri petak TIDAK PERNAH ikut, sama seperti berkas bukti. L7 menolaknya diberi label
// publik, dan batas lahan bisa dipakai mengidentifikasi orang. Yang ikut hanya label dan
// luasnya. Ini bukan penyensoran isi: yang diekspor tetap seluruh catatan usaha taninya.

import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (n, b) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : b; };
const dirCatatan = resolve(AKAR, arg('dir', 'spec/examples'));
const idSiklus = arg('siklus');
const keluar = arg('tulis');
if (!keluar) { console.error('--tulis <dir> wajib diisi.'); process.exit(2); }

const bacaJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const dokumen = readdirSync(dirCatatan).filter((f) => f.endsWith('.json'))
  .map((f) => { try { return bacaJson(join(dirCatatan, f)); } catch { return null; } }).filter(Boolean);

const siklus = dokumen.find((x) => x.id === idSiklus) ?? dokumen.find((x) => String(x.id).startsWith('op:cyc:'));
if (!siklus) { console.error('Siklus tidak ketemu.'); process.exit(1); }

const langkah = dokumen.filter((x) => x.cycle?.id === siklus.id)
  .sort((a, b) => String(a.occurred_at ?? a.id).localeCompare(String(b.occurred_at ?? b.id)));
const petakAsli = dokumen.find((x) => x.id === siklus.plot?.id);

// Geometri dicopot di sini, bukan disaring saat menulis — supaya tidak ada jalan ia lolos
// lewat penulisan yang berbeda kemudian.
//
// SIDIKNYA IKUT, DAN GEOMETRINYA TETAP TIDAK. Sebelum G5 `geoids` ikut dicopot, dan itu
// benar selama medannya kosong. Sekarang ia berisi sidik sha256 atas batas yang sudah
// dinormalkan — nilai yang tidak memuat satu koordinat pun, tetapi yang membuat penerima
// bundel ini bisa memastikan petaknya sama dengan yang ia ukur sendiri, tanpa seorang pun
// mengirimkan poligonnya. Tanpa sidik, satu-satunya penanda yang berpindah tangan adalah
// UUID lokal yang tidak berarti apa-apa di luar sistem ini.
//
// Amannya menurut konstruksi, bukan menurut harapan: `L36` menolak sidik atas geometri
// berentropi rendah, jadi sidik yang sempat ada pasti atas poligon. `geometry_quality`
// ikut karena tanpanya penerima tidak bisa menilai apakah poligonnya layak EUDR — dan
// mutu batas tidak menyatakan apa pun tentang letaknya.
const petak = petakAsli ? (({ geometry, ...sisa }) => sisa)(petakAsli) : null;
const geometriDicopot = Boolean(petakAsli?.geometry);
const sidikIkut = (petakAsli?.geoids ?? []).filter((g) => g.scheme === 'OP_GEOM_SHA256');

// --- kumpulkan rujukan -----------------------------------------------------
const rujukan = (n, out = new Set()) => {
  if (Array.isArray(n)) { for (const x of n) rujukan(x, out); return out; }
  if (!n || typeof n !== 'object') return out;
  const k = Object.keys(n);
  if (typeof n.id === 'string' && /^op:[a-z]{3,5}:/.test(n.id) && k.every((x) => x === 'id' || x === 'label')) out.add(n.id);
  for (const x of k) rujukan(n[x], out);
  return out;
};

const perlu = rujukan([siklus, ...langkah, petak]);

// --- muat kosakata ---------------------------------------------------------
const kamus = new Map();
const faseInduk = new Map();   // op:stg -> skala yang memuatnya

const vocabDir = resolve(AKAR, 'spec/vocab');
for (const f of readdirSync(vocabDir).filter((x) => x.endsWith('.json'))) {
  const d = bacaJson(join(vocabDir, f));
  for (const it of d.items ?? []) if (it.id) kamus.set(it.id, it);
  if (d.id) kamus.set(d.id, d);
  // Fase hidup DI DALAM skala, bukan sebagai dokumen sendiri. Tanpa pengangkatan ini,
  // sebuah langkah yang dijadwalkan pada fase akan mengekspor ID yang tidak ada kamusnya.
  for (const st of d.stages ?? []) if (st.id) { kamus.set(st.id, st); faseInduk.set(st.id, { id: d.id, label: d.label }); }
}

// Registri besar berbentuk NDJSON; hanya baris yang ID-nya dibutuhkan yang diurai.
const belum = () => [...perlu].filter((r) => !kamus.has(r));
for (const sub of ['product', 'variety']) {
  const d = join(vocabDir, sub);
  let ada = false; try { ada = statSync(d).isDirectory(); } catch { /* boleh tidak ada */ }
  if (!ada || !belum().length) continue;
  for (const f of readdirSync(d).filter((x) => x.endsWith('.ndjson'))) {
    const cari = new Set(belum());
    if (!cari.size) break;
    for (const baris of readFileSync(join(d, f), 'utf8').split('\n')) {
      if (!baris) continue;
      let cocok = false;
      for (const id of cari) if (baris.includes(`"${id}"`)) { cocok = true; break; }
      if (!cocok) continue;
      try { const o = JSON.parse(baris); if (o.id && cari.has(o.id)) kamus.set(o.id, o); } catch { /* baris rusak dilewati */ }
    }
  }
}

const kosakata = {};
for (const r of [...perlu].sort()) if (kamus.has(r)) kosakata[r] = kamus.get(r);

// Rujukan yang tersisa harus dipilah, bukan diratakan jadi "tidak tertelusuri". Tiga
// golongan yang sangat berbeda sempat tercampur di sini, dan menyebut ID siklusnya
// sendiri sebagai tidak tertelusuri jelas keliru — ia justru isi bundel ini.
const JENIS_REKAMAN = new Set(['act', 'plt', 'cyc', 'stp', 'obs', 'bat']);
const adaDiBundel = new Set([siklus.id, petak?.id, ...langkah.map((s) => s.id)].filter(Boolean));

const sisa = belum().filter((r) => !adaDiBundel.has(r));
const orang = sisa.filter((r) => r.startsWith('op:act:')).sort();
const rekamanLain = sisa.filter((r) => JENIS_REKAMAN.has(r.split(':')[1]) && !r.startsWith('op:act:')).sort();
const gantung = sisa.filter((r) => !JENIS_REKAMAN.has(r.split(':')[1])).sort();

// --- protokol --------------------------------------------------------------
let protokol = null;
if (siklus.protocol_ref?.id) {
  protokol = kamus.get(siklus.protocol_ref.id) ?? null;
  if (protokol) for (const r of rujukan(protokol)) if (!kosakata[r] && kamus.has(r)) kosakata[r] = kamus.get(r);
}

// --- tulis -----------------------------------------------------------------
const d = resolve(AKAR, keluar);
mkdirSync(d, { recursive: true });
writeFileSync(join(d, 'catatan.json'), JSON.stringify({ cycle: siklus, plot: petak, steps: langkah }, null, 2) + '\n');
writeFileSync(join(d, 'kosakata.json'), JSON.stringify(kosakata, null, 2) + '\n');
if (protokol) writeFileSync(join(d, 'protokol.json'), JSON.stringify(protokol, null, 2) + '\n');

const jenis = {};
for (const r of Object.keys(kosakata)) { const t = r.split(':')[1]; jenis[t] = (jenis[t] ?? 0) + 1; }

const M = [];
M.push('# Catatan usaha tani — bundel ekspor');
M.push('');
M.push('Berkas ini berisi **seluruh catatan satu siklus budidaya**, beserta kosakata yang');
M.push('dibutuhkan untuk membacanya. Ia dirancang supaya bisa dibaca **tanpa platform**');
M.push('yang membuatnya, dan tanpa meminta izin siapa pun.');
M.push('');
M.push('| Berkas | Isi |');
M.push('|---|---|');
M.push(`| \`catatan.json\` | Siklus, petak, dan ${langkah.length} langkah |`);
M.push(`| \`kosakata.json\` | ${Object.keys(kosakata).length} entitas yang dirujuk catatan di atas |`);
if (protokol) M.push(`| \`protokol.json\` | Protokol \`${protokol.id}\` v${protokol.lifecycle?.version}, utuh |`);
M.push('');
M.push('## Kenapa kosakatanya ikut');
M.push('');
M.push('Menyalin catatan apa adanya menghasilkan berkas penuh nomor seperti');
M.push('`op:sub:00000001`. Penerimanya akan tetap terkunci — hanya berpindah dari terkunci');
M.push('di platform menjadi terkunci di kamus yang tidak ia punya. Karena itu setiap nomor');
M.push('yang dirujuk catatan ini ditelusuri, dan definisinya ikut di `kosakata.json`:');
M.push('');
for (const [t, n] of Object.entries(jenis).sort()) M.push(`- \`op:${t}\` — ${n}`);
M.push('');
M.push('Fase pertumbuhan hidup di dalam dokumen skalanya, bukan sebagai entitas berdiri');
M.push('sendiri. Ia tetap diangkat ke sini supaya langkah yang dijadwalkan pada fase bisa');
M.push('dibaca tanpa mengambil seluruh skalanya.');
M.push('');
M.push('## Yang sengaja TIDAK ikut');
M.push('');
if (geometriDicopot) {
  M.push('- **Geometri petak.** Batas lahan bernilai komersial dan bisa dipakai mengidentifikasi');
  M.push('  orang; aturan `L7` menolaknya diberi label publik. Yang ikut hanya label dan luas.');
  M.push('  Kalau kamu memang ingin membawa batas lahanmu sendiri, ambil dari catatan aslinya —');
  M.push('  ia milikmu, dan penahanan di sini hanya berlaku untuk bundel yang berpindah tangan.');
  if (sidikIkut.length) {
    M.push('');
    M.push('  **Yang ikut sebagai gantinya: sidiknya.** `plot.geoids` memuat sha256 atas batas yang');
    M.push('  sudah dinormalkan — nilai yang tidak memuat satu koordinat pun. Penerima bundel ini');
    M.push('  yang sudah punya batas petakmu dari pengukurannya sendiri bisa menghitung sidik yang');
    M.push('  sama dan memastikan ia petak yang sama, tanpa seorang pun mengirimkan poligonnya.');
    M.push('  Caranya: `node spec/tools/sidik-petak.mjs <berkas>`.');
  }
} else {
  M.push('- Petak ini tidak punya geometri tercatat, jadi tidak ada yang perlu ditahan.');
}
M.push('- **Registri lengkap Kementan.** Yang ikut hanya entitas yang benar-benar dirujuk');
M.push('  catatan ini. Registri utuhnya publik dan bisa ditarik ulang sendiri.');
M.push('');
if (orang.length) {
  M.push('## Rujukan ke orang, sengaja ditahan');
  M.push('');
  M.push('Catatan ini menyebut siapa yang mengerjakan dan siapa yang mencatat. Nomornya ikut,');
  M.push('tetapi datanya TIDAK — itu data pribadi menurut UU 27/2022, dan mengekspornya');
  M.push('bersama bundel yang berpindah tangan adalah keputusan tersendiri dengan persetujuan');
  M.push('tersendiri, bukan bawaan ekspor:');
  M.push('');
  for (const g of orang) M.push(`- \`${g}\``);
  M.push('');
}
if (rekamanLain.length) {
  M.push('## Rekaman lain yang tidak ikut');
  M.push('');
  M.push('Nomor berikut menunjuk rekaman usaha tani di luar siklus ini — batch sediaan, atau');
  M.push('langkah milik siklus lain. Ia bisa diekspor tersendiri dengan perintah yang sama:');
  M.push('');
  for (const g of rekamanLain) M.push(`- \`${g}\``);
  M.push('');
}
if (gantung.length) {
  M.push('## Kosakata yang tidak bisa ditelusuri');
  M.push('');
  M.push('Nomor berikut mestinya punya definisi di kosakata, tetapi tidak ketemu — jadi ia');
  M.push('ikut sebagai nomor telanjang. Ini kekurangan bundel, disebut alih-alih dibiarkan:');
  M.push('');
  for (const g of gantung) M.push(`- \`${g}\``);
  M.push('');
}
M.push('## Yang bundel ini tidak bisa lakukan');
M.push('');
M.push('- **Bukan berkas bukti audit.** Untuk itu ada dokumen tersendiri yang menyebut');
M.push('  batas-batasnya. Bundel ini catatan mentah, bukan klaim.');
M.push('- **Tidak menjamin kebenaran isinya.** Ia menjamin keutuhan dan keterbacaan, bukan');
M.push('  bahwa dosis yang tercatat benar atau pengamatannya tepat.');
M.push('- **Tidak membawa gambar atau berkas media** yang dirujuk `media`, hanya rujukannya.');
M.push('');
M.push(`Klasifikasi data siklus ini: \`${siklus.data_classification}\`. Bundel ini milik`);
M.push('pemegang lahan. Menyerahkannya ke pihak lain adalah keputusannya, bukan keputusan');
M.push('platform mana pun.');

writeFileSync(join(d, 'BACA-DULU.md'), M.join('\n') + '\n');

console.log(`\nBundel ekspor -> ${keluar}`);
console.log(`  catatan.json    ${langkah.length} langkah, 1 siklus, 1 petak${geometriDicopot ? ` (geometri dicopot${sidikIkut.length ? ', sidiknya ikut' : ''})` : ''}`);
console.log(`  kosakata.json   ${Object.keys(kosakata).length} entitas: ${Object.entries(jenis).sort().map(([t, n]) => `${t} ${n}`).join(', ')}`);
if (protokol) console.log(`  protokol.json   ${protokol.id} v${protokol.lifecycle?.version}`);
console.log(`  BACA-DULU.md    manifes beserta batasnya`);
if (orang.length) console.log(`  · ${orang.length} rujukan ke orang ditahan (data pribadi)`);
if (rekamanLain.length) console.log(`  · ${rekamanLain.length} rekaman lain tidak ikut: ${rekamanLain.join(', ')}`);
if (gantung.length) console.log(`  ! ${gantung.length} kosakata tidak tertelusuri: ${gantung.join(', ')}`);
console.log('');
