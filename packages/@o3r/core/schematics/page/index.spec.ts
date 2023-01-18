import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');

describe('Page', () => {
  let tree: UnitTestTree;

  const getInitialTree = () => {
    const initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
    initialTree.create('app.routing.module.ts', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'app.routing.module.mocks.ts')));

    return initialTree;
  };

  describe('Default parameters', () => {
    beforeAll(async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      tree = await lastValueFrom(runner.runExternalSchematicAsync('schematics', 'page', {
        projectName: 'test-project',
        name: 'test-page',
        appRoutingModulePath: 'app.routing.module.ts',
        path: 'src/app'
      }, getInitialTree()));
    });

    it('should generate files', () => {
      expect(tree.files.filter((file) => /test-page/.test(file)).length).toEqual(13);
      expect(tree.files.some((file) => /^[\\/]?src[\\/]app[\\/]test-page[\\/]test-page\.module\.ts$/i.test(file))).toBeTruthy();
    });

    it('should insert page route in App Routing Module', () => {
      expect(tree.readContent('/app.routing.module.ts')).toContain('{path: \'test-page\', loadChildren: () => import(\'./test-page/index\').then((m) => m.TestPageModule)}');
    });

    it('should have the default selector', () => {
      expect(tree.readContent('/src/app/test-page/test-page.component.ts')).toContain('selector: \'tst-test-page\'');
    });
  });

  describe('Custom parameters', () => {
    beforeAll(async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      tree = await lastValueFrom(runner.runExternalSchematicAsync('schematics', 'page', {
        projectName: 'test-project',
        name: 'testPage',
        scope: 'testScope',
        prefix: 'o3r',
        appRoutingModulePath: 'app.routing.module.ts',
        path: './custom'
      }, getInitialTree()));
    });

    it('should generate files with default parameters', () => {
      expect(tree.files.filter((file) => /test-page/.test(file)).length).toEqual(13);
      expect(tree.files.some((file) => /^[\\/]?custom[\\/]test-scope[\\/]test-page[\\/]test-page\.module\.ts$/i.test(file))).toBeTruthy();
    });

    it('should insert page route in App Routing Module', () => {
      expect(tree.readContent('/app.routing.module.ts')).toContain('{path: \'test-page\', loadChildren: () => import(\'./test-scope/test-page/index\').then((m) => m.TestPageModule)}');
    });

    it('should have the custom selector', () => {
      expect(tree.readContent('/custom/test-scope/test-page/test-page.component.ts')).toContain('selector: \'o3r-test-page\'');
    });
  });

  describe('Wrong App Routing Module path', () => {
    beforeAll(async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      tree = await lastValueFrom(runner.runExternalSchematicAsync('schematics', 'page', {
        projectName: 'test-project',
        name: 'testPage',
        prefix: 'o3r',
        appRoutingModulePath: 'wrong.app.routing.module.ts',
        path: '.'
      }, getInitialTree()));
    });

    it('should still generate files', () => {
      expect(tree.files.filter((file) => /test-page/.test(file)).length).toEqual(13);
    });
  });
});
