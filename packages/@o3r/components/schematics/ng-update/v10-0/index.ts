/* eslint-disable camelcase, @typescript-eslint/naming-convention */
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled, PipeReplacementInfo, updatePipes } from '@o3r/schematics';

const pipeReplacementInfo: PipeReplacementInfo = {
  capitalize: {
    new: {
      name: 'o3rCapitalize',
      import: 'O3rCapitalizePipe'
    },
    import: 'CapitalizePipeModule'
  },
  duration: {
    new: {
      name: 'o3rDuration',
      import: 'O3rDurationPipe'
    },
    import: 'DurationPipeModule'
  },
  keepWhiteSpace: {
    new: {
      name: 'o3rKeepWhiteSpace',
      import: 'O3rKeepWhiteSpacePipe'
    },
    import: 'KeepWhiteSpacePipeModule'
  },
  replaceWithBold: {
    new: {
      name: 'o3rReplaceWithBold',
      import: 'O3rReplaceWithBoldPipe'
    },
    import: 'ReplaceWithBoldPipeModule'
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
