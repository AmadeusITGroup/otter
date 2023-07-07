import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import * as fs from 'node:fs';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');
const emptyO3rComponentPath = '/src/components/empty/empty.component.ts';
const o3rComponentPath = '/src/components/test/test.component.ts';
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
      initialTree.create(localizationPath, '{}');
      initialTree.create(translationPath, `
        import { Translation } from '@o3r/core';

        export interface TestTranslation extends Translation {}

        export const translations: TestTranslation = {}
      `);
      initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
    });

    it('should update the localization files', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = await runner.runSchematic('add-localization-key', {
        path: o3rComponentPath,
        key: 'dummyLoc1',
        description: 'Dummy 1 description',
        value: 'Dummy 1'
      }, initialTree);

      const translationFileContent = tree.readText(translationPath);
      expect(translationFileContent).toContain('dummyLoc1: string;');
      expect(translationFileContent).toContain('dummyLoc1: \'o3r-test-pres.dummyLoc1\'');

      const localizationFileContent: any = tree.readJson(localizationPath);
      expect(localizationFileContent['o3r-test-pres.dummyLoc1'].description).toBe('Dummy 1 description');
      expect(localizationFileContent['o3r-test-pres.dummyLoc1'].defaultValue).toBe('Dummy 1');
    });

    it('should throw if we add localization key to a component that already has it', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = await runner.runSchematic('add-localization-key', {
        path: o3rComponentPath,
        key: 'dummyLoc1',
        description: 'Dummy 1 description',
        value: 'Dummy 1'
      }, initialTree);
      await expect(runner.runSchematic('add-localization-key', {
        path: o3rComponentPath,
        key: 'dummyLoc1',
        description: 'Dummy 1 description',
        value: 'Dummy 1'
      }, tree)).rejects.toThrow();
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

    it('should throw if no Otter component', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);

      await expect(runner.runSchematic('add-localization-key', {
        path: ngComponentPath,
        key: 'dummyLoc1',
        description: 'Dummy 1 description',
        value: 'Dummy 1'
      }, initialTree)).rejects.toThrow();

      await expect(runner.runSchematic('add-localization-key', {
        path: 'inexisting-path.component.ts',
        key: 'dummyLoc1',
        description: 'Dummy 1 description',
        value: 'Dummy 1'
      }, initialTree)).rejects.toThrow();
    });
  });
});
