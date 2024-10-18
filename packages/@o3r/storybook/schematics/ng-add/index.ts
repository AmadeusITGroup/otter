import * as path from 'node:path';
import {
  chain,
  noop,
  type Rule
} from '@angular-devkit/schematics';
import type {
  NgAddSchematicsSchema
} from './schema';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @o3r/storybook has failed.
If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the storybook package. Please run 'ng add @o3r/core' .
Otherwise, use the error message as guidance.`);
  throw reason;
};

/**
 * Add Otter storybook to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree) => {
    const { applyEsLintFix, getPackageInstallConfig, setupDependencies, getO3rPeerDeps, getProjectNewDependenciesTypes, getWorkspaceConfig, removePackages } = await import('@o3r/schematics');
    const { updateStorybook } = await import('../storybook-base');
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
    return chain([
      removePackages(['@otter/storybook']),
      updateStorybook(options, __dirname),
      options.skipLinter ? noop() : applyEsLintFix(),
      setupDependencies({
        projectName: options.projectName,
        dependencies,
        ngAddToRun: depsInfo.o3rPeerDeps
      })
    ]);
  };
}

/**
 * Add Otter storybook to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
