import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');

const baseFileList = [
  '/CONTRIBUTING.md',
  '/jest.config.js',
  '/readme.md',
  '/tsconfig.doc.json',
  '/tsconfig.build.json',
  '/tsconfig.json',
  '/.commitlintrc.json',
  '/.editorconfig',
  '/.eslintignore',
  '/.eslintrc.js',
  '/.gitignore',
  '/.openapi-generator-ignore',
  '/.renovaterc.json',
  '/.swcrc',
  '/.versionrc.json',
  '/.vscode/settings.json',
  '/.yarnrc.yml',
  '/openapitools.json',
  '/package.json',
  '/configs/tsconfig.test.json',
  '/scripts/clear-index.js',
  '/scripts/files-pack.js',
  '/scripts/override-readme.js',
  '/scripts/restore-readme.js',
  '/src/index.ts',
  '/src/fixtures/jest/index.ts',
  '/src/fixtures/jest/package.json',
  '/src/helpers/index.ts',
  '/src/helpers/package.json',
  '/src/models/enums.ts',
  '/src/models/index.ts',
  '/src/models/patterns.ts',
  '/src/models/base/index.ts',
  '/src/models/core/enums.ts',
  '/src/models/core/index.ts',
  '/src/models/core/patterns.ts',
  '/src/models/custom/enums.ts',
  '/src/models/custom/index.ts',
  '/src/models/custom/patterns.ts',
  '/src/spec/package.json',
  '/src/spec/index.ts',
  '/src/spec/mock-factory/index.ts',
  '/testing/tsconfig.spec.json',
  '/.husky/commit-msg',
  '/.husky/pre-commit',
  '/.husky/.gitignore',
  '/tsconfigs/esm2020/tsconfig.jest.json',
  '/tsconfigs/esm2020/tsconfig.json',
  '/tsconfigs/esm2020/tsconfig.source.json',
  '/tsconfigs/tsconfig.jest.json',
  '/tsconfigs/tsconfig.source.json',
  '/typedoc.json'
];

let tree: UnitTestTree;

describe('Typescript Shell Generator', () => {
  beforeEach(async () => {
    const runner = new SchematicTestRunner('@ama-sdk/schematics', collectionPath);
    tree = await runner.runSchematic('typescript-shell', {
      name: 'test-scope',
      package: 'test-sdk',
      skipInstall: true
    }, Tree.empty());
  });

  it('should generate basic SDK package', () => {
    expect(tree.files.sort()).toEqual(baseFileList.sort());
  });

  it('should generate correct package name', () => {
    const {name} = JSON.parse(tree.readContent('/package.json'));

    expect(name).toEqual('@test-scope/test-sdk');
  });
});
