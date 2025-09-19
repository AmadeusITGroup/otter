/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-components-metadata-check
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import {
  existsSync,
  promises,
  readFileSync,
} from 'node:fs';
import {
  dirname,
  join,
} from 'node:path';
import type {
  MigrationFile,
} from '@o3r/extractors';
import {
  getExternalDependenciesVersionRange,
  getPackageManager,
} from '@o3r/schematics';
import {
  getDefaultExecSyncOptions,
  getLatestPackageVersion,
  packageManagerAdd,
  packageManagerExec,
  packageManagerVersion,
  publishToVerdaccio,
} from '@o3r/test-helpers';
import {
  inc,
} from 'semver';
import {
  componentMetadataComparator,
  type MigrationComponentData,
} from './helpers/component-metadata-comparison.helper';
import type {
  ComponentClassOutput,
} from '@o3r/components';

const baseVersion = '1.2.0';
const version = '1.3.0';
const migrationDataFileName = `migration-scripts/MIGRATION-${version}.json`;
const metadataFileName = 'component.class.metadata.json';

const defaultMigrationData: MigrationFile<MigrationComponentData> = {
  version,
  changes: [
    { // Update placeholder id
      contentType: 'COMPONENT',
      before: {
        libraryName: '@o3r/lib1',
        componentName: 'MyComponent1',
        placeholderId: 'oldPlaceholder1'
      },
      after: {
        libraryName: '@o3r/lib1',
        componentName: 'MyComponent1',
        placeholderId: 'newPlaceholder1'
      }
    }
  ]
};

const createComponentMetadata = (library: string, name: string, placeholders: string[]): ComponentClassOutput => ({
  library,
  name,
  placeholders: placeholders.map((id) => ({ id, description: `description for ${id}` })),
  type: 'COMPONENT',
  path: '',
  linkableToRuleset: false,
  selector: ''
});

const previousComponentMetadata: ComponentClassOutput[] = [
  createComponentMetadata('@o3r/lib0', 'MyComponent0', ['placeholder0']),
  createComponentMetadata('@o3r/lib1', 'MyComponent1', ['oldPlaceholder1']),
  createComponentMetadata('@o3r/lib1', 'MyComponent2', [])
];

const newComponentMetadata: ComponentClassOutput[] = [
  previousComponentMetadata[0],
  createComponentMetadata('@o3r/lib1', 'MyComponent1', ['newPlaceholder1']),
  createComponentMetadata('@o3r/lib1', 'MyComponent2', ['placeholder2'])
];

async function writeFileAsJSON(path: string, content: object) {
  if (!existsSync(dirname(path))) {
    await promises.mkdir(dirname(path), { recursive: true });
  }
  await promises.writeFile(path, JSON.stringify(content), { encoding: 'utf8' });
}

const initTest = async (
  newMetadata: ComponentClassOutput[],
  migrationData: MigrationFile<MigrationComponentData>,
  packageNameSuffix: string,
  options?: {
    allowBreakingChanges?: boolean;
    shouldCheckUnusedMigrationData?: boolean;
    prerelease?: string;
  }
) => {
  const {
    allowBreakingChanges = false,
    shouldCheckUnusedMigrationData = false,
    prerelease
  } = options || {};
  const { workspacePath, appName, applicationPath, o3rVersion, isYarnTest } = o3rEnvironment.testEnvironment;
  const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: applicationPath };
  const execAppOptionsWorkspace = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
  packageManagerExec({ script: 'ng', args: ['add', `@o3r/extractors@${o3rVersion}`, '--skip-confirmation', '--project-name', appName] }, execAppOptionsWorkspace);
  packageManagerExec({ script: 'ng', args: ['add', `@o3r/components@${o3rVersion}`, '--skip-confirmation', '--project-name', appName] }, execAppOptionsWorkspace);
  const versions = getExternalDependenciesVersionRange([
    'semver',
    ...(isYarnTest
      ? [
        '@yarnpkg/core',
        '@yarnpkg/fslib',
        '@yarnpkg/plugin-npm',
        '@yarnpkg/plugin-pack',
        '@yarnpkg/cli'
      ]
      : [])
  ], join(__dirname, '..', '..', '..', 'package.json'), {
    warn: jest.fn()
  } as any);
  Object.entries(versions).forEach(([pkgName, pkgVersion]) => packageManagerAdd(`${pkgName}@${pkgVersion}`, execAppOptionsWorkspace));
  const npmIgnorePath = join(applicationPath, '.npmignore');
  const packageJsonPath = join(applicationPath, 'package.json');
  const angularJsonPath = join(workspacePath, 'angular.json');
  const metadataPath = join(applicationPath, metadataFileName);
  const migrationDataPath = join(applicationPath, migrationDataFileName);

  // Add builder options
  const angularJson = JSON.parse(readFileSync(angularJsonPath, { encoding: 'utf8' }).toString());
  const builderConfig = {
    builder: '@o3r/components:check-component-migration-metadata',
    options: {
      allowBreakingChanges,
      shouldCheckUnusedMigrationData,
      migrationDataPath: `apps/test-app/migration-scripts/MIGRATION-*.json`
    }
  };
  angularJson.projects[appName].architect['check-metadata'] = builderConfig;
  await writeFileAsJSON(angularJsonPath, angularJson);

  // Add scope to project for registry management
  let packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf8' }).toString());
  const packageName = `@o3r/${o3rEnvironment.testEnvironment.folderName}-${packageNameSuffix}`;
  packageJson = {
    ...packageJson,
    name: packageName,
    private: false
  };
  await writeFileAsJSON(packageJsonPath, packageJson);
  await promises.writeFile(npmIgnorePath, '');

  // Set old metadata and publish to registry
  await writeFileAsJSON(metadataPath, previousComponentMetadata);

  let latestVersion;
  try {
    latestVersion = getLatestPackageVersion(packageName, execAppOptionsWorkspace);
  } catch {
    latestVersion = baseVersion;
  }

  const prereleaseSuffix = prerelease ? `-${prerelease}.0` : '';
  const bumpedVersion = inc(latestVersion.replace(/-.*$/, ''), 'patch') + prereleaseSuffix;

  const args = getPackageManager() === 'yarn' ? [] : ['--no-git-tag-version', '-f'];
  packageManagerVersion(bumpedVersion, args, execAppOptions);

  await publishToVerdaccio(execAppOptions);

  // Override with new metadata for comparison
  await writeFileAsJSON(metadataPath, newMetadata);

  // Add migration data file
  await writeFileAsJSON(migrationDataPath, migrationData);
};

const getMessagesForId = (id: string) => ({
  notDocumented: `Property ${id} has been modified but is not documented in the migration document`,
  documentedButNotPresent: `Property ${id} has been modified but the new property is not present in the new metadata`,
  breakingChangesNotAllowed: `Property ${id} is not present in the new metadata and breaking changes are not allowed`
});

describe('check metadata migration', () => {
  test('should not throw', async () => {
    await initTest(
      newComponentMetadata,
      defaultMigrationData,
      'allow-breaking-changes',
      { allowBreakingChanges: true, shouldCheckUnusedMigrationData: false }
    );
    const { workspacePath, appName } = o3rEnvironment.testEnvironment;
    const execAppOptionsWorkspace = { ...getDefaultExecSyncOptions(), cwd: workspacePath };

    expect(() => packageManagerExec({ script: 'ng', args: ['run', `${appName}:check-metadata`] }, execAppOptionsWorkspace)).not.toThrow();
  });

  test('should not throw on prerelease', async () => {
    await initTest(
      newComponentMetadata,
      defaultMigrationData,
      'allow-breaking-changes-prerelease',
      { allowBreakingChanges: true, shouldCheckUnusedMigrationData: false, prerelease: 'rc' }
    );
    const { workspacePath, appName } = o3rEnvironment.testEnvironment;
    const execAppOptionsWorkspace = { ...getDefaultExecSyncOptions(), cwd: workspacePath };

    expect(() => packageManagerExec({ script: 'ng', args: ['run', `${appName}:check-metadata`] }, execAppOptionsWorkspace)).not.toThrow();
  });

  test('should throw because no migration data', async () => {
    await initTest(
      newComponentMetadata,
      {
        ...defaultMigrationData,
        changes: []
      },
      'no-migration-data',
      { allowBreakingChanges: true, shouldCheckUnusedMigrationData: false }
    );
    const { workspacePath, appName } = o3rEnvironment.testEnvironment;
    const execAppOptionsWorkspace = { ...getDefaultExecSyncOptions(), cwd: workspacePath };

    try {
      packageManagerExec({ script: 'ng', args: ['run', `${appName}:check-metadata`] }, execAppOptionsWorkspace);
      throw new Error('should have thrown before');
    } catch (e: any) {
      /* eslint-disable jest/no-conditional-expect -- always called as there is a throw in the try block */
      expect(e.message).not.toBe('should have thrown before');
      previousComponentMetadata.slice(1, -1).forEach((item) => {
        const id = componentMetadataComparator.getIdentifier(item);
        const { notDocumented, documentedButNotPresent, breakingChangesNotAllowed } = getMessagesForId(id);
        expect(e.message).toContain(notDocumented);
        expect(e.message).not.toContain(documentedButNotPresent);
        expect(e.message).not.toContain(breakingChangesNotAllowed);
      });
      [previousComponentMetadata[0], previousComponentMetadata.at(-1)].forEach((item) => {
        const id = componentMetadataComparator.getIdentifier(item);
        const { notDocumented, documentedButNotPresent, breakingChangesNotAllowed } = getMessagesForId(id);
        expect(e.message).not.toContain(notDocumented);
        expect(e.message).not.toContain(documentedButNotPresent);
        expect(e.message).not.toContain(breakingChangesNotAllowed);
      });
      /* eslint-enable jest/no-conditional-expect */
    }
  });

  test('should throw because migration data invalid', async () => {
    await initTest(
      [newComponentMetadata[0]],
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
      'invalid-data',
      { allowBreakingChanges: true, shouldCheckUnusedMigrationData: false }
    );
    const { workspacePath, appName } = o3rEnvironment.testEnvironment;
    const execAppOptionsWorkspace = { ...getDefaultExecSyncOptions(), cwd: workspacePath };

    try {
      packageManagerExec({ script: 'ng', args: ['run', `${appName}:check-metadata`] }, execAppOptionsWorkspace);
      throw new Error('should have thrown before');
    } catch (e: any) {
      /* eslint-disable jest/no-conditional-expect -- always called as there is a throw in the try block */
      expect(e.message).not.toBe('should have thrown before');
      previousComponentMetadata.slice(1, -1).forEach((item) => {
        const id = componentMetadataComparator.getIdentifier(item);
        const { notDocumented, documentedButNotPresent, breakingChangesNotAllowed } = getMessagesForId(id);
        expect(e.message).not.toContain(notDocumented);
        expect(e.message).toContain(documentedButNotPresent);
        expect(e.message).not.toContain(breakingChangesNotAllowed);
      });
      [previousComponentMetadata[0], previousComponentMetadata.at(-1)].forEach((item) => {
        const id = componentMetadataComparator.getIdentifier(item);
        const { notDocumented, documentedButNotPresent, breakingChangesNotAllowed } = getMessagesForId(id);
        expect(e.message).not.toContain(notDocumented);
        expect(e.message).not.toContain(documentedButNotPresent);
        expect(e.message).not.toContain(breakingChangesNotAllowed);
      });
      /* eslint-enable jest/no-conditional-expect */
    }
  });

  test('should throw because breaking changes are not allowed', async () => {
    await initTest(
      newComponentMetadata,
      {
        ...defaultMigrationData,
        changes: []
      },
      'breaking-changes',
      { allowBreakingChanges: false, shouldCheckUnusedMigrationData: false }
    );
    const { workspacePath, appName } = o3rEnvironment.testEnvironment;
    const execAppOptionsWorkspace = { ...getDefaultExecSyncOptions(), cwd: workspacePath };

    try {
      packageManagerExec({ script: 'ng', args: ['run', `${appName}:check-metadata`] }, execAppOptionsWorkspace);
      throw new Error('should have thrown before');
    } catch (e: any) {
      /* eslint-disable jest/no-conditional-expect -- always called as there is a throw in the try block */
      expect(e.message).not.toBe('should have thrown before');
      previousComponentMetadata.slice(1, -1).forEach((item) => {
        const id = componentMetadataComparator.getIdentifier(item);
        const { notDocumented, documentedButNotPresent, breakingChangesNotAllowed } = getMessagesForId(id);
        expect(e.message).not.toContain(notDocumented);
        expect(e.message).not.toContain(documentedButNotPresent);
        expect(e.message).toContain(breakingChangesNotAllowed);
      });
      [previousComponentMetadata[0], previousComponentMetadata.at(-1)].forEach((item) => {
        const id = componentMetadataComparator.getIdentifier(item);
        const { notDocumented, documentedButNotPresent, breakingChangesNotAllowed } = getMessagesForId(id);
        expect(e.message).not.toContain(notDocumented);
        expect(e.message).not.toContain(documentedButNotPresent);
        expect(e.message).not.toContain(breakingChangesNotAllowed);
      });
      /* eslint-enable jest/no-conditional-expect */
    }
  });

  test('should throw because of unused migration data', async () => {
    const unusedMigrationItem = {
      contentType: 'COMPONENT',
      before: {
        libraryName: 'fake-remove'
      }
    };
    await initTest(
      newComponentMetadata,
      {
        ...defaultMigrationData,
        changes: [
          ...defaultMigrationData.changes,
          unusedMigrationItem
        ]
      },
      'unused-migration-data',
      { allowBreakingChanges: true, shouldCheckUnusedMigrationData: true }
    );
    const { workspacePath, appName } = o3rEnvironment.testEnvironment;
    const execAppOptionsWorkspace = { ...getDefaultExecSyncOptions(), cwd: workspacePath };

    try {
      packageManagerExec({ script: 'ng', args: ['run', `${appName}:check-metadata`] }, execAppOptionsWorkspace);
      throw new Error('should have thrown before');
    } catch (e: any) {
      /* eslint-disable jest/no-conditional-expect -- catch block always called */
      expect(e.message).not.toBe('should have thrown before');
      expect(e.message).toContain(`The following migration data has been documented but no corresponding metadata change was found: ${JSON.stringify(unusedMigrationItem, null, 2)}`);
      /* eslint-enable jest/no-conditional-expect */
    }
  });
});
