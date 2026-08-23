// Pelipatan ortografis dengan DAFTAR ATURAN YANG DINYATAKAN, dan jejak aturan mana yang
// menyala pada tiap pelipatan.
//
// ---------------------------------------------------------------------------
// Kenapa berkas ini terpisah
// ---------------------------------------------------------------------------
// `susun-padanan-bahan-aktif.mjs` punya `skel()` sendiri, dan itu sengaja dibiarkan: ia
// dipakai untuk mencocokkan tulisan registri ke tulisan registri yang lain — dua sisi yang
// sama-sama ditulis Kementan. Berkas ini dipakai untuk sesuatu yang lebih longgar:
// mencocokkan tulisan Indonesia ke nama pada basis pengetahuan umum (Wikidata), yang
// ejaannya tidak pernah melewati tangan Kementan.
//
// Jaringnya karena itu dilonggarkan dua aturan (E11 `ou`→`u`, E12 `z`→`s`) dan satu
// perlakuan urutan kata, DAN penyaringnya diketatkan di tempat lain: entitasnya wajib
// berperan agrokimia menurut Wikidata, dan perannya wajib tidak bertentangan dengan
// `JenisPestisidaNama` yang ditulis registri. Melonggarkan jaring tanpa mengetatkan
// penyaring akan menghasilkan padanan yang terdengar yakin tanpa dasar — kegagalan yang
// paling mahal di tabel padanan, karena ia menjalar ke pemeriksaan larangan, ke MRL, dan
// ke nasihat rotasi.
//
// TIDAK ADA jarak edit dan tidak ada ambang kemiripan di sini. Dua nama hanya dianggap
// satu bila hasil lipatnya SAMA PERSIS. "dimeflutrhin" tetap tidak bertemu "dimefluthrin",
// dan memang harus begitu: yang membedakannya huruf yang tertukar, bukan aturan ejaan.

// Tiap aturan bisa dibantah satu per satu, dan tiap baris hasil merekam mana yang dipakai.
export const ATURAN = [
  ['E1', /ph/g, 'f', 'ph → f (phosphine → fosfin)'],
  ['E2', /ch/g, 'k', 'ch → k (chlor → klor)'],
  ['E3', /th/g, 't', 'th → t (methidathion → metidation)'],
  ['E4', /qu/g, 'kw', 'qu → kw (quinalphos → kuinalfos)'],
  ['E5', /x/g, 'ks', 'x → ks (fluxapyroxad → fluksapiroksad)'],
  ['E11', /ou/g, 'u', 'ou → u (coumatetralyl → kumatetralil)'],
  ['E6', /c(?=[eiy])/g, 's', 'c sebelum e/i/y → s (acetochlor → asetoklor)'],
  ['E7', /c/g, 'k', 'c lain → k (captan → kaptan)'],
  ['E8', /y/g, 'i', 'y → i (pyridalyl → piridalil)'],
  ['E9', /w/g, 'v', 'w → v'],
  ['E10', /u(?=[aeio])/g, 'v', 'u sebelum vokal → v'],
  ['E12', /z/g, 's', 'z → s (methoxyfenozide → metoksifenosida)'],
  ['E13', /(.)\1+/g, '$1', 'huruf kembar → tunggal'],
  ['E14', /e$/g, '', '-e akhir dilepas (bentazone → bentazon)'],
  ['E15', /da$/g, 'd', '-ida dan -ide bertemu di -id'],
];

const bersih = (s) => String(s).toLowerCase().trim().normalize('NFKD').replace(/[̀-ͯ]/g, '');

// Satu kata dilipat; balikannya [bentuk, aturan yang benar-benar mengubah teks].
export function lipat(s) {
  let x = bersih(s).replace(/[\s\-_.']/g, '');
  const nyala = [];
  for (const [id, pola, ganti] of ATURAN) {
    const y = x.replace(pola, ganti);
    if (y !== x) nyala.push(id);
    x = y;
  }
  return [x.replace(/[^a-z0-9,]/g, ''), nyala];
}

// Pemenggalan kata, sama seperti di susun-padanan-bahan-aktif.mjs: tanda hubung
// memisahkan, kecuali yang mengikat locant ke huruf golongan ("2,4-d" satu token).
export function tokenisasi(s) {
  const kasar = bersih(s).split(/[\s\-]+/).map((t) => t.replace(/^[,.:;()]+|[,.:;()]+$/g, '')).filter(Boolean);
  const out = [];
  for (const t of kasar) {
    if (out.length && /^[\d,.]+$/.test(out[out.length - 1]) && /^[a-z]$/.test(t)) out[out.length - 1] += `-${t}`;
    else out.push(t);
  }
  return out;
}

// Kunci pencocokan: tiap token dilipat, lalu DIURUTKAN. Urutan kata berbeda antara kedua
// bahasa — "metil kresoksim" dan "kresoxim-methyl" bahan yang sama — sedangkan CACAH
// token tetap harus sama, sehingga "natrium bentazon" tidak akan pernah bisa jatuh ke
// "bentazone". Itu yang menahan garam supaya tidak diam-diam dibaca sebagai induknya.
export function kunciUrut(s) {
  const ls = []; const nyala = new Set();
  for (const t of tokenisasi(s)) {
    const [a, n] = lipat(t);
    if (a) { ls.push(a); for (const x of n) nyala.add(x); }
  }
  return [ls.sort().join('|'), [...nyala].sort()];
}

// ---------------------------------------------------------------------------
// Penanda bentuk turunan
// ---------------------------------------------------------------------------
// Baris garam, ester, dan stereoisomer WAJIB menyebut induknya (skema menegakkannya), dan
// pemulihan induk diturunkan dari klausa "setara dengan" milik registri — bukan dari sini.
// Alat ini karena itu MENOLAK bentuk turunan alih-alih menamainya: menuliskan
// "mcpa sodium" sebagai varian ejaan dari "mcpa-sodium" akan terlihat selesai padahal
// sambungannya ke MCPA — tempat larangan dan MRL sesungguhnya dinyatakan — tetap putus.
export const GUGUS_GARAM = new Set([
  'sodium', 'natrium', 'potassium', 'kalium', 'calcium', 'kalsium', 'magnesium', 'ammonium',
  'amonium', 'ammonia', 'amine', 'amina', 'amin', 'olamine', 'olamin', 'zinc', 'seng',
  'copper', 'tembaga', 'iron', 'besi', 'silver', 'perak', 'aluminium', 'aluminum', 'alumunium',
  'lithium', 'manganese', 'mangan', 'mercury', 'merkuri', 'tin', 'barium', 'chloride', 'klorida',
  'dichloride', 'diklorida', 'bromide', 'bromida', 'dibromide', 'dibromida', 'iodide', 'iodida',
  'sulfate', 'sulphate', 'sulfat', 'nitrate', 'nitrat', 'phosphate', 'fosfat', 'phosphite',
  'fosfit', 'acetate', 'asetat', 'oxide', 'oksida', 'hydroxide', 'hidroksida', 'hydrochloride',
  'salt', 'garam', 'octanoate', 'oktanoat', 'heptanoate', 'butanoate', 'benzoate', 'ion',
  'trimesium', 'megaluminium', 'isopropylammonium', 'dimethylammonium', 'diolamine', 'trolamine',
]);
// Catatan: `sulfide`/`phosphide` sengaja TIDAK masuk daftar. Garam sesungguhnya —
// "zinc phosphide" — sudah tertangkap lewat kationnya, sedangkan "diallyl sulfide" bukan
// garam sama sekali, dan memasukkannya akan menolak senyawa kovalen tanpa alasan.

// Ekor alkil BUKAN penanda dengan sendirinya: "metsulfuron-methyl" dan "pirimiphos-methyl"
// adalah nama umum bahannya sendiri, dan tabel ini memang sudah menuliskan yang pertama
// sebagai `sama-dengan`. Ia baru jadi penanda ester bila INDUKNYA sendiri ada sebagai
// entitas agrokimia — itulah gunanya daftar `fold_induk_agrokimia` pada berkas panen.
export const EKOR_ALKIL = new Set([
  'methyl', 'metil', 'ethyl', 'etil', 'propyl', 'propil', 'butyl', 'butil', 'isopropyl',
  'isopropil', 'isobutyl', 'isobutil', 'octyl', 'oktil', 'isooctyl', 'isooktil', 'ester',
  'meptyl', 'meptil', 'tefuryl', 'benzyl', 'benzil', 'heptyl', 'hexyl', 'heksil', 'dodecyl',
  'butoxyethyl', 'butoksietil', 'ethylhexyl', 'etilheksil', 'mexyl', 'pentyl',
]);

const AWALAN_STEREO = /^(\(\s*[rsezRSEZ+\-,]+\s*\)|alpha|alfa|beta|gamma|gama|delta|cis|trans|dl|rac|levo|dextro|esbiol|[dlsrez])[\s-]/i;

// Induk alkil yang perlu diperiksa keberadaannya; null bila tulisan ini tidak berekor alkil.
export function indukAlkil(nama) {
  const ts = tokenisasi(nama);
  if (!ts.length) return null;
  const bagian = ts[ts.length - 1].split('-');
  const ekor = bagian[bagian.length - 1];
  if (!EKOR_ALKIL.has(ekor)) return null;
  const sisa = ts.length > 1 ? ts.slice(0, -1).join(' ') : bagian.slice(0, -1).join('-');
  return sisa || null;
}

// Balikan: 'garam' | 'stereoisomer' | 'ester' | null.
// `indukAda` menjawab "apakah induk alkil ini sendiri entitas agrokimia di Wikidata".
export function bentukTurunan(nama, indukAda = () => false) {
  for (const t of tokenisasi(nama)) {
    for (const b of t.split('-')) if (GUGUS_GARAM.has(b)) return 'garam';
  }
  if (AWALAN_STEREO.test(String(nama).trim())) return 'stereoisomer';
  const ind = indukAlkil(nama);
  if (ind && indukAda(kunciUrut(ind)[0])) return 'ester';
  return null;
}
