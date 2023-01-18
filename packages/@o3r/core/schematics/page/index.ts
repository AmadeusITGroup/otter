import { strings } from '@angular-devkit/core';
import { apply, chain, MergeStrategy, mergeWith, move, noop, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import * as path from 'node:path';

import { applyEsLintFix, getDefaultProjectName, getDestinationPath, getProjectFromTree, insertRoute, Route } from '@o3r/schematics';
import { NgGeneratePageSchematicsSchema } from './schema';

/**
 * Add a Page to an Otter project
 *
 * @param options
 */
export function ngGeneratePage(options: NgGeneratePageSchematicsSchema): Rule {

  const isApplication = (tree: Tree/* , context: SchematicContext*/) => {
    const workspaceProject = getProjectFromTree(tree);

    if (workspaceProject.projectType !== 'application') {
      throw new Error(`Cannot create a page on ${workspaceProject.projectType}`);
    }

    return tree;
  };

  const className = strings.capitalize(strings.camelize(options.name));

  /**
   * Generates page files.
   *
   * @param tree File tree
   * @param context Context of the rule
   */
  const generateFiles: Rule = (tree: Tree, context: SchematicContext) => {
    const projectName = getDefaultProjectName(tree);
    const workspaceProject = getProjectFromTree(tree);
    const destination = getDestinationPath('@o3r/core:page', options.path, tree);
    const pagePath = path.join(destination, strings.dasherize(options.scope), strings.dasherize(options.name));

    const rules: Rule[] = [];

    rules.push(mergeWith(apply(url('./templates/page'), [
      template({
        ...strings,
        ...options,
        className,
        projectName,
        scuPageName: strings.underscore(options.name).toUpperCase(),
        prefix: options.prefix ? options.prefix : workspaceProject.prefix
      }),
      renameTemplateFiles(),
      move(pagePath)
    ]), MergeStrategy.Overwrite));

    if (options.useOtterTheming) {
      rules.push(mergeWith(apply(url('./templates/theming'), [
        template({
          ...strings,
          ...options
        }),
        renameTemplateFiles(),
        move(pagePath)
      ]), MergeStrategy.Overwrite));
    }

    if (options.useOtterConfig) {
      rules.push(mergeWith(apply(url('./templates/config'), [
        template({
          ...strings,
          ...options,
          className: className,
          scuPageName: strings.underscore(options.name).toUpperCase()
        }),
        renameTemplateFiles(),
        move(pagePath)
      ]), MergeStrategy.Overwrite));
    }

    if (options.useLocalization) {
      rules.push(mergeWith(apply(url('./templates/localization'), [
        template({
          ...strings,
          ...options,
          className: className,
          prefix: options.prefix ? options.prefix : workspaceProject.prefix
        }),
        renameTemplateFiles(),
        move(pagePath)
      ]), MergeStrategy.Overwrite));
    }

    return chain(rules)(tree, context);
  };

  /**
   * Updates App Routing Module to add the new page route.
   *
   * @param tree File tree
   * @param context Context of the rule
   */
  const updateAppRoutingModule: Rule = (tree: Tree, context: SchematicContext) => {
    const indexFilePath = path.join(strings.dasherize(options.scope), strings.dasherize(options.name), 'index');
    const route: Route = {
      path: strings.dasherize(options.name),
      import: `./${indexFilePath.replace(/[\\/]/g, '/')}`,
      module: `${className}Module`
    };

    return insertRoute(tree, context, options.appRoutingModulePath, route);
  };

  return chain([
    isApplication,
    generateFiles,
    updateAppRoutingModule,
    options.skipLinter ? noop() : applyEsLintFix()
  ]);
}
