import { O3rElement } from '@o3r/testing/core';
import { type Page, test, type TestInfo } from '@playwright/test';
import { type playwrightLighthouseConfig } from 'playwright-lighthouse';
import { AppFixtureComponent } from '../../src/app/app.fixture';

const baseUrl = process.env.PLAYWRIGHT_TARGET_URL || 'http://localhost:4200/';
const lighthouseConfig: playwrightLighthouseConfig = {
  thresholds: {
    // Disable performance measurement because it is too unreliable in the current setup
    performance: 0,
    accessibility: 100,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'best-practices': 100
  },
  opts: {
    disableStorageReset: false
  },
  reports: {
    formats: {
      html: true
    },
    directory: 'playwright-reports/lighthouse'
  },
  port: 9222
};

const performAudit = async (name: string, page: Page | string, testInfo: TestInfo) => {
  const { playAudit } = await import('playwright-lighthouse');
  try {
    await playAudit({
      ...lighthouseConfig,
      url: typeof page === 'string' ? page : page.url(),
      reports: {
        ...lighthouseConfig.reports,
        name: name
      }
    });
  } finally {
    await testInfo.attach('lighthouse-report', {path: `${lighthouseConfig.reports.directory}/${name}.html`});
  }
};

/**
 * Lighthouse tests are recommended to not run in parallel to limit variance in performance measurements.
 * @see https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md#run-on-adequate-hardware
 */
test.describe.configure({ mode: 'serial' });

test.describe('Lighthouse tests', () => {
  test('home', async ({page}, testInfo) => {
    await page.goto(baseUrl);
    await performAudit('home', page, testInfo);
  });

  test('run-app-locally', async ({page}, testInfo) => {
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToRunAppLocally();
    await page.waitForURL('**/run-app-locally');
    await performAudit('run-app-locally', page, testInfo);
  });

  test('configuration', async ({page}, testInfo) => {
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToConfiguration();
    await page.waitForURL('**/configuration');
    await performAudit('configuration', page, testInfo);
  });

  test('localization', async ({page}, testInfo) => {
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToLocalization();
    await page.waitForURL('**/localization');
    await performAudit('localization', page, testInfo);
  });

  test('dynamic-content', async ({page}, testInfo) => {
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToDynamicContent();
    await page.waitForURL('**/dynamic-content');
    await performAudit('dynamic-content', page, testInfo);
  });

  test('rules-engine', async ({page}, testInfo) => {
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToRulesEngine();
    await page.waitForURL('**/rules-engine');
    await performAudit('rules-engine', page, testInfo);
  });

  test('component-replacement', async ({page}, testInfo) => {
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToComponentReplacement();
    await page.waitForURL('**/component-replacement');
    await performAudit('component-replacement', page, testInfo);
  });

  test('design-token', async ({page}, testInfo) => {
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToDesignToken();
    await page.waitForURL('**/design-token');
    await performAudit('design-token', page, testInfo);
  });

  test('sdk-generator', async ({page}, testInfo) => {
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToSDKGenerator();
    await page.waitForURL('**/sdk');
    await performAudit('sdk-generator', page, testInfo);
  });

  test('placeholder', async ({page}, testInfo) => {
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToPlaceholder();
    await page.waitForURL('**/placeholder');
    await performAudit('placeholder', page, testInfo);
  });
});
