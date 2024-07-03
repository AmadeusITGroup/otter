import {Tree} from '@angular-devkit/schematics';
import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');

describe('Generate operator', () => {

  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
  });

  it('should generate an operator', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);

    const tree = await runner.runSchematic('operator', {
      path: 'src/operators',
      name: 'basic',
      description: 'description',
      lhsType: 'string',
      rhsType: 'Date'
    }, initialTree);

    const operatorsFile = tree.readText('/src/operators/basic/basic.operator.ts');
    expect(operatorsFile.replace(/\r?\n/g, '\n')).toBe(`import {
  Operator,
  isString,
  isValidDate
} from '@o3r/rules-engine';

/**
 * description
 */
export const basic: Operator<string, Date> = {
  name: 'basic',
  evaluator: (value1: string, value2: Date) => throw new Error('the operator "basic" is not implemented'),
  validateLhs: isString,
  validateRhs: isValidDate
};
`);
  });

  it('should generate an unary operator', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);

    const tree = await runner.runSchematic('operator', {
      path: 'src/operators',
      name: 'unary',
      description: 'description',
      unaryOperator: true
    }, initialTree);

    const operatorsFile = tree.readText('/src/operators/unary/unary.operator.ts');
    expect(operatorsFile.replace(/\r?\n/g, '\n')).toBe(`import {
  UnaryOperator
} from '@o3r/rules-engine';

/**
 * description
 */
export const unary: UnaryOperator = {
  name: 'unary',
  evaluator: (value1: unknown) => throw new Error('the operator "unary" is not implemented')
};
`);
  });
});
