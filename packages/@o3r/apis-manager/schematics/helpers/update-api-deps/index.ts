import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  getAppModuleFilePath,
  getModuleIndex,
  getWorkspaceConfig,
  insertBeforeModule as o3rInsertBeforeModule,
  insertImportToModuleFile as o3rInsertImportToModuleFile,
} from '@o3r/schematics';
import {
  addRootProvider,
} from '@schematics/angular/utility';
import {
  isImported,
} from '@schematics/angular/utility/ast-utils';
import * as ts from 'typescript';
import type {
  NgAddSchematicsSchema,
} from '../../ng-add/schema';

/**
 * Update app-module file with api manager, if needed
 * @param options
 */
export function updateApiDependencies(options: NgAddSchematicsSchema): Rule {
  const updateAppModule: Rule = (tree: Tree, context: SchematicContext) => {
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

    if (isImported(sourceFile, 'provideApiManager', '@otter/common') || isImported(sourceFile, 'provideApiManager', '@o3r/apis-manager')) {
      return tree;
    }

    const recorder = tree.beginUpdate(moduleFilePath);
    const { moduleIndex } = getModuleIndex(sourceFile, sourceFileContent);

    const insertImportToModuleFile = (name: string, file: string, isDefault?: boolean) =>
      o3rInsertImportToModuleFile(name, file, sourceFile, recorder, moduleFilePath, isDefault);

    const insertBeforeModule = (line: string) => o3rInsertBeforeModule(line, sourceFileContent, recorder, moduleIndex);

    insertImportToModuleFile('appendPreconnect', '@o3r/apis-manager', false);

    insertBeforeModule('const PROXY_SERVER = \'https://YOUR_API_ENDPOINT\';');

    insertBeforeModule('appendPreconnect(PROXY_SERVER);');

    insertImportToModuleFile('provideApiManager', '@o3r/apis-manager', false);

    if (!options.skipCodeSample) {
      insertBeforeModule(`
const apiConfig = new ApiFetchClient({
  basePath: PROXY_SERVER,
  requestPlugins: [new ApiKeyRequest(/* API Key */ 'YOUR_API_KEY', 'Authorization')]
});

const apiManager = new ApiManager(apiConfig);`);

      additionalRules.push(
        addRootProvider(options.projectName!, ({ code }) => code`provideApiManager(apiManager)`)
      );
      insertImportToModuleFile('ApiFetchClient', '@ama-sdk/client-fetch', false);
    }

    insertImportToModuleFile('ApiManager', '@o3r/apis-manager', false);
    insertImportToModuleFile('ApiKeyRequest', '@ama-sdk/core', false);

    tree.commitUpdate(recorder);

    context.logger.info('Please update by hand the placeholders for YOUR_API_ENDPOINT and YOUR_API_KEY!');

    return chain(additionalRules)(tree, context);
  };

  const updateTsConfig: Rule = (tree: Tree, context: SchematicContext) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const tsconfig: string | undefined = workspaceProject
      && workspaceProject.architect
      && workspaceProject.architect.build
      && workspaceProject.architect.build.options
      && workspaceProject.architect.build.options.tsConfig;

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

    tsconfigObj.compilerOptions.lib.push('scripthost', 'es2020', 'dom');
    tsconfigObj.compilerOptions.lib = tsconfigObj.compilerOptions.lib.reduce((acc: string[], lib: string) => acc.includes(lib) ? acc : [...acc, lib], []);

    tree.overwrite(tsconfig, JSON.stringify(tsconfigObj, null, 2));
    return tree;
  };

  return chain([
    updateTsConfig,
    updateAppModule
  ]);
}
