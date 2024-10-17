import { O3rElement } from '@o3r/testing/core';
import { expect, test } from '@playwright/test';
import { AppFixtureComponent } from '../../src/app/app.fixture';
import { DynamicContentFixtureComponent } from '../../src/app/dynamic-content/dynamic-content.fixture';

test.describe.serial('Test dynamic content page', () => {
  test('Go to dynamic content and play with override button', async ({ page }) => {
    await page.clock.install({ time: new Date('2000-01-01T00:00:00') });
    await page.goto(process.env.PLAYWRIGHT_TARGET_URL || 'http://localhost:4200/');
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));

    await test.step('go to dynamic content', async () => {
      await appFixture.navigateToDynamicContent();
      await page.waitForURL('**/dynamic-content');
    });

    await test.step('override dynamic content', async () => {
      const dynamicContentFixture = new DynamicContentFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
      const overrideButton = (await dynamicContentFixture.getOverrideButton())!;
      const clearOverrideButton = (await dynamicContentFixture.getClearOverrideButton())!;

      await expect(overrideButton.sourceElement.element).toBeEnabled();
      await expect(clearOverrideButton.sourceElement.element).toBeDisabled();

      await overrideButton.click();
      await expect(overrideButton.sourceElement.element).toBeDisabled();
      await expect(clearOverrideButton.sourceElement.element).toBeEnabled();

      await clearOverrideButton.click();
      await expect(overrideButton.sourceElement.element).toBeEnabled();
      await expect(clearOverrideButton.sourceElement.element).toBeDisabled();
    });
  });
});
