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

import { ambil, ambilPecahan, muatMeta, cacah, isiCacah, teks, tautanMasuk, pasangKembali, pesanGagalMuat, pasangCobaLagi, petakKemasan } from './pustaka.js';

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

// Judul "Apa yang kamu lihat?" milik pemilih gejala, dan ikut disembunyikan bersamanya.
const judulGejala = document.querySelector('.judul-bagian');

/* Lede ikut, dan alasannya sama dengan judul bagian: kalimatnya PERINTAH — "Pilih apa
 * yang kamu lihat, bukan nama hamanya" — untuk pemilih yang sedang tidak ada di layar.
 * Sampai 25 Agustus 2026 ia tetap tercetak di ketiga layar jawaban, termasuk yang masuk
 * lewat nama hama dan lewat tanaman, yang memang tidak pernah punya pemilih gejala. */
const lede = document.querySelector('.lede');

/* Judul dokumen ikut apa yang sedang terbuka — polanya sama dengan `harga.js`.
 * Tanpa ini, tab, riwayat, dan tautan yang dibagikan menyebut nama halaman untuk
 * kesepuluh gejala, ketujuh ratus OPT registri, dan kedua ratus tanaman sama saja. */
const JUDUL_HALAMAN = 'Tanaman bermasalah — Pranatani';
const judulJadi = (nama) => { document.title = nama ? `${nama} — Pranatani` : JUDUL_HALAMAN; };

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
/* Pemilih gejala dan jawabannya tidak pernah tampil bersamaan.
 *
 * Daftar gejalanya 1.729 px di ponsel 390 px, dan sampai 24 Agustus 2026 ia tetap penuh
 * di atas jawaban. Yang membuka tautan langsung ke satu OPT mendarat di gulir 1.731
 * dengan 377 px teratas berisi gejala yang tidak ia pilih — untuk OPT yang justru ia
 * sebut sendiri di URL. Ketiga pintu masuk (gejala, nama hama, tautan langsung) memanggil
 * ini, supaya ketiganya tidak berbeda diam-diam.
 *
 * Judul bagiannya ikut: "Apa yang kamu lihat?" bertanya tentang pemilih yang sedang
 * tidak ada, dan pertanyaan tanpa jawabannya lebih membingungkan daripada tidak ada.
 * Lede ikut karena alasan yang sama, dan lebih keras: ia memerintah, bukan bertanya. */
function tampilkanGejala(ya) {
  el.gejala.hidden = !ya;
  judulGejala.hidden = !ya;
  lede.hidden = !ya;
  // Membaca scrollHeight memaksa tata letak dihitung ulang sebelum pemanggil menggulir;
  // tanpa itu penggulirnya dijepit ke tinggi dokumen yang masih runtuh.
  if (ya) void document.documentElement.scrollHeight;
}

/* GAGAL AMBIL DATA TIDAK BOLEH JADI JALAN BUNTU — dan sampai 25 Agustus 2026 ia begitu.
 *
 * Ketiga pembuka memanggil `tampilkanGejala(false)` SEBELUM mengambil apa pun, supaya
 * jawaban tidak muncul di bawah 1.729 px daftar gejala. Kalau pengambilannya gagal,
 * blok tangkapnya dulu menulis kartu galat buatan sendiri dan berhenti di situ: pemilih
 * gejala tetap tersembunyi, tombol kembali tidak pernah terpasang, dan yang tersisa di
 * layar NOL tombol. Terukur langsung di peramban dengan `?kom=` yang tidak dikenal —
 * satu-satunya jalan keluar memuat ulang halaman, dan tidak ada di layar yang
 * mengatakannya.
 *
 * Yang dipakai sekarang `pesanGagalMuat()`, sama dengan pintu masuk halaman ini. Ia
 * membedakan luring dari 404 — cabang luring membawa tombol "Coba lagi", cabang 404
 * menurunkan petunjuk pemasangan ke konsol dan tidak menjanjikan apa pun kepada
 * pembaca. Pemilih gejalanya dikembalikan pada kedua cabang: pada 404 justru dialah
 * satu-satunya jalan keluar yang tersisa. */
function gagal(e) {
  catatJawab(1, UKUR.gagal);
  judulJadi(null);
  el.hasil.innerHTML = pesanGagalMuat(e);
  pasangCobaLagi(el.hasil);
  tampilkanGejala(true);
}

/* Tanaman yang disebut pintu-pintu yang ADA, beserta berapa pintu untuk masing-masing —
 * bahan cip penyaring di atas daftar gejala. Diurutkan menurut banyaknya pintu, bukan
 * abjad: yang paling banyak dijawab paling mungkin yang sedang dipegang orangnya.
 *
 * Dihitung dari daftar, tidak diambil dari kosakata komoditas: yang boleh muncul sebagai
 * saringan hanya tanaman yang benar-benar punya sesuatu di balik ketukannya. */
function daftarInang() {
  const c = new Map();
  for (const k of daftarOpt) for (const n of k.inang ?? []) c.set(n, (c.get(n) ?? 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/* JUDUL DULU, BARU KALIMAT PEMBEDANYA — dan judulnya tetap GEJALA.
 *
 * Kartunya dulu memuat seluruh teks gejala sebagai nama: tiga kalimat tebal, empat sampai
 * enam baris di ponsel, dikali sepuluh kartu. Memilih dari daftar berarti membandingkan,
 * dan yang dibandingkan di sana sepuluh paragraf — persis bentuk yang paling sulit dipindai
 * orang yang sedang berdiri di depan tanamannya.
 *
 * Judulnya BUKAN nama hamanya, dan itu keputusan rancangan pertama jalur ini: yang panik
 * tahu daunnya mengeriting ke atas, ia tidak tahu kata "trips". Nama hama sebagai judul
 * akan lebih pendek dan lebih rapi — dan akan membuat orang memilih menurut nama yang tidak
 * dikenalnya, bukan menurut apa yang dilihatnya. Keduanya terkurasi di `pest.json`
 * (`symptom_title`, `symptom_brief`), tidak dipotong dari teks penuhnya di sini.
 *
 * Teks gejala yang UTUH tidak hilang: ia tetap dirender layar rincian sesudah kartunya
 * dibuka, beserta blok "pastikan dulu". Yang berubah cuma apa yang dipakai MEMILIH. */
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
            <span class="nama">${teks(k.judul ?? k.gejala)}</span>
            ${k.judul && k.ringkas ? `<span class="gejala-ringkas">${teks(k.ringkas)}</span>` : ''}
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
  tampilkanGejala(false);
  try {
    const h = await ambil(`opt-nama/${kunci}`);
    terbukaKini = { id: h.id, nama: h.nama, tautan: tautanKe(`?hama=${encodeURIComponent(kunci)}`) };
    judulJadi(h.nama);
    pilihanKedua = { apa: 'tanaman lain', banyak: h.di.length };
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
          <button type="button" class="tautan-dalam" data-mulai-gejala>mulai dari apa
          yang terlihat</button> —
          ${angkaId(cacah('optTerkurasi') ?? 0)} OPT pada
          ${angkaId(cacah('optKomoditasBerpintu') ?? 0)} komoditas punya ciri pembandingnya.
        </p>
      </div>
      <h2 class="judul-bagian" id="pilihKedua">Di tanaman apa?</h2>
      <p class="bantuan">
        Terdaftar pada ${h.di.length} komoditas. Pilih satu untuk melihat bahan aktif yang
        terdaftar untuknya di tanaman itu.
      </p>
      ${blokPemilihTanaman(h.di.map((d) => ({ nama: d.k, berkas: d.b, produk: d.p })), 'hama')}
      <p class="catatan">${EJAAN_TERPISAH}</p>
      <button type="button" class="kembali" id="kembali">← Pilih gejala lain</button>`;
    catatJawab(1, UKUR.isi);
    pasangKembali(el.hasil, {
      gulirKe: el.gejala,
      sesudah: () => { tampilkanGejala(true); judulJadi(null); },
    });
    await bukaTertunjuk(h.di.map((d) => d.b), opsi);
  } catch (e) {
    gagal(e);
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
  tampilkanGejala(false);
  try {
    const t = await ambil(`opt/${kunci}`);
    terbukaKini = { id: t.komoditas, nama: t.nama, tautan: tautanKe(`?kom=${encodeURIComponent(kunci)}`) };
    judulJadi(t.nama);
    kelompokKini = kelompokOpt(t.opt);
    pilihanKedua = { apa: 'hama lain', banyak: kelompokKini.length };
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
          <button type="button" class="tautan-dalam" data-mulai-gejala>mulai dari apa
          yang terlihat</button> — di situ ada dua ciri pembanding yang bisa diperiksa
          sendiri, dan layar ini memang tidak punya.
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
      <ul class="daftar" id="pilihKedua">${kelompokKini.map(kartuKelompok).join('')}</ul>
      <button type="button" class="kembali" id="kembali">← Pilih gejala lain</button>`;
    catatJawab(1, t.opt.length ? UKUR.isi : UKUR.nol);
    pasangKembali(el.hasil, {
      gulirKe: el.gejala,
      sesudah: () => { tampilkanGejala(true); judulJadi(null); },
    });
    if (gulir) el.hasil.scrollIntoView({ block: 'start' });
  } catch (e) {
    gagal(e);
  }
}

// ---------------------------------------------------------------------------
// Gambar — dipasang pada kalimat yang diperlihatkannya
// ---------------------------------------------------------------------------
/* SEBAGIAN CIRI PEMBANDING PRAKTIS TIDAK BISA DISAMPAIKAN KALIMAT.
 *
 * "Cari anyaman benang halus di bawah daun, paling jelas kena sinar miring" benar dan
 * tetap tidak cukup: yang belum pernah melihatnya tidak tahu sehalus apa, dan akan
 * menyimpulkan tidak ada. Begitu juga untaian lendir pada uji gelas, dan titik hitam
 * yang tersusun melingkar sepusat di tengah bercak antraknosa. Gambar di sini bukan
 * hiasan — ia bagian dari ujinya.
 *
 * KARENA ITU LETAKNYA MENEMPEL PADA KALIMATNYA, BUKAN DIKUMPULKAN DI BAWAH. Galeri di
 * kaki halaman memaksa pembaca mencocokkan sendiri gambar mana untuk butir mana, dan
 * itu persis pekerjaan yang sedang dibantu. `cocok` dibawa dari data supaya penyaji
 * tidak menebaknya dari urutan — tebakan yang akan meleset begitu satu butir disisipkan.
 *
 * YANG SAMPAI KE SINI HANYA YANG BERKASNYA SUDAH ADA. bangun-indeks.mjs menyaring yang
 * `file.path`-nya kosong, jadi selama panen belum dijalankan `k.gambar` kosong dan
 * seluruh fungsi di bawah mengembalikan string kosong. Layar tanpa gambar jauh lebih
 * baik daripada layar dengan kotak rusak.
 */
function gambarnya(k, cocok) {
  return (k.gambar ?? []).filter((g) => g.cocok === cocok);
}

/* Kredit ikut terpasang bersama gambarnya, dan itu bukan kesopanan melainkan syarat.
 *
 * Kecuali CC0, seluruh lisensi yang lolos ke sini menuntut atribusi, dan atribusi yang
 * hilang MEMBATALKAN izin pakainya — gambar tanpa kreditnya adalah pelanggaran hak
 * cipta, bukan gambar yang kurang rapi. Menyimpannya di berkas terpisah membuatnya
 * hilang pada salinan pertama, jadi ia dirender di takarir yang sama.
 *
 * Tautan ke halaman sumbernya ikut, karena satu-satunya cara pembaca memeriksa apakah
 * gambar ini benar-benar memperlihatkan apa yang diklaimnya adalah membuka asalnya.
 */
// Tinggi terpakai dibatasi dengan MENYEMPITKAN gambarnya, bukan dengan memotongnya:
// foto tegak 900×1200 pada lebar penuh menjadi 512 px dan mendorong butir pemeriksaan
// berikutnya keluar layar telepon. Lebar yang menghasilkan tinggi TINGGI_MAKS dihitung
// dari rasionya sendiri, lalu diserahkan ke CSS sebagai `--lebar-gambar` — yang
// menyempit cuma gambarnya, sementara takarir di sebelahnya tetap memakai sisa ruang.
//
// Namanya `--lebar-gambar` dan bukan `--lebar` karena `--lebar` sudah dipakai :root
// untuk lebar halaman (44rem). Nilai fallback pada var() tidak akan pernah terpakai
// bila namanya bertabrakan — yang terwarisi nilai globalnya, diam-diam.
const TINGGI_MAKS = 20; // rem

function figurOpt(g) {
  const sempit = g.w && g.h && g.h > g.w
    ? ` style="--lebar-gambar:${(TINGGI_MAKS * g.w / g.h).toFixed(1)}rem"`
    : '';
  return `
    <figure class="gambar-opt${g.yakin === 'rendah' ? ' ragu' : ''}"${sempit}>
      <img src="${teks(g.f)}" alt="${teks(g.alt ?? '')}"
           ${g.w ? `width="${teks(g.w)}"` : ''} ${g.h ? `height="${teks(g.h)}"` : ''}
           loading="lazy" decoding="async">
      <figcaption>
        ${g.alt ? `<span class="tunjuk">${teks(g.alt)}</span>` : ''}
        ${g.yakin === 'rendah' ? `
          <span class="ragu-nota">Spesiesnya tidak dipastikan di sumbernya — pakai gambar
          ini untuk mengenali kelompoknya, bukan untuk memastikan spesiesnya.</span>` : ''}
        <span class="kredit">${teks(g.kredit ?? '')}</span>
      </figcaption>
    </figure>`;
}

// Peran yang tidak berpasangan dengan satu kalimat tertentu — organisme, kekeliruan,
// serangan lanjut — tetap berguna, tetapi tidak boleh menyela urutan pemeriksaan.
// Ia menyusul sesudah kedua butirnya selesai dibaca.
function stripGambar(k) {
  const dipakai = new Set(['symptom_title', 'distinguishing.0', 'distinguishing.1']);
  const sisa = (k.gambar ?? []).filter((g) => !dipakai.has(g.cocok));
  if (!sisa.length) return '';
  return `
    <div class="gambar-strip">
      <p class="strip-l">Gambar lain untuk dicocokkan</p>
      <div class="strip-isi">${sisa.map(figurOpt).join('')}</div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Blok "pastikan dulu" — sebelum apa pun yang bisa dibeli
// ---------------------------------------------------------------------------
function blokPastikan(k) {
  const utama = gambarnya(k, 'symptom_title');
  return `
    <div class="kartu pelepasan">
      <h2>Pastikan dulu</h2>
      <p>
        Dugaannya <strong>${teks(k.nama)}</strong>${k.ilmiah ? ` (<em>${teks(k.ilmiah)}</em>)` : ''}.
        Sebelum membeli apa pun, periksa dua hal ini sendiri:
      </p>
      ${utama.map(figurOpt).join('')}
      <ol class="periksa">
        ${k.pembanding.map((p, i) => `
          <li>
            ${teks(p.cek)}
            ${p.membantah ? `<span class="sub">Kalau tidak cocok, kemungkinannya ${teks(p.membantah.label)}.</span>` : ''}
            ${gambarnya(k, `distinguishing.${i}`).map(figurOpt).join('')}
          </li>`).join('')}
      </ol>
      ${stripGambar(k)}
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
/* EJAAN REGISTRI DIBIARKAN APA ADANYA, DAN PEMBACA DIBERI TAHU — bukan ditebakkan.
 *
 * Untuk trips, pemilih tanamannya menawarkan "Cabai" (246 produk), "Cabai merah" (5),
 * dan "Pembibitan Cabai" (1) sebagai tiga baris sederajat. Ketiganya entitas registri
 * yang berbeda dengan `key` sendiri — `cabai`, `cabai-merah`, `pembibitan-cabai` — dan
 * `satukan-komoditas-serumpun.mjs` tidak menyatukannya karena alat itu hanya melepas
 * keterangan yang bocor ke dalam KURUNG ("Cabai (1,5 ml/l)"), bukan nama yang memang
 * berbeda bunyinya. Bahayanya bukan kerapian: yang menanam cabai lalu mengetuk "Cabai
 * merah" melihat lima produk, dan pulang mengira itu semua yang ada.
 *
 * MENYARANGKANNYA DI PENYAJI SUDAH DICOBA, 25 AGUSTUS 2026, DAN DICABUT DI HARI YANG
 * SAMA. Uji yang dipakai sempit: sebuah nama jadi "kepala" hanya kalau ia sendiri ada
 * sebagai baris utuh DAN muncul utuh sebagai rangkaian kata di baris lain. Itu benar
 * untuk cabai — dan pada layar "Gulma Berdaun Lebar", yang daftar tanamannya panjang, ia
 * menghasilkan satu paragraf berisi enam puluh nama DAN satu rumpun yang salah:
 * "Kelapa" menelan "Kelapa sawit", dua tanaman yang pestisidanya tidak bisa dipertukarkan.
 * Tidak ada aturan tali-temali yang bisa membedakan "Cabai merah itu cabai" dari "Kelapa
 * sawit itu bukan kelapa"; yang bisa cuma tabel putusan satu per satu, dan tempatnya di
 * kosakata bersama tabel KURUNG — bukan di layar, dan bukan hari ini.
 *
 * Yang tersisa di sini satu kalimat yang benar untuk SEMUA daftar: barisnya tidak
 * digabung, dan angkanya tidak dijumlahkan antarbaris. Ia tidak menyebut baris mana pun
 * sebagai kerabat baris lain, jadi ia tidak pernah bisa mengirim orang ke tanaman yang
 * salah — dan ia tetap menahan pembaca dari berhenti di baris pertama yang cocok. */
const EJAAN_TERPISAH = 'Barisnya ejaan registri apa adanya dan <strong>tidak digabung</strong> \u2014 '
  + 'satu tanaman kadang punya lebih dari satu baris, dan produk pada satu baris tidak '
  + 'ikut terhitung di baris lain. Pilih yang bunyinya sama dengan yang tercetak di label.';

/* SATU BARIS, DUA PEMILIH, DAN SEKARANG SATU DEFINISI.
 *
 * Pemilih tanaman muncul di dua tempat — sesudah kartu gejala, dan sesudah kartu "kamu
 * masuk lewat nama" — dengan bentuk yang sama persis tetapi ditulis dua kali, masing-masing
 * dengan nama medan sendiri (`d.k`/`d.b`/`d.p` di satu sisi, `d.nama`/`d.berkas`/`d.produk`
 * di sisi lain). Yang mengubah salah satunya tanpa mengubah yang lain membuat dua pintu ke
 * layar yang sama berbeda diam-diam, dan itu sudah pernah terjadi di jalur ini.
 *
 * Yang tercetak tidak berubah sedikit pun dari yang ditulis dua kali sebelumnya, termasuk
 * "produk terdaftar" utuh: yang dipadatkan pemilihnya ada di `gaya.css` (`.daftar.ringkas`),
 * dan itu soal lebar kolom, bukan soal kata. Yang bertambah `data-cari` — nama yang sama
 * dalam bentuk yang bisa dibandingkan saringan, dihitung sekali saat dirender dan bukan
 * sekali per ketukan tombol.
 */
function barisKomoditas({ nama, berkas, produk }) {
  return `
    <li data-cari="${teks(kunciCari(nama))}">
      <button type="button" data-berkas="${teks(berkas)}">
        <span class="nama">${teks(nama)}</span>
        <span class="sub">${angkaId(produk)} produk terdaftar</span>
      </button>
    </li>`;
}

/* Yang dibandingkan saringan BUKAN yang tercetak.
 *
 * Nama registri membawa tanda baca yang tidak diketik siapa pun: "Hutan Tanaman Industri
 * (Acacia mangium)", "Persiapan lahan budidaya padi sawah (TOT)", "Eucalyptus sp". Yang
 * mengetik "acacia mangium" tidak akan pernah cocok dengan kurungnya, dan yang mengetik
 * "padi sawah" tidak boleh gagal karena ada "(TOT)" di belakangnya. Jadi kedua sisinya
 * diratakan lebih dulu: huruf kecil, tanda diakritik dilepas, dan apa pun yang bukan
 * huruf atau angka jadi satu spasi.
 *
 * Cocoknya DARI AWAL KATA, bukan dari mana saja. Potongan bebas kelihatan lebih murah hati
 * sampai "ubi" menampilkan "Kubis" — barisnya benar-benar memuat huruf itu, dan yang mencari
 * ubi kayu dapat sekeranjang sayur yang tidak ia sebut. Yang dijaga awalnya saja, ujungnya
 * tetap terbuka: "jag" masih menemukan "Jagung", "sawit" masih menemukan "Budidaya kelapa
 * sawit" (kata ketiga), dan "padi sawah" masih menemukan "Persiapan lahan budidaya padi
 * sawah (TOT)" — sebab kurungnya sudah jadi spasi sebelum dibandingkan. */
const kunciCari = (t) => t
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

/* SARINGAN CUMA MUNCUL KALAU DAFTARNYA MEMANG TIDAK MUAT.
 *
 * Tiga belas tanaman — ulat grayak — setinggi 731 px pada layar 812 px sesudah barisnya
 * dijajarkan dua kolom, dan tiap dua tanaman berikutnya menambah satu baris petak 66 px.
 * Enam belas sudah 797 px, dan itu belum menghitung nama panjang yang membungkus jadi dua
 * baris. Di bawah angka itu kotaknya cuma satu benda tambahan di atas daftar yang sudah
 * terlihat seluruhnya; di atasnya ia yang menggantikan menggulir. 31 dari 738 OPT registri
 * melewatinya — yang terpanjang 75 komoditas — dan median daftarnya 1. */
const AMBANG_SARING = 16;

/* KOSONG DI SINI TIDAK BOLEH TERBACA "TIDAK TERDAFTAR", dan itu bahaya yang dibawa
 * saringan ini sendiri.
 *
 * Seluruh jalur ini dibangun supaya nol produk berarti nol produk (lihat `blokNolProduk`).
 * Saringan memasukkan satu cara baru untuk melihat layar kosong yang artinya sama sekali
 * lain: barisnya ada, ejaannya saja yang tidak sama dengan yang diketik. Yang mengetik
 * "cabe" atau "brambang" akan melihat daftar kosong di halaman yang sepanjang hari
 * mengatakan "kalau kosong berarti memang tidak ada" — dan pulang mengira tanamannya
 * tidak terdaftar.
 *
 * Jadi kekosongan saringan menyebut sebabnya, mengulangi kata yang diketik, dan membawa
 * jalan keluarnya sendiri. Cacahnya juga tidak pernah disembunyikan: berapa yang tampil
 * DAN berapa yang sedang ditutup selalu tertulis, supaya tidak ada keadaan di layar ini
 * yang jumlahnya kelihatan lebih kecil daripada yang sebenarnya. */
function blokPemilihTanaman(daftar, kunci) {
  const baris = daftar.map(barisKomoditas).join('');
  if (daftar.length < AMBANG_SARING) return `<ul class="daftar ringkas">${baris}</ul>`;
  const id = `saring-${kunci}`;
  return `
    <div class="cari-tanaman">
      <label for="${teks(id)}">Cari nama tanamannya</label>
      <input type="search" id="${teks(id)}" data-saring autocomplete="off" spellcheck="false"
             enterkeyhint="done" placeholder="misalnya: jagung"
             aria-describedby="${teks(id)}-cacah">
      <p class="bantuan" id="${teks(id)}-cacah" data-cacah aria-live="polite">
        ${angkaId(daftar.length)} tanaman, semuanya tampil.
      </p>
    </div>
    <ul class="daftar ringkas">${baris}</ul>
    <div class="cari-tanaman-nihil" data-nihil hidden></div>`;
}

/* Dijalankan ulang tiap ketukan tombol, dan sengaja tanpa penundaan: yang dibandingkan
 * paling banyak 75 potongan teks yang sudah diratakan saat dirender, jadi menundanya cuma
 * menambah jeda yang terasa tanpa menghemat apa pun. */
function jalankanSaring(kotak) {
  const wadah = kotak.closest('.cari-tanaman');
  const daftar = wadah.nextElementSibling;
  const cacah = wadah.querySelector('[data-cacah]');
  const nihil = daftar.nextElementSibling;
  const baris = [...daftar.children];
  const cari = kunciCari(kotak.value);

  let tampil = 0;
  for (const li of baris) {
    const cocok = !cari || ` ${li.dataset.cari}`.includes(` ${cari}`);
    li.hidden = !cocok;
    if (cocok) tampil += 1;
  }

  const tertutup = baris.length - tampil;
  daftar.hidden = tampil === 0;
  nihil.hidden = tampil > 0;

  if (!cari) {
    cacah.textContent = `${angkaId(baris.length)} tanaman, semuanya tampil.`;
  } else {
    cacah.textContent = `${angkaId(tampil)} dari ${angkaId(baris.length)} tanaman tampil`
      + `${tertutup ? `, ${angkaId(tertutup)} ditutup saringan` : ''}.`;
  }

  if (tampil === 0) {
    nihil.innerHTML = `
      <p>
        <strong>Tidak ada baris yang ejaannya memuat “${teks(kotak.value.trim())}”.</strong>
        Itu soal ejaan, <strong>bukan soal terdaftar atau tidak</strong> — yang di daftar ini
        ejaan registri apa adanya, dan registri menulis “Cabai” untuk yang di kebun disebut
        cabe, “Bawang merah” untuk yang disebut brambang.
      </p>
      <button type="button" class="kembali" data-hapus-saring>Tampilkan ${angkaId(baris.length)} tanamannya lagi</button>`;
  }
}

function blokKomoditas(k) {
  const urut = k.di.slice().sort((a, b) => b.produk - a.produk);
  return `
    <div class="kartu" id="pilihKedua">
      <h2>Di tanaman apa?</h2>
      <p class="catatan">
        Yang terdaftar berbeda-beda menurut tanamannya. Di luar daftar ini,
        <strong>tidak ada produk yang terdaftar</strong> untuk ${teks(k.nama.toLowerCase())}.
        ${urut.some((d) => d.takBerspesies) ? `Sebagian produk terdaftar untuk sasaran yang
        <strong>tidak menyebut nama spesies</strong> — misalnya “Thrips sp.” alih-alih satu
        jenis trips tertentu. Itu tetap dihitung di sini karena label seperti itu memang
        berlaku untuk jenis apa pun dari marga yang sama, dan jumlahnya disebut supaya
        tidak terbaca lebih pasti daripada yang tertulis di registrinya.` : ''}
        ${urut.some((d) => d.namaLain) ? `Sebagian lagi terdaftar untuk
        <strong>spesies lain yang di lapangan tidak bisa dibedakan dari ini</strong> —
        misalnya dua penggerek batang yang cuma terpisah kalau ngengatnya dibedah.
        Penggabungannya keputusan kurator, bukan bacaan registri, dan alasannya ditulis
        satu per satu di spec/vocab/pest.json.` : ''}
        ${urut.some((d) => d.lebihSempit) ? `Sebagian lagi terdaftar di bawah nama tanaman
        yang <strong>lebih sempit</strong> — misalnya “Cabai merah” di bawah “Cabai”.
        Registri memuat keduanya sebagai tanaman tersendiri karena catatan varietasnya
        memakai pembedaan itu; jangkauannya digabung ke sini karena apa pun yang terdaftar
        untuk yang lebih luas berlaku untuk yang lebih sempit.` : ''}
      </p>
      ${blokPemilihTanaman(urut, 'opt')}
      <p class="catatan">${EJAAN_TERPISAH}</p>
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
  const isi = `${petakKemasan(m.g)}<span class="merek-nama">${teks(m.nama)}</span>`;
  if (!m.p) return `<span class="merek-tautan">${isi}</span>`;
  const alamat = `produk.html?${new URLSearchParams({ id: m.id, pecahan: m.p })}`;
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
      <strong>Dosis di kolom terakhir dosis LABEL</strong> — per liter air atau per
      hektar, bukan jumlah yang masuk ke tangkimu.
      <a href="takaran.html">Kalibrasi &amp; takaran</a> mengubahnya jadi isi satu tangki
      dan berapa tangki untuk petakmu, termasuk kalau menakarnya dengan tutup botol.
    </p>
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



/* Apa yang dipilih pada tingkat KEDUA, dan karena itu apa yang tombol tingkat ketiga
 * tawarkan untuk diulang.
 *
 * Pintu gejala dan pintu nama hama menaruh DAFTAR TANAMAN di atas; pintu tanaman
 * menaruh DAFTAR HAMA. Satu tombol dengan satu nama untuk keduanya akan berbohong pada
 * salah satunya — dan `[data-berkas]` dipakai kedua daftar itu, jadi membedakannya
 * dengan menghitung tombol di DOM tidak bisa. Yang menyetelnya pembukanya sendiri,
 * karena hanya dia yang tahu ia sedang membuka pintu yang mana. */
let pilihanKedua = null;   // { apa: 'tanaman lain' | 'hama lain', banyak: number }

/* Berapa kartu bahan digambar sebelum sisanya diminta. Bukan batas keras: yang di luar
 * dua belas TETAP bisa dibuka — lihat `gambarSisaKartu()`. */
const KARTU_AWAL = 12;

/* Menutup tingkat ketiga tanpa membuang tingkat kedua.
 *
 * Alurnya tiga tingkat — gejala → tanaman → bahan — tetapi sampai 25 Agustus 2026
 * satu-satunya kendali kembali me-reset ke tingkat SATU ("← Pilih gejala lain"). Yang
 * salah memilih tanaman harus membuang seluruh layar OPT-nya dan memilih gejalanya lagi
 * dari awal, untuk kesalahan yang terjadi satu ketukan sebelumnya. */
function tutupDaftarBahan() {
  const daftar = el.hasil.querySelector('#daftarBahan');
  if (!daftar) return;
  daftar.remove();
  kartuKini = null;
  // Pemilih tingkat keduanya tepat di atas — dialah yang barusan diketuk, jadi ke
  // sanalah layar dikembalikan, bukan ke kepala jawaban.
  el.hasil.querySelector('#pilihKedua')?.scrollIntoView({ block: 'start' });
}

/* Sisa kartu bahan, digambar di tempat.
 *
 * Dua belas dari 159 dulu diakhiri satu kalimat — "Ditampilkan 12 kartu teratas dari
 * 159" — dan tidak ada apa pun di layar yang membuka sisanya. Kalimat yang menyebut
 * jumlah yang tidak bisa dicapai lebih buruk daripada tidak menyebutnya: ia memberi
 * tahu pembaca bahwa jawabannya dipotong, lalu berhenti di situ.
 *
 * Indeks kartunya diteruskan apa adanya (`j + KARTU_AWAL`) karena penangan ketukan
 * membaca `kartuKini.grup[i]` — kartu yang digambar dengan indeks barunya sendiri akan
 * membuka daftar merek milik bahan yang lain. */
function gambarSisaKartu() {
  const wadah = el.hasil.querySelector('#sisaKartu');
  if (!wadah || !kartuKini) return;
  wadah.outerHTML = kartuKini.grup.slice(KARTU_AWAL)
    .map((g, j) => kartuBahan(g, j + KARTU_AWAL)).join('');
}

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
    ${semuaGrup.slice(0, KARTU_AWAL).map(kartuBahan).join('')}
    ${semuaGrup.length > KARTU_AWAL ? `
      <p class="catatan" id="sisaKartu">
        <button type="button" class="kembali" data-semua-kartu>Tampilkan
        ${angkaId(semuaGrup.length - KARTU_AWAL)} kartu lainnya</button>
      </p>` : ''}
    ${pilihanKedua && pilihanKedua.banyak > 1 ? `
      <button type="button" class="kembali" data-tutup-bahan>← Pilih ${teks(pilihanKedua.apa)}</button>` : ''}`;

  /* DISISIPKAN SEBELUM TOMBOL KEMBALI, BUKAN DITEMPELKAN DI BELAKANGNYA.
   *
   * `bukaOpt` dan `bukaHama` mengakhiri layarnya dengan "← Pilih gejala lain", lalu
   * memanggil fungsi ini. Sampai 25 Agustus 2026 ia `appendChild` — sehingga kendali
   * KELUAR duduk di atas MUATAN utamanya: terukur di ponsel 375 px, tombolnya di gulir
   * 2.762 sementara daftar bahannya baru mulai 2.827 dan halamannya 6.527. Yang membaca
   * berurutan menemukan tombol kembali di layar ketiga dan wajar membacanya sebagai
   * akhir halaman — persis pola yang dibereskan `bb67d0b` di direktori layanan. */
  const kembali = el.hasil.querySelector('#kembali');
  if (kembali) el.hasil.insertBefore(bagian, kembali);
  else el.hasil.appendChild(bagian);
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
  /* `k.komoditas`, BUKAN `k.di.length` — dan bedanya letak, bukan selera.
   *
   * `k` datang dari daftar gejala, dan daftar itu proyeksi: `di` hidup di berkas rinci
   * yang baru dilebur di dalam `try` di bawah. Baris ini berjalan SEBELUM peleburan itu,
   * jadi `k.di` masih undefined dan `.length` melempar TypeError — di luar `try`, jadi
   * `gagal()` tidak menangkapnya dan seluruh `mulai()` yang jatuh.
   *
   * Terlewat sampai 30 Agustus 2026 karena jalur ini tidak pernah sampai ke sini: impor
   * yang hilang mematikan halaman lebih dulu. Begitu itu dibetulkan, tiap ketukan kartu
   * gejala dan tiap tautan `?opt=` mendarat di baris ini.
   *
   * Cacahnya sama persis — pembangun indeks menulis `komoditas: g.di.length` — dan yang
   * ini memang ada di proyeksi daftar. */
  pilihanKedua = { apa: 'tanaman lain', banyak: k.komoditas };
  judulJadi(k.nama);
  el.hasil.innerHTML = '<p class="kosong">Menyiapkan…</p>';
  el.hasil.focus();
  tampilkanGejala(false);
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
    pasangKembali(el.hasil, {
      gulirKe: el.gejala,
      sesudah: () => { tampilkanGejala(true); judulJadi(null); },
    });
    if (opsi.kom) await bukaTertunjuk(k.di.map((d) => d.berkas), opsi);
    // Kalau hanya satu komoditas, langsung buka — satu ketukan lebih sedikit.
    else if (k.di.length === 1) await bukaKomoditas(k.di[0].berkas, { gulir: opsi.gulir ?? true });
  } catch (e) {
    gagal(e);
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

/* Didengarkan di `el.hasil`, bukan dipasang ke kotaknya saat dirender.
 *
 * Pemilih tanaman digambar ulang setiap kali OPT lain dibuka — `el.hasil.innerHTML`
 * ditimpa utuh — dan pemasang yang menempel ke elemennya harus dipanggil lagi di tiap
 * tempat yang menimpanya: `bukaOpt` lewat `blokKomoditas`, dan `bukaHama` langsung. Yang
 * lupa memanggilnya menghasilkan kotak cari yang terlihat normal dan diam saja saat
 * diketik, dan diamnya cuma ketahuan kalau ada yang mengujinya di layar yang tepat. */
el.hasil.addEventListener('input', (ev) => {
  const kotak = ev.target.closest('input[data-saring]');
  if (kotak) jalankanSaring(kotak);
});

/* Kotak cari di dalam kartu tanpa <form>: tanpa ini Enter tidak melakukan apa pun di
 * papan ketik ponsel, dan yang mengetik menunggu sesuatu terjadi. Yang benar menutup
 * papan ketiknya — hasilnya memang sudah tersaring sejak huruf pertama. */
el.hasil.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter') return;
  const kotak = ev.target.closest('input[data-saring]');
  if (kotak) { ev.preventDefault(); kotak.blur(); }
});

el.hasil.addEventListener('click', async (ev) => {
  const opt = ev.target.closest('button[data-opt]');
  if (opt) return bukaOpt(opt.dataset.opt);

  /* "mulai dari apa yang terlihat" pada layar nama hama dan layar tanaman. Ia MENEKAN
   * tombol kembali, bukan mengulang isinya: penutupan jalur ini berjalan lewat popstate
   * (lihat `pasangKembali`), dan menyalin langkahnya di sini akan membuat dua jalan
   * keluar yang riwayatnya berbeda — tombol Back peramban lalu membawa kembali layar
   * yang baru saja ditutup. */
  if (ev.target.closest('button[data-mulai-gejala]')) {
    el.hasil.querySelector('#kembali')?.click();
    return;
  }

  const kom = ev.target.closest('button[data-berkas]');
  if (kom) return bukaKomoditas(kom.dataset.berkas);

  /* "Tampilkan N tanamannya lagi" — jalan keluar dari saringan yang tidak menemukan apa
   * pun. Fokusnya dikembalikan ke kotaknya: yang menekan tombol ini masih sedang mencari,
   * dan memulangkannya ke daftar tanpa titik sisip berarti ia harus menemukan kotaknya
   * sekali lagi untuk mengetik ejaan yang lain. */
  const hapusSaring = ev.target.closest('button[data-hapus-saring]');
  if (hapusSaring) {
    const kotak = hapusSaring.closest('.kartu, #hasil').querySelector('input[data-saring]');
    kotak.value = '';
    jalankanSaring(kotak);
    kotak.focus();
    return;
  }

  // "← Pilih tanaman lain": tingkat ketiga menutup dirinya sendiri dan mengembalikan
  // pemilih tanaman, tanpa membuang layar OPT yang di atasnya.
  if (ev.target.closest('button[data-tutup-bahan]')) return tutupDaftarBahan();

  // "Tampilkan N kartu lainnya" — sisa kartu bahan digambar di tempat.
  if (ev.target.closest('button[data-semua-kartu]')) return gambarSisaKartu();

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
      ambilPecahan('gejala-daftar', 'gejalaDaftar'),
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
    // Kalimat "dikurasi tangan untuk N komoditas" di kartu pengantar mengambil angkanya
    // dari sini, bukan dari markup. Penanda `data-cacah` KOSONG milik pemilih tanaman
    // (lihat `blokPemilihTanaman`) ikut terpindai dan dilewati sendirinya: kunci kosong
    // tidak ada di `meta.jumlah`, dan yang tak dikenal memang tidak disentuh.
    isiCacah();
    pasangBatas(el.batas, {
      sumber: [
        { dari: 'kurasiOpt', cakupan: `teks gejala dan dua ciri pembanding untuk ${berpintu.length} OPT pada ${daftarInang().length} komoditas` },
        { dari: 'pestisida', cakupan: 'bahan aktif, kadar, dan merek yang terdaftar untuk OPT itu' },
        { dari: 'namaLokal', cakupan: `${kamusLokal.filter((x) => x.ke.length).length} nama daerah dari ${kamusLokal.length} yang tercatat, sebagai petunjuk tambahan — bukan sebagai penentu` },
      ],
      takDijawab: ['gejalaOpt', 'wilayahNamaLokal', 'phi', 'kelasBahayaWho', 'apdProduk', 'namaDagang'],
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
    el.gejala.innerHTML = pesanGagalMuat(e);
    pasangCobaLagi(el.gejala);
  }
})();
