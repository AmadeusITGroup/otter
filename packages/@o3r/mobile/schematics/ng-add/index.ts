import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'node:path';

/**
 * Add Otter mobile to an Angular Project
 *
 * @param options
 */
export function ngAdd(): Rule {
  /* ng add rules */
  return async (_tree: Tree, context: SchematicContext) => {
    try {
      const { ngAddPackages, getO3rPeerDeps, removePackages } = await import('@o3r/schematics');
      const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'));
      return () => chain([
        removePackages(['@otter/mobile']),
        ngAddPackages(depsInfo.o3rPeerDeps, { skipConfirmation: true, version: depsInfo.packageVersion, parentPackageInfo: depsInfo.packageName })
      ])(_tree, context);

    } catch (e) {
      // o3r mobile needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/mobile has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the mobile package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}
