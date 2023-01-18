import { expect, test } from '@playwright/test';

test.describe.serial('Empty <%= classify(sanityName) %> test', () => {
  test('Empty test', ({ page }) => {
    expect(page).toBeDefined();
  });
});
