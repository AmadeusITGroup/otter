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
  testDir: '.',
  testMatch: /.*\.e2e\.spec\.ts$/,
  snapshotPathTemplate: '{testDir}/screenshots/{testFilePath}/{arg}{ext}',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['list'],
    [require.resolve('@o3r/testing/visual-testing-reporter')],
    ['junit', { outputFile: path.join(reportsFolder, 'junit', 'reporter.xml') }],
    ['html', { open: 'never', outputFolder: path.join(reportsFolder, 'html') }]
  ],
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
        serviceWorkers: 'block'
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
