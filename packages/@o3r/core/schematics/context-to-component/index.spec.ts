import * as fs from 'node:fs';
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
  ngAddContextFn,
} from './index';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');
const o3rComponentPath = '/src/components/test/test.ts';
const ngComponentPath = '/src/components/ng/ng.ts';
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
  imports: [CommonModule],
  styleUrls: ['./test.scss'],
  templateUrl: './test.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class Test implements OnInit, OnDestroy {
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

    expect(tree.exists(o3rComponentPath.replace(/\.ts$/, '-context.ts'))).toBeTruthy();
    const componentFileContent = tree.readText(o3rComponentPath);
    expect(componentFileContent).toMatch(/Test implements .*TestContext/);
    expect(componentFileContent).toContain('import { TestContext } from \'./test-context\'');
  });

  it('should create the context file and update the typed component', async () => {
    const componentWithTypePath = '/src/components/other-test/other-test.test-type.ts';
    initialTree.create(componentWithTypePath, `
      import {CommonModule} from '@angular/common';
      import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
      import {O3rComponent} from '@o3r/core';
      import {Subscription} from 'rxjs';

      @O3rComponent({
        componentType: 'Component'
      })
      @Component({
        selector: 'o3r-other-test-pres',
        imports: [CommonModule],
        styleUrls: ['./other-test.test-type.scss'],
        templateUrl: './other-test.test-type.html',
        changeDetection: ChangeDetectionStrategy.OnPush,
        encapsulation: ViewEncapsulation.None
      })
      export class OtherTestTestType implements OnInit, OnDestroy {
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
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('context-to-component', {
      path: componentWithTypePath
    }, initialTree);

    expect(tree.exists(componentWithTypePath.replace(/\.test-type\.ts$/, '-context.ts'))).toBeTruthy();
    const componentFileContent = tree.readText(componentWithTypePath);
    expect(componentFileContent).toMatch(/OtherTestTestType implements .*OtherTestContext/);
    expect(componentFileContent).toContain('import { OtherTestContext } from \'./other-test-context\'');
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
      path: 'inexisting-path.ts'
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
      expect(tree.exists(ngComponentPath.replace(/\.ts$/, '-context.ts'))).toBeTruthy();
    });
  });
});
