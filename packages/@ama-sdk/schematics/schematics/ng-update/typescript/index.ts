/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */

import { chain, Rule } from '@angular-devkit/schematics';
import { addCpyDependencies, deprecateScriptsFolder, updateScriptPackageJson } from './v10.0/script-removal';

/**
 * update of Otter library V10.0
 */
export function updateV10_0(): Rule {
  const updateRules: Rule[] = [
    updateScriptPackageJson(),
    deprecateScriptsFolder(),
    addCpyDependencies()
  ];

  return chain(updateRules);
}
