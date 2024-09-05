#!/usr/bin/env node


import { blue, bold, green, grey } from 'chalk';
import { program } from 'commander';
import * as globby from 'globby';
import { promises as fs, readFileSync } from 'node:fs';
import * as path from 'node:path';
import * as semver from 'semver';
import type { PackageJson } from 'type-fest';
import * as winston from 'winston';
import { DependencyInfo, DependencyToUpdate, Options, PackageJsonWithOtterConfiguration } from '../helpers/version-harmonize/interfaces';

/** Console logger */
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: new winston.transports.Console()
});

logger.warn(`Version-harmonize is ${bold.yellow('deprecated')}, please use the ${green('@o3r/json-dependency-versions-harmonize')} from ESLint ${blue('@o3r/eslint-plugin')} plugin`);

program
  .description('[DEPRECATED] Replace the dependencies version in a monorepos')
  .option('-m, --monorepo <package>', 'Path to the private package.json of the monorepo', (filePath) => path.resolve(process.cwd(), filePath), path.resolve(process.cwd(), 'package.json'))
  .option('-t, --dependency-types <...types>', 'List of dependency types to update, comma separated', (types) => types.split(','),
    ['optionalDependencies', 'dependencies', 'devDependencies', 'peerDependencies', 'generatorDependencies'])
  .option('-v, --verbose', 'Display debug logs')
  .option('-a, --align-peer-dependencies', 'Enforce to align the version of the dependencies with the latest range')
  .option('--apply-to <...globs>', `List of path globs of files to which apply the new calculated version without implicating them in the version determination (separated by ${path.delimiter})`,
    (g, mem: string[]) => ([
      ...mem,
      ...g.split(path.delimiter).map((p) => path.posix.join(process.cwd().replace(/\\/g, '/'), p))
    ]), [])
  .parse(process.argv);

/** Options from CLI */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
const options = program.opts() as Options;
logger.level = options.verbose ? 'debug' : 'info';

/**
 * Retrieve the best range for a dependency.
 * @param dependencies List of extracted dependencies
 * @param dependencyName Name of the dependency to retrieve the best range
 * @returns Dependency information of the best range
 */
const getLatestRange = (dependencies: DependencyInfo[], dependencyName: string): DependencyInfo | undefined => {
  const latestRange = dependencies
    .reduce<DependencyInfo | undefined>((acc, current) => {
      if (!acc) {
        return semver.validRange(current.range) ? current : acc;
      }
      if (semver.validRange(current.range)) {
        const minCurrentVersion = semver.minVersion(current.range);
        const minAccVersion = semver.minVersion(acc.range);
        if (!minCurrentVersion) {
          return acc;
        } else if (!minAccVersion) {
          return current;
        }
        return semver.lte(minCurrentVersion, minAccVersion) ? acc : current;
      }
    }, undefined);

  logger.debug(`Latest range for ${dependencyName}: ${latestRange?.range}`);
  return latestRange;
};

/**
 * Update the package.json with the best range for a dependency
 * @param packageJsonUpdates List of package.json to update
 * @param bestRangeDependencies Mapping of the best range for each dependency
 */
const updatePackageJson = async (packageJsonUpdates: DependencyToUpdate[], bestRangeDependencies: Record<string, DependencyInfo>) => {
  if (packageJsonUpdates.length === 0) {
    logger.info('No package.json dependency harmonization needed');
  }

  const packageJsonUpdatesByPath = packageJsonUpdates.reduce<Record<string, DependencyToUpdate[]>>((acc, current) => {
    acc[current.path] ||= [];
    acc[current.path].push(current);
    acc[current.path].sort();
    return acc;
  }, {});

  await Promise.all(
    Object.entries(packageJsonUpdatesByPath)
      .filter(([, toUpdate]) => toUpdate.length > 0)
      .map(async ([packagePath, toUpdate]) => {
        const packageJson = toUpdate[0].packageJson;
        toUpdate.forEach((update) => {
          (packageJson[update.type] as Record<string, string>)[update.dependencyName] = bestRangeDependencies[update.dependencyName].range;
          logger.info(`Update ${bold(update.dependencyName)} to ${bold(bestRangeDependencies[update.dependencyName].range)} in ${bold(update.packageJson.name)}` +
          ` ${grey(`(${path.relative(process.cwd(), update.path)})`)}`);
          logger.debug(`Reason: ${update.reason}`);
        });
        await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
      })
  );
};

/**
 * Update the package.json with the version of the package manager used by the monorepo
 * @param packageJsonPaths List of package.json paths to update
 * @param packageManager Package manager
 */
const updatePackageJsonPackageManager = async (packageJsonPaths: string[], packageManager: string | undefined) => {
  if (!packageManager) {
    logger.debug('No package manager specified in the monorepo package.json file');
    return;
  }

  for (const packageJsonPath of packageJsonPaths) {
    const packageJson: PackageJson = JSON.parse(await fs.readFile(packageJsonPath, { encoding: 'utf8' }));
    logger.info(`Update packageManager from ${bold(packageJson.packageManager)} to ${bold(packageManager)} in ${bold(packageJson.name)} ${grey(`(${path.relative(process.cwd(), packageJsonPath)})`)}`);
    packageJson.packageManager = packageManager;
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  }
};

void (async () => {
  // eslint-disable-next-line @stylistic/js/max-len
  logger.warn('This script is deprecated and will be removed in v12, please use the linter rule @o3r/json-dependency-versions-harmonize instead (documentation available https://github.com/AmadeusITGroup/otter/blob/main/docs/linter/eslint-plugin/rules/json-dependency-versions-harmonize.md)');
  const monorepoPackage: PackageJson = JSON.parse(readFileSync(options.monorepo, { encoding: 'utf8' }));
  const { workspaces, packageManager } = monorepoPackage;
  const packageJsonPatterns = (Array.isArray(workspaces) ? workspaces : (workspaces && workspaces.packages))?.map((packagePath) => path.posix.join(packagePath, 'package.json'));

  /** List of all package.json of the workspace */
  const packageJsonPathLists = packageJsonPatterns && await globby(packageJsonPatterns);
  const packagePathToUpdateThePackageManager: string[] = [];
  /** Map of dependencies for each dependency name */
  const dependencyMaps: Record<string, DependencyInfo[]> = {};

  if (!packageJsonPathLists) {
    logger.error('The version harmonize cannot run on non mono-repository project');
    process.exit(1);
  }

  // add main package.json to the list
  packageJsonPathLists.push(options.monorepo);

  for (const packageJsonPath of packageJsonPathLists) {
    const packageJson: PackageJsonWithOtterConfiguration = await JSON.parse(await fs.readFile(packageJsonPath, { encoding: 'utf8' }));
    if (packageJson.otter?.versionHarmonize?.skipPackage) {
      logger.debug(`${packageJson.name} is ignored`);
      continue;
    }
    if (!packageJson.otter?.versionHarmonize?.ignorePackageManager && packageJson.packageManager && packageManager && packageManager !== packageJson.packageManager) {
      packagePathToUpdateThePackageManager.push(packageJsonPath);
    }
    const ignorePatterns = packageJson.otter?.versionHarmonize?.ignore?.map((ignorePattern) => new RegExp(ignorePattern));
    options.dependencyTypes
      .filter((dependencyType) => !!packageJson[dependencyType])
      .forEach((dependencyType) => {
        Object.entries(packageJson[dependencyType] as Record<string, string>)
          .filter(([dependencyName]) => !ignorePatterns?.some((pattern) => pattern.test(dependencyName)))
          .forEach(([dependencyName, range]) => {
            dependencyMaps[dependencyName] ||= [];
            dependencyMaps[dependencyName].push({
              path: packageJsonPath,
              packageJson,
              range,
              dependencyName,
              type: dependencyType
            });
          });
      });
  }

  /** Map of the best range for each dependency */
  const bestRangeDependencies = Object.entries(dependencyMaps)
    .reduce<Record<string, DependencyInfo>>((acc, [depName, depInfo]) => {
      const latestRange = getLatestRange(depInfo, depName);
      if (latestRange) {
        acc[depName] = latestRange;
      }
      return acc;
    }, {});

  // Add the ApplyTo files after the version calculation to benefice of the new range without being part of the calculation
  if (options.applyTo.length > 0) {
    const applyToFiles = await globby(options.applyTo);
    for (const packageJsonPath of applyToFiles) {
      let packageJson: PackageJson;
      try {
        packageJson = await JSON.parse(await fs.readFile(packageJsonPath, { encoding: 'utf8' }));
      } catch {
        logger.debug(`ignored ${packageJsonPath} because the JSON parse has failed`);
        continue;
      }
      if (packageJson.packageManager && packageManager && !packageManager.includes('<%') && packageManager !== packageJson.packageManager) {
        packagePathToUpdateThePackageManager.push(packageJsonPath);
      }
      options.dependencyTypes
        .filter((dependencyType) => !!packageJson[dependencyType])
        .forEach((dependencyType) => {
          Object.entries(packageJson[dependencyType] as Record<string, string>)
            .filter(([, range]) => semver.validRange(range)) // skip the dependencies that are generated in case of template
            .forEach(([dependencyName, range]) => {
              dependencyMaps[dependencyName] ||= [];
              dependencyMaps[dependencyName].push({
                path: packageJsonPath,
                packageJson,
                range,
                dependencyName,
                type: dependencyType
              });
            });
        });
    }
  }

  /** List of the dependencies to update with the best ranges */
  const dependenciesToUpdate = Object.entries(bestRangeDependencies)
    .reduce<DependencyToUpdate[]>((acc, [depName, depInfo]) => {
      if (!depInfo) {
        return acc;
      }

      const toAlign = dependencyMaps[depName]
        .filter((dependency) => options.alignPeerDependencies || dependency.type !== 'peerDependencies')
        .filter((dependency) => dependency.range !== depInfo.range)
        .map((dependency) => ({ ...dependency, reason: 'version harmonize' }));

      const peerDepToFix = options.alignPeerDependencies ? [] : dependencyMaps[depName]
        .filter((dependency) => dependency.type === 'peerDependencies')
        .filter((dependency) => !semver.intersects(dependency.range, depInfo.range))
        .map((dependency) => ({ ...dependency, reason: 'fix peerDependencies' }));

      return [...acc, ...toAlign, ...peerDepToFix];
    }, []);

  await updatePackageJson(dependenciesToUpdate, bestRangeDependencies);
  await updatePackageJsonPackageManager(packagePathToUpdateThePackageManager, packageManager);

})();
