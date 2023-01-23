import { execSync, ExecSyncOptions, spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import type { PackageJson } from 'nx/src/utils/package-json';
import getPidFromPort from 'pid-from-port';
import { minVersion } from 'semver';

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
    execSync('yarn set:version 8.0.0 --include !**/!(dist)/package.json --include !package.json', {cwd: currentFolder, stdio: 'inherit'});
    execSync(`npx --yes wait-on ${registry}`, {cwd: currentFolder, stdio: 'inherit'});
    execSync(`npx --yes npm-cli-login -u verdaccio -p verdaccio -e test@test.com -r ${registry} --config-path "${configFile}"`, {cwd: currentFolder, stdio: 'inherit'});
    execSync(`yarn run publish --userconfig "${configFile}" --tag=latest --@otter:registry=${registry}`, {cwd: currentFolder, stdio: 'inherit'});
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

    // Create app with ng new
    execSync('npx rimraf test-app', {cwd: applicationPath, stdio: 'inherit'});
    execSync(`npx --yes -p @angular/cli@${angularVersion} ng new test-app --style=scss --routing --interactive=false --skip-git --package-manager=yarn --skip-install`,
      {cwd: applicationPath, stdio: 'inherit', env: {}});

    // Set config to target local registry
    execSync(`npm config set registry ${registry} -L project`, execAppOptions);
    execSync('yarn set version 1.22.19', execAppOptions);
    execSync(`yarn config set npmScopes.o3r.npmRegistryServer ${registry}`, execAppOptions);
    execSync('yarn config set unsafeHttpWhitelist localhost', execAppOptions);
    execSync('yarn config set enableStrictSsl false', execAppOptions);
    execSync('yarn', execAppOptions);

    // Run ng add
    execSync(`yarn ng add @angular/pwa@${angularVersion} --skip-confirmation --interactive=false`, execAppOptions);
    execSync(`yarn ng add @angular/material@${angularVersion} --skip-confirmation --interactive=false`, execAppOptions);
  });
}

describe('new Otter application', () => {
  setupLocalRegistry();
  setupNewApp();

  test('should build empty app', () => {
    execSync(`yarn ng add @ama-sdk/core --skip-confirmation --interactive=false --registry ${registry} --verbose`, execAppOptions);
    execSync(`yarn ng add @o3r/dynamic-content --skip-confirmation --interactive=false --registry ${registry} --verbose`, execAppOptions);
    execSync(`yarn ng add @o3r/extractors --skip-confirmation --interactive=false --registry ${registry} --verbose`, execAppOptions);
    execSync(`yarn ng add @o3r/core --skip-confirmation --interactive=false --registry ${registry} --verbose`, execAppOptions);
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
      cwd: tmpAppFolderPath,
      shell: true,
      stdio: ['ignore', 'ignore', 'inherit'],
      env: {}
    });
    execSync(`npx --yes wait-on http://localhost:${devServerPort}`, execAppOptions);
    execSync('yarn playwright install', execAppOptions);
    execSync('yarn playwright install-deps', execAppOptions);
    expect(() => execSync('yarn test:playwright', execAppOptions)).not.toThrow();
    expect(() => execSync('yarn test:playwright:sanity', execAppOptions)).not.toThrow();
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
