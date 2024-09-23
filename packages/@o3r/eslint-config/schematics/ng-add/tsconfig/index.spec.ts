import { callRule } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { firstValueFrom } from 'rxjs';
import * as path from 'node:path';
import { updateOrAddTsconfigEslint } from './index';
import { Tree } from '@angular-devkit/schematics';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');
const tsconfigEslintPath = 'tsconfig.eslint.json';
const context = { description: { path: __dirname } };


describe('update tsconfig', () => {
  it('should create a tsconfig eslint', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);

    let tree = await firstValueFrom(callRule(updateOrAddTsconfigEslint(), Tree.empty(), runner.engine.createContext(context as any)));
    expect(tree.readJson(tsconfigEslintPath)).toEqual(expect.objectContaining({
      extends: './tsconfig',
      include: [
        'eslint*.config.*js'
      ]
    }));

    tree = await firstValueFrom(callRule(updateOrAddTsconfigEslint('tsconfig.custom'), Tree.empty(), runner.engine.createContext(context as any)));
    expect(tree.readJson(tsconfigEslintPath)).toEqual(expect.objectContaining({
      extends: './tsconfig.custom',
      include: [
        'eslint*.config.*js'
      ]
    }));
  });

  it('should update the tsconfig eslint include but not the extends', async () => {
    const initialTree = Tree.empty();
    initialTree.create(tsconfigEslintPath, JSON.stringify({ extends: './tsconfig', include: ['include-path'] }, null, 2));
    const runner = new SchematicTestRunner('schematics', collectionPath);

    const tree = await firstValueFrom(callRule(updateOrAddTsconfigEslint('tsconfig.custom'), initialTree, runner.engine.createContext(context as any)));
    expect(tree.readJson(tsconfigEslintPath)).toEqual(expect.objectContaining({
      extends: './tsconfig',
      include: [
        'include-path',
        'eslint*.config.*js'
      ]
    }));
  });
});



