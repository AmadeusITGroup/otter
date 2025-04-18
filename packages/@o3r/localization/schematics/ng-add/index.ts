import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  applyEsLintFix,
  createOtterSchematic,
  getExternalDependenciesVersionRange,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  registerPackageCollectionSchematics,
  setupDependencies,
  setupSchematicsParamsForProject,
} from '@o3r/schematics';
import {
  updateCmsAdapter,
} from '../cms-adapter';
import {
  registerDevtools,
} from './helpers/devtools-registration';
import type {
  NgAddSchematicsSchema,
} from './schema';

const dependenciesToInstall = [
  'chokidar',
  'globby'
];

/**
 * Add Otter localization to an Angular Project
 * @param options for the dependencies installations
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree, context) => {
    const { updateI18n, updateLocalization } = await import('../localization-base');
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));
    const depsInfo = getO3rPeerDeps(packageJsonPath);
    context.logger.info(`The package ${depsInfo.packageName as string} comes with a debug mechanism`);
    context.logger.info('Get information on https://github.com/AmadeusITGroup/otter/tree/main/docs/localization/LOCALIZATION.md#Debugging');

    const { NodeDependencyType } = await import('@schematics/angular/utility/dependencies');
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
      acc[dep] = {
        inManifest: [{
          range: `${options.exactO3rVersion ? '' : '~'}${depsInfo.packageVersion}`,
          types: getProjectNewDependenciesTypes(workspaceProject)
        }],
        ngAddOptions: { exactO3rVersion: options.exactO3rVersion }
      };
      return acc;
    }, getPackageInstallConfig(packageJsonPath, tree, options.projectName, false, !!options.exactO3rVersion));
    Object.entries(getExternalDependenciesVersionRange(dependenciesToInstall, packageJsonPath, context.logger)).forEach(([dep, range]) => {
      dependencies[dep] = {
        inManifest: [{
          range,
          types: [NodeDependencyType.Dev]
        }]
      };
    });
    const registerDevtoolRule = registerDevtools(options);
    return chain([
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
      setupSchematicsParamsForProject({ '@o3r/core:component*': { useLocalization: true } }, options.projectName),
      registerDevtoolRule
    ]);
  };
}

/**
 * Add Otter localization to an Angular Project
 * @param options for the dependencies installations
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
