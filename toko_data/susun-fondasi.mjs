#!/usr/bin/env node
// Menyusun berkas mentah per-sumber di toko_data/raw/ menjadi tiga lapis terpisah
// menurut LISENSI, bukan menurut isi. Ini inti keputusannya: data koordinat yang
// bersih lisensinya boleh terbit; data principal (Syngenta dkk) hanya jadi benih
// privat untuk mengundang pemilik toko mengklaim — tidak pernah ikut terbit.
//
//   pakai:  node toko_data/susun-fondasi.mjs
//
// Keluaran:
//   toko-tani-jawa.ndjson / .csv          -> TERBIT: nama+koordinat, lisensi terbuka (OSM)
//   privat/benih-principal.ndjson         -> PRIVAT (gitignore): koordinat principal
//   privat/benih-principal-alamat.ndjson  -> PRIVAT: principal tanpa koordinat
//   benih-alamat.ndjson                   -> BENIH TERBUKA: nama+alamat tanpa koordinat (Batang CC-BY, TTI)
//   LAPIS.md                              -> penjelasan lapis + hitungan + lisensi

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = dirname(fileURLToPath(import.meta.url))
const RAW = join(DIR, 'raw')
const PRIVAT = join(DIR, 'privat')
const JAWA = { latMin: -8.90, latMax: -5.80, lonMin: 104.90, lonMax: 114.80 }

// --- normalisasi & dedup (sama dengan gabung.mjs) ------------------------------
const GELAR = /^(toko|tk|ud|cv|pt|pd|kios|depo|depot|agro|koperasi|kop|gapoktan|poktan)\b\.?\s*/gi
function normalkan (nama) {
  let s = String(nama).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  let b; do { b = s; s = s.replace(GELAR, '') } while (s !== b)
  return s.replace(/[^a-z0-9]+/g, ' ').trim()
}
function dedup (baris) {
  const petak = new Map(); const keluar = []; let kembar = 0
  const K = (n, a, o) => `${n}|${a}|${o}`
  for (const r of baris) {
    const n = normalkan(r.nama); if (!n) continue
    const a = Math.round(r.lat * 1000); const o = Math.round(r.lon * 1000)
    let ada = null
    for (let da = -1; da <= 1 && !ada; da++) for (let db = -1; db <= 1 && !ada; db++) ada = petak.get(K(n, a + da, o + db)) ?? null
    if (ada) { kembar++; continue }
    petak.set(K(n, a, o), r); keluar.push(r)
  }
  return { keluar, kembar }
}

// --- daftar-IZIN berkas masukan -------------------------------------------------
// Batas lisensi = default-tolak. Hanya berkas kurasi yang asal & lisensinya kita
// tahu persis yang dikonsumsi. Dump mentah, intermediate, dan berkas sesi paralel
// diabaikan total — sekali kebobolan, data proprieter ikut terbit.
const MASUKAN = [
  // file                                    | pemilah lapis per-baris
  { file: 'osm.ndjson',                        lapis: () => 'terbuka' },                 // OSM/ODbL
  { file: 'direktori-lain.ndjson',             lapis: () => 'privat' },                  // principal, semua berkoordinat
  { file: 'direktori-lain-tanpa-koordinat.ndjson',
      lapis: (r) => /syngenta|petro|bayer|corteva|basf|east.?west|bisi|nufarm|agricon|royal|dupont|tanindo/i.test(r.sumber ?? '') ? 'privat' : 'benih-gov' },
  { file: 'opendata-tanpa-koordinat.ndjson',   lapis: () => 'benih-terbuka' },           // Batang, CC-BY
]

const ember = { terbuka: [], privat: [], 'benih-privat-alamat': [], 'benih-terbuka': [], 'benih-gov': [] }
const buang = { luarJawa: 0 }

for (const { file, lapis } of MASUKAN) {
  const jalur = join(RAW, file)
  if (!existsSync(jalur)) continue
  for (const baris of readFileSync(jalur, 'utf8').split('\n')) {
    if (!baris.trim()) continue
    let r; try { r = JSON.parse(baris) } catch { continue }
    const nama = String(r.nama ?? r.name ?? '').trim()
    if (!nama) continue
    r.nama = nama
    const lat = Number(r.lat); const lon = Number(r.lon ?? r.lng)
    const punyaKoord = Number.isFinite(lat) && Number.isFinite(lon)
    const jenis = lapis(r)

    if (punyaKoord) {
      r.lat = lat; r.lon = lon
      if (lat < JAWA.latMin || lat > JAWA.latMax || lon < JAWA.lonMin || lon > JAWA.lonMax) { buang.luarJawa++; continue }
      ember[jenis === 'privat' ? 'privat' : 'terbuka'].push(r)
    } else {
      if (jenis === 'privat') ember['benih-privat-alamat'].push(r)
      else if (jenis === 'benih-gov') ember['benih-gov'].push(r)
      else ember['benih-terbuka'].push(r)
    }
  }
}

// --- dedup tiap lapis & tulis ---------------------------------------------------
mkdirSync(PRIVAT, { recursive: true })
const terbuka = dedup(ember.terbuka)
const privat = dedup(ember.privat)

const ndj = (arr, ...k) => arr.map((r) => JSON.stringify(Object.fromEntries(k.map((x) => [x, r[x]])))).join('\n') + '\n'

writeFileSync(join(DIR, 'toko-tani-jawa.ndjson'), ndj(terbuka.keluar, 'nama', 'lat', 'lon', 'sumber'))
const kutip = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`
writeFileSync(join(DIR, 'toko-tani-jawa.csv'),
  'nama,lat,lon,sumber\n' + terbuka.keluar.map((r) => [kutip(r.nama), r.lat, r.lon, kutip(r.sumber)].join(',')).join('\n') + '\n')

writeFileSync(join(PRIVAT, 'benih-principal.ndjson'), ndj(privat.keluar, 'nama', 'lat', 'lon', 'sumber', 'provinsi'))
writeFileSync(join(PRIVAT, 'benih-principal-alamat.ndjson'), ndj(ember['benih-privat-alamat'], 'nama', 'alamat', 'sumber', 'provinsi'))
writeFileSync(join(DIR, 'benih-alamat.ndjson'),
  ndj([...ember['benih-terbuka'], ...ember['benih-gov']], 'nama', 'alamat', 'sumber', 'lisensi'))

// --- laporan --------------------------------------------------------------------
const prov = (arr) => { const o = {}; for (const r of arr) o[r.provinsi ?? '?'] = (o[r.provinsi ?? '?'] ?? 0) + 1; return Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ') }

// Lapis 4 tidak disusun di sini — ia ditarik `tarik-toko-sync.mjs` dan sudah berbentuk
// sidecar saat sampai. Yang dikerjakan di sini hanya membacanya supaya LAPIS.md tetap
// jadi satu-satunya peta semua lapis, bukan tiga dari empat.
// Sengaja TIDAK memecah per kabupaten. Wilayah tiap place_id hanya hidup di singgahan
// 30 hari (lihat tarik-toko-sync.mjs); membekukan sebarannya ke LAPIS.md yang ikut
// commit sama saja memindahkan turunan itu jadi permanen lewat pintu belakang.
// Yang dilaporkan cuma cacah dan tanggal — keduanya milik kita, bukan konten Google.
function bacaPlaceId () {
  const jalur = join(DIR, 'place-id.ndjson')
  if (!existsSync(jalur)) return null
  const baris = readFileSync(jalur, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))
  const singgah = existsSync(PRIVAT)
    ? readdirSync(PRIVAT).filter((f) => /^toko-sync-.*\.ndjson$/.test(f)).length : 0
  return {
    jumlah: baris.length,
    pertama: [...new Set(baris.map((r) => r.pertama_terlihat).filter(Boolean))].sort()[0] ?? '—',
    singgah,
  }
}
const pid = bacaPlaceId()
const bagianPlaceId = !pid ? `## 4. PETA-ID GOOGLE — \`place-id.ndjson\`
Belum ada. Tarik dengan \`node toko_data/tarik-toko-sync.mjs\`.
` : `## 4. PETA-ID GOOGLE — \`place-id.ndjson\`
**${pid.jumlah}** place_id, terlama tercatat ${pid.pertama}. ${pid.singgah} singgahan aktif.

Lapis ini bukan sumber isi direktori, dan tidak boleh dijadikan begitu. Pembagian
medannya mengikuti izin per pasal, bukan selera:

| medan | tempat | pasal |
|---|---|---|
| \`place_id\` | repo, permanen | Service Specific Terms §A.3 |
| \`lat\`/\`lng\` | \`privat/\`, hapus di hari ke-30 | §14.3 |
| nama, alamat, foto | **tidak disimpan di mana pun** | §3.2.3(a), §3.2.3(b) |

Nama toko tetap sampai ke pengguna — dirender live dari \`place_id\` lewat Places UI Kit
atau Embed API saat halaman dibuka, tidak pernah singgah di disk kita. Jarak "toko
terdekat" dihitung dari lat/lng singgahan yang masih di dalam 30 hari.

Batas tampilan yang mengikat: §14.2 dan §3.2.3(e) melarang konten Places digambar di
atas peta non-Google. Basemap Leaflet/OSM di produk ini karena itu hanya boleh memuat
titik dari lapis 1 dan setoran pemilik. Toko dari lapis 4 disajikan sebagai **daftar**
(§14.1 mengizinkan Places tanpa peta Google) atau lewat Places UI Kit, yang §15.1
izinkan berdampingan dengan peta non-Google.
`

writeFileSync(join(DIR, 'LAPIS.md'), `# Lapis data toko tani

Disusun ulang oleh \`susun-fondasi.mjs\`. Pembagian menurut **lisensi sumber**, bukan isi:
data yang bersih boleh terbit, data principal hanya jadi benih privat.

> Angka OSM **sementara** — agen penyapu OSM dihentikan di tengah jalan.

## 1. TERBIT — \`toko-tani-jawa.ndjson\` / \`.csv\`
Nama + koordinat, lisensi terbuka (OSM/ODbL). Inilah yang boleh masuk repo publik.
- **${terbuka.keluar.length}** toko (${terbuka.kembar} duplikat dibuang)
- Sumber: ${[...new Set(terbuka.keluar.map((r) => r.sumber))].join(', ') || '—'}

## 2. PRIVAT — \`privat/benih-principal.ndjson\` (di-gitignore)
Koordinat dari direktori principal (Syngenta dkk). **Tidak terbit.** Dipakai hanya untuk
mengundang & mengisi-awal klaim pemilik toko. Begitu pemilik mengonfirmasi, catatannya jadi
setoran pemilik — berlisensi bersih — dan baru boleh naik ke lapis TERBIT.
- **${privat.keluar.length}** toko berkoordinat (${privat.kembar} duplikat dibuang) — ${prov(privat.keluar)}
- **${ember['benih-privat-alamat'].length}** principal tanpa koordinat → \`privat/benih-principal-alamat.ndjson\`

## 3. BENIH TERBUKA — \`benih-alamat.ndjson\`
Nama + alamat tanpa koordinat, lisензi terbuka/pemerintah. Benih untuk klaim & geokode-via-pemilik.
- Batang (CC-BY): ${ember['benih-terbuka'].length}
- TTI Kementan (arsip Wayback, karya pemerintah): ${ember['benih-gov'].length}

${bagianPlaceId}
## Dibuang
Luar Pulau Jawa: ${buang.luarJawa}. Berkas sesi paralel (\`semua.ndjson\`, \`peta-pairs\`, dll) sengaja dilewati.
`)

console.log(`TERBIT ${terbuka.keluar.length} | PRIVAT ${privat.keluar.length} koord + ${ember['benih-privat-alamat'].length} alamat | BENIH ${ember['benih-terbuka'].length + ember['benih-gov'].length}`)
