import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Tree
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner
} from '@angular-devkit/schematics/testing';
import {
  firstValueFrom
} from 'rxjs';
import {
  ngAddLocalizationFn
} from './index';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');
const o3rComponentPath = '/src/components/test/test.component.ts';
const specPath = '/src/components/test/test.spec.ts';
const templatePath = '/src/components/test/test.template.html';
const modulePath = '/src/components/test/test.module.ts';
const ngComponentPath = '/src/components/ng/ng.component.ts';

describe('Add Localization', () => {
  let initialTree: Tree;

  describe('Otter standalone component', () => {
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
      initialTree.create(templatePath, '<div>My HTML content</div>');
      initialTree.create(specPath, `
        import { ComponentFixture, TestBed } from '@angular/core/testing';
        import { TestComponent } from './test.component';

        describe('TestComponent', () => {
          let component: TestComponent;
          let fixture: ComponentFixture<TestComponent>;

          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [TestComponent]
            });
            fixture = TestBed.createComponent(TestComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
          });

          it('should create', () => {
            expect(component).toBeTruthy();
          });
        });
      `);
      initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
    });

    it('should create the localization files and update the component', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = await runner.runSchematic('localization-to-component', {
        projectName: 'test-project',
        path: o3rComponentPath,
        activateDummy: true
      }, initialTree);

      const translationFile = o3rComponentPath.replace(/component\.ts$/, 'translation.ts');
      const localizationFile = o3rComponentPath.replace(/component\.ts$/, 'localization.json');

      expect(tree.exists(translationFile)).toBeTruthy();
      expect(tree.readText(translationFile)).toContain('dummyLoc1');

      expect(tree.exists(localizationFile)).toBeTruthy();
      expect((tree.readJson(localizationFile) as any)['o3r-test-pres.dummyLoc1']).toBeDefined();

      const componentFileContent = tree.readText(o3rComponentPath);
      expect(componentFileContent).toContain('LocalizationModule');
      expect(componentFileContent).toContain('Translatable<TestTranslation>');
      expect(componentFileContent).toContain('public translations: TestTranslation;');
      expect(componentFileContent).toContain('this.translations = translations');
      expect(componentFileContent).toContain('@Localization(\'./test.localization.json\')');

      const templateFileContent = tree.readText(templatePath);
      expect(templateFileContent).toContain('<div>Localization: {{ translations.dummyLoc1 | o3rTranslate }}</div>');

      const specFileContent = tree.readText(specPath);
      expect(specFileContent).toContain('const localizationService = TestBed.inject(LocalizationService);');
      expect(specFileContent).toContain('localizationService.configure()');
      expect(specFileContent).toContain('...mockTranslationModules(localizationConfiguration, mockTranslations, mockTranslationsCompilerProvider)');
      expect(specFileContent).toContain('const localizationConfiguration = ');
      expect(specFileContent).toContain('const mockTranslations = ');
      expect(specFileContent).toContain('const mockTranslationsCompilerProvider: Provider = ');
    });

    it('should throw if we add localization to a component that already has it', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = await runner.runSchematic('localization-to-component', {
        projectName: 'test-project',
        path: o3rComponentPath
      }, initialTree);
      await expect(runner.runSchematic('localization-to-component', {
        projectName: 'test-project',
        path: o3rComponentPath
      }, tree)).rejects.toThrow();
    });
  });

  describe('Otter module component', () => {
    beforeEach(() => {
      initialTree = Tree.empty();
      initialTree.create(o3rComponentPath, `
        import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
        import {O3rComponent} from '@o3r/core';
        import {Subscription} from 'rxjs';

        @O3rComponent({
          componentType: 'Component'
        })
        @Component({
          selector: 'o3r-test-pres',
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
      initialTree.create(templatePath, '<div>My HTML content</div>');
      initialTree.create(specPath, `
        import { ComponentFixture, TestBed } from '@angular/core/testing';
        import { TestComponent } from './test.component';

        describe('TestComponent', () => {
          let component: TestComponent;
          let fixture: ComponentFixture<TestComponent>;

          beforeEach(() => {
            TestBed.configureTestingModule({
              declarations: [TestComponent]
            });
            fixture = TestBed.createComponent(TestComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
          });

          it('should create', () => {
            expect(component).toBeTruthy();
          });
        });
      `);
      initialTree.create(modulePath, `
        import {CommonModule} from '@angular/common';
        import {NgModule} from '@angular/core';
        import {TestComponent} from './test.component';

        @NgModule({
          imports: [CommonModule],
          declarations: [TestComponent],
          exports: [TestComponent]
        })
        export class TestModule {}
      `);
      initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
    });

    it('should update the module', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = await runner.runSchematic('localization-to-component', {
        projectName: 'test-project',
        path: o3rComponentPath
      }, initialTree);

      const componentFileContent = tree.readText(o3rComponentPath);
      expect(componentFileContent).not.toContain('LocalizationModule');

      const moduleFileContent = tree.readText(modulePath);
      expect(moduleFileContent).toContain('LocalizationModule');
    });
  });

  describe('Angular component', () => {
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

    it('should throw if inexisting path', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);

      await expect(runner.runSchematic('localization-to-component', {
        projectName: 'test-project',
        path: 'inexisting-path.component.ts'
      }, initialTree)).rejects.toThrow();
    });

    describe('Angular component', () => {
      it('should throw if no Otter component', async () => {
        const runner = new SchematicTestRunner('schematics', collectionPath);

        await expect(firstValueFrom(runner.callRule(ngAddLocalizationFn({
          path: ngComponentPath,
          skipLinter: false,
          activateDummy: false,
          specFilePath: undefined
        }), initialTree, { interactive: false }))).rejects.toThrow();
      });

      it('should call convert-component if no Otter component', async () => {
        const runner = new SchematicTestRunner('schematics', collectionPath);
        const o3rCorePackageJson = require.resolve('@o3r/core/package.json');
        runner.registerCollection('@o3r/core', path.resolve(path.dirname(o3rCorePackageJson), require(o3rCorePackageJson).schematics));
        const spy = jest.spyOn(runner.engine, 'createSchematic');

        const tree = await runner.runSchematic('localization-to-component', {
          path: ngComponentPath
        }, initialTree);

        expect(spy).toHaveBeenCalledWith('convert-component', expect.anything(), expect.anything());
        expect(tree.exists(ngComponentPath.replace(/component\.ts$/, 'translation.ts'))).toBeTruthy();
      });
    });
  });
});
