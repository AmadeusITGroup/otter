import { externalSchematic, Rule, SchematicContext } from '@angular-devkit/schematics';
import { askConfirmation, askQuestion } from '@angular/cli/src/utilities/prompt';
import { setupSchematicsDefaultParams } from '@o3r/schematics';
import { NgGenerateComponentSchematicsSchema } from '../../component/schema';

const configurationPackageName = '@o3r/rules-engine';
const addConfigurationSchematicName = 'rules-engine-to-component';

export const getAddRulesEngineRules = async (
  componentPath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useRulesEngine' | 'skipLinter' | 'projectName' | 'componentStructure'>,
  context: SchematicContext
): Promise<Rule[]> => {
  let useRulesEngine = options.useRulesEngine;
  let alwaysUseRulesEngine;
  try {
    require.resolve(`${configurationPackageName}/package.json`);
    if (useRulesEngine === null && context.interactive) {
      useRulesEngine = await askConfirmation('Generate component with rules-engine ?', true);
      if (useRulesEngine) {
        alwaysUseRulesEngine = await askQuestion('Generate future components with rules-engine by default?', [
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
            name: 'No, don\'t apply rules-engine by default',
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
    if (alwaysUseRulesEngine) {
      throw new Error(`
        You need to install '${configurationPackageName}' to be able to generate component with rules-engine.
        Please run 'ng add ${configurationPackageName}'.
      `);
    }
    alwaysUseRulesEngine = false;
  }

  return useRulesEngine ? [
    externalSchematic(configurationPackageName, addConfigurationSchematicName, {
      path: componentPath,
      skipLinter: options.skipLinter,
      projectName: options.projectName
    }),
    ...(alwaysUseRulesEngine !== 'ask-again' ? [
      setupSchematicsDefaultParams({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component': {
          useRulesEngine: alwaysUseRulesEngine === 'yes'
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component-container': {
          useRulesEngine: alwaysUseRulesEngine === 'yes'
        }
      })
    ] : [])
  ] : [];
};
