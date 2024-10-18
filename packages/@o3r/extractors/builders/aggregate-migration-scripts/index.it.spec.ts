/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-extractors-aggregate-migration-scripts
 */
import {
  promises,
  readFileSync
} from 'node:fs';
import {
  join,
  relative
} from 'node:path';
import {
  getDefaultExecSyncOptions,
  getLatestPackageVersion,
  packageManagerAdd,
  packageManagerExec,
  publishToVerdaccio
} from '@o3r/test-helpers';
import {
  inc
} from 'semver';

const o3rEnvironment = globalThis.o3rEnvironment;

const migrationDataMocksPath = join(__dirname, '..', '..', 'testing', 'mocks', 'migration-scripts');

function writeFileAsJSON(path: string, content: object) {
  return promises.writeFile(path, JSON.stringify(content), { encoding: 'utf8' });
}

async function expectFileToMatchMock(realPath: string, mockPath: string) {
  expect(await promises.readFile(realPath, { encoding: 'utf8' })).toEqual(await promises.readFile(mockPath, { encoding: 'utf8' }));
}

async function publishLibrary(cwd: string) {
  const libraryPath = join(cwd, 'mylib');
  const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: libraryPath };
  const libMigrationDataPath = join(libraryPath, 'migration-scripts');
  await promises.mkdir(libMigrationDataPath, { recursive: true });

  let latestVersion;
  try {
    latestVersion = getLatestPackageVersion('@o3r/my-lib', {
      ...execAppOptions,
      registry: o3rEnvironment.testEnvironment.registry
    });
  } catch {
    latestVersion = '4.0.0';
  }
  const bumpedVersion = inc(latestVersion, 'patch');

  await promises.writeFile(join(libraryPath, 'package.json'), `{"name": "@o3r/my-lib", "version": "${bumpedVersion}"}`);
  await promises.copyFile(join(migrationDataMocksPath, 'lib', 'migration-2.0.json'), join(libMigrationDataPath, 'migration-2.0.json'));
  await promises.copyFile(join(migrationDataMocksPath, 'lib', 'migration-2.5.json'), join(libMigrationDataPath, 'migration-2.5.json'));
  await promises.copyFile(join(migrationDataMocksPath, 'lib', 'migration-4.0.json'), join(libMigrationDataPath, 'migration-4.0.json'));

  await publishToVerdaccio(execAppOptions);
}

describe('aggregate migration scripts', () => {
  let migrationDataSrcPath: string;
  let migrationDataDestPath: string;

  beforeEach(async () => {
    const { workspacePath, appName, applicationPath } = o3rEnvironment.testEnvironment;
    const angularJsonPath = join(workspacePath, 'angular.json');
    migrationDataSrcPath = join(applicationPath, 'migration-scripts', 'src');
    migrationDataDestPath = join(applicationPath, 'migration-scripts', 'dist');
    // Add builder options
    const angularJson = JSON.parse(readFileSync(angularJsonPath, { encoding: 'utf8' }).toString());
    const builderConfig = {
      builder: '@o3r/extractors:aggregate-migration-scripts',
      options: {
        migrationDataPath: relative(workspacePath, `${migrationDataSrcPath}/migration-*.json`).replace(/[\\/]/g, '/'),
        outputDirectory: relative(workspacePath, migrationDataDestPath).replace(/[\\/]/g, '/')
      }
    };
    angularJson.projects[appName].architect['aggregate-migration-scripts'] = builderConfig;
    await writeFileAsJSON(angularJsonPath, angularJson);

    await publishLibrary(workspacePath);
  });

  test('should create migration scripts including lib content', async () => {
    const { workspacePath, appName, applicationPath, o3rExactVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: applicationPath };
    const execAppOptionsWorkspace = { ...getDefaultExecSyncOptions(), cwd: workspacePath };

    packageManagerExec({ script: 'ng', args: ['add', `@o3r/extractors@${o3rExactVersion}`, '--skip-confirmation', '--project-name', appName] }, execAppOptionsWorkspace);
    packageManagerAdd('@o3r/my-lib', execAppOptionsWorkspace);
    packageManagerAdd('@o3r/my-lib', execAppOptions);

    await promises.mkdir(migrationDataSrcPath, { recursive: true });
    await promises.copyFile(join(migrationDataMocksPath, 'migration-1.0.json'), join(migrationDataSrcPath, 'migration-1.0.json'));
    await promises.copyFile(join(migrationDataMocksPath, 'migration-1.5.json'), join(migrationDataSrcPath, 'migration-1.5.json'));
    await promises.copyFile(join(migrationDataMocksPath, 'migration-2.0.json'), join(migrationDataSrcPath, 'migration-2.0.json'));

    expect(() => packageManagerExec({ script: 'ng', args: ['run', `${appName}:aggregate-migration-scripts`] }, execAppOptionsWorkspace)).not.toThrow();
    await expectFileToMatchMock(`${migrationDataDestPath}/migration-1.0.json`, `${migrationDataMocksPath}/expected/migration-1.0.json`);
    await expectFileToMatchMock(`${migrationDataDestPath}/migration-1.5.json`, `${migrationDataMocksPath}/expected/migration-1.5.json`);
    await expectFileToMatchMock(`${migrationDataDestPath}/migration-2.0.json`, `${migrationDataMocksPath}/expected/migration-2.0.json`);
  });
});
