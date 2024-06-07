/* eslint-disable camelcase, @typescript-eslint/naming-convention */
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled, PipeReplacementInfo, updatePipes } from '@o3r/schematics';

const pipeReplacementInfo: PipeReplacementInfo = {
  translate: {
    new: {
      name: 'o3rTranslate'
    },
    import: 'LocalizationModule'
  }
};

/**
 * Update of Otter library V10.0
 */
function updateV10_0Fn(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updatePipes(pipeReplacementInfo)
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * Update of Otter library V10.0
 */
export const updateV10_0 = createSchematicWithMetricsIfInstalled(updateV10_0Fn);
