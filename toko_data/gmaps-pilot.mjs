#!/usr/bin/env node
// Pilot Places API (New) untuk toko tani.
//
// Google di sini BUKAN sumber koordinat. ToS Maps Platform hanya mengizinkan
// place ID disimpan permanen; nama, alamat, dan koordinat dibatasi ~30 hari dan
// tidak boleh diterbitkan ulang. Maka:
//   - respons utuh  -> toko_data/privat/   (di-gitignore, tidak pernah terbit)
//   - yang boleh naik ke repo hanya pemetaan {nama lokal -> place_id}
// Kartu peta di halaman profil toko dirender live dari place_id lewat Embed API,
// jadi koordinat Google tidak perlu disimpan sama sekali.
//
// Dua mode:
//   node toko_data/gmaps-pilot.mjs temukan  <kabupaten>   -- sapu grid, cari toko yang belum terdata
//   node toko_data/gmaps-pilot.mjs cocokkan <kabupaten>   -- cari place_id untuk toko yang sudah terdata
//
// Keduanya SIMULASI dulu. Tambahkan --jalan untuk benar-benar memanggil API.

import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const DIR = dirname(fileURLToPath(import.meta.url))
const PRIVAT = join(DIR, 'privat')

// Tiga kabupaten dengan watak berbeda: peri-urban padat, sentra bawang pedesaan,
// dan campuran dataran tinggi. Cukup untuk menduga sebaran se-Jawa.
const KABUPATEN = {
  bandung:  { nama: 'Kab. Bandung',  prov: 'Jawa Barat',  bbox: [-7.32, 107.30, -6.85, 107.98] },
  brebes:   { nama: 'Kab. Brebes',   prov: 'Jawa Tengah', bbox: [-7.55, 108.65, -6.75, 109.20] },
  malang:   { nama: 'Kab. Malang',   prov: 'Jawa Timur',  bbox: [-8.45, 112.30, -7.85, 113.15] }
}

const KATA_KUNCI = ['toko pertanian', 'kios pupuk', 'toko saprotan', 'toko benih dan pupuk']

const SEL_DERAJAT = 0.08          // ~9 km. Diperkecil kalau satu sel mentok 60 hasil.
// SKU ditentukan oleh X-Goog-FieldMask, bukan oleh endpoint.
// Field mask di bawah (id + displayName + formattedAddress + location + types)
// jatuh ke tingkat "Text Search Pro". Meminta hanya places.id akan turun ke
// "Essentials IDs Only" yang jauh lebih murah — tapi lalu tidak ada nama dan
// koordinat untuk memverifikasi kecocokan, dan nama toko tani terlalu generik
// untuk dipercaya buta. Verifikasi sengaja dipertahankan.
const TARIF_PER_1000 = 32         // USD, harga daftar Text Search Pro
const JATAH_GRATIS = 5000         // panggilan/bulan tingkat Pro. VERIFIKASI di console — Google mengubah ini Maret 2025.
const JEDA_MS = 250

function kunci () {
  if (process.env.GOOGLE_MAPS_API_KEY) return process.env.GOOGLE_MAPS_API_KEY.trim()
  const berkas = join(homedir(), '.config', 'gmaps-key')
  if (existsSync(berkas)) return readFileSync(berkas, 'utf8').trim()
  return null
}

const tidur = (ms) => new Promise((r) => setTimeout(r, ms))

// Harga daftar menyesatkan kalau jatah gratis bulanan belum terpakai.
// Tampilkan keduanya supaya keputusannya diambil atas angka yang benar.
function lapor (permintaan, catatan = '') {
  const daftar = (permintaan * TARIF_PER_1000) / 1000
  console.log(`harga daftar   : ~$${daftar.toFixed(2)}${catatan ? '  (' + catatan + ')' : ''}`)
  if (permintaan <= JATAH_GRATIS) {
    console.log(`biaya sebenarnya: $0.00 — masuk jatah gratis ${JATAH_GRATIS}/bulan, ASALKAN belum terpakai bulan ini`)
  } else {
    const lebih = permintaan - JATAH_GRATIS
    console.log(`biaya sebenarnya: ~$${((lebih * TARIF_PER_1000) / 1000).toFixed(2)} — ${lebih} panggilan di atas jatah gratis`)
  }
}

function grid ([latMin, lonMin, latMax, lonMax]) {
  const sel = []
  for (let la = latMin; la < latMax; la += SEL_DERAJAT) {
    for (let lo = lonMin; lo < lonMax; lo += SEL_DERAJAT) {
      sel.push({
        low:  { latitude: la, longitude: lo },
        high: { latitude: Math.min(la + SEL_DERAJAT, latMax), longitude: Math.min(lo + SEL_DERAJAT, lonMax) }
      })
    }
  }
  return sel
}

// Jarak dua titik di bumi, meter. Dipakai untuk menolak kecocokan yang terlalu jauh.
function jarak (a, b) {
  const R = 6371000, rad = (d) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const GELAR = /^(toko|tk|ud|cv|pt|pd|kios|depo|depot|agro)\b\.?\s*/gi
function token (s) {
  let t = String(s).toLowerCase()
  let sebelum
  do { sebelum = t; t = t.replace(GELAR, '') } while (t !== sebelum)
  return new Set(t.replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean))
}
// Dice: 2|irisan| / (|a|+|b|). "Tani Makmur" vs "UD Tani Makmur Jaya" -> 0.8
function mirip (a, b) {
  const A = token(a), B = token(b)
  if (!A.size || !B.size) return 0
  let irisan = 0
  for (const x of A) if (B.has(x)) irisan++
  return (2 * irisan) / (A.size + B.size)
}

async function cariTeks (badan, apiKey) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,nextPageToken'
    },
    body: JSON.stringify({ languageCode: 'id', regionCode: 'ID', ...badan })
  })
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`)
  return res.json()
}

// ---------------------------------------------------------------- mode temukan
async function temukan (kab, apiKey, jalan) {
  const sel = grid(kab.bbox)
  const perkiraan = sel.length * KATA_KUNCI.length
  console.log(`${kab.nama}: ${sel.length} sel x ${KATA_KUNCI.length} kata kunci = ${perkiraan} permintaan minimum`)
  lapor(perkiraan, 'bisa naik ~3x kalau banyak sel berpaginasi penuh')
  if (!jalan) return console.log('\nsimulasi saja. tambahkan --jalan untuk benar-benar memanggil API.')

  mkdirSync(PRIVAT, { recursive: true })
  const keluar = join(PRIVAT, `gmaps-temuan-${kab.nama.replace(/\W+/g, '-').toLowerCase()}.ndjson`)
  writeFileSync(keluar, '')
  const terlihat = new Set()
  let permintaan = 0, mentok = 0

  for (const kotak of sel) {
    for (const kata of KATA_KUNCI) {
      let token = null, halaman = 0
      do {
        try {
          const j = await cariTeks(
            { textQuery: kata, locationRestriction: { rectangle: kotak }, pageSize: 20, ...(token ? { pageToken: token } : {}) },
            apiKey
          )
          permintaan++; halaman++
          for (const p of j.places ?? []) {
            if (terlihat.has(p.id)) continue
            terlihat.add(p.id)
            appendFileSync(keluar, JSON.stringify({
              place_id: p.id,
              nama: p.displayName?.text ?? '',
              alamat: p.formattedAddress ?? '',
              lat: p.location?.latitude, lon: p.location?.longitude,
              jenis: p.types ?? [], kata_kunci: kata, kabupaten: kab.nama
            }) + '\n')
          }
          token = j.nextPageToken ?? null
        } catch (e) { console.error(`  gagal [${kata}]: ${e.message}`); token = null }
        await tidur(JEDA_MS)
      } while (token && halaman < 3)
      if (halaman >= 3) mentok++   // sel penuh: kemungkinan ada yang terpotong
    }
    process.stdout.write(`\r  ${permintaan} permintaan, ${terlihat.size} tempat unik`)
  }
  console.log(`\nselesai. ${terlihat.size} tempat -> ${keluar}`)
  if (mentok) console.log(`PERINGATAN: ${mentok} sel mentok di 60 hasil — perkecil SEL_DERAJAT, ada yang terlewat.`)
}

// --------------------------------------------------------------- mode cocokkan
async function cocokkan (kab, apiKey, jalan) {
  const sumber = join(DIR, 'toko-tani-jawa.ndjson')
  if (!existsSync(sumber)) return console.error(`butuh ${sumber} dulu — jalankan gabung.mjs setelah agen selesai.`)

  const [latMin, lonMin, latMax, lonMax] = kab.bbox
  const baris = readFileSync(sumber, 'utf8').split('\n').filter(Boolean).map(JSON.parse)
    .filter((r) => r.lat >= latMin && r.lat <= latMax && r.lon >= lonMin && r.lon <= lonMax)

  console.log(`${kab.nama}: ${baris.length} toko terdata, 1 permintaan masing-masing`)
  lapor(baris.length)
  if (!jalan) return console.log('\nsimulasi saja. tambahkan --jalan untuk benar-benar memanggil API.')

  mkdirSync(PRIVAT, { recursive: true })
  const jejak = join(PRIVAT, `gmaps-cocok-${kab.nama.replace(/\W+/g, '-').toLowerCase()}.ndjson`)
  const sidecar = join(DIR, 'place-id.ndjson')
  writeFileSync(jejak, '')
  let cocok = 0, ragu = 0, nihil = 0

  for (const t of baris) {
    try {
      const j = await cariTeks({
        textQuery: t.nama,
        locationBias: { circle: { center: { latitude: t.lat, longitude: t.lon }, radius: 2000 } },
        pageSize: 5
      }, apiKey)

      const calon = (j.places ?? []).map((p) => ({
        place_id: p.id,
        nama: p.displayName?.text ?? '',
        m: jarak(t, { lat: p.location?.latitude, lon: p.location?.longitude }),
        skor: mirip(t.nama, p.displayName?.text ?? '')
      })).sort((a, b) => b.skor - a.skor || a.m - b.m)

      const t0 = calon[0]
      // Ambang sengaja ketat: nama mirip DAN dalam 300 m. Toko tani banyak yang
      // namanya generik ("Toko Tani Jaya"), gampang salah tempel ke toko lain.
      const vonis = !t0 ? 'nihil' : (t0.skor >= 0.6 && t0.m <= 300) ? 'cocok'
                  : (t0.skor >= 0.4 || t0.m <= 150) ? 'ragu' : 'nihil'

      appendFileSync(jejak, JSON.stringify({ toko: t.nama, lat: t.lat, lon: t.lon, vonis, calon }) + '\n')
      if (vonis === 'cocok') { cocok++; appendFileSync(sidecar, JSON.stringify({ nama: t.nama, lat: t.lat, lon: t.lon, place_id: t0.place_id }) + '\n') }
      else if (vonis === 'ragu') ragu++
      else nihil++
    } catch (e) { console.error(`  gagal [${t.nama}]: ${e.message}`); nihil++ }
    await tidur(JEDA_MS)
    process.stdout.write(`\r  cocok ${cocok} / ragu ${ragu} / nihil ${nihil}`)
  }
  console.log(`\nselesai. sidecar -> ${sidecar}, jejak lengkap -> ${jejak}`)
}

// ------------------------------------------------------------------------ main
const [mode, namaKab] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const jalan = process.argv.includes('--jalan')
const kab = KABUPATEN[namaKab]

if (!kab || !['temukan', 'cocokkan'].includes(mode)) {
  console.error(`pakai: node toko_data/gmaps-pilot.mjs <temukan|cocokkan> <${Object.keys(KABUPATEN).join('|')}> [--jalan]`)
  process.exit(1)
}
const apiKey = kunci()
if (jalan && !apiKey) {
  console.error('API key tidak ditemukan. set GOOGLE_MAPS_API_KEY atau isi ~/.config/gmaps-key')
  process.exit(1)
}
await (mode === 'temukan' ? temukan(kab, apiKey, jalan) : cocokkan(kab, apiKey, jalan))
