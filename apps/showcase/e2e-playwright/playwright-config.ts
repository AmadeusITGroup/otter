import { adjustPath } from '@o3r/testing/tools/path-replacement';
import { defineConfig } from '@playwright/test';
import * as path from 'node:path';

adjustPath('playwright');

const reportsFolder = path.join(__dirname, '..', 'playwright-reports');

const config = defineConfig({
  testDir: path.join(__dirname, '..', 'e2e-playwright'),
  testMatch: /.*\.e2e-playwright-spec.ts$/,
  snapshotPathTemplate: '{testDir}/screenshots/{testFilePath}/{arg}{ext}',
  reporter: [
    ['list'],
    ['junit', {outputFile: path.join(reportsFolder, 'junit', 'reporter.xml')}],
    ['html', {open: 'never', outputFolder: path.join(reportsFolder, 'html')}]
  ],
  retries: process.env.CI ? 3 : 0,
  forbidOnly: !!process.env.CI,
  navigationTimeout: 10000,
  timeout: 60000,
  use: {
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    ...process.env.USE_MOCKS ? {
      launchOptions: { proxy: {server: 'per-context'}, args: ['--remote-debugging-port=9222']},
      proxy: {server: 'http://localhost:4200'},
      serviceWorkers: 'block',
      ignoreHTTPSErrors: true
    } : {
      launchOptions: { args: ['--remote-debugging-port=9222']}
    }
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0
    }
  },
  projects: [
    {name: 'Chromium', use: {browserName: 'chromium'}}
  ],
  webServer: [
    ...process.env.USE_MOCKS ? [{
      command: `yarn kassette -c ${path.join(__dirname, 'kassette.config.js')}`,
      cwd: path.join(__dirname, '..'),
      port: 4200,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI
    }] : []
  ]
});

export default config;
