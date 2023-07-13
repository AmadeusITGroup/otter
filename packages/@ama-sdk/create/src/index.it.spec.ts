import { execSync, ExecSyncOptions } from 'node:child_process';
import * as fs from 'node:fs';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import * as path from 'node:path';
import getPidFromPort from 'pid-from-port';
import type { PackageJson } from 'type-fest';

const appName = 'test-sdk';
const currentFolder = path.join(__dirname, '..', '..', '..', '..');
const parentFolderPath = path.join(currentFolder, '..');
const itTestsFolderPath = path.join(parentFolderPath, 'it-tests');
const sdkFolderPath = path.join(itTestsFolderPath, 'test-sdk');
const cacheFolderPath = path.join(currentFolder, '.cache', appName);
const execAppOptions: ExecSyncOptions = {
  cwd: sdkFolderPath,
  stdio: 'inherit',
  /* eslint-disable @typescript-eslint/naming-convention, camelcase */
  env: {
    ...process.env,
    JEST_WORKER_ID: undefined,
    NODE_OPTIONS: '',
    npm_execpath: undefined,
    npm_config_user_agent: undefined
  }
  /* eslint-enable @typescript-eslint/naming-convention, camelcase */
};
const registry = 'http://localhost:4873';

const packageManager = process.env.TEST_PACKAGE_MANAGER || 'npm';
const o3rPackageJson: PackageJson & { packageManager?: string } = JSON.parse(fs.readFileSync(path.join(currentFolder, 'package.json')).toString());

const sdkPackageName = '@my-test/sdk';
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
const sdkPackagePath = path.join(execAppOptions.cwd!.toString(), sdkPackageName.replace(/^@/, ''));


/**
 * Set up a local npm registry inside a docker image before the tests.
 * Publish all the packages of the Otter monorepo on it.
 * Can be accessed during the tests with url http://localhost:4873
 */
function setupLocalRegistry() {
  let shouldHandleVerdaccio = false;

  beforeAll(async () => {
    try {
      await getPidFromPort(4873);
    } catch (ex) {
      shouldHandleVerdaccio = true;
      execSync('yarn verdaccio:start', { cwd: currentFolder, stdio: 'inherit' });
      execSync('yarn verdaccio:publish', { cwd: currentFolder, stdio: 'inherit' });
    }
  });

  afterAll(() => {
    if (shouldHandleVerdaccio) {
      execSync('yarn verdaccio:stop', { cwd: currentFolder, stdio: 'inherit' });
    }
  });
}

function setupNpm() {
  beforeEach(() => {
    execSync('npm config --location=project set strict-ssl false', execAppOptions);
    execSync(`npm config --location=project set "@ama-sdk:registry" "${registry}"`, execAppOptions);
    execSync(`npm config --location=project set "@o3r:registry" "${registry}"`, execAppOptions);
    execSync(`npm config --location=project set cache ${cacheFolderPath}`, execAppOptions);

    // copy npmrc config to generated SDK
    mkdirSync(sdkPackagePath, { recursive: true });
    cpSync(path.join(execAppOptions.cwd.toString(), '.npmrc'), path.join(sdkPackagePath, '.npmrc'));
  });

}

function setupYarn(yarnVersion: string) {
  beforeEach(() => {
    fs.writeFileSync(path.join(sdkFolderPath, 'package.json'), '{"name": "@test/sdk"}');

    execSync('yarn config set enableStrictSsl false', execAppOptions);
    execSync(`yarn set version ${yarnVersion}`, execAppOptions);
    execSync(`yarn config set npmScopes.ama-sdk.npmRegistryServer ${registry}`, execAppOptions);
    execSync(`yarn config set npmScopes.o3r.npmRegistryServer ${registry}`, execAppOptions);
    execSync('yarn config set unsafeHttpWhitelist localhost', execAppOptions);
    execSync('yarn config set nodeLinker pnp', execAppOptions);
    execSync('yarn config set enableMirror false', execAppOptions);
    execSync('yarn config set enableImmutableInstalls false', execAppOptions);

    // copy npmrc config to generated SDK
    mkdirSync(sdkPackagePath, { recursive: true });
    cpSync(path.join(execAppOptions.cwd.toString(), '.yarnrc.yml'), path.join(sdkPackagePath, '.yarnrc.yml'));
  });
}

function setupCache() {
  beforeEach(() => {
    try {
      rmSync(sdkFolderPath, { recursive: true, force: true });
    } catch {
      // ignore failure of clean up
    }
    mkdirSync(sdkFolderPath, { recursive: true });

    if (!existsSync(cacheFolderPath)) {
      mkdirSync(cacheFolderPath, { recursive: true });
    }

    if (existsSync(cacheFolderPath)) {
      const workspacesList = execSync('yarn workspaces:list', { stdio: 'pipe' }).toString().split('\n')
        .map((workspace) => workspace.replace('packages/', '').replace(/\//, '-'));
      readdirSync(cacheFolderPath).forEach((fileName) => {
        if (workspacesList.some((workspace) => fileName.startsWith(workspace))) {
          rmSync(path.join(cacheFolderPath, fileName), { recursive: true });
        }
      });
    }
  });
}

describe('new Otter sdk', () => {
  setupLocalRegistry();
  setupCache();
  setupNpm();
  if (packageManager.startsWith('yarn')) {
    setupYarn(o3rPackageJson?.packageManager?.split('@')?.[1] || '3.5.0');
  }

  test('should build from full generation', () => {
    cpSync(path.join(__dirname, '..', 'testing', 'mocks', 'MOCK_swagger_updated.yaml'), path.join(sdkFolderPath, 'swagger-spec.yml'));
    expect(() => execSync(`npm create @ama-sdk typescript ${sdkPackageName} -- --package-manager ${packageManager} --spec-path ./swagger-spec.yml`, execAppOptions)).not.toThrow();
    // TODO: uncomment when the generation is fixed for NPM
    // expect(() => execSync(`${packageManager} run build`, { ...execAppOptions, cwd: sdkPackagePath })).not.toThrow();
  });

  test('should build after new generation', () => {
    cpSync(path.join(__dirname, '..', 'testing', 'mocks', 'MOCK_swagger_updated.yaml'), path.join(sdkFolderPath, 'swagger-spec.yml'));
    expect(() => execSync(`npm create @ama-sdk typescript ${sdkPackageName}`, execAppOptions)).not.toThrow();
    expect(() =>
      execSync(
        `${packageManager} exec schematics @ama-sdk/schematics:typescript-core --spec-path ${path.join(path.relative(sdkPackagePath, execAppOptions.cwd.toString()), 'swagger-spec.yml')}`,
        { ...execAppOptions, cwd: sdkPackagePath }
      )).not.toThrow();
    // TODO: uncomment when the generation is fixed for NPM
    // expect(() => execSync('npm run build', { ...execAppOptions, cwd: sdkPackagePath })).not.toThrow();
  });
});
