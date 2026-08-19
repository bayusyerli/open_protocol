// Menggabungkan substance id kembar — satu bahan aktif yang terlanjur terdaftar
// sebagai dua entitas — pada vocab/substance-pestisida.json dan
// vocab/product/pestisida.ndjson.
//
// Registri Kementan kadang menuliskan keterangan kesetaraan ke dalam FIELD NAMA
// BAHAN, bukan ke kolomnya sendiri: "2,4-D dimetil amina" dan "2,4-D dimetil amina
// (setara dengan 2,4-D 720 g/l)" masuk sebagai dua nama yang berbeda. Pembangun
// kosakata memperlakukan setiap nama unik sebagai satu entitas, jadi bahan yang
// sama dapat dua id. Pada lima pendaftaran kedua id itu muncul BERSAMAAN dengan
// kadar yang sama, sehingga kadarnya terjumlah dua kali dan L27 menyalakan
// "komposisi mustahil" untuk formulasi yang sebenarnya biasa saja:
//
//   Mega 9 865 SL     865 + 865 = 1730 g/l      AMCOMIN 865 SL     865 + 865 = 1730 g/l
//   DIMINA 720 SL     720 + 720 = 1440 g/l      GALATOP 620 SL     620 + 620 = 1240 g/l
//   RONDA GOLD 525 SL 525 + 525 = 1050 g/l
//
// Satu kasus lagi ikut dibereskan di sini karena penyebabnya sama — satu bahan,
// dua id — hanya sumbernya salah ejaan, bukan teks kesetaraan: "dimeflutrhin" dan
// "dimeflutrin" pada lini NOMOS.
//
// Ini keputusan KOSAKATA, bukan keputusan ulangan. Itu sebabnya ia terpisah dari
// dedup-komposisi-pestisida.mjs, yang hanya boleh membuang baris kembar dalam satu
// substance id dan sengaja menyerahkan perkara ini ke tinjauan tersendiri.
// Urutan jalannya: dedup dulu, gabung id sesudahnya.
//
//   node spec/tools/dedup-komposisi-pestisida.mjs
//   node spec/tools/gabung-id-zat-kembar.mjs
//
// ID TIDAK DIDAUR ULANG. Entitas yang kalah tidak dihapus: statusnya jadi
// "superseded" dan lifecycle.superseded_by-nya menunjuk yang menang, sehingga
// ejaan registri yang asli tetap bisa ditelusuri dan rujukan lama tetap sampai.
// Aturan L29 menegakkannya — begitu berkas ini dibangun ulang dan pemetaan namanya
// jatuh lagi ke id yang sudah digantikan, pemeriksa menolaknya, bukan mendiamkannya.
//
// Sumber: pukpes_data/raw/pestisida_terdaftar.json (field bahanAktif), tarikan
// 19 Agustus 2026. Jalankan dari akar repositori.
//
// Idempoten: putusan dipakai dari tabel, bukan dari kembar yang masih terlihat di
// berkas — kalau tidak, catatannya ikut hilang begitu jalan pertama selesai. Setiap
// penggabungan diuji balik ke bahanAktif mentah: dua nama itu harus benar-benar ada
// pada pendaftaran yang sama, dan kadar yang bertahan harus ada di sumber. Rekaman
// yang tidak berubah wajib keluar sama persis seperti aslinya.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RAW = join(root, 'pukpes_data', 'raw', 'pestisida_terdaftar.json');
const NDJSON = join(root, 'spec', 'vocab', 'product', 'pestisida.ndjson');
const ZAT = join(root, 'spec', 'vocab', 'substance-pestisida.json');
const STAMP = '2026-08-19T00:00:00Z';

// Paragraf milik skrip ini pada notes selalu diawali penanda ini. Rekaman yang
// notes-nya juga ditulis dedup-komposisi-pestisida.mjs jadi bisa dipakai berdua:
// masing-masing skrip hanya menulis ulang paragrafnya sendiri.
const PENANDA = 'Penggabungan id zat: ';

// ---------------------------------------------------------------------------
// 1. Tujuh id yang digabung — masing-masing diputuskan sendiri.
//
//    Bukti yang dipakai bukan kemiripan nama, melainkan aritmetika kesetaraan yang
//    ditulis registri itu sendiri. Nisbah bobot molekul garam terhadap asamnya
//    tetap: 2,4-D dimetil amina 221,04/266,12 = 0,831, dan isopropilamina glifosat
//    169,07/228,19 = 0,741. Setiap pasangan di bawah ini cocok dengan nisbahnya
//    sampai pembulatan registri — 865x0,831 = 719 (ditulis 720), 620x0,741 = 459,
//    525x0,741 = 389. Angka-angka itu hanya cocok kalau kedua nama memang menunjuk
//    garam yang sama; nama yang berbeda bahan tidak akan pernah jatuh di nisbah itu.
//
//    'synonim' menentukan apakah label yang kalah pantas naik jadi synonyms pada
//    entitas yang menang. Ejaan alternatif — pantas. Nama yang sudah tercampur
//    keterangan kadar dan kesetaraan — tidak: itu anotasi registri, bukan nama
//    bahan, dan tempatnya memang pada entitas yang digantikan.
// ---------------------------------------------------------------------------
const GABUNG = {
  'op:sub:00000938': {
    kanonik: 'op:sub:00000122',
    synonim: false,
    dasar:
      'Registri memasukkan seluruh baris label ke field nama bahan, lengkap dengan kadar dan ' +
      'kesetaraannya. Yang tersisa sesudah anotasi itu dilepas adalah "2,4 D dimetil amina", ' +
      'ejaan lain dari 2,4-D dimetil amina.',
  },
  'op:sub:00000714': {
    kanonik: 'op:sub:00000122',
    synonim: false,
    dasar:
      'Nama bahannya sama persis dengan op:sub:00000122; yang membedakan hanya keterangan ' +
      'kesetaraan dalam kurung. 865 g/l garam setara 720 g/l 2,4-D asam mengikuti nisbah ' +
      'bobot molekulnya, jadi keduanya garam yang sama.',
  },
  'op:sub:00000942': {
    kanonik: 'op:sub:00000590',
    synonim: false,
    dasar:
      'Sama dengan op:sub:00000590 sesudah keterangan kesetaraan dilepas. 720 g/l setara ' +
      '600 g/l 2,4-D asam — nisbah 0,833, sama dengan nisbah 865/720 pada garam 2,4-D ' +
      'dimetil amina lainnya di registri ini.',
  },
  'op:sub:00000820': {
    kanonik: 'op:sub:00000138',
    synonim: false,
    dasar:
      'Sesudah keterangan kesetaraan dilepas, yang tersisa "Isopropil amina glifosat" — ' +
      'ejaan berspasi dari isopropilamina glifosat. 620 g/l setara 459 g/l glifosat, nisbah ' +
      '0,740, cocok dengan bobot molekul garamnya.',
  },
  'op:sub:00000813': {
    kanonik: 'op:sub:00000138',
    synonim: false,
    dasar:
      'Satu dari dua ejaan "isopropil amina glifosat (setara dengan glifosat 389 g/l)" yang ' +
      'sama-sama tercatat pada RONDA GOLD 525 SL. Keduanya digabung ke nama kanonik, bukan ' +
      'salah satunya dipilih: memilih di antara dua salah ketik registri hanya memindahkan ' +
      'sengketa, tidak menyelesaikannya.',
  },
  'op:sub:00001387': {
    kanonik: 'op:sub:00000138',
    synonim: false,
    dasar:
      'Ejaan kedua dari pasangan yang sama pada RONDA GOLD 525 SL — berbeda dari ' +
      'op:sub:00000813 hanya pada spasi dan kapitalisasi.',
  },
  'op:sub:00000484': {
    kanonik: 'op:sub:00000403',
    synonim: true,
    dasar:
      'Murni salah ejaan, tanpa teks kesetaraan: "dimeflutrhin" adalah "dimeflutrin" dengan ' +
      'huruf h tertukar. Keduanya piretroid obat nyamuk bakar dari lini produk yang sama, ' +
      'dengan kadar yang sama. Ejaannya dipertahankan sebagai synonyms karena ia ejaan ' +
      'bahan, bukan anotasi registri — tiga rekaman produk masih memakainya sebagai label.',
  },
};

// ---------------------------------------------------------------------------
// 2. Pendaftaran yang terkena, beserta jumlah kadar sebelum penggabungan.
//
//    Angka 'sebelum' ditulis di sini, tidak dihitung dari berkas: sesudah jalan
//    pertama ia tidak bisa dihitung lagi, sementara catatannya harus tetap
//    menyebut peringatan mana yang dipadamkan. Pada jalan pertama angka itu diuji
//    balik ke berkas; kalau meleset, skrip berhenti.
// ---------------------------------------------------------------------------
const PRODUK = {
  'mega-9-865-sl-01030120072778': {
    gabung: ['op:sub:00000938'],
    sebelum: 1730,
    setara: '865 g/l garam setara 720 g/l 2,4-D asam',
  },
  'amcomin-865-sl-01030120011606': {
    gabung: ['op:sub:00000714'],
    sebelum: 1730,
    setara: '865 g/l garam setara 720 g/l 2,4-D asam',
  },
  'dimina-720-sl-01030120062510': {
    gabung: ['op:sub:00000942'],
    sebelum: 1440,
    setara: '720 g/l garam setara 600 g/l 2,4-D asam',
  },
  'galatop-620-sl-01030120124225': {
    gabung: ['op:sub:00000820'],
    sebelum: 1240,
    setara: '620 g/l garam setara 459 g/l glifosat',
  },
  'ronda-gold-525-sl-01030120124437': {
    gabung: ['op:sub:00000813', 'op:sub:00001387'],
    sebelum: 1050,
    setara: '525 g/l garam setara 389 g/l glifosat',
  },
  // Tiga rekaman NOMOS di bawah tidak pernah menyalakan L27 — kadarnya dalam persen,
  // dan L27 hanya menjumlahkan g/kg dan g/L. Yang diperbaiki di sini identitas
  // bahannya, bukan jumlah kadarnya.
  'nomos-0-2mc-06080120227337': {
    gabung: ['op:sub:00000484'],
    sebelum: null,
    setara: null,
  },
  'nomos-0-1mc-06080120196563': {
    gabung: ['op:sub:00000484'],
    sebelum: null,
    setara: null,
  },
  'nomos-0-051mc-06080120217068': {
    gabung: ['op:sub:00000484'],
    sebelum: null,
    setara: null,
  },
};
// ---------------------------------------------------------------------------
// 3. Pembacaan sumber mentah — sama seperti pada dedup-komposisi-pestisida.mjs
// ---------------------------------------------------------------------------
const angka = (t) => {
  let s = String(t ?? '').trim();
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '');
  return Number(s.replace(',', '.'));
};

const SATUAN = {
  'g/l': 'g/L', 'ml/l': 'mL/L', 'mg/l': 'mg/L',
  'g/kg': 'g/kg', 'mg/kg': 'mg/kg', '%': '%',
  'g/m2': 'g/m2', 'mg/m2': 'mg/m2', 'mg/pcs': 'mg/pcs',
};
const TAK_DINYATAKAN = '*';

const satuan = (t) => {
  const s = String(t ?? '').trim().toLowerCase();
  if (!s || s === '-') return TAK_DINYATAKAN;
  return SATUAN[s] ?? String(t).trim();
};

// Nama bahan pada sumber dibandingkan setelah spasi ganda dirapikan dan huruf
// besar-kecilnya disamakan — registri menulis nama yang sama dengan spasi ekor
// ("isopropilamina glifosat ") dan kapitalisasi yang berubah-ubah.
const rapikan = (t) => String(t ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

function bahanMentah(bahanAktif) {
  let arr;
  try { arr = JSON.parse(bahanAktif || '[]'); } catch { return null; }
  if (!Array.isArray(arr)) return null;
  const nama = new Set();
  const kadar = new Set();
  for (const b of arr) {
    nama.add(rapikan(b?.namaBahan));
    const v = angka(b?.kadarBahan);
    if (Number.isFinite(v)) kadar.add(`${v}|${satuan(b?.satuanBahan)}`);
  }
  return { nama, kadar };
}

const adaDiSumber = (set, e) => set.has(`${e.value}|${e.unit}`) || set.has(`${e.value}|${TAK_DINYATAKAN}`);

// Penulis baris yang meniru json.dumps(obj, ensure_ascii=False) — berkas NDJSON-nya
// semula ditulis pembangun Python, dan menulis ulangnya dengan JSON.stringify bawaan
// Node akan mengubah ke-7.724 barisnya padahal yang berubah hanya delapan.
// Kesetiaannya diuji di bawah terhadap setiap rekaman yang tidak berubah.
function tulisBarisPython(v) {
  if (v === null) return 'null';
  if (typeof v === 'number') return Number.isInteger(v) ? `${v}.0` : String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(tulisBarisPython).join(', ')}]`;
  return `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${tulisBarisPython(x)}`).join(', ')}}`;
}

// ---------------------------------------------------------------------------
// 4. Kosakata zat — status "superseded" dan tautan penggantinya
// ---------------------------------------------------------------------------
const zatAsli = readFileSync(ZAT, 'utf8');
const zatDoc = JSON.parse(zatAsli);
const zatById = new Map(zatDoc.items.map((e) => [e.id, e]));

const gagal = [];

for (const [lama, p] of Object.entries(GABUNG)) {
  const kalah = zatById.get(lama);
  const menang = zatById.get(p.kanonik);
  if (!kalah) { gagal.push(`Entitas ${lama} tidak ada di ${ZAT}.`); continue; }
  if (!menang) { gagal.push(`Entitas kanonik ${p.kanonik} tidak ada di ${ZAT}.`); continue; }

  // Peran yang hanya dimiliki entitas yang kalah akan hilang begitu rujukannya
  // pindah. Lebih baik berhenti dan memindahkannya dengan sadar.
  for (const field of ['substance_classes', 'pesticide_action']) {
    const hilang = (kalah[field] ?? []).filter((x) => !(menang[field] ?? []).includes(x));
    if (hilang.length) {
      gagal.push(`${lama} punya ${field} ${hilang.join(', ')} yang tidak ada pada ${p.kanonik} — pindahkan dulu, jangan sampai hilang saat digabung.`);
    }
  }

  if (p.synonim) {
    const tambahan = [kalah.label.id, ...(kalah.synonyms ?? [])];
    const synonyms = [...new Set([...(menang.synonyms ?? []), ...tambahan])];
    if (synonyms.length !== (menang.synonyms ?? []).length) {
      menang.synonyms = synonyms;
      menang.lifecycle = { ...menang.lifecycle, updated_at: STAMP };
    }
  }

  kalah.lifecycle = {
    ...kalah.lifecycle,
    status: 'superseded',
    updated_at: STAMP,
    superseded_by: { id: p.kanonik },
  };
  kalah.notes = {
    id:
      `Digantikan ${p.kanonik} "${menang.label.id}" — bahan yang sama, terdaftar dua kali karena ` +
      `nama pada registri berbeda. ${p.dasar} Entitas ini sengaja tidak dihapus: ID tidak pernah ` +
      `didaur ulang, dan ejaan registri yang asli beserta pemetaannya masih perlu bisa ditelusuri.`,
  };
}

// lifecycle.superseded_by wajib menunjuk entitas yang bukan superseded juga.
// Rantai A→B→C membuat pemakai berhenti di tempat yang salah.
for (const lama of Object.keys(GABUNG)) {
  const tujuan = zatById.get(GABUNG[lama].kanonik);
  if (tujuan && GABUNG[tujuan.id]) {
    gagal.push(`${lama} digantikan ${tujuan.id}, tetapi ${tujuan.id} sendiri ikut digabung — rantai penggantian harus diratakan dulu.`);
  }
}

// ---------------------------------------------------------------------------
// 5. Registri produk — pemetaan ulang dan penggabungan entri
// ---------------------------------------------------------------------------
const rawJson = JSON.parse(readFileSync(RAW, 'utf8'));
const rows = Array.isArray(rawJson) ? rawJson : Object.values(rawJson).find(Array.isArray);
const barisAsli = readFileSync(NDJSON, 'utf8').trim().split('\n');
const records = barisAsli.map((l) => JSON.parse(l));
const berubah = new Set();

if (rows.length !== records.length) {
  gagal.push(`Jumlah tidak cocok: ${rows.length} baris di sumber, ${records.length} di NDJSON.`);
}

records.forEach((rec, i) => {
  const a = String(rec.label?.id ?? '').trim().toUpperCase();
  const b = String(rows[i]?.namaProduk ?? '').trim().toUpperCase();
  const na = String(rec.registration?.number ?? '').trim();
  const nb = String(rows[i]?.nomorPendaftaran ?? '').trim();
  if (a !== b || na !== nb) {
    gagal.push(`Urutan meleset di posisi ${i}: NDJSON "${a}" (${na}) vs sumber "${b}" (${nb}).`);
  }
});

if (gagal.length) {
  for (const b of gagal) console.error(b);
  process.exit(1);
}

const jumlahKadar = (komposisi) => (komposisi ?? [])
  .filter((c) => c.unit === 'g/kg' || c.unit === 'g/L')
  .reduce((n, c) => n + c.value, 0);

const stat = { dipetakanUlang: 0, entriDibuang: 0, produkBerubah: 0 };
const tanpaCatatan = [];
const takAdaDiSumber = [];
const sebelumMeleset = [];
const kunciTerpakai = new Set();
const zatTerpakai = new Set();

records.forEach((rec, i) => {
  const asli = rec.composition ?? [];
  const kena = asli.some((e) => GABUNG[e.substance?.id]);
  const p = PRODUK[rec.key];
  if (p) kunciTerpakai.add(rec.key);
  if (!kena && !p) return;

  if (kena && !p) {
    tanpaCatatan.push(`${rec.key} (${rec.label?.id}) memuat id yang digabung tetapi tidak ada di tabel PRODUK`);
    return;
  }

  const mentah = bahanMentah(rows[i].bahanAktif);

  // Jumlah kadar sebelum penggabungan diuji ke berkas selama kembarnya masih ada.
  if (kena && p.sebelum !== null && Math.round(jumlahKadar(asli)) !== p.sebelum) {
    sebelumMeleset.push(`${rec.key}: tabel menyebut ${p.sebelum} g, berkas menjumlahkan ${Math.round(jumlahKadar(asli))} g`);
  }

  // Pemetaan ulang, lalu penggabungan entri yang jadi kembar persis.
  const kelompok = [];
  const posisi = new Map();
  let dipetakan = 0;

  for (const e of asli) {
    const lama = e.substance?.id;
    const g = GABUNG[lama];
    const id = g ? g.kanonik : lama;
    if (g) {
      zatTerpakai.add(lama);
      dipetakan++;
      // Dua nama itu harus benar-benar berdampingan pada pendaftaran yang sama di
      // sumber. Kalau tidak, penggabungan ini menyimpulkan sesuatu yang tidak ada
      // di registri, dan yang perlu ditinjau adalah tabelnya — bukan berkasnya.
      const kalah = zatById.get(lama);
      if (mentah && kalah && !mentah.nama.has(rapikan(kalah.label.id))) {
        takAdaDiSumber.push(`${rec.key} — nama "${kalah.label.id}" tidak ada di bahanAktif pendaftaran ini`);
      }
    }
    const tanda = `${id}|${e.value}|${e.unit}`;
    if (!posisi.has(tanda)) {
      posisi.set(tanda, kelompok.length);
      kelompok.push({ id, entri: [] });
    }
    kelompok[posisi.get(tanda)].entri.push({ e, dipetakanUlang: Boolean(g) });
  }

  // Label yang bertahan harus nama yang memang dijawab entitas kanoniknya — label
  // atau salah satu synonyms-nya. Kalau entri pertama kelompok itu yang dipetakan
  // ulang, labelnya masih membawa anotasi registri ("... setara dengan glifosat 459
  // g/l") yang bukan nama bahan, dan mempertahankannya berarti menulis label yang
  // membantah id-nya sendiri. Yang dipakai label saudara sekelompoknya yang sudah
  // memakai id kanonik; kalau tidak ada satu pun — seperti pada RONDA GOLD 525 SL,
  // yang kedua entrinya sama-sama salah ketik registri — yang dipakai label kanonik
  // dari kosakata, karena memilih salah satu salah ketik hanya memindahkan sengketa.
  const dikenal = (id, label) => {
    const zat = zatById.get(id);
    if (!zat) return false;
    return [zat.label.id, ...(zat.synonyms ?? [])].some((n) => rapikan(n) === rapikan(label));
  };

  // Susunan field pada entri harus tetap {substance, value, unit} seperti aslinya.
  const rapi = kelompok.map(({ id, entri }) => {
    const utuh = entri.every((x) => !x.dipetakanUlang);
    const asal = entri.find((x) => !x.dipetakanUlang) ?? entri[0];
    // Kelompok yang tidak tersentuh pemetaan ulang lewat apa adanya — 7.716 rekaman
    // lain di berkas ini juga memakai label apa adanya dari registri, dan merapikannya
    // di sini akan mengubah baris yang tidak ada urusannya dengan penggabungan.
    const label = utuh || dikenal(id, asal.e.substance.label)
      ? asal.e.substance.label
      : zatById.get(id).label.id;
    return { substance: { id, label }, value: asal.e.value, unit: asal.e.unit };
  });

  if (mentah) {
    for (const e of rapi) {
      if (!adaDiSumber(mentah.kadar, e)) {
        takAdaDiSumber.push(`${rec.key} — kadar ${e.value} ${e.unit} tidak ada di bahanAktif mentah`);
      }
    }
  }

  const sebelumnya = JSON.stringify(asli);
  if (JSON.stringify(rapi) !== sebelumnya) {
    stat.produkBerubah++;
    stat.dipetakanUlang += dipetakan;
    stat.entriDibuang += asli.length - rapi.length;
    rec.composition = rapi;
    rec.lifecycle = { ...rec.lifecycle, updated_at: STAMP };
    berubah.add(i);
  }

  // Catatan ditulis dari tabel, bukan dari kembar yang masih terlihat — supaya
  // jalan kedua menghasilkan teks yang sama persis.
  const daftar = p.gabung
    .map((lama) => `${lama} "${zatById.get(lama).label.id}" ke ${GABUNG[lama].kanonik} "${zatById.get(GABUNG[lama].kanonik).label.id}"`)
    .join('; ');

  // Sebabnya disebut apa adanya: teks kesetaraan dan salah ejaan menghasilkan gejala
  // yang sama tetapi bukan cacat yang sama, dan catatannya tidak boleh mengaburkannya.
  const sebab = p.gabung.every((x) => GABUNG[x].synonim)
    ? 'Sumber menuliskan nama bahannya dengan ejaan yang berbeda'
    : 'Registri menuliskan keterangan kesetaraan ke dalam field nama bahan';

  const paragraf =
    `${PENANDA}${daftar}. ${sebab}, sehingga satu bahan aktif terdaftar sebagai lebih dari ` +
    `satu entitas. ` +
    (p.sebelum
      ? `Kadarnya ikut terjumlah dua kali dan L27 menyalakan "komposisi mustahil" pada ${p.sebelum} g/l; ` +
        `sesudah digabung kadarnya ${Math.round(jumlahKadar(rapi))} g/l — ${p.setara}, sebagaimana ditulis registri. `
      : `Kadarnya tidak berubah; yang diperbaiki identitas bahannya. `) +
    `Entitas yang digantikan tidak dihapus, statusnya "superseded" dan menunjuk penggantinya.`;

  const sebelumnyaCatatan = rec.notes?.id ?? '';
  const potong = sebelumnyaCatatan.indexOf(PENANDA);
  const awalan = (potong === -1 ? sebelumnyaCatatan : sebelumnyaCatatan.slice(0, potong)).trim();
  const catatan = awalan ? `${awalan} ${paragraf}` : paragraf;

  if (catatan !== sebelumnyaCatatan) {
    rec.notes = { ...rec.notes, id: catatan };
    rec.lifecycle = { ...rec.lifecycle, updated_at: STAMP };
    berubah.add(i);
  }
});

// ---------------------------------------------------------------------------
// 6. Penjagaan — tidak ada yang boleh berubah diam-diam
// ---------------------------------------------------------------------------
if (tanpaCatatan.length) {
  gagal.push('Ada pendaftaran yang terkena penggabungan tetapi belum ada di tabel PRODUK:');
  for (const s of tanpaCatatan) gagal.push(`  ${s}`);
}
if (takAdaDiSumber.length) {
  gagal.push('Ada penggabungan yang tidak didukung bahanAktif mentah — tinjau ulang tabel GABUNG:');
  for (const s of takAdaDiSumber) gagal.push(`  ${s}`);
}
if (sebelumMeleset.length) {
  gagal.push('Jumlah kadar sebelum penggabungan tidak cocok dengan berkas:');
  for (const s of sebelumMeleset) gagal.push(`  ${s}`);
}
const produkHilang = Object.keys(PRODUK).filter((k) => !kunciTerpakai.has(k));
if (produkHilang.length) {
  gagal.push('Ada pendaftaran di tabel PRODUK yang tidak ada di NDJSON:');
  for (const s of produkHilang) gagal.push(`  ${s}`);
}
if (gagal.length) {
  for (const b of gagal) console.error(b);
  process.exit(1);
}

const keluaran = records.map(tulisBarisPython);
const menyimpang = [];
records.forEach((_, i) => {
  if (!berubah.has(i) && keluaran[i] !== barisAsli[i]) menyimpang.push(i);
});
if (menyimpang.length) {
  console.error(`Penulis baris tidak setia pada ${menyimpang.length} rekaman yang tidak berubah — contoh baris ${menyimpang.slice(0, 3).map((i) => i + 1).join(', ')}.`);
  console.error('Menulis berkas sekarang akan mengubah baris yang tidak ada urusannya dengan penggabungan ini. Dibatalkan.');
  process.exit(1);
}

writeFileSync(NDJSON, keluaran.join('\n') + '\n');
writeFileSync(ZAT, JSON.stringify(zatDoc, null, 2) + '\n');

const belumTerpakai = Object.keys(GABUNG).filter((k) => !zatTerpakai.has(k));

console.log(`Id zat digabung           : ${Object.keys(GABUNG).length}`);
console.log(`  jadi berstatus superseded: ${Object.keys(GABUNG).length}`);
console.log(`  tanpa rujukan di NDJSON : ${belumTerpakai.length}${belumTerpakai.length ? ` (${belumTerpakai.join(', ')})` : ''}`);
console.log(`Pendaftaran diperiksa     : ${records.length}`);
console.log(`  barisnya ditulis ulang  : ${berubah.size} (sisanya keluar apa adanya)`);
console.log(`  komposisinya berubah    : ${stat.produkBerubah}`);
console.log(`  entri dipetakan ulang   : ${stat.dipetakanUlang}`);
console.log(`  entri kembar dibuang    : ${stat.entriDibuang}`);
