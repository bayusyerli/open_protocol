// Logika pemeriksa spesifikasi Open Protocols Lapis 1.
// Dua lapis pemeriksaan:
//   1. Skema  — bentuk data, ditegakkan JSON Schema.
//   2. Aturan — kebijakan yang tidak bisa dinyatakan skema (netralitas vendor, PDP, keselamatan).
// CLI ada di validate.mjs; uji aturannya ada di test-rules.mjs.

import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import { hitungHash } from './kanonik.mjs';
import { sidikGeometri, GERBANG } from './tools/sidik-petak.mjs';
import addFormats from 'ajv-formats';

export function runChecks({ schemaDir = 'schema', dirs = ['vocab', 'examples'] } = {}) {
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats(ajv);

  const schemaFiles = readdirSync(schemaDir).filter((f) => f.endsWith('.json'));
  const byFile = new Map();
  for (const f of schemaFiles) {
    const s = JSON.parse(readFileSync(join(schemaDir, f), 'utf8'));
    ajv.addSchema(s);
    byFile.set(f, s.$id);
  }

  const errors = [];
  const warnings = [];

  // Catat, per berkas: awalan jenis entitas, nomor yang dipakai, dan blok yang diklaim.
  const members = new Map();
  const noteMember = (file, id, blocks) => {
    const [, prefix, local] = id.split(':');
    const num = Number(local);
    if (!Number.isInteger(num)) return;
    const m = members.get(file) ?? { prefix, nums: [], blocks };
    m.blocks = m.blocks ?? blocks;
    m.nums.push(num);
    members.set(file, m);
  };

  // Setiap berkas jadi satu unit, kecuali koleksi yang dibentangkan jadi satu unit per item.
  const docs = [];
  const vocabTypes = new Set();
  const blockClaims = [];
  const prefixFiles = new Map();
  for (const dir of dirs) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const sub of entries.filter((e) => e.isDirectory())) dirs.push(join(dir, sub.name));
    for (const f of entries.filter((e) => e.isFile()).map((e) => e.name).filter((x) => x.endsWith('.json'))) {
      const raw = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      const label = `${dir}/${f}`;
      const claim = (label2, node, prefixOf) => {
        const bl = node?.id_blocks;
        if (bl) blockClaims.push({ file: label2, blocks: bl, prefix: prefixOf });
      };
      if (f.endsWith('.meta.json')) {
        // Berkas besar disimpan sebagai NDJSON — satu entitas per baris, supaya
        // diff-nya tetap terbaca dan berkasnya bisa dibaca sambil jalan.
        const nd = join(dir, f.replace(/\.meta\.json$/, '.ndjson'));
        docs.push({ file: label, doc: raw, isCollection: true });
        const itemSchema = `${raw.collection.entity_type}.schema.json`;
        const lines = readFileSync(nd, 'utf8').split('\n').filter((l) => l.trim());
        if (raw.collection.count !== undefined && raw.collection.count !== lines.length) {
          errors.push({ file: label, rule: 'L15-jumlah', msg: `Meta menyatakan ${raw.collection.count} entitas, berkas berisi ${lines.length}.` });
        }
        lines.forEach((line, i) => {
          const item = JSON.parse(line);
          docs.push({ file: `${basename(nd)}:${i + 1} ${item.key ?? item.id ?? ''}`, doc: item, forcedSchema: itemSchema });
          if (typeof item.id === 'string') {
            if (dir.startsWith('vocab')) vocabTypes.add(item.id.split(':')[1]);
            noteMember(label, item.id, raw.collection?.id_blocks);
          }
        });
      } else if (raw.collection && Array.isArray(raw.items)) {
        docs.push({ file: label, doc: raw, isCollection: true });
        const itemSchema = `${raw.collection.entity_type}.schema.json`;
        raw.items.forEach((item, i) => {
          docs.push({ file: `${label} [${i}] ${item.key ?? item.id ?? ''}`, doc: item, forcedSchema: itemSchema });
          if (typeof item.id === 'string') {
            if (dir === 'vocab') vocabTypes.add(item.id.split(':')[1]);
            noteMember(label, item.id, raw.collection?.id_blocks);
          }
        });
      } else {
        docs.push({ file: label, doc: raw });
        if (typeof raw.id === 'string') {
          if (dir === 'vocab') vocabTypes.add(raw.id.split(':')[1]);
          noteMember(label, raw.id, raw.id_blocks);
        }
      }
    }
  }

  const fail = (file, rule, msg) => errors.push({ file, rule, msg });
  const warn = (file, rule, msg) => warnings.push({ file, rule, msg });

  // ---------- 1. Pemeriksaan skema ----------
  let validated = 0;
  for (const { file, doc, forcedSchema } of docs) {
    const declared = forcedSchema ?? (doc.$schema && basename(String(doc.$schema)));
    const id = declared && byFile.get(declared);
    if (!id) {
      fail(file, 'schema', `Tidak ada "$schema" yang menunjuk berkas skema yang dikenal (dapat: ${doc.$schema ?? 'tidak ada'}).`);
      continue;
    }
    const validate = ajv.getSchema(id);
    if (!validate(doc)) {
      for (const e of validate.errors) {
        const allowed = e.params?.allowedValues ? ` (${e.params.allowedValues.join(', ')})` : '';
        fail(file, 'schema', `${e.instancePath || '/'} ${e.message}${allowed}`);
      }
    } else {
      validated++;
    }
  }

  // ---------- 2. Aturan kebijakan ----------
  const isCurated = (d) =>
    typeof d.id === 'string' && /^op:(cmd|vty|var|sca|stg|sub|prd|sed|opt|met|pst|rgn|dev):/.test(d.id);
  const stepById = new Map(docs.filter(({ doc }) => doc.mode).map(({ doc }) => [doc.id, doc]));

  const knownIds = new Set(docs.map(({ doc }) => doc.id).filter((x) => typeof x === 'string'));
  const entityById = new Map(docs.filter(({ doc }) => typeof doc.id === 'string').map(({ doc }) => [doc.id, doc]));

  // Rujukan adalah objek yang kuncinya hanya {id} atau {id, label} — sesuai bentuk Ref.
  const collectRefs = (node, out = []) => {
    if (Array.isArray(node)) { for (const n of node) collectRefs(n, out); return out; }
    if (!node || typeof node !== 'object') return out;
    const keys = Object.keys(node);
    // LangText juga berbentuk { id: "..." }, jadi bentuk saja tidak cukup — polanya harus ikut cocok.
    if (typeof node.id === 'string' && /^op:[a-z]{3}:/.test(node.id) && keys.every((k) => k === 'id' || k === 'label')) out.push(node.id);
    for (const k of keys) collectRefs(node[k], out);
    return out;
  };

  // L1 — ID dan key tidak boleh kembar
  const seenId = new Map();
  const seenKey = new Map();
  for (const { file, doc } of docs) {
    if (!doc.id) continue;
    if (seenId.has(doc.id)) fail(file, 'L1-id-unik', `ID ${doc.id} sudah dipakai di ${seenId.get(doc.id)}.`);
    seenId.set(doc.id, file);
    // key unik PER JENIS ENTITAS, bukan lintas jenis: daun tembakau sah menjadi
    // komoditas sekaligus bahan nabati, dan URL-nya toh sudah dipisah per jenis.
    if (doc.key) {
      const scoped = `${doc.id.split(':')[1]}/${doc.key}`;
      if (seenKey.has(scoped)) fail(file, 'L1-key-unik', `key "${doc.key}" sudah dipakai untuk jenis entitas yang sama di ${seenKey.get(scoped)}.`);
      seenKey.set(scoped, file);
    }
  }

  for (const { file, doc } of docs) {
    // L2 — apa pun yang berstatus published wajib punya content_hash
    if (doc.lifecycle?.status === 'published' && !doc.lifecycle?.content_hash) {
      fail(file, 'L2-hash-terbit', 'Status "published" tanpa lifecycle.content_hash: versi terbit tidak boleh bisa berubah diam-diam.');
    }

    // L34 — content_hash harus benar-benar cocok dengan isinya.
    //
    // L2 menuntut hash-nya ADA; aturan ini menuntut hash-nya BENAR. Tanpa yang kedua,
    // yang pertama bisa dipenuhi angka apa pun — dan memang pernah: rec-cycle-cabai.json
    // sempat memuat sha256:0000...0000. Hash yang tidak bisa dihitung ulang bukan
    // penjagaan, melainkan hiasan yang menyerupai penjagaan.
    //
    // Kanonikalisasinya RFC 8785, didefinisikan di kanonik.mjs beserta alasan tiga medan
    // pembukuan berkas dikecualikan.
    if (doc.lifecycle?.content_hash) {
      const seharusnya = hitungHash(doc);
      if (doc.lifecycle.content_hash !== seharusnya) {
        fail(file, 'L34-hash-cocok', `lifecycle.content_hash tidak cocok dengan isinya. Tertulis ${doc.lifecycle.content_hash}, seharusnya ${seharusnya}. Entah isinya berubah tanpa hash-nya ikut disegarkan, entah hash-nya tidak pernah dihitung — dan keduanya membuat medan ini tidak bisa dipercaya. Segarkan dengan: node tools/hitung-hash.mjs --tulis`);
      }
    }

    // L34 — kunci protokol pada protocol_ref harus cocok dengan protokol yang ditunjuk.
    // Inilah gunanya pin itu ada: perbandingan rencana-realita baru sahih kalau protokol
    // yang dipakai siklus ini bisa dipastikan sama dengan yang dibaca sekarang.
    if (doc.protocol_ref?.content_hash) {
      const proto = entityById.get(doc.protocol_ref.id);
      if (proto && proto.lifecycle?.content_hash && proto.lifecycle.content_hash !== doc.protocol_ref.content_hash) {
        fail(file, 'L34-hash-cocok', `protocol_ref menyematkan ${doc.protocol_ref.content_hash} untuk ${doc.protocol_ref.id}, tetapi protokol itu sekarang berhash ${proto.lifecycle.content_hash}. Protokolnya berubah sesudah siklus ini disusun; entah pin-nya perlu disegarkan sengaja, entah perubahan protokolnya yang keliru.`);
      }
    }

    const isProtocol = typeof doc.id === 'string' && doc.id.startsWith('op:proto:');

    // L3 — netralitas vendor. Berlaku pada DUA bentuk, dan keduanya harus dijaga:
    // langkah rencana milik protokol (step.schema.json, punya `mode` di tingkat atas),
    // dan dokumen protokolnya sendiri (protocol.schema.json), yang langkahnya bersarang
    // sehingga tidak punya `mode` sama sekali. Bentuk kedua ada belakangan, dan sempat
    // luput: aturan ini menjaga instansnya sejak awal tetapi tidak menjaga templatnya —
    // padahal di templat itulah rekomendasi sesungguhnya hidup.
    //
    // Diperluas, bukan diberi nomor baru. Netralitas vendor satu prinsip; memecahnya jadi
    // dua nomor akan membuat salah satunya bisa dilonggarkan tanpa yang lain ikut terlihat.
    const netralitas = (apps, di) => {
      for (const [i, a] of (apps ?? []).entries()) {
        if (a.product) {
          fail(file, 'L3-netralitas-vendor', `${di}applications[${i}] menyebut produk komersial. Rekomendasi harus generik; produk hanya boleh muncul pada mode "executed".`);
        }
        if (a.preparation_batch) {
          fail(file, 'L3-netralitas-vendor', `${di}applications[${i}] menunjuk batch sediaan tertentu. Batch adalah data satu kebun; yang boleh masuk protokol hanya resepnya (preparation).`);
        }
      }
    };
    if (doc.mode === 'planned' && doc.protocol_step_key) {
      netralitas(doc.applications, 'Langkah rencana milik protokol: ');
    }
    if (isProtocol) {
      for (const [n, langkah] of (doc.steps ?? []).entries()) {
        netralitas(langkah.applications, `steps[${n}] "${langkah.key}": `);
      }
    }

    // L4 — dosis konsentrasi tanpa volume pembawa tidak bisa dihitung jadi jumlah per satuan luas
    for (const [i, a] of (doc.applications ?? []).entries()) {
      if (a.rate?.basis === 'per_volume_water' && !a.carrier) {
        fail(file, 'L4-pembawa-wajib', `applications[${i}] memakai basis per_volume_water tanpa "carrier".`);
      }
    }

    // L5 — keselamatan: aplikasi yang menyasar OPT wajib menyatakan tenggang waktu sebelum panen
    for (const [i, a] of (doc.applications ?? []).entries()) {
      if (a.target?.pest && a.phi_days === undefined) {
        fail(file, 'L5-phi-wajib', `applications[${i}] menyasar OPT tetapi tidak menyatakan phi_days.`);
      }
    }

    // L6 — PDP: menyimpan kontak tanpa dasar pemrosesan yang tercatat
    if (doc.actor_type && doc.contact && !doc.consent) {
      fail(file, 'L6-pdp-consent', 'Menyimpan data kontak tanpa objek "consent". UU 27/2022 menuntut dasar pemrosesan yang tercatat.');
    }

    // L7 — batas lahan tidak boleh diberi label publik
    if (doc.geometry && doc.data_classification === 'public') {
      fail(file, 'L7-lokasi-lahan', 'Plot bergeometri diberi klasifikasi "public". Batas lahan bernilai komersial dan bisa dipakai mengidentifikasi orang.');
    }

    // L8 — realisasi yang berbeda dari rencana wajib menyebut alasannya
    if (doc.mode === 'executed' && doc.plan_ref?.id) {
      const plan = stepById.get(doc.plan_ref.id);
      if (!plan) {
        warn(file, 'L8-rencana-hilang', `plan_ref ${doc.plan_ref.id} tidak ada di kumpulan berkas ini.`);
      } else {
        const key = (a) => `${a.substance?.id}|${a.rate?.value}|${a.rate?.unit}|${a.rate?.basis}`;
        const planned = (plan.applications ?? []).map(key).sort().join(';');
        const actual = (doc.applications ?? []).map(key).sort().join(';');
        if (planned !== actual && !doc.deviation) {
          fail(file, 'L8-simpangan', 'Realisasi berbeda dari rencana tetapi tidak ada objek "deviation". Simpangan tanpa alasan tidak bisa dipakai memperbaiki protokol.');
        }
      }
    }

    // L9 — disiplin kosakata
    if (isCurated(doc) && !doc.mappings?.length && !doc.no_mapping_reason) {
      fail(file, 'L9-pemetaan', 'Entitas terkurasi tanpa pemetaan luar dan tanpa no_mapping_reason.');
    }
    if (isCurated(doc) && doc.mappings?.some((m) => m.note?.includes('PERLU VERIFIKASI'))) {
      warn(file, 'L9-verifikasi', 'Ada pemetaan bertanda PERLU VERIFIKASI — tidak boleh naik ke status published sebelum dicek ke sumber aslinya.');
    }

    // L27 — komposisi produk tidak boleh melampaui satu kilogram per kilogram.
    // Peringatan, bukan galat: angkanya setia pada registri, yang keliru sumbernya
    // (mis. Zn ditulis 79,42% padahal ppm). Menolaknya berarti memalsukan sumber.
    if (typeof doc.id === 'string' && doc.id.startsWith('op:prd:') && doc.composition?.length) {
      const total = doc.composition
        .filter((c) => c.unit === 'g/kg' || c.unit === 'g/L')
        .reduce((n, c) => n + c.value, 0);
      if (total > 1000) {
        warn(file, 'L27-komposisi-mustahil', `Jumlah kadar mencapai ${Math.round(total)} g per kg/L — mustahil secara fisik. Angkanya setia pada registri; yang perlu ditinjau adalah sumbernya sebelum produk ini dipakai menghitung neraca hara.`);
      }
    }

    // L28 — tautan skala fase harus sepakat dua arah. Komoditas boleh menunjuk skala
    // bawaannya, tetapi skala itu wajib mengakui komoditasnya. Tanpa ini, kedua sisi
    // bisa menyimpang diam-diam dan varietas mewarisi skala yang bukan cakupannya.
    if (typeof doc.id === 'string' && doc.id.startsWith('op:cmd:') && doc.default_stage_scale?.id) {
      const sc = entityById.get(doc.default_stage_scale.id);
      const diakui = (sc?.applies_to?.commodities ?? []).some((c) => c.id === doc.id);
      if (sc && !diakui) {
        fail(file, 'L28-cakupan-skala', `Komoditas ini memakai skala ${doc.default_stage_scale.id} sebagai bawaan, tetapi skala itu tidak mencantumkannya di applies_to.commodities. Fenologi bukan urusan selera: skala hanya boleh dipakai pada tanaman yang memang dicakup kuncinya.`);
      }
    }

    // L10 — rujukan harus menunjuk entitas yang ada.
    // Hanya diperiksa untuk jenis entitas yang kosakatanya sudah dimuat; jenis yang
    // belum punya kosakata dilewati diam-diam supaya tidak berisik sebelum waktunya.
    for (const ref of collectRefs(doc)) {
      const type = ref.split(':')[1];
      if (!vocabTypes.has(type)) continue;
      if (!knownIds.has(ref)) {
        fail(file, 'L10-rujukan', `Menunjuk ${ref} yang tidak ada di kosakata. Rujukan menggantung membuat agregasi lintas petani diam-diam salah.`);
      }
    }

    // L29 — rujukan tidak boleh menunjuk entitas yang sudah digantikan.
    // Entitas kembar tidak pernah dihapus — ID tidak didaur ulang, dan ejaan asli dari
    // registri masih perlu bisa ditelusuri — jadi rujukan ke sana tetap "ada" dan L10
    // meloloskannya. Justru di situ bahayanya: registri Kementan kadang menuliskan
    // keterangan kesetaraan ke dalam field nama bahan, sehingga satu bahan aktif masuk
    // sebagai dua entitas dan, bila keduanya muncul pada produk yang sama, kadarnya
    // terjumlah dua kali. Aturan ini yang membuat penggabungannya bertahan: begitu
    // kosakata dibangun ulang dan pemetaan namanya jatuh lagi ke id yang sudah
    // digantikan, pemeriksa menolaknya alih-alih mendiamkannya sampai L27 menyala.
    for (const ref of collectRefs(doc)) {
      const tujuan = entityById.get(ref);
      if (tujuan?.lifecycle?.status !== 'superseded') continue;
      const ganti = tujuan.lifecycle.superseded_by?.id;
      fail(file, 'L29-entitas-digantikan', ganti
        ? `Menunjuk ${ref} "${tujuan.label?.id}" yang berstatus superseded — pakai ${ganti}. Entitas itu dipertahankan supaya ejaan aslinya bisa ditelusuri, bukan supaya dipakai lagi.`
        : `Menunjuk ${ref} "${tujuan.label?.id}" yang berstatus superseded tanpa lifecycle.superseded_by. Entitas yang digantikan wajib menyebut penggantinya, kalau tidak rujukan lama tidak punya tempat berpindah.`);
    }

    // L14 — produk tanpa komposisi tidak bisa dipakai menghitung hara yang diberikan
    for (const [i, a] of (doc.applications ?? []).entries()) {
      const prod = a.product?.id && entityById.get(a.product.id);
      if (prod && !prod.composition?.length && a.nutrients_delivered?.length) {
        fail(file, 'L14-komposisi', `applications[${i}] menghitung nutrients_delivered dari produk "${prod.key}" yang tidak punya composition. Sebagian pupuk terdaftar memang tidak punya kadar hara di registri — basis lama SIMPUK dan baris yang analisanya cuma cacah mikroba atau sifat fisik — jadi angka itu tidak bisa diturunkan dari mana pun.`);
      }
    }

    // ---- Aturan protokol Lapis 2 (L30-L32) ----

    // L30 — skala fase yang dipakai protokol wajib mencakup komoditasnya. Kembaran L28
    // di sisi protokol: kalau protokol cabai menjadwalkan langkahnya pada fase BBCH milik
    // kunci serealia, seluruh penjadwalannya salah dan tidak ada yang menyalak — bentuknya
    // sah, hanya fenologinya yang bukan milik tanaman itu.
    if (isProtocol && doc.stage_scale?.id && doc.applicability?.commodity?.id) {
      const skala = entityById.get(doc.stage_scale.id);
      const diakui = (skala?.applies_to?.commodities ?? []).some((c) => c.id === doc.applicability.commodity.id);
      if (skala && !diakui) {
        fail(file, 'L30-skala-cakupan', `Protokol ini memakai skala ${doc.stage_scale.id} tetapi skala itu tidak mencantumkan komoditas ${doc.applicability.commodity.id} di applies_to.commodities. Langkah yang dijadwalkan pada fase milik tanaman lain akan tepat waktu di atas kertas dan salah di lahan.`);
      }
    }

    // L31 — tingkat bukti wajib berdasar. Tingkat bukti inilah yang dijual ke lembaga
    // sertifikasi, jadi ia satu-satunya medan yang tidak boleh bisa diisi sendiri tanpa
    // konsekuensi. Dua bentuk penyalahgunaannya berbeda dan keduanya ditolak di sini.
    if (isProtocol) {
      const sumber = doc.provenance?.sources?.length ?? 0;
      if ((doc.evidence_tier === 'A' || doc.evidence_tier === 'B') && !sumber) {
        fail(file, 'L31-bukti-berdasar', `Tingkat bukti "${doc.evidence_tier}" berarti uji multi-lokasi atau standar institusi resmi, tetapi provenance.sources kosong. Klaim tingkat itu tanpa menyebut sumbernya tidak bisa diperiksa siapa pun — dan tepat itulah yang dibeli pembayar.`);
      }
      if (doc.evidence_tier === 'D' && doc.lifecycle?.status === 'published') {
        fail(file, 'L31-bukti-berdasar', 'Tingkat bukti "D" adalah pengalaman tunggal yang belum terverifikasi, jadi ia tidak boleh berstatus published. Menerbitkannya berarti menyajikan satu pengalaman sebagai anjuran.');
      }
    }

    // L32 — langkah protokol tidak boleh berjadwal tanggal pasti. Protokol berlaku lintas
    // musim dan lintas petak; tanggal kalender milik satu siklus, bukan milik templat.
    // Timing punya lima bentuk dan empat sisanya — relatif, fase, ambang, kondisional —
    // semuanya berpindah dengan benar. Hanya "absolute" yang tidak bisa.
    if (isProtocol) {
      for (const [n, langkah] of (doc.steps ?? []).entries()) {
        if (langkah.timing?.kind === 'absolute') {
          fail(file, 'L32-jadwal-templat', `steps[${n}] "${langkah.key}" memakai timing "absolute" (${langkah.timing.date}). Tanggal kalender milik satu siklus, bukan templat — pakai "relative" terhadap kejadian acuan, atau "stage" pada fase pertumbuhan.`);
        }
      }
    }

    // L33 — protokol terbit wajib punya penulis bernama dan tanggal tinjau ulang. Ini
    // penangkal langsung pola kegagalan (c) di docs/00: "Package of Practices" klasik
    // diterbitkan sekali, tanpa penanggung jawab dan tanpa jadwal tinjau, lalu tidak
    // pernah bisa dikoreksi. Yang membuat protokol berbeda dari PDF bukan formatnya,
    // melainkan adanya orang yang namanya menempel dan tanggal ia harus dilihat lagi.
    if (isProtocol && doc.lifecycle?.status === 'published') {
      const penulis = (doc.provenance?.contributors ?? []).some((c) => c.role === 'author');
      if (!penulis) {
        fail(file, 'L33-penulis-tinjau', 'Protokol berstatus published tanpa satu pun kontributor ber-role "author". Protokol tanpa penanggung jawab tidak bisa dikoreksi, dan tidak bisa ditagih siapa pun.');
      }
      if (!doc.lifecycle?.review_due) {
        fail(file, 'L33-penulis-tinjau', 'Protokol berstatus published tanpa lifecycle.review_due. Tanpa tanggal tinjau ulang, protokol yang benar hari ini akan tetap tayang setelah varietas, OPT, dan harga inputnya berubah.');
      }
    }

    // L35 — nama peninjau dan tanggal tinjauan wajib bepergian bersama, pada rekaman
    // APA PUN. L33 sudah menuntutnya, tetapi hanya untuk protokol yang berstatus
    // published — dan itu satu sudut dari korpus yang seluruhnya masih draft.
    //
    // Dua arah, karena keduanya bohong dengan cara yang berbeda. `reviewed_at` tanpa
    // peninjau bernama menyatakan sebuah tinjauan terjadi tanpa seorang pun yang bisa
    // ditagih atasnya — persis "Package of Practices" yang ditolak docs/00. Peninjau
    // bernama tanpa `reviewed_at` menyatakan siapa tanpa menyatakan kapan, dan tinjauan
    // yang tidak bertanggal tidak bisa diperiksa ulang setelah isinya berubah: pembacanya
    // tidak tahu apakah yang ditinjau masih rekaman yang sama.
    const peninjau = (doc.provenance?.contributors ?? []).filter((c) => c.role === 'reviewer');
    if (doc.lifecycle?.reviewed_at && peninjau.length === 0) {
      fail(file, 'L35-peninjau-bertanggal', `lifecycle.reviewed_at berisi ${doc.lifecycle.reviewed_at} tetapi tidak ada satu pun kontributor ber-role "reviewer". Tinjauan tanpa peninjau bernama tidak bisa ditagih siapa pun, dan tanggalnya justru membuatnya tampak sudah diperiksa.`);
    }
    if (peninjau.length > 0 && !doc.lifecycle?.reviewed_at) {
      fail(file, 'L35-peninjau-bertanggal', `provenance.contributors memuat peninjau (${peninjau.map((c) => c.name).join(', ')}) tetapi lifecycle.reviewed_at kosong. Rekaman ini menyatakan siapa tanpa menyatakan kapan, jadi tidak ada cara mengetahui apakah yang ditinjau masih isi yang sekarang.`);
    }

    // L35 — tinjauan disematkan pada isi yang benar-benar dibaca peninjaunya.
    //
    // Ini yang menjawab keberatan paling wajar dari siapa pun yang diminta menempelkan
    // namanya: "apakah nama saya akan menanggung isi yang tidak pernah saya baca?" Tanpa
    // pin, jawabannya ya — rekaman disunting, nama peninjau tetap di tempatnya, dan
    // pembaca mengira yang sekarang sudah diperiksa. Dengan pin, isinya boleh berubah dan
    // tinjauannya cukup terbaca kedaluwarsa.
    //
    // Peringatan, bukan galat: tinjauan yang kedaluwarsa tidak salah, ia hanya tidak lagi
    // berlaku untuk isi yang sekarang — dan yang perlu tahu itu pembacanya.
    if (peninjau.length > 0 && doc.lifecycle?.content_hash) {
      if (!doc.lifecycle.reviewed_hash) {
        warn(file, 'L35-tinjauan-tersemat', 'Rekaman ini punya peninjau bernama dan content_hash, tetapi lifecycle.reviewed_hash kosong. Tanpa pin, tidak ada cara mengetahui apakah tinjauannya masih berlaku untuk isi yang sekarang.');
      } else if (doc.lifecycle.reviewed_hash !== doc.lifecycle.content_hash) {
        warn(file, 'L35-tinjauan-tersemat', `Tinjauan disematkan pada ${doc.lifecycle.reviewed_hash} tetapi isinya sekarang ${doc.lifecycle.content_hash}. Isinya berubah sesudah ditinjau, jadi tinjauan ini kedaluwarsa — nama peninjaunya tidak menanggung perubahan itu.`);
      }
    }

    // L36 — identitas petak: yang tidak bisa diperiksa tidak boleh tampak seperti identitas.
    //
    // G5 menjanjikan dua pihak bisa memastikan mereka membicarakan petak yang sama tanpa
    // seorang pun menerbitkan batasnya. Tiga cara janji itu bisa dilanggar tanpa satu baris
    // pun tampak salah, dan ketiganya dijaga di sini.
    const isPlot = typeof doc.id === 'string' && doc.id.startsWith('op:plt:');
    if (isPlot) {
      // (a) Menyatakan MUTU geometri yang tidak ada. `geometry_quality` menjawab
      // "seberapa bisa dipercaya batas ini"; tanpa batasnya, ia menjawab pertanyaan
      // tentang sesuatu yang tidak pernah ada — dan pembacanya menyangka ada.
      if (doc.geometry_quality && !doc.geometry) {
        fail(file, 'L36-identitas-petak', `geometry_quality "${doc.geometry_quality}" dinyatakan tetapi petak ini tidak punya geometry. Mutu batas yang tidak ada bukan mutu rendah, melainkan tidak ada batasnya sama sekali.`);
      }

      const mutu = doc.geometry_quality ?? 'unknown';
      for (const [n, g] of (doc.geoids ?? []).entries()) {
        // (b) Nilai yang menyamar jadi identitas. Yang tidak bisa dicocokkan dengan apa
        // pun tidak boleh menempati medan yang seluruh gunanya untuk dicocokkan —
        // kegagalan yang sama dengan content_hash sha256:0000...0000 sebelum L34.
        if (/pending|todo|tbd|xxx+|dummy|placeholder|belum|nanti|\s/i.test(g.value)) {
          fail(file, 'L36-identitas-petak', `geoids[${n}] bernilai "${g.value}" — itu catatan untuk diri sendiri, bukan identitas. Medan ini seluruh gunanya untuk dicocokkan pihak lain; nilai yang tidak bisa dicocokkan lebih buruk daripada medan kosong, karena ia tampak sudah terisi.`);
        }

        if (g.scheme !== 'OP_GEOM_SHA256') continue;

        // (c) Sidik atas geometri berentropi rendah. Titik tunggal pada presisi 5 desimal
        // di dalam satu kabupaten ~2^30 kandidat — satu GPU menebaknya habis dalam 0,08
        // detik. Sidiknya bukan penjagaan; ia penunjuk lokasi yang bisa dibalik, dan
        // repositori ini publik.
        const gerbang = GERBANG[mutu] ?? GERBANG.unknown;
        if (!gerbang.boleh) {
          fail(file, 'L36-identitas-petak', `geoids[${n}] menyidik geometri bermutu "${mutu}". ${gerbang.sebab}`);
        } else if (gerbang.peringatan) {
          warn(file, 'L36-identitas-petak', `geoids[${n}] menyidik geometri bermutu "${mutu}". ${gerbang.peringatan}`);
        }

        // (d) Sidik yang tidak cocok dengan geometrinya. Sama seperti L34 untuk
        // content_hash: L2 menuntut medannya ADA, aturan ini menuntut isinya BENAR.
        if (doc.geometry) {
          let seharusnya = null;
          try { seharusnya = sidikGeometri(doc.geometry); } catch { /* bentuknya sudah ditolak skema */ }
          if (seharusnya && g.value !== seharusnya) {
            fail(file, 'L36-identitas-petak', `geoids[${n}] tertulis ${g.value} tetapi geometri petak ini menyidik ${seharusnya}. Entah batasnya berubah tanpa sidiknya ikut disegarkan, entah sidiknya tidak pernah dihitung. Segarkan: node spec/tools/sidik-petak.mjs --tulis`);
          }
        }
      }
    }

    // L37 — laporan gejala warga tidak boleh tampil sebagai temuan terverifikasi.
    //
    // docs/15 menyebut bahayanya sebelum satu baris kode pun ada: "laporan gejala dari
    // warga adalah data mentah; MENYEBUTNYA WABAH ADALAH KESIMPULAN. Peta yang menampilkan
    // titik-titik laporan tanpa verifikasi bisa memicu penyemprotan massal yang tidak
    // perlu — dan kerugiannya ditanggung petani, sementara yang untung penjual pestisida."
    //
    // Bahaya itu dirancang keluar di sini, bukan ditambal di penyaji. Peta yang salah
    // dibangun di atas data yang benar masih bisa diperbaiki; peta yang benar dibangun di
    // atas data yang tidak membedakan dugaan dari temuan tidak bisa.
    const isObservation = typeof doc.id === 'string' && doc.id.startsWith('op:obs:');
    if (isObservation) {
      const v = doc.verification ?? {};

      // (a) Yang belum diverifikasi tidak boleh berkelas publik. Inilah peta titik tanpa
      // verifikasi, dinyatakan sebagai aturan alih-alih sebagai peringatan di dokumen.
      if (v.status !== 'verified' && doc.data_classification === 'public') {
        fail(file, 'L37-pengamatan-warga', `Pengamatan berstatus verifikasi "${v.status ?? 'tidak dinyatakan'}" diberi klasifikasi "public". Laporan yang belum diverifikasi adalah data mentah; menerbitkannya sebagai data publik membuat dugaan terbaca sebagai temuan, dan peta yang tersusun darinya memicu penyemprotan yang kerugiannya ditanggung petani.`);
      }

      // (b) Pemverifikasi tercatat sementara statusnya tetap "unverified". Skema sudah
      // menuntut `by` dan `at` untuk ketiga status lainnya, jadi yang tersisa justru
      // kebalikannya: seseorang tercatat memeriksa, dan hasilnya tidak pernah dinyatakan.
      // Yang membaca melihat nama pemverifikasi dan menyimpulkan sudah diperiksa.
      if (v.status === 'unverified' && (v.by || v.at)) {
        fail(file, 'L37-pengamatan-warga', `verification.status "unverified" tetapi ${v.by ? 'verification.by' : 'verification.at'} terisi. Nama pemverifikasi yang menempel pada laporan berstatus belum-diverifikasi terbaca sebagai sudah diperiksa; nyatakan hasilnya, atau cabut namanya.`);
      }

      // (c) Dugaan OPT yang dibawa laporan warga wajib menyebut dasarnya, dan tidak boleh
      // menempel pada laporan yang sudah DITOLAK verifikasinya — di sana dugaannya sudah
      // dijawab, dan membiarkannya berdiri terbaca sebagai jawaban yang lain.
      if (doc.suspected?.pest && v.status === 'rejected') {
        fail(file, 'L37-pengamatan-warga', `Laporan ini ditolak verifikasinya tetapi masih membawa dugaan OPT "${doc.suspected.pest.label ?? doc.suspected.pest.id}". Dugaan yang sudah dijawab tidak boleh tetap berdiri; catat hasilnya di verification.note dan cabut dugaannya.`);
      }

      // (d) Laporan warga yang bergaya pengukuran. `variable` + `value` menyatakan angka
      // hasil pengamatan berdisiplin dengan cara dan ukuran sampel; laporan gejala tidak
      // punya keduanya, dan meminjam bentuknya membuat perkiraan terbaca sebagai hitungan.
      if (doc.kind === 'symptom_report' && doc.variable) {
        fail(file, 'L37-pengamatan-warga', 'Laporan gejala membawa `variable` — bentuk pengukuran. Yang melapor memperkirakan, tidak menghitung; memakai bentuk pengukuran membuat perkiraan terbaca sebagai angka hasil pengamatan bersampel.');
      }
    }

    // ---- Aturan sediaan buatan sendiri (L16-L21) ----
    const isPreparation = typeof doc.id === 'string' && doc.id.startsWith('op:sed:');
    const controlsPest = (doc.intended_functions ?? []).some((f) => f === 'pest_control' || f === 'disease_suppression');

    // L16 — sediaan yang ditujukan mengendalikan OPT masuk definisi pestisida UU 22/2019 Pasal 75,
    // walau bahannya daun. Rezim dan tenggang panennya wajib dinyatakan, bukan disimpulkan pemakai.
    if (isPreparation && controlsPest) {
      if (!(doc.regulatory?.regime ?? []).includes('pesticide_like')) {
        fail(file, 'L16-sediaan-opt', 'Sediaan ini ditujukan mengendalikan OPT tetapi rezimnya tidak menyertakan "pesticide_like". UU 22/2019 Pasal 75 mendefinisikan pestisida lewat kegunaan, bukan lewat asal bahan.');
      }
      if (doc.regulatory?.own_use_only !== true) {
        fail(file, 'L16-sediaan-opt', 'Sediaan pengendali OPT yang belum terdaftar wajib ditandai own_use_only. Tidak ada kelonggaran petani kecil untuk pestisida — Pasal 72 hanya berlaku untuk pupuk.');
      }
      if (doc.safety?.phi_days === undefined) {
        fail(file, 'L16-sediaan-opt', 'Sediaan pengendali OPT tanpa safety.phi_days. Tidak adanya uji residu bukan alasan mengosongkannya; pakai angka pencegahan dan nyatakan dasarnya di phi_basis.');
      }
    }

    // L17 — bahan mentah pembawa patogen wajib disanitasi, atau diberi jarak ke panen.
    if (isPreparation) {
      const dirty = (doc.feedstocks ?? []).filter((f) => entityById.get(f.substance?.id)?.on_farm?.sanitation_required);
      if (dirty.length) {
        const regime = doc.process?.sanitation?.regime;
        const sanitised = regime === 'thermophilic_windrow' || regime === 'thermophilic_static';
        const interval = doc.safety?.preharvest_interval_days;
        if (!sanitised && !(interval >= 90)) {
          const names = dirty.map((f) => entityById.get(f.substance.id)?.key ?? f.substance.id).join(', ');
          fail(file, 'L17-sanitasi', `Memakai bahan mentah pembawa patogen (${names}) tanpa proses termofilik dan tanpa safety.preharvest_interval_days minimal 90 hari. Salah satu dari keduanya wajib ada.`);
        }
      }
    }

    // L19 — bahan yang dilarang tidak boleh masuk resep mana pun.
    if (isPreparation) {
      for (const [i, f] of (doc.feedstocks ?? []).entries()) {
        const sub = entityById.get(f.substance?.id);
        if (sub?.on_farm?.status === 'prohibited') {
          fail(file, 'L19-bahan-terlarang', `feedstocks[${i}] memakai "${sub.key}" yang berstatus prohibited: ${sub.on_farm.reason}`);
        }
      }
    }

    // L38 — siklus yang berakhir wajib menyebut kapan, dan yang belum berakhir tidak
    // boleh menyebutnya.
    //
    // Ini penanda panen dilihat dari sisi pemeriksa. Skema sudah memuat seluruh bahannya
    // sejak lama — `status` berenum enam, `actual_end` bertanggal, `Step.outputs` membawa
    // kuantitas panen — tetapi tidak satu pun MENGIKAT yang satu ke yang lain. Siklus
    // berstatus "closed" tanpa `actual_end` lolos validasi skema, dan siklus semacam itu
    // tidak bisa ditaruh di musim mana pun: ia selesai entah kapan.
    //
    // Arah sebaliknya sama merusaknya dan lebih halus. `actual_end` terisi sementara
    // status masih "active" terbaca sebagai musim yang masih berjalan oleh yang membaca
    // status, dan sebagai musim yang sudah berakhir oleh yang membaca tanggal — dan yang
    // membaca tanggal biasanya mesin.
    const isCycle = typeof doc.id === 'string' && doc.id.startsWith('op:cyc:');
    if (isCycle) {
      const BERAKHIR = ['harvested', 'closed', 'failed', 'abandoned'];
      if (BERAKHIR.includes(doc.status) && !doc.actual_end) {
        fail(file, 'L38-siklus-berakhir', `Siklus berstatus "${doc.status}" tanpa actual_end. Siklus yang berakhir tanpa tanggal tidak bisa ditaruh di musim mana pun, dan biaya maupun hasil yang menempel padanya tidak bisa dibandingkan dengan siklus lain.`);
      }
      if (doc.actual_end && !BERAKHIR.includes(doc.status)) {
        fail(file, 'L38-siklus-berakhir', `actual_end berisi ${doc.actual_end} sementara status masih "${doc.status}". Yang membaca status melihat siklus yang masih berjalan; yang membaca tanggal melihat siklus yang sudah berakhir — dan yang membaca tanggal biasanya mesin.`);
      }

      // Berakhir sebelum dimulai. Kekeliruan ketik yang paling mudah dibuat dan paling
      // sulit dilihat sesudahnya, karena keduanya tanggal yang masuk akal sendiri-sendiri.
      if (doc.actual_end && doc.planned_start && doc.actual_end < doc.planned_start) {
        fail(file, 'L38-siklus-berakhir', `actual_end ${doc.actual_end} mendahului planned_start ${doc.planned_start}. Siklus tidak bisa berakhir sebelum ia dimulai.`);
      }

      // Kegagalan tanpa sebab. Ini SEMULA peringatan, dengan alasan yang tidak ada di
      // rekamannya melainkan di kosakatanya: `Cycle.failure_reason` menunjuk Ref, dan
      // kosakata alasan kegagalan siklus belum pernah dibuat — menuntut rujukan ke sesuatu
      // yang tidak bisa dirujuk siapa pun bukan tuntutan yang adil. Sejak
      // vocab/cycle-failure-reason.json ada, tuntutannya adil, jadi ia jadi kegagalan.
      //
      // Yang dijaga bukan kelengkapan borang. Musim yang gagal tanpa sebab tercatat tidak
      // bisa dijumlahkan dengan musim gagal mana pun — dan justru penjumlahan itu yang
      // membedakan "petani ini sial" dari "giliran air di daerah ini tidak pernah turun".
      if (doc.status === 'failed' && !doc.failure_reason) {
        fail(file, 'L38-siklus-berakhir', 'Siklus berstatus "failed" tanpa failure_reason. Sebabnya kini punya kosakata sendiri (vocab/cycle-failure-reason.json, 15 entri) — musim yang gagal tanpa sebab tercatat tidak bisa dijumlahkan dengan musim gagal mana pun, dan penjumlahan itulah yang membedakan kesialan satu orang dari kegagalan yang berulang di satu wilayah.');
      }

      // Sebab yang menunjuk ke luar kosakatanya. Ref bebas isi menurut skema, jadi tanpa
      // pemeriksaan ini `failure_reason` bisa menunjuk OPT, langkah, atau apa pun — dan
      // yang menjumlahkannya kemudian akan menjumlahkan hal yang berlainan.
      if (doc.failure_reason?.id && !doc.failure_reason.id.startsWith('op:cfr:')) {
        fail(file, 'L38-siklus-berakhir', `failure_reason menunjuk ${doc.failure_reason.id}, yang bukan entri kosakata sebab kegagalan siklus (op:cfr:). Sebab kegagalan wajib datang dari kosakatanya sendiri supaya bisa dihitung.`);
      }
      if (doc.failure_reason?.id?.startsWith('op:cfr:') && entityById.size && !entityById.has(doc.failure_reason.id)) {
        fail(file, 'L38-siklus-berakhir', `failure_reason menunjuk ${doc.failure_reason.id} yang tidak ada di kumpulan berkas ini.`);
      }
    }

    // L20 — sediaan mikroba tanpa uji cemaran adalah biakan yang tidak diketahui isinya.
    if (isPreparation && (doc.preparation_class === 'microbial_culture' || doc.preparation_class === 'bioactivator')) {
      if (!(doc.release_criteria ?? []).some((c) => c.kind === 'contamination')) {
        fail(file, 'L20-cemaran-mikroba', 'Sediaan mikroba tanpa kriteria pelepasan bertipe "contamination". Perbanyakan di kebun tanpa uji cemaran bisa memperbanyak apa saja, termasuk patogen manusia.');
      }
    }

    // L18 & L21 — pemakaian batch pada langkah lapangan.
    for (const [i, a] of (doc.applications ?? []).entries()) {
      const batch = a.preparation_batch?.id && entityById.get(a.preparation_batch.id);

      // L18 — hara yang diberikan hanya boleh dihitung dari batch yang benar-benar diuji.
      if (a.preparation && a.nutrients_delivered?.length) {
        if (!batch) {
          fail(file, 'L18-komposisi-sediaan', `applications[${i}] menghitung nutrients_delivered dari sediaan tanpa menunjuk batch yang dipakai. Kandungan hara kompos berbeda antar-batch; tanpa batch, angkanya tidak berasal dari mana pun.`);
        } else if (batch.composition_basis !== 'measured' || !batch.measured_composition?.length) {
          fail(file, 'L18-komposisi-sediaan', `applications[${i}] menghitung nutrients_delivered dari batch "${batch.batch_code ?? batch.id}" yang composition_basis-nya "${batch.composition_basis}". Tabel rujukan bahan baku cukup untuk perkiraan, tidak cukup untuk menyatakan apa yang benar-benar diberikan.`);
        }
      }

      // L21 — batch yang gagal uji tidak boleh dipakai; yang belum diuji harus terlihat.
      if (doc.mode === 'executed' && batch) {
        if (batch.qc_verdict === 'fail') {
          fail(file, 'L21-batch-gagal', `applications[${i}] memakai batch "${batch.batch_code ?? batch.id}" yang qc_verdict-nya "fail". Batch yang gagal uji pelepasan tidak boleh masuk ke lahan.`);
        } else if (batch.qc_verdict === 'not_tested') {
          warn(file, 'L21-batch-belum-diuji', `applications[${i}] memakai batch "${batch.batch_code ?? batch.id}" yang belum diuji. Sah dicatat, tetapi tingkat buktinya tidak boleh dihitung setara batch yang lolos uji.`);
        }
      }
    }

    // L22 — bahan aktif yang dilarang tidak boleh dipakai
    // Sumber: Permentan 43/2019, tertanam di substance.hazard.regulatory_status.
    for (const [i, a] of (doc.applications ?? []).entries()) {
      const sub = a.substance?.id && entityById.get(a.substance.id);
      for (const rs of sub?.hazard?.regulatory_status ?? []) {
        const semua = rs.scope?.some((x) => x.includes('semua bidang'));
        const cyc = doc.cycle?.id && entityById.get(doc.cycle.id);
        const kena = rs.commodities?.some((c) => c.id === cyc?.commodity?.id);
        if (rs.status === 'prohibited' && (semua || kena)) {
          fail(file, 'L22-bahan-dilarang', `applications[${i}] memakai "${sub.label?.id ?? sub.key}" yang DILARANG menurut ${rs.instrument} (${rs.citation}), cakupan: ${rs.scope.join('; ')}.`);
        } else if (rs.status === 'restricted' && (semua || kena)) {
          warn(file, 'L22-bahan-terbatas', `applications[${i}] memakai "${sub.label?.id ?? sub.key}" yang berstatus TERBATAS menurut ${rs.instrument} (${rs.citation}). Pemakaiannya menuntut Sertifikat Penggunaan Pestisida Terbatas.`);
        }
      }
    }

    // L26 — tautan OPT harus cocok dengan nama ilmiah yang tertulis di label
    // Rekonsiliasi 1.531 nama sasaran dikerjakan mesin; ini yang menahan hasilnya
    // supaya tidak melenceng diam-diam saat kosakatanya berubah.
    //
    // Ejaan yang tercatat pada entitas ikut dihitung cocok — nama diterima menurut
    // GBIF dan seluruh synonyms-nya. Sesudah penyatuan OPT kembar, satu takson
    // memegang belasan ejaan registri sekaligus ("Ottochloa nodosa" beserta
    // "Ottochola nodosa", "Ottchloa nodosa", dan seterusnya), sementara
    // pest_scientific_name pada rekaman produk sengaja TIDAK ditulis ulang: ia satu-
    // satunya tempat bunyi asli registri masih terbaca. Tanpa keringanan ini aturan
    // menyalak pada 1.407 penggunaan yang tautannya justru benar.
    //
    // Sifat yang dijaga tidak berkurang: tautan ke organisme yang BERBEDA tetap
    // ditolak, karena nama organisme itu tidak akan pernah ada di antara ejaan yang
    // tercatat pada entitas ini.
    for (const [i, u] of (doc.label_uses ?? []).entries()) {
      const ref = u.pest?.id && entityById.get(u.pest.id);
      if (!ref || !u.pest_scientific_name) continue;
      const bersih = (x) => String(x).replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
      // Hanya synonyms yang BERBENTUK NAMA ILMIAH yang dihitung. synonyms pada OPT
      // registri diketahui bercampur: Phytophthora infestans membawa "Hama Trips"
      // sejak sebelum penyatuan apa pun. Membandingkan pest_scientific_name dengannya
      // tidak ada gunanya, dan menerimanya akan membuat aturan ini meloloskan tautan
      // ke organisme yang sama sekali lain.
      const binomial = (x) => /^[A-Z][a-z]+ [a-z][a-z-]+$/.test(String(x).trim());
      const ejaanTercatat = new Set(
        [ref.scientific_name, ref.accepted_scientific_name, ...(ref.synonyms ?? []).filter(binomial)]
          .filter(Boolean)
          .map(bersih),
      );
      if (ref.scientific_name && !ejaanTercatat.has(bersih(u.pest_scientific_name))) {
        fail(file, 'L26-tautan-opt', `label_uses[${i}] menunjuk "${ref.key}" (${ref.scientific_name}) padahal labelnya menulis "${u.pest_scientific_name}".`);
      }
      if (u.commodity && u.target_site) {
        fail(file, 'L26-sasaran-ganda', `label_uses[${i}] menunjuk komoditas sekaligus tempat aplikasi. Sasaran hanya boleh salah satu.`);
      }
    }

    // L11 — variabel harus bisa diisi tanpa menebak
    if (doc.value_type === 'quantity' && !doc.default_unit) {
      fail(file, 'L11-variabel', 'Variabel bertipe quantity tanpa default_unit: pencatat akan menebak satuannya sendiri.');
    }
    if (doc.value_type === 'category' && !doc.categories?.length) {
      fail(file, 'L11-variabel', 'Variabel bertipe category tanpa daftar categories: nilainya akan berubah jadi teks bebas.');
    }

    // L12 — cara aplikasi harus cocok dengan dasar dosisnya
    for (const [i, a] of (doc.applications ?? []).entries()) {
      const method = a.method?.id && entityById.get(a.method.id);
      const bases = method?.compatible_bases;
      if (bases?.length && a.rate?.basis && !bases.includes(a.rate.basis)) {
        fail(file, 'L12-cara-dosis', `applications[${i}] memakai cara "${method.key}" dengan basis dosis ${a.rate.basis}, padahal cara itu hanya masuk akal untuk ${bases.join(' atau ')}.`);
      }
    }

    // L13 — bentuk langkah harus sesuai yang diharapkan jenis tindakannya
    const opType = doc.operation_type?.id && entityById.get(doc.operation_type.id);
    if (opType?.expects) {
      const checks = [
        ['applications', doc.applications, 'aplikasi input'],
        ['observations', doc.observations, 'pengamatan'],
        ['yield_output', doc.outputs, 'hasil keluaran'],
      ];
      for (const [field, value, human] of checks) {
        const rule = opType.expects[field];
        const has = Array.isArray(value) && value.length > 0;
        if (rule === 'forbidden' && has) {
          fail(file, 'L13-bentuk-langkah', `Jenis tindakan "${opType.key}" tidak boleh membawa ${human}, tetapi langkah ini membawanya.`);
        }
        if (rule === 'required' && !has) {
          fail(file, 'L13-bentuk-langkah', `Jenis tindakan "${opType.key}" wajib membawa ${human}, tetapi langkah ini tidak membawanya.`);
        }
      }
    }
  }

  // ---------- 3. Alokasi blok nomor ----------
  // Nomor berurutan dari satu antrean tunggal mensyaratkan satu penulis. Blok per berkas
  // membuat dua pihak bisa menambah entitas bersamaan tanpa saling menimpa.
  const inAny = (n, blocks) => blocks.some((b) => n >= b.from && n <= b.to);
  const perPrefix = new Map();
  for (const [file, m] of members) {
    if (!perPrefix.has(m.prefix)) perPrefix.set(m.prefix, []);
    perPrefix.get(m.prefix).push({ file, ...m });
  }

  for (const [file, m] of members) {
    // L23 — entitas harus berada di dalam blok yang diklaim berkasnya
    if (!m.blocks) continue;
    const luar = [...new Set(m.nums.filter((n) => !inAny(n, m.blocks)))].sort((a, b) => a - b);
    if (luar.length) {
      const daftar = luar.slice(0, 5).join(', ') + (luar.length > 5 ? `, dan ${luar.length - 5} lagi` : '');
      fail(file, 'L23-luar-blok', `${luar.length} entitas di luar blok yang diklaim (${m.blocks.map((b) => `${b.from}-${b.to}`).join(', ')}): ${daftar}.`);
    }
  }

  for (const [prefix, list] of perPrefix) {
    if (list.length < 2) continue;
    // L24 — berkas yang berbagi jenis entitas wajib menyatakan bloknya
    for (const m of list) {
      if (!m.blocks) {
        fail(m.file, 'L24-blok-wajib', `Jenis entitas "${prefix}" dipakai ${list.length} berkas, jadi berkas ini wajib menyatakan id_blocks. Tanpa itu, penambahan paralel akan bertabrakan diam-diam.`);
      }
    }
    // L25 — blok yang diklaim tidak boleh tumpang tindih
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        for (const a of list[i].blocks ?? []) {
          for (const b of list[j].blocks ?? []) {
            if (a.from <= b.to && b.from <= a.to) {
              // Dilaporkan pada kedua berkas: keduanya perlu diperbaiki, dan yang
              // menemukan galat ini belum tentu pemilik berkas yang disebut lebih dulu.
              fail(list[i].file, 'L25-blok-tumpang', `Blok ${a.from}-${a.to} bertindih dengan ${b.from}-${b.to} milik ${list[j].file} pada jenis entitas "${prefix}".`);
              fail(list[j].file, 'L25-blok-tumpang', `Blok ${b.from}-${b.to} bertindih dengan ${a.from}-${a.to} milik ${list[i].file} pada jenis entitas "${prefix}".`);
            }
          }
        }
      }
    }
  }

  return { errors, warnings, validated, total: docs.length, schemaCount: schemaFiles.length };
}
