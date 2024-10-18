import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Architect
} from '@angular-devkit/architect';
import {
  TestingArchitectHost
} from '@angular-devkit/architect/testing';
import {
  schema
} from '@angular-devkit/core';
import {
  cleanVirtualFileSystem,
  useVirtualFileSystem
} from '@o3r/test-helpers';
import {
  PatternReplacementBuilderSchema
} from './schema';

describe('Pattern replacement Builder', () => {
  const workspaceRoot = path.join('..', '..', '..', '..', '..');
  let architect: Architect;
  let architectHost: TestingArchitectHost;
  let virtualFileSystem: typeof fs;

  beforeEach(() => {
    virtualFileSystem = useVirtualFileSystem();

    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);
    architectHost = new TestingArchitectHost(path.resolve(__dirname, workspaceRoot), __dirname);
    architect = new Architect(architectHost, registry);
    architectHost.addBuilder('.:pattern-replacement', require('./index').default);
  });
  afterEach(() => {
    cleanVirtualFileSystem();
  });

  it('should replace pattern', async () => {
    const fakeFilePath = path.resolve(__dirname, workspaceRoot, 'not-a-real-file.txt');
    await virtualFileSystem.promises.mkdir(path.dirname(fakeFilePath), { recursive: true });
    await virtualFileSystem.promises.writeFile(fakeFilePath, 'Replace [stuff] here');
    const options: PatternReplacementBuilderSchema = {
      files: [fakeFilePath],
      searchValue: '\\[stuff\\]',
      replaceValue: 'things'
    };
    const run = await architect.scheduleBuilder('.:pattern-replacement', options);
    const output = await run.result;
    expect(output.error).toBeUndefined();
    await run.stop();

    const replacementOutput = await virtualFileSystem.promises.readFile(fakeFilePath, { encoding: 'utf8' });
    expect(replacementOutput).toBe('Replace things here');
  });
});
