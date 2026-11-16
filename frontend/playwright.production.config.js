import { defineConfig } from '@playwright/test';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
export default defineConfig({
  testDir: './tests/production', workers: 1,
  outputDir: './test-results/production',
  use: { baseURL: 'http://127.0.0.1:4173', channel: 'chrome', headless: true, trace: 'retain-on-failure' },
  webServer: { command: `${npm} run preview -- --host 127.0.0.1 --port 4173 --strictPort`, url: 'http://127.0.0.1:4173', reuseExistingServer: false },
});
