import type { Rule } from '@angular-devkit/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Add Otter third-party to an Angular Project
 */
export function ngAdd(): Rule {
  return async (_, context) => {
    try {
      const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));
      const {registerPackageCollectionSchematics} = await import('@o3r/schematics');
      return registerPackageCollectionSchematics(packageJson);
    } catch (e) {
      // third-party needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/third-party has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the configuration package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}
