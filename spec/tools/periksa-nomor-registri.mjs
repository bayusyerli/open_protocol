// Menguraikan kolom registration.number pada kedua berkas registri produk, menuliskan
// bentuk seragamnya ke kolom terpisah, dan melaporkan baris yang tidak bisa diuraikan.
//
//   node spec/tools/periksa-nomor-registri.mjs [--tulis]
//
// Tanpa --tulis ia hanya melapor. Dengan --tulis ia menambahkan ke registration:
//   number_normalized  bentuk seragam untuk dicocokkan ke nomor yang tercetak di kemasan
//   number_scheme      skema penomoran yang dipakai baris itu
//   number_absent_in_source  penanda bahwa baris registrinya memang tidak memuat nomor
//
// Nilai `number` tidak pernah ditimpa — konvensi pasal 4 di 00-konvensi-kerja-paralel.md.
// Satu-satunya baris yang kehilangan isi `number` adalah 667 baris yang selama ini memuat
// karangan "TIDAK-TERCANTUM"; kekosongan itu sekarang dinyatakan, bukan disamarkan.

import { readFileSync, writeFileSync } from 'node:fs';

const AKAR = new URL('../vocab/product/', import.meta.url);
const tulis = process.argv.includes('--tulis');

// Resep yang sama dengan rapikan() di gambar_produk/periksa.mjs, supaya sisi registri dan
// sisi kemasan menyeragamkan dengan cara yang identik: buang segala yang bukan huruf-angka,
// lalu buang awalan "RI" yang dicetak di kemasan tetapi tidak pernah disimpan registri.
const seragamkan = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^RI/, '');

// Kodebuku digit jenis, dipulihkan dari sebaran 6.473 nomor formulasi — bukan dari dokumen
// resmi. Dipakai sebagai isyarat silang, bukan sebagai vonis; lihat D37.
const JENIS_PESTISIDA = {
  '01': 'Insektisida', '02': 'Fungisida', '03': 'Herbisida', '04': 'Zat Pengatur Tumbuh Tanaman',
  '05': 'Moluskisida', '06': 'Bakterisida', '07': 'Atraktan / Feromon', '08': 'Pestisida Rumah Tangga',
  '09': 'Pestisida Pengendalian Vektor Penyakit Pada Manusia', '10': 'Fumigan',
  '11': 'Bahan pengawet kayu', '12': 'Rodentisida', '13': 'Nematisida', '14': 'Akarisida',
};

const TAHUN_MASUK_AKAL = (y) => Number(y) >= 1970 && Number(y) <= 2026;

// Lima kelompok bertitik dan 14 digit rapat adalah dua tulisan untuk struktur yang sama:
// AA BB CC TTTT NNNN. Nomor urutnya TIDAK dipadkan nol — kemasan LANNATE 25 WP mencetak
// "RI. 0101011978335" apa adanya, 13 digit, dan cocok ke registri tanpa perlakuan apa pun.
// Nomor urut tidak pernah melewati empat angka. Padnya sendiri tidak konsisten — pupuk
// menulis `01.03.2018.049` sekaligus `02.02.2024.6` — jadi nol di depan diterima, panjang
// tidak. Yang melewatinya, `01.03.01.2022.003833`, tidak diuraikan: menebak mana dari enam
// angka itu nomor urutnya berarti mengarang.
const URUT = '(\\d{1,4})';
const LIMA_KELOMPOK = new RegExp(`^(\\d{2})\\.(\\d{2})\\.(\\d{2})\\.(\\d{4})\\.${URUT}$`);
const TIGA_KELOMPOK = new RegExp(`^(\\d{2})\\.(\\d{4})\\.${URUT}$`);
const EMPAT_KELOMPOK = new RegExp(`^(\\d{2})\\.(\\d{2})\\.(\\d{4})\\.${URUT}$`);

// Debris tipografis di tepi nomor: apostrof pelindung teks ala Excel, titik yatim, CR/LF.
// Semuanya terbawa dari registri — tarikan ulang 20 Agustus 2026 mengembalikannya persis.
const kupasTepi = (s) => String(s).replace(/\s+/g, '').replace(/^'+/, '').replace(/^\.+|\.+$/g, '');

function uraikanPestisida(asli) {
  const t = kupasTepi(asli);

  const lima = LIMA_KELOMPOK.exec(t);
  if (lima && TAHUN_MASUK_AKAL(lima[4])) {
    return { scheme: 'formulasi', jenisDigit: lima[2], tahun: lima[4], urut: Number(lima[5]) };
  }
  const tiga = TIGA_KELOMPOK.exec(t);
  if (tiga && TAHUN_MASUK_AKAL(tiga[2])) {
    return { scheme: 'bahan-teknis', jenisDigit: null, tahun: tiga[2], urut: Number(tiga[3]) };
  }
  if (/^\d+$/.test(t)) {
    // Formulasi: 11–14 digit, dengan tahun di posisi 7–10 dan digit jenis yang dikenal.
    if (t.length >= 11 && t.length <= 14) {
      const [bb, cc, tahun] = [t.slice(2, 4), t.slice(4, 6), t.slice(6, 10)];
      if (TAHUN_MASUK_AKAL(tahun) && JENIS_PESTISIDA[bb] && (cc === '01' || cc === '02')) {
        return { scheme: 'formulasi', jenisDigit: bb, tahun, urut: Number(t.slice(10)) };
      }
    }
    // Bahan teknis dan izin ekspor: kelas 03/04, lalu tahun, lalu nomor urut tanpa pad.
    if (t.length >= 7 && t.length <= 10 && (t.startsWith('03') || t.startsWith('04'))
        && TAHUN_MASUK_AKAL(t.slice(2, 6))) {
      return { scheme: 'bahan-teknis', jenisDigit: null, tahun: t.slice(2, 6), urut: Number(t.slice(6)) };
    }
  }
  return { scheme: 'tak-terurai', jenisDigit: null, tahun: null, urut: null };
}

function uraikanPupuk(asli) {
  const t = kupasTepi(asli);
  const empat = EMPAT_KELOMPOK.exec(t);
  if (empat && TAHUN_MASUK_AKAL(empat[3])) {
    return { scheme: 'pupuk', jenisDigit: empat[1], tahun: empat[3], urut: Number(empat[4]) };
  }
  return { scheme: 'tak-terurai', jenisDigit: null, tahun: null, urut: null };
}

const KOSONG = 'TIDAK-TERCANTUM';

const berkas = [
  { nama: 'pestisida.ndjson', urai: uraikanPestisida },
  { nama: 'pupuk.ndjson', urai: uraikanPupuk },
];

const ringkas = [];

for (const { nama, urai } of berkas) {
  const jalur = new URL(nama, AKAR);
  const baris = readFileSync(jalur, 'utf8').split('\n').filter((l) => l.trim());
  const hitung = new Map();
  const takTerurai = [];
  const bentrokJenis = [];
  const perNomor = new Map();
  let dikosongkan = 0;
  let debris = 0;

  const keluar = baris.map((l) => {
    const doc = JSON.parse(l);
    const reg = doc.registration;

    // Turunan lama dibuang lebih dulu supaya alat ini aman dijalankan berulang kali —
    // jalannya yang kedua harus menghasilkan berkas yang sama persis dengan yang pertama.
    delete reg.number_normalized;
    delete reg.number_scheme;

    const asli = reg.number;

    if (asli === undefined && reg.number_absent_in_source) {
      dikosongkan++;
      hitung.set('tanpa-nomor-di-sumber', (hitung.get('tanpa-nomor-di-sumber') ?? 0) + 1);
      return doc;
    }

    if (asli === KOSONG) {
      // Baris registrinya memang tidak memuat nomor. Sumbernya kosong — bukan tak terbaca,
      // bukan belum diperiksa. Yang dikarang adalah teksnya, jadi teksnya yang dicabut.
      delete reg.number;
      reg.number_absent_in_source = true;
      dikosongkan++;
      hitung.set('tanpa-nomor-di-sumber', (hitung.get('tanpa-nomor-di-sumber') ?? 0) + 1);
      return doc;
    }

    const { scheme, jenisDigit, tahun, urut } = urai(asli);
    const seragam = seragamkan(asli);
    reg.number_normalized = seragam;
    reg.number_scheme = scheme;
    hitung.set(scheme, (hitung.get(scheme) ?? 0) + 1);

    // Debris = apa pun yang dikupas dari tepi. Titik pemisah kelompok bukan debris; ia
    // bagian dari tulisan nomornya, dan hilang belakangan hanya karena penyeragaman.
    if (kupasTepi(asli) !== String(asli)) debris++;
    if (scheme === 'tak-terurai') takTerurai.push({ id: doc.id, label: doc.label?.id, asli });

    perNomor.set(seragam, [...(perNomor.get(seragam) ?? []), doc.label?.id ?? doc.id]);

    // Isyarat silang: digit jenis pada nomor melawan jenis yang dinyatakan barisnya sendiri.
    const dinyatakan = doc.mappings?.find((m) => m.scheme === 'KEMENTAN')?.note ?? '';
    if (jenisDigit && JENIS_PESTISIDA[jenisDigit] && dinyatakan.includes('Jenis pestisida menurut registri:')) {
      const jenis = dinyatakan.split('Jenis pestisida menurut registri:')[1].replace(/\.$/, '').trim();
      if (jenis) {
        bentrokJenis.push({ id: doc.id, label: doc.label?.id, asli, digit: jenisDigit,
          menurutDigit: JENIS_PESTISIDA[jenisDigit], menurutBaris: jenis, tahun, urut });
      }
    }
    return doc;
  });

  const kembar = [...perNomor.entries()].filter(([, v]) => v.length > 1);

  // Sebagian besar "bentrokan" sebenarnya subkategori yang wajar — digit 08 memayungi
  // Pestisida Rumah Tangga sekaligus Repelen. Yang layak dilihat hanya pasangan yang
  // langka terhadap digitnya sendiri; ambangnya 1% dari seluruh baris berdigit sama.
  const perDigit = new Map();
  const perPasangan = new Map();
  for (const b of bentrokJenis) {
    perDigit.set(b.digit, (perDigit.get(b.digit) ?? 0) + 1);
    const k = `${b.digit}|${b.menurutBaris}`;
    perPasangan.set(k, (perPasangan.get(k) ?? 0) + 1);
  }
  const langka = bentrokJenis.filter((b) => {
    if (b.menurutBaris === b.menurutDigit) return false;
    return perPasangan.get(`${b.digit}|${b.menurutBaris}`) / perDigit.get(b.digit) <= 0.01;
  });

  ringkas.push({ nama, total: baris.length, hitung, takTerurai, langka, kembar, dikosongkan, debris,
                 nomor: new Set(perNomor.keys()) });

  if (tulis) {
    writeFileSync(jalur, keluar.map((d) => JSON.stringify(d)).join('\n') + '\n');
  }
}

for (const r of ringkas) {
  console.log(`\n== ${r.nama} — ${r.total} baris`);
  for (const [k, v] of [...r.hitung].sort((a, b) => b[1] - a[1])) {
    console.log(`   ${String(v).padStart(5)}  ${k}`);
  }
  console.log(`   ${String(r.debris).padStart(5)}  di antaranya bawa debris tepi (apostrof, titik yatim, CR/LF)`);
  console.log(`   ${String(r.dikosongkan).padStart(5)}  nomor dikosongkan karena sumbernya kosong`);
  console.log(`   ${String(r.kembar.length).padStart(5)}  nomor dipakai lebih dari satu baris`);

  if (r.takTerurai.length) {
    console.log(`\n   tidak bisa diuraikan (${r.takTerurai.length}) — dibiarkan apa adanya, tidak ditebak:`);
    for (const t of r.takTerurai) console.log(`     ${t.id}  ${JSON.stringify(t.asli).padEnd(24)} ${t.label}`);
  }
  if (r.langka.length) {
    console.log(`\n   digit jenis melawan jenis yang dinyatakan barisnya, pada pasangan langka (${r.langka.length}):`);
    for (const b of r.langka) {
      console.log(`     ${b.asli.padEnd(22)} digit ${b.digit} = ${b.menurutDigit.padEnd(28)} baris = ${b.menurutBaris.padEnd(24)} ${b.label}`);
    }
  }
}

// Kedua registri diindeks bersama saat mencocokkan nomor yang tercetak di kemasan, jadi satu
// nomor yang muncul di kedua berkas akan tertaut ke produk yang salah. Hari ini tidak ada, dan
// bukan karena beruntung: posisi 5-6 memisahkannya — pestisida menaruh kelompok ketiganya yang
// selalu `01` di sana, pupuk menaruh separuh awal tahunnya yang selalu `20`. Diperiksa tiap
// jalan supaya penarikan berikutnya tidak diam-diam merusaknya.
const [a, b] = ringkas;
const bertindih = [...a.nomor].filter((n) => b.nomor.has(n));
console.log(`\n== lintas registri: ${a.nomor.size} nomor pestisida, ${b.nomor.size} nomor pupuk`);
if (bertindih.length === 0) {
  console.log('   tidak ada nomor yang dipakai kedua registri.');
} else {
  console.log(`   ${bertindih.length} NOMOR DIPAKAI KEDUA REGISTRI — pencocokan kemasan bisa tertaut ke produk yang salah:`);
  for (const n of bertindih) console.log(`     ${n}`);
}

console.log(tulis ? '\nDitulis ke vocab/product/.\n' : '\nLaporan saja. Tambahkan --tulis untuk menyimpan.\n');
