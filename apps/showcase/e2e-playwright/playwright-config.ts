import * as path from 'node:path';
import {
  adjustPath,
} from '@o3r/testing/tools/path-replacement';
import {
  defineConfig,
} from '@playwright/test';

adjustPath('playwright');

const reportsFolder = path.join(__dirname, '..', 'playwright-reports');

const config = defineConfig({
  testDir: path.join(__dirname, '..', 'e2e-playwright'),
  testMatch: /.*\.e2e-playwright-spec.ts$/,
  snapshotPathTemplate: '{testDir}/screenshots/{testFilePath}/{arg}{ext}',
  reporter: [
    ['list'],
    [require.resolve('@o3r/testing/visual-testing-reporter')],
    ['junit', { outputFile: path.join(reportsFolder, 'junit', 'reporter.xml') }],
    ['html', { open: 'never', outputFolder: path.join(reportsFolder, 'html') }]
  ],
  retries: process.env.CI ? 3 : 0,
  forbidOnly: !!process.env.CI,
  navigationTimeout: 10_000,
  timeout: 60_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_TARGET_URL || 'http://localhost:4200/',
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    ...process.env.USE_MOCKS
      ? {
        launchOptions: {
          proxy: { server: 'http://localhost:4747' },
          args: ['--remote-debugging-port=9222', '--ignore-certificate-errors']
        },
        proxy: { server: 'http://localhost:4747' },
        serviceWorkers: 'block',
        ignoreHTTPSErrors: true
      }
      : {
        launchOptions: { args: ['--remote-debugging-port=9222'] }
      }
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0
    }
  },
  projects: [
    { name: 'Chromium', use: { browserName: 'chromium', channel: 'chromium' } }
  ],
  webServer: [
    ...process.env.USE_MOCKS
      ? [{
        command: `yarn kassette -c ${path.join(__dirname, 'kassette.config.js')}`,
        cwd: path.join(__dirname, '..'),
        port: 4747,
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI
      }]
      : []
  ]
});

export default config;
