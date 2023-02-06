import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { addImportToModule, getDecoratorMetadata, insertImport, isImported } from '@schematics/angular/utility/ast-utils';
import { addPackageJsonDependency, NodeDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as path from 'node:path';

import { getAppModuleFilePath, getExternalDependenciesVersionRange, getNodeDependencyList, getProjectFromTree, isApplicationThatUsesRouterModule } from '@o3r/schematics';
import { InsertChange } from '@schematics/angular/utility/change';

const packageJsonPath = path.resolve(__dirname, '..', '..', '..', 'package.json');
const ngrxEffectsDep = '@ngrx/effects';
const ngrxEntityDep = '@ngrx/entity';
const ngrxStoreDep = '@ngrx/store';
const ngrxStoreLocalstorageDep = 'ngrx-store-localstorage';
const ngrxRouterStore = '@ngrx/router-store';

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
   * @param _context
   */
  const updatePackageJson: Rule = (tree: Tree, context: SchematicContext) => {
    const workspaceProject = getProjectFromTree(tree, options.projectName || undefined);
    const type: NodeDependencyType = workspaceProject.projectType === 'application' ? NodeDependencyType.Default : NodeDependencyType.Peer;

    let dependenciesList = [ngrxEffectsDep, ngrxEntityDep, ngrxStoreDep, ngrxStoreLocalstorageDep];
    dependenciesList = isApplicationThatUsesRouterModule(tree) ? [...dependenciesList, ngrxRouterStore] : dependenciesList;
    try {
      const dependencies: NodeDependency[] = getNodeDependencyList(
        getExternalDependenciesVersionRange(dependenciesList, packageJsonPath),
        type
      );
      dependencies.forEach((dep) => addPackageJsonDependency(tree, dep));
    } catch (e: any) {
      context.logger.warn(`Could not find generatorDependency ${dependenciesList.join(', ')} in file ${packageJsonPath}`);
    }

    return tree;
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

    const sourceFile = ts.createSourceFile(
      moduleFilePath,
      tree.read(moduleFilePath)!.toString(),
      ts.ScriptTarget.ES2015,
      true
    );

    // If we already have a store module skip the process to avoid overriding configurations
    if (isImported(sourceFile, 'StoreModule', '@ngrx/store')) {
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
     * Add custom code before the module definition
     *
     * @param line
     */
    const insertBeforeModule = (line: string) => {
      recorder.insertLeft(moduleIndex - 1, `${line}\n\n`);
    };

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
    insertImportToModuleFile('Action', '@ngrx/store');
    insertImportToModuleFile('ActionReducer', '@ngrx/store');
    insertImportToModuleFile('Serializer', '@o3r/core');
    insertImportToModuleFile('localStorageSync', 'ngrx-store-localstorage');
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
    updatePackageJson,
    registerModules
  ]);
}
