import { apply, chain, forEach, MergeStrategy, mergeWith, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { addImportToModule, addSymbolToNgModuleMetadata, getDecoratorMetadata, insertImport } from '@schematics/angular/utility/ast-utils';

import { InsertChange } from '@schematics/angular/utility/change';
import { getTemplateFolder } from '../../../../utility/loaders';
import { getAppModuleFilePath } from '../../../../utility/modules';

/**
 * Enable customization capabilities
 *
 * @param rootPath @see RuleFactory.rootPath
 */
export function updateCustomizationEnvironment(rootPath: string): Rule {

  /**
   * Generate customization folder
   *
   * @param tree
   * @param context
   */
  const generateC11nFolder = (tree: Tree, context: SchematicContext) => {

    const templateSource = apply(
      url(getTemplateFolder(rootPath, __dirname)),
      [
        template({}),
        forEach((fileEntry) => {
          if (tree.exists(fileEntry.path)) {
            return null;
          }
          return fileEntry;
        })
      ]
    );

    const rule = mergeWith(templateSource, MergeStrategy.Default);
    return rule(tree, context);
  };

  /**
   * Edit main module with the customization required information
   *
   * @param tree
   * @param context
   */
  const registerModules: Rule = (tree: Tree, context: SchematicContext) => {
    const moduleFilePath = getAppModuleFilePath(tree, context);
    if (!moduleFilePath) {
      return tree;
    }

    if (!tree.exists(moduleFilePath)) {
      context.logger.warn(`The module file ${moduleFilePath} does not exist, the edition will be skipped`);
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
     * Add custom code before the module definition
     *
     * @param line
     */
    const insertBeforeModule = (line: string) => {
      const buffer = tree.read(moduleFilePath);
      const content = buffer ? buffer.toString().replace(/[\r\n ]*/g, '') : '';
      if (content.indexOf(line.replace(/[\r\n ]*/g, '')) === -1) {
        recorder.insertLeft(moduleIndex - 1, `${line}\n\n`);
      }
    };

    /**
     * Add elements in the metadata of the ngModule (entryComponents, imports etc.)
     *
     * @param metadataField
     * @param name
     */
    const addToNgModuleMetadata = (metadataField: string, name: string) => {
      addSymbolToNgModuleMetadata(sourceFile, moduleFilePath, metadataField, name)
        .forEach((change) => {
          if (change instanceof InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
          }});
    };

    insertImportToModuleFile('initializeCustomComponents', '../customization/presenters-map.empty');
    insertImportToModuleFile('Provider', '@angular/core');
    insertImportToModuleFile('initializeCustomProviders', '../customization/custom-providers.empty');
    insertImportToModuleFile('CustomPresenters', '@o3r/core');
    addToNgModuleMetadata('imports', '...customPresenters.customPresentersComponentsModules');
    addToNgModuleMetadata('entryComponents', '...customPresenters.customPresentersComponents');
    addToNgModuleMetadata('providers', '...customProviders');

    addImportToModuleFile(
      'C11nModule',
      '@o3r/core',
      '.forRoot(customPresenters.presentersMap)'
    );

    insertBeforeModule(`const customPresenters: CustomPresenters = {
      customPresentersComponents: [],
      customPresentersComponentsModules: [],
      presentersMap: new Map()
    };

initializeCustomComponents(customPresenters);

const customProviders: Provider[] = initializeCustomProviders();`);

    tree.commitUpdate(recorder);

    return tree;
  };

  return chain([
    generateC11nFolder,
    registerModules
  ]);
}
