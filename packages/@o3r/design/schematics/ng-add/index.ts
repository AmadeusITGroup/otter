import * as path from 'node:path';
import {
  chain,
  noop,
  type Rule,
} from '@angular-devkit/schematics';
import {
  applyEditorConfig,
  createOtterSchematic,
  getPackageInstallConfig,
  setupDependencies,
  setupSchematicsParamsForProject,
} from '@o3r/schematics';
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
  return (tree) => {
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
      options.extractDesignToken ? extractToken({ componentFilePatterns: ['**/*.scss'], includeTags: true }) : noop,
      options.skipLinter ? noop() : applyEditorConfig()
    ]);
  };
}

/**
 * Add Otter design to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
