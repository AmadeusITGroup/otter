import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  type UnitTestTree,
} from '@angular-devkit/schematics/testing';

const migrationPath = path.join(__dirname, '..', '..', '..', 'migration.json');

/** Minimal angular.json with a real bundling builder and a lint target that should NOT be touched */
const angularJsonMock = JSON.stringify({
  version: 1,
  projects: {
    'test-app': {
      projectType: 'application',
      root: '.',
      architect: {
        build: {
          builder: '@angular/build:application',
          options: { tsConfig: 'tsconfig.json' }
        },
        server: {
          builder: '@angular-devkit/build-angular:server',
          options: { tsConfig: 'tsconfig.server.json' }
        },
        lint: {
          builder: '@angular-eslint/builder:lint',
          options: {}
        },
        test: {
          builder: '@angular-devkit/build-angular:jest',
          options: {}
        }
      }
    }
  }
}, null, 2);

describe('Update V14.4', () => {
  let initialTree: Tree;
  let runner: SchematicTestRunner;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', angularJsonMock);
    runner = new SchematicTestRunner('schematics', migrationPath);
  });

  describe('addTranslocoExternalDependency', () => {
    it('should add @o3r/transloco to externalDependencies of bundling targets when it is not installed', async () => {
      initialTree.create('package.json', JSON.stringify({ name: 'test-project', version: '0.0.0' }));
      const tree: UnitTestTree = await runner.runSchematic('migration-v14_4', {}, initialTree);
      const angularJson = JSON.parse(tree.readText('angular.json'));
      const app = angularJson.projects['test-app'].architect;
      expect(app.build.options.externalDependencies).toContain('@o3r/transloco');
      expect(app.server.options.externalDependencies).toContain('@o3r/transloco');
    });

    it('should not add @o3r/transloco to non-bundling targets (lint, jest)', async () => {
      initialTree.create('package.json', JSON.stringify({ name: 'test-project', version: '0.0.0' }));
      const tree: UnitTestTree = await runner.runSchematic('migration-v14_4', {}, initialTree);
      const angularJson = JSON.parse(tree.readText('angular.json'));
      const app = angularJson.projects['test-app'].architect;
      expect(app.lint.options.externalDependencies).toBeUndefined();
      expect(app.test.options.externalDependencies).toBeUndefined();
    });

    it('should add @o3r/transloco to karma test targets (webpack-based)', async () => {
      initialTree.create('package.json', JSON.stringify({ name: 'test-project', version: '0.0.0' }));
      const parsed = JSON.parse(angularJsonMock);
      parsed.projects['test-app'].architect.karmaTest = {
        builder: '@angular-devkit/build-angular:karma',
        options: {}
      };
      initialTree.overwrite('angular.json', JSON.stringify(parsed, null, 2));

      const tree: UnitTestTree = await runner.runSchematic('migration-v14_4', {}, initialTree);
      const result = JSON.parse(tree.readText('angular.json'));
      expect(result.projects['test-app'].architect.karmaTest.options.externalDependencies).toContain('@o3r/transloco');
    });

    it('should not add @o3r/transloco to externalDependencies when it is already installed as a dependency', async () => {
      initialTree.create('package.json', JSON.stringify({
        name: 'test-project',
        version: '0.0.0',
        dependencies: { '@o3r/transloco': '14.4.0' }
      }));
      const tree: UnitTestTree = await runner.runSchematic('migration-v14_4', {}, initialTree);
      expect(tree.readText('angular.json')).toEqual(angularJsonMock);
    });

    it('should not add @o3r/transloco to externalDependencies when it is already installed as a devDependency', async () => {
      initialTree.create('package.json', JSON.stringify({
        name: 'test-project',
        version: '0.0.0',
        devDependencies: { '@o3r/transloco': '14.4.0' }
      }));
      const tree: UnitTestTree = await runner.runSchematic('migration-v14_4', {}, initialTree);
      expect(tree.readText('angular.json')).toEqual(angularJsonMock);
    });

    it('should not duplicate @o3r/transloco if already in externalDependencies', async () => {
      initialTree.create('package.json', JSON.stringify({ name: 'test-project', version: '0.0.0' }));
      const parsed = JSON.parse(angularJsonMock);
      parsed.projects['test-app'].architect.build.options.externalDependencies = ['@o3r/transloco'];
      initialTree.overwrite('angular.json', JSON.stringify(parsed, null, 2));

      const tree: UnitTestTree = await runner.runSchematic('migration-v14_4', {}, initialTree);
      const result = JSON.parse(tree.readText('angular.json'));
      const externals: string[] = result.projects['test-app'].architect.build.options.externalDependencies;
      expect(externals.filter((e) => e === '@o3r/transloco')).toHaveLength(1);
    });

    it('should warn (and not touch angular.json) for custom-webpack builders', async () => {
      initialTree.create('package.json', JSON.stringify({ name: 'test-project', version: '0.0.0' }));
      const parsed = JSON.parse(angularJsonMock);
      parsed.projects['test-app'].architect.build = {
        builder: '@angular-builders/custom-webpack:browser',
        options: { customWebpackConfig: { path: './webpack.config.js' } }
      };
      const customWebpackAngularJson = JSON.stringify(parsed, null, 2);
      initialTree.overwrite('angular.json', customWebpackAngularJson);

      const warnings: string[] = [];
      runner.logger.subscribe((entry) => {
        if (entry.level === 'warn') {
          warnings.push(entry.message);
        }
      });

      const tree: UnitTestTree = await runner.runSchematic('migration-v14_4', {}, initialTree);

      // angular.json build target left untouched (no externalDependencies added for custom-webpack)
      const result = JSON.parse(tree.readText('angular.json'));
      expect(result.projects['test-app'].architect.build.options.externalDependencies).toBeUndefined();
      expect(warnings.some((w) => w.includes('./webpack.config.js') && w.includes('IgnorePlugin') && w.includes('@o3r/transloco'))).toBe(true);
    });

    it('should not modify library projects', async () => {
      initialTree.create('package.json', JSON.stringify({ name: 'test-project', version: '0.0.0' }));
      const parsed = JSON.parse(angularJsonMock);
      parsed.projects['test-lib'] = {
        projectType: 'library',
        root: './projects/test-lib',
        architect: {
          build: { builder: '@angular-devkit/build-angular:ng-packagr', options: {} }
        }
      };
      initialTree.overwrite('angular.json', JSON.stringify(parsed, null, 2));

      const tree: UnitTestTree = await runner.runSchematic('migration-v14_4', {}, initialTree);
      const result = JSON.parse(tree.readText('angular.json'));
      expect(result.projects['test-lib'].architect.build.options.externalDependencies).toBeUndefined();
    });
  });
});
