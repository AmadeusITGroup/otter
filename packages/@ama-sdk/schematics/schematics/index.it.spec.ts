import * as fs from 'node:fs';
import { execSync, ExecSyncOptions } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import type { PackageJson } from 'type-fest';
import getPidFromPort from 'pid-from-port';
import { minVersion } from 'semver';

const appName = 'test-sdk';
const currentFolder = path.join(__dirname, '..', '..', '..', '..');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const parentFolderPath = path.join(currentFolder, '..');
const itTestsFolderPath = path.join(parentFolderPath, 'it-tests');
const sdkFolderPath = path.join(itTestsFolderPath, 'test-sdk');
const cacheFolderPath = path.join(currentFolder, '.cache', appName);
const execAppOptions: ExecSyncOptions = {
  cwd: sdkFolderPath,
  stdio: 'inherit',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  env: {...process.env, JEST_WORKER_ID: undefined, NODE_OPTIONS: ''}
};
const registry = 'http://localhost:4873';

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
      execSync('yarn verdaccio:start', {cwd: currentFolder, stdio: 'inherit'});
      execSync('yarn verdaccio:publish', {cwd: currentFolder, stdio: 'inherit'});
    }
  });

  afterAll(() => {
    if (shouldHandleVerdaccio) {
      execSync('yarn verdaccio:stop', {cwd: currentFolder, stdio: 'inherit'});
    }
  });
}

function setupYarn(yarnVersion: string) {
  execSync('yarn config set enableStrictSsl false', execAppOptions);
  execSync(`yarn set version ${yarnVersion}`, execAppOptions);
  execSync(`yarn config set npmScopes.ama-sdk.npmRegistryServer ${registry}`, execAppOptions);
  execSync(`yarn config set npmScopes.o3r.npmRegistryServer ${registry}`, execAppOptions);
  execSync('yarn config set unsafeHttpWhitelist localhost', execAppOptions);
  execSync('yarn config set nodeLinker pnp', execAppOptions);
  execSync('yarn config set enableMirror false', execAppOptions);
  if (!existsSync(cacheFolderPath)) {
    mkdirSync(cacheFolderPath, {recursive: true});
  }
  execSync(`yarn config set cacheFolder ${cacheFolderPath}`, execAppOptions);
  if (existsSync(cacheFolderPath)) {
    const workspacesList = execSync('yarn workspaces:list', {stdio: 'pipe'}).toString().split('\n')
      .map((workspace) => workspace.replace('packages/', '').replace(/\//, '-'));
    readdirSync(cacheFolderPath).forEach((fileName) => {
      if (workspacesList.some((workspace) => fileName.startsWith(workspace))) {
        rmSync(path.join(cacheFolderPath, fileName));
      }
    });
  }
  execSync('yarn config set enableImmutableInstalls false', execAppOptions);
}

/**
 * Setup a new sdk using schematics CLI
 *
 * @deprecated A new SDK should be generated via the `npm create` feature
 */
function setupNewSdk() {
  beforeAll(() => {

    // Create app with ng new
    const relativePath = path.relative(parentFolderPath, sdkFolderPath);
    execSync(`npx rimraf ${relativePath}`, {cwd: parentFolderPath, stdio: 'inherit'});
    mkdirSync(sdkFolderPath, {recursive: true});
    writeFileSync(path.join(sdkFolderPath, 'package.json'), '{"name": "@test/sdk"}');

    // Set config to target local registry
    const o3rPackageJson: PackageJson & { packageManager?: string } = JSON.parse(fs.readFileSync(path.join(currentFolder, 'package.json')).toString());
    const yarnVersion = o3rPackageJson?.packageManager?.split('@')?.[1] || '3.5.0';
    setupYarn(yarnVersion);
    const packageJson = JSON.parse(readFileSync(packageJsonPath).toString()) as PackageJson;
    const angularVersion = minVersion(packageJson.devDependencies['@angular-devkit/schematics-cli']).version;
    execSync(`yarn add -D @angular-devkit/schematics-cli@${angularVersion} @ama-sdk/schematics`, execAppOptions);
    cpSync(path.join(__dirname, '..', 'testing', 'MOCK_swagger.yaml'), path.join(sdkFolderPath, 'swagger-spec.yml'));
    execSync('yarn schematics @ama-sdk/schematics:typescript-shell --name test --package sdk --skip-install', execAppOptions);
    execSync(`yarn add -D @openapitools/openapi-generator-cli@${packageJson.peerDependencies['@openapitools/openapi-generator-cli']} @ama-sdk/schematics`, execAppOptions);
    execSync('yarn', execAppOptions);
    execSync('yarn schematics @ama-sdk/schematics:typescript-core --spec-path ./swagger-spec.yml', execAppOptions);
    execSync('yarn', execAppOptions);
  });
}

describe('new Otter sdk', () => {
  setupLocalRegistry();
  setupNewSdk();

  test('should build', () => {
    expect(() => execSync('yarn build', execAppOptions)).not.toThrow();

    cpSync(path.join(__dirname, '..', 'testing', 'MOCK_swagger_updated.yaml'), path.join(sdkFolderPath, 'swagger-spec.yml'));
    execSync('yarn schematics @ama-sdk/schematics:typescript-core --spec-path ./swagger-spec.yml', execAppOptions);

    expect(() => execSync('yarn build', execAppOptions)).not.toThrow();
  });
});
