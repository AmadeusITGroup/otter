import {
  execFileSync,
  execSync,
  type ExecSyncOptions,
} from 'node:child_process';
import {
  existsSync,
  promises,
} from 'node:fs';
import {
  join,
} from 'node:path';
import pidFromPort from 'pid-from-port';
import {
  packageManagerPublish,
} from './package-manager';

/**
 * Set up a local npm registry inside a docker image before the tests.
 * Publish all the packages of the Otter monorepo on it.
 * Can be accessed during the tests with url http://127.0.0.1:4873
 */
export function setupLocalRegistry() {
  let shouldHandleVerdaccio = false;
  const rootFolder = join(__dirname, '..', '..', '..', '..');

  beforeAll(async () => {
    try {
      await pidFromPort(4873);
    } catch {
      shouldHandleVerdaccio = true;
      execSync('yarn verdaccio:start', { cwd: rootFolder, stdio: 'inherit' });
      execSync('yarn verdaccio:publish', { cwd: rootFolder, stdio: 'inherit' });
    }
  });

  afterAll(() => {
    if (shouldHandleVerdaccio) {
      execSync('yarn verdaccio:stop', { cwd: rootFolder, stdio: 'inherit' });
    }
  });
}

/**
 * Publish the package in working directory (or options.cwd) to Verdaccio
 * @param options
 */
export async function publishToVerdaccio(options: ExecSyncOptions) {
  const registry = 'http://127.0.0.1:4873';
  const npmrcLoggedTarget = join(options.cwd?.toString() || process.cwd(), '.npmrc-logged');
  const npmrcLoggedSource = join(__dirname, '..', '..', '..', '..', '..', '.verdaccio', 'conf', '.npmrc-logged');
  // Try to reuse the authentication at repository level
  if (existsSync(npmrcLoggedSource)) {
    await promises.copyFile(npmrcLoggedSource, npmrcLoggedTarget);
  } else {
    // Create a new authentication at project level
    if (!existsSync(npmrcLoggedTarget)) {
      await promises.writeFile(npmrcLoggedTarget, `registry=${registry}/`);
    }
    execFileSync('npx', [
      '--yes',
      'npm-cli-login',
      '-u', 'verdaccio',
      '-p', 'verdaccio',
      '-e', 'test@test.com',
      '-r', registry,
      '--config-path', npmrcLoggedTarget
    ], { ...options, shell: true });
  }
  packageManagerPublish([
    '--registry', registry,
    '--userconfig', npmrcLoggedTarget,
    '--no-workspaces'
  ], options);
  return true;
}
