import { O3rElement } from '@o3r/testing/core';
import { expect, test } from '@playwright/test';
import { AppFixtureComponent } from '../../src/app/app.fixture';

test.describe.serial('Sanity test', () => {
  test('Visual comparison for each page', async ({ browserName, page }) => {
    await page.goto(process.env.PLAYWRIGHT_TARGET_URL || 'http://localhost:4200/');
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));

    await test.step('home', async () => {
      await page.waitForURL('**/home');
      await expect(page).toHaveScreenshot([browserName, 'home.png'], {fullPage: true, mask: [page.locator('.visual-testing-ignore')]});
    });

    await test.step('run-app-locally', async () => {
      await appFixture.navigateToRunAppLocally();
      await page.waitForURL('**/run-app-locally');
      await expect(page).toHaveScreenshot([browserName, 'run-app-locally.png'], {fullPage: true, mask: [page.locator('.visual-testing-ignore')]});
    });

    await test.step('configuration', async () => {
      await appFixture.navigateToConfiguration();
      await page.waitForURL('**/configuration');
      await expect(page).toHaveScreenshot([browserName, 'configuration.png'], {fullPage: true, mask: [page.locator('.visual-testing-ignore')]});
    });

    await test.step('localization', async () => {
      await appFixture.navigateToLocalization();
      await page.waitForURL('**/localization');
      await expect(page).toHaveScreenshot([browserName, 'localization.png'], {fullPage: true, mask: [page.locator('.visual-testing-ignore')]});
    });

    await test.step('dynamic-content', async () => {
      await appFixture.navigateToDynamicContent();
      await page.waitForURL('**/dynamic-content');
      await expect(page).toHaveScreenshot([browserName, 'dynamic-content.png'], {fullPage: true, mask: [page.locator('.visual-testing-ignore')]});
    });

    await test.step('rules-engine', async () => {
      await appFixture.navigateToRulesEngine();
      await page.waitForURL('**/rules-engine');
      await expect(page).toHaveScreenshot([browserName, 'rules-engine.png'], {fullPage: true, mask: [page.locator('.visual-testing-ignore')]});
    });

    await test.step('component-replacement', async () => {
      await appFixture.navigateToComponentReplacement();
      await page.waitForURL('**/component-replacement');
      await expect(page).toHaveScreenshot([browserName, 'component-replacement.png'], {fullPage: true, mask: [page.locator('.visual-testing-ignore')]});
    });

    await test.step('design-token', async () => {
      await appFixture.navigateToDesignToken();
      await page.waitForURL('**/design-token');
      await expect(page).toHaveScreenshot([browserName, 'design-token.png'], {fullPage: true, mask: [page.locator('.visual-testing-ignore')]});
    });

    await test.step('sdk-generator', async () => {
      const waitForPetStore = page.waitForResponse('**/petstore3.swagger.io/**');
      await appFixture.navigateToSDKGenerator();
      await page.waitForURL('**/sdk');
      await waitForPetStore;
      await expect(page).toHaveScreenshot([browserName, 'sdk-generator.png'], {fullPage: true, mask: [page.locator('.visual-testing-ignore')]});
    });
  });
});
