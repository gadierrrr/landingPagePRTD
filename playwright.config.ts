import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1280, height: 800 }
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  },
  projects: [
    { name: 'chromium' }
  ]
});
