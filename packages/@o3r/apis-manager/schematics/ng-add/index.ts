import * as path from 'node:path';
import {
  chain,
  type Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  getWorkspaceConfig,
  ngAddSchematicWrapper,
} from '@o3r/schematics';
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

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * Add Otter apis manager to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree) => {
    const { updateApiDependencies } = await import('../helpers/update-api-deps');
    const rulesToExecute: Rule[] = [];
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const projectType = workspaceProject?.projectType || 'application';
    if (projectType === 'application') {
      rulesToExecute.push(updateApiDependencies(options));
    }

    return chain(rulesToExecute);
  };
}

/**
 * Add Otter apis manager to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(
  ngAddSchematicWrapper(
    packageJsonPath,
    {
      dep: dependenciesToInstall,
      devDep: devDependenciesToInstall
    },
    ngAddFn,
    undefined,
    options.skipCodeSample ? {} : { ngAddToRun: ['@ama-sdk/client-fetch'] }
  )
)(options);
