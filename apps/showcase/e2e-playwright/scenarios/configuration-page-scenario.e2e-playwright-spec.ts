import {
  O3rElement
} from '@o3r/testing/core';
import {
  expect,
  test
} from '@playwright/test';
import {
  AppFixtureComponent
} from '../../src/app/app.fixture';
import {
  ConfigurationFixtureComponent
} from '../../src/app/configuration/configuration.fixture';

test.describe.serial('Test configuration page', () => {
  test('Go to configuration and play with override button', async ({ page }) => {
    await page.clock.install({ time: new Date('2000-01-01T00:00:00') });
    await page.goto(process.env.PLAYWRIGHT_TARGET_URL || 'http://localhost:4200/');
    const appFixture = new AppFixtureComponent(new O3rElement({ element: page.locator('app-root'), page }));

    await test.step('go to configuration', async () => {
      await appFixture.navigateToConfiguration();
      await page.waitForURL('**/configuration');
    });

    await test.step('override configuration', async () => {
      const configurationFixture = new ConfigurationFixtureComponent(new O3rElement({ element: page.locator('app-root'), page }));
      const overrideButton = (await configurationFixture.getOverrideButton())!;
      const clearOverrideButton = (await configurationFixture.getClearOverrideButton())!;

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
