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
      const { addVsCodeRecommendations, ngAddPackages, getO3rPeerDeps, removePackages } = await import('@o3r/schematics');
      const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'));

      return () => chain([
        removePackages(['@otter/testing']),
        addVsCodeRecommendations(['Orta.vscode-jest']),
        ngAddPackages(depsInfo.o3rPeerDeps, { skipConfirmation: true, version: depsInfo.packageVersion, parentPackageInfo: depsInfo.packageName })
      ])(_tree, context);

    } catch (e) {
      context.logger.error(`[ERROR]: Adding @o3r/testing has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' or '@o3r/schematics' to be able to use the testing package.
      Please run 'ng add @o3r/core' or 'ng add @o3r/schematics'. Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}
