import { strings } from '@angular-devkit/core';
import { apply, chain, MergeStrategy, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';

import { getDestinationPath, getProjectFromTree } from '@o3r/schematics';
import { NgGeneratePlaywrightScenarioSchematicsSchema } from './schema';

/**
 * Add a Playwright scenario to an Otter project
 *
 * @param options
 */
export function ngGeneratePlaywrightScenario(options: NgGeneratePlaywrightScenarioSchematicsSchema): Rule {
  const isApplication = (tree: Tree/* , context: SchematicContext*/) => {
    const workspaceProject = getProjectFromTree(tree, null, 'application');

    if (!workspaceProject) {
      throw new Error('Cannot create a playwright scenario');
    }

    return tree;
  };

  const scenarioName = strings.capitalize(strings.camelize(options.name));

  /**
   * Generates playwright scenario file.
   *
   * @param tree File tree
   * @param context Context of the rule
   */
  const generateFiles: Rule = (tree: Tree, context: SchematicContext) => {
    let scenariosPath = options.path;
    if (!scenariosPath) {
      const workspaceProject = getProjectFromTree(tree, null, 'application');
      const configurationIndex = '@o3r/testing:playwright-scenario';
      const playwrightOptions = workspaceProject?.schematics?.[configurationIndex] as {path?: string} | undefined;
      if (!playwrightOptions || !playwrightOptions.path || typeof playwrightOptions.path !== 'string') {
        throw new Error('Cannot create a playwright scenario without a path. Provide a path in angular.json');
      }
      scenariosPath = playwrightOptions.path;
    }
    const scenarioPath = getDestinationPath('@o3r/core:page', scenariosPath, tree);

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
