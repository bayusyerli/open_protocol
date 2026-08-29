/* D3 — analisis usaha tani: rencana anggaran biaya, lalu titik impas.
 *
 * SATU ANGKA YANG MENENTUKAN SEBELUM MENANAM: rupiah per kilogram yang harus diterima
 * supaya biaya semusim tertutup. Seluruh masukannya milik pemakainya — aturan yang sama
 * seperti jalur 3, dan tandanya tetap terlihat di tiap hasil.
 *
 * KENAPA HARGA ECERAN TIDAK DITARUH BERSEBELAHAN. Titik impas di sebelah harga eceran
 * terbaca seolah selisihnya keuntungan. Ia bukan: eceran memuat marjin seluruh rantai.
 * Dan bahkan "harga produsen" resmi bukan harga petani — respondennya pengumpul,
 * penggilingan, dan pedagang; di Karawang satu orang. Jaraknya terpasang di dalam
 * DEFINISINYA, bukan celah cakupan. Jadi yang ditayangkan RASIO, mengikuti aturan tayang
 * ke-5 di docs/16: "Harga Anda = 70% setara-CPO dari harga dunia" jauh lebih sulit
 * disalahpahami daripada dua angka berdampingan.
 *
 * ARUS KAS SEMUSIM DITAHAN, BUKAN DITAMPILKAN SETENGAH. Kapan biaya keluar dan kapan uang
 * masuk menuntut kalender bertanggal; kosakata fase sengaja tidak punya medan hari, dan
 * hanya dua dari empat langkah protokol cabai bertanggal.
 */

import { ambil, muatMeta, teks } from './pustaka.js';
import { titikImpas, hargaDiterima } from './hitung.js';
import { pasangBatas } from './batas.js';
import { pasangTombolTema } from './tema.js';
import * as musim from './musim.js';
import * as buku from './buku.js';

pasangTombolTema();
document.getElementById('tanpaJs')?.remove();

const el = {};
for (const id of ['barisBiaya', 'tambahBiaya', 'hasilBiaya', 'luas', 'hasil',
  'komoditas', 'hasilImpas', 'kartuMusim', 'bandingKas', 'hasilPanen']) el[id] = document.getElementById(id);
el.batas = document.getElementById('batasJawaban');

const rupiah = (x) => 'Rp ' + Math.round(x).toLocaleString('id-ID');
const n = (x, d = 0) => Number(x ?? 0).toLocaleString('id-ID', { maximumFractionDigits: d });

/* Kategori, bukan angka. Menyediakan daftar barisnya menolong orang mengingat apa yang
 * belum dihitung; menyediakan ANGKANYA berarti mengarang biaya yang tidak pernah diukur
 * siapa pun, dan tiap daerah berbeda.
 *
 * Daftarnya kini diambil dari `buku.js`, bukan diketik ulang di sini. Ia memang SUDAH
 * sama persis sejak awal — disengaja, supaya yang menyusun rencana di layar ini tidak
 * memulai dari buku kosong di buku kas. Tetapi dua salinan yang kebetulan sama tidak
 * bertahan sama: yang menambah satu kategori di satu tempat tidak akan tahu ada tempat
 * lain, dan rencana per kategori tidak bisa lagi disandingkan dengan realisasinya. */
const KATEGORI = buku.KATEGORI_KELUAR;

/* ---------------------------------------------------------------------------
 * D3 disambungkan ke rekaman musim bersama
 * ---------------------------------------------------------------------------
 * Layar ini pemakai KETIGA kata "musim", dan satu-satunya yang belum ikut. Sampai sekarang
 * ia meminta luas dari nol setiap kali dibuka, dan rencana anggaran yang disusun di sini
 * lenyap begitu tabnya ditutup.
 *
 * KENAPA MENYIMPANNYA JUSTRU YANG MEMBUAT SAMBUNGANNYA BERGUNA. Rencana anggaran disusun
 * SEBELUM menanam; buku kas terisi SELAMA musim berjalan. Yang menarik terjadi di antara
 * keduanya — "sudah keluar berapa dari yang direncanakan, di kategori mana" — dan itu
 * hanya bisa ditanyakan kalau rencananya masih ada waktu realisasinya mulai masuk.
 * Rencana yang hilang tiap kali tab ditutup membuat perbandingan itu menuntut mengetik
 * ulang seluruh RAB, yang berarti ia tidak akan pernah dilakukan.
 *
 * LUAS DISIMPAN DALAM HEKTARE, DIMINTA DALAM METER PERSEGI, dan konversinya ditulis di
 * layar. Rekaman musim memakai hektare karena itu satuan tiap program yang meminta angka
 * biaya usaha tani; layar ini meminta m² karena itu satuan yang dipakai orang menyebut
 * petaknya sendiri ("dua ribu meter"). Menyeragamkannya berarti salah satu sisi memakai
 * satuan yang bukan miliknya — jadi yang diseragamkan penyimpanannya, bukan pertanyaannya,
 * dan hasil konversinya tampak supaya tidak ada yang berubah diam-diam.
 */
/* Panen tinggal di simpanan layar rencana dan DIBACA saja dari sini. Menyalinnya ke
 * simpanan layar ini akan melahirkan salinan kedua yang lambat laun berselisih — cacat
 * yang sudah sekali terjadi di repositori ini, waktu pemindahan bentuk lama ditaruh di dua
 * berkas dan yang satu menimpa yang dibaca yang lain. Satu penulis, banyak pembaca. */
const KUNCI_REALISASI = 'op:realisasi';
const panenMusim = (id) => {
  try {
    const m = JSON.parse(localStorage.getItem(KUNCI_REALISASI) ?? '{}');
    return m?.[id]?.panen ?? [];
  } catch { return []; }
};

const KUNCI_RAB = 'op:rab';
const M2_PER_HA = 10000;

let rab = {};
try { rab = JSON.parse(localStorage.getItem(KUNCI_RAB) ?? '{}') || {}; } catch { rab = {}; }

const simpanRab = () => {
  const id = musim.idMusimAktif();
  if (!id) return;
  rab[id] = {
    baris: bacaBiaya(),
    luas: angka(el.luas.value) || null,
    hasil: angka(el.hasil.value) || null,
    komoditas: el.komoditas.value || null,
  };
  try { localStorage.setItem(KUNCI_RAB, JSON.stringify(rab)); } catch { /* mode privat; hitungannya tetap jalan */ }
};

let harga = [];
let baris = 0;

function tambahBaris(kategori = null, jumlah = null) {
  const i = ++baris;
  const div = document.createElement('div');
  div.className = 'baris-hara';
  div.innerHTML = `
    <label class="khusus-pembaca" for="kat${i}">Jenis biaya</label>
    <select id="kat${i}" class="b-kat">
      ${KATEGORI.map((k) => `<option${k === kategori ? ' selected' : ''}>${teks(k)}</option>`).join('')}
    </select>
    <label class="khusus-pembaca" for="jml${i}">Jumlah rupiah</label>
    <input id="jml${i}" class="b-jml" type="number" inputmode="decimal" min="0" step="any" placeholder="Rp 0" value="${jumlah ?? ''}">
    <button type="button" class="k-buang" aria-label="Buang baris ini">×</button>`;
  div.querySelector('.k-buang').addEventListener('click', () => {
    if (el.barisBiaya.children.length > 1) { div.remove(); hitungLalu(); }
  });
  div.querySelector('.b-jml').addEventListener('input', hitungLalu);
  div.querySelector('.b-kat').addEventListener('change', hitungLalu);
  el.barisBiaya.appendChild(div);
}

const angka = (x) => { const v = parseFloat(x); return Number.isFinite(v) && v > 0 ? v : 0; };

function bacaBiaya() {
  return [...el.barisBiaya.children]
    .map((b) => ({ kat: b.querySelector('.b-kat').value, jml: angka(b.querySelector('.b-jml').value) }))
    .filter((x) => x.jml > 0);
}

/* Rencana di sebelah realisasinya, per kategori — dan hanya kalau bukunya memang sudah
 * memuat sesuatu. Kartu kosong berisi tiga belas nol sebelum musim dimulai tidak memberi
 * tahu apa pun; ia cuma membuat layar tampak sudah menjawab pertanyaan yang belum bisa
 * ditanyakan.
 *
 * TITIK IMPAS TIDAK DIHITUNG ULANG DARI BIAYA YANG SUDAH KELUAR, dan itu penahan yang
 * sengaja. Di tengah musim biaya yang sudah keluar selalu lebih kecil daripada rencananya,
 * jadi titik impas dari angka itu selalu tampak lebih baik — kabar bagus yang seluruhnya
 * berasal dari musim yang belum selesai. Yang ditayangkan karena itu selisih per kategori,
 * bukan kesimpulan baru. */
/* ---------------------------------------------------------------------------
 * Harga yang benar-benar diterima — dan kenapa layar ini akhirnya boleh menghitungnya
 * ---------------------------------------------------------------------------
 * Seluruh halaman ini dibangun di sekitar satu penolakan: harga eceran BUKAN harga yang
 * diterima petani, dan bahkan "harga produsen" resmi bukan — respondennya pengumpul dan
 * penggilingan, di Karawang satu orang. Jaraknya terpasang di dalam definisinya, bukan
 * celah cakupan. Karena itu yang ditayangkan selama ini rasio, bukan dua angka
 * berdampingan.
 *
 * TETAPI ADA SATU ORANG YANG MEMEGANG ANGKANYA, dan ia yang sedang membuka layar ini.
 * Harga yang benar-benar diterima = uang yang benar-benar masuk ÷ kilogram yang
 * benar-benar dipanen. Keduanya miliknya sendiri: yang satu di buku kas, yang satu di
 * penanda panen. Tidak ada sumber terbuka yang perlu diminta, dan tidak ada yang
 * dikarang. Ini satu-satunya tempat di seluruh permukaan yang bisa menyebut angka itu.
 *
 * DUA PENAHAN, DAN KEDUANYA DINYATAKAN DI LAYAR.
 *
 *   1. Selama musim belum ditutup, angkanya BELUM angka musim. Panen yang belum terjual
 *      menariknya ke bawah, dan penjualan yang mendahului panen berikutnya menariknya ke
 *      atas. Jadi sebelum ditutup ia disebut "sejauh ini", dan sesudah ditutup barulah ia
 *      disebut harga musim ini.
 *   2. Ia tidak dibandingkan dengan harga eceran di kartu yang sama. Selisih keduanya
 *      bukan kerugian siapa pun — eceran memuat marjin seluruh rantai — dan menaruh
 *      keduanya berdampingan persis yang ditolak aturan tayang ke-5.
 */
function gambarPanen() {
  const m = musim.aktif();
  const id = musim.idMusimAktif();
  if (!id) { el.hasilPanen.innerHTML = ''; return; }
  const c = panenMusim(id);
  const totalKg = c.reduce((a, x) => a + Number(x.kg || 0), 0);
  const masuk = buku.perMusim(id).filter((x) => x.a === 'masuk').reduce((a, x) => a + Number(x.n || 0), 0);
  const ditutup = musim.sudahBerakhir(m);
  const perkiraan = angka(el.hasil.value);
  const biaya = bacaBiaya().reduce((a, x) => a + x.jml, 0);

  if (!totalKg) {
    el.hasilPanen.innerHTML = `<p class="catatan">Belum ada panen tercatat di
      <a href="rencana.html">layar rencana</a>. Begitu ada, perkiraan hasil di atas berdiri
      di sebelah hasil yang sebenarnya — dan <strong>harga yang benar-benar kamu terima</strong>
      bisa dihitung dari angkamu sendiri, tanpa satu pun sumber luar.</p>`;
    return;
  }

  // Keduanya lewat app/hitung.js — fungsi yang sama itulah yang dikunci uji di
  // spec/tools/uji-hitung.mjs, jadi yang dijaga kode yang benar-benar berjalan di sini,
  // bukan salinan kedua yang kebetulan mirip.
  const diterima = hargaDiterima(masuk, totalKg);
  const impasNyata = titikImpas(biaya, totalKg);
  const selisihHasil = perkiraan ? (totalKg - perkiraan) / perkiraan * 100 : null;

  el.hasilPanen.innerHTML = `
    <div class="kartu banding">
      <h2>Hasil sebenarnya${ditutup ? '' : ' sejauh ini'}</h2>
      <dl class="kunci">
        <dt>Sudah dipanen</dt><dd>${n(totalKg)} kg<span class="sub">dari ${n(c.length)} kali panen</span></dd>
        ${perkiraan ? `<dt>Perkiraan tadi</dt>
          <dd class="${selisihHasil < 0 ? 'lewat' : ''}">${n(perkiraan)} kg<span class="sub">${selisihHasil >= 0 ? '+' : '−'}${n(Math.abs(selisihHasil), 0)}% dari perkiraan</span></dd>` : ''}
        ${impasNyata ? `<dt>Titik impas atas hasil ini</dt>
          <dd>${rupiah(impasNyata)}/kg<span class="sub">${rupiah(biaya)} ÷ ${n(totalKg)} kg</span></dd>` : ''}
      </dl>
      ${diterima ? `
        <div class="hasil-besar">
          <strong>${rupiah(diterima)}</strong>
          <span>per kilogram — harga yang benar-benar kamu terima${ditutup ? '' : ', sejauh ini'}</span>
        </div>
        <p class="catatan">
          ${rupiah(masuk)} yang masuk ÷ ${n(totalKg)} kg yang dipanen. <strong>Tidak ada
          sumber luar dalam angka ini</strong> — keduanya catatanmu sendiri, dan justru
          inilah angka yang tidak diukur sumber terbuka mana pun di Indonesia.
          ${ditutup ? '' : 'Musim ini belum ditutup, jadi ia belum angka musim: panen yang belum terjual menariknya ke bawah, dan penjualan yang mendahului panen berikutnya menariknya ke atas.'}
        </p>
        ${impasNyata ? `<p class="catatan">${diterima >= impasNyata
          ? `Di atas titik impas atas hasil ini (${rupiah(impasNyata)}/kg).`
          : `<strong>Di bawah titik impas atas hasil ini</strong> (${rupiah(impasNyata)}/kg) — pada harga ini, biaya yang sudah kamu rencanakan belum tertutup.`}</p>` : ''}
      ` : `<p class="catatan">Belum ada uang masuk tercatat, jadi <strong>harga yang
        benar-benar kamu terima</strong> belum bisa dihitung. Ia satu-satunya angka di
        halaman ini yang tidak butuh sumber luar sama sekali — cukup uang masuk di buku kas
        dan kilogram di penanda panen, keduanya milikmu.</p>`}
    </div>`;
}

function gambarBanding() {
  const id = musim.idMusimAktif();
  const nyata = id ? buku.perMusim(id).filter((c) => c.a === 'keluar') : [];
  if (!nyata.length) {
    el.bandingKas.innerHTML = id
      ? `<p class="catatan">Belum ada biaya tercatat di <a href="kas.html">buku kas</a> musim ini.
         Begitu ada, rencana di atas berdiri di sebelah realisasinya per kategori.</p>`
      : '';
    return;
  }
  const perKat = new Map();
  for (const b of bacaBiaya()) perKat.set(b.kat, { rencana: (perKat.get(b.kat)?.rencana ?? 0) + b.jml, nyata: 0 });
  for (const c of nyata) {
    const k = perKat.get(c.k) ?? { rencana: 0, nyata: 0 };
    k.nyata += Number(c.n || 0);
    perKat.set(c.k, k);
  }
  const urut = [...perKat].sort((a, b) => (b[1].rencana + b[1].nyata) - (a[1].rencana + a[1].nyata));
  const tRencana = urut.reduce((a, [, v]) => a + v.rencana, 0);
  const tNyata = urut.reduce((a, [, v]) => a + v.nyata, 0);
  const dariRencana = nyata.filter((c) => c.s === 'rencana').length;

  el.bandingKas.innerHTML = `
    <div class="kartu banding">
      <h2>Rencana di sebelah yang sudah keluar</h2>
      <div class="pembungkus-tabel">
        <table>
          <thead><tr><th>Kategori</th><th class="angka">Rencana</th><th class="angka">Sudah keluar</th><th class="angka">Sisa</th></tr></thead>
          <tbody>
            ${urut.map(([k, v]) => {
              const sisa = v.rencana - v.nyata;
              // `data-l` dipakai lembar gaya untuk melipat tabel ini jadi blok di layar
              // sempit. Empat lajur rupiah tidak muat di 375 px, dan dua lajur yang jatuh
              // ke luar layar justru DUA YANG PENTING — kartu yang isinya harus ditemukan
              // dengan menggulir ke samping sama saja dengan kartu yang tidak ada.
              return `<tr>
                <th scope="row">${teks(k)}</th>
                <td class="angka" data-l="Rencana">${v.rencana ? rupiah(v.rencana) : '<span class="kosong">—</span>'}</td>
                <td class="angka" data-l="Sudah keluar">${v.nyata ? rupiah(v.nyata) : '<span class="kosong">—</span>'}</td>
                <td class="angka${!v.rencana ? ' luar-rencana' : sisa < 0 ? ' lewat' : ''}" data-l="Sisa">${
                  !v.rencana ? 'di luar rencana' : sisa < 0 ? `lewat ${rupiah(-sisa)}` : rupiah(sisa)}</td>
              </tr>`;
            }).join('')}
          </tbody>
          <tfoot><tr>
            <th scope="row">Seluruhnya</th>
            <td class="angka" data-l="Rencana">${rupiah(tRencana)}</td>
            <td class="angka" data-l="Sudah keluar">${rupiah(tNyata)}</td>
            <td class="angka${tNyata > tRencana ? ' lewat' : ''}" data-l="Sisa">${tNyata > tRencana ? `lewat ${rupiah(tNyata - tRencana)}` : rupiah(tRencana - tNyata)}</td>
          </tr></tfoot>
        </table>
      </div>
      <p class="catatan">
        ${n(nyata.length)} catatan biaya di buku kas musim ini${dariRencana ? `, ${n(dariRencana)} di antaranya masuk sendiri dari <a href="rencana.html">layar rencana</a>` : ''}.
        <strong>Sisa bukan berarti aman:</strong> musim yang belum selesai selalu tampak
        di bawah rencananya, dan itu sebabnya titik impas di bawah TIDAK dihitung ulang
        dari angka yang sudah keluar — ia tetap memakai rencana penuh.
      </p>
      ${urut.some(([, v]) => !v.rencana) ? `<p class="catatan">
        Kategori bertanda <strong>di luar rencana</strong> tidak ada di daftar di atas sama
        sekali. Itu temuan tentang rencananya, bukan tentang yang membelanjakannya — dan
        daftar yang tidak lengkap menghasilkan titik impas yang terlalu rendah.
      </p>` : ''}
    </div>`;
}

function hitung() {
  const isi = bacaBiaya();
  const total = isi.reduce((a, x) => a + x.jml, 0);
  const luas = angka(el.luas.value);
  const hasilKg = angka(el.hasil.value);

  el.hasilBiaya.innerHTML = !isi.length
    ? '<p class="kosong">Belum ada biaya yang diisi.</p>'
    : `<div class="hasil-besar"><strong>${rupiah(total)}</strong><span>biaya semusim, dari ${isi.length} baris</span></div>
       ${luas ? `<p class="bantuan">Setara ${rupiah(total / luas * 10000)} per hektare.</p>` : ''}`;

  if (!total || !hasilKg) {
    el.hasilImpas.innerHTML = '<p class="kosong">Isi biaya di atas, lalu perkiraan hasil panen.</p>';
    return;
  }

  const impas = total / hasilKg;
  const k = harga.find((h) => h.k === el.komoditas.value);

  el.hasilImpas.innerHTML = `
    <div class="hasil-besar">
      <strong>${rupiah(impas)}</strong>
      <span>per kilogram — di bawah ini rugi</span>
    </div>
    <div class="pembungkus-tabel">
      <table><tbody>
        <tr><th>Titik impas</th><td class="angka">${rupiah(total)} ÷ ${n(hasilKg)} kg = ${rupiah(impas)}/kg</td></tr>
        ${luas ? `<tr><th>Hasil per hektare</th><td class="angka">${n(hasilKg)} kg ÷ ${n(luas)} m² × 10.000 = ${n(hasilKg / luas * 10000)} kg/ha</td></tr>` : ''}
      </tbody></table>
    </div>
    ${k ? blokRasio(impas, k) : '<p class="catatan">Pilih komoditas di atas untuk melihat seberapa jauh titik impasmu dari harga di ujung rantai.</p>'}
    ${luas ? `<p class="catatan">Luas ${n(luas)} m² sama dengan <strong>${n(luas / M2_PER_HA, 4)} hektare</strong>, dan itu yang tersimpan di rekaman musim — satuan yang dipakai buku kas dan hampir semua program yang meminta angka biaya usaha tani.</p>` : ''}
    <p class="catatan">
      Pembagiannya ditulis terbuka supaya bisa dibantah. Seluruh angkanya masukanmu —
      biaya, luas, dan perkiraan hasil. <strong>Registri tidak memuat potensi hasil satu
      pun varietas</strong>, jadi tidak ada angka acuan yang bisa disodorkan untuk itu.
    </p>`;
}

/* Digambar ulang dan disimpan pada tiap perubahan, bukan di balik tombol "simpan". Tombol
 * simpan pada layar hitung berarti ada keadaan yang terlihat tetapi belum tersimpan, dan
 * yang menutup tab sebelum menekannya kehilangan seluruh RAB-nya tanpa pernah tahu. */
function hitungLalu() {
  hitung();
  gambarBanding();
  gambarPanen();
  simpanRab();
}

/* Membuka musim mengisi ulang seluruh layar dari apa yang musim itu sudah tahu: luasnya
 * dari rekaman musim (hektare, dijadikan m²), sisanya dari RAB yang tersimpan untuknya. */
function bukaMusim(m) {
  const r = m ? rab[m.i] : null;
  el.barisBiaya.innerHTML = '';
  baris = 0;
  if (r?.baris?.length) for (const b of r.baris) tambahBaris(b.kat, b.jml);
  else for (const k of BAWAAN) tambahBaris(k);

  // Rekaman musim MENANG atas luas yang tersimpan di RAB, bukan sebaliknya. Kalau layar
  // lain mengubah luas petaknya, yang benar yang di rekaman bersama — memenangkan salinan
  // lokal berarti layar ini diam-diam menghitung biaya per hektare dari luas yang sudah
  // tidak berlaku, dan itu persis jenis selisih yang tidak terlihat sampai angkanya dipakai.
  const luasM2 = m?.luas > 0 ? Math.round(m.luas * M2_PER_HA) : (r?.luas ?? null);
  el.luas.value = luasM2 ?? '';
  el.hasil.value = r?.hasil ?? '';
  if (r?.komoditas) el.komoditas.value = r.komoditas;
  else if (m?.komoditas) {
    // Komoditas di rekaman musim teks bebas ("Cabai merah"); di indeks harga ia berkunci.
    // Dicocokkan longgar, dan kalau tidak ketemu tidak ada yang hilang — medannya cuma
    // tetap kosong seperti sebelumnya.
    const cari = m.komoditas.toLowerCase();
    const cocok = harga.find((h) => h.n.toLowerCase() === cari)
      ?? harga.find((h) => h.n.toLowerCase().includes(cari) || cari.includes(h.n.toLowerCase()));
    if (cocok) el.komoditas.value = cocok.k;
  }
  hitung();
  gambarBanding();
  gambarPanen();
}

/* Rasio, bukan dua angka bersebelahan — aturan tayang ke-5 di docs/16. */
function blokRasio(impas, k) {
  const pct = impas / k.p * 100;
  return `
    <div class="kartu ${pct >= 100 ? 'tabrakan' : ''}">
      <h2>Titik impasmu ${n(pct, 0)}% dari harga eceran ${teks(k.n)}</h2>
      <p>
        Harga eceran nasional ${teks(k.n)} <strong>${rupiah(k.p)}/${teks(k.s)}</strong>
        pada ${teks(k.t)}. Titik impasmu ${rupiah(impas)}/kg — <strong>${n(pct, 0)}%</strong> dari angka itu.
      </p>
      <p class="catatan">
        <strong>Selisihnya bukan keuntunganmu.</strong> Harga eceran memuat marjin seluruh
        rantai — pengumpul, pedagang besar, pengecer — dan tidak satu pun dari itu sampai
        ke petak. Bahkan "harga produsen" resmi pun bukan harga petani: respondennya
        pengumpul dan penggilingan, dan di Karawang tercatat <strong>satu orang</strong>.
        ${pct >= 100
          ? '<strong>Titik impasmu di atas harga eceran itu sendiri</strong> — pada harga sebesar itu, usaha ini rugi bahkan sebelum rantai mengambil bagiannya.'
          : 'Yang menentukan tetap harga yang <em>kamu</em> terima, dan tidak ada sumber terbuka yang mengukurnya.'}
      </p>
    </div>`;
}

el.tambahBiaya.addEventListener('click', () => tambahBaris());
for (const id of ['luas', 'hasil']) el[id].addEventListener('input', hitungLalu);
el.komoditas.addEventListener('change', hitungLalu);

// Luas ditulis balik ke rekaman musim, dari m² jadi hektare. Ditambal, bukan ditimpa:
// layar ini tahu luas, buku kas tahu komoditas, layar rencana tahu protokol dan tanggal.
el.luas.addEventListener('change', () => {
  const id = musim.idMusimAktif();
  const m2 = angka(el.luas.value);
  if (id && m2) musim.perbarui(id, { luas: Math.round(m2 / M2_PER_HA * 1e4) / 1e4 });
});

// Empat baris terisi lebih dulu: bukan angka, hanya kategori yang paling sering ada.
const BAWAAN = ['Benih atau bibit', 'Pupuk', 'Pestisida', 'Tenaga kerja — pemeliharaan'];
for (const k of BAWAAN) tambahBaris(k);
hitung();

(async function mulai() {
  try {
    await muatMeta();
    harga = await ambil('harga');
    el.komoditas.innerHTML = '<option value="">— pilih komoditas —</option>' +
      harga.slice().sort((a, b) => a.n.localeCompare(b.n))
        .map((h) => `<option value="${teks(h.k)}">${teks(h.n)}</option>`).join('');

    musim.pasangMusim(el.kartuMusim, { onGanti: bukaMusim });
    bukaMusim(musim.aktif());

    pasangBatas(el.batas, {
      sumber: [
        {
          label: 'Biaya, luas, dan hasil — masukanmu sendiri',
          penerbit: 'Pemakai layar ini',
          tarikan: '2026-08-23',
          status: 'per pemakaian',
          tingkat: null,
          alasan:
            'Tidak bertingkat, karena bukan klaim siapa pun kecuali yang mengetiknya. Registri tidak memuat biaya usaha tani sama sekali, dan tidak memuat potensi hasil satu pun dari 11.227 varietas — jadi tidak ada angka acuan yang bisa disodorkan, dan menyodorkannya berarti mengarang. Aritmetikanya sendiri tercetak di layar supaya bisa dihitung ulang.',
        },
        { dari: 'harga', cakupan: 'harga eceran nasional, dipakai hanya sebagai pembanding rasio — bukan sebagai harga yang diterima petani' },
      ],
      takDijawab: ['hargaPetani', 'hasilVarietas', 'arusKasMusim', {
        judul: 'Rencana ini tidak menghitung ulang titik impas dari biaya yang sudah keluar',
        teks:
          'Rencana anggaran di atas berdiri di sebelah realisasinya per kategori, tetapi titik '
          + 'impas tetap dihitung dari rencana penuh. Di tengah musim biaya yang sudah keluar '
          + 'selalu lebih kecil daripada rencananya, jadi titik impas dari angka itu selalu '
          + 'tampak lebih baik — kabar bagus yang seluruhnya berasal dari musim yang belum '
          + 'selesai. Yang belum bisa dijawab layar ini: kapan rencana boleh dianggap tertutup, '
          + 'dan itu menuntut penanda panen yang belum ada di permukaan mana pun.',
      }, {
        judul: 'Harga yang kamu terima tidak bisa dibandingkan dengan harga petani lain',
        teks:
          'Sejak penanda panen ada, halaman ini bisa menghitung harga yang BENAR-BENAR kamu '
          + 'terima — uang masuk dibagi kilogram yang dipanen, keduanya catatanmu sendiri, '
          + 'tanpa satu pun sumber luar. Yang tidak bisa dilakukan: menaruhnya di sebelah angka '
          + 'petani lain di kecamatan yang sama. Itu menuntut pengumpulan, dan lapisan ini '
          + 'hanya menyebarkan. Yang tersedia sebagai pembanding cuma harga eceran nasional, '
          + 'dan selisihnya bukan kerugian siapa pun: eceran memuat marjin seluruh rantai.',
      }],
    });
  } catch (e) {
    el.komoditas.innerHTML = '<option value="">— harga tidak terambil —</option>';
  }
})();
