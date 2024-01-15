import { chain, type Rule } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled } from '@o3r/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { NgAddSchematicsSchema } from './schema';

/**
 * Add Otter third-party to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree, context) => {
    try {
      const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));
      const { getPackageInstallConfig, registerPackageCollectionSchematics, setupDependencies } = await import('@o3r/schematics');
      return chain([
        registerPackageCollectionSchematics(packageJson),
        setupDependencies({
          projectName: options.projectName,
          dependencies: getPackageInstallConfig(packageJsonPath, tree, options.projectName)
        })
      ]);
    } catch (e) {
      // third-party needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/third-party has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the configuration package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}

/**
 * Add Otter third-party to an Angular Project
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
