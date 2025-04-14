import { expect, test } from '@playwright/test';

test.describe('Empty <%= classify(sanityName) %> test', () => {
  test('Empty test', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeAttached();
  });
});
