import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';

const mockGetAppModuleFilePath = jest.fn();
jest.mock('@o3r/schematics', () => {
  return {
    ...jest.requireActual('@o3r/schematics'),
    getAppModuleFilePath: mockGetAppModuleFilePath
  };
});

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');

const getInitialTree = () => {
  const initialTree = Tree.empty();
  initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
  initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'package.mocks.json')));
  initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
  initialTree.create('app-routing-module.ts', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'app-routing-module.mocks.ts')));

  return initialTree;
};

describe('Page', () => {
  let tree: UnitTestTree;

  describe('Default parameters', () => {
    beforeAll(async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const angularPackageJson = require.resolve('@schematics/angular/package.json');
      runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
      tree = await runner.runExternalSchematic('schematics', 'page', {
        projectName: 'test-project',
        name: 'test-page',
        appRoutingModulePath: 'app-routing-module.ts',
        path: 'src/app'
      }, getInitialTree());
    });

    it('should generate files', () => {
      expect(tree.files.filter((file) => /test-page/.test(file)).length).toEqual(6);
      expect(tree.files.some((file) => /^[\\/]?src[\\/]app[\\/]test-page[\\/]test-page[.-]module\.ts$/i.test(file))).toBeFalsy();
    });

    it('should insert page route in App Routing Module', () => {
      expect(tree.readContent('/app-routing-module.ts')).toContain('{path: \'test-page\', loadComponent: () => import(\'./test-page/index\').then((m) => m.TestPage)}');
    });

    it('should have the default selector', () => {
      expect(tree.readContent('/src/app/test-page/test-page.ts')).toContain('selector: \'o3r-test-page\'');
    });
  });

  describe('Default parameters for a typed page', () => {
    beforeAll(async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const angularPackageJson = require.resolve('@schematics/angular/package.json');
      runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
      tree = await runner.runExternalSchematic('schematics', 'page', {
        projectName: 'test-project',
        name: 'test-page',
        appRoutingModulePath: 'app-routing-module.ts',
        path: 'src/app',
        type: 'test-type'
      }, getInitialTree());
    });

    it('should generate files', () => {
      const expectedFileNames = [
        'test-page.test-type.ts',
        'test-page.test-type.spec.ts',
        'test-page.test-type.scss',
        'test-page.test-type.html',
        'README.md',
        'index.ts'
      ];
      expect(tree.files.filter((file) => /test-page/.test(file)).sort()).toEqual(expectedFileNames.map((fileName) => `/src/app/test-page/${fileName}`).sort());
      expect(tree.readContent('/src/app/test-page/index.ts')).toContain('export * from \'./test-page.test-type\';');
    });

    it('should insert page route in App Routing Module', () => {
      expect(tree.readContent('/app-routing-module.ts')).toContain('{path: \'test-page\', loadComponent: () => import(\'./test-page/index\').then((m) => m.TestPageTestType)}');
    });

    it('should have the default selector', () => {
      expect(tree.readContent('/src/app/test-page/test-page.test-type.ts')).toContain('selector: \'o3r-test-page\'');
    });
  });

  describe('Non standalone page', () => {
    beforeAll(async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const angularPackageJson = require.resolve('@schematics/angular/package.json');
      runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
      tree = await runner.runExternalSchematic('schematics', 'page', {
        projectName: 'test-project',
        name: 'test-page',
        appRoutingModulePath: 'app-routing-module.ts',
        path: 'src/app',
        standalone: false
      }, getInitialTree());
    });

    it('should generate files', () => {
      expect(tree.files.filter((file) => /test-page/.test(file)).length).toEqual(7);
      expect(tree.files.some((file) => /^[\\/]?src[\\/]app[\\/]test-page[\\/]test-page-module\.ts$/i.test(file))).toBeTruthy();
      expect(tree.readContent('/src/app/test-page/test-page-module.ts')).toContain('RouterModule.forChild([{path: \'\', component: TestPage}])');
    });

    it('should insert page route in App Routing Module', () => {
      expect(tree.readContent('/app-routing-module.ts')).toContain('{path: \'test-page\', loadChildren: () => import(\'./test-page/index\').then((m) => m.TestPageModule)}');
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
        appRoutingModulePath: 'app-routing-module.ts',
        path: './custom'
      }, getInitialTree());
    });

    it('should generate files with default parameters', () => {
      expect(tree.files.filter((file) => /test-page/.test(file)).length).toEqual(6);
      expect(tree.files.some((file) => /^[\\/]?custom[\\/]test-scope[\\/]test-page[\\/]test-page[.-]module\.ts$/i.test(file))).toBeFalsy();
    });

    it('should insert page route in App Routing Module', () => {
      expect(tree.readContent('/app-routing-module.ts')).toContain('{path: \'test-page\', loadComponent: () => import(\'./test-scope/test-page/index\').then((m) => m.TestPage)}');
    });

    it('should have the custom selector', () => {
      expect(tree.readContent('/custom/test-scope/test-page/test-page.ts')).toContain('selector: \'custom-test-page\'');
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
        appRoutingModulePath: 'wrong.app-routing-module.ts',
        path: '.'
      }, getInitialTree());
    });

    it('should still generate files', () => {
      expect(tree.files.filter((file) => /test-page/.test(file)).length).toEqual(6);
    });
  });

  describe('Automatic routes definition detection', () => {
    beforeEach(() => {
      mockGetAppModuleFilePath.mockReset();
      mockGetAppModuleFilePath.mockClear();
    });

    it('should add the route on standalone application', async () => {
      mockGetAppModuleFilePath.mockReturnValue('app.config.ts');
      const initialTree = getInitialTree();
      initialTree.create('app.config.ts', `
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes as routes } from './app-routing-module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes)
  ]
};
      `);
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const angularPackageJson = require.resolve('@schematics/angular/package.json');
      runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
      tree = await runner.runExternalSchematic('schematics', 'page', {
        projectName: 'test-project',
        name: 'testPage',
        prefix: 'o3r',
        appRoutingModulePath: undefined,
        path: '.'
      }, initialTree);

      expect(tree.readText('/app-routing-module.ts')).toContain('path: \'test-page\'');
    });

    it('should add the route on module application', async () => {
      mockGetAppModuleFilePath.mockReturnValue('app-module.ts');
      const initialTree = getInitialTree();
      initialTree.create('app-module.ts', `
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/routing';
import { App } from './app';
const appRoutes: Routes = [
  {
    path: '',
    children: [
      {path: '', redirectTo: '/home', pathMatch: 'full'}
    ]
  }
];

@NgModule({
  declarations: [
    App
  ],
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  bootstrap: [App]
})
export class AppModule {}
      `);
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const angularPackageJson = require.resolve('@schematics/angular/package.json');
      runner.registerCollection('@schematics/angular', path.resolve(path.dirname(angularPackageJson), require(angularPackageJson).schematics));
      tree = await runner.runExternalSchematic('schematics', 'page', {
        projectName: 'test-project',
        name: 'testPage',
        prefix: 'o3r',
        appRoutingModulePath: undefined,
        path: '.'
      }, initialTree);

      expect(tree.readText('/app-module.ts')).toContain('path: \'test-page\'');
    });
  });
});
