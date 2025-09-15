import type {
  Rule,
} from '@angular-devkit/schematics';
import * as ts from 'typescript';

const coveragePathIgnorePatterns = [
  '<rootDir>/src/api/**/*.ts',
  '<rootDir>/src/models/base/**/*.ts',
  '<rootDir>/src/spec/api-mock.ts',
  '<rootDir>/src/spec/operation-adapter.ts'
];

/**
 * Update Jest config to ignore coverage of generated path
 * @param tree
 * @param context
 */
export const updateJestConfigCoveragePathIgnorePatterns: Rule = (tree, context) => {
  const filePath = 'jest.config.js';
  if (!tree.exists(filePath)) {
    context.logger.info(`No ${filePath} found, the coverage ignore pattern won't be added.`);
    return;
  }

  const tsSourceFile = ts.createSourceFile(
    filePath,
    tree.readText(filePath),
    ts.ScriptTarget.Latest,
    true
  );

  const result = ts.transform(tsSourceFile, [
    (ctx) => (rootNode) => {
      const { factory } = ctx;
      return ts.visitNode(rootNode, (node) => {
        return ts.visitEachChild(node, (statement) => {
          if (
            ts.isExpressionStatement(statement)
            && ts.isBinaryExpression(statement.expression)
            && /module\.exports/.test(statement.expression.left.getText(rootNode))
            && ts.isObjectLiteralExpression(statement.expression.right)
            && !statement.expression.right.properties.some((prop) => ts.isPropertyAssignment(prop) && prop.name.getText(rootNode) === 'coveragePathIgnorePatterns')
          ) {
            return factory.updateExpressionStatement(
              statement,
              factory.updateBinaryExpression(statement.expression,
                statement.expression.left,
                statement.expression.operatorToken,
                factory.updateObjectLiteralExpression(statement.expression.right, [
                  ...statement.expression.right.properties,
                  factory.createPropertyAssignment('coveragePathIgnorePatterns', factory.createArrayLiteralExpression(
                    coveragePathIgnorePatterns.map((pattern) => factory.createStringLiteral(pattern, true)),
                    true
                  ))
                ])
              )
            );
          }
        }, ctx);
      }) as ts.SourceFile;
    }
  ]);

  const transformedSourceFile = result.transformed[0];
  const printer = ts.createPrinter({
    removeComments: false,
    newLine: ts.NewLineKind.LineFeed
  });

  const content = printer.printFile(transformedSourceFile)
    .split('\n')
    // migrate from 4 spaces to 2 spaces indent
    .map((line) => {
      const match = line.match(/^ */);
      const numberSpaces = match ? match[0].length : 0;
      const newNumber = (numberSpaces - numberSpaces % 2) / 2;
      return line.replace(/^ */, Array.from({ length: newNumber }).fill(' ').join(''));
    })
    .join('\n');

  tree.overwrite(filePath, content);
  return tree;
};
