// Kanonikalisasi JSON dan penghitungan content_hash.
//
// KENAPA BERKAS INI ADA
// L2 sudah menuntut content_hash pada apa pun yang berstatus published sejak awal, dengan
// alasan "versi terbit tidak boleh bisa berubah diam-diam". Tetapi sampai berkas ini,
// TIDAK ADA satu pun definisi tentang apa yang di-hash dan bagaimana. Akibatnya medan itu
// hanya bisa diisi angka yang tidak berarti — dan memang itu yang terjadi:
// rec-cycle-cabai.json sempat memuat sha256:0000...0000, nol semua.
//
// Hash yang tidak bisa dihitung ulang bukan penjagaan; ia hiasan yang menyerupai
// penjagaan, dan itu lebih buruk daripada tidak ada.
//
// KEPUTUSAN: RFC 8785 (JSON Canonicalization Scheme)
// Dipilih karena ia standar terbitan IETF dengan vektor uji sendiri, bukan aturan buatan
// sendiri yang harus dijelaskan tiap kali ada yang bertanya. Tiga hal yang ditetapkannya
// dan yang membuat hash-nya bisa diulang di bahasa mana pun:
//
//   1. Kunci objek diurutkan menurut satuan kode UTF-16. Array.prototype.sort() bawaan
//      JavaScript melakukan persis itu, jadi tidak perlu pembanding sendiri.
//   2. Angka ditulis dengan aturan Number::toString ECMAScript — yang juga persis yang
//      dilakukan JSON.stringify. Termasuk -0 yang ditulis "0".
//   3. Tanpa spasi sama sekali, dan pelolosan string minimal sesuai RFC 8259.
//
// YANG SENGAJA TIDAK IKUT DI-HASH
// Hash ini menutupi ENTITASNYA, bukan BERKASNYA. Tiga medan berikut adalah pembukuan
// berkas, bukan isi, dan mengikutkannya akan membuat hash berubah karena hal yang tidak
// mengubah arti apa pun:
//
//   $schema              lintasan relatif ke skemanya. Berbeda begitu berkasnya
//                        dipindahkan — dan bundel ekspor memang memindahkannya.
//   id_blocks            klaim rentang nomor untuk kerja paralel. Pembukuan antar-sesi.
//   lifecycle.content_hash  jelas: sebuah hash tidak bisa memuat dirinya sendiri.
//
// Sisanya ikut, termasuk seluruh lifecycle lainnya. Naik dari draft ke published MENGUBAH
// hash-nya, dan itu memang benar: menerbitkan adalah perubahan.

import { createHash } from 'node:crypto';

/** Serialisasi kanonik RFC 8785. */
export function kanonik(v) {
  if (v === null) return 'null';
  const t = typeof v;
  if (t === 'boolean') return v ? 'true' : 'false';
  if (t === 'number') {
    if (!Number.isFinite(v)) throw new Error(`Angka tidak hingga tidak bisa dikanonikalisasi: ${v}`);
    return JSON.stringify(v);
  }
  if (t === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(kanonik).join(',')}]`;
  if (t === 'object') {
    const kunci = Object.keys(v).filter((k) => v[k] !== undefined).sort();
    return `{${kunci.map((k) => `${JSON.stringify(k)}:${kanonik(v[k])}`).join(',')}}`;
  }
  throw new Error(`Tipe tidak bisa dikanonikalisasi: ${t}`);
}

/** Salinan dokumen tanpa medan pembukuan berkas. Lihat catatan di kepala berkas. */
export function isiUntukHash(doc) {
  const { $schema, id_blocks, lifecycle, ...sisa } = doc;
  if (!lifecycle) return sisa;
  const { content_hash, ...sisaLifecycle } = lifecycle;
  return { ...sisa, lifecycle: sisaLifecycle };
}

/** content_hash dokumen, siap ditaruh di lifecycle.content_hash. */
export function hitungHash(doc) {
  return 'sha256:' + createHash('sha256').update(kanonik(isiUntukHash(doc)), 'utf8').digest('hex');
}
