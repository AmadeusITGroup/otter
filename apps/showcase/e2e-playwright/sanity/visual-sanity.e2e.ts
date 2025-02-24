import {
  O3rElement,
} from '@o3r/testing/core';
import {
  expect,
  test,
} from '@playwright/test';
import {
  AppFixtureComponent,
} from '../../src/app/app.fixture';
import {
  TrainingFixtureComponent,
} from '../../src/components/training/training.fixture';

test.describe.serial('Sanity test', () => {
  test('Visual comparison for each page', async ({ browserName, page }) => {
    await page.clock.install({ time: new Date('2000-01-01T00:00:00') });
    await page.goto(process.env.PLAYWRIGHT_TARGET_URL || 'http://localhost:4200/');
    const appFixture = new AppFixtureComponent(new O3rElement({ element: page.locator('app-root'), page }));

    await test.step('home', async () => {
      await page.waitForURL('**/home');
      await expect(page).toHaveScreenshot([browserName, 'home.png'], { fullPage: true, mask: [page.locator('.visual-testing-ignore')] });
    });

    await test.step('run-app-locally', async () => {
      await appFixture.navigateToRunAppLocally();
      await page.waitForURL('**/run-app-locally');
      await expect(page).toHaveScreenshot([browserName, 'run-app-locally.png'], { fullPage: true, mask: [page.locator('.visual-testing-ignore')] });
    });

    await test.step('configuration', async () => {
      await appFixture.navigateToConfiguration();
      await page.waitForURL('**/configuration');
      await expect(page).toHaveScreenshot([browserName, 'configuration.png'], { fullPage: true, mask: [page.locator('.visual-testing-ignore')] });
    });

    await test.step('localization', async () => {
      await appFixture.navigateToLocalization();
      await page.waitForURL('**/localization');
      await expect(page).toHaveScreenshot([browserName, 'localization.png'], { fullPage: true, mask: [page.locator('.visual-testing-ignore')] });
    });

    await test.step('dynamic-content', async () => {
      await appFixture.navigateToDynamicContent();
      await page.waitForURL('**/dynamic-content');
      await expect(page).toHaveScreenshot([browserName, 'dynamic-content.png'], { fullPage: true, mask: [page.locator('.visual-testing-ignore')] });
    });

    await test.step('rules-engine', async () => {
      await appFixture.navigateToRulesEngine();
      await page.waitForURL('**/rules-engine');
      await expect(page).toHaveScreenshot([browserName, 'rules-engine.png'], { fullPage: true, mask: [page.locator('.visual-testing-ignore')] });
    });

    await test.step('component-replacement', async () => {
      await appFixture.navigateToComponentReplacement();
      await page.waitForURL('**/component-replacement');
      await expect(page).toHaveScreenshot([browserName, 'component-replacement.png'], { fullPage: true, mask: [page.locator('.visual-testing-ignore')] });
    });

    await test.step('design-token', async () => {
      await appFixture.navigateToDesignToken();
      await page.waitForURL('**/design-token');
      await expect(page).toHaveScreenshot([browserName, 'design-token.png'], { fullPage: true, mask: [page.locator('.visual-testing-ignore')] });
    });

    await test.step('sdk-generator', async () => {
      const waitForPetStore = page.waitForResponse('**/petstore3.swagger.io/**');
      await appFixture.navigateToSDKGenerator();
      await page.waitForURL('**/sdk');
      await waitForPetStore;
      await expect(page).toHaveScreenshot([browserName, 'sdk-generator.png'], { fullPage: true, mask: [page.locator('.visual-testing-ignore')] });
    });

    await test.step('placeholder', async () => {
      await appFixture.navigateToPlaceholder();
      await page.waitForURL('**/placeholder');
      await expect(page).toHaveScreenshot([browserName, 'placeholder.png'], { fullPage: true, mask: [page.locator('.visual-testing-ignore')] });
    });

    await test.step('sdk-intro', async () => {
      await appFixture.navigateToSDKIntro();
      await page.waitForURL('**/sdk-intro');
      await expect(page).toHaveScreenshot([browserName, 'sdk-intro.png'], { fullPage: true, mask: [page.locator('.visual-testing-ignore')] });
    });

    await test.step('sdk-training', async () => {
      await appFixture.navigateToSDKTraining();
      await page.waitForURL('**/sdk-training*');
      await expect(page).toHaveScreenshot([browserName, 'sdk-training.png'], { fullPage: true, mask: [page.locator('.visual-testing-ignore')] });

      const trainingFixture = new TrainingFixtureComponent(new O3rElement({ element: page.locator('o3r-training'), page }));
      for (let i = 1; i < 10; i++) {
        await trainingFixture.clickOnNextStep();
        await page.waitForURL(`**/sdk-training#${i}`);
        await expect(page).toHaveScreenshot([browserName, `sdk-training-step${i + 1}.png`], { fullPage: true, mask: [page.locator('.visual-testing-ignore')] });
      }
    });
  });
});
