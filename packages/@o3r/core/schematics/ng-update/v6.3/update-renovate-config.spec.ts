import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';

import { updateRenovateConfig } from './update-renovate-config';

const collectionPath = path.join(__dirname, '..', '..', '..', 'migration.json');

describe('Update renovate config', () => {

  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('.renovaterc.json', fs.readFileSync(path.resolve(__dirname, 'mocks', '.renovaterc.json')));
  });

  it('should update .renovaterc.json with file filters', async () => {
    const runner = new SchematicTestRunner('migrations', collectionPath);
    const tree = await lastValueFrom(runner.callRule(updateRenovateConfig(), initialTree));

    expect(tree.read('.renovaterc.json').toString('utf8')).toBe(fs.readFileSync(path.resolve(__dirname, 'mocks', 'expected.renovaterc.json')).toString('utf8'));
  });

  it('should do nothing if no renovaterc.json', async () => {
    initialTree.delete('.renovaterc.json');
    const runner = new SchematicTestRunner('migrations', collectionPath);
    const tree = await lastValueFrom(runner.callRule(updateRenovateConfig(), initialTree));

    expect(tree.exists('.renovaterc.json')).toBe(false);
  });

  it('should not modify renovaterc.json if file filtters exists', async () => {
    initialTree.delete('.renovaterc.json');
    initialTree.create('.renovaterc.json', fs.readFileSync(path.resolve(__dirname, 'mocks', 'expected.renovaterc.json')));
    const runner = new SchematicTestRunner('migrations', collectionPath);
    const tree = await lastValueFrom(runner.callRule(updateRenovateConfig(), initialTree));

    expect(tree.read('.renovaterc.json').toString('utf8')).toBe(fs.readFileSync(path.resolve(__dirname, 'mocks', 'expected.renovaterc.json')).toString('utf8'));
  });
});
