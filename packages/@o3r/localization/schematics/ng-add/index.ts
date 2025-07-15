import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import type {
  PackageJson,
} from 'type-fest';
import {
  updateCmsAdapter,
} from '../cms-adapter';
import {
  registerDevtools,
} from './helpers/devtools-registration';
import type {
  NgAddSchematicsSchema,
} from './schema';

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall = [
  '@angular/cdk',
  '@angular/common',
  '@angular/core',
  '@angular/platform-browser-dynamic',
  '@formatjs/intl-numberformat',
  '@ngrx/store',
  '@ngx-translate/core',
  'intl-messageformat',
  'rxjs'
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  '@angular-devkit/core',
  'chokidar',
  'globby'
];

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @o3r/localization has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the localization package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
  throw reason;
};

/**
 * Add Otter localization to an Angular Project
 * @param options for the dependencies installations
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree, context) => {
    const {
      applyEsLintFix,
      getPackageInstallConfig,
      getProjectNewDependenciesTypes,
      getWorkspaceConfig,
      setupDependencies,
      getO3rPeerDeps,
      getExternalDependenciesInfo,
      registerPackageCollectionSchematics,
      setupSchematicsParamsForProject
    } = await import('@o3r/schematics');
    const { updateI18n, updateLocalization } = await import('../localization-base');
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson;

    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const projectDirectory = workspaceProject?.root || '.';
    const projectPackageJson = tree.readJson(path.posix.join(projectDirectory, 'package.json')) as PackageJson;
    const depsInfo = getO3rPeerDeps(packageJsonPath);
    context.logger.info(`The package ${depsInfo.packageName as string} comes with a debug mechanism`);
    context.logger.info('Get information on https://github.com/AmadeusITGroup/otter/tree/main/docs/localization/LOCALIZATION.md#Debugging');

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

    const externalDependenciesInfo = getExternalDependenciesInfo({
      devDependenciesToInstall,
      dependenciesToInstall,
      projectType: workspaceProject?.projectType,
      projectPackageJson,
      o3rPackageJsonPath: packageJsonPath
    },
    context.logger
    );

    const registerDevtoolRule = await registerDevtools(options);
    return chain([
      updateLocalization(options, __dirname),
      updateI18n(options),
      options.skipLinter ? noop() : applyEsLintFix(),
      setupDependencies({
        projectName: options.projectName,
        dependencies: {
          ...dependencies,
          ...externalDependenciesInfo
        },
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
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
