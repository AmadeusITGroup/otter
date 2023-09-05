import {SchematicContext, Tree} from '@angular-devkit/schematics';
import {getDecoratorMetadata} from '@schematics/angular/utility/ast-utils';
import * as ts from 'typescript';
import {getAppModuleFilePath} from './modules';

/**
 * File information in schematics context
 */
export interface FileInfo {
  /** Relative path to app module file */
  moduleFilePath: string | undefined;

  /** App module file as ts nodes structure */
  sourceFile: ts.SourceFile | undefined;

  /** NgModule metadata as ts nodes structure */
  ngModulesMetadata: ts.Node[] | undefined;

  /** File content as string */
  appModuleFile: string | undefined;
}

/**
 * Get file information in schematics context
 *
 * @param tree
 * @param context
 * @param projectName
 */
export function getFileInfo(tree: Tree, context: SchematicContext, projectName?: string | undefined) {
  const fileInfo: FileInfo = {
    moduleFilePath: undefined,
    sourceFile: undefined,
    ngModulesMetadata: undefined,
    appModuleFile: undefined
  };
  const moduleFilePath = getAppModuleFilePath(tree, context, projectName);
  if (!moduleFilePath) {
    return fileInfo;
  }
  fileInfo.moduleFilePath = moduleFilePath;

  if (!tree.exists(moduleFilePath)) {
    context.logger.warn(`The module file ${moduleFilePath} does not exist, the edition will be skipped`);
    return fileInfo;
  }

  const sourceFile = ts.createSourceFile(
    moduleFilePath,
    tree.read(moduleFilePath)!.toString(),
    ts.ScriptTarget.ES2015,
    true
  );
  fileInfo.sourceFile = sourceFile;

  fileInfo.ngModulesMetadata = getDecoratorMetadata(sourceFile, 'NgModule', '@angular/core');
  fileInfo.appModuleFile = tree.read(moduleFilePath)!.toString();

  return fileInfo;
}
