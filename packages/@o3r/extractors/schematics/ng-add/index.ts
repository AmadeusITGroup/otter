import { chain } from '@angular-devkit/schematics';
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'node:path';
import { updateCmsAdapter } from '../cms-adapter';
import { NgAddSchematicsSchema } from './schema';

/**
 * Add Otter extractors to an Angular Project
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const {getProjectDepType, ngAddPackages, getO3rPeerDeps, getProjectRootDir} = await import('@o3r/schematics');
      const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const depsInfo = getO3rPeerDeps(packageJsonPath);
      const workingDirectory = options.projectName ? getProjectRootDir(tree, options.projectName) : '.';
      return chain([
        (t, c) => ngAddPackages(depsInfo.o3rPeerDeps, {
          skipConfirmation: true,
          version: depsInfo.packageVersion,
          parentPackageInfo: `${depsInfo.packageName!} - setup`,
          dependencyType: getProjectDepType(t),
          workingDirectory
        })(t, c),
        updateCmsAdapter(options, __dirname)
      ]);
    } catch (e) {
      // o3r extractors needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/extractors has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the localization package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}
