import * as path from 'node:path';
import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  getPackageInstallConfig,
  setupDependencies,
} from '@o3r/schematics';
import type {
  NgAddSchematicsSchema,
} from './schema';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * Add Otter dynamic-content to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return (tree) => {
    return setupDependencies({
      projectName: options.projectName,
      dependencies: getPackageInstallConfig(packageJsonPath, tree, options.projectName, false, !!options.exactO3rVersion)
    });
  };
}

/**
 * Add Otter dynamic-content to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
