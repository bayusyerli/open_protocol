/* Serah-terima — satu-satunya jalan keluar tulisan pembaca dari permukaan ini.
 *
 * Permukaan ini statis: tanpa akun, tanpa server, tanpa satu pun tulisan pengguna yang
 * disimpan. Aturan yang ditulis docs/15 untuk lapisan gratis berbunyi "hanya
 * menyebarkan, tidak pernah mengumpulkan", dan C2 menambahkan sebabnya: kotak masuk
 * yang tak seorang pun di ujungnya lebih buruk daripada tidak ada kotak masuk.
 *
 * Jadi yang dilakukan berkas ini bukan mengirim. Ia MENYUSUN, lalu menyerahkan kembali
 * kepada yang mengetik — ke papan klip, atau ke formulir isu yang sudah terisi di tab
 * baru. Tidak ada permintaan jaringan yang berangkat diam-diam; yang menekan kirim tetap
 * orangnya, di situs yang ia kenali, dengan namanya sendiri.
 *
 * Dipakai bersama dua penyusun: usul gambar (gambar.js) dan sanggahan (sanggah.js).
 * Sebelumnya alamat repositori dan pemanggilan window.open tinggal di gambar.js, dan
 * penyusun kedua yang menyalinnya berarti dua salinan yang akan menyimpang begitu salah
 * satunya diperbaiki.
 *
 * BATAS PANJANG ALAMAT ADA, DAN DIAM-DIAM MELEWATINYA MERUGIKAN. Formulir isu GitHub
 * diisi lewat query string, dan alamat yang terlalu panjang ditolak peladen atau
 * dipotong peramban — yang kedua lebih buruk, karena isu terbuka dengan isi yang hilang
 * separuh tanpa ada yang tahu. Karena itu panjangnya diperiksa lebih dulu, dan yang
 * melewati batas dialihkan ke papan klip beserta sebabnya.
 */

/* Lambang WhatsApp untuk tombol yang membuka wa.me. Tinggal di sini, bukan di dua
 * penyusun yang memakainya, karena alasan yang sama dengan alamat repositori di bawah:
 * dua salinan akan menyimpang begitu salah satunya disentuh.
 *
 * DIGAMBAR DENGAN `currentColor`, BUKAN HIJAU MEREKNYA. Hijau WhatsApp #25D366 di atas
 * kertas terang berhenti di kontras 1,8:1 — bentuknya masih terbaca, tetapi ia tampak
 * pudar di sebelah label yang pekat, dan di mode gelap ia jadi satu-satunya benda yang
 * menyala. Bentuk gagang di dalam gelembung itulah yang dikenali orang; warnanya
 * mengikuti tombolnya, sehingga kedua mode benar tanpa aturan tambahan.
 *
 * `aria-hidden` karena labelnya sudah menyebut WhatsApp. Ikon yang mengulang kata yang
 * ada di sebelahnya membuat pembaca layar mengucapkannya dua kali.
 *
 * `fill` DITULIS SEBAGAI ATRIBUT, BUKAN DI LEMBAR GAYA. Fill bawaan SVG hitam pekat, dan
 * di mode gelap itu berarti lambang yang tidak terlihat sama sekali. Aturan gaya bisa
 * memperbaikinya, tetapi ikon ini dipakai dua penyusun yang halamannya belum tentu
 * memuat lembar gaya yang sama — dan preseden .tombol-tema, yang aturannya harus
 * digandakan di gaya.css DAN beranda.css supaya benar di kedua tempat, sudah menunjukkan
 * ke mana itu bermuara. Atribut ikut ke mana pun tandanya dipasang. */
const JALUR_WA = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15'
  + '-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475'
  + '-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52'
  + '.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207'
  + '-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297'
  + '-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487'
  + '.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413'
  + '.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0'
  + ' 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001'
  + '-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994'
  + 'c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16'
  + ' 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0'
  + ' 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z';

export const IKON_WA =
  `<svg class="ikon-wa" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" `
  + `aria-hidden="true" `
  + `focusable="false"><path d="${JALUR_WA}"/></svg>`;

export const REPO = 'https://github.com/bayusyerli/open_protocol';

/* 8.000 aksara. Batas sesungguhnya milik peladen GitHub dan tidak diumumkan persis;
 * angka ini dipilih di bawahnya supaya yang lolos benar-benar lolos utuh. */
const BATAS_ALAMAT = 8000;

export function alamatIsu({ judul, badan, label }) {
  const q = new URLSearchParams({ title: judul, body: badan });
  if (label) q.set('labels', label);
  return `${REPO}/issues/new?${q}`;
}

/** Salin ke papan klip. Mengembalikan true kalau peramban mengizinkannya. */
export async function salin(isi) {
  try {
    await navigator.clipboard.writeText(isi);
    return true;
  } catch {
    // Ditolak peramban: mode privat, atau halaman tidak dilayani lewat HTTPS. Penyusun
    // yang memanggil ini sudah menggambar pratinjaunya lebih dulu, jadi isinya tetap
    // bisa disalin tangan — itu sebabnya urutannya begitu.
    return false;
  }
}

/* `window.open` DENGAN FITUR `noopener` SELALU MENGEMBALIKAN null — bahkan ketika tabnya
 * benar-benar terbuka. Itu bukan kelakuan aneh satu peramban melainkan bunyi
 * spesifikasinya: memutus `opener` berarti tidak ada jendela yang bisa dikembalikan.
 *
 * Versi sebelumnya membaca null itu sebagai "diblokir", sehingga SETIAP sanggahan data,
 * usul gambar, dan kartu WhatsApp membuka tabnya dengan benar lalu memberi tahu orangnya
 * bahwa peramban memblokirnya, dan menjatuhkannya ke fallback salin-tempel. Seluruh jalur
 * kontribusi tampak rusak padahal jalan — dan kontribusi adalah cara registri ini tetap
 * benar.
 *
 * Anchor sintetis memberi dua-duanya: `rel` menutup `opener` seperti semula, dan karena
 * `noopener` TIDAK lewat argumen fitur, tidak ada nilai balik yang perlu ditafsirkan.
 * Klik terprogram atas anchor bertarget `_blank` diperlakukan peramban sama seperti klik
 * orang selama ia masih di dalam gestur yang sama — dan pemanggilnya memang selalu dari
 * penangan klik. Yang tersisa hanya kegagalan yang benar-benar bisa dideteksi: alamat
 * yang kepanjangan. */
export function bukaIsu({ judul, badan, label }) {
  const alamat = alamatIsu({ judul, badan, label });
  if (alamat.length > BATAS_ALAMAT) {
    return { dibuka: false, sebab: 'panjang' };
  }
  return { dibuka: bukaTab(alamat) };
}

/**
 * Buka satu alamat di tab baru tanpa membocorkan `opener`.
 * @returns {boolean} false hanya kalau peramban melempar — bukan kalau ia "mengembalikan
 *   null", yang memang selalu terjadi dan bukan tanda kegagalan.
 */
export function bukaTab(alamat) {
  try {
    const a = document.createElement('a');
    a.href = alamat;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  } catch {
    return false;
  }
}
