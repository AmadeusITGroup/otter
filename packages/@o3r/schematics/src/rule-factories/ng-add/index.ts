import { chain, externalSchematic, Rule, RuleFactory, Schematic, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import type { NodeDependency } from '@schematics/angular/utility/dependencies';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { lastValueFrom } from 'rxjs';
import type { PackageJson } from 'type-fest';
import type { NgAddPackageOptions } from '../../tasks/index';
import { getExternalDependenciesVersionRange, getNodeDependencyList, getPackageManager, readAngularJson, registerCollectionSchematics, writeAngularJson } from '../../utility/index';

/**
 * Install via `ng add` a list of npm packages.
 *
 * @param packages List of packages to be installed via `ng add`
 * @param options install options
 * @param packageJsonPath path of the package json of the project where they will be installed
 */
export function ngAddPackages(packages: string[], options?: NgAddPackageOptions, packageJsonPath = '/package.json'): Rule {
  const getInstalledVersion = async (packageName: string) => {
    try {
      return (await import(`${packageName}/package.json`)).version;
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
    return Object.entries(options || {}).reduce((accOptions, [key, value]: [string, any]) => {
      if (schemaOptions[key]) {
        accOptions[key] = value;
      }
      return accOptions;
    }, {});
  };

  const checkTreePackageJsonConsistency = (packageName: string) => {
    return async (tree: Tree) => {
      const latestInstalledVersion: string = await getInstalledVersion(packageName);
      // We need to update manually the package json in the tree as the tree will overwrite the project at the end of the ng add @o3r/core
      const packageJson: PackageJson = tree.readJson(packageJsonPath) as PackageJson;
      if (options?.dependencyType === NodeDependencyType.Dev) {
        packageJson.devDependencies = {...packageJson.devDependencies, [packageName]: latestInstalledVersion};
      } else if (options?.dependencyType === NodeDependencyType.Peer) {
        packageJson.peerDependencies = {...packageJson.peerDependencies, [packageName]: latestInstalledVersion};
      } else {
        packageJson.dependencies = {...packageJson.dependencies, [packageName]: latestInstalledVersion};
      }
      tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
      return () => tree;
    };
  };

  const ngAddSinglePackage: RuleFactory<{ packageName: string; version?: string }> = ({packageName, version}) => {
    return async (tree: Tree, context: SchematicContext) => {
      const installedVersion: string = await getInstalledVersion(packageName);
      context.logger.info(`installed version of ${packageName}: ${installedVersion || 'undefined'} | expected: ${options?.version || 'latest'} as ${options?.dependencyType?.toString() || ''}`);
      if (!installedVersion || version !== installedVersion) {
        context.logger.info(`Running ng add for: ${packageName}${options?.version ? ' with version: ' + options.version : ''}`);
        const packageManager = getPackageManager();
        let installOptions = '';
        if (options?.dependencyType === NodeDependencyType.Dev && packageManager === 'yarn') {
          installOptions = ' --prefer-dev';
        } else if (options?.dependencyType === NodeDependencyType.Dev) {
          installOptions = ' -D';
        } else if (options?.dependencyType === NodeDependencyType.Peer) {
          installOptions = ' -P';
        }
        context.addTask(new NodePackageInstallTask({
          packageManager: packageManager,
          packageName: packageName + (version ? `@${version}` : '') + installOptions,
          hideOutput: false,
          quiet: false
        } as any));
        await lastValueFrom(context.engine.executePostTasks());

        const ngAddCollection = getNgAddSchema(packageName, context);
        if (ngAddCollection) {
          const ngAddOptions = getOptions(ngAddCollection);
          return () => externalSchematic(packageName, 'ng-add', ngAddOptions)(tree, context);
        }
      } else {
        context.logger.info(`Skipping ng add for: ${packageName}${options?.version ? ' with version: ' + options.version : ''}`);
      }
      return () => (tree);
    };
  };

  const ngAddRulesToRun: Rule[] = (packages || []).map((packageName) => chain([
    ngAddSinglePackage({packageName, version: options?.version}),
    checkTreePackageJsonConsistency(packageName)]
  ));
  return chain(ngAddRulesToRun);
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
  const dependencies: NodeDependency[] = getNodeDependencyList(
    getExternalDependenciesVersionRange(packages, packageJsonPath),
    type
  );
  const externalPeerDepsRules: Rule[] = dependencies.map((dependency) => {
    return ngAddPackages([dependency.name], {
      ...options,
      skipConfirmation: true,
      version: dependency.version,
      parentPackageInfo,
      dependencyType: dependency.type
    });
  });
  return chain(externalPeerDepsRules);
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
export function setupSchematicsDefaultParams(schematicsDefaultParams: Record<string, Record<string, any>>, angularJsonFile?: string): Rule {
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
