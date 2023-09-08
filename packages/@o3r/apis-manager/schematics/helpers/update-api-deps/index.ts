import {chain, Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {
  getAppModuleFilePath,
  getProjectFromTree,
  addImportToModuleFile as o3rAddImportToModuleFile,
  addProviderToModuleFile as o3rAddProviderToModuleFile,
  insertBeforeModule as o3rInsertBeforeModule,
  insertImportToModuleFile as o3rInsertImportToModuleFile
} from '@o3r/schematics';
import * as ts from 'typescript';
import {getDecoratorMetadata, isImported} from '@schematics/angular/utility/ast-utils';

/**
 * Update app.module file with api manager, if needed
 */
export function updateApiDependencies(options: {projectName?: string | undefined}): Rule {

  const updateAppModule: Rule = (tree: Tree, context: SchematicContext) => {
    const moduleFilePath = getAppModuleFilePath(tree, context, options.projectName);
    if (!moduleFilePath) {
      return tree;
    }
    const sourceFileContent = tree.readText(moduleFilePath);

    const sourceFile = ts.createSourceFile(
      moduleFilePath,
      sourceFileContent,
      ts.ScriptTarget.ES2015,
      true
    );

    if (isImported(sourceFile, 'ApiManagerModule', '@otter/common') || isImported(sourceFile, 'ApiManagerModule', '@o3r/apis-manager')) {
      return tree;
    }

    const recorder = tree.beginUpdate(moduleFilePath);
    const ngModulesMetadata = getDecoratorMetadata(sourceFile, 'NgModule', '@angular/core');
    const moduleIndex = ngModulesMetadata[0] ? ngModulesMetadata[0].pos - ('NgModule'.length + 1) : sourceFileContent.indexOf('@NgModule');

    const addImportToModuleFile = (name: string, file: string) =>
      o3rAddImportToModuleFile(name, file, sourceFile, sourceFileContent, context, recorder, moduleFilePath, moduleIndex);

    const insertImportToModuleFile = (name: string, file: string, isDefault?: boolean) =>
      o3rInsertImportToModuleFile(name, file, sourceFile, recorder, moduleFilePath, isDefault);

    const addProviderToModuleFile = (name: string, file: string, customProvider?: string) =>
      o3rAddProviderToModuleFile(name, file, sourceFile, sourceFileContent, context, recorder, moduleFilePath, moduleIndex, customProvider);

    const insertBeforeModule = (line: string) => o3rInsertBeforeModule(line, sourceFileContent, recorder, moduleIndex);

    insertImportToModuleFile('appendPreconnect', '@o3r/apis-manager', false);

    insertBeforeModule('appendPreconnect(\'https://YOUR_API_ENDPOINT\');');

    addImportToModuleFile('ApiManagerModule', '@o3r/apis-manager');

    insertBeforeModule('const PROXY_SERVER = \'https://YOUR_API_ENDPOINT\';');
    insertBeforeModule(`
export function apiManagerFactory(): ApiManager {
  const apiClient = new ApiFetchClient({
    basePath: PROXY_SERVER,
    requestPlugins: [new ApiKeyRequest(/* API Key */ 'YOUR_API_KEY', 'Authorization')]
  });

  return new ApiManager(apiClient);
}`);

    addProviderToModuleFile('API_TOKEN', '@o3r/apis-manager', '{provide: API_TOKEN, useFactory: apiManagerFactory}');

    insertImportToModuleFile('ApiManager', '@o3r/apis-manager', false);
    insertImportToModuleFile('ApiFetchClient', '@ama-sdk/core', false);
    insertImportToModuleFile('ApiKeyRequest', '@ama-sdk/core', false);

    tree.commitUpdate(recorder);

    context.logger.info('Please update by hand the placeholders for YOUR_API_ENDPOINT and YOUR_API_KEY!');

    return tree;
  };

  const updateTsConfig: Rule = (tree: Tree, context: SchematicContext) => {
    const workspaceProject = getProjectFromTree(tree, options.projectName);
    const tsconfig: string | undefined =
      workspaceProject &&
      workspaceProject.architect &&
      workspaceProject.architect.build &&
      workspaceProject.architect.build.options &&
      workspaceProject.architect.build.options.tsConfig;

    if (!tsconfig) {
      context.logger.warn('No tsconfig found in build target');
      return tree;
    }

    ts.parseConfigFileTextToJson(tsconfig, tree.readText(tsconfig));
    const tsconfigObj = ts.parseConfigFileTextToJson(tsconfig, tree.readText(tsconfig)).config;
    if (!tsconfigObj.compilerOptions) {
      tsconfigObj.compilerOptions = {};
    }

    if (!tsconfigObj.compilerOptions.lib) {
      tsconfigObj.compilerOptions.lib = [];
    }

    tsconfigObj.compilerOptions.lib.push('scripthost');
    tsconfigObj.compilerOptions.lib.push('es2020');
    tsconfigObj.compilerOptions.lib.push('dom');
    tsconfigObj.compilerOptions.lib = tsconfigObj.compilerOptions.lib.reduce((acc: string[], lib: string) => acc.indexOf(lib) >= 0 ? acc : [...acc, lib], []);

    tree.overwrite(tsconfig, JSON.stringify(tsconfigObj, null, 2));
    return tree;
  };

  return chain([
    updateTsConfig,
    updateAppModule
  ]);
}
