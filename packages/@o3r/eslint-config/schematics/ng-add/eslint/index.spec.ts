import * as path from 'node:path';
import {
  callRule,
  Tree
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner
} from '@angular-devkit/schematics/testing';
import {
  firstValueFrom
} from 'rxjs';
import {
  updateEslintConfig
} from './index';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');
const context = { description: { path: __dirname } };

describe('update eslint config', () => {
  it('should add a eslint config on workspace', async () => {
    const initialTree = Tree.empty();
    initialTree.create('package.json', JSON.stringify({ name: '@scope/package' }));
    const runner = new SchematicTestRunner('schematics', collectionPath);

    const tree = await firstValueFrom(callRule(updateEslintConfig(), initialTree, runner.engine.createContext(context as any)));
    expect(tree.exists('eslint.config.mjs')).toBeTruthy();
    expect(tree.exists('eslint.local.config.mjs')).toBeTruthy();
    expect(tree.exists('eslint.shared.config.mjs')).toBeTruthy();
    expect(tree.exists('tsconfig.eslint.json')).toBeTruthy();
    expect(tree.readText('eslint.local.config.mjs')).toContain('@scope/package/projects');
    expect(tree.readText('eslint.shared.config.mjs')).toContain('@scope/package/report-unused-disable-directives');
    expect(tree.readText('eslint.shared.config.mjs')).toContain('@scope/package/eslint-config');
  });
});
