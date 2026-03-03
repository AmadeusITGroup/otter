import * as path from 'node:path';
import {
  strings,
} from '@angular-devkit/core';
import {
  apply,
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  renameTemplateFiles,
  Rule,
  schematic,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  addImportToModuleFile,
  applyEsLintFix,
  createOtterSchematic,
  getAppModuleFilePath,
  getDestinationPath,
  getModuleIndex,
  getWorkspaceConfig,
  insertRoute,
  O3rCliError,
  Route,
} from '@o3r/schematics';
import * as ts from 'typescript';
import {
  getAddConfigurationRules,
} from '../rule-factories/component/configuration';
import {
  getAddFixtureRules,
} from '../rule-factories/component/fixture';
import {
  getAddLocalizationRules,
} from '../rule-factories/component/localization';
import {
  NgGeneratePageSchematicsSchema,
} from './schema';

/**
 * Add a Page to an Otter project
 * @param options
 */
function ngGeneratePageFn(options: NgGeneratePageSchematicsSchema): Rule {
  const isApplication = (tree: Tree) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    if (!workspaceProject) {
      throw new O3rCliError('Cannot create a page on library');
    }

    return tree;
  };

  const pageName = strings.classify(options.name);

  /**
   * Generates page files.
   * @param tree File tree
   * @param context Context of the rule
   */
  const generateFiles = (tree: Tree, context: SchematicContext): Rule => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    if (!workspaceProject) {
      context.logger.warn('No application detected in this project, the page cannot be generated');
      return noop;
    }
    options.type ??= '';
    const destination = getDestinationPath('@o3r/core:page', options.path, tree, options.projectName);
    const pagePath = path.posix.join(destination, strings.dasherize(options.scope), strings.dasherize(options.name));
    const dasherizedPageName = strings.dasherize(options.name);
    const projectName = options.projectName;
    const componentPath = path.posix.join(pagePath, `${dasherizedPageName}${options.type ? '.' + options.type : ''}.ts`);
    const moduleFileName = `${dasherizedPageName}-module.ts`;
    const moduleFilePath = path.posix.join(pagePath, moduleFileName);

    const rules: Rule[] = [];

    if (!options.standalone) {
      rules.push(
        externalSchematic('@schematics/angular', 'module', {
          project: projectName,
          path: pagePath,
          flat: true,
          name: pageName
        }),
        () => {
          const sourceFileContent = tree.readText(moduleFilePath);
          const sourceFile = ts.createSourceFile(
            moduleFilePath,
            sourceFileContent,
            ts.ScriptTarget.ES2015,
            true
          );
          const recorder = tree.beginUpdate(moduleFilePath);
          const { moduleIndex } = getModuleIndex(sourceFile, sourceFileContent);

          addImportToModuleFile(
            'RouterModule',
            '@angular/router',
            sourceFile,
            sourceFileContent,
            context,
            recorder,
            moduleFilePath,
            moduleIndex,
            `.forChild([{path: '', component: ${strings.classify(pageName)}}])`,
            true
          );
          tree.commitUpdate(recorder);
          return tree;
        }
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
        type: options.type,
        skipSelector: false,
        standalone: options.standalone,
        ...(
          options.standalone
            ? {
              skipImport: true
            }
            : {
              module: `${dasherizedPageName}-module.ts`,
              export: true
            }
        ),
        flat: true
      }),
      schematic('convert-component', {
        path: componentPath,
        skipLinter: options.skipLinter,
        componentType: 'Page'
      }),
      mergeWith(apply(url('./templates'), [
        template({
          ...strings,
          ...options,
          pageName
        }),
        renameTemplateFiles(),
        move(pagePath)
      ]), MergeStrategy.Overwrite),
      getAddConfigurationRules(
        componentPath,
        options
      ),
      getAddLocalizationRules(
        componentPath,
        options
      ),
      getAddFixtureRules(
        componentPath,
        {
          skipLinter: options.skipLinter,
          useComponentFixtures: options.usePageFixtures
        },
        true
      )
    );

    return chain(rules);
  };

  /**
   * Updates App Routing Module to add the new page route.
   * @param tree File tree
   * @param context Context of the rule
   */
  const updateAppRoutingModule: Rule = (tree: Tree, context: SchematicContext) => {
    const indexFilePath = path.posix.join(strings.dasherize(options.scope), strings.dasherize(options.name), 'index');
    const route = {
      path: strings.dasherize(options.name),
      import: `./${indexFilePath.replace(/[/\\]/g, '/')}`,
      module: `${pageName}${options.standalone ? (options.type ? strings.classify(options.type) : '') : 'Module'}`
    } as const satisfies Route;
    if (options.appRoutingModulePath) {
      return insertRoute(tree, context, options.appRoutingModulePath, route, options.standalone);
    }
    const appModuleFilePath = getAppModuleFilePath(tree, context, options.projectName);
    if (appModuleFilePath) {
      const text = tree.readText(appModuleFilePath);
      const match = text.match(/(provideRouter|RouterModule\.forRoot)\((\s*)?(?<routeVarName>[^\s),]*)/);
      const routeVariableName = match?.groups?.routeVarName;
      if (routeVariableName) {
        const sourceFile = ts.createSourceFile(
          appModuleFilePath,
          text,
          ts.ScriptTarget.ES2015,
          true
        );
        const importStatement = sourceFile.statements.find((statement): statement is ts.ImportDeclaration =>
          ts.isImportDeclaration(statement)
          && !!statement?.moduleSpecifier
          && ts.isStringLiteral(statement.moduleSpecifier)
          && !!statement.importClause?.namedBindings
          && ts.isNamedImports(statement.importClause.namedBindings)
          && statement.importClause.namedBindings.elements.some((element) => element.name.escapedText.toString() === routeVariableName)
        );
        const importRouteVariablePath = (importStatement?.moduleSpecifier as ts.StringLiteral | undefined)?.text;
        // If importRouteVariablePath is undefined it is because the variable is defined in this file
        const appRoutingModulePath = importRouteVariablePath ? path.join(path.dirname(appModuleFilePath), `${importRouteVariablePath}.ts`) : appModuleFilePath;

        return insertRoute(tree, context, appRoutingModulePath, route, options.standalone);
      }
    }
    throw new O3rCliError('No routes definition found. Please use the option `appRoutingModulePath` to specify the path of the routes definition.');
  };

  return chain([
    isApplication,
    generateFiles,
    updateAppRoutingModule,
    options.skipLinter ? noop() : applyEsLintFix()
  ]);
}

/**
 * Add a Page to an Otter project
 * @param options
 */
export const ngGeneratePage = createOtterSchematic(ngGeneratePageFn);
