#!/usr/bin/env node
// Olah registri pengecer & distributor Syngenta Indonesia (Drupal JSON:API).
//
//   node toko_data/ambil-syngenta.mjs --olah
//
// Masukan  : toko_data/raw/syngenta/distributor-mentah.ndjson
// Keluaran : toko_data/raw/syngenta.ndjson                  (Jawa, titik dipercaya — dibaca gabung.mjs)
//            toko_data/raw/syngenta-tanpa-koordinat.ndjson  (Jawa, titik hilang atau diragukan)
//            toko_data/raw/syngenta/audit-luar-jawa.ndjson  (di luar Jawa, untuk pemeriksaan)
//            toko_data/laporan-syngenta.md
//
// --- Cara mengambil ulang ---------------------------------------------------
// Seluruh host www.syngenta.co.id berada di belakang tantangan Cloudflare: curl polos
// mendapat HTTP 403 "Just a moment..." pada SEMUA jalur, /jsonapi termasuk (diperiksa
// 22 Agustus 2026). Datanya sendiri publik dan tanpa autentikasi — yang menghalangi
// hanya pemeriksaan peramban. Maka pengambilan dijalankan dari sesi peramban biasa
// lewat toko_data/ambil-syngenta.js; lihat berkas itu untuk cara memindahkan hasilnya
// ke sini. Endpointnya:
//
//   /jsonapi/node/distributor?sort=drupal_internal__nid&page[limit]=50
//   /jsonapi/taxonomy_term/business              (tingkat pengecer)
//   /jsonapi/taxonomy_term/distributors_geo_region  (nama kabupaten, lebih bersih dari locality)
//
// Diambil se-Indonesia, bukan per provinsi Jawa. Dua sebab: kode provinsi di sumbernya
// tidak konsisten, dan faset situsnya sama sekali tidak punya Banten maupun DI Yogyakarta
// padahal keduanya di Pulau Jawa. Menyaring Jawa dikerjakan di sini, dari nama wilayah
// yang sudah dinormalkan DAN dari koordinat, supaya baris berkode menyimpang tidak
// hilang diam-diam.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = dirname(fileURLToPath(import.meta.url))
const RAW = join(DIR, 'raw')
const SUB = join(RAW, 'syngenta')

// field_address.administrative_area ditulis campur aduk: nama penuh ("Jawa Barat")
// hidup berdampingan dengan kode dua huruf. Kodenya ternyata ISO 3166-2:ID tanpa
// awalan "ID-", jadi dipetakan memakai tabel itu, bukan tebakan.
const ISO = {
  AC: 'Aceh', BA: 'Bali', BB: 'Kepulauan Bangka Belitung', BE: 'Bengkulu', BT: 'Banten',
  GO: 'Gorontalo', JA: 'Jambi', JB: 'Jawa Barat', JI: 'Jawa Timur', JK: 'DKI Jakarta',
  JT: 'Jawa Tengah', KB: 'Kalimantan Barat', KI: 'Kalimantan Timur', KR: 'Kepulauan Riau',
  KS: 'Kalimantan Selatan', KT: 'Kalimantan Tengah', KU: 'Kalimantan Utara', LA: 'Lampung',
  MA: 'Maluku', MU: 'Maluku Utara', NB: 'Nusa Tenggara Barat', NT: 'Nusa Tenggara Timur',
  PA: 'Papua', PB: 'Papua Barat', RI: 'Riau', SA: 'Sulawesi Utara', SB: 'Sumatera Barat',
  SG: 'Sulawesi Tenggara', SN: 'Sulawesi Selatan', SR: 'Sulawesi Barat', SS: 'Sumatera Selatan',
  ST: 'Sulawesi Tengah', SU: 'Sumatera Utara', YO: 'DI Yogyakarta'
}

// Ejaan panjang yang beragam disatukan ke satu bentuk baku.
const EJAAN = {
  'jawa barat': 'Jawa Barat', 'jabar': 'Jawa Barat', 'west java': 'Jawa Barat',
  'jawa tengah': 'Jawa Tengah', 'jateng': 'Jawa Tengah', 'central java': 'Jawa Tengah',
  'jawa timur': 'Jawa Timur', 'jatim': 'Jawa Timur', 'east java': 'Jawa Timur',
  'dki jakarta': 'DKI Jakarta', 'jakarta': 'DKI Jakarta', 'dki': 'DKI Jakarta',
  'banten': 'Banten',
  'di yogyakarta': 'DI Yogyakarta', 'daerah istimewa yogyakarta': 'DI Yogyakarta',
  'yogyakarta': 'DI Yogyakarta', 'diy': 'DI Yogyakarta', 'jogjakarta': 'DI Yogyakarta'
}

function bakukanProvinsi (nilai) {
  const s = String(nilai ?? '').trim()
  if (!s) return null
  if (/^[A-Z]{2}$/.test(s) && ISO[s]) return ISO[s]
  return EJAAN[s.toLowerCase().replace(/\s+/g, ' ')] ?? s
}

// Kotak pembatas per provinsi, disalin dari toko_data/ambil-osm.sh supaya kedua
// pemanen memakai batas yang sama. Kotak ini saling tumpang tindih (DKI di dalam
// kotak Jabar, DIY di dalam kotak Jateng), jadi kotak hanya dipakai untuk MEMBANTAH
// — "titik ini tidak mungkin di provinsi yang tertulis" — bukan untuk menyimpulkan
// provinsi dari titik.
const KOTAK = {
  'Banten':        { latMin: -7.05, latMax: -5.75, lonMin: 105.00, lonMax: 106.85 },
  'DKI Jakarta':   { latMin: -6.40, latMax: -5.90, lonMin: 106.60, lonMax: 107.05 },
  'Jawa Barat':    { latMin: -7.90, latMax: -5.90, lonMin: 106.30, lonMax: 108.90 },
  'Jawa Tengah':   { latMin: -8.30, latMax: -6.25, lonMin: 108.45, lonMax: 111.75 },
  'DI Yogyakarta': { latMin: -8.25, latMax: -7.50, lonMin: 110.00, lonMax: 110.90 },
  'Jawa Timur':    { latMin: -8.85, latMax: -6.70, lonMin: 110.85, lonMax: 114.70 }
}
const JAWA = { latMin: -8.90, latMax: -5.80, lonMin: 104.90, lonMax: 114.80 }   // sama dengan gabung.mjs
const INDONESIA = { latMin: -11.5, latMax: 6.5, lonMin: 94.5, lonMax: 141.5 }

const didalam = (k, la, lo) => la >= k.latMin && la <= k.latMax && lo >= k.lonMin && lo <= k.lonMax

const PROV_JAWA = ['Banten', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur']

// Registri ini tidak punya SATU pun baris berprovinsi "Banten" atau "DI Yogyakarta" —
// bukan karena tak ada pengecer di sana, melainkan karena barisnya diarsipkan di bawah
// provinsi tetangga. Banten memisahkan diri dari Jawa Barat pada 2000 (UU 23/2000) dan
// label provinsinya tidak pernah ikut diperbarui; kabupaten DIY tercatat sebagai Jawa
// Tengah. Nama kabupaten yang memutuskan, bukan koordinat: nama itu terbukti jadi
// penengah paling andal di data ini, dan tetap bekerja pada baris yang koordinatnya
// hilang atau berupa titik semu.
const KAB_PINDAH = {
  Banten: ['Pandeglang', 'Serang', 'Lebak', 'Cilegon', 'Tangerang', 'Tangerang Selatan'],
  'DI Yogyakarta': ['Sleman', 'Bantul', 'Gunung Kidul', 'Gunungkidul', 'Kulon Progo', 'Kulonprogo', 'Yogyakarta']
}
const PINDAH = new Map()
for (const [prov, daftar] of Object.entries(KAB_PINDAH)) {
  for (const kab of daftar) PINDAH.set(kab.toLowerCase(), prov)
}

// ------------------------------------------------------------------- olah --
function olah () {
  const baris = readFileSync(join(SUB, 'distributor-mentah.ndjson'), 'utf8')
    .split('\n').filter((b) => b.trim()).map((b) => JSON.parse(b))

  // --- ronde 1: rapikan tiap baris -----------------------------------------
  const nidTerlihat = new Set()
  let kembarNid = 0
  const provAsli = {}
  const semua = []

  for (const r of baris) {
    if (nidTerlihat.has(r.nid)) { kembarNid++; continue }
    nidTerlihat.add(r.nid)

    provAsli[r.prov_sumber ?? '(kosong)'] = (provAsli[r.prov_sumber ?? '(kosong)'] ?? 0) + 1

    // field_regions adalah istilah taksonomi tersendiri dan jauh lebih rapi daripada
    // field_address.locality (yang isinya campur huruf besar-kecil dan nama kecamatan);
    // locality dipakai hanya sebagai cadangan.
    const kabupaten = (Array.isArray(r.wilayah) && r.wilayah[0]) || r.kota_sumber || null
    const provSumber = bakukanProvinsi(r.prov_sumber)
    const pindah = kabupaten ? PINDAH.get(String(kabupaten).toLowerCase()) : null
    // Hanya dipindahkan bila provinsi tertulis memang tetangga yang keliru itu, supaya
    // kabupaten senama di pulau lain tidak ikut tertarik.
    const koreksi = pindah && pindah !== provSumber &&
      ((pindah === 'Banten' && provSumber === 'Jawa Barat') ||
       (pindah === 'DI Yogyakarta' && provSumber === 'Jawa Tengah')) ? pindah : null

    // Di JSON:API lat/lng sudah berupa angka, jadi spasi di depan yang muncul pada
    // atribut data-lng versi HTML tidak terjadi di sini. Number(String(...).trim())
    // tetap dipasang supaya berkas mentah hasil kerokan HTML pun aman diolah.
    const la = r.lat == null ? NaN : Number(String(r.lat).trim())
    const lo = r.lng == null ? NaN : Number(String(r.lng).trim())

    semua.push({ r, kabupaten, provSumber, provinsi: koreksi ?? provSumber, koreksi, la, lo })
  }

  // --- ronde 2: cari titik semu --------------------------------------------
  // Satu koordinat yang persis sama dipakai ulang oleh banyak baris adalah titik isian
  // otomatis, bukan alamat. Yang membedakannya dari dua kios yang kebetulan digeokode
  // ke titik desa yang sama: titik semu menyeberangi batas kabupaten. Ambang itu yang
  // dipakai — dihitung dari datanya sendiri, bukan daftar titik yang ditulis tangan,
  // supaya aturan ini tetap berlaku pada panen berikutnya.
  const kabPerTitik = new Map()
  for (const s of semua) {
    if (!Number.isFinite(s.la) || !Number.isFinite(s.lo)) continue
    const k = `${s.la},${s.lo}`
    if (!kabPerTitik.has(k)) kabPerTitik.set(k, new Set())
    kabPerTitik.get(k).add(s.kabupaten ?? '?')
  }
  const titikSemu = new Set()
  for (const [k, kab] of kabPerTitik) if (kab.size > 1) titikSemu.add(k)

  // Titik semu terparah dikutip apa adanya di laporan, jadi dihitung di sini
  // ketimbang ditulis tangan — panen berikutnya bisa saja punya juara baru.
  let juara = { titik: null, n: 0, kab: 0 }
  for (const k of titikSemu) {
    const n = semua.filter((s) => `${s.la},${s.lo}` === k).length
    if (n > juara.n) juara = { titik: k, n, kab: kabPerTitik.get(k).size }
  }

  // --- ronde 3: golongkan ---------------------------------------------------
  const jawa = []; const ragu = []; const luar = []
  const alasan = {}
  const catat = (a) => { alasan[a] = (alasan[a] ?? 0) + 1 }

  for (const s of semua) {
    const { r } = s
    const dasar = {
      nama: r.nama,
      alamat: r.alamat ?? null,
      sumber: 'syngenta',
      sumber_id: r.mig ?? `NID-${r.nid}`,
      provinsi: s.provinsi,
      provinsi_sumber: r.prov_sumber ?? null,
      kabupaten: s.kabupaten,
      kode_pos: r.pos ?? null,
      telepon: r.tel ?? [],
      surel: r.surel ?? [],
      tingkat: (Array.isArray(r.bisnis) && r.bisnis[0]) || null,
      diperbarui: r.ubah ? String(r.ubah).slice(0, 10) : null,
      lisensi: 'hak cipta Syngenta; rujukan lokasi, bukan untuk diterbitkan ulang'
    }
    if (s.koreksi) {
      dasar.dasar_koreksi = `provinsi di sumber "${r.prov_sumber}" diganti ${s.koreksi}: ` +
        `${s.kabupaten} adalah kabupaten/kota ${s.koreksi}`
    }

    const diJawa = s.provinsi && PROV_JAWA.includes(s.provinsi)
    const adaTitik = Number.isFinite(s.la) && Number.isFinite(s.lo) && !(s.la === 0 && s.lo === 0)

    if (!adaTitik) {
      const sebab = r.lat == null && r.lng == null ? 'tanpa-koordinat'
        : (s.la === 0 && s.lo === 0) ? 'koordinat-nol' : 'koordinat-rusak'
      if (diJawa) { catat(sebab); ragu.push({ ...dasar, ragu: sebab }) }
      else luar.push({ ...dasar, lat: null, lon: null, ragu: sebab })
      continue
    }

    const titik = `${s.la},${s.lo}`
    if (titikSemu.has(titik)) {
      const n = kabPerTitik.get(titik).size
      const sebab = 'koordinat-bersama'
      if (diJawa) {
        catat(sebab)
        ragu.push({ ...dasar, lat: s.la, lon: s.lo, ragu: `${sebab} (titik yang sama dipakai ${n} kabupaten)` })
      } else luar.push({ ...dasar, lat: s.la, lon: s.lo, ragu: sebab })
      continue
    }

    if (!diJawa) { luar.push({ ...dasar, lat: s.la, lon: s.lo }); continue }

    if (!didalam(INDONESIA, s.la, s.lo)) {
      catat('luar-indonesia')
      ragu.push({ ...dasar, lat: s.la, lon: s.lo, ragu: 'luar-indonesia' })
      continue
    }

    // Kotak provinsi hanya dipakai untuk MEMBANTAH: kotak selalu lebih besar daripada
    // provinsinya, jadi titik di luar kotak pasti di luar provinsi. Kebalikannya tidak
    // berlaku, maka titik yang masuk kotak tidak dipakai untuk menyimpulkan provinsi.
    if (didalam(KOTAK[s.provinsi], s.la, s.lo)) {
      jawa.push({ ...dasar, lat: s.la, lon: s.lo })
    } else {
      const muat = PROV_JAWA.filter((p) => didalam(KOTAK[p], s.la, s.lo))
      catat('provinsi-tak-cocok')
      ragu.push({
        ...dasar, lat: s.la, lon: s.lo,
        ragu: `provinsi-tak-cocok (titik jatuh di ${muat.join('/') || 'luar Pulau Jawa'})`
      })
    }
  }

  return { jawa, ragu, luar, provAsli, alasan, kembarNid, dibaca: baris.length, titikSemu: titikSemu.size, juara }
}

// ---------------------------------------------------------------- keluaran --
function tulis (h) {
  mkdirSync(SUB, { recursive: true })
  const ndjson = (a) => a.map((r) => JSON.stringify(r)).join('\n') + (a.length ? '\n' : '')

  // gabung.mjs membaca raw/*.ndjson dan hanya melewati yang bernama "tanpa-koordinat".
  // Karena itu hanya berkas bersih yang ditaruh di raw/ tingkat atas; berkas audit
  // disimpan di raw/syngenta/ yang tidak ikut terbaca (readdirSync tidak rekursif).
  writeFileSync(join(RAW, 'syngenta.ndjson'), ndjson(h.jawa))
  writeFileSync(join(RAW, 'syngenta-tanpa-koordinat.ndjson'), ndjson(h.ragu))
  writeFileSync(join(SUB, 'audit-luar-jawa.ndjson'), ndjson(h.luar))

  const hitung = (a, k) => {
    const o = {}
    for (const r of a) { const v = r[k] ?? '(kosong)'; o[v] = (o[v] ?? 0) + 1 }
    return o
  }
  const tabel = (o, n = 999) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n)
    .map(([k, v]) => `| ${k} | ${v} |`).join('\n') || '| — | 0 |'

  const semuaJawa = [...h.jawa, ...h.ragu]
  const koreksi = semuaJawa.filter((r) => r.dasar_koreksi)

  writeFileSync(join(DIR, 'laporan-syngenta.md'), `# Laporan panen Syngenta Indonesia

Sumber: \`https://www.syngenta.co.id/jsonapi/node/distributor\` — Drupal JSON:API, terbuka
untuk dibaca, tanpa autentikasi. Diambil 22 Agustus 2026, 74 halaman, ${h.dibaca} baris
se-Indonesia.

Pengambilan dijalankan dari sesi peramban (lihat \`ambil-syngenta.js\`): host-nya berada di
belakang tantangan Cloudflare dan curl polos selalu mendapat HTTP 403 pada semua jalur.

Diambil se-Indonesia lalu disaring ke Jawa di sini, bukan lewat parameter provinsi di API.
Itu yang membuat dua temuan di bawah kelihatan; menyaring di sisi server akan
menyembunyikan keduanya.

## Hasil

| Berkas | Isi | Baris |
|---|---|---|
| \`raw/syngenta.ndjson\` | Jawa, koordinat lolos uji — dibaca \`gabung.mjs\` | **${h.jawa.length}** |
| \`raw/syngenta-tanpa-koordinat.ndjson\` | Jawa, koordinat hilang atau diragukan | **${h.ragu.length}** |
| \`raw/syngenta/audit-luar-jawa.ndjson\` | di luar Jawa | ${h.luar.length} |
| \`raw/syngenta/distributor-mentah.ndjson\` | panen apa adanya | ${h.dibaca} |

Jawa seluruhnya: **${semuaJawa.length}** baris.

## Temuan 1 — Banten dan DI Yogyakarta ada, hanya salah arsip

Registri ini tidak punya satu pun baris berprovinsi "Banten" atau "DI Yogyakarta", dan
faset di situsnya pun tidak menawarkan keduanya. Bukan berarti tidak ada pengecer di sana:
barisnya diarsipkan di bawah provinsi tetangga. Banten memisahkan diri dari Jawa Barat
pada 2000 dan label provinsinya tidak pernah ikut diperbarui.

| Provinsi sebenarnya | Tercatat sebagai | Baris | Kabupaten |
|---|---|---|---|
| Banten | Jawa Barat | ${koreksi.filter((r) => r.provinsi === 'Banten').length} | ${[...new Set(koreksi.filter((r) => r.provinsi === 'Banten').map((r) => r.kabupaten))].sort().join(', ')} |
| DI Yogyakarta | Jawa Tengah | ${koreksi.filter((r) => r.provinsi === 'DI Yogyakarta').length} | ${[...new Set(koreksi.filter((r) => r.provinsi === 'DI Yogyakarta').map((r) => r.kabupaten))].sort().join(', ')} |

Yang memutuskan adalah nama kabupaten, bukan koordinat — nama itu tetap ada pada baris
yang koordinatnya hilang atau semu. Baris yang dipindahkan membawa kolom \`dasar_koreksi\`
yang menyebutkan alasannya, dan \`provinsi_sumber\` tetap menyimpan tulisan aslinya.

## Temuan 2 — koordinat isian otomatis

\`${h.juara.titik}\` dipakai oleh **${h.juara.n}** baris se-Indonesia yang tersebar di
${h.juara.kab} kabupaten dan 3 provinsi. Titik itu bukan alamat, melainkan isian otomatis.
Ia jatuh di dalam kotak Jawa Tengah, jadi tanpa pemeriksaan ini ${h.juara.n} kios Jawa Timur,
Bali, dan Jawa Tengah akan menumpuk di satu titik di Jawa Tengah dan tetap kelihatan sah.

Titik semacam itu dikenali dari datanya sendiri, bukan dari daftar yang ditulis tangan:
sebuah koordinat yang persis sama dan dipakai lintas kabupaten pasti isian otomatis,
sedangkan dua kios yang digeokode ke titik desa yang sama tetap satu kabupaten. Di seluruh
panen ada **${h.titikSemu}** titik seperti itu, menandai **${h.alasan['koordinat-bersama'] ?? 0}**
baris Jawa. Titik berulang yang tetap di dalam satu kabupaten TIDAK ditandai — ada 70 titik
semacam itu di Jawa, dan menandainya akan membuang geokode yang masuk akal.

## Yang ditandai ragu
Koordinat yang bertentangan dengan wilayah yang tertulis tidak dibuang dan tidak dipercaya:
barisnya tetap lengkap dengan nama, alamat, dan telepon di
\`raw/syngenta-tanpa-koordinat.ndjson\`, dengan kolom \`ragu\` yang menyebut sebabnya.

| Sebab | Jumlah |
|---|---|
${tabel(h.alasan)}

## Jawa per provinsi
Setelah pemindahan Banten dan DIY di atas.

| Provinsi | Titik dipercaya | Ragu | Jumlah |
|---|---|---|---|
${PROV_JAWA.map((p) => {
    const a = h.jawa.filter((r) => r.provinsi === p).length
    const b = h.ragu.filter((r) => r.provinsi === p).length
    return a + b ? `| ${p} | ${a} | ${b} | ${a + b} |` : null
  }).filter(Boolean).join('\n')}
| **Jumlah** | **${h.jawa.length}** | **${h.ragu.length}** | **${semuaJawa.length}** |

## Ejaan provinsi apa adanya di sumber
Kode dua huruf ternyata ISO 3166-2:ID tanpa awalan \`ID-\`; \`JT\` = Jawa Tengah. Semua kode
yang muncul sudah tercakup tabel di \`ambil-syngenta.mjs\`; tidak ada \`BT\` (Banten) maupun
\`YO\` (DI Yogyakarta) sama sekali.

| Nilai administrative_area | Jumlah |
|---|---|
${tabel(h.provAsli, 40)}

## Kelengkapan bidang
Dihitung atas ${semuaJawa.length} baris Jawa. \`field_emails\` dan \`postal_code\` ada di skema
tetapi kosong di SEMUA baris — jangan dihitung sebagai sumber kontak.

| Bidang | Terisi |
|---|---|
| alamat | ${semuaJawa.filter((r) => r.alamat).length} |
| telepon | ${semuaJawa.filter((r) => r.telepon && r.telepon.length).length} |
| kabupaten | ${semuaJawa.filter((r) => r.kabupaten).length} |
| koordinat lolos uji | ${h.jawa.length} |
| surel | ${semuaJawa.filter((r) => r.surel && r.surel.length).length} |
| kode pos | ${semuaJawa.filter((r) => r.kode_pos).length} |

## Tingkat pengecer
\`field_business\` hanya punya dua nilai; artinya tidak dijelaskan di situsnya.

| Tingkat | Jumlah |
|---|---|
${tabel(hitung(semuaJawa, 'tingkat'))}

## Kabupaten teratas di Jawa
| Kabupaten | Jumlah |
|---|---|
${tabel(hitung(semuaJawa, 'kabupaten'), 20)}

## Catatan pemeriksaan yang sengaja TIDAK dipasang
Kotak provinsi saling tumpang tindih dengan pulau seberang: kotak Jawa Timur melewati
Selat Bali sampai ke Jembrana dan Buleleng, kotak Banten melewati Selat Sunda sampai ke
Lampung Selatan. Aturan "tertulis di luar Jawa tapi titiknya di kotak Jawa" karena itu
dicoba lalu dibuang — 13 baris yang ditangkapnya semuanya benar-benar Bali dan Lampung,
tidak satu pun kios Jawa yang salah label. Baris Jawa yang salah label ditemukan lewat
nama kabupaten (Temuan 1), yang tidak punya masalah itu.

## Menunggu diklaim pemiliknya
\`field_emails\` dan \`postal_code\` kosong di seluruh registri, dan ${h.ragu.length} baris Jawa
belum punya titik yang layak dipercaya. Keduanya tidak bisa ditambal dari sumber lain:
surel dan kode pos hanya pemiliknya yang tahu, dan menebak koordinat dari alamat justru
akan menutupi masalahnya. Keduanya menunggu alur "klaim toko Anda".

Yang paling masuk akal didahulukan adalah ${h.ragu.length} baris di
\`raw/syngenta-tanpa-koordinat.ndjson\`: nama, alamat, dan teleponnya sudah lengkap, jadi
pemiliknya bisa dihubungi lebih dulu dan yang diminta cuma menaruh pin. \`gabung.mjs\`
mengumpulkannya bersama kios tanpa titik dari sumber lain ke
\`toko-tani-jawa-tanpa-titik.ndjson\`.

Yang ${h.alasan['koordinat-bersama'] ?? 0} baris bertitik semu perlu diperlakukan berbeda dari
yang ${h.alasan['tanpa-koordinat'] ?? 0} baris tanpa koordinat sama sekali: keduanya butuh pin
baru, tapi yang pertama akan tampak sudah punya lokasi kalau kolom \`ragu\` diabaikan.

## Lisensi
Isi registri ini hak cipta Syngenta dan **tidak** berlisensi terbuka. Dipakai sebagai
rujukan lokasi di dalam aplikasi, bukan untuk diterbitkan ulang sebagai kumpulan data
mandiri. Tiap baris membawa kolom \`lisensi\` yang menyatakan hal itu, dan kolom itu ikut
sampai ke berkas gabungan. Bandingkan dengan \`opendata-*\` yang CC-BY dan boleh disebarkan
ulang. Duduk perkaranya ditulis di [\`LISENSI.md\`](../LISENSI.md), bagian
"Direktori toko dari registri principal".
`)

  console.log(`terbaca ${h.dibaca} → Jawa ${semuaJawa.length} (${h.jawa.length} dipercaya, ${h.ragu.length} ragu), luar Jawa ${h.luar.length}`)
  console.log(`  ${koreksi.length} baris dipindahkan provinsinya, ${h.titikSemu} titik semu`)
  for (const [k, v] of Object.entries(h.alasan).sort((a, b) => b[1] - a[1])) console.log(`  ragu: ${k} = ${v}`)
}

if (process.argv.includes('--olah')) tulis(olah())
else {
  console.error('pakai: node toko_data/ambil-syngenta.mjs --olah')
  process.exit(1)
}
