import * as path from 'node:path';
import {
  chain,
  noop,
  type Rule,
} from '@angular-devkit/schematics';
import {
  extractToken,
} from '../extract-token';
import {
  registerGenerateCssBuilder,
} from './register-generate-css';
import type {
  NgAddSchematicsSchema,
} from './schema';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * Add Otter design to an Angular Project
 * @param options
 */
export function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree) => {
    const { getPackageInstallConfig, setupDependencies, setupSchematicsParamsForProject } = await import('@o3r/schematics');
    const schematicsDefaultOptions = {
      useOtterDesignToken: true
    };
    return chain([
      registerGenerateCssBuilder(options.projectName),
      setupSchematicsParamsForProject({
        '@o3r/core:component': schematicsDefaultOptions,
        '@o3r/core:component-presenter': schematicsDefaultOptions,
        '*:*': schematicsDefaultOptions
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
  const missingSchematicDependencyMessage = 'Missing @o3r/schematics';
  try {
    const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics').catch(() => {
      throw new Error(missingSchematicDependencyMessage);
    });
    return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
  } catch (err) {
    if (err instanceof Error && err.message === missingSchematicDependencyMessage) {
      logger.warn(`[WARNING]: The run of the ng-add schematics of @o3r/design has failed, the setup of default features will not be done.
The failure is due to miss of the package '@o3r/schematics'.
To get benefit of the setup scripts, please run 'ng add @o3r/schematics' before.`);
    } else {
      throw err;
    }
  }
};
