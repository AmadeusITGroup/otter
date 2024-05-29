/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */

import { chain, Rule } from '@angular-devkit/schematics';
import { addCpyDependencies, deprecateScriptsFolder, updateScriptPackageJson } from './v10.0/script-removal';
import { addPresetsRenovate } from './v10.1/add-presets-renovate';
import {updateOpenApiVersionInProject} from './v10.3/update-openapiversion';

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

/**
 * Update of Ama-sdk library V10.1
 */
export function updateV10_1(): Rule {
  const updateRules: Rule[] = [
    addPresetsRenovate()
  ];

  return chain(updateRules);
}

/**
 * Update of Ama-sdk library V10.3
 */
export function updateV10_3(): Rule {
  const updateRules: Rule[] = [
    updateOpenApiVersionInProject()
  ];

  return chain(updateRules);
}
