import {
  chain,
  Rule
} from '@angular-devkit/schematics';
import { Tree } from '@angular-devkit/schematics/src/tree/interface';
import { applyEsLintFix, checkPackagesRule, getProjectFromTree } from '@o3r/schematics';
import { noop } from 'rxjs';
import { updateApiDependencies } from '../helpers/update-api-deps';
import { NgAddSchematicsSchema } from './schema';


/**
 * Add Otter apis manager to an Angular Project
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  const setupApp: Rule = (tree: Tree) => {
    const workspaceProject = getProjectFromTree(tree, options.projectName || undefined);
    if (workspaceProject.projectType === 'application') {
      return updateApiDependencies();
    }
    return noop;
  };
  return chain([
    checkPackagesRule('@o3r/apis-manager'),
    setupApp,
    options.skipLinter ? noop : applyEsLintFix()
  ]);
}

