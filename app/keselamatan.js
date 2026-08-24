/* B2 — kartu keselamatan aplikasi, bagian yang bisa dibangun.
 *
 * ASIMETRI YANG MEMBUATNYA MENDESAK. Permukaan ini mengantar orang ke pestisida di lima
 * layar — jalur 1 dari gejala, jalur 2 dari nama bahan, takaran saat mencampur, jalur 5
 * dan 6 untuk sediaan buatan sendiri — dan sampai berkas ini tidak satu pun mengatakan apa
 * yang harus dilakukan kalau orangnya keracunan. Kolom "keputusan yang diubah" pada baris
 * B2 di docs/15 berbunyi KESELAMATAN JIWA, dan itu satu-satunya baris dari empat puluh
 * yang taruhannya nyawa.
 *
 * YANG DIBANGUN HANYA SEPARUH, DAN SEPARUHNYA MEMANG BUKAN KARENA MALAS. Diukur lebih
 * dulu, dari datanya sendiri:
 *
 *   tenggang panen (PHI)   0 dari 23.058 penggunaan berlabel
 *   kelas bahaya WHO       1 dari 1.744 bahan aktif
 *   APD per produk         tidak ada medannya sama sekali di registri produk terdaftar
 *
 * Menyusun "kartu keselamatan" dari registri yang tidak memuat satu pun angka keselamatan
 * berarti mengarangnya, dan yang dikarang di sini melukai orang. Jadi yang disusun kartu
 * ini: nomor yang bisa ditelepon sekarang, dan pernyataan tentang apa yang tidak
 * diketahuinya.
 *
 * PETUNJUK PERTOLONGAN PERTAMA TIDAK DITULIS DI SINI, dan itu keputusan, bukan kelalaian.
 * Tindakan pertama berbeda menurut bahan — ada yang harus dimuntahkan, ada yang justru
 * tidak boleh — dan halaman yang menulis satu petunjuk untuk semua bahan sedang memberi
 * anjuran medis yang tidak dimilikinya. Dua tempat yang memang memuatnya disebut alih-alih
 * disalin: label kemasan, yang secara hukum wajib memuat petunjuk pertolongan pertama, dan
 * sentra informasi keracunan yang bertugas menjawabnya lewat telepon.
 *
 * Kontaknya diperiksa 24 Agustus 2026 dari laman resmi BPOM. Situs Sentra Informasi
 * Keracunan Nasional sendiri, ik.pom.go.id, TIDAK BISA DIJANGKAU pada tanggal itu — DNS-nya
 * tidak terselesaikan — sedangkan pom.go.id dan ulpk.pom.go.id menjawab. Karena itu yang
 * ditawarkan nomor teleponnya, bukan tautan ke katalog bahannya.
 */

export const KONTAK = {
  nama: 'HALO BPOM',
  telepon: '1500533',
  sms: '081219999533',
  jam: 'Senin–Jumat 08.00–18.00; di luar jam itu panggilan dialihkan ke layanan ponsel 24 jam',
  penyelenggara: 'Sentra Informasi Keracunan Nasional, Badan POM',
  diperiksa: '24 Agustus 2026',
};

/* Angka-angka ini DIHITUNG dari indeks, bukan diketik, supaya ia ikut berubah begitu
 * datanya berubah — dan supaya klaim "tidak ada datanya" tidak jadi klaim yang basi
 * diam-diam pada hari registri mulai memuatnya. Bila metanya tidak memuat cacahnya,
 * kalimatnya diturunkan tanpa angka alih-alih memakai angka yang ditebak. */
function barisTidakDiketahui(meta) {
  const j = meta?.jumlah ?? {};
  const n = (x) => Number(x ?? 0).toLocaleString('id-ID');
  const baris = [];
  if (j.penggunaanBerlabel) {
    baris.push(`<li><strong>Tenggang panen</strong> — 0 dari ${n(j.penggunaanBerlabel)} penggunaan berlabel di registri memuatnya. Berapa hari harus dijeda antara semprot terakhir dan panen tidak bisa dijawab layar ini.</li>`);
  } else {
    baris.push('<li><strong>Tenggang panen</strong> — tidak ada satu pun penggunaan berlabel di registri yang memuatnya.</li>');
  }
  baris.push(`<li><strong>Kelas bahaya WHO</strong> — ${j.bahanBerkelasBahaya ? n(j.bahanBerkelasBahaya) : 'nyaris nol'} dari ${j.bahanAktif ? n(j.bahanAktif) : 'seluruh'} bahan aktif memuatnya. Seberapa beracun satu bahan dibanding bahan lain tidak bisa dibandingkan di sini.</li>`);
  baris.push('<li><strong>Alat pelindung diri</strong> — registri produk terdaftar tidak punya medannya sama sekali. Sediaan buatan sendiri punya, dan di jalur 5 dan 6 memang ditampilkan.</li>');
  return baris.join('');
}

/* STRIP DARURAT — nomornya, dan cuma nomornya, di tempat yang bisa dijangkau dari mana pun.
 *
 * Kartu di bawah sudah benar isinya; yang salah letaknya. `#keselamatan` adalah anak
 * KEDUA-DARI-TERAKHIR <main> di keempat halaman yang memasangnya, dan pada ponsel 390x780
 * itu berarti:
 *
 *   jalur-1 (tautan langsung ke satu OPT)   4.977 px  — 6,4 layar
 *   jalur-6 setelah resep dibuat            1.793 px  — dan terus turun tiap resep tumbuh
 *   jalur-5 setelah resep dibuat            1.280 px
 *   produk                                  1.327 px
 *
 * Kepala berkas ini menyebut taruhannya KESELAMATAN JIWA dan tujuannya "nomor yang bisa
 * ditelepon SEKARANG". Enam layar gulir bukan "sekarang". Yang menelepon nomor ini sedang
 * memegang orang yang keracunan; ia tidak sedang membaca halaman dari atas ke bawah.
 *
 * Stripnya SATU BARIS dan sengaja tidak merah menyala. Alasannya sama dengan alasan kartu
 * di bawah dibuat ringkas: yang muncul di lima layar dan berteriak akan berhenti dilihat
 * pada layar kedua, dan yang berhenti dilihat sama saja dengan yang tidak ada. Ia memakai
 * kosakata `.kartu.tabrakan` yang sudah dipakai permukaan ini untuk hal berbahaya.
 *
 * Nomornya dibaca dari KONTAK, tidak diketik ulang di HTML keempat halaman — yang diketik
 * empat kali akan basi di tiga di antaranya.
 *
 * Penampungnya DIGANTIKAN, bukan diisi. Elemen `position: sticky` hanya bisa berjalan di
 * dalam kotak induknya, dan induk yang cuma membungkus strip setinggi 57 px memberinya
 * ruang jalan 57 px — ia terbit sebagai sticky yang tidak pernah menempel. Yang harus jadi
 * anak langsung <main> adalah stripnya sendiri, supaya kotak yang ditelusurinya seluruh
 * halaman. Diuji: sebagai anak div pembungkus ia hilang di -1.504 px. */
export function pasangStripDarurat(wadah) {
  if (!wadah || document.querySelector('.strip-darurat')) return;
  const a = document.createElement('a');
  a.className = 'strip-darurat';
  a.href = `tel:${KONTAK.telepon}`;
  a.innerHTML = `
    <span class="sd-tanda" aria-hidden="true"></span>
    <span class="sd-teks">
      <span class="sd-judul">Keracunan pestisida? Telepon sekarang.</span>
      <span class="sd-sub">${KONTAK.telepon} · ${KONTAK.nama}</span>
    </span>`;
  wadah.replaceWith(a);
}

/* Dipasang di tiap layar yang mengantar orang ke pestisida. Dibuat ringkas dengan sengaja:
 * kartu sepanjang halaman yang muncul di lima layar akan berhenti dibaca pada layar kedua,
 * dan yang berhenti dibaca sama saja dengan yang tidak ada. Yang harus terbaca dalam satu
 * pandang cuma nomornya. */
export function pasangKeselamatan(wadah, meta, { ringkas = false } = {}) {
  if (!wadah) return;
  wadah.innerHTML = `
    <div class="kartu keselamatan">
      <h2>Keracunan pestisida? Telepon sekarang, jangan tunggu gejalanya berat.</h2>
      <p class="kontak-darurat">
        <a class="nomor-darurat" href="tel:${KONTAK.telepon}">${KONTAK.telepon}</a>
        <span class="sub">${KONTAK.nama} · ${KONTAK.penyelenggara}</span>
        <span class="sub">${KONTAK.jam}</span>
      </p>
      <p class="catatan">
        Bisa juga SMS ke <a href="sms:${KONTAK.sms}">${KONTAK.sms}</a>. Nomor diperiksa
        ${KONTAK.diperiksa} dari laman resmi BPOM.
      </p>
      <p>
        <strong>Bawa kemasannya, atau fotonya.</strong> Yang menjawab telepon perlu tahu
        bahan aktifnya, dan tindakan pertama berbeda menurut bahan — ada yang harus
        dimuntahkan, ada yang justru tidak boleh.
      </p>
      ${ringkas ? '' : `
      <details class="tak-diketahui">
        <summary>Yang layar ini tidak tahu, dan tidak akan menebak</summary>
        <ul>${barisTidakDiketahui(meta)}</ul>
        <p class="catatan">
          <strong>Label di kemasan lebih lengkap daripada halaman ini.</strong> Petunjuk
          pertolongan pertama, tenggang panen, dan alat pelindung yang diwajibkan ada di
          sana secara hukum, dan tidak satu pun masuk registri yang disalin permukaan ini.
          Menyusunnya sendiri di sini berarti mengarang — dan yang dikarang di halaman
          keselamatan melukai orang.
        </p>
      </details>`}
    </div>`;
}
