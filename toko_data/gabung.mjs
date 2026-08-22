#!/usr/bin/env node
// Menggabungkan berkas NDJSON per sumber di toko_data/raw/ menjadi satu daftar
// toko tani se-Jawa: nama + koordinat, tanpa duplikat.
//
// Pakai:  node toko_data/gabung.mjs
// Hasil:  toko_data/toko-tani-jawa.ndjson         (yang bertitik, tanpa duplikat)
//         toko_data/toko-tani-jawa.csv
//         toko_data/toko-tani-jawa-tanpa-titik.ndjson  (nama + alamat, titik belum ada)
//         toko_data/laporan-gabung.md

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = dirname(fileURLToPath(import.meta.url))
const RAW = join(DIR, 'raw')

// Kotak pembatas Pulau Jawa + Madura. Titik di luar ini pasti salah tempat.
const JAWA = { latMin: -8.90, latMax: -5.80, lonMin: 104.90, lonMax: 114.80 }

// Urutan ini menentukan catatan mana yang bertahan saat dua sumber bertabrakan.
// Yang lisensinya jelas terbuka didahulukan supaya hasil akhir aman diterbitkan ulang.
const PRIORITAS = ['opendata', 'osm', 'pupuk-indonesia', 'tti', 'direktori', 'lain']

function peringkat (sumber = '') {
  const i = PRIORITAS.findIndex((p) => sumber.toLowerCase().startsWith(p))
  return i === -1 ? PRIORITAS.length : i
}

// Nama toko ditulis semaunya: "UD. Tani Makmur", "Ud Tani Makmur", "TOKO TANI MAKMUR".
// Untuk membandingkan, buang gelar badan usaha dan segala yang bukan huruf/angka.
const GELAR = /^(toko|tk|ud|cv|pt|pd|kios|depo|depot|agro|koperasi|kop|gapoktan|poktan)\b\.?\s*/gi

function normalkan (nama) {
  let s = String(nama).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  let sebelum
  do { sebelum = s; s = s.replace(GELAR, '') } while (s !== sebelum)   // "ud. toko tani" → "tani"
  return s.replace(/[^a-z0-9]+/g, ' ').trim()
}

const buang = { takLengkap: 0, luarJawa: 0, namaKosong: 0, kembar: 0 }
const masuk = []

const berkas = existsSync(RAW)
  ? readdirSync(RAW).filter((f) => f.endsWith('.ndjson') && !f.includes('tanpa-koordinat'))
  : []

for (const f of berkas) {
  for (const baris of readFileSync(join(RAW, f), 'utf8').split('\n')) {
    if (!baris.trim()) continue
    let r
    try { r = JSON.parse(baris) } catch { buang.takLengkap++; continue }

    const nama = String(r.nama ?? r.name ?? '').trim()
    const lat = Number(r.lat)
    const lon = Number(r.lon ?? r.lng)

    if (!nama) { buang.namaKosong++; continue }
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) { buang.takLengkap++; continue }
    if (lat < JAWA.latMin || lat > JAWA.latMax || lon < JAWA.lonMin || lon > JAWA.lonMax) {
      buang.luarJawa++; continue
    }
    masuk.push({ ...r, nama, lat, lon, sumber: r.sumber ?? f.replace(/\.ndjson$/, '') })
  }
}

// Dua catatan dianggap toko yang sama bila namanya sama setelah dinormalkan DAN
// jaraknya dekat. Koordinat dibulatkan ke 3 desimal (~110 m) sebagai kunci petak;
// petak tetangga ikut diperiksa supaya toko yang jatuh persis di batas petak
// tidak lolos jadi duplikat.
const petak = new Map()
const hasil = []

const kunci = (nama, la, lo) => `${nama}|${la}|${lo}`

for (const r of masuk.sort((a, b) => peringkat(a.sumber) - peringkat(b.sumber))) {
  const n = normalkan(r.nama)
  if (!n) { buang.namaKosong++; continue }
  const la = Math.round(r.lat * 1000)
  const lo = Math.round(r.lon * 1000)

  let kembar = null
  for (let dla = -1; dla <= 1 && !kembar; dla++) {
    for (let dlo = -1; dlo <= 1 && !kembar; dlo++) {
      kembar = petak.get(kunci(n, la + dla, lo + dlo)) ?? null
    }
  }

  if (kembar) {
    buang.kembar++
    if (!kembar.sumber_lain) kembar.sumber_lain = []
    if (r.sumber !== kembar.sumber && !kembar.sumber_lain.includes(r.sumber)) {
      kembar.sumber_lain.push(r.sumber)
    }
    continue
  }

  petak.set(kunci(n, la, lo), r)
  hasil.push(r)
}

hasil.sort((a, b) => a.nama.localeCompare(b.nama, 'id'))

// Bidang yang ikut keluar sengaja lebih dari nama+titik. Dua sebab:
//   - Yang menampilkan toko butuh alamat dan telepon, bukan cuma pin.
//   - `lisensi` HARUS ikut. Sumbernya bercampur: `opendata-*` CC-BY dan bebas
//     disebarkan ulang, sedangkan registri principal seperti `syngenta` hak cipta
//     pemiliknya. Menjatuhkan kolom itu di sini akan membuat keduanya tampak sama
//     di hilir, dan atribusinya hilang justru di berkas yang paling mungkin dipakai.
// Bidang yang kosong dibuang supaya baris tidak melar oleh null.
const BIDANG = ['nama', 'lat', 'lon', 'sumber', 'provinsi', 'kabupaten', 'alamat', 'telepon', 'lisensi']

const ramping = (r) => {
  const o = {}
  for (const k of BIDANG) {
    const v = r[k]
    if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue
    o[k] = v
  }
  if (r.sumber_lain?.length) o.sumber_lain = r.sumber_lain
  return o
}

const ndjson = hasil.map((r) => JSON.stringify(ramping(r))).join('\n')
writeFileSync(join(DIR, 'toko-tani-jawa.ndjson'), ndjson + '\n')

const kutip = (s) => `"${String(s).replace(/"/g, '""')}"`
const sel = (v) => Array.isArray(v) ? kutip(v.join('; ')) : (v == null ? '' : kutip(v))
writeFileSync(
  join(DIR, 'toko-tani-jawa.csv'),
  BIDANG.join(',') + '\n' +
    hasil.map((r) => BIDANG.map((k) => (k === 'lat' || k === 'lon') ? r[k] : sel(r[k])).join(',')).join('\n') + '\n'
)

const perSumber = {}
for (const r of hasil) perSumber[r.sumber] = (perSumber[r.sumber] ?? 0) + 1
const perProvinsi = {}
for (const r of hasil) perProvinsi[r.provinsi ?? '(tak diketahui)'] = (perProvinsi[r.provinsi ?? '(tak diketahui)'] ?? 0) + 1

// --- toko tanpa titik -------------------------------------------------------
// Berkas `*-tanpa-koordinat.ndjson` sebelumnya tidak pernah dibaca siapa pun, jadi
// 67 kios Batang (CC-BY) dan ratusan kios registri principal yang alamat dan
// teleponnya lengkap hilang begitu saja hanya karena tidak punya pin. Padahal justru
// merekalah yang paling masuk akal diminta "klaim toko Anda": datanya sudah ada,
// yang kurang cuma titik dan kontak yang hanya pemiliknya tahu.
//
// Tanpa koordinat, kunci duplikatnya nama + kabupaten — bukan petak seperti di atas.
const tanpaTitik = []
const kunciTanpa = new Set()
const berkasTanpa = existsSync(RAW)
  ? readdirSync(RAW).filter((f) => f.endsWith('.ndjson') && f.includes('tanpa-koordinat'))
  : []

for (const f of berkasTanpa) {
  for (const baris of readFileSync(join(RAW, f), 'utf8').split('\n')) {
    if (!baris.trim()) continue
    let r
    try { r = JSON.parse(baris) } catch { continue }
    const nama = String(r.nama ?? r.name ?? '').trim()
    if (!nama) continue
    const n = normalkan(nama)
    if (!n) continue
    const k = `${n}|${normalkan(r.kabupaten ?? '')}`
    if (kunciTanpa.has(k)) continue
    kunciTanpa.add(k)
    tanpaTitik.push({ ...r, nama, sumber: r.sumber ?? f.replace(/\.ndjson$/, '') })
  }
}
tanpaTitik.sort((a, b) => a.nama.localeCompare(b.nama, 'id'))

// `ragu` ikut supaya jelas bedanya "tidak punya koordinat sama sekali" dengan
// "punya koordinat tapi tidak dipercaya" — yang kedua tetap perlu pin baru.
writeFileSync(
  join(DIR, 'toko-tani-jawa-tanpa-titik.ndjson'),
  tanpaTitik.map((r) => JSON.stringify({ ...ramping(r), ragu: r.ragu ?? null })).join('\n') + (tanpaTitik.length ? '\n' : '')
)

const tabel = (o) =>
  Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`).join('\n')

writeFileSync(join(DIR, 'laporan-gabung.md'), `# Laporan penggabungan

Berkas sumber: ${berkas.length ? berkas.join(', ') : '(belum ada)'}

- Baris terbaca: **${masuk.length + buang.takLengkap + buang.namaKosong + buang.luarJawa}**
- Lolos saringan: **${masuk.length}**
- Hasil akhir setelah dedup: **${hasil.length}**
- Tanpa titik, alamat lengkap → \`toko-tani-jawa-tanpa-titik.ndjson\`: **${tanpaTitik.length}**

## Yang dibuang
| Sebab | Jumlah |
|---|---|
| Tanpa koordinat / JSON rusak | ${buang.takLengkap} |
| Koordinat di luar Pulau Jawa | ${buang.luarJawa} |
| Nama kosong setelah dinormalkan | ${buang.namaKosong} |
| Duplikat (nama sama, jarak < ~110 m) | ${buang.kembar} |

## Per sumber
| Sumber | Jumlah |
|---|---|
${tabel(perSumber) || '| — | 0 |'}

## Per provinsi
| Provinsi | Jumlah |
|---|---|
${tabel(perProvinsi) || '| — | 0 |'}

## Tanpa titik, menunggu diklaim
Nama, alamat, dan telepon lengkap; yang belum ada cuma koordinat tepercaya.

| Sumber | Jumlah |
|---|---|
${tabel(tanpaTitik.reduce((o, r) => ({ ...o, [r.sumber]: (o[r.sumber] ?? 0) + 1 }), {})) || '| — | 0 |'}
`)

console.log(`terbaca ${masuk.length} → ${hasil.length} unik (${buang.kembar} duplikat dibuang)`)
console.log(`tanpa titik: ${tanpaTitik.length} toko beralamat lengkap, menunggu diklaim`)
console.log(`buang: ${buang.takLengkap} tanpa koordinat, ${buang.luarJawa} luar Jawa, ${buang.namaKosong} nama kosong`)
