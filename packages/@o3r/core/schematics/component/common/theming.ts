import { externalSchematic, Rule, SchematicContext } from '@angular-devkit/schematics';
import { askConfirmation, askQuestion } from '@angular/cli/src/utilities/prompt';
import { setupSchematicsDefaultParams } from '@o3r/schematics';
import { NgGenerateComponentSchematicsSchema } from '../schema';

const stylingPackageName = '@o3r/styling';
const addThemingSchematicName = 'theming-to-component';

export const getAddThemingRules = async (
  stylePath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useOtterTheming'>,
  context: SchematicContext
): Promise<Rule[]> => {
  let useOtterTheming = options.useOtterTheming;
  let alwaysUseOtterTheming;
  try {
    require.resolve(`${stylingPackageName}/package.json`);
    if (useOtterTheming === null && context.interactive) {
      useOtterTheming = await askConfirmation('Generate component with Otter theming?', true);
      if (useOtterTheming) {
        alwaysUseOtterTheming = await askQuestion('Generate future components with Otter theming by default?', [
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
            name: 'No, don\'t apply Otter theming by default',
            value: 'no'
          }
        ], 0, null);
      } else {
        context.logger.info(`
          You can add theming later to this component via this command:
          ng g ${stylingPackageName}:${addThemingSchematicName} --path="${stylePath}"
        `);
      }
    }
  } catch {
    if (useOtterTheming) {
      throw new Error(`
        You need to install '${stylingPackageName}' to be able to generate component with theming.
        Please run 'ng add ${stylingPackageName}'.
      `);
    }
    useOtterTheming = false;
  }

  return useOtterTheming ? [
    externalSchematic(stylingPackageName, addThemingSchematicName, {
      path: stylePath
    }),
    ...(alwaysUseOtterTheming !== 'ask-again' ? [
      setupSchematicsDefaultParams({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component': {
          useOtterTheming: alwaysUseOtterTheming === 'yes'
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component-presenter': {
          useOtterTheming: alwaysUseOtterTheming === 'yes'
        }
      })
    ] : [])
  ] : [];
};
