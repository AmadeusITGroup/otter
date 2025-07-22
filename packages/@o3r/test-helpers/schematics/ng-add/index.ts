import * as path from 'node:path';
import {
  chain,
  noop,
  type Rule,
} from '@angular-devkit/schematics';
import type {
  DependencyToAdd,
} from '@o3r/schematics';
import type {
  NgAddSchematicsSchema,
} from './schema';

const doCustomAction: Rule = (tree, _context) => {
  // your custom code here
  return tree;
};

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @o3r/test-helpers has failed.
If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the test-helpers package. Please run 'ng add @o3r/core' .
Otherwise, use the error message as guidance.`);
  throw reason;
};

/**
 * Add Otter test-helpers to an Otter Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree) => {
    // use dynamic import to properly raise an exception if it is not an Otter project.
    const { getWorkspaceConfig, applyEsLintFix, setupDependencies, getO3rPeerDeps, getProjectNewDependenciesTypes } = await import('@o3r/schematics');
    // retrieve dependencies following the /^@o3r\/.*/ pattern within the peerDependencies of the current module
    const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'));
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
    }, {} as Record<string, DependencyToAdd>);
    return chain([
      // optional custom action dedicated to this module
      doCustomAction,
      options.skipLinter ? noop() : applyEsLintFix(),
      // add the missing Otter modules in the current project
      setupDependencies({
        projectName: options.projectName,
        dependencies,
        ngAddToRun: depsInfo.o3rPeerDeps
      })
    ]);
  };
}

/**
 * Add Otter test-helpers to an Otter Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
