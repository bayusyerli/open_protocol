/* Musim dan petak — satu identitas, dipakai bersama tiga layar.
 *
 * SEBELUM BERKAS INI ADA TIGA GAGASAN "MUSIM" YANG TIDAK PERNAH BERTEMU. Buku kas (E5)
 * menyimpan musim bernama dengan luas di kepalanya. Layar rencana (E2) memakai kunci
 * `protokol|tanggal-tanam` yang tidak pernah dilihat siapa pun. Analisis usaha tani (D3)
 * meminta luas lagi dari nol. Tiga layar, tiga catatan, satu petak — dan orang yang sama
 * mengetik luas yang sama tiga kali.
 *
 * Yang paling merugikan bukan pengetikan ulangnya. Tanpa identitas bersama, biaya yang
 * dicatat di buku kas tidak bisa ditaruh di sebelah langkah yang menimbulkannya, dan
 * "berapa biaya per hektare musim ini" tidak pernah bisa menjumlahkan keduanya. Skema
 * sudah menyatakannya sejak lama: `Step.cycle` WAJIB, dan `Cycle.plot` menunjuk petak.
 * Realisasi tanpa siklus bukan Step yang kurang lengkap — ia bukan Step.
 *
 * YANG DISIMPAN DI SINI BUKAN ENTITAS `Plot`, DAN ITU HARUS DIKATAKAN. Skema `Plot`
 * mewajibkan empat hal; dua di antaranya sengaja tidak diminta lapisan ini:
 *
 *   `holder`    menunjuk aktor — artinya menyebut nama orang. Lapisan gratis tidak
 *               mengumpulkan, jadi tidak ada aktor untuk ditunjuk.
 *   geometri    `sidik-petak.mjs` (G5) menolak `single_point` dan `unknown`: titik tunggal
 *               presisi lima desimal di dalam satu kabupaten habis ditebak GPU dalam 0,08
 *               detik, jadi sidiknya bukan penjagaan melainkan penunjuk lokasi yang bisa
 *               dibalik. Tanpa poligon tidak ada geoid, dan tanpa geoid petak ini tidak
 *               bisa disandingkan dengan petak siapa pun.
 *
 * Yang tersisa — nama, jenis, luas — cukup untuk MENYAMBUNGKAN layar satu sama lain, dan
 * tidak cukup untuk menyambungkan petani satu sama lain. Bedanya besar, dan tiap layar
 * yang memakai berkas ini menyebutnya di blok batasnya.
 *
 * PETAK DAN MUSIM DINAMAI TERPISAH, tetapi tetap satu rekaman. Petak hidup lebih lama
 * daripada musim: petak yang sama ditanami dua kali setahun, dan yang mau tahu apakah
 * musim ini lebih mahal daripada musim lalu di petak yang sama perlu keduanya bisa
 * dibedakan. Memecahnya jadi dua rekaman berarti dua formulir pendaftaran sebelum catatan
 * pertama — dan buku kas sudah memutuskan bahwa pendaftaran di depan catatan pertama
 * membunuh kebiasaan sebelum ia lahir. Jadi: satu rekaman, dua medan, keduanya boleh
 * kosong.
 */

import { teks } from './pustaka.js';

export const KUNCI_MUSIM = 'op:musim';
const KUNCI_KAS = 'op:kas';

/* Diambil apa adanya dari `Plot.kind` di plot.schema.json. Diterjemahkan, tidak diringkas:
 * yang mengarang kategorinya sendiri di sini akan menghasilkan rekaman yang tidak bisa
 * dipetakan balik ke skemanya saat lapisan berbayar mengangkatnya jadi Plot betulan. */
export const JENIS_PETAK = [
  ['paddy_field', 'Sawah'],
  ['field', 'Lahan kering atau tegalan'],
  ['greenhouse', 'Rumah kaca'],
  ['screenhouse', 'Rumah kasa'],
  ['nursery', 'Pembibitan'],
  ['orchard_block', 'Blok kebun buah'],
  ['pond', 'Kolam'],
  ['cage', 'Keramba'],
  ['pen', 'Kandang'],
  ['hydroponic_unit', 'Unit hidroponik'],
  ['other', 'Lainnya'],
];

/* Diambil apa adanya dari `Cycle.status`. Enamnya dibawa utuh, bukan diringkas jadi
 * "berjalan/selesai": bedanya `harvested` dan `closed` justru yang paling sering ditanya —
 * panen sudah lewat tetapi penjualannya belum tuntas adalah keadaan yang berbulan-bulan
 * bisa bertahan, dan buku kas masih terisi selama itu. Menggabungkannya berarti musim
 * dinyatakan tutup sementara uangnya masih masuk. */
export const STATUS_MUSIM = [
  ['planned', 'Belum mulai'],
  ['active', 'Berjalan'],
  ['harvested', 'Sudah panen, belum ditutup'],
  ['closed', 'Ditutup'],
  ['failed', 'Gagal'],
  ['abandoned', 'Ditinggalkan'],
];

// Musim tanpa status adalah musim yang sudah ada sebelum medan ini lahir. Ia berjalan —
// menganggapnya "belum mulai" akan membuat catatan yang sudah ada tampak mendahului
// musimnya sendiri.
export const statusMusim = (m) => m?.status ?? 'active';
export const namaStatus = (k) => STATUS_MUSIM.find(([x]) => x === k)?.[1] ?? k;
export const BERAKHIR = ['harvested', 'closed', 'failed', 'abandoned'];
export const sudahBerakhir = (m) => BERAKHIR.includes(statusMusim(m));

const namaJenis = (k) => JENIS_PETAK.find(([x]) => x === k)?.[1] ?? null;
const n = (x) => Number(x ?? 0).toLocaleString('id-ID');

let daftarMusim = [];
let idAktif = null;
let hidup = true;
export const simpananHidup = () => hidup;

/* ---------------------------------------------------------------------------
 * Simpanan, dan pindahan yang tidak boleh menghilangkan apa pun
 * ---------------------------------------------------------------------------
 * Bentuk simpanan buku kas sudah berubah sekali (larik datar jadi berbermusim), dan
 * catatan lama waktu itu DIBUNGKUS, bukan dibuang. Aturan yang sama berlaku di sini:
 * musim yang sudah dinamai orang di buku kas pindah ke kunci bersama ini apa adanya,
 * lalu `op:kas` menyimpan catatannya saja. Kehilangan catatan karena pembaruan aplikasi
 * adalah kegagalan yang paling merusak kepercayaan pada buku kas — lebih merusak
 * daripada tidak menawarkan penyimpanan sama sekali.
 */
/* SATU TEMPAT SAJA YANG MEMINDAHKAN BENTUK LAMA, dan itu di sini.
 *
 * Versi pertama menaruh pemindahan di dua berkas — musim di sini, catatan di `buku.js` —
 * dan itu HILANG DATA pada bentuk paling lama. Urutannya yang menentukan: modul dievaluasi
 * menurut urutan impornya, jadi di satu layar `buku.js` jalan lebih dulu, menulis ulang
 * `op:kas` tanpa medan `musim`, dan berkas ini kemudian membaca musim yang sudah tidak ada
 * di sana. Layar yang satunya kebetulan mengimpor dengan urutan terbalik dan lolos —
 * yang berarti cacatnya tergantung urutan baris impor, keadaan yang paling buruk untuk
 * ditemukan belakangan.
 *
 * Jadi: seluruh pemindahan dikerjakan berkas ini, `buku.js` mengimpornya supaya dijamin
 * jalan lebih dulu, dan sesudahnya `op:kas` hanya memuat catatan.
 *
 * Tiga bentuk lama yang diterima:
 *   v1  larik datar tanpa musim sama sekali        -> satu musim "Musim pertama"
 *   v2  { musim, catatan, aktif }                  -> musimnya dipindahkan apa adanya
 *   v2½ { catatan } dengan `m` tetapi tanpa musim  -> musim diturunkan dari catatannya
 *
 * Yang ketiga bukan bentuk yang pernah ditulis dengan sengaja; ia bekas cacat di atas.
 * Menerimanya berarti simpanan yang sudah telanjur begitu tetap terbaca alih-alih tampak
 * kosong — dan "tampak kosong" pada buku kas adalah kegagalan yang paling merusak
 * kepercayaan padanya. */
function tulisKas(isi) {
  try { localStorage.setItem(KUNCI_KAS, JSON.stringify(isi)); } catch { hidup = false; }
}

function musimDariCatatan(catatan) {
  const kunci = [...new Set(catatan.map((c) => c.m).filter(Boolean))];
  if (!kunci.length) return [];
  return kunci.map((i, urut) => ({
    i,
    nama: i === 'm0' ? 'Musim pertama' : `Musim ${urut + 1}`,
    komoditas: null,
    luas: null,
  }));
}

function pindahkanLegasi() {
  let k;
  try { k = JSON.parse(localStorage.getItem(KUNCI_KAS) ?? 'null'); } catch { return null; }
  if (!k) return null;

  if (Array.isArray(k)) {
    if (!k.length) return null;
    tulisKas({ catatan: k.map((c) => ({ ...c, m: c.m ?? 'm0' })) });
    return { daftar: [{ i: 'm0', nama: 'Musim pertama', komoditas: null, luas: null }], aktif: 'm0' };
  }
  if (!Array.isArray(k.catatan)) return null;

  const daftar = Array.isArray(k.musim) && k.musim.length ? k.musim : musimDariCatatan(k.catatan);
  if (!daftar.length) return null;
  // Catatan tanpa `m` menempel ke musim pertama, bukan menghilang dari tiap penyaringan.
  const catatan = k.catatan.map((c) => ({ ...c, m: c.m ?? daftar[0].i }));
  tulisKas({ catatan });
  return { daftar, aktif: k.aktif ?? daftar[0].i };
}

function baca() {
  try {
    const m = JSON.parse(localStorage.getItem(KUNCI_MUSIM) ?? 'null');
    if (m && Array.isArray(m.daftar)) return { daftar: m.daftar, aktif: m.aktif ?? null };
  } catch { hidup = false; return { daftar: [], aktif: null }; }
  const pindahan = pindahkanLegasi();
  return pindahan ? { ...pindahan, dipindah: true } : { daftar: [], aktif: null };
}

export function tulis() {
  try {
    localStorage.setItem(KUNCI_MUSIM, JSON.stringify({ daftar: daftarMusim, aktif: idAktif }));
    return true;
  } catch { hidup = false; return false; }
}

{
  const awal = baca();
  daftarMusim = awal.daftar;
  idAktif = awal.aktif;
  // Pindahan disimpan SEKARANG, bukan menunggu perubahan pertama: sampai ia tersimpan,
  // dua layar yang terbuka bersamaan membaca musim dari tempat yang berbeda.
  if (awal.dipindah) tulis();
}

export const semua = () => daftarMusim;
export const aktif = () => daftarMusim.find((m) => m.i === idAktif) ?? null;
export const idMusimAktif = () => idAktif;

export function setAktif(id) {
  if (!daftarMusim.some((m) => m.i === id)) return false;
  idAktif = id;
  return tulis();
}

export function tambah(isi) {
  const baru = {
    i: 'm' + Date.now(),
    nama: isi.nama,
    petak: isi.petak?.trim() || null,
    jenis: isi.jenis || null,
    komoditas: isi.komoditas?.trim() || null,
    luas: Number.isFinite(isi.luas) && isi.luas > 0 ? isi.luas : null,
    tanam: isi.tanam || null,
    protokol: isi.protokol || null,
    status: 'active',
    ditutup: null,
  };
  daftarMusim.push(baru);
  idAktif = baru.i;
  tulis();
  return baru;
}

/* Ditambal, bukan ditimpa. Layar rencana mengisi `tanam` dan `protokol`; buku kas mengisi
 * `luas` dan `komoditas`. Yang satu tidak boleh menghapus isian yang lain hanya karena
 * medannya tidak ada di formulirnya sendiri. */
export function perbarui(id, tambalan) {
  const m = daftarMusim.find((x) => x.i === id);
  if (!m) return null;
  for (const [k, v] of Object.entries(tambalan)) if (v !== undefined) m[k] = v;
  tulis();
  return m;
}

/* Menutup musim, dan tanggalnya WAJIB — aturan yang sama dengan L38 di pemeriksa:
 * "siklus yang berakhir tanpa tanggal tidak bisa ditaruh di musim mana pun". Dibuat di
 * sini alih-alih di layarnya supaya ketiga layar tidak bisa menutup musim dengan cara
 * yang berbeda-beda.
 *
 * Membuka kembali juga disediakan, dan itu bukan kelonggaran: yang menutup musim terlalu
 * cepat lalu menemukan satu catatan yang belum masuk tidak boleh terjebak. Tanggalnya ikut
 * dicabut, karena arah sebaliknya — tanggal yang tertinggal pada musim yang berjalan —
 * persis yang ditolak L38. */
export function tutup(id, status, tanggal) {
  if (!BERAKHIR.includes(status)) return { ok: false, sebab: 'status bukan keadaan berakhir' };
  if (!tanggal) return { ok: false, sebab: 'tanggal berakhir wajib' };
  const m = daftarMusim.find((x) => x.i === id);
  if (!m) return { ok: false, sebab: 'musim tidak ada' };
  if (m.tanam && tanggal < m.tanam) {
    return { ok: false, sebab: `tanggal berakhir ${tanggal} mendahului tanggal tanam ${m.tanam}` };
  }
  m.status = status;
  m.ditutup = tanggal;
  tulis();
  return { ok: true, musim: m };
}

export function bukaLagi(id) {
  const m = daftarMusim.find((x) => x.i === id);
  if (!m) return null;
  m.status = 'active';
  m.ditutup = null;
  tulis();
  return m;
}

/* Ringkasan satu baris yang sama di tiap layar. Dipakai di kepala pemilih, jadi ia harus
 * tetap terbaca saat separuh medannya kosong — dan separuh medannya memang kerap kosong. */
export function ringkas(m) {
  if (!m) return '';
  return [
    m.petak && `petak ${m.petak}`,
    m.jenis && namaJenis(m.jenis),
    m.komoditas,
    m.luas > 0 ? `${n(m.luas)} hektare` : 'luas belum diisi',
    sudahBerakhir(m) ? `${namaStatus(statusMusim(m))}${m.ditutup ? ` ${m.ditutup}` : ''}` : null,
  ].filter(Boolean).join(' · ');
}

/* ---------------------------------------------------------------------------
 * Pemilih yang sama di tiap layar
 * ---------------------------------------------------------------------------
 * Digambar satu berkas, bukan disalin dua kali. Dua rupa untuk satu hal yang sama membuat
 * orang mengira keduanya berbeda — dan di sini "berbeda" berarti mengira catatannya
 * masuk ke musim yang lain.
 */
export function pasangMusim(wadah, { onGanti, saran } = {}) {
  let usul = saran ?? '';
  const gambar = () => {
    const m = aktif();
    const pilihan = daftarMusim.length
      ? `<label for="musimAktif">Sedang dicatat</label>
         <select id="musimAktif">
           ${daftarMusim.map((x) => `<option value="${teks(x.i)}"${x.i === idAktif ? ' selected' : ''}>${teks(x.nama)}${x.luas > 0 ? ` — ${n(x.luas)} ha` : ''}</option>`).join('')}
         </select>
         <p class="catatan">${teks(ringkas(m))}</p>`
      : `<p class="kosong">Belum ada musim. Beri nama satu di bawah — boleh sesederhana
         "Cabai petak belakang".</p>`;

    wadah.innerHTML = `
      <h2>Musim dan petak yang sedang dicatat</h2>
      <div class="pilih-musim">${pilihan}</div>
      <p class="catat-kabar" id="kabarMusim" role="status" aria-live="polite"></p>
      <details class="atur-musim"${daftarMusim.length ? '' : ' open'}>
        <summary>Ganti atau tambah musim</summary>
        <div class="musim-isi">
          <label for="mNama">Nama musim</label>
          <input type="text" id="mNama" autocomplete="off" value="${teks(usul)}"
                 placeholder="misal: Cabai MT1 2026">
          <div class="catat-baris">
            <span>
              <label for="mPetak">Nama petak</label>
              <input type="text" id="mPetak" autocomplete="off" placeholder="misal: Petak belakang">
            </span>
            <span>
              <label for="mJenis">Jenis petak</label>
              <select id="mJenis">
                <option value="">— tidak diisi —</option>
                ${JENIS_PETAK.map(([k, l]) => `<option value="${k}">${teks(l)}</option>`).join('')}
              </select>
            </span>
          </div>
          <div class="catat-baris">
            <span>
              <label for="mKomoditas">Komoditas</label>
              <input type="text" id="mKomoditas" autocomplete="off" placeholder="misal: Cabai merah">
            </span>
            <span>
              <label for="mLuas">Luas (hektare)</label>
              <input type="number" id="mLuas" inputmode="decimal" min="0" step="0.01" placeholder="misal 0.25">
            </span>
          </div>
          <p class="catat-aksi"><button type="button" id="tambahMusim">Simpan musim ini</button></p>
          <p class="catatan">
            Nama petak memisahkan musim ini dari musim berikutnya <strong>di petak yang
            sama</strong> — tanpanya dua musim berturut-turut cuma dua nama yang tidak bisa
            disandingkan. Luas boleh dikosongkan; yang hilang cuma <strong>biaya per
            hektare</strong>, dan itulah satuan yang dipakai hampir semua program yang
            meminta angka biaya usaha tani.
          </p>
        </div>
      </details>`;

    wadah.querySelector('#musimAktif')?.addEventListener('change', (ev) => {
      setAktif(ev.target.value);
      gambar();
      onGanti?.(aktif());
    });

    wadah.querySelector('#tambahMusim').addEventListener('click', () => {
      const kabar = wadah.querySelector('#kabarMusim');
      const nama = wadah.querySelector('#mNama').value.trim();
      if (!nama) {
        kabar.textContent = 'Beri namanya dulu — cukup satu yang kamu kenali sendiri.';
        wadah.querySelector('#mNama').focus();
        return;
      }
      const baru = tambah({
        nama,
        petak: wadah.querySelector('#mPetak').value,
        jenis: wadah.querySelector('#mJenis').value,
        komoditas: wadah.querySelector('#mKomoditas').value,
        luas: Number(wadah.querySelector('#mLuas').value),
      });
      usul = '';
      gambar();
      onGanti?.(baru);
      wadah.querySelector('#kabarMusim').textContent = `"${baru.nama}" jadi musim yang sedang dicatat.`;
    });
  };

  gambar();
  return gambar;
}
