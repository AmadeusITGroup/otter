import * as path from 'node:path';
import {
  chain,
  noop,
  type Rule,
} from '@angular-devkit/schematics';
import {
  applyEsLintFix,
  createOtterSchematic,
  getWorkspaceConfig,
  ngAddDependenciesRule,
} from '@o3r/schematics';
import {
  updateApiDependencies,
} from '../helpers/update-api-deps';
import type {
  NgAddSchematicsSchema,
} from './schema';

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall = [
  '@angular/common',
  '@angular/core',
  'rxjs'
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall: string[] = [];

/**
 * Add Otter apis manager to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
  return chain([
    (tree) => {
      const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
      const projectType = workspaceProject?.projectType || 'application';
      if (projectType === 'application') {
        return updateApiDependencies(options);
      }
    },
    options.skipLinter ? noop : applyEsLintFix(),
    ngAddDependenciesRule(options, packageJsonPath, {
      dependenciesToInstall: dependenciesToInstall.concat(
        options.skipCodeSample ? [] : ['@ama-sdk/client-fetch']
      ),
      devDependenciesToInstall
    })
  ]);
}

/**
 * Add Otter apis manager to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
