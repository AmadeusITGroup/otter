import { externalSchematic, Rule, SchematicContext } from '@angular-devkit/schematics';
import { askConfirmation, askQuestion } from '@angular/cli/src/utilities/prompt';
import { setupSchematicsDefaultParams } from '@o3r/schematics';
import { NgGenerateComponentSchematicsSchema } from '../schema';

const analyticsPackageName = '@o3r/analytics';
const addAnalyticsSchematicName = 'analytics-to-component';

export const getAddAnalyticsRules = async (
  componentPath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useOtterAnalytics' | 'skipLinter' | 'activateDummy'>,
  context: SchematicContext
): Promise<Rule[]> => {
  let useOtterAnalytics = options.useOtterAnalytics;
  let alwaysUseOtterAnalytics;
  try {
    require.resolve(`${analyticsPackageName}/package.json`);
    if (useOtterAnalytics === null && context.interactive) {
      useOtterAnalytics = await askConfirmation('Generate component with Otter analytics?', true);
      if (useOtterAnalytics) {
        alwaysUseOtterAnalytics = await askQuestion('Generate future components with Otter analytics by default?', [
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
            name: 'No, don\'t apply Otter analytics by default',
            value: 'no'
          }
        ], 0, null);
      } else {
        context.logger.info(`
          You can add analytics later to this component via this command:
          ng g ${analyticsPackageName}:${addAnalyticsSchematicName} --path="${componentPath}"
        `);
      }
    }
  } catch {
    if (useOtterAnalytics) {
      throw new Error(`
        You need to install '${analyticsPackageName}' to be able to generate component with analytics.
        Please run 'ng add ${analyticsPackageName}'.
      `);
    }
    useOtterAnalytics = false;
  }

  return useOtterAnalytics ? [
    externalSchematic(analyticsPackageName, addAnalyticsSchematicName, {
      path: componentPath,
      skipLinter: options.skipLinter,
      activateDummy: options.activateDummy
    }),
    ...(alwaysUseOtterAnalytics !== 'ask-again' ? [
      setupSchematicsDefaultParams({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component': {
          useOtterAnalytics: alwaysUseOtterAnalytics === 'yes'
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component-presenter': {
          useOtterAnalytics: alwaysUseOtterAnalytics === 'yes'
        }
      })
    ] : [])
  ] : [];
};
