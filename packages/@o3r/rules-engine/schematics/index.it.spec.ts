import * as fs from 'node:fs';
import { execSync, ExecSyncOptions } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import type { PackageJson } from 'type-fest';
import getPidFromPort from 'pid-from-port';
import { minVersion } from 'semver';

const appName = 'test-app-rules-engine';
const currentFolder = path.join(__dirname, '..', '..', '..', '..');
const corePackageJsonPath = path.join(currentFolder, 'packages', '@o3r', 'core', 'package.json');
const parentFolderPath = path.join(currentFolder, '..');
const itTestsFolderPath = path.join(parentFolderPath, 'it-tests');
const cacheFolderPath = path.join(currentFolder, '.cache', appName);
const testAppCacheFolderPath = path.join(currentFolder, '.cache', 'test-app');
const appFolderPath = path.join(itTestsFolderPath, appName);
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
    const packageJson = JSON.parse(readFileSync(corePackageJsonPath).toString()) as PackageJson & {generatorDependencies?: Record<string, string>};
    const angularVersion = minVersion(packageJson.devDependencies['@angular/core']).version;
    const materialVersion = minVersion(packageJson.generatorDependencies?.['@angular/material'] || angularVersion).version;
    // Create app with ng new
    execSync(`npx rimraf it-tests/${appName}`, {cwd: parentFolderPath, stdio: 'inherit'});
    if (!existsSync(itTestsFolderPath)) {
      mkdirSync(itTestsFolderPath);
    }
    execSync(`npx --yes -p @angular/cli@${angularVersion} ng new ${appName} --style=scss --routing --defaults=true --skip-git --package-manager=yarn --skip-install`,
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
    if (!existsSync(cacheFolderPath) && existsSync(testAppCacheFolderPath)) {
      // For CI run, we can re-use the cache from test-app which should contain almost all the dependencies needed
      cpSync(testAppCacheFolderPath, cacheFolderPath, {recursive: true});
    }
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

    execSync(`yarn add @angular/pwa@${angularVersion}`, execAppOptions);
    execSync(`yarn ng add @angular/pwa@${angularVersion} --force --skip-confirmation --defaults=true`, execAppOptions);
    execSync(`yarn add @angular-devkit/schematics@${angularVersion}`, execAppOptions);
    execSync(`yarn run ng add @angular/material@${materialVersion} --skip-confirmation --defaults=true`, execAppOptions);
    execSync(`yarn add @o3r/core@${o3rVersion}`, execAppOptions);
    const o3rCoreOptions = [
      '--no-enableApisManager',
      '--no-enableStyling',
      '--no-enableAnalytics',
      '--no-enableCustomization',
      '--no-enablePlaywright',
      '--no-enablePrefetchBuilder',
      '--no-enableRulesEngine'
    ].join(' ');
    execSync(`yarn ng add @o3r/core --skip-confirmation --defaults=true --force --verbose ${o3rCoreOptions}`, execAppOptions);
    execSync('yarn install', execAppOptions);
    execSync('yarn build', execAppOptions);
    execSync('yarn ng g @o3r/core:component --defaults=true test-component --activate-dummy --description="" --use-otter-config=false', execAppOptions);
    addImportToAppModule('TestComponentContModule', 'src/components/test-component');
  });
}

describe('new Otter application with rules-engine', () => {
  setupLocalRegistry();
  setupNewApp();

  test('should add rules engine to existing application', () => {
    execSync(`yarn add @o3r/rules-engine@${o3rVersion}`, execAppOptions);
    execSync('yarn ng add @o3r/rules-engine --skip-confirmation --defaults=true --force --verbose', execAppOptions);
    expect(() => execSync('yarn install', execAppOptions)).not.toThrow();
    expect(() => execSync('yarn build', execAppOptions)).not.toThrow();

    execSync('yarn ng g @o3r/rules-engine:rules-engine-to-component --path=src/components/test-component/container/test-component-cont.component.ts', execAppOptions);
    expect(() => execSync('yarn build', execAppOptions)).not.toThrow();
  });
});
