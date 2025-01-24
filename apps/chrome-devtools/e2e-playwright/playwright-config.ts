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
    ['junit', { outputFile: path.join(reportsFolder, 'junit', 'reporter.xml') }],
    ['html', { open: 'never', outputFolder: path.join(reportsFolder, 'html') }]
  ],
  retries: process.env.CI ? 3 : 0,
  forbidOnly: !!process.env.CI,
  navigationTimeout: 10_000,
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
