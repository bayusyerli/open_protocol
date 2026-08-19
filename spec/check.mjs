// Logika pemeriksa spesifikasi Open Protocols Lapis 1.
// Dua lapis pemeriksaan:
//   1. Skema  — bentuk data, ditegakkan JSON Schema.
//   2. Aturan — kebijakan yang tidak bisa dinyatakan skema (netralitas vendor, PDP, keselamatan).
// CLI ada di validate.mjs; uji aturannya ada di test-rules.mjs.

import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
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

  // Setiap berkas jadi satu unit, kecuali koleksi yang dibentangkan jadi satu unit per item.
  const docs = [];
  const vocabTypes = new Set();
  for (const dir of dirs) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const sub of entries.filter((e) => e.isDirectory())) dirs.push(join(dir, sub.name));
    for (const f of entries.filter((e) => e.isFile()).map((e) => e.name).filter((x) => x.endsWith('.json'))) {
      const raw = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      const label = `${dir}/${f}`;
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
          if (dir.startsWith('vocab') && typeof item.id === 'string') vocabTypes.add(item.id.split(':')[1]);
        });
      } else if (raw.collection && Array.isArray(raw.items)) {
        docs.push({ file: label, doc: raw, isCollection: true });
        const itemSchema = `${raw.collection.entity_type}.schema.json`;
        raw.items.forEach((item, i) => {
          docs.push({ file: `${label} [${i}] ${item.key ?? item.id ?? ''}`, doc: item, forcedSchema: itemSchema });
          if (dir === 'vocab' && typeof item.id === 'string') vocabTypes.add(item.id.split(':')[1]);
        });
      } else {
        docs.push({ file: label, doc: raw });
        if (dir === 'vocab' && typeof raw.id === 'string') vocabTypes.add(raw.id.split(':')[1]);
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
    if (doc.key) {
      if (seenKey.has(doc.key)) fail(file, 'L1-key-unik', `key "${doc.key}" sudah dipakai di ${seenKey.get(doc.key)}.`);
      seenKey.set(doc.key, file);
    }
  }

  for (const { file, doc } of docs) {
    // L2 — apa pun yang berstatus published wajib punya content_hash
    if (doc.lifecycle?.status === 'published' && !doc.lifecycle?.content_hash) {
      fail(file, 'L2-hash-terbit', 'Status "published" tanpa lifecycle.content_hash: versi terbit tidak boleh bisa berubah diam-diam.');
    }

    // L3 — netralitas vendor: langkah protokol terbit tidak boleh menyebut produk komersial
    if (doc.mode === 'planned' && doc.protocol_step_key) {
      for (const [i, a] of (doc.applications ?? []).entries()) {
        if (a.product) {
          fail(file, 'L3-netralitas-vendor', `applications[${i}] pada langkah rencana milik protokol menyebut produk komersial. Rekomendasi harus generik; produk hanya boleh muncul pada mode "executed".`);
        }
        if (a.preparation_batch) {
          fail(file, 'L3-netralitas-vendor', `applications[${i}] pada langkah rencana milik protokol menunjuk batch sediaan tertentu. Batch adalah data satu kebun; yang boleh masuk protokol hanya resepnya (preparation).`);
        }
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

    // L14 — produk tanpa komposisi tidak bisa dipakai menghitung hara yang diberikan
    for (const [i, a] of (doc.applications ?? []).entries()) {
      const prod = a.product?.id && entityById.get(a.product.id);
      if (prod && !prod.composition?.length && a.nutrients_delivered?.length) {
        fail(file, 'L14-komposisi', `applications[${i}] menghitung nutrients_delivered dari produk "${prod.key}" yang tidak punya composition. Registri pupuk Kementan tidak memuat kandungan hara, jadi angka itu tidak bisa diturunkan dari mana pun.`);
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

  return { errors, warnings, validated, total: docs.length, schemaCount: schemaFiles.length };
}
