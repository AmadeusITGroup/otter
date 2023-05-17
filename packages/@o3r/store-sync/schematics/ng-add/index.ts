import { chain, noop, Rule } from '@angular-devkit/schematics';
import type { NgAddSchematicsSchema } from './schema';
import * as path from 'node:path';

/**
 * Add Otter store-sync to an Otter Project
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  return async (_tree, context) => {
    try {
      // use dynamic import to properly raise an exception if it is not an Otter project.
      const { applyEsLintFix, install, ngAddPackages, getO3rPeerDeps } = await import('@o3r/schematics');
      // retrieve dependencies following the /^@o3r\/.*/ pattern within the peerDependencies of the current module
      const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'));
      return chain([
        // optional custom action dedicated to this module
        options.skipLinter ? noop() : applyEsLintFix(),
        // install packages needed in the current module
        options.skipInstall ? noop : install,
        // add the missing Otter modules in the current project
        ngAddPackages(depsInfo.o3rPeerDeps, { skipConfirmation: true, version: depsInfo.packageVersion, parentPackageInfo: `${depsInfo.packageName!} - setup` })
      ]);
    } catch (e) {
      // If the installation is initialized in a non-Otter application, mandatory packages will be missing. We need to notify the user
      context.logger.error(`[ERROR]: Adding store-sync has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the store-sync package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}
