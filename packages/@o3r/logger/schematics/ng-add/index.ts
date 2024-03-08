import type { Rule } from '@angular-devkit/schematics';
import type { NgAddSchematicsSchema } from './schema';
import * as path from 'node:path';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @o3r/logger has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the logger package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
  throw reason;
};

/**
 * Add Otter logger to an Angular Project
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
 * Add Otter logger to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
