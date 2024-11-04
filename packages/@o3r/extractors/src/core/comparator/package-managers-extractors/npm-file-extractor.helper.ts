import { spawnSync, SpawnSyncOptionsWithStringEncoding, SpawnSyncReturns } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, posix, sep } from 'node:path';

function runAndThrowOnError(command: string, spawnOptions: SpawnSyncOptionsWithStringEncoding): SpawnSyncReturns<string> {
  const cmdOutput = spawnSync(command, spawnOptions);
  if (cmdOutput.error || cmdOutput.status !== 0) {
    throw cmdOutput.stderr;
  }
  return cmdOutput;
}

function pathToPosix(path: string): string {
  return path.split(sep).join(posix.sep);
}

function sanitizeInput(input: string) {
  return input.replace(/[^\w/\\:@^~=<> .-]/g, '');
}

/**
 * Retrieves the list of given files from an npm package using npm.
 * @param packageDescriptor Package descriptor using the npm semver format (i.e. @o3r/demo@^1.2.3)
 * @param paths Paths of the files to extract
 */
export async function getFilesFromRegistry(packageDescriptor: string, paths: string[]): Promise<Record<string, string>> {
  const semver = await import('semver');
  const tempDirName = 'o3r-' + randomBytes(16).toString('hex');
  const tempDirPath = join(tmpdir(), tempDirName);
  let extractedFiles: { [key: string]: string } = {};
  mkdirSync(tempDirPath);
  const [,packageName,packageRange] = sanitizeInput(packageDescriptor).match(/^(.*?)(?:\b@(.+))?$/) || [];

  try {
    const npmViewCmd = runAndThrowOnError(
      `npm view "${packageName}" versions --json`,
      { shell: true, encoding: 'utf8' }
    );
    let versions = JSON.parse(npmViewCmd.stdout.trim()) as string[] | string;
    if (typeof versions !== 'string') {
      if (packageRange) {
        const range = new semver.Range(packageRange, {includePrerelease: true});
        versions = versions.filter((v) => range.test(v));
      }
      versions.sort((a, b) => semver.compare(b, a));
    }
    const latestVersion = typeof versions === 'string' ? versions : versions[0];

    const npmPackCmd = runAndThrowOnError(
      `npm pack "${packageName}@${sanitizeInput(latestVersion)}" --pack-destination "${pathToPosix(tempDirPath)}"`,
      { shell: true, encoding: 'utf8' }
    );
    const tgzFile = npmPackCmd.stdout.trim();

    extractedFiles = paths.reduce((filesContent, path) => {
      // tar expects a posix path
      const pathInTgz = posix.join('./package', path);
      spawnSync(
        `tar -zxvf "${pathToPosix(tgzFile)}" -C "${pathToPosix(tempDirPath)}" "${pathInTgz}"`,
        { shell: true, cwd: tempDirPath, encoding: 'utf8' }
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
