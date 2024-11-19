import { chain, noop, type Rule } from '@angular-devkit/schematics';
import { registerGenerateCssBuilder } from './register-generate-css';
import { extractToken } from '../extract-token';
import type { NgAddSchematicsSchema } from './schema';
import * as path from 'node:path';
import {
  createSchematicWithMetricsIfInstalled,
  getPackageInstallConfig,
  setupDependencies,
  setupSchematicsParamsForProject
} from '@o3r/schematics';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * Add Otter design to an Angular Project
 * @param options
 */
export function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return (tree) => {
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
export const ngAdd = (options: NgAddSchematicsSchema): Rule => createSchematicWithMetricsIfInstalled(ngAddFn)(options);
