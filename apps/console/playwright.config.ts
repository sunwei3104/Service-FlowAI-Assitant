import { defineConfig, devices } from '@playwright/test';

// E2E runs against the app with the mock API (MSW) so it needs no backend.
// When services/api exists, add a project that sets NEXT_PUBLIC_API_MOCKING=disabled.
const PORT = 3001;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'th-TH',
    timezoneId: 'Asia/Bangkok',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: `pnpm dev`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    env: { NEXT_PUBLIC_API_MOCKING: 'enabled', APP_ENV: 'local' },
    timeout: 120_000,
  },
});
