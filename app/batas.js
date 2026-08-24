/* Komponen batas jawaban — B1 pada docs/15-kapabilitas-lintas-pemangku.md.
 *
 * Aturannya satu kalimat: TIAP LAYAR MENYEBUT TINGKAT BUKTI, TANGGAL, SUMBER, DAN APA
 * YANG TIDAK DIKETAHUINYA. Budayanya sudah ada sejak layar pertama — tiap halaman
 * menulis batasnya sendiri dalam prosa — dan justru itu masalahnya: prosa yang ditulis
 * ulang tiap layar bisa melewatkan satu medan tanpa ada yang menyadarinya, dan layar
 * ke delapan akan melewatkan medan yang berbeda dari layar ke tiga.
 *
 * Yang dilakukan berkas ini bukan mengganti prosa itu. Prosa `<details class="batas">`
 * tetap milik tiap layar, karena "apa yang tidak ditampilkan dan kenapa" memang berbeda
 * di tiap jalur. Yang dibakukan di sini keempat medannya: bentuknya sama di semua layar,
 * dan layar yang lupa salah satunya gagal dengan berisik, bukan diam-diam.
 *
 * SATU ATURAN DIWARISI DARI SKEMA. preparation.schema.json menyatakannya untuk data:
 * "Tingkat bukti tanpa alasan adalah klaim tanpa dasar." Di sini ia berlaku untuk layar.
 * Sumber tanpa `alasan` ditolak — termasuk, terutama, sumber yang tingkatnya belum
 * ditetapkan. Yang menolak menetapkan tingkat harus mengatakan kenapa; medan kosong
 * terbaca sebagai kelalaian, dan kelalaian terbaca sebagai tidak ada masalah.
 */

import { bacaMeta, teks, tanggal } from './pustaka.js';
import { blokSanggah, pasangSanggah } from './sanggah.js';
import { REPO } from './serah.js';

const n = (x) => (x ?? 0).toLocaleString('id-ID');

/* Sumber boleh berupa kunci ke meta.batas.sumber, atau objek utuh untuk yang memang
 * tidak tinggal di indeks — angka HET jalur 3 datang dari peraturan, bukan dari
 * registri, dan memaksanya masuk indeks berarti berpura-pura registri memuatnya. */
function bacaSumber(acuan, meta, salah) {
  // Bentuk pendek: kunci saja. Bentuk `{ dari: 'kunci', cakupan: '…' }` memakai entri
  // yang sama lalu menambahkan apa yang khas layar ini — jalur 4 memakai registri
  // varietas yang sama seperti jalur 2, tetapi hanya sebagian medannya yang dibaca,
  // dan menyebut seluruh registri tanpa menyebut bagian itu melebihkan cakupannya.
  const kunci = typeof acuan === 'string' ? acuan : acuan?.dari;
  if (kunci) {
    const s = meta?.batas?.sumber?.[kunci];
    if (!s) { salah.push(`sumber "${kunci}" tidak ada di meta.batas.sumber`); return null; }
    return { kunci, ...s, ...(typeof acuan === 'string' ? {} : acuan) };
  }
  if (!acuan?.label) { salah.push('sumber sebaris tanpa label atau kunci `dari`'); return null; }
  return { kunci: null, ...acuan };
}

const TINGKAT = ['A', 'B', 'C', 'D'];

/** Tingkat yang benar-benar boleh dipakai menggambar. Nilai di luar A–D bukan tingkat. */
const tingkatSah = (t) => (TINGKAT.includes(t) ? t : null);

function periksa(s, salah) {
  if (!s.alasan) salah.push(`sumber "${s.label}" tanpa alasan tingkat bukti`);
  if (!s.tarikan) salah.push(`sumber "${s.label}" tanpa tanggal`);
  if (s.tingkat && !tingkatSah(s.tingkat))
    salah.push(`sumber "${s.label}" bertingkat "${s.tingkat}" — di luar A–D`);
}

function gambarSumber(s, arti) {
  // Yang sudah dinyatakan cacat tidak ikut digambar. Sebelumnya `periksa()` menolak
  // tingkat di luar A–D lalu blok ini tetap menggambarnya — dan nilainya masuk atribut
  // `class` tanpa dilolos. Komponen yang seluruh tugasnya menolak menyatakan hal yang
  // tidak bisa ditanggungnya tidak boleh menyatakannya sendiri.
  const t = tingkatSah(s.tingkat);
  const cacat = s.tingkat && !t;

  const lencana = t
    ? `<span class="bj-tingkat bj-tingkat-${teks(t.toLowerCase())}">${teks(t)}</span>`
    : '<span class="bj-tingkat bj-tingkat-kosong" aria-hidden="true">–</span>';

  // Huruf tingkat tidak pernah tampil telanjang: "B" tidak mengatakan apa pun kepada
  // yang belum pernah membaca skemanya, dan yang paling perlu membacanya justru dia.
  // "Belum ditetapkan" dan "tidak sah" dibedakan: yang pertama keputusan, yang kedua
  // kekeliruan, dan menyamakannya menyembunyikan kekeliruannya.
  const artiTingkat = t
    ? `tingkat bukti ${teks(t)} — ${teks(arti[t] ?? '')}`
    : cacat
      ? 'tingkat bukti tidak sah — tidak ditampilkan'
      : 'tingkat bukti belum ditetapkan';

  const sebaran = s.sebaran
    ? ' · ' + Object.entries(s.sebaran).sort()
        .map(([t, j]) => `${teks(t)} ${n(j)}`).join(', ')
    : '';

  const cakupan = s.cakupan
    ? `<p class="bj-cakupan">Yang dibaca layar ini: ${teks(s.cakupan)}</p>` : '';

  const keping = [
    s.penerbit && teks(s.penerbit),
    s.cacah != null && `${n(s.cacah)} rekaman`,
    s.lisensi && teks(s.lisensi),
  ].filter(Boolean).join(' · ');

  // Tanggal tarikan dan tanggal tinjauan dua hal yang berbeda, dan yang kedua kerap
  // yang lebih penting: salinan boleh baru ditarik dan tetap sudah lewat tinjauannya.
  const waktu = [
    `Tarikan ${teks(tanggal(s.tarikan) ?? s.tarikan)}`,
    s.tinjau && `tinjau ulang sebelum ${teks(tanggal(s.tinjau) ?? s.tinjau)}`,
    s.status && `status ${teks(s.status)}`,
  ].filter(Boolean).join(' · ');

  return `
    <li>
      <p class="bj-kepala">
        ${lencana}
        <span>
          ${s.url
            ? `<a href="${teks(s.url)}" rel="noopener noreferrer">${teks(s.label)}</a>`
            : `<strong>${teks(s.label)}</strong>`}
        </span>
      </p>
      <p class="bj-arti">${artiTingkat}${sebaran}</p>
      ${cakupan}
      ${keping ? `<p class="bj-keping">${keping}</p>` : ''}
      <p class="bj-keping">${waktu}</p>
      <p class="bj-alasan">${teks(s.alasan)}</p>
    </li>`;
}

/* Keadaan tinjauan bernama — G1.
 *
 * Baris ini ada di blok batas dan bukan di halaman tersendiri karena ia memang salah satu
 * batas jawaban: siapa yang sudah memeriksa isinya, dan kalau belum ada, itu bagian dari
 * apa yang tidak diketahui layar ini. Angkanya nol hari ini, dan justru itu sebabnya ia
 * ditulis sebagai kalimat alih-alih "0" di sebuah tabel — nol yang hanya ditampilkan
 * sebagai angka terbaca sebagai kolom yang belum diisi, bukan sebagai keadaan.
 *
 * Ia TIDAK berpura-pura mengukur rekaman yang tampil di layar ini saja. Yang dihitung
 * seluruh kosakata kurasi, dan kalimatnya menyebutkannya begitu — pengukuran per layar
 * menuntut memetakan tiap pecahan indeks kembali ke rekaman asalnya, dan angka yang
 * dikarang lebih buruk daripada angka yang cakupannya dinyatakan. */
function gambarTinjauan(meta) {
  const t = meta?.tinjauan;
  if (!t) return '';
  const pintu = `<a href="${REPO}/blob/main/CONTRIBUTING.md" rel="noopener noreferrer">alurnya terbuka di CONTRIBUTING.md</a>`;
  if (!t.berpeninjau) {
    return `<p class="bj-tinjau">
      <strong>Belum seorang pun menempelkan namanya pada isi ini.</strong>
      Nol dari ${n(t.rekaman)} rekaman kosakata kurasi punya peninjau bernama — ${pintu}.
    </p>`;
  }
  return `<p class="bj-tinjau">
    Ditinjau orang bernama: <strong>${n(t.berpeninjau)} dari ${n(t.rekaman)}</strong>
    rekaman kosakata kurasi${t.peninjau.length ? ` — ${t.peninjau.map(teks).join(', ')}` : ''}. ${pintu}.
  </p>`;
}

/* `takDijawab` menerima kunci meta.tidakAda atau objek {judul, teks} untuk yang khas
 * satu layar. Yang dari meta dipakai bersama justru supaya kalimatnya sama di semua
 * layar: dua layar yang menyebut lubang yang sama dengan kalimat berbeda membuat
 * pembacanya mengira keduanya dua lubang. */
const JUDUL_LUBANG = {
  gejalaOpt: 'Gejala OPT di luar sepuluh yang terkurasi',
  gejalaOptRegistri: 'Teks gejala pada OPT registri',
  phi: 'Tenggang panen (PHI)',
  harga: 'Harga',
  bahanHara: 'Unsur hara sebagai bahan yang bisa dicari',
  beratJenis: 'Berat jenis pupuk cair',
  haraSediaan: 'Kadar hara sediaan buatan sendiri',
  namaDagang: 'Nama dagang di kemasan',
  sertifikasiLot: 'Sertifikasi lot benih & bibit',
  wilayahNamaLokal: 'Wilayah pemakaian nama lokal',
  isiKarung: 'Isi karung, bukan labelnya',
  dosisKosong: 'Dosis yang tidak tercatat di registri',
  takaranRumahTangga: 'Ukuran tutup botol, sendok, dan gelas',
  tokoTakBisaDituju: 'Alamat yang bisa dituju',
  tokoTanpaKontak: 'Telepon, jam buka, dan apakah tokonya masih ada',
  bppTanpaAlamat: 'Alamat balai penyuluhan',
  rencanaBukanKalender: 'Tanggal untuk langkah yang menunggu fase atau ambang',
  hasilVarietas: 'Potensi hasil varietas',
  arusKasMusim: 'Arus kas semusim',
  hargaPetani: 'Harga yang diterima petani',
  hargaWilayah: 'Harga per provinsi dan per pasar',
  hargaKomoditasTani: 'Harga untuk komoditas tani selebihnya',
  hargaPupuk: 'Harga pupuk dan benih',
  gambarKemasan: 'Gambar kemasan',
};

function bacaLubang(acuan, meta, salah) {
  if (typeof acuan === 'string') {
    const t = meta?.tidakAda?.[acuan];
    if (!t) { salah.push(`lubang "${acuan}" tidak ada di meta.tidakAda`); return null; }
    // Kunci tanpa judul pernah lolos dua kali dan tampil apa adanya di layar —
    // "takaranRumahTangga" bukan kalimat, dan pembaca tidak berutang membacanya sebagai
    // kalimat. Sejak 23 Agustus 2026 itu cacat, bukan cadangan yang diam-diam dipakai.
    if (!JUDUL_LUBANG[acuan]) salah.push(`lubang "${acuan}" belum punya judul di JUDUL_LUBANG`);
    return { judul: JUDUL_LUBANG[acuan] ?? acuan, teks: t };
  }
  if (!acuan?.judul || !acuan?.teks) { salah.push('lubang sebaris tanpa judul atau teks'); return null; }
  return acuan;
}

/* Ringkasan yang tetap terlihat — dan kenapa ia berisi persis empat medan.
 *
 * Aturan di kepala berkas ini berbunyi: TIAP LAYAR MENYEBUT TINGKAT BUKTI, TANGGAL,
 * SUMBER, DAN APA YANG TIDAK DIKETAHUINYA. Memindahkan blok batas ke dalam lembar akan
 * melanggar aturan itu kalau yang tertinggal di layar cuma sebuah tombol. Karena itu
 * keempat medan tetap tercetak di layar: lencana tingkat dan nama sumber di keping,
 * tarikan terlama dan cacah lubang di barisnya. Yang pindah ke lembar bukan medannya,
 * melainkan URAIANNYA — arti tingkat, cakupan, lisensi, alasan, dan daftar lubangnya.
 *
 * Tarikan yang dipakai yang TERLAMA, bukan yang terbaru. Layar dengan enam sumber
 * seusia berbeda hanya sekuat salinan tertuanya, dan menyebut yang terbaru membuat blok
 * ini memuji dirinya sendiri. */
function gambarRingkas(sumber, lubang) {
  const keping = sumber.map((s) => {
    const t = tingkatSah(s.tingkat);
    const lencana = t
      ? `<span class="bj-tingkat bj-tingkat-${teks(t.toLowerCase())}">${teks(t)}</span>`
      : '<span class="bj-tingkat bj-tingkat-kosong" aria-hidden="true">–</span>';
    return `<span class="bj-cip">${lencana}<span>${teks(s.label)}</span></span>`;
  }).join('');

  const tarikan = sumber.map((s) => s.tarikan).filter(Boolean).sort();
  const tertua = tarikan[0];
  const beragam = tarikan.length > 1 && tarikan[tarikan.length - 1] !== tertua;
  const status = [...new Set(sumber.map((s) => s.status).filter(Boolean))];

  const baris = [
    tertua && `Tarikan ${teks(tanggal(tertua) ?? tertua)}${beragam ? ' (yang terlama)' : ''}`,
    lubang.length && `${n(lubang.length)} hal tidak diketahui`,
    status.length && `status ${status.map(teks).join(', ')}`,
  ].filter(Boolean).join(' · ');

  return `
    <h2 class="bj-judul">Batas jawaban di layar ini</h2>
    <p class="bj-cip-baris">${keping}</p>
    ${baris ? `<p class="bj-ringkas-baris">${baris}</p>` : ''}
    <button type="button" class="bj-buka">Batas selengkapnya, dan cara menyanggahnya</button>`;
}

/* Satu lembar per halaman, dipakai ulang kalau blok digambar dua kali. */
function siapkanLembar() {
  let l = document.getElementById('bjLembar');
  if (l) return l;
  l = document.createElement('dialog');
  l.id = 'bjLembar';
  l.className = 'bj-lembar batas-jawaban';
  l.setAttribute('aria-labelledby', 'bjLembarJudul');
  l.innerHTML = `
    <form method="dialog" class="bj-lembar-kepala">
      <h2 id="bjLembarJudul">Batas jawaban di layar ini</h2>
      <button aria-label="Tutup">×</button>
    </form>
    <div class="bj-lembar-isi"></div>`;
  // Ketukan di luar kotak menutup lembar — <dialog> menganggap latarnya bagian dirinya,
  // jadi yang dibedakan letak ketukannya terhadap kotak, bukan targetnya.
  l.addEventListener('click', (e) => {
    const k = l.getBoundingClientRect();
    const luar = e.clientX < k.left || e.clientX > k.right
              || e.clientY < k.top  || e.clientY > k.bottom;
    if (luar) l.close();
  });
  document.body.append(l);
  return l;
}

/**
 * @param {HTMLElement} wadah  tempat blok digambar — biasanya <section id="batasJawaban">
 * @param {{sumber: Array, takDijawab: Array, sanggah?: (() => object|null)}} spek
 *   `sanggah` opsional: pembaca rekaman yang sedang terbuka, dipanggil saat blok
 *   sanggahan diketuk. Layar tanpa rekaman tunggal boleh menghilangkannya — pintunya
 *   tetap ada, hanya saja ia menyanggah layarnya alih-alih satu rekaman.
 */
export function pasangBatas(wadah, spek) {
  if (!wadah) return;
  const meta = bacaMeta();
  const salah = [];

  if (!spek?.sumber?.length) salah.push('layar ini tidak menyebut satu sumber pun');
  if (!spek?.takDijawab?.length) salah.push('layar ini tidak menyebut satu pun yang tidak diketahuinya');

  const sumber = (spek?.sumber ?? []).map((a) => bacaSumber(a, meta, salah)).filter(Boolean);
  for (const s of sumber) periksa(s, salah);
  const lubang = (spek?.takDijawab ?? []).map((a) => bacaLubang(a, meta, salah)).filter(Boolean);

  // Gagal dengan berisik. Layar ini berkas statis yang dibangun pemilik repositori;
  // kalau ia melewatkan satu medan, yang harus terjadi adalah blok merah di layarnya
  // sendiri — bukan halaman yang tampak beres dan diam-diam menjanjikan lebih dari
  // yang bisa ditanggung datanya.
  const cacat = salah.length
    ? `<div class="bj-cacat" role="alert">
         <strong>Batas jawaban belum lengkap di layar ini.</strong>
         <ul>${salah.map((x) => `<li>${teks(x)}</li>`).join('')}</ul>
       </div>`
    : '';
  if (salah.length) for (const x of salah) console.error(`batas jawaban: ${x}`);

  const arti = meta?.batas?.arti ?? {};

  // B3 menempel di sini dan bukan di tiap layar sendiri-sendiri, karena "satu fakta"
  // baru punya arti setelah sumbernya disebut: sanggahan yang tidak tahu fakta itu
  // salinan atau terbitan sendiri tidak tahu ke mana perbaikannya pergi. Blok batas
  // satu-satunya tempat di layar yang sudah tahu keduanya.
  const isi = `
    <ul class="bj-sumber">${sumber.map((s) => gambarSumber(s, arti)).join('')}</ul>
    ${gambarTinjauan(meta)}
    ${lubang.length ? `
      <h3 class="bj-judul-lubang">Yang tidak diketahui, dan karena itu tidak ditebak</h3>
      <dl class="bj-lubang">
        ${lubang.map((l) => `<dt>${teks(l.judul)}</dt><dd>${teks(l.teks)}</dd>`).join('')}
      </dl>` : ''}
    ${blokSanggah(sumber)}`;

  // Layar yang blok batasnya SUDAH tinggal di dalam lembar — beranda — digambar utuh di
  // tempat. Membuka lembar dari dalam lembar tidak punya arti, dan di sana blok ini
  // memang bukan yang mendahului alat.
  if (wadah.closest('dialog')) {
    wadah.innerHTML = `${cacat}<h2 class="bj-judul">Batas jawaban di layar ini</h2>${isi}`;
    pasangSanggah(wadah, sumber, spek?.sanggah);
    return salah;
  }

  wadah.innerHTML = `${cacat}${gambarRingkas(sumber, lubang)}`;

  const lembar = siapkanLembar();
  lembar.querySelector('.bj-lembar-isi').innerHTML = isi;
  wadah.querySelector('.bj-buka')?.addEventListener('click', () => lembar.showModal());
  pasangSanggah(lembar, sumber, spek?.sanggah);

  return salah;
}
