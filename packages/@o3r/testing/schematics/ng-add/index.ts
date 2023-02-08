import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'node:path';

/**
 * Add Otter testing to an Angular Project
 *
 * @param options
 */
export function ngAdd(): Rule {
  return async (_tree: Tree, context: SchematicContext) => {
    try {
      const { ngAddPackages, getO3rPeerDeps, removePackages } = await import('@o3r/schematics');
      const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'));

      return chain([
        removePackages(['@otter/testing']),
        ngAddPackages(depsInfo.o3rPeerDeps, { skipConfirmation: true, version: depsInfo.packageVersion, parentPackageInfo: depsInfo.packageName })
      ]);

    } catch (e) {
      // testing needs o3r/schematics as peer dep.
      context.logger.error(`[ERROR]: Adding @o3r/testing has failed.
      You need to install '@o3r/schematics' package to be able to use the testing package. Please run 'ng add @o3r/schematics' .`);
      throw (e);
    }
  };
}
