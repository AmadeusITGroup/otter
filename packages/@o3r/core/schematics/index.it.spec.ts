import * as fs from 'node:fs';
import {execSync, ExecSyncOptions, spawn} from 'node:child_process';
import {mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import * as path from 'node:path';
import type {PackageJson} from 'nx/src/utils/package-json';
import getPidFromPort from 'pid-from-port';
import {minVersion} from 'semver';

const devServerPort = 4200;
const currentFolder = path.join(__dirname, '..', '..', '..', '..');
const verdaccioFolder = path.join(currentFolder, '.verdaccio', 'conf');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const applicationPath = path.join(currentFolder, '..');
const tmpAppFolderPath = path.join(applicationPath, 'test-app');
const execAppOptions: ExecSyncOptions = {
  cwd: tmpAppFolderPath,
  stdio: 'inherit',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  env: {...process.env, JEST_WORKER_ID: undefined, NODE_OPTIONS: ''}
};
const registry = 'http://localhost:4873';
const configFile = path.join(verdaccioFolder, '.npmrc');
let tempDir: string;
const o3rVersion = '999.0.0';

/**
 * @param moduleName
 * @param modulePath
 */
function addImportToAppModule(moduleName: string, modulePath: string) {
  const appModuleFilePath = path.join(tmpAppFolderPath, 'src/app/app.module.ts');
  const appModule = readFileSync(appModuleFilePath).toString();
  writeFileSync(appModuleFilePath, `import { ${moduleName} } from '${modulePath}';\n${
    appModule.replace(/(BrowserModule,)/, `$1\n    ${moduleName},`)
  }`);
}

/**
 * Set up a local npm registry inside a docker image before the tests.
 * Publish all the packages of the Otter monorepo on it.
 * Can be accessed during the tests with url http://localhost:4873
 */
function setupLocalRegistry() {
  let containerId: string;

  beforeAll(() => {
    containerId = execSync(`docker run -d -it --rm --name verdaccio -p 4873:4873 -v ${verdaccioFolder}:/verdaccio/conf verdaccio/verdaccio`, {cwd: currentFolder, stdio: 'pipe'}).toString();
    execSync(`echo registry=${registry} > .npmrc`, {cwd: verdaccioFolder, stdio: 'inherit'});
    execSync(`yarn set:version ${o3rVersion} --include "!**/!(dist)/package.json" --include !package.json`, {cwd: currentFolder, stdio: 'inherit', env: process.env});
    execSync(`npx --yes wait-on ${registry}`, {cwd: currentFolder, stdio: 'inherit'});
    execSync(`npx --yes npm-cli-login -u verdaccio -p verdaccio -e test@test.com -r ${registry} --config-path "${configFile}"`, {cwd: currentFolder, stdio: 'inherit'});
    execSync(`yarn run publish --userconfig "${configFile}" --tag=latest --@o3r:registry=${registry} --@ama-sdk:registry=${registry}`,
      {cwd: currentFolder, stdio: 'inherit', env: process.env});
  });

  afterAll(() => {
    if (containerId) {
      execSync(`docker container stop ${containerId}`, {cwd: currentFolder, stdio: 'inherit'});
    }
  });
}

/**
 * Setup a new application using Angular CLI
 */
function setupNewApp() {
  beforeAll(() => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath).toString()) as PackageJson;
    const angularVersion = minVersion(packageJson.devDependencies['@angular/core']).version;
    try {
      tempDir = mkdtempSync(path.join(applicationPath, 'test-app', '.yarn', 'cache'));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Failed to create yarn cache file');
    }
    // Create app with ng new
    execSync('npx rimraf test-app', {cwd: applicationPath, stdio: 'inherit'});
    execSync(`npx --yes -p @angular/cli@${angularVersion} ng new test-app --style=scss --routing --interactive=false --skip-git --package-manager=yarn --skip-install`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      {cwd: applicationPath, stdio: 'inherit', env: {...process.env, NODE_OPTIONS: ''}});

    // Set config to target local registry
    const o3rPackageJson: PackageJson & { packageManager?: string } = JSON.parse(fs.readFileSync(path.join(currentFolder, 'package.json')).toString());
    const yarnVersion = o3rPackageJson?.packageManager?.split('@')?.[1] || '3.5.0';
    execSync(`yarn set version ${yarnVersion}`, execAppOptions);
    execSync(`yarn config set npmScopes['ama-sdk'].npmRegistryServer ${registry}`, execAppOptions);
    execSync(`yarn config set npmScopes[o3r].npmRegistryServer ${registry}`, execAppOptions);
    execSync('yarn config set enableStrictSsl false', execAppOptions);
    execSync(`yarn config set npmScopes.o3r.npmRegistryServer ${registry}`, execAppOptions);
    execSync('yarn config set unsafeHttpWhitelist localhost', execAppOptions);
    execSync('yarn config set nodeLinker pnp', execAppOptions);
    if (tempDir) {
      execSync(`yarn config set cacheFolder ${tempDir}`, execAppOptions);
    }
    execSync('yarn config set enableImmutableInstalls false', execAppOptions);

    // Run ng add
    execSync(`yarn add @angular/pwa@${angularVersion}`, execAppOptions);
    execSync(`yarn ng add @angular/pwa@${angularVersion} --force --skip-confirmation --interactive=false`, execAppOptions);
    execSync(`yarn add @angular-devkit/schematics@${angularVersion}`, execAppOptions);
    execSync(`yarn run ng add @angular/material@${angularVersion} --skip-confirmation --interactive=false`, execAppOptions);
  });
}

describe('new Otter application', () => {
  setupLocalRegistry();
  setupNewApp();

  test('should build empty app', () => {
    execSync(`yarn add @o3r/core@${o3rVersion}`, execAppOptions);
    execSync('yarn ng add @o3r/core --skip-confirmation --interactive=false --force --verbose', execAppOptions);
    execSync('yarn unplug @o3r/localization', execAppOptions);
    expect(() => execSync('yarn build', execAppOptions)).not.toThrow();

    execSync('yarn ng g @o3r/core:store-entity-async --interactive=false --store-name="test-entity-async" --model-name="Bound" --model-id-prop-name="id"', execAppOptions);
    addImportToAppModule('TestEntityAsyncStoreModule', 'src/store/test-entity-async');

    execSync('yarn ng g @o3r/core:store-entity-sync --interactive=false --store-name="test-entity-sync" --model-name="Bound" --model-id-prop-name="id"', execAppOptions);
    addImportToAppModule('TestEntitySyncStoreModule', 'src/store/test-entity-sync');

    execSync('yarn ng g @o3r/core:store-simple-async --interactive=false --store-name="test-simple-async" --model-name="Bound"', execAppOptions);
    addImportToAppModule('TestSimpleAsyncStoreModule', 'src/store/test-simple-async');

    execSync('yarn ng g @o3r/core:store-simple-sync --interactive=false --store-name="test-simple-sync"', execAppOptions);
    addImportToAppModule('TestSimpleSyncStoreModule', 'src/store/test-simple-sync');

    execSync('yarn ng g @o3r/core:service --interactive=false test-service --feature-name="base"', execAppOptions);
    addImportToAppModule('TestServiceBaseModule', 'src/services/test-service');

    execSync('yarn ng g @o3r/core:page --interactive=false test-page --app-routing-module-path="src/app/app-routing.module.ts"', execAppOptions);

    execSync('yarn ng g @o3r/core:component --interactive=false test-component --activate-dummy', execAppOptions);
    addImportToAppModule('TestComponentContModule', 'src/components/test-component');

    expect(() => execSync('yarn build', execAppOptions)).not.toThrow();

    // should pass the e2e tests
    execSync('yarn ng g @o3r/testing:playwright-scenario --interactive=false --name=test-scenario', execAppOptions);
    execSync('yarn ng g @o3r/testing:playwright-sanity --interactive=false --name=test-sanity', execAppOptions);
    spawn(`npx http-server -p ${devServerPort} ./dist`, [], {
      ...execAppOptions,
      shell: true,
      stdio: ['ignore', 'ignore', 'inherit']
    });
    execSync(`npx --yes wait-on http://127.0.0.1:${devServerPort} -t 10000`, execAppOptions);

    // Don't run on Webkit to speed up the test by not installing necessary libs
    expect(() => execSync('yarn test:playwright --project Chromium Firefox', execAppOptions)).not.toThrow();
    expect(() => execSync('yarn test:playwright:sanity --project Chromium Firefox', execAppOptions)).not.toThrow();
  });

  afterAll(async () => {
    try {
      const pid = await getPidFromPort(devServerPort);
      execSync(process.platform === 'win32' ? `taskkill /f /t /pid ${pid}` : `kill -15 ${pid}`, {stdio: 'inherit'});
    } catch (e) {
      // http-server already off
    }
  });
});
