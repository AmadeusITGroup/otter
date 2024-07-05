/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-create-sdk
 * @jest-environment-o3r-type blank
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import {
  getDefaultExecSyncOptions,
  getPackageManager,
  getYarnVersionFromRoot,
  packageManagerCreate,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRun
} from '@o3r/test-helpers';
import * as fs from 'node:fs';
import { cpSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import * as path from 'node:path';

const sdkPackageName = '@my-test/sdk';
let sdkFolderPath: string;
let sdkPackagePath: string;
const execAppOptions = getDefaultExecSyncOptions();
const packageManager = getPackageManager();

describe('Create new sdk command', () => {
  beforeEach(() => {
    const isYarnTest = o3rEnvironment.testEnvironment.isYarnTest;
    const yarnVersion = isYarnTest ? getYarnVersionFromRoot(process.cwd()) || 'latest' : undefined;
    sdkFolderPath = o3rEnvironment.testEnvironment.workspacePath;
    sdkPackagePath = path.join(sdkFolderPath, sdkPackageName.replace(/^@/, ''));
    execAppOptions.cwd = sdkFolderPath;

    if (isYarnTest) {
      fs.writeFileSync(path.join(sdkFolderPath, 'package.json'), `{"name": "@test/sdk", "packageManager": "yarn@${yarnVersion}"}`);
      packageManagerInstall(execAppOptions);

      // copy yarnrc config to generated SDK
      mkdirSync(sdkPackagePath, {recursive: true});
      cpSync(path.join(sdkFolderPath, '.yarnrc.yml'), path.join(sdkPackagePath, '.yarnrc.yml'));
      cpSync(path.join(sdkFolderPath, '.yarn'), path.join(sdkPackagePath, '.yarn'), {recursive: true});
      fs.writeFileSync(path.join(sdkPackagePath, 'yarn.lock'), '');
    } else {
      // copy npmrc config to generated SDK
      mkdirSync(sdkPackagePath, { recursive: true });
      cpSync(path.join(sdkFolderPath, '.npmrc'), path.join(sdkPackagePath, '.npmrc'));
    }
  });

  beforeEach(() => {
    cpSync(path.join(__dirname, '..', 'testing', 'mocks', 'MOCK_swagger_updated.yaml'), path.join(sdkFolderPath, 'swagger-spec.yml'));
    cpSync(path.join(__dirname, '..', 'testing', 'mocks', 'MOCK_DATE_UTILS_swagger.yaml'), path.join(sdkFolderPath, 'swagger-spec-with-date.yml'));
  });

  test('should generate a light SDK when the specification is provided', () => {
    expect(() =>
      packageManagerCreate({
        script: '@ama-sdk',
        args: ['typescript', sdkPackageName, '--package-manager', packageManager, '--spec-path', path.join(sdkFolderPath, 'swagger-spec.yml')]
      }, execAppOptions)
    ).not.toThrow();
    expect(() => packageManagerRun({script: 'build'}, { ...execAppOptions, cwd: sdkPackagePath })).not.toThrow();
    expect(existsSync(path.join(sdkPackagePath, 'src', 'models', 'base', 'pet', 'pet.reviver.ts'))).toBeFalsy();
  });

  test('should generate a full SDK when the specification is provided', () => {
    expect(() =>
      packageManagerCreate({
        script: '@ama-sdk',
        args: [
          'typescript',
          sdkPackageName,
          '--package-manager', packageManager,
          '--spec-path', path.join(sdkFolderPath, 'swagger-spec-with-date.yml')]
      }, execAppOptions)
    ).not.toThrow();
    expect(() => packageManagerRun({script: 'build'}, { ...execAppOptions, cwd: sdkPackagePath })).not.toThrow();
    expect(existsSync(path.join(sdkPackagePath, 'src', 'models', 'base', 'pet', 'pet.reviver.ts'))).toBeTruthy();
    expect(() => packageManagerRun({script: 'spec:upgrade'}, { ...execAppOptions, cwd: sdkPackagePath })).not.toThrow();
  });

  test('should generate a full SDK when the specification is provided as npm dependency', () => {
    expect(() =>
      packageManagerCreate({
        script: '@ama-sdk',
        args: [
          'typescript',
          sdkPackageName,
          '--package-manager', packageManager,
          '--spec-package-name', '@ama-sdk/showcase-sdk',
          '--spec-package-path', 'openapi.yml',
          '--spec-package-version', o3rEnvironment.testEnvironment.o3rVersion,
          '--spec-package-registry', o3rEnvironment.testEnvironment.packageManagerConfig.registry
        ]
      }, execAppOptions)
    ).not.toThrow();
    expect(() => packageManagerRun({script: 'build'}, { ...execAppOptions, cwd: sdkPackagePath })).not.toThrow();
    expect(existsSync(path.join(sdkPackagePath, 'src', 'models', 'base', 'pet', 'pet.ts'))).toBeTruthy();
    expect(existsSync(path.join(sdkPackagePath, 'src', 'models', 'base', 'pet', 'pet.reviver.ts'))).toBeFalsy();
    expect(() => packageManagerRun({script: 'spec:upgrade'}, { ...execAppOptions, cwd: sdkPackagePath })).not.toThrow();
  });

  test('should generate an SDK with no package scope', () => {
    const packageName = sdkPackageName.replace('@', '').split('/')[1];
    const newSdkPackagePath = path.join(sdkFolderPath, packageName);
    renameSync(sdkPackagePath, newSdkPackagePath);
    expect(() =>
      packageManagerCreate({
        script: '@ama-sdk',
        args: ['typescript', packageName, '--package-manager', packageManager, '--spec-path', path.join(sdkFolderPath, 'swagger-spec.yml')]
      }, execAppOptions)
    ).not.toThrow();
    expect(() => packageManagerRun({script: 'build'}, { ...execAppOptions, cwd: newSdkPackagePath })).not.toThrow();
  });

  test('should generate an empty SDK ready to be used', () => {
    expect(() => packageManagerCreate({script: '@ama-sdk', args: ['typescript', sdkPackageName]}, execAppOptions)).not.toThrow();
    expect(() => packageManagerRun({script: 'build'}, { ...execAppOptions, cwd: sdkPackagePath })).not.toThrow();
    expect(() =>
      packageManagerExec({
        script: 'schematics',
        args: ['@ama-sdk/schematics:typescript-core', '--spec-path', path.join(path.relative(sdkPackagePath, sdkFolderPath), 'swagger-spec.yml')]
      }, { ...execAppOptions, cwd: sdkPackagePath })
    ).not.toThrow();
    expect(() => packageManagerRun({script: 'build'}, { ...execAppOptions, cwd: sdkPackagePath })).not.toThrow();
    expect(() => packageManagerRun({script: 'doc:generate'}, { ...execAppOptions, cwd: sdkPackagePath })).not.toThrow();
  });

  test('should fail when there is an error', () => {
    expect(() =>
      packageManagerCreate({
        script: '@ama-sdk',
        args: ['typescript', sdkPackageName, '--package-manager', packageManager, '--spec-path','./missing-file.yml']
      }, execAppOptions)
    ).toThrow();
  });

  test('should use pinned versions when --exact-o3r-version is used', () => {
    expect(() =>
      packageManagerCreate({
        script: `@ama-sdk@${o3rEnvironment.testEnvironment.o3rExactVersion}`,
        args: ['typescript', sdkPackageName, '--exact-o3r-version', '--package-manager', packageManager, '--spec-path', path.join(sdkFolderPath, 'swagger-spec.yml')]
      }, execAppOptions)
    ).not.toThrow();
    expect(() => packageManagerRun({script: 'build'}, { ...execAppOptions, cwd: sdkPackagePath })).not.toThrow();
    const packageJson = JSON.parse(fs.readFileSync(path.join(sdkPackagePath, 'package.json'), 'utf-8'));
    const resolutions = packageManager === 'yarn' ? packageJson.resolutions : packageJson.overrides;
    // all otter dependencies in package.json must be pinned:
    [
      ...Object.entries(packageJson.dependencies), ...Object.entries(packageJson.devDependencies), ...Object.entries(resolutions)
    ].filter(([dep]) => dep.startsWith('@o3r/') || dep.startsWith('@ama-sdk/')).forEach(([,version]) => {
      expect(version).toBe(o3rEnvironment.testEnvironment.o3rExactVersion);
    });
  });
});
