import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  applyEsLintFix,
  createOtterSchematic,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  setupDependencies,
} from '@o3r/schematics';
import type {
  NgAddSchematicsSchema,
} from './schema';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

const doCustomAction: Rule = (tree) => {
  // your custom code here
  return tree;
};

const dependenciesToInstall: string[] = [
  // Add the dependencies to install here
];

const dependenciesToNgAdd: string[] = [
  // Add the dependencies to install with NgAdd here
];

/**
 * Add ama mfe angular utils library
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return (tree) => {
    // current package version
    const version = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' })).version;
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const dependencies = [...dependenciesToInstall, ...dependenciesToNgAdd].reduce((acc, dep) => {
      acc[dep] = {
        inManifest: [{
          range: `~${version}`,
          types: getProjectNewDependenciesTypes(workspaceProject)
        }]
      };
      return acc;
    }, getPackageInstallConfig(packageJsonPath, tree, options.projectName));
    return chain([
      // optional custom action dedicated to this module
      doCustomAction,
      options.skipLinter ? noop() : applyEsLintFix(),
      setupDependencies({
        projectName: options.projectName,
        dependencies,
        ngAddToRun: dependenciesToNgAdd,
        skipInstall: options.skipInstall
      })
    ]);
  };
}

/**
 * Add module to an Angular Project
 * @param options ng add options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
