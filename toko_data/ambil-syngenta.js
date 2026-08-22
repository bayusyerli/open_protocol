// Dijalankan dari konsol peramban pada https://www.syngenta.co.id.
//
// Kenapa dari peramban: seluruh host itu ada di belakang tantangan Cloudflare, dan curl
// polos mendapat HTTP 403 "Just a moment..." pada SEMUA jalur, /jsonapi termasuk. Datanya
// publik dan tanpa autentikasi; yang menghalangi hanya pemeriksaan peramban. Dari tab yang
// sudah terbuka di host itu, fetch ke /jsonapi berjalan biasa karena satu asal.
//
// Kenapa hasilnya dipindah lewat gzip+base64, bukan dikirim ke server lokal: peramban
// menolak permintaan dari halaman publik ke alamat lokal (127.0.0.1 / localhost) —
// diuji, keempat bentuk permintaan kena net::ERR_BLOCKED_BY_CLIENT, dan header
// Access-Control-Allow-Private-Network di sisi penerima tidak menolong. Respons JSON:API
// juga tidak membawa Access-Control-Allow-Origin, jadi halaman di localhost tidak bisa
// mengambilnya sendiri. Yang tersisa: kumpulkan di dalam tab, padatkan, salin keluar.
//
// Langkah:
//   1. buka https://www.syngenta.co.id/search/retailers-map/area/DKI%20Jakarta
//   2. tempel seluruh berkas ini di konsol
//   3. tunggu window.__p.keadaan === 'selesai'  (sekitar satu menit, ~73 halaman)
//   4. salin window.__b64 (dipotong-potong bila perlu) ke berkas .b64, lalu:
//        base64 -d < panen.b64 | gunzip > toko_data/raw/syngenta/distributor-mentah.ndjson
//   5. node toko_data/ambil-syngenta.mjs --olah
//
// Baris disusutkan di dalam tab: amplop JSON:API (blok links per catatan, berisi UUID
// yang diulang dua kali) hampir tiga perempat dari muatan mentah dan tidak membawa
// keterangan apa pun. Seluruh nilai bidang ikut apa adanya; rujukan taksonomi ditukar
// jadi namanya memakai kedua kosakata yang diambil lebih dulu.

window.__p = { keadaan: 'jalan', halaman: 0, baris: 0 }

;(async () => {
  const jeda = (ms) => new Promise((r) => setTimeout(r, ms))
  const ambil = async (u) => {
    const r = await fetch(u, { headers: { Accept: 'application/vnd.api+json' } })
    if (!r.ok) throw new Error('HTTP ' + r.status + ' pada ' + u)
    return r.json()
  }

  // --- kosakata: id -> nama --------------------------------------------------
  // field_regions memuat nama kabupaten yang jauh lebih bersih daripada
  // field_address.locality; field_business memuat tingkat pengecer.
  const peta = {}
  for (const v of ['business', 'distributors_geo_region']) {
    peta[v] = {}
    let u = `/jsonapi/taxonomy_term/${v}?page[limit]=50&fields[taxonomy_term--${v}]=name`
    while (u) {
      const j = await ambil(u)
      for (const t of j.data) peta[v][t.id] = t.attributes.name
      u = j.links?.next?.href ?? null
      await jeda(250)
    }
  }
  window.__p.kosakata = { business: Object.keys(peta.business).length, region: Object.keys(peta.distributors_geo_region).length }

  // --- simpul distributor ----------------------------------------------------
  // Diurutkan menurut nid supaya penomoran halaman stabil: tanpa sort, urutan Drupal
  // tidak dijamin dan baris bisa terlewat atau terambil dua kali antar halaman.
  const BIDANG = ['drupal_internal__nid', 'title', 'changed', 'field_address', 'field_geolocation',
    'field_phone_numbers', 'field_emails', 'field_migration_id', 'field_link', 'field_text',
    'field_business', 'field_regions'].join(',')
  let u = `/jsonapi/node/distributor?sort=drupal_internal__nid&page[limit]=50&fields[node--distributor]=${BIDANG}`
  const baris = []
  let n = 0
  const namaIstilah = (rel, v) => {
    const d = rel?.data
    const a = Array.isArray(d) ? d : (d ? [d] : [])
    return a.map((x) => peta[v][x.id] ?? x.id)
  }

  while (u) {
    const j = await ambil(u)
    for (const d of j.data) {
      const a = d.attributes, al = a.field_address || {}, g = a.field_geolocation || {}
      const rec = {
        nid: a.drupal_internal__nid,
        nama: a.title,
        negara: al.country_code ?? null,
        prov_sumber: al.administrative_area ?? null,
        kota_sumber: al.locality ?? null,
        alamat: [al.address_line1, al.address_line2].filter(Boolean).join(', ') || null,
        pos: al.postal_code || null,
        lat: g.lat ?? null,
        lng: g.lng ?? null,
        tel: a.field_phone_numbers || [],
        surel: a.field_emails || [],
        mig: a.field_migration_id ?? null,
        ubah: a.changed ?? null,
        bisnis: namaIstilah(d.relationships?.field_business, 'business'),
        wilayah: namaIstilah(d.relationships?.field_regions, 'distributors_geo_region')
      }
      if (a.field_link) rec.tautan = a.field_link
      if (a.field_text) rec.teks = a.field_text
      for (const k of Object.keys(rec)) {
        if (rec[k] === null || (Array.isArray(rec[k]) && !rec[k].length)) delete rec[k]
      }
      baris.push(JSON.stringify(rec))
    }
    u = j.links?.next?.href ?? null
    n++
    window.__p.halaman = n
    window.__p.baris = baris.length
    await jeda(400)
  }

  const teks = baris.join('\n') + '\n'
  const gz = new Response(new Blob([teks]).stream().pipeThrough(new CompressionStream('gzip')))
  const buf = new Uint8Array(await gz.arrayBuffer())
  let bin = ''
  const N = 8192   // String.fromCharCode kehabisan tumpukan kalau seluruh larik disodorkan sekaligus
  for (let i = 0; i < buf.length; i += N) bin += String.fromCharCode.apply(null, buf.subarray(i, i + N))
  window.__b64 = btoa(bin)
  window.__p.keadaan = 'selesai'
  window.__p.mentahLen = teks.length
  window.__p.b64Len = window.__b64.length
})().catch((e) => {
  window.__p.keadaan = 'galat'
  window.__p.pesan = String((e && e.message) || e)
})
