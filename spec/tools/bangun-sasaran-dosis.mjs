// Membongkar kolom Komoditas registri pestisida jadi tabel relasional
// produk x komoditas x OPT beserta dosisnya — dan indeks yang bisa MENYATAKAN
// ketiadaan, bukan sekadar diam ketika sebuah pasangan tidak ada.
//
// Sumber: pukpes_data/raw/pestisida_terdaftar.json (tarikan 19 Agustus 2026).
// Dibaca saja, tidak pernah ditulis. Jalankan dari akar repositori:
//
//   node spec/tools/bangun-sasaran-dosis.mjs            # hitung & laporkan saja
//   node spec/tools/bangun-sasaran-dosis.mjs --tulis    # tulis ke pukpes_data/
//
// KENAPA ADA
// Dua medan registri berisi JSON di dalam string, jadi isinya tidak pernah muncul
// di CSV mana pun: `bahanAktif` dan `Komoditas`. Yang kedua memuat 23.890 entri
// sasaran — dan di situlah satu-satunya dosis anjuran yang pernah diterbitkan
// negara untuk tiap pasangan komoditas x OPT.
//
// DOSIS SERING TIDAK ADA DI KOLOM DOSIS
// Registri menyimpan dosis di `kadarPestisida`, tetapi pada ribuan entri kolom itu
// kosong sementara angkanya tertulis di dalam kurung pada `latinHamaKomoditas`:
//
//   {"hamaKomoditas":"gulma golongan rumput","namaKomoditas":"Tebu",
//    "kadarPestisida":"","satuanPestisida":"-",
//    "latinHamaKomoditas":"Echinochloa colona (150 - 300 ml/ha)"}
//
// Sebagian kecil lagi menaruhnya di kurung pada `namaKomoditas`. Ketiganya diurai
// di sini, dan tiap baris keluaran menyebut asal angkanya lewat kolom `dosis_asal` —
// supaya yang tercatat rapi bisa dipisahkan dari yang dipungut dari dalam kurung.
//
// URUTAN PRIORITAS, DAN KENAPA
// 1. `kadarPestisida` + `satuanPestisida` — medan berstruktur, menang bila terisi.
// 2. kurung pada baris nama ilmiah yang bersangkutan — khas per spesies.
// 3. kurung pada `namaKomoditas` — berlaku untuk seluruh entri.
// Pada baris nama ilmiah TAMBAHAN (lihat di bawah) urutan 1 dan 2 ditukar: kurung
// milik baris itu sendiri lebih spesifik daripada kolom yang mewakili baris pertama.
// Bila kolom dan kurung sama-sama ada tetapi angkanya berbeda, kolom yang dipakai
// DAN selisihnya dicatat ke berkas anomali — tidak ada yang dibuang diam-diam.
//
// SATU ENTRI BISA MEMUAT BEBERAPA SPESIES
// Pada 130 entri, `latinHamaKomoditas` memuat beberapa baris, satu spesies per
// baris, masing-masing dengan dosisnya sendiri. Baris kedua dan seterusnya keluar
// sebagai baris tersendiri dengan `baris_asal=tambahan`. Baris yang bentuknya bukan
// nama ilmiah — kalimat peringatan, keterangan cara aplikasi, tanda hubung tunggal —
// tidak pernah dijadikan OPT; ia masuk kolom `catatan_baris` dan dihitung di anomali.
//
// DOSIS YANG BUKAN ANGKA TIDAK DIPAKSA JADI ANGKA
// "siap pakai", "Secukupnya", "tidak tersedia untuk ekspor" adalah pernyataan dosis
// yang sah tetapi tidak bernilai numerik. Ia keluar dengan `dosis_asal=kolom-teks`:
// teksnya utuh, angkanya kosong. Cakupan dosis di laporan menghitung yang NUMERIK
// saja, sebab hanya itu yang bisa dipakai berhitung.
//
// TAUTAN KOMODITAS DAN OPT DIAMBIL DARI KOSAKATA YANG SUDAH ADA
// vocab/product/pestisida.ndjson sudah memutuskan label registri mana menunjuk
// op:cmd/op:pst mana. Keputusan itu dipakai ulang di sini, tidak diulang dengan cara
// sendiri — kalau tidak, repositori ini punya dua kebenaran untuk pertanyaan yang
// sama. Penyelarasannya diperiksa tiap kali jalan: entri raw yang `namaKomoditas`-nya
// tidak kosong berpadanan satu-satu dan berurutan dengan `label_uses`, dan skrip
// berhenti dengan galat bila padanan itu meleset.
//
// YANG SENGAJA TIDAK DILAKUKAN
// Nama bahan aktif keluar APA ADANYA dari registri. Penyeragaman ejaannya dan
// pemetaannya ke golongan IRAC/FRAC/HRAC adalah pekerjaan lain.
//
// KELUARANNYA DETERMINISTIK
// Tidak ada stempel waktu dan tidak ada urutan yang bergantung pada pembacaan objek:
// urutan baris mengikuti urutan registri, seluruh kunci indeks diurutkan. Menjalankan
// ulang pada sumber yang sama menghasilkan berkas yang identik byte per byte.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RAW = join(akar, 'pukpes_data', 'raw', 'pestisida_terdaftar.json');
const NDJSON = join(akar, 'spec', 'vocab', 'product', 'pestisida.ndjson');
const VOCAB = join(akar, 'spec', 'vocab');
const KELUAR = join(akar, 'pukpes_data');
const tulis = process.argv.includes('--tulis');

const TANGGAL_TARIK = '2026-08-19';

// ---------------------------------------------------------------------------
// Pembantu teks
// ---------------------------------------------------------------------------
const rapikan = (s) =>
  (s == null ? '' : String(s)).replace(/ /g, ' ').replace(/﻿/g, '').replace(/[ \t]+/g, ' ').trim();

const rapikanBaris = (s) =>
  (s == null ? '' : String(s)).replace(/ /g, ' ').replace(/﻿/g, '').replace(/\r\n?/g, '\n');

const kunciLonggar = (s) => rapikan(s).toLowerCase();

// Nilai yang berarti "kosong" meski hurufnya ada.
const KOSONG_SIMBOLIS = new Set(['-', '--', '.', 'na', 'n/a', 'tad', 'tidak ada', '0', 'nil']);

// ---------------------------------------------------------------------------
// Pengurai dosis
//
// Bentuk yang diterima: [angka] [- angka] [satuan], desimal boleh koma atau titik.
//
// Syarat satuan berbeda menurut tempat angkanya ditemukan, dan perbedaan itu
// disengaja:
//
//   ketat (untuk isi kurung) — satuan wajib mengandung "/" atau "%". Tanpa syarat
//   itu, "(2H)" pada nama kimia 2-methylisothiazol-3(2H)-one terbaca sebagai dosis
//   "2 H", dan tiap kurung berisi angka apa pun jadi dosis palsu.
//
//   longgar (untuk kolom kadarPestisida) — kolom itu memang medan dosis, jadi
//   satuan tunggal seperti "gram" diterima. Yang tetap ditolak adalah satuan yang
//   sebenarnya keterangan waktu ("2 jam setelah semprot"), disaring lewat daftar
//   satuan tunggal yang sah di bawah.
// ---------------------------------------------------------------------------
const SATUAN_TUNGGAL = new Set([
  'g', 'gr', 'gram', 'kg', 'mg', 'ml', 'l', 'liter', 'cc', 'tablet', 'sachet', 'butir', 'buah', 'ppm',
]);

const ANGKA = String.raw`\d+(?:[.,]\s?\d+)?`;
const PISAH = String.raw`(?:-|–|—|s\/d|s\.d\.?|sampai)`;
const POLA_DOSIS = new RegExp(
  String.raw`^\s*(?:(?<lo>${ANGKA})\s*${PISAH}\s*)?(?<hi>${ANGKA})\s*(?<satuan>.*?)\s*$`,
);

const keAngka = (s) => (s == null ? null : Number(String(s).replace(/\s/g, '').replace(',', '.')));

// "1,5 l/ha - 3 l/ha" -> "1,5 - 3 l/ha". Satuan yang ditulis dua kali membuat
// rentangnya terbaca sebagai bagian dari satuan; disatukan HANYA bila kedua
// satuannya sama persis, jadi tidak ada tebakan.
function satukanSatuanGanda(teks) {
  const m = teks.match(
    new RegExp(String.raw`^\s*(${ANGKA})\s*([^\s].*?)\s*${PISAH}\s*(${ANGKA})\s*([^\s].*?)\s*$`),
  );
  if (m && kunciLonggar(m[2]) === kunciLonggar(m[4])) return `${m[1]} - ${m[3]} ${m[2]}`;
  return null;
}

function uraiDosis(teks, ketat = true) {
  let t = rapikan(teks);
  if (!t) return null;
  if (/^\(.*\)$/.test(t)) t = rapikan(t.slice(1, -1)); // "(1 - 1,5 kg/ha)"
  if (KOSONG_SIMBOLIS.has(kunciLonggar(t))) return { tolak: 'kosong-simbolis', teks: t };

  const coba = (s) => {
    const m = POLA_DOSIS.exec(s);
    if (!m) return null;
    const satuan = rapikan(m.groups.satuan);
    const hi = keAngka(m.groups.hi);
    if (hi == null || Number.isNaN(hi)) return null;
    if (satuan) {
      if (!/^[A-Za-z%/]/.test(satuan)) return { tolak: 'satuan-diawali-bukan-huruf', satuan, teks: t };
      if (/\s[-–—]\s/.test(satuan)) return { tolak: 'rentang-di-dalam-satuan', satuan, teks: t };
      if (satuan.length > 30) return { tolak: 'satuan-terlalu-panjang', satuan, teks: t };
      const punyaBasis = /[/%]/.test(satuan);
      if (ketat && !punyaBasis) return { tolak: 'satuan-tanpa-garis-miring', satuan, teks: t };
      if (!ketat && !punyaBasis && !SATUAN_TUNGGAL.has(kunciLonggar(satuan)))
        return { tolak: 'satuan-bukan-satuan', satuan, teks: t };
    }
    const lo = keAngka(m.groups.lo);
    return { teks: t, min: lo == null ? hi : lo, maks: hi, satuan };
  };

  const hasil = coba(t);
  if (hasil && !hasil.tolak) return hasil;
  const gabung = satukanSatuanGanda(t);
  if (gabung) {
    const ulang = coba(gabung);
    if (ulang && !ulang.tolak) return { ...ulang, teks: t, diperbaiki: 'satuan-ditulis-dua-kali' };
  }
  return hasil;
}

const isiKurung = (s) => [...rapikanBaris(s).matchAll(/\(([^()]*)\)/g)].map((m) => rapikan(m[1]));

// Hanya kurung di UJUNG baris yang dibuang. Anotasi dosis selalu mengekor, sedangkan
// kurung di tengah adalah bagian dari namanya sendiri: membuang semua kurung akan
// mengubah 2-methylisothiazol-3(2H)-one jadi "2-methylisothiazol-3 -one".
const tanpaKurung = (s) => rapikan(rapikanBaris(s).replace(/(?:\s*\([^()]*\)\s*)+$/, ''));

// ---------------------------------------------------------------------------
// Apakah sebuah baris berbentuk nama ilmiah?
//
// Bukan penilaian taksonomi — hanya bentuk. Yang lolos: 1–4 kata huruf (boleh
// "sp.", "spp.", tanda hubung), tanpa angka, tanpa titik dua, dan tidak diawali
// kata Indonesia penanda catatan. Yang tidak lolos tidak pernah jadi OPT.
// ---------------------------------------------------------------------------
const AWALAN_CATATAN =
  /^(kalimat|tidak|perlakuan|penyemprotan|penyiraman|pengumpanan|pengasapan|fumigasi|izin|meningkatkan|hasil|dan|atau|sisa|pest|proses|retensi|catatan|dosis|aplikasi|pengenceran|volume|thermal|fogging|ulv|produk|pestisida|uji|bobot|jumlah|panjang|rendemen|ukuran|cara|untuk|hanya|sekali|umpan)\b/i;

function miripNamaIlmiah(s) {
  const t = rapikan(s);
  if (!t || KOSONG_SIMBOLIS.has(kunciLonggar(t))) return false;
  if (/[:;]/.test(t)) return false;
  if (/\d/.test(t)) return false;
  if (AWALAN_CATATAN.test(t)) return false;
  const kata = t.split(/\s+/);
  if (kata.length < 1 || kata.length > 4) return false;
  return kata.every((k) => /^[A-Za-z][A-Za-z.'’\-]*$/.test(k));
}

// ---------------------------------------------------------------------------
// Cadangan penautan: label registri -> op:cmd / op:pst lewat mappings KEMENTAN.
// Dipakai HANYA untuk baris yang tidak punya padanan di label_uses — yaitu baris
// nama ilmiah tambahan dan entri yang namaKomoditas-nya kosong.
// ---------------------------------------------------------------------------
function bacaVocab(nama) {
  const p = join(VOCAB, nama);
  if (!existsSync(p)) return [];
  const d = JSON.parse(readFileSync(p, 'utf8'));
  return Array.isArray(d) ? d : d.items || [];
}

// Entitas yang sudah DIGANTIKAN tidak boleh jadi tujuan penautan: L29 melarang rujukan
// menunjuk entitas superseded, dan peta ini yang membuat rujukannya. Sebelum ada
// entitas yang naik dari registri ke kosakata terkurasi hal ini tidak pernah terlihat —
// yang digantikan hanyalah salah ketik, dan ejaannya toh sudah dinaikkan jadi mappings
// KEMENTAN pada penerusnya. Sesudah spec/tools/kurasi-opt.mjs, puluhan entitas
// yang ejaannya BENAR jadi superseded, dan tanpa saringan ini peta akan menautkan
// "Spodoptera exigua" kembali ke entitas mati pada tarikan registri berikutnya.
//
// Aman karena penyatuan selalu menaikkan seluruh ejaan yang kalah ke penerusnya:
// 593 ejaan KEMENTAN pada entitas yang digantikan, 593 di antaranya juga tercatat pada
// penerusnya masing-masing. Tidak ada label yang kehilangan jalannya.
function petaLabel(berkas, ambilTambahan) {
  const tepat = new Map();
  const longgar = new Map();
  for (const nama of berkas) {
    for (const it of bacaVocab(nama)) {
      if (it.lifecycle?.status === 'superseded') continue;
      const kandidat = [];
      for (const m of it.mappings || []) if (m.scheme === 'KEMENTAN' && m.id) kandidat.push(m.id);
      if (ambilTambahan) for (const x of ambilTambahan(it)) if (x) kandidat.push(x);
      for (const k of kandidat) {
        if (!tepat.has(k)) tepat.set(k, it.id);
        const kl = kunciLonggar(k);
        if (kl && !longgar.has(kl)) longgar.set(kl, it.id);
      }
    }
  }
  return { tepat, longgar };
}

const petaKomoditas = petaLabel(['commodity-registri.json', 'commodity.json'], null);
const petaOpt = petaLabel(['pest-registri.json', 'pest.json'], (it) => [it.scientific_name]);

function cariId(peta, label) {
  if (!label) return '';
  if (peta.tepat.has(label)) return peta.tepat.get(label);
  const r = rapikan(label);
  if (peta.tepat.has(r)) return peta.tepat.get(r);
  return peta.longgar.get(kunciLonggar(label)) || '';
}

// ---------------------------------------------------------------------------
// Tautan ke op:prd — posisi larik raw = urutan baris NDJSON, dan itu DIPERIKSA.
// Nomor pendaftaran tidak bisa jadi kunci: 182 dari 7.724 nomor dipakai lebih dari
// satu produk.
// ---------------------------------------------------------------------------
function bacaProduk(jml) {
  if (!existsSync(NDJSON)) return { rec: [], catatan: 'vocab/product/pestisida.ndjson tidak ada — produk_id, komoditas_id, dan opt_id dikosongkan.' };
  const baris = readFileSync(NDJSON, 'utf8').split('\n').filter((l) => l.trim());
  if (baris.length !== jml)
    return { rec: [], catatan: `vocab/product/pestisida.ndjson berisi ${baris.length} baris, raw ${jml} — tautan dikosongkan.` };
  return { rec: baris.map((l) => JSON.parse(l)), catatan: '' };
}

// ---------------------------------------------------------------------------
// Penulis CSV — UTF-8 BOM + CRLF, sama seperti CSV lain di pukpes_data/
// ---------------------------------------------------------------------------
function csv(kolom, baris) {
  const sel = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + [kolom, ...baris].map((r) => r.map(sel).join(',')).join('\r\n') + '\r\n';
}

// ===========================================================================
// Jalan utama
// ===========================================================================
const raw = JSON.parse(readFileSync(RAW, 'utf8'));
const prd = bacaProduk(raw.length);

const barisSasaran = [];
const barisBahan = [];
const barisAnomali = [];
const h = {
  produk: 0,
  rekamanMentah: 0,
  rekamanKembarDibuang: 0,
  idGanda: 0,
  bahanKembarDibuang: 0,
  entriKembarDibuang: 0,
  produkPunyaSasaran: 0,
  entriMentah: 0,
  entriTanpaSasaran: 0,
  barisSasaran: 0,
  barisTambahan: 0,
  dosisKolom: 0,
  dosisKolomTeks: 0,
  dosisKurungLatin: 0,
  dosisKurungKomoditas: 0,
  tanpaDosis: 0,
  entriSasaran: 0,
  entriDosisSebelum: 0,
  entriDosisSesudah: 0,
  produkDosisSebelum: 0,
  produkDosisSesudah: 0,
  bentrok: 0,
  kurungBukanDosis: 0,
  barisBukanNamaIlmiah: 0,
  bahan: 0,
  komoditasTertaut: 0,
  optTertaut: 0,
  perbaikanSatuanGanda: 0,
  labelUsesDipakai: 0,
  labelUsesPunyaRate: 0,
};

const anomali = (r, jenis, teks, ket) =>
  barisAnomali.push([r.nomorPendaftaran || '', rapikan(r.namaProduk), jenis, teks, ket]);

// ---------------------------------------------------------------------------
// Rekaman kembar dari endpoint — dibuang SEBELUM pemekaran apa pun
//
// Tarikan registri memuat 7.724 rekaman tetapi hanya 7.715 `id` unik: delapan `id`
// muncul lebih dari sekali (satu tiga kali, tujuh dua kali), sembilan baris berlebih.
// Kalau dibiarkan, tiap salinan ikut dimekarkan jadi baris bahan aktif dan baris
// sasaran, sehingga delapan produk terhitung berganda pada pertanyaan sesederhana
// "berapa produk mengandung bahan X".
//
// Penggandaan ini perilaku endpoint, bukan tabrakan identitas: delapan `id` yang
// sama muncul di potret 19 maupun 23 Agustus, dan tiap salinan identik byte per byte
// dengan aslinya. Kalau suatu saat TIDAK identik, itu bukan penggandaan lagi
// melainkan dua produk berbeda yang berbagi `id` — skrip berhenti dengan galat dan
// tidak memilih salah satu, sebab pilihan itu bukan urusan alat pembersih.
//
// Yang dibuang tidak lenyap tanpa jejak: cacahnya dilaporkan di ringkasan, tiap
// salinan dapat satu baris di sasaran_dosis_anomali.csv, dan angkanya masuk ke
// meta pada sasaran_ketersediaan.json.
// ---------------------------------------------------------------------------
const bakuJson = (v) => {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(bakuJson).join(',')}]`;
  return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${bakuJson(v[k])}`).join(',')}}`;
};

const pasanganProduk = [];
const pertama = new Map();
const kembarDibuang = [];
for (let i = 0; i < raw.length; i++) {
  const r = raw[i];
  const rec = prd.rec[i];
  if (rec) {
    const nomorSama = (rec.registration?.number || '') === (r.nomorPendaftaran || 'TIDAK-TERCANTUM');
    const namaSama = rapikan(rec.label?.id) === rapikan(r.namaProduk);
    if (!nomorSama && !namaSama)
      throw new Error(
        `Urutan raw dan NDJSON melenceng di indeks ${i}: "${rapikan(r.namaProduk)}" vs "${rapikan(rec.label?.id)}".`,
      );
  }
  const id = r.id;
  if (id && pertama.has(id)) {
    const asal = pertama.get(id);
    if (bakuJson(raw[asal.i]) !== bakuJson(r))
      throw new Error(
        `id "${id}" dipakai dua rekaman yang ISINYA BERBEDA (indeks ${asal.i} dan ${i}, "${rapikan(r.namaProduk)}"). ` +
          'Itu tabrakan identitas, bukan penggandaan baris — jangan dedup, tinjau sumbernya lebih dulu.',
      );
    kembarDibuang.push({ i, id, r, rec, asal });
    continue;
  }
  if (id) pertama.set(id, { i, r, rec });
  pasanganProduk.push({ r, rec, i });
}
h.rekamanMentah = raw.length;
h.produk = pasanganProduk.length;
h.rekamanKembarDibuang = kembarDibuang.length;
h.idGanda = new Set(kembarDibuang.map((k) => k.id)).size;
for (const k of kembarDibuang) {
  h.bahanKembarDibuang += (JSON.parse(k.r.bahanAktif || '[]') || []).length;
  h.entriKembarDibuang += (JSON.parse(k.r.Komoditas || '[]') || []).length;
  anomali(
    k.r,
    'rekaman-kembar-dibuang',
    `id=${k.id}`,
    `Salinan identik rekaman ke-${k.asal.i + 1}; yang dipertahankan ${k.asal.rec ? k.asal.rec.id : 'tanpa op:prd'}, ` +
      `yang dibuang rekaman ke-${k.i + 1} = ${k.rec ? k.rec.id : 'tanpa op:prd'}. Bersamanya ikut ` +
      `${(JSON.parse(k.r.bahanAktif || '[]') || []).length} entri bahan aktif dan ` +
      `${(JSON.parse(k.r.Komoditas || '[]') || []).length} entri komoditas. Catatan: op:prd yang dibuang tetap ada di ` +
      'vocab/product/pestisida.ndjson — NDJSON itu dibangun dari tarikan yang belum didedup, jadi ia tidak akan punya baris di sini.',
  );
}

for (const { r, rec } of pasanganProduk) {
  const produkId = rec ? rec.id : '';
  const nomor = r.nomorPendaftaran || '';
  const nama = rapikan(r.namaProduk);

  // --- bahan aktif, apa adanya ---------------------------------------------
  let bahan = [];
  try {
    bahan = r.bahanAktif ? JSON.parse(r.bahanAktif) : [];
  } catch {
    anomali(r, 'bahan-aktif-json-rusak', String(r.bahanAktif).slice(0, 200), 'JSON di dalam string gagal diurai.');
  }
  bahan.forEach((b, n) => {
    h.bahan++;
    barisBahan.push([
      nomor, produkId, nama, rapikan(r.JenisPestisidaNama), n + 1,
      rapikan(b.namaBahan), rapikan(b.kadarBahan), rapikan(b.satuanBahan),
    ]);
  });

  // --- sasaran --------------------------------------------------------------
  let kom = [];
  try {
    kom = r.Komoditas ? JSON.parse(r.Komoditas) : [];
  } catch {
    anomali(r, 'komoditas-json-rusak', String(r.Komoditas).slice(0, 200), 'JSON di dalam string gagal diurai.');
    continue;
  }
  const lu = rec ? rec.label_uses || [] : [];
  let nLu = 0; // penunjuk label_uses, maju hanya pada entri yang namaKomoditas-nya terisi
  let adaSasaran = false;
  let produkSebelum = false;
  let produkSesudah = false;

  for (const k of kom) {
    h.entriMentah++;
    const komoditasMentah = rapikan(k.namaKomoditas);
    const optLabel = rapikan(k.hamaKomoditas);
    const latinMentah = rapikanBaris(k.latinHamaKomoditas);

    // padanan di kosakata: hanya entri berkomoditas yang punya label_uses
    let pasanganLu = null;
    if (komoditasMentah) {
      pasanganLu = lu[nLu] || null;
      if (pasanganLu && rapikan(pasanganLu.commodity_label) !== komoditasMentah)
        throw new Error(
          `label_uses melenceng pada "${nama}": "${komoditasMentah}" vs "${rapikan(pasanganLu.commodity_label)}".`,
        );
      nLu++;
      if (pasanganLu) {
        h.labelUsesDipakai++;
        if (pasanganLu.rate_text) h.labelUsesPunyaRate++;
      }
    }

    if (!komoditasMentah && !optLabel && !latinMentah.trim()) {
      h.entriTanpaSasaran++;
      anomali(r, 'entri-tanpa-sasaran', '',
        'Seluruh medan sasaran kosong — lazim pada bahan teknis (TC) yang didaftarkan tanpa penggunaan berlabel.');
      continue;
    }
    h.entriSasaran++;

    // --- dosis dari kolom ---------------------------------------------------
    const kadarTeks = rapikan(k.kadarPestisida);
    const satuanKolomMentah = rapikan(k.satuanPestisida);
    const satuanKolom = KOSONG_SIMBOLIS.has(kunciLonggar(satuanKolomMentah)) ? '' : satuanKolomMentah;
    let dosisKolom = null;
    let kolomTeks = '';
    if (kadarTeks) {
      const gab = /[A-Za-z%]/.test(kadarTeks) ? kadarTeks : satuanKolom ? `${kadarTeks} ${satuanKolom}` : kadarTeks;
      let d = uraiDosis(gab, false);
      if ((!d || d.tolak) && satuanKolom && /[A-Za-z%]/.test(kadarTeks)) {
        const d2 = uraiDosis(`${kadarTeks} ${satuanKolom}`, false);
        if (d2 && !d2.tolak) d = d2;
      }
      if (d && !d.tolak) {
        dosisKolom = { ...d, teks: kadarTeks, satuan: d.satuan || satuanKolom };
        if (d.diperbaiki) h.perbaikanSatuanGanda++;
      } else if (d && d.tolak === 'kosong-simbolis') {
        // "-", "NA", "TAD": kolomnya terisi tetapi maknanya kosong
      } else {
        kolomTeks = kadarTeks;
        anomali(r, 'kadar-kolom-bukan-angka', kadarTeks,
          `satuanPestisida="${satuanKolomMentah}"; ditolak: ${d ? d.tolak : 'tidak-cocok-pola'}. Teksnya dipertahankan pada dosis_teks.`);
      }
    }

    // --- dosis dari kurung pada namaKomoditas -------------------------------
    let dosisKomoditas = null;
    for (const p of isiKurung(komoditasMentah)) {
      const d = uraiDosis(p, true);
      if (d && !d.tolak) { dosisKomoditas = d; break; }
    }

    // --- baris nama ilmiah ---------------------------------------------------
    const barisLatin = latinMentah.split('\n').map(rapikan).filter((x) => x);
    const daftarSpesies = [];
    const catatan = [];
    barisLatin.forEach((b, n) => {
      const namaIlmiah = tanpaKurung(b);
      if (n === 0 || miripNamaIlmiah(namaIlmiah)) daftarSpesies.push({ baris: b, namaIlmiah, urut: n });
      else {
        catatan.push(b);
        h.barisBukanNamaIlmiah++;
        anomali(r, 'baris-bukan-nama-ilmiah', b, `Baris ke-${n + 1} pada latinHamaKomoditas; tidak dijadikan OPT.`);
      }
    });
    if (daftarSpesies.length === 0) daftarSpesies.push({ baris: '', namaIlmiah: '', urut: 0 });

    const entriSebelum = Boolean(dosisKolom);
    let entriSesudah = false;
    if (entriSebelum) { h.entriDosisSebelum++; produkSebelum = true; }

    daftarSpesies.forEach((sp, idx) => {
      const tambahan = idx > 0;
      let dosisKurung = null;
      for (const p of isiKurung(sp.baris)) {
        const d = uraiDosis(p, true);
        if (d && !d.tolak) {
          dosisKurung = d;
          if (d.diperbaiki) h.perbaikanSatuanGanda++;
          break;
        }
        h.kurungBukanDosis++;
        anomali(r, 'kurung-bukan-dosis', p,
          d && d.tolak ? `Ditolak: ${d.tolak}.` : 'Tidak berbentuk angka + satuan; dibiarkan sebagai keterangan.');
      }

      const urutan = tambahan
        ? [[dosisKurung, 'kurung-latin'], [dosisKolom, 'kolom'], [dosisKomoditas, 'kurung-komoditas']]
        : [[dosisKolom, 'kolom'], [dosisKurung, 'kurung-latin'], [dosisKomoditas, 'kurung-komoditas']];
      let dipilih = null;
      let asal = 'tidak-ada';
      for (const [d, a] of urutan) if (d) { dipilih = d; asal = a; break; }
      if (!dipilih && kolomTeks) asal = 'kolom-teks';

      if (dosisKolom && dosisKurung && (dosisKolom.min !== dosisKurung.min || dosisKolom.maks !== dosisKurung.maks)) {
        h.bentrok++;
        anomali(r, 'dosis-bentrok',
          `kolom="${dosisKolom.teks} ${dosisKolom.satuan}" kurung="${dosisKurung.teks}"`,
          `Komoditas "${komoditasMentah}", OPT "${sp.namaIlmiah || optLabel}". Kolom yang dipakai.`);
      }

      if (asal === 'kolom') h.dosisKolom++;
      else if (asal === 'kurung-latin') h.dosisKurungLatin++;
      else if (asal === 'kurung-komoditas') h.dosisKurungKomoditas++;
      else if (asal === 'kolom-teks') h.dosisKolomTeks++;
      else h.tanpaDosis++;
      if (dipilih) entriSesudah = true;

      // tautan: dari label_uses bila ada padanannya, selebihnya dari kosakata
      const komoditasId = pasanganLu?.commodity?.id || cariId(petaKomoditas, komoditasMentah);
      const optId = !tambahan && pasanganLu?.pest?.id ? pasanganLu.pest.id : cariId(petaOpt, sp.namaIlmiah);
      if (komoditasId) h.komoditasTertaut++;
      if (optId) h.optTertaut++;

      h.barisSasaran++;
      if (tambahan) h.barisTambahan++;
      barisSasaran.push([
        nomor, produkId, nama, rapikan(r.JenisPestisidaNama), rapikan(r.BidangPenggunaanNama),
        komoditasMentah, komoditasId,
        optLabel, sp.namaIlmiah, optId,
        dipilih ? dipilih.teks : kolomTeks,
        dipilih ? dipilih.min : '',
        dipilih ? dipilih.maks : '',
        dipilih ? dipilih.satuan : '',
        satuanKolomMentah,
        asal,
        tambahan ? 'tambahan' : 'utama',
        catatan.join(' | '),
      ]);
    });

    if (entriSesudah) { h.entriDosisSesudah++; produkSesudah = true; }
    adaSasaran = true;
  }
  if (adaSasaran) h.produkPunyaSasaran++;
  if (produkSebelum) h.produkDosisSebelum++;
  if (produkSesudah) h.produkDosisSesudah++;
}

// ---------------------------------------------------------------------------
// Indeks ketersediaan — susunannya dibuat supaya "tidak ada" bisa DIUCAPKAN.
//
// Tiga jawaban berbeda, dan indeks ini memisahkan ketiganya:
//   komoditas tidak ada di `komoditas`  -> registri tidak mengenal komoditas itu
//   OPT tidak ada di `opt`              -> registri tidak mengenal OPT itu
//   keduanya ada, pasangannya tidak ada -> TIDAK ADA pestisida terdaftar untuk
//                                          pasangan itu pada snapshot ini
// ---------------------------------------------------------------------------
const K = { nomor: 0, prd: 1, nama: 2, jenis: 3, kom: 5, komId: 6, opt: 7, latin: 8, optId: 9,
  teks: 10, min: 11, maks: 12, sat: 13, asal: 15 };

// Label yang maknanya kosong tidak boleh jadi kunci. Tanpa penjagaan ini, 228 baris
// yang `latinHamaKomoditas`-nya cuma "-" menyatu di bawah satu kunci `kementan:-`
// dan melahirkan satu "OPT" bergelar tujuh puluh nama yang tidak berhubungan —
// persis penggabungan diam-diam yang tidak boleh terjadi.
const labelBermakna = (s) => (s && !KOSONG_SIMBOLIS.has(kunciLonggar(s)) ? s : '');

const kunciKom = (b) => {
  if (b[K.komId]) return b[K.komId];
  const l = labelBermakna(b[K.kom]);
  return l ? `kementan:${l}` : '';
};
const kunciOpt = (b) => {
  if (b[K.optId]) return b[K.optId];
  const l = labelBermakna(b[K.latin]) || labelBermakna(b[K.opt]);
  return l ? `kementan:${l}` : '';
};

const simpulKom = new Map();
const simpulOpt = new Map();
const pasangan = new Map();

let barisLuarIndeks = 0;
for (const b of barisSasaran) {
  const kk = kunciKom(b);
  const ko = kunciOpt(b);
  if (!kk || !ko) {
    barisLuarIndeks++; // tidak punya komoditas atau tidak punya OPT — tidak bisa jadi pasangan
    continue;
  }
  if (!simpulKom.has(kk)) simpulKom.set(kk, { label: new Set(), produk: new Set(), opt: new Set() });
  if (!simpulOpt.has(ko)) simpulOpt.set(ko, { label: new Set(), latin: new Set(), produk: new Set(), kom: new Set() });
  const sk = simpulKom.get(kk);
  sk.label.add(b[K.kom]);
  sk.produk.add(b[K.prd] || b[K.nomor]);
  sk.opt.add(ko);
  const so = simpulOpt.get(ko);
  if (b[K.opt]) so.label.add(b[K.opt]);
  if (b[K.latin]) so.latin.add(b[K.latin]);
  so.produk.add(b[K.prd] || b[K.nomor]);
  so.kom.add(kk);
  if (!pasangan.has(kk)) pasangan.set(kk, new Map());
  const per = pasangan.get(kk);
  if (!per.has(ko)) per.set(ko, []);
  per.get(ko).push({
    produk: b[K.prd] || '', nomor: b[K.nomor], nama: b[K.nama], jenis: b[K.jenis],
    dosis: b[K.teks], min: b[K.min] === '' ? null : b[K.min], maks: b[K.maks] === '' ? null : b[K.maks],
    satuan: b[K.sat], asal: b[K.asal],
  });
}

const urut = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const objTerurut = (m, f) => {
  const o = {};
  for (const k of [...m.keys()].sort(urut)) o[k] = f(m.get(k), k);
  return o;
};

let jmlPasangan = 0;
for (const per of pasangan.values()) jmlPasangan += per.size;

const indeks = {
  meta: {
    judul: 'Ketersediaan pestisida terdaftar menurut komoditas x OPT',
    sumber: {
      judul: 'Database Pupuk dan Pestisida Terdaftar (PVTPP)',
      penerbit: 'Kementerian Pertanian RI',
      url: 'https://ap-simpel.pertanian.go.id/',
      berkas: 'pukpes_data/raw/pestisida_terdaftar.json',
      tanggal_tarik: TANGGAL_TARIK,
      lisensi: 'CC-BY-SA-4.0',
    },
    dibangun_oleh: 'spec/tools/bangun-sasaran-dosis.mjs',
    arti_ketiadaan:
      `Registri hanya memuat izin yang MASIH BERLAKU pada tanggal tarik. Kunci komoditas yang tidak ada di "komoditas" berarti registri tidak mengenal komoditas itu; hal yang sama berlaku untuk "opt". Bila KEDUANYA ada tetapi pasangannya tidak ada di "pasangan", artinya tegas: tidak ada satu pun pestisida terdaftar untuk OPT itu pada komoditas itu per ${TANGGAL_TARIK}. Ketiadaan itu jawaban, bukan data yang belum lengkap, dan tidak boleh disamakan dengan "belum diperiksa".`,
    peringatan:
      'Ketiadaan izin bukan anjuran memakai produk yang tidak terdaftar, dan bukan pula anjuran memakai produk terdaftar di luar labelnya. Untuk keputusan resmi, verifikasi ke PVTPP.',
    kunci:
      'Kunci berbentuk op:cmd:/op:pst: bila label registri tertaut ke kosakata (dalam_kosakata=true); bila tidak, kunci memakai awalan "kementan:" diikuti label mentah registri. Daftar OPT satu komoditas ada pada kunci-kunci pasangan[komoditas].',
    catatan_dedup:
      `Endpoint registri mengembalikan ${h.rekamanMentah} rekaman untuk ${h.produk} produk: ${h.rekamanKembarDibuang} baris adalah salinan identik dari ${h.idGanda} id yang sama, dan dibuang sebelum pemekaran. Rinciannya per baris ada di sasaran_dosis_anomali.csv dengan jenis "rekaman-kembar-dibuang".`,
    catatan_kunci_kementan:
      'Kunci "kementan:" bukan seluruhnya OPT. Pada produk zat pengatur tumbuh, medan hama registri berisi tujuan pertumbuhan ("Meningkatkan hasil tanaman"), bukan organisme. Saring dengan dalam_kosakata=true bila yang dicari hanya OPT terkurasi.',
    jumlah: {
      rekaman_mentah: h.rekamanMentah,
      rekaman_kembar_dibuang: h.rekamanKembarDibuang,
      produk: h.produk,
      produk_punya_sasaran: h.produkPunyaSasaran,
      baris_sasaran: h.barisSasaran,
      komoditas: simpulKom.size,
      opt: simpulOpt.size,
      pasangan_komoditas_opt: jmlPasangan,
    },
  },
  komoditas: objTerurut(simpulKom, (v, k) => ({
    label: [...v.label].filter((x) => x).sort(urut),
    dalam_kosakata: k.startsWith('op:'),
    jml_produk: v.produk.size,
    jml_opt: v.opt.size,
  })),
  opt: objTerurut(simpulOpt, (v, k) => ({
    label: [...v.label].filter((x) => x).sort(urut),
    nama_ilmiah: [...v.latin].filter((x) => x).sort(urut),
    dalam_kosakata: k.startsWith('op:'),
    jml_produk: v.produk.size,
    jml_komoditas: v.kom.size,
  })),
  pasangan: objTerurut(pasangan, (per) =>
    objTerurut(per, (arr) => [...arr].sort((a, b) => urut(a.produk + a.nomor, b.produk + b.nomor))),
  ),
};

// ---------------------------------------------------------------------------
// Tulis & laporkan
// ---------------------------------------------------------------------------
const berkas = [
  ['sasaran_dosis.csv', csv(
    ['nomor_pendaftaran','produk_id','nama_produk','jenis_pestisida','bidang_penggunaan','komoditas_label','komoditas_id','opt_label','opt_nama_ilmiah','opt_id','dosis_teks','dosis_min','dosis_maks','dosis_satuan','satuan_kolom','dosis_asal','baris_asal','catatan_baris'],
    barisSasaran)],
  ['bahan_aktif_produk.csv', csv(
    ['nomor_pendaftaran','produk_id','nama_produk','jenis_pestisida','urutan','nama_bahan','kadar_bahan','satuan_bahan'],
    barisBahan)],
  ['sasaran_dosis_anomali.csv', csv(
    ['nomor_pendaftaran','nama_produk','jenis_anomali','teks','keterangan'], barisAnomali)],
  ['sasaran_ketersediaan.json', JSON.stringify(indeks, null, 1) + '\n'],
];

const persen = (a, b) => (b ? ((100 * a) / b).toFixed(2) : '0.00');

console.log(`Rekaman mentah dari registri        : ${h.rekamanMentah}`);
console.log(`  salinan kembar dibuang (id sama)  : ${h.rekamanKembarDibuang} dari ${h.idGanda} id, seluruhnya identik byte per byte`);
console.log(`    entri yang ikut terbuang        : ${h.bahanKembarDibuang} bahan aktif, ${h.entriKembarDibuang} komoditas`);
console.log(`Produk pestisida (sesudah dedup)    : ${h.produk}`);
console.log(`  punya daftar sasaran              : ${h.produkPunyaSasaran} (${persen(h.produkPunyaSasaran, h.produk)}%)`);
console.log(`Entri Komoditas mentah              : ${h.entriMentah}`);
console.log(`  entri tanpa sasaran (bahan teknis): ${h.entriTanpaSasaran}`);
console.log(`  entri sasaran                     : ${h.entriSasaran}`);
console.log(`Baris produk x komoditas x OPT      : ${h.barisSasaran}`);
console.log(`  dari baris nama ilmiah tambahan   : ${h.barisTambahan}`);
console.log(`Baris produk x bahan aktif          : ${h.bahan}`);
console.log('');
console.log('CAKUPAN DOSIS NUMERIK — SEBELUM DAN SESUDAH URAI KURUNG');
console.log(`  entri: ${h.entriDosisSebelum} (${persen(h.entriDosisSebelum, h.entriSasaran)}%) -> ${h.entriDosisSesudah} (${persen(h.entriDosisSesudah, h.entriSasaran)}%)  selisih +${h.entriDosisSesudah - h.entriDosisSebelum}`);
console.log(`  produk: ${h.produkDosisSebelum} (${persen(h.produkDosisSebelum, h.produk)}%) -> ${h.produkDosisSesudah} (${persen(h.produkDosisSesudah, h.produk)}%)  selisih +${h.produkDosisSesudah - h.produkDosisSebelum}`);
console.log(`  pembanding: label_uses pada NDJSON punya rate_text pada ${h.labelUsesPunyaRate} dari ${h.labelUsesDipakai} penggunaan (${persen(h.labelUsesPunyaRate, h.labelUsesDipakai)}%)`);
console.log('');
console.log('ASAL DOSIS PADA BARIS KELUARAN');
console.log(`  kolom kadarPestisida              : ${h.dosisKolom}`);
console.log(`  kurung latinHamaKomoditas         : ${h.dosisKurungLatin}`);
console.log(`  kurung namaKomoditas              : ${h.dosisKurungKomoditas}`);
console.log(`  pernyataan teks (bukan angka)     : ${h.dosisKolomTeks}`);
console.log(`  tanpa dosis                       : ${h.tanpaDosis}`);
console.log(`  satuan ditulis dua kali, dirapikan: ${h.perbaikanSatuanGanda}`);
console.log('');
console.log('PENAUTAN KE KOSAKATA');
console.log(`  baris dg komoditas_id             : ${h.komoditasTertaut} (${persen(h.komoditasTertaut, h.barisSasaran)}%)`);
console.log(`  baris dg opt_id                   : ${h.optTertaut} (${persen(h.optTertaut, h.barisSasaran)}%)`);
console.log('');
console.log('INDEKS KETERSEDIAAN');
console.log(`  komoditas                         : ${simpulKom.size}`);
console.log(`  OPT                               : ${simpulOpt.size}`);
console.log(`  pasangan komoditas x OPT          : ${jmlPasangan}`);
console.log(`  baris di luar indeks (tanpa komoditas atau tanpa OPT): ${barisLuarIndeks}`);
console.log('');
console.log('ANOMALI (tercatat, tidak dibuang)');
const perJenis = new Map();
for (const a of barisAnomali) perJenis.set(a[2], (perJenis.get(a[2]) || 0) + 1);
for (const j of [...perJenis.keys()].sort(urut)) console.log(`  ${j.padEnd(34)}: ${perJenis.get(j)}`);
console.log(`  ${'TOTAL'.padEnd(34)}: ${barisAnomali.length}`);
if (prd.catatan) console.log(`\nCatatan: ${prd.catatan}`);

if (!tulis) {
  console.log('\nPeriksa saja. Jalankan dengan --tulis untuk menyimpan ke pukpes_data/:');
  for (const [n, isi] of berkas) console.log(`  ${n.padEnd(32)} ${(Buffer.byteLength(isi) / 1024).toFixed(1)} KB`);
} else {
  for (const [n, isi] of berkas) {
    writeFileSync(join(KELUAR, n), isi);
    console.log(`Ditulis: pukpes_data/${n} (${(Buffer.byteLength(isi) / 1024).toFixed(1)} KB)`);
  }
}
