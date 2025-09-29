import {
  execSync,
} from 'node:child_process';
import {
  readFileSync,
} from 'node:fs';
import {
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import minimist from 'minimist';
import * as semver from 'semver';
import {
  PackageJson,
} from 'type-fest';
import {
  getAllDependencies,
} from './loaders';
import {
  getPackageManagerExecutor,
} from './package-manager-runner';

interface NgUpdateOptions {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- Angular naming convention
  'migrate-only'?: boolean;
  from?: string;
  to?: string;
}

function getPackageGroup(packageJsonPath: string) {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- Naming from angular
  const o3rPackageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson & { 'ng-update'?: { packageGroup?: string[] } };
  return o3rPackageJson['ng-update']?.packageGroup ?? [];
}

function getAllDependenciesFromPackageGroup(tree: Tree, packageJsonPath: string) {
  const allDeps = getAllDependencies(tree);
  const packageGroup = getPackageGroup(packageJsonPath);
  allDeps.forEach((dep) => {
    if (!packageGroup.includes(dep)) {
      allDeps.delete(dep);
    }
  });
  return allDeps;
}

function hasMigrationScript(dependency: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- keep it synchronous
    const packageJson = require(`${dependency}/package.json`);
    return !!packageJson['ng-update'];
  } catch {
    return false;
  }
}

function triggerPackageGroupUpdates(tree: Tree, packageJsonPath: string, ngUpdateOptions: NgUpdateOptions) {
  const dependencies = getAllDependenciesFromPackageGroup(tree, packageJsonPath);
  const executor = getPackageManagerExecutor();
  for (const dependency of dependencies) {
    if (hasMigrationScript(dependency)) {
      // eslint-disable-next-line no-console -- Logging some stuff
      console.log(`Looking for updates in ${dependency}`);
      const options = Object.entries(ngUpdateOptions)
        .filter(([key]) => ['migrate-only', 'from', 'to', 'next', 'force'].includes(key))
        .map(([key, value]) => `--${key}=${value}`).join(' ');
      const cmd = `${executor} ng update ${dependency} ${options}`;
      try {
        execSync(cmd, { stdio: 'inherit', env: { ...process.env, O3R_UPDATE_ONGOING: 'true' } });
      } catch (err) {
        // eslint-disable-next-line no-console -- Need to show the error without throwing
        console.error(`Error while executing: ${cmd}`, err);
      }
    }
  }
}

/**
 * Return a rule that will trigger the ng-update for all packages in packageGroup if present.
 * @param packageJsonPath The path to the package.json file where the packageGroup is defined
 * @param validRange Only execute if the target version (--to) satisfies this range
 */
export function updatePackageGroup(packageJsonPath: string, validRange?: string): Rule {
  return (tree: Tree) => {
    const args = process.argv.slice(2);
    // eslint-disable-next-line id-denylist -- Naming from minimist
    const ngUpdateOptions = minimist(args, { string: ['from', 'to'] }) as NgUpdateOptions;
    const isValidTarget = !ngUpdateOptions.to || !validRange
      || semver.subset(ngUpdateOptions.to, validRange, { includePrerelease: true });

    if (ngUpdateOptions['migrate-only'] && ngUpdateOptions.from && isValidTarget && !process.env.O3R_UPDATE_ONGOING) {
      triggerPackageGroupUpdates(tree, packageJsonPath, ngUpdateOptions);
    }
  };
}
