import { externalSchematic, Rule, SchematicContext } from '@angular-devkit/schematics';
import { askConfirmation } from '@angular/cli/src/utilities/prompt';
import { NgGenerateComponentSchematicsSchema } from '../schema';

const configurationPackageName = '@o3r/configuration';
const addConfigurationSchematicName = 'configuration-to-component';

export const getAddConfigurationRules = async (
  componentPath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useOtterConfig' | 'skipLinter' | 'projectName' | 'componentStructure'>,
  context: SchematicContext
): Promise<Rule[]> => {
  let useOtterConfig = options.useOtterConfig;
  try {
    require.resolve(`${configurationPackageName}/package.json`);
    if (useOtterConfig === null && context.interactive) {
      useOtterConfig = await askConfirmation('Generate component with Otter configuration ?', true);
      if (!useOtterConfig) {
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
    })
  ] : [];
};
