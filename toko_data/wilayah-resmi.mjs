// Memetakan teks wilayah dari sumber luar ke id wilayah resmi Pranatani
// (`spec/vocab/region/wilayah.ndjson`, berkode BPS).
//
// Kenapa ini ada sebagai modul sendiri: sumber luar menulis nama wilayah semaunya.
// Google Places saja memulangkan satu kabupaten dalam tiga ejaan sekaligus —
// "Kabupaten Bandung", "Bandung Regency", "KAB. BANDUNG" — plus provinsi yang
// separuh Inggris ("West Java"). Selama string mentah itu yang disimpan, mencari
// "kota bandung" memulangkan 52 toko sementara "bandung city" memulangkan 6 lagi,
// dan tidak ada yang tahu jumlah sebenarnya 58. Maka teks sumber tidak pernah
// disimpan sebagai wilayah; ia diresolusi jadi `op:rgn:...` lebih dulu.
//
// Kecamatan diresolusi DULU, baru induknya diambil dari situ. Nama kecamatan jauh
// lebih spesifik daripada nama kabupaten, jadi arah itu lebih tahan salah ejaan:
// "Solokanjreruk" masih menemukan Solokan Jeruk, dan induknya ikut benar tanpa
// perlu mempercayai medan kabupaten sama sekali.

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..')

// Kata Inggris yang muncul di nama wilayah versi Google. Arah katanya juga berbeda
// ("West Bandung" vs "Bandung Barat"), karena itu pembandingnya himpunan kata
// terurut, bukan untai apa adanya.
const INGGRIS = {
  west: 'barat', east: 'timur', north: 'utara', south: 'selatan', central: 'tengah',
  java: 'jawa', islands: 'kepulauan', regency: '', city: '', province: '', district: '',
}

const AWALAN = /^(kecamatan|kec\.?|kabupaten|kab\.?|kotamadya|kota|daerah khusus ibukota|dki|d\.?i\.?)\s+/i
const AKHIRAN = /\s+(regency|city|province|district|subdistrict|municipality)$/i

function kata (teks) {
  const s = String(teks ?? '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(AWALAN, '').replace(AKHIRAN, '')
  return s.replace(/[^a-z0-9]+/g, ' ').split(' ')
    .map((k) => (k in INGGRIS ? INGGRIS[k] : k)).filter(Boolean)
}

// Dua bentuk, dan perbedaannya penting.
// `normalkan` mengurutkan kata supaya beda urutan antarbahasa lebur — "West Bandung"
// dan "Bandung Barat" jadi untai yang sama. Itu yang dipakai membandingkan nama.
// `rapat` justru HARUS mempertahankan urutan asli, karena ia dipakai mengukur jarak
// sunting: "Solokanjeruk" hanya dekat dengan "solokanjeruk", bukan "jeruksolokan".
export const normalkan = (teks) => kata(teks).sort().join(' ')
const rapat = (teks) => kata(teks).join('')

// Tingkat yang diminta teksnya. Tanpa ini "Bandung Regency" dan "Kota Bandung"
// sama-sama menormalkan jadi "bandung" dan keduanya cocok ke dua wilayah berbeda.
function tingkatDari (teks) {
  const s = String(teks ?? '')
  if (/\b(kabupaten|kab\.?|regency)\b/i.test(s)) return 'regency'
  if (/\b(kota|kotamadya|city)\b/i.test(s)) return 'city'
  return null
}

function jarakSunting (a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const kini = [i]
    for (let j = 1; j <= b.length; j++) {
      kini.push(Math.min(prev[j] + 1, kini[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)))
    }
    prev = kini
  }
  return prev[b.length]
}

let _daftar = null
function daftar () {
  if (_daftar) return _daftar
  const baris = readFileSync(join(AKAR, 'spec/vocab/region/wilayah.ndjson'), 'utf8')
    .split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))

  const olehId = new Map(baris.map((r) => [r.id, r]))
  const distrik = baris.filter((r) => r.level === 'district')
  const indukan = baris.filter((r) => r.level === 'regency' || r.level === 'city')

  const perNama = new Map(); const perRapat = new Map()
  const dorong = (peta, kunci, nilai) => {
    if (!peta.has(kunci)) peta.set(kunci, [])
    peta.get(kunci).push(nilai)
  }
  for (const d of distrik) {
    const n = normalkan(d.label.id)
    dorong(perNama, n, d); dorong(perRapat, rapat(n), d)
  }
  const indukPerNama = new Map()
  for (const r of indukan) dorong(indukPerNama, normalkan(r.label.id), r)

  _daftar = { olehId, distrik, perNama, perRapat, indukPerNama }
  return _daftar
}

/**
 * @param {{kecamatan?: string, kota?: string, provinsi?: string}} teks
 * @returns {{distrik: object|null, induk: object|null, vonis: 'tepat'|'perkiraan'|'ambigu'|'nihil'}}
 */
export function resolusi (teks) {
  const { olehId, distrik, perNama, perRapat, indukPerNama } = daftar()
  const kec = normalkan(teks.kecamatan)
  const kotaN = normalkan(teks.kota)
  const kotaTingkat = tingkatDari(teks.kota)
  const naik = (d) => ({ distrik: d, induk: olehId.get(d.parent.id) ?? null })

  // Induk yang diminta teksnya — dipakai memilah kecamatan bernama kembar
  // (Cisarua ada di Bandung Barat, Bogor, dan Sumedang sekaligus).
  const calonInduk = (indukPerNama.get(kotaN) ?? [])
    .filter((r) => !kotaTingkat || r.level === kotaTingkat)

  const calon = perNama.get(kec) ?? perRapat.get(rapat(teks.kecamatan)) ?? []
  if (calon.length === 1) return { ...naik(calon[0]), vonis: 'tepat' }
  if (calon.length > 1) {
    const saring = calon.filter((d) => calonInduk.some((r) => r.id === d.parent.id))
    if (saring.length === 1) return { ...naik(saring[0]), vonis: 'tepat' }
    // Kalau tak satu pun calon berinduk ke kabupaten yang disebut teks, medan kabupaten
    // sumbernya yang keliru — jatuh ke pencarian salah-ketik di bawah, jangan menyerah.
    if (saring.length > 1 || calonInduk.length !== 1) {
      return { distrik: null, induk: calonInduk.length === 1 ? calonInduk[0] : null, vonis: 'ambigu' }
    }
  }

  // Belum ketemu: coba salah ketik, tapi hanya di dalam kabupaten yang sudah pasti.
  // Dibatasi supaya "Toko Tani" di kabupaten lain tidak tersedot ke sini.
  if (calonInduk.length === 1) {
    const dekat = distrik
      .filter((d) => d.parent.id === calonInduk[0].id)
      .map((d) => ({ d, jarak: jarakSunting(rapat(teks.kecamatan), rapat(d.label.id)) }))
      .filter((x) => x.jarak <= 2)
      .sort((a, b) => a.jarak - b.jarak)
    if (dekat.length === 1 || (dekat.length > 1 && dekat[0].jarak < dekat[1].jarak)) {
      return { ...naik(dekat[0].d), vonis: 'perkiraan' }
    }
    return { distrik: null, induk: calonInduk[0], vonis: 'nihil' }
  }
  return { distrik: null, induk: null, vonis: 'nihil' }
}
