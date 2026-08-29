#!/usr/bin/env node
// Menarik hasil panen Toko Tani Collector (Places API New, layanan Cloud Run terpisah)
// ke dalam repo — dipangkas di titik masuk agar hanya menyisakan yang boleh disimpan.
//
//   node toko_data/tarik-toko-sync.mjs [slug-kota ...]     tarik & susun ulang sidecar
//   node toko_data/tarik-toko-sync.mjs --periksa           periksa umur singgahan
//   node toko_data/tarik-toko-sync.mjs --sapu              hapus singgahan kedaluwarsa
//
// APA YANG BOLEH DISIMPAN, MENURUT PASAL MANA
// Ini bukan tafsir longgar; tiap medan di bawah punya izinnya sendiri.
//
//   place_id          Service Specific Terms §A.3 (Google ID Caching) — boleh
//                     disinggahkan, tanpa batas waktu. Ini satu-satunya medan yang
//                     naik ke repo.
//   lat / lng         §14.3 — boleh disinggahkan paling lama 30 hari kalender
//                     berturut-turut, setelah itu WAJIB dihapus. Duduk di privat/,
//                     bercap kedaluwarsa, disapu `--sapu`.
//   nama, alamat,     TIDAK ADA IZINNYA. §14.3 hanya menyebut lintang dan bujur,
//   foto, jenis       dan §3.2.3(b) melarang penyinggahan apa pun yang tidak
//                     diizinkan tersurat. §3.2.3(a) bahkan menyebut penyimpanan
//                     nama & alamat usaha sebagai contoh larangan. Karena itu medan
//                     ini dibuang di `pangkas()` SEBELUM menyentuh disk — bukan
//                     disimpan lalu disaring di hilir.
//
// Pola membuangnya-di-titik-masuk ini sama dengan `bersihkanPII()` di
// lesos_data/tarik-lesos.mjs: yang tidak boleh ada, tidak pernah ditulis.
//
// KENAPA NAMA TOKO TETAP BISA TAMPIL DI PRODUK
// Nama tidak disimpan, tapi pengguna tetap melihatnya — dirender live dari place_id
// lewat Places UI Kit / Embed API pada saat halaman dibuka. Yang kita simpan cuma
// identitas dan titik; isinya datang dari Google saat itu juga, lalu hilang lagi.
// Jarak "toko terdekat" dihitung dari lat/lng singgahan yang masih di dalam 30 hari.
// Lihat toko_data/LAPIS.md bagian 4 untuk batas tampilannya (§14.2 & §3.2.3(e)).
//
// WILAYAH SENGAJA TIDAK PERMANEN
// Kabupaten/kecamatan diresolusi dari untai wilayah Google saat penarikan, lalu untai
// sumbernya dibuang. Hasil resolusinya ikut singgahan 30 hari, TIDAK ikut sidecar —
// ia turunan dari konten yang tidak punya izin singgah, dan §3.2.3(c) melarang
// membuat konten berdasarkan Google Maps Content. Resolusinya memakai pencocokan
// teks, bukan point-in-polygon atas lat/lng, yang disebut spesifik di §3.2.3(c)(iv).

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import { resolusi } from './wilayah-resmi.mjs'

const DIR = dirname(fileURLToPath(import.meta.url))
const PRIVAT = join(DIR, 'privat')
const SIDECAR = join(DIR, 'place-id.ndjson')
const ASAL = 'gmaps-toko-sync'

const BASE = process.env.TOKO_SYNC_BASE ?? 'https://toko-tani-sync-api-wweektknfq-et.a.run.app'
const HARI_SINGGAH = 30            // §14.3. Bukan angka pilihan kita.
const HALAMAN = 500                // plafon `limit` layanannya

function kunci () {
  if (process.env.TOKO_SYNC_API_KEY) return process.env.TOKO_SYNC_API_KEY.trim()
  const berkas = join(homedir(), '.config', 'toko-sync-key')
  if (existsSync(berkas)) return readFileSync(berkas, 'utf8').trim()
  return null
}

const hariIni = () => new Date().toISOString().slice(0, 10)
const tambahHari = (iso, n) => new Date(Date.parse(iso) + n * 86400e3).toISOString().slice(0, 10)
const berkasSinggah = () => (existsSync(PRIVAT) ? readdirSync(PRIVAT).filter((f) => /^toko-sync-.*\.ndjson$/.test(f)).sort() : [])

// Titik pangkas. Segala medan yang tidak disebut di sini tidak pernah menyentuh disk.
// Untai wilayah dipakai sekali di sini lalu dilepas bersama sisa muatannya.
function pangkas (p, cap) {
  const w = resolusi(p)
  return {
    place_id: p.placeId,
    lat: typeof p.lat === 'number' ? p.lat : null,
    lng: typeof p.lng === 'number' ? p.lng : null,
    wilayah: w.distrik?.id ?? w.induk?.id ?? null,
    induk: w.induk?.id ?? null,
    status: p.status ?? null,
    ...cap,
  }
}

async function ambilHalaman (kota, offset, apiKey) {
  const url = `${BASE}/v1/places?city=${encodeURIComponent(kota)}&status=all&limit=${HALAMAN}&offset=${offset}`
  const res = await fetch(url, { headers: { 'x-api-key': apiKey } })
  if (res.status === 401) throw new Error('API key ditolak (401). Set TOKO_SYNC_API_KEY atau isi ~/.config/toko-sync-key.')
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`)
  return res.json()
}

// Layanannya memulangkan `total` dan plafon `limit`-nya 500. Sekali satu kota melewati
// 500 toko, sekali tarik diam-diam terpotong — karena itu offset dijalankan sampai
// terkumpul `total`, bukan sampai satu halaman penuh.
async function tarikKota (kota, apiKey) {
  const semua = []; let total = null
  do {
    const j = await ambilHalaman(kota, semua.length, apiKey)
    total ??= j.total
    if (!j.places?.length) break
    semua.push(...j.places)
  } while (semua.length < total)
  if (total != null && semua.length !== total) {
    console.warn(`  PERINGATAN ${kota}: terkumpul ${semua.length} dari ${total} yang dijanjikan`)
  }
  return semua
}

// Sidecar cuma place_id — §A.3, satu-satunya medan yang boleh disimpan tanpa batas waktu.
//
// Ia MENUMPUK, bukan mencerminkan singgahan. Bedanya penting: kalau sidecar disusun
// ulang dari singgahan, maka `--sapu` yang membuang lat/lng kedaluwarsa akan ikut
// menghapus daftar id-nya — membuang satu-satunya hal yang justru boleh kita pegang,
// dan memutus jangkar identitas yang dipakai mencocokkan klaim pemilik toko nanti.
// Yang wajib hilang di hari ke-30 hanya koordinatnya.
//
// `pertama_terlihat` dipertahankan supaya diff-nya bermakna; `terakhir_terlihat` adalah
// catatan pengamatan kita sendiri, bukan konten Google, dan itu yang dipakai menuakan
// baris yang sudah lama tidak muncul lagi.
function susunSidecar () {
  const baris = new Map()
  if (existsSync(SIDECAR)) {
    for (const l of readFileSync(SIDECAR, 'utf8').split('\n')) {
      if (!l.trim()) continue
      const r = JSON.parse(l); baris.set(r.place_id, r)
    }
  }
  for (const nama of berkasSinggah()) {
    for (const l of readFileSync(join(PRIVAT, nama), 'utf8').split('\n')) {
      if (!l.trim()) continue
      const r = JSON.parse(l)
      if (!r.place_id) continue
      baris.set(r.place_id, {
        place_id: r.place_id,
        asal: ASAL,
        pertama_terlihat: baris.get(r.place_id)?.pertama_terlihat ?? hariIni(),
        terakhir_terlihat: hariIni(),
      })
    }
  }
  const isi = [...baris.values()]
    .sort((a, b) => (a.place_id < b.place_id ? -1 : a.place_id > b.place_id ? 1 : 0))
    .map((r) => JSON.stringify(r)).join('\n')
  writeFileSync(SIDECAR, baris.size ? isi + '\n' : '')
  return baris.size
}

// ------------------------------------------------------- mode periksa & sapu
function umurSinggah (nama) {
  const baris = readFileSync(join(PRIVAT, nama), 'utf8').split('\n').filter((l) => l.trim())
  const cap = baris.length ? JSON.parse(baris[0]).kedaluwarsa : null
  const sisa = cap ? Math.round((Date.parse(cap) - Date.now()) / 86400e3) : null
  return { baris: baris.length, cap, sisa, lewat: sisa == null || sisa < 0 }
}

function periksa (sapu) {
  const berkas = berkasSinggah()
  if (!berkas.length) { console.log('belum ada singgahan privat.'); process.exit(0) }
  let lewat = 0
  for (const nama of berkas) {
    const u = umurSinggah(nama)
    if (u.lewat) {
      lewat++
      if (sapu) { unlinkSync(join(PRIVAT, nama)); console.log(`  ${nama.padEnd(32)} DIHAPUS — lewat batas ${HARI_SINGGAH} hari`); continue }
    }
    console.log(`  ${nama.padEnd(32)} ${String(u.baris).padStart(4)} baris  ${u.cap ? `kedaluwarsa ${u.cap}, sisa ${u.sisa} hari` : 'TANPA CAP — tarik ulang'}`)
  }
  if (sapu) {
    // Sidecar sengaja TIDAK disentuh: yang kedaluwarsa cuma lat/lng, sedangkan place_id
    // boleh tetap tinggal (§A.3). Menyusunnya ulang di sini justru akan mengosongkannya.
    console.log(`\n${lewat} singgahan dihapus (lat/lng hilang). place-id.ndjson tidak disentuh — §A.3.`)
    process.exit(0)
  }
  console.log(lewat ? `\n${lewat} singgahan lewat batas. Jalankan --sapu untuk menghapusnya.` : `\nsemua di dalam batas ${HARI_SINGGAH} hari.`)
  process.exit(lewat ? 1 : 0)
}

// ---------------------------------------------------------------------------- main
const arg = process.argv.slice(2)
if (arg.includes('--periksa') || arg.includes('--sapu')) periksa(arg.includes('--sapu'))

const diminta = arg.filter((a) => !a.startsWith('--'))
const kotaList = diminta.length ? diminta : ['bandung']
const apiKey = kunci()
if (!apiKey) {
  console.error('API key tidak ditemukan. Set TOKO_SYNC_API_KEY atau isi ~/.config/toko-sync-key.')
  process.exit(1)
}

mkdirSync(PRIVAT, { recursive: true })
const cap = { ditarik: new Date().toISOString(), kedaluwarsa: tambahHari(hariIni(), HARI_SINGGAH) }
const vonis = { tepat: 0, perkiraan: 0, ambigu: 0, nihil: 0 }

for (const kota of kotaList) {
  const tempat = await tarikKota(kota, apiKey)
  if (!tempat.length) { console.warn(`${kota}: 0 tempat — slug tidak dikenal? layanannya menjawab 200 kosong, bukan 404.`); continue }
  const ramping = tempat.map((p) => { vonis[resolusi(p).vonis]++; return pangkas(p, cap) })
  writeFileSync(join(PRIVAT, `toko-sync-${kota}.ndjson`), ramping.map((r) => JSON.stringify(r)).join('\n') + '\n')
  const aktif = ramping.filter((r) => r.status === 'active').length
  // Dilaporkan sebagai nama medan, bukan cacahnya — supaya kalau layanannya suatu saat
  // menambah medan baru, yang dibuang terbaca di log dan bukan lolos diam-diam.
  const DIPAKAI = new Set(['placeId', 'lat', 'lng', 'status'])   // `placeId` ganti nama jadi `place_id`
  const dibuang = Object.keys(tempat[0]).filter((k) => !DIPAKAI.has(k))
  console.log(`${kota}: ${ramping.length} tempat (${aktif} aktif) -> privat/toko-sync-${kota}.ndjson  [kedaluwarsa ${cap.kedaluwarsa}]`)
  console.log(`  dibuang di titik masuk: ${dibuang.join(', ')}`)
}

console.log(
  `\nsidecar -> place-id.ndjson: ${susunSidecar()} place_id (hanya id — §A.3)\n` +
  `  wilayah tersimpan di singgahan 30 hari: ${vonis.tepat} tepat, ${vonis.perkiraan} perkiraan, ${vonis.ambigu} ambigu, ${vonis.nihil} nihil`,
)
