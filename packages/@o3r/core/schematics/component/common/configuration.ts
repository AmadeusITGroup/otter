import { externalSchematic, Rule, SchematicContext } from '@angular-devkit/schematics';
import { askConfirmation, askQuestion } from '@angular/cli/src/utilities/prompt';
import { setupSchematicsDefaultParams } from '@o3r/schematics';
import { NgGenerateComponentSchematicsSchema } from '../schema';

const configurationPackageName = '@o3r/configuration';
const addConfigurationSchematicName = 'configuration-to-component';

export const getAddConfigurationRules = async (
  componentPath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useOtterConfig' | 'skipLinter' | 'projectName' | 'componentStructure'>,
  context: SchematicContext
): Promise<Rule[]> => {
  let useOtterConfig = options.useOtterConfig;
  let alwaysUseOtterConfig;
  try {
    require.resolve(`${configurationPackageName}/package.json`);
    if (useOtterConfig === null && context.interactive) {
      useOtterConfig = await askConfirmation('Generate component with Otter configuration ?', true);
      if (useOtterConfig) {
        alwaysUseOtterConfig = await askQuestion('Generate future components with Otter configuration by default?', [
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
          You can add configuration later to this component via this command:
          ng g ${configurationPackageName}:${addConfigurationSchematicName} --path="${componentPath}"
        `);
      }
    }
  } catch {
    if (useOtterConfig) {
      throw new Error(`
        You need to install '${configurationPackageName}' to be able to generate component with configuration.
        Please run 'ng add ${configurationPackageName}'.
      `);
    }
    useOtterConfig = false;
  }

  return useOtterConfig ? [
    externalSchematic(configurationPackageName, addConfigurationSchematicName, {
      path: componentPath,
      skipLinter: options.skipLinter,
      projectName: options.projectName,
      exposeComponent: options.componentStructure !== 'full'
    }),
    ...(alwaysUseOtterConfig !== 'ask-again' ? [
      setupSchematicsDefaultParams({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component': {
          useOtterConfig: alwaysUseOtterConfig === 'yes'
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component-container': {
          useOtterConfig: alwaysUseOtterConfig === 'yes'
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component-presenter': {
          useOtterConfig: alwaysUseOtterConfig === 'yes'
        }
      })
    ] : [])
  ] : [];
};
