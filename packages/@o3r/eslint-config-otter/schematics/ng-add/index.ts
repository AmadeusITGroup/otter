import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'node:path';
/**
 * Add Otter eslint-config to an Angular Project
 *
 * @param options
 */
export function ngAdd(): Rule {
  /* ng add rules */
  return async (_tree: Tree, context: SchematicContext) => {
    try {
      const { addVsCodeRecommendations, ngAddPackages, getO3rPeerDeps, removePackages } = await import('@o3r/schematics');
      const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'), true, /^@(?:o3r|ama-sdk|eslint-)/);
      return () => chain([
        removePackages(['@otter/eslint-config-otter', '@otter/eslint-plugin']),
        ngAddPackages(depsInfo.o3rPeerDeps, { skipConfirmation: true, version: depsInfo.packageVersion, parentPackageInfo: depsInfo.packageName }),
        addVsCodeRecommendations(['dbaeumer.vscode-eslint', 'stylelint.vscode-stylelint'])
      ])(_tree, context);
    } catch (e) {
      // eslint-config-otter needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/eslint-config-otter has failed.
      You need to install '@o3r/schematics' package to be able to use the eslint-config-otter package. Please run 'ng add @o3r/schematics' .`);
      throw (e);
    }
  };
}
