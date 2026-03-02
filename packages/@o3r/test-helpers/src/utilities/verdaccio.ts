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
import {
  packageManagerPublish,
} from './package-manager';

/**
 * Check if a verdaccio instance is running
 */
export function isVerdaccioInUse(): boolean {
  const verdaccioAddress = 'http://127.0.0.1:4873';
  try {
    // eslint-disable-next-line no-console -- need to inform user about the check
    console.log(`Checking for Verdaccio registry at ${verdaccioAddress}...`);
    execFileSync('npm', ['ping', `--registry=${verdaccioAddress}`], { stdio: 'pipe', shell: true, timeout: 60_000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Set up a local npm registry inside a docker image before the tests.
 * Publish all the packages of the Otter monorepo on it.
 * Can be accessed during the tests with url http://127.0.0.1:4873
 * @deprecated to be removed in v14 -- Not used and probably not working on most cases (ENOENT if docker not installed)
 */
export function setupLocalRegistry() {
  let shouldHandleVerdaccio = false;
  const rootFolder = join(__dirname, '..', '..', '..', '..');

  beforeAll(() => {
    if (!isVerdaccioInUse()) {
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
    '--tag', 'latest',
    '--userconfig', npmrcLoggedTarget,
    '--no-workspaces'
  ], options);
  return true;
}
