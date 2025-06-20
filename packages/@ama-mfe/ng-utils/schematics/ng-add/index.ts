import * as path from 'node:path';
import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  applyEsLintFix,
  createOtterSchematic,
  getExternalDependenciesInfo,
  getPackageInstallConfig,
  getWorkspaceConfig,
  setupDependencies,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';
import type {
  NgAddSchematicsSchema,
} from './schema';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

const doCustomAction: Rule = (tree) => {
  // your custom code here
  return tree;
};

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall: string[] = [];

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall: string[] = [
  '@angular/common',
  '@angular/core',
  '@angular/router'
];

const dependenciesToNgAdd: string[] = [
  // Add the dependencies to install with NgAdd here
];

/**
 * Add ama mfe angular utils library
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return (tree, context) => {
    // current package version
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const projectDirectory = workspaceProject?.root || '.';
    const projectPackageJson = tree.readJson(path.posix.join(projectDirectory, 'package.json')) as PackageJson;
    const externalDependenciesInfo = getExternalDependenciesInfo({
      devDependenciesToInstall: devDependenciesToInstall,
      dependenciesToInstall: dependenciesToInstall,
      o3rPackageJsonPath: packageJsonPath,
      projectPackageJson,
      projectType: workspaceProject?.projectType
    },
    context.logger
    );
    const dependencies = getPackageInstallConfig(packageJsonPath, tree, options.projectName);
    return chain([
      // optional custom action dedicated to this module
      doCustomAction,
      options.skipLinter ? noop() : applyEsLintFix(),
      setupDependencies({
        projectName: options.projectName,
        dependencies: {
          ...dependencies,
          ...externalDependenciesInfo
        },
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
