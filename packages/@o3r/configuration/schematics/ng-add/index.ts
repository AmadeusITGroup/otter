import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  registerPackageCollectionSchematics,
  setupDependencies,
  setupSchematicsParamsForProject,
} from '@o3r/schematics';
import {
  registerDevtools,
} from './helpers/devtools-registration';
import type {
  NgAddSchematicsSchema,
} from './schema';

/**
 * Add Otter configuration to an Angular Project
 * @param options The options to pass to ng-add execution
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return (tree: Tree, context: SchematicContext) => {
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));
    const depsInfo = getO3rPeerDeps(packageJsonPath);
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
    context.logger.info(`The package ${depsInfo.packageName as string} comes with a debug mechanism`);
    context.logger.info('Get more information on the following page: https://github.com/AmadeusITGroup/otter/tree/main/docs/configuration/OVERVIEW.md#Runtime-debugging');
    const schematicsDefaultOptions = { useOtterConfig: undefined };
    return () => chain([
      registerPackageCollectionSchematics(packageJson),
      setupSchematicsParamsForProject({
        '@o3r/core:component': schematicsDefaultOptions,
        '@o3r/core:component-container': schematicsDefaultOptions,
        '@o3r/core:component-presenter': schematicsDefaultOptions
      }, options.projectName),
      setupDependencies({
        projectName: options.projectName,
        dependencies,
        ngAddToRun: depsInfo.o3rPeerDeps
      }),
      () => registerDevtools(options)
    ])(tree, context);
  };
}

/**
 * Add Otter configuration to an Angular Project
 * @param options The options to pass to ng-add execution
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
