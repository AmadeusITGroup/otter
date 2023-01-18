import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readAngularJson } from '@o3r/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import { useNgxPrefetch } from './use-ngx-prefetch';

const collectionPath = path.join(__dirname, '..', '..', '..', 'migration.json');

describe('Use ngx-prefetch', () => {

  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));

  });

  it('should migrate the builder to ngx-prefetch', async () => {
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, 'mocks', 'angular.app.mocks.json')));
    const runner = new SchematicTestRunner('migrations', collectionPath);
    const tree = await lastValueFrom(runner.callRule(useNgxPrefetch(), initialTree));

    const workspace = readAngularJson(tree);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(workspace.projects['test-project'].architect.prefetch.builder).toBe('@o3r/ngx-prefetch:run');
    expect(JSON.parse(tree.read('package.json')!.toString()).devDependencies['@o3r/ngx-prefetch']).toBe('~13.0.3');
  });

});
