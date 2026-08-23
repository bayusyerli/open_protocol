// Menurunkan status larangan PER PENDAFTARAN dari status larangan per bahan aktif.
//
//   node larangan_data/susun-status.mjs
//
// KENAPA PER PENDAFTARAN, PADAHAL LARANGANNYA MELEKAT PADA BAHAN
// Yang dipegang orang di kios bukan bahan aktif, melainkan sebotol merek dengan nomor
// pendaftaran. Pertanyaannya juga bukan "apakah parakuat dilarang" melainkan "apakah
// yang saya pegang ini boleh saya pakai, untuk tanaman saya". Menjawabnya menuntut
// larangan tingkat bahan diturunkan ke tingkat pendaftaran — dan penurunan itulah yang
// memunculkan hal-hal yang tidak kelihatan di tingkat bahan.
//
// TIGA HAL YANG DIPISAH, DAN KENAPA
//
// 1. TANDA REGISTRI BUKAN STATUS PRODUK.
//    Registri menandai 166 pendaftaran dengan kata "Kimia Terbatas", tetapi tandanya
//    ada di medan `perihal` — yang berbunyi "Permohonan Izin Tetap Baru Kimia Terbatas".
//    Itu menerangkan PERISTIWA PENDAFTARANNYA, bukan keadaan produknya sekarang.
//    Produk yang izinnya diperpanjang lewat permohonan berjenis lain kehilangan tandanya
//    tanpa berubah isinya. Tanda itu tetap dicatat di kolom terpisah, apa adanya, dan
//    tidak pernah dipakai sebagai putusan.
//
// 2. LARANGAN BERLINGKUP BUKAN LARANGAN MENYELURUH.
//    Permentan 43/2019 melarang sebagian bahan hanya pada padi, hanya pada karantina,
//    atau hanya untuk rumah tangga. Meratakan semuanya jadi "dilarang" akan menyesatkan
//    ke arah yang berlawanan dengan lampu hijau palsu, dan sama tidak jujurnya.
//    Putusannya karena itu membawa lingkupnya, dan `menyeluruh` dipisah sendiri.
//
// 3. YANG TIDAK BISA DIPERIKSA HARUS BERBUNYI BEGITU.
//    Pendaftaran yang bahan aktifnya tidak terpetakan ke entitas zat mana pun tidak
//    boleh jatuh ke keranjang "tidak ada larangan" — itu persis lampu hijau palsu yang
//    ditakutkan. Ia dapat putusannya sendiri: `tidak bisa diperiksa`, beserta nama bahan
//    yang menyebabkannya.
//
// DUA JALAN MENUJU ENTITAS ZAT, DAN YANG KEDUA MENEMUKAN LIMA BELAS
//    komposisi  blok `composition` pada kosakata produk — jalan utama, 7.449 dari 7.724.
//    padanan    tabel padanan-bahan-aktif.json, dipakai untuk 275 sisanya yang tidak
//               punya blok komposisi sama sekali.
// Jalan kedua inilah yang membuat berkas ini menunggu no. 5 selesai, dan hasilnya bukan
// kelengkapan yang rapi melainkan temuan: 15 pendaftaran membawa bahan berstatus
// terbatas — 14 di antaranya parakuat diklorida, satu dikuat dibromida — tetapi hari ini
// tidak menunjukkan peringatan apa pun karena komposisinya tidak pernah tertaut.
//
// SATU ANGKA YANG MELEGAKAN, DAN SEBAIKNYA DIBACA UTUH
// Nol pendaftaran hidup membawa bahan yang dilarang MENYELURUH. Seluruh 563 yang
// berstatus `prohibited` larangannya berlingkup — padi, atau pestisida rumah tangga.
// Artinya registri konsisten dengan daftar larangan pada tingkat yang paling kasar;
// yang bergesekan justru lingkup, dan lingkup tidak kelihatan kalau diratakan.
//
// MASA BERLAKU IKUT, KARENA PERTANYAANNYA SATU
// "Boleh saya pakai ini?" punya dua paruh yang selalu ditanyakan bersamaan: apakah
// bahannya berstatus, dan apakah izinnya masih hidup. Registri MEMBUANG rekaman yang
// kedaluwarsa — begitu izin lewat tanggalnya, ia lenyap dari sumbernya — jadi paruh kedua
// hanya bisa dijawab selama produknya masih ada di potret. 584 dari 7.724 habis dalam dua
// belas bulan sejak potret ini, dan tidak satu pun yang sudah lewat.
//
// Acuannya TANGGAL POTRET, bukan tanggal menjalankan skrip: kalau tidak, berkas yang sama
// akan berubah isi tiap hari tanpa satu pun datanya berubah.
//
// Keluaran:
//   status-pendaftaran.ndjson / .csv   satu baris per pendaftaran pestisida
//   LAPIS.md                           hitungannya, dan yang tidak bisa dijawabnya

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const AKAR = join(DIR, '..');
const bacaJson = (p) => JSON.parse(readFileSync(join(AKAR, p), 'utf8'));
const bacaNdjson = (p) => readFileSync(join(AKAR, p), 'utf8').split('\n').filter((x) => x.trim()).map((x) => JSON.parse(x));

const rapi = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const kunciNama = (s) => rapi(s).toLowerCase();
const kutip = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;

// --- bahan aktif berstatus ---------------------------------------------------------
const zat = bacaJson('spec/vocab/substance-pestisida.json').items;
const zatById = new Map(zat.map((x) => [x.id, x]));

// Entitas yang digantikan tetap dirujuk produk lama; larangannya menempel pada yang
// hidup. Tanpa mengikuti rantai ini, produk yang menyebut ejaan lama lolos pemeriksaan.
function hidup (id) {
  const dilihat = new Set();
  let kini = id;
  while (kini && !dilihat.has(kini)) {
    dilihat.add(kini);
    const e = zatById.get(kini);
    const lanjut = e?.lifecycle?.superseded_by?.id;
    if (!lanjut) return kini;
    kini = lanjut;
  }
  return kini;
}

// Tanggal potret dibaca dari manifes arsip, bukan diketik: potret terbaru yang jadi acuan
// masa berlaku, dan ia bergeser tiap kali potret baru diambil.
const POTRET = (() => {
  try {
    const baris = readFileSync(join(AKAR, 'pukpes_data/potret/manifes.ndjson'), 'utf8')
      .split('\n').filter((x) => x.trim()).map((x) => JSON.parse(x))
      .filter((x) => x.sumber === 'pestisida');
    return baris.map((x) => x.tanggal).sort().pop() ?? null;
  } catch { return null; }
})();

const STATUS_DIPAKAI = new Set(['prohibited', 'restricted']);
const larangan = new Map();
for (const x of zat) {
  const c = (x.hazard?.regulatory_status ?? []).filter((r) => STATUS_DIPAKAI.has(r.status));
  if (c.length) larangan.set(x.id, c);
}

// --- padanan: tulisan bahan aktif -> entitas zat ------------------------------------
const KOSONG = new Set(['belum-terpetakan', 'nama-sistematis-belum-terpetakan']);
const padanan = new Map();
for (const p of bacaJson('spec/vocab/padanan-bahan-aktif.json').padanan_items) {
  padanan.set(kunciNama(p.kunci), p);
  for (const t of p.tulisan_teramati ?? []) padanan.set(kunciNama(t), p);
}

// --- registri mentah: bahan aktif per nomor pendaftaran ------------------------------
const mentah = bacaJson('pukpes_data/raw/pestisida_terdaftar.json');
const barisMentah = Array.isArray(mentah) ? mentah : (mentah.data ?? []);
const perNomor = new Map(barisMentah.map((r) => [rapi(r.nomorPendaftaran), r]));

const bahanDari = (r) => {
  let ba = r?.bahanAktif;
  if (typeof ba === 'string') { try { ba = JSON.parse(ba); } catch { ba = [{ namaBahan: ba }]; } }
  return (Array.isArray(ba) ? ba : [ba]).filter(Boolean).map((x) => rapi(x?.namaBahan)).filter(Boolean);
};

// --- turunkan per pendaftaran --------------------------------------------------------
const produk = bacaNdjson('spec/vocab/product/pestisida.ndjson');
const baris = [];
const hitung = { dilarang: 0, berlingkup: 0, terbatas: 0, bersih: 0, takTerperiksa: 0 };
const hitungWaktu = {};
let lewatPadanan = 0; let tandaRegistri = 0; let tandaTanpaPutusan = 0; let putusanTanpaTanda = 0;

for (const p of produk) {
  const nomor = rapi(p.registration?.number);
  const mentahnya = perNomor.get(nomor);
  const perihal = rapi(mentahnya?.perihal);
  const bertanda = /kimia\s+terbatas/i.test(perihal);
  if (bertanda) tandaRegistri++;

  // jalan 1: komposisi kosakata produk
  const dariKomposisi = (p.composition ?? []).map((c) => c.substance?.id).filter(Boolean).map(hidup);
  // jalan 2: padanan, hanya bila tidak ada komposisi sama sekali
  const namaBahan = bahanDari(mentahnya);
  let dariPadanan = []; const takTerpetakan = [];
  if (!dariKomposisi.length) {
    for (const nm of namaBahan) {
      const e = padanan.get(kunciNama(nm));
      if (!e || KOSONG.has(e.hubungan)) { takTerpetakan.push(nm); continue; }
      const id = e.substance?.id;
      if (id) dariPadanan.push(hidup(id)); else takTerpetakan.push(nm);
    }
    dariPadanan = [...new Set(dariPadanan)];
  }

  const zatDipakai = dariKomposisi.length ? dariKomposisi : dariPadanan;
  const jalan = dariKomposisi.length ? 'komposisi' : (dariPadanan.length ? 'padanan' : '—');

  const dasar = [];
  for (const id of [...new Set(zatDipakai)]) {
    for (const r of larangan.get(id) ?? []) {
      dasar.push({
        zat: zatById.get(id)?.label?.id ?? id,
        zat_id: id,
        status: r.status,
        lingkup: r.scope ?? [],
        menyeluruh: (r.scope ?? []).some((s) => /semua bidang penggunaan/i.test(s)),
        instrumen: r.instrument ?? '',
        kutipan: r.citation ?? '',
        sumber: r.source_url ?? '',
        lewat: jalan,
      });
    }
  }
  if (dasar.length && jalan === 'padanan') lewatPadanan++;

  // Larangan berlingkup TIDAK diratakan jadi "dilarang". Ternyata itu bukan kehati-hatian
  // teoretis: dari 563 pendaftaran yang membawa bahan berstatus `prohibited`, NOL yang
  // larangannya menyeluruh — seluruhnya larangan atas padi atau atas pestisida rumah
  // tangga. Menyebut 563 pendaftaran "dilarang" akan salah 563 kali.
  const mutlak = dasar.filter((d) => d.status === 'prohibited' && d.menyeluruh);
  const berlingkup = dasar.filter((d) => d.status === 'prohibited' && !d.menyeluruh);
  let putusan;
  if (mutlak.length) { putusan = 'dilarang'; hitung.dilarang++; }
  else if (berlingkup.length) { putusan = 'dilarang pada lingkup tertentu'; hitung.berlingkup++; }
  else if (dasar.some((d) => d.status === 'restricted')) { putusan = 'terbatas'; hitung.terbatas++; }
  else if (!zatDipakai.length) { putusan = 'tidak bisa diperiksa'; hitung.takTerperiksa++; }
  else { putusan = 'tidak ada larangan tercatat'; hitung.bersih++; }

  const berstatus = dasar.length > 0;
  if (bertanda && !berstatus) tandaTanpaPutusan++;
  if (!bertanda && berstatus) putusanTanpaTanda++;

  // Paruh kedua pertanyaannya: izinnya masih hidup atau tidak, diadu dengan tanggal potret.
  const sampai = rapi(p.registration?.valid_until).slice(0, 10);
  let kedaluwarsa = 'tak terbaca';
  if (/^\d{4}-\d{2}-\d{2}$/.test(sampai) && POTRET) {
    const setahun = new Date(POTRET); setahun.setFullYear(setahun.getFullYear() + 1);
    const batas = setahun.toISOString().slice(0, 10);
    kedaluwarsa = sampai < POTRET ? 'sudah lewat' : (sampai <= batas ? 'habis dalam 12 bulan' : 'lebih dari 12 bulan');
  }
  hitungWaktu[kedaluwarsa] = (hitungWaktu[kedaluwarsa] ?? 0) + 1;

  baris.push({
    nomor_pendaftaran: nomor,
    kedaluwarsa,
    merek: rapi(p.label?.id),
    status_izin: p.registration?.status ?? '',
    berlaku_sampai: p.registration?.valid_until ?? '',
    putusan,
    menyeluruh: dasar.some((d) => d.menyeluruh),
    lingkup: [...new Set(dasar.flatMap((d) => d.lingkup))].join('; '),
    zat_terlarang: [...new Set(dasar.map((d) => d.zat))].join('; '),
    lewat: dasar.length ? jalan : (zatDipakai.length ? jalan : '—'),
    bahan_tak_terpetakan: takTerpetakan.join('; '),
    tanda_registri: bertanda ? perihal : '',
    dasar,
  });
}

baris.sort((a, b) => a.nomor_pendaftaran.localeCompare(b.nomor_pendaftaran));

// --- tulis ---------------------------------------------------------------------------
mkdirSync(DIR, { recursive: true });
writeFileSync(join(DIR, 'status-pendaftaran.ndjson'), baris.map((r) => JSON.stringify(r)).join('\n') + '\n');
const KOLOM = ['nomor_pendaftaran', 'merek', 'status_izin', 'berlaku_sampai', 'kedaluwarsa', 'putusan', 'menyeluruh', 'lingkup', 'zat_terlarang', 'lewat', 'bahan_tak_terpetakan', 'tanda_registri'];
writeFileSync(join(DIR, 'status-pendaftaran.csv'),
  KOLOM.join(',') + '\n' + baris.map((r) => KOLOM.map((k) => kutip(r[k])).join(',')).join('\n') + '\n');

const n = (x) => Number(x).toLocaleString('id-ID');
const pct = (x) => (x * 100).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const tersembunyi = baris.filter((r) => r.lewat === 'padanan' && r.dasar.length);
const perLingkup = {};
for (const r of baris) for (const l of new Set(r.dasar.flatMap((d) => d.lingkup))) perLingkup[l] = (perLingkup[l] ?? 0) + 1;

writeFileSync(join(DIR, 'LAPIS.md'), `# Status larangan per pendaftaran pestisida

Disusun ulang oleh \`susun-status.mjs\` dari \`spec/vocab/substance-pestisida.json\`
(blok \`hazard\`), \`spec/vocab/product/pestisida.ndjson\`, dan \`padanan-bahan-aktif.json\`.
Seluruh dasarnya sudah ada di repositori; berkas ini tidak menambah satu pun sumber baru.

## Putusan atas ${n(baris.length)} pendaftaran

| Putusan | Pendaftaran |
|---|---|
| Dilarang menyeluruh | **${n(hitung.dilarang)}** |
| Dilarang pada lingkup tertentu | **${n(hitung.berlingkup)}** |
| Terbatas | **${n(hitung.terbatas)}** |
| Tidak ada larangan tercatat | ${n(hitung.bersih)} |
| **Tidak bisa diperiksa** | **${n(hitung.takTerperiksa)}** |

Yang terakhir bukan sisa yang belum sempat dikerjakan. Pendaftaran yang bahan aktifnya
tidak terpetakan ke entitas zat mana pun **tidak boleh** jatuh ke keranjang "tidak ada
larangan" — itu lampu hijau palsu, dan ia yang paling merugikan di antara semua
kekeliruan yang mungkin di berkas ini.

## Temuan: ${n(tersembunyi.length)} pendaftaran yang hari ini tidak menunjukkan peringatan apa pun

${n(tersembunyi.length)} pendaftaran membawa bahan berstatus dilarang atau terbatas, tetapi tidak punya
blok \`composition\` sehingga pemeriksaan yang berjalan lewat komposisi melewatinya
seluruhnya. Ia hanya kelihatan setelah tabel padanan bahan aktif berdiri — dan itulah
alasan pekerjaan ini menunggu no. 5.

${tersembunyi.slice(0, 15).map((r) => `- \`${r.nomor_pendaftaran}\` **${r.merek}** — ${r.zat_terlarang}`).join('\n')}

## Tanda registri bukan status produk

Registri menandai **${n(tandaRegistri)}** pendaftaran dengan kata "Kimia Terbatas", tetapi tandanya ada
di medan \`perihal\` yang berbunyi *"Permohonan Izin Tetap Baru Kimia Terbatas"* — itu
menerangkan **peristiwa pendaftarannya**, bukan keadaan produknya sekarang.

- ${n(tandaTanpaPutusan)} bertanda, tetapi bahan aktifnya tidak berstatus apa pun di Permentan 43/2019
- **${n(putusanTanpaTanda)} tidak bertanda, padahal bahan aktifnya berstatus** dilarang atau terbatas

Selisih itu bukan kesalahan registri. Tanda itu memang tidak dimaksudkan sebagai status
produk, dan membacanya begitu yang keliru. Kolom \`tanda_registri\` tetap disimpan apa
adanya supaya bisa dibandingkan, dan tidak pernah dipakai sebagai putusan.

## Masa berlaku, paruh kedua dari pertanyaan yang sama

"Boleh saya pakai ini?" selalu ditanyakan bersama "apakah izinnya masih hidup". Diadu
dengan potret **${POTRET ?? '—'}**:

${Object.entries(hitungWaktu).sort((a, b) => b[1] - a[1]).map(([k, v]) => `- ${k}: **${n(v)}**`).join('\n')}

Tidak satu pun sudah lewat, dan itu bukan kebetulan: registri **membuang** rekaman yang
kedaluwarsa, jadi yang sudah habis tidak akan pernah muncul di potret mana pun sesudahnya.
Potret berkala di \`pukpes_data/potret/\` satu-satunya bukti bahwa produk yang hilang itu
pernah terdaftar — dan ${n(hitungWaktu['habis dalam 12 bulan'] ?? 0)} pendaftaran di bawah ini akan menempuh jalan itu dalam
dua belas bulan ke depan.

## Larangan berlingkup, bukan larangan menyeluruh

Permentan 43/2019 melarang sebagian bahan hanya pada lingkup tertentu. Meratakannya jadi
"dilarang" menyesatkan ke arah yang berlawanan, dan sama tidak jujurnya dengan lampu
hijau palsu.

${Object.entries(perLingkup).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `- ${k}: ${n(v)} pendaftaran`).join('\n')}

## Yang tidak dijawab berkas ini

- **Hanya paruh hukum Indonesia.** Sumbernya satu: Permentan No. 43 Tahun 2019. Bahan
  yang dilarang di pasar tujuan tetapi sah di sini — dan sebaliknya — tidak ada di sini
  sama sekali, dan mencampurnya ke kolom yang sama akan menyatukan dua kewenangan yang
  berbeda. Itu paruh pasar, dan ia menunggu keputusan sumbernya sendiri.
- **Bukan nasihat hukum, dan bukan izin.** Yang tercatat status bahan aktifnya menurut
  satu peraturan, beserta kutipan pasalnya. Apakah sebuah penggunaan sah menuntut
  pembacaan izin edarnya sendiri.
- **Kelas bahaya WHO tidak ikut.** Baru satu entitas zat yang punya \`who_class\`, dan
  satu dari ${n(zat.length)} bukan cakupan.
- **Belum tersambung** ke permukaan aplikasi: ini berkas turunan, dan yang membacanya
  belum ada.
`);

console.log(`${n(baris.length)} pendaftaran — dilarang menyeluruh ${n(hitung.dilarang)} · dilarang berlingkup ${n(hitung.berlingkup)} · terbatas ${n(hitung.terbatas)} · bersih ${n(hitung.bersih)} · tidak bisa diperiksa ${n(hitung.takTerperiksa)} (${pct(hitung.takTerperiksa / baris.length)}%)`);
console.log(`  masa berlaku (potret ${POTRET}) : ${Object.entries(hitungWaktu).map(([k, v]) => `${k} ${n(v)}`).join(' · ')}`);
console.log(`  lewat padanan, tak terlihat lewat komposisi : ${n(tersembunyi.length)}`);
console.log(`  bertanda "Kimia Terbatas" di registri       : ${n(tandaRegistri)} — ${n(tandaTanpaPutusan)} tanpa status bahan, ${n(putusanTanpaTanda)} berstatus tanpa tanda`);
