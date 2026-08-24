// Penarik daftar wilayah administratif dari layanan bridging BPS.
//
// Kenapa layanan BRIDGING dan bukan daftar wilayah biasa: layanan ini mengembalikan
// kode BPS DAN kode Kemendagri berdampingan untuk wilayah yang sama. Keduanya tidak
// selalu sama — dan pada Papua keduanya bahkan bertukar — jadi menyimpan salah satunya
// tanpa menyebut skemanya membuat "91" tidak bisa dipastikan artinya.
//
// robots.txt sig.bps.go.id berbunyi "Disallow:" kosong — seluruhnya diizinkan.
// Diperiksa 24 Agustus 2026.
//
//   node wilayah_data/tarik-bps.mjs

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), 'raw');
const DASAR = 'https://sig.bps.go.id/rest-bridging/getwilayah';
const jeda = (ms) => new Promise((r) => setTimeout(r, ms));

async function ambil(level, parent, percobaan = 0) {
  const url = `${DASAR}?level=${level}&parent=${parent}`;
  try {
    const r = await fetch(url, { headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    if (!Array.isArray(j)) throw new Error('bukan larik');
    return j;
  } catch (e) {
    if (percobaan >= 3) {
      console.error(`  ! gagal ${level}/${parent}: ${e.message}`);
      return null; // null ≠ [] — "tidak berhasil ditanya" bukan "jawabannya kosong"
    }
    await jeda(1500 * (percobaan + 1));
    return ambil(level, parent, percobaan + 1);
  }
}

if (!existsSync(AKAR)) mkdirSync(AKAR, { recursive: true });

const prov = await ambil('provinsi', 0);
if (!prov) { console.error('Provinsi gagal ditarik; berhenti.'); process.exit(1); }
writeFileSync(join(AKAR, 'provinsi.json'), JSON.stringify(prov, null, 1));
console.log(`provinsi: ${prov.length}`);

const gagal = [];
let nKab = 0;
let nKec = 0;
for (const p of prov) {
  const kab = await ambil('kabupaten', p.kode_bps);
  if (!kab) { gagal.push(`kabupaten/${p.kode_bps}`); continue; }
  writeFileSync(join(AKAR, `kabupaten-${p.kode_bps}.json`), JSON.stringify(kab, null, 1));
  nKab += kab.length;
  for (const k of kab) {
    const kec = await ambil('kecamatan', k.kode_bps);
    if (!kec) { gagal.push(`kecamatan/${k.kode_bps}`); continue; }
    writeFileSync(join(AKAR, `kecamatan-${k.kode_bps}.json`), JSON.stringify(kec, null, 1));
    nKec += kec.length;
    await jeda(120);
  }
  console.log(`  ${p.kode_bps} ${p.nama_bps}: ${kab.length} kab/kota`);
}

console.log(`\nkabupaten/kota: ${nKab}\nkecamatan: ${nKec}`);
// Kegagalan dicetak, bukan didiamkan: daftar wilayah yang bolong tanpa disebut bolongnya
// akan terbaca sebagai wilayah yang memang tidak ada.
if (gagal.length) console.log(`GAGAL ${gagal.length}: ${gagal.slice(0, 20).join(', ')}`);
else console.log('Tidak ada permintaan yang gagal.');
