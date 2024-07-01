/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-components-metadata-check
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import type { MigrationFile } from '@o3r/extractors';
import { getPackageManager } from '@o3r/schematics';
import {
  getDefaultExecSyncOptions,
  getLatestPackageVersion,
  packageManagerAdd,
  packageManagerExec,
  packageManagerPublish,
  packageManagerVersion
} from '@o3r/test-helpers';
import { execFileSync } from 'node:child_process';
import { promises, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { inc } from 'semver';
import type { ComponentConfigOutput, ConfigProperty } from '@o3r/components';
import type { MigrationConfigData } from './helpers/config-metadata-comparison.helper';
import { getExternalDependenciesVersionRange } from '@o3r/schematics';

const baseVersion = '1.2.0';
const version = '1.3.0';
const migrationDataFileName = `MIGRATION-${version}.json`;
const metadataFileName = 'component.config.metadata.json';

const defaultMigrationData: MigrationFile<MigrationConfigData> = {
  version,
  changes: [
    { // Rename property name
      'contentType': 'CONFIG',
      'before': {
        'libraryName': '@o3r/lib1',
        'configName': 'MyConfig1',
        'propertyName': 'prop1'
      },
      'after': {
        'libraryName': '@o3r/lib1',
        'configName': 'MyConfig1',
        'propertyName': 'newProp1Name'
      }
    },
    { // Move property to a new config3
      'contentType': 'CONFIG',
      'before': {
        'libraryName': '@o3r/lib2',
        'configName': 'MyConfig2',
        'propertyName': 'prop2'
      },
      'after': {
        'libraryName': '@o3r/lib2',
        'configName': 'NewConfig2',
        'propertyName': 'prop2'
      }
    },
    { // Move property to a new config and rename property name
      'contentType': 'CONFIG',
      'before': {
        'libraryName': '@o3r/lib3',
        'configName': 'MyConfig3',
        'propertyName': 'prop3'
      },
      'after': {
        'libraryName': '@o3r/lib3',
        'configName': 'NewConfig3',
        'propertyName': 'newProp3Name'
      }
    },
    { // Move property to a new library
      'contentType': 'CONFIG',
      'before': {
        'libraryName': '@o3r/lib4',
        'configName': 'MyConfig4',
        'propertyName': 'prop4'
      },
      'after': {
        'libraryName': '@new/lib4',
        'configName': 'MyConfig4',
        'propertyName': 'prop4'
      }
    },
    { // Move property to a new library and rename property name
      'contentType': 'CONFIG',
      'before': {
        'libraryName': '@o3r/lib5',
        'configName': 'MyConfig5',
        'propertyName': 'prop5'
      },
      'after': {
        'libraryName': '@new/lib5',
        'configName': 'MyConfig5',
        'propertyName': 'newProp5Name'
      }
    },
    { // Move property to a new library and to a new config and rename property name
      'contentType': 'CONFIG',
      'before': {
        'libraryName': '@o3r/lib6',
        'configName': 'MyConfig6',
        'propertyName': 'prop6'
      },
      'after': {
        'libraryName': '@new/lib6',
        'configName': 'NewConfig6',
        'propertyName': 'newProp6Name'
      }
    },
    { // Rename configuration name for all properties
      'contentType': 'CONFIG',
      'before': {
        'libraryName': '@o3r/lib7',
        'configName': 'MyConfig7'
      },
      'after': {
        'libraryName': '@o3r/lib7',
        'configName': 'NewConfig7'
      }
    },
    { // Rename library name for all configurations
      'contentType': 'CONFIG',
      'before': {
        'libraryName': '@o3r/lib8'
      },
      'after': {
        'libraryName': '@new/lib8'
      }
    },
    { // Move configuration to a new library
      'contentType': 'CONFIG',
      'before': {
        'libraryName': '@o3r/lib9',
        'configName': 'MyConfig9'
      },
      'after': {
        'libraryName': '@new/lib9',
        'configName': 'MyConfig9'
      }
    }
  ]
};

const createProp = (name: string): ConfigProperty => ({
  name,
  type: 'string',
  description: '',
  label: name
});

const createConfig = (library: string, name: string, propertiesName: string[]): ComponentConfigOutput => ({
  library,
  name,
  properties: propertiesName.map(createProp),
  type: 'EXPOSED_COMPONENT',
  path: ''
});

const previousConfigurationMetadata: ComponentConfigOutput[] = [
  createConfig('@o3r/lib0', 'MyConfig0', ['prop0']),
  createConfig('@o3r/lib1', 'MyConfig1', ['prop1']),
  createConfig('@o3r/lib2', 'MyConfig2', ['prop2']),
  createConfig('@o3r/lib3', 'MyConfig3', ['prop3']),
  createConfig('@o3r/lib4', 'MyConfig4', ['prop4']),
  createConfig('@o3r/lib5', 'MyConfig5', ['prop5']),
  createConfig('@o3r/lib6', 'MyConfig6', ['prop6']),
  createConfig('@o3r/lib7', 'MyConfig7', ['prop7']),
  createConfig('@o3r/lib8', 'MyConfig8', ['prop8']),
  createConfig('@o3r/lib9', 'MyConfig9', ['prop9'])
];

const newConfigurationMetadata: ComponentConfigOutput[] = [
  previousConfigurationMetadata[0],
  createConfig('@o3r/lib1', 'MyConfig1', ['newProp1Name']),
  createConfig('@o3r/lib2', 'NewConfig2', ['prop2']),
  createConfig('@o3r/lib3', 'NewConfig3', ['newProp3Name']),
  createConfig('@new/lib4', 'MyConfig4', ['prop4']),
  createConfig('@new/lib5', 'MyConfig5', ['newProp5Name']),
  createConfig('@new/lib6', 'NewConfig6', ['newProp6Name']),
  createConfig('@o3r/lib7', 'NewConfig7', ['prop7']),
  createConfig('@new/lib8', 'MyConfig8', ['prop8']),
  createConfig('@new/lib9', 'MyConfig9', ['prop9'])
];

function writeFileAsJSON(path: string, content: object) {
  return promises.writeFile(path, JSON.stringify(content), { encoding: 'utf8' });
}

const initTest = async (
  allowBreakingChanges: boolean,
  newMetadata: ComponentConfigOutput[],
  migrationData: MigrationFile<MigrationConfigData>,
  packageNameSuffix: string
) => {
  const { workspacePath, appName, applicationPath, o3rVersion, isYarnTest } = o3rEnvironment.testEnvironment;
  const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: applicationPath };
  const execAppOptionsWorkspace = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
  packageManagerAdd(`@o3r/components@${o3rVersion}`, execAppOptionsWorkspace);
  packageManagerAdd(`@o3r/extractors@${o3rVersion}`, execAppOptionsWorkspace);
  const versions = getExternalDependenciesVersionRange([
    'semver',
    ...(isYarnTest ? [
      '@yarnpkg/core',
      '@yarnpkg/fslib',
      '@yarnpkg/plugin-npm',
      '@yarnpkg/plugin-pack',
      '@yarnpkg/cli'
    ] : [])
  ], join(__dirname, '..', '..', 'package.json'), {
    warn: jest.fn()
  } as any);
  Object.entries(versions).forEach(([pkgName, pkgVersion]) => packageManagerAdd(`${pkgName}@${pkgVersion}`, execAppOptionsWorkspace));
  const packageJsonPath = join(applicationPath, 'package.json');
  const angularJsonPath = join(workspacePath, 'angular.json');
  const metadataPath = join(applicationPath, metadataFileName);
  const migrationDataPath = join(applicationPath, migrationDataFileName);

  // Add builder options
  const angularJson = JSON.parse(readFileSync(angularJsonPath, { encoding: 'utf8' }).toString());
  const builderConfig = {
    builder: '@o3r/components:check-config-migration-metadata',
    options: {
      allowBreakingChanges,
      migrationDataPath: `**/MIGRATION-*.json`
    }
  };
  angularJson.projects[appName].architect['check-metadata'] = builderConfig;
  await writeFileAsJSON(angularJsonPath, angularJson);

  // Add scope to project for registry management
  let packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf8' }).toString());
  const packageName = `@o3r/${packageJson.name}-${packageNameSuffix}`;
  packageJson = {
    ...packageJson,
    name: packageName,
    private: false
  };
  await writeFileAsJSON(packageJsonPath, packageJson);

  // Set old metadata and publish to registry
  await writeFileAsJSON(metadataPath, previousConfigurationMetadata);

  let latestVersion;
  try {
    latestVersion = getLatestPackageVersion(packageName, execAppOptionsWorkspace);
  } catch {
    latestVersion = baseVersion;
  }

  const bumpedVersion = inc(latestVersion, 'patch');

  const args = getPackageManager() === 'yarn' ? [] : ['--no-git-tag-version', '-f'];
  packageManagerVersion(bumpedVersion, args, execAppOptions);

  packageManagerPublish([], execAppOptions);

  // Override with new metadata for comparison
  await writeFileAsJSON(metadataPath, newMetadata);

  // Add migration data file
  await writeFileAsJSON(migrationDataPath, migrationData);
};

describe('check metadata migration', () => {
  beforeEach(async () => {
    const { applicationPath } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: applicationPath, shell: true };
    await promises.copyFile(
      join(__dirname, '..', '..', '..', '..', '..', '.verdaccio', 'conf', '.npmrc'),
      join(applicationPath, '.npmrc')
    );
    execFileSync('npx', [
      '--yes',
      'npm-cli-login',
      '-u',
      'verdaccio',
      '-p',
      'verdaccio',
      '-e',
      'test@test.com',
      '-r',
      'http://127.0.0.1:4873'
    ], execAppOptions);
  });

  test('should not throw', async () => {
    await initTest(
      true,
      newConfigurationMetadata,
      defaultMigrationData,
      'allow-breaking-changes'
    );
    const { workspacePath, appName } = o3rEnvironment.testEnvironment;
    const execAppOptionsWorkspace = { ...getDefaultExecSyncOptions(), cwd: workspacePath };

    expect(() => packageManagerExec({ script: 'ng', args: ['run', `${appName}:check-metadata`] }, execAppOptionsWorkspace)).not.toThrow();
  });

  test('should throw because no migration data', async () => {
    await initTest(
      true,
      newConfigurationMetadata,
      {
        ...defaultMigrationData,
        changes: []
      },
      'no-migration-data'
    );
    const { workspacePath, appName } = o3rEnvironment.testEnvironment;
    const execAppOptionsWorkspace = { ...getDefaultExecSyncOptions(), cwd: workspacePath };

    try {
      packageManagerExec({ script: 'ng', args: ['run', `${appName}:check-metadata`] }, execAppOptionsWorkspace);
      throw new Error('should have thrown before');
    } catch (e: any) {
      expect(e.message).not.toBe('should have thrown before');
      previousConfigurationMetadata.slice(1).forEach(({ library, name, properties }) => {
        const id = `${library}#${name} ${properties[0].name}`;
        expect(e.message).toContain(`Property ${id} has been modified but is not documented in the migration document`);
        expect(e.message).not.toContain(`Property ${id} has been modified but the new property is not present in the new metadata`);
        expect(e.message).not.toContain(`Property ${id} is not present in the new metadata and breaking changes are not allowed`);
      });
    }
  });

  test('should throw because migration data invalid', async () => {
    await initTest(
      true,
      [newConfigurationMetadata[0]],
      {
        ...defaultMigrationData,
        changes: defaultMigrationData.changes.map((change) => ({
          ...change,
          after: {
            ...change.after,
            libraryName: '@invalid/lib'
          }
        }))
      },
      'invalid-data'
    );
    const { workspacePath, appName } = o3rEnvironment.testEnvironment;
    const execAppOptionsWorkspace = { ...getDefaultExecSyncOptions(), cwd: workspacePath };

    try {
      packageManagerExec({ script: 'ng', args: ['run', `${appName}:check-metadata`] }, execAppOptionsWorkspace);
      throw new Error('should have thrown before');
    } catch (e: any) {
      expect(e.message).not.toBe('should have thrown before');
      previousConfigurationMetadata.slice(1).forEach(({ library, name, properties }) => {
        const id = `${library}#${name} ${properties[0].name}`;
        expect(e.message).not.toContain(`Property ${id} has been modified but is not documented in the migration document`);
        expect(e.message).toContain(`Property ${id} has been modified but the new property is not present in the new metadata`);
        expect(e.message).not.toContain(`Property ${id} is not present in the new metadata and breaking changes are not allowed`);
      });
    }
  });

  test('should throw because breaking changes are not allowed', async () => {
    await initTest(
      false,
      newConfigurationMetadata,
      {
        ...defaultMigrationData,
        changes: []
      },
      'breaking-changes'
    );
    const { workspacePath, appName } = o3rEnvironment.testEnvironment;
    const execAppOptionsWorkspace = { ...getDefaultExecSyncOptions(), cwd: workspacePath };

    try {
      packageManagerExec({ script: 'ng', args: ['run', `${appName}:check-metadata`] }, execAppOptionsWorkspace);
      throw new Error('should have thrown before');
    } catch (e: any) {
      expect(e.message).not.toBe('should have thrown before');
      previousConfigurationMetadata.slice(1).forEach(({ library, name, properties }) => {
        const id = `${library}#${name} ${properties[0].name}`;
        expect(e.message).not.toContain(`Property ${id} has been modified but is not documented in the migration document`);
        expect(e.message).not.toContain(`Property ${id} has been modified but the new property is not present in the new metadata`);
        expect(e.message).toContain(`Property ${id} is not present in the new metadata and breaking changes are not allowed`);
      });
    }
  });
});
