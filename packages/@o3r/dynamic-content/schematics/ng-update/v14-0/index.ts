import {
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  findFilesInTree,
} from '@o3r/schematics';
import * as ts from 'typescript';

interface RemovePosition {
  start: number;
  length: number;
}

/**
 * Compute the position to remove a node
 * @param node
 */
const computeRemovePosition = (node: ts.Node): RemovePosition => ({ start: node.getFullStart(), length: node.getEnd() - node.getFullStart() });

/**
 * Find and compute remove position for an import symbol
 * If the symbol is the only import from the module, remove the entire import declaration
 * @param source
 * @param symbolName
 * @param fileName
 */
const removeImport = (source: ts.SourceFile, symbolName: string, fileName: string): RemovePosition | undefined => {
  const importDeclaration = source.statements.find((statement): statement is ts.ImportDeclaration =>
    ts.isImportDeclaration(statement)
    && ts.isStringLiteral(statement.moduleSpecifier)
    && statement.moduleSpecifier.text === fileName
  );

  if (!importDeclaration || !importDeclaration.importClause?.namedBindings || !ts.isNamedImports(importDeclaration.importClause.namedBindings)) {
    return undefined;
  }

  const namedImports = importDeclaration.importClause.namedBindings;
  const importElement = namedImports.elements.find((e) => e.name.escapedText.toString() === symbolName);

  if (!importElement) {
    return undefined;
  }

  // If this is the only import, remove the entire import declaration
  if (namedImports.elements.length === 1) {
    return computeRemovePosition(importDeclaration);
  }

  // Otherwise, just remove the specific import element
  return computeRemovePosition(importElement);
};

/**
 * Find StyleLazyLoaderModule in any decorator's imports array (NgModule, Component, Injectable, etc.)
 * @param node
 */
const findStyleLazyLoaderModuleInImports = (node: ts.ClassDeclaration): ts.Expression[] => {
  const decorators = ts.getDecorators(node);
  if (!decorators) {
    return [];
  }

  const moduleReferences: ts.Expression[] = [];

  decorators.forEach((decorator) => {
    if (!ts.isCallExpression(decorator.expression)) {
      return;
    }

    const metadata = decorator.expression.arguments[0];
    if (!metadata || !ts.isObjectLiteralExpression(metadata)) {
      return;
    }

    const importsProperty = metadata.properties.find((prop) =>
      ts.isPropertyAssignment(prop)
      && ts.isIdentifier(prop.name)
      && prop.name.escapedText.toString() === 'imports'
    ) as ts.PropertyAssignment | undefined;

    if (!importsProperty || !ts.isArrayLiteralExpression(importsProperty.initializer)) {
      return;
    }

    const moduleReference = importsProperty.initializer.elements.find((element) =>
      ts.isIdentifier(element) && element.escapedText.toString() === 'StyleLazyLoaderModule'
    );

    if (moduleReference) {
      moduleReferences.push(moduleReference);
    }
  });

  return moduleReferences;
};

/**
 * Remove StyleLazyLoaderModule from decorator imports arrays and import statements
 * @param tree
 * @param context
 */
export const removeStyleLazyLoaderModule: Rule = (tree: Tree, context: SchematicContext) => {
  const files = findFilesInTree(tree.getDir('/'), (filePath) => /\.ts$/.test(filePath));

  files.forEach(({ path }) => {
    const source = ts.createSourceFile(path, tree.readText(path), ts.ScriptTarget.ES2015, true);
    const recorder = tree.beginUpdate(path);
    let hasChanges = false;
    let shouldRemoveImport = false;

    source.forEachChild((node) => {
      if (ts.isClassDeclaration(node)) {
        const moduleReferences = findStyleLazyLoaderModuleInImports(node);
        if (moduleReferences.length > 0) {
          moduleReferences.forEach((moduleReference) => {
            recorder.remove(moduleReference.getFullStart(), moduleReference.getEnd() - moduleReference.getFullStart());
            hasChanges = true;
          });
          shouldRemoveImport = true;
        }
      }
    });

    // Remove the import statement once per file if any references were found
    if (shouldRemoveImport) {
      const removePos = removeImport(source, 'StyleLazyLoaderModule', '@o3r/dynamic-content');
      if (removePos) {
        recorder.remove(removePos.start, removePos.length);
      }
    }

    if (hasChanges) {
      context.logger.info(`Removed StyleLazyLoaderModule from ${path}`);
      tree.commitUpdate(recorder);
    } else {
      // No changes, discard the recorder
      tree.commitUpdate(recorder);
    }
  });

  return tree;
};

/**
 * Update of Otter library V14.0
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version
function updateV14_0Fn(): Rule {
  return removeStyleLazyLoaderModule;
}

/**
 * Update of Otter library V14.0
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version
export const updateV14_0 = createOtterSchematic(updateV14_0Fn);
