// Menyusun kosakata wilayah (op:rgn) dari tarikan layanan bridging BPS.
//
//   node spec/tools/bangun-wilayah.mjs --tulis
//
// Dua keputusan yang menentukan bentuk berkas ini:
//
// 1. ID BUKAN kode wilayah. Godaannya besar — kode BPS hierarkis, rapi, dan sudah
//    unik — dan contoh yang sudah ada di repositori ini sempat memakainya (`op:rgn:
//    00003318` untuk Rembang, yang ternyata kode Pati). Ia ditolak karena kode wilayah
//    BUKAN identitas: pada Papua, kode 91 berarti Papua Barat menurut BPS dan Papua
//    menurut Kemendagri. Kode yang artinya bergantung skema tidak boleh jadi ID yang
//    janjinya tidak pernah didaur ulang. Kode hidup di `code` dan `mappings`.
//
// 2. Nomor yang sudah pernah diberikan TIDAK PERNAH digeser. Alat ini membaca
//    keluarannya sendiri lebih dulu, mempertahankan pasangan kode→id yang sudah ada,
//    dan hanya memberi nomor baru pada wilayah yang belum punya. Tanpa itu, satu
//    kabupaten pemekaran akan menggeser nomor seluruh wilayah sesudahnya dan membuat
//    tiap rujukan lama menunjuk tempat yang salah tanpa satu galat pun menyala.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RAW = join(AKAR, 'wilayah_data', 'raw');
const TUJUAN = join(AKAR, 'spec', 'vocab', 'region');
const tulis = process.argv.includes('--tulis');

// ---------- Blok nomor per tingkat ----------
// Dipisah supaya provinsi baru tidak perlu menunggu di belakang 7.000 kecamatan.
const BLOK = {
  country: [1, 9],
  province: [10, 99],
  regency: [100, 1999],
  city: [100, 1999],
  district: [2000, 19999],
};

// ---------- Nama ----------
// BPS menulis seluruhnya kapital. Yang dikembalikan huruf kapital di awal kata, kecuali
// singkatan yang memang kapital seluruhnya — "DI Yogyakarta", bukan "Di Yogyakarta".
const UTUH = new Set(['DI', 'DKI']);
// Angka Romawi benar-benar dipakai di nama tempat Sumatra dan Riau — "Rokan IV Koto",
// "Bathin VIII", "X Koto" — dan huruf besarnya bagian dari namanya, bukan gaya penulisan.
// Daftarnya EKSPLISIT, bukan pola: "IDI" (Aceh Timur), "LILI", dan "DI" semuanya cocok
// dengan pola angka Romawi tanpa satu pun di antaranya angka.
const ROMAWI = new Set(['II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XXIV']);

// Sumbernya memuat empat nama yang dieja huruf demi huruf — "S I A K", "D U M A I",
// "B A T A M", "B U L O" — dan enam yang berspasi ganda. Keduanya dirapikan, dan yang
// dirapikan MENYIMPAN ejaan aslinya di `synonyms`: konvensi kerja paralel repositori ini
// berbunyi "nama asli tidak pernah ditimpa", dan itu berlaku untuk nama wilayah juga.
export function rapikan(nama) {
  let n = nama.trim().replace(/\s+/g, ' ');
  if (/^[A-Z](?: [A-Z]){2,}$/.test(n)) n = n.replace(/ /g, '');
  return n;
}

const judul = (s) => rapikan(s).split(' ').map((w) => {
  if (UTUH.has(w) || ROMAWI.has(w)) return w;
  return w.charAt(0) + w.slice(1).toLowerCase();
}).join(' ');

const slug = (s) => s.toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const J = (f) => JSON.parse(readFileSync(join(RAW, f), 'utf8'));

// Hanya ditempel bila ejaan sumbernya memang berbeda dari yang dirapikan.
let dirapikan = 0;
const asli = (nama) => {
  if (rapikan(nama) === nama) return {};
  dirapikan++;
  return { synonyms: [nama] };
};

// ---------- Nomor yang sudah pernah diberikan ----------
const lama = new Map(); // "BPS:<kode>" -> nomor
const ndLama = join(TUJUAN, 'wilayah.ndjson');
if (existsSync(ndLama)) {
  for (const baris of readFileSync(ndLama, 'utf8').split('\n').filter((l) => l.trim())) {
    const e = JSON.parse(baris);
    if (e.code && e.code_scheme === 'BPS') lama.set(`BPS:${e.code}`, Number(e.id.split(':')[2]));
    if (e.level === 'country') lama.set('NEGARA', Number(e.id.split(':')[2]));
  }
}
const terpakai = new Set(lama.values());
const berikutnya = {};
const nomorUntuk = (kunci, tingkat) => {
  if (lama.has(kunci)) return lama.get(kunci);
  const [dari, sampai] = BLOK[tingkat];
  let n = berikutnya[tingkat] ?? dari;
  while (terpakai.has(n)) n++;
  if (n > sampai) throw new Error(`Blok ${tingkat} (${dari}-${sampai}) habis.`);
  berikutnya[tingkat] = n + 1;
  terpakai.add(n);
  return n;
};

const items = [];
const rgn = (n) => `op:rgn:${String(n).padStart(8, '0')}`;
const LIFE = { version: '0.1.0', status: 'draft', created_at: '2026-08-24T00:00:00Z', review_due: '2027-02-24' };

// ---------- Negara ----------
// Tidak punya kode BPS: layanan bridging mulai dari provinsi. Kodenya ISO 3166-1,
// dan karena itu ia satu-satunya rekaman di berkas ini yang code_scheme-nya bukan BPS.
const idNegara = rgn(nomorUntuk('NEGARA', 'country'));
items.push({
  id: idNegara,
  key: 'indonesia',
  label: { id: 'Indonesia', en: 'Indonesia' },
  level: 'country',
  code: 'ID',
  code_scheme: 'ISO3166-1',
  lifecycle: LIFE,
  no_mapping_reason: 'Layanan bridging BPS mulai dari tingkat provinsi dan tidak memberi kode untuk negaranya sendiri. Kode ISO 3166-1 sudah dipakai sebagai code, jadi memetakannya lagi ke dirinya sendiri tidak menambah apa pun.',
});

const pemetaan = (bps, dagri) => {
  const m = [{ scheme: 'BPS', id: bps, relation: 'exact' }];
  if (dagri) {
    m.push({
      scheme: 'KEMENDAGRI',
      id: dagri,
      relation: 'exact',
      // Catatan hanya ditempel ketika keduanya BENAR-BENAR berbeda. Menempelkannya di
      // mana-mana akan membuat yang berbeda tenggelam di antara yang sama.
      ...(bps.replace(/\D/g, '') === dagri.replace(/\D/g, '')
        ? {}
        : { note: `Kode BPS ${bps} dan kode Kemendagri ${dagri} menunjuk wilayah yang sama dengan nomor berlainan.` }),
    });
  }
  return m;
};

// ---------- Provinsi ----------
const prov = J('provinsi.json');
const kunciProv = new Map();
for (const p of prov) {
  const nama = judul(p.nama_bps);
  const key = slug(nama);
  kunciProv.set(p.kode_bps, { id: rgn(nomorUntuk(`BPS:${p.kode_bps}`, 'province')), key, nama });
  items.push({
    id: kunciProv.get(p.kode_bps).id,
    key,
    label: { id: nama },
    ...asli(p.nama_bps),
    level: 'province',
    code: p.kode_bps,
    code_scheme: 'BPS',
    parent: { id: idNegara, label: 'Indonesia' },
    lifecycle: LIFE,
    mappings: pemetaan(p.kode_bps, p.kode_dagri),
  });
}

// ---------- Kabupaten / kota ----------
// Jenisnya dibaca dari awalan nama Kemendagri, bukan ditebak: "KAB. SIMEULUE" versus
// "KOTA BANDA ACEH". BPS sendiri membuang awalannya, sehingga dari sisi BPS saja
// Kota Medan dan Kabupaten Medan tidak bisa dibedakan.
const kunciKab = new Map();
let takBerjenis = 0;
for (const p of prov) {
  const f = `kabupaten-${p.kode_bps}.json`;
  if (!existsSync(join(RAW, f))) continue;
  for (const k of J(f)) {
    const dagriNama = (k.nama_dagri ?? '').toUpperCase();
    let tingkat;
    if (dagriNama.startsWith('KAB')) tingkat = 'regency';
    else if (dagriNama.startsWith('KOTA')) tingkat = 'city';
    else { tingkat = 'regency'; takBerjenis++; }
    const nama = judul(k.nama_bps);
    const penuh = `${tingkat === 'city' ? 'Kota' : 'Kabupaten'} ${nama.replace(/^Kota /i, '')}`;
    // Kabupaten dan kota kerap senama — Madiun, Tangerang, Serang, Bima, Kupang,
    // Gorontalo, Sorong, Jayapura — dan BPS membuang awalan jenisnya dari nama,
    // sehingga kunci yang hanya menyusun provinsi+nama akan kembar. Jenisnya masuk ke
    // kunci, bukan nomor pembeda: "banten-kota-serang" masih terbaca orang, "banten-serang-2" tidak.
    const telanjang = nama.replace(/^Kota /i, '');
    const key = slug(`${kunciProv.get(p.kode_bps).key}-${tingkat === 'city' ? 'kota-' : ''}${telanjang}`);
    const id = rgn(nomorUntuk(`BPS:${k.kode_bps}`, tingkat));
    kunciKab.set(k.kode_bps, { id, key, nama: penuh });
    items.push({
      id,
      key,
      label: { id: penuh },
      ...asli(k.nama_bps),
      level: tingkat,
      code: k.kode_bps,
      code_scheme: 'BPS',
      parent: { id: kunciProv.get(p.kode_bps).id, label: kunciProv.get(p.kode_bps).nama },
      lifecycle: LIFE,
      mappings: pemetaan(k.kode_bps, k.kode_dagri),
    });
  }
}

// ---------- Kecamatan ----------
let nKec = 0;
const kembar = new Map();
for (const f of readdirSync(RAW).filter((x) => x.startsWith('kecamatan-'))) {
  const kodeKab = f.slice('kecamatan-'.length, -'.json'.length);
  const induk = kunciKab.get(kodeKab);
  if (!induk) continue;
  for (const c of J(f)) {
    const nama = judul(c.nama_bps);
    let key = slug(`${induk.key}-${nama}`);
    // Nama kecamatan berulang di seluruh Indonesia; kunci disusun berjenjang supaya
    // unik. Yang masih kembar SESUDAH itu diberi kode BPS-nya, bukan didiamkan —
    // L1 akan menolaknya, dan menolak lebih baik daripada dua wilayah bernama sama.
    if (kembar.has(key)) key = `${key}-${c.kode_bps}`;
    kembar.set(key, true);
    items.push({
      id: rgn(nomorUntuk(`BPS:${c.kode_bps}`, 'district')),
      key: key.slice(0, 80),
      label: { id: nama },
      ...asli(c.nama_bps),
      level: 'district',
      code: c.kode_bps,
      code_scheme: 'BPS',
      parent: { id: induk.id, label: induk.nama },
      lifecycle: LIFE,
      mappings: pemetaan(c.kode_bps, c.kode_dagri),
    });
    nKec++;
  }
}

items.sort((a, b) => a.id.localeCompare(b.id));

const cacah = (t) => items.filter((x) => x.level === t).length;
// Statistik yang berarti bukan "berapa yang kodenya berbeda" — di bawah tingkat provinsi
// hampir semuanya berbeda, karena keduanya memang dua sistem penomoran. Yang berbahaya
// jauh lebih sempit: kode yang SAH DI KEDUA SISTEM tetapi menunjuk wilayah yang BERLAINAN.
// Di situlah sebuah angka tanpa nama skemanya berhenti kabur dan mulai salah.
const dagriKe = new Map();
for (const x of items) {
  const d = x.mappings?.find((m) => m.scheme === 'KEMENDAGRI')?.id;
  if (d) dagriKe.set(d.replace(/\D/g, ''), x);
}
const taksa = items.filter((x) => {
  if (!x.code || x.code_scheme !== 'BPS') return false;
  const lain = dagriKe.get(x.code);
  return lain && lain.id !== x.id;
});
const beda = taksa.length;
const taksaProv = taksa.filter((x) => x.level === 'province').length;

const meta = {
  $schema: '../../schema/collection.schema.json',
  collection: {
    entity_type: 'region',
    label: { id: 'Wilayah administratif Indonesia sampai tingkat kecamatan' },
    scope: {
      id: `${items.length.toLocaleString('id-ID')} wilayah: 1 negara, ${cacah('province')} provinsi, ${cacah('regency')} kabupaten, ${cacah('city')} kota, dan ${cacah('district').toLocaleString('id-ID')} kecamatan, menurut layanan bridging BPS per 24 Agustus 2026.

Tiap rekaman membawa DUA kode: BPS pada \`code\`, Kemendagri pada \`mappings\`. Di bawah tingkat provinsi keduanya hampir tidak pernah sama — dua sistem penomoran, bukan satu — tetapi yang berbahaya jauh lebih sempit dan bisa dihitung: **${beda} kode sah di kedua sistem sekaligus dan menunjuk wilayah yang BERLAINAN**. Kode 1401 adalah Kuantan Singingi menurut BPS dan Kabupaten Kampar menurut Kemendagri; ${taksaProv === 1 ? 'satu di antaranya provinsi — 91 adalah Papua Barat menurut BPS dan Papua menurut Kemendagri' : `${taksaProv} di antaranya provinsi`}. Angka yang tidak menyebut skemanya di situ bukan kabur melainkan salah, dan itulah sebabnya ID di berkas ini bukan kode.

Berhenti di kecamatan, tidak sampai desa: ~83.000 desa akan melipatgandakan berkas ini sepuluh kali untuk tingkat yang belum dipakai satu pun rekaman di repositori ini, sementara kecamatan sudah dipakai — balai penyuluhan dibina per kecamatan, dan Katam berskala kecamatan.

Sumbernya memuat ${cacah('province')} provinsi, bukan 38. Empat provinsi Papua hasil pemekaran 2022 — Papua Selatan, Papua Tengah, Papua Pegunungan, dan Papua Barat Daya — TIDAK ADA di layanan bridging BPS pada tanggal tarikan, dan tidak dikarang di sini. Kekosongan itu konsisten dengan seluruh data lain di repositori ini: SIMLUHTAN juga 34 provinsi dan 514 kabupaten/kota. Menambahkan empat provinsi dari ingatan akan membuat wilayah yang tidak bisa dijoin dengan satu pun berkas lain.`,
    },
    lifecycle: { version: '0.1.0', status: 'draft', created_at: '2026-08-24T00:00:00Z', review_due: '2027-02-24' },
    provenance: {
      license: 'CC-BY-SA-4.0',
      sources: [{
        title: 'Layanan bridging kode wilayah — rest-bridging/getwilayah',
        publisher: 'Badan Pusat Statistik',
        year: 2026,
        url: 'https://sig.bps.go.id/rest-bridging/getwilayah',
        retrieved: '2026-08-24',
        locator: 'Ditarik bertingkat: provinsi, lalu kabupaten per provinsi, lalu kecamatan per kabupaten. robots.txt situsnya berbunyi "Disallow:" kosong.',
      }],
    },
    storage: 'ndjson',
    count: items.length,
    id_blocks: [{ from: 1, to: 19999 }],
  },
};

console.log(`negara 1 · provinsi ${cacah('province')} · kabupaten ${cacah('regency')} · kota ${cacah('city')} · kecamatan ${cacah('district')}`);
console.log(`total ${items.length} · ${beda} kode taksa — sah di kedua sistem, menunjuk wilayah berlainan`);
if (takBerjenis) console.log(`! ${takBerjenis} kabupaten/kota tanpa awalan jenis di nama Kemendagri — dijadikan regency`);
const panjang = Math.max(...items.map((x) => x.key.length));
console.log(`kunci terpanjang ${panjang} aksara · ${dirapikan} nama dirapikan ejaannya (aslinya disimpan di synonyms)`);

if (!tulis) { console.log('\n(uji coba — pakai --tulis untuk menyimpan)'); process.exit(0); }
if (!existsSync(TUJUAN)) mkdirSync(TUJUAN, { recursive: true });
writeFileSync(join(TUJUAN, 'wilayah.meta.json'), JSON.stringify(meta, null, 2) + '\n');
writeFileSync(join(TUJUAN, 'wilayah.ndjson'), items.map((x) => JSON.stringify(x)).join('\n') + '\n');
console.log(`\nDitulis ke ${TUJUAN}`);
