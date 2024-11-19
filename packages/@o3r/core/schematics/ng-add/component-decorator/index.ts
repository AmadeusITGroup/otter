import { type Rule } from '@angular-devkit/schematics';
import { insertImport } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import {
  getFilesInFolderFromWorkspaceProjectsInTree
} from '@o3r/schematics';
import * as ts from 'typescript';

interface RemovePosition {
  start: number;
  length: number;
}

const computeRemovePosition = (node: ts.Node): RemovePosition => ({ start: node.getFullStart(), length: node.getEnd() - node.getFullStart() });

const removeImport = (source: ts.SourceFile, symbolName: string, fileName: string): { start: number; length: number } | undefined => {
  const importNode = source.statements.filter((statement): statement is ts.ImportDeclaration =>
    ts.isImportDeclaration(statement)
    && ts.isStringLiteral(statement.moduleSpecifier)
    && statement.moduleSpecifier.text === fileName
  ).map((statement) =>
    statement.importClause?.namedBindings && ts.isNamedImports(statement.importClause.namedBindings)
      ? statement.importClause.namedBindings.elements.find((e) => e.name.escapedText === symbolName)
      : undefined
  ).find((element) => !!element);
  return importNode ? computeRemovePosition(importNode) : undefined;
};

/**
 * Update component file with new decorators for otter devtools
 * @param tree Tree
 */
export const updateComponentDecorators: Rule = (tree) => {
  const componentFiles = new Set<string>(getFilesInFolderFromWorkspaceProjectsInTree(tree, '', 'component.ts'));
  componentFiles.forEach((filePath) => {
    const source = ts.createSourceFile(filePath, tree.readText(filePath), ts.ScriptTarget.ES2015, true);
    const recorder = tree.beginUpdate(filePath);
    const importO3rComponentChange = insertImport(source, filePath, 'O3rComponent', '@o3r/core');
    if (importO3rComponentChange instanceof InsertChange) {
      recorder.insertLeft(importO3rComponentChange.pos, `${importO3rComponentChange.toAdd}\n`);
    }
    source.forEachChild((node) => {
      if (ts.isClassDeclaration(node)) {
        const componentTypeNode = node.heritageClauses
          ?.find((clause) => clause.getText().startsWith('implements'))
          ?.types
          .find((type) => {
            const text = type.expression.getText();
            return text === 'Block' || text === 'Page';
          });
        const componentType = componentTypeNode?.expression?.getText() || 'Component';
        if (!!componentTypeNode && componentType === 'Block' || componentType === 'Page' || componentType === 'ExposedComponent') {
          recorder.remove(componentTypeNode!.getFullStart(), componentTypeNode!.end - componentTypeNode!.getFullStart());
          const removePos = removeImport(source, componentType, '@o3r/core');
          if (removePos) {
            recorder.remove(removePos.start, removePos.length);
          }
        }
        recorder.insertLeft(node.getStart(), `@O3rComponent({\n  componentType: '${componentType}'\n})\n`);
        const dynamicConfigObserver = node.members.find((member) =>
          ts.isPropertyDeclaration(member)
            && member.type
            && ts.isTypeReferenceNode(member.type)
            && ts.isIdentifier(member.type.typeName)
            && member.type.typeName.escapedText === 'ConfigurationObserver'
        );
        if (dynamicConfigObserver) {
          const importConfigObserverChange = insertImport(source, filePath, 'ConfigObserver', '@o3r/configuration');
          if (importConfigObserverChange instanceof InsertChange) {
            recorder.insertLeft(importConfigObserverChange.pos, `${importConfigObserverChange.toAdd}\n`);
          }
          recorder.insertLeft(dynamicConfigObserver.getStart(), '@ConfigObserver()\n  ');
        }
        const inputMergeDecorator = node.members
          .filter((member) => ts.isPropertyDeclaration(member))
          .reduce((acc: ts.Decorator[], member) => acc.concat(ts.canHaveDecorators(member) ? ts.getDecorators(member) || [] : []), [])
          .find((decorator) =>
            ts.isCallExpression(decorator.expression)
              && ts.isIdentifier(decorator.expression.expression)
              && decorator.expression.expression.escapedText === 'InputMerge'
          );
        if (inputMergeDecorator) {
          const inputMergeDecoratorRemovePos = computeRemovePosition(inputMergeDecorator);
          recorder.remove(inputMergeDecoratorRemovePos.start, inputMergeDecoratorRemovePos.length);
          const removePos = removeImport(source, 'InputMerge', '@o3r/localization');
          if (removePos) {
            recorder.remove(removePos.start, removePos.length);
          }
        }
      }
    });
    tree.commitUpdate(recorder);
  });
};
