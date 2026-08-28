// Membetulkan komoditas pada BARIS PENDAFTARAN tertentu — bukan pada entitasnya.
//
//   node spec/tools/betulkan-komoditas-baris.mjs            # periksa saja
//   node spec/tools/betulkan-komoditas-baris.mjs --tulis    # tulis perubahannya
//
// ALAT INI BERBEDA DARI SEMUA YANG LAIN DI SINI, DAN BEDANYA HARUS DINYATAKAN.
// satukan-komoditas-ejaan.mjs berkata "dua nama ini satu hal", dan itu pernyataan tentang
// KOSAKATA yang berlaku untuk setiap baris. Alat ini berkata sesuatu yang jauh lebih
// berat: "pada baris INI, registri keliru". Ia menyatakan isi dokumen label yang tidak
// kita punya, dan karena itu ia satu-satunya alat di repositori ini yang menuntut BUKTI
// yang bisa diperiksa ulang mesin, bukan cuma prosa.
//
// TIGA HAL YANG MENAHANNYA
// 1. `bukti` wajib, dan alat ini memeriksanya ulang tiap kali dijalankan. Dua bentuk yang
//    diterima: sebuah medan pada baris itu sendiri harus bernilai tertentu, atau produk
//    yang sama harus punya baris lain pada komoditas tertentu. Kalau buktinya hilang pada
//    tarikan registri berikutnya, alat ini BERHENTI dan tidak menulis apa pun.
// 2. `commodity_label` TIDAK disentuh. Ia yang menyimpan apa yang registri benar-benar
//    tulis, dan tanpa itu pembetulan ini akan menghapus jejaknya sendiri.
// 3. Barisnya disebut lengkap — produk, OPT, dan komoditas asal — sehingga baris lain pada
//    produk yang sama tidak ikut terbawa.
//
// CONTOH KENAPA BUKTINYA MENENTUKAN
// INDOFUME 99,8 GA mendaftarkan Sitophilus pada "Jagung", dan dosisnya 16 g/m3 — GRAM PER
// METER KUBIK. Takaran per satuan VOLUME hanya berarti untuk ruang tertutup; petak berdiri
// tidak punya meter kubik. Itu bukan simpulan tentang dokumen yang tidak kita lihat, itu
// pembacaan atas angka yang ada di rekaman ini sendiri.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VOCAB = join(akar, 'spec', 'vocab');
const NDJSON = join(VOCAB, 'product', 'pestisida.ndjson');
const tulis = process.argv.includes('--tulis');

const BETULKAN = [
  {
    produk: 'op:prd:00001661', namaProduk: 'INDOFUME 99,8 GA',
    pest: 'op:pst:00001124', dari: 'op:cmd:00001002', ke: 'op:cmd:00001080',
    bukti: { medan: 'rate_unit_text', nilai: 'g/m3' },
    dasar: 'Dosisnya 16 g/m3 — gram per meter KUBIK — dan takaran per satuan volume hanya berarti untuk ruang tertutup; petak jagung berdiri tidak punya meter kubik. Bahan aktifnya sulfuril fluorida, fumigan murni. Dua baris lain pada label yang sama tertulis "Beras" dan "Terigu", keduanya hasil pertanian di penyimpanan. Yang dimaksud "Jagung" di sini jagung yang disimpan.',
  },
  {
    produk: 'op:prd:00002515', namaProduk: 'Delstar Plus',
    pest: 'op:pst:00001250', dari: 'op:cmd:00001002', ke: 'op:cmd:00001080',
    bukti: { saudaraKomoditas: ['op:cmd:00001355'] },
    dasar: 'Alphitobius diaperinus kumbang gudang yang memakan biji pecah dan sisa pakan, dan tidak menyerang jagung yang masih berdiri di petak. Satu-satunya baris lain pada label yang sama mendaftarkan Sitophilus — kumbang gudang juga — pada "Gandum", butir gandum yang di Indonesia hanya ada dalam keadaan tersimpan. Kedua barisnya pendaftaran gudang.',
  },
];

const bacaJson = (p) => JSON.parse(readFileSync(join(VOCAB, p), 'utf8'));
const kunciLarik = (o) => (Array.isArray(o) ? null : Object.keys(o).find((k) => Array.isArray(o[k])));
const larik = (o) => (Array.isArray(o) ? o : o[kunciLarik(o)]);
const komoditas = new Map([...larik(bacaJson('commodity.json')), ...larik(bacaJson('commodity-registri.json'))].map((e) => [e.id, e]));

const baris = readFileSync(NDJSON, 'utf8').split('\n');
const olehProduk = new Map();
const isi = baris.map((b, i) => {
  if (!b.trim()) return null;
  const p = JSON.parse(b);
  olehProduk.set(p.id, { p, i });
  return p;
});

const bantah = [];
const ubah = [];
const dilewati = [];

for (const t of BETULKAN) {
  const simpul = olehProduk.get(t.produk);
  if (!simpul) { bantah.push(`${t.produk} tidak ada.`); continue; }
  const { p } = simpul;
  if (p.label?.id !== t.namaProduk) { bantah.push(`${t.produk} berlabel "${p.label?.id}", diharapkan "${t.namaProduk}". Rekaman berubah; periksa dulu.`); continue; }
  const tujuan = komoditas.get(t.ke);
  if (!tujuan) { bantah.push(`${t.ke} tidak ada.`); continue; }
  if (tujuan.lifecycle?.status === 'superseded') { bantah.push(`${t.ke} sudah digantikan; jangan jadikan tujuan.`); continue; }
  if (!t.dasar || t.dasar.length < 120) { bantah.push(`${t.produk}: dasar terlalu pendek. Alat ini menyatakan registri keliru; dasarnya harus cukup untuk diperiksa orang lain.`); continue; }

  const cocok = (p.label_uses ?? []).filter((u) => u.pest?.id === t.pest && u.commodity?.id === t.dari);
  const sudah = (p.label_uses ?? []).filter((u) => u.pest?.id === t.pest && u.commodity?.id === t.ke);
  if (!cocok.length && sudah.length) { dilewati.push(`${t.namaProduk} / ${t.pest}`); continue; }
  if (cocok.length !== 1) { bantah.push(`${t.namaProduk}: ada ${cocok.length} baris untuk ${t.pest} pada ${t.dari}, diharapkan tepat satu. Jangan membetulkan baris yang tidak bisa ditunjuk sendirian.`); continue; }
  const u = cocok[0];

  // BUKTI diperiksa ulang di sini, tiap kali. Ini yang membedakan alat ini dari daftar
  // pembetulan biasa: kalau registri berubah dan buktinya hilang, pembetulannya gugur.
  if (t.bukti?.medan !== undefined) {
    if (u[t.bukti.medan] !== t.bukti.nilai) {
      bantah.push(`${t.namaProduk}: bukti hilang — ${t.bukti.medan} pada baris itu bernilai ${JSON.stringify(u[t.bukti.medan])}, diharapkan ${JSON.stringify(t.bukti.nilai)}.`);
      continue;
    }
  } else if (t.bukti?.saudaraKomoditas) {
    const ada = (p.label_uses ?? []).some((x) => x !== u && t.bukti.saudaraKomoditas.includes(x.commodity?.id));
    if (!ada) {
      bantah.push(`${t.namaProduk}: bukti hilang — tidak ada baris lain pada produk ini yang berkomoditas ${t.bukti.saudaraKomoditas.join(' atau ')}.`);
      continue;
    }
  } else {
    bantah.push(`${t.namaProduk}: tanpa bukti yang bisa diperiksa mesin, pembetulan ini tidak diterima.`);
    continue;
  }

  u.commodity = { ...u.commodity, id: t.ke };
  // `commodity_label` sengaja dibiarkan apa adanya: ia jejak satu-satunya bahwa registri
  // menulis "Jagung" di sini, dan membetulkannya berarti menghapus buktinya sendiri.
  ubah.push(`${t.namaProduk} — ${u.commodity_label ?? '?'} → ${tujuan.label?.id} (${u.pest_scientific_name ?? t.pest})`);
}

if (bantah.length) {
  for (const x of bantah) console.error(`  TOLAK  ${x}`);
  console.error(`\n${bantah.length} penolakan — tidak ada yang ditulis.`);
  process.exit(1);
}

for (const x of ubah) console.log(`  betul   ${x}`);
console.log(`\n  product/pestisida.ndjson — ${ubah.length} baris dibetulkan, ${dilewati.length} sudah betul`);
console.log('  commodity_label pada baris itu TIDAK diubah; ia jejak apa yang registri tulis.');

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyimpan.');
  process.exit(0);
}

const keluar = baris.map((b, i) => (isi[i] ? JSON.stringify(isi[i]) : b));
writeFileSync(NDJSON, keluar.join('\n'));
console.log('\nDitulis.');
