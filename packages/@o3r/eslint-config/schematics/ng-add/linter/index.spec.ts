import { callRule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import path from 'node:path';
import { lastValueFrom } from 'rxjs';
import { updateLinterConfigs } from './index';

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

    expect(tree.exists('eslint.config.js')).toBe(true);
  });

  it('should not overwrite eslintignore but extend @o3r/eslint-config', async () => {
    initialTree.create('eslint.config.js', 'module.exports = [];');
    const tree = await lastValueFrom(callRule(updateLinterConfigs({}, path.join(__dirname, '..')), initialTree, context));

    expect(tree.readText('eslint.config.js')).toEqual(expect.stringContaining(`const o3rConfig = require('@o3r/eslint-config')`));
    expect(tree.readText('eslint.config.js')).toEqual(expect.stringContaining(`module.exports = [...o3rConfig,];`));
  });
});
