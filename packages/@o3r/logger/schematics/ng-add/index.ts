import * as path from 'node:path';
import type {
  Rule,
} from '@angular-devkit/schematics';
import type {
  NgAddSchematicsSchema,
} from './schema';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall = [
  '@angular/core',
  '@ngrx/store'
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  '@angular/platform-browser-dynamic'
];

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @o3r/logger has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the logger package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
  throw reason;
};

/**
 * Add Otter logger to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree, context) => {
    const {
      getExternalDependenciesInfo,
      getPackageInstallConfig,
      setupDependencies,
      getWorkspaceConfig
    } = await import('@o3r/schematics');
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const projectDirectory = workspaceProject?.root || '.';
    const projectJsonPath = path.posix.join(projectDirectory, 'package.json');

    const externalDependenciesInfo = getExternalDependenciesInfo({
      devDependenciesToInstall,
      dependenciesToInstall,
      projectType: workspaceProject?.projectType,
      o3rPackageJsonPath: packageJsonPath,
      projectPackageJsonPath: projectJsonPath
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

/**
 * Add Otter logger to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const {
    createOtterSchematic
  } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createOtterSchematic(ngAddFn)(options);
};
