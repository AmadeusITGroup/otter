import { externalSchematic, Rule, schematic, SchematicContext } from '@angular-devkit/schematics';
import { askConfirmation, askQuestion } from '@angular/cli/src/utilities/prompt';
import { SchematicOptionObject, setupSchematicsDefaultParams } from '@o3r/schematics';
import { readFileSync } from 'node:fs';

/**
 * Ask questions to get rules to execute
 * or throw if the package is not installed
 *
 * @param path file path
 * @param optionName name of the option to setup
 * @param defaultApplyRule should the rule be applied by default
 * @param ruleQuestion the question to ask
 * @param schematicsNameToUpdate list of schematics to update
 * @param context schematic runner context
 * @param packageName package name of the schematic to execute
 * @param schematicName schematic name to execute
 * @param schematicOptions options of the schematic to execute
 */
export const askQuestionsToGetRulesOrThrowIfPackageNotAvailable = async (
  path: string,
  optionName: string,
  defaultApplyRule: boolean | null | undefined,
  ruleQuestion: string,
  schematicsNameToUpdate: string[],
  context: SchematicContext,
  packageName: string,
  schematicName: string,
  schematicOptions: any = {}
): Promise<Rule[]> => {
  let applyRule = defaultApplyRule;
  let alwaysApplyRule: string | null = null;
  try {
    const packageJson = JSON.parse(readFileSync('./package.json', {encoding: 'utf8'}));
    if (!packageJson.dependencies?.[packageName] && !packageJson.devDependencies?.[packageName]) {
      throw new Error(`Package ${packageName} not installed`);
    }
    if (typeof applyRule !== 'boolean' && context.interactive) {
      applyRule = await askConfirmation(ruleQuestion, true);
      if (applyRule) {
        alwaysApplyRule = await askQuestion(`Generate future components with ${optionName} by default?`, [
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
            name: `No, don't apply ${optionName} by default`,
            value: 'no'
          }
        ], 0, 'yes');
      } else {
        context.logger.info(`
          You can add it later to this component via this command:
          ng g ${packageName}:${schematicName} --path="${path}"
        `);
      }
    }
  } catch {
    if (applyRule) {
      throw new Error(`
        You need to install '${packageName}' to be able to generate component with the option ${optionName}.
        Please run 'ng add ${packageName}'.
      `);
    }
    applyRule = false;
  }

  const options = {
    path,
    ...schematicOptions
  };

  return applyRule ? [
    packageName !== '@o3r/core'
      ? externalSchematic(packageName, schematicName, options)
      : schematic(schematicName, options),
    ...(alwaysApplyRule !== 'ask-again' ? [
      setupSchematicsDefaultParams(
        schematicsNameToUpdate.reduce((acc: Record<string, SchematicOptionObject>, schematicToUpdateName) => {
          acc[schematicToUpdateName] = {
            [optionName]: alwaysApplyRule === 'yes'
          };
          return acc;
        }, {})
      )
    ] : [])
  ] : [];
};

