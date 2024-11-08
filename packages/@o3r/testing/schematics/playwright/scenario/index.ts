import {
  strings,
} from '@angular-devkit/core';
import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  createSchematicWithMetricsIfInstalled,
  getDestinationPath,
  getWorkspaceConfig,
  O3rCliError,
} from '@o3r/schematics';
import {
  NgGeneratePlaywrightScenarioSchematicsSchema,
} from './schema';

/**
 * Add a Playwright scenario to an Otter project
 * @param options
 */
function ngGeneratePlaywrightScenarioFn(options: NgGeneratePlaywrightScenarioSchematicsSchema): Rule {
  const isApplication = (tree: Tree/* , context: SchematicContext*/) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;

    if (!workspaceProject) {
      throw new O3rCliError('Cannot create a playwright scenario');
    }

    return tree;
  };

  const scenarioName = strings.capitalize(strings.camelize(options.name));

  /**
   * Generates playwright scenario file.
   * @param tree File tree
   * @param context Context of the rule
   */
  const generateFiles: Rule = (tree: Tree, context: SchematicContext) => {
    const scenarioPath = getDestinationPath('@o3r/testing:playwright-scenario', options.path, tree, options.projectName);

    const templateSource = apply(url('./templates'), [
      template({
        ...strings,
        ...options,
        scenarioName
      }),
      move(scenarioPath)
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.Error);

    return rule(tree, context);
  };

  return chain([
    isApplication,
    generateFiles
  ]);
}

/**
 * Add a Playwright scenario to an Otter project
 * @param options
 */
export const ngGeneratePlaywrightScenario = createSchematicWithMetricsIfInstalled(ngGeneratePlaywrightScenarioFn);
