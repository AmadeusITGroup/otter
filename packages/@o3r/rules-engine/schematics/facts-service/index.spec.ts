import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');

describe('Generate facts service', () => {
  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
  });

  it('should generate a facts service', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const angularPackageJson = require.resolve('@schematics/angular/package.json');
    runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));

    const tree = await runner.runSchematic('facts-service', {
      projectName: 'test-project',
      path: 'src/facts',
      name: 'first-example'
    }, initialTree);

    expect(tree.files.filter((f) => f.startsWith('/src/facts/first-example')).length).toBe(2);
    const factsFile = tree.readText('/src/facts/first-example/first-example.facts.ts');
    expect(factsFile).toContain('import type { FactDefinitions } from \'@o3r/rules-engine\';');
    expect(factsFile).toContain('export interface FirstExampleFacts extends FactDefinitions');

    const serviceFile = tree.readText('/src/facts/first-example/first-example-facts.service.ts');
    expect(serviceFile).toMatch(/import {.*FactsService.*} from '@o3r\/rules-engine';/);
    expect(serviceFile).toMatch(/import {.*RulesEngineService.*} from '@o3r\/rules-engine';/);
    expect(serviceFile).toContain('export class FirstExampleFactsService extends FactsService<FirstExampleFacts> {');
  });
});
