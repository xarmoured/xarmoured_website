import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 360000,
  expect: { timeout: 60000 },
  use: { baseURL: 'http://localhost:3000', headless: true, trace: 'retain-on-failure' },
  webServer: {
    command: 'node scripts/e2e-server.mjs',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 240000,
  },
});
