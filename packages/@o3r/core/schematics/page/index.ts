import { strings } from '@angular-devkit/core';
import { apply, chain, externalSchematic, MergeStrategy, mergeWith, move, noop, renameTemplateFiles, Rule, schematic, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import * as path from 'node:path';

import { applyEsLintFix, getDestinationPath, getProjectFromTree, insertRoute, Route } from '@o3r/schematics';
import { NgGeneratePageSchematicsSchema } from './schema';
import { getAddConfigurationRules } from '../rule-factories/component/configuration';
import { getAddThemingRules } from '../rule-factories/component/theming';
import { getAddLocalizationRules } from '../rule-factories/component/localization';
import { getAddFixtureRules } from '../rule-factories/component/fixture';

/**
 * Add a Page to an Otter project
 *
 * @param options
 */
export function ngGeneratePage(options: NgGeneratePageSchematicsSchema): Rule {

  const isApplication = (tree: Tree) => {
    const workspaceProject = getProjectFromTree(tree, null, 'application');
    if (!workspaceProject) {
      throw new Error('Cannot create a page on library');
    }

    return tree;
  };

  const pageName = strings.classify(options.name);

  /**
   * Generates page files.
   *
   * @param tree File tree
   * @param context Context of the rule
   */
  const generateFiles = async (tree: Tree, context: SchematicContext): Promise<Rule> => {
    const workspaceProject = getProjectFromTree(tree, null, 'application');
    if (!workspaceProject) {
      context.logger.warn('No application detected in this project, the page cannot be generated');
      return () => tree;
    }
    const destination = getDestinationPath('@o3r/core:page', options.path, tree);
    const pagePath = path.posix.join(destination, strings.dasherize(options.scope), strings.dasherize(options.name));
    const dasherizedPageName = strings.dasherize(options.name);
    const projectName = workspaceProject.name;
    const componentPath = path.posix.join(pagePath, `${dasherizedPageName}.component.ts`);
    const ngSpecPath = path.posix.join(pagePath, `${dasherizedPageName}.component.spec.ts`);
    const o3rSpecPath = path.posix.join(pagePath, `${dasherizedPageName}.spec.ts`);
    const ngStylePath = path.posix.join(pagePath, `${dasherizedPageName}.component.scss`);
    const o3rStylePath = path.posix.join(pagePath, `${dasherizedPageName}.style.scss`);
    const ngTemplatePath = path.posix.join(pagePath, `${dasherizedPageName}.component.html`);
    const o3rTemplatePath = path.posix.join(pagePath, `${dasherizedPageName}.template.html`);

    const rules: Rule[] = [];

    if (!options.standalone) {
      rules.push(
        externalSchematic('@schematics/angular', 'module', {
          project: projectName,
          path: pagePath,
          flat: true,
          name: pageName
        })
      );
    }

    rules.push(
      externalSchematic('@schematics/angular', 'component', {
        project: projectName,
        selector: `${options.prefix || 'o3r'}-${dasherizedPageName}`,
        path: pagePath,
        name: pageName,
        inlineStyle: false,
        inlineTemplate: false,
        viewEncapsulation: 'None',
        changeDetection: 'OnPush',
        style: 'scss',
        type: 'Component',
        skipSelector: false,
        standalone: options.standalone,
        ...(
          options.standalone ? {
            skipImport: true
          } : {
            module: `${dasherizedPageName}.module.ts`,
            export: true
          }
        ),
        flat: true
      }),
      // Angular schematics generate spec file with this pattern: component-name.component.spec.ts
      move(ngSpecPath, o3rSpecPath),
      // Angular schematics generate style file with this pattern: component-name.component.scss
      chain([
        move(ngStylePath, o3rStylePath),
        (t) => {
          t.overwrite(
            componentPath,
            t.readText(componentPath).replace(
              path.basename(ngStylePath),
              path.basename(o3rStylePath)
            )
          );
          return t;
        }
      ]),
      // Angular schematics generate template file with this pattern: component-name.component.html
      chain([
        move(ngTemplatePath, o3rTemplatePath),
        (t) => {
          t.overwrite(
            componentPath,
            t.readText(componentPath).replace(
              path.basename(ngTemplatePath),
              path.basename(o3rTemplatePath)
            )
          );
          return t;
        }
      ]),
      schematic('convert-component', {
        path: componentPath,
        skipLinter: options.skipLinter,
        componentType: 'Page'
      })
    );

    rules.push(mergeWith(apply(url('./templates'), [
      template({
        ...strings,
        ...options,
        pageName
      }),
      renameTemplateFiles(),
      move(pagePath)
    ]), MergeStrategy.Overwrite));

    const configurationRules = await getAddConfigurationRules(
      componentPath,
      options,
      context
    );
    rules.push(...configurationRules);

    const themingRules = await getAddThemingRules(
      o3rStylePath,
      options,
      context
    );
    rules.push(...themingRules);

    const localizationRules = await getAddLocalizationRules(
      componentPath,
      options,
      context
    );
    rules.push(...localizationRules);

    const fixtureRules = await getAddFixtureRules(
      componentPath,
      {
        ...options,
        useComponentFixtures: options.usePageFixtures
      },
      context,
      true
    );
    rules.push(...fixtureRules);

    return chain(rules);
  };

  /**
   * Updates App Routing Module to add the new page route.
   *
   * @param tree File tree
   * @param context Context of the rule
   */
  const updateAppRoutingModule: Rule = (tree: Tree, context: SchematicContext) => {
    const indexFilePath = path.posix.join(strings.dasherize(options.scope), strings.dasherize(options.name), 'index');
    const route: Route = {
      path: strings.dasherize(options.name),
      import: `./${indexFilePath.replace(/[\\/]/g, '/')}`,
      module: `${pageName}${options.standalone ? 'Component' : 'Module'}`
    };

    return insertRoute(tree, context, options.appRoutingModulePath, route, options.standalone);
  };

  return chain([
    isApplication,
    generateFiles,
    updateAppRoutingModule,
    options.skipLinter ? noop() : applyEsLintFix()
  ]);
}
