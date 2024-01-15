import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createSchematicWithMetricsIfInstalled, registerPackageCollectionSchematics, setupSchematicsDefaultParams } from '@o3r/schematics';
import { updateCmsAdapter } from '../cms-adapter';
import type { NgAddSchematicsSchema } from './schema';
import { registerDevtools } from './helpers/devtools-registration';

const dependenciesToInstall = [
  'chokidar',
  'globby'
];

/**
 * Add Otter localization to an Angular Project
 * @param options for the dependencies installations
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const {
        applyEsLintFix,
        getPackageInstallConfig,
        getProjectNewDependenciesTypes,
        getWorkspaceConfig,
        setupDependencies,
        getO3rPeerDeps,
        getExternalDependenciesVersionRange
      } = await import('@o3r/schematics');
      const {updateI18n, updateLocalization} = await import('../localization-base');
      const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));
      const depsInfo = getO3rPeerDeps(packageJsonPath);
      context.logger.info(`The package ${depsInfo.packageName as string} comes with a debug mechanism`);
      context.logger.info('Get information on https://github.com/AmadeusITGroup/otter/tree/main/docs/localization/LOCALIZATION.md#Debugging');
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { NodeDependencyType } = await import('@schematics/angular/utility/dependencies');
      const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
      const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
        acc[dep] = {
          inManifest: [{
            range: `~${depsInfo.packageVersion}`,
            types: getProjectNewDependenciesTypes(workspaceProject)
          }]
        };
        return acc;
      }, getPackageInstallConfig(packageJsonPath, tree, options.projectName));
      Object.entries(getExternalDependenciesVersionRange(dependenciesToInstall, packageJsonPath)).forEach(([dep, range]) => {
        dependencies[dep] = {
          inManifest: [{
            range,
            types: [NodeDependencyType.Dev]
          }]
        };
      });
      const registerDevtoolRule = await registerDevtools(options);
      return () => chain([
        updateLocalization(options, __dirname),
        updateI18n(options),
        options.skipLinter ? noop() : applyEsLintFix(),
        setupDependencies({
          projectName: options.projectName,
          dependencies,
          ngAddToRun: depsInfo.o3rPeerDeps
        }),
        updateCmsAdapter(options),
        registerPackageCollectionSchematics(packageJson),
        setupSchematicsDefaultParams({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '@o3r/core:component*': {
            useLocalization: true
          }
        }),
        registerDevtoolRule
      ])(tree, context);
    } catch (e) {
      // o3r localization needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/localization has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the localization package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}

/**
 * Add Otter localization to an Angular Project
 * @param options for the dependencies installations
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
