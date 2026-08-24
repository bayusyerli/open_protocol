/* Apa yang benar-benar tersimpan di peranti ini — T7 pada audit alur & rasa pakai.
 *
 * KENAPA BERKAS INI ADA. Beranda menjanjikan satu kalimat: "Yang tersimpan hanya hitungan
 * di peranti ini sendiri, dan isinya bisa dilihat serta dihapus di catatan penggunaan."
 * Kalimat itu benar saat ditulis — waktu itu memang cuma `op.ukur.v1` dan `op:tema`.
 *
 * Ia berhenti benar begitu angka mulai mengalir antar layar. `musim.js` memberi buku kas,
 * layar rencana, dan analisis usaha satu identitas musim bersama, dan bersamanya datang
 * `op:musim`, `op:kas`, `op:rab`, dan `op:realisasi` — nama musim, luas petak, tanggal
 * tanam, tiap baris uang masuk dan keluar, tiap langkah yang sudah dikerjakan beserta
 * simpangannya. Itu bukan "hitungan", dan tidak satu pun tampil atau terhapus di
 * ukur.html: `hapus()` di ukur.js hanya membuang `op.ukur.v1`.
 *
 * Jadi yang rusak bukan penyimpanannya melainkan PERTANGGUNGANNYA. Layar yang seluruh
 * nilainya bersandar pada mengatakan apa yang disimpannya tidak boleh menyimpan sesuatu
 * yang tidak disebutnya. Berkas ini menutup selisih itu, dan menutupnya dengan cara yang
 * tidak bisa basi diam-diam.
 *
 * KUNCI YANG TIDAK DIKENAL IKUT DITAMPILKAN, DAN DITANDAI. Aturan yang sama dengan
 * batas.js: layar yang melewatkan sesuatu harus gagal berisik, bukan diam. Kalau nanti
 * ada yang menambah kunci baru tanpa mendaftarkannya di `ISI`, halaman ini akan
 * menyebutnya "belum dijelaskan" alih-alih menyembunyikannya — dan itu justru keadaan yang
 * paling perlu terlihat, karena kunci yang tak terdaftar juga tidak akan ikut terhapus
 * kalau daftarnya yang dipakai menghapus. Karena itu penghapusan memakai PEMINDAIAN, bukan
 * daftar.
 */

/** Awalan yang dianggap milik app ini. `op.` ikut karena `op.ukur.v1` memakai titik. */
const AWALAN = ['op:', 'op.'];

const ISI = {
  'op:tema': {
    nama: 'Pilihan tampilan layar',
    apa: 'terang, gelap, atau ikut sistem — satu kata.',
  },
  'op:musim': {
    nama: 'Musim dan petak',
    apa: 'nama musim, luas petak, dan tanggal tanam. Dipakai bersama buku kas, rencana musim, dan analisis usaha tani.',
  },
  'op:kas': {
    nama: 'Buku kas',
    apa: 'tiap baris uang keluar dan masuk yang kamu catat, beserta tanggal dan keterangannya.',
  },
  'op:rab': {
    nama: 'Rencana anggaran',
    apa: 'perkiraan biaya per kategori untuk musim yang sedang dicatat.',
  },
  'op:realisasi': {
    nama: 'Realisasi langkah',
    apa: 'langkah rencana yang sudah ditandai selesai, tanggalnya, dan alasan simpangan kalau kamu menuliskannya.',
  },
  'op:takar': {
    nama: 'Kalibrasi penyemprot',
    apa: 'liter air per luas tersemprot, volume tangki, dan isi takaran rumah tanggamu — supaya tidak diukur ulang tiap kali.',
  },
  'op.ukur.v1': {
    nama: 'Hitungan penggunaan',
    apa: 'cacah hari berbeda dan waktu ke jawaban. Inilah yang diringkas tabel di halaman ini.',
  },
};

const milikApp = (k) => AWALAN.some((a) => k.startsWith(a));

/**
 * Seluruh kunci milik app yang benar-benar ada di peranti ini — DIPINDAI, bukan didaftar.
 * Yang tidak terdaftar di `ISI` tetap muncul dengan `dikenal: false`.
 */
export function daftarSimpanan() {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !milikApp(k)) continue;
      const nilai = localStorage.getItem(k) ?? '';
      const ket = ISI[k];
      out.push({
        kunci: k,
        nama: ket?.nama ?? k,
        apa: ket?.apa ?? null,
        dikenal: !!ket,
        // Perkiraan, bukan ukuran sebenarnya: peramban menyimpan UTF-16 dan menambah
        // ongkosnya sendiri. Yang berguna di sini besaran relatifnya, dan itu cukup.
        bita: new Blob([k, nilai]).size,
      });
    }
  } catch {
    // Mode privat menolak membaca. Sama seperti ukur.js: gagal tanpa merusak layarnya.
    return null;
  }
  return out.sort((a, b) => b.bita - a.bita || a.kunci.localeCompare(b.kunci));
}

/**
 * Hapus SELURUH simpanan app di peranti ini, termasuk kunci yang belum terdaftar di `ISI`.
 * Dipindai dan bukan didaftar justru supaya kunci yang lupa didaftarkan tetap ikut
 * terhapus — kalau tidak, tombol yang berbunyi "hapus semua" akan berbohong.
 */
export function hapusSemua() {
  try {
    const kunci = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && milikApp(k)) kunci.push(k);
    }
    for (const k of kunci) localStorage.removeItem(k);
    return kunci.length;
  } catch {
    return 0;
  }
}
