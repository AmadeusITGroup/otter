import { chain, noop, Rule } from '@angular-devkit/schematics';
import type { NgAddSchematicsSchema } from './schema';
import * as path from 'node:path';

const doCustomAction: Rule = (tree, _context) => {
  // your custom code here
  return tree;
};

/**
 * Add Otter test-helpers to an Otter Project
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
        doCustomAction,
        options.skipLinter ? noop() : applyEsLintFix(),
        // install packages needed in the current module
        options.skipInstall ? noop : install,
        // add the missing Otter modules in the current project
        ngAddPackages(depsInfo.o3rPeerDeps, { skipConfirmation: true, version: depsInfo.packageVersion, parentPackageInfo: `${depsInfo.packageName!} - setup` })
      ]);
    } catch (e) {
      // If the installation is initialized in a non-Otter application, mandatory packages will be missing. We need to notify the user
      context.logger.error(`[ERROR]: Adding @o3r/test-helpers has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the test-helpers package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}
