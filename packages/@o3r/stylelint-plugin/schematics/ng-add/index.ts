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

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall: string[] = [
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  'postcss',
  'postcss-scss',
  'stylelint'
];

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @o3r/stylelint-plugin has failed.
If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the mobile package. Please run 'ng add @o3r/core' .
Otherwise, use the error message as guidance.`);
  throw reason;
};

/**
 * Add Otter stylelint-plugin to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree, context) => {
    const {
      getExternalDependenciesInfo,
      getPackageInstallConfig,
      getProjectNewDependenciesTypes,
      getO3rPeerDeps,
      getWorkspaceConfig,
      setupDependencies
    } = await import('@o3r/schematics');

    const depsInfo = getO3rPeerDeps(packageJsonPath);
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const projectDirectory = workspaceProject?.root || '.';
    const projectPackageJson = tree.readJson(path.posix.join(projectDirectory, 'package.json')) as PackageJson;
    const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
      acc[dep] = {
        inManifest: [{
          range: `~${depsInfo.packageVersion}`,
          types: getProjectNewDependenciesTypes(workspaceProject)
        }]
      };
      return acc;
    }, getPackageInstallConfig(packageJsonPath, tree, options.projectName, true, !!options.exactO3rVersion));
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
        ...dependencies,
        ...externalDependenciesInfo
      }
    });
  };
}

/**
 * Add Otter stylelint-plugin to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
