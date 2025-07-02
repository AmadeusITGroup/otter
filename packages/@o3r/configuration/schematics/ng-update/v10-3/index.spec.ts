import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  type UnitTestTree,
} from '@angular-devkit/schematics/testing';

const migrationPath = path.join(__dirname, '..', '..', '..', 'migration.json');

describe('Update', () => {
  let initialTree: Tree;
  let runner: SchematicTestRunner;
  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
    runner = new SchematicTestRunner('schematics', migrationPath);
  });

  describe('Update v10.3', () => {
    let tree: UnitTestTree;
    const templateFile = 'src/components/example.template.html';
    const templateFileContent = 'should not be updated';
    const fileWithConfigObserver = 'src/components/with-config-observer.component.ts';
    const fileContentWithConfigObserver = `
import { ConfigObserver } from '@o3r/configuration';
import { NotAConfigObserver } from 'whatever';

class MyComponentWithConfigObserver {
  @ConfigObserver()
  private dynamicConfig$: Type;
  public prop: NotAConfigObserver;
}`;
    const fileWithoutConfigObserver = 'src/components/without-config-observer.component.ts';
    const fileContentWithoutConfigObserver = `
import { NotAConfigObserver, ConfigObserverFake } from 'whatever';

class MyComponentWithConfigObserver {
  public prop1: NotAConfigObserver;
  @ConfigObserverFake()
  public prop2: ConfigObserverFake;
}`;
    beforeEach(async () => {
      initialTree.create(templateFile, templateFileContent);
      initialTree.create(fileWithConfigObserver, fileContentWithConfigObserver);
      initialTree.create(fileWithoutConfigObserver, fileContentWithoutConfigObserver);
      tree = await runner.runSchematic('migration-v10_3', {}, initialTree);
    });

    it('should modify only impacted files', () => {
      expect(tree.readText(templateFile)).toBe(templateFileContent);
      expect(tree.readText(fileWithoutConfigObserver)).toBe(fileContentWithoutConfigObserver);
      expect(tree.readText(fileWithConfigObserver)).not.toBe(fileContentWithConfigObserver);
    });

    it('should modify only ConfigObserver', () => {
      const newContent = tree.readText('src/components/with-config-observer.component.ts');
      expect(newContent).toMatch(/\bO3rConfig\b/);
      expect(newContent).toMatch('NotAConfigObserver');
      expect(Array.from(newContent.matchAll(/\bO3rConfig\b/g)).length)
        .toBe(Array.from(fileContentWithConfigObserver.matchAll(/\bConfigObserver\b/g)).length);
    });
  });
});
