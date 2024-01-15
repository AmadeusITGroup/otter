import {
  getDefaultExecSyncOptions,
  getPackageManager,
  getYarnVersionFromRoot,
  packageManagerCreate,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRun,
  prepareTestEnv,
  setupLocalRegistry
} from '@o3r/test-helpers';
import * as fs from 'node:fs';
import { cpSync, mkdirSync } from 'node:fs';
import * as path from 'node:path';

const projectName = 'test-sdk';
const sdkPackageName = '@my-test/sdk';
let sdkFolderPath: string;
let sdkPackagePath: string;
const execAppOptions = getDefaultExecSyncOptions();
const packageManager = getPackageManager();

describe('Create new sdk command', () => {
  setupLocalRegistry();
  beforeEach(async () => {
    const isYarnTest = packageManager.startsWith('yarn');
    const yarnVersion = isYarnTest ? getYarnVersionFromRoot(process.cwd()) || 'latest' : undefined;
    sdkFolderPath = (await prepareTestEnv(projectName, {type: 'blank', yarnVersion })).workspacePath;
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
  });

  test('should generate a full SDK when the specification is provided', () => {
    expect(() =>
      packageManagerCreate({script: '@ama-sdk', args: ['typescript', sdkPackageName, '--package-manager', packageManager, '--spec-path', './swagger-spec.yml']}, execAppOptions)).not.toThrow();
    expect(() => packageManagerRun({script: 'build'}, { ...execAppOptions, cwd: sdkPackagePath })).not.toThrow();
  });

  test('should generate an empty SDK ready to be used', () => {
    expect(() => packageManagerCreate({script: '@ama-sdk', args: ['typescript', sdkPackageName]}, execAppOptions)).not.toThrow();
    expect(() => packageManagerRun({script: 'build'}, { ...execAppOptions, cwd: sdkPackagePath })).not.toThrow();
    expect(() =>
      packageManagerExec({
        script: 'schematics',
        args: ['@ama-sdk/schematics:typescript-core', '--spec-path', path.join(path.relative(sdkPackagePath, sdkFolderPath), 'swagger-spec.yml')]
      }, { ...execAppOptions, cwd: sdkPackagePath }
      )).not.toThrow();
    expect(() => packageManagerRun({script: 'build'}, { ...execAppOptions, cwd: sdkPackagePath })).not.toThrow();
    expect(() => packageManagerRun({ script: 'doc:generate'}, { ...execAppOptions, cwd: sdkPackagePath })).not.toThrow();
  });
});
