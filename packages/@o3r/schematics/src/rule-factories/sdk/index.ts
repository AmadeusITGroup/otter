import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import {
  addImportToModule,
  addProviderToModule,
  getDecoratorMetadata,
  insertImport
} from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { addPackageJsonDependency, NodeDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as commentJson from 'comment-json';
import * as path from 'node:path';
import { getExternalDependenciesVersionRange, getNodeDependencyList } from '../../utility/dependencies';
import { getProjectFromTree } from '../../utility/loaders';
import { getAppModuleFilePath } from '../../utility/modules';

const packageJsonPath = path.resolve(__dirname, '..', '..', '..', '..', 'package.json');
const dapiSDKDep = '@dapi/sdk';
const dapiSDKCoreDep = '@dapi/sdk-core';

/**
 * Update Package.json dependencies and add DAPI packages
 *
 * @param options @see RuleFactory.options
 * @param rootPath @see RuleFactory.rootPath
 * @param options.projectName
 * @param options.isSymlinksNeeded
 * @param _rootPath
 */
export function updateDapiDependencies(options: { projectName: string | null; isSymlinksNeeded: boolean }, _rootPath: string): Rule {

  const addDependencies: Rule = (tree: Tree, _context: SchematicContext) => {
    const workspaceProject = getProjectFromTree(tree, options.projectName || undefined);
    const type: NodeDependencyType = workspaceProject.projectType === 'application' ? NodeDependencyType.Default : NodeDependencyType.Peer;

    const dapiDependencies: NodeDependency[] = getNodeDependencyList(
      getExternalDependenciesVersionRange([dapiSDKDep, dapiSDKCoreDep], packageJsonPath),
      type
    );

    dapiDependencies.forEach((dep) => addPackageJsonDependency(tree, dep));

    return tree;
  };

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
      '@otter/common'
    );

    insertBeforeModule('const PROXY_SERVER = \'https://proxy.digitalforairlines.com/v2\';');
    insertBeforeModule(`
export function dapiApiManagerFactory(): ApiManager {
  const apiClient = new ApiFetchClient({
    basePath: PROXY_SERVER,
    requestPlugins: [new ApiKeyRequest(/* API Key */ 'HudqcZSuXzXgR3YgsUlwoBZZ0Ue137tx', 'Authorization')]
  });

  return new ApiManager(apiClient);
}`);

    addProviderToModuleFile('API_TOKEN', '@otter/common', '{provide: API_TOKEN, useFactory: dapiApiManagerFactory}');

    insertImportToModuleFile('ApiManager', '@otter/core', false);
    insertImportToModuleFile('ApiFetchClient', '@dapi/sdk-core', false);
    insertImportToModuleFile('ApiKeyRequest', '@dapi/sdk-core', false);

    tree.commitUpdate(recorder);

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
    addDependencies,
    updateTsConfig,
    updateAppModule
  ]);
}
