/* Jalur 1 — masuk dari gejala.
 *
 * Keputusan pestisida memang reaktif: masalah muncul, dan orang butuh jawaban
 * sekarang. Momen itu bukan masalah yang harus diatasi — ia titik masuk terbaik yang
 * akan pernah dimiliki platform ini, karena tidak menuntut persiapan apa pun.
 *
 * Empat keputusan rancangan yang menahan bentuknya:
 *   1. Masuk lewat APA YANG TERLIHAT, bukan nama hama. Yang panik tahu daunnya
 *      mengeriting ke atas; ia tidak tahu kata "trips".
 *   2. Mesin tidak menebak, ORANG yang memilih. Tidak ada pengenal foto — diagnosis
 *      salah yang percaya diri menghasilkan semprotan salah.
 *   3. Merek diruntuhkan jadi BAHAN AKTIF + KADAR. Kesetaraan hanya benar pada
 *      pasangan itu, bukan pada nama bahannya: satu entitas "Abamektin" dipakai pada
 *      33 kadar berbeda, 24 di antaranya dalam g/L.
 *   4. Informasi negatif didahulukan — apa yang dilarang, dan apa yang tidak akan
 *      menolong. Itu yang paling bernilai, dan paling kecil risiko hukumnya.
 *
 * Dosis TIDAK PERNAH ditempel ke bahan. Dari 26 produk berisi Abamektin 18 g/L yang
 * terdaftar untuk trips di cabai, dosisnya 0,375 · 0,5 · 0,75 · 1 · 1,5 · 1–2 · 2 ml/l
 * — dan satu memakai `1 l/ha`. Dosis milik pendaftaran tiap produk.
 */

import { ambil, muatMeta, cacah, teks, tautanMasuk, pasangKembali } from './pustaka.js';

import { catatBuka, catatJawab, JENIS as UKUR } from './ukur.js';
import { pasangBatas } from './batas.js';
import { blokLapor, pasangLapor } from './lapor.js';
import { pasangTombolTema } from './tema.js';

pasangTombolTema();

catatBuka(1);

const el = {
  gejala: document.getElementById('gejala'),
  hasil: document.getElementById('hasil'),
  batas: document.getElementById('batasJawaban'),
};

document.getElementById('tanpaJs')?.remove();

let kamusLokal = [];
let bppWilayah = [];
let optKini = null;
let daftarOpt = null;
let saringInang = null;
let larangan = null;

const angkaId = (n) => Number(n).toLocaleString('id-ID');

// ---------------------------------------------------------------------------
// Layar 1 — daftar gejala
// ---------------------------------------------------------------------------
/* Penyaring tanaman — TIDAK WAJIB, dan itu bagian dari keputusannya.
 *
 * Tesis jalur ini masuk lewat APA YANG TERLIHAT, bukan lewat apa yang sudah diketahui;
 * memaksa pilih tanaman lebih dulu akan menukar pintu itu dengan pintu lain. Tetapi
 * daftarnya tumbuh tiap kurasi komoditas baru, dan penanam padi harus melewati puluhan
 * gejala tanaman lain sebelum sampai ke miliknya. Jalan tengahnya:
 * saringan ada, "semua tanaman" tetap yang terpilih saat layar dibuka, dan gejala tetap
 * yang tertulis besar pada tiap kartu.
 *
 * Disaring menurut `inang` — tanaman yang teksnya memang ditulis untuknya — bukan
 * menurut `di`, tempat produknya terdaftar. Keduanya berbeda dan bedanya menentukan:
 * hawar daun punya tujuh produk terdaftar di cabai sementara teksnya ditulis untuk
 * kentang dan tomat, dan menyodorkannya kepada penanam cabai adalah persis kekeliruan
 * yang aturan sebaran komoditas dipakai untuk mencegah.
 */
function daftarInang() {
  const c = new Map();
  for (const k of daftarOpt) for (const n of k.inang ?? []) c.set(n, (c.get(n) ?? 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function gambarGejala() {
  // Diurutkan menurut banyaknya produk terdaftar, bukan abjad: yang paling sering jadi
  // masalah paling sering dicari. Yang nol produk tetap ikut — justru layar itu yang
  // paling bernilai di seluruh jalur ini.
  const cocok = daftarOpt.filter((k) => !saringInang || (k.inang ?? []).includes(saringInang));
  const urut = cocok.slice().sort((a, b) => b.produk - a.produk);
  const inang = daftarInang();
  const cip = (nilai, label, n) => `
    <button type="button" data-inang="${teks(nilai)}" aria-pressed="${saringInang === (nilai || null)}">
      ${teks(label)} · ${angkaId(n)}
    </button>`;
  el.gejala.innerHTML = `
    ${inang.length > 1 ? `
      <div class="preset" role="group" aria-label="Saring menurut tanaman">
        ${cip('', 'Semua tanaman', daftarOpt.length)}
        ${inang.map(([n, j]) => cip(n, n, j)).join('')}
      </div>` : ''}
    <ul class="daftar">
      ${urut.map((k) => `
        <li>
          <button type="button" data-opt="${teks(k.id)}">
            <span class="nama">${teks(k.gejala)}</span>
            <span class="sub">${k.komoditas
              ? `${angkaId(k.produk)} produk terdaftar di ${angkaId(k.komoditas)} komoditas`
              : 'tidak ada produk terdaftar sama sekali'}</span>
          </button>
        </li>`).join('')}
    </ul>`;
}

/* C3 — OPT registri, dimasuki lewat NAMA dan bukan lewat gejala.
 *
 * Ratusan OPT registri punya produk terdaftar dan nol punya teks gejala. Sampai sekarang
 * tidak satu pun bisa dicapai dari kotak beranda; yang tahu nama hamanya dijawab nol.
 *
 * TIDAK ADA BLOK "PASTIKAN DULU" DI SINI, DAN ITU BUKAN KELALAIAN. Blok itu ada karena
 * yang masuk lewat gejala sedang menebak, dan dua ciri yang bisa diperiksa sendiri
 * menahan tebakan itu. Untuk OPT ini cirinya memang tidak ada — mengarangnya persis yang
 * ditolak jalur ini. Yang bisa dilakukan layar mengatakan apa yang TIDAK bisa
 * dipastikannya, bukan diam-diam melepas penjagaannya.
 */
async function bukaHama(kunci, opsi = {}) {
  el.hasil.innerHTML = '<p class="kosong">Mengambil…</p>';
  el.hasil.focus();
  try {
    const h = await ambil(`opt-nama/${kunci}`);
    terbukaKini = { id: h.id, nama: h.nama, tautan: tautanKe(`?hama=${encodeURIComponent(kunci)}`) };
    el.hasil.innerHTML = `
      <div class="kartu peringatan">
        <h2>Kamu masuk lewat nama, bukan gejala</h2>
        <p>
          <strong>${teks(h.nama)}</strong>${h.ilmiah ? ` (<em>${teks(h.ilmiah)}</em>)` : ''} ada di
          registri sebagai sasaran pendaftaran, tetapi <strong>registri tidak memuat
          deskripsi gejalanya</strong> — nol dari ${angkaId(cacah('optRegistriBerproduk') ?? 0)}
          OPT berproduk memuatnya.
        </p>
        <p class="catatan">
          Artinya layar ini <strong>tidak bisa membantu memastikan</strong> bahwa hama ini
          yang ada di kebunmu. Tidak ada dua ciri pembanding untuk diperiksa sendiri, dan
          mengarangnya berarti mengubah daftar pendaftaran jadi diagnosis. Yang di bawah
          hanya <em>apa yang terdaftar untuk nama ini</em> — bukan anjuran, dan bukan
          pemastian. Kalau yang kamu punya baru gejalanya,
          <a href="beranda.html">mulai dari apa yang terlihat</a> —
          ${angkaId(cacah('optTerkurasi') ?? 0)} OPT pada
          ${angkaId(cacah('optKomoditasBerpintu') ?? 0)} komoditas punya ciri pembandingnya.
        </p>
      </div>
      <h2 class="judul-bagian">Di tanaman apa?</h2>
      <p class="bantuan">
        Terdaftar pada ${h.di.length} komoditas. Pilih satu untuk melihat bahan aktif yang
        terdaftar untuknya di tanaman itu.
      </p>
      <ul class="daftar">
        ${h.di.map((d) => `
          <li>
            <button type="button" data-berkas="${teks(d.b)}">
              <span class="nama">${teks(d.k)}</span>
              <span class="sub">${angkaId(d.p)} produk terdaftar</span>
            </button>
          </li>`).join('')}
      </ul>
      <button type="button" class="kembali" id="kembali">← Pilih gejala lain</button>`;
    catatJawab(1, UKUR.isi);
    pasangKembali(el.hasil, { gulirKe: el.gejala });
    await bukaTertunjuk(h.di.map((d) => d.b), opsi);
  } catch (e) {
    catatJawab(1, UKUR.gagal);
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Gagal mengambil datanya</h2>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
}

/* Komoditas yang ikut disebut penunjuk — dipakai tautan OPT di jalur 2, yang memang
 * datang dari satu baris "tanaman + OPT" dan bukan dari nama OPT saja.
 *
 * Yang dibuka BUKAN berkas dari bilah alamat. Kuncinya dicocokkan dengan daftar
 * komoditas yang dibawa rekaman OPT-nya, dan berkas yang dipakai berkas dari daftar
 * itu; kunci yang tidak ada di daftar tidak membuka apa pun dan layarnya berhenti di
 * daftar komoditas — persis seperti masuk tanpa penunjuk.
 *
 * `gulir` mati saat datang dari tautan luar, dan itu bukan kesopanan. Layar ini
 * membuka dengan kartu penjagaannya — "pastikan dulu", atau "kamu masuk lewat nama" —
 * dan menggulir langsung ke daftar bahan melompatinya tanpa suara. Yang mengetuk dari
 * daftar di halaman yang sama sudah membacanya; yang mendarat dari halaman lain belum.
 */
async function bukaTertunjuk(berkasAda, { kom, gulir = true } = {}) {
  if (!kom) return;
  const berkas = berkasAda.find((b) => b.split('/')[1] === kom);
  if (!berkas) return;
  await bukaKomoditas(berkas, { gulir });
}

/* C8 — masuk dari TANAMAN, dan yang keluar direktori, bukan dugaan.
 *
 * Pintu ketiga jalur ini, dan janjinya paling sempit dari ketiganya. Yang masuk lewat
 * gejala sedang menebak dan ditahan blok "pastikan dulu"; yang masuk lewat nama hama
 * sudah punya dugaan dan ditahan kartu "kamu masuk lewat nama". Yang masuk lewat nama
 * tanaman belum menyebut masalah apa pun — ia cuma bertanya apa saja yang terdaftar
 * untuk tanamannya. Layar ini menjawab persis itu dan berhenti di situ.
 *
 * URUTANNYA MENURUT BANYAKNYA PRODUK TERDAFTAR, DAN ITU BUKAN URUTAN ANCAMAN. Banyaknya
 * produk mengukur ramainya pendaftaran, bukan seringnya hama itu datang ke kebun. Yang
 * teratas belum tentu yang akan menyerang, dan yang paling bawah bukan yang paling
 * jarang. Dinyatakan di layar, sebab daftar terurut selalu terbaca sebagai peringkat.
 *
 * NAMA INDONESIA DI SINI NAMA KELOMPOK, REKAMANNYA SPESIES. Jagung punya 146 entri OPT
 * dengan 29 nama berbeda: enam puluh dua di antaranya sama-sama berlabel "Gulma Berdaun
 * Lebar", dan yang membedakannya nama ilmiahnya. Menyajikannya apa adanya mengulang satu
 * baris 62 kali dan terbaca sebagai data rusak; menyatukannya jadi satu baris menyembunyikan
 * bahwa dosis dan mereknya memang terdaftar per spesies. Jadi dikelompokkan menurut namanya,
 * dan yang beranggota lebih dari satu dibuka untuk melihat spesiesnya.
 */
function kelompokOpt(daftar) {
  const peta = new Map();
  for (const o of daftar) {
    if (!peta.has(o.nama)) peta.set(o.nama, []);
    peta.get(o.nama).push(o);
  }
  return [...peta.entries()]
    .map(([nama, anggota]) => ({
      nama,
      anggota: anggota.slice().sort((a, b) => b.produk - a.produk || (a.ilmiah ?? '').localeCompare(b.ilmiah ?? '')),
      produk: anggota.reduce((a, b) => a + b.produk, 0),
    }))
    .sort((a, b) => b.produk - a.produk || a.nama.localeCompare(b.nama));
}

/* Yang ditulis besar berbeda menurut letaknya, dan itu bukan gaya.
 *
 * Berdiri sendiri, yang dikenali pembaca nama Indonesianya: "Ulat Grayak", bukan
 * "Spodoptera frugiperda". Nama ilmiahnya menyusul sebagai keterangan — berguna, tetapi
 * bukan yang dicari mata.
 *
 * Di dalam kelompok, kebalikannya: nama Indonesianya sudah jadi kepala kartunya, dan
 * mengulangnya 62 kali di dalam kartu yang sudah menyebutnya tidak memberi tahu apa pun.
 * Di situ yang membedakan justru spesiesnya, jadi spesiesnya yang naik.
 *
 * Sebagian rekaman memakai nama ilmiah sebagai nama Indonesianya sekalian — "Locusta
 * migratoria" pada keduanya. Keterangannya dihilangkan saat itu terjadi, sebab baris yang
 * menyebut satu nama dua kali terbaca sebagai kekeliruan.
 */
function barisOpt(o, { utama = 'nama' } = {}) {
  const beda = o.ilmiah && o.ilmiah !== o.nama;
  const kepala = utama === 'ilmiah' && o.ilmiah ? `<em>${teks(o.ilmiah)}</em>` : teks(o.nama);
  const sub = [
    `${angkaId(o.produk)} produk terdaftar`,
    utama === 'nama' && beda ? `<em>${teks(o.ilmiah)}</em>` : null,
  ].filter(Boolean).join(' · ');
  return `
    <button type="button" data-berkas="${teks(o.berkas)}">
      <span class="nama">${kepala}</span>
      <span class="sub">${sub}</span>
    </button>`;
}

function kartuKelompok(k, i) {
  if (k.anggota.length === 1) return `<li>${barisOpt({ ...k.anggota[0], nama: k.nama })}</li>`;
  // Bentuknya sengaja sama dengan kartu bahan di bawah: kepala yang bisa diketuk, isi
  // yang menyusul. Keduanya menyatakan hal yang sama — sekian rekaman di balik satu
  // nama — dan memberinya dua rupa membuat orang mengira keduanya berbeda.
  return `
    <li>
      <div class="kartu bahan">
        <button type="button" class="bahan-kepala" data-kelompok="${i}" aria-expanded="false"
                aria-controls="kelompok-${i}">
          <span class="bahan-nama">${teks(k.nama)}</span>
          <span class="bahan-jumlah">${angkaId(k.anggota.length)} spesies · ${angkaId(k.produk)} produk</span>
        </button>
        <div class="bahan-isi" id="kelompok-${i}" hidden>
          <p class="catatan">
            Registri mencatatnya sebagai <strong>${angkaId(k.anggota.length)} rekaman terpisah</strong>
            yang semuanya berlabel “${teks(k.nama)}”. Yang membedakannya spesiesnya, dan
            dosis serta mereknya terdaftar per spesies — bukan per nama kelompok.
          </p>
          <ul class="daftar">${k.anggota.map((o) => `<li>${barisOpt(o, { utama: 'ilmiah' })}</li>`).join('')}</ul>
        </div>
      </div>
    </li>`;
}

async function bukaTanaman(kunci, { gulir = true } = {}) {
  el.hasil.innerHTML = '<p class="kosong">Mengambil…</p>';
  el.hasil.focus();
  try {
    const t = await ambil(`opt/${kunci}`);
    terbukaKini = { id: t.komoditas, nama: t.nama, tautan: tautanKe(`?kom=${encodeURIComponent(kunci)}`) };
    kelompokKini = kelompokOpt(t.opt);
    const produk = t.opt.reduce((a, o) => a + o.produk, 0);
    const berkelompok = kelompokKini.filter((k) => k.anggota.length > 1);
    el.hasil.innerHTML = `
      <div class="kartu peringatan">
        <h2>Ini daftar pendaftaran, bukan dugaan</h2>
        <p>
          Registri mencatat <strong>${angkaId(t.opt.length)} sasaran pendaftaran</strong> pada
          <strong>${teks(t.nama)}</strong>, di bawah ${angkaId(kelompokKini.length)} nama, dengan
          ${angkaId(produk)} produk terdaftar seluruhnya.
        </p>
        <p class="catatan">
          Yang di bawah <strong>apa yang boleh didaftarkan untuk tanaman ini</strong> — bukan apa
          yang sedang menyerangnya, dan bukan apa yang perlu dibeli. Urutannya menurut banyaknya
          produk terdaftar, dan itu <strong>mengukur ramainya pendaftaran, bukan seringnya hama
          itu datang</strong>. Kalau yang kamu punya sudah berupa gejala,
          <a href="beranda.html">mulai dari apa yang terlihat</a> — di situ ada dua ciri
          pembanding yang bisa diperiksa sendiri, dan layar ini memang tidak punya.
        </p>
      </div>
      ${berkelompok.length ? `
        <p class="bantuan">
          ${angkaId(berkelompok.length)} nama di antaranya dipegang lebih dari satu rekaman —
          nama Indonesianya nama kelompok, rekamannya spesies. Ketuk untuk melihat spesiesnya.
          Pengelompokannya menurut <strong>ejaan persis di registri</strong>, jadi dua nama
          yang nyaris sama tetap jadi dua baris; halaman ini tidak menyatukan apa yang
          registri pisahkan.
        </p>` : ''}
      <ul class="daftar">${kelompokKini.map(kartuKelompok).join('')}</ul>
      <button type="button" class="kembali" id="kembali">← Pilih gejala lain</button>`;
    catatJawab(1, t.opt.length ? UKUR.isi : UKUR.nol);
    pasangKembali(el.hasil, { gulirKe: el.gejala });
    if (gulir) el.hasil.scrollIntoView({ block: 'start' });
  } catch (e) {
    catatJawab(1, UKUR.gagal);
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Gagal mengambil datanya</h2>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
}

// ---------------------------------------------------------------------------
// Blok "pastikan dulu" — sebelum apa pun yang bisa dibeli
// ---------------------------------------------------------------------------
function blokPastikan(k) {
  return `
    <div class="kartu pelepasan">
      <h2>Pastikan dulu</h2>
      <p>
        Dugaannya <strong>${teks(k.nama)}</strong>${k.ilmiah ? ` (<em>${teks(k.ilmiah)}</em>)` : ''}.
        Sebelum membeli apa pun, periksa dua hal ini sendiri:
      </p>
      <ol class="periksa">
        ${k.pembanding.map((p) => `
          <li>
            ${teks(p.cek)}
            ${p.membantah ? `<span class="sub">Kalau tidak cocok, kemungkinannya ${teks(p.membantah.label)}.</span>` : ''}
          </li>`).join('')}
      </ol>
      ${k.keterangan ? `<p class="catatan">${teks(k.keterangan)}</p>` : ''}
      ${k.catatan ? `<p class="catatan">${teks(k.catatan)}</p>` : ''}
      ${blokNamaLokal(k)}
    </div>`;
}

// Nama lokal ditempel di blok "pastikan dulu", bukan di judul layar. Alasannya sama
// dengan alasan blok ini ada: nama lokal tingkat D, dan menaruhnya sebagai judul
// membuatnya terbaca sebagai identifikasi. Di sini ia justru satu keterangan lagi yang
// harus dicocokkan pembaca — "orang menyebutnya begini; apakah itu yang kamu lihat?"
//
// Yang bertaksa menyebut apa yang tidak dibedakannya. Wilayah selalu ikut disebut,
// termasuk saat tidak diketahui: kamus yang diam soal wilayah menyodorkan nama satu
// daerah kepada seluruh negeri.
function blokNamaLokal(k) {
  const cocok = kamusLokal.filter((x) => x.ke.some((r) => r.i === k.id));
  if (!cocok.length) return '';
  const taksa = cocok.filter((x) => x.ke.length > 1);
  return `
    <p class="catatan nama-lokal">
      <strong>Sebagian orang menyebutnya
      ${cocok.map((x) => `“${teks(x.n)}”`).join(', ')}.</strong>
      Dari satu jawaban lapangan, belum ditinjau penyuluh, dan
      <strong>belum diketahui dipakai di daerah mana</strong> — jadi nama ini bukan
      penentu, melainkan satu petunjuk lagi untuk dicocokkan.
      ${taksa.length ? teks(taksa[0].taksa) : ''}
    </p>`;
}

// ---------------------------------------------------------------------------
// Cabang nol produk — layar terpenting di jalur ini
// ---------------------------------------------------------------------------
// Nol produk untuk virus adalah KEBENARAN AGRONOMI, bukan lubang data: tidak ada
// pestisida yang menyembuhkan virus. Kios akan tetap menjual sesuatu — hampir pasti
// insektisida — dan uang keluar sementara tanaman tetap mati. Di sinilah halaman ini
// punya nilai yang tidak bisa ditandingi siapa pun yang hidup dari margin penjualan:
// kemampuan berkata "jangan beli apa-apa untuk ini".
function blokNolProduk(k) {
  // Penular datang dari entitasnya (`vector` pada pest.json), bukan dari pencocokan nama
  // pada blok pembanding. Yang lama mencari /kutu kebul/i di antara OPT yang DIBANTAH,
  // dan itu keliru dua kali: rules_out menyatakan apa yang terbantah, bukan apa yang
  // menularkan — pada virus kuning keriting daftarnya memuat trips, yang tidak menularkan
  // apa pun — dan begitu virus kedua masuk (mosaik bawang, penularnya kutu daun persik)
  // tombolnya hilang tanpa ada yang menyalak.
  const vektor = k.penular;
  return `
    <div class="kartu tabrakan">
      <h2>Jangan beli apa pun untuk ini</h2>
      <p>
        <strong>Tidak satu pun pestisida terdaftar menyembuhkan ${teks(k.nama.toLowerCase())}.</strong>
        Itu bukan kekurangan data — itu kenyataan: yang sudah terinfeksi tidak bisa
        disembuhkan dengan semprotan apa pun.
      </p>
      <p class="catatan">
        Kios kemungkinan besar tetap akan menjual sesuatu, hampir pasti insektisida.
        Uang keluar, tanaman tetap mati.
      </p>
    </div>
    <div class="kartu">
      <h2>Yang justru berpengaruh</h2>
      <ol class="periksa">
        <li>Cabut dan musnahkan tanaman yang sudah terinfeksi, jangan dibiarkan jadi sumber penularan.</li>
        <li>Kendalikan serangga penularnya pada tanaman yang <em>belum</em> terkena — itu yang masih bisa diselamatkan.</li>
        <li>Musim depan, pilih varietas tahan dan pasang perangkap sejak awal.</li>
      </ol>
      ${vektor ? `
        <p class="catatan">
          Penularnya <strong>${teks(vektor.label)}</strong>, dan untuk itu memang ada produk terdaftar.
        </p>
        <button type="button" class="kembali" data-opt="${teks(vektor.id)}">
          Lihat yang terdaftar untuk ${teks(vektor.label)} →
        </button>` : ''}
    </div>`;
}

// ---------------------------------------------------------------------------
// Pilih komoditas
// ---------------------------------------------------------------------------
function blokKomoditas(k) {
  const urut = k.di.slice().sort((a, b) => b.produk - a.produk);
  return `
    <div class="kartu">
      <h2>Di tanaman apa?</h2>
      <p class="catatan">
        Yang terdaftar berbeda-beda menurut tanamannya. Di luar daftar ini,
        <strong>tidak ada produk yang terdaftar</strong> untuk ${teks(k.nama.toLowerCase())}.
      </p>
      <ul class="daftar">
        ${urut.map((d) => `
          <li>
            <button type="button" data-berkas="${teks(d.berkas)}">
              <span class="nama">${teks(d.nama)}</span>
              <span class="sub">${angkaId(d.produk)} produk terdaftar</span>
            </button>
          </li>`).join('')}
      </ul>
    </div>`;
}

// ---------------------------------------------------------------------------
// Kartu bahan + kadar
// ---------------------------------------------------------------------------
function blokLaranganRingkas(grup, produkKena) {
  const kena = grup.filter((g) => g.larangan || g.laranganLain);
  if (!kena.length) return '';
  const berlaku = kena.filter((g) => g.larangan);
  const lain = kena.filter((g) => !g.larangan && g.laranganLain);
  // Didedup menurut ZAT, bukan menurut kartu: satu bahan muncul di beberapa kartu
  // kadar, dan larangannya melekat pada bahannya — mengulangnya sekali per kadar
  // membuat tabelnya berlipat tanpa menambah satu keterangan pun. Nama peraturannya
  // dipindah ke kaki, sama seperti di jalur 2: di layar HP kolom itu membungkus jadi
  // beberapa baris dan menenggelamkan lingkup larangan.
  const instrumen = new Set();
  const sudah = new Set();
  const baris = [];
  for (const g of lain) {
    if (sudah.has(g.zat)) continue;
    sudah.add(g.zat);
    for (const r of larangan[g.zat] ?? []) {
      if (r.instrumen) instrumen.add(r.instrumen);
      const lingkup = r.menyeluruh
        ? 'seluruh bidang penggunaan pestisida'
        : (r.komoditasNama.length ? r.komoditasNama.join(', ') : r.lingkup.join(', '));
      baris.push(`<tr><td>${teks(g.nama)}</td><td>${teks(lingkup)}</td><td>${teks((r.kutipan ?? '—').replace(/^Lampiran\s+/, ''))}</td></tr>`);
    }
  }
  return `
    <div class="kartu ${berlaku.length ? 'tabrakan' : 'peringatan'}">
      <h2>Bahan yang ada larangannya</h2>
      ${berlaku.length ? `
        <p>
          <strong>${berlaku.length} bahan di daftar bawah dilarang untuk tanaman ini.</strong>
          Produk yang memuatnya tidak boleh dipakai di sini.
        </p>` : ''}
      ${lain.length ? `
        <p>
          ${sudah.size} bahan di daftar bawah <strong>tercantum di daftar larangan, tetapi
          untuk hal lain</strong> — bukan untuk tanaman ini:
        </p>
        <div class="pembungkus-tabel">
          <table>
            <thead><tr><th>Bahan</th><th>Dilarang untuk</th><th>Pasal</th></tr></thead>
            <tbody>${baris.join('')}</tbody>
          </table>
        </div>
        <p class="catatan">Dasar: ${teks([...instrumen].join('; ')) || '—'}.</p>
        <p class="catatan">
          Ditampilkan apa adanya beserta lingkupnya. Menulis “dilarang” tanpa menyebut
          untuk apa adalah pernyataan yang tidak benar; menyembunyikannya lebih buruk lagi.
        </p>` : ''}
      ${produkKena ? `<p class="catatan">${angkaId(produkKena)} produk terdaftar memuat salah satunya.</p>` : ''}
    </div>`;
}

function kartuBahan(g, i) {
  const jumlah = Array.isArray(g.merek) ? g.merek.length : g.merek;
  return `
    <div class="kartu bahan">
      <button type="button" class="bahan-kepala" data-buka="${i}" aria-expanded="false">
        <span class="bahan-nama">${teks(g.nama)} ${teks(g.kadar)}</span>
        <span class="bahan-jumlah">${angkaId(jumlah)} merek</span>
        ${g.larangan ? '<span class="tanda-larangan">dilarang di sini</span>'
          : g.laranganLain ? '<span class="tanda-syarat">ada larangan lain</span>' : ''}
      </button>
      <div class="bahan-isi" id="bahan-${i}" hidden></div>
    </div>`;
}

/* Petak kemasan di depan nama merek.
 *
 * Yang tidak punya gambar TIDAK dibiarkan kosong melompong. 15% dari baris merek punya
 * gambar, jadi keadaan yang lazim justru yang tanpa — dan sederet sel kosong di antara
 * yang bergambar terbaca sebagai "yang ini yang meragukan", padahal artinya cuma situs
 * pemegangnya belum dipanen. Petak bergaris putus-putus menempati ruang yang sama,
 * sehingga barisnya sejajar dan tidak ada yang tampak tersisih.
 *
 * `alt` sengaja kosong: namanya persis di sebelahnya, di dalam tautan yang sama.
 * Membacakan "Kemasan MATROS 18 EC" lalu "MATROS 18 EC" menggandakan tiap baris tabel
 * bagi yang memakai pembaca layar.
 */
const petakKemasan = (m) => (m.g
  ? `<img class="merek-kemasan" src="gambar/${teks(m.g)}" alt="" width="40" height="40"
          loading="lazy" decoding="async">`
  : '<span class="merek-kemasan merek-kemasan-kosong" aria-hidden="true"></span>');

/* Nama merek jadi tautan ke rincian produknya di jalur 2.
 *
 * Sampai sekarang tabel ini buntu: ia menyebut nama, nomor, dan dosis, lalu berhenti.
 * Yang mau tahu isinya — bahan lain di dalamnya, pemegang pendaftarannya, merek lain
 * berisi sama — harus menyalin namanya ke kotak cari di halaman lain, dan nama terdaftar
 * jarang persis sama dengan yang diingat orang.
 *
 * Pecahannya dibawa rekamannya sendiri (`m.p`). Kalau tidak ada, namanya tetap tampil
 * sebagai teks biasa: tautan yang mendarat di layar gagal lebih buruk daripada nama yang
 * memang cuma nama.
 */
const namaMerek = (m) => {
  const isi = `${petakKemasan(m)}<span class="merek-nama">${teks(m.nama)}</span>`;
  if (!m.p) return `<span class="merek-tautan">${isi}</span>`;
  const alamat = `index.html?${new URLSearchParams({ id: m.id, pecahan: m.p })}`;
  return `<a class="merek-tautan" href="${teks(alamat)}">${isi}</a>`;
};

function tabelMerek(merek) {
  return `
    <p class="catatan">
      Diurutkan menurut <strong>nomor pendaftaran menaik</strong> — tanpa peringkat,
      tanpa slot berbayar. Nomornya ada di kolom sebelah, jadi urutannya bisa diperiksa
      sendiri. <strong>Dosisnya berbeda-beda walau isinya sama</strong>, karena dosis
      milik pendaftaran tiap produk.
    </p>
    <div class="pembungkus-tabel">
      <table>
        <thead><tr><th>Merek</th><th>Nomor pendaftaran</th><th>Berlaku sampai</th><th>Dosis terdaftar</th></tr></thead>
        <tbody>${merek.map((m) => `
          <tr><td>${namaMerek(m)}</td><td class="angka">${teks(m.daftar ?? '—')}</td>
              <td class="angka">${teks(m.berlaku ?? '—')}</td>
              <td class="angka">${teks(m.dosis ?? '—')}</td></tr>`).join('')}</tbody>
      </table>
    </div>
    <p class="catatan">
      Nama merek membuka rinciannya: bahan lain di dalamnya, pemegang pendaftarannya, dan
      merek lain yang isinya sama persis. <strong>Gambar kemasan bukan bukti apa pun
      tentang barang di tangan</strong> — desainnya berubah, dan pemalsu menyalin desain;
      yang dibandingkan sebaiknya kandungan yang tercetak. Petak bergaris putus-putus
      berarti gambarnya belum dipanen dari situs pemegang pendaftarannya,
      <em>bukan</em> berarti produknya meragukan.
    </p>`;
}

// ---------------------------------------------------------------------------
let kartuKini = null;
let kelompokKini = null;

/* Rekaman yang sedang terbuka, dibaca blok sanggahan (B3) SAAT DIKETUK. Blok batas
 * digambar sekali saat halaman muat, sementara rekamannya dibuka jauh sesudahnya —
 * jadi yang diserahkan ke sana pembacanya, bukan nilainya. */
let terbukaKini = null;
const tautanKe = (q) => new URL(q, location.href).href;



async function bukaKomoditas(berkas, { gulir = true } = {}) {
  el.hasil.querySelector('#daftarBahan')?.remove();
  const r = await ambil(berkas);
  const semuaGrup = [r.grup, ...(await Promise.all((r.kartuDi ?? []).map((x) => ambil(x))))].flat();
  kartuKini = { berkas, grup: semuaGrup };

  // Jumlahnya dibaca dari indeks, TIDAK dihitung ulang dari keanggotaan kartu: pada
  // OPT terpadat daftar mereknya dikeluarkan ke berkas terpisah, dan menghitung ulang
  // di sini menghasilkan nol.
  const bagian = document.createElement('div');
  bagian.id = 'daftarBahan';
  bagian.innerHTML = `
    <div class="kartu sorot">
      <p class="angka-besar">${angkaId(r.produk)}</p>
      <p class="angka-label">produk terdaftar untuk ${teks(r.optNama)} di ${teks(r.komoditasNama)}</p>
      <p class="catatan">
        Isinya hanya <strong>${angkaId(r.zat)} bahan aktif</strong> berbeda, yang jatuh jadi
        <strong>${angkaId(r.kartu)} kartu bahan + kadar</strong>. Menampilkan ratusan nama
        dagang adalah menyalin kebingungan kios ke dalam layar.
      </p>
    </div>
    ${blokLaranganRingkas(semuaGrup, r.berlarangan)}
    <h2 class="judul-bagian">Bahan aktif dan kadarnya</h2>
    <p class="catatan">
      Diurutkan menurut banyaknya produk. Kesetaraan hanya benar pada pasangan
      <strong>bahan + kadar</strong>: satu bahan bisa dipakai pada belasan kadar yang
      berbeda, dan kadarnya menentukan.
    </p>
    ${semuaGrup.slice(0, 12).map(kartuBahan).join('')}
    ${semuaGrup.length > 12 ? `<p class="catatan">Ditampilkan 12 kartu teratas dari ${angkaId(semuaGrup.length)}.</p>` : ''}`;
  el.hasil.appendChild(bagian);
  if (gulir) bagian.scrollIntoView({ block: 'start' });
}

/* Satu id OPT, dua ruang id — dan yang MEMUTUSKAN ruangnya di sini, bukan pemanggilnya.
 *
 * Beranda memang tahu ruangnya: entri yang dibukanya datang dari kepala pencarian, yang
 * sudah menyebut jenisnya, jadi ia memakai `opt=` untuk yang terkurasi dan `hama=` untuk
 * yang registri. Jalur 2 tidak tahu: yang dipegangnya satu baris penggunaan berlabel yang
 * hanya menyebut `op:pst:…`, dan registri tidak menandai mana yang kebetulan ikut
 * terkurasi. Memaksa jalur 2 menebak berarti menyuruhnya mengarang — persis yang ditolak
 * kedua jalur.
 *
 * Jadi `opt=` menerima id apa pun dan menjatuhkannya ke pintu yang benar. Daftar
 * terkurasinya sudah ada di ingatan sejak halaman muat, jadi keputusannya tidak
 * menambah satu perjalanan pun, dan yang bukan anggotanya tidak pernah dicari sebagai
 * teks gejala.
 */
async function bukaOpt(id, opsi = {}) {
  const k = daftarOpt.find((x) => x.id === id);
  if (!k) return bukaHama(id.replace(/[^a-z0-9]/gi, ''), opsi);
  terbukaKini = { id: k.id, nama: k.nama, tautan: tautanKe(`?opt=${encodeURIComponent(k.id)}`) };
  optKini = k;
  el.hasil.innerHTML = '<p class="kosong">Menyiapkan…</p>';
  el.hasil.focus();
  try {
    if (!larangan) larangan = await ambil('larangan');
    // Rincian pintu — ciri pembanding, keterangan, catatan, penular — hidup di pecahannya
    // sendiri sejak indeks gejala melewati anggaran 48 KB. Diambil saat pintu dibuka,
    // sekali per pintu: `ambil` mengingat janjinya, dan hasilnya dilebur ke entri daftar
    // supaya sisa berkas ini tidak perlu tahu bahwa datanya datang dari dua tempat.
    if (!k.rinci) {
      Object.assign(k, await ambil(`gejala/${k.id.replace(/[^a-z0-9]/gi, '')}`));
      k.rinci = true;
    }
    el.hasil.innerHTML = blokPastikan(k) + blokLapor(k) +
      (k.di.length ? blokKomoditas(k) : blokNolProduk(k)) +
      '<button type="button" class="kembali" id="kembali">← Pilih gejala lain</button>';
    catatJawab(1, k.di.length ? UKUR.isi : UKUR.nol);
    pasangKembali(el.hasil, { gulirKe: el.gejala });
    if (opsi.kom) await bukaTertunjuk(k.di.map((d) => d.berkas), opsi);
    // Kalau hanya satu komoditas, langsung buka — satu ketukan lebih sedikit.
    else if (k.di.length === 1) await bukaKomoditas(k.di[0].berkas, { gulir: opsi.gulir ?? true });
  } catch (e) {
    catatJawab(1, UKUR.gagal);
    el.hasil.innerHTML = `<div class="kartu peringatan"><h2>Gagal mengambil datanya</h2>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
}

el.gejala.addEventListener('click', (ev) => {
  const t = ev.target.closest('button[data-opt]');
  if (t) return bukaOpt(t.dataset.opt);

  const s = ev.target.closest('button[data-inang]');
  if (s) {
    saringInang = s.dataset.inang || null;
    gambarGejala();
    el.gejala.querySelector('button[aria-pressed="true"]')?.focus();
  }
});

el.hasil.addEventListener('click', async (ev) => {
  const opt = ev.target.closest('button[data-opt]');
  if (opt) return bukaOpt(opt.dataset.opt);

  const kom = ev.target.closest('button[data-berkas]');
  if (kom) return bukaKomoditas(kom.dataset.berkas);

  // Kelompok nama di layar tanaman. Isinya sudah tergambar — yang dibawa berkas
  // komoditas memang seluruh daftarnya — jadi ini murni buka-tutup, tanpa pengambilan.
  const kel = ev.target.closest('button[data-kelompok]');
  if (kel) {
    const isi = document.getElementById(`kelompok-${kel.dataset.kelompok}`);
    isi.hidden = !isi.hidden;
    kel.setAttribute('aria-expanded', String(!isi.hidden));
    return;
  }

  const buka = ev.target.closest('button[data-buka]');
  if (!buka) return;
  const i = Number(buka.dataset.buka);
  const isi = document.getElementById(`bahan-${i}`);
  if (!isi.hidden) { isi.hidden = true; buka.setAttribute('aria-expanded', 'false'); return; }
  const g = kartuKini.grup[i];
  isi.innerHTML = '<p class="kosong">Mengambil daftar mereknya…</p>';
  isi.hidden = false;
  buka.setAttribute('aria-expanded', 'true');
  // Daftar merek pada OPT terpadat dikeluarkan ke berkas sendiri; kartu yang lain
  // membawanya langsung. Penyaji cukup memeriksa satu medan.
  const merek = Array.isArray(g.merek) ? g.merek : (await ambil(g.merekDi))[g.kunci];
  isi.innerHTML = tabelMerek(merek);
});

pasangLapor(el.hasil, () => optKini, () => bppWilayah, (k) => ambil(`bpp/${k}`));

(async function mulai() {
  try {
    // Dua pengambilan sekaligus, bukan berurutan: kamusnya kecil dan tidak
    // menghalangi apa pun, tetapi kartu OPT butuh keduanya sudah ada.
    const [gejalaAda, lokalAda, bppAda] = await Promise.all([
      ambil('gejala'),
      ambil('nama-lokal').catch(() => []),
      // Daftar wilayah balai — 39 KB, dan hanya dipakai kalau pintu laporan dibuka.
      // Gagalnya tidak boleh menjatuhkan jalur ini: yang datang ke sini datang untuk
      // gejala, dan pintu laporan pelengkap.
      ambil('bpp-wilayah').catch(() => []),
    ]);
    daftarOpt = gejalaAda;
    kamusLokal = lokalAda;
    bppWilayah = bppAda;
    const berpintu = daftarOpt.filter((k) => k.adaPintu);
    if (berpintu.length < daftarOpt.length) {
      el.gejala.innerHTML = `<p class="catatan">${daftarOpt.length - berpintu.length} OPT
        terkurasi belum punya teks gejala dan tidak bisa dimasuki dari sini.</p>`;
    }
    daftarOpt = berpintu;
    gambarGejala();
    // Dua sumber dengan tingkat bukti yang berbeda jauh, dan justru layar ini yang
    // paling perlu memisahkannya: sisi gejalanya belum ditinjau siapa pun, sisi bahan
    // aktifnya registri resmi. Meratakan keduanya jadi satu kalimat "sumber: Kementan"
    // meminjamkan wibawa registri kepada kurasi yang belum punya.
    await muatMeta();
    pasangBatas(el.batas, {
      sumber: [
        { dari: 'kurasiOpt', cakupan: `teks gejala dan dua ciri pembanding untuk ${berpintu.length} OPT cabai` },
        { dari: 'pestisida', cakupan: 'bahan aktif, kadar, dan merek yang terdaftar untuk OPT itu' },
        { dari: 'namaLokal', cakupan: `${kamusLokal.filter((x) => x.ke.length).length} nama daerah dari ${kamusLokal.length} yang tercatat, sebagai petunjuk tambahan — bukan sebagai penentu` },
      ],
      takDijawab: ['gejalaOpt', 'wilayahNamaLokal', 'phi', 'namaDagang'],
      sanggah: () => terbukaKini,
    });

    // Datang dari beranda dengan satu gejala sudah terpilih. Daftarnya tetap
    // digambar lebih dulu: yang dibuka lewat pencarian teks belum tentu yang
    // dimaksud, dan tombol "pilih gejala lain" harus mendarat pada sesuatu.
    const { opt, hama, kom } = tautanMasuk();
    const dariLuar = { kom, gulir: false };
    if (opt) await bukaOpt(opt, dariLuar);
    else if (hama) await bukaHama(hama, dariLuar);
    // `kom` sendirian berarti pertanyaannya tentang tanamannya, bukan tentang satu OPT
    // di tanaman itu. Bersama `opt` atau `hama` ia penunjuk; sendirian ia pintunya.
    else if (kom) await bukaTanaman(kom, { gulir: false });
  } catch (e) {
    el.gejala.innerHTML = `<div class="kartu peringatan"><h2>Indeks tidak ditemukan</h2>
      <p>Dibangun ulang dengan <code>node spec/tools/bangun-indeks.mjs --tulis</code>.</p>
      <p class="catatan">${teks(e.message)}</p></div>`;
  }
})();
