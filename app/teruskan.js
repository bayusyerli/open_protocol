/* Kartu yang bisa diteruskan — A2 pada docs/15-kapabilitas-lintas-pemangku.md.
 *
 * A2 tertulis "kanal WhatsApp untuk tanya-jawab yang sama", dan sempat ditandai terhalang
 * karena kanal tanya-jawab berarti kotak masuk, dan kotak masuk berarti mengumpulkan —
 * yang dilarang aturan lapisan gratis. Yang keliru bukan A2-nya melainkan bacaannya:
 * aturan itu berbunyi "hanya MENYEBARKAN, tidak pernah MENGUMPULKAN", dan nilai A2 —
 * keterjangkauan — seluruhnya ada di sisi menyebarkan.
 *
 * docs/17 bagian 7.1 sudah sampai ke kesimpulan yang sama dari arah lain: percakapan peer
 * sudah terjadi tiap hari di grup WhatsApp, jadi "yang kurang bukan tempatnya, melainkan
 * MUTU BAHAN YANG BEREDAR DI SANA". Berkas ini bahan itu.
 *
 * SATU UKURAN MENENTUKAN BENTUKNYA. Di layar rincian produk, jawabannya 884 aksara dan
 * blok batasnya 2.178 — batasnya dua setengah kali lebih panjang daripada jawabannya.
 * Jadi "kirim jawaban beserta batasnya" gagal ke dua arah sekaligus: mengirim jawabannya
 * saja mencopot batasnya, dan mengirim keduanya menghasilkan pesan 3.000 aksara yang tidak
 * dibaca siapa pun. Yang dikirim karena itu bukan salinan layar, melainkan kartu yang
 * disusun: inti jawabannya, batas yang MENANGGUNG KEPUTUSAN, dan tautan ke selebihnya.
 *
 * TIGA SIFAT DIWARISI DARI docs/17 BAGIAN 7.3-7.4, DAN KETIGANYA PUNYA SEBAB:
 *
 *   Batasnya melekat di badan teks, bukan cuma di tautan — supaya ikut terbaca "di tangan
 *   kesepuluh". Yang membuka tautannya orang pertama; yang kesepuluh cuma membaca teksnya.
 *
 *   Tanggal dan status dicetak di badan kartu — karena kartu yang sudah diteruskan TIDAK
 *   BISA DITARIK. Kalau isinya direvisi besok, kartu lama tetap beredar, dan satu-satunya
 *   hal yang menyelamatkannya adalah ia menyebutkan sendiri kapan ia benar.
 *
 *   Bentuknya khas dan selalu menyebut batasnya — karena tidak ada yang bisa mencegah
 *   orang mengetik ulang kartu palsu yang menyebut merek. Yang bisa dilakukan cuma membuat
 *   kartu asli mudah dikenali.
 *
 * KARTU TANPA BATAS TIDAK DISUSUN SAMA SEKALI. Layar yang memanggil berkas ini wajib
 * menyebut `wajib` — kalimat yang tidak boleh hilang saat kartunya berpindah tangan.
 * Untuk resep pengendali itu status hukumnya; untuk produk terdaftar itu "cocokkan
 * nomornya dengan kemasan". Layar yang tidak menyebutnya mendapat blok merah, bukan kartu
 * yang diam-diam lebih pendek — aturan yang sama dengan batas.js.
 *
 * DAN KARTU TIDAK PERNAH DIPOTONG DIAM-DIAM. Pertanyaan ke-5 docs/17 justru "apakah kartu
 * yang diteruskan bertahan utuh, atau dipotong". Kalau kartunya melewati batas panjang
 * alamat, jalur WhatsApp DITOLAK beserta sebabnya, bukan dikirim separuh.
 */

import { bacaMeta, teks, tanggal } from './pustaka.js';
import { salin } from './serah.js';

/* 1.200 aksara. Bukan batas WhatsApp — batasnya alamat wa.me, dan yang menegakkannya
 * peramban, bukan WhatsApp. Angka ini dipilih jauh di bawahnya karena kartu yang perlu
 * lebih panjang dari ini sudah bukan kartu; ia layar yang disalin. */
const BATAS_KARTU = 1200;
const BATAS_ALAMAT = 2000;

export const HTML_TERUSKAN = `
  <div class="teruskan">
    <p class="teruskan-ajak">Ada yang perlu tahu ini?</p>
    <p class="teruskan-aksi">
      <button type="button" data-teruskan="wa">Kirim lewat WhatsApp</button>
      <button type="button" data-teruskan="salin">Salin kartunya</button>
    </p>
    <p class="teruskan-kabar" role="status" aria-live="polite"></p>
    <pre class="teruskan-pratinjau" hidden></pre>
  </div>`;

const GARIS = '───────────────';

/* Sumber diringkas jadi satu baris, dan kartunya boleh MENYEBUT SENDIRI sumber mana.
 * Versi pertama memakai sumber pertama yang disebut layar, dan langsung berbohong: layar
 * jalur 2 menyebut tiga registri sekaligus, jadi kartu PHONSKA — sebuah pupuk —
 * mengatributkannya ke "Registri pestisida terdaftar". Layar tahu rekamannya dari registri
 * mana; kartu yang menebaknya akan salah pada dua dari tiga rekaman. */
function barisSumber(kunciSumber) {
  const meta = bacaMeta();
  const k = Array.isArray(kunciSumber) ? kunciSumber[0] : kunciSumber;
  if (!k) return null;
  const s = meta?.batas?.sumber?.[typeof k === 'string' ? k : k?.dari];
  if (!s) return null;
  const bagian = [
    s.penerbit ? `${s.label} — ${s.penerbit}` : s.label,
    [
      s.tingkat ? `tingkat bukti ${s.tingkat}` : 'tingkat bukti belum ditetapkan',
      s.tarikan && `tarikan ${tanggal(s.tarikan) ?? s.tarikan}`,
      s.status && `status ${s.status}`,
    ].filter(Boolean).join(' · '),
  ];
  return bagian.join('\n');
}

/**
 * Susun teks kartu. Mengembalikan `{teks}` atau `{salah:[...]}` — tidak pernah kartu
 * yang diam-diam kurang satu bagian.
 */
export function susunKartu(kartu, kunciSumber) {
  const salah = [];
  if (!kartu) return { salah: ['layar ini tidak menyusun kartu apa pun'] };
  if (!kartu.judul) salah.push('kartu tanpa judul');
  if (!kartu.wajib?.length) {
    salah.push('kartu tanpa `wajib` — kalimat yang tidak boleh hilang saat kartunya '
      + 'berpindah tangan. Kartu tanpa batas yang melekat justru yang berbahaya diteruskan.');
  }
  if (!kartu.tautan) salah.push('kartu tanpa tautan — penerimanya tidak punya jalan memeriksa');
  if (salah.length) return { salah };

  const baris = [
    '*Pranatani* · cek mandiri',
    GARIS,
    `*${kartu.judul}*`,
  ];
  for (const i of kartu.inti ?? []) baris.push(i);
  baris.push('');
  for (const w of kartu.wajib) baris.push(`⚠ ${w}`);

  const sumber = barisSumber(kartu.sumber ?? kunciSumber);
  if (sumber) { baris.push('', sumber); }

  baris.push(
    '',
    'Ini ringkasan. Yang *tidak* diketahui halaman ini ada di tautannya:',
    kartu.tautan,
    GARIS,
    'Bukan anjuran, bukan resep dokter tanaman. Teruskan apa adanya.',
  );
  return { teks: baris.join('\n') };
}

/**
 * Pasang penangan kartu teruskan di dalam `wadah`.
 * @param {HTMLElement} wadah wadah yang memuat HTML_TERUSKAN
 * @param {() => object|null} bacaKartu dipanggil SAAT DIKETUK
 * @param {Array|string} kunciSumber kunci meta.batas.sumber yang dipakai layar ini
 */
export function pasangTeruskan(wadah, bacaKartu, kunciSumber) {
  if (!wadah) return;
  wadah.addEventListener('click', async (ev) => {
    const tombol = ev.target.closest('button[data-teruskan]');
    if (!tombol) return;
    const kotak = tombol.closest('.teruskan');
    const kabar = kotak.querySelector('.teruskan-kabar');
    const pratinjau = kotak.querySelector('.teruskan-pratinjau');

    const { teks: isi, salah } = susunKartu(bacaKartu?.(), kunciSumber);
    if (salah) {
      // Gagal dengan berisik, sama seperti batas.js. Layar yang lupa menyebut batasnya
      // tidak boleh menghasilkan kartu yang tampak beres.
      kabar.textContent = 'Kartu layar ini belum lengkap, jadi tidak disusun.';
      pratinjau.textContent = salah.join('\n');
      pratinjau.hidden = false;
      for (const x of salah) console.error(`kartu teruskan: ${x}`);
      return;
    }

    // Pratinjau lebih dulu, dan tetap ada apa pun yang gagal sesudahnya.
    pratinjau.textContent = isi;
    pratinjau.hidden = false;

    if (tombol.dataset.teruskan === 'salin') {
      kabar.textContent = (await salin(isi))
        ? 'Tersalin. Tempelkan ke mana pun — WhatsApp, SMS, atau catatan.'
        : 'Peramban menolak papan klip. Salin dari kotak di bawah.';
      return;
    }

    const alamat = `https://wa.me/?text=${encodeURIComponent(isi)}`;
    if (isi.length > BATAS_KARTU || alamat.length > BATAS_ALAMAT) {
      // Dipotong diam-diam adalah kegagalan yang paling mungkin dan paling tidak
      // terlihat: yang mengirim mengira batasnya ikut, padahal ia yang terpotong lebih
      // dulu karena letaknya di ekor.
      await salin(isi);
      kabar.textContent = `Kartunya ${isi.length} aksara — terlalu panjang untuk dimuat `
        + 'alamat WhatsApp, dan memotongnya akan membuang justru bagian batasnya. Sudah '
        + 'disalin; tempelkan langsung di WhatsApp.';
      return;
    }
    const tab = window.open(alamat, '_blank', 'noopener,noreferrer');
    kabar.textContent = tab
      ? 'WhatsApp dibuka dengan kartunya. Belum terkirim — Anda yang memilih penerimanya.'
      : 'Peramban memblokir tab baru. Salin dari kotak di bawah.';
    if (!tab) await salin(isi);
  });
}
