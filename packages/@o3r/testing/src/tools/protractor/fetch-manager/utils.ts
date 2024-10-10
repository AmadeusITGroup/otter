import * as fs from 'node:fs';
import * as path from 'node:path';
import { browser } from 'protractor';

/**
 * This function waits for all fetchs calls to be resolved and the page to be stable to resolve the promise.
 * It permits to easily run synchronous e2e tests on a flow that uses fetchs calls with protractor.
 * This is very useful in the case of Otter calls to backend because protractor synchronization manager do not care
 * about fetchs calls.
 *
 * This function needs the FetchManager to have been initialized and injected in the browser at the beginning of the
 * flow with `initFetchManager()`
 *
 * You can ignore the waiting of fetchs by setting `browser.ignoreSynchronization` to `true`
 */
export async function waitForOtterStable() {
  await browser.waitForAngular();
  if (!browser.ignoreSynchronization) {
    await browser.executeAsyncScript(
      'window.fetchManager.getInstance().waitForFetchs(arguments[arguments.length - 1]);');
    await browser.waitForAngular();
  }
}

/**
 * This function initiliaze the FetchManager. Set `window.fetch` variable with a custom behaviour in order to count the
 * fetch calls.
 */
export async function initFetchManager() {
  const fetchManager = fs.readFileSync(
    path.resolve(
      process.cwd(), 'node_modules', '@o3r', 'testing', 'tools', 'protractor', 'fetch-manager',
      '_fetch-manager.js'),
    {encoding: 'utf8'});
  await browser.executeScript(fetchManager);
  await browser.executeScript('window.fetchManager.getInstance().init();');
}

/**
 * This function stops the FetchManager. Reset `window.fetch` variable with its native behaviour.
 */
export async function stopFetchManager() {
  await browser.executeScript('window.fetchManager.getInstance().stop();');
}
