import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  isJsonObject,
  JsonObject,
} from '@angular-devkit/core';
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
  updatePackageJsonScripts,
} from './index';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');
const packageJsonPath = path.join(
  __dirname,
  '..',
  '..',
  'testing',
  'MOCK_package.json'
);
const expectedPackageJsonPath = path.join(
  __dirname,
  '..',
  '..',
  'testing',
  'EXPECTED_package.json'
);

describe('Ng add', () => {
  let baseTree: Tree;

  beforeEach(async () => {
    const runner = new SchematicTestRunner(
      '@ama-sdk/schematics',
      collectionPath
    );
    const tree = Tree.empty();
    tree.create('/package.json', fs.readFileSync(packageJsonPath));
    tree.create(
      '/expected-package.json',
      fs.readFileSync(expectedPackageJsonPath)
    );
    baseTree = await firstValueFrom(runner.callRule(updatePackageJsonScripts, tree));
  });

  it('should have update scripts in the package.json', () => {
    const packageJson = baseTree.readJson('/package.json');
    const expectedPackageJson = baseTree.readJson('/expected-package.json');
    expect(isJsonObject(packageJson)).toBeTruthy();
    expect(isJsonObject((packageJson as JsonObject).scripts)).toBeTruthy();
    const scripts = Object.entries((packageJson as JsonObject).scripts);
    scripts.forEach(([scriptName, cmd]) => {
      expect(cmd).toBe(
        ((expectedPackageJson as JsonObject).scripts as JsonObject)[scriptName]
      );
    });
  });
});
