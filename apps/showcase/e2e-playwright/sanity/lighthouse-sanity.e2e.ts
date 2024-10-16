import { O3rElement } from '@o3r/testing/core';
import { type Page, test } from '@playwright/test';
import { AppFixtureComponent } from '../../src/app/app.fixture';

async function performAudit(name: string, page: Page) {
  const { playAudit } = await import('playwright-lighthouse');
  await playAudit({
    page,
    thresholds: {
      performance: 50,
      accessibility: 100,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'best-practices': 90
    },
    reports: {
      formats: {
        html: true
      },
      directory: 'playwright-reports/lighthouse',
      name: name
    },
    port: 9222
  });
}

const baseUrl = process.env.PLAYWRIGHT_TARGET_URL || 'http://localhost:4200/';

test.describe('Lighthouse tests', () => {
  test('home', async ({context}) => {
    const page = await context.newPage();
    await page.goto(baseUrl);
    await performAudit('home', page);
    await page.close();
  });

  test('run-app-locally', async ({context}) => {
    const page = await context.newPage();
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToRunAppLocally();
    await page.waitForURL('**/run-app-locally');
    await performAudit('run-app-locally', page);
    await page.close();
  });

  test('configuration', async ({context}) => {
    const page = await context.newPage();
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToConfiguration();
    await page.waitForURL('**/configuration');
    await performAudit('configuration', page);
    await page.close();
  });

  test('localization', async ({context}) => {
    const page = await context.newPage();
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToLocalization();
    await page.waitForURL('**/localization');
    await performAudit('localization', page);
    await page.close();
  });

  test('dynamic-content', async ({context}) => {
    const page = await context.newPage();
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToDynamicContent();
    await page.waitForURL('**/dynamic-content');
    await performAudit('dynamic-content', page);
    await page.close();
  });

  test('rules-engine', async ({context}) => {
    const page = await context.newPage();
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToRulesEngine();
    await page.waitForURL('**/rules-engine');
    await performAudit('rules-engine', page);
    await page.close();
  });

  test('component-replacement', async ({context}) => {
    const page = await context.newPage();
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToComponentReplacement();
    await page.waitForURL('**/component-replacement');
    await performAudit('component-replacement', page);
    await page.close();
  });

  test('design-token', async ({context}) => {
    const page = await context.newPage();
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToDesignToken();
    await page.waitForURL('**/design-token');
    await performAudit('design-token', page);
    await page.close();
  });

  test('sdk-generator', async ({context}) => {
    const page = await context.newPage();
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToSDKGenerator();
    await page.waitForURL('**/sdk');
    await performAudit('sdk-generator', page);
    await page.close();
  });

  test('placeholder', async ({context}) => {
    const page = await context.newPage();
    await page.goto(baseUrl);
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
    await appFixture.navigateToPlaceholder();
    await page.waitForURL('**/placeholder');
    await performAudit('placeholder', page);
    await page.close();
  });
});
