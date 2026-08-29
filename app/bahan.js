/* Layar bahan aktif — dibuka dari jalur 2 kalau yang dicari ternyata nama bahan,
 * bukan nama merek.
 *
 * Yang dijawab layar ini: merek apa saja yang memuat bahan ini, dan pada kadar
 * berapa. Yang TIDAK dijawabnya: mana yang sebaiknya dipakai. Dosis tidak pernah
 * ditempel ke bahan — ia milik pendaftaran tiap produk, dan dua produk berbahan
 * serta berkadar identik bisa membawa dosis terdaftar yang berbeda.
 *
 * Kadar bukan hiasan judul. Satu entitas "Abamektin" dipakai pada 33 kadar berbeda
 * di registri; meratakan semuanya jadi satu daftar merek menyiratkan semuanya bisa
 * saling menggantikan, dan itu tidak benar. Kesetaraan hanya berlaku pada pasangan
 * bahan + kadar, jadi kartunya memang dipecah di situ.
 */

import { ambil, teks, HTML_KEMBALI, namaPemegang, petakKemasan } from './pustaka.js';

const angkaId = (n) => Number(n).toLocaleString('id-ID');

// Bentuknya sengaja sama persis dengan kartu bahan di jalur 1 — kelas yang sama,
// perilaku buka-tutup yang sama. Keduanya menyatakan hal yang sama (satu pasangan
// bahan+kadar, sekian merek di baliknya); memberinya dua rupa membuat orang mengira
// keduanya dua hal yang berbeda.
function kartuKadar(k, i, lanjutan = false) {
  const jumlah = Array.isArray(k.m) ? k.m.length : (k.merek ?? 0);
  return `
    <div class="kartu bahan"${lanjutan ? ' data-kadar-lanjutan hidden' : ''}>
      <button type="button" class="bahan-kepala" data-buka="${i}" aria-expanded="false"
              aria-controls="bahan-${i}">
        <span class="bahan-nama">${teks(k.k)}</span>
        <span class="bahan-jumlah">${angkaId(jumlah)} merek</span>
      </button>
      <div class="bahan-isi" id="bahan-${i}" hidden></div>
    </div>`;
}

export function tabelMerek(merek) {
  if (!merek?.length) return '<p class="kosong">Tidak ada merek pada kadar ini.</p>';
  return `
    <p class="catatan">
      Diurutkan menurut <strong>nomor pendaftaran menaik</strong> — tanpa peringkat,
      tanpa slot berbayar. Nomornya sendiri tidak muat di tabel ini; ia ada di layar
      tiap merek, satu ketukan dari sini, jadi urutannya tetap bisa diperiksa.
      Kolom terakhir menyebut bahan <em>lain</em> di dalamnya: isi yang sama pada kadar
      ini belum tentu berarti produknya sama.
    </p>
    <div class="pembungkus-tabel">
      <table>
        <thead><tr><th>Merek</th><th>Pemegang pendaftaran</th><th>Bahan lain di dalamnya</th></tr></thead>
        <tbody>
          ${merek.map((m) => `
            <tr>
              <td>
                <button type="button" class="tautan merek-tautan" data-id="${teks(m.i)}" data-pecahan="${teks(m.p)}">
                  ${petakKemasan(m.g)}<span class="merek-nama">${teks(m.n)}</span>
                </button>
              </td>
              <td>${namaPemegang(m.k, m.pk)}</td>
              <td>${m.f ? teks(m.f.replace(/^\+\s*/, '')) : '<span class="kosong">bahan tunggal</span>'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="catatan">
      <strong>Gambar kemasan bukan bukti apa pun tentang barang di tangan</strong> —
      desainnya berubah, dan pemalsu menyalin desain; yang dibandingkan sebaiknya
      kandungan yang tercetak. Petak bergaris putus-putus berarti gambarnya belum
      dipanen dari situs pemegang pendaftarannya, <em>bukan</em> berarti produknya
      meragukan.
    </p>`;
}

export function layarBahan(id, b) {
  const awal = 8;
  const sisa = Math.max(0, b.kadar.length - awal);
  return `
    <div class="kartu">
      <h2>${teks(b.n)}<span class="lencana">Bahan aktif</span></h2>
      <p>
        Tercatat pada <strong>${angkaId(b.produk)} produk pestisida terdaftar</strong>,
        tersebar di <strong>${angkaId(b.kadar.length)} kadar</strong> yang berbeda.
      </p>
      <p class="catatan">
        Kadar yang berbeda bukan produk yang sama dengan kemasan berbeda. Yang setara
        hanya yang sekadar sama bahan <em>dan</em> sama kadarnya — itulah kenapa
        daftarnya dipecah per kadar di bawah, bukan disatukan.
      </p>
    </div>

    ${b.larangan ? `
    <div class="kartu tabrakan">
      <h2>Bahan ini tercantum di daftar larangan</h2>
      <p>
        Larangannya berlingkup — untuk bidang penggunaan atau komoditas tertentu, bukan
        larangan telanjang. Lingkup dan pasalnya tampil pada layar tiap produk yang
        memuatnya, karena di situlah keterangannya menentukan.
      </p>
    </div>` : ''}

    <div class="kartu">
      <h2>Dosis tidak ada di layar ini</h2>
      <p>
        Dosis milik pendaftaran tiap produk, bukan milik bahannya. Dua produk dengan
        bahan dan kadar yang identik bisa punya dosis terdaftar yang berbeda, dan bisa
        terdaftar untuk tanaman yang berbeda. Buka mereknya untuk melihat dosis yang
        memang tercatat untuknya.
      </p>
    </div>

    <section class="kelompok-kadar" aria-labelledby="judulKadar">
      <h2 id="judulKadar">Kadar yang tercatat</h2>
      <p class="catatan">
        ${angkaId(Math.min(awal, b.kadar.length))} dari ${angkaId(b.kadar.length)} kadar
        ditampilkan lebih dulu. Buka satu kadar untuk melihat mereknya.
      </p>
      ${b.kadar.map((k, i) => kartuKadar(k, i, i >= awal)).join('')}
      ${sisa ? `<button type="button" class="kembali tampil-semua-kadar"
                       data-buka-semua-kadar aria-expanded="false">
        Tampilkan ${angkaId(sisa)} kadar lainnya
      </button>` : ''}
    </section>
    ${HTML_KEMBALI}`;
}

/** Dipanggil saat satu kartu kadar dibuka. Daftar merek bahan terpadat dikeluarkan
 *  ke berkas sendiri; kartu yang lain membawanya langsung. Penyaji cukup memeriksa
 *  satu medan. */
export async function merekKadar(k) {
  if (Array.isArray(k.m)) return k.m;
  return (await ambil(k.merekDi))[k.k] ?? [];
}
