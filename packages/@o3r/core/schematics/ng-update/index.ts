import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  createSchematicWithMetricsIfInstalled,
  updateImports,
} from '@o3r/schematics';
import {
  updateConfiguration,
} from './v10.0/configuration';
import {
  mapImportAsyncStore,
} from './v8.2/import-map';

/**
 * Update of Otter library V8.2
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- version is in the function name
function updateV8_2Fn(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const updateRules: Rule[] = [
      updateImports(mapImportAsyncStore)
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * Update of Otter library V8.2
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- version is in the function name
export const updateV8_2 = createSchematicWithMetricsIfInstalled(updateV8_2Fn);

/**
 * Update of Otter library V10.0
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- version is in the function name
function updateV10_0Fn(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const updateRules: Rule[] = [
      // Some of these imports were missed in the generators of v9, so it's easier to just run the update again
      updateImports(mapImportAsyncStore),
      updateConfiguration
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * Update of Otter library V10.0
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- version is in the function name
export const updateV10_0 = createSchematicWithMetricsIfInstalled(updateV10_0Fn);
