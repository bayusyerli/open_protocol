/* A5 — pendaftaran service worker dan kendali simpanan luring.
 *
 * Dipasang lewat tema.js, satu-satunya modul yang diimpor kesebelas halaman. Menyalin
 * satu baris pendaftaran ke sebelas berkas akan mengulang persis kekeliruan yang sudah
 * ditemukan dua kali di permukaan ini: tema yang berhenti di beranda, dan enam salinan
 * penangan tombol kembali. Yang dipakai bersama tinggal di satu tempat.
 *
 * Berkas pekerjanya sendiri, sw.js, ADA DI AKAR REPOSITORI dan bukan di app/ — cakupan
 * service worker ditentukan letak berkasnya, dan indeks tinggal di /spec/indeks/, di
 * luar /app/. Alasannya ditulis panjang di kepala sw.js.
 */

const AKAR = new URL('../', location.href);

export function pasangLuring() {
  if (!('serviceWorker' in navigator)) return;
  // Pendaftaran ditunda sampai muat selesai: ia tidak mendesak, dan mendahului
  // pengambilan indeks di sinyal buruk akan memperlambat justru yang paling dinanti.
  addEventListener('load', () => {
    navigator.serviceWorker.register(new URL('sw.js', AKAR), { scope: AKAR.pathname })
      .catch(() => { /* http tanpa TLS di luar localhost, mode privat, atau ditolak
                        kebijakan. Permukaan tetap jalan penuh tanpa luring. */ });
  });
}

// ---------------------------------------------------------------------------
// Kendali — dipakai ukur.html
// ---------------------------------------------------------------------------

const siap = () => navigator.serviceWorker?.ready;

/** Kirim satu perintah, lalu dengarkan kabarnya sampai selesai atau gagal. */
export async function perintah(jenis, saatKabar) {
  const reg = await siap();
  const sw = reg?.active;
  if (!sw) throw new Error('Penyimpan luring belum aktif di peranti ini.');
  return new Promise((selesai, tolak) => {
    const dengar = (ev) => {
      const d = ev.data ?? {};
      saatKabar?.(d);
      if (d.jenis === 'selesai' || d.jenis === 'terbuang' || d.jenis === 'ukuran') {
        navigator.serviceWorker.removeEventListener('message', dengar);
        selesai(d);
      }
      if (d.jenis === 'gagal') {
        navigator.serviceWorker.removeEventListener('message', dengar);
        tolak(new Error(d.pesan ?? 'gagal'));
      }
    };
    navigator.serviceWorker.addEventListener('message', dengar);
    sw.postMessage({ jenis });
  });
}

export const luringAktif = () => !!navigator.serviceWorker?.controller;
