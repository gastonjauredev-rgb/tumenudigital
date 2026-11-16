import { defineConfig } from '@playwright/test';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
export default defineConfig({
  testDir: './tests/browser', fullyParallel: false, workers: 1,
  use: { baseURL: 'http://127.0.0.1:5173', channel: 'chrome', headless: true, trace: 'retain-on-failure' },
  webServer: { command: `${npm} run dev -- --port 5173 --strictPort`, url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI },
});
