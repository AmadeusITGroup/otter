import * as path from 'node:path';
import type {
  Rule,
} from '@angular-devkit/schematics';
import type {
  NgAddSchematicsSchema,
} from './schema';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
const dependenciesToInstall = [
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
      getExternalDependenciesVersionRange,
      getPackageInstallConfig,
      getProjectNewDependenciesTypes,
      getO3rPeerDeps,
      getWorkspaceConfig,
      setupDependencies
    } = await import('@o3r/schematics');

    const { NodeDependencyType } = await import('@schematics/angular/utility/dependencies');
    const depsInfo = getO3rPeerDeps(packageJsonPath);
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
      acc[dep] = {
        inManifest: [{
          range: `~${depsInfo.packageVersion}`,
          types: getProjectNewDependenciesTypes(workspaceProject)
        }]
      };
      return acc;
    }, getPackageInstallConfig(packageJsonPath, tree, options.projectName, true, !!options.exactO3rVersion));
    Object.entries(getExternalDependenciesVersionRange(dependenciesToInstall, packageJsonPath, context.logger)).forEach(([dep, range]) => {
      dependencies[dep] = {
        inManifest: [{
          range,
          types: [NodeDependencyType.Dev]
        }]
      };
    });
    return setupDependencies({
      projectName: options.projectName,
      dependencies
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
