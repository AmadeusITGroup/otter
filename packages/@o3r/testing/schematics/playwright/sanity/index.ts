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
  createOtterSchematic,
  getDestinationPath,
  getWorkspaceConfig,
  O3rCliError,
} from '@o3r/schematics';
import {
  NgGeneratePlaywrightSanitySchematicsSchema,
} from './schema';

/**
 * Add a Playwright sanity to an Otter project
 * @param options
 */
function ngGeneratePlaywrightSanityFn(options: NgGeneratePlaywrightSanitySchematicsSchema): Rule {
  const isApplication = (tree: Tree/* , context: SchematicContext*/) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;

    if (!workspaceProject) {
      throw new O3rCliError('Cannot create a playwright sanity');
    }

    return tree;
  };

  const sanityName = strings.capitalize(strings.camelize(options.name));

  /**
   * Generates playwright sanity file.
   * @param tree File tree
   * @param context Context of the rule
   */
  const generateFiles: Rule = (tree: Tree, context: SchematicContext) => {
    const sanityPath = getDestinationPath('@o3r/testing:playwright-sanity', options.path, tree, options.projectName);

    const templateSource = apply(url('./templates'), [
      template({
        ...strings,
        ...options,
        sanityName
      }),
      move(sanityPath)
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
 * Add a Playwright sanity to an Otter project
 * @param options
 */
export const ngGeneratePlaywrightSanity = createOtterSchematic(ngGeneratePlaywrightSanityFn);
