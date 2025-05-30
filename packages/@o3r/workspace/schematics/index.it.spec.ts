/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-workspace
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import {
  existsSync,
  promises as fs,
} from 'node:fs';
import * as path from 'node:path';
import {
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRun,
  packageManagerRunOnProject,
} from '@o3r/test-helpers';
import type {
  PackageJson,
} from 'type-fest';

const mocksFolder = path.join(__dirname, '..', 'testing', 'mocks');

describe('new otter workspace', () => {
  test('should add sdk to an existing workspace', () => {
    const { workspacePath, isInWorkspace, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    expect(() =>
      packageManagerExec({ script: 'ng', args: ['g', 'sdk', 'my-sdk'] }, execAppOptions)
    ).not.toThrow();

    const diff = getGitDiff(execAppOptions.cwd);
    untouchedProjectsPaths.forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject('@my-sdk/sdk', isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });

  test('should add sdk to an existing workspace with local spec', async () => {
    const { workspacePath, isInWorkspace, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const sdkPath = path.posix.join('libs', 'my-sdk-sdk');
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    await fs.copyFile(path.join(mocksFolder, 'easy-spec.yaml'), path.join(workspacePath, 'local-spec.yaml'));
    expect(() => packageManagerExec({ script: 'ng', args: [
      'g',
      'sdk',
      '@my-sdk/sdk',
      '--spec-path', './local-spec.yaml'
    ] }, execAppOptions)).not.toThrow();

    const diff = getGitDiff(execAppOptions.cwd);
    untouchedProjectsPaths.forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });
    expect(diff.added).toContain(path.posix.join(sdkPath, 'open-api.yaml'));
    expect(diff.added).toContain(path.posix.join(sdkPath, 'src', 'models', 'base', 'category', 'category.ts'));

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject('@my-sdk/sdk', isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });

  test('should add sdk to an existing workspace with spec package name', () => {
    const { workspacePath, isInWorkspace, untouchedProjectsPaths, o3rVersion, registry } = o3rEnvironment.testEnvironment;
    const sdkPath = path.posix.join('libs', 'my-sdk-sdk');
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    expect(() => packageManagerExec({ script: 'ng', args: [
      'g',
      'sdk',
      '@my-sdk/sdk',
      '--spec-package-name', '@o3r-training/showcase-sdk',
      '--spec-package-path', './open-api.yaml',
      '--spec-package-registry', registry,
      '--spec-package-version', o3rVersion
    ] }, execAppOptions)).not.toThrow();

    const diff = getGitDiff(execAppOptions.cwd);
    untouchedProjectsPaths.forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });
    expect(diff.added).toContain(path.posix.join(sdkPath, 'open-api.yaml'));
    expect(diff.added).toContain(path.posix.join(sdkPath, 'src', 'models', 'base', 'category', 'category.ts'));

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject('@my-sdk/sdk', isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject('@my-sdk/sdk', isInWorkspace, { script: 'spec:upgrade' }, execAppOptions)).not.toThrow();
  });

  test('should add a library to an existing workspace', async () => {
    const { isInWorkspace, workspacePath } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const libName = 'test-library';
    const inLibraryPath = path.resolve(workspacePath, 'libs', libName);
    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();

    const generatedLibFiles = [
      'README.md',
      'ng-package.json',
      'package.json',
      'tsconfig.lib.json',
      'tsconfig.lib.prod.json',
      'tsconfig.spec.json',
      'src/public-api.ts',
      'collection.json',
      '.gitignore',
      '.npmignore',
      'tsconfig.builders.json',
      'tsconfig.json'
    ];
    expect(() => packageManagerExec({ script: 'ng', args: ['g', 'library', libName] }, execAppOptions)).not.toThrow();
    expect(existsSync(path.join(workspacePath, 'project'))).toBe(false);
    generatedLibFiles.forEach((file) => expect(existsSync(path.join(inLibraryPath, file))).toBe(true));
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();

    // check tsconfig.lib.prod.json override
    const tsconfigLibProd = JSON.parse(await fs.readFile(path.join(inLibraryPath, 'tsconfig.lib.prod.json'), { encoding: 'utf8' }));
    expect(!!tsconfigLibProd.extends && existsSync(path.resolve(inLibraryPath, tsconfigLibProd.extends))).toBe(true);
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'prepare:build:builders' }, execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'build:builders' }, execAppOptions)).not.toThrow();
  });

  test('should generate a monorepo setup', async () => {
    const { workspacePath } = o3rEnvironment.testEnvironment;
    const defaultOptions = getDefaultExecSyncOptions();

    const execAppOptions = { ...defaultOptions, cwd: workspacePath, env: { ...defaultOptions.env, NX_CLOUD_ACCESS_TOKEN: '' } };
    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    const rootPackageJson = JSON.parse(await fs.readFile(path.join(workspacePath, 'package.json'), 'utf8')) as PackageJson;
    expect(rootPackageJson.scripts).toHaveProperty('build', 'lerna run build');
    expect(rootPackageJson.scripts).toHaveProperty('test', 'lerna run test');
    expect(rootPackageJson.scripts).toHaveProperty('lint', 'lerna run lint');
    expect(() => packageManagerRun({ script: 'build' }, execAppOptions)).not.toThrow();
    expect(() => packageManagerRun({ script: 'lint' }, execAppOptions)).not.toThrow();
    expect(rootPackageJson.workspaces).toContain('libs/*');
    expect(rootPackageJson.workspaces).toContain('apps/*');
    expect(existsSync(path.join(workspacePath, '.editorconfig'))).toBe(true);
    expect(existsSync(path.join(workspacePath, '.husky/commit-msg'))).toBe(true);
    expect(existsSync(path.join(workspacePath, '.husky/pre-commit'))).toBe(true);
    expect(existsSync(path.join(workspacePath, 'commitlint.config.cts'))).toBe(true);
    await expect(fs.readFile(path.join(workspacePath, '.husky/pre-commit'), { encoding: 'utf8' })).resolves.toMatch(/lint-staged/);
  });
});
