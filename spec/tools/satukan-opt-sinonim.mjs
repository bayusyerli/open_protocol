// Menyatukan OPT yang terbelah karena NAMA LAMA, bukan karena salah ketik.
//
//   node spec/tools/satukan-opt-sinonim.mjs            # periksa saja
//   node spec/tools/satukan-opt-sinonim.mjs --tulis    # tulis perubahannya
//
// KENAPA satukan-opt-kembar.mjs TIDAK MENANGKAP INI
// Alat itu mengelompokkan menurut `accepted_scientific_name` dari GBIF, dan menolak
// kelompok yang salah satu anggotanya cuma cocok sampai genus. Itu keputusan yang benar
// dan tidak diubah di sini. Yang tidak tertangkap justru pasangan yang GBIF sendiri
// anggap DUA TAKSON SAH:
//
//   Thosea asigna        exact   <-> Setothosea asigna      exact
//   Plusia chalcites     exact   <-> Chrysodeixis chalcites exact
//   Heliothis armigera   exact   <-> Helicoverpa armigera   exact
//
// Keduanya cocok "exact", accepted-nya berbeda, jadi tidak pernah satu kelompok. Padahal
// keduanya kombinasi lama dan baru untuk serangga yang SAMA — dan di lapangan tidak ada
// yang bisa memilih di antaranya, karena yang berbeda cuma tahun terbitan tata namanya.
//
// KENAPA TABELNYA DITULIS TANGAN, DAN KENAPA ITU BUKAN KEMUNDURAN
// Tidak ada sumber mesin yang menyatakan "nama ini sinonim nama itu" untuk seluruh
// pasangan di bawah: GBIF menyimpannya sebagai takson terpisah, dan katalog sinonim yang
// lengkap bukan data terbuka. Menebaknya dari jarak huruf akan menyatukan Sitophilus
// oryzae dengan Sitophilus zeamais — dua kumbang berbeda yang menyerang komoditas yang
// sama. Jadi tiap pasangan ditulis satu per satu beserta DASARNYA, dan alat ini menolak
// apa pun yang tidak ada di tabel. Yang dipertaruhkan bukan kerapian: menyatukan dua
// organisme yang berbeda berarti menganjurkan produk yang tidak bekerja.
//
// Seluruh pasangan di bawah sudah lebih dulu tertulis sebagai batas pada `definition`
// pintu-pintu terkait — "registri juga memuatnya atas nama lama ..., yang belum
// disatukan". Alat ini yang menutup baris-baris itu.
//
// PERBEDAAN pest_kind DAN taxonomic_rank IKUT DIRAPATKAN, DAN ITU JUSTRU PERBAIKAN
// Entitas berejaan salah sering diklasifikasikan dari nama Indonesianya, bukan dari
// taksonominya: "Phythophoathora infestans" tercatat disease_fungal padahal Phytophthora
// oomycete. Yang menang membawa klasifikasi yang benar, dan selisihnya dicetak supaya
// terlihat — bukan supaya disembunyikan.
//
// EJAAN REGISTRI IKUT NAIK KE PEMENANG, DAN ITU WAJIB
// L26 mencocokkan `pest_scientific_name` pada rekaman produk dengan ejaan yang tercatat
// pada entitas yang ditunjuk. Tanpa menaikkan mappings KEMENTAN milik yang kalah, tiap
// baris yang dipindahkan akan langsung melanggar L26. Pola ini sama dengan
// satukan-opt-kembar.mjs, dan `pest_scientific_name` pada rekaman produk tetap TIDAK
// disentuh: ia satu-satunya tempat bunyi asli registri masih terbaca.
//
// Idempoten: pasangan yang yang kalahnya sudah superseded dilewati.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VOCAB = join(akar, 'spec', 'vocab');
const NDJSON = join(VOCAB, 'product', 'pestisida.ndjson');
const STAMP = '2026-08-28T00:00:00Z';
const tulis = process.argv.includes('--tulis');

// `dasar` wajib menyebut MENGAPA keduanya organisme yang sama. "Mirip" bukan dasar.
const PASANGAN = [
  // --- kombinasi lama lawan kombinasi yang diterima ---
  { kalah: 'op:pst:00001556', menang: 'op:pst:00000106', dasar: 'Idioscopus nama marga yang kini dipakai untuk wereng mangga yang dulu ditaruh di Idiocerus; keduanya wereng mangga yang sama dan registri memuat kedua ejaan marganya.' },
  { kalah: 'op:pst:00002150', menang: 'op:pst:00000106', dasar: 'Idiocerus spp. bentuk jamak dari sasaran bertingkat marga yang sama dengan Idiocerus sp.; tidak ada pembeda apa pun di antara keduanya.' },
  { kalah: 'op:pst:00001899', menang: 'op:pst:00001760', dasar: 'Heliothis assulta kombinasi lama untuk Helicoverpa assulta, penggerek pucuk tembakau; Helicoverpa dipisahkan dari Heliothis 1965, sama seperti pada H. armigera.' },
  { kalah: 'op:pst:00001782', menang: 'op:pst:00001689', dasar: 'Laemophloeus pusillus kombinasi lama untuk Cryptolestes pusillus, kumbang gudang bertubuh pipih; disatukan ke sasaran bertingkat marga Cryptolestes yang sudah ada.' },
  { kalah: 'op:pst:00001754', menang: 'op:pst:00001874', dasar: 'Upasia salmonicolor dan Corticium salmonicolor dua nama untuk jamur upas yang sama — kini Erythricium salmonicolor — dan registri memuat keduanya pada tanaman berkayu.' },
  { kalah: 'op:pst:00001500', menang: 'op:pst:00002306', dasar: 'Pseudomonas glumae nama lama untuk Burkholderia glumae, bakteri busuk bulir padi; marganya dipindahkan 1992 dan yang menang nama yang diterima sekarang.' },
  { kalah: 'op:pst:00002021', menang: 'op:pst:00001239', dasar: 'Rhizoctonia oryzae salah satu jenis Rhizoctonia penyebab hawar pelepah padi yang tidak terbedakan dari R. solani di sawah; disatukan ke sasaran bertingkat marga Rhizoctonia sp. yang sudah ada, bukan ke salah satu spesiesnya.' },
  { kalah: 'op:pst:00002052', menang: 'op:pst:00001239', dasar: 'Rhizoctonia spp. bentuk jamak dari sasaran bertingkat marga yang sama dengan Rhizoctonia sp.' },
  { kalah: 'op:pst:00002310', menang: 'op:pst:00001150', dasar: 'Tetranychus spp. bentuk jamak dari sasaran bertingkat marga yang sama dengan Tetranychus sp.' },

  { kalah: 'op:pst:00001895', menang: 'op:pst:00000117', dasar: 'Diplogomphus hewitti kombinasi lama untuk Diconocoris hewetti, pengisap bunga lada; marganya dipindahkan dan spesiesnya sama, sampai ke nama pengarangnya.' },
  { kalah: 'op:pst:00002315', menang: 'op:pst:00000092', dasar: 'Sphaerotheca fuliginea nama lama yang dipakai luas untuk embun tepung cucurbit yang kini Podosphaera xanthii; marga Sphaerotheca dilebur ke Podosphaera.' },
  { kalah: 'op:pst:00001706', menang: 'op:pst:00000015', dasar: 'Alternaria alii ejaan lain untuk Alternaria porri, bercak ungu bawang — "allii" merujuk marga inangnya Allium dan dipakai bergantian di pustaka lama untuk jamur yang sama.' },

  // --- salah eja yang GBIF tidak kenali, jadi tidak tertangkap satukan-opt-salah-ketik ---
  { kalah: 'op:pst:00001780', menang: 'op:pst:00000120', dasar: 'Salah eja "Coletrotichum capsici" untuk Colletotrichum capsici — dua huruf tertukar di marga — dan barisnya pada cabai, tanaman yang pintunya memang berdiri di atas spesies itu.' },
  { kalah: 'op:pst:00001995', menang: 'op:pst:00001107', dasar: 'Salah eja "Colletothricum sp." untuk Colletotrichum sp.; keduanya sasaran bertingkat marga yang sama.' },
  { kalah: 'op:pst:00002182', menang: 'op:pst:00001107', dasar: 'Salah eja "Colletotrichum gloesporium" — epitetnya terpotong dari gloeosporioides — dan registri menulisnya bertingkat marga, jadi disatukan ke sasaran marga Colletotrichum sp. alih-alih ditebak spesiesnya.' },
  { kalah: 'op:pst:00001930', menang: 'op:pst:00001150', dasar: 'Salah eja "Tentranichus sp." untuk Tetranychus sp.; keduanya sasaran bertingkat marga tungau merah yang sama.' },
  { kalah: 'op:pst:00002024', menang: 'op:pst:00001434', dasar: 'Salah eja "Chillo aurillius" untuk Chilo auricilius, penggerek batang tebu; kedua katanya salah dan tidak ada marga Chillo.' },
  { kalah: 'op:pst:00001967', menang: 'op:pst:00000124', dasar: 'Salah eja "Rhizopertha dominica" untuk Rhyzopertha dominica, bubuk gabah; satu huruf pada marga, dan pintunya memang berdiri di atas spesies itu.' },
  { kalah: 'op:pst:00002054', menang: 'op:pst:00001277', dasar: 'Salah eja "Phythium spp." untuk Pythium spp.; keduanya sasaran bertingkat marga oomycete rebah kecambah yang sama.' },
  { kalah: 'op:pst:00002037', menang: 'op:pst:00001088', dasar: 'Salah eja "Aphid sp." — kata Inggris untuk kutu daun dengan akhiran nama ilmiah — untuk Aphis sp., sasaran bertingkat marga yang sudah ada.' },
  { kalah: 'op:pst:00002327', menang: 'op:pst:00000128', dasar: 'Salah eja "Cerithidae sp." — nama SUKU Cerithiidae yang juga salah eja — untuk marga Cerithidea, siput trisipan tambak yang pintunya sudah berdiri di atasnya.' },
  { kalah: 'op:pst:00002090', menang: 'op:pst:00002235', dasar: 'Salah eja "Trichoplussiani sp." untuk Trichoplusia sp., ulat jengkal kubis; keduanya sasaran bertingkat marga yang sama dan barisnya sama-sama pada kubis.' },
  { kalah: 'op:pst:00001523', menang: 'op:pst:00000009', dasar: 'Pseudomonas solanacearum nama lama untuk Ralstonia solanacearum; genusnya dipindahkan 1995 dan bakterinya sama.' },
  { kalah: 'op:pst:00002066', menang: 'op:pst:00000126', dasar: 'Hemitarsonemus latus kombinasi lama untuk Polyphagotarsonemus latus, tungau kuning; genusnya dipisahkan dan spesiesnya sama.' },
  { kalah: 'op:pst:00001548', menang: 'op:pst:00000006', dasar: 'Tetranychus cinnabarinus bentuk merah Tetranychus urticae, bukan spesies tersendiri: kawin silang subur dan pembedanya cuma warna, yang berubah menurut inang dan musim.' },
  { kalah: 'op:pst:00001380', menang: 'op:pst:00000004', dasar: 'Dacus ferrugineus nama lama yang dipakai di Asia untuk lalat buah oriental yang kini Bactrocera dorsalis; genus Dacus dipecah dan spesies ini masuk Bactrocera.' },
  { kalah: 'op:pst:00002268', menang: 'op:pst:00000004', dasar: 'Bactrocera ferrungineus salah eja Bactrocera ferrugineus, yang sendiri nama lama untuk Bactrocera dorsalis; dua langkah nama untuk lalat buah yang sama.' },
  { kalah: 'op:pst:00001606', menang: 'op:pst:00001367', dasar: 'Nephotetix sp. salah eja Nephotettix sp.; keduanya sasaran bertingkat marga yang sama pada padi, dan tidak ada marga Nephotetix.' },
  { kalah: 'op:pst:00001612', menang: 'op:pst:00001088', dasar: 'Aphids sp. bukan nama ilmiah melainkan kata Inggris untuk kutu daun yang tercatat sebagai sasaran; yang dimaksud Aphis sp., sasaran bertingkat marga yang sudah ada.' },
  { kalah: 'op:pst:00002159', menang: 'op:pst:00001589', dasar: 'Oidiopsis taurica bentuk tak berkelamin Leveillula taurica, dan registri memuat keduanya; disatukan ke sasaran bertingkat marga Oidiopsis sp. yang barisnya lebih banyak.' },
  { kalah: 'op:pst:00001174', menang: 'op:pst:00000074', dasar: 'Thosea asigna kombinasi lama untuk Setothosea asigna; genus Setothosea dipisahkan dari Thosea, spesiesnya sama.' },
  { kalah: 'op:pst:00001180', menang: 'op:pst:00000050', dasar: 'Crocidolomia binotalis nama lama yang dipakai luas di Asia Tenggara untuk Crocidolomia pavonana.' },
  { kalah: 'op:pst:00001164', menang: 'op:pst:00000061', dasar: 'Plusia chalcites kombinasi lama untuk Chrysodeixis chalcites; genus Plusia dipecah.' },
  { kalah: 'op:pst:00001163', menang: 'op:pst:00000023', dasar: 'Heliothis armigera kombinasi lama untuk Helicoverpa armigera; Helicoverpa dipisahkan dari Heliothis 1965.' },
  { kalah: 'op:pst:00001145', menang: 'op:pst:00000037', dasar: 'Cercospora oryzae nama lama untuk Cercospora janseana, penyebab bercak coklat sempit padi.' },
  { kalah: 'op:pst:00001245', menang: 'op:pst:00000058', dasar: 'Agromyza phaseoli kombinasi lama untuk Ophiomyia phaseoli, lalat bibit kacang-kacangan.' },
  { kalah: 'op:pst:00001268', menang: 'op:pst:00000112', dasar: 'Scirpophaga nivella lama dipakai untuk penggerek pucuk tebu yang kini Scirpophaga excerptalis.' },
  { kalah: 'op:pst:00001231', menang: 'op:pst:00000115', dasar: 'Rigidoporus lignosus nama lama untuk Rigidoporus microporus, jamur akar putih karet.' },
  { kalah: 'op:pst:00001686', menang: 'op:pst:00000066', dasar: 'Ceratobasidium theobromae nama baru untuk Oncobasidium theobromae, penyebab VSD kakao; pintu berdiri di atas nama registri yang barisnya lebih banyak.' },
  { kalah: 'op:pst:00001443', menang: 'op:pst:00000070', dasar: 'Pseudococcus citri kombinasi lama untuk Planococcus citri.' },
  { kalah: 'op:pst:00002170', menang: 'op:pst:00000069', dasar: 'Stephanoderes hampei kombinasi lama untuk Hypothenemus hampei, penggerek buah kopi.' },
  { kalah: 'op:pst:00001399', menang: 'op:pst:00000030', dasar: 'Tryporyza incertulas kombinasi lama untuk Scirpophaga incertulas, penggerek batang padi kuning.' },
  { kalah: 'op:pst:00001402', menang: 'op:pst:00001389', dasar: 'Tryporyza innotata kombinasi lama untuk Scirpophaga innotata, penggerek batang padi putih.' },

  { kalah: 'op:pst:00001275', menang: 'op:pst:00000032', dasar: 'Pyricularia grisea lama dipakai untuk penyebab blas padi yang kini Pyricularia oryzae; P. grisea sensu stricto menyerang Digitaria, bukan padi.' },

  // --- salah ketik yang entitas berejaan benarnya sudah ada ---
  { kalah: 'op:pst:00001909', menang: 'op:pst:00000043', dasar: 'Salah ketik "Perenospora maydis" untuk Peronosclerospora maydis.' },
  { kalah: 'op:pst:00001814', menang: 'op:pst:00000056', dasar: 'Salah ketik "Lamprosemma indicata" untuk Lamprosema indicata.' },
  { kalah: 'op:pst:00002097', menang: 'op:pst:00000056', dasar: 'Salah ketik "Lamprosema indicate" untuk Lamprosema indicata.' },
  { kalah: 'op:pst:00002017', menang: 'op:pst:00001122', dasar: 'Salah ketik "Helopelthis sp." untuk Helopeltis sp.' },
  { kalah: 'op:pst:00001772', menang: 'op:pst:00000058', dasar: 'Salah ketik "Ophiornya phaseoli" untuk Ophiomyia phaseoli.' },
  { kalah: 'op:pst:00002151', menang: 'op:pst:00001895', dasar: 'Salah ketik "Diplogomphus hewiti" untuk Diplogomphus hewitti.' },
  { kalah: 'op:pst:00001718', menang: 'op:pst:00000106', dasar: 'Salah ketik "Ideocerus spp." untuk Idiocerus sp., wereng mangga.' },
  { kalah: 'op:pst:00001704', menang: 'op:pst:00001610', dasar: 'Salah ketik "Phragmagtocia castaneae" untuk Phragmataecia castaneae.' },
  { kalah: 'op:pst:00002158', menang: 'op:pst:00000034', dasar: 'Salah ketik "Canaphaloclosis medinalis" untuk Cnaphalocrocis medinalis.' },
  { kalah: 'op:pst:00001667', menang: 'op:pst:00000030', dasar: 'Salah ketik "Scirphopaga incertulans" untuk Scirpophaga incertulas.' },
  { kalah: 'op:pst:00002067', menang: 'op:pst:00001239', dasar: 'Salah ketik "Rizoctonia sp." untuk Rhizoctonia sp.' },
  { kalah: 'op:pst:00002114', menang: 'op:pst:00000017', dasar: 'Salah ketik "Perenospera detructor" untuk Peronospora destructor; yang kalah tercatat jamur padahal Peronospora oomycete.' },
  { kalah: 'op:pst:00001670', menang: 'op:pst:00000020', dasar: 'Salah ketik "Phythophoathora infestans" untuk Phytophthora infestans; yang kalah tercatat jamur padahal Phytophthora oomycete.' },
  { kalah: 'op:pst:00001677', menang: 'op:pst:00001723', dasar: 'Salah ketik "Epiachna spp." untuk Epilachna sp.' },
];

const bacaJson = (p) => JSON.parse(readFileSync(join(VOCAB, p), 'utf8'));
const kunciLarik = (o) => (Array.isArray(o) ? null : Object.keys(o).find((k) => Array.isArray(o[k])));
const larik = (o) => (Array.isArray(o) ? o : o[kunciLarik(o)]);

const bungkusRegistri = bacaJson('pest-registri.json');
const bungkusKurasi = bacaJson('pest.json');
const registri = larik(bungkusRegistri);
const kurasi = larik(bungkusKurasi);
const olehId = new Map([...kurasi, ...registri].map((e) => [e.id, e]));

const bantah = [];
const satu = [];
const dilewati = [];
const selisih = [];

for (const p of PASANGAN) {
  const a = olehId.get(p.kalah);
  const b = olehId.get(p.menang);
  if (!a || !b) { bantah.push(`${p.kalah} atau ${p.menang} tidak ada.`); continue; }
  if (!p.dasar || p.dasar.length < 30) { bantah.push(`${p.kalah}: dasar penyatuan terlalu pendek untuk diperiksa orang lain.`); continue; }
  if (a.lifecycle?.status === 'superseded') { dilewati.push(`${p.kalah} sudah digantikan`); continue; }
  if (b.lifecycle?.status === 'superseded') { bantah.push(`${p.menang} sudah digantikan; jangan jadikan tujuan.`); continue; }

  // Ejaan registri milik yang kalah NAIK ke pemenang. Tanpa ini L26 menyalak pada tiap
  // baris yang dipindahkan, karena label produknya menulis ejaan yang kalah.
  const adaKementan = new Set((b.mappings ?? []).filter((m) => m.scheme === 'KEMENTAN').map((m) => m.id));
  const naik = (a.mappings ?? []).filter((m) => m.scheme === 'KEMENTAN' && !adaKementan.has(m.id));
  if (naik.length) b.mappings = [...(b.mappings ?? []), ...naik];
  const sin = new Set([...(b.synonyms ?? []), ...(a.synonyms ?? []), a.scientific_name, a.label?.id].filter(Boolean));
  b.synonyms = [...sin].sort();

  if (a.pest_kind !== b.pest_kind) selisih.push(`${p.kalah} pest_kind ${a.pest_kind} → ${b.pest_kind}`);
  if (a.taxonomic_rank !== b.taxonomic_rank) selisih.push(`${p.kalah} taxonomic_rank ${a.taxonomic_rank} → ${b.taxonomic_rank}`);

  a.lifecycle = { ...(a.lifecycle ?? {}), status: 'superseded', updated_at: STAMP, superseded_by: { id: p.menang } };
  satu.push(`${a.scientific_name} → ${b.scientific_name} [${b.label?.id}]`);
}

// Rantai penggantian diratakan, seperti pada satukan-opt-kembar.mjs: yang kalah hari ini
// bisa jadi tujuan penggantian kemarin.
let diratakan = 0;
{
  const ujung = (id) => {
    const lewat = new Set();
    let kini = id;
    while (olehId.get(kini)?.lifecycle?.superseded_by?.id) {
      const lanjut = olehId.get(kini).lifecycle.superseded_by.id;
      if (lewat.has(lanjut)) { bantah.push(`rantai berputar di ${lanjut}.`); break; }
      lewat.add(lanjut); kini = lanjut;
    }
    return kini;
  };
  for (const e of [...kurasi, ...registri]) {
    const tuju = e.lifecycle?.superseded_by?.id;
    if (!tuju) continue;
    const akhir = ujung(tuju);
    if (akhir === tuju) continue;
    e.lifecycle = { ...e.lifecycle, superseded_by: { id: akhir }, updated_at: STAMP };
    diratakan += 1;
  }
}

const pindah = new Map(PASANGAN.map((p) => [p.kalah, p.menang]));
const baris = readFileSync(NDJSON, 'utf8').split('\n');
let ubahRekaman = 0;
let ubahBaris = 0;
const baruNdjson = baris.map((b) => {
  if (!b.trim()) return b;
  const p = JSON.parse(b);
  let kena = false;
  for (const u of p.label_uses ?? []) {
    const tuju = u.pest?.id && pindah.get(u.pest.id);
    if (!tuju) continue;
    u.pest.id = tuju;
    kena = true;
    ubahBaris += 1;
  }
  if (kena) ubahRekaman += 1;
  return kena ? JSON.stringify(p) : b;
});

if (bantah.length) {
  for (const b of bantah) console.error(`  TOLAK  ${b}`);
  console.error(`\n${bantah.length} penolakan — tidak ada yang ditulis.`);
  process.exit(1);
}

for (const s of satu) console.log(`  satu    ${s}`);
for (const s of selisih) console.log(`  selisih ${s}`);
console.log(`\n  pest-registri.json / pest.json  — ${satu.length} entitas jadi superseded, ${diratakan} rantai diratakan, ${dilewati.length} dilewati`);
console.log(`  product/pestisida.ndjson        — ${ubahRekaman} rekaman, ${ubahBaris} baris penggunaan`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menyimpan.');
  process.exit(0);
}

writeFileSync(join(VOCAB, 'pest-registri.json'), JSON.stringify(bungkusRegistri, null, 2) + '\n');
writeFileSync(join(VOCAB, 'pest.json'), JSON.stringify(bungkusKurasi, null, 2) + '\n');
writeFileSync(NDJSON, baruNdjson.join('\n'));
console.log('\nDitulis.');
