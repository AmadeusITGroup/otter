import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { PackageJson } from 'nx/src/utils/package-json';
import getPidFromPort from 'pid-from-port';
import { minVersion } from 'semver';

const currentFolder = path.join(__dirname, '..', '..', '..', '..');
const verdaccioFolder = path.join(currentFolder, '.verdaccio', 'conf');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const applicationPath = path.join(currentFolder, '..');
const tmpAppFolderPath = path.join(applicationPath, 'test-app');

/**
 * yarn build
 */
function runYarnBuild() {
  execSync('yarn build', { cwd: tmpAppFolderPath, stdio: 'inherit' });
}

/**
 * yarn test:playwright
 */
function runYarnTestPlaywrightScenario() {
  execSync('yarn test:playwright', { cwd: tmpAppFolderPath, stdio: 'inherit', env: {
    ...process.env,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    JEST_WORKER_ID: undefined
  } });
}

/**
 * yarn test:playwright:sanity
 */
function runYarnTestPlaywrightSanity() {
  execSync('yarn test:playwright:sanity', { cwd: tmpAppFolderPath, stdio: 'inherit', env: {
    ...process.env,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    JEST_WORKER_ID: undefined
  } });
}

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
  const registry = 'http://localhost:4873';
  const configFile = path.join(verdaccioFolder, '.npmrc');
  let containerId: string;

  beforeAll(() => {
    containerId = execSync(`docker run -d -it --rm --name verdaccio -p 4873:4873 -v ${verdaccioFolder}:/verdaccio/conf verdaccio/verdaccio`, {cwd: currentFolder, stdio: 'pipe'}).toString();
    execSync(`echo registry=${registry} > .npmrc`, {cwd: verdaccioFolder, stdio: 'inherit'});
    execSync(`echo @otter:registry=${registry} >> .npmrc`, {cwd: verdaccioFolder, stdio: 'inherit'});
    execSync(`echo @dapi:registry=${registry} >> .npmrc`, {cwd: verdaccioFolder, stdio: 'inherit'});
    execSync('yarn set:version 8.0.0 --include !**/!(dist)/package.json --include !package.json', {cwd: currentFolder, stdio: 'inherit'});
    execSync(`npx --yes wait-on ${registry}`, {cwd: currentFolder, stdio: 'inherit'});
    execSync(`npx --yes npm-cli-login -u verdaccio -p verdaccio -e test@test.com -r ${registry} --config-path "${configFile}"`, {cwd: currentFolder, stdio: 'inherit'});
    // eslint-disable-next-line @typescript-eslint/naming-convention
    execSync(`yarn run publish --userconfig "${configFile}" --tag=latest --@otter:registry=${registry}`, {cwd: currentFolder, stdio: 'inherit'});
  });

  afterAll(() => {
    if (containerId) {
      execSync(`docker container stop ${containerId}`, {cwd: currentFolder, stdio: 'inherit'});
    }
  });

}

describe('new Otter application', () => {
  const devServerPort = 4200;
  setupLocalRegistry();

  beforeAll(() => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath).toString()) as PackageJson;
    let angularVersion = minVersion(packageJson.devDependencies['@angular/core']).version;
    // FIXME remove when upgrading otter to 15.1
    angularVersion = '15.1.1';

    // Create app with ng new
    execSync('npx rimraf test-app', {cwd: applicationPath, stdio: 'inherit'});
    execSync(`npx --yes -p @angular/cli@${angularVersion} ng new test-app --style=scss --routing --interactive=false --skip-git --package-manager=yarn`,
      {cwd: applicationPath, stdio: 'inherit'});
    // FIXME this should be part of the ng-add (need to upgrade to 15.1)
    execSync(`npx --yes -p @angular/cli@${angularVersion} ng g @schematics/angular:environments --interactive=false`, {cwd: tmpAppFolderPath, stdio: 'inherit'});

    // Set config to target local registry
    execSync('yarn config set npmScopes.o3r.npmRegistryServer http://localhost:4873', {cwd: tmpAppFolderPath, stdio: 'inherit'});
    execSync('yarn config set unsafeHttpWhitelist localhost', {cwd: tmpAppFolderPath, stdio: 'inherit'});
    execSync('npm config set registry http://localhost:4873 -L project', {cwd: tmpAppFolderPath, stdio: 'inherit'});

    // Add peer-dependencies required by @o3r/core
    // FIXME investigate why ng add is broken with yarn 2 and 3
    execSync('yarn config set enableStrictSsl false', {cwd: tmpAppFolderPath, stdio: 'inherit'});
    execSync('yarn set version 1.22.19', {cwd: tmpAppFolderPath, stdio: 'inherit'});

    execSync('yarn add @o3r/dev-tools @o3r/schematics', {cwd: tmpAppFolderPath, stdio: 'inherit'});

    // Run ng add
    execSync(`yarn ng add @angular/pwa@${angularVersion} --skip-confirmation --interactive=false`, {cwd: tmpAppFolderPath, stdio: 'inherit'});
    execSync(`yarn ng add @angular/material@${angularVersion} --skip-confirmation --interactive=false`, {cwd: tmpAppFolderPath, stdio: 'inherit'});
    execSync('yarn ng add @ama-sdk/core --skip-confirmation --interactive=false --registry http://localhost:4873 --verbose', {cwd: tmpAppFolderPath, stdio: 'inherit'});
    execSync('yarn ng add @o3r/dynamic-content --skip-confirmation --interactive=false --registry http://localhost:4873 --verbose', {cwd: tmpAppFolderPath, stdio: 'inherit'});
    execSync('yarn ng add @o3r/extractors --skip-confirmation --interactive=false --registry http://localhost:4873 --verbose', {cwd: tmpAppFolderPath, stdio: 'inherit'});
    execSync('yarn ng add @o3r/core --skip-confirmation --interactive=false --registry http://localhost:4873 --verbose', {cwd: tmpAppFolderPath, stdio: 'inherit'});
  });

  test('should build empty app', () => {
    expect(() => runYarnBuild()).not.toThrow();

    // should build with a new entity async store
    execSync('yarn ng g @o3r/core:store-entity-async --interactive=false --store-name="test-entity-async" --model-name="Bound" --model-id-prop-name="id"', {
      cwd: tmpAppFolderPath,
      stdio: 'inherit'
    });
    addImportToAppModule('TestEntityAsyncStoreModule', 'src/store/test-entity-async');
    expect(() => runYarnBuild()).not.toThrow();

    // should build with a new entity sync store
    execSync('yarn ng g @o3r/core:store-entity-sync --interactive=false --store-name="test-entity-sync" --model-name="Bound" --model-id-prop-name="id"', {
      cwd: tmpAppFolderPath,
      stdio: 'inherit'
    });
    addImportToAppModule('TestEntitySyncStoreModule', 'src/store/test-entity-sync');
    expect(() => runYarnBuild()).not.toThrow();

    // should build with a new simple async store
    execSync('yarn ng g @o3r/core:store-simple-async --interactive=false --store-name="test-simple-async" --model-name="Bound"', {cwd: tmpAppFolderPath, stdio: 'inherit'});
    addImportToAppModule('TestSimpleAsyncStoreModule', 'src/store/test-simple-async');
    expect(() => runYarnBuild()).not.toThrow();

    // should build with a new simple sync store
    execSync('yarn ng g @o3r/core:store-simple-sync --interactive=false --store-name="test-simple-sync"', {cwd: tmpAppFolderPath, stdio: 'inherit'});
    addImportToAppModule('TestSimpleSyncStoreModule', 'src/store/test-simple-sync');
    expect(() => runYarnBuild()).not.toThrow();

    // should build with a new service
    execSync('yarn ng g @o3r/core:service --interactive=false test-service --feature-name="base"', {cwd: tmpAppFolderPath, stdio: 'inherit'});
    addImportToAppModule('TestServiceBaseModule', 'src/services/test-service');
    expect(() => runYarnBuild()).not.toThrow();

    // should build with a new page
    execSync('yarn ng g @o3r/core:page --interactive=false test-page --app-routing-module-path="src/app/app-routing.module.ts"', {cwd: tmpAppFolderPath, stdio: 'inherit'});
    expect(() => runYarnBuild()).not.toThrow();

    // should build with a new component
    execSync('yarn ng g @o3r/core:component --interactive=false test-component --activate-dummy', {cwd: tmpAppFolderPath, stdio: 'inherit'});
    addImportToAppModule('TestComponentContModule', 'src/components/test-component');
    expect(() => runYarnBuild()).not.toThrow();

    // should pass the e2e tests
    execSync('yarn ng g @o3r/testing:playwright-scenario --interactive=false --name=test-scenario', {cwd: tmpAppFolderPath, stdio: 'inherit'});
    execSync('yarn ng g @o3r/testing:playwright-sanity --interactive=false --name=test-sanity', {cwd: tmpAppFolderPath, stdio: 'inherit'});
    spawn(`npx http-server -p ${devServerPort} ./dist`, [], {
      cwd: tmpAppFolderPath,
      shell: true,
      stdio: ['ignore', 'ignore', 'inherit']
    });
    execSync(`npx wait-on http://localhost:${devServerPort}`);
    execSync('yarn playwright install', { cwd: tmpAppFolderPath });
    execSync('yarn playwright install-deps', { cwd: tmpAppFolderPath });
    expect(() => runYarnTestPlaywrightScenario()).not.toThrow();
    expect(() => runYarnTestPlaywrightSanity()).not.toThrow();
  });

  afterAll(async () => {
    const pid = await getPidFromPort(devServerPort);
    execSync(process.platform === 'win32' ? `taskkill /f /t /pid ${pid}` : `kill -15 ${pid}`, {stdio: 'inherit'});
  });
});
