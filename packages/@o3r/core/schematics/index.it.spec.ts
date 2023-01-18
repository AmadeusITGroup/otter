import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { execSync, spawn } from 'child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import getPidFromPort from 'pid-from-port';
import { lastValueFrom } from 'rxjs';
import { minVersion } from 'semver';

const currentFolder = path.join(__dirname, '../../..');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const otterStorybookPackageJsonPath = path.join(currentFolder, 'packages/storybook/package.json');
const applicationPath = path.join(currentFolder, '..');
const tmpAppFolderPath = path.join(applicationPath, '../test-app');
const collectionPath = path.join(__dirname, '../collection.json');
const angularCollectionPath = path.join(applicationPath, 'node_modules/@schematics/angular/collection.json');
const materialCollectionPath = path.join(applicationPath, 'node_modules/@angular/material/schematics/collection.json');

/**
 *
 */
function runYarnInstall() {
  execSync('yarn set version 1.22.17', { cwd: tmpAppFolderPath, stdio: 'inherit' });
  execSync('yarn install', { cwd: tmpAppFolderPath, stdio: 'inherit' });
}

/**
 *
 */
function runYarnBuild() {
  execSync('yarn build', { cwd: tmpAppFolderPath, stdio: 'inherit' });
}

/**
 *
 */
function runYarnBuildStorybook() {
  execSync('yarn build:storybook', { cwd: tmpAppFolderPath, stdio: 'inherit' });
}

/**
 *
 */
function runYarnTestPlaywrightScenario() {
  execSync('yarn test:playwright', { cwd: tmpAppFolderPath, stdio: 'inherit', env: {
    ...process.env,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    JEST_WORKER_ID: undefined
  } });
}

/**
 *
 */
function runYarnTestPlaywrightSanity() {
  execSync('yarn test:playwright:sanity', { cwd: tmpAppFolderPath, stdio: 'inherit', env: {
    ...process.env,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    JEST_WORKER_ID: undefined
  } });
}

/**
 * @param tree
 * @param moduleName
 * @param modulePath
 */
function addImportToAppModule(tree: UnitTestTree, moduleName: string, modulePath: string) {
  tree.overwrite('src/app/app.module.ts', `import { ${moduleName} } from '${modulePath}';\n${
    tree.readContent('src/app/app.module.ts').replace(/(BrowserModule,)/, `$1\n    ${moduleName},`)
  }`);
}

/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @param tree
 */
function writeFiles(tree: UnitTestTree) {
  const packageJson = JSON.parse(tree.readContent('package.json'));
  // For testing purpose it suppose to be bring by @otter/storybook
  try {
    const otterStorybookPackageJson = JSON.parse(readFileSync(otterStorybookPackageJsonPath).toString());
    packageJson.devDependencies.color = otterStorybookPackageJson.devDependencies?.color || '^3.1.3';
  } catch {
    packageJson.devDependencies.color = '^3.1.3';
  }
  // For testing purpose it suppose to be bring by @o3r/eslint-config-otter
  packageJson.resolutions = {
    '@o3r/eslint-plugin': `${applicationPath}/packages/@o3r/eslint-plugin`
  };
  // For testing purpose to use the current version and not a deployed one
  const versionToChange = {
    '@otter/animations': `${applicationPath}/modules/@otter/animations/dist`,
    '@otter/common': `${applicationPath}/modules/@otter/common/dist`,
    '@otter/core': `${applicationPath}/modules/@otter/core/dist`,
    '@otter/devkit': `${applicationPath}/modules/@otter/devkit/dist`,
    '@otter/rules-engine-core': `${applicationPath}/modules/@otter/rules-engine-core/dist`,
    '@otter/services': `${applicationPath}/modules/@otter/services/dist`,
    '@otter/store': `${applicationPath}/modules/@otter/store/dist`,
    '@otter/styling': `${applicationPath}/modules/@otter/styling`,
    '@otter/cms-adapters': `${applicationPath}/packages/@otter/cms-adapters`,
    '@o3r/eslint-config-otter': `${applicationPath}/packages/@o3r/eslint-config-otter`,
    '@otter/ng-tools': `${applicationPath}/packages/@otter/ng-tools`,
    '@otter/storybook': `${applicationPath}/packages/@otter/storybook`,
    '@otter/testing': `${applicationPath}/modules/@otter/testing`
  };
  Object.keys(packageJson.devDependencies).forEach((dep) => {
    if (versionToChange[dep]) {
      packageJson.devDependencies[dep] = versionToChange[dep];
    }
  });
  Object.keys(packageJson.dependencies).forEach((dep) => {
    if (versionToChange[dep]) {
      packageJson.dependencies[dep] = versionToChange[dep];
    }
  });
  // For testing purpose issue with Safari support
  // https://github.com/angular/angular-cli/issues/22606
  packageJson.browserslist = [
    'Chrome >= 50',
    'Firefox >= 40',
    'IE >= 11',
    'Edge >= 12',
    'Opera >= 50'
  ];
  tree.overwrite('package.json', JSON.stringify(packageJson, null, 2));
  tree.files.forEach((file) => {
    if (file !== '/.browserslistrc') {
      const filePath = path.join(tmpAppFolderPath, file);
      mkdirSync(path.dirname(filePath), { recursive: true });
      writeFileSync(
        filePath,
        tree.readContent(file)
      );
    }
  });
}
/* eslint-enable @typescript-eslint/naming-convention */

describe('new Otter application', () => {
  const otterRunner = new SchematicTestRunner('schematics', collectionPath);
  const angularRunner = new SchematicTestRunner('schematics', angularCollectionPath);
  const materialRunner = new SchematicTestRunner('schematics', materialCollectionPath);
  let initialTree: Tree;
  let tree: UnitTestTree;

  beforeAll(async () => {
    initialTree = Tree.empty();
    const packageJson = JSON.parse(readFileSync(packageJsonPath).toString());
    const angularCliVersion = minVersion(packageJson.devDependencies['@angular/cli']).version;

    tree = await lastValueFrom(angularRunner.runSchematicAsync('ng-new', {
      name: 'test-app',
      version: angularCliVersion,
      directory: '.',
      style: 'scss',
      routing: true
    }, initialTree));
    tree = await lastValueFrom(otterRunner.runSchematicAsync('ng-add', {
      projectName: 'test-app'
    }, tree));
    tree = await lastValueFrom(materialRunner.runSchematicAsync('ng-add', {}, tree));
    writeFiles(tree);
    runYarnInstall();
  });

  test('should build empty app', () => {
    expect(() => runYarnBuild()).not.toThrow();
  });

  test('should build with a new entity async store', async () => {
    tree = await lastValueFrom(otterRunner.runSchematicAsync('store-entity-async', {
      storeName: 'test-entity-async',
      modelName: 'Bound',
      modelIdPropName: 'id'
    }, tree));
    addImportToAppModule(tree, 'TestEntityAsyncStoreModule', 'src/store/test-entity-async');
    writeFiles(tree);

    expect(() => runYarnBuild()).not.toThrow();
  });

  test('should build with a new entity sync store', async () => {
    tree = await lastValueFrom(otterRunner.runSchematicAsync('store-entity-sync', {
      storeName: 'test-entity-sync',
      modelName: 'Bound',
      modelIdPropName: 'id'
    }, tree));
    addImportToAppModule(tree, 'TestEntitySyncStoreModule', 'src/store/test-entity-sync');
    writeFiles(tree);

    expect(() => runYarnBuild()).not.toThrow();
  });

  test('should build with a new simple async store', async () => {
    tree = await lastValueFrom(otterRunner.runSchematicAsync('store-simple-async', {
      storeName: 'test-simple-async',
      modelName: 'Bound'
    }, tree));
    addImportToAppModule(tree, 'TestSimpleAsyncStoreModule', 'src/store/test-simple-async');
    writeFiles(tree);

    expect(() => runYarnBuild()).not.toThrow();
  });

  test('should build with a new simple sync store', async () => {
    tree = await lastValueFrom(otterRunner.runSchematicAsync('store-simple-sync', {
      storeName: 'test-simple-sync',
      modelName: 'Bound'
    }, tree));
    addImportToAppModule(tree, 'TestSimpleSyncStoreModule', 'src/store/test-simple-sync');
    writeFiles(tree);

    expect(() => runYarnBuild()).not.toThrow();
  });

  test('should build with a new service', async () => {
    tree = await lastValueFrom(otterRunner.runSchematicAsync('service', {
      name: 'test-service',
      featureName: 'base'
    }, tree));
    addImportToAppModule(tree, 'TestServiceBaseModule', 'src/services/test-service');
    writeFiles(tree);

    expect(() => runYarnBuild()).not.toThrow();
  });

  test('should build with a new page', async () => {
    tree = await lastValueFrom(otterRunner.runSchematicAsync('page', {
      name: 'test-page',
      appRoutingModulePath: 'src/app/app-routing.module.ts'
    }, tree));
    writeFiles(tree);

    expect(() => runYarnBuild()).not.toThrow();
  });

  test('should build with a new component', async () => {
    tree = await lastValueFrom(otterRunner.runSchematicAsync('component', {
      componentName: 'test-component',
      activateDummy: true
    }, tree));
    addImportToAppModule(tree, 'TestComponentContModule', 'src/components/test-component');
    writeFiles(tree);

    expect(() => runYarnBuild()).not.toThrow();
  });

  test.skip('should build storybook', async () => {
    tree = await lastValueFrom(otterRunner.runSchematicAsync('storybook-component', {
      relativePathToComponentDir: 'src/components/test-component/presenter'
    }, tree));
    writeFiles(tree);

    expect(() => runYarnBuildStorybook()).not.toThrow();
  });

  describe('should pass the e2e tests', () => {
    const devServerPort = 4200;
    beforeAll(async () => {
      execSync('yarn playwright install', { cwd: tmpAppFolderPath });
      execSync('yarn playwright install-deps', { cwd: tmpAppFolderPath });

      tree = await lastValueFrom(otterRunner.runSchematicAsync('playwright-scenario', {
        name: 'test-scenario'
      }, tree));
      tree = await lastValueFrom(otterRunner.runSchematicAsync('playwright-sanity', {
        name: 'test-sanity'
      }, tree));
      writeFiles(tree);

      runYarnBuild();
      spawn(`npx http-server -p ${devServerPort} ./dist`, [], {
        cwd: tmpAppFolderPath,
        shell: true,
        stdio: 'inherit'
      });
      execSync(`npx wait-on http://localhost:${devServerPort}`);
    }, 5 * 60 * 1000);

    it('playwright scenario', () => {
      expect(() => runYarnTestPlaywrightScenario()).not.toThrow();
    });

    it('playwright sanity', () => {
      expect(() => runYarnTestPlaywrightSanity()).not.toThrow();
    });

    afterAll(async () => {
      const pid = await getPidFromPort(devServerPort);
      execSync(process.platform === 'win32' ? `taskkill /f /t /pid ${pid}` : `kill -15 ${pid}`, {stdio: 'inherit'});
    });

  });
});
