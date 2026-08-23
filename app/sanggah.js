/* Sanggahan terbuka — B3 pada docs/15-kapabilitas-lintas-pemangku.md.
 *
 * Janjinya satu kalimat: SIAPA PUN BOLEH MENANTANG SATU FAKTA, DAN JEJAKNYA PUBLIK DAN
 * BERNAMA. Alasannya sudah tertulis di docs/00 sebelum satu baris kode pun ada — konten
 * statis yang tidak bisa dikoreksi "cuma PDF dengan tampilan lebih bagus", dan yang
 * mencegahnya adalah "mekanisme umpan balik dari lapangan". Ini mekanisme itu.
 *
 * SATU UKURAN MENGUBAH BENTUKNYA, DAN TANPA UKURAN ITU BENTUKNYA AKAN BERBOHONG.
 * Dari 31.837 rekaman yang bisa muncul di layar, yang diterbitkan proyek ini sendiri ada
 * 28 — nol koma nol delapan delapan persen. Sisanya salinan: 31.575 dari registri
 * kementerian, 234 dari OpenStreetMap. Tombol tunggal "sanggah fakta ini" yang membuka
 * isu karena itu menyiratkan sesuatu yang tidak benar di 99,9% layar: bahwa repositori
 * ini bisa membetulkan apa yang ia salin. Kebenarannya tinggal di registri orang lain,
 * dan isu di sini tidak menyentuhnya.
 *
 * Jadi yang ditanya lebih dulu bukan "apa yang benar", melainkan APA YANG SALAH — karena
 * jawabannya menentukan ke mana perbaikannya pergi, dan ketiganya pergi ke tempat
 * berbeda:
 *
 *   salinan  Layar menampilkan lain dari yang disebut registrinya. REPOSITORI INI BISA
 *            MEMBETULKANNYA, dan ini satu-satunya jenis yang berlaku di seluruh 31.837.
 *   fakta    Registrinya memang menyebut begitu, dan yang disebutnya salah di lapangan.
 *            REPOSITORI INI TIDAK BISA MEMBETULKANNYA. Yang bisa dilakukannya mencatat —
 *            dan mencatat bukan membetulkan, jadi layar mengatakannya alih-alih
 *            membiarkan tombol yang tampak sama menyiratkan hasil yang sama.
 *   sajian   Angkanya benar, cara layar membingkainya menyesatkan. REPOSITORI INI BISA.
 *
 * SATU HAL SENGAJA TIDAK DIBUAT: jalan menyanggah titik OpenStreetMap dengan menyalinnya
 * ke sini. 234 titik toko datang dari OSM, tempat siapa pun boleh menyunting langsung.
 * Koreksi yang ditampung di repositori ini justru menjadi salinan ketiga yang basi begitu
 * OSM diperbarui — jadi yang ditawarkan tautan ke penyunting OSM-nya sendiri.
 *
 * SATU ATURAN DIWARISI, DAN KALI INI MENGARAH BALIK KE PEMBACA. batas.js menuntut tiap
 * layar menyebut alasan tingkat buktinya, mewarisi preparation.schema.json: "tingkat
 * bukti tanpa alasan adalah klaim tanpa dasar". Di sini tuntutan yang sama dikenakan
 * kepada YANG MENYANGGAH — tanpa dasar, sanggahannya tidak disusun sama sekali. Bukan
 * karena penyanggahnya kurang dipercaya, melainkan karena layar yang menuntut dasar dari
 * dirinya sendiri lalu menerima sanggahan tanpa dasar sedang memakai dua timbangan.
 */

import { teks, bacaMeta, tanggal } from './pustaka.js';
import { bukaIsu, salin, REPO } from './serah.js';

const JENIS = {
  salinan: {
    ringkas: 'Salinannya',
    label: 'Salinannya — layar ini menampilkan lain dari yang disebut registrinya',
    label_kami: 'Salinannya — layar ini menampilkan lain dari yang disebut berkas sumbernya',
    label_isu: 'Salinan tidak sesuai sumbernya',
    tanda: 'sanggahan-salinan',
    akibat: 'Repositori ini bisa membetulkannya: yang salah salinannya, bukan sumbernya.',
  },
  fakta: {
    ringkas: 'Faktanya sendiri',
    label: 'Faktanya sendiri — registrinya memang menyebut begitu, dan itu salah di lapangan',
    label_kami: 'Faktanya sendiri — yang diterbitkan proyek ini salah',
    label_isu: 'Fakta di sumbernya disanggah',
    tanda: 'sanggahan-fakta',
    akibat: 'Repositori ini TIDAK bisa membetulkannya — yang salah bukan salinannya, '
          + 'melainkan yang diterbitkan registrinya. Yang bisa dilakukan di sini mencatat '
          + 'sanggahannya secara terbuka. Mencatat bukan membetulkan.',
    akibat_kami: 'Repositori ini bisa membetulkannya: rekaman ini memang terbitannya sendiri.',
  },
  sajian: {
    ringkas: 'Penyajiannya',
    label: 'Penyajiannya — angkanya benar, tapi cara layar ini menyajikannya menyesatkan',
    label_kami: 'Penyajiannya — angkanya benar, tapi cara layar ini menyajikannya menyesatkan',
    label_isu: 'Penyajian menyesatkan',
    tanda: 'sanggahan-sajian',
    akibat: 'Repositori ini bisa membetulkannya: yang disanggah layarnya, bukan datanya.',
  },
};

const milikKami = (s) => s?.penerbit === 'Open Protocols';
const dariOsm = (s) => /openstreetmap/i.test(s?.penerbit ?? '') || /odbl/i.test(s?.lisensi ?? '');

/* Kalimat pembuka disusun dari sumber yang BENAR-BENAR disebut layar ini, bukan dari
 * angka umum. Layar sediaan menerbitkan resepnya sendiri dan layar produk tidak, dan
 * satu kalimat yang sama untuk keduanya akan salah di salah satunya. */
function kalimatAsal(sumber) {
  const kami = sumber.filter(milikKami);
  const salinan = sumber.filter((s) => !milikKami(s));
  const penerbit = [...new Set(salinan.map((s) => s.penerbit).filter(Boolean))];

  // Layar tanpa satu sumber sah pun sudah menggambar blok merahnya sendiri di atas.
  // Yang tidak boleh terjadi: ketiadaan sumber terbaca sebagai "semuanya terbitan
  // sendiri" — itu justru kebalikan dari yang sedang terjadi.
  if (!sumber.length) {
    return `Layar ini <strong>tidak menyebut satu sumber pun</strong>, dan itu sendiri cacat
            yang layak disanggah. Sanggahan dari sini tetap tercatat, tetapi asal faktanya
            tidak bisa ikut disertakan karena layarnya memang belum menyatakannya.`;
  }

  if (!salinan.length) {
    return `Fakta di layar ini <strong>diterbitkan proyek ini sendiri</strong>. Sanggahan yang
            diterima bisa langsung mengubah berkasnya.`;
  }
  const daftar = penerbit.map((p) => `<strong>${teks(p)}</strong>`).join(', ');
  const awal = kami.length
    ? `Sebagian fakta di layar ini terbitan proyek ini sendiri; sisanya <strong>salinan</strong> dari ${daftar}.`
    : `Fakta di layar ini <strong>salinan</strong> dari ${daftar}.`;
  return `${awal} Repositori ini tidak menerbitkan registrinya — jadi kalau yang salah
          faktanya sendiri, yang bisa dilakukan di sini <em>mencatat</em>, bukan membetulkan.`;
}

function pilihanJenis(hanyaKami) {
  return Object.entries(JENIS).map(([k, v]) => `
    <label class="bj-pilih">
      <input type="radio" name="jenis" value="${k}"${k === 'salinan' ? ' checked' : ''}>
      <span>${teks(hanyaKami && v.label_kami ? v.label_kami : v.label)}</span>
    </label>`).join('');
}

/**
 * Blok sanggahan, digambar di ekor blok batas jawaban.
 * @param {Array} sumber sumber yang sudah diurai batas.js — dipakai menyusun kalimat
 *   asal dan menentukan apakah titik OSM ikut disebut.
 */
export function blokSanggah(sumber) {
  const hanyaKami = sumber.length > 0 && sumber.every(milikKami);
  const osm = sumber.some(dariOsm);

  return `
    <details class="bj-sanggah">
      <summary>Ada yang salah di layar ini? Sanggah satu fakta</summary>
      <div class="bj-sanggah-isi">
        <p class="bj-asal">${kalimatAsal(sumber)}</p>

        ${osm ? `
        <p class="bj-osm">
          <strong>Titik toko di layar ini datang dari OpenStreetMap</strong>, tempat siapa pun
          boleh menyunting langsung. Kalau yang salah letak, nama, atau keberadaan tokonya,
          perbaikilah di sana — <a href="https://www.openstreetmap.org/edit" rel="noopener noreferrer">penyunting
          OpenStreetMap</a> — bukan di sini. Koreksi yang ditampung repositori ini menjadi
          salinan ketiga yang basi begitu OSM diperbarui.
        </p>` : ''}

        <fieldset class="bj-medan">
          <legend>Apa yang salah?</legend>
          ${pilihanJenis(hanyaKami)}
          <p class="bj-akibat" role="status" aria-live="polite"></p>
        </fieldset>

        <label for="sg-fakta">Fakta yang mana</label>
        <input type="text" id="sg-fakta" name="fakta" autocomplete="off"
               placeholder="misal: dosis PHONSKA pada cabai tertulis 300 kg/ha">

        <label for="sg-seharusnya">Yang seharusnya tertulis</label>
        <textarea id="sg-seharusnya" name="seharusnya" rows="2"
                  placeholder="misal: 200–250 kg/ha"></textarea>

        <label for="sg-dasar">Dasarnya — wajib</label>
        <textarea id="sg-dasar" name="dasar" rows="3"
                  placeholder="misal: label kemasan terbitan 2025, nomor pendaftaran yang sama; atau SK Mentan nomor …; atau pengamatan lapangan di … pada …"></textarea>
        <p class="bj-catat">
          Layar ini menuntut dirinya sendiri menyebut alasan tiap tingkat bukti, karena
          tingkat bukti tanpa alasan adalah klaim tanpa dasar. Tuntutan yang sama berlaku
          untuk sanggahan — tanpa dasar, sanggahannya tidak disusun.
        </p>

        <p class="bj-catat bj-catat-tegas">
          <strong>Tidak ada yang terkirim dari halaman ini.</strong> Tombol di bawah menyusun
          teksnya lalu menyerahkannya kembali kepada Anda. Kalau Anda memilih membuka isu,
          isu itu <strong>terbaca siapa saja</strong> dan <strong>tercatat atas nama akun
          GitHub Anda</strong> — memang itu gunanya: sanggahan yang tidak bisa ditelusuri
          tidak bisa ditimbang. Tidak ada janji dibalas. Jangan menuliskan nomor telepon
          atau alamat Anda di kolom mana pun.
        </p>

        <p class="bj-aksi">
          <button type="button" data-aksi="salin">Salin sanggahannya</button>
          <button type="button" data-aksi="isu">Buka isu yang sudah terisi</button>
        </p>
        <p class="bj-kabar" role="status" aria-live="polite"></p>
        <pre class="bj-pratinjau" hidden></pre>
      </div>
    </details>`;
}

const isi = (x) => (x && String(x).trim() ? String(x).trim() : null);

/* Muatan yang membuat sanggahan bisa ditimbang ulang nanti. Usul gambar tidak
 * membawanya dan memang tidak perlu — usul menambah, sanggahan menantang, dan yang
 * menantang harus bisa ditunjukkan menantang APA. Tanpa cap indeks, sanggahan terhadap
 * angka yang sejak itu berubah tidak bisa ditafsirkan lagi: pembacanya tidak tahu apakah
 * angkanya sudah dibetulkan atau penyanggahnya keliru sejak awal. */
function susunBadan({ jenis, medan, sumber, konteks, hanyaKami }) {
  const j = JENIS[jenis];
  const m = bacaMeta();
  const akibat = (hanyaKami && j.akibat_kami) ? j.akibat_kami : j.akibat;

  const baris = [
    '### Fakta yang disanggah',
    '',
    `- Layar: \`${location.pathname.split('/').pop() || 'app'}\``,
    konteks?.id ? `- Rekaman: \`${konteks.id}\`${konteks.nama ? ` — ${konteks.nama}` : ''}` : '- Rekaman: tidak ada satu rekaman yang sedang terbuka',
    // Tautan-dalam kalau layarnya punya, karena yang menimbang sanggahan harus bisa
    // membuka rekaman yang sama. Alamat bilah alamat apa adanya sering tidak memuat
    // rekamannya — jalur 2 membuka produk tanpa mengubah alamat sama sekali.
    `- Tautan saat disanggah: ${konteks?.tautan ?? location.href}`,
    `- Yang disanggah: ${medan.fakta ?? '(tidak diisi)'}`,
    '',
    '### Apa yang salah',
    '',
    `**${hanyaKami && j.label_kami ? j.label_kami : j.label}**`,
    '',
    akibat,
    '',
    '### Yang seharusnya',
    '',
    medan.seharusnya ?? '(tidak diisi)',
    '',
    '### Dasarnya',
    '',
    medan.dasar,
    '',
    '### Asal fakta menurut layar itu sendiri',
    '',
  ];

  for (const s of sumber) {
    const t = [
      s.tingkat ? `tingkat bukti ${s.tingkat}` : 'tingkat bukti belum ditetapkan',
      s.tarikan && `tarikan ${tanggal(s.tarikan) ?? s.tarikan}`,
      s.lisensi,
    ].filter(Boolean).join(' · ');
    baris.push(`- **${s.label}** — ${s.penerbit ?? 'penerbit tidak disebut'} · ${t}`);
  }

  baris.push(
    '',
    '### Keadaan indeks saat disanggah',
    '',
    `- \`meta.cap\`: \`${m?.cap ?? '(tidak terbaca)'}\``,
    `- \`meta.versi\`: \`${m?.versi ?? '(tidak terbaca)'}\``,
    '',
    '_Disusun oleh blok batas jawaban di halaman yang disanggah, lalu diserahkan kembali '
    + 'kepada penyanggahnya. Belum diperiksa siapa pun._',
  );
  return baris.join('\n');
}

/**
 * Pasang penangan sanggahan di dalam `wadah`.
 * @param {HTMLElement} wadah blok batas jawaban
 * @param {Array} sumber sumber yang sudah diurai batas.js
 * @param {() => ({id?: string, nama?: string}|null)} [bacaKonteks] rekaman yang sedang
 *   terbuka, dibaca SAAT DIKETUK — bukan saat dipasang, karena blok batas digambar sekali
 *   saat muat sementara rekamannya dibuka jauh sesudahnya.
 */
export function pasangSanggah(wadah, sumber, bacaKonteks) {
  const kotak = wadah.querySelector('.bj-sanggah');
  if (!kotak) return;
  const hanyaKami = sumber.length > 0 && sumber.every(milikKami);
  const kabar = kotak.querySelector('.bj-kabar');
  const pratinjau = kotak.querySelector('.bj-pratinjau');
  const akibat = kotak.querySelector('.bj-akibat');

  const jenisKini = () => kotak.querySelector('input[name="jenis"]:checked')?.value ?? 'salinan';

  // Akibat pilihan ditulis SEBELUM ditekan, bukan sesudah. Yang memilih "faktanya
  // sendiri" berhak tahu bahwa isunya tidak akan membetulkan registri sebelum ia
  // menghabiskan waktu menulisnya.
  const perbaruiAkibat = () => {
    const j = JENIS[jenisKini()];
    akibat.textContent = (hanyaKami && j.akibat_kami) ? j.akibat_kami : j.akibat;
  };
  for (const r of kotak.querySelectorAll('input[name="jenis"]')) {
    r.addEventListener('change', perbaruiAkibat);
  }
  perbaruiAkibat();

  // Rekaman yang sedang terbuka diisikan saat kotaknya dibuka, supaya yang menyanggah
  // melihat fakta mana yang akan tercatat alih-alih mempercayainya terisi diam-diam.
  kotak.addEventListener('toggle', () => {
    if (!kotak.open) return;
    const k = bacaKonteks?.();
    const medan = kotak.querySelector('[name="fakta"]');
    if (k?.id && !medan.value) {
      medan.value = k.nama ? `${k.nama} (${k.id}) — ` : `${k.id} — `;
    }
  });

  kotak.addEventListener('click', async (ev) => {
    const tombol = ev.target.closest('button[data-aksi]');
    if (!tombol) return;

    const baca = (nama) => isi(kotak.querySelector(`[name="${nama}"]`)?.value);
    const medan = { fakta: baca('fakta'), seharusnya: baca('seharusnya'), dasar: baca('dasar') };

    if (!medan.dasar) {
      kabar.textContent = 'Dasarnya belum diisi — itu satu-satunya kolom yang wajib, '
        + 'dan alasannya sama dengan alasan layar ini menyebut dasarnya sendiri.';
      kotak.querySelector('[name="dasar"]').focus();
      return;
    }

    const jenis = jenisKini();
    const badan = susunBadan({ jenis, medan, sumber, konteks: bacaKonteks?.(), hanyaKami });
    const k = bacaKonteks?.();
    const judul = `Sanggahan · ${JENIS[jenis].label_isu}: ${medan.fakta ?? k?.nama ?? 'satu fakta di layar'}`;

    // Pratinjau digambar lebih dulu, dan tetap ada apa pun yang terjadi sesudahnya.
    // Kedua jalan keluar bisa gagal — papan klip ditolak, tab baru diblokir, alamat
    // kepanjangan — dan yang sudah diketik tidak boleh ikut hilang bersamanya.
    pratinjau.textContent = `${judul}\n\n${badan}`;
    pratinjau.hidden = false;

    if (tombol.dataset.aksi === 'salin') {
      kabar.textContent = (await salin(`${judul}\n\n${badan}`))
        ? 'Tersalin. Tempelkan ke isu, surel, atau ke mana pun Anda mau — terserah Anda.'
        : 'Peramban menolak papan klip. Salin dari kotak di bawah.';
      return;
    }

    const hasil = bukaIsu({ judul, badan, label: JENIS[jenis].tanda });
    if (hasil.dibuka) {
      kabar.textContent = 'Tab baru dibuka dengan isu yang sudah terisi. Belum terkirim — '
        + 'Anda yang menekan kirim di sana, dan Anda bisa menyuntingnya dulu.';
      return;
    }
    kabar.textContent = hasil.sebab === 'panjang'
      ? 'Sanggahannya terlalu panjang untuk dimuat alamat formulir isu. Sudah disalin ke '
        + `papan klip — buka ${REPO}/issues/new lalu tempelkan.`
      : 'Peramban memblokir tab baru. Salin dari kotak di bawah, lalu tempelkan di '
        + `${REPO}/issues/new`;
    if (hasil.sebab === 'panjang') await salin(`${judul}\n\n${badan}`);
  });
}
