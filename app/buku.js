/* Buku kas — simpanannya saja, dipisahkan dari layarnya.
 *
 * Dipisahkan karena layar rencana perlu MENULIS ke buku ini. Yang mencatat "pemupukan
 * susulan sudah dikerjakan" di layar rencana lalu mengetik "Pupuk, Rp 250.000" di buku
 * kas sedang mengetik satu kejadian dua kali, dan pengetikan kedua itulah yang paling
 * sering tidak terjadi — bukan karena orang malas, tetapi karena ia menuntut membuka
 * halaman lain dan mengingat angkanya sampai ke sana.
 *
 * Mengimpor `kas.js` langsung tidak bisa: berkas itu menyentuh DOM halamannya sendiri
 * begitu dimuat. Jadi yang dipindahkan ke sini simpanannya, dan `kas.js` ikut memakainya
 * — satu sumber, bukan dua salinan yang lambat laun berselisih.
 *
 * MUSIM TIDAK LAGI DI SINI. Ia pindah ke `musim.js` karena tiga layar memerlukannya,
 * bukan satu. Bersamanya ikut SELURUH pemindahan bentuk lama — termasuk pemindahan
 * catatan, yang sebelumnya dikerjakan berkas ini sendiri.
 *
 * Dikerjakan di satu tempat karena dikerjakan di dua tempat sudah terbukti menghilangkan
 * data: modul dievaluasi menurut urutan impornya, dan di layar yang mengimpor berkas ini
 * lebih dulu, ia menulis ulang `op:kas` tanpa medan `musim` sebelum `musim.js` sempat
 * membacanya. Impor `musim.js` di bawah karena itu BUKAN hiasan — ia yang menjamin
 * pemindahan sudah selesai sebelum baris pertama berkas ini membaca simpanan.
 */
import './musim.js';

/* Kategori yang sama dengan D3 dan dengan layar rencana, dan itu disengaja. Yang sudah
 * menyusun rencana anggaran di sana tidak memulai dari buku kosong di sini — ia mengisi
 * kategori yang sudah ia kenali. */
export const KATEGORI_KELUAR = [
  'Benih atau bibit', 'Pupuk', 'Pestisida', 'Tenaga kerja — olah tanah',
  'Tenaga kerja — tanam', 'Tenaga kerja — pemeliharaan', 'Tenaga kerja — panen',
  'Sewa lahan', 'Sewa alat', 'Mulsa & ajir', 'Pengairan', 'Angkut & kemas', 'Lainnya',
];
export const KATEGORI_MASUK = ['Hasil jual', 'Hasil jual — sortiran', 'Bantuan atau subsidi', 'Lainnya'];

const KUNCI = 'op:kas';

let catatan = [];
let hidup = true;
export const simpananHidup = () => hidup;

function baca() {
  try {
    const m = JSON.parse(localStorage.getItem(KUNCI) ?? 'null');
    // Sesudah `musim.js` bentuknya selalu { catatan }. Dua bentuk lama tetap dibaca kalau
    // pemindahan gagal — mode privat menolak menulis, dan gagal menulis tidak boleh
    // berarti gagal membaca.
    if (Array.isArray(m)) return m.map((c) => ({ ...c, m: c.m ?? 'm0' }));
    if (m && Array.isArray(m.catatan)) return m.catatan;
    return [];
  } catch { hidup = false; return []; }
}

export function tulis() {
  try {
    localStorage.setItem(KUNCI, JSON.stringify({ catatan }));
    return true;
  } catch { hidup = false; return false; }
}

catatan = baca();

export const semua = () => catatan;
export const perMusim = (id) => catatan.filter((c) => c.m === id);

export function tambah(isi) {
  const baru = {
    i: Date.now(),
    m: isi.m,
    t: isi.t,
    a: isi.a,
    k: isi.k,
    n: isi.n,
    ...(isi.c ? { c: isi.c } : {}),
    ...(isi.s ? { s: isi.s } : {}),
    ...(isi.l ? { l: isi.l } : {}),
  };
  catatan.push(baru);
  return { baru, tersimpan: tulis() };
}

export function hapus(i) {
  const n0 = catatan.length;
  catatan = catatan.filter((c) => String(c.i) !== String(i));
  if (catatan.length === n0) return false;
  tulis();
  return true;
}

/* Dipakai layar rencana. Satu langkah realisasi menimbulkan PALING BANYAK satu catatan
 * biaya; kalau langkahnya dicatat ulang, yang lama harus hilang. Tanpa ini, mengoreksi
 * tanggal satu langkah menggandakan biayanya di buku — dan penggandaan senyap di buku kas
 * lebih buruk daripada angka yang hilang, karena ia tidak terlihat sampai totalnya dipakai. */
export const cariTaut = (musimId, langkah) =>
  catatan.find((c) => c.m === musimId && c.s === 'rencana' && c.l === langkah) ?? null;

export function hapusTaut(musimId, langkah) {
  const n0 = catatan.length;
  catatan = catatan.filter((c) => !(c.m === musimId && c.s === 'rencana' && c.l === langkah));
  if (catatan.length === n0) return false;
  tulis();
  return true;
}

export function hitung(musimId) {
  const isi = perMusim(musimId);
  const keluar = isi.filter((c) => c.a === 'keluar').reduce((a, c) => a + Number(c.n || 0), 0);
  const masuk = isi.filter((c) => c.a === 'masuk').reduce((a, c) => a + Number(c.n || 0), 0);
  return { keluar, masuk, selisih: masuk - keluar, cacah: isi.length };
}
