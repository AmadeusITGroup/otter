jest.mock('node:readline', () => ({
  createInterface: () => ({
    question: jest.fn((_query, cb) => cb('mockInputUser')) as any,
    close: jest.fn()
  })
}));
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { firstValueFrom } from 'rxjs';
import { ngAddLocalizationKeyFn } from './index';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');
const emptyO3rComponentPath = '/src/components/empty/empty.component.ts';
const o3rComponentPath = '/src/components/test/test.component.ts';
const templatePath = '/src/components/test/test.template.html';
const translationPath = '/src/components/test/test.translations.ts';
const localizationPath = '/src/components/test/test.localization.json';
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
        import {Localization, LocalizatioModule, Translatable} from '@o3r/localization';
        import {translations, TestTranslation} from './test.translations';

        @O3rComponent({
          componentType: 'Component'
        })
        @Component({
          selector: 'o3r-test-pres',
          standalone: true,
          imports: [CommonModule, LocalizatioModule],
          styleUrls: ['./test.style.scss'],
          templateUrl: './test.template.html',
          changeDetection: ChangeDetectionStrategy.OnPush,
          encapsulation: ViewEncapsulation.None
        })
        export class TestComponent implements Translatable<TestTranslation> {
          @Input()
          @Localization('./test.localization.json')
          public translations: TestTranslation;

          constructor() {
            this.translations = translations;
          }
        }
      `);
      initialTree.create(emptyO3rComponentPath, `
        import {CommonModule} from '@angular/common';
        import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
        import {O3rComponent} from '@o3r/core';
        import {translations, TestTranslation} from './test.translations';

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
        export class TestComponent {}
      `);
      initialTree.create(templatePath, '<div>Dummy 1</div>');
      initialTree.create(localizationPath, '{}');
      initialTree.create(translationPath, `
        import { Translation } from '@o3r/core';

        export interface TestTranslation extends Translation {}

        export const translations: TestTranslation = {}
      `);
      initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
    });

    it('should update the localization files and the template', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = await runner.runSchematic('add-localization-key', {
        path: o3rComponentPath,
        key: 'dummyLoc1',
        description: 'Dummy 1 description',
        value: 'Dummy 1',
        updateTemplate: true
      }, initialTree);

      const templateFileContent = tree.readText(templatePath);
      expect(templateFileContent).toBe('<div>{{ translations.dummyLoc1 | o3rTranslate }}</div>');

      const translationFileContent = tree.readText(translationPath);
      expect(translationFileContent).toContain('dummyLoc1: string;');
      expect(translationFileContent).toContain('dummyLoc1: \'o3r-test-pres.dummyLoc1\'');

      const localizationFileContent: any = tree.readJson(localizationPath);
      expect(localizationFileContent['o3r-test-pres.dummyLoc1'].description).toBe('Dummy 1 description');
      expect(localizationFileContent['o3r-test-pres.dummyLoc1'].defaultValue).toBe('Dummy 1');
    });

    it('should ask user for another key name if we add a localization key to a component that already has it', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      let tree = await runner.runSchematic('add-localization-key', {
        path: o3rComponentPath,
        key: 'dummyLoc1',
        description: 'Dummy 1 description',
        value: 'Dummy 1'
      }, initialTree);
      tree = await runner.runSchematic('add-localization-key', {
        path: o3rComponentPath,
        key: 'dummyLoc1',
        description: 'Dummy 1 description',
        value: 'Dummy 1'
      }, tree);
      const localizationFileContent: any = tree.readJson(localizationPath);
      expect(localizationFileContent['o3r-test-pres.mockInputUser']).toBeDefined();
    });

    it('should throw if we add localization key to a component that is not localized', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      await expect(runner.runSchematic('add-localization-key', {
        path: emptyO3rComponentPath,
        key: 'dummyLoc1',
        description: 'Dummy 1 description',
        value: 'Dummy 1'
      }, initialTree)).rejects.toThrow();
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

      await expect(runner.runSchematic('add-localization-key', {
        path: 'inexisting-path.component.ts',
        key: 'dummyLoc1',
        description: 'Dummy 1 description',
        value: 'Dummy 1'
      }, initialTree)).rejects.toThrow();
    });

    describe('Angular component', () => {
      it('should throw if no Otter component', async () => {
        const runner = new SchematicTestRunner('schematics', collectionPath);

        await expect(firstValueFrom(runner.callRule(ngAddLocalizationKeyFn({
          path: ngComponentPath,
          skipLinter: false,
          key: 'dummyLoc1',
          description: 'Dummy 1 description',
          value: 'Dummy 1',
          dictionnary: false
        }), initialTree, { interactive: false }))).rejects.toThrow();
      });

      it('should call convert-component if no Otter component', async () => {
        const runner = new SchematicTestRunner('schematics', collectionPath);
        const o3rCorePackageJson = require.resolve('@o3r/core/package.json');
        runner.registerCollection('@o3r/core', path.resolve(path.dirname(o3rCorePackageJson), require(o3rCorePackageJson).schematics));
        const spy = jest.spyOn(runner.engine, 'createSchematic');

        const tree = await runner.runSchematic('add-localization-key', {
          path: ngComponentPath,
          skipLinter: false,
          key: 'dummyLoc1',
          description: 'Dummy 1 description',
          value: 'Dummy 1',
          dictionnary: false
        }, initialTree);

        expect(spy).toHaveBeenCalledWith('convert-component', expect.anything(), expect.anything());
        expect(tree.exists(ngComponentPath.replace(/component\.ts$/, 'translation.ts'))).toBeTruthy();
      });
    });
  });
});
