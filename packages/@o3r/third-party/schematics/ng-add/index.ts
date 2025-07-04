import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  type Rule,
} from '@angular-devkit/schematics';
import type {
  PackageJson,
} from 'type-fest';
import type {
  NgAddSchematicsSchema,
} from './schema';

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @o3r/third-party has failed.
If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the configuration package. Please run 'ng add @o3r/core' .
Otherwise, use the error message as guidance.`);
  throw reason;
};

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall = [
  'rxjs'
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall: string[] = [
];

/**
 * Add Otter third-party to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree, context) => {
    const { getExternalDependenciesInfo, getPackageInstallConfig, getWorkspaceConfig, registerPackageCollectionSchematics, setupDependencies } = await import('@o3r/schematics');
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));
    const projectDirectory = workspaceProject?.root || '.';
    const projectPackageJson = tree.readJson(path.posix.join(projectDirectory, 'package.json')) as PackageJson;
    const externalDependenciesInfo = getExternalDependenciesInfo({
      devDependenciesToInstall,
      dependenciesToInstall,
      projectType: workspaceProject?.projectType,
      projectPackageJson,
      o3rPackageJsonPath: packageJsonPath
    },
    context.logger
    );
    return chain([
      registerPackageCollectionSchematics(packageJson),
      setupDependencies({
        projectName: options.projectName,
        dependencies: {
          ...getPackageInstallConfig(packageJsonPath, tree, options.projectName, false, !!options.exactO3rVersion),
          ...externalDependenciesInfo
        }
      })
    ]);
  };
}

/**
 * Add Otter third-party to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const {
    createOtterSchematic
  } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createOtterSchematic(ngAddFn)(options);
};
