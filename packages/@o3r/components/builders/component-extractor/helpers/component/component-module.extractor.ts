import {logging} from '@angular-devkit/core';
import * as ts from 'typescript';

/** Information extracted from a module file */
export interface ModuleInformation {
  /** Name of the module */
  name: string;
  /** List of exported items */
  exportedItems: string[];
}

/**
 * Component module extractor.
 */
export class ComponentModuleExtractor {

  /**
   * @param source Typescript SourceFile node of the file
   * @param logger Logger
   * @param filePath Path to the file to extract the data from
   * @param cwd Current Working Directory
   */
  constructor(public source: ts.SourceFile, private logger: logging.LoggerApi, public filePath: string) { }

  /**
   * Indicates if the given decorator is a module decorator.
   *
   * @param decoratorNode The decorator node to test
   */
  private isModuleDecorator(decoratorNode: ts.Decorator) {
    return new RegExp('^(@NgModule).*').test(decoratorNode.getText(this.source));
  }

  /**
   * Get the exported items from the given decorator.
   *
   * @param decoratorNode The decorator node to get the exported items from
   */
  private getExportedItems(decoratorNode: ts.Decorator) {
    const exportMatches = /exports:\s*\[([^\]]*)\]/i.exec(decoratorNode.getText(this.source));

    if (!exportMatches) {
      return [];
    }

    return exportMatches[1].split(',');
  }

  /**
   * Extract module information of a given class node
   *
   * @param classNode Typescript node of a class
   */
  private getModuleInformation(classNode: ts.ClassDeclaration): ModuleInformation | undefined {
    let name: string | undefined;
    let exportedItems: string[] | undefined;

    classNode.forEachChild((node) => {
      if (ts.isDecorator(node)) {
        if (this.isModuleDecorator(node)) {
          exportedItems = this.getExportedItems(node);
        }
      } else if (ts.isIdentifier(node)) {
        name = node.getText(this.source);
      }
    });

    return name && exportedItems ? {name, exportedItems} : undefined;
  }

  /**
   * Extract the module data of a typescript file
   */
  public extract() {
    this.logger.debug(`Parsing module from ${this.filePath}`);
    let moduleInfo: ModuleInformation | undefined;

    this.source.forEachChild((node) => {
      if (!moduleInfo && ts.isClassDeclaration(node)) {
        moduleInfo = this.getModuleInformation(node);
      }
    });

    return moduleInfo;
  }

}
