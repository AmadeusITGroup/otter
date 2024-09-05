import {Tree} from '@angular-devkit/schematics';
import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import { O3rCliError } from '@o3r/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');

describe('Enable rules-engine on component', () => {
  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
    initialTree.create('test-folder/test-component.component.ts', `
      import {Component} from '@angular/core';
      import {O3rComponent} from '@o3r/core';
      @O3rComponent({
        componentType: 'Component'
      })
      @Component({
        selector: 'empty-component',
        template: '',
        standalone: true
      })
      export class EmptyComponent {}
    `);
  });

  it('should add the rules-engine service to a component', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('rules-engine-to-component', {
      projectName: 'test-project',
      path: 'test-folder/test-component.component.ts'
    }, initialTree);

    const fileContent = tree.readContent(tree.files.find((file) => /test-component\.component\.ts/.test(file)));
    expect(fileContent).toMatch(/import \{.*inject.*} from '@angular\/core'/);
    expect(fileContent).toMatch(/import \{.*OnInit.*} from '@angular\/core'/);
    expect(fileContent).toMatch(/import \{.*OnDestroy.*} from '@angular\/core'/);
    expect(fileContent).toMatch(/import \{.*computeItemIdentifier.*} from '@o3r\/core'/);
    expect(fileContent).toMatch(/import \{.*RulesEngineRunnerService.*} from '@o3r\/rules-engine'/);
    expect(fileContent).toMatch(/import \{.*RulesEngineRunnerModule.*} from '@o3r\/rules-engine'/);
    expect(fileContent).toMatch(/implements.*(?=.*OnInit)(?=.*OnDestroy).*\{/);
    expect(fileContent).toMatch(/componentName = computeItemIdentifier\('EmptyComponent', 'test-project'\)/);
    expect(fileContent).toMatch(/rulesEngineService = inject\(RulesEngineRunnerService, \{\s*optional: true\s*}\)/);
    expect(fileContent).toMatch(/ngOnInit[^{]*\{[^}]*this.rulesEngineService.enableRuleSetFor\(this.componentName\);/m);
    expect(fileContent).toMatch(/ngOnDestroy[^{]*\{[^}]*this.rulesEngineService.disableRuleSetFor\(this.componentName\);/m);
  });

  it('should not add the rules-engine service to a component if non existing', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    await expect(async () => await runner.runSchematic('rules-engine-to-component', {
      projectName: 'test-project',
      path: 'random-path'
    }, initialTree)).rejects.toThrow(new O3rCliError('Unable to add rules-engine: component "random-path" does not exist'));
  });

  it('should not add the rules-engine service to a component if already present', async () => {
    initialTree.create('test-folder/test-component-with-rules-engine.component.ts', `
      import {Component} from '@angular/core';
      import {O3rComponent} from '@o3r/core';
      @O3rComponent({
        componentType: 'Component'
      })
      @Component({
        selector: 'empty-component',
        template: '',
        standalone: true
      })
      export class EmptyComponent {
        rulesEngineService = inject(RulesEngineRunnerService);
      }
    `);
    const runner = new SchematicTestRunner('schematics', collectionPath);
    await expect(runner.runSchematic('rules-engine-to-component', {
      projectName: 'test-project',
      path: 'test-folder/test-component-with-rules-engine.component.ts'
    // eslint-disable-next-line @stylistic/js/max-len
    }, initialTree)).rejects.toThrow(new O3rCliError('Unable to add rules-engine: component "test-folder/test-component-with-rules-engine.component.ts" already has at least one of these properties: rulesEngineService.'));
  });

  it('should not add the rules-engine service to a component if already present in constructor', async () => {
    initialTree.create('test-folder/test-component-with-rules-engine.component.ts', `
      import {Component} from '@angular/core';
      import {O3rComponent} from '@o3r/core';
      @O3rComponent({
        componentType: 'Component'
      })
      @Component({
        selector: 'empty-component',
        template: '',
        standalone: true
      })
      export class EmptyComponent {
        constructor(private rulesEngineService: RulesEngineRunnerService){};
      }
    `);
    const runner = new SchematicTestRunner('schematics', collectionPath);
    await expect(runner.runSchematic('rules-engine-to-component', {
      projectName: 'test-project',
      path: 'test-folder/test-component-with-rules-engine.component.ts'
    // eslint-disable-next-line @stylistic/js/max-len
    }, initialTree)).rejects.toThrow(new O3rCliError('Unable to add rules-engine: component "test-folder/test-component-with-rules-engine.component.ts" already has at least one of these properties: rulesEngineService.'));
  });
});
