import * as path from 'node:path';
import type {
  Rule,
} from '@angular-devkit/schematics';
import type {
  PackageJson,
} from 'type-fest';
import type {
  NgAddSchematicsSchema,
} from './schema';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @o3r/analytics has failed.
If the error is related to missing @o3r dependencies you need to install '@o3r/core'. Please run 'ng add @o3r/core'.
Otherwise, use the error message as guidance.`);
  throw reason;
};

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall = [
  '@angular/common',
  '@angular/core',
  '@angular/router',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',
  '@ngrx/store',
  'rxjs'
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall: string[] = [
];

/**
 * Add Otter analytics to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree, context) => {
    const { getExternalDependenciesInfo, getPackageInstallConfig, getWorkspaceConfig, setupDependencies } = await import('@o3r/schematics');
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const projectDirectory = workspaceProject?.root || '.';
    const projectPackageJson = tree.readJson(path.posix.join(projectDirectory, 'package.json')) as PackageJson;

    const externalDependenciesInfo = getExternalDependenciesInfo({
      devDependenciesToInstall,
      dependenciesToInstall,
      projectPackageJson,
      o3rPackageJsonPath: packageJsonPath,
      projectType: workspaceProject?.projectType
    },
    context.logger
    );
    return setupDependencies({
      projectName: options.projectName,
      dependencies: {
        ...getPackageInstallConfig(packageJsonPath, tree, options.projectName, false, !!options.exactO3rVersion),
        ...externalDependenciesInfo
      }
    });
  };
}

export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const {
    createOtterSchematic
  } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createOtterSchematic(ngAddFn)(options);
};
