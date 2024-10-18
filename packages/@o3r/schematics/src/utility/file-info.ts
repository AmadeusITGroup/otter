import {
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';
import {
  getDecoratorMetadata
} from '@schematics/angular/utility/ast-utils';
import * as ts from 'typescript';
import {
  getAppModuleFilePath
} from './modules';

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

  /** Starting index of the module decorator in the file content */
  moduleIndex: number;

  /** In case of standalone, we are referencing a component instead of a module */
  isStandalone: boolean;
}

/**
 * Get the module index of the decorator in a file (supports both standalone and module)
 * @param sourceFile
 * @param sourceContent
 */
export function getModuleIndex(sourceFile: ts.SourceFile, sourceContent: string): Pick<FileInfo, 'ngModulesMetadata' | 'moduleIndex' | 'isStandalone'> {
  const decorators = [
    { name: 'NgModule', isStandalone: false },
    { name: 'Component', isStandalone: true }
  ];
  for (const decorator of decorators) {
    const moduleMetadata = getDecoratorMetadata(sourceFile, decorator.name, '@angular/core');
    if (moduleMetadata[0]) {
      return {
        ngModulesMetadata: moduleMetadata as ts.Node[],
        moduleIndex: moduleMetadata[0].pos - (decorator.name.length + 1),
        isStandalone: decorator.isStandalone
      };
    } else {
      const index = sourceContent.indexOf(`@${decorator.name}`);
      if (index >= 0) {
        return {
          ngModulesMetadata: undefined,
          moduleIndex: index,
          isStandalone: decorator.isStandalone
        };
      }
    }
  }
  // No decorators found, put the index just before the first export (which will work for the appConfig in standalone)
  return {
    ngModulesMetadata: undefined,
    moduleIndex: sourceContent.indexOf('export '),
    isStandalone: true
  };
}

/**
 * Get file information in schematics context
 * @param tree
 * @param context
 * @param projectName
 */
export function getFileInfo(tree: Tree, context: SchematicContext, projectName?: string) {
  const fileInfo: FileInfo = {
    moduleFilePath: undefined,
    sourceFile: undefined,
    ngModulesMetadata: undefined,
    appModuleFile: undefined,
    moduleIndex: -1,
    isStandalone: false
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
  fileInfo.appModuleFile = tree.read(moduleFilePath)!.toString();

  const moduleIndex = getModuleIndex(sourceFile, fileInfo.appModuleFile);
  fileInfo.ngModulesMetadata = moduleIndex.ngModulesMetadata;
  fileInfo.moduleIndex = moduleIndex.moduleIndex;
  fileInfo.isStandalone = moduleIndex.isStandalone;

  return fileInfo;
}
