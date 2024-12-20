import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  type UnitTestTree,
} from '@angular-devkit/schematics/testing';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');

describe('Migrate to config signal-based', () => {
  let initialTree: Tree;
  let runner: SchematicTestRunner;
  let tree: UnitTestTree;
  beforeEach(async () => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
    initialTree.create('component.ts', `
      @O3rComponent({ componentType: 'Block' })
      @Component({
        selector: 'o3r-component',
        standalone: true,
        templateUrl: './component.template.html',
        styleUrls: ['./component.style.scss'],
        encapsulation: ViewEncapsulation.None,
        changeDetection: ChangeDetectionStrategy.OnPush
      })
      export class MyComponent implements OnChanges, OnDestroy, DynamicConfigurable<MyConfig> {
        /** Configuration stream based on the input and the stored configuration*/
        public config$: Observable<MyConfig>;

        @O3rConfig()
        private readonly dynamicConfig$: ConfigurationObserver<MyConfig>;

        /** Input configuration to override the default configuration of the component */
        @Input()
        public config: Partial<MyConfig> | undefined;

        constructor(@Optional() configurationService: ConfigurationBaseService) {
          this.dynamicConfig$ = new ConfigurationObserver<MyConfig>(MY_CONFIG_CONFIG_ID, MY_CONFIG_DEFAULT_CONFIG, configurationService);
          this.config$ = this.dynamicConfig$.asObservable();
        }

        public ngOnChanges(changes: SimpleChanges) {
          if (changes.config) {
            this.dynamicConfig$.next(this.config);
          }
        }
      }`);
    runner = new SchematicTestRunner('schematics', collectionPath);
    tree = await runner.runSchematic('use-config-signal', {
      path: 'component.ts'
    }, initialTree);
  });

  it('should migrate to a signal-based configuration', () => {
    const componentFileContent = tree.readText('component.ts');

    expect(componentFileContent).toContain('DynamicConfigurableWithSignal<MyConfig>');
    expect(componentFileContent).toContain('public config = input<Partial<MyConfig>>()');
    expect(componentFileContent).toContain('public readonly configSignal = configSignal(this.config, MY_CONFIG_CONFIG_ID, MY_CONFIG_DEFAULT_CONFIG)');
    expect(componentFileContent).toContain('public readonly config$ = toObservable(this.configSignal)');

    expect(componentFileContent).not.toContain('public config$: Observable<MyConfig>');
    expect(componentFileContent).not.toContain('config: Partial<MyConfig> | undefined');
    expect(componentFileContent).not.toContain('dynamicConfig$: ConfigurationObserver<MyConfig>');
    expect(componentFileContent).not.toContain('this.dynamicConfig$ = new ConfigurationObserver<MyConfig>(MY_CONFIG_CONFIG_ID, MY_CONFIG_DEFAULT_CONFIG, configurationService)');
    expect(componentFileContent).not.toContain('this.config$ = this.dynamicConfig$.asObservable()');
    expect(componentFileContent).not.toContain('this.dynamicConfig$.next(this.config)');
  });
});
