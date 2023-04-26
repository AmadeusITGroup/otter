import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'node:path';
/**
 * Add Otter configuration to an Angular Project
 *
 * @param options
 */
export function ngAdd(): Rule {
  /* ng add rules */
  return async (_tree: Tree, context: SchematicContext) => {
    try {
      const { ngAddPackages, getO3rPeerDeps } = await import('@o3r/schematics');
      const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'));

      const rule = ngAddPackages(depsInfo.o3rPeerDeps, { skipConfirmation: true, version: depsInfo.packageVersion, parentPackageInfo: depsInfo.packageName });
      context.logger.info(`The package ${depsInfo.packageName} comes with a debug mechanism`);
      context.logger.info('Get more information on the following page: https://github.com/AmadeusITGroup/otter/tree/main/docs/configuration/OVERVIEW.md#Runtime-debugging');
      return () => rule(_tree, context);
    } catch (e) {
      // configuration needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/configuration has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the configuration package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };

}
