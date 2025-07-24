import path from 'node:path';
import {
  test as base,
  type BrowserContext,
  chromium,
  type Worker,
} from '@playwright/test';

const pathToExtension = path.resolve(__dirname, '..', 'dist');

/**
 * Extends playwright test to add extension access
 */
export const test = base.extend<{
  context: BrowserContext;
  extensionServiceWorker: Worker;
  extensionId: string;
}>({
  // eslint-disable-next-line no-empty-pattern -- Required for dependency injection
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ]
    });
    await use(context);
    await context.close();
  },
  extensionServiceWorker: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }
    await use(background);
  },
  extensionId: async ({ extensionServiceWorker }, use) => {
    const extensionId = extensionServiceWorker.url().split('/')[2];
    await use(extensionId);
  }
});
