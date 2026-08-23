// Menyusun spec/vocab/padanan-bahan-aktif.json — tabel padanan dari TULISAN bahan aktif
// pada registri Kementan ke identitas kimia yang bisa di-join, beserta JENIS HUBUNGANNYA.
//
// ---------------------------------------------------------------------------
// Kenapa berkas ini ada, padahal sudah ada substance-pestisida.json
// ---------------------------------------------------------------------------
// substance-pestisida.json memuat SATU ENTITAS PER EJAAN REGISTRI. Ia sudah menyatukan
// 307 ejaan kembar lewat lifecycle.superseded_by, dan itu benar. Tetapi penyatuan itu
// datar: ia hanya bisa mengatakan "dua tulisan ini bahan yang sama". Ia tidak bisa
// mengatakan "parakuat diklorida adalah GARAM DARI parakuat" — dan justru pembedaan itu
// yang menentukan benar-salahnya pemeriksaan larangan dan pembandingan terhadap MRL:
//
//   * Larangan atas parakuat harus mengenai parakuat diklorida.  (butuh induk)
//   * MRL dinyatakan dalam bentuk asam/ion, sedangkan label menuliskan kadar garam.
//     276 g/l garam = 200 g/l ion.                               (butuh faktor)
//   * Rotasi anti-resistensi dihitung per bahan, bukan per garam. (butuh induk)
//
// Bentuk yang bisa menyatakan itu — relasi bertipe, tidak simetris, plus faktor
// kesetaraan — tidak muat di `mappings` (enumnya SKOS: exact/close/broad/narrow/related)
// dan TIDAK BOLEH masuk `synonyms`, yang di repositori ini berarti salah ketik registri.
// Karena itu ia berkas tersendiri yang MENUNJUK substance-pestisida.json, bukan saingannya.
//
// ---------------------------------------------------------------------------
// Dari mana buktinya
// ---------------------------------------------------------------------------
// Seluruhnya dari registri Kementan sendiri. Tidak ada daftar nama milik pihak lain yang
// disalin ke berkas ini. Registri ternyata menyebutkan nama internasionalnya sendiri di
// dalam kurung, dan menyatakan kesetaraan garam→induk berikut angkanya:
//
//   "Sipermetrin (cypermethrin)"                        -> glosa: nama internasional
//   "Terbutryn (ISO)"                                   -> penanda: kepalanya nama ISO
//   "Parakuat diklorida (setara dengan ion parakuat : 200 g/l)"
//        + kadarBahan 276 g/l pada formulasi yang sama  -> induk + faktor 0,7246
//
// Empat jalur bukti, dan tiap baris membawa jalurnya sendiri di medan `dasar`:
//
//   deklarasi-registri     nama di dalam kurung yang ditulis registri
//   deklarasi-setara       klausa "setara dengan X" pada tulisan itu sendiri
//   deklarasi-setara-transitif  klausa itu ada pada tulisan lain yang nama kirinya sama
//   gugus-dipelajari       gugus garam/ester yang diajarkan klausa setara di tempat lain
//   gugus-dikurasi         counter-ion/gugus ester yang tidak pernah diajarkan satu pun
//                          klausa setara, dikurasi tangan di GUGUS_TANGAN dengan alasan
//                          per baris. Bukan padanan nama: ia hanya menyatakan rentang
//                          token mana yang counter-ion, dan nama induknya tetap wajib
//                          datang dari deklarasi registri
//   ejaan                  pelipatan ortografis ke nama yang sudah dideklarasikan registri
//   ejaan-arah             dua ejaan registri untuk bahan yang sama; yang internasional
//                          dipilih karena memuat huruf sumber yang ejaan Indonesia ganti
//   stereodeskriptor       awalan isomer pada nama induk yang terdaftar tersendiri
//
// Yang tidak punya salah satu dari itu DIBIARKAN KOSONG dengan alasan tertulis. Tidak ada
// pencocokan dengan jarak edit, kemiripan, atau tebakan struktur — satu kesetaraan yang
// salah di tabel ini menjalar ke pemeriksaan larangan, ke MRL, dan ke nasihat rotasi.
//
// Jalankan:
//   node tools/susun-padanan-bahan-aktif.mjs [--laporan]      susun ulang tabelnya
//   node tools/susun-padanan-bahan-aktif.mjs --periksa [potret.json]
//                                                            sebutkan tulisan yang belum
//                                                            punya rekaman; keluar 1 bila ada
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RAW = join(AKAR, 'pukpes_data', 'raw', 'pestisida_terdaftar.json');
const ZAT = join(AKAR, 'spec', 'vocab', 'substance-pestisida.json');
const KELUAR = join(AKAR, 'spec', 'vocab', 'padanan-bahan-aktif.json');
const TARIKAN = '2026-08-19';

// ===========================================================================
// 1. Pelipatan ortografis
// ===========================================================================
// Satu-satunya transformasi yang dipakai untuk menyamakan dua ejaan. Aturannya ditulis
// satu per satu supaya bisa dibantah satu per satu. Dua nama hanya dianggap satu bila
// hasil lipatnya SAMA PERSIS; tidak ada ambang kemiripan di mana pun berkas ini.
//
// Arahnya searah: ejaan Indonesia untuk nama pestisida menurunkan ejaan internasional
// dengan mengganti ph->f, ch->k, th->t, c->k/s, y->i, x->ks, qu->ku, dan melepas -e
// akhir. Sifat searah itu yang dipakai `ejaan-arah` untuk memilih mana yang internasional.
// Ciri KUAT: penggantian yang ejaan Indonesia lakukan secara sistematis pada nama
// pestisida. Ciri LEMAH: -e akhir, yang sama mungkinnya jadi salah ketik.
const CIRI_KUAT = [[/ph/, 'ph'], [/ch/, 'ch'], [/th/, 'th'], [/qu/, 'qu'], [/x/, 'x'], [/y/, 'y'], [/c/, 'c']];
const CIRI_LEMAH = [[/e$/, 'e akhir']];
export function skel(s) {
  let x = String(s).toLowerCase().trim();
  x = x.normalize('NFKD').replace(/[̀-ͯ]/g, '');
  x = x.replace(/[\s\-_.']/g, '');
  x = x.replace(/ph/g, 'f');
  x = x.replace(/ch/g, 'k');
  x = x.replace(/th/g, 't');
  x = x.replace(/qu/g, 'kw');
  x = x.replace(/x/g, 'ks');
  x = x.replace(/c(?=[eiy])/g, 's');
  x = x.replace(/c/g, 'k');
  x = x.replace(/y/g, 'i');
  x = x.replace(/w/g, 'v');
  x = x.replace(/u(?=[aeio])/g, 'v');
  x = x.replace(/(.)\1+/g, '$1');
  x = x.replace(/e$/g, '');
  // Akhiran -ide/-ida: bahasa Indonesia menambahkan -a pada akhiran -id yang sudah
  // terbentuk setelah -e dilepas. "copper oxide" -> oksid, "tembaga oksida" -> oksid.
  x = x.replace(/da$/g, 'd');
  return x.replace(/[^a-z0-9,]/g, '');
}
const ciriKuat = (s) => CIRI_KUAT.filter(([re]) => re.test(String(s).toLowerCase())).map(([, n]) => n);
const ciriLemah = (s) => CIRI_LEMAH.filter(([re]) => re.test(String(s).toLowerCase())).map(([, n]) => n);

// Pemenggalan kata. Tanda hubung memisahkan, KECUALI yang mengikat locant ke huruf
// golongan: "2,4-d" satu token, "metsulfuron-methyl" dua.
export function tokenisasi(s) {
  const kasar = String(s).toLowerCase().split(/[\s\-]+/).map((t) => t.replace(/^[,.:;()]+|[,.:;()]+$/g, '')).filter(Boolean);
  const out = [];
  for (const t of kasar) {
    if (out.length && /^[\d,.]+$/.test(out[out.length - 1]) && /^[a-z]$/.test(t)) out[out.length - 1] += '-' + t;
    else out.push(t);
  }
  return out;
}

// ===========================================================================
// 2. Pembedah tulisan
// ===========================================================================
const rapikan = (s) => String(s).toLowerCase().replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const SATUAN = String.raw`g\s*\/\s*l(?:t|iter|tr)?|gr\s*\/\s*l|g\s*\/\s*kg|mg\s*\/\s*l|%|ppm`;
const RE_ANGKA = new RegExp(String.raw`(\d+(?:[.,]\d+)?)\s*(${SATUAN})`, 'gi');
const RE_SETARA = /\b(setara(?:\s+dengan)?|equivalent|equivalen)\b/i;
const satuanBaku = (u) => rapikan(u).replace(/\s+/g, '').replace(/^gr\/l$|^g\/lt$|^g\/ltr$|^g\/liter$/, 'g/l');

// Isi kurung yang BUKAN keterangan melainkan bagian nama. Enam saringan, tiap satunya
// lahir dari tulisan nyata:
//   * kurung tanpa spasi di depannya                "1,2-benzisothiasol-3(2h)-one"
//   * awalan perkalian sebelum kurung               "iminoctadine tris (albesilate)"
//   * teks lanjut menempel sesudah kurung tutup     "1,3-bis (hydroxymethyl)-5,5-dimetil..."
//   * kepala berlokant dan isinya berangka          "1,2-propandiol,3- (4-chlorophenoxy)"
//   * kalimat, bukan nama                           "asam asetat (dihasilkan dari proses...)"
//   * tidak ada satu pun deret tiga huruf           "(a4+a7)", "(3:1)"
const PERKALIAN = new Set(['tris', 'bis', 'tetrakis', 'pentakis', 'heksakis']);
// Awalan penanda isomer. Ditulis sekali di sini karena dipakai dua kali: menahan kamus
// token supaya tidak menyamakan dua isomer, dan mengenali hubungan stereoisomer-dari.
const STEREO_KATA = new Set(['alfa', 'alpha', 'beta', 'gamma', 'gama', 'lambda', 'lamda', 'teta', 'theta', 'zeta', 'sigma', 'es', 'cis', 'trans', 's', 'd', 'l', 'r', 'p', 'dl']);
const RE_PROSA = /\b(dari|dengan|proses|dihasilkan|melalui|dan lain|hasil|berasal|kandungan)\b/;
function glosaSah(sebelum, isi, sesudah) {
  // Klausa kesetaraan selalu keterangan, apa pun bentuknya.
  if (RE_SETARA.test(isi)) return true;
  const kiri = rapikan(sebelum);
  const tokKiri = tokenisasi(kiri);
  if (PERKALIAN.has(tokKiri[tokKiri.length - 1])) return false;
  if (/^[-a-z0-9]/i.test(sesudah)) return false;
  if (!/[a-z]{3}/.test(isi)) return false;
  if (RE_PROSA.test(isi)) return false;
  if (tokenisasi(isi).length > 5) return false;
  if (isSistematis(kiri) && /\d/.test(isi)) return false;
  // Angka yang berdiri sendiri di dalam kurung adalah kode kemasan atau kadar, bukan nama:
  // "butyl, 3-iodo-2-propynyl ester (IPBC 100)".
  if (tokenisasi(isi).some((t) => /^[\d.,]+$/.test(t))) return false;
  return true;
}

// Kurung hanya dihitung keterangan bila DIDAHULUI SPASI dan lolos glosaSah(); yang tidak
// lolos dikembalikan utuh ke nama, supaya "asam giberelat (a4+a7)" tidak melipat jadi
// "asam giberelat" dan kehilangan keterangan isomernya.
function belah(teks) {
  const luar = []; const dalam = [];
  let depth = 0; let buf = ''; let dalamBuf = ''; let mulai = -1;
  const tutup = (i) => {
    const isi = rapikan(dalamBuf);
    if (glosaSah(buf, isi, teks.slice(i + 1))) { luar.push(buf); dalam.push(isi); buf = ''; }
    else buf += teks.slice(mulai, i + 1);
    dalamBuf = ''; depth = 0;
  };
  for (let i = 0; i < teks.length; i++) {
    const ch = teks[i];
    if (ch === '(') {
      if (depth === 0) {
        if (/\s/.test(i === 0 ? ' ' : teks[i - 1])) { mulai = i; depth = 1; dalamBuf = ''; continue; }
        buf += ch; continue;
      }
      depth++; dalamBuf += ch; continue;
    }
    if (ch === ')') {
      if (depth === 1) { tutup(i); continue; }
      if (depth > 1) { depth--; dalamBuf += ch; continue; }
      buf += ch; continue;
    }
    if (depth === 0) buf += ch; else dalamBuf += ch;
  }
  if (depth > 0) tutup(teks.length);
  luar.push(buf);
  return { luar: luar.map(rapikan).filter(Boolean), dalam: dalam.filter(Boolean) };
}
const angkaDari = (t) => [...String(t).matchAll(RE_ANGKA)].map((m) => ({ value: Number(m[1].replace(',', '.')), unit: satuanBaku(m[2]) }));
const bersih = (t) => rapikan(String(t).replace(RE_ANGKA, ' ').replace(/[:;]/g, ' ').replace(/^[\s,.\-]+|[\s,.\-]+$/g, ' '));

function urai(tulisan) {
  const t = rapikan(tulisan);
  const { luar, dalam } = belah(t);
  const kurungSetara = dalam.filter((d) => RE_SETARA.test(d));
  const glosa = dalam.filter((d) => !RE_SETARA.test(d));
  const batang = luar.join(' ');
  let kiri = batang; let kanan = '';
  const m = batang.match(RE_SETARA);
  if (m) { kiri = batang.slice(0, m.index); kanan = batang.slice(m.index + m[0].length); }
  for (const ks of kurungSetara) { const mm = ks.match(RE_SETARA); kanan = `${kanan} ${ks.slice(mm.index + mm[0].length)}`.trim(); }
  const kananPecah = belah(kanan);
  return {
    tulisan: t,
    kiri_nama: bersih(kiri), kiri_angka: angkaDari(kiri),
    kanan_nama: bersih(kananPecah.luar.join(' ')), kanan_angka: angkaDari(kanan),
    glosa: glosa.map(bersih).filter(Boolean),
    glosa_induk: kananPecah.dalam.filter((d) => !RE_SETARA.test(d)).map(bersih).filter(Boolean),
    ada_setara: Boolean(m) || kurungSetara.length > 0,
  };
}

const adaHuruf = (s) => /[a-z]{3}/.test(s);
// Singkatan: pendek, atau tanpa huruf hidup sama sekali. "BPMC", "MIT", "SfMNPV" ya;
// "sulfur" tidak, walau enam huruf.
const isSingkatan = (s) => {
  const x = String(s).trim();
  return /^[a-z]{2,5}$/.test(x) || /^[bcdfghjklmnpqrstvwxz]{3,8}$/.test(x);
};
const RE_SISTEMATIS = /(^\d)|(^[a-z]-\d)|\b\d[,\-]\d|\bn-|isothiaz|isothiozo|benzimidazol|-yl\b|-one\b|-ate\b|-diol\b|urea\b|carbamate|phosphonic|propanediol|mixture of|\bether\b|imidazolidine|tetraaza|hydroxymethyl/;
const isSistematis = (s) => RE_SISTEMATIS.test(s) && !/^\d[,.]\d[,\-]?\d?-[a-z]{1,2}\b/.test(s);

// ===========================================================================
// 3. Muat sumber
// ===========================================================================
// --periksa [potret.json] — bandingkan tabel yang sudah ada dengan sebuah potret registri,
// lalu SEBUTKAN tulisan yang belum punya rekaman. Ada karena registrinya bergerak: dalam
// rentang 19–23 Agustus 2026 saja 83 formulasi berubah medan bahanAktif, dan 16 di
// antaranya menumbuhkan varian kapitalisasi baru. Tanpa langkah ini tulisan baru akan
// jatuh ke celah tanpa satu pun tanda; keluar dengan kode 1 supaya bisa dipakai di CI.
if (process.argv.includes('--periksa')) {
  const i = process.argv.indexOf('--periksa');
  const potret = process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : RAW;
  if (!existsSync(KELUAR)) { console.error(`Tabel ${KELUAR} belum ada. Jalankan penyusunnya lebih dulu.`); process.exit(1); }
  const tabel = JSON.parse(readFileSync(KELUAR, 'utf8'));
  const dikenal = new Map(tabel.padanan_items.map((r) => [r.kunci, r]));
  const isi = readFileSync(potret, 'utf8');
  const baru = new Map(); let formulasi = 0;
  for (const p of JSON.parse(isi)) {
    formulasi++;
    let arr; try { arr = JSON.parse(p.bahanAktif || '[]'); } catch { continue; }
    for (const b of arr) {
      const asli = String(b.namaBahan ?? '').trim();
      if (!asli) continue;
      const k = rapikan(asli);
      if (dikenal.has(k)) { dikenal.get(k)._ada = true; continue; }
      if (!baru.has(k)) baru.set(k, { k, n: 0, tulisan: new Set() });
      const e = baru.get(k); e.n++; e.tulisan.add(asli);
    }
  }
  const hilang = tabel.padanan_items.filter((r) => !r._ada);
  console.log(`Potret   : ${potret}`);
  console.log(`           ${formulasi} formulasi, sha256:${createHash('sha256').update(isi).digest('hex').slice(0, 16)}…`);
  console.log(`Tabel    : ${tabel.padanan_items.length} kunci (potret ${tabel.padanan?.potret?.tarikan ?? '?'})`);
  console.log(`Baru     : ${baru.size} kunci belum punya rekaman`);
  console.log(`Menghilang: ${hilang.length} kunci tidak lagi muncul di potret ini (rekamannya TIDAK dihapus — tulisan lama tetap harus bisa dicocokkan)`);
  for (const e of [...baru.values()].sort((a, b) => b.n - a.n)) console.log(`  + ${String(e.n).padStart(4)}  ${JSON.stringify(e.k)}   teramati sebagai: ${[...e.tulisan].map((x) => JSON.stringify(x)).join(', ')}`);
  if (baru.size) {
    console.log('\nJalankan ulang penyusunnya terhadap potret ini supaya tulisan baru itu punya rekaman —');
    console.log('berikut alasannya bila memang tidak terpetakan. Jangan biarkan tanpa rekaman.');
    process.exit(1);
  }
  console.log('\nTidak ada tulisan baru: seluruh potret ini tercakup tabel.');
  process.exit(0);
}

const zat = JSON.parse(readFileSync(ZAT, 'utf8'));
const mentahRaw = readFileSync(RAW, 'utf8');
const registri = JSON.parse(mentahRaw);
const potretHash = createHash('sha256').update(mentahRaw).digest('hex');

const byId = new Map(zat.items.map((i) => [i.id, i]));
const idxZat = new Map();
for (const it of zat.items) {
  for (const k of new Set([it.label?.id, it.key, ...(it.synonyms ?? []), ...(it.mappings ?? []).map((m) => m.id)].filter(Boolean).map(rapikan))) {
    if (!idxZat.has(k)) idxZat.set(k, it);
  }
}
const hidup = (it) => { let c = it; let h = 0; while (c?.lifecycle?.status === 'superseded' && c.lifecycle.superseded_by?.id && h++ < 10) c = byId.get(c.lifecycle.superseded_by.id) ?? c; return c; };
const entitasDari = (t) => { const it = idxZat.get(rapikan(t)); return it ? hidup(it) : null; };
const ref = (e) => (e ? { id: e.id, label: e.label?.id ?? e.key } : undefined);

// Tulisan unik + kadar yang menyertainya.
// `kunci` = tulisan mentah yang huruf besar/kecil dan spasinya diseragamkan. Hanya itu.
// Pelipatan ortografis yang lebih dalam dipakai untuk MENCARI padanan, tidak pernah untuk
// membentuk kunci — kalau kunci ikut dilipat, dua bahan yang berbeda bisa bertabrakan di
// satu baris dan tidak ada yang menyalak.
const tally = new Map();
const kadar = new Map();
const mentahUnik = new Set();
for (const p of registri) {
  let arr; try { arr = JSON.parse(p.bahanAktif || '[]'); } catch { continue; }
  for (const b of arr) {
    const asli = String(b.namaBahan ?? '').trim();
    if (!asli) continue;
    mentahUnik.add(asli);
    const k = rapikan(asli);
    const t = tally.get(k) ?? { k, n: 0, tulisan: new Set() };
    t.n++; t.tulisan.add(asli.replace(/\s+/g, ' ').trim());
    tally.set(k, t);
    const v = Number(String(b.kadarBahan ?? '').replace(',', '.'));
    if (Number.isFinite(v) && v > 0) {
      if (!kadar.has(k)) kadar.set(k, []);
      kadar.get(k).push({ value: v, unit: satuanBaku(b.satuanBahan || '') });
    }
  }
}
const daftar = [...tally.values()].sort((a, b) => b.n - a.n || a.k.localeCompare(b.k));
const uraiSemua = new Map(daftar.map((o) => [o.k, urai(o.k)]));
const namaKiriDari = (o) => uraiSemua.get(o.k).kiri_nama || o.k;
const skelHadir = new Set(daftar.map((o) => skel(namaKiriDari(o))));

// ===========================================================================
// 4. Deklarasi yang dibuat registri sendiri
// ===========================================================================
const PENANDA = new Set(['iso', 'ansi', 'bsi', 'jmaf']);
// Glosa yang SENGAJA ditolak. Tiap baris keputusan yang bisa dibantah, jadi ia berdiri
// terlihat di sini alih-alih hilang di dalam penyaring.
const GLOSA_DITOLAK = new Map([
  ['dimehipo||bisultap', 'Registri menuliskan keduanya sebagai satu nama, tetapi keduanya bahan berbeda: dimehipo adalah tiosultap-dinatrium dan bisultap tiosultap-mononatrium — dua garam berbeda dari asam yang sama. Tidak dijadikan padanan.'],
  ['abamektin||avermectin b1a+ avermectin b1b', 'Kurungnya menyebut susunan campurannya, bukan nama lain. Abamektin memang campuran avermektin B1a dan B1b; itu keterangan komposisi.'],
  ['dimethicone||silicone oil', 'Kurungnya menyebut golongan bahan, bukan nama umum yang bisa di-join.'],
  ['ethephon||2-chloroethyl phosphonic acid', 'Kurungnya menyebut nama sistematis; arah glosanya terbalik dan kepalanya yang justru nama umum.'],
]);

const glosaMentah = [];
for (const o of daftar) {
  const u = uraiSemua.get(o.k);
  const kepala = u.kiri_nama || u.kanan_nama;
  for (const g of u.glosa) if (adaHuruf(g) && kepala) glosaMentah.push({ kepala, glosa: g, tulisan: o.k, n: o.n });
  for (const g of u.glosa_induk) if (adaHuruf(g) && u.kanan_nama) glosaMentah.push({ kepala: u.kanan_nama, glosa: g, tulisan: o.k, n: o.n });
}

// Kamus token yang DIPELAJARI: pasangan glosa yang seluruh tokennya cocok kecuali satu
// mengajarkan padanan token itu. Minimal dua token, supaya sisa yang tak berpasangan
// benar-benar dikelilingi bukti — "dimehipo (bisultap)" bertoken satu dan tidak
// mengajarkan apa pun.
const kamusCalon = new Map();
for (const g of glosaMentah) {
  const A = tokenisasi(g.kepala); const B = tokenisasi(g.glosa);
  if (A.length !== B.length || A.length < 2 || A.length > 3) continue;
  const sisaB = [...B]; const sisaA = [];
  for (const a of A) { const i = sisaB.findIndex((b) => skel(a) === skel(b)); if (i >= 0) sisaB.splice(i, 1); else sisaA.push(a); }
  if (sisaA.length !== 1 || sisaB.length !== 1 || skel(sisaA[0]) === skel(sisaB[0])) continue;
  // Token sisa tidak boleh berupa huruf tunggal: "haloksifop-r-metil
  // (haloxyfop-p-methyl)" akan mengajarkan r=p, dan sesudah itu seluruh isomer R dan P di
  // berkas ini tertukar diam-diam. Dua stereodeskriptor hanya boleh dipasangkan bila
  // ejaannya memang berdekatan — "lamda"/"lambda" satu penanda yang sama dengan satu
  // huruf hilang, sedangkan "r"/"p" dua penanda yang berlainan.
  if ([sisaA[0], sisaB[0]].some((t) => t.length <= 2)) continue;
  if (STEREO_KATA.has(sisaA[0]) && STEREO_KATA.has(sisaB[0]) && skel(sisaA[0]).slice(0, 3) !== skel(sisaB[0]).slice(0, 3)) continue;
  const k = `${skel(sisaA[0])}||${skel(sisaB[0])}`;
  if (!kamusCalon.has(k)) kamusCalon.set(k, { a: sisaA[0], b: sisaB[0], n: 0, bukti: g.tulisan });
  kamusCalon.get(k).n += g.n;
}
const kamus = new Map(); // skel(indonesia) -> Set(skel(asing)) dua arah
const catatKamus = (x, y) => { if (!kamus.has(x)) kamus.set(x, new Set()); kamus.get(x).add(y); };
for (const e of kamusCalon.values()) { catatKamus(skel(e.a), skel(e.b)); catatKamus(skel(e.b), skel(e.a)); }
const tokenSama = (a, b) => skel(a) === skel(b) || (kamus.get(skel(a))?.has(skel(b)) ?? false);
// Sama sebagai HIMPUNAN token — menampung pembalikan urutan yang jadi ciri nama ISO:
// "metil metsulfuron" vs "metsulfuron-methyl", "natrium bispiribak" vs "bispyribac sodium".
function tokenMultisetSama(a, b) {
  const A = tokenisasi(a); const B = [...tokenisasi(b)];
  if (!A.length || A.length !== B.length) return false;
  for (const x of A) { const i = B.findIndex((y) => tokenSama(x, y)); if (i < 0) return false; B.splice(i, 1); }
  return true;
}
const prefiksSama = (a, b) => {
  const x = skel(a); const y = skel(b); const n = Math.min(x.length, y.length);
  let i = 0; while (i < n && x[i] === y[i]) i++;
  return i >= Math.max(4, Math.floor(n * 0.6));
};

// Klasifikasi tiap glosa; hanya sebagian yang boleh jadi nama kanonik.
const anchor = new Map(); // skel -> { nama, kutipan, dasar, perlu_tinjau }
const catatAnchor = (n, kutipan, dasar, perluTinjau) => {
  const k = skel(n);
  if (!k || k.length < 3) return;
  const lama = anchor.get(k);
  if (lama && !(lama.perlu_tinjau && !perluTinjau)) return;
  anchor.set(k, { nama: n, kutipan, dasar, perlu_tinjau: Boolean(perluTinjau) });
};
const glosa = [];
for (const g of glosaMentah) {
  const { kepala, glosa: gl } = g;
  const tandai = (jenis, extra) => { glosa.push({ ...g, jenis, ...extra }); };
  if (PENANDA.has(gl)) { catatAnchor(kepala, g.tulisan, 'deklarasi-registri'); tandai('penanda-nama-umum'); continue; }
  const kunci = `${kepala}||${gl}`;
  if (GLOSA_DITOLAK.has(kunci)) { tandai('ditolak', { alasan: GLOSA_DITOLAK.get(kunci) }); continue; }
  if (isSingkatan(gl) && !prefiksSama(kepala, gl)) { tandai('singkatan'); continue; }
  if (skel(kepala) === skel(gl) || tokenMultisetSama(kepala, gl)) {
    // Arah glosanya tidak selalu Indonesia->internasional. Registri juga menulis
    // "sihalofop butil (butil sihalofop)" dan "florpyrauxifen-benzyl (benzil
    // florpirauksifen)" — dua-duanya mengurung yang JUSTRU lebih Indonesia. Yang dipilih
    // sisi yang memuat ciri kuat lebih banyak, bukan sisi yang kebetulan di dalam kurung.
    const asing = ciriKuat(gl).length >= ciriKuat(kepala).length ? gl : kepala;
    catatAnchor(asing, g.tulisan, 'deklarasi-registri');
    // Nama majemuk juga mengajarkan tiap katanya. "parakuat diklorida (paraquat
    // dichloride)" menyatakan parakuat=paraquat sekaligus diklorida=dichloride, dan
    // yang pertama itulah nama induk yang dibutuhkan baris garamnya. Hanya pasangan
    // yang lipatannya IDENTIK yang diambil — klaimnya murni ortografis.
    if (tokenisasi(kepala).length > 1) {
      const sisa = [...tokenisasi(gl)];
      for (const a of tokenisasi(kepala)) {
        const i = sisa.findIndex((b) => skel(a) === skel(b));
        if (i < 0) continue;
        const b = sisa.splice(i, 1)[0];
        if (b.length > 3) catatAnchor(b, g.tulisan, 'deklarasi-registri');
      }
    }
    tandai('ejaan'); continue;
  }
  if (isSistematis(kepala) && !isSistematis(gl)) { catatAnchor(gl, g.tulisan, 'deklarasi-registri'); tandai('sistematis-ke-umum'); continue; }
  if (isSistematis(gl) && !isSistematis(kepala)) { tandai('glosa-sistematis'); continue; }
  if (isSistematis(gl) && isSistematis(kepala)) { tandai('sistematis-ke-sistematis'); continue; }
  if (prefiksSama(kepala, gl)) { catatAnchor(gl, g.tulisan, 'deklarasi-registri'); tandai('ejaan-berimbuhan'); continue; }
  // Sebagian tokennya berpasangan — "dimetil amina glifosat" vs "dimethylammonium
  // glyphosate" bertemu pada glifosat/glyphosate. Cukup untuk memastikan keduanya bicara
  // tentang bahan yang sama, walau cacah tokennya berbeda.
  const adaTokenBersama = tokenisasi(kepala).some((a) => a.length > 3 && tokenisasi(gl).some((b) => tokenSama(a, b)));
  if (adaTokenBersama) { catatAnchor(gl, g.tulisan, 'deklarasi-registri'); tandai('ejaan-sebagian'); continue; }
  // Registri menyatakannya, tetapi tidak ada satu pun ciri ortografis yang mengiyakan.
  // Tetap dipakai — sumbernya registri — tapi ditandai supaya bisa ditinjau orang.
  catatAnchor(gl, g.tulisan, 'deklarasi-registri', true);
  tandai('tanpa-korroborasi');
}

// Anchor cadangan: nama majemuk yang KATA-KATANYA sama tetapi urutannya dibalik.
// "butil sihalofop" dan "sihalofop butil" satu bahan yang sama; registri menulis
// keduanya. Hanya dipakai sesudah pencarian berdasarkan lipatan persis gagal, dan hanya
// untuk nama bertoken lebih dari satu.
const kunciUrutan = (n) => tokenisasi(n).map(skel).sort().join('|');
const anchorUrutan = new Map();
const isiAnchorUrutan = () => {
  anchorUrutan.clear();
  for (const a of anchor.values()) {
    if (tokenisasi(a.nama).length < 2) continue;
    const k = kunciUrutan(a.nama);
    if (!anchorUrutan.has(k)) anchorUrutan.set(k, a);
  }
};

// `ejaan-arah`: beberapa tulisan registri yang melipat ke bentuk yang SAMA PERSIS — jadi
// bahan yang sama, bukan bahan yang mirip. Di antaranya, yang memuat huruf sumber yang
// ejaan Indonesia gantikan adalah bentuk internasionalnya. Syaratnya ketat: harus ada
// setidaknya satu varian TANPA ciri kuat sama sekali (bukti pelipatan memang terjadi di
// sini), dan calonnya diambil dari yang ciri kuatnya terbanyak. Kalau masih seri,
// tiebreaker-nya sama dengan konvensi penyeragaman nama principal: paling sering muncul,
// lalu terpendek, lalu abjad — semata supaya hasilnya deterministik.
const perSkel = new Map();
for (const o of daftar) { const s = skel(namaKiriDari(o)); if (!perSkel.has(s)) perSkel.set(s, []); perSkel.get(s).push(o); }
for (const [s, grup] of perSkel) {
  if (anchor.has(s)) continue;
  const bobot = new Map();
  for (const o of grup) bobot.set(namaKiriDari(o), (bobot.get(namaKiriDari(o)) ?? 0) + o.n);
  const varian = [...bobot.keys()];
  if (varian.length < 2) continue;
  if (!varian.some((v) => ciriKuat(v).length === 0)) continue;
  const maks = Math.max(...varian.map((v) => ciriKuat(v).length));
  if (maks === 0) continue;
  const calon = varian.filter((v) => ciriKuat(v).length === maks)
    .sort((a, b) => ciriLemah(a).length - ciriLemah(b).length || bobot.get(b) - bobot.get(a) || a.length - b.length || a.localeCompare(b));
  const pilih = calon[0];
  const lain = varian.filter((v) => v !== pilih);
  catatAnchor(pilih, `Registri memuat "${varian.join('", "')}" untuk bahan yang sama; "${pilih}" dipilih karena memuat ${ciriKuat(pilih).join(', ')} yang ejaan Indonesia gantikan, sedangkan "${lain.join('", "')}" tidak.`, 'ejaan-arah');
}

// Klausa setara: anak -> induk.
const setara = [];
for (const o of daftar) {
  const u = uraiSemua.get(o.k);
  if (!u.ada_setara || !u.kanan_nama) continue;
  const induk = tokenisasi(u.kanan_nama)
    .filter((t) => !['ion', 'aktif', 'active', 'equivalent', 'equivalen', 'asam', 'acid'].includes(t) && !/^[\d,.]+$/.test(t))
    .join(' ');
  if (!induk || !adaHuruf(induk) || !u.kiri_nama) continue;
  if (skel(induk) === skel(u.kiri_nama)) continue;
  setara.push({ anak: u.kiri_nama, induk, tulisan: o.k, n: o.n, u });
}
const setaraByAnak = new Map();
for (const s of setara) { const k = skel(s.anak); if (!setaraByAnak.has(k)) setaraByAnak.set(k, []); setaraByAnak.get(k).push(s); }

// Gugus garam/ester yang diajarkan klausa setara: token anak dikurangi token induk.
const ESTER = /(^|\s)(ester|butotil|butoksi|butoksil|butoxy|meptil|meptyl|heptil|heptyl|etil|ethyl|metil|methyl|butil|butyl|benzil|benzyl)(\s|$)/;
const STEREO = STEREO_KATA;
const jenisGugus = (g) => (ESTER.test(` ${g} `) ? 'ester' : 'garam');
const gugusCalon = new Map();
const catatGugus = (g, induk, n, bukti) => {
  if (!adaHuruf(g)) return;
  if (skel(induk).includes(skel(g)) || skel(g).includes(skel(induk))) return;
  const k = skel(g);
  if (!gugusCalon.has(k)) gugusCalon.set(k, { gugus: g, jenis: jenisGugus(g), n: 0, bukti, induk: new Set() });
  const e = gugusCalon.get(k); e.n += n; e.induk.add(induk);
};
const kupas = (nama, induk) => {
  const sisa = [...tokenisasi(nama)];
  for (const b of tokenisasi(induk)) { const i = sisa.findIndex((a) => skel(a) === skel(b)); if (i >= 0) sisa.splice(i, 1); else return null; }
  return sisa.length ? sisa.join(' ') : null;
};
for (const s of setara) {
  const g = kupas(s.anak, s.induk);
  if (g) catatGugus(g, s.induk, s.n, s.tulisan);
}
// Sisi glosa mengajarkan gugus yang sama dalam ejaan internasional. "parakuat diklorida
// (paraquat dichloride)" mengajarkan gugus "dichloride" begitu tulisan lain sudah
// menyatakan bahwa parakuat diklorida adalah garam dari parakuat. Bentuk itulah yang
// dipakai pendaftaran yang menulis namanya dalam bahasa Inggris, dan tanpa langkah ini
// separuh baris berbahasa Inggris kehilangan induknya.
for (const o of daftar) {
  const u = uraiSemua.get(o.k);
  if (!u.glosa.length) continue;
  const kiriNama = u.kiri_nama || o.k;
  const punya = setaraByAnak.get(skel(kiriNama));
  if (!punya?.length) continue;
  const induk = [...punya].sort((a, b) => b.n - a.n)[0].induk;
  for (const gl of u.glosa) {
    const gg = kupas(gl, induk);
    if (gg) catatGugus(gg, induk, o.n, o.k);
  }
}
// Gugus yang TIDAK pernah diajarkan satu pun klausa setara, dan karena itu dikurasi
// tangan. Sebagian counter-ion memang tidak pernah kebetulan berada pada tulisan yang
// membawa klausa "setara dengan" — dan akibatnya terlihat pada kueri sungguhan yang
// pertama dijalankan: dikuat muncul sebagai DUA identitas, "dikuat dibromida" di sebelah
// "dikuat diklorida", karena hanya yang kedua punya klausa yang mengajarkan gugusnya.
// Kalau daftar larangan menyebut "dikuat" saja, yang pertama lolos tanpa satu pun tanda.
//
// Yang TIDAK boleh dilakukan untuk menutupnya: melonggarkan pencocokan — menambah
// pelipatan ortografis, ambang kemiripan, atau pemangkasan sufiks otomatis. Ketiganya
// akan menyatukan hal yang seharusnya terpisah, dan diam-diam. Yang dilakukan di sini
// tabel tangan, satu baris satu keputusan, tiap baris membawa alasannya sendiri supaya
// bisa DIBANTAH SATU PER SATU — pola yang sama dengan GLOSA_DITOLAK di atas.
//
// Isi tabel ini bukan padanan nama dan bukan klaim tentang bahan induknya. Ia cuma satu
// klaim sempit: rentang token ini menamai counter-ion atau alkohol esternya, bukan bagian
// dari nama induknya. Nama internasional induknya tetap hanya boleh datang dari deklarasi
// registri lewat `anchor`; kalau registri tak pernah menuliskannya, `induk.nama` tetap
// null. Faktor kesetaraan pun tidak ikut lahir dari sini — ia tetap hanya dari deklarasi
// registri, karena tabel ini tidak membawa satu pun angka.
//
// Yang SENGAJA TIDAK dimasukkan, beserta alasannya, ada di GUGUS_DITOLAK di bawahnya.
const GUGUS_TANGAN = new Map([
  ['hidroklorida', ['garam', 'Garam asam klorida. Kata ini menamai counter-ion seutuhnya (HCl) dan tidak pernah jadi bagian nama bahan mana pun di registri: seluruh kemunculannya "kartap hidroklorida" dan "propamokarb hidroklorida". Ejaan hydrochloride, hydrochlorida, dan hidrokloride melipat ke bentuk yang sama, jadi satu baris ini menutup keempatnya.']],
  ['oksiklorida', ['garam', 'Garam tembaga basa, Cu2(OH)3Cl. Registri sudah mengajarkan sendiri "hidroksida" dan "oksida" sebagai gugus dari induk "tembaga" lewat klausa setaranya; oksiklorida menempati posisi yang sama dan hanya kebetulan tidak pernah ditulis bersama klausa itu.']],
  ['dibromida', ['garam', 'Dua ion bromida sebagai counter-ion. Kembarannya "diklorida" sudah diajarkan registri untuk induk yang sama persis — parakuat dan dikuat — sehingga yang membedakan hanya halogennya. Hanya muncul pada "dikuat dibromida" dan "diquat dibromida".']],
  ['natrium', ['garam', 'Counter-ion logam alkali. Registri sudah mengajarkan "kalium" sebagai gugus dari glifosat lewat klausa setaranya; natrium menempati posisi yang sama pada golongan yang sama.']],
  ['sodium', ['garam', 'Ejaan internasional dari natrium; registri memakai keduanya. Dipisah barisnya karena pelipatan ortografis memang tidak — dan tidak boleh — menyamakan keduanya: keduanya kata yang berlainan, kebetulan menamai ion yang sama.']],
  ['sodium salt', ['garam', 'Tulisan yang menyebut sendiri bahwa ia garam ("salt"), jadi tidak ada yang perlu ditebak. Diperlukan tersendiri karena token "salt" menghalangi baris "sodium" mengenali sisanya sebagai induk.']],
  ['na salt', ['garam', 'Sama dengan di atas; "Na" lambang unsur natrium, dan kata "salt" di sebelahnya yang menghilangkan keraguan. Hanya muncul pada "2,4-D Na Salt".']],
  ['ipa', ['garam', 'Singkatan isopropilamina. Registri menuliskan gugus yang sama lengkap ("isopropil amina glifosat", 221 formulasi) maupun disingkat ("IPA glifosat", 54) untuk bahan yang sama; yang lengkap sudah diajarkan klausa setara, yang disingkat tidak pernah. Token "ipa" tidak muncul di tempat lain mana pun pada registri.']],
  ['diamonium', ['garam', 'Dua ion amonium. Registri sudah mengajarkan "amonium" dan "monoamonium" sebagai gugus dari glifosat; diamonium sama, berbeda stoikiometri — dan justru karena stoikiometrinya berbeda ia tetap entitas tersendiri dengan faktor kesetaraannya sendiri.']],
  ['dimethyl amine', ['garam', 'Ejaan Inggris dari "dimetil amina", yang sudah diajarkan registri sebagai gugus dari glifosat dan MCPA. Perlu barisnya sendiri karena akhiran -amine dan -amina tidak melipat ke bentuk yang sama, dan memang tidak boleh dipaksa melipat. Menutup pula "dimethylamine" tanpa spasi.']],
  ['dma', ['garam', 'Singkatan dimetil amina yang dipakai registri pada "MCPA DMA" dan "2,4-D DMA". Bentuk panjangnya sudah diajarkan klausa setara pada tulisan lain untuk induk yang sama.']],
  ['triisopropanolamine', ['garam', 'Counter-ion amina, seperti dimetil amina, hanya aminanya berbeda. Muncul pada "2,4-D triisopropanolamine" dan "Picloram triisopropanolamine".']],
  ['meptil', ['ester', 'Ester 1-metilheptil. Registri sendiri sudah mengajarkan "meptil heptil ester" sebagai gugus ester dari fluroksipir; "meptil" bentuk pendeknya, dan seluruh kemunculan token ini di registri menempel pada fluroksipir. Ejaan meptyl dan mepthyl melipat ke bentuk yang sama.']],
  ['meptil ester', ['ester', 'Sama, dengan kata "ester" ikut tertulis. Perlu barisnya sendiri karena kata itu menghalangi baris "meptil" mengenali sisanya sebagai induk.']],
  ['1 metil heptil ester', ['ester', 'Gugus yang sama dieja panjang — 1-metilheptil ester adalah meptil. Registri menulis keduanya untuk fluroksipir yang sama.']],
  ['1 mhe', ['ester', 'Singkatan "1-methylheptyl ester", gugus yang sama lagi. Hanya muncul pada "fluroksipir 1- MHE".']],
  ['benzil', ['ester', 'Alkohol ester benzil; ejaan benzyl melipat ke bentuk yang sama. Dari 10 tulisan registri yang memuat token ini, 4 menempel pada florpirauksifen; 6 sisanya ("6 benzil adenin" dan golongan benzalkonium) memang memuat benzil sebagai bagian nama, tetapi di situ sisa tokennya bukan bahan terdaftar sehingga tidak akan pernah lolos jadi induk.']],
  ['butil ester', ['ester', 'Tulisan yang menyebut sendiri bahwa ia ester. Dipakai 2,4-D. Hanya rentang yang memuat kata "ester" yang dimasukkan — "butil" telanjang tidak, karena pada "butil sihalofop" justru kepalanya yang bagian nama induk.']],
  ['isobutil ester', ['ester', 'Sama, isomer bercabangnya. Muncul pada "2,4-D isobutil ester".']],
  ['ibe', ['ester', 'Singkatan "isobutil ester" pada "2,4-D IBE"; bentuk panjangnya ada di baris di atas dan pada tulisan registri lain untuk induk yang sama.']],
  ['2 etilheksil ester', ['ester', 'Ester 2-etilheksil, dengan kata "ester" tertulis. Dipakai 2,4-D. Ejaan "2-ethylhexyl ester" melipat ke bentuk yang sama.']],
  ['etilheksil ester', ['ester', 'Sama, tanpa locant "2" yang kadang dihilangkan registri.']],
]);

// Gugus yang DIPERTIMBANGKAN dan ditolak. Berdiri di sini alih-alih hilang tanpa jejak,
// karena tiap baris keputusan yang bisa dibantah — dan karena yang berikutnya membaca
// berkas ini akan mengusulkannya lagi kalau alasannya tidak tertulis.
const GUGUS_DITOLAK = new Map([
  ['metil / etil / butil telanjang', 'Token alkil sama seringnya jadi BAGIAN nama induk seperti jadi gugus ester: "metil bromida" dan "metil eugenol" bukan ester dari bromida dan eugenol, dan pada "butil sihalofop" kepalanya yang gugus. Hanya rentang yang memuat kata "ester" atau alkil yang tak pernah jadi bagian nama (meptil, benzil) yang diterima.'],
  ['asetat / acetate', 'Bermakna dua: counter-ion pada "tembaga asetat" dan "fentin asetat", tetapi alkohol pada asetat feromon seperti "z-11 heksadesenil asetat". Nama gugusnya sendiri tidak bisa memutuskan yang mana, jadi ia tidak boleh diputuskan di sini.'],
  ['fosfida / phosphide', 'Aluminium, seng, dan magnesium fosfida bukan garam dari logamnya: yang bekerja fosfinnya, dan logamnya bagian dari bahan aktif itu sendiri. Menautkannya ke "aluminium" akan menyambungkan larangan ke unsur, bukan ke bahan.'],
  ['dikolrida', 'Salah ketik registri untuk "diklorida" pada "parakuat dikolrida" (4 formulasi). Ia bukan gugus melainkan huruf tertukar, dan menampungnya di tabel gugus akan menjadikan tabel ini tempat penampungan salah ketik — persis pencocokan longgar yang berkas ini tolak. Tempatnya perbaikan ejaan di sumbernya.'],
  ['isooctyl', 'Alkil telanjang tanpa kata "ester" pada "MCPA-Isooctyl"; ditolak dengan alasan yang sama seperti metil/etil/butil telanjang.'],
  ['etilheksil telanjang', 'Sama: "2,4-D etilheksil" menyingkat esternya tanpa mengatakannya. Yang memuat kata "ester" diterima, yang tidak dibiarkan kosong.'],
]);

for (const [g, [jenis, alasan]] of GUGUS_TANGAN) {
  const k = skel(g);
  // Klausa setara yang mengajarkannya selalu menang: bukti registri di atas kurasi tangan.
  if (gugusCalon.has(k)) continue;
  // `jenis` dibaca dari tabel, bukan diterka ulang dari kata-katanya: singkatan seperti
  // "IBE" dan "1 MHE" tidak memuat satu pun kata yang menandainya ester, dan menyerahkannya
  // ke penerkaan akan mencatatnya sebagai garam.
  gugusCalon.set(k, { gugus: g, jenis, n: 0, tangan: true, bukti: `Gugus dikurasi tangan, bukan dipelajari dari klausa setara. ${alasan}`, induk: new Set() });
}

const gugusResmi = [...gugusCalon.values()].sort((a, b) => tokenisasi(b.gugus).length - tokenisasi(a.gugus).length || b.n - a.n);
// Nama yang boleh jadi calon induk: yang muncul sebagai tulisan tersendiri di registri,
// yang sudah teranker, atau yang jadi KATA di dalam nama internasional yang teranker —
// "copper" tidak pernah berdiri sendiri sebagai bahan terdaftar, tetapi registri
// menuliskannya di dalam "copper hydroxide" dan "copper oxide".
const tokenTeranker = new Set();
for (const a of anchor.values()) for (const t of tokenisasi(a.nama)) if (t.length > 3) tokenTeranker.add(skel(t));
// Sumber keempat, dan yang paling kuat: nama yang REGISTRI SENDIRI sudah nyatakan sebagai
// induk pada salah satu klausa setaranya. "Tembaga" tidak pernah berdiri sendiri sebagai
// bahan terdaftar, tidak pernah dituliskan di dalam kurung, dan tidak pernah jadi kata di
// dalam nama internasional mana pun — ketiga sumber di atas melewatkannya. Tetapi registri
// menyatakan "tembaga hidroksida setara dengan tembaga", dan itu pernyataan registri bahwa
// tembaga induk. Tanpa baris ini "tembaga oksiklorida" tidak punya induk yang boleh dituju,
// padahal tembaga hidroksida dan tembaga oksida sudah punya.
const indukTerdeklarasi = new Set(setara.map((s) => skel(s.induk)));
const bolehJadiInduk = (nama) => skelHadir.has(skel(nama)) || anchor.has(skel(nama)) || tokenTeranker.has(skel(nama)) || indukTerdeklarasi.has(skel(nama));

// Tulisan yang BERDIRI SENDIRI di registri, dikunci lewat lipatannya. Registri kadang
// menulis induk yang sama dalam dua ejaan dan hanya salah satunya yang pernah didaftarkan
// sebagai bahan tersendiri: "Diquat dibromida" memuat induk "diquat", sedangkan yang
// terdaftar sendiri "Dikuat". Keduanya melipat ke bentuk yang sama — jadi bahan yang sama,
// bukan bahan yang mirip. Selama registri tidak pernah menuliskan nama internasionalnya,
// yang direkam sebagai nama induk adalah tulisan yang berdiri sendiri itu, bukan potongan
// dari nama garamnya, supaya barisnya bertemu entitas zatnya alih-alih melahirkan induk
// kedua yang cuma beda ejaan. Jalur klausa setara sudah melakukan persis ini lewat kunci
// lipatannya; ini menyamakan jalur gugus dengannya, bukan melonggarkan pencocokannya.
const berdiri = new Map();
for (const o of daftar) { const s = skel(namaKiriDari(o)); if (!berdiri.has(s)) berdiri.set(s, namaKiriDari(o)); }

// ===========================================================================
// 5. Faktor kesetaraan
// ===========================================================================
// Dua sumber angka, dua-duanya milik registri: angka di dalam nama, dan medan kadarBahan
// pada formulasi yang memakai nama itu. Faktor = kadar induk / kadar bentuk terdaftar.
function faktorUntuk(anakSkel) {
  const sampel = [];
  for (const s of setaraByAnak.get(anakSkel) ?? []) {
    const ind = s.u.kanan_angka[0];
    if (!ind) continue;
    let bentuk = s.u.kiri_angka[0];
    if (!bentuk) {
      const nilai = [...new Set((kadar.get(s.tulisan) ?? []).filter((x) => x.unit === ind.unit).map((x) => x.value))];
      if (nilai.length === 1) bentuk = { value: nilai[0], unit: ind.unit };
    }
    if (!bentuk || bentuk.unit !== ind.unit) continue;
    const f = ind.value / bentuk.value;
    if (!(f > 0.2 && f < 1)) continue;
    sampel.push({ f, bentuk, induk: ind, tulisan: s.tulisan, n: s.n });
  }
  if (!sampel.length) return null;
  const fs = sampel.map((x) => x.f).sort((a, b) => a - b);
  const median = fs[Math.floor(fs.length / 2)];
  const sesuai = fs.filter((x) => Math.abs(x - median) / median <= 0.02).length;
  const contoh = sampel.filter((x) => Math.abs(x.f - median) / median <= 0.02).sort((a, b) => b.n - a.n)[0] ?? sampel[0];
  return { median, min: fs[0], max: fs[fs.length - 1], n: fs.length, sesuai, contoh };
}
// Keluarga = induk + gugus yang awalan cacahnya dilepas. Dipakai memeriksa apakah dua
// tulisan untuk garam yang sama menyatakan faktor yang bertentangan.
// Hanya awalan "mono" yang dilepas: ia murni variasi penamaan (monoamonium = amonium),
// sedangkan di- dan tri- mengubah stoikiometri dan memang berhak berfaktor lain.
const keluargaGugus = (g) => skel(g).replace(/^mono/, '');

// ===========================================================================
// 6. Susun satu rekaman per tulisan
// ===========================================================================
const BUKAN = [
  [/^[\d\s.,\-]+$/, 'Medan nama hanya berisi angka; tidak ada nama bahan di dalamnya.'],
  [/^test$/, 'Isian uji coba yang tertinggal pada registri.'],
  [/^(water|air)$/, 'Air adalah pembawa, bukan bahan aktif.'],
];

isiAnchorUrutan();

const rekaman = [];
const faktorKeluarga = new Map();

for (const o of daftar) {
  const u = uraiSemua.get(o.k);
  const ent = entitasDari(o.k);
  const r = { kunci: o.k, tulisan_teramati: [...o.tulisan].sort(), formulasi: o.n };
  if (ent) r.substance = ref(ent);

  let bukan = BUKAN.find(([re]) => re.test(o.k))?.[1] ?? null;
  if (!bukan && !u.kiri_nama && u.ada_setara && u.kanan_nama) {
    bukan = `Bukan nama bahan melainkan baris keterangan kesetaraan yang berdiri sendiri: registri memecah satu bahan jadi dua baris komposisi, dan baris ini hanya memuat kadar setara terhadap "${u.kanan_nama}".`;
  }
  // Ambangnya satu huruf, bukan tiga: "2,4-D" dan "MCPA" nama bahan sungguhan.
  if (!bukan && !/[a-z]/.test(o.k)) bukan = 'Tidak ada satu pun huruf yang bisa dibaca sebagai nama.';
  if (bukan) {
    r.hubungan = 'bukan-bahan-aktif'; r.alasan = bukan;
    if (u.kanan_nama) r.catatan = { id: `Menyebut "${u.kanan_nama}" sebagai acuan kesetaraan.` };
    rekaman.push(r); continue;
  }

  if (ent?.organism?.scientific_name) {
    r.hubungan = 'organisme';
    r.kanonik = {
      nama: ent.organism.scientific_name + (ent.organism.strain ? ` ${ent.organism.strain}` : ''),
      dasar: 'kosakata-zat',
      kutipan: `substance-pestisida.json ${ent.id} organism.scientific_name`,
    };
    rekaman.push(r); continue;
  }

  const kiri = u.kiri_nama || o.k;
  const ks = skel(kiri);

  // --- induk lewat klausa setara ---
  let indukNama = null; let gugus = null; let dasarInduk = null; let kutipanInduk = null; let jenisTangan = null;
  const punyaSetara = setaraByAnak.get(ks);
  if (punyaSetara?.length) {
    const pilih = [...punyaSetara].sort((a, b) => b.n - a.n)[0];
    indukNama = pilih.induk;
    dasarInduk = u.ada_setara ? 'deklarasi-setara' : 'deklarasi-setara-transitif';
    kutipanInduk = pilih.tulisan;
    const sisa = [...tokenisasi(kiri)];
    for (const b of tokenisasi(indukNama)) { const i = sisa.findIndex((a) => skel(a) === skel(b)); if (i >= 0) sisa.splice(i, 1); }
    gugus = sisa.join(' ') || null;
  }
  // --- induk lewat gugus yang sudah diajarkan registri ---
  // Gugusnya dicocokkan sebagai RENTANG token yang bersebelahan, bukan token per token:
  // registri menulis gugus yang sama kadang berspasi kadang tidak — "2,4-D dimetil amina"
  // dan "2,4-D dimetilamina" satu bahan yang sama. Spasi ikut dilipat, tetapi urutannya
  // tidak: token yang berpencar tidak dihitung cocok.
  if (!indukNama) {
    const A = tokenisasi(kiri);
    cari: for (const g of gugusResmi) {
      const gs = skel(g.gugus);
      for (let i = 0; i < A.length; i++) {
        for (let j = i + 1; j <= A.length; j++) {
          if (skel(A.slice(i, j).join('')) !== gs) continue;
          const sisa = [...A.slice(0, i), ...A.slice(j)];
          if (!sisa.length) continue;
          const calon = sisa.join(' ');
          if (!bolehJadiInduk(calon)) continue;
          indukNama = calon; gugus = g.gugus; dasarInduk = g.tangan ? 'gugus-dikurasi' : 'gugus-dipelajari'; kutipanInduk = g.bukti;
          if (g.tangan) jenisTangan = g.jenis;
          break cari;
        }
      }
    }
  }
  // --- stereodeskriptor ---
  let stereo = null;
  if (!indukNama) {
    const A = tokenisasi(kiri);
    for (let i = 0; i < A.length; i++) {
      if (!STEREO.has(A[i])) continue;
      const sisa = A.filter((_, j) => j !== i).join(' ');
      if (!sisa) continue;
      if (!bolehJadiInduk(sisa)) continue;
      stereo = { prefiks: A[i], induk: sisa }; break;
    }
  }

  // --- nama internasional untuk tulisan ini sendiri ---
  const sendiri = glosa.filter((g) => skel(g.kepala) === ks && ['ejaan', 'ejaan-berimbuhan', 'ejaan-sebagian', 'sistematis-ke-umum', 'penanda-nama-umum', 'tanpa-korroborasi'].includes(g.jenis));
  let kanonik = null;
  if (sendiri.length) {
    const urut = ['penanda-nama-umum', 'ejaan', 'ejaan-berimbuhan', 'ejaan-sebagian', 'sistematis-ke-umum', 'tanpa-korroborasi'];
    const g = [...sendiri].sort((a, b) => urut.indexOf(a.jenis) - urut.indexOf(b.jenis) || b.n - a.n)[0];
    kanonik = {
      nama: g.jenis === 'penanda-nama-umum' ? g.kepala : g.glosa,
      dasar: 'deklarasi-registri',
      kutipan: g.tulisan,
      ...(g.jenis === 'tanpa-korroborasi' ? { perlu_tinjau: true, catatan_tinjau: 'Registri menyatakan padanan ini, tetapi tidak ada satu pun ciri ortografis yang mengiyakannya. Dipakai karena sumbernya registri; ditandai supaya bisa dibantah.' } : {}),
    };
  }
  // Glosanya sendiri belum tentu bentuk yang paling internasional: registri menulis
  // "sihalofop butil (butil sihalofop)", dua-duanya Indonesia, sementara tulisan lain
  // menyatakan "butil sihalofop (cyhalofop-butyl)". Kalau ada padanan tak-berurut yang
  // ciri kuatnya lebih banyak, itu yang dipakai.
  const lintas = anchorUrutan.get(kunciUrutan(kiri));
  if (kanonik && lintas && ciriKuat(lintas.nama).length > ciriKuat(kanonik.nama).length) {
    kanonik = { nama: lintas.nama, dasar: 'ejaan', kutipan: lintas.kutipan, ...(lintas.perlu_tinjau ? { perlu_tinjau: true } : {}) };
  }
  if (!kanonik && (anchor.has(ks) || anchorUrutan.has(kunciUrutan(kiri)))) {
    const a = anchor.get(ks) ?? anchorUrutan.get(kunciUrutan(kiri));
    kanonik = { nama: a.nama, dasar: a.dasar === 'ejaan-arah' ? 'ejaan-arah' : 'ejaan', kutipan: a.kutipan, ...(a.perlu_tinjau ? { perlu_tinjau: true } : {}) };
  }

  const namaInduk = (n) => {
    const a = anchor.get(skel(n));
    // Hanya ketika registri TIDAK pernah menyebut nama internasionalnya: pakai tulisan
    // induk yang berdiri sendiri di registri. Kalau namanya sudah ada, identitasnya sudah
    // bertemu lewat `nama` dan ejaan `nama_registri` tidak perlu diusik.
    const nr = !a && berdiri.has(skel(n)) ? berdiri.get(skel(n)) : n;
    const e = entitasDari(nr);
    const out = { nama_registri: nr, nama: a?.nama ?? null };
    if (!a) out.alasan_nama_kosong = 'Registri hanya menuliskan induknya dalam ejaan Indonesia; tidak ada deklarasi kurung yang menyebutkan nama internasionalnya. Dibiarkan kosong, jangan ditebak.';
    if (a?.perlu_tinjau) out.perlu_tinjau = true;
    if (e) out.substance = ref(e);
    return out;
  };

  if (indukNama) {
    const jenis = jenisTangan ?? (gugus ? jenisGugus(gugus) : 'garam');
    r.hubungan = jenis === 'ester' ? 'ester-dari' : 'garam-dari';
    r.bentuk = { jenis, ...(gugus ? { gugus } : {}) };
    const sd = gugus && tokenisasi(gugus).find((t) => STEREO.has(t));
    if (sd) r.bentuk.stereodeskriptor = sd;
    r.induk = namaInduk(indukNama);
    r.kanonik = kanonik ?? { nama: null, alasan_kosong: 'Bentuk garam/esternya sendiri tidak pernah dituliskan registri dengan nama internasional. Sambungan dilakukan lewat induknya; bentuknya dibiarkan kosong.' };
    r.dasar = [{ jenis: dasarInduk, kutipan: kutipanInduk }];
    const f = faktorUntuk(ks);
    if (f) {
      r.kesetaraan = {
        faktor: Number(f.median.toFixed(4)),
        arah: 'bentuk-terdaftar-ke-induk',
        n_deklarasi: f.n,
        n_sesuai: f.sesuai,
        contoh: { bentuk: f.contoh.bentuk, induk: f.contoh.induk, kutipan: f.contoh.tulisan },
      };
      if (f.sesuai < f.n) r.kesetaraan.sebar = { min: Number(f.min.toFixed(4)), max: Number(f.max.toFixed(4)) };
      // Ambangnya 90%, bukan "ada satu yang meleset". Dua pendaftaran keliru di antara 76
      // tidak membuat nilai tengahnya meragukan — ia justru memperlihatkan keduanya. Yang
      // meragukan adalah ketika kesepakatannya sendiri yang tipis.
      if (f.sesuai / f.n < 0.9) {
        r.kesetaraan.perlu_tinjau = true;
        r.kesetaraan.catatan_tinjau = `Dari ${f.n} deklarasi kesetaraan pada tulisan ini, ${f.n - f.sesuai} menyimpang lebih dari 2% dari nilai tengahnya (${f.min.toFixed(4)}–${f.max.toFixed(4)}). Nilai tengahnya yang direkam, tetapi salah satu pendaftaran pasti keliru dan angkanya jangan dipakai menghitung dosis sebelum diperiksa ke label aslinya.`;
      }
      const kel = `${skel(indukNama)}|${keluargaGugus(gugus ?? '')}`;
      if (!faktorKeluarga.has(kel)) faktorKeluarga.set(kel, []);
      faktorKeluarga.get(kel).push({ r, f: f.median });
    }
  } else if (stereo) {
    r.hubungan = 'stereoisomer-dari';
    r.bentuk = { jenis: 'stereoisomer', stereodeskriptor: stereo.prefiks };
    r.induk = namaInduk(stereo.induk);
    r.kanonik = kanonik ?? { nama: null, alasan_kosong: 'Isomernya tidak pernah dituliskan registri dengan nama internasional.' };
    r.dasar = [{ jenis: 'stereodeskriptor', kutipan: `Tulisan ini adalah "${stereo.induk}" berawalan stereodeskriptor "${stereo.prefiks}"; induknya terdaftar tersendiri pada registri.` }];
  } else if (kanonik) {
    r.hubungan = kanonik.nama === kiri ? 'sama-dengan' : 'varian-ejaan';
    r.kanonik = kanonik;
  } else if (isSistematis(o.k)) {
    r.hubungan = 'nama-sistematis-belum-terpetakan';
    r.alasan = 'Registri menuliskan nama kimia sistematis. Tidak ada nama umum yang dideklarasikan registri untuk tulisan ini, dan menurunkannya dari struktur akan menghasilkan padanan yang terdengar yakin tanpa dasar.';
  } else {
    r.hubungan = 'belum-terpetakan';
    r.alasan = 'Registri tidak pernah menuliskan nama internasional untuk tulisan ini, dan pelipatan ortografisnya tidak bertemu satu pun nama yang dideklarasikan registri. Dibiarkan kosong; jangan dicocokkan dengan kemiripan atau jarak edit.';
  }
  rekaman.push(r);
}

// Pertentangan faktor antar-tulisan untuk garam yang sama.
let bertentangan = 0;
for (const [, isi] of faktorKeluarga) {
  const fs = isi.map((x) => x.f);
  const lo = Math.min(...fs); const hi = Math.max(...fs);
  if ((hi - lo) / hi <= 0.02) continue;
  bertentangan++;
  for (const { r } of isi) {
    r.kesetaraan.perlu_tinjau = true;
    r.kesetaraan.catatan_tinjau = `Registri menyatakan faktor yang berbeda-beda untuk garam yang sama: ${lo.toFixed(4)} sampai ${hi.toFixed(4)}. Salah satunya pasti keliru; keduanya direkam supaya perbedaannya terlihat, dan tidak satu pun boleh dipakai menghitung dosis sebelum diperiksa ke label aslinya.`;
  }
}

// ===========================================================================
// 7. Tulis
// ===========================================================================
const sebaran = new Map();
for (const r of rekaman) sebaran.set(r.hubungan, (sebaran.get(r.hubungan) ?? 0) + 1);

const doc = {
  $schema: '../schema/padanan-bahan-aktif.schema.json',
  padanan: {
    label: { id: 'Padanan nama bahan aktif — tulisan registri ke identitas kimia' },
    scope: {
      id: [
        `Satu rekaman untuk SETIAP dari ${rekaman.length} bentuk ternormalkan nama bahan aktif pada`,
        `${registri.length} formulasi pestisida terdaftar Kementan, termasuk yang tidak terpetakan.`,
        'Sisi kiri adalah `kunci`, bukan tulisan mentah; seluruh tulisan mentah yang pernah',
        'teramati direkam jamak di `tulisan_teramati`. Sisi kanan identitas kimia yang bisa',
        'di-join, beserta JENIS HUBUNGANNYA.',
        'REGISTRINYA BERGERAK, dan itu yang menentukan bentuk berkas ini. Pada rentang 19–23',
        'Agustus 2026 saja 83 formulasi berubah medan bahanAktif: 67 menduplikasi elemen yang',
        'sama persis, 16 menumbuhkan varian kapitalisasi baru sebagai elemen tersendiri tanpa',
        'yang lama dibuang. Cacah tulisan unik karena itu BUKAN himpunan tertutup. Kuncinya',
        'dinormalkan supaya tulisan baru yang hanya beda kapitalisasi atau spasi langsung',
        'jatuh ke rekaman yang sudah ada, dan `tools/susun-padanan-bahan-aktif.mjs --periksa'
        + ' [potret.json]` menyalak menyebutkan tulisan yang belum punya rekaman, alih-alih',
        'membiarkannya jatuh ke celah.',
        'Hubungan tidak simetris dan tidak setara: "parakuat diklorida" adalah GARAM DARI',
        '"paraquat", bukan sinonimnya. Meratakannya jadi sinonim akan membuat pemeriksaan',
        'larangan meleset ke dua arah sekaligus. Karena itu `hubungan` tidak pernah',
        '"sama-dengan" untuk garam, ester, atau stereoisomer, dan `induk` WAJIB ada di',
        'ketiganya — pengonsumsi yang hanya membaca `kanonik.nama` akan kehilangan',
        'sambungannya, dan skema menutup kemungkinan barisnya lahir tanpa induk.',
        'SELURUH bukti diturunkan dari deklarasi registri sendiri: nama internasional yang',
        'ditulis registri di dalam kurung, klausa "setara dengan", dan medan kadarBahan pada',
        'formulasi yang memakai nama itu. Tidak ada daftar nama umum milik pihak lain yang',
        'disalin ke berkas ini, sehingga isinya bebas dipakai ulang seperti sisa repositori.',
        'Konsekuensinya jelas dan sengaja: bahan yang nama internasionalnya tidak pernah',
        'dituliskan registri tetap kosong. Kekosongan yang terhitung lebih murah daripada',
        'padanan yang terdengar yakin tanpa dasar.',
        'Berkas ini MENUNJUK spec/vocab/substance-pestisida.json, bukan menggantikannya:',
        'kosakata itu tetap pemilik entitas dan ID; di sini hanya pemetaannya. Rekamannya',
        'sengaja TANPA op: id — yang disimpan pemetaan, bukan entitas — mengikuti',
        'pola yang sama dengan kamus nama lokal.',
      ].join(' '),
    },
    lifecycle: { version: '0.1.0', status: 'draft', created_at: '2026-08-23T00:00:00Z', review_due: '2027-02-23' },
    provenance: {
      license: 'CC-BY-SA-4.0',
      sources: [
        {
          title: 'Database Pupuk dan Pestisida Terdaftar (SIMPEL)',
          publisher: 'Kementerian Pertanian RI',
          url: 'https://ap-simpel.pertanian.go.id/',
          year: 2026,
          locator: `7.724 formulasi terdaftar, ditarik ${TARIKAN}; medan bahanAktif (namaBahan, kadarBahan, satuanBahan). SATU-SATUNYA sumber nama pada berkas ini: baik nama internasional maupun pernyataan kesetaraan garam→induk berikut angkanya diambil dari yang ditulis registri sendiri.`,
        },
        {
          title: 'Bahan aktif pestisida terdaftar — lapis generik',
          publisher: 'Open Protocols',
          year: 2026,
          locator: 'spec/vocab/substance-pestisida.json. Sisi kiri disambungkan ke entitasnya lewat label, key, synonyms, dan mappings KEMENTAN; entitas berstatus superseded diikuti sampai penggantinya.',
        },
      ],
    },
    kunci_normalisasi: {
      id: 'kunci = tulisan mentah, huruf kecil, spasi tak-putus (U+00A0) jadi spasi biasa, deret spasi jadi satu, ujungnya dipangkas. Hanya itu — pelipatan ortografis yang lebih jauh (ph/f, c/k, y/i, -e akhir) dipakai untuk MENCARI padanan, tidak pernah untuk membentuk kunci, supaya dua bahan tidak pernah bisa bertabrakan di satu kunci.',
    },
    potret: {
      berkas: 'pukpes_data/raw/pestisida_terdaftar.json',
      tarikan: TARIKAN,
      formulasi: registri.length,
      tulisan_mentah: mentahUnik.size,
      sha256: `sha256:${potretHash}`,
      catatan: {
        id: `${mentahUnik.size} tulisan mentah melipat jadi ${rekaman.length} kunci; selisihnya semata kapitalisasi dan spasi. Hash ini menandai potret yang dipakai; kalau potretnya berganti, jalankan ulang penyusunnya dan periksa keluaran --periksa.`,
      },
    },
    hitungan: {
      kunci: rekaman.length,
      formulasi: registri.length,
      per_hubungan: Object.fromEntries([...sebaran].sort((a, b) => b[1] - a[1])),
      berkanonik: rekaman.filter((r) => r.kanonik?.nama).length,
      berinduk: rekaman.filter((r) => r.induk).length,
      berfaktor: rekaman.filter((r) => r.kesetaraan?.faktor).length,
      perlu_tinjau: rekaman.filter((r) => r.kanonik?.perlu_tinjau || r.induk?.perlu_tinjau || r.kesetaraan?.perlu_tinjau).length,
    },
  },
  padanan_items: rekaman,
};
writeFileSync(KELUAR, `${JSON.stringify(doc, null, 2)}\n`);

console.log(`Tulisan          : ${rekaman.length}`);
for (const [k, v] of [...sebaran].sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(5)}  ${k}`);
console.log(`kanonik terisi   : ${doc.padanan.hitungan.berkanonik}`);
console.log(`induk terisi     : ${doc.padanan.hitungan.berinduk}`);
console.log(`faktor terpulihkan: ${doc.padanan.hitungan.berfaktor}  (keluarga bertentangan: ${bertentangan})`);
console.log(`perlu tinjau     : ${doc.padanan.hitungan.perlu_tinjau}`);
console.log(`\nDitulis ke ${KELUAR}`);

if (process.argv.includes('--laporan')) {
  const jg = new Map(); for (const g of glosa) jg.set(g.jenis, (jg.get(g.jenis) ?? 0) + 1);
  console.log('\n--- glosa registri per jenis ---');
  for (const [k, v] of [...jg].sort((a, b) => b[1] - a[1])) console.log(String(v).padStart(5), k);
  console.log('\n--- gugus yang dipelajari ---');
  for (const g of gugusResmi.filter((x) => !x.tangan)) console.log(String(g.n).padStart(5), g.jenis.padEnd(6), JSON.stringify(g.gugus), '| induk:', [...g.induk].join(' ; '));
  console.log('\n--- gugus yang dikurasi tangan ---');
  for (const g of gugusResmi.filter((x) => x.tangan)) console.log('     ', g.jenis.padEnd(6), JSON.stringify(g.gugus));
  console.log('\n--- gugus yang ditolak ---');
  for (const [g, alasan] of GUGUS_DITOLAK) console.log('     ', JSON.stringify(g), '|', alasan.slice(0, 100));
  console.log('\n--- perlu tinjau ---');
  for (const r of rekaman.filter((x) => x.kanonik?.perlu_tinjau)) console.log('  kanonik', JSON.stringify(r.kunci), '->', JSON.stringify(r.kanonik.nama), '|', r.kanonik.kutipan);
  for (const r of rekaman.filter((x) => x.kesetaraan?.perlu_tinjau)) console.log('  faktor ', JSON.stringify(r.kunci), r.kesetaraan.faktor, '|', r.kesetaraan.catatan_tinjau.slice(0, 90));
  console.log('\n--- 40 belum-terpetakan terbesar ---');
  for (const r of rekaman.filter((x) => x.hubungan === 'belum-terpetakan').slice(0, 40)) console.log(String(r.formulasi).padStart(5), r.kunci);
}
