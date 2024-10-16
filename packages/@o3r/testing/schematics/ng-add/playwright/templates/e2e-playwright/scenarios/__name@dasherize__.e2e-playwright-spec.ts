import { expect, test } from '@playwright/test';
import { BaseScenario } from '../utils';

export class <%= classify(scenarioName) %> extends BaseScenario {
  protected <%= camelize(scenarioName) %>() {
    test.describe.serial('Empty <%= classify(scenarioName) %> tests', () => {
      test('Empty test', async ({ page }) => {
        await page.goto(this.targetUrl);
        await expect(page.locator('body')).toBeAttached();
      });
    });
  }

  /** @inheritDoc */
  public performFlow() {
    this.<%= camelize(scenarioName) %>();
  }
}

new <%= classify(scenarioName) %>().run();
