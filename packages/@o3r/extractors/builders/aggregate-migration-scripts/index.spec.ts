import { Architect } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { schema } from '@angular-devkit/core';
import { cleanVirtualFileSystem, useVirtualFileSystem } from '@o3r/test-helpers';
import * as fs from 'node:fs';
import { join, resolve } from 'node:path';
import { AggregateMigrationScriptsSchema } from './schema';

describe('Aggregate migration scripts', () => {
  const workspaceRoot = join('..', '..', '..', '..', '..');
  let architect: Architect;
  let architectHost: TestingArchitectHost;
  let virtualFileSystem: typeof fs;
  const migrationScriptMocksPath = join(__dirname, '../../testing/mocks/migration-scripts');
  const copyMockFile = async (virtualPath: string, realPath: string) =>
    await virtualFileSystem.promises.writeFile(virtualPath, await fs.promises.readFile(join(migrationScriptMocksPath, realPath), {encoding: 'utf8'}));
  const expectFileToMatchMock = async (virtualPath: string, realPath: string) =>
    expect(await virtualFileSystem.promises.readFile(virtualPath, {encoding: 'utf8'}))
      .toEqual(await fs.promises.readFile(join(migrationScriptMocksPath, realPath), {encoding: 'utf8'}));

  beforeEach(() => {
    virtualFileSystem = useVirtualFileSystem();

    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);
    architectHost = new TestingArchitectHost(resolve(__dirname, workspaceRoot), __dirname);
    architect = new Architect(architectHost, registry);
    architectHost.addBuilder('.:aggregate-migration-scripts', require('./index').default);
  });
  afterEach(() => {
    cleanVirtualFileSystem();
  });

  it('should aggregate the migration scripts', async () => {
    await virtualFileSystem.promises.mkdir('app-migration-scripts', {recursive: true});
    await copyMockFile('app-migration-scripts/migration-1.0.json', 'migration-1.0.json');
    await copyMockFile('app-migration-scripts/migration-1.5.json', 'migration-1.5.json');
    await copyMockFile('app-migration-scripts/migration-2.0.json', 'migration-2.0.json');

    await virtualFileSystem.promises.mkdir('node_modules/@o3r/my-lib/migration-scripts', {recursive: true});
    await virtualFileSystem.promises.writeFile('node_modules/@o3r/my-lib/package.json', '{}');
    await copyMockFile('node_modules/@o3r/my-lib/migration-scripts/migration-2.0.json', 'lib/migration-2.0.json');
    await copyMockFile('node_modules/@o3r/my-lib/migration-scripts/migration-2.5.json', 'lib/migration-2.5.json');
    await copyMockFile('node_modules/@o3r/my-lib/migration-scripts/migration-4.0.json', 'lib/migration-4.0.json');

    const options: AggregateMigrationScriptsSchema = {
      migrationDataPath: './app-migration-scripts/*.json',
      outputDirectory: './dist-migration-scripts',
      librariesDirectory: 'node_modules'
    };
    const run = await architect.scheduleBuilder('.:aggregate-migration-scripts', options);
    const output = await run.result;
    expect(output.error).toBeUndefined();
    expect(output.success).toBe(true);
    await run.stop();

    await expectFileToMatchMock('./dist-migration-scripts/migration-1.0.json', 'expected/migration-1.0.json');
    await expectFileToMatchMock('./dist-migration-scripts/migration-1.5.json', 'expected/migration-1.5.json');
    await expectFileToMatchMock('./dist-migration-scripts/migration-2.0.json', 'expected/migration-2.0.json');
  });

  it('should throw if library cannot be found', async () => {
    await virtualFileSystem.promises.mkdir('app-migration-scripts', {recursive: true});
    await copyMockFile('app-migration-scripts/migration-1.0.json', 'migration-1.0.json');
    await copyMockFile('app-migration-scripts/migration-2.0.json', 'migration-2.0.json');

    const options: AggregateMigrationScriptsSchema = {
      migrationDataPath: './app-migration-scripts/*.json',
      outputDirectory: './dist-migration-scripts',
      librariesDirectory: 'no_libraries_to_be_found_here'
    };
    const run = await architect.scheduleBuilder('.:aggregate-migration-scripts', options);
    const output = await run.result;
    expect(output.error).toBe(`Error: Library @o3r/my-lib not found at ${options.librariesDirectory}/@o3r/my-lib`);
    expect(output.success).toBe(false);
    await run.stop();
  });

  it('should do nothing if no migration-scripts are found', async () => {
    const options: AggregateMigrationScriptsSchema = {
      migrationDataPath: './no_migration_scripts_to_be_found_here/*.json',
      outputDirectory: './dist-migration-scripts',
      librariesDirectory: 'node_modules'
    };
    const run = await architect.scheduleBuilder('.:aggregate-migration-scripts', options);
    const output = await run.result;
    expect(output.error).toBeUndefined();
    expect(output.success).toBe(true);
    await run.stop();
  });
});
