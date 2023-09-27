import { chain, externalSchematic, noop, Rule, Schematic, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import type { NodeDependency } from '@schematics/angular/utility/dependencies';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { lastValueFrom } from 'rxjs';
import type { PackageJson } from 'type-fest';
import { SchematicOptionObject } from '../../interfaces';
import type { NgAddPackageOptions } from '../../tasks/index';
import { getExternalDependenciesVersionRange, getNodeDependencyList, getPackageManager, readAngularJson, registerCollectionSchematics, writeAngularJson } from '../../utility/index';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';

/**
 * Install via `ng add` a list of npm packages.
 *
 * @param packages List of packages to be installed via `ng add`
 * @param options install options
 * @param packageJsonPath path of the package json of the project where they will be installed
 */
export function ngAddPackages(packages: string[], options?: Omit<NgAddPackageOptions, 'version'> & {version?: string | string[]}, packageJsonPath = '/package.json'): Rule {
  if (!packages.length) {
    return noop;
  }
  const versions = Object.fromEntries(packages.map<[string, string | undefined]>((packageName, index) =>
    [packageName, typeof options?.version === 'object' ? options.version[index] : options?.version]));
  if (options?.workingDirectory && !packageJsonPath.startsWith(options.workingDirectory)) {
    packageJsonPath = path.join(options.workingDirectory, packageJsonPath);
  }

  const getInstalledVersion = (packageName: string) => {
    try {
      const packageJsonAfterInstall = JSON.parse(readFileSync('./package.json', {encoding: 'utf8'}));
      if (options?.dependencyType === NodeDependencyType.Dev) {
        return packageJsonAfterInstall.devDependencies[packageName];
      } else if (options?.dependencyType === NodeDependencyType.Peer) {
        return packageJsonAfterInstall.peerDependencies[packageName];
      } else {
        return packageJsonAfterInstall.dependencies[packageName];
      }
    } catch (e) {
      return;
    }
  };

  const getNgAddSchema = (packageName: string, context: SchematicContext) => {
    try {
      const collection = context.engine.createCollection(packageName);
      return collection.createSchematic('ng-add');
    } catch {
      context.logger.warn(`No ng-add found for ${packageName}`);
      return undefined;
    }
  };

  const getOptions = (schema: Schematic<any, any>) => {
    const schemaOptions = schema.description.schemaJson?.properties || {};
    return Object.entries(options || {}).reduce<Record<string, any>>((accOptions, [key, value]: [string, any]) => {
      if (schemaOptions[key]) {
        accOptions[key] = value;
      }
      return accOptions;
    }, {});
  };

  return async (tree, context) => {
    const installedVersions = packages.map((packageName) => getInstalledVersion(packageName));
    const packageManager = getPackageManager();
    let installOptions = '';
    if (options?.dependencyType === NodeDependencyType.Dev && packageManager === 'yarn') {
      installOptions = ' --prefer-dev';
    } else if (options?.dependencyType === NodeDependencyType.Dev) {
      installOptions = ' -D';
    } else if (options?.dependencyType === NodeDependencyType.Peer) {
      installOptions = ' -P';
    }
    const packagesToInstall = packages.filter((packageName, index) => !installedVersions[index] || installedVersions[index] !== versions[packageName]);
    if (packagesToInstall.length < 1) {
      return noop;
    }
    const packagesInput = packagesToInstall
      .map((packageName) => `${packageName}${versions[packageName] ? `@${versions[packageName] as string}` : ''}`)
      .join(' ');
    const workingDirectory = options?.workingDirectory || path.dirname(packageJsonPath);
    context.addTask(new NodePackageInstallTask({
      packageManager: packageManager,
      packageName: `${packagesInput}${installOptions}`,
      workingDirectory,
      hideOutput: false,
      quiet: false
    } as any));
    await lastValueFrom(context.engine.executePostTasks());

    // We need to update manually the package json in the tree as the tree will overwrite the project at the end of the ng add @o3r/core
    const latestInstalledVersions = packagesToInstall.map((packageName) =>
      [packageName, getInstalledVersion(packageName)]
    );
    const packageJson: PackageJson = tree.readJson(packageJsonPath) as PackageJson;
    latestInstalledVersions.forEach(([packageName, latestInstalledVersion]) => {
      if (options?.dependencyType === NodeDependencyType.Dev) {
        packageJson.devDependencies = {...packageJson.devDependencies, [packageName]: latestInstalledVersion};
      } else if (options?.dependencyType === NodeDependencyType.Peer) {
        packageJson.peerDependencies = {...packageJson.peerDependencies, [packageName]: latestInstalledVersion};
      } else {
        packageJson.dependencies = {...packageJson.dependencies, [packageName]: latestInstalledVersion};
      }
    });
    tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));

    if (options?.skipNgAddSchematicRun) {
      context.logger.info(`Package(s) '${packagesToInstall.join(', ')}' was(were) installed.
        The run of 'ng-add' schematics for the package(s) is intentionally skipped. You can do the run standalone, later.`);
      return noop;
    }

    const ngAddsToApply = packagesToInstall
      .map((packageName) => ({packageName, ngAddCollection: getNgAddSchema(packageName, context)}))
      .filter(({packageName, ngAddCollection}) => {
        if (!ngAddCollection) {
          context.logger.info(
            `No ng-add schematic found for: '${packageName}'. Skipping ng add for: ${packageName}${versions[packageName] ? ' with version: ' + (versions[packageName] as string) : ''}`);
        }
        return !!ngAddCollection;
      })
      .map(({packageName, ngAddCollection}) => externalSchematic(packageName, 'ng-add', getOptions(ngAddCollection!)));
    return chain(ngAddsToApply);
  };
}

/**
 * Look for the peer dependencies and run ng add on the package requested version
 *
 * @param packages list of the name of the packages needed
 * @param packageJsonPath path to package json that needs the peer to be resolved
 * @param type how to install the dependency (dev, peer for a library or default for an application)
 * @param options
 * @param parentPackageInfo for logging purposes
 */
export function ngAddPeerDependencyPackages(packages: string[], packageJsonPath: string, type: NodeDependencyType = NodeDependencyType.Default,
  options: NgAddPackageOptions, parentPackageInfo?: string) {
  if (!packages.length) {
    return noop;
  }
  const dependencies: NodeDependency[] = getNodeDependencyList(
    getExternalDependenciesVersionRange(packages, packageJsonPath),
    type
  );
  return ngAddPackages(dependencies.map(({name}) => name), {
    ...options,
    skipConfirmation: true,
    version: dependencies.map(({version}) => version),
    parentPackageInfo,
    dependencyType: type,
    workingDirectory: options.workingDirectory
  });
}

/**
 * Register the given package in the Angular CLI schematics
 *
 * @param packageJson PackageJson of the project containing the collection to add to the project
 * @param angularJsonFile Path to the Angular.json file. Will use the workspace root's angular.json if not specified
 */
export function registerPackageCollectionSchematics(packageJson: PackageJson, angularJsonFile?: string): Rule {
  return (tree) => {
    if (!packageJson.name) {
      return tree;
    }
    const workspace = readAngularJson(tree, angularJsonFile);
    return writeAngularJson(tree, registerCollectionSchematics(workspace, packageJson.name), angularJsonFile);
  };
}

/**
 * Setup schematics default params in angular.json
 *
 * @param schematicsDefaultParams default params to setup by schematic
 * @param angularJsonFile Path to the Angular.json file. Will use the workspace root's angular.json if not specified
 */
export function setupSchematicsDefaultParams(schematicsDefaultParams: Record<string, SchematicOptionObject>, angularJsonFile?: string): Rule {
  return (tree: Tree) => {
    const workspace = readAngularJson(tree, angularJsonFile);
    workspace.schematics ||= {};
    Object.entries(schematicsDefaultParams).forEach(([schematicName, defaultParams]) => {
      workspace.schematics![schematicName] = {
        ...workspace.schematics![schematicName],
        ...defaultParams
      };
    });
    Object.values(workspace.projects).forEach((project) => {
      Object.entries(schematicsDefaultParams).forEach(([schematicName, defaultParams]) => {
        if (project.schematics?.[schematicName]) {
          project.schematics[schematicName] = {
            ...project.schematics[schematicName],
            ...defaultParams
          };
        }
      });
    });
    return writeAngularJson(tree, workspace, angularJsonFile);
  };
}
