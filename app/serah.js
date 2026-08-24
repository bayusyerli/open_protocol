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
