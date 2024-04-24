import type { Rule } from '@angular-devkit/schematics';
import * as path from 'node:path';
import type { NgAddSchematicsSchema } from './schema';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @o3r/apis-manager has failed.
You need to install '@o3r/schematics' to be able to use the o3r apis-manager package. Please run 'ng add @o3r/schematics' .`);
  throw reason;
};

/**
 * Add Otter dynamic-content to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree) => {
    const { getPackageInstallConfig, setupDependencies } = await import('@o3r/schematics');
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
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
