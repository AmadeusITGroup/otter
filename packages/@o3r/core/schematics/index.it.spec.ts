import * as fs from 'node:fs';
import { execSync, ExecSyncOptions, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import type { PackageJson } from 'type-fest';
import getPidFromPort from 'pid-from-port';
import { minVersion } from 'semver';

const devServerPort = 4200;
const appName = 'test-app';
const currentFolder = path.join(__dirname, '..', '..', '..', '..');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const parentFolderPath = path.join(currentFolder, '..');
const itTestsFolderPath = path.join(parentFolderPath, 'it-tests');
const appFolderPath = path.join(itTestsFolderPath, 'test-app');
const cacheFolderPath = path.join(currentFolder, '.cache', appName);
const execAppOptions: ExecSyncOptions = {
  cwd: appFolderPath,
  stdio: 'inherit',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  env: {...process.env, JEST_WORKER_ID: undefined, NODE_OPTIONS: ''}
};
const registry = 'http://localhost:4873';
const o3rVersion = '999.0.0';

/**
 * @param moduleName
 * @param modulePath
 */
function addImportToAppModule(moduleName: string, modulePath: string) {
  const appModuleFilePath = path.join(appFolderPath, 'src/app/app.module.ts');
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

/**
 * Setup a new application using Angular CLI
 */
function setupNewApp() {
  beforeAll(() => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath).toString()) as PackageJson & {generatorDependencies?: Record<string, string>};
    const angularVersion = minVersion(packageJson.devDependencies['@angular/core'] || '0.0.0').version;
    const materialVersion = minVersion(packageJson.generatorDependencies?.['@angular/material'] || angularVersion).version;
    // Create app with ng new
    execSync('npx rimraf it-tests/test-app', {cwd: parentFolderPath, stdio: 'inherit'});
    if (!existsSync(itTestsFolderPath)) {
      mkdirSync(itTestsFolderPath);
    }
    execSync(`npx --yes -p @angular/cli@${angularVersion} ng new test-app --style=scss --routing --defaults=true --skip-git --package-manager=yarn --skip-install`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      {cwd: itTestsFolderPath, stdio: 'inherit', env: {...process.env, NODE_OPTIONS: ''}});

    // Set config to target local registry
    const o3rPackageJson: PackageJson & { packageManager?: string } = JSON.parse(fs.readFileSync(path.join(currentFolder, 'package.json')).toString());
    const yarnVersion = o3rPackageJson?.packageManager?.split('@')?.[1] || '3.5.0';
    execSync('yarn config set enableStrictSsl false', execAppOptions);
    execSync(`yarn set version ${yarnVersion}`, execAppOptions);
    execSync(`yarn config set npmScopes.ama-sdk.npmRegistryServer ${registry}`, execAppOptions);
    execSync(`yarn config set npmScopes.o3r.npmRegistryServer ${registry}`, execAppOptions);
    execSync('yarn config set unsafeHttpWhitelist localhost', execAppOptions);
    execSync('yarn config set nodeLinker pnp', execAppOptions);
    execSync('yarn config set enableMirror false', execAppOptions);
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

    // Run ng add
    execSync(`yarn add @angular/pwa@${angularVersion}`, execAppOptions);
    execSync(`yarn ng add @angular/pwa@${angularVersion} --force --skip-confirmation --defaults=true`, execAppOptions);
    execSync(`yarn add @angular-devkit/schematics@${angularVersion}`, execAppOptions);
    execSync(`yarn run ng add @angular/material@${materialVersion} --skip-confirmation --defaults=true`, execAppOptions);
  });
}

describe('new Otter application', () => {
  setupLocalRegistry();
  setupNewApp();

  test('should build empty app', () => {
    execSync(`yarn add @o3r/core@${o3rVersion}`, execAppOptions);
    execSync('yarn ng add @o3r/core --skip-confirmation --defaults=true --force --verbose', execAppOptions);
    expect(() => execSync('yarn install', execAppOptions)).not.toThrow();
    expect(() => execSync('yarn build', execAppOptions)).not.toThrow();

    execSync('yarn ng g @o3r/core:store-entity-async --defaults=true --store-name="test-entity-async" --model-name="Bound" --model-id-prop-name="id"', execAppOptions);
    addImportToAppModule('TestEntityAsyncStoreModule', 'src/store/test-entity-async');

    execSync('yarn ng g @o3r/core:store-entity-sync --defaults=true --store-name="test-entity-sync" --model-name="Bound" --model-id-prop-name="id"', execAppOptions);
    addImportToAppModule('TestEntitySyncStoreModule', 'src/store/test-entity-sync');

    execSync('yarn ng g @o3r/core:store-simple-async --defaults=true --store-name="test-simple-async" --model-name="Bound"', execAppOptions);
    addImportToAppModule('TestSimpleAsyncStoreModule', 'src/store/test-simple-async');

    execSync('yarn ng g @o3r/core:store-simple-sync --defaults=true --store-name="test-simple-sync"', execAppOptions);
    addImportToAppModule('TestSimpleSyncStoreModule', 'src/store/test-simple-sync');

    execSync('yarn ng g @o3r/core:service --defaults=true test-service --feature-name="base"', execAppOptions);
    addImportToAppModule('TestServiceBaseModule', 'src/services/test-service');

    execSync('yarn ng g @o3r/core:page --defaults=true test-page --app-routing-module-path="src/app/app-routing.module.ts"', execAppOptions);

    execSync('yarn ng g @o3r/core:component --defaults=true test-component --activate-dummy --use-otter-config=false --use-otter-theming=false', execAppOptions);
    addImportToAppModule('TestComponentContModule', 'src/components/test-component');

    execSync('yarn ng g @o3r/core:component --defaults=true test-add-config-component --use-otter-config=false', execAppOptions);
    execSync('yarn ng g @o3r/configuration:add-config --defaults=true --path="src/components/test-add-config-component/container/test-add-config-component-cont.component.ts"', execAppOptions);
    addImportToAppModule('TestAddConfigComponentContModule', 'src/components/test-add-config-component');

    execSync('yarn ng g @o3r/core:component --defaults=true test-add-theming-component --use-otter-theming=false', execAppOptions);
    execSync('yarn ng g @o3r/styling:add-theming --defaults=true --path="src/components/test-add-theming-component/presenter/test-add-theming-component-pres.style.scss"', execAppOptions);
    addImportToAppModule('TestAddThemingComponentContModule', 'src/components/test-add-theming-component');

    execSync('yarn ng g @schematics/angular:component test-ng-component', execAppOptions);
    execSync('yarn ng g @o3r/core:convert-component --defaults=true --path="src/app/test-ng-component/test-ng-component.component.ts"', execAppOptions);

    expect(() => execSync('yarn build', execAppOptions)).not.toThrow();

    // should pass the e2e tests
    execSync('yarn ng g @o3r/testing:playwright-scenario --defaults=true --name=test-scenario', execAppOptions);
    execSync('yarn ng g @o3r/testing:playwright-sanity --defaults=true --name=test-sanity', execAppOptions);
    spawn(`npx http-server -p ${devServerPort} ./dist`, [], {
      ...execAppOptions,
      shell: true,
      stdio: ['ignore', 'ignore', 'inherit']
    });
    execSync(`npx --yes wait-on http://127.0.0.1:${devServerPort} -t 10000`, execAppOptions);

    execSync('npx playwright install --with-deps', execAppOptions);
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
