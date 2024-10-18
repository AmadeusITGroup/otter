import * as path from 'node:path';
import {
  Tree
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner
} from '@angular-devkit/schematics/testing';
import {
  lastValueFrom
} from 'rxjs';
import {
  addVsCodeRecommendations
} from './index';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');
const extensionFile = '/.vscode/extensions.json';

describe('addVsCodeRecommendations', () => {
  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
  });

  it('should add recommendation to existing file', async () => {
    initialTree.create(extensionFile, JSON.stringify({ recommendations: [] }));
    const runner = new SchematicTestRunner('ng-add', collectionPath);
    const tree = await lastValueFrom(runner.callRule(addVsCodeRecommendations(['test']), initialTree));

    expect((tree.readJson(extensionFile) as { recommendations: string[] }).recommendations).toContain('test');
    expect((tree.readJson(extensionFile) as { recommendations: string[] }).recommendations).toHaveLength(1);
  });

  it('should avoid duplication in recommendation', async () => {
    initialTree.create(extensionFile, JSON.stringify({ recommendations: ['test1'] }));
    const runner = new SchematicTestRunner('ng-add', collectionPath);
    const tree = await lastValueFrom(runner.callRule(addVsCodeRecommendations(['test1', 'test2']), initialTree));

    expect((tree.readJson(extensionFile) as { recommendations: string[] }).recommendations).toContain('test1');
    expect((tree.readJson(extensionFile) as { recommendations: string[] }).recommendations).toContain('test2');
    expect((tree.readJson(extensionFile) as { recommendations: string[] }).recommendations).toHaveLength(2);
  });

  it('should create file if not extension,json file', async () => {
    const runner = new SchematicTestRunner('ng-add', collectionPath);
    const tree = await lastValueFrom(runner.callRule(addVsCodeRecommendations(['test1', 'test2']), initialTree));

    expect(tree.exists(extensionFile)).toBe(true);
    expect((tree.readJson(extensionFile) as { recommendations: string[] }).recommendations).toContain('test1');
    expect((tree.readJson(extensionFile) as { recommendations: string[] }).recommendations).toContain('test2');
    expect((tree.readJson(extensionFile) as { recommendations: string[] }).recommendations).toHaveLength(2);
  });
});
