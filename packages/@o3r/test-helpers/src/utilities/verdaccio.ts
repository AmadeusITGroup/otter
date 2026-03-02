import {
  execFileSync,
  type ExecFileSyncOptions,
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
 * On Windows, use cmd.exe to find .cmd files in PATH:
 * - /d prevents cmd.exe from executing AutoRun commands which can interfere with the output parsing
 * - /s prevents cmd.exe from stripping quotes which are needed for arguments with spaces
 * - /c makes cmd.exe run the command and exit
 *
 * On other platforms, call the command directly without a shell.
 * @param command
 * @param args
 * @param options
 */
function crossPlatformExecFileSync(command: string, args: string[], options?: ExecFileSyncOptions) {
  if (process.platform === 'win32') {
    return execFileSync(
      process.env.comspec || 'cmd.exe',
      ['/d', '/s', '/c', command, ...args],
      { ...options, windowsVerbatimArguments: true } as ExecFileSyncOptions
    );
  }
  return execFileSync(command, args, options);
}

/**
 * Check if a verdaccio instance is running
 */
export function isVerdaccioInUse(): boolean {
  const verdaccioAddress = 'http://127.0.0.1:4873';
  try {
    // eslint-disable-next-line no-console -- need to inform user about the check
    console.log(`Checking for Verdaccio registry at ${verdaccioAddress}...`);
    crossPlatformExecFileSync('npm', ['ping', `--registry=${verdaccioAddress}`], { stdio: 'pipe', timeout: 60_000 });
    return true;
  } catch {
    return false;
  }
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
    crossPlatformExecFileSync('npx', [
      '--yes',
      'npm-cli-login',
      '-u', 'verdaccio',
      '-p', 'verdaccio',
      '-e', 'test@test.com',
      '-r', registry,
      '--config-path', npmrcLoggedTarget
    ], { ...options });
  }
  packageManagerPublish([
    '--registry', registry,
    '--tag', 'latest',
    '--userconfig', npmrcLoggedTarget,
    '--no-workspaces'
  ], options);
  return true;
}
