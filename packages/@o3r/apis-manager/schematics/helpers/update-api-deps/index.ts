import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getAppModuleFilePath, getProjectFromTree } from '@o3r/schematics';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import {
  addImportToModule,
  addProviderToModule,
  getDecoratorMetadata,
  insertImport,
  isImported
} from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import * as commentJson from 'comment-json';

/**
 * Update app.module file with api manager, if needed
 */
export function updateApiDependencies(): Rule {

  const updateAppModule: Rule = (tree: Tree, context: SchematicContext) => {
    const moduleFilePath = getAppModuleFilePath(tree, context);
    if (!moduleFilePath) {
      return tree;
    }

    const sourceFile = ts.createSourceFile(
      moduleFilePath,
      tree.read(moduleFilePath)!.toString(),
      ts.ScriptTarget.ES2015,
      true
    );

    if (isImported(sourceFile, 'ApiManagerModule', '@otter/common') || isImported(sourceFile, 'ApiManagerModule', '@o3r/apis-manager')) {
      return tree;
    }

    const recorder = tree.beginUpdate(moduleFilePath);
    const ngModulesMetadata = getDecoratorMetadata(sourceFile, 'NgModule', '@angular/core');
    const appModuleFile = tree.read(moduleFilePath)!.toString();
    const moduleIndex = ngModulesMetadata[0] ? ngModulesMetadata[0].pos - ('NgModule'.length + 1) : appModuleFile.indexOf('@NgModule');

    /**
     * Insert import on top of the main module file
     *
     * @param name
     * @param file
     * @param isDefault
     */
    const insertImportToModuleFile = (name: string, file: string, isDefault?: boolean) => {
      const importChange = insertImport(sourceFile, moduleFilePath, name, file, isDefault);
      if (importChange instanceof InsertChange) {
        recorder.insertLeft(importChange.pos, importChange.toAdd);
      }
    };

    /**
     * Add import to the main module
     *
     * @param name
     * @param file
     * @param moduleFunction
     */
    const addImportToModuleFile = (name: string, file: string, moduleFunction?: string) => {
      if (new RegExp(name).test(appModuleFile.substr(moduleIndex))) {
        context.logger.warn(`Skipped ${name} (already imported)`);
        return;
      }
      addImportToModule(sourceFile, moduleFilePath, name, file)
        .forEach((change) => {
          if (change instanceof InsertChange) {
            recorder.insertLeft(change.pos, moduleFunction && change.pos > moduleIndex ? change.toAdd.replace(name, name + moduleFunction) : change.toAdd);
          }
        });
    };

    /**
     * Add providers to the main module
     *
     * @param name
     * @param file
     * @param customProvider
     */
    const addProviderToModuleFile = (name: string, file: string, customProvider?: string) => {
      if (new RegExp(name).test(appModuleFile.substr(moduleIndex))) {
        context.logger.warn(`Skipped ${name} (already provided)`);
        return;
      }
      addProviderToModule(sourceFile, moduleFilePath, name, file)
        .forEach((change) => {
          if (change instanceof InsertChange) {
            recorder.insertLeft(change.pos, customProvider && change.pos > moduleIndex ? change.toAdd.replace(name, customProvider) : change.toAdd);
          }
        });
    };

    /**
     * Add custom code before the module definition
     *
     * @param line
     */
    const insertBeforeModule = (line: string) => {
      recorder.insertLeft(moduleIndex - 1, `${line}\n\n`);
    };

    addImportToModuleFile(
      'ApiManagerModule',
      '@o3r/apis-manager'
    );

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

    context.logger.info(' Please update by hand the placeholders for YOUR_API_ENDPOINT and YOUR_API_KEY!');

    return tree;
  };

  const updateTsConfig: Rule = (tree: Tree, context: SchematicContext) => {
    const workspaceProject = getProjectFromTree(tree);
    const tsconfig: string | undefined =
      workspaceProject.architect &&
      workspaceProject.architect.build &&
      workspaceProject.architect.build.options &&
      workspaceProject.architect.build.options.tsConfig;

    if (!tsconfig) {
      context.logger.warn('No tsconfig found in build target');
      return tree;
    }

    const tsconfigObj: any = commentJson.parse(tree.read(tsconfig)!.toString());
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

    tree.overwrite(tsconfig, commentJson.stringify(tsconfigObj, null, 2));
    return tree;
  };

  return chain([
    updateTsConfig,
    updateAppModule
  ]);
}
