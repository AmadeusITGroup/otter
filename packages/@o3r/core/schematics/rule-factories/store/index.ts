import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { getDecoratorMetadata, isImported } from '@schematics/angular/utility/ast-utils';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as path from 'node:path';

import {
  getAppModuleFilePath,
  getProjectFromTree,
  isApplicationThatUsesRouterModule,
  ngAddPeerDependencyPackages,
  addImportToModuleFile as o3rAddImportToModuleFile,
  insertBeforeModule as o3rInsertBeforeModule,
  insertImportToModuleFile as o3rInsertImportToModuleFile
} from '@o3r/schematics';

const packageJsonPath = path.resolve(__dirname, '..', '..', '..', 'package.json');
const ngrxEffectsDep = '@ngrx/effects';
const ngrxEntityDep = '@ngrx/entity';
const ngrxStoreDep = '@ngrx/store';
/** @deprecated to be removed in v10 */
const ngrxStoreLocalstorageDep = 'ngrx-store-localstorage';
const ngrxRouterStore = '@ngrx/router-store';
const ngrxRouterStoreDevToolDep = '@ngrx/store-devtools';

/**
 * Add Redux Store support
 *
 * @param options @see RuleFactory.options
 * @param rootPath @see RuleFactory.rootPath
 * @param options.projectName
 * @param _rootPath
 */
export function updateStore(options: { projectName: string | null }, _rootPath: string): Rule {
  /**
   * Changed package.json start script to run localization generation
   *
   * @param tree
   * @param context
   */
  const updatePackageJson: Rule = (tree: Tree, context: SchematicContext) => {
    const workspaceProject = getProjectFromTree(tree, options.projectName || undefined);
    const type: NodeDependencyType = workspaceProject.projectType === 'application' ? NodeDependencyType.Default : NodeDependencyType.Peer;

    let dependenciesList = [ngrxEffectsDep, ngrxEntityDep, ngrxStoreDep, ngrxStoreLocalstorageDep, ngrxRouterStoreDevToolDep];
    dependenciesList = isApplicationThatUsesRouterModule(tree) ? [...dependenciesList, ngrxRouterStore] : dependenciesList;

    return () => {
      try {
        return ngAddPeerDependencyPackages(dependenciesList, packageJsonPath, type, options)(tree, context);
      } catch (e: any) {
        context.logger.warn(`Could not find generatorDependency ${dependenciesList.join(', ')} in file ${packageJsonPath}`);
        return tree;
      }
    };
  };

  /**
   * Edit main module with the translation required configuration
   *
   * @param tree
   * @param context
   */
  const registerModules: Rule = (tree: Tree, context: SchematicContext) => {
    const moduleFilePath = getAppModuleFilePath(tree, context);
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

    // If we already have a store module skip the process to avoid overriding configurations
    if (isImported(sourceFile, 'StoreModule', '@ngrx/store')) {
      return tree;
    }

    let recorder = tree.beginUpdate(moduleFilePath);
    const ngModulesMetadata = getDecoratorMetadata(sourceFile, 'NgModule', '@angular/core');
    const moduleIndex = ngModulesMetadata[0] ? ngModulesMetadata[0].pos - ('NgModule'.length + 1) : sourceFileContent.indexOf('@NgModule');

    const addImportToModuleFile = (name: string, file: string, moduleFunction?: string) =>
      recorder = o3rAddImportToModuleFile(name, file, sourceFile, sourceFileContent, context, recorder, moduleFilePath, moduleIndex, moduleFunction);

    const insertImportToModuleFile = (name: string, file: string, isDefault?: boolean) =>
      recorder = o3rInsertImportToModuleFile(name, file, sourceFile, recorder, moduleFilePath, isDefault);

    const insertBeforeModule = (line: string) => recorder = o3rInsertBeforeModule(line, sourceFileContent, recorder, moduleIndex);

    addImportToModuleFile(
      'EffectsModule',
      '@ngrx/effects',
      '.forRoot([])'
    );
    addImportToModuleFile(
      'StoreModule',
      '@ngrx/store',
      '.forRoot(rootReducers, {metaReducers, runtimeChecks})'
    );

    insertImportToModuleFile('StorageSync', '@o3r/core');
    insertImportToModuleFile('RuntimeChecks', '@ngrx/store');
    insertImportToModuleFile('Serializer', '@o3r/core');
    insertImportToModuleFile('environment', '../environments/environment');

    if (isApplicationThatUsesRouterModule(tree)) {
      addImportToModuleFile(
        'StoreRouterConnectingModule',
        '@ngrx/router-store',
        '.forRoot()'
      );
      insertImportToModuleFile('routerReducer', '@ngrx/router-store');
    }

    insertBeforeModule(`
const localStorageStates: Record<string, Serializer<any>>[] = [/* Store to register in local storage */];
const storageSync = new StorageSync({
  keys: localStorageStates, rehydrate: true
});

const rootReducers = {
  ${isApplicationThatUsesRouterModule(tree) ? 'router: routerReducer' : ''}
};

const metaReducers = [storageSync.localStorageSync()];
const runtimeChecks: Partial<RuntimeChecks> = {
  strictActionImmutability: false,
  strictActionSerializability: false,
  strictActionTypeUniqueness: !environment.production,
  strictActionWithinNgZone: !environment.production,
  strictStateImmutability: !environment.production,
  strictStateSerializability: false
};`);

    tree.commitUpdate(recorder);

    return tree;
  };

  return chain([
    registerModules,
    updatePackageJson
  ]);
}
