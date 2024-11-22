import type { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import type { JsonObject } from '@angular-devkit/core';
import { getPackageManagerInfo, O3rCliError, type PackageManagerOptions, type SupportedPackageManagers, type WorkspaceSchema } from '@o3r/schematics';
import { sync as globbySync } from 'globby';
import { existsSync, promises, readFileSync } from 'node:fs';
import { EOL } from 'node:os';
import { join, posix } from 'node:path';
import { coerce, Range, satisfies } from 'semver';
import type { PackageJson } from 'type-fest';
import type { MetadataComparator, MigrationData, MigrationFile, MigrationMetadataCheckBuilderOptions } from './metadata-comparator.interface';
import { getFilesFromRegistry, getLatestMigrationMetadataFile, getLocalMetadataFile, getVersionRangeFromLatestVersion } from './metadata-files.helper';
import type { CmsMetadataData } from '../../interfaces';

function checkMetadataFile<MetadataItem, MigrationMetadataItem, MetadataFile>(
  lastMetadataFile: MetadataFile,
  newMetadataFile: MetadataFile,
  migrationData: MigrationData<MigrationMetadataItem>[],
  isBreakingChangeAllowed: boolean,
  checkAfterItems: boolean,
  comparator: MetadataComparator<MetadataItem, MigrationMetadataItem, MetadataFile>
): Error[] {
  const errors: Error[] = [];
  const newMetadataArray = comparator.getArray(newMetadataFile);
  const lastMetadataArray = comparator.getArray(lastMetadataFile);
  for (const lastValue of lastMetadataArray) {
    const isInNewMetadata = newMetadataArray.some((newValue) =>
      comparator.isSame
        ? comparator.isSame(newValue, lastValue)
        : comparator.getIdentifier(newValue) === comparator.getIdentifier(lastValue)
    );
    if (!isInNewMetadata) {
      if (!isBreakingChangeAllowed) {
        errors.push(new Error(`Property ${comparator.getIdentifier(lastValue)} is not present in the new metadata and breaking changes are not allowed`));
        continue;
      }

      const migrationMetadataValue = migrationData.find((metadata) => metadata.before && comparator.isMigrationDataMatch(lastValue, metadata.before, metadata.contentType));

      if (!migrationMetadataValue) {
        errors.push(new Error(`Property ${comparator.getIdentifier(lastValue)} has been modified but is not documented in the migration document`));
        continue;
      }

      if (checkAfterItems && migrationMetadataValue.after) {
        const isNewValueInNewMetadata = newMetadataArray.some((newValue) => comparator.isMigrationDataMatch(newValue, migrationMetadataValue.after!, migrationMetadataValue.contentType));
        if (!isNewValueInNewMetadata) {
          errors.push(new Error(`Property ${comparator.getIdentifier(lastValue)} has been modified but the new property is not present in the new metadata`));
          continue;
        }
      }
    }
  }
  return errors;
}

/**
 * Gets the package manager to use to retrieve the previous package from npm.
 * If the project uses npm or yarn 1 it will be npm.
 * If the project uses yarn 2+ it will be yarn.
 * This is especially important because npm and yarn 1 use the authentication from the .npmrc while yarn 2+ uses the .yarnrc.
 * @param options Option to determine the final package manager
 */
function getPackageManagerForRegistry(options?: PackageManagerOptions): SupportedPackageManagers | undefined {
  const packageManagerInfo = getPackageManagerInfo(options);
  if (!packageManagerInfo.version) {
    return undefined;
  }
  return packageManagerInfo.name === 'yarn' && !packageManagerInfo.version.match(/^1\./) ? 'yarn' : 'npm';
}

/**
 * Checks a type of metadata against a previous version of these metadata extracted from a npm package.
 * Will return errors if some changes are breaking and not allowed, or if the changes are not documented in the file
 * provided in options.
 * @param options Options for the builder
 * @param context Builder context (from another builder)
 * @param comparator Comparator implementation, depends on the type of metadata to check
 */
export async function checkMetadataBuilder<MetadataItem, MigrationMetadataItem, MetadataFile>(
  options: MigrationMetadataCheckBuilderOptions,
  context: BuilderContext,
  comparator: MetadataComparator<MetadataItem, MigrationMetadataItem, MetadataFile>
): Promise<BuilderOutput> {
  context.reportRunning();
  const angularJsonPath = join(context.workspaceRoot, 'angular.json');
  const builderName = context.builder.name as string;
  const angularJson = existsSync(angularJsonPath) ? JSON.parse(readFileSync(angularJsonPath, { encoding: 'utf8' }).toString()) as WorkspaceSchema : undefined;
  if (!angularJson) {
    context.logger.warn(`angular.json file cannot be found by ${builderName} builder.
Detection of package manager runner will fallback on the one used to execute the actual command.`);
  }

  const packageManager = getPackageManagerForRegistry({
    workspaceConfig: angularJson,
    enforcedNpmManager: options.packageManager
  });

  if (!packageManager) {
    throw new O3rCliError(`The package manager to use could not be determined by ${builderName}. Try to override it using the packageManager option.`);
  }

  const projectRoot = context.target && angularJson
    ? join(context.workspaceRoot, angularJson.projects[context.target.project].root)
    : context.currentDirectory;
  const packageJsonPath = join(projectRoot, 'package.json');
  const packageJson = existsSync(packageJsonPath) ? JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf8' }).toString()) as JsonObject : undefined;
  if (!packageJson) {
    throw new O3rCliError(`package.json file cannot be found by ${builderName} builder.`);
  }

  const migrationDataFiles = globbySync(options.migrationDataPath, { cwd: context.currentDirectory });

  const {path: migrationFilePath, version: latestMigrationVersion} = await getLatestMigrationMetadataFile(migrationDataFiles) || {};

  if (!migrationFilePath || !latestMigrationVersion) {
    throw new O3rCliError(`No migration data could be found matching ${typeof options.migrationDataPath === 'string' ? options.migrationDataPath : options.migrationDataPath.join(',')}`);
  }

  context.logger.info(`Latest version present in migration data folder: ${latestMigrationVersion}`);
  const previousVersion = await getVersionRangeFromLatestVersion(latestMigrationVersion, options.granularity);

  const migrationData = getLocalMetadataFile<MigrationFile<MigrationMetadataItem>>(migrationFilePath);

  // Check for libraries versions mismatches
  if (migrationData.libraries?.length) {
    await Promise.all(Object.entries(migrationData.libraries).map(async ([libName, libVersion]) => {
      const libPackageJson = JSON.parse(await promises.readFile(require.resolve(`${libName}/package.json`), {encoding: 'utf8'})) as PackageJson;
      const libRange = new Range(`~${coerce(libVersion)?.raw}`);
      if (!satisfies(libPackageJson.version!, libRange)) {
        context.logger.warn(`The version of the library "${libName}": ${libVersion} specified in your latest migration files doesn't match the installed version: ${libPackageJson.version}`);
      }
    }));
  }

  const packageLocator = `${packageJson.name as string}@${previousVersion}`;
  context.logger.info(`Fetching ${packageLocator} from the registry.`);
  const packageJsonFileName = 'package.json';
  const previousFile = await getFilesFromRegistry(packageLocator, [options.metadataPath, packageJsonFileName], packageManager, context.workspaceRoot);
  const previousPackageJson = JSON.parse(previousFile[packageJsonFileName]) as PackageJson & {cmsMetadata: CmsMetadataData};
  context.logger.info(`Successfully fetched ${packageLocator} with version ${previousPackageJson.version}.`);

  let metadata: MetadataFile;
  if (previousFile[options.metadataPath]) {
    metadata = JSON.parse(previousFile[options.metadataPath]) as MetadataFile;
    context.logger.info(`Resolved metadata from "${options.metadataPath}".`);
  } else {
    const previousMetadataEntryFromPackageJson = previousPackageJson.cmsMetadata?.[options.packageJsonEntry];
    if (previousMetadataEntryFromPackageJson) {
      const previousFileFromPackageJson = await getFilesFromRegistry(packageLocator, [previousMetadataEntryFromPackageJson], packageManager, context.workspaceRoot);
      metadata = JSON.parse(previousFileFromPackageJson[previousMetadataEntryFromPackageJson]) as MetadataFile;
      context.logger.info(`Resolved metadata from "${previousMetadataEntryFromPackageJson}".`);
    } else {
      return {
        success: false,
        error: `Couldn't find previous metadata file from "${options.metadataPath}".
          Make sure the path is correct or that the field 'cmsMetadata.${options.packageJsonEntry}' is set in your package.json`
      };
    }
  }

  const metadataPathInWorkspace = posix.join(projectRoot, options.metadataPath);
  const newFile = getLocalMetadataFile<MetadataFile>(metadataPathInWorkspace);


  const errors = checkMetadataFile<MetadataItem, MigrationMetadataItem, MetadataFile>(metadata, newFile, migrationData.changes, options.allowBreakingChanges, options.checkAfterItems, comparator);

  if (errors.length) {
    return {
      success: false,
      error: errors.map(({ message }) => message).join(EOL)
    };
  } else {
    context.logger.info('Migration data has been checked without errors.');
    return {
      success: true
    };
  }
}
