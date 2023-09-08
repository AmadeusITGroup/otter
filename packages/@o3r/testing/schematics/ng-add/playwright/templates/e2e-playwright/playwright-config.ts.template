import { adjustPath } from '@o3r/testing/tools/path-replacement';
import type { PlaywrightTestConfig } from '@playwright/test';
import * as path from 'node:path';

adjustPath('playwright');

const FIVE_MINUTES = 1_000 * 60 * 5;

const reportsFolder = path.join(__dirname, '..', 'playwright-reports');

const config: PlaywrightTestConfig = {
  testDir: path.join(__dirname, '..', 'e2e-playwright'),
  testMatch: /.*\.e2e-playwright-spec.ts$/,
  reporter: [
    ['list'],
    ['junit', {outputFile: path.join(reportsFolder, 'junit', 'reporter.xml')}],
    ['html', {open: 'never', outputFolder: path.join(reportsFolder, 'html')}]
  ],
  retries: process.env.CI ? 3 : 0,
  forbidOnly: !!process.env.CI,
  timeout: FIVE_MINUTES,
  use: {
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    {name: 'Chromium', use: {browserName: 'chromium'}},
    {name: 'Webkit', use: {browserName: 'webkit'}},
    {name: 'Firefox', use: {browserName: 'firefox'}}
  ]
};

export default config;
