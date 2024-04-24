import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { ngAddContextFn } from './index';
import { firstValueFrom } from 'rxjs';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');
const o3rComponentPath = '/src/components/test/test.component.ts';
const ngComponentPath = '/src/components/ng/ng.component.ts';
describe('Add context', () => {
  let initialTree: Tree;
  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create(o3rComponentPath, `
import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {O3rComponent} from '@o3r/core';
import {Subscription} from 'rxjs';

@O3rComponent({
  componentType: 'Component'
})
@Component({
  selector: 'o3r-test-pres',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./test.style.scss'],
  templateUrl: './test.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TestComponent implements OnInit, OnDestroy {
  /**
   * List of subscriptions to unsubscribe on destroy
   */
  private subscriptions: Subscription[] = [];

  public ngOnInit() {
    // Run on component initialization
  }

  public ngOnDestroy() {
    // Run on component destruction
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
    `);
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

  it('should create the context file and update the component', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('context-to-component', {
      path: o3rComponentPath
    }, initialTree);

    expect(tree.exists(o3rComponentPath.replace(/component\.ts$/, 'context.ts'))).toBeTruthy();
    const componentFileContent = tree.readText(o3rComponentPath);
    expect(componentFileContent).toMatch(/TestComponent implements .*TestContext/);
    expect(componentFileContent).toContain('import { TestContext } from \'./test.context\'');
  });

  it('should throw if we add context to a component that already have it', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('context-to-component', {
      path: o3rComponentPath
    }, initialTree);
    await expect(runner.runSchematic('context-to-component', {
      path: o3rComponentPath
    }, tree)).rejects.toThrow();
  });

  it('should throw if inexisting path', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);

    await expect(runner.runSchematic('context-to-component', {
      path: 'inexisting-path.component.ts'
    }, initialTree)).rejects.toThrow();
  });

  describe('Angular component', () => {
    it('should throw if no Otter component', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);

      await expect(firstValueFrom(runner.callRule(ngAddContextFn({
        path: ngComponentPath,
        skipLinter: false
      }), initialTree, { interactive: false }))).rejects.toThrow();
    });

    it('should call convert-component if no Otter component', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const createSchematicSpy = jest.spyOn(runner.engine, 'createSchematic');

      const tree = await runner.runSchematic('context-to-component', {
        path: ngComponentPath
      }, initialTree);

      expect(createSchematicSpy).toHaveBeenCalledWith('convert-component', expect.anything(), expect.anything());
      expect(tree.exists(ngComponentPath.replace(/component\.ts$/, 'context.ts'))).toBeTruthy();
    });
  });
});
