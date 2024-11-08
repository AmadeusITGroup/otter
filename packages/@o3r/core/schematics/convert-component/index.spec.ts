import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');

const ngComponentPath = 'src/components/angular/angular.component.ts';

describe('Convert component generator', () => {
  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create(ngComponentPath, `
import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';

@Component({
  selector: 'ng-test',
  standalone: true,
  imports: [CommonModule],
  template: ''
})
export class NgComponent {}
    `);

    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
  });

  it('should convert the component into an Otter component', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'convert-component', {
      projectName: 'test-project',
      path: ngComponentPath
    }, initialTree);

    expect(tree.readText(ngComponentPath)).toContain('@O3rComponent({ componentType: \'Component\' })');
  });

  it('should convert the component into an Otter Block', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'convert-component', {
      projectName: 'test-project',
      path: ngComponentPath,
      componentType: 'Block'
    }, initialTree);

    expect(tree.readText(ngComponentPath)).toContain('@O3rComponent({ componentType: \'Block\' })');
  });

  it('should throw if we try to convert an Otter component', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runExternalSchematic('schematics', 'convert-component', {
      projectName: 'test-project',
      path: ngComponentPath
    }, initialTree);

    await expect(runner.runExternalSchematic('schematics', 'convert-component', {
      projectName: 'test-project',
      path: ngComponentPath
    }, tree)).rejects.toThrow();
  });
});
