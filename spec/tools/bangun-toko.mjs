#!/usr/bin/env node
// Menyusun kosakata toko (`spec/vocab/toko/`) dari lajur yang lisensinya bersih.
//
//   node spec/tools/bangun-toko.mjs            periksa saja, tulis ringkasannya
//   node spec/tools/bangun-toko.mjs --tulis    simpan toko.ndjson + toko.meta.json
//
// KENAPA ADA LAJUR KEDUA, DI SAMPING toko_data/
// `toko_data/` tetap jadi lajur panen: hasil sapuan, dipilah menurut lisensi sumber, dan
// bangun-indeks.mjs membacanya apa adanya. Yang naik ke sini hanya toko yang bisa kita
// pertanggungjawabkan sebagai entitas sendiri — berpengenal tetap, berlisensi tercatat
// per rekaman, dan bisa berpindah tangan ke pemiliknya lewat `claim`. Pembagian yang sama
// sudah dipakai `pest-registri.json` di samping `pest.json`.
//
// APA YANG MASUK, DAN APA YANG SENGAJA TIDAK
//
//   MASUK  osm      toko-tani-jawa.ndjson, 234 baris. Bernama dan berkoordinat, ODbL.
//                   Atribusinya ditulis per rekaman, bukan sekali di tingkat koleksi —
//                   kewajiban ODbL tidak boleh hilang saat rekamannya dipakai ulang.
//   MASUK  opendata Batang, 67 baris CC-BY. Beralamat jalan sungguhan, tanpa koordinat.
//
//   TIDAK  TTI Kementan, 2.181 baris. Dua alasan yang berdiri sendiri-sendiri:
//          (1) Toko Tani Indonesia adalah program stabilisasi pangan — gerainya menjual
//              beras dan cabai ke konsumen, bukan sarana produksi. Memasukkannya ke
//              entitas yang berjudul "penjual sarana produksi pertanian" salah pada
//              pokoknya, bukan cuma tidak rapi.
//          (2) 717 dari 2.181 "nama"-nya nama perorangan (agen), bukan nama usaha.
//              Halaman bernama tentang orang adalah pemrosesan data pribadi tanpa dasar
//              di sini — keputusan yang sama sudah diambil untuk penyuluh di skema BPP.
//          Barisnya tetap hidup di toko_data/benih-alamat.ndjson sebagai bahan panen.
//
//   TIDAK  Google Places. Tidak pernah jadi `sourcing`. Place ID boleh menempel sebagai
//          `mappings` (§A.3), tetapi nama dan fotonya harus datang dari pemilik atau
//          survei kita. Ditegakkan L50-toko-lisensi, bukan cuma dijanjikan di komentar.
//
// NOMOR ID DIBERIKAN SEKALI DAN TIDAK DIDAUR ULANG
// Nomor diambil dari blok koleksi ini (lihat spec/00-konvensi-kerja-paralel.md), bukan
// dari maksimum global. Berkas yang sudah ada dibaca lebih dulu supaya toko yang sudah
// bernomor mempertahankan nomornya walau urutan masukannya berubah — kalau tidak, satu
// baris baru di tengah akan menggeser seluruh nomor di bawahnya.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolusi } from '../../toko_data/wilayah-resmi.mjs'

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const KELUAR = join(AKAR, 'spec', 'vocab', 'toko')
const NDJSON = join(KELUAR, 'toko.ndjson')
const META = join(KELUAR, 'toko.meta.json')
const BLOK = { dari: 1000, sampai: 19999 }
const TULIS = process.argv.includes('--tulis')

const bacaNd = (p) => {
  const penuh = join(AKAR, p)
  if (!existsSync(penuh)) return []
  return readFileSync(penuh, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))
}

const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'toko'

// --- masukan ------------------------------------------------------------------
const calon = []

for (const r of bacaNd('toko_data/toko-tani-jawa.ndjson')) {
  if (!r.nama || !Number.isFinite(r.lat) || !Number.isFinite(r.lon)) continue
  calon.push({
    nama: r.nama,
    sourcing: 'osm',
    license: 'ODbL-1.0',
    attribution: '© Kontributor OpenStreetMap, ODbL 1.0',
    // `bangunan`, bukan `pintu`: simpul OSM ditaruh pemeta dari citra satelit atau
    // jejak GPS lewat, bukan diambil di depan pintunya. Menyebutnya `pintu` akan
    // membuat penyaji menampilkan jarak dalam meter yang tidak dijamin datanya.
    location: { lat: r.lat, lon: r.lon, precision: 'bangunan', source: 'osm' },
    pembeda: `${r.lat.toFixed(4)},${r.lon.toFixed(4)}`,
  })
}

for (const r of bacaNd('toko_data/benih-alamat.ndjson')) {
  if (r.sumber !== 'opendata-jateng' || !r.nama || !r.alamat) continue
  // Alamat Batang berbentuk "Jl. X, Kec. Y, Kabupaten Z, Provinsi" — potongan
  // kecamatan dan kabupatennya diambil dari sana, lalu diresolusi ke kosakata wilayah.
  const bagian = r.alamat.split(',').map((s) => s.trim())
  const w = resolusi({
    kecamatan: bagian.find((b) => /^kec\.?\s/i.test(b)) ?? '',
    kota: bagian.find((b) => /^(kabupaten|kota)\s/i.test(b)) ?? '',
  })
  calon.push({
    nama: r.nama,
    sourcing: 'opendata',
    license: 'CC-BY-4.0',
    attribution: 'Pemerintah Kabupaten Batang, CC-BY',
    address: { text: r.alamat, region: w.distrik?.id ?? w.induk?.id ?? undefined },
    pembeda: slug(r.alamat).slice(0, 24),
  })
}

// --- kunci stabil & penomoran --------------------------------------------------
// Nama toko tani sangat sering kembar ("Tani Jaya" ada di mana-mana), jadi kunci
// disusun dari nama + pembeda (koordinat atau alamat). Tanpa pembeda, dua kios
// berlainan di kabupaten berbeda akan saling menimpa dan cacahnya menyusut diam-diam.
const dipakai = new Set()
for (const c of calon) {
  let k = slug(c.nama)
  if (dipakai.has(k)) k = `${k}-${slug(c.pembeda)}`.slice(0, 80)
  let n = 2
  while (dipakai.has(k)) k = `${slug(c.nama)}-${n++}`.slice(0, 80)
  dipakai.add(k)
  c.key = k
  delete c.pembeda
}

const lama = new Map()
if (existsSync(NDJSON)) for (const r of bacaNd('spec/vocab/toko/toko.ndjson')) lama.set(r.key, r)

let berikut = BLOK.dari
const terpakai = new Set([...lama.values()].map((r) => Number(r.id.slice(-8))))
const nomorBaru = () => {
  while (terpakai.has(berikut)) berikut++
  if (berikut > BLOK.sampai) throw new Error(`blok ID tko habis (${BLOK.dari}-${BLOK.sampai})`)
  terpakai.add(berikut)
  return berikut
}

const HARI = new Date().toISOString().slice(0, 10)
const entitas = calon.map((c) => {
  const sebelumnya = lama.get(c.key)
  const id = sebelumnya?.id ?? `op:tko:${String(nomorBaru()).padStart(8, '0')}`
  return {
    id,
    key: c.key,
    label: { id: c.nama },
    lifecycle: sebelumnya?.lifecycle ?? { version: '0.1.0', status: 'draft', created_at: `${HARI}T00:00:00Z` },
    // Setiap rekaman benih wajib menjelaskan kenapa ia belum punya pemetaan luar.
    // Place ID TIDAK dicocokkan otomatis di sini: singgahan Google sudah dipangkas
    // sampai tanpa nama, jadi yang tersisa cuma kedekatan titik — dan nama toko tani
    // terlalu generik untuk dipercaya atas kedekatan saja. Pencocokan dijalankan
    // terpisah lewat toko_data/gmaps-pilot.mjs cocokkan, yang punya nama saat memanggil.
    no_mapping_reason: 'Belum dicocokkan ke pengenal luar mana pun. Place ID hanya boleh ditempel lewat pencocokan bernama, bukan atas kedekatan koordinat saja.',
    sourcing: c.sourcing,
    license: c.license,
    attribution: c.attribution,
    ...(c.location ? { location: c.location } : {}),
    ...(c.address ? { address: Object.fromEntries(Object.entries(c.address).filter(([, v]) => v !== undefined)) } : {}),
    claim: { status: 'belum-diklaim' },
  }
})

// --- laporan & tulis ------------------------------------------------------------
const per = (f) => entitas.reduce((o, r) => ((o[f(r)] = (o[f(r)] ?? 0) + 1), o), {})
console.log(`toko terkurasi : ${entitas.length}`)
console.log(`  sourcing     : ${Object.entries(per((r) => r.sourcing)).map(([k, v]) => `${k} ${v}`).join(', ')}`)
console.log(`  lisensi      : ${Object.entries(per((r) => r.license)).map(([k, v]) => `${k} ${v}`).join(', ')}`)
console.log(`  berkoordinat : ${entitas.filter((r) => r.location).length}`)
console.log(`  bertaut wilayah: ${entitas.filter((r) => r.address?.region).length}`)
console.log(`  nomor baru   : ${entitas.filter((r) => !lama.has(r.key)).length}, dipertahankan ${entitas.filter((r) => lama.has(r.key)).length}`)

if (!TULIS) {
  console.log('\nperiksa saja — tambahkan --tulis untuk menyimpan.')
  process.exit(0)
}

mkdirSync(KELUAR, { recursive: true })
writeFileSync(NDJSON, entitas.map((r) => JSON.stringify(r)).join('\n') + '\n')
writeFileSync(META, JSON.stringify({
  $schema: '../../schema/collection.schema.json',
  collection: {
    entity_type: 'toko',
    label: { id: 'Toko, kios, dan depo penjual sarana produksi pertanian' },
    scope: {
      id: `${entitas.length} toko yang lisensinya memungkinkan kita menerbitkannya sendiri: ${entitas.filter((r) => r.sourcing === 'osm').length} dari OpenStreetMap (ODbL, bernama dan berkoordinat) dan ${entitas.filter((r) => r.sourcing === 'opendata').length} dari data terbuka Kabupaten Batang (CC-BY, beralamat jalan tanpa koordinat). Semuanya masih berstatus belum-diklaim; lajur ini dirancang tumbuh lewat setoran pemilik, bukan lewat panen ulang. 2.181 baris TTI Kementan sengaja TIDAK ditarik ke sini — programnya menjual pangan ke konsumen alih-alih sarana produksi, dan 717 di antaranya bernama perorangan, bukan usaha. Google Places tidak pernah jadi asal sebuah rekaman; place ID hanya boleh menempel sebagai pemetaan luar.`,
    },
    lifecycle: { version: '0.1.0', status: 'draft', created_at: `${HARI}T00:00:00Z`, review_due: '2027-02-24' },
    provenance: {
      license: 'CC-BY-SA-4.0',
      sources: [
        { title: 'OpenStreetMap — sapuan toko sarana pertanian se-Jawa', publisher: 'Kontributor OpenStreetMap', url: 'https://www.openstreetmap.org/copyright', year: 2026, locator: 'Overpass API, disaring toko_data/saring.jq, disusun toko_data/susun-fondasi.mjs. ODbL 1.0 — atribusi disimpan per rekaman di medan attribution.', retrieved: '2026-08-22' },
        { title: 'Data toko sarana pertanian Kabupaten Batang', publisher: 'Pemerintah Kabupaten Batang', url: 'https://data.batangkab.go.id', year: 2026, locator: 'CC-BY. Masuk lewat toko_data/benih-alamat.ndjson.', retrieved: '2026-08-22' },
      ],
    },
    storage: 'ndjson',
    count: entitas.length,
    id_blocks: [{ from: BLOK.dari, to: BLOK.sampai }],
  },
}, null, 2) + '\n')
console.log(`\nditulis -> spec/vocab/toko/toko.ndjson (${entitas.length}) + toko.meta.json`)
