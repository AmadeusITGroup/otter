/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */

import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { updateImports } from '@o3r/schematics';
import { mapImportAsyncStore } from './v8.2/import-map';
import { updateConfiguration } from './v10.0/configuration';

/**
 * update of Otter library V8.2
 */
export function updateV8_2(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updateImports(mapImportAsyncStore)
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * update of Otter library V10.0
 */
export function updateV10_0(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updateConfiguration
    ];

    return chain(updateRules)(tree, context);
  };
}
