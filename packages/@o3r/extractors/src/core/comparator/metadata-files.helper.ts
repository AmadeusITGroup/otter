import { O3rCliError, type SupportedPackageManagers } from '@o3r/schematics';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import type { MigrationCheckGranularity } from './metadata-comparator.interface';

/**
 * Returns a file from an npm package.
 * @param packageRef Npm compatible package descriptor (version or range)
 * @param filePaths List of files paths to extract
 * @param packageManager Name of the package manager to use
 * @param cwd working directory
 */
export async function getFilesFromRegistry(packageRef: string, filePaths: string[], packageManager: SupportedPackageManagers, cwd = process.cwd()): Promise<{[key: string]: string}> {
  const npmFileExtractor = await import(packageManager === 'npm'
    ? './package-managers-extractors/npm-file-extractor.helper'
    : './package-managers-extractors/yarn2-file-extractor.helper'
  );
  return npmFileExtractor.getFilesFromRegistry(packageRef, filePaths, cwd);
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
 * Given a path to a folder and a name pattern, returns the content of the file with the latest version in its name.
 * @param migrationDataFiles Migration data files paths
 */
export async function getLatestMigrationMetadataFile(migrationDataFiles: string[]): Promise<{version: string; path: string} | undefined> {
  let latestVersionFile: {version: string; path: string} | undefined;
  for (const filePath of migrationDataFiles) {
    const version = /\d+(?:\.\d+)*/.exec(basename(filePath))?.[0];
    if (version) {
      const { gt } = await import('semver');
      latestVersionFile = !latestVersionFile || gt(version, latestVersionFile.version) ? {version, path: filePath} : latestVersionFile;
    }
  }
  return latestVersionFile;
}

/**
 * Returns the range of package versions from which we will get the previous version according to granularity.
 * @param latestMigrationVersion Latest version in the migration files
 * @param granularity 'major' or 'minor'
 */
export async function getVersionRangeFromLatestVersion(latestMigrationVersion: string, granularity: MigrationCheckGranularity): Promise<string> {
  const { coerce } = await import('semver');
  const semver = coerce(latestMigrationVersion);
  if (!semver) {
    throw new O3rCliError(`${latestMigrationVersion} is not a valid version.`);
  }
  return `<${semver.major}.${granularity === 'minor' ? semver.minor : 0}.0`;
}
