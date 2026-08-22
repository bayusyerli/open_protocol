#!/usr/bin/env node
// Menggabungkan berkas NDJSON per sumber di toko_data/raw/ menjadi satu daftar
// toko tani se-Jawa: nama + koordinat, tanpa duplikat.
//
// Pakai:  node toko_data/gabung.mjs
// Hasil:  toko_data/toko-tani-jawa.ndjson   (nama, lat, lon, sumber)
//         toko_data/toko-tani-jawa.csv
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

const ndjson = hasil
  .map((r) => JSON.stringify({ nama: r.nama, lat: r.lat, lon: r.lon, sumber: r.sumber }))
  .join('\n')
writeFileSync(join(DIR, 'toko-tani-jawa.ndjson'), ndjson + '\n')

const kutip = (s) => `"${String(s).replace(/"/g, '""')}"`
writeFileSync(
  join(DIR, 'toko-tani-jawa.csv'),
  'nama,lat,lon,sumber\n' +
    hasil.map((r) => [kutip(r.nama), r.lat, r.lon, kutip(r.sumber)].join(',')).join('\n') + '\n'
)

const perSumber = {}
for (const r of hasil) perSumber[r.sumber] = (perSumber[r.sumber] ?? 0) + 1
const perProvinsi = {}
for (const r of hasil) perProvinsi[r.provinsi ?? '(tak diketahui)'] = (perProvinsi[r.provinsi ?? '(tak diketahui)'] ?? 0) + 1

const tabel = (o) =>
  Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`).join('\n')

writeFileSync(join(DIR, 'laporan-gabung.md'), `# Laporan penggabungan

Berkas sumber: ${berkas.length ? berkas.join(', ') : '(belum ada)'}

- Baris terbaca: **${masuk.length + buang.takLengkap + buang.namaKosong + buang.luarJawa}**
- Lolos saringan: **${masuk.length}**
- Hasil akhir setelah dedup: **${hasil.length}**

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
`)

console.log(`terbaca ${masuk.length} → ${hasil.length} unik (${buang.kembar} duplikat dibuang)`)
console.log(`buang: ${buang.takLengkap} tanpa koordinat, ${buang.luarJawa} luar Jawa, ${buang.namaKosong} nama kosong`)
