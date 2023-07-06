import { Rule, schematic, SchematicContext } from '@angular-devkit/schematics';
import { askConfirmation, askQuestion } from '@angular/cli/src/utilities/prompt';
import { setupSchematicsDefaultParams } from '@o3r/schematics';
import { NgGenerateComponentSchematicsSchema } from '../schema';

const contextPackageName = '@o3r/core';
const addContextSchematicName = 'context-to-component';

export const getAddContextRules = async (
  componentPath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useContext' | 'skipLinter'>,
  context: SchematicContext
): Promise<Rule[]> => {
  let useContext = options.useContext;
  let alwaysUseContext;
  if (useContext === null && context.interactive) {
    useContext = await askConfirmation('Generate component with Otter context?', true);
    if (useContext) {
      alwaysUseContext = await askQuestion('Generate future components with Otter context by default?', [
        {
          type: 'choice',
          name: 'Yes, always',
          value: 'yes'
        },
        {
          type: 'choice',
          name: 'Ask me again next time',
          value: 'ask-again'
        },
        {
          type: 'choice',
          name: 'No, don\'t apply Otter context by default',
          value: 'no'
        }
      ], 0, null);
    } else {
      context.logger.info(`
        You can add context later to this component via this command:
        ng g ${contextPackageName}:${addContextSchematicName} --path="${componentPath}"
      `);
    }
  }

  return useContext ? [
    schematic(addContextSchematicName, {
      path: componentPath,
      skipLinter: options.skipLinter
    }),
    ...(alwaysUseContext !== 'ask-again' ? [
      setupSchematicsDefaultParams({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component': {
          useContext: alwaysUseContext === 'yes'
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component-container': {
          useContext: alwaysUseContext === 'yes'
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component-presenter': {
          useContext: alwaysUseContext === 'yes'
        }
      })
    ] : [])
  ] : [];
};
