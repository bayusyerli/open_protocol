// Menyatukan OPT yang salah ketik NAMA ILMIAHNYA sampai GBIF tidak mengenalinya lagi.
//
//   node spec/tools/satukan-opt-salah-ketik.mjs            # periksa saja
//   node spec/tools/satukan-opt-salah-ketik.mjs --tulis    # tulis perubahannya
//
// Putaran sebelumnya (satukan-opt-kembar.mjs) menyatukan 456 entitas memakai
// accepted_scientific_name dari GBIF. Yang tersisa justru yang salah ketiknya paling
// parah: begitu rusak sehingga GBIF cuma sanggup menambatkannya ke genus, atau tidak
// mengenalinya sama sekali.
//
//   Trips parvispinus      -> Thrips parvispinus      genusnya yang salah
//   Echinochloa cruss-gali -> Echinochloa crus-galli  epitetnya
//   Selenopsis germinata   -> Solenopsis geminata     dua-duanya
//
// KENAPA INI PUTARAN TERSENDIRI, DAN KENAPA TABELNYA TEGAS
// Alat sebelumnya sengaja menolak memakai jarak ejaan, karena verifikasi GBIF jauh
// lebih dapat dipercaya. Di sini jarak ejaan TIDAK BISA dihindari — justru
// kegagalan GBIF yang menyisakan kasus-kasus ini. Maka putusannya tidak diserahkan
// ke pola sama sekali: seluruh 131 penyatuan dibekukan satu per satu di tabel GABUNG
// di bawah, sesudah tiap pasangan genusnya diperiksa. Kalau tarikan registri
// berikutnya memunculkan calon yang belum ada putusannya, skrip BERHENTI.
//
// TIGA HAL YANG MENAHAN AGAR TIDAK MELEBUR SPESIES BERBEDA
// 1. Sasaran wajib terverifikasi GBIF di tingkat spesies (exact atau fuzzy).
//    Tanpa syarat ini, "Hedyotis corymbosa" yang benar akan digabungkan ke
//    "Hedyostis corymbosa" yang match_type-nya `none` — GBIF tidak menemukan apa
//    pun, dan confidence 100 di situ tidak berarti apa-apa.
// 2. Padanannya harus TUNGGAL. Yang punya dua padanan berjarak dua huruf atau
//    kurang ditolak seluruhnya; menebak di antara keduanya bukan wewenang skrip.
// 3. Genus sumber tidak boleh genus yang sah sendiri. "Coptotermes cynocephalus"
//    berjarak dua huruf dari "Cryptotermes cynocephalus", tetapi Coptotermes genus
//    rayap yang benar-benar ada — di registri ini pun ada Coptotermes curvignathus
//    dan Coptotermes gestroi. Itu bisa jadi kekeliruan penulis label, bukan salah
//    ketik, dan bedanya tidak bisa diputuskan dari ejaan. Ditolak.
//
// LIMA PENYATUAN YANG MEMPERBAIKI GOLONGAN
// Lima entri Phytophthora tercatat pest_kind "disease_fungal" padahal Phytophthora
// oomycete, bukan jamur. Sasarannya sudah benar "disease_oomycete". Perbedaan
// pest_kind biasanya penanda bahwa dua entitas bukan organisme yang sama, jadi ia
// dicatat terpisah sebagai dasar 'golongan' — di sini yang keliru memang yang kalah,
// dan penyatuan justru membetulkannya.
//
// ID TIDAK DIDAUR ULANG; rantai penggantian diratakan; pest_label dan
// pest_scientific_name pada rekaman produk TIDAK disentuh. Sama seperti putaran
// sebelumnya, dan L26 sudah mengakui ejaan yang tercatat pada entitas.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VOCAB = join(akar, 'spec', 'vocab');
const STAMP = '2026-08-20T00:00:00Z';
const tulis = process.argv.includes('--tulis');

// ---------------------------------------------------------------------------
// Tabel putusan — dibekukan, satu baris satu penyatuan.
//   dasar 'genus'        genusnya yang salah ketik, epitetnya sudah benar
//   dasar 'epitet'       sebaliknya
//   dasar 'genus+epitet' dua-duanya, dan tetap tak meragukan
//   dasar 'golongan'     pest_kind yang kalah keliru; penyatuan membetulkannya
// ---------------------------------------------------------------------------
const GABUNG = {
  'op:pst:00001546': { ke: 'op:pst:00001007', dari: 'Aedes aepgyti', jadi: 'Aedes aegypti', dasar: 'epitet' },
  'op:pst:00002018': { ke: 'op:pst:00001136', dari: 'Agrotis epsilon', jadi: 'Agrotis ipsilon', dasar: 'epitet' },
  'op:pst:00001675': { ke: 'op:pst:00001022', dari: 'Altemaria porri', jadi: 'Alternaria porri', dasar: 'genus' },
  'op:pst:00001095': { ke: 'op:pst:00001065', dari: 'Alternanthera piloxeroides', jadi: 'Alternanthera philoxeroides', dasar: 'epitet' },
  'op:pst:00001494': { ke: 'op:pst:00001065', dari: 'Althenanthera philoxeroides', jadi: 'Alternanthera philoxeroides', dasar: 'genus' },
  'op:pst:00001927': { ke: 'op:pst:00001242', dari: 'Altherigona exigua', jadi: 'Atherigona exigua', dasar: 'genus' },
  'op:pst:00002214': { ke: 'op:pst:00001065', dari: 'Althernathera philoxeroides', jadi: 'Alternanthera philoxeroides', dasar: 'genus' },
  'op:pst:00001599': { ke: 'op:pst:00001006', dari: 'Anoxopus compressus', jadi: 'Axonopus compressus', dasar: 'genus' },
  'op:pst:00002254': { ke: 'op:pst:00001018', dari: 'Asytasisa gangetica', jadi: 'Asystasia gangetica', dasar: 'genus' },
  'op:pst:00001411': { ke: 'op:pst:00001006', dari: 'Axonopus copressus', jadi: 'Axonopus compressus', dasar: 'epitet' },
  'op:pst:00002106': { ke: 'op:pst:00001006', dari: 'Axonopus crompressus', jadi: 'Axonopus compressus', dasar: 'epitet' },
  'op:pst:00002002': { ke: 'op:pst:00001194', dari: 'Blatela germanica', jadi: 'Blattella germanica', dasar: 'genus' },
  'op:pst:00001798': { ke: 'op:pst:00001001', dari: 'Borrena alata', jadi: 'Borreria alata', dasar: 'genus' },
  'op:pst:00002357': { ke: 'op:pst:00001001', dari: 'Borrirea alata', jadi: 'Borreria alata', dasar: 'genus' },
  'op:pst:00001839': { ke: 'op:pst:00001108', dari: 'Canopomorha cramerella', jadi: 'Conopomorpha cramerella', dasar: 'genus' },
  'op:pst:00001736': { ke: 'op:pst:00001061', dari: 'Captotermes cuvignathus', jadi: 'Coptotermes curvignathus', dasar: 'genus+epitet' },
  'op:pst:00002155': { ke: 'op:pst:00001525', dari: 'Centhoteca lappacea', jadi: 'Centotheca lappacea', dasar: 'genus' },
  'op:pst:00002202': { ke: 'op:pst:00001235', dari: 'Centrosema puescens', jadi: 'Centrosema pubescens', dasar: 'epitet' },
  'op:pst:00001748': { ke: 'op:pst:00001235', dari: 'Centrosema pusbescens', jadi: 'Centrosema pubescens', dasar: 'epitet' },
  'op:pst:00001406': { ke: 'op:pst:00001020', dari: 'Chromolaena adorata', jadi: 'Chromolaena odorata', dasar: 'epitet' },
  'op:pst:00002217': { ke: 'op:pst:00001017', dari: 'Clidernia hirta', jadi: 'Clidemia hirta', dasar: 'genus' },
  'op:pst:00002329': { ke: 'op:pst:00001017', dari: 'Climedia hirta', jadi: 'Clidemia hirta', dasar: 'genus' },
  'op:pst:00002120': { ke: 'op:pst:00002094', dari: 'Cloris barbata', jadi: 'Chloris barbata', dasar: 'genus' },
  'op:pst:00001722': { ke: 'op:pst:00001444', dari: 'Cocus viridis', jadi: 'Coccus viridis', dasar: 'genus' },
  'op:pst:00001954': { ke: 'op:pst:00001043', dari: 'Collectotricum capsici', jadi: 'Colletotrichum capsici', dasar: 'genus' },
  'op:pst:00001622': { ke: 'op:pst:00001081', dari: 'Colletothricum gloeosporioides', jadi: 'Colletotrichum gloeosporioides', dasar: 'genus' },
  'op:pst:00002160': { ke: 'op:pst:00001326', dari: 'Colletotrichum circinas', jadi: 'Colletotrichum circinans', dasar: 'epitet' },
  'op:pst:00002059': { ke: 'op:pst:00001081', dari: 'Colletotrichum gleosporiodes', jadi: 'Colletotrichum gloeosporioides', dasar: 'epitet' },
  'op:pst:00001567': { ke: 'op:pst:00001043', dari: 'Colletrotichum capsici', jadi: 'Colletotrichum capsici', dasar: 'genus' },
  'op:pst:00001783': { ke: 'op:pst:00001296', dari: 'Coptermes gestroi', jadi: 'Coptotermes gestroi', dasar: 'genus' },
  'op:pst:00002078': { ke: 'op:pst:00001061', dari: 'Coptotermes cuvignathus', jadi: 'Coptotermes curvignathus', dasar: 'epitet' },
  'op:pst:00002127': { ke: 'op:pst:00001047', dari: 'Crcidolomia pavonana', jadi: 'Crocidolomia pavonana', dasar: 'genus' },
  'op:pst:00001568': { ke: 'op:pst:00001020', dari: 'Cromolaena odorata', jadi: 'Chromolaena odorata', dasar: 'genus' },
  'op:pst:00001810': { ke: 'op:pst:00001034', dari: 'Cyanodon dactylon', jadi: 'Cynodon dactylon', dasar: 'genus' },
  'op:pst:00002290': { ke: 'op:pst:00001072', dari: 'Cyperus cylingia', jadi: 'Cyperus kyllingia', dasar: 'epitet' },
  'op:pst:00001869': { ke: 'op:pst:00001130', dari: 'Cyptotermes cynocephalus', jadi: 'Cryptotermes cynocephalus', dasar: 'genus' },
  'op:pst:00002069': { ke: 'op:pst:00001137', dari: 'Dactiloctenium aegyptum', jadi: 'Dactyloctenium aegyptium', dasar: 'genus+epitet' },
  'op:pst:00001261': { ke: 'op:pst:00001068', dari: 'Digitaria adcendens', jadi: 'Digitaria adscendens', dasar: 'epitet' },
  'op:pst:00001647': { ke: 'op:pst:00001068', dari: 'Digitaria ascendens', jadi: 'Digitaria adscendens', dasar: 'epitet' },
  'op:pst:00001398': { ke: 'op:pst:00001008', dari: 'Digitaria cliaris', jadi: 'Digitaria ciliaris', dasar: 'epitet' },
  'op:pst:00001770': { ke: 'op:pst:00001008', dari: 'Digitaria cliliaris', jadi: 'Digitaria ciliaris', dasar: 'epitet' },
  'op:pst:00001761': { ke: 'op:pst:00002332', dari: 'Dydimella bryoniae', jadi: 'Didymella bryoniae', dasar: 'genus' },
  'op:pst:00002145': { ke: 'op:pst:00001031', dari: 'Echinochiloa crus-galli', jadi: 'Echinochloa crus-galli', dasar: 'genus' },
  'op:pst:00001607': { ke: 'op:pst:00001031', dari: 'Echinochla crus-galli', jadi: 'Echinochloa crus-galli', dasar: 'genus' },
  'op:pst:00001943': { ke: 'op:pst:00001031', dari: 'Echinochlia cruss-galli', jadi: 'Echinochloa crus-galli', dasar: 'genus+epitet' },
  'op:pst:00002187': { ke: 'op:pst:00001031', dari: 'Echinochlo crus-galli', jadi: 'Echinochloa crus-galli', dasar: 'genus' },
  'op:pst:00001490': { ke: 'op:pst:00001031', dari: 'Echinochloa crus-galii', jadi: 'Echinochloa crus-galli', dasar: 'epitet' },
  'op:pst:00001583': { ke: 'op:pst:00001031', dari: 'Echinochloa crusgalii', jadi: 'Echinochloa crus-galli', dasar: 'epitet' },
  'op:pst:00001109': { ke: 'op:pst:00001031', dari: 'Echinochloa crusgalli', jadi: 'Echinochloa crus-galli', dasar: 'epitet' },
  'op:pst:00001343': { ke: 'op:pst:00001031', dari: 'Echinochloa cruss-gali', jadi: 'Echinochloa crus-galli', dasar: 'epitet' },
  'op:pst:00001893': { ke: 'op:pst:00001031', dari: 'Echinochloa cruss-galii', jadi: 'Echinochloa crus-galli', dasar: 'epitet' },
  'op:pst:00001071': { ke: 'op:pst:00001031', dari: 'Echinochloa cruss-galli', jadi: 'Echinochloa crus-galli', dasar: 'epitet' },
  'op:pst:00001476': { ke: 'op:pst:00001031', dari: 'Echinochloa crussgalli', jadi: 'Echinochloa crus-galli', dasar: 'epitet' },
  'op:pst:00001439': { ke: 'op:pst:00001031', dari: 'Echinocloa crus-galli', jadi: 'Echinochloa crus-galli', dasar: 'genus' },
  'op:pst:00001554': { ke: 'op:pst:00001031', dari: 'Echinocloa cruss-galli', jadi: 'Echinochloa crus-galli', dasar: 'genus+epitet' },
  'op:pst:00001752': { ke: 'op:pst:00001031', dari: 'Echiochloa crus-galli', jadi: 'Echinochloa crus-galli', dasar: 'genus' },
  'op:pst:00001493': { ke: 'op:pst:00001013', dari: 'Elusine indica', jadi: 'Eleusine indica', dasar: 'genus' },
  'op:pst:00001947': { ke: 'op:pst:00001105', dari: 'Erigon sumatrensis', jadi: 'Erigeron sumatrensis', dasar: 'genus' },
  'op:pst:00001806': { ke: 'op:pst:00001055', dari: 'Etiella zickenella', jadi: 'Etiella zinckenella', dasar: 'epitet' },
  'op:pst:00001505': { ke: 'op:pst:00001013', dari: 'Eulesine indica', jadi: 'Eleusine indica', dasar: 'genus' },
  'op:pst:00002295': { ke: 'op:pst:00001013', dari: 'Euleusine indica', jadi: 'Eleusine indica', dasar: 'genus' },
  'op:pst:00001776': { ke: 'op:pst:00001024', dari: 'Fibristylis miliacea', jadi: 'Fimbristylis miliacea', dasar: 'genus' },
  'op:pst:00001473': { ke: 'op:pst:00001024', dari: 'Fimbristilys miliacea', jadi: 'Fimbristylis miliacea', dasar: 'genus' },
  'op:pst:00001944': { ke: 'op:pst:00001024', dari: 'Fimbritylis milicea', jadi: 'Fimbristylis miliacea', dasar: 'genus+epitet' },
  'op:pst:00001350': { ke: 'op:pst:00001024', dari: 'Fimbrystilis miliacea', jadi: 'Fimbristylis miliacea', dasar: 'genus' },
  'op:pst:00001335': { ke: 'op:pst:00001024', dari: 'Fimbrystylis milicea', jadi: 'Fimbristylis miliacea', dasar: 'genus+epitet' },
  'op:pst:00001803': { ke: 'op:pst:00001085', dari: 'Frimbristylis littoralis', jadi: 'Fimbristylis littoralis', dasar: 'genus' },
  'op:pst:00001922': { ke: 'op:pst:00001024', dari: 'Frimbristylis miliacea', jadi: 'Fimbristylis miliacea', dasar: 'genus' },
  'op:pst:00001483': { ke: 'op:pst:00001233', dari: 'Grassocephalum crepidiodes', jadi: 'Crassocephalum crepidioides', dasar: 'genus+epitet' },
  'op:pst:00002025': { ke: 'op:pst:00001038', dari: 'Heclicoverpa armigera', jadi: 'Helicoverpa armigera', dasar: 'genus' },
  'op:pst:00001457': { ke: 'op:pst:00001038', dari: 'Helicoverpa amigera', jadi: 'Helicoverpa armigera', dasar: 'epitet' },
  'op:pst:00002087': { ke: 'op:pst:00001591', dari: 'Heliotropenium indicum', jadi: 'Heliotropium indicum', dasar: 'genus' },
  'op:pst:00002272': { ke: 'op:pst:00002066', dari: 'Hermitarsonemus latus', jadi: 'Hemitarsonemus latus', dasar: 'genus' },
  'op:pst:00002152': { ke: 'op:pst:00001458', dari: 'Hyprosida talaca', jadi: 'Hyposidra talaca', dasar: 'genus' },
  'op:pst:00002212': { ke: 'op:pst:00001025', dari: 'Imerata cylindrica', jadi: 'Imperata cylindrica', dasar: 'genus' },
  'op:pst:00001912': { ke: 'op:pst:00001059', dari: 'Ipomia triloba', jadi: 'Ipomoea triloba', dasar: 'genus' },
  'op:pst:00001155': { ke: 'op:pst:00001012', dari: 'Ishaemum timorense', jadi: 'Ischaemum timorense', dasar: 'genus' },
  'op:pst:00002284': { ke: 'op:pst:00001549', dari: 'Jussica repens', jadi: 'Jussiaea repens', dasar: 'genus' },
  'op:pst:00001616': { ke: 'op:pst:00001029', dari: 'Lephtocloa chinensis', jadi: 'Leptochloa chinensis', dasar: 'genus' },
  'op:pst:00001945': { ke: 'op:pst:00001029', dari: 'Leptochloa cinensis', jadi: 'Leptochloa chinensis', dasar: 'epitet' },
  'op:pst:00002123': { ke: 'op:pst:00002263', dari: 'Lindemia antipoda', jadi: 'Lindernia antipoda', dasar: 'genus' },
  'op:pst:00002285': { ke: 'op:pst:00001048', dari: 'Liriomyza hudobrensis', jadi: 'Liriomyza huidobrensis', dasar: 'epitet' },
  'op:pst:00002020': { ke: 'op:pst:00001048', dari: 'Liriomyza huidobrensism', jadi: 'Liriomyza huidobrensis', dasar: 'epitet' },
  'op:pst:00001809': { ke: 'op:pst:00001032', dari: 'Lyriomiza chinensis', jadi: 'Liriomyza chinensis', dasar: 'genus' },
  'op:pst:00001634': { ke: 'op:pst:00001036', dari: 'Marselia crenata', jadi: 'Marsilea crenata', dasar: 'genus' },
  'op:pst:00002342': { ke: 'op:pst:00001412', dari: 'Melochia chorcorifolia', jadi: 'Melochia corchorifolia', dasar: 'epitet' },
  'op:pst:00001835': { ke: 'op:pst:00001036', dari: 'Mersilea creneta', jadi: 'Marsilea crenata', dasar: 'genus+epitet' },
  'op:pst:00001327': { ke: 'op:pst:00001005', dari: 'Micania micrantha', jadi: 'Mikania micrantha', dasar: 'genus' },
  'op:pst:00001842': { ke: 'op:pst:00001308', dari: 'Momonorium pharaonis', jadi: 'Monomorium pharaonis', dasar: 'genus' },
  'op:pst:00001799': { ke: 'op:pst:00001168', dari: 'Nepotettix viriescens', jadi: 'Nephotettix virescens', dasar: 'genus+epitet' },
  'op:pst:00001577': { ke: 'op:pst:00001009', dari: 'Nilaparvata iugens', jadi: 'Nilaparvata lugens', dasar: 'epitet' },
  'op:pst:00001449': { ke: 'op:pst:00001009', dari: 'Nilapavarta lugens', jadi: 'Nilaparvata lugens', dasar: 'genus' },
  'op:pst:00001201': { ke: 'op:pst:00001009', dari: 'Nilavarpata lugens', jadi: 'Nilaparvata lugens', dasar: 'genus' },
  'op:pst:00001532': { ke: 'op:pst:00001002', dari: 'Otochloa nodosa', jadi: 'Ottochloa nodosa', dasar: 'genus' },
  'op:pst:00001717': { ke: 'op:pst:00001112', dari: 'Oxya cinensis', jadi: 'Oxya chinensis', dasar: 'epitet' },
  'op:pst:00001880': { ke: 'op:pst:00001351', dari: 'Phyllocnitis critrella', jadi: 'Phyllocnistis citrella', dasar: 'genus+epitet' },
  'op:pst:00002291': { ke: 'op:pst:00001037', dari: 'Phyricularia oryzae', jadi: 'Pyricularia oryzae', dasar: 'genus' },
  'op:pst:00001267': { ke: 'op:pst:00001010', dari: 'Phythophtora infestans', jadi: 'Phytophthora infestans', dasar: 'golongan' },
  'op:pst:00001216': { ke: 'op:pst:00001010', dari: 'Phythopthora infestans', jadi: 'Phytophthora infestans', dasar: 'golongan' },
  'op:pst:00002049': { ke: 'op:pst:00001097', dari: 'Phythopthora palmivora', jadi: 'Phytophthora palmivora', dasar: 'golongan' },
  'op:pst:00002048': { ke: 'op:pst:00001135', dari: 'Phytophora capsici', jadi: 'Phytophthora capsici', dasar: 'golongan' },
  'op:pst:00001522': { ke: 'op:pst:00001010', dari: 'Phytophthora insfestans', jadi: 'Phytophthora infestans', dasar: 'epitet' },
  'op:pst:00001687': { ke: 'op:pst:00001097', dari: 'Phytoptora palmivora', jadi: 'Phytophthora palmivora', dasar: 'golongan' },
  'op:pst:00002266': { ke: 'op:pst:00001164', dari: 'Plusia calchites', jadi: 'Plusia chalcites', dasar: 'epitet' },
  'op:pst:00002352': { ke: 'op:pst:00001069', dari: 'Portula oleracea', jadi: 'Portulaca oleracea', dasar: 'genus' },
  'op:pst:00001344': { ke: 'op:pst:00001037', dari: 'Pycularia oryzae', jadi: 'Pyricularia oryzae', dasar: 'genus' },
  'op:pst:00002192': { ke: 'op:pst:00001089', dari: 'Rattus orgentiventer', jadi: 'Rattus argentiventer', dasar: 'epitet' },
  'op:pst:00001890': { ke: 'op:pst:00001027', dari: 'Rhicardia brasiliensis', jadi: 'Richardia brasiliensis', dasar: 'genus' },
  'op:pst:00002035': { ke: 'op:pst:00001564', dari: 'Rottbelia cochinchinensis', jadi: 'Rottboellia cochinchinensis', dasar: 'genus' },
  'op:pst:00001206': { ke: 'op:pst:00001023', dari: 'Schirpophaga incertulas', jadi: 'Scirpophaga incertulas', dasar: 'genus' },
  'op:pst:00001427': { ke: 'op:pst:00001023', dari: 'Scirphopaga incertulas', jadi: 'Scirpophaga incertulas', dasar: 'genus' },
  'op:pst:00001965': { ke: 'op:pst:00001553', dari: 'Selenopsis germinata', jadi: 'Solenopsis geminata', dasar: 'genus+epitet' },
  'op:pst:00002328': { ke: 'op:pst:00001021', dari: 'Setaria flicata', jadi: 'Setaria plicata', dasar: 'epitet' },
  'op:pst:00002064': { ke: 'op:pst:00001023', dari: 'Sirpophaga incertulas', jadi: 'Scirpophaga incertulas', dasar: 'genus' },
  'op:pst:00002358': { ke: 'op:pst:00001162', dari: 'Sitophylus zeamays', jadi: 'Sitophilus zeamais', dasar: 'genus+epitet' },
  'op:pst:00001386': { ke: 'op:pst:00001553', dari: 'Solenopsis germinate', jadi: 'Solenopsis geminata', dasar: 'epitet' },
  'op:pst:00001051': { ke: 'op:pst:00001113', dari: 'Spenochlea zeylanica', jadi: 'Sphenoclea zeylanica', dasar: 'genus' },
  'op:pst:00001467': { ke: 'op:pst:00001113', dari: 'Spenoclea zeylanica', jadi: 'Sphenoclea zeylanica', dasar: 'genus' },
  'op:pst:00002339': { ke: 'op:pst:00001113', dari: 'Sphenochloa zeylanica', jadi: 'Sphenoclea zeylanica', dasar: 'genus' },
  'op:pst:00001665': { ke: 'op:pst:00001113', dari: 'Sphenochloea zeylanica', jadi: 'Sphenoclea zeylanica', dasar: 'genus' },
  'op:pst:00002014': { ke: 'op:pst:00001113', dari: 'Sphenocholea zeylanica', jadi: 'Sphenoclea zeylanica', dasar: 'genus' },
  'op:pst:00001741': { ke: 'op:pst:00001113', dari: 'Sphenodea zeylanica', jadi: 'Sphenoclea zeylanica', dasar: 'genus' },
  'op:pst:00001898': { ke: 'op:pst:00001033', dari: 'Spodoptera fungiperda', jadi: 'Spodoptera frugiperda', dasar: 'epitet' },
  'op:pst:00001690': { ke: 'op:pst:00000005', dari: 'Sprodoptera litura', jadi: 'Spodoptera litura', dasar: 'genus' },
  'op:pst:00002003': { ke: 'op:pst:00001289', dari: 'Stachytarpetha jamaicensis', jadi: 'Stachytarpheta jamaicensis', dasar: 'genus' },
  'op:pst:00002312': { ke: 'op:pst:00001289', dari: 'Strachytarpheta jamaicensis', jadi: 'Stachytarpheta jamaicensis', dasar: 'genus' },
  'op:pst:00001840': { ke: 'op:pst:00001004', dari: 'Synedrella modiflora', jadi: 'Synedrella nodiflora', dasar: 'epitet' },
  'op:pst:00001668': { ke: 'op:pst:00000001', dari: 'Thrips palrvispinus', jadi: 'Thrips parvispinus', dasar: 'epitet' },
  'op:pst:00001417': { ke: 'op:pst:00000001', dari: 'Trips parvispinus', jadi: 'Thrips parvispinus', dasar: 'genus' },
  'op:pst:00001519': { ke: 'op:pst:00001094', dari: 'Trips tabaci', jadi: 'Thrips tabaci', dasar: 'genus' },
  'op:pst:00001581': { ke: 'op:pst:00001399', dari: 'Tryporiza incertulas', jadi: 'Tryporyza incertulas', dasar: 'genus' },
};

const bacaJson = (p) => JSON.parse(readFileSync(join(VOCAB, p), 'utf8'));
const larik = (o) => (Array.isArray(o) ? o : o[Object.keys(o).find((k) => Array.isArray(o[k]))]);

const bungkusRegistri = bacaJson('pest-registri.json');
const bungkusKurasi = bacaJson('pest.json');
const semua = [...larik(bungkusKurasi), ...larik(bungkusRegistri)];
const olehId = new Map(semua.map((e) => [e.id, e]));
const hidup = semua.filter((e) => e.lifecycle?.status !== 'superseded');

// ---------------------------------------------------------------------------
// Penjaga 1: tabel harus masih cocok dengan datanya
// ---------------------------------------------------------------------------
// Tabel yang dibekukan jadi berbahaya begitu sumbernya berubah: nama yang dicatat di
// sini harus masih nama yang dipegang entitasnya, kalau tidak, id yang sama sudah
// menunjuk organisme lain dan penyatuannya jadi salah tanpa suara.
const basi = [];
for (const [id, p] of Object.entries(GABUNG)) {
  const dari = olehId.get(id);
  const ke = olehId.get(p.ke);
  if (!dari || !ke) { basi.push(`${id} atau ${p.ke} tidak ada lagi`); continue; }
  if (dari.lifecycle?.status === 'superseded') continue; // sudah dikerjakan
  if (dari.scientific_name !== p.dari) basi.push(`${id} kini bernama ${JSON.stringify(dari.scientific_name)}, tabel mencatat ${JSON.stringify(p.dari)}`);
  if (ke.scientific_name !== p.jadi) basi.push(`${p.ke} kini bernama ${JSON.stringify(ke.scientific_name)}, tabel mencatat ${JSON.stringify(p.jadi)}`);
}
if (basi.length) {
  console.error('BERHENTI — tabel tidak lagi cocok dengan kosakata:');
  for (const b of basi) console.error(`  ${b}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Penjaga 2: calon baru yang belum ada putusannya
// ---------------------------------------------------------------------------
const jarak = (a, b) => {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
};
const bin = /^[A-Z][a-z]+ [a-z][a-z-]+$/;
const norm = (s) => s.toLowerCase().replace(/-/g, '');
const spesies = (e) => ['exact', 'fuzzy'].includes(e.taxon_verification?.match_type);
const sasaran = hidup.filter((e) => spesies(e) && bin.test(e.scientific_name ?? ''));
const genusSah = new Set(sasaran.map((e) => e.scientific_name.split(' ')[0].toLowerCase()));

const baru = [];
for (const g of hidup.filter((e) => !spesies(e) && bin.test(e.scientific_name ?? ''))) {
  if (GABUNG[g.id]) continue;
  const d = sasaran
    .map((s) => ({ s, t: jarak(norm(g.scientific_name), norm(s.scientific_name)) }))
    .filter((x) => x.t <= 2)
    .sort((a, b) => a.t - b.t);
  if (d.length !== 1) continue;
  if (genusSah.has(g.scientific_name.split(' ')[0].toLowerCase()) &&
      g.scientific_name.split(' ')[0].toLowerCase() !== d[0].s.scientific_name.split(' ')[0].toLowerCase()) continue;
  baru.push(`${g.id} ${JSON.stringify(g.scientific_name)} -> ${JSON.stringify(d[0].s.scientific_name)}`);
}
if (baru.length) {
  console.error(`BERHENTI — ${baru.length} calon tanpa putusan di tabel GABUNG:`);
  for (const b of baru) console.error(`  ${b}`);
  console.error('\nPeriksa satu per satu, lalu tambahkan ke tabel. Jangan biarkan skrip menebak.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Laporan
// ---------------------------------------------------------------------------
const kerja = Object.entries(GABUNG).filter(([id]) => olehId.get(id)?.lifecycle?.status !== 'superseded');
const NDJSON = join(VOCAB, 'product', 'pestisida.ndjson');
const baris = readFileSync(NDJSON, 'utf8').split('\n');
const pakai = new Map();
for (const b of baris) {
  if (!b.trim()) continue;
  for (const u of JSON.parse(b).label_uses ?? []) {
    const i = u.pest?.id;
    if (i) pakai.set(i, (pakai.get(i) ?? 0) + 1);
  }
}
const dasarHitung = {};
for (const [, p] of kerja) dasarHitung[p.dasar] = (dasarHitung[p.dasar] ?? 0) + 1;

console.log(`OPT hidup            : ${hidup.length}`);
console.log(`Putusan di tabel     : ${Object.keys(GABUNG).length}`);
console.log(`Belum dikerjakan     : ${kerja.length}  (${hidup.length} → ${hidup.length - kerja.length})`);
console.log(`Menurut dasar        : ${Object.entries(dasarHitung).map(([k, v]) => `${k} ${v}`).join(', ') || '—'}`);
console.log(`Rujukan produk       : ${kerja.reduce((a, [id]) => a + (pakai.get(id) ?? 0), 0)} penggunaan berlabel ikut dialihkan\n`);
for (const [id, p] of kerja.slice(0, 10)) console.log(`  ${p.dari.padEnd(31)} -> ${p.jadi.padEnd(30)} [${p.dasar}] ${pakai.get(id) ?? 0}x`);

if (!tulis) {
  console.log('\nPeriksa saja — jalankan dengan --tulis untuk menerapkan.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Terapkan
// ---------------------------------------------------------------------------
// Saringan kategori yang sama dengan satukan-opt-kembar.mjs: label yang dipakai
// entitas lain di luar penyatuan ini kategori, bukan nama organisme ini.
const pemakaiLabel = new Map();
for (const e of hidup) {
  const k = e.label.id.toLowerCase().replace(/\s+/g, ' ').trim();
  (pemakaiLabel.get(k) ?? pemakaiLabel.set(k, new Set()).get(k)).add(e.id);
}
const kategori = (nama, dalam) => {
  const k = String(nama).toLowerCase().replace(/\s+/g, ' ').trim();
  return [...(pemakaiLabel.get(k) ?? new Set())].some((id) => !dalam.has(id));
};

for (const [id, p] of kerja) {
  const e = olehId.get(id);
  const menang = olehId.get(p.ke);
  menang.synonyms ??= [];
  const dalam = new Set([id, p.ke]);
  for (const n of [e.scientific_name, e.label.id, ...(e.synonyms ?? [])]) {
    if (!n || n === menang.scientific_name || n === menang.label.id) continue;
    if (menang.synonyms.includes(n) || kategori(n, dalam)) continue;
    menang.synonyms.push(n);
  }
  for (const m of e.mappings ?? []) {
    if (!menang.mappings.some((x) => x.scheme === m.scheme && String(x.id) === String(m.id))) menang.mappings.push({ ...m });
  }
  menang.synonyms.sort();
  menang.mappings.sort((a, b) => a.scheme.localeCompare(b.scheme) || String(a.id).localeCompare(String(b.id)));
  menang.lifecycle = { ...(menang.lifecycle ?? {}), updated_at: STAMP };
  e.lifecycle = { ...(e.lifecycle ?? {}), status: 'superseded', updated_at: STAMP, superseded_by: { id: p.ke } };
}

const hidupId = new Set(semua.filter((e) => e.lifecycle?.status !== 'superseded').map((e) => e.id));
const ujung = (id, jejak = new Set()) => {
  if (hidupId.has(id) || jejak.has(id)) return id;
  jejak.add(id);
  const lanjut = olehId.get(id)?.lifecycle?.superseded_by?.id;
  return lanjut ? ujung(lanjut, jejak) : id;
};
let rantai = 0;
for (const e of semua) {
  const tuju = e.lifecycle?.superseded_by?.id;
  if (!tuju) continue;
  const akhir = ujung(tuju);
  if (akhir !== tuju) { e.lifecycle = { ...e.lifecycle, superseded_by: { id: akhir }, updated_at: STAMP }; rantai++; }
}

writeFileSync(join(VOCAB, 'pest-registri.json'), JSON.stringify(bungkusRegistri, null, 2) + '\n');
writeFileSync(join(VOCAB, 'pest.json'), JSON.stringify(bungkusKurasi, null, 2) + '\n');

const arah = new Map(kerja.map(([id, p]) => [id, p.ke]));
let ubah = 0;
const baruNdjson = baris.map((b) => {
  if (!b.trim()) return b;
  const p = JSON.parse(b);
  let berubah = false;
  for (const u of p.label_uses ?? []) {
    const ke = arah.get(u.pest?.id);
    if (!ke) continue;
    u.pest.id = ke;
    berubah = true;
  }
  if (!berubah) return b;
  ubah++;
  return JSON.stringify(p);
});
writeFileSync(NDJSON, baruNdjson.join('\n'));

console.log(`\nDitulis:`);
console.log(`  pest-registri.json, pest.json  — ${kerja.length} entitas jadi superseded, ${rantai} rantai diratakan`);
console.log(`  product/pestisida.ndjson       — ${ubah} rekaman`);
