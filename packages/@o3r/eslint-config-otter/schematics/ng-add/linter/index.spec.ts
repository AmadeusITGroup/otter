import path from 'node:path';
import {
  callRule,
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner
} from '@angular-devkit/schematics/testing';
import {
  lastValueFrom
} from 'rxjs';
import {
  updateLinterConfigs
} from './index';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');

describe('Generate linter files', () => {
  let initialTree: Tree;
  let context: SchematicContext;

  beforeEach(() => {
    initialTree = Tree.empty();
    const runner = new SchematicTestRunner('.', collectionPath);
    context = runner.engine.createContext(runner.engine.createSchematic('ng-add', runner.engine.createCollection('.')));
  });

  it('should generate linter files', async () => {
    const tree = await lastValueFrom(callRule(updateLinterConfigs({}, path.join(__dirname, '..')), initialTree, context));

    expect(tree.exists('.eslintignore')).toBe(true);
    expect(tree.exists('.eslintrc.js')).toBe(true);
  });

  it('should not overwrite eslintignore but extend @o3r/eslint-config-otter', async () => {
    initialTree.create('.eslintignore', 'I am inevitable');
    initialTree.create('.eslintrc.json', '{}');
    const tree = await lastValueFrom(callRule(updateLinterConfigs({}, path.join(__dirname, '..')), initialTree, context));

    expect(tree.readText('.eslintignore')).toBe('I am inevitable');
    expect(tree.readJson('.eslintrc.json')).toEqual({ 'extends': ['@o3r/eslint-config-otter'] });
  });

  it('should not overwrite linter files', async () => {
    initialTree.create('.eslintignore', 'I am inevitable');
    initialTree.create('.eslintrc.js', 'I am inevitable');
    initialTree.create('tsconfig.eslint.json', 'I am inevitable');
    const tree = await lastValueFrom(callRule(updateLinterConfigs({}, path.join(__dirname, '..')), initialTree, context));

    expect(tree.readText('.eslintignore')).toBe('I am inevitable');
    expect(tree.readText('.eslintrc.js')).toBe('I am inevitable');
    expect(tree.readText('tsconfig.eslint.json')).toBe('I am inevitable');
  });
});
