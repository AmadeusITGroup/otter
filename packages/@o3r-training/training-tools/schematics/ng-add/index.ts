import type { Rule } from '@angular-devkit/schematics';
import * as path from 'node:path';
import type { NgAddSchematicsSchema } from './schema';
import {
  createSchematicWithMetricsIfInstalled,
  getPackageInstallConfig,
  setupDependencies
} from '@o3r/schematics';

/**
 * Add Otter training tools to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return (tree) => {
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    return setupDependencies({
      projectName: options.projectName,
      dependencies: getPackageInstallConfig(packageJsonPath, tree, options.projectName, false)
    });
  };
}

/**
 * Add Otter training tools to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => createSchematicWithMetricsIfInstalled(ngAddFn)(options);
