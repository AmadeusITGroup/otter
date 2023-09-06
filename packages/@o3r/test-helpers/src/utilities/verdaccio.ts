import { execSync } from 'node:child_process';
import * as path from 'node:path';
import pidFromPort from 'pid-from-port';

/**
 * Set up a local npm registry inside a docker image before the tests.
 * Publish all the packages of the Otter monorepo on it.
 * Can be accessed during the tests with url http://127.0.0.1:4873
 */
export function setupLocalRegistry() {
  let shouldHandleVerdaccio = false;
  const rootFolder = path.join(__dirname, '..', '..', '..', '..');

  beforeAll(async () => {
    try {
      await pidFromPort(4873);
    } catch (ex) {
      shouldHandleVerdaccio = true;
      execSync('yarn verdaccio:start', {cwd: rootFolder, stdio: 'inherit'});
      execSync('yarn verdaccio:publish', {cwd: rootFolder, stdio: 'inherit'});
    }
  });

  afterAll(() => {
    if (shouldHandleVerdaccio) {
      execSync('yarn verdaccio:stop', {cwd: rootFolder, stdio: 'inherit'});
    }
  });
}
