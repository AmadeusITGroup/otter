import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Architect,
  createBuilder,
} from '@angular-devkit/architect';
import {
  TestingArchitectHost,
} from '@angular-devkit/architect/testing';
import {
  schema,
} from '@angular-devkit/core';
import {
  cleanVirtualFileSystem,
  useVirtualFileSystem,
} from '@o3r/test-helpers';
import {
  AppVersionBuilderSchema,
} from './schema';

describe('App version Builder', () => {
  const workspaceRoot = path.join('..', '..', '..', '..', '..');
  let architect: Architect;
  let architectHost: TestingArchitectHost;
  let virtualFileSystem: typeof fs;
  const patternReplacementBuilderSpy = jest.fn().mockReturnValue({ success: true });

  beforeEach(() => {
    virtualFileSystem = useVirtualFileSystem();

    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);
    architectHost = new TestingArchitectHost(path.resolve(__dirname, workspaceRoot), __dirname);
    architect = new Architect(architectHost, registry);
    architectHost.addBuilder('@o3r/core:pattern-replacement', createBuilder(patternReplacementBuilderSpy));
    architectHost.addBuilder('.:app-version', require('./index').default);
  });
  afterEach(() => {
    cleanVirtualFileSystem();
  });

  it('should extract version and call pattern replacement', async () => {
    const packageJsonPath = path.resolve(__dirname, workspaceRoot, 'package.json');
    const fakeFilePath = path.resolve(__dirname, workspaceRoot, 'app', 'package.json');
    await virtualFileSystem.promises.mkdir(path.dirname(packageJsonPath), { recursive: true });
    await virtualFileSystem.promises.writeFile(packageJsonPath, '{"version": "7.7.7"}');
    const options: AppVersionBuilderSchema = {
      file: fakeFilePath,
      versionToReplace: '0.0.0-placeholder'
    };
    const run = await architect.scheduleBuilder('.:app-version', options);
    const output = await run.result;
    expect(output.error).toBeUndefined();
    await run.stop();

    expect(patternReplacementBuilderSpy).toHaveBeenCalledWith(expect.objectContaining({
      files: [fakeFilePath],
      searchValue: '0.0.0-placeholder',
      replaceValue: '7.7.7'
    }), expect.any(Object));
  });
});
