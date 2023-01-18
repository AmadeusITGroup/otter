import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import { removePonyfill } from './remove-ponyfill';

const collectionPath = path.join(__dirname, '..', '..', '..', 'migration.json');

describe('CSS ponyfill', () => {

  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, 'mocks', 'package.mocks.json')));
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, 'mocks', 'angular.app.mocks.json')));
    initialTree.create('src/index.ts', fs.readFileSync(path.resolve(__dirname, 'mocks', 'app.index.ts.mock')));
  });

  it('should be removed from application', async () => {
    const runner = new SchematicTestRunner('migrations', collectionPath);
    const tree = await lastValueFrom(runner.callRule(removePonyfill(), initialTree));

    expect(tree.read('src/index.ts').toString('utf8')).toBe(fs.readFileSync(path.resolve(__dirname, 'mocks', 'expected.app.index.ts.mock')).toString('utf8'));
  });

  it('should be removed from dependencies', async () => {
    const runner = new SchematicTestRunner('migrations', collectionPath);
    const tree = await lastValueFrom(runner.callRule(removePonyfill(), initialTree));

    expect(tree.read('package.json').toString('utf8')).not.toContain('css-vars-ponyfill');
  });

});
