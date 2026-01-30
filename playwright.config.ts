import {defineConfig, devices} from '@playwright/test';

const baseURL = 'http://127.0.0.1:3000';

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  reporter: 'list',
  testDir: './tests',
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    stderr: 'pipe',
    stdout: 'pipe',
    timeout: 180_000
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']}
    }
  ]
});
