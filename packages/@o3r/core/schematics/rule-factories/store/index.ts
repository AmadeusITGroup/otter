import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  getAppModuleFilePath,
  getModuleIndex,
  getWorkspaceConfig,
  isApplicationThatUsesRouterModule,
  ngAddPackages,
  ngAddPeerDependencyPackages,
  insertBeforeModule as o3rInsertBeforeModule,
  insertImportToModuleFile as o3rInsertImportToModuleFile
} from '@o3r/schematics';
import { WorkspaceProject } from '@o3r/schematics';
import { addRootImport } from '@schematics/angular/utility';
import { isImported } from '@schematics/angular/utility/ast-utils';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as path from 'node:path';
import * as ts from 'typescript';
import * as fs from 'node:fs';

const packageJsonPath = path.resolve(__dirname, '..', '..', '..', 'package.json');
const ngrxEffectsDep = '@ngrx/effects';
const ngrxEntityDep = '@ngrx/entity';
const ngrxStoreDep = '@ngrx/store';
const ngrxRouterStore = '@ngrx/router-store';
const ngrxRouterStoreDevToolDep = '@ngrx/store-devtools';
const fastDeepEqualDep = 'fast-deep-equal';

/**
 * Add Redux Store support
 *
 * @param options @see RuleFactory.options
 * @param rootPath @see RuleFactory.rootPath
 * @param options.projectName
 * @param projectType
 */
export function updateStore(options: { projectName?: string | undefined; workingDirectory?: string | undefined}, projectType?: WorkspaceProject['projectType']): Rule {

  const addStoreModules: Rule = (tree) => {
    const coreSchematicsFolder = path.resolve(__dirname, '..', '..');
    const corePackageJsonPath = path.resolve(coreSchematicsFolder, '..', 'package.json');
    const corePackageJsonContent = JSON.parse(fs.readFileSync(corePackageJsonPath, { encoding: 'utf-8' }));
    const o3rCoreVersion = corePackageJsonContent.version;
    const workspaceConfig = getWorkspaceConfig(tree);
    const workspaceProject = options.projectName && workspaceConfig?.projects?.[options.projectName] || undefined;
    const projectDirectory = workspaceProject?.root;

    return ngAddPackages(['@o3r/store-sync'],
      {
        skipConfirmation: true,
        version: o3rCoreVersion,
        parentPackageInfo: '@o3r/core - setup',
        projectName: options.projectName,
        dependencyType: NodeDependencyType.Default,
        workingDirectory: projectDirectory
      }
    );
  };

  /**
   * Changed package.json start script to run localization generation
   *
   * @param tree
   * @param context
   */
  const updatePackageJson: Rule = (tree: Tree, context: SchematicContext) => {
    const type = projectType === 'library' ? NodeDependencyType.Peer : NodeDependencyType.Default;

    const appDeps = [ngrxEffectsDep, ngrxRouterStoreDevToolDep, fastDeepEqualDep];
    const corePeerDeps = [ngrxEntityDep, ngrxStoreDep];
    let dependenciesList = [...corePeerDeps];

    if (projectType === 'application') {
      dependenciesList = [...dependenciesList, ...appDeps];
      dependenciesList = isApplicationThatUsesRouterModule(tree, options) ? [...dependenciesList, ngrxRouterStore] : dependenciesList;
    }


    return () => {
      try {
        return ngAddPeerDependencyPackages(dependenciesList, packageJsonPath, type, {...options, skipNgAddSchematicRun: true})(tree, context);
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
    const additionalRules: Rule[] = [];
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

    // If we already have a store module skip the process to avoid overriding configurations
    if (isImported(sourceFile, 'StoreModule', '@ngrx/store')) {
      return tree;
    }

    let recorder = tree.beginUpdate(moduleFilePath);
    const { moduleIndex } = getModuleIndex(sourceFile, sourceFileContent);

    const addImportToModuleFile = (name: string, file: string, moduleFunction?: string) => additionalRules.push(
      addRootImport(options.projectName!, ({code, external}) => code`${external(name, file)}${moduleFunction}`)
    );

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

    insertImportToModuleFile('StorageSync', '@o3r/store-sync');
    insertImportToModuleFile('RuntimeChecks', '@ngrx/store');
    insertImportToModuleFile('Serializer', '@o3r/core');
    insertImportToModuleFile('environment', '../environments/environment');

    if (isApplicationThatUsesRouterModule(tree, options)) {
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
  ${isApplicationThatUsesRouterModule(tree, options) ? 'router: routerReducer' : ''}
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

    return chain(additionalRules)(tree, context);
  };

  return chain([
    ...(projectType === 'application' ? [registerModules, addStoreModules] : []),
    updatePackageJson
  ]);
}
