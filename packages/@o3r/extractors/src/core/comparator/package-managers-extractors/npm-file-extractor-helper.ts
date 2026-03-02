import {
  spawnSync,
  type SpawnSyncOptions,
  SpawnSyncOptionsWithStringEncoding,
  SpawnSyncReturns,
} from 'node:child_process';
import {
  randomBytes,
} from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import {
  tmpdir,
} from 'node:os';
import {
  join,
  posix,
  sep,
} from 'node:path';

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
function crossPlatformSpawnSync(command: string, args: string[], options?: SpawnSyncOptions) {
  if (process.platform === 'win32') {
    return spawnSync(
      process.env.comspec || 'cmd.exe',
      ['/d', '/s', '/c', command, ...args],
      { ...options, windowsVerbatimArguments: true }
    );
  }
  return spawnSync(command, args, options);
}

function runAndThrowOnError(command: string, args: string[], spawnOptions: SpawnSyncOptionsWithStringEncoding): SpawnSyncReturns<string> {
  const cmdOutput = crossPlatformSpawnSync(command, args, spawnOptions) as SpawnSyncReturns<string>;
  if (cmdOutput.error || cmdOutput.status !== 0) {
    throw new Error(cmdOutput.stderr);
  }
  return cmdOutput;
}

function pathToPosix(path: string): string {
  return path.split(sep).join(posix.sep);
}

function sanitizeInput(input: string) {
  return input.replace(/[^\w ./:<=>@\\^~-]/g, '');
}

/**
 * Retrieves the list of given files from an npm package using npm.
 * @param packageDescriptor Package descriptor using the npm semver format (i.e. `@o3r/demo@^1.2.3`)
 * @param paths Paths of the files to extract
 */
export async function getFilesFromRegistry(packageDescriptor: string, paths: string[]): Promise<Record<string, string>> {
  const semver = await import('semver');
  const tempDirName = 'o3r-' + randomBytes(16).toString('hex');
  const tempDirPath = join(tmpdir(), tempDirName);
  let extractedFiles: { [key: string]: string } = {};
  mkdirSync(tempDirPath);
  const [,packageName, packageRange] = sanitizeInput(packageDescriptor).match(/^(.*?)(?:\b@(.+))?$/) || [];

  try {
    const npmViewCmd = runAndThrowOnError(
      'npm', ['view', packageName, 'versions', '--json'],
      { encoding: 'utf8' }
    );
    let versions = JSON.parse(npmViewCmd.stdout.trim()) as string[] | string;
    if (typeof versions !== 'string') {
      if (packageRange) {
        const range = new semver.Range(packageRange, { includePrerelease: true });
        versions = versions.filter((v) => range.test(v));
      }
      versions.toSorted((a, b) => semver.compare(b, a));
    }
    const latestVersion = typeof versions === 'string' ? versions : versions[0];

    const npmPackCmd = runAndThrowOnError(
      'npm', ['pack', `${packageName}@${sanitizeInput(latestVersion)}`, '--pack-destination', pathToPosix(tempDirPath)],
      { encoding: 'utf8' }
    );
    const tgzFile = npmPackCmd.stdout.trim();

    extractedFiles = paths.reduce((filesContent, path) => {
      // tar expects a posix path
      const pathInTgz = posix.join('./package', path);
      crossPlatformSpawnSync(
        'tar', ['-zxvf', pathToPosix(tgzFile), '-C', pathToPosix(tempDirPath), pathInTgz],
        { cwd: tempDirPath, encoding: 'utf8' }
      );
      const extractedFilePath = join(tempDirPath, pathInTgz);
      if (existsSync(extractedFilePath)) {
        filesContent[path] = readFileSync(extractedFilePath).toString();
      }
      return filesContent;
    }, extractedFiles);
  } finally {
    rmSync(tempDirPath, { recursive: true });
  }
  return extractedFiles;
}
