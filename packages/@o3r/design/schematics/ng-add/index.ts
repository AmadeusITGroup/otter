import { chain, noop, type Rule } from '@angular-devkit/schematics';
import { registerGenerateCssBuilder } from './register-generate-css';
import { extractToken } from '../extract-token';
import type { NgAddSchematicsSchema } from './schema';
import * as path from 'node:path';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @o3r/design has failed.
You need to install '@o3r/schematics' to be able to use the o3r apis-manager package. Please run 'ng add @o3r/schematics'.`);
  throw reason;
};

/**
 * Add Otter design to an Angular Project
 * @param options
 */
export function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree) => {
    const { getPackageInstallConfig, setupDependencies, setupSchematicsParamsForProject } = await import('@o3r/schematics');
    return chain([
      registerGenerateCssBuilder(options.projectName),
      setupSchematicsParamsForProject({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component': {
          useOtterDesignToken: true
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component-presenter': {
          useOtterDesignToken: true
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '*:*': {
          useOtterDesignToken: true
        }
      }, options.projectName),
      setupDependencies({
        projectName: options.projectName,
        dependencies: getPackageInstallConfig(packageJsonPath, tree, options.projectName, false, !!options.exactO3rVersion)
      }),
      options.extractDesignToken ? extractToken({ componentFilePatterns: ['**/*.scss'], includeTags: true }) : noop
    ]);
  };
}

/**
 * Add Otter design to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
