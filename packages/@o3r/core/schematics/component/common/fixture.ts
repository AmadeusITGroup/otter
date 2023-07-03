import { externalSchematic, Rule, SchematicContext } from '@angular-devkit/schematics';
import { askConfirmation, askQuestion } from '@angular/cli/src/utilities/prompt';
import { setupSchematicsDefaultParams } from '@o3r/schematics';
import { NgGenerateComponentSchematicsSchema } from '../schema';

const fixturePackageName = '@o3r/testing';
const addFixtureSchematicName = 'fixture-to-component';

export const getAddFixtureRules = async (
  componentPath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useComponentFixtures' | 'skipLinter'>,
  context: SchematicContext
): Promise<Rule[]> => {
  let useComponentFixtures = options.useComponentFixtures;
  let alwaysUseComponentFixtures;
  try {
    require.resolve(`${fixturePackageName}/package.json`);
    if (useComponentFixtures === null && context.interactive) {
      useComponentFixtures = await askConfirmation('Generate component with Otter fixture ?', true);
      if (useComponentFixtures) {
        alwaysUseComponentFixtures = await askQuestion('Generate future components with Otter fixture by default?', [
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
          You can add fixture later to this component via this command:
          ng g ${fixturePackageName}:${addFixtureSchematicName} --path="${componentPath}"
        `);
      }
    }
  } catch {
    if (useComponentFixtures) {
      throw new Error(`
        You need to install '${fixturePackageName}' to be able to generate component with fixture.
        Please run 'ng add ${fixturePackageName}'.
      `);
    }
    useComponentFixtures = false;
  }

  return useComponentFixtures ? [
    externalSchematic(fixturePackageName, addFixtureSchematicName, {
      path: componentPath,
      skipLinter: options.skipLinter
    }),
    ...(alwaysUseComponentFixtures !== 'ask-again' ? [
      setupSchematicsDefaultParams({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component': {
          useComponentFixtures: alwaysUseComponentFixtures === 'yes'
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component-container': {
          useComponentFixtures: alwaysUseComponentFixtures === 'yes'
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component-presenter': {
          useComponentFixtures: alwaysUseComponentFixtures === 'yes'
        }
      })
    ] : [])
  ] : [];
};
