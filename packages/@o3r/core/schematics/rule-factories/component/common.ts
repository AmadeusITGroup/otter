import { chain, externalSchematic, noop, Rule, schematic, SchematicContext, Tree } from '@angular-devkit/schematics';
import { askConfirmation, askQuestion } from '@angular/cli/src/utilities/prompt';
import { O3rCliError, SchematicOptionObject, setupSchematicsParamsForProject } from '@o3r/schematics';
import type { PackageJson } from 'type-fest';

/**
 * Ask questions to get rules to execute
 * or throw if the package is not installed
 * @param path file path
 * @param optionName name of the option to setup
 * @param defaultApplyRule should the rule be applied by default
 * @param ruleQuestion the question to ask
 * @param schematicsNameToUpdate list of schematics to update
 * @param packageName package name of the schematic to execute
 * @param schematicName schematic name to execute
 * @param schematicOptions options of the schematic to execute
 */
export const askQuestionsToGetRulesOrThrowIfPackageNotAvailable = (
  path: string,
  optionName: string,
  defaultApplyRule: boolean | null | undefined,
  ruleQuestion: string,
  schematicsNameToUpdate: string[],
  packageName: string,
  schematicName: string,
  schematicOptions: any = {}
): Rule => {
  let applyRule = defaultApplyRule;
  let alwaysApplyRule: string | null = null;
  return async (tree: Tree, context: SchematicContext) => {
    const packageJson = tree.readJson('./package.json') as PackageJson;
    if (!packageJson.dependencies?.[packageName] && !packageJson.devDependencies?.[packageName]) {
      if (applyRule) {
        throw new O3rCliError(`
        You need to install '${packageName}' to be able to generate component with the option ${optionName}.
        Please run 'ng add ${packageName}'.
      `);
      }
    } else {
      if (typeof applyRule !== 'boolean' && context.interactive) {
        applyRule = await askConfirmation(ruleQuestion, true);
        if (applyRule) {
          alwaysApplyRule = await askQuestion(`Generate future components with ${optionName} by default?`, [
            {
              name: 'Yes, always',
              value: 'yes'
            },
            {
              name: 'Ask me again next time',
              value: 'ask-again'
            },
            {
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
    }

    const options = {
      ...schematicOptions,
      path
    };

    return applyRule
      ? chain([
        packageName === '@o3r/core'
          ? schematic(schematicName, options)
          : externalSchematic(packageName, schematicName, options),
        ...(alwaysApplyRule === 'ask-again'
          ? []
          : [
            setupSchematicsParamsForProject(
              schematicsNameToUpdate.reduce((acc: Record<string, SchematicOptionObject>, schematicToUpdateName) => {
                acc[schematicToUpdateName] = {
                  [optionName]: alwaysApplyRule === 'yes'
                };
                return acc;
              }, {}),
              options.projectName
            )
          ])
      ])
      : noop;
  };
};

