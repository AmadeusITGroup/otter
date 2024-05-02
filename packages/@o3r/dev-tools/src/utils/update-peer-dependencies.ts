import { readJsonSync } from 'fs-extra';
import { exec } from 'node:child_process';
import * as fs from 'node:fs';
import * as semver from 'semver';
import { promisify } from 'node:util';
import * as winston from 'winston';

interface Dependency {
  /**
   * Name of the NPM package
   */
  packageName: string;

  /**
   * Version requested (range accepted)
   */
  version?: string;

  /**
   * Full name <package>@<version>
   */
  fullName: string;
}

interface PackageMap {
  [packageName: string]: string;
}

interface PackageInfo {
  version: string;

  peerDependencies?: PackageMap;
}

const DEPENDENCY_TYPES = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

const promisifiedExec = promisify(exec);
const dependencyPattern = new RegExp('^(@?[^@]+)(?:@(.*))?$');

const dependencyParser = (value: string): Dependency | undefined => {
  const parsed = dependencyPattern.exec(value.trim());
  if (parsed) {
    return {
      packageName: parsed[1],
      version: parsed[2],
      fullName: value
    };
  }
};


/**
 * Update a package.json with the given dependencies versions and their respective peer dependencies.
 * Relies on npm info to retrieve package information.
 * Example: updatePeerDependencies(['@random/package@~2.21.0', '@o3r/core'], './package.json')
 * @deprecated will be removed in Otter v12.
 * @param dependencies
 * @param packageJsonPath
 * @param verbose
 * @param silent
 */
export async function updatePeerDependencies(dependencies: string[] = [], packageJsonPath: string, verbose = false, silent = true) {

  const logger = winston.createLogger({
    level: verbose ? 'debug' : 'info',
    format: winston.format.simple(),
    transports: new winston.transports.Console()
  });

  const dependenciesMap = dependencies.map(dependencyParser).filter((dependency): dependency is Dependency => !!dependency);

  const failedDependencies: Dependency[] = [];
  logger.info('Start retrieving package infos.');

  // In parallel for every package
  const dependenciesToUpdate = (await Promise.all(dependenciesMap.map(async (dependency) => {
    try {
      // Retrieve the metadata of the requested version (or latest) using npm info
      logger.info(`Retrieving package info of ${dependency.packageName}, version ${dependency.version || 'latest'}`);
      const commandToExecute = `npm info "${dependency.fullName}" version peerDependencies --json`;
      logger.debug(`Executing command: ${commandToExecute}`);
      const execOutput = (await promisifiedExec(commandToExecute)).stdout;

      // An empty stdout means that NPM could not retrieve package information
      if (!execOutput) {
        logger.error(`Could not retrieve metadata for package: ${dependency.fullName}`);
        failedDependencies.push(dependency);
        return;
      }

      const infoOutput: PackageInfo | PackageInfo[] = JSON.parse(execOutput);
      const packageInfo = Array.isArray(infoOutput) ?
        infoOutput.reduce((latestPackage, currentPackage) =>
          semver.gt(latestPackage.version, currentPackage.version) ? latestPackage : currentPackage
        ) : infoOutput;

      logger.debug(JSON.stringify(packageInfo, undefined, 2));

      // If no version was specified, parse the version of the metadata we received
      if (!dependency.version) {
        dependency.version = packageInfo.version;
      }

      // aggregate the requested version + the package peer dependencies as a base we will use to update our package.json
      return {
        [dependency.packageName]: dependency.version,
        ...(packageInfo.peerDependencies || {})
      };
    } catch (error: any) {
      logger.error(`Failed retrieving information for package: ${dependency.packageName}`);
      logger.error(error.message);
      logger.error(error.stack);
      failedDependencies.push(dependency);
    }
  })) as (PackageMap | undefined)[])
    // Aggregate the result for all packages
    .reduce((_dependenciesToUpdate, currentDependenciesToUpdate) => ({
      ..._dependenciesToUpdate,
      ...currentDependenciesToUpdate
    }), {}) as PackageMap;

  logger.debug('Dependencies to update:');
  logger.debug(JSON.stringify(dependenciesToUpdate, undefined, 2));
  logger.info('Done retrieving package infos.');

  // Fail the process if not silent and we failed to update at least one package
  if (!silent && failedDependencies.length > 0) {
    throw new Error('Exiting with error due to update failures');
  }

  const targetPackageJson = readJsonSync(packageJsonPath);
  let hasTouchedPackageJson = false;
  logger.info('Start updating package.json');
  // For any reference of a dependency to update in any dependency type of the target package.json, update its version if different.
  DEPENDENCY_TYPES.forEach((dependencyType) => {
    Object.keys(targetPackageJson[dependencyType] || {}).forEach((packageName) => {
      const currentVersion = targetPackageJson[dependencyType][packageName] as string;
      const newVersion = dependenciesToUpdate[packageName];
      if (newVersion && currentVersion !== newVersion) {
        logger.info(`Updating ${dependencyType} ${packageName} version: ${currentVersion} -> ${newVersion}`);
        targetPackageJson[dependencyType][packageName] = newVersion;
        hasTouchedPackageJson = true;
      }
    });
  });

  if (hasTouchedPackageJson) {
    logger.info(`Writing updated content to ${packageJsonPath}`);
    fs.writeFileSync(packageJsonPath, JSON.stringify(targetPackageJson, undefined, 2));
  } else {
    logger.info('Nothing to update.');
  }

  logger.info('Done updating package.json');
}
