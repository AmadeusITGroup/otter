import * as path from 'node:path';
import type {
  Rule
} from '@angular-devkit/schematics';
import type {
  NgAddSchematicsSchema
} from './schema';

/**
 * Add Otter training tools to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree) => {
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const { getPackageInstallConfig, setupDependencies } = await import('@o3r/schematics');
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
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async () => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics');
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
