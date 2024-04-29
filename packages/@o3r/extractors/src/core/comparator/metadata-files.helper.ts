import type { SupportedPackageManagers } from '@o3r/schematics';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { coerce, gt } from 'semver';
import type { MigrationCheckGranularity } from './metadata-comparator.interface';

/**
 * Returns a file from an npm package.
 * @param packageRef Npm compatible package descriptor (version or range)
 * @param filePaths List of files paths to extract
 * @param packageManager Name of the package manager to use
 */
export async function getFilesFromRegistry(packageRef: string, filePaths: string[], packageManager: SupportedPackageManagers): Promise<{[key: string]: string}> {
  const npmFileExtractor = await import(packageManager === 'npm' ? './package-managers-extractors/npm-file-extractor.helper' : './package-managers-extractors/yarn2-file-extractor.helper');
  return npmFileExtractor.getFilesNpm(packageRef, filePaths);
}

/**
 * Read and parses a JSON file
 * @param metadataPath Path of the file
 */
export function getLocalMetadataFile<T>(metadataPath: string): T {
  const migrationData = readFileSync(metadataPath).toString();
  return JSON.parse(migrationData) as T;
}

/**
 * Given a path to a folder and a name pattern, returns the content of the file with the latest version in it's name.
 * @param migrationDataFiles Migration data files paths
 */
export function getLatestMigrationMetadataFile(migrationDataFiles: string[]): {version: string; path: string} | undefined {
  return migrationDataFiles.reduce((latestVersionFile: {version: string; path: string} | undefined, filePath: string) => {
    const version = /\d+(?:\.\d)*(?:\.\d)*/.exec(basename(filePath))?.[0];
    if (version) {
      return !latestVersionFile || gt(version, latestVersionFile.version) ? {version, path: filePath} : latestVersionFile;
    } else {
      return latestVersionFile;
    }
  }, undefined);
}

/**
 * Returns the range of package versions from which we will get the previous version according to granularity.
 * @param version Current package version
 * @param granularity 'major' or 'minor'
 */
export function getVersionRangeFromLatestVersion(version: string, granularity: MigrationCheckGranularity): string {
  const semver = coerce(version);
  if (!semver) {
    throw new Error(`${version} is not a valid version.`);
  }
  return `<${semver.major}.${granularity === 'minor' ? semver.minor : 0}.0`;
}
