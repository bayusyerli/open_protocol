import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './browser',
  fullyParallel: false,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: [['line']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node tools/server-browser.mjs',
    url: 'http://127.0.0.1:4173/app/index.html',
    reuseExistingServer: true,
    timeout: 15_000,
  },
});
