import * as path from 'node:path';
import {
  chain,
  noop,
  type Rule,
} from '@angular-devkit/schematics';
import {
  applyEsLintFix,
  createOtterSchematic,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  setupDependencies,
} from '@o3r/schematics';
import type {
  NgAddSchematicsSchema,
} from './schema';

/**
 * Add Otter apis manager to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return (tree) => {
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const depsInfo = getO3rPeerDeps(packageJsonPath);
    const rulesToExecute: Rule[] = [];
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;

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
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
