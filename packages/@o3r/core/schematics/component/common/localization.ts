import { externalSchematic, Rule, SchematicContext } from '@angular-devkit/schematics';
import { askConfirmation, askQuestion } from '@angular/cli/src/utilities/prompt';
import { setupSchematicsDefaultParams } from '@o3r/schematics';
import { NgGenerateComponentSchematicsSchema } from '../schema';

const localizationPackageName = '@o3r/localization';
const addLocalizationSchematicName = 'localization-to-component';

export const getAddLocalizationRules = async (
  componentPath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useLocalization' | 'skipLinter' | 'activateDummy'>,
  context: SchematicContext
): Promise<Rule[]> => {
  let useLocalization = options.useLocalization;
  let alwaysUseLocalization;
  try {
    require.resolve(`${localizationPackageName}/package.json`);
    if (useLocalization === null && context.interactive) {
      useLocalization = await askConfirmation('Generate component with Otter localization?', true);
      if (useLocalization) {
        alwaysUseLocalization = await askQuestion('Generate future components with Otter localization by default?', [
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
            name: 'No, don\'t apply Otter localization by default',
            value: 'no'
          }
        ], 0, null);
      } else {
        context.logger.info(`
          You can add localization later to this component via this command:
          ng g ${localizationPackageName}:${addLocalizationSchematicName} --path="${componentPath}"
        `);
      }
    }
  } catch {
    if (useLocalization) {
      throw new Error(`
        You need to install '${localizationPackageName}' to be able to generate component with configuration.
        Please run 'ng add ${localizationPackageName}'.
      `);
    }
    useLocalization = false;
  }

  return useLocalization ? [
    externalSchematic(localizationPackageName, addLocalizationSchematicName, {
      path: componentPath,
      skipLinter: options.skipLinter,
      activateDummy: options.activateDummy
    }),
    ...(alwaysUseLocalization !== 'ask-again' ? [
      setupSchematicsDefaultParams({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component': {
          useLocalization: alwaysUseLocalization === 'yes'
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component-presenter': {
          useLocalization: alwaysUseLocalization === 'yes'
        }
      })
    ] : [])
  ] : [];
};
