import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  addCpyDependencies,
  deprecateScriptsFolder,
  updateScriptPackageJson,
} from './v10.0/script-removal';
import {
  addPresetsRenovate,
} from './v10.1/add-presets-renovate';
import {
  updateOpenApiVersionInProject,
} from './v10.3/update-openapiversion';
import {
  updateOpenapitoolsFile,
} from './v11.0/update-openapitools';
import {
  updateRegenScript,
} from './v11.0/update-regen-script';
import {
  createGitAttributesFile,
} from './v11.4/create-gitattributes';

/**
 * update of Otter library V10.0
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version
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
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version
export function updateV10_1(): Rule {
  const updateRules: Rule[] = [
    addPresetsRenovate()
  ];

  return chain(updateRules);
}

/**
 * Update of Ama-sdk library V10.3
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version
export function updateV10_3(): Rule {
  const updateRules: Rule[] = [
    updateOpenApiVersionInProject()
  ];

  return chain(updateRules);
}

/**
 * Update of Ama-sdk library V11
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version
export function updateV11_0(): Rule {
  const updateRules: Rule[] = [
    updateRegenScript,
    updateOpenapitoolsFile
  ];

  return chain(updateRules);
}

/**
 * Update of Ama-sdk library V11.4
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version
export function updateV11_4(): Rule {
  const updateRules: Rule[] = [
    createGitAttributesFile
  ];

  return chain(updateRules);
}
