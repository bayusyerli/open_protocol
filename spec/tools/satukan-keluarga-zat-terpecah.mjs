// Menyatukan KELUARGA bahan aktif yang terpecah di vocab/substance-pestisida.json —
// satu bahan yang terlanjur jadi tiga atau empat entitas karena registri menuliskan
// namanya dengan tiga atau empat ejaan.
//
//   node tools/satukan-keluarga-zat-terpecah.mjs            laporan saja
//   node tools/satukan-keluarga-zat-terpecah.mjs --tulis    terapkan
//
// ---------------------------------------------------------------------------
// Kenapa masih ada yang tersisa sesudah gabung-id-zat-kembar.mjs
// ---------------------------------------------------------------------------
// Sapuan pertama menyatukan 307 ejaan kembar, dan tabelnya disusun PER PASANG: satu
// ejaan yang kalah menunjuk satu ejaan yang menang. Keluarga yang pecah jadi lebih dari
// dua — "Etil Pirazosulfuron" (49 formulasi), "Pirazosulfuron etil" (3),
// "Pyrazosulfuron-ethyl" (4) — tidak pernah masuk ke tabel itu, karena tidak ada satu
// pasang yang menonjol. Yang menutup lubangnya bukan mata yang lebih awas, melainkan
// bukti yang sudah tertulis di berkas lain.
//
// ---------------------------------------------------------------------------
// Jaringnya: bukti, bukan kemiripan
// ---------------------------------------------------------------------------
// vocab/padanan-bahan-aktif.json sudah menggolongkan setiap tulisan bahan aktif dan
// menyebut nama kanoniknya beserta dasar buktinya. Calon penyatuan didefinisikan
// MEKANIS di atas berkas itu:
//
//   (a) `hubungan` bernilai "varian-ejaan" atau "sama-dengan"  — bukan garam, ester,
//       atau stereoisomer;
//   (b) `kanonik.nama` sama persis;
//   (c) `substance.id` berlainan.
//
// Tidak ada jarak edit, tidak ada ambang kemiripan, tidak ada daftar nama dari luar.
// Kalau padanan tidak berani menyebut nama kanoniknya, penyatuan tidak terjadi.
//
// GARIS YANG TIDAK DILANGGAR. Garam, ester, dan stereoisomer TIDAK disatukan. "parakuat
// diklorida" bukan ejaan lain dari "parakuat" — bobot molekulnya berbeda, dan justru
// itu sebabnya padanan-bahan-aktif.json menyimpan faktor kesetaraan 0,7246 untuknya.
// Hubungan induk-anak semacam itu memang tempatnya di sana; syarat (a) yang menjaga
// jaring ini tidak pernah menyentuhnya.
//
// Bukti itu juga yang MENOLAK satu keluarga yang tampak jelas: "Pirazosulfuron"
// telanjang (op:sub:00000568) bernama kanonik "pyrazosulfuron" — tanpa "-ethyl" —
// karena registri tidak pernah menuliskan nama internasional untuk tulisan itu. Ia
// mungkin asamnya, mungkin singkatan esternya. Syarat (b) meninggalkannya di luar, dan
// itu memang yang benar: menyatukannya butuh keputusan kimia, bukan keputusan identitas.
//
// ---------------------------------------------------------------------------
// Kenapa ini menyentuh empat berkas sekaligus
// ---------------------------------------------------------------------------
// L29 melarang rujukan menunjuk entitas berstatus "superseded". Empat berkas menunjuk
// op:sub: ke kosakata ini, dan semuanya harus ikut pindah dalam satu langkah:
//
//   vocab/substance-pestisida.json              entitasnya sendiri
//   vocab/product/pestisida.ndjson              composition[].substance
//   vocab/padanan-bahan-aktif.json              substance + induk.substance
//   vocab/golongan-resistensi/*.ndjson          satu rekaman per bahan aktif HIDUP
//
// Pada golongan resistensi rekaman yang kalah DIBUANG, bukan dipetakan ulang: berkas
// itu menjanjikan satu rekaman per bahan, dan dua rekaman untuk satu bahan membuat
// pencarian golongan bercabang tanpa aturan. Sebelum dibuang, kodenya dibandingkan
// dengan kode pemenangnya — kalau yang kalah punya kode yang tidak dimiliki pemenang,
// skrip berhenti.
//
// ---------------------------------------------------------------------------
// Penjagaan
// ---------------------------------------------------------------------------
// Skrip berhenti tanpa menulis apa pun bila:
//   * ada rantai A->B->C (pemenang satu kelompok jadi pecundang di kelompok lain);
//   * dua entitas yang disatukan sama-sama membawa mode_of_action, cas_number, atau
//     hazard dengan nilai BERBEDA — itu sengketa yang harus diputus orang;
//   * satu pendaftaran memuat dua kadar berbeda untuk id kanonik yang sama sesudah
//     pemetaan ulang (sengketa kadar);
//   * rekaman golongan resistensi yang kalah punya kode yang tidak dimiliki pemenang;
//   * penulis barisnya tidak setia pada rekaman yang tidak berubah.
//
// Idempoten: entitas yang sudah "superseded" dilewati, jadi jalan kedua tidak
// mengubah apa pun.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ZAT = join(AKAR, 'spec', 'vocab', 'substance-pestisida.json');
const PRODUK = join(AKAR, 'spec', 'vocab', 'product', 'pestisida.ndjson');
const PADANAN = join(AKAR, 'spec', 'vocab', 'padanan-bahan-aktif.json');
const GOL = join(AKAR, 'spec', 'vocab', 'golongan-resistensi', 'golongan-resistensi.ndjson');
const GOL_META = join(AKAR, 'spec', 'vocab', 'golongan-resistensi', 'golongan-resistensi.meta.json');

const STAMP = '2026-08-23T00:00:00Z';
const tulis = process.argv.includes('--tulis');
const PENANDA = 'Penyatuan keluarga ejaan: ';

// ---------------------------------------------------------------------------
// Pemenang yang dipaksa — dan alasannya
// ---------------------------------------------------------------------------
// Aturan bawaannya "bentuk terbanyak di registri", tiebreaker yang sama dipakai
// konvensi penyeragaman nama principal. Satu kelompok sengaja menyimpang darinya.
const KANONIK_PAKSA = {
  sulfur: {
    id: 'op:sub:00000006',
    dasar:
      'Yang dipakai op:sub:00000006 meskipun "SULFUR" sedikit lebih sering muncul di registri ' +
      '(10 formulasi lawan 9). Belerang salah satu dari tiga entitas yang dikurasi tangan dan ' +
      'pindah dari substance.json membawa nomornya — ia satu-satunya di kelompok ini yang ' +
      'bergolongan "nutrient", berbentuk hara S, bersatuan bawaan kg, dan dirujuk dari registri ' +
      'PUPUK sebagai hara belerang. Memenangkan ejaan registri akan memindahkan identitas hara ' +
      'itu ke entitas yang tidak pernah memilikinya, dan menyeret pupuk.ndjson ikut berubah.',
  },
};

// ---------------------------------------------------------------------------
// 1. Baca
// ---------------------------------------------------------------------------
const zatDoc = JSON.parse(readFileSync(ZAT, 'utf8'));
const zatById = new Map(zatDoc.items.map((e) => [e.id, e]));
const padDoc = JSON.parse(readFileSync(PADANAN, 'utf8'));
const barisProduk = readFileSync(PRODUK, 'utf8').split('\n');
const barisProdukIsi = barisProduk.filter((l) => l.trim());
const produk = barisProdukIsi.map((l) => JSON.parse(l));
const barisGol = readFileSync(GOL, 'utf8').split('\n').filter((l) => l.trim());
const gol = barisGol.map((l) => JSON.parse(l));
const golMeta = JSON.parse(readFileSync(GOL_META, 'utf8'));

const gagal = [];
const hidup = (e) => e && e.lifecycle?.status !== 'superseded';

// ---------------------------------------------------------------------------
// 2. Jaring — kelompok terpecah menurut bukti di padanan-bahan-aktif.json
// ---------------------------------------------------------------------------
const kelompok = new Map();
for (const b of padDoc.padanan_items) {
  if (b.hubungan !== 'varian-ejaan' && b.hubungan !== 'sama-dengan') continue;
  const nama = b.kanonik?.nama;
  const id = b.substance?.id;
  if (!nama || !id) continue;
  if (!kelompok.has(nama)) kelompok.set(nama, []);
  kelompok.get(nama).push(b);
}

// Label yang membawa anotasi registri — kadar, nama dalam kurung, klausa kesetaraan.
// Bukan pembeda utama, hanya pemutus seri: pada dua bentuk yang sama-sama jarang, yang
// polos lebih pantas jadi nama kanonik daripada yang membawa "…: 96 %".
const beranotasi = (t) => /[:(%]|setara/i.test(String(t));

const rencana = [];
for (const [nama, baris] of [...kelompok].sort((a, b) => a[0].localeCompare(b[0]))) {
  const ids = [...new Set(baris.map((b) => b.substance.id))];
  if (ids.length < 2) continue;
  const mati = ids.filter((id) => !hidup(zatById.get(id)));
  if (mati.length === ids.length - 1) continue; // sudah disatukan pada jalan sebelumnya
  if (mati.length) {
    gagal.push(`Kelompok "${nama}" separuh tersatukan: ${mati.join(', ')} sudah superseded — ratakan tangan.`);
    continue;
  }
  const formulasi = new Map();
  for (const b of baris) formulasi.set(b.substance.id, (formulasi.get(b.substance.id) ?? 0) + b.formulasi);
  const paksa = KANONIK_PAKSA[nama];
  const urut = [...ids].sort((a, b) =>
    (formulasi.get(b) - formulasi.get(a)) ||
    (beranotasi(zatById.get(a).label.id) - beranotasi(zatById.get(b).label.id)) ||
    a.localeCompare(b));
  const menang = paksa ? paksa.id : urut[0];
  if (paksa && !ids.includes(paksa.id)) {
    gagal.push(`KANONIK_PAKSA untuk "${nama}" menunjuk ${paksa.id} yang bukan anggota kelompok.`);
    continue;
  }
  rencana.push({
    nama,
    menang,
    kalah: urut.filter((id) => id !== menang),
    formulasi,
    baris,
    paksa: paksa?.dasar,
  });
}

// ---------------------------------------------------------------------------
// 3. Penjagaan sebelum apa pun disentuh
// ---------------------------------------------------------------------------
const peta = new Map(); // id kalah -> id menang
for (const r of rencana) for (const id of r.kalah) peta.set(id, r.menang);
const pemenang = new Set(rencana.map((r) => r.menang));
for (const id of peta.keys()) {
  if (pemenang.has(id)) gagal.push(`${id} jadi pemenang di satu kelompok dan pecundang di kelompok lain — rantai penggantian.`);
}

const kunciSama = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const konflik = [];
for (const [kalahId, menangId] of peta) {
  const kalah = zatById.get(kalahId);
  const menang = zatById.get(menangId);
  for (const f of ['mode_of_action', 'cas_number', 'hazard']) {
    if (kalah[f] === undefined || menang[f] === undefined) continue;
    if (!kunciSama(kalah[f], menang[f])) {
      konflik.push(`${f}: ${kalahId} "${kalah.label.id}" vs ${menangId} "${menang.label.id}" — ` +
        `${JSON.stringify(kalah[f])} lawan ${JSON.stringify(menang[f])}`);
    }
  }
}
if (konflik.length) {
  gagal.push('Sengketa medan yang tidak boleh diputus skrip — dua entitas sama-sama membawanya dengan nilai berbeda:');
  for (const k of konflik) gagal.push(`  ${k}`);
}

// ---------------------------------------------------------------------------
// 4. Kosakata zat
// ---------------------------------------------------------------------------
const dipindah = { pesticide_action: 0, substance_classes: 0, mode_of_action: 0, cas_number: 0, hazard: 0, organism: 0, default_unit: 0, definition: 0 };
if (!gagal.length) {
  for (const r of rencana) {
    const menang = zatById.get(r.menang);
    for (const kalahId of r.kalah) {
      const kalah = zatById.get(kalahId);

      // Apa pun yang hanya dimiliki yang kalah akan hilang begitu rujukannya pindah.
      for (const f of ['substance_classes', 'pesticide_action']) {
        const tambahan = (kalah[f] ?? []).filter((x) => !(menang[f] ?? []).includes(x));
        if (tambahan.length) {
          menang[f] = [...(menang[f] ?? []), ...tambahan];
          dipindah[f] += tambahan.length;
        }
      }
      for (const f of ['mode_of_action', 'cas_number', 'hazard', 'organism', 'default_unit', 'definition']) {
        if (kalah[f] !== undefined && menang[f] === undefined) {
          menang[f] = kalah[f];
          dipindah[f]++;
        }
      }

      // Ejaan yang kalah jadi synonyms pemenang — di repositori ini synonyms memang
      // berarti "ejaan lain yang pernah ditulis registri", bukan padanan kimia.
      const synonyms = [...new Set([...(menang.synonyms ?? []), kalah.label.id, ...(kalah.synonyms ?? [])])];
      if (synonyms.length !== (menang.synonyms ?? []).length) menang.synonyms = synonyms;
      menang.lifecycle = { ...menang.lifecycle, updated_at: STAMP };

      // Baris padanan yang paling banyak menopang kedua sisi — dipakai sebagai kutipan.
      const barisKalah = r.baris.filter((b) => b.substance.id === kalahId).sort((a, b) => b.formulasi - a.formulasi)[0];
      const barisMenang = r.baris.filter((b) => b.substance.id === r.menang).sort((a, b) => b.formulasi - a.formulasi)[0];
      const kutipan = barisKalah.kanonik?.kutipan ?? barisMenang.kanonik?.kutipan;
      const dasarPilih = r.paksa
        ? r.paksa
        : `Yang dipakai ${r.menang} karena ia bentuk terbanyak di registri — ` +
          `${r.formulasi.get(r.menang)} formulasi lawan ${r.formulasi.get(kalahId)}.`;

      kalah.lifecycle = { ...kalah.lifecycle, status: 'superseded', updated_at: STAMP, superseded_by: { id: r.menang } };
      kalah.notes = {
        id:
          `${PENANDA}digantikan ${r.menang} "${menang.label.id}" — bahan yang sama, terdaftar lebih ` +
          `dari sekali karena namanya ditulis berbeda di registri. Sapuan penggabungan yang pertama ` +
          `bekerja per pasang tulisan, sehingga keluarga yang pecah jadi tiga atau empat ejaan lolos ` +
          `darinya. Buktinya sudah tertulis di padanan-bahan-aktif.json: kunci "${barisKalah.kunci}" ` +
          `(${barisKalah.hubungan}) dan kunci "${barisMenang.kunci}" (${barisMenang.hubungan}) sama-sama ` +
          `bernama kanonik "${r.nama}"` +
          (kutipan ? `, dan registri sendiri yang menuliskan "${kutipan}"` : '') + `. ${dasarPilih} ` +
          `Entitas ini sengaja tidak dihapus: ID tidak pernah didaur ulang, dan ejaan registri yang asli ` +
          `beserta pemetaannya masih perlu bisa ditelusuri.`,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// 4b. Rantai penggantian diratakan
// ---------------------------------------------------------------------------
// Sapuan pertama sudah menaruh 307 entitas di belakang penggantinya. Sebagian
// pengganti itu sekarang ikut disatukan, sehingga A -> B -> C. L29 memeriksa
// lifecycle.superseded_by seperti rujukan lain dan menolak A yang masih menunjuk B,
// dan ia benar: pemakai yang berhenti di B berhenti di tempat yang salah.
let rantai = 0;
if (!gagal.length) {
  for (const e of zatDoc.items) {
    const tuju = e.lifecycle?.superseded_by?.id;
    if (!tuju) continue;
    let akhir = tuju;
    for (let h = 0; h < 10; h++) {
      const berikut = zatById.get(akhir)?.lifecycle?.superseded_by?.id;
      if (!berikut || berikut === akhir) break;
      akhir = berikut;
    }
    if (akhir === tuju) continue;
    if (!hidup(zatById.get(akhir))) { gagal.push(`Rantai dari ${e.id} berujung di ${akhir} yang juga superseded.`); continue; }
    e.lifecycle = { ...e.lifecycle, superseded_by: { id: akhir }, updated_at: STAMP };
    const sambungan =
      ` Rantainya kemudian diratakan: ${tuju} "${zatById.get(tuju).label.id}" sendiri ikut disatukan ke ` +
      `${akhir} "${zatById.get(akhir).label.id}", jadi penggantinya pindah ke sana — rujukan yang berhenti ` +
      `di tengah rantai berhenti di tempat yang salah.`;
    if (e.notes?.id && !e.notes.id.includes('Rantainya kemudian diratakan')) {
      e.notes = { ...e.notes, id: e.notes.id + sambungan };
    }
    rantai++;
  }
}

// ---------------------------------------------------------------------------
// 5. Registri produk — pemetaan ulang dan peleburan entri yang jadi kembar persis
// ---------------------------------------------------------------------------
// Penulis baris meniru gaya berkasnya sendiri. Berkas ini ditulis dua tangan: 6.113
// baris bergaya json.dumps Python dan 1.611 baris bergaya JSON.stringify Node. Menulis
// ulang seluruhnya dengan satu gaya akan mengubah ribuan baris yang tidak ada urusannya
// dengan penyatuan ini, jadi gaya tiap baris dipertahankan apa adanya.
const gayaPython = (v) => {
  if (v === null) return 'null';
  if (typeof v === 'number') return Number.isInteger(v) ? `${v}.0` : String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(gayaPython).join(', ')}]`;
  return `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${gayaPython(x)}`).join(', ')}}`;
};
const gayaAsli = barisProdukIsi.map((l, i) => (JSON.stringify(produk[i]) === l ? 'node' : 'python'));
const tulisBaris = (o, gaya) => (gaya === 'node' ? JSON.stringify(o) : gayaPython(o));
barisProdukIsi.forEach((l, i) => {
  if (tulisBaris(produk[i], gayaAsli[i]) !== l) gagal.push(`Penulis baris tidak setia pada rekaman produk ke-${i + 1}.`);
});

const stat = { produkBerubah: 0, entriDipetakan: 0, entriLebur: 0, produkBerkurang: 0 };
const sengketa = [];
const produkBerubah = new Set();

if (!gagal.length) {
  produk.forEach((rec, i) => {
    const asli = rec.composition ?? [];
    if (!asli.some((e) => peta.has(e.substance?.id))) return;

    const rapi = [];
    const posisi = new Map();
    const dilebur = [];
    for (const e of asli) {
      const lama = e.substance.id;
      const baru = peta.get(lama) ?? lama;
      if (baru !== lama) stat.entriDipetakan++;
      const tanda = `${baru}|${e.value}|${e.unit}`;
      if (posisi.has(tanda)) {
        // Kembar persis sesudah pemetaan: satu bahan yang terhitung dua kali karena
        // registri menuliskan namanya dua kali dengan ejaan berbeda pada pendaftaran
        // yang sama. Ini justru cacat yang dicari — dilebur, dan dicatat.
        dilebur.push(e);
        stat.entriLebur++;
        continue;
      }
      posisi.set(tanda, rapi.length);
      // Label TIDAK ditulis ulang: ia nama sebagaimana registri menuliskannya untuk
      // pendaftaran ini, bukan salinan nama kanonik.
      rapi.push({ substance: { id: baru, label: e.substance.label }, value: e.value, unit: e.unit });
    }

    // Satu id kanonik dengan dua kadar berbeda bukan ulangan melainkan sengketa.
    const perId = new Map();
    for (const e of rapi) {
      if (!perId.has(e.substance.id)) perId.set(e.substance.id, new Set());
      perId.get(e.substance.id).add(`${e.value} ${e.unit}`);
    }
    for (const [id, nilai] of perId) {
      if (nilai.size > 1) sengketa.push(`${rec.key} (${rec.label?.id}) — ${id}: ${[...nilai].join(', ')}`);
    }

    if (JSON.stringify(rapi) === JSON.stringify(asli)) return;
    rec.composition = rapi;
    rec.lifecycle = { ...rec.lifecycle, updated_at: STAMP };
    stat.produkBerubah++;
    produkBerubah.add(i);

    if (!dilebur.length) return;
    stat.produkBerkurang++;
    const daftar = [...new Set(dilebur.map((e) =>
      `"${e.substance.label}" (${e.substance.id} -> ${peta.get(e.substance.id) ?? e.substance.id})`))].join('; ');
    const paragraf =
      `${PENANDA}${daftar} dilebur ke entri yang sudah ada. Registri menuliskan bahan yang sama dua ` +
      `kali pada pendaftaran ini dengan ejaan berbeda, sehingga kadarnya terjumlah dua kali; sesudah ` +
      `kedua ejaan jatuh ke satu id, entri yang persis sama nilai dan satuannya tinggal satu. ` +
      `Komposisi sesudah disatukan: ${rapi.map((e) => `${e.substance.label} ${e.value} ${e.unit}`).join(' + ')}. ` +
      `Nama lama tetap terbaca pada entitas yang digantikan; entitas itu tidak dihapus, statusnya ` +
      `"superseded" dan menunjuk penggantinya.`;
    const sebelumnya = rec.notes?.id ?? '';
    const potong = sebelumnya.indexOf(PENANDA);
    const awalan = (potong === -1 ? sebelumnya : sebelumnya.slice(0, potong)).trim();
    rec.notes = { ...rec.notes, id: awalan ? `${awalan} ${paragraf}` : paragraf };
  });
}
if (sengketa.length) {
  gagal.push('Sengketa kadar sesudah pemetaan ulang — dua angka untuk bahan yang sama pada satu pendaftaran:');
  for (const s of sengketa) gagal.push(`  ${s}`);
}

// ---------------------------------------------------------------------------
// 6. Padanan bahan aktif — rujukan diarahkan ulang ke pemenangnya
// ---------------------------------------------------------------------------
const statPadanan = { substance: 0, induk: 0 };
if (!gagal.length) {
  for (const b of padDoc.padanan_items) {
    for (const [medan, obj] of [['substance', b], ['induk', b.induk]]) {
      const ref = obj?.substance;
      if (!ref?.id) continue;
      const baru = peta.get(ref.id);
      if (!baru) continue;
      ref.id = baru;
      ref.label = zatById.get(baru).label.id;
      statPadanan[medan]++;
    }
  }
}

// ---------------------------------------------------------------------------
// 7. Golongan resistensi — rekaman yang kalah dibuang, bukan dipetakan ulang
// ---------------------------------------------------------------------------
const statGol = { dibuang: 0, prosaBeda: 0, silangDibetulkan: 0 };
let golBaru = gol;
if (!gagal.length) {
  const olehZat = new Map(gol.map((r) => [r.substance.id, r]));
  const kode = (r) => JSON.stringify((r?.codes ?? []).map((c) => `${c.scheme}:${c.code}`).sort());
  for (const [kalahId, menangId] of peta) {
    const rk = olehZat.get(kalahId);
    const rm = olehZat.get(menangId);
    if (!rk) continue;
    if (!rm) { gagal.push(`Rekaman golongan untuk ${kalahId} akan dibuang, tetapi pemenangnya ${menangId} tidak punya rekaman.`); continue; }
    if (kode(rk) !== kode(rm)) {
      const hilang = (rk.codes ?? []).filter((c) => !(rm.codes ?? []).some((d) => d.scheme === c.scheme && d.code === c.code));
      if (hilang.length) {
        gagal.push(`Rekaman golongan ${kalahId} "${rk.substance.label}" punya kode ${hilang.map((c) => `${c.scheme} ${c.code}`).join(', ')} ` +
          `yang tidak dimiliki pemenangnya ${menangId} "${rm.substance.label}" — pindahkan dulu.`);
      }
    }
    if ((rk.unmapped_reason ?? null) !== (rm.unmapped_reason ?? null) || JSON.stringify(rk.note ?? null) !== JSON.stringify(rm.note ?? null)) {
      statGol.prosaBeda++;
    }
    // Rujuk silang "Lihat catatan pada entri X" yang menunjuk rekaman yang dibuang
    // akan menggantung. Teksnya ditarik masuk ke rekaman pemenangnya.
    const silang = new RegExp(`Lihat catatan pada entri "${rk.substance.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\.`);
    if (rm.unmapped_reason && silang.test(rm.unmapped_reason) && rk.unmapped_reason) {
      rm.unmapped_reason = rm.unmapped_reason.replace(silang, rk.unmapped_reason).trim();
      statGol.silangDibetulkan++;
    }
  }
  golBaru = gol.filter((r) => !peta.has(r.substance.id));
  statGol.dibuang = gol.length - golBaru.length;

  const lama = golMeta.collection.count;
  const baru = golBaru.length;
  if (lama !== baru) {
    const angkaLama = lama.toLocaleString('id-ID');
    const angkaBaru = baru.toLocaleString('id-ID');
    golMeta.collection.count = baru;
    const ganti = (t) => t.split(angkaLama).join(angkaBaru);
    golMeta.collection.scope.id = ganti(golMeta.collection.scope.id);
    for (const s of golMeta.collection.provenance.sources) if (s.locator) s.locator = ganti(s.locator);
  }
}

// ---------------------------------------------------------------------------
// 8. Berhenti atau tulis
// ---------------------------------------------------------------------------
if (gagal.length) {
  for (const b of gagal) console.error(b);
  process.exit(1);
}

const keluaranProduk = produk.map((o, i) => tulisBaris(o, gayaAsli[i]));
const menyimpang = [];
produk.forEach((_, i) => { if (!produkBerubah.has(i) && keluaranProduk[i] !== barisProdukIsi[i]) menyimpang.push(i + 1); });
if (menyimpang.length) {
  console.error(`Penulis baris tidak setia pada ${menyimpang.length} rekaman produk yang tidak berubah — contoh baris ${menyimpang.slice(0, 3).join(', ')}.`);
  process.exit(1);
}

if (tulis) {
  writeFileSync(ZAT, JSON.stringify(zatDoc, null, 2) + '\n');
  writeFileSync(PRODUK, keluaranProduk.join('\n') + '\n');
  writeFileSync(PADANAN, JSON.stringify(padDoc, null, 2) + '\n');
  writeFileSync(GOL, golBaru.map((r) => JSON.stringify(r)).join('\n') + '\n');
  writeFileSync(GOL_META, JSON.stringify(golMeta, null, 2) + '\n');
}

// ---------------------------------------------------------------------------
// 9. Laporan
// ---------------------------------------------------------------------------
const n = (x) => String(x).padStart(5);
const kalahSemua = peta.size;
console.log(`${tulis ? 'Ditulis' : 'Uji coba (tanpa --tulis)'}`);
console.log(`Keluarga terpecah         : ${rencana.length} kelompok`);
console.log(`  entitas                 : ${kalahSemua + rencana.length} -> ${rencana.length} (${kalahSemua} jadi superseded)`);
console.log(`  zat hidup di berkas     : ${zatDoc.items.filter(hidup).length} dari ${zatDoc.items.length}`);
console.log(`  kelompok beranggota >2  : ${rencana.filter((r) => r.kalah.length > 1).length}`);
console.log(`  pemenang dipaksa        : ${rencana.filter((r) => r.paksa).length}`);
console.log(`  rantai A->B->C diratakan: ${rantai} (dari sapuan penggabungan sebelumnya)`);
console.log('Medan yang dipindahkan ke pemenang:');
for (const [f, v] of Object.entries(dipindah)) if (v) console.log(`  ${f.padEnd(20)}: ${n(v)}`);
console.log(`Registri produk           : ${stat.produkBerubah} pendaftaran berubah`);
console.log(`  entri dipetakan ulang   : ${n(stat.entriDipetakan)}`);
console.log(`  entri kembar dilebur    : ${n(stat.entriLebur)} pada ${stat.produkBerkurang} pendaftaran (penjumlahan ganda yang diam)`);
console.log(`Padanan bahan aktif       : ${n(statPadanan.substance)} rujukan substance, ${statPadanan.induk} rujukan induk`);
console.log(`Golongan resistensi       : ${n(statGol.dibuang)} rekaman dibuang, sisa ${golBaru.length}`);
console.log(`  prosanya beda dari menang: ${n(statGol.prosaBeda)} (alasan pemenang yang dipakai)`);
console.log(`  rujuk silang dibetulkan : ${n(statGol.silangDibetulkan)}`);
console.log('');
console.log('Keluarga pirazosulfuron:');
for (const r of rencana.filter((x) => x.nama.includes('sulfuron'))) {
  console.log(`  ${r.nama}: ${r.menang} "${zatById.get(r.menang).label.id}" <- ${r.kalah.join(', ')}`);
}
