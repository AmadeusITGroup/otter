import { chain, externalSchematic, Rule, RuleFactory, Schematic, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { getPackageManager } from '@o3r/dev-tools';
import { lastValueFrom } from 'rxjs';
import type { PackageJson } from 'type-fest';
import type { NgAddPackageOptions } from '../../tasks/index';
import { getPeerDepVersion } from '../../utility';

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
      packageJson.dependencies = {...packageJson.dependencies, [packageName]: latestInstalledVersion};
      tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
      return () => tree;
    };
  };

  const ngAddSinglePackage: RuleFactory<{ packageName: string; version?: string }> = ({packageName, version}) => {
    return async (tree: Tree, context: SchematicContext) => {
      const installedVersion: string = await getInstalledVersion(packageName);
      context.logger.info(`installed version of ${packageName}: ${installedVersion || 'undefined'} | expected: ${options?.version || 'latest'} `);
      if (!installedVersion || version !== installedVersion) {
        context.logger.info(`Running ng add for: ${packageName}${options?.version ? ' with version: ' + options.version : ''}`);
        context.addTask(new NodePackageInstallTask({
          packageManager: getPackageManager(),
          packageName: packageName + (version ? `@${version}` : '') + (options?.dependencyType === 'dev' ? ' --prefer-dev' : ''),
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
 * @param parentPackageInfo for logging purposes
 */
export function ngAddPeerDependencyPackages(packages: string[], packageJsonPath: string, parentPackageInfo?: string) {
  const externalPeerDepsRules: Rule[] = packages.map((dependency) => {
    const version = getPeerDepVersion(packageJsonPath, dependency);
    return ngAddPackages([dependency], {skipConfirmation: true, version, parentPackageInfo});
  });
  return chain(externalPeerDepsRules);
}
