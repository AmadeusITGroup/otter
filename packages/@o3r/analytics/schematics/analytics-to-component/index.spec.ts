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
  ngAddAnalyticsFn,
} from './index';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');
const o3rComponentPath = '/src/components/test/test.ts';
const ngComponentPath = '/src/components/ng/ng.ts';
describe('Add Analytics', () => {
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

  it('should create the analytics file and update the component', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('analytics-to-component', {
      projectName: 'test-project',
      path: o3rComponentPath
    }, initialTree);

    expect(tree.exists(o3rComponentPath.replace(/\.ts$/, '-analytics.ts'))).toBeTruthy();
    const componentFileContent = tree.readText(o3rComponentPath);
    expect(componentFileContent).toContain('from \'@o3r/analytics\'');
    expect(componentFileContent).toContain('from \'./test-analytics\'');
    expect(componentFileContent).toContain('Trackable<TestAnalytics>');
    expect(componentFileContent).toContain('public readonly analyticsEvents: TestAnalytics = analyticsEvents');
  });

  it('should create the analytics file and update the typed component', async () => {
    const componentWithTypePath = '/src/components/other-test/other-test.test-type.ts';
    initialTree.create(componentWithTypePath, `
      import {CommonModule} from '@angular/common';
      import {Component} from '@angular/core';

      @Component({
        selector: 'other-test',
        imports: [CommonModule],
        template: ''
      })
      export class OtherTestTestType {}
    `);
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('analytics-to-component', {
      projectName: 'test-project',
      path: componentWithTypePath
    }, initialTree);

    expect(tree.exists(componentWithTypePath.replace(/\.test-type\.ts$/, '-analytics.ts'))).toBeTruthy();
    const componentFileContent = tree.readText(componentWithTypePath);
    expect(componentFileContent).toContain('from \'@o3r/analytics\'');
    expect(componentFileContent).toContain('from \'./other-test-analytics\'');
    expect(componentFileContent).toContain('Trackable<OtherTestAnalytics>');
    expect(componentFileContent).toContain('public readonly analyticsEvents: OtherTestAnalytics = analyticsEvents');
  });

  it('should throw if we add analytics to a component that already has it', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('analytics-to-component', {
      projectName: 'test-project',
      path: o3rComponentPath
    }, initialTree);
    await expect(runner.runSchematic('analytics-to-component', {
      projectName: 'test-project',
      path: o3rComponentPath
    }, tree)).rejects.toThrow();
  });

  it('should throw if inexisting path', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);

    await expect(runner.runSchematic('analytics-to-component', {
      path: 'inexisting-path.ts'
    }, initialTree)).rejects.toThrow();
  });

  describe('Angular component', () => {
    it('should throw if no Otter component', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);

      await expect(firstValueFrom(runner.callRule(ngAddAnalyticsFn({
        path: ngComponentPath,
        skipLinter: false,
        activateDummy: false
      }), initialTree, { interactive: false }))).rejects.toThrow();
    });

    it('should call convert-component if no Otter component', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const o3rCorePackageJson = require.resolve('@o3r/core/package.json');
      runner.registerCollection('@o3r/core', path.resolve(path.dirname(o3rCorePackageJson), require(o3rCorePackageJson).schematics));
      const spy = jest.spyOn(runner.engine, 'createSchematic');

      const tree = await runner.runSchematic('analytics-to-component', {
        path: ngComponentPath
      }, initialTree);

      expect(spy).toHaveBeenCalledWith('convert-component', expect.anything(), expect.anything());
      expect(tree.exists(ngComponentPath.replace(/\.ts$/, '-analytics.ts'))).toBeTruthy();
    });
  });

  describe('Non-standalone component and module', () => {
    it('should create the analytics file and update the component and update the module', async () => {
      const o3rOtherTestComponentPath = '/src/components/other-test/other-test.ts';
      const o3rOtherTestModulePath = '/src/components/other-test/other-test-module.ts';
      initialTree.create(o3rOtherTestComponentPath, `
        import {CommonModule} from '@angular/common';
        import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
        import {O3rComponent} from '@o3r/core';

        @O3rComponent({
          componentType: 'Component'
        })
        @Component({
          selector: 'o3r-other-test-pres',
          imports: [CommonModule],
          styleUrls: ['./other-test.scss'],
          templateUrl: './other-test.html',
          changeDetection: ChangeDetectionStrategy.OnPush,
          encapsulation: ViewEncapsulation.None,
          standalone: false
        })
        export class OtherTest {}
      `);
      initialTree.create(o3rOtherTestModulePath, `
        import { NgModule } from '@angular/core';
        import { OtherTest } from './other-test';

        @NgModule({
          imports: [],
          declarations: [OtherTest],
          exports: [OtherTest]
        })
        export class OtherTestModule {}
      `);

      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = await runner.runSchematic('analytics-to-component', {
        projectName: 'test-project',
        path: o3rOtherTestComponentPath
      }, initialTree);
      expect(tree.exists(o3rOtherTestComponentPath.replace(/\.ts$/, '-analytics.ts'))).toBeTruthy();
      const componentFileContent = tree.readText(o3rOtherTestComponentPath);
      expect(componentFileContent).toContain('from \'@o3r/analytics\'');
      expect(componentFileContent).toContain('from \'./other-test-analytics\'');
      expect(componentFileContent).toContain('Trackable<OtherTestAnalytics>');
      expect(componentFileContent).toContain('public readonly analyticsEvents: OtherTestAnalytics = analyticsEvents');
      const moduleFileContent = tree.readText(o3rOtherTestModulePath);
      expect(moduleFileContent).toContain('from \'@o3r/analytics\'');
      expect(moduleFileContent).toContain('TrackEventsModule');
    });
  });
});
