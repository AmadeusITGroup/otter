import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { addImportToModule, getDecoratorMetadata, insertImport } from '@schematics/angular/utility/ast-utils';
import { addPackageJsonDependency, NodeDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as path from 'node:path';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { InsertChange } from '@schematics/angular/utility/change';
import { getProjectFromTree } from '../../utility/loaders';
import { getAppModuleFilePath } from '../../utility/modules';
import { getExternalDependenciesVersionRange, getNodeDependencyList } from '../../utility/dependencies';

const packageJsonPath = path.resolve(__dirname, '..', '..', '..', '..', 'package.json');
const ngrxStoreDevtoolsDep = '@ngrx/store-devtools';

/**
 * Add additional modules for dev only
 *
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param _rootPath @see RuleFactory.rootPath
 */
export function updateAdditionalModules(options: { projectName: string | null }, _rootPath: string): Rule {
  /**
   * Update package.json to add additional modules dependencies
   *
   * @param tree
   * @param _context
   */
  const updatePackageJson: Rule = (tree: Tree, _context: SchematicContext) => {
    const workspaceProject = getProjectFromTree(tree, options.projectName || undefined);
    const type: NodeDependencyType = workspaceProject.projectType === 'application' ? NodeDependencyType.Default : NodeDependencyType.Peer;

    const dependencies: NodeDependency[] = getNodeDependencyList(
      getExternalDependenciesVersionRange([ngrxStoreDevtoolsDep], packageJsonPath),
      type
    );

    dependencies.forEach((dep) => addPackageJsonDependency(tree, dep));

    return tree;
  };

  /**
   * Import additional modules in AppModule
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

    const recorder = tree.beginUpdate(moduleFilePath);
    const ngModulesMetadata = getDecoratorMetadata(sourceFile, 'NgModule', '@angular/core');
    const appModuleFile = tree.read(moduleFilePath)!.toString();
    const moduleIndex = ngModulesMetadata[0] ? ngModulesMetadata[0].pos - ('NgModule'.length + 1) : appModuleFile.indexOf('@NgModule');

    /**
     * Add import to the main module
     *
     * @param name
     * @param file
     */
    const addImportToModuleFile = (name: string, file: string) => {
      if (new RegExp(name).test(appModuleFile.substr(moduleIndex))) {
        context.logger.warn(`Skipped ${name} (already imported)`);
        return;
      }
      addImportToModule(sourceFile, moduleFilePath, name, file)
        .forEach((change) => {
          if (change instanceof InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
          }
        });
    };

    addImportToModuleFile(
      'additionalModules',
      '../environments/environment'
    );

    tree.commitUpdate(recorder);

    return tree;
  };

  /**
   * Register additional modules for development
   *
   * @param tree
   */
  const registerDevAdditionalModules: Rule = (tree: Tree) => {
    const workspaceProject = getProjectFromTree(tree);
    const moduleFilePath = path.join(path.dirname(workspaceProject.architect!.build.options.main), 'environments', 'environment.ts');
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

    const importChange = insertImport(sourceFile, moduleFilePath,'StoreDevtoolsModule', ngrxStoreDevtoolsDep);
    if (importChange instanceof InsertChange) {
      recorder.insertLeft(importChange.pos, `${importChange.toAdd}\n`);
    }

    recorder.insertRight(sourceFile.getEnd(), `\nexport const additionalModules = [
  StoreDevtoolsModule.instrument()
];\n`);

    tree.commitUpdate(recorder);

    return tree;
  };

  /**
   * Register additional modules for production
   *
   * @param tree
   */
  const registerProdAdditionalModules: Rule = (tree: Tree) => {
    const workspaceProject = getProjectFromTree(tree);
    const moduleFilePath = path.join(path.dirname(workspaceProject.architect!.build.options.main), 'environments', 'environment.prod.ts');
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

    recorder.insertRight(sourceFile.getEnd(), '\nexport const additionalModules = [];\n');

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
