import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';

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
      const angularPackageJson = require.resolve('@schematics/angular/package.json');
      runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
      tree = await runner.runExternalSchematic('schematics', 'page', {
        projectName: 'test-project',
        name: 'test-page',
        appRoutingModulePath: 'app.routing.module.ts',
        path: 'src/app'
      }, getInitialTree());
    });

    it('should generate files', () => {
      expect(tree.files.filter((file) => /test-page/.test(file)).length).toEqual(7);
      expect(tree.files.some((file) => /^[\\/]?src[\\/]app[\\/]test-page[\\/]test-page\.module\.ts$/i.test(file))).toBeTruthy();
      expect(tree.readContent('/src/app/test-page/test-page.module.ts')).toContain('RouterModule.forChild([{path: \'\', component: TestPageComponent}])');
    });

    it('should insert page route in App Routing Module', () => {
      expect(tree.readContent('/app.routing.module.ts')).toContain('{path: \'test-page\', loadChildren: () => import(\'./test-page/index\').then((m) => m.TestPageModule)}');
    });

    it('should have the default selector', () => {
      expect(tree.readContent('/src/app/test-page/test-page.component.ts')).toContain('selector: \'o3r-test-page\'');
    });
  });

  describe('Standalone page', () => {
    beforeAll(async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const angularPackageJson = require.resolve('@schematics/angular/package.json');
      runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
      tree = await runner.runExternalSchematic('schematics', 'page', {
        projectName: 'test-project',
        name: 'test-page',
        appRoutingModulePath: 'app.routing.module.ts',
        path: 'src/app',
        standalone: true
      }, getInitialTree());
    });

    it('should generate files', () => {
      expect(tree.files.filter((file) => /test-page/.test(file)).length).toEqual(6);
      expect(tree.files.some((file) => /^[\\/]?src[\\/]app[\\/]test-page[\\/]test-page\.module\.ts$/i.test(file))).toBeFalsy();
    });

    it('should insert page route in App Routing Module', () => {
      expect(tree.readContent('/app.routing.module.ts')).toContain('{path: \'test-page\', loadComponent: () => import(\'./test-page/index\').then((m) => m.TestPageComponent)}');
    });
  });

  describe('Custom parameters', () => {
    beforeAll(async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const angularPackageJson = require.resolve('@schematics/angular/package.json');
      runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
      tree = await runner.runExternalSchematic('schematics', 'page', {
        projectName: 'test-project',
        name: 'testPage',
        scope: 'testScope',
        prefix: 'custom',
        appRoutingModulePath: 'app.routing.module.ts',
        path: './custom'
      }, getInitialTree());
    });

    it('should generate files with default parameters', () => {
      expect(tree.files.filter((file) => /test-page/.test(file)).length).toEqual(7);
      expect(tree.files.some((file) => /^[\\/]?custom[\\/]test-scope[\\/]test-page[\\/]test-page\.module\.ts$/i.test(file))).toBeTruthy();
    });

    it('should insert page route in App Routing Module', () => {
      expect(tree.readContent('/app.routing.module.ts')).toContain('{path: \'test-page\', loadChildren: () => import(\'./test-scope/test-page/index\').then((m) => m.TestPageModule)}');
    });

    it('should have the custom selector', () => {
      expect(tree.readContent('/custom/test-scope/test-page/test-page.component.ts')).toContain('selector: \'custom-test-page\'');
    });
  });

  describe('Wrong App Routing Module path', () => {
    beforeAll(async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const angularPackageJson = require.resolve('@schematics/angular/package.json');
      runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
      tree = await runner.runExternalSchematic('schematics', 'page', {
        projectName: 'test-project',
        name: 'testPage',
        prefix: 'o3r',
        appRoutingModulePath: 'wrong.app.routing.module.ts',
        path: '.'
      }, getInitialTree());
    });

    it('should still generate files', () => {
      expect(tree.files.filter((file) => /test-page/.test(file)).length).toEqual(7);
    });
  });
});
