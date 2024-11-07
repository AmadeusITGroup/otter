import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing';
import {
  firstValueFrom,
} from 'rxjs';
import {
  updateVscode,
} from './index';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');
const extensionFile = '.vscode/extensions.json';
const settingFile = '.vscode/settings.json';

describe('update vscode', () => {
  it('should update vscode recommendations and create vscode settings', async () => {
    const initialTree = Tree.empty();
    initialTree.create(extensionFile, JSON.stringify({ recommendations: [] }));
    const runner = new SchematicTestRunner('schematics', collectionPath);

    const tree = await firstValueFrom(runner.callRule(updateVscode, initialTree, { interactive: false }));
    expect((tree.readJson(extensionFile) as any).recommendations).toEqual(expect.arrayContaining(['dbaeumer.vscode-eslint', 'stylelint.vscode-stylelint']));
    expect((tree.readJson(settingFile) as any)['eslint.useFlatConfig']).toBe(true);
    expect((tree.readJson(settingFile) as any)['editor.defaultFormatter']).toBe('dbaeumer.vscode-eslint');
  });

  it('should update vscode settings', async () => {
    const initialTree = Tree.empty();
    initialTree.create(extensionFile, JSON.stringify({ recommendations: [] }));
    initialTree.create(settingFile, JSON.stringify({ 'eslint.useFlatConfig': false, 'editor.defaultFormatter': 'prettier' }));
    const runner = new SchematicTestRunner('schematics', collectionPath);

    const tree = await firstValueFrom(runner.callRule(updateVscode, initialTree, { interactive: false }));
    expect((tree.readJson(settingFile) as any)['eslint.useFlatConfig']).toBe(true);
    expect((tree.readJson(settingFile) as any)['editor.defaultFormatter']).toBe('dbaeumer.vscode-eslint');
  });
});
