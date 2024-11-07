import * as path from 'node:path';
import type {
  Rule,
} from '@angular-devkit/schematics';
import type {
  NgAddSchematicsSchema,
} from './schema';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * Add Otter new version to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree) => {
    const { getPackageInstallConfig, setupDependencies } = await import('@o3r/schematics');

    return setupDependencies({
      projectName: options.projectName,
      dependencies: getPackageInstallConfig(packageJsonPath, tree, options.projectName, true, !!options.exactO3rVersion)
    });
  };
}

export const ngAdd = (options: NgAddSchematicsSchema): Rule => async () => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics');
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
