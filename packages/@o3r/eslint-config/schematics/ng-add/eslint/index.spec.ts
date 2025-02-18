import * as path from 'node:path';
import {
  callRule,
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing';
import {
  firstValueFrom,
} from 'rxjs';
import {
  updateEslintConfig,
} from './index';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');
const context = { description: { path: __dirname } };
const runner = new SchematicTestRunner('schematics', collectionPath);

const monorepoPkgName = '@scope/monorepo';
const appName = 'test-app';
const appRoot = `apps/${appName}`;
const libName = 'test-lib';
const libRoot = `libs/${libName}`;
let initialTree: Tree;
const angularJsonContent = {
  projects: {
    [appName]: {
      root: appRoot,
      projectType: 'application',
      architect: {
        build: {
          fakeContent: 'should not be modified'
        }
      }
    },
    [libName]: {
      root: libRoot,
      projectType: 'library',
      architect: {
        build: {
          fakeContent: 'should not be modified'
        }
      }
    }
  }
};

describe('update eslint config', () => {
  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('package.json', JSON.stringify({ name: monorepoPkgName }));
    initialTree.create('angular.json', JSON.stringify(angularJsonContent));
  });

  it('should add an eslint config on workspace', async () => {
    const tree = await firstValueFrom(callRule(updateEslintConfig(__dirname), initialTree, runner.engine.createContext(context as any)));
    expect(tree.exists('eslint.config.mjs')).toBeTruthy();
    expect(tree.exists('eslint.local.config.mjs')).toBeTruthy();
    expect(tree.exists('eslint.shared.config.mjs')).toBeTruthy();
    expect(tree.exists('tsconfig.eslint.json')).toBeTruthy();
    expect(tree.readJson('angular.json')).toEqual(angularJsonContent);
    expect(tree.readText('eslint.local.config.mjs')).toContain(`${monorepoPkgName}/projects`);
    expect(tree.readText('eslint.shared.config.mjs')).toContain(`${monorepoPkgName}/report-unused-disable-directives`);
    expect(tree.readText('eslint.shared.config.mjs')).toContain(`${monorepoPkgName}/eslint-config`);
    expect(tree.readText('eslint.shared.config.mjs')).toContain(`${monorepoPkgName}/ignores`);
  });

  it('should add an eslint config on an application', async () => {
    const pckName = `@scope/${appName}`;
    initialTree.create(`${appRoot}/package.json`, JSON.stringify({ name: pckName }));
    const tree = await firstValueFrom(callRule(updateEslintConfig(__dirname, appName), initialTree, runner.engine.createContext(context as any)));
    expect(tree.exists('eslint.config.mjs')).toBeFalsy();
    expect(tree.exists('eslint.local.config.mjs')).toBeFalsy();
    expect(tree.exists('eslint.shared.config.mjs')).toBeFalsy();
    expect(tree.exists('tsconfig.eslint.json')).toBeFalsy();
    expect(tree.exists(`${appRoot}/eslint.config.mjs`)).toBeTruthy();
    expect(tree.exists(`${appRoot}/eslint.local.config.mjs`)).toBeTruthy();
    expect(tree.exists(`${appRoot}/tsconfig.eslint.json`)).toBeTruthy();
    expect(tree.exists(`${libRoot}/eslint.config.mjs`)).toBeFalsy();
    expect(tree.exists(`${libRoot}/eslint.local.config.mjs`)).toBeFalsy();
    expect(tree.exists(`${libRoot}/tsconfig.eslint.json`)).toBeFalsy();
    expect(tree.readText(`${appRoot}/eslint.config.mjs`)).toContain('import shared from \'../../eslint.shared.config.mjs\'');
    expect(tree.readText(`${appRoot}/eslint.local.config.mjs`)).toContain(`${pckName}/projects`);
    expect(tree.readText(`${appRoot}/eslint.local.config.mjs`)).toContain(`${pckName}/ignores`);
    expect(tree.readText(`${appRoot}/eslint.local.config.mjs`)).toContain('...globals.browser');
    expect(tree.readText(`${appRoot}/tsconfig.eslint.json`)).toContain('"extends": "../../tsconfig.base.json"');
    expect(tree.readJson('angular.json')).toEqual({
      ...angularJsonContent,
      projects: {
        ...angularJsonContent.projects,
        [appName]: {
          ...angularJsonContent.projects[appName],
          architect: {
            ...angularJsonContent.projects[appName].architect,
            lint: expect.objectContaining({
              builder: '@angular-eslint/builder:lint',
              options: {
                eslintConfig: `${appRoot}/eslint.config.mjs`,
                lintFilePatterns: [
                  `${appRoot}/src/**/*.{m,c,}{j,t}s`,
                  `${appRoot}/src/**/*.json`,
                  `${appRoot}/src/**/*.html`
                ]
              }
            })
          }
        }
      }
    });
  });

  it('should add an eslint config on a library', async () => {
    const pckName = `@scope/${libName}`;
    initialTree.create(`${libRoot}/package.json`, JSON.stringify({ name: pckName }));
    const tree = await firstValueFrom(callRule(updateEslintConfig(__dirname, libName), initialTree, runner.engine.createContext(context as any)));
    expect(tree.exists('eslint.config.mjs')).toBeFalsy();
    expect(tree.exists('eslint.local.config.mjs')).toBeFalsy();
    expect(tree.exists('eslint.shared.config.mjs')).toBeFalsy();
    expect(tree.exists('tsconfig.eslint.json')).toBeFalsy();
    expect(tree.exists(`${libRoot}/eslint.config.mjs`)).toBeTruthy();
    expect(tree.exists(`${libRoot}/eslint.local.config.mjs`)).toBeTruthy();
    expect(tree.exists(`${libRoot}/tsconfig.eslint.json`)).toBeTruthy();
    expect(tree.exists(`${appRoot}/eslint.config.mjs`)).toBeFalsy();
    expect(tree.exists(`${appRoot}/eslint.local.config.mjs`)).toBeFalsy();
    expect(tree.exists(`${appRoot}/tsconfig.eslint.json`)).toBeFalsy();
    expect(tree.readText(`${libRoot}/eslint.config.mjs`)).toContain('import shared from \'../../eslint.shared.config.mjs\'');
    expect(tree.readText(`${libRoot}/eslint.local.config.mjs`)).toContain(`${pckName}/projects`);
    expect(tree.readText(`${libRoot}/eslint.local.config.mjs`)).toContain(`${pckName}/ignores`);
    expect(tree.readText(`${libRoot}/eslint.local.config.mjs`)).not.toContain('...globals.browser');
    expect(tree.readJson('angular.json')).toEqual({
      ...angularJsonContent,
      projects: {
        ...angularJsonContent.projects,
        [libName]: {
          ...angularJsonContent.projects[libName],
          architect: {
            ...angularJsonContent.projects[libName].architect,
            lint: expect.objectContaining({
              builder: '@angular-eslint/builder:lint',
              options: {
                eslintConfig: `${libRoot}/eslint.config.mjs`,
                lintFilePatterns: [
                  `${libRoot}/src/**/*.{m,c,}{j,t}s`,
                  `${libRoot}/src/**/*.json`,
                  `${libRoot}/src/**/*.html`
                ]
              }
            })
          }
        }
      }
    });
  });
});
