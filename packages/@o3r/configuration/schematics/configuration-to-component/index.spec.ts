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
  ngAddConfigFn,
} from './index';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');
const o3rComponentPath = '/src/components/test/test.component.ts';
const ngComponentPath = '/src/components/ng/ng.component.ts';
describe('Add Config', () => {
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
  imports: [CommonModule],
  template: ''
})
export class NgComponent {}
    `);
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
  });

  it('should create the config file and update the component', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('configuration-to-component', {
      projectName: 'test-project',
      path: o3rComponentPath
    }, initialTree);

    expect(tree.exists(o3rComponentPath.replace(/component\.ts$/, 'config.ts'))).toBeTruthy();
    const componentFileContent = tree.readText(o3rComponentPath);
    expect(componentFileContent).toContain('from \'@o3r/configuration\'');
    expect(componentFileContent).toContain('from \'./test.config\'');
    expect(componentFileContent).toContain('componentType: \'ExposedComponent\'');
    expect(componentFileContent).toContain('DynamicConfigurable<TestConfig>');
    expect(componentFileContent).toContain('public config: Partial<TestConfig> | undefined');
    expect(componentFileContent).toContain('private dynamicConfig$: ConfigurationObserver<TestConfig>');
    expect(componentFileContent).toContain('public config$: Observable<TestConfig>');
  });

  it('should create the config file and update the component with signal based configuration', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('configuration-to-component', {
      projectName: 'test-project',
      path: o3rComponentPath,
      useSignal: true
    }, initialTree);

    expect(tree.exists(o3rComponentPath.replace(/component\.ts$/, 'config.ts'))).toBeTruthy();
    const componentFileContent = tree.readText(o3rComponentPath);
    expect(componentFileContent).toContain('DynamicConfigurableWithSignal<TestConfig>');
    expect(componentFileContent).toContain('public config = input<Partial<TestConfig>>()');
    expect(componentFileContent).toContain('public readonly configSignal = configSignal(this.config, TEST_CONFIG_ID, TEST_DEFAULT_CONFIG)');
  });

  it('should not expose the component', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('configuration-to-component', {
      projectName: 'test-project',
      path: o3rComponentPath,
      exposeComponent: false
    }, initialTree);

    const componentFileContent = tree.readText(o3rComponentPath);
    expect(componentFileContent).not.toContain('ExposedComponent');
    expect(componentFileContent).toContain('componentType: \'Component\'');
  });

  it('should throw if we add config to a component that already has it', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('configuration-to-component', {
      projectName: 'test-project',
      path: o3rComponentPath
    }, initialTree);
    await expect(runner.runSchematic('configuration-to-component', {
      projectName: 'test-project',
      path: o3rComponentPath
    }, tree)).rejects.toThrow();
  });

  it('should throw if inexisting path', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);

    await expect(runner.runSchematic('configuration-to-component', {
      projectName: 'test-project',
      path: 'inexisting-path.component.ts'
    }, initialTree)).rejects.toThrow();
  });

  describe('Angular component', () => {
    it('should throw if no Otter component', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);

      await expect(firstValueFrom(runner.callRule(ngAddConfigFn({
        path: ngComponentPath,
        skipLinter: false,
        projectName: 'test-project',
        exposeComponent: true,
        useSignal: false
      }), initialTree, { interactive: false }))).rejects.toThrow();
    });

    it('should call convert-component if no Otter component', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const o3rCorePackageJson = require.resolve('@o3r/core/package.json');
      runner.registerCollection('@o3r/core', path.resolve(path.dirname(o3rCorePackageJson), require(o3rCorePackageJson).schematics));
      const spy = jest.spyOn(runner.engine, 'createSchematic');

      const tree = await runner.runSchematic('configuration-to-component', {
        path: ngComponentPath
      }, initialTree);

      expect(spy).toHaveBeenCalledWith('convert-component', expect.anything(), expect.anything());
      expect(tree.exists(ngComponentPath.replace(/component\.ts$/, 'config.ts'))).toBeTruthy();
    });
  });
});
