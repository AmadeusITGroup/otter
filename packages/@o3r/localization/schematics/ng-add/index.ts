import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NgAddSchematicsSchema } from './schema';

import * as path from 'node:path';

/**
 * Add Otter localization to an Angular Project
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  return async (_tree: Tree, context: SchematicContext) => {
    try {
      const { applyEsLintFix, install, ngAddPackages, getO3rPeerDeps } = await import('@o3r/schematics');
      const { updateI18n, updateLocalization } = await import('../localization-base');
      const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'));
      return chain([
        updateLocalization(options, __dirname),
        updateI18n(),
        options.skipLinter ? noop() : applyEsLintFix(),
        // install ngx-translate and message format dependencies
        options.skipInstall ? noop : install,
        ngAddPackages(depsInfo.o3rPeerDeps, { skipConfirmation: true, version: depsInfo.packageVersion, parentPackageInfo: `${depsInfo.packageName!} - setup` })
      ]);
    } catch (e) {
      // o3r localization needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/localization has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the localization package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}
