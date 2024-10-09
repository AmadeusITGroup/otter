import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  getAppModuleFilePath,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  type SetupDependenciesOptions
} from '@o3r/schematics';
import * as ts from 'typescript';
import { addRootImport } from '@schematics/angular/utility';
import { insertImport, isImported } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import * as path from 'node:path';
import * as fs from 'node:fs';
import type { PackageJson } from 'type-fest';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';

const packageJsonPath = path.resolve(__dirname, '..', '..', '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' })) as PackageJson & { generatorDependencies: Record<string, string> };
const ngrxStoreDevtoolsDep = '@ngrx/store-devtools';

/**
 * Add additional modules for dev only
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param options.workingDirectory the directory where to execute the rule factory
 * @param dependenciesSetupConfig
 */
export function updateAdditionalModules(options: { projectName?: string | undefined; workingDirectory?: string | undefined }, dependenciesSetupConfig: SetupDependenciesOptions): Rule {
  /**
   * Update package.json to add additional modules dependencies
   * @param tree
   */
  const updatePackageJson: Rule = (tree) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const types = getProjectNewDependenciesTypes(workspaceProject);
    dependenciesSetupConfig.dependencies.chokidar = {
      inManifest: [{
        range: packageJson.peerDependencies!.chokidar,
        types: [NodeDependencyType.Dev]
      }]
    };

    dependenciesSetupConfig.dependencies[ngrxStoreDevtoolsDep] = {
      inManifest: [{
        range: packageJson.generatorDependencies[ngrxStoreDevtoolsDep],
        types
      }]
    };

    return tree;
  };

  /**
   * Import additional modules in AppModule
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
    // if the app already uses store dev tools do nothing; if additionalModules is already imported do nothing to avoid the double imports
    if (isImported(sourceFile, 'StoreDevtoolsModule', ngrxStoreDevtoolsDep) || isImported(sourceFile, 'additionalModules', '../environments/environment')) {
      return tree;
    }

    const addImportToModuleFile = (name: string, file: string, moduleFunction?: string) => additionalRules.push(
      addRootImport(options.projectName!, ({code, external}) => code`\n${external(name, file)}${moduleFunction}`)
    );

    addImportToModuleFile(
      'additionalModules',
      '../environments/environment'
    );

    return chain(additionalRules)(tree, context);
  };

  /**
   * Register additional modules for development
   * @param tree
   * @param context
   */
  const registerDevAdditionalModules: Rule = (tree: Tree, context: SchematicContext) => {

    const moduleFilePath = getAppModuleFilePath(tree, context, options.projectName);
    if (!moduleFilePath) {
      return tree;
    }

    const sourceFile = ts.createSourceFile(
      moduleFilePath,
      tree.read(moduleFilePath)!.toString(),
      ts.ScriptTarget.ES2015,
      true
    );
    // if we already have the StoreDevtoolsModule in app module file, do nothing to avoid overriding the already existing config
    if (isImported(sourceFile, 'StoreDevtoolsModule', ngrxStoreDevtoolsDep)) {
      return tree;
    }

    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;

    if (!workspaceProject) {
      context.logger.warn('No application detected in the project, the development modules will not be added.');
      return tree;
    }
    const mainFilePath = workspaceProject.architect!.build.options.main ?? workspaceProject.architect!.build.options.browser;

    // supposing we are in ng 15, the env dev file name is environment.development.ts
    let envDevFilePath = path.join(path.dirname(mainFilePath), 'environments', 'environment.development.ts');
    if (!tree.exists(envDevFilePath)) {
      // we are in ng 14, environment dev file name is: environment.ts
      envDevFilePath = path.join(path.dirname(mainFilePath), 'environments', 'environment.ts');
    }
    if (!tree.exists(envDevFilePath)) { // if we don't use the env setup, we skip the step
      context.logger.warn(` Cannot find environment in ${envDevFilePath}`);
      return tree;
    }

    const sourceFileEnvDev = ts.createSourceFile(
      envDevFilePath,
      tree.read(envDevFilePath)!.toString(),
      ts.ScriptTarget.ES2015,
      true
    );

    // if we already have the StoreDevtoolsModule in environment dev file, do nothing to avoid overriding the already existing config
    if (isImported(sourceFileEnvDev, 'StoreDevtoolsModule', ngrxStoreDevtoolsDep)) {
      return tree;
    }

    const recorder = tree.beginUpdate(envDevFilePath);

    const importChange = insertImport(sourceFileEnvDev, envDevFilePath, 'StoreDevtoolsModule', ngrxStoreDevtoolsDep);
    if (importChange instanceof InsertChange) {
      recorder.insertLeft(importChange.pos, `${importChange.toAdd}\n`);
    }

    recorder.insertRight(sourceFileEnvDev.getEnd(), `\nexport const additionalModules = [
  StoreDevtoolsModule.instrument()
];\n`);

    tree.commitUpdate(recorder);

    return tree;
  };

  /**
   * Register additional modules for production
   * @param tree
   * @param context
   */
  const registerProdAdditionalModules: Rule = (tree: Tree, context: SchematicContext) => {
    const moduleFilePath = getAppModuleFilePath(tree, context, options.projectName);
    if (!moduleFilePath) {
      return tree;
    }

    const sourceFile = ts.createSourceFile(
      moduleFilePath,
      tree.read(moduleFilePath)!.toString(),
      ts.ScriptTarget.ES2015,
      true
    );
    // if we already have the StoreDevtoolsModule in app module file, do nothing to avoid overriding the already existing config
    if (isImported(sourceFile, 'StoreDevtoolsModule', ngrxStoreDevtoolsDep)) {
      return tree;
    }

    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;

    if (!workspaceProject) {
      context.logger.warn('No application detected in the project, the development modules will not be added.');
      return tree;
    }
    const mainFilePath = workspaceProject.architect!.build.options.main ?? workspaceProject.architect!.build.options.browser;

    // supposing we are in ng 14, environment prod file name is: environment.prod.ts
    let envProdFilePath = path.join(path.dirname(mainFilePath), 'environments', 'environment.prod.ts');

    if (!tree.exists(envProdFilePath)) {
      // we are in ng 15, environment prod file name is: environment.ts
      envProdFilePath = path.join(path.dirname(mainFilePath), 'environments', 'environment.ts');
    }

    if (!tree.exists(envProdFilePath)) { // if we don't use the env setup, we skip the step
      context.logger.warn(` Cannot find environment in ${envProdFilePath}`);
      return tree;
    }

    const sourceFileEnvProd = ts.createSourceFile(
      envProdFilePath,
      tree.read(envProdFilePath)!.toString(),
      ts.ScriptTarget.ES2015,
      true
    );

    const envContent = tree.readText(envProdFilePath);

    const adModulesRegex = new RegExp(/export\s*const\s*additionalModules/, 'g');

    // if we already have the declaration of additional modules constant in environment file, do nothing to avoid duplication
    if (adModulesRegex.test(envContent)) {
      return tree;
    }

    const recorder = tree.beginUpdate(envProdFilePath);

    recorder.insertRight(sourceFileEnvProd.getEnd(), '\nexport const additionalModules = [];\n');

    tree.commitUpdate(recorder);

    return tree;
  };

  return chain([
    updatePackageJson,
    registerModules,
    registerDevAdditionalModules,
    registerProdAdditionalModules
  ]);
}
