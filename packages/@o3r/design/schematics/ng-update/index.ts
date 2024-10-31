import {
  chain,
  Rule,
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';
import {
  createSchematicWithMetricsIfInstalled
} from '@o3r/schematics';
import {
  migrateBuilderToGenerateStyle
} from './v11.3/builder-migration';

/**
 * Update of Otter library V11.3
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version number
function updateV11_3Fn(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const updateRules: Rule[] = [
      migrateBuilderToGenerateStyle
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * Update of Otter library V11.3
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version number
export const updateV11_3 = createSchematicWithMetricsIfInstalled(updateV11_3Fn);
