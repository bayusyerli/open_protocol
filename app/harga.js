/* Harga komoditas — daftar, riwayat, dan komentar.
 *
 * Dua pengambilan, dan pemisahannya mengikuti dua pertanyaan yang berbeda:
 *   harga.json          "apa saja yang ada harganya, dan berapa sekarang" — kepala daftar
 *   harga/<key>.json    "bagaimana riwayatnya" — seluruh seri, statistik, dan komentarnya
 *
 * Serinya dibawa utuh, bukan dijarangkan, karena grafiknya memang seluruh seri: 634 titik
 * ≈ 14 KB, di bawah anggaran satu berkas. Menjarangkannya akan menghaluskan lonjakan yang
 * justru paling penting dilihat.
 *
 * GRAFIKNYA SVG YANG DIGAMBAR SENDIRI, BUKAN PUSTAKA
 * Bukan penghematan gaya: satu pustaka grafik berukuran beberapa ratus kilobyte pada
 * permukaan yang syarat lapangan nomor satunya sinyal buruk, demi satu garis dan dua sumbu.
 * Yang digambar di sini garis, rentang, dan penanda — tanpa animasi, tanpa interaksi yang
 * menuntut tetikus, dan tetap terbaca pada layar 320 px.
 */

import {
  ambil, muatMeta, bacaMeta, teks, tanggal, pasangKembali, pesanGagalMuat, pasangCobaLagi,
} from './pustaka.js';
import { pasangTombolTema } from './tema.js';
import { pasangBatas } from './batas.js';

pasangTombolTema();

const el = {
  judul: document.getElementById('judul'),
  lede: document.getElementById('lede'),
  q: document.getElementById('q'),
  bantuan: document.getElementById('bantuan'),
  form: document.getElementById('formCari'),
  daftar: document.getElementById('daftar'),
  rincian: document.getElementById('rincian'),
  strip: document.getElementById('stripTingkat'),
  stripIsi: document.getElementById('stripIsi'),
  batas: document.getElementById('batasJawaban'),
  atribusi: document.getElementById('atribusi'),
};

// Dua offset menempel bertingkat: bilah cangkang, lalu strip tingkat di bawahnya, lalu
// kepala kelompok di bawah keduanya. Ketiganya meninggi sendiri saat isinya membungkus di
// layar sempit, jadi angkanya DIUKUR, bukan ditulis di lembar gaya. Menebaknya membuat
// kepala kelompok menyelip di balik strip persis pada lebar yang paling banyak dipakai.
function ukurTempelan() {
  const bilah = document.querySelector('.bilah-cangkang');
  const akar = document.documentElement.style;
  if (bilah) akar.setProperty('--atas-bilah', `${Math.round(bilah.offsetHeight)}px`);
  const s = el.strip?.querySelector('summary');
  if (s) akar.setProperty('--tinggi-strip', `${Math.round(s.offsetHeight)}px`);
}
addEventListener('resize', ukurTempelan);

document.getElementById('tanpaJs')?.remove();

const BENTUK_KEY = /^[a-z0-9-]+$/;
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const rp = (x) => 'Rp' + Math.round(Number(x)).toLocaleString('id-ID');
const angkaId = (x, d = 1) =>
  x === null || x === undefined ? '—' : Number(x).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
const n = (x) => Number(x ?? 0).toLocaleString('id-ID');

// Arah perubahan dinyatakan lewat kata DAN tanda, bukan lewat warna saja: naik-turun harga
// dibaca berlawanan oleh pembeli dan penjual, dan warna sendirian tidak terbaca oleh yang
// buta warna maupun yang layarnya silau di kebun.
const arah = (p) => {
  if (p === null || p === undefined) return { kelas: 'datar', kata: 'tidak terhitung', tanda: '' };
  if (Math.abs(p) < 0.5) return { kelas: 'datar', kata: 'nyaris tetap', tanda: '' };
  return p > 0
    ? { kelas: 'naik', kata: 'naik', tanda: '▲' }
    : { kelas: 'turun', kata: 'turun', tanda: '▼' };
};

let kepala = [];

// ---------------------------------------------------------------------------
// Daftar
// ---------------------------------------------------------------------------
// Yang tampil di daftar: keluaran usaha tani, dan sarana produksinya. Yang tidak: baja
// ringan, besi beton, kayu balok, triplek, paku, semen, LPG, dan pangan olahan lanjut
// berbahan baku impor — SP2KP menerbitkannya dalam endpoint yang sama, tetapi tidak satu pun
// urusan permukaan ini.
//
// Yang disembunyikan TIDAK dihapus dari data dan TIDAK didiamkan: jumlahnya disebut, dan
// daftarnya bisa dibuka. Menyaring diam-diam membuat cacah di layar tidak pernah cocok
// dengan cacah di dokumen, dan selisih yang tak terjelaskan itu justru yang membuat orang
// berhenti memercayai keduanya.
const TANI = (x) => x.r !== 'luar';

function gambarDaftar(kueri = '') {
  const r = kueri.trim().toLowerCase();
  const dalamLingkup = kepala.filter(TANI);
  const cocok = r
    ? dalamLingkup.filter((x) => `${x.n} ${x.g ?? ''}`.toLowerCase().includes(r))
    : dalamLingkup;

  if (!cocok.length) {
    el.daftar.innerHTML = `
      <p class="kosong">
        Tidak ada komoditas tani yang namanya memuat <strong>${teks(kueri)}</strong>.
        Cakupannya memang sempit — dan bahan bangunan serta pangan olahan lanjut yang ikut
        diterbitkan SP2KP sengaja tidak dicari di sini. Tidak ada satu pun komoditas
        perkebunan.
      </p>`;
    return;
  }

  const berangka = cocok.filter((x) => !x.kosong);
  const kosong = cocok.filter((x) => x.kosong);

  // Tanggal terbaru di seluruh daftar. Di layar harga "per kapan" sekelas dengan "berapa",
  // dan sampai 24 Agustus 2026 tanggalnya baru muncul setelah satu komoditas dibuka —
  // artinya seluruh daftar berdiri tanpa keterangan umur sama sekali.
  const terbaru = berangka.map((x) => x.t).filter(Boolean).sort().at(-1);

  const luar = kepala.filter((x) => !TANI(x));
  el.daftar.innerHTML = `
    ${terbaru ? `<p class="catatan tanggal-daftar">Angka terbaru <strong>${teks(tanggal(terbaru) ?? terbaru)}</strong> · rata-rata nasional tertimbang penduduk.</p>` : ''}
    <p class="bantuan" role="status">
      ${n(berangka.length)} komoditas berangka${kosong.length ? `, ${n(kosong.length)} diterbitkan tanpa angka` : ''}.
    </p>
    ${luar.length ? `
      <details class="luar-lingkup">
        <summary>${n(luar.length)} varian lain yang SP2KP terbitkan tidak ditampilkan di sini</summary>
        <p class="catatan">
          Endpoint yang sama memuat <strong>bahan bangunan</strong> — baja ringan, besi beton,
          kayu balok, triplek, paku, semen — beserta <strong>LPG</strong> dan
          <strong>pangan olahan</strong>: gula pasir, minyak goreng, tepung terigu, susu,
          mie instan, tahu, tempe, garam halus — serta <strong>barang impor</strong>: daging
          sapi dan kerbau impor beku, kedelai impor.
        </p>
        <p class="catatan">
          Yang olahan dikeluarkan bukan karena bahan bakunya impor — tebu dan sawit ditanam di
          sini — melainkan karena <strong>harganya harga eceran barang jadi</strong>. Yang
          menghadapinya pembeli di toko, bukan petani tebu maupun petani sawit, dan jarak
          antara keduanya tidak diukur data ini. Beras tetap ditampilkan meski digiling: satu
          langkah dari gabah, dan itu cara harga padi diucapkan di seluruh Indonesia.
        </p>
        <p class="catatan">
          Keduanya tetap tercatat di <code>spec/vocab/harga/</code> apa adanya, supaya cacah
          di layar ini bisa direkonsiliasi dengan cacah di sumbernya. Yang berubah hanya apa
          yang layar ini pilih untuk tampilkan.
        </p>
        <p class="catatan">${luar.map((x) => teks(x.n)).join(' · ')}</p>
      </details>` : ''}
    ${berangka.length ? `
      <section class="kelompok-harga">
        <h2><span>Ada angkanya</span><span class="cacah">${n(berangka.length)}</span></h2>
        <ul class="daftar-harga">
          ${berangka.map((x) => {
            const a = arah(x.u30);
            return `
            <li>
              <a class="baris-tautan" data-k="${teks(x.k)}" href="harga.html?k=${encodeURIComponent(x.k)}">
                <span class="nama">${teks(x.n)}${x.l === 'farmgate' ? '<span class="lencana lencana-pekebun">Harga pekebun</span>' : ''}${x.g && x.g !== x.n ? `<span class="lencana">${teks(x.g)}</span>` : ''}</span>
                <span class="harga-kini">${rp(x.p)}<span class="satuan">/${teks(x.s)}</span></span>
                <span class="ubah ${a.kelas}">${a.tanda} ${angkaId(Math.abs(x.u30 ?? 0))}% <span class="ubah-jangka">${jangka(x.u30h, 30)}</span></span>
              </a>
            </li>`;
          }).join('')}
        </ul>
      </section>` : ''}
    ${kosong.length ? `
      <section class="kelompok-harga">
        <h2><span>Terdaftar, tanpa angka</span><span class="cacah">${n(kosong.length)}</span></h2>
        <ul class="daftar-harga">
          ${kosong.map((x) => {
            const l = lanjutKosong(x.k);
            return `
            <li class="hasil-belum">
              <a class="baris-tautan" data-k="${teks(x.k)}" href="harga.html?k=${encodeURIComponent(x.k)}">
                <span class="nama">${teks(x.n)}</span>
                <span class="sub">diterbitkan SP2KP tanpa satu pun angka</span>
              </a>
              ${l ? `<a class="baris-lanjut" href="${l.u}">${teks(l.t)} <span aria-hidden="true">→</span></a>` : ''}
            </li>`;
          }).join('')}
        </ul>
      </section>` : ''}`;
}

// Yang buntu di layar ini belum tentu buntu di platform ini. Keempat pupuk tidak punya
// angka di SP2KP, tetapi jalur 3 memang membandingkan harga tebusnya dengan HET bersubsidi
// — dan kartu "tanpa angka" sendiri berjanji "mengarahkan pencarian ke tempat lain".
// Sampai 24 Agustus 2026 tempat lain itu tidak pernah ditautkan.
function lanjutKosong(k) {
  if (/^pupuk-/.test(k)) return { u: 'jalur-3.html', t: 'Bandingkan dengan HET bersubsidi' };
  return null;
}

// ---------------------------------------------------------------------------
// Grafik — SVG polos, digambar dari serinya sendiri
// ---------------------------------------------------------------------------
function grafik(seri, satuan) {
  if (seri.length < 2) return '';
  // viewBox memuat RUANG PLOT SAJA. Gutter untuk label dulu ikut di dalamnya (L/K/A/B);
  // sekarang jadi padding di .grafik-plot, karena labelnya sudah bukan penghuni viewBox.
  const W = 720, H = 200;

  const nilai = seri.map((p) => p.p);
  const minAsli = Math.min(...nilai), maksAsli = Math.max(...nilai);
  // Sumbu tidak dimulai dari nol, dan itu disengaja — tetapi karena itu ia WAJIB berlabel
  // di kedua ujungnya, supaya kenaikan 2% tidak terbaca sebagai kenaikan berlipat.
  const pad = (maksAsli - minAsli) * 0.08 || Math.max(1, maksAsli * 0.02);
  const lo = minAsli - pad, hi = maksAsli + pad;

  const t0 = new Date(seri[0].t).getTime();
  const t1 = new Date(seri.at(-1).t).getTime();
  // Pecahan 0..1 sepanjang sumbu; dipakai dua kali — sekali untuk koordinat viewBox,
  // sekali untuk `--f` pada label HTML. Satu sumber, jadi garis dan labelnya tidak
  // pernah bisa meleset satu sama lain.
  const fx = (t) => (new Date(t).getTime() - t0) / (t1 - t0 || 1);
  const fy = (v) => 1 - (v - lo) / (hi - lo || 1);

  const d = seri.map((p, i) =>
    `${i ? 'L' : 'M'}${(fx(p.t) * W).toFixed(1)} ${(fy(p.p) * H).toFixed(1)}`).join(' ');
  const isi = `M0 ${H} L${d.slice(1)} L${W} ${H} Z`;

  // Garis tahun sebagai penanda, bukan grid penuh: yang perlu dijawab mata "ini kapan",
  // dan kisi rapat pada layar 320 px justru menutupi garisnya sendiri.
  const tahun = [];
  for (let th = new Date(seri[0].t).getUTCFullYear() + 1; th <= new Date(seri.at(-1).t).getUTCFullYear(); th++) {
    const f = fx(`${th}-01-01`);
    if (f > 0.02 && f < 0.98) tahun.push({ th, f });
  }

  const akhir = seri.at(-1);
  return `
    <figure class="grafik">
      <div class="grafik-plot">
        <svg viewBox="0 0 ${W} ${H}" role="img" preserveAspectRatio="none"
             aria-label="Grafik garis harga ${teks(satuan)} dari ${teks(seri[0].t)} sampai ${teks(akhir.t)}, terendah ${rp(minAsli)}, tertinggi ${rp(maksAsli)}, terakhir ${rp(akhir.p)}.">
          <line class="g-sumbu" x1="0" y1="${H}" x2="${W}" y2="${H}"></line>
          ${tahun.map((t) => `<line class="g-tahun" x1="${(t.f * W).toFixed(1)}" y1="0" x2="${(t.f * W).toFixed(1)}" y2="${H}"></line>`).join('')}
          <path class="g-isi" d="${isi}"></path>
          <path class="g-garis" d="${d}"></path>
        </svg>
        <span class="g-label g-y g-y-atas">${rp(hi)}</span>
        <span class="g-label g-y g-y-bawah">${rp(lo)}</span>
        ${tahun.map((t) => `<span class="g-label g-x" style="--f:${t.f.toFixed(4)}">${t.th}</span>`).join('')}
        <span class="g-titik" style="--fy:${fy(akhir.p).toFixed(4)}" aria-hidden="true"></span>
      </div>
      <figcaption>
        ${teks(seri[0].t)} – ${teks(akhir.t)} · ${n(seri.length)} titik harian.
        <strong>Sumbu tegaknya tidak mulai dari nol</strong>, jadi tinggi garis menunjukkan
        perubahan, bukan besaran. Kedua ujungnya berlabel supaya bisa dibaca apa adanya.
      </figcaption>
    </figure>`;
}

// ---------------------------------------------------------------------------
// Nama jendela hanya dipakai kalau titik pembandingnya memang sedekat itu. Toleransinya
// seperempat lebar jendela — cukup untuk seri harian yang bolong akhir pekan, tidak cukup
// untuk seri penetapan yang terbit dua pekan sekali.
function jangka(hari, jendela) {
  if (hari === null || hari === undefined) return jendela >= 365 ? '1 tahun' : `${jendela} hari`;
  if (Math.abs(hari - jendela) <= jendela / 4)
    return jendela >= 365 ? '1 tahun' : `${jendela} hari`;
  if (hari >= 365) return `${angkaId(hari / 365, 1)} tahun`;
  return `${hari} hari`;
}

// Kartu-kartu rincian
// ---------------------------------------------------------------------------
function kartuAngka(h) {
  const s = h.statistik;
  // Label jangkanya JARAK SEBENARNYA ke titik pembanding, bukan nama jendelanya. Seri
  // penetapan tidak terbit tiap hari: pembanding "7 hari" Riau mitra plasma berumur 56 hari,
  // dan pembanding "30 hari" Aceh berumur 112. Menuliskan nama jendelanya membuat layar
  // menyatakan harga bergerak delapan kali lebih cepat daripada yang sebenarnya terjadi.
  const baris = [
    [jangka(s.ubahHari?.[7], 7), s.ubah7],
    [jangka(s.ubahHari?.[30], 30), s.ubah30],
    [jangka(s.ubahHari?.[90], 90), s.ubah90],
    [jangka(s.ubahHari?.[365], 365), s.ubah365],
  ]
    .filter(([l]) => l)
    // Jendela yang jatuh ke titik pembanding yang SAMA menghasilkan baris yang sama persis.
    // Riau mitra plasma menerbitkan tiap dua pekan, jadi jendela 7 hari dan 30 hari keduanya
    // mendarat di titik 56 hari lalu — dan tabelnya menampilkan "56 hari ▲ 8,1%" dua kali.
    // Yang berulang dibuang, bukan dibiarkan sebagai dua pengukuran yang seolah berbeda.
    .filter(([l], i, a) => a.findIndex(([m]) => m === l) === i);
  return `
    <div class="kartu">
      <h2>${teks(h.nama)}<span class="lencana">${teks(h.kelompok ?? 'Komoditas')}</span></h2>
      <p class="harga-besar">
        ${rp(s.terakhir.p)}<span class="satuan">/${teks(h.qty && h.qty !== 1 ? h.qty + ' ' : '')}${teks(h.satuan)}</span>
      </p>
      <p class="catatan">
        Per ${teks(tanggal(s.terakhir.t) ?? s.terakhir.t)} ·
        ${h.tingkat === 'farmgate'
          ? `harga pekebun, hasil penetapan ${teks(h.wilayah?.label ?? '')}`
          : 'eceran nasional tertimbang penduduk'}${h.tanggalNominal ? ' · tanggal harian bersifat nominal — yang ditetapkan periode, bukan hari' : ''}.
      </p>
      ${h.cakupanHukum ? `
        <div class="cakupan-hukum">
          <strong>Siapa yang dinaungi harga ini</strong>
          <p>${teks(h.cakupanHukum)}</p>
        </div>` : ''}

      <div class="ubah-baris">
        ${baris.map(([k, v]) => {
          const a = arah(v);
          return `<span class="ubah-keping ${a.kelas}">
            <span class="ubah-jangka">${teks(k)}</span>
            <strong>${a.tanda} ${angkaId(v === null ? null : Math.abs(v))}${v === null ? '' : '%'}</strong>
          </span>`;
        }).join('')}
      </div>

      <dl class="kunci">
        <dt>Terendah</dt><dd>${rp(s.min.p)} · ${teks(tanggal(s.min.t) ?? s.min.t)}</dd>
        <dt>Tertinggi</dt><dd>${rp(s.maks.p)} · ${teks(tanggal(s.maks.t) ?? s.maks.t)}</dd>
        <dt>Rata-rata</dt><dd>${rp(s.rata)}</dd>
        <dt>Gejolak</dt><dd>${angkaId(s.gejolak)}% koefisien variasi</dd>
      </dl>
      ${catatanLubang(h)}
      ${catatanAwalSeri(h)}
    </div>
    ${kartuPitaUmur(h)}${kartuRumus(h)}`;
}

// Harga per pita umur tanaman. Satu kebun hanya menghadapi PITANYA SENDIRI — angka rerata
// yang tergambar di grafik atas tidak berlaku untuk kebun mana pun secara khusus, dan tabel
// ini yang membuat pembacanya bisa menemukan barisnya.
function kartuPitaUmur(h) {
  const a = h.pitaUmur;
  if (!a?.pita?.length) return '';
  const nilai = a.pita.map((u) => a.terakhir[u]).filter((x) => x > 0);
  const lo = Math.min(...nilai), hi = Math.max(...nilai);
  // Sumbu tabel datang dari DATA, bukan dari perender ini. Aceh menetapkan harga pekebun
  // swadayanya menurut komposisi tenera/dura, bukan menurut umur; menempelkan "tahun" pada
  // tiap pita akan menayangkan "40 tahun" untuk kebun yang 40% teneranya. Bawaan tetap umur
  // supaya seri lama tak berubah, tapi bawaan itu boleh dibantah datanya.
  const sumbu = a.sumbu ?? { judul: 'Umur tanaman', sufiks: ' tahun' };
  const adaBarat = a.barat && Object.keys(a.barat).length > 0;
  return `
    <div class="kartu">
      <h2>Harga menurut ${teks(sumbu.judul.toLowerCase())}</h2>
      <p class="catatan">${teks(a.keterangan)}</p>
      <div class="pembungkus-tabel">
        <table>
          <thead><tr>
            <th>${teks(sumbu.judul)}</th>
            <th>${adaBarat ? 'Wilayah timur' : 'Harga per kg'}</th>
            ${adaBarat ? '<th>Wilayah barat</th>' : ''}
            <th>Terhadap yang tertinggi</th>
          </tr></thead>
          <tbody>${a.pita.map((u) => {
            const v = a.terakhir[u], b = a.barat?.[u];
            return `<tr>
              <td>${teks(u)}${teks(sumbu.sufiks)}</td>
              <td class="angka">${v > 0 ? rp(v) : '—'}</td>
              ${adaBarat ? `<td class="angka">${b > 0 ? rp(b) : '—'}</td>` : ''}
              <td><span class="bilah-isi" style="--isi:${v > 0 ? Math.round((v / hi) * 100) : 0}%"></span></td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>
      <p class="catatan">
        Selisih antara pita terendah dan tertinggi <strong>${rp(hi - lo)} per kg</strong>
        (${angkaId(((hi - lo) / lo) * 100)}%).
        ${a.grafik ? `${teks(a.grafik)} ` : ''}Angka pada grafik di atas karena itu
        <strong>tidak berlaku untuk satu kebun pun secara umum</strong> — tiap kebun
        menghadapi pitanya sendiri, dan pitanya jarang yang dipakai garis itu.
      </p>
      ${adaBarat ? `<p class="catatan">
        Provinsi ini menetapkan <strong>dua harga untuk satu periode</strong>, terbelah menurut
        wilayah. Selisihnya kecil tapi konsisten — wilayah barat selalu di bawah — dan ia
        bagian dari penetapannya, bukan pembulatan. Garis grafik memakai wilayah timur.
      </p>` : ''}
    </div>`;
}

// Rumus di balik harganya. docs/16 aturan tayang butir 3 menuntut faktor konversi tampil
// terbuka dan bisa diperiksa, bukan tersembunyi di balik satu angka jadi.
function kartuRumus(h) {
  const f = h.rumus;
  if (!f?.terakhir && !f?.rendemen) return '';
  const t = f.terakhir;
  return `
    <div class="kartu">
      <h2>Angka yang membentuknya</h2>
      ${f.keterangan ? `<p class="catatan">${teks(f.keterangan)}</p>` : ''}
      ${t ? `
        <dl class="kunci">
          ${t.indeks_k !== undefined ? `<dt>Indeks K</dt><dd>${angkaId(t.indeks_k, 2)}%</dd>` : ''}
          ${t.cpo !== undefined ? `<dt>Harga CPO</dt><dd>${rp(t.cpo)} / kg</dd>` : ''}
          ${t.pko !== undefined ? `<dt>Harga inti sawit</dt><dd>${rp(t.pko)} / kg</dd>` : ''}
        </dl>
        <p class="catatan">
          <strong>Indeks K adalah proporsi nilai CPO yang mengalir ke pekebun.</strong> Ia yang
          menjawab kenapa harga TBS jauh di bawah harga CPO: satu kilogram tandan bukan satu
          kilogram minyak. Membandingkan keduanya tanpa melewati indeks ini membuat jurangnya
          tampak berlipat-lipat padahal tidak.
        </p>` : ''}
    </div>
    ${kartuRendemen(h)}`;
}

// Rendemen per pita umur — kartu yang paling langsung menjawab aturan tayang docs/16 butir 3
// dan koreksi bagian 7a sekaligus.
//
// KENAPA IA LAYAK KARTU SENDIRI, BUKAN SATU BARIS DI KARTU RUMUS
// Rendemen adalah faktor yang mengubah "harga CPO dunia" jadi angka yang berarti bagi pekebun.
// Tanpanya, TBS terhadap CPO tampak 7,26× dan petani menyimpulkan dirinya ditipu tujuh kali
// lipat; dengannya, 1,43×. Selisih pembacaan sebesar itu tidak boleh bersembunyi di dalam
// satu bilangan yang tidak pernah diperlihatkan.
//
// DAN KENAPA IA TIDAK BOLEH TAMPIL SEBAGAI SATU ANGKA
// Rendemen berbeda menurut UMUR TANAMAN. Satu angka nasional memperlakukan seluruh kebun
// seolah setua satu sama lain, dan itu persis kekeliruan yang membuat docs/16 memakai 21%
// selama ini: angka itu rendemen kebun TUA, dipakai untuk semua umur.
//
// SELURUH ANGKA DI KARTU INI DITURUNKAN, TIDAK SATU PUN DITULIS
// Versi pertamanya menulis "selisih 2,53 poin", "kedelapan bilah", dan "Kalimantan Timur
// satu-satunya provinsi yang menerbitkannya" — ketiganya benar ketika Kaltim memang satu-
// satunya. Aceh masuk, dan ketiganya jadi salah di layar yang sama: 6,01 poin, tigabelas
// bilah, dan dua provinsi. Kalimat yang menghitung sendiri tidak bisa basi seperti itu.
function kartuRendemen(h) {
  const r = h.rumus?.rendemen;
  if (!r?.terakhir) return '';
  // Urutan pita diambil dari tabel harga di kartu atas supaya '10-20' jatuh di antara 9 dan
  // 21, bukan di belakang 25. Pita yang hanya ada di salah satunya tetap ikut, di belakang.
  const acuan = h.pitaUmur?.pita ?? [];
  const pita = Object.keys(r.terakhir)
    .sort((a, b) => (acuan.indexOf(a) + 1 || 99) - (acuan.indexOf(b) + 1 || 99));
  const nilai = pita.map((u) => r.terakhir[u]).filter((x) => x > 0);
  if (nilai.length < 2) return '';
  const lo = Math.min(...nilai), hi = Math.max(...nilai);
  const adaInti = r.inti_terakhir && Object.keys(r.inti_terakhir).length > 0;
  const pct = (x) => `${angkaId(x * 100, 2)}%`;
  const wilayah = h.wilayah?.label ?? h.wilayah ?? 'provinsi ini';

  return `
    <div class="kartu">
      <h2>Rendemen menurut umur tanaman
        <span class="lencana">Faktor konversi</span>
      </h2>
      <p class="catatan">
        Berapa kilogram minyak sawit yang keluar dari satu kilogram tandan. ${r.tetap
          ? `Nilainya <strong>identik di seluruh penetapan yang terbaca</strong> — ia tabel
             patokan yang dipakai ${teks(wilayah)} untuk MENGHITUNG harga, bukan rendemen yang
             terukur di pabrik.`
          : `Angka ini <strong>ditetapkan di surat keputusannya sendiri</strong>, bukan
             diasumsikan, dan berubah dari penetapan ke penetapan.`}
      </p>

      <div class="pembungkus-tabel">
        <table>
          <thead><tr>
            <th>Umur tanaman</th><th>Rendemen CPO</th>
            ${adaInti ? '<th>Rendemen inti</th>' : ''}
            <th>Letak dalam rentang ${pct(lo)}–${pct(hi)}</th>
          </tr></thead>
          <tbody>${pita.map((u) => {
            const v = r.terakhir[u];
            const i = r.inti_terakhir?.[u];
            return `<tr>
              <td>${teks(String(u).replace('>=', '≥'))} tahun</td>
              <td class="angka">${v > 0 ? pct(v) : '—'}</td>
              ${adaInti ? `<td class="angka">${i > 0 ? pct(i) : '—'}</td>` : ''}
              <td><span class="bilah-isi" style="--isi:${v > 0 ? Math.round(((v - lo) / (hi - lo)) * 100) : 0}%"></span></td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>

      <p class="catatan">
        Bilah di kolom terakhir <strong>dimulai dari nilai terendah, bukan dari nol.</strong>
        Diukur dari nol, ${nilai.length} bilahnya akan tampak nyaris sama panjang — selisih
        ${angkaId((hi - lo) * 100, 2)} poin kecil dibanding ${pct(hi)}. Yang ditunjukkan di
        sini urutannya, dan karena sumbunya dipotong, itu dinyatakan alih-alih dibiarkan
        tertebak.
      </p>
      <p class="catatan catatan-tegas">
        <strong>Rentangnya ${pct(lo)} sampai ${pct(hi)} — selisih
        ${angkaId((hi - lo) * 100, 2)} poin menurut umur saja.</strong> Karena itu satu angka
        rendemen nasional menyesatkan: ia memperlakukan kebun muda dan kebun tua seolah
        menghasilkan minyak sama banyak. Kebun muda menghasilkan jauh lebih sedikit, dan harga
        TBS-nya lebih rendah justru karena itu — bukan karena ia dihargai tidak adil.
      </p>
      <p class="catatan">
        Rendemen juga berbeda antar-<em>pabrik</em>, dan selisihnya lebih besar lagi. Angka di
        sini rendemen yang <strong>ditetapkan untuk menghitung harga</strong>, bukan yang
        terukur di pabrik tempat tandan itu benar-benar diolah.
        ${r.median ? `Median seluruh penetapan yang terbaca: <strong>${pct(r.median)}</strong>.` : ''}
      </p>
    </div>`;
}

// Dua catatan yang keduanya mencegah angka benar dibaca keliru.
//
// LUBANG. "299 hari kalender tanpa angka" terbaca sebagai data yang rusak, padahal
// sebagian besarnya akhir pekan — SP2KP tidak mencacah Sabtu dan Minggu, yang saja 28,5%
// hari kalender. Menyebut jumlahnya tanpa menyebut sebabnya menakut-nakuti tanpa memberi
// tahu apa pun; menyembunyikannya menutupi seri yang memang benar-benar bolong. Jadi
// keduanya disebut, dan akhir pekannya dihitung, bukan ditaksir.
// ---------------------------------------------------------------------------
// Harga yang BENAR-BENAR diterima — C4 sisi petani, separuh yang tidak mengumpulkan
// ---------------------------------------------------------------------------
// C4 berbunyi "eceran dipinjam, harga petani DIBANGUN", dan sisi petaninya tertulis
// sebagai setoran: berapa yang benar-benar diterima, dan maukah petani menyetorkannya.
// Setoran itu pengumpulan, dan lapisan gratis tidak mengumpulkan — ia juga cara termurah
// memalsukan harga, persis alasan G6 menuntut sumbangan datang sebagai efek samping
// catatan musim, bukan dari formulir terbuka.
//
// Tetapi pertanyaan yang mau dijawab setoran itu punya separuh yang tidak menuntut satu
// byte pun berpindah: PETANI SUDAH TAHU HARGANYA SENDIRI. Yang tidak ia punya acuannya.
// Blok ini memberi acuan itu dan menghitung di perangkat; angkanya tidak dikirim ke mana
// pun, dan memang tidak ada tempat mengirimkannya.
//
// HANYA PADA SERI FARMGATE, dan itu penjagaan bukan keterbatasan. Membandingkan harga
// yang diterima petani dengan seri ECERAN menghasilkan jurang yang benar angkanya dan
// salah artinya — ia margin pemasaran sepanjang rantai, bukan selisih yang ditanggung
// satu pembeli. docs/16 mengukur bentuk kekeliruan yang sama pada sawit: TBS terhadap CPO
// dunia tampak 7,26x padahal 1,52x, "dan petani akan menyimpulkan dirinya ditipu tujuh
// kali lipat".
//
// CAKUPAN HUKUM IKUT, DAN BUKAN SEBAGAI CATATAN KAKI. Penetapan TBS menaungi pekebun
// mitra dan plasma; pekebun SWADAYA berada di luarnya, dan merekalah mayoritas petani
// sawit Indonesia. Petani swadaya yang membandingkan harganya ke penetapan plasma lalu
// menyimpulkan dirinya dirugikan sedang membandingkan diri ke harga yang secara hukum
// bukan haknya. Itu keterangan yang mengubah kesimpulan, jadi ia dicetak bersama hasilnya.
function kartuHargaSaya(h) {
  const akhir = h.seri?.at(-1);
  if (!akhir) return '';
  if (h.tingkat !== 'farmgate') {
    return `
      <div class="kartu">
        <h2>Kenapa layar ini tidak membandingkan harga Anda</h2>
        <p>Seri ini <strong>harga eceran</strong> — yang dibayar pembeli di pasar, bukan yang
        diterima petani di kebun. Selisih keduanya margin pemasaran sepanjang rantai, dan
        menampilkannya sebagai perbandingan membuat angka yang benar terbaca sebagai
        kerugian yang ditanggung satu pembeli.</p>
        <p class="catatan">Pembandingan hanya ditawarkan pada seri tingkat pekebun. Dari
        ${n(96)} seri yang ada, ${n(8)} di antaranya tingkat pekebun — dan seluruhnya sawit.
        Untuk pangan pokok belum ada satu pun acuan tingkat petani di indeks ini.</p>
      </div>`;
  }
  const id = teks(h.key);
  return `
    <div class="kartu kartu-harga-saya">
      <h2>Berapa yang benar-benar Anda terima?</h2>
      <p>Penetapan di atas angka acuan. Yang menentukan apakah Anda dirugikan bukan angka
      itu sendiri, melainkan jaraknya ke yang benar-benar masuk ke tangan Anda.</p>
      <label for="hs-${id}">Harga yang Anda terima (Rp per ${teks(h.satuan)})</label>
      <input type="number" id="hs-${id}" class="hs-nilai" inputmode="decimal" min="0" step="1"
             placeholder="misal ${Math.round(akhir.p)}">
      <p class="aksi-hs"><button type="button" class="hs-hitung">Bandingkan</button></p>
      <p class="hs-hasil" role="status" aria-live="polite"></p>
      <p class="catatan catatan-tegas">
        <strong>Angka ini tidak dikirim ke mana pun.</strong> Ia dihitung di perangkat Anda dan
        hilang begitu halaman ditutup. Tidak ada tempat mengirimkannya, dan itu disengaja:
        harga yang diketik ke formulir terbuka adalah harga yang paling murah dipalsukan.
      </p>
      ${h.cakupanHukum ? `<p class="catatan">${teks(h.cakupanHukum)}</p>` : ''}
    </div>`;
}

function pasangHargaSaya(wadah, h) {
  const kotak = wadah.querySelector('.kartu-harga-saya');
  if (!kotak) return;
  const akhir = h.seri.at(-1);
  kotak.querySelector('.hs-hitung').addEventListener('click', () => {
    const hasil = kotak.querySelector('.hs-hasil');
    const p = Number(kotak.querySelector('.hs-nilai').value);
    if (!Number.isFinite(p) || p <= 0) {
      hasil.textContent = 'Isi harga yang Anda terima lebih dulu.';
      return;
    }
    const r = akhir.p;
    const rasio = (p / r) * 100;
    const selisih = p - r;
    // Umur acuan ikut, karena penetapan tidak terbit tiap hari — alasan yang sama yang
    // membuat kartu angka menuliskan jarak sebenarnya, bukan nama jendelanya.
    const umur = Math.round((Date.now() - Date.parse(akhir.t)) / 86400000);
    const arah = selisih === 0 ? 'sama dengan' : selisih > 0 ? 'di atas' : 'di bawah';
    hasil.innerHTML = `
      Rp ${angkaId(p, 0)} per ${teks(h.satuan)} itu <strong>${angkaId(rasio, 1)}%</strong>
      dari penetapan terakhir — ${arah}nya sebesar
      <strong>Rp ${angkaId(Math.abs(selisih), 0)}</strong> per ${teks(h.satuan)}.
      Acuannya Rp ${angkaId(r, 0)} pada ${teks(tanggal(akhir.t) ?? akhir.t)}${
        Number.isFinite(umur) ? `, ${angkaId(umur, 0)} hari lalu` : ''}.`;
  });
}

function catatanLubang(h) {
  const bolong = h.cakupan?.gaps ?? 0;
  if (!bolong) return '';
  const a = new Date(h.cakupan.from), b = new Date(h.cakupan.to);
  let akhirPekan = 0;
  for (let t = a.getTime(); t <= b.getTime(); t += 86400000) {
    const d = new Date(t).getUTCDay();
    if (d === 0 || d === 6) akhirPekan++;
  }
  const sisa = Math.max(0, bolong - akhirPekan);
  return `
    <p class="catatan">
      <strong>${n(bolong)} hari kalender di dalam rentang ini tidak punya angka</strong> —
      ${n(Math.min(akhirPekan, bolong))} di antaranya akhir pekan, yang memang tidak dicacah.
      ${sisa > 0 ? `Sisanya ${n(sisa)} hari: hari libur, dan pada sebagian seri juga hari yang benar-benar terlewat.` : ''}
      Garis grafiknya menyambung langsung antar titik yang ada — tidak ada nilai yang
      diisikan diam-diam.
    </p>`;
}

// AWAL SERI. Seri SP2KP mulai 1 Februari 2024, di tengah lonjakan harga pangan: 40 dari 43
// komoditas mencapai puncak tertingginya pada Februari–Mei 2024, dan 38 dari 43 mencapai
// titik terendahnya di jendela yang sama. Maka "tertinggi" dan "terendah" di kartu ini
// lebih banyak berkata tentang KAPAN SERINYA DIMULAI daripada tentang komoditasnya —
// dan angka yang benar tetap bisa menyesatkan kalau asalnya tidak disebut.
const AWAL_JENDELA = 120;
function catatanAwalSeri(h) {
  // Hanya berlaku untuk seri SP2KP. Kalimatnya menyebut "SP2KP mulai mencatat 1 Februari
  // 2024" dan angka "40 dari 43" — keduanya tentang dataset itu, bukan tentang penetapan TBS
  // provinsi yang mulai pada tanggal lain. Menyalakannya di sana akan menempelkan sebab yang
  // salah pada pengamatan yang kebetulan berbentuk sama.
  if (h.sistem && h.sistem !== 'SP2KP') return '';
  const s = h.statistik;
  const a = new Date(h.cakupan.from).getTime();
  const dalam = (t) => (new Date(t).getTime() - a) / 86400000 <= AWAL_JENDELA;
  const kena = [dalam(s.min.t) && 'terendahnya', dalam(s.maks.t) && 'tertingginya'].filter(Boolean);
  if (!kena.length) return '';
  return `
    <p class="catatan">
      <strong>${kena.join(' dan ')} jatuh di empat bulan pertama seri ini.</strong> SP2KP mulai
      mencatat 1 Februari 2024, di tengah lonjakan harga pangan — 40 dari 43 komoditas
      mencapai puncaknya dan 38 dari 43 mencapai titik terendahnya pada jendela yang sama.
      Angka itu benar, tetapi ia lebih banyak berkata tentang kapan pencatatannya dimulai
      daripada tentang komoditas ini.
    </p>`;
}

function kartuMusim(h) {
  const m = h.statistik?.musim;
  if (!m) {
    return `
      <div class="kartu">
        <h2>Pola bulanan</h2>
        <p class="kosong">
          Tidak dihitung. Serinya belum melewati dua belas bulan penuh, dan pola musim yang
          ditarik dari kurang dari setahun adalah pola yang dikarang, bukan yang ditemukan.
        </p>
      </div>`;
  }
  return `
    <div class="kartu">
      <h2>Pola bulanan</h2>
      <dl class="kunci">
        <dt>Rata-rata tertinggi</dt><dd>${teks(BULAN[m.bulanTertinggi - 1])}</dd>
        <dt>Rata-rata terendah</dt><dd>${teks(BULAN[m.bulanTerendah - 1])}</dd>
        <dt>Selisih keduanya</dt><dd>${angkaId(m.rentangPersen)}%</dd>
      </dl>
      <p class="catatan">
        Dihitung dari rata-rata tiap bulan kalender sepanjang seri ini.
        <strong>Ini pola yang sudah terjadi, bukan ramalan.</strong> Dua setengah tahun
        adalah dua sampai tiga pengamatan per bulan — cukup untuk menyebut pola, tidak cukup
        untuk menjanjikannya berulang.
      </p>
    </div>`;
}

// Dua pemeriksaan berdampingan, dan bentuknya sengaja menahan yang satu agar tidak
// meminjam wibawa yang lain.
//
// Yang paling mudah keliru di sini adalah membuat "lolos periksa mesin" terbaca sebagai
// "sudah diperiksa". Ia bukan itu. Ia menyatakan tiga hal yang sempit dan bisa dihitung:
// tiap angka di kalimat memang ada di data, medan batasnya terisi, dan tidak ada ramalan
// maupun anjuran. Ia sama sekali tidak menyentuh pertanyaan apakah kalimatnya membaca
// angkanya dengan jujur — dan justru itu yang menentukan apakah pembacanya tersesat.
//
// Karena itu keduanya digambar sebagai dua baris setara, masing-masing dengan keadaannya
// sendiri, dan yang belum terpenuhi TIDAK ditulis lebih kecil atau lebih pucat daripada
// yang sudah. Satu centang hijau sendirian di kartu ini akan berbohong tanpa satu kata pun
// yang salah.
function kartuKomentar(h) {
  const k = h.komentar;
  if (!k) return '';
  const penulis = k.sumber === 'model' ? 'model bahasa' : 'aturan atas angkanya sendiri';
  const p = k.periksa;

  const barisMesin = !p
    ? {
      kelas: 'belum',
      tanda: '–',
      judul: 'Periksa mesin — belum dijalankan',
      isi: 'Jalankan <code>node spec/tools/periksa-komentar-harga.mjs --tulis</code>.',
    }
    : p.lolos
      ? {
        kelas: 'lolos',
        tanda: '✓',
        judul: 'Lolos periksa mesin',
        isi: 'Tiap angka di kalimat ini ada di data yang dipakai menulisnya, batasnya disebut, '
          + 'dan tidak ada ramalan maupun anjuran. <strong>Itu saja yang diperiksa</strong> — '
          + 'aritmetikanya bisa ditelusuri, bacaannya belum tentu jujur.',
      }
      : {
        kelas: 'gagal',
        tanda: '✕',
        judul: 'TIDAK lolos periksa mesin',
        isi: `<strong>${teks((p.masalah ?? []).join(' · '))}</strong> Kalimat ini tetap ditampilkan `
          + 'apa adanya, karena menyembunyikannya menghapus satu-satunya tanda bahwa ada yang keliru.',
      };

  const barisOrang = k.ditinjau
    ? {
      kelas: 'lolos',
      tanda: '✓',
      judul: `Ditinjau ${teks(k.oleh ?? 'tanpa nama')} pada ${teks(tanggal(k.ditinjau) ?? k.ditinjau)}`,
      isi: 'Seorang manusia membaca kalimat ini dan bertanggung jawab atas bacaannya. '
        + 'Tinjauan itu menempel pada susunan angka yang ia baca — begitu serinya bertambah '
        + 'dan kalimatnya ditulis ulang, ia gugur sendiri.',
    }
    : {
      kelas: 'belum',
      tanda: '–',
      judul: 'Belum ditinjau manusia',
      isi: 'Belum ada seorang pun yang membaca kalimat ini dan menempelkan namanya. '
        + 'Inilah yang menahan tingkatnya di D, dan bukan sesuatu yang bisa diselesaikan mesin.',
    };

  const baris = (b) => `
    <li class="periksa-${b.kelas}">
      <span class="periksa-tanda" aria-hidden="true">${b.tanda}</span>
      <span>
        <strong>${b.judul}</strong>
        <span class="periksa-isi">${b.isi}</span>
      </span>
    </li>`;

  return `
    <div class="kartu komentar">
      <h2>Bacaan angka ini
        <span class="lencana lencana-d">Tingkat ${k.ditinjau ? 'C' : 'D'} · ${k.ditinjau ? 'sudah ditinjau' : 'belum ditinjau'}</span>
      </h2>
      <p class="komentar-teks">${teks(k.teks)}</p>

      <ul class="periksa-daftar">
        ${baris(barisMesin)}
        ${baris(barisOrang)}
      </ul>

      <p class="catatan catatan-tegas">
        <strong>Kalimat di atas ditulis ${teks(penulis)}, bukan orang.</strong> Angkanya
        bertingkat B — survei resmi Kemendag, disalin apa adanya — tetapi kalimat ini
        <em>tafsir</em> atas angka itu, dan tafsir tidak mewarisi tingkat sumbernya. Angka
        yang dipakai menulisnya disimpan bersamanya di
        <code>spec/vocab/harga/komentar.json</code>, jadi ia bisa diperiksa tanpa memercayai
        penulisnya — dan daftar tinjauannya sudah siap di
        <code>docs/18-tinjauan-komentar-harga.md</code>.
      </p>
    </div>`;
}

function kartuKosong(h) {
  return `
    <div class="kartu peringatan">
      <h2>${teks(h.nama)} — terdaftar, tanpa angka</h2>
      <p>${teks(h.kosong)}</p>
      <p class="catatan">
        Halaman ini menampilkannya alih-alih menghilangkannya karena hasil pencarian nol
        terbaca sebagai <em>"tidak ada harganya di mana pun"</em>. Yang benar:
        <strong>sumber ini mendaftarkannya dan tidak mengisinya</strong> — dan itu
        mengarahkan pencarian ke tempat lain, bukan menghentikannya.
      </p>
    </div>`;
}

// ---------------------------------------------------------------------------
// Buka satu komoditas
// ---------------------------------------------------------------------------
// Strip tingkat DITUKAR, tidak disembunyikan. Bentuk lamanya menyetel `hidden` saat seri
// pekebun dibuka, dan keadaan tersembunyi itu bocor: cabang popstate tidak pernah
// mengembalikannya, jadi menutup seri sawit lewat tombol Back menampilkan kembali 38 harga
// eceran tanpa satu pun peringatan di atasnya. Yang selalu ada dan hanya berganti isi tidak
// punya keadaan yang bisa bocor.
const STRIP = {
  retail: {
    judul: 'Harga eceran — bukan harga petani',
    sub: 'Yang dibayar pembeli di pasar konsumen.',
    isi: `
      <p>
        Berapa yang benar-benar diterima petani <strong>tidak ada di sini</strong>, dan
        tidak ada di sumber terbuka mana pun.
      </p>
      <p>
        Bahkan yang dicatat negara sebagai "harga produsen" pun sebenarnya
        <strong>harga beli pengumpul</strong> — respondennya pengumpul, penggilingan, dan
        pedagang. Di Kabupaten Karawang, salah satu lumbung padi terbesar Indonesia,
        respondennya <strong>satu orang</strong>. Jaraknya terpasang di dalam definisi,
        bukan celah cakupan yang bisa dirapatkan dengan menambah sampel.
      </p>`,
  },
  farmgate: {
    judul: 'Harga di tingkat pekebun',
    sub: 'Yang diterima pekebun, hasil penetapan — bukan survei pasar.',
    isi: `
      <p>
        Seri ini <strong>bukan harga eceran</strong>. Angkanya ditetapkan tim penetapan
        provinsi, jadi ia memang harga yang dihadapi pekebun — dan itu membuatnya satu dari
        sedikit sekali seri di halaman ini yang boleh dibaca begitu.
      </p>
      <p>
        Yang dinaungi penetapan ini hanya pekebun yang <strong>bermitra</strong>. Di luar
        kemitraan, harganya urusan tawar-menawar dengan pabrik, dan angka itu tidak
        diterbitkan di mana pun. Untuk pangan pokok belum ada satu pun acuan tingkat petani.
      </p>`,
  },
};

function aturTingkat(h) {
  if (!el.strip) return;
  const s = STRIP[h?.tingkat === 'farmgate' ? 'farmgate' : 'retail'];
  el.strip.dataset.tingkat = h?.tingkat === 'farmgate' ? 'farmgate' : 'retail';
  el.strip.querySelector('.st-judul').textContent = s.judul;
  el.strip.querySelector('.st-sub').textContent = s.sub;
  el.stripIsi.innerHTML = s.isi;
  ukurTempelan();
}

// Daftar dan rincian tidak pernah tampil bersamaan. Sampai 24 Agustus 2026 rinciannya
// DITAMBAHKAN di bawah daftar yang tetap penuh — di ponsel itu 5.712 px daftar yang harus
// dilewati sebelum jawaban atas komoditas yang justru diminta lewat URL. Membuka satu
// komoditas berarti mengganti layar, bukan memanjangkannya.
function tampilkanDaftar(ya) {
  el.daftar.hidden = !ya;
  if (el.form) el.form.hidden = !ya;
  // Lede berbicara untuk DAFTAR ("harga eceran harian nasional beserta riwayatnya"), dan
  // di layar satu komoditas ia mengulang apa yang sudah dikatakan strip tepat di bawahnya.
  // Menyimpannya menghemat ~50 px chrome sebelum angka yang justru diminta.
  if (el.lede) el.lede.hidden = !ya;
}

// Posisi gulir daftar saat satu komoditas dibuka.
//
// Pemulihan bawaan peramban TIDAK bisa dipakai, dan juga tidak boleh dibiarkan menyala.
// Daftar disembunyikan sebelum pasangKembali() mendorong entri riwayatnya, jadi yang
// terekam di entri daftar adalah tinggi dokumen yang sudah runtuh — gulir 0. Lebih buruk:
// pemulihan itu berjalan SESUDAH popstate, jadi ia menimpa gulir yang baru saja dipasang
// tutupRincian(). Terukur: 4.361 px dipasang, lalu dikembalikan ke 0 sebelum bingkai
// pertama. `manual` mematikannya; sejak itu halaman ini yang bertanggung jawab penuh.
try { history.scrollRestoration = 'manual'; } catch { /* peramban lawas: biarkan bawaan */ }

// null berarti layar ini tidak dibuka dari daftar (tautan langsung, atau tombol Forward).
let gulirDaftar = null;

function tutupRincian(key) {
  aturTingkat(null);
  el.judul.textContent = 'Harga komoditas';
  document.title = 'Harga komoditas — Pranatani';
  tampilkanDaftar(true);
  // Alamat dibersihkan di tempat: kalau halaman dibuka LANGSUNG di ?k=..., tombol Back
  // mengembalikan entri yang alamatnya masih memuat ?k= padahal layarnya sudah daftar.
  try { history.replaceState(history.state, '', 'harga.html'); } catch { /* diabaikan */ }

  // Fokus pulang ke baris yang tadi dibuka, bukan ke pucuk halaman. Yang membuka
  // "Udang Basah" dari baris ke-37 dulu dilempar ke kepala daftar: 4.361 px — lima layar
  // ponsel — untuk kembali ke tempatnya semula.
  const a = key && el.daftar.querySelector(`.baris-tautan[data-k="${CSS.escape(key)}"]`);
  a?.focus({ preventScroll: true });

  // Membaca scrollHeight memaksa tata letak dihitung ulang SEKARANG. Daftar baru saja lepas
  // dari `hidden`, dan gulir yang diminta akan dijepit ke tinggi dokumen yang berlaku saat
  // itu — kalau tingginya belum dihitung, jepitannya memakai dokumen yang masih runtuh.
  void document.documentElement.scrollHeight;

  // Bentuk dua-argumen, bukan objek: `behavior: 'instant'` belum dikenal WebView lawas, dan
  // permukaan ini memang menyasar ponsel entry-level.
  if (gulirDaftar !== null) scrollTo(0, gulirDaftar);
  else if (a) a.scrollIntoView({ block: 'center' });   // tautan langsung: barisnya yang dicari
  else el.q?.focus();
  gulirDaftar = null;
}

// Tautan mati tidak perlu perjalanan jaringan untuk dikenali: kepalanya sudah di memori.
// Membedakannya dari sambungan putus penting karena nasihatnya berlawanan — yang satu
// "coba lagi", yang satu "tautan ini tidak akan pernah berhasil".
function layarTakDikenal(key) {
  const berangka = kepala.filter((x) => TANI(x) && !x.kosong).length;
  const sepi = kepala.filter((x) => TANI(x) && x.kosong).length;
  return `
    <div class="kartu peringatan">
      <h2>Komoditas ini tidak ada di indeks harga</h2>
      <p>
        <code>${teks(key)}</code> tidak terdaftar. Kemungkinan besar tautannya dibuat
        sebelum daftar ini disusun ulang — <strong>mengulang tidak akan menolong</strong>,
        karena bukan sambungan yang bermasalah.
      </p>
      <p class="catatan">
        Yang ada sekarang: ${n(berangka)} komoditas berangka dan ${n(sepi)} yang terdaftar
        tanpa angka.
      </p>
    </div>`;
}

async function buka(key) {
  tampilkanDaftar(false);
  el.rincian.innerHTML = '<p class="kosong">Mengambil riwayat harganya…</p>';
  el.rincian.focus();

  const selesai = () => pasangKembali(el.rincian, {
    alamat: `harga.html?k=${encodeURIComponent(key)}`,
    sesudah: () => tutupRincian(key),
  });

  if (kepala.length && !kepala.some((x) => x.k === key)) {
    el.rincian.innerHTML = layarTakDikenal(key) + tombolKembali();
    return selesai();
  }

  try {
    const h = await ambil(`harga/${key}`);
    document.title = `Harga ${h.nama} — Pranatani`;
    el.judul.textContent = `Harga ${h.nama}`;

    aturTingkat(h);
    el.rincian.innerHTML = h.seri?.length
      ? kartuAngka(h) + grafik(h.seri, `${h.nama} per ${h.satuan}`) + kartuHargaSaya(h) + kartuMusim(h) + kartuKomentar(h) + tombolKembali()
      : kartuKosong(h) + lanjutKartu(key) + tombolKembali();
    pasangHargaSaya(el.rincian, h);
    selesai();
  } catch (e) {
    // pesanGagalMuat memisahkan "sambungan putus" dari "peladen menjawab, berkasnya tidak
    // ada", dan hanya yang pertama yang menawarkan "Coba lagi".
    el.rincian.innerHTML = pesanGagalMuat(e) + tombolKembali();
    pasangCobaLagi(el.rincian, () => buka(key));
    selesai();
  }
}

// Kartu "tanpa angka" berjanji "mengarahkan pencarian ke tempat lain". Ini tempat lainnya.
function lanjutKartu(key) {
  const l = lanjutKosong(key);
  if (!l) return '';
  return `<p class="lanjut-kartu"><a class="baris-lanjut" href="${l.u}">${teks(l.t)} <span aria-hidden="true">→</span></a></p>`;
}

const tombolKembali = () =>
  '<button type="button" class="kembali" id="kembali">← Kembali ke daftar komoditas</button>';

// ---------------------------------------------------------------------------
// Pencarian di dalam daftar
// ---------------------------------------------------------------------------
// Daftarnya 88 baris dan sudah ada di memori, jadi penyaringannya di sini — tanpa jeda,
// tanpa perjalanan jaringan. Kotak pencarian beranda yang menjangkau seluruh indeks.
let jeda;
el.q.addEventListener('input', () => {
  clearTimeout(jeda);
  jeda = setTimeout(() => gambarDaftar(el.q.value), 120);
});
document.getElementById('formCari').addEventListener('submit', (ev) => {
  ev.preventDefault();
  clearTimeout(jeda);
  gambarDaftar(el.q.value);
});

el.daftar.addEventListener('click', (ev) => {
  const a = ev.target.closest('a[href^="harga.html?k="]');
  if (!a) return;
  ev.preventDefault();
  const k = new URL(a.href, location.href).searchParams.get('k');
  if (!k || !BENTUK_KEY.test(k)) return;
  // Diingat SEBELUM buka() menyembunyikan daftar — sesudah itu tinggi dokumen runtuh dan
  // scrollY sudah 0.
  gulirDaftar = Math.round(scrollY);
  // Entri riwayatnya didorong pasangKembali(), bukan di sini. Mendorongnya di kedua tempat
  // menghasilkan dua entri per layar — dan itu persis bug yang membuat tombol Back
  // perangkat MEMBUKA KEMBALI komoditas yang baru saja ditutup.
  buka(k);
});

addEventListener('popstate', () => {
  // pustaka.js menutup layar rincian lewat `tutupKini` pada popstate yang sama, dan
  // pendengarnya terdaftar lebih dulu — jadi saat baris ini berjalan, penutupan sudah
  // selesai. Yang tersisa cuma arah MAJU: tombol Forward kembali ke alamat ?k= yang
  // layarnya sudah terlanjur ditutup.
  const k = new URLSearchParams(location.search).get('k');
  if (k && BENTUK_KEY.test(k) && !el.rincian.firstElementChild) buka(k);
});

// ---------------------------------------------------------------------------
// Mulai
// ---------------------------------------------------------------------------
(async function mulai() {
  try {
    await muatMeta();
    kepala = await ambil('harga');

    pasangBatas(el.batas, {
      sumber: ['harga'],
      takDijawab: ['hargaPetani', 'hargaWilayah', 'hargaKomoditasTani', 'hargaPupuk'],
    });

    // Atribusi Kemendag wajib dan bentuknya sudah ditentukan pemilik datanya. Dibaca dari
    // meta, bukan diketik di HTML: yang diketik dua kali akan basi di salah satunya.
    const atr = bacaMeta()?.batas?.sumber?.harga?.atribusi;
    if (atr) el.atribusi.textContent = atr;

    gambarDaftar('');
    // Peringatan "ini harga eceran" benar untuk 43 dari 44 seri, dan SALAH untuk satu.
    // Yang satu itu tidak membuat stripnya hilang — ia menukarnya dengan kalimat pekebun,
    // supaya tidak pernah ada angka di layar ini yang berdiri tanpa keterangan tingkat.
    aturTingkat(null);
    ukurTempelan();

    const k = new URLSearchParams(location.search).get('k');
    if (k && BENTUK_KEY.test(k)) await buka(k);
  } catch (e) {
    el.daftar.innerHTML = `
      <div class="kartu peringatan">
        <h2>Indeks harga tidak ditemukan</h2>
        <p>
          Halaman ini membaca <code>spec/indeks/harga.json</code>, yang turunan. Bangun dulu
          dari akar repositori: <code>node harga_data/tarik-sp2kp.mjs</code>, lalu
          <code>node spec/tools/bangun-harga.mjs --tulis</code>,
          <code>node spec/tools/bangun-komentar-harga.mjs --tulis</code>, dan
          <code>node spec/tools/bangun-indeks.mjs --tulis</code>.
        </p>
        <p class="catatan">${teks(e.message)}</p>
      </div>`;
  }
})();
