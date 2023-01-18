import {SchematicContext, Tree, UpdateRecorder} from '@angular-devkit/schematics';
import {findNodes, isImported} from '@schematics/angular/utility/ast-utils';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import {getFileInfo} from '../../../../utility/file-info';

/**
 * Remove an import item from an import statement
 *
 * @param originalImport ex: 'import {SchematicContext, Tree, UpdateRecorder} from '@angular-devkit/schematics';'
 * @param importName ex: 'UpdateRecorder'
 * @returns ex: import {SchematicContext, Tree} from '@angular-devkit/schematics';
 */
export function removeFromImport(originalImport: string, importName: string) {
  const onlyOneImport = new RegExp(`{\\s*${importName}\\s*}`);
  const importAtTheEnd = new RegExp(`,\\s*${importName}\\s*}`);
  const importInside = new RegExp(`\\n*\\s*${importName}\\s*,`);
  let newImport = originalImport;
  if (originalImport.match(onlyOneImport)) {
    newImport = '';
  }
  if (originalImport.match(importAtTheEnd)) {
    newImport = originalImport.replace(importAtTheEnd, '}');
  }
  if (originalImport.match(importInside)) {
    newImport = originalImport.replace(importInside, '');
  }
  return newImport;
}

/**
 * Search an import item in sourceFile and returns the import statement
 * in which is found plus import statement without the given import name
 *
 * @param sourceFile
 * @param importName ex: UpdateRecorder
 * @returns ex: {
 *   originalImport: "import {SchematicContext, Tree, UpdateRecorder} from '@angular-devkit/schematics';"
 *   newImport: "import {SchematicContext, Tree} from '@angular-devkit/schematics';"
 * }
 */
export function diffImport(sourceFile: ts.SourceFile, importName: string) {
  const allImports = findNodes(sourceFile, ts.SyntaxKind.ImportDeclaration).map((imp) => imp.getFullText());

  let originalImport = '';
  let newImport = '';
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < allImports.length; i++) {
    originalImport = allImports[i];
    newImport = removeFromImport(originalImport, importName);
    if (originalImport !== newImport) {
      break;
    }
  }
  return {originalImport, newImport};
}

/**
 * Replaces original text with given text in app module file
 *
 * @param tree
 * @param moduleFilePath
 * @param appModuleFile
 * @param rec
 * @param originalText
 * @param newText
 */
export function replaceStatement(tree: Tree, moduleFilePath: string, appModuleFile: string, rec: UpdateRecorder, originalText: string, newText: string) {
  const buffer = tree.read(moduleFilePath);
  const content = buffer ? buffer.toString().replace(/[\r\n ]*/g, '') : '';
  if (content.indexOf(originalText.replace(/[\r\n ]*/g, '')) !== -1) {
    return rec.insertLeft(appModuleFile.indexOf(originalText), newText)
      .remove(appModuleFile.indexOf(originalText), originalText.length);
  }
  return rec;
}

/**
 * Function to remove deprecated customization imports from app module file, if they exists
 *
 * @param tree
 * @param context
 */
export function removeDeprecatedImports(tree: Tree, context: SchematicContext) {
  const fileInfo = getFileInfo(tree, context);
  if (!fileInfo.moduleFilePath || !fileInfo.appModuleFile) {
    return tree;
  }
  let recorder = tree.beginUpdate(fileInfo.moduleFilePath);
  // Remove CustomPresenters interface
  const diffInterfaceRemoved = diffImport(fileInfo.sourceFile!, 'CustomPresenters');
  if (diffInterfaceRemoved.originalImport !== diffInterfaceRemoved.newImport) {
    recorder = replaceStatement(tree, fileInfo.moduleFilePath, fileInfo.appModuleFile, recorder, diffInterfaceRemoved.originalImport, diffInterfaceRemoved.newImport);
  }
  if (isImported(fileInfo.sourceFile!, 'initializeCustomComponents', '../customization/presenters-map.empty')) {
    const imp = diffImport(fileInfo.sourceFile!, 'initializeCustomComponents');
    if (imp.originalImport !== imp.newImport) {
      recorder = replaceStatement(tree, fileInfo.moduleFilePath, fileInfo.appModuleFile, recorder, imp.originalImport, imp.newImport);
    }
  }
  tree.commitUpdate(recorder);
  return tree;
}

/**
 * Function to remove deprecated customization items from NgModule metadata
 *
 * @param tree
 * @param context
 */
export function removeDeprecatedCustomMetadata(tree: Tree, context: SchematicContext) {
  const fileInfo = getFileInfo(tree, context);
  if (!fileInfo.moduleFilePath || !fileInfo.appModuleFile) {
    return tree;
  }
  if (!fileInfo.ngModulesMetadata || !fileInfo.ngModulesMetadata[0]) {
    return tree;
  }
  let recorder = tree.beginUpdate(fileInfo.moduleFilePath);
  const originalMetadata = fileInfo.ngModulesMetadata[0].getFullText();
  const newMetadata = originalMetadata
    .replace(/\n*\s*...customPresenters.customPresentersComponentsModules\s*,/g, '')
    .replace(/\n*\s*...customPresenters.customPresentersComponentsModules\s*/g, '')
    .replace(/\n*\s*...customPresenters.customPresentersComponents\s*,/g, '')
    .replace(/\n*\s*...customPresenters.customPresentersComponents\s*/g, '')
    .replace(/\n*\s*C11nModule.forRoot\(customPresenters.presentersMap\)\s*,/g, '')
    .replace(/\n*\s*C11nModule.forRoot\(customPresenters.presentersMap\)\s*/g, '');
  if (originalMetadata !== newMetadata) {
    recorder = replaceStatement(tree, fileInfo.moduleFilePath, fileInfo.appModuleFile, recorder, originalMetadata, newMetadata);
  }
  tree.commitUpdate(recorder);
  return tree;
}

/**
 * Remove deprecated customization code if exists
 *
 * @param tree
 * @param context
 */
export function removeDeprecatedCustomCode(tree: Tree, context: SchematicContext) {
  const fileInfo = getFileInfo(tree, context);
  if (!fileInfo.moduleFilePath || !fileInfo.appModuleFile) {
    return tree;
  }
  let recorder = tree.beginUpdate(fileInfo.moduleFilePath);

  // eslint-disable-next-line max-len
  const lineMatch = /const customPresenters\s*:\s*CustomPresenters\s*=\n*\s*{\n*\s*customPresentersComponents:\s*\[\]\s*,\s*\n*\s*customPresentersComponentsModules:\s*\[\]\s*,\s*\n*presentersMap\s*:\s*new\s*Map\(\)\s*\n*};\s*\n*initializeCustomComponents\(customPresenters\);\s*\n*/g;

  const matcher = fileInfo.appModuleFile.match(lineMatch);
  let line;
  if (matcher) {
    line = matcher[0];
  }
  if (line) {
    recorder = recorder.remove(fileInfo.appModuleFile.indexOf(line), line.length);
  } else {
    const lineBackup = `\nconst customPresenters: CustomPresenters = {
        customPresentersComponents: [],
        customPresentersComponentsModules: [],
        presentersMap: new Map()
      };

      initializeCustomComponents(customPresenters);`;
    context.logger.warn(`Check if you need to remove by hand  ${lineBackup} from your app module file!`);
  }

  tree.commitUpdate(recorder);
  return tree;
}
