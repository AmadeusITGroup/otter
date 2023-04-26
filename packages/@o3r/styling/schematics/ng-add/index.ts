import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'node:path';
import { NgAddSchematicsSchema } from './schema';

/**
 * Add Otter styling to an Angular Project
 * Update the styling if the app/lib used otter v7
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  return async (_tree: Tree, context: SchematicContext) => {
    try {
      const { ngAddPackages, getO3rPeerDeps, removePackages } = await import('@o3r/schematics');
      const { updateThemeFiles, removeV7OtterAssetsInAngularJson } = await import('./theme-files');
      const { updateSassImports } = await import('@o3r/schematics');
      const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'));
      return () => chain([
        removePackages(['@otter/styling']),
        updateSassImports('o3r'),
        updateThemeFiles(__dirname),
        removeV7OtterAssetsInAngularJson(options),
        ngAddPackages(depsInfo.o3rPeerDeps, { skipConfirmation: true, version: depsInfo.packageVersion, parentPackageInfo: depsInfo.packageName })
      ])(_tree, context);
    } catch (e) {
      // styling needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/styling has failed.
If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the styling package. Please run 'ng add @o3r/core' .
Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}
