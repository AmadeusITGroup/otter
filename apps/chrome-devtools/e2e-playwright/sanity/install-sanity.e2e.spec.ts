import {
  expect,
} from '@playwright/test';
import {
  test,
} from '../test-with-extension';

const EXTENSION_ID = 'aejabgendbpckkdnjaphhlifbhepmbne';

test.describe('Install extension to chrome', () => {
  test('Background service worker', ({ extensionServiceWorker, extensionId }) => {
    expect(extensionServiceWorker).toBeDefined();
    expect(extensionId).toBe(EXTENSION_ID);
  });
});
