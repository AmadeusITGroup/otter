import * as path from 'node:path';
import type {
  Rule
} from '@angular-devkit/schematics';
import type {
  NgAddSchematicsSchema
} from './schema';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @o3r/routing has failed.
If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the mobile package. Please run 'ng add @o3r/core' .
Otherwise, use the error message as guidance.`);
  throw reason;
};
/**
 * Add Otter routing to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree) => {
    const { getPackageInstallConfig, setupDependencies } = await import('@o3r/schematics');
    return setupDependencies({
      projectName: options.projectName,
      dependencies: getPackageInstallConfig(packageJsonPath, tree, options.projectName, false, !!options.exactO3rVersion)
    });
  };
}

/**
 * Add Otter routing to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
