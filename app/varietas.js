/* Layar varietas — dipakai jalur 4 (pintu benih & bibit) dan jalur 2 (kalau yang
 * dicari ternyata varietas). Satu perender, dua pintu.
 *
 * Yang dijawab layar ini: apakah nama varietas ini ada di registri, dan surat apa
 * yang dipegangnya. Yang TIDAK dijawabnya: varietas mana yang sebaiknya ditanam —
 * NOL dari 11.227 rekaman menyebut sifat agronomi apa pun, jadi rekomendasi di
 * atasnya berarti mengarang. Dan taruhan benih adalah taruhan seluruh musim.
 */

import { teks, tanggal, namaBerdekatan, HTML_KEMBALI, namaPemegang} from './pustaka.js';
import { catatLubang, LUBANG } from './ukur.js';

// Keempatnya sama-sama terdengar "resmi" dan paling mudah tertukar justru di situ.
// `sebutan` dari registri ditampilkan apa adanya — "Pendaftaran" saja mencakup empat
// instrumen yang berbeda, dan meratakannya jadi satu kata "terdaftar" membuang persis
// keterangan yang membedakannya.
const SURAT = {
  release: {
    nama: 'Pelepasan',
    kelas: 'pelepasan',
    arti: 'Varietasnya sudah dilepas untuk diedarkan. Ini surat yang paling sering dimaksud orang ketika bertanya "benihnya resmi tidak".',
  },
  registration: {
    nama: 'Pendaftaran',
    kelas: '',
    arti: 'Varietasnya tercatat di registri. Pendaftaran mencatat keberadaan varietas — ia bukan pelepasan, dan bukan hak atas varietasnya.',
  },
  protection: {
    nama: 'Perlindungan (PVT)',
    kelas: '',
    arti: 'Hak atas varietasnya dipegang seseorang. Ini soal kepemilikan, bukan soal boleh atau tidaknya diedarkan.',
  },
  naming_approval: {
    nama: 'Penamaan',
    kelas: '',
    arti: 'Persetujuan atas namanya, untuk varietas introduksi. Bukan pelepasan.',
  },
};

function kartuSurat(s) {
  const d = SURAT[s.jenis] ?? { nama: s.jenis, kelas: '', arti: '' };
  return `
    <div class="kartu ${d.kelas}">
      <h2>${teks(d.nama)}</h2>
      <dl class="kunci">
        <dt>Sebutan resmi</dt><dd>${teks(s.sebutan ?? '—')}</dd>
        <dt>Nomor SK</dt><dd>${teks(s.sk ?? '—')}</dd>
        <dt>Tanggal</dt><dd>${s.tanggal ? teks(tanggal(s.tanggal)) : 'tidak tercatat di registri'}</dd>
      </dl>
      <p class="catatan">${teks(d.arti)}</p>
    </div>`;
}

function kartuTanpaPelepasan(v) {
  const punya = (v.surat ?? []).map((s) => SURAT[s.jenis]?.nama ?? s.jenis);
  return `
    <div class="kartu peringatan">
      <h2>Tidak ada surat pelepasan di registri</h2>
      <p>
        Varietas ini ${punya.length
          ? `memegang ${teks(punya.join(' dan '))}, tetapi <strong>tidak ada catatan pelepasan</strong> untuknya.`
          : '<strong>tidak memegang surat apa pun</strong> di registri ini.'}
      </p>
      <p class="catatan">
        Itu <strong>fakta tentang isi registri</strong>, bukan kesimpulan hukum. Halaman
        ini tidak menyatakan benihnya ilegal — pencatatan bisa tertinggal, dan sebagian
        varietas memang masuk lewat jalur selain pelepasan.
      </p>
      <p class="catatan">
        Yang bisa dibawa ke penjual: <strong>“nomor SK pelepasannya berapa?”</strong>
        Penjual benih yang sah akan bisa menjawab; yang tidak bisa menjawab sudah
        memberi keterangan yang cukup.
      </p>
    </div>`;
}

const KARTU_LOT = `
  <div class="kartu">
    <h2>Yang registri ini tidak bisa pastikan</h2>
    <p>
      Pelepasan varietas <strong>bukan sertifikasi lot</strong>. Registri menjawab
      “apakah varietas ini dilepas”, lalu berhenti. Ia tidak bisa memastikan bahwa
      <em>bungkus benih</em> atau <em>bibit di polybag</em> yang ada di tanganmu memang
      berasal dari varietas itu.
    </p>
    <p class="catatan">
      Dokumen untuk itu adalah label dan sertifikat lot dari BPSB, dan registri ini
      <strong>tidak memuatnya sama sekali</strong> — 44 rekaman memang menyebut BPSB,
      tetapi seluruhnya sebagai nama pemelihara. Pemeriksaannya tidak bisa dilakukan
      dari sini.
    </p>
  </div>`;

function kartuTahunan(v) {
  if (v.tahunan !== true) return '';
  return `
    <div class="kartu peringatan">
      <h2>Taruhannya bertahun-tahun, bukan semusim</h2>
      <p>
        ${teks(v.komoditasNama ?? 'Komoditas ini')} tanaman tahunan. Bibit yang salah
        <strong>baru terbukti saat berbuah</strong> — empat sampai tujuh tahun setelah
        uangnya keluar, tanahnya terpakai, dan pemeliharaannya dibayar.
      </p>
      <p class="catatan">
        Tidak ada yang bisa memeriksanya dengan melihat. Yang bisa diperiksa sekarang
        hanya lapisan pertama: bahwa nama varietasnya nyata, siapa pemeliharanya, dan
        surat apa yang ada di baliknya.
      </p>
    </div>`;
}

async function kartuMiripHtml(v) {
  const mirip = await namaBerdekatan(v.nama, (x) => x.j === 'varietas' && x.i !== v.id, 5);
  if (!mirip.length) return '';
  return `
    <div class="kartu peringatan">
      <h2>Nama lain yang mudah tertukar <span class="lencana">${mirip.length}</span></h2>
      <p class="catatan">
        Varietas berikut namanya nyaris sama, tetapi <strong>entitas yang berbeda</strong>
        — komoditas dan suratnya bisa lain sama sekali. Cocokkan ejaannya huruf per huruf.
      </p>
      <ul class="daftar">
        ${mirip.map((m) => `
          <li>
            <button type="button" data-id="${teks(m.i)}" data-pecahan="${teks(m.p)}">
              <span class="nama">${teks(m.n)}</span>
              <span class="sub">${teks(m.k ?? '—')}</span>
            </button>
          </li>`).join('')}
      </ul>
    </div>`;
}

export async function layarVarietas(v) {
  const surat = v.surat ?? [];
  const adaPelepasan = surat.some((s) => s.jenis === 'release');
  // Pelepasan didahulukan karena itu yang paling sering dimaksud orang; sisanya
  // mengikuti urutan yang tetap supaya dua varietas bisa dibandingkan sejajar.
  const urutan = ['release', 'registration', 'protection', 'naming_approval'];
  const tersusun = surat.slice().sort((a, b) => urutan.indexOf(a.jenis) - urutan.indexOf(b.jenis));

  return `
    <div class="kartu">
      <h2>${teks(v.nama)}<span class="lencana">Varietas</span></h2>
      <dl class="kunci">
        <dt>Jenis tanaman</dt><dd>${teks(v.komoditasNama ?? '—')}</dd>
        <dt>Asal</dt><dd>${teks(v.asal ?? '—')}</dd>
        <dt>Tipe</dt><dd>${teks(v.tipe ?? 'tidak tercatat')}</dd>
        <dt>Pemelihara</dt><dd>${namaPemegang(v.pemelihara, v.pk)}</dd>
      </dl>
      <p class="catatan">
        Pemelihara adalah pihak yang memelihara varietasnya — <strong>belum tentu</strong>
        yang mengemas benih yang ada di tanganmu.
      </p>
    </div>
    ${adaPelepasan ? '' : kartuTanpaPelepasan(v)}
    ${kartuTahunan(v)}
    <h2 class="judul-bagian">Surat yang dipegang <span class="lencana">${surat.length}</span></h2>
    ${tersusun.length ? tersusun.map(kartuSurat).join('')
      : '<div class="kartu"><p class="kosong">Registri tidak mencatat surat apa pun untuk varietas ini.</p></div>'}
    ${surat.length && surat.every((s) => !s.tanggal) ? `
      <p class="catatan">
        Tidak satu pun surat di atas membawa tanggal — begitulah adanya di registri:
        11.320 dari 11.609 surat hanya memuat nomor SK. Karena itu halaman ini
        <strong>tidak bisa menyatakan sebuah surat masih berlaku</strong>, hanya bahwa
        ia ada.
      </p>` : ''}
    ${KARTU_LOT}
    ${await kartuMiripHtml(v)}
    <div class="kartu">
      <h2>Tidak ada “setara” untuk varietas</h2>
      <p class="catatan">
        Dua varietas yang berbeda tidak pernah identik, jadi pertanyaan “merek lain yang
        isinya sama” tidak berlaku di sini — berbeda dari pestisida dan pupuk.
      </p>
    </div>
    ${HTML_KEMBALI}`;
}

/** Cabang "tidak ditemukan" — tiga kemungkinan yang sama masuk akalnya. */
export async function layarTakDitemukan(kueri) {
  // B4: nama varietas yang dicari tidak punya padanan terdaftar. Cacahnya saja —
  // kuerinya tidak ikut, sesuai docs/11 bagian 3.
  catatLubang('4', LUBANG.namaDagang);
  const dekat = await namaBerdekatan(kueri, (x) => x.j === 'varietas', 5);
  return `
    <div class="kartu peringatan">
      <h2>“${teks(kueri)}” tidak ada di registri varietas</h2>
      <p>Ada tiga kemungkinan, dan ketiganya sama masuk akalnya:</p>
      <ol>
        <li><strong>Ejaannya berbeda.</strong> Nama varietas kerap dieja beberapa cara.</li>
        <li><strong>Itu nama dagang, bukan nama varietas.</strong> Registri menyimpan nama
            varietas terdaftar; kemasan sering memakai nama jualan yang lain, dan
            pemetaannya belum ada.</li>
        <li><strong>Varietasnya memang tidak terdaftar.</strong></li>
      </ol>
      <p class="catatan">
        Halaman ini <strong>tidak bisa membedakan ketiganya</strong>, jadi ia tidak
        menuduh apa pun. Yang bisa dibawa ke penjual:
        <strong>“nomor SK pelepasannya berapa?”</strong>
      </p>
    </div>
    ${dekat.length ? `
      <div class="kartu">
        <h2>Ejaan terdekat yang ada di registri</h2>
        <ul class="daftar">
          ${dekat.map((m) => `
            <li>
              <button type="button" data-id="${teks(m.i)}" data-pecahan="${teks(m.p)}">
                <span class="nama">${teks(m.n)}</span>
                <span class="sub">${teks(m.k ?? '—')}</span>
              </button>
            </li>`).join('')}
        </ul>
      </div>` : ''}`;
}
