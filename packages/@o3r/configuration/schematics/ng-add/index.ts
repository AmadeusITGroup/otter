import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  registerDevtools,
} from './helpers/devtools-registration';
import type {
  NgAddSchematicsSchema,
} from './schema';

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @o3r/configuration has failed.
If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the configuration package. Please run 'ng add @o3r/core' .
Otherwise, use the error message as guidance.`);
  throw reason;
};

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall = [
  '@angular/core',
  '@ngrx/entity',
  '@ngrx/store',
  'rxjs'
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  '@angular/platform-browser-dynamic',
  'rxjs'
];

/**
 * Add Otter configuration to an Angular Project
 * @param options The options to pass to ng-add execution
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree: Tree, context: SchematicContext) => {
    const {
      setupDependencies,
      getExternalDependenciesInfo,
      getProjectNewDependenciesTypes,
      getWorkspaceConfig,
      getO3rPeerDeps,
      registerPackageCollectionSchematics,
      setupSchematicsParamsForProject,
      getPackageInstallConfig
    } = await import('@o3r/schematics');
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

    const projectDirectory = workspaceProject?.root || '.';
    const projectJsonPath = path.posix.join(projectDirectory, 'package.json');

    const externalDependenciesInfo = getExternalDependenciesInfo({
      devDependenciesToInstall,
      dependenciesToInstall,
      o3rPackageJsonPath: packageJsonPath,
      projectType: workspaceProject?.projectType,
      projectPackageJsonPath: projectJsonPath
    },
    context.logger
    );

    return () => chain([
      registerPackageCollectionSchematics(packageJson),
      setupSchematicsParamsForProject({
        '@o3r/core:component': schematicsDefaultOptions,
        '@o3r/core:component-container': schematicsDefaultOptions,
        '@o3r/core:component-presenter': schematicsDefaultOptions
      }, options.projectName),
      setupDependencies({
        projectName: options.projectName,
        dependencies: {
          ...dependencies,
          ...externalDependenciesInfo
        },
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
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const {
    createOtterSchematic
  } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createOtterSchematic(ngAddFn)(options);
};
