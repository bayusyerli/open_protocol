// Meringkas hasil tarikan LeSOS jadi tabel-tabel tinjauan. Membaca privat/klien.json,
// tidak menyentuh jaringan, dan tidak mencetak satu pun medan yang bisa mengidentifikasi
// orang — narahubung memang sudah tidak ada di data.
//
//   node lesos_data/profil-lesos.mjs [berkas-klien.json]

import { readFileSync } from 'node:fs';
import csv from 'node:fs';

const berkas = process.argv[2] ?? 'lesos_data/privat/klien.json';
const d = JSON.parse(readFileSync(berkas, 'utf8'));
const sert = d.flatMap((k) => k.sertifikat.map((s) => ({ ...s, klien: k.nama, id: k.id })));

const cacah = (arr, f) => {
  const m = new Map();
  for (const x of arr) { const k = f(x); if (k == null) continue; m.set(k, (m.get(k) ?? 0) + 1); }
  return [...m].sort((a, b) => b[1] - a[1]);
};
const tabel = (judul, kolom, baris) => {
  console.log(`\n### ${judul}\n`);
  console.log(`| ${kolom.join(' | ')} |`);
  console.log(`|${kolom.map((_, i) => (i ? '---:' : '---')).join('|')}|`);
  for (const b of baris) console.log(`| ${b.join(' | ')} |`);
};

// 1. Cakupan
const gagal = d.filter((k) => !k.terambil);
tabel('Cakupan tarikan', ['Tahap', 'Hasil'], [
  ['Operator terdaftar di `/klien` + `/klien_soi`', d.length],
  ['Halaman rinci berhasil diambil', d.length - gagal.length],
  ['Halaman rinci 404 di sumbernya', gagal.length],
  ['Baris sertifikat terurai', sert.length],
  ['Nomor sertifikat unik', new Set(sert.map((s) => s.nomor)).size],
]);
if (gagal.length) {
  console.log(`\nTerdaftar di indeks tetapi halaman rincinya tidak ada di situs sumber: ` +
    gagal.map((k) => `${k.nama} (id ${k.id})`).join('; ') + '.');
}

// 2. Keutuhan medan
const nihil = (f) => d.filter(f).length;
tabel('Keutuhan medan', ['Medan', 'Terisi', 'Kosong'], [
  ['nama', d.length - nihil((k) => !k.nama), nihil((k) => !k.nama)],
  ['alamat', d.length - nihil((k) => !k.alamat), nihil((k) => !k.alamat)],
  ['gambar (URL saja)', d.length - nihil((k) => !k.gambar), nihil((k) => !k.gambar)],
  ['standar', d.length - nihil((k) => !k.standar), nihil((k) => !k.standar)],
  ['≥1 sertifikat', d.length - nihil((k) => !k.sertifikat.length), nihil((k) => !k.sertifikat.length)],
]);

// 3. Status situs vs keberlakuan yang dihitung ulang — tabel inti tinjauan
const kunci = [...new Set(sert.map((s) => s.status_situs))];
tabel('`status_situs` × keberlakuan yang dihitung ulang',
  ['status_situs', 'Baris', 'Lolos uji tanggal', 'Berlaku efektif'],
  kunci.map((k) => {
    const g = sert.filter((s) => s.status_situs === k);
    return [`\`${k}\``, g.length,
      g.filter((s) => s.berlaku_pada_tarikan === true).length,
      g.filter((s) => s.berlaku_efektif === true).length];
  }));

// 4. Ruang lingkup
const lingkup = cacah(sert.flatMap((s) => s.lingkup_pecah.map((x) => x.toLowerCase())), (x) => x);
tabel('Ruang lingkup terbanyak', ['Lingkup', 'Baris'], lingkup.slice(0, 15));

// 5. Input produksi — bagian yang menyentuh Pranatani
const INPUT = /pupuk|pestisid|benih|agensi hayati|biopestisida|kompos|dekomposer|pgpr|mikroba/i;
const barisInput = sert.filter((s) => INPUT.test(s.lingkup));
const opInput = new Set(barisInput.map((s) => s.id));
const opInputAktif = new Set(barisInput.filter((s) => s.berlaku_efektif).map((s) => s.id));
tabel('Sertifikat input produksi', ['Ukuran', 'Jumlah'], [
  ['Baris sertifikat menyebut input produksi', barisInput.length],
  ['Operator pernah memegangnya', opInput.size],
  ['Operator dengan sertifikat input **berlaku hari ini**', opInputAktif.size],
]);

// 6. Bentuk badan terhadap enum principal.schema.json
const ENUM = { 'PT': /^PT[\s.]/i, 'CV': /^CV[\s.]/i, 'UD': /^UD[\s.]/i, 'Koperasi': /^KOPERASI/i };
const bentuk = (n) => Object.keys(ENUM).find((k) => ENUM[k].test(n)) ?? null;
const takBerslot = /^(KELOMPOK|GAPOKTAN|POKTAN|SUBAK|YAYASAN|PERKUMPULAN|ASOSIASI|KSM|P4S|PERUM|BUMP|GABUNGAN)/i;
const muat = d.filter((k) => bentuk(k.nama));
const takMuat = d.filter((k) => !bentuk(k.nama) && takBerslot.test(k.nama));
tabel('Bentuk badan terhadap enum `entity_form`', ['Golongan', 'Operator'], [
  ['Muat di enum (PT/CV/UD/Koperasi)', muat.length],
  ['Bentuknya diketahui tetapi **tidak ada slotnya**', takMuat.length],
  ['Tidak berprefiks — `tidak_diketahui` yang jujur', d.length - muat.length - takMuat.length],
]);
tabel('Rincian yang tidak ada slotnya', ['Awalan nama', 'Operator'],
  cacah(takMuat, (k) => k.nama.match(/^[A-Za-z4]+/)[0].toUpperCase()).slice(0, 10));

// 7. Sebaran wilayah
const PROV = ['Jawa Timur','Jawa Tengah','Yogyakarta','Jawa Barat','Banten','Jakarta','Bali',
  'Nusa Tenggara Barat','Nusa Tenggara Timur','Sumatera Utara','Sumatera Barat','Sumatera Selatan',
  'Aceh','Riau','Jambi','Bengkulu','Lampung','Kalimantan Barat','Kalimantan Tengah','Kalimantan Selatan',
  'Kalimantan Timur','Sulawesi Utara','Sulawesi Tengah','Sulawesi Selatan','Sulawesi Tenggara',
  'Sulawesi Barat','Gorontalo','Maluku','Papua'];
tabel('Provinsi tersurat di alamat', ['Provinsi', 'Operator'],
  cacah(d, (k) => { const h = PROV.filter((p) => new RegExp(p, 'i').test(k.alamat)); return h.length ? h[h.length - 1] : '(tak tersebut)'; }).slice(0, 12));

// 8. Anomali yang perlu mata manusia
const ulang = sert.filter((s) => { const t = s.lingkup_pecah.map((x) => x.toLowerCase()); return new Set(t).size !== t.length; });
const takTerbaca = sert.filter((s) => s.berlaku_pada_tarikan === null);
const huruf = [...new Set(sert.map((s) => s.status_situs))].filter((s) => s !== s.trim() || /^[a-z]/.test(s));
tabel('Anomali untuk ditinjau tangan', ['Temuan', 'Jumlah'], [
  ['Ruang lingkup memuat istilah kembar (mis. "Pupuk dan Pupuk")', ulang.length],
  ['Tanggal berakhir tidak terbaca mesin', takTerbaca.length],
  ['Nilai status berbeda kapitalisasi', huruf.length ? `${huruf.length} (${huruf.map((x) => `\`${x}\``).join(', ')})` : 0],
  ['Nomor sertifikat dipakai >1 operator', cacah(sert, (s) => s.nomor).filter(([n]) => new Set(sert.filter((s) => s.nomor === n).map((s) => s.id)).size > 1).length],
]);
