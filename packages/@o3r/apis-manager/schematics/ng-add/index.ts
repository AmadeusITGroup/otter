import * as path from 'node:path';
import {
  chain,
  noop,
  type Rule,
} from '@angular-devkit/schematics';
import type {
  NgAddSchematicsSchema,
} from './schema';

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @o3r/apis-manager has failed.
You need to install '@o3r/schematics' to be able to use the o3r apis-manager package. Please run 'ng add @o3r/schematics'.`);
  throw reason;
};

/**
 * Add Otter apis manager to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree) => {
    const { getPackageInstallConfig } = await import('@o3r/schematics');
    const { setupDependencies, getO3rPeerDeps, applyEsLintFix, getWorkspaceConfig, getProjectNewDependenciesTypes } = await import('@o3r/schematics');
    const { updateApiDependencies } = await import('../helpers/update-api-deps');
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const depsInfo = getO3rPeerDeps(packageJsonPath);
    const rulesToExecute: Rule[] = [];
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const projectType = workspaceProject?.projectType || 'application';
    if (projectType === 'application') {
      rulesToExecute.push(updateApiDependencies(options));
    }

    if (!options.skipCodeSample) {
      depsInfo.o3rPeerDeps.push('@ama-sdk/client-fetch');
    }

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

    return () => chain([
      ...rulesToExecute,
      options.skipLinter ? noop : applyEsLintFix(),
      setupDependencies({
        projectName: options.projectName,
        dependencies,
        ngAddToRun: depsInfo.o3rPeerDeps
      })
    ]);
  };
}

/**
 * Add Otter apis manager to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
