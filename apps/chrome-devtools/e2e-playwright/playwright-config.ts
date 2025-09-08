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
  retries: process.env.CI ? 3 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['list'],
    ['junit', { outputFile: path.join(reportsFolder, 'junit', 'reporter.xml') }],
    ['html', { open: 'never', outputFolder: path.join(reportsFolder, 'html') }]
  ],
  timeout: 60_000,
  use: {
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: {}
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0
    }
  },
  projects: [
    {
      name: 'Chromium',
      use: {
        browserName: 'chromium',
        channel: 'chromium'
      }
    }
  ]
});

export default config;
