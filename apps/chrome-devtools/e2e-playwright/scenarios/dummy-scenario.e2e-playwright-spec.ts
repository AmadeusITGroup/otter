import {
  expect,
} from '@playwright/test';
import {
  test,
} from '../test-with-extension';

test.describe('Dummy scenario', () => {
  test('Dummy test', () => {
    expect(true).toBe(true);
  });
});
