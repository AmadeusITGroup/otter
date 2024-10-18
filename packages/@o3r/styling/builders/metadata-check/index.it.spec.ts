/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-styling-metadata-check
 */
import {
  existsSync,
  promises,
  readFileSync
} from 'node:fs';
import {
  dirname,
  join
} from 'node:path';
import type {
  MigrationFile
} from '@o3r/extractors';
import {
  getExternalDependenciesVersionRange,
  getPackageManager
} from '@o3r/schematics';
import type {
  CssMetadata,
  CssVariable
} from '@o3r/styling';
import {
  getDefaultExecSyncOptions,
  getLatestPackageVersion,
  packageManagerAdd,
  packageManagerExec,
  packageManagerVersion,
  publishToVerdaccio
} from '@o3r/test-helpers';
import {
  inc
} from 'semver';
import type {
  MigrationStylingData
} from './helpers/styling-metadata-comparison.helper';

const o3rEnvironment = globalThis.o3rEnvironment;

const baseVersion = '1.2.0';
const version = '1.3.0';
const migrationDataFileName = `migration-scripts/MIGRATION-${version}.json`;
const metadataFileName = 'style.metadata.json';

const defaultMigrationData: MigrationFile<MigrationStylingData> = {
  version,
  changes: [
    { // Rename key name
      'contentType': 'STYLE',
      'before': {
        'name': 'css-var-name1'
      },
      'after': {
        'name': 'new-css-var-name1'
      }
    }
  ]
};

const createCssVar = (name: string): CssVariable => ({
  name,
  defaultValue: '#fff'
});

const unchangedVariableName = 'css-var-name0';

/* eslint-disable @typescript-eslint/naming-convention */
const previousStylingMetadata: CssMetadata = {
  variables: {
    [unchangedVariableName]: createCssVar(unchangedVariableName),
    'css-var-name1': createCssVar('css-var-name1')
  }
};

const newStylingMetadata: CssMetadata = {
  ...previousStylingMetadata,
  variables: {
    [unchangedVariableName]: previousStylingMetadata.variables[unchangedVariableName],
    'new-css-var-name1': createCssVar('new-css-var-name1')
  }
};
/* eslint-enable @typescript-eslint/naming-convention */

async function writeFileAsJSON(path: string, content: object) {
  if (!existsSync(dirname(path))) {
    await promises.mkdir(dirname(path), { recursive: true });
  }
  await promises.writeFile(path, JSON.stringify(content), { encoding: 'utf8' });
}

const initTest = async (
  allowBreakingChanges: boolean,
  newMetadata: CssMetadata,
  migrationData: MigrationFile<MigrationStylingData>,
  packageNameSuffix: string
) => {
  const { workspacePath, appName, applicationPath, o3rVersion, isYarnTest } = o3rEnvironment.testEnvironment;
  const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: applicationPath };
  const execAppOptionsWorkspace = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
  packageManagerExec({ script: 'ng', args: ['add', `@o3r/extractors@${o3rVersion}`, '--skip-confirmation', '--project-name', appName] }, execAppOptionsWorkspace);
  packageManagerExec({ script: 'ng', args: ['add', `@o3r/styling@${o3rVersion}`, '--skip-confirmation', '--project-name', appName] }, execAppOptionsWorkspace);
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
  ], join(__dirname, '..', '..', 'package.json'), {
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
    builder: '@o3r/styling:check-style-migration-metadata',
    options: {
      allowBreakingChanges,
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
  await writeFileAsJSON(metadataPath, previousStylingMetadata);

  let latestVersion;
  try {
    latestVersion = getLatestPackageVersion(packageName, execAppOptionsWorkspace);
  } catch {
    latestVersion = baseVersion;
  }

  const bumpedVersion = inc(latestVersion, 'patch');

  const args = getPackageManager() === 'yarn' ? [] : ['--no-git-tag-version', '-f'];
  packageManagerVersion(bumpedVersion, args, execAppOptions);

  await publishToVerdaccio(execAppOptions);

  // Override with new metadata for comparison
  await writeFileAsJSON(metadataPath, newMetadata);

  // Add migration data file
  await writeFileAsJSON(migrationDataPath, migrationData);
};

describe('check metadata migration', () => {
  test('should not throw', async () => {
    await initTest(
      true,
      newStylingMetadata,
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
      newStylingMetadata,
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
      Object.values(previousStylingMetadata.variables).slice(1).forEach(({ name: id }) => {
        expect(e.message).toContain(`Property ${id} has been modified but is not documented in the migration document`);
        expect(e.message).not.toContain(`Property ${id} has been modified but the new property is not present in the new metadata`);
        expect(e.message).not.toContain(`Property ${id} is not present in the new metadata and breaking changes are not allowed`);
      });
    }
  });

  test('should throw because migration data invalid', async () => {
    await initTest(
      true,
      {
        variables: {
          unchangedVariableName: newStylingMetadata.variables[unchangedVariableName]
        }
      },
      {
        ...defaultMigrationData,
        changes: defaultMigrationData.changes.map((change) => ({
          ...change,
          after: {
            ...change.after,
            name: 'invalid-name'
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
      Object.values(previousStylingMetadata.variables).slice(1).forEach(({ name: id }) => {
        expect(e.message).not.toContain(`Property ${id} has been modified but is not documented in the migration document`);
        expect(e.message).toContain(`Property ${id} has been modified but the new property is not present in the new metadata`);
        expect(e.message).not.toContain(`Property ${id} is not present in the new metadata and breaking changes are not allowed`);
      });
    }
  });

  test('should throw because breaking changes are not allowed', async () => {
    await initTest(
      false,
      newStylingMetadata,
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
      Object.values(previousStylingMetadata.variables).slice(1).forEach(({ name: id }) => {
        expect(e.message).not.toContain(`Property ${id} has been modified but is not documented in the migration document`);
        expect(e.message).not.toContain(`Property ${id} has been modified but the new property is not present in the new metadata`);
        expect(e.message).toContain(`Property ${id} is not present in the new metadata and breaking changes are not allowed`);
      });
    }
  });
});
