import type { OpenApiToolsConfiguration } from '@ama-sdk/core';
import {Tree} from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import type { JsonObject, PackageJson } from 'type-fest';

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
  '/src/api/index.ts',
  '/src/api/fixtures.jest.ts',
  '/src/index.ts',
  '/src/models/base/enums.ts',
  '/src/fixtures/jest/index.ts',
  '/src/fixtures/jest/package.json',
  '/src/helpers/index.ts',
  '/src/helpers/package.json',
  '/src/models/enums.ts',
  '/src/models/index.ts',
  '/src/models/patterns.ts',
  '/src/models/base/patterns.ts',
  '/src/spec/operation-adapter.ts',
  '/src/spec/api-mock.ts',
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
  '/tsconfigs/esm2020/tsconfig.jest.json',
  '/tsconfigs/esm2020/tsconfig.json',
  '/tsconfigs/esm2020/tsconfig.source.json',
  '/tsconfigs/tsconfig.jest.json',
  '/tsconfigs/tsconfig.source.json',
  '/typedoc.json'
];

let yarnTree: UnitTestTree;
let npmTree: UnitTestTree;

describe('Typescript Shell Generator', () => {
  beforeEach(async () => {
    const runner = new SchematicTestRunner('@ama-sdk/schematics', collectionPath);
    yarnTree = await runner.runSchematic('typescript-shell', {
      name: 'test-scope',
      package: 'test-sdk',
      skipInstall: true
    }, Tree.empty());
    npmTree = await runner.runSchematic('typescript-shell', {
      name: 'test-scope',
      package: 'test-sdk',
      skipInstall: true,
      packageManager: 'npm'
    }, Tree.empty());
  });

  it('should generate basic SDK package', () => {
    expect(yarnTree.files.sort()).toEqual(baseFileList.sort());
  });

  it('should generate correct package name', () => {
    const {name} = yarnTree.readJson('/package.json') as PackageJson;
    expect(name).toEqual('@test-scope/test-sdk');
  });

  it('should use yarn as default package manager', () => {
    expect(yarnTree.readContent('/package.json')).toContain('yarn exec');
    expect(yarnTree.readContent('/package.json')).not.toContain('npm exec');
  });

  it('should use npm as package manager if specified', () => {
    expect(npmTree.readContent('/package.json')).toContain('npm exec');
    expect(npmTree.readContent('/package.json')).not.toContain('yarn exec');
  });

  it('should generate correct openapitools.json', () => {
    const openApiTools = yarnTree.readJson('/openapitools.json') as JsonObject & OpenApiToolsConfiguration;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    expect(openApiTools['generator-cli'].generators).toEqual(expect.objectContaining({'test-scope-test-sdk': expect.anything()}));
  });

  it('should work with no package scope', async () => {
    const runner = new SchematicTestRunner('@ama-sdk/schematics', collectionPath);
    const tree = await runner.runSchematic('typescript-shell', {
      package: 'test-sdk',
      skipInstall: true,
      packageManager: 'npm'
    }, Tree.empty());
    const {name} = tree.readJson('/package.json') as PackageJson;
    expect(name).toEqual('test-sdk');
  });

  it('should generate renovate config with otter presets for npm', () => {
    const renovateConfig = npmTree.readJson('/.renovaterc.json') as PackageJson;
    const renovatePresets = renovateConfig.extends;
    expect(renovatePresets).toEqual([
      'github>AmadeusITGroup/otter//tools/renovate/base',
      'github>AmadeusITGroup/otter//tools/renovate/group/otter',
      'github>AmadeusITGroup/otter//tools/renovate/tasks/base',
      'github>AmadeusITGroup/otter//tools/renovate/tasks/sdk-regenerate(npm)'
    ]);
  });

  it('should generate renovate config with otter presets for npm with packageName', async () => {
    const runner = new SchematicTestRunner('@ama-sdk/schematics', collectionPath);
    const tree = await runner.runSchematic('typescript-shell', {
      name: 'test-scope',
      package: 'test-sdk',
      skipInstall: true,
      packageManager: 'npm',
      specPackageName: '@my-spec-scope/my-spec'
    }, Tree.empty());
    const renovateConfig = tree.readJson('/.renovaterc.json') as PackageJson;
    const renovatePresets = renovateConfig.extends;
    expect(renovatePresets).toEqual([
      'github>AmadeusITGroup/otter//tools/renovate/base',
      'github>AmadeusITGroup/otter//tools/renovate/group/otter',
      'github>AmadeusITGroup/otter//tools/renovate/tasks/base',
      'github>AmadeusITGroup/otter//tools/renovate/tasks/sdk-regenerate(npm)',
      'github>AmadeusITGroup/otter//tools/renovate/group/sdk-spec(@my-spec-scope/my-spec)',
      'github>AmadeusITGroup/otter//tools/renovate/tasks/sdk-spec-regenerate(npm, @my-spec-scope/my-spec)'
    ]);
  });

  it('should generate renovate config with otter presets for yarn', () => {
    const renovateConfig = yarnTree.readJson('/.renovaterc.json') as PackageJson;
    const renovatePresets = renovateConfig.extends;
    expect(renovatePresets).toEqual([
      'github>AmadeusITGroup/otter//tools/renovate/base',
      'github>AmadeusITGroup/otter//tools/renovate/sdk'
    ]);
  });

  it('should generate renovate config with otter presets for yarn with packageName', async () => {
    const runner = new SchematicTestRunner('@ama-sdk/schematics', collectionPath);
    const tree = await runner.runSchematic('typescript-shell', {
      name: 'test-scope',
      package: 'test-sdk',
      skipInstall: true,
      packageManager: 'yarn',
      specPackageName: '@my-spec-scope/my-spec'
    }, Tree.empty());
    const renovateConfig = tree.readJson('/.renovaterc.json') as PackageJson;
    const renovatePresets = renovateConfig.extends;
    expect(renovatePresets).toEqual([
      'github>AmadeusITGroup/otter//tools/renovate/base',
      'github>AmadeusITGroup/otter//tools/renovate/sdk',
      'github>AmadeusITGroup/otter//tools/renovate/sdk-spec-upgrade(@my-spec-scope/my-spec)'
    ]);
  });
});
