import { chain, noop, type Rule } from '@angular-devkit/schematics';
import { registerGenerateCssBuilder } from './register-generate-css';
import { extractToken } from '../extract-token';
import { getPackageInstallConfig, setupDependencies, setupSchematicsDefaultParams } from '@o3r/schematics';
import type { NgAddSchematicsSchema } from './schema';
import * as path from 'node:path';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * Add Otter design to an Angular Project
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return (tree) => chain([
    registerGenerateCssBuilder(),
    setupSchematicsDefaultParams({
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
    }),
    setupDependencies({
      projectName: options.projectName,
      dependencies: getPackageInstallConfig(packageJsonPath, tree, options.projectName)
    }),
    options.extractDesignToken ? extractToken({ componentFilePatterns: ['**/*.scss'], includeTags: true }) : noop
  ]);
}
