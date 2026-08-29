/* Aritmetika yang keluarannya keputusan belanja — dipisahkan supaya bisa diuji.
 *
 * KENAPA BERKAS INI ADA. Permukaan ini menghitung empat angka yang langsung ditindaklanjuti
 * orang dengan uangnya: rupiah per kilogram hara (jalur 3), titik impas per kilogram
 * (analisis usaha), harga yang benar-benar diterima, dan takaran per tangki. Yang terakhir
 * sudah punya berkasnya sendiri sesudah salah sepuluh kali lipat di 483 halaman, dan
 * alasannya sama persis: selama fungsinya terkurung di dalam modul yang menyentuh DOM di
 * baris pertama, tidak ada cara mengujinya tanpa peramban — dan yang tidak bisa diuji tidak
 * pernah diuji.
 *
 * Ketiganya di sini murni: masuk angka, keluar angka. Tidak ada `document`, tidak ada
 * `localStorage`, tidak ada `fetch`. Ujinya di spec/tools/uji-hitung.mjs, dan ia berjalan
 * lewat `npm test`.
 *
 * YANG DIKEMBALIKAN null BUKAN 0. Nol adalah jawaban — ia berarti "gratis" atau "impas di
 * angka nol", dan tidak satu pun benar ketika masukannya belum lengkap. Layar yang menerima
 * null menggambar keadaan kosong; layar yang menerima 0 mencetak "Rp 0/kg" dengan percaya
 * diri. Itu sebabnya tiap fungsi di bawah menolak, bukan memulangkan nol.
 */

/* Batas yang sama dengan yang dipakai kolom per-tangki, dan alasannya juga sama: satu
 * kilogram tidak bisa berisi lebih dari satu kilogram. Sembilan pendaftaran di registri
 * mengatakan sebaliknya — biasanya karena satuannya tertukar di sumbernya (Zn ditulis
 * 79,42% padahal ppm) — dan pemeriksa spec sudah menyalakan L27 untuk mereka. Kalau
 * dibiarkan, hitungannya tidak gagal melainkan BERHASIL dengan angka yang menyesatkan:
 * fraksi hara di atas 1,0 membuat rupiah per kilogram hara keluar lebih murah daripada
 * harga produknya sendiri, dan layar yang seluruh gunanya membandingkan kemurahan akan
 * menobatkan justru pendaftaran yang datanya rusak sebagai yang paling murah. */
export const BATAS_HARA = 1000;   // gram hara per kilogram atau liter produk

export const haraMustahil = (totalGram) => Number(totalGram) > BATAS_HARA;

/**
 * Rupiah per kilogram hara — bukan per karung.
 *
 * @param {number} harga  harga satu kemasan, dari orangnya sendiri (registri tidak memuat harga)
 * @param {number} isi    isi kemasan dalam kg atau L, juga dari orangnya (registri tidak memuatnya)
 * @param {number} totalGram  gram hara per kg/L menurut pendaftaran
 * @returns {number|null} null bila masukannya belum lengkap atau komposisinya mustahil
 */
export function rupiahPerKgHara(harga, isi, totalGram) {
  if (!(harga > 0) || !(isi > 0) || !(totalGram > 0)) return null;
  if (haraMustahil(totalGram)) return null;
  const perSatuan = harga / isi;
  const fraksi = totalGram / 1000;
  const hasil = perSatuan / fraksi;
  return Number.isFinite(hasil) ? hasil : null;
}

/**
 * Titik impas: berapa rupiah per kilogram hasil supaya biayanya tertutup.
 *
 * Dihitung dari biaya yang DIRENCANAKAN, bukan dari yang sudah keluar. Di tengah musim
 * biaya yang sudah keluar selalu lebih kecil daripada rencananya, jadi titik impas dari
 * angka itu selalu tampak lebih baik — kabar bagus yang seluruhnya berasal dari musim yang
 * belum selesai. Pemanggil yang menentukan biaya mana yang dioperkan; fungsi ini tidak
 * memilihkan.
 *
 * @returns {number|null} null bila belum ada hasil panen — membagi dengan nol bukan impas
 */
export function titikImpas(biaya, totalKg) {
  if (!(biaya > 0) || !(totalKg > 0)) return null;
  const hasil = biaya / totalKg;
  return Number.isFinite(hasil) ? hasil : null;
}

/**
 * Harga yang benar-benar diterima: uang yang benar-benar masuk ÷ kilogram yang
 * benar-benar dipanen.
 *
 * Satu-satunya tempat di seluruh permukaan yang boleh menyebut angka ini, karena kedua
 * sisinya milik orang yang sedang membuka layarnya — yang satu di buku kas, yang satu di
 * penanda panen. Tidak ada sumber terbuka yang perlu diminta, dan tidak ada yang dikarang.
 *
 * @returns {number|null} null bila salah satu sisinya belum ada
 */
export function hargaDiterima(uangMasuk, totalKg) {
  if (!(uangMasuk > 0) || !(totalKg > 0)) return null;
  const hasil = uangMasuk / totalKg;
  return Number.isFinite(hasil) ? hasil : null;
}

/**
 * Selisih terhadap pembanding, dinyatakan sebagai RASIO — bukan dua angka berdampingan.
 *
 * Aturan tayang ke-5 menolak menaruh harga yang diterima di sebelah harga eceran: selisih
 * keduanya bukan kerugian siapa pun, karena eceran memuat marjin seluruh rantai. Yang boleh
 * ditayangkan perbandingannya sebagai rasio, dan itu yang dihitung di sini.
 *
 * @returns {number|null} 1 berarti sama; 0,8 berarti 20% di bawah pembandingnya
 */
export function rasioTerhadap(nilai, pembanding) {
  if (!(nilai > 0) || !(pembanding > 0)) return null;
  const hasil = nilai / pembanding;
  return Number.isFinite(hasil) ? hasil : null;
}
