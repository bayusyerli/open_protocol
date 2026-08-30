import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const HALAMAN = [
  'index.html', 'tanaman.html', 'produk.html', 'harga-pupuk.html', 'varietas.html',
  'pupuk-sendiri.html', 'pengendali-sendiri.html', 'takaran.html', 'usaha.html',
  'rencana.html', 'kas.html', 'harga.html', 'perusahaan.html', 'toko.html', 'peranti.html',
];

const VIEWPORT = [
  { nama: 'ponsel', width: 390, height: 844 },
  { nama: 'desktop', width: 1280, height: 720 },
];

async function siap(page, halaman) {
  await page.goto(`/app/${halaman}`, { waitUntil: 'load' });
  const tanpaJs = page.locator('#tanpaJs');
  if (await tanpaJs.count()) await expect(tanpaJs).toHaveCount(0);
  await expect(page.locator('main')).toBeVisible();
  await page.waitForTimeout(120);
}

async function periksaAxe(page) {
  const hasil = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(hasil.violations, hasil.violations.map((v) => `${v.id}: ${v.help}`).join('\n')).toEqual([]);
}

for (const ukuran of VIEWPORT) {
  test.describe(ukuran.nama, () => {
    test.use({ viewport: { width: ukuran.width, height: ukuran.height } });

    for (const halaman of HALAMAN) {
      test(`${halaman}: tidak meluber, semantik bernama, dan lolos axe`, async ({ page }) => {
        await siap(page, halaman);

        const geometri = await page.evaluate(() => ({
          lebar: document.documentElement.clientWidth,
          isi: document.documentElement.scrollWidth,
          h1: document.querySelectorAll('h1').length,
          tombolTanpaNama: [...document.querySelectorAll('button, summary')]
            .filter((el) => el.getClientRects().length && !(el.getAttribute('aria-label') || el.textContent.trim()))
            .length,
        }));
        expect(geometri.isi).toBeLessThanOrEqual(geometri.lebar + 1);
        expect(geometri.h1).toBe(1);
        expect(geometri.tombolTanpaNama).toBe(0);

        await periksaAxe(page);
      });
    }
  });
}

test.describe('interaksi keyboard dan keadaan dinamis', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('pemilih tugas produk bekerja dengan keyboard dan hanya menampilkan satu alat', async ({ page }) => {
    await siap(page, 'produk.html');
    const kandungan = page.getByRole('button', { name: /Periksa angka kandungan/ });
    await kandungan.focus();
    await page.keyboard.press('Space');
    await expect(kandungan).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#jalurKandungan')).toBeVisible();
    await expect(page.locator('#jalurNama')).toBeHidden();
    await expect(kandungan).toBeFocused();
    await periksaAxe(page);
  });

  test('daftar harga membuka sisanya dengan Enter dan memindahkan fokus', async ({ page }) => {
    await siap(page, 'harga.html');
    const lanjut = page.getByRole('button', { name: /komoditas berangka lainnya/ });
    await expect(lanjut).toBeVisible();
    await lanjut.focus();
    await page.keyboard.press('Enter');
    await expect(lanjut).toHaveCount(0);
    await expect(page.locator('.daftar-harga').first().locator('li')).toHaveCount(38);
    await expect(page.locator('.daftar-harga').first().locator('li').nth(12).locator('a')).toBeFocused();
  });

  test('bahan aktif membuka kadar lanjutan tanpa menambah panjang awal', async ({ page }) => {
    await page.goto('/app/produk.html?id=op%3Asub%3A00000007&pecahan=bahan%2F000&q=Abamektin');
    await expect(page.locator('#rincian .kelompok-kadar')).toBeVisible();
    await expect(page.locator('[data-kadar-lanjutan]:visible')).toHaveCount(0);
    const lanjut = page.getByRole('button', { name: /kadar lainnya/ });
    await lanjut.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-kadar-lanjutan]:visible')).toHaveCount(25);
    await periksaAxe(page);
  });

  test('tabel Peranti tetap di dalam viewport dan dapat difokuskan', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('op.ukur.v1', JSON.stringify({
      v: 1,
      hari: { '2026-08-26': { 1: { buka: 1, isi: 1 } } },
      ms: { 1: [120] },
      lubang: {},
    })));
    await siap(page, 'peranti.html');
    const wilayah = page.getByRole('region', { name: 'Ringkasan penggunaan per jalur' });
    await expect(wilayah).toBeVisible();
    await wilayah.focus();
    await expect(wilayah).toBeFocused();
    const geometri = await page.evaluate(() => ({
      lebar: document.documentElement.clientWidth,
      isi: document.documentElement.scrollWidth,
    }));
    expect(geometri.isi).toBeLessThanOrEqual(geometri.lebar + 1);
  });

  /* MEMBUKA halaman tidak sama dengan MENJAWAB, dan selisih itu sudah dua kali tayang.
   *
   * Suite ini memuat kelima belas halaman dan memeriksa axe, geometri, dan penamaan —
   * dan lolos hijau selama dua hari ketika jalur 1 sebenarnya mati: yang tergambar di
   * tempat pemilih gejala adalah kartu galat yang sepenuhnya aksesibel. Satu <h1>, tidak
   * meluber, nol pelanggaran. Kedua kalinya lebih dalam: daftarnya tergambar tetapi tiap
   * ketukan kartu melempar, karena `bukaOpt()` membaca medan yang baru ada sesudah berkas
   * rinci dilebur — dan lemparannya di luar `try`, jadi tidak ada yang menangkapnya.
   *
   * Jadi dua uji ini menegaskan HASIL, bukan ketiadaan galat: daftarnya berisi, dan satu
   * pintu benar-benar menjawab dengan blok "pastikan dulu" — bagian yang membuat jalur ini
   * jalur pemastian, bukan tebakan. Keduanya lewat jalan masuk yang berbeda, karena
   * keduanya pernah rusak sendiri-sendiri. */
  test('jalur 1 menjawab: daftar gejala berisi, dan satu pintu terbuka saat diketuk', async ({ page }) => {
    await siap(page, 'tanaman.html');
    const kartu = page.locator('#gejala ul.daftar li button[data-opt]');
    await expect(kartu.first()).toBeVisible();
    expect(await kartu.count()).toBeGreaterThan(0);
    await kartu.first().click();
    await expect(page.locator('#hasil')).toContainText('Pastikan dulu');
  });

  test('pintu gejala terbuka juga lewat tautan langsung', async ({ page }) => {
    // Idnya diambil dari daftarnya sendiri, bukan diketik: uji yang menyebut satu id
    // akan merah karena kurasinya bergerak, bukan karena jalurnya rusak.
    await siap(page, 'tanaman.html');
    const id = await page.locator('#gejala button[data-opt]').first().getAttribute('data-opt');
    await page.goto(`/app/tanaman.html?opt=${encodeURIComponent(id)}`, { waitUntil: 'load' });
    await expect(page.locator('#hasil')).toContainText('Pastikan dulu');
  });
});
