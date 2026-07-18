import { defineConfig, devices } from '@playwright/test';

/**
 * Dedicated config for the cookie-consent suite: no Supabase fixture globalSetup,
 * since consent state is pure localStorage and needs no backend data.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: 'cookie-consent.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run start -- -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
