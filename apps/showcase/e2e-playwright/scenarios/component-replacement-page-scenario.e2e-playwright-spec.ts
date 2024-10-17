import { O3rElement } from '@o3r/testing/core';
import { expect, test } from '@playwright/test';
import { AppFixtureComponent } from '../../src/app/app.fixture';
import { ComponentReplacementPresFixtureComponent } from '../../src/components/showcase/component-replacement/component-replacement-pres.fixture';

test.describe.serial('Test component replacement page', () => {
  test('Go to component replacement and play with date input', async ({ page }) => {
    await page.clock.install({ time: new Date('2000-01-01T00:00:00') });
    await page.goto(process.env.PLAYWRIGHT_TARGET_URL || 'http://localhost:4200/');
    const appFixture = new AppFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));

    await test.step('go to component replacement', async () => {
      await appFixture.navigateToComponentReplacement();
      await page.waitForURL('**/component-replacement');
    });

    await test.step('change date', async () => {
      const componentReplacementPresFixture = new ComponentReplacementPresFixtureComponent(new O3rElement({element: page.locator('app-root'), page}));
      const dateField = (await componentReplacementPresFixture.getDate())!;
      const dateInputField = (await componentReplacementPresFixture.getDateInput())!;

      expect(await dateField.getText()).toMatch(/\d{4,}-\d{1,2}-\d{1,2}/);
      expect(await dateInputField.getValue()).toMatch(/\d{4,}-\d{1,2}-\d{1,2}/);

      await dateInputField.setValue('5782-06-01');
      expect(await dateField.getText()).toBe('2022-2-2');
    });
  });
});
