import {chain, externalSchematic, Rule, RuleFactory, SchematicContext, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {lastValueFrom} from 'rxjs';
import {PackageJson} from 'type-fest';
import {NgAddPackageOptions} from '../../tasks/index';

/**
 * Install via `ng add` a list of npm packages.
 *
 * @param packages List of packages to be installed via `ng add`
 * @param options install options
 */
export function ngAddPackages(packages: string[], options?: NgAddPackageOptions, packageJsonPath = '/package.json'): Rule {
  const getInstalledVersion = async (packageName: string) => {
    try {
      return (await import(`${packageName}/package.json`)).version;
    } catch (e) {
      return;
    }
  };
  const getOptions = (packageName: string, context: SchematicContext) => {
    try {
      const collection = context.engine.createCollection(packageName);
      const schemaOptions = (collection.createSchematic('ng-add').description as any).schemaJson?.properties || {};
      return Object.entries(options || {}).reduce((accOptions, [key, value]: [string, any]) => {
        if (schemaOptions[key]) {
          accOptions[key] = value;
        }
        return accOptions;
      }, {});
    } catch {
      context.logger.info(`Could not find ${packageName}:ng-add properties`);
      return {};
    }
  };
  const ruleFactory: RuleFactory<{ packageName: string; version?: string }> = ({packageName, version}) => {
    return async (tree: Tree, context: SchematicContext) => {
      try {
        const installedVersion: string = await getInstalledVersion(packageName);
        context.logger.info(`installed version of ${packageName}: ${installedVersion || 'undefined'} | expected: ${options?.version || 'latest'} `);
        if (!installedVersion || version !== installedVersion) {
          context.logger.info(`Running ng add for: ${packageName}@${options?.version ? ' with version: ' + options.version : ''}`);
          context.addTask(new NodePackageInstallTask({
            packageManager: 'yarn',
            packageName: packageName + (version ? `@${version}` : '') + (options?.dependencyType === 'dev' ? ' --prefer-dev' : ''),
            hideOutput: false,
            quiet: false
          } as any));
          await lastValueFrom(context.engine.executePostTasks());

          const ngAddOptions = getOptions(packageName, context);
          const latestInstalledVersion: string = await getInstalledVersion(packageName);
          const packageJson: PackageJson = JSON.parse(tree.read(packageJsonPath)!.toString());
          packageJson.dependencies = {...packageJson.dependencies, [packageName]: latestInstalledVersion};
          tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
          return () => chain([
            externalSchematic(packageName, 'ng-add', ngAddOptions)
          ])(tree, context);
        } else {
          context.logger.info(`Skipping ng add for: ${packageName}${options?.version ? ' with version: ' + options.version : ''}`);
          return () => tree;
        }
      } catch (e) {
        context.logger.error(`Failed to run ng-add for ${packageName}`);
        return () => tree;
      }
    };
  };

  const ngAddToRun: Rule[] = (packages || []).map((packageName) => ruleFactory({packageName, version: options?.version}));
  return chain(ngAddToRun);
}
